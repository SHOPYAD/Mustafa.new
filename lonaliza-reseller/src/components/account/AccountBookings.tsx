"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bus,
  Car,
  Hotel,
  Loader2,
  MapPin,
  Plane,
  Ticket,
} from "lucide-react";
import AirlineLogo from "@/components/flights/AirlineLogo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrency } from "@/components/ui/CurrencySelector";
import {
  BOOKING_FILTERS,
  formatHumanDate,
  matchesBookingFilter,
  type AccountService,
  type BookingFilter,
} from "@/lib/account/booking-display";
import type { InvoiceService } from "@/lib/booking-service";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Dictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

type CancelStatus =
  | "none"
  | "pending_admin"
  | "approved"
  | "rejected"
  | "refunded"
  | "refund_failed";

type GuestBooking = {
  id: string;
  hotel_name: string;
  room_name: string;
  check_in: string;
  check_out: string;
  status: string;
  payment_status: string;
  payment_method: "card" | "whatsapp" | "other";
  price: number;
  currency: string;
  cancel_status: CancelStatus;
  cancel_admin_note: string;
  refund_amount: number;
  can_cancel: boolean;
  free_cancellation: boolean;
  non_refundable: boolean;
  service: InvoiceService;
  airline: string;
  airline_code: string;
  origin: string;
  destination: string;
  route: string;
  pnr: string;
  fare_class: string;
};

type EnquiryRow = {
  id: string;
  type: string;
  service: AccountService;
  service_name: string;
  destination: string;
  status: string;
  created: string;
};

function serviceTitle(service: AccountService, t: Dictionary): string {
  switch (service) {
    case "flight":
      return t.account.bookingFlight;
    case "hotel":
      return t.account.bookingHotel;
    case "car":
      return t.account.bookingCar;
    case "transfer":
      return t.account.bookingTransfer;
    case "tour":
      return t.account.bookingTour;
    case "package":
      return t.account.bookingPackage;
    case "visa":
      return t.account.bookingVisa;
    case "enquiry":
      return t.account.bookingEnquiry;
    default: {
      const _never: never = service;
      return _never;
    }
  }
}

function filterLabel(filter: BookingFilter, t: Dictionary): string {
  switch (filter) {
    case "all":
      return t.account.filterAll;
    case "flight":
      return t.account.filterFlights;
    case "hotel":
      return t.account.filterHotels;
    case "car":
      return t.account.filterCars;
    case "transfer":
      return t.account.filterTransfers;
    case "package":
      return t.account.filterPrograms;
    case "enquiry":
      return t.account.filterRequests;
    default: {
      const _never: never = filter;
      return _never;
    }
  }
}

function ServiceGlyph({ service }: { service: AccountService }) {
  switch (service) {
    case "flight":
      return <Plane size={16} />;
    case "hotel":
      return <Hotel size={16} />;
    case "car":
      return <Car size={16} />;
    case "transfer":
      return <Bus size={16} />;
    case "tour":
    case "package":
      return <MapPin size={16} />;
    case "visa":
    case "enquiry":
      return <Ticket size={16} />;
    default: {
      const _never: never = service;
      return _never;
    }
  }
}

