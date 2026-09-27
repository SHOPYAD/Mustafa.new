"use client";

import type { FlightCopy } from "@/components/flights/copy";

export type PriceLine = {
  id: string;
  label: string;
  amount: number;
  kind: "base" | "tax" | "extra" | "discount" | "total";
};

type Props = {
  copy: FlightCopy;
  lines: PriceLine[];
  formatPrice: (amount: number) => string;
};

export default function FlightPriceBreakdown({ copy, lines, formatPrice }: Props) {
  const total = lines.find((line) => line.kind === "total");
  const rest = lines.filter((line) => line.kind !== "total");
  return (
    <div className="space-y-2 text-sm">
      {rest.map((line) => (
        <div
          key={line.id}
          className={`flex justify-between gap-3 ${
            line.kind === "discount" ? "text-emerald-700" : "text-slate-600"
          }`}
        >
          <span>{line.label}</span>
          <span className="tabular-nums" dir="ltr">
            {line.kind === "discount" ? "−" : ""}
            {formatPrice(Math.abs(line.amount))}
          </span>
        </div>
      ))}
      {total ? (
        <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-[#051741]">
          <span>{copy.total}</span>
          <span className="tabular-nums" dir="ltr">
            {formatPrice(total.amount)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
