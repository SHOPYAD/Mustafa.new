"use client";

import React, { useCallback, useRef, useState } from "react";
import { CheckCircle2, Send, ShieldAlert, XCircle } from "lucide-react";
import { MONO, UI } from "@/lib/studio/tokens";
import { openStudioWindow, useWindowStore } from "@/lib/studio/windows/window-store";
import { useAgentStore, phaseLabel } from "@/lib/studio/agent/agent-store";
import { CAPABILITY_BY_ID } from "@/lib/studio/capabilities/registry";
import { callCapability, newIdempotencyKey, type CapabilityResponse } from "@/lib/studio/capabilities/client";
import { CyberButton, Pill } from "../WindowChrome";

const TRACE_LABEL = { directive: "طلبك", stage: "يفكر", tool: "ينفذ", capability: "ينفذ", decision: "قرار", error: "تعذر", reply: "يرد" } as const;
const TRACE_TONE = { directive: UI.accent, stage: "#9ad7ff", tool: UI.warn, capability: UI.warn, decision: UI.ok, error: UI.danger, reply: "#ffd27a" } as const;
const RISK_TONE = { low: UI.ok, medium: UI.warn, high: UI.danger } as const;
const RISK_AR = { low: "منخفضة", medium: "متوسطة", high: "عالية" } as const;

function refreshTarget(capabilityId: string, input: Record<string, unknown>) {
  const collection = String(input.collection || CAPABILITY_BY_ID[capabilityId]?.target.collection || "");
  window.dispatchEvent(new CustomEvent("studio:refresh", { detail: { collection } }));
}

/** يطلب معاينة (dryRun) ثم يفتح نافذة المعاينة للاعتماد. */
export function usePreviewLauncher() {
  return useCallback(async (capabilityId: string, input: Record<string, unknown>, sourceKey: string) => {
    const cap = CAPABILITY_BY_ID[capabilityId];
    const agent = useAgentStore.getState();
    agent.execute(cap?.nodeId ?? null, `معاينة: ${cap?.titleAr ?? capabilityId}`);
    const res = await callCapability({ capabilityId, input, dryRun: true });
    agent.push({ kind: "capability", text: `${cap?.titleAr ?? capabilityId} · معاينة · ${res.ok ? res.preview?.summaryAr : res.error}`, nodeId: cap?.nodeId, ok: res.ok });
    if (res.ok && res.requiresApproval) agent.setPhase("awaiting_approval", cap?.titleAr ?? "");
    else if (!res.ok) agent.setPhase("error", res.error ?? "");
    openStudioWindow("preview", `preview:${sourceKey}:${capabilityId}`, `معاينة الإجراء · ${cap?.titleAr ?? capabilityId}`, { capabilityId, input, response: res }, { w: 560, h: 470 });
  }, []);
}

