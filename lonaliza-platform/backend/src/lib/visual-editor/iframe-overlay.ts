/**
 * Builder overlay injected into the homepage iframe.
 * Ports Lio Trip's click-guard + hover toolbar + inline double-click edit
 * without touching storefront section components.
 */
/* Agent A: editor chrome only */

import {
  EDITOR_CHROME_SELECTOR,
  isEditorChromeTarget,
  readSectionToolbarAction,
} from "./section-toolbar";
import {
  applyBoundProp,
  applyElementOverridesToDocument,
  inferFieldFromBuilderId,
  readDomField,
} from "./live-bind";

const OVERLAY_STYLE_ID = "alrayyan-builder-overlay-styles";

function cssText(): string {
  return `
    html[data-builder-mode="true"] a[href]:not([href^="#"]),
    html[data-builder-mode="true"] button[type="submit"],
    html[data-builder-mode="true"] [data-builder-clickable="true"] {
      cursor: pointer !important;
    }
    html[data-builder-mode="true"] a[href]:not([href^="#"]) {
      pointer-events: auto !important;
    }
    @keyframes alrayyan-hero-card-up {
      from { opacity: 0; transform: translateY(28px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .builder-hover-active {
      outline: 2px dashed #6366f1 !important;
      outline-offset: 2px;
      cursor: pointer !important;
    }
    .builder-selected {
      outline: 2px solid #6366f1 !important;
      outline-offset: 2px;
      box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15) !important;
    }
    .builder-element-label {
      position: fixed;
      background: #6366f1;
      color: #fff;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 3px;
      z-index: 99999;
      pointer-events: none;
      white-space: nowrap;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      line-height: 16px;
    }
    [data-builder-id] { pointer-events: auto !important; cursor: pointer !important; }
    html[data-builder-mode="true"] form { pointer-events: auto; }
    ${EDITOR_CHROME_SELECTOR} {
      pointer-events: auto !important;
      z-index: 2147483000;
    }
    ${EDITOR_CHROME_SELECTOR} button,
    [data-section-action] {
      pointer-events: auto !important;
      cursor: pointer !important;
    }
  `;
}

const SELECTABLE_TAGS = new Set([
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "P",
  "SPAN",
  "A",
  "BUTTON",
  "IMG",
  "LI",
  "LABEL",
  "BLOCKQUOTE",
  "FIGCAPTION",
  "TD",
  "TH",
  "STRONG",
  "EM",
  "B",
  "I",
  "U",
  "SMALL",
  "FIGURE",
  "SECTION",
  "DIV",
]);

function closestSelectable(target: EventTarget | null): HTMLElement | null {
  const node = target as { nodeType?: number; parentElement?: Element | null } | null;
  if (node?.nodeType === 3) return closestSelectable(node.parentElement || null);
  const start =
    target && typeof target === "object" && "tagName" in target ? (target as HTMLElement) : null;
  if (!start || typeof start.closest !== "function") return null;
  if (isEditorChromeTarget(start)) return null;
  /* Agent L2: live inspector bind — prefer a bound leaf over a generic wrapper */
  const bound = start.closest(
    "[data-field], [data-builder-field], [data-builder-id]:not([data-section-id])"
  ) as HTMLElement | null;
  if (bound && !isEditorChromeTarget(bound)) return bound;
  let el: HTMLElement | null = start;
  while (el && el.tagName !== "BODY" && el.tagName !== "HTML") {
    if (isEditorChromeTarget(el)) return null;
    if (el.hasAttribute?.("data-section-id")) {
      const nested =
        (el.querySelector(
          "[data-field], [data-builder-field], [data-builder-id]:not([data-section-id])"
        ) as HTMLElement | null) || null;
      return nested || el;
    }
    if (el.hasAttribute?.("data-builder-id") || SELECTABLE_TAGS.has(el.tagName)) return el;
    el = el.parentElement;
  }
  const section = start.closest("[data-section-id]") as HTMLElement | null;
  return section;
}

