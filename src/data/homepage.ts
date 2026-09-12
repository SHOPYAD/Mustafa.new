import type { HomepageContent, HomepagePatch } from "@/types/homepage";

/** Bump this + STORAGE_KEY whenever public homepage seed must replace stale localStorage. */
export const HOMEPAGE_SEED_VERSION = 6;
const STORAGE_KEY = "alrayyan_homepage_v6";
const LEGACY_STORAGE_KEYS = [
  "alrayyan_homepage_v5",
  "alrayyan_homepage_v4",
  "alrayyan_homepage_v3",
  "alrayyan_homepage_v2",
  "oktravel_homepage_v1",
  "oktravel_homepage",
];

export const defaultHomepageContent: HomepageContent = {
  version: HOMEPAGE_SEED_VERSION,
  updatedAt: new Date().toISOString(),
  layoutVariant: "classic",
  extraSections: [],
  heroSlides: [
    {
      id: "h1",
      nameAr: "إسطنبول",
      nameEn: "Istanbul",
      taglineAr: "حيث تلتقي القارتان",
      taglineEn: "Where Two Continents Meet",
      image:
        "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1920",
      price: 499,
      durationAr: "4 أيام",
      durationEn: "4 Days",
      rating: 4.9,
      ctaLabelAr: "استكشف باقات تركيا",
      ctaLabelEn: "Explore Turkey Packages",
      ctaHref: "/holidays?q=Istanbul",
    },
    {
      id: "h2",
      nameAr: "كابادوكيا",
      nameEn: "Cappadocia",
      taglineAr: "منطاد فوق القمم",
      taglineEn: "Balloons Over Fairy Chimneys",
      image:
        "https://images.unsplash.com/photo-1569530593523-083e18aecc75?w=1920",
      price: 699,
      durationAr: "3 أيام",
      durationEn: "3 Days",
      rating: 4.9,
      ctaHref: "/holidays?q=Cappadocia",
    },
    {
      id: "h3",
      nameAr: "أنطاليا",
      nameEn: "Antalya",
      taglineAr: "شواطئ المتوسط التركية",
      taglineEn: "Turkish Mediterranean Shores",
      image:
        "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1920",
      price: 599,
      durationAr: "5 أيام",
      durationEn: "5 Days",
      rating: 4.8,
      ctaHref: "/holidays?q=Antalya",
    },
  ],
  offers: [
    {
      id: "o1",
      titleAr: "إسطنبول مع سيارة خاصة VIP",
      titleEn: "Istanbul VIP Private Car",
      destinationAr: "إسطنبول",
      destinationEn: "Istanbul",
      image:
        "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800",
      originalPrice: 899,
      salePrice: 649,
      endsAt: new Date(Date.now() + 2 * 86400000).toISOString(),
      seatsLeft: 6,
      totalSeats: 20,
      href: "/transfers",
      badgeAr: "عرض ساخن",
      badgeEn: "Hot Deal",
    },
    {
      id: "o2",
      titleAr: "كابادوكيا بالمنطاد",
      titleEn: "Cappadocia Balloon Escape",
      destinationAr: "كابادوكيا",
      destinationEn: "Cappadocia",
      image:
        "https://images.unsplash.com/photo-1569530593523-083e18aecc75?w=800",
      originalPrice: 999,
      salePrice: 749,
      endsAt: new Date(Date.now() + 86400000).toISOString(),
      seatsLeft: 5,
      totalSeats: 18,
      href: "/holidays?q=Cappadocia",
    },
    {
      id: "o3",
      titleAr: "سبانجا ومعشوقية يوم كامل",
      titleEn: "Sapanca & Masukiye Day Trip",
      destinationAr: "سبانجا",
      destinationEn: "Sapanca",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      originalPrice: 249,
      salePrice: 179,
      endsAt: new Date(Date.now() + 3 * 86400000).toISOString(),
      seatsLeft: 10,
      totalSeats: 25,
      href: "/holidays?q=Sapanca",
    },
    {
      id: "o4",
      titleAr: "طرابزون وآيدر الطبيعة",
      titleEn: "Trabzon & Ayder Nature",
      destinationAr: "طرابزون",
      destinationEn: "Trabzon",
      image:
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
      originalPrice: 799,
      salePrice: 599,
      endsAt: new Date(Date.now() + 4 * 86400000).toISOString(),
      seatsLeft: 8,
      totalSeats: 20,
      href: "/holidays?q=Trabzon",
    },
  ],
  destinations: [
    {
      id: "d1",
      nameAr: "إسطنبول",
      nameEn: "Istanbul",
      countryAr: "تركيا",
      countryEn: "Turkey",
      image:
        "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800",
      packages: 28,
      rating: 4.9,
      reviews: 1840,
      taglineAr: "عاصمة التاريخ والثقافة",
      taglineEn: "Capital of History & Culture",
      startingPrice: 399,
      href: "/holidays?q=Istanbul",
    },
    {
      id: "d2",
      nameAr: "أنطاليا",
      nameEn: "Antalya",
      countryAr: "تركيا",
      countryEn: "Turkey",
      image:
        "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800",
      packages: 16,
      rating: 4.8,
      reviews: 1120,
      taglineAr: "لؤلؤة المتوسط",
      taglineEn: "Pearl of the Mediterranean",
      startingPrice: 449,
      href: "/holidays?q=Antalya",
    },
    {
      id: "d3",
      nameAr: "كابادوكيا",
      nameEn: "Cappadocia",
      countryAr: "تركيا",
      countryEn: "Turkey",
      image:
        "https://images.unsplash.com/photo-1569530593523-083e18aecc75?w=800",
      packages: 14,
      rating: 4.9,
      reviews: 980,
      taglineAr: "مناظر خيالية ومنطاد",
      taglineEn: "Fairy Landscapes & Balloons",
      startingPrice: 549,
      href: "/holidays?q=Cappadocia",
    },
    {
      id: "d4",
      nameAr: "طرابزون",
      nameEn: "Trabzon",
      countryAr: "تركيا",
      countryEn: "Turkey",
      image:
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
      packages: 12,
      rating: 4.8,
      reviews: 760,
      taglineAr: "خضرة البحر الأسود",
      taglineEn: "Black Sea Greenery",
      startingPrice: 399,
      href: "/holidays?q=Trabzon",
    },
    {
      id: "d5",
      nameAr: "بورصة",
      nameEn: "Bursa",
      countryAr: "تركيا",
      countryEn: "Turkey",
      image:
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
      packages: 8,
      rating: 4.7,
      reviews: 540,
      taglineAr: "أول عاصمة عثمانية",
      taglineEn: "First Ottoman Capital",
      startingPrice: 299,
      href: "/holidays?q=Bursa",
    },
    {
      id: "d6",
      nameAr: "سبانجا",
      nameEn: "Sapanca",
      countryAr: "تركيا",
      countryEn: "Turkey",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      packages: 10,
      rating: 4.8,
      reviews: 620,
      taglineAr: "بحيرة وكبائن الطبيعة",
      taglineEn: "Lake & Nature Cabins",
      startingPrice: 199,
      href: "/holidays?q=Sapanca",
    },
    {
      id: "d7",
      nameAr: "ريزا وآيدر",
      nameEn: "Rize & Ayder",
      countryAr: "تركيا",
      countryEn: "Turkey",
      image:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
      packages: 9,
      rating: 4.8,
      reviews: 410,
      taglineAr: "هضاب وشلالات",
      taglineEn: "Highlands & Waterfalls",
      startingPrice: 349,
      href: "/holidays?q=Ayder",
    },
  ],
  features: [
    {
      id: "f1",
      icon: "shield",
      titleAr: "حجز آمن",
      titleEn: "Secure Booking",
      titleTr: "Güvenli Rezervasyon",
      titleFr: "Réservation Sécurisée",
      descriptionAr: "بوابة دفع آمنة 100% مع معاملات مشفّرة.",
      descriptionEn: "100% secure payment gateway with encrypted transactions.",
      descriptionTr: "Şifreli işlemlerle %100 güvenli ödeme altyapısı.",
      descriptionFr: "Passerelle de paiement 100% sécurisée et cryptée.",
    },
    {
      id: "f2",
      icon: "headphones",
      titleAr: "دعم على مدار الساعة",
      titleEn: "24/7 Support",
      titleTr: "7/24 Kesintisiz Destek",
      titleFr: "Support 24/7",
      descriptionAr: "مساعدة مستمرة لجميع احتياجات سفرك.",
      descriptionEn: "Round-the-clock assistance for all your travel needs.",
      descriptionTr: "Tüm seyahat ihtiyaçlarınız için günün her saati yanınızdayız.",
      descriptionFr: "Assistance continue pour tous vos besoins de voyage.",
    },
    {
      id: "f3",
      icon: "zap",
      titleAr: "تأكيد فوري",
      titleEn: "Instant Confirmation",
      titleTr: "Anında Onay",
      titleFr: "Confirmation Immédiate",
      descriptionAr: "احصل على تأكيد الحجز فوراً عبر البريد والرسائل.",
      descriptionEn: "Get immediate booking confirmations via email & SMS.",
      descriptionTr: "Rezervasyon onayınızı anında e-posta ve SMS ile alın.",
      descriptionFr: "Recevez votre confirmation instantanément par e-mail et SMS.",
    },
    {
      id: "f4",
      icon: "award",
      titleAr: "ضمان أفضل سعر",
      titleEn: "Best Price Guarantee",
      titleTr: "En İyi Fiyat Garantisi",
      titleFr: "Meilleur Prix Garanti",
      descriptionAr: "نطابق أي سعر منافس أو نعيد الفرق.",
      descriptionEn: "We match any competitor price or refund the difference.",
      descriptionTr: "Rakiplerimizin fiyatlarını yakalar veya farkı iade ederiz.",
      descriptionFr: "Nous nous alignons sur tout prix concurrent ou remboursons la différence.",
    },
  ],
  cta: {
    titleAr: "هل أنت مستعد لرحلتك في تركيا؟",
    titleEn: "Ready for your Turkey adventure?",
    subtitleAr:
      "اشترك في نشرتنا وكن أول من يعرف بالعروض الحصرية والوجهات الجديدة.",
    subtitleEn:
      "Subscribe to our newsletter and be the first to know about exclusive deals and new destinations.",
    image:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920",
    buttonLabelAr: "اشترك الآن",
    buttonLabelEn: "Subscribe",
    buttonHref: "/contact",
  },
  sections: {
    offersTitleAr: "عروض سريعة",
    offersTitleEn: "Flash Deals",
    destinationsTitleAr: "مدن تركيا",
    destinationsTitleEn: "Turkey Cities",
    featuresTitleAr: "لماذا تختارنا",
    featuresTitleEn: "Why Choose Us",
  },
};

