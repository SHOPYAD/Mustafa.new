"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, Undo2, AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatHumanDate, formatHumanDateTime } from "@/lib/account/booking-display";
import type { InvoiceService } from "@/lib/booking-service";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { Dictionary } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
  EnterpriseFilterBar,
  EnterpriseStatusBadge,
} from "@/components/admin/enterprise";
import { Button } from "@/components/ui/button";

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
    changeDone: "تم تنفيذ التغيير",
    changeReject: "رفض التغيير",
    changeStatusPending: "بانتظار الإدارة",
    changeStatusDone: "تم التنفيذ",
    changeStatusRejected: "مرفوض",
    newCheckIn: "تاريخ الدخول الجديد (اختياري للسجل):",
    newCheckOut: "تاريخ المغادرة الجديد:",
    requested: "المطلوب من العميل:",
    guarantee: "العميل اشترى «ضمان الاسترداد الكامل» من لوناليزا — يُفضّل استرداد كامل أو خصم رمزي وفق الشروط.",
    supplierRef: "مرجع المورد / الحجز الأصلي",
  },
  en: {
    services: "Lonaliza services",
    changeRequest: "Date change request (Lonaliza flex)",
    changeHint: "Apply changes on supplier extranet then click «Done». Nothing is sent to supplier automatically.",
    changeDone: "Mark change done",
    changeReject: "Reject change",
    changeStatusPending: "Pending admin",
    changeStatusDone: "Completed",
    changeStatusRejected: "Rejected",
    newCheckIn: "New check-in (optional record):",
    newCheckOut: "New check-out:",
    requested: "Customer request:",
    guarantee: "Customer has full refund guarantee from Lonaliza.",
    supplierRef: "Supplier ref",
  },
  tr: {
    services: "Lonaliza servisleri",
    changeRequest: "Tarih değişiklik talebi",
    changeHint: "Değişikliği tedarikçi panelinde yapın, sonra «Tamamlandı» deyin.",
    changeDone: "Değişiklik yapıldı",
    changeReject: "Reddet",
    changeStatusPending: "Yönetici bekliyor",
    changeStatusDone: "Tamamlandı",
    changeStatusRejected: "Reddedildi",
    newCheckIn: "Yeni giriş:",
    newCheckOut: "Yeni çıkış:",
    requested: "Müşteri talebi:",
    guarantee: "Tam iade garantisi var.",
    supplierRef: "Tedarikçi ref",
  },
  fr: {
    services: "Services Lonaliza",
    changeRequest: "Demande de modification de date",
    changeHint: "Appliquez sur l’extranet fournisseur puis marquez terminé.",
    changeDone: "Marquer comme fait",
    changeReject: "Rejeter",
    changeStatusPending: "En attente",
    changeStatusDone: "Terminé",
    changeStatusRejected: "Rejeté",
    newCheckIn: "Nouvelle arrivée :",
    newCheckOut: "Nouveau départ :",
    requested: "Demande client :",
    guarantee: "Garantie remboursement intégral Lonaliza.",
    supplierRef: "Réf fournisseur",
  },
};

function statusClass(status: CancelStatus) {
  switch (status) {
    case "pending_admin":
      return "border-amber-400/40 bg-amber-500/10 text-amber-200";
    case "approved":
    case "refunded":
      return "border-emerald-400/40 bg-emerald-500/10 text-emerald-200";
    case "rejected":
    case "refund_failed":
      return "border-rose-400/40 bg-rose-500/10 text-rose-200";
    default:
      return "border-border/50 bg-muted/40 text-muted-foreground";
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
    default:
      return t.common.none;
  }
}

function serviceLabel(svc: InvoiceService, t: Dictionary): string {
  switch (svc) {
    case "flight":
      return t.admin.serviceFlight;
    case "car":
      return t.admin.serviceCar;
    case "tour":
      return t.admin.serviceTour;
    case "transfer":
      return t.admin.serviceTransfer;
    case "hotel":
    default:
      return t.admin.serviceHotel;
  }
}

