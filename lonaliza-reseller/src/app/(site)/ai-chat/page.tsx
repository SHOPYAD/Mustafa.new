"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SalesChatPanel from "@/components/chat/SalesChatPanel";
import SavedProgramsPanel from "@/components/chat/SavedProgramsPanel";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Sparkles } from "lucide-react";

function AiChatWorkspace() {
  const { t } = useLocale();
  const params = useSearchParams();
  const conversationId = params.get("c") || undefined;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050d18] pt-24 pb-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(16,185,129,0.10),transparent_50%),radial-gradient(ellipse_at_80%_10%,rgba(14,60,120,0.25),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-5 px-3 sm:px-5 lg:px-6">
        <header className="text-center lg:text-start">
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

        <SavedProgramsPanel variant="chips" />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          <aside className="hidden lg:block lg:w-[320px] xl:w-[360px] shrink-0">
            <SavedProgramsPanel variant="sidebar" />
          </aside>
          <div className="min-w-0 flex-1">
            <SalesChatPanel
              conversationId={conversationId}
              className="h-[min(82vh,920px)] min-h-[70vh]"
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
        <div className="min-h-screen bg-[#050d18] pt-24 text-center text-white/50">
          ...
        </div>
      }
    >
      <AiChatWorkspace />
    </Suspense>
  );
}
