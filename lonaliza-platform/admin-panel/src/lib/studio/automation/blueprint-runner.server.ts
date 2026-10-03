import {
  AUTOMATION_TIMEZONE,
  type AutomationJob,
  type AutomationJobType,
} from "@/lib/automation/types";
import { executeAutomationJob } from "@/lib/server/automation/runner";
import { executeCapability } from "@/lib/studio/capabilities/executor.server";
import { CAPABILITY_BY_ID } from "@/lib/studio/capabilities/registry";
import { executeMcpSwarmCall } from "@/lib/swarm/mcp-swarm-gateway";
import type {
  BlueprintExecuteOptions,
  BlueprintExecuteResult,
  BlueprintGraphValidation,
  BlueprintLoop,
  BlueprintNode,
  BlueprintNodeStepResult,
  CredentialRequirement,
} from "./blueprint-types";
import { normalizeBlueprintNodeType, SECTOR_DEFAULT_JOB_TYPE } from "./blueprint-types";
import { requiredCredentialsForLoop, runCredentialsPreflight } from "./credentials-preflight.server";

export { requiredCredentialsForLoop, runCredentialsPreflight };

const SKILL_MCP_MAP: Record<string, string> = {
  meta_ads_graph_api_v19: "mcp_meta_ads_intelligence",
  google_ads_pmax_rest: "mcp_meta_ads_intelligence",
  media_aspect_adapter: "mcp_visual_get_schema",
  watermark_embedder: "mcp_visual_read_sections",
};

function nowMs(): number {
  return Date.now();
}

export function validateGraph(loop: BlueprintLoop): BlueprintGraphValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const nodeIds = new Set(loop.nodes.map((n) => n.id));

  if (loop.nodes.length === 0) errors.push("لا توجد عقد في التدفق.");

  for (const conn of loop.connections) {
    if (!nodeIds.has(conn.from)) errors.push(`اتصال ${conn.id}: العقدة المصدر ${conn.from} غير موجودة.`);
    if (!nodeIds.has(conn.to)) errors.push(`اتصال ${conn.id}: العقدة الهدف ${conn.to} غير موجودة.`);
    if (conn.from === conn.to) errors.push(`اتصال ${conn.id}: حلقة ذاتية على نفس العقدة.`);
  }

  const indegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const id of nodeIds) {
    indegree.set(id, 0);
    adj.set(id, []);
  }
  for (const conn of loop.connections) {
    adj.get(conn.from)?.push(conn.to);
    indegree.set(conn.to, (indegree.get(conn.to) || 0) + 1);
  }

  const queue: string[] = [];
  for (const [id, deg] of indegree) {
    if (deg === 0) queue.push(id);
  }

  let visited = 0;
  const order: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    visited += 1;
    for (const next of adj.get(id) || []) {
      const d = (indegree.get(next) || 0) - 1;
      indegree.set(next, d);
      if (d === 0) queue.push(next);
    }
  }

  if (loop.connections.length > 0 && visited !== loop.nodes.length) {
    errors.push("الرسم يحتوي دورة أو عقد غير مربوطة — التنفيذ يتطلب DAG.");
  }

  const triggers = loop.nodes.filter((n) => normalizeBlueprintNodeType(n.type) === "trigger");
  if (triggers.length === 0) warnings.push("لا توجد عقدة مشغّل (trigger) — سيتم الترتيب حسب الاتصالات أو ترتيب القائمة.");

  return { ok: errors.length === 0, errors, warnings };
}

export function topologicalOrder(loop: BlueprintLoop): BlueprintNode[] {
  const validation = validateGraph(loop);
  if (!validation.ok && loop.connections.length > 0) {
    return loop.nodes;
  }

  const byId = new Map(loop.nodes.map((n) => [n.id, n]));
  const indegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  for (const node of loop.nodes) {
    indegree.set(node.id, 0);
    adj.set(node.id, []);
  }
  for (const conn of loop.connections) {
    if (!byId.has(conn.from) || !byId.has(conn.to)) continue;
    adj.get(conn.from)?.push(conn.to);
    indegree.set(conn.to, (indegree.get(conn.to) || 0) + 1);
  }

  const queue = [...indegree.entries()].filter(([, d]) => d === 0).map(([id]) => id);
  queue.sort();
  const order: string[] = [];
  while (queue.length) {
    const id = queue.shift()!;
    order.push(id);
    for (const next of adj.get(id) || []) {
      const d = (indegree.get(next) || 0) - 1;
      indegree.set(next, d);
      if (d === 0) {
        queue.push(next);
        queue.sort();
      }
    }
  }

  if (order.length !== loop.nodes.length) return loop.nodes;
  return order.map((id) => byId.get(id)!);
}

