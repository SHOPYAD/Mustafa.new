"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  fetchBookings,
  patchBookingStatus,
  removeBooking,
  type Booking,
  type BookingStatus,
  type BookingType,
} from "@/data/bookings";

const LAST_SEEN_BOOKING_KEY = "alrayyan_admin_last_booking";
const POLL_INTERVAL_MS = 17000;

export interface BookingCounts {
  total: number;
  new: number;
  inProgress: number;
  resolved: number;
}

export interface UseAdminBookingsReturn {
  // Data state
  bookings: Booking[];
  filteredBookings: Booking[];
  loading: boolean;
  pocketbaseConnected: boolean;
  error: string | null;
  counts: BookingCounts;

  // Filters state & setters
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: BookingStatus | "all";
  setStatusFilter: (s: BookingStatus | "all") => void;
  typeFilter: BookingType | "all";
  setTypeFilter: (t: BookingType | "all") => void;
  customerFilter: string;
  setCustomerFilter: (c: string) => void;
  resetFilters: () => void;

  // Actions / Mutations
  updateStatus: (id: string, status: BookingStatus) => Promise<boolean>;
  deleteBooking: (id: string) => Promise<boolean>;
  refresh: (opts?: { silent?: boolean }) => Promise<void>;
}

export function useAdminBookings(): UseAdminBookingsReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<BookingType | "all">("all");
  const [customerFilter, setCustomerFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [pocketbaseConnected, setPocketbaseConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialLoadDone = useRef(false);
  const lastSeenIdRef = useRef<string | null>(null);

  // Fetch bookings from data layer
  const refresh = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoading(true);
      try {
        const result = await fetchBookings({
          type: typeFilter,
          status: statusFilter,
          customer: customerFilter || undefined,
        });
        setBookings(result.bookings);
        setPocketbaseConnected(Boolean(result.pocketbase));
        setError(result.error || null);

        const latest = result.bookings[0];
        if (latest && !initialLoadDone.current) {
          initialLoadDone.current = true;
          lastSeenIdRef.current = latest.id;
          if (typeof window !== "undefined") {
            localStorage.setItem(LAST_SEEN_BOOKING_KEY, latest.id);
          }
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "فشل في تحميل الحجوزات");
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [typeFilter, statusFilter, customerFilter]
  );

  // Read URL query on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = new URLSearchParams(window.location.search).get("id");
      if (id) setSearchQuery(id);
    }
  }, []);

  // Fetch when filters change
  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Background polling for new bookings
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      void Notification.requestPermission();
    }

    const poll = async () => {
      try {
        const result = await fetchBookings();
        const latest = result.bookings[0];
        if (!latest) return;

        const stored = localStorage.getItem(LAST_SEEN_BOOKING_KEY);
        if (stored && latest.id !== stored && latest.status === "new") {
          localStorage.setItem(LAST_SEEN_BOOKING_KEY, latest.id);
          lastSeenIdRef.current = latest.id;
          void refresh({ silent: true });
        }
      } catch {
        /* silent poll failure */
      }
    };

    const interval = window.setInterval(() => {
      void poll();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [refresh]);

  // Status mutation
  const updateStatus = useCallback(
    async (id: string, status: BookingStatus): Promise<boolean> => {
      try {
        // Optimistic update
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status } : b))
        );
        await patchBookingStatus(id, status);
        await refresh({ silent: true });
        return true;
      } catch (err) {
        console.error("Failed to update booking status", err);
        await refresh({ silent: true });
        return false;
      }
    },
    [refresh]
  );

  // Delete mutation
  const deleteBooking = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        // Optimistic update
        setBookings((prev) => prev.filter((b) => b.id !== id));
        await removeBooking(id);
        await refresh({ silent: true });
        return true;
      } catch (err) {
        console.error("Failed to remove booking", err);
        await refresh({ silent: true });
        return false;
      }
    },
    [refresh]
  );

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setCustomerFilter("");
  }, []);

  // Filtered list
  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings;
    const q = searchQuery.toLowerCase().trim();
    return bookings.filter((b) => {
      return (
        b.id.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q.replace(/^hotel:/, "")) ||
        b.name.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        (b.packageName || "").toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q)
      );
    });
  }, [bookings, searchQuery]);

  // Counts calculation
  const counts = useMemo((): BookingCounts => {
    return {
      total: bookings.length,
      new: bookings.filter((b) => b.status === "new").length,
      inProgress: bookings.filter((b) => b.status === "in-progress").length,
      resolved: bookings.filter((b) => b.status === "resolved").length,
    };
  }, [bookings]);

  return {
    bookings,
    filteredBookings,
    loading,
    pocketbaseConnected,
    error,
    counts,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    customerFilter,
    setCustomerFilter,
    resetFilters,
    updateStatus,
    deleteBooking,
    refresh,
  };
}
