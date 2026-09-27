import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { executeSwarmTool } from "@/lib/swarm/agent-tools";
import { getRegisteredAgent } from "@/lib/swarm/agent-registry";
import { saveSwarmDiscussionMessage } from "@/lib/automation/agent-collab-store";
import { findSovereignSubModule } from "@/components/admin/automation/hud/brain/data/sovereignDomainGraph";
import { LEGACY_VERIFIED_READS } from "@/lib/neural-studio/read-capabilities";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const Input = z.object({
  directiveId: z.string().min(1).max(120),
  subModuleId: z.string().min(1).max(120),
  executionMode: z.enum(["live", "dry_run"]).default("dry_run"),
  payload: z.record(z.unknown()).optional(),
  // Compatibility fields are accepted but NEVER used to select an executor/identity.
  toolKey: z.string().optional(),
  actionType: z.string().optional(),
  assignedAgentId: z.string().optional(),
}).strict();
const response = (data: object, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) {
    return response({ ok: false, code: "ORIGIN_DENIED", summaryAr: "مصدر الطلب غير مسموح." }, 403);
  }
  let raw: unknown;
  try {
    const text = await req.text();
    if (new TextEncoder().encode(text).length > 32768)
      return response({ ok: false, code: "PAYLOAD_TOO_LARGE" }, 413);
    raw = JSON.parse(text);
  } catch {
    return response({ ok: false, code: "INVALID_JSON", summaryAr: "الطلب ليس JSON صالحاً." }, 400);
  }
  const parsed = Input.safeParse(raw);
  if (!parsed.success) return response({ ok: false, code: "INVALID_INPUT", summaryAr: "بيانات التكليف غير صالحة." }, 400);
  const input = parsed.data;
  const sub = findSovereignSubModule(input.subModuleId);
  const directive = sub?.executableDirectives.find(d => d.id === input.directiveId);
  if (!sub || !directive) return response({ ok: false, code: "UNKNOWN_DIRECTIVE", summaryAr: "الإجراء غير مسجل لهذا القسم." }, 404);
  const tool = LEGACY_VERIFIED_READS[directive.id];
  if (!tool || directive.toolKey !== tool) {
    return response({
      ok: false, code: "ADAPTER_NOT_IMPLEMENTED", executionMode: input.executionMode,
      summaryAr: "هذا الإجراء لا يملك محول تنفيذ موثقاً بعد. لم يُنفذ أي تغيير؛ قراءة إحصاءات القسم لا تنفذ هذا الإجراء.",
    }, 501);
  }
  const agent = getRegisteredAgent(sub.assignedAgent.id);
  if (!agent?.enabled || !agent.allowedTools.includes(tool))
    return response({ ok: false, code: "CAPABILITY_DENIED", summaryAr: "الوكيل غير مفعل أو لا يملك صلاحية هذه الأداة." }, 403);
  const executionId = randomUUID();
  const timestamp = new Date().toISOString();
  if (input.executionMode === "dry_run") {
    return response({
      ok: true, status: "validated", executionId, timestamp, executionMode: "dry_run",
      directiveId: directive.id, subModuleId: sub.id,
      summaryAr: "تم التحقق من تعريف الإجراء وصلاحية الوكيل فقط. لم تُستدع الأداة ولم يتم تأكيد اتصال المزود.",
    });
  }
  try {
    // Verified capabilities here are read-only and accept no user-controlled arguments.
    const result = await executeSwarmTool(tool, {});
    saveSwarmDiscussionMessage({
      id: executionId, fromAgent: agent.id, toAgent: "all", type: "decision",
      topic: "نتيجة قراءة موثقة من العقل الثاني",
      contentAr: result.ok ? result.summaryAr : "فشلت قراءة البيانات؛ لم يتم تأكيد التنفيذ.",
      timestamp, impactLevel: "low",
    });
    return response({
      ok: result.ok, status: result.ok ? "succeeded" : "failed",
      executionId, directiveId: directive.id, subModuleId: sub.id, executionMode: "live", timestamp,
      summaryAr: result.ok ? result.summaryAr : "تعذر إتمام القراءة من المصدر.",
      facts: result.ok ? result.facts : [],
    }, result.ok ? 200 : 502);
  } catch {
    return response({ ok: false, code: "EXECUTION_FAILED", executionId, timestamp,
      summaryAr: "تعذر إكمال القراءة أو تسجيل نتيجتها. لم يُثبت النجاح." }, 502);
  }
}
