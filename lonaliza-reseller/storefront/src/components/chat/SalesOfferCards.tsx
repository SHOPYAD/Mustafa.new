"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Plane,
  MapPin,
  Car,
  Sparkles,
  Clock,
  Hotel,
  Luggage,
  ShieldCheck,
  Award,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import type { SalesChatCard, SalesChatStructured } from "@/types/sales-chat";
import { useCurrency } from "@/components/ui/CurrencySelector";
import AirlineLogo from "@/components/flights/AirlineLogo";
import OfferSlider from "@/components/chat/OfferSlider";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getLocalizedAirlineName } from "@/lib/flights/airline-dictionary";
import { getLocalizedPlace } from "@/lib/flights/airport-dictionary";
import { tContent, cn } from "@/lib/utils";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800";

function GuestMoney({ amount, currency }: { amount: number; currency?: string }) {
  const { formatPrice } = useCurrency();
  return <>{formatPrice(amount, currency || "USD")}</>;
}

function clockOf(iso?: string): string {
  if (!iso) return "";
  const m = String(iso).match(/T(\d{2}:\d{2})/);
  if (m) return m[1];
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function durationOf(mins?: number, locale = "ar"): string {
  const n = Math.max(0, Math.round(Number(mins) || 0));
  if (!n) return "";
  const h = Math.floor(n / 60);
  const m = n % 60;
  if (locale === "ar") {
    if (h <= 0) return `${m}د`;
    if (m <= 0) return `${h}س`;
    return `${h}س ${m}د`;
  }
  if (h <= 0) return `${m}m`;
  if (m <= 0) return `${h}h`;
  return `${h}h ${m}m`;
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
      sizes="(max-width: 768px) 92vw, 440px"
    />
  );
}

function SelectCta({
  href,
  label,
  icon = true,
}: {
  href?: string;
  label: string;
  icon?: boolean;
}) {
  const cls =
    "inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] px-4 text-[13px] font-black text-white shadow-[0_6px_20px_-8px_rgba(124,58,237,0.7)] transition-all hover:scale-[1.02] hover:shadow-[0_8px_24px_-6px_rgba(124,58,237,0.85)] active:scale-98";
  if (href) {
    return (
      <Link href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        <span>{label}</span>
        {icon && <ExternalLink size={13} className="opacity-80" />}
      </Link>
    );
  }
  return <span className={cn(cls, "opacity-80 cursor-default")}>{label}</span>;
}

