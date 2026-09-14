"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SalesChatPanel from "@/components/chat/SalesChatPanel";
import SavedProgramsPanel from "@/components/chat/SavedProgramsPanel";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Sparkles } from "lucide-react";
import { isClientAppMode } from "@/lib/mobile/app-mode";
import { cn } from "@/lib/utils";

function AiChatWorkspace() {
  const { t } = useLocale();
  const params = useSearchParams();
  const conversationId = params.get("c") || undefined;
  const native = isClientAppMode();

  return (
    <div
      data-ai-chat-shell=""
      className={cn(
        "relative flex flex-col overflow-hidden bg-[#050d18]",
        native
          ? "h-[calc(100dvh-6rem)] max-h-[calc(100dvh-6rem)] min-h-0"
          : "min-h-[100dvh] pt-24 pb-8"
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(16,185,129,0.10),transparent_50%),radial-gradient(ellipse_at_80%_10%,rgba(14,60,120,0.25),transparent_45%)]"
      />

      <div
        className={cn(
          "relative mx-auto flex w-full max-w-7xl min-h-0 flex-1 flex-col gap-3",
          native ? "px-0" : "px-3 sm:px-5 lg:px-6"
        )}
      >
        {!native && (
          <header className="shrink-0 text-center lg:text-start">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-300/90">
              <Sparkles size={12} />
              {t.admin.brandName}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t.chat.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-white/50 sm:text-base">
              {t.chat.workspaceSubtitle}
            </p>
          </header>
        )}

        <div className={cn("shrink-0", native ? "px-3 pt-2" : "")}>
          <SavedProgramsPanel variant="chips" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:items-stretch">
          {!native && (
            <aside className="hidden lg:block lg:w-[320px] xl:w-[360px] shrink-0">
              <SavedProgramsPanel variant="sidebar" />
            </aside>
          )}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <SalesChatPanel
              conversationId={conversationId}
              fillViewport={native}
              className={
                native
                  ? "h-full min-h-0 flex-1 rounded-none border-0"
                  : "h-[min(calc(100dvh-9rem),920px)] min-h-[70vh]"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AiChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-[#050d18] pt-24 text-center text-white/50">
          ...
        </div>
      }
    >
      <AiChatWorkspace />
    </Suspense>
  );
}
