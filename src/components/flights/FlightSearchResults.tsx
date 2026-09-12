"use client";

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { searchFlights, searchIncomplete } from "@/components/flights/api";
import { flightCopy } from "@/components/flights/copy";
import FlightAffiliateBanner from "@/components/flights/FlightAffiliateBanner";
import FlightDatePriceSlider from "@/components/flights/FlightDatePriceSlider";
import FlightDestinationHotelsSection from "@/components/flights/FlightDestinationHotelsSection";
import FlightDetailsDrawer from "@/components/flights/FlightDetailsDrawer";
import FlightResultCard from "@/components/flights/FlightResultCard";
import FlightSearchBar from "@/components/flights/FlightSearchBar";
import FlightSearchSkeleton from "@/components/flights/FlightSearchSkeleton";
import FlightSearchWaitingBanner from "@/components/flights/FlightSearchWaitingBanner";
import { resolveNamedAirport } from "@/components/flights/resolve-airport";
import {
  applyRankTags,
  bookingItinerarySnapshot,
  hasIncludedBaggage,
  hasNoCheckedBag,
  hourOf,
  isItineraryChangeable,
  isItineraryRefundable,
  isOvernightItinerary,
  itineraryFareBrands,
  layoverAirportCodes,
  maxCheckedKg,
  mergeItineraries,
  totalMinutes,
} from "@/components/flights/normalize";
import CouponSlider from "@/components/loyalty/CouponSlider";
import FlightFilters, {
  airlineOptions,
  airportOptions,
  baggageKgOptions,
  fareBrandOptions,
  filtersFromQuery,
  layoverOptions,
} from "@/components/flights/FlightFilters";
import FlightGuestLoginBanner from "@/components/flights/FlightGuestLoginBanner";
import FlightPriceLockTimer from "@/components/flights/FlightPriceLockTimer";
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
import SearchAgentResultsDock from "@/components/search/SearchAgentResultsDock";
import {
  SEARCH_AGENT_EVENT,
  appendAgentParams,
  loadSearchAgentSession,
  saveSearchAgentSession,
  type SearchAgentEventDetail,
  type SearchAgentFilters,
} from "@/lib/search-agent";
import { airlineMatches, itineraryAirline, resolveAirlineNames } from "@/lib/airline-match";

const PAGE_SIZE = 20;

function filterItineraries(items: Itinerary[], filters: FlightFiltersState): Itinerary[] {
  return items.filter((item) => {
    const stops = Math.max(...item.legs.map((leg) => (leg.stopCount >= 2 ? 2 : leg.stopCount)), 0) as 0 | 1 | 2;
    if (filters.directOnly && stops !== 0) return false;
    if (filters.stops.length && !filters.stops.includes(stops)) return false;
    const airline = itineraryAirline(item);
    if (
      filters.airlines.length &&
      !filters.airlines.some((req) => airlineMatches(req, airline.name, airline.code))
    ) {
      return false;
    }
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
    if (filters.baggage === "none" && !hasNoCheckedBag(item)) return false;
    if (typeof filters.baggage === "number" && maxCheckedKg(item) < filters.baggage) {
      return false;
    }
    if (filters.baggageKg != null && maxCheckedKg(item) !== filters.baggageKg) return false;
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
    if (filters.changeableOnly && !isItineraryChangeable(item)) return false;
    if (filters.overnightOnly && !isOvernightItinerary(item)) return false;
    if (filters.fareBrands.length && !itineraryFareBrands(item).some((name) => filters.fareBrands.includes(name))) {
      return false;
    }
    if (filters.layoverAirports.length) {
      const vias = layoverAirportCodes(item);
      if (!filters.layoverAirports.some((code) => vias.includes(code))) return false;
    }
    return true;
  });
}

