/* Agent A: editor chrome only — settings action + message types */
import type { Locale } from "@/lib/i18n/types";
import type { HomepageSectionType, HomepageTemplateDraft } from "./schema";

export const VE_SELECT = "alrayyan-ve-select" as const;
export const VE_TEXT = "alrayyan-ve-text" as const;
export const VE_READY = "alrayyan-ve-ready" as const;
export const VE_TEMPLATE = "alrayyan-ve-template" as const;
export const VE_LOCALE = "alrayyan-ve-locale" as const;
export const VE_REFRESH = "alrayyan-ve-refresh" as const;

export type VisualEditorSelection = {
  type: typeof VE_SELECT;
  instanceId: string;
  sectionType: HomepageSectionType;
  field?: string;
  text?: string;
  labelAr: string;
  labelEn: string;
  labelTr: string;
  src?: string;
  tagName?: string;
  currentStyles?: Record<string, string>;
};

export type VisualEditorTextCommit = {
  type: typeof VE_TEXT;
  instanceId: string;
  field: string;
  locale: Locale;
  value: string;
};

export type VisualEditorReady = {
  type: typeof VE_READY;
};

export type VisualEditorTemplateMessage = {
  type: typeof VE_TEMPLATE;
  draft: HomepageTemplateDraft;
  locale: Locale;
};

export type VisualEditorLocaleMessage = {
  type: typeof VE_LOCALE;
  locale: Locale;
};

export type VisualEditorRefreshMessage = {
  type: typeof VE_REFRESH;
};

/** Lio-compatible outbound messages from the shell → iframe. */
export type OutboundMessage =
  | { type: "themeUpdate"; theme?: HomepageTemplateDraft; locale?: string }
  | { type: "localeUpdate"; locale: string; dir?: "ltr" | "rtl" }
  | { type: "deviceChange"; device: "desktop" | "tablet" | "mobile" }
  | { type: "selectElement"; id: string; instanceId?: string }
  | { type: "selectSection"; sectionType: string }
  | { type: "requestBuilderReady" }
  | { type: "styleChange"; id: string; prop: string; value: string; instanceId?: string }
  | VisualEditorTemplateMessage
  | VisualEditorLocaleMessage
  | VisualEditorRefreshMessage;

export type InboundSectionAction = {
  type: "sectionAction";
  action:
    | "moveUp"
    | "moveDown"
    | "duplicate"
    | "delete"
    | "toggleVisibility"
    | "addAfter"
    | "move"
    | "copy"
    | "paste"
    | "settings";
  layoutKey: string;
  instanceId: string;
  targetInstanceId?: string;
  position?: "before" | "after";
  sectionType?: string;
  sectionLabel?: string;
};

export type InboundSectionMove = {
  type: "section-move";
  instanceId: string;
  targetInstanceId: string;
  position: "before" | "after";
  layoutKey?: string;
};

export type InboundMessage =
  | { type: "builderReady" }
  | VisualEditorReady
  | VisualEditorSelection
  | VisualEditorTextCommit
  | InboundSectionAction
  | InboundSectionMove
  | {
      type: "elementSelected";
      id: string;
      sectionType?: string;
      sectionInstanceId?: string;
      text?: string;
      tagName?: string;
      label?: string;
      src?: string;
      field?: string;
      currentStyles?: Record<string, string>;
      tag?: string;
      sectionKey?: string;
      instanceId?: string;
      isInsideButton?: boolean;
    }
  | {
      type: "inlineEditCommit";
      id: string;
      instanceId?: string;
      html: string;
      plainText: string;
      field?: string;
    }
  | { type: "inlineEditCancel" }
  | { type: "sectionDragEdge"; direction: "up" | "down"; speed?: number };

export type VisualEditorChildMessage =
  | VisualEditorSelection
  | VisualEditorTextCommit
  | VisualEditorReady
  | InboundSectionAction
  | InboundSectionMove
  | Extract<InboundMessage, { type: "builderReady" } | { type: "elementSelected" }>;

export type VisualEditorParentMessage = OutboundMessage;

export function isVeSelection(data: unknown): data is VisualEditorSelection {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return d.type === VE_SELECT && typeof d.instanceId === "string" && typeof d.sectionType === "string";
}

export function isVeTextCommit(data: unknown): data is VisualEditorTextCommit {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    d.type === VE_TEXT &&
    typeof d.instanceId === "string" &&
    typeof d.field === "string" &&
    typeof d.value === "string"
  );
}

export function isVeReady(data: unknown): data is VisualEditorReady {
  return Boolean(data && typeof data === "object" && (data as { type?: string }).type === VE_READY);
}

export function isVeTemplate(data: unknown): data is VisualEditorTemplateMessage {
  return Boolean(data && typeof data === "object" && (data as { type?: string }).type === VE_TEMPLATE);
}

export function isVeLocale(data: unknown): data is VisualEditorLocaleMessage {
  return Boolean(data && typeof data === "object" && (data as { type?: string }).type === VE_LOCALE);
}

export function isThemeUpdate(
  data: unknown
): data is { type: "themeUpdate"; theme?: HomepageTemplateDraft; locale?: string } {
  return Boolean(data && typeof data === "object" && (data as { type?: string }).type === "themeUpdate");
}

export function postToParent(message: VisualEditorChildMessage) {
  if (typeof window === "undefined") return;
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(message, window.location.origin);
  }
}

export function sendToIframe(iframe: HTMLIFrameElement | null, msg: OutboundMessage): void {
  const win = iframe?.contentWindow;
  if (!win) return;
  try {
    win.postMessage(msg, window.location.origin);
  } catch {
    /* detached */
  }
}

export function postToIframe(iframe: HTMLIFrameElement | null, message: VisualEditorParentMessage) {
  sendToIframe(iframe, message);
}

export function subscribeIframeMessages(
  handler: (msg: InboundMessage) => void,
  getSourceWindow?: () => Window | null
): () => void {
  const listener = (e: MessageEvent) => {
    const expected = getSourceWindow?.() ?? null;
    if (expected && e.source !== expected) return;
    if (e.origin !== window.location.origin) return;
    if (!e.data || typeof e.data !== "object") return;
    const d = e.data as InboundMessage;
    if (
      d.type === "builderReady" ||
      d.type === VE_READY ||
      d.type === VE_SELECT ||
      d.type === VE_TEXT ||
      d.type === "sectionAction" ||
      d.type === "elementSelected" ||
      d.type === "inlineEditCommit" ||
      d.type === "inlineEditCancel" ||
      d.type === "sectionDragEdge" ||
      d.type === "section-move"
    ) {
      handler(d);
    }
  };
  window.addEventListener("message", listener);
  return () => window.removeEventListener("message", listener);
}
