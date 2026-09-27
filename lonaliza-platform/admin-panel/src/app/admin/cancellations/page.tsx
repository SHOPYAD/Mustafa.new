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
      return "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300";
    case "refund_failed":
      return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300";
    case "approved":
    case "refunded":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
    case "rejected":
      return "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300";
    case "none":
      return "border-border bg-muted/40 text-muted-foreground";
    default: {
      const _never: never = status;
      return _never;
    }
  }
}

export default function AdminCancellationsPage() {
  const { t, locale, dir } = useLocale();
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
        <Loader2 className='animate-spin text-muted-foreground' />
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
    <div className="admin-page w-full max-w-none min-w-0 space-y-6" dir={dir}>
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold">
              مكتب الإلغاء والاسترداد المالي
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              مركز العمليات المالية المباشرة
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-3">
            <Undo2 size={28} className="text-rose-600 dark:text-rose-400" />
            <span>طلبات الإلغاء والاسترداد المالي</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground font-medium">
            {t.account.cancelSla || "معالجة طلبات الإلغاء والاسترداد المالي للعملاء ومطابقتها مع سياسات الموردين وضمان لوناليزا."}
          </p>
        </div>
      </div>

      {/* 2. 4 Telemetry KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>إجمالي طلبات الإلغاء</span>
            <Undo2 className="size-4 text-primary" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground font-mono">
            {counts.all}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">كافة الحجوزات والخدمات</p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 mb-1">
            <span>طلبات جديدة بانتظار البت</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {counts.new}
          </p>
          <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-1">تتطلب مراجعة مالية</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 mb-1">
            <span>تمت الموافقة والاسترداد</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {counts.approved}
          </p>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">مبالغ مسترجعة ومسواة</p>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 mb-1">
            <span>طلبات مرفوضة</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {counts.rejected}
          </p>
          <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">وفق سياسة المورد غير القابل</p>
        </div>
      </div>

      {/* 3. Status Filters Toolbar */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted border border-border w-fit">
        {filters.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-xs font-bold transition-all cursor-pointer",
              filter === item.key
                ? "bg-card text-foreground shadow-xs font-black"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>

      {msg ? (
        <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs font-bold text-amber-700 dark:text-amber-300">
          {msg}
        </div>
      ) : null}

      {/* 4. Requests List */}
      {!visible.length ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center text-muted-foreground shadow-xs">
          <Undo2 size={36} className="mx-auto text-muted-foreground/40 mb-2" />
          <h3 className="text-sm font-bold text-foreground">لا توجد طلبات إلغاء في هذا القسم</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {t.admin.noCancelRequests || "كافة الحجوزات بحالة سليمة ومؤكدة."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((row) => {
            const fee = Number(fees[row.id] || 0);
            const refund = Math.max(0, Math.round((row.price - fee) * 100) / 100);
            const dateLine = [formatHumanDate(row.check_in, locale), formatHumanDate(row.check_out, locale)]
              .filter(Boolean)
              .filter((value, index, arr) => arr.indexOf(value) === index)
              .join(" ➔ ");
            const title = row.service === "flight" ? row.route || row.hotel_name : row.hotel_name;

            return (
              <section
                key={row.id}
                className="rounded-3xl border border-border bg-card p-5 sm:p-6 text-foreground shadow-xs space-y-4 hover:border-border/80 transition-colors"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-border">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-bold text-foreground">
                        {serviceLabel(row.service, t)}
                      </span>

                      {row.request_type === "change" ? (
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
                            row.change_status === "done"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : row.change_status === "rejected"
                                ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                : "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400"
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

                      {row.refund_guarantee && (
                        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          ضمان استرداد لوناليزا (Refund Guarantee)
                        </span>
                      )}

                      {row.free_cancellation ? (
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          إلغاء مجاني متاح
                        </span>
                      ) : (
                        <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                          غير قابل للإلغاء لدى المورد
                        </span>
                      )}
                    </div>

                    <h3 className="font-black text-lg text-foreground tracking-tight">{title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {row.customer_name}
                      {row.customer_email ? ` · ${row.customer_email}` : ""}
                      {row.room_name ? ` · ${row.room_name}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {dateLine}
                      {row.pnr ? ` · PNR: ${row.pnr}` : ""}
                    </p>
                    {row.cancel_requested_at ? (
                      <p className="text-[11px] text-muted-foreground">
                        تاريخ تقديم الطلب: {formatHumanDateTime(row.cancel_requested_at, locale)}
                      </p>
                    ) : null}
                  </div>

                  {/* Financial Summary Pill */}
                  <div className="text-end bg-muted/40 p-3 rounded-2xl border border-border shrink-0 min-w-[180px]">
                    <span className="text-[11px] text-muted-foreground block">المبلغ المدفوع بالكامل:</span>
                    <span className="text-xl font-black font-mono text-foreground block">
                      {row.currency} {row.price}
                    </span>
                    <Link
                      href={`/admin/bookings?id=${encodeURIComponent(`hotel:${row.id}`)}`}
                      className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                    >
                      <ExternalLink size={12} />
                      <span>فتح تفاصيل الحجز</span>
                    </Link>
                  </div>
                </div>

                {/* Customer Reason Note */}
                {row.cancel_reason ? (
                  <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs">
                    <span className="font-bold text-foreground">سبب الإلغاء المكتوب من العميل: </span>
                    <span className="text-muted-foreground">{row.cancel_reason}</span>
                  </div>
                ) : null}

                {/* Interactive Refund Settlement Calculator Box */}
                <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-foreground">
                      حاسبة تسوية الاسترداد المالي (Refund Settlement Calculator)
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      صافي المسترد: {row.currency} {refund}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        رسوم الإلغاء المخصومة ({row.currency}):
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={row.price}
                        value={fees[row.id] ?? "0"}
                        onChange={(e) => setFees((s) => ({ ...s, [row.id]: e.target.value }))}
                        className="w-full h-10 px-3 rounded-xl border border-border bg-card text-foreground font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                      />
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">
                        ضع 0 إذا كان الإلغاء مجانياً أو يغطيه ضمان لوناليزا
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-muted-foreground mb-1">
                        ملاحظة الإدارة المالية للنزيل:
                      </label>
                      <input
                        type="text"
                        value={notes[row.id] || ""}
                        onChange={(e) => setNotes((s) => ({ ...s, [row.id]: e.target.value }))}
                        placeholder="سبب الخصم أو تفاصيل الحوالة البنكية..."
                        className="w-full h-10 px-3 rounded-xl border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Net Refund Highlight Badge */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold">
                    <span className="text-emerald-700 dark:text-emerald-300">
                      صافي المبلغ الذي سيُعاد إلى بطاقة / محفظة النزيل فوراً:
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-300 font-mono font-black text-sm">
                      {row.currency} {refund}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {row.cancel_status === "pending_admin" || row.cancel_status === "refund_failed" ? (
                      <>
                        <button
                          type="button"
                          disabled={Boolean(busyId)}
                          onClick={() => void run(row.cancel_status === "refund_failed" ? "retry" : "approve", row)}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          {row.cancel_status === "refund_failed" ? "إعادة محاولة الاسترداد" : "اعتماد الاسترداد والتسوية البنكية"}
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(busyId)}
                          onClick={() => void run("reject", row)}
                          className="px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          رفض طلب الإلغاء
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground font-medium">
                        تمت معالجة الطلب ({statusLabel(row.cancel_status, t)}).
                      </span>
                    )}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
