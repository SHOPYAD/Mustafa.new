"use client";

import type { ComponentType, ReactNode } from "react";
import { EditorCopilotPanel as SiblingEditorCopilotPanel } from "@/components/editor/EditorCopilotPanel";

type CopilotPanel = ComponentType<Record<string, never>>;

/** Sibling A registers here from EditorCopilotProvider; the named export is also imported above. */
export let EditorCopilotPanel: CopilotPanel | null = SiblingEditorCopilotPanel;

export function registerEditorCopilotPanel(panel: CopilotPanel) {
  EditorCopilotPanel = panel;
}

export function EditorCopilotSlot({ fallback }: { fallback: ReactNode }) {
  const Panel = EditorCopilotPanel || SiblingEditorCopilotPanel;
  if (Panel) return <Panel />;
  return (
    <div data-editor-copilot-mount="1" className="flex h-full min-h-0 flex-col">
      {fallback}
    </div>
  );
}
