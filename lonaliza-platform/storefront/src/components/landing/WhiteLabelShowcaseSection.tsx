"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Globe2,
  ShieldCheck,
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Server,
  Building2,
  Coins,
  Layers,
  Rocket,
  Lock,
  ExternalLink,
  ChevronDown,
  Plane,
  Hotel,
  Car,
  Compass,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pickLocaleText } from "./landing-translations";
import WhiteLabelOnboardingModal from "./WhiteLabelOnboardingModal";

export default function WhiteLabelShowcaseSection() {
  const { dir, locale } = useLocale();
  const isRtl = dir === "rtl";
  const loc = (ar: string, en: string, fr?: string, tr?: string) =>
    pickLocaleText(locale, { ar, en, fr, tr });

  const [activeTier, setActiveTier] = useState<"free" | "pro" | "ownership">("pro");
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);
  const [onboardingPlan, setOnboardingPlan] = useState<"whitelabel_free" | "whitelabel_paid">("whitelabel_free");

  const tiersData = {
    free: {
      badge: loc("للوكالات الناشئة والناشطين السياحيين", "For Emerging Agencies & Travel Creators", "Pour Agences Émergentes", "Gelişmekte Olan Acenteler İçin"),
      title: loc("العلامة البيضاء السحابية (Starter)", "Cloud White Label (Starter)", "White Label Cloud (Starter)", "Bulut White Label (Başlangıç)"),
      price: "$0",
      period: loc("/ شهرياً مدى الحياة", "/ mo Lifetime Free", "/ mois Gratuit à Vie", "/ ay Ömür Boyu Ücretsiz"),
      desc: loc(
        "أطلق وكالتك الرقمية اليوم بدون أي رسوم برمجية شهرية مع وصول مباشر لأفضل أسعار الجملة للطيران والفنادق العالمية بهويتك ودومينك الخاص.",
        "Launch your digital travel agency today with zero software subscription and direct aggregated wholesale travel rates.",
        "Lancez votre agence de voyage numérique sans frais de logiciel mensuels avec des tarifs de gros agrégés.",
        "Aylık yazılım ücreti olmadan, toptan seyahat fiyatlarıyla kendi markanız ve alan adınızla hemen başlayın."
      ),
      depositNotice: loc(
        "إيداع محفظة تشغيلي $2,000 (100% رصيدك الصافي لإصدار تذاكر وحجوزات عملائك)",
        "$2,000 operational wallet deposit (100% remains your net balance to issue customer bookings)",
        "Dépôt de portefeuille de 2 000 $ (100% de votre solde net pour émettre les réservations)",
        "2.000$ işletme cüzdanı teminatı (%100'ü müşterilerinizin rezervasyonlarını kesmek için sizin bakiyenizdir)"
      ),
      highlights: [
        loc("موقع حجز متكامل بهويتك البصرية، شعارك، ودومينك الخاص 100%", "Full booking portal with your logo, brand colors, and custom domain", "Site complet avec votre logo, couleurs et domaine propre", "Logonuz, renkleriniz ve özel alan adınızla eksiksiz rezervasyon sitesi"),
        loc("محركات طيران وفنادق ومواصلات جاهزة للبيع مباشرة بأسعار الجملة", "Pre-configured wholesale flight, hotel, and transfer booking engines", "Moteurs vols, hôtels et transferts prêts à la vente aux tarifs de gros", "Toptan fiyatlarla satışa hazır uçak, otel ve transfer motorları"),
        loc("حفظ كامل أرباحك وهوامشك (Markup) بنسبة 100% دون اقتطاع عمولات", "Keep 100% of your markups with zero platform sales commissions", "Conservez 100% de vos marges sans commission sur vos ventes", "Satış komisyonu kesintisi olmadan kâr marjınızın %100'ü size kalır"),
        loc("لوحة شركاء لإدارة المحفظة، إصدار الفواتير، وربط مفاتيح API", "Dedicated partner portal for wallet top-ups, invoicing & API access", "Portail partenaire pour gestion du portefeuille et facturation", "Cüzdan yönetimi, faturalar ve API erişimi için ortak paneli"),
        loc("تحديثات أمنية وتوافق سحابي مجاني للأبد على خوادم لوناليزا", "Free lifetime cloud updates & SSL on high-availability infrastructure", "Mises à jour cloud et SSL gratuits à vie sur l'infrastructure Lonaliza", "Lonaliza altyapısında ömür boyu ücretsiz bulut güncellemeleri ve SSL"),
      ],
      lockedNotice: loc("الوحدات اليدوية (البرامج السياحية الخاصة والجولات وسرب الـ AI) مقفلة", "Custom manual packages, tours, and AI Swarm are locked in starter tier", "Modules forfaits manuels, circuits et essaim IA verrouillés", "Özel manuel paketler, turlar ve yapay zeka sürüsü başlangıç paketinde kilitlidir"),
      ctaText: loc("ابدأ الآن مجاناً (تشغيل فوري $0)", "Launch Free Instance ($0)", "Démarrer Gratuitement (0 $)", "Ücretsiz Başlatın (0$)"),
      ctaAction: () => {
        setOnboardingPlan("whitelabel_free");
        setOnboardingModalOpen(true);
      },
    },
    pro: {
      badge: loc("الخيار الأكثر شمولاً للشركات المتوسعة", "Most Comprehensive for Growing Agencies", "Le Plus Complet pour Agences en Croissance", "Büyüyen Acenteler İçin En Kapsamlı Seçim"),
      title: loc("العلامة البيضاء الاحترافية (Pro Suite)", "Pro White Label Suite", "Suite White Label Pro", "Profesyonel White Label Paketi"),
      price: "$199",
      period: loc("/ شهرياً فقط", "/ Month Only", "/ mois seulement", "/ ay"),
      desc: loc(
        "الحل الأمثل لوكالات السفر التي تريد إطلاق منصة كاملة بجميع ميزاتها الـ 52، مع إمكانية بيع برامجها السياحية وجولاتها وأسطولها الخاص دون تعقيد.",
        "The complete solution for agencies launching all 52 platform capabilities, manual packages, tours, and private vehicle fleet.",
        "La solution complète pour agences exploitant les 52 fonctionnalités, forfaits manuels, circuits et flotte privée.",
        "Tüm 52 platform özelliğini, kendi manuel tur paketlerini ve özel araç filosunu kullanmak isteyen acenteler için eksiksiz çözüm."
      ),
      depositNotice: loc(
        "محفظة B2B مرنة للشحن بالبطاقة والتحويل البنكي الفوري مع صفر قيود",
        "Flexible B2B wallet with instant card top-up & wire deposits with zero restrictions",
        "Portefeuille B2B flexible avec recharge instantanée par carte et virement bancaire",
        "Kredi kartı ve anında banka havalesiyle esnek B2B cüzdanı, sıfır kısıtlama"
      ),
      highlights: [
        loc("فتح كافة ميزات المنصة الـ 52 عبر الأقسام الـ 7 الرئيسية بالكامل", "All 52 platform capabilities unlocked across all 7 core categories", "Les 52 fonctionnalités de la plateforme débloquées à 100%", "Tüm 7 ana kategori genelinde 52 platform özelliğinin tamamı açık"),
        loc("إضافة وبيع البرامج السياحية المتكاملة (Packages) والجولات والأنشطة الخاصة", "Sell custom multi-day travel packages, guided excursions & activities", "Vendez des forfaits sur-mesure, circuits guidés et activités", "Özel çok günlük seyahat paketleri, turlar ve aktiviteler oluşturup satın"),
        loc("إدارة الأسطول الداخلي وخدمات التوصيل والنقل الخاص بأسعارك وهوامشك", "Private transfer fleet management with dynamic per-km pricing", "Gestion de flotte privée et transferts avec tarification dynamique", "Özel araç filosu yönetimi ve dinamik kâr marjlı transfer hizmetleri"),
        loc("سرب الذكاء الاصطناعي (6 AI Agents) للتسويق الآلي ومولد البرامج الفاخرة", "6 Specialized AI Swarm agents + automated itinerary generation", "Essaim de 6 agents IA spécialisés + générateur d'itinéraires", "6 uzman yapay zeka ajanı ve otonom seyahat programı oluşturucu"),
        loc("بوابة واتساب وتيليجرام للأتمتة واستعادة السلات المتروكة 24/7", "24/7 WhatsApp & Telegram marketing automation + cart recovery", "Automatisation marketing WhatsApp & Telegram 24/7 et relance paniers", "7/24 WhatsApp ve Telegram pazarlama otomasyonu ve sepet kurtarma"),
      ],
      lockedNotice: null,
      ctaText: loc("اشترك في باقة المحترفين ($199/شهر)", "Subscribe to Pro Suite ($199/mo)", "Souscrire à la Suite Pro (199 $/mois)", "Profesyonel Pakete Abone Ol (199$/ay)"),
      ctaAction: () => {
        setOnboardingPlan("whitelabel_paid");
        setOnboardingModalOpen(true);
      },
    },
    ownership: {
      badge: loc("التملك المطلق والسيادة الرقمية الكاملة", "Complete Ownership & Digital Sovereignty", "Propriété Totale & Souveraineté Numérique", "Tam Mülkiyet ve Bağımsız Dijital Egemenlik"),
      title: loc("باقة التملك الدائم الكاملة (Lifetime)", "Lifetime Enterprise Ownership", "Licence Permanente Entreprise", "Ömür Boyu Kurumsal Mülkiyet"),
      price: "$1,990",
      period: loc("دفعة واحدة مدى الحياة", "One-Time Payment", "Paiement Unique à Vie", "Tek Seferlik Ömür Boyu"),
      desc: loc(
        "تملك المنظومة بالكامل على سيرفرك الخاص (Contabo VPS مجاناً لسنة) مع فتح كافة الموزعين العالميين الفعليين وإمكانية تشغيل موديولات لوناليزا المركزية.",
        "Full platform deployed on your dedicated German Contabo VPS with all real global distributors plus central Lonaliza B2B engine connectivity.",
        "Plateforme complète sur votre VPS Contabo dédié avec tous les distributeurs mondiaux réels et modules B2B centralisés Lonaliza.",
        "1 yıl ücretsiz bağımsız Contabo VPS sunucunuzda, tüm gerçek küresel dağıtıcılar ve merkezi Lonaliza B2B modülleriyle tam mülkiyet."
      ),
      depositNotice: loc(
        "حرية تامة: اربط عقودك ومفاتيحك المباشرة مع الموزعين، أو اعمل برصيد محفظة B2B المركزية معنا فوراً!",
        "Total freedom: connect your own direct supplier GDS contracts, or leverage central Lonaliza wholesale data instantly!",
        "Liberté totale : connectez vos propres contrats GDS ou exploitez la redistribution centrale Lonaliza immédiatement !",
        "Tam özgürlük: kendi doğrudan dağıtıcı sözleşmelerinizi bağlayın veya anında merkezi Lonaliza toptan veri ağıyla çalışın!"
      ),
      highlights: [
        loc("سيرفر Contabo Cloud VPS ألماني مخصص عالي الأداء مجاناً لسنة كاملة", "1-Year free dedicated high-performance Contabo Cloud VPS (Germany)", "1 an de VPS Contabo dédié haute performance offert (Allemagne)", "1 yıl boyunca ücretsiz yüksek performanslı bağımsız Contabo Bulut VPS"),
        loc("فتح كافة الموزعين العالميين المربوطين (PKFARE, Seeru, Travelport, BiletBank, RateHawk, Hotelbeds...)", "All real integrated global distributors unlocked (PKFARE, Seeru, Travelport, RateHawk, Hotelbeds...)", "Tous les distributeurs mondiaux réels débloqués (PKFARE, Seeru, Travelport, RateHawk, Hotelbeds...)", "Tüm entegre gerçek dağıtıcılar açık (PKFARE, Seeru, Travelport, RateHawk, Hotelbeds...)"),
        loc("دعم العمل بموديولات لوناليزا المركزية ومحفظة B2B دون الحاجة لربط خارجي", "Option to run via central Lonaliza B2B Wallet modules with zero third-party setups", "Option d'utiliser les modules B2B Lonaliza avec portefeuille intégré", "Dış anlaşma yapmadan doğrudan merkezi Lonaliza B2B cüzdan modülleriyle çalışma imkanı"),
        loc("لوحة تحكم aaPanel كاملة مع صلاحيات Root وحماية مشفرة للدومين", "aaPanel admin dashboard with full Root access & permanent SSL", "Tableau de bord aaPanel avec accès Root et certificats SSL permanents", "aaPanel kontrol paneli, tam Root erişimi ve kalıcı SSL sertifikaları"),
        loc("تسليم حي متكامل وتشغيل للمنظومة على سيرفرك خلال 12–24 ساعة عمل", "Guaranteed complete turnkey deployment on your server within 12–24h", "Livraison clés en main garantie sur votre serveur sous 12 à 24h", "12–24 saatte anahtar teslim sunucunuzda canlı kurulum garantisi"),
      ],
      lockedNotice: null,
      ctaText: loc("امتلك المنظومة الدائمة الآن ($1,990)", "Acquire Lifetime Platform ($1,990)", "Acquérir la Licence Permanente (1 990 $)", "Ömür Boyu Sistemi Satın Al (1.990$)"),
      ctaAction: () => {
        window.location.href = "/partners/dashboard";
      },
    },
  };

  const activeData = tiersData[activeTier];

  return (
    <section id="whitelabel-showcase" className="py-20 sm:py-28 bg-slate-900 text-white relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-40 start-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 end-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-amber-300 text-xs font-bold shadow-xs">
            <Sparkles className="size-3.5 text-amber-400" />
            <span>
              {loc(
                "منظومة العلامة البيضاء (White Label) والتملك الدائم",
                "White Label Ecosystem & Lifetime Ownership",
                "Écosystème White Label & Licence Permanente",
                "White Label Ekosistemi ve Kalıcı Mülkiyet"
              )}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white text-balance leading-tight">
            {loc(
              "اختر نموذج العمل الأنسب لطموح شركتك السياحية",
              "Choose the Perfect Model for Your Agency's Ambition",
              "Choisissez le Modèle Idéal pour les Ambitions de Votre Agence",
              "Seyahat Acentenizin Hedeflerine En Uygun Modeli Seçin"
            )}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 text-balance leading-relaxed">
            {loc(
              "سواء كنت ترغب في الانطلاق مجاناً اليوم دون استثمار مبدئي، أو الاشتراك الشهري الشامل للمحترفين، أو تملك المنظومة بالكامل على سيرفرك الخاص، صممنا لك الحل المتكامل.",
              "Whether you want to launch for free with zero upfront costs, enjoy full professional suite flexibility, or own the platform outright on your private server.",
              "Que vous souhaitiez démarrer gratuitement sans frais initiaux, profiter de la flexibilité de la suite Pro, ou posséder entièrement la plateforme sur votre serveur.",
              "İster sıfır maliyetle hemen ücretsiz başlayın, ister aylık profesyonel paketi seçin, ister kendi sunucunuzda sisteme ömür boyu sahip olun."
            )}
          </p>
        </div>

        {/* 3-Way Interactive Tabs Switcher */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-3xl bg-slate-800/80 border border-slate-700/80 shadow-2xl max-w-2xl w-full">
            <button
              type="button"
              onClick={() => setActiveTier("free")}
              className={`flex-1 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTier === "free"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Coins className="size-4 shrink-0" />
              <span>{loc("انطلاقة مجانية ($0)", "Free Starter ($0)", "Starter Gratuit (0 $)", "Ücretsiz Başlangıç ($0)")}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTier("pro")}
              className={`flex-1 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTier === "pro"
                  ? "bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-white shadow-lg shadow-purple-900/40 border border-purple-400/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Zap className="size-4 text-amber-300 shrink-0" />
              <span>{loc("المحترفين الشاملة ($199)", "Pro Suite ($199)", "Suite Pro (199 $)", "Profesyonel ($199)")}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTier("ownership")}
              className={`flex-1 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTier === "ownership"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Server className="size-4 shrink-0" />
              <span>{loc("التملك الدائم ($1,990)", "Lifetime Ownership ($1,990)", "Licence à Vie (1 990 $)", "Ömür Boyu ($1.990)")}</span>
            </button>
          </div>
        </div>

        {/* Selected Tier Deep-Dive Bento Card */}
        <div className="rounded-3xl border border-slate-700/80 bg-gradient-to-b from-slate-800/90 to-slate-900/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 space-y-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-700/60">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-300 bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 rounded-full">
                <Sparkles className="size-3.5 text-amber-400" />
                <span>{activeData.badge}</span>
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">{activeData.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">{activeData.desc}</p>
            </div>

            <div className="text-start lg:text-end shrink-0 bg-slate-800/80 border border-slate-700 px-6 py-4 rounded-2xl">
              <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                {activeData.price}
              </div>
              <div className="text-xs text-slate-400 font-semibold mt-0.5">{activeData.period}</div>
            </div>
          </div>

          {/* Operational Deposit / Freedom Notice */}
          <div className="p-4 sm:p-5 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-start gap-3.5">
            <Coins className="size-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="font-black text-amber-300">
                {activeTier === "ownership"
                  ? loc("مرونة التشغيل والسيادة الكاملة", "Operational Sovereignty & Freedom", "Souveraineté et Liberté Totale", "Operasyonel Esneklik ve Tam Özgürlük")
                  : loc("آلية عمل المحفظة التشغيلية B2B", "B2B Operational Working Capital Mechanism", "Mécanisme du Portefeuille Opérationnel B2B", "B2B Operasyonel Cüzdan Çalışma Prensibi")}
              </div>
              <p className="text-slate-300 leading-relaxed">{activeData.depositNotice}</p>
            </div>
          </div>

          {/* Key Advantages Grid */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
              {loc("أبرز ما تتضمنه هذه الباقة لموقعك السياحي:", "Key Platform Capabilities Included:", "Fonctionnalités Clés Incluses :", "Bu Pakete Dahil Olan Temel Özellikler:")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeData.highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-200">
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </div>
              ))}
            </div>

            {activeData.lockedNotice && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                <Lock className="size-4 text-amber-400 shrink-0" />
                <span>{activeData.lockedNotice}</span>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="pt-6 border-t border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
              <span>
                {loc(
                  "دعم فني استشاري مباشر + توثيق برمجيات API كامل",
                  "Direct consulting support + full API documentation",
                  "Support conseil direct + documentation API complète",
                  "Doğrudan danışmanlık desteği ve eksiksiz API dokümantasyonu"
                )}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={activeData.ctaAction}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <Rocket className="size-4 text-slate-950" />
                <span>{activeData.ctaText}</span>
                {isRtl ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* 4 Pillars Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
            <div className="size-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Globe2 className="size-5" />
            </div>
            <h4 className="text-sm font-black text-white">{loc("دومينك وهوّيتك المستقلة", "100% Your Own Brand", "Votre Propre Marque", "Tamamen Kendi Markanız")}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {loc("إطلاق على دومينك الخاص، بدون أي إشارة للأنظمة الوسيطة، مع أمان SSL مجاني.", "Launches under your custom domain with zero third-party hints and free SSL.", "Déploiement sous votre domaine personnalisé sans mention tierce avec SSL.", "Özel alan adınız altında, üçüncü taraf ibaresi olmadan ücretsiz SSL ile yayınlanır.")}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
            <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Coins className="size-5" />
            </div>
            <h4 className="text-sm font-black text-white">{loc("أرباحك 100% لك دون عمولة", "Keep 100% of Your Profits", "100% des Profits pour Vous", "%100 Kârınızı Koruyun")}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {loc("تحكم كامل في نسب الماركوبس وهوامش الربح دون أي اقتطاع أو مشاركة من مبيعاتك.", "Set your own markups with 0% platform sales cut or commission clawbacks.", "Définissez vos propres marges sans commission prélevée sur vos ventes.", "Satışlarınızdan hiçbir komisyon kesintisi olmadan tüm kârınızı koruyun.")}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
            <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Plane className="size-5" />
            </div>
            <h4 className="text-sm font-black text-white">{loc("موزعون عالميون بدون ضمانات", "Direct GDS Without Guarantees", "GDS Direct Sans Garanties", "Teminatsız Doğrudan GDS")}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {loc("وصول مباشر لكبرى شبكات الطيران والفنادق دون متطلبات إيداع ملايين الدولارات.", "Wholesale flights and global hotel inventories without million-dollar bank bonds.", "Accès direct sans garanties bancaires à plusieurs millions de dollars.", "Milyonlarca dolarlık banka teminatlarına gerek kalmadan toptan fiyatlara doğrudan erişim.")}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
            <div className="size-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Server className="size-5" />
            </div>
            <h4 className="text-sm font-black text-white">{loc("بنية ألمانية فائقة السرعة", "High-Performance Infrastructure", "Infrastructure Allemande Robuste", "Alman Bulut Altyapısı")}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {loc("سيرفرات Contabo Cloud VPS سريعة ومستقرة تلبي معايير Enterprise العالمية.", "High-availability German Contabo VPS architecture meeting top enterprise SLAs.", "Architecture VPS Contabo haute disponibilité respectant les normes SLA.", "Yüksek erişilebilirlikli Alman Contabo VPS altyapısıyla kesintisiz performans.")}
            </p>
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      <WhiteLabelOnboardingModal
        isOpen={onboardingModalOpen}
        onClose={() => setOnboardingModalOpen(false)}
        initialPlan={onboardingPlan}
      />
    </section>
  );
}
