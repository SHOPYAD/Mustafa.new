"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Menu,
  Rocket,
  Sparkles,
  X,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import LonalizaLogo from "@/components/ui/LonalizaLogo";

export default function LandingNavbar() {
  const { dir, locale } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isRtl = dir === "rtl";

  const navLinks = [
    {
      label:
        locale === "ar"
          ? "الميزات"
          : locale === "tr"
            ? "Özellikler"
            : locale === "fr"
              ? "Fonctionnalités"
              : "Features",
      href: "#features",
    },
    {
      label:
        locale === "ar"
          ? "محركات الحجز"
          : locale === "tr"
            ? "Rezervasyon Motorları"
            : locale === "fr"
              ? "Moteurs de réservation"
              : "Booking Engines",
      href: "#engines",
    },
    {
      label:
        locale === "ar"
          ? "الأتمتة والذكاء الاصطناعي"
          : locale === "tr"
            ? "Yapay Zeka ve Otomasyon"
            : locale === "fr"
              ? "IA & Automatisation"
              : "AI & Automation",
      href: "#ai-suite",
    },
    {
      label:
        locale === "ar"
          ? "المحرر البصري"
          : locale === "tr"
            ? "Görsel Düzenleyici"
            : locale === "fr"
              ? "Éditeur Visuel"
              : "Visual Builder",
      href: "#builder",
    },
    {
      label:
        locale === "ar"
          ? "السيرفر والاستضافة"
          : locale === "tr"
            ? "Sunucu ve Barındırma"
            : locale === "fr"
              ? "Serveur & Hébergement"
              : "Server & Cloud",
      href: "#server",
    },
    {
      label:
        locale === "ar"
          ? "التسعير"
          : locale === "tr"
            ? "Fiyatlandırma"
            : locale === "fr"
              ? "Tarifs"
              : "Pricing",
      href: "#pricing",
    },
    {
      label:
        locale === "ar"
          ? "الأسئلة الشائعة"
          : locale === "tr"
            ? "SSS"
            : locale === "fr"
              ? "FAQ"
              : "FAQ",
      href: "#faq",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/85 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-[1720px] items-center justify-between px-4 sm:px-6 lg:px-8 flex-nowrap">
        {/* Brand Logo - Pushed outward to the edge with generous margin */}
        <Link
          href="/"
          className="flex items-center group select-none shrink-0 me-6 lg:me-10 xl:me-12"
        >
          <LonalizaLogo variant="header" />
        </Link>

        {/* Desktop Nav - Clean single horizontal row */}
        <nav className="hidden lg:flex items-center gap-3.5 xl:gap-5 2xl:gap-6 justify-center flex-1 min-w-0 flex-nowrap overflow-hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[11.5px] xl:text-[12.5px] font-semibold text-slate-300 hover:text-amber-400 transition-colors tracking-wide whitespace-nowrap shrink-0 px-1 py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons - Pushed to the opposite edge on single row */}
        <div className="hidden lg:flex items-center gap-2.5 xl:gap-3 shrink-0 ms-4 lg:ms-8 flex-nowrap">
          <LanguageSwitcher variant="header" />

          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.12] px-3.5 py-2 text-xs font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm whitespace-nowrap shrink-0"
          >
            <span>
              {locale === "ar"
                ? "الديمو الحي"
                : locale === "tr"
                  ? "Canlı Demo"
                  : locale === "fr"
                    ? "Démo en direct"
                    : "Live Demo"}
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
          </Link>

          <Link
            href="/partners"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 px-4 py-2 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
          >
            <Rocket className="h-3.5 w-3.5 text-white" />
            <span className="text-white">
              {locale === "ar"
                ? "بوابة الشركات والترخيص"
                : locale === "tr"
                  ? "Şirket Portalı ve Lisans"
                  : locale === "fr"
                    ? "Portail Partenaire & Licence"
                    : "Partner Portal"}
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher variant="header" />
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:text-white"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-b border-white/10 bg-slate-950/98 px-5 py-6 md:hidden space-y-4 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold text-slate-200 hover:text-amber-400 py-2 border-b border-white/5"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-3 flex flex-col gap-3">
            <Link
              href="/demo"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 py-3 text-xs font-bold text-white shadow-sm"
            >
              <span className="text-white">
                {locale === "ar"
                  ? "استكشف الديمو الحي للحجوزات"
                  : locale === "tr"
                    ? "Canlı Rezervasyon Demosu"
                    : locale === "fr"
                      ? "Démo en direct de réservation"
                      : "Explore Live Demo"}
              </span>
              <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
            </Link>
            <Link
              href="/partners"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 py-3 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/30"
            >
              <Rocket className="h-4 w-4 text-white" />
              <span className="text-white">
                {locale === "ar"
                  ? "شراء الترخيص وبوابة الشركاء"
                  : locale === "tr"
                    ? "Lisans Satın Al ve Şirket Portalı"
                    : locale === "fr"
                      ? "Acheter la licence & Portail"
                      : "Buy License & Partner Portal"}
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
