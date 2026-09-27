"use client";

import {
  Building2,
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
  Zap,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pickLocaleText } from "./landing-translations";

export default function EnterpriseOwnershipAndInfrastructure() {
  const { dir, locale } = useLocale();

  const ownershipPillars = [
    {
      title: pickLocaleText(locale, {
        ar: "ترخيص دومين حصري ومشفر",
        en: "Exclusive Single-Domain License",
        fr: "Licence de Domaine Chiffrée & Exclusive",
        tr: "Özel Şifreli Tek Alan Adı Lisansı",
      }),
      desc: pickLocaleText(locale, {
        ar: "يصدر الترخيص مشفراً باسم دومين شركتك الرسمي مدى الحياة. النظام غير قابل لإعادة البيع أو التوزيع، ما يضمن تفرد علامتك وحماية أصولك البرمجية.",
        en: "Encrypted permanent license issued exclusively to your single corporate domain. Non-resellable and proprietary to your agency.",
        fr: "Licence permanente chiffrée délivrée exclusivement à votre domaine d'entreprise. Non revendable et propriétaire pour votre agence.",
        tr: "Yalnızca resmi kurumsal alan adınıza özel olarak verilen şifreli kalıcı lisans. Yeniden satılamaz ve acentenize özel mülkiyet sağlar.",
      }),
      icon: KeyRound,
      badge: pickLocaleText(locale, {
        ar: "ترخيص دائم",
        en: "Single-Domain",
        fr: "Domaine Unique",
        tr: "Tek Alan Adı",
      }),
    },
    {
      title: pickLocaleText(locale, {
        ar: "سيرفر Contabo VPS سحابي مستقل",
        en: "Dedicated Contabo Cloud VPS",
        fr: "Serveur Cloud VPS Contabo Dédié",
        tr: "Bağımsız Contabo Bulut VPS",
      }),
      desc: pickLocaleText(locale, {
        ar: "سيرفر ألماني خاص بوكالتك 100% مع لوحة aaPanel وشهادة SSL وضمان تشغيل 99.9%. لا نشارك بياناتك أو مواردهم مع أي موقع آخر.",
        en: "Dedicated German Contabo cloud server 100% isolated for your agency with aaPanel, SSL, and 99.9% uptime SLA.",
        fr: "Serveur cloud allemand Contabo 100% isolé pour votre agence avec aaPanel, SSL et 99,9% de disponibilité garantie.",
        tr: "Acentenize özel %100 izole edilmiş, aaPanel, SSL ve %99,9 kesintisiz çalışma garantili bağımsız Alman Contabo bulut sunucusu.",
      }),
      icon: Server,
      badge: pickLocaleText(locale, {
        ar: "معزول 100%",
        en: "Isolated 100%",
        fr: "Isolé 100%",
        tr: "%100 İzole",
      }),
    },
    {
      title: pickLocaleText(locale, {
        ar: "0% عمولات — الأرباح لك بالكامل",
        en: "0% Middle-man Commissions",
        fr: "0% de Commission Intermédiaire",
        tr: "%0 Aracı Komisyonu — Kazanç Tamamen Sizin",
      }),
      desc: pickLocaleText(locale, {
        ar: "على عكس منصات الحجز المستأجرة التي تستقطع نسباً من كل تذكرة، كافة هوامش الأسعار وأرباح الفنادق تودع في حسابك البنكي مباشرة.",
        en: "Unlike multi-tenant SaaS platforms charging percentage cuts, 100% of all customer booking markup revenues belong to your company.",
        fr: "Contrairement aux plateformes SaaS qui prélèvent des commissions, 100% de vos marges et gains sont versés directement sur votre compte bancaire.",
        tr: "Yüzdelik pay kesen SaaS platformlarının aksine, tüm rezervasyon kâr marjları ve kazançları doğrudan şirketinizin banka hesabına geçer.",
      }),
      icon: ShieldCheck,
      badge: pickLocaleText(locale, {
        ar: "أرباحك 100%",
        en: "100% Yours",
        fr: "100% à Vous",
        tr: "%100 Sizin",
      }),
    },
    {
      title: pickLocaleText(locale, {
        ar: "تحكم كامل في قواعد البيانات والنسخ",
        en: "Full Database & Backup Ownership",
        fr: "Contrôle Total des Données & Sauvegardes",
        tr: "Veritabanı ve Yedekleme Üzerinde Tam Kontrol",
      }),
      desc: pickLocaleText(locale, {
        ar: "قواعد بيانات العملاء والحجوزات والمعاملات المالية مخزنة في سيرفرك الخاص، مع نسخ احتياطي تلقائي وسري للبيانات في بيئة آمنة.",
        en: "All traveler data, reservations, and payment logs reside on your private database with automated disaster recovery backups.",
        fr: "Toutes les données clients, réservations et paiements résident sur votre base de données privée avec sauvegardes automatiques.",
        tr: "Tüm müşteri verileri, rezervasyonlar ve finansal kayıtlar otomatik yedekleme ile kendi özel sunucu veritabanınızda tutulur.",
      }),
      icon: Database,
      badge: pickLocaleText(locale, {
        ar: "بياناتك مشفرة",
        en: "Data Sovereignty",
        fr: "Souveraineté Données",
        tr: "Veri Hakimiyeti",
      }),
    },
  ];

  return (
    <section className="relative py-24 bg-slate-50/70 border-t border-slate-200 overflow-hidden" dir={dir}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5 text-xs font-bold text-purple-950 shadow-xs">
            <ShieldCheck className="h-4 w-4 text-purple-700" />
            <span>
              {pickLocaleText(locale, {
                ar: "الملكية التقنية الكاملة واستقلالية المنظومة",
                en: "Enterprise Technical Ownership & Infrastructure Sovereignty",
                fr: "Propriété Technique Totale & Souveraineté d'Infrastructure",
                tr: "Tam Teknik Mülkiyet ve Altyapı Bağımsızlığı",
              })}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight text-balance">
            {pickLocaleText(locale, {
              ar: "امتلك أصلاً تقنياً دائماً ومحمياً مخصصاً لوكالتك السياحية بالكامل",
              en: "Own A Permanent Technical Asset Exclusive To Your Tourism Agency",
              fr: "Possédez un Actif Technique Permanent Dédié à Votre Agence",
              tr: "Turizm Acentenize Özel Kalıcı ve Korumalı Bir Teknik Varlığa Sahip Olun",
            })}
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed text-balance max-w-2xl mx-auto">
            {pickLocaleText(locale, {
              ar: "نمنحك استقلالية تامة: ترخيص دائم ومحمي مخصص لدومين شركتك حصراً دون أي رسوم تشغيل شهرية إجبارية أو عمولات، مع خادم سحابي مخصص وتسليم شامل خلال 24 ساعة.",
              en: "Complete digital sovereignty: a permanent single-domain license encrypted for your brand, dedicated cloud server, and zero middle-man commissions.",
              fr: "Souveraineté numérique totale : licence permanente chiffrée pour votre marque, serveur cloud dédié et zéro commission intermédiaire.",
              tr: "Tam dijital bağımsızlık: markanıza özel şifreli kalıcı lisans, tahsis edilmiş bulut sunucusu ve sıfır aracı komisyonu ile 24 saatte anahtar teslim kurulum.",
            })}
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ownershipPillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl border border-slate-200 bg-white p-7 hover:border-purple-300 hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="size-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{p.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{p.desc}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-purple-900">
                  <CheckCircle2 className="h-4 w-4 text-purple-700 shrink-0" />
                  <span>
                    {pickLocaleText(locale, {
                      ar: "حماية مشفرة ومؤكدة",
                      en: "Encrypted Guarantee",
                      fr: "Garantie Chiffrée",
                      tr: "Şifreli Güvence",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dedicated Infrastructure Security Banner */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2 space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-purple-950 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200">
                <Lock className="h-3.5 w-3.5 text-purple-700" />
                <span>
                  {pickLocaleText(locale, {
                    ar: "حماية الترخيص والأصول",
                    en: "Enterprise License Protection",
                    fr: "Protection des Actifs & Licence",
                    tr: "Kurumsal Lisans ve Varlık Koruması",
                  })}
                </span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                {pickLocaleText(locale, {
                  ar: "ترخيصك محمي ومشفر — خاص بعلامتك التجارية وموقعك فقط",
                  en: "Your License Is Encrypted & Restricted Exclusively To Your Brand",
                  fr: "Votre Licence est Chiffrée & Exclusive à Votre Marque",
                  tr: "Lisansınız Şifrelidir ve Yalnızca Markanıza ve Alan Adınıza Özeldir",
                })}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {pickLocaleText(locale, {
                  ar: "لضمان أعلى معايير الأمان المالي والتقني، يتم ربط رخصة المنظومة بدومين موقعك الرسمي مباشرة؛ لا يمكن استخدامها في مواقع أخرى أو إعادة توزيعها، ما يحافظ على قيمة وقوة علامتك التجارية أمام عملائك ومنافسيك.",
                  en: "To guarantee peak technical and financial security, the license is locked to your verified domain. It cannot be duplicated or redistributed, ensuring your brand's unique market advantage.",
                  fr: "Pour garantir une sécurité technique et financière optimale, la licence est verrouillée sur votre domaine officiel. Elle ne peut être dupliquée, préservant ainsi l'avantage concurrentiel unique de votre marque.",
                  tr: "En üst düzey finansal ve teknik güvenliği sağlamak için sistem lisansı doğrudan resmi alan adınıza kilitlenir; kopyalanamaz veya dağıtılamaz, bu da markanızın benzersiz değerini korur.",
                })}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-3 text-xs text-slate-700">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-purple-700" />
                <span>
                  {pickLocaleText(locale, {
                    ar: "مواصفات الترخيص المؤسسي:",
                    en: "License Specifications:",
                    fr: "Spécifications de la Licence :",
                    tr: "Kurumsal Lisans Özellikleri:",
                  })}
                </span>
              </div>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-700 shrink-0" />
                  <span>
                    {pickLocaleText(locale, {
                      ar: "ترخيص تشغيلي دائم لمدى الحياة",
                      en: "Lifetime permanent operational license",
                      fr: "Licence opérationnelle permanente à vie",
                      tr: "Ömür boyu kalıcı operasyonel lisans",
                    })}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-700 shrink-0" />
                  <span>
                    {pickLocaleText(locale, {
                      ar: "سيرفر Contabo VPS مع استضافة سنة مجاناً",
                      en: "Contabo VPS + 1-Year free cloud hosting",
                      fr: "Contabo VPS + 1 An d'hébergement cloud gratuit",
                      tr: "Contabo VPS + 1 Yıl ücretsiz bulut barındırma",
                    })}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-700 shrink-0" />
                  <span>
                    {pickLocaleText(locale, {
                      ar: "0% اقتطاعات أو عمولات على الحجوزات",
                      en: "0% commission cuts on customer bookings",
                      fr: "0% de prélèvement sur vos réservations",
                      tr: "Rezervasyonlar üzerinde %0 komisyon kesintisi",
                    })}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-700 shrink-0" />
                  <span>
                    {pickLocaleText(locale, {
                      ar: "دعم فني استشاري ومراقبة مستمرة للسيرفر",
                      en: "Dedicated technical support & server monitoring",
                      fr: "Support technique dédié & surveillance serveur continue",
                      tr: "Özel teknik destek ve kesintisiz sunucu izleme",
                    })}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
