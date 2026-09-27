"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
  type MouseEvent,
} from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  EDITOR_SECTION_SELECTED_EVENT,
  EDITOR_SECTIONS,
  LEGACY_EDITOR_SECTION_SELECTED_EVENT,
  isEditorRefreshType,
  postSectionSelection,
  type EditorSectionType,
} from "@/lib/editor-protocol";

type EditorSectionProps = {
  sectionType: EditorSectionType;
  /** Override default id from EDITOR_SECTIONS */
  sectionId?: string;
  labelAr?: string;
  labelEn?: string;
  className?: string;
  children: ReactNode;
};

function EditorSectionInner({
  sectionType,
  sectionId,
  labelAr,
  labelEn,
  className,
  children,
}: EditorSectionProps) {
  const searchParams = useSearchParams();
  const editorMode =
    searchParams.get("editor") === "1" || searchParams.get("editor") === "true";
  const [selected, setSelected] = useState(false);

  const meta = EDITOR_SECTIONS[sectionType];
  const id = sectionId || meta.id;
  const ar = labelAr || meta.labelAr;
  const en = labelEn || meta.labelEn;

  useEffect(() => {
    if (!editorMode) return;
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (isEditorRefreshType(e.data?.type)) {
        setSelected(false);
      }
    };
    const onSelect = (e: Event) => {
      const detail = (e as CustomEvent<{ sectionId: string }>).detail;
      setSelected(detail?.sectionId === id);
    };
    window.addEventListener("message", onMsg);
    window.addEventListener(EDITOR_SECTION_SELECTED_EVENT, onSelect);
    window.addEventListener(LEGACY_EDITOR_SECTION_SELECTED_EVENT, onSelect);
    return () => {
      window.removeEventListener("message", onMsg);
      window.removeEventListener(EDITOR_SECTION_SELECTED_EVENT, onSelect);
      window.removeEventListener(LEGACY_EDITOR_SECTION_SELECTED_EVENT, onSelect);
    };
  }, [editorMode, id]);

  const select = useCallback(
    (e?: MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      if (!editorMode) return;
      postSectionSelection({
        sectionId: id,
        sectionType,
        labelAr: ar,
        labelEn: en,
      });
      window.dispatchEvent(
        new CustomEvent(EDITOR_SECTION_SELECTED_EVENT, {
          detail: { sectionId: id },
        })
      );
      setSelected(true);
    },
    [editorMode, id, sectionType, ar, en]
  );

  if (!editorMode) {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(
        "relative group/editor outline-none",
        selected && "z-[1]",
        className
      )}
      data-section-id={id}
      data-section-type={sectionType}
      data-editor-section="1"
    >
      {children}
      {/* Visual ring — non-blocking so cards remain clickable */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-[58] border-2 transition-all duration-200 rounded-sm",
          selected
            ? "border-amber-500 bg-amber-400/10 ring-2 ring-amber-400/30"
            : "border-transparent group-hover/editor:border-amber-400/70 group-hover/editor:bg-amber-400/5"
        )}
      />
      <button
        type="button"
        aria-label={`Select section ${en}`}
        onClick={select}
        className={cn(
          "absolute top-3 start-3 z-[62] px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg transition-all",
          "bg-amber-500 text-slate-950 hover:bg-amber-400",
          selected
            ? "opacity-100 scale-105"
            : "opacity-80 group-hover/editor:opacity-100"
        )}
      >
        {ar}
      </button>
    </div>
  );
}

/** Wrap a homepage section so it is selectable in Visual AI Editor mode. */
export default function EditorSection(props: EditorSectionProps) {
  return (
    <Suspense fallback={<>{props.children}</>}>
      <EditorSectionInner {...props} />
    </Suspense>
  );
}

type EditorItemProps = {
  sectionType: EditorSectionType;
  sectionId?: string;
  itemId: string;
  labelAr: string;
  labelEn: string;
  className?: string;
  children: ReactNode;
};

function EditorItemInner({
  sectionType,
  sectionId,
  itemId,
  labelAr,
  labelEn,
  className,
  children,
}: EditorItemProps) {
  const searchParams = useSearchParams();
  const editorMode =
    searchParams.get("editor") === "1" || searchParams.get("editor") === "true";

  const meta = EDITOR_SECTIONS[sectionType];
  const sid = sectionId || meta.id;

  const onSelect = useCallback(
    (e: MouseEvent) => {
      if (!editorMode) return;
      e.preventDefault();
      e.stopPropagation();
      postSectionSelection({
        sectionId: sid,
        sectionType,
        labelAr: meta.labelAr,
        labelEn: meta.labelEn,
        itemId,
        itemLabelAr: labelAr,
        itemLabelEn: labelEn,
      });
      window.dispatchEvent(
        new CustomEvent(EDITOR_SECTION_SELECTED_EVENT, {
          detail: { sectionId: sid },
        })
      );
    },
    [
      editorMode,
      sid,
      sectionType,
      meta.labelAr,
      meta.labelEn,
      itemId,
      labelAr,
      labelEn,
    ]
  );

  if (!editorMode) return <>{children}</>;

  return (
    <div
      className={cn("relative group/item cursor-pointer", className)}
      data-item-id={itemId}
      onClickCapture={onSelect}
    >
      {children}
      <div className="pointer-events-none absolute inset-0 z-[55] rounded-2xl border-2 border-transparent group-hover/item:border-sky-400 group-hover/item:bg-sky-400/10 transition-all" />
      <span className="pointer-events-none absolute top-2 end-2 z-[56] opacity-0 group-hover/item:opacity-100 px-2 py-0.5 rounded-md bg-sky-500 text-white text-[10px] font-bold">
        {labelAr}
      </span>
    </div>
  );
}

/** Optional card/item-level selection inside an editor section. */
export function EditorSelectableItem(props: EditorItemProps) {
  return (
    <Suspense fallback={<>{props.children}</>}>
      <EditorItemInner {...props} />
    </Suspense>
  );
}
