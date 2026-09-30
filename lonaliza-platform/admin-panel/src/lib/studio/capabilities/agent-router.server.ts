import { swarmEventBus } from "@/lib/swarm/swarm-events";
import { CAPABILITY_BY_ID, effectiveRisk, needsApproval } from "./registry";
import { executeCapability } from "./executor.server";
import { generateUnifiedAiContent } from "@/lib/server/unified-ai-client";
import { CAPABILITIES } from "./registry";
import { collectionAliases, looksOperational, nodeAliases, planStudioCapability, type StudioPlan } from "./agent-plan";
import { plansFromIntent, resolveIntent } from "@/lib/studio/index/intent-router";
import { isArticleDirective } from "@/lib/swarm/article-pipeline-types";
import { normalizeStudioPlan } from "./normalize-plan";
import { matchWorkflow, type WorkflowDef, type WorkflowStep } from "@/lib/studio/graph/workflows";

export { planStudioCapability } from "./agent-plan";
export { matchWorkflow } from "@/lib/studio/graph/workflows";

/**
 * مخطط لغوي احتياطي: يختار قدرة واحدة من السجل فقط، والمدخلات تمر على zod.
 * لا يخترع قدرات ولا مجموعات؛ أي مخرج غير صالح يعني ترك المهمة للخلية.
 */
async function planWithModel(directive: string): Promise<StudioPlan | null> {
  if (!looksOperational(directive)) return null;
  const caps = CAPABILITIES.map((c) => `- ${c.id} (${c.kind}/${c.risk}): ${c.titleAr}; input keys: ${Object.keys((c.input as unknown as { shape: Record<string, unknown> }).shape ?? {}).join(",")}`).join("\n");
  const colls = [...new Map(collectionAliases().map((a) => [a.collection, a.alias])).entries()].map(([c, a]) => `${c}=${a}`).join("; ");
  const maps = nodeAliases().slice(0, 120).map((n) => `${n.mapId}=${n.label}`).join("; ");
  const res = await generateUnifiedAiContent<{ capabilityId: string | null; input?: Record<string, unknown>; why?: string }>({
    systemInstruction:
      "أنت موجّه قدرات لوحة إدارة. اختر قدرة واحدة من القائمة فقط تطابق طلب المدير حرفيًا، أو null إن لم تطابق. لا تخترع معرّفات سجلات: استخدم فقط المعرّفات المذكورة في الطلب. أعد JSON: {\"capabilityId\": string|null, \"input\": object, \"why\": string}.",
    prompt: `القدرات:\n${caps}\n\nالمجموعات: ${colls}\n\nالخرائط: ${maps}\n\nالطلب: ${directive}`,
    responseMimeType: "application/json",
    temperature: 0,
    maxTokens: 300,
    timeoutMs: 12000,
    agentRole: "studio_router",
  }).catch(() => null);
  const out = res?.ok ? res.data : null;
  if (!out?.capabilityId) return null;
  const cap = CAPABILITY_BY_ID[out.capabilityId];
  if (!cap) return null;
  const parsed = cap.input.safeParse(out.input ?? {});
  if (!parsed.success) return null;
  const input = parsed.data as Record<string, unknown>;
  for (const v of Object.values(input)) if (typeof v === "string" && /^[a-z0-9]{15}$/.test(v) && !directive.includes(v)) return null;
  return { capabilityId: cap.id, input, why: `مخطط لغوي: ${String(out.why ?? "").slice(0, 80)}` };
}

export async function planDirective(directive: string, ctx: { screenId?: string } = {}): Promise<StudioPlan | null> {
  if (matchWorkflow(directive)) return null;
  const screenId = ctx.screenId || "20";
  const local = planStudioCapability(directive);
  if (local) return normalizeStudioPlan(local);

  const intentPlans = plansFromIntent(directive, { screenId, last: null });
  if (intentPlans[0]) return normalizeStudioPlan(intentPlans[0]);

  const intent = resolveIntent(directive, { screenId, last: null });
  if (intent.kind === "readiness") {
    return { capabilityId: "briefing.readiness", input: {}, why: "تقرير جاهزية المنصة" };
  }

  const route = intent;
  if (route.kind !== "none" && route.kind !== "article" && route.kind !== "discuss") return null;
  if (route.kind === "article" && isArticleDirective(directive)) return planWithModel(directive);
  if (route.kind === "article") return null;
  return null;
}

