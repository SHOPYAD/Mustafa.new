"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CreditCard, Loader2, Lock, MessageCircle, Plane } from "lucide-react";
import { IyzicoSecureFrame } from "@/components/hotels/IyzicoPayPanel";
import CheckoutRewards, { type CheckoutLoyaltyValue } from "@/components/loyalty/CheckoutRewards";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import { flightDetails, initFlightBooking } from "@/components/flights/api";
import { formatHumanDate, formatHumanDateRange } from "@/components/flights/booking-format";
import { cabinClassLabel, flightCopy } from "@/components/flights/copy";
import FlightExtrasPicker from "@/components/flights/FlightExtrasPicker";
import FlightItineraryRecap from "@/components/flights/FlightItineraryRecap";
import FlightPriceBreakdown, { type PriceLine } from "@/components/flights/FlightPriceBreakdown";
import { bookingItinerarySnapshot, legsPayload } from "@/components/flights/normalize";
import { useFlightPrice } from "@/components/flights/useFlightPrice";
import { BOOKING_SESSION_KEY } from "@/components/flights/search-state";
import type {
  BookingStep,
  FlightSearchQuery,
  PassengerDraft,
  PassengerKind,
  SelectedFare,
} from "@/components/flights/types";
import { extraLocalizedTitle, extrasTotal } from "@/lib/agency-extras";
import { eticketIssuanceNote } from "@/lib/booking-notices";
import { buildFlightItinerarySnapshot } from "@/lib/flights/booking-snapshot";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { AgencyExtraPackage } from "@/types/agency-extra";
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

const COUNTRY_CODES = ["+90", "+971", "+966", "+20", "+962", "+964", "+965", "+974", "+973", "+968", "+44", "+49", "+1"];

