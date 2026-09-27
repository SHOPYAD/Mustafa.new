"use client";

import { useState, useRef } from "react";
import {
  Globe2,
  Plane,
  Hotel,
  Share2,
  CreditCard,
  Wallet,
  Sparkles,
  Maximize2,
  Minimize2,
  RotateCw,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  Monitor,
  Tablet,
  Smartphone,
  Zap,
  Award,
  Users,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type PortalTabId =
  | "homepage"
  | "flights"
  | "hotels"
  | "social"
  | "checkout"
  | "customer_portal";

interface PortalTabConfig {
  id: PortalTabId;
  title: string;
  badge: string;
  icon: typeof Globe2;
  urlPath: string;
  iframeUrl: string;
  tagline: string;
  summary: string;
  kpis: Array<{ label: string; value: string; hint: string }>;
  features: Array<{ icon: typeof Sparkles; title: string; detail: string }>;
}

export default function CustomerBookingPortalShowcase() {
  const { dir, locale } = useLocale();
  const isRtl = dir === "rtl";
  const isAr = locale === "ar";

  const loc = (ar: string, en: string, fr?: string, tr?: string) => {
    if (locale === "ar") return ar;
    if (locale === "fr") return fr || en;
    if (locale === "tr") return tr || en;
    return en;
  };

  const [activeTab, setActiveTab] = useState<PortalTabId>("homepage");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [deviceViewport, setDeviceViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [refreshKey, setRefreshKey] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleScrollTabs = (direction: "left" | "right") => {
    if (!tabsScrollRef.current) return;
    const distance = 300;
    const scrollAmount = direction === "left" ? -distance : distance;
    tabsScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const tabs: PortalTabConfig[] = [
    {
      id: "homepage",
      title: loc("بوابة الحجز الرئيسية B2C", "Consumer Portal Homepage", "Portail Principal B2C", "Ana B2C Portalı"),
      badge: loc("الواجهة الأساسية", "Main Front-End", "Interface Principale", "Ana Ön Yüz"),
      icon: Globe2,
      urlPath: "https://your-agency.com/",
      iframeUrl: "/preview/portal/homepage",
      tagline: loc(
        "واجهة فائقة الفخامة تدمج محركات الطيران والفنادق بربط مباشر بدون وسيط.",
        "Ultra-luxury B2C booking interface integrating flight & hotel engines directly.",
        "Interface luxueuse intégrant directement les moteurs de vols et d'hôtels.",
        "Uçuş ve otel motorlarını doğrudan entegre eden lüks rezervasyon arayüzü."
      ),
      summary: loc(
        "واجهة أمامية سريعة البرق مصممة خصيصاً لتحويل الزائر إلى مشترٍ خلال ثوانٍ. تعرض محرك بحث متعدد الوجهات، رحلات الذهاب والعودة، أحدث عروض الفنادق الفاخرة، والتسعير التلقائي بعملات متعددة.",
        "Lightning-fast consumer storefront built to maximize booking conversions with multi-currency support and direct GDS/Hotel inventory.",
        "Vitrine ultra-rapide maximisant les conversions avec support multi-devises et inventaire direct.",
        "Çoklu para birimi ve doğrudan envanter ile rezervasyon dönüşümlerini maksimize eden son derece hızlı vitrin."
      ),
      kpis: [
        { label: loc("سرعة التحميل", "PageSpeed", "Vitesse", "Yükleme Hızı"), value: "0.4s", hint: loc("كود فائق الخفة", "Ultra lightweight", "Ultra léger", "Ultra hafif") },
        { label: loc("محركات مدمجة", "Engines", "Moteurs", "Motorlar"), value: "6 in 1", hint: loc("طيران وفنادق", "Flights & Hotels", "Vols & Hôtels", "Uçuş & Otel") },
        { label: loc("دعم العملات", "Currencies", "Devises", "Para Birimleri"), value: "140+", hint: loc("تسعير لحظي", "Dynamic FX", "Taux en Direct", "Canlı Kur") },
      ],
      features: [
        {
          icon: Zap,
          title: loc("محرك بحث متكامل وسريع", "Integrated Instant Search", "Recherche Instantanée", "Entegre Hızlı Arama"),
          detail: loc(
            "بحث متزامن في أسعار أكثر من 500 شركة طيران عالمية و3 مليون فندق مع فلترة سريعة للنتائج.",
            "Concurrent queries across 500+ airlines and 3M properties with live client filtering.",
            "Requêtes simultanées sur +500 compagnies et 3M d'établissements avec filtres instantanés.",
            "+500 havayolu ve 3M otel arasında anlık filtreleme ile eşzamanlı arama."
          ),
        },
        {
          icon: ShieldCheck,
          title: loc("تجربة مستخدم حصرية تحت هويتك", "White-Label Brand Identity", "Identité de Marque Dédiée", "Özel Marka Kimliği"),
          detail: loc(
            "شعار وكالتك وألوانك الخاصة دون أي إشارة لأي طرف ثالث، مما يمنح عملاءك ثقة مطلقة.",
            "Your custom logo and brand palette with zero third-party platform watermarks.",
            "Votre logo et votre palette de marque sans aucun filigrane tiers.",
            "Üçüncü taraf ibaresi olmadan acentenizin logosu ve özel renkleriyle tam güven."
          ),
        },
      ],
    },
    {
      id: "flights",
      title: loc("نتائج عروض الطيران المباشرة", "Live Flight Search Results", "Résultats Vols en Direct", "Canlı Uçuş Sonuçları"),
      badge: loc("ربط GDS لحظي", "Live GDS Cards", "Cartes GDS", "Canlı GDS"),
      icon: Plane,
      urlPath: "https://your-agency.com/flights/search?origin=RUH&dest=IST",
      iframeUrl: "/preview/portal/flights",
      tagline: loc(
        "بطاقات رحلات مباشرة تفاعلية مع تفاصيل الأمتعة والدرجات وأوقات الترانزيت.",
        "Interactive flight cards with transparent baggage allowances, cabin classes, and stops.",
        "Cartes de vol interactives avec bagages inclus, classes de cabine et escales.",
        "Bagaj hakkı, kabin sınıfları ve aktarma detaylarını gösteren etkileşimli uçuş kartları."
      ),
      summary: loc(
        "شاشة نتائج بحث الطيران تعرض رحلات الخطوط السعودية، التركية، طيران ناس وكافة خطوط IATA في بطاقات واضحة ومقنعة مع استعراض درجات السفر، وسياسة الأمتعة المجانية وعدد المقاعد المتبقية.",
        "Flight results view showcasing Saudia, Turkish Airlines, flynas, and all IATA carriers with transparent fare families and baggage rules.",
        "Vue des vols affichant Saudia, Turkish Airlines, flynas et toutes les compagnies IATA avec tarifs transparents.",
        "Saudia, Türk Hava Yolları, flynas ve tüm IATA taşıyıcılarını şeffaf ücret aileleriyle sunan sonuç ekranı."
      ),
      kpis: [
        { label: loc("تغطية الطيران", "Airlines", "Compagnies", "Havayolları"), value: "+500", hint: loc("GDS عالمي", "Global Reach", "Mondial", "Küresel") },
        { label: loc("زمن جلب الأسعار", "Query Time", "Temps de Réponse", "Sorgu Süresi"), value: "< 280ms", hint: loc("تخزين مؤقت فائق", "Cached Search", "Cache Rapide", "Hızlı Önbellek") },
        { label: loc("تأكيد فوري", "PNR Issuance", "Émission PNR", "PNR Üretimi"), value: "100%", hint: loc("تذكرة إلكترونية", "Automated e-Ticket", "Billet Électronique", "E-Bilet") },
      ],
      features: [
        {
          icon: CheckCircle2,
          title: loc("فلاتر ذكية متقدمة", "Smart Multi-Criteria Filters", "Filtres Multi-Critères", "Gelişmiş Çoklu Filtreler"),
          detail: loc(
            "تصفية فورية حسب وقت الإقلاع، مدة الرحلة، التوقف المباشر، وتفضيلات شركات الطيران.",
            "Instant client-side filtering by departure time, stopovers, baggage, and airline alliances.",
            "Filtrage instantané par heure de départ, escales, bagages et alliances aériennes.",
            "Kalkış saati, aktarma sayısı, bagaj ve havayolu tercihlerine göre anlık filtreleme."
          ),
        },
        {
          icon: Sparkles,
          title: loc("هوامش أرباح ديناميكية مدمجة", "Embedded Dynamic Markup", "Marge Bénéficiaire Intégrée", "Dinamik Kâr Marjı"),
          detail: loc(
            "يتم تطبيق هامش ربحك تلقائياً دون إظهار السعر الصافي للعميل، مع حساب الضرائب بالكامل.",
            "Agency markups are embedded seamlessly into the displayed fare before user viewing.",
            "Les marges de l'agence sont intégrées harmonieusement au tarif affiché.",
            "Acente kâr marjınız son fiyata otomatik eklenir, net maliyet gizli kalır."
          ),
        },
      ],
    },
    {
      id: "hotels",
      title: loc("نتائج الفنادق وفحص الأسعار", "Hotel Catalog & Real-Time Rates", "Catalogue Hôtels & Tarifs", "Otel Kataloğu ve Fiyatlar"),
      badge: loc("مزامنة لحظية", "Autonomous Sync", "Synchro Autonome", "Otonom Senkronizasyon"),
      icon: Hotel,
      urlPath: "https://your-agency.com/hotels/istanbul",
      iframeUrl: "/preview/portal/hotels",
      tagline: loc(
        "بطاقات غرف مفصلة مع فحص دوري للتوافر وتطبيق آلي لهامش أرباح الوكالة.",
        "Detailed room cards with automated inventory checks and dynamic agency markup.",
        "Cartes de chambres détaillées avec vérification des disponibilités et marges d'agence.",
        "Oda kartları, otomatik müsaitlik kontrolü ve acente kâr marjı entegrasyonu."
      ),
      summary: loc(
        "استعراض فاخر للغرف والأجنحة الفندقية المستوردة عبر روابط Booking وAgoda، مع إظهار المزايا (إفطار، إلغاء مجاني) وشارة التحقق اللحظي من السعر الصافي وتطبيق نسبة ربحك (+12%).",
        "Luxury room showcase imported via URLs or BedBanks with live availability checks, amenities breakdown, and automated margin calculations.",
        "Vitrine de chambres de luxe importées via URL ou banques de lits avec vérification en direct des disponibilités.",
        "URL ile içe aktarılan veya yatak bankalarından çekilen lüks odalar ve anlık fiyat kontrolü."
      ),
      kpis: [
        { label: loc("فنادق الكتالوج", "Global Hotels", "Hôtels Monde", "Küresel Oteller"), value: "+3,000,000", hint: loc("شامل الكتالوج الداخلي", "GDS & Bedbanks", "GDS & Banques", "GDS ve Bankalar") },
        { label: loc("دورة المزامنة", "Sync Daemon", "Cycle de Synchro", "Senkronizasyon"), value: loc("كل 15 دقيقة", "Every 15m", "Toutes les 15m", "Her 15 dk"), hint: loc("تحديث الأسعار آلياً", "Autonomous Daemon", "Daemon Autonome", "Otonom Servis") },
        { label: loc("هامش الوكالة", "Markup Yield", "Rendement Marge", "Acente Kârı"), value: "+12%", hint: loc("قابل للتعديل بنقرة", "Configurable", "Configurable", "Ayarlanabilir") },
      ],
      features: [
        {
          icon: ShieldCheck,
          title: loc("فحص الأسعار اللحظي قبل الحجز", "Checkout Price Verification", "Vérification Tarif Direct", "Ödeme Öncesi Fiyat Kontrolü"),
          detail: loc(
            "فحص مباشر للغرفة مع موقع المورد للتأكد من عدم تغير السعر أو نفاد الغرف قبل الدفع.",
            "Live pre-checkout rate validation to prevent supplier price discrepancies.",
            "Validation du tarif en direct pour éviter tout écart de prix du fournisseur.",
            "Ödeme aşamasında tedarikçi fiyatı anlık kontrol edilerek tutarsızlıklar önlenir."
          ),
        },
        {
          icon: Sparkles,
          title: loc("استيراد بالذكاء الاصطناعي", "AI URL Extraction", "Extraction URL par IA", "Yapay Zeka URL Aktarımı"),
          detail: loc(
            "إمكانية استيراد أي فندق فخم برابطه وحفظ كافة الصور عالية الدقة والغرف خلال ثوانٍ.",
            "Crawl and catalog any hotel link in seconds with all photos and amenities intact.",
            "Importez n'importe quel lien d'hôtel en quelques secondes avec photos HD et commodités.",
            "Herhangi bir otel bağlantısını saniyeler içinde tüm HD fotoğrafları ve olanaklarıyla içe aktarın."
          ),
        },
      ],
    },
    {
      id: "social",
      title: loc("مجتمع المسافرين والفيديوهات", "Nostr Traveler Social Feed", "Flux Social Nostr & Vidéos", "Nostr Seyahat Topluluğu"),
      badge: loc("شبكة لا مركزية", "Nostr Community", "Communauté Nostr", "Nostr Topluluğu"),
      icon: Share2,
      urlPath: "https://your-agency.com/social/feed",
      iframeUrl: "/preview/portal/social",
      tagline: loc(
        "شبكة تواصل سياحية لا مركزية لزيادة تفاعل المسافرين وولائهم للمنصة.",
        "Decentralized travel community feed boosting customer retention and engagement.",
        "Réseau social de voyage décentralisé renforçant l'engagement des voyageurs.",
        "Seyahat severlerin etkileşimini ve sadakatini artıran merkeziyetsiz sosyal akış."
      ),
      summary: loc(
        "ميزة حصرية لا تملكها أي وكالة سياحية تقليدية: مجتمع تفاعلي يتيح لعملائك نشر فيديوهات وتجارب حقيقية لرحلاتهم، وكسب نقاط ولاء قابلة للاستبدال، مع إمكانية تمييز حساب إدارة الوكالة بتاج ذهبي رسمي.",
        "Exclusive internal social network powered by Nostr where travelers post video reels and trip reviews while earning redeemable loyalty points under agency admin supervision.",
        "Réseau social exclusif propulsé par Nostr où les voyageurs publient des reels et avis tout en cumulant des points de fidélité.",
        "Gezginlerin video reels paylaştığı, puan kazandığı ve acente yönetiminin taç rozetiyle öne çıktığı özel ağ."
      ),
      kpis: [
        { label: loc("تفاعل العملاء", "Engagement", "Engagement", "Etkileşim"), value: "+340%", hint: loc("زيادة مدة البقاء", "Dwell time boost", "Temps sur site", "Sitede Kalma Süresi") },
        { label: loc("نقاط الولاء", "Reward Points", "Points de Fidélité", "Sadakat Puanları"), value: loc("مكافآت فورية", "Instant Points", "Points Directs", "Anında Puan"), hint: loc("تخصم من الحجز", "Redeemable", "Déductible", "İndirilebilir") },
        { label: loc("شارة الإدارة", "Crown Badge", "Badge Couronne", "Yönetici Rozeti"), value: loc("إدارة الوكالة", "Agency Admin", "Admin Agence", "Acente Yetkilisi"), hint: loc("توثيق رسمي", "Verified Badge", "Badge Vérifié", "Doğrulanmış Rozet") },
      ],
      features: [
        {
          icon: Users,
          title: loc("محتوى يضيفه المسافرون (UGC)", "User-Generated Content Engine", "Contenu Généré par Voyageurs", "Kullanıcı Üretimi İçerik"),
          detail: loc(
            "يبني الثقة الفورية لدى الزوار الجدد من خلال مشاهدة تجارب مصورة لعملاء حقيقيين.",
            "Builds instant trust for prospective travelers with genuine photo/video reviews.",
            "Instaure une confiance immédiate grâce aux retours d'expérience réels en photos et vidéos.",
            "Gerçek seyahat severlerin video ve fotoğraflı değerlendirmeleriyle anında güven oluşturur."
          ),
        },
        {
          icon: Award,
          title: loc("تحفيز الحجز التكراري", "Repeat Booking Incentives", "Incitation au Réachat", "Tekrar Rezervasyon Teşviki"),
          detail: loc(
            "منح نقاط ولاء لكل مسافر ينشر مراجعة أو يشارك رحلته لخصمها من الحجز القادم.",
            "Reward users with points on every post or review to drive frequent repeat trips.",
            "Récompensez chaque avis partagé avec des points valables sur la prochaine réservation.",
            "Her inceleme veya paylaşımda bir sonraki rezervasyonda geçerli puanlar verilir."
          ),
        },
      ],
    },
    {
      id: "checkout",
      title: loc("مسار الدفع وإصدار التذكرة", "3-Step Booking & Ticketing", "Tunnel de Paiement en 3 Étapes", "3 Adımda Rezervasyon ve Ödeme"),
      badge: loc("إصدار فوري", "Instant e-Ticket", "Billet Instantané", "Anında E-Bilet"),
      icon: CreditCard,
      urlPath: "https://your-agency.com/checkout/step-3",
      iframeUrl: "/preview/portal/checkout",
      tagline: loc(
        "قمع حجز ذكي من 3 خطوات مع إصدار فوري لرمز PNR وبطاقة صعود الطائرة.",
        "Frictionless 3-step funnel with instant PNR issuance and downloadable voucher.",
        "Tunnel fluide en 3 étapes avec émission instantanée de PNR et voucher téléchargeable.",
        "Anında PNR üretimi ve indirilebilir kupon sağlayan 3 adımlı hızlı rezervasyon süreci."
      ),
      summary: loc(
        "تجربة دفع فائقة السلاسة تدعم بطاقات مدى والفيزا وماستركارد وتأمين السفر السياحي الإضافي. بمجرد إتمام الدفع، يتم توليد ملف PDF التذكرة وقسيمة الفندق برمز QR رسمي للتحقق.",
        "Streamlined checkout supporting credit cards and Mada with travel insurance add-ons and instant automated PDF voucher issuance with verifiable QR code.",
        "Paiement fluide par carte bancaire avec suppléments d'assurance voyage et génération instantanée de voucher PDF avec code QR.",
        "Kredi kartları ve sanal posları destekleyen, seyahat sigortası ekleyen ve QR kodlu PDF bilet üreten güvenli ekran."
      ),
      kpis: [
        { label: loc("معدل الإكمال", "Checkout Rate", "Taux de Paiement", "Tamamlama Oranı"), value: "94.2%", hint: loc("قمع سريع بدون تعقيد", "Low friction", "Faible friction", "Kolay süreç") },
        { label: loc("إصدار التذكرة", "e-Ticket Latency", "Délai d'Émission", "Bilet Süresi"), value: "< 2s", hint: loc("توليد PDF مباشر", "Instant PDF", "PDF Direct", "Anında PDF") },
        { label: loc("أمان المدفوعات", "Encryption", "Chiffrement", "Şifreleme"), value: "256-bit SSL", hint: loc("بوابة آمنة معتمدة", "Bank-grade", "Niveau Bancaire", "Banka Seviyesi") },
      ],
      features: [
        {
          icon: ShieldCheck,
          title: loc("تأمين السفر والخدمات الإضافية", "Ancillary & Insurance Upsells", "Ventes Additionnelles d'Assurance", "Ek Hizmet ve Sigorta Satışı"),
          detail: loc(
            "زيادة متوسط قيمة الحجز من خلال إضافة التأمين السياحي، اختيار المقاعد، والأمتعة.",
            "Boosts average order value with travel insurance upsells, seat selection, and baggage.",
            "Augmentez le panier moyen avec les assurances voyage, le choix des sièges et les bagages.",
            "Seyahat sigortası, koltuk seçimi ve ek bagaj ile ortalama rezervasyon değerini artırır."
          ),
        },
        {
          icon: CheckCircle2,
          title: loc("تأكيد فوري وتذاكر بـ QR Code", "Instant QR Ticket & Voucher", "Billets QR & Voucher Instantanés", "Anında QR Kodlu Bilet"),
          detail: loc(
            "يحصل العميل فوراً على مرجع الحجز الرسمي وقسيمة الفندق جاهزة للطباعة أو الحفظ في الجوال.",
            "Travelers instantly receive their booking confirmation with downloadable PDF voucher.",
            "Les voyageurs reçoivent immédiatement leur confirmation avec voucher PDF prêt à imprimer.",
            "Müşteri rezervasyon onayını ve yazdırılabilir QR kodlu otel kuponunu anında alır."
          ),
        },
      ],
    },
    {
      id: "customer_portal",
      title: loc("محفظة العميل وبرنامج الإحالة", "Customer Wallet & Affiliate", "Portefeuille Client & Parrainage", "Müşteri Cüzdanı ve Ortaklık"),
      badge: loc("تسويق بالعمولة", "Affiliate & Loyalty", "Fidélité & Parrainage", "Sadakat ve Ortaklık"),
      icon: Wallet,
      urlPath: "https://your-agency.com/customer/portal",
      iframeUrl: "/preview/portal/customer-portal",
      tagline: loc(
        "لوحة تحكم خاصة بكل مسافر لإدارة حجوزاته ورصيد محفظته وأرباح الإحالة.",
        "Dedicated traveler dashboard managing bookings, wallet balance, and referral commissions.",
        "Tableau de bord dédié aux voyageurs pour gérer leurs réservations et solde de parrainage.",
        "Gezginlerin rezervasyonlarını, cüzdan bakiyesini ve referans kazançlarını yönettiği özel panel."
      ),
      summary: loc(
        "بوابة متكاملة لكل مسافر: تتيح له تنزيل تذاكره السابقة، وتتبع رصيد المحفظة النقدية ونقاط الولاء، بالإضافة لرابط إحالة شخصي يكسب منه عمولات نقدية عند دعوة أصدقائه للحجز.",
        "Comprehensive customer area where travelers track trips, download historical tickets, check reward balances, and earn cash commissions via personal referral links.",
        "Espace complet où les voyageurs suivent leurs voyages, téléchargent leurs billets et gagnent des commissions de parrainage.",
        "Müşterilerin geçmiş seyahatleri takip ettiği, bilet indirdiği ve arkadaş davetlerinden nakit komisyon kazandığı kapsamlı alan."
      ),
      kpis: [
        { label: loc("تكرار الشراء", "Retention Boost", "Rétention", "Müşteri Sadakati"), value: "+68%", hint: loc("محفظة الولاء", "Via wallet funds", "Via portefeuille", "Cüzdan bakiyesiyle") },
        { label: loc("نمو الإحالات", "Affiliate Growth", "Croissance Parrainage", "Ortaklık Büyümesi"), value: loc("فيروسي", "Viral loop", "Viral", "Viral"), hint: loc("دعوات الأصدقاء", "Viral loop", "Invitations", "Arkadaş davetleri") },
        { label: loc("تنظيم الفواتير", "Self-Service", "Libre-Service", "Kendi Kendine"), value: "100%", hint: loc("تحميل تلقائي", "Instant receipts", "Factures directes", "Anında makbuz") },
      ],
      features: [
        {
          icon: Wallet,
          title: loc("محفظة رقمية ذكية", "Store Credits & Refund Wallet", "Portefeuille Numérique Intelligent", "Akıllı Dijital Cüzdan"),
          detail: loc(
            "إمكانية إيداع رصيد واستخدامه المباشر في الحجوزات مع ميزة تحويل الأموال واستردادها.",
            "Enables instant booking deductions from wallet balances and simplified refund processing.",
            "Permet le paiement direct par solde de portefeuille et simplifie les remboursements.",
            "Cüzdan bakiyesinden doğrudan rezervasyon yapma ve iade süreçlerini kolaylaştırma imkanı."
          ),
        },
        {
          icon: Award,
          title: loc("محرك التسويق بالعمولة الفيروسي", "Viral Affiliate Referral Engine", "Moteur de Parrainage Viral", "Viral Referans Motoru"),
          detail: loc(
            "يحول كل عميل راضٍ إلى مسوق لوكالتك يشارك رابطه على واتساب ووسائل التواصل الاجتماعي.",
            "Turns satisfied travelers into brand ambassadors sharing personal discount referral links.",
            "Transforme chaque client satisfait en ambassadeur partageant son lien de réduction.",
            "Memnun kalan her müşteriyi WhatsApp ve sosyal medyada link paylaşan bir marka elçisine dönüştürür."
          ),
        },
      ],
    },
  ];

  const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

  const viewportWidthClass =
    deviceViewport === "mobile"
      ? "max-w-[390px] mx-auto border-x-4 border-slate-300 shadow-2xl rounded-3xl overflow-hidden"
      : deviceViewport === "tablet"
      ? "max-w-[768px] mx-auto border-x-4 border-slate-300 shadow-2xl rounded-3xl overflow-hidden"
      : "w-full";

  return (
    <section
      id="customer-portal-showcase"
      className="py-16 sm:py-24 bg-white text-slate-900 relative overflow-hidden border-t border-slate-200"
    >
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-50/80 rounded-full blur-3xl -z-10 opacity-70" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-50/60 rounded-full blur-3xl -z-10 opacity-70" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-950 text-xs font-black shadow-xs">
            <Globe2 className="size-4 text-purple-700" />
            <span>{loc("تجربة المسافر الحقيقية B2C (Live Customer Journey)", "Live Customer Journey & B2C Storefront", "Parcours Client Réel B2C", "Canlı B2C Müşteri Deneyimi")}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight text-balance">
            {loc("شاهد كيف يحجز عملاؤك رحلاتهم من بوابتك السياحية", "Experience What Your Travelers See & Feel", "Découvrez ce que Vos Voyageurs Voient et Ressentent", "Yolcularınızın Seyahatlerini Nasıl Rezerve Ettiğini Görün")}
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed text-balance max-w-2xl mx-auto">
            {loc(
              "تصفح مباشر وكامل لكافة مراحل رحلة العميل من البحث عن الطيران والفنادق وحتى الدفع وإصدار التذكرة ومجتمع المسافرين عبر شاشات حية تفاعلية.",
              "Explore the live end-to-end traveler experience: search results, hotel cards, social feed, frictionless checkout, and loyalty wallet.",
              "Explorez l'expérience voyageur complète : recherche, hôtels, flux social, paiement sécurisé et portefeuille fidélité.",
              "Uçuş ve otel aramasından ödeme, bilet düzenleme ve sadakat cüzdanına kadar tüm müşteri yolculuğunu canlı etkileşimle keşfedin."
            )}
          </p>
        </div>

        {/* Carousel Tabs Strip with Chevrons */}
        <div className="relative max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() => handleScrollTabs("left")}
            aria-label="Scroll tabs left"
            className="absolute -left-4 sm:-left-6 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-white shadow-lg border border-slate-200 text-slate-700 hover:text-purple-700 hover:bg-slate-50 flex items-center justify-center transition-all"
          >
            {isRtl ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
          </button>

          <button
            type="button"
            onClick={() => handleScrollTabs("right")}
            aria-label="Scroll tabs right"
            className="absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 z-20 size-10 rounded-full bg-white shadow-lg border border-slate-200 text-slate-700 hover:text-purple-700 hover:bg-slate-50 flex items-center justify-center transition-all"
          >
            {isRtl ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
          </button>

          <div
            ref={tabsScrollRef}
            className="flex items-center gap-3 overflow-x-auto scrollbar-none py-2 px-2 no-scrollbar scroll-smooth"
          >
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 px-4 py-3 rounded-2xl font-black text-xs flex items-center gap-2.5 transition-all border ${
                    isActive
                      ? "bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-white border-purple-900 shadow-md shadow-purple-950/20 scale-[1.02]"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <TabIcon className={`size-4 ${isActive ? "text-amber-300" : "text-slate-500"}`} />
                  <span>{tab.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? "bg-amber-400/20 text-amber-300 border border-amber-400/30" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live iFrame Interactive Container */}
        <div
          className={`bg-slate-100/90 rounded-3xl border border-slate-300/80 p-3 sm:p-5 shadow-2xl transition-all ${
            isFullscreen ? "fixed inset-0 z-50 rounded-none bg-slate-900/95 p-4 flex flex-col" : ""
          }`}
        >
          {/* Browser Top Window Chrome */}
          <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="size-3 rounded-full bg-rose-400" />
                <div className="size-3 rounded-full bg-amber-400" />
                <div className="size-3 rounded-full bg-purple-400" />
              </div>
              <div className="h-4 w-px bg-slate-200 mx-1" />
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <currentTab.icon className="size-4 text-purple-700" />
                <span className="truncate max-w-[200px] sm:max-w-xs">{currentTab.title}</span>
              </div>
            </div>

            {/* URL Address Bar */}
            <div className="flex-1 max-w-md hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
              <ShieldCheck className="size-3.5 text-purple-700 shrink-0" />
              <span className="truncate">{currentTab.urlPath}</span>
            </div>

            {/* Actions: Viewports, Reload, Fullscreen */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDeviceViewport("desktop")}
                  className={`p-1.5 rounded-lg transition-all ${
                    deviceViewport === "desktop" ? "bg-white text-purple-950 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceViewport("tablet")}
                  className={`p-1.5 rounded-lg transition-all ${
                    deviceViewport === "tablet" ? "bg-white text-purple-950 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Tablet View"
                >
                  <Tablet className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceViewport("mobile")}
                  className={`p-1.5 rounded-lg transition-all ${
                    deviceViewport === "mobile" ? "bg-white text-purple-950 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="size-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
                title={loc("إعادة تحميل المعاينة", "Reload Preview", "Recharger l'Aperçu", "Önizlemeyi Yenile")}
              >
                <RotateCw className={`size-3.5 ${isRefreshing ? "animate-spin text-purple-700" : ""}`} />
              </button>

              <a
                href={currentTab.iframeUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
                title={loc("فتح في تبويب مستقل", "Open in New Tab", "Ouvrir dans un Nouvel Onglet", "Yeni Sekmede Aç")}
              >
                <ExternalLink className="size-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
                title={isFullscreen ? loc("تصغير", "Exit Fullscreen", "Quitter Plein Écran", "Tam Ekrandan Çık") : loc("ملء الشاشة", "Fullscreen", "Plein Écran", "Tam Ekran")}
              >
                {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
              </button>
            </div>
          </div>

          {/* iFrame Wrapper */}
          <div className={`transition-all duration-300 ${viewportWidthClass} ${isFullscreen ? "flex-1 min-h-0" : ""}`}>
            <div className="relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-inner min-h-[640px] sm:min-h-[720px] flex flex-col">
              <iframe
                key={`${currentTab.id}-${refreshKey}-${locale}`}
                src={`${currentTab.iframeUrl}${currentTab.iframeUrl.includes("?") ? "&" : "?"}locale=${locale}&lang=${locale}`}
                title={currentTab.title}
                className="w-full flex-1 border-0 min-h-[640px] sm:min-h-[720px]"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Feature & KPI Deep Dive Card */}
        <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900">{currentTab.title}</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-950 font-bold text-xs">
                  {currentTab.badge}
                </span>
              </div>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-3xl">
                {currentTab.summary}
              </p>
            </div>

            {/* KPI Metrics */}
            <div className="grid grid-cols-3 gap-3 shrink-0">
              {currentTab.kpis.map((kpi, idx) => (
                <div key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-200/70 text-center shadow-2xs">
                  <div className="text-base sm:text-lg font-black text-purple-800">{kpi.value}</div>
                  <div className="text-[11px] font-bold text-slate-800">{kpi.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{kpi.hint}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200/60">
            {currentTab.features.map((feat, idx) => {
              const FeatIcon = feat.icon;
              return (
                <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-2xs">
                  <div className="size-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
                    <FeatIcon className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">{feat.title}</h4>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{feat.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