function emit(sessionId: string, type: "stage" | "decision", data: Record<string, unknown>) {
  swarmEventBus.emitSwarmEvent({ sessionId, type, data: { source: "capability", ...data }, timestamp: new Date().toISOString() });
}

function clientUiCapability(id: string) {
  return id.startsWith("studio.") || id.startsWith("nexus.") || id.startsWith("loops.");
}

function clientUiSummary(capId: string, input: Record<string, unknown>) {
  if (capId === "studio.open_screen") return `الشاشة ${input.screenId}${input.hubId ? ` · ${input.hubId}` : ""}`;
  if (capId === "nexus.rotate") return `delta ${input.delta ?? 0}`;
  if (capId === "nexus.run_sector_command") return String(input.command ?? input.sectorId ?? input.stationId ?? "");
  if (capId === "loops.run") return String(input.loopId ?? input.blueprintId ?? "التدflow النشط");
  if (capId === "loops.run_node") return String(input.nodeId ?? "");
  return "";
}

/** ينفذ خطة الوكيل عبر نفس المنفذ. الأوامر عالية الخطورة لا تُنفذ أبدًا من الوكيل؛ تُرسل للمدير للاعتماد. */
export async function runStudioPlan(plan: StudioPlan, sessionId: string, autoExecute: boolean): Promise<string> {
  plan = normalizeStudioPlan(plan);
  const cap = CAPABILITY_BY_ID[plan.capabilityId];
  if (!cap) return `قدرة غير معروفة: ${plan.capabilityId}.`;
  emit(sessionId, "stage", { stage: "plan", capabilityId: cap.id, nodeId: cap.nodeId, summaryAr: `${cap.titleAr} (${plan.why})` });
  if (clientUiCapability(cap.id) && cap.kind === "query") {
    emit(sessionId, "stage", { stage: "ui", capabilityId: cap.id, nodeId: cap.nodeId, input: plan.input, summaryAr: cap.titleAr });
    const extra = clientUiSummary(cap.id, plan.input);
    return `${cap.titleAr}${extra ? `: ${extra}` : ""}.`;
  }
  if (cap.id.startsWith("loops.")) {
    const { getSessionLoopSnapshot } = await import("@/lib/studio/automation/loops-store.server");
    const snap = getSessionLoopSnapshot(sessionId);
    const loopInput =
      plan.input.loop || !snap
        ? plan.input
        : { ...plan.input, loop: snap, loopId: plan.input.loopId ?? snap.id };
    emit(sessionId, "stage", { stage: "ui", capabilityId: cap.id, nodeId: cap.nodeId, input: loopInput, summaryAr: cap.titleAr });
    const dryRun = loopInput.dryRun !== false && !autoExecute;
    const r = await executeCapability({ capabilityId: cap.id, input: { ...loopInput, dryRun }, dryRun: true, actor: "agent", sessionId, autoExecute });
    if (!r.ok) return `تعذر ${cap.titleAr}: ${r.error}.`;
    if (cap.kind === "command" && autoExecute && loopInput.dryRun === false) {
      const live = await executeCapability({
        capabilityId: cap.id,
        input: loopInput,
        dryRun: false,
        idempotencyKey: `agent_${sessionId}_${Date.now().toString(36)}`,
        actor: "agent",
        sessionId,
        autoExecute,
      });
      return live.ok ? `نفذت ${cap.titleAr}.` : `لم أنفذ ${cap.titleAr}: ${live.error}.`;
    }
    return r.preview?.summaryAr ? `${r.preview.summaryAr}.` : `${cap.titleAr}: جاهز للتشغيل على الواجهة.`;
  }
  if (cap.id.startsWith("studio.")) {
    emit(sessionId, "stage", { stage: "ui", capabilityId: cap.id, nodeId: cap.nodeId, input: plan.input, summaryAr: cap.titleAr });
    return `${cap.titleAr}: ${String(plan.input.collection ?? plan.input.mapId ?? plan.input.screenId ?? "")}${plan.input.q ? ` (بحث: ${plan.input.q})` : ""}.`;
  }
  if (cap.kind === "query") {
    const r = await executeCapability({ capabilityId: cap.id, input: plan.input, dryRun: true, actor: "agent", sessionId });
    emit(sessionId, "decision", { stage: "done", capabilityId: cap.id, nodeId: cap.nodeId, ok: r.ok, summaryAr: r.ok ? r.preview?.summaryAr : r.error });
    if (cap.id === "bookings.cancellation.list") emit(sessionId, "stage", { stage: "ui", capabilityId: "studio.open_route", nodeId: cap.nodeId, input: { route: "/api/admin/cancellations" } });
    return r.ok ? `${r.preview?.summaryAr}.` : `تعذرت القراءة: ${r.error}.`;
  }
  const risk = effectiveRisk(cap, plan.input);
  if (!needsApproval(risk, cap.kind, autoExecute)) {
    const r = await executeCapability({ capabilityId: cap.id, input: plan.input, dryRun: false, idempotencyKey: `agent_${sessionId}_${Date.now().toString(36)}`, autoExecute, actor: "agent", sessionId });
    return r.ok ? `نفذت: ${cap.titleAr}.` : `لم أنفذ ${cap.titleAr}: ${r.error}.`;
  }
  const preview = await executeCapability({ capabilityId: cap.id, input: plan.input, dryRun: true, actor: "agent", sessionId });
  if (!preview.ok) {
    emit(sessionId, "decision", { stage: "failed", capabilityId: cap.id, nodeId: cap.nodeId, ok: false, summaryAr: preview.error });
    return `لا يمكن تجهيز ${cap.titleAr}: ${preview.error}.`;
  }
  emit(sessionId, "stage", { stage: "proposal", capabilityId: cap.id, nodeId: cap.nodeId, input: plan.input, risk, summaryAr: preview.preview?.summaryAr });
  return `جهزت ${cap.titleAr}. ${preview.preview?.summaryAr}. بانتظار اعتمادك في نافذة المعاينة.`;
}

