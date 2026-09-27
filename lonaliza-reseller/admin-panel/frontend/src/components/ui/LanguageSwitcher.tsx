"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Languages } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/types";

interface LanguageSwitcherProps {
  variant?: "header" | "header-light" | "footer" | "admin" | "landing";
}

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

export default function LanguageSwitcher({
  variant = "header",
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { locale, setLocale, t, locales } = useLocale();

  const options = locales.map((meta) => ({
    code: meta.code as Locale,
    label: meta.nativeName || meta.name,
    flag: flagFor(meta.code),
  }));

  const current = options.find((o) => o.code === locale) || options[0];

  const btnClass =
    variant === "admin"
      ? "bg-secondary hover:bg-muted text-foreground border border-border"
      : variant === "landing"
        ? "bg-slate-100/90 hover:bg-purple-50 text-purple-950 border border-purple-200/80 shadow-2xs font-bold"
        : variant === "header-light"
          ? "bg-slate-900/5 hover:bg-slate-900/10 text-slate-800 border border-slate-200"
          : variant === "header"
            ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
            : "bg-slate-800 hover:bg-slate-700 text-white";

  if (variant === "landing") {
    return (
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center size-9 rounded-xl border border-purple-200/80 bg-purple-50/70 hover:bg-purple-100 text-purple-950 transition-all shadow-2xs cursor-pointer group"
          aria-label={t.common.language}
          title={t.common.language}
        >
          <Languages size={17} className="text-purple-800 group-hover:scale-110 transition-transform" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                className="absolute top-full mt-2 end-0 w-48 rounded-2xl shadow-2xl border border-slate-200 bg-white overflow-hidden z-50 p-1.5"
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5 py-1">
                  {t.common.language}
                </div>
                {options.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => {
                      setLocale(opt.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-2.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                      locale === opt.code
                        ? "bg-purple-50 text-purple-950 border border-purple-200/80 shadow-2xs"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{opt.flag}</span>
                      <span className="font-semibold text-xs">{opt.label}</span>
                    </div>
                    {locale === opt.code && <Check size={14} className="text-purple-700" />}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${variant === "admin" ? "min-h-11 lg:min-h-9" : ""} ${btnClass}`}
        aria-label={t.common.language}
      >
        <Languages size={15} />
        <span className="text-sm font-semibold">
          {current?.flag} {(current?.code || locale).toUpperCase()}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`absolute top-full mt-2 end-0 w-48 rounded-xl shadow-2xl border overflow-hidden z-50 ${
                variant === "admin"
                  ? "bg-popover border-border text-popover-foreground"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="p-2 max-h-72 overflow-y-auto">
                {options.map((opt) => (
                  <button
                    key={opt.code}
                    type="button"
                    onClick={() => {
                      setLocale(opt.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      locale === opt.code
                        ? variant === "admin"
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-bold"
                          : "bg-purple-50 text-purple-950 font-bold border border-purple-200/60"
                        : variant === "admin"
                          ? "hover:bg-muted text-foreground"
                          : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{opt.flag}</span>
                      <span className="text-sm font-semibold">{opt.label}</span>
                    </div>
                    {locale === opt.code && <Check size={16} className="text-purple-700" />}
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
