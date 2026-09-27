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
import { pickLocaleText } from "./landing-translations";

export default function CloudArchitecture({ specsText }: { specsText?: string }) {
  const { locale, dir } = useLocale();

  const defaultSpecs =
    specsText ||
    "Cloud VPS 6 — 6 vCPU Cores, 12 GB RAM, 200 GB NVMe SSD, 1 Gbps Port, Unlimited Traffic, DDoS Protection, Free 1-Year Hosting Included.";

  return (
    <section id="server" className="relative py-24 bg-white border-t border-slate-200/80 overflow-hidden" dir={dir}>
      {/* Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-purple-500/5 blur-[140px] rounded-full" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5 text-xs font-bold text-purple-700">
            <Server className="h-3.5 w-3.5 text-purple-600" />
            <span>
              {pickLocaleText(locale, {
                ar: "السيرفر والاستضافة السحابية",
                en: "Cloud Hosting & Architecture",
                fr: "Hébergement Cloud & Architecture",
                tr: "Bulut Barındırma ve Mimari",
              })}
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {pickLocaleText(locale, {
              ar: "سيرفر Contabo VPS خاص ومستقل مع استضافة سنة كاملة مجاناً",
              en: "Dedicated Contabo VPS with 1-Year Free High-Speed Cloud Hosting",
              fr: "Serveur Dédié Contabo VPS avec 1 An d'Hébergement Cloud Offert",
              tr: "1 Yıl Ücretsiz Yüksek Hızlı Barındırma ile Bağımsız Contabo VPS Sunucusu",
            })}
          </h2>
          <p className="text-base sm:text-lg text-slate-600">
            {pickLocaleText(locale, {
              ar: "لا نشارك بياناتك في سيرفرات مشتركة؛ نوفر لك سيرفر VPS ألماني مخصص عالي الأداء مع لوحة aaPanel وشهادة SSL وضمان تشغيل 99.9%.",
              en: "No shared hosting limits; each client receives a dedicated German Contabo VPS with pre-installed aaPanel, SSL, and 99.9% uptime.",
              fr: "Aucun hébergement partagé; chaque client bénéficie d'un serveur Contabo VPS allemand dédié avec aaPanel, SSL et 99,9% de disponibilité.",
              tr: "Paylaşımlı sunucu kısıtlaması yok; her müşteri önceden yapılandırılmış aaPanel, SSL ve %99,9 çalışma süresine sahip bağımsız bir Alman Contabo VPS sunucusu alır.",
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contabo Server Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-8 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all space-y-6">
            <div className="flex items-center justify-between">
              <div className="size-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700">
                <Cpu className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Contabo VPS Free 1-Yr
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">
                {pickLocaleText(locale, {
                  ar: "مواصفات السيرفر المخصص",
                  en: "Dedicated Server Specs",
                  fr: "Spécifications du Serveur Dédié",
                  tr: "Özel Sunucu Özellikleri",
                })}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-mono">
                {defaultSpecs}
              </p>
            </div>
            <div className="space-y-2.5 pt-4 border-t border-slate-200/60 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600" />
                <span>
                  {pickLocaleText(locale, {
                    ar: "لوحة تحكم aaPanel بالعربية والإنجليزية",
                    en: "Pre-configured aaPanel Dashboard",
                    fr: "Tableau de bord aaPanel préconfiguré",
                    tr: "Önceden yapılandırılmış aaPanel paneli",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600" />
                <span>
                  {pickLocaleText(locale, {
                    ar: "شهادات أمان Let's Encrypt SSL مجانية",
                    en: "Free Let's Encrypt SSL Certificates",
                    fr: "Certificats SSL Let's Encrypt gratuits",
                    tr: "Ücretsiz Let's Encrypt SSL sertifikaları",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-600" />
                <span>
                  {pickLocaleText(locale, {
                    ar: "حماية متقدمة ضد هجمات حجب الخدمة DDoS",
                    en: "Advanced Anti-DDoS Protection",
                    fr: "Protection avancée contre les attaques DDoS",
                    tr: "Gelişmiş Anti-DDoS saldırı koruması",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Cryptographic Licensing Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-8 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all space-y-6">
            <div className="flex items-center justify-between">
              <div className="size-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-900">
                <Lock className="h-6 w-6 text-purple-900" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-900 border border-purple-200">
                Fail-Closed License
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">
                {pickLocaleText(locale, {
                  ar: "حماية ترخيص النطاق المشفر",
                  en: "Encrypted Domain Licensing",
                  fr: "Licence de Domaine Chiffrée",
                  tr: "Şifreli Alan Adı Lisansı",
                })}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {pickLocaleText(locale, {
                  ar: "بروتوكول حماية متطور يربط ترخيص النظام بدومين شركتك حصراً عند أول تفعيل، ويمنع استخدام أو تكرار الكود على أي دومين آخر.",
                  en: "Cryptographic HMAC single-domain binding ensuring your license is strictly tied to your official domain with tamper resistance.",
                  fr: "Liaison cryptographique HMAC à domaine unique garantissant que votre licence est strictement liée à votre domaine officiel.",
                  tr: "Lisansınızın yalnızca resmi alan adınıza sıkı bir şekilde bağlanmasını ve kopyalanmasını önleyen kriptografik HMAC koruması.",
                })}
              </p>
            </div>
            <div className="space-y-2.5 pt-4 border-t border-slate-200/60 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-700" />
                <span>
                  {pickLocaleText(locale, {
                    ar: "ربط فوري بالدومين الخاص بالشركة",
                    en: "Instant domain binding on first activation",
                    fr: "Liaison instantanée au domaine dès la première activation",
                    tr: "İlk etkinleştirmede anında alan adı bağlama",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-700" />
                <span>
                  {pickLocaleText(locale, {
                    ar: "فحص DNS وتوجيه تلقائي مع Cloudflare",
                    en: "Automated DNS testing & Cloudflare support",
                    fr: "Tests DNS automatisés & support Cloudflare",
                    tr: "Otomatik DNS testi ve Cloudflare desteği",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-700" />
                <span>
                  {pickLocaleText(locale, {
                    ar: "حماية حصرية للعلامة التجارية لشركتك",
                    en: "Guaranteed exclusive brand ownership",
                    fr: "Garantie de propriété exclusive de votre marque",
                    tr: "Garantili özel marka mülkiyeti",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Clean Slate & Demo Seed Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-8 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all space-y-6">
            <div className="flex items-center justify-between">
              <div className="size-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <Trash2 className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                1-Click Demo Clean
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-slate-900">
                {pickLocaleText(locale, {
                  ar: "تفريغ محتوى الديمو بضغطة زر",
                  en: "1-Click Demo Seed Purge",
                  fr: "Suppression des Données Démo en 1 Clic",
                  tr: "Tek Tıkla Demo Verilerini Temizleme",
                })}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {pickLocaleText(locale, {
                  ar: "تصلك النسخة مع محتوى سياحي وتجريبي متكامل؛ ويمكنك من لوحة التحكم بضغطة واحدة حذف كافة بيانات الديمو لبدء إدخال خدماتك الخاصة.",
                  en: "Comes pre-seeded with rich demo services, packages, and blogs; purge demo items with one click whenever you are ready.",
                  fr: "Livré pré-rempli avec des services, séjours et articles de démo complets; effacez-les en un seul clic dès que vous êtes prêt.",
                  tr: "Zengin demo turlar, oteller ve makalelerle hazır gelir; hazır olduğunuzda tek tıkla tüm demo verilerini silebilirsiniz.",
                })}
              </p>
            </div>
            <div className="space-y-2.5 pt-4 border-t border-slate-200/60 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-600" />
                <span>
                  {pickLocaleText(locale, {
                    ar: "حذف جماعي للمقالات والحجوزات التجريبية",
                    en: "Bulk delete demo trips, cars, and articles",
                    fr: "Suppression groupée des voyages, véhicules et articles démo",
                    tr: "Demo gezileri, araçları ve makaleleri toplu silme",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-600" />
                <span>
                  {pickLocaleText(locale, {
                    ar: "إبقاء كافة التكاملات والمحركات تعمل مباشرة",
                    en: "Preserve all RapidAPI & GDS live connections",
                    fr: "Maintien de toutes les connexions directes RapidAPI & GDS",
                    tr: "Tüm RapidAPI ve GDS canlı bağlantılarını koruma",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-600" />
                <span>
                  {pickLocaleText(locale, {
                    ar: "بدء الإطلاق التجاري الفعلي في نفس اليوم",
                    en: "Launch production operations on day one",
                    fr: "Lancez vos opérations commerciales dès le premier jour",
                    tr: "İlk günden itibaren canlı ticari operasyonlara başlama",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
