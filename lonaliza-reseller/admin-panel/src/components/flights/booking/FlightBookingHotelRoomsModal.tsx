"use client";

import { useState } from "react";
import {
  X,
  Star,
  Check,
  Coffee,
  ShieldCheck,
  Users,
  Bed,
  Sparkles,
  MapPin,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFlightPrice } from "@/components/flights/useFlightPrice";

export interface HotelRoomOption {
  id: string;
  nameAr: string;
  nameEn: string;
  bedTypeAr: string;
  bedTypeEn: string;
  maxGuests: number;
  photos: string[];
  inclusionsAr: string[];
  inclusionsEn: string[];
  pricePerNightUsd: number;
  refundable: boolean;
  breakfastIncluded: boolean;
}

export interface HotelCrossSellItem {
  id: string;
  nameAr: string;
  nameEn: string;
  cityAr: string;
  cityEn: string;
  addressAr: string;
  addressEn: string;
  stars: number;
  rating: number;
  reviewsCount: number;
  photoUrl: string;
  photos: string[];
  amenitiesAr: string[];
  amenitiesEn: string[];
  supplier: "hotelbeds" | "ratehawk" | "travelport" | "seeru" | "owned";
  rooms: HotelRoomOption[];
}

export interface SelectedHotelBooking {
  hotelId: string;
  hotelName: string;
  hotelStars: number;
  hotelAddress: string;
  hotelPhoto: string;
  roomId: string;
  roomName: string;
  roomPhoto: string;
  bedType: string;
  inclusions: string[];
  checkIn: string;
  checkOut: string;
  nightsCount: number;
  guestsCount: number;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  supplier: "hotelbeds" | "ratehawk" | "travelport" | "seeru" | "owned";
  photos?: string[];
  breakfastIncluded?: boolean;
  freeCancellation?: boolean;
  boardName?: string;
  quoteId?: string;
  rateId?: string;
}

type Props = {
  hotel: HotelCrossSellItem;
  checkInDate: string;
  checkOutDate: string;
  nightsCount: number;
  paxCount: number;
  currency: string;
  onClose: () => void;
  onSelectRoom: (selection: SelectedHotelBooking) => void;
};

