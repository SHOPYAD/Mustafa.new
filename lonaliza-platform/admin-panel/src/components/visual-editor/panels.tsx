"use client";

import { useState, type ReactNode } from "react";
import { Eye, EyeOff, Plus, Send, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pickCopy, sectionLabel } from "@/lib/visual-editor/schema";
import type { TemplatePatch } from "@/lib/visual-editor/apply-patch";
import { catalogTypes, useVisualEditor } from "./context";

export function PanelHost() {
  const { panel } = useVisualEditor();
  switch (panel) {
    case "sections":
      return <SectionsPanel />;
    case "layout":
      return <LayoutPanel />;
    case "design":
      return <DesignPanel />;
    case "history":
      return <HistoryPanel />;
    case "ai":
      return <AiPanel />;
    case "inspector":
      return <InspectorPanel />;
    default: {
      const _never: never = panel;
      return _never;
    }
  }
}

function PanelChrome({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="w-72 shrink-0 bg-[#071a3a] border-e border-white/10 flex flex-col min-h-0">
      <div className="px-4 py-3 border-b border-white/10 text-white text-sm font-bold">{title}</div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">{children}</div>
    </div>
  );
}

function SectionsPanel() {
  const { t } = useLocale();
  const { addSection, selection } = useVisualEditor();
  return (
    <PanelChrome title={t.editor.sections}>
      {catalogTypes().map((type) => {
        const label = sectionLabel(type);
        return (
          <button
            key={type}
            type="button"
            onClick={() => addSection(type, selection?.instanceId)}
            className="w-full text-start rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2.5 text-white text-sm flex items-center gap-2"
          >
            <Plus size={14} className="text-amber-400" />
            {label.ar}
          </button>
        );
      })}
    </PanelChrome>
  );
}

function LayoutPanel() {
  const { t, locale } = useLocale();
  const { draft, moveSection, setHidden, removeSection, setSelection, selection } = useVisualEditor();
  return (
    <PanelChrome title={t.editor.layout}>
      {draft.layout.map((item, index) => {
        const label = sectionLabel(item.type);
        const active = selection?.instanceId === item.instanceId;
        return (
          <div
            key={item.instanceId}
            className={`rounded-xl border px-3 py-2 ${
              active ? "border-purple-400 bg-purple-500/20 text-amber-300" : "border-white/10 bg-white/5"
            }`}
          >
            <button
              type="button"
              className="w-full text-start text-white text-sm font-medium"
              onClick={() =>
                setSelection({
                  instanceId: item.instanceId,
                  sectionType: item.type,
                  labelAr: label.ar,
                  labelEn: label.en,
                  labelTr: label.tr,
                })
              }
            >
              {pickCopy(label, locale)}
            </button>
            <div className="mt-2 flex items-center gap-1">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => moveSection(item.instanceId, -1)}
                className="px-2 py-1 text-[11px] rounded bg-white/10 text-white/70 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={index === draft.layout.length - 1}
                onClick={() => moveSection(item.instanceId, 1)}
                className="px-2 py-1 text-[11px] rounded bg-white/10 text-white/70 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => setHidden(item.instanceId, !item.hidden)}
                className="px-2 py-1 text-[11px] rounded bg-white/10 text-white/70"
                title={item.hidden ? t.editor.show : t.editor.hide}
              >
                {item.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
              <button
                type="button"
                onClick={() => removeSection(item.instanceId)}
                className="ms-auto px-2 py-1 text-[11px] rounded bg-white/10 text-red-300"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        );
      })}
    </PanelChrome>
  );
}

function DesignPanel() {
  const { t } = useLocale();
  const { draft, setGlobal, selection, updateStyles } = useVisualEditor();
  const selected = draft.layout.find((item) => item.instanceId === selection?.instanceId);
  return (
    <PanelChrome title={t.editor.design}>
      <label className="block text-white/60 text-xs mb-1">{t.editor.navy}</label>
      <input
        type="color"
        value={draft.global.navy}
        onChange={(e) => setGlobal(e.target.value, undefined)}
        className="w-full h-10 rounded-lg bg-transparent"
      />
      <label className="block text-white/60 text-xs mb-1 mt-3">{t.editor.emerald}</label>
      <input
        type="color"
        value={draft.global.emerald}
        onChange={(e) => setGlobal(undefined, e.target.value)}
        className="w-full h-10 rounded-lg bg-transparent"
      />
      {selected && (
        <div className="mt-4 space-y-2">
          <p className="text-white/50 text-xs">{t.editor.sectionColors}</p>
          <input
            type="text"
            value={selected.styles.background}
            onChange={(e) => updateStyles(selected.instanceId, { background: e.target.value })}
            placeholder={t.editor.background}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white text-sm"
          />
          <input
            type="text"
            value={selected.styles.accent}
            onChange={(e) => updateStyles(selected.instanceId, { accent: e.target.value })}
            placeholder={t.editor.accent}
            className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white text-sm"
          />
        </div>
      )}
    </PanelChrome>
  );
}

