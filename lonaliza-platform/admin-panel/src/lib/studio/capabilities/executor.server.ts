import { createHmac, createHash } from "crypto";
import type PocketBase from "pocketbase";
import { createAdminPocketBase } from "@/lib/pocketbase/admin";
import { ensureAdminSessionSecret, timingSafeEqualString } from "@/lib/server/admin-auth";
import { approveCancel, listPendingCancellations, rejectCancel, resolveChangeRequest } from "@/lib/server/hotel-cancellations";
import { moderateReviewAdmin } from "@/lib/server/customer-reviews-store";
import { swarmEventBus } from "@/lib/swarm/swarm-events";
import { getCollectionMeta, redactRecord, SECRET_FIELD, searchFilter } from "@/lib/studio/server/pb-meta";
import { executeMcpSwarmCall } from "@/lib/swarm/mcp-swarm-gateway";
import { MCP_TOOL_ALLOWLIST } from "./mcp-capabilities.generated";
import { CAPABILITY_BY_ID, effectiveRisk, isBlockedRoute, needsApproval, type Capability, type CapabilityRisk } from "./registry";
import { getServerEnv } from "@/lib/server/env-store";
import { executeBlueprint } from "@/lib/studio/automation/blueprint-runner.server";
import { resolveBlueprintLoop } from "@/lib/studio/automation/loops-store.server";
import type { BlueprintLoop } from "@/lib/studio/automation/blueprint-types";

/** يستدعي مسار إدارة حقيقيًا من داخل الخادم (نفس المنطق والتحقق الذي تستخدمه اللوحة العادية). */
async function callAdminRoute(route: string, method: string, body?: Record<string, unknown>) {
  if (isBlockedRoute(route)) throw new CapError(403, "route_blocked");
  const secret = (await getServerEnv("ADMIN_SETUP_SECRET")).trim();
  if (!secret) throw new CapError(503, "ADMIN_SETUP_SECRET_missing");
  const base = `http://127.0.0.1:${process.env.PORT || 3048}`;
  const res = await fetch(base + route, {
    method,
    headers: { "content-type": "application/json", "x-admin-setup-secret": secret },
    body: method === "GET" || method === "DELETE" ? undefined : JSON.stringify(body ?? {}),
    signal: AbortSignal.timeout(60_000),
  });
  const text = await res.text();
  let data: unknown = text;
  try {
    data = JSON.parse(text);
  } catch {
    data = text.slice(0, 4000);
  }
  return { status: res.status, ok: res.ok, data };
}

export interface ExecuteRequest {
  capabilityId: string;
  input: Record<string, unknown>;
  dryRun: boolean;
  idempotencyKey?: string;
  approvalRef?: string;
  autoExecute?: boolean;
  sessionId?: string;
  actor: "director" | "agent";
}

export interface ExecuteResult {
  ok: boolean;
  status: number;
  capabilityId: string;
  risk: CapabilityRisk;
  dryRun: boolean;
  requiresApproval: boolean;
  approvalRef?: string;
  preview?: { summaryAr: string; before?: unknown; after?: unknown; effects: string[] };
  data?: unknown;
  error?: string;
  auditId?: string;
  replayed?: boolean;
}

const AUDIT = "studio_audit_log";
const APPROVAL_TTL_MS = 15 * 60 * 1000;

function digest(capabilityId: string, input: Record<string, unknown>) {
  return createHash("sha256").update(capabilityId).update(JSON.stringify(input, Object.keys(input).sort())).digest("hex").slice(0, 32);
}

async function signApproval(capabilityId: string, input: Record<string, unknown>) {
  const secret = await ensureAdminSessionSecret();
  const ts = Date.now().toString(36);
  const d = digest(capabilityId, input);
  const mac = createHmac("sha256", secret).update(`${capabilityId}.${d}.${ts}`).digest("hex").slice(0, 40);
  return `${ts}.${mac}`;
}

