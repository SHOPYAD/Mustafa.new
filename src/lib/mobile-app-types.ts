export type HomeSectionConfig = {
  id: string;
  nameAr: string;
  nameEn: string;
  enabled: boolean;
  order: number;
  badge?: string;
  subtitleAr?: string;
  subtitleEn?: string;
};

export type FlashDealConfig = {
  enabled: boolean;
  titleAr: string;
  titleEn: string;
  discountPercent: number;
  endsAt: string;
  targetRoute: string;
  badgeText: string;
};

export type BottomNavTabConfig = {
  id: string;
  titleAr: string;
  titleEn: string;
  path: string;
  icon: string;
  activeIcon?: string;
  badge?: string;
  badgeText?: string;
  badgeColor?: string;
  enabled: boolean;
  order: number;
};

export type SplashSlideConfig = {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  tagAr: string;
  tagEn: string;
  icon: string;
  badgeColor?: string;
  imageUrl?: string;
  animationType?: "zoom-fade" | "slide-up" | "shimmer-glow" | "cinematic";
  themeStyle?: "royal" | "amber" | "blue" | "emerald";
  enabled: boolean;
  order: number;
};


export type MobileAppStudioSettings = {
  displayName: string;
  displayNameAr: string;
  displayNameEn: string;
  applicationId: string;
  apiBase: string;
  primaryColor: string;
  royalPurple: string;
  amberColor: string;
  pageBg: string;
  logoUrl: string;
  iconUrl: string;
  splashSloganAr: string;
  splashSloganEn: string;
  homeSections: HomeSectionConfig[];
  flashDeal: FlashDealConfig;
  bottomNavTabs?: BottomNavTabConfig[];
  splashSlides?: SplashSlideConfig[];
  bottomNavBg?: string;
  bottomNavActiveColor?: string;
  bottomNavInactiveColor?: string;
  githubRepo: string;
  githubToken?: string;
  githubBranch: string;
  githubWorkflowAndroid: string;
  githubWorkflowIos: string;
  googlePlayUrl?: string;
  appStoreUrl?: string;
  pwaBannerEnabled?: boolean;
};

export type MobileAppBuildStatus = {
  state: "idle" | "queued" | "running" | "succeeded" | "failed";
  stage?: string;
  progress?: number;
  artifact?: string;
  iosArtifact?: string;
  apkSize?: number;
  error?: string;
  logs?: string[];
  startedAt?: string;
  finishedAt?: string;
};

export const DEFAULT_HOME_SECTIONS: HomeSectionConfig[] = [
  { id: "hero_search", nameAr: "الهيدر والبحث الذكي", nameEn: "Hero & AI Search", enabled: true, order: 1 },
  { id: "services_grid", nameAr: "شبكة الخدمات السريعة", nameEn: "Services Grid", enabled: true, order: 2 },
  { id: "flash_deals", nameAr: "بانر الصفقات الخاطفة", nameEn: "Flash Deals Banner", enabled: true, order: 3, badge: "خصم 25%" },
  { id: "flight_deals", nameAr: "سلايدر عروض الطيران الحية", nameEn: "Flight Deals Carousel", enabled: true, order: 4, subtitleAr: "أسعار مباشرة من كبرى الخطوط" },
  { id: "featured_hotels", nameAr: "معرض الفنادق الفاخرة", nameEn: "Luxury Hotels Showcase", enabled: true, order: 5, subtitleAr: "إقامات 5 نجوم وبوسفور" },
  { id: "packages_tours", nameAr: "سلايدر البرامج السياحية", nameEn: "Tour Packages Carousel", enabled: true, order: 6, subtitleAr: "جداول سياحية متكاملة" },
  { id: "featured_cars", nameAr: "سلايدر أسطول السيارات", nameEn: "Car Rentals Highlights", enabled: true, order: 7, subtitleAr: "تأمين شامل واستلام فوري" },
  { id: "trending_reels", nameAr: "فيديوهات الريلز المتصدرة", nameEn: "Trending Reels Slider", enabled: true, order: 8, subtitleAr: "تجارب مسافرين حقيقية" },
  { id: "loyalty_rewards", nameAr: "بانر برنامج الولاء والمحفظة", nameEn: "Loyalty & Wallet Banner", enabled: true, order: 9 },
  { id: "trust_partners", nameAr: "شريط الشركاء وشهادات الثقة", nameEn: "Trust Badges & Partners", enabled: true, order: 10 },
];

export const DEFAULT_FLASH_DEAL: FlashDealConfig = {
  enabled: true,
  titleAr: "صفقة الموسم: خصم 25% على رحلات إسطنبول وطرابزون",
  titleEn: "Seasonal Deal: 25% off Istanbul & Trabzon bookings",
  discountPercent: 25,
  endsAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
  targetRoute: "/flights",
  badgeText: "لفترة محدودة",
};

export const DEFAULT_MORE_TAB: BottomNavTabConfig = {
  id: "tab_more",
  titleAr: "المزيد",
  titleEn: "More",
  path: "/menu",
  icon: "menu",
  enabled: true,
  order: 5,
};

export const DEFAULT_BOTTOM_NAV_TABS: BottomNavTabConfig[] = [
  { id: "tab_home", titleAr: "الرئيسية", titleEn: "Home", path: "/", icon: "home", enabled: true, order: 1 },
  { id: "tab_wallet", titleAr: "المحفظة", titleEn: "Wallet", path: "/account?tab=wallet", icon: "wallet", badge: "كاش باك", enabled: true, order: 2 },
  { id: "tab_reels", titleAr: "السوشيال والريلز", titleEn: "Community", path: "/community", icon: "reels", badge: "بث حي", enabled: true, order: 3 },
  { id: "tab_account", titleAr: "حسابي", titleEn: "Account", path: "/account", icon: "user", enabled: true, order: 4 },
  { ...DEFAULT_MORE_TAB },
];

