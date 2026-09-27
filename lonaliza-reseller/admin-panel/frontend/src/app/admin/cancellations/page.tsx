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
  request_type?: "cancel" | "change";
  change_status?: "none" | "pending_admin" | "done" | "rejected";
  change_request?: string;
  change_admin_note?: string;
  change_requested_at?: string;
  lonaliza_services?: Array<{ id: string; kind: string; title: string; amount: number; currency?: string }>;
  refund_guarantee?: boolean;
  flex_change?: boolean;
  supplier_reference?: string;
  supplier_cancel_note?: string;
};

const LZ_COPY = {
  ar: {
    services: "خدمات لوناليزا",
    changeRequest: "طلب تغيير تاريخ (خدمة لوناليزا)",
    changeHint: "نفّذ التغيير عند المورد ثم اضغط «تم التنفيذ». لا يُرسل شيء للمورد تلقائياً.",
    changeDone: "تم التنفيذ",
    changeReject: "رفض الطلب",
    changeStatusDone: "نُفِّذ",
    changeStatusRejected: "مرفوض",
    changeStatusPending: "بانتظار التنفيذ",
    newCheckIn: "التاريخ الجديد (ذهاب)",
    newCheckOut: "التاريخ الجديد (عودة/مغادرة)",
    guarantee: "ضمان استرداد لوناليزا: يُسترد للعميل حتى لو رفض المورد الإلغاء (الفرق على محفظة لوناليزا).",
    supplierRef: "مرجع المورد",
    requested: "طلب العميل",
  },
  en: {
    services: "Lonaliza services",
    changeRequest: "Date change request (Lonaliza service)",
    changeHint: "Execute the change at the supplier, then press “Done”. Nothing is sent to the supplier automatically.",
    changeDone: "Done",
    changeReject: "Reject",
    changeStatusDone: "Executed",
    changeStatusRejected: "Rejected",
    changeStatusPending: "Awaiting execution",
    newCheckIn: "New date (outbound)",
    newCheckOut: "New date (return/checkout)",
    guarantee: "Lonaliza refund guarantee: refund the customer even if the supplier refuses (difference borne by Lonaliza).",
    supplierRef: "Supplier ref",
    requested: "Customer request",
  },
  tr: {
    services: "Lonaliza hizmetleri",
    changeRequest: "Tarih değişikliği talebi (Lonaliza hizmeti)",
    changeHint: "Değişikliği tedarikçide yapın, sonra “Tamamlandı”ya basın. Tedarikçiye otomatik hiçbir şey gönderilmez.",
    changeDone: "Tamamlandı",
    changeReject: "Reddet",
    changeStatusDone: "Yapıldı",
    changeStatusRejected: "Reddedildi",
    changeStatusPending: "Bekliyor",
    newCheckIn: "Yeni tarih (gidiş)",
    newCheckOut: "Yeni tarih (dönüş/çıkış)",
    guarantee: "Lonaliza iade garantisi: tedarikçi reddetse bile müşteriye iade edilir (fark Lonaliza'ya ait).",
    supplierRef: "Tedarikçi ref",
    requested: "Müşteri talebi",
  },
} as const;

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
      return "border-purple-400/30 bg-purple-500/15 text-purple-200";
    case "rejected":
      return "border-rose-400/30 bg-rose-500/15 text-rose-200";
    case "none":
      return "border-admin-border-subtle bg-admin-bg-subtle text-muted-foreground";
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
  const [newDates, setNewDates] = useState<Record<string, { in: string; out: string }>>({});
  const lz = LZ_COPY[locale === "en" ? "en" : locale === "tr" ? "tr" : "ar"];
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

  const groupOf = (row: Row): StatusFilter => {
    if (row.request_type === "change") {
      if (row.change_status === "pending_admin") return "new";
      if (row.change_status === "done") return "approved";
      if (row.change_status === "rejected") return "rejected";
      return "all";
    }
    return statusGroup(row.cancel_status);
  };

  const visible = useMemo(
    () => (filter === "all" ? rows : rows.filter((row) => groupOf(row) === filter)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, filter]
  );

  const counts = useMemo(() => {
    const next = { all: rows.length, new: 0, approved: 0, rejected: 0 };
    for (const row of rows) {
      const group = groupOf(row);
      if (group === "new") next.new += 1;
      if (group === "approved") next.approved += 1;
      if (group === "rejected") next.rejected += 1;
    }
    return next;
  }, [rows]);

  const run = async (action: "approve" | "reject" | "retry" | "change_done" | "change_reject", row: Row) => {
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
          newCheckIn: newDates[row.id]?.in || undefined,
          newCheckOut: newDates[row.id]?.out || undefined,
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
        <Loader2 className="animate-spin text-muted-foreground" />
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
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Undo2 size={22} /> {t.admin.cancellations}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.account.cancelSla}</p>
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
                : "bg-admin-bg-subtle text-muted-foreground ring-1 ring-white/10 hover:bg-muted"
            )}
          >
            {item.label} · {item.count}
          </button>
        ))}
      </div>

      {msg ? <p className="text-sm text-amber-200">{msg}</p> : null}
      {!visible.length ? (
        <p className="text-sm text-admin-text-muted">{t.admin.noCancelRequests}</p>
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
                className="rounded-2xl border border-admin-border-subtle bg-admin-bg-surface p-5 text-foreground"
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-admin-border-subtle bg-admin-bg-subtle px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                        {t.admin.cancelService}: {serviceLabel(row.service, t)}
                      </span>
                      {row.request_type === "change" ? (
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
                            row.change_status === "done"
                              ? "border-purple-400/30 bg-purple-500/15 text-purple-200"
                              : row.change_status === "rejected"
                                ? "border-rose-400/30 bg-rose-500/15 text-rose-200"
                                : "border-sky-400/30 bg-sky-500/15 text-sky-200"
                          )}
                        >
                          {lz.changeRequest} ·{" "}
                          {row.change_status === "done" ? lz.changeStatusDone : row.change_status === "rejected" ? lz.changeStatusRejected : lz.changeStatusPending}
                        </span>
                      ) : (
                        <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-bold", statusClass(row.cancel_status))}>
                          {statusLabel(row.cancel_status, t)}
                        </span>
                      )}
                      {row.lonaliza_services?.map((svc) => (
                        <span key={svc.id} className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-200">
                          {lz.services}: {svc.title}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2 font-bold">{title}</p>
                    <p className="text-sm text-muted-foreground">
                      {row.customer_name}
                      {row.customer_email ? ` · ${row.customer_email}` : ""}
                      {row.room_name ? ` · ${row.room_name}` : ""}
                    </p>
                    <p className="text-xs text-admin-text-muted">
                      {dateLine}
                      {row.pnr ? ` · ${t.account.bookingPnr} ${row.pnr}` : ""}
                    </p>
                    {row.cancel_requested_at ? (
                      <p className="mt-1 text-xs text-admin-text-muted">
                        {t.admin.cancelRequestedAt}: {formatHumanDateTime(row.cancel_requested_at, locale)}
                      </p>
                    ) : null}
                    {row.request_type === "change" && row.change_requested_at ? (
                      <p className="mt-1 text-xs text-admin-text-muted">
                        {t.admin.cancelRequestedAt}: {formatHumanDateTime(row.change_requested_at, locale)}
                      </p>
                    ) : null}
                    {row.supplier_reference ? (
                      <p className="mt-1 text-xs text-admin-text-muted" dir="ltr">
                        {lz.supplierRef}: {row.supplier_reference}
                      </p>
                    ) : null}
                    {row.refund_guarantee && row.request_type !== "change" ? (
                      <p className="mt-2 rounded-lg border border-amber-400/20 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-100">{lz.guarantee}</p>
                    ) : null}
                    {row.supplier_cancel_note ? (
                      <p className="mt-1 text-xs text-rose-200/80">{row.supplier_cancel_note}</p>
                    ) : null}
                  </div>
                  <div className="text-end text-sm">
                    <p>
                      {t.admin.paidAmount}: {row.currency} {row.price}
                    </p>
                    <p className="text-muted-foreground">
                      {t.admin.roomPolicy}:{" "}
                      {row.free_cancellation ? t.hotels.freeCancellation : t.account.notCancellable}
                    </p>
                    <Link
                      href={`/admin/bookings?id=${encodeURIComponent(`hotel:${row.id}`)}`}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-300 hover:text-amber-200"
                    >
                      <ExternalLink size={12} />
                      {t.admin.cancelViewBooking}
                    </Link>
                  </div>
                </div>
                {row.request_type === "change" ? (
                  <div className="mt-3 rounded-xl border border-sky-400/20 bg-sky-500/5 p-3">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold text-muted-foreground">{lz.requested}: </span>
                      {row.change_request || "—"}
                    </p>
                    <p className="mt-1 text-xs text-admin-text-muted">{lz.changeHint}</p>
                    {row.change_admin_note ? (
                      <p className="mt-1 text-sm text-amber-100/80">
                        <span className="font-semibold text-muted-foreground">{t.admin.cancelNote}: </span>
                        {row.change_admin_note}
                      </p>
                    ) : null}
                    {row.change_status === "pending_admin" ? (
                      <>
                        <div className="mt-3 grid gap-3 md:grid-cols-3">
                          <label className="text-xs text-admin-text-muted">
                            {lz.newCheckIn}
                            <input
                              type="date"
                              value={newDates[row.id]?.in || ""}
                              onChange={(e) => setNewDates((s) => ({ ...s, [row.id]: { in: e.target.value, out: s[row.id]?.out || "" } }))}
                              className="mt-1 w-full rounded-xl border border-admin-border-subtle bg-slate-950/60 px-3 py-2 text-sm text-foreground"
                            />
                          </label>
                          <label className="text-xs text-admin-text-muted">
                            {lz.newCheckOut}
                            <input
                              type="date"
                              value={newDates[row.id]?.out || ""}
                              onChange={(e) => setNewDates((s) => ({ ...s, [row.id]: { in: s[row.id]?.in || "", out: e.target.value } }))}
                              className="mt-1 w-full rounded-xl border border-admin-border-subtle bg-slate-950/60 px-3 py-2 text-sm text-foreground"
                            />
                          </label>
                          <label className="text-xs text-admin-text-muted">
                            {t.admin.cancelNote}
                            <input
                              value={notes[row.id] || ""}
                              onChange={(e) => setNotes((s) => ({ ...s, [row.id]: e.target.value }))}
                              className="mt-1 w-full rounded-xl border border-admin-border-subtle bg-slate-950/60 px-3 py-2 text-sm text-foreground"
                            />
                          </label>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={Boolean(busyId)}
                            onClick={() => void run("change_done", row)}
                            className="rounded-xl bg-gradient-to-r from-purple-700 to-indigo-800 px-4 py-2 text-xs font-bold text-foreground hover:brightness-110 shadow-sm disabled:opacity-50"
                          >
                            {lz.changeDone}
                          </button>
                          <button
                            type="button"
                            disabled={Boolean(busyId)}
                            onClick={() => void run("change_reject", row)}
                            className="rounded-xl border border-rose-400/30 px-4 py-2 text-xs font-bold text-rose-200 disabled:opacity-50"
                          >
                            {lz.changeReject}
                          </button>
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : null}
                {row.cancel_reason ? (
                  <p className="mt-3 rounded-xl bg-admin-bg-subtle px-3 py-2 text-sm text-foreground">
                    <span className="font-semibold text-muted-foreground">{t.admin.cancelCustomerReason}: </span>
                    {row.cancel_reason}
                  </p>
                ) : null}
                {row.cancel_admin_note ? (
                  <p className="mt-2 text-sm text-amber-100/80">
                    <span className="font-semibold text-muted-foreground">{t.admin.cancelNote}: </span>
                    {row.cancel_admin_note}
                  </p>
                ) : null}
                {row.request_type === "change" ? null : (
                <>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="text-xs text-admin-text-muted">
                    {t.admin.cancelFee}
                    <input
                      type="number"
                      min={0}
                      max={row.price}
                      value={fees[row.id] ?? "0"}
                      onChange={(e) => setFees((s) => ({ ...s, [row.id]: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-admin-border-subtle bg-slate-950/60 px-3 py-2 text-sm text-foreground"
                    />
                  </label>
                  <label className="text-xs text-admin-text-muted">
                    {t.admin.cancelNote}
                    <input
                      value={notes[row.id] || ""}
                      onChange={(e) => setNotes((s) => ({ ...s, [row.id]: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-admin-border-subtle bg-slate-950/60 px-3 py-2 text-sm text-foreground"
                    />
                  </label>
                </div>
                <p className="mt-2 text-xs text-amber-200 font-medium">
                  {t.hotels.alrayyanTotal}: {row.currency} {refund}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {row.cancel_status === "pending_admin" || row.cancel_status === "refund_failed" ? (
                    <>
                      <button
                        type="button"
                        disabled={Boolean(busyId)}
                        onClick={() => void run(row.cancel_status === "refund_failed" ? "retry" : "approve", row)}
                        className="rounded-xl bg-gradient-to-r from-purple-700 to-indigo-800 px-4 py-2 text-xs font-bold text-foreground hover:brightness-110 shadow-sm disabled:opacity-50"
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
                </>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