async function verifyApproval(ref: string | undefined, capabilityId: string, input: Record<string, unknown>) {
  if (!ref) return false;
  const [ts, mac] = ref.split(".");
  if (!ts || !mac) return false;
  const issued = parseInt(ts, 36);
  if (!Number.isFinite(issued) || Date.now() - issued > APPROVAL_TTL_MS) return false;
  const secret = await ensureAdminSessionSecret();
  const expect = createHmac("sha256", secret).update(`${capabilityId}.${digest(capabilityId, input)}.${ts}`).digest("hex").slice(0, 40);
  return timingSafeEqualString(mac, expect);
}

let auditReady: Promise<void> | null = null;
function ensureAudit(pb: PocketBase) {
  if (!auditReady) {
    auditReady = (async () => {
      try {
        await pb.collections.getOne(AUDIT);
      } catch {
        await pb.collections.create({
          name: AUDIT,
          type: "base",
          fields: [
            { name: "capability", type: "text", required: true },
            { name: "actor", type: "text" },
            { name: "risk", type: "text" },
            { name: "dry_run", type: "bool" },
            { name: "ok", type: "bool" },
            { name: "idempotency_key", type: "text" },
            { name: "approval_ref", type: "text" },
            { name: "node_id", type: "text" },
            { name: "input", type: "json", maxSize: 200000 },
            { name: "result", type: "json", maxSize: 400000 },
            { name: "error", type: "text" },
            { name: "created", type: "autodate", onCreate: true, onUpdate: false },
            { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
          ],
          indexes: [`CREATE UNIQUE INDEX idx_studio_audit_idem ON ${AUDIT} (idempotency_key) WHERE idempotency_key != ''`],
        });
      }
    })().catch((e) => {
      auditReady = null;
      throw e;
    });
  }
  return auditReady;
}

function sanitizeInput(input: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(input, (k, v) => (k && SECRET_FIELD.test(k) ? "[redacted]" : v)));
}

function emit(sessionId: string | undefined, type: "stage" | "log" | "decision", data: Record<string, unknown>) {
  swarmEventBus.emitSwarmEvent({ sessionId: sessionId || "studio", type, data: { source: "capability", ...data }, timestamp: new Date().toISOString() });
}

function emitUi(sessionId: string | undefined, cap: Capability, input: Record<string, unknown>, summaryAr?: string) {
  emit(sessionId, "stage", { stage: "ui", capabilityId: cap.id, nodeId: cap.nodeId, input, summaryAr: summaryAr ?? cap.titleAr });
}

function uiPreview(cap: Capability, input: Record<string, unknown>, sessionId?: string) {
  emitUi(sessionId, cap, input);
  return { summaryAr: cap.titleAr, effects: ["ui"], data: input };
}

class CapError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function runLoopsBlueprint(
  cap: Capability,
  input: Record<string, unknown>,
  sessionId: string | undefined,
  dryRun: boolean,
  nodeId?: string
) {
  const loop = resolveBlueprintLoop(input, sessionId) as BlueprintLoop | null;
  if (!loop) throw new CapError(400, "loop_required");
  const result = await executeBlueprint({ loop, dryRun, nodeId, source: "agent" });
  if (result.blockedCredentials) {
    emit(sessionId, "log", {
      stage: "blocked_credentials",
      capabilityId: cap.id,
      nodeId: cap.nodeId,
      credentialGaps: result.credentialGaps,
      summaryAr: result.message,
    });
    throw new CapError(428, result.message || "blocked_credentials");
  }
  return result;
}

async function guardedRecord(pb: PocketBase, collection: string, id: string, expectedUpdated?: string) {
  const meta = await getCollectionMeta(collection);
  if (!meta) throw new CapError(404, "unknown_collection");
  const rec = (await pb.collection(collection).getOne(id)) as unknown as Record<string, unknown>;
  if (expectedUpdated && String(rec.updated) !== expectedUpdated) throw new CapError(409, "version_conflict");
  return { meta, rec };
}

