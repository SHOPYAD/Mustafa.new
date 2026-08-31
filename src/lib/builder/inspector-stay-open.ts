/* Agent E: settings panel + card design */

const INSPECTOR_SURFACE =
  "[data-editor-inspector], [data-editor-popover], [data-media-picker-panel]";

let interactingUntil = 0;

export function markInspectorInteraction(ms = 800): void {
  interactingUntil = Date.now() + ms;
}

export function isInspectorInteracting(): boolean {
  return Date.now() < interactingUntil;
}

export function isInspectorEventTarget(target: EventTarget | null): boolean {
  if (isInspectorInteracting()) return true;
  if (!(target instanceof Element)) {
    if (typeof document === "undefined") return false;
    if (target === document.documentElement || target === document.body) {
      const active = document.activeElement;
      if (active instanceof Element && active.closest(INSPECTOR_SURFACE)) return true;
      if (active instanceof HTMLElement && active.matches("input[type=color], input[type=file]")) {
        return true;
      }
    }
    return false;
  }
  if (target.closest(INSPECTOR_SURFACE)) return true;
  if (target.closest("input[type='color'], input[type='file']")) return true;
  return false;
}
