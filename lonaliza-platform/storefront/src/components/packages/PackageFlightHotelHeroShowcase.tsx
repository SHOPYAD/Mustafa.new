"use client";

import { useState, useRef, useMemo } from "react";
import Image from "next/image";
import {
  Plane,
  Hotel,
  Luggage,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Utensils,
  Wifi,
  Zap,
  Building,
  ArrowRightLeft,
  BadgeCheck,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCurrency } from "@/components/ui/CurrencySelector";
import type { DestinationMetadata } from "@/lib/destination-resolver";
import {
  getDestinationFlightOffers,
  type PackageFlightOffer,
} from "@/lib/destination-flight-offers";
import {
  getDestinationHotelOffers,
  type PackageHotelOffer,
} from "@/lib/destination-hotel-offers";

interface PackageFlightHotelHeroShowcaseProps {
  destMeta: DestinationMetadata;
  destination: string;
  flightDetails?: any;
  luxuryHotels?: any[];
  hotelsLoading?: boolean;
}

export function PackageFlightHotelHeroShowcase({
  destMeta,
  destination,
  flightDetails,
  luxuryHotels,
  hotelsLoading,
}: PackageFlightHotelHeroShowcaseProps) {
  const { locale, dir } = useLocale();
  const isAr = locale === "ar";
  const { formatPrice } = useCurrency();

  // Scroll references for sliders
  const flightSliderRef = useRef<HTMLDivElement>(null);
  const hotelSliderRef = useRef<HTMLDivElement>(null);

  // Selected offers state
  const [selectedFlightId, setSelectedFlightId] = useState<string>("");
  const [selectedHotelId, setSelectedHotelId] = useState<string>("");

  // Destination flight offers (Travelport, Seeru, PKFare)
  const flightOffers = useMemo(() => {
    return getDestinationFlightOffers(destMeta);
  }, [destMeta]);

  // Destination hotel offers (Hotelbeds, Travelport)
  const hotelOffers = useMemo(() => {
    if (Array.isArray(luxuryHotels) && luxuryHotels.length > 0 && luxuryHotels[0]?.supplier) {
      return luxuryHotels;
    }
    return getDestinationHotelOffers(destMeta, isAr);
  }, [destMeta, luxuryHotels, isAr]);

  // Active selected items fallback
  const activeFlight =
    flightOffers.find((f) => f.id === selectedFlightId) || flightOffers[0];
  const activeHotel =
    hotelOffers.find((h) => h.id === selectedHotelId) || hotelOffers[0];

  const scrollSlider = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: "left" | "right"
  ) => {
    if (ref.current) {
      const scrollAmount = 360;
      ref.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="space-y-8">
      {/* ========================================================================= */}
      {/* 1. FLIGHT OFFERS SLIDER (TRAVELPORT, SEERU, PKFARE)                       */}
      {/* ========================================================================= */}
      <div className="overflow-hidden rounded-3xl border border-violet-200/80 bg-white shadow-xl shadow-violet-950/5">
        {/* Flight Section Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#170E38] via-[#2A145C] to-[#170E38] px-5 py-5 text-white sm:px-7">
          <div className="absolute -end-10 -top-10 h-36 w-36 rounded-full bg-violet-500/20 blur-2xl" />
          <div className="absolute -start-10 -bottom-10 h-36 w-36 rounded-full bg-amber-500/10 blur-2xl" />

          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
                  <Plane size={16} />
                </span>
                <span className="text-xs font-black tracking-widest text-amber-300 uppercase">
                  {isAr ? "عروض الطيران المؤكدة من الموزعين" : "Live Airline Offers from Distributors"}
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                  {isAr ? "تأكيد فوري PNR" : "Instant PNR Ticketing"}
                </span>
              </div>
              <h3 className="mt-1 text-base font-black tracking-tight text-white sm:text-lg">
                {isAr
                  ? `رحلات الطيران المباشرة إلى ${destMeta.cityAr} (${destMeta.cityEn})`
                  : `Confirmed Flights to ${destMeta.cityEn} (${destMeta.cityAr})`}
              </h3>
            </div>

            {/* Supplier Badges & Nav Arrows */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono text-purple-200/80 me-2">
                <span className="rounded-md bg-white/10 px-2 py-1">Travelport GDS</span>
                <span className="rounded-md bg-white/10 px-2 py-1">Seeru Flights</span>
                <span className="rounded-md bg-white/10 px-2 py-1">PKFare API</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollSlider(flightSliderRef, dir === "rtl" ? "right" : "left")}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
                  aria-label="Previous flight"
                >
                  <ChevronLeft size={16} className={dir === "rtl" ? "rotate-180" : ""} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollSlider(flightSliderRef, dir === "rtl" ? "left" : "right")}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
                  aria-label="Next flight"
                >
                  <ChevronRight size={16} className={dir === "rtl" ? "rotate-180" : ""} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Flight Cards Slider Track */}
        <div className="p-4 sm:p-6 bg-slate-50/50">
          <div
            ref={flightSliderRef}
            className="flex gap-4 overflow-x-auto pb-2 pt-1 [scrollbar-width:none] snap-x snap-mandatory"
          >
            {flightOffers.map((flight) => {
              const isSelected = (selectedFlightId || flightOffers[0].id) === flight.id;
              return (
                <div
                  key={flight.id}
                  onClick={() => setSelectedFlightId(flight.id)}
                  className={`w-[320px] sm:w-[360px] shrink-0 snap-start rounded-2xl border transition-all duration-300 p-4.5 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-[#7C3AED] bg-gradient-to-br from-violet-50/70 via-white to-white shadow-md ring-2 ring-[#7C3AED]/20"
                      : "border-slate-200 bg-white hover:border-violet-300 hover:shadow-sm"
                  }`}
                >
                  <div>
                    {/* Header: Airline Logo & Supplier Badge */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-100 overflow-hidden">
                          {flight.logoUrl ? (
                            <Image
                              src={flight.logoUrl}
                              alt={flight.airlineName}
                              width={36}
                              height={36}
                              className="object-contain"
                              unoptimized
                            />
                          ) : (
                            <Plane size={18} className="text-[#7C3AED]" />
                          )}
                        </div>
                        <div>
                          <span className="text-[11px] font-bold text-slate-500 uppercase block leading-tight">
                            {flight.flightNumber} • {flight.aircraft}
                          </span>
                          <h4 className="font-black text-[#1A1438] text-sm leading-snug">
                            {isAr ? flight.airlineNameAr : flight.airlineName}
                          </h4>
                        </div>
                      </div>

                      {/* Selected Indicator */}
                      {isSelected ? (
                        <span className="flex items-center gap-1 rounded-full bg-[#7C3AED] px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
                          <CheckCircle2 size={12} />
                          <span>{isAr ? "معتمد" : "Selected"}</span>
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {isAr ? flight.cabinClassAr : flight.cabinClassEn}
                        </span>
                      )}
                    </div>

                    {/* Supplier Tag */}
                    <div className="mt-2.5 flex items-center justify-between text-[11px]">
                      <span className="inline-flex items-center gap-1 font-bold text-[#7C3AED] bg-violet-100/60 px-2 py-0.5 rounded-md">
                        <BadgeCheck size={12} />
                        <span>{isAr ? flight.supplierLabelAr : flight.supplierLabelEn}</span>
                      </span>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {isAr ? "مباشر ومؤكد" : "Direct & Confirmed"}
                      </span>
                    </div>

                    {/* Outbound Route Times */}
                    <div className="mt-3 rounded-xl border border-slate-100 bg-white p-3">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                        <span>{isAr ? "رحلة الذهاب" : "Outbound"}</span>
                        <span>{flight.outboundDuration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-start">
                          <p className="text-base font-black text-[#1A1438]">{flight.outboundDepartureTime}</p>
                          <p className="text-[11px] font-medium text-slate-500">{flight.originIata}</p>
                        </div>
                        <div className="flex-1 px-3 text-center">
                          <div className="relative my-1 h-0.5 w-full bg-violet-200">
                            <Plane size={11} className="absolute left-1/2 -top-1.5 -translate-x-1/2 text-[#7C3AED]" />
                          </div>
                        </div>
                        <div className="text-end">
                          <p className="text-base font-black text-[#1A1438]">{flight.outboundArrivalTime}</p>
                          <p className="text-[11px] font-medium text-slate-500">{flight.destinationIata}</p>
                        </div>
                      </div>
                    </div>

                    {/* Return Route Times */}
                    <div className="mt-2 rounded-xl border border-slate-100 bg-white p-3">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                        <span>{isAr ? "رحلة العودة" : "Inbound"}</span>
                        <span>{flight.inboundDuration}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-start">
                          <p className="text-base font-black text-[#1A1438]">{flight.inboundDepartureTime}</p>
                          <p className="text-[11px] font-medium text-slate-500">{flight.destinationIata}</p>
                        </div>
                        <div className="flex-1 px-3 text-center">
                          <div className="relative my-1 h-0.5 w-full bg-violet-200">
                            <Plane size={11} className="absolute left-1/2 -top-1.5 -translate-x-1/2 -rotate-180 text-[#7C3AED]" />
                          </div>
                        </div>
                        <div className="text-end">
                          <p className="text-base font-black text-[#1A1438]">{flight.inboundArrivalTime}</p>
                          <p className="text-[11px] font-medium text-slate-500">{flight.originIata}</p>
                        </div>
                      </div>
                    </div>

                    {/* Baggage Inclusions */}
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                      <Luggage size={14} className="text-[#7C3AED]" />
                      <span className="font-semibold line-clamp-1">{isAr ? flight.baggageAr : flight.baggageEn}</span>
                    </div>
                  </div>

                  {/* Card Select Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFlightId(flight.id);
                      }}
                      className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-black transition ${
                        isSelected
                          ? "bg-[#7C3AED] text-white shadow-sm"
                          : "bg-violet-100/70 text-[#7C3AED] hover:bg-violet-200/80"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 size={14} />
                          <span>{isAr ? "تم اعتماد هذه الرحلة" : "Selected for Itinerary"}</span>
                        </>
                      ) : (
                        <span>{isAr ? "اختيار هذه الرحلة للبرنامج" : "Select this Flight"}</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DEDICATED HOTEL OFFERS SLIDER (HOTELBEDS & TRAVELPORT)                  */}
      {/* ========================================================================= */}
      <div className="overflow-hidden rounded-3xl border border-violet-200/80 bg-white shadow-xl shadow-violet-950/5">
        {/* Hotel Section Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#170E38] via-[#2A145C] to-[#170E38] px-5 py-5 text-white sm:px-7">
          <div className="absolute -end-10 -top-10 h-36 w-36 rounded-full bg-violet-500/20 blur-2xl" />
          <div className="absolute -start-10 -bottom-10 h-36 w-36 rounded-full bg-amber-500/10 blur-2xl" />

          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
                  <Hotel size={16} />
                </span>
                <span className="text-xs font-black tracking-widest text-amber-300 uppercase">
                  {isAr ? "سلايدر الفنادق الفاخرة المعتمدة 5 نجوم" : "Verified 5-Star Luxury Hotels Slider"}
                </span>
                <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-300/30">
                  {isAr ? "هوتل بيدس وترافلبورت" : "Hotelbeds & Travelport"}
                </span>
              </div>
              <h3 className="mt-1 text-base font-black tracking-tight text-white sm:text-lg">
                {isAr
                  ? `أفخم الإقامات الفندقية الحقيقية في ${destMeta.cityAr} (${destMeta.cityEn})`
                  : `Verified Luxury Accommodations in ${destMeta.cityEn} (${destMeta.cityAr})`}
              </h3>
            </div>

            {/* Supplier Badges & Nav Arrows */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono text-purple-200/80 me-2">
                <span className="rounded-md bg-white/10 px-2 py-1">Hotelbeds Live API</span>
                <span className="rounded-md bg-white/10 px-2 py-1">Travelport GDS</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => scrollSlider(hotelSliderRef, dir === "rtl" ? "right" : "left")}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
                  aria-label="Previous hotel"
                >
                  <ChevronLeft size={16} className={dir === "rtl" ? "rotate-180" : ""} />
                </button>
                <button
                  type="button"
                  onClick={() => scrollSlider(hotelSliderRef, dir === "rtl" ? "left" : "right")}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
                  aria-label="Next hotel"
                >
                  <ChevronRight size={16} className={dir === "rtl" ? "rotate-180" : ""} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hotel Cards Slider Track */}
        <div className="p-4 sm:p-6 bg-slate-50/50">
          <div
            ref={hotelSliderRef}
            className="flex gap-4 overflow-x-auto pb-2 pt-1 [scrollbar-width:none] snap-x snap-mandatory"
          >
            {hotelOffers.map((hotel) => {
              const isSelected = (selectedHotelId || hotelOffers[0].id) === hotel.id;
              const hName = isAr ? (hotel.nameAr || hotel.name) : (hotel.nameEn || hotel.name);
              const hLocation = isAr ? (hotel.neighborhoodAr || hotel.neighborhood) : (hotel.neighborhoodEn || hotel.neighborhood);
              const hStars = Math.min(5, Math.max(3, Number(hotel.stars) || 5));
              const hImg = hotel.image || hotel.images?.[0] || destMeta.coverUrl;

              return (
                <div
                  key={hotel.id}
                  onClick={() => setSelectedHotelId(hotel.id)}
                  className={`w-[320px] sm:w-[360px] shrink-0 snap-start rounded-2xl border transition-all duration-300 p-4.5 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-[#7C3AED] bg-gradient-to-br from-violet-50/70 via-white to-white shadow-md ring-2 ring-[#7C3AED]/20"
                      : "border-slate-200 bg-white hover:border-violet-300 hover:shadow-sm"
                  }`}
                >
                  <div>
                    {/* Hotel Image with Badges */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-900">
                      <Image
                        src={hImg}
                        alt={hName}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                        sizes="(max-width: 640px) 320px, 360px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

                      {/* Top Supplier & Star Badges */}
                      <div className="absolute top-2.5 start-2.5 end-2.5 flex items-center justify-between">
                        <span className="rounded-lg bg-black/65 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white border border-white/20">
                          {hotel.supplier || (isAr ? "هوتل بيدس Hotelbeds" : "Hotelbeds Live")}
                        </span>
                        <span className="flex items-center gap-1 rounded-lg bg-amber-500/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-black text-white">
                          <Star size={11} className="fill-white" />
                          <span>{hStars}★ {isAr ? "ديلوكس" : "Deluxe"}</span>
                        </span>
                      </div>

                      {/* Bottom Rating and Address */}
                      <div className="absolute bottom-2.5 start-2.5 end-2.5 flex items-center justify-between text-white text-xs">
                        <span className="flex items-center gap-1 font-bold drop-shadow">
                          <MapPin size={12} className="text-amber-400" />
                          <span className="line-clamp-1">{hLocation}</span>
                        </span>
                        <span className="rounded-md bg-emerald-600/90 px-1.5 py-0.5 text-[10px] font-black backdrop-blur-md">
                          {hotel.rating ? Number(hotel.rating).toFixed(1) : "9.5"} / 10
                        </span>
                      </div>
                    </div>

                    {/* Hotel Name */}
                    <div className="mt-3">
                      <h4 className="font-black text-[#1A1438] text-sm sm:text-base line-clamp-1">
                        {hName}
                      </h4>
                    </div>

                    {/* Room Type & Perks */}
                    <div className="mt-2.5 rounded-xl border border-slate-100 bg-white p-3 space-y-1.5 text-xs text-slate-700">
                      <div className="flex items-center gap-2 font-bold text-[#1A1438]">
                        <Building size={13} className="text-[#7C3AED]" />
                        <span className="line-clamp-1">{isAr ? hotel.roomNameAr : hotel.roomNameEn}</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-700 font-semibold text-[11px]">
                        <Utensils size={13} />
                        <span>{isAr ? hotel.mealPlanAr : hotel.mealPlanEn}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <ShieldCheck size={13} className="text-[#7C3AED]" />
                        <span>{isAr ? hotel.cancellationAr : hotel.cancellationEn}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Select Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHotelId(hotel.id);
                      }}
                      className={`w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-black transition ${
                        isSelected
                          ? "bg-[#7C3AED] text-white shadow-sm"
                          : "bg-violet-100/70 text-[#7C3AED] hover:bg-violet-200/80"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 size={14} />
                          <span>{isAr ? "تم اعتماد هذا الفندق" : "Selected for Itinerary"}</span>
                        </>
                      ) : (
                        <span>{isAr ? "اختيار هذا الفندق للبرنامج" : "Select this Hotel"}</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
