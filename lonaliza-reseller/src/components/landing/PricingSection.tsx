"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  HelpCircle,
  MessageCircle,
  Radio,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type PricingSectionProps = {
  lifetimePrice?: number;
  updatePrice?: number;
  supportWhatsapp?: string;
};

export default function PricingSection({
  lifetimePrice = 1990,
  updatePrice = 50,
  supportWhatsapp = "+905015709201",
}: PricingSectionProps) {
  const { dir, locale } = useLocale();
  const isRtl = dir === "rtl";

  const lifetimeFeatures = [
    locale === "ar" ? "نسخة كاملة من منظومة لوناليزا (Lonaliza) بعلامتك التجارية" : "Full Lonaliza Tourism Platform under your brand",
    locale === "ar" ? "ترخيص دومين دائم مشفر محمي ومربوط بموقعك مدى الحياة" : "Single-domain permanent encrypted license",
    locale === "ar" ? "سيرفر Contabo Cloud VPS مخصص مجاناً لمدة سنة كاملة" : "1-Year free dedicated Contabo Cloud VPS hosting",
    locale === "ar" ? "لوحة تحكم aaPanel مهيأة مع شهادات الأمان SSL مجاناً" : "Pre-installed aaPanel dashboard + SSL certificates",
    locale === "ar" ? "6 محركات حجز سياحية مدمجة (فنادق، طيران، باقات، جولات، سيارات، تأشيرات)" : "6 Unified travel engines with live GDS & RapidAPI",
    locale === "ar" ? "جناح الذكاء الاصطناعي Gemini ومولد البرامج والبروشورات PDF" : "Gemini AI suite, itinerary builder, and luxury PDFs",
    locale === "ar" ? "المحرر البصري بالسحب والإفلات مع وكيل الذكاء الاصطناعي" : "Visual drag-and-drop page builder + AI Agent",
    locale === "ar" ? "بوابات دفع iyzico بالبطاقات والتحويل البنكي عبر واتساب" : "Integrated iyzico & WhatsApp bank transfer checkout",
    locale === "ar" ? "نظام إدارة العملاء CRM ونقاط الولاء ونظام الأفلييت" : "Full CRM, loyalty reward points, and affiliate network",
    locale === "ar" ? "تسليم حي وشامل للسيرفر والموقع خلال 12–24 ساعة عمل" : "Guaranteed live handover within 12–24 hours",
  ];

  const updateFeatures = [
    locale === "ar" ? "تحديثات برمجية وأمنية ليلية تلقائية للمنظومة" : "Automated nightly software & security updates",
    locale === "ar" ? "إضافة محركات ومزودي خدمات سياحية جدد باستمرار" : "Continuous new GDS & travel supplier connectors",
    locale === "ar" ? "تطوير مستمر لنماذج الذكاء الاصطناعي وأدوات الأتمتة" : "Latest AI models, studio tools, and automation handlers",
    locale === "ar" ? "دعم فني استشاري وأولوية في معالجة الطلبات" : "Priority technical support & infrastructure monitoring",
    locale === "ar" ? "اشتراك اختياري شهري — يمكن إيقافه أو استئنافه متى شئت" : "Optional monthly subscription — cancel or resume anytime",
  ];

  const cleanWhatsapp = supportWhatsapp.replace(/[^0-9+]/g, "");

  return (
    <section id="pricing" className="relative py-24 bg-slate-950/90 border-t border-white/10 overflow-hidden">
      {/* Background Glows */}
      <div className="pointer-events-none absolute top-1/4 -right-48 w-96 h-96 bg-emerald-500/10 blur-[130px] rounded-full" />
      <div className="pointer-events-none absolute bottom-10 -left-48 w-96 h-96 bg-teal-500/10 blur-[130px] rounded-full" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>
              {locale === "ar" ? "تسعير استثماري شفاف وواضح" : "Transparent Investment Pricing"}
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {locale === "ar"
              ? "امتلك أصلك التقني مدى الحياة دون نسب اقتطاع من حجوزاتك"
              : "Own Your Technology Asset for Life with 0% Commission on Bookings"}
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            {locale === "ar"
              ? "أنت تدفع ثمن رخصة النظام والسيرفر لمرة واحدة فقط، وكافة أرباح الحجوزات وهوامش أسعار الفنادق والطيران تعود لشركتك 100%."
              : "Pay once for your permanent license and dedicated server; keep 100% of all booking markups and customer revenue."}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {/* Lifetime License Card (Hero Tier - 2 cols on desktop) */}
          <div className="lg:col-span-2 rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-slate-900/95 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl shadow-emerald-500/15 flex flex-col justify-between relative overflow-hidden">
            {/* Top Ribbon */}
            <div className="absolute top-6 end-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-1 text-xs font-black text-slate-950 shadow-md">
                <Rocket className="h-3.5 w-3.5" />
                {locale === "ar" ? "الباقة الأكثر طلباً للشركات" : "Most Popular Enterprise"}
              </span>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {locale === "ar" ? "باقة الترخيص الدائم الكاملة" : "Complete Lifetime Enterprise License"}
                </h3>
                <p className="text-sm text-slate-300">
                  {locale === "ar"
                    ? "المنصة الكاملة + السيرفر السحابي مجاناً سنة + التسليم الحي خلال 12–24 ساعة."
                    : "Complete platform + 1-Year Free Cloud VPS + 12–24h guaranteed handover."}
                </p>
              </div>

              {/* Price Tag */}
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                  ${lifetimePrice.toLocaleString()}
                </span>
                <div className="text-xs text-slate-400 font-semibold">
                  <p className="text-emerald-400 font-bold uppercase">{locale === "ar" ? "مدى الحياة (دفعة واحدة)" : "Lifetime (One-Time)"}</p>
                  <p>{locale === "ar" ? "شاملة السيرفر لسنة كاملة" : "Includes 1-Year VPS"}</p>
                </div>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6 border-t border-white/10">
                {lifetimeFeatures.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button with WHITE TEXT */}
            <div className="pt-8 mt-8 border-t border-white/10 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/partners"
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 py-4 px-6 text-base font-extrabold text-white shadow-xl shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Rocket className="h-5 w-5 text-white" />
                <span className="text-white">
                  {locale === "ar"
                    ? "شراء الترخيص وإطلاق المنصة الآن"
                    : "Buy Lifetime License & Launch Now"}
                </span>
                {isRtl ? <ArrowLeft className="h-4 w-4 text-white" /> : <ArrowRight className="h-4 w-4 text-white" />}
              </Link>

              <a
                href={`https://wa.me/${cleanWhatsapp.replace("+", "")}?text=${encodeURIComponent(
                  locale === "ar"
                    ? "مرحباً، أود الاستفسار عن شراء باقة الترخيص الدائم لمنصة لوناليزا (Lonaliza)."
                    : "Hello, I would like to inquire about purchasing the Lonaliza Lifetime Enterprise License."
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 py-4 px-6 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <MessageCircle className="h-4 w-4 text-emerald-400" />
                <span className="text-white">
                  {locale === "ar" ? "تواصل معنا عبر واتساب" : "Chat on WhatsApp"}
                </span>
              </a>
            </div>
          </div>

          {/* Optional Updates Subscription Card */}
          <div className="rounded-3xl border border-white/15 bg-white/[0.03] p-8 backdrop-blur-2xl shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {locale === "ar" ? "اشتراك اختياري" : "Optional Add-on"}
                </span>
                <h3 className="text-xl font-black text-white">
                  {locale === "ar" ? "باقة التحديثات السحابية الليلية" : "Nightly Cloud Updates Subscription"}
                </h3>
                <p className="text-xs text-slate-400">
                  {locale === "ar"
                    ? "لضمان بقاء نظامك متوافقاً مع أحدث تقنيات الـ AI ومزودي السفر الجدد."
                    : "Keeps your system updated with latest AI models and travel suppliers."}
                </p>
              </div>

              {/* Price Tag */}
              <div className="flex items-baseline gap-2 pt-2">
                <span className="text-4xl font-black text-white">${updatePrice}</span>
                <span className="text-xs text-slate-400 font-semibold">{locale === "ar" ? "/ شهرياً (اختياري)" : "/ Month (Optional)"}</span>
              </div>

              {/* Features */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                {updateFeatures.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <RefreshCw className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <Link
                href="/partners"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-purple-500/40 bg-purple-500/20 hover:bg-purple-500/30 py-3.5 px-4 text-xs font-bold text-white transition-all shadow-md"
              >
                <span className="text-white">
                  {locale === "ar" ? "إدارة الاشتراك من لوحة الشركاء" : "Manage in Partner Portal"}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