export const HOMEPAGE_STORAGE_KEY = STORAGE_KEY;
export const HOMEPAGE_UPDATED_EVENT = "alrayyan:homepage-updated";

function clearLegacyHomepageKeys() {
  for (const key of LEGACY_STORAGE_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
}

function save(content: HomepageContent) {
  const next = { ...content, version: HOMEPAGE_SEED_VERSION };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  clearLegacyHomepageKeys();
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(HOMEPAGE_UPDATED_EVENT, { detail: next })
    );
  }
}

function normalizeHomepage(raw: Partial<HomepageContent>): HomepageContent {
  return {
    ...defaultHomepageContent,
    ...raw,
    layoutVariant: raw.layoutVariant || defaultHomepageContent.layoutVariant,
    extraSections: Array.isArray(raw.extraSections)
      ? raw.extraSections
      : defaultHomepageContent.extraSections,
    heroSlides: Array.isArray(raw.heroSlides)
      ? raw.heroSlides
      : defaultHomepageContent.heroSlides,
    offers: Array.isArray(raw.offers)
      ? raw.offers
      : defaultHomepageContent.offers,
    destinations: Array.isArray(raw.destinations)
      ? raw.destinations
      : defaultHomepageContent.destinations,
    features: Array.isArray(raw.features)
      ? raw.features
      : defaultHomepageContent.features,
    cta: { ...defaultHomepageContent.cta, ...(raw.cta || {}) },
    sections: {
      ...defaultHomepageContent.sections,
      ...(raw.sections || {}),
    },
  };
}

