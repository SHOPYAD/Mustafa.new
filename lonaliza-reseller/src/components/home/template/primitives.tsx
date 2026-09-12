"use client";

/* Agent A: editor chrome only */

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  pickCopy,
  sectionLabel,
  type HomepageSectionInstance,
} from "@/lib/visual-editor/schema";
import { postToParent, type InboundSectionAction } from "@/lib/visual-editor/protocol";
import type { SectionToolbarAction } from "@/lib/visual-editor/section-toolbar";
import { serviceCardCssVars } from "@/lib/visual-editor/card-design";

export function useEditorMode() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("editor") === "1" || params.get("editor") === "true";
}

export function emitSectionMove(
  instanceId: string,
  targetInstanceId: string,
  position: "before" | "after"
) {
  postToParent({
    type: "section-move",
    instanceId,
    targetInstanceId,
    position,
    layoutKey: "layout",
  });
  postToParent({
    type: "sectionAction",
    action: "move",
    layoutKey: "layout",
    instanceId,
    targetInstanceId,
    position,
  });
  window.dispatchEvent(
    new CustomEvent("alrayyan:section-move", {
      detail: { instanceId, targetInstanceId, position },
    })
  );
}

export function selectBuilderField(
  instance: HomepageSectionInstance,
  field?: string,
  text?: string
) {
  const label = sectionLabel(instance.type);
  postToParent({
    type: "alrayyan-ve-select",
    instanceId: instance.instanceId,
    sectionType: instance.type,
    field,
    text,
    labelAr: label.ar,
    labelEn: label.en,
    labelTr: label.tr,
  });
  postToParent({
    type: "elementSelected",
    id: field ? `${instance.instanceId}.${field}` : instance.instanceId,
    instanceId: instance.instanceId,
    sectionInstanceId: instance.instanceId,
    sectionType: instance.type,
    field,
    text,
    label: label.en,
  });
  window.dispatchEvent(
    new CustomEvent("alrayyan:ve-section-selected", {
      detail: { instanceId: instance.instanceId, field },
    })
  );
}

export function preventBuilderNav(editorMode: boolean, e: MouseEvent) {
  if (!editorMode) return;
  e.preventDefault();
  e.stopPropagation();
}

let lastToolbarEmit = { key: "", at: 0 };

function emitSectionAction(
  instanceId: string,
  action: InboundSectionAction["action"],
  extra?: Partial<Pick<InboundSectionAction, "sectionType" | "targetInstanceId" | "position">>
) {
  const key = `${action}:${instanceId}`;
  const now = Date.now();
  if (lastToolbarEmit.key === key && now - lastToolbarEmit.at < 280) return;
  lastToolbarEmit = { key, at: now };
  postToParent({
    type: "sectionAction",
    action,
    layoutKey: "layout",
    instanceId,
    ...extra,
  });
}

function sectionOrderIndex(instanceId: string): { index: number; total: number } {
  if (typeof document === "undefined") return { index: 0, total: 1 };
  const nodes = Array.from(document.querySelectorAll("[data-section-id]"));
  const index = nodes.findIndex((node) => node.getAttribute("data-section-id") === instanceId);
  return { index: index < 0 ? 0 : index, total: Math.max(1, nodes.length) };
}

type EditableTextProps = {
  instance: HomepageSectionInstance;
  field: string;
  editorMode: boolean;
  as?: ElementType;
  className?: string;
  fallback?: string;
};

