"use client";

import { useState, useRef } from "react";
import {
  Activity,
  ArrowRight,
  ArrowLeft,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Clock,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Globe2,
  Inbox,
  Layers,
  LayoutDashboard,
  Link2,
  Lock,
  Mail,
  Maximize2,
  Minimize2,
  Monitor,
  Percent,
  Plane,
  QrCode,
  Receipt,
  RotateCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tablet,
  TrendingUp,
  Wand2,
  Zap,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { pickLocaleText } from "./landing-translations";

type DashboardScreenId =
  | "analytics"
  | "visual_builder"
  | "suppliers_crawler"
  | "war_room"
  | "telegram_bot"
  | "email_marketing"
  | "invoice_templates"
  | "financial_vault"
  | "pwa_app";

interface ScreenFeature {
  icon: typeof Sparkles;
  title: string;
  detail: string;
}

interface ScreenConfig {
  id: DashboardScreenId;
  title: string;
  badge: string;
  icon: typeof LayoutDashboard;
  urlPath: string;
  iframeUrl: string;
  tagline: string;
  summary: string;
  kpis: Array<{ label: string; value: string; hint: string }>;
  features: ScreenFeature[];
}

export default function MasterDashboardIframeViewer() {
  const { dir, locale } = useLocale();
  const isRtl = dir === "rtl";

  const [activeScreen, setActiveScreen] = useState<DashboardScreenId>("analytics");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deviceViewport, setDeviceViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [refreshKey, setRefreshKey] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleScrollTabs = (direction: "left" | "right") => {
    if (!tabsScrollRef.current) return;
    const distance = 320;
    const scrollAmount = direction === "left" ? -distance : distance;
    tabsScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const loc = (ar: string, en: string, fr?: string, tr?: string) =>
    pickLocaleText(locale, { ar, en, fr, tr });

  const screens: ScreenConfig[] = [
    {
      id: "analytics",
      title: loc("لوحة القيادة والمؤشرات اللحظية", "Executive Analytics & Live KPIs", "Tableau de Bord Exécutif & KPIs", "Yönetici Paneli & Canlı KPI'lar"),
      badge: loc("مؤشرات حية", "Live Feed", "Flux en Direct", "Canlı Akış"),
      icon: LayoutDashboard,
      urlPath: "https://your-agency.com/admin/dashboard",
      iframeUrl: "/preview/dashboard",
      tagline: loc(
        "الرؤية التنفيذية الشاملة لكافة حجوزات وأرباح وأداء محركات الوكالة السياحية في مكان واحد.",
        "Total executive visibility into bookings, revenue streams, and 6-engine performance in one screen.",
        "Visibilité exécutive totale sur les réservations, les revenus et les 6 moteurs en un seul écran.",
        "Tek ekranda rezervasyonlara, gelir akışlarına ve 6 motorun performansına tam yönetici görünürlüğü."
      ),
      summary: loc(
        "تمنحك لوحة القيادة المركزية مراقبة شاملة وفورية لحركة المبيعات، ومعدل التحويل اللحظي، وتدفق الإيرادات عبر بوابات الدفع، مع تتبع آلي لسلامة قواعد البيانات وتزامن محركات الطيران والفنادق دون أي تأخير.",
        "Real-time command center providing instantaneous visibility into conversion rates, GDS & hotel booking throughput, revenue collection, and database sync status.",
        "Centre de contrôle en temps réel offrant une visibilité instantanée sur les taux de conversion, le flux GDS et hôtelier, les encaissements et la synchronisation des données.",
        "Dönüşüm oranları, GDS ve otel rezervasyon akışı, gelir tahsilatı ve veri tabanı senkronizasyon durumuna anında görünürlük sağlayan gerçek zamanlı komuta merkezi."
      ),
      kpis: [
        { label: loc("تحديث المؤشرات", "Refresh Latency", "Latence d'Actualisation", "Yenileme Gecikmesi"), value: "< 100ms", hint: loc("مزامنة لحظية", "Real-time sync", "Synchro temps réel", "Gerçek zamanlı senk.") },
        { label: loc("محركات متزامنة", "Synced Engines", "Moteurs Synchronisés", "Senkronize Motorlar"), value: "6 في 1", hint: loc("طيران، فنادق، نقل", "Unified GDS & Beds", "GDS & Hôtels Unifiés", "Birleşik GDS & Oteller") },
        { label: loc("عمولة المنصة", "Platform Fee", "Frais de Plateforme", "Platform Komisyonu"), value: "0%", hint: loc("أرباحك 100% لك", "Zero fee leak", "100% de vos profits", "Kârınız %100 sizin") },
      ],
      features: [
        {
          icon: TrendingUp,
          title: loc("تتبع فوري للأرباح الصافية", "Real-time Net Yield Tracking", "Suivi du Rendement Net en Temps Réel", "Gerçek Zamanlı Net Kâr Takibi"),
          detail: loc(
            "حساب دقيق لهوامش أرباح التذاكر والفنادق بعد خصم رسوم بوابات الدفع والضرائب بصورة آلية.",
            "Precise calculation of booking markups net of gateway processing fees and government taxes.",
            "Calcul précis des marges de réservation nettes des frais de passerelle et taxes.",
            "Ödeme geçidi ücretleri ve vergiler düşüldükten sonra net kâr marjlarının hassas hesaplanması."
          ),
        },
        {
          icon: Activity,
          title: loc("مراقبة سلامة المحركات والخوادم", "Continuous Infrastructure Health", "Santé Continue de l'Infrastructure", "Sürekli Altyapı Sağlığı"),
          detail: loc(
            "فحص دوري لحالة خوادم GDS وبنوك الغرف وقواعد بيانات PocketBase لضمان جاهزية 99.9%.",
            "Proactive uptime health checks on GDS endpoints, hotel bed banks, and central database.",
            "Contrôles proactifs de disponibilité des points GDS, banques de lits et base de données.",
            "GDS uç noktaları, yatak bankaları ve merkezi veri tabanında proaktif çalışma süresi kontrolleri."
          ),
        },
        {
          icon: Globe2,
          title: loc("توزيع جغرافي للمبيعات", "Multinational Sales Distribution", "Distribution Géographique des Ventes", "Çok Uluslu Satış Dağılımı"),
          detail: loc(
            "تحليل جنسيات العملاء والعملات المستخدمة (USD, EUR, SAR, AED, TRY) لتحسين الحملات الإعلانية.",
            "Demographic and multi-currency tracking to optimize targeted seasonal campaigns.",
            "Analyse démographique et multidevise pour optimiser les campagnes saisonnières ciblées.",
            "Hedefli sezonluk kampanyaları optimize etmek için demografik ve çok para birimli takip."
          ),
        },
      ],
    },
    {
      id: "visual_builder",
      title: loc("المحرر البصري الفوري (Drag & Drop)", "Visual Drag & Drop Page Builder", "Éditeur Visuel Glisser-Déposer", "Görsel Sürükle-Bırak Sayfa Düzenleyici"),
      badge: loc("سحب وإفلات", "Live CMS", "CMS en Direct", "Canlı CMS"),
      icon: Wand2,
      urlPath: "https://your-agency.com/admin/homepage-editor",
      iframeUrl: "/preview/builder",
      tagline: loc(
        "خصص وصمم صفحات موقعك السياحي بمرونة كاملة وسحب وإفلات دون كتابة سطر كود برمجي واحد.",
        "Design and customize your luxury travel portal with zero coding using high-speed visual blocks.",
        "Concevez et personnalisez votre portail de voyage sans coder grâce aux blocs visuels rapides.",
        "Hızlı görsel bloklarla tek satır kod yazmadan lüks seyahat portalınızı tasarlayın ve özelleştirin."
      ),
      summary: loc(
        "منظومة تحرير بصرية احترافية تتيح لمدير الوكالة إعادة ترتيب الأقسام، تبديل البانرات والعروض، تفعيل شرائح الرحلات الموسمية، مع دعم الترجمة الفورية لأكثر من 20 لغة والمعاينة المباشرة لشاشات الهاتف والتابلت.",
        "Studio-grade visual editor enabling agency directors to reorder hero sliders, update flash sale packages, manage 20+ languages, and preview responsive viewports instantly.",
        "Éditeur visuel professionnel permettant de réorganiser les bannières, gérer les ventes flash, 20+ langues et prévisualiser sur tous les écrans.",
        "Acente yöneticilerinin slider'ları yeniden düzenlemesini, flaş fırsatları güncellemesini, 20+ dili yönetmesini ve tüm ekranları anında önizlemesini sağlayan profesyonel görsel editör."
      ),
      kpis: [
        { label: loc("لغات التوطين", "Languages", "Langues", "Diller"), value: "20+", hint: loc("ترجمة فورية للواجهات", "Instant i18n", "i18n instantané", "Anında i18n") },
        { label: loc("سرعة نشر التعديل", "Publish Speed", "Vitesse de Publication", "Yayınlama Hızı"), value: loc("فوري", "Instant", "Instantané", "Anında"), hint: loc("تحديث حي دون إعادة تشغيل", "Hot reload", "Rechargement à chaud", "Canlı yenileme") },
        { label: loc("توافق الشاشات", "Responsive", "Responsive", "Duyarlı"), value: "100%", hint: loc("موبايل، تابلت، شاشات عريضة", "Desktop & Mobile", "Bureau & Mobile", "Masaüstü & Mobil") },
      ],
      features: [
        {
          icon: Layers,
          title: loc("مكتبة مكونات سياحية جاهزة", "Pre-built Travel Blocks", "Blocs de Voyage Prêts à l'Emploi", "Hazır Seyahat Blokları"),
          detail: loc(
            "مصفوفات جاهزة لمحركات البحث، بطاقات الفنادق، جولات البوسفور، وباقات شهر العسل الفاخرة.",
            "Engineered blocks for flight search ribbons, luxury hotel grids, and curated VIP packages.",
            "Blocs conçus pour la recherche de vols, grilles d'hôtels de luxe et forfaits VIP exclusifs.",
            "Uçuş arama şeritleri, lüks otel listeleri ve özel VIP paketleri için tasarlanmış bloklar."
          ),
        },
        {
          icon: Smartphone,
          title: loc("معاينة متزامنة للأجهزة", "Simultaneous Viewport Testing", "Test Multi-Écrans Simultané", "Eşzamanlı Cihaz Testi"),
          detail: loc(
            "تحقق من تجربة المستخدم على شاشات الهواتف الذكية والآيباد بنقرة زر قبل النشر للجمهور.",
            "Test touch ergonomics and mobile checkout layouts directly inside the visual canvas.",
            "Testez l'ergonomie tactile et les réservations mobiles directement dans le canevas.",
            "Yayınlamadan önce dokunmatik ergonomiyi ve mobil rezervasyon adımlarını doğrudan tuvalde test edin."
          ),
        },
        {
          icon: Zap,
          title: loc("تحسين تلقائي لمحركات البحث SEO", "Automated SEO Generation", "Génération SEO Automatisée", "Otomatik SEO Üretimi"),
          detail: loc(
            "توليد تلقائي للوسوم الوصفية والعناوين وبطاقات OpenGraph لكل قسم سياحي لتحقيق الصدارة في جوجل.",
            "Auto-generated meta descriptions, schema structured data, and OpenGraph social preview tags.",
            "Métadonnées, schémas structurés et balises OpenGraph générés automatiquement pour Google.",
            "Google'da üst sıralar için otomatik meta açıklamalar, yapılandırılmış veriler ve OpenGraph etiketleri."
          ),
        },
      ],
    },
    {
      id: "suppliers_crawler",
      title: loc("الموزعين وبدون ديبوزيت واستيراد الفنادق بالـ AI", "Zero-Deposit Rapid API & AI Hotel Importer", "Rapid API Sans Dépôt & Importateur d'Hôtels IA", "Depozitosuz Rapid API & Yapay Zeka Otel İçe Aktarıcı"),
      badge: loc("بدون ديبوزيت", "Zero Deposit", "Sans Dépôt", "Sıfır Depozito"),
      icon: Building2,
      urlPath: "https://your-agency.com/admin/suppliers-integrations",
      iframeUrl: "/preview/suppliers-crawler",
      tagline: loc(
        "اربط +500 شركة طيران و+3,000,000 فندق بدون ديبوزيت، واستورد الفنادق برابط فوري مع زاحف المزامنة كل 10 دقائق.",
        "Connect +500 airlines & +3,000,000 hotels with zero deposit. Import hotels via link with 15-min auto-sync crawler.",
        "Connectez +500 compagnies et +3 000 000 d'hôtels sans dépôt. Importez par lien avec crawler de synchronisation 15 min.",
        "Sıfır depozito ile +500 havayolu ve +3.000.000 oteli bağlayın. 15 dakikalık senk. crawler ile otelleri bağlantıyla içe aktarın."
      ),
      summary: loc(
        "مرونة تشغيلية تامة: اعمل بمحرك Rapid API فائق السرعة ($10/شهر) دون تجميد أي أموال تأمين لدى الموردين، أو اربط حساباتك المباشرة (Amadeus, Sabre, Hotelbeds)، أو فعل ترافلبايوتس بالعمولة. كما يمكنك لصق أي رابط فندق ليقوم الذكاء الاصطناعي بجلبه كاملاً مع تشغيل زاحف آلي كل 10–15 دقيقة لتحديث الأسعار والغرف وتطبيق هامش ربحك.",
        "Total supply flexibility: search live flights & hotels via Rapid API ($10/mo) with zero supplier deposit lock-in, connect direct GDS/bed banks, or run affiliate commissions. Paste any hotel URL to auto-import HD media and enable the 15-min autonomous rate sync daemon.",
        "Flexibilité totale : recherchez vols et hôtels via Rapid API (10 $/mois) sans dépôt fournisseur bloqué, connectez vos GDS directs ou affiliations. Collez un lien d'hôtel pour importer les médias et synchroniser automatiquement les tarifs.",
        "Tam tedarik esnekliği: depozito kilidi olmadan Rapid API (10 $/ay) ile canlı uçuş ve otel arayın, doğrudan GDS bağlayın veya komisyonlu çalışın. Medyayı aktarmak ve fiyatları her 15 dakikada bir senkronize etmek için herhangi bir otel URL'sini yapıştırın."
      ),
      kpis: [
        { label: loc("فنادق عالمية", "Hotels Inventory", "Inventaire Hôtels", "Otel Envanteri"), value: "+3,000,000", hint: loc("بنوك غرف عالمية", "Worldwide bed banks", "Banques de lits mondiales", "Küresel yatak bankaları") },
        { label: loc("طيران GDS", "GDS Airlines", "Compagnies GDS", "GDS Havayolları"), value: "+500", hint: loc("مباشر وتجميعي", "Amadeus & Sabre", "Amadeus & Sabre", "Amadeus & Sabre") },
        { label: loc("ديبوزيت مطلوب", "Required Deposit", "Dépôt Requis", "Gerekli Depozito"), value: "$0", hint: loc("محرك الـ Rapid API", "Rapid API Model", "Modèle Rapid API", "Rapid API Modeli") },
      ],
      features: [
        {
          icon: Zap,
          title: loc("محرك Rapid API للربط المباشر بدون ديبوزيت", "Zero-Deposit Live Sourcing", "Sourcing Direct Sans Dépôt", "Depozitosuz Canlı Tedarik"),
          detail: loc(
            "استعلم عن أسعار الطيران والفنادق حياً وبع لعميلك بهامش ربحك ثم احجز من أرخص مورد دون تجميد أموال.",
            "Search live inventory without upfront supplier deposits; collect full client payment and fulfill at net rates.",
            "Recherchez l'inventaire en direct sans dépôt préalable ; encaissez le client et réservez au tarif net.",
            "Ön depozito olmadan canlı envanteri arayın; müşteri ödemesini alıp net fiyatla rezerve edin."
          ),
        },
        {
          icon: Link2,
          title: loc("استيراد الفنادق بالذكاء الاصطناعي برابط فوري", "Instant AI Hotel URL Importer", "Importateur d'Hôtels IA par URL", "Anında Yapay Zeka Otel URL Aktarıcı"),
          detail: loc(
            "الصق رابط أي فندق تعاقدت معه؛ الذكاء الاصطناعي يستخرج الوصف والغرف والصور والسياسات في ثوانٍ.",
            "Paste any hotel web URL; AI automatically crawls gallery photos, room amenities, and policies into catalog.",
            "Collez l'URL de n'importe quel hôtel ; l'IA extrait photos, commodités et politiques en quelques secondes.",
            "Herhangi bir otel bağlantısını yapıştırın; yapay zeka galeriyi, oda özelliklerini ve kuralları saniyeler içinde çeker."
          ),
        },
        {
          icon: Clock,
          title: loc("زاحف المزامنة الآلي كل 10-15 دقيقة", "15-Min Autonomous Rate & Room Crawler", "Crawler Autonome de Tarifs & Chambres (15 min)", "15 Dakikalık Otonom Fiyat ve Oda Crawler'ı"),
          detail: loc(
            "يفحص الغرف المتاحة وتغيرات الأسعار آلياً ويحدث الموقع فورياً مع إضافة نسبة المارك أب الخاصة بك.",
            "Daemon continuously crawls contracted hotels every 10-15 mins to sync inventory and maintain margins.",
            "Le démon inspecte les disponibilités toutes les 10-15 min pour synchroniser l'inventaire et préserver vos marges.",
            "Daemon, müsait odaları ve fiyatları her 10-15 dakikada bir tarayarak marjınızı korur ve siteyi günceller."
          ),
        },
      ],
    },
    {
      id: "war_room",
      title: loc("غرفة عمليات الذكاء الاصطناعي (AI War Room)", "Autonomous AI War Room (6 Swarms)", "War Room IA Autonome (6 Essaims)", "Otonom Yapay Zeka Operasyon Odası (6 Ajan)"),
      badge: loc("6 وكلاء ذكاء", "6 Swarm Agents", "6 Agents IA", "6 Yapay Zeka Ajanı"),
      icon: Bot,
      urlPath: "https://your-agency.com/admin/agent-war-room",
      iframeUrl: "/preview/war-room",
      tagline: loc(
        "خلية من 6 وكلاء ذكاء اصطناعي مستقلين يحللون السوق ويوصون بالقرارات التسعيرية والمحتوى آلياً.",
        "An autonomous swarm of 6 specialized AI agents analyzing demand, markups, and growth levers.",
        "Un essaim autonome de 6 agents IA spécialisés analysant la demande, les marges et les leviers de croissance.",
        "Talebi, kâr marjlarını ve büyüme fırsatlarını analiz eden 6 uzman otonom yapay zeka ajanı."
      ),
      summary: loc(
        "يعمل السرب الذكي على مدار الساعة لتحليل بيانات الطلب، ومقارنة أسعار الطيران، ومراقبة سلات الشراء غير المكتملة، وتوليد المقالات التسويقية الضخمة، ثم تقديم بطاقات اعتماد تنفيذية فورية للمدير العام بنقرة واحدة.",
        "Autonomous agents continuously deliberate on market pricing trends, abandoned cart recoveries, high-converting SEO guides, and supply chain margins with 1-click approvals.",
        "Les agents autonomes analysent en continu les tendances de prix, la récupération des paniers, le SEO et les marges avec approbation en 1 clic.",
        "Otonom ajanlar; fiyat trendlerini, terk edilen sepetleri, yüksek dönüşümlü SEO rehberlerini ve tedarik marjlarını analiz ederek tek tıkla onay kartları sunar."
      ),
      kpis: [
        { label: loc("عدد الوكلاء المستقلين", "Active AI Swarms", "Agents IA Actifs", "Aktif Yapay Zeka Ajanları"), value: loc("6 وكلاء", "6 Agents", "6 Agents", "6 Ajan"), hint: loc("مبيعات، محتوى، أمان، تسعير", "Specialized roles", "Rôles spécialisés", "Özel roller") },
        { label: loc("أتمتة المهام اليومية", "Task Automation", "Automatisation des Tâches", "Görev Otomasyonu"), value: "85%", hint: loc("تقليص زمن الإدارة اليدوية", "Reduced manual ops", "Moins de gestion manuelle", "Azalan manuel operasyon") },
        { label: loc("تكامل بروتوكول MCP", "Protocol Support", "Support Protocole MCP", "Protokol Desteği"), value: loc("14 خادم", "14 Servers", "14 Serveurs", "14 Sunucu"), hint: loc("بحث حي وأدوات ترويج", "Live web & tools", "Recherche web & outils", "Canlı web & araçlar") },
      ],
      features: [
        {
          icon: Sparkles,
          title: loc("مداولات ونقاشات بينية ذكية", "Inter-Agent Swarm Deliberation", "Délibération Inter-Agents Intelligente", "Ajanlar Arası Akıllı Müzakere"),
          detail: loc(
            "يتعاون وكيل التسعير مع وكيل المحتوى لصياغة عروض موسمية جذابة تحقق أعلى ربح وأسرع مبيعات.",
            "Yield optimizer and creative director collaborate to package flash sales targeting peak demand.",
            "L'optimiseur de prix et le directeur créatif collaborent pour concevoir des offres éclair ultra-rentables.",
            "Fiyatlandırma uzmanı ile kreatif direktör iş birliği yaparak yüksek kâr getiren sezonluk flaş teklifler hazırlar."
          ),
        },
        {
          icon: Clock,
          title: loc("إحاطة إدارية صباحية مؤتمتة", "Automated Morning Briefings", "Briefings Quotidiens Automatisés", "Otomatik Sabah Yönetici Brifingleri"),
          detail: loc(
            "ملخص تنفيذي يومي يوضح إجمالي السيولة المحصلة، الحجوزات المؤكدة، والفرص البيعية الضائعة.",
            "Daily morning briefing detailing cash collected, booking throughput, and recovered cart revenue.",
            "Résumé quotidien détaillant les liquidités collectées, les réservations confirmées et les revenus récupérés.",
            "Toplanan nakit, onaylanan rezervasyonlar ve kurtarılan sepet gelirlerini detaylandıran günlük sabah brifingi."
          ),
        },
        {
          icon: ShieldCheck,
          title: loc("حماية الهوامش ومنع العروض الخاسرة", "Anti-Loss AI Boundary Guard", "Garde-Fou Anti-Perte Financière", "Kayıp Önleyici Yapay Zeka Koruması"),
          detail: loc(
            "وكيل الأمان المالي يرفض آلياً أي توصية تخفيض تتجاوز سقف 15% أو تضر بهامش ربح الوكالة.",
            "Safety agent autonomously enforces the 15% promotion cap and $500 minimum booking thresholds.",
            "L'agent de sécurité applique de manière autonome le plafond de promotion de 15% et le seuil de 500 $.",
            "Güvenlik ajanı, %15 indirim tavanını ve 500 $ minimum sepet tutarını otonom olarak korur."
          ),
        },
      ],
    },
    {
      id: "telegram_bot",
      title: loc("أتمتة بوت التيليجرام والأوامر التنفيذية", "2-Way Telegram Bot Automation", "Automatisation Bot Telegram Bidirectionnel", "2 Yönlü Telegram Bot Otomasyonu"),
      badge: loc("تحكم من الهاتف", "Mobile Command", "Contrôle Mobile", "Mobil Komuta"),
      icon: Send,
      urlPath: "https://your-agency.com/admin/telegram-automation",
      iframeUrl: "/preview/telegram-automation",
      tagline: loc(
        "أدر شركتك السياحية كاملة وتلقَّ الإشعارات واعتمد القرارات بنقرة واحدة من تطبيق تيليجرام على هاتفك.",
        "Operate your entire travel agency, review bookings, and execute approvals in <350ms from Telegram.",
        "Gérez toute votre agence, consultez les réservations et approuvez les décisions en <350ms depuis Telegram.",
        "Tüm seyahat acentenizi Telegram üzerinden <350ms hızla yönetin, rezervasyonları inceleyin ve onaylayın."
      ),
      summary: loc(
        "ربط ثنائي الاتجاه مشفر يربط خادم الوكالة السياحية بحساب التيليجرام الخاص بك. تتلقى إشعارات فورية بكل حجز مؤكد، وتنبيهات السيولة، وبطاقات التوصيات التنفيذية مع أزرار تفاعلية (اعتماد، تعديل، نشر فوري).",
        "Encrypted two-way webhook bridge between your dedicated agency server and mobile Telegram. Receive instant VIP booking dispatches, cash summaries, and interactive approval cards.",
        "Passerelle chiffrée bidirectionnelle entre votre serveur et Telegram. Recevez des notifications VIP, des bilans de trésorerie et des cartes d'approbation interactives.",
        "Özel acente sunucunuz ile Telegram arasında şifreli iki yönlü köprü. Anlık VIP rezervasyon bildirimleri, nakit özetleri ve etkileşimli onay kartları alın."
      ),
      kpis: [
        { label: loc("سرعة الاستجابة", "Execution Speed", "Vitesse d'Exécution", "Yürütme Hızı"), value: "< 350ms", hint: loc("تنفيذ أوامر الخادم فوراً", "Server daemon speed", "Vitesse du démon", "Sunucu servis hızı") },
        { label: loc("تحكم من الهاتف", "Mobile Autonomy", "Autonomie Mobile", "Mobil Otonomi"), value: "100%", hint: loc("دون الحاجة لفتح لابتوب", "No laptop required", "Sans ordinateur requis", "Laptop gerektirmeden") },
        { label: loc("تشفير القناة", "Security Protocol", "Protocole de Sécurité", "Güvenlik Protokolü"), value: "Chat ID", hint: loc("محصور برقم المدير المشفر", "Hardware locked", "Verrouillage matériel", "Donanım kilitli") },
      ],
      features: [
        {
          icon: CheckCircle2,
          title: loc("بطاقات الاعتماد التفاعلية (Approval Cards)", "1-Click Decision Cards", "Cartes de Décision en 1 Clic", "1 Tıkla Karar Onay Kartları"),
          detail: loc(
            "أزرار مدمجة تتيح لك قبول حملة ترويجية أو إطلاق خصم أو تأكيد حجز VIP بنقرة واحدة على الشاشة.",
            "Inline action buttons allowing you to approve price updates or launch recovery campaigns in seconds.",
            "Boutons interactifs vous permettant de valider des promotions ou confirmer des réservations VIP en un clin d'œil.",
            "Fiyat güncellemelerini veya VIP rezervasyon onaylarını saniyeler içinde onaylamanızı sağlayan butonlar."
          ),
        },
        {
          icon: Activity,
          title: loc("تنبيهات فورية بالدفعات الكبيرة", "High-Ticket Booking Alerts", "Alertes Réservations VIP", "Yüksek Tutarlı Rezervasyon Uyarıları"),
          detail: loc(
            "إشعار صوتي فوري عند إتمام أي حجز طيران أو فندق يتجاوز $1,000 مع تفاصيل المسافر والمبلغ الصافي.",
            "Instant push alert on reservations exceeding $1,000 detailing passenger names, route, and net profit.",
            "Notification instantanée pour toute réservation de plus de 1 000 $ avec noms, itinéraire et bénéfice net.",
            "1.000 $ üzerindeki rezervasyonlarda yolcu isimleri, rota ve net kârı bildiren anlık sesli uyarı."
          ),
        },
        {
          icon: Zap,
          title: loc("أوامر خادم نصية مباشرة", "Direct Server CLI Commands", "Commandes CLI Directes", "Doğrudan Sunucu Komutları"),
          detail: loc(
            "اكتب أوامر مثل /status أو /revenue للحصول فوراً على كشف الحساب والسيولة المتاحة في بوابات الدفع.",
            "Send slash commands like /status or /revenue to fetch live gateway balances and server stats.",
            "Envoyez des commandes comme /status ou /revenue pour obtenir le solde en direct et l'état du serveur.",
            "Canlı bakiye ve sunucu durumunu anında görmek için /status veya /revenue gibi komutlar gönderin."
          ),
        },
      ],
    },
    {
      id: "email_marketing",
      title: loc("منظومة التسويق بالبريد والحملات الاسترجاعية", "Email Marketing & Drip Automation", "Marketing E-mail & Séquences d'Abandon", "E-posta Pazarlaması ve Sepet Kurtarma"),
      badge: loc("أتمتة السلات", "Cart Recovery", "Récupération Paniers", "Sepet Kurtarma"),
      icon: Mail,
      urlPath: "https://your-agency.com/admin/email-marketing",
      iframeUrl: "/preview/email-marketing",
      tagline: loc(
        "استعد السلات غير المكتملة وروج لرحلات VIP بحملات بريدية ذكية تصل لصندوق الوارد بنسبة 99.8%.",
        "Recover abandoned flight carts and blast seasonal VIP packages with 99.8% authenticated inbox delivery.",
        "Récupérez les paniers abandonnés et diffusez vos offres VIP avec 99,8% de taux de délivrabilité en boîte de réception.",
        "Terk edilen uçuş sepetlerini geri kazanın ve %99,8 gelen kutusu teslimatıyla sezonluk VIP turları tanıtın."
      ),
      summary: loc(
        "محرك تسويق بريدي متقدم مجهز بقوالب فاخرة مصممة بتقنية MJML المتوافقة مع كافة تطبيقات البريد. يتضمن سلاسل استعادة الحجوزات المتروكة (Cart Drip)، وإرسال قسائم الحجز الآلية، وتوثيق سجلات SPF وDKIM لتفادي الـ Spam.",
        "Advanced marketing engine equipped with responsive MJML email templates, automated abandoned cart recovery drips (34.5% conversion), voucher dispatches, and full SPF/DKIM DNS hygiene.",
        "Moteur de messagerie avancé doté de modèles MJML responsifs, séquences de relance automatique de panier (34,5% de conversion), envoi de bons et hygiène DNS SPF/DKIM.",
        "Duyarlı MJML şablonları, otomatik sepet kurtarma zincirleri (%34,5 dönüşüm), kupon gönderimi ve tam SPF/DKIM DNS yapılandırmasına sahip gelişmiş e-posta motoru."
      ),
      kpis: [
        { label: loc("نسبة استعادة السلات", "Cart Recovery Rate", "Taux de Récupération", "Sepet Kurtarma Oranı"), value: "34.5%", hint: loc("مبيعات إضافية مستردة", "Recovered revenue", "Revenus récupérés", "Kurtarılan gelir") },
        { label: loc("وصول لصندوق الوارد", "Inbox Placement", "Délivrabilité Boîte de Réception", "Gelen Kutusu Ulaşımı"), value: "99.8%", hint: loc("تفادي مجلد البريد المزعج", "Zero spam penalty", "Zéro pénalité spam", "Spam cezası yok") },
        { label: loc("متوسط نسبة الفتح", "Average Open Rate", "Taux d'Ouverture Moyen", "Ortalama Açılma Oranı"), value: "41.2%", hint: loc("ضعف متوسط قطاع السياحة", "2x industry baseline", "2x la moyenne du secteur", "Sektör ortalamasının 2 katı") },
      ],
      features: [
        {
          icon: Clock,
          title: loc("سلاسل تنبيه ذكية متدرجة", "Intelligent 3-Stage Drip", "Séquences Intelligentes en 3 Étapes", "Akıllı 3 Aşamalı Hatırlatma"),
          detail: loc(
            "إرسال تذكير أول بعد 30 دقيقة، ثم تذكير ثانٍ بعد 6 ساعات، مع عرض ختامي محفز قبل نفاد المقاعد.",
            "Automated sequence: 30-minute reservation reminder, 6-hour follow-up, and final urgency push.",
            "Séquence automatisée : rappel après 30 minutes, relance après 6 heures et offre finale d'urgence.",
            "Otomatik dizi: 30 dakika sonra rezervasyon hatırlatması, 6 saat sonra takip ve koltuklar tükenmeden aciliyet teklifi."
          ),
        },
        {
          icon: ShieldCheck,
          title: loc("توثيق النطاق وسجلات DKIM وSPF", "Enterprise DNS Authentication", "Authentification DNS Entreprise", "Kurumsal DNS Kimlik Doğrulaması"),
          detail: loc(
            "إعداد متكامل على سيرفر الوكالة يضمن مصداقية النطاق العالية لدى Gmail وOutlook وYahoo.",
            "Server-side DKIM, SPF, and DMARC configurations protecting your sender reputation globally.",
            "Configuration DKIM, SPF et DMARC côté serveur protégeant votre réputation d'expéditeur.",
            "Gönderici itibarınızı korumak için sunucu tarafında yapılandırılmış DKIM, SPF ve DMARC kayıtları."
          ),
        },
        {
          icon: Smartphone,
          title: loc("تصميم متجاوب لكافة الهواتف", "Mobile-First MJML Layouts", "Mises en Page MJML Mobile-First", "Mobil Öncelikli MJML Tasarımları"),
          detail: loc(
            "قوالب مصممة بنقاء بصري عالي تعرض أزرار الحجز وقسائم الفنادق بوضوح فائق على شاشات iPhone وأندرويد.",
            "Pixel-perfect mobile rendering ensuring flight barcodes and booking buttons look stunning on any screen.",
            "Rendu parfait sur mobile pour que les codes-barres de vol et boutons s'affichent impeccablement.",
            "Uçuş barkodları ve rezervasyon butonlarının tüm ekranlarda kusursuz görünmesini sağlayan tasarımlar."
          ),
        },
      ],
    },
    {
      id: "invoice_templates",
      title: loc("مولد الفواتير وقسائم الفنادق ورموز QR", "Dynamic Invoices, Hotel Vouchers & QR", "Factures Dynamiques, Bons d'Hôtel & QR", "Dinamik Faturalar, Otel Kuponları ve QR"),
      badge: loc("فحص QR رقمي", "QR & Vouchers", "QR & Bons", "QR & Kuponlar"),
      icon: Receipt,
      urlPath: "https://your-agency.com/admin/invoice-templates",
      iframeUrl: "/preview/invoice-templates",
      tagline: loc(
        "إصدار فوري لفواتير الطيران، قسائم الفنادق، وعقود النقل السياحي مع رموز QR مشفرة وختم الوكالة الرسمي.",
        "Instant PDF issuance for flight e-tickets, hotel check-in vouchers, and transfers with dynamic QR checks.",
        "Émission instantanée de billets électroniques, bons d'hôtel et transferts avec QR codes sécurisés.",
        "Şifreli QR kodları ve resmi acente mührü ile uçak biletleri, otel kuponları ve transfer sözleşmeleri."
      ),
      summary: loc(
        "نظام طباعة وتوليد مستندات ذكي يتيح إصدار فواتير رسمية وقسائم فنادق معتمدة خلال أقل من 180ms. يدعم تفصيل الضرائب ورسوم الوقود، الختم الرقمي للوكالة، ورمز QR تفاعلي لفحص صحة الحجز في المطار أو استقبال الفندق.",
        "High-speed PDF generation engine rendering professional e-tickets, hotel vouchers, and car agreements in <180ms with itemized taxes, official digital seal, and secure airport/hotel QR token verification.",
        "Moteur PDF ultra-rapide générant e-billets et bons en <180ms avec taxes détaillées, cachet officiel et validation QR.",
        "Ayrıntılı vergiler, resmi mühür ve QR doğrulaması ile <180ms içinde profesyonel e-biletler ve otel kuponları üreten motor."
      ),
      kpis: [
        { label: loc("سرعة التوليد الخادمي", "Render Speed", "Vitesse de Génération", "Üretim Hızı"), value: "< 180ms", hint: loc("تصدير PDF فوري", "Instant PDF output", "Export PDF instantané", "Anında PDF çıktısı") },
        { label: loc("محركات المستندات", "Document Engines", "Moteurs de Documents", "Belge Motorları"), value: "6 في 1", hint: loc("طيران، فنادق، باقات، نقل", "Multi-service support", "Support multi-services", "Çoklu hizmet desteği") },
        { label: loc("الامتثال الضريبي", "Tax Matrix", "Conformité Fiscale", "Vergi Uyumluluğu"), value: "100%", hint: loc("تفصيل الضرائب والـ VAT", "Itemized accounting", "Comptabilité détaillée", "Ayrıntılı KDV dökümü") },
      ],
      features: [
        {
          icon: QrCode,
          title: loc("تحقق رقمي دولي عبر رمز QR", "Global Airport & Desk QR Verification", "Vérification QR Aéroport & Réception", "Havalimanı ve Resepsiyon QR Doğrulaması"),
          detail: loc(
            "مسح رمز الـ QR يفتح صفحة تحقق رسمية مشفرة تثبت صحة الحجز دون الحاجة لطباعة ورقية.",
            "Scanning the QR code redirects to an encrypted digital confirmation token verifying booking authenticity.",
            "Le scan du QR code ouvre un jeton de confirmation numérique chiffré sans impression papier.",
            "QR kodun taranması, kağıt baskıya gerek kalmadan rezervasyonun doğruluğunu kanıtlayan şifreli sayfayı açar."
          ),
        },
        {
          icon: FileCheck,
          title: loc("تخصيص الهوية والشعار والختم", "Custom Agency Branding & Seal", "Image de Marque & Cachet Personnalisés", "Özel Acente Markası ve Mührü"),
          detail: loc(
            "إدراج شعار وكالتك، رقم ترخيص وزارة السياحة، بيانات الاتصال، والختم الرسمي على كافة المطبوعات.",
            "Embed your agency logo, tourism license number, terms of carriage, and custom official stamp.",
            "Intégrez le logo de votre agence, numéro de licence touristique, coordonnées et cachet officiel.",
            "Acente logonuzu, turizm lisans numaranızı, iletişim bilgilerinizi ve resmi mührünüzü belgelere ekleyin."
          ),
        },
        {
          icon: Building2,
          title: loc("قسائم فنادق متعددة اللغات", "Multilingual Hotel Check-in Vouchers", "Bons d'Hôtel Multilingues", "Çok Dilli Otel Giriş Kuponları"),
          detail: loc(
            "إصدار قسائم باللغات العربية والإنجليزية والتركية لضمان سهولة التعامل مع موظفي الاستقبال دولياً.",
            "Generate vouchers in Arabic, English, and Turkish to streamline guest check-ins with international front desks.",
            "Générez des bons en arabe, anglais et turc pour faciliter les arrivées dans les hôtels internationaux.",
            "Uluslararası resepsiyonlarda kolay giriş sağlamak için Arapça, İngilizce ve Türkçe kuponlar oluşturun."
          ),
        },
      ],
    },
    {
      id: "financial_vault",
      title: loc("درع الأمان المالي وضوابط منع الخسارة", "Financial Safeguards & Profit Vault", "Bouclier Financier & Garde-Marge", "Finansal Güvenlik Kalkanı & Kâr Kasası"),
      badge: loc("سقف حماية 15%", "Anti-Loss Vault", "Coffre Anti-Perte", "Kayıp Önleme Kasası"),
      icon: ShieldCheck,
      urlPath: "https://your-agency.com/admin/marketing/safeguards",
      iframeUrl: "/preview/safeguards",
      tagline: loc(
        "ضوابط مالية صارمة تحمي أرباح وكالتك: حد أدنى $500، سقف خصم 15%، واعتماد إداري لنقاط المكافآت.",
        "Rigid financial parameters shielding agency margins: $500 minimum booking rule, 15% promo cap, and points queue.",
        "Paramètres financiers stricts protégeant vos marges : règle de 500 $ min, plafond de remise 15% et file de points.",
        "Acente marjlarını koruyan sıkı finansal kurallar: 500 $ minimum sepet, %15 indirim tavanı ve puan onay kuyruğu."
      ),
      summary: loc(
        "حزام أمان مالي مدمج في صلب المحركات يمنع أي تسريب للأرباح. يفرض سقفاً حديدياً على الخصومات والكوبونات، ويشترط حداً أدنى لقيمة الحجز لتطبيق العروض، مع طابور مراجعة بشري إلزامي لأي محاولة استبدال نقاط مشبوهة.",
        "Architectural financial guardrails preventing profit leaks: enforces a strict 15% maximum discount limit, $500 minimum basket requirement, and manual admin verification queue for high-value loyalty redemptions.",
        "Garde-fous intégrés empêchant les fuites de profit : plafond strict de remise de 15%, panier minimum de 500 $ et vérification manuelle des points de fidélité.",
        "Kâr sızıntısını engelleyen mimari koruma: %15 azami indirim sınırı, 500 $ minimum sepet şartı ve yüksek sadakat puanı kullanımlarında yönetici onay kuyruğu."
      ),
      kpis: [
        { label: loc("سقف الخصم الأقصى", "Maximum Promo Cap", "Plafond de Promotion", "Maksimum İndirim Tavanı"), value: "15%", hint: loc("محمي برمجياً ضد التجاوز", "Hard-coded barrier", "Barrière logicielle stricte", "Yazılımsal aşılmaz sınır") },
        { label: loc("الحد الأدنى للحجز", "Min Booking Threshold", "Seuil Min. de Réservation", "Min. Rezervasyon Tutarı"), value: "$500", hint: loc("شرط أساسي للكوبونات", "Enforced rule", "Condition obligatoire", "Kuponlar için zorunlu kural") },
        { label: loc("حماية من الاحتيال", "Fraud Resistance", "Protection Anti-Fraude", "Dolandırıcılık Koruması"), value: "100%", hint: loc("طابور اعتماد النقاط", "Admin verification", "Validation administrateur", "Yönetici doğrulama kuyruğu") },
      ],
      features: [
        {
          icon: ShieldAlert,
          title: loc("منع الخصومات العشوائية نهائياً", "Zero Accidental Discount Runaways", "Zéro Remise Accidentelle", "Rastgele İndirimleri Engelleme"),
          detail: loc(
            "لا يمكن لأي موظف أو مسوق تطبيق خصم يقلل من هامش ربح التذكرة أو الفندق دون موافقة المدير العام.",
            "Platform strictly blocks any promotional rule that erodes the agency baseline profit margin.",
            "Le système bloque toute règle promotionnelle qui éroderait la marge de base de l'agence.",
            "Genel müdürün onayı olmadan kâr marjını düşüren hiçbir promosyon kuralı uygulanamaz."
          ),
        },
        {
          icon: Lock,
          title: loc("طابور اعتماد استبدال النقاط", "Points Redemption Approval Queue", "File d'Attente de Validation des Points", "Puan Kullanımı Onay Kuyruğu"),
          detail: loc(
            "النقاط التراكمية الكبيرة تذهب تلقائياً لطابور المراجعة الإدارية للتحقق من هوية العميل قبل الصرف.",
            "High-value loyalty point redemptions are paused in a pending queue awaiting director sign-off.",
            "Les échanges de points fidélité élevés sont mis en attente pour validation avant déduction.",
            "Yüksek değerli sadakat puanı kullanımları, onay öncesinde yönetici kontrolü için beklemeye alınır."
          ),
        },
        {
          icon: Percent,
          title: loc("تحوط آلي لتقلبات أسعار الصرف", "Multi-Currency Dynamic Hedging", "Couverture Dynamique Multi-Devises", "Dinamik Çok Para Birimli Koruma"),
          detail: loc(
            "تحديث لحظي لأسعار الصرف يضمن عدم تكبد أي خسائر ناتجة عن تذبذب الليرة التركية أو اليورو مقابل الدولار.",
            "Real-time FX rate sync preventing margin losses caused by currency volatility between EUR, USD, and TRY.",
            "Synchronisation des taux de change en temps réel évitant les pertes liées aux fluctuations monétaires.",
            "Döviz kurlarının gerçek zamanlı senkronizasyonu ile kur dalgalanmalarından kaynaklanan kâr kayıplarını önler."
          ),
        },
      ],
    },
    {
      id: "pwa_app",
      title: loc("تطبيق الويب التقدمي (PWA)", "Progressive Web App (PWA)", "Application Web Progressive (PWA)", "Progresif Web Uygulaması (PWA)"),
      badge: loc("تطبيق هاتف أصيل", "Native PWA", "PWA Native", "Yerel PWA"),
      icon: Smartphone,
      urlPath: "https://your-agency.com/app",
      iframeUrl: "/preview/pwa-app",
      tagline: loc(
        "تطبيق هاتف سريع البرق يدعم التثبيت المباشر بنقرة واحدة، الإشعارات الفورية، والتصفح بدون إنترنت.",
        "Ultra-fast PWA with 1-click home screen install, push notifications, and full offline caching.",
        "PWA ultra-rapide avec installation en 1 clic sur l'écran d'accueil, notifications push et mode hors-ligne.",
        "Ana ekrana tek tıkla yükleme, anlık bildirimler ve çevrimdışı önbellekleme özellikli ultra hızlı PWA."
      ),
      summary: loc(
        "يحول موقع وكالتك إلى تطبيق هاتف كامل على أجهزة آيفون وأندرويد دون الحاجة لانتظار موافقة متاجر التطبيقات. يدعم التثبيت المباشر بنقرة واحدة، والإشعارات الترويجية لخفض الأسعار وتأكيد الحجوزات، وتخزين نتائج البحث محلياً لتعمل دون إنترنت.",
        "Transforms your platform into a fully-functional mobile app on iOS & Android without app store gatekeepers. Features 1-click home screen installation, web push notifications, and offline travel search caching.",
        "Transforme votre site en application mobile complète sur iOS et Android sans passer par les magasins d'applications, avec push web et mode hors ligne.",
        "Sitenizi uygulama mağazalarına ihtiyaç duymadan iOS ve Android'de tam işlevli mobil uygulamaya dönüştürür; web push ve çevrimdışı arama içerir."
      ),
      kpis: [
        { label: loc("سرعة الكاش أوفلاين", "Offline Cache", "Cache Hors-Ligne", "Çevrimdışı Önbellek"), value: "< 0.8s", hint: loc("جاهزية كاملة", "Service Worker", "Service Worker", "Service Worker") },
        { label: loc("تثبيت بنقرة واحدة", "Install Prompt", "Installation 1 Clic", "1 Tıkla Yükleme"), value: loc("1-Click", "1-Click", "1-Clic", "1-Tık"), hint: loc("الشاشة الرئيسية", "Add to Home", "Écran d'Accueil", "Ana Ekrana Ekle") },
        { label: loc("إشعارات فورية", "Web Push", "Notifications Push", "Web Push"), value: "100%", hint: loc("تنبيهات فورية", "Live Alerts", "Alertes en Direct", "Canlı Uyarılar") },
      ],
      features: [
        {
          icon: Smartphone,
          title: loc("تثبيت مباشر كأيقونة تطبيق", "1-Click Add to Home Screen", "Ajout en 1 Clic sur l'Écran d'Accueil", "Ana Ekrana 1 Tıkla Ekleme"),
          detail: loc(
            "يظهر لزائر الموقع زر تثبيت تلقائي لإضافة شعار وكالتك إلى الشاشة الرئيسية للهاتف كتطبيق مستقل تماماً.",
            "Visitors receive an instant install prompt to add your agency logo directly to their smartphone home screen.",
            "Les visiteurs reçoivent une invite automatique pour ajouter votre logo sur leur écran d'accueil.",
            "Ziyaretçilere, acente logonuzu doğrudan ana ekranlarına eklemeleri için otomatik yükleme uyarısı sunulur."
          ),
        },
        {
          icon: Zap,
          title: loc("تصفح أوفلاين عبر Service Worker", "Full Offline Browsing Capability", "Navigation Hors-Ligne Complète", "Tam Çevrimdışı Gezinme Yeteneği"),
          detail: loc(
            "محرك تخزين مؤقت متطور يحفظ الفنادق والرحلات وتذاكر المسافر ليتمكن من استعراضها حتى عند انقطاع الشبكة.",
            "Advanced service worker caching ensures tickets, vouchers, and previous search results remain accessible offline.",
            "La mise en cache avancée garantit que les billets, bons et recherches restent consultables hors connexion.",
            "Gelişmiş Service Worker önbelleklemesi ile biletler, kuponlar ve önceki aramalar internetsiz de erişilebilir kalır."
          ),
        },
      ],
    },
  ];

  const currentScreen = screens.find((s) => s.id === activeScreen) || screens[0];

  return (
    <section className="relative py-20 bg-slate-50/70 border-t border-slate-200 overflow-hidden" dir={dir}>
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative mx-auto max-w-[1700px] px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Title Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50/90 px-4 py-1.5 text-xs font-bold text-purple-950 shadow-xs">
            <Eye className="h-4 w-4 text-purple-700" />
            <span>
              {pickLocaleText(locale, {
                ar: "استعراض بيئة العمل التفاعلية لمنظومة لوناليزا الشاملة",
                en: "Interactive Operational Tour of Lonaliza Enterprise Ecosystem",
                fr: "Visite Opérationnelle Interactive de l'Écosystème Lonaliza",
                tr: "Lonaliza Kurumsal Ekosistemi Etkileşimli Operasyonel Turu",
              })}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {locale === "ar" ? (
              <>
                تحكم تشغيلي متكامل{" "}
                <span className="bg-gradient-to-r from-[#2e1065] via-[#6b21a8] to-[#b18a52] bg-clip-text text-transparent">
                  لكافة أقسام شركتك السياحية
                </span>
              </>
            ) : locale === "fr" ? (
              <>
                Contrôle Opérationnel Unifié{" "}
                <span className="bg-gradient-to-r from-[#2e1065] via-[#6b21a8] to-[#b18a52] bg-clip-text text-transparent">
                  Sur Tous Vos Modules
                </span>
              </>
            ) : locale === "tr" ? (
              <>
                Entegre Operasyonel Kontrol{" "}
                <span className="bg-gradient-to-r from-[#2e1065] via-[#6b21a8] to-[#b18a52] bg-clip-text text-transparent">
                  Tüm Acente Modüllerinizde
                </span>
              </>
            ) : (
              <>
                Unified Operational Control{" "}
                <span className="bg-gradient-to-r from-[#2e1065] via-[#6b21a8] to-[#b18a52] bg-clip-text text-transparent">
                  Across All Agency Modules
                </span>
              </>
            )}
          </h2>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {pickLocaleText(locale, {
              ar: "تنقل بسلاسة بين وحدات المنظومة: استكشف شاشات المؤشرات اللحظية، المحرر البصري، محرك التوريد بدون ديبوزيت واستيراد الفنادق بالـ AI، غرفة عمليات الذكاء الاصطناعي، أتمتة التيليجرام، حملات البريد، محرك الفواتير وقسائم الفنادق، وحزام الأمان المالي.",
              en: "Switch smoothly between platform engines: explore real-time KPIs, visual builder, zero-deposit Rapid API & AI hotel crawler, autonomous AI war room, Telegram bot command, email drips, dynamic invoice engine, and financial safeguards.",
              fr: "Naviguez facilement entre les modules : explorez les indicateurs en temps réel, l'éditeur visuel, le moteur sans dépôt et crawler d'hôtels IA, la war room d'IA autonome, le bot Telegram, les campagnes e-mail et le coffre-fort financier.",
              tr: "Sistem modülleri arasında kolayca geçiş yapın: anlık KPI'lar, görsel düzenleyici, depozitosuz Rapid API ve yapay zeka otel crawler'ı, otonom yapay zeka operasyon odası, Telegram botu, e-posta pazarlaması ve finansal güvenlik kasasını keşfedin.",
            })}
          </p>
        </div>

        {/* Animated Carousel Tabs Slider with Left/Right Controls */}
        <div className="relative max-w-7xl mx-auto px-2 sm:px-12">
          {/* Previous Slide Arrow */}
          <button
            onClick={() => handleScrollTabs(isRtl ? "right" : "left")}
            className="absolute -start-2 sm:start-2 top-1/2 -translate-y-1/2 z-20 size-10 rounded-2xl bg-white border border-slate-300 shadow-lg text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title={loc("التمرير للسابق", "Scroll Left", "Défiler à gauche", "Sola Kaydır")}
          >
            {isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>

          {/* Next Slide Arrow */}
          <button
            onClick={() => handleScrollTabs(isRtl ? "left" : "right")}
            className="absolute -end-2 sm:end-2 top-1/2 -translate-y-1/2 z-20 size-10 rounded-2xl bg-white border border-slate-300 shadow-lg text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title={loc("التمرير للتالي", "Scroll Right", "Défiler à droite", "Sağa Kaydır")}
          >
            {isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>

          {/* Scrollable Tabs Track */}
          <div
            ref={tabsScrollRef}
            className="flex items-center gap-3 overflow-x-auto py-3 px-2 scrollbar-none scroll-smooth"
          >
            {screens.map((s) => {
              const Icon = s.icon;
              const isSelected = activeScreen === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveScreen(s.id)}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 shrink-0 border select-none ${
                    isSelected
                      ? "bg-white text-purple-950 border-purple-800 shadow-lg shadow-purple-950/10 ring-2 ring-purple-500/20 scale-[1.02]"
                      : "bg-white/90 text-slate-700 border-slate-200 hover:bg-white hover:text-slate-900 hover:border-slate-300"
                  }`}
                >
                  {/* Active Indicator Pulse */}
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-[#b18a52] ring-2 ring-white animate-pulse" />
                  )}

                  <div
                    className={`size-8 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected ? "bg-purple-50 text-purple-900" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="text-start">
                    <div className="font-black text-slate-950 leading-tight">{s.title}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">{s.badge}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Screen Explanation & Interactive Live Container (Grid: Left Details Panel, Right Interactive Window) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Detailed Module Explanation Card (4 cols) */}
          <div className="xl:col-span-4 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl shadow-slate-900/5 space-y-6">
              {/* Header with Module Badge */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-950 text-xs font-black">
                    <currentScreen.icon className="h-3.5 w-3.5 text-purple-700" />
                    <span>{currentScreen.badge}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    MODULE #{screens.findIndex((s) => s.id === currentScreen.id) + 1} OF {screens.length}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-slate-950 tracking-tight leading-tight">
                  {currentScreen.title}
                </h3>

                <p className="text-sm font-semibold text-purple-900 leading-relaxed">
                  {currentScreen.tagline}
                </p>
              </div>

              {/* In-depth Narrative */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                {currentScreen.summary}
              </p>

              {/* 3 Live KPI Tiles for this specific module with strict LTR wrapping for symbols */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {currentScreen.kpis.map((kpi, idx) => (
                  <div key={idx} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-center">
                    <div className="text-[11px] font-bold text-slate-500 truncate">{kpi.label}</div>
                    <div className="text-base sm:text-lg font-black text-slate-900 font-mono mt-0.5">
                      <span dir="ltr" className="inline-block font-mono">{kpi.value}</span>
                    </div>
                    <div className="text-[10px] text-purple-800 font-semibold truncate mt-0.5">{kpi.hint}</div>
                  </div>
                ))}
              </div>

              {/* Key Features Breakdown */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {loc("أبرز الإمكانيات التشغيلية:", "Core Capabilities:", "Capacités Opérationnelles Clés :", "Öne Çıkan Operasyonel Yetenekler:")}
                </div>

                <div className="space-y-3">
                  {currentScreen.features.map((feat, idx) => {
                    const FeatIcon = feat.icon;
                    return (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        <div className="size-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 shrink-0 mt-0.5">
                          <FeatIcon className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs font-black text-slate-950">{feat.title}</div>
                          <div className="text-[11px] text-slate-600 font-medium leading-relaxed">{feat.detail}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Link to Module */}
              <div className="pt-2">
                <a
                  href={currentScreen.iframeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 hover:bg-slate-800 px-5 py-3.5 text-xs font-black text-white shadow-lg shadow-slate-900/10 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>{loc("فتح المعاينة الموسعة في نافذة كاملة", "Launch Expanded Viewport", "Ouvrir la Vue Élargie", "Genişletilmiş Görünümü Aç")}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-300" />
                </a>
              </div>
            </div>
          </div>

          {/* Interactive Live Browser Frame (8 cols) */}
          <div
            className={`xl:col-span-8 transition-all duration-300 ${
              isFullscreen ? "fixed inset-0 z-50 p-4 bg-slate-950/80 backdrop-blur-xl flex flex-col justify-center" : ""
            }`}
          >
            <div
              className={`mx-auto w-full rounded-3xl border border-slate-300 bg-white shadow-2xl shadow-slate-900/10 overflow-hidden flex flex-col transition-all duration-300 ${
                deviceViewport === "desktop"
                  ? "max-w-full"
                  : deviceViewport === "tablet"
                  ? "max-w-2xl"
                  : "max-w-md"
              }`}
            >
              {/* Safari/MacBook Window Bar */}
              <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4 border-b border-slate-800 select-none">
                {/* Left: Window Dots */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-full bg-rose-500 inline-block opacity-90 hover:opacity-100 transition-opacity" />
                    <span className="size-3 rounded-full bg-amber-500 inline-block opacity-90 hover:opacity-100 transition-opacity" />
                    <span className="size-3 rounded-full bg-amber-400 inline-block opacity-90 hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 hidden sm:inline-block ms-2 font-mono">
                    LONALIZA ENTERPRISE OS
                  </span>
                </div>

                {/* Center: Real SSL URL Bar */}
                <div className="flex-1 max-w-xl mx-auto flex items-center justify-center gap-2 rounded-xl bg-slate-800/90 px-4 py-1.5 text-xs font-mono text-slate-300 border border-slate-700 shadow-inner">
                  <Lock className="h-3 w-3 text-amber-400 shrink-0" />
                  <span className="truncate text-[11px] sm:text-xs">{currentScreen.urlPath}</span>
                </div>

                {/* Right: Viewport Controls, Refresh & Fullscreen */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Viewport Switchers */}
                  <div className="hidden md:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                    <button
                      onClick={() => setDeviceViewport("desktop")}
                      className={`p-1.5 rounded-md transition-colors ${
                        deviceViewport === "desktop" ? "bg-slate-700 text-amber-400" : "text-slate-400 hover:text-white"
                      }`}
                      title="Desktop View"
                    >
                      <Monitor className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeviceViewport("tablet")}
                      className={`p-1.5 rounded-md transition-colors ${
                        deviceViewport === "tablet" ? "bg-slate-700 text-amber-400" : "text-slate-400 hover:text-white"
                      }`}
                      title="Tablet View"
                    >
                      <Tablet className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeviceViewport("mobile")}
                      className={`p-1.5 rounded-md transition-colors ${
                        deviceViewport === "mobile" ? "bg-slate-700 text-amber-400" : "text-slate-400 hover:text-white"
                      }`}
                      title="Mobile View"
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Refresh */}
                  <button
                    onClick={handleRefresh}
                    className={`p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all ${
                      isRefreshing ? "animate-spin text-amber-400" : ""
                    }`}
                    title="Reload frame"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </button>

                  {/* Open in Separate Tab */}
                  <a
                    href={currentScreen.iframeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    title="Open live preview in new window"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  {/* Fullscreen Toggle */}
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    title="Toggle Fullscreen"
                  >
                    {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Sub-Header Module Title Strip */}
              <div className="bg-purple-50/80 border-b border-purple-100 px-4 py-2 flex items-center justify-between text-xs text-purple-950">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-purple-700 shrink-0" />
                  <span className="font-bold text-slate-900">{currentScreen.title}</span>
                </div>
                <span className="text-[11px] font-bold text-purple-900 hidden sm:inline-block">
                  {loc("تصفح تفاعلي سلس", "Smooth Interactive Scroll", "Défilement Interactif Fluide", "Akıcı Etkileşimli Gezinme")}
                </span>
              </div>

              {/* REAL IFRAME EMBED */}
              <div className="relative w-full bg-slate-100">
                <iframe
                  key={`${currentScreen.id}-${refreshKey}-${locale}`}
                  ref={iframeRef}
                  src={`${currentScreen.iframeUrl}${currentScreen.iframeUrl.includes("?") ? "&" : "?"}locale=${locale}&lang=${locale}`}
                  title={currentScreen.title}
                  className="w-full h-[640px] sm:h-[740px] lg:h-[820px] border-0 bg-white"
                  loading="eager"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
              </div>

              {/* Browser Frame Bottom Footer Bar */}
              <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-amber-500" />
                  <span>
                    {loc(
                      "أنت تتصفح بيئة العمل المباشرة للوحدة البرمجية المحددة",
                      "You are actively viewing the selected live module sandbox",
                      "Vous visualisez l'environnement actif du module sélectionné",
                      "Seçili canlı modül ortamını görüntülüyorsunuz"
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-semibold text-purple-900">
                  <span>{loc("أداء سحابي فائق", "High Performance Cloud", "Cloud Haute Performance", "Yüksek Performanslı Bulut")}</span>
                  <span className="text-amber-500">•</span>
                  <span>{loc("ترخيص دائم لشركتك", "Permanent Enterprise License", "Licence Entreprise Perpétuelle", "Şirketiniz İçin Kalıcı Lisans")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
