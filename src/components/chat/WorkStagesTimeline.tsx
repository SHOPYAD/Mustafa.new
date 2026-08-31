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
        "w-full max-w-xl overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#0b1a14]/90 p-3 sm:p-4",
        className
      )}
    >
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80">
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
                  status === "done" && "bg-emerald-500 text-white",
                  status === "active" &&
                    "bg-emerald-500/20 text-emerald-200 ring-2 ring-emerald-400/50",
                  status === "pending" && "bg-white/5 text-white/30"
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
                    status === "active" && "font-semibold text-emerald-100",
                    status === "done" && "text-white/70",
                    status === "pending" && "text-white/35"
                  )}
                >
                  {label}
                </p>
                {status === "active" && (
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-l from-emerald-400 to-emerald-600" />
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
