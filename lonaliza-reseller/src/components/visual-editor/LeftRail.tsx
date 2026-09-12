"use client";

import {
  Blocks,
  Brush,
  History,
  LayoutPanelTop,
  Settings2,
  Sparkles,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { useVisualEditor, type EditorPanel } from "./context";

const ITEMS: { panel: EditorPanel; icon: typeof Blocks; labelKey: "sections" | "layout" | "design" | "history" | "ai" | "inspector" }[] = [
  { panel: "sections", icon: Blocks, labelKey: "sections" },
  { panel: "layout", icon: LayoutPanelTop, labelKey: "layout" },
  { panel: "design", icon: Brush, labelKey: "design" },
  { panel: "history", icon: History, labelKey: "history" },
  { panel: "ai", icon: Sparkles, labelKey: "ai" },
  { panel: "inspector", icon: Settings2, labelKey: "inspector" },
];

export function LeftRail() {
  const { t } = useLocale();
  const { panel, setPanel } = useVisualEditor();
  const e = t.editor;

  return (
    <aside className="w-14 shrink-0 bg-[#03102c] border-e border-white/10 flex flex-col items-center py-3 gap-1">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const active = panel === item.panel;
        return (
          <button
            key={item.panel}
            type="button"
            onClick={() => setPanel(item.panel)}
            title={e[item.labelKey]}
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition",
              active
                ? "bg-emerald-500 text-[#051741] shadow-lg"
                : "text-white/55 hover:text-white hover:bg-white/10",
              item.panel === "ai" && !active && "text-emerald-300"
            )}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </aside>
  );
}
