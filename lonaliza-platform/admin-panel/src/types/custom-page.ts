export type CustomPageStatus = "published" | "draft";

export const CUSTOM_PAGE_SECTION_TYPES = [
  "heading",
  "text",
  "image",
  "cta",
  "html",
] as const;

export type CustomPageSectionType = (typeof CUSTOM_PAGE_SECTION_TYPES)[number];

export type CustomPageSection = {
  id: string;
  type: CustomPageSectionType;
  hidden?: boolean;
  titleAr?: string;
  titleEn?: string;
  titleTr?: string;
  bodyAr?: string;
  bodyEn?: string;
  bodyTr?: string;
  image?: string;
  ctaLabelAr?: string;
  ctaLabelEn?: string;
  ctaLabelTr?: string;
  ctaHref?: string;
  background?: string;
  textColor?: string;
  accent?: string;
};

export type PageThemeTokens = {
  navy?: string;
  emerald?: string;
  background?: string;
  text?: string;
  accent?: string;
};

export type PageLayoutHints = {
  heroAlign?: "start" | "center";
  maxWidth?: "narrow" | "default" | "wide";
  showHero?: boolean;
  compactHeader?: boolean;
};

export interface CustomPage {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  titleTr?: string;
  bodyAr: string;
  bodyEn: string;
  bodyTr?: string;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
  showInHeader: boolean;
  showInFooter: boolean;
  sections?: CustomPageSection[];
  theme?: PageThemeTokens;
  layoutHints?: PageLayoutHints;
  createdAt: string;
  updatedAt: string;
}

export type CustomPageInput = {
  slug?: string;
  titleAr?: string;
  titleEn?: string;
  titleTr?: string;
  bodyAr?: string;
  bodyEn?: string;
  bodyTr?: string;
  seoTitle?: string;
  seoDescription?: string;
  published?: boolean;
  showInHeader?: boolean;
  showInFooter?: boolean;
  sections?: CustomPageSection[];
  theme?: PageThemeTokens;
  layoutHints?: PageLayoutHints;
};

export type PublicPageLink = {
  slug: string;
  href: string;
  titleAr: string;
  titleEn: string;
  showInHeader: boolean;
  showInFooter: boolean;
};
