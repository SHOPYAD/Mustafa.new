"use client";

import { Check } from "lucide-react";
import type { Locale } from "@/lib/i18n/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import AppBottomSheet from "@/components/mobile/AppBottomSheet";

const FLAG_BY_CODE: Record<string, string> = {
  ar: "🇸🇦",
  en: "🇬🇧",
  tr: "🇹🇷",
  fr: "🇫🇷",
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function LanguagePickerSheet({ open, onClose }: Props) {
  const { locale, setLocale, t, locales } = useLocale();

  return (
    <AppBottomSheet open={open} onClose={onClose} title={t.common.language}>
      <div className="space-y-1">
        {locales.map((meta) => {
          const code = meta.code as Locale;
          const active = code === locale;
          return (
            <button
              key={meta.code}
              type="button"
              onClick={() => {
                setLocale(code);
                onClose();
              }}
              className={cn(
                "flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-start transition-colors",
                active
                  ? "bg-purple-50 font-bold text-purple-950 ring-1 ring-purple-200"
                  : "text-slate-700 hover:bg-slate-50"
              )}
            >
              <span className="flex items-center gap-3">
                <span className="text-lg leading-none">{FLAG_BY_CODE[meta.code] || "🌐"}</span>
                <span>
                  <span className="block text-sm font-black">{meta.nativeName || meta.name}</span>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {meta.code}
                  </span>
                </span>
              </span>
              {active ? <Check size={18} className="shrink-0 text-purple-700" /> : null}
            </button>
          );
        })}
      </div>
    </AppBottomSheet>
  );
}
