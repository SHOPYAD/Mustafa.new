"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Search as SearchIcon } from "lucide-react";
import PackageCard from "@/components/packages/PackageCard";
import HotelCard from "@/components/hotels/HotelCard";
import TransferCard from "@/components/transfers/TransferCard";
import { fetchPublishedPackages } from "@/data/packages-client";
import { getActiveHotels } from "@/data/hotels";
import { getActiveTransfers, fetchDynamicTransfers } from "@/data/transfers";
import type { HolidayPackage } from "@/types/package";
import type { Hotel } from "@/types/hotel";
import type { TransferService } from "@/types/transfer";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { tContent } from "@/lib/utils";
import SearchAgentResultsDock from "@/components/search/SearchAgentResultsDock";
import type { SearchTabKey } from "@/data/search-tabs";

function matchesQuery(
  q: string,
  fields: string[]
): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  return fields.some((f) => f.toLowerCase().includes(lower));
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const { t, locale, dir } = useLocale();
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "holiday";

  const [packages, setPackages] = useState<HolidayPackage[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [transfers, setTransfers] = useState<TransferService[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void fetchPublishedPackages().then(setPackages);
    setHotels(getActiveHotels());
    void fetchDynamicTransfers()
      .then(setTransfers)
      .catch(() => setTransfers(getActiveTransfers()))
      .finally(() => setReady(true));
  }, []);

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) =>
      matchesQuery(query, [
        pkg.title,
        tContent(pkg, "title", locale),
        pkg.destination,
        tContent(pkg, "destination", locale),
        pkg.country,
        tContent(pkg, "country", locale),
      ])
    );
  }, [packages, query, locale]);

  const filteredHotels = useMemo(() => {
    return hotels.filter((h) =>
      matchesQuery(query, [
        h.city,
        h.country,
        tContent(h, "name", locale),
        tContent(h, "neighborhood", locale),
        tContent(h, "address", locale),
        ...h.amenities,
      ])
    );
  }, [hotels, query, locale]);

  const filteredTransfers = useMemo(() => {
    return transfers.filter((tr) =>
      matchesQuery(query, [
        tContent(tr, "title", locale),
        tr.routeFrom || "",
        tr.routeTo || "",
        tr.vehicleName,
        tr.vehicleType,
      ])
    );
  }, [transfers, query, locale]);

  const totalResults =
    filteredPackages.length + filteredHotels.length + filteredTransfers.length;

  const showPackages =
    type === "holiday" ||
    type === "offers" ||
    type === "flight" ||
    type === "insurance" ||
    !type;
  const showHotels = type === "holiday" || type === "hotel" || !query;
  const showTransfers = type === "tours" || type === "holiday";

  return (
    <div className="min-h-screen bg-slate-50 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#1e3a5f] hover:text-[#c8922a] font-medium mb-4 transition-colors"
          >
            <ArrowLeft size={18} className={dir === "rtl" ? "rotate-180" : ""} />
            {t.common.back}
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            {query
              ? `${t.search.resultsFor} "${query}"`
              : t.search.pageTitle}
          </h1>
          <p className="text-slate-600 mt-2">
            {ready
              ? `${totalResults} ${t.admin.results}`
              : t.common.loading}
          </p>
          <SearchAgentResultsDock
            tab={(["flight", "hotel", "cars", "transfers", "tours", "holiday", "visa", "insurance", "offers"].includes(type)
              ? type
              : "holiday") as SearchTabKey}
            page="results"
            tone="light"
            className="mt-4"
            context={`Catalog search type=${type} q=${query}`}
          />
        </div>

        {!ready ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-96 bg-slate-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-20">
            <SearchIcon size={48} className="mx-auto mb-4 text-slate-300" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {t.search.noResults}
            </h2>
            <p className="text-slate-600 mb-6">
              {locale === "ar"
                ? "جرّب مدينة تركية أخرى أو تصفح باقاتنا."
                : "Try another Turkish city or browse our packages."}
            </p>
            <Link
              href="/holidays"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e3a5f] text-white font-semibold rounded-xl hover:bg-[#152d4a] transition-colors"
            >
              {t.home.featuredPackages}
            </Link>
          </div>
        ) : (
          <div className="space-y-14">
            {showPackages && filteredPackages.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  {t.nav.holidays}
                  <span className="text-sm font-normal text-slate-500">
                    ({filteredPackages.length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPackages.map((pkg) => (
                    <PackageCard key={pkg.id} package_={pkg} />
                  ))}
                </div>
              </section>
            )}

            {showHotels && filteredHotels.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  {t.nav.hotels}
                  <span className="text-sm font-normal text-slate-500">
                    ({filteredHotels.length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredHotels.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                  ))}
                </div>
              </section>
            )}

            {showTransfers && filteredTransfers.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  {t.nav.transfers}
                  <span className="text-sm font-normal text-slate-500">
                    ({filteredTransfers.length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredTransfers.map((tr) => (
                    <TransferCard key={tr.id} transfer={tr} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 pt-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-96 bg-slate-200 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
