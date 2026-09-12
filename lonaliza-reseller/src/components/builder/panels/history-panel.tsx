"use client";

import { useMemo } from "react";
import {
  ArrowRight,
  Box as BoxIcon,
  Globe,
  History,
  Image as ImageIcon,
  Layers,
  Layout as LayoutIcon,
  Palette,
  Redo2,
  Settings2,
  Sparkles,
  Square,
  Trash2,
  Type as TypeIcon,
  Undo2,
  Wand2,
} from "lucide-react";
import { Button, ScrollArea } from "../ui";
import { useTemporalBuilder, useBuilderStore } from "@/lib/builder/editor-store";
import type { HomepageTemplateDraft } from "@/lib/visual-editor/schema";
import { cn } from "@/lib/builder/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface HistoryEntry {
  index: number;
  kind: "past" | "current" | "future";
  label: string;
  detail?: string;
  jumpUndo?: number;
  jumpRedo?: number;
  icon: React.ReactNode;
  prop?: string;
}

function iconForProp(prop: string): React.ReactNode {
  if (/color|background|fill|stroke/i.test(prop)) return <Palette className="h-3 w-3" />;
  if (/font|text|line|letter|word/i.test(prop)) return <TypeIcon className="h-3 w-3" />;
  if (/padding|margin|gap|width|height/i.test(prop)) return <BoxIcon className="h-3 w-3" />;
  if (/border|radius|outline/i.test(prop)) return <Square className="h-3 w-3" />;
  if (/shadow|filter|blur|opacity/i.test(prop)) return <Sparkles className="h-3 w-3" />;
  if (/display|flex|grid|align|justify|position|z-?index/i.test(prop)) return <LayoutIcon className="h-3 w-3" />;
  if (/src|backgroundImage|image/i.test(prop)) return <ImageIcon className="h-3 w-3" />;
  if (/animation|transition|transform/i.test(prop)) return <Wand2 className="h-3 w-3" />;
  return <Settings2 className="h-3 w-3" />;
}

function diffSnapshots(
  prev: { theme: HomepageTemplateDraft } | undefined,
  next: { theme: HomepageTemplateDraft }
): Omit<HistoryEntry, "index" | "kind" | "jumpUndo" | "jumpRedo"> | null {
  if (!prev) {
    return { label: "Initial state", icon: <History className="h-3 w-3" /> };
  }
  const a = prev.theme;
  const b = next.theme;

  if (JSON.stringify(a.global) !== JSON.stringify(b.global)) {
    const changed = Object.keys(b.global || {}).find(
      (k) => (a.global as Record<string, unknown>)[k] !== (b.global as Record<string, unknown>)[k]
    );
    return {
      label: "Updated theme tokens",
      detail: changed ? `globals.${changed}` : undefined,
      icon: <Globe className="h-3 w-3" />,
      prop: changed,
    };
  }

  const aOver = a.elementOverrides || {};
  const bOver = b.elementOverrides || {};
  const allKeys = new Set([...Object.keys(aOver), ...Object.keys(bOver)]);
  for (const elementId of allKeys) {
    const aBag = aOver[elementId] || {};
    const bBag = bOver[elementId] || {};
    if (JSON.stringify(aBag) !== JSON.stringify(bBag)) {
      const changedProp = Object.keys(bBag).find((k) => aBag[k] !== bBag[k]);
      const removedProp = Object.keys(aBag).find((k) => bBag[k] === undefined);
      const prop = changedProp || removedProp || "?";
      return {
        label: `${changedProp ? "Changed" : "Removed"} ${prop}`,
        detail: elementId,
        icon: iconForProp(prop),
        prop,
      };
    }
  }

  if (JSON.stringify(a.layout) !== JSON.stringify(b.layout)) {
    if (a.layout.length < b.layout.length) {
      const added = b.layout.find((it) => !a.layout.some((p) => p.instanceId === it.instanceId));
      return {
        label: `Added section ${added?.type || ""}`.trim(),
        detail: "layout",
        icon: <LayoutIcon className="h-3 w-3" />,
      };
    }
    if (a.layout.length > b.layout.length) {
      const removed = a.layout.find((it) => !b.layout.some((p) => p.instanceId === it.instanceId));
      return {
        label: `Removed section ${removed?.type || ""}`.trim(),
        detail: "layout",
        icon: <LayoutIcon className="h-3 w-3" />,
      };
    }
    const hiddenChanged = a.layout.find((it, i) => it.hidden !== b.layout[i]?.hidden);
    if (hiddenChanged) {
      return { label: "Toggled section visibility", detail: hiddenChanged.instanceId, icon: <Layers className="h-3 w-3" /> };
    }
    return { label: "Reordered sections", detail: "layout", icon: <LayoutIcon className="h-3 w-3" /> };
  }

  return { label: "Theme update", icon: <Settings2 className="h-3 w-3" /> };
}

