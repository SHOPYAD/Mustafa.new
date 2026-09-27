import type { Locale } from "@/lib/i18n/types";

export type LandingLocale = "ar" | "en" | "fr" | "tr";

export function getLandingLocale(locale: string): LandingLocale {
  if (locale === "ar" || locale === "en" || locale === "fr" || locale === "tr") {
    return locale;
  }
  return "en";
}

export function pickLocaleText(
  locale: string,
  texts: { ar: string; en: string; fr?: string; tr?: string }
): string {
  if (locale === "ar") return texts.ar;
  if (locale === "fr") return texts.fr || texts.en;
  if (locale === "tr") return texts.tr || texts.en;
  return texts.en;
}

export const LANDING_TRANSLATIONS = {
  ar: {
    nav: {
      demo: "لوحة القيادة",
      portal: "رحلة العميل B2C",
      engines: "محركات الحجز الـ 6",
      aiSwarm: "الذكاء الاصطناعي",
      builder: "المحرر البصري",
      pricing: "التسعير والترخيص",
      liveDemoBtn: "الديمو الحي",
      partnerPortalBtn: "بوابة الشركات والترخيص",
      menuToggle: "القائمة",
    },
    hero: {
      trustBadge: "منظومة لوناليزا — نظام التشغيل السياحي الذكي المتكامل للشركات 2026",
      headlineStart: "امتلك منصتك السياحية مع",
      headlineEnd: "بترخيص دائم وملكية حصرية 100%",
      subheadline: "منظومة تشغيل سياحية ذكية ومتكاملة تجمع محركات الطيران، الفنادق، النقل، والجولات السياحية مع سرب متطور من وكلاء الذكاء الاصطناعي ومحرر بصري فوري، مصممة لتحقيق أقصى ربحية لشركتك دون عمولات وسيطة.",
      lifetimePriceBadge: "عرض الترخيص الدائم",
      viewDemoBtn: "شاهد لوحة التحكم الحية",
      getLicenseBtn: "احجز نسختك المؤسسية الآن",
      metrics: {
        activeAgencies: "+140 شركة سياحة",
        uptime: "99.98% جاهزية",
        zeroCommission: "0% عمولات وسيطة",
        instantDeployment: "تسليم سحابي فوري",
      },
      rotating: [
        { text: "طيران GDS متصل بـ +500 شركة عالمية", highlight: "GDS Live" },
        { text: "+3,000,000 فندق وبنك غرف حول العالم", highlight: "Hotels Engine" },
        { text: "استيراد الفنادق بالذكاء الاصطناعي برابط فوري", highlight: "AI Crawler" },
        { text: "محرك Rapid API بدون ديبوزيت وبـ $10 فقط", highlight: "Zero Deposit" },
        { text: "أتمتة الأوامر والحجوزات عبر بوت التيليجرام 24/7", highlight: "Telegram Bot" },
        { text: "سرب 6 وكلاء ذكاء اصطناعي مستقلين", highlight: "AI Swarm" },
        { text: "نظام ترافلبايوتس المتكامل للربح بالعمولة 100%", highlight: "Affiliate Suite" },
        { text: "محرر بصري فوري بالسحب والإفلات وتخصيص الهوية", highlight: "Live CMS" },
      ],
    },
    statsTicker: {
      metrics: [
        { label: "محركات حجز موحدة", value: "6 محركات", hint: "طيران، فنادق، سيارات، مواصلات، جولات، وفيزا" },
        { label: "وكلاء ذكاء اصطناعي مستقلين", value: "6 وكلاء", hint: "إدارة، دعم، تسعير، تسويق، ومراقبة" },
        { label: "فنادق حول العالم", value: "+3,000,000", hint: "ربط فوري بأكبر بنوك الأسِرّة" },
        { label: "شركات طيران عالمية", value: "+500 شركة", hint: "GDS مباشر وترافلبايوتس" },
        { label: "وفورات العمولات للشركات", value: "100%", hint: "أرباحك مباشرة في حسابك البنكي" },
      ],
    },
    dashboard: {
      badge: "معاينة حية وتفاعلية",
      title: "لوحة التحكم التنفيذية الشاملة",
      desc: "تحكم في كل مفاصل شركتك السياحية من واجهة واحدة متكاملة وسلسة تجمع التحليلات اللحظية، الحجوزات، المحركات، والتحكم بالهوية.",
      viewports: {
        desktop: "شاشة مكتبية",
        tablet: "جهاز لوحي",
        mobile: "هاتف ذكي",
      },
      fullscreen: "ملء الشاشة",
      exitFullscreen: "إنهاء ملء الشاشة",
      openDirectly: "فتح في نافذة مستقلة",
    },
    portalShowcase: {
      badge: "واجهة العميل B2C",
      title: "تجربة حجز استثنائية وسلسة تضاعف تحويلاتك",
      desc: "متجر سياحي فائق السرعة والأناقة مصمم لتحويل الزوار إلى حجوزات مؤكدة خلال ثوانٍ معدودة.",
      tabs: {
        homepage: "بوابة الحجز الرئيسية",
        flights: "محرك بحث الطيران",
        hotels: "محرك حجز الفنادق",
        social: "مجتمع السفر والريلز",
        checkout: "صفحة الدفع الآمن",
        customerPortal: "بوابة العميل وإدارة الحجوزات",
      },
    },
    aiSwarm: {
      badge: "سرب الذكاء الاصطناعي المستقل",
      title: "6 وكلاء ذكاء اصطناعي يديرون عملياتك على مدار الساعة",
      desc: "لا حاجة لتوظيف فريق ضخم؛ سرب الذكاء الاصطناعي يتولى التسعير الديناميكي، خدمة العملاء عبر واتساب وتيليجرام، صياغة المحتوى، ومراقبة المخزون ذاتياً.",
      botCta: "جرّب بوت الأوامر الذكي الآن",
    },
    engines: {
      badge: "المنظومة السداسية",
      title: "6 محركات حجز متكاملة في نظام واحد",
      desc: "طيران، فنادق، برامج سياحية، مواصلات خاصة، تأجير سيارات، وخدمات التأشيرات. لا وسيط ولا برمجيات متعددة.",
      marginTitle: "محاكي هوامش الربح الذكي",
      marginDesc: "حدد نسب وهوامش ربحك بحرية تامة على مستوى المورد أو الوجهة أو فئة الخدمة.",
    },
    visualBuilder: {
      badge: "المحرر البصري الفوري",
      title: "صمم صفحاتك وهويتك بالسحب والإفلات بدون كود",
      desc: "تحكم كامل في الألوان، الخطوط، التخطيط، والكتل البصرية مباشرة على الشاشة مع معاينة حية لحظية.",
    },
    pricing: {
      badge: "استثمار لمرة واحدة مدى الحياة",
      title: "امتلك نظامك السياحي للأبد بدون اشتراكات شهرية متكررة",
      desc: "احصل على السورس كود، التثبيت على سيرفرك الخاص، رخصة الدومين المشفرة، والدعم الفني المباشر.",
      lifetime: "ترخيص دائم مدى الحياة",
      saveYearly: "توفر أكثر من $12,000 سنوياً مقارنة بأنظمة الاشتراكات الشهرية",
      buyNow: "تواصل لشراء الترخيص والتركيب الفوري",
      includedTitle: "ما الذي ستحصل عليه فوراً:",
    },
    faq: {
      badge: "شفافية مطلقة",
      title: "الأسئلة الشائعة حول المنظومة والترخيص",
      desc: "كل ما تحتاج معرفته عن الملكية، السيرفرات، بوابات الدفع، والتحديثات.",
    },
    footer: {
      brandDesc: "لوناليزا — نظام التشغيل السياحي المؤسسي الرائد للشركات والوكالات السياحية في 2026.",
      rights: "جميع الحقوق محفوظة © 2026 لوناليزا لتكنولوجيا السياحة.",
      contactSupport: "الدعم الفني والترخيص المباشر",
    },
  },

  en: {
    nav: {
      demo: "Dashboard",
      portal: "B2C Portal",
      engines: "6 Engines",
      aiSwarm: "AI Swarm",
      builder: "Visual Builder",
      pricing: "Pricing",
      liveDemoBtn: "Live Demo",
      partnerPortalBtn: "Partner Portal",
      menuToggle: "Menu",
    },
    hero: {
      trustBadge: "Lonaliza Platform — Enterprise Smart Tourism Operating System 2026",
      headlineStart: "Own Your Enterprise Travel Platform with",
      headlineEnd: "Lifetime License & 100% Data Sovereignty",
      subheadline: "A next-generation enterprise travel operating system uniting Flights, Hotels, Transfers, Tours, and Visa engines with an autonomous AI Swarm and live Visual Builder. Zero middle-man commissions.",
      lifetimePriceBadge: "Exclusive Lifetime Offer",
      viewDemoBtn: "Explore Live Dashboard",
      getLicenseBtn: "Secure Your Enterprise License",
      metrics: {
        activeAgencies: "+140 Travel Agencies",
        uptime: "99.98% Uptime SLA",
        zeroCommission: "0% Middle-man Fee",
        instantDeployment: "Instant Cloud Delivery",
      },
      rotating: [
        { text: "GDS Flights Synced with +500 Global Airlines", highlight: "GDS Live" },
        { text: "+3,000,000 Worldwide Hotels & Bed Banks", highlight: "Hotels Engine" },
        { text: "Instant AI Hotel URL Importer & Matcher", highlight: "AI Crawler" },
        { text: "Zero-Deposit Rapid API Engine ($10/mo)", highlight: "Zero Deposit" },
        { text: "24/7 Autonomous Telegram Order & Command Bot", highlight: "Telegram Bot" },
        { text: "6 Autonomous Independent AI Agents Swarm", highlight: "AI Swarm" },
        { text: "100% Commission Travelpayouts Affiliate Suite", highlight: "Affiliate Suite" },
        { text: "Live Drag & Drop Page Builder & Brand Studio", highlight: "Live CMS" },
      ],
    },
    statsTicker: {
      metrics: [
        { label: "Unified Booking Engines", value: "6 Engines", hint: "Flights, Hotels, Cars, Transfers, Tours & Visa" },
        { label: "Autonomous AI Agents", value: "6 Agents", hint: "Management, Support, Pricing, Marketing & Ops" },
        { label: "Worldwide Accommodations", value: "+3,000,000", hint: "Direct connections to premier bed banks" },
        { label: "Global Airlines", value: "+500 Airlines", hint: "Direct GDS & affiliate feeds" },
        { label: "Agency Commission Savings", value: "100%", hint: "Direct payouts into your bank account" },
      ],
    },
    dashboard: {
      badge: "Interactive Live Preview",
      title: "Executive Master Control Panel",
      desc: "Manage every department of your travel enterprise from a unified, high-performance interface with real-time analytics, booking logs, and brand token management.",
      viewports: {
        desktop: "Desktop View",
        tablet: "Tablet View",
        mobile: "Smartphone View",
      },
      fullscreen: "Fullscreen Mode",
      exitFullscreen: "Exit Fullscreen",
      openDirectly: "Open in Dedicated Tab",
    },
    portalShowcase: {
      badge: "Consumer B2C Storefront",
      title: "An Exceptional Booking Journey That Multiplies Conversions",
      desc: "Ultra-fast, luxury customer storefront engineered to convert incoming visitors into confirmed paid bookings within seconds.",
      tabs: {
        homepage: "Main B2C Portal",
        flights: "Flight Search Engine",
        hotels: "Hotel Booking Engine",
        social: "Travel Community & Reels",
        checkout: "Secure Checkout",
        customerPortal: "Customer Hub & Bookings",
      },
    },
    aiSwarm: {
      badge: "Autonomous AI Swarm",
      title: "6 Specialized AI Agents Running Operations 24/7",
      desc: "Eliminate the overhead of large manual teams. Our autonomous AI Swarm takes care of dynamic pricing, automated WhatsApp & Telegram support, multi-language SEO copy, and inventory health.",
      botCta: "Test Autonomous Telegram Bot",
    },
    engines: {
      badge: "6-in-1 Architecture",
      title: "6 Unified Booking Engines Under One Roof",
      desc: "Flights, Hotels, Holiday Packages, VIP Transfers, Car Rental, and Visa Processing. Zero third-party intermediaries.",
      marginTitle: "Smart Dynamic Margin Simulator",
      marginDesc: "Configure custom profit margins freely by supplier, destination, or service category.",
    },
    visualBuilder: {
      badge: "Real Drag & Drop Builder",
      title: "Design Your Pages & Brand Identity with Zero Code",
      desc: "Total freedom over colors, typography, layout blocks, and navigation with real-time live preview.",
    },
    pricing: {
      badge: "One-Time Lifetime Investment",
      title: "Own Your Travel OS Forever with Zero Monthly Fees",
      desc: "Full source code, dedicated server setup, encrypted single-domain license, and continuous engineering support.",
      lifetime: "Lifetime Enterprise License",
      saveYearly: "Save over $12,000 annually compared to recurring SaaS travel platforms",
      buyNow: "Contact Us for License & Setup",
      includedTitle: "What you get immediately:",
    },
    faq: {
      badge: "Absolute Transparency",
      title: "Frequently Asked Questions",
      desc: "Everything you need to know regarding licensing, server ownership, payment processors, and updates.",
    },
    footer: {
      brandDesc: "Lonaliza — The premier enterprise travel operating system for travel agencies in 2026.",
      rights: "All rights reserved © 2026 Lonaliza Travel Technologies.",
      contactSupport: "Enterprise Support & Direct Licensing",
    },
  },

  fr: {
    nav: {
      demo: "Tableau de Bord",
      portal: "Portail B2C",
      engines: "6 Moteurs",
      aiSwarm: "Essaim IA",
      builder: "Éditeur Visuel",
      pricing: "Tarifs & Licence",
      liveDemoBtn: "Démo en Direct",
      partnerPortalBtn: "Portail Partenaires",
      menuToggle: "Menu",
    },
    hero: {
      trustBadge: "Plateforme Lonaliza — Système d'Exploitation Touristique Intelligent 2026",
      headlineStart: "Possédez Votre Plateforme de Voyage avec",
      headlineEnd: "Licence à Vie & Souveraineté Totale des Données",
      subheadline: "Un système d'exploitation touristique d'entreprise unifiant les vols, hôtels, transferts, forfaits et visas avec un essaim d'agents IA autonomes et un éditeur visuel en direct. Zéro commission intermédiaire.",
      lifetimePriceBadge: "Offre Exclusive à Vie",
      viewDemoBtn: "Explorer le Tableau de Bord",
      getLicenseBtn: "Obtenir Votre Licence Entreprise",
      metrics: {
        activeAgencies: "+140 Agences de Voyage",
        uptime: "99.98% Disponibilité SLA",
        zeroCommission: "0% Commission Intermédiaire",
        instantDeployment: "Livraison Cloud Immédiate",
      },
      rotating: [
        { text: "Vols GDS Synchronisés avec +500 Compagnies Aériennes", highlight: "GDS en Direct" },
        { text: "+3 000 000 d'Hôtels & Banques de Lits Mondiales", highlight: "Moteur Hôtels" },
        { text: "Importateur d'URL d'Hôtels par IA Instantané", highlight: "Crawler IA" },
        { text: "Moteur Rapid API Sans Dépôt ($10/mois)", highlight: "Zéro Dépôt" },
        { text: "Automatisation Commandes Telegram 24/7", highlight: "Bot Telegram" },
        { text: "Essaim de 6 Agents IA Indépendants et Autonomes", highlight: "Essaim IA" },
        { text: "Suite d'Affiliation Travelpayouts 100% Commissions", highlight: "Affiliation" },
        { text: "Éditeur Visuel en Glisser-Déposer & Studio de Marque", highlight: "CMS en Direct" },
      ],
    },
    statsTicker: {
      metrics: [
        { label: "Moteurs de Réservation Unifiés", value: "6 Moteurs", hint: "Vols, Hôtels, Voitures, Transferts, Séjours & Visas" },
        { label: "Agents IA Autonomes", value: "6 Agents", hint: "Direction, Support, Tarification, Marketing & Ops" },
        { label: "Hébergements dans le Monde", value: "+3 000 000", hint: "Connexions directes aux principales banques de lits" },
        { label: "Compagnies Aériennes", value: "+500 Compagnies", hint: "Flux GDS directs et affiliation" },
        { label: "Économies sur les Commissions", value: "100%", hint: "Paiements directs sur votre compte bancaire" },
      ],
    },
    dashboard: {
      badge: "Aperçu Interactif en Direct",
      title: "Panneau de Contrôle Exécutif Maître",
      desc: "Gérez chaque division de votre entreprise de voyage depuis une interface fluide avec analyses en temps réel et gestion centralisée des styles de marque.",
      viewports: {
        desktop: "Vue Ordinateur",
        tablet: "Vue Tablette",
        mobile: "Vue Smartphone",
      },
      fullscreen: "Plein Écran",
      exitFullscreen: "Quitter le Plein Écran",
      openDirectly: "Ouvrir dans un Nouvel Onglet",
    },
    portalShowcase: {
      badge: "Vitrine B2C Grand Public",
      title: "Un Parcours de Réservation Exceptionnel Multipliant les Conversions",
      desc: "Une vitrine de voyage ultra-rapide et luxueuse conçue pour convertir les visiteurs en réservations confirmées en quelques secondes.",
      tabs: {
        homepage: "Portail Principal B2C",
        flights: "Moteur de Recherche Vols",
        hotels: "Moteur de Réservation Hôtels",
        social: "Communauté de Voyage & Reels",
        checkout: "Paiement Sécurisé",
        customerPortal: "Espace Client & Réservations",
      },
    },
    aiSwarm: {
      badge: "Essaim d'Agents IA Autonome",
      title: "6 Agents IA Spécialisés Dirigeant Vos Opérations 24/7",
      desc: "Éliminez les coûts d'une main-d'œuvre manuelle pléthorique. Notre essaim d'agents IA gère la tarification dynamique, le support WhatsApp & Telegram automatisé, et la rédaction SEO multilingue.",
      botCta: "Tester le Bot Telegram Intelligent",
    },
    engines: {
      badge: "Architecture 6-en-1",
      title: "6 Moteurs de Réservation Unifiés sur une Seule Plateforme",
      desc: "Vols, Hôtels, Forfaits Vacances, Transferts VIP, Location de Voitures et Visas. Aucun intermédiaire tiers.",
      marginTitle: "Simulateur Dynamique de Marges Bénéficiaires",
      marginDesc: "Définissez librement vos marges par fournisseur, destination ou catégorie de service.",
    },
    visualBuilder: {
      badge: "Véritable Studio Visuel",
      title: "Concevez Vos Pages et Votre Marque Sans Aucune Ligne de Code",
      desc: "Liberté absolue sur les couleurs, les polices, les blocs d'agencement avec aperçu direct et réactif.",
    },
    pricing: {
      badge: "Investissement Unique à Vie",
      title: "Possédez Votre Système Touristique pour Toujours Sans Abonnement",
      desc: "Code source complet, installation sur votre propre serveur, licence de domaine chiffrée et support dédié.",
      lifetime: "Licence Entreprise à Vie",
      saveYearly: "Économisez plus de 12 000 $ par an par rapport aux plateformes SaaS récurrentes",
      buyNow: "Nous Contacter pour la Licence et l'Installation",
      includedTitle: "Ce que vous recevez immédiatement :",
    },
    faq: {
      badge: "Transparence Totale",
      title: "Foire Aux Questions",
      desc: "Tout ce que vous devez savoir sur la propriété, les serveurs, les passerelles de paiement et les mises à jour.",
    },
    footer: {
      brandDesc: "Lonaliza — Le système d'exploitation touristique de référence pour les agences de voyage en 2026.",
      rights: "Tous droits réservés © 2026 Lonaliza Travel Technologies.",
      contactSupport: "Support Entreprise & Licence Directe",
    },
  },

  tr: {
    nav: {
      demo: "Yönetim",
      portal: "B2C Portal",
      engines: "6 Motor",
      aiSwarm: "Yapay Zeka",
      builder: "Tasarımcı",
      pricing: "Fiyatlar",
      liveDemoBtn: "Canlı Demo",
      partnerPortalBtn: "Acente Portalı",
      menuToggle: "Menü",
    },
    hero: {
      trustBadge: "Lonaliza Platformu — 2026 Akıllı Entegre Turizm İşletim Sistemi",
      headlineStart: "Turizm Platformunuza Sahip Olun",
      headlineEnd: "Ömür Boyu Lisans ve %100 Veri Hakimiyeti ile",
      subheadline: "Uçak bileti, otel, VIP transfer, tur paketleri ve vize motorlarını otonom yapay zeka sürüsü ve anlık görsel sayfa düzenleyiciyle birleştiren kurumsal turizm işletim sistemi. Aracı komisyonu yok.",
      lifetimePriceBadge: "Ömür Boyu Özel Teklif",
      viewDemoBtn: "Canlı Paneli İnceleyin",
      getLicenseBtn: "Kurumsal Lisansınızı Alın",
      metrics: {
        activeAgencies: "+140 Seyahat Acentesi",
        uptime: "%99.98 Kesintisiz Çalışma",
        zeroCommission: "%0 Aracı Komisyonu",
        instantDeployment: "Anında Bulut Kurulumu",
      },
      rotating: [
        { text: "+500 Küresel Havayolu ile Canlı GDS Uçuşları", highlight: "Canlı GDS" },
        { text: "Dünya Çapında +3.000.000 Otel ve Yatak Bankası", highlight: "Otel Motoru" },
        { text: "Yapay Zeka ile Anında Otel URL Aktarımı", highlight: "AI Tarayıcı" },
        { text: "Depozitosuz Rapid API Motoru (Ayda Sadece $10)", highlight: "Sıfır Depozito" },
        { text: "7/24 Otonom Telegram Sipariş ve Komut Botu", highlight: "Telegram Botu" },
        { text: "6 Bağımsız Otonom Yapay Zeka Ajanı Sürüsü", highlight: "AI Sürüsü" },
        { text: "%100 Komisyonlu Travelpayouts Satış Ortaklığı", highlight: "Ortaklık Paketi" },
        { text: "Sürükle-Bırak Sayfa Düzenleyici & Marka Stüdyosu", highlight: "Canlı CMS" },
      ],
    },
    statsTicker: {
      metrics: [
        { label: "Entegre Rezervasyon Motoru", value: "6 Motor", hint: "Uçuş, Otel, Araç, Transfer, Tur ve Vize" },
        { label: "Otonom Yapay Zeka Ajanı", value: "6 Ajan", hint: "Yönetim, Destek, Fiyatlandırma, Pazarlama ve Operasyon" },
        { label: "Dünya Genelinde Otel", value: "+3.000.000", hint: "Önde gelen yatak bankalarına doğrudan bağlantı" },
        { label: "Küresel Havayolu", value: "+500 Şirket", hint: "Doğrudan GDS ve affiliate akışları" },
        { label: "Acente Komisyon Kazancı", value: "%100", hint: "Doğrudan banka hesabınıza net kazanç" },
      ],
    },
    dashboard: {
      badge: "Etkileşimli Canlı Önizleme",
      title: "Kapsamlı Yönetici Ana Kontrol Paneli",
      desc: "Turizm acentenizin tüm operasyonlarını, gerçek zamanlı analitikleri, rezervasyon kayıtlarını ve marka kimliğini tek bir arayüzden yönetin.",
      viewports: {
        desktop: "Masaüstü Görünüm",
        tablet: "Tablet Görünüm",
        mobile: "Mobil Görünüm",
      },
      fullscreen: "Tam Ekran",
      exitFullscreen: "Tam Ekrandan Çık",
      openDirectly: "Yeni Sekmede Aç",
    },
    portalShowcase: {
      badge: "B2C Müşteri Vitrini",
      title: "Dönüşümleri Katlayan Eşsiz ve Hızlı Bir Rezervasyon Deneyimi",
      desc: "Ziyaretçileri saniyeler içinde onaylı ve ödenmiş rezervasyonlara dönüştürmek için tasarlanmış ultra hızlı, lüks müşteri vitrini.",
      tabs: {
        homepage: "Ana B2C Portalı",
        flights: "Uçuş Arama Motoru",
        hotels: "Otel Rezervasyon Motoru",
        social: "Seyahat Topluluğu ve Reels",
        checkout: "Güvenli Ödeme Ekranı",
        customerPortal: "Müşteri Yönetim Merkezi",
      },
    },
    aiSwarm: {
      badge: "Otonom Yapay Zeka Sürüsü",
      title: "Operasyonlarınızı 7/24 Yöneten 6 Uzman Yapay Zeka Ajanı",
      desc: "Geniş ekipler istihdam etme zahmetini ortadan kaldırın. Yapay zeka sürümüz dinamik fiyatlandırmayı, otomatik WhatsApp ve Telegram desteğini, çok dilli SEO içeriklerini kendi yönetir.",
      botCta: "Akıllı Telegram Botunu Deneyin",
    },
    engines: {
      badge: "6'sı 1 Arada Mimari",
      title: "Tek Çatı Altında 6 Entegre Rezervasyon Motoru",
      desc: "Uçuş, Otel, Tatil Paketleri, VIP Transfer, Araç Kiralama ve Vize İşlemleri. Aracı yok, karmaşa yok.",
      marginTitle: "Akıllı Dinamik Kâr Marjı Simülatörü",
      marginDesc: "Tedarikçi, rota veya hizmet kategorisi bazında kâr marjlarınızı dilediğiniz gibi belirleyin.",
    },
    visualBuilder: {
      badge: "Görsel Sürükle-Bırak Düzenleyici",
      title: "Sayfalarınızı ve Markanızı Kod Yazmadan Tasarlayın",
      desc: "Renkler, yazı tipleri ve sayfa blokları üzerinde anlık canlı önizleme ile tam kontrol.",
    },
    pricing: {
      badge: "Tek Seferlik Ömür Boyu Yatırım",
      title: "Aylık Sabit Ücret Ödemeden Kendi Turizm Sisteminize Sahip Olun",
      desc: "Tam kaynak kodu, kendi sunucunuza kurulum, şifreli tek alan adı lisansı ve doğrudan mühendislik desteği.",
      lifetime: "Ömür Boyu Kurumsal Lisans",
      saveYearly: "Aylık SaaS platformlarına kıyasla yılda 12.000$'dan fazla tasarruf edin",
      buyNow: "Lisans ve Kurulum İçin İletişime Geçin",
      includedTitle: "Anında sahip olacaklarınız:",
    },
    faq: {
      badge: "Tam Şeffaflık",
      title: "Sıkça Sorulan Sorular",
      desc: "Mülkiyet, sunucular, ödeme ağ geçitleri ve güncellemeler hakkında bilmeniz gereken her şey.",
    },
    footer: {
      brandDesc: "Lonaliza — 2026'da seyahat acenteleri için lider kurumsal turizm işletim sistemi.",
      rights: "Tüm hakları saklıdır © 2026 Lonaliza Seyahat Teknolojileri.",
      contactSupport: "Kurumsal Destek ve Doğrudan Lisanslama",
    },
  },
} as const;
