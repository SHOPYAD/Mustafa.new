"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import type { CopilotScope } from "@/lib/builder-agent/types";
import { AdminCopilotContext } from "./AdminCopilotContext";
import type { CopilotMode } from "./copilot-mode";
import { probeCopilotHealth } from "./use-copilot-watchdog";

export function AdminCopilotProvider({
  scope,
  children,
  defaultMode = "chat",
}: {
  scope: CopilotScope;
  children: ReactNode;
  defaultMode?: CopilotMode;
}) {
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean | null>(null);
  const [runtimeOk, setRuntimeOk] = useState<boolean | null>(null);
  const [mode, setMode] = useState<CopilotMode>(defaultMode);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/admin/builder-agent?scope=${encodeURIComponent(scope)}`, {
      credentials: "same-origin",
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data: { hasGeminiKey?: boolean }) => {
        if (!cancelled) setHasGeminiKey(Boolean(data.hasGeminiKey));
      })
      .catch(() => {
        if (!cancelled) setHasGeminiKey(false);
      });
    void probeCopilotHealth(scope).then((ok) => {
      if (!cancelled) setRuntimeOk(ok);
    });
    return () => {
      cancelled = true;
    };
  }, [scope]);

  const enabled = hasGeminiKey === true;

  return (
    <AdminCopilotContext.Provider value={{ scope, enabled, hasGeminiKey, runtimeOk, mode, setMode }}>
      <CopilotKit
        key={`copilot-${scope}-${mode}`}
        runtimeUrl="/api/copilotkit"
        headers={{ "x-copilot-scope": scope, "x-copilot-mode": mode }}
        credentials="same-origin"
        threadId={`admin-copilot-${scope}-${mode}`}
        showDevConsole={false}
        useSingleEndpoint
        agent="default"
        onError={(event) => {
          const message =
            event instanceof Error
              ? event.message
              : event && typeof event === "object" && "error" in event && event.error instanceof Error
                ? event.error.message
                : "Gemini request failed";
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("alrayyan:copilot-error", { detail: { message } }));
          }
        }}
      >
        {children}
      </CopilotKit>
    </AdminCopilotContext.Provider>
  );
}
