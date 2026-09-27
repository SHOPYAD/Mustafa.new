"use client";

import { Check } from "lucide-react";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { currencyDisplayName } from "@/lib/currency";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import AppBottomSheet from "@/components/mobile/AppBottomSheet";

const PINNED = ["USD", "TRY", "SAR", "EUR"];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CurrencyPickerSheet({ open, onClose }: Props) {
  const { currency, currencies, setCurrency } = useCurrency();
  const { locale, t } = useLocale();

  const ordered = [...currencies].sort((a, b) => {
    const ai = PINNED.indexOf(a.code);
    const bi = PINNED.indexOf(b.code);
    if (ai === -1 && bi === -1) return a.code.localeCompare(b.code);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <AppBottomSheet open={open} onClose={onClose} title={t.common.selectCurrency}>
      <div className="space-y-1">
        {ordered.map((curr) => {
          const active = curr.code === currency.code;
          return (
            <button
              key={curr.code}
              type="button"
              onClick={() => {
                setCurrency(curr);
                onClose();
              }}
              className={cn(
                "flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-start transition-colors",
                active
                  ? "bg-amber-50 font-bold text-amber-950 ring-1 ring-amber-200"
                  : "text-slate-700 hover:bg-slate-50"
              )}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="text-lg leading-none">{curr.flag}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-black">{curr.code}</span>
                  <span className="block truncate text-xs font-medium text-slate-500">
                    {currencyDisplayName(curr, locale)}
                  </span>
                </span>
              </span>
              {active ? <Check size={18} className="shrink-0 text-amber-700" /> : null}
            </button>
          );
        })}
      </div>
    </AppBottomSheet>
  );
}
