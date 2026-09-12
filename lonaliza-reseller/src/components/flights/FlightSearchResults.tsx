"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { searchFlights, searchIncomplete } from "@/components/flights/api";
import { flightCopy } from "@/components/flights/copy";
import FlightDatePriceSlider from "@/components/flights/FlightDatePriceSlider";
import FlightDetailsDrawer from "@/components/flights/FlightDetailsDrawer";
import FlightResultCard from "@/components/flights/FlightResultCard";
import FlightSearchBar from "@/components/flights/FlightSearchBar";
import FlightSearchSkeleton from "@/components/flights/FlightSearchSkeleton";
import FlightSearchWaitingBanner from "@/components/flights/FlightSearchWaitingBanner";
import {
  applyRankTags,
  bookingItinerarySnapshot,
  hasIncludedBaggage,
  hourOf,
  isItineraryRefundable,
  maxCheckedKg,
  mergeItineraries,
  totalMinutes,
} from "@/components/flights/normalize";
import CouponSlider from "@/components/loyalty/CouponSlider";
import FlightFilters, {
  airlineOptions,
  airportOptions,
  filtersFromQuery,
} from "@/components/flights/FlightFilters";
import {
  BOOKING_SESSION_KEY,
  bookingHref,
  isSearchReady,
  queryFromSearchParams,
  searchHref,
} from "@/components/flights/search-state";
import type {
  FlightFiltersState,
  FlightSearchQuery,
  Itinerary,
  SelectedFare,
  SortKey,
} from "@/components/flights/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { cn } from "@/lib/utils";

function filterItineraries(items: Itinerary[], filters: FlightFiltersState): Itinerary[] {
  return items.filter((item) => {
    const stops = Math.max(...item.legs.map((leg) => (leg.stopCount >= 2 ? 2 : leg.stopCount)), 0) as 0 | 1 | 2;
    if (filters.directOnly && stops !== 0) return false;
    if (filters.stops.length && !filters.stops.includes(stops)) return false;
    const airline =
      item.legs[0]?.carriers[0]?.name || item.legs[0]?.segments[0]?.marketingCarrier.name;
    if (filters.airlines.length && airline && !filters.airlines.includes(airline)) return false;
    const depart = hourOf(item.legs[0]?.departure || "");
    if (depart < filters.departStart || depart > filters.departEnd) return false;
    const arrive = hourOf(item.legs[0]?.arrival || "");
    if (arrive < filters.arriveStart || arrive > filters.arriveEnd) return false;
    if (totalMinutes(item) > filters.maxDuration) return false;
    if (filters.cabinClass !== "any") {
      const cabins = item.fareFamilies.map((f) => f.cabinClass);
      if (cabins.length && !cabins.includes(filters.cabinClass)) return false;
    }
    if (filters.baggage === "included" && !hasIncludedBaggage(item)) return false;
    if ((filters.baggage === 20 || filters.baggage === 23) && maxCheckedKg(item) < filters.baggage) {
      return false;
    }
    if (filters.priceMax > 0 && (item.price < filters.priceMin || item.price > filters.priceMax)) {
      return false;
    }
    const originCode = item.legs[0]?.origin.displayCode;
    if (filters.originAirports.length && originCode && !filters.originAirports.includes(originCode)) {
      return false;
    }
    const destCode = item.legs[0]?.destination.displayCode;
    if (filters.destAirports.length && destCode && !filters.destAirports.includes(destCode)) {
      return false;
    }
    if (filters.freeCancellation && !isItineraryRefundable(item)) return false;
    return true;
  });
}

function mergeSearchFilters(query: FlightSearchQuery, next: FlightFiltersState): FlightSearchQuery {
  return {
    ...query,
    directOnly: next.directOnly,
    baggage: next.baggage,
  };
}

function sortItineraries(items: Itinerary[], sortBy: SortKey): Itinerary[] {
  const next = [...items];
  switch (sortBy) {
    case "price":
      next.sort((a, b) => a.price - b.price);
      break;
    case "fastest":
      next.sort((a, b) => totalMinutes(a) - totalMinutes(b));
      break;
    case "outbound_departure_time":
      next.sort((a, b) => String(a.legs[0]?.departure).localeCompare(String(b.legs[0]?.departure)));
      break;
    case "best":
      next.sort((a, b) => a.price / Math.max(1, totalMinutes(b)) - b.price / Math.max(1, totalMinutes(a)));
      break;
    default: {
      const _exhaustive: never = sortBy;
      return _exhaustive;
    }
  }
  return next;
}

