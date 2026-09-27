"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import HotelFiltersPanel from "@/components/hotels/HotelFiltersPanel";
import HotelListCard, { HotelCardSkeleton } from "@/components/hotels/HotelListCard";
import CouponSlider from "@/components/loyalty/CouponSlider";
import HotelSearchBar from "@/components/hotels/HotelSearchBar";
import {
  defaultHotelDates,
  hotelApiSlug,
  parseHotelApiJson,
} from "@/lib/hotels-config";
import { buildLocalHotelFilterGroups, filterHotelsClientSide } from "@/lib/hotel-client-filters";
import {
  hotelSearchToParams,
  parseHotelSearchParams,
  syncHotelSearchUrl,
  type HotelSearchQuery,
} from "@/lib/hotel-search";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import SearchAgentResultsDock from "@/components/search/SearchAgentResultsDock";
import { SEARCH_AGENT_EVENT, type SearchAgentEventDetail } from "@/lib/search-agent";
import type {
  TravelAdvisorAppliedFilter,
  TravelAdvisorFilterGroup,
  TravelAdvisorHotelCard,
} from "@/types/travel-advisor";

type SortKey = "best" | "price" | "popular";

function initialHotelSearch(defaults: { checkIn: string; checkOut: string }): HotelSearchQuery {
  const q =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  return parseHotelSearchParams(q, defaults);
}

