"use client";

import { Check, Loader2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import {
  SALES_CHAT_STAGE_IDS,
  SALES_CHAT_STAGE_LABELS,
  type SalesChatStageId,
  type SalesChatStageStatus,
} from "@/lib/sales-chat-stages";

export type StageMap = Record<SalesChatStageId, SalesChatStageStatus>;

export function emptyStageMap(): StageMap {
  return {
    understand: "pending",
    dates: "pending",
    flights: "pending",
    transfers: "pending",
    cars: "pending",
    program: "pending",
  };
}

export default function WorkStagesTimeline({
  stages,
  className,
}: {
  stages: StageMap;
  className?: string;
}) {
  const { locale, t } = useLocale();
  const lang = locale === "en" ? "en" : locale === "tr" ? "tr" : "ar";

  return (
    <div
      className={cn(
        "w-full max-w-xl overflow-hidden rounded-2xl border border-violet-200 bg-white p-3 sm:p-4",
        className
      )}
    >
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#7C3AED]">
        {t.chat.workingOnRequest}
      </p>
      <ol className="space-y-2">
        {SALES_CHAT_STAGE_IDS.map((id, index) => {
          const status = stages[id];
          const label = SALES_CHAT_STAGE_LABELS[id][lang];
          return (
            <li key={id} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  status === "done" && "bg-[#7C3AED] text-white",
                  status === "active" &&
                    "bg-violet-100 text-[#7C3AED] ring-2 ring-[#7C3AED]/40",
                  status === "pending" && "bg-slate-100 text-slate-400"
                )}
              >
                {status === "done" ? (
                  <Check size={14} />
                ) : status === "active" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm",
                    status === "active" && "font-semibold text-[#2E1065]",
                    status === "done" && "text-slate-500",
                    status === "pending" && "text-slate-400"
                  )}
                >
                  {label}
                </p>
                {status === "active" && (
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-violet-100">
                    <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-l from-[#F59E0B] to-[#7C3AED]" />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
