"use client";

import {
  Compass,
  GraduationCap,
  HelpCircle,
  MousePointer,
  Play,
  Sparkles,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function InteractiveTourPreview() {
  const { locale } = useLocale();

  const tourSteps = [
    {
      step: "01",
      title: locale === "ar" ? "لوحة القيادة والإحصائيات" : "Dashboard & Metrics",
      desc: locale === "ar" ? "متابعة الحجوزات، الإيرادات اليومية، ومصادر الزوار لحظياً." : "Real-time revenue, bookings, and customer traffic overview.",
    },
    {
      step: "02",
      title: locale === "ar" ? "إدارة الخدمات والتسعير" : "Services & Markups",
      desc: locale === "ar" ? "ضبط هوامش أرباح الفنادق والطيران وإضافة الباقات والجولات." : "Configure hotel/flight profit margins and custom packages.",
    },
    {
      step: "03",
      title: locale === "ar" ? "المحرر البصري والذكاء الاصطناعي" : "Visual Builder & AI Agent",
      desc: locale === "ar" ? "تخصيص المظهر وتوليد البرامج السياحية بضغطة زر واحدة." : "Customize design and generate tailored itineraries with AI.",
    },
    {
      step: "04",
      title: locale === "ar" ? "التسويق وأتمتة النشر" : "Marketing & Automation",
      desc: locale === "ar" ? "ربط بكسلات الإعلانات وتفعيل بوت موافقة تيليجرام «انشر»." : "Connect ad pixels and activate Telegram «Publish» approval bot.",
    },
  ];

  return (
    <section className="relative py-24 bg-slate-950 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-slate-900/60 to-slate-950 p-8 sm:p-12 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400">
                <GraduationCap className="h-4 w-4 text-emerald-400" />
                <span>
                  {locale === "ar" ? "جولة تعليمية تفاعلية مدمجة في اللوحة" : "Interactive Onboarding Tour"}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {locale === "ar"
                  ? "لن تحتاج لدورات أو تدريب معقد؛ النظام يشرح لك كل قسم خطوة بخطوة"
                  : "No Steep Learning Curve; Built-in Interactive Guide Explains Every Screen"}
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {locale === "ar"
                  ? "من زر الجولة التعليمية المدمج في هيدر لوحة التحكم، تفتح لك نافذة تفاعلية كبيرة مع سهم يبرز القسم المطلوب، يشرح ما يقدمه وكيف تضبطه حتى تتقن إدارة منظومتك باحترافية."
                  : "Click the Tour button in the admin header to start a guided walkthrough spotlighting every feature and explaining exactly how to operate your travel business."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tourSteps.map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-2 hover:border-emerald-500/30 transition-all"
                >
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    STEP {s.step}
                  </span>
                  <h3 className="text-sm font-bold text-white">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
