import { create } from "zustand";

export type AgentPhase = "idle" | "listening" | "thinking" | "planning" | "executing" | "awaiting_approval" | "speaking" | "error";

export interface TraceEntry {
  id: string;
  at: string;
  kind: "directive" | "stage" | "tool" | "capability" | "decision" | "error" | "reply";
  text: string;
  nodeId?: string;
  ok?: boolean;
}

export interface LiveAgentTask {
  id: string;
  agentId: string;
  agentNameAr: string;
  directive: string;
  status: "queued" | "running" | "done" | "failed";
  startedAt: string;
  endedAt?: string;
  steps: { at: string; text: string }[];
  result?: string;
  nodeId?: string;
  capabilityId?: string;
}

export interface LiveAgent {
  id: string;
  nameAr: string;
  titleAr: string;
  color: string;
}

interface AgentStore {
  agents: LiveAgent[];
  tasks: Record<string, LiveAgentTask>;
  setBoard: (agents: LiveAgent[], tasks: LiveAgentTask[]) => void;
  upsertTask: (task: LiveAgentTask) => void;
  phase: AgentPhase;
  detail: string;
  /** العقد التي ضمن خطة الوكيل الحالية (تُضاء). */
  planNodeIds: string[];
  /** العقدة التي ينفذ عليها الآن. */
  activeNodeId: string | null;
  trace: TraceEntry[];
  /** ترددات الصوت الحالية (0..1). لا تُسبب إعادة رسم React؛ يقرأها الرسام كل إطار. */
  levels: number[];
  voice: { listening: boolean; userSpeaking: boolean; agentSpeaking: boolean; processing: boolean };
  talkTarget: { id: string; nameAr: string; color: string; voice: string } | null;
  lastSpeaker: string;
  coordinate: boolean;
  agentsVisible: boolean;
  chatLog: { id: string; sender: "user" | "assistant"; speakerName?: string; text: string; time: string }[];
  appendChat: (message: AgentStore["chatLog"][number]) => void;
  chatWindowOpen: boolean;
  setChatWindowOpen: (open: boolean) => void;
  useExternalAiEngine: boolean;
  setUseExternalAiEngine: (enabled: boolean) => void;
  setTalkTarget: (target: AgentStore["talkTarget"]) => void;
  setLastSpeaker: (name: string) => void;
  setCoordinate: (on: boolean) => void;
  setAgentsVisible: (on: boolean) => void;
  setSpeakingId: (id: string | null) => void;
  setVoice: (v: Partial<AgentStore["voice"]>, levels?: number[]) => void;
  setPhase: (phase: AgentPhase, detail?: string) => void;
  plan: (nodeIds: string[], detail?: string) => void;
  execute: (nodeId: string | null, detail: string) => void;
  push: (entry: Omit<TraceEntry, "id" | "at">) => void;
  reset: () => void;
}

const PHASE_AR: Record<AgentPhase, string> = {
  idle: "جاهز",
  listening: "يستمع",
  thinking: "يفكر",
  planning: "يخطط",
  executing: "ينفذ",
  awaiting_approval: "بانتظار اعتمادك",
  speaking: "يتحدث",
  error: "تعذر التنفيذ",
};

export function phaseLabel(phase: AgentPhase, detail: string) {
  return detail ? `${PHASE_AR[phase]}: ${detail}` : PHASE_AR[phase];
}

let seq = 0;

export const useAgentStore = create<AgentStore>((set, get) => ({
  agents: [],
  tasks: {},
  setBoard: (agents, tasks) => set((s) => ({ agents, tasks: { ...Object.fromEntries(tasks.map((t) => [t.id, t])), ...Object.fromEntries(Object.entries(s.tasks).filter(([, t]) => t.status === "running")) } })),
  upsertTask: (task) => set((s) => ({ tasks: { ...s.tasks, [task.id]: { ...s.tasks[task.id], ...task } } })),
  phase: "idle",
  detail: "",
  planNodeIds: [],
  activeNodeId: null,
  trace: [],
  levels: [],
  voice: { listening: false, userSpeaking: false, agentSpeaking: false, processing: false },
  talkTarget: null,
  lastSpeaker: "الوكيل المشرف",
  coordinate: false,
  agentsVisible: true,
  speakingId: null,
  chatLog: [],
  appendChat: (message) => set((s) => ({ chatLog: s.chatLog.some((row) => row.id === message.id || (row.text === message.text && row.sender === message.sender)) ? s.chatLog : [...s.chatLog, message].slice(-80) })),
  chatWindowOpen: false,
  setChatWindowOpen: (chatWindowOpen) => set({ chatWindowOpen }),
  useExternalAiEngine: true,
  setUseExternalAiEngine: (useExternalAiEngine) => set({ useExternalAiEngine }),
  setTalkTarget: (talkTarget) => set({ talkTarget, lastSpeaker: talkTarget?.nameAr || "الوكيل المشرف", coordinate: false }),
  setLastSpeaker: (lastSpeaker) => set({ lastSpeaker }),
  setCoordinate: (coordinate) => set({ coordinate, talkTarget: coordinate ? null : get().talkTarget }),
  setAgentsVisible: (agentsVisible) => set({ agentsVisible }),
  setSpeakingId: (speakingId) => set({ speakingId }),
  setVoice: (v, levels) => {
    const voice = { ...get().voice, ...v };
    const phase = get().phase;
    let next: AgentPhase = phase;
    if (voice.agentSpeaking) next = "speaking";
    else if (voice.userSpeaking) next = "listening";
    else if (voice.processing && (phase === "idle" || phase === "listening" || phase === "speaking")) next = "thinking";
    else if (!voice.processing && (phase === "speaking" || phase === "listening" || phase === "thinking")) next = voice.listening ? "listening" : "idle";
    if (levels) get().levels = levels;
    if (next !== phase || JSON.stringify(voice) !== JSON.stringify(get().voice)) set({ voice, phase: next, detail: next === phase ? get().detail : "" });
  },
  setPhase: (phase, detail = "") => set({ phase, detail }),
  plan: (planNodeIds, detail = "") => set({ planNodeIds, phase: "planning", detail }),
  execute: (activeNodeId, detail) => set({ activeNodeId, phase: "executing", detail }),
  push: (entry) =>
    set((s) => ({ trace: [{ ...entry, id: `t${++seq}`, at: new Date().toISOString() }, ...s.trace].slice(0, 80) })),
  reset: () => set({ phase: "idle", detail: "", planNodeIds: [], activeNodeId: null }),
}));
