import type { PublicFlightItinerary } from "@/lib/server/flights-engine";

export type ArticlePipelineStageStatus = "pending" | "active" | "retrying" | "completed" | "failed";

export type ArticlePipelineStageReport = {
  id: string;
  label: string;
  tool: string;
  status: ArticlePipelineStageStatus;
  outcome: string;
  error?: string;
  durationMs?: number;
};

export type ArticlePipelineClient = {
  ok: boolean;
  published: boolean;
  articleId: string;
  slug: string;
  directUrl?: string;
  destinationKey: string;
  destinationLabel: string;
  titleAr?: string;
  blockedReason?: string;
  stages: ArticlePipelineStageReport[];
};

export const TRENDS_BROWSER_TOOL = "playwright.chromium";

export const ARTICLE_PIPELINE_STAGE_DEFS = [
  { id: "trends", label: "بحث الوجهات", tool: "متصفح التريندات" },
  { id: "flights", label: "مخزون الرحلات", tool: "بحث الرحلات" },
  { id: "hotels", label: "مخزون الفنادق", tool: "بحث الفنادق" },
  { id: "images", label: "الصور", tool: "مكتبة الصور" },
  { id: "ground", label: "التنقل الأرضي", tool: "بحث المواقع" },
  { id: "prose", label: "كتابة النص", tool: "توليد النص" },
  { id: "template", label: "تجميع القالب", tool: "قالب المقال" },
  { id: "quality", label: "بوابة الجودة", tool: "فحص الوجهة" },
  { id: "publish", label: "النشر", tool: "حفظ المقال" },
] as const;

export type FranceCity = {
  name: string;
  nameAr: string;
  iata: string;
  aliases: string[];
};

/** Interprets Trends query text. It is not a substitute for a Trends response. */
export const FRANCE_CITY_GAZETTEER: FranceCity[] = [
  { name: "Paris", nameAr: "باريس", iata: "CDG", aliases: ["paris", "باريس", "eiffel", "louvre", "versailles", "montmartre"] },
  { name: "Nice", nameAr: "نيس", iata: "NCE", aliases: ["nice", "نيس", "cannes", "كان", "riviera", "monaco", "antibes"] },
  { name: "Lyon", nameAr: "ليون", iata: "LYS", aliases: ["lyon", "ليون"] },
  { name: "Marseille", nameAr: "مرسيليا", iata: "MRS", aliases: ["marseille", "مرسيليا", "provence"] },
  { name: "Bordeaux", nameAr: "بوردو", iata: "BOD", aliases: ["bordeaux", "بوردو"] },
  { name: "Strasbourg", nameAr: "ستراسبورغ", iata: "SXB", aliases: ["strasbourg", "ستراسبورغ"] },
  { name: "Toulouse", nameAr: "تولوز", iata: "TLS", aliases: ["toulouse", "تولوز"] },
];

/** Used only after a browser Trends read fails or names no French city. Not Trends data. */
export const EDITORIAL_FRANCE_CITIES: FranceCity[] = FRANCE_CITY_GAZETTEER.slice(0, 3);

export const TURKEY_LEAK_RE =
  /turkey|türkiye|turkiye|trabzon|istanbul|guide-turkey|طرابزون|تركيا|إسطنبول|اسطنبول|أنطاليا|antalya|cappadocia|كابادوكيا/i;

export function findTurkeyLeak(text: string): string | null {
  const match = text.match(TURKEY_LEAK_RE);
  return match ? match[0] : null;
}

export function wantsSeparateArticle(directive: string): boolean {
  return /مقال(?:اً|ا)?\s+(?:جديد|منفصل)|مقال\s+مستقل|new article|separate article|another article/i.test(directive);
}

export function peekDestination(directive: string): { key: string; labelEn: string; labelAr: string } | null {
  const text = directive.toLowerCase();
  if (/france|فرنسا|باريس|paris/.test(text)) return { key: "france", labelEn: "France", labelAr: "فرنسا" };
  if (/italy|إيطاليا|ايطاليا|roma|rome|روما/.test(text)) return { key: "italy", labelEn: "Italy", labelAr: "إيطاليا" };
  if (/turkey|تركيا|istanbul|إسطنبول|اسطنبول|trabzon|طرابزون/.test(text)) {
    return { key: "turkey", labelEn: "Turkey", labelAr: "تركيا" };
  }
  return null;
}

