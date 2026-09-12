"use client";

import {
  CheckCircle2,
  Cpu,
  Database,
  Globe2,
  HardDrive,
  KeyRound,
  Layers,
  Lock,
  Radio,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function CloudArchitecture({ specsText }: { specsText?: string }) {
  const { locale } = useLocale();

  const defaultSpecs =
    specsText ||
    "Cloud VPS 6 — 6 vCPU Cores, 12 GB RAM, 200 GB NVMe SSD, 1 Gbps Port, Unlimited Traffic, DDoS Protection, Free 1-Year Hosting Included.";

  return (
    <section id="server" className="relative py-24 bg-slate-950/90 border-t border-white/10 overflow-hidden">
      {/* Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-purple-500/10 blur-[140px] rounded-full" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold text-purple-400">
            <Server className="h-3.5 w-3.5 text-purple-400" />
            <span>
              {locale === "ar" ? "السيرفر والاستضافة السحابية" : "Cloud Hosting & Architecture"}
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {locale === "ar"
              ? "سيرفر Contabo VPS خاص ومستقل مع استضافة سنة كاملة مجاناً"
              : "Dedicated Contabo VPS with 1-Year Free High-Speed Cloud Hosting"}
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            {locale === "ar"
              ? "لا نشارك بياناتك في سيرفرات مشتركة؛ نوفر لك سيرفر VPS ألماني مخصص عالي الأداء مع لوحة aaPanel وشهادة SSL وضمان تشغيل 99.9%."
              : "No shared hosting limits; each client receives a dedicated German Contabo VPS with pre-installed aaPanel, SSL, and 99.9% uptime."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contabo Server Card */}
          <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.06] to-slate-900/80 p-8 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="size-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <Cpu className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Contabo VPS Free 1-Yr
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">
                {locale === "ar" ? "مواصفات السيرفر المخصص" : "Dedicated Server Specs"}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {defaultSpecs}
              </p>
            </div>
            <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-400" />
                <span>{locale === "ar" ? "لوحة تحكم aaPanel بالعربية والإنجليزية" : "Pre-configured aaPanel Dashboard"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-400" />
                <span>{locale === "ar" ? "شهادات أمان Let's Encrypt SSL مجانية" : "Free Let's Encrypt SSL Certificates"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-400" />
                <span>{locale === "ar" ? "حماية متقدمة ضد هجمات حجب الخدمة DDoS" : "Advanced Anti-DDoS Protection"}</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Licensing Card */}
          <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.06] to-slate-900/80 p-8 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="size-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                <Lock className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Fail-Closed License
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">
                {locale === "ar" ? "حماية ترخيص النطاق المشفر" : "Encrypted Domain Licensing"}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {locale === "ar"
                  ? "بروتوكول حماية متطور يربط ترخيص النظام بدومين شركتك حصراً عند أول تفعيل، ويمنع استخدام أو تكرار الكود على أي دومين آخر."
                  : "Cryptographic HMAC single-domain binding ensuring your license is strictly tied to your official domain with tamper resistance."}
              </p>
            </div>
            <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{locale === "ar" ? "ربط فوري بالدومين الخاص بالشركة" : "Instant domain binding on first activation"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{locale === "ar" ? "فحص DNS وتوجيه تلقائي مع Cloudflare" : "Automated DNS testing & Cloudflare support"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>{locale === "ar" ? "حماية حصرية للعلامة التجارية لشركتك" : "Guaranteed exclusive brand ownership"}</span>
              </div>
            </div>
          </div>

          {/* Clean Slate & Demo Seed Card */}
          <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.06] to-slate-900/80 p-8 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="size-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                <Trash2 className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                1-Click Demo Clean
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">
                {locale === "ar" ? "تفريغ محتوى الديمو بضغطة زر" : "1-Click Demo Seed Purge"}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {locale === "ar"
                  ? "تصلك النسخة مع محتوى سياحي وتجريبي متكامل؛ ويمكنك من لوحة التحكم بضغطة واحدة حذف كافة بيانات الديمو لبدء إدخال خدماتك الخاصة."
                  : "Comes pre-seeded with rich demo services, packages, and blogs; purge demo items with one click whenever you are ready."}
              </p>
            </div>
            <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-400" />
                <span>{locale === "ar" ? "حذف جماعي للمقالات والحجوزات التجريبية" : "Bulk delete demo trips, cars, and articles"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-400" />
                <span>{locale === "ar" ? "إبقاء كافة التكاملات والمحركات تعمل مباشرة" : "Preserve all RapidAPI & GDS live connections"}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-400" />
                <span>{locale === "ar" ? "بدء الإطلاق التجاري الفعلي في نفس اليوم" : "Launch production operations on day one"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