function snapshotStyles(el: HTMLElement): Record<string, string> {
  const cs = window.getComputedStyle(el);
  return {
    fontSize: cs.fontSize,
    fontWeight: cs.fontWeight,
    color: cs.color,
    backgroundColor: cs.backgroundColor,
    fontFamily: cs.fontFamily,
    textAlign: cs.textAlign,
    padding: cs.padding,
    paddingTop: cs.paddingTop,
    paddingRight: cs.paddingRight,
    paddingBottom: cs.paddingBottom,
    paddingLeft: cs.paddingLeft,
    marginTop: cs.marginTop,
    marginRight: cs.marginRight,
    marginBottom: cs.marginBottom,
    marginLeft: cs.marginLeft,
    borderRadius: cs.borderRadius,
    borderTopLeftRadius: cs.borderTopLeftRadius,
    borderTopRightRadius: cs.borderTopRightRadius,
    borderBottomRightRadius: cs.borderBottomRightRadius,
    borderBottomLeftRadius: cs.borderBottomLeftRadius,
    borderWidth: cs.borderWidth,
    borderStyle: cs.borderStyle,
    borderColor: cs.borderColor,
    lineHeight: cs.lineHeight,
    letterSpacing: cs.letterSpacing,
    opacity: cs.opacity,
    className: String(el.className || ""),
    backgroundImage: cs.backgroundImage,
    backgroundSize: cs.backgroundSize,
    backgroundRepeat: cs.backgroundRepeat,
    backgroundPosition: cs.backgroundPosition,
    display: cs.display,
    flexDirection: cs.flexDirection,
    flexWrap: cs.flexWrap,
    justifyContent: cs.justifyContent,
    alignItems: cs.alignItems,
    gap: cs.gap,
    direction: cs.direction,
    boxShadow: cs.boxShadow,
    width: cs.width,
    height: cs.height,
    position: cs.position,
    zIndex: cs.zIndex,
    placeholder:
      el.tagName === "INPUT" || el.tagName === "TEXTAREA"
        ? (el as HTMLInputElement).placeholder || ""
        : "",
  };
}

function applyStyleToElement(el: HTMLElement, prop: string, value: string) {
  /* Agent L2: live inspector bind */
  applyBoundProp(el, prop, value);
}

