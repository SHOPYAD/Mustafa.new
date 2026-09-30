import type PocketBase from "pocketbase";
import { DEFAULT_AGENTS } from "@/lib/automation/agent-collab-store";
import { createAdminPocketBase } from "@/lib/pocketbase/admin";
import { generateUnifiedAiContent } from "@/lib/server/unified-ai-client";
import { swarmEventBus } from "@/lib/swarm/swarm-events";
import { DOMAIN_SCREENS } from "@/lib/neural-studio/domain-systems";
import { CAPABILITY_BY_ID } from "@/lib/studio/capabilities/registry";
import { planStudioCapability, splitOperationalParts, type StudioPlan } from "@/lib/studio/capabilities/agent-plan";
import { planDirective, runStudioPlan } from "@/lib/studio/capabilities/agent-router.server";

export type AgentTaskStatus = "queued" | "running" | "done" | "failed";

export interface AgentTask {
  id: string;
  sessionId: string;
  agentId: string;
  agentNameAr: string;
  directive: string;
  status: AgentTaskStatus;
  startedAt: string;
  endedAt?: string;
  steps: { at: string; text: string }[];
  result?: string;
  nodeId?: string;
  capabilityId?: string;
  articlePipeline?: unknown;
}

export interface BoardAgent {
  id: string;
  nameAr: string;
  titleAr: string;
  color: string;
}

const HEX: Record<string, string> = { emerald: "#34d399", teal: "#2dd4bf", sky: "#38bdf8", amber: "#fbbf24", purple: "#c084fc", blue: "#60a5fa", indigo: "#818cf8", rose: "#fb7185", cyan: "#22d3ee", orange: "#fb923c", pink: "#f472b6", green: "#4ade80", violet: "#a78bfa", red: "#f87171", yellow: "#facc15", lime: "#a3e635", fuchsia: "#e879f9", slate: "#94a3b8" };

/** الوكلاء المتاحون للتفويض: وكلاء المنصة المسجلون + منفذ اللوحة (سجل القدرات). */
export function boardAgents(): BoardAgent[] {
  return [
    { id: "panel_operator", nameAr: "وكيل تشغيل اللوحة", titleAr: "ينفذ إجراءات الأقسام عبر سجل القدرات", color: "#4fe6ff" },
    ...DEFAULT_AGENTS.filter((a) => a.enabled !== false).map((a) => ({ id: a.id, nameAr: a.nameAr, titleAr: a.titleAr, color: HEX[a.color] ?? (a.color.startsWith("#") ? a.color : "#9a7bff") })),
  ];
}

const g = globalThis as unknown as { __studioBoard?: Map<string, AgentTask> };
const board = (g.__studioBoard ??= new Map<string, AgentTask>());
const COLLECTION = "studio_agent_tasks";
let collectionReady: Promise<void> | null = null;

function ensureCollection(pb: PocketBase) {
  collectionReady ??= (async () => {
    try {
      await pb.collections.getOne(COLLECTION);
    } catch {
      await pb.collections.create({
        name: COLLECTION,
        type: "base",
        fields: [
          { name: "task_id", type: "text", required: true },
          { name: "session_id", type: "text" },
          { name: "agent_id", type: "text" },
          { name: "directive", type: "text" },
          { name: "status", type: "text" },
          { name: "result", type: "text" },
          { name: "steps", type: "json", maxSize: 200000 },
          { name: "capability_id", type: "text" },
          { name: "started_at", type: "text" },
          { name: "ended_at", type: "text" },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
        ],
      });
    }
  })().catch((e) => {
    collectionReady = null;
    throw e;
  });
  return collectionReady;
}

async function persist(task: AgentTask) {
  try {
    const pb = await createAdminPocketBase();
    await ensureCollection(pb);
    await pb.collection(COLLECTION).create({
      task_id: task.id,
      session_id: task.sessionId,
      agent_id: task.agentId,
      directive: task.directive,
      status: task.status,
      result: (task.result ?? "").slice(0, 4000),
      steps: task.steps,
      capability_id: task.capabilityId ?? "",
      started_at: task.startedAt,
      ended_at: task.endedAt ?? "",
    });
  } catch {
    /* السجل الدائم اختياري؛ اللوحة الحية تعمل من الذاكرة */
  }
}

function emit(task: AgentTask, text?: string) {
  swarmEventBus.emitSwarmEvent({
    sessionId: task.sessionId,
    type: "stage",
    data: { source: "agent_task", task: { ...task, steps: task.steps.slice(-6) }, text: text ?? "" },
    timestamp: new Date().toISOString(),
  });
}

function step(task: AgentTask, text: string) {
  task.steps.push({ at: new Date().toISOString(), text });
  emit(task, text);
}

export function listTasks(limit = 40): AgentTask[] {
  return [...board.values()].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, limit);
}

/** عقدة الخريطة التي تُضاء: من الخطة، أو من قدرة القسم، أو من المجموعة المستهدفة. */
function nodeOf(plan: StudioPlan): string | undefined {
  if (typeof plan.input.nodeId === "string") return plan.input.nodeId;
  const declared = CAPABILITY_BY_ID[plan.capabilityId]?.nodeId;
  if (declared && declared !== "agent.supervisor") return declared;
  const collection = typeof plan.input.collection === "string" ? plan.input.collection : "";
  if (!collection) return undefined;
  for (const screen of DOMAIN_SCREENS) for (const hub of screen.hubs) if (hub.items.some((item) => item.collection === collection)) return hub.id;
  return undefined;
}

