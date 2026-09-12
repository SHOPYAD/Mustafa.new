"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plane } from "lucide-react";
import { nearbyAirport } from "@/components/flights/api";
import { flightCopy } from "@/components/flights/copy";
import FlightSearchBar from "@/components/flights/FlightSearchBar";
import FlightDestinationShowcase from "@/components/flights/FlightDestinationShowcase";
import FlightSmartBookingSection from "@/components/flights/FlightSmartBookingSection";
import { resolveNamedAirport } from "@/components/flights/resolve-airport";
import {
  isSearchReady,
  NEARBY_SESSION_KEY,
  queryFromSearchParams,
  searchHref,
} from "@/components/flights/search-state";
import type { FlightSearchQuery } from "@/components/flights/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCurrency } from "@/components/ui/CurrencySelector";
import SearchAgentResultsDock from "@/components/search/SearchAgentResultsDock";
import { appendAgentParams } from "@/lib/search-agent";

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
        if (isSearchReady(next)) {
          const href = searchHref(next);
          const asid = params.get("asid");
          router.replace(params.get("ai") === "1" || asid ? appendAgentParams(href, asid || "live") : href);
        }
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
    const href = searchHref(ready);
    const asid = params.get("asid");
    router.push(params.get("ai") === "1" || asid ? appendAgentParams(href, asid || "live") : href);
  };

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1b053a] via-[#2e1065] to-[#3b0764] pb-14 pt-20 sm:pt-24 md:pt-28 -mt-px">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute start-1/4 top-16 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
          <div className="absolute bottom-0 end-10 h-64 w-64 rounded-full bg-purple-400/15 blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-3 sm:px-4">
          <div className="mb-8 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 border border-amber-400/30 px-4 py-1.5 text-sm font-black text-amber-300 shadow-sm">
              <Plane size={16} />
              LONALIZA FLIGHTS
            </span>
            <h1 className="text-4xl font-black text-white md:text-5xl tracking-tight">{copy.searchTitle}</h1>
            <p className="mx-auto mt-3 max-w-2xl text-lg text-purple-100/90 font-medium">{copy.searchSubtitle}</p>
            {nearbyNote ? <p className="mt-2 text-sm text-amber-300 font-bold">{nearbyNote}</p> : null}
          </div>
          <SearchAgentResultsDock
            tab="flight"
            page="hero"
            replace
            className="mt-3"
            context={`Flights landing ${query.origin?.iata || ""} ${query.destination?.iata || ""}`}
          >
            <FlightSearchBar query={query} onChange={setQuery} onSubmit={submit} copy={copy} />
          </SearchAgentResultsDock>
        </div>
      </section>

      <div className="bg-[#f8f6fc]">
        <div className="mx-auto max-w-6xl px-3 sm:px-4 pt-6">
          <FlightDestinationShowcase userOrigin={query.origin} />
        </div>
        <FlightSmartBookingSection copy={copy} />
      </div>
    </>
  );
}
