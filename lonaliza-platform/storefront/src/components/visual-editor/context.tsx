"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Locale } from "@/lib/i18n/types";
import {
  catalogSectionTypes,
  cloneDraft,
  defaultHomepageDraft,
  type HomepageSectionType,
  type HomepageTemplateDraft,
  type SectionStyles,
} from "@/lib/visual-editor/schema";
import { applyTemplatePatch, type TemplatePatch } from "@/lib/visual-editor/apply-patch";

export type EditorDevice = "desktop" | "tablet" | "mobile";
export type EditorPanel = "sections" | "layout" | "design" | "history" | "ai" | "inspector";

export type EditorSelection = {
  instanceId: string;
  sectionType: HomepageSectionType;
  field?: string;
  text?: string;
  labelAr: string;
  labelEn: string;
  labelTr: string;
};

type EditorContextValue = {
  draft: HomepageTemplateDraft;
  publishedAt: string | null;
  dirty: boolean;
  saving: boolean;
  publishing: boolean;
  device: EditorDevice;
  panel: EditorPanel;
  locale: Locale;
  selection: EditorSelection | null;
  canUndo: boolean;
  canRedo: boolean;
  setDevice: (device: EditorDevice) => void;
  setPanel: (panel: EditorPanel) => void;
  setLocale: (locale: Locale) => void;
  setSelection: (selection: EditorSelection | null) => void;
  setSaving: (value: boolean) => void;
  setPublishing: (value: boolean) => void;
  hydrate: (draft: HomepageTemplateDraft, publishedAt: string | null) => void;
  replaceDraft: (draft: HomepageTemplateDraft) => void;
  applyPatch: (patch: TemplatePatch) => void;
  updateText: (instanceId: string, field: string, locale: Locale, value: string) => void;
  updateStyles: (instanceId: string, styles: Partial<SectionStyles>) => void;
  updateSettings: (instanceId: string, settings: Record<string, string | number | boolean>) => void;
  setHidden: (instanceId: string, hidden: boolean) => void;
  removeSection: (instanceId: string) => void;
  addSection: (type: HomepageSectionType, afterInstanceId?: string) => void;
  moveSection: (instanceId: string, direction: -1 | 1) => void;
  setGlobal: (navy?: string, emerald?: string) => void;
  undo: () => void;
  redo: () => void;
  markSaved: () => void;
};

const EditorContext = createContext<EditorContextValue | null>(null);
const HISTORY_LIMIT = 40;

