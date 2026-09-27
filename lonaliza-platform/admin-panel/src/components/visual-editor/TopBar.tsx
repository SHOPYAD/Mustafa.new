"use client";

import {
  ExternalLink,
  Loader2,
  Monitor,
  Redo2,
  Save,
  Smartphone,
  Tablet,
  Undo2,
  Upload,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";
import { useVisualEditor, type EditorDevice } from "./context";

const DEVICES: { id: EditorDevice; icon: typeof Monitor }[] = [
  { id: "desktop", icon: Monitor },
  { id: "tablet", icon: Tablet },
  { id: "mobile", icon: Smartphone },
];

const LOCALES: Locale[] = ["ar", "en", "tr"];

type TopBarProps = {
  onSave: () => void;
  onPublish: () => void;
  onOpenLive: () => void;
};

export function TopBar({ onSave, onPublish, onOpenLive }: TopBarProps) {
  const { t } = useLocale();
  const e = t.editor;
  const {
    device,
    setDevice,
    locale,
    setLocale,
    dirty,
    saving,
    publishing,
    canUndo,
    canRedo,
    undo,
    redo,
  } = useVisualEditor();

  return (
    <header className="h-14 shrink-0 border-b border-purple-900/40 bg-[#180a2e] text-white flex items-center gap-3 px-3">
      <div className="min-w-0">
        <p className="text-sm font-bold truncate">{e.title}</p>
        <p className="text-[11px] text-white/45 truncate hidden sm:block">{e.subtitle}</p>
      </div>
      <div className="ms-auto flex items-center gap-1.5">
        {LOCALES.map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            className={cn(
              "px-2 py-1 rounded-md text-xs font-bold uppercase",
              locale === code ? "bg-amber-500 text-slate-950 shadow-xs" : "bg-white/10 text-white/70"
            )}
          >
            {code}
          </button>
        ))}
        <span className="w-px h-6 bg-white/10 mx-1" />
        {DEVICES.map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setDevice(id)}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              device === id ? "bg-purple-600 text-white shadow-xs" : "text-white/60 hover:text-white"
            )}
            title={e[id]}
          >
            <Icon size={16} />
          </button>
        ))}
        <span className="w-px h-6 bg-white/10 mx-1" />
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className="w-8 h-8 rounded-lg text-white/70 disabled:opacity-30"
          title={e.undo}
        >
          <Undo2 size={16} />
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          className="w-8 h-8 rounded-lg text-white/70 disabled:opacity-30"
          title={e.redo}
        >
          <Redo2 size={16} />
        </button>
        <button
          type="button"
          onClick={onOpenLive}
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 h-8 rounded-lg bg-white/10 text-xs"
        >
          <ExternalLink size={14} />
          {e.openLive}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white/10 text-xs font-bold"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {e.saveDraft}
          {dirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={publishing}
          className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-gradient-to-r from-purple-700 to-[#2e1065] hover:from-purple-600 hover:to-purple-900 text-amber-300 border border-amber-400/40 text-xs font-bold shadow-xs"
        >
          {publishing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {e.publish}
        </button>
      </div>
    </header>
  );
}
