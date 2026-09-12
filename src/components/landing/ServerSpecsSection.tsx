"use client";

import {
  CheckCircle2,
  Cpu,
  Database,
  Globe,
  HardDrive,
  Lock,
  MemoryStick,
  Server,
  ShieldCheck,
  Terminal,
  Zap,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function ServerSpecsSection({ specsText }: { specsText?: string }) {
  const { dir } = useLocale();

  const specs = [
    {
      icon: Cpu,
      title: "6 vCPU Cores",
      desc: "معالجات سريعة لخدمة آلاف عمليات البحث عن الفنادق والطيران في الثانية",
    },
    {
      icon: MemoryStick,
      title: "12 GB RAM",
      desc: "ذاكرة وصول عشوائي فائقة للتعامل مع الذكاء الاصطناعي وبناء صفحات Next.js",
    },
    {
      icon: HardDrive,
      title: "200 GB NVMe SSD",
      desc: "أقراص NVMe فائقة السرعة لتحميل فوري للصور وقاعدة البيانات",
    },
    {
      icon: Globe,
      title: "ترافيك غير محدود (Unlimited)",
      desc: "حركة مرور مفتوحة بدون قيود على عدد الزوار أو طلبات الحجز",
    },
    {
      icon: Terminal,
      title: "لوحة aaPanel + صلاحية Root 100%",
      desc: "تحكم كامل بالسيرفر مع لوحة تحكم رسومية سهلة لإدارة النطاقات والمواقع",
    },
    {
      icon: Lock,
      title: "حماية DDoS & شهادة SSL مجانية",
      desc: "جدار حماية قوي ضد هجمات الحرمان من الخدمة وتشفير أمني كامل",
    },
  ];

  return (
    <section id="server" className="py-20 lg:py-28 bg-slate-950 relative overflow-hidden border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-950/20 via-slate-900/60 to-slate-950 p-8 sm:p-12 lg:p-16 backdrop-blur-2xl shadow-2xl relative">
          <div className="max-w-3xl space-y-4 text-right mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1 text-xs font-semibold text-purple-400">
              <Server className="h-3.5 w-3.5" />
              <span>مشمول مجاناً لمدة عام كامل مع كل باقة ترخيص</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              خادم سحابي عالي الأداء{" "}
              <span className="bg-gradient-to-r from-purple-400 to-amber-300 bg-clip-text text-transparent">
                Contabo Cloud VPS 6
              </span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {specsText ||
                "نمنحك سيرفراً حقيقياً مخصصاً لشركتك فقط، بدون مشاركة موارد أو قيود. نثبت عليه البيئة البرمجية الكاملة ولوحة aaPanel ونسلّمك بيانات الدخول."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" dir={dir}>
            {specs.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] transition-all space-y-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">{s.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
