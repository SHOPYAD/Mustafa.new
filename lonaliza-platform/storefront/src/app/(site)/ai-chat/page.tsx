"use client";

import { Suspense } from "react";
import { AdvisorRuntime } from "@/components/chat/advisor/AdvisorRuntime";
import PlannerWorkspace from "@/components/planner/PlannerWorkspace";
import { PlannerProvider } from "@/components/planner/PlannerStore";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { isClientAppMode } from "@/lib/mobile/app-mode";
import { cn } from "@/lib/utils";

function AiChatWorkspace() {
  const { t } = useLocale();
  const native = isClientAppMode();

  return (
    <AdvisorRuntime>
      <PlannerProvider>
        <div
          data-ai-chat-shell=""
          data-planner-shell=""
          data-keep-color="true"
          className={cn(
            "lonaliza-advisor-chat relative box-border flex min-h-0 flex-col overflow-hidden bg-white text-[#1A1438]",
            native
              ? "h-[var(--advisor-vvh,100dvh)] max-h-[var(--advisor-vvh,100dvh)]"
              : "h-[100dvh] max-h-[100dvh]"
          )}
        >
          <div className="relative flex h-full min-h-0 w-full flex-1 flex-col">
            <PlannerWorkspace />
          </div>
          <span className="sr-only">{t.chat.title}</span>
        </div>
      </PlannerProvider>
    </AdvisorRuntime>
  );
}

export default function AiChatPage() {
  return (
    <Suspense
      fallback={
        <div
          data-keep-color="true"
          className="flex min-h-[100dvh] items-center justify-center bg-white text-slate-400"
        >
          ...
        </div>
      }
    >
      <AiChatWorkspace />
    </Suspense>
  );
}
