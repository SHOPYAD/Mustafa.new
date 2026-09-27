"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CalendarX, ChevronLeft, ChevronRight, Languages, X } from "lucide-react";
import HotelFeatureIcon from "@/components/hotels/HotelFeatureIcon";
import HotelOfferCompare from "@/components/hotels/HotelOfferCompare";
import HotelPaymentChannels from "@/components/hotels/HotelPaymentChannels";
import HotelRoomCard from "@/components/hotels/HotelRoomCard";
import ReviewsAgentSkeleton from "@/components/hotels/ReviewsAgentSkeleton";
import { hotelApiSlug, parseHotelApiJson, parseHotelRouteSource } from "@/lib/hotels-config";
import { useHotelsConfig } from "@/hooks/useHotelsConfig";
import { usePaymentsPublicConfig } from "@/hooks/usePaymentsPublicConfig";
import { hotelRatingLabel, nightsBetween, stayFromNightly } from "@/lib/hotel-display";
import { localizeHotelLabel, localizeRoomType } from "@/lib/hotel-i18n";
import {
  alrayyanNightlyFromOffers,
  cheapestNightly,
  fallbackRoomsFromCompare,
  isUsableHotelDescription,
  isRealRoomName,
  type HotelOfferSource,
} from "@/lib/hotel-offers";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type {
  TravelAdvisorHotelCard,
  TravelAdvisorHotelDetails,
  TravelAdvisorRoom,
} from "@/types/travel-advisor";

const HotelLocationMap = dynamic(() => import("@/components/maps/HotelLocationMap"), {
  ssr: false,
  loading: () => <div className="h-[320px] rounded-2xl bg-slate-100 animate-pulse" />,
});

type Props = {
  slug: string;
  checkIn: string;
  checkOut: string;
  adults: string;
  query: string;
};

