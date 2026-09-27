"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
  RefreshCw,
  BedDouble,
  Calendar,
  CreditCard,
  Building2,
  ExternalLink,
  X,
  Send,
  Eye,
  Check,
  Printer,
  ShieldCheck,
} from "lucide-react";
import {
  useAdminBookings,
  type BookingCounts,
} from "@/hooks/admin/useAdminBookings";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { useLocale, dateLocaleTag } from "@/lib/i18n/LocaleProvider";
import type { Booking, BookingStatus, BookingType } from "@/data/bookings";

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

interface ParsedBookingMessage {
  raw: string;
  roomName?: string;
  datesFormatted?: string;
  checkIn?: string;
  checkOut?: string;
  price?: string;
  paymentStatus?: string;
  guests?: string;
  provider?: string;
  isStructured: boolean;
}

function parseBookingMessage(message?: string): ParsedBookingMessage {
  if (!message) return { raw: "", isStructured: false };
  const raw = message.trim();

  // Pattern: "الغرفة: 2 Superior Twin Room, Capacity 2 من 2026-09-16 إلى 2026-09-21 السعر: EUR 1558.02 حالة الدفع: pending_payment"
  const roomMatch = raw.match(/الغرفة:\s*([^من]+?)(?=\s*من|\s*السعر|$)/i);
  const datesMatch = raw.match(/من\s*([0-9-T:.Z\s]+)\s*إلى\s*([0-9-T:.Z\s]+?)(?=\s*السعر|\s*حالة|$)/i);
  const priceMatch = raw.match(/السعر:\s*([A-Z]{3})?\s*([0-9.,]+)/i);
  const payMatch = raw.match(/حالة الدفع:\s*([^\s]+)/i);
  const guestsMatch = raw.match(/(?:أسماء النزلاء|النزلاء):\s*([^المورد]+?)(?=\s*المورد|$)/i);
  const providerMatch = raw.match(/المورد:\s*(.+)$/i);

  const isStructured = Boolean(roomMatch || datesMatch || priceMatch);

  let formattedDates = "";
  if (datesMatch) {
    const rawIn = datesMatch[1].trim().split("T")[0].split(" ")[0];
    const rawOut = datesMatch[2].trim().split("T")[0].split(" ")[0];
    formattedDates = `${rawIn} ➔ ${rawOut}`;
  }

  return {
    raw,
    roomName: roomMatch ? roomMatch[1].trim().replace(/,\s*Capacity\s*\d+/i, "") : undefined,
    checkIn: datesMatch ? datesMatch[1].trim().split("T")[0].split(" ")[0] : undefined,
    checkOut: datesMatch ? datesMatch[2].trim().split("T")[0].split(" ")[0] : undefined,
    datesFormatted: formattedDates,
    price: priceMatch ? `${priceMatch[1] || ""} ${priceMatch[2]}`.trim() : undefined,
    paymentStatus: payMatch ? payMatch[1].trim() : undefined,
    guests: guestsMatch ? guestsMatch[1].trim() : undefined,
    provider: providerMatch ? providerMatch[1].trim() : undefined,
    isStructured,
  };
}