function resolveJobType(loop: BlueprintLoop, node: BlueprintNode): AutomationJobType {
  const raw = node.parameters.jobType;
  if (typeof raw === "string" && raw.length > 3) {
    return raw as AutomationJobType;
  }
  return SECTOR_DEFAULT_JOB_TYPE[loop.sector];
}

function buildEphemeralJob(loop: BlueprintLoop, node: BlueprintNode, dryRun: boolean): AutomationJob {
  const ts = new Date().toISOString();
  return {
    id: `bp-${loop.id}-${node.id}-${Date.now().toString(36)}`,
    name: node.title.slice(0, 120),
    type: resolveJobType(loop, node),
    enabled: true,
    cron: "0 9 * * *",
    timezone: AUTOMATION_TIMEZONE,
    maxPerRun: Number(node.parameters.maxPerRun ?? 5),
    maxPerDay: Number(node.parameters.maxPerDay ?? 50),
    locales: ["ar"],
    dryRun,
    settings: {
      blueprintId: loop.id,
      blueprintNodeId: node.id,
      sector: loop.sector,
      parameters: node.parameters,
    },
    lastRunAt: null,
    lastError: null,
    lastResult: null,
    runCountToday: 0,
    runCountDate: ts.slice(0, 10),
    createdAt: ts,
    updatedAt: ts,
  };
}

function resolveMcpTool(node: BlueprintNode): string {
  const explicit = node.parameters.mcpTool;
  if (typeof explicit === "string" && explicit.startsWith("mcp_")) return explicit;
  const skill = node.skills?.[0];
  if (skill && SKILL_MCP_MAP[skill]) return SKILL_MCP_MAP[skill];
  if (skill && skill.startsWith("mcp_")) return skill;
  return "mcp_visual_get_schema";
}

function resolveCapabilityId(node: BlueprintNode): string {
  const explicit = node.parameters.capabilityId;
  if (typeof explicit === "string" && CAPABILITY_BY_ID[explicit]) return explicit;
  return "briefing.readiness";
}

async function executeActionNode(
  loop: BlueprintLoop,
  node: BlueprintNode,
  dryRun: boolean
): Promise<{ ok: boolean; message: string; details?: Record<string, unknown> }> {
  const job = buildEphemeralJob(loop, node, dryRun);
  const { result } = await executeAutomationJob(job, { dryRun, source: "manual" });
  return {
    ok: result.ok,
    message: result.message,
    details: { processed: result.processed, jobType: job.type, handler: "executeAutomationJob" },
  };
}

async function executeSkillNode(
  node: BlueprintNode,
  dryRun: boolean
): Promise<{ ok: boolean; message: string; details?: Record<string, unknown> }> {
  const tool = resolveMcpTool(node);
  if (dryRun) {
    return {
      ok: true,
      message: `Dry-run: MCP ${tool} — لم يُستدعَ على المنصة.`,
      details: { tool, dryRun: true },
    };
  }
  const res = await executeMcpSwarmCall(tool, { nodeId: node.id, parameters: node.parameters });
  return {
    ok: res.ok,
    message: res.summaryAr || res.error || (res.ok ? "اكتملت المهارة." : "فشلت المهارة."),
    details: { tool, data: res.data, error: res.error },
  };
}

async function executeRuleNode(
  node: BlueprintNode,
  dryRun: boolean
): Promise<{ ok: boolean; message: string; details?: Record<string, unknown> }> {
  const capabilityId = resolveCapabilityId(node);
  const result = await executeCapability({
    capabilityId,
    input: { ...node.parameters, nodeTitle: node.title },
    dryRun: dryRun || node.parameters.rejectOnFailure !== true,
    actor: "director",
  });
  const ok = result.ok && result.status < 400;
  return {
    ok,
    message: result.preview?.summaryAr || result.error || (ok ? "اجتازت العقدة فحص الحوكمة." : "رفضت الحوكمة التنفيذ."),
    details: { capabilityId, status: result.status, requiresApproval: result.requiresApproval },
  };
}

async function executeReviewNode(node: BlueprintNode): Promise<{ ok: boolean; message: string; halted: boolean }> {
  return {
    ok: false,
    halted: true,
    message: `توقف عند مراجعة «${node.title}»: مطلوب اعتماد بشري قبل إكمال التدflow (لا إكمال وهمي).`,
  };
}

