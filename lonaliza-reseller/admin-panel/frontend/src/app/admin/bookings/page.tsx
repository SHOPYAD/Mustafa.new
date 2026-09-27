"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Inbox,
  Search,
  Trash2,
  AlertTriangle,
  ChevronDown,
  Package,
  Globe,
  MessageSquare,
  Clock,
  CheckCircle2,
  Circle,
  Plane,
  Hotel,
  Car,
  MapPin,
  Phone,
  Loader2,
  Database,
} from "lucide-react";
import Link from "next/link";
import {
  AdminEmpty,
  AdminKpi,
  AdminKpiStrip,
  AdminModule,
  AdminPage,
  AdminPageHeader,
  AdminToolbar,
} from "@/components/admin/layout";
import {
  fetchBookings,
  patchBookingStatus,
  removeBooking,
  type Booking,
  type BookingStatus,
  type BookingType,
} from "@/data/bookings";
import { useLocale, dateLocaleTag } from "@/lib/i18n/LocaleProvider";

const BOOKING_TYPES: Array<BookingType | "all"> = [
  "all",
  "flight",
  "hotel",
  "package",
  "transfer",
  "visa",
  "tour",
  "car",
  "callback",
  "contact",
  "general",
];

const LAST_SEEN_BOOKING_KEY = "alrayyan_admin_last_booking";
const POLL_INTERVAL_MS = 17000;

