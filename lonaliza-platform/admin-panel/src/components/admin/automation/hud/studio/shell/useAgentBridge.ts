"use client";

import { useEffect, useRef } from "react";
import { useAgentStore, type LiveAgentTask } from "@/lib/studio/agent/agent-store";

interface VoiceSignals {
  isListening: boolean;
  isUserSpeaking: boolean;
  isAgentSpeaking: boolean;
  isProcessing: boolean;
  audioFrequencies: number[];
}

/** يربط حالة الوكيل المرسومة بالصوت الفعلي وبأحداث خلية الوكلاء (SSE موثق بالجلسة). */
export interface BridgeHandlers {
  onProposal?: (capabilityId: string, input: Record<string, unknown>) => void;
  onUi?: (capabilityId: string, input: Record<string, unknown>) => void;
}

const TEXT_KEYS = ["contentAr", "summaryAr", "outcome", "message", "text", "titleAr", "executiveSummaryAr", "tacticalIntentAr", "error", "detail"];

/** نص مقروء من حدث الخلية. لا يُرجع أبدًا [object Object]. */
function asText(value: unknown, depth = 0): string {
  if (typeof value === "string") return value === "[object Object]" ? "" : value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (!value || typeof value !== "object" || depth > 1) return "";
  const row = value as Record<string, unknown>;
  for (const key of TEXT_KEYS) {
    const found = asText(row[key], depth + 1);
    if (found) return found;
  }
  if (typeof row.tool === "string") return [row.tool, asText(row.status, depth + 1)].filter(Boolean).join(" · ");
  return "";
}

function eventText(data: Record<string, unknown>): string {
  const who = typeof data.senderNameAr === "string" ? data.senderNameAr : "";
  const body = TEXT_KEYS.map((key) => asText(data[key])).find(Boolean) || asText(data.stage) || asText(data.article);
  return [who, body].filter(Boolean).join(": ").slice(0, 280);
}

export function useAgentBridge(sessionId: string | undefined, voice: VoiceSignals, handlers: BridgeHandlers = {}) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const { isListening, isUserSpeaking, isAgentSpeaking, isProcessing, audioFrequencies } = voice;

  useEffect(() => {
    useAgentStore.getState().setVoice({ listening: isListening, userSpeaking: isUserSpeaking, agentSpeaking: isAgentSpeaking, processing: isProcessing }, audioFrequencies);
  }, [isListening, isUserSpeaking, isAgentSpeaking, isProcessing, audioFrequencies]);

  useEffect(() => {
    if (!sessionId || typeof EventSource === "undefined") return;
    const es = new EventSource(`/api/admin/automation/agent-stream?sessionId=${encodeURIComponent(sessionId)}`);
    const store = useAgentStore.getState;
    const onMessage = (ev: MessageEvent) => {
      let e: { type?: string; data?: Record<string, unknown> };
      try {
        e = JSON.parse(ev.data);
      } catch {
        return;
      }
      const d = e.data ?? {};
      const nodeId = typeof d.nodeId === "string" ? d.nodeId : null;
      const text = eventText(d);
      switch (e.type) {
        case "stage": {
          if (d.source === "agent_task" && d.task) {
            store().upsertTask(d.task as LiveAgentTask);
            break;
          }
          if (d.source === "capability") {
            const input = (d.input as Record<string, unknown>) ?? {};
            if (d.stage === "plan" && nodeId) store().plan([nodeId], text.slice(0, 40));
            if (d.stage === "executing") store().execute(nodeId, String(d.capabilityId ?? ""));
            if (d.stage === "proposal") handlersRef.current.onProposal?.(String(d.capabilityId), input);
            if (d.stage === "ui") handlersRef.current.onUi?.(String(d.capabilityId), input);
            store().push({ kind: "capability", text: `${d.capabilityId} · ${d.stage}${text && text !== d.stage ? ` · ${text}` : ""}`, nodeId: nodeId ?? undefined });
            break;
          }
          const tool = typeof d.tool === "string" ? d.tool : null;
          if (tool && d.status === "active") store().execute(nodeId, tool);
          else if (store().phase === "idle" || store().phase === "thinking") store().setPhase("planning", text.slice(0, 40));
          store().push({ kind: tool ? "tool" : "stage", text: tool ? `${tool} · ${d.status ?? ""} · ${text}` : text, nodeId: nodeId ?? undefined, ok: d.status === "failed" ? false : undefined });
          break;
        }
        case "pulse":
        case "proposal":
        case "critique":
        case "consensus":
          if (store().phase !== "executing" && store().phase !== "awaiting_approval") store().setPhase(e.type === "pulse" ? "thinking" : "planning", text.slice(0, 40));
          if (e.type !== "pulse" && text) store().push({ kind: "stage", text });
          break;
        case "decision":
          if (d.source === "capability") {
            store().push({ kind: "decision", text, nodeId: nodeId ?? undefined, ok: d.ok !== false });
            if (d.ok === false) store().setPhase("error", text.slice(0, 50));
            else store().reset();
          } else {
            store().push({ kind: "decision", text: text || "قرار الخلية" });
            if (store().phase !== "speaking") store().setPhase("idle");
          }
          break;
        case "log": {
          if (!text) break;
          const logType = String(d.type ?? "");
          const kind = logType === "directive" ? "directive" : logType === "decision" ? "decision" : logType === "tool" ? "tool" : "stage";
          if (kind === "tool") store().execute(nodeId, asText(d.tool) || text.slice(0, 40));
          else if (logType === "proposal" || logType === "critique") store().setPhase("planning", text.slice(0, 40));
          else if (store().phase === "idle" || store().phase === "listening") store().setPhase("thinking", text.slice(0, 40));
          store().push({ kind, text: `${logType === "proposal" || logType === "critique" ? "يخطط: " : ""}${text}`, nodeId: nodeId ?? undefined });
          break;
        }
      }
    };
    es.onmessage = onMessage;
    const loadBoard = () =>
      fetch("/api/admin/studio/agents")
        .then((r) => r.json())
        .then((j) => j.ok && store().setBoard(j.agents, j.tasks))
        .catch(() => undefined);
    void loadBoard();
    const t = setInterval(loadBoard, 20_000);
    return () => {
      es.close();
      clearInterval(t);
    };
  }, [sessionId]);
}