function pickItineraryForAgent(
  items: Itinerary[],
  visible: Itinerary[],
  filters?: SearchAgentFilters
): Itinerary | undefined {
  const requested = filters?.airlines || [];
  const matchesRequest = (item: Itinerary) => {
    if (!requested.length) return true;
    const airline = itineraryAirline(item);
    return requested.some((req) => airlineMatches(req, airline.name, airline.code));
  };
  const matchesPrefs = (item: Itinerary) => {
    const stops = Math.max(...item.legs.map((leg) => leg.stopCount), 0);
    if (filters?.directOnly && stops > 0) return false;
    if (filters?.refundable && !isItineraryRefundable(item)) return false;
    if ((filters?.baggageKg === 20 || filters?.baggageKg === 23) && maxCheckedKg(item) < filters.baggageKg) {
      return false;
    }
    if (filters?.baggageKg === "included" && !hasIncludedBaggage(item)) return false;
    return true;
  };
  const pool = items.length ? items : visible;
  const strict = pool.filter((item) => matchesRequest(item) && matchesPrefs(item));
  const airlineOnly = requested.length ? pool.filter(matchesRequest) : [];
  const ranked = (strict.length ? strict : airlineOnly.length ? airlineOnly : visible.length ? visible : pool)
    .slice()
    .sort((a, b) => a.price - b.price);
  return ranked[0];
}

