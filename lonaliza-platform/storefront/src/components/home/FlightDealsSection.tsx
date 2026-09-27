"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, Search } from "lucide-react";
import type {
  HomepageFlightDeal,
  HomepageFlightDealGroup,
  HomepageFlightDealsPayload,
} from "@/lib/flight-deals-types";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/types";
import SafeImage from "@/components/ui/SafeImage";
import HomeSwipeCarousel from "@/components/ui/HomeSwipeCarousel";

function localizedName(
  locale: Locale,
  ar: string,
  en: string,
  tr: string
): string {
  switch (locale) {
    case "ar":
      return ar;
    case "tr":
      return tr;
    case "en":
      return en;
    default:
      return en;
  }
}

function formatDealPrice(price: number | null, currency: string, locale: Locale): string | null {
  if (price == null || price <= 0) return null;
  try {
    return new Intl.NumberFormat(locale === "ar" ? "ar" : locale === "tr" ? "tr" : "en", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${currency} ${price}`;
  }
}

function TpDealCard({ deal, light }: { deal: HomepageFlightDeal; light?: boolean }) {
  const router = useRouter();
  const { locale, t } = useLocale();
  const originName = localizedName(locale, deal.originNameAr, deal.originNameEn, deal.originNameTr);
  const destName = localizedName(locale, deal.destNameAr, deal.destNameEn, deal.destNameTr);
  const priceLabel = formatDealPrice(deal.price, deal.currency, locale);

  return (
    <article
      className={
        light
          ? "group relative flex min-h-[15.5rem] min-w-0 flex-col overflow-hidden rounded-[1.35rem] bg-[#1e1b4b]"
          : "group relative flex min-h-[15.5rem] min-w-0 flex-col overflow-hidden rounded-[1.35rem] border border-purple-900/40 bg-[#120324]"
      }
    >
      <div className="absolute inset-0">
        {deal.destImage ? (
          <SafeImage src={deal.destImage} alt={destName} fill className="object-cover opacity-50 transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-purple-900 to-indigo-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#120324] via-[#120324]/55 to-transparent" />
      </div>
      <div className="relative z-10 flex h-full flex-1 flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300">
            {originName} · {deal.originIata}
          </p>
          {priceLabel ? (
            <span className="shrink-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 py-0.5 text-xs font-black text-slate-950">
              {priceLabel}
            </span>
          ) : null}
        </div>
        <div>
          <h3 className="truncate text-xl font-black text-white">{destName}</h3>
          <p className="mt-1 text-sm text-white/75">
            {deal.originIata} → {deal.destIata}
          </p>
          <button
            type="button"
            onClick={() => router.push(deal.href)}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-2.5 text-sm font-black text-slate-950"
          >
            <Search size={14} />
            {t.home.flightDealsCta}
          </button>
        </div>
      </div>
    </article>
  );
}

function LiveDealCard({ deal }: { deal: HomepageFlightDeal }) {
  const router = useRouter();
  const { locale, t } = useLocale();
  const destName = localizedName(locale, deal.destNameAr, deal.destNameEn, deal.destNameTr);
  const originName = localizedName(locale, deal.originNameAr, deal.originNameEn, deal.originNameTr);
  const priceLabel = formatDealPrice(deal.price, deal.currency, locale);

  return (
    <article className="group relative flex min-h-[220px] min-w-0 flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-[#120324] via-[#240a4a] to-[#3b1275] border border-amber-400/20 shadow-xl">
      <div className="absolute inset-0">
        {deal.destImage ? (
          <SafeImage src={deal.destImage} alt={destName} fill className="object-cover transition duration-700 group-hover:scale-105 opacity-40" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-purple-950 to-indigo-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#120324] via-[#120324]/60 to-transparent" />
      </div>
      <div className="relative z-10 flex h-full flex-1 flex-col justify-between p-5">
        <div className="flex items-start justify-between gap-3">
          {deal.airlineLogo ? (
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white shadow-md ring-2 ring-white/70">
              <SafeImage src={deal.airlineLogo} alt={deal.airlineName || ""} width={36} height={36} className="object-contain" />
            </span>
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white">
              <Plane size={16} />
            </span>
          )}
          {priceLabel ? (
            <span className="rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1 text-xs font-black text-slate-950 shadow-sm">
              {t.home.flightDealsPriceFrom} {priceLabel}
            </span>
          ) : null}
        </div>
        <div className="mt-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300">
            {originName} · {deal.originIata}
          </p>
          <h3 className="mt-1 truncate text-xl font-black text-white">{destName}</h3>
          <p className="mt-1 text-sm text-slate-200">
            {deal.originIata} → {deal.destIata}
            {deal.direct ? ` · ${t.home.flightDealsDirect}` : ""}
          </p>
          <button
            type="button"
            onClick={() => router.push(deal.href)}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 py-2.5 text-sm font-black text-slate-950 transition shadow-md cursor-pointer"
          >
            {t.home.flightDealsCta}
          </button>
        </div>
      </div>
    </article>
  );
}

function TpGroups({ groups, light }: { groups: HomepageFlightDealGroup[]; light?: boolean }) {
  const { locale, t } = useLocale();

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <div key={group.destIata} className="min-w-0">
          <div className="mb-4 flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-purple-200">
              <SafeImage src={group.destImage} alt={group.destNameEn} fill className="object-cover" />
            </div>
            <div className="min-w-0">
              <h3 className="flex items-center gap-2 text-lg font-black text-slate-900 md:text-xl">
                <Plane size={18} className="text-purple-700" />
                {t.home[
                  group.destIata === "TZX" ? "flightDealsToTrabzon" : "flightDealsToIstanbul"
                ]}
              </h3>
              <p className="text-xs font-bold text-slate-500">
                {localizedName(locale, group.destNameAr, group.destNameEn, group.destNameTr)} · {group.destIata}
              </p>
            </div>
          </div>

          <HomeSwipeCarousel
            arrowTone="gold"
            desktopClassName="lg:grid lg:grid-cols-4 lg:gap-4 lg:!overflow-visible lg:pb-0"
          >
            {group.offers.map((deal) => (
              <TpDealCard key={deal.id} deal={deal} light={light} />
            ))}
          </HomeSwipeCarousel>
        </div>
      ))}
    </div>
  );
}

function LiveGrid({ deals }: { deals: HomepageFlightDeal[] }) {
  return (
    <HomeSwipeCarousel
      arrowTone="gold"
      desktopClassName="lg:grid lg:grid-cols-3 lg:gap-4 lg:!overflow-visible lg:pb-0"
    >
      {deals.map((deal) => (
        <LiveDealCard key={deal.id} deal={deal} />
      ))}
    </HomeSwipeCarousel>
  );
}

function DealsBody({
  payload,
  light,
}: {
  payload: HomepageFlightDealsPayload;
  light?: boolean;
}) {
  const { t } = useLocale();

  if (payload.source === "live") {
    if (!payload.deals.length) {
      return (
        <p className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-8 text-center text-sm text-slate-500">
          {t.home.flightDealsLiveEmpty}
        </p>
      );
    }
    return <LiveGrid deals={payload.deals} />;
  }

  if (!payload.groups.length) {
    return (
      <p className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-8 text-center text-sm text-slate-500">
        {t.home.flightDealsLiveEmpty}
      </p>
    );
  }
  return <TpGroups groups={payload.groups} light={light} />;
}

export default function FlightDealsSection({ embedded = false }: { embedded?: boolean }) {
  const { t } = useLocale();
  const [payload, setPayload] = useState<HomepageFlightDealsPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/flights/deals", { cache: "no-store" });
        const data = (await res.json()) as HomepageFlightDealsPayload;
        if (!cancelled && data?.ok) setPayload(data);
      } catch {
        if (!cancelled) setPayload(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const body = payload ? (
    <DealsBody payload={payload} light />
  ) : (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-52 animate-pulse rounded-2xl bg-white/60" />
      ))}
    </div>
  );

  if (embedded) {
    return <div className="relative min-w-0 pb-4">{body}</div>;
  }

  return (
    <section className="relative overflow-hidden bg-slate-50/60 py-12 md:py-16 border-t border-slate-100">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 start-1/4 h-80 w-80 rounded-full bg-amber-500/10 blur-[100px]" />
        <div className="absolute bottom-0 end-0 h-72 w-72 rounded-full bg-purple-600/10 blur-[90px]" />
      </div>

      <div className="home-container relative z-10 mx-auto min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-purple-700 md:text-sm">
            {payload?.source === "live" ? t.home.flightDealsLiveEyebrow : t.nav.flights}
          </p>
          <h2 className="text-2xl font-black leading-tight text-slate-900 md:text-3xl lg:text-4xl">
            {t.home.flightDealsTitle}
          </h2>
          <p className="mt-3 text-base text-slate-600 font-medium md:text-lg">{t.home.flightDealsSubtitle}</p>
          <p className="mt-2 text-sm text-slate-500">{t.home.flightDealsSupport}</p>
        </div>
        {body}
      </div>
    </section>
  );
}
