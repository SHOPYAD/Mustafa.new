"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Languages } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/types";

interface LanguageSwitcherProps {
  variant?: "header" | "header-light" | "footer" | "admin";
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
      : variant === "header-light"
        ? "bg-slate-900/5 hover:bg-slate-900/10 text-slate-800 border border-slate-200"
        : variant === "header"
          ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
          : "bg-slate-800 hover:bg-slate-700 text-white";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${btnClass}`}
        aria-label={t.common.language}
      >
        <Languages size={14} />
        <span className="text-sm font-medium">
          {(current?.code || locale).toUpperCase()}
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
              className={`absolute top-full mt-2 end-0 w-44 rounded-xl shadow-2xl border overflow-hidden z-50 ${
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
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "bg-emerald-50 text-emerald-700"
                        : variant === "admin"
                          ? "hover:bg-muted text-foreground"
                          : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{opt.flag}</span>
                      <span className="text-sm font-medium">{opt.label}</span>
                    </div>
                    {locale === opt.code && <Check size={16} />}
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
