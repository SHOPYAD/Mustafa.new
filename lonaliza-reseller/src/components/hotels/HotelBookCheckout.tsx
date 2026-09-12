"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BedDouble,
  CalendarDays,
  Check,
  CreditCard,
  Loader2,
  Lock,
  MessageCircle,
  Plus,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import { useCurrency } from "@/components/ui/CurrencySelector";
import HotelBookingReceipt, { type HotelReceiptModel } from "@/components/hotels/HotelBookingReceipt";
import CheckoutRewards, { type CheckoutLoyaltyValue } from "@/components/loyalty/CheckoutRewards";
import { IyzicoSecureFrame } from "@/components/hotels/IyzicoPayPanel";
import { nightsBetween, stayFromNightly } from "@/lib/hotel-display";
import { defaultHotelDates } from "@/lib/hotels-config";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { isSandboxPriceLimitError } from "@/lib/iyzico-limits";
import { getBusinessWhatsAppNumber } from "@/lib/site-whatsapp";
import { buildWhatsAppLink, normalizeWhatsAppNumber } from "@/lib/utils";

type PayConfig = {
  iyzicoEnabled: boolean;
  whatsappBankLinkEnabled: boolean;
  iyzicoMode: "sandbox" | "production";
  whatsappNumber: string;
};

type PayMethod = "whatsapp" | "card";