function HistoryPanel() {
  const { t } = useLocale();
  const { canUndo, canRedo, undo, redo } = useVisualEditor();
  return (
    <PanelChrome title={t.editor.history}>
      <button
        type="button"
        disabled={!canUndo}
        onClick={undo}
        className="w-full rounded-xl bg-white/5 text-white text-sm py-2 disabled:opacity-30"
      >
        {t.editor.undo}
      </button>
      <button
        type="button"
        disabled={!canRedo}
        onClick={redo}
        className="w-full rounded-xl bg-white/5 text-white text-sm py-2 disabled:opacity-30"
      >
        {t.editor.redo}
      </button>
    </PanelChrome>
  );
}

function InspectorPanel() {
  const { t, locale } = useLocale();
  const { draft, selection, updateText, locale: canvasLocale } = useVisualEditor();
  const selected = draft.layout.find((item) => item.instanceId === selection?.instanceId);
  if (!selected) {
    return (
      <PanelChrome title={t.editor.inspector}>
        <p className="text-white/40 text-sm">{t.editor.selectHint}</p>
      </PanelChrome>
    );
  }
  const fields = Object.keys(selected.texts);
  return (
    <PanelChrome title={t.editor.inspector}>
      <p className="text-amber-400 text-xs mb-2">
        {pickCopy(sectionLabel(selected.type), locale)} · {canvasLocale.toUpperCase()}
      </p>
      {fields.map((field) => (
        <label key={field} className="block mb-3">
          <span className="text-white/50 text-[11px]">{field}</span>
          <textarea
            value={selected.texts[field]?.[canvasLocale] || ""}
            onChange={(e) => updateText(selected.instanceId, field, canvasLocale, e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white text-sm"
          />
        </label>
      ))}
    </PanelChrome>
  );
}

type ChatMsg = { role: "user" | "assistant"; content: string };

function AiPanel() {
  const { t } = useLocale();
  const { draft, selection, applyPatch, locale } = useVisualEditor();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/gemini/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          homepageContext: draft,
          templateDraft: draft,
          canvasLocale: locale,
          selectedSection: selection,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setMessages((m) => [...m, { role: "assistant", content: data.error || t.editor.aiError }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.reply || t.editor.aiDone }]);
        if (data.templatePatch && typeof data.templatePatch === "object") {
          applyPatch(data.templatePatch as TemplatePatch);
        }
      }
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: err instanceof Error ? err.message : t.editor.aiError },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[22rem] shrink-0 bg-[#180a2e] border-e border-purple-900/40 flex flex-col min-h-0">
      <div className="px-4 py-3 border-b border-purple-900/40 flex items-center gap-2 text-white text-sm font-bold">
        <Sparkles size={16} className="text-amber-400" />
        {t.editor.ai}
        <Link href="/admin/ai-settings" className="ms-auto text-[11px] text-amber-300 font-normal">
          Gemini
        </Link>
      </div>
      {selection && (
        <div className="px-3 pt-3 text-xs text-amber-300">
          {t.editor.tagged}: {selection.labelAr}
          {selection.field ? ` · ${selection.field}` : ""}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-white/40 text-xs leading-relaxed">{t.editor.aiHint}</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
              m.role === "user" ? "bg-purple-600/30 text-purple-100 border border-purple-500/30" : "bg-white/5 text-white/80"
            }`}
          >
            {m.content.replace(/```json[\s\S]*?```/g, `\n[${t.editor.patchApplied}]\n`)}
          </div>
        ))}
        {loading && <p className="text-white/40 text-xs">{t.editor.aiThinking}</p>}
      </div>
      <div className="p-3 border-t border-purple-900/40 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && void send()}
          placeholder={t.editor.aiPlaceholder}
          className="flex-1 rounded-lg bg-slate-950/70 border border-white/10 px-3 py-2 text-white text-sm"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={loading || !input.trim()}
          className="rounded-lg bg-gradient-to-r from-purple-700 to-[#2e1065] text-amber-300 border border-amber-400/40 px-3 disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