function emailOk(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function makePassengers(query: FlightSearchQuery): PassengerDraft[] {
  const rows: PassengerDraft[] = [];
  const add = (kind: PassengerKind, count: number) => {
    for (let i = 0; i < count; i += 1) {
      rows.push({
        id: newId(kind),
        kind,
        title: "mr",
        firstName: "",
        lastName: "",
        gender: "",
        dateOfBirth: "",
        nationality: "",
        passportNumber: "",
        passportCountry: "",
        passportExpiry: "",
        frequentFlyer: "",
        meal: "",
      });
    }
  };
  add("adult", query.adults);
  add("child", query.childrens);
  add("infant", query.infants);
  if (!rows.length) add("adult", 1);
  return rows;
}

function passengerValid(row: PassengerDraft): boolean {
  return (
    row.firstName.trim().length >= 2 &&
    row.lastName.trim().length >= 2 &&
    row.dateOfBirth.length >= 8 &&
    row.nationality.trim().length >= 2 &&
    row.passportNumber.trim().length >= 3 &&
    row.passportCountry.trim().length >= 2 &&
    row.passportExpiry.length >= 8
  );
}

type PaidSnapshot = {
  route: string;
  departDate: string;
  returnDate: string;
  fareClass: string;
  baggage: string;
  guestNames: string[];
  price: number;
  currency: string;
  extrasPackages: Array<{ id: string; title: string; amount: number }>;
};

const fieldClass =
  "mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-[#051741] outline-none focus:border-[#051741] focus:bg-white";

function selectedPackageIds(selection: SelectedFare): string[] {
  return selection.extras.packageIds || [];
}

function fareSubtotal(selection: SelectedFare, pax: number): number {
  const unit = selection.fare?.price || selection.itinerary.price;
  return unit * Math.max(1, pax);
}

function selectionTotal(
  selection: SelectedFare,
  pax: number,
  packages: AgencyExtraPackage[]
): number {
  const sub = fareSubtotal(selection, pax);
  return sub + extrasTotal(packages, selectedPackageIds(selection), sub);
}

export default function FlightBookingFunnel() {
  const { locale, t } = useLocale();
  const { formatFlightPrice } = useFlightPrice();
  const copy = flightCopy(locale);
  const params = useSearchParams();
  const { user, loading, openAuth } = useCustomerAuth();
  const [step, setStep] = useState<BookingStep>("passengers");
  const [query, setQuery] = useState<FlightSearchQuery | null>(null);
  const [selection, setSelection] = useState<SelectedFare | null>(null);
  const [passengers, setPassengers] = useState<PassengerDraft[]>([]);
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+90");
  const [phone, setPhone] = useState("");
  const [identityNumber, setIdentityNumber] = useState("");
  const [payConfig, setPayConfig] = useState<PayConfig | null>(null);
  const [method, setMethod] = useState<PayMethod>("card");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fareChanged, setFareChanged] = useState(false);
  const [checkoutHtml, setCheckoutHtml] = useState("");
  const [bookingRef, setBookingRef] = useState(params.get("booking") || "");
  const paymentStatus = params.get("payment") || "";
  const [loyalty, setLoyalty] = useState<CheckoutLoyaltyValue | null>(null);
  const [extraPackages, setExtraPackages] = useState<AgencyExtraPackage[]>([]);
  const [paidSnapshot, setPaidSnapshot] = useState<PaidSnapshot | null>(null);
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

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(BOOKING_SESSION_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { query?: FlightSearchQuery; selection?: SelectedFare };
      if (parsed.query) {
        setQuery(parsed.query);
        setPassengers(makePassengers(parsed.query));
      }
      if (parsed.selection) {
        const next = parsed.selection;
        setSelection({
          ...next,
          itinerary: bookingItinerarySnapshot(next.itinerary),
          extras: {
            extraBag: false,
            insurance: false,
            priorityBoarding: false,
            packageIds: next.extras?.packageIds || [],
          },
        });
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void fetch("/api/flights/extras?service=flights", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { ok?: boolean; extras?: AgencyExtraPackage[] }) => {
        if (data.ok && Array.isArray(data.extras)) setExtraPackages(data.extras);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const bookingId = params.get("booking") || "";
    const confirm = params.get("confirm") || "";
    if (!bookingId || bookingId.startsWith("flt_") || bookingId.startsWith("WA-")) return;
    void fetch(
      `/api/hotel-bookings/${encodeURIComponent(bookingId)}?confirm=${encodeURIComponent(confirm)}`,
      { cache: "no-store" }
    )
      .then((res) => res.json())
      .then((data: { ok?: boolean; booking?: { hotel_name?: string; room_name?: string; check_in?: string; check_out?: string; price?: number; currency?: string; guest_names?: string[]; snapshot?: Record<string, unknown>; offer_snapshot?: Record<string, unknown> } }) => {
        if (!data.ok || !data.booking) return;
        setBookingRef(bookingId);
        const snap = data.booking.offer_snapshot || data.booking.snapshot || {};
        const extrasRaw = Array.isArray(snap.extrasPackages) ? snap.extrasPackages : [];
        setPaidSnapshot({
          route: String(snap.route || data.booking.hotel_name || ""),
          departDate: String(snap.departDate || data.booking.check_in || ""),
          returnDate: String(snap.returnDate || data.booking.check_out || ""),
          fareClass: String(snap.fareClass || data.booking.room_name || ""),
          baggage: String(snap.baggage || ""),
          guestNames: data.booking.guest_names || [],
          price: Number(data.booking.price) || 0,
          currency: String(data.booking.currency || "USD"),
          extrasPackages: extrasRaw
            .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object")
            .map((row) => ({
              id: String(row.id || ""),
              title: String(row.title || ""),
              amount: Number(row.amount) || 0,
            })),
        });
        if (params.get("payment") === "paid") setStep("done");
      })
      .catch(() => undefined);
  }, [params]);

  useEffect(() => {
    if (!user) return;
    const parts = (user.name || "").trim().split(/\s+/);
    setEmail((prev) => prev || user.email);
    setPassengers((prev) => {
      if (!prev[0] || prev[0].firstName) return prev;
      return prev.map((row, i) =>
        i === 0 ? { ...row, firstName: parts[0] || "", lastName: parts.slice(1).join(" ") } : row
      );
    });
  }, [user]);

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
        setMethod(next.iyzicoEnabled ? "card" : "whatsapp");
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

  useEffect(() => {
    if (paymentStatus === "paid" && params.get("booking")) {
      setBookingRef(params.get("booking") || "");
      setStep("done");
    }
  }, [paymentStatus, params]);

  const paxCount = passengers.length || 1;
  const currency = selection?.itinerary.currency || query?.currency || paidSnapshot?.currency || "USD";
  const fareOnly = selection ? fareSubtotal(selection, paxCount) : 0;
  const extrasSum = selection ? extrasTotal(extraPackages, selectedPackageIds(selection), fareOnly) : 0;
  const total = selection ? selectionTotal(selection, paxCount, extraPackages) : paidSnapshot?.price || 0;
  const dueTotal = loyalty && loyalty.discountUsd > 0 ? loyalty.payable : total;
  const chosenExtras = selection
    ? extraPackages.filter((pkg) => selectedPackageIds(selection).includes(pkg.id))
    : [];
  const phoneDigits = normalizeWhatsAppNumber(phone);
  const turkishProduction = method === "card" && payConfig?.iyzicoMode === "production" && countryCode === "+90";
  const identityOk = !turkishProduction || /^\d{11}$/.test(identityNumber.replace(/\D/g, ""));
  const contactOk = emailOk(email) && phoneDigits.length >= 8 && identityOk;
  const passengersOk = passengers.length > 0 && passengers.every(passengerValid);
  const formValid = Boolean(selection && query && passengersOk && contactOk);
  const cardEnabled = Boolean(payConfig?.iyzicoEnabled);
  const waEnabled = payConfig ? payConfig.whatsappBankLinkEnabled : true;
  const cardPaid = paymentStatus === "paid";

  const kindLabel = (kind: PassengerKind) => {
    switch (kind) {
      case "adult":
        return copy.adultKind;
      case "child":
        return copy.childKind;
      case "infant":
        return copy.infantKind;
      default: {
        const _exhaustive: never = kind;
        return _exhaustive;
      }
    }
  };

  const routeLabel = useMemo(() => {
    const legs = selection?.itinerary.legs || [];
    return legs.map((leg) => `${leg.origin.displayCode} → ${leg.destination.displayCode}`).join(" · ");
  }, [selection]);

  const goReview = async () => {
    if (!passengersOk || !contactOk || !selection || !query) return;
    setSaving(true);
    setError("");
    try {
      const fresh = await flightDetails({
        itineraryId: selection.itinerary.id,
        legs: legsPayload(selection.itinerary),
        currency,
        locale,
        cabin: query.cabinClass,
        sessionId: selection.sessionId,
        quotedPrice: selection.fare?.price || selection.itinerary.price,
      });
      if (fresh.price && Math.abs(fresh.price - selection.itinerary.price) >= 1) {
        setFareChanged(true);
        setSelection({
          ...selection,
          itinerary: { ...selection.itinerary, price: fresh.price, currency: fresh.currency || currency },
          fare: selection.fare
            ? { ...selection.fare, price: fresh.fareFamilies.find((f) => f.id === selection.fare?.id)?.price || selection.fare.price }
            : selection.fare,
        });
      }
      setStep("review");
    } catch {
      setStep("review");
    } finally {
      setSaving(false);
    }
  };

  const payErrorText = (code?: string, errorCode?: string) => {
    if (isSandboxPriceLimitError(code, errorCode)) return t.hotels.sandboxAmountLimit;
    if (code === "iyzico_not_configured") return t.hotels.iyzicoNotReady;
    if (code === "fx_unavailable") return t.hotels.fxUnavailable;
    if (code === "iyzico_network") return t.hotels.iyzicoNetwork;
    if (code === "identity_required" || code === "identity_tc_required") return t.hotels.identityRequired;
    return t.hotels.bookingPayFailed;
  };

  const whatsappText = () => {
    const names = passengers.map((row) => `${row.firstName} ${row.lastName} · ${row.passportNumber}`).join(" | ");
    return [
      locale === "ar"
        ? "مرحباً الريان للسياحة، أرغب بإتمام حجز الطيران عبر الرابط البنكي الرسمي."
        : locale === "tr"
          ? "Merhaba Alrayyan Turizm, resmi banka bağlantısı ile uçuş rezervasyonumu tamamlamak istiyorum."
          : "Hello Alrayyan Tourism, I would like to complete this flight booking via the official bank link.",
      routeLabel,
      `${query?.date || ""} ${query?.returnDate || ""}`.trim(),
      names,
      `${copy.total}: ${formatFlightPrice(total, currency)}`,
      `${email} · ${countryCode} ${phone}`,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const persistEnquiry = async () => {
    if (!selection || !query) return;
    const first = passengers[0];
    const name = `${first?.firstName || ""} ${first?.lastName || ""}`.trim();
    const created = await initFlightBooking({
      itineraryId: selection.itinerary.id,
      legs: legsPayload(selection.itinerary),
      sessionId: selection.sessionId,
      currency,
      locale,
      quotedPrice: selection.fare?.price || selection.itinerary.price,
      adults: query.adults,
      childrens: query.childrens,
      infants: query.infants,
      contact: {
        name,
        email,
        phone: `${countryCode}${phoneDigits}`,
      },
      travelers: passengers.map((row) => ({
        kind: row.kind,
        title: row.title,
        firstName: row.firstName,
        lastName: row.lastName,
        gender: row.gender,
        dateOfBirth: row.dateOfBirth,
        nationality: row.nationality,
        passportNumber: row.passportNumber,
        passportCountry: row.passportCountry,
        passportExpiry: row.passportExpiry,
      })),
    });
    setBookingRef(created.bookingId);
    if (created.fareChanged) {
      setFareChanged(true);
      setSelection({
        ...selection,
        itinerary: { ...selection.itinerary, price: created.clientPrice, currency: created.currency },
      });
    }
    return created;
  };

  const startCard = async () => {
    if (!selection || !query) return;
    const first = passengers[0];
    const name = `${first.firstName} ${first.lastName}`.trim();
    const res = await fetch("/api/hotel-bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hotel_id: `flight:${selection.itinerary.id}`,
        hotel_name: routeLabel,
        hotel_slug: selection.itinerary.id,
        room_id: selection.fare?.id || "fare",
        room_name: `${selection.itinerary.legs[0]?.carriers[0]?.name || ""} · ${selection.fare?.name || cabinClassLabel(locale, query.cabinClass)}`,
        check_in: query.date,
        check_out: query.returnDate || query.date,
        adults: query.adults,
        children: query.childrens,
        guest_names: passengers.map((row) => `${row.firstName} ${row.lastName} · ${row.passportNumber}`),
        customer_name: name,
        customer_email: email,
        customer_phone: `${countryCode}${phoneDigits}`,
        price: total,
        currency,
        couponCode: loyalty?.couponCode || "",
        voucherIds: loyalty?.voucherIds || [],
        provider: "flight",
        offer_snapshot: {
          ...buildFlightItinerarySnapshot({
            itinerary: selection.itinerary,
            fare: selection.fare,
            query,
            fareClassLabel: selection.fare?.name || cabinClassLabel(locale, query.cabinClass),
            routeLabel,
            paymentMethod: "card",
          }),
          extrasPackages: extrasSnapshot(),
          extrasTotal: extrasSum,
          issuanceNotice: eticketIssuanceNote(locale),
        },
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      coveredInFull?: boolean;
      booking?: { id?: string; status?: string };
    };
    if (res.status === 401 || data.error === "login_required") {
      openAuth("login");
      return;
    }
    if (!res.ok || !data.ok || !data.booking?.id) {
      setError(data.error || t.auth.failed);
      return;
    }
    setBookingRef(data.booking.id);
    if (data.coveredInFull || data.booking.status === "paid") {
      setStep("done");
      return;
    }
    const identity = turkishProduction
      ? identityNumber.replace(/\D/g, "")
      : first.passportNumber.trim();
    const init = await fetch("/api/payments/iyzico/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId: data.booking.id,
        amount: dueTotal,
        currency,
        name,
        firstName: first.firstName,
        lastName: first.lastName,
        email,
        phone: `${countryCode}${phoneDigits}`,
        countryCode,
        country: countryCode === "+90" ? "Turkey" : "",
        identityNumber: identity,
      }),
    });
    let pay: { ok?: boolean; error?: string; errorCode?: string; paymentPageUrl?: string; checkoutFormContent?: string } = {};
    try {
      pay = (await init.json()) as typeof pay;
    } catch {
      setError(t.hotels.iyzicoNetwork);
      return;
    }
    if (!init.ok || !pay.ok) {
      setError(payErrorText(pay.error, pay.errorCode));
      return;
    }
    if (pay.checkoutFormContent) {
      setCheckoutHtml(pay.checkoutFormContent);
      return;
    }
    if (pay.paymentPageUrl) {
      window.location.href = pay.paymentPageUrl;
    }
  };

  const submitPay = async (chosen: PayMethod) => {
    if (!formValid) return;
    if (!user) {
      openAuth("login");
      return;
    }
    if (chosen === "card" && cardPaid) return;
    setSaving(true);
    setError("");
    try {
      if (chosen === "whatsapp") {
        await persistEnquiry();
        const number = payConfig?.whatsappNumber || getBusinessWhatsAppNumber();
        window.open(buildWhatsAppLink(number, whatsappText()), "_blank", "noopener,noreferrer");
        setBookingRef((prev) => prev || `WA-${Date.now().toString(36).toUpperCase()}`);
        setStep("done");
        return;
      }
      await persistEnquiry();
      await startCard();
    } catch {
      setError(t.hotels.iyzicoNetwork);
    } finally {
      setSaving(false);
    }
  };

  const persistSelection = (next: SelectedFare) => {
    setSelection(next);
    if (!query) return;
    try {
      sessionStorage.setItem(BOOKING_SESSION_KEY, JSON.stringify({ query, selection: next }));
    } catch {
      /* ignore */
    }
  };

  const toggleExtra = (id: string) => {
    if (!selection) return;
    const current = selectedPackageIds(selection);
    const packageIds = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    persistSelection({
      ...selection,
      extras: { extraBag: false, insurance: false, priorityBoarding: false, packageIds },
    });
  };

  const extrasSnapshot = () =>
    chosenExtras.map((pkg) => ({
      id: pkg.id,
      title: extraLocalizedTitle(pkg, locale),
      amount: extrasTotal([pkg], [pkg.id], fareOnly),
      priceType: pkg.priceType,
      priceValue: pkg.priceValue,
    }));

  const priceLines = (): PriceLine[] => {
    if (!selection) return [];
    const unit = selection.fare?.price || selection.itinerary.price;
    const listed = selection.itinerary.price || unit;
    const scale = listed > 0 ? unit / listed : 1;
    const taxesUnit = (selection.itinerary.taxes || 0) * scale;
    const baseUnit = selection.itinerary.baseFare
      ? selection.itinerary.baseFare * scale
      : taxesUnit > 0 && unit > taxesUnit
        ? unit - taxesUnit
        : unit;
    const lines: PriceLine[] = [
      { id: "base", label: copy.baseFare, amount: baseUnit * paxCount, kind: "base" },
    ];
    if (taxesUnit > 0) {
      lines.push({ id: "taxes", label: copy.taxesFees, amount: taxesUnit * paxCount, kind: "tax" });
    }
    for (const pkg of chosenExtras) {
      lines.push({
        id: pkg.id,
        label: extraLocalizedTitle(pkg, locale),
        amount: extrasTotal([pkg], [pkg.id], fareOnly),
        kind: "extra",
      });
    }
    if (loyalty && loyalty.discountUsd > 0) {
      lines.push({ id: "discount", label: copy.discount, amount: loyalty.discountUsd, kind: "discount" });
    }
    lines.push({ id: "total", label: copy.total, amount: dueTotal, kind: "total" });
    return lines;
  };

  const updatePassenger = (id: string, patch: Partial<PassengerDraft>) => {
    setPassengers((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const calendarHref = () => {
    if (!selection || !query) return "#";
    const start = query.date.replace(/-/g, "");
    const title = encodeURIComponent(`Flight ${routeLabel}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${start}`;
  };

  const steps: Array<[BookingStep | "select", string]> = [
    ["select", copy.stepSelect],
    ["passengers", copy.stepPassengers],
    ["review", copy.stepReview],
    ["payment", copy.stepPay],
  ];

  const showPaidOnly = step === "done" && (!selection || !query) && (Boolean(bookingRef) || Boolean(paidSnapshot));

  if ((!selection || !query) && !showPaidOnly) {
    return (
      <div className="min-h-screen bg-[#f4f1ea] px-4 pt-32 text-center">
        <p className="font-bold text-[#051741]">{copy.emptyTitle}</p>
        <Link href="/flights" className="mt-4 inline-block text-sm font-semibold text-amber-700">
          {copy.backFlights}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f1ea] pb-16 pt-24">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Link href="/flights/search" className="text-sm font-semibold text-amber-800">
          ← {copy.backFlights}
        </Link>
        <div className="mb-6 mt-4 flex flex-wrap items-center gap-2 text-sm">
          {steps.map(([key, label], i) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  key === step || (step === "done" && key === "payment")
                    ? "bg-[#051741] text-white"
                    : "border border-slate-200 bg-white text-slate-500"
                }`}
              >
                {i + 1}
              </span>
              <span className={key === step ? "font-semibold text-[#051741]" : "text-slate-500"}>{label}</span>
              {i < steps.length - 1 ? <span className="text-slate-300">—</span> : null}
            </div>
          ))}
        </div>

        {step === "done" ? (
          <section className="rounded-2xl border border-[#eadfcf] bg-white p-6">
            <div className="text-center">
              <Plane className="mx-auto text-[#10b981]" />
              <h1 className="mt-3 text-2xl font-bold text-[#051741]">{copy.confirmTitle}</h1>
              <p className="mt-2 text-sm text-slate-600">
                {copy.bookingRef}: <strong dir="ltr">{bookingRef || "—"}</strong>
              </p>
              <p className="mt-1 text-lg font-bold">{formatFlightPrice(total, currency)}</p>
              {method === "whatsapp" && !cardPaid ? (
                <p className="mt-3 text-sm text-slate-500">{t.hotels.whatsappSentNote}</p>
              ) : cardPaid ? (
                <p className="mt-3 text-sm text-emerald-700">{t.hotels.bookingPaid}</p>
              ) : null}
              <p className="mx-auto mt-4 max-w-md rounded-xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
                {copy.eticketIssuanceNote}
              </p>
            </div>
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-start">
              <p className="text-sm font-bold text-[#051741]">{copy.itineraryTitle}</p>
              {selection && query ? (
                <FlightItineraryRecap
                  selection={selection}
                  locale={locale}
                  copy={copy}
                  departDate={query.date}
                  returnDate={query.returnDate}
                  cabinLabel={cabinClassLabel(locale, query.cabinClass)}
                />
              ) : (
                <div className="mt-2 space-y-2 text-sm text-slate-700">
                  <p className="font-semibold">{paidSnapshot?.route || routeLabel}</p>
                  <p className="text-xs tabular-nums text-slate-500" dir="ltr">
                    {paidSnapshot
                      ? formatHumanDateRange(paidSnapshot.departDate, paidSnapshot.returnDate, locale)
                      : ""}
                    {paidSnapshot?.fareClass ? ` · ${paidSnapshot.fareClass}` : ""}
                  </p>
                  {paidSnapshot?.baggage ? (
                    <p className="text-xs text-slate-500">
                      {copy.checkedBag}: {paidSnapshot.baggage}
                    </p>
                  ) : null}
                </div>
              )}
              {chosenExtras.length || paidSnapshot?.extrasPackages.length ? (
                <ul className="mt-3 space-y-1 text-sm text-slate-600">
                  {(chosenExtras.length
                    ? chosenExtras.map((pkg) => extraLocalizedTitle(pkg, locale))
                    : (paidSnapshot?.extrasPackages || []).map((pkg) => pkg.title)
                  ).map((title) => (
                    <li key={title}>+ {title}</li>
                  ))}
                </ul>
              ) : null}
              <ul className="mt-3 space-y-1 text-sm text-slate-600">
                {passengers.some((row) => row.firstName) ? (
                  passengers.map((row) => (
                    <li key={row.id}>
                      {row.firstName} {row.lastName} · {row.passportNumber}
                    </li>
                  ))
                ) : (
                  (paidSnapshot?.guestNames || []).map((name) => <li key={name}>{name}</li>)
                )}
              </ul>
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {params.get("confirm") && bookingRef && !bookingRef.startsWith("flt_") && !bookingRef.startsWith("WA-") ? (
                <a
                  href={`/api/hotel-bookings/${encodeURIComponent(bookingRef)}/pdf?confirm=${encodeURIComponent(params.get("confirm") || "")}`}
                  className="rounded-xl bg-[#10b981] px-4 py-2 text-sm font-bold text-white"
                >
                  {copy.downloadInvoice}
                </a>
              ) : bookingRef.startsWith("flt_") ? (
                <a
                  href={`/api/flights/invoice/${encodeURIComponent(bookingRef)}`}
                  className="rounded-xl bg-[#10b981] px-4 py-2 text-sm font-bold text-white"
                >
                  {copy.downloadInvoice}
                </a>
              ) : null}
              <a href={calendarHref()} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold">
                {copy.addCalendar}
              </a>
              <Link href="/flights" className="rounded-xl bg-[#051741] px-4 py-2 text-sm font-bold text-white">
                {copy.backFlights}
              </Link>
            </div>
          </section>
        ) : selection && query ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-4">
              {!user && !loading ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="font-semibold text-amber-900">{copy.loginRequired}</p>
                  <button type="button" onClick={() => openAuth("login")} className="mt-3 rounded-xl bg-[#051741] px-4 py-2 text-sm font-bold text-white">
                    {copy.login}
                  </button>
                </div>
              ) : null}

              {step === "passengers" ? (
                <>
                  <section className="rounded-2xl border border-[#eadfcf] bg-white p-5">
                    <h2 className="text-lg font-bold text-[#051741]">{copy.contact}</h2>
                    <p className="mt-1 text-xs text-slate-500">{copy.contactHint}</p>
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <label className="text-sm text-slate-600">
                        {copy.email}
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          dir="ltr"
                          className={fieldClass}
                        />
                      </label>
                      <label className="text-sm text-slate-600">
                        {copy.phone}
                        <div className="mt-1 flex gap-2">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            dir="ltr"
                            className="rounded-xl border border-slate-200 bg-slate-50/60 px-2 py-3 text-sm"
                          >
                            {COUNTRY_CODES.map((code) => (
                              <option key={code} value={code}>{code}</option>
                            ))}
                          </select>
                          <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            dir="ltr"
                            inputMode="tel"
                            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm outline-none focus:border-[#051741] focus:bg-white"
                          />
                        </div>
                      </label>
                    </div>
                  </section>
                  {passengers.map((row, index) => (
                    <section key={row.id} className="rounded-2xl border border-[#eadfcf] bg-white p-5">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#051741] text-xs font-bold text-white">
                          {index + 1}
                        </span>
                        <h2 className="text-lg font-bold text-[#051741]">{copy.passengerN(index + 1, kindLabel(row.kind))}</h2>
                      </div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{copy.personalDetails}</p>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <label className="text-sm text-slate-600">
                          {copy.title}
                          <select value={row.title} onChange={(e) => updatePassenger(row.id, { title: e.target.value })} className={fieldClass}>
                            <option value="mr">Mr</option>
                            <option value="mrs">Mrs</option>
                            <option value="ms">Ms</option>
                          </select>
                        </label>
                        <label className="text-sm text-slate-600">
                          {copy.gender}
                          <select value={row.gender} onChange={(e) => updatePassenger(row.id, { gender: e.target.value })} className={fieldClass}>
                            <option value="">{copy.unspecified}</option>
                            <option value="male">{copy.male}</option>
                            <option value="female">{copy.female}</option>
                          </select>
                        </label>
                        <label className="text-sm text-slate-600">
                          {copy.firstName}
                          <input value={row.firstName} onChange={(e) => updatePassenger(row.id, { firstName: e.target.value })} dir="ltr" className={fieldClass} />
                        </label>
                        <label className="text-sm text-slate-600">
                          {copy.lastName}
                          <input value={row.lastName} onChange={(e) => updatePassenger(row.id, { lastName: e.target.value })} dir="ltr" className={fieldClass} />
                        </label>
                        <label className="text-sm text-slate-600">
                          {copy.dob}
                          <input type="date" lang="en" dir="ltr" value={row.dateOfBirth} onChange={(e) => updatePassenger(row.id, { dateOfBirth: e.target.value })} className={`${fieldClass} tabular-nums`} />
                        </label>
                        <label className="text-sm text-slate-600">
                          {copy.nationality}
                          <input value={row.nationality} onChange={(e) => updatePassenger(row.id, { nationality: e.target.value })} dir="ltr" className={fieldClass} />
                        </label>
                      </div>
                      <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">{copy.passportSection}</p>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <label className="text-sm text-slate-600">
                          {copy.passport}
                          <input value={row.passportNumber} onChange={(e) => updatePassenger(row.id, { passportNumber: e.target.value })} dir="ltr" className={`${fieldClass} tabular-nums`} />
                        </label>
                        <label className="text-sm text-slate-600">
                          {copy.issuingCountry}
                          <input value={row.passportCountry} onChange={(e) => updatePassenger(row.id, { passportCountry: e.target.value })} dir="ltr" className={fieldClass} />
                        </label>
                        <label className="text-sm text-slate-600">
                          {copy.expiry}
                          <input type="date" lang="en" dir="ltr" value={row.passportExpiry} onChange={(e) => updatePassenger(row.id, { passportExpiry: e.target.value })} className={`${fieldClass} tabular-nums`} />
                        </label>
                      </div>
                      <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">{copy.optionalSection}</p>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <label className="text-sm text-slate-600">
                          {copy.frequentFlyer}
                          <input value={row.frequentFlyer} onChange={(e) => updatePassenger(row.id, { frequentFlyer: e.target.value })} dir="ltr" className={fieldClass} />
                        </label>
                        <label className="text-sm text-slate-600">
                          {copy.meal}
                          <input value={row.meal} onChange={(e) => updatePassenger(row.id, { meal: e.target.value })} className={fieldClass} />
                        </label>
                      </div>
                    </section>
                  ))}
                  {!formValid ? <p className="text-xs text-slate-500">{copy.fillFields}</p> : null}
                  <button
                    type="button"
                    disabled={!passengersOk || !contactOk || saving}
                    onClick={() => void goReview()}
                    className="w-full rounded-xl bg-[#051741] py-3.5 font-bold text-white disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="mx-auto animate-spin" /> : copy.stepReview}
                  </button>
                </>
              ) : null}

              {step === "review" ? (
                <section className="space-y-5 rounded-2xl border border-[#eadfcf] bg-white p-5">
                  <h2 className="text-lg font-bold text-[#051741]">{copy.reviewTitle}</h2>
                  {fareChanged ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                      {copy.fareChanged}
                    </div>
                  ) : null}
                  <FlightItineraryRecap
                    selection={selection}
                    locale={locale}
                    copy={copy}
                    departDate={query.date}
                    returnDate={query.returnDate}
                    cabinLabel={cabinClassLabel(locale, query.cabinClass)}
                  />
                  <FlightExtrasPicker
                    packages={extraPackages}
                    selectedIds={selectedPackageIds(selection)}
                    fareSubtotal={fareOnly}
                    locale={locale}
                    copy={copy}
                    formatPrice={(amount) => formatFlightPrice(amount, currency)}
                    onToggle={toggleExtra}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-[#051741]">{copy.reviewPassengers}</h3>
                    <ul className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-100">
                      {passengers.map((row) => (
                        <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-sm">
                          <span className="font-semibold text-[#051741]">
                            {row.firstName} {row.lastName}
                          </span>
                          <span className="tabular-nums text-slate-500" dir="ltr">
                            {row.passportNumber} · {formatHumanDate(row.dateOfBirth, locale)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button type="button" onClick={() => setStep("payment")} className="w-full rounded-xl bg-[#051741] py-3.5 font-bold text-white">
                    {fareChanged ? copy.acceptFare : copy.stepPay}
                  </button>
                </section>
              ) : null}

              {step === "payment" ? (
                <>
                <CheckoutRewards
                  service="flights"
                  amount={total}
                  currency={currency}
                  onChange={onLoyalty}
                />
                <section className="space-y-3 rounded-2xl border border-[#eadfcf] bg-white p-5">
                  <h2 className="text-lg font-bold text-[#051741]">{copy.payTitle}</h2>
                  {cardEnabled ? (
                    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 ${method === "card" ? "border-[#1E64FF] bg-[#f4f7ff]" : "border-slate-200"}`}>
                      <input type="radio" name="pay" checked={method === "card"} onChange={() => setMethod("card")} className="mt-1" />
                      <div>
                        <p className="inline-flex items-center gap-2 font-semibold"><CreditCard size={16} /> {copy.payCard}</p>
                        <p className="mt-1 text-sm text-slate-600">{copy.cardHint}</p>
                      </div>
                    </label>
                  ) : (
                    <p className="text-sm text-slate-500">{copy.cardDisabled}</p>
                  )}
                  {method === "card" && cardEnabled ? <p className="rounded-xl bg-[#f4f7ff] px-3 py-2 text-xs text-slate-600">{copy.noPan}</p> : null}
                  {waEnabled && !checkoutHtml ? (
                    <label className={`flex items-start gap-3 rounded-xl border px-3 py-3 ${method === "whatsapp" ? "border-emerald-400 bg-emerald-50/60" : "border-slate-200"} ${checkoutHtml ? "pointer-events-none opacity-40" : "cursor-pointer"}`}>
                      <input
                        type="radio"
                        name="pay"
                        checked={method === "whatsapp"}
                        onChange={() => {
                          if (checkoutHtml) return;
                          setMethod("whatsapp");
                        }}
                        className="mt-1"
                      />
                      <div>
                        <p className="inline-flex items-center gap-2 font-semibold"><MessageCircle size={16} /> {copy.payWhatsApp}</p>
                        <p className="mt-1 text-sm text-slate-600">{copy.waHint}</p>
                      </div>
                    </label>
                  ) : null}
                  {turkishProduction ? (
                    <label className="block text-sm text-slate-600">
                      {copy.identity}
                      <input value={identityNumber} onChange={(e) => setIdentityNumber(e.target.value)} inputMode="numeric" maxLength={11} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" />
                      <span className="mt-1 block text-xs text-slate-500">{copy.identityHelp}</span>
                    </label>
                  ) : null}
                  {error ? <p className="text-sm text-red-600">{error}</p> : null}
                  {!checkoutHtml ? (
                    <button
                      type="button"
                      disabled={saving || !formValid || !user || (method === "card" ? !cardEnabled : !waEnabled)}
                      onClick={() => void submitPay(method)}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#051741] py-3.5 font-bold text-white disabled:opacity-50"
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                      {method === "card" ? copy.payCtaCard : copy.payCtaWa}
                    </button>
                  ) : null}
                  <p className="flex items-center justify-center gap-1 text-xs text-slate-400">
                    <Lock size={12} /> {t.hotels.securePayment}
                  </p>
                </section>
                </>
              ) : null}
            </div>

            <aside className="h-fit rounded-2xl border border-[#eadfcf] bg-white p-5 lg:sticky lg:top-28">
              <p className="text-sm font-bold text-[#051741]">{routeLabel}</p>
              <p className="mt-1 text-xs tabular-nums text-slate-500" dir="ltr">
                {formatHumanDateRange(query.date, query.returnDate, locale)}
              </p>
              <div className="mt-3">
                <FlightItineraryRecap
                  selection={selection}
                  locale={locale}
                  copy={copy}
                  departDate={query.date}
                  returnDate={query.returnDate}
                  cabinLabel={cabinClassLabel(locale, query.cabinClass)}
                  compact
                />
              </div>
              <div className="mt-4 border-t border-slate-100 pt-3">
                <FlightPriceBreakdown
                  copy={copy}
                  lines={priceLines()}
                  formatPrice={(amount) => formatFlightPrice(amount, currency)}
                />
              </div>
            </aside>
          </div>
        ) : null}
      </div>

      {checkoutHtml ? (
        <IyzicoSecureFrame
          html={checkoutHtml}
          title={copy.payCard}
          hostedNote={copy.noPan}
          closeLabel={copy.done}
          onClose={() => setCheckoutHtml("")}
        />
      ) : null}
    </div>
  );
}