type AdultTraveler = { id: string; name: string; passport: string };
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
  const [checkoutHtml, setCheckoutHtml] = useState("");
  const [savedBookingId, setSavedBookingId] = useState(bookingIdParam);
  const [payPageUrl, setPayPageUrl] = useState("");
  const [loyalty, setLoyalty] = useState<CheckoutLoyaltyValue | null>(null);

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

  const hotelName = remote?.hotel_name || params.get("hotelName") || hotelId;
  const roomName = remote?.room_name || params.get("roomName") || "";
  const currency = remote?.currency || params.get("currency") || "USD";
  const price = remote?.price || Number(params.get("price") || 0);
  const nightlyParam = remote?.nightly || Number(params.get("nightly") || 0);
  const checkIn = remote?.check_in || params.get("checkIn") || defaults.checkIn;
  const checkOut = remote?.check_out || params.get("checkOut") || defaults.checkOut;
  const hotelImage = remote?.hotel_image || params.get("hotelImage") || "";
  const stars = remote?.stars || Number(params.get("stars") || 0);
  const rating = remote?.rating || Number(params.get("rating") || 0);
  const stayNights = remote?.nights || nightsBetween(checkIn, checkOut);
  const rawNightly =
    nightlyParam > 0
      ? nightlyParam
      : price > 0 && stayNights > 1 && price >= 900
        ? price / stayNights
        : price;
  const money = stayFromNightly(rawNightly, stayNights);
  const nightly = remote?.nightly || money.nightly;
  const total = remote?.price || money.total;
  const sourceCurrency = currency || "USD";
  const displayNightly = Math.round(convert(nightly, sourceCurrency));
  const displayTotal = Math.round(convert(total, sourceCurrency));
  const chargeCurrency = remote ? sourceCurrency : guest.code;
  const chargeNightly = remote ? nightly : displayNightly;
  const chargeTotal = remote ? total : displayTotal;
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
  const formValid =
    fullName.length >= 3 &&
    emailOk(email) &&
    phoneDigits.length >= 8 &&
    travelersOk &&
    identityOk;

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
      ? "مرحباً الريان للسياحة، أرغب بإتمام حجز الفندق عبر الرابط البنكي الرسمي."
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
    if (code === "iyzico_not_configured") return t.hotels.iyzicoNotReady;
    if (code === "fx_unavailable") return t.hotels.fxUnavailable;
    if (code === "iyzico_network") return t.hotels.iyzicoNetwork;
    if (code === "identity_required" || code === "identity_tc_required") return t.hotels.identityRequired;
    if (code === "invalid_amount") return t.hotels.bookingPayFailed;
    return code && code !== "iyzico_init_failed" ? code : t.hotels.bookingPayFailed;
  };

  const openWhatsApp = () => {
    const number = payConfig?.whatsappNumber || getBusinessWhatsAppNumber();
    window.open(buildWhatsAppLink(number, whatsappText), "_blank", "noopener,noreferrer");
  };

  const startIyzico = async (bookingId: string) => {
    const cardIdentity = turkishProduction
      ? identityNumber.replace(/\D/g, "")
      : adults[0]?.passport.trim() || "";
    const payName = fullName || remote?.customer_name || "";
    const payEmail = email || remote?.customer_email || "";
    const payPhone = phoneDigits ? `${countryCode}${phoneDigits}` : remote?.customer_phone || "";
    const init = await fetch("/api/payments/iyzico/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId,
        amount: dueTotal || remote?.price || 0,
        currency: chargeCurrency || remote?.currency || "USD",
        name: payName,
        firstName: firstName || payName.split(/\s+/)[0] || "",
        lastName: lastName || payName.split(/\s+/).slice(1).join(" ") || "",
        email: payEmail,
        phone: payPhone,
        countryCode,
        country: countryCode === "+90" ? "Turkey" : "",
        identityNumber: cardIdentity,
      }),
    });
    let pay: {
      ok?: boolean;
      error?: string;
      errorCode?: string;
      paymentPageUrl?: string;
      checkoutFormContent?: string;
    } = {};
    try {
      pay = (await init.json()) as typeof pay;
    } catch {
      setError(t.hotels.iyzicoNetwork);
      return false;
    }
    if (!init.ok || !pay.ok) {
      setError(payErrorText(pay.error, pay.errorCode));
      return false;
    }
    if (pay.checkoutFormContent) {
      setCheckoutHtml(pay.checkoutFormContent);
      return true;
    }
    if (pay.paymentPageUrl) {
      setPayPageUrl(pay.paymentPageUrl);
      window.location.href = pay.paymentPageUrl;
      return true;
    }
    setError(t.hotels.bookingPayFailed);
    return false;
  };

  const submit = async (chosen: PayMethod) => {
    if (!formValid) return;
    if (!user) {
      openAuth("login");
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
              free_cancellation: params.get("freeCancel") === "1",
              non_refundable: params.get("nonRefundable") === "1" && params.get("freeCancel") !== "1",
              cancel_until: checkIn,
            },
          }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          error?: string;
          confirm?: string;
          booking?: { id?: string; status?: string; payment_status?: string; price?: number };
          coveredInFull?: boolean;
        };
        if (res.status === 401 || data.error === "login_required") {
          openAuth("login");
          return;
        }
        if (!res.ok || !data.ok || !data.booking?.id) {
          setError(data.error || t.auth.failed);
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
        openWhatsApp();
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
      `${remote.status} ${remote.payment_status} ${paymentStatus}`.toLowerCase().includes("paid") &&
      !`${remote.payment_status}`.toLowerCase().includes("pending_review")
  );
  const cardPending = Boolean(
    remote &&
      remote.payment_method === "card" &&
      !cardPaid &&
      (paymentStatus === "pending" || `${remote.payment_status}`.toLowerCase().includes("pending"))
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
                onReopenWhatsApp={remote.payment_method === "whatsapp" ? openWhatsApp : undefined}
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
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 ${
                        method === "card" ? "border-[#1E64FF] bg-[#f4f7ff]" : "border-slate-200"
                      }`}
                    >
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
                  ) : null}
                  {method === "card" && cardEnabled ? (
                    <p className="rounded-xl bg-[#f4f7ff] px-3 py-2 text-xs leading-relaxed text-slate-600">
                      {t.hotels.iyzicoSecureNote}
                    </p>
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
                  {!formValid ? <p className="text-xs text-slate-500">{t.hotels.fillRequiredFields}</p> : null}
                  {!checkoutHtml ? (
                    <button
                      type="button"
                      onClick={() => void submit(method)}
                      disabled={saving || !formValid || !user || (method === "card" ? !cardEnabled : !waEnabled)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#051741] py-3.5 font-bold text-white disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                      {method === "card" ? t.hotels.cardPayCta : t.hotels.whatsappPayCta}
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
                      ? Array.from({ length: stars }).map((_, i) => (
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
                <div className="space-y-1.5 border-t border-slate-100 pt-3 text-sm">
                  <p className="font-semibold">{t.hotels.priceDetails}</p>
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
                    <span>{t.hotels.includesTaxes}</span>
                  </div>
                  <div className="flex justify-between pt-1 font-bold text-[#102033]">
                    <span>{t.hotels.alrayyanTotal}</span>
                    <span>
                      {formatPrice(dueTotal, chargeCurrency)}
                    </span>
                  </div>
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
      {checkoutHtml ? (
        <IyzicoSecureFrame
          html={checkoutHtml}
          title={t.hotels.secureVerify}
          hostedNote={t.hotels.iyzicoHostedOtpNote}
          closeLabel={t.common.cancel}
          onClose={() => {
            setCheckoutHtml("");
            setPayPageUrl("");
          }}
        />
      ) : null}
    </div>
  );
}
