"use client";

import { use, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Star,
  Users,
  BedDouble,
  Check,
  MessageCircle,
  Coffee,
  ShieldCheck,
  Maximize2,
  Clock,
} from "lucide-react";
import { getActiveHotels, getHotelBySlug } from "@/data/hotels";
import type { Hotel, HotelRoom } from "@/types/hotel";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/types";
import { tContent } from "@/lib/utils";
import {
  buildBusinessWhatsAppLink,
  formatWhatsAppDisplay,
  getBusinessWhatsAppNumber,
} from "@/lib/site-whatsapp";
import HotelReviewsSection from "@/components/hotels/HotelReviewsSection";
import VerifiedCustomerReviews from "@/components/reviews/VerifiedCustomerReviews";
import TravelAdvisorHotelDetail from "@/components/hotels/TravelAdvisorHotelDetail";
import SupplierHotelDetail from "@/components/hotels/SupplierHotelDetail";
import { defaultHotelDates, parseHotelApiId, parseHotelRouteSource } from "@/lib/hotels-config";

const SUPPLIER_SOURCES = new Set(["hotelbeds", "travelport", "ratehawk", "seeru"]);

const HotelLocationMap = dynamic(() => import("@/components/maps/HotelLocationMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] rounded-2xl bg-slate-100 animate-pulse" />
  ),
});

interface Props {
  params: Promise<{ slug: string }>;
}

function roomWhatsAppLink(hotel: Hotel, room: HotelRoom, locale: Locale) {
  const roomName = tContent(room, "name", locale);
  const hotelName = tContent(hotel, "name", locale);
  const base = tContent(hotel, "whatsappMessage", locale);
  const roomLine =
    locale === "ar"
      ? `\n\nالغرفة المطلوبة: ${roomName}`
      : locale === "tr"
        ? `\n\nİstenen oda: ${roomName}`
        : `\n\nRequested room: ${roomName}`;
  return buildBusinessWhatsAppLink(`${base}${roomLine}\nHotel: ${hotelName}`);
}

