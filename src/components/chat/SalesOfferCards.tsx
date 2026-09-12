"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Star,
  Plane,
  MapPin,
  Car,
  Sparkles,
  ArrowRight,
  Gift,
  Share2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Coins,
} from "lucide-react";
import type { SalesChatCard, SalesChatStructured } from "@/types/sales-chat";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent, cn } from "@/lib/utils";
import { BOOKING_SESSION_KEY } from "@/components/flights/search-state";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800";

function GuestMoney({ amount, currency }: { amount: number; currency?: string }) {
  const { formatPrice } = useCurrency();
  return <>{formatPrice(amount, currency || "USD")}</>;
}

function CardImage({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const url = src || PLACEHOLDER;
  const unoptimized = !url.includes("images.unsplash.com");
  return (
    <Image
      src={url}
      alt={alt}
      fill
      unoptimized={unoptimized}
      className={cn("object-cover", className)}
      sizes="(max-width: 640px) 100vw, 320px"
    />
  );
}

function HotelCard({ card }: { card: SalesChatCard }) {
  const { locale, t } = useLocale();
  const title = tContent(card, "title", locale);
  const subtitle = tContent(card, "subtitle", locale);
  const inner = (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/80 to-stone-900 shadow-lg shadow-amber-900/20">
      <div className="relative h-36">
        <CardImage src={card.image} alt={title} />
        <div className="absolute inset-0 bg-gradient-to-t from-amber-950 via-amber-950/40 to-transparent" />
        <div className="absolute top-3 start-3 flex items-center gap-0.5 rounded-full bg-black/40 px-2 py-1 backdrop-blur-sm">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={10}
              className="fill-amber-400 text-amber-400"
            />
          ))}
        </div>
        {card.badges?.[0] && (
          <span className="absolute top-3 end-3 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-bold text-white">
            {card.badges[0]}
          </span>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h4 className="font-bold text-amber-50 leading-snug">{title}</h4>
        {subtitle && (
          <p className="flex items-center gap-1.5 text-xs text-amber-200/60">
            <MapPin size={12} className="shrink-0 text-amber-400" />
            {subtitle}
          </p>
        )}
        {card.highlights && card.highlights.length > 0 && (
          <p className="text-[11px] text-amber-100/50 line-clamp-2">
            {card.highlights.slice(0, 2).join(" · ")}
          </p>
        )}
        {card.pricePending || card.clientPrice <= 0 ? (
          <p className="pt-1 text-sm font-semibold text-amber-200/80">
            {t.chat.priceOnConfirm}
          </p>
        ) : (
          <div className="pt-1">
            {card.unitPrice ? (
              <p className="text-[11px] text-amber-200/50">
                <GuestMoney amount={card.unitPrice} currency={card.currency} />{" "}
                {tContent(
                  { titleAr: card.unitLabelAr || "لليلة", titleEn: card.unitLabelEn || "per night" },
                  "title",
                  locale
                )}
              </p>
            ) : null}
            <p className="text-xl font-bold tracking-tight text-amber-300">
              <GuestMoney amount={card.clientPrice} currency={card.currency} />
            </p>
          </div>
        )}
      </div>
    </div>
  );
  return card.href ? (
    <Link href={card.href} className="block transition hover:scale-[1.02]">
      {inner}
    </Link>
  ) : (
    inner
  );
}

