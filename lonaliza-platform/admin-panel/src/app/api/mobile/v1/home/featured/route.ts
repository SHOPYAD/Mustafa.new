import { NextResponse } from "next/server";
import { listMergedPackages } from "@/lib/server/packages-store";
import { listActiveInternalCars } from "@/lib/server/cars-store";
import { readFlightDealsCache } from "@/lib/server/flight-deals-cache";
import type { HomepageFlightDealsPayload } from "@/lib/flight-deals-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cardImage(raw: unknown): string {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw) && raw[0]) {
    const first = raw[0] as { url?: string } | string;
    return typeof first === "string" ? first : String(first.url || "");
  }
  return "";
}

const FEATURED_HOTELS = [
  {
    id: "ciragan",
    slug: "ciragan-palace-kempinski-istanbul",
    title: "قصر تشراغان كمبينسكي",
    subtitle: "البوسفور، إسطنبول",
    city: "Istanbul",
    stars: 5,
    rating: 9.4,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80",
    price: 420,
    currency: "USD",
    href: "/hotels/ciragan-palace-kempinski-istanbul",
    type: "hotel",
  },
  {
    id: "raffles",
    slug: "raffles-istanbul",
    title: "رافلز إسطنبول",
    subtitle: "زينجيرلي كوي",
    city: "Istanbul",
    stars: 5,
    rating: 9.2,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
    price: 380,
    currency: "USD",
    href: "/hotels/raffles-istanbul",
    type: "hotel",
  },
  {
    id: "four-seasons",
    slug: "four-seasons-hotel-istanbul-at-the-bosphorus",
    title: "فور سيزونز البوسفور",
    subtitle: "بشكتاش",
    city: "Istanbul",
    stars: 5,
    rating: 9.3,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
    price: 410,
    currency: "USD",
    href: "/hotels/four-seasons-hotel-istanbul-at-the-bosphorus",
    type: "hotel",
  },
  {
    id: "peninsula",
    slug: "the-peninsula-istanbul",
    title: "ذا بنينسولا إسطنبول",
    subtitle: "القرن الذهبي",
    city: "Istanbul",
    stars: 5,
    rating: 9.1,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
    price: 450,
    currency: "USD",
    href: "/hotels/the-peninsula-istanbul",
    type: "hotel",
  },
];

export async function GET() {
  const [packages, cars, dealsHit] = await Promise.all([
    listMergedPackages().catch(() => []),
    listActiveInternalCars().catch(() => []),
    readFlightDealsCache<HomepageFlightDealsPayload>("homepage:v1").catch(() => null),
  ]);

  const packageCards = packages.slice(0, 10).map((pkg) => ({
    id: pkg.id,
    slug: pkg.slug,
    title: pkg.titleAr || pkg.title,
    subtitle: pkg.destinationAr || pkg.destination,
    city: pkg.destination,
    nights: pkg.durationNights || pkg.durationDays,
    rating: pkg.rating,
    image: cardImage(pkg.images),
    price: pkg.price,
    currency: pkg.currency || "USD",
    href: `/holidays/${pkg.slug}`,
    type: "package",
  }));

  const carCards = cars.slice(0, 8).map((car) => ({
    id: car.id,
    slug: car.slug,
    title: car.nameAr || car.name,
    subtitle: car.category,
    image: car.image,
    price: car.pricePerDay,
    currency: car.currency || "USD",
    href: "/cars",
    type: "car",
  }));

  const deals = (dealsHit?.value?.deals || dealsHit?.value?.groups?.flatMap((group) => group.offers) || [])
    .slice(0, 8)
    .map((deal) => ({
      id: deal.id || `${deal.originIata}-${deal.destIata}`,
      title: `${deal.originNameAr || deal.originIata} → ${deal.destNameAr || deal.destIata}`,
      subtitle: deal.airlineName || "عرض طيران",
      image: deal.destImage || "",
      price: deal.price,
      currency: deal.currency || "USD",
      href: deal.href || "/flights",
      type: "flight",
    }));

  return NextResponse.json({
    ok: true,
    hotels: FEATURED_HOTELS,
    packages: packageCards,
    cars: carCards,
    flights: deals,
  });
}
