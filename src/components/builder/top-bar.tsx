"use client";

/* Agent A: editor chrome only */

import { useCallback } from "react";
import Link from "next/link";
import {
  Undo2,
  Redo2,
  Save,
  Monitor,
  Tablet,
  Smartphone,
  ExternalLink,
  Loader2,
  Sparkles,
  ChevronRight,
  Home,
  ArrowRight,
  Moon,
  Sun,
} from "lucide-react";
import {
  Button,
  Separator,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui";
import { cn } from "@/lib/builder/cn";
import {
  useBuilderStore,
  useTemporalBuilder,
  type BuilderDevice,
} from "@/lib/builder/editor-store";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { findEditorPage } from "@/lib/builder-pages";

export function TopBar({
  onSave,
  onPublish,
  onOpenLive,
  onDiscard,
  chromeTheme,
  onToggleChromeTheme,
}: {
  onSave: () => Promise<void> | void;
  onPublish: () => Promise<void> | void;
  onOpenLive: () => void;
  onDiscard: () => void;
  chromeTheme: "light" | "dark";
  onToggleChromeTheme: () => void;
}) {
  const { t } = useLocale();
  const device = useBuilderStore((s) => s.device);
  const setDevice = useBuilderStore((s) => s.setDevice);
  const isSaving = useBuilderStore((s) => s.isSaving);
  const isPublishing = useBuilderStore((s) => s.isPublishing);
  const hasUnsavedChanges = useBuilderStore((s) => s.hasUnsavedChanges);
  const locale = useBuilderStore((s) => s.locale);
  const activePage = useBuilderStore((s) => s.activePage);
  const editorPages = useBuilderStore((s) => s.editorPages);
  const currentPage = findEditorPage(editorPages.pages, activePage);
  const currentPageLabel =
    currentPage == null
      ? t.editor.homepage
      : locale === "ar"
        ? currentPage.labelAr
        : locale === "tr"
          ? currentPage.labelTr
          : currentPage.labelEn;

  const { undo, redo, pastStates, futureStates } = useTemporalBuilder((temporal) => ({
    undo: temporal.undo,
    redo: temporal.redo,
    pastStates: temporal.pastStates,
    futureStates: temporal.futureStates,
  }));

  const handleDevice = useCallback(
    (next: BuilderDevice) => setDevice(next),
    [setDevice]
  );

  return (
    <header className="ed-topbar flex h-12 shrink-0 items-center gap-2 px-3 backdrop-blur-md">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold text-[hsl(var(--ed-text-muted))] hover:bg-[hsl(var(--ed-hover))] hover:text-[var(--ed-text-hex)]"
      >
        <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
        {t.editor.backToAdmin}
      </Link>

      <Separator orientation="vertical" />

      <div className="flex items-center gap-2">
        <div className="relative flex h-7 w-7 items-center justify-center rounded-md builder-gradient-brand shadow-sm shadow-emerald-500/30">
          <Sparkles className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex items-baseline gap-1 text-sm font-semibold tracking-tight">
          <span className="builder-gradient-text">Alrayyan</span>
          <span className="text-[var(--ed-text-hex)]">Builder</span>
        </div>
        <span className="builder-chip">v2</span>
      </div>

      <Separator orientation="vertical" />

      <nav aria-label={t.editor.currentPage} className="flex items-center gap-1 text-[12px] text-[hsl(var(--ed-text-muted))]">
        <Home className="h-3.5 w-3.5" />
        <ChevronRight className="h-3 w-3 opacity-60 rtl:rotate-180" />
        <span className="font-medium text-[var(--ed-text-hex)] truncate max-w-[160px]">{currentPageLabel}</span>
      </nav>

      <div className="flex-1" />

      <div className="inline-flex rounded-lg bg-[hsl(var(--ed-surface-2))] p-0.5 shadow-inner">
        {(
          [
            ["desktop", Monitor, t.editor.desktop],
            ["tablet", Tablet, t.editor.tablet],
            ["mobile", Smartphone, t.editor.mobile],
          ] as const
        ).map(([value, Icon, label]) => (
          <Tooltip key={value}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={label}
                aria-pressed={device === value}
                onClick={() => handleDevice(value)}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-md",
                  device === value
                    ? "bg-[var(--ed-surface-hex)] text-emerald-600 shadow-sm"
                    : "text-[hsl(var(--ed-text-muted))] hover:text-[var(--ed-text-hex)]"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2.25} />
              </button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      <Separator orientation="vertical" />

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            role="switch"
            aria-checked={chromeTheme === "dark"}
            data-editor-theme-toggle={chromeTheme}
            aria-label={
              chromeTheme === "dark" ? t.editor.themeLight : t.editor.themeDark
            }
            title={
              chromeTheme === "dark" ? t.editor.themeLight : t.editor.themeDark
            }
            onClick={onToggleChromeTheme}
            className="ed-theme-toggle"
          >
            <Sun className="h-3.5 w-3.5 text-amber-500" strokeWidth={2.4} />
            <Moon className="h-3.5 w-3.5 text-sky-300" strokeWidth={2.4} />
            <span className="ed-theme-toggle-thumb" aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {chromeTheme === "dark" ? t.editor.themeLight : t.editor.themeDark} · {t.editor.toggleEditorTheme}
        </TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="iconSm" onClick={() => undo()} disabled={!pastStates.length} aria-label={t.editor.undo}>
            <Undo2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t.editor.undo} · Ctrl+Z</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="iconSm" onClick={() => redo()} disabled={!futureStates.length} aria-label={t.editor.redo}>
            <Redo2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t.editor.redo} · Ctrl+Shift+Z</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={onOpenLive}>
            <ExternalLink className="h-4 w-4" />
            {t.editor.openLive}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t.editor.openLiveHint}</TooltipContent>
      </Tooltip>

      <Button variant="outline" size="sm" onClick={onDiscard} disabled={!hasUnsavedChanges || isSaving}>
        {t.editor.discard}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => void onSave()}
        disabled={isSaving || !hasUnsavedChanges}
        className={cn("min-w-[88px]", hasUnsavedChanges && !isSaving && "animate-pulse")}
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t.editor.saving}
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            {hasUnsavedChanges ? t.editor.saveDraft : t.editor.saved}
          </>
        )}
      </Button>

      <Button size="sm" onClick={() => void onPublish()} disabled={isPublishing} className="min-w-[88px] shadow-emerald-500/30">
        {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : t.editor.publish}
      </Button>
    </header>
  );
}