function mergeStepInput(step: WorkflowStep, previous: unknown): Record<string, unknown> {
  const base = { ...(step.input ?? {}) };
  if (step.inputFromPrevious && previous && typeof previous === "object") {
    const row = previous as Record<string, unknown>;
    if (step.inputFromPrevious in row) base[step.inputFromPrevious] = row[step.inputFromPrevious];
  }
  return base;
}

/** سير عمل حتمي متعدد الخطوات — يبث SSE لكل خطوة. */
export async function runWorkflow(workflow: WorkflowDef, sessionId: string, autoExecute: boolean): Promise<string> {
  emit(sessionId, "stage", { stage: "workflow", workflowId: workflow.id, summaryAr: workflow.labelAr });
  const lines: string[] = [];
  let previous: unknown;
  for (const step of workflow.steps) {
    const input = mergeStepInput(step, previous);
    const plan: StudioPlan = { capabilityId: step.capabilityId, input, why: workflow.labelAr };
    const line = await runStudioPlan(plan, sessionId, step.dryRun ? false : autoExecute);
    lines.push(line);
    if (step.capabilityId === "mcp.tool.invoke" || step.capabilityId.startsWith("records.") || step.capabilityId.endsWith(".read")) {
      const r = await executeCapability({ capabilityId: step.capabilityId, input, dryRun: true, actor: "agent", sessionId });
      previous = r.data ?? (r.preview as { data?: unknown } | undefined)?.data;
    }
  }
  return lines.join(" ");
}

/** مسار واحد: workflow ثم خطة حتمية/فهرس. */
export async function executeStudioDirective(directive: string, ctx: { screenId?: string }, sessionId: string, autoExecute: boolean): Promise<string | null> {
  const wf = matchWorkflow(directive);
  if (wf) return runWorkflow(wf, sessionId, autoExecute);
  const plan = await planDirective(directive, ctx);
  if (!plan) return null;
  return runStudioPlan(plan, sessionId, autoExecute);
}
