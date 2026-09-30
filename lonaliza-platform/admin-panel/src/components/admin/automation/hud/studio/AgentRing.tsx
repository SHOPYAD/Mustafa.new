"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useAgentStore } from "@/lib/studio/agent/agent-store";
import { voiceForAgent } from "@/lib/studio/agents/voices";
import { AGENT_ROOM_SVG } from "./agent-room-art";

/** رسوم المرجع → وكلاء المنصة الحقيقيون. */
const LIVE_ID: Record<string, string> = {
  intelligence: "lead_scout",
  operations: "panel_operator",
  campaigns: "email",
  sales: "sales",
  social: "social",
  business: "b2b_landing",
  analytics: "ads",
  travel: "site_advisor",
};

const VISUAL_BY_LIVE = Object.fromEntries(Object.entries(LIVE_ID).map(([visual, live]) => [live, visual]));

const LABEL = { idle: "جاهز", listening: "يستمع", speaking: "يتحدث" } as const;

type Face = keyof typeof LABEL;

function paint(states: Record<string, Face>, hidden: boolean) {
  const parts = AGENT_ROOM_SVG.split('<svg class="robot"');
  const head = parts[0]
    .replace('<svg data-agent-room="true"', hidden ? '<svg class="agents-hidden" data-agent-room="true"' : '<svg data-agent-room="true"')
    .replace(/data-link="([^"]+)" data-state="idle"/g, (_, id: string) => `data-link="${id}" data-state="${states[id] || "idle"}"`);
  const bodies = parts.slice(1).map((part) => {
    const id = part.match(/data-agent-id="([^"]+)"/)?.[1] || "";
    const state = states[id] || "idle";
    const x = Number(part.match(/data-x="([^"]+)"/)?.[1] || 960);
    const y = Number(part.match(/data-y="([^"]+)"/)?.[1] || 500);
    const dx = Math.max(-3.5, Math.min(3.5, (960 - x) / 180));
    const dy = Math.max(-2, Math.min(2, (500 - y) / 170));
    let next = part.replace('data-state="idle"', `data-state="${state}"`).replace(">جاهز</text>", `>${LABEL[state]}</text>`);
    if (state !== "idle") {
      next = next.replace(/style="([^"]*)"/, `style="$1;--eye-x:${dx.toFixed(2)}px;--eye-y:${dy.toFixed(2)}px"`);
    }
    return `<svg class="robot"${next}`;
  });
  return head + bodies.join("");
}

export function AgentRing() {
  const host = useRef<HTMLDivElement>(null);
  const talkId = useAgentStore((s) => s.talkTarget?.id || null);
  const speakingId = useAgentStore((s) => s.speakingId);
  const agentSpeaking = useAgentStore((s) => s.voice.agentSpeaking);
  const userSpeaking = useAgentStore((s) => s.voice.userSpeaking);
  const open = useAgentStore((s) => s.agentsVisible);
  const levels = useAgentStore((s) => s.levels);

  const speaker = useMemo(() => {
    if (userSpeaking) return "user";
    if (speakingId && speakingId !== "supervisor" && VISUAL_BY_LIVE[speakingId]) return VISUAL_BY_LIVE[speakingId];
    if (agentSpeaking && talkId && VISUAL_BY_LIVE[talkId]) return VISUAL_BY_LIVE[talkId];
    if (agentSpeaking || speakingId === "supervisor") return "supervisor";
    return null;
  }, [userSpeaking, speakingId, agentSpeaking, talkId]);

  const markup = useMemo(() => {
    const states = Object.fromEntries(
      Object.keys(LIVE_ID).map((id) => {
        const face: Face = speaker === id ? "speaking" : speaker ? "listening" : "idle";
        return [id, face];
      }),
    ) as Record<string, Face>;
    return paint(states, !open);
  }, [speaker, open]);

  useEffect(() => {
    if (host.current) host.current.innerHTML = markup;
  }, [markup]);

  useEffect(() => {
    const node = host.current?.querySelector(`[data-agent-id="${speaker}"]`) as HTMLElement | null;
    if (!node || speaker === "user" || speaker === "supervisor" || !speaker) return;
    const level = levels.reduce((sum, value) => sum + value, 0) / (levels.length || 1);
    node.style.setProperty("--mouth-open", String(0.15 + Math.min(1, level) * 1.1));
  }, [levels, speaker, markup]);

  return (
    <div
      ref={host}
      className="absolute inset-0 z-20"
      style={{ pointerEvents: "none" }}
      onClick={(event) => {
        const node = (event.target as Element).closest?.("[data-agent-id]") as HTMLElement | null;
        if (!node) return;
        const visual = node.getAttribute("data-agent-id") || "";
        const liveId = LIVE_ID[visual];
        if (!liveId) return;
        const name = node.getAttribute("data-name") || liveId;
        const index = Object.keys(LIVE_ID).indexOf(visual);
        useAgentStore.getState().setTalkTarget({ id: liveId, nameAr: name, color: getComputedStyle(node).color, voice: voiceForAgent(liveId, index) });
        window.dispatchEvent(new Event("studio:open-chat"));
      }}
    />
  );
}