export default function TravelAdvisorHotelDetail({
  slug,
  checkIn,
  checkOut,
  adults,
  query,
}: Props) {
  const { locale, t } = useLocale();
  const { formatPrice } = useCurrency();
  const { config } = useHotelsConfig();
  const { config: payConfig } = usePaymentsPublicConfig();
  const paymentChannels = payConfig
    ? {
        cardEnabled: payConfig.iyzicoEnabled,
        whatsappEnabled: payConfig.whatsappBankLinkEnabled,
      }
    : null;
  const paymentChannelCopy = {
    paymentMethods: t.hotels.paymentMethods,
    payWhatsAppBank: t.hotels.payWhatsAppBank,
    bankLinkPayment: t.hotels.bankLinkPayment,
    cardPaymentAvailable: t.hotels.cardPaymentAvailable,
  };
  const bookingProvider =
    config.provider === "owned"
      ? "owned"
      : config.provider === "booking"
        ? "booking"
        : "travel_advisor";
  const [hotel, setHotel] = useState<TravelAdvisorHotelDetails | null>(null);
  const [nearby, setNearby] = useState<TravelAdvisorHotelCard[]>([]);
  const [offers, setOffers] = useState<HotelOfferSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [reviewVisible, setReviewVisible] = useState(10);
  const [showOriginal, setShowOriginal] = useState<Record<string, boolean>>({});
  const [reviewPage, setReviewPage] = useState(1);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const toggleOriginal = (id: string) => {
    setShowOriginal((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        const pageQs = new URLSearchParams(window.location.search);
        const bookingHotelId = pageQs.get("bookingHotelId") || "";
        const qs = new URLSearchParams({
          id: slug,
          checkIn,
          checkOut,
          adults,
          q: query,
          lang: locale,
        });
        if (bookingHotelId) qs.set("bookingHotelId", bookingHotelId);

        // Forward all query parameters (hotelName, price, nightly, image, stars, rating)
        for (const [key, val] of pageQs.entries()) {
          if (!qs.has(key) && val) {
            qs.set(key, val);
          }
        }

        const skipOffers = parseHotelRouteSource(slug) === "booking" || Boolean(bookingHotelId);
        const [detailRes, offerRes] = await Promise.all([
          fetch(`/api/hotels/details?${qs}`, { cache: "no-store" }),
          skipOffers
            ? Promise.resolve(null)
            : fetch(`/api/hotels/offers?${qs}`, { cache: "no-store" }),
        ]);
        const detailJson = parseHotelApiJson(await detailRes.text());
        const offerJson = offerRes ? parseHotelApiJson(await offerRes.text()) : { offers: [] };
        if (cancelled) return;
        const hotelData = (detailJson.hotel as TravelAdvisorHotelDetails | undefined) || null;
        if (hotelData) {
          if ((!hotelData.rooms || hotelData.rooms.length === 0) && Array.isArray(detailJson.rooms) && detailJson.rooms.length > 0) {
            hotelData.rooms = detailJson.rooms as TravelAdvisorRoom[];
          }
        }
        setHotel(hotelData);
        setReviewPage(1);
        setReviewVisible(6);
        setNearby(
          Array.isArray(detailJson.nearby)
            ? (detailJson.nearby as TravelAdvisorHotelCard[])
            : []
        );
        setOffers(
          Array.isArray(offerJson.offers)
            ? (offerJson.offers as HotelOfferSource[])
            : []
        );
        if (hotelData && (!hotelData.reviews || hotelData.reviews.length === 0) && hotelData.name) {
          setLoadingReviews(true);
          const revQs = new URLSearchParams({
            hotelId: hotelData.id,
            name: hotelData.name,
            city: hotelData.city || query,
            lang: locale,
          });
          if (hotelData.bookingHotelId) revQs.set("bookingHotelId", hotelData.bookingHotelId);
          void fetch(`/api/hotels/reviews?${revQs}`, { cache: "no-store" })
            .then((r) => r.json())
            .then((json) => {
              if (cancelled) return;
              if (Array.isArray(json?.reviews) && json.reviews.length > 0) {
                setHotel((current) =>
                  current
                    ? {
                        ...current,
                        reviews: json.reviews,
                        reviewCount: json.reviews.length,
                        rating: json.reviewScore?.score || current.rating,
                      }
                    : current
                );
              }
            })
            .catch(() => {})
            .finally(() => {
              if (!cancelled) setLoadingReviews(false);
            });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, checkIn, checkOut, adults, query, locale]);

  const stayNights = nightsBetween(checkIn, checkOut);

  const displayRooms = useMemo<TravelAdvisorRoom[]>(() => {
    if (hotel?.rooms && hotel.rooms.length > 0) {
      return hotel.rooms;
    }
    const fromHotel = (hotel?.rooms || []).filter((room) => isRealRoomName(room.name));
    if (fromHotel.length) return fromHotel;
    const images = (hotel?.images?.length ? hotel.images : hotel?.image ? [hotel.image] : []).filter(
      Boolean
    );
    const nightly =
      alrayyanNightlyFromOffers(offers) ?? hotel?.nightly ?? hotel?.priceFrom ?? null;
    return fallbackRoomsFromCompare(
      offers,
      images,
      Number(adults) || 2,
      t.hotels.bestAvailableRate,
      nightly,
      locale
    );
  }, [hotel, offers, adults, t.hotels.bestAvailableRate, locale]);

  const roomBookHref = useCallback(
    (room: TravelAdvisorRoom, price?: number | null, roomLabel?: string) => {
      const money = stayFromNightly(
        price ?? room.nightly ?? room.price ?? hotel?.nightly ?? hotel?.priceFrom,
        stayNights
      );
      const params = new URLSearchParams({
        hotel: slug,
        hotelName: hotel?.name || "",
        provider: bookingProvider,
        checkIn,
        checkOut,
        adults,
        price: String(money.total),
        room: room.id,
        roomName: roomLabel || room.name,
        currency: room.currency || hotel?.currency || "USD",
        hotelImage: hotel?.image || "",
        stars: String(hotel?.stars || 0),
        rating: String(hotel?.rating || 0),
        nightly: String(money.nightly),
        freeCancel: room.freeCancellation ? "1" : "0",
        nonRefundable: room.nonRefundable || !room.freeCancellation ? "1" : "0",
      });
      return `/hotels/book?${params}`;
    },
    [slug, hotel, checkIn, checkOut, adults, bookingProvider, stayNights]
  );

  const bookHref = useMemo(() => {
    if (displayRooms[0]) {
      return roomBookHref(displayRooms[0]);
    }
    const money = stayFromNightly(
      offers[0]?.price || hotel?.nightly || hotel?.priceFrom,
      stayNights
    );
    const params = new URLSearchParams({
      hotel: slug,
      hotelName: hotel?.name || "",
      provider: bookingProvider,
      checkIn,
      checkOut,
      adults,
      price: String(money.total || ""),
      nightly: String(money.nightly || ""),
      currency: hotel?.currency || "USD",
      hotelImage: hotel?.image || "",
      stars: String(hotel?.stars || 0),
      rating: String(hotel?.rating || 0),
    });
    return `/hotels/book?${params}`;
  }, [displayRooms, roomBookHref, offers, hotel, stayNights, slug, bookingProvider, checkIn, checkOut, adults]);

  const amenityGroups = useMemo(() => {
    if (hotel?.facilityGroups?.length) {
      const mapped: Record<string, string[]> = {};
      for (const group of hotel.facilityGroups) {
        const title = group.title || "general";
        mapped[title] = group.items.slice();
      }
      return mapped;
    }
    const groups: Record<string, string[]> = {
      wellness: [],
      food: [],
      services: [],
      general: [],
    };
    for (const item of hotel?.amenities || []) {
      if (/spa|sauna|gym|fitness|pool|swim|مسبح/i.test(item)) groups.wellness.push(item);
      else if (/breakfast|restaurant|bar|dining|coffee|إفطار/i.test(item)) groups.food.push(item);
      else if (/wifi|wi-fi|parking|airport|concierge|desk|واي/i.test(item)) groups.services.push(item);
      else groups.general.push(item);
    }
    return groups;
  }, [hotel]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-100">
        <div className="w-10 h-10 border-2 border-purple-500/20 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-slate-100">
        <p className="text-slate-500">{t.hotels.noHotels}</p>
        <Link href="/hotels" className="text-purple-900 font-semibold hover:underline">
          ← {t.hotels.title}
        </Link>
      </div>
    );
  }

  const images = (hotel.images?.length ? hotel.images : hotel.image ? [hotel.image] : []).filter(
    Boolean
  );
  const hasMap =
    Number.isFinite(hotel.lat) &&
    Number.isFinite(hotel.lng) &&
    !(hotel.lat === 0 && hotel.lng === 0);
  const thumbs = images.slice(1, 7);
  const startPrice = cheapestNightly(offers) ?? hotel.nightly ?? hotel.priceFrom;
  const stayTotal = startPrice != null ? stayFromNightly(startPrice, stayNights).total : hotel.totalStay;

  const tabs = [
    { id: "description", label: t.hotels.jumpOverview },
    { id: "amenities", label: t.hotels.amenities },
    { id: "rooms", label: t.hotels.rooms },
    { id: "reviews", label: t.hotels.guestReviews },
    { id: "qa", label: t.hotels.questionsAnswers },
    { id: "policies", label: t.hotels.policies },
    { id: "nearby", label: t.hotels.nearby },
    { id: "map", label: t.hotels.location },
  ];

  const locationText =
    hotel.locationText ||
    hotel.address ||
    `${hotel.neighborhood || hotel.city}, ${hotel.country}`;
  const descriptionText =
    hotel.description && isUsableHotelDescription(hotel.description) ? hotel.description : "";
  const visibleReviews = hotel.reviews.slice(0, reviewVisible);

  return (
    <div className="bg-[#f4efe6] pb-16 min-h-screen">
      <div className="relative overflow-hidden bg-[#051741] text-white pt-[4.5rem] md:pt-[4.75rem] mb-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(circle at 12% 28%, rgba(245,158,11,0.34), transparent 42%), radial-gradient(circle at 92% 8%, rgba(16,185,129,0.2), transparent 34%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12">
          <nav className="text-xs text-white/60 mb-3 flex flex-wrap gap-1">
            <Link href="/" className="hover:text-amber-300">{t.nav.home}</Link>
            <span>/</span>
            <Link href="/hotels" className="hover:text-amber-300">{t.hotels.title}</Link>
            <span>/</span>
            <span className="text-white">{hotel.name}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold">{hotel.name}</h1>
            {hotel.stars > 0
              ? Array.from({ length: hotel.stars }).map((_, i) => (
                  <span key={i} className="text-amber-400 text-lg leading-none" aria-hidden>
                    ★
                  </span>
                ))
              : null}
            {hotel.rating > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2 py-0.5 text-sm">
                <span className="rounded-md bg-white text-[#051741] px-1.5 font-bold">
                  {hotel.rating.toFixed(1)}
                </span>
                <span className="text-amber-200">{hotelRatingLabel(hotel.rating, t.hotels)}</span>
                {hotel.reviewCount > 0 ? (
                  <span className="text-white/70 text-xs">
                    {hotel.reviewCount.toLocaleString()} {t.hotels.reviews}
                  </span>
                ) : null}
              </span>
            ) : null}
          </div>
          <p className="flex flex-wrap items-center gap-2 text-white/75 text-sm mb-3">
            <HotelFeatureIcon label={locationText} kind="location" size={14} className="text-amber-400" />
            {locationText}
            {hasMap ? (
              <a href="#map" className="text-amber-300 font-semibold">
                {t.hotels.showOnMap}
              </a>
            ) : null}
          </p>
          <p className="text-amber-200 text-sm md:text-base max-w-2xl">{t.hotels.detailHeroLine}</p>
        </div>
        <div className="h-1 w-full bg-gradient-to-l from-amber-300 via-amber-500 to-[#2e1065]" />
      </div>

      <div className="max-w-7xl mx-auto px-4">

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 rounded-3xl overflow-hidden mb-8 shadow-[0_20px_60px_rgba(16,24,40,0.08)]">
          <button
            type="button"
            onClick={() => setLightbox(0)}
            className="relative lg:col-span-2 h-[240px] sm:h-[320px] lg:h-[420px] bg-slate-800"
          >
            {images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[0]} alt={hotel.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-white/50">{hotel.name}</div>
            )}
          </button>
          <div className="grid grid-cols-3 gap-2 lg:col-span-3">
            {Array.from({ length: 6 }).map((_, i) => {
              const img = thumbs[i] || images[(i + 1) % Math.max(1, images.length)] || images[0];
              return (
                <button
                  key={(img || "empty") + i}
                  type="button"
                  onClick={() => setLightbox(img ? i + 1 : 0)}
                  className="relative h-[116px] sm:h-[156px] lg:h-[206px] overflow-hidden bg-slate-800"
                >
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-white/25 text-xs">
                      {hotel.name}
                    </span>
                  )}
                  {i === 5 && images.length > 7 ? (
                    <span className="absolute inset-0 bg-slate-950/55 text-white text-sm font-bold flex items-center justify-center">
                      {t.hotels.viewAllPhotos} +{images.length - 7}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
          <div className="space-y-6">
            <div className="rounded-3xl bg-white border border-[#eadfcf] p-5 flex flex-wrap items-center gap-4">
              {hotel.rating > 0 ? (
                <div>
                  <p className="text-3xl font-bold text-[var(--navy)]">{hotel.rating.toFixed(1)}</p>
                  <p className="text-sm font-semibold">{hotelRatingLabel(hotel.rating, t.hotels)}</p>
                  {hotel.reviewCount > 0 ? (
                    <p className="text-xs text-slate-500">
                      {hotel.reviewCount.toLocaleString()} {t.hotels.reviews}
                    </p>
                  ) : null}
                </div>
              ) : null}
              {hotel.highlights?.length ? (
                <ul className="flex flex-wrap gap-2">
                  {hotel.highlights.slice(0, 6).map((item) => (
                    <li
                      key={item}
                      className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs text-purple-950 border border-purple-200/60 font-medium"
                    >
                      <HotelFeatureIcon label={item} size={16} /> {localizeHotelLabel(item, locale)}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="relative z-10 rounded-2xl bg-white border border-[#eadfcf] px-3 py-2 flex gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <a
                  key={tab.id}
                  href={`#${tab.id}`}
                  className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-purple-50 hover:text-purple-950"
                >
                  {tab.label}
                </a>
              ))}
            </div>

            <section id="description" className="rounded-3xl bg-white border border-[#eadfcf] p-6 md:p-8">
              <h2 className="text-xl font-bold mb-3">{t.hotels.jumpOverview}</h2>
              {descriptionText ? (
                <p className="text-slate-600 leading-8 whitespace-pre-line">{descriptionText}</p>
              ) : (
                <p className="text-slate-500 text-sm">{hotel.snippet || hotel.locationText}</p>
              )}
            </section>

            {(hotel.amenities || []).length ? (
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.slice(0, 10).map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#051741]/5 px-3 py-1.5 text-xs font-semibold text-[#051741]"
                  >
                    <HotelFeatureIcon label={a} size={18} />
                    {localizeHotelLabel(a, locale)}
                  </span>
                ))}
              </div>
            ) : null}

            <section id="rooms" className="space-y-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-800/70">
                    {t.hotels.selectRoom}
                  </p>
                  <h2 className="font-serif text-3xl text-[#102033]">{t.hotels.rooms}</h2>
                </div>
                <span className="text-xs text-slate-500">
                  {checkIn} → {checkOut}
                </span>
              </div>
              {displayRooms.length ? (
                <div className="space-y-5">
                  {displayRooms.map((room) => {
                    const title = localizeRoomType(room.name, locale) || room.name;
                    return (
                      <HotelRoomCard
                        key={room.id}
                        room={room}
                        title={title}
                        locale={locale}
                        stayNights={stayNights}
                        t={{
                          breakfastIncluded: t.hotels.breakfastIncluded,
                          roomOnly: t.hotels.roomOnly,
                          freeCancellation: t.hotels.freeCancellation,
                          nonRefundable: t.hotels.nonRefundable,
                          perNight: t.hotels.perNight,
                          bookNow: t.hotels.bookNow,
                          totalStayNightsTaxes: t.hotels.totalStayNightsTaxes,
                          roomGuests: t.hotels.roomGuests,
                          roomSize: t.hotels.roomSize,
                          roomsUnavailable: t.hotels.roomsUnavailable,
                        }}
                        paymentChannels={paymentChannels}
                        paymentCopy={paymentChannelCopy}
                        bookHref={(price) => roomBookHref(room, price, title)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-3xl border-2 border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-white p-6 sm:p-8 text-center shadow-md">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 ring-8 ring-amber-500/5">
                    <CalendarX size={32} className="stroke-[2.2]" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                    {t.hotels.allRoomsBookedTitle}
                  </h3>
                  <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-6">
                    {t.hotels.allRoomsBookedDesc}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Link
                      href={`/hotels?city=${encodeURIComponent(hotel.city || query)}`}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-sm"
                    >
                      <span>{locale === "ar" ? `استكشف فنادق أخرى في ${hotel.city || query}` : `Explore other hotels in ${hotel.city || query}`}</span>
                    </Link>
                  </div>
                  <div className="mt-5 pt-5 border-t border-amber-200/60 text-xs text-slate-500 flex items-center justify-center gap-2">
                    <span>{checkIn} → {checkOut} ({stayNights} {stayNights > 1 ? (locale === "ar" ? "ليالٍ" : "nights") : (locale === "ar" ? "ليلة" : "night")})</span>
                  </div>
                </div>
              )}
            </section>

            <HotelOfferCompare offers={offers} bookHref={bookHref} nights={stayNights} />

            <section id="reviews" className="rounded-3xl bg-white border border-[#eadfcf] p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4">{t.hotels.guestReviews}</h2>
              {hotel.rating > 0 ? (
                <div className="mb-5 flex flex-wrap gap-6">
                  <div>
                    <p className="text-4xl font-bold text-[var(--navy)]">{hotel.rating.toFixed(1)}</p>
                    <p className="text-sm font-semibold">{hotelRatingLabel(hotel.rating, t.hotels)}</p>
                  </div>
                  <div className="flex-1 min-w-[180px] space-y-2">
                    {hotel.reviewScores?.length
                      ? hotel.reviewScores.map((row) => (
                          <div key={row.name} className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="w-24 truncate">{localizeHotelLabel(row.name, locale)}</span>
                            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500"
                                style={{ width: `${Math.min(100, Math.round((row.score / 10) * 100))}%` }}
                              />
                            </div>
                            <span className="w-8 text-end">{row.score}</span>
                          </div>
                        ))
                      : [
                          { name: locale === "ar" ? "الموقع" : locale === "tr" ? "Konum" : "Location" },
                          { name: locale === "ar" ? "الخدمة" : locale === "tr" ? "Hizmet" : "Service" },
                          { name: locale === "ar" ? "النظافة" : locale === "tr" ? "Temizlik" : "Cleanliness" },
                          { name: locale === "ar" ? "المرافق" : locale === "tr" ? "Tesisler" : "Facilities" },
                        ].map((row) => {
                          const scores = hotel.reviews
                            .map((review) => {
                              const ten = review.rating > 5 ? review.rating : review.rating * 2;
                              return ten;
                            })
                            .filter((n) => n > 0);
                          const avg = scores.length
                            ? scores.reduce((sum, n) => sum + n, 0) / scores.length
                            : hotel.rating || 0;
                          const pct = Math.min(100, Math.round((avg / 10) * 100));
                          return (
                            <div key={row.name} className="flex items-center gap-2 text-xs text-slate-500">
                              <span className="w-24 truncate">{row.name}</span>
                              <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="w-8 text-end">{avg ? avg.toFixed(1) : "—"}</span>
                            </div>
                          );
                        })}
                  </div>
                </div>
              ) : null}
              {loadingReviews ? (
                <ReviewsAgentSkeleton locale={locale} hotelName={hotel.name} />
              ) : hotel.reviews?.length ? (
                <div className="alrayyan-scroll space-y-3 pe-1">
                  {hotel.reviews.length > 8 ? (
                    <p className="text-xs text-slate-400">
                      {t.hotels.showingReviews(visibleReviews.length, hotel.reviews.length)}
                    </p>
                  ) : null}
                  {visibleReviews.map((review) => {
                    const isOriginal = Boolean(showOriginal[review.id]);
                    const currentTitle = isOriginal ? (review.originalTitle || review.title) : review.title;
                    const currentText = isOriginal ? (review.originalText || review.text) : review.text;
                    const hasOriginalDiff = Boolean(
                      (review.originalText && review.originalText !== review.text) ||
                      (review.originalTitle && review.originalTitle !== review.title)
                    );

                    return (
                      <div key={review.id} className="rounded-xl border border-slate-100 p-4 transition-all">
                        <div className="flex flex-wrap items-center gap-2">
                          {review.rating > 0 ? (
                            <span className="px-2 py-0.5 bg-[var(--navy)] text-white text-xs font-bold rounded">
                              {review.rating.toFixed(1)}
                            </span>
                          ) : null}
                          <p className="font-semibold text-slate-900">{review.author}</p>
                          {review.date ? (
                            <span className="text-xs text-slate-400">
                              {localizeHotelLabel(review.date, locale)}
                            </span>
                          ) : null}
                        </div>
                        {currentTitle ? (
                          <p className="text-sm font-medium text-slate-800 mt-1">{currentTitle}</p>
                        ) : null}
                        <p className="text-slate-600 text-sm mt-1 leading-relaxed whitespace-pre-line">{currentText}</p>

                        {hasOriginalDiff ? (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => toggleOriginal(review.id)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-800 hover:text-purple-950 bg-white hover:bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200/70 transition-colors shadow-2xs"
                            >
                              <Languages size={13} className="text-purple-600" />
                              <span>
                                {isOriginal
                                  ? (locale === "ar" ? "عرض الترجمة بالعربية" : locale === "tr" ? "Türkçe Çeviriyi Göster" : "Show Translation")
                                  : (locale === "ar" ? "عرض النص الأصلي" : locale === "tr" ? "Orijinal Metni Göster" : "Show Original Text")}
                              </span>
                            </button>
                            <span className="text-[11px] text-slate-400">
                              {isOriginal
                                ? (locale === "ar" ? "النص الأصلي (TripAdvisor)" : "Original Text")
                                : (locale === "ar" ? "مترجم آلياً" : "Translated")}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                  {reviewVisible < hotel.reviews.length ? (
                    <button
                      type="button"
                      onClick={() => setReviewVisible((n) => n + 10)}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-emerald-50 transition-colors"
                    >
                      {t.hotels.loadMoreReviews} (+10) [{Math.min(reviewVisible, hotel.reviews.length)} / {hotel.reviews.length}]
                    </button>
                  ) : hotel.bookingHotelId && reviewPage < 2 ? (
                    <button
                      type="button"
                      disabled={loadingReviews}
                      onClick={() => {
                        const bookingHotelId = hotel.bookingHotelId;
                        if (!bookingHotelId) return;
                        setLoadingReviews(true);
                        void (async () => {
                          try {
                            const res = await fetch(
                              `/api/hotels/reviews?bookingHotelId=${encodeURIComponent(bookingHotelId)}&page=2&lang=${locale}`,
                              { cache: "no-store" }
                            );
                            const json = parseHotelApiJson(await res.text());
                            const extra = Array.isArray(json.reviews)
                              ? (json.reviews as TravelAdvisorHotelDetails["reviews"])
                              : [];
                            if (extra.length) {
                              setHotel((current) =>
                                current
                                  ? {
                                      ...current,
                                      reviews: [
                                        ...current.reviews,
                                        ...extra.filter(
                                          (review) => !current.reviews.some((r) => r.id === review.id)
                                        ),
                                      ],
                                    }
                                  : current
                              );
                              setReviewVisible((n) => n + extra.length);
                            }
                            setReviewPage(2);
                          } finally {
                            setLoadingReviews(false);
                          }
                        })();
                      }}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-emerald-50 disabled:opacity-60"
                    >
                      {loadingReviews ? t.common.loading : t.hotels.loadMoreReviews}
                    </button>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-slate-500">{t.hotels.guestReviewsNote}</p>
              )}
            </section>

            <section id="amenities" className="rounded-3xl bg-white border border-[#eadfcf] p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4">{t.hotels.amenities}</h2>
              {hotel.amenities?.length || hotel.facilityGroups?.length ? (
                <div className="alrayyan-scroll space-y-5 pe-1">
                  {Object.entries(amenityGroups)
                    .filter(([, items]) => items.length)
                    .map(([group, items]) => (
                      <div key={group}>
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/70 mb-2">
                          {group === "wellness"
                            ? locale === "ar"
                              ? "الصحة والاستجمام"
                              : locale === "tr"
                                ? "Sağlık"
                                : "Wellness"
                            : group === "food"
                              ? locale === "ar"
                                ? "الطعام والشراب"
                                : locale === "tr"
                                  ? "Yiyecek & içecek"
                                  : "Food & drink"
                              : group === "services"
                                ? locale === "ar"
                                  ? "الخدمات"
                                  : locale === "tr"
                                    ? "Hizmetler"
                                    : "Services"
                                : group === "general"
                                  ? locale === "ar"
                                    ? "عام"
                                    : locale === "tr"
                                      ? "Genel"
                                      : "General"
                                  : localizeHotelLabel(group, locale)}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {items.map((a) => (
                            <div key={a} className="flex items-center gap-2 text-sm text-slate-700">
                              <HotelFeatureIcon label={a} size={18} />
                              {localizeHotelLabel(a, locale)}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">—</p>
              )}
            </section>

            <section id="qa" className="rounded-3xl bg-white border border-[#eadfcf] p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4">{t.hotels.questionsAnswers}</h2>
              {hotel.questions?.filter((item) => item.question).length ? (
                <ul className="alrayyan-scroll space-y-3 pe-1">
                  {hotel.questions
                    .filter((item) => item.question)
                    .map((item) => (
                      <li key={item.id} className="rounded-xl border border-slate-100 p-4">
                        <p className="font-semibold text-slate-900 text-sm inline-flex items-start gap-2">
                          <HotelFeatureIcon label={item.question} kind="reception" size={18} />
                          {item.question}
                        </p>
                        {item.answer ? (
                          <p className="mt-1 text-sm text-slate-600 whitespace-pre-line">{item.answer}</p>
                        ) : null}
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">{t.hotels.noQuestions}</p>
              )}
            </section>

            <section id="nearby" className="rounded-3xl bg-white border border-[#eadfcf] p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4">{t.hotels.nearby}</h2>
              {hotel.nearbyPlaces?.length ? (
                <ul className="alrayyan-scroll space-y-2 pe-1">
                  {hotel.nearbyPlaces.map((place) => (
                    <li
                      key={place.name}
                      className="flex items-center justify-between gap-3 text-sm text-slate-700 border-b border-slate-100 pb-2 last:border-0"
                    >
                      <span className="inline-flex items-center gap-2">
                        <HotelFeatureIcon label={place.name} kind="landmark" size={18} />
                        {localizeHotelLabel(place.name, locale)}
                      </span>
                      {place.distance ? (
                        <span className="text-xs text-slate-500">{place.distance}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">{t.hotels.noNearbyPlaces}</p>
              )}
            </section>

            <section id="policies" className="rounded-3xl bg-white border border-[#eadfcf] p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4">{t.hotels.policies}</h2>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-700 mb-4">
                <div className="rounded-xl bg-[#f7f3ec] px-3 py-2 inline-flex items-center gap-2">
                  <HotelFeatureIcon label={t.hotels.checkIn} kind="clock" size={16} />
                  <span>
                    {t.hotels.checkIn}: <strong>{hotel.checkInTime || "—"}</strong>
                  </span>
                </div>
                <div className="rounded-xl bg-[#f7f3ec] px-3 py-2 inline-flex items-center gap-2">
                  <HotelFeatureIcon label={t.hotels.checkOut} kind="clock" size={16} />
                  <span>
                    {t.hotels.checkOut}: <strong>{hotel.checkOutTime || "—"}</strong>
                  </span>
                </div>
              </div>
              {hotel.policies?.length ? (
                <ul className="alrayyan-scroll space-y-2 pe-1">
                  {hotel.policies.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-slate-600">
                      <HotelFeatureIcon label={p} size={18} className="mt-0.5" />
                      {p}
                    </li>
                  ))}
                </ul>
              ) : null}
              {hotel.childrenPolicy?.length ? (
                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/70 mb-2">
                    {t.hotels.childrenAndBeds}
                  </p>
                  <ul className="alrayyan-scroll space-y-2 pe-1">
                    {hotel.childrenPolicy.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-slate-600">
                        <HotelFeatureIcon label={p} kind="kids" size={18} className="mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <HotelPaymentChannels
                className="mt-5"
                channels={paymentChannels}
                t={paymentChannelCopy}
              />
            </section>

            <section id="gallery" className="rounded-3xl bg-white border border-[#eadfcf] p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4">{t.hotels.gallery}</h2>
              {images.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {images.slice(0, 12).map((img, i) => (
                    <button
                      key={img + i}
                      type="button"
                      onClick={() => setLightbox(i)}
                      className="relative h-28 sm:h-36 overflow-hidden rounded-xl bg-slate-200"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">—</p>
              )}
            </section>

            <section id="map" className="rounded-3xl bg-white border border-[#eadfcf] p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4">{t.hotels.mapTitle}</h2>
              {hasMap ? (
                <HotelLocationMap
                  hotelLat={hotel.lat}
                  hotelLng={hotel.lng}
                  hotelLabel={hotel.name}
                  locale={locale}
                  nearbyHotels={nearby
                    .filter((h) => h.lat && h.lng)
                    .map((h) => ({
                      lat: h.lat,
                      lng: h.lng,
                      label: h.name,
                      price: h.priceFrom ?? undefined,
                      currency: "USD",
                      href: `/hotels/${hotelApiSlug(h.bookingHotelId || h.id, h.source === "booking" ? "booking" : "ta")}?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}${h.bookingHotelId ? `&bookingHotelId=${h.bookingHotelId}` : ""}`,
                    }))}
                  height={380}
                />
              ) : (
                <div className="flex h-[320px] items-center justify-center rounded-2xl bg-slate-100 text-slate-500 text-sm">
                  {t.hotels.location}
                </div>
              )}
            </section>
          </div>

          <aside>
            <div className="sticky top-24 rounded-3xl bg-white border border-[#eadfcf] p-6 shadow-[0_18px_50px_rgba(16,24,40,0.08)]">
              <h3 className="font-bold text-slate-900 mb-1">{hotel.name}</h3>
              <p className="text-slate-400 text-sm mb-4">
                {checkIn} → {checkOut}
              </p>
              {startPrice != null ? (
                <div className="mb-3">
                  {hotel.discountPct ? (
                    <span className="inline-flex mb-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                      {t.hotels.discountBadge(hotel.discountPct)}
                    </span>
                  ) : null}
                  <p>
                    <span className="text-slate-400 text-sm">{t.hotels.from} </span>
                    <span className="text-3xl font-extrabold text-[#2e1065]">{formatPrice(startPrice, hotel.currency || "USD")}</span>
                  </p>
                  {startPrice != null ? (
                    <>
                      <p className="text-[11px] text-slate-400">{t.hotels.perNight}</p>
                      {stayTotal != null ? (
                        <p className="text-xs text-slate-500 mt-1">
                          {t.hotels.totalStayNightsTaxes(stayNights)}: {formatPrice(stayTotal, hotel.currency || "USD")}
                        </p>
                      ) : null}
                    </>
                  ) : null}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {hotel.badges.slice(0, 3).map((b) => (
                  <span key={b} className="px-2 py-0.5 bg-purple-50 text-purple-950 border border-purple-200/60 text-xs rounded-md font-medium">
                    {localizeHotelLabel(b, locale)}
                  </span>
                ))}
              </div>
              <a
                href="#rooms"
                className="flex w-full items-center justify-center rounded-xl bg-[var(--brand-button)] py-3.5 font-bold text-white mb-2"
              >
                {t.hotels.selectRoom}
              </a>
              <Link
                href={bookHref}
                className="flex w-full items-center justify-center rounded-xl bg-[var(--navy)] py-3.5 font-bold text-white"
              >
                {t.hotels.bookNow}
              </Link>
              <HotelPaymentChannels
                className="mt-3"
                channels={paymentChannels}
                t={paymentChannelCopy}
                variant="compact"
              />
            </div>
          </aside>
        </div>
      </div>

      {lightbox != null && images.length ? (
        <div className="fixed inset-0 z-[80] bg-slate-950/90 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute top-4 end-4 text-white"
            onClick={() => setLightbox(null)}
          >
            <X size={22} />
          </button>
          <button
            type="button"
            className="absolute start-4 text-white"
            onClick={() => setLightbox((lightbox - 1 + images.length) % images.length)}
          >
            <ChevronLeft size={28} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[lightbox]}
            alt={hotel.name}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl"
          />
          <button
            type="button"
            className="absolute end-4 text-white"
            onClick={() => setLightbox((lightbox + 1) % images.length)}
          >
            <ChevronRight size={28} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
