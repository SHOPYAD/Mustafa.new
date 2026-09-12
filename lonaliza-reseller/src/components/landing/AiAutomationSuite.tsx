"use client";

import { useState } from "react";
import {
  Bot,
  Brain,
  CheckCircle2,
  Clapperboard,
  FileText,
  Flame,
  Image as ImageIcon,
  Layers,
  MapPin,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Play,
  Send,
  Share2,
  Sparkles,
  Users,
  Video,
  Workflow,
  Zap,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function AiAutomationSuite() {
  const { locale } = useLocale();

  const aiFeatures = [
    {
      id: "studio-approval",
      title: locale === "ar" ? "الاستوديو الإبداعي ونشر تيليجرام («انشر»)" : "Creative Studio & Telegram Approval",
      icon: Clapperboard,
      tag: "Autonomous Creative Flow",
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      description:
        locale === "ar"
          ? "يولد الذكاء الاصطناعي خطة النشر الأسبوعية، يصمم الصور، ويمنتج فيديوهات تيك توك وريلز بـ FFmpeg تلقائياً. يرسل النظام بطاقة المعاينة إلى تيليجرام لتعتمدها بضغطة زر أو بالرد بكلمة «انشر» ليتم النشر الفوري لكافة حساباتك."
          : "AI plans weekly content, generates visuals, and renders reels via FFmpeg. Sends preview cards to Telegram for one-click approval with «Publish» keyword.",
      bullets: [
        locale === "ar" ? "توليد صور فائقة الجودة وفيديوهات عمودية للمنصات" : "AI vertical reels generation with FFmpeg rendering",
        locale === "ar" ? "بوت تيليجرام تفاعلي للموافقة بكلمة «انشر»" : "Telegram approval webhook bot with «Publish» trigger",
        locale === "ar" ? "نشر تلقائي فوري على فيسبوك، إنستغرام، تيك توك، إكس، ويوتيوب" : "Auto-distribution to Meta, TikTok, X, and YouTube",
      ],
    },
    {
      id: "places-marketing",
      title: locale === "ar" ? "تكامل Google Places الرسمي للأفكار والمحتوى" : "Official Google Places Content Insights",
      icon: MapPin,
      tag: "Official API Intelligence",
      badgeColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      description:
        locale === "ar"
          ? "استخراج مراجعات وتقييمات المنشآت السياحية والفنادق والأنشطة عبر Google Places API الرسمي، وتحويل تجارب المسافرين الحقيقية إلى منشورات ومقالات مدونة جاذبة مع احترام كامل لمعايير الخصوصية."
          : "Fetch genuine tourism spot reviews via official Google Places API to fuel engaging marketing stories and SEO blog articles.",
      bullets: [
        locale === "ar" ? "جلب مراجعات الأماكن السياحية باللغة العربية والعالمية" : "Multilingual tourist spot review intelligence",
        locale === "ar" ? "استلهام أفكار الحملات الإعلانية من تقييمات المسافرين" : "Derive high-converting ad copy from traveler feedback",
        locale === "ar" ? "امتثال كامل لسياسات الخصوصية وحماية البيانات" : "100% compliant with Google Maps data privacy rules",
      ],
    },
    {
      id: "meta-ctwa",
      title: locale === "ar" ? "إعلانات Meta و WhatsApp (CTWA) وجماهير Lookalike" : "Meta Click-to-WhatsApp Ads & Lookalikes",
      icon: Megaphone,
      tag: "High-ROI Lead Generation",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      description:
        locale === "ar"
          ? "توليد حملات إعلانية مباشرة تقود العملاء إلى واتساب الشركة (Click-to-WhatsApp) واستخراج جماهير مشابهة (Lookalike) رسمياً من قاعدة عملاء المنصة كمسودات آمنة بحالة PAUSED لتعتمدها وتطلقها."
          : "Generate Click-to-WhatsApp Meta campaigns and build Lookalike audiences from PocketBase CRM customer data in safe PAUSED state.",
      bullets: [
        locale === "ar" ? "إنشاء جماهير مخصصة (Custom Audiences) من عملاء النظام" : "Build high-intent custom audiences from CRM buyers",
        locale === "ar" ? "توليد حملات واتساب تفاعلية بأسعار ونصوص جذابة" : "Launch Click-to-WhatsApp campaigns for direct bookings",
        locale === "ar" ? "تحكم كامل في الميزانيات وتفعيل الإعلانات بضغطة زر" : "Safe PAUSED draft mode with one-click budget activation",
      ],
    },
    {
      id: "itinerary-pdf",
      title: locale === "ar" ? "توليد البرامج السياحية والبروشورات الذكية" : "Gemini AI Itinerary & Luxury PDF Builder",
      icon: Brain,
      tag: "Smart Travel Itineraries",
      badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
      description:
        locale === "ar"
          ? "مولد برامج سياحية متطور مدعوم بـ Gemini AI يصمم جداول الرحلات اليومية حسب رغبة العميل، يوزع الفنادق والجولات، ويصدر ملف PDF فاخر بشعار الشركة وعلامتها التجارية جاهزاً للطباعة والإرسال."
          : "Generate tailored day-by-day travel itineraries with Gemini AI and export branded, luxury PDF client brochures instantly.",
      bullets: [
        locale === "ar" ? "تخطيط جدول الأيام والمزارات والوجبات والمواصلات" : "Day-by-day schedule with attractions and transfers",
        locale === "ar" ? "تصدير ملف بروشور PDF فندقي أنيق بعلامة شركتك" : "Export luxury branded PDF quotation brochures",
        locale === "ar" ? "مساعد مبيعات ذكي يجيب استفسارات المسافرين 24/7" : "24/7 AI sales assistant closing travel inquiries",
      ],
    },
  ];

  return (
    <section id="ai-suite" className="relative py-24 bg-slate-950 border-t border-white/10 overflow-hidden">
      {/* Background Lighting */}
      <div className="pointer-events-none absolute top-1/2 -right-48 w-96 h-96 bg-purple-500/10 blur-[130px] rounded-full" />
      <div className="pointer-events-none absolute bottom-0 -left-48 w-96 h-96 bg-emerald-500/10 blur-[130px] rounded-full" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-400">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>
              {locale === "ar" ? "جناح الذكاء الاصطناعي والأتمتة المستقلة" : "Autonomous AI & Marketing Suite"}
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {locale === "ar"
              ? "فريق تسويق وإنتاج محتوى آلي يعمل لخدمة شركتك على مدار الساعة"
              : "An Autonomous AI Marketing Engine Working 24/7"}
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            {locale === "ar"
              ? "وداعاً للتكاليف الباهظة لإدارة الحملات وصناعة المحتوى؛ منصة لوناليزا تدير دمج الذكاء الاصطناعي، صناعة الفيديو، النشر الاجتماعي، وحملات واتساب المباشرة في دورة عمل مؤتمتة متكاملة."
              : "Automate social media publishing, video creation, review scraping, and Meta WhatsApp ad campaigns through one unified AI system."}
          </p>
        </div>

        {/* 4 Feature Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {aiFeatures.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-slate-900/60 p-8 hover:border-white/20 transition-all backdrop-blur-xl shadow-xl space-y-6"
              >
                {/* Top Badge & Icon */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                      <Icon className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${feat.badgeColor}`}>
                        {feat.tag}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                {/* Bullet Points */}
                <div className="space-y-2.5 pt-3 border-t border-white/5">
                  {feat.bullets.map((b, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
