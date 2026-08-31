"use client";

import { createContext, useContext } from "react";

export type EditorCopilotContextValue = {
  enabled: boolean;
  hasGeminiKey: boolean | null;
};

export const EditorCopilotContext = createContext<EditorCopilotContextValue>({
  enabled: false,
  hasGeminiKey: null,
});

export function useEditorCopilotEnabled(): EditorCopilotContextValue {
  return useContext(EditorCopilotContext);
}
