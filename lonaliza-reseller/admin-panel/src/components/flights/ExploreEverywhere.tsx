"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { exploreEverywhere } from "@/components/flights/api";
import type { FlightCopy } from "@/components/flights/copy";
import { searchHref } from "@/components/flights/search-state";
import type { AirportPick, EverywhereDeal, FlightSearchQuery } from "@/components/flights/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useFlightPrice } from "@/components/flights/useFlightPrice";

type Props = {
  origin: AirportPick | null;
  query: FlightSearchQuery;
  copy: FlightCopy;
};

export default function ExploreEverywhere({ origin, query, copy }: Props) {
  const { locale } = useLocale();
  const { formatFlightPrice } = useFlightPrice();
  const router = useRouter();
  const [deals, setDeals] = useState<EverywhereDeal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!origin?.skyId || !origin.entityId) {
      setDeals([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void exploreEverywhere(origin, query.currency, locale, query.date || undefined)
      .then((rows) => {
        if (!cancelled) setDeals(rows.slice(0, 8));
      })
      .catch(() => {
        if (!cancelled) setDeals([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [origin, query.currency, query.date, locale]);

  return (
    <section className="py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="mb-6 text-2xl font-black text-purple-950">{copy.exploreTitle}</h2>
        {!origin ? (
          <p className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm border border-purple-100">{copy.exploreEmpty}</p>
        ) : loading && !deals.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-purple-100" />
            ))}
          </div>
        ) : deals.length === 0 ? (
          <p className="rounded-2xl bg-white p-8 text-center text-slate-500 shadow-sm border border-purple-100">{copy.exploreEmpty}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {deals.map((deal) => (
              <article key={deal.id} className="overflow-hidden rounded-2xl bg-white shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
                <div className="relative h-32 bg-gradient-to-br from-[#1b053a] to-[#3b0764]">
                  {deal.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={deal.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <p className="absolute bottom-3 start-3 text-sm font-black text-white">
                    {deal.name} · {deal.iata}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-xs text-slate-500 font-medium">
                    {deal.direct ? copy.directFrom : copy.startingFrom} {origin.iata}
                  </p>
                  <p className="mt-1 text-lg font-black text-purple-950">
                    {formatFlightPrice(deal.price, deal.currency || query.currency)}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">{deal.windowLabel || copy.anytime}</p>
                  <button
                    type="button"
                    className="mt-3 w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 py-2.5 text-sm font-black text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
                    onClick={() =>
                      router.push(
                        searchHref({
                          ...query,
                          origin,
                          destination: {
                            skyId: deal.skyId,
                            entityId: deal.entityId || deal.skyId,
                            iata: deal.iata,
                            name: deal.name,
                            city: deal.name,
                            country: "",
                            kind: "city",
                          },
                          date: query.date,
                        })
                      )
                    }
                  >
                    {copy.viewFlights}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
