"use client";

import {
  BadgeCheck,
  CalendarDays,
  Check,
  Luggage,
  MessageSquare,
  Shield,
  Sparkles,
  Star,
} from "lucide-react";
import type { FlightCopy } from "@/components/flights/copy";
import {
  extraLineAmount,
  extraLocalizedDesc,
  extraLocalizedTitle,
} from "@/lib/agency-extras";
import type { Locale } from "@/lib/i18n/types";
import type { AgencyExtraIcon, AgencyExtraPackage } from "@/types/agency-extra";

type Props = {
  packages: AgencyExtraPackage[];
  selectedIds: string[];
  fareSubtotal: number;
  locale: Locale;
  copy: FlightCopy;
  formatPrice: (amount: number) => string;
  onToggle: (id: string) => void;
};

function ExtraGlyph({ icon }: { icon: AgencyExtraIcon }) {
  const cls = "text-amber-700";
  switch (icon) {
    case "refund":
      return <BadgeCheck size={20} className={cls} />;
    case "bag":
      return <Luggage size={20} className={cls} />;
    case "insurance":
      return <Shield size={20} className={cls} />;
    case "priority":
      return <Sparkles size={20} className={cls} />;
    case "sms":
      return <MessageSquare size={20} className={cls} />;
    case "calendar":
      return <CalendarDays size={20} className={cls} />;
    case "shield":
      return <Shield size={20} className={cls} />;
    case "star":
      return <Star size={20} className={cls} />;
    default: {
      const _exhaustive: never = icon;
      return _exhaustive;
    }
  }
}

export default function FlightExtrasPicker({
  packages,
  selectedIds,
  fareSubtotal,
  locale,
  copy,
  formatPrice,
  onToggle,
}: Props) {
  if (!packages.length) return null;
  const chosen = new Set(selectedIds);

  return (
    <div>
      <h3 className="text-base font-bold text-[#051741]">{copy.extrasTitle}</h3>
      <p className="mt-1 text-xs text-slate-500">{copy.extrasHint}</p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {packages.map((pkg) => {
          const selected = chosen.has(pkg.id);
          const amount = extraLineAmount(pkg, fareSubtotal);
          const priceLabel =
            pkg.priceType === "percent"
              ? `${pkg.priceValue}% · ${formatPrice(amount)}`
              : formatPrice(amount);
          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => onToggle(pkg.id)}
              className={`rounded-2xl border p-4 text-start transition ${
                selected
                  ? "border-[#051741] bg-[#051741]/[0.04] shadow-sm"
                  : "border-[#eadfcf] bg-white hover:border-amber-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                  <ExtraGlyph icon={pkg.icon} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-[#051741]">
                      {extraLocalizedTitle(pkg, locale)}
                    </p>
                    {selected ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#051741] px-2 py-0.5 text-[10px] font-bold text-white">
                        <Check size={10} /> {copy.selectedExtra}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-800">{copy.addExtra}</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    {extraLocalizedDesc(pkg, locale)}
                  </p>
                  <p className="mt-2 text-sm font-bold tabular-nums text-amber-800">{priceLabel}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