export default function AccountBookings() {
  const { t, locale } = useLocale();
  const { currency, convert } = useCurrency();
  const [hotels, setHotels] = useState<GuestBooking[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BookingFilter>("all");
  const [busyId, setBusyId] = useState("");
  const [reason, setReason] = useState("");
  const [confirmId, setConfirmId] = useState("");

  const reload = () =>
    fetch("/api/account/bookings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setHotels(d.hotels || []);
        setEnquiries(d.enquiries || []);
      });

  useEffect(() => {
    void reload().finally(() => setLoading(false));
  }, []);

  const formatPrice = (amount: number, source: string) => {
    const n = convert(amount, source || "USD");
    return `${currency.symbol}${n.toLocaleString(locale === "ar" ? "ar-AE" : locale === "tr" ? "tr-TR" : "en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const statusLabel = (b: GuestBooking) => {
    if (b.cancel_status === "pending_admin" || b.cancel_status === "refund_failed") {
      return t.account.statusCancelPending;
    }
    if (b.cancel_status === "rejected") return t.account.statusCancelRejected;
    if (b.cancel_status === "refunded") return t.account.statusRefunded;
    if (b.cancel_status === "approved" && b.payment_method === "card" && b.refund_amount > 0) {
      return t.account.statusRefunding;
    }
    if (b.cancel_status === "approved" || b.status === "cancelled") return t.account.statusCancelled;
    if (b.status === "paid" || b.payment_status === "paid") return t.account.statusConfirmed;
    return t.account.statusPending;
  };

  const statusClass = (b: GuestBooking) => {
    if (b.cancel_status === "pending_admin" || b.cancel_status === "refund_failed") {
      return "border-amber-200 bg-amber-50 text-amber-800";
    }
    if (b.cancel_status === "rejected") return "border-rose-200 bg-rose-50 text-rose-800";
    if (b.cancel_status === "refunded" || b.cancel_status === "approved" || b.status === "cancelled") {
      return "border-slate-200 bg-slate-100 text-slate-700";
    }
    if (b.status === "paid" || b.payment_status === "paid") {
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    }
    return "border-amber-200 bg-amber-50 text-amber-800";
  };

  const requestCancel = async (id: string) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/account/bookings/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = (await res.json()) as { ok?: boolean };
      if (data.ok) {
        setConfirmId("");
        setReason("");
        await reload();
      }
    } finally {
      setBusyId("");
    }
  };

  const visibleHotels = useMemo(
    () => hotels.filter((row) => matchesBookingFilter(row.service, filter)),
    [hotels, filter]
  );
  const visibleEnquiries = useMemo(
    () =>
      enquiries.filter((row) => {
        if (filter === "enquiry") return true;
        if (filter === "all") return true;
        return matchesBookingFilter(row.service, filter);
      }),
    [enquiries, filter]
  );

  if (loading) {
    return (
      <Card className="flex justify-center py-16">
        <Loader2 className="animate-spin text-emerald-600" />
      </Card>
    );
  }

  if (!hotels.length && !enquiries.length) {
    return (
      <Card className="py-16 text-center">
        <Hotel className="mx-auto text-slate-400" />
        <p className="mt-3 text-slate-600">{t.account.noBookings}</p>
      </Card>
    );
  }

  const empty = !visibleHotels.length && !visibleEnquiries.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {BOOKING_FILTERS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
              filter === key
                ? "bg-[#051741] text-white shadow-sm"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            )}
          >
            {filterLabel(key, t)}
          </button>
        ))}
      </div>

      {empty ? (
        <Card className="py-12 text-center">
          <p className="text-sm text-slate-500">{t.account.noBookingsFilter}</p>
        </Card>
      ) : null}

      {visibleHotels.map((b) => {
        const dateLine = [formatHumanDate(b.check_in, locale), formatHumanDate(b.check_out, locale)]
          .filter(Boolean)
          .filter((value, index, arr) => arr.indexOf(value) === index)
          .join(" → ");

        return (
          <Card key={b.id} className="overflow-hidden border-slate-100 bg-white py-0 shadow-sm">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  {b.service === "flight" ? (
                    <AirlineLogo code={b.airline_code} name={b.airline} size="md" />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                      <ServiceGlyph service={b.service} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                      {serviceTitle(b.service, t)}
                    </p>
                    {b.service === "flight" ? (
                      <>
                        <h3 className="mt-1 flex flex-wrap items-center gap-2 text-lg font-bold text-slate-900">
                          <span>{b.origin || b.route || b.hotel_name}</span>
                          {b.origin && b.destination ? (
                            <Plane size={16} className="text-slate-400 rtl:-scale-x-100" />
                          ) : null}
                          {b.destination ? <span>{b.destination}</span> : null}
                        </h3>
                        <p className="mt-0.5 text-sm text-slate-600">
                          {[b.airline, b.fare_class].filter(Boolean).join(" · ")}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="mt-1 text-lg font-bold text-slate-900">{b.hotel_name}</h3>
                        {b.room_name ? <p className="text-sm text-slate-600">{b.room_name}</p> : null}
                      </>
                    )}
                    {dateLine ? <p className="mt-1 text-sm text-slate-500">{dateLine}</p> : null}
                    {b.pnr ? (
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {t.account.bookingPnr}: {b.pnr}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-slate-400">
                      {b.payment_method === "card" ? t.account.payCard : t.account.payWhatsApp}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={cn("border font-semibold", statusClass(b))}>{statusLabel(b)}</Badge>
                  <p className="text-lg font-black text-slate-900">{formatPrice(b.price, b.currency)}</p>
                </div>
              </div>

              {b.cancel_status === "rejected" && b.cancel_admin_note ? (
                <p className="mt-3 text-sm text-rose-700">{b.cancel_admin_note}</p>
              ) : null}
              {b.cancel_status === "refunded" ? (
                <p className="mt-3 text-sm text-emerald-800">{t.account.statusRefunded}</p>
              ) : null}

              {b.can_cancel ? (
                confirmId === b.id ? (
                  <div className="mt-4 space-y-2 rounded-xl bg-slate-50 p-3">
                    <p className="text-sm font-semibold text-slate-800">{t.account.cancelConfirmTitle}</p>
                    <p className="text-xs leading-relaxed text-slate-600">{t.account.cancelSla}</p>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder={t.account.cancelReason}
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busyId === b.id}
                        onClick={() => void requestCancel(b.id)}
                        className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                      >
                        {t.account.cancelSubmit}
                      </button>
                      <button type="button" onClick={() => setConfirmId("")} className="text-xs text-slate-500">
                        {t.common.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmId(b.id)}
                    className="mt-4 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-800"
                  >
                    {t.account.cancelBooking}
                  </button>
                )
              ) : b.non_refundable && b.cancel_status === "none" ? (
                <p className="mt-4 text-xs font-semibold text-slate-500">{t.account.notCancellable}</p>
              ) : null}
            </CardContent>
          </Card>
        );
      })}

      {visibleEnquiries.map((e) => (
        <Card key={e.id} className="border-slate-100 bg-white py-0 shadow-sm">
          <CardContent className="p-5">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              {t.account.bookingEnquiry}
              {" · "}
              {serviceTitle(e.service, t)}
            </p>
            <h3 className="mt-1 font-bold text-slate-900">{e.service_name || e.type}</h3>
            {e.destination ? <p className="text-sm text-slate-500">{e.destination}</p> : null}
            <p className="mt-2 text-xs text-slate-400">
              {e.created ? formatHumanDate(e.created, locale) : ""}
              {e.status ? ` · ${e.status}` : ""}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
