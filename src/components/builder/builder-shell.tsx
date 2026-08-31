"use client";

/* Agent A: editor chrome only */

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Toaster, toast } from "sonner";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { HomepageTemplateDraft } from "@/lib/visual-editor/schema";
import {
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  RIGHT_DOCK_DEFAULT_WIDTH,
  RIGHT_DOCK_MAX_WIDTH,
  RIGHT_DOCK_MIN_WIDTH,
  useBuilderStore,
} from "@/lib/builder/editor-store";
import { useBuilderShortcuts } from "@/lib/builder/use-shortcuts";
import { cn } from "@/lib/builder/cn";
import { TooltipProvider } from "./ui";
import { TopBar } from "./top-bar";
import { LeftRail } from "./left-rail";
import { Canvas } from "./canvas";
import { InspectorPanel, PanelHost } from "./panels";
import { CommandPalette } from "./command-palette";
import { EditorCopilotProvider } from "@/components/editor";
import { SidebarResizeHandle } from "./sidebar-resize-handle";
import { RightDockResizeHandle } from "./right-dock-resize-handle";
import { CanvasLanguageBar } from "@/components/visual-editor/CanvasLanguageBar";
import {
  applyEditorChromeTheme,
  clearEditorChromeThemeAttr,
  persistEditorChromeTheme,
  readEditorChromeTheme,
  toggleEditorChromeTheme,
  type EditorChromeTheme,
} from "@/lib/builder/editor-theme";
import "./builder.css";
import "@/components/visual-editor/editor-chrome.css";

const SIDEBAR_WIDTH_STORAGE_KEY = "alrayyan-builder:sidebar-width";
const SIDEBAR_COLLAPSED_STORAGE_KEY = "alrayyan-builder:sidebar-collapsed";
const RIGHT_DOCK_WIDTH_STORAGE_KEY = "alrayyan-builder:right-dock-width";
const RIGHT_DOCK_COLLAPSED_STORAGE_KEY = "alrayyan-builder:right-dock-collapsed";
const DRAFT_STORAGE_KEY = "alrayyan-builder:theme-draft";

function persist(publish: boolean) {
  const { theme, setSaving, setPublishing, markSaved } = useBuilderStore.getState();
  if (publish) setPublishing(true);
  else setSaving(true);
  return fetch("/api/admin/homepage-template", {
    method: "PUT",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ draft: theme, publish }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.ok) throw new Error(data.error || "save failed");
      markSaved();
      return data;
    })
    .finally(() => {
      useBuilderStore.getState().setSaving(false);
      useBuilderStore.getState().setPublishing(false);
    });
}