export function VisualEditorProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<HomepageTemplateDraft>(defaultHomepageDraft);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [past, setPast] = useState<HomepageTemplateDraft[]>([]);
  const [future, setFuture] = useState<HomepageTemplateDraft[]>([]);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [device, setDevice] = useState<EditorDevice>("desktop");
  const [panel, setPanel] = useState<EditorPanel>("layout");
  const [locale, setLocale] = useState<Locale>("ar");
  const [selection, setSelection] = useState<EditorSelection | null>(null);

  const pushHistory = useCallback((current: HomepageTemplateDraft) => {
    setPast((prev) => {
      const next = [...prev, cloneDraft(current)];
      return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
    });
    setFuture([]);
    setDirty(true);
  }, []);

  const replaceDraft = useCallback(
    (next: HomepageTemplateDraft) => {
      setDraft((current) => {
        pushHistory(current);
        return cloneDraft(next);
      });
    },
    [pushHistory]
  );

  const applyPatch = useCallback(
    (patch: TemplatePatch) => {
      setDraft((current) => {
        pushHistory(current);
        return applyTemplatePatch(current, patch);
      });
    },
    [pushHistory]
  );

  const updateText = useCallback(
    (instanceId: string, field: string, loc: Locale, value: string) => {
      applyPatch({ updateSectionText: { instanceId, field, locale: loc, value } });
    },
    [applyPatch]
  );

  const updateStyles = useCallback(
    (instanceId: string, styles: Partial<SectionStyles>) => {
      applyPatch({ updateSectionStyles: { instanceId, styles } });
    },
    [applyPatch]
  );

  const updateSettings = useCallback(
    (instanceId: string, settings: Record<string, string | number | boolean>) => {
      applyPatch({ updateSectionSettings: { instanceId, settings } });
    },
    [applyPatch]
  );

  const setHidden = useCallback(
    (instanceId: string, hidden: boolean) => {
      applyPatch(hidden ? { hideSection: instanceId } : { showSection: instanceId });
    },
    [applyPatch]
  );

  const removeSection = useCallback(
    (instanceId: string) => {
      applyPatch({ removeSection: instanceId });
      setSelection((cur) => (cur?.instanceId === instanceId ? null : cur));
    },
    [applyPatch]
  );

  const addSection = useCallback(
    (type: HomepageSectionType, afterInstanceId?: string) => {
      applyPatch({ addSection: { type, afterInstanceId } });
    },
    [applyPatch]
  );

  const moveSection = useCallback((instanceId: string, direction: -1 | 1) => {
    setDraft((current) => {
      const index = current.layout.findIndex((item) => item.instanceId === instanceId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.layout.length) return current;
      pushHistory(current);
      const layout = [...current.layout];
      const [moved] = layout.splice(index, 1);
      if (!moved) return current;
      layout.splice(nextIndex, 0, moved);
      return { ...current, layout };
    });
  }, [pushHistory]);

  const setGlobal = useCallback(
    (navy?: string, emerald?: string) => {
      applyPatch({ setGlobal: { navy, emerald } });
    },
    [applyPatch]
  );

  const undo = useCallback(() => {
    setPast((prev) => {
      if (!prev.length) return prev;
      const previous = prev[prev.length - 1];
      if (!previous) return prev;
      setDraft((current) => {
        setFuture((f) => [cloneDraft(current), ...f].slice(0, HISTORY_LIMIT));
        return cloneDraft(previous);
      });
      setDirty(true);
      return prev.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setFuture((prev) => {
      if (!prev.length) return prev;
      const next = prev[0];
      if (!next) return prev;
      setDraft((current) => {
        setPast((p) => [...p, cloneDraft(current)].slice(-HISTORY_LIMIT));
        return cloneDraft(next);
      });
      setDirty(true);
      return prev.slice(1);
    });
  }, []);

  const hydrate = useCallback((next: HomepageTemplateDraft, published: string | null) => {
    setDraft(cloneDraft(next));
    setPublishedAt(published);
    setPast([]);
    setFuture([]);
    setDirty(false);
  }, []);

  const markSaved = useCallback(() => setDirty(false), []);

  const value = useMemo<EditorContextValue>(
    () => ({
      draft,
      publishedAt,
      dirty,
      saving,
      publishing,
      device,
      panel,
      locale,
      selection,
      canUndo: past.length > 0,
      canRedo: future.length > 0,
      setDevice,
      setPanel,
      setLocale,
      setSelection,
      setSaving,
      setPublishing,
      hydrate,
      replaceDraft,
      applyPatch,
      updateText,
      updateStyles,
      updateSettings,
      setHidden,
      removeSection,
      addSection,
      moveSection,
      setGlobal,
      undo,
      redo,
      markSaved,
    }),
    [
      draft,
      publishedAt,
      dirty,
      saving,
      publishing,
      device,
      panel,
      locale,
      selection,
      past.length,
      future.length,
      hydrate,
      replaceDraft,
      applyPatch,
      updateText,
      updateStyles,
      updateSettings,
      setHidden,
      removeSection,
      addSection,
      moveSection,
      setGlobal,
      undo,
      redo,
      markSaved,
    ]
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useVisualEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useVisualEditor must be used inside VisualEditorProvider");
  return ctx;
}

export function catalogTypes(): HomepageSectionType[] {
  return catalogSectionTypes();
}
