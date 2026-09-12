"use client";

import { Component as ReactComponent, type ReactNode, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Clipboard,
  ClipboardCheck,
  Copy,
  MousePointerClick,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useBuilderStore } from "@/lib/builder/editor-store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Input,
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui";
import { useElementStyle } from "../inspector/use-element-style";
import { BLOCK_REGISTRY, ResponsiveHeader } from "../inspector/blocks";
import { getApplicableBlocks, sortBlocks } from "../inspector/block-applicability";
import { cn } from "@/lib/builder/cn";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { markInspectorInteraction } from "@/lib/builder/inspector-stay-open";
import type { Dictionary } from "@/lib/i18n/types";

type EditorCopy = Dictionary["editor"];

const BLOCK_TITLE_KEYS = {
  identity: "inspectorElement",
  cardDesign: "inspectorCardsButtons",
  content: "inspectorContent",
  inlineContent: "inspectorIconAndText",
  icon: "inspectorIcon",
  image: "inspectorImage",
  logos: "inspectorLogos",
  typography: "inspectorTypography",
  background: "inspectorBackground",
  box: "inspectorSpacing",
  border: "inspectorBorderRadius",
  effects: "inspectorEffects",
  layout: "inspectorLayout",
  position: "inspectorPosition",
  animation: "inspectorAnimation",
  advanced: "inspectorAdvanced",
} as const satisfies Record<string, keyof EditorCopy>;

function inspectorBlockTitle(t: EditorCopy, id: string, fallback: string): string {
  const key = BLOCK_TITLE_KEYS[id as keyof typeof BLOCK_TITLE_KEYS];
  return key ? String(t[key]) : fallback;
}

function inspectorTagLabel(t: EditorCopy, tagName?: string): string {
  const tag = (tagName || "").toLowerCase();
  switch (tag) {
    case "button":
      return t.inspectorTagButton;
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return t.inspectorTagHeading;
    case "img":
    case "image":
      return t.inspectorTagImage;
    case "a":
      return t.inspectorTagLink;
    case "input":
    case "textarea":
    case "select":
      return t.inspectorTagInput;
    case "label":
      return t.inspectorTagLabel;
    default:
      return tag || t.inspectorElementFallback;
  }
}

class BlockBoundary extends ReactComponent<
  { children: ReactNode; label: string; errorTitle: string; retryLabel: string; unknownError: string },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    if (typeof console !== "undefined") {
      console.error(`[Inspector] block "${this.props.label}" crashed`, error);
    }
  }
  reset = () => this.setState({ error: null });
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex flex-col gap-2 rounded border border-destructive/40 bg-destructive/5 p-2 text-[11px]">
        <div className="flex items-start gap-1.5 text-destructive">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <div className="font-semibold">{this.props.errorTitle}</div>
            <div className="mt-0.5 font-mono text-[10px] text-destructive/80">
              {this.state.error.message || this.props.unknownError}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={this.reset}
          className="self-start rounded border border-destructive/40 bg-background px-2 py-0.5 text-[10px] font-medium text-destructive transition hover:bg-destructive/10"
        >
          {this.props.retryLabel}
        </button>
      </div>
    );
  }
}