function FlightCard({ card }: { card: SalesChatCard }) {
  const { locale, t } = useLocale();
  const title = tContent(card, "title", locale);
  const subtitle = tContent(card, "subtitle", locale);
  const parts = (subtitle || title).split(/\s*[→\-–—]\s*/);
  const from = parts[0] || title;
  const to = parts[1] || card.badges?.[0] || "—";

  const inner = (
    <div className="overflow-hidden rounded-2xl border border-sky-400/25 bg-gradient-to-br from-sky-950 via-slate-900 to-blue-950 p-4 shadow-lg shadow-sky-900/30">
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-sky-300">
          <Plane size={12} />
          {t.admin.flightLabel}
        </span>
        {card.badges?.[0] && (
          <span className="text-[10px] text-sky-200/50">{card.badges[0]}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-lg font-bold text-white">{from}</p>
          <p className="text-[10px] uppercase tracking-widest text-sky-300/50">
            {t.common.from}
          </p>
        </div>
        <div className="flex flex-col items-center gap-1 px-1">
          <div className="h-px w-8 bg-gradient-to-r from-transparent via-sky-400 to-transparent" />
          <Plane size={14} className="rotate-90 text-sky-400 rtl:-rotate-90" />
          <div className="h-px w-8 bg-gradient-to-r from-transparent via-sky-400 to-transparent" />
        </div>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-lg font-bold text-white">{to}</p>
          <p className="text-[10px] uppercase tracking-widest text-sky-300/50">
            {t.common.to}
          </p>
        </div>
      </div>
      {title !== subtitle && (
        <p className="mt-3 text-center text-xs text-sky-100/60 line-clamp-1">
          {title}
        </p>
      )}
      {card.clientPrice > 0 && !card.pricePending ? (
        <p className="mt-3 text-center text-xl font-bold text-sky-300">
          <GuestMoney amount={card.clientPrice} currency={card.currency} />
        </p>
      ) : (
        <p className="mt-3 text-center text-xs font-semibold text-sky-200/80">
          {t.chat.priceOnConfirm}
        </p>
      )}
    </div>
  );
  return card.href ? (
    <Link href={card.href} className="block transition hover:scale-[1.02]">
      {inner}
    </Link>
  ) : (
    inner
  );
}

function PackageCard({ card }: { card: SalesChatCard }) {
  const { locale } = useLocale();
  const title = tContent(card, "title", locale);
  const subtitle = tContent(card, "subtitle", locale);
  const inner = (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-orange-600 via-rose-600 to-violet-700 p-[1px] shadow-lg shadow-rose-900/30">
      <div className="relative overflow-hidden rounded-[15px] bg-slate-950/40 backdrop-blur-sm">
        <div className="relative h-28">
          <CardImage src={card.image} alt={title} className="opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-rose-900/30 to-transparent" />
          <span className="absolute top-3 start-3 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            <Sparkles size={11} />
            Package
          </span>
        </div>
        <div className="space-y-2 p-4">
          <h4 className="font-bold text-white leading-snug">{title}</h4>
          {subtitle && (
            <p className="text-xs text-white/55 line-clamp-2">{subtitle}</p>
          )}
          {card.highlights && card.highlights.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {card.highlights.slice(0, 3).map((h) => (
                <li
                  key={h}
                  className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-white/80"
                >
                  {h}
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-end justify-between pt-1">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40">
                Total
              </p>
              <p className="text-2xl font-bold text-white">
                <GuestMoney amount={card.clientPrice} currency={card.currency} />
              </p>
            </div>
            <ArrowRight size={18} className="mb-1 text-white/50 rtl:rotate-180" />
          </div>
        </div>
      </div>
    </div>
  );
  return card.href ? (
    <Link href={card.href} className="block transition hover:scale-[1.02]">
      {inner}
    </Link>
  ) : (
    inner
  );
}

function TransferCard({ card }: { card: SalesChatCard }) {
  const { locale, t } = useLocale();
  const title = tContent(card, "title", locale);
  const subtitle = tContent(card, "subtitle", locale);
  const inner = (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-700/80 bg-gradient-to-br from-zinc-950 via-neutral-900 to-black shadow-lg shadow-black/40">
      <div className="absolute -end-8 -top-8 h-32 w-32 rounded-full bg-amber-500/10 blur-2xl" />
      <div className="relative flex gap-3 p-4">
        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-800">
          <CardImage src={card.image} alt={title} />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-transparent" />
          <Car
            size={18}
            className="absolute bottom-2 start-2 text-amber-400/90"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-500/80">
            VIP Transfer
          </span>
          <h4 className="font-bold text-zinc-50 leading-snug line-clamp-2">
            {title}
          </h4>
          {subtitle && (
            <p className="text-xs text-zinc-400 line-clamp-1">{subtitle}</p>
          )}
          {card.pricePending || card.clientPrice <= 0 ? (
            <p className="pt-1 text-sm font-semibold text-amber-300/80">
              {t.chat.priceOnConfirm}
            </p>
          ) : (
            <p className="pt-1 text-lg font-bold text-amber-400">
              <GuestMoney amount={card.clientPrice} currency={card.currency} />
            </p>
          )}
        </div>
      </div>
    </div>
  );
  return card.href ? (
    <Link href={card.href} className="block transition hover:scale-[1.02]">
      {inner}
    </Link>
  ) : (
    inner
  );
}

function ConnectedQuoteBar({
  cards,
  perks,
  bundlePayload,
}: {
  cards: SalesChatCard[];
  perks?: SalesChatStructured["perks"];
  bundlePayload?: SalesChatStructured["bundleCheckoutPayload"];
}) {
  const { locale, t } = useLocale();
  const order: SalesChatCard["type"][] = ["flight", "hotel", "transfer", "car"];
  const selected = order
    .map((type) => {
      const group = cards.filter((c) => c.type === type);
      if (!group.length) return null;
      const priced = group
        .filter((c) => c.clientPrice > 0)
        .sort((a, b) => a.clientPrice - b.clientPrice);
      return priced[0] || group[0];
    })
    .filter(Boolean) as SalesChatCard[];

  if (selected.length < 1 && !perks && !bundlePayload) return null;

  const total = selected.reduce((s, c) => s + (c.clientPrice || 0), 0) || perks?.bundlePriceUsd || 0;
  const originalPrice = perks?.originalPriceUsd || (total > 0 ? Math.round(total * 1.25) : 0);
  const savings = perks?.savingsUsd || (originalPrice - total);
  const loyaltyPoints = perks?.loyaltyPointsEarned || Math.round(total * 2);
  const loyaltyCash = perks?.loyaltyCashValue || Math.round(total * 0.02);

  const labels: Record<SalesChatCard["type"], string> = {
    flight: t.admin.flightLabel,
    hotel: t.nav.hotels,
    transfer: t.nav.transfers,
    car: t.nav.cars,
    package: t.nav.holidays,
  };

  const handleBookFullBundle = () => {
    const flightCard = cards.find((c) => c.type === "flight");
    const hotelCard = cards.find((c) => c.type === "hotel");
    const transferCard = cards.find((c) => c.type === "transfer");

    const sessionObj = {
      query: {
        origin: bundlePayload?.destinationCity ? "DXB" : "IST",
        destination: bundlePayload?.destinationCity || "IST",
        date: bundlePayload?.departDate || new Date().toISOString().slice(0, 10),
        returnDate: bundlePayload?.returnDate,
        adults: 2,
        childrens: 0,
        infants: 0,
        cabinClass: "economy",
      },
      selection: {
        itinerary: {
          id: `ai-bundle-${Date.now()}`,
          price: flightCard?.clientPrice || 180,
          currency: "USD",
          legs: [
            {
              origin: { displayCode: "DXB", name: "Dubai" },
              destination: { displayCode: "IST", name: bundlePayload?.destinationCity || "Istanbul" },
              departure: `${bundlePayload?.departDate || new Date().toISOString().slice(0, 10)}T10:00:00`,
              arrival: `${bundlePayload?.departDate || new Date().toISOString().slice(0, 10)}T14:30:00`,
              duration: 270,
              stopCount: 0,
              carriers: [{ code: "TK", name: "Turkish Airlines" }],
            },
          ],
        },
        fare: { id: "std", name: "باقة متكاملة مخصصة", price: flightCard?.clientPrice || 180 },
        extras: { extraBag: false, insurance: false, priorityBoarding: false, packageIds: [] },
      },
      selectedHotel: hotelCard
        ? {
            hotelId: hotelCard.id || "h-ai",
            hotelName: hotelCard.titleAr || hotelCard.titleEn,
            hotelStars: 5,
            hotelAddress: hotelCard.subtitleAr || hotelCard.subtitleEn || "مركز المدينة",
            hotelPhoto: hotelCard.image || PLACEHOLDER,
            roomId: "r-std",
            roomName: "غرفة فاخرة مشمولة بالبرنامج",
            roomPhoto: hotelCard.image || PLACEHOLDER,
            bedType: "1 King Bed",
            inclusions: ["إفطار مشمول", "إلغاء مجاني"],
            checkIn: bundlePayload?.departDate || new Date().toISOString().slice(0, 10),
            checkOut: bundlePayload?.returnDate || new Date().toISOString().slice(0, 10),
            nightsCount: 4,
            guestsCount: 2,
            pricePerNight: Math.round((hotelCard.clientPrice || 400) / 4),
            totalPrice: hotelCard.clientPrice || 400,
            currency: "USD",
            supplier: "ratehawk",
          }
        : null,
      selectedTransfer: transferCard
        ? {
            id: `tr-${Date.now()}`,
            vehicleType: "vip_van",
            titleAr: transferCard.titleAr,
            titleEn: transferCard.titleEn,
            vehicleName: transferCard.titleAr,
            seats: 7,
            luggage: 6,
            photoUrl: transferCard.image || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
            routeType: "airport_to_hotel",
            pickupLocation: "مطار الوصول",
            dropoffLocation: "الفندق",
            flightNumber: "TK 1982",
            date: bundlePayload?.departDate || new Date().toISOString().slice(0, 10),
            time: "14:30",
            price: transferCard.clientPrice || 55,
            currency: "USD",
            guestName: "Guest",
            guestPhone: "",
            supplier: "seeru_ride",
          }
        : null,
    };

    try {
      sessionStorage.setItem(BOOKING_SESSION_KEY, JSON.stringify(sessionObj));
      window.location.href = "/flights/booking";
    } catch {
      window.location.href = "/flights/booking";
    }
  };

  return (
    <div className="mb-4 overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-[#1b053a] via-[#240a45] to-[#3b0764] p-4 text-white shadow-xl shadow-purple-950/40">
      {/* Top Banner with Savings */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-800/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-400 text-slate-950">
            <Sparkles size={15} />
          </div>
          <div>
            <p className="text-xs font-black text-white">
              {locale === "ar" ? "باقة السفر المتكاملة المخصصة لك" : "Custom Tailored Travel Bundle"}
            </p>
            <p className="text-[10px] text-purple-200/70">
              {locale === "ar" ? "وفرت حتى 25% بحجز الخدمات معاً" : "Save up to 25% by bundling services"}
            </p>
          </div>
        </div>

        {savings > 0 && (
          <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
            ✓ {locale === "ar" ? `وفرت $${savings} فورياً` : `Saved $${savings} instantly`}
          </span>
        )}
      </div>

      {/* Services Grid */}
      {selected.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3">
          {selected.map((card) => (
            <div
              key={card.type}
              className="rounded-2xl border border-purple-800/60 bg-purple-950/40 p-2.5 transition"
            >
              <p className="text-[10px] uppercase font-bold text-purple-300/70">
                {labels[card.type]}
              </p>
              <p className="truncate text-xs font-black text-white mt-0.5">
                {tContent(card, "title", locale)}
              </p>
              <p className="mt-1 text-xs font-black text-amber-300">
                {card.pricePending || card.clientPrice <= 0 ? (
                  t.chat.priceOnConfirm
                ) : (
                  <GuestMoney amount={card.clientPrice} currency={card.currency} />
                )}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Perks Badges (Loyalty & Affiliate) */}
      <div className="flex flex-wrap items-center gap-2 my-3 pt-2 border-t border-purple-800/40 text-[11px]">
        <div className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 text-amber-300">
          <Coins size={13} className="text-amber-400" />
          <span>+{loyaltyPoints} نقطة ولاء كاش (${loyaltyCash})</span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-xl bg-purple-800/30 border border-purple-700/30 px-2.5 py-1 text-purple-200">
          <Share2 size={13} className="text-purple-300" />
          <span>اربح 4% كاش عند مشاركة الرحلة</span>
        </div>
      </div>

      {/* Price Comparison & Big 1-Click CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-purple-800/60">
        <div>
          {originalPrice > total && (
            <span className="block text-xs line-through text-purple-300/60">
              <GuestMoney amount={originalPrice} currency="USD" />
            </span>
          )}
          <div className="text-xl font-black text-white">
            <GuestMoney amount={total} currency="USD" />
          </div>
        </div>

        <button
          type="button"
          onClick={handleBookFullBundle}
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-6 py-3 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <span>{locale === "ar" ? "احجز هذا البرنامج المتكامل بنقرة واحدة 🚀" : "Book Full Custom Bundle in 1-Click 🚀"}</span>
        </button>
      </div>
    </div>
  );
}

export default function SalesOfferCards({
  cards,
  perks,
  bundlePayload,
  className,
}: {
  cards: SalesChatCard[];
  perks?: SalesChatStructured["perks"];
  bundlePayload?: SalesChatStructured["bundleCheckoutPayload"];
  className?: string;
}) {
  if (!cards?.length && !perks && !bundlePayload) return null;

  return (
    <div className={className}>
      <ConnectedQuoteBar cards={cards} perks={perks} bundlePayload={bundlePayload} />
      <div
        className={cn(
          "grid gap-3 sm:grid-cols-2",
          cards.length === 1 && "sm:grid-cols-1"
        )}
      >
        {cards.map((card, i) => {
          const key = `${card.type}-${card.id || i}-${card.titleEn || card.titleAr}`;
          switch (card.type) {
            case "hotel":
              return <HotelCard key={key} card={card} />;
            case "flight":
              return <FlightCard key={key} card={card} />;
            case "package":
              return <PackageCard key={key} card={card} />;
            case "transfer":
              return <TransferCard key={key} card={card} />;
            case "car":
              return <TransferCard key={key} card={card} />;
            default: {
              const _exhaustive: never = card.type;
              return _exhaustive;
            }
          }
        })}
      </div>
    </div>
  );
}
