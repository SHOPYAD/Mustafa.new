/** Homepage CMS — editable via Gemini chat from admin */

export type HomeLayoutVariant =
  | "classic"
  | "editorial"
  | "minimal"
  | "bold"
  | "immersive";

export type HomeSectionBlock = {
  id: string;
  /** Visual / content role */
  type:
    | "promoBanner"
    | "textBlock"
    | "imageRow"
    | "ctaStrip"
    | "custom";
  titleAr: string;
  titleEn: string;
  subtitleAr?: string;
  subtitleEn?: string;
  bodyAr?: string;
  bodyEn?: string;
  image?: string;
  ctaLabelAr?: string;
  ctaLabelEn?: string;
  ctaHref?: string;
  /** Optional accent for design variants */
  accent?: string;
};

export type HomeHeroSlide = {
  id: string;
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  image: string;
  price: number;
  durationAr: string;
  durationEn: string;
  rating: number;
  ctaLabelAr?: string;
  ctaLabelEn?: string;
  ctaHref?: string;
};

export type HomeOfferCard = {
  id: string;
  titleAr: string;
  titleEn: string;
  destinationAr: string;
  destinationEn: string;
  image: string;
  originalPrice: number;
  salePrice: number;
  /** ISO date string when deal ends */
  endsAt: string;
  seatsLeft: number;
  totalSeats: number;
  href: string;
  badgeAr?: string;
  badgeEn?: string;
};

export type HomeDestinationCard = {
  id: string;
  nameAr: string;
  nameEn: string;
  countryAr: string;
  countryEn: string;
  image: string;
  packages: number;
  rating: number;
  reviews: number;
  taglineAr: string;
  taglineEn: string;
  startingPrice: number;
  href: string;
};

export type HomeFeatureItem = {
  id: string;
  icon: "shield" | "headphones" | "zap" | "award" | "sparkles" | "star";
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
};

export type HomeCtaBlock = {
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  image: string;
  buttonLabelAr: string;
  buttonLabelEn: string;
  buttonHref: string;
};

export type HomepageContent = {
  version: number;
  updatedAt: string;
  /** Overall homepage design skin */
  layoutVariant: HomeLayoutVariant;
  heroSlides: HomeHeroSlide[];
  offers: HomeOfferCard[];
  destinations: HomeDestinationCard[];
  features: HomeFeatureItem[];
  cta: HomeCtaBlock;
  /** Extra CMS sections Gemini can append */
  extraSections: HomeSectionBlock[];
  sections: {
    offersTitleAr: string;
    offersTitleEn: string;
    destinationsTitleAr: string;
    destinationsTitleEn: string;
    featuresTitleAr: string;
    featuresTitleEn: string;
  };
};

/** Partial update returned by Gemini */
export type HomepagePatch = Partial<HomepageContent> & {
  /** Replace entire arrays when provided */
  replaceOffers?: HomeOfferCard[];
  replaceHeroSlides?: HomeHeroSlide[];
  replaceDestinations?: HomeDestinationCard[];
  replaceFeatures?: HomeFeatureItem[];
  replaceExtraSections?: HomeSectionBlock[];
  /** Upsert / remove by id */
  upsertOffer?: HomeOfferCard;
  removeOfferId?: string;
  upsertHeroSlide?: HomeHeroSlide;
  removeHeroSlideId?: string;
  upsertDestination?: HomeDestinationCard;
  removeDestinationId?: string;
  upsertFeature?: HomeFeatureItem;
  removeFeatureId?: string;
  /** Explicit add actions (always append with unique id) */
  addOffer?: HomeOfferCard;
  addHeroSlide?: HomeHeroSlide;
  addDestination?: HomeDestinationCard;
  addFeature?: HomeFeatureItem;
  addSection?: HomeSectionBlock;
  removeSectionId?: string;
  /** Switch homepage design skin */
  replaceLayout?: HomeLayoutVariant;
};