function compactFlightInventory(items: Itinerary[], visible: Itinerary[]): string {
  const source = (visible.length ? visible : items).slice(0, 10);
  if (!source.length) {
    return items.length
      ? `Flight results loaded: ${items.length} itineraries, 0 after current filters.`
      : "Flight results are still loading.";
  }
  const carriers = [
    ...new Set(items.map((item) => itineraryAirline(item).name).filter(Boolean)),
  ].slice(0, 14);
  const lines = source.map((item, index) => {
    const airline = itineraryAirline(item);
    const stops = Math.max(...item.legs.map((leg) => leg.stopCount), 0);
    const dep = String(item.legs[0]?.departure || "").slice(11, 16);
    const bag = maxCheckedKg(item);
    const meal = item.legs.some((leg) => leg.segments.some((seg) => seg.amenities?.includes("meal")));
    return `${index + 1}. ${airline.name}${airline.code ? ` (${airline.code})` : ""} ${item.price} ${item.currency} ${stops === 0 ? "direct" : `${stops} stop`} dep ${dep || "?"} bag ${bag || "?"}kg refundable ${isItineraryRefundable(item) ? "yes" : "no"} meal ${meal ? "yes" : "unknown"}`;
  });
  return `Live flight inventory: ${visible.length} visible / ${items.length} total. Carriers: ${carriers.join(", ") || "n/a"}.\n${lines.join("\n")}`;
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
  const copy = useMemo(() => flightCopy(locale), [locale]);
  const paramKey = params.toString();
  const urlQuery = useMemo(() => queryFromSearchParams(new URLSearchParams(paramKey)), [paramKey]);
  const [query, setQuery] = useState(() => queryFromSearchParams(params));
  const [readyQuery, setReadyQuery] = useState<ReturnType<typeof queryFromSearchParams> | null>(null);
  const [items, setItems] = useState<Itinerary[]>([]);
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("best");
  const [filters, setFilters] = useState<FlightFiltersState>(() => filtersFromQuery(queryFromSearchParams(params)));
  const [mobileFilters, setMobileFilters] = useState(false);
  const [openItem, setOpenItem] = useState<Itinerary | null>(null);
  const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setQuery(urlQuery);
    setFilters(filtersFromQuery(urlQuery));
  }, [urlQuery]);

  useEffect(() => {
    let cancelled = false;
    setReadyQuery(null);
    void (async () => {
      const next = { ...urlQuery, currency: siteCurrency.code };
      if (next.origin?.skyId && !next.origin.entityId) {
        const hit = await resolveNamedAirport(next.origin.iata || next.origin.skyId || next.origin.name, locale);
        if (hit) next.origin = hit;
        else next.origin = { ...next.origin, entityId: next.origin.skyId };
      }
      if (next.destination?.skyId && !next.destination.entityId) {
        const hit = await resolveNamedAirport(
          next.destination.iata || next.destination.skyId || next.destination.name,
          locale
        );
        if (hit) next.destination = hit;
        else next.destination = { ...next.destination, entityId: next.destination.skyId };
      }
      if (cancelled) return;
      setQuery(next);
      setReadyQuery(next);
      const needsIds =
        Boolean(urlQuery.origin?.skyId && !urlQuery.origin.entityId) ||
        Boolean(urlQuery.destination?.skyId && !urlQuery.destination.entityId);
      if (needsIds && isSearchReady(next)) {
        const href = searchHref(next);
        const asid = params.get("asid");
        router.replace(params.get("ai") === "1" || asid ? appendAgentParams(href, asid || "live") : href);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [urlQuery, locale, siteCurrency.code, params, router]);

  useEffect(() => {
    setQuery((prev) =>
      prev.currency === siteCurrency.code ? prev : { ...prev, currency: siteCurrency.code }
    );
  }, [siteCurrency.code]);

  const searchQuery = useMemo(
    () => readyQuery || { ...urlQuery, currency: siteCurrency.code },
    [readyQuery, urlQuery, siteCurrency.code]
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
    if (!readyQuery) {
      setLoading(true);
      return;
    }
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
          for (let i = 0; i < 12; i += 1) {
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
  const layoverAirports = useMemo(() => layoverOptions(items), [items]);
  const fareBrands = useMemo(() => fareBrandOptions(items), [items]);
  const baggageKgs = useMemo(() => baggageKgOptions(items), [items]);
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

  // Reset pagination window when filters, search query, or sorting change
  useEffect(() => {
    setDisplayedCount(PAGE_SIZE);
  }, [searchQuery, filters, sortBy, items.length]);

  const visibleDisplayed = useMemo(
    () => visible.slice(0, displayedCount),
    [visible, displayedCount]
  );

  // Infinite scrolling observer to seamlessly load the next 20 flights on scroll
  useEffect(() => {
    if (displayedCount >= visible.length) return;
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setDisplayedCount((prev) => Math.min(prev + PAGE_SIZE, visible.length));
        }
      },
      { rootMargin: "450px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [displayedCount, visible.length]);

  const handleOpenDetails = useCallback((itinerary?: Itinerary) => {
    if (itinerary) setOpenItem(itinerary);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setOpenItem(null);
  }, []);

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

  const applyAgentFilters = useCallback((agentFilters: SearchAgentFilters, inventory = airlines) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (agentFilters.clearFilters) {
        next.airlines = [];
        next.directOnly = false;
        next.stops = [0, 1, 2];
        next.freeCancellation = false;
      }
      if (agentFilters.airlines?.length) {
        const resolved = resolveAirlineNames(agentFilters.airlines, inventory);
        next.airlines = resolved.length ? resolved : agentFilters.airlines;
      }
      if (agentFilters.directOnly) {
        next.directOnly = true;
        next.stops = [0];
      }
      if (agentFilters.baggageKg) next.baggage = agentFilters.baggageKg;
      if (agentFilters.refundable) next.freeCancellation = true;
      if (agentFilters.cabinClass) {
        next.cabinClass =
          agentFilters.cabinClass === "premium" ? "premium_economy" : agentFilters.cabinClass;
      }
      if (agentFilters.maxPrice) next.priceMax = agentFilters.maxPrice;
      setQuery((q) => mergeSearchFilters(q, next));
      return next;
    });
    if (agentFilters.sort === "fastest") setSortBy("fastest");
    else if (agentFilters.sort === "price") setSortBy("price");
    else if (agentFilters.sort === "best") setSortBy("best");
  }, [airlines]);

  useEffect(() => {
    const session = loadSearchAgentSession();
    if (!session?.pendingFilters) return;
    applyAgentFilters(session.pendingFilters);
    saveSearchAgentSession({ ...session, pendingFilters: undefined });
  }, [applyAgentFilters]);

  const selectFlight = useCallback(
    (selection: SelectedFare) => {
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
            availableItineraries: items,
          })
        );
        sessionStorage.setItem(
          "LONALIZA_LAST_SEARCH_ITINERARIES",
          JSON.stringify(items.slice(0, 35))
        );
      } catch {
        /* ignore */
      }
      router.push(bookingHref());
    },
    [items, query, router, sessionId]
  );

  useEffect(() => {
    const onAgent = (event: Event) => {
      const detail = (event as CustomEvent<SearchAgentEventDetail>).detail;
      if (!detail) return;
      if (detail.action === "filter" && detail.filters) {
        applyAgentFilters(detail.filters);
      }
      if (detail.action === "book") {
        const chosen = pickItineraryForAgent(items, visible, detail.filters);
        if (!chosen) return;
        selectFlight({
          itinerary: chosen,
          fare: chosen.fareFamilies[0] || null,
          sessionId,
          extras: { extraBag: false, insurance: false, priorityBoarding: false },
        });
      }
    };
    window.addEventListener(SEARCH_AGENT_EVENT, onAgent);
    return () => window.removeEventListener(SEARCH_AGENT_EVENT, onAgent);
  }, [applyAgentFilters, items, selectFlight, sessionId, visible]);

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
      layoverAirports={layoverAirports}
      fareBrands={fareBrands}
      baggageKgs={baggageKgs}
      maxDuration={maxDuration}
      priceBounds={priceBounds}
    />
  );

  return (
    <div className="min-h-screen bg-[#f8f6fc] pb-16 pt-[3.85rem]">
      {/* Brand Sticky Search Bar */}
      <div className="sticky top-[3.85rem] z-30 overflow-visible border-b border-purple-900/15 bg-gradient-to-r from-[#1b053a] via-[#2e1065] to-[#3b0764] shadow-lg shadow-purple-950/20">
        <div className="mx-auto max-w-7xl overflow-visible px-3 py-2 sm:px-4 sm:py-3">
          <SearchAgentResultsDock
            tab="flight"
            page="results"
            replace
            className="mt-2"
            context={`Flight search ${query.origin?.iata || query.origin?.city || ""} → ${query.destination?.iata || query.destination?.city || ""} ${query.date} ${query.returnDate || ""} pax ${query.adults}. ${compactFlightInventory(items, visible)}`}
          >
            <FlightSearchBar query={query} onChange={setQuery} onSubmit={submit} copy={copy} compact tone="brand" />
          </SearchAgentResultsDock>
        </div>
      </div>

      {/* Promo Coupopns & Guest Login Banner */}
      <div className="mx-auto mt-4 max-w-7xl px-4 space-y-3">
        <CouponSlider service="flights" />
        <FlightGuestLoginBanner service="flights" />
      </div>

      <div className="mx-auto mt-6 grid max-w-7xl grid-cols-1 gap-6 px-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <div className="sticky top-48">{filterPanel}</div>
        </div>

        <div>
          {/* Header & Sorter */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-black text-[#1e1b4b]">{copy.resultsTitle}</h1>
              <p className="text-sm font-semibold text-slate-600">
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
                className="inline-flex items-center gap-1 rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm font-bold text-[#1e1b4b] hover:bg-purple-50 lg:hidden shadow-xs cursor-pointer"
                onClick={() => setMobileFilters(true)}
              >
                <SlidersHorizontal size={14} /> {copy.filters}
              </button>
              <div className="flex flex-wrap gap-1.5 rounded-2xl border border-purple-200/80 bg-white p-1 shadow-xs">
                {sorts.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSortBy(key)}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer",
                      sortBy === key
                        ? "bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-white shadow-xs"
                        : "text-slate-700 hover:bg-purple-50 hover:text-purple-950"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Price Lock Countdown Timer */}
          {!loading && items.length > 0 ? (
            <FlightPriceLockTimer onRefresh={submit} className="mb-4" />
          ) : null}

          {query.tripType !== "multi-city" ? (
            <FlightDatePriceSlider
              query={searchQuery}
              copy={copy}
              onSelectDate={selectSliderDate}
              minLivePrice={items.length > 0 ? Math.min(...items.map((it) => it.price)) : undefined}
            />
          ) : null}

          {loading ? (
            <div>
              <FlightSearchWaitingBanner copy={copy} />
              <FlightSearchSkeleton />
            </div>
          ) : error ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm border border-purple-100">
              <p className="text-lg font-black text-[#1e1b4b]">{copy.errorTitle}</p>
              <p className="mt-2 text-sm text-slate-500">{copy.errorHint}</p>
              <button
                type="button"
                onClick={submit}
                className="mt-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 px-6 py-2.5 text-sm font-black text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                {copy.retry}
              </button>
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm border border-purple-100">
              <p className="text-lg font-black text-[#1e1b4b]">{copy.emptyTitle}</p>
              <p className="mt-2 text-sm text-slate-500">{copy.emptyHint}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleDisplayed.map((item, idx) => (
                <React.Fragment key={item.id}>
                  <FlightResultCard
                    item={item}
                    query={query}
                    copy={copy}
                    sessionId={sessionId}
                    onSelect={selectFlight}
                    onOpenDetails={handleOpenDetails}
                  />
                  {idx === 3 && (
                    <div className="my-5">
                      <FlightAffiliateBanner
                        originCity={query.origin?.city || query.origin?.name}
                        destinationCity={query.destination?.city || query.destination?.name}
                      />
                    </div>
                  )}
                  {idx === 7 && (
                    <div className="my-6">
                      <FlightDestinationHotelsSection
                        destinationCity={query.destination?.city || query.destination?.name || ""}
                        destinationIata={query.destination?.iata || query.destination?.skyId || ""}
                        departDate={query.departDate || query.date}
                        returnDate={query.returnDate}
                        guestsCount={query.adults + (query.childrens || query.children || 0)}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}

              {visible.length < 4 && visible.length > 0 && (
                <div className="my-5">
                  <FlightAffiliateBanner
                    originCity={query.origin?.city || query.origin?.name}
                    destinationCity={query.destination?.city || query.destination?.name}
                  />
                </div>
              )}

              {visible.length < 8 && visible.length > 0 && (
                <div className="my-6">
                  <FlightDestinationHotelsSection
                    destinationCity={query.destination?.city || query.destination?.name || ""}
                    destinationIata={query.destination?.iata || query.destination?.skyId || ""}
                    departDate={query.departDate || query.date}
                    returnDate={query.returnDate}
                    guestsCount={query.adults + (query.childrens || query.children || 0)}
                  />
                </div>
              )}

              {/* Infinite Scroll Sentinel & Load More Trigger */}
              {displayedCount < visible.length && (
                <div ref={loadMoreRef} className="py-6 flex flex-col items-center justify-center gap-3">
                  <div className="flex items-center gap-2.5 text-xs font-black text-[#2e1065] bg-purple-50/90 border border-purple-200/80 px-5 py-2.5 rounded-2xl shadow-xs">
                    <div className="w-4 h-4 border-2 border-[#4c1d95] border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>
                      {locale === "ar"
                        ? `جاري تحميل المزيد من الرحلات (${visibleDisplayed.length} من أصل ${visible.length})...`
                        : `Loading more flights (${visibleDisplayed.length} of ${visible.length})...`}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDisplayedCount((prev) => Math.min(prev + PAGE_SIZE, visible.length))}
                    className="text-xs font-bold text-purple-700 hover:text-purple-950 underline cursor-pointer py-1"
                  >
                    {locale === "ar"
                      ? `عرض 20 رحلة إضافية (${visible.length - visibleDisplayed.length} متبقية)`
                      : `Show 20 more flights (${visible.length - visibleDisplayed.length} remaining)`}
                  </button>
                </div>
              )}

              {/* All results displayed notice */}
              {visible.length > PAGE_SIZE && displayedCount >= visible.length && (
                <div className="py-6 text-center text-xs font-black text-slate-400">
                  {locale === "ar"
                    ? `تم عرض كافة الرحلات المتاحة بنجاح (${visible.length} رحلة)`
                    : `All available flights displayed (${visible.length} flights)`}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {mobileFilters ? (
        <div className="fixed inset-0 z-40 bg-[#1b053a]/60 backdrop-blur-xs p-4 lg:hidden">
          <div className="mx-auto max-h-[90vh] max-w-md overflow-auto rounded-3xl bg-white shadow-2xl border border-purple-100">
            {filterPanel}
            <button
              type="button"
              className="m-4 w-[calc(100%-2rem)] rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-sm font-black text-slate-950 shadow-md hover:from-amber-500 hover:to-amber-600 transition-all cursor-pointer"
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
        onClose={handleCloseDetails}
        onSelect={selectFlight}
      />
    </div>
  );
}
