"use client";

import { useEffect } from "react";
import { useBuilderStore, type BuilderPanel } from "./editor-store";
import { isInspectorEventTarget, isInspectorInteracting } from "./inspector-stay-open";

export function useBuilderShortcuts({ onSave }: { onSave: () => void }) {
  useEffect(() => {
    const isEditable = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (el.isContentEditable) return true;
      return false;
    };

    const handler = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        useBuilderStore.temporal.getState().undo();
        return;
      }
      if ((meta && e.key.toLowerCase() === "z" && e.shiftKey) || (meta && e.key.toLowerCase() === "y")) {
        e.preventDefault();
        useBuilderStore.temporal.getState().redo();
        return;
      }
      if (meta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSave();
        return;
      }
      /* Agent E: settings panel + card design */
      if (e.key === "Escape") {
        if (isEditable(e.target) || isInspectorEventTarget(e.target) || isInspectorInteracting()) {
          return;
        }
        useBuilderStore.getState().setSelectedElement(null);
        return;
      }
      if (!isEditable(e.target)) {
        const map: Record<string, BuilderPanel> = {
          "1": "pages",
          "2": "sections",
          "3": "layout",
          "4": "design",
          "5": "history",
          "6": "ai",
          "7": "settings",
        };
        const panel = map[e.key];
        if (panel) {
          useBuilderStore.getState().setActivePanel(panel);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSave]);
}
