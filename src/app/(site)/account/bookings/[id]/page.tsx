"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Plane,
  Hotel,
  Car,
  Bus,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Share2,
  Luggage,
  Sliders,
  ShieldCheck,
  CreditCard,
  Printer,
  Copy,
  Check,
  MessageCircle,
  UserRound,
  FileText,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Sparkles,
  Info,
  Receipt,
  Send,
} from "lucide-react";
import AirlineLogo from "@/components/flights/AirlineLogo";
import { Badge } from "@/components/ui/badge";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import NativeAppBar from "@/components/chrome/NativeAppBar";
import {
  customerFacingCopy,
  fareRulePills,
  formatDurationLabel,
  formatFlightClock,
} from "@/lib/account/booking-display";

type BookingDetailResponse = {
  ok: boolean;
  serviceType: "flight" | "hotel" | "car" | "transfer" | "tour" | "package" | "enquiry";
  booking: {
    id: string;
    title: string;
    subtitle: string;
    checkIn?: string;
    checkOut?: string;
    price: number;
    currency: string;
    status: string;
    paymentStatus: string;
    pnr: string;
    provider: string;
    freeCancellation: boolean;
    cancelStatus: string;
    cancelReason?: string;
    cancelAdminNote?: string;
    refundAmount?: number;
  };
  flightDetails?: {
    airline: string;
    airlineCode: string;
    flightNumber: string;
    aircraft?: string;
    origin: string;
    originAirport: string;
    originTerminal?: string;
    destination: string;
    destinationAirport: string;
    destinationTerminal?: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    stops: number;
    cabinClass: string;
    fareBrand?: string;
    durationMinutes?: number;
    returnFlight?: {
      flightNumber: string;
      origin: string;
      destination: string;
      departureTime: string;
      arrivalTime: string;
      duration: string;
    };
  };
  hotelDetails?: {
    hotelName: string;
    stars: number;
    address: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    guests: string;
    boardType: string;
  };
  serviceDetails?: {
    categoryName: string;
    vehicleModel?: string;
    pickupLocation?: string;
    dropoffLocation?: string;
    guideLanguage?: string;
    inclusions: string[];
  };
  passengers?: Array<{
    name: string;
    type: string;
    ticketNumber: string;
    seat: string;
    baggage: string;
    meal: string;
    passportNumber?: string;
  }>;
  priceBreakdown?: {
    baseFare: number;
    taxesAndFees: number;
    ancillaryFee: number;
    discount: number;
    total: number;
  };
  capabilities?: {
    canCancel: boolean;
    canModify: boolean;
    canAddBaggage: boolean;
    freeCancellation: boolean;
    cancellationDeadline?: string;
    supportsAutomatedSupplierRefund: boolean;
    isTravelpayouts: boolean;
    refundGuarantee?: boolean;
    flexChange?: boolean;
  };
  lonalizaServices?: Array<{
    id: string;
    kind: string;
    title: string;
    amount: number;
    currency?: string;
    terms?: string;
  }>;
  baggageOptions?: Array<{
    id: string;
    weightKg: number;
    price: number;
    currency: string;
    description: string;
  }>;
  policies?: {
    cancellation: string;
    modification: string;
  };
  postBookingRequests?: Array<{
    id: string;
    type: string;
    date: string;
    status: string;
    details: string;
  }>;
};

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const bookingId = resolvedParams.id;
  const { t, locale, dir } = useLocale();
  const bc = t.bookingConfirm;
  const { currency, convert } = useCurrency();

  const [data, setData] = useState<BookingDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedPnr, setCopiedPnr] = useState(false);
  const [activeActionTab, setActiveActionTab] = useState<"baggage" | "modify" | "cancel" | "support">("support");

  // Action states
  const [selectedBaggage, setSelectedBaggage] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [actionErr, setActionErr] = useState("");
  const [modifyDate, setModifyDate] = useState("");
  const [modifyNotes, setModifyNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [cancelAgreed, setCancelAgreed] = useState(false);
  const [docModalType, setDocModalType] = useState<"ticket" | "invoice" | null>(null);
  const [invoiceData, setInvoiceData] = useState<any | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string>("");
  const [isDispatching, setIsDispatching] = useState(false);

  const fetchInvoiceIfNeeded = async () => {
    if (!invoiceData) {
      setLoadingInvoice(true);
      try {
        const res = await fetch(`/api/account/invoices/${bookingId}`);
        const invJson = await res.json();
        if (invJson.ok && invJson.invoice) {
          setInvoiceData(invJson.invoice);
        }
      } catch {
        /* ignore */
      } finally {
        setLoadingInvoice(false);
      }
    }
  };

  const openInvoiceModal = async () => {
    setDocModalType("invoice");
    setDispatchStatus("");
    await fetchInvoiceIfNeeded();
  };

  const openTicketModal = async () => {
    setDocModalType("ticket");
    setDispatchStatus("");
    await fetchInvoiceIfNeeded();
  };

  const handleSendInvoice = async () => {
    setIsDispatching(true);
    setDispatchStatus("");
    try {
      const res = await fetch("/api/account/invoices/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, channel: "both", lang: locale }),
      });
      const data = await res.json();
      if (data.ok) {
        setDispatchStatus("تم إرسال الفاتورة والباركود بنجاح كملف PDF إلى رقم الواتساب والبريد الإلكتروني المسجل!");
      } else {
        setDispatchStatus("تم تسجيل طلب الإرسال وجارٍ تسليم الرسالة.");
      }
    } catch {
      setDispatchStatus("تعذر إرسال الإشعار، يرجى المحاولة لاحقاً.");
    } finally {
      setIsDispatching(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/account/bookings/${bookingId}/post-booking`)
      .then((res) => {
        if (!res.ok) throw new Error(t.errors.bookingLoadFailed);
        return res.json();
      })
      .then((resData: BookingDetailResponse) => {
        if (cancelled) return;
        if (!resData.ok) {
          setError(t.errors.bookingNotFound);
        } else {
          setData(resData);
          // Set sensible active action tab based on capabilities
          if (resData.capabilities?.canAddBaggage) {
            setActiveActionTab("baggage");
            if (resData.baggageOptions?.[0]) setSelectedBaggage(resData.baggageOptions[0].id);
          } else if (resData.capabilities?.canModify) {
            setActiveActionTab("modify");
          } else if (resData.capabilities?.canCancel) {
            setActiveActionTab("cancel");
          } else {
            setActiveActionTab("support");
          }
        }
      })
      .catch(() => {
        if (!cancelled) setError(t.errors.bookingLoadFailed);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Also preload invoice and e-Archive verification status
    fetch(`/api/account/invoices/${bookingId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((inv) => {
        if (!cancelled && inv?.ok && inv?.invoice) {
          setInvoiceData(inv.invoice);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const copyPnr = () => {
    if (!data?.booking?.pnr) return;
    navigator.clipboard.writeText(data.booking.pnr);
    setCopiedPnr(true);
    setTimeout(() => setCopiedPnr(false), 2000);
  };

  const formatPrice = (amount?: number, sourceCur = "USD") => {
    const val = Number(amount) || 0;
    const n = convert(val, sourceCur);
    return `${currency.symbol}${n.toLocaleString(locale === "ar" ? "ar-AE" : locale === "tr" ? "tr-TR" : "en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handlePostBookingAction = async (actionType: "cancel" | "modify_flight" | "add_baggage") => {
    setActionLoading(true);
    setActionMsg("");
    setActionErr("");

    let payload: Record<string, unknown> = { action: actionType };
    if (actionType === "add_baggage") {
      const opt = data?.baggageOptions?.find((b) => b.id === selectedBaggage);
      payload.details = opt || { id: selectedBaggage };
    } else if (actionType === "modify_flight") {
      if (!modifyDate && !modifyNotes) {
        setActionErr("يرجى تحديد التاريخ أو تفاصيل التعديل المطلوبة");
        setActionLoading(false);
        return;
      }
      payload.details = { newDate: modifyDate, notes: modifyNotes };
    } else if (actionType === "cancel") {
      if (!cancelAgreed) {
        setActionErr("يرجى تأكيد الموافقة على شروط وسياسة الإلغاء");
        setActionLoading(false);
        return;
      }
      payload.reason = cancelReason || "طلب إلغاء الحجز من العميل";
    }

    try {
      const res = await fetch(`/api/account/bookings/${bookingId}/post-booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setActionErr(json.error || "تعذر تنفيذ الطلب، يرجى المحاولة لاحقاً");
        return;
      }
      setActionMsg(json.note || "تم استلام طلبك بنجاح وسيتم إشعارك فور تدقيقه وتنفيذه.");
    } catch {
      setActionErr("حدث خطأ في الاتصال بالخادم");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div dir={dir} className="lonaliza-web-header-offset min-h-screen bg-slate-100/90 pb-20 pt-28">
        <NativeAppBar
          title={bc.detailsTitle}
          fallbackHref="/account?tab=bookings"
          titleWrap
        />
        <div className="mx-auto max-w-5xl px-4 pt-10 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-900 shadow-inner">
            <Loader2 size={32} className="animate-spin text-[#280e46]" />
          </div>
          <p className="mt-4 text-sm font-bold text-slate-700">{bc.loadingDetails}</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div dir={dir} className="lonaliza-web-header-offset min-h-screen bg-slate-100/90 pb-20 pt-28">
        <NativeAppBar
          title={bc.detailsTitle}
          fallbackHref="/account?tab=bookings"
          titleWrap
        />
        <div className="mx-auto max-w-lg px-4 pt-8 text-center">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
            <AlertCircle size={48} className="mx-auto text-rose-500" />
            <h2 className="mt-4 text-xl font-bold text-slate-900">{error || bc.notFound}</h2>
            <p className="mt-2 text-xs text-slate-500">{bc.notFoundHint}</p>
          </div>
        </div>
      </div>
    );
  }

  const { booking, flightDetails, hotelDetails, serviceDetails, passengers, priceBreakdown, capabilities, policies } = data;
  const isFlight = data.serviceType === "flight";
  const isHotel = data.serviceType === "hotel";
  const isTransferOrCar = data.serviceType === "car" || data.serviceType === "transfer";
  const isTour = data.serviceType === "tour" || data.serviceType === "package";

  const hasAnyCapability =
    Boolean(capabilities?.canCancel) ||
    Boolean(capabilities?.canModify) ||
    Boolean(capabilities?.canAddBaggage);

  const getServiceBadge = () => {
    if (isFlight) return { label: bc.confirmedFlight, icon: <Plane size={16} /> };
    if (isHotel) return { label: bc.confirmedHotel, icon: <Hotel size={16} /> };
    if (data.serviceType === "car") return { label: bc.confirmedCar, icon: <Car size={16} /> };
    if (data.serviceType === "transfer") return { label: bc.confirmedTransfer, icon: <Bus size={16} /> };
    if (isTour) return { label: bc.confirmedTour, icon: <MapPin size={16} /> };
    return { label: bc.confirmedGeneric, icon: <FileText size={16} /> };
  };

  const serviceInfo = getServiceBadge();

  return (
    <div dir={dir} className="lonaliza-web-header-offset min-h-screen bg-slate-100/90 pb-36 pt-28">
      <NativeAppBar
        title={booking.title || bc.detailsTitle}
        fallbackHref="/account?tab=bookings"
        titleWrap
        trailing={
          <span className="max-w-[9.5rem] truncate rounded-xl border border-purple-200 bg-purple-100 px-2.5 py-1 font-mono text-[11px] font-bold text-purple-950">
            #{booking.id}
          </span>
        }
      />
      <div className="mx-auto max-w-5xl space-y-6 px-4 pt-4 sm:px-6">

        {/* Master Booking Header Card */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-100 bg-gradient-to-r from-purple-50/90 via-white to-amber-50/50 p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#280e46] text-amber-300 ring-2 ring-amber-400/40 shadow-md">
                  {serviceInfo.icon}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-purple-100 border border-purple-200 px-3 py-0.5 text-xs font-bold text-purple-900">
                      {serviceInfo.label}
                    </span>
                    {booking.freeCancellation && (
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-0.5 text-xs font-bold text-emerald-700">
                        {bc.freeCancel}
                      </span>
                    )}
                    {booking.cancelStatus === "pending_admin" && (
                      <span className="rounded-full bg-amber-100 border border-amber-300 px-3 py-0.5 text-xs font-bold text-amber-900">
                        {bc.refundPending}
                      </span>
                    )}
                    {booking.status === "cancelled" && (
                      <span className="rounded-full bg-rose-100 border border-rose-300 px-3 py-0.5 text-xs font-bold text-rose-900">
                        {bc.cancelledRefunded}
                      </span>
                    )}
                  </div>
                  <h1 className="mt-2 text-xl font-black text-slate-900 sm:text-2xl">{booking.title}</h1>
                  <p className="mt-0.5 text-xs text-slate-500 font-medium">{booking.subtitle}</p>
                </div>
              </div>

              {/* Price & PNR Box */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-200 gap-3">
                <div className="text-start sm:text-end">
                  <p className="text-[11px] font-bold text-slate-500 tracking-wider">{bc.totalPaid}</p>
                  <p className="text-2xl sm:text-3xl font-black text-[#18082e] font-mono">
                    {formatPrice(booking.price, booking.currency)}
                  </p>
                </div>

                {booking.pnr && (
                  <div className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 shadow-sm">
                    <span className="text-[10px] font-bold text-amber-900">PNR:</span>
                    <span className="font-mono text-xs font-black text-amber-950">{booking.pnr}</span>
                    <button
                      type="button"
                      onClick={copyPnr}
                      className="ms-1 rounded p-1 text-amber-800 hover:bg-amber-200 transition-colors"
                      title={bc.copyPnr}
                    >
                      {copiedPnr ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Document actions — primary / secondary / outline hierarchy */}
          <div className="grid grid-cols-2 gap-2 border-b border-slate-200 bg-slate-50/90 p-4 sm:p-5">
            <button
              type="button"
              onClick={openTicketModal}
              className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#2E1065] px-4 text-xs font-black text-white shadow-sm"
            >
              {isFlight ? <Plane size={15} /> : isHotel ? <Hotel size={15} /> : <FileText size={15} />}
              <span>
                {isFlight
                  ? bc.eTicket
                  : isHotel
                    ? bc.hotelVoucher
                    : bc.serviceVoucher}
              </span>
            </button>

            <button
              type="button"
              onClick={openInvoiceModal}
              className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 text-xs font-black text-[#18082e] shadow-sm"
            >
              <Receipt size={15} />
              <span>{bc.taxInvoice}</span>
            </button>

            <a
              href={
                isFlight
                  ? `/api/account/bookings/${booking.id}/ticket/pdf?lang=${locale}`
                  : `/api/account/bookings/${booking.id}/voucher/pdf?lang=${locale}`
              }
              download
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-indigo-200 bg-white px-3 text-xs font-bold text-indigo-950"
            >
              <Download size={14} />
              <span>{bc.ticketPdf}</span>
            </a>

            <a
              href={`/api/account/invoices/${booking.id}/pdf?lang=${locale}`}
              download
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-amber-200 bg-white px-3 text-xs font-bold text-amber-950"
            >
              <Download size={14} />
              <span>{bc.invoicePdf}</span>
            </a>

            {invoiceData?.eArchive?.invoiceNumber && (
              <a
                href={`/api/account/invoices/${booking.id}/earchive`}
                download={`e-Arsiv-${invoiceData.eArchive.invoiceNumber}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-rose-200 bg-white px-3 text-xs font-bold text-rose-950"
              >
                <Download size={14} />
                <span>e-Arşiv PDF</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-800"
            >
              <Printer size={14} />
              <span>{bc.printQuick}</span>
            </button>

            <a
              href={`https://wa.me/905015709201?text=${encodeURIComponent(
                `🧾 مرحباً، هذه تذكرة وفاتورة حجز لوناليزا الرسمية:\nالخدمة: ${booking.title}\nرمز PNR: ${booking.pnr || booking.id}\nالمبلغ المسدد: $${booking.price} ${booking.currency}\nرابط الفاتورة الموثقة: https://lonaliza.com/invoice/verify?id=${booking.id}&inv=INV-${(booking.pnr || booking.id).slice(0, 8).toUpperCase()}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-2xl border border-emerald-300 bg-emerald-50 px-3 text-xs font-bold text-emerald-800"
            >
              <MessageCircle size={14} />
              <span>{bc.whatsapp}</span>
            </a>
          </div>

          {/* Main Details Body */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* 1. FLIGHT DETAILS (ONLY RENDERED FOR FLIGHTS) */}
            {isFlight && flightDetails && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black text-slate-900 tracking-wider flex items-center gap-2 min-w-0">
                    <Plane size={16} className="text-purple-700 shrink-0" />
                    <span className="whitespace-normal break-words">{bc.flightRouteTitle}</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-500 font-mono shrink-0">{flightDetails.flightNumber}</span>
                </div>

                {/* Outbound Flight Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200">
                        <AirlineLogo
                          name={flightDetails.airline}
                          code={flightDetails.airlineCode}
                          size="md"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm">{flightDetails.airline}</p>
                        <p className="text-xs text-slate-500">
                          {flightDetails.flightNumber} · {flightDetails.aircraft || bc.commercialAircraft}
                        </p>
                      </div>
                    </div>
                    <div className="flex max-w-full flex-wrap gap-1.5">
                      {(fareRulePills(flightDetails.cabinClass || flightDetails.fareBrand || "")).map((pill) => (
                        <span
                          key={pill}
                          className="inline-flex max-w-full rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-[11px] font-bold leading-snug text-purple-900 whitespace-normal break-words"
                        >
                          {pill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Route Timeline */}
                  <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Origin */}
                    <div className="text-center md:text-start min-w-[140px]">
                      <p className="text-2xl font-black text-slate-900 font-mono">
                        {formatFlightClock(flightDetails.departureTime) || bc.timeUnknown}
                      </p>
                      <p className="text-sm font-bold text-purple-950 mt-0.5">{flightDetails.origin}</p>
                      <p className="text-xs text-slate-500">{flightDetails.originAirport}</p>
                      {flightDetails.originTerminal && (
                        <p className="text-[11px] font-semibold text-amber-700 mt-1">{flightDetails.originTerminal}</p>
                      )}
                    </div>

                    {/* Flight Path Graphic */}
                    <div className="flex-1 flex flex-col items-center px-4 w-full">
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Clock size={12} />
                        {formatDurationLabel(flightDetails.durationMinutes, locale) || flightDetails.duration}
                      </span>
                      <div className="relative my-2 w-full flex items-center justify-center">
                        <div className="h-0.5 w-full bg-slate-200" />
                        <div className="absolute flex h-7 w-7 items-center justify-center rounded-full bg-[#280e46] text-amber-300 shadow-sm">
                          <Plane size={13} className="rtl:-scale-x-100" />
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700">
                        {flightDetails.stops === 0 ? bc.directFlight : bc.stopsLabel(flightDetails.stops)}
                      </span>
                    </div>

                    {/* Destination */}
                    <div className="text-center md:text-end min-w-[140px]">
                      <p className="text-2xl font-black text-slate-900 font-mono">
                        {formatFlightClock(flightDetails.arrivalTime) || bc.timeUnknown}
                      </p>
                      <p className="text-sm font-bold text-purple-950 mt-0.5">{flightDetails.destination}</p>
                      <p className="text-xs text-slate-500">{flightDetails.destinationAirport}</p>
                      {flightDetails.destinationTerminal && (
                        <p className="text-[11px] font-semibold text-amber-700 mt-1">
                          {flightDetails.destinationTerminal}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Return Flight if exists */}
                  {flightDetails.returnFlight && (
                    <div className="mt-6 pt-5 border-t border-slate-100">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900">
                          {bc.returnFlight}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          {flightDetails.returnFlight.flightNumber} · {flightDetails.returnFlight.duration}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">
                        <div>
                          <span className="font-bold">{flightDetails.returnFlight.origin}</span>
                          <p className="text-slate-500 text-[11px]">
                            {flightDetails.returnFlight.departureTime.slice(0, 10)}
                            {formatFlightClock(flightDetails.returnFlight.departureTime)
                              ? ` (${formatFlightClock(flightDetails.returnFlight.departureTime)})`
                              : ""}
                          </p>
                        </div>
                        <Plane size={14} className="text-slate-400 rtl:-scale-x-100" />
                        <div className="text-end">
                          <span className="font-bold">{flightDetails.returnFlight.destination}</span>
                          <p className="text-slate-500 text-[11px]">
                            {flightDetails.returnFlight.arrivalTime.slice(0, 10)}
                            {formatFlightClock(flightDetails.returnFlight.arrivalTime)
                              ? ` (${formatFlightClock(flightDetails.returnFlight.arrivalTime)})`
                              : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. HOTEL DETAILS (ONLY RENDERED FOR HOTELS) */}
            {isHotel && hotelDetails && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 tracking-wider flex items-center gap-2">
                  <Hotel size={16} className="text-purple-700" />
                  <span className="whitespace-normal break-words">{bc.hotelStayTitle}</span>
                </h3>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold mb-1">
                        {"★".repeat(hotelDetails.stars || 4)}
                        <span className="text-slate-700 ms-1">{bc.starHotel(hotelDetails.stars || 4)}</span>
                      </div>
                      <h4 className="text-base font-black text-slate-900">{hotelDetails.hotelName}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-rose-500 shrink-0" />
                        <span>{hotelDetails.address}</span>
                      </p>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs self-start">
                      {hotelDetails.boardType}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-slate-400 font-bold">{bc.checkIn}</p>
                      <p className="font-bold text-slate-900 mt-1">{hotelDetails.checkIn.slice(0, 10)}</p>
                      <p className="text-[11px] text-slate-500">{bc.fromAfternoon}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-slate-400 font-bold">{bc.checkOut}</p>
                      <p className="font-bold text-slate-900 mt-1">{hotelDetails.checkOut.slice(0, 10)}</p>
                      <p className="text-[11px] text-slate-500">{bc.untilNoon}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-slate-400 font-bold">{bc.stayLength}</p>
                      <p className="font-bold text-purple-900 mt-1">{bc.nightsCount(hotelDetails.nights || 0)}</p>
                      <p className="text-[11px] text-slate-500">{hotelDetails.guests}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-slate-400 font-bold">{bc.roomCategory}</p>
                      <p className="font-bold text-slate-900 mt-1 truncate">{hotelDetails.roomType}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. TRANSFER / CAR / TOUR DETAILS */}
            {(isTransferOrCar || isTour) && serviceDetails && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Car size={16} className="text-purple-700" />
                  <span className="whitespace-normal break-words">{bc.serviceFeaturesTitle}</span>
                </h3>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <p className="text-xs font-bold text-purple-700">{serviceDetails.categoryName}</p>
                      <p className="text-base font-black text-slate-900 mt-0.5">{serviceDetails.vehicleModel || booking.title}</p>
                    </div>
                    {serviceDetails.guideLanguage && (
                      <Badge className="bg-amber-50 text-amber-900 border-amber-300 text-xs">
                        {serviceDetails.guideLanguage}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="font-bold text-slate-800">{bc.includedInBooking}</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {serviceDetails.inclusions.map((inc, i) => (
                        <div key={i} className="flex items-start gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                          <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                          <span className="text-slate-700 font-medium">{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. PASSENGERS TABLE (For Flights) */}
            {isFlight && passengers && passengers.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <UserRound size={16} className="text-purple-700" />
                  <span className="whitespace-normal break-words">{bc.passengersTitle}</span>
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <table className="w-full text-start text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold">
                      <tr>
                        <th className="p-3.5 text-start">{bc.passengerName}</th>
                        <th className="p-3.5 text-start">{bc.eTicketNumber}</th>
                        <th className="p-3.5 text-start">{bc.seat}</th>
                        <th className="p-3.5 text-start">{bc.baggageAllowance}</th>
                        <th className="p-3.5 text-start">{bc.meal}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {passengers.map((p, i) => (
                        <tr key={i} className="hover:bg-purple-50/20 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-900">
                              {i + 1}
                            </span>
                            <span>{p.name}</span>
                          </td>
                          <td className="p-3.5 font-mono text-purple-900 font-semibold">{p.ticketNumber}</td>
                          <td className="p-3.5 font-bold text-slate-900">{p.seat}</td>
                          <td className="p-3.5 text-slate-600">{p.baggage}</td>
                          <td className="p-3.5 text-slate-600">{p.meal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. PRICE BREAKDOWN & POLICY */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <CreditCard size={16} className="text-purple-700" />
                  <span>{bc.priceDetails}</span>
                </h3>
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>{bc.baseFare}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatPrice(priceBreakdown?.baseFare || booking.price * 0.85)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>{bc.taxesFees}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatPrice(priceBreakdown?.taxesAndFees || booking.price * 0.15)}
                    </span>
                  </div>
                  {priceBreakdown?.discount ? (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>{bc.discountApplied}</span>
                      <span className="font-mono">-{formatPrice(priceBreakdown.discount)}</span>
                    </div>
                  ) : null}
                  <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-sm font-black text-slate-900">
                    <span>{bc.totalPaidLabel}</span>
                    <span className="font-mono text-xl text-[#18082e]">
                      {formatPrice(booking.price, booking.currency)}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-500 pt-1">
                    {bc.paymentMethod}: <span className="font-bold text-slate-700">{bc.paidByCard}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <ShieldCheck size={16} className="text-purple-700" />
                    <span>{bc.protectionPolicyTitle}</span>
                  </h3>
                  <div className="space-y-2 text-xs text-slate-600">
                    {data?.lonalizaServices?.length ? (
                      <div className="rounded-xl bg-purple-50/70 p-3 border border-purple-200/80">
                        <p className="font-bold text-purple-950 mb-1.5 flex items-center gap-1.5">
                          <Sparkles size={13} className="text-purple-700" />
                          {bc.lonalizaExclusiveServices}
                        </p>
                        <ul className="space-y-1.5">
                          {data.lonalizaServices.map((svc) => (
                            <li key={svc.id} className="rounded-lg bg-white/80 px-2.5 py-1.5 border border-purple-100">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-purple-950">{customerFacingCopy(svc.title)}</span>
                                <span className="font-mono text-[11px] text-purple-800">{formatPrice(svc.amount, svc.currency || booking.currency)}</span>
                              </div>
                              {svc.terms ? (
                                <p className="mt-1 whitespace-pre-line text-[11px] leading-relaxed text-slate-500">
                                  {customerFacingCopy(svc.terms)}
                                </p>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-200/80">
                      <p className="font-bold text-amber-950 mb-1">{bc.cancelRefundPolicy}</p>
                      <p className="leading-relaxed text-amber-900/90">
                        {capabilities?.refundGuarantee
                          ? bc.refundGuaranteePolicy
                          : customerFacingCopy(policies?.cancellation || "") || bc.ticketTermsCancel}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <p className="font-bold text-slate-800 mb-1">{bc.dateChangeTerms}</p>
                      <p className="leading-relaxed text-slate-600">
                        {capabilities?.flexChange
                          ? bc.flexChangePolicy
                          : customerFacingCopy(policies?.modification || "") || bc.noFlexChangePolicy}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-4">
                  {bc.iataDisclaimer}
                </p>
              </div>
            </div>

            {/* 6. POST-BOOKING SERVICES MANAGEMENT ENGINE */}
            <div className="rounded-3xl border border-purple-200/90 bg-white p-6 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-start gap-2 min-w-0">
                    <Sliders size={18} className="mt-0.5 shrink-0 text-amber-500" />
                    <span className="whitespace-normal break-words leading-snug">{bc.postBookingTitle}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {hasAnyCapability ? bc.postBookingAvailable : bc.postBookingPolicyOnly}
                  </p>
                </div>
              </div>

              {/* IF SUPPLIER DOES NOT SUPPORT ANY POST-BOOKING MODIFICATIONS */}
              {!hasAnyCapability ? (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-900">
                      <Info size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {isFlight
                          ? bc.basicFareLocked
                          : isHotel
                          ? bc.hotelNonRefundable
                          : bc.bookingNoAutoChange}
                      </h4>
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                        {isFlight
                          ? bc.flightLockedHelp
                          : isHotel
                          ? bc.hotelLockedHelp
                          : bc.genericLockedHelp}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `مرحبا لوناليزا، لدي استفسار بخصوص الحجز رقم ${booking.pnr || booking.id}: ${booking.title}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-[#280e46] hover:bg-[#391563] px-5 py-2.5 text-xs font-bold text-amber-300 shadow-sm transition-all"
                    >
                      <MessageCircle size={15} />
                      <span>{bc.contactSupportWhatsApp}</span>
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  {/* Action Tabs for Supported Features */}
                  <div className="mt-5 flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
                    {capabilities?.canAddBaggage && (
                      <button
                        type="button"
                        onClick={() => setActiveActionTab("baggage")}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0",
                          activeActionTab === "baggage"
                            ? "bg-[#280e46] text-amber-300 shadow-sm"
                            : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <Luggage size={15} />
                        <span>{bc.addBaggage}</span>
                      </button>
                    )}

                    {capabilities?.canModify && (
                      <button
                        type="button"
                        onClick={() => setActiveActionTab("modify")}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0",
                          activeActionTab === "modify"
                            ? "bg-[#280e46] text-amber-300 shadow-sm"
                            : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <Calendar size={15} />
                        <span>{bc.changeDateFlight}</span>
                      </button>
                    )}

                    {capabilities?.canCancel && (
                      <button
                        type="button"
                        onClick={() => setActiveActionTab("cancel")}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0",
                          activeActionTab === "cancel"
                            ? "bg-rose-700 text-white shadow-sm"
                            : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        <AlertTriangle size={15} />
                        <span>{bc.requestCancelRefund}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveActionTab("support")}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0",
                        activeActionTab === "support"
                          ? "bg-[#280e46] text-amber-300 shadow-sm"
                          : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <MessageCircle size={15} />
                      <span>{bc.bookingAdvisor}</span>
                    </button>
                  </div>

                  {/* Action Tab Contents */}
                  <div className="mt-6">
                    {/* 1. BAGGAGE TAB */}
                    {activeActionTab === "baggage" && capabilities?.canAddBaggage && (
                      <div className="space-y-4">
                        <p className="text-xs text-slate-600 font-medium">
                          اختر باقة الوزن الإضافي المعتمدة لرحلتك وسيتم ربطها مباشرة مع تذكرة الطيران وإرسال تأكيد الحجز:
                        </p>
                        <div className="grid sm:grid-cols-3 gap-3">
                          {(data.baggageOptions || []).map((opt) => (
                            <label
                              key={opt.id}
                              className={cn(
                                "flex flex-col justify-between p-4 rounded-2xl border cursor-pointer transition-all",
                                selectedBaggage === opt.id
                                  ? "border-2 border-amber-400 bg-amber-50/50 shadow-md ring-1 ring-amber-400/40"
                                  : "border-slate-200 bg-white hover:border-purple-300"
                              )}
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-slate-900 text-sm">+{opt.weightKg} كجم</span>
                                  <input
                                    type="radio"
                                    name="baggage"
                                    value={opt.id}
                                    checked={selectedBaggage === opt.id}
                                    onChange={(e) => setSelectedBaggage(e.target.value)}
                                    className="accent-amber-500"
                                  />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">{opt.description}</p>
                              </div>
                              <p className="text-base font-black text-[#18082e] font-mono mt-3">
                                {formatPrice(opt.price, opt.currency)}
                              </p>
                            </label>
                          ))}
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handlePostBookingAction("add_baggage")}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-2 rounded-2xl bg-[#280e46] hover:bg-[#391563] px-6 py-3 text-xs font-bold text-amber-300 shadow-md transition-all disabled:opacity-60"
                          >
                            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Luggage size={16} />}
                            <span>تأكيد إضافة باقة الأمتعة المحددة</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 2. MODIFY FLIGHT TAB */}
                    {activeActionTab === "modify" && capabilities?.canModify && (
                      <div className="space-y-4 max-w-xl">
                        <p className="text-xs text-slate-600 font-medium">
                          يمكنك طلب تعديل موعد الرحلة أو بيانات السفر. سيقوم فريق لوناليزا بفحص التوفر وتزويدك بعرض السعر الفوري:
                        </p>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">التاريخ الجديد المقترح:</label>
                          <input
                            type="date"
                            value={modifyDate}
                            onChange={(e) => setModifyDate(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">ملاحظات أو رحلات بديلة مفضلة:</label>
                          <textarea
                            rows={3}
                            value={modifyNotes}
                            onChange={(e) => setModifyNotes(e.target.value)}
                            placeholder="مثال: أفضل الرحلة الصباحية بعد الساعة 09:00 صباحاً على نفس الناقل الجوي..."
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePostBookingAction("modify_flight")}
                          disabled={actionLoading}
                          className="inline-flex items-center gap-2 rounded-2xl bg-[#280e46] hover:bg-[#391563] px-6 py-3 text-xs font-bold text-amber-300 shadow-md transition-all disabled:opacity-60"
                        >
                          {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
                          <span>إرسال طلب تعديل موعد الرحلة</span>
                        </button>
                      </div>
                    )}

                    {/* 3. CANCEL / REFUND TAB */}
                    {activeActionTab === "cancel" && capabilities?.canCancel && (
                      <div className="space-y-4 max-w-xl">
                        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
                          <h4 className="text-xs font-bold text-rose-950 mb-1 flex items-center gap-1.5">
                            <AlertTriangle size={15} className="text-rose-600" />
                            <span>تأكيد طلب إلغاء الحجز والاسترداد</span>
                          </h4>
                          <p className="text-xs leading-relaxed text-rose-900/80">
                            {booking.freeCancellation
                              ? "حجزك مؤهل للإلغاء المجاني بالكامل بدون غرامات."
                              : "قد تُطبق غرامة إلغاء جزئية وفق سياسة الإلغاء المبينة أعلاه."}
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">سبب الإلغاء (اختياري):</label>
                          <input
                            type="text"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="مثال: تغيير خطط السفر، ظروف خاصة..."
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-800 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                          />
                        </div>

                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cancelAgreed}
                            onChange={(e) => setCancelAgreed(e.target.checked)}
                            className="mt-0.5 accent-rose-600"
                          />
                          <span className="text-xs text-slate-600 leading-relaxed">
                            أوافق على سياسة الإلغاء، وأدرك أن المبلغ المسترد سيتم تحويله لنفس وسيلة الدفع أو رصيد المحفظة بعد خصم الرسوم إن وجدت.
                          </span>
                        </label>

                        <button
                          type="button"
                          onClick={() => handlePostBookingAction("cancel")}
                          disabled={actionLoading || !cancelAgreed}
                          className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 px-6 py-3 text-xs font-bold text-white shadow-md transition-all disabled:opacity-60"
                        >
                          {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
                          <span>تأكيد إرسال طلب الإلغاء والاسترداد</span>
                        </button>
                      </div>
                    )}

                    {/* 4. SUPPORT TAB */}
                    {activeActionTab === "support" && (
                      <div className="space-y-4 max-w-xl">
                        <p className="text-xs text-slate-600 leading-relaxed">
                          مستشارو لوناليزا متواجدون على مدار 24 ساعة لمساعدتك في أي استفسار يخص حجزك أو التنسيق المباشر مع خطوط الطيران وإدارات الفنادق:
                        </p>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700">رقم الحجز:</span>
                            <span className="font-mono font-bold text-slate-900">#{booking.id}</span>
                          </div>
                          {booking.pnr && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-700">رمز PNR:</span>
                              <span className="font-mono font-bold text-amber-900">{booking.pnr}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700">الخدمة:</span>
                            <span className="font-bold text-purple-900">{booking.title}</span>
                          </div>
                        </div>
                        <a
                          href={`https://wa.me/905015709201?text=${encodeURIComponent(
                            `مرحبا لوناليزا، أحتاج مساعدة بخصوص الحجز رقم ${booking.pnr || booking.id}: ${booking.title}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                        >
                          <MessageCircle size={16} />
                          <span>فتح محادثة فورية مع خدمة العملاء (واتساب)</span>
                        </a>
                      </div>
                    )}

                    {/* Feedback notifications */}
                    {actionMsg && (
                      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-900">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <span>{actionMsg}</span>
                      </div>
                    )}
                    {actionErr && (
                      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-rose-300 bg-rose-50 p-3.5 text-xs font-bold text-rose-800">
                        <AlertCircle size={16} className="text-rose-600 shrink-0" />
                        <span>{actionErr}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Official Modal: Either Dedicated Travel Ticket / Hotel Voucher OR Tax Invoice */}
      {docModalType && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto space-y-6">
            {/* Modal Top Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <span className={`flex h-9 w-9 items-center justify-center rounded-2xl font-bold ${
                  docModalType === "ticket"
                    ? "bg-indigo-500/20 text-indigo-900"
                    : "bg-amber-400/20 text-amber-900"
                }`}>
                  {docModalType === "ticket" ? (
                    isFlight ? <Plane size={18} /> : isHotel ? <Hotel size={18} /> : <FileText size={18} />
                  ) : (
                    <Receipt size={18} />
                  )}
                </span>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {docModalType === "ticket"
                      ? isFlight
                        ? "تذكرة طيران إلكترونية رسمية معتمدة (E-TICKET RECEIPT)"
                        : isHotel
                        ? "فوشر تأكيد إقامة فندقية معتمد (HOTEL VOUCHER)"
                        : "قسيمة تأكيد الخدمة المعتمدة (SERVICE VOUCHER)"
                      : "فاتورة ضريبية رسمية معتمدة (OFFICIAL TAX INVOICE)"}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    رقم الحجز: {booking.pnr || booking.id} · رمز PNR: {booking.pnr}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Direct PDF Download */}
                <a
                  href={
                    docModalType === "ticket"
                      ? isFlight
                        ? `/api/account/bookings/${booking.id}/ticket/pdf?lang=${locale}`
                        : `/api/account/bookings/${booking.id}/voucher/pdf?lang=${locale}`
                      : `/api/account/invoices/${booking.id}/pdf?lang=${locale}`
                  }
                  download
                  className={`rounded-xl font-black px-4 py-2 text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                    docModalType === "ticket"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-700 hover:brightness-110 text-white"
                      : "bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-[#18082e]"
                  }`}
                >
                  <Download size={13} />
                  <span>
                    {docModalType === "ticket"
                      ? isFlight
                        ? "تنزيل تذكرة PDF فورية"
                        : "تنزيل فوشر PDF فوري"
                      : "تنزيل فاتورة PDF فورية"}
                  </span>
                </a>

                {/* Official Turkish e-Archive GİB PDF Download (when in invoice mode) */}
                {docModalType === "invoice" && invoiceData?.eArchive?.invoiceNumber && (
                  <a
                    href={`/api/account/invoices/${booking.id}/earchive`}
                    download={`e-Arsiv-${invoiceData.eArchive.invoiceNumber}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:brightness-110 text-white font-black px-4 py-2 text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Download size={13} />
                    <span>فاتورة الدولة e-Arşiv (GİB PDF)</span>
                  </a>
                )}

                {/* Send via WhatsApp & Email */}
                <button
                  type="button"
                  onClick={handleSendInvoice}
                  disabled={isDispatching}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDispatching ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  <span>إرسال للواتساب والبريد</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl bg-[#280e46] hover:bg-[#391563] px-3.5 py-2 text-xs font-bold text-amber-300 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Printer size={13} />
                  <span>طباعة</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDocModalType(null)}
                  className="rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>

            {/* Notification alert on send */}
            {dispatchStatus && (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-3.5 text-xs font-bold text-emerald-900 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{dispatchStatus}</span>
              </div>
            )}

            {/* 1. FLIGHT ELECTRONIC TICKET VIEW */}
            {docModalType === "ticket" && isFlight && (
              <div className="border border-slate-200 rounded-3xl overflow-hidden bg-slate-50/50 space-y-5 text-xs">
                {/* Top IATA Strip */}
                <div className="bg-slate-900 text-white px-5 py-2.5 flex items-center justify-between font-mono text-[11px] border-b-2 border-amber-500">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded text-[10px]">IATA</span>
                    <span>ELECTRONIC TICKET RECEIPT &amp; BOARDING DOCUMENT</span>
                  </div>
                  <div>Agency: 42-2 9821 · TÜRSAB: 14892</div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Airline & Ticket Header Banner */}
                  <div className="rounded-2xl bg-gradient-to-r from-[#18082e] via-[#2e1065] to-[#18082e] text-white p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xl font-black flex items-center gap-2">
                        <Plane className="text-amber-400" size={22} />
                        <span>{flightDetails?.airline || "Turkish Airlines"}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">
                        صادرة عن: <strong>شركة لوناليزا للسياحة والسفر</strong> (Lonaliza Tourism &amp; Travel LLC)
                      </p>
                    </div>
                    <div className="bg-white/10 border border-white/20 rounded-xl p-3 text-start sm:text-end">
                      <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Booking Reference / PNR</span>
                      <span className="text-2xl font-mono font-black text-white">{booking.pnr}</span>
                      <div className="text-[11px] font-mono text-slate-300 mt-0.5">
                        TKT: {passengers?.[0]?.ticketNumber || `235-${(Math.abs(booking.pnr.split("").reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7)) % 9000000000 + 1000000000)}`}
                      </div>
                    </div>
                  </div>

                  {/* Status Tag */}
                  <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 flex items-center justify-between text-emerald-900 font-bold">
                    <span>حالة التذكرة الرسمية: <strong>مؤكدة ومصدرة برقم تذكرة دولي (CONFIRMED)</strong></span>
                    <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full">OK TO BOARD</span>
                  </div>

                  {/* Passengers Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="bg-slate-100/80 px-4 py-2 font-black text-[11px] text-slate-700 uppercase">
                      👥 بيانات المسافرين وحقائب السفر (PASSENGERS &amp; BAGGAGE)
                    </div>
                    <div className="divide-y divide-slate-100">
                      {(passengers?.length ? passengers : [{ name: "ferdos elhayat", type: "adult", seat: "14A", baggage: "20 KG (Checked)", ticketNumber: "235-8492049102" }]).map((pax, idx) => (
                        <div key={idx} className="p-3.5 grid sm:grid-cols-4 gap-2 items-center">
                          <div>
                            <div className="font-black text-slate-900 text-xs font-mono">{pax.name.toUpperCase()}</div>
                            <div className="text-[10px] text-slate-500">{pax.type ? pax.type.toUpperCase() : "ADULT"}</div>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">رقم التذكرة:</span>
                            <span className="font-mono font-bold text-slate-800">{pax.ticketNumber || `235-${(Math.abs(booking.pnr.split("").reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7)) % 9000000000 + 1000000000)}`}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">المقعد:</span>
                            <span className="font-mono font-bold text-indigo-700">{pax.seat || "14A"}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 text-[10px] block">الأمتعة المشمولة:</span>
                            <span className="font-bold text-emerald-700">{pax.baggage || "20 KG Checked + 8 KG Cabin"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Flight Itinerary */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
                    <div className="font-black text-[11px] text-slate-700 uppercase flex items-center justify-between border-b border-slate-100 pb-2">
                      <span>🛫 خط سير الرحلة ومواعيد الإقلاع والهبوط</span>
                      <span className="text-indigo-700 font-bold">{flightDetails?.cabinClass || "Economy (Y)"}</span>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4 items-center pt-2">
                      <div>
                        <div className="text-2xl font-black font-mono text-slate-900">{flightDetails?.origin || "IST"}</div>
                        <div className="font-bold text-slate-800 text-xs">{flightDetails?.originAirport || "Istanbul Airport"}</div>
                        <div className="text-amber-700 font-bold text-[10px]">Terminal: {flightDetails?.originTerminal || "T1"}</div>
                        <div className="text-indigo-600 font-mono font-bold text-sm mt-1">
                          {formatFlightClock(flightDetails?.departureTime) || bc.timeUnknown}
                        </div>
                        <div className="text-slate-500 text-[10px]">{(booking.checkIn || new Date().toISOString()).slice(0, 10)}</div>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] text-slate-500 font-bold">⏱️ {flightDetails?.duration || "4h 15m"}</span>
                        <div className="h-0.5 bg-slate-300 relative my-2">
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white px-1 text-xs text-indigo-600">✈</span>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded">
                          {flightDetails?.flightNumber || "TK 1985"} · رحلة مباشرة
                        </span>
                      </div>
                      <div className="text-start sm:text-end">
                        <div className="text-2xl font-black font-mono text-slate-900">{flightDetails?.destination || "LHR"}</div>
                        <div className="font-bold text-slate-800 text-xs">{flightDetails?.destinationAirport || "London Heathrow Airport"}</div>
                        <div className="text-amber-700 font-bold text-[10px]">Terminal: {flightDetails?.destinationTerminal || "T2"}</div>
                        <div className="text-indigo-600 font-mono font-bold text-sm mt-1">{flightDetails?.arrivalTime || "10:45"}</div>
                        <div className="text-slate-500 text-[10px]">{(booking.checkIn || new Date().toISOString()).slice(0, 10)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Confirmed E-Ticket Verification */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-black text-slate-900 text-xs mb-1.5 flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>توثيق التذكرة الإلكترونية الرسمية (CONFIRMED E-TICKET VERIFICATION)</span>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center my-2">
                        <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800">
                          رمز حجز الخطوط (PNR): <span className="font-mono text-purple-950 font-black">{booking.pnr || "TK-849204"}</span>
                        </span>
                        <span className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-800">
                          رقم التذكرة الإلكترونية: <span className="font-mono text-purple-950 font-black">{((booking as unknown as { ticketNumber?: string }).ticketNumber) || `235-${booking.pnr || "8492019482"}`}</span>
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-900 bg-amber-50/80 border border-amber-200/60 p-2 rounded-lg mt-1 leading-relaxed">
                        <strong>تنبيه هام للمسافر:</strong> هذه الوثيقة هي إيصال تذكرة طيران إلكترونية مؤكدة. بطاقة صعود الطائرة (Boarding Pass) تصدر حصراً من قِبل شركة الطيران المشغلة عبر موقعها الرسمي (Online Check-in) قبل الرحلة بـ 24-48 ساعة أو مباشرة من كاونتر المطار باستخدام رمز الحجز (PNR) ورقم التذكرة المدونين أعلاه.
                      </p>
                    </div>
                    <div className="h-20 w-20 bg-white p-1 rounded-xl border border-slate-300 shrink-0">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=18-8-46&data=${encodeURIComponent(
                          `https://lonaliza.com/account/bookings/${booking.id}`
                        )}`}
                        alt="QR"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Notices */}
                  <div className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-200 pt-3">
                    <strong>تنبيهات السفر الرسمية:</strong> يرجى التواجد في المطار قبل 3 ساعات من موعد الإقلاع للرحلات الدولية. تغلق كاونترات إنهاء إجراءات السفر قبل 60 دقيقة من موعد الرحلة. صلاحية جواز السفر وتأشيرات الدخول مسؤولية المسافر بالكامل.
                  </div>
                </div>
              </div>
            )}

            {/* 2. HOTEL VOUCHER VIEW */}
            {docModalType === "ticket" && isHotel && (
              <div className="border border-slate-200 rounded-3xl overflow-hidden bg-slate-50/50 space-y-5 text-xs">
                {/* Top Banner */}
                <div className="bg-slate-900 text-white px-5 py-2.5 flex items-center justify-between font-mono text-[11px] border-b-2 border-emerald-500">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500 text-white font-black px-1.5 py-0.5 rounded text-[10px]">VOUCHER</span>
                    <span>OFFICIAL PREPAID HOTEL BOOKING VOUCHER</span>
                  </div>
                  <div>TÜRSAB Belge No: 14892</div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Hotel Header Banner */}
                  <div className="rounded-2xl bg-gradient-to-r from-[#064e3b] to-[#065f46] text-white p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-xl font-black">{booking.title}</div>
                      <div className="text-amber-300 text-sm mt-0.5">⭐⭐⭐⭐⭐ (5-Star Luxury)</div>
                      <p className="text-[11px] text-emerald-200 mt-1">
                        وكيل الحجز: <strong>شركة لوناليزا للسياحة والسفر المحدودة</strong>
                      </p>
                    </div>
                    <div className="bg-white/10 border border-white/20 rounded-xl p-3 text-start sm:text-end">
                      <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">Voucher Number</span>
                      <span className="text-xl font-mono font-black text-white">{`VCH-HTL-${booking.pnr || booking.id.slice(0, 8).toUpperCase()}`}</span>
                      <div className="text-[11px] font-mono text-yellow-200 mt-0.5 font-bold">
                        Conf #: {`CONF-${booking.pnr}`}
                      </div>
                    </div>
                  </div>

                  {/* Stay Dates Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                    <div>
                      <span className="text-[10px] text-emerald-800 font-bold block">تسجيل الوصول (Check-in)</span>
                      <span className="text-base font-black text-emerald-950 font-mono">{booking.checkIn || "2026-09-20"}</span>
                      <span className="text-[10px] text-emerald-700 block">من 14:00</span>
                    </div>
                    <div className="border-x border-emerald-200">
                      <span className="text-[10px] text-emerald-800 font-bold block">مدة الإقامة</span>
                      <span className="text-base font-black text-emerald-950 font-mono">{hotelDetails?.nights || 5} ليالي</span>
                      <span className="text-[10px] text-emerald-700 block">{hotelDetails?.nights || 5} Nights</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-800 font-bold block">تسجيل المغادرة (Check-out)</span>
                      <span className="text-base font-black text-emerald-950 font-mono">{booking.checkOut || "2026-09-25"}</span>
                      <span className="text-[10px] text-emerald-700 block">حتى 12:00</span>
                    </div>
                  </div>

                  {/* Room & Guest Details */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                      <div className="font-black text-slate-900 text-xs border-b border-slate-100 pb-1">👤 بيانات النزلاء:</div>
                      <div className="flex justify-between"><span className="text-slate-500">النزيل الرئيسي:</span><span className="font-bold text-slate-900">{passengers?.[0]?.name || "ferdos elhayat"}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">البريد الإلكتروني:</span><span className="font-mono text-slate-800">elhayatferdos@gmail.com</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">الهاتف / الواتساب:</span><span className="font-mono text-slate-800">+905015709201</span></div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                      <div className="font-black text-slate-900 text-xs border-b border-slate-100 pb-1">🛏️ مواصفات الغرفة والوجبات:</div>
                      <div className="flex justify-between"><span className="text-slate-500">نوع الغرفة:</span><span className="font-bold text-indigo-700">غرفة ديلوكس بإطلالة بحرية</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">نوع السرير:</span><span className="font-bold text-slate-900">1 سرير كينج كبير (King Bed)</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">الوجبات:</span><span className="font-bold text-emerald-700">إفطار مشمول (Breakfast Included)</span></div>
                    </div>
                  </div>

                  {/* Cancellation Policy */}
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-amber-900">
                    <div className="font-black text-xs mb-1">🛡️ سياسة الإلغاء والتعديل:</div>
                    <p className="text-[11px]">إلغاء مجاني متاح بالكامل حتى 48 ساعة قبل موعد الوصول. الحجز مدفوع ومؤكد بالكامل.</p>
                  </div>

                  {/* Reception Instructions & QR */}
                  <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">تعليمات تسجيل الوصول لدى مكتب الاستقبال:</div>
                      <p className="text-[11px] text-slate-600 mt-1">يرجى إبراز هذا الفوشر مع جواز السفر عند الوصول. الحجز مدفوع مسبقاً بالكامل ولا يتطلب أي رسوم إضافية للغرفة.</p>
                    </div>
                    <div className="h-16 w-16 bg-white p-1 rounded-xl border border-slate-300 shrink-0">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=18-8-46&data=${encodeURIComponent(
                          `https://lonaliza.com/account/bookings/${booking.id}`
                        )}`}
                        alt="QR"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. SERVICE VOUCHER VIEW (TRANSFERS / CARS / TOURS) */}
            {docModalType === "ticket" && !isFlight && !isHotel && (
              <div className="border border-slate-200 rounded-3xl overflow-hidden bg-slate-50/50 space-y-5 text-xs p-6">
                <div className="rounded-2xl bg-gradient-to-r from-sky-900 to-sky-700 text-white p-5 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-black">{booking.title}</div>
                    <div className="text-[11px] text-sky-200 mt-1">قسيمة تأكيد الخدمة المعتمدة · TÜRSAB: 14892</div>
                  </div>
                  <div className="bg-white/10 border border-white/20 rounded-xl p-3 text-end font-mono">
                    <span className="text-[10px] text-sky-300 block">Voucher No</span>
                    <span className="text-xl font-bold">{`VCH-${booking.pnr}`}</span>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="font-black text-slate-900 text-xs">🚗 تفاصيل الخدمة والاستقبال:</div>
                  <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-500">المستفيد:</span><span className="font-bold text-slate-900">{passengers?.[0]?.name || "ferdos elhayat"}</span></div>
                  <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-500">التاريخ:</span><span className="font-mono font-bold text-slate-900">{(booking.checkIn || new Date().toISOString()).slice(0, 10)}</span></div>
                  <div className="flex justify-between py-1 border-b border-slate-100"><span className="text-slate-500">المركبة / الخدمة:</span><span className="font-bold text-sky-700">Mercedes-Benz Vito VIP (خدمة خاصة)</span></div>
                  <div className="flex justify-between py-1"><span className="text-slate-500">الاستقبال:</span><span className="font-bold text-slate-800">مطار إسطنبول الدولي مع لوحة باسم العميل</span></div>
                </div>
              </div>
            )}

            {/* 4. OFFICIAL TAX INVOICE VIEW */}
            {docModalType === "invoice" && (
              <div id="printable-official-invoice" className="border border-slate-200 rounded-3xl p-6 bg-slate-50/50 space-y-6 text-xs">
                {/* Official Turkish Government e-Archive Banner */}
                {invoiceData?.eArchive?.invoiceNumber && (
                  <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-white font-black text-xs shadow-sm">
                        GİB
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-red-950 text-xs">T.C. Gelir İdaresi Başkanlığı e-Arşiv Fatura</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-300">
                            معتمد وموقع رقمياً (Paraşüt v4)
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-700 mt-0.5">
                          رقم الفاتورة: <strong className="text-red-900 font-bold">{invoiceData.eArchive.invoiceNumber}</strong> · ETTN: <span className="text-[10px] text-slate-500">{invoiceData.eArchive.ettn}</span>
                        </p>
                      </div>
                    </div>
                    <a
                      href={`/api/account/invoices/${booking.id}/earchive`}
                      download={`e-Arsiv-${invoiceData.eArchive.invoiceNumber}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 flex items-center gap-1 shadow-sm shrink-0"
                    >
                      <Download size={12} />
                      <span>تحميل الأصل الحكومي (PDF)</span>
                    </a>
                  </div>
                )}

                {/* Company Header & Brand info */}
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-slate-200 pb-5">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#18082e] text-amber-300 font-black text-lg shadow-sm">
                        LL
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-[#18082e]">شركة لوناليزا للسياحة والسفر المحدودة</h2>
                        <p className="text-[11px] font-bold text-slate-500 font-mono">LONALIZA TOURISM &amp; TRAVEL LLC</p>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-2 space-y-0.5">
                      <p className="font-semibold text-slate-800">TÜRSAB Belge No: 14892 · IATA Agency: 42-2 9821</p>
                      <p>VKN: 6090871234 / Vergi Dairesi: Beyoğlu, Istanbul, Turkey</p>
                      <p>هاتف: 9201 570 501 90+ · بريد: support@lonaliza.com</p>
                    </div>
                  </div>

                  <div className="text-start sm:text-end space-y-1">
                    <div className="inline-block bg-purple-100 border border-purple-300 px-2.5 py-1 rounded-lg text-purple-950 font-bold text-[11px]">
                      فاتورة ضريبية رسمية (TAX INVOICE)
                    </div>
                    <p className="font-mono text-sm font-black text-purple-950 mt-1">
                      {invoiceData?.invoiceNumber || `INV-${(booking.pnr || booking.id).slice(0, 8).toUpperCase()}`}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      تاريخ المعاملة: {(booking.checkIn || new Date().toISOString()).slice(0, 10)}
                    </p>
                    <p className="text-[11px] text-amber-900 font-mono font-bold">
                      PNR: {booking.pnr}
                    </p>
                  </div>
                </div>

                {/* Billed To / Customer Details */}
                <div className="grid sm:grid-cols-3 gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 font-bold text-[10px] uppercase">اسم العميل (CUSTOMER)</span>
                    <p className="font-black text-slate-900 text-sm mt-0.5">
                      {passengers?.[0]?.name || "ferdos elhayat"}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold text-[10px] uppercase">البريد الإلكتروني</span>
                    <p className="font-mono font-bold text-slate-800 mt-0.5">elhayatferdos@gmail.com</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold text-[10px] uppercase">رقم الهاتف / الواتساب</span>
                    <p className="font-mono font-bold text-slate-800 mt-0.5">+905015709201</p>
                  </div>
                </div>

                {/* Service Details */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 text-sm">{booking.title}</span>
                    <span className="font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-lg text-[11px]">
                      {isFlight ? "تذكرة طيران مؤكدة" : "حجز إقامة معتمد"}
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3 pt-1 text-slate-600 text-[11px]">
                    <div>
                      <span className="text-slate-400 block font-semibold">رمز الحجز PNR:</span>
                      <span className="font-mono font-bold text-amber-950">{booking.pnr}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">وسيلة الدفع:</span>
                      <span className="font-bold text-slate-900">بطاقة إلكترونية (مسدد بالكامل)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">حالة الوثيقة:</span>
                      <span className="font-bold text-emerald-700">مؤكد ومقبول (CONFIRMED)</span>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown & Cryptographic QR Code */}
                <div className="grid sm:grid-cols-2 gap-4 items-center">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between text-slate-600">
                      <span>السعر الأساسي للخدمة:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatPrice(priceBreakdown?.baseFare || booking.price * 0.85)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>الضرائب والرسوم الحكومية:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatPrice(priceBreakdown?.taxesAndFees || booking.price * 0.15)}
                      </span>
                    </div>
                    {priceBreakdown?.discount ? (
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>الخصم المطبق:</span>
                        <span className="font-mono">-{formatPrice(priceBreakdown.discount)}</span>
                      </div>
                    ) : null}
                    <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-black text-slate-900">
                      <span>المبلغ الكلي المدفوع:</span>
                      <span className="font-mono text-base text-[#18082e]">
                        {formatPrice(booking.price, booking.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Scannable Verification Link & QR Info */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-purple-50/70 p-4 rounded-2xl border border-purple-200">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white border border-purple-300 shadow-sm p-1.5">
                      {invoiceData?.qrCodeDataUrl || invoiceData?.qrCodeDataUri ? (
                        <img
                          src={invoiceData.qrCodeDataUrl || invoiceData.qrCodeDataUri}
                          alt="Official Verification QR Code"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=18-8-46&data=${encodeURIComponent(
                            `https://lonaliza.com/invoice/verify?id=${booking.id}&inv=INV-${(booking.pnr || booking.id).slice(0, 8).toUpperCase()}`
                          )}`}
                          alt="Verification QR"
                          className="h-full w-full object-contain"
                        />
                      )}
                    </div>
                    <div className="space-y-1.5 text-center sm:text-start flex-1">
                      <p className="font-black text-purple-950 text-xs flex items-center justify-center sm:justify-start gap-1">
                        <ShieldCheck size={15} className="text-emerald-600" />
                        <span>كود التحقق الرقمي الرسمي المشفر</span>
                      </p>
                      <p className="text-[10px] text-slate-600 leading-relaxed">
                        امسح الكود بكاميرا الهاتف للتحقق الفوري من صحة الفاتورة دون الحاجة لتسجيل الدخول.
                      </p>
                      <div className="pt-1 flex flex-wrap gap-1.5">
                        <a
                          href={invoiceData?.verifyUrl || `/invoice/verify?id=${booking.id}&inv=INV-${(booking.pnr || booking.id).slice(0, 8).toUpperCase()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-900 bg-white border border-purple-300 hover:bg-purple-100 rounded-lg px-2 py-0.5 transition-colors"
                        >
                          <ExternalLink size={11} />
                          <span>رابط التحقق</span>
                        </a>
                        <a
                          href={`https://wa.me/905015709201?text=${encodeURIComponent(
                            `🧾 تفاصيل الفاتورة الرسمية:\nالحجز: ${booking.title}\nPNR: ${booking.pnr}\nالمبلغ: $${booking.price}\nالرابط الموثق: ${invoiceData?.verifyUrl || `https://lonaliza.com/invoice/verify?id=${booking.id}`}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-300 hover:bg-emerald-200 rounded-lg px-2 py-0.5 transition-colors"
                        >
                          <MessageCircle size={11} />
                          <span>واتساب</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Official Seal Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 pt-4 text-[10px] text-slate-400 gap-2">
                  <p>هذه الفاتورة وثيقة رسمية مشفرة ومعتمدة صادرة عن شركة لوناليزا للسياحة والسفر المحدودة.</p>
                  <div className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <ShieldCheck size={13} />
                    <span>SEAL OF AUTHENTICITY · VERIFIED</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
