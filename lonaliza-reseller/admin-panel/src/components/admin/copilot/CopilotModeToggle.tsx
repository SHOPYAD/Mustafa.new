"use client";

import { Bot, MessagesSquare } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { CopilotMode } from "./copilot-mode";

export function CopilotModeToggle({
  mode,
  onChange,
}: {
  mode: CopilotMode;
  onChange: (mode: CopilotMode) => void;
  variant?: "dark" | "light";
}) {
  const { t } = useLocale();
  return (
    <div className="admin-range text-[11px]" role="tablist" aria-label={t.editor.copilotModeChat}>
      <button
        type="button"
        data-active={mode === "chat"}
        onClick={() => onChange("chat")}
      >
        <MessagesSquare size={12} />
        {t.editor.copilotModeChat}
      </button>
      <button
        type="button"
        data-active={mode === "automation"}
        onClick={() => onChange("automation")}
      >
        <Bot size={12} />
        {t.editor.copilotModeAutomation}
      </button>
    </div>
  );
}