function cleanPatch(metaFields: { name: string; type: string; values: string[] | null }[], patch: Record<string, unknown>) {
  const byName = new Map(metaFields.map((f) => [f.name, f]));
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(patch)) {
    const f = byName.get(k);
    if (!f || SECRET_FIELD.test(k) || ["id", "created", "updated"].includes(k)) throw new CapError(400, `field_not_editable:${k}`);
    if (f.type === "select" && f.values && v !== "" && ![v].flat().every((x) => f.values!.includes(String(x)))) throw new CapError(400, `invalid_value:${k}`);
    out[k] = v;
  }
  return out;
}

/** قراءة/محاكاة بلا أثر جانبي. */
async function preview(cap: Capability, input: Record<string, unknown>, pb: PocketBase, sessionId?: string): Promise<{ summaryAr: string; before?: unknown; after?: unknown; effects: string[]; data?: unknown }> {
  switch (cap.id) {
    case "records.list": {
      const meta = await getCollectionMeta(String(input.collection));
      if (!meta) throw new CapError(404, "unknown_collection");
      const f = searchFilter(meta, String(input.q || ""));
      const list = await pb.collection(meta.name).getList(Number(input.page || 1), 20, { sort: "-updated", filter: f || undefined });
      return { summaryAr: `${list.totalItems} سجل في ${meta.name}`, effects: [], data: { totalItems: list.totalItems, items: list.items.map((r) => redactRecord(meta, r as unknown as Record<string, unknown>)) } };
    }
    case "records.get": {
      const { meta, rec } = await guardedRecord(pb, String(input.collection), String(input.id));
      return { summaryAr: `سجل ${rec.id} من ${meta.name}`, effects: [], data: redactRecord(meta, rec) };
    }
    case "records.update": {
      const { meta, rec } = await guardedRecord(pb, String(input.collection), String(input.id), input.expectedUpdated as string | undefined);
      const patch = cleanPatch(meta.fields, input.patch as Record<string, unknown>);
      const before = Object.fromEntries(Object.keys(patch).map((k) => [k, rec[k]]));
      return { summaryAr: `تعديل ${Object.keys(patch).length} حقل في ${meta.name}/${rec.id}`, before, after: patch, effects: [`PATCH ${meta.name}/${rec.id}`] };
    }
    case "records.create": {
      const meta = await getCollectionMeta(String(input.collection));
      if (!meta) throw new CapError(404, "unknown_collection");
      const data = cleanPatch(meta.fields, input.data as Record<string, unknown>);
      const missing = meta.fields.filter((f) => f.required && data[f.name] == null && !["autodate"].includes(f.type)).map((f) => f.name);
      if (missing.length) throw new CapError(400, `required:${missing.join(",")}`);
      return { summaryAr: `إنشاء سجل جديد في ${meta.name}`, after: data, effects: [`CREATE ${meta.name}`] };
    }
    case "records.delete": {
      const { meta, rec } = await guardedRecord(pb, String(input.collection), String(input.id), input.expectedUpdated as string | undefined);
      return { summaryAr: `حذف نهائي للسجل ${rec.id} من ${meta.name}`, before: redactRecord(meta, rec), effects: [`DELETE ${meta.name}/${rec.id}`, "لا يمكن التراجع"] };
    }
    case "bookings.cancellation.list": {
      const rows = await listPendingCancellations();
      return { summaryAr: `${rows.length} طلب إلغاء/تعديل معلق`, effects: [], data: rows };
    }
    case "bookings.cancellation.approve": {
      const rec = (await pb.collection("hotel_bookings").getOne(String(input.bookingId))) as unknown as Record<string, unknown>;
      const total = Number(rec.total_amount ?? rec.amount ?? rec.total_price ?? NaN);
      const fee = Number(input.feeAmount || 0);
      return {
        summaryAr: `اعتماد إلغاء الحجز ${rec.id}${Number.isFinite(total) ? ` واسترداد ${Math.max(0, total - fee)} ${rec.currency ?? ""}` : ""}`,
        before: { status: rec.status, cancel_status: rec.cancel_status, payment_status: rec.payment_status },
        after: { status: "cancelled", cancel_fee_amount: fee },
        effects: ["تحديث hotel_bookings", "استرداد عبر iyzico إن كان الدفع بالبطاقة", "إلغاء لدى المزود", "إشعار العميل"],
      };
    }
    case "bookings.cancellation.reject":
    case "bookings.change.resolve": {
      const rec = (await pb.collection("hotel_bookings").getOne(String(input.bookingId))) as unknown as Record<string, unknown>;
      return { summaryAr: `${cap.titleAr} للحجز ${rec.id}`, before: { status: rec.status, cancel_status: rec.cancel_status, change_status: rec.change_status }, after: input, effects: ["تحديث hotel_bookings", "إشعار العميل"] };
    }
    case "bookings.enquiry.set_status": {
      const { rec } = await guardedRecord(pb, "enquiry_bookings", String(input.id), input.expectedUpdated as string | undefined);
      return { summaryAr: `تغيير حالة الطلب ${rec.id} من ${rec.status} إلى ${input.status}`, before: { status: rec.status }, after: { status: input.status }, effects: ["PATCH enquiry_bookings"] };
    }
    case "reviews.moderate":
      return { summaryAr: `${input.action === "approve" ? "نشر" : input.action === "hide" ? "إخفاء" : "حذف"} التقييم ${input.reviewId}`, after: input, effects: [input.action === "delete" ? "حذف نهائي" : "تحديث حالة التقييم"] };
    case "admin.route.call": {
      const route = String(input.route);
      const method = String(input.method || "GET");
      if (method === "GET") {
        const r = await callAdminRoute(route, "GET");
        return { summaryAr: `GET ${route} → ${r.status}`, effects: [], data: r.data };
      }
      const current = await callAdminRoute(route.split("?")[0], "GET").catch(() => null);
      return {
        summaryAr: `${method} ${route}`,
        before: current && current.ok ? current.data : undefined,
        after: input.body ?? {},
        effects: [`${method} ${route}`, "يُنفذ بنفس منطق اللوحة العادية"],
      };
    }
    case "studio.navigate":
    case "studio.open_table":
    case "studio.open_record":
      return { summaryAr: cap.titleAr, effects: [], data: input };
    case "studio.open_screen":
    case "nexus.rotate":
    case "nexus.run_sector_command":
      return uiPreview(cap, input, sessionId);
    case "loops.run": {
      const dryRun = input.dryRun !== false;
      const result = await runLoopsBlueprint(cap, input, sessionId, dryRun);
      if (sessionId) emitUi(sessionId, cap, input, result.message);
      return {
        summaryAr: result.message,
        effects: dryRun ? ["loops.execute.dry"] : ["loops.execute.live"],
        data: result,
      };
    }
    case "loops.run_node": {
      const dryRun = input.dryRun !== false;
      const nodeId = String(input.nodeId || "");
      const result = await runLoopsBlueprint(cap, input, sessionId, dryRun, nodeId);
      if (sessionId) emitUi(sessionId, cap, input, result.message);
      return {
        summaryAr: result.message,
        effects: ["loops.executeNode"],
        data: result,
      };
    }
    case "mcp.tool.invoke": {
      const toolName = String(input.toolName);
      if (!MCP_TOOL_ALLOWLIST.has(toolName)) throw new CapError(403, "mcp_tool_not_allowed");
      return { summaryAr: `معاينة ${toolName}`, effects: [`MCP ${toolName}`], data: { toolName, args: input.args } };
    }
    case "briefing.readiness":
    case "finance.overview.read":
    case "publish.posts.list":
    case "automation.jobs.list":
    case "flights.postops.read":
    case "reseller.wallets.read":
    case "legal.deletions.list": {
      const route = cap.target.route;
      if (!route) throw new CapError(501, "capability_not_implemented");
      const r = await callAdminRoute(route, "GET");
      return { summaryAr: `${cap.titleAr} (HTTP ${r.status})`, effects: [], data: r.data };
    }
    default:
      throw new CapError(501, "capability_not_implemented");
  }
}