export function HistoryPanel() {
  const { t } = useLocale();
  const { undo, redo, clear, pastStates, futureStates } = useTemporalBuilder((temporal) => ({
    undo: temporal.undo,
    redo: temporal.redo,
    clear: temporal.clear,
    pastStates: temporal.pastStates,
    futureStates: temporal.futureStates,
  }));
  const currentTheme = useBuilderStore((s) => s.theme);
  const past = pastStates.length;
  const future = futureStates.length;

  const entries = useMemo<HistoryEntry[]>(() => {
    const out: HistoryEntry[] = [];
    for (let i = 0; i < past; i++) {
      const prev = i > 0 ? pastStates[i - 1] : undefined;
      const cur = pastStates[i];
      const diff = diffSnapshots(prev, cur) || { label: "Step", icon: <Settings2 className="h-3 w-3" /> };
      out.push({ ...diff, index: i, kind: "past", jumpUndo: past - i });
    }
    const lastPast = past > 0 ? pastStates[past - 1] : undefined;
    const currentDiff = diffSnapshots(lastPast, { theme: currentTheme }) || {
      label: "Current",
      icon: <History className="h-3 w-3" />,
    };
    out.push({ ...currentDiff, index: past, kind: "current" });
    for (let i = 0; i < future; i++) {
      const prev = i === 0 ? { theme: currentTheme } : futureStates[i - 1];
      const cur = futureStates[i];
      const diff = diffSnapshots(prev, cur) || { label: "Step", icon: <Settings2 className="h-3 w-3" /> };
      out.push({ ...diff, index: past + 1 + i, kind: "future", jumpRedo: i + 1 });
    }
    return out;
  }, [pastStates, futureStates, currentTheme, past, future]);

  return (
    <div className="@container flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2 text-sm">
        <History className="h-4 w-4 shrink-0 text-primary" />
        <span className="truncate font-semibold">{t.editor.history}</span>
        <span className="builder-chip ml-auto hidden @[260px]:inline-flex">
          {entries.length} {t.editor.historyStates}
        </span>
      </div>
      <div className="flex items-center gap-1.5 border-b border-border px-2 py-2">
        <Button size="sm" variant="outline" onClick={() => undo()} disabled={past === 0} className="px-2">
          <Undo2 className="h-3.5 w-3.5" />
          <span className="ml-1 hidden @[230px]:inline">{t.editor.undo}</span>
        </Button>
        <Button size="sm" variant="outline" onClick={() => redo()} disabled={future === 0} className="px-2">
          <Redo2 className="h-3.5 w-3.5" />
          <span className="ml-1 hidden @[230px]:inline">{t.editor.redo}</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto px-2"
          onClick={() => clear()}
          disabled={past + future === 0}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="ml-1 hidden @[230px]:inline">{t.editor.clearHistory}</span>
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
            <History className="h-6 w-6 text-muted-foreground" />
            <div className="text-xs font-medium">{t.editor.historyEmpty}</div>
          </div>
        ) : (
          <ol className="relative px-3 py-3">
            <span aria-hidden="true" className="absolute bottom-3 left-[18px] top-3 w-px bg-border" />
            {entries.map((e) => {
              const isPast = e.kind === "past";
              const isCurrent = e.kind === "current";
              const isFuture = e.kind === "future";
              return (
                <li key={`${e.kind}-${e.index}`} className="relative py-1.5 pl-7 pr-1">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-[14px] top-3 flex h-2.5 w-2.5 items-center justify-center rounded-full border-2 border-card transition",
                      isPast && "bg-muted-foreground/60",
                      isCurrent && "scale-125 bg-primary ring-2 ring-primary/30",
                      isFuture && "border-dashed border-muted-foreground/40 bg-muted"
                    )}
                  />
                  <button
                    type="button"
                    disabled={isCurrent}
                    onClick={() => {
                      if (e.jumpUndo) undo(e.jumpUndo);
                      else if (e.jumpRedo) redo(e.jumpRedo);
                    }}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-md border px-2 py-1.5 text-left transition",
                      isPast && "border-border bg-card hover:border-primary/40 hover:bg-primary/5",
                      isCurrent && "cursor-default border-primary/30 bg-primary/10",
                      isFuture &&
                        "border-dashed border-border bg-muted/30 text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-background text-muted-foreground",
                        isCurrent && "bg-primary text-primary-foreground"
                      )}
                    >
                      {e.icon}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="flex items-center gap-1.5">
                        <span className={cn("truncate text-xs font-medium", isCurrent && "text-primary")}>
                          {e.label}
                        </span>
                        {isCurrent ? (
                          <span className="rounded bg-primary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary-foreground">
                            {t.editor.historyNow}
                          </span>
                        ) : null}
                      </span>
                      {e.detail ? (
                        <span className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">{e.detail}</span>
                      ) : null}
                    </span>
                    {!isCurrent ? (
                      <span className="hidden shrink-0 items-center gap-0.5 text-[10px] text-muted-foreground @[210px]:flex">
                        {isPast ? (
                          <>
                            <Undo2 className="h-3 w-3" />
                            <span>−{e.jumpUndo}</span>
                          </>
                        ) : (
                          <>
                            <ArrowRight className="h-3 w-3" />
                            <span>+{e.jumpRedo}</span>
                          </>
                        )}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </ScrollArea>
    </div>
  );
}
