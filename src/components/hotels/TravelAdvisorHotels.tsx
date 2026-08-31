"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import HotelFiltersPanel from "@/components/hotels/HotelFiltersPanel";
import HotelListCard, { HotelCardSkeleton } from "@/components/hotels/HotelListCard";
import { pickHotelRibbon, type HotelRibbonKind } from "@/lib/hotel-ribbons";
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
  const [listSource, setListSource] = useState<"booking" | "travel_advisor" | "owned" | "multi">(
    "booking"
  );
  const [listFallback, setListFallback] = useState(false);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const tailRef = useRef<HTMLDivElement | null>(null);
  const loadMoreRef = useRef<() => Promise<void>>(async () => undefined);

  const searchParamsFor = (nextSort = sort, nextPage = 0, applyAll = false) => {
    const qs = hotelSearchToParams(search);
    qs.set("sort", nextSort);
    qs.set("lang", locale);
    qs.set("page", String(nextPage));
    if (applyAll && appliedFilters.length) {
      qs.set("filters", JSON.stringify(appliedFilters));
      qs.set("applyAll", "1");
    }
    return qs;
  };

  const runSearch = async (nextSort = sort, applyAll = false) => {
    setLoading(true);
    setError("");
    setPage(0);
    try {
      const res = await fetch(`/api/hotels/search?${searchParamsFor(nextSort, 0, applyAll)}`, {
        cache: "no-store",
      });
      const data = parseHotelApiJson(await res.text());
      const list = Array.isArray(data.hotels)
        ? (data.hotels as TravelAdvisorHotelCard[])
        : [];
      if (!list.length) {
        setError("");
        setHotels([]);
        setTotalCount(0);
        setHasMore(false);
        setFilterGroups(buildLocalHotelFilterGroups([]));
        setListFallback(false);
        return;
      }
      setHotels(list);
      const total = Number(data.totalCount) || 0;
      setTotalCount(total);
      setHasMore(Boolean(data.hasMore) || (total > 0 && list.length < total));
      setPage(0);
      setListSource(
        data.source === "owned" || data.source === "travel_advisor" || data.source === "multi"
          ? data.source
          : "booking"
      );
      setListFallback(Boolean(data.fallback));
      setFilterGroups(buildLocalHotelFilterGroups(list));
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
    } catch {
      setError(t.hotels.searchError);
      setHotels([]);
      setTotalCount(0);
      setHasMore(false);
    } finally {
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
        setFilterGroups(buildLocalHotelFilterGroups(next));
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
    const list = filterHotelsClientSide(hotels, appliedFilters);
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
  }, [hotels, sort, appliedFilters]);

  const hrefFor = (hotel: TravelAdvisorHotelCard) => {
    const bookingId = hotel.bookingHotelId || (hotel.source === "booking" ? hotel.id : "");
    const slug = hotelApiSlug(bookingId || hotel.id, bookingId ? "booking" : "ta");
    const qs = hotelSearchToParams(search);
    if (bookingId) qs.set("bookingHotelId", bookingId);
    return `/hotels/${slug}?${qs.toString()}`;
  };

  const filters = (
    <HotelFiltersPanel
      groups={filterGroups}
      value={appliedFilters}
      onChange={setAppliedFilters}
    />
  );

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
          className="lg:hidden h-16 px-3 rounded-xl border border-slate-300 bg-white"
          onClick={() => setFiltersOpen(true)}
        >
          <SlidersHorizontal size={16} />
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
      <div className="relative bg-[#051741] text-white pt-[5.25rem] md:pt-[5.5rem]">
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
          <div className="relative z-20">{searchForm}</div>
        </div>
        <div className="h-1 w-full bg-gradient-to-l from-amber-300 via-amber-500 to-emerald-600" />
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
              <div className="py-20 text-center text-slate-400">{t.hotels.noHotels}</div>
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
                  {visible.map((hotel, index) => {
                    const neighborRibbons: HotelRibbonKind[] = [];
                    const prev = index > 0 ? pickHotelRibbon(visible[index - 1]) : null;
                    if (prev) neighborRibbons.push(prev.kind);
                    const prefetchId = hotels[Math.max(0, hotels.length - 8)]?.id;
                    return (
                      <div key={hotel.id} ref={hotel.id === prefetchId ? moreRef : undefined}>
                        <HotelListCard
                          hotel={hotel}
                          href={hrefFor(hotel)}
                          neighborRibbons={neighborRibbons}
                        />
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
