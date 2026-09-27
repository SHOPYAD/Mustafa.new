"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Coffee,
  Loader2,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Utensils,
  X,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFlightPrice } from "@/components/flights/useFlightPrice";
import SafeImage from "@/components/ui/SafeImage";
import type { SelectedHotelBooking } from "./FlightBookingHotelRoomsModal";
import type { TravelAdvisorHotelDetails, TravelAdvisorRoom, TravelAdvisorRoomRate } from "@/types/travel-advisor";

export type AgentHotelCard = {
  id?: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  city?: string;
  address?: string;
  stars?: number;
  image?: string;
  photoUrl?: string;
  images?: string[];
  nightly?: number;
  priceFrom?: number;
  totalStay?: number;
  currency?: string;
  breakfastIncluded?: boolean;
  freeCancellation?: boolean;
  nonRefundable?: boolean;
  source?: string;
  supplier?: string;
  roomType?: string;
};

type Props = {
  hotels: AgentHotelCard[];
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  currency: string;
  onSelect: (hotel: SelectedHotelBooking) => void;
};

function photosOf(hotel: AgentHotelCard): string[] {
  const list = [
    ...(Array.isArray(hotel.images) ? hotel.images : []),
    hotel.image,
    hotel.photoUrl,
  ].filter((x): x is string => Boolean(x));
  return [...new Set(list)];
}

function supplierOf(raw?: string): SelectedHotelBooking["supplier"] {
  const v = String(raw || "").toLowerCase();
  if (v.includes("hotelbeds")) return "hotelbeds";
  if (v.includes("travelport")) return "travelport";
  if (v.includes("seeru")) return "seeru";
  if (v.includes("owned") || v.includes("internal")) return "owned";
  return "ratehawk";
}