/** Studio configs saved before the 5th tab still get القائمة / المزيد. */
export function ensureBottomNavTabs(tabs?: BottomNavTabConfig[] | null): BottomNavTabConfig[] {
  const list = Array.isArray(tabs) && tabs.length ? [...tabs] : [...DEFAULT_BOTTOM_NAV_TABS];
  const hasMore = list.some((tab) => {
    const id = String(tab.id || "").toLowerCase();
    const icon = String(tab.icon || "").toLowerCase();
    const path = String(tab.path || "").split("?")[0].replace(/\/+$/, "") || "/";
    return id === "tab_more" || path === "/menu" || icon === "menu" || icon === "more";
  });
  if (hasMore) return list;
  return [...list, { ...DEFAULT_MORE_TAB, order: list.length + 1 }];
}

export const DEFAULT_SPLASH_SLIDES: SplashSlideConfig[] = [
  {
    id: "slide_flights",
    titleAr: "طيران مباشر وتأكيد فوري",
    titleEn: "Live Airline Engine",
    descAr: "ربط مباشر مع أكثر من 500 شركة طيران بأسعار حية ومحدثة لحظياً.",
    descEn: "Direct connection with over 500 airlines with live real-time prices.",
    tagAr: "محرك الطيران الحي",
    tagEn: "Live Airline Engine",
    icon: "plane",
    badgeColor: "#10B981",
    imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
    animationType: "slide-up",
    themeStyle: "royal",
    enabled: true,
    order: 1,
  },
  {
    id: "slide_hotels",
    titleAr: "+2,000,000 فندق وشقة حول العالم",
    titleEn: "Best Price Guarantee",
    descAr: "أفضل أسعار الإقامة الفندقية مع تأكيد فوري وخيارات إلغاء مرنة.",
    descEn: "Unbeatable hotel rates worldwide with flexible cancellation.",
    tagAr: "أفضل سعر مؤكد",
    tagEn: "Best Price Guarantee",
    icon: "hotel",
    badgeColor: "#3B82F6",
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    animationType: "zoom-fade",
    themeStyle: "blue",
    enabled: true,
    order: 2,
  },
  {
    id: "slide_social",
    titleAr: "سوشيال وريلز السفر الحية (Nostr)",
    titleEn: "Decentralized Social",
    descAr: "عش تجربة الوجهة مع ريلز المسافرين الحقيقية قبل انطلاق رحلتك.",
    descEn: "Real traveler video stories and live destination vibes.",
    tagAr: "شبكة سفر لا مركزية",
    tagEn: "Decentralized Social",
    icon: "reels",
    badgeColor: "#EC4899",
    imageUrl: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=800&q=80",
    animationType: "shimmer-glow",
    themeStyle: "amber",
    enabled: true,
    order: 3,
  },
  {
    id: "slide_wallet",
    titleAr: "محفظة كاش باك ومكافآت VIP",
    titleEn: "Instant Cashback",
    descAr: "استرداد نقدي فوري على كل حجز ونقاط مكافآت تضاعف رصيدك.",
    descEn: "Instant cashback on every booking plus VIP reward multipliers.",
    tagAr: "كاش باك فوري",
    tagEn: "Instant Cashback",
    icon: "wallet",
    badgeColor: "#F59E0B",
    imageUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80",
    animationType: "cinematic",
    themeStyle: "emerald",
    enabled: true,
    order: 4,
  },
  {
    id: "slide_ai",
    titleAr: "مساعد الذكاء الاصطناعي 24/7",
    titleEn: "Gemini AI Concierge",
    descAr: "مستشارك السياحي الخاص لتخطيط جدول الرحلة وحجز التذاكر بضغطة زر.",
    descEn: "Personal AI travel concierge planning custom itineraries.",
    tagAr: "مستشار ذكي فوري",
    tagEn: "Gemini AI Concierge",
    icon: "ai",
    badgeColor: "#8B5CF6",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    animationType: "zoom-fade",
    themeStyle: "royal",
    enabled: true,
    order: 5,
  },
];

export const DEFAULT_MOBILE_APP_STUDIO: MobileAppStudioSettings = {
  displayName: "Lonaliza",
  displayNameAr: "لوناليزا",
  displayNameEn: "Lonaliza",
  applicationId: "com.lonaliza.app",
  apiBase: "https://lonaliza.com",
  primaryColor: "#7C3AED",
  royalPurple: "#2E1065",
  amberColor: "#F59E0B",
  pageBg: "#F7F4FC",
  logoUrl: "/logo.png",
  iconUrl: "/logo.png",
  splashSloganAr: "سفر فاخر بأسعار واضحة",
  splashSloganEn: "Luxury Travel at Transparent Prices",
  homeSections: DEFAULT_HOME_SECTIONS,
  flashDeal: DEFAULT_FLASH_DEAL,
  bottomNavTabs: DEFAULT_BOTTOM_NAV_TABS,
  splashSlides: DEFAULT_SPLASH_SLIDES,
  bottomNavBg: "#ffffff",
  bottomNavActiveColor: "#2E1065",
  bottomNavInactiveColor: "#64748B",
  githubRepo: "",
  githubToken: "",
  githubBranch: "main",
  githubWorkflowAndroid: "mobile-android.yml",
  githubWorkflowIos: "mobile-ios.yml",
  googlePlayUrl: "",
  appStoreUrl: "",
  pwaBannerEnabled: true,
};
