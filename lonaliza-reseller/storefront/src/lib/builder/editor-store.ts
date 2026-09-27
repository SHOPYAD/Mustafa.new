"use client";

import { create } from "zustand";
import { temporal } from "zundo";
import { shallow } from "zustand/shallow";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { useMemo } from "react";
import type { Locale } from "@/lib/i18n/types";
import {
  cloneDraft,
  defaultHomepageDraft,
  defaultSectionForType,
  generateInstanceId,
  isHomepageSectionType,
  pickCopy,
  sectionLabel,
  type HomepageSectionInstance,
  type HomepageSectionType,
  type HomepageTemplateDraft,
  type SectionStyles,
} from "@/lib/visual-editor/schema";
import { applyTemplatePatch, type TemplatePatch } from "@/lib/visual-editor/apply-patch";
import {
  buildEditorPagesData,
  builtinEditorPageOptions,
  editorPageToOption,
  type EditorPagesData,
} from "@/lib/builder-pages";

export type BuilderDevice = "desktop" | "tablet" | "mobile";

export type BuilderPanel =
  | "pages"
  | "sections"
  | "layout"
  | "design"
  | "history"
  | "ai"
  | "settings";

export interface SelectedElement {
  id: string;
  sectionInstanceId: string | null;
  sectionType: HomepageSectionType | null;
  text?: string;
  tagName?: string;
  label?: string;
  src?: string;
  field?: string;
  currentStyles?: Record<string, string>;
  isInsideButton?: boolean;
}

export interface StyleClipboard {
  sourceId: string;
  sourceLabel?: string;
  sourceTag?: string;
  overrides: Record<string, unknown>;
}

export interface PageOption {
  value: string;
  label: string;
  routePath: string;
  layoutKey: string;
}

export interface BuilderStateSnapshot {
  theme: HomepageTemplateDraft;
}

export interface BuilderState extends BuilderStateSnapshot {
  initialTheme: HomepageTemplateDraft;
  isSaving: boolean;
  isPublishing: boolean;
  hasUnsavedChanges: boolean;
  publishedAt: string | null;
  device: BuilderDevice;
  activePanel: BuilderPanel;
  selectedElement: SelectedElement | null;
  activePage: string;
  pageOptions: PageOption[];
  editorPages: EditorPagesData;
  iframeReady: boolean;
  rtl: boolean;
  locale: Locale;
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  sidebarResizing: boolean;
  agentBusy: boolean;
  rightDockWidth: number;
  rightDockCollapsed: boolean;
  rightDockResizing: boolean;
  _sidebarPreSelectionCollapsed?: boolean | undefined;
  sectionClipboard: HomepageSectionInstance | null;
  styleClipboard: StyleClipboard | null;
}

