"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, Undo2 } from "lucide-react";
import { formatHumanDate, formatHumanDateTime } from "@/lib/account/booking-display";
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

type StatusFilter = "all" | "new" | "approved" | "rejected";

type Row = {
  id: string;
  hotel_name: string;
  room_name: string;
  customer_name: string;
  customer_email: string;
  check_in: string;
  check_out: string;
  price: number;
  currency: string;
  payment_method: string;
  cancel_status: CancelStatus;
  cancel_reason: string;
  cancel_admin_note: string;
  cancel_requested_at: string;
  charged_amount: number;
  charged_currency: string;
  free_cancellation: boolean;
  non_refundable: boolean;
  service: InvoiceService;
  pnr: string;
  route: string;
};

function serviceLabel(service: InvoiceService, t: Dictionary): string {
  switch (service) {
    case "flight":
      return t.admin.typeFlight;
    case "hotel":
      return t.admin.typeHotel;
    case "car":
      return t.nav.cars;
    case "transfer":
      return t.admin.typeTransfer;
    case "tour":
      return t.admin.typeTour;
    case "package":
      return t.admin.typePackage;
    case "visa":
      return t.admin.typeVisa;
    default: {
      const _never: never = service;
      return _never;
    }
  }
}

function statusGroup(status: CancelStatus): StatusFilter {
  switch (status) {
    case "pending_admin":
    case "refund_failed":
      return "new";
    case "approved":
    case "refunded":
      return "approved";
    case "rejected":
      return "rejected";
    case "none":
      return "all";
    default: {
      const _never: never = status;
      return _never;
    }
  }
}

function statusLabel(status: CancelStatus, t: Dictionary): string {
  switch (status) {
    case "pending_admin":
      return t.admin.cancelStatusNew;
    case "approved":
      return t.admin.cancelStatusApproved;
    case "rejected":
      return t.admin.cancelStatusRejected;
    case "refunded":
      return t.admin.cancelStatusRefunded;
    case "refund_failed":
      return t.admin.cancelStatusRefundFailed;
    case "none":
      return t.common.active;
    default: {
      const _never: never = status;
      return _never;
    }
  }
}

function statusClass(status: CancelStatus): string {
  switch (status) {
    case "pending_admin":
      return "border-sky-400/30 bg-sky-500/15 text-sky-200";
    case "refund_failed":
      return "border-amber-400/30 bg-amber-500/15 text-amber-200";
    case "approved":
    case "refunded":
      return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
    case "rejected":
      return "border-rose-400/30 bg-rose-500/15 text-rose-200";
    case "none":
      return "border-white/10 bg-white/5 text-white/60";
    default: {
      const _never: never = status;
      return _never;
    }
  }
}

