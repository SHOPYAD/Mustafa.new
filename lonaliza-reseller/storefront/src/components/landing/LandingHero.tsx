"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Building2,
  CheckCircle2,
  Crown,
  ExternalLink,
  Globe2,
  Hotel,
  Layers,
  Link2,
  Lock,
  Plane,
  Play,
  Rocket,
  ShieldCheck,
  Sparkles,
  Zap,
  Server,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getLandingLocale, LANDING_TRANSLATIONS, pickLocaleText } from "./landing-translations";
import WhiteLabelOnboardingModal from "./WhiteLabelOnboardingModal";

export default function LandingHero({ lifetimePrice = 1990 }: { lifetimePrice?: number }) {
  const { dir, locale } = useLocale();
  const isRtl = dir === "rtl";
  const langKey = getLandingLocale(locale);
  const tHero = LANDING_TRANSLATIONS[langKey].hero;
  const rotatingFeatures = tHero.rotating;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [wlModalOpen, setWlModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % rotatingFeatures.length);
        setIsAnimating(false);
      }, 300);
    }, 2800);

    return () => clearInterval(timer);
  }, [rotatingFeatures.length]);

  const activeFeature = rotatingFeatures[currentIndex] || rotatingFeatures[0];

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-24 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white via-purple-50/20 to-white text-slate-900 border-b border-slate-200">
      {/* Dynamic Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-purple-500/10 via-amber-500/5 to-transparent blur-[140px] rounded-full" />
      <div className="pointer-events-none absolute top-1/3 -left-48 w-[450px] h-[450px] bg-purple-500/10 blur-[120px] rounded-full" />
      <div className="pointer-events-none absolute bottom-10 -right-48 w-[450px] h-[450px] bg-amber-500/10 blur-[120px] rounded-full" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          {/* Trust Badge - Daylight Luxury Style */}
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200/90 bg-gradient-to-r from-purple-50/90 via-amber-50/50 to-purple-50/90 px-4 py-1.5 text-xs font-bold text-purple-950 shadow-2xs">
            <ShieldCheck className="h-4 w-4 text-purple-700" />
            <span>{tHero.trustBadge}</span>
          </div>

          {/* Main Title with Animated Dynamic Feature Text */}
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl leading-[1.2] font-sans text-balance">
            {tHero.headlineStart}{" "}
            <span className="relative inline-block my-1">
              <span
                className={`inline-block px-3 py-1 rounded-2xl bg-gradient-to-r from-[#2e1065] via-[#4c1d95] to-[#d97706] bg-clip-text text-transparent transition-all duration-300 transform ${
                  isAnimating ? "opacity-0 -translate-y-2 scale-95" : "opacity-100 translate-y-0 scale-100"
                }`}
              >
                {activeFeature.text}
              </span>
              {/* Custom SVG Decorative Wavy Underline in Lustrous Amber Gold */}
              <svg
                className="absolute -bottom-2.5 left-0 right-0 w-full h-3 text-[#d97706] pointer-events-none"
                viewBox="0 0 260 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M4 8C60 2 180 1 256 7"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            {tHero.headlineEnd}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-3xl text-balance">
            {tHero.subheadline}
          </p>

          {/* Infinite Auto-Scrolling Feature Marquee Ticker */}
          <div className="w-full max-w-5xl mx-auto overflow-hidden relative py-2 select-none partner-marquee group">
            {/* Gradient Fades for Smooth Edge Transitions */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-white to-transparent z-10" />

            <div className="partner-marquee-track flex items-center gap-3" style={{ "--partner-marquee-duration": "30s" } as React.CSSProperties}>
              {[1, 2].map((iter) => (
                <div key={iter} className="flex items-center gap-3 shrink-0">
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-xs font-black text-amber-950 shadow-2xs hover:border-amber-500 transition-colors">
                    <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>
                      {pickLocaleText(locale, {
                        ar: "العلامة البيضاء (White Label) تبدأ من 0$ شهرياً",
                        en: "White Label Starting at $0 / Month",
                        fr: "White Label à partir de 0 $ / mois",
                        tr: "White Label Aylık 0$'dan Başlayan Fiyatlarla",
                      })}
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-800 shadow-2xs hover:border-amber-400 transition-colors">
                    <Plane className="h-4 w-4 text-[#b18a52] shrink-0" />
                    <span>
                      {pickLocaleText(locale, {
                        ar: "+500 شركة طيران ومئات آلاف الفنادق بأسعار الجملة",
                        en: "+500 Airlines & Global Hotels at Wholesale Rates",
                        fr: "+500 Compagnies Aériennes & Hôtels aux Tarifs de Gros",
                        tr: "+500 Havayolu ve Küresel Oteller Toptan Fiyatlarla",
                      })}
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-800 shadow-2xs hover:border-amber-400 transition-colors">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      {pickLocaleText(locale, {
                        ar: "0% عمولات مبيعات (أرباحك 100% لك)",
                        en: "0% Sales Fees (100% Retained by You)",
                        fr: "0% Commission (100% Conservé par Vous)",
                        tr: "%0 Satış Komisyonu (Kazancınız %100 Sizin)",
                      })}
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-800 shadow-2xs hover:border-purple-400 transition-colors">
                    <Server className="h-4 w-4 text-purple-700 shrink-0" />
                    <span>
                      {pickLocaleText(locale, {
                        ar: "سيرفر Contabo VPS ألماني مخصص مجاناً سنة",
                        en: "1-Year Free German Contabo VPS Server",
                        fr: "Serveur VPS Contabo Dédié Gratuit 1 An",
                        tr: "1 Yıl Ücretsiz Bağımsız Alman Contabo VPS",
                      })}
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-800 shadow-2xs hover:border-purple-400 transition-colors">
                    <Bot className="h-4 w-4 text-purple-800 shrink-0" />
                    <span>
                      {pickLocaleText(locale, {
                        ar: "سرب الذكاء الاصطناعي وأتمتة واتساب 24/7",
                        en: "AI Swarm & 24/7 WhatsApp Automation",
                        fr: "Essaim d'IA & Automatisation WhatsApp 24/7",
                        tr: "Yapay Zeka Sürüsü ve 7/24 WhatsApp Otomasyonu",
                      })}
                    </span>
                  </span>

                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-800 shadow-2xs hover:border-amber-400 transition-colors">
                    <Zap className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>
                      {pickLocaleText(locale, {
                        ar: "محفظة B2B مدمجة مع شحن فوري بالبطاقة",
                        en: "Integrated B2B Wallet with Instant Card Deposit",
                        fr: "Portefeuille B2B Intégré avec Recharge Carte",
                        tr: "Anında Kart Yüklemeli Entegre B2B Cüzdan",
                      })}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto pt-2">
            <Link
              href="/partners"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] hover:from-[#3b0764] hover:to-[#581c87] px-8 py-4 text-base font-black text-white shadow-xl shadow-purple-950/25 hover:scale-[1.02] active:scale-[0.98] transition-all border border-purple-800/40"
            >
              <Rocket className="h-5 w-5 text-amber-300" />
              <span className="text-white">
                {pickLocaleText(locale, {
                  ar: `امتلك نظامك الآن — $${lifetimePrice.toLocaleString()} مدى الحياة`,
                  en: `Get Your Platform — $${lifetimePrice.toLocaleString()} Lifetime`,
                  fr: `Obtenez Votre Plateforme — $${lifetimePrice.toLocaleString()} à Vie`,
                  tr: `Platformunuza Sahip Olun — $${lifetimePrice.toLocaleString()} Ömür Boyu`,
                })}
              </span>
              {isRtl ? <ArrowLeft className="h-4 w-4 text-amber-300" /> : <ArrowRight className="h-4 w-4 text-amber-300" />}
            </Link>

            <button
              type="button"
              onClick={() => setWlModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 px-7 py-4 text-base font-black text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-slate-950" />
              <span>
                {pickLocaleText(locale, {
                  ar: "أو أطلق علامتك البيضاء فوراً (0$)",
                  en: "Or Launch White Label Instantly ($0)",
                  fr: "Ou Lancez Votre White Label (0 $)",
                  tr: "Veya White Label'ı Hemen Başlatın (0$)",
                })}
              </span>
            </button>

            <a
              href="#interactive-demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl border border-purple-200/80 bg-white hover:bg-purple-50/50 px-6 py-4 text-base font-bold text-slate-900 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xs"
            >
              <Play className="h-4 w-4 text-[#b18a52] fill-[#b18a52]" />
              <span>
                {pickLocaleText(locale, {
                  ar: "استعراض بيئة العمل التفاعلية",
                  en: "Browse Interactive Ecosystem",
                  fr: "Explorer l'Écosystème Interactif",
                  tr: "Etkileşimli Ekosistemi Keşfedin",
                })}
              </span>
            </a>
          </div>
        </div>

        {/* REAL LIVE DASHBOARD IFRAME EMBED WITH SMOOTH SCROLL */}
        <div className="mt-14 lg:mt-18 relative mx-auto max-w-6xl rounded-3xl border border-slate-300 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden">
          {/* Top Safari/MacBook Window Bar */}
          <div className="bg-slate-900 px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-800 select-none">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-rose-500 inline-block opacity-90" />
                <span className="size-3 rounded-full bg-amber-500 inline-block opacity-90" />
                <span className="size-3 rounded-full bg-amber-400 inline-block opacity-90" />
              </div>
              <span className="text-xs font-bold text-slate-300 ms-3 hidden sm:inline-block font-mono">
                LONALIZA DASHBOARD LIVE PREVIEW
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-1.5 text-xs font-mono text-slate-300 border border-slate-700">
              <Lock className="h-3 w-3 text-amber-400" />
              <span>https://your-agency.com/admin/dashboard</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-purple-950/80 border border-amber-500/40 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline-block">
                {langKey === "ar"
                  ? "بيئة تفاعلية مؤمنة"
                  : langKey === "fr"
                  ? "Environnement Sécurisé"
                  : langKey === "tr"
                  ? "Güvenli Sandbox Alanı"
                  : "Secure Interactive Sandbox"}
              </span>
            </div>
          </div>

          {/* Sub-Header Notice Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-amber-500" />
              <span className="font-bold text-slate-800">
                {langKey === "ar"
                  ? "لوحة القيادة والمؤشرات التنفيذية المحدثة لحظياً:"
                  : langKey === "fr"
                  ? "Tableau de bord exécutif et métriques opérationnelles en temps réel :"
                  : langKey === "tr"
                  ? "Gerçek zamanlı operasyonel metrikler ve yönetici paneli:"
                  : "Executive dashboard & real-time operational metrics:"}
              </span>
            </div>
            <a
              href="/preview/dashboard"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-bold text-purple-800 hover:text-purple-950"
            >
              <span>
                {langKey === "ar"
                  ? "عرض موسّع في نافذة مستقلة"
                  : langKey === "fr"
                  ? "Ouvrir en Plein Écran"
                  : langKey === "tr"
                  ? "Yeni Sekmede Büyüt"
                  : "Expand Full Window"}
              </span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Real Embedded Dashboard Iframe */}
          <div className="relative w-full h-[580px] sm:h-[680px] bg-white">
            <iframe
              key={`hero-dashboard-${locale}`}
              src={`/preview/dashboard?locale=${locale}&lang=${locale}`}
              title="Live Admin Dashboard Preview"
              className="w-full h-full border-0 bg-white"
              loading="eager"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          </div>
        </div>
      </div>

      {/* White Label Instant Onboarding Modal */}
      <WhiteLabelOnboardingModal
        isOpen={wlModalOpen}
        onClose={() => setWlModalOpen(false)}
        initialPlan="whitelabel_free"
      />
    </section>
  );
}
