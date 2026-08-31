"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Coins, Languages } from "lucide-react";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { currencyDisplayName } from "@/lib/currency";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

type SwitcherVariant = "header" | "header-light" | "footer";
type SwitcherTab = "language" | "currency";

const FLAG_BY_CODE: Record<string, string> = {
  ar: "🇸🇦",
  en: "🇬🇧",
  tr: "🇹🇷",
  fr: "🇫🇷",
  de: "🇩🇪",
  es: "🇪🇸",
  it: "🇮🇹",
  ru: "🇷🇺",
  pt: "🇵🇹",
  "pt-br": "🇧🇷",
  nl: "🇳🇱",
  fa: "🇮🇷",
  ur: "🇵🇰",
  he: "🇮🇱",
  hi: "🇮🇳",
  zh: "🇨🇳",
  ja: "🇯🇵",
  ko: "🇰🇷",
};

function flagFor(code: string): string {
  const lower = code.toLowerCase();
  return FLAG_BY_CODE[lower] || FLAG_BY_CODE[lower.split("-")[0] || ""] || "🌐";
}

export default function LocaleCurrencySwitcher({
  variant = "header",
}: {
  variant?: SwitcherVariant;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<SwitcherTab>("language");
  const { locale, setLocale, t, locales } = useLocale();
  const { currency, currencies, setCurrency } = useCurrency();

  const options = locales.map((meta) => ({
    code: meta.code as Locale,
    label: meta.nativeName || meta.name,
    flag: flagFor(meta.code),
  }));
  const current = options.find((o) => o.code === locale) || options[0];

  const btnClass =
    variant === "header-light"
      ? "bg-slate-900/5 hover:bg-slate-900/10 text-slate-800 border-slate-200"
      : variant === "header"
        ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
        : "bg-slate-800 hover:bg-slate-700 text-white border-white/10";

  const panelClass =
    variant === "header-light"
      ? "bg-white border-slate-200"
      : variant === "header"
        ? "bg-white border-slate-200"
        : "bg-slate-900 border-white/10";

  const close = () => setIsOpen(false);

  const tabBtn = (id: SwitcherTab, label: string, icon: ReactNode) => {
    const active = tab === id;
    return (
      <button
        type="button"
        onClick={() => setTab(id)}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition-colors",
          active
            ? "bg-emerald-500 text-white"
            : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        )}
      >
        {icon}
        {label}
      </button>
    );
  };

  const renderTabBody = () => {
    switch (tab) {
      case "language":
        return (
          <div className="max-h-72 overflow-y-auto p-2">
            {options.map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => {
                  setLocale(opt.code);
                  close();
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors",
                  locale === opt.code
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-700 hover:bg-slate-50"
                )}
              >
                <span className="flex items-center gap-2">
                  <span>{opt.flag}</span>
                  <span className="text-sm font-medium">{opt.label}</span>
                </span>
                {locale === opt.code ? <Check size={16} /> : null}
              </button>
            ))}
          </div>
        );
      case "currency":
        return (
          <div className="max-h-72 overflow-y-auto p-2">
            {currencies.map((curr) => (
              <button
                type="button"
                key={curr.code}
                onClick={() => {
                  setCurrency(curr);
                  close();
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors",
                  currency.code === curr.code
                    ? "bg-orange-50 text-orange-600"
                    : "text-slate-700 hover:bg-slate-50"
                )}
              >
                <span className="flex items-center gap-3">
                  <span className="text-lg">{curr.flag}</span>
                  <span className="text-start">
                    <span className="block text-sm font-medium">{curr.code}</span>
                    <span className="block text-xs text-slate-500">
                      {currencyDisplayName(curr, locale)}
                    </span>
                  </span>
                </span>
                {currency.code === curr.code ? <Check size={16} /> : null}
              </button>
            ))}
          </div>
        );
      default: {
        const _never: never = tab;
        return _never;
      }
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border px-2.5 py-2 transition-colors",
          btnClass
        )}
        aria-label={`${t.common.language} · ${t.common.selectCurrency}`}
        aria-expanded={isOpen}
      >
        <span className="text-base leading-none" aria-hidden>
          {current?.flag || "🌐"}
        </span>
        <span className="text-xs font-bold tracking-wide">
          {(current?.code || locale).toUpperCase()}
        </span>
        <span className="text-white/30 text-slate-400" aria-hidden>
          ·
        </span>
        <span className="text-xs font-bold tracking-wide">{currency.code}</span>
        <ChevronDown
          size={13}
          className={cn("shrink-0 opacity-70 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <>
            <div className="fixed inset-0 z-[60]" onClick={close} aria-hidden />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={cn(
                "absolute end-0 top-full z-[70] mt-2 w-64 overflow-hidden rounded-2xl border shadow-2xl",
                panelClass
              )}
            >
              <div className="flex gap-1 border-b border-slate-100 p-2">
                {tabBtn("language", t.common.language, <Languages size={13} />)}
                {tabBtn("currency", t.common.currency, <Coins size={13} />)}
              </div>
              {renderTabBody()}
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
