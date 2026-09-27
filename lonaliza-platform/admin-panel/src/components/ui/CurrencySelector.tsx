"use client";

import { useState, useEffect, createContext, useContext, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import {
  convertAmount,
  currencyDisplayName,
  formatCurrencyAmount,
  normalizeCurrencyCode,
} from "@/lib/currency";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { PublicFxCurrency, PublicFxPayload } from "@/types/currency";

const STORAGE_KEY = "preferred_currency";

type GuestCurrency = PublicFxCurrency;

interface CurrencyContextType {
  currency: GuestCurrency;
  currencies: GuestCurrency[];
  setCurrency: (currency: GuestCurrency) => void;
  convert: (amount: number, sourceCurrency?: string) => number;
  formatPrice: (amount: number, sourceCurrency?: string) => string;
  fxStale: boolean;
  fxSource: string;
}

const FALLBACK: GuestCurrency = {
  code: "USD",
  symbol: "$",
  nameAr: "دولار أمريكي",
  nameEn: "US Dollar",
  nameTr: "ABD Doları",
  flag: "🇺🇸",
  enabled: true,
  rate: 1,
};

const CurrencyContext = createContext<CurrencyContextType | null>(null);

function rateOf(list: GuestCurrency[], code: string): number {
  const row = list.find((c) => c.code === normalizeCurrencyCode(code));
  if (row && row.rate > 0) return row.rate;
  if (normalizeCurrencyCode(code) === "USD") return 1;
  return 0;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    return {
      currency: FALLBACK,
      currencies: [FALLBACK],
      setCurrency: () => {},
      convert: (amount: number) => Number(amount) || 0,
      formatPrice: (usdPrice: number) => `$${Math.round(Number(usdPrice) || 0).toLocaleString()}`,
      fxStale: false,
      fxSource: "",
    };
  }
  return context;
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const [currencies, setCurrencies] = useState<GuestCurrency[]>([FALLBACK]);
  const [currency, setCurrencyState] = useState<GuestCurrency>(FALLBACK);
  const [fxStale, setFxStale] = useState(false);
  const [fxSource, setFxSource] = useState("");

  const applyPayload = useCallback((payload: PublicFxPayload) => {
    const list = (payload.currencies || []).filter((c) => c.enabled && c.rate > 0);
    const next = list.length ? list : [FALLBACK];
    setCurrencies(next);
    setFxStale(Boolean(payload.stale));
    setFxSource(payload.source || "");
    setCurrencyState((prev) => {
      const saved =
        typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      const wanted = normalizeCurrencyCode(saved || prev.code || payload.defaultCode);
      return next.find((c) => c.code === wanted) || next.find((c) => c.code === payload.defaultCode) || next[0];
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/fx", { cache: "no-store" });
        const json = (await res.json()) as PublicFxPayload;
        if (!cancelled && json?.ok && Array.isArray(json.currencies)) applyPayload(json);
      } catch {
        /* keep last / fallback — pages stay up */
      }
    };
    void load();
    const id = window.setInterval(load, 12 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [applyPayload]);

  const setCurrency = useCallback((next: GuestCurrency) => {
    setCurrencyState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next.code);
    } catch {
      /* ignore */
    }
  }, []);

  const convert = useCallback(
    (amount: number, sourceCurrency = "USD") => {
      const fromRate = rateOf(currencies, sourceCurrency);
      const toRate = currency.rate > 0 ? currency.rate : 1;
      if (!(fromRate > 0)) return Number(amount) || 0;
      return convertAmount(Number(amount) || 0, fromRate, toRate);
    },
    [currencies, currency.rate]
  );

  const formatPrice = useCallback(
    (amount: number, sourceCurrency = "USD") => {
      return formatCurrencyAmount(
        convert(amount, sourceCurrency),
        currency.code,
        currency.symbol,
        locale
      );
    },
    [convert, currency.code, currency.symbol, locale]
  );

  const value = useMemo<CurrencyContextType>(
    () => ({
      currency,
      currencies,
      setCurrency,
      convert,
      formatPrice,
      fxStale,
      fxSource,
    }),
    [currency, currencies, setCurrency, convert, formatPrice, fxStale, fxSource]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

interface CurrencySelectorProps {
  variant?: "header" | "header-light" | "footer";
}

export default function CurrencySelector({ variant = "header" }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { currency, currencies, setCurrency } = useCurrency();
  const { locale, t } = useLocale();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          variant === "header"
            ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
            : variant === "header-light"
              ? "bg-slate-900/5 hover:bg-slate-900/10 text-slate-800 border border-slate-200"
              : "bg-slate-800 hover:bg-slate-700 text-white"
        }`}
      >
        <span className="text-lg">{currency.flag}</span>
        <span className="text-sm font-medium">{currency.code}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50"
            >
              <div className="p-2">
                <p className="text-xs text-slate-500 px-3 py-2 font-medium uppercase">
                  {t.common.selectCurrency}
                </p>
                {currencies.map((curr) => (
                  <button
                    type="button"
                    key={curr.code}
                    onClick={() => {
                      setCurrency(curr);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      currency.code === curr.code
                        ? "bg-orange-50 text-orange-600"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{curr.flag}</span>
                      <div className="text-left">
                        <div className="font-medium text-sm">{curr.code}</div>
                        <div className="text-xs text-slate-500">
                          {currencyDisplayName(curr, locale)}
                        </div>
                      </div>
                    </div>
                    {currency.code === curr.code && <Check size={16} className="text-orange-600" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