export default function FlightSearchResults() {
  const params = useSearchParams();
  const router = useRouter();
  const { locale } = useLocale();
  const { currency: siteCurrency } = useCurrency();
  const copy = flightCopy(locale);
  const paramKey = params.toString();
  const urlQuery = useMemo(() => queryFromSearchParams(new URLSearchParams(paramKey)), [paramKey]);
  const [query, setQuery] = useState(() => queryFromSearchParams(params));
  const [items, setItems] = useState<Itinerary[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("best");
  const [filters, setFilters] = useState<FlightFiltersState>(() => filtersFromQuery(queryFromSearchParams(params)));
  const [mobileFilters, setMobileFilters] = useState(false);
  const [openItem, setOpenItem] = useState<Itinerary | null>(null);

  useEffect(() => {
    setQuery(urlQuery);
    setFilters(filtersFromQuery(urlQuery));
  }, [urlQuery]);

  useEffect(() => {
    setQuery((prev) =>
      prev.currency === siteCurrency.code ? prev : { ...prev, currency: siteCurrency.code }
    );
  }, [siteCurrency.code]);

  const searchQuery = useMemo(
    () => ({ ...urlQuery, currency: siteCurrency.code }),
    [urlQuery, siteCurrency.code]
  );

  useEffect(() => {
    setFilters((prev) => {
      const nextStops: Array<0 | 1 | 2> = query.directOnly
        ? [0]
        : prev.directOnly && !query.directOnly
          ? [0, 1, 2]
          : prev.stops;
      const sameStops = prev.stops.length === nextStops.length && prev.stops.every((s, i) => s === nextStops[i]);
      if (prev.directOnly === query.directOnly && prev.baggage === query.baggage && sameStops) {
        return prev;
      }
      return {
        ...prev,
        directOnly: query.directOnly,
        baggage: query.baggage,
        stops: nextStops,
      };
    });
  }, [query.directOnly, query.baggage]);

  useEffect(() => {
    if (!isSearchReady(searchQuery)) {
      setLoading(false);
      setItems([]);
      return;
    }
    const ctrl = new AbortController();
    let cancelled = false;
    setLoading(true);
    setPolling(false);
    setError(false);
    setItems([]);
    setFilters(filtersFromQuery(searchQuery));
    void (async () => {
      try {
        const first = await searchFlights(searchQuery, locale, sortBy === "best" ? "best" : sortBy, ctrl.signal);
        if (cancelled) return;
        let merged = applyRankTags(first.itineraries);
        const activeSessionId = first.sessionId;
        setSessionId(activeSessionId);
        setItems(merged);
        const applyBounds = (rows: typeof merged) => {
          const maxDur = Math.max(180, ...rows.map(totalMinutes), 2400);
          const prices = rows.map((item) => item.price).filter((n) => n > 0);
          const minP = prices.length ? Math.min(...prices) : 0;
          const maxP = prices.length ? Math.max(...prices) : 0;
          setFilters((prev) => ({
            ...prev,
            maxDuration: maxDur,
            priceMin: minP,
            priceMax: maxP,
          }));
        };
        applyBounds(merged);
        if (first.status !== "complete" && activeSessionId) {
          setPolling(true);
          for (let i = 0; i < 4; i += 1) {
            await new Promise((resolve) => window.setTimeout(resolve, 1500));
            if (cancelled) return;
            try {
              const more = await searchIncomplete(
                activeSessionId,
                searchQuery.currency,
                searchQuery.cabinClass,
                ctrl.signal
              );
              merged = applyRankTags(mergeItineraries(merged, more.itineraries));
              setItems(merged);
              applyBounds(merged);
              if (more.status === "complete") break;
            } catch {
              break;
            }
          }
          if (!cancelled) setPolling(false);
        }
        if (!cancelled) setLoading(false);
      } catch {
        if (!cancelled) {
          setError(true);
          setItems([]);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [searchQuery, locale]);

  const airlines = useMemo(() => airlineOptions(items), [items]);
  const originAirports = useMemo(() => airportOptions(items, "origin"), [items]);
  const destAirports = useMemo(() => airportOptions(items, "destination"), [items]);
  const maxDuration = useMemo(() => Math.max(180, ...items.map(totalMinutes), 2400), [items]);
  const priceBounds = useMemo(() => {
    const prices = items.map((item) => item.price).filter((n) => n > 0);
    return {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
      currency: items[0]?.currency || searchQuery.currency,
    };
  }, [items, searchQuery.currency]);
  const visible = useMemo(
    () => sortItineraries(filterItineraries(items, filters), sortBy),
    [items, filters, sortBy]
  );

  const submit = () => {
    router.push(searchHref(query));
  };

  const selectSliderDate = (date: string) => {
    const next = { ...query, date };
    if (next.tripType === "round-trip" && next.returnDate && next.returnDate <= date) {
      const d = new Date(`${date}T12:00:00`);
      d.setDate(d.getDate() + 7);
      next.returnDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }
    setQuery(next);
    router.push(searchHref(next));
  };

  const changeFilters = (next: FlightFiltersState) => {
    setFilters(next);
    setQuery((prev) => mergeSearchFilters(prev, next));
  };

  const selectFlight = (selection: SelectedFare) => {
    const itinerary = bookingItinerarySnapshot(selection.itinerary);
    const next: SelectedFare = {
      ...selection,
      sessionId: selection.sessionId || sessionId,
      itinerary,
    };
    try {
      sessionStorage.setItem(
        BOOKING_SESSION_KEY,
        JSON.stringify({
          query,
          selection: next,
        })
      );
    } catch {
      /* ignore */
    }
    router.push(bookingHref());
  };

  const sorts: Array<[SortKey, string]> = [
    ["best", copy.sortBest],
    ["price", copy.sortPrice],
    ["fastest", copy.sortFastest],
    ["outbound_departure_time", copy.sortDepart],
  ];

  const filterPanel = (
    <FlightFilters
      copy={copy}
      filters={filters}
      onChange={changeFilters}
      airlines={airlines}
      originAirports={originAirports}
      destAirports={destAirports}
      maxDuration={maxDuration}
      priceBounds={priceBounds}
    />
  );

  return (
    <div className="min-h-screen bg-[#f3f6f4] pb-16 pt-24">
      <div className="sticky top-[4.25rem] z-30 overflow-visible border-b border-[#051741]/10 bg-[#051741] shadow-lg">
        <div className="mx-auto max-w-7xl overflow-visible px-3 py-2 sm:px-4 sm:py-3">
          <FlightSearchBar query={query} onChange={setQuery} onSubmit={submit} copy={copy} compact tone="brand" />
        </div>
      </div>

      <div className="mx-auto mt-4 max-w-7xl px-4">
        <CouponSlider service="flights" />
      </div>

      <div className="mx-auto mt-6 grid max-w-7xl grid-cols-1 gap-6 px-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <div className="sticky top-48">{filterPanel}</div>
        </div>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-[#051741]">{copy.resultsTitle}</h1>
              <p className="text-sm text-slate-500">
                {loading
                  ? copy.searching
                  : polling
                    ? copy.updating
                    : copy.flightsFoundFiltered(visible.length, items.length)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-xl border border-[#051741]/15 bg-white px-3 py-2 text-sm font-semibold text-[#051741] lg:hidden"
                onClick={() => setMobileFilters(true)}
              >
                <SlidersHorizontal size={14} /> {copy.filters}
              </button>
              <div className="flex flex-wrap gap-1.5 rounded-2xl bg-white p-1 shadow-sm">
                {sorts.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSortBy(key)}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs font-bold transition",
                      sortBy === key ? "bg-[#051741] text-white" : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {query.tripType !== "multi-city" ? (
            <FlightDatePriceSlider query={searchQuery} copy={copy} onSelectDate={selectSliderDate} />
          ) : null}

          {loading ? (
            <div>
              <FlightSearchWaitingBanner copy={copy} />
              <FlightSearchSkeleton />
            </div>
          ) : error ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
              <p className="text-lg font-bold text-[#051741]">{copy.errorTitle}</p>
              <p className="mt-2 text-sm text-slate-500">{copy.errorHint}</p>
              <button
                type="button"
                onClick={submit}
                className="mt-4 rounded-xl bg-[#10b981] px-4 py-2 text-sm font-bold text-white"
              >
                {copy.retry}
              </button>
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
              <p className="text-lg font-bold text-[#051741]">{copy.emptyTitle}</p>
              <p className="mt-2 text-sm text-slate-500">{copy.emptyHint}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((item) => (
                <FlightResultCard
                  key={item.id}
                  item={item}
                  query={query}
                  copy={copy}
                  onSelect={selectFlight}
                  onOpenDetails={() => setOpenItem(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {mobileFilters ? (
        <div className="fixed inset-0 z-40 bg-[#051741]/50 p-4 lg:hidden">
          <div className="mx-auto max-h-[90vh] max-w-md overflow-auto rounded-3xl bg-white">
            {filterPanel}
            <button
              type="button"
              className="m-4 w-[calc(100%-2rem)] rounded-xl bg-[#051741] py-3 text-sm font-bold text-white"
              onClick={() => setMobileFilters(false)}
            >
              {copy.done}
            </button>
          </div>
        </div>
      ) : null}

      <FlightDetailsDrawer
        item={openItem}
        query={query}
        sessionId={sessionId}
        copy={copy}
        onClose={() => setOpenItem(null)}
        onSelect={selectFlight}
      />
    </div>
  );
}