export interface BuilderActions {
  setTheme: (updater: (prev: HomepageTemplateDraft) => HomepageTemplateDraft) => void;
  replaceTheme: (next: HomepageTemplateDraft) => void;
  applyPatch: (patch: TemplatePatch) => void;
  updateGlobalToken: (token: "navy" | "emerald", value: string) => void;
  updateSectionStyles: (instanceId: string, styles: Partial<SectionStyles>) => void;
  updateSectionSettings: (
    instanceId: string,
    settings: Record<string, string | number | boolean>
  ) => void;
  setElementContent: (instanceId: string, field: string, locale: Locale, content: string) => void;
  reorderSection: (instanceId: string, newIndex: number) => void;
  addSection: (type: HomepageSectionType, afterInstanceId?: string) => void;
  duplicateSection: (instanceId: string) => void;
  hideSection: (instanceId: string, hidden: boolean) => void;
  removeSection: (instanceId: string) => void;
  copySection: (instanceId: string) => void;
  pasteSection: (afterInstanceId?: string) => void;
  setActivePanel: (p: BuilderPanel) => void;
  setDevice: (d: BuilderDevice) => void;
  setSelectedElement: (el: SelectedElement | null) => void;
  /* Agent E: settings panel + card design */
  patchSelectedStyles: (styles: Record<string, string>) => void;
  setActivePage: (p: string) => void;
  setPageOptions: (opts: PageOption[]) => void;
  applyEditorPagesData: (data: Partial<EditorPagesData>) => void;
  setIframeReady: (r: boolean) => void;
  markSaved: () => void;
  setSaving: (s: boolean) => void;
  setPublishing: (s: boolean) => void;
  setLocale: (l: Locale) => void;
  setSidebarWidth: (n: number) => void;
  setSidebarCollapsed: (c: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarResizing: (r: boolean) => void;
  setAgentBusy: (b: boolean) => void;
  setRightDockWidth: (n: number) => void;
  setRightDockCollapsed: (c: boolean) => void;
  toggleRightDockCollapsed: () => void;
  setRightDockResizing: (r: boolean) => void;
  hydrateInitial: (theme: HomepageTemplateDraft, publishedAt: string | null) => void;
  discard: () => void;
  updateElementStyle: (
    id: string,
    sectionInstanceId: string | null,
    prop: string,
    value: string
  ) => void;
  updateElementStyleResponsive: (
    id: string,
    sectionInstanceId: string | null,
    layer: BuilderDevice,
    prop: string,
    value: string
  ) => void;
  clearElementOverrides: (id: string) => void;
  copyElementStyles: () => void;
  pasteElementStyles: () => void;
}

export const SIDEBAR_MIN_WIDTH = 260;
export const SIDEBAR_MAX_WIDTH = 640;
export const SIDEBAR_DEFAULT_WIDTH = 320;
export const RIGHT_DOCK_MIN_WIDTH = 280;
export const RIGHT_DOCK_MAX_WIDTH = 520;
export const RIGHT_DOCK_DEFAULT_WIDTH = 340;

const SIDEBAR_WIDTH_STORAGE_KEY = "alrayyan-builder:sidebar-width";
const SIDEBAR_COLLAPSED_STORAGE_KEY = "alrayyan-builder:sidebar-collapsed";
const RIGHT_DOCK_WIDTH_STORAGE_KEY = "alrayyan-builder:right-dock-width";
const RIGHT_DOCK_COLLAPSED_STORAGE_KEY = "alrayyan-builder:right-dock-collapsed";

function writePersistedWidth(n: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(n));
  } catch {
    /* quota */
  }
}

function writePersistedCollapsed(c: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, c ? "1" : "0");
  } catch {
    /* quota */
  }
}

function writePersistedRightDockWidth(n: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RIGHT_DOCK_WIDTH_STORAGE_KEY, String(n));
  } catch {
    /* quota */
  }
}

function writePersistedRightDockCollapsed(c: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RIGHT_DOCK_COLLAPSED_STORAGE_KEY, c ? "1" : "0");
  } catch {
    /* quota */
  }
}

function isRtlLocale(locale: string): boolean {
  return locale === "ar";
}

type Store = BuilderState & BuilderActions;

