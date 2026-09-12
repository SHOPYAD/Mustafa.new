"use client";

import Link from "next/link";
import {
  ArrowUp,
  Globe,
  Heart,
  Mail,
  MessageCircle,
  Phone,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import LonalizaLogo from "@/components/ui/LonalizaLogo";

export default function LandingFooter({
  supportWhatsapp = "+905015709201",
}: {
  supportWhatsapp?: string;
}) {
  const { locale } = useLocale();
  const cleanWhatsapp = supportWhatsapp.replace(/[^0-9+]/g, "");

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative bg-slate-950 border-t border-white/10 text-white overflow-hidden pt-16 pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <LonalizaLogo />
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              {locale === "ar"
                ? "منصة لوناليزا (Lonaliza) — المنظومة السياحية الذكية المتكاملة لتشغيل وإعادة بيع التراخيص للشركات مع سيرفر سحابي مخصص وتسليم فوري."
                : "Lonaliza Platform — The enterprise tourism operating system with dedicated cloud hosting, AI automation, and fail-closed licensing."}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={`https://wa.me/${cleanWhatsapp.replace("+", "")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
              >
                <MessageCircle className="h-4 w-4 text-white" />
                <span className="text-white">{locale === "ar" ? "دعم واتساب المباشر" : "WhatsApp Support"}</span>
              </a>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-bold text-white transition-all hover:scale-105"
              >
                <span className="text-white">{locale === "ar" ? "الديمو الحي" : "Live Demo"}</span>
              </Link>
            </div>
          </div>

          {/* Nav Col 1 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {locale === "ar" ? "محركات السفر" : "Travel Engines"}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#engines" className="hover:text-emerald-400 transition-colors">
                  {locale === "ar" ? "محرك الفنادق العالمي" : "Global Hotels"}
                </a>
              </li>
              <li>
                <a href="#engines" className="hover:text-emerald-400 transition-colors">
                  {locale === "ar" ? "محرك الطيران الدولي" : "Flights Engine"}
                </a>
              </li>
              <li>
                <a href="#engines" className="hover:text-emerald-400 transition-colors">
                  {locale === "ar" ? "الباقات والجولات السياحية" : "Holiday Packages & Tours"}
                </a>
              </li>
              <li>
                <a href="#engines" className="hover:text-emerald-400 transition-colors">
                  {locale === "ar" ? "تأجير السيارات والترانسفير" : "Car Rentals & Transfers"}
                </a>
              </li>
              <li>
                <a href="#engines" className="hover:text-emerald-400 transition-colors">
                  {locale === "ar" ? "التأشيرات والخدمات القنصلية" : "Visas & Services"}
                </a>
              </li>
            </ul>
          </div>

          {/* Nav Col 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {locale === "ar" ? "الذكاء الاصطناعي" : "AI & Cloud"}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#ai-suite" className="hover:text-emerald-400 transition-colors">
                  {locale === "ar" ? "الاستوديو الإبداعي والمونتاج" : "Creative Studio & Reels"}
                </a>
              </li>
              <li>
                <a href="#ai-suite" className="hover:text-emerald-400 transition-colors">
                  {locale === "ar" ? "بوت تيليجرام «انشر»" : "Telegram Approval Bot"}
                </a>
              </li>
              <li>
                <a href="#ai-suite" className="hover:text-emerald-400 transition-colors">
                  {locale === "ar" ? "إعلانات Meta CTWA و Lookalike" : "Meta WhatsApp Ads"}
                </a>
              </li>
              <li>
                <a href="#server" className="hover:text-emerald-400 transition-colors">
                  {locale === "ar" ? "سيرفر Contabo VPS ولوحة aaPanel" : "Contabo Cloud VPS"}
                </a>
              </li>
              <li>
                <a href="#server" className="hover:text-emerald-400 transition-colors">
                  {locale === "ar" ? "ترخيص الدومين المشفر" : "Fail-Closed License"}
                </a>
              </li>
            </ul>
          </div>

          {/* Nav Col 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              {locale === "ar" ? "بوابة الشركات" : "Partner Hub"}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/partners" className="hover:text-emerald-400 transition-colors font-bold text-white">
                  {locale === "ar" ? "تسجيل وشراء الترخيص" : "Purchase License"}
                </Link>
              </li>
              <li>
                <Link href="/partners" className="hover:text-emerald-400 transition-colors">
                  {locale === "ar" ? "خط تقدم تجهيز السيرفر" : "Provisioning Progress"}
                </Link>
              </li>
              <li>
                <Link href="/partners" className="hover:text-emerald-400 transition-colors">
                  {locale === "ar" ? "ربط الدومين وفحص DNS" : "Domain DNS Setup"}
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-400 transition-colors">
                  {locale === "ar" ? "لوحة تحكم الأدمن" : "Admin Panel"}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>
              &copy; {new Date().getFullYear()} Lonaliza Tourism Platform. All rights reserved.
            </span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <span>{locale === "ar" ? "العودة للأعلى" : "Back to top"}</span>
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
