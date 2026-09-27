"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Globe2,
  KeyRound,
  Rocket,
  Server,
  ShieldCheck,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function HowItWorks() {
  const { dir } = useLocale();
  const isRtl = dir === "rtl";

  const steps = [
    {
      number: "01",
      icon: CreditCard,
      title: "التسجيل وشراء الباقة",
      desc: "تسجيل فوري بحساب جوجل وشراء الباقة عبر الدفع الإلكتروني أو التحويل البنكي. فور الشراء يتم توليد مفتاح الترخيص الخاص بشركتك.",
    },
    {
      number: "02",
      icon: Server,
      title: "تجهيز السيرفر ولوحة aaPanel",
      desc: "يقوم فريقنا بحجز خادم Contabo VPS سحابي كامل وتثبيت لوحة aaPanel وشهادة SSL ونقل نسخة النظام النظيفة خلال 12–24 ساعة.",
    },
    {
      number: "03",
      icon: Globe2,
      title: "إدخال الدومين واختبار الربط",
      desc: "تضع دومين شركتك في لوحتك مع تعليمات توجيه سريعة عبر Cloudflare. زر فحص الاتصال يتأكد من جاهزية الدومين قبل الإطلاق.",
    },
    {
      number: "04",
      icon: Rocket,
      title: "الإطلاق الحي وبدء الحجوزات",
      desc: "يعمل موقعك فورياً تحت علامتك التجارية وهويتك، مع بيانات ديمو جاهزة لتعديلها أو حذفها جماعياً وبدء استقبال العملاء والأرباح.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-slate-900/40 relative overflow-hidden border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-semibold text-amber-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>بساطة وسرعة التنفيذ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            كيف تنطلق منصتك في{" "}
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              4 خطوات سهلة؟
            </span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            نتولى عنك كافة التفاصيل التقنية المعقدة لتتسلم منصتك جاهزة للعمل دون الحاجة لخبرة برمجية.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" dir={dir}>
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6 backdrop-blur-md flex flex-col justify-between space-y-6 hover:border-amber-500/40 transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-3xl font-black text-white/20 group-hover:text-amber-500/40 transition-colors">
                      {s.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight">{s.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
