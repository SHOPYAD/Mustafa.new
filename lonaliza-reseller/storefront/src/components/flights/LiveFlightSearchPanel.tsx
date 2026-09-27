"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { nearbyAirport } from "@/components/flights/api";
import { flightCopy } from "@/components/flights/copy";
import FlightSearchBar from "@/components/flights/FlightSearchBar";
import {
  isSearchReady,
  NEARBY_SESSION_KEY,
  queryFromSearchParams,
  searchHref,
} from "@/components/flights/search-state";
import type { FlightSearchQuery } from "@/components/flights/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCurrency } from "@/components/ui/CurrencySelector";

type Props = {
  variant?: "standalone" | "embedded";
  compact?: boolean;
};

export default function LiveFlightSearchPanel({ variant = "standalone", compact }: Props) {
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

  useEffect(() => {
    setQuery((prev) => (prev.currency === currency.code ? prev : { ...prev, currency: currency.code }));
  }, [currency.code]);

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
          })
          .catch(() => undefined);
      },
      () => undefined,
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 }
    );
  }, [query.origin?.entityId, locale]);

  const submit = () => {
    if (!isSearchReady(query)) return;
    router.push(searchHref(query));
  };

  return (
    <FlightSearchBar
      query={query}
      onChange={setQuery}
      onSubmit={submit}
      copy={copy}
      compact={compact}
      variant={variant}
    />
  );
}
