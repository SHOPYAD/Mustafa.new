export const HOMEPAGE_SECTION_KEYS = [
  "hero",
  "search",
  "destinations",
  "flashDeals",
  "extraSections",
  "stats",
  "features",
  "visa",
  "packages",
  "hotels",
  "flightDeals",
  "carRentalDeals",
  "transferOffers",
  "vipDailyTours",
  "testimonials",
  "trust",
  "partners",
  "blog",
  "cta",
] as const;

export type HomepageSectionKey = (typeof HOMEPAGE_SECTION_KEYS)[number];

export type BrandColors = {
  primary: string;
  secondary: string;
  accent: string;
  header: string;
  footer: string;
  button: string;
  /** Empty keeps the default WhatsApp green */
  whatsapp: string;
};

export type BrandingHeroSlide = {
  id: string;
  nameAr: string;
  nameEn: string;
  nameTr: string;
  taglineAr: string;
  taglineEn: string;
  taglineTr: string;
  image: string;
  price: number;
  currencyLabel: string;
  durationAr: string;
  durationEn: string;
  durationTr: string;
  rating: number;
  badgeAr: string;
  badgeEn: string;
  badgeTr: string;
  inclusiveAr: string;
  inclusiveEn: string;
  inclusiveTr: string;
  ctaLabelAr: string;
  ctaLabelEn: string;
  ctaLabelTr: string;
  ctaHref: string;
  secondaryCtaLabelAr: string;
  secondaryCtaLabelEn: string;
  secondaryCtaLabelTr: string;
  secondaryCtaHref: string;
};

export type BrandingSideCard = {
  id: string;
  titleAr: string;
  titleEn: string;
  titleTr: string;
  daysAr: string;
  daysEn: string;
  daysTr: string;
  price: number;
  image: string;
  href: string;
};

export type BrandingExtraText = {
  id: string;
  titleAr: string;
  titleEn: string;
  titleTr: string;
  bodyAr: string;
  bodyEn: string;
  bodyTr: string;
};

export type BrandingExtraImage = {
  id: string;
  url: string;
  altAr: string;
  altEn: string;
  altTr: string;
};

export type BrandingHero = {
  slides: BrandingHeroSlide[];
  sideCards: BrandingSideCard[];
  extraTexts: BrandingExtraText[];
  extraImages: BrandingExtraImage[];
};

export type HomepageSectionVisibility = Record<HomepageSectionKey, boolean>;

export type BrandingContent = {
  version: number;
  updatedAt: string;
  logoUrl: string;
  faviconUrl: string;
  brandNameAr: string;
  brandNameEn: string;
  brandNameTr: string;
  showWordmark: boolean;
  colors: BrandColors;
  supportEmail: string;
  supportPhone: string;
  supportWhatsapp: string;
  sections: HomepageSectionVisibility;
  hero: BrandingHero;
};

export type BrandingPatch = Partial<
  Omit<BrandingContent, "colors" | "sections" | "hero">
> & {
  colors?: Partial<BrandColors>;
  sections?: Partial<HomepageSectionVisibility>;
  hero?: Partial<BrandingHero>;
  replaceHeroSlides?: BrandingHeroSlide[];
  replaceSideCards?: BrandingSideCard[];
  replaceExtraTexts?: BrandingExtraText[];
  replaceExtraImages?: BrandingExtraImage[];
  upsertHeroSlide?: BrandingHeroSlide;
  removeHeroSlideId?: string;
  upsertSideCard?: BrandingSideCard;
  removeSideCardId?: string;
};
