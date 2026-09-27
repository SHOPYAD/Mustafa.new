"use client";

import type { ReactNode } from "react";
import { AdminCopilotProvider } from "@/components/admin/copilot/AdminCopilotProvider";
import { useAdminCopilot } from "@/components/admin/copilot/AdminCopilotContext";
import { AutomationModeGate } from "@/components/admin/copilot/AutomationModeGate";
import { registerEditorCopilotPanel } from "@/components/visual-editor/copilot-slot";
import { EditorCopilotContext } from "./EditorCopilotContext";
import { EditorCopilotPanel } from "./EditorCopilotPanel";

registerEditorCopilotPanel(EditorCopilotPanel);

function EditorCopilotContextBridge({ children }: { children: ReactNode }) {
  const value = useAdminCopilot();
  return (
    <EditorCopilotContext.Provider value={{ enabled: value.enabled, hasGeminiKey: value.hasGeminiKey }}>
      {children}
    </EditorCopilotContext.Provider>
  );
}

export function EditorCopilotProvider({ children }: { children: ReactNode }) {
  return (
    <AdminCopilotProvider scope="editor">
      <AutomationModeGate />
      <EditorCopilotContextBridge>{children}</EditorCopilotContextBridge>
    </AdminCopilotProvider>
  );
}