export default function AdminCancellationsPage() {
  const { t, locale } = useLocale();
  const lz = LZ_COPY[locale] || LZ_COPY.en;
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [fees, setFees] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [newDates, setNewDates] = useState<Record<string, { in?: string; out?: string }>>({});
  const [busyId, setBusyId] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const res = await fetch("/api/admin/cancellations", { cache: "no-store" });
      const data = (await res.json()) as { ok?: boolean; rows?: Row[] };
      if (data.ok && Array.isArray(data.rows)) {
        setRows(data.rows);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const counts = useMemo(() => {
    const all = rows.length;
    const n = rows.filter((r) => r.cancel_status === "pending_admin" || r.change_status === "pending_admin").length;
    const a = rows.filter((r) => r.cancel_status === "approved" || r.cancel_status === "refunded" || r.change_status === "done").length;
    const rej = rows.filter((r) => r.cancel_status === "rejected" || r.change_status === "rejected").length;
    return { all, new: n, approved: a, rejected: rej };
  }, [rows]);

  const visible = useMemo(() => {
    return rows.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.customer_name.toLowerCase().includes(q) ||
        r.customer_email.toLowerCase().includes(q) ||
        r.hotel_name.toLowerCase().includes(q) ||
        (r.route || "").toLowerCase().includes(q) ||
        (r.pnr || "").toLowerCase().includes(q);

      let matchesFilter = true;
      if (filter === "new") {
        matchesFilter = r.cancel_status === "pending_admin" || r.change_status === "pending_admin";
      } else if (filter === "approved") {
        matchesFilter = r.cancel_status === "approved" || r.cancel_status === "refunded" || r.change_status === "done";
      } else if (filter === "rejected") {
        matchesFilter = r.cancel_status === "rejected" || r.change_status === "rejected";
      }

      return matchesSearch && matchesFilter;
    });
  }, [rows, filter, searchQuery]);

  const run = async (
    action: "approve" | "reject" | "retry" | "change_done" | "change_reject",
    row: Row
  ) => {
    setBusyId(row.id);
    setMsg("");
    try {
      const fee = Number(fees[row.id] || 0);
      const note = (notes[row.id] || "").trim();
      const dates = newDates[row.id];
      const res = await fetch("/api/admin/cancellations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: row.id,
          action,
          fee: Number.isFinite(fee) ? fee : 0,
          admin_note: note,
          new_check_in: dates?.in,
          new_check_out: dates?.out,
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

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <EnterprisePageHeader
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "العمليات والطلبات", href: "/admin/bookings" },
          { label: "طلبات الإلغاء وتعديل التواريخ" },
        ]}
        icon={<Undo2 className="h-6 w-6 text-primary" />}
        title={t.admin.cancellations || "إدارة طلبات الإلغاء والاسترداد والتعديل"}
        subtitle={t.account.cancelSla || "متابعة طلبات إلغاء الحجوزات، معالجة رسوم الإلغاء، الاسترداد المالي المباشر عبر Iyzico، وتعديل التواريخ المرنة."}
        actions={
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-border/60 bg-card/60 hover:bg-muted font-semibold text-xs"
            onClick={() => void load()}
          >
            تحديث القائمة
          </Button>
        }
      />

      {/* KPI Grid */}
      <EnterpriseKpiGrid columns={4}>
        <EnterpriseKpiCard
          title="إجمالي الطلبات"
          value={counts.all}
          subValue="إلغاء وتعديل تواريخ"
          icon={<Undo2 className="size-5" />}
          color="purple"
        />
        <EnterpriseKpiCard
          title="طلبات جديدة معلقة"
          value={counts.new}
          subValue="بانتظار مراجعة الإدارة"
          icon={<Clock className="size-5" />}
          color="amber"
          change={counts.new > 0 ? `+${counts.new}` : "0"}
          trend={counts.new > 0 ? "up" : "neutral"}
        />
        <EnterpriseKpiCard
          title="طلبات مقبولة ومستردة"
          value={counts.approved}
          subValue="تمت المعالجة والاسترداد"
          icon={<CheckCircle2 className="size-5" />}
          color="emerald"
        />
        <EnterpriseKpiCard
          title="طلبات مرفوضة"
          value={counts.rejected}
          subValue="غير مطابقة للشروط"
          icon={<XCircle className="size-5" />}
          color="rose"
        />
      </EnterpriseKpiGrid>

      {/* Filter Bar */}
      <EnterpriseFilterBar
        searchPlaceholder="البحث برقم الحجز، اسم العميل، البريد، الفندق، أو رقم PNR..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        tabs={[
          { id: "all", label: "كافة الطلبات", count: counts.all },
          { id: "new", label: "جديدة بانتظار الإجراء", count: counts.new },
          { id: "approved", label: "المقبولة والمستردة", count: counts.approved },
          { id: "rejected", label: "المرفوضة", count: counts.rejected },
        ]}
        activeTab={filter}
        onTabChange={(id) => setFilter(id as StatusFilter)}
        totalResults={visible.length}
      />

      {msg && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-semibold text-amber-500 backdrop-blur-md">
          {msg}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary size-8" />
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card/60 p-12 text-center text-muted-foreground backdrop-blur-xl">
          <Undo2 size={40} className="mx-auto mb-3 text-muted-foreground/50" />
          <h3 className="font-bold text-foreground text-sm">لا توجد طلبات تطابق الفلتر المحدد</h3>
          <p className="text-xs text-muted-foreground mt-1">لم يتم العثور على أي طلب إلغاء أو تغيير حالياً.</p>
        </div>
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
                className="rounded-2xl border border-border/50 bg-card/70 p-5 text-foreground backdrop-blur-xl shadow-xs transition-all hover:border-primary/30"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-border/60 bg-muted/60 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-foreground">
                        {serviceLabel(row.service, t)}
                      </span>
                      {row.request_type === "change" ? (
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
                            row.change_status === "done"
                              ? "border-purple-400/30 bg-purple-500/15 text-purple-300"
                              : row.change_status === "rejected"
                              ? "border-rose-400/30 bg-rose-500/15 text-rose-300"
                              : "border-sky-400/30 bg-sky-500/15 text-sky-300"
                          )}
                        >
                          {lz.changeRequest} ·{" "}
                          {row.change_status === "done"
                            ? lz.changeStatusDone
                            : row.change_status === "rejected"
                            ? lz.changeStatusRejected
                            : lz.changeStatusPending}
                        </span>
                      ) : (
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 text-[11px] font-bold",
                            statusClass(row.cancel_status)
                          )}
                        >
                          {statusLabel(row.cancel_status, t)}
                        </span>
                      )}
                      {row.lonaliza_services?.map((svc) => (
                        <span
                          key={svc.id}
                          className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-300"
                        >
                          {lz.services}: {svc.title}
                        </span>
                      ))}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-foreground">{title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {row.customer_name}
                        {row.customer_email ? ` · ${row.customer_email}` : ""}
                        {row.room_name ? ` · ${row.room_name}` : ""}
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground font-mono">
                      {dateLine}
                      {row.pnr ? ` · PNR: ${row.pnr}` : ""}
                    </p>

                    {row.cancel_requested_at && (
                      <p className="text-[11px] text-muted-foreground">
                        تاريخ الطلب: {formatHumanDateTime(row.cancel_requested_at, locale)}
                      </p>
                    )}
                  </div>

                  <div className="text-start md:text-end space-y-1 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-border/30">
                    <p className="text-sm font-bold text-foreground tabular-nums">
                      المدفوع: {row.currency} {row.price}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.free_cancellation ? "إلغاء مجاني متاح" : "حجز غير قابل للاسترداد تلقائياً"}
                    </p>
                    <Link
                      href={`/admin/bookings?id=${encodeURIComponent(`hotel:${row.id}`)}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline pt-1"
                    >
                      <ExternalLink size={12} />
                      <span>عرض الحجز الكامل</span>
                    </Link>
                  </div>
                </div>

                {/* Date change request body */}
                {row.request_type === "change" && (
                  <div className="mt-4 rounded-xl border border-sky-400/20 bg-sky-500/5 p-4 space-y-3">
                    <p className="text-xs text-foreground">
                      <span className="font-bold text-sky-400">طلب العميل: </span>
                      {row.change_request || "—"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{lz.changeHint}</p>
                    {row.change_admin_note && (
                      <p className="text-xs text-amber-300">
                        <span className="font-bold">ملاحظة الإدارة: </span>
                        {row.change_admin_note}
                      </p>
                    )}
                    {row.change_status === "pending_admin" && (
                      <>
                        <div className="grid gap-3 sm:grid-cols-3 pt-2">
                          <label className="text-xs text-muted-foreground">
                            {lz.newCheckIn}
                            <input
                              type="date"
                              value={newDates[row.id]?.in || ""}
                              onChange={(e) =>
                                setNewDates((s) => ({
                                  ...s,
                                  [row.id]: { in: e.target.value, out: s[row.id]?.out || "" },
                                }))
                              }
                              className="mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs text-foreground"
                            />
                          </label>
                          <label className="text-xs text-muted-foreground">
                            {lz.newCheckOut}
                            <input
                              type="date"
                              value={newDates[row.id]?.out || ""}
                              onChange={(e) =>
                                setNewDates((s) => ({
                                  ...s,
                                  [row.id]: { in: s[row.id]?.in || "", out: e.target.value },
                                }))
                              }
                              className="mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs text-foreground"
                            />
                          </label>
                          <label className="text-xs text-muted-foreground">
                            ملاحظات الإدارة:
                            <input
                              value={notes[row.id] || ""}
                              onChange={(e) => setNotes((s) => ({ ...s, [row.id]: e.target.value }))}
                              placeholder="أدخل ملاحظة للعميل..."
                              className="mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs text-foreground"
                            />
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button
                            type="button"
                            disabled={Boolean(busyId)}
                            onClick={() => void run("change_done", row)}
                            className="rounded-xl font-bold bg-primary text-primary-foreground text-xs"
                          >
                            {lz.changeDone}
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            disabled={Boolean(busyId)}
                            onClick={() => void run("change_reject", row)}
                            className="rounded-xl font-bold text-xs"
                          >
                            {lz.changeReject}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Cancellation body & fee calculation */}
                {row.request_type !== "change" && (
                  <div className="mt-4 pt-4 border-t border-border/40 space-y-3">
                    {row.cancel_reason && (
                      <p className="rounded-xl bg-muted/40 p-3 text-xs text-foreground">
                        <span className="font-semibold text-muted-foreground">سبب الإلغاء من العميل: </span>
                        {row.cancel_reason}
                      </p>
                    )}
                    {row.cancel_admin_note && (
                      <p className="text-xs text-amber-300">
                        <span className="font-semibold">ملاحظة الإدارة: </span>
                        {row.cancel_admin_note}
                      </p>
                    )}

                    {(row.cancel_status === "pending_admin" || row.cancel_status === "refund_failed") && (
                      <div className="space-y-3 pt-2">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="text-xs text-muted-foreground">
                            رسوم الإلغاء المخصومة ({row.currency}):
                            <input
                              type="number"
                              min={0}
                              max={row.price}
                              value={fees[row.id] ?? "0"}
                              onChange={(e) => setFees((s) => ({ ...s, [row.id]: e.target.value }))}
                              className="mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs text-foreground font-mono"
                            />
                          </label>
                          <label className="text-xs text-muted-foreground">
                            ملاحظات الإلغاء للعميل:
                            <input
                              value={notes[row.id] || ""}
                              onChange={(e) => setNotes((s) => ({ ...s, [row.id]: e.target.value }))}
                              placeholder="سبب أو تفاصيل الخصم..."
                              className="mt-1 w-full rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs text-foreground"
                            />
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
                          <span className="text-xs text-muted-foreground">المبلغ المسترد للعميل:</span>
                          <span className="text-sm font-bold text-emerald-500 tabular-nums">
                            {row.currency} {refund}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button
                            type="button"
                            disabled={Boolean(busyId)}
                            onClick={() => void run(row.cancel_status === "refund_failed" ? "retry" : "approve", row)}
                            className="rounded-xl font-bold bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/20 text-xs"
                          >
                            {row.cancel_status === "refund_failed" ? "إعادة محاولة الاسترداد" : "الموافقة على الإلغاء ورد المبلغ"}
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            disabled={Boolean(busyId)}
                            onClick={() => void run("reject", row)}
                            className="rounded-xl font-bold text-xs"
                          >
                            رفض طلب الإلغاء
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