async function apply(cap: Capability, input: Record<string, unknown>, pb: PocketBase, sessionId?: string): Promise<unknown> {
  switch (cap.id) {
    case "records.update": {
      const { meta } = await guardedRecord(pb, String(input.collection), String(input.id), input.expectedUpdated as string | undefined);
      const rec = await pb.collection(meta.name).update(String(input.id), cleanPatch(meta.fields, input.patch as Record<string, unknown>));
      return redactRecord(meta, rec as unknown as Record<string, unknown>);
    }
    case "records.create": {
      const meta = await getCollectionMeta(String(input.collection));
      if (!meta) throw new CapError(404, "unknown_collection");
      const rec = await pb.collection(meta.name).create(cleanPatch(meta.fields, input.data as Record<string, unknown>));
      return redactRecord(meta, rec as unknown as Record<string, unknown>);
    }
    case "records.delete": {
      const { meta } = await guardedRecord(pb, String(input.collection), String(input.id), input.expectedUpdated as string | undefined);
      await pb.collection(meta.name).delete(String(input.id));
      return { deleted: input.id };
    }
    case "bookings.cancellation.approve": {
      const r = await approveCancel({ bookingId: String(input.bookingId), feeAmount: Number(input.feeAmount || 0), note: String(input.note || "") });
      if (!r.ok) throw new CapError(400, r.error || "approve_failed");
      return r.booking;
    }
    case "bookings.cancellation.reject": {
      const r = await rejectCancel({ bookingId: String(input.bookingId), note: String(input.note || "") });
      if (!r.ok) throw new CapError(400, r.error || "reject_failed");
      return r.booking;
    }
    case "bookings.change.resolve": {
      const r = await resolveChangeRequest({ bookingId: String(input.bookingId), action: input.action as "done" | "reject", note: String(input.note || ""), newCheckIn: input.newCheckIn as string | undefined, newCheckOut: input.newCheckOut as string | undefined });
      if (!r.ok) throw new CapError(400, r.error || "change_failed");
      return r.booking;
    }
    case "bookings.enquiry.set_status": {
      await guardedRecord(pb, "enquiry_bookings", String(input.id), input.expectedUpdated as string | undefined);
      return pb.collection("enquiry_bookings").update(String(input.id), { status: input.status });
    }
    case "admin.route.call": {
      const r = await callAdminRoute(String(input.route), String(input.method || "POST"), input.body as Record<string, unknown> | undefined);
      if (!r.ok) throw new CapError(r.status, typeof r.data === "object" && r.data && "error" in (r.data as object) ? String((r.data as { error: unknown }).error) : `http_${r.status}`);
      return r.data;
    }
    case "reviews.moderate": {
      const r = (await moderateReviewAdmin(String(input.reviewId), input.action as "approve" | "hide" | "delete", input.adminNotes as string | undefined)) as { ok: boolean; error?: string };
      if (!r.ok) throw new CapError(400, r.error || "moderation_failed");
      return r;
    }
    case "studio.open_screen":
    case "nexus.rotate":
    case "nexus.run_sector_command":
      throw new CapError(501, "client_ui_only");
    case "loops.run": {
      const dryRun = input.dryRun !== false;
      return runLoopsBlueprint(cap, input, sessionId, dryRun);
    }
    case "loops.run_node": {
      const dryRun = input.dryRun !== false;
      return runLoopsBlueprint(cap, input, sessionId, dryRun, String(input.nodeId || ""));
    }
    case "mcp.tool.invoke": {
      const toolName = String(input.toolName);
      if (!MCP_TOOL_ALLOWLIST.has(toolName)) throw new CapError(403, "mcp_tool_not_allowed");
      const r = await executeMcpSwarmCall(toolName, (input.args as Record<string, unknown>) ?? {});
      if (!r.ok) throw new CapError(400, r.error || "mcp_failed");
      return r;
    }
    default:
      throw new CapError(501, "capability_not_implemented");
  }
}