export default function HotelDetailPage({ params }: Props) {
  const { slug } = use(params);
  const { locale, t } = useLocale();
  const [hotel, setHotel] = useState<Hotel | null | undefined>(undefined);
  const [activeImage, setActiveImage] = useState(0);
  const [search, setSearch] = useState({
    checkIn: "",
    checkOut: "",
    adults: "2",
    rooms: "1",
    children: "",
    q: "Istanbul",
    sid: "",
    master: "",
    ready: false,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const defaults = defaultHotelDates();
    setSearch({
      checkIn: params.get("checkIn") || defaults.checkIn,
      checkOut: params.get("checkOut") || defaults.checkOut,
      adults: params.get("adults") || "2",
      rooms: params.get("rooms") || "1",
      children: params.get("children") || "",
      q: params.get("q") || "Istanbul",
      sid: params.get("sid") || "",
      master: params.get("master") || "",
      ready: true,
    });
  }, []);

  useEffect(() => {
    setHotel(getHotelBySlug(slug) || null);
    setActiveImage(0);
  }, [slug]);

  const cleanSlug = decodeURIComponent(String(slug || "").trim());
  const staticHotel = getHotelBySlug(cleanSlug) || getHotelBySlug(slug);
  const isApiHotel = !staticHotel;
  const routeSource = parseHotelRouteSource(cleanSlug);

  if (isApiHotel && routeSource && SUPPLIER_SOURCES.has(routeSource)) {
    // Supplier-backed hotel (Hotelbeds / RateHawk / Travelport / Seeru): wait for the URL params so the
    // first request already carries the search session and master id.
    if (!search.ready) return <div className="min-h-screen bg-slate-50" />;
    return (
      <SupplierHotelDetail
        slug={cleanSlug}
        checkIn={search.checkIn}
        checkOut={search.checkOut}
        adults={search.adults}
        rooms={search.rooms}
        childrenAges={search.children}
        query={search.q}
        sessionId={search.sid || undefined}
        masterId={search.master || undefined}
      />
    );
  }

  if (isApiHotel) {
    return (
      <TravelAdvisorHotelDetail
        slug={cleanSlug}
        checkIn={search.checkIn || defaultHotelDates().checkIn}
        checkOut={search.checkOut || defaultHotelDates().checkOut}
        adults={search.adults}
        query={search.q}
      />
    );
  }

  if (hotel === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!hotel || !hotel.isActive) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-slate-500 text-lg">{t.hotels.noHotels}</p>
        <Link href="/hotels" className="text-orange-600 font-semibold hover:underline">
          ← {t.hotels.title}
        </Link>
      </div>
    );
  }

  const name = tContent(hotel, "name", locale);
  const description = tContent(hotel, "description", locale);
  const address = tContent(hotel, "address", locale);
  const neighborhood = tContent(hotel, "neighborhood", locale);
  const highlights =
    (locale === "ar" || locale === "tr") ? hotel.highlightsAr : hotel.highlightsEn;
  const policies = (locale === "ar" || locale === "tr") ? hotel.policiesAr : hotel.policiesEn;
  const nearby =
    (locale === "ar" || locale === "tr") ? hotel.nearbyAr || [] : hotel.nearbyEn || [];
  const waHotelLink = buildBusinessWhatsAppLink(
    tContent(hotel, "whatsappMessage", locale)
  );
  const businessWa = getBusinessWhatsAppNumber();
  const fromPrice = hotel.rooms.length
    ? Math.min(...hotel.rooms.map((r) => r.price))
    : null;
  const currency = hotel.rooms[0]?.currency || "USD";
  const images =
    hotel.images.length > 0
      ? hotel.images
      : [
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200",
        ];
  const mainImage = images[Math.min(activeImage, images.length - 1)];

  return (
    <>
      {/* Gallery */}
      <section className="bg-slate-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/hotels"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            {t.hotels.title}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 rounded-2xl overflow-hidden">
            <div className="relative lg:col-span-3 h-[280px] sm:h-[380px] lg:h-[460px]">
              <Image
                src={mainImage}
                alt={name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="grid grid-cols-4 lg:grid-cols-1 gap-2">
              {images.slice(0, 4).map((img, i) => (
                <button
                  key={img + i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`relative h-16 lg:h-[calc((460px-24px)/4)] overflow-hidden transition-opacity ${
                    activeImage === i
                      ? "ring-2 ring-orange-400 opacity-100"
                      : "opacity-80 hover:opacity-100"
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-10">
              {/* Title block */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {Array.from({ length: hotel.stars }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="text-amber-400 fill-amber-400"
                    />
                  ))}
                  <span className="ms-2 inline-flex items-center gap-1 px-2.5 py-1 bg-[#003580] text-white text-sm font-bold rounded">
                    {hotel.rating.toFixed(1)}
                  </span>
                  <span className="text-slate-500 text-sm">
                    {hotel.reviewCount.toLocaleString()} {t.hotels.reviews}
                  </span>
                </div>
                <h1
                  className="text-3xl md:text-4xl font-bold text-slate-900 mb-3"
                  style={{ fontFamily: "var(--font-sora)" }}
                >
                  {name}
                </h1>
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p>{address || `${hotel.city}, ${hotel.country}`}</p>
                    {neighborhood && (
                      <p className="text-sm text-slate-400 mt-0.5">
                        {neighborhood} · {hotel.city}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={14} className="text-orange-500" />
                    {t.hotels.checkIn}: {hotel.checkIn}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={14} className="text-orange-500" />
                    {t.hotels.checkOut}: {hotel.checkOut}
                  </span>
                </div>
              </div>

              {/* Highlights */}
              {highlights.length > 0 && (
                <div className="bg-sky-50 border border-sky-100 rounded-2xl p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-4">
                    {t.hotels.highlights}
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-2 text-slate-700 text-sm"
                      >
                        <Check
                          size={16}
                          className="text-sky-600 mt-0.5 flex-shrink-0"
                        />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Description */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-3">{name}</h2>
                <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line">
                  {description}
                </p>
              </div>

              {/* Amenities */}
              {hotel.amenities.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    {t.hotels.amenities}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {hotel.amenities.map((a) => (
                      <div
                        key={a}
                        className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-700"
                      >
                        <Check size={14} className="text-orange-500 flex-shrink-0" />
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {nearby.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    {t.hotels.nearby}
                  </h2>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {nearby.map((place) => (
                      <li
                        key={place}
                        className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 text-slate-700 text-sm"
                      >
                        <MapPin size={14} className="text-amber-600 flex-shrink-0" />
                        {place}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {hotel.guestReviews && hotel.guestReviews.length > 0 && (
                <HotelReviewsSection
                  reviews={hotel.guestReviews}
                  locale={locale}
                  title={t.hotels.guestReviews}
                  note={t.hotels.guestReviewsNote}
                  loadMoreLabel={t.hotels.loadMoreReviews}
                  showingLabel={(shown, total) =>
                    t.hotels.showingReviews(shown, total)
                  }
                />
              )}

              <VerifiedCustomerReviews
                serviceType="hotel"
                serviceId={hotel.id}
                serviceName={name}
              />

              {/* Rooms */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  {t.hotels.rooms}
                </h2>
                <div className="space-y-5">
                  {hotel.rooms.map((room) => {
                    const roomName = tContent(room, "name", locale);
                    const roomDesc = tContent(room, "description", locale);
                    const waRoom = roomWhatsAppLink(hotel, room, locale);

                    return (
                      <div
                        key={room.id}
                        className="flex flex-col sm:flex-row gap-5 p-5 rounded-2xl border border-slate-200 hover:border-orange-200 hover:shadow-md transition-all bg-white"
                      >
                        <div className="relative w-full sm:w-44 h-36 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                          <Image
                            src={
                              room.images[0] ||
                              "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800"
                            }
                            alt={roomName}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-slate-900 mb-1">
                            {roomName}
                          </h3>
                          <p className="text-slate-500 text-sm mb-3 leading-relaxed">
                            {roomDesc}
                          </p>
                          <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
                            <span className="flex items-center gap-1">
                              <BedDouble size={12} />
                              {room.beds}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={12} />
                              {room.capacity}
                            </span>
                            {room.sizeSqm > 0 && (
                              <span className="flex items-center gap-1">
                                <Maximize2 size={12} />
                                {room.sizeSqm} m²
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {room.breakfastIncluded && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-md">
                                <Coffee size={11} />
                                {t.hotels.breakfastIncluded}
                              </span>
                            )}
                            {room.freeCancellation && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-md">
                                <ShieldCheck size={11} />
                                {t.hotels.freeCancellation}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {room.amenities.map((a) => (
                              <span
                                key={a}
                                className="px-2 py-0.5 bg-orange-50 text-orange-700 text-xs rounded-md"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 flex-shrink-0 sm:min-w-[160px]">
                          <div className="text-end">
                            <span className="text-2xl font-bold text-slate-900">
                              {room.currency} {room.price}
                            </span>
                            <span className="block text-xs text-slate-400">
                              {t.hotels.perNight}
                            </span>
                          </div>
                          <Link
                            href={`/hotels/book?hotel=${encodeURIComponent(hotel.slug)}&hotelName=${encodeURIComponent(name)}&room=${encodeURIComponent(room.id)}&roomName=${encodeURIComponent(roomName)}&provider=internal&price=${room.price}&currency=${room.currency}`}
                            className="inline-flex items-center justify-center px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl w-full sm:w-auto"
                          >
                            {t.hotels.bookNow}
                          </Link>
                          <a
                            href={waRoom}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#25D366] hover:bg-[#1ebe57] text-white text-sm font-bold rounded-xl shadow-md transition-all whitespace-nowrap w-full sm:w-auto"
                          >
                            <MessageCircle size={15} />
                            {t.hotels.bookWhatsApp}
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Map */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  {t.hotels.mapTitle}
                </h2>
                <HotelLocationMap
                  hotelLat={hotel.lat}
                  hotelLng={hotel.lng}
                  hotelLabel={name}
                  nearbyPlaces={hotel.nearbyPlaces}
                  nearbyHotels={getActiveHotels()
                    .filter((h) => h.id !== hotel.id && h.city === hotel.city && h.lat && h.lng)
                    .slice(0, 8)
                    .map((h) => ({
                      lat: h.lat,
                      lng: h.lng,
                      label: tContent(h, "name", locale),
                      price: h.rooms.length
                        ? Math.min(...h.rooms.map((r) => r.price))
                        : undefined,
                      currency: h.rooms[0]?.currency || "USD",
                      href: `/hotels/${h.slug}`,
                    }))}
                  locale={locale}
                  height={360}
                />
                <p className="text-sm text-slate-500 mt-2 flex items-center gap-1">
                  <MapPin size={14} />
                  {address}
                </p>
              </div>

              {/* Policies */}
              {policies.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    {t.hotels.policies}
                  </h2>
                  <ul className="space-y-2">
                    {policies.map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-2 text-slate-600 text-sm"
                      >
                        <Check
                          size={14}
                          className="text-slate-400 mt-0.5 flex-shrink-0"
                        />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sticky CTA */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
                <h3 className="text-lg font-bold mb-1">{name}</h3>
                <p className="text-white/50 text-sm mb-1">
                  {neighborhood || hotel.city}, {hotel.country}
                </p>
                <div className="flex items-center gap-2 mb-6">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#003580] text-white text-xs font-bold rounded">
                    {hotel.rating.toFixed(1)}
                  </span>
                  <span className="text-white/40 text-xs">
                    {hotel.reviewCount.toLocaleString()} {t.hotels.reviews}
                  </span>
                </div>

                {fromPrice != null && (
                  <p className="mb-6">
                    <span className="text-white/40 text-sm">{t.hotels.from} </span>
                    <span className="text-3xl font-bold text-amber-400">
                      {currency} {fromPrice}
                    </span>
                    <span className="text-white/40 text-sm">
                      {" "}
                      / {t.hotels.perNight}
                    </span>
                  </p>
                )}

                <Link
                  href={`/hotels/book?hotel=${encodeURIComponent(hotel.slug)}&hotelName=${encodeURIComponent(name)}&provider=internal&price=${fromPrice ?? ""}&currency=${currency}`}
                  className="flex w-full items-center justify-center gap-2 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl mb-3"
                >
                  {t.hotels.bookNow}
                </Link>
                <a
                  href={waHotelLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 py-3.5 bg-[#25D366] hover:bg-[#1ebe57] text-white font-bold rounded-xl shadow-lg transition-all"
                >
                  <MessageCircle size={18} />
                  {t.hotels.bookWhatsApp}
                </a>

                <div className="mt-5 pt-5 border-t border-white/10 space-y-2 text-sm text-white/50">
                  <p>
                    {t.hotels.checkIn}:{" "}
                    <span className="text-white/80">{hotel.checkIn}</span>
                  </p>
                  <p>
                    {t.hotels.checkOut}:{" "}
                    <span className="text-white/80">{hotel.checkOut}</span>
                  </p>
                  <p className="font-mono text-emerald-400/80 text-xs pt-1">
                    WhatsApp: {formatWhatsAppDisplay(businessWa)}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