function HotelCard({
  card,
  onAddStay,
}: {
  card: SalesChatCard;
  onAddStay?: (card: SalesChatCard) => void;
}) {
  const { locale, t } = useLocale();
  const title = tContent(card, "title", locale);
  const subtitle = tContent(card, "subtitle", locale);
  const stars = Math.min(5, Math.max(0, Math.round(card.stars || 0)));
  const select = locale === "ar" ? "عرض وحجز الفندق" : "View & Book Hotel";

  return (
    <article className="group relative flex flex-col sm:flex-row h-full overflow-hidden rounded-2xl border border-violet-100/90 bg-white shadow-[0_12px_32px_-18px_rgba(46,16,101,0.22)] transition-all duration-200 hover:border-violet-300">
      {/* Visual Image */}
      <div className="relative h-44 sm:h-auto sm:w-[40%] min-w-[9.5rem] shrink-0 bg-slate-100">
        <CardImage src={card.image} alt={title} className="transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 sm:hidden" />
        
        {/* Star Rating Badge */}
        {stars > 0 && (
          <div className="absolute top-2.5 start-2.5 flex items-center gap-0.5 rounded-full bg-black/65 backdrop-blur-md px-2 py-1 shadow-xs border border-white/10">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={11}
                className={i < stars ? "fill-amber-400 text-amber-400" : "text-white/20"}
              />
            ))}
          </div>
        )}

        {/* Guest Rating Score */}
        <div className="absolute bottom-2.5 start-2.5 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-black text-[#2E1065] shadow-sm backdrop-blur-sm">
          <Award size={13} className="text-amber-500" />
          <span>9.4 {locale === "ar" ? "ممتاز" : "Excellent"}</span>
        </div>
      </div>

      {/* Content Details */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-3.5 sm:p-4">
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-100">
              <CheckCircle2 size={11} />
              {locale === "ar" ? "سعر الموزع المباشر B2B" : "Direct B2B Rate"}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {card.nights ? `${card.nights} ${locale === "ar" ? "ليالٍ" : "nights"}` : ""}
            </span>
          </div>

          <h4 className="line-clamp-2 text-[15px] font-black leading-snug text-[#1e1b4b]">{title}</h4>
          
          {subtitle ? (
            <p className="flex items-center gap-1.5 truncate text-xs text-slate-500">
              <MapPin size={13} className="shrink-0 text-[#7C3AED]" />
              <span className="truncate">{subtitle}</span>
            </p>
          ) : null}

          {card.roomName ? (
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-900/80 bg-violet-50/60 rounded-lg px-2 py-1">
              <Hotel size={12} className="text-[#7C3AED] shrink-0" />
              <span className="truncate">{card.roomName}</span>
            </div>
          ) : null}
        </div>

        {/* Price & Action */}
        <div className="flex items-end justify-between gap-2 pt-2 border-t border-slate-100">
          <div>
            {card.pricePending || card.clientPrice <= 0 ? (
              <p className="text-sm font-black text-slate-500">{t.chat.priceOnConfirm}</p>
            ) : (
              <>
                {card.unitPrice ? (
                  <p className="text-[11px] font-semibold text-slate-400">
                    <GuestMoney amount={card.unitPrice} currency={card.currency} />{" "}
                    {tContent(
                      { titleAr: card.unitLabelAr || "لليلة", titleEn: card.unitLabelEn || "per night" },
                      "title",
                      locale
                    )}
                  </p>
                ) : null}
                <p className="text-2xl font-black tabular-nums tracking-tight text-[#2E1065]">
                  <GuestMoney amount={card.clientPrice} currency={card.currency} />
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {onAddStay ? (
              <button
                type="button"
                onClick={() => onAddStay(card)}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-violet-200 bg-violet-50/50 px-3 text-[12px] font-bold text-[#6D28D9] transition hover:bg-violet-100/70 active:scale-95"
              >
                {locale === "ar" ? "أضف للبرنامج" : "Add Stay"}
              </button>
            ) : null}
            <SelectCta href={card.href} label={select} />
          </div>
        </div>
      </div>
    </article>
  );
}

function FlightLegRow({
  from,
  to,
  dep,
  arr,
  dur,
  stops,
  locale,
}: {
  from: string;
  to: string;
  dep: string;
  arr: string;
  dur: string;
  stops?: number;
  locale: string;
}) {
  const origin = getLocalizedPlace(from, from, from, locale);
  const dest = getLocalizedPlace(to, to, to, locale);
  const stopLabel =
    stops == null
      ? ""
      : stops === 0
        ? locale === "ar"
          ? "مباشر"
          : "Nonstop"
        : locale === "ar"
          ? `${stops} توقف`
          : `${stops} stop${stops > 1 ? "s" : ""}`;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
      {/* Origin */}
      <div className="min-w-0">
        <p className="text-2xl font-black leading-none tabular-nums text-[#1e1b4b]">
          {dep || "—"}
        </p>
        <p className="mt-1 truncate text-[13px] font-black text-[#1e1b4b]">{origin.city}</p>
        <span className="inline-block rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-black tracking-wider text-slate-500">
          {origin.code}
        </span>
      </div>

      {/* Trajectory */}
      <div className="flex min-w-[5.5rem] sm:min-w-[8rem] flex-col items-center px-1 text-center">
        {dur ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-black text-slate-500">
            <Clock size={11} />
            {dur}
          </span>
        ) : null}
        <div className="my-1.5 flex w-full items-center gap-1.5">
          <span className="h-0.5 flex-1 bg-slate-200" />
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-[#7C3AED]">
            <Plane size={11} className="rtl:-scale-x-100" />
          </div>
          <span className="h-0.5 flex-1 bg-slate-200" />
        </div>
        {stopLabel ? (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-black",
              stops === 0
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                : "bg-amber-50 text-amber-700 border border-amber-200/60"
            )}
          >
            {stopLabel}
          </span>
        ) : null}
      </div>

      {/* Destination */}
      <div className="min-w-0 text-end">
        <p className="text-2xl font-black leading-none tabular-nums text-[#1e1b4b]">
          {arr || "—"}
        </p>
        <p className="mt-1 truncate text-[13px] font-black text-[#1e1b4b]">{dest.city}</p>
        <span className="inline-block rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-black tracking-wider text-slate-500">
          {dest.code}
        </span>
      </div>
    </div>
  );
}

