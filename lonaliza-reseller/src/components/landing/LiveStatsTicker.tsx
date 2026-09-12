"use client";

import { Clock, Cpu, Globe2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function LiveStatsTicker() {
  const { locale } = useLocale();

  const stats = [
    {
      icon: Clock,
      value: "12–24h",
      label:
        locale === "ar"
          ? "تسليم السيرفر والموقع كاملاً"
          : locale === "tr"
            ? "Tam Sunucu ve Site Teslimatı"
            : locale === "fr"
              ? "Livraison complète serveur & site"
              : "Complete Server & Site Delivery",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
    {
      icon: Cpu,
      value: "Contabo VPS",
      label:
        locale === "ar"
          ? "سيرفر سحابي مخصص مجاناً سنة"
          : locale === "tr"
            ? "1 Yıl Ücretsiz Özel Bulut Sunucu"
            : locale === "fr"
              ? "Serveur Cloud VPS gratuit 1 an"
              : "1-Year Free Dedicated Cloud VPS",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      icon: ShieldCheck,
      value: "Fail-Closed",
      label:
        locale === "ar"
          ? "ترخيص مشفر مربوط بدومينك حصراً"
          : locale === "tr"
            ? "Alan Adınıza Özel Şifreli Lisans"
            : locale === "fr"
              ? "Licence chiffrée liée à votre domaine"
              : "Encrypted Single-Domain License",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      icon: Sparkles,
      value: "Gemini AI",
      label:
        locale === "ar"
          ? "جناح الذكاء الاصطناعي والأتمتة"
          : locale === "tr"
            ? "Yapay Zeka ve Otomasyon Paketi"
            : locale === "fr"
              ? "Suite IA & Automatisation intégrée"
              : "Built-in AI & Automation Suite",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
    },
    {
      icon: Globe2,
      value: "6 Engines",
      label:
        locale === "ar"
          ? "محركات سياحية عالمية موحدة"
          : locale === "tr"
            ? "6 Entegre Küresel Seyahat Motoru"
            : locale === "fr"
              ? "6 Moteurs de voyage unifiés"
              : "6 Unified Global Travel Engines",
      color: "text-teal-400",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/20",
    },
  ];

  return (
    <div className="w-full border-y border-white/10 bg-slate-950/60 backdrop-blur-md py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all group"
              >
                <div
                  className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bgColor} border ${stat.borderColor} ${stat.color} group-hover:scale-110 transition-transform`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-white tracking-tight truncate">
                    {stat.value}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400 leading-snug line-clamp-2">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
