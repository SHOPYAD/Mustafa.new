"use client";

import { useCopilotAction } from "@copilotkit/react-core";
import type { CopilotScope } from "@/lib/builder-agent/types";

export function useScopedPersistMemory(scope: CopilotScope) {
  useCopilotAction({
    name: "persistMemory",
    description: `Save a short note for the ${scope} agent only. Never mix with other admin domains.`,
    parameters: [{ name: "note", type: "string", required: true }],
    handler: async ({ note }: { note: string }) => {
      const res = await fetch("/api/admin/builder-agent", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addMemory", note, scope }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      return data.ok ? `Remembered for ${scope}: ${note}` : data.error || "Could not save memory.";
    },
  });
}
