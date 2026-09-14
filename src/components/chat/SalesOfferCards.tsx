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
} from "lucide-react";
import type { SalesChatCard, SalesChatStructured } from "@/types/sales-chat";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
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

function durationOf(mins?: number): string {
  const n = Math.max(0, Math.round(Number(mins) || 0));
  if (!n) return "";
  const h = Math.floor(n / 60);
  const m = n % 60;
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
      sizes="(max-width: 640px) 86vw, 280px"
    />
  );
}

function Rail({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3 first:mt-0">
      <p className="mb-2 px-0.5 text-[11px] font-bold uppercase tracking-wider text-white/45">
        {title}
      </p>
      <div className="lonaliza-h-scroll flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </div>
  );
}

function EmptyRail({ title, hint, href }: { title: string; hint: string; href?: string }) {
  return (
    <div className="mt-3 rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-white/40">{title}</p>
      <p className="mt-1 text-sm text-white/60">{hint}</p>
      {href ? (
        <Link href={href} className="mt-2 inline-block text-xs font-semibold text-amber-300">
          {hint}
        </Link>
      ) : null}
    </div>
  );
}

function HotelCard({ card }: { card: SalesChatCard }) {
  const { locale, t } = useLocale();
  const title = tContent(card, "title", locale);
  const subtitle = tContent(card, "subtitle", locale);
  const stars = Math.min(5, Math.max(0, Math.round(card.stars || 0)));
  const inner = (
    <div className="relative h-full overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/80 to-stone-900 shadow-lg shadow-amber-900/20">
      <div className="relative h-36">
        <CardImage src={card.image} alt={title} />
        <div className="absolute inset-0 bg-gradient-to-t from-amber-950 via-amber-950/40 to-transparent" />
        {stars > 0 && (
          <div className="absolute top-3 start-3 flex items-center gap-0.5 rounded-full bg-black/40 px-2 py-1 backdrop-blur-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={10}
                className={i < stars ? "fill-amber-400 text-amber-400" : "text-white/25"}
              />
            ))}
          </div>
        )}
        {card.badges?.[0] && (
          <span className="absolute top-3 end-3 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-bold text-white">
            {card.badges[0]}
          </span>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h4 className="font-bold leading-snug text-amber-50">{title}</h4>
        {subtitle && (
          <p className="flex items-center gap-1.5 text-xs text-amber-200/60">
            <MapPin size={12} className="shrink-0 text-amber-400" />
            {subtitle}
          </p>
        )}
        {card.roomName ? (
          <p className="flex items-center gap-1 text-[11px] text-amber-100/55">
            <Hotel size={11} />
            {card.roomName}
          </p>
        ) : null}
        {card.highlights && card.highlights.length > 0 && (
          <p className="line-clamp-2 text-[11px] text-amber-100/50">
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
    <Link href={card.href} className="block h-full transition hover:scale-[1.02]">
      {inner}
    </Link>
  ) : (
    inner
  );
}

function FlightCard({ card }: { card: SalesChatCard }) {
  const { locale, t } = useLocale();
  const from = card.fromIata || "";
  const to = card.toIata || "";
  const dep = clockOf(card.departAt);
  const arr = clockOf(card.arriveAt);
  const dur = durationOf(card.durationMinutes);
  const airline = card.airline || tContent(card, "title", locale);
  const retDep = clockOf(card.returnDepartAt);

  const inner = (
    <div className="h-full overflow-hidden rounded-2xl border border-sky-400/25 bg-gradient-to-br from-sky-950 via-slate-900 to-blue-950 p-4 shadow-lg shadow-sky-900/30">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-sky-300">
          <Plane size={12} />
          {card.airlineCode || t.admin.flightLabel}
        </span>
        <span className="text-[10px] text-sky-200/60">
          {card.tripType === "round-trip" || retDep
            ? locale === "ar"
              ? "ذهاب وعودة"
              : "Round-trip"
            : locale === "ar"
              ? "اتجاه واحد"
              : "One-way"}
        </span>
      </div>
      <p className="mb-2 truncate text-xs font-semibold text-sky-100/80">{airline}</p>
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 text-center">
          <p className="text-lg font-black text-white">{dep || from || "—"}</p>
          <p className="text-[10px] font-bold tracking-widest text-sky-300/70">{from || t.common.from}</p>
        </div>
        <div className="flex flex-col items-center gap-0.5 px-1">
          <div className="h-px w-8 bg-gradient-to-r from-transparent via-sky-400 to-transparent" />
          <Plane size={14} className="rotate-90 text-sky-400 rtl:-rotate-90" />
          {dur ? (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-sky-200/70">
              <Clock size={9} />
              {dur}
            </span>
          ) : null}
          <div className="h-px w-8 bg-gradient-to-r from-transparent via-sky-400 to-transparent" />
        </div>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-lg font-black text-white">{arr || to || "—"}</p>
          <p className="text-[10px] font-bold tracking-widest text-sky-300/70">{to || t.common.to}</p>
        </div>
      </div>
      {card.stopCount != null && (
        <p className="mt-2 text-center text-[10px] text-sky-200/50">
          {card.stopCount === 0
            ? locale === "ar"
              ? "مباشر"
              : "Direct"
            : locale === "ar"
              ? `${card.stopCount} توقف`
              : `${card.stopCount} stop(s)`}
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
    <Link href={card.href} className="block h-full transition hover:scale-[1.02]">
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
    <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-orange-600 via-rose-600 to-violet-700 p-[1px] shadow-lg shadow-rose-900/30">
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
          <h4 className="font-bold leading-snug text-white">{title}</h4>
          {subtitle && <p className="line-clamp-2 text-xs text-white/55">{subtitle}</p>}
          <p className="text-2xl font-bold text-white">
            <GuestMoney amount={card.clientPrice} currency={card.currency} />
          </p>
        </div>
      </div>
    </div>
  );
  return card.href ? (
    <Link href={card.href} className="block h-full transition hover:scale-[1.02]">
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
    <div className="relative h-full overflow-hidden rounded-2xl border border-zinc-700/80 bg-gradient-to-br from-zinc-950 via-neutral-900 to-black shadow-lg shadow-black/40">
      <div className="relative flex gap-3 p-4">
        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-800">
          <CardImage src={card.image} alt={title} />
          <Car size={18} className="absolute bottom-2 start-2 text-amber-400/90" />
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-500/80">
            {card.type === "car" ? (locale === "ar" ? "سيارة" : "Car") : "VIP Transfer"}
          </span>
          <h4 className="line-clamp-2 font-bold leading-snug text-zinc-50">{title}</h4>
          {subtitle && <p className="line-clamp-1 text-xs text-zinc-400">{subtitle}</p>}
          {card.pricePending || card.clientPrice <= 0 ? (
            <p className="pt-1 text-sm font-semibold text-amber-300/80">{t.chat.priceOnConfirm}</p>
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
    <Link href={card.href} className="block h-full transition hover:scale-[1.02]">
      {inner}
    </Link>
  ) : (
    inner
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
      const priced = group
        .filter((c) => c.clientPrice > 0)
        .sort((a, b) => a.clientPrice - b.clientPrice);
      return priced[0] || group[0];
    })
    .filter(Boolean) as SalesChatCard[];

  if (selected.length < 1 && !perks) return null;

  const total = selected.reduce((s, c) => s + (c.clientPrice || 0), 0) || perks?.bundlePriceUsd || 0;

  const labels: Record<SalesChatCard["type"], string> = {
    flight: t.admin.flightLabel,
    hotel: t.nav.hotels,
    transfer: t.nav.transfers,
    car: t.nav.cars,
    package: t.nav.holidays,
  };

  return (
    <div className="mb-3 overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-[#1b053a] via-[#240a45] to-[#3b0764] p-4 text-white shadow-xl shadow-purple-950/40">
      <p className="text-xs font-black text-white">
        {locale === "ar" ? "ملخص العرض الحي" : "Live offer summary"}
      </p>
      {selected.length > 0 && (
        <div className="my-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {selected.map((card) => (
            <div
              key={card.type}
              className="rounded-2xl border border-purple-800/60 bg-purple-950/40 p-2.5"
            >
              <p className="text-[10px] font-bold uppercase text-purple-300/70">{labels[card.type]}</p>
              <p className="mt-0.5 truncate text-xs font-black text-white">
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
      {total > 0 && (
        <div className="text-xl font-black text-white">
          <GuestMoney amount={total} currency="USD" />
        </div>
      )}
    </div>
  );
}

const SLIDE = "w-[min(86vw,280px)] shrink-0 snap-start";

export default function SalesOfferCards({
  cards,
  perks,
  bundlePayload,
  className,
  emptyHint,
}: {
  cards: SalesChatCard[];
  perks?: SalesChatStructured["perks"];
  bundlePayload?: SalesChatStructured["bundleCheckoutPayload"];
  className?: string;
  emptyHint?: string;
}) {
  const { locale, t } = useLocale();
  if (!cards?.length && !perks && !bundlePayload) {
    if (!emptyHint) return null;
    return (
      <div className={cn("mt-3 rounded-2xl border border-dashed border-white/15 px-4 py-3 text-sm text-white/60", className)}>
        {emptyHint}
      </div>
    );
  }

  const flights = cards.filter((c) => c.type === "flight");
  const hotels = cards.filter((c) => c.type === "hotel");
  const transfers = cards.filter((c) => c.type === "transfer");
  const cars = cards.filter((c) => c.type === "car");
  const packages = cards.filter((c) => c.type === "package");

  return (
    <div className={className}>
      <ConnectedQuoteBar cards={cards} perks={perks} bundlePayload={bundlePayload} />
      {flights.length > 0 && (
        <Rail title={t.admin.flightLabel}>
          {flights.map((card, i) => (
            <div key={`${card.id || i}-f`} className={SLIDE}>
              <FlightCard card={card} />
            </div>
          ))}
        </Rail>
      )}
      {hotels.length > 0 && (
        <Rail title={t.nav.hotels}>
          {hotels.map((card, i) => (
            <div key={`${card.id || i}-h`} className={SLIDE}>
              <HotelCard card={card} />
            </div>
          ))}
        </Rail>
      )}
      {transfers.length > 0 && (
        <Rail title={t.nav.transfers}>
          {transfers.map((card, i) => (
            <div key={`${card.id || i}-t`} className={SLIDE}>
              <TransferCard card={card} />
            </div>
          ))}
        </Rail>
      )}
      {cars.length > 0 && (
        <Rail title={t.nav.cars}>
          {cars.map((card, i) => (
            <div key={`${card.id || i}-c`} className={SLIDE}>
              <TransferCard card={card} />
            </div>
          ))}
        </Rail>
      )}
      {packages.length > 0 && (
        <Rail title={t.nav.holidays}>
          {packages.map((card, i) => (
            <div key={`${card.id || i}-p`} className={SLIDE}>
              <PackageCard card={card} />
            </div>
          ))}
        </Rail>
      )}
      {!cards.length && emptyHint ? (
        <EmptyRail
          title={locale === "ar" ? "المخزون الحي" : "Live inventory"}
          hint={emptyHint}
        />
      ) : null}
    </div>
  );
}
