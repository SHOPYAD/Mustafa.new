"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  BedDouble,
  CalendarDays,
  Check,
  CreditCard,
  Loader2,
  Lock,
  MessageCircle,
  Plus,
  ShieldCheck,
  Star,
  Timer,
  Trash2,
  Users,
} from "lucide-react";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import { useCurrency } from "@/components/ui/CurrencySelector";
import HotelBookingReceipt, { type HotelReceiptModel } from "@/components/hotels/HotelBookingReceipt";
import CheckoutRewards, { type CheckoutLoyaltyValue } from "@/components/loyalty/CheckoutRewards";
import IyzicoCardSheet, { type IyzicoCardSheetHandle } from "@/components/payments/IyzicoCardSheet";
import { paymentCopy } from "@/lib/payments/copy";
import { openBankTransferWhatsApp } from "@/lib/payments/whatsapp-bank-link";
import { nightsBetween, stayFromNightly } from "@/lib/hotel-display";
import { defaultHotelDates } from "@/lib/hotels-config";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { isSandboxPriceLimitError } from "@/lib/iyzico-limits";
import { getBusinessWhatsAppNumber } from "@/lib/site-whatsapp";
import { normalizeWhatsAppNumber } from "@/lib/utils";

type PayConfig = {
  iyzicoEnabled: boolean;
  whatsappBankLinkEnabled: boolean;
  iyzicoMode: "sandbox" | "production";
  whatsappNumber: string;
};

type PayMethod = "whatsapp" | "card";

type AdultTraveler = { id: string; name: string; passport: string };

/** Public view of a confirmed-price quote (POST /api/hotels/quote). */
type PublicQuote = {
  id: string;
  supplier: string;
  hotelId: string;
  hotelName: string;
  hotelImage: string;
  stars: number;
  city: string;
  address: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  childrenAges: number[];
  rooms: number;
  roomName: string;
  roomImage: string;
  board: string;
  boardName?: string;
  refundable: boolean;
  freeCancellationUntil?: string;
  cancellationPolicies: Array<{ from?: string; amount?: number; currency?: string; percent?: number; text?: string }>;
  paymentType: string;
  rateType: string;
  sellingTotal: number;
  perNight: number;
  currency: string;
  taxesIncluded: boolean;
  priceChanged: boolean;
  previousTotal?: number;
  status: string;
  expiresAt: string;
};

type QuoteState = "idle" | "loading" | "ready" | "expired" | "error";

const QUOTE_COPY = {
  ar: {
    checking: "نتحقق من السعر النهائي مع المورد…",
    checkingHint: "خطوة إلزامية قبل الدفع: نؤكد توفر الغرفة وسعرها الفعلي الآن.",
    confirmed: "سعر مؤكد من المورد",
    holdFor: "السعر محجوز لك لمدة",
    expired: "انتهت صلاحية السعر المؤكد",
    expiredHint: "الأسعار تتغير باستمرار لدى الموردين. أعد التحقق للحصول على السعر الحالي قبل الدفع.",
    requote: "إعادة التحقق من السعر",
    changed: "تغيّر السعر منذ صفحة الفندق",
    changedHint: (prev: string, next: string) => `كان ${prev} وأصبح الآن ${next}. المبلغ المعروض هنا هو ما سيتم خصمه فعلياً.`,
    unavailable: "لم تعد هذه الغرفة متاحة بهذا السعر",
    unavailableHint: "اختر غرفة أو خطة سعر أخرى من صفحة الفندق.",
    backToHotel: "العودة إلى صفحة الفندق",
    chargeExact: "سيتم الخصم بالضبط:",
    freeCancelUntil: "إلغاء مجاني حتى",
    nonRefundable: "غير قابل للاسترداد",
    payAtHotel: "الدفع في الفندق",
    board: "الإعاشة",
    taxesIncluded: "شامل الضرائب والرسوم",
    taxesExcluded: "قد تُطبَّق ضرائب/رسوم محلية تُدفع في الفندق",
    supplierBooking: "الحجز يُنفَّذ لدى المورد مباشرةً بعد الدفع ويصلك الفوشر الرسمي على بريدك.",
  },
  en: {
    checking: "Confirming the final price with the supplier…",
    checkingHint: "A mandatory step before payment: we confirm the room is still available at its live price.",
    confirmed: "Price confirmed by the supplier",
    holdFor: "Price held for",
    expired: "The confirmed price has expired",
    expiredHint: "Supplier prices change constantly. Re-check to get the current price before paying.",
    requote: "Re-check price",
    changed: "The price changed since the hotel page",
    changedHint: (prev: string, next: string) => `It was ${prev} and is now ${next}. The amount shown here is exactly what will be charged.`,
    unavailable: "This room is no longer available at this rate",
    unavailableHint: "Pick another room or rate plan on the hotel page.",
    backToHotel: "Back to the hotel page",
    chargeExact: "You will be charged exactly:",
    freeCancelUntil: "Free cancellation until",
    nonRefundable: "Non-refundable",
    payAtHotel: "Pay at the hotel",
    board: "Board",
    taxesIncluded: "Taxes and fees included",
    taxesExcluded: "Local taxes/fees may be payable at the hotel",
    supplierBooking: "The reservation is placed with the supplier right after payment and the official voucher is e-mailed to you.",
  },
  tr: {
    checking: "Nihai fiyat tedarikçiyle doğrulanıyor…",
    checkingHint: "Ödeme öncesi zorunlu adım: odanın güncel fiyatıyla hâlâ müsait olduğunu doğruluyoruz.",
    confirmed: "Fiyat tedarikçi tarafından onaylandı",
    holdFor: "Fiyat şu süre için tutuluyor",
    expired: "Onaylı fiyatın süresi doldu",
    expiredHint: "Tedarikçi fiyatları sürekli değişir. Ödemeden önce güncel fiyatı yeniden kontrol edin.",
    requote: "Fiyatı yeniden kontrol et",
    changed: "Fiyat otel sayfasından bu yana değişti",
    changedHint: (prev: string, next: string) => `${prev} idi, şimdi ${next}. Burada gösterilen tutar tam olarak tahsil edilecek tutardır.`,
    unavailable: "Bu oda artık bu fiyatla müsait değil",
    unavailableHint: "Otel sayfasından başka bir oda veya fiyat planı seçin.",
    backToHotel: "Otel sayfasına dön",
    chargeExact: "Tam olarak tahsil edilecek:",
    freeCancelUntil: "Ücretsiz iptal son tarihi",
    nonRefundable: "İade edilemez",
    payAtHotel: "Otelde ödeme",
    board: "Pansiyon",
    taxesIncluded: "Vergiler ve ücretler dahil",
    taxesExcluded: "Yerel vergiler/ücretler otelde ödenebilir",
    supplierBooking: "Rezervasyon ödemeden hemen sonra tedarikçide oluşturulur ve resmi voucher e-postanıza gönderilir.",
  },
} as const;

function fmtCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function fmtDeadline(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  try {
    return d.toLocaleString(locale === "ar" ? "ar-EG" : locale === "tr" ? "tr-TR" : "en-GB", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}
type ChildTraveler = { id: string; name: string; age: number };

const COUNTRY_CODES = ["+90", "+971", "+966", "+20", "+962", "+964", "+965", "+974", "+973", "+968", "+44", "+49", "+1"];

function emailOk(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function makeAdults(count: number): AdultTraveler[] {
  return Array.from({ length: Math.max(1, count) }, (_, i) => ({
    id: `adult-${i + 1}`,
    name: "",
    passport: "",
  }));
}

export default function HotelBookCheckout() {
  const params = useSearchParams();
  const router = useRouter();
  const { user, loading, openAuth } = useCustomerAuth();
  const { t, locale } = useLocale();
  const { formatPrice, convert, currency: guest } = useCurrency();
  const defaults = useMemo(() => defaultHotelDates(), []);

  const bookingIdParam = params.get("booking") || "";
  const confirmParam = params.get("confirm") || "";
  const paymentStatus = params.get("payment") || "";
  const hotelId = params.get("hotel") || "";
  const roomId = params.get("room") || "";
  const provider = params.get("provider") || "internal";
  const searchAdults = Math.max(1, Number(params.get("adults") || 2) || 2);
  const supplierParam = params.get("supplier") || "";
  const rateKeyParam = params.get("rateKey") || "";
  const sessionIdParam = params.get("sid") || "";
  const masterIdParam = params.get("master") || "";
  const roomsParam = Math.max(1, Number(params.get("rooms") || 1) || 1);
  const childrenAgesParam = useMemo(
    () =>
      String(params.get("children") || "")
        .split(",")
        .map((v) => Number(v))
        .filter((n) => Number.isFinite(n) && n >= 0 && n < 18),
    [params]
  );
  /** Supplier rate → mandatory confirmed-price quote before payment. */
  const supplierMode = Boolean(supplierParam && rateKeyParam && !bookingIdParam);
  const qc = QUOTE_COPY[(locale === "en" || locale === "tr" ? locale : "ar") as keyof typeof QUOTE_COPY];

  const [remote, setRemote] = useState<HotelReceiptModel | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(Boolean(bookingIdParam));
  const [confirmToken, setConfirmToken] = useState(confirmParam);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+90");
  const [phone, setPhone] = useState("");
  const [adults, setAdults] = useState<AdultTraveler[]>(() => makeAdults(searchAdults));
  const [childrenList, setChildrenList] = useState<ChildTraveler[]>([]);
  const [notes, setNotes] = useState("");
  const [smokeFree, setSmokeFree] = useState(false);
  const [quiet, setQuiet] = useState(false);
  const [bedPref, setBedPref] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(paymentStatus === "failed" ? t.hotels.bookingPayFailed : "");
  const [payConfig, setPayConfig] = useState<PayConfig | null>(null);
  const [method, setMethod] = useState<PayMethod>("card");
  const [identityNumber, setIdentityNumber] = useState("");
  const [threeDsActive, setThreeDsActive] = useState(false);
  const cardRef = useRef<IyzicoCardSheetHandle>(null);
  const [awaitingWebhook, setAwaitingWebhook] = useState(paymentStatus === "pending");
  const [savedBookingId, setSavedBookingId] = useState(bookingIdParam);
  const [loyalty, setLoyalty] = useState<CheckoutLoyaltyValue | null>(null);
  const [quote, setQuote] = useState<PublicQuote | null>(null);
  const [quoteState, setQuoteState] = useState<QuoteState>(supplierMode ? "loading" : "idle");
  const [quoteError, setQuoteError] = useState<"unavailable" | "generic" | "">("");
  const [quoteLeftMs, setQuoteLeftMs] = useState(0);

  const requestQuote = useCallback(async () => {
    if (!supplierMode) return;
    setQuoteState("loading");
    setQuoteError("");
    try {
      let supplierContext: Record<string, string> | undefined;
      try {
        const raw = params.get("ctx");
        if (raw) supplierContext = JSON.parse(raw) as Record<string, string>;
      } catch {
        supplierContext = undefined;
      }
      const res = await fetch("/api/hotels/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          rateId: roomId || undefined,
          hotelId,
          supplierToken: rateKeyParam,
          supplierContext,
          checkIn: params.get("checkIn") || undefined,
          checkOut: params.get("checkOut") || undefined,
          adults: searchAdults,
          rooms: roomsParam,
          childrenAges: childrenAgesParam,
          currency: params.get("currency") || undefined,
          expectedTotal: Number(params.get("price") || 0) || undefined,
          sessionId: sessionIdParam || undefined,
          masterId: masterIdParam || undefined,
          lang: locale,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; quote?: PublicQuote; errorCode?: string; error?: string };
      if (!res.ok || !data.ok || !data.quote) {
        setQuote(null);
        setQuoteError(data.errorCode === "unavailable" || data.errorCode === "not_found" || res.status === 404 || res.status === 409 ? "unavailable" : "generic");
        setQuoteState("error");
        return;
      }
      setQuote(data.quote);
      setQuoteLeftMs(Math.max(0, new Date(data.quote.expiresAt).getTime() - Date.now()));
      setQuoteState("ready");
    } catch {
      setQuote(null);
      setQuoteError("generic");
      setQuoteState("error");
    }
  }, [supplierMode, params, roomId, hotelId, rateKeyParam, searchAdults, roomsParam, childrenAgesParam, sessionIdParam, masterIdParam, locale]);

  useEffect(() => {
    if (!supplierMode) return;
    void requestQuote();
    // Quote once per landing on the page; re-quotes are explicit (button) or after expiry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierMode]);

  useEffect(() => {
    if (quoteState !== "ready" || !quote) return;
    const tick = () => {
      const left = new Date(quote.expiresAt).getTime() - Date.now();
      setQuoteLeftMs(Math.max(0, left));
      if (left <= 0) setQuoteState("expired");
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [quoteState, quote]);

  const onLoyalty = useCallback((next: CheckoutLoyaltyValue) => {
    setLoyalty((prev) => {
      if (
        prev &&
        prev.payable === next.payable &&
        prev.couponCode === next.couponCode &&
        prev.coveredInFull === next.coveredInFull &&
        prev.voucherIds.join() === next.voucherIds.join()
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  const hotelName = remote?.hotel_name || quote?.hotelName || params.get("hotelName") || hotelId;
  const roomName = remote?.room_name || quote?.roomName || params.get("roomName") || "";
  const currency = remote?.currency || quote?.currency || params.get("currency") || "USD";
  const price = remote?.price || quote?.sellingTotal || Number(params.get("price") || 0);
  const nightlyParam = remote?.nightly || quote?.perNight || Number(params.get("nightly") || 0);
  const checkIn = remote?.check_in || quote?.checkIn || params.get("checkIn") || defaults.checkIn;
  const checkOut = remote?.check_out || quote?.checkOut || params.get("checkOut") || defaults.checkOut;
  const hotelImage = remote?.hotel_image || quote?.hotelImage || params.get("hotelImage") || "";
  const stars = remote?.stars || quote?.stars || Number(params.get("stars") || 0);
  const rating = remote?.rating || Number(params.get("rating") || 0);
  const stayNights = remote?.nights || nightsBetween(checkIn, checkOut);
  const rawNightly =
    nightlyParam > 0
      ? nightlyParam
      : price > 0 && stayNights > 1
        ? Math.round(price / stayNights)
        : price;
  const money = stayFromNightly(rawNightly, stayNights);
  const nightly = remote?.nightly || (nightlyParam > 0 ? nightlyParam : money.nightly);
  const total = remote?.price || (nightlyParam > 0 && price > 0 ? price : money.total);
  const sourceCurrency = currency || "USD";
  const displayNightly = Math.round(convert(nightly, sourceCurrency));
  const displayTotal = Math.round(convert(total, sourceCurrency));
  // Supplier quotes are charged in the quote currency (server-authoritative); display converts for info only.
  const serverPriced = Boolean(remote || quote);
  const chargeCurrency = serverPriced ? sourceCurrency : guest.code;
  const chargeNightly = serverPriced ? nightly : displayNightly;
  const chargeTotal = serverPriced ? total : displayTotal;
  const dueTotal = loyalty && loyalty.discountUsd > 0 ? loyalty.payable : chargeTotal;

  useEffect(() => {
    if (!bookingIdParam) {
      setRemoteLoading(false);
      return;
    }
    let cancelled = false;
    setRemoteLoading(true);
    void fetch(
      `/api/hotel-bookings/${encodeURIComponent(bookingIdParam)}?confirm=${encodeURIComponent(confirmParam)}`,
      { cache: "no-store" }
    )
      .then((res) => res.json())
      .then((data: { ok?: boolean; booking?: HotelReceiptModel }) => {
        if (cancelled || !data.ok || !data.booking) return;
        setRemote(data.booking);
        setSavedBookingId(data.booking.id);
        if (data.booking.service === "flight") {
          const q = new URLSearchParams();
          q.set("booking", data.booking.id);
          if (data.booking.confirm) q.set("confirm", data.booking.confirm);
          if (paymentStatus) q.set("payment", paymentStatus);
          router.replace(`/flights/booking?${q.toString()}`);
          return;
        }
        if (data.booking.confirm) setConfirmToken(data.booking.confirm);
        if (data.booking.payment_method === "whatsapp") setMethod("whatsapp");
        if (data.booking.payment_method === "card") setMethod("card");
      })
      .finally(() => {
        if (!cancelled) setRemoteLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookingIdParam, confirmParam, paymentStatus, router]);

  useEffect(() => {
    const id = savedBookingId || bookingIdParam;
    if (!id) return;
    if (!awaitingWebhook && paymentStatus !== "pending") return;
    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/payments/iyzico/status?bookingId=${encodeURIComponent(id)}`, { cache: "no-store" });
        const data = (await res.json()) as { paid?: boolean };
        if (cancelled || !data.paid) return;
        const detail = await fetch(
          `/api/hotel-bookings/${encodeURIComponent(id)}?confirm=${encodeURIComponent(confirmToken || confirmParam)}`,
          { cache: "no-store" }
        );
        const json = (await detail.json()) as { ok?: boolean; booking?: HotelReceiptModel };
        if (!cancelled && json.ok && json.booking) {
          setRemote(json.booking);
          setAwaitingWebhook(false);
        }
      } catch {
        /* stay pending */
      }
    };
    void poll();
    const timer = window.setInterval(poll, 2500);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [awaitingWebhook, savedBookingId, bookingIdParam, paymentStatus, confirmToken, confirmParam]);

  // After a successful card payment the supplier reservation runs server-side; poll until it settles.
  useEffect(() => {
    if (!remote || !bookingIdParam) return;
    const st = String(remote.fulfilment_status || "");
    const paidLike = remote.status === "paid" && String(remote.payment_status || "").toLowerCase() === "paid";
    if (!paidLike || !(st === "supplier_pending" || st === "awaiting_payment")) return;
    let attempts = 0;
    let cancelled = false;
    const id = window.setInterval(async () => {
      attempts += 1;
      if (attempts > 45) {
        window.clearInterval(id);
        return;
      }
      try {
        const res = await fetch(
          `/api/hotel-bookings/${encodeURIComponent(bookingIdParam)}?confirm=${encodeURIComponent(confirmToken || confirmParam)}`,
          { cache: "no-store" }
        );
        const data = (await res.json()) as { ok?: boolean; booking?: HotelReceiptModel };
        if (cancelled || !data.ok || !data.booking) return;
        const next = String(data.booking.fulfilment_status || "");
        if (next !== st) setRemote(data.booking);
        if (next && next !== "supplier_pending" && next !== "awaiting_payment") window.clearInterval(id);
      } catch {
        /* keep polling */
      }
    }, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [remote, bookingIdParam, confirmToken, confirmParam, paymentStatus]);

  useEffect(() => {
    if (!user) return;
    const parts = (user.name || "").trim().split(/\s+/);
    setFirstName((prev) => prev || parts[0] || "");
    setLastName((prev) => prev || parts.slice(1).join(" ") || "");
    setEmail((prev) => prev || user.email);
  }, [user]);

  useEffect(() => {
    const booker = `${firstName} ${lastName}`.trim();
    if (!booker) return;
    setAdults((prev) => {
      if (prev[0]?.name) return prev;
      return prev.map((row, i) => (i === 0 ? { ...row, name: booker } : row));
    });
  }, [firstName, lastName]);

  useEffect(() => {
    void fetch("/api/payments/config", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: PayConfig & { ok?: boolean }) => {
        const next: PayConfig = {
          iyzicoEnabled: Boolean(data.iyzicoEnabled),
          whatsappBankLinkEnabled: data.whatsappBankLinkEnabled !== false,
          iyzicoMode: data.iyzicoMode === "production" ? "production" : "sandbox",
          whatsappNumber: String(data.whatsappNumber || ""),
        };
        setPayConfig(next);
        if (!bookingIdParam && paymentStatus !== "paid") {
          setMethod(next.iyzicoEnabled ? "card" : "whatsapp");
        }
      })
      .catch(() => {
        setPayConfig({
          iyzicoEnabled: false,
          whatsappBankLinkEnabled: true,
          iyzicoMode: "sandbox",
          whatsappNumber: "",
        });
        setMethod("whatsapp");
      });
  }, []);

  const fullName = `${firstName} ${lastName}`.trim() || adults[0]?.name.trim() || "";
  const phoneDigits = normalizeWhatsAppNumber(phone);
  const travelersOk =
    adults.length >= 1 &&
    adults.every((row) => row.name.trim().length >= 2 && row.passport.trim().length >= 3);
  const turkishProduction =
    method === "card" && payConfig?.iyzicoMode === "production" && countryCode === "+90";
  const identityOk = !turkishProduction || /^\d{11}$/.test(identityNumber.replace(/\D/g, ""));
  const quoteOk = !supplierMode || (quoteState === "ready" && Boolean(quote));
  const formValid =
    fullName.length >= 3 &&
    emailOk(email) &&
    phoneDigits.length >= 8 &&
    travelersOk &&
    identityOk &&
    quoteOk;

  const guestNames = [
    ...adults.map((row) => `${row.name.trim()} · ${row.passport.trim()}`),
    ...childrenList.map((row) => `${row.name.trim() || t.hotels.travelerChild(1)} (${row.age})`),
  ];

  const specials = [
    smokeFree ? t.hotels.reqSmokeFree : "",
    quiet ? t.hotels.reqQuiet : "",
    bedPref ? t.hotels.reqBed : "",
    notes,
  ]
    .filter(Boolean)
    .join(" · ");

  const whatsappText = [
    locale === "ar"
      ? "مرحباً لوناليزا للسياحة والسفر، أرغب بإتمام حجز الفندق عبر الرابط البنكي الرسمي."
      : locale === "tr"
        ? "Merhaba Alrayyan Turizm, resmi banka bağlantısı ile otel rezervasyonumu tamamlamak istiyorum."
        : "Hello Alrayyan Tourism, I would like to complete this hotel booking via the official bank link.",
    `${hotelName}${roomName ? ` — ${roomName}` : ""}`,
    `${checkIn} → ${checkOut} (${t.hotels.nightsCount(stayNights)})`,
    `${t.hotels.adults}: ${adults.length} · ${t.hotels.children}: ${childrenList.length}`,
    guestNames.length ? `${t.hotels.guestNames}: ${guestNames.join(" | ")}` : "",
    `${t.hotels.nightlyRate}: ${formatPrice(nightly, sourceCurrency)}`,
    `${t.hotels.alrayyanTotal}: ${formatPrice(total, sourceCurrency)}`,
    specials ? `${t.hotels.specialRequests}: ${specials}` : "",
    `${fullName} · ${countryCode} ${phone} · ${email}`,
  ]
    .filter(Boolean)
    .join("\n");

  const payErrorText = (code?: string, errorCode?: string) => {
    if (isSandboxPriceLimitError(code, errorCode)) return t.hotels.sandboxAmountLimit;
    if (code === "quote_expired" || code === "quote_consumed" || code === "quote_failed" || code === "quote_required") return qc.expired;
    if (code === "booking_not_payable") return t.hotels.bookingPayFailed;
    if (code === "iyzico_not_configured") return t.hotels.iyzicoNotReady;
    if (code === "fx_unavailable") return t.hotels.fxUnavailable;
    if (code === "iyzico_network") return t.hotels.iyzicoNetwork;
    if (code === "identity_required" || code === "identity_tc_required") return t.hotels.identityRequired;
    if (code === "invalid_amount") return t.hotels.bookingPayFailed;
    return code && code !== "iyzico_init_failed" ? code : t.hotels.bookingPayFailed;
  };

  const openWhatsApp = (reservationId?: string) => {
    const number = payConfig?.whatsappNumber || getBusinessWhatsAppNumber();
    const id = String(reservationId || savedBookingId || remote?.id || "").trim();
    openBankTransferWhatsApp({
      phone: number,
      message: whatsappText,
      reservationId: id,
      totalLabel: `${dueTotal.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${chargeCurrency}`,
    });
  };

  const startIyzico = async (bookingId: string) => {
    setSavedBookingId(bookingId);
    const invalid = cardRef.current?.validationError();
    if (invalid) {
      setError(invalid);
      return false;
    }
    return Boolean(await cardRef.current?.charge(bookingId));
  };

  const submit = async (chosen: PayMethod) => {
    if (!formValid) return;
    if (!user) {
      openAuth("login");
      return;
    }
    if (supplierMode && (!quote || quoteState !== "ready")) {
      setQuoteState("expired");
      return;
    }
    setSaving(true);
    setError("");
    try {
      let bookingId = savedBookingId;
      let nextConfirm = confirmToken;
      if (!bookingId) {
        const res = await fetch("/api/hotel-bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hotel_id: hotelId,
            hotel_name: hotelName,
            hotel_slug: hotelId,
            room_id: roomId,
            room_name: roomName,
            check_in: checkIn,
            check_out: checkOut,
            adults: adults.length,
            children: childrenList.length,
            guest_names: guestNames,
            customer_name: fullName,
            customer_email: email,
            customer_phone: `${countryCode}${phoneDigits}`,
            notes: specials,
            price: chargeTotal,
            currency: chargeCurrency,
            couponCode: loyalty?.couponCode || "",
            voucherIds: loyalty?.voucherIds || [],
            quoteId: quote?.id || undefined,
            provider,
            hotel_image: hotelImage,
            stars,
            rating,
            nightly: chargeNightly,
            offer_snapshot: {
              nightly: chargeNightly,
              nights: stayNights,
              payment_method: chosen,
              hotel_image: hotelImage,
              stars,
              rating,
              children_ages: childrenList.map((row) => row.age),
              free_cancellation: quote ? quote.refundable : params.get("freeCancel") === "1",
              non_refundable: quote ? !quote.refundable : params.get("nonRefundable") === "1" && params.get("freeCancel") !== "1",
              cancel_until: quote?.freeCancellationUntil || params.get("freeCancelUntil") || checkIn,
            },
          }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          errorCode?: string;
          confirm?: string;
          booking?: { id?: string; status?: string; payment_status?: string; price?: number };
          coveredInFull?: boolean;
          fulfilment?: { status?: string };
        };
        if (res.status === 401 || data.error === "login_required") {
          openAuth("login");
          return;
        }
        if (!res.ok || !data.ok || !data.booking?.id) {
          const code = String(data.errorCode || data.error || "");
          if (code.startsWith("quote_")) {
            setQuoteState("expired");
            setError(qc.expired);
            return;
          }
          setError(payErrorText(data.error, data.errorCode));
          return;
        }
        bookingId = data.booking.id;
        setSavedBookingId(bookingId);
        if (data.confirm) {
          setConfirmToken(data.confirm);
          nextConfirm = data.confirm;
        }
        if (data.coveredInFull || data.booking.status === "paid") {
          setRemote({
            id: bookingId,
            hotel_name: hotelName,
            hotel_image: hotelImage,
            stars,
            rating,
            room_name: roomName,
            check_in: checkIn,
            check_out: checkOut,
            nights: stayNights,
            adults: adults.length,
            children: childrenList.length,
            guest_names: guestNames,
            customer_name: fullName,
            customer_email: email,
            customer_phone: `${countryCode}${phoneDigits}`,
            nightly: chargeNightly,
            price: data.booking.price ?? dueTotal,
            currency: chargeCurrency,
            payment_method: "other",
            status: "paid",
            payment_status: "paid",
            confirm: nextConfirm,
          });
          setDone(true);
          return;
        }
      }
      if (loyalty?.coveredInFull) {
        setDone(true);
        return;
      }
      if (chosen === "whatsapp") {
        openWhatsApp(bookingId);
        setRemote({
          id: bookingId,
          hotel_name: hotelName,
          hotel_image: hotelImage,
          stars,
          rating,
          room_name: roomName,
          check_in: checkIn,
          check_out: checkOut,
          nights: stayNights,
          adults: adults.length,
          children: childrenList.length,
          guest_names: guestNames,
          customer_name: fullName,
          customer_email: email,
          customer_phone: `${countryCode}${phoneDigits}`,
          nightly: chargeNightly,
          price: chargeTotal,
          currency: chargeCurrency,
          payment_method: "whatsapp",
          status: "pending_payment",
          payment_status: "pending_payment",
          confirm: nextConfirm,
        });
        setDone(true);
        return;
      }
      await startIyzico(bookingId);
    } catch {
      setError(t.hotels.iyzicoNetwork);
    } finally {
      setSaving(false);
    }
  };

  const cardEnabled = Boolean(payConfig?.iyzicoEnabled);
  const waEnabled = payConfig ? payConfig.whatsappBankLinkEnabled : true;
  const cardPaid = Boolean(
    remote &&
      remote.payment_method === "card" &&
      remote.status === "paid" &&
      String(remote.payment_status || "").toLowerCase() === "paid" &&
      !`${remote.payment_status}`.toLowerCase().includes("pending_review")
  );
  const cardPending = Boolean(
    !cardPaid &&
      method === "card" &&
      (awaitingWebhook ||
        paymentStatus === "pending" ||
        (remote && `${remote.payment_status}`.toLowerCase().includes("pending")))
  );
  const whatsappDone = done && (remote?.payment_method === "whatsapp" || method === "whatsapp") && !cardPaid;
  const paymentFailed = paymentStatus === "failed";
  const showReceipt = Boolean(remote) && !paymentFailed && (cardPaid || cardPending || whatsappDone);
  const missingPaidBooking = (paymentStatus === "paid" || paymentStatus === "pending") && !remote && !remoteLoading;
  const activeStep = showReceipt ? 2 : 1;

  return (
    <div className="min-h-screen bg-[#f3eee6] pb-16 pt-[5.5rem]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link href={hotelId ? `/hotels/${hotelId}` : "/hotels"} className="text-sm font-semibold text-emerald-800">
          ← {t.hotels.title}
        </Link>

        <div className="mb-6 mt-4 flex flex-wrap items-center gap-2 text-sm">
          {[t.hotels.checkoutChoose, t.hotels.checkoutDetails, t.hotels.checkoutFinal].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  i === activeStep ? "bg-[#051741] text-white" : "border border-slate-200 bg-white text-slate-500"
                }`}
              >
                {i + 1}
              </span>
              <span className={i === activeStep ? "font-semibold text-[#051741]" : "text-slate-500"}>{label}</span>
              {i < 2 ? <span className="px-1 text-slate-300">—</span> : null}
            </div>
          ))}
        </div>

        <div className={`grid grid-cols-1 gap-6 ${showReceipt ? "" : "lg:grid-cols-[minmax(0,1fr)_360px]"}`}>
          <div className="space-y-4">
            {!user && !loading ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="font-semibold text-amber-900">{t.auth.loginRequired}</p>
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className="mt-3 rounded-xl bg-[#051741] px-4 py-2 text-sm font-bold text-white"
                >
                  {t.auth.login}
                </button>
              </div>
            ) : null}

            {remoteLoading && bookingIdParam ? (
              <div className="rounded-2xl border border-[#eadfcf] bg-white p-8 text-center text-sm text-slate-600">
                {t.hotels.bookingConfirmLoading}
              </div>
            ) : showReceipt && remote ? (
              <HotelBookingReceipt
                booking={{ ...remote, confirm: remote.confirm || confirmToken }}
                paymentQuery={paymentStatus}
                onReopenWhatsApp={remote.payment_method === "whatsapp" ? () => openWhatsApp(remote.id) : undefined}
              />
            ) : missingPaidBooking ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                <p className="font-semibold text-amber-900">{t.hotels.bookingNotFound}</p>
                <Link href="/account" className="mt-3 inline-block text-sm font-bold text-[#051741]">
                  {t.hotels.bookingRef}
                </Link>
              </div>
            ) : (
              <>
                {supplierMode ? (
                  <section
                    className={`rounded-2xl border p-4 md:p-5 ${
                      quoteState === "ready"
                        ? quote?.priceChanged
                          ? "border-amber-300 bg-amber-50"
                          : "border-emerald-200 bg-emerald-50/70"
                        : quoteState === "loading"
                          ? "border-sky-200 bg-sky-50"
                          : "border-red-200 bg-red-50"
                    }`}
                    aria-live="polite"
                  >
                    {quoteState === "loading" ? (
                      <div className="flex items-start gap-3">
                        <Loader2 size={20} className="mt-0.5 shrink-0 animate-spin text-sky-700" />
                        <div>
                          <p className="font-bold text-sky-950">{qc.checking}</p>
                          <p className="mt-0.5 text-sm text-sky-900/80">{qc.checkingHint}</p>
                        </div>
                      </div>
                    ) : quoteState === "ready" && quote ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="inline-flex items-center gap-2 font-bold text-emerald-950">
                            <ShieldCheck size={18} className="text-emerald-700" /> {qc.confirmed}
                          </p>
                          <p className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-slate-700" dir="ltr">
                            <Timer size={14} /> {qc.holdFor} {fmtCountdown(quoteLeftMs)}
                          </p>
                        </div>
                        {quote.priceChanged ? (
                          <div className="flex items-start gap-2 rounded-xl bg-white/80 px-3 py-2 text-sm text-amber-950">
                            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
                            <div>
                              <p className="font-semibold">{qc.changed}</p>
                              <p className="mt-0.5 text-xs leading-relaxed">
                                {qc.changedHint(
                                  quote.previousTotal ? formatPrice(quote.previousTotal, quote.currency) : "—",
                                  formatPrice(quote.sellingTotal, quote.currency)
                                )}
                              </p>
                            </div>
                          </div>
                        ) : null}
                        <p className="text-xs leading-relaxed text-emerald-900/80">{qc.supplierBooking}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="inline-flex items-center gap-2 font-bold text-red-900">
                          <AlertTriangle size={18} /> {quoteState === "expired" ? qc.expired : qc.unavailable}
                        </p>
                        <p className="text-sm text-red-900/80">
                          {quoteState === "expired" ? qc.expiredHint : quoteError === "unavailable" ? qc.unavailableHint : t.hotels.iyzicoNetwork}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {quoteState === "expired" || quoteError === "generic" ? (
                            <button
                              type="button"
                              onClick={() => void requestQuote()}
                              className="rounded-xl bg-[#051741] px-4 py-2 text-sm font-bold text-white"
                            >
                              {qc.requote}
                            </button>
                          ) : null}
                          <Link
                            href={hotelId ? `/hotels/${encodeURIComponent(hotelId)}?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&adults=${searchAdults}` : "/hotels"}
                            className="rounded-xl border border-[#051741] px-4 py-2 text-sm font-bold text-[#051741]"
                          >
                            {qc.backToHotel}
                          </Link>
                        </div>
                      </div>
                    )}
                  </section>
                ) : null}

                <section className="space-y-4 rounded-2xl border border-[#eadfcf] bg-white p-5 md:p-6">
                  <h2 className="text-lg font-bold text-[#102033]">{t.hotels.whoIsStaying}</h2>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="text-sm text-slate-600">
                      {t.hotels.firstName}
                      <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                      />
                    </label>
                    <label className="text-sm text-slate-600">
                      {t.hotels.lastName}
                      <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                      />
                    </label>
                    <label className="text-sm text-slate-600">
                      {t.auth.email}
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                      />
                    </label>
                    <label className="text-sm text-slate-600">
                      {t.auth.phone}
                      <div className="mt-1 flex gap-2">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="rounded-xl border border-slate-200 bg-white px-2 py-3 text-sm"
                          aria-label={t.hotels.countryCode}
                        >
                          {COUNTRY_CODES.map((code) => (
                            <option key={code} value={code}>
                              {code}
                            </option>
                          ))}
                        </select>
                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm"
                        />
                      </div>
                    </label>
                  </div>

                  <div className="space-y-3">
                    {adults.map((row, index) => (
                      <article key={row.id} className="rounded-xl border border-[#efe6d8] bg-[#fbf8f3] p-4">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-[#102033]">{t.hotels.travelerAdult(index + 1)}</h3>
                          {adults.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => setAdults((prev) => prev.filter((item) => item.id !== row.id))}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-red-700"
                            >
                              <Trash2 size={12} /> {t.hotels.removeTraveler}
                            </button>
                          ) : null}
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <label className="text-sm text-slate-600">
                            {t.hotels.travelerFullName}
                            <input
                              value={row.name}
                              onChange={(e) =>
                                setAdults((prev) =>
                                  prev.map((item) => (item.id === row.id ? { ...item, name: e.target.value } : item))
                                )
                              }
                              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                            />
                          </label>
                          <label className="text-sm text-slate-600">
                            {t.hotels.passportId}
                            <input
                              value={row.passport}
                              onChange={(e) =>
                                setAdults((prev) =>
                                  prev.map((item) =>
                                    item.id === row.id ? { ...item, passport: e.target.value } : item
                                  )
                                )
                              }
                              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                            />
                          </label>
                        </div>
                      </article>
                    ))}
                    {childrenList.map((row, index) => (
                      <article key={row.id} className="rounded-xl border border-[#efe6d8] bg-white p-4">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <h3 className="text-sm font-bold text-[#102033]">{t.hotels.travelerChild(index + 1)}</h3>
                          <button
                            type="button"
                            onClick={() => setChildrenList((prev) => prev.filter((item) => item.id !== row.id))}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-red-700"
                          >
                            <Trash2 size={12} /> {t.hotels.removeTraveler}
                          </button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          <label className="text-sm text-slate-600">
                            {t.hotels.travelerFullName}
                            <input
                              value={row.name}
                              onChange={(e) =>
                                setChildrenList((prev) =>
                                  prev.map((item) => (item.id === row.id ? { ...item, name: e.target.value } : item))
                                )
                              }
                              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                            />
                          </label>
                          <label className="text-sm text-slate-600">
                            {t.hotels.childAge}
                            <select
                              value={row.age}
                              onChange={(e) =>
                                setChildrenList((prev) =>
                                  prev.map((item) =>
                                    item.id === row.id ? { ...item, age: Number(e.target.value) } : item
                                  )
                                )
                              }
                              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                            >
                              {Array.from({ length: 18 }, (_, age) => (
                                <option key={age} value={age}>
                                  {age}
                                </option>
                              ))}
                            </select>
                          </label>
                        </div>
                      </article>
                    ))}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setAdults((prev) => [...prev, { id: newId("adult"), name: "", passport: "" }])
                        }
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-[#051741]"
                      >
                        <Plus size={14} /> {t.hotels.addTraveler}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setChildrenList((prev) => [...prev, { id: newId("child"), name: "", age: 6 }])
                        }
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-[#051741]"
                      >
                        <Plus size={14} /> {t.hotels.addChild}
                      </button>
                    </div>
                  </div>
                </section>

                <section className="space-y-3 rounded-2xl border border-[#eadfcf] bg-white p-5 md:p-6">
                  <h2 className="text-lg font-bold text-[#102033]">{t.hotels.specialRequests}</h2>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={smokeFree} onChange={(e) => setSmokeFree(e.target.checked)} />
                    {t.hotels.reqSmokeFree}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={quiet} onChange={(e) => setQuiet(e.target.checked)} />
                    {t.hotels.reqQuiet}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={bedPref} onChange={(e) => setBedPref(e.target.checked)} />
                    {t.hotels.reqBed}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t.hotels.notes}
                    rows={3}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                  />
                </section>

                <CheckoutRewards
                  service="hotels"
                  amount={chargeTotal}
                  currency={chargeCurrency}
                  onChange={onLoyalty}
                />

                <section className="space-y-3 rounded-2xl border border-[#eadfcf] bg-white p-5 md:p-6">
                  <h2 className="text-lg font-bold text-[#102033]">{t.hotels.paymentMethodQuestion}</h2>
                  {cardEnabled ? (
                    <div
                      className={`rounded-xl border px-3 py-3 ${
                        method === "card" ? "border-[#1E64FF] bg-[#f4f7ff]" : "border-slate-200"
                      }`}
                    >
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="radio"
                          name="pay"
                          checked={method === "card"}
                          onChange={() => setMethod("card")}
                          className="mt-1"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="inline-flex items-center gap-2 font-semibold">
                            <CreditCard size={16} /> {t.hotels.payCard}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">{t.hotels.iyzicoPayHint}</p>
                        </div>
                      </label>
                      <IyzicoCardSheet
                        ref={cardRef}
                        expanded={method === "card"}
                        bookingId={savedBookingId || bookingIdParam}
                        amountLabel={`${dueTotal.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${chargeCurrency}`}
                        locale={locale}
                        sandbox={payConfig?.iyzicoMode !== "production"}
                        identityNumber={
                          turkishProduction ? identityNumber.replace(/\D/g, "") : adults[0]?.passport.trim() || ""
                        }
                        payLabel={t.hotels.cardPayCta}
                        bookingBusy={saving}
                        payDisabled={!formValid || !user}
                        buyer={{
                          name: fullName || remote?.customer_name || "",
                          firstName: firstName,
                          lastName: lastName,
                          email: email || remote?.customer_email || "",
                          phone: phoneDigits ? `${countryCode}${phoneDigits}` : remote?.customer_phone || "",
                          countryCode,
                          country: countryCode === "+90" ? "Turkey" : "",
                          amount: dueTotal || remote?.price || 0,
                          currency: chargeCurrency || remote?.currency || "USD",
                        }}
                        onRequestPay={() => void submit("card")}
                        onThreeDs={setThreeDsActive}
                        onPending={() => {
                          setThreeDsActive(false);
                          setAwaitingWebhook(true);
                        }}
                        onFailed={(message) => {
                          setThreeDsActive(false);
                          setError(message);
                        }}
                      />
                    </div>
                  ) : null}
                  {waEnabled ? (
                    <label
                      className={`flex items-start gap-3 rounded-xl border px-3 py-3 ${
                        method === "whatsapp" ? "border-emerald-400 bg-emerald-50/60" : "border-slate-200"
                      } ${waEnabled ? "cursor-pointer" : "opacity-50"}`}
                    >
                      <input
                        type="radio"
                        name="pay"
                        checked={method === "whatsapp"}
                        onChange={() => setMethod("whatsapp")}
                        className="mt-1"
                      />
                      <div>
                        <p className="inline-flex items-center gap-2 font-semibold">
                          <MessageCircle size={16} /> {t.hotels.payWhatsAppBank}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">{t.hotels.bankLinkPayment}</p>
                      </div>
                    </label>
                  ) : null}
                  {!cardEnabled ? (
                    <p className="text-sm text-slate-500">{t.hotels.cardDisabledNote}</p>
                  ) : null}
                  {turkishProduction ? (
                    <label className="block text-sm text-slate-600">
                      {t.hotels.identityNumber}
                      <input
                        value={identityNumber}
                        onChange={(e) => setIdentityNumber(e.target.value)}
                        inputMode="numeric"
                        maxLength={11}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                      />
                      <span className="mt-1 block text-xs text-slate-500">{t.hotels.identityHelpTr}</span>
                    </label>
                  ) : null}
                  {error ? (
                    <div className="space-y-2">
                      <p className="text-sm text-red-600">{error}</p>
                      <button
                        type="button"
                        onClick={() => {
                          if (savedBookingId && method === "card") {
                            void (async () => {
                              setSaving(true);
                              setError("");
                              try {
                                await startIyzico(savedBookingId);
                              } catch {
                                setError(t.hotels.iyzicoNetwork);
                              } finally {
                                setSaving(false);
                              }
                            })();
                            return;
                          }
                          void submit(method);
                        }}
                        disabled={saving}
                        className="text-xs font-bold text-[#1E64FF] underline"
                      >
                        {t.hotels.retryPayment}
                      </button>
                    </div>
                  ) : null}
                  {!formValid ? (
                    <p className="text-xs text-slate-500">
                      {supplierMode && !quoteOk ? (quoteState === "loading" ? qc.checking : qc.expired) : t.hotels.fillRequiredFields}
                    </p>
                  ) : null}
                  {awaitingWebhook && !cardPaid ? (
                    <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-950">
                      {paymentCopy(locale).awaitingWebhook}
                    </p>
                  ) : null}
                  {method !== "card" && !threeDsActive ? (
                    <button
                      type="button"
                      onClick={() => void submit(method)}
                      disabled={saving || !formValid || !user || !waEnabled}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#051741] py-3.5 font-bold text-white disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                      {t.hotels.whatsappPayCta}
                    </button>
                  ) : null}
                  <p className="flex items-center justify-center gap-1 text-xs text-slate-400">
                    <Lock size={12} /> {t.hotels.securePayment}
                  </p>
                </section>
              </>
            )}
          </div>

          {showReceipt ? null : (
          <aside>
            <div className="sticky top-24 overflow-hidden rounded-2xl border border-[#eadfcf] bg-white shadow-sm">
              <div className="relative h-36 bg-slate-200">
                {hotelImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={hotelImage} alt={hotelName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <BedDouble size={28} />
                  </div>
                )}
              </div>
              <div className="space-y-3 p-5">
                <div>
                  <h3 className="font-bold text-[#102033]">{hotelName}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm">
                    {stars > 0
                      ? Array.from({ length: Math.min(5, Math.round(stars)) }).map((_, i) => (
                          <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                        ))
                      : null}
                    {rating > 0 ? (
                      <span className="rounded-md bg-[#051741] px-1.5 py-0.5 text-[11px] font-bold text-white">
                        {rating.toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                </div>
                {roomName ? (
                  <p className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                    <BedDouble size={14} /> {roomName}
                  </p>
                ) : null}
                <p className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                  <CalendarDays size={14} /> {checkIn} → {checkOut} · {t.hotels.nightsCount(stayNights)}
                </p>
                <p className="inline-flex items-center gap-1.5 text-sm text-slate-700">
                  <Users size={14} /> {adults.length} {t.hotels.adults}
                  {childrenList.length ? ` · ${childrenList.length} ${t.hotels.children}` : ""}
                </p>
                {quote ? (
                  <ul className="space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    {quote.boardName || quote.board ? (
                      <li className="flex justify-between gap-2">
                        <span>{qc.board}</span>
                        <span className="font-semibold text-slate-800">{quote.boardName || quote.board}</span>
                      </li>
                    ) : null}
                    <li className={`flex justify-between gap-2 ${quote.refundable ? "text-emerald-800" : "text-slate-600"}`}>
                      <span>{quote.refundable && quote.freeCancellationUntil ? qc.freeCancelUntil : quote.refundable ? t.hotels.freeCancellation : qc.nonRefundable}</span>
                      {quote.refundable && quote.freeCancellationUntil ? <span className="font-semibold" dir="ltr">{fmtDeadline(quote.freeCancellationUntil, locale)}</span> : null}
                    </li>
                    {quote.paymentType === "pay_at_hotel" ? <li className="text-amber-800">{qc.payAtHotel}</li> : null}
                  </ul>
                ) : null}
                <div className="space-y-1.5 border-t border-slate-100 pt-3 text-sm">
                  <p className="font-semibold">{t.hotels.priceDetails}</p>
                  {supplierMode && quoteState === "loading" ? (
                    <div className="space-y-2 py-1" aria-hidden>
                      <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                      <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span>{t.hotels.nightlyRate}</span>
                        <span>
                          {formatPrice(nightly, sourceCurrency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>{t.hotels.nightsCount(stayNights)}</span>
                        <span>× {stayNights}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>{t.hotels.taxesFees}</span>
                        <span>{quote ? (quote.taxesIncluded ? qc.taxesIncluded : qc.taxesExcluded) : t.hotels.includesTaxes}</span>
                      </div>
                      <div className="flex justify-between pt-1 font-bold text-[#102033]">
                        <span>{t.hotels.alrayyanTotal}</span>
                        <span>
                          {formatPrice(dueTotal, chargeCurrency)}
                        </span>
                      </div>
                      {quote && chargeCurrency !== guest.code ? (
                        <p className="flex justify-between text-xs text-slate-500">
                          <span>{qc.chargeExact}</span>
                          <span dir="ltr" className="font-semibold text-slate-700">
                            {dueTotal.toLocaleString("en-US", { maximumFractionDigits: 2 })} {chargeCurrency}
                          </span>
                        </p>
                      ) : null}
                    </>
                  )}
                </div>
                <p className="inline-flex items-start gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                  <Check size={14} className="mt-0.5 shrink-0" />
                  {method === "card" ? t.hotels.iyzicoSecureNote : t.hotels.bankLinkPayment}
                </p>
              </div>
            </div>
          </aside>
          )}
        </div>
      </div>
    </div>
  );
}
