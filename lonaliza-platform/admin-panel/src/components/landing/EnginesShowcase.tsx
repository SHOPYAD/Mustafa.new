"use client";

import { useState } from "react";
import {
  BadgePercent,
  Bus,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  CreditCard,
  Database,
  DollarSign,
  FileCheck,
  Globe,
  Hotel,
  Layers,
  Link2,
  MapPin,
  Percent,
  Plane,
  RefreshCw,
  ShieldCheck,
  Ship,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pickLocaleText } from "./landing-translations";

export default function EnginesShowcase() {
  const { locale, dir } = useLocale();

  // Interactive Markup Simulator State
  const [markupPercent, setMarkupPercent] = useState<number>(12);
  const [monthlyVolume, setMonthlyVolume] = useState<number>(65000);

  const monthlyProfit = Math.round(monthlyVolume * (markupPercent / 100));
  const annualProfit = monthlyProfit * 12;

  const engines = [
    {
      id: "flights",
      title: pickLocaleText(locale, {
        ar: "محرك الطيران الدولي GDS المتصل",
        en: "Connected Global GDS Flights Engine",
        fr: "Moteur de Vols Mondiaux GDS Connecté",
        tr: "Entegre Küresel GDS Uçuş Motoru",
      }),
      badge: pickLocaleText(locale, {
        ar: "+500 شركة طيران GDS",
        en: "+500 Airlines GDS",
        fr: "+500 Compagnies GDS",
        tr: "+500 GDS Havayolu",
      }),
      icon: Plane,
      span: "lg:col-span-2",
      gradient: "from-blue-600 via-cyan-600 to-teal-500",
      bgLight: "bg-blue-50/60 border-blue-100",
      accent: "text-blue-600",
      tag: pickLocaleText(locale, {
        ar: "تذاكر إلكترونية فورية",
        en: "Instant E-Ticketing",
        fr: "Billetterie Électronique",
        tr: "Anında E-Bilet",
      }),
      description: pickLocaleText(locale, {
        ar: "تكامل GDS مباشر يغطي الرحلات المباشرة والترانزيت ومتعددة الوجهات مع تقويم الأسعار المنخفضة، اختيار فئات المقاعد والأوزان، وإصدار التذاكر الإلكترونية بضغطة زر.",
        en: "Direct GDS integration covering non-stop, transit, and multi-city flights with low-fare calendars, seat selection, baggage tiers, and instant e-ticket issuing.",
        fr: "Intégration GDS directe pour vols directs, escales et multi-destinations avec calendrier des bas tarifs, sélection des sièges, bagages et émission instantanée de billets.",
        tr: "Aktarmasız, transit ve çoklu uçuşları kapsayan doğrudan GDS entegrasyonu; düşük fiyat takvimi, koltuk ve bagaj seçimi ile anında e-bilet düzenleme.",
      }),
      metrics: [
        {
          label: pickLocaleText(locale, { ar: "سرعة البحث", en: "Search Speed", fr: "Vitesse Recherche", tr: "Arama Hızı" }),
          value: "320ms",
        },
        {
          label: pickLocaleText(locale, { ar: "شركات طيران GDS", en: "GDS Airlines", fr: "Compagnies GDS", tr: "GDS Havayolları" }),
          value: "+500",
        },
        {
          label: pickLocaleText(locale, { ar: "هامش الربح", en: "Agency Markup", fr: "Marge Agence", tr: "Acente Kârı" }),
          value: pickLocaleText(locale, { ar: "قابل للتخصيص", en: "Customizable", fr: "Personnalisable", tr: "Özelleştirilebilir" }),
        },
      ],
      features: [
        pickLocaleText(locale, {
          ar: "ربط مباشر مع أنظمة GDS العالمية (Amadeus, Sabre, Travelport)",
          en: "Direct integration with global GDS (Amadeus, Sabre, Travelport)",
          fr: "Intégration directe aux GDS mondiaux (Amadeus, Sabre, Travelport)",
          tr: "Küresel GDS sistemleriyle doğrudan entegrasyon (Amadeus, Sabre, Travelport)",
        }),
        pickLocaleText(locale, {
          ar: "تقويم أسعار مرن لاقتراح أرخص تواريخ السفر آلياً",
          en: "Interactive flexible price calendar for cheapest dates",
          fr: "Calendrier interactif des prix flexibles pour les dates les plus économiques",
          tr: "En uygun seyahat tarihlerini otomatik öneren esnek fiyat takvimi",
        }),
        pickLocaleText(locale, {
          ar: "إصدار التذاكر وتأكيدات PNR وحساب الأوزان بمرونة",
          en: "Automated PNR retrieval and PDF e-ticket generation",
          fr: "Récupération automatisée des PNR et génération de billets électroniques PDF",
          tr: "Otomatik PNR sorgulama, bagaj hesaplama ve anında PDF e-bilet oluşturma",
        }),
      ],
    },
    {
      id: "hotels",
      title: pickLocaleText(locale, {
        ar: "محرك الفنادق العالمي (+3 مليون فندق)",
        en: "+3,000,000 Global Hotels Engine",
        fr: "Moteur Hôtelier Mondial (+3M Hôtels)",
        tr: "Küresel Otel Motoru (+3M Otel)",
      }),
      badge: pickLocaleText(locale, {
        ar: "+3 مليون فندق",
        en: "+3,000,000 Hotels",
        fr: "+3M d'Hôtels",
        tr: "+3.000.000 Otel",
      }),
      icon: Hotel,
      span: "lg:col-span-1",
      gradient: "from-[#2e1065] to-[#4c1d95]",
      bgLight: "bg-purple-50/60 border-purple-100",
      accent: "text-purple-700",
      tag: pickLocaleText(locale, {
        ar: "بنوك غرف عالمية + عقودك",
        en: "Bed Banks + Direct",
        fr: "Banques de Lits + Direct",
        tr: "Yatak Bankaları + Direkt",
      }),
      description: pickLocaleText(locale, {
        ar: "تغطية عالمية تشمل أكثر من 3 مليون فندق ومنتجع عبر كبرى بنوك الغرف، مع إمكانية استيراد فنادقك الخاصة بالذكاء الاصطناعي برابط فوري.",
        en: "Worldwide coverage of +3,000,000 hotels and luxury resorts via top bed banks, plus instant AI hotel URL importing for your direct contracts.",
        fr: "Couverture mondiale de plus de 3 millions d'hôtels et resorts via les plus grandes banques de lits, avec importation IA instantanée par lien.",
        tr: "Önde gelen yatak bankaları aracılığıyla +3.000.000 otel ve tatil köyü kapsamı; ayrıca doğrudan sözleşmeleriniz için yapay zeka ile anında otel bağlantısı içe aktarma.",
      }),
      metrics: [
        {
          label: pickLocaleText(locale, { ar: "فنادق عالمية", en: "Inventory", fr: "Inventaire", tr: "Envanter" }),
          value: "+3,000,000",
        },
        {
          label: pickLocaleText(locale, { ar: "استيراد بالـ AI", en: "AI URL Import", fr: "Import IA", tr: "AI Bağlantı İçe Aktar" }),
          value: pickLocaleText(locale, { ar: "فوري برابط", en: "Instant Link", fr: "Lien Instantané", tr: "Anında Bağlantı" }),
        },
      ],
      features: [
        pickLocaleText(locale, {
          ar: "ربط بنوك الغرف العالمية (Hotelbeds, WebBeds, Expedia, RateHawk)",
          en: "Global bed banks (Hotelbeds, WebBeds, Expedia, RateHawk)",
          fr: "Banques de lits mondiales (Hotelbeds, WebBeds, Expedia, RateHawk)",
          tr: "Küresel yatak bankaları bağlantısı (Hotelbeds, WebBeds, Expedia, RateHawk)",
        }),
        pickLocaleText(locale, {
          ar: "صور عالية الدقة، تقييمات موثقة، وتوليد قسائم الحجز الرسمية",
          en: "HD galleries, verified reviews & branded PDF hotel vouchers",
          fr: "Galeries HD, avis vérifiés et bons d'hôtel PDF à votre marque",
          tr: "Yüksek çözünürlüklü fotoğraflar, onaylı yorumlar ve kurumsal PDF otel kuponları",
        }),
      ],
    },
    {
      id: "packages",
      title: pickLocaleText(locale, {
        ar: "صانع الباقات السياحية الذكية",
        en: "Dynamic Tour Packages Builder",
        fr: "Créateur de Séjours Dynamiques",
        tr: "Dinamik Tur Paketi Oluşturucu",
      }),
      badge: pickLocaleText(locale, {
        ar: "برامج مخصصة",
        en: "Custom Itineraries",
        fr: "Itinéraires Sur Mesure",
        tr: "Özel Seyahat Programları",
      }),
      icon: Layers,
      span: "lg:col-span-2",
      gradient: "from-purple-600 via-indigo-600 to-violet-500",
      bgLight: "bg-purple-50/60 border-purple-100",
      accent: "text-purple-600",
      tag: pickLocaleText(locale, {
        ar: "باقات ديناميكية كاملة",
        en: "All-Inclusive Builder",
        fr: "Créateur Tout Compris",
        tr: "Her Şey Dahil Paketler",
      }),
      description: pickLocaleText(locale, {
        ar: "صمم باقات عطلات متكاملة تجمع الطيران، الفنادق، النقل اليومي، والأنشطة السياحية مع جدول زمني تفاعلي وأداة مقارنة الباقات للمسافرين.",
        en: "Craft end-to-end holiday packages combining flights, luxury stays, daily chauffeur tours, and excursions with an interactive day-by-day scheduler.",
        fr: "Concevez des séjours complets combinant vols, hébergements de luxe, transferts avec chauffeur et excursions avec un planificateur interactif.",
        tr: "Uçuş, konaklama, özel şoförlü transferler ve turları etkileşimli bir gün gün program ve paket karşılaştırma aracıyla birleştiren eksiksiz tatil paketleri tasarlayın.",
      }),
      metrics: [
        {
          label: pickLocaleText(locale, { ar: "أداة المقارنة", en: "Comparison Drawer", fr: "Comparateur", tr: "Karşılaştırma Çekmecesi" }),
          value: pickLocaleText(locale, { ar: "تفاعلية", en: "Interactive", fr: "Interactif", tr: "Etkileşimli" }),
        },
        {
          label: pickLocaleText(locale, { ar: "التسعير", en: "Pricing Model", fr: "Modèle Tarifaire", tr: "Fiyatlandırma Modeli" }),
          value: pickLocaleText(locale, { ar: "ديناميكي بالكامل", en: "Fully Dynamic", fr: "Totalement Dynamique", tr: "Tamamen Dinamik" }),
        },
        {
          label: pickLocaleText(locale, { ar: "توزيع الغرف", en: "Room Configs", fr: "Configs Chambres", tr: "Oda Dağılımı" }),
          value: pickLocaleText(locale, { ar: "فردي / عائلي", en: "Single / Family", fr: "Simple / Famille", tr: "Tek / Aile" }),
        },
      ],
      features: [
        pickLocaleText(locale, {
          ar: "مقارنة جانبية للباقات السياحية لمساعدة العميل على اتخاذ القرار",
          en: "Side-by-side package comparison drawer to boost conversions",
          fr: "Comparateur côte à côte des séjours pour faciliter la décision client",
          tr: "Müşterinin karar vermesini kolaylaştıran yan yana paket karşılaştırması",
        }),
        pickLocaleText(locale, {
          ar: "تخصيص الفنادق واختيار نوع الوجبات ومواعيد الرحلات",
          en: "Customizable hotel tiers, meal plans & itinerary days",
          fr: "Niveaux d'hôtels personnalisables, régimes de repas et dates flexibles",
          tr: "Özelleştirilebilir otel seviyeleri, yemek planları ve esnek tur günleri",
        }),
        pickLocaleText(locale, {
          ar: "طباعة برنامج الرحلة الكامل PDF للمسافر",
          en: "Instant branded itinerary travel brochure export",
          fr: "Exportation instantanée de brochure de voyage complète en PDF",
          tr: "Gezgin için logonuzla eksiksiz seyahat programı PDF çıktısı",
        }),
      ],
    },
    {
      id: "transfers",
      title: pickLocaleText(locale, {
        ar: "محرك الاستقبال والتوديع VIP",
        en: "VIP Airport Transfers & Chauffeur",
        fr: "Transferts VIP Aéroport & Chauffeur",
        tr: "VIP Havalimanı Transfer & Şoför",
      }),
      badge: pickLocaleText(locale, {
        ar: "نقل VIP واستقبال",
        en: "Airport & City VIP",
        fr: "VIP Aéroport & Ville",
        tr: "VIP Havalimanı & Şehir",
      }),
      icon: Bus,
      span: "lg:col-span-1",
      gradient: "from-amber-500 to-orange-600",
      bgLight: "bg-amber-50/60 border-amber-100",
      accent: "text-amber-600",
      tag: pickLocaleText(locale, {
        ar: "تتبع رقم الرحلة",
        en: "Flight Tracking Live",
        fr: "Suivi des Vols en Direct",
        tr: "Canlı Uçuş Takibi",
      }),
      description: pickLocaleText(locale, {
        ar: "منظومة ذكية لحجوزات الاستقبال من المطار مع ربط مباشر برقم الرحلة لضبط مواعيد السائقين تلقائياً مع خيارات الفان العائلي وسيارات الـ VIP.",
        en: "Smart airport pickup and chauffeur service dynamically syncing with real flight arrival times. VIP vans, luxury sedans, and executive minibuses.",
        fr: "Service intelligent de navettes aéroport synchronisé en direct avec les vols. Vans VIP, berlines de luxe et minibus exécutifs.",
        tr: "Gerçek uçuş varış saatleriyle dinamik senkronize olan akıllı havalimanı karşılama ve şoför hizmeti. VIP vanlar, lüks sedanlar ve minibüsler.",
      }),
      metrics: [
        {
          label: pickLocaleText(locale, { ar: "تتبع الوصول", en: "Flight Sync", fr: "Suivi des Vols", tr: "Uçuş Takibi" }),
          value: pickLocaleText(locale, { ar: "مباشر 24/7", en: "Live 24/7", fr: "En direct 24/7", tr: "Canlı 24/7" }),
        },
        {
          label: pickLocaleText(locale, { ar: "تأكيد السائق", en: "Driver Dispatch", fr: "Avis Chauffeur", tr: "Şoför Bildirimi" }),
          value: pickLocaleText(locale, { ar: "رسائل آلية", en: "Automated Dispatch", fr: "Envoi Automatisé", tr: "Otomatik Gönderim" }),
        },
      ],
      features: [
        pickLocaleText(locale, {
          ar: "تأكيد فوري مع إرسال رقم السائق ولوحة السيارة",
          en: "Automated SMS/WhatsApp driver contact and car plate",
          fr: "Confirmation instantanée avec coordonnées chauffeur et plaque",
          tr: "Şoför iletişim bilgileri ve plaka içeren anında SMS/WhatsApp bildirimi",
        }),
        pickLocaleText(locale, {
          ar: "إضافات مخصصة (مقاعد أطفال، باقة واي فاي، استراحة VIP)",
          en: "Add-ons: baby seats, onboard Wi-Fi, lounge access",
          fr: "Options: sièges bébé, Wi-Fi à bord, accès aux salons VIP",
          tr: "Özel ekstralar: çocuk koltuğu, araç içi Wi-Fi, VIP salon erişimi",
        }),
      ],
    },
    {
      id: "cars",
      title: pickLocaleText(locale, {
        ar: "محرك تأجير السيارات والأسطول",
        en: "Luxury Car Rentals & Fleet Management",
        fr: "Location de Voitures & Gestion de Flotte",
        tr: "Araç Kiralama & Filo Yönetimi",
      }),
      badge: pickLocaleText(locale, {
        ar: "أسطول وسيارات قيادة",
        en: "Self-Drive & Fleet",
        fr: "Flotte & Autotour",
        tr: "Filo & Bireysel Kiralama",
      }),
      icon: Car,
      span: "lg:col-span-1",
      gradient: "from-rose-500 to-red-600",
      bgLight: "bg-rose-50/60 border-rose-100",
      accent: "text-rose-600",
      tag: pickLocaleText(locale, {
        ar: "تأمين وتسليم فوري",
        en: "Full Insurance Options",
        fr: "Assurance Complète",
        tr: "Tam Sigorta Seçenekleri",
      }),
      description: pickLocaleText(locale, {
        ar: "تأجير سيارات فارهة واقتصادية مع خيارات التأمين الشامل، الكيلومترات المفتوحة، ومحطات الاستلام والتسليم المتعددة.",
        en: "Rent prestige and economy vehicles with comprehensive damage waivers, unlimited mileage packages, and multi-branch returns.",
        fr: "Louez des véhicules économiques et de luxe avec assurance tous risques, kilométrage illimité et restitution multi-agences.",
        tr: "Kapsamlı kasko, sınırsız kilometre seçenekleri ve farklı noktalardan teslim imkanı ile prestijli ve ekonomik araç kiralama.",
      }),
      metrics: [
        {
          label: pickLocaleText(locale, { ar: "أسطول السيارات", en: "Fleet Ready", fr: "Flotte Prête", tr: "Filo Hazır" }),
          value: pickLocaleText(locale, { ar: "فوري", en: "Instant", fr: "Instantané", tr: "Anında" }),
        },
        {
          label: pickLocaleText(locale, { ar: "عقد الإيجار", en: "Digital Contract", fr: "Contrat Numérique", tr: "Dijital Sözleşme" }),
          value: pickLocaleText(locale, { ar: "آلي بالكامل", en: "Fully Automated", fr: "100% Automatisé", tr: "Tamamen Otomatik" }),
        },
      ],
      features: [
        pickLocaleText(locale, {
          ar: "ربط شبكات السيارات العالمية (Rentalcars, Cartrawler)",
          en: "Direct rental networks (Rentalcars, Cartrawler)",
          fr: "Réseaux mondiaux de location (Rentalcars, Cartrawler)",
          tr: "Küresel araç kiralama ağları entegrasyonu (Rentalcars, Cartrawler)",
        }),
        pickLocaleText(locale, {
          ar: "تسليم واستلام في المطار أو الفندق مباشرة",
          en: "Direct airport or hotel delivery & pickup",
          fr: "Livraison et restitution directement à l'aéroport ou à l'hôtel",
          tr: "Havalimanında veya doğrudan otelde araç teslim ve iade",
        }),
      ],
    },
    {
      id: "yachts-visa",
      title: pickLocaleText(locale, {
        ar: "محرك اليخوت الخاصة، التأشيرات والتجارب",
        en: "Private Yachts, Visas & Bespoke Tours",
        fr: "Yachts Privés, Visas & Visites Exclusives",
        tr: "Özel Yatlar, Vizeler & Butik Turlar",
      }),
      badge: pickLocaleText(locale, {
        ar: "خدمات حصرية",
        en: "Exclusive Concierge",
        fr: "Conciergerie Exclusive",
        tr: "Seçkin Hizmetler",
      }),
      icon: Ship,
      span: "lg:col-span-2",
      gradient: "from-[#3b0764] via-[#581c87] to-[#b18a52]",
      bgLight: "bg-amber-50/60 border-amber-100",
      accent: "text-[#b18a52]",
      tag: pickLocaleText(locale, {
        ar: "تجارب VIP استثنائية",
        en: "High-Margin Concierge",
        fr: "Expériences VIP Haut de Gamme",
        tr: "Yüksek Kârlı Özel Turlar",
      }),
      description: pickLocaleText(locale, {
        ar: "ارفع أرباح وكالتك ببيع رحلات اليخوت الخاصة، تأشيرات الدخول الإلكترونية، والجولات الترفيهية الحصرية مع نظام رفع الوثائق وتتبع حالة الطلبات.",
        en: "Maximize your margins with private yacht charters, e-visa document handling, and high-ticket VIP concierge activities with live tracking.",
        fr: "Maximisez vos marges avec la location de yachts privés, la gestion des e-visas et les activités VIP exclusives avec suivi en temps réel.",
        tr: "Özel yat kiralama, e-vize evrak yönetimi ve yüksek kârlı VIP seyahat aktiviteleriyle acentenizin kârlılığını maksimize edin.",
      }),
      metrics: [
        {
          label: pickLocaleText(locale, { ar: "رحلات بحرية", en: "Yacht Charters", fr: "Location Yachts", tr: "Yat Turları" }),
          value: pickLocaleText(locale, { ar: "بالساعة / اليوم", en: "Hourly / Daily", fr: "À l'Heure / Jour", tr: "Saatlik / Günlük" }),
        },
        {
          label: pickLocaleText(locale, { ar: "تأشيرات", en: "Visa Processing", fr: "Traitement Visas", tr: "Vize İşlemleri" }),
          value: pickLocaleText(locale, { ar: "رفع آمن للوثائق", en: "Secure Uploads", fr: "Téléversement Sécurisé", tr: "Güvenli Belge Yükleme" }),
        },
        {
          label: pickLocaleText(locale, { ar: "هامش ربح مرتفع", en: "Profit Margins", fr: "Marges Élevées", tr: "Yüksek Kâr Marjı" }),
          value: pickLocaleText(locale, { ar: "حتى 35%", en: "Up to 35%", fr: "Jusqu'à 35%", tr: "%35'e Kadar" }),
        },
      ],
      features: [
        pickLocaleText(locale, {
          ar: "نظام رفع جوازات السفر والمستندات المشفر لتأشيرات السفر",
          en: "Encrypted document & passport upload portal for e-visas",
          fr: "Portail sécurisé et chiffré pour le téléversement de passeports et documents de visa",
          tr: "E-vizeler için şifreli pasaport ve seyahat belgesi yükleme portalı",
        }),
        pickLocaleText(locale, {
          ar: "حجوزات يخوت خاصة مع تحديد طاقم العمل والوجبات",
          en: "Private yacht charters with skipper, catering, and water sports",
          fr: "Affrètement de yachts privés avec skipper, restauration et sports nautiques",
          tr: "Kaptan, özel ikramlar ve su sporları seçenekli özel yat kiralama",
        }),
        pickLocaleText(locale, {
          ar: "تنبيهات تلقائية للعميل عند صدور التأشيرة أو قسيمة الجولة",
          en: "Automated customer SMS/Email alerts upon visa approval",
          fr: "Notifications automatiques par SMS/Email dès l'approbation du visa ou bon de tour",
          tr: "Vize onaylandığında veya tur kuponu hazır olduğunda müşteriye otomatik SMS/E-posta bildirimi",
        }),
      ],
    },
  ];

  return (
    <section id="engines" className="relative py-24 bg-white border-t border-slate-200" dir={dir}>
      {/* Background Decorative Glow */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-slate-50 to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5 text-xs font-bold text-purple-950 shadow-xs">
            <Globe className="h-4 w-4 text-purple-700" />
            <span>
              {pickLocaleText(locale, {
                ar: "6 محركات حجز عالمية موحدة في منصة واحدة",
                en: "6 Unified Global Booking Engines in One System",
                fr: "6 Moteurs de Réservation Mondiaux Unifiés en un Système",
                tr: "Tek Sistemde 6 Entegre Küresel Rezervasyon Motoru",
              })}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight text-balance">
            {locale === "ar" ? (
              <>
                منظومة سياحية متكاملة{" "}
                <span className="bg-gradient-to-r from-[#2e1065] via-[#6b21a8] to-[#b18a52] bg-clip-text text-transparent">
                  تغطي كافة مسارات السفر
                </span>
              </>
            ) : locale === "fr" ? (
              <>
                Écosystème de Voyage Intégré{" "}
                <span className="bg-gradient-to-r from-[#2e1065] via-[#6b21a8] to-[#b18a52] bg-clip-text text-transparent">
                  Couvrant Tous les Itinéraires
                </span>
              </>
            ) : locale === "tr" ? (
              <>
                Entegre Seyahat Ekosistemi{" "}
                <span className="bg-gradient-to-r from-[#2e1065] via-[#6b21a8] to-[#b18a52] bg-clip-text text-transparent">
                  Tüm Güzergahları Kapsar
                </span>
              </>
            ) : (
              <>
                End-to-End Travel Ecosystem{" "}
                <span className="bg-gradient-to-r from-[#2e1065] via-[#6b21a8] to-[#b18a52] bg-clip-text text-transparent">
                  Powering Every Route
                </span>
              </>
            )}
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed text-balance max-w-2xl mx-auto">
            {pickLocaleText(locale, {
              ar: "منصة لوناليزا تمنح وكالتك ربطاً شاملاً بـ +500 شركة طيران و+3,000,000 فندق مع خيارات التوريد المباشر بدون ديبوزيت أو بنوك الغرف العالمية.",
              en: "Lonaliza equips your agency with +500 airlines and +3,000,000 hotels worldwide with zero-deposit Rapid API and direct bed banks.",
              fr: "Lonaliza équipe votre agence de +500 compagnies aériennes et +3 000 000 d'hôtels avec API Rapid sans dépôt et banques de lits.",
              tr: "Lonaliza, acentenizi depozitosuz Rapid API ve doğrudan yatak bankalarıyla +500 havayolu ve +3.000.000 otele bağlar.",
            })}
          </p>
        </div>

        {/* 21st.dev Bento Grid 2.0 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {engines.map((eng) => {
            const Icon = eng.icon;
            return (
              <div
                key={eng.id}
                className={`group relative rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-950/5 transition-all duration-300 flex flex-col justify-between ${eng.span}`}
              >
                <div>
                  {/* Top Bar: Icon + Badge + Tag */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-12 rounded-2xl bg-gradient-to-br ${eng.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {eng.badge}
                      </span>
                    </div>

                    <span className="text-[11px] font-semibold text-purple-900 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100 hidden sm:inline-block">
                      {eng.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 group-hover:text-purple-900 transition-colors">
                    {eng.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {eng.description}
                  </p>

                  {/* Micro Metrics Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
                    {eng.metrics.map((m, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-center"
                      >
                        <div className="text-[10px] font-bold text-slate-500">{m.label}</div>
                        <div className="text-xs sm:text-sm font-black text-slate-900 mt-0.5">
                          {m.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Feature Checkpoints */}
                  <div className="space-y-2.5 pt-4 border-t border-slate-100">
                    {eng.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-purple-700" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Interactive Hover Indicator */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-900 group-hover:text-[#2e1065]">
                  <span>
                    {pickLocaleText(locale, {
                      ar: "لوحة إدارة المحرك النشطة",
                      en: "Active Engine Controller",
                      fr: "Contrôleur de Moteur Actif",
                      tr: "Aktif Motor Kontrol Paneli",
                    })}
                  </span>
                  <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform rtl:group-hover:-translate-x-1 rtl:rotate-180" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Sourcing & Distributors Architecture (GDS, Bed Banks, Rapid API & AI Hotel Importer) */}
        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6 sm:p-10 space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3.5 py-1 text-xs font-bold text-purple-950">
              <Database className="h-4 w-4 text-purple-700" />
              <span>
                {pickLocaleText(locale, {
                  ar: "شبكة الموزعين والتوريد المرن",
                  en: "Global Distributors & Flexible Sourcing",
                  fr: "Réseau de Distributeurs & Approvisionnement Flexible",
                  tr: "Küresel Dağıtıcı Ağı ve Esnek Tedarik",
                })}
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              {pickLocaleText(locale, {
                ar: "اربط كبرى شبكات التوزيع العالمية أو اعمل بدون ديبوزيت",
                en: "Connect Major Global Distribution Networks or Run Zero-Deposit",
                fr: "Connectez les Grands Réseaux Mondiaux ou Travaillez Sans Dépôt",
                tr: "Büyük Küresel Dağıtım Ağlarını Bağlayın veya Depozitosuz Çalışın",
              })}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {pickLocaleText(locale, {
                ar: "سواء كنت تملك اتفاقيات مسبقة مع GDS، أو ترغب في بدء وكالتك فوراً بدون ديبوزيت عبر محرك الـ Rapid API ($10/شهر)، أو جني عمولات تلقائية عبر Travelpayouts، المنظومة مهيأة لكل السيناريوهات.",
                en: "Whether you hold direct GDS airline contracts, want zero-deposit Rapid API live scraping ($10/mo), or affiliate commission payouts via Travelpayouts, Lonaliza is fully architected for all models.",
                fr: "Que vous disposiez de contrats GDS directs, souhaitiez démarrer sans dépôt via Rapid API (10 $/mois), ou percevoir des commissions avec Travelpayouts, Lonaliza s'adapte à tous les modèles.",
                tr: "İster doğrudan GDS sözleşmeleriniz olsun, ister depozitosuz Rapid API ($10/ay) ile hemen başlayın veya Travelpayouts ile komisyon kazanın; platform tüm modelleri destekler.",
              })}
            </p>
          </div>

          {/* 3 Sourcing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: GDS & Bed Banks */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  {pickLocaleText(locale, {
                    ar: "+500 طيران و+3M فندق",
                    en: "+500 Airlines & +3M Hotels",
                    fr: "+500 Compagnies & +3M Hôtels",
                    tr: "+500 Havayolu & +3M Otel",
                  })}
                </span>
                <Plane className="h-4 w-4 text-blue-600" />
              </div>
              <h4 className="text-base font-black text-slate-900">
                {pickLocaleText(locale, {
                  ar: "الموزعون العالميون (GDS & Bed Banks)",
                  en: "Global Distributors (GDS & Bed Banks)",
                  fr: "Distributeurs Mondiaux (GDS & Banques de Lits)",
                  tr: "Küresel Dağıtıcılar (GDS & Yatak Bankaları)",
                })}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {pickLocaleText(locale, {
                  ar: "تكامل مباشر مع Amadeus وSabre وTravelport للطيران، وبنوك الغرف العالمية: Hotelbeds, WebBeds, Expedia Partner Solutions, Agoda, RateHawk.",
                  en: "Direct API with Amadeus, Sabre, and Travelport for flights, plus premier bed banks: Hotelbeds, WebBeds, Expedia, Agoda, and RateHawk.",
                  fr: "Intégration directe avec Amadeus, Sabre et Travelport pour les vols, ainsi que les leaders mondiaux : Hotelbeds, WebBeds, Expedia, Agoda et RateHawk.",
                  tr: "Uçuşlar için Amadeus, Sabre ve Travelport ile doğrudan entegrasyon; önde gelen otel bankaları: Hotelbeds, WebBeds, Expedia, Agoda ve RateHawk.",
                })}
              </p>
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                {["Amadeus", "Sabre", "Hotelbeds", "WebBeds", "Expedia", "RateHawk"].map((brand) => (
                  <span key={brand} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {brand}
                  </span>
                ))}
              </div>
            </div>

            {/* Card 2: Zero-Deposit Rapid API */}
            <div className="rounded-2xl border-2 border-purple-500/30 bg-purple-50/40 p-6 space-y-4 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-purple-100 text-purple-950 border border-purple-300">
                  {pickLocaleText(locale, {
                    ar: "الأكثر توفيراً (بدون ديبوزيت)",
                    en: "Zero-Deposit Engine",
                    fr: "Sans Dépôt (Économique)",
                    tr: "En Ekonomik (Depozitosuz)",
                  })}
                </span>
                <Zap className="h-4 w-4 text-purple-700" />
              </div>
              <h4 className="text-base font-black text-slate-900">
                {pickLocaleText(locale, {
                  ar: "محرك Rapid API والزاحف المباشر",
                  en: "Rapid API & Live Scraper ($10/mo)",
                  fr: "Moteur Rapid API & Scraping en Direct",
                  tr: "Rapid API ve Canlı Tarayıcı ($10/ay)",
                })}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {pickLocaleText(locale, {
                  ar: "ابدأ دون تجميد آلاف الدولارات كتأمين مع الموزعين. ادفع فقط $10 شهرياً لطلبات بحث ضخمة، واستعلم حياً وبع لعميلك، ثم احجز التذكرة أو الفندق من أرخص مورد net rate.",
                  en: "Start immediately without locking thousands in deposits. Pay ~$10/mo for high volume queries; search live, sell to customer at your markup, and fulfill via cheapest supplier.",
                  fr: "Démarrez sans bloquer des milliers d'euros de caution. Payez environ 10 $/mois pour de gros volumes de recherche ; recherchez en direct, vendez et réservez au prix net le plus bas.",
                  tr: "Tedarikçilere binlerce dolar depozito bağlamadan başlayın. Sadece ~$10/ay ödeyin; canlı arama yapın, kârınızı ekleyip satın ve en uygun tedarikçiden biletinizi kesin.",
                })}
              </p>
              <div className="pt-2 border-t border-purple-200/60 flex items-center justify-between text-xs font-bold text-purple-950">
                <span>
                  {pickLocaleText(locale, {
                    ar: "تكلفة التوريد:",
                    en: "Sourcing Cost:",
                    fr: "Coût d'approvisionnement :",
                    tr: "Tedarik Maliyeti:",
                  })}
                </span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-purple-200">$10/month</span>
              </div>
            </div>

            {/* Card 3: AI Hotel Importer & 15-Min Crawler */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {pickLocaleText(locale, {
                    ar: "استيراد بالرابط + زاحف",
                    en: "AI URL & Daemon",
                    fr: "Import par Lien IA + Démon",
                    tr: "AI URL Aktarımı + Tarayıcı",
                  })}
                </span>
                <Sparkles className="h-4 w-4 text-amber-600" />
              </div>
              <h4 className="text-base font-black text-slate-900">
                {pickLocaleText(locale, {
                  ar: "استيراد الفنادق بالـ AI + زاحف المزامنة",
                  en: "AI Hotel Importer & 15-Min Daemon",
                  fr: "Import d'Hôtels IA & Démon 15 Min",
                  tr: "AI Otel İçe Aktarıcı & 15 Dk Tarayıcı",
                })}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {pickLocaleText(locale, {
                  ar: "أضف أي فندق تعاقدت معه بمجرد لصق رابطه؛ الذكاء الاصطناعي يستخرج الغرف والصور والمرافق فوراً، مع تشغيل زاحف آلي كل 10-15 دقيقة لتحديث الأسعار والغرف وإضافة هامش ربحك.",
                  en: "Onboard any direct hotel by pasting its link; AI crawls photos, room types, and amenities, with an autonomous 15-min crawler updating live inventory and rates.",
                  fr: "Intégrez n'importe quel hôtel partenaire en collant son lien ; l'IA extrait les chambres, photos et équipements, avec mise à jour automatique des tarifs toutes les 15 minutes.",
                  tr: "Sözleşmeli otellerinizin linkini yapıştırarak kolayca ekleyin; yapay zeka odaları, fotoğrafları ve olanakları anında çeker, 15 dakikalık tarayıcı fiyatları günceller.",
                })}
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>
                  {pickLocaleText(locale, {
                    ar: "المزامنة الدورية:",
                    en: "Sync Interval:",
                    fr: "Intervalle de synchro :",
                    tr: "Senkronizasyon Sıklığı:",
                  })}
                </span>
                <span className="font-mono text-purple-800">
                  {pickLocaleText(locale, {
                    ar: "كل 10-15 دقيقة",
                    en: "Every 10-15m",
                    fr: "Toutes les 10-15 min",
                    tr: "Her 10-15 dk",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Dynamic Markup & Profit Simulator */}
        <div className="rounded-3xl border border-purple-200/90 bg-gradient-to-br from-purple-50/70 via-white to-amber-50/40 p-6 sm:p-10 shadow-xl shadow-purple-950/5">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3.5 py-1 text-xs font-bold text-purple-950">
                <BadgePercent className="h-4 w-4 text-purple-700" />
                <span>
                  {pickLocaleText(locale, {
                    ar: "حاسبة أرباح وهوامش الوكالة التفاعلية",
                    en: "Interactive Agency Margin & Profit Calculator",
                    fr: "Calculateur Interactif de Marges & Profits",
                    tr: "Etkileşimli Acente Kâr ve Marj Hesaplayıcı",
                  })}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                {pickLocaleText(locale, {
                  ar: "تحكّم في هامش ربحك بنسبة مئوية أو مبلغ ثابت لكل محرك",
                  en: "Control Your Profit Margin per Engine Dynamically",
                  fr: "Contrôlez Dynamiquement Vos Marges par Moteur",
                  tr: "Her Motor İçin Kâr Marjınızı Dinamik Olarak Yönetin",
                })}
              </h3>
              <p className="text-sm text-slate-600">
                {pickLocaleText(locale, {
                  ar: "حرّك المؤشرات لاختبار حجم المبيعات المتوقع وهامش العمولة لترى صافي أرباح وكالتك المباشرة.",
                  en: "Drag the sliders to simulate your monthly sales volume and commission markup to calculate net earnings.",
                  fr: "Déplacez les curseurs pour simuler votre volume de ventes mensuel et votre marge bénéficiaire nette.",
                  tr: "Aylık satış hacminizi ve kâr marjınızı simüle ederek net kazancınızı görmek için kaydırıcıları ayarlayın.",
                })}
              </p>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {/* Slider 1: Monthly Booking Volume */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">
                    {pickLocaleText(locale, {
                      ar: "حجم الحجوزات الشهري المستهدف",
                      en: "Target Monthly Bookings",
                      fr: "Volume Mensuel de Réservations Visé",
                      tr: "Hedeflenen Aylık Rezervasyon Hacmi",
                    })}
                  </span>
                  <span className="text-lg font-black text-purple-950 font-mono">
                    ${monthlyVolume.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="250000"
                  step="5000"
                  value={monthlyVolume}
                  onChange={(e) => setMonthlyVolume(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2e1065]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                  <span>$10,000</span>
                  <span>$100,000</span>
                  <span>$250,000+</span>
                </div>
              </div>

              {/* Slider 2: Average Markup Percent */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">
                    {pickLocaleText(locale, {
                      ar: "متوسط هامش الربح المضاف (Markup)",
                      en: "Average Dynamic Markup",
                      fr: "Marge Bénéficiaire Moyenne (Markup)",
                      tr: "Ortalama Dinamik Kâr Marjı (Markup)",
                    })}
                  </span>
                  <span className="text-lg font-black text-amber-700 font-mono">
                    {markupPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="25"
                  step="1"
                  value={markupPercent}
                  onChange={(e) => setMarkupPercent(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                  <span>
                    {pickLocaleText(locale, {
                      ar: "5% (تنافسي)",
                      en: "5% (Competitive)",
                      fr: "5% (Compétitif)",
                      tr: "5% (Rekabetçi)",
                    })}
                  </span>
                  <span>
                    {pickLocaleText(locale, {
                      ar: "12% (متوسط)",
                      en: "12% (Balanced)",
                      fr: "12% (Équilibré)",
                      tr: "12% (Dengeli)",
                    })}
                  </span>
                  <span>
                    {pickLocaleText(locale, {
                      ar: "25% (VIP وفاخر)",
                      en: "25% (Luxury & VIP)",
                      fr: "25% (Luxe & VIP)",
                      tr: "25% (Lüks & VIP)",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Profit Output Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              <div className="rounded-2xl border border-purple-800/40 bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] text-white p-5 text-center shadow-lg shadow-purple-950/20">
                <div className="text-xs font-medium text-amber-200">
                  {pickLocaleText(locale, {
                    ar: "صافي أرباح وكالتك الشهرية",
                    en: "Net Monthly Agency Profit",
                    fr: "Bénéfice Net Mensuel de l'Agence",
                    tr: "Aylık Net Acente Kârı",
                  })}
                </div>
                <div className="text-3xl font-black font-mono mt-1 text-white">
                  ${monthlyProfit.toLocaleString()}
                </div>
                <div className="text-[11px] text-purple-200 mt-1">
                  {pickLocaleText(locale, {
                    ar: "تودع مباشرة في حسابك البنكي",
                    en: "Direct deposit to your merchant account",
                    fr: "Dépôt direct sur votre compte bancaire",
                    tr: "Doğrudan banka hesabınıza aktarılır",
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-600/40 bg-gradient-to-r from-[#b18a52] to-[#d97706] text-white p-5 text-center shadow-lg shadow-amber-900/20">
                <div className="text-xs font-medium text-amber-100">
                  {pickLocaleText(locale, {
                    ar: "العائد السنوي المتوقع (Annualized)",
                    en: "Annualized Agency Profit",
                    fr: "Rendement Annuel Projeté",
                    tr: "Yıllık Tahmini Acente Kârı",
                  })}
                </div>
                <div className="text-3xl font-black font-mono mt-1 text-white">
                  ${annualProfit.toLocaleString()}
                </div>
                <div className="text-[11px] text-amber-100/90 mt-1">
                  {pickLocaleText(locale, {
                    ar: "دون أي عمولات مستقطعة لجهة وسيطة",
                    en: "Zero commissions lost to middle-men",
                    fr: "Zéro commission déduite pour des intermédiaires",
                    tr: "Aracılara komisyon kesintisi yok",
                  })}
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-center text-center">
                <div className="text-xs font-bold text-slate-500">
                  {pickLocaleText(locale, {
                    ar: "حرية تامة في التسعير",
                    en: "100% Dynamic Pricing Freedom",
                    fr: "Liberté Totale de Tarification",
                    tr: "Tam Fiyatlandırma Özgürlüğü",
                  })}
                </div>
                <div className="text-sm font-bold text-slate-800 mt-1">
                  {pickLocaleText(locale, {
                    ar: "يمكنك وضع هامش مختلف لكل فندق أو خط طيران أو موسم",
                    en: "Set custom markups per flight carrier, hotel star, or season",
                    fr: "Définissez une marge par compagnie, catégorie d'hôtel ou saison",
                    tr: "Havayolu, otel kategorisi veya sezona göre özel kâr marjı belirleyin",
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
