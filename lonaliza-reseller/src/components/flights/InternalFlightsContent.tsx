"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, Clock, Plane, Star } from "lucide-react";
import { nearbyAirport, searchAirports } from "@/components/flights/api";
import { flightCopy } from "@/components/flights/copy";
import ExploreEverywhere from "@/components/flights/ExploreEverywhere";
import FlightSearchBar from "@/components/flights/FlightSearchBar";
import {
  isSearchReady,
  NEARBY_SESSION_KEY,
  queryFromSearchParams,
  searchHref,
} from "@/components/flights/search-state";
import type { AirportPick, FlightSearchQuery } from "@/components/flights/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCurrency } from "@/components/ui/CurrencySelector";

async function resolveNamedAirport(value: string, locale: Parameters<typeof searchAirports>[1]): Promise<AirportPick | null> {
  const text = value.trim();
  if (!text) return null;
  if (text.includes("|")) {
    const [skyId, entityId] = text.split("|");
    if (skyId && entityId) {
      return { skyId, entityId, iata: skyId.slice(0, 4), name: skyId, city: skyId, country: "", kind: "airport" };
    }
  }
  try {
    const hits = await searchAirports(text, locale);
    return hits[0] || null;
  } catch {
    return null;
  }
}

export default function InternalFlightsContent() {
  const { locale } = useLocale();
  const copy = flightCopy(locale);
  const router = useRouter();
  const params = useSearchParams();
  const { currency } = useCurrency();
  const [query, setQuery] = useState<FlightSearchQuery>(() => {
    const next = queryFromSearchParams(params, currency.code);
    next.currency = currency.code;
    return next;
  });
  const [nearbyNote, setNearbyNote] = useState("");

  useEffect(() => {
    setQuery((prev) => (prev.currency === currency.code ? prev : { ...prev, currency: currency.code }));
  }, [currency.code]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const next = queryFromSearchParams(params);
      if (next.origin && next.origin.skyId && !next.origin.entityId) {
        const resolved = await resolveNamedAirport(next.origin.skyId || next.origin.name, locale);
        if (!cancelled && resolved) next.origin = resolved;
      }
      if (next.destination && next.destination.skyId && !next.destination.entityId) {
        const resolved = await resolveNamedAirport(next.destination.skyId || next.destination.name, locale);
        if (!cancelled && resolved) next.destination = resolved;
      }
      if (!cancelled) {
        setQuery(next);
        if (isSearchReady(next)) router.replace(searchHref(next));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params, locale, router]);

  useEffect(() => {
    if (query.origin?.entityId) return;
    if (typeof window === "undefined" || !navigator.geolocation) return;
    try {
      if (sessionStorage.getItem(NEARBY_SESSION_KEY)) return;
    } catch {
      /* ignore */
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void nearbyAirport(pos.coords.latitude, pos.coords.longitude, locale)
          .then((airport) => {
            if (!airport) return;
            try {
              sessionStorage.setItem(NEARBY_SESSION_KEY, "1");
            } catch {
              /* ignore */
            }
            setQuery((prev) => (prev.origin ? prev : { ...prev, origin: airport }));
            setNearbyNote(`${copy.nearbyHint}: ${airport.city || airport.name} (${airport.iata || airport.skyId})`);
          })
          .catch(() => undefined);
      },
      () => undefined,
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  }, [query.origin?.entityId, locale, copy.nearbyHint]);

  const submit = () => {
    const ready = query;
    if (!isSearchReady(ready)) return;
    router.push(searchHref(ready));
  };

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#051741] via-[#0a2a4a] to-[#051741] pb-12 pt-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute start-1/4 top-16 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="absolute bottom-0 end-10 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-3 sm:px-4">
          <div className="mb-8 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-white">
              <Plane size={16} />
              ALRAYYAN
            </span>
            <h1 className="text-4xl font-bold text-white md:text-5xl">{copy.searchTitle}</h1>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-white/70">{copy.searchSubtitle}</p>
            {nearbyNote ? <p className="mt-2 text-sm text-amber-200">{nearbyNote}</p> : null}
          </div>
          <FlightSearchBar query={query} onChange={setQuery} onSubmit={submit} copy={copy} />
        </div>
      </section>

      <div className="bg-[#f4f1ea]">
        <ExploreEverywhere origin={query.origin} query={query} copy={copy} />
        <section className="pb-16">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="mb-10 text-center text-2xl font-bold text-[#051741]">{copy.whyTitle}</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
                  <Star size={24} className="text-amber-600" />
                </div>
                <h3 className="mb-2 font-bold text-[#051741]">{copy.whyPrice}</h3>
                <p className="text-sm text-slate-600">{copy.whyPriceBody}</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100">
                  <Clock size={24} className="text-sky-700" />
                </div>
                <h3 className="mb-2 font-bold text-[#051741]">{copy.whySupport}</h3>
                <p className="text-sm text-slate-600">{copy.whySupportBody}</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                  <Briefcase size={24} className="text-emerald-700" />
                </div>
                <h3 className="mb-2 font-bold text-[#051741]">{copy.whyEasy}</h3>
                <p className="text-sm text-slate-600">{copy.whyEasyBody}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
