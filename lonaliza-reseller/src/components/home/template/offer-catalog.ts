import { fetchPublishedPackages } from "@/data/packages-client";
import { getActiveHotels } from "@/data/hotels";
import { getActiveFlights } from "@/data/flights";
import { getActiveTransfers } from "@/data/transfers";
import { getActiveTours } from "@/data/tours";
import { getActiveVisaData } from "@/data/visa";
import { CAR_RENTAL_OFFERS } from "@/data/car-rental-offers";
import { TRANSFER_OFFERS } from "@/data/transfer-offers";
import { buildCarsSearchHref } from "@/lib/cars-search-href";
import { tContent } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/types";
import type { HeroOfferKind, HeroPackageItem } from "@/lib/visual-editor/schema";

export type OfferCatalogEntry = {
  kind: HeroOfferKind;
  liveId: string;
  title: string;
  tagline: string;
  image: string;
  price: number;
  href: string;
  days?: number;
};

const FLIGHT_IMAGE =
  "https://images.unsplash.com/photo-1436491865331-4ffd164736ca?w=640&q=70";

const PER_KIND = 16;

function pickLocale(
  locale: Locale,
  ar?: string,
  en?: string,
  tr?: string
): string {
  if (locale === "ar") return ar || en || tr || "";
  if (locale === "tr") return tr || en || ar || "";
  return en || ar || tr || "";
}

function visaPrice(raw: string): number {
  const match = raw.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

export function catalogKey(kind: HeroOfferKind, liveId: string): string {
  return `${kind}:${liveId}`;
}

export function itemCatalogKey(item: HeroPackageItem): string | null {
  if (item.source !== "live" || !item.liveId) return null;
  return catalogKey(item.kind || "package", item.liveId);
}

export async function loadOfferCatalog(locale: Locale): Promise<OfferCatalogEntry[]> {
  const packages = await fetchPublishedPackages();
  const hotels = getActiveHotels();
  const flights = getActiveFlights();
  const transfers = getActiveTransfers().filter((row) => row.type === "transfer");
  const vipTours = getActiveTransfers().filter((row) => row.type === "vip_tour");
  const dayTours: OfferCatalogEntry[] = getActiveTours().map((tour) => ({
    kind: "tour",
    liveId: `tour-${tour.id}`,
    title: tour.title,
    tagline: `${tour.category} · ${tour.duration}`,
    image: tour.image,
    price: tour.price,
    href: "/vip-tours",
  }));
  const visas = getActiveVisaData();

  const packageEntries: OfferCatalogEntry[] = packages.slice(0, PER_KIND).map((pkg) => ({
    kind: "package",
    liveId: pkg.id,
    title: tContent(pkg, "title", locale) || pkg.title,
    tagline: tContent(pkg, "destination", locale) || pkg.destination,
    image: pkg.images[0]?.url || "",
    price: pkg.price,
    href: `/package/${pkg.slug}`,
    days: pkg.durationDays,
  }));

  const hotelEntries: OfferCatalogEntry[] = hotels.slice(0, PER_KIND).map((hotel) => ({
    kind: "hotel",
    liveId: hotel.id,
    title: locale === "ar" ? hotel.nameAr || hotel.nameEn : hotel.nameEn || hotel.nameAr,
    tagline: hotel.city,
    image: hotel.images[0] || "",
    price: hotel.rooms[0]?.price || 0,
    href: `/hotels/${hotel.slug}`,
  }));

  const flightEntries: OfferCatalogEntry[] = flights.slice(0, PER_KIND).map((flight) => ({
    kind: "flight",
    liveId: flight.id,
    title: `${flight.departure.city} → ${flight.arrival.city}`,
    tagline: flight.airline,
    image: FLIGHT_IMAGE,
    price: flight.price,
    href: `/flights?from=${encodeURIComponent(flight.departure.airport)}&to=${encodeURIComponent(flight.arrival.airport)}`,
  }));

  const transferFromOffers: OfferCatalogEntry[] = TRANSFER_OFFERS.slice(0, 8).map((offer) => ({
    kind: "transfer" as const,
    liveId: `offer-${offer.id}`,
    title: pickLocale(locale, offer.titleAr, offer.titleEn, offer.titleTr),
    tagline: pickLocale(locale, offer.routeAr, offer.routeEn, offer.routeTr),
    image: offer.image,
    price: offer.priceFromUsd,
    href: "/transfers",
  }));

  const transferLive: OfferCatalogEntry[] = transfers.slice(0, PER_KIND).map((row) => ({
    kind: "transfer" as const,
    liveId: row.id,
    title: pickLocale(locale, row.titleAr, row.titleEn, row.titleTr),
    tagline: [row.routeFrom, row.routeTo].filter(Boolean).join(" → "),
    image: row.images[0] || "",
    price: row.price,
    href: `/transfers/${row.slug}`,
  }));

  const carEntries: OfferCatalogEntry[] = CAR_RENTAL_OFFERS.slice(0, PER_KIND).map((car) => ({
    kind: "car",
    liveId: car.id,
    title: pickLocale(locale, car.titleAr, car.titleEn, car.titleTr),
    tagline: pickLocale(locale, car.cityAr, car.cityEn, car.cityTr),
    image: car.image,
    price: car.priceFromUsd,
    href: buildCarsSearchHref({ iata: car.iata, locale }),
  }));

  const visaEntries: OfferCatalogEntry[] = visas.slice(0, PER_KIND).map((visa) => ({
    kind: "visa",
    liveId: visa.id,
    title: visa.country,
    tagline: visa.types[0]?.name || "eVisa",
    image: "",
    price: visaPrice(visa.types[0]?.price || ""),
    href: `/visa?q=${encodeURIComponent(visa.country)}`,
  }));

  const tourEntries: OfferCatalogEntry[] = [
    ...vipTours.slice(0, PER_KIND).map((tour) => ({
      kind: "tour" as const,
      liveId: tour.id,
      title: pickLocale(locale, tour.titleAr, tour.titleEn, tour.titleTr),
      tagline: [tour.routeFrom, tour.routeTo].filter(Boolean).join(" · "),
      image: tour.images[0] || "",
      price: tour.price,
      href: `/vip-tours/${tour.slug}`,
    })),
    ...dayTours.slice(0, Math.max(0, PER_KIND - vipTours.length)),
  ].slice(0, PER_KIND);

  return [
    ...packageEntries,
    ...hotelEntries,
    ...flightEntries,
    ...transferFromOffers,
    ...transferLive,
    ...carEntries,
    ...visaEntries,
    ...tourEntries,
  ];
}

export const OFFER_KIND_LABEL: Record<
  HeroOfferKind,
  { ar: string; en: string; tr: string; fr?: string; [k: string]: string | undefined }
> = {
  package: { ar: "باقات", en: "Packages", tr: "Paketler", fr: "Forfaits" },
  hotel: { ar: "فنادق", en: "Hotels", tr: "Oteller", fr: "Hôtels" },
  flight: { ar: "طيران", en: "Flights", tr: "Uçuşlar", fr: "Vols" },
  transfer: { ar: "ترانسفير", en: "Transfers", tr: "Transferler", fr: "Transferts" },
  car: { ar: "سيارات", en: "Cars", tr: "Araçlar", fr: "Voitures" },
  visa: { ar: "تأشيرات", en: "Visas", tr: "Vizeler", fr: "Visas" },
  tour: { ar: "جولات", en: "Tours", tr: "Turlar", fr: "Excursions" },
};