/** المشرف يقسم المهمة ويختار وكيلًا لكل جزء (من المسجلين فقط). */
async function splitDirective(directive: string): Promise<{ agentId: string; directive: string }[]> {
  const known = splitOperationalParts(directive);
  if (known) return known.map((part) => ({ agentId: "panel_operator", directive: part }));
  // أمر تفهمه القواعد يُنفَّذ بنصه. لا يُعاد صياغته بنموذج لغوي (كان يحوّل سؤال العدد إلى نشر مقال).
  if (planStudioCapability(directive)) return [{ agentId: "panel_operator", directive }];
  const agents = boardAgents();
  const res = await generateUnifiedAiContent<{ tasks?: { agentId: string; directive: string }[] }>({
    systemInstruction:
      "أنت الوكيل المشرف العام. قسّم طلب المدير إلى مهام مستقلة يمكن تنفيذها بالتوازي (1 إلى 4 مهام)، وأسند كل مهمة إلى وكيل من القائمة فقط. إجراءات لوحة الإدارة (فتح/عرض/تعديل/اعتماد/إعدادات) تُسند إلى panel_operator. لا تضف مهام لم يطلبها المدير. أعد JSON: {\"tasks\":[{\"agentId\":\"...\",\"directive\":\"...\"}]}.",
    prompt: `الوكلاء:\n${agents.map((a) => `- ${a.id}: ${a.nameAr} — ${a.titleAr}`).join("\n")}\n\nالطلب: ${directive}`,
    responseMimeType: "application/json",
    temperature: 0,
    maxTokens: 500,
    timeoutMs: 15000,
    agentRole: "supervisor_delegate",
  }).catch(() => null);
  const ids = new Set(agents.map((a) => a.id));
  const tasks = (res?.ok ? res.data?.tasks : null)?.filter((t) => t && ids.has(t.agentId) && typeof t.directive === "string" && t.directive.trim()).slice(0, 4);
  return tasks?.length ? tasks : [{ agentId: "panel_operator", directive }];
}

async function runTask(task: AgentTask, autoExecute: boolean) {
  task.status = "running";
  step(task, "بدأ العمل");
  try {
    const plan = await planDirective(task.directive);
    if (plan) {
      task.capabilityId = plan.capabilityId;
      task.nodeId = nodeOf(plan);
      step(task, `قدرة: ${plan.capabilityId}`);
      task.result = await runStudioPlan(plan, task.sessionId, autoExecute);
    } else {
      const { routeUtterance } = await import("@/lib/studio/commands/catalog");
      const { looksOperational } = await import("@/lib/studio/capabilities/agent-plan");
      const route = routeUtterance(task.directive, { screenId: "20", last: null });
      if (route.kind !== "article" && route.kind !== "discuss" && (route.kind !== "none" || looksOperational(task.directive))) {
        task.result = route.kind === "none" ? "لم أجد هذا القسم في فهرس اللوحة، ولم أستدعِ نموذجاً مدفوعاً." : "هذا الطلب إداري ويُنفَّذ من فهرس الشاشة لا من النموذج.";
        task.status = "done";
        task.endedAt = new Date().toISOString();
        step(task, "اكتمل");
        void persist(task);
        return;
      }
      step(task, "مداولة خلية الوكلاء");
      const { executeLangGraphDeliberation } = await import("@/lib/swarm/langgraph-engine");
      const state = await executeLangGraphDeliberation(task.directive, "studio_delegate", task.sessionId, autoExecute);
      task.articlePipeline = state.finalSynthesis?.actionPayload?.articlePipeline;
      task.result = state.toolHalt ? `${state.toolName}: ${state.toolHalt}` : state.finalSynthesis?.executiveSummaryAr || state.supervisorPlan?.tacticalIntentAr || "انتهت المداولة دون نتيجة نصية";
      if (state.toolHalt) throw new Error(task.result);
    }
    task.status = "done";
  } catch (e) {
    task.status = "failed";
    task.result = task.result || (e instanceof Error ? e.message : "فشل غير معروف");
  }
  task.endedAt = new Date().toISOString();
  step(task, task.status === "done" ? "اكتمل" : `فشل: ${task.result}`);
  void persist(task);
}

/** تفويض متوازٍ: يعيد المهام فورًا، وينتظر اكتمالها حتى timeoutMs لإرجاع ملخص. */
export async function delegate(directive: string, sessionId: string, autoExecute: boolean, timeoutMs = 120_000) {
  const parts = await splitDirective(directive);
  const agents = new Map(boardAgents().map((a) => [a.id, a]));
  const tasks: AgentTask[] = parts.map((p, i) => ({
    id: `task_${Date.now().toString(36)}_${i}`,
    sessionId,
    agentId: p.agentId,
    agentNameAr: agents.get(p.agentId)?.nameAr ?? p.agentId,
    directive: p.directive,
    status: "queued",
    startedAt: new Date().toISOString(),
    steps: [],
  }));
  for (const t of tasks) {
    board.set(t.id, t);
    emit(t, "أُسندت");
  }
  if (board.size > 200) for (const k of [...board.keys()].slice(0, board.size - 200)) board.delete(k);
  const all = Promise.allSettled(tasks.map((t) => runTask(t, autoExecute)));
  await Promise.race([all, new Promise((r) => setTimeout(r, timeoutMs))]);
  return tasks;
}