export function isArticleDirective(text: string): boolean {
  return /مقال|مدون|سيو|seo|blog|article|محتوى|دليل|اكتب|فرنسا|france|باريس|paris|وجهات/.test(text.toLowerCase());
}

const TREND_ROW_DROP =
  /\b(italy|lidl|wikipedia|news|insurance|air\s*france)\b|أخبار|ويكيبيديا|تأمين/i;

/** A Trends row is kept only when it names a city or region inside France. */
export function isFrancePlaceQuery(query: string): boolean {
  const text = String(query || "").trim();
  if (!text || findTurkeyLeak(text) || TREND_ROW_DROP.test(text)) return false;
  return citiesFromTrendQueries([text]).length > 0;
}

export function citiesFromTrendQueries(queries: string[]): FranceCity[] {
  const found: FranceCity[] = [];
  const seen = new Set<string>();
  for (const query of queries) {
    const hay = ` ${query.toLowerCase()} `;
    for (const city of FRANCE_CITY_GAZETTEER) {
      if (seen.has(city.iata)) continue;
      const hit = city.aliases.some((alias) => {
        const needle = alias.toLowerCase();
        if (needle.length <= 5) return hay.includes(` ${needle} `) || hay.includes(` ${needle},`) || hay.includes(` ${needle}-`);
        return hay.includes(needle);
      });
      if (!hit) continue;
      seen.add(city.iata);
      found.push(city);
    }
  }
  return found.slice(0, 3);
}

export type TrendHit = { query: string; geo: string; interest?: string };

export type OfficialFlightItineraryEntry = {
  cityIata: string;
  cityName: string;
  originCode: string;
  itinerary: PublicFlightItinerary;
};

export type TourismProgramDay = {
  day: number;
  titleAr: string;
  bodyAr: string;
};

