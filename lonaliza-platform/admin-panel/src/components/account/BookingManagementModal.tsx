"use client";

import { useEffect, useState } from "react";
import {
  X,
  Plane,
  Hotel,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Luggage,
  RefreshCw,
  Ban,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  CreditCard,
  CheckCircle2,
  Loader2,
  Info,
  DollarSign,
  Ticket,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/components/ui/CurrencySelector";

export interface BookingManagementModalProps {
  bookingId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type TabType = "details" | "cancel" | "modify" | "baggage";

export default function BookingManagementModal({
  bookingId,
  isOpen,
  onClose,
  onSuccess,
}: BookingManagementModalProps) {
  const { t, locale } = useLocale();
  const { currency, convert } = useCurrency();
  const [activeTab, setActiveTab] = useState<TabType>("details");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [cancelReason, setCancelReason] = useState("");
  const [refundMethod, setRefundMethod] = useState<"card" | "wallet">("card");
  const [newDepDate, setNewDepDate] = useState("");
  const [newRetDate, setNewRetDate] = useState("");
  const [modifyNotes, setModifyNotes] = useState("");
  const [selectedBaggage, setSelectedBaggage] = useState<string>("bag_10kg");

  // Live supplier quote & void states
  const [refundQuote, setRefundQuote] = useState<any>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [voiding, setVoiding] = useState(false);

  useEffect(() => {
    if (!isOpen || !bookingId) return;
    setLoading(true);
    setError("");
    setSuccessMsg("");
    setRefundQuote(null);
    setActiveTab("details");

    fetch(`/api/account/bookings/${bookingId}/post-booking`)
      .then((res) => res.json())
      .then((d) => {
        if (d.ok) {
          setData(d);
        } else {
          setError(d.error || "تعذر تحميل تفاصيل الحجز");
        }
      })
      .catch(() => setError("حدث خطأ أثناء الاتصال بالخادم"))
      .finally(() => setLoading(false));
  }, [isOpen, bookingId]);

  if (!isOpen) return null;

  const b = data?.booking;
  const caps = data?.capabilities || {};
  const policies = data?.policies || {};

  const handleQuoteRefund = async () => {
    setLoadingQuote(true);
    setError("");
    try {
      const res = await fetch(`/api/account/bookings/${bookingId}/post-booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "quote_refund" }),
      });
      const json = await res.json();
      if (json.ok && json.quote) {
        setRefundQuote(json.quote);
      } else {
        setError(json.error || "تعذر استعلام تفاصيل الاسترجاع المباشرة من المورد");
      }
    } catch {
      setError("حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoadingQuote(false);
    }
  };

  const handleVoidTicket = async () => {
    if (!confirm("تأكيد إلغاء التذكرة فوراً بنفس يوم الإصدار (Void) واسترداد كامل المبلغ بدون أي غرامة؟")) return;
    setVoiding(true);
    setError("");
    try {
      const res = await fetch(`/api/account/bookings/${bookingId}/post-booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "void" }),
      });
      const json = await res.json();
      if (json.ok) {
        setSuccessMsg(json.note || "تم إلغاء التذكرة فوراً بنفس يوم الإصدار (Void) واسترداد كامل المبلغ بنجاح.");
        if (onSuccess) onSuccess();
        setTimeout(() => {
          fetch(`/api/account/bookings/${bookingId}/post-booking`)
            .then((r) => r.json())
            .then((fresh) => {
              if (fresh.ok) setData(fresh);
            });
        }, 1000);
      } else {
        setError(json.error || "تعذر إلغاء التذكرة فوراً");
      }
    } catch {
      setError("فشل الاتصال بخادم الإلغاء الفوري");
    } finally {
      setVoiding(false);
    }
  };

  const handlePostAction = async (action: "cancel" | "modify_flight" | "add_baggage") => {
    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    let payload: any = { action };
    if (action === "cancel") {
      payload.reason = cancelReason || "طلب إلغاء من العميل";
      payload.refundMethod = refundMethod;
    } else if (action === "modify_flight") {
      if (!newDepDate) {
        setError("يرجى اختيار تاريخ السفر الجديد المطلوب");
        setSubmitting(false);
        return;
      }
      payload.details = {
        newDepartureDate: newDepDate,
        newReturnDate: newRetDate,
        notes: modifyNotes,
      };
    } else if (action === "add_baggage") {
      const opt = (data?.baggageOptions || []).find((x: any) => x.id === selectedBaggage);
      payload.details = {
        baggageOption: opt,
        weightKg: opt?.weightKg || 10,
        priceUsd: opt?.priceUsd || 45,
      };
    }

    try {
      const res = await fetch(`/api/account/bookings/${bookingId}/post-booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || "تعذر إرسال الطلب، يرجى المحاولة لاحقاً");
        return;
      }

      setSuccessMsg("تم تسجيل طلبك بنجاح وسيقوم فريق العمل بمراجعته وتحديث الحجز فوراً.");
      if (onSuccess) onSuccess();
      // Reload details
      setTimeout(() => {
        fetch(`/api/account/bookings/${bookingId}/post-booking`)
          .then((r) => r.json())
          .then((fresh) => {
            if (fresh.ok) setData(fresh);
          });
      }, 1200);
    } catch {
      setError("حدث خطأ في الاتصال، يرجى إعادة المحاولة");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="relative flex items-center justify-between border-b border-purple-900/30 bg-[#18082e] p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-amber-300 ring-1 ring-amber-400/30">
              {data?.serviceType === "flight" ? <Plane size={22} /> : <Hotel size={22} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black">{b?.title || "إدارة الحجز"}</h3>
                <span className="rounded-full bg-amber-400/15 border border-amber-400/30 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                  {b?.pnr ? `PNR: ${b.pnr}` : `#${bookingId.slice(0, 8)}`}
                </span>
              </div>
              <p className="text-xs text-purple-200/70">{b?.subtitle || "تفاصيل وخدمات ما بعد الحجز"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-purple-100 bg-purple-50/40 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`border-b-2 px-4 py-3 text-xs font-bold transition-all ${
              activeTab === "details"
                ? "border-[#280e46] text-[#280e46]"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            تفاصيل الحجز
          </button>
          {caps.canCancel && (
            <button
              type="button"
              onClick={() => setActiveTab("cancel")}
              className={`border-b-2 px-4 py-3 text-xs font-bold transition-all ${
                activeTab === "cancel"
                  ? "border-rose-600 text-rose-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              إلغاء واسترجاع
            </button>
          )}
          {caps.canModify && (
            <button
              type="button"
              onClick={() => setActiveTab("modify")}
              className={`border-b-2 px-4 py-3 text-xs font-bold transition-all ${
                activeTab === "modify"
                  ? "border-amber-600 text-amber-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              تعديل موعد الرحلة
            </button>
          )}
          {caps.canAddBaggage && (
            <button
              type="button"
              onClick={() => setActiveTab("baggage")}
              className={`border-b-2 px-4 py-3 text-xs font-bold transition-all ${
                activeTab === "baggage"
                  ? "border-amber-500 text-amber-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              إضافة وزن وأمتعة
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              <p className="mt-3 text-xs font-semibold">جارٍ استرداد تفاصيل الحجز ونقاط النهاية...</p>
            </div>
          ) : error && !data ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-sm font-bold text-rose-700">
              {error}
            </div>
          ) : (
            <div className="space-y-5">
              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
                  {error}
                </div>
              )}
              {successMsg && (
                <div className="flex items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-xs font-bold text-amber-900">
                  <CheckCircle2 size={16} className="text-amber-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* TAB 1: DETAILS */}
              {activeTab === "details" && (
                <div className="space-y-4">
                  {/* Travelpayouts Direct Partner Banner */}
                  {caps.isTravelpayouts && (
                    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sky-950">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold">حجز عبر الشريك المعتمد ({caps.travelpayoutsPartnerName})</p>
                          <p className="mt-1 text-xs text-sky-800/80 leading-relaxed">
                            تم تأكيد هذا الحجز مباشرة عبر شبكة مزودي السفر العالمية الشريكة. يمكنك إدارة حجزك مباشرة لدى الشركة الناقلة أو الاستفسار من فريقنا.
                          </p>
                        </div>
                        {caps.travelpayoutsManageUrl && (
                          <a
                            href={caps.travelpayoutsManageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white hover:bg-sky-700"
                          >
                            <span>إدارة لدى الشريك</span>
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dedicated Flight Card */}
                  {data?.flightDetails && (
                    <div className="overflow-hidden rounded-3xl border border-purple-100 bg-gradient-to-br from-white via-purple-50/20 to-amber-50/20 p-5 shadow-xs space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-100/60 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#280e46]/10 text-[#280e46]">
                            <Plane size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">
                              {data.flightDetails.airline} {data.flightDetails.flightNumber ? `(${data.flightDetails.flightNumber})` : ""}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              طراز الطائرة: {data.flightDetails.aircraft || "Airbus / Boeing"} · {data.flightDetails.cabinClass}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-900 border border-purple-200/60">
                            {data.flightDetails.fareBrand || b?.fareBrand || "Standard"}
                          </span>
                          {caps.liveSupplierStatus === "CONNECTED_LIVE" && (
                            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>ربط سيرو حي (Seeru Live)</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Flight Route and Schedule */}
                      <div className="grid items-center gap-4 sm:grid-cols-7">
                        <div className="sm:col-span-3 text-start">
                          <p className="text-xl font-black text-[#1e1b4b]">{data.flightDetails.origin}</p>
                          <p className="text-xs font-bold text-slate-700 leading-snug">{data.flightDetails.originAirport}</p>
                          {data.flightDetails.originTerminal && (
                            <span className="mt-0.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                              صالة {data.flightDetails.originTerminal}
                            </span>
                          )}
                          <p className="mt-1 text-xs text-slate-500 font-mono">
                            {new Date(data.flightDetails.departureTime).toLocaleString(locale === "ar" ? "ar-AE" : "en-US")}
                          </p>
                        </div>

                        <div className="sm:col-span-1 flex flex-col items-center justify-center text-center">
                          <span className="text-[10px] font-bold text-slate-400">{data.flightDetails.duration}</span>
                          <div className="my-1 flex w-full items-center">
                            <div className="h-0.5 flex-1 bg-gradient-to-r from-purple-200 to-amber-300" />
                            <Plane size={12} className="text-amber-500 mx-1 rotate-90" />
                            <div className="h-0.5 flex-1 bg-gradient-to-r from-amber-300 to-purple-200" />
                          </div>
                          <span className="text-[10px] font-bold text-emerald-600">
                            {data.flightDetails.stops === 0 ? "مباشر" : `${data.flightDetails.stops} محطات`}
                          </span>
                        </div>

                        <div className="sm:col-span-3 text-end">
                          <p className="text-xl font-black text-[#1e1b4b]">{data.flightDetails.destination}</p>
                          <p className="text-xs font-bold text-slate-700 leading-snug">{data.flightDetails.destinationAirport}</p>
                          {data.flightDetails.destinationTerminal && (
                            <span className="mt-0.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                              صالة {data.flightDetails.destinationTerminal}
                            </span>
                          )}
                          <p className="mt-1 text-xs text-slate-500 font-mono">
                            {new Date(data.flightDetails.arrivalTime).toLocaleString(locale === "ar" ? "ar-AE" : "en-US")}
                          </p>
                        </div>
                      </div>

                      {/* Exact Baggage Allowance */}
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-amber-50/70 border border-amber-200/80 p-3 text-xs">
                        <div className="flex items-center gap-2">
                          <Luggage size={16} className="text-amber-600" />
                          <span className="font-bold text-amber-950">الأمتعة المشمولة بالتذكرة:</span>
                          <span className="font-black text-amber-700">
                            {b?.baggageSummary || (b?.currentBaggage?.weightKg ? `${b.currentBaggage.weightKg} كجم حقيبة شحن` : "حقيبة يد 7 كجم فقط (بدون شحن)")}
                          </span>
                        </div>
                        <span className="text-[11px] text-amber-900/80">حقيبة يد مصاحبة 7 كجم مشمولة</span>
                      </div>
                    </div>
                  )}

                  {/* Summary Grid */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-purple-100 bg-purple-50/30 p-3.5">
                      <p className="text-[11px] font-bold text-slate-400 uppercase">حالة الحجز</p>
                      <p className="mt-1 text-sm font-black text-slate-900">
                        {b?.status === "paid" || b?.status === "confirmed"
                          ? "مؤكد ومفعل"
                          : b?.status === "cancelled"
                          ? "ملغي"
                          : "قيد المعالجة"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-purple-100 bg-purple-50/30 p-3.5">
                      <p className="text-[11px] font-bold text-slate-400 uppercase">المبلغ الإجمالي</p>
                      <p className="mt-1 text-sm font-black text-amber-600 font-mono">
                        ${b?.price || 0} USD
                      </p>
                    </div>
                    <div className="rounded-2xl border border-purple-100 bg-purple-50/30 p-3.5">
                      <p className="text-[11px] font-bold text-slate-400 uppercase">رقم المرجع (PNR)</p>
                      <p className="mt-1 text-sm font-black font-mono text-slate-900">
                        {b?.pnr || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Passengers Roster */}
                  {data?.passengers?.length > 0 && (
                    <div className="rounded-3xl border border-purple-100 bg-white p-4 shadow-xs space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Ticket size={15} className="text-purple-600" />
                        <span>بيانات المسافرين والتذاكر ({data.passengers.length})</span>
                      </h4>
                      <div className="divide-y divide-slate-100">
                        {data.passengers.map((p: any, idx: number) => (
                          <div key={idx} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs">
                            <div>
                              <p className="font-black text-slate-900">{p.name}</p>
                              <p className="text-[11px] text-slate-500">
                                رقم الجواز: {p.passportNumber || "—"} · الجنسية: {p.nationality || "SA"} · المقعد: {p.seat}
                              </p>
                            </div>
                            <div className="text-end">
                              <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[11px] font-bold text-slate-700">
                                {p.ticketNumber}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  {data?.priceBreakdown && (
                    <div className="rounded-3xl border border-purple-100 bg-purple-50/15 p-4 space-y-2 text-xs">
                      <h4 className="text-xs font-bold text-slate-900">تفاصيل التسعير والضرائب:</h4>
                      <div className="flex justify-between text-slate-600">
                        <span>أجرة التذكرة الأساسية (Base Fare):</span>
                        <span className="font-mono font-bold">${data.priceBreakdown.baseFare} USD</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>الضرائب والرسوم والمطارات (Taxes & Fees):</span>
                        <span className="font-mono font-bold">${data.priceBreakdown.taxesAndFees} USD</span>
                      </div>
                      <div className="border-t border-purple-100/60 pt-2 flex justify-between font-black text-slate-900">
                        <span>الإجمالي الكلي:</span>
                        <span className="font-mono text-amber-600 font-bold">${data.priceBreakdown.total} USD</span>
                      </div>
                    </div>
                  )}

                  {/* Policies Section */}
                  <div className="rounded-2xl border border-purple-100 bg-purple-50/20 p-4 space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck size={16} className="text-amber-500" />
                      <span>سياسات الموزع وقوانين التذكرة</span>
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {policies.cancellation || "تخضع الرحلة لسياسات المورد وقواعد الأسعار العالمية."}
                    </p>
                    {policies.modification && (
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {policies.modification}
                      </p>
                    )}
                  </div>

                  {/* Existing Post-Booking Requests Log */}
                  {data?.postBookingRequests?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-800">سجل طلبات ما بعد الحجز السابقة:</h4>
                      <div className="space-y-2">
                        {data.postBookingRequests.map((reqItem: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <Badge className="bg-[#280e46] text-amber-300 font-mono">{reqItem.action}</Badge>
                              <span className="text-slate-600">{new Date(reqItem.createdAt).toLocaleString(locale === "ar" ? "ar-AE" : "en-US")}</span>
                            </div>
                            <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                              {reqItem.status === "pending_admin" ? "قيد مراجعة الإدارة" : reqItem.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* WhatsApp Support Direct Button */}
                  <div className="pt-2 flex justify-end">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`مرحباً فريق لوناليزا، أود الاستفسار عن حجزي رقم: ${b?.pnr || bookingId}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#eab308] hover:brightness-110 px-4 py-2.5 text-xs font-black text-[#18082e] shadow-md shadow-amber-500/20 transition-all"
                    >
                      <MessageCircle size={15} />
                      <span>طلب مساعدة فورية عبر الواتساب</span>
                    </a>
                  </div>
                </div>
              )}

              {/* TAB 2: CANCEL & REFUND */}
              {activeTab === "cancel" && (
                <div className="space-y-4">
                  {/* Live Refund Quote Tool for Suppliers */}
                  {caps.supportsAutomatedSupplierRefund && (
                    <div className="rounded-3xl border border-purple-100 bg-purple-50/40 p-4 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-xs font-bold text-purple-950">استعلام فوري لرسوم المورد (Live Refund Quote)</h4>
                          <p className="text-[11px] text-purple-900/70 leading-relaxed">
                            فحص غرامة إلغاء الناقل الجوي وصافي المبلغ المسترد لك مباشرة من نظام المورد {b?.provider?.toUpperCase() || "سيرو"}.
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={loadingQuote}
                          onClick={handleQuoteRefund}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-purple-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-purple-800 disabled:opacity-60 transition-colors cursor-pointer"
                        >
                          {loadingQuote ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                          <span>فحص الرسوم المباشرة</span>
                        </button>
                      </div>

                      {refundQuote && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs space-y-2 animate-in fade-in">
                          <p className="font-bold text-emerald-950 flex items-center gap-1.5">
                            <CheckCircle2 size={15} className="text-emerald-600" />
                            <span>تفاصيل الاسترجاع المباشرة المعتمدة:</span>
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-center pt-1">
                            <div className="rounded-xl bg-white p-2.5 border border-emerald-100 shadow-2xs">
                              <p className="text-[10px] font-bold text-slate-400">غرامة الإلغاء المفروضة</p>
                              <p className="text-sm font-black text-rose-600 font-mono">${refundQuote.penaltyAmount || 0} USD</p>
                            </div>
                            <div className="rounded-xl bg-white p-2.5 border border-emerald-100 shadow-2xs">
                              <p className="text-[10px] font-bold text-slate-400">صافي المبلغ المسترد لك</p>
                              <p className="text-sm font-black text-emerald-600 font-mono">${refundQuote.refundAmount || 0} USD</p>
                            </div>
                          </div>
                          {refundQuote.canVoid && (
                            <div className="mt-2 rounded-xl bg-amber-100/70 border border-amber-300 p-2.5 text-[11px] text-amber-950 flex items-center justify-between gap-2">
                              <span>التذكرة مؤهلة للإلغاء الفوري (Void) بنفس يوم الإصدار بدون أي غرامة!</span>
                              <button
                                type="button"
                                disabled={voiding}
                                onClick={handleVoidTicket}
                                className="shrink-0 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 cursor-pointer"
                              >
                                {voiding ? "جارٍ الإلغاء..." : "إلغاء فوري كامل (Void)"}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-amber-900 text-xs leading-relaxed space-y-1.5">
                    <p className="font-bold flex items-center gap-1.5 text-amber-950">
                      <AlertTriangle size={16} />
                      <span>تنبيه سياسة الإلغاء والاسترجاع</span>
                    </p>
                    <p>
                      {b?.freeCancellation
                        ? "هذا الحجز مؤهل للإلغاء المجاني وفق اشتراطات الموزع قبل موعد السفر المحدد."
                        : "قد يطبق الناقل الجوي أو مزود الفندق غرامة إلغاء يتم خصمها من المبلغ المسترد."}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      طريقة استلام المبلغ المسترد:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex cursor-pointer items-center gap-2.5 rounded-2xl border p-3 text-xs font-bold transition-all ${
                          refundMethod === "card"
                            ? "border-amber-500 bg-amber-50/60 text-amber-950 shadow-sm"
                            : "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="refundMethod"
                          checked={refundMethod === "card"}
                          onChange={() => setRefundMethod("card")}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <CreditCard size={16} className={refundMethod === "card" ? "text-amber-600" : "text-slate-400"} />
                        <span>البطاقة البنكية الأصلية</span>
                      </label>
                      <label
                        className={`flex cursor-pointer items-center gap-2.5 rounded-2xl border p-3 text-xs font-bold transition-all ${
                          refundMethod === "wallet"
                            ? "border-amber-500 bg-amber-50/60 text-amber-950 shadow-sm"
                            : "border-slate-200 bg-white text-slate-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="refundMethod"
                          checked={refundMethod === "wallet"}
                          onChange={() => setRefundMethod("wallet")}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <DollarSign size={16} className={refundMethod === "wallet" ? "text-amber-600" : "text-slate-400"} />
                        <span>رصيد فوري بمحفظة لوناليزا</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      سبب طلب الإلغاء (اختياري):
                    </label>
                    <textarea
                      rows={3}
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="اذكر سبب الإلغاء لمساعدة فريق العمل في تقديم أفضل حل..."
                      className="w-full rounded-2xl border border-slate-200 p-3 text-xs outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handlePostAction("cancel")}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-600 py-3 text-xs font-bold text-white hover:bg-rose-700 transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
                    <span>تأكيد وإرسال طلب الإلغاء للإدارة والموزع</span>
                  </button>
                </div>
              )}

              {/* TAB 3: MODIFY FLIGHT */}
              {activeTab === "modify" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-purple-200 bg-purple-50/60 p-4 text-purple-950 text-xs leading-relaxed">
                    <p className="font-bold flex items-center gap-1.5">
                      <RefreshCw size={15} className="text-purple-700" />
                      <span>شروط تعديل موعد الرحلة</span>
                    </p>
                    <p className="mt-1 text-purple-900/80">
                      يخضع تعديل موعد التذكرة لتوافر المقاعد على نفس درجة السفر لدى شركة الطيران، وسيتم فحص فروقات الأسعار وغرامة التعديل ومشاركتها معك للموافقة قبل الخصم.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        تاريخ الذهاب الجديد المطلوب:
                      </label>
                      <input
                        type="date"
                        value={newDepDate}
                        onChange={(e) => setNewDepDate(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 p-3 text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        تاريخ العودة الجديد (إن وجد):
                      </label>
                      <input
                        type="date"
                        value={newRetDate}
                        onChange={(e) => setNewRetDate(e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 p-3 text-xs outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      ملاحظات أو توقيت الرحلة المفضل:
                    </label>
                    <textarea
                      rows={2}
                      value={modifyNotes}
                      onChange={(e) => setModifyNotes(e.target.value)}
                      placeholder="مثال: أفضل الرحلات الصباحية أو المباشرة بدون ترانزيت..."
                      className="w-full rounded-2xl border border-slate-200 p-3 text-xs outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handlePostAction("modify_flight")}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#eab308] hover:brightness-110 py-3 text-xs font-black text-[#18082e] shadow-md shadow-amber-500/20 transition-all disabled:opacity-60"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    <span>إرسال طلب فحص وتعديل الموعد للأدمن</span>
                  </button>
                </div>
              )}

              {/* TAB 4: ADD BAGGAGE */}
              {activeTab === "baggage" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-amber-950 text-xs leading-relaxed">
                    <p className="font-bold flex items-center gap-1.5">
                      <Luggage size={16} className="text-amber-600" />
                      <span>إضافة وزن وأمتعة إضافية على التذكرة</span>
                    </p>
                    <p className="mt-1 text-amber-900/80">
                      اختر الوزن المطلوب إضافته لرحلتك، وسيتم إصدار قسيمة الأمتعة الرسمية (EMD) المعتمدة وربطها برقم تذكرتك في المطار مباشرة.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {(data?.baggageOptions || []).map((opt: any) => (
                      <label
                        key={opt.id}
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border p-3.5 transition-all ${
                          selectedBaggage === opt.id
                            ? "border-amber-500 bg-amber-50/50 shadow-sm ring-1 ring-amber-400/30"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="baggageOption"
                            checked={selectedBaggage === opt.id}
                            onChange={() => setSelectedBaggage(opt.id)}
                            className="text-amber-600 focus:ring-amber-500"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{opt.label}</p>
                            <p className="text-[11px] text-slate-500">وزن إضافي معتمد على بطاقة الصعود</p>
                          </div>
                        </div>
                        <span className="text-sm font-black text-amber-600 font-mono">
                          ${opt.priceUsd} USD
                        </span>
                      </label>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handlePostAction("add_baggage")}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#d97706] via-[#f59e0b] to-[#eab308] hover:brightness-110 py-3 text-xs font-black text-[#18082e] shadow-md shadow-amber-500/20 transition-all disabled:opacity-60"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Luggage size={16} />}
                    <span>تأكيد إضافة الوزن وإرسال الطلب</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
