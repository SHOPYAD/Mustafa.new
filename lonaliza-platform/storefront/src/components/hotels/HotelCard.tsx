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
import { ShareToCommunityButton } from "@/components/community/ShareToCommunityButton";

interface HotelCardProps {
  hotel: Hotel;
  compact?: boolean;
}

const HOTEL_DISTINCT_PHOTOS: Record<string, string> = {
  "ciragan-palace-kempinski-istanbul": "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80",
  "raffles-istanbul": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
  "four-seasons-hotel-istanbul-at-the-bosphorus": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
  "the-peninsula-istanbul": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
  "swissotel-the-bosphorus-istanbul": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80",
  "mandarin-oriental-bosphorus-istanbul": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&q=80",
  "cvk-park-bosphorus-hotel-istanbul": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80",
  "shangri-la-bosphorus-istanbul": "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200&q=80",
};

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

  const distinctHeroImage =
    HOTEL_DISTINCT_PHOTOS[hotel.slug] ||
    (hotel.images[0] && !hotel.images[0].includes("photo-1524231757912")
      ? hotel.images[0]
      : "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800");

  return (
    <article
      className={cn(
        "group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-slate-950/50 transition-all duration-300 hover:-translate-y-1 border border-slate-100 dark:border-slate-800 flex flex-col",
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
          src={distinctHeroImage}
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
                className="relative w-10 h-10 rounded-lg overflow-hidden border-2 border-white/80 dark:border-slate-800 shadow"
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
                "bg-[var(--brand-primary)] text-white font-bold rounded-full shadow-lg",
                compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
              )}
            >
              FEATURED
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3 flex items-center gap-0.5 px-2 py-0.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-full shadow border border-slate-100/50 dark:border-slate-800">
          {Array.from({ length: Math.min(hotel.stars, compact ? 4 : 5) }).map(
            (_, i) => (
              <Star
                key={i}
                size={compact ? 9 : 11}
                className="text-amber-400 fill-amber-400"
              />
            )
          )}
        </div>

        {fromPrice != null && (
          <div
            className={cn(
              "absolute bottom-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl shadow-lg text-end border border-slate-100 dark:border-slate-800",
              compact ? "px-2.5 py-1" : "px-3 py-1.5"
            )}
          >
            <span className="text-[10px] text-slate-400 block uppercase tracking-wide">
              {t.hotels.from}
            </span>
            <span
              className={cn(
                "font-bold text-[var(--brand-primary)] dark:text-amber-400 leading-none",
                compact ? "text-base" : "text-lg"
              )}
            >
              {formatPrice(fromPrice, currency)}
            </span>
          </div>
        )}
      </Link>

      <div className={cn("flex flex-col flex-1", compact ? "p-3.5" : "p-5")}>
        <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mb-1.5">
          <MapPin size={14} className="text-[var(--brand-primary)] flex-shrink-0" />
          <span className="truncate">
            {neighborhood || hotel.city}
            {neighborhood ? ` · ${hotel.city}` : `, ${hotel.country}`}
          </span>
        </div>

        <Link href={`/hotels/${hotel.slug}`}>
          <h3
            className={cn(
              "font-bold text-slate-900 dark:text-white mb-2 group-hover:text-[var(--brand-primary)] dark:group-hover:text-amber-400 transition-colors line-clamp-1",
              compact ? "text-base" : "text-lg"
            )}
          >
            {name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-950 text-white text-xs font-black rounded-lg border border-slate-800 shadow-sm">
            <Star size={10} className="fill-amber-400 text-amber-400" />
            {hotel.rating.toFixed(1)}
          </span>
          {!compact && (
            <span className="text-slate-500 dark:text-slate-400 text-xs">
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
                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-md border border-transparent dark:border-slate-700/50"
              >
                {a}
              </span>
            ))}
          </div>
        )}

        <div
          className={cn(
            "mt-auto flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800",
            compact ? "pt-2" : "pt-3"
          )}
        >
          <ShareToCommunityButton
            service={{
              id: hotel.id,
              type: "hotel",
              typeLabel: "فندق ومنتجع فاخر",
              title: name,
              destination: neighborhood || hotel.city || "إسطنبول",
              price: fromPrice || undefined,
              currency,
              imageUrl: hotel.images?.[0] || "",
              url: `/hotels/${hotel.slug}`,
            }}
          />
          <Link
            href={`/hotels/${hotel.slug}`}
            className="flex-1 min-w-0 inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 hover:text-purple-950 dark:hover:bg-purple-950/40 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 truncate"
          >
            <span className="truncate">{t.hotels.rooms}</span>
            <ChevronRight size={13} className="rtl:rotate-180 shrink-0" />
          </Link>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="تواصل عبر واتساب"
            className="flex-1 min-w-0 inline-flex items-center justify-center gap-1 px-2.5 py-2 text-xs font-black text-amber-300 bg-gradient-to-r from-[#2e1065] via-[#3b1275] to-[#4c1d95] hover:from-[#3b1275] hover:to-[#581c87] rounded-xl transition-all shadow-sm border border-amber-400/30 truncate"
          >
            <MessageCircle size={14} className="text-amber-300 shrink-0" />
            <span className="truncate">واتساب</span>
          </a>
        </div>
      </div>
    </article>
  );
}