export function EditableText({
  instance,
  field,
  editorMode,
  as: Tag = "span",
  className,
  fallback = "",
}: EditableTextProps) {
  const { locale } = useLocale();
  const value = pickCopy(instance.texts[field], locale) || fallback;
  const ref = useRef<HTMLElement | null>(null);
  const [editing, setEditing] = useState(false);

  const commit = useCallback(() => {
    const next = (ref.current?.innerText || "").replace(/\n+$/, "").trim();
    setEditing(false);
    if (next && next !== value) {
      postToParent({
        type: "alrayyan-ve-text",
        instanceId: instance.instanceId,
        field,
        locale,
        value: next,
      });
    }
  }, [field, instance.instanceId, locale, value]);

  const onClick = (e: MouseEvent) => {
    if (!editorMode) return;
    e.stopPropagation();
    selectBuilderField(instance, field, value);
  };

  const onDoubleClick = (e: MouseEvent) => {
    if (!editorMode) return;
    e.preventDefault();
    e.stopPropagation();
    setEditing(true);
    requestAnimationFrame(() => ref.current?.focus());
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      commit();
    }
    if (e.key === "Escape") {
      if (ref.current) ref.current.innerText = value;
      setEditing(false);
    }
  };

  return (
    <Tag
      ref={ref}
      data-builder-id={`${instance.instanceId}.${field}`}
      data-builder-field={field}
      data-instance-id={instance.instanceId}
      data-field={field}
      contentEditable={editorMode && editing}
      suppressContentEditableWarning
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onBlur={editorMode ? commit : undefined}
      onKeyDown={editorMode ? onKeyDown : undefined}
      className={cn(
        className,
        editorMode && "cursor-text rounded-sm",
        editing && "outline outline-2 outline-emerald-400 outline-offset-2 bg-emerald-400/10"
      )}
    >
      {value}
    </Tag>
  );
}

type SelectableFieldProps = {
  instance: HomepageSectionInstance;
  field: string;
  editorMode: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  as?: ElementType;
};

export function SelectableField({
  instance,
  field,
  editorMode,
  className,
  style,
  children,
  as: Tag = "div",
}: SelectableFieldProps) {
  return (
    <Tag
      data-builder-id={`${instance.instanceId}.${field}`}
      data-builder-field={field}
      data-field={field}
      data-instance-id={instance.instanceId}
      onClick={(e: MouseEvent) => {
        if (!editorMode) return;
        e.preventDefault();
        e.stopPropagation();
        selectBuilderField(instance, field);
      }}
      className={cn(className, editorMode && "cursor-pointer")}
      style={style}
    >
      {children}
    </Tag>
  );
}

