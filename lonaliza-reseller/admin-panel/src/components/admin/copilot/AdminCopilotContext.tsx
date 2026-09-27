"use client";

import { createContext, useContext } from "react";
import type { CopilotScope } from "@/lib/builder-agent/types";
import type { CopilotMode } from "./copilot-mode";

export type AdminCopilotContextValue = {
  scope: CopilotScope;
  enabled: boolean;
  hasGeminiKey: boolean | null;
  runtimeOk: boolean | null;
  mode: CopilotMode;
  setMode: (mode: CopilotMode) => void;
};

export const AdminCopilotContext = createContext<AdminCopilotContextValue>({
  scope: "editor",
  enabled: false,
  hasGeminiKey: null,
  runtimeOk: null,
  mode: "chat",
  setMode: () => undefined,
});

export function useAdminCopilot(): AdminCopilotContextValue {
  return useContext(AdminCopilotContext);
}