async function executePassiveNode(
  node: BlueprintNode,
  dryRun: boolean
): Promise<{ ok: boolean; message: string }> {
  const kind = normalizeBlueprintNodeType(node.type);
  return {
    ok: true,
    message: `${kind === "trigger" ? "المشغّل" : kind === "rag" ? "الذاكرة" : "النموذج"} «${node.title}»: ${dryRun ? "تم التحقق (dry-run)" : "تم تمرير السياق"} — التوليد اللغوي يُدار عبر قدرات الاستودio عند الربط.`,
  };
}

export async function executeNode(
  loop: BlueprintLoop,
  node: BlueprintNode,
  options: { dryRun: boolean }
): Promise<BlueprintNodeStepResult> {
  const started = nowMs();
  const nodeType = normalizeBlueprintNodeType(node.type);
  const dryRun = options.dryRun;

  try {
    let payload: { ok: boolean; message: string; halted?: boolean; details?: Record<string, unknown> };

    switch (nodeType) {
      case "action":
        payload = await executeActionNode(loop, node, dryRun);
        break;
      case "skill":
        payload = await executeSkillNode(node, dryRun);
        break;
      case "rule":
        payload = await executeRuleNode(node, dryRun);
        break;
      case "review":
        payload = await executeReviewNode(node);
        break;
      default:
        payload = await executePassiveNode(node, dryRun);
        break;
    }

    return {
      nodeId: node.id,
      nodeType,
      title: node.title,
      ok: payload.ok,
      message: payload.message,
      dryRun,
      halted: payload.halted,
      durationMs: nowMs() - started,
      details: payload.details,
    };
  } catch (error) {
    return {
      nodeId: node.id,
      nodeType,
      title: node.title,
      ok: false,
      message: error instanceof Error ? error.message : "فشل تنفيذ العقدة.",
      dryRun,
      durationMs: nowMs() - started,
    };
  }
}

export async function executeBlueprint(options: BlueprintExecuteOptions): Promise<BlueprintExecuteResult> {
  const loop = options.loop;
  const dryRun = options.dryRun !== false;
  const validation = validateGraph(loop);

  if (!validation.ok) {
    return {
      ok: false,
      loopId: loop.id,
      dryRun,
      graphErrors: validation.errors,
      steps: [],
      message: validation.errors[0] || "الرسم غير صالح.",
      completedPct: 0,
    };
  }

  const preflight = await runCredentialsPreflight(loop);
  if (preflight.blocked) {
    return {
      ok: false,
      loopId: loop.id,
      dryRun,
      blockedCredentials: true,
      credentialGaps: preflight.gaps,
      steps: [],
      message: preflight.saySupervisorAr,
      completedPct: 0,
    };
  }

  let nodes = topologicalOrder(loop);
  if (options.nodeId) {
    const single = loop.nodes.find((n) => n.id === options.nodeId);
    nodes = single ? [single] : [];
    if (!single) {
      return {
        ok: false,
        loopId: loop.id,
        dryRun,
        steps: [],
        message: `العقدة ${options.nodeId} غير موجودة.`,
        completedPct: 0,
      };
    }
  } else if (options.resumeFromNodeId) {
    const idx = nodes.findIndex((n) => n.id === options.resumeFromNodeId);
    if (idx >= 0) {
      nodes = nodes.slice(idx);
    }
  }

  const steps: BlueprintNodeStepResult[] = [];
  let haltedNodeId: string | undefined;
  for (const node of nodes) {
    const step = await executeNode(loop, node, { dryRun });
    steps.push(step);
    if (step.halted) {
      haltedNodeId = node.id;
      break;
    }
    if (!step.ok) break;
  }

  const okCount = steps.filter((s) => s.ok).length;
  const completedPct = nodes.length ? Math.round((okCount / nodes.length) * 100) : 0;
  const allOk = steps.length === nodes.length && steps.every((s) => s.ok);

  const resumeToken = haltedNodeId
    ? Buffer.from(JSON.stringify({ loopId: loop.id, haltedNodeId, at: Date.now() })).toString("base64")
    : undefined;

  return {
    ok: allOk,
    loopId: loop.id,
    dryRun,
    steps,
    haltedNodeId,
    resumeToken,
    message: allOk
      ? dryRun
        ? `اكتمل فحص التدflow (dry-run) — ${completedPct}% من العقد ناجحة.`
        : `اكتمل التدflow — ${completedPct}% (جميع العقد ناجحة).`
      : steps[steps.length - 1]?.message || "توقف التدflow بسبب خطأ.",
    completedPct: allOk ? 100 : completedPct,
  };
}

export function requiredCredentials(nodes: BlueprintNode[], sector: BlueprintLoop["sector"]): CredentialRequirement[] {
  return requiredCredentialsForLoop({ id: "inline", name: "", sector, nodes, connections: [] });
}