type BuilderLinkProps = {
  href: string;
  editorMode: boolean;
  instance: HomepageSectionInstance;
  field: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export function BuilderLink({
  href,
  editorMode,
  instance,
  field,
  className,
  style,
  children,
}: BuilderLinkProps) {
  return (
    <a
      href={href}
      data-builder-id={`${instance.instanceId}.${field}`}
      data-builder-field={field}
      data-field={field}
      data-instance-id={instance.instanceId}
      onClick={(e) => {
        if (!editorMode) return;
        e.preventDefault();
        e.stopPropagation();
        selectBuilderField(instance, field);
      }}
      className={className}
      style={style}
    >
      {children}
    </a>
  );
}

type SectionFrameProps = {
  instance: HomepageSectionInstance;
  editorMode: boolean;
  selectedId?: string | null;
  className?: string;
  children: ReactNode;
};

export function SectionFrame({
  instance,
  editorMode,
  selectedId,
  className,
  children,
}: SectionFrameProps) {
  const { t } = useLocale();
  const label = sectionLabel(instance.type);
  const selected = selectedId === instance.instanceId;
  const [sectionOrder, setSectionOrder] = useState({ index: 0, total: 1 });
  useLayoutEffect(() => {
    if (!editorMode) return;
    const next = sectionOrderIndex(instance.instanceId);
    setSectionOrder((prev) =>
      prev.index === next.index && prev.total === next.total ? prev : next
    );
  });
  const canMoveUp = sectionOrder.index > 0;
  const canMoveDown = sectionOrder.index < sectionOrder.total - 1;

  const onSelect = (e: MouseEvent) => {
    if (!editorMode) return;
    e.stopPropagation();
    selectBuilderField(instance);
  };

  const onToolbarAction = (
    e: MouseEvent<HTMLButtonElement> | PointerEvent<HTMLButtonElement>,
    action: SectionToolbarAction
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (action === "moveUp" && !canMoveUp) return;
    if (action === "moveDown" && !canMoveDown) return;
    emitSectionAction(instance.instanceId, action, {
      sectionType: action === "addAfter" ? "contact" : undefined,
    });
  };

  /* Agent E: settings panel + card design */
  const cardVars = serviceCardCssVars(instance.styles);

  if (!editorMode) {
    return (
      <div
        data-builder-id={instance.instanceId}
        data-service-cards=""
        className={className}
        style={cardVars}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn("relative group/vesection", className)}
      data-builder-id={instance.instanceId}
      data-section-id={instance.instanceId}
      data-section-type={instance.type}
      data-service-cards=""
      style={cardVars}
      onClick={onSelect}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const sourceId = e.dataTransfer.getData("text/plain");
        if (!sourceId || sourceId === instance.instanceId) return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const position = e.clientY > rect.top + rect.height / 2 ? "after" : "before";
        emitSectionMove(sourceId, instance.instanceId, position);
      }}
    >
      {instance.hidden && (
        <div className="absolute inset-0 z-[50] bg-slate-950/35 pointer-events-none flex items-start justify-center pt-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 text-white/80 text-xs px-3 py-1">
            <EyeOff size={12} />
            {label.ar}
          </span>
        </div>
      )}
      {children}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-[58] border-2 transition-all duration-200",
          selected
            ? "border-emerald-400 bg-emerald-400/5 ring-2 ring-emerald-400/25"
            : "border-transparent group-hover/vesection:border-emerald-400/60"
        )}
      />
      <button
        type="button"
        draggable
        onClick={onSelect}
        onDragStart={(e) => {
          e.stopPropagation();
          e.dataTransfer.setData("text/plain", instance.instanceId);
          e.dataTransfer.effectAllowed = "move";
        }}
        className={cn(
          "absolute top-3 start-3 z-[62] inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold shadow-lg cursor-grab active:cursor-grabbing",
          "bg-emerald-500 text-[#051741]",
          selected ? "opacity-100" : "opacity-80 group-hover/vesection:opacity-100"
        )}
        data-builder-chrome=""
        data-builder-field="section.handle"
        title="Drag to reorder"
      >
        <GripVertical size={13} />
        {label.ar}
      </button>
      <div
        dir="ltr"
        data-section-toolbar=""
        data-editor-section-toolbar=""
        data-inline-toolbar=""
        data-builder-chrome=""
        className={cn(
          "sw-toolbar pointer-events-auto absolute top-3 end-3 z-[2147483000] flex items-center gap-0.5 rounded-lg bg-[#111318] p-1 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.65)] ring-1 ring-white/10",
          selected ? "opacity-100" : "opacity-0 group-hover/vesection:opacity-100"
        )}
      >
        {(
          [
            ["delete", Trash2, t.editor.sectionDelete, false],
            ["duplicate", Copy, t.editor.sectionDuplicate, false],
            ["settings", Settings2, t.editor.sectionSettings, false],
            ["toggleVisibility", instance.hidden ? Eye : EyeOff, instance.hidden ? t.editor.show : t.editor.hide, false],
            ["addAfter", Plus, t.editor.addSection, false],
            ["moveUp", ChevronUp, t.editor.sectionMoveUp, !canMoveUp],
            ["moveDown", ChevronDown, t.editor.sectionMoveDown, !canMoveDown],
          ] as const
        ).map(([action, Icon, title, disabled]) => (
          <button
            key={action}
            type="button"
            title={title}
            aria-label={title}
            disabled={disabled}
            data-section-action={action}
            data-instance-id={instance.instanceId}
            data-builder-field={`section.${action}`}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            onClick={(e) => onToolbarAction(e, action)}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md text-white hover:bg-white/15",
              disabled && "pointer-events-none opacity-30"
            )}
          >
            <Icon size={13} aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function sectionSurface(instance: HomepageSectionInstance, fallback: string) {
  return instance.styles.background || fallback;
}

export function sectionAccent(instance: HomepageSectionInstance, fallback = "#10b981") {
  return instance.styles.accent || fallback;
}

export function sectionText(instance: HomepageSectionInstance, fallback: string) {
  return instance.styles.textColor || fallback;
}

/* Agent B: public homepage content — same gutters as destinations / packages / why-us */
export const HOME_CONTAINER_CLASS = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

export function HomeContainer({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("home-container", HOME_CONTAINER_CLASS, className)}>{children}</div>;
}

export const brandButtonClass =
  "theme-brand-btn inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold shadow-[0_10px_22px_-12px_color-mix(in_srgb,var(--brand-button)_70%,transparent)] transition disabled:opacity-50";

export function brandButtonStyle(): {
  backgroundColor: string;
  borderRadius: string;
  color: string;
  boxShadow: string;
} {
  return {
    backgroundColor: "var(--brand-button)",
    borderRadius: "var(--radius-button)",
    color: "var(--theme-btn-text)",
    boxShadow: "var(--theme-btn-shadow)",
  };
}
