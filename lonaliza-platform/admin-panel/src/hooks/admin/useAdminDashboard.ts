"use client";

import { useState, useEffect, useCallback } from "react";
import type { DashboardStats } from "@/types/dashboard-stats";
import { getActiveFlights, getFlights } from "@/data/flights";
import { getPosts } from "@/data/blog";
import { getHotels } from "@/data/hotels";
import { getPackages } from "@/data/packages";
import { getTours } from "@/data/tours";
import { getTransfers } from "@/data/transfers";
import { getVisaData } from "@/data/visa";

export interface DashboardCatalogStats {
  hotels: number;
  hotelsActive: number;
  flights: number;
  flightsActive: number;
  packages: number;
  packagesFeatured: number;
  tours: number;
  toursActive: number;
  transfers: number;
  transfersActive: number;
  visa: number;
  visaActive: number;
  posts: number;
  postsPublished: number;
}

export interface UseAdminDashboardReturn {
  stats: DashboardStats | null;
  catalog: DashboardCatalogStats;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}

export function useAdminDashboard({
  statsEndpoint = "/api/admin/dashboard-stats",
}: { statsEndpoint?: string } = {}): UseAdminDashboardReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [catalog, setCatalog] = useState<DashboardCatalogStats>({
    hotels: 0,
    hotelsActive: 0,
    flights: 0,
    flightsActive: 0,
    packages: 0,
    packagesFeatured: 0,
    tours: 0,
    toursActive: 0,
    transfers: 0,
    transfersActive: 0,
    visa: 0,
    visaActive: 0,
    posts: 0,
    postsPublished: 0,
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Calculate catalog in-memory stats
      const hotels = getHotels();
      const flights = getFlights();
      const packages = getPackages();
      const tours = getTours();
      const transfers = getTransfers();
      const visa = getVisaData();
      const posts = getPosts();

      setCatalog({
        hotels: hotels.length,
        hotelsActive: hotels.filter((h) => h.isActive).length,
        flights: flights.length,
        flightsActive: getActiveFlights().length,
        packages: packages.length,
        packagesFeatured: packages.filter((p) => p.isFeatured).length,
        tours: tours.length,
        toursActive: tours.filter((t) => t.isActive !== false).length,
        transfers: transfers.length,
        transfersActive: transfers.filter((t) => t.isActive).length,
        visa: Array.isArray(visa) ? visa.filter((v) => v.isActive !== false).length : 0,
        visaActive: Array.isArray(visa) ? visa.filter((v) => v.isActive !== false).length : 0,
        posts: posts.length,
        postsPublished: posts.filter((p) => p.status === "published").length,
      });

      // 2. Fetch server-side aggregate dashboard stats
      const res = await fetch(statsEndpoint, {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!res.ok) {
        throw new Error(`Dashboard stats request failed: ${res.status}`);
      }
      const json = (await res.json()) as { ok?: boolean; stats?: DashboardStats } | DashboardStats;
      const parsedStats: DashboardStats =
        "stats" in json && json.stats ? json.stats : (json as DashboardStats);
      setStats(parsedStats);
    } catch (err) {
      console.error("Dashboard stats fetch error:", err);
      setError(err instanceof Error ? err.message : "تعذر تحميل إحصائيات لوحة التحكم");
    } finally {
      setLoading(false);
    }
  }, [statsEndpoint]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    stats,
    catalog,
    loading,
    error,
    refresh,
  };
}
