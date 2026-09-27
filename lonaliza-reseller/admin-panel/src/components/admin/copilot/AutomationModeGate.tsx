"use client";

import type { ReactNode } from "react";
import { AutomationCopilotTools } from "./automation-tools";
import { useAdminCopilot } from "./AdminCopilotContext";

export function AutomationModeGate({ children }: { children?: ReactNode }) {
  const { mode } = useAdminCopilot();
  if (mode === "automation") return <AutomationCopilotTools />;
  return <>{children}</>;
}
