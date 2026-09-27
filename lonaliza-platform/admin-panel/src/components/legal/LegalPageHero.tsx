"use client";

import Link from "next/link";
import { Printer, ShieldCheck, Sparkles, type LucideIcon } from "lucide-react";
import NativeAppBar from "@/components/chrome/NativeAppBar";
import { displayLegalTitle } from "@/lib/legal/display-title";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type LegalPageHeroProps = {
  title: string;
  subtitle: string;
  badge: string;
  lastUpdated: string;
  printLabel?: string;
  badgeIcon?: LucideIcon;
  links: Array<{ href: string; label: string }>;
};

export default function LegalPageHero({
  title,
  subtitle,
  badge,
  lastUpdated,
  printLabel,
  badgeIcon: BadgeIcon = ShieldCheck,
  links,
}: LegalPageHeroProps) {
  const { locale, dir } = useLocale();
  const heading = displayLegalTitle(title, locale);
  const lead = displayLegalTitle(subtitle, locale);
  const chip = displayLegalTitle(badge, locale);

  return (
    <div dir={dir} className="lonaliza-legal-hero">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(217,119,6,0.18),transparent_50%)]" />
      <div className="relative z-10 mx-auto w-full min-w-0 max-w-6xl">
        <NativeAppBar
          fallbackHref="/account"
          variant="hero"
          embedded
          className="mb-5 lg:hidden"
        />

        <div className="mb-5 flex w-full min-w-0 flex-wrap items-center justify-between gap-3">
          <div className="inline-flex max-w-full min-w-0 items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3.5 py-1.5 text-xs font-bold text-amber-300 backdrop-blur-md">
            <BadgeIcon className="h-4 w-4 shrink-0 text-amber-400" />
            <span className="min-w-0 whitespace-normal break-words leading-snug">{chip}</span>
          </div>
          <button
            type="button"
            onClick={() => typeof window !== "undefined" && window.print()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/20 bg-white/10 text-xs font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>{printLabel}</span>
          </button>
        </div>

        <h1 className="lonaliza-legal-title">{heading}</h1>
        <p className="lonaliza-legal-lead mt-4 w-full min-w-0 max-w-3xl text-sm leading-relaxed text-purple-100 sm:text-base">
          {lead}
        </p>

        <div className="mt-6 flex w-full min-w-0 flex-col items-stretch gap-3 text-xs font-medium text-amber-300/90 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="inline-flex max-w-full min-w-0 items-center gap-1.5 self-start rounded-lg border border-purple-800 bg-purple-950/60 px-3 py-1">
            <Sparkles className="h-3 w-3 shrink-0 text-amber-400" />
            <span className="min-w-0 whitespace-normal break-words">{lastUpdated}</span>
          </span>
          <nav className="flex w-full min-w-0 flex-wrap items-center gap-x-3 gap-y-2 text-slate-200 sm:w-auto">
            {links.map((link, index) => (
              <span key={link.href} className="inline-flex min-w-0 max-w-full items-center gap-3">
                {index > 0 ? <span aria-hidden>•</span> : null}
                <Link
                  href={link.href}
                  className="min-w-0 max-w-full whitespace-normal break-words underline underline-offset-4 hover:text-amber-300"
                >
                  {displayLegalTitle(link.label, locale)}
                </Link>
              </span>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