export function InspectorPanel() {
  const { t } = useLocale();
  const selectedElement = useBuilderStore((s) => s.selectedElement);
  const setSelectedElement = useBuilderStore((s) => s.setSelectedElement);
  const styleClipboard = useBuilderStore((s) => s.styleClipboard);
  const copyElementStyles = useBuilderStore((s) => s.copyElementStyles);
  const pasteElementStyles = useBuilderStore((s) => s.pasteElementStyles);
  const api = useElementStyle();

  const applicable = useMemo(() => getApplicableBlocks(selectedElement), [selectedElement]);
  const { primary } = useMemo(() => sortBlocks(BLOCK_REGISTRY, applicable), [applicable]);

  const [query, setQuery] = useState("");
  const normalisedQuery = query.trim().toLowerCase();
  const visible = useMemo(() => {
    if (!normalisedQuery) return primary;
    return primary.filter((b) => {
      const title = inspectorBlockTitle(t.editor, b.id, b.label).toLowerCase();
      return (
        title.includes(normalisedQuery) ||
        b.label.toLowerCase().includes(normalisedQuery) ||
        b.id.toLowerCase().includes(normalisedQuery)
      );
    });
  }, [primary, normalisedQuery, t.editor]);

  const defaultOpenIds = useMemo(
    () => primary.filter((b) => b.defaultOpen).map((b) => b.id),
    [primary]
  );
  const [openItems, setOpenItems] = useState<string[]>(defaultOpenIds);
  useEffect(() => {
    setOpenItems(defaultOpenIds);
  }, [defaultOpenIds, selectedElement?.id, selectedElement?.sectionInstanceId]);

  const effectiveOpen = normalisedQuery ? visible.map((b) => b.id) : openItems;
  const canPaste = Boolean(styleClipboard && selectedElement && Object.keys(styleClipboard.overrides).length > 0);
  const isClipboardSelf = Boolean(
    styleClipboard && selectedElement && styleClipboard.sourceId === selectedElement.id
  );

  if (!selectedElement) {
    return (
      <div
        data-editor-inspector=""
        className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center"
        onPointerDownCapture={() => markInspectorInteraction()}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MousePointerClick className="h-5 w-5" />
        </div>
        <div className="text-sm font-semibold text-foreground">{t.editor.nothingSelected}</div>
        <div className="max-w-[220px] text-xs text-muted-foreground">{t.editor.selectHint}</div>
      </div>
    );
  }

  const { id, tagName, label, sectionType } = selectedElement;
  const elementLabel = label || inspectorTagLabel(t.editor, tagName);

  return (
    <div
      data-editor-inspector=""
      className="flex h-full min-h-0 flex-col overflow-hidden"
      onPointerDownCapture={() => markInspectorInteraction()}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <ScrollArea className="min-h-0 flex-1">
        <div className="border-b border-border bg-card px-3 py-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">{elementLabel}</div>
              <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground">
                <span className="font-mono">{id}</span>
                {sectionType ? <span className="builder-chip">{sectionType}</span> : null}
                {api.hasAnyOverride ? (
                  <span className="builder-chip bg-primary/10 text-primary">{t.editor.inspectorCustomized}</span>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      copyElementStyles();
                      toast.success(t.editor.inspectorCopiedFrom.replace("{label}", elementLabel), { duration: 1800 });
                    }}
                    disabled={!api.hasAnyOverride}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition",
                      "hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
                      "disabled:cursor-not-allowed disabled:opacity-40"
                    )}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{t.editor.inspectorCopyOverrides}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      pasteElementStyles();
                      toast.success(t.editor.inspectorPasted, { duration: 1800 });
                    }}
                    disabled={!canPaste || isClipboardSelf}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition",
                      "hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
                      "disabled:cursor-not-allowed disabled:opacity-40",
                      canPaste && !isClipboardSelf && "border-primary/30 text-primary"
                    )}
                  >
                    {canPaste && !isClipboardSelf ? (
                      <ClipboardCheck className="h-3.5 w-3.5" />
                    ) : (
                      <Clipboard className="h-3.5 w-3.5" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {isClipboardSelf
                    ? t.editor.inspectorClipboardSelf
                    : canPaste
                      ? t.editor.inspectorPasteStyles
                      : t.editor.inspectorClipboardEmpty}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => api.clearAll()}
                    disabled={!api.hasAnyOverride}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition",
                      "hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive",
                      "disabled:cursor-not-allowed disabled:opacity-40"
                    )}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{t.editor.inspectorResetAll}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setSelectedElement(null)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{t.editor.inspectorDeselect}</TooltipContent>
              </Tooltip>
            </div>
          </div>
          {primary.length > 4 ? (
            <div className="relative mt-2">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.editor.searchSettings}
                className="h-7 pl-7 pr-7 text-xs"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label={t.editor.inspectorClearSearch}
                  className="absolute right-1.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
        <ResponsiveHeader api={api} />
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-1 px-3 py-8 text-center">
            <Search className="h-5 w-5 text-muted-foreground" />
            <div className="text-xs font-medium">{t.editor.inspectorNoMatch}</div>
          </div>
        ) : (
          <Accordion
            type="multiple"
            value={effectiveOpen}
            onValueChange={(v) => setOpenItems(v)}
            className="px-2"
          >
            {visible.map(({ id: blockId, label: blockLabel, icon, Component }) => {
              const title = inspectorBlockTitle(t.editor, blockId, blockLabel);
              return (
              <AccordionItem key={blockId} value={blockId} className="border-b border-border/60 last:border-b-0">
                <AccordionTrigger className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground">
                  <span className="flex items-center gap-2">
                    <span className="text-muted-foreground">{icon}</span>
                    <span>{title}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-1 pb-3">
                  <BlockBoundary
                    label={title}
                    errorTitle={t.editor.inspectorBlockError}
                    retryLabel={t.editor.inspectorRetry}
                    unknownError={t.editor.inspectorUnknownError}
                  >
                    <Component selected={selectedElement} api={api} />
                  </BlockBoundary>
                </AccordionContent>
              </AccordionItem>
              );
            })}
          </Accordion>
        )}
        <div className="h-6" />
      </ScrollArea>
    </div>
  );
}