function CardSlideshow({ photos, alt }: { photos: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  const shot = photos[idx] || photos[0] || "";
  if (!shot) return <div className="h-36 w-full bg-purple-950" />;
  return (
    <div className="relative h-36 w-full overflow-hidden">
      <SafeImage src={shot} alt={alt} fill className="object-cover" />
      {photos.length > 1 ? (
        <>
          <button
            type="button"
            className="absolute start-1.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white"
            onClick={(e) => {
              e.stopPropagation();
              setIdx((i) => (i === 0 ? photos.length - 1 : i - 1));
            }}
          >
            <ChevronRight size={14} />
          </button>
          <button
            type="button"
            className="absolute end-1.5 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white"
            onClick={(e) => {
              e.stopPropagation();
              setIdx((i) => (i === photos.length - 1 ? 0 : i + 1));
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <div className="absolute bottom-1.5 inset-x-0 flex justify-center gap-1">
            {photos.slice(0, 6).map((_, i) => (
              <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === idx ? "bg-amber-300" : "bg-white/50"}`} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function AgentHotelCarousel({
  hotels,
  checkIn,
  checkOut,
  nights,
  adults,
  currency,
  onSelect,
}: Props) {
  const { locale, dir } = useLocale();
  const { formatFlightPrice } = useFlightPrice();
  const [open, setOpen] = useState<AgentHotelCard | null>(null);

  return (
    <div className="mt-3">
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {hotels.slice(0, 8).map((hotel) => {
          const name = String(hotel.name || hotel.nameAr || hotel.nameEn || "");
          const photos = photosOf(hotel);
          const price = Number(hotel.totalStay || hotel.priceFrom || hotel.nightly || 0);
          return (
            <article
              key={String(hotel.id || name)}
              className="w-[260px] shrink-0 snap-start overflow-hidden rounded-2xl border border-amber-400/35 bg-[#1e073c] shadow-xl"
            >
              <CardSlideshow photos={photos} alt={name} />
              <div className="space-y-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="line-clamp-2 text-[13px] font-black text-white">{name}</h4>
                  <span className="inline-flex shrink-0 items-center gap-0.5 text-[11px] font-black text-amber-300">
                    <Star size={11} className="fill-amber-300" />
                    {hotel.stars || "—"}
                  </span>
                </div>
                <p className="line-clamp-1 text-[11px] text-purple-200">{hotel.address || hotel.city}</p>
                <div className="flex flex-wrap gap-1">
                  {hotel.breakfastIncluded ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-200">
                      <Coffee size={10} />
                      {locale === "ar" ? "إفطار" : "Breakfast"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-white/70">
                      <Utensils size={10} />
                      {locale === "ar" ? "بدون وجبة" : "Room only"}
                    </span>
                  )}
                  {hotel.freeCancellation || !hotel.nonRefundable ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-100">
                      <ShieldCheck size={10} />
                      {locale === "ar" ? "إلغاء مجاني" : "Free cancel"}
                    </span>
                  ) : (
                    <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-white/60">
                      {locale === "ar" ? "غير قابل للإلغاء" : "Non-refundable"}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <strong className="font-mono text-sm text-amber-300">
                    {price ? formatFlightPrice(price, hotel.currency || currency) : "—"}
                  </strong>
                  <button
                    type="button"
                    onClick={() => setOpen(hotel)}
                    className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 py-1.5 text-[11px] font-black text-slate-950"
                  >
                    {locale === "ar" ? "استعراض التفاصيل" : "View rooms"}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {open ? (
        <HotelRoomsPicker
          hotel={open}
          checkIn={checkIn}
          checkOut={checkOut}
          nights={nights}
          adults={adults}
          currency={currency}
          dir={dir}
          locale={locale}
          onClose={() => setOpen(null)}
          onSelect={(row) => {
            onSelect(row);
            setOpen(null);
          }}
        />
      ) : null}
    </div>
  );
}

function HotelRoomsPicker({
  hotel,
  checkIn,
  checkOut,
  nights,
  adults,
  currency,
  dir,
  locale,
  onClose,
  onSelect,
}: {
  hotel: AgentHotelCard;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  currency: string;
  dir: string;
  locale: string;
  onClose: () => void;
  onSelect: (hotel: SelectedHotelBooking) => void;
}) {
  const { formatFlightPrice } = useFlightPrice();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [details, setDetails] = useState<TravelAdvisorHotelDetails | null>(null);
  const [rooms, setRooms] = useState<TravelAdvisorRoom[]>([]);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [busyRate, setBusyRate] = useState("");

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const qs = new URLSearchParams({
          id: String(hotel.id || ""),
          checkIn,
          checkOut,
          adults: String(adults),
          rooms: "1",
          lang: locale === "en" || locale === "tr" ? locale : "ar",
        });
        const res = await fetch(`/api/hotels/details?${qs}`, { cache: "no-store" });
        const data = (await res.json()) as {
          ok?: boolean;
          hotel?: TravelAdvisorHotelDetails;
          rooms?: TravelAdvisorRoom[];
          error?: string;
        };
        if (cancelled) return;
        if (!data.ok || !data.hotel) {
          setError(data.error || (locale === "ar" ? "تعذر تحميل الغرف" : "Could not load rooms"));
          return;
        }
        setDetails(data.hotel);
        setRooms(Array.isArray(data.rooms) && data.rooms.length ? data.rooms : data.hotel.rooms || []);
      } catch {
        if (!cancelled) setError(locale === "ar" ? "تعذر تحميل الغرف" : "Could not load rooms");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [adults, checkIn, checkOut, hotel.id, locale]);

  const gallery = [...photosOf(hotel), ...(details?.images || []), details?.image || ""].filter(Boolean);
  const uniquePhotos = [...new Set(gallery)];

  const pickRate = async (room: TravelAdvisorRoom, rate?: TravelAdvisorRoomRate) => {
    const chosen = rate || room.rates?.[0];
    setBusyRate(chosen?.id || room.id);
    let quoteId = "";
    let total = Number(chosen?.totalStay || room.totalStay || hotel.totalStay || 0);
    let nightly = Number(chosen?.nightly || room.nightly || hotel.nightly || 0);
    const boardName = chosen?.boardName || (chosen?.breakfastIncluded || room.breakfastIncluded ? (locale === "ar" ? "إفطار" : "Breakfast") : locale === "ar" ? "بدون وجبة" : "Room only");
    if (chosen?.id) {
      try {
        const res = await fetch("/api/hotels/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rateId: chosen.id,
            hotelId: hotel.id,
            checkIn,
            checkOut,
            adults,
            rooms: 1,
            expectedTotal: total,
            lang: locale === "en" || locale === "tr" ? locale : "ar",
          }),
        });
        const data = (await res.json()) as { ok?: boolean; quote?: { id?: string; sellingTotal?: number; perNight?: number; boardName?: string } };
        if (data.ok && data.quote?.id) {
          quoteId = data.quote.id;
          if (data.quote.sellingTotal) total = data.quote.sellingTotal;
          if (data.quote.perNight) nightly = data.quote.perNight;
        }
      } catch {
        /* keep listed price */
      }
    }
    onSelect({
      hotelId: String(details?.id || hotel.id || ""),
      hotelName: String(details?.name || hotel.name || ""),
      hotelStars: Number(details?.stars || hotel.stars || 0),
      hotelAddress: String(details?.address || hotel.address || hotel.city || ""),
      hotelPhoto: uniquePhotos[0] || "",
      roomId: String(chosen?.id || room.id),
      roomName: room.name,
      roomPhoto: room.images?.[0] || uniquePhotos[0] || "",
      bedType: room.beds || "",
      inclusions: [
        boardName,
        chosen?.freeCancellation || room.freeCancellation
          ? locale === "ar"
            ? "إلغاء مجاني"
            : "Free cancellation"
          : locale === "ar"
            ? "غير قابل للإلغاء"
            : "Non-refundable",
      ],
      checkIn,
      checkOut,
      nightsCount: nights,
      guestsCount: adults,
      pricePerNight: nightly || (nights ? Math.round(total / nights) : total),
      totalPrice: total || nightly * nights,
      currency: String(chosen?.currency || hotel.currency || currency),
      supplier: supplierOf(chosen?.supplier || hotel.source || hotel.supplier),
      photos: uniquePhotos,
      breakfastIncluded: Boolean(chosen?.breakfastIncluded || room.breakfastIncluded),
      freeCancellation: Boolean(chosen?.freeCancellation || room.freeCancellation),
      boardName,
      quoteId: quoteId || undefined,
      rateId: chosen?.id,
    });
    setBusyRate("");
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-[#1b053a]/75 p-3 backdrop-blur-sm">
      <div dir={dir} className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-purple-100 p-4">
          <div>
            <p className="text-xs font-black text-purple-700">{locale === "ar" ? "تفاصيل الفندق والغرف" : "Hotel & rooms"}</p>
            <h3 className="text-lg font-black text-purple-950">{details?.name || hotel.name}</h3>
            <p className="text-xs text-slate-500">{checkIn} → {checkOut} · {nights} {locale === "ar" ? "ليالٍ" : "nights"}</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-950">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {uniquePhotos.length ? (
            <div className="relative h-48 overflow-hidden rounded-2xl bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={uniquePhotos[photoIdx] || uniquePhotos[0]} alt="" className="h-full w-full object-cover" />
              {uniquePhotos.length > 1 ? (
                <div className="absolute inset-x-3 top-1/2 flex -translate-y-1/2 justify-between">
                  <button type="button" className="h-8 w-8 rounded-full bg-black/50 text-white" onClick={() => setPhotoIdx((i) => (i === 0 ? uniquePhotos.length - 1 : i - 1))}>
                    <ChevronRight className="mx-auto" size={16} />
                  </button>
                  <button type="button" className="h-8 w-8 rounded-full bg-black/50 text-white" onClick={() => setPhotoIdx((i) => (i === uniquePhotos.length - 1 ? 0 : i + 1))}>
                    <ChevronLeft className="mx-auto" size={16} />
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
          {loading ? (
            <p className="flex items-center gap-2 text-sm font-bold text-purple-800">
              <Loader2 size={16} className="animate-spin" />
              {locale === "ar" ? "جاري جلب الغرف الحية من الموزع..." : "Loading live rooms from the supplier..."}
            </p>
          ) : error ? (
            <p className="text-sm font-bold text-rose-600">{error}</p>
          ) : (
            <div className="space-y-3">
              {rooms.map((room) => {
                const rate = room.rates?.[0];
                const total = Number(rate?.totalStay || room.totalStay || 0);
                return (
                  <div key={room.id} className="flex flex-col gap-3 rounded-2xl border border-purple-100 p-3 sm:flex-row sm:items-center">
                    <div className="relative h-24 w-full overflow-hidden rounded-xl bg-slate-100 sm:w-32">
                      <SafeImage src={room.images?.[0] || uniquePhotos[0] || ""} alt={room.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-purple-950">{room.name}</h4>
                      <p className="text-xs text-slate-500">{room.beds}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {rate?.breakfastIncluded || room.breakfastIncluded ? (
                          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-800">{locale === "ar" ? "إفطار" : "Breakfast"}</span>
                        ) : (
                          <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-black text-slate-600">{locale === "ar" ? "بدون وجبة" : "Room only"}</span>
                        )}
                        {rate?.freeCancellation || room.freeCancellation ? (
                          <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-black text-purple-800">{locale === "ar" ? "إلغاء مجاني" : "Free cancel"}</span>
                        ) : (
                          <span className="rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-black text-slate-500">{locale === "ar" ? "غير قابل للإلغاء" : "Non-refundable"}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <strong className="text-purple-950">{total ? formatFlightPrice(total, rate?.currency || currency) : "—"}</strong>
                      <button
                        type="button"
                        disabled={Boolean(busyRate)}
                        onClick={() => void pickRate(room, rate)}
                        className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-2 text-xs font-black text-slate-950 disabled:opacity-60"
                      >
                        {busyRate === (rate?.id || room.id) ? <Loader2 size={14} className="animate-spin" /> : <PlusCircle size={14} />}
                        {locale === "ar" ? "أضف الغرفة للحجز" : "Add room"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="border-t border-purple-100 px-4 py-2 text-[11px] font-semibold text-purple-800">
          <Sparkles size={12} className="mb-0.5 inline" />{" "}
          {locale === "ar"
            ? "عند الإضافة تُثبَّت الغرفة على فاتورة الرحلة، ويُمرَّر المسافرون لموزع الفندق بشكل منفصل عن حجز الطيران."
            : "Adding a room attaches it to the flight invoice. Passengers are sent to the hotel supplier separately from the airline."}
        </div>
      </div>
    </div>
  );
}
