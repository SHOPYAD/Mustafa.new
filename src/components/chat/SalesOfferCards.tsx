"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Plane,
  MapPin,
  Car,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import type { SalesChatCard } from "@/types/sales-chat";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent, cn } from "@/lib/utils";

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

function ConnectedQuoteBar({ cards }: { cards: SalesChatCard[] }) {
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
  if (selected.length < 2) return null;
  const total = selected.reduce((s, c) => s + (c.clientPrice || 0), 0);
  const labels: Record<SalesChatCard["type"], string> = {
    flight: t.admin.flightLabel,
    hotel: t.nav.hotels,
    transfer: t.nav.transfers,
    car: t.nav.cars,
    package: t.nav.holidays,
  };
  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-emerald-500/25 bg-[#071018]/95">
      <div className="flex items-center justify-between gap-2 border-b border-white/5 px-3 py-2">
        <p className="text-[11px] font-semibold text-emerald-200/80">
          {t.chat.programServices}
        </p>
        <p className="text-[10px] text-white/35">{t.chat.liveFromSearch}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
        {selected.map((card) => (
          <Link
            key={card.type}
            href={card.href || "#"}
            className="rounded-xl border border-white/8 bg-white/[0.03] px-2.5 py-2 transition hover:border-emerald-400/30"
          >
            <p className="text-[10px] uppercase tracking-wider text-white/40">
              {labels[card.type]}
            </p>
            <p className="truncate text-xs font-semibold text-white">
              {tContent(card, "title", locale)}
            </p>
            <p className="mt-1 text-sm font-bold text-emerald-300">
              {card.pricePending || card.clientPrice <= 0
                ? t.chat.priceOnConfirm
                : <GuestMoney amount={card.clientPrice} currency={card.currency} />}
            </p>
          </Link>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-white/5 bg-emerald-500/10 px-3 py-2.5">
        <span className="text-xs text-white/50">{t.chat.connectedTotal}</span>
        <span className="text-lg font-bold text-emerald-300">
          {total > 0 ? <GuestMoney amount={total} currency="USD" /> : t.chat.priceOnConfirm}
        </span>
      </div>
    </div>
  );
}

export default function SalesOfferCards({
  cards,
  className,
}: {
  cards: SalesChatCard[];
  className?: string;
}) {
  if (!cards?.length) return null;

  return (
    <div className={className}>
    <ConnectedQuoteBar cards={cards} />
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
