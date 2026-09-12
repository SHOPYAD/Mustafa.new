"use client";

/* Agent A: editor chrome only */

import {
  Files,
  Blocks,
  LayoutPanelTop,
  Brush,
  History,
  Sparkles,
  Settings2,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui";
import { cn } from "@/lib/builder/cn";
import { useBuilderStore, type BuilderPanel } from "@/lib/builder/editor-store";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type EditorLabelKey =
  | "pages"
  | "sections"
  | "layout"
  | "design"
  | "history"
  | "ai"
  | "inspector";

interface RailItem {
  panel: BuilderPanel;
  labelKey: EditorLabelKey;
  icon: React.ElementType;
  shortcut?: string;
  premium?: boolean;
}

const PRIMARY: RailItem[] = [
  { panel: "pages", labelKey: "pages", icon: Files, shortcut: "1" },
  { panel: "sections", labelKey: "sections", icon: Blocks, shortcut: "2" },
  { panel: "layout", labelKey: "layout", icon: LayoutPanelTop, shortcut: "3" },
  { panel: "design", labelKey: "design", icon: Brush, shortcut: "4" },
];

const SECONDARY: RailItem[] = [
  { panel: "history", labelKey: "history", icon: History, shortcut: "5" },
  { panel: "ai", labelKey: "ai", icon: Sparkles, shortcut: "6", premium: true },
  { panel: "settings", labelKey: "inspector", icon: Settings2, shortcut: "7" },
];

function RailButton({
  item,
  active,
  label,
  onClick,
}: {
  item: RailItem;
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  const Icon = item.icon;
  const agentBusy = useBuilderStore((s) => s.agentBusy);
  const showAgentPulse = item.panel === "ai" && agentBusy;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          aria-label={label}
          aria-pressed={active}
          className={cn(
            "group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
            !active && "text-white/70 hover:bg-white/10 hover:text-white hover:scale-110 active:scale-95",
            active &&
              !item.premium &&
              "bg-emerald-500 text-[#051741] shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_8px_20px_-4px_rgba(16,185,129,0.55)] scale-110",
            active &&
              item.premium &&
              "bg-emerald-500 text-[#051741] shadow-[0_10px_28px_-6px_rgba(16,185,129,0.6)] scale-110",
            !active && item.premium && "bg-white/[0.08] text-white hover:bg-white/15"
          )}
        >
          <Icon className={cn("h-[19px] w-[19px]", active && "scale-110 drop-shadow-sm")} strokeWidth={active ? 2.4 : 2.1} />
          {showAgentPulse && (
            <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-80" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white ring-2 ring-[#051741]" />
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <span className="flex items-center gap-2">
          {label}
          {item.shortcut ? (
            <kbd className="rounded bg-white/15 px-1.5 py-px text-[10px] font-semibold">{item.shortcut}</kbd>
          ) : null}
        </span>
      </TooltipContent>
    </Tooltip>
  );
}

export function LeftRail() {
  const { t } = useLocale();
  const activePanel = useBuilderStore((s) => s.activePanel);
  const setActivePanel = useBuilderStore((s) => s.setActivePanel);

  return (
    <nav
      className={cn(
        "ed-left-rail relative flex w-14 shrink-0 flex-col items-center gap-1.5 overflow-hidden border-r py-3",
        "shadow-[inset_-1px_0_0_rgba(255,255,255,0.06)]"
      )}
      aria-label={t.editor.panels}
    >
      <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-[#051741] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]">
        <span className="text-[15px] font-black tracking-tight">A</span>
      </div>
      <div aria-hidden="true" className="my-1 h-px w-7 bg-white/10" />
      <div className="flex flex-col items-center gap-1.5">
        {PRIMARY.map((item) => (
          <RailButton
            key={item.panel}
            item={item}
            label={t.editor[item.labelKey]}
            active={activePanel === item.panel}
            onClick={() => setActivePanel(item.panel)}
          />
        ))}
      </div>
      <div aria-hidden="true" className="my-2 h-px w-7 bg-white/10" />
      <div className="flex flex-col items-center gap-1.5">
        {SECONDARY.map((item) => (
          <RailButton
            key={item.panel}
            item={item}
            label={t.editor[item.labelKey]}
            active={activePanel === item.panel}
            onClick={() => setActivePanel(item.panel)}
          />
        ))}
      </div>
      <div className="mt-auto flex flex-col items-center gap-2">
        <div aria-hidden="true" className="h-px w-7 bg-white/10" />
        <span className="rotate-180 py-2 text-[9px] font-bold uppercase tracking-[0.22em] text-white/45 [writing-mode:vertical-rl]">
          Lonaliza
        </span>
      </div>
    </nav>
  );
}
