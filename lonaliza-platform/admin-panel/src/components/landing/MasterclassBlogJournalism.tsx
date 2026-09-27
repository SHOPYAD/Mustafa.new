"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Globe2,
  Hotel,
  Layers,
  Plane,
  Search,
  Sparkles,
  Star,
  Ticket,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pickLocaleText } from "./landing-translations";

export default function MasterclassBlogJournalism() {
  const { dir, locale } = useLocale();
  const [activeArticleTab, setActiveArticleTab] = useState<"overview" | "booking_cards" | "pricing_table">("overview");

  return (
    <section className="relative py-16 md:py-24 bg-white text-slate-900 border-b border-slate-200/80 overflow-hidden" dir={dir}>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-2xs">
            <BookOpen className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
            <span>
              {pickLocaleText(locale, {
                ar: "صحافة السفر الذكية والسيو (Masterclass Travel Journalism & SEO)",
                en: "Masterclass Travel Journalism & SEO",
                fr: "Journalisme Touristique de Référence & SEO",
                tr: "Uzman Seyahat Gazeteciliği ve SEO",
              })}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight font-sans">
            {pickLocaleText(locale, {
              ar: "أدلة سياحية مرجعية كبرى تفوق 5,000 كلمة مع بطاقات حجز حية",
              en: "Major 5,000+ Word Authority Travel Guides with Live Booking Cards",
              fr: "Grands Guides de Voyage de +5 000 Mots avec Cartes de Réservation en Direct",
              tr: "Canlı Rezervasyon Kartlarıyla 5.000+ Kelimelik Kapsamlı Seyahat Rehberleri",
            })}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {pickLocaleText(locale, {
              ar: "المنصة لا تنشر مجرد مقالات عادية؛ بل تصيغ أدلة سياحية استقصائية شاملة تتضمن جداول أسعار وبطاقات حجز فنادق وطيران مباشرة لتحويل كل قارئ إلى زبون يدفع فوراً.",
              en: "The platform crafts comprehensive investigative guides featuring rate comparison tables and direct hotel/flight booking cards to convert every reader into a paying traveler.",
              fr: "La plateforme conçoit des guides approfondis intégrant des comparatifs de prix et des modules de réservation d'hôtels et de vols pour convertir les lecteurs en clients payants.",
              tr: "Platform sadece standart makaleler yayınlamaz; okuyucuları anında rezervasyon yapan müşterilere dönüştürmek için fiyat karşılaştırmaları ve canlı rezervasyon kartları içeren kapsamlı rehberler oluşturur.",
            })}
          </p>
        </div>

        {/* Interactive Masterclass Article Card (21st.dev Style) */}
        <div className="rounded-3xl border border-slate-300/80 bg-slate-50 p-4 sm:p-7 shadow-xl shadow-slate-200/60 space-y-6">
          {/* Article Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-300 inline-block">
                {pickLocaleText(locale, {
                  ar: "مقال مرجعي نشط على المنصة 2026/2027",
                  en: "Active Authority Guide on Platform 2026/2027",
                  fr: "Guide de Référence Actif sur la Plateforme 2026/2027",
                  tr: "Platformda Canlı Kapsamlı Rehber 2026/2027",
                })}
              </span>
              <h3 className="text-base sm:text-xl font-bold text-slate-900 leading-snug">
                {pickLocaleText(locale, {
                  ar: "الدليل الشامل للسياحة الفاخرة في تركيا 2027: أسرار إسطنبول، بودروم، وكابادوكيا",
                  en: "Comprehensive Luxury Travel Guide to Turkey 2027: Secrets of Istanbul, Bodrum & Cappadocia",
                  fr: "Guide Complet du Voyage de Luxe en Turquie 2027 : Secrets d'Istanbul, Bodrum & Cappadoce",
                  tr: "2027 Türkiye Lüks Seyahat Rehberi: İstanbul, Bodrum ve Kapadokya'nın Sırları",
                })}
              </h3>
            </div>

            <div className="flex items-center gap-3 shrink-0 text-xs text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-purple-700" />
                <strong>
                  {pickLocaleText(locale, {
                    ar: "5,200 كلمة (33,000+ حرف)",
                    en: "5,200 Words (33,000+ chars)",
                    fr: "5 200 Mots (33 000+ car.)",
                    tr: "5.200 Kelime (33.000+ karakter)",
                  })}
                </strong>
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
                <strong>#1 Google Rank</strong>
              </span>
            </div>
          </div>

          {/* Sub-Tabs Switcher */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveArticleTab("overview")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeArticleTab === "overview"
                  ? "bg-purple-950 text-amber-300 shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {pickLocaleText(locale, {
                ar: "1. مقتطفات السرد الروائي والسيو",
                en: "1. Narrative Storytelling & SEO",
                fr: "1. Récit Éditorial & SEO",
                tr: "1. Akıcı Anlatım ve SEO",
              })}
            </button>
            <button
              type="button"
              onClick={() => setActiveArticleTab("booking_cards")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeArticleTab === "booking_cards"
                  ? "bg-purple-950 text-amber-300 shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {pickLocaleText(locale, {
                ar: "2. بطاقات الحجز الفوري المدمجة بالمقال",
                en: "2. Embedded Live Booking Cards",
                fr: "2. Cartes de Réservation Intégrées",
                tr: "2. Makale İçi Rezervasyon Kartları",
              })}
            </button>
            <button
              type="button"
              onClick={() => setActiveArticleTab("pricing_table")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeArticleTab === "pricing_table"
                  ? "bg-purple-950 text-amber-300 shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {pickLocaleText(locale, {
                ar: "3. جدول مقارنة أسعار الخدمات الفاخرة",
                en: "3. Luxury Rates Comparison Table",
                fr: "3. Tableau Comparatif des Prix",
                tr: "3. Lüks Hizmet Fiyat Tablosu",
              })}
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="pt-2">
            {activeArticleTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <CheckCircle2 className="h-4 w-4 text-purple-700" />
                    <span>
                      {pickLocaleText(locale, {
                        ar: "سرد تحريري احترافي 100%",
                        en: "100% Masterclass Narrative",
                        fr: "Récit Éditorial 100% Professionnel",
                        tr: "%100 Profesyonel Editöryal Anlatım",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pickLocaleText(locale, {
                      ar: "مكتوب بلغة تحريرية ساحرة تنافس ناشيونال جيوغرافيك وكوندي ناست ترافيلر لجذب النخبة من المسافرين.",
                      en: "Written in captivating editorial style rivaling National Geographic and Condé Nast Traveler to attract affluent travelers.",
                      fr: "Rédigé dans un style captivant rivalisant avec National Geographic et Condé Nast Traveler pour attirer les voyageurs exigeants.",
                      tr: "Seçkin gezginleri çekmek için National Geographic ve Condé Nast Traveler kalitesinde büyüleyici bir dille kaleme alınmıştır.",
                    })}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Search className="h-4 w-4 text-purple-700" />
                    <span>
                      {pickLocaleText(locale, {
                        ar: "سكيما محركات البحث (Schema Markup)",
                        en: "Rich Search Engine Schema",
                        fr: "Balisage Schema & FAQ Riche",
                        tr: "Arama Motoru Schema İşaretlemesi",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pickLocaleText(locale, {
                      ar: "مجهزة بترميز FAQ Schema الغني والبيانات الهيكلية لتتصدر مقالاتك المقتطفات المميزة الأولى في بحث جوجل.",
                      en: "Equipped with rich FAQ Schema markup and structured data so your guides dominate Google featured snippets.",
                      fr: "Optimisé avec le balisage structuré FAQ Schema pour positionner vos guides au sommet des résultats Google.",
                      tr: "Rehberlerinizin Google'da en üst sıralarda yer alması için zengin FAQ Schema ve yapısal verilerle donatılmıştır.",
                    })}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Zap className="h-4 w-4 text-amber-600" />
                    <span>
                      {pickLocaleText(locale, {
                        ar: "توليد بالذكاء التلقائي Gemini 2.5",
                        en: "Gemini 2.5 AI Generation",
                        fr: "Génération IA Gemini 2.5",
                        tr: "Gemini 2.5 Yapay Zeka Üretimi",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pickLocaleText(locale, {
                      ar: "تستطيع المنصة توليد مئات المقالات المتخصصة حول أي وجهة عالمية بضغطة زر واحدة مع ربط الخدمات تلقائياً.",
                      en: "The platform generates hundreds of in-depth guides for any global destination in 1 click, automatically linking live bookable services.",
                      fr: "La plateforme peut générer des centaines de guides spécialisés pour n'importe quelle destination en un clic avec liaison automatique des services.",
                      tr: "Platform, tek tıkla herhangi bir küresel destinasyon için yüzlerce uzman rehber üretebilir ve rezervasyon hizmetlerini otomatik olarak bağlar.",
                    })}
                  </p>
                </div>
              </div>
            )}

            {activeArticleTab === "booking_cards" && (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  {pickLocaleText(locale, {
                    ar: "نموذج لبطاقة حجز فندقية تفاعلية يتم توليدها وتضمينها تلقائياً داخل متن المقال للتحويل الفوري:",
                    en: "Sample interactive hotel booking card auto-injected into the article body for immediate conversions:",
                    fr: "Exemple de carte de réservation hôtelière interactive injectée dans l'article pour une conversion immédiate :",
                    tr: "Anında rezervasyon dönüşümü için makale metnine otomatik olarak eklenen etkileşimli otel kartı örneği:",
                  })}
                </p>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200&auto=format&fit=crop&q=80"
                      alt="Hotel Card"
                      className="size-16 rounded-xl object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs">
                        <Star className="size-3 fill-amber-500" />
                        <Star className="size-3 fill-amber-500" />
                        <Star className="size-3 fill-amber-500" />
                        <Star className="size-3 fill-amber-500" />
                        <Star className="size-3 fill-amber-500" />
                        <span className="text-slate-500 font-bold ms-1">
                          {pickLocaleText(locale, {
                            ar: "(5 نجوم ديلوكس)",
                            en: "(5-Star Deluxe)",
                            fr: "(5 Étoiles Deluxe)",
                            tr: "(5 Yıldızlı Delüks)",
                          })}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">Ciragan Palace Kempinski Istanbul</h4>
                      <p className="text-[11px] text-slate-500">
                        {pickLocaleText(locale, {
                          ar: "إطلالة مباشرة على البوسفور · خدمة خادم شخصي VIP",
                          en: "Direct Bosphorus view · VIP Butler Service",
                          fr: "Vue directe sur le Bosphore · Majordome VIP",
                          tr: "Doğrudan Boğaz manzarası · VIP Kahya Hizmeti",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">
                        {pickLocaleText(locale, {
                          ar: "يبدأ من",
                          en: "Starting from",
                          fr: "À partir de",
                          tr: "Başlangıç:",
                        })}
                      </span>
                      <span className="text-lg font-black text-slate-950 font-mono">$1,230</span>
                      <span className="text-[10px] text-slate-500">
                        {pickLocaleText(locale, {
                          ar: "/ ليلة",
                          en: "/ night",
                          fr: "/ nuit",
                          tr: "/ gece",
                        })}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] hover:from-[#3b0764] hover:to-[#581c87] text-white text-xs font-bold transition-all shadow-xs"
                    >
                      {pickLocaleText(locale, {
                        ar: "حجز الغرفة الآن",
                        en: "Book Room Now",
                        fr: "Réserver la Chambre",
                        tr: "Odayı Hemen Ayırt",
                      })}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeArticleTab === "pricing_table" && (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-3 font-bold">
                        {pickLocaleText(locale, {
                          ar: "الخدمة السياحية الفاخرة",
                          en: "Luxury Travel Service",
                          fr: "Service Touristique de Luxe",
                          tr: "Lüks Seyahat Hizmeti",
                        })}
                      </th>
                      <th className="p-3 font-bold">
                        {pickLocaleText(locale, {
                          ar: "المستوى والتجهيز",
                          en: "Class & Inclusions",
                          fr: "Prestation & Inclusions",
                          tr: "Sınıf ve Donanım",
                        })}
                      </th>
                      <th className="p-3 font-bold">
                        {pickLocaleText(locale, {
                          ar: "السعر التقديري",
                          en: "Estimated Rate",
                          fr: "Prix Estimé",
                          tr: "Tahmini Fiyat",
                        })}
                      </th>
                      <th className="p-3 font-bold">
                        {pickLocaleText(locale, {
                          ar: "نقاط الولاء المكتسبة",
                          en: "Earned Loyalty Points",
                          fr: "Points de Fidélité",
                          tr: "Kazanılan Puan",
                        })}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-3 font-bold text-slate-900">
                        {pickLocaleText(locale, {
                          ar: "طيران رجال الأعمال (Emirates / Saudia)",
                          en: "Business Class Flights (Emirates / Saudia)",
                          fr: "Vols Classe Affaires (Emirates / Saudia)",
                          tr: "Business Class Uçuş (Emirates / Saudia)",
                        })}
                      </td>
                      <td className="p-3 text-slate-600">
                        {pickLocaleText(locale, {
                          ar: "مقاعد منبسطة بالكامل + صالة VIP",
                          en: "Lie-flat seats + VIP Lounge",
                          fr: "Sièges-lits + Salon VIP",
                          tr: "Tam Yatar Koltuk + VIP Salonu",
                        })}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">$1,850 - $2,400</td>
                      <td className="p-3 text-purple-900 font-bold font-mono">
                        {pickLocaleText(locale, {
                          ar: "+18,500 نقطة",
                          en: "+18,500 pts",
                          fr: "+18 500 pts",
                          tr: "+18.500 puan",
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900">
                        {pickLocaleText(locale, {
                          ar: "جناح قصر السلاطين (Ciragan Palace)",
                          en: "Sultan Suite (Ciragan Palace)",
                          fr: "Suite des Sultans (Ciragan Palace)",
                          tr: "Sultan Süiti (Çırağan Sarayı)",
                        })}
                      </td>
                      <td className="p-3 text-slate-600">
                        {pickLocaleText(locale, {
                          ar: "إطلالة بانورامية خاصة على البوسفور",
                          en: "Private panoramic Bosphorus terrace",
                          fr: "Terrasse panoramique sur le Bosphore",
                          tr: "Özel panoramik Boğaz manzarası",
                        })}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">$1,230 / night</td>
                      <td className="p-3 text-purple-900 font-bold font-mono">
                        {pickLocaleText(locale, {
                          ar: "+12,300 نقطة",
                          en: "+12,300 pts",
                          fr: "+12 300 pts",
                          tr: "+12.300 puan",
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-slate-900">
                        {pickLocaleText(locale, {
                          ar: "يخت خاص فاخر 75 قدم (البوسفور)",
                          en: "75-Foot Private Luxury Yacht (Bosphorus)",
                          fr: "Yacht Privé de Luxe 75ft (Bosphore)",
                          tr: "75 Feet Özel Lüks Yat (Boğaz)",
                        })}
                      </td>
                      <td className="p-3 text-slate-600">
                        {pickLocaleText(locale, {
                          ar: "شيف خاص + طاقم بحري كامل",
                          en: "Private Chef + Full Crew",
                          fr: "Chef Privé + Équipage Complet",
                          tr: "Özel Şef + Tam Mürettebat",
                        })}
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-900">$950 / 4h</td>
                      <td className="p-3 text-purple-900 font-bold font-mono">
                        {pickLocaleText(locale, {
                          ar: "+9,500 نقطة",
                          en: "+9,500 pts",
                          fr: "+9 500 pts",
                          tr: "+9.500 puan",
                        })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