export function getHomepageContent(): HomepageContent {
  if (typeof window === "undefined") return defaultHomepageContent;
  clearLegacyHomepageKeys();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    save(defaultHomepageContent);
    return defaultHomepageContent;
  }
  try {
    const parsed = normalizeHomepage(JSON.parse(raw));
    const seedMismatch = (parsed.version || 0) !== HOMEPAGE_SEED_VERSION;
    const hasNonTurkey = parsed.destinations.some(
      (d) =>
        /dubai|maldives|bali|thailand|uae|singapore|egypt/i.test(d.nameEn) ||
        /dubai|maldives|bali|thailand|uae|singapore|egypt/i.test(d.href || "")
    );
    // Hard overwrite whenever seed version mismatches or stale global destinations remain
    if (seedMismatch || hasNonTurkey || parsed.destinations.length === 0) {
      save(defaultHomepageContent);
      return defaultHomepageContent;
    }
    return parsed;
  } catch {
    save(defaultHomepageContent);
    return defaultHomepageContent;
  }
}

export function saveHomepageContent(content: HomepageContent): HomepageContent {
  const next = {
    ...content,
    version: HOMEPAGE_SEED_VERSION,
    updatedAt: new Date().toISOString(),
  };
  save(next);
  return next;
}

export function resetHomepageContent(): HomepageContent {
  save(defaultHomepageContent);
  return defaultHomepageContent;
}

