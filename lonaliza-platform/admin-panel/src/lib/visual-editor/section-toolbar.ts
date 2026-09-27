/* Agent A: editor chrome only */

export const EDITOR_CHROME_SELECTOR = [
  ".sw-toolbar",
  "[data-inline-toolbar]",
  "[data-builder-chrome]",
  "[data-section-toolbar]",
  "[data-editor-section-toolbar]",
].join(", ");

export const SECTION_ACTION_SELECTOR = "[data-section-action]";

export const SECTION_TOOLBAR_ACTIONS = [
  "moveUp",
  "moveDown",
  "duplicate",
  "delete",
  "toggleVisibility",
  "addAfter",
  "move",
  "copy",
  "paste",
  "settings",
] as const;

export type SectionToolbarAction = (typeof SECTION_TOOLBAR_ACTIONS)[number];

export function isSectionToolbarAction(value: string): value is SectionToolbarAction {
  return (SECTION_TOOLBAR_ACTIONS as readonly string[]).includes(value);
}

function asElement(target: EventTarget | null): Element | null {
  if (!target || typeof target !== "object") return null;
  if (!("closest" in target) || typeof (target as Element).closest !== "function") return null;
  return target as Element;
}

export function isEditorChromeTarget(target: EventTarget | null): boolean {
  const el = asElement(target);
  return Boolean(el?.closest(EDITOR_CHROME_SELECTOR));
}

export function readSectionToolbarAction(target: EventTarget | null): {
  action: SectionToolbarAction;
  instanceId: string;
} | null {
  const el = asElement(target);
  if (!el) return null;
  const btn = el.closest(SECTION_ACTION_SELECTOR);
  if (!btn) return null;
  const action = btn.getAttribute("data-section-action") || "";
  const instanceId =
    btn.getAttribute("data-instance-id") ||
    btn.closest("[data-section-id], [data-instance-id]")?.getAttribute("data-section-id") ||
    btn.closest("[data-instance-id]")?.getAttribute("data-instance-id") ||
    "";
  if (!instanceId || !isSectionToolbarAction(action)) return null;
  return { action, instanceId };
}
