"use client";

import Link from "next/link";
import { MapPin, Star, MessageCircle, ChevronRight } from "lucide-react";
import type { Hotel } from "@/types/hotel";
import LoyaltyPointsRow from "@/components/loyalty/LoyaltyPointsRow";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent, cn } from "@/lib/utils";
import { buildBusinessWhatsAppLink } from "@/lib/site-whatsapp";
import SafeImage from "@/components/ui/SafeImage";

interface HotelCardProps {
  hotel: Hotel;
  compact?: boolean;
}

export default function HotelCard({ hotel, compact = false }: HotelCardProps) {
  const { locale, t } = useLocale();
  const { formatPrice } = useCurrency();
  const name = tContent(hotel, "name", locale);
  const neighborhood = tContent(hotel, "neighborhood", locale);
  const fromPrice = hotel.rooms.length
    ? Math.min(...hotel.rooms.map((r) => r.price))
    : null;
  const currency = hotel.rooms[0]?.currency || "USD";
  const waMessage = tContent(hotel, "whatsappMessage", locale);
  const waLink = buildBusinessWhatsAppLink(waMessage);

  return (
    <article
      className={cn(
        "group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 flex flex-col",
        compact && "rounded-xl"
      )}
    >
      <Link
        href={`/hotels/${hotel.slug}`}
        className={cn(
          "block relative overflow-hidden",
          compact ? "h-40" : "h-56"
        )}
      >
        <SafeImage
          src={
            hotel.images[0] ||
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
          }
          alt={name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        {!compact && hotel.images.length > 1 && (
          <div className="absolute bottom-3 left-3 flex gap-1.5">
            {hotel.images.slice(0, 4).map((img, i) => (
              <div
                key={img + i}
                className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-white/80 shadow"
              >
                <SafeImage src={img} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        )}

        {hotel.isFeatured && (
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-full shadow-lg",
                compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
              )}
            >
              FEATURED
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3 flex items-center gap-0.5 px-2 py-0.5 bg-white/95 backdrop-blur-sm rounded-full shadow">
          {Array.from({ length: Math.min(hotel.stars, compact ? 4 : 5) }).map(
            (_, i) => (
              <Star
                key={i}
                size={compact ? 9 : 11}
                className="text-emerald-500 fill-emerald-500"
              />
            )
          )}
        </div>

        {fromPrice != null && (
          <div
            className={cn(
              "absolute bottom-3 right-3 bg-white rounded-xl shadow-lg text-end",
              compact ? "px-2.5 py-1" : "px-3 py-1.5"
            )}
          >
            <span className="text-[10px] text-slate-400 block uppercase tracking-wide">
              {t.hotels.from}
            </span>
            <span
              className={cn(
                "font-bold text-emerald-600 leading-none",
                compact ? "text-base" : "text-lg"
              )}
            >
              {formatPrice(fromPrice, currency)}
            </span>
          </div>
        )}
      </Link>

      <div className={cn("flex flex-col flex-1", compact ? "p-3.5" : "p-5")}>
        <div className="flex items-center gap-1 text-sm text-slate-500 mb-1.5">
          <MapPin size={14} className="text-emerald-500 flex-shrink-0" />
          <span className="truncate">
            {neighborhood || hotel.city}
            {neighborhood ? ` · ${hotel.city}` : `, ${hotel.country}`}
          </span>
        </div>

        <Link href={`/hotels/${hotel.slug}`}>
          <h3
            className={cn(
              "font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-1",
              compact ? "text-base" : "text-lg"
            )}
          >
            {name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0a1628] text-white text-xs font-bold rounded">
            <Star size={10} className="fill-white" />
            {hotel.rating.toFixed(1)}
          </span>
          {!compact && (
            <span className="text-slate-500 text-xs">
              {hotel.reviewCount.toLocaleString()} {t.hotels.reviews}
            </span>
          )}
        </div>

        {fromPrice != null ? (
          <LoyaltyPointsRow amount={fromPrice} currency={currency} service="hotels" className="mb-3" />
        ) : null}

        {!compact && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {hotel.amenities.slice(0, 4).map((a) => (
              <span
                key={a}
                className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md"
              >
                {a}
              </span>
            ))}
          </div>
        )}

        <div
          className={cn(
            "mt-auto flex items-center gap-2 border-t border-slate-100",
            compact ? "pt-2.5" : "pt-3"
          )}
        >
          <Link
            href={`/hotels/${hotel.slug}`}
            className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {t.hotels.rooms}
            <ChevronRight size={14} />
          </Link>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-bold text-white bg-[#25D366] hover:bg-[#1ebe57] rounded-xl transition-colors shadow-sm"
          >
            <MessageCircle size={15} />
            {compact ? "WA" : "WhatsApp"}
          </a>
        </div>
      </div>
    </article>
  );
}