export function installBuilderOverlay(win: Window): () => void {
  const doc = win.document;
  (win as Window & { __IS_BUILDER_MODE__?: boolean }).__IS_BUILDER_MODE__ = true;
  doc.documentElement.setAttribute("data-builder-mode", "true");

  let style = doc.getElementById(OVERLAY_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = doc.createElement("style");
    style.id = OVERLAY_STYLE_ID;
    style.textContent = cssText();
    doc.head.appendChild(style);
  }
  if (!doc.getElementById("alrayyan-iconsax")) {
    const font = doc.createElement("link");
    font.id = "alrayyan-iconsax";
    font.rel = "stylesheet";
    font.href = "/vendor-icons/iconsax.css";
    doc.head.appendChild(font);
  }

  let hoverEl: HTMLElement | null = null;
  let selectedEl: HTMLElement | null = null;
  let labelEl: HTMLElement | null = null;
  let editingEl: HTMLElement | null = null;

  const ensureLabel = () => {
    if (labelEl) return labelEl;
    labelEl = doc.createElement("div");
    labelEl.className = "builder-element-label";
    doc.body.appendChild(labelEl);
    return labelEl;
  };

  const placeLabel = (el: HTMLElement, text: string) => {
    const label = ensureLabel();
    const rect = el.getBoundingClientRect();
    label.textContent = text;
    label.style.top = `${Math.max(8, rect.top - 20)}px`;
    label.style.left = `${Math.max(8, rect.left)}px`;
  };

  const selectElement = (el: HTMLElement) => {
    if (selectedEl) selectedEl.classList.remove("builder-selected");
    selectedEl = el;
    el.classList.add("builder-selected");
    const instanceWrap = el.closest("[data-section-id], [data-instance-id]") as HTMLElement | null;
    const instanceId =
      el.getAttribute("data-instance-id") ||
      instanceWrap?.getAttribute("data-section-id") ||
      instanceWrap?.getAttribute("data-instance-id") ||
      "";
    const sectionType =
      el.getAttribute("data-section-type") ||
      instanceWrap?.getAttribute("data-section-type") ||
      "";
    /* Agent L2: live inspector bind */
    let field = readDomField(el);
    const isSectionWrap =
      el.hasAttribute("data-section-id") && el.getAttribute("data-section-id") === instanceId;
    if (isSectionWrap && !field) {
      const leaf = el.querySelector(
        "[data-field], [data-builder-field], [data-builder-id]:not([data-section-id])"
      ) as HTMLElement | null;
      if (leaf) field = readDomField(leaf) || inferFieldFromBuilderId(leaf.getAttribute("data-builder-id") || "", instanceId);
    }
    const rawBuilderId = el.getAttribute("data-builder-id") || "";
    if (!field) field = inferFieldFromBuilderId(rawBuilderId, instanceId);
    const builderId =
      rawBuilderId ||
      (instanceId && field ? `${instanceId}.${field}` : instanceId || el.tagName.toLowerCase());
    if (!field) field = inferFieldFromBuilderId(builderId, instanceId);
    let src = "";
    const img =
      el instanceof HTMLImageElement ? el : (el.querySelector("img") as HTMLImageElement | null);
    if (img) src = img.currentSrc || img.src;
    const cs = win.getComputedStyle(el);
    if (!src && cs.backgroundImage && cs.backgroundImage !== "none") {
      const m = cs.backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
      if (m) src = m[1];
    }
    const textLeaf =
      (el.querySelector("[data-builder-text]") as HTMLElement | null) ||
      (field && !isSectionWrap ? el : null);
    const text = ((textLeaf || el).innerText || "").trim().slice(0, 500);
    win.parent.postMessage(
      {
        type: "elementSelected",
        id: builderId,
        sectionType,
        sectionInstanceId: instanceId,
        instanceId,
        text,
        tagName: img ? "IMG" : el.tagName,
        tag: img ? "IMG" : el.tagName,
        label: field || el.tagName.toLowerCase(),
        src,
        field,
        isInsideButton: Boolean(el.closest("button, a.btn, [role='button']")),
        currentStyles: snapshotStyles(el),
      },
      win.location.origin
    );
    placeLabel(el, field || el.tagName.toLowerCase());
  };

  let lastToolbarEmit = { key: "", at: 0 };

  const dispatchToolbarAction = (target: EventTarget | null, e?: Event) => {
    const action = readSectionToolbarAction(target);
    if (!action) return false;
    e?.preventDefault();
    e?.stopPropagation();
    if (e && "stopImmediatePropagation" in e) e.stopImmediatePropagation();
    const key = `${action.action}:${action.instanceId}`;
    const now = Date.now();
    if (lastToolbarEmit.key === key && now - lastToolbarEmit.at < 280) return true;
    lastToolbarEmit = { key, at: now };
    win.parent.postMessage(
      {
        type: "sectionAction",
        action: action.action,
        layoutKey: "layout",
        instanceId: action.instanceId,
        sectionType: action.action === "addAfter" ? "contact" : undefined,
      },
      win.location.origin
    );
    return true;
  };

  const handleClick = (e: Event) => {
    if (dispatchToolbarAction(e.target, e)) return;
    if (isEditorChromeTarget(e.target)) return;
    const target = e.target as HTMLElement | null;
    const clickable =
      target?.closest?.("a") ||
      target?.closest?.("button") ||
      target?.closest?.('[role="button"]');
    if (clickable) {
      const href = (clickable as HTMLElement).getAttribute("href");
      const isInternal =
        (href && (href.startsWith("#") || href.startsWith("javascript:"))) ||
        (clickable as HTMLElement).getAttribute("role") === "tab";
      if (!isInternal) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
    if (editingEl) return;
    let el = closestSelectable(e.target);
    /* Agent L2: live inspector bind — never clear while the click is inside a section */
    if (!el) {
      const sectionHost = (e.target as HTMLElement | null)?.closest?.(
        "[data-section-id], [data-builder-id]"
      ) as HTMLElement | null;
      if (sectionHost && !isEditorChromeTarget(sectionHost)) el = sectionHost;
    }
    /* Agent E: settings panel + card design */
    if (!el) {
      const inSelected =
        selectedEl &&
        (e.target instanceof Node ? selectedEl.contains(e.target) : false);
      if (inSelected) return;
      if (selectedEl) {
        selectedEl.classList.remove("builder-selected");
        selectedEl = null;
      }
      win.parent.postMessage(
        { type: "elementSelected", id: "", sectionInstanceId: "", instanceId: "" },
        win.location.origin
      );
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    if (el === selectedEl) return;
    selectElement(el);
  };

  const handlePointerDown = (e: Event) => {
    if (!readSectionToolbarAction(e.target) && !isEditorChromeTarget(e.target)) return;
    e.stopPropagation();
    if ("stopImmediatePropagation" in e) e.stopImmediatePropagation();
  };

  const handleMouseOver = (e: Event) => {
    const el = closestSelectable(e.target);
    if (!el || el === selectedEl) return;
    if (hoverEl && hoverEl !== el) hoverEl.classList.remove("builder-hover-active");
    hoverEl = el;
    el.classList.add("builder-hover-active");
    placeLabel(el, el.getAttribute("data-field") || el.tagName.toLowerCase());
  };

  const handleMouseOut = (e: Event) => {
    const el = closestSelectable(e.target);
    if (el && el === hoverEl) {
      el.classList.remove("builder-hover-active");
      hoverEl = null;
    }
  };

  const commitEdit = () => {
    if (!editingEl) return;
    const el = editingEl;
    el.removeAttribute("contenteditable");
    el.style.outline = "";
    editingEl = null;
    const instanceId = el.getAttribute("data-instance-id") || "";
    const field = el.getAttribute("data-field") || "";
    const value = (el.innerText || "").replace(/\n+$/, "").trim();
    win.parent.postMessage(
      {
        type: "inlineEditCommit",
        id: el.getAttribute("data-builder-id") || "",
        instanceId,
        field,
        html: el.innerHTML,
        plainText: value,
      },
      win.location.origin
    );
  };

  const handleDblClick = (e: Event) => {
    const el = closestSelectable(e.target);
    if (!el) return;
    if (!["H1", "H2", "H3", "H4", "H5", "H6", "P", "SPAN", "A", "BUTTON", "LABEL", "LI"].includes(el.tagName)) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    selectElement(el);
    editingEl = el;
    el.setAttribute("contenteditable", "true");
    el.style.outline = "2px solid #34d399";
    el.focus();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!editingEl) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      commitEdit();
    }
    if (e.key === "Escape") {
      editingEl.removeAttribute("contenteditable");
      editingEl.style.outline = "";
      editingEl = null;
    }
  };

  const handleBlur = () => {
    if (editingEl) commitEdit();
  };

  const preventSubmit = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onMessage = (e: MessageEvent) => {
    if (e.origin !== win.location.origin) return;
    const data = e.data;
    if (!data || typeof data !== "object") return;
    if (data.type === "styleChange" && typeof data.id === "string") {
      /* Agent L2: live inspector bind */
      let safeId = data.id;
      try {
        safeId = CSS.escape(data.id);
      } catch {
        safeId = data.id;
      }
      const el =
        (doc.querySelector(`[data-builder-id="${safeId}"]`) as HTMLElement | null) ||
        selectedEl;
      if (el && typeof data.prop === "string") applyStyleToElement(el, data.prop, String(data.value ?? ""));
    }
    if (data.type === "themeUpdate" || data.type === "alrayyan-ve-template") {
      const draft = data.theme || data.draft;
      /* Agent L2: live inspector bind */
      applyElementOverridesToDocument(
        doc,
        draft?.elementOverrides && typeof draft.elementOverrides === "object"
          ? (draft.elementOverrides as Record<string, Record<string, unknown>>)
          : undefined
      );
      if (selectedEl && !doc.contains(selectedEl)) {
        selectedEl = null;
        if (labelEl) labelEl.style.display = "none";
      }
    }
    if (data.type === "selectElement" || data.type === "selectSection") {
      const requestedId = typeof data.id === "string" ? data.id : "";
      const instanceId =
        (typeof data.instanceId === "string" && data.instanceId) ||
        requestedId ||
        "";
      const sectionType = typeof data.sectionType === "string" ? data.sectionType : "";
      /* Agent L2: live inspector bind — rematch the leaf id first, not the section wrap */
      const el =
        (requestedId
          ? (doc.querySelector(`[data-builder-id="${CSS.escape(requestedId)}"]`) as HTMLElement | null)
          : null) ||
        (instanceId
          ? (doc.querySelector(
              `[data-section-id="${CSS.escape(instanceId)}"], [data-instance-id="${CSS.escape(instanceId)}"], [data-builder-id="${CSS.escape(instanceId)}"]`
            ) as HTMLElement | null)
          : null) ||
        (sectionType
          ? (doc.querySelector(`[data-section-type="${CSS.escape(sectionType)}"]`) as HTMLElement | null)
          : null);
      if (el) {
        selectElement(el);
        win.dispatchEvent(
          new CustomEvent("alrayyan:ve-section-selected", {
            detail: { instanceId: instanceId || el.getAttribute("data-section-id") },
          })
        );
      }
    }
  };

  doc.addEventListener("click", handleClick, true);
  doc.addEventListener("pointerdown", handlePointerDown, true);
  doc.addEventListener("mouseover", handleMouseOver, true);
  doc.addEventListener("mouseout", handleMouseOut, true);
  doc.addEventListener("dblclick", handleDblClick, true);
  doc.addEventListener("keydown", handleKeyDown, true);
  doc.addEventListener("focusout", handleBlur, true);
  doc.addEventListener("submit", preventSubmit, true);
  win.addEventListener("message", onMessage);
  win.parent.postMessage({ type: "builderReady" }, win.location.origin);

  return () => {
    (win as Window & { __IS_BUILDER_MODE__?: boolean }).__IS_BUILDER_MODE__ = false;
    doc.documentElement.removeAttribute("data-builder-mode");
    doc.removeEventListener("click", handleClick, true);
    doc.removeEventListener("pointerdown", handlePointerDown, true);
    doc.removeEventListener("mouseover", handleMouseOver, true);
    doc.removeEventListener("mouseout", handleMouseOut, true);
    doc.removeEventListener("dblclick", handleDblClick, true);
    doc.removeEventListener("keydown", handleKeyDown, true);
    doc.removeEventListener("focusout", handleBlur, true);
    doc.removeEventListener("submit", preventSubmit, true);
    win.removeEventListener("message", onMessage);
    style?.remove();
    labelEl?.remove();
  };
}

export function injectOverlayIntoIframe(iframe: HTMLIFrameElement | null): () => void {
  const win = iframe?.contentWindow;
  if (!win || !iframe.contentDocument) return () => {};
  return installBuilderOverlay(win);
}
