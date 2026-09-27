import { PHOTO } from "@/data/catalog-photos";
import type { SavedAiProgram } from "@/types/ai-program";
import type { HolidayPackage, ImageAsset, ItineraryDay } from "@/types/package";
import { PRICE_ESTIMATE_AR, PRICE_ESTIMATE_EN, PRICE_ESTIMATE_TR } from "@/lib/sales-price-copy";
import { resolveDestinationMeta } from "@/lib/destination-resolver";

function slugify(raw: string, fallback: string): string {
  const latin = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return latin || fallback;
}

function coverUrl(program: SavedAiProgram): string {
  if (program.thumbnail && /^https?:\/\//i.test(program.thumbnail)) {
    return program.thumbnail;
  }
  const meta = resolveDestinationMeta(program.destination || program.titleEn || program.titleAr);
  if (meta.coverUrl) return meta.coverUrl;

  const d = `${program.destination} ${program.titleEn} ${program.titleAr}`.toLowerCase();
  if (/antalya|أنطاليا|belek/.test(d)) return PHOTO.antalyaCoast;
  if (/trabzon|طرابزون|ayder/.test(d)) return PHOTO.alpineLake;
  if (/cappadocia|كابادوكيا/.test(d)) return PHOTO.cappadociaBalloons;
  if (/istanbul|إسطنبول/.test(d)) return PHOTO.istanbulSkyline;
  return PHOTO.luxuryHotel;
}

function daysOf(program: SavedAiProgram, lang: "ar" | "en" = "ar"): ItineraryDay[] {
  return (program.itinerary?.days || []).map((day, i) => {
    const extra = day as { lat?: number; lng?: number; stops?: any[]; photo?: string };
    const title =
      lang === "ar"
        ? day.titleAr || day.titleEn || `اليوم ${i + 1}`
        : day.titleEn || day.titleAr || `Day ${i + 1}`;
    const description =
      lang === "ar"
        ? day.detailAr || day.detailEn || ""
        : day.detailEn || day.detailAr || "";
    return {
      day: day.day || i + 1,
      title,
      description,
      lat: extra.lat,
      lng: extra.lng,
      photo: extra.photo,
      stops: Array.isArray(extra.stops) ? extra.stops : undefined,
    };
  });
}

export function aiProgramToHolidayPackage(program: SavedAiProgram): HolidayPackage {
  const days = Math.max(
    1,
    (program.itinerary?.days?.length || 0) || program.nights + 1 || 1
  );
  const nights = program.nights || Math.max(1, days - 1);
  const rawDest = program.destination || program.titleEn || program.titleAr;
  const meta = resolveDestinationMeta(rawDest);

  const image: ImageAsset = {
    url: coverUrl(program),
    alt: program.titleEn || program.titleAr || meta.destEn,
    width: 1600,
    height: 900,
  };
  const includesAr = program.includesAr.length
    ? program.includesAr
    : program.includesEn;
  const includesEn = program.includesEn.length
    ? program.includesEn
    : program.includesAr;
  const itineraryAr = daysOf(program, "ar");
  const itineraryEn = daysOf(program, "en");

  return {
    id: program.id,
    slug: slugify(program.titleEn || meta.cityEn, `ai-${program.id}`),
    title: program.titleEn || program.titleAr || meta.destEn,
    titleAr: program.titleAr || program.titleEn || meta.destAr,
    titleEn: program.titleEn || program.titleAr || meta.destEn,
    titleTr: program.titleEn || program.titleAr || meta.destEn,
    destination: meta.cityEn,
    destinationAr: meta.destAr,
    destinationEn: meta.destEn,
    destinationTr: meta.destEn,
    country: meta.countryEn,
    countryAr: meta.countryAr,
    countryEn: meta.countryEn,
    countryTr: meta.countryEn,
    destinations: [meta.cityEn],
    destinationsEn: [meta.destEn],
    destinationsAr: [meta.destAr],
    durationDays: days,
    durationNights: nights,
    price: program.priceFromUsd || program.itinerary?.totalClientPrice || 0,
    currency: "USD",
    rating: 4.8,
    images: [image],
    amenities: includesEn.slice(0, 6),
    amenitiesAr: includesAr.slice(0, 6),
    isFeatured: true,
    isPublished: true,
    createdAt: program.createdAt || new Date().toISOString(),
    theme: "luxury",
    tripMode: "private_vip",
    description: `${program.itinerary?.titleEn || program.titleEn}\n\n${PRICE_ESTIMATE_EN}`,
    descriptionAr: `${program.itinerary?.titleAr || program.titleAr}\n\n${PRICE_ESTIMATE_AR}`,
    descriptionEn: `${program.itinerary?.titleEn || program.titleEn}\n\n${PRICE_ESTIMATE_EN}`,
    descriptionTr: `${program.itinerary?.titleEn || program.titleEn}\n\n${PRICE_ESTIMATE_TR}`,
    inclusions: includesEn,
    inclusionsAr: includesAr,
    inclusionsEn: includesEn,
    inclusionsTr: includesEn,
    exclusions: [
      "International flights",
      "Visa fees",
      "Personal expenses",
    ],
    exclusionsAr: ["تذاكر الطيران الدولية", "رسوم التأشيرة", "المصاريف الشخصية"],
    exclusionsEn: [
      "International flights",
      "Visa fees",
      "Personal expenses",
    ],
    itinerary: itineraryAr,
    itineraryAr,
    itineraryEn,
  };
}
