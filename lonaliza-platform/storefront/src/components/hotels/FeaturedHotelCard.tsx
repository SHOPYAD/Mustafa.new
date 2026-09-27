"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Star,
  MapPin,
  Utensils,
  CheckCircle2,
  Bed,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { buildBusinessWhatsAppLink } from "@/lib/site-whatsapp";
import { ShareToCommunityButton } from "@/components/community/ShareToCommunityButton";
import { cn } from "@/lib/utils";

export interface FeaturedHotelProps {
  hotel: {
    id: string;
    slug: string;
    nameAr: string;
    nameEn: string;
    city: string;
    country: string;
    neighborhoodAr?: string;
    neighborhoodEn?: string;
    stars: number;
    rating: number;
    reviewCount: number;
    images: string[];
    cheapestRoom: {
      nameAr: string;
      nameEn: string;
      mealPlanAr: string;
      mealPlanEn: string;
      cancellationAr: string;
      cancellationEn: string;
      bedTypeAr: string;
      bedTypeEn: string;
      price: number;
      originalPrice?: number;
      currency: string;
      supplier: string;
    };
    amenities?: string[];
  };
  checkIn?: string;
  checkOut?: string;
}

export default function FeaturedHotelCard({ hotel, checkIn, checkOut }: FeaturedHotelProps) {
  const { locale, t } = useLocale();
  const { formatPrice } = useCurrency();
  const isAr = locale === "ar";

  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const images = hotel.images && hotel.images.length > 0
    ? hotel.images
    : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80"];

  const name = isAr ? hotel.nameAr || hotel.nameEn : hotel.nameEn || hotel.nameAr;
  const neighborhood = isAr
    ? hotel.neighborhoodAr || hotel.neighborhoodEn || hotel.city
    : hotel.neighborhoodEn || hotel.neighborhoodAr || hotel.city;

  const room = hotel.cheapestRoom;
  const roomName = isAr ? room.nameAr || room.nameEn : room.nameEn || room.nameAr;
  const mealPlan = isAr ? room.mealPlanAr || room.mealPlanEn : room.mealPlanEn || room.mealPlanAr;
  const cancellation = isAr ? room.cancellationAr || room.cancellationEn : room.cancellationEn || room.cancellationAr;
  const bedType = isAr ? room.bedTypeAr || room.bedTypeEn : room.bedTypeEn || room.bedTypeAr;

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const waMessage = isAr
    ? `مرحباً لوناليزا، أود الاستفسار وحجز فندق "${name}" في ${neighborhood} من تاريخ ${checkIn || "المتاح"} بسعر $${room.price} لليلة.`
    : `Hello Lonaliza, I would like to inquire about booking "${name}" in ${neighborhood} from ${checkIn || "available date"} at $${room.price}/night.`;

  const waLink = buildBusinessWhatsAppLink(waMessage);

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl dark:shadow-slate-950/60 transition-all duration-300 border border-slate-200/80 dark:border-slate-800 flex flex-col h-full">
      {/* Hotel Multi-Image Carousel Header */}
      <div className="relative h-60 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 select-none">
        <SafeImage
          src={images[currentImgIndex]}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 backdrop-blur-md text-white text-[11px] font-black shadow-lg shadow-purple-900/30">
            <Sparkles size={11} className="text-amber-300 animate-pulse" />
            <span>{isAr ? "عرض حصري موثّق" : "Verified Exclusive"}</span>
          </span>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-400 text-xs font-black shadow border border-white/10">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span>{hotel.rating.toFixed(1)}</span>
            <span className="text-slate-400 text-[10px] font-normal">({hotel.reviewCount})</span>
          </div>
        </div>

        {/* Carousel Navigation Arrows (Visible on hover & touch) */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              className="absolute start-2.5 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer z-10"
              title="الصورة السابقة"
            >
              <ChevronLeft size={18} className="rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={nextImage}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 size-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 shadow-md cursor-pointer z-10"
              title="الصورة التالية"
            >
              <ChevronRight size={18} className="rtl:rotate-180" />
            </button>

            {/* Slide Index Counter & Indicator Dots */}
            <div className="absolute bottom-3 start-3.5 flex items-center gap-1.5 z-10 pointer-events-none">
              <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-black text-white">
                {currentImgIndex + 1} / {images.length}
              </span>
              <div className="flex items-center gap-1">
                {images.slice(0, 5).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "size-1.5 rounded-full transition-all duration-200",
                      i === currentImgIndex
                        ? "w-4 bg-white"
                        : "bg-white/40"
                    )}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* Price Tag (bottom right) */}
        <div className="absolute bottom-3 end-3.5 bg-slate-950/90 backdrop-blur-md rounded-2xl px-3.5 py-1.5 text-end border border-white/15 shadow-xl">
          {room.originalPrice && room.originalPrice > room.price && (
            <span className="text-[10px] text-slate-400 line-through block leading-none">
              {formatPrice(room.originalPrice, room.currency)}
            </span>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-amber-400 font-bold">من</span>
            <span className="text-lg font-black text-white leading-none">
              {formatPrice(room.price, room.currency)}
            </span>
            <span className="text-[10px] text-slate-300">/ ليلة</span>
          </div>
        </div>
      </div>

      {/* Hotel Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Neighborhood / Location */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
          <MapPin size={14} className="text-purple-600 dark:text-purple-400 shrink-0" />
          <span className="truncate">{neighborhood} · {hotel.city}</span>
          <span className="ms-auto shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/25">
            <ShieldCheck size={11} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{isAr ? "تأكيد فوري" : "Instant Confirmation"}</span>
          </span>
        </div>

        {/* Hotel Title */}
        <Link href={`/hotels/${hotel.slug}`}>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1 mb-3">
            {name}
          </h3>
        </Link>

        {/* Cheapest Room Details Box */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3 border border-slate-200/70 dark:border-slate-700/60 mb-3.5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-800 dark:text-slate-200 line-clamp-1">
              {roomName}
            </span>
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md shrink-0 border border-emerald-500/20">
              أرخص عرض متاح
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            {/* Meal Plan */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-200/40 dark:border-slate-800">
              <Utensils size={12} className="text-amber-500 shrink-0" />
              <span className="truncate">{mealPlan}</span>
            </div>

            {/* Cancellation Policy */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-200/40 dark:border-slate-800">
              <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
              <span className="truncate">{cancellation}</span>
            </div>

            {/* Bed Type */}
            <div className="col-span-2 flex items-center gap-1.5 bg-white dark:bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-200/40 dark:border-slate-800">
              <Bed size={12} className="text-indigo-500 shrink-0" />
              <span className="truncate">{bedType}</span>
            </div>
          </div>
        </div>

        {/* Loyalty Reward Row */}
        <div className="flex items-center justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 mb-4">
          <span>نقاط الولاء المكتسبة:</span>
          <span className="font-black">+{Math.round(room.price * 10).toLocaleString()} نقطة ≈ ${Math.round(room.price * 0.1)}</span>
        </div>

        {/* Action Buttons (Non-clipping, unclipped Arabic text) */}
        <div className="mt-auto grid grid-cols-3 gap-2 pt-1">
          {/* Share Button */}
          <div className="w-full">
            <ShareToCommunityButton
              service={{
                id: hotel.id,
                type: "hotel",
                typeLabel: "فندق وعرض حصري",
                title: name,
                destination: `${neighborhood} · ${hotel.city}`,
                price: room.price,
                currency: room.currency,
                imageUrl: images[0],
                url: `/hotels/${hotel.slug}`,
              }}
            />
          </div>

          {/* Rooms / Details Button */}
          <Link
            href={`/hotels/${hotel.slug}`}
            className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-2.5 text-xs font-black text-slate-800 dark:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-700 shadow-2xs whitespace-nowrap"
          >
            <span>تفاصيل الغرف</span>
            <ExternalLink size={12} className="shrink-0" />
          </Link>

          {/* WhatsApp Direct Booking Button */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            title="تواصل فوري عبر واتساب"
            className="w-full inline-flex items-center justify-center gap-1 px-2.5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all shadow-sm shadow-emerald-600/20 whitespace-nowrap"
          >
            <MessageCircle size={14} className="shrink-0" />
            <span>واتساب</span>
          </a>
        </div>
      </div>
    </div>
  );
}
