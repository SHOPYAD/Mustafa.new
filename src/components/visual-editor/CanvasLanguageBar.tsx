"use client";

/* Agent A: editor chrome only */

import { useBuilderStore } from "@/lib/builder/editor-store";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

const LANGUAGES: { code: Locale; nativeName: string }[] = [
  { code: "ar", nativeName: "العربية" },
  { code: "en", nativeName: "English" },
  { code: "tr", nativeName: "Türkçe" },
];

export function CanvasLanguageBar() {
  const { t } = useLocale();
  const locale = useBuilderStore((s) => s.locale);
  const setLocale = useBuilderStore((s) => s.setLocale);

  return (
    <div
      data-editor-language-bar=""
      className="ed-language-bar relative z-20 flex h-10 shrink-0 items-center gap-2 border-b px-3"
    >
      <span className="text-[11px] font-semibold uppercase tracking-wider text-white/55">
        {t.editor.language}
      </span>
      <div className="ms-auto flex items-center gap-1">
        {LANGUAGES.map((lang) => {
          const active = locale === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLocale(lang.code)}
              aria-pressed={active}
              className={cn(
                "h-7 rounded-md px-2.5 text-xs font-bold uppercase",
                active
                  ? "bg-emerald-500 text-[#051741]"
                  : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
              )}
            >
              {lang.code}
              <span className="ms-1.5 hidden font-medium normal-case sm:inline">
                {lang.nativeName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
