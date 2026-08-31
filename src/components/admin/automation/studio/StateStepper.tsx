"use client";

import { Check, Circle, X } from "lucide-react";
import { describeApprovalState, type ApprovalState } from "@/lib/automation/approval";
import { cn } from "@/lib/utils";

const STEPS: ApprovalState[] = ["draft", "awaiting_approval", "active"];

function stepIndex(state: ApprovalState): number {
  if (state === "rejected") return 1;
  return STEPS.indexOf(state === "active" ? "active" : state);
}

export function StateStepper({ state }: { state: ApprovalState | null }) {
  const current = state || "draft";
  const idx = stepIndex(current);
  return (
    <ol className="flex flex-wrap items-center gap-2" aria-label="مسار الاعتماد">
      {STEPS.map((step, i) => {
        const done = current === "active" || (current !== "rejected" && i < idx);
        const active = current !== "rejected" && i === idx;
        const rejected = current === "rejected" && i === 1;
        return (
          <li key={step} className="flex items-center gap-2">
            {i > 0 ? <span className="h-px w-6 bg-border sm:w-10" aria-hidden /> : null}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
                done && "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                active && "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200",
                rejected && "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
                !done && !active && !rejected && "border-border text-muted-foreground"
              )}
            >
              {rejected ? (
                <X className="size-3" />
              ) : done ? (
                <Check className="size-3" />
              ) : (
                <Circle className="size-3" />
              )}
              {rejected ? "مرفوضة" : describeApprovalState(step)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
