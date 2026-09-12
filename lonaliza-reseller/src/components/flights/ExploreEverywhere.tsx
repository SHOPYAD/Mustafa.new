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
        <h2 className="mb-6 text-2xl font-bold text-[#051741]">{copy.exploreTitle}</h2>
        {!origin ? (
          <p className="rounded-2xl bg-white p-8 text-center text-slate-500">{copy.exploreEmpty}</p>
        ) : loading && !deals.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : deals.length === 0 ? (
          <p className="rounded-2xl bg-white p-8 text-center text-slate-500">{copy.exploreEmpty}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {deals.map((deal) => (
              <article key={deal.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <div className="relative h-32 bg-gradient-to-br from-[#051741] to-amber-700">
                  {deal.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={deal.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <p className="absolute bottom-3 start-3 text-sm font-bold text-white">
                    {deal.name} · {deal.iata}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-xs text-slate-500">
                    {deal.direct ? copy.directFrom : copy.startingFrom} {origin.iata}
                  </p>
                  <p className="mt-1 text-lg font-bold text-[#051741]">
                    {formatFlightPrice(deal.price, deal.currency || query.currency)}
                  </p>
                  <p className="text-xs text-slate-400">{deal.windowLabel || copy.anytime}</p>
                  <button
                    type="button"
                    className="mt-3 w-full rounded-xl bg-amber-500 py-2 text-sm font-bold text-[#051741]"
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
