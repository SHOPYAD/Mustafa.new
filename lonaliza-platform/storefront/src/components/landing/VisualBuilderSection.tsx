"use client";

import { useState } from "react";
import {
  Brain,
  CheckCircle2,
  ExternalLink,
  Eye,
  Languages,
  Layout,
  Lock,
  Maximize2,
  Monitor,
  MousePointerClick,
  Palette,
  RotateCw,
  Scan,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tablet,
  Wand2,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pickLocaleText } from "./landing-translations";

export default function VisualBuilderSection() {
  const { dir, locale } = useLocale();
  const isRtl = dir === "rtl";
  const loc = (ar: string, en: string, fr?: string, tr?: string) =>
    pickLocaleText(locale, { ar, en, fr, tr });
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [refreshKey, setRefreshKey] = useState(1);

  const builderPillars = [
    {
      title: loc("سحب وإفلات بصري فوري", "Real-Time Drag & Drop", "Glisser-Déposer Visuel en Direct", "Anlık Sürükle-Bırak Düzenleyici"),
      desc: loc(
        "تحكم في كل عنصر وصورة وبانر ونص في صفحتك الرئيسية مباشرة من الشاشة دون كتابة سطر كود واحد.",
        "Control sections, banners, images, and headlines directly from the visual canvas without coding.",
        "Contrôlez chaque section, bannière, image et titre directement sur l'écran sans coder.",
        "Hiçbir kod yazmadan ana sayfanızdaki her bölümü, görseli, başlığı ve banner'ı doğrudan ekrandan yönetin."
      ),
      icon: Layout,
      badge: loc("بدون كود", "No Code", "Sans Code", "Kodsuz"),
    },
    {
      title: loc("وكيل الذكاء الاصطناعي للموقع", "Autonomous AI Webmaster", "Webmestre IA Autonome", "Otonom Yapay Zeka Web Yöneticisi"),
      desc: loc(
        "أعطِ الأوامر لوكيل الذكاء الاصطناعي صوتياً أو نصياً لتغيير الألوان، ترتيب الأقسام، ونشر عروض المواسم.",
        "Command the AI agent via voice or prompt to adjust themes, prioritize promotions, and optimize layout.",
        "Donnez des ordres à l'agent IA par voix ou texte pour adapter les couleurs et réorganiser les sections.",
        "Renkleri değiştirmek, bölümleri sıralamak ve sezonluk kampanyalar yayınlamak için yapay zeka ajanına sesli veya yazılı komutlar verin."
      ),
      icon: Wand2,
      badge: loc("أوامر ذكية", "AI Commands", "Commandes IA", "Akıllı Komutlar"),
    },
    {
      title: loc("ترجمة فورية لـ 20 لغة", "20+ Languages Localization", "Localisation en Plus de 20 Langues", "20+ Dil İçin Anlık Çeviri"),
      desc: loc(
        "نظام ترجمة دفعي فوري يترجم كامل صفحات موقعك وكتالوج الرحلات للعربية والإنجليزية والتركية والفرنسية بضغطة واحدة.",
        "Instant batch translation localizing your entire catalog to Arabic, English, Turkish, French, and more.",
        "Traduction instantanée par lots traduisant l'ensemble de votre site et catalogue en un seul clic.",
        "Tüm site sayfalarınızı ve tur kataloğunuzu tek tıkla Arapça, İngilizce, Türkçe ve Fransızca'ya çeviren anlık toplu çeviri sistemi."
      ),
      icon: Languages,
      badge: loc("متعدد اللغات", "Multilingual", "Multilingue", "Çok Dilli"),
    },
    {
      title: loc("توافق كامل مع محركات البحث SEO", "Automated Google Travel SEO", "SEO Voyage Automatisé sur Google", "Otomatik Google Seyahat SEO Uyumluluğu"),
      desc: loc(
        "توليد تلقائي للبيانات الوصفية (Schema Markup) وخرائط الموقع لضمان تصدر موقعك نتائج جوجل العضوية.",
        "Automated schema markup, sitemaps, and OpenGraph tags to dominate Google travel search rankings.",
        "Génération automatique des métadonnées Schema et sitemaps pour dominer les résultats Google.",
        "Sitenizin organik Google aramalarında ilk sıralarda yer alması için otomatik Schema Markup ve site haritaları üretimi."
      ),
      icon: Scan,
      badge: loc("تصدر جوجل", "SEO Rank #1", "Top 1 Google", "1. Sıra SEO"),
    },
  ];

  return (
    <section id="builder" className="relative py-24 bg-white border-t border-slate-200 overflow-hidden" dir={dir}>
      <div className="mx-auto max-w-[1700px] px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 text-xs font-bold text-amber-900 shadow-xs">
            <Layout className="h-4 w-4 text-amber-600" />
            <span>
              {pickLocaleText(locale, {
                ar: "المحرر البصري الحقيقي والوكيل الذكي المساعد",
                en: "Real Visual Drag & Drop Builder + AI Assistant",
                fr: "Constructeur Visuel Drag & Drop + Assistant IA",
                tr: "Gerçek Görsel Sürükle-Bırak Düzenleyici + Yapay Zeka Asistanı",
              })}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight text-balance">
            {locale === "ar" ? (
              <>
                تحكم بصري فوري في كامل واجهات موقعك{" "}
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  دون الحاجة لأي مبرمجين
                </span>
              </>
            ) : locale === "fr" ? (
              <>
                Contrôle Visuel Total de Vos Interfaces{" "}
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Sans Développeur
                </span>
              </>
            ) : locale === "tr" ? (
              <>
                Tüm Sayfa Arayüzlerinizde Tam Görsel Kontrol{" "}
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Kod Yazmaya Gerek Kalmadan
                </span>
              </>
            ) : (
              <>
                Full Visual Control Over Your Brand{" "}
                <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Without Touching Code
                </span>
              </>
            )}
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed text-balance max-w-2xl mx-auto">
            {pickLocaleText(locale, {
              ar: "استكشف أدناه التضمين الحي المباشر لمنظومة المحرر البصري؛ عاين تعديل الأقسام وتغيير الثيمات وتجربة المعاينة المتجاوبة عبر الشاشات المختلفة.",
              en: "Experience the authentic visual page builder embedded live below: reorder sections, test corporate themes, and switch viewports in real time.",
              fr: "Découvrez l'intégration directe de notre éditeur visuel : réorganisez les sections, changez de thème et prévisualisez sur tous les écrans.",
              tr: "Görsel sayfa düzenleyicimizin canlı entegrasyonunu keşfedin: bölümleri yeniden sıralayın, temaları değiştirin ve farklı cihazlarda anlık test edin.",
            })}
          </p>
        </div>

        {/* 4 Feature Badges Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {builderPillars.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 hover:bg-white hover:border-amber-300 hover:shadow-md transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="size-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700">
                    {p.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>

        {/* REAL EMBEDDED VISUAL BUILDER IFRAME */}
        <div className="rounded-3xl border border-slate-300 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden">
          {/* Builder Window Top Bar */}
          <div className="bg-slate-900 px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800 select-none">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-rose-500 inline-block" />
                <span className="size-3 rounded-full bg-amber-500 inline-block" />
                <span className="size-3 rounded-full bg-amber-400 inline-block" />
              </div>
              <span className="text-xs font-bold text-slate-300 ms-3 hidden sm:inline-block">
                LONALIZA VISUAL BUILDER STUDIO
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-1.5 text-xs font-mono text-slate-300 border border-slate-700">
              <Lock className="h-3 w-3 text-amber-400" />
              <span>https://your-agency.com/admin/homepage-editor</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                title="Refresh builder"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </button>
              <a
                href="/preview/builder"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                title="Open in fullscreen"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Sub-Header Notice */}
          <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-amber-600 shrink-0" />
              <span className="font-bold">
                {loc(
                  "تضمين حقيقي للمحرر البصري: تصفح عناصر الصفحة والأقسام والتنسيقات المتجاوبة مباشرة",
                  "Live Authentic Visual Builder Embed: Interact with sections, layers, and responsive previews",
                  "Intégration Réelle du Constructeur Visuel : Interagissez avec les sections et prévisualisations réactives",
                  "Canlı Görsel Düzenleyici Entegrasyonu: Sayfa bölümlerini ve mobil uyumlu önizlemeleri anlık deneyimleyin"
                )}
              </span>
            </div>
            <span className="text-[11px] font-bold text-amber-800 hidden sm:inline-block">
              {loc("وضع المشاهدة والتجربة المباشرة", "Interactive Live Preview", "Mode Prévisualisation & Test Interactif", "Canlı Etkileşimli Deneyim Modu")}
            </span>
          </div>

          {/* Iframe Frame */}
          <div className="w-full h-[650px] sm:h-[750px] lg:h-[820px] bg-white">
            <iframe
              key={`${refreshKey}-${locale}`}
              src={`/preview/builder?locale=${locale}&lang=${locale}`}
              title="Real Visual Builder Preview"
              className="w-full h-full border-0 bg-white"
              loading="lazy"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
