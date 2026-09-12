"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Flame,
  Globe2,
  Hotel,
  Layers,
  MapPin,
  Plane,
  Play,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function LandingHero({ lifetimePrice = 1990 }: { lifetimePrice?: number }) {
  const { dir, locale } = useLocale();
  const isRtl = dir === "rtl";
  const [activeTab, setActiveTab] = useState<"hotels" | "flights" | "ai" | "automation">("hotels");

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-18 md:pb-28 lg:pt-20 lg:pb-32 bg-slate-950">
      {/* Dynamic Ambient Background Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent blur-[140px] rounded-full" />
      <div className="pointer-events-none absolute top-1/3 -left-48 w-[450px] h-[450px] bg-amber-500/10 blur-[120px] rounded-full" />
      <div className="pointer-events-none absolute bottom-10 -right-48 w-[450px] h-[450px] bg-cyan-500/10 blur-[120px] rounded-full" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400 backdrop-blur-md shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>
              {locale === "ar"
                ? "منصة لوناليزا — نظام التشغيل السياحي الذكي المتكامل للشركات 2026"
                : locale === "tr"
                  ? "Lonaliza — 2026 Akıllı Entegre Turizm İşletim Sistemi"
                  : locale === "fr"
                    ? "Plateforme Lonaliza — Système d'exploitation touristique intelligent 2026"
                    : "Lonaliza Platform — Smart Tourism Operating System for Enterprises 2026"}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.15] font-sans">
            {locale === "ar" ? (
              <>
                امتلك منصتك السياحية المتكاملة{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent underline decoration-emerald-500/40 decoration-wavy decoration-2">
                  بعلامتك التجارية
                </span>{" "}
                مع سيرفر خاص وترخيص دائم
              </>
            ) : locale === "tr" ? (
              <>
                Kendi Markanızla{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  Entegre Seyahat Platformunuza
                </span>{" "}
                Sahip Olun
              </>
            ) : locale === "fr" ? (
              <>
                Possédez votre plateforme touristique{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  sous votre propre marque
                </span>{" "}
                avec serveur dédié et licence à vie
              </>
            ) : (
              <>
                Own Your Complete Travel Platform{" "}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                  Under Your Brand
                </span>{" "}
                With Dedicated Cloud Server & Lifetime License
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-3xl">
            {locale === "ar"
              ? "منظومة لوناليزا (Lonaliza) المتطورة توفر 6 محركات حجز عالمية، جناح ذكاء اصطناعي وأتمتة متقدمة للنشر والتسويق، محرر بصري بالسحب والإفلات، مع سيرفر Contabo VPS ولوحة aaPanel جاهزة للتسليم الحي خلال 12–24 ساعة."
              : locale === "tr"
                ? "Lonaliza platformu 6 küresel rezervasyon motoru, yapay zeka içerik ve otomasyon paketi, görsel sayfa düzenleyici ve 12-24 saatte teslim edilen özel Contabo VPS sunucusu sunar."
                : locale === "fr"
                  ? "La plateforme Lonaliza offre 6 moteurs de réservation mondiaux, une suite d'automatisation IA, un éditeur visuel glisser-déposer, et un serveur Contabo VPS livré en 12 à 24 heures."
                  : "Lonaliza enterprise platform delivers 6 global booking engines, autonomous AI marketing studio, drag-and-drop page builder, with dedicated Contabo Cloud VPS delivered within 12–24 hours."}
          </p>

          {/* Primary CTA Buttons with WHITE TEXT */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2">
            <Link
              href="/partners"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 px-9 py-4 text-base font-extrabold text-white hover:brightness-110 shadow-xl shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Rocket className="h-5 w-5 text-white" />
              <span className="text-white">
                {locale === "ar"
                  ? `امتلك نظامك الآن — $${lifetimePrice.toLocaleString()} مدى الحياة`
                  : locale === "tr"
                    ? `Hemen Sahip Olun — $${lifetimePrice.toLocaleString()} Ömür Boyu`
                    : locale === "fr"
                      ? `Obtenez votre système — $${lifetimePrice.toLocaleString()} à vie`
                      : `Get Your Platform — $${lifetimePrice.toLocaleString()} Lifetime`}
              </span>
              {isRtl ? <ArrowLeft className="h-4 w-4 text-white" /> : <ArrowRight className="h-4 w-4 text-white" />}
            </Link>

            <Link
              href="/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl border border-white/20 bg-white/[0.07] hover:bg-white/[0.13] px-8 py-4 text-base font-bold text-white backdrop-blur-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md"
            >
              <Play className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span className="text-white">
                {locale === "ar"
                  ? "استكشف الديمو الحي للحجوزات"
                  : locale === "tr"
                    ? "Canlı Rezervasyon Demosunu Keşfet"
                    : locale === "fr"
                      ? "Explorer la démo en direct"
                      : "Explore Live Booking Demo"}
              </span>
            </Link>
          </div>
        </div>

        {/* Hero Interactive App Mockup Preview */}
        <div className="mt-14 lg:mt-18 relative mx-auto max-w-5xl rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/95 to-slate-950/95 p-3 sm:p-5 shadow-2xl backdrop-blur-2xl shadow-emerald-500/10">
          {/* Top Browser Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-3 px-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-black/50 px-4 py-1.5 text-xs font-mono text-slate-300 border border-white/10">
              <Globe2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>https://yourcompany.com/</span>
            </div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>
                {locale === "ar" ? "ترخيص رسمي مفعل" : "Verified License"}
              </span>
            </div>
          </div>

          {/* Interactive Feature Showcase Tabs */}
          <div className="pt-4 px-2">
            <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => setActiveTab("hotels")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "hotels"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Hotel className="h-4 w-4 text-emerald-400" />
                <span>{locale === "ar" ? "محرك الفنادق العالمي" : "Global Hotels Engine"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("flights")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "flights"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Plane className="h-4 w-4 text-cyan-400" />
                <span>{locale === "ar" ? "محرك الطيران المباشر GDS" : "Live Flights Engine"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("ai")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "ai"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Bot className="h-4 w-4 text-purple-400" />
                <span>{locale === "ar" ? "وكيل الذكاء الاصطناعي والمحرر" : "AI Agent & Builder"}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("automation")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "automation"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Zap className="h-4 w-4 text-amber-400" />
                <span>{locale === "ar" ? "استوديو الأتمتة ونشر تيليجرام" : "Automation Studio"}</span>
              </button>
            </div>

            {/* Tab Preview Content */}
            <div className="py-4">
              {activeTab === "hotels" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      TripAdvisor & Booking.com15
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {locale === "ar"
                        ? "بحث حي وفوري في أكثر من 500,000 فندق حول العالم مع أسعار الغرف وصور عالية الدقة."
                        : "Instant live search across 500,000+ worldwide hotels with room rates and HD photos."}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Dynamic Profit Markup
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {locale === "ar"
                        ? "تحديد هامش ربحك بالنسبة المئوية أو القيمة الثابتة تلقائياً من لوحة التحكم."
                        : "Set your custom profit margin percentage or fixed fee directly from the dashboard."}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Instant Multi-Currency
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {locale === "ar"
                        ? "تحويل فوري لأسعار الصرف (USD, EUR, SAR, AED, TRY) مع بوابات دفع آمنة."
                        : "Real-time exchange rate conversion with integrated iyzico and bank checkout."}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "flights" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                      SkyScrapper Live GDS
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {locale === "ar"
                        ? "ربط مباشر بأسعار أكثر من 900 شركة طيران عالمية ذهاب وعودة ورحلات متعددة."
                        : "Direct connection to 900+ global airlines for round-trip, one-way, and multi-city flights."}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                      Interactive Price Calendar
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {locale === "ar"
                        ? "تقويم أسعار مرن يوضح أرخص أيام السفر مع تفاصيل الأمتعة واختيار المقاعد."
                        : "Visual fare calendar highlighting lowest price travel dates and baggage rules."}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                      Automated E-Ticket Invoicing
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {locale === "ar"
                        ? "إصدار تذاكر إلكترونية وفواتير PDF برقم الحجز وبيانات المسافرين آلياً."
                        : "Generate branded e-tickets and PDF invoices with PNR and passenger details."}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "ai" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-purple-400" />
                      Gemini Itinerary Generator
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {locale === "ar"
                        ? "توليد برامج سياحية متكاملة بالذكاء الاصطناعي مع صور الأماكن وتصدير بروشور PDF فاخر."
                        : "Generate complete AI travel itineraries with destination imagery and export luxury PDF brochures."}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-purple-400" />
                      AI Builder Agent
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {locale === "ar"
                        ? "تعديل أقسام الصفحة الرئيسية وتنسيق الألوان بالصوت أو النص عبر وكيل الذكاء الاصطناعي."
                        : "Modify homepage sections, colors, and layout via voice and text prompts with AI Agent."}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-purple-400" />
                      24/7 AI Sales Copilot
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {locale === "ar"
                        ? "مساعد مبيعات ذكي يجيب استفسارات العملاء على الموقع، يقترح الفنادق، ويغلق الحجوزات."
                        : "24/7 intelligent sales assistant answering visitor queries, recommending hotels, and driving bookings."}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "automation" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-amber-400" />
                      Telegram «انشر» Approval Bot
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {locale === "ar"
                        ? "توليد منشورات وفيديوهات بالـ AI وإرسالها لتيليجرام لتعاينها وتوافق عليها بكلمة «انشر»."
                        : "Generate AI posts/videos and receive approval cards on Telegram to publish with one click."}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-amber-400" />
                      Google Places & Meta CTWA
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {locale === "ar"
                        ? "جلب مراجعات Places الرسمية للمحتوى، وتوليد إعلانات Click-to-WhatsApp وجماهير Lookalike."
                        : "Fetch official Places reviews for content ideas, and create Meta Click-to-WhatsApp ads & lookalikes."}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-amber-400" />
                      Multi-Social Publishing
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {locale === "ar"
                        ? "نشر فوري متزامن على صفحات فيسبوك، إنستغرام، تيك توك، إكس، ويوتيوب تلقائياً."
                        : "Automated simultaneous publishing to Facebook, Instagram, TikTok, X, and YouTube."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