export default function AdminBookingsPage() {
  const { t, locale } = useLocale();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "all"
  );
  const [typeFilter, setTypeFilter] = useState<BookingType | "all">("all");
  const [customerFilter, setCustomerFilter] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pocketbaseConnected, setPocketbaseConnected] = useState(false);
  const [loadError, setLoadError] = useState("");
  const initialLoadDone = useRef(false);
  const lastSeenIdRef = useRef<string | null>(null);

  const statusConfig: Record<
    BookingStatus,
    { label: string; color: string; icon: React.ElementType }
  > = {
    new: { label: t.admin.statusNew, color: "text-blue-400 bg-blue-500/10", icon: Circle },
    "in-progress": {
      label: t.admin.statusInProgress,
      color: "text-amber-400 bg-amber-500/10",
      icon: Clock,
    },
    resolved: {
      label: t.admin.statusResolved,
      color: "text-emerald-400 bg-emerald-500/10",
      icon: CheckCircle2,
    },
  };

  const typeConfig: Record<
    string,
    { label: string; color: string; icon: React.ElementType }
  > = {
    flight: { label: t.admin.typeFlight, color: "text-sky-400", icon: Plane },
    hotel: { label: t.admin.typeHotel, color: "text-rose-400", icon: Hotel },
    package: { label: t.admin.typePackage, color: "text-emerald-400", icon: Package },
    transfer: { label: t.admin.typeTransfer, color: "text-cyan-400", icon: Car },
    visa: { label: t.admin.typeVisa, color: "text-blue-400", icon: Globe },
    tour: { label: t.admin.typeTour, color: "text-violet-400", icon: MapPin },
    car: { label: t.nav.cars, color: "text-lime-400", icon: Car },
    callback: { label: t.admin.typeCallback, color: "text-amber-600", icon: Phone },
    contact: { label: t.admin.typeContact, color: "text-indigo-400", icon: MessageSquare },
    general: { label: t.admin.typeGeneral, color: "text-purple-400", icon: MessageSquare },
  };

  const refresh = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setLoading(true);
    const result = await fetchBookings({
      type: typeFilter,
      status: statusFilter,
      customer: customerFilter || undefined,
    });
    setBookings(result.bookings);
    setPocketbaseConnected(Boolean(result.pocketbase));
    setLoadError(result.error || "");
    if (!opts?.silent) setLoading(false);

    const latest = result.bookings[0];
    if (!latest) return;

    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      lastSeenIdRef.current = latest.id;
      if (typeof window !== "undefined") {
        localStorage.setItem(LAST_SEEN_BOOKING_KEY, latest.id);
      }
      return;
    }
  }, [typeFilter, statusFilter, customerFilter]);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) setSearchQuery(id);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      void Notification.requestPermission();
    }

    const poll = async () => {
      const result = await fetchBookings();
      const latest = result.bookings[0];
      if (!latest) return;

      const stored = localStorage.getItem(LAST_SEEN_BOOKING_KEY);
      if (stored && latest.id !== stored && latest.status === "new") {
        // Sound + OS toast live in AdminNotificationCenter — do not double-fire here.
        localStorage.setItem(LAST_SEEN_BOOKING_KEY, latest.id);
        lastSeenIdRef.current = latest.id;
        void refresh({ silent: true });
      }
    };

    const interval = window.setInterval(() => {
      void poll();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [refresh]);

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    await patchBookingStatus(id, status);
    await refresh();
  };

  const handleDelete = async (id: string) => {
    await removeBooking(id);
    setDeleteConfirmId(null);
    await refresh();
  };

  const filtered = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      b.id.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q.replace(/^hotel:/, "")) ||
      b.name.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      (b.packageName || "").toLowerCase().includes(q) ||
      b.phone.toLowerCase().includes(q);
    return matchesSearch;
  });

  const newCount = bookings.filter((b) => b.status === "new").length;
  const inProgressCount = bookings.filter(
    (b) => b.status === "in-progress"
  ).length;
  const resolvedCount = bookings.filter((b) => b.status === "resolved").length;

  return (
    <AdminPage className="flex flex-col gap-6">
      <AdminPageHeader
        icon={<Inbox className="size-5" />}
        title={t.admin.bookings}
        description={t.admin.bookingsSubtitle}
        actions={
          <span className="admin-chip">
            <Database size={14} />
            {pocketbaseConnected
              ? t.admin.pocketbaseConnected
              : t.admin.connectPocketbase}
          </span>
        }
      />

      {!pocketbaseConnected && (
        <AdminModule>
          <p className="text-sm text-[color:var(--admin-text-muted)]">
          {t.admin.pocketbaseWarningBefore}{" "}
          <Link href="/admin/pocketbase" className="underline text-[color:var(--admin-gold)]">
            {t.admin.pocketbaseSetupLink}
          </Link>{" "}
          {t.admin.pocketbaseWarningAfter}
          {loadError ? ` (${loadError})` : ""}
          </p>
        </AdminModule>
      )}

      <AdminKpiStrip cols={3}>
        <AdminKpi label={t.admin.statusNew} value={newCount} />
        <AdminKpi label={t.admin.statusInProgress} value={inProgressCount} />
        <AdminKpi label={t.admin.statusResolved} value={resolvedCount} />
      </AdminKpiStrip>

      <AdminToolbar>
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.admin.searchBookingsPlaceholder}
            className="w-full pl-12 pr-4 py-3 bg-[color:var(--admin-input-bg,var(--admin-bg-subtle))] border border-[color:var(--admin-border-subtle)] rounded-xl text-[color:var(--admin-text-primary)] placeholder:text-[color:var(--admin-text-faint)] focus:outline-none focus:ring-2 focus:ring-[color:var(--admin-gold)]/40 transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value as BookingType | "all")
            }
            className="admin-field appearance-none min-w-[150px] cursor-pointer pe-10"
          >
            {BOOKING_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === "all" ? t.admin.allTypes : typeConfig[type]?.label || type}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as BookingStatus | "all")
            }
            className="admin-field appearance-none cursor-pointer pe-10"
          >
            <option value="all">{t.admin.allStatuses}</option>
            <option value="new">{t.admin.statusNew}</option>
            <option value="in-progress">{t.admin.statusInProgress}</option>
            <option value="resolved">{t.admin.statusResolved}</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
        </div>
        <input
          type="text"
          value={customerFilter}
          onChange={(e) => setCustomerFilter(e.target.value)}
          placeholder={t.admin.filterByCustomer}
          className="px-4 py-3 bg-admin-bg-surface border border-admin-border-subtle rounded-xl text-admin-text-primary placeholder:text-admin-text-faint focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all min-w-[180px]"
        />
      </AdminToolbar>

      <AdminModule className="overflow-hidden p-0">
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 border-b border-admin-border-subtle text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <div className="col-span-2">{t.admin.colCustomer}</div>
          <div className="col-span-2">{t.admin.colContact}</div>
          <div className="col-span-2">{t.admin.colService}</div>
          <div className="col-span-2">{t.admin.colDestination}</div>
          <div className="col-span-2">{t.admin.colDateStatus}</div>
          <div className="col-span-2 text-right">{t.admin.colActions}</div>
        </div>

        {loading ? (
          <div className="px-6 py-16 flex justify-center">
            <Loader2 className="animate-spin text-amber-400" size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <AdminEmpty
            icon={<Inbox size={40} />}
            title={t.admin.noEnquiriesFound}
            hint={bookings.length === 0
              ? t.admin.noEnquiriesEmptyHint
              : t.admin.adjustSearchFilter}
          />
        ) : (
          filtered.map((booking) => {
            const statusCfg = statusConfig[booking.status];
            const typeCfg = typeConfig[booking.type] || typeConfig.general;
            const StatusIcon = statusCfg.icon;
            const TypeIcon = typeCfg.icon;

            return (
              <div
                key={booking.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-6 py-4 border-b border-admin-border-subtle hover:bg-white/[0.02] transition-colors"
              >
                <div className="lg:col-span-2">
                  <p className="text-foreground font-medium">{booking.name}</p>
                  <p className="text-admin-text-muted text-sm truncate">{booking.email}</p>
                </div>
                <div className="lg:col-span-2 flex flex-col justify-center">
                  <p className="text-muted-foreground text-sm">{booking.phone || "—"}</p>
                </div>
                <div className="lg:col-span-2 flex items-center gap-2">
                  <TypeIcon size={14} className={typeCfg.color} />
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold ${typeCfg.color}`}>
                      {typeCfg.label}
                    </p>
                    {booking.packageName && (
                      <p className="text-muted-foreground text-xs truncate">
                        {booking.packageName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="lg:col-span-2 flex items-center">
                  <p className="text-muted-foreground text-sm truncate">
                    {booking.destination || "—"}
                  </p>
                </div>
                <div className="lg:col-span-2 flex flex-col justify-center gap-1">
                  <p className="text-admin-text-muted text-sm">
                    {new Date(booking.createdAt).toLocaleDateString(dateLocaleTag(locale), {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <div className="relative w-fit">
                    <select
                      value={booking.status}
                      onChange={(e) =>
                        void handleStatusChange(
                          booking.id,
                          e.target.value as BookingStatus
                        )
                      }
                      className={`appearance-none pl-7 pr-6 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border-0 outline-none ${statusCfg.color}`}
                      style={{ background: "transparent" }}
                    >
                      <option value="new">{t.admin.statusNew}</option>
                      <option value="in-progress">{t.admin.statusInProgress}</option>
                      <option value="resolved">{t.admin.statusResolved}</option>
                    </select>
                    <StatusIcon
                      size={12}
                      className={`absolute left-2 top-1/2 -translate-y-1/2 ${statusCfg.color.split(" ")[0]}`}
                    />
                  </div>
                </div>
                <div className="lg:col-span-2 flex items-center justify-end gap-2">
                  {deleteConfirmId === booking.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => void handleDelete(booking.id)}
                        className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-xs font-semibold transition-all"
                      >
                        {t.common.delete}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 bg-admin-bg-subtle hover:bg-muted rounded-lg text-muted-foreground text-xs transition-all"
                      >
                        {t.common.cancel}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(booking.id)}
                      className="w-9 h-9 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 hover:text-red-300 transition-all"
                      title={t.common.delete}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                {booking.message ? (
                  <div className="lg:col-span-12 pt-2 border-t border-admin-border-subtle">
                    <p className="text-muted-foreground text-xs">
                      <span className="text-muted-foreground font-medium">{t.admin.messageLabel} </span>
                      {booking.message}
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </AdminModule>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="relative bg-slate-900 border border-admin-border-subtle rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-foreground font-bold">{t.admin.deleteEnquiry}</h3>
                <p className="text-admin-text-muted text-sm">{t.admin.deleteCannotUndo}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => void handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold rounded-xl transition-all"
              >
                {t.common.delete}
              </button>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 bg-admin-bg-subtle hover:bg-muted text-muted-foreground font-medium rounded-xl transition-all"
              >
                {t.common.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