export function countArabicWords(text: string): number {
  return text
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export type FlightCardModel = {
  origin: string;
  destination: string;
  airline: string;
  flightNumber: string;
  aircraft: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: string;
  price: string;
  currency: string;
  baggage: string;
};

export type HotelCardModel = {
  city: string;
  name: string;
  image: string;
  rating: string;
  roomType: string;
  bedType: string;
  price: string;
  currency: string;
};

export type GroundOfferModel = {
  city: string;
  mode: "transfer" | "car";
  title: string;
  price: string;
  currency: string;
  supplier: string;
};

export type DestinationSource = "trends" | "editorial-fallback";

export function planFranceDestinations(input: { hits: TrendHit[]; crawlError: string | null }): {
  cities: FranceCity[];
  source: DestinationSource;
  trendsStatus: "completed" | "failed";
  trends: TrendHit[];
  outcome: string;
  error?: string;
} {
  const usable = input.hits.filter((hit) => !findTurkeyLeak(hit.query));
  const places = usable.filter((hit) => isFrancePlaceQuery(hit.query));
  if (input.crawlError || usable.length === 0) {
    const error =
      input.hits.length > 0 && usable.length === 0
        ? "Google Trends rows named Turkey, Trabzon, or Istanbul and were discarded"
        : input.crawlError || "playwright.chromium read no related or rising rows";
    return {
      cities: EDITORIAL_FRANCE_CITIES,
      source: "editorial-fallback",
      trendsStatus: "failed",
      trends: [],
      outcome: error,
      error,
    };
  }
  const cities = citiesFromTrendQueries(places.map((hit) => hit.query));
  if (!cities.length) {
    return {
      cities: EDITORIAL_FRANCE_CITIES,
      source: "editorial-fallback",
      trendsStatus: "completed",
      trends: [],
      outcome: `playwright.chromium read ${usable.length} rows and none named a city or region inside France; the engine used the editorial France list without printing the source`,
    };
  }
  const trends = places.filter((hit) =>
    cities.some(
      (city) =>
        hit.query.toLowerCase().includes(city.name.toLowerCase()) ||
        city.aliases.some((alias) => hit.query.toLowerCase().includes(alias.toLowerCase()))
    )
  );
  return {
    cities,
    source: "trends",
    trendsStatus: "completed",
    trends: trends.length ? trends : usable,
    outcome: `${cities.map((city) => city.name).join(", ")} via ${TRENDS_BROWSER_TOOL}`,
  };
}

export type OfficialArticleModel = {
  titleAr: string;
  titleEn: string;
  introAr: string;
  destinationSource?: DestinationSource;
  cities: Array<{
    name: string;
    nameAr: string;
    iata: string;
    distinctionAr: string;
    activities: string[];
    programDays: TourismProgramDay[];
    imageUrl: string;
    imageAlt: string;
    gallery?: Array<{ url: string; alt: string }>;
  }>;
  trends: TrendHit[];
  flights: FlightCardModel[];
  flightItineraries: OfficialFlightItineraryEntry[];
  hotels: HotelCardModel[];
  ground: GroundOfferModel[];
  hotelNote?: string;
  groundNote?: string;
  faq: Array<{ q: string; a: string }>;
};

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const PUBLIC_LEAK =
  /google trends|editorial-fallback|editorial|seeru|hotelbeds|travelport|ratehawk|playwright|searchlocations|exception|adapter/i;

function stripPublicProse(value: string): string {
  return value.replace(new RegExp(PUBLIC_LEAK.source, "gi"), " ").replace(/\s+/g, " ").trim();
}

export function sanitizePublicArticle(html: string): string {
  const scripts: string[] = [];
  const parked = html.replace(/<script[\s\S]*?<\/script>/gi, (block) => {
    scripts.push(block);
    return `<!--SCRIPT_${scripts.length - 1}-->`;
  });
  const cleaned = parked.replace(/>([^<]*)</g, (full, text: string) => {
    if (!PUBLIC_LEAK.test(text)) return full;
    return "><";
  });
  return cleaned.replace(/<!--SCRIPT_(\d+)-->/g, (_full, index: string) => scripts[Number(index)] || "");
}

export function renderOfficialArticle(model: OfficialArticleModel): string {
  const titleAr = stripPublicProse(model.titleAr);
  const introAr = stripPublicProse(model.introAr);
  const faq = model.faq.map((row) => ({ q: stripPublicProse(row.q), a: stripPublicProse(row.a) })).filter((row) => row.q && row.a);
  const cities = model.cities.map((city) => ({
    ...city,
    nameAr: stripPublicProse(city.nameAr),
    distinctionAr: stripPublicProse(city.distinctionAr),
    activities: city.activities.map((item) => stripPublicProse(item)).filter(Boolean),
    imageAlt: stripPublicProse(city.imageAlt),
    gallery: (city.gallery || []).map((photo) => ({ url: photo.url, alt: stripPublicProse(photo.alt) })),
  }));
  const payload = {
    titleAr,
    introAr,
    cities: cities.map((city) => ({
      name: city.name,
      nameAr: city.nameAr,
      iata: city.iata,
      distinctionAr: city.distinctionAr,
      activities: city.activities,
      programDays: city.programDays,
      gallery: (city.gallery.length ? city.gallery : [{ url: city.imageUrl, alt: city.imageAlt }]).slice(0, 6),
    })),
    flightItineraries: model.flightItineraries.map((entry) => ({
      cityIata: entry.cityIata,
      cityName: entry.cityName,
      originCode: entry.originCode,
      itinerary: entry.itinerary,
    })),
    flights: model.flights.map((flight) => ({
      origin: flight.origin,
      destination: flight.destination,
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      aircraft: flight.aircraft,
      departure: flight.departure,
      arrival: flight.arrival,
      duration: flight.duration,
      stops: flight.stops,
      price: flight.price,
      currency: flight.currency,
      baggage: flight.baggage,
    })),
    hotels: model.hotels.map((hotel) => ({
      city: hotel.city,
      name: hotel.name,
      image: hotel.image,
      rating: hotel.rating,
      roomType: hotel.roomType,
      bedType: hotel.bedType,
      price: hotel.price,
      currency: hotel.currency,
    })),
    faq,
  };
  const sections = cities
    .map((city) => {
      const gallery = (city.gallery?.length ? city.gallery : [{ url: city.imageUrl, alt: city.imageAlt }]).slice(0, 6);
      const photos = gallery
        .map(
          (photo) =>
            `<img src="${esc(photo.url)}" alt="${esc(photo.alt)}" data-landmark="${esc(city.name)}" />`
        )
        .join("");
      const activities = city.activities.map((item) => `<li>${esc(item)}</li>`).join("");
      const programDays = (city.programDays || []).map(
        (day) =>
          `<h4>اليوم ${day.day}: ${esc(day.titleAr)}</h4><p>${esc(day.bodyAr)}</p>`
      ).join("");
      return `<section>
        <h2>${esc(city.nameAr)}</h2>
        <div data-landmark-gallery="${esc(city.name)}" class="lonaliza-carousel-wrap">${photos}</div>
        <p>${esc(city.distinctionAr)}</p>
        <h3>الأنشطة</h3>
        <ul>${activities}</ul>
        <h3 data-tourism-program="${esc(city.name)}">البرنامج السياحي متعدد الأيام</h3>
        ${programDays}
        <div data-flight-slider="true" data-city="${esc(city.name)}" class="lonaliza-carousel-wrap"></div>
        <div data-hotel-slider="true" data-city="${esc(city.name)}" class="lonaliza-carousel-wrap"></div>
      </section>`;
    })
    .join("");
  const faqHtml = faq.map((row) => `<h3>${esc(row.q)}</h3><p>${esc(row.a)}</p>`).join("");
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((row) => ({
      "@type": "Question",
      name: row.q,
      acceptedAnswer: { "@type": "Answer", text: row.a },
    })),
  };
  const html = `<article data-official-article="1">
    <h1>${esc(titleAr)}</h1>
    <p>${esc(introAr)}</p>
    ${sections}
    <h2>الأسئلة الشائعة</h2>
    ${faqHtml}
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
    <script type="application/json" id="lonaliza-official-article">${JSON.stringify(payload).replace(/</g, "\\u003c")}</script>
  </article>`;
  return sanitizePublicArticle(html);
}