export function BuilderShell() {
  const { t } = useLocale();
  const [ready, setReady] = useState(false);
  const [chromeTheme, setChromeTheme] = useState<EditorChromeTheme>("light");
  const hydrateInitial = useBuilderStore((s) => s.hydrateInitial);
  const theme = useBuilderStore((s) => s.theme);
  const hasUnsavedChanges = useBuilderStore((s) => s.hasUnsavedChanges);
  const locale = useBuilderStore((s) => s.locale);
  const rtl = useBuilderStore((s) => s.rtl);
  const sidebarWidth = useBuilderStore((s) => s.sidebarWidth);
  const sidebarCollapsed = useBuilderStore((s) => s.sidebarCollapsed);
  const sidebarResizing = useBuilderStore((s) => s.sidebarResizing);
  const setSidebarWidth = useBuilderStore((s) => s.setSidebarWidth);
  const setSidebarCollapsed = useBuilderStore((s) => s.setSidebarCollapsed);
  const rightDockWidth = useBuilderStore((s) => s.rightDockWidth);
  const rightDockCollapsed = useBuilderStore((s) => s.rightDockCollapsed);
  const rightDockResizing = useBuilderStore((s) => s.rightDockResizing);
  const setRightDockWidth = useBuilderStore((s) => s.setRightDockWidth);
  const setRightDockCollapsed = useBuilderStore((s) => s.setRightDockCollapsed);
  const discard = useBuilderStore((s) => s.discard);

  useLayoutEffect(() => {
    const initial = readEditorChromeTheme();
    setChromeTheme(initial);
    applyEditorChromeTheme(initial);
    return () => clearEditorChromeThemeAttr();
  }, []);

  useLayoutEffect(() => {
    applyEditorChromeTheme(chromeTheme);
  }, [chromeTheme]);

  const handleToggleChromeTheme = useCallback(() => {
    setChromeTheme((prev) => {
      const next = toggleEditorChromeTheme(prev);
      persistEditorChromeTheme(next);
      applyEditorChromeTheme(next);
      return next;
    });
  }, []);

  useEffect(() => {
    let timer = 0;
    const onAutosave = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        void persist(false).catch(() => {
          /* draft retry on next explicit save */
        });
      }, 700);
    };
    window.addEventListener("alrayyan:builder-autosave-draft", onAutosave);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("alrayyan:builder-autosave-draft", onAutosave);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById("alrayyan-iconsax")) return;
    const link = document.createElement("link");
    link.id = "alrayyan-iconsax";
    link.rel = "stylesheet";
    link.href = "/vendor-icons/iconsax.css";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rawWidth = window.localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
    const n = rawWidth ? parseInt(rawWidth, 10) : NaN;
    if (Number.isFinite(n)) {
      const clamped = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, n));
      if (clamped !== SIDEBAR_DEFAULT_WIDTH) setSidebarWidth(clamped);
    }
    if (window.localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === "1") {
      setSidebarCollapsed(true);
    }
    const rawDock = window.localStorage.getItem(RIGHT_DOCK_WIDTH_STORAGE_KEY);
    const dn = rawDock ? parseInt(rawDock, 10) : NaN;
    if (Number.isFinite(dn)) {
      const clamped = Math.min(RIGHT_DOCK_MAX_WIDTH, Math.max(RIGHT_DOCK_MIN_WIDTH, dn));
      if (clamped !== RIGHT_DOCK_DEFAULT_WIDTH) setRightDockWidth(clamped);
    }
    if (window.localStorage.getItem(RIGHT_DOCK_COLLAPSED_STORAGE_KEY) === "0") {
      setRightDockCollapsed(false);
    }
  }, [setRightDockCollapsed, setRightDockWidth, setSidebarCollapsed, setSidebarWidth]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const raw = (params.get("panel") || params.get("tab") || "").toLowerCase();
    if (raw === "design" || raw === "branding" || raw === "theme") {
      useBuilderStore.getState().setActivePanel("design");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/homepage-template", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data?.ok) return;
        hydrateInitial(data.draft as HomepageTemplateDraft, data.publishedAt || null);
        setReady(true);
      })
      .catch(() => setReady(true));
    return () => {
      cancelled = true;
    };
  }, [hydrateInitial]);

  useEffect(() => {
    if (typeof window === "undefined" || !hasUnsavedChanges) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({ theme, locale, savedAt: Date.now() })
        );
      } catch {
        /* quota */
      }
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [theme, hasUnsavedChanges, locale]);

  const handleSave = useCallback(async () => {
    try {
      await persist(false);
      toast.success(t.editor.saved);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.editor.saveFailed);
    }
  }, [t.editor.saveFailed, t.editor.saved]);

  const handlePublish = useCallback(async () => {
    try {
      await persist(true);
      toast.success(t.editor.published);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.editor.saveFailed);
    }
  }, [t.editor.published, t.editor.saveFailed]);

  useBuilderShortcuts({ onSave: handleSave });

  if (!ready) {
    return (
      <div className="flex h-screen w-screen items-center justify-center gap-2 bg-[var(--ed-bg-hex,#f4f6f8)] text-slate-500">
        <Loader2 className="animate-spin" size={18} />
        {t.admin.loading}
      </div>
    );
  }

  return (
    <EditorCopilotProvider>
    <TooltipProvider delayDuration={150}>
      <div
        id="builder-root"
        data-editor-theme={chromeTheme}
        className="flex h-screen w-screen flex-col overflow-hidden"
        dir={rtl ? "rtl" : "ltr"}
        lang={locale}
      >
        <TopBar
          onSave={handleSave}
          onPublish={handlePublish}
          onOpenLive={() => window.open("/", "_blank", "noopener,noreferrer")}
          onDiscard={discard}
          chromeTheme={chromeTheme}
          onToggleChromeTheme={handleToggleChromeTheme}
        />
        <div className="flex min-h-0 flex-1">
          <LeftRail />
          <aside
            aria-hidden={sidebarCollapsed ? "true" : undefined}
            style={{
              width: sidebarCollapsed ? 0 : sidebarWidth,
              minWidth: sidebarCollapsed ? 0 : undefined,
            }}
            className={cn(
              "ed-panel-chrome flex shrink-0 flex-col overflow-hidden",
              sidebarResizing ? "" : "transition-[width] duration-200 ease-out",
              sidebarCollapsed ? "border-r-0" : "border-r border-[var(--ed-border-hex)]"
            )}
          >
            <PanelHost />
          </aside>
          <SidebarResizeHandle rtl={rtl} />
          <main
            data-builder-canvas-scroll="1"
            className="flex min-w-0 flex-1 flex-col overflow-y-scroll"
          >
            <CanvasLanguageBar />
            <Canvas />
          </main>
          <RightDockResizeHandle rtl={rtl} />
          <aside
            data-editor-inspector="" /* Agent E: settings panel + card design */
            aria-hidden={rightDockCollapsed ? "true" : undefined}
            aria-label={t.editor.inspector}
            style={{
              width: rightDockCollapsed ? 0 : rightDockWidth,
              minWidth: rightDockCollapsed ? 0 : undefined,
            }}
            className={cn(
              "ed-panel-chrome flex shrink-0 flex-col overflow-hidden",
              rightDockResizing ? "" : "transition-[width] duration-200 ease-out",
              rightDockCollapsed ? "border-l-0" : "border-l border-[var(--ed-border-hex)]"
            )}
          >
            <InspectorPanel />
          </aside>
        </div>
        <CommandPalette onSave={handleSave} />
        <Toaster position="bottom-right" />
      </div>
    </TooltipProvider>
    </EditorCopilotProvider>
  );
}
