"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  Check,
  CheckCircle2,
  DollarSign,
  HelpCircle,
  MessageCircle,
  PiggyBank,
  Radio,
  RefreshCw,
  Rocket,
  Server,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Clock,
  Flame,
  Layers,
  Award,
  Globe2,
  Lock,
  Sliders,
  Plane,
  Coins,
  Package,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pickLocaleText } from "./landing-translations";
import WhiteLabelOnboardingModal from "./WhiteLabelOnboardingModal";
import {
  FEATURE_CATEGORIES,
  ALL_PLATFORM_FEATURES,
  isFeatureActiveForPlan,
  type PlanType,
} from "@/lib/resale/features-matrix";

type PricingSectionProps = {
  lifetimePrice?: number;
  updatePrice?: number;
  supportWhatsapp?: string;
};

export default function PricingSection({
  lifetimePrice = 1990,
  updatePrice = 50,
  supportWhatsapp = "+905015709201",
}: PricingSectionProps) {
  const { dir, locale } = useLocale();
  const isRtl = dir === "rtl";
  const loc = (ar: string, en: string, fr?: string, tr?: string) =>
    pickLocaleText(locale, { ar, en, fr, tr });

  // Dual Pricing Tab State: 'ownership' | 'whitelabel'
  const [activePricingTab, setActivePricingTab] = useState<"ownership" | "whitelabel">("ownership");
  const [wlModalOpen, setWlModalOpen] = useState(false);
  const [selectedWlPlan, setSelectedWlPlan] = useState<"whitelabel_free" | "whitelabel_paid">("whitelabel_free");

  // Native Mobile Apps Add-on State (+$2,000)
  const [includeNativeApps, setIncludeNativeApps] = useState<boolean>(false);
  const [showFeatureDrawer, setShowFeatureDrawer] = useState<boolean>(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  // Interactive Smart Profit Calculator State (Dual Sliders)
  const [salesVolume, setSalesVolume] = useState<number>(40000);
  const [markupPercent, setMarkupPercent] = useState<number>(12);

  // Computed Calculator Metrics
  const monthlyProfit = Math.round(salesVolume * (markupPercent / 100));
  const annualProfit = monthlyProfit * 12;
  const traditionalFeesMonthly = Math.round(salesVolume * 0.15);
  const annualTraditionalCommission = traditionalFeesMonthly * 12;
  const totalFinancialAdvantage = annualProfit + annualTraditionalCommission;

  // Countdown timer: 03d : 14h : 28m : 45s
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 14,
    minutes: 28,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentPrice = includeNativeApps ? lifetimePrice + 2000 : lifetimePrice;
  const originalPrice = includeNativeApps ? 11990 : 6630;

  const coreLifetimeFeatures = [
    loc("نسخة كاملة من منظومة لوناليزا (Lonaliza) بعلامتك التجارية وسيرفرك الخاص", "Full Lonaliza Tourism Platform under your brand on dedicated server", "Plateforme complète Lonaliza Tourisme sous votre propre marque", "Kendi markanız altında bağımsız sunucunuzda eksiksiz Lonaliza Turizm Platformu"),
    loc("ترخيص دومين دائم مشفر ومحمي مدى الحياة دون أي عمولات مبيعات (0%)", "Single-domain permanent encrypted license with 0% sales commission", "Licence permanente chiffrée par domaine avec 0% de commission", "Satış komisyonsuz (%0) tek alan adına özel ömür boyu şifreli kalıcı lisans"),
    loc("سيرفر Contabo Cloud VPS مخصص عالي الأداء مجاناً لمدة سنة كاملة", "1-Year free dedicated high-performance Contabo Cloud VPS hosting", "Hébergement Contabo Cloud VPS dédié haute performance gratuit 1 an", "1 yıl boyunca ücretsiz yüksek performanslı bağımsız Contabo Bulut VPS barındırma"),
    loc("فتح كافة الموزعين العالميين المربوطين (PKFARE, Seeru, Travelport, BiletBank, RateHawk...)", "All real integrated global distributors unlocked (PKFARE, Seeru, Travelport, RateHawk...)", "Tous les distributeurs mondiaux réels débloqués (PKFARE, Seeru, Travelport...)", "Tüm entegre küresel dağıtıcılar açık (PKFARE, Seeru, Travelport, RateHawk...)"),
    loc("دعم موديولات لوناليزا المركزية ومحفظة B2B دون اشتراط عقود خارجية", "Central Lonaliza B2B module support with instant wallet deduction", "Support des modules B2B Lonaliza avec débit portefeuille instantané", "Dış anlaşma yapmadan merkezi Lonaliza B2B modülleriyle anında çalışma"),
    loc("لوحة تحكم aaPanel مهيأة مع شهادات الأمان SSL وصلاحيات Root كاملة", "Pre-installed aaPanel dashboard + SSL certificates & Root access", "Panneau de contrôle aaPanel préinstallé avec certificats SSL & Root", "Önceden kurulmuş aaPanel kontrol paneli, SSL ve tam Root yetkisi"),
    loc("6 محركات حجز سياحية متصلة (طيران، فنادق، باقات، جولات، سيارات، يخوت/فيزا)", "6 Unified travel engines with live GDS & RapidAPI", "6 moteurs de réservation unifiés avec GDS direct et RapidAPI", "Canlı GDS ve RapidAPI bağlantılı 6 birleşik seyahat rezervasyon motoru"),
    loc("سرب الذكاء الاصطناعي (6 AI Agents) ومولد البرامج السياحية الفاخرة", "6 Specialized AI Swarm agents + luxury itinerary generator", "Essaim de 6 agents IA spécialisés + générateur d'itinéraires de luxe", "6 uzman yapay zeka ajanı ve lüks seyahat programı oluşturucu"),
    loc("أتمتة تيليجرام 24/7 مع استعادة السلات المتروكة عبر واتساب", "24/7 Telegram automation & WhatsApp abandoned cart recovery", "Automatisation Telegram 24/7 et récupération des paniers abandonnés via WhatsApp", "7/24 Telegram otomasyonu ve WhatsApp terk edilmiş sepet kurtarma"),
    loc("المحرر البصري بالسحب والإفلات مع دعم 20 لغة وترجمة فورية", "Visual drag-and-drop page builder with 20+ language batch translation", "Éditeur visuel par glisser-déposer avec traduction de plus de 20 langues", "Sürükle-bırak görsel sayfa düzenleyici ve 20+ dil anlık çeviri desteği"),
    loc("تسليم حي وشامل للسيرفر والموقع خلال 12–24 ساعة عمل", "Guaranteed live handover within 12–24 hours", "Livraison en direct du serveur et du site sous 12 à 24 heures", "12–24 çalışma saati içinde eksiksiz canlı sunucu ve site teslimi"),
  ];

  const updateFeatures = [
    loc("تحديثات برمجية وأمنية ليلية تلقائية للمنظومة", "Automated nightly software & security updates", "Mises à jour logicielles et de sécurité nocturnes automatisées", "Otomatik gece yazılım ve güvenlik güncellemeleri"),
    loc("إضافة محركات ومزودي خدمات سياحية جدد باستمرار", "Continuous new GDS & travel supplier connectors", "Nouveaux connecteurs GDS et fournisseurs de voyage en continu", "Sürekli yeni GDS ve seyahat tedarikçi entegrasyonları"),
    loc("تطوير مستمر لنماذج الذكاء الاصطناعي وسرب الوكلاء", "Latest AI swarm models and conversational prompts", "Derniers modèles d'agents IA et invites conversationnelles", "En güncel yapay zeka modelleri ve ajan optimizasyonları"),
    loc("دعم فني استشاري ومراقبة أداء السيرفر على مدار الساعة", "Priority 24/7 technical support & server monitoring", "Support technique prioritaire 24/7 et surveillance du serveur", "7/24 öncelikli teknik destek ve sunucu performans takibi"),
    loc("اشتراك اختياري شهري — يمكن إيقافه أو استئنافه متى شئت", "Optional monthly subscription — pause or cancel anytime", "Abonnement mensuel facultatif — suspension ou résiliation à tout moment", "İsteğe bağlı aylık abonelik — dilediğiniz zaman durdurabilir veya başlatabilirsiniz"),
  ];

  const cleanWhatsapp = supportWhatsapp.replace(/[^0-9+]/g, "");

  // Filter features for drawer
  const filteredFeatures = selectedCategoryFilter === "all"
    ? ALL_PLATFORM_FEATURES
    : ALL_PLATFORM_FEATURES.filter((f) => f.categoryId === selectedCategoryFilter);

  return (
    <section id="pricing" className="relative py-24 bg-slate-50/60 border-t border-slate-200 overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50/80 px-4 py-1.5 text-xs font-bold text-purple-950 shadow-xs">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>
              {loc(
                "تسعير استثماري شفاف — أرباحك 100% لك دون أي عمولة",
                "Transparent Investment Model — 0% Sales Commission",
                "Modèle d'Investissement Transparent — 0% de Commission",
                "Şeffaf Yatırım Modeli — %0 Satış Komisyonu"
              )}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight text-balance">
            {loc(
              "امتلك منظومتك السياحية واحتفظ بكامل أرباحك وهوامشك",
              "Launch Your Travel Platform & Keep 100% of Your Markups",
              "Lancez Votre Plateforme Touristique & Gardez 100% de Vos Marges",
              "Seyahat Platformunuzu Başlatın & Kâr Marjınızın %100'ünü Koruyun"
            )}
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto text-balance">
            {loc(
              "على عكس المنصات المؤجرة ومواقع OTA التي تقتطع 15-25% من كل تذكرة، تمنحك لوناليزا وصولاً مباشراً لأسعار الجملة وهوامش ربح مستقلة بالكامل.",
              "Unlike rented SaaS platforms and OTAs taking 15-25% commissions off every ticket, Lonaliza gives you direct wholesale access and 100% markup retention.",
              "Contrairement aux plateformes de location et OTA prélevant 15 à 25% de commission, Lonaliza vous offre des tarifs de gros et des marges 100% à vous.",
              "Her bilette %15-25 komisyon kesen kiralık sistemlerin aksine, Lonaliza doğrudan toptan fiyatlar ve %100 size ait kâr marjı sağlar."
            )}
          </p>

          {/* Urgency Countdown Timer Banner */}
          <div className="pt-2 max-w-xl mx-auto">
            <div className="bg-white border-2 border-rose-300/80 rounded-2xl p-3.5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                <Flame className="size-4 fill-rose-500 text-rose-500 animate-bounce" />
                <span>
                  {loc(
                    "ينتهي عرض خصم 70% الحصري خلال:",
                    "Limited 70% discount expires in:",
                    "L'offre de remise exclusive de 70% expire dans :",
                    "Özel %70 indirim fırsatının sona ermesine kalan süre:"
                  )}
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-xs font-black text-slate-900 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200/60">
                <span>{String(timeLeft.days).padStart(2, "0")}d</span> :
                <span>{String(timeLeft.hours).padStart(2, "0")}h</span> :
                <span>{String(timeLeft.minutes).padStart(2, "0")}m</span> :
                <span className="text-rose-600">{String(timeLeft.seconds).padStart(2, "0")}s</span>
              </div>
            </div>
          </div>

          {/* Navigation Pill Switcher: Lifetime Ownership vs White Label */}
          <div className="pt-4 flex justify-center">
            <div className="inline-flex p-1.5 rounded-3xl bg-slate-200/80 border border-slate-300/80 shadow-inner max-w-md w-full">
              <button
                type="button"
                onClick={() => setActivePricingTab("ownership")}
                className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activePricingTab === "ownership"
                    ? "bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-white shadow-md shadow-purple-950/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Server className="size-4 shrink-0" />
                <span>
                  {loc(
                    "شراء المنظومة الدائمة (Lifetime)",
                    "Lifetime Enterprise License",
                    "Licence Permanente à Vie",
                    "Ömür Boyu Kurumsal Lisans"
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActivePricingTab("whitelabel")}
                className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activePricingTab === "whitelabel"
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-950/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Globe2 className="size-4 shrink-0" />
                <span>
                  {loc(
                    "العلامة البيضاء (White Label)",
                    "White Label Plans",
                    "Plans White Label",
                    "White Label Paketleri"
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Tab Body */}
        {activePricingTab === "ownership" ? (
          /* Lifetime Enterprise License View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch animate-in fade-in duration-200">
            {/* Core Lifetime Platform Card (2 cols) */}
            <div className="lg:col-span-2 rounded-3xl border-2 border-purple-800 bg-white p-6 sm:p-10 shadow-2xl shadow-purple-950/10 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 pb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-3.5 py-1 text-xs font-black text-purple-900">
                  <Sparkles className="size-3.5 text-purple-600" />
                  <span>{loc("شراء أصل تقني دائم", "Permanent Digital Asset", "Actif Numérique Permanent", "Kalıcı Dijital Varlık")}</span>
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#2e1065] to-[#4c1d95] px-3.5 py-1 text-xs font-black text-white shadow-md">
                  <Rocket className="h-3.5 w-3.5 text-amber-300" />
                  <span>
                    {loc("الباقة الأكثر طلباً للشركات", "Enterprise Edition", "Édition Entreprise", "Kurumsal Paket")}
                  </span>
                </span>
              </div>

              <div className="space-y-6">
                <div className="space-y-2 max-w-lg">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {loc(
                      "باقة الترخيص والتملك الدائم الكاملة",
                      "Complete Lifetime Enterprise License",
                      "Licence Permanente Entreprise Complète",
                      "Eksiksiz Ömür Boyu Kurumsal Lisans Paketi"
                    )}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {loc(
                      "المنظومة الكاملة + سيرفر Contabo VPS ألماني مخصص مجاناً سنة + تسليم حي وتشغيل كامل خلال 12–24 ساعة.",
                      "Complete platform + 1-Year Free Dedicated Contabo VPS + Guaranteed live deployment in 12–24h.",
                      "Plateforme complète + 1 an de VPS Contabo dédié offert + Mise en service sous 12 à 24h.",
                      "Eksiksiz platform + 1 Yıl Ücretsiz Bağımsız Contabo VPS + 12–24 saatte anahtar teslim canlı kurulum."
                    )}
                  </p>
                </div>

                {/* Price Tag with Strikethrough */}
                <div className="flex items-baseline gap-4 pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl text-slate-400 line-through font-mono font-bold">
                      ${originalPrice.toLocaleString()}
                    </span>
                    <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight font-mono">
                      ${currentPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-semibold">
                    <p className="text-purple-900 font-black uppercase">
                      {loc("مدى الحياة (دفعة واحدة)", "Lifetime (One-Time)", "À vie (Paiement Unique)", "Ömür Boyu (Tek Seferlik)")}
                    </p>
                    <p>{loc("شاملة السيرفر المخصص لسنة كاملة", "Includes 1-Year Dedicated VPS", "Comprend 1 an de VPS dédié", "1 Yıllık Bağımsız VPS Dahil")}</p>
                  </div>
                </div>

                {/* Native Mobile Apps Add-On Interactive Toggle Box */}
                <div
                  onClick={() => setIncludeNativeApps(!includeNativeApps)}
                  className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    includeNativeApps
                      ? "bg-purple-50/70 border-purple-800 shadow-md shadow-purple-950/10"
                      : "bg-slate-50 hover:bg-slate-100/70 border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`size-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          includeNativeApps ? "bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-white" : "border-2 border-slate-300 bg-white"
                        }`}
                      >
                        {includeNativeApps && <Check className="size-4 stroke-[3]" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Smartphone className="size-4 text-purple-700" />
                          <span className="text-xs sm:text-sm font-black text-slate-900">
                            {loc(
                              "إضافة تطبيق أصيل للهواتف الذكية (iPhone و Android) (+2,000$)",
                              "Add Native Smartphone Apps for iPhone & Android (+$2,000)",
                              "Ajouter les Applications Mobiles Natives iOS & Android (+2 000 $)",
                              "iPhone ve Android İçin Yerel Mobil Uygulama Ekle (+2.000$)"
                            )}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {loc(
                            "تطبيقان أصيلان لنظامي iOS و Android يتم نشرهما على متجري Apple App Store و Google Play Store تحت حساب المطور الخاص بشركتك مع إشعارات Push حية.",
                            "Native smartphone apps for iOS & Android published under your developer accounts on Apple App Store & Google Play with live push notifications.",
                            "Deux applications natives pour iOS et Android publiées sur les stores sous votre compte développeur avec notifications push.",
                            "Şirketinizin geliştirici hesabı altında Apple App Store ve Google Play'de yayınlanan, canlı push bildirimli yerel iOS ve Android uygulamaları."
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Core Features List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                  {coreLifetimeFeatures.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center">
                <Link
                  href="/partners/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] hover:from-[#1e0a45] hover:to-[#3b1378] py-4 px-8 text-sm font-black text-white transition-all shadow-lg shadow-purple-900/20 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Rocket className="size-4 text-amber-300" />
                  <span>{loc("شراء الترخيص الدائم فوراً", "Purchase Lifetime License", "Acheter la Licence à Vie", "Ömür Boyu Lisansı Satın Al")}</span>
                  {isRtl ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
                </Link>

                <a
                  href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                    loc(
                      `مرحباً، أود الاستفسار حول باقة الترخيص الدائم لمنظومة لوناليزا بسعر $${currentPrice.toLocaleString()} ${
                        includeNativeApps ? "(مع تطبيقات الهواتف الأصيلة)" : ""
                      }.`,
                      `Hello, I would like to inquire about the Lonaliza Lifetime Enterprise License ($${currentPrice.toLocaleString()}) ${
                        includeNativeApps ? "(with Native Mobile Apps)" : ""
                      }.`,
                      `Bonjour, je souhaite des informations sur la licence permanente Lonaliza (${currentPrice.toLocaleString()} $) ${
                        includeNativeApps ? "(avec applications mobiles natives)" : ""
                      }.`,
                      `Merhaba, ${currentPrice.toLocaleString()}$ tutarındaki Lonaliza Ömür Boyu Kurumsal Lisans Paketi hakkında bilgi almak istiyorum ${
                        includeNativeApps ? "(Yerel Mobil Uygulamalar dahil)" : ""
                      }.`
                    )
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 py-4 px-6 text-sm font-bold text-purple-950 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <MessageCircle className="h-4 w-4 text-purple-700" />
                  <span>
                    {loc("تواصل معنا عبر واتساب", "Chat on WhatsApp", "Discuter sur WhatsApp", "WhatsApp ile İletişime Geçin")}
                  </span>
                </a>
              </div>
            </div>

            {/* Optional Updates Subscription Card (1 col) */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {loc("اشتراك اختياري", "Optional Add-on", "Option Facultative", "İsteğe Bağlı Eklenti")}
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    {loc("باقة التحديثات السحابية الليلية", "Nightly Cloud Updates", "Mises à Jour Cloud Nocturnes", "Gece Bulut Güncelleme Paketi")}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {loc(
                      "لضمان بقاء نظامك متوافقاً مع أحدث نماذج الذكاء الاصطناعي ومزودي السفر الجدد.",
                      "Keeps your system updated with latest AI models and travel suppliers automatically.",
                      "Garantit la compatibilité continue avec les derniers modèles d'IA et fournisseurs de voyage.",
                      "Sisteminizin en son yapay zeka modelleri ve yeni seyahat sağlayıcılarıyla sürekli uyumlu kalmasını sağlar."
                    )}
                  </p>
                </div>

                {/* Price Tag */}
                <div className="flex items-baseline gap-2 pt-2">
                  <span className="text-4xl font-black text-slate-900 font-mono">${updatePrice}</span>
                  <span className="text-xs text-slate-500 font-semibold">
                    {loc("/ شهرياً (اختياري)", "/ Month (Optional)", "/ mois (Facultatif)", "/ ay (İsteğe Bağlı)")}
                  </span>
                </div>

                {/* Features */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  {updateFeatures.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <RefreshCw className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <Link
                  href="/partners/dashboard"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 py-3.5 px-4 text-xs font-bold text-purple-700 transition-all shadow-xs"
                >
                  <span>
                    {loc("إدارة الاشتراك من بوابة الشركاء", "Manage in Partner Portal", "Gérer dans le Portail Partenaire", "Ortak Portalından Aboneliği Yönet")}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* White Label Subscriptions View */
          <div className="space-y-12 max-w-6xl mx-auto animate-in fade-in duration-200">
            {/* 1. Smart Profit & ROI Calculator Box */}
            <div className="rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-white via-purple-50/40 to-amber-50/30 p-6 sm:p-10 shadow-xl relative overflow-hidden space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-purple-100">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-black">
                    <Sliders className="size-3.5 text-purple-700" />
                    <span>{loc("حاسبة الأرباح التفاعلية الذكية", "Smart Profit & Revenue Calculator", "Calculateur de Profit Intelligent", "Akıllı Kâr ve Gelir Hesaplayıcı")}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    {loc(
                      "احسب صافي أرباحك وعوائدك مع احتفاظك بـ 100% من هوامشك",
                      "Estimate Your Net Monthly & Annual Profits with 100% Markup Retention",
                      "Estimez Vos Profits Nets Mensuels et Annuels avec 100% de Marge Conservée",
                      "%100 Kâr Marjınızı Koruyarak Aylık ve Yıllık Net Kazancınızı Hesaplayın"
                    )}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {loc(
                      "حرك المؤشرات أدناه وفقاً لحجم مبيعاتك الشهرية المتوقع ونسبة هامش الربح الذي تضيفه على تذاكر وحجوزات عملائك.",
                      "Adjust sliders based on your projected monthly sales volume and your preferred markup percentage.",
                      "Ajustez les curseurs selon votre volume de ventes estimé et votre pourcentage de marge.",
                      "Tahmini aylık satış hacminize ve eklemek istediğiniz kâr marjı yüzdesine göre kaydırıcıları ayarlayın."
                    )}
                  </p>
                </div>

                <div className="shrink-0 bg-white/90 border border-purple-200 rounded-2xl p-3 px-5 text-center shadow-xs">
                  <div className="text-xs font-bold text-slate-500">{loc("عمولة المبيعات المستقطعة", "Sales Cut Clawback", "Commission Prélevée", "Kesilen Satış Komisyonu")}</div>
                  <div className="text-2xl font-black text-emerald-600 font-mono">0%</div>
                  <div className="text-[10px] font-bold text-slate-400">{loc("أرباحك 100% لك بالكامل", "100% Retained by You", "100% Conservé par Vous", "%100 Tamamı Sizin")}</div>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Slider 1: Sales Volume */}
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-black text-slate-800">
                    <span>{loc("حجم المبيعات الشهرية المتوقع:", "Projected Monthly Sales Volume:", "Volume Mensuel de Ventes :", "Tahmini Aylık Satış Hacmi:")}</span>
                    <span className="text-base font-mono text-purple-900 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200 font-black">
                      ${salesVolume.toLocaleString()}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5000}
                    max={300000}
                    step={2500}
                    value={salesVolume}
                    onChange={(e) => setSalesVolume(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-700"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono font-bold">
                    <span>$5,000</span>
                    <span>$150,000</span>
                    <span>$300,000</span>
                  </div>
                </div>

                {/* Slider 2: Markup Percentage */}
                <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-black text-slate-800">
                    <span>{loc("نسبة هامش الربح المضافة (Markup %):", "Your Added Markup Percentage (%):", "Pourcentage de Marge Ajoutée (%):", "Eklenen Kâr Marjı Yüzdesi (%):")}</span>
                    <span className="text-base font-mono text-amber-900 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 font-black">
                      {markupPercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={30}
                    step={1}
                    value={markupPercent}
                    onChange={(e) => setMarkupPercent(Number(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono font-bold">
                    <span>5%</span>
                    <span>15%</span>
                    <span>30%</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Live Computed Metrics Ribbon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900 to-[#2e1065] text-white space-y-1 shadow-md">
                  <div className="text-[11px] text-purple-200 font-bold">{loc("صافي ربحك الشهري الصافي", "Your Monthly Net Profit", "Profit Net Mensuel", "Aylık Net Kârınız")}</div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
                    ${monthlyProfit.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-purple-300">{loc("أرباح هوامش مباشرة بحسابك", "Direct margin revenue in your account", "Revenu direct de marge", "Hesabınıza geçen doğrudan kâr")}</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-purple-200 text-slate-900 space-y-1 shadow-2xs">
                  <div className="text-[11px] text-slate-500 font-bold">{loc("صافي ربحك السنوي المتوقع", "Projected Annual Net Profit", "Profit Net Annuel Projeté", "Tahmini Yıllık Net Kâr")}</div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-purple-900">
                    ${annualProfit.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">{loc("بدون اقتطاع عمولات من المبيعات", "Zero sales cut clawbacks", "Sans commission prélevée", "Satış komisyonu kesilmeden")}</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-amber-200 text-slate-900 space-y-1 shadow-2xs">
                  <div className="text-[11px] text-slate-500 font-bold">{loc("وفورات الضمانات والربط المالي", "Bank Guarantees Capital Saved", "Garanties Bancaires Économisées", "Tasarruf Edilen Banka Teminatı")}</div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-amber-600">
                    +$50,000+
                  </div>
                  <div className="text-[10px] text-slate-400">{loc("توفير رأس مال محجوز لدى GDS", "No upfront frozen bonds needed", "Aucune caution bloquée requise", "GDS'te bloke teminata gerek yok")}</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-slate-900 space-y-1 shadow-2xs">
                  <div className="text-[11px] text-emerald-800 font-bold">{loc("ما توفره مقارنة بنظام OTA تقليدي", "Saved vs Traditional 15% OTA Cuts", "Économisé vs Commissions OTA 15%", "Geleneksel %15 Komisyona Göre Tasarruf")}</div>
                  <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700">
                    ${annualTraditionalCommission.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold">{loc("سنوياً تبقى في جيبك 100%", "Kept in your pocket 100% every year", "Reste dans votre poche chaque année", "Her yıl cebinizde kalan tutar")}</div>
                </div>
              </div>
            </div>

            {/* 2. The Two White Label Plan Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
              {/* White Label Free Starter ($0/mo) */}
              <div className="rounded-3xl border-2 border-amber-300/80 bg-white p-6 sm:p-8 shadow-xl shadow-amber-950/5 flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-black text-amber-800">
                      <Sparkles className="size-3.5 text-amber-600" />
                      <span>{loc("انطلاقة العلامة البيضاء 0$ للاشتراك", "Zero Subscription Starter", "Démarrage Sans Frais 0 $", "Ücretsiz Başlangıç 0$")}</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {loc("سحابة لوناليزا Lonaliza Cloud", "Hosted on Lonaliza Cloud", "Hébergé Cloud Lonaliza", "Lonaliza Bulut Barındırma")}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black text-slate-900">
                      {loc("العلامة البيضاء السحابية (Starter)", "Cloud Free White Label (Starter)", "White Label Cloud Gratuit (Starter)", "Ücretsiz Bulut White Label (Başlangıç)")}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {loc(
                        "أطلق موقع وتطبيق حجوزات سياحي متكامل بهويتك ودومينك الخاص مع وصول مباشر لأسعار الجملة لـ 500+ طيران ومئات آلاف الفنادق وتحديثات مجانية للأبد دون أي رسوم اشتراك شهرية.",
                        "Launch a fully branded booking portal with your custom domain, wholesale flight and hotel feeds, zero monthly software fees, and free lifetime cloud updates.",
                        "Lancez un site de réservation à votre marque avec domaine personnalisé, flux hôteliers et aériens de gros, 0 $ d'abonnement et mises à jour gratuites.",
                        "Kendi markanız ve özel alan adınızla, aylık yazılım ücreti olmadan ve ömür boyu ücretsiz güncellemelerle toptan seyahat rezervasyon sitenizi hemen açın."
                      )}
                    </p>
                  </div>

                  {/* Price Display */}
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-5xl font-black text-slate-900 font-mono">$0</span>
                    <div className="text-xs text-slate-500 font-semibold">
                      <p className="text-amber-700 font-bold uppercase">{loc("شهرياً مجاناً للأبد", "Forever Free / mo", "Gratuit à Vie / mois", "Ömür Boyu Ücretsiz / ay")}</p>
                      <p>{loc("تحديثات وصيانة سحابية مجانية 100%", "100% Free Cloud Updates Included", "Mises à jour cloud 100% incluses", "%100 Ücretsiz Bulut Güncellemeleri Dahil")}</p>
                    </div>
                  </div>

                  {/* Requirements / Wallet Callout */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-amber-900">
                      <PiggyBank className="size-4 text-amber-600 shrink-0" />
                      <span>{loc("شرط تفعيل الحجوزات: إيداع محفظة تشغيلي $2,000", "Booking Prerequisite: $2,000 Wallet Deposit", "Prérequis de Réservation : Dépôt de 2 000 $", "Rezervasyon Koşulu: 2.000$ Cüzdan Yüklemesi")}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {loc(
                        "الرصيد يبقى بالكامل رصيدك المالي الصافي لإصدار تذاكر وحجوزات عملائك من المحفظة دون أي استقطاع، مع الحفاظ على كامل أرباحك وهوامشك.",
                        "100% of the deposit remains your pure working capital used to issue client tickets and vouchers instantly from your balance without any platform cuts.",
                        "100% du dépôt reste votre solde de roulement pour émettre instantanément les billets de vos clients sans commission additionnelle.",
                        "Yatırılan tutarın %100'ü tamamen sizin net bakiyeniz olarak kalır ve müşterilerinizin bilet ve rezervasyonlarını anında kesmek için kullanılır."
                      )}
                    </p>
                  </div>

                  {/* Included and Locked Features Checklist */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{loc("محرك رحلات الطيران المجمع عبر كبرى شبكات GDS مع تحديد هوامش ربحك بحرية", "Global Aggregated GDS Flights Engine with flexible markup settings", "Moteur vols GDS agrégé avec configuration libre de votre marge", "Kâr marjınızı serbestçe belirleyebileceğiniz küresel GDS uçak motoru")}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{loc("محرك الفنادق وتأكيد الحجز الفوري لأكثر من 3,000,000 فندق ومنتجع عالمي", "Instant Hotel Booking Engine for +3,000,000 global hotels & resorts", "Moteur hôtels mondial (+3 000 000 d'établissements)", "+3.000.000 küresel otel ve tatil köyü için anında otel rezervasyon motoru")}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{loc("محرك حجز المواصلات المركزية والنقل من وإلى المطارات", "Central Airport Transfer & Transportation Dispatch engine", "Moteur de transferts aéroport et transports centralisés", "Merkezi havalimanı transfer ve ulaşım rezervasyon motoru")}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{loc("ربط دومينك الخاص (Custom Domain) مع مساعد الذكاء الاصطناعي للـ DNS وشهادة SSL", "Custom Domain connection with AI DNS Assistant & Auto-SSL", "Connexion de domaine personnalisé avec Assistant IA DNS & SSL", "Yapay zeka DNS asistanı ve otomatik SSL ile özel alan adı bağlama")}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{loc("لوحة تحكم الشركاء لإدارة المحفظة، الفواتير الضريبية، ومفاتيح API المشفرة", "Partner portal for wallet management, tax invoices & encrypted API keys", "Portail partenaire avec gestion portefeuille, factures et clés API", "Cüzdan yönetimi, vergi faturaları ve şifreli API anahtarları için ortak paneli")}</span>
                    </div>

                    {/* Visibly Locked Features for Starter */}
                    <div className="flex items-start gap-2 text-slate-400 pt-1">
                      <Lock className="size-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>{loc("الوحدات اليدوية (إضافة البرامج السياحية الخاصة والجولات والأسطول الداخلي)", "Manual inventory (Custom Packages, Tours & Private Fleet)", "Inventaire manuel (Forfaits, Circuits & Flotte privée)", "Manuel envanter (Özel Paketler, Turlar ve Özel Filo)")}</span>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                          {loc("مقفلة - تتطلب ترقية", "Locked - Upgrade Required", "Verrouillé - Mise à niveau", "Kilitli - Yükseltme Gerekir")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-slate-400">
                      <Lock className="size-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="flex items-center gap-2 flex-wrap">
                        <span>{loc("سرب الذكاء الاصطناعي (6 AI Agents) للتسويق الآلي ومولد البرامج الفاخرة", "AI Swarm (6 Agents) & Automated Multi-Network Publisher", "Essaim d'IA (6 Agents) et Marketing Multi-Réseaux", "Yapay Zeka Sürüsü (6 Ajan) ve Otonom Pazarlama")}</span>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                          {loc("مقفلة - تتطلب ترقية", "Locked - Upgrade Required", "Verrouillé - Mise à niveau", "Kilitli - Yükseltme Gerekir")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWlPlan("whitelabel_free");
                      setWlModalOpen(true);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-4 text-xs sm:text-sm font-black transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <Rocket className="size-4 text-amber-400" />
                    <span>{loc("ابدأ الآن مجاناً (تشغيل فوري 0$)", "Launch Free Starter ($0)", "Démarrer Starter Gratuit (0 $)", "Hemen Ücretsiz Başlatın (0$)")}</span>
                  </button>
                </div>
              </div>

              {/* White Label Pro Paid Tier ($199/mo) */}
              <div className="rounded-3xl border-2 border-purple-600 bg-white p-6 sm:p-8 shadow-2xl shadow-purple-950/10 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-4 end-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#2e1065] to-[#4c1d95] px-3 py-1 text-[11px] font-black text-white shadow-sm">
                    <Award className="size-3.5 text-amber-300" />
                    <span>{loc("الباقة الشاملة للمحترفين", "Pro Agency Choice", "Choix Pro Tout-en-Un", "Profesyonel Acente Tercihi")}</span>
                  </span>
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-black text-purple-900">
                      <Sparkles className="size-3.5 text-purple-600" />
                      <span>{loc("اشتراك شهري مرن", "Flexible Monthly Subscription", "Abonnement Mensuel Flexible", "Esnek Aylık Abonelik")}</span>
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">
                      {loc("العلامة البيضاء الاحترافية (Pro Suite)", "Pro White Label Suite", "Suite White Label Professionnelle", "Kapsamlı Profesyonel White Label")}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      {loc(
                        "لكافة شركات ووكالات السياحة الطموحة التي ترغب في إطلاق منصتها بكامل ميزاتها الـ 52، وبيع برامجها وجولاتها الخاصة ومخزونها اليدوي دون الحاجة لعقود توريد وتأمينات بنكية ضخمة.",
                        "For ambitious agencies who need immediate launch with full 52 platform capabilities, manual package creation, custom tours, private vehicles, without heavy GDS supplier deposits.",
                        "Pour les agences ambitieuses souhaitant un lancement immédiat avec les 52 fonctionnalités, forfaits manuels, circuits et flotte privée.",
                        "Doğrudan tedarikçilerle ağır teminat sözleşmelerine gerek kalmadan, tüm 52 özellik, kendi tur paketleri ve manuel envanteriyle anında başlamak isteyen acenteler için."
                      )}
                    </p>
                  </div>

                  {/* Price Display */}
                  <div className="flex items-baseline gap-2 pt-1">
                    <span className="text-5xl font-black text-slate-900 font-mono">$199</span>
                    <div className="text-xs text-slate-500 font-semibold">
                      <p className="text-purple-900 font-bold uppercase">{loc("/ شهرياً فقط", "/ Month Only", "/ mois seulement", "/ ay")}</p>
                      <p>{loc("شاملة الاستضافة والتحديثات والدعم الفني", "Includes Hosting, Nightly Updates & Support", "Hébergement, Mises à jour & Support Inclus", "Barındırma, Güncellemeler ve Destek Dahil")}</p>
                    </div>
                  </div>

                  {/* Advantage Callout */}
                  <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 text-xs space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-purple-950">
                      <Zap className="size-4 text-purple-600 shrink-0" />
                      <span>{loc("فتح كافة ميزات المنصة الـ 52 والمخزون اليدوي بنسبة 100%", "Full 100% Unlocked 52 Capabilities & Custom Inventory", "Déblocage à 100% des 52 Fonctionnalités & Inventaire Manuel", "52 Özelliğin Tamamı ve Manuel Envanter %100 Açık")}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {loc(
                        "أضف برامجك السياحية المتكاملة، وجولاتك المحلية، وأسطول سياراتك بأسعارك وهوامش ربحك دون أي قيود، مع الاستفادة من محركات التوريد العالمية للطيران والفنادق.",
                        "Sell your own custom multi-day travel packages, guided excursions, and private transfer fleet while leveraging global flight and hotel distribution.",
                        "Vendez vos propres forfaits sur-mesure, excursions guidées et flotte privée tout en bénéficiant de la distribution vols et hôtels mondiale.",
                        "Kendi tur programlarınızı, yerel turlarınızı ve özel araç filonuzu sınırsız ekleyip satarken, küresel uçak ve otel dağıtım ağından da yararlanın."
                      )}
                    </p>
                  </div>

                  {/* Included Features */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="size-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>{loc("فتح كامل لوحدات البرامج السياحية (Packages) والجولات (Tours) والنقل الخاص (Transfers)", "Unlocked manual packages, guided tours, and private transfer modules", "Modules forfaits, circuits et transferts privés débloqués", "Paket turlar, rehberli geziler ve özel transfer modülleri tamamen açık")}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="size-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>{loc("سرب الذكاء الاصطناعي (6 AI Agents) ومولد البرامج الفاخرة مع تصدير PDF أنيق", "6 AI Swarm agents + automated luxury itinerary builder with PDF export", "6 Agents IA en essaim et générateur d'itinéraires de luxe avec export PDF", "6 yapay zeka ajanı ve şık PDF dışa aktarımlı lüks seyahat programı oluşturucu")}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="size-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>{loc("أتمتة واستعادة السلات المتروكة عبر واتساب وبوت تيليجرام 24/7", "24/7 WhatsApp abandoned cart recovery & Telegram management bot", "Récupération paniers WhatsApp 24/7 et bot Telegram", "7/24 WhatsApp terk edilmiş sepet kurtarma ve Telegram yönetim botu")}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="size-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>{loc("نظام المحفظة B2B مع الشحن بالبطاقة والتحويل البنكي الفوري مع صفر عمولات مبيعات", "B2B wallet engine with card deposits and 0% sales fee", "Portefeuille B2B avec dépôts carte et 0% commission", "Kredi kartı ve %0 satış komisyonuyla B2B cüzdan motoru")}</span>
                    </div>
                    <div className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="size-4 text-purple-600 shrink-0 mt-0.5" />
                      <span>{loc("دعم فني استشاري ذو أولوية 24/7 عبر واتساب وتيليجرام", "24/7 Priority consulting & technical support via WhatsApp & Telegram", "Support technique prioritaire 24/7 par WhatsApp et Telegram", "WhatsApp ve Telegram üzerinden 7/24 öncelikli teknik ve danışmanlık desteği")}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWlPlan("whitelabel_paid");
                      setWlModalOpen(true);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] hover:from-[#1e0a45] hover:to-[#3b1378] text-white py-3.5 px-4 text-xs sm:text-sm font-black transition-all shadow-lg shadow-purple-900/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  >
                    <Sparkles className="size-4 text-amber-300" />
                    <span>{loc("اشترك في باقة المحترفين ($199/شهر)", "Subscribe to Pro White Label ($199/mo)", "Souscrire au White Label Pro (199 $/mois)", "Profesyonel Pakete Abone Ol (199$/ay)")}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Complete 52 Platform Features Comprehensive Governance Matrix */}
        <div className="max-w-6xl mx-auto pt-4">
          <div className="text-center">
            <button
              onClick={() => setShowFeatureDrawer(!showFeatureDrawer)}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 text-slate-800 text-xs sm:text-sm font-black shadow-xs transition-all hover:bg-purple-50/50 cursor-pointer"
            >
              <Layers className="size-4 text-purple-700" />
              <span>
                {showFeatureDrawer
                  ? loc("إخفاء جدول مصفوفة الميزات التفصيلية (52 ميزة)", "Collapse Detailed Feature Matrix (52 Features)", "Masquer la matrice détaillée des fonctionnalités", "Ayrıntılı 52 Özellik Matrisini Gizle")
                  : loc("استعراض مصفوفة حوكمة كافة ميزات المنظومة بالتفصيل (52 ميزة عبر 7 أقسام)", "Explore Complete System Capability Matrix (52 Features across 7 Pillars)", "Explorer la matrice complète des 52 fonctionnalités (7 Piliers)", "Tüm Sistem Özelliklerini İnceleyin (7 Ana Bölümde 52 Özellik)")}
              </span>
              {showFeatureDrawer ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          </div>

          {showFeatureDrawer && (
            <div className="mt-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-900 border border-purple-200 text-xs font-black">
                  <ShieldCheck className="size-3.5 text-purple-700" />
                  <span>{loc("مصفوفة الحوكمة والمقارنة الشاملة", "Platform Governance & Capability Matrix", "Matrice de Gouvernance de la Plateforme", "Platform Yönetişim ve Karşılaştırma Matrisi")}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 text-balance">
                  {loc("جدول المقارنة وحالة الميزات عبر كافة الباقات (52 ميزة متكاملة)", "Comprehensive Feature Availability Across All Plans (52 Features)", "Disponibilité des Fonctionnalités par Formule (52 Fonctionnalités)", "Tüm Paketlerde Özellik Kullanılabilirlik Tablosu (52 Özellik)")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 text-balance">
                  {loc("توضح هذه المصفوفة الميزات المفعلة والمقفلة في باقة العلامة البيضاء المجانية مقارنة بباقة المحترفين وباقة التملك الدائم.", "This matrix details enabled vs locked features in Free White Label compared to Pro White Label and Lifetime Ownership.", "Cette matrice détaille les fonctionnalités actives et verrouillées.", "Bu matris, Ücretsiz White Label, Pro White Label ve Ömür Boyu Lisans arasındaki aktif ve kilitli özellikleri detaylandırır.")}
                </p>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter("all")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedCategoryFilter === "all"
                      ? "bg-purple-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {loc("كافة الأقسام الـ 7 (52 ميزة)", "All 7 Pillars (52 Features)", "Tous les 7 Piliers (52)", "Tüm 7 Kategori (52)")}
                </button>
                {FEATURE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedCategoryFilter === cat.id
                        ? "bg-purple-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {isRtl ? cat.nameAr : cat.nameEn}
                  </button>
                ))}
              </div>

              {/* Features Comparison Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-start text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="py-3.5 px-4 text-start font-black">{loc("الميزة والوصف التفصيلي", "Feature & Capability", "Fonctionnalité & Description", "Özellik ve Açıklama")}</th>
                      <th className="py-3.5 px-3 text-center font-black w-32 bg-amber-500 text-slate-950">
                        {loc("العلامة البيضاء المجانية", "Free White Label", "White Label Gratuit", "Ücretsiz WL")}
                        <div className="text-[10px] font-mono font-normal">$0/mo</div>
                      </th>
                      <th className="py-3.5 px-3 text-center font-black w-32 bg-purple-800 text-white">
                        {loc("المحترفين الشاملة", "Pro White Label", "White Label Pro", "Pro WL")}
                        <div className="text-[10px] font-mono font-normal">$199/mo</div>
                      </th>
                      <th className="py-3.5 px-3 text-center font-black w-36 bg-emerald-700 text-white">
                        {loc("التملك الدائم", "Lifetime Ownership", "Licence à Vie", "Ömür Boyu")}
                        <div className="text-[10px] font-mono font-normal">$1,990 One-Time</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredFeatures.map((feat) => {
                      const freeActive = feat.defaultEnabled.whitelabel_free;
                      const paidActive = feat.defaultEnabled.whitelabel_paid;
                      const ownershipActive = feat.defaultEnabled.ownership;

                      return (
                        <tr key={feat.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 leading-snug">
                              {isRtl ? feat.nameAr : feat.nameEn}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 leading-normal">
                              {isRtl ? feat.descAr : feat.descEn}
                            </div>
                          </td>

                          {/* Free Plan Status */}
                          <td className="py-3 px-3 text-center align-middle bg-amber-50/20">
                            {freeActive ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                                <Check className="size-3.5 stroke-[3]" />
                                <span className="text-[10px]">{loc("مفعلة", "Active", "Active", "Aktif")}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                                <Lock className="size-3" />
                                <span className="text-[10px]">{loc("مقفلة", "Locked", "Verrouillé", "Kilitli")}</span>
                              </span>
                            )}
                          </td>

                          {/* Pro Plan Status */}
                          <td className="py-3 px-3 text-center align-middle bg-purple-50/20">
                            {paidActive ? (
                              <span className="inline-flex items-center gap-1 text-purple-700 font-black bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                                <Check className="size-3.5 stroke-[3]" />
                                <span className="text-[10px]">{loc("مفعلة", "Active", "Active", "Aktif")}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                                <Lock className="size-3" />
                                <span className="text-[10px]">{loc("مقفلة", "Locked", "Verrouillé", "Kilitli")}</span>
                              </span>
                            )}
                          </td>

                          {/* Lifetime Ownership Plan Status */}
                          <td className="py-3 px-3 text-center align-middle bg-emerald-50/20">
                            <span className="inline-flex items-center gap-1 text-emerald-800 font-black bg-emerald-100/70 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                              <Check className="size-3.5 stroke-[3]" />
                              <span className="text-[10px]">{loc("كاملة + سيرفر", "Full + VPS", "Complet + VPS", "Tam + VPS")}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* White Label Instant Onboarding Modal */}
        <WhiteLabelOnboardingModal
          isOpen={wlModalOpen}
          onClose={() => setWlModalOpen(false)}
          initialPlan={selectedWlPlan}
        />
      </div>
    </section>
  );
}
