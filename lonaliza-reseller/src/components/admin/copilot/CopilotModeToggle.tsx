"use client";

import { Bot, MessagesSquare } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { CopilotMode } from "./copilot-mode";

export function CopilotModeToggle({
  mode,
  onChange,
  variant = "dark",
}: {
  mode: CopilotMode;
  onChange: (mode: CopilotMode) => void;
  variant?: "dark" | "light";
}) {
  const { t } = useLocale();
  const dark = variant === "dark";
  const btn = (id: CopilotMode, label: string, Icon: typeof Bot) => {
    const active = mode === id;
    return (
      <button
        type="button"
        onClick={() => onChange(id)}
        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold ${
          active
            ? dark
              ? "bg-amber-400 text-slate-950"
              : "bg-violet-600 text-white"
            : dark
              ? "text-white/55 hover:text-white"
              : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <Icon size={12} />
        {label}
      </button>
    );
  };
  return (
    <div
      className={`inline-flex rounded-xl border p-0.5 ${
        dark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
      }`}
      role="tablist"
      aria-label={t.editor.copilotModeChat}
    >
      {btn("chat", t.editor.copilotModeChat, MessagesSquare)}
      {btn("automation", t.editor.copilotModeAutomation, Bot)}
    </div>
  );
}