function withUniqueId<T extends { id: string }>(
  item: T,
  existingIds: Set<string>,
  prefix: string
): T {
  let id = item.id?.trim() || `${prefix}-${Date.now()}`;
  if (existingIds.has(id)) id = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return { ...item, id };
}

/** Apply a Gemini (or manual) patch onto homepage content */
export function applyHomepagePatch(
  current: HomepageContent,
  patch: HomepagePatch
): HomepageContent {
  let next: HomepageContent = {
    ...current,
    sections: { ...current.sections, ...(patch.sections || {}) },
    cta: { ...current.cta, ...(patch.cta || {}) },
    layoutVariant: patch.replaceLayout || patch.layoutVariant || current.layoutVariant,
  };

  if (patch.replaceHeroSlides) next.heroSlides = patch.replaceHeroSlides;
  if (patch.replaceOffers) next.offers = patch.replaceOffers;
  if (patch.replaceDestinations) next.destinations = patch.replaceDestinations;
  if (patch.replaceFeatures) next.features = patch.replaceFeatures;
  if (patch.replaceExtraSections) next.extraSections = patch.replaceExtraSections;
  if (patch.heroSlides && !patch.replaceHeroSlides)
    next.heroSlides = patch.heroSlides;
  if (patch.offers && !patch.replaceOffers) next.offers = patch.offers;
  if (patch.destinations && !patch.replaceDestinations)
    next.destinations = patch.destinations;
  if (patch.features && !patch.replaceFeatures) next.features = patch.features;
  if (patch.extraSections && !patch.replaceExtraSections)
    next.extraSections = patch.extraSections;

  const upsert = <T extends { id: string }>(
    list: T[],
    item: T
  ): T[] => {
    const i = list.findIndex((o) => o.id === item.id);
    if (i >= 0) {
      const copy = [...list];
      copy[i] = item;
      return copy;
    }
    return [item, ...list];
  };

  if (patch.upsertOffer) next.offers = upsert(next.offers, patch.upsertOffer);
  if (patch.removeOfferId)
    next.offers = next.offers.filter((o) => o.id !== patch.removeOfferId);
  if (patch.upsertHeroSlide)
    next.heroSlides = upsert(next.heroSlides, patch.upsertHeroSlide);
  if (patch.removeHeroSlideId)
    next.heroSlides = next.heroSlides.filter(
      (o) => o.id !== patch.removeHeroSlideId
    );
  if (patch.upsertDestination)
    next.destinations = upsert(next.destinations, patch.upsertDestination);
  if (patch.removeDestinationId)
    next.destinations = next.destinations.filter(
      (o) => o.id !== patch.removeDestinationId
    );
  if (patch.upsertFeature)
    next.features = upsert(next.features, patch.upsertFeature);
  if (patch.removeFeatureId)
    next.features = next.features.filter((o) => o.id !== patch.removeFeatureId);

  if (patch.addOffer) {
    const item = withUniqueId(
      patch.addOffer,
      new Set(next.offers.map((o) => o.id)),
      "o"
    );
    next.offers = [item, ...next.offers];
  }
  if (patch.addHeroSlide) {
    const item = withUniqueId(
      patch.addHeroSlide,
      new Set(next.heroSlides.map((o) => o.id)),
      "h"
    );
    next.heroSlides = [item, ...next.heroSlides];
  }
  if (patch.addDestination) {
    const item = withUniqueId(
      patch.addDestination,
      new Set(next.destinations.map((o) => o.id)),
      "d"
    );
    next.destinations = [item, ...next.destinations];
  }
  if (patch.addFeature) {
    const item = withUniqueId(
      patch.addFeature,
      new Set(next.features.map((o) => o.id)),
      "f"
    );
    next.features = [...next.features, item];
  }
  if (patch.addSection) {
    const item = withUniqueId(
      patch.addSection,
      new Set(next.extraSections.map((o) => o.id)),
      "s"
    );
    next.extraSections = [...next.extraSections, item];
  }
  if (patch.removeSectionId) {
    next.extraSections = next.extraSections.filter(
      (o) => o.id !== patch.removeSectionId
    );
  }

  const clean: HomepageContent = {
    version: next.version,
    updatedAt: next.updatedAt,
    layoutVariant: next.layoutVariant,
    heroSlides: next.heroSlides,
    offers: next.offers,
    destinations: next.destinations,
    features: next.features,
    cta: next.cta,
    extraSections: next.extraSections,
    sections: next.sections,
  };

  return saveHomepageContent(clean);
}