export function assertOfficialArticle(html: string, model: OfficialArticleModel): string | null {
  const visible = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  const leak = findTurkeyLeak(visible);
  if (leak) return `turkey leak: ${leak}`;
  if (PUBLIC_LEAK.test(visible)) return "operational text leaked into the article";
  if ((html.match(/<h1[\s>]/gi) || []).length !== 1) return "expected one h1";
  for (const city of model.cities) {
    if (!html.includes(city.nameAr) && !html.includes(city.name)) return `missing destination heading ${city.name}`;
    if (!html.includes(`data-landmark-gallery="${city.name}"`)) return `missing gallery ${city.name}`;
    if (!html.includes(city.imageAlt) && !(city.gallery || []).some((photo) => html.includes(photo.alt))) {
      return `image alt does not match ${city.name}`;
    }
  }
  if (!html.includes('data-flight-slider="true"') || !html.includes("lonaliza-carousel-wrap") || html.includes("display:grid")) {
    return "flight block is not a slider";
  }
  if (!html.includes('data-hotel-slider="true"')) return "hotel block is not a slider";
  if (!html.includes("الأسئلة الشائعة") || !html.includes("FAQPage")) return "missing faq";
  for (const city of model.cities) {
    if (!html.includes(`data-tourism-program="${city.name}"`)) return `missing tourism program ${city.name}`;
    if (!city.programDays?.length || city.programDays.length < 3) return `program too short for ${city.name}`;
    const words = countArabicWords(
      [city.distinctionAr, ...city.activities, ...(city.programDays || []).map((d) => `${d.titleAr} ${d.bodyAr}`)].join(" ")
    );
    if (words < 360) return `city prose under 360 words: ${city.name} (${words})`;
  }
  if (!model.flightItineraries.length) return "missing runFlightSearch itineraries for storefront cards";
  return null;
}