export const useBuilderStore = create<Store>()(
  temporal(
    (set, get) => ({
      theme: defaultHomepageDraft(),
      initialTheme: defaultHomepageDraft(),
      isSaving: false,
      isPublishing: false,
      hasUnsavedChanges: false,
      publishedAt: null,
      device: "desktop",
      activePanel: "sections",
      selectedElement: null,
      activePage: "home",
      pageOptions: builtinEditorPageOptions(),
      editorPages: buildEditorPagesData([]),
      iframeReady: false,
      rtl: true,
      locale: "ar",
      sidebarWidth: SIDEBAR_DEFAULT_WIDTH,
      sidebarCollapsed: false,
      sidebarResizing: false,
      agentBusy: false,
      rightDockWidth: RIGHT_DOCK_DEFAULT_WIDTH,
      rightDockCollapsed: true,
      rightDockResizing: false,
      _sidebarPreSelectionCollapsed: undefined,
      sectionClipboard: null,
      styleClipboard: null,

      hydrateInitial: (theme, publishedAt) =>
        set({
          theme: cloneDraft(theme),
          initialTheme: cloneDraft(theme),
          publishedAt,
          hasUnsavedChanges: false,
        }),

      setTheme: (updater) =>
        set((s) => ({
          theme: updater(s.theme),
          hasUnsavedChanges: true,
        })),

      replaceTheme: (next) => set({ theme: cloneDraft(next), hasUnsavedChanges: true }),

      applyPatch: (patch) =>
        set((s) => ({
          theme: applyTemplatePatch(s.theme, patch),
          hasUnsavedChanges: true,
        })),

      updateGlobalToken: (token, value) =>
        set((s) => ({
          theme: {
            ...s.theme,
            global: { ...s.theme.global, [token]: value },
          },
          hasUnsavedChanges: true,
        })),

      updateSectionStyles: (instanceId, styles) =>
        set((s) => ({
          theme: applyTemplatePatch(s.theme, { updateSectionStyles: { instanceId, styles } }),
          hasUnsavedChanges: true,
        })),

      updateSectionSettings: (instanceId, settings) =>
        set((s) => ({
          theme: applyTemplatePatch(s.theme, {
            updateSectionSettings: { instanceId, settings },
          }),
          hasUnsavedChanges: true,
        })),

      setElementContent: (instanceId, field, locale, content) =>
        set((s) => {
          /* Agent L2: live inspector bind */
          const selected = s.selectedElement;
          const same =
            selected &&
            selected.sectionInstanceId === instanceId &&
            (selected.field === field ||
              selected.id === `${instanceId}.${field}` ||
              selected.id === field);
          return {
            theme: applyTemplatePatch(s.theme, {
              updateSectionText: { instanceId, field, locale, value: content },
            }),
            hasUnsavedChanges: true,
            selectedElement:
              same && selected ? { ...selected, text: content, field } : selected,
          };
        }),

      reorderSection: (instanceId, newIndex) =>
        set((s) => {
          const layout = [...s.theme.layout];
          const idx = layout.findIndex((item) => item.instanceId === instanceId);
          if (idx === -1) return s;
          const [item] = layout.splice(idx, 1);
          if (!item) return s;
          layout.splice(Math.max(0, Math.min(layout.length, newIndex)), 0, item);
          return {
            hasUnsavedChanges: true,
            theme: { ...s.theme, layout },
          };
        }),

      addSection: (type, afterInstanceId) =>
        set((s) => ({
          theme: applyTemplatePatch(s.theme, { addSection: { type, afterInstanceId } }),
          hasUnsavedChanges: true,
        })),

      duplicateSection: (instanceId) =>
        set((s) => {
          const idx = s.theme.layout.findIndex((item) => item.instanceId === instanceId);
          if (idx === -1) return s;
          const orig = s.theme.layout[idx];
          if (!orig) return s;
          const clone: HomepageSectionInstance = {
            ...JSON.parse(JSON.stringify(orig)),
            instanceId: generateInstanceId(orig.type),
          };
          const layout = [...s.theme.layout];
          layout.splice(idx + 1, 0, clone);
          return {
            hasUnsavedChanges: true,
            theme: { ...s.theme, layout },
            selectedElement: {
              id: clone.instanceId,
              sectionInstanceId: clone.instanceId,
              sectionType: clone.type,
              label: pickCopy(sectionLabel(clone.type), s.locale),
            },
          };
        }),

      hideSection: (instanceId, hidden) =>
        set((s) => ({
          theme: applyTemplatePatch(s.theme, hidden ? { hideSection: instanceId } : { showSection: instanceId }),
          hasUnsavedChanges: true,
        })),

      removeSection: (instanceId) =>
        set((s) => ({
          theme: applyTemplatePatch(s.theme, { removeSection: instanceId }),
          hasUnsavedChanges: true,
          selectedElement:
            s.selectedElement?.sectionInstanceId === instanceId ? null : s.selectedElement,
        })),

      copySection: (instanceId) =>
        set((s) => {
          const item = s.theme.layout.find((entry) => entry.instanceId === instanceId);
          return item ? { sectionClipboard: JSON.parse(JSON.stringify(item)) } : s;
        }),

      pasteSection: (afterInstanceId) =>
        set((s) => {
          const clip = s.sectionClipboard;
          if (!clip || !isHomepageSectionType(clip.type)) return s;
          const created = defaultSectionForType(clip.type);
          const pasted: HomepageSectionInstance = {
            ...JSON.parse(JSON.stringify(clip)),
            instanceId: created.instanceId,
            hidden: false,
          };
          const layout = [...s.theme.layout];
          const found = afterInstanceId
            ? layout.findIndex((item) => item.instanceId === afterInstanceId)
            : -1;
          const idx = found === -1 ? layout.length - 1 : found;
          layout.splice(idx + 1, 0, pasted);
          return { hasUnsavedChanges: true, theme: { ...s.theme, layout } };
        }),

      setActivePanel: (p) => set({ activePanel: p }),
      setDevice: (d) => set({ device: d }),
      /* Agent E: settings panel + card design */
      setSelectedElement: (el) => {
        const prev = get();
        if (el) {
          const same =
            Boolean(prev.selectedElement) &&
            prev.selectedElement?.id === el.id &&
            prev.selectedElement?.sectionInstanceId === el.sectionInstanceId;
          if (same && prev.selectedElement) {
            set({
              selectedElement: { ...prev.selectedElement, ...el },
              rightDockCollapsed: false,
            });
            return;
          }
          set({
            selectedElement: el,
            rightDockCollapsed: false,
          });
          return;
        }
        set({
          selectedElement: null,
          _sidebarPreSelectionCollapsed: undefined,
        });
      },
      patchSelectedStyles: (styles) =>
        set((s) => {
          if (!s.selectedElement) return s;
          return {
            selectedElement: {
              ...s.selectedElement,
              currentStyles: { ...(s.selectedElement.currentStyles || {}), ...styles },
            },
          };
        }),
      setActivePage: (p) => {
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          if (p === "home") url.searchParams.delete("page");
          else url.searchParams.set("page", p);
          window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
        }
        set({ activePage: p, selectedElement: null });
      },
      setPageOptions: (opts) => set({ pageOptions: opts }),
      applyEditorPagesData: (data) => {
        const fallback = buildEditorPagesData([]);
        const pages = Array.isArray(data.pages) ? data.pages : fallback.pages;
        const groups =
          Array.isArray(data.groups) && data.groups.length ? data.groups : fallback.groups;
        const next: EditorPagesData = {
          pages,
          groups,
          activeDefaults: data.activeDefaults ?? fallback.activeDefaults,
          createEndpoint: data.createEndpoint ?? fallback.createEndpoint,
        };
        set({
          editorPages: next,
          pageOptions: next.pages.map(editorPageToOption),
        });
      },
      setIframeReady: (r) => set({ iframeReady: r }),
      setSaving: (s) => set({ isSaving: s }),
      setPublishing: (s) => set({ isPublishing: s }),
      setLocale: (l) => set({ locale: l, rtl: isRtlLocale(l) }),
      setSidebarWidth: (n) => {
        const clamped = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, Math.round(n)));
        writePersistedWidth(clamped);
        set({ sidebarWidth: clamped });
      },
      setSidebarCollapsed: (c) => {
        writePersistedCollapsed(c);
        set({ sidebarCollapsed: c, _sidebarPreSelectionCollapsed: undefined });
      },
      toggleSidebarCollapsed: () => {
        const next = !get().sidebarCollapsed;
        writePersistedCollapsed(next);
        set({ sidebarCollapsed: next, _sidebarPreSelectionCollapsed: undefined });
      },
      setSidebarResizing: (r) => set({ sidebarResizing: r }),
      setAgentBusy: (b) => set({ agentBusy: b }),
      setRightDockWidth: (n) => {
        const clamped = Math.min(
          RIGHT_DOCK_MAX_WIDTH,
          Math.max(RIGHT_DOCK_MIN_WIDTH, Math.round(n))
        );
        writePersistedRightDockWidth(clamped);
        set({ rightDockWidth: clamped });
      },
      setRightDockCollapsed: (c) => {
        writePersistedRightDockCollapsed(c);
        set({ rightDockCollapsed: c });
      },
      toggleRightDockCollapsed: () => {
        const next = !get().rightDockCollapsed;
        writePersistedRightDockCollapsed(next);
        set({ rightDockCollapsed: next });
      },
      setRightDockResizing: (r) => set({ rightDockResizing: r }),
      markSaved: () =>
        set((s) => ({
          initialTheme: cloneDraft(s.theme),
          hasUnsavedChanges: false,
          isSaving: false,
          isPublishing: false,
        })),
      discard: () =>
        set((s) => ({
          theme: cloneDraft(s.initialTheme),
          hasUnsavedChanges: false,
          selectedElement: null,
        })),

      updateElementStyle: (id, _sectionInstanceId, prop, value) =>
        set((s) => {
          const prev = s.theme.elementOverrides || {};
          const bag = { ...(prev[id] || {}) };
          if (value === "") delete bag[prop];
          else bag[prop] = value;
          const elementOverrides = { ...prev };
          if (Object.keys(bag).filter((k) => k !== "responsive").length === 0 && !bag.responsive) {
            delete elementOverrides[id];
          } else {
            elementOverrides[id] = bag;
          }
          return {
            hasUnsavedChanges: true,
            theme: { ...s.theme, elementOverrides },
          };
        }),

      updateElementStyleResponsive: (id, sectionInstanceId, layer, prop, value) => {
        if (layer === "desktop") {
          get().updateElementStyle(id, sectionInstanceId, prop, value);
          return;
        }
        set((s) => {
          const prev = s.theme.elementOverrides || {};
          const bag = { ...(prev[id] || {}) } as Record<string, unknown>;
          const responsive = { ...((bag.responsive as Record<string, Record<string, unknown>>) || {}) };
          const layerBag = { ...(responsive[layer] || {}) };
          if (value === "") delete layerBag[prop];
          else layerBag[prop] = value;
          if (Object.keys(layerBag).length === 0) delete responsive[layer];
          else responsive[layer] = layerBag;
          if (Object.keys(responsive).length === 0) delete bag.responsive;
          else bag.responsive = responsive;
          return {
            hasUnsavedChanges: true,
            theme: { ...s.theme, elementOverrides: { ...prev, [id]: bag } },
          };
        });
      },

      clearElementOverrides: (id) =>
        set((s) => {
          const prev = { ...(s.theme.elementOverrides || {}) };
          delete prev[id];
          return { hasUnsavedChanges: true, theme: { ...s.theme, elementOverrides: prev } };
        }),

      copyElementStyles: () =>
        set((s) => {
          const id = s.selectedElement?.id;
          if (!id) return s;
          const overrides = { ...(s.theme.elementOverrides?.[id] || {}) };
          return {
            styleClipboard: {
              sourceId: id,
              sourceLabel: s.selectedElement?.label,
              sourceTag: s.selectedElement?.tagName,
              overrides,
            },
          };
        }),

      pasteElementStyles: () =>
        set((s) => {
          const id = s.selectedElement?.id;
          const clip = s.styleClipboard;
          if (!id || !clip) return s;
          return {
            hasUnsavedChanges: true,
            theme: {
              ...s.theme,
              elementOverrides: {
                ...(s.theme.elementOverrides || {}),
                [id]: { ...clip.overrides },
              },
            },
          };
        }),
    }),
    {
      partialize: (state) => ({ theme: state.theme }),
      limit: 50,
      equality: shallow,
    }
  )
);

export function useTemporalBuilder<T>(
  selector: (state: {
    undo: (steps?: number) => void;
    redo: (steps?: number) => void;
    clear: () => void;
    pastStates: BuilderStateSnapshot[];
    futureStates: BuilderStateSnapshot[];
  }) => T,
  equality?: (a: T, b: T) => boolean
): T {
  const api = useBuilderStore.temporal as unknown as Parameters<typeof useStoreWithEqualityFn>[0];
  const selectorMemo = useMemo(() => selector, [selector]);
  return useStoreWithEqualityFn(api, selectorMemo as (state: unknown) => T, equality);
}

export function selectedSectionLabel(el: SelectedElement | null, locale: Locale): string {
  if (!el?.sectionType) return "";
  return pickCopy(sectionLabel(el.sectionType), locale);
}
