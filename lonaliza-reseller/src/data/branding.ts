import type {
  BrandColors,
  BrandingContent,
  BrandingHeroSlide,
  HomepageSectionVisibility,
} from "@/types/branding";
import { HOMEPAGE_SECTION_KEYS } from "@/types/branding";
import {
  DEFAULT_SITE_WHATSAPP,
  SITE_PUBLIC_EMAIL,
  SITE_PUBLIC_PHONE,
} from "@/data/site-contact";

export const BRANDING_VERSION = 1;
export const BRANDING_UPDATED_EVENT = "alrayyan:branding-updated";

export const DEFAULT_BRAND_COLORS: BrandColors = {
  primary: "#10b981",
  secondary: "#f1f5f9",
  accent: "#0a1628",
  header: "#0f172a",
  footer: "#020617",
  button: "#10b981",
  whatsapp: "",
};

export function defaultSectionVisibility(): HomepageSectionVisibility {
  return HOMEPAGE_SECTION_KEYS.reduce((acc, key) => {
    acc[key] = true;
    return acc;
  }, {} as HomepageSectionVisibility);
}

function slide(
  partial: Omit<
    BrandingHeroSlide,
    | "nameTr"
    | "taglineTr"
    | "durationTr"
    | "currencyLabel"
    | "badgeAr"
    | "badgeEn"
    | "badgeTr"
    | "inclusiveAr"
    | "inclusiveEn"
    | "inclusiveTr"
    | "ctaLabelTr"
    | "secondaryCtaLabelAr"
    | "secondaryCtaLabelEn"
    | "secondaryCtaLabelTr"
    | "secondaryCtaHref"
  > &
    Partial<BrandingHeroSlide>
): BrandingHeroSlide {
  return {
    nameTr: partial.nameTr || partial.nameAr,
    taglineTr: partial.taglineTr || partial.taglineAr,
    durationTr: partial.durationTr || partial.durationAr,
    currencyLabel: partial.currencyLabel || "USD",
    badgeAr: partial.badgeAr || "وجهة مميزة",
    badgeEn: partial.badgeEn || "Featured destination",
    badgeTr: partial.badgeTr || "Öne çıkan destinasyon",
    inclusiveAr: partial.inclusiveAr || "شامل كلياً",
    inclusiveEn: partial.inclusiveEn || "All inclusive",
    inclusiveTr: partial.inclusiveTr || "Her şey dahil",
    ctaLabelTr: partial.ctaLabelTr || "Türkiye paketlerini keşfet",
    secondaryCtaLabelAr: partial.secondaryCtaLabelAr || "شاهد الفيلم",
    secondaryCtaLabelEn: partial.secondaryCtaLabelEn || "Watch film",
    secondaryCtaLabelTr: partial.secondaryCtaLabelTr || "Filmi izle",
    secondaryCtaHref: partial.secondaryCtaHref || "",
    ...partial,
  };
}

export const DEFAULT_HERO_SLIDES: BrandingHeroSlide[] = [
  slide({
    id: "h1",
    nameAr: "إسطنبول",
    nameEn: "Istanbul",
    nameTr: "İstanbul",
    taglineAr: "حيث تلتقي القارتان",
    taglineEn: "Where Two Continents Meet",
    taglineTr: "İki kıtanın buluştuğu yer",
    image:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1920",
    price: 499,
    durationAr: "4 أيام",
    durationEn: "4 Days",
    durationTr: "4 gün",
    rating: 4.9,
    ctaLabelAr: "استكشف باقات تركيا",
    ctaLabelEn: "Explore Turkey Packages",
    ctaHref: "/holidays?q=Istanbul",
  }),
  slide({
    id: "h2",
    nameAr: "كابادوكيا",
    nameEn: "Cappadocia",
    nameTr: "Kapadokya",
    taglineAr: "منطاد فوق القمم",
    taglineEn: "Balloons Over Fairy Chimneys",
    taglineTr: "Peri bacaları üzerinde balonlar",
    image:
      "https://images.unsplash.com/photo-1569530593523-083e18aecc75?w=1920",
    price: 699,
    durationAr: "3 أيام",
    durationEn: "3 Days",
    durationTr: "3 gün",
    rating: 4.9,
    ctaLabelAr: "استكشف باقات تركيا",
    ctaLabelEn: "Explore Turkey Packages",
    ctaHref: "/holidays?q=Cappadocia",
  }),
  slide({
    id: "h3",
    nameAr: "أنطاليا",
    nameEn: "Antalya",
    nameTr: "Antalya",
    taglineAr: "شواطئ المتوسط التركية",
    taglineEn: "Turkish Mediterranean Shores",
    taglineTr: "Türk Akdeniz kıyıları",
    image:
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1920",
    price: 599,
    durationAr: "5 أيام",
    durationEn: "5 Days",
    durationTr: "5 gün",
    rating: 4.8,
    ctaLabelAr: "استكشف باقات تركيا",
    ctaLabelEn: "Explore Turkey Packages",
    ctaHref: "/holidays?q=Antalya",
  }),
];

export const DEFAULT_BRANDING: BrandingContent = {
  version: BRANDING_VERSION,
  updatedAt: "",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon.png",
  brandNameAr: "الريان للسياحة",
  brandNameEn: "Alrayyan Tourism",
  brandNameTr: "Alrayyan Turizm",
  showWordmark: false,
  colors: { ...DEFAULT_BRAND_COLORS },
  supportEmail: SITE_PUBLIC_EMAIL,
  supportPhone: SITE_PUBLIC_PHONE,
  supportWhatsapp: DEFAULT_SITE_WHATSAPP,
  sections: defaultSectionVisibility(),
  hero: {
    slides: DEFAULT_HERO_SLIDES,
    sideCards: [],
    extraTexts: [],
    extraImages: [],
  },
};

export function brandNameForLocale(
  branding: BrandingContent,
  locale: string
): string {
  if (locale === "en") return branding.brandNameEn || branding.brandNameAr;
  if (locale === "tr") {
    return branding.brandNameTr || branding.brandNameAr || branding.brandNameEn;
  }
  return branding.brandNameAr || branding.brandNameEn;
}
