"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Menu,
  Rocket,
  X,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import LonalizaLogo from "@/components/ui/LonalizaLogo";

import { getLandingLocale, LANDING_TRANSLATIONS } from "./landing-translations";

export default function LandingNavbar() {
  const { dir, locale } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const langKey = getLandingLocale(locale);
  const t = LANDING_TRANSLATIONS[langKey].nav;

  const navLinks = [
    {
      label: t.demo,
      href: "#interactive-demo",
    },
    {
      label: t.portal,
      href: "#customer-portal-showcase",
    },
    {
      label: t.engines,
      href: "#engines",
    },
    {
      label: t.aiSwarm,
      href: "#ai-swarm",
    },
    {
      label: t.builder,
      href: "#builder",
    },
    {
      label: t.pricing,
      href: "#pricing",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md text-slate-900 select-none">
      <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-2 min-w-0">
        {/* Brand Logo - Directly on the Header, Zero Container, Zero Background, Zero Shadow */}
        <Link
          href="/"
          className="inline-flex items-center shrink-0 p-0 m-0 bg-transparent border-0 shadow-none ring-0 outline-none"
          style={{ background: "transparent", border: "none", boxShadow: "none", outline: "none" }}
        >
          <LonalizaLogo variant="header" />
        </Link>

        {/* Desktop Nav Links - Centered with Clean Spacing without Overlapping */}
        <nav className="hidden xl:flex items-center gap-0.5 2xl:gap-1.5 shrink min-w-0">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs 2xl:text-sm font-bold text-slate-700 hover:text-purple-950 hover:bg-purple-50/80 px-2.5 py-1.5 rounded-xl transition-colors whitespace-nowrap"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <LanguageSwitcher variant="landing" />

          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-purple-200/80 bg-purple-50/50 hover:bg-purple-100/70 px-3.5 py-2 text-xs font-bold text-purple-950 transition-colors shadow-2xs whitespace-nowrap"
          >
            <span>{t.liveDemoBtn}</span>
            <ExternalLink className="h-3.5 w-3.5 text-purple-700" />
          </Link>

          <Link
            href="/partners"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] hover:from-[#3b0764] hover:to-[#581c87] px-3.5 py-2 text-xs font-black text-white shadow-md shadow-purple-950/20 border border-purple-800/40 transition-all whitespace-nowrap"
          >
            <Rocket className="h-3.5 w-3.5 text-amber-300" />
            <span className="text-white font-black">
              {t.partnerPortalBtn}
            </span>
          </Link>
        </div>

        {/* Mobile Hamburger & Language Button */}
        <div className="flex xl:hidden items-center gap-2">
          <div className="md:hidden">
            <LanguageSwitcher variant="landing" />
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 py-6 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.menuToggle}</span>
            <LanguageSwitcher variant="landing" />
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-purple-50 hover:text-purple-900 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <Link
              href="/demo"
              onClick={() => setMobileOpen(false)}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-4 py-2.5 text-xs font-bold text-purple-950"
            >
              <span>{t.liveDemoBtn}</span>
              <ExternalLink className="size-3.5 text-purple-700" />
            </Link>

            <Link
              href="/partners"
              onClick={() => setMobileOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] px-4 py-2.5 text-xs font-black text-white shadow-md shadow-purple-950/20"
            >
              <Rocket className="size-3.5 text-amber-300" />
              <span>{t.partnerPortalBtn}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