export default function TravelAdvisorHotels() {
  const { locale, t } = useLocale();
  const defaults = useMemo(() => defaultHotelDates(), []);
  const initial = useMemo(() => initialHotelSearch(defaults), [defaults]);
  const [search, setSearch] = useState<HotelSearchQuery>(initial);
  const [hotels, setHotels] = useState<TravelAdvisorHotelCard[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [sort, setSort] = useState<SortKey>("best");
  const [appliedFilters, setAppliedFilters] = useState<TravelAdvisorAppliedFilter[]>([]);
  const [filterGroups, setFilterGroups] = useState<TravelAdvisorFilterGroup[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [listSource, setListSource] = useState<"booking" | "travel_advisor" | "owned" | "multi" | "supplier">(
    "booking"
  );
  /** Facets computed server-side over the whole merged supplier result set (not just loaded pages). */
  const serverFacetsRef = useRef(false);
  const appliedFiltersRef = useRef<TravelAdvisorAppliedFilter[]>([]);
  appliedFiltersRef.current = appliedFilters;
  const [listFallback, setListFallback] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const tailRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<() => Promise<void>>(async () => undefined);
  // Progressive multi-supplier session (server returns `sid` + `progress` while suppliers are still answering).
  const sidRef = useRef<string>("");
  const pollTokenRef = useRef(0);
  const [searching, setSearching] = useState(false);

  const searchParamsFor = (nextSort = sort, nextPage = 0, applyAll = false) => {
    const qs = hotelSearchToParams(search);
    qs.set("sort", nextSort);
    qs.set("lang", locale);
    qs.set("page", String(nextPage));
    if (sidRef.current) qs.set("sid", sidRef.current);
    const current = appliedFiltersRef.current;
    if (applyAll && current.length) {
      qs.set("filters", JSON.stringify(current));
      qs.set("applyAll", "1");
    } else if (serverFacetsRef.current && current.length) {
      // Supplier sessions filter server-side across every merged hotel, so pagination stays exact.
      qs.set("filters", JSON.stringify(current));
    }
    return qs;
  };

  /** Prefer the server facets (supplier mode); otherwise derive them locally from the loaded cards. */
  const syncFilterGroups = (data: Record<string, unknown>, cards: TravelAdvisorHotelCard[]) => {
    if (Array.isArray(data.filterGroups)) {
      serverFacetsRef.current = true;
      setFilterGroups(data.filterGroups as TravelAdvisorFilterGroup[]);
      return;
    }
    if (!serverFacetsRef.current) setFilterGroups(buildLocalHotelFilterGroups(cards));
  };

  const applyProgress = (data: Record<string, unknown>) => {
    const progress = data.progress as { complete?: boolean; pending?: string[] } | undefined;
    if (typeof data.sid === "string" && data.sid) sidRef.current = data.sid;
    if (progress) {
      setSearching(!progress.complete);
      return !progress.complete;
    }
    return Boolean(sidRef.current);
  };

  /** Re-reads page 0 of the live session until every supplier answered, merging new hotels in. */
  const pollSession = async (nextSort: SortKey, token: number) => {
    for (let attempt = 0; attempt < 36; attempt++) {
      await new Promise((r) => setTimeout(r, attempt < 4 ? 2000 : 2500));
      if (pollTokenRef.current !== token || !sidRef.current) return;
      try {
        const res = await fetch(`/api/hotels/search?${searchParamsFor(nextSort, 0, false)}`, { cache: "no-store" });
        if (!res.ok) continue;
        const data = parseHotelApiJson(await res.text());
        if (pollTokenRef.current !== token) return;
        const list = Array.isArray(data.hotels) ? (data.hotels as TravelAdvisorHotelCard[]) : [];
        const total = Number(data.totalCount) || 0;
        if (list.length) {
          setHotels((prev) => {
            const seen = new Set(list.map((h) => h.id));
            const rest = prev.filter((h) => !seen.has(h.id));
            const next = [...list, ...rest];
            syncFilterGroups(data, next);
            return next;
          });
          setTotalCount((n) => Math.max(n, total));
          setHasMore(Boolean(data.hasMore));
          setLoading(false);
        }
        const stillRunning = applyProgress(data);
        if (!stillRunning) {
          setLoading(false);
          return;
        }
      } catch {
        // transient — keep polling
      }
    }
    setSearching(false);
    setLoading(false);
  };

  const runSearch = async (nextSort = sort, applyAll = false) => {
    setLoading(true);
    setError("");
    setPage(0);
    sidRef.current = "";
    serverFacetsRef.current = false;
    const token = ++pollTokenRef.current;
    try {
      const qs = searchParamsFor(nextSort, 0, applyAll);
      let res = await fetch(`/api/hotels/search?${qs}`, { cache: "no-store" });
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 1500));
        if (pollTokenRef.current !== token) return;
        res = await fetch(`/api/hotels/search?${qs}`, { cache: "no-store" });
      }
      if (!res.ok) {
        setError(t.hotels.searchError);
        setLoading(false);
        return;
      }
      const data = parseHotelApiJson(await res.text());
      const list = Array.isArray(data.hotels)
        ? (data.hotels as TravelAdvisorHotelCard[])
        : [];
      const stillRunning = applyProgress(data);
      if (!list.length) {
        setError("");
        setHotels([]);
        setTotalCount(0);
        setHasMore(Boolean(data.hasMore) && stillRunning);
        syncFilterGroups(data, []);
        setListFallback(false);
        if (data.source === "supplier") setListSource("supplier");
        if (stillRunning) {
          void pollSession(nextSort, token);
          return;
        }
        setLoading(false);
        return;
      }
      setHotels(list);
      const total = Number(data.totalCount) || 0;
      setTotalCount(total);
      setHasMore(Boolean(data.hasMore) || (total > 0 && list.length < total));
      setPage(0);
      setListSource(
        data.source === "owned" || data.source === "travel_advisor" || data.source === "multi" || data.source === "supplier"
          ? data.source
          : "booking"
      );
      setListFallback(Boolean(data.fallback));
      syncFilterGroups(data, list);
      if (stillRunning) void pollSession(nextSort, token);
      const resolvedGeo = String(data.geoId || "").trim();
      const resolvedDest = String(data.destId || "").trim();
      if (
        (resolvedGeo && resolvedGeo !== search.geoId) ||
        (resolvedDest && resolvedDest !== search.destId)
      ) {
        const next = {
          ...search,
          geoId: resolvedGeo || search.geoId,
          destId: resolvedDest || search.destId,
        };
        setSearch(next);
        syncHotelSearchUrl(next);
      }
      if (!stillRunning || list.length) setLoading(false);
    } catch {
      setError(t.hotels.searchError);
      setHotels([]);
      setTotalCount(0);
      setHasMore(false);
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/hotels/search?${searchParamsFor(sort, nextPage, false)}`, {
        cache: "no-store",
      });
      const data = parseHotelApiJson(await res.text());
      const list = Array.isArray(data.hotels)
        ? (data.hotels as TravelAdvisorHotelCard[])
        : [];
      if (!res.ok || data.ok === false || !list.length) {
        setHasMore(false);
        return;
      }
      setHotels((prev) => {
        const seen = new Set(prev.map((h) => h.id));
        const next = [...prev, ...list.filter((h) => !seen.has(h.id))];
        syncFilterGroups(data, next);
        return next;
      });
      setTotalCount((n) => Math.max(n, Number(data.totalCount) || 0));
      const nextTotal = Math.max(totalCount, Number(data.totalCount) || 0);
      setHasMore(
        (Boolean(data.hasMore) && list.length > 0) ||
          (nextTotal > 0 && hotels.length + list.length < nextTotal && list.length > 0)
      );
      setPage(nextPage);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  loadMoreRef.current = loadMore;

  useEffect(() => {
    void runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  // Supplier sessions: re-page from the server whenever the facets change (exact totals + pagination).
  const filtersKey = `${sort}|${JSON.stringify(appliedFilters)}`;
  useEffect(() => {
    if (!serverFacetsRef.current || !sidRef.current) return;
    const token = ++pollTokenRef.current;
    const timer = setTimeout(async () => {
      setLoadingMore(true);
      try {
        const res = await fetch(`/api/hotels/search?${searchParamsFor(sort, 0, false)}`, { cache: "no-store" });
        const data = parseHotelApiJson(await res.text());
        if (pollTokenRef.current !== token) return;
        const list = Array.isArray(data.hotels) ? (data.hotels as TravelAdvisorHotelCard[]) : [];
        const stillRunning = applyProgress(data);
        if (list.length || !stillRunning) {
          setHotels(list);
          setPage(0);
          setTotalCount(Number(data.totalCount) || 0);
          setHasMore(Boolean(data.hasMore));
          syncFilterGroups(data, list);
        }
        if (stillRunning) void pollSession(sort, token);
      } catch {
        // keep the current list
      } finally {
        if (pollTokenRef.current === token) setLoadingMore(false);
      }
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const nodes = [moreRef.current, tailRef.current].filter((node): node is HTMLDivElement => Boolean(node));
    if (!nodes.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) void loadMoreRef.current();
      },
      { rootMargin: "320px", threshold: 0 }
    );
    for (const node of nodes) io.observe(node);
    return () => io.disconnect();
  }, [hasMore, hotels.length, loading, loadingMore]);

  const visible = useMemo(() => {
    const nameNeedle = (search.hotelName || appliedFilters.find((f) => f.id === "name")?.value[0] || "").trim().toLowerCase();
    const named = nameNeedle
      ? hotels.filter((h) => h.name.toLowerCase().includes(nameNeedle))
      : hotels;
    if (listSource === "supplier") {
      if (!appliedFilters.length) return named;
      return filterHotelsClientSide(named, appliedFilters);
    }
    const list = filterHotelsClientSide(named, appliedFilters);
    list.sort((a, b) => {
      if (sort === "price") {
        const ap = a.nightly ?? a.priceFrom ?? 999999;
        const bp = b.nightly ?? b.priceFrom ?? 999999;
        return ap - bp;
      }
      if (sort === "popular") return (b.reviewCount || 0) - (a.reviewCount || 0);
      return (b.rating || 0) - (a.rating || 0);
    });
    return list;
  }, [hotels, sort, appliedFilters, listSource, search.hotelName]);

  const hrefFor = (hotel: TravelAdvisorHotelCard) => {
    const bookingId = hotel.bookingHotelId || (hotel.source === "booking" ? hotel.id : "");
    const slug = hotelApiSlug(bookingId || hotel.id, bookingId ? "booking" : "ta");
    const qs = hotelSearchToParams(search);
    if (bookingId) qs.set("bookingHotelId", bookingId);
    if (hotel.sessionId) qs.set("sid", hotel.sessionId);
    if (hotel.masterId) qs.set("master", hotel.masterId);
    return `/hotels/${slug}?${qs.toString()}`;
  };

  const filters = (
    <HotelFiltersPanel
      groups={filterGroups}
      value={appliedFilters}
      onChange={setAppliedFilters}
    />
  );

  useEffect(() => {
    const onAgent = (event: Event) => {
      const detail = (event as CustomEvent<SearchAgentEventDetail>).detail;
      if (!detail?.filters) return;
      if (detail.action !== "filter") return;
      setSearch((prev) =>
        detail.filters?.hotelName
          ? { ...prev, hotelName: detail.filters.hotelName }
          : prev
      );
      setAppliedFilters((prev) => {
        const next = [...prev.filter((f) => f.id !== "class" && f.id !== "price")];
        if (detail.filters?.stars) {
          next.push({ id: "class", value: [String(detail.filters.stars)] });
        }
        if (detail.filters?.maxPrice) {
          next.push({ id: "price", value: ["0", String(detail.filters.maxPrice)] });
        }
        return next;
      });
      if (detail.filters?.hotelName) {
        window.setTimeout(() => void runSearch(), 80);
      }
    };
    window.addEventListener(SEARCH_AGENT_EVENT, onAgent);
    return () => window.removeEventListener(SEARCH_AGENT_EVENT, onAgent);
  }, []);

  const searchForm = (
    <HotelSearchBar
      value={search}
      onChange={setSearch}
      onSubmit={() => {
        syncHotelSearchUrl(search);
        void runSearch();
      }}
      compactActions={
        <button
          type="button"
          className="lg:hidden inline-flex h-16 w-14 shrink-0 items-center justify-center rounded-xl border border-purple-200 bg-white text-[#2e1065] shadow-sm"
          onClick={() => setFiltersOpen(true)}
          aria-label={t.hotels.filters}
        >
          <SlidersHorizontal size={20} strokeWidth={2.4} className="text-[#2e1065]" />
        </button>
      }
    />
  );

  return (
    <section
      className="bg-slate-100 pb-14 min-h-screen"
      data-hotel-source={listSource}
      data-hotel-fallback={listFallback ? "1" : "0"}
    >
      <div className="lonaliza-search-chrome relative bg-[#051741] text-white pt-[max(5.25rem,calc(4.25rem+env(safe-area-inset-top,0px)))] md:pt-[5.5rem]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden opacity-60"
          style={{
            background:
              "radial-gradient(circle at 14% 30%, rgba(245,158,11,0.36), transparent 42%), radial-gradient(circle at 88% 10%, rgba(16,185,129,0.22), transparent 36%)",
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-10 md:py-16">
          <p className="text-amber-400 text-xs md:text-sm font-semibold tracking-[0.22em] uppercase mb-3">
            {t.hotels.bannerKicker}
          </p>
          <h1
            className="text-2xl sm:text-3xl md:text-5xl font-bold leading-tight mb-3"
            style={{ fontFamily: "var(--font-sora)" }}
          >
            {t.hotels.bannerTitle}
          </h1>
          <p className="text-white/70 text-sm md:text-base max-w-2xl mb-6">
            {t.hotels.bannerSubtitle}
          </p>
          <div className="relative z-20">
            <SearchAgentResultsDock
              tab="hotel"
              page="results"
              replace
              className="mt-3"
              context={`Hotel search ${search.q} ${search.checkIn} ${search.checkOut} adults ${search.adults}. Current engine is hotels. If the customer asks for a flight, open the live flight engine.`}
            >
              {searchForm}
            </SearchAgentResultsDock>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-l from-amber-300 via-amber-500 to-[#2e1065]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-5">
        <CouponSlider service="hotels" />
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6">
          <div>
            {loading ? (
              <div>
                <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
                  <span className="relative flex h-10 w-10 items-center justify-center">
                    <span className="absolute inset-0 rounded-full border-2 border-amber-400/30 border-t-amber-500 animate-spin" />
                    <Search size={16} className="text-amber-600 animate-pulse" />
                  </span>
                  <p className="font-semibold">{t.hotels.searchingBestPrices}</p>
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <HotelCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="py-20 text-center text-slate-400">{error}</div>
            ) : hotels.length === 0 ? (
              searching ? (
                <div>
                  <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
                    <span className="relative flex h-10 w-10 items-center justify-center">
                      <span className="absolute inset-0 rounded-full border-2 border-amber-400/30 border-t-amber-500 animate-spin" />
                      <Search size={16} className="text-amber-600 animate-pulse" />
                    </span>
                    <p className="font-semibold">{t.hotels.searchingBestPrices}</p>
                  </div>
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <HotelCardSkeleton key={i} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-slate-400">{t.hotels.noHotels}</div>
              )
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <p className="text-slate-800 font-semibold">
                    {t.hotels.resultsCount(Math.max(totalCount, hotels.length))}
                    {appliedFilters.length ? (
                      <span className="ms-2 text-sm font-normal text-slate-500">
                        {t.hotels.filteredOfTotal(visible.length, Math.max(totalCount, hotels.length))}
                      </span>
                    ) : (
                      <span className="ms-2 text-sm font-normal text-slate-500">
                        {t.hotels.loadedOfAvailable(hotels.length, Math.max(totalCount, hotels.length))}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="lg:hidden inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      onClick={() => setFiltersOpen(true)}
                    >
                      <SlidersHorizontal size={14} />
                      {t.hotels.filters}
                    </button>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                      {t.hotels.sortBy}
                      <select
                        value={sort}
                        onChange={(e) => {
                          setSort(e.target.value as SortKey);
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                      >
                        <option value="best">{t.hotels.sortBest}</option>
                        <option value="price">{t.hotels.sortPrice}</option>
                        <option value="popular">{t.hotels.sortPopular}</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  {visible.map((hotel) => {
                    const prefetchId = hotels[Math.max(0, hotels.length - 8)]?.id;
                    return (
                      <div key={hotel.id} ref={hotel.id === prefetchId ? moreRef : undefined}>
                        <HotelListCard hotel={hotel} href={hrefFor(hotel)} />
                      </div>
                    );
                  })}
                  {loadingMore
                    ? Array.from({ length: 20 }).map((_, i) => <HotelCardSkeleton key={`sk-${i}`} />)
                    : null}
                  <div ref={tailRef} className="h-px" aria-hidden />
                </div>
                <div className="pt-6 text-center">
                  {hasMore && !loadingMore ? (
                    <button
                      type="button"
                      onClick={() => void loadMore()}
                      className="rounded-xl bg-[#051741] px-5 py-2.5 text-sm font-bold text-white"
                    >
                      {t.hotels.loadMore}
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm max-h-[calc(100vh-8rem)] overflow-y-auto">
              {filters}
            </div>
          </aside>
        </div>
      </div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40"
            aria-label="Close"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 end-0 w-[86%] max-w-sm bg-white p-5 overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">{t.hotels.filters}</h2>
              <button type="button" onClick={() => setFiltersOpen(false)}>
                <X size={18} />
              </button>
            </div>
            {filters}
          </div>
        </div>
      ) : null}
    </section>
  );
}
