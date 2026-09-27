"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Globe,
  Plane,
  Hotel,
  Car,
  ShieldCheck,
  Zap,
  Sparkles,
  Smartphone,
  Server,
  Layers,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  Coins,
  FileCheck,
  ExternalLink,
  Users,
  Compass,
  Headphones,
  Award,
  Crown,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useBrandName } from "@/components/branding/BrandingProvider";

type TabKey = "overview" | "whitelabel" | "suppliers" | "mobile_ai";

export default function LonalizaAccountAbout() {
  const { locale } = useLocale();
  const brand = useBrandName(locale);
  const isAr = locale === "ar";
  const isTr = locale === "tr";
  const isFr = locale === "fr";

  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // Content dictionary across 4 languages
  const copy = {
    badge: isAr
      ? "منصة السفر السحابية الذكية وحلول الشركات B2B"
      : isTr
        ? "Akıllı Bulut Seyahat Platformu ve B2B Kurumsal Çözümler"
        : isFr
          ? "Plateforme Cloud Intelligente de Voyage & Solutions Entreprise B2B"
          : "Smart Cloud Travel Platform & Enterprise B2B Solutions",
    title: isAr
      ? `عن ${brand} للتقنية والسياحة العالمية`
      : isTr
        ? `${brand} Küresel Turizm ve Seyahat Teknolojisi Hakkında`
        : isFr
          ? `À propos de ${brand} Technologies & Tourisme Mondial`
          : `About ${brand} Global Travel Technology`,
    heroSubtitle: isAr
      ? "المنظومة السحابية المتكاملة لتمكين شركات ووكالات السياحة حول العالم من إطلاق منصاتهم وحجوزاتهم الرقمية بهويتهم المستقلة خلال 24 ساعة، مع اتصال مباشر بأكبر شبكات التوزيع العالمية وبنوك الأسرة وتطبيقات الهاتف الذكية."
      : isTr
        ? "Dünya genelindeki turizm acentelerinin ve girişimcilerin 24 saat içinde kendi markalarıyla dijital seyahat platformlarını başlatmalarını sağlayan, küresel GDS ağları ve mobil uygulamalarla doğrudan entegre akıllı bulut ekosistemi."
        : isFr
          ? "L'écosystème cloud intégré permettant aux agences de voyage et entrepreneurs du monde entier de lancer leur plateforme digitale sous leur propre marque en 24h, connectée aux réseaux GDS mondiaux et aux applications mobiles."
          : "The comprehensive cloud ecosystem empowering travel agencies and entrepreneurs worldwide to launch their branded online travel platforms in 24 hours, directly integrated with global GDS networks, bedbanks, and mobile apps.",

    tabs: {
      overview: isAr ? "نظرة عامة والقصة" : isTr ? "Genel Bakış ve Hikaye" : isFr ? "Vue d'ensemble & Histoire" : "Overview & Story",
      whitelabel: isAr ? "باقات وحلول الوايت ليبل" : isTr ? "White Label Çözümleri" : isFr ? "Formules White Label" : "White Label Plans",
      suppliers: isAr ? "شبكة التوريد و GDS الحقيقية" : isTr ? "Gerçek Tedarik ve GDS Ağı" : isFr ? "Réseau Fournisseurs & GDS" : "Real Sourcing & GDS Network",
      mobile_ai: isAr ? "تطبيقات الهاتف والذكاء الاصطناعي" : isTr ? "Mobil Uygulamalar ve Yapay Zeka" : isFr ? "Apps Mobiles & IA" : "Mobile Apps & AI Swarm",
    },

    stats: [
      {
        value: "24h",
        label: isAr ? "سرعة تدشين المنصة" : isTr ? "Platform Kurulum Hızı" : isFr ? "Déploiement en" : "Turnkey Launch Speed",
        sub: isAr ? "جاهزة للعمل بهويتك" : isTr ? "Kendi markanızla hazır" : isFr ? "Clé en main à votre marque" : "Ready under your brand",
      },
      {
        value: "+3M",
        label: isAr ? "فندق ومنتجع عالمي" : isTr ? "Küresel Otel ve Tesis" : isFr ? "Hôtels & complexes mondiaux" : "Global Hotels & Resorts",
        sub: isAr ? "عبر Hotelbeds و RateHawk" : isTr ? "Hotelbeds ve RateHawk ile" : isFr ? "Via Hotelbeds & RateHawk" : "Via Hotelbeds & RateHawk",
      },
      {
        value: "+500",
        label: isAr ? "شركة طيران عالمية" : isTr ? "Uluslararası Havayolu" : isFr ? "Compagnies aériennes" : "Airlines via Travelport & GDS",
        sub: isAr ? "Travelport و PKFARE و Seeru" : isTr ? "Travelport, PKFARE ve Seeru" : isFr ? "Travelport, PKFARE & Seeru" : "Travelport, PKFARE & Seeru",
      },
      {
        value: "100%",
        label: isAr ? "عزل وأمان البيانات" : isTr ? "Veri İzolasyonu ve Güvenlik" : isFr ? "Isolation totale des données" : "Dedicated Server Isolation",
        sub: isAr ? "سيرفر سحابي مستقل aaPanel" : isTr ? "aaPanel bağımsız sunucu" : isFr ? "Serveur dédié avec aaPanel" : "Dedicated cloud server with aaPanel",
      },
    ],

    // Tab 1: Overview
    overview: {
      heading: isAr
        ? "كيف أعادت لوناليزا ابتكار صناعة السياحة للشركات والرياديين؟"
        : isTr
          ? "Lonaliza seyahat endüstrisini acenteler ve girişimciler için nasıl yeniden tanımladı?"
          : isFr
            ? "Comment Lonaliza réinvente l'industrie du voyage pour les agences et entrepreneurs ?"
            : "How Lonaliza Revolutionized Travel Tech for Agencies and Entrepreneurs",
      body1: isAr
        ? "تأسست لوناليزا لتكسر احتكار التقنيات السياحية المعقدة ورسوم الاشتراكات والعمولات المستنزفة لأرباح مكاتب السفر. لقد صممنا بنية سحابية موحدة تجمع بين محركات الحجز المباشرة (طيران، فنادق، سيارات، ترانسفير VIP، برامج سياحية)، وبوابات الدفع البنكية المعتمدة، وسرب الذكاء الاصطناعي للمبيعات المؤتمتة."
        : isTr
          ? "Lonaliza, seyahat acentelerinin kârlarını tüketen karmaşık turizm teknolojileri tekellerini ve yüksek komisyonları kırmak için kuruldu. Doğrudan rezervasyon motorlarını (uçuş, otel, araç kiralama, VIP transfer, tur paketleri), güvenli ödeme geçitlerini ve yapay zeka satış sürüsünü bir araya getiren birleşik bir bulut mimarisi geliştirdik."
          : isFr
            ? "Lonaliza a été créée pour briser le monopole des technologies touristiques complexes et les commissions étouffantes qui réduisent les marges des agences. Nous avons conçu une architecture cloud unifiée combinant moteurs de réservation directs (vols, hôtels, transferts VIP, circuits), passerelles de paiement sécurisées et IA commerciale autonome."
            : "Lonaliza was founded to shatter the barriers of complex legacy travel tech, recurring monthly subscription traps, and commission fees that erode agency profits. We engineered a unified cloud infrastructure combining live booking engines (flights, hotels, cars, VIP transfers, custom tour packages), certified bank payment gateways, and autonomous sales AI.",
      body2: isAr
        ? "بفضل منصة لوناليزا، يستطيع أي مكتب سفر، أو شركة ناشئة، أو ريادي أعمال في أي مكان بالعالم إطلاق موقعه وتطبيقاته الخاصة بهويته وشعاره واسمه المستقل واستقبال حجوزات المسافرين وإصدار التذاكر آلياً في غضون 24 ساعة فقط."
        : isTr
          ? "Lonaliza platformu sayesinde dünyanın her yerindeki herhangi bir seyahat acentesi veya girişimci, sadece 24 saat içinde kendi markası, logosu ve alan adı ile sitesini ve uygulamalarını başlatabilir, çevrimiçi rezervasyon alabilir ve biletleri anında düzenleyebilir."
          : isFr
            ? "Grâce à la plateforme Lonaliza, toute agence de voyage ou entrepreneur dans le monde peut lancer son site web et ses applications à son image en 24h chrono, recevoir des réservations en direct et émettre ses billets automatiquement."
            : "With Lonaliza, any travel agency or entrepreneur anywhere in the world can launch their fully branded website and mobile apps under their own domain name within 24 hours, receiving live customer bookings and issuing electronic tickets and vouchers instantly.",
      highlights: [
        {
          title: isAr ? "استقلالية تامة 100%" : isTr ? "%100 Tam Bağımsızlık" : isFr ? "Indépendance totale 100%" : "100% Brand Independence",
          desc: isAr ? "موقعك وتطبيقك يعملان باسم شركتك وشعارك ودومينك الخاص دون أي ظهور للوناليزا أمام عملائك." : isTr ? "Siteniz ve uygulamanız kendi şirket adınız ve logonuzla çalışır." : isFr ? "Votre marque, logo et domaine propres sans mention visible de tiers." : "Operates strictly under your company brand, logo, and custom domain.",
        },
        {
          title: isAr ? "إصدار لحظي بدون تعقيد" : isTr ? "Anında Otomatik Biletleme" : isFr ? "Émission instantanée" : "Instant Electronic Ticketing",
          desc: isAr ? "إصدار فوري لتذاكر الطيران وقسائم الفنادق Vouchers فور إتمام الدفع مع إرسالها تلقائياً عبر الواتساب." : isTr ? "Ödeme sonrası WhatsApp ve e-posta ile anında bilet teslimi." : isFr ? "Vouchers et billets délivrés automatiquement par WhatsApp et email." : "Immediate PDF vouchers and e-tickets dispatched via WhatsApp and email.",
        },
        {
          title: isAr ? "أمان مالي ومحفظة B2B" : isTr ? "Finansal Güvenlik ve B2B Cüzdan" : isFr ? "Sécurité financière & Portefeuille B2B" : "Financial Vault & B2B Wallet",
          desc: isAr ? "محفظة رقمية مدمجة بالخصم التلقائي اللحظي لمنع أي خسائر وتسهيل الحجوزات السريعة." : isTr ? "Rezervasyonlarda otomatik düşüş yapan entegre B2B dijital cüzdan." : isFr ? "Portefeuille numérique B2B avec déduction en temps réel et zéro risque." : "Embedded B2B wallet with zero-delay auto-deduction against partner balance.",
        },
      ],
    },

    // Tab 2: White Label Plans
    whitelabel: {
      heading: isAr ? "باقات وحلول الوايت ليبل المتنوعة لتناسب كل مرحلة" : isTr ? "Her İhtiyaca Uygun White Label Çözümleri" : isFr ? "Des formules White Label adaptées à chaque étape" : "Flexible White Label Options for Every Growth Stage",
      subtitle: isAr
        ? "سواء كنت تبدأ بدون تكلفة شهرية، أو تحتاج أدوات التسويق والذكاء الاصطناعي المتطورة، أو ترغب في التملك التام على سيرفر خاص مدى الحياة."
        : isTr
          ? "İster sıfır aylık maliyetle başlayın, ister gelişmiş yapay zeka araçlarına ihtiyaç duyun, ister özel sunucuda ömür boyu tam mülkiyet isteyin."
          : isFr
            ? "Que vous débutiez sans frais mensuels, souhaitiez des outils IA avancés, ou préfériez la pleine propriété à vie sur serveur dédié."
            : "Whether you start with zero monthly fees, scale with professional AI marketing, or acquire full lifetime platform ownership on your dedicated server.",
      plans: [
        {
          name: isAr ? "الوايت ليبل المجاني (Free White Label)" : isTr ? "Ücretsiz White Label" : isFr ? "White Label Gratuit" : "Free White Label Plan",
          tag: isAr ? "انطلاقة سريعة بدون مخاطرة" : isTr ? "Sıfır Risksiz Başlangıç" : isFr ? "Démarrage sans risque" : "Zero Risk Fast Start",
          price: isAr ? "0$ شهرياً" : isTr ? "0$ / ay" : isFr ? "0$ / mois" : "$0 / month",
          desc: isAr ? "الحل الأمثل للوكالات الناشئة للبدء في بيع الطيران والفنادق والترانسفير فورياً دون أي تكاليف شهرية ثنائية." : isTr ? "Yeni başlayan acenteler için aylık sabit ücret olmadan anında satışa başlama imkanı." : isFr ? "Idéal pour lancer vos ventes sans abonnement mensuel récurrent." : "Ideal for new agencies to start selling flights, hotels, and transfers with zero monthly overhead.",
          icon: Zap,
          badgeColor: "bg-slate-100 text-slate-800 border-slate-300",
          features: [
            isAr ? "محرك رحلات الطيران المجمع عبر GDS العالمي" : "Global GDS Aggregated Flights Engine",
            isAr ? "كتالوج الفنادق والمنتجعات العالمية (+3,000,000 فندق)" : "Global Hotels & Resorts Catalog (+3M properties)",
            isAr ? "محرك التوصيل والمشاوير والترانسفير" : "Airport Transfers & Chauffeur Engine",
            isAr ? "المحفظة الرقمية B2B والخصم التلقائي الفوري" : "B2B Digital Wallet with Instant Deduction",
            isAr ? "بوابة WhatsApp Baileys المدمجة مجاناً ($0 رسوم ميتا)" : "Built-in WhatsApp Baileys Gateway ($0 Meta fees)",
            isAr ? "استعادة السلات المتروكة تلقائياً عبر واتساب" : "Automated WhatsApp Abandoned Cart Recovery",
            isAr ? "إشعارات تيليجرام فورية للإدارة عند كل حجز" : "Instant Telegram Admin Booking Alerts",
          ],
        },
        {
          name: isAr ? "الوايت ليبل الاحترافي (Pro Monthly)" : isTr ? "Profesyonel Aylık White Label" : isFr ? "White Label Pro Mensuel" : "Pro Monthly White Label",
          tag: isAr ? "للشركات المتوسعة" : isTr ? "Büyüyen Acenteler İçin" : isFr ? "Pour entreprises en essor" : "Most Popular for Scaling",
          price: isAr ? "اشتراك شهري مرن" : isTr ? "Esnek Aylık Abonelik" : isFr ? "Abonnement mensuel flexible" : "Flexible Monthly Subscription",
          desc: isAr ? "يفتح لك كامل المخزون الداخلي المخصص، وسرب الذكاء الاصطناعي للتسويق وصناعة الفيديوهات ومضاعفة المبيعات." : isTr ? "Tüm özel iç envanteri ve satışları katlayan yapay zeka pazarlama sürüsünü açar." : isFr ? "Débloque l'inventaire privé et l'essaim d'IA marketing pour maximiser vos ventes." : "Unlocks private custom inventory, AI video marketing studio, and advanced autonomous campaigns.",
          icon: Crown,
          badgeColor: "bg-amber-400 text-[#2E1065] border-amber-300 font-bold",
          features: [
            isAr ? "كل ميزات الوايت ليبل المجاني بالكامل" : "All Free White Label features included",
            isAr ? "منشئ الباقات والبرامج السياحية المخصصة (Holiday Packages)" : "Tailor-made Holiday Packages Builder",
            isAr ? "إدارة الجولات والرحلات اليومية الإرشادية الخاصة" : "Custom Guided Tours & Sightseeing Engine",
            isAr ? "إدارة أسطول السيارات الخاص وتأجير الليموزين" : "Private Fleet & Limousine Dispatch Management",
            isAr ? "محرك التأشيرات السياحية والفيزا الإلكترونية" : "Tourist Visa & Consular Application Engine",
            isAr ? "سرب متكامل من 6 وكلاء ذكاء اصطناعي متخصصين (AI Swarm)" : "Autonomous 6-Agent AI Swarm Ecosystem",
            isAr ? "استوديو ريلز 4K الترويجي عبر Google Flow MCP" : "Cinematic 4K Travel Video Reels Studio",
            isAr ? "الطيار الآلي لإعلانات Google Ads و Meta Ads لتحقيق أعلى عائد" : "Google & Meta Ads ROAS Autopilot",
          ],
        },
        {
          name: isAr ? "امتلاك المنصة مدى الحياة (Lifetime License)" : isTr ? "Ömür Boyu Tam Mülkiyet" : isFr ? "Licence Complète à Vie" : "Turnkey Lifetime Ownership",
          tag: isAr ? "الأعلى قيمة واستثماراً" : isTr ? "En Yüksek Yatırım Değeri" : isFr ? "Investissement Ultime" : "Ultimate Enterprise Investment",
          price: isAr ? "امتلاك دائم لمرة واحدة" : isTr ? "Tek Seferlik Ömür Boyu" : isFr ? "Paiement unique à vie" : "One-Time Lifetime License",
          desc: isAr ? "امتلاك النسخة التشغيلية الكاملة على سيرفر سحابي مستقل خاص بك مع لوحة aaPanel دون مشاركة أو عمولات شهرية نهائياً." : isTr ? "Kendi aaPanel sunucunuzda, komisyonsuz, tamamen bağımsız ömür boyu platform mülkiyeti." : isFr ? "Propriété intégrale sur votre propre serveur dédié avec aaPanel, zéro commission à vie." : "Complete operational platform hosted on your own dedicated cloud server with aaPanel, zero recurring commissions.",
          icon: Server,
          badgeColor: "bg-purple-900 text-amber-300 border-purple-700 font-bold",
          features: [
            isAr ? "ترخيص امتلاك دائم للمنصة مدى الحياة (Lifetime License)" : "Lifetime License without expiration",
            isAr ? "سيرفر سحابي مستقل خاص بشركتك مع لوحة تحكم aaPanel" : "Dedicated cloud server with aaPanel management",
            isAr ? "عزل أمني تام 100% لقواعد البيانات ومعلومات العملاء" : "100% private database isolation and GDPR safety",
            isAr ? "خزينة مفاتيح الربط البرمجي المشفرة (B2B API Vault)" : "Encrypted B2B API Key Vault & Master Keys",
            isAr ? "تطبيقات الهاتف الذكي للعملاء والسائقين" : "Customer & Driver Mobile Apps included",
            isAr ? "أعلى هوامش ربحية بدون اقتطاع عمولات على الحجوزات" : "Zero booking commission cut — retain 100% markup",
            isAr ? "دعم فني وتحديثات مستمرة وتوافق الـ APIs" : "Continuous API maintenance and technical support",
          ],
        },
      ],
    },

    // Tab 3: Sourcing Network
    suppliers: {
      heading: isAr ? "شبكة التوريد الحقيقية ومزودو GDS وبنوك الأسرة المعتمدة" : isTr ? "Gerçek Tedarik, GDS ve Yatak Bankaları Ağı" : isFr ? "Réseau de Fournisseurs Réels, GDS & Banques de Lits" : "Real Sourcing Network, GDS Gateways & Certified Bedbanks",
      subtitle: isAr
        ? "اتصال مباشر بأقوى منصات التوزيع العالمية المدمجة حياً في كود المنصة لضمان أفضل الأسعار والتأكيد اللحظي."
        : isTr
          ? "En iyi fiyatlar ve anında onay için sistemimize canlı entegre edilmiş lider küresel tedarikçiler."
          : isFr
            ? "Connexion directe aux plus grands distributeurs mondiaux intégrés pour les meilleurs tarifs garantis."
            : "Direct integration with global distribution leaders built natively into the platform engine for optimal rates and real-time confirmation.",
      verticals: [
        {
          title: isAr ? "رحلات الطيران العالمية (Flights GDS & Aggregators)" : "Global Flights GDS & Aggregators",
          icon: Plane,
          desc: isAr ? "ربط فوري بأكثر من 500 خط طيران مع إصدار إلكتروني مباشر." : "Direct connectivity to +500 airlines with instant ticketing.",
          partners: [
            { name: "Travelport GDS", note: isAr ? "اتصال Universal API و JSON REST v11 مباشر" : "Direct Universal API & JSON REST v11" },
            { name: "PKFARE", note: isAr ? "بوابة التوزيع العالمية لأسعار الطيران المباشرة" : "Global flight consolidator & API gateway" },
            { name: "Seeru Flights", note: isAr ? "تقنية السفر وتدقيق الأسعار والحجز اللحظي" : "Modern REST flight booking & fare validation" },
            { name: "BiletBank (BBOST)", note: isAr ? "الخطوط التركية وبيغاسوس وصن إكسبريس ومئات الناقلات" : "Turkish Airlines, Pegasus, SunExpress & Global" },
            { name: "Air Scraper", note: isAr ? "محرك تدقيق الأسعار والتوافر اللحظي" : "Live flight fares and availability engine" },
            { name: "Travelpayouts Flights", note: isAr ? "خلاصات الوايت ليبل وتتبع العمولات" : "Aviasales white-label affiliate feed" },
          ],
        },
        {
          title: isAr ? "الفنادق والمنتجعات (Hotels & Bedbanks)" : "Hotels & Global Bedbanks",
          icon: Hotel,
          desc: isAr ? "تغطية لأكثر من 3 ملايين فندق عبر أكبر بنوك الغرف العالمية." : "Over 3 million properties through premier global bedbanks.",
          partners: [
            { name: "Hotelbeds", note: isAr ? "أكبر بنك غرف فندقية عالمي B2B بتوقيع تشفيري SHA-256" : "World's leading B2B bedbank with dynamic SHA-256 signatures" },
            { name: "RateHawk (Emerging Travel)", note: isAr ? "منصة فنادق B2B عالمية بمصادقة أمنية مباشرة" : "Global B2B accommodation broker with instant booking" },
            { name: "Seeru Hotels API", note: isAr ? "واجهة فنادق سيرو المباشرة لتأكيد الغرف" : "Direct hotel rooms inventory & instant voucher" },
            { name: "Travelport Hospitality", note: isAr ? "محرك فنادق ترافلبورت عبر Universal API" : "Hospitality GDS rates via Universal API" },
            { name: "Hotel Engine Lonaliza", note: isAr ? "محرك الفنادق الداخلي الموحد للوناليزا" : "Unified internal hotel engine & cache" },
            { name: "Travel Advisor (TripAdvisor)", note: isAr ? "تقييمات النزلاء، تفاصيل المرافق، وصور المعالم" : "Reviews, amenities, and landmark metadata" },
            { name: isAr ? "الكتالوج الفندقي المباشر" : "Direct Hotel Inventory", note: isAr ? "فنادق ومنتجعات متعاقد معها محلياً بحرية تسعير تامة" : "Locally contracted properties with 100% pricing control" },
          ],
        },
        {
          title: isAr ? "الترانسفير وتأجير السيارات (Transfers & Car Rentals)" : "Transfers, Fleet & Car Rentals",
          icon: Car,
          desc: isAr ? "نظام الترانسفير الداخلي المتقدم، شبكة الأساطيل المتعددة، وتأجير السيارات المباشر." : "Advanced internal transfer system, multi-vendor fleet network, and car rentals.",
          partners: [
            {
              name: isAr ? "نظام الترانسفير الداخلي وإدارة الأساطيل (Multi-Vendor Fleet Engine)" : "Enterprise Multi-Vendor Fleet Engine",
              note: isAr
                ? "تمكين شركات النقل وسائقي الـ VIP من التسجيل بسياراتهم عبر تطبيق Flutter (iOS و Android) وإدراج رحلاتهم وأسعارهم في كتالوج رقمي متكامل يظهر فوراً في نتائج البحث."
                : "Multi-vendor fleet onboarding via Flutter apps (iOS & Android) with live route & dynamic price catalogs."
            },
            {
              name: isAr ? "نظام التوجيه والتنفيذ التلقائي (Zero-Touch Dispatch)" : "Zero-Touch Automated Dispatch",
              note: isAr
                ? "توجيه حجز العميل فورياً للشركة المنفذة والسائق الميداني دون تدخل بشري، مع اقتطاع عمولة المنصة تلقائياً وتوزيع الأرباح."
                : "Automated instant dispatch directly to vehicle operators and drivers with zero human overhead and automated commission escrow."
            },
            {
              name: isAr ? "أسطول لوناليزا VIP الخاص" : "Lonaliza VIP Chauffeur Fleet",
              note: isAr
                ? "تغطية المطارات والمشاوير الفارهة بمركبات مرسيدس فيتو، مايباخ، وسبرنتر مع سائقين معتمدين متحدثين بعدة لغات."
                : "Luxury private Mercedes Vito, Maybach, and Sprinter vans covering international airports with multilingual chauffeurs."
            },
            {
              name: isAr ? "أسطول تأجير السيارات الداخلي" : "Private Rental Fleet",
              note: isAr
                ? "تأجير سيارات سياحية وعائلية مباشرة مع إدارة التأمين، الودائع، وعقود الإيجار الإلكترونية."
                : "Direct agency-owned vehicle rental with digital deposit management, insurance, and instant contracts."
            },
            {
              name: "Travelpayouts Transfers & Cars",
              note: isAr
                ? "تغطية تنقلات المطارات وتأجير السيارات السياحية في أكثر من 150 دولة حول العالم."
                : "Global airport transfers and car hire comparison across +150 countries."
            },
          ],
        },
        {
          title: isAr ? "بوابات الدفع والمحفظة الرقمية (Payments & Digital Vault)" : "Payment Gateways & Digital Vault",
          icon: Coins,
          desc: isAr ? "بوابات دفع بنكية معتمدة مع حماية ثلاثية الأبعاد 3D Secure ومحفظة B2B." : "Certified payment gateways with 3D Secure and B2B wallet.",
          partners: [
            { name: "iyzico", note: isAr ? "دفع بالبطاقات الائتمانية، أقساط بنكية، وحفظ البطاقات 3D Secure" : "Credit cards, installment plans, and 3D Secure vault" },
            { name: "Stripe", note: isAr ? "دفع إلكتروني دولي متعدد العملات والبطاقات العالمية" : "Global multi-currency credit card processing" },
            { name: "B2B Wallet Engine", note: isAr ? "محفظة رقمية للشركات مع شحن رصيد وخصم تلقائي لحظي" : "Pre-funded partner wallet with zero-delay auto-deduction" },
          ],
        },
      ],
    },

    // Tab 4: Mobile & AI
    mobile_ai: {
      heading: isAr ? "منظومة تطبيقات الهاتف الذكي وترسانة الذكاء الاصطناعي والمحرر البصري" : isTr ? "Mobil Uygulama Ekosistemi ve Yapay Zeka Gücü" : isFr ? "Écosystème Mobile & Arsenal d'Intelligence Artificielle" : "Mobile Apps Ecosystem & Autonomous AI Swarm",
      subtitle: isAr
        ? "حلول متنقلة كاملة للمسافرين والسائقين والمديرين، مع محرر بصري متطور، واستوديو مقالات SEO، وسرب ذكاء اصطناعي رائد للمبيعات."
        : isTr
          ? "Gezginler, sürücüler ve yöneticiler için eksiksiz mobil çözümler ve yapay zeka destekli otonom satış gücü."
          : isFr
            ? "Des solutions mobiles complètes pour voyageurs, chauffeurs et administrateurs, propulsées par une IA autonome."
            : "Complete native mobile mobility for travelers, drivers, and management, supercharged by autonomous AI sales engines.",
      apps: [
        {
          title: isAr ? "تطبيق العميل والمسافر (Lonaliza Mobile App)" : "Traveler Mobile App (iOS & Android)",
          desc: isAr
            ? "تطبيق هاتف أصيل فائق السرعة يتيح للمسافر البحث وحجز الطيران والفنادق والترانسفير، إدارة تذاكره، مجتمع رفقاء السفر التفاعلي، ومحفظة النقاط والهدايا."
            : "Ultra-responsive native mobile application enabling travelers to search and book flights, hotels, and transfers, manage e-tickets, connect with travel buddies, and redeem wallet points.",
          badge: isAr ? "للعملاء والمسافرين" : "For Travelers",
          icon: Smartphone,
        },
        {
          title: isAr ? "تطبيق السائق والأسطول (Lonaliza Driver App)" : "Lonaliza Driver App (Flutter)",
          desc: isAr
            ? "تطبيق مخصص لشركات النقل وسائقي أسطول الـ VIP لتسجيل سياراتهم واستقبال مشاوير الترانسفير والجولات السياحية، مع تتبع GPS ومزامنة حالة الرحلة لحظياً."
            : "Dedicated Flutter mobile app for luxury VIP chauffeur drivers to register vehicles, receive transfer dispatches, follow GPS navigation, and sync trip milestones in real time.",
          badge: isAr ? "للسائقين والأسطول" : "For Fleet Drivers",
          icon: Compass,
        },
        {
          title: isAr ? "تطبيق الإدارة السريع (Admin Mobile Shell)" : "Admin Mobile Control Shell",
          desc: isAr
            ? "لوحة تحكم مرنة وخفيفة على الهاتف تتيح لمديري الوكالات مراقبة الحجوزات، متابعة رصيد المحفظة B2B، والرد على استفسارات المسافرين أثناء التنقل."
            : "Lightweight mobile management shell allowing agency managers to monitor bookings, audit wallet transactions, and respond to traveler inquiries on the go.",
          badge: isAr ? "للإدارة والمبيعات" : "For Agency Admins",
          icon: Server,
        },
      ],
      aiHighlights: [
        {
          title: isAr ? "المحرر المرئي واستوديو المحتوى والـ SEO" : "Visual CMS & AI SEO Content Studio",
          desc: isAr ? "محرر بصري تفاعلي بالسحب والإفلات يتيح للوكالات تصميم وتخصيص صفحاتها دون كود، مع مولد مقالات سياحية ذكي يحسن تصدر محركات البحث وينشئ محتوى بـ 4 لغات." : "Dynamic drag-and-drop page builder paired with an autonomous travel blog generator optimizing global SEO across 4 languages.",
        },
        {
          title: isAr ? "سرب الـ 6 وكلاء ذكاء اصطناعي (AI Swarm)" : "Autonomous 6-Agent AI Swarm",
          desc: isAr ? "وكلاء أذكياء متخصصون في الاستشارات السحابية، تحليل طلبات السفر، اقتراح الفنادق، وصياغة العروض السياحية المخصصة." : "Specialized AI agents handling travel consultations, route planning, and personalized itineraries.",
        },
        {
          title: isAr ? "بوابة WhatsApp Baileys المدمجة مجاناً" : "Zero-Cost WhatsApp Baileys Gateway",
          desc: isAr ? "ربط 5 أرقام واتساب متزامنة للرد الآلي الفوري على استفسارات المسافرين وإرسال التذاكر دون أي رسوم أو اشتراكات لشركة ميتا." : "Synchronize up to 5 WhatsApp numbers for 24/7 automated customer support and ticket dispatch without Meta API fees.",
        },
        {
          title: isAr ? "استوديو ريلز 4K والتسويق الآلي" : "Autonomous 4K Travel Video Reels Studio",
          desc: isAr ? "إنتاج مقاطع فيديو سينمائية ترويجية بدقة 4K ونشرها بجدولة ذكية على تيك توك، إنستغرام، فيسبوك، وإكس لزيادة المبيعات." : "Automated creation of cinematic travel reels posted autonomously to TikTok, Instagram, Facebook, and X.",
        },
        {
          title: isAr ? "استعادة الحجوزات المتروكة (Cart Recovery Bot)" : "WhatsApp Abandoned Booking Recovery",
          desc: isAr ? "متابعة تلقائية للعملاء الذين توقفوا قبل إتمام الدفع وإرسال روابط تذكير مخصصة لاستعادة حتى 30% من الحجوزات المفقودة." : "Autonomous re-engagement messaging travelers who paused checkout, recovering up to 30% of lost bookings.",
        },
        {
          title: isAr ? "ما يميز لوناليزا في السوق (Market Advantage)" : "Unique Competitive Advantage",
          desc: isAr ? "بنية تحتية موحدة تجمع بين تملك المنصة المستقل 100%، وتوريد الطيران والفنادق المباشر، وشبكة النقل الداخلي المفتوحة، دون أي ديون تقنية أو تكاليف برمجية إضافية." : "Unified infrastructure merging 100% brand autonomy, live GDS/bedbank sourcing, and open fleet networks without technical debt.",
        },
      ],
    },

    cta: {
      heading: isAr ? "جاهز لإطلاق وكالتك السياحية الرقمية؟" : isTr ? "Dijital Seyahat Acentenizi Başlatmaya Hazır mısınız?" : isFr ? "Prêt à lancer votre agence de voyage digitale ?" : "Ready to Launch Your Digital Travel Agency?",
      sub: isAr
        ? "انضم إلى مئات الشركات والرياديين الذين أطلقوا منصاتهم بهويتهم الخاصة مع لوناليزا."
        : isTr
          ? "Lonaliza ile kendi markalarıyla seyahat platformlarını başlatan yüzlerce acenteye katılın."
          : isFr
            ? "Rejoignez des centaines d'entreprises qui ont lancé leur plateforme avec Lonaliza."
            : "Join hundreds of travel agencies and entrepreneurs who launched their branded platforms with Lonaliza.",
      b2bButton: isAr ? "دخول بوابة الشركاء B2B" : isTr ? "B2B Ortaklık Paneline Giriş" : isFr ? "Portail Partenaires B2B" : "Open B2B Partner Portal",
      demoButton: isAr ? "معاينة محرك الحجز الحي" : isTr ? "Canlı Rezervasyon Motorunu İncele" : isFr ? "Démo Moteur de Réservation" : "Explore Live Booking Demo",
    },
  };

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="space-y-8 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
      {/* Top Header Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E0842] via-[#2E1065] to-[#4C1D95] p-6 text-white shadow-xl sm:p-10">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-md border border-amber-300/30">
            <Sparkles size={14} />
            <span>{copy.badge}</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-4xl text-white">
            {copy.title}
          </h1>
          <p className="text-sm leading-relaxed text-purple-100/90 sm:text-base">
            {copy.heroSubtitle}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/partners/dashboard"
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-5 py-3 text-xs font-black text-[#2E1065] shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <span>{copy.cta.b2bButton}</span>
              <ArrowIcon size={14} />
            </Link>
            <Link
              href="/flights"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-xs font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <span>{copy.cta.demoButton}</span>
              <ExternalLink size={14} />
            </Link>
          </div>
        </div>

        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -bottom-20 -end-20 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -top-20 -start-20 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {copy.stats.map((stat, idx) => (
          <div
            key={idx}
            className="group rounded-2xl border border-slate-100 bg-[#FAF8FE] p-4 text-center transition-all hover:border-purple-200 hover:bg-purple-50/50 hover:shadow-md"
          >
            <p className="font-mono text-2xl font-black text-[#2E1065] sm:text-3xl">
              {stat.value}
            </p>
            <p className="mt-1 text-xs font-black text-slate-800">{stat.label}</p>
            <p className="mt-0.5 text-[11px] text-slate-500">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Interactive Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {(["overview", "whitelabel", "suppliers", "mobile_ai"] as TabKey[]).map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => setActiveTab(tabKey)}
            className={`rounded-2xl px-4 py-2.5 text-xs font-black transition-all ${
              activeTab === tabKey
                ? "bg-[#2E1065] text-amber-300 shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {copy.tabs[tabKey]}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview & Story */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-black text-[#2E1065] sm:text-2xl">
              {copy.overview.heading}
            </h2>
            <p className="text-sm leading-7 text-slate-600 sm:text-base">
              {copy.overview.body1}
            </p>
            <p className="text-sm leading-7 text-slate-600 sm:text-base">
              {copy.overview.body2}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {copy.overview.highlights.map((h, i) => (
              <div
                key={i}
                className="space-y-2 rounded-2xl border border-slate-100 bg-[#FAF8FE] p-5 transition-all hover:border-purple-200 hover:shadow-sm"
              >
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-[#7C3AED]">
                  <CheckCircle2 size={18} />
                </div>
                <h3 className="text-sm font-black text-[#2E1065]">{h.title}</h3>
                <p className="text-xs leading-6 text-slate-600">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: White Label Plans */}
      {activeTab === "whitelabel" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-black text-[#2E1065] sm:text-2xl">
              {copy.whitelabel.heading}
            </h2>
            <p className="text-xs text-slate-500 sm:text-sm">
              {copy.whitelabel.subtitle}
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {copy.whitelabel.plans.map((plan, idx) => {
              const Icon = plan.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-purple-300 hover:shadow-lg"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-black border ${plan.badgeColor}`}>
                        {plan.tag}
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-[#7C3AED]">
                        <Icon size={20} />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-[#2E1065]">{plan.name}</h3>
                      <p className="mt-1 font-mono text-lg font-bold text-amber-600">{plan.price}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-500">{plan.desc}</p>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-slate-400">
                        {isAr ? "الميزات المشمولة" : "Included Features"}
                      </p>
                      <ul className="space-y-2 text-xs text-slate-700">
                        {plan.features.map((feat, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-2">
                            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Link
                      href="/partners/dashboard"
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2E1065] py-3 text-xs font-black text-amber-300 shadow transition-transform hover:scale-[1.02] active:scale-95"
                    >
                      <span>{copy.cta.b2bButton}</span>
                      <ArrowIcon size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Real Suppliers Network */}
      {activeTab === "suppliers" && (
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-black text-[#2E1065] sm:text-2xl">
              {copy.suppliers.heading}
            </h2>
            <p className="text-xs text-slate-500 sm:text-sm">
              {copy.suppliers.subtitle}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {copy.suppliers.verticals.map((vert, vIdx) => {
              const Icon = vert.icon;
              return (
                <div
                  key={vIdx}
                  className="rounded-3xl border border-slate-200 bg-[#FCFBFD] p-5 shadow-sm transition-all hover:border-purple-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#2E1065] text-amber-300">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#2E1065]">{vert.title}</h3>
                      <p className="text-xs text-slate-500">{vert.desc}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                    {vert.partners.map((p, pIdx) => (
                      <div
                        key={pIdx}
                        className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs border border-slate-100 shadow-2xs"
                      >
                        <span className="font-bold text-slate-900">{p.name}</span>
                        <span className="text-[11px] text-slate-500">{p.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Mobile Apps & AI Swarm */}
      {activeTab === "mobile_ai" && (
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-lg font-black text-[#2E1065] sm:text-2xl">
              {copy.mobile_ai.heading}
            </h2>
            <p className="text-xs text-slate-500 sm:text-sm">
              {copy.mobile_ai.subtitle}
            </p>
          </div>

          {/* Mobile Apps Trio */}
          <div className="grid gap-5 md:grid-cols-3">
            {copy.mobile_ai.apps.map((app, aIdx) => {
              const Icon = app.icon;
              return (
                <div
                  key={aIdx}
                  className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-purple-300 hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-black text-[#7C3AED]">
                        {app.badge}
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2E1065] text-amber-300">
                        <Icon size={20} />
                      </div>
                    </div>
                    <h3 className="text-sm font-black text-[#2E1065]">{app.title}</h3>
                    <p className="text-xs leading-6 text-slate-600">{app.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Swarm Highlights */}
          <div className="rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50/70 to-amber-50/40 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={20} className="text-amber-500" />
              <h3 className="text-base font-black text-[#2E1065]">
                {isAr ? "ترسانة الأتمتة والذكاء الاصطناعي التوليدي" : "Autonomous AI Swarm & WhatsApp Suite"}
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {copy.mobile_ai.aiHighlights.map((ai, i) => (
                <div key={i} className="rounded-2xl border border-white bg-white/80 p-4 backdrop-blur-xs">
                  <h4 className="text-xs font-black text-[#2E1065]">{ai.title}</h4>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{ai.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 via-amber-100/50 to-purple-50 p-6">
        <div>
          <p className="text-base font-black text-[#2E1065]">{copy.cta.heading}</p>
          <p className="text-xs text-slate-600 mt-1">{copy.cta.sub}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/partners/dashboard"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#2E1065] px-5 py-3 text-xs font-black text-amber-300 shadow-md hover:bg-[#3B1582] transition-colors"
          >
            <span>{copy.cta.b2bButton}</span>
            <ArrowIcon size={14} />
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <span>{isAr ? "صفحة من نحن" : "About Us Page"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
