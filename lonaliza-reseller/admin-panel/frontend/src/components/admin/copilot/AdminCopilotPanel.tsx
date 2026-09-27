"use client";

import type { CopilotScope } from "@/lib/builder-agent/types";
import type { CopilotMode } from "./copilot-mode";
import { AdminCopilotProvider } from "./AdminCopilotProvider";
import { AdminCopilotChat, type FallbackChatFn } from "./AdminCopilotChat";
import { AutomationModeGate } from "./AutomationModeGate";
import { AdminScopeTools, type AdminCopilotHost } from "./scope-tools";
import { AutomationModeBanner } from "./AutomationModeBanner";

export function AdminCopilotPanel({
  scope,
  title,
  hint,
  placeholder,
  host,
  fallback,
  className,
  defaultMode = "chat",
}: {
  scope: CopilotScope;
  title: string;
  hint?: string;
  placeholder?: string;
  host?: AdminCopilotHost;
  fallback?: FallbackChatFn;
  className?: string;
  defaultMode?: CopilotMode;
}) {
  return (
    <AdminCopilotProvider scope={scope} defaultMode={defaultMode}>
      <AutomationModeBanner />
      <AutomationModeGate>
        <AdminScopeTools scope={scope} host={host} />
      </AutomationModeGate>
      <AdminCopilotChat
        title={title}
        hint={hint}
        placeholder={placeholder}
        fallback={fallback}
        className={className}
      />
    </AdminCopilotProvider>
  );
}
