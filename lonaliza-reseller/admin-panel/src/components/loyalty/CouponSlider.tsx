"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, Gift, Plus, TicketPercent } from "lucide-react";
import { useLoyalty } from "@/hooks/useLoyalty";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { LoyaltyService } from "@/lib/loyalty/types";
import { cn } from "@/lib/utils";

type Props = {
  service: LoyaltyService;
  className?: string;
};

function western(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function discountLabel(
  coupon: { discountType: "percent" | "fixed"; discountValue: number; currency: string },
  locale: string
): string {
  if (coupon.discountType === "percent") {
    return locale === "ar" ? `خصم ${western(coupon.discountValue)}%` : `${western(coupon.discountValue)}%`;
  }
  return `${coupon.currency} ${western(coupon.discountValue)}`;
}

function serviceCopy(
  service: LoyaltyService,
  labels: {
    svcFlights: string;
    svcHotels: string;
    svcTransfers: string;
    svcCars: string;
    svcPackages: string;
    svcAll: string;
  }
): string {
  switch (service) {
    case "flights":
      return labels.svcFlights;
    case "hotels":
      return labels.svcHotels;
    case "transfers":
      return labels.svcTransfers;
    case "cars":
      return labels.svcCars;
    case "packages":
      return labels.svcPackages;
    case "all":
      return labels.svcAll;
    default: {
      const _never: never = service;
      return _never;
    }
  }
}

export default function CouponSlider({ service, className }: Props) {
  const { locale, t, dir } = useLocale();
  const { coupons, appliedCode, applyCode, clearCode } = useLoyalty(service, locale);
  const [openAll, setOpenAll] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");

  const visible = useMemo(() => (openAll ? coupons : coupons.slice(0, 4)), [coupons, openAll]);

  if (!coupons.length && !appliedCode) return null;

  const apply = async (next: string) => {
    setBusy(next);
    setErr("");
    const result = await applyCode(next);
    if (!result.ok) setErr(t.loyalty.applyFailed);
    setBusy("");
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-purple-200/80 bg-white shadow-sm",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-purple-100 bg-purple-50/40 px-3 py-2.5 sm:px-4">
        <span className="inline-flex items-center gap-1.5 text-sm font-black text-[#1e1b4b]">
          <Gift size={16} className="text-amber-500" />
          {t.loyalty.firstBookingOffer}
        </span>
        <div className="ms-auto flex flex-wrap items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => setCodeOpen((v) => !v)}
            className="inline-flex items-center gap-1 font-bold text-purple-700 hover:text-purple-950 transition-colors cursor-pointer"
          >
            <Plus size={14} />
            {t.loyalty.usePromoCode}
          </button>
          {coupons.length > 2 ? (
            <button
              type="button"
              onClick={() => setOpenAll((v) => !v)}
              className="inline-flex items-center gap-0.5 font-bold text-slate-600 hover:text-purple-950 transition-colors cursor-pointer"
            >
              {t.loyalty.viewAll(coupons.length)}
              <ChevronLeft size={14} className={dir === "rtl" ? "" : "rotate-180"} />
            </button>
          ) : null}
        </div>
      </div>

      {codeOpen ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-purple-100 bg-purple-50/20 px-3 py-2.5 sm:px-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t.loyalty.codePlaceholder}
            className="min-w-[10rem] flex-1 rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm focus:border-purple-600 focus:outline-none"
            dir="ltr"
          />
          <button
            type="button"
            onClick={() => void apply(code)}
            disabled={!code.trim() || Boolean(busy)}
            className="rounded-xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] hover:brightness-110 px-4 py-2 text-xs font-black text-white disabled:opacity-50 cursor-pointer transition-all"
          >
            {t.loyalty.applyDiscount}
          </button>
          {appliedCode ? (
            <button type="button" onClick={() => void clearCode()} className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors cursor-pointer">
              {t.loyalty.clear}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="flex gap-2 overflow-x-auto px-3 py-3 [scrollbar-width:thin] sm:px-4">
        {visible.map((coupon) => {
          const active = appliedCode === coupon.code;
          return (
            <article
              key={coupon.id}
              className={cn(
                "min-w-[16.5rem] shrink-0 rounded-xl border px-3 py-2.5 transition",
                active
                  ? "border-amber-400 bg-gradient-to-br from-amber-500/10 via-purple-50/40 to-white ring-1 ring-amber-400/50 shadow-xs"
                  : "border-slate-200 bg-white hover:border-purple-200"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-wide text-amber-700">
                    {discountLabel(coupon, locale)}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-black text-[#1e1b4b]">{coupon.title}</p>
                  {coupon.description ? (
                    <p className="mt-0.5 line-clamp-1 text-[11px] font-semibold text-slate-500">{coupon.description}</p>
                  ) : null}
                </div>
                <span className="shrink-0 rounded-md bg-purple-100/70 px-1.5 py-0.5 text-[10px] font-bold text-purple-950 border border-purple-200">
                  {serviceCopy(coupon.service, t.loyalty)}
                </span>
              </div>
              <div className="mt-2.5 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 font-mono text-[11px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md" dir="ltr">
                  <TicketPercent size={13} className="text-purple-700" />
                  {coupon.code}
                </span>
                <button
                  type="button"
                  disabled={Boolean(busy)}
                  onClick={() => void (active ? clearCode() : apply(coupon.code))}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-[11px] font-black transition-all cursor-pointer",
                    active
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-xs"
                      : "bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-white hover:brightness-110 shadow-xs"
                  )}
                >
                  {active ? t.loyalty.applied : t.loyalty.applyDiscount}
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {err ? <p className="px-4 pb-3 text-xs text-red-600">{err}</p> : null}
    </div>
  );
}
