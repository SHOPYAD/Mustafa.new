"use client";

import { useLoyalty } from "@/hooks/useLoyalty";
import {
  applyDisplayCoupon,
  pickDisplayCoupon,
  type DisplayPrice,
} from "@/lib/loyalty/display-price";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { LoyaltyService } from "@/lib/loyalty/types";
import { cn } from "@/lib/utils";

type Props = {
  amount: number;
  currency: string;
  service: LoyaltyService;
  formatPrice: (amount: number, currency: string) => string;
  perLabel?: string;
  subLabel?: string;
  note?: string;
  align?: "start" | "end";
  className?: string;
  size?: "md" | "lg";
  tone?: "light" | "dark";
};

export function usePromoPrice(amount: number, service: LoyaltyService): DisplayPrice & { ready: boolean } {
  const { locale } = useLocale();
  const { coupons, appliedCode } = useLoyalty(service, locale);
  const coupon = pickDisplayCoupon(coupons, appliedCode);
  const price = applyDisplayCoupon(amount, coupon);
  return { ...price, ready: coupons.length > 0 || Boolean(appliedCode) };
}

export default function PromoPriceBlock({
  amount,
  currency,
  service,
  formatPrice,
  perLabel,
  subLabel,
  note,
  align = "end",
  className,
  size = "lg",
  tone = "light",
}: Props) {
  const { locale } = useLocale();
  const price = usePromoPrice(amount, service);
  const end = align === "end";
  const big = size === "lg" ? "text-[26px] sm:text-[28px]" : "text-[22px]";
  const dark = tone === "dark";

  return (
    <div className={cn("min-w-0", end ? "text-start sm:text-end" : "text-start", className)}>
      {price.hasDiscount ? (
        <p className={cn("mb-1 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-black", dark ? "bg-amber-400 text-[#1a0533]" : "bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-amber-300")}>
          {locale === "ar"
            ? `وفّروا ${formatPrice(price.saved, currency)} مع ${price.code}`
            : locale === "tr"
              ? `${price.code} ile ${formatPrice(price.saved, currency)} kazanın`
              : `Save ${formatPrice(price.saved, currency)} with ${price.code}`}
        </p>
      ) : null}
      {perLabel ? <p className="text-[11px] text-slate-500">{perLabel}</p> : null}
      {price.hasDiscount ? (
        <p className={cn("text-[12px] font-semibold line-through tabular-nums", dark ? "text-white/40" : "text-slate-400")}>
          {formatPrice(price.original, currency)}
        </p>
      ) : null}
      <p className={cn("leading-none font-black tabular-nums", big, dark ? "text-amber-300" : price.hasDiscount ? "text-amber-500" : "text-[#1e1b4b]")}>
        {formatPrice(price.hasDiscount ? price.discounted : price.original, currency)}
      </p>
      {subLabel ? <p className={cn("mt-1 text-[11.5px]", dark ? "text-amber-100/75" : "text-slate-600")}>{subLabel}</p> : null}
      {note ? <p className="text-[10.5px] text-slate-400">{note}</p> : null}
    </div>
  );
}
