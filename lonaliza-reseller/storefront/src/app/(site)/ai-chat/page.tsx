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
      data-keep-color="true"
      className={cn(
        "lonaliza-advisor-chat relative box-border flex min-h-0 flex-col overflow-hidden bg-[#F8F7FC] text-[#1E1B4B]",
        native
          ? "h-[var(--advisor-vvh,100dvh)] max-h-[var(--advisor-vvh,100dvh)]"
          : "h-[var(--advisor-vvh,100dvh)] max-h-[var(--advisor-vvh,100dvh)] pt-20 sm:pt-24"
      )}
    >
      <div
        className={cn(
          "relative mx-auto flex h-full min-h-0 w-full flex-1 flex-col",
          native ? "max-w-none px-0" : "max-w-6xl px-3 sm:px-5 lg:px-6"
        )}
      >
        {!native && (
          <header className="shrink-0 pb-2 pt-1 text-center lg:text-start">
            <div className="mb-1.5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#7C3AED]">
              <Sparkles size={12} className="text-[#F59E0B]" />
              {t.admin.brandName}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#2E1065] sm:text-2xl">
              {t.chat.title}
            </h1>
            <p className="mt-0.5 max-w-3xl text-xs text-slate-500 sm:text-sm">
              {t.chat.workspaceSubtitle}
            </p>
          </header>
        )}

        <div
          className={cn(
            "lonaliza-saved-programs-bar shrink-0",
            native ? "px-3" : "lg:hidden"
          )}
          style={
            native
              ? { paddingTop: "max(48px, env(safe-area-inset-top, 0px))" }
              : undefined
          }
        >
          <SavedProgramsPanel variant="chips" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row lg:items-stretch">
          {!native && (
            <aside className="hidden min-h-0 lg:block lg:w-[300px] xl:w-[320px] shrink-0">
              <SavedProgramsPanel variant="sidebar" />
            </aside>
          )}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <SalesChatPanel
              conversationId={conversationId}
              fillViewport={native}
              className="h-full min-h-0 flex-1"
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
        <div
          data-keep-color="true"
          className="flex min-h-[100dvh] items-center justify-center bg-[#F8F7FC] text-slate-400"
        >
          ...
        </div>
      }
    >
      <AiChatWorkspace />
    </Suspense>
  );
}