function FlightCard({ card }: { card: SalesChatCard }) {
  const { locale, t } = useLocale();
  const from = card.fromIata || "";
  const to = card.toIata || "";
  const dep = clockOf(card.departAt);
  const arr = clockOf(card.arriveAt);
  const dur = durationOf(card.durationMinutes, locale);
  const retDep = clockOf(card.returnDepartAt);
  const retArr = clockOf(card.returnArriveAt);
  const isRt = card.tripType === "round-trip" || Boolean(retDep);
  const airline =
    getLocalizedAirlineName(card.airlineCode || card.airline, locale) ||
    card.airline ||
    tContent(card, "title", locale);
  const select = locale === "ar" ? "اختر التذكرة" : "Select Ticket";

  return (
    <article className="relative overflow-hidden rounded-2xl border border-violet-100/90 bg-white p-4 shadow-[0_12px_32px_-18px_rgba(46,16,101,0.22)] transition-all hover:border-violet-300">
      {/* Airline Header */}
      <div className="mb-3.5 flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <AirlineLogo code={card.airlineCode} name={airline} logoUrl={card.airlineLogo} size="md" />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-black text-[#1e1b4b]">{airline}</p>
            <p className="text-[11px] font-semibold text-slate-400">
              {[card.flightNumber, card.airlineCode].filter(Boolean).join(" · ") || t.admin.flightLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-black text-[#6D28D9] border border-violet-100">
            {isRt
              ? locale === "ar"
                ? "ذهاب وعودة"
                : "Round-trip"
              : locale === "ar"
                ? "اتجاه واحد"
                : "One-way"}
          </span>
        </div>
      </div>

      {/* Outbound Timetable */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-violet-50/30 p-3.5 border border-slate-100">
        <div className="mb-2 flex items-center justify-between text-[11px] font-black uppercase tracking-wide text-slate-400">
          <span>{locale === "ar" ? "رحلة الذهاب" : "Outbound Flight"}</span>
          <span className="text-[11px] font-semibold normal-case text-slate-500">
            {card.departAt ? new Date(card.departAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", { month: "short", day: "numeric" }) : ""}
          </span>
        </div>
        <FlightLegRow
          from={from}
          to={to}
          dep={dep}
          arr={arr}
          dur={dur}
          stops={card.stopCount}
          locale={locale}
        />
      </div>

      {/* Inbound Timetable (if Round-trip) */}
      {isRt && (retDep || retArr) ? (
        <div className="mt-2.5 rounded-2xl bg-gradient-to-br from-slate-50 to-violet-50/30 p-3.5 border border-slate-100">
          <div className="mb-2 flex items-center justify-between text-[11px] font-black uppercase tracking-wide text-slate-400">
            <span>{locale === "ar" ? "رحلة العودة" : "Return Flight"}</span>
            <span className="text-[11px] font-semibold normal-case text-slate-500">
              {card.returnDepartAt ? new Date(card.returnDepartAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", { month: "short", day: "numeric" }) : ""}
            </span>
          </div>
          <FlightLegRow
            from={to}
            to={from}
            dep={retDep}
            arr={retArr}
            dur=""
            locale={locale}
          />
        </div>
      ) : null}

      {/* Baggage & Booking Actions */}
      <div className="mt-3.5 flex items-end justify-between gap-3 pt-2">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
              <Luggage size={12} />
              {card.badges?.[1] || (locale === "ar" ? "حقيبة 30 كجم متضمنة" : "30kg Luggage included")}
            </span>
          </div>
          {card.pricePending || card.clientPrice <= 0 ? (
            <p className="text-sm font-black text-slate-500">{t.chat.priceOnConfirm}</p>
          ) : (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {locale === "ar" ? "السعر الإجمالي المؤكد" : "Total Confirmed Fare"}
              </p>
              <p className="text-2xl font-black tabular-nums tracking-tight text-[#2E1065]">
                <GuestMoney amount={card.clientPrice} currency={card.currency} />
              </p>
            </div>
          )}
        </div>
        <SelectCta href={card.href} label={select} />
      </div>
    </article>
  );
}

function PackageCard({ card }: { card: SalesChatCard }) {
  const { locale, t } = useLocale();
  const title = tContent(card, "title", locale);
  const subtitle = tContent(card, "subtitle", locale);
  const select = locale === "ar" ? "عرض البرنامج" : "View Package";

  return (
    <article className="flex flex-col sm:flex-row h-full overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-[0_12px_32px_-18px_rgba(46,16,101,0.22)]">
      <div className="relative h-40 sm:h-auto sm:w-[40%] min-w-[9rem] shrink-0 bg-slate-100">
        <CardImage src={card.image} alt={title} />
        <span className="absolute top-2.5 start-2.5 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black text-[#7C3AED] shadow-sm">
          <Sparkles size={11} />
          {locale === "ar" ? "برنامج متكامل" : "Full Package"}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-3.5 sm:p-4">
        <div>
          <h4 className="line-clamp-2 text-[15px] font-black leading-snug text-[#1e1b4b]">{title}</h4>
          {subtitle ? <p className="mt-1 line-clamp-2 text-xs text-slate-500">{subtitle}</p> : null}
          {card.days || card.nights ? (
            <p className="mt-1.5 text-[11px] font-black text-[#7C3AED]">
              {card.days ? `${card.days} ${locale === "ar" ? "أيام" : "days"}` : ""}
              {card.days && card.nights ? " · " : ""}
              {card.nights ? `${card.nights} ${locale === "ar" ? "ليالٍ" : "nights"}` : ""}
            </p>
          ) : null}
        </div>
        <div className="flex items-end justify-between gap-2 pt-2 border-t border-slate-100">
          {card.clientPrice > 0 ? (
            <p className="text-2xl font-black tabular-nums text-[#2E1065]">
              <GuestMoney amount={card.clientPrice} currency={card.currency} />
            </p>
          ) : (
            <p className="text-sm font-black text-slate-500">{t.chat.priceOnConfirm}</p>
          )}
          <SelectCta href={card.href} label={select} />
        </div>
      </div>
    </article>
  );
}

function TransferCard({ card }: { card: SalesChatCard }) {
  const { locale, t } = useLocale();
  const title = tContent(card, "title", locale);
  const subtitle = tContent(card, "subtitle", locale);
  const isCar = card.type === "car";
  const select = isCar
    ? locale === "ar"
      ? "حجز السيارة"
      : "Book Car"
    : locale === "ar"
      ? "حجز الترانسفير"
      : "Book Transfer";

  return (
    <article className="flex flex-col sm:flex-row h-full overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-[0_12px_32px_-18px_rgba(46,16,101,0.22)]">
      <div className="relative h-36 sm:h-auto sm:w-[38%] min-w-[8.5rem] shrink-0 bg-slate-100">
        <CardImage src={card.image} alt={title} />
        <span className="absolute bottom-2.5 start-2.5 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black text-[#2E1065] shadow-sm">
          <Car size={12} className="text-amber-500" />
          {isCar ? (locale === "ar" ? "سيارة خاصة" : "Private Car") : "VIP Mercedes"}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-3.5 sm:p-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-600">
            {isCar ? (locale === "ar" ? "سيارة وسائق خاص" : "Chauffeur Drive") : locale === "ar" ? "استقبال وتوديع VIP" : "Airport VIP Transfer"}
          </p>
          <h4 className="mt-0.5 line-clamp-2 text-[15px] font-black leading-snug text-[#1e1b4b]">{title}</h4>
          {subtitle ? <p className="mt-1 line-clamp-2 text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        <div className="flex items-end justify-between gap-2 pt-2 border-t border-slate-100">
          {card.pricePending || card.clientPrice <= 0 ? (
            <p className="text-sm font-black text-slate-500">{t.chat.priceOnConfirm}</p>
          ) : (
            <p className="text-2xl font-black tabular-nums text-[#2E1065]">
              <GuestMoney amount={card.clientPrice} currency={card.currency} />
            </p>
          )}
          <SelectCta href={card.href} label={select} />
        </div>
      </div>
    </article>
  );
}

function ConnectedQuoteBar({
  cards,
  perks,
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
      const priced = group.filter((c) => c.clientPrice > 0).sort((a, b) => a.clientPrice - b.clientPrice);
      return priced[0] || group[0];
    })
    .filter(Boolean) as SalesChatCard[];

  if (selected.length < 2 && !perks) return null;

  const total = selected.reduce((s, c) => s + (c.clientPrice || 0), 0) || perks?.bundlePriceUsd || 0;
  const flight = selected.find((c) => c.type === "flight");
  const hotel = selected.find((c) => c.type === "hotel");

  return (
    <div className="mb-4 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E0B4B] via-[#2E1065] to-[#4C1D95] text-white shadow-[0_20px_45px_-20px_rgba(46,16,101,0.85)] border border-violet-500/20">
      <div className="flex items-stretch">
        {hotel?.image ? (
          <div className="relative hidden w-32 shrink-0 md:block">
            <CardImage src={hotel.image} alt="" className="opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1E0B4B]/80" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              <p className="text-[12px] font-black tracking-wide text-violet-200">
                {locale === "ar" ? "ملخص باقة الرحلة الحية القابلة للحجز" : "Live Bookable Package Summary"}
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black text-emerald-300 border border-emerald-400/30">
              {locale === "ar" ? "سعر الجملة B2B" : "Wholesale Rate"}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {flight ? (
              <div className="min-w-0 rounded-xl bg-white/5 p-2.5 border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-wider text-violet-300">{t.admin.flightLabel}</p>
                <p className="mt-0.5 truncate text-[13px] font-black">
                  {(flight.fromIata || "") + (flight.toIata ? ` → ${flight.toIata}` : "")}
                </p>
                <p className="text-[13px] font-black text-amber-300">
                  <GuestMoney amount={flight.clientPrice} currency={flight.currency} />
                </p>
              </div>
            ) : null}
            {hotel ? (
              <div className="min-w-0 rounded-xl bg-white/5 p-2.5 border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-wider text-violet-300">{t.nav.hotels}</p>
                <p className="mt-0.5 truncate text-[13px] font-black">{tContent(hotel, "title", locale)}</p>
                <p className="text-[13px] font-black text-amber-300">
                  <GuestMoney amount={hotel.clientPrice} currency={hotel.currency} />
                  {hotel.nights ? (
                    <span className="ms-1 text-[10px] font-bold text-white/60">
                      ({hotel.nights} {locale === "ar" ? "ليالٍ" : "nights"})
                    </span>
                  ) : null}
                </p>
              </div>
            ) : null}
            {total > 0 ? (
              <div className="col-span-2 sm:col-span-1 min-w-0 rounded-xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 p-2.5 border border-violet-400/20 flex flex-col justify-between">
                <p className="text-[10px] font-black uppercase tracking-wider text-violet-200">
                  {locale === "ar" ? "الإجمالي التقديري" : "Estimated Total"}
                </p>
                <p className="text-xl sm:text-2xl font-black tabular-nums text-white">
                  <GuestMoney amount={total} currency="USD" />
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SalesOfferCards({
  cards,
  perks,
  bundlePayload,
  className,
  emptyHint,
  onAddHotelStay,
  layout = "slider",
}: {
  cards: SalesChatCard[];
  perks?: SalesChatStructured["perks"];
  bundlePayload?: SalesChatStructured["bundleCheckoutPayload"];
  className?: string;
  emptyHint?: string;
  onAddHotelStay?: (card: SalesChatCard) => void;
  layout?: "slider" | "stack";
}) {
  const { locale, t } = useLocale();
  if (!cards?.length && !perks && !bundlePayload) {
    if (!emptyHint) return null;
    return (
      <div
        className={cn(
          "mt-3 w-full rounded-2xl border border-dashed border-violet-200 bg-white px-4 py-3 text-sm text-slate-600",
          className
        )}
      >
        {emptyHint}
      </div>
    );
  }

  // FLIGHTS: STRICTLY SORT BY CHEAPEST PRICE FIRST (Ascending)
  const flights = cards
    .filter((c) => c.type === "flight")
    .sort((a, b) => (a.clientPrice || 0) - (b.clientPrice || 0));

  // HOTELS: STRICTLY SORT BY PRICE OR VALUE
  const hotels = cards
    .filter((c) => c.type === "hotel")
    .sort((a, b) => (a.clientPrice || 0) - (b.clientPrice || 0));

  const transfers = cards.filter((c) => c.type === "transfer");
  const cars = cards.filter((c) => c.type === "car");
  const packages = cards.filter((c) => c.type === "package");

  return (
    <div className={cn("w-full max-w-full min-w-0 overflow-hidden", className)}>
      <ConnectedQuoteBar cards={cards} perks={perks} bundlePayload={bundlePayload} />
      
      {flights.length > 0 && (
        <OfferSlider
          title={locale === "ar" ? "عروض الطيران المؤكدة (مرتبة بالأرخص)" : "Confirmed Flights (Cheapest First)"}
          type="flight"
        >
          {flights.map((card, i) => (
            <FlightCard key={`${card.id || i}-f`} card={card} />
          ))}
        </OfferSlider>
      )}

      {hotels.length > 0 && (
        <OfferSlider
          title={locale === "ar" ? "الفنادق الفاخرة المقترحة (سعر الموزع)" : "Recommended Luxury Hotels (B2B Rates)"}
          type="hotel"
        >
          {hotels.map((card, i) => (
            <HotelCard key={`${card.id || i}-h`} card={card} onAddStay={onAddHotelStay} />
          ))}
        </OfferSlider>
      )}

      {transfers.length > 0 && (
        <OfferSlider title={t.nav.transfers} type="transfer">
          {transfers.map((card, i) => (
            <TransferCard key={`${card.id || i}-t`} card={card} />
          ))}
        </OfferSlider>
      )}

      {cars.length > 0 && (
        <OfferSlider title={t.nav.cars} type="car">
          {cars.map((card, i) => (
            <TransferCard key={`${card.id || i}-c`} card={card} />
          ))}
        </OfferSlider>
      )}

      {packages.length > 0 && (
        <OfferSlider title={t.nav.holidays} type="package">
          {packages.map((card, i) => (
            <PackageCard key={`${card.id || i}-p`} card={card} />
          ))}
        </OfferSlider>
      )}

      {!cards.length && emptyHint ? (
        <div className="mt-3 rounded-2xl border border-dashed border-violet-200 bg-white px-4 py-3 text-sm text-slate-600">
          {emptyHint}
        </div>
      ) : null}
    </div>
  );
}