export function PreviewWindow({ winId, capabilityId, input, response }: { winId: string; capabilityId: string; input: Record<string, unknown>; response: CapabilityResponse }) {
  const cap = CAPABILITY_BY_ID[capabilityId];
  const [result, setResult] = useState<CapabilityResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const idem = useRef(newIdempotencyKey());
  const close = useWindowStore((s) => s.close);
  const p = response.preview;

  const run = async () => {
    setBusy(true);
    const agent = useAgentStore.getState();
    agent.execute(cap?.nodeId ?? null, cap?.titleAr ?? capabilityId);
    const res = await callCapability({ capabilityId, input, dryRun: false, idempotencyKey: idem.current, approvalRef: response.approvalRef });
    setResult(res);
    setBusy(false);
    agent.push({ kind: "capability", text: `${cap?.titleAr ?? capabilityId} · ${res.ok ? "نُفذ" : `فشل: ${res.error}`}${res.auditId ? ` · تدقيق ${res.auditId}` : ""}`, nodeId: cap?.nodeId, ok: res.ok });
    if (res.ok) {
      agent.reset();
      refreshTarget(capabilityId, input);
    } else agent.setPhase("error", res.error ?? "");
  };

  const cancel = () => {
    useAgentStore.getState().reset();
    close(winId);
  };

  if (!response.ok) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ color: UI.danger, display: "flex", gap: 8, alignItems: "center" }}><XCircle size={18} /> تعذرت المعاينة: {response.error}</div>
        <CyberButton onClick={cancel}>إغلاق</CyberButton>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 14 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <Pill tone={RISK_TONE[response.risk]}><ShieldAlert size={12} /> خطورة {RISK_AR[response.risk]}</Pill>
        <Pill tone={UI.textDim}><span style={{ fontFamily: MONO }}>{capabilityId}</span></Pill>
        {cap ? <Pill tone={UI.textDim}>المنفذ: {cap.evidence}</Pill> : null}
      </div>
      <div style={{ fontSize: 15.5, color: UI.text, fontWeight: 600 }}>{p?.summaryAr}</div>
      {p?.effects?.length ? (
        <ul style={{ margin: 0, paddingInlineStart: 18, color: UI.textDim }}>
          {p.effects.map((e) => <li key={e}>{e}</li>)}
        </ul>
      ) : null}
      {p?.before !== undefined || p?.after !== undefined ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Diff title="قبل" value={p?.before} tone={UI.textDim} />
          <Diff title="بعد" value={p?.after} tone={UI.warn} />
        </div>
      ) : null}
      {result ? (
        <div style={{ color: result.ok ? UI.ok : UI.danger, display: "flex", gap: 8, alignItems: "center" }}>
          {result.ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          {result.ok ? `تم التنفيذ${result.replayed ? " (مكرر، أُعيدت النتيجة السابقة)" : ""}${result.auditId ? ` · سجل التدقيق ${result.auditId}` : ""}` : `فشل التنفيذ: ${result.error}`}
        </div>
      ) : null}
      <div style={{ display: "flex", gap: 8 }}>
        {!result?.ok ? (
          <CyberButton tone={response.risk === "high" ? UI.danger : UI.accent} disabled={busy} onClick={run}>
            {busy ? "جارٍ التنفيذ…" : response.requiresApproval ? "اعتماد وتنفيذ" : "تنفيذ"}
          </CyberButton>
        ) : null}
        <CyberButton tone={UI.textDim} onClick={cancel}>{result?.ok ? "إغلاق" : "إلغاء"}</CyberButton>
      </div>
    </div>
  );
}

function Diff({ title, value, tone }: { title: string; value: unknown; tone: string }) {
  return (
    <div style={{ border: `1px solid ${UI.borderSoft}`, borderRadius: 8, padding: 8, minWidth: 0 }}>
      <div style={{ color: tone, fontSize: 12.5, marginBottom: 4 }}>{title}</div>
      <pre style={{ margin: 0, fontFamily: MONO, fontSize: 12, whiteSpace: "pre-wrap", wordBreak: "break-word", color: UI.text, maxHeight: 160, overflow: "auto" }}>{value === undefined ? "—" : JSON.stringify(value, null, 1)}</pre>
    </div>
  );
}

export function TraceWindow({ onAsk }: { onAsk?: (directive: string) => Promise<string> }) {
  const trace = useAgentStore((s) => s.trace);
  const phase = useAgentStore((s) => s.phase);
  const detail = useAgentStore((s) => s.detail);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const send = async () => {
    const d = text.trim();
    if (!d || !onAsk) return;
    setSending(true);
    setText("");
    try {
      await onAsk(d);
    } finally {
      setSending(false);
    }
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, height: "100%" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Pill tone={phase === "error" ? UI.danger : phase === "awaiting_approval" ? UI.warn : UI.accent}>{phaseLabel(phase, detail)}</Pill>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
        {trace.length === 0 ? <div style={{ color: UI.textDim, fontSize: 13.5 }}>لا خطوات بعد. أرسل مهمة للوكيل المشرف أو نفّذ إجراءً من أي نافذة.</div> : null}
        {trace.map((t) => (
          <div key={t.id} style={{ display: "flex", gap: 8, fontSize: 13.5, alignItems: "baseline" }}>
            <span style={{ color: UI.textFaint, fontFamily: MONO, fontSize: 11.5, whiteSpace: "nowrap" }}>{new Date(t.at).toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
            <span style={{ color: TRACE_TONE[t.kind], whiteSpace: "nowrap", fontSize: 12 }}>{TRACE_LABEL[t.kind]}</span>
            <span style={{ color: t.ok === false ? UI.danger : UI.text, lineHeight: 1.45 }}>{t.text}</span>
          </div>
        ))}
      </div>
      {onAsk ? (
        <div style={{ display: "flex", gap: 6 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="مهمة للوكيل المشرف…"
            style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: `1px solid ${UI.borderSoft}`, background: "rgba(2,10,18,0.8)", color: UI.text, fontSize: 14, outline: "none" }}
          />
          <CyberButton disabled={sending || !text.trim()} onClick={send}><Send size={14} /> إرسال</CyberButton>
        </div>
      ) : null}
    </div>
  );
}
