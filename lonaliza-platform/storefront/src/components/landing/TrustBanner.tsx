"use client";

import {
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Lock,
  Mail,
  Server,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function TrustBanner() {
  const { dir } = useLocale();

  const trustItems = [
    {
      icon: Clock,
      title: "تسليم حي في 12–24 ساعة",
      desc: "نجهز الخادم وننشر نسختك ونسلّمك المفاتيح خلال يوم عمل واحد.",
    },
    {
      icon: Server,
      title: "سيرفر Contabo VPS مجاناً لسنة",
      desc: "خادم سحابي عالي الأداء مع مواصفات مميزة ولوحة تحكم aaPanel مرخصة.",
    },
    {
      icon: Lock,
      title: "شهادة SSL & حماية Cloudflare",
      desc: "اتصال مشفر 100% مع ربط مجاني بشبكة حماية كلاودفلير العالمية.",
    },
    {
      icon: Mail,
      title: "خادم بريد رسمي SMTP",
      desc: "ساب دومين مخصص mail.yourdomain مع تفعيل فوري للرسائل المؤتمتة.",
    },
    {
      icon: Database,
      title: "قاعدة بيانات PocketBase مستقلة",
      desc: "قاعدة بيانات سريعة معمارية خفيفة على ساب دومين pocketbase.yourdomain.",
    },
    {
      icon: ShieldCheck,
      title: "ترخيص مشفر لدومينك حصراً",
      desc: "حماية تامة من النسخ والاستخدام غير القانوني مع إمكانية تحديث دوري.",
    },
  ];

  return (
    <section className="relative border-y border-white/10 bg-slate-900/50 py-12 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" dir={dir}>
          {trustItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
