"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { catalogSectionTypes, pickCopy, sectionLabel } from "@/lib/visual-editor/schema";
import { useBuilderStore, type BuilderPanel } from "@/lib/builder/editor-store";

export function CommandPalette({ onSave }: { onSave: () => void }) {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const addSection = useBuilderStore((s) => s.addSection);
  const setActivePanel = useBuilderStore((s) => s.setActivePanel);
  const editorPages = useBuilderStore((s) => s.editorPages);
  const setActivePage = useBuilderStore((s) => s.setActivePage);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const items = useMemo(() => {
    const panels: { id: string; label: string; run: () => void }[] = [
      { id: "save", label: t.editor.saveDraft, run: onSave },
      { id: "pages", label: t.editor.pages, run: () => setActivePanel("pages") },
      { id: "sections", label: t.editor.sections, run: () => setActivePanel("sections") },
      { id: "layout", label: t.editor.layout, run: () => setActivePanel("layout") },
      { id: "design", label: t.editor.design, run: () => setActivePanel("design") },
      { id: "ai", label: t.editor.ai, run: () => setActivePanel("ai" as BuilderPanel) },
    ];
    const pages = editorPages.pages.map((page) => ({
      id: `page-${page.id}`,
      label: `${t.editor.openPage}: ${
        locale === "ar" ? page.labelAr : locale === "tr" ? page.labelTr : page.labelEn
      }`,
      run: () => {
        setActivePage(page.id);
        setActivePanel("pages");
      },
    }));
    const sections = catalogSectionTypes().map((type) => ({
      id: `add-${type}`,
      label: `${t.editor.addSection}: ${pickCopy(sectionLabel(type), locale)}`,
      run: () => addSection(type),
    }));
    const q = query.trim().toLowerCase();
    return [...panels, ...pages, ...sections].filter((item) => !q || item.label.toLowerCase().includes(q));
  }, [addSection, editorPages.pages, locale, onSave, query, setActivePage, setActivePanel, t.editor]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-slate-950/40 p-8" onClick={() => setOpen(false)}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.editor.commandPlaceholder}
          className="w-full border-b border-slate-200 px-4 py-3 text-sm outline-none"
        />
        <div className="max-h-80 overflow-y-auto p-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                item.run();
                setOpen(false);
                setQuery("");
              }}
              className="block w-full rounded-lg px-3 py-2 text-start text-sm hover:bg-emerald-50"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
