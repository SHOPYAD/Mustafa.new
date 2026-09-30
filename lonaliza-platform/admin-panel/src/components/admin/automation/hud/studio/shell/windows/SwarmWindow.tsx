"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Activity, CheckCircle2, Clock3, Send, XCircle } from "lucide-react";
import { useAgentStore, type LiveAgentTask } from "@/lib/studio/agent/agent-store";
import { MONO, UI } from "@/lib/studio/tokens";
import { CyberButton, Pill } from "../WindowChrome";

const STATUS: Record<LiveAgentTask["status"], { ar: string; tone: string }> = {
  queued: { ar: "بانتظار الدور", tone: UI.textDim },
  running: { ar: "يعمل", tone: UI.accent },
  done: { ar: "أنجز", tone: UI.ok },
  failed: { ar: "فشل", tone: UI.danger },
};

function elapsed(t: LiveAgentTask, now: number) {
  const end = t.endedAt ? new Date(t.endedAt).getTime() : now;
  const s = Math.max(0, Math.round((end - new Date(t.startedAt).getTime()) / 1000));
  return s < 60 ? `${s}ث` : `${Math.floor(s / 60)}د ${s % 60}ث`;
}

/** خلية الوكلاء الحية: من يعمل الآن، على أي مهمة، وما نتيجته. */
export function SwarmWindow({ onDelegate }: { onDelegate?: (directive: string) => Promise<string> }) {
  const agents = useAgentStore((s) => s.agents);
  const tasks = useAgentStore((s) => s.tasks);
  const [now, setNow] = useState(() => Date.now());
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const list = useMemo(() => Object.values(tasks).sort((a, b) => b.startedAt.localeCompare(a.startedAt)), [tasks]);
  const running = list.filter((t) => t.status === "running" || t.status === "queued");
  const byAgent = useMemo(() => {
    const m = new Map<string, LiveAgentTask[]>();
    for (const t of list) m.set(t.agentId, [...(m.get(t.agentId) ?? []), t]);
    return m;
  }, [list]);
  const doneCount = list.filter((t) => t.status === "done").length;
  const failCount = list.filter((t) => t.status === "failed").length;

  const send = async () => {
    const d = text.trim();
    if (!d || !onDelegate) return;
    setSending(true);
    setText("");
    try {
      await onDelegate(d);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {[
          { k: "يعمل الآن", v: running.length, tone: UI.accent, icon: <Activity size={16} /> },
          { k: "مهام أُنجزت", v: doneCount, tone: UI.ok, icon: <CheckCircle2 size={16} /> },
          { k: "مهام فشلت", v: failCount, tone: UI.danger, icon: <XCircle size={16} /> },
        ].map((c) => (
          <div key={c.k} style={{ border: `1px solid ${c.tone}55`, borderRadius: 10, padding: "8px 10px", background: `${c.tone}0d`, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: c.tone }}>{c.icon}</span>
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: c.tone, fontFamily: MONO }}>{c.v}</span>
              <span style={{ fontSize: 12, color: UI.textDim }}>{c.k}</span>
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
        {agents.map((a) => {
          const mine = byAgent.get(a.id) ?? [];
          const active = mine.find((t) => t.status === "running" || t.status === "queued");
          const last = active ?? mine[0];
          return (
            <div key={a.id} style={{ border: `1px solid ${active ? `${a.color}aa` : UI.borderSoft}`, borderRadius: 10, padding: 10, background: active ? `${a.color}12` : "rgba(2,10,18,0.5)", boxShadow: active ? `0 0 14px ${a.color}33` : "none", display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 5, background: a.color, boxShadow: active ? `0 0 10px ${a.color}` : "none", animation: active ? "cyberPulse 1.2s ease-in-out infinite" : "none" }} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.nameAr}</span>
                <Pill tone={active ? UI.accent : UI.textFaint}>{active ? STATUS[active.status].ar : "خامل"}</Pill>
              </div>
              {last ? (
                <>
                  <div style={{ fontSize: 13, color: UI.text, lineHeight: 1.4 }}>{last.directive}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: UI.textDim }}>
                    <Clock3 size={12} /> {elapsed(last, now)}
                    {last.capabilityId ? <span style={{ fontFamily: MONO }}>{last.capabilityId}</span> : null}
                  </div>
                  {active ? (
                    <div style={{ fontSize: 12.5, color: UI.accent }}>{last.steps[last.steps.length - 1]?.text ?? "…"}</div>
                  ) : last.result ? (
                    <div style={{ fontSize: 12.5, color: last.status === "failed" ? UI.danger : UI.ok, lineHeight: 1.4 }}>{last.result.slice(0, 220)}</div>
                  ) : null}
                </>
              ) : (
                <div style={{ fontSize: 12.5, color: UI.textFaint }}>{a.titleAr}</div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 13, color: UI.textDim }}>سجل المهام</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, minHeight: 60 }}>
        {list.length === 0 ? <div style={{ color: UI.textFaint, fontSize: 13 }}>لا مهام بعد. أرسل مهمة وسيوزعها المشرف على الوكلاء.</div> : null}
        {list.slice(0, 25).map((t) => (
          <div key={t.id} style={{ display: "flex", gap: 8, alignItems: "baseline", fontSize: 13 }}>
            <span style={{ color: STATUS[t.status].tone, whiteSpace: "nowrap" }}>{STATUS[t.status].ar}</span>
            <span style={{ color: UI.textDim, whiteSpace: "nowrap" }}>{t.agentNameAr}</span>
            <span style={{ flex: 1, color: UI.text }}>{t.directive}</span>
            <span style={{ color: UI.textFaint, fontFamily: MONO, fontSize: 11.5 }}>{elapsed(t, now)}</span>
          </div>
        ))}
      </div>

      {onDelegate ? (
        <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="مهمة للمشرف ليوزعها على الوكلاء…"
            style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: `1px solid ${UI.borderSoft}`, background: "rgba(2,10,18,0.8)", color: UI.text, fontSize: 14, outline: "none" }}
          />
          <CyberButton disabled={sending || !text.trim()} onClick={send}><Send size={14} /> تفويض</CyberButton>
        </div>
      ) : null}
      <style>{"@keyframes cyberPulse{0%,100%{opacity:1}50%{opacity:.35}}"}</style>
    </div>
  );
}
