"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import CardSlider from "@/components/ui/CardSlider";
import HotelListCard from "@/components/hotels/HotelListCard";
import FlightResultCard from "@/components/flights/FlightResultCard";
import { flightCopy } from "@/components/flights/copy";
import { itineraryFrom } from "@/components/flights/normalize";
import type { Itinerary, SelectedFare } from "@/components/flights/types";
import type { TravelAdvisorHotelCard } from "@/types/travel-advisor";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export type OfficialFlight = {
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

export type OfficialFlightItineraryEntry = {
  cityIata: string;
  cityName: string;
  originCode: string;
  itinerary: Record<string, unknown>;
};

export type TourismProgramDay = {
  day: number;
  titleAr: string;
  bodyAr: string;
};

export type OfficialHotel = {
  city: string;
  name: string;
  image: string;
  rating: string;
  roomType: string;
  bedType: string;
  price: string;
  currency: string;
};

export type OfficialArticlePayload = {
  titleAr: string;
  introAr: string;
  cities: Array<{
    name: string;
    nameAr: string;
    iata: string;
    distinctionAr: string;
    activities: string[];
    programDays?: TourismProgramDay[];
    gallery: Array<{ url: string; alt: string }>;
  }>;
  flights: OfficialFlight[];
  flightItineraries?: OfficialFlightItineraryEntry[];
  hotels: OfficialHotel[];
  faq: Array<{ q: string; a: string }>;
};

export function parseOfficialArticle(html: string): OfficialArticlePayload | null {
  const match = html.match(/<script type="application\/json" id="lonaliza-official-article">([\s\S]*?)<\/script>/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1]) as OfficialArticlePayload;
    if (!parsed?.titleAr || !Array.isArray(parsed.cities)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function hotelCard(hotel: OfficialHotel, index: number): TravelAdvisorHotelCard {
  const price = Number(hotel.price);
  const rating = Number(hotel.rating);
  return {
    id: `${hotel.city}-${index}`,
    name: hotel.name,
    city: hotel.city,
    country: "France",
    neighborhood: "",
    stars: 0,
    rating: Number.isFinite(rating) ? rating : 0,
    reviewCount: 0,
    image: hotel.image,
    images: hotel.image ? [hotel.image] : [],
    badges: [],
    snippet: "",
    priceFrom: Number.isFinite(price) ? price : null,
    priceOriginal: null,
    currency: hotel.currency || "USD",
    lat: 0,
    lng: 0,
    address: "",
    locationText: hotel.city,
    roomType: hotel.roomType || "",
    bedType: hotel.bedType || "",
    cancellation: "",
    amenities: [],
    distanceText: "",
    nightly: Number.isFinite(price) ? price : null,
    totalStay: null,
    priceIsStayTotal: false,
    nights: 1,
    discountPct: 0,
    hurryLeft: 0,
    source: "supplier",
  };
}

function flightsForCity(city: OfficialArticlePayload["cities"][number], article: OfficialArticlePayload): Itinerary[] {
  const entries =
    article.flightItineraries?.filter(
      (row) => row.cityIata === city.iata || row.cityName.toLowerCase() === city.name.toLowerCase()
    ) || [];
  const fromEngine = entries
    .map((entry) => {
      const currency =
        (entry.itinerary as { price?: { currency?: string } })?.price?.currency ||
        article.flights[0]?.currency ||
        "USD";
      return itineraryFrom(entry.itinerary, currency, "economy");
    })
    .filter((item): item is Itinerary => Boolean(item));
  if (fromEngine.length) return fromEngine;
  return [];
}

export default function OfficialArticleBody({ article }: { article: OfficialArticlePayload }) {
  const { locale } = useLocale();
  const router = useRouter();
  const copy = useMemo(() => flightCopy(locale), [locale]);
  const onSelect = useCallback(
    (_selection: SelectedFare) => {
      router.push("/flights");
    },
    [router]
  );

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faq.map((row) => ({
      "@type": "Question",
      name: row.q,
      acceptedAnswer: { "@type": "Answer", text: row.a },
    })),
  };

  return (
    <div data-official-article="1">
      <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-5">{article.titleAr}</h1>
      <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-8">{article.introAr}</p>
      {article.cities.map((city) => {
        const cityFlights = flightsForCity(city, article);
        const cityHotels = article.hotels.filter((hotel) => hotel.city.toLowerCase().includes(city.name.toLowerCase()));
        const programDays = city.programDays || [];
        return (
          <section key={city.name} className="mb-12">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{city.nameAr}</h2>
            <div data-landmark-gallery={city.name}>
              <CardSlider title="">
                {city.gallery.map((photo) => (
                  <img
                    key={photo.url}
                    src={photo.url}
                    alt={photo.alt}
                    className="h-52 w-[280px] shrink-0 snap-start rounded-2xl object-cover"
                  />
                ))}
              </CardSlider>
            </div>
            <p className="mt-4 text-slate-700 dark:text-slate-300 leading-relaxed">{city.distinctionAr}</p>
            <h3 className="mt-6 text-xl font-bold text-emerald-800 dark:text-emerald-400">الأنشطة</h3>
            <ul className="mt-2 list-disc ps-5 text-slate-700 dark:text-slate-300">
              {city.activities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h3 data-tourism-program={city.name} className="mt-6 text-xl font-bold text-emerald-800 dark:text-emerald-400">
              البرنامج السياحي متعدد الأيام
            </h3>
            {programDays.map((day) => (
              <div key={`${city.name}-day-${day.day}`} className="mt-4">
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  اليوم {day.day}: {day.titleAr}
                </h4>
                <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed">{day.bodyAr}</p>
              </div>
            ))}
            <div data-flight-slider="true" data-city={city.name} className="mt-6 lonaliza-carousel-wrap">
              <CardSlider title="">
                {cityFlights.map((item) => (
                  <div key={item.id} className="w-full min-w-[min(100%,760px)] max-w-3xl shrink-0 snap-start">
                    <FlightResultCard item={item} copy={copy} onSelect={onSelect} />
                  </div>
                ))}
              </CardSlider>
            </div>
            <div data-hotel-slider="true" data-city={city.name} className="mt-6">
              <CardSlider title="">
                {cityHotels.map((hotel, index) => (
                  <div key={`${hotel.name}-${index}`} className="w-[640px] max-w-[90vw] shrink-0 snap-start">
                    <HotelListCard hotel={hotelCard(hotel, index)} href={`/hotels?q=${encodeURIComponent(hotel.city)}`} />
                  </div>
                ))}
              </CardSlider>
            </div>
          </section>
        );
      })}
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">الأسئلة الشائعة</h2>
      {article.faq.map((row) => (
        <div key={row.q} className="mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{row.q}</h3>
          <p className="text-slate-700 dark:text-slate-300">{row.a}</p>
        </div>
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </div>
  );
}
