"use client";

import { useMemo } from "react";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLoyalty, earnPointsFor } from "@/hooks/useLoyalty";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { LoyaltyService } from "@/lib/loyalty/types";
import { cn } from "@/lib/utils";

type Props = {
  amount: number;
  currency?: string;
  service: LoyaltyService;
  className?: string;
};

function western(n: number, digits = 0): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export default function LoyaltyPointsRow({ amount, currency = "USD", service, className }: Props) {
  const { locale, t } = useLocale();
  const { convert, currency: guest } = useCurrency();
  const { settings } = useLoyalty(service, locale);

  const earn = useMemo(() => {
    const inGuest = convert(amount, currency);
    const usd = guest.rate > 0 ? inGuest / guest.rate : Number(amount) || 0;
    return earnPointsFor(settings, usd, service);
  }, [amount, convert, currency, guest.rate, service, settings]);

  if (!settings?.enabled || earn.points <= 0 || !(amount > 0)) return null;

  const usdLabel = `$${western(earn.usd, 2)}`;

  return (
    <p
      className={cn(
        "inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-600",
        className
      )}
    >
      <span
        aria-hidden
        className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-[9px] font-black text-[#051741] shadow-sm"
      >
        ر
      </span>
      <span>
        {t.loyalty.earnPoints(western(earn.points), usdLabel)}
      </span>
    </p>
  );
}
