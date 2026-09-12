"use client";

import {
  Brain,
  CheckCircle2,
  Eye,
  Languages,
  Layout,
  Mic,
  MousePointerClick,
  Palette,
  Scan,
  Smartphone,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function VisualBuilderSection() {
  const { locale } = useLocale();

  const builderCards = [
    {
      title: locale === "ar" ? "تعديل بصري مباشر بالسحب والإفلات" : "Visual Drag-and-Drop Editor",
      desc:
        locale === "ar"
          ? "تحكم في كل عنصر وسكشن وصورة ونص في صفحتك الرئيسية مباشرة من الواجهة مع معاينة فورية لشاشات الموبايل والتابلت والديسكتوب."
          : "Control every section, image, and heading on your homepage directly with real-time responsive mobile/desktop live preview.",
      icon: Layout,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
      title: locale === "ar" ? "وكيل الذكاء الاصطناعي (AI Builder Agent)" : "Autonomous AI Builder Agent",
      desc:
        locale === "ar"
          ? "تحدث مع وكيل الذكاء الاصطناعي بالأوامر الصوتية أو النصية؛ يغير لك ترتيب الأقسام، يصمم بانرات العروض، ويحدث المحتوى بذكاء."
          : "Command the AI Agent via voice or text prompts to redesign sections, insert offer banners, and tune themes dynamically.",
      icon: Wand2,
      color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: locale === "ar" ? "ترجمة فورية ذكية لجميع اللغات" : "Instant Multilingual AI Localization",
      desc:
        locale === "ar"
          ? "نظام ترجمة دفعي متطور يترجم موقعك كاملاً إلى العربية، الإنجليزية، التركية، الفرنسية وأي لغة تطلبها بضغطة زر واحدة."
          : "Instant batch translation translating entire site catalog to Arabic, English, Turkish, French, and any custom language.",
      icon: Languages,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: locale === "ar" ? "مدونة سياحية احترافية متوافقة مع SEO" : "SEO-Optimized Travel Blog",
      desc:
        locale === "ar"
          ? "نظام مدونة متكامل لجذب الزوار العضويين من محركات بحث جوجل مع توليد المقالات السياحية وتوزيع الكلمات المفتاحية تلقائياً."
          : "Full-featured travel blog engine generating organic Google search traffic with AI-assisted travel guides.",
      icon: Scan,
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
  ];

  return (
    <section id="builder" className="relative py-24 bg-slate-950/80 border-t border-white/10 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-400">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>
              {locale === "ar" ? "المحرر البصري والوكيل الذكي" : "Visual Builder & AI Agent"}
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {locale === "ar"
              ? "تحكم كامل في مظهر موقعك وهوية علامتك دون كتابة سطر كود واحد"
              : "Full Control Over Brand Design Without Writing a Single Line of Code"}
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            {locale === "ar"
              ? "صممنا لك محرر محتوى متطور يجمع بين سهولة السحب والإفلات اليدوي وقوة الأوامر الذكية لوكيل الـ AI المساعد."
              : "An intuitive visual builder combining visual editing with the intelligence of a dedicated AI webmaster agent."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {builderCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 hover:border-white/20 transition-all backdrop-blur-xl space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`size-12 rounded-2xl border flex items-center justify-center ${card.color}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{card.title}</h3>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