export default function AdminBookingsPage() {
  const { t, locale } = useLocale();
  const {
    bookings,
    filteredBookings,
    loading,
    pocketbaseConnected,
    error: loadError,
    counts,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    customerFilter,
    setCustomerFilter,
    updateStatus,
    deleteBooking,
    refresh,
  } = useAdminBookings();

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const statusConfig: Record<
    BookingStatus,
    { label: string; color: string; bg: string; icon: React.ElementType }
  > = {
    new: {
      label: "جديد (بانتظار التأكيد)",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      icon: Circle,
    },
    "in-progress": {
      label: "قيد المتابعة والمعالجة",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      icon: Clock,
    },
    resolved: {
      label: "مؤكد ومكتمل",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      icon: CheckCircle2,
    },
  };

  const typeConfig: Record<
    string,
    { label: string; color: string; icon: React.ElementType }
  > = {
    flight: { label: t.admin.typeFlight || "طيران", color: "text-sky-500", icon: Plane },
    hotel: { label: t.admin.typeHotel || "فندق", color: "text-rose-500", icon: Hotel },
    package: { label: t.admin.typePackage || "باقة سياحية", color: "text-emerald-500", icon: Package },
    transfer: { label: t.admin.typeTransfer || "توصيل VIP", color: "text-cyan-500", icon: Car },
    visa: { label: t.admin.typeVisa || "تأشيرة", color: "text-blue-500", icon: Globe },
    tour: { label: t.admin.typeTour || "جولة يومية", color: "text-purple-600 dark:text-purple-400", icon: MapPin },
    car: { label: t.nav.cars || "تأجير سيارة", color: "text-lime-600 dark:text-lime-400", icon: Car },
    callback: { label: t.admin.typeCallback || "طلب اتصال", color: "text-orange-500", icon: Phone },
    contact: { label: t.admin.typeContact || "استفسار", color: "text-indigo-500", icon: MessageSquare },
    general: { label: t.admin.typeGeneral || "عام", color: "text-primary", icon: MessageSquare },
  };

  const activeDrawerBooking = useMemo(() => {
    if (!selectedBooking) return null;
    return bookings.find((b) => b.id === selectedBooking.id) || selectedBooking;
  }, [selectedBooking, bookings]);

  const parsedDrawerMsg = useMemo(() => {
    return activeDrawerBooking ? parseBookingMessage(activeDrawerBooking.message) : null;
  }, [activeDrawerBooking]);

  const totalBookingsCount = counts.new + counts.inProgress + counts.resolved;

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-6" dir="rtl">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
              إدارة الحجوزات والعمليات
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Live Operations Cockpit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-3">
            <Inbox className="text-primary size-7" />
            <span>كوكبيت الحجوزات واستفسارات العملاء</span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            إدارة فورية لحجوزات الفنادق والطيران والباقات والجولات مع التواصل التلقائي عبر الواتساب.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-primary" : ""} />
            <span>تحديث البيانات</span>
          </button>

          <div
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold shadow-xs ${
              pocketbaseConnected
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}
          >
            <Database size={13} />
            <span>
              {pocketbaseConnected ? "PocketBase متصل ومزامن" : "جاري ربط PocketBase"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Pocketbase Warning if disconnected */}
      {!pocketbaseConnected && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>
              قاعدة البيانات غير متصلة مؤقتاً، يتم استخدام الذاكرة الاحتياطية.
            </span>
          </div>
          <Link href="/admin/pocketbase" className="underline font-bold">
            إعداد الاتصال ➔
          </Link>
        </div>
      )}

      {/* 3. Upgraded Enterprise 4-KPI Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>إجمالي الحجوزات النشطة</span>
            <Inbox className="size-4 text-primary" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground font-mono">
            {totalBookingsCount}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">كافة القنوات والخدمات</p>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-blue-600 dark:text-blue-400 mb-1">
            <span>طلبات جديدة</span>
            <Circle className="size-4 fill-blue-500/20" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {counts.new}
          </p>
          <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 mt-1">تتطلب تأكيد فوري</p>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 mb-1">
            <span>قيد المعالجة والتنفيذ</span>
            <Clock className="size-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {counts.inProgress}
          </p>
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">جاري التنسيق مع المورد</p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 mb-1">
            <span>مؤكدة ومكتملة</span>
            <CheckCircle2 className="size-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {counts.resolved}
          </p>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">تم إصدار الفاوتشر</p>
        </div>
      </div>

      {/* 4. Filter Toolbar */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث باسم النزيل، رقم الهاتف، الفندق، الوجهة أو مرجع الحجز..."
            className="w-full h-10 ps-10 pe-4 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted border border-border shrink-0">
          {[
            { id: "all", label: "كافة الحالات" },
            { id: "new", label: "جديد" },
            { id: "in-progress", label: "قيد المعالجة" },
            { id: "resolved", label: "مؤكد" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as BookingStatus | "all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Type Filter */}
        <div className="relative shrink-0">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as BookingType | "all")}
            className="h-10 pe-9 ps-4 rounded-xl border border-border bg-card text-xs font-bold text-foreground cursor-pointer shadow-xs focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
          >
            {BOOKING_TYPES.map((type) => (
              <option key={type} value={type}>
                {type === "all" ? "جميع أنواع الخدمات" : typeConfig[type]?.label || type}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
        </div>
      </div>

      {/* 5. Bookings Ledger Table */}
      <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 border-b border-border bg-muted/50 text-[11px] font-black text-muted-foreground uppercase">
          <div className="col-span-3">النزيل والعميل</div>
          <div className="col-span-2">بيانات التواصل</div>
          <div className="col-span-2">الخدمة والوجهة</div>
          <div className="col-span-2">التاريخ والتوقيت</div>
          <div className="col-span-2 text-center">حالة الحجز</div>
          <div className="col-span-1 text-end">الإجراءات</div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
            <Loader2 size={24} className="animate-spin text-primary" />
            <span className="text-xs font-bold">جاري تحميل سجل الحجوزات...</span>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-muted-foreground text-center">
            <Inbox size={40} className="text-muted-foreground/40 mb-3" />
            <h3 className="text-sm font-bold text-foreground">لا توجد حجوزات مطابقة</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {searchQuery || statusFilter !== "all" || typeFilter !== "all"
                ? "جرّب تغيير فلاتر البحث أو تصفية الحالة."
                : "لم يتم تسجيل أي طلب حجز في هذا القسم بعد."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredBookings.map((booking) => {
              const statusCfg = statusConfig[booking.status] || statusConfig.new;
              const typeCfg = typeConfig[booking.type] || typeConfig.general;
              const StatusIcon = statusCfg.icon;
              const TypeIcon = typeCfg.icon;
              const parsedMsg = parseBookingMessage(booking.message);

              return (
                <div
                  key={booking.id}
                  className="p-4 sm:p-5 hover:bg-muted/30 transition-colors cursor-pointer group"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-center">
                    {/* Customer Dossier */}
                    <div className="lg:col-span-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 font-black text-xs shadow-xs">
                        {booking.name ? booking.name.slice(0, 2).toUpperCase() : "CU"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-foreground font-bold text-sm truncate group-hover:text-primary transition-colors">
                            {booking.name || "نزيل بدون اسم"}
                          </p>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            #{booking.id.slice(0, 8)}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-xs truncate dir-ltr text-end">
                          {booking.email || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Contact Phone */}
                    <div className="lg:col-span-2 flex flex-col justify-center">
                      <span className="text-xs font-mono font-medium text-foreground dir-ltr text-start">
                        {booking.phone || "—"}
                      </span>
                      {booking.phone && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                          واتساب نشط
                        </span>
                      )}
                    </div>

                    {/* Service & Destination */}
                    <div className="lg:col-span-2 flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-muted border border-border shrink-0">
                        <TypeIcon size={16} className={typeCfg.color} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          {booking.destination || booking.packageName || typeCfg.label}
                        </p>
                        <p className={`text-[10px] font-bold ${typeCfg.color}`}>
                          {typeCfg.label}
                        </p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="lg:col-span-2 flex flex-col justify-center">
                      <span className="text-xs text-foreground font-medium">
                        {new Date(booking.createdAt).toLocaleDateString(dateLocaleTag(locale), {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(booking.createdAt).toLocaleTimeString(dateLocaleTag(locale), {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Status Select */}
                    <div
                      className="lg:col-span-2 flex justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="relative w-full max-w-[150px]">
                        <select
                          value={booking.status}
                          onChange={(e) =>
                            void updateStatus(booking.id, e.target.value as BookingStatus)
                          }
                          className={`w-full appearance-none ps-7 pe-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer border ${statusCfg.bg} ${statusCfg.color} outline-none focus:ring-1 focus:ring-primary`}
                        >
                          <option value="new">جديد (بانتظار التأكيد)</option>
                          <option value="in-progress">قيد المتابعة</option>
                          <option value="resolved">مؤكد ومكتمل</option>
                        </select>
                        <StatusIcon
                          size={13}
                          className={`absolute start-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${statusCfg.color}`}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div
                      className="lg:col-span-1 flex items-center justify-end gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {booking.phone && (
                        <a
                          href={`https://wa.me/${booking.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `مرحباً ${booking.name || "عزيزي المسافر"}، بخصوص طلب حجزكم على منصة لوناليزا (${booking.destination || booking.packageName || "خدمتنا"})...`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-colors shadow-xs"
                          title="محادثة واتساب فورية"
                        >
                          <Phone size={14} />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedBooking(booking)}
                        className="w-8 h-8 rounded-xl border border-border bg-card hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-xs"
                        title="عرض الملف الكامل"
                      >
                        <Eye size={14} />
                      </button>

                      {deleteConfirmId === booking.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              void deleteBooking(booking.id);
                              setDeleteConfirmId(null);
                            }}
                            className="px-2 py-1 rounded-lg bg-red-600 text-white text-[11px] font-bold"
                          >
                            تأكيد
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 rounded-lg bg-muted text-foreground text-[11px]"
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(booking.id)}
                          className="w-8 h-8 rounded-xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400 transition-colors shadow-xs"
                          title="حذف الحجز"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Structured Details Badges (Instead of unparsed message dump) */}
                  {parsedMsg.isStructured ? (
                    <div className="mt-3 pt-2.5 border-t border-border/60 flex flex-wrap items-center gap-2 text-xs">
                      {parsedMsg.roomName && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border border-border text-foreground font-bold">
                          <BedDouble size={13} className="text-primary" />
                          <span>{parsedMsg.roomName}</span>
                        </span>
                      )}

                      {parsedMsg.datesFormatted && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted border border-border text-foreground font-medium font-mono text-[11px]">
                          <Calendar size={13} className="text-blue-500" />
                          <span>{parsedMsg.datesFormatted}</span>
                        </span>
                      )}

                      {parsedMsg.price && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                          <CreditCard size={13} />
                          <span>{parsedMsg.price}</span>
                        </span>
                      )}

                      {parsedMsg.provider && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-[10px] uppercase">
                          <Building2 size={12} />
                          <span>{parsedMsg.provider}</span>
                        </span>
                      )}

                      {parsedMsg.paymentStatus && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                          <span>{parsedMsg.paymentStatus === "pending_payment" ? "بانتظار السداد" : parsedMsg.paymentStatus}</span>
                        </span>
                      )}
                    </div>
                  ) : booking.message ? (
                    <div className="mt-2.5 pt-2 border-t border-border/60 text-xs text-muted-foreground line-clamp-1">
                      <span className="font-bold text-foreground">الملاحظة: </span>
                      <span>{booking.message}</span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Interactive Slide-Over Drawer (Guest Dossier & Detailed Sheet) */}
      {activeDrawerBooking && (
        <div className="fixed inset-0 z-[9990] flex justify-end animate-in fade-in duration-200">
          {/* Backdrop Scrim */}
          <div
            className="fixed inset-0 bg-foreground/10 backdrop-blur-xs cursor-pointer"
            onClick={() => setSelectedBooking(null)}
          />

          {/* Slide Drawer Content */}
          <div className="relative w-full max-w-[500px] h-full bg-card border-s border-border shadow-2xl z-10 flex flex-col p-6 overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black">
                  {activeDrawerBooking.name ? activeDrawerBooking.name.slice(0, 2).toUpperCase() : "BK"}
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">
                    ملف الحجز الكامل #{activeDrawerBooking.id.slice(0, 10)}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    المسجل في: {new Date(activeDrawerBooking.createdAt).toLocaleString(dateLocaleTag(locale))}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="py-5 space-y-5 flex-1">
              {/* Guest Profile Card */}
              <div className="p-4 rounded-2xl border border-border bg-muted/30 space-y-3">
                <h4 className="text-xs font-black uppercase text-muted-foreground">بيانات المسافر والعميل</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">الاسم الكامل:</span>
                    <span className="font-bold text-foreground">{activeDrawerBooking.name || "غير محدد"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">رقم الهاتف:</span>
                    <span className="font-bold text-foreground font-mono dir-ltr block text-start">
                      {activeDrawerBooking.phone || "—"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground block text-[11px]">البريد الإلكتروني:</span>
                    <span className="font-bold text-foreground font-mono">{activeDrawerBooking.email || "—"}</span>
                  </div>
                </div>

                {activeDrawerBooking.phone && (
                  <div className="pt-2 border-t border-border">
                    <a
                      href={`https://wa.me/${activeDrawerBooking.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        `مرحباً ${activeDrawerBooking.name || "عزيزي المسافر"}، يسرنا في لوناليزا تأكيد تفاصيل حجزكم الخاص بـ (${activeDrawerBooking.destination || activeDrawerBooking.packageName || "رحلتكم"})...`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <Phone size={14} />
                      <span>محادثة النزيل فوراً عبر الواتساب</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Service Details Card */}
              <div className="p-4 rounded-2xl border border-border bg-muted/30 space-y-3">
                <h4 className="text-xs font-black uppercase text-muted-foreground">تفاصيل الخدمة والوجهة</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-border/50">
                    <span className="text-muted-foreground">نوع الخدمة:</span>
                    <span className="font-bold text-foreground">{typeConfig[activeDrawerBooking.type]?.label || activeDrawerBooking.type}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border/50">
                    <span className="text-muted-foreground">الفندق / الوجهة:</span>
                    <span className="font-bold text-foreground">{activeDrawerBooking.destination || activeDrawerBooking.packageName || "—"}</span>
                  </div>

                  {parsedDrawerMsg?.roomName && (
                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground">فئة الغرفة:</span>
                      <span className="font-bold text-primary">{parsedDrawerMsg.roomName}</span>
                    </div>
                  )}

                  {parsedDrawerMsg?.datesFormatted && (
                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground">تواريخ الإقامة:</span>
                      <span className="font-bold font-mono text-foreground">{parsedDrawerMsg.datesFormatted}</span>
                    </div>
                  )}

                  {parsedDrawerMsg?.price && (
                    <div className="flex justify-between items-center py-1 border-b border-border/50">
                      <span className="text-muted-foreground">المبلغ الإجمالي:</span>
                      <span className="font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                        {parsedDrawerMsg.price}
                      </span>
                    </div>
                  )}

                  {parsedDrawerMsg?.provider && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-muted-foreground">المورد المزود:</span>
                      <span className="font-bold uppercase text-foreground">{parsedDrawerMsg.provider}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Raw Message Log */}
              {activeDrawerBooking.message && (
                <div className="p-4 rounded-2xl border border-border bg-card space-y-2">
                  <h4 className="text-xs font-black uppercase text-muted-foreground">النص المكتوب من المنظومة</h4>
                  <p className="text-xs text-foreground leading-relaxed bg-muted/50 p-3 rounded-xl border border-border/50 font-mono text-[11px]">
                    {activeDrawerBooking.message}
                  </p>
                </div>
              )}

              {/* Status Update in Drawer */}
              <div className="p-4 rounded-2xl border border-border bg-card space-y-2">
                <h4 className="text-xs font-black uppercase text-muted-foreground">تغيير حالة المعالجة</h4>
                <div className="grid grid-cols-3 gap-2">
                  {(["new", "in-progress", "resolved"] as BookingStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => void updateStatus(activeDrawerBooking.id, st)}
                      className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        activeDrawerBooking.status === st
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : "bg-muted border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {st === "new" ? "جديد" : st === "in-progress" ? "قيد المعالجة" : "مؤكد"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-border bg-muted hover:bg-card text-foreground font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Printer size={14} />
                <span>طباعة الفاوتشر</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:brightness-110 transition-all cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
