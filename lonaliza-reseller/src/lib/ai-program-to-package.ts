import { PHOTO } from "@/data/catalog-photos";
import type { SavedAiProgram } from "@/types/ai-program";
import type { HolidayPackage, ImageAsset, ItineraryDay } from "@/types/package";
import { PRICE_ESTIMATE_AR, PRICE_ESTIMATE_EN, PRICE_ESTIMATE_TR } from "@/lib/sales-price-copy";

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
  const d = `${program.destination} ${program.titleEn} ${program.titleAr}`.toLowerCase();
  if (/antalya|أنطاليا|belek/.test(d)) return PHOTO.antalyaCoast;
  if (/trabzon|طرابزون|ayder/.test(d)) return PHOTO.alpineLake;
  if (/cappadocia|كابادوكيا/.test(d)) return PHOTO.cappadociaBalloons;
  if (/istanbul|إسطنبول/.test(d)) return PHOTO.istanbulSkyline;
  return PHOTO.luxuryHotel;
}

function daysOf(program: SavedAiProgram): ItineraryDay[] {
  return (program.itinerary?.days || []).map((day, i) => ({
    day: day.day || i + 1,
    title: day.titleAr || day.titleEn || `اليوم ${i + 1}`,
    description: day.detailAr || day.detailEn || "",
  }));
}

export function aiProgramToHolidayPackage(program: SavedAiProgram): HolidayPackage {
  const days = Math.max(
    1,
    (program.itinerary?.days?.length || 0) || program.nights + 1 || 1
  );
  const nights = program.nights || Math.max(1, days - 1);
  const dest = program.destination || program.titleEn || program.titleAr;
  const image: ImageAsset = {
    url: coverUrl(program),
    alt: program.titleEn || program.titleAr,
    width: 1600,
    height: 900,
  };
  const includesAr = program.includesAr.length
    ? program.includesAr
    : program.includesEn;
  const includesEn = program.includesEn.length
    ? program.includesEn
    : program.includesAr;
  const itineraryAr = daysOf(program);
  const itineraryEn = (program.itinerary?.days || []).map((day, i) => ({
    day: day.day || i + 1,
    title: day.titleEn || day.titleAr || `Day ${i + 1}`,
    description: day.detailEn || day.detailAr || "",
  }));

  return {
    id: program.id,
    slug: slugify(program.titleEn || dest, `ai-${program.id}`),
    title: program.titleEn || program.titleAr,
    titleAr: program.titleAr || program.titleEn,
    titleEn: program.titleEn || program.titleAr,
    titleTr: program.titleEn || program.titleAr,
    destination: dest,
    destinationAr: dest,
    destinationEn: dest,
    destinationTr: dest,
    country: "Turkey",
    countryAr: "تركيا",
    countryEn: "Turkey",
    countryTr: "Türkiye",
    destinations: [dest],
    destinationsEn: [dest],
    destinationsAr: [dest],
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