export async function executeCapability(req: ExecuteRequest): Promise<ExecuteResult> {
  const cap = CAPABILITY_BY_ID[req.capabilityId];
  const base = { capabilityId: req.capabilityId, dryRun: req.dryRun };
  if (!cap) return { ...base, ok: false, status: 404, risk: "low", requiresApproval: false, error: "unknown_capability" };
  const parsed = cap.input.safeParse(req.input ?? {});
  if (!parsed.success) {
    return { ...base, ok: false, status: 400, risk: cap.risk, requiresApproval: false, error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("؛ ") };
  }
  const input = parsed.data as Record<string, unknown>;
  const risk = effectiveRisk(cap, input);
  const approvalNeeded = needsApproval(risk, cap.kind, !!req.autoExecute);
  const pb = await createAdminPocketBase();
  await ensureAudit(pb).catch(() => undefined);

  const audit = async (ok: boolean, result: unknown, error?: string) => {
    try {
      const row = await pb.collection(AUDIT).create({
        capability: cap.id,
        actor: req.actor,
        risk,
        dry_run: req.dryRun,
        ok,
        idempotency_key: req.dryRun ? "" : req.idempotencyKey || "",
        approval_ref: req.approvalRef ? req.approvalRef.slice(0, 12) : "",
        node_id: cap.nodeId,
        input: sanitizeInput(input),
        result: result === undefined ? null : JSON.parse(JSON.stringify(result ?? null)),
        error: error || "",
      });
      return row.id;
    } catch {
      return undefined;
    }
  };

  try {
    if (req.dryRun || cap.kind === "query" || (cap.id === "admin.route.call" && String(input.method || "GET") === "GET")) {
      const p = await preview(cap, input, pb, req.sessionId);
      const approvalRef = cap.kind === "command" ? await signApproval(cap.id, input) : undefined;
      if (cap.kind === "command") emit(req.sessionId, "stage", { stage: "preview", capabilityId: cap.id, nodeId: cap.nodeId, risk, summaryAr: p.summaryAr });
      return { ...base, ok: true, status: 200, risk, requiresApproval: approvalNeeded, approvalRef, preview: { summaryAr: p.summaryAr, before: p.before, after: p.after, effects: p.effects }, data: p.data };
    }

    if (!req.idempotencyKey || req.idempotencyKey.length < 8) return { ...base, ok: false, status: 400, risk, requiresApproval: approvalNeeded, error: "idempotency_key_required" };
    const prior = await pb
      .collection(AUDIT)
      .getFirstListItem(pb.filter("idempotency_key = {:k}", { k: req.idempotencyKey }))
      .catch(() => null);
    if (prior) return { ...base, ok: !!prior.ok, status: prior.ok ? 200 : 409, risk, requiresApproval: false, data: prior.result, auditId: prior.id, replayed: true, error: prior.ok ? undefined : String(prior.error || "previous_attempt_failed") };

    if (approvalNeeded) {
      if (req.actor === "agent") return { ...base, ok: false, status: 403, risk, requiresApproval: true, error: "approval_required_from_director" };
      if (!(await verifyApproval(req.approvalRef, cap.id, input))) return { ...base, ok: false, status: 403, risk, requiresApproval: true, error: "approval_invalid_or_expired" };
    }

    emit(req.sessionId, "stage", { stage: "executing", capabilityId: cap.id, nodeId: cap.nodeId, risk });
    const data = await apply(cap, input, pb, req.sessionId);
    const auditId = await audit(true, data);
    emit(req.sessionId, "decision", { stage: "done", capabilityId: cap.id, nodeId: cap.nodeId, ok: true, summaryAr: `${cap.titleAr}: تم` });
    return { ...base, ok: true, status: 200, risk, requiresApproval: false, data, auditId };
  } catch (e) {
    const status = e instanceof CapError ? e.status : (e as { status?: number }).status === 404 ? 404 : 500;
    const error = e instanceof Error ? e.message : "execution_failed";
    if (!req.dryRun && cap.kind === "command") {
      await audit(false, null, error);
      emit(req.sessionId, "decision", { stage: "failed", capabilityId: cap.id, nodeId: cap.nodeId, ok: false, summaryAr: `${cap.titleAr}: ${error}` });
    }
    return { ...base, ok: false, status, risk, requiresApproval: approvalNeeded, error };
  }
}