export default function AdminCancellationsPage() {
  const { t, locale } = useLocale();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [fees, setFees] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");

  const load = async () => {
    const res = await fetch("/api/admin/cancellations", { cache: "no-store" });
    const data = (await res.json()) as { bookings?: Row[] };
    setRows(data.bookings || []);
  };

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, []);

  const visible = useMemo(
    () => (filter === "all" ? rows : rows.filter((row) => statusGroup(row.cancel_status) === filter)),
    [rows, filter]
  );

  const counts = useMemo(() => {
    const next = { all: rows.length, new: 0, approved: 0, rejected: 0 };
    for (const row of rows) {
      const group = statusGroup(row.cancel_status);
      if (group === "new") next.new += 1;
      if (group === "approved") next.approved += 1;
      if (group === "rejected") next.rejected += 1;
    }
    return next;
  }, [rows]);

  const run = async (action: "approve" | "reject" | "retry", row: Row) => {
    setBusyId(`${action}:${row.id}`);
    setMsg("");
    try {
      const res = await fetch("/api/admin/cancellations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          bookingId: row.id,
          feeAmount: Number(fees[row.id] || 0),
          note: notes[row.id] || "",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!data.ok) {
        setMsg(data.error || t.admin.saveFailed);
        await load();
        return;
      }
      setMsg(t.admin.saved);
      await load();
    } finally {
      setBusyId("");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-white/50" />
      </div>
    );
  }

  const filters: Array<{ key: StatusFilter; label: string; count: number }> = [
    { key: "all", label: t.admin.cancelFilterAll, count: counts.all },
    { key: "new", label: t.admin.cancelStatusNew, count: counts.new },
    { key: "approved", label: t.admin.cancelStatusApproved, count: counts.approved },
    { key: "rejected", label: t.admin.cancelStatusRejected, count: counts.rejected },
  ];

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
          <Undo2 size={22} /> {t.admin.cancellations}
        </h1>
        <p className="mt-1 text-sm text-white/45">{t.account.cancelSla}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
              filter === item.key
                ? "bg-white text-slate-900"
                : "bg-white/5 text-white/70 ring-1 ring-white/10 hover:bg-white/10"
            )}
          >
            {item.label} · {item.count}
          </button>
        ))}
      </div>

      {msg ? <p className="text-sm text-amber-200">{msg}</p> : null}
      {!visible.length ? (
        <p className="text-sm text-white/40">{t.admin.noCancelRequests}</p>
      ) : (
        <div className="space-y-4">
          {visible.map((row) => {
            const fee = Number(fees[row.id] || 0);
            const refund = Math.max(0, Math.round((row.price - fee) * 100) / 100);
            const dateLine = [formatHumanDate(row.check_in, locale), formatHumanDate(row.check_out, locale)]
              .filter(Boolean)
              .filter((value, index, arr) => arr.indexOf(value) === index)
              .join(" → ");
            const title = row.service === "flight" ? row.route || row.hotel_name : row.hotel_name;
            return (
              <section
                key={row.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white"
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white/70">
                        {t.admin.cancelService}: {serviceLabel(row.service, t)}
                      </span>
                      <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-bold", statusClass(row.cancel_status))}>
                        {statusLabel(row.cancel_status, t)}
                      </span>
                    </div>
                    <p className="mt-2 font-bold">{title}</p>
                    <p className="text-sm text-white/60">
                      {row.customer_name}
                      {row.customer_email ? ` · ${row.customer_email}` : ""}
                      {row.room_name ? ` · ${row.room_name}` : ""}
                    </p>
                    <p className="text-xs text-white/40">
                      {dateLine}
                      {row.pnr ? ` · ${t.account.bookingPnr} ${row.pnr}` : ""}
                    </p>
                    {row.cancel_requested_at ? (
                      <p className="mt-1 text-xs text-white/40">
                        {t.admin.cancelRequestedAt}: {formatHumanDateTime(row.cancel_requested_at, locale)}
                      </p>
                    ) : null}
                  </div>
                  <div className="text-end text-sm">
                    <p>
                      {t.admin.paidAmount}: {row.currency} {row.price}
                    </p>
                    <p className="text-white/50">
                      {t.admin.roomPolicy}:{" "}
                      {row.free_cancellation ? t.hotels.freeCancellation : t.account.notCancellable}
                    </p>
                    <Link
                      href={`/admin/bookings?id=${encodeURIComponent(`hotel:${row.id}`)}`}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-300 hover:text-emerald-200"
                    >
                      <ExternalLink size={12} />
                      {t.admin.cancelViewBooking}
                    </Link>
                  </div>
                </div>
                {row.cancel_reason ? (
                  <p className="mt-3 rounded-xl bg-white/5 px-3 py-2 text-sm text-white/80">
                    <span className="font-semibold text-white/50">{t.admin.cancelCustomerReason}: </span>
                    {row.cancel_reason}
                  </p>
                ) : null}
                {row.cancel_admin_note ? (
                  <p className="mt-2 text-sm text-amber-100/80">
                    <span className="font-semibold text-white/50">{t.admin.cancelNote}: </span>
                    {row.cancel_admin_note}
                  </p>
                ) : null}
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="text-xs text-white/40">
                    {t.admin.cancelFee}
                    <input
                      type="number"
                      min={0}
                      max={row.price}
                      value={fees[row.id] ?? "0"}
                      onChange={(e) => setFees((s) => ({ ...s, [row.id]: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white"
                    />
                  </label>
                  <label className="text-xs text-white/40">
                    {t.admin.cancelNote}
                    <input
                      value={notes[row.id] || ""}
                      onChange={(e) => setNotes((s) => ({ ...s, [row.id]: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white"
                    />
                  </label>
                </div>
                <p className="mt-2 text-xs text-emerald-200">
                  {t.hotels.alrayyanTotal}: {row.currency} {refund}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {row.cancel_status === "pending_admin" || row.cancel_status === "refund_failed" ? (
                    <>
                      <button
                        type="button"
                        disabled={Boolean(busyId)}
                        onClick={() => void run(row.cancel_status === "refund_failed" ? "retry" : "approve", row)}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                      >
                        {row.cancel_status === "refund_failed" ? t.admin.cancelRetry : t.admin.cancelApprove}
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(busyId)}
                        onClick={() => void run("reject", row)}
                        className="rounded-xl border border-rose-400/30 px-4 py-2 text-xs font-bold text-rose-200 disabled:opacity-50"
                      >
                        {t.admin.cancelReject}
                      </button>
                    </>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
