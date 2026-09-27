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
import { pickLocaleText } from "./landing-translations";

export default function InteractiveTourPreview() {
  const { locale, dir } = useLocale();

  const tourSteps = [
    {
      step: "01",
      title: pickLocaleText(locale, {
        ar: "لوحة القيادة والإحصائيات",
        en: "Dashboard & Metrics",
        fr: "Tableau de Bord & Métriques",
        tr: "Kontrol Paneli ve İstatistikler",
      }),
      desc: pickLocaleText(locale, {
        ar: "متابعة الحجوزات، الإيرادات اليومية، ومصادر الزوار لحظياً.",
        en: "Real-time revenue, bookings, and customer traffic overview.",
        fr: "Aperçu en temps réel des revenus, réservations et trafic.",
        tr: "Rezervasyonları, günlük gelirleri ve ziyaretçi kaynaklarını anlık takip edin.",
      }),
    },
    {
      step: "02",
      title: pickLocaleText(locale, {
        ar: "إدارة الخدمات والتسعير",
        en: "Services & Markups",
        fr: "Services & Tarification",
        tr: "Hizmetler ve Fiyatlandırma",
      }),
      desc: pickLocaleText(locale, {
        ar: "ضبط هوامش أرباح الفنادق والطيران وإضافة الباقات والجولات.",
        en: "Configure hotel/flight profit margins and custom packages.",
        fr: "Configurez les marges des vols et hôtels et ajoutez vos forfaits.",
        tr: "Otel ve uçuş kâr marjlarını ayarlayın, paket ve turlar ekleyin.",
      }),
    },
    {
      step: "03",
      title: pickLocaleText(locale, {
        ar: "المحرر البصري والذكاء الاصطناعي",
        en: "Visual Builder & AI Agent",
        fr: "Éditeur Visuel & Agent IA",
        tr: "Görsel Düzenleyici ve Yapay Zeka",
      }),
      desc: pickLocaleText(locale, {
        ar: "تخصيص المظهر وتوليد البرامج السياحية بضغطة زر واحدة.",
        en: "Customize design and generate tailored itineraries with AI.",
        fr: "Personnalisez le design et générez des itinéraires sur-mesure par IA.",
        tr: "Tasarımı özelleştirin ve yapay zeka ile tek tıkla tur programları üretin.",
      }),
    },
    {
      step: "04",
      title: pickLocaleText(locale, {
        ar: "التسويق وأتمتة النشر",
        en: "Marketing & Automation",
        fr: "Marketing & Automatisation",
        tr: "Pazarlama ve Otomasyon",
      }),
      desc: pickLocaleText(locale, {
        ar: "ربط بكسلات الإعلانات وتفعيل بوت موافقة تيليجرام «انشر».",
        en: "Connect ad pixels and activate Telegram «Publish» approval bot.",
        fr: "Connectez les pixels publicitaires et activez le bot Telegram.",
        tr: "Reklam piksellerini bağlayın ve Telegram onay botunu aktifleştirin.",
      }),
    },
  ];

  return (
    <section className="relative py-24 bg-slate-50/80 border-t border-slate-200" dir={dir}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50/60 via-white to-amber-50/30 p-8 sm:p-12 shadow-sm relative overflow-hidden">
          <div className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 bg-purple-500/5 blur-[100px] rounded-full" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-100/70 px-4 py-1.5 text-xs font-bold text-purple-950">
                <GraduationCap className="h-4 w-4 text-purple-800" />
                <span>
                  {pickLocaleText(locale, {
                    ar: "جولة تعليمية تفاعلية مدمجة في اللوحة",
                    en: "Interactive Onboarding Tour",
                    fr: "Visite Guidée Interactive Intégrée",
                    tr: "Entegre İnteraktif Eğitim Turu",
                  })}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {pickLocaleText(locale, {
                  ar: "لن تحتاج لدورات أو تدريب معقد؛ النظام يشرح لك كل قسم خطوة بخطوة",
                  en: "No Steep Learning Curve; Built-in Interactive Guide Explains Every Screen",
                  fr: "Aucune formation complexe nécessaire; le guide intégré explique chaque écran",
                  tr: "Karmaşık eğitimlere gerek yok; entegre rehber her bölümü adım adım açıklar",
                })}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                {pickLocaleText(locale, {
                  ar: "من زر الجولة التعليمية المدمج في هيدر لوحة التحكم، تفتح لك نافذة تفاعلية كبيرة مع سهم يبرز القسم المطلوب، يشرح ما يقدمه وكيف تضبطه حتى تتقن إدارة منظومتك باحترافية.",
                  en: "Click the Tour button in the admin header to start a guided walkthrough spotlighting every feature and explaining exactly how to operate your travel business.",
                  fr: "Cliquez sur le bouton de visite dans l'en-tête pour lancer un guide pas-à-pas mettant en valeur chaque fonctionnalité et son utilisation.",
                  tr: "Yönetici başlığındaki Eğitim Turu düğmesine tıklayarak her özelliği ve nasıl yapılandırılacağını gösteren etkileşimli rehberi başlatabilirsiniz.",
                })}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tourSteps.map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-purple-200/80 bg-white p-5 space-y-2 hover:border-purple-400 transition-all shadow-xs"
                >
                  <span className="text-xs font-mono font-bold text-purple-900">
                    STEP {s.step}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