export default function FlightBookingHotelRoomsModal({
  hotel,
  checkInDate,
  checkOutDate,
  nightsCount,
  paxCount,
  currency,
  onClose,
  onSelectRoom,
}: Props) {
  const { locale, dir } = useLocale();
  const { formatFlightPrice } = useFlightPrice();
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const hotelName = locale === "ar" ? hotel.nameAr : hotel.nameEn;
  const hotelCity = locale === "ar" ? hotel.cityAr : hotel.cityEn;
  const hotelAddress = locale === "ar" ? hotel.addressAr : hotel.addressEn;
  const amenities = locale === "ar" ? hotel.amenitiesAr : hotel.amenitiesEn;

  const allPhotos = hotel.photos?.length ? hotel.photos : [hotel.photoUrl];

  const handleAddRoom = (room: HotelRoomOption) => {
    const unitPrice = room.pricePerNightUsd;
    const totalPrice = unitPrice * Math.max(1, nightsCount);

    onSelectRoom({
      hotelId: hotel.id,
      hotelName,
      hotelStars: hotel.stars,
      hotelAddress,
      hotelPhoto: hotel.photoUrl,
      roomId: room.id,
      roomName: locale === "ar" ? room.nameAr : room.nameEn,
      roomPhoto: room.photos[0] || hotel.photoUrl,
      bedType: locale === "ar" ? room.bedTypeAr : room.bedTypeEn,
      inclusions: locale === "ar" ? room.inclusionsAr : room.inclusionsEn,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nightsCount: Math.max(1, nightsCount),
      guestsCount: paxCount,
      pricePerNight: unitPrice,
      totalPrice,
      currency: "USD",
      supplier: hotel.supplier,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] overflow-y-auto bg-[#1b053a]/70 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center">
      <div
        dir={dir}
        className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-purple-200/80 my-auto flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-purple-100 bg-gradient-to-r from-purple-50/80 via-purple-50/40 to-amber-50/30 p-5 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-900 text-amber-300 px-3 py-1 text-xs font-black shadow-2xs">
                <Sparkles size={12} className="text-amber-400" />
                {locale === "ar" ? "عروض الفنادق الترويجية المباشرة" : "Live Hotel Special Deal"}
              </span>
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: hotel.stars }).map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-black text-purple-950">{hotelName}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <MapPin size={13} className="text-purple-600 shrink-0" />
              <span>{hotelAddress} · {hotelCity}</span>
              <span className="mx-1 font-bold text-slate-300">|</span>
              <span className="text-amber-700 font-bold">
                ★ {hotel.rating} ({hotel.reviewsCount}+ {locale === "ar" ? "تقييم حقيقي" : "reviews"})
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-900 hover:bg-purple-200 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Gallery & Amenities Banner */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Photos Slider */}
            <div className="md:col-span-8 relative h-64 sm:h-72 rounded-2xl overflow-hidden shadow-inner bg-slate-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={allPhotos[activePhotoIdx] || hotel.photoUrl}
                alt={hotelName}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              {allPhotos.length > 1 ? (
                <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none">
                  <button
                    type="button"
                    onClick={() => setActivePhotoIdx((idx) => (idx > 0 ? idx - 1 : allPhotos.length - 1))}
                    className="pointer-events-auto h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 backdrop-blur-xs cursor-pointer"
                  >
                    {dir === "rtl" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePhotoIdx((idx) => (idx < allPhotos.length - 1 ? idx + 1 : 0))}
                    className="pointer-events-auto h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 backdrop-blur-xs cursor-pointer"
                  >
                    {dir === "rtl" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                  </button>
                </div>
              ) : null}
              <div className="absolute bottom-3 start-3 end-3 flex items-center justify-between text-white text-xs font-bold">
                <span>{locale === "ar" ? `مدة الإقامة: ${nightsCount} ليالٍ (${checkInDate} ← ${checkOutDate})` : `Stay: ${nightsCount} nights (${checkInDate} to ${checkOutDate})`}</span>
                <span>{activePhotoIdx + 1} / {allPhotos.length}</span>
              </div>
            </div>

            {/* Quick Amenities & Perks */}
            <div className="md:col-span-4 rounded-2xl border border-purple-100 bg-purple-50/40 p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-900 mb-3 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  {locale === "ar" ? "أبرز مميزات ومرافق الفندق" : "Hotel Highlights"}
                </h4>
                <div className="space-y-2">
                  {amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-bold text-purple-950">
                      <div className="h-5 w-5 rounded-full bg-purple-200/80 text-purple-800 flex items-center justify-center shrink-0">
                        <Check size={12} className="stroke-[3]" />
                      </div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-purple-200/60 text-[11px] text-purple-900/80 leading-relaxed font-medium">
                {locale === "ar"
                  ? "✓ أسعار تفضيلية حصرية لعملاء لوناليزا مشمولة بضمان أفضل سعر وخدمة عملاء VIP على مدار 24 ساعة."
                  : "✓ Exclusive rates for Lonaliza guests with best price guarantee & 24/7 concierge support."}
              </div>
            </div>
          </div>

          {/* Rooms Header */}
          <div className="border-t border-slate-100 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-lg font-black text-purple-950 flex items-center gap-2">
                  <span>{locale === "ar" ? "الغرف والأجنحة المتاحة للإضافة" : "Available Rooms & Suites"}</span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-black text-amber-900">
                    {hotel.rooms.length} {locale === "ar" ? "خيارات غرف" : "Room options"}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {locale === "ar"
                    ? `اختر الغرفة المناسبة لتضمينها مباشرة في حجز الرحلة لـ ${nightsCount} ليالٍ (${paxCount} نزيل)`
                    : `Select a room to bundle directly with your flight for ${nightsCount} nights (${paxCount} guests)`}
                </p>
              </div>
            </div>

            {/* Rooms Cards List */}
            <div className="space-y-4">
              {hotel.rooms.map((room) => {
                const roomTitle = locale === "ar" ? room.nameAr : room.nameEn;
                const roomBed = locale === "ar" ? room.bedTypeAr : room.bedTypeEn;
                const roomInclusions = locale === "ar" ? room.inclusionsAr : room.inclusionsEn;
                const totalStayPrice = room.pricePerNightUsd * Math.max(1, nightsCount);

                return (
                  <div
                    key={room.id}
                    className="rounded-2xl border border-purple-100 bg-white p-4 sm:p-5 shadow-sm hover:border-purple-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    {/* Room Details Left */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                      <div className="h-28 w-full sm:w-36 rounded-xl overflow-hidden bg-slate-100 shrink-0 shadow-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={room.photos[0] || hotel.photoUrl}
                          alt={roomTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-black text-purple-950">{roomTitle}</h4>
                          {room.breakfastIncluded ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                              <Coffee size={11} />
                              {locale === "ar" ? "إفطار مجاني" : "Breakfast Included"}
                            </span>
                          ) : null}
                          {room.refundable ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 border border-purple-200 px-2 py-0.5 text-[10px] font-black text-purple-800">
                              <ShieldCheck size={11} />
                              {locale === "ar" ? "إلغاء مجاني" : "Free Cancellation"}
                            </span>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium">
                          <span className="flex items-center gap-1">
                            <Bed size={13} className="text-purple-700" />
                            {roomBed}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Users size={13} className="text-purple-700" />
                            {locale === "ar" ? `حتى ${room.maxGuests} نزلاء` : `Up to ${room.maxGuests} guests`}
                          </span>
                        </div>

                        {/* Room inclusions pills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {roomInclusions.map((inc, i) => (
                            <span
                              key={i}
                              className="rounded-md bg-slate-50 border border-slate-200/80 px-2 py-0.5 text-[10px] font-bold text-slate-600"
                            >
                              ✓ {inc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Room Price & Add Button Right */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-s border-purple-100 pt-3 md:pt-0 md:ps-6 shrink-0 gap-3">
                      <div className="text-start md:text-end">
                        <p className="text-xs text-slate-500 font-semibold">
                          {formatFlightPrice(room.pricePerNightUsd, currency)} / {locale === "ar" ? "الليلة" : "night"}
                        </p>
                        <p className="text-xl font-black text-purple-950">
                          {formatFlightPrice(totalStayPrice, currency)}
                        </p>
                        <p className="text-[10px] font-bold text-amber-700">
                          {locale === "ar" ? `إجمالي ${nightsCount} ليالٍ شامل الضرائب` : `Total for ${nightsCount} nights incl. taxes`}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddRoom(room)}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 px-5 py-2.5 text-xs font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                      >
                        <PlusCircle size={15} className="stroke-[2.5]" />
                        <span>{locale === "ar" ? "إضافة إلى حجز الرحلة" : "Add to Booking"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
