"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import LonalizaLogo from "@/components/ui/LonalizaLogo";

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  const { dir } = useLocale();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-purple-100 selection:text-purple-900" dir={dir}>
      {/* Daylight Luxury Top Header */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-xl sticky top-0 z-40 shadow-xs">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/partners" className="flex items-center gap-3 group">
            <LonalizaLogo variant="header" className="h-12 sm:h-14" />
            <span className="rounded-md bg-purple-950/5 border border-purple-900/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-[#2e1065] shadow-xs">
              PARTNERS PORTAL
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <LanguageSwitcher variant="admin" />
            <Link
              href="/"
              className="text-xs font-bold text-slate-600 hover:text-purple-900 transition-colors px-3 py-1.5 rounded-lg hover:bg-purple-50"
            >
              الرئيسية
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
