"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CreditCard,
  Loader2,
  Lock,
  MessageCircle,
  Plane,
  Hotel,
  Car,
  Compass,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Coffee,
  Users,
  Briefcase,
  MapPin,
  Calendar,
  Camera,
} from "lucide-react";
import { IyzicoSecureFrame } from "@/components/hotels/IyzicoPayPanel";
import CheckoutRewards, { type CheckoutLoyaltyValue } from "@/components/loyalty/CheckoutRewards";
import { useCustomerAuth } from "@/components/auth/CustomerAuthProvider";
import { flightDetails, initFlightBooking } from "@/components/flights/api";
import { formatHumanDate, formatHumanDateRange } from "@/components/flights/booking-format";
import { cabinClassLabel, flightCopy } from "@/components/flights/copy";
import FlightExtrasPicker from "@/components/flights/FlightExtrasPicker";
import FlightGuestLoginBanner from "@/components/flights/FlightGuestLoginBanner";
import FlightItineraryRecap from "@/components/flights/FlightItineraryRecap";
import FlightPriceBreakdown, { type PriceLine } from "@/components/flights/FlightPriceBreakdown";
import FlightPriceLockTimer from "@/components/flights/FlightPriceLockTimer";
import { bookingItinerarySnapshot, legsPayload } from "@/components/flights/normalize";
import { useFlightPrice } from "@/components/flights/useFlightPrice";
import { BOOKING_SESSION_KEY } from "@/components/flights/search-state";
import type {
  BookingStep,
  FareFamily,
  FlightSearchQuery,
  Itinerary,
  PassengerDraft,
  PassengerKind,
  SelectedFare,
} from "@/components/flights/types";
import { extraLocalizedTitle, extrasTotal, toLonalizaServiceLine } from "@/lib/agency-extras";
import { eticketIssuanceNote } from "@/lib/booking-notices";
import { buildFlightItinerarySnapshot } from "@/lib/flights/booking-snapshot";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { AgencyExtraPackage } from "@/types/agency-extra";
import { isSandboxPriceLimitError } from "@/lib/iyzico-limits";
import { getBusinessWhatsAppNumber } from "@/lib/site-whatsapp";
import { buildWhatsAppLink, normalizeWhatsAppNumber } from "@/lib/utils";
import SafeImage from "@/components/ui/SafeImage";

// Cross-sell components & types
import FlightBookingCrossSell, {
  type SelectedTransferBooking,
  type SelectedTourBooking,
  type PrimaryTravelerInfo,
} from "./booking/FlightBookingCrossSell";
import type { SelectedHotelBooking } from "./booking/FlightBookingHotelRoomsModal";
import FlightBookingSmartConcierge, {
  type ExtractedPassportData,
} from "./booking/FlightBookingSmartConcierge";

type PayConfig = {
  iyzicoEnabled: boolean;
  whatsappBankLinkEnabled: boolean;
  iyzicoMode: "sandbox" | "production";
  whatsappNumber: string;
};

type PayMethod = "whatsapp" | "card";

const COUNTRY_CODES = [
  "+90",
  "+971",
  "+966",
  "+20",
  "+962",
  "+964",
  "+965",
  "+974",
  "+973",
  "+968",
  "+44",
  "+49",
  "+1",
];

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
  crossSellHotel?: SelectedHotelBooking | null;
  crossSellTransfer?: SelectedTransferBooking | null;
  crossSellTours?: SelectedTourBooking[];
};

const fieldClass =
  "mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-purple-950 outline-none transition-colors focus:border-purple-600 focus:bg-white focus:ring-1 focus:ring-purple-600/30";

function selectedPackageIds(selection: SelectedFare): string[] {
  return selection.extras.packageIds || [];
}

function fareSubtotal(selection: SelectedFare, pax: number): number {
  const unit = selection.fare?.price || selection.itinerary.price;
  const bag = selection.extras.paidBaggage?.price || 0;
  return (unit + bag) * Math.max(1, pax);
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

  // Cross-sell states
  const [selectedHotel, setSelectedHotel] = useState<SelectedHotelBooking | null>(null);
  const [selectedTransfer, setSelectedTransfer] = useState<SelectedTransferBooking | null>(null);
  const [selectedTours, setSelectedTours] = useState<SelectedTourBooking[]>([]);
  const [availableItineraries, setAvailableItineraries] = useState<Itinerary[]>([]);

  // Passport OCR scan states
  const [scanningPassengerId, setScanningPassengerId] = useState<string | null>(null);
  const [scanSuccessPassengerId, setScanSuccessPassengerId] = useState<string | null>(null);

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
      const parsed = JSON.parse(raw) as {
        query?: FlightSearchQuery;
        selection?: SelectedFare;
        availableItineraries?: Itinerary[];
        selectedHotel?: SelectedHotelBooking | null;
        selectedTransfer?: SelectedTransferBooking | null;
        selectedTours?: SelectedTourBooking[];
      };
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
      if (Array.isArray(parsed.availableItineraries) && parsed.availableItineraries.length > 0) {
        setAvailableItineraries(parsed.availableItineraries);
      } else {
        try {
          const rawFallback = sessionStorage.getItem("LONALIZA_LAST_SEARCH_ITINERARIES");
          if (rawFallback) {
            const parsedFallback = JSON.parse(rawFallback);
            if (Array.isArray(parsedFallback) && parsedFallback.length > 0) {
              setAvailableItineraries(parsedFallback);
            }
          }
        } catch {
          /* ignore */
        }
      }
      if (parsed.selectedHotel) {
        setSelectedHotel(parsed.selectedHotel);
      }
      if (parsed.selectedTransfer) {
        setSelectedTransfer(parsed.selectedTransfer);
      }
      if (Array.isArray(parsed.selectedTours) && parsed.selectedTours.length > 0) {
        setSelectedTours(parsed.selectedTours);
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
      .then(
        (data: {
          ok?: boolean;
          booking?: {
            hotel_name?: string;
            room_name?: string;
            check_in?: string;
            check_out?: string;
            price?: number;
            currency?: string;
            guest_names?: string[];
            snapshot?: Record<string, unknown>;
            offer_snapshot?: Record<string, unknown>;
          };
        }) => {
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
            crossSellHotel: (snap.crossSellHotel as SelectedHotelBooking) || null,
            crossSellTransfer: (snap.crossSellTransfer as SelectedTransferBooking) || null,
            crossSellTours: Array.isArray(snap.crossSellTours) ? (snap.crossSellTours as SelectedTourBooking[]) : [],
          });
          if (params.get("payment") === "paid") setStep("done");
        }
      )
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
  const flightBaseTotal = selection ? selectionTotal(selection, paxCount, extraPackages) : paidSnapshot?.price || 0;

  // Cross-sell totals
  const hotelTotal = selectedHotel ? selectedHotel.totalPrice : paidSnapshot?.crossSellHotel?.totalPrice || 0;
  const transferTotal = selectedTransfer ? selectedTransfer.price : paidSnapshot?.crossSellTransfer?.price || 0;
  const toursTotal = selectedTours.reduce((sum, t) => sum + t.totalPrice, 0) || (paidSnapshot?.crossSellTours?.reduce((sum, t) => sum + t.totalPrice, 0) || 0);
  const crossSellSum = hotelTotal + transferTotal + toursTotal;

  // Grand Total
  const total = flightBaseTotal + crossSellSum;
  const dueTotal = loyalty && loyalty.discountUsd > 0 ? Math.max(0, total - loyalty.discountUsd) : total;

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

  // Primary traveler info for one-click auto-sync
  const primaryPassenger = useMemo<PrimaryTravelerInfo | undefined>(() => {
    const first = passengers[0];
    if (!first || !first.firstName) return undefined;
    return {
      firstName: first.firstName,
      lastName: first.lastName,
      email,
      phone: `${countryCode}${phoneDigits}`,
      passportNumber: first.passportNumber,
    };
  }, [passengers, email, countryCode, phoneDigits]);

  const arrivalAirportCode = useMemo(() => {
    const leg = selection?.itinerary.legs[0];
    return (leg?.destination?.displayCode || query?.destination?.iata || query?.destination?.skyId || "IST").toUpperCase();
  }, [selection, query]);

  const originAirportCode = useMemo(() => {
    const leg = selection?.itinerary.legs[0];
    return (leg?.origin?.displayCode || query?.origin?.iata || query?.origin?.skyId || "SAW").toUpperCase();
  }, [selection, query]);

  const destinationCity = useMemo(() => {
    const leg = selection?.itinerary.legs[0];
    const code = (leg?.destination?.displayCode || query?.destination?.iata || query?.destination?.skyId || "").toUpperCase();
    const GLOBAL_IATA_MAP: Record<string, { ar: string; en: string }> = {
      // Saudi Arabia
      RUH: { ar: "الرياض", en: "Riyadh" },
      JED: { ar: "جدة", en: "Jeddah" },
      DMM: { ar: "الدمام", en: "Dammam" },
      MED: { ar: "المدينة المنورة", en: "Medina" },
      AHB: { ar: "أبها", en: "Abha" },
      TIF: { ar: "الطائف", en: "Taif" },
      ELQ: { ar: "القصيم", en: "Qassim" },
      TUU: { ar: "تبوك", en: "Tabuk" },
      GIZ: { ar: "جازان", en: "Jazan" },
      // UAE & Gulf
      DXB: { ar: "دبي", en: "Dubai" },
      DWC: { ar: "دبي", en: "Dubai" },
      SHJ: { ar: "الشارقة", en: "Sharjah" },
      AUH: { ar: "أبوظبي", en: "Abu Dhabi" },
      DOH: { ar: "الدوحة", en: "Doha" },
      KWI: { ar: "الكويت", en: "Kuwait" },
      BAH: { ar: "المنامة", en: "Manama" },
      MCT: { ar: "مسقط", en: "Muscat" },
      // North Africa & Levant
      CAI: { ar: "القاهرة", en: "Cairo" },
      HBE: { ar: "الإسكندرية", en: "Alexandria" },
      SSH: { ar: "شرم الشيخ", en: "Sharm El Sheikh" },
      HRG: { ar: "الغردقة", en: "Hurghada" },
      AMM: { ar: "عمّان", en: "Amman" },
      BEY: { ar: "بيروت", en: "Beirut" },
      BGW: { ar: "بغداد", en: "Baghdad" },
      EBL: { ar: "أربيل", en: "Erbil" },
      CMN: { ar: "الدار البيضاء", en: "Casablanca" },
      RAK: { ar: "مراكش", en: "Marrakech" },
      TUN: { ar: "تونس", en: "Tunis" },
      ALG: { ar: "الجزائر", en: "Algiers" },
      // Turkey
      IST: { ar: "إسطنبول", en: "Istanbul" },
      SAW: { ar: "إسطنبول", en: "Istanbul" },
      AYT: { ar: "أنطاليا", en: "Antalya" },
      TZX: { ar: "طرابزون", en: "Trabzon" },
      BJV: { ar: "بودروم", en: "Bodrum" },
      DLM: { ar: "دالامان", en: "Dalaman" },
      ADB: { ar: "إزمير", en: "Izmir" },
      NAV: { ar: "كابادوكيا", en: "Cappadocia" },
      ASR: { ar: "قيصري", en: "Kayseri" },
      // Europe & Global
      MAD: { ar: "مدريد", en: "Madrid" },
      BCN: { ar: "برشلونة", en: "Barcelona" },
      AGP: { ar: "مالقة", en: "Malaga" },
      CDG: { ar: "باريس", en: "Paris" },
      ORY: { ar: "باريس", en: "Paris" },
      LHR: { ar: "لندن", en: "London" },
      LGW: { ar: "لندن", en: "London" },
      STN: { ar: "لندن", en: "London" },
      FCO: { ar: "روما", en: "Rome" },
      MXP: { ar: "ميلانو", en: "Milan" },
      FRA: { ar: "فرانكفورت", en: "Frankfurt" },
      MUC: { ar: "ميونخ", en: "Munich" },
      VIE: { ar: "فيينا", en: "Vienna" },
      AMS: { ar: "أمستردام", en: "Amsterdam" },
      ATH: { ar: "أثينا", en: "Athens" },
      TBS: { ar: "تبليسي", en: "Tbilisi" },
      GYD: { ar: "باكو", en: "Baku" },
      EVN: { ar: "يريفان", en: "Yerevan" },
      BKK: { ar: "بانكوك", en: "Bangkok" },
      KUL: { ar: "كوالالمبور", en: "Kuala Lumpur" },
    };
    if (code && GLOBAL_IATA_MAP[code]) {
      return locale === "ar" ? GLOBAL_IATA_MAP[code].ar : GLOBAL_IATA_MAP[code].en;
    }
    const raw = query?.destination?.city || query?.destination?.name || leg?.destination?.city || leg?.destination?.name;
    if (raw && !raw.match(/^[A-Z]{3}$/)) return raw;
    return code || (locale === "ar" ? "وجهتك" : "Destination");
  }, [selection, query, locale]);

  const originCity = useMemo(() => {
    const leg = selection?.itinerary.legs[0];
    const code = (leg?.origin?.displayCode || query?.origin?.iata || query?.origin?.skyId || "").toUpperCase();
    const GLOBAL_IATA_MAP: Record<string, { ar: string; en: string }> = {
      // Saudi Arabia
      RUH: { ar: "الرياض", en: "Riyadh" },
      JED: { ar: "جدة", en: "Jeddah" },
      DMM: { ar: "الدمام", en: "Dammam" },
      MED: { ar: "المدينة المنورة", en: "Medina" },
      AHB: { ar: "أبها", en: "Abha" },
      TIF: { ar: "الطائف", en: "Taif" },
      ELQ: { ar: "القصيم", en: "Qassim" },
      TUU: { ar: "تبوك", en: "Tabuk" },
      GIZ: { ar: "جازان", en: "Jazan" },
      // UAE & Gulf
      DXB: { ar: "دبي", en: "Dubai" },
      DWC: { ar: "دبي", en: "Dubai" },
      SHJ: { ar: "الشارقة", en: "Sharjah" },
      AUH: { ar: "أبوظبي", en: "Abu Dhabi" },
      DOH: { ar: "الدوحة", en: "Doha" },
      KWI: { ar: "الكويت", en: "Kuwait" },
      BAH: { ar: "المنامة", en: "Manama" },
      MCT: { ar: "مسقط", en: "Muscat" },
      // North Africa & Levant
      CAI: { ar: "القاهرة", en: "Cairo" },
      HBE: { ar: "الإسكندرية", en: "Alexandria" },
      SSH: { ar: "شرم الشيخ", en: "Sharm El Sheikh" },
      HRG: { ar: "الغردقة", en: "Hurghada" },
      AMM: { ar: "عمّان", en: "Amman" },
      BEY: { ar: "بيروت", en: "Beirut" },
      BGW: { ar: "بغداد", en: "Baghdad" },
      EBL: { ar: "أربيل", en: "Erbil" },
      CMN: { ar: "الدار البيضاء", en: "Casablanca" },
      RAK: { ar: "مراكش", en: "Marrakech" },
      TUN: { ar: "تونس", en: "Tunis" },
      ALG: { ar: "الجزائر", en: "Algiers" },
      // Turkey
      IST: { ar: "إسطنبول", en: "Istanbul" },
      SAW: { ar: "إسطنبول", en: "Istanbul" },
      AYT: { ar: "أنطاليا", en: "Antalya" },
      TZX: { ar: "طرابزون", en: "Trabzon" },
      BJV: { ar: "بودروم", en: "Bodrum" },
      DLM: { ar: "دالامان", en: "Dalaman" },
      ADB: { ar: "إزمير", en: "Izmir" },
      NAV: { ar: "كابادوكيا", en: "Cappadocia" },
      ASR: { ar: "قيصري", en: "Kayseri" },
      // Europe & Global
      MAD: { ar: "مدريد", en: "Madrid" },
      BCN: { ar: "برشلونة", en: "Barcelona" },
      AGP: { ar: "مالقة", en: "Malaga" },
      CDG: { ar: "باريس", en: "Paris" },
      ORY: { ar: "باريس", en: "Paris" },
      LHR: { ar: "لندن", en: "London" },
      LGW: { ar: "لندن", en: "London" },
      STN: { ar: "لندن", en: "London" },
      FCO: { ar: "روما", en: "Rome" },
      MXP: { ar: "ميلانو", en: "Milan" },
      FRA: { ar: "فرانكفورت", en: "Frankfurt" },
      MUC: { ar: "ميونخ", en: "Munich" },
      VIE: { ar: "فيينا", en: "Vienna" },
      AMS: { ar: "أمستردام", en: "Amsterdam" },
      ATH: { ar: "أثينا", en: "Athens" },
      TBS: { ar: "تبليسي", en: "Tbilisi" },
      GYD: { ar: "باكو", en: "Baku" },
      EVN: { ar: "يريفان", en: "Yerevan" },
      BKK: { ar: "بانكوك", en: "Bangkok" },
      KUL: { ar: "كوالالمبور", en: "Kuala Lumpur" },
    };
    if (code && GLOBAL_IATA_MAP[code]) {
      return locale === "ar" ? GLOBAL_IATA_MAP[code].ar : GLOBAL_IATA_MAP[code].en;
    }
    const raw = query?.origin?.city || query?.origin?.name || leg?.origin?.city || leg?.origin?.name;
    if (raw && !raw.match(/^[A-Z]{3}$/)) return raw;
    return code || (locale === "ar" ? "المغادرة" : "Origin");
  }, [selection, query, locale]);

  const flightNumber = useMemo(() => {
    const leg = selection?.itinerary.legs[0];
    const carrier = leg?.carriers[0]?.code || "TK";
    const num = leg?.segments?.[0]?.flightNumber || "1982";
    return `${carrier} ${num}`;
  }, [selection]);

  const handleReplaceFlight = useCallback(
    (newItinerary: Itinerary, newFare?: FareFamily | null) => {
      setSelection((prev) => {
        if (!prev) return prev;
        const assignedFare =
          newFare !== undefined
            ? newFare
            : newItinerary.fareFamilies && newItinerary.fareFamilies.length > 0
            ? newItinerary.fareFamilies[0]
            : null;

        const updated: SelectedFare = {
          ...prev,
          itinerary: newItinerary,
          fare: assignedFare,
        };
        try {
          const raw = sessionStorage.getItem(BOOKING_SESSION_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            parsed.selection = updated;
            sessionStorage.setItem(BOOKING_SESSION_KEY, JSON.stringify(parsed));
          }
        } catch {}
        return updated;
      });
    },
    []
  );

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
            ? {
                ...selection.fare,
                price:
                  fresh.fareFamilies.find((f) => f.id === selection.fare?.id)?.price ||
                  selection.fare.price,
              }
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
    const lines = [
      locale === "ar"
        ? "مرحباً لوناليزا للسياحة، أرغب بإتمام حجز الطيران والخدمات المرفقة عبر الرابط البنكي الرسمي."
        : "Hello Lonaliza Tourism, I would like to complete this flight & travel booking via the official bank link.",
      `الرحلة: ${routeLabel}`,
      `التواريخ: ${`${query?.date || ""} ${query?.returnDate || ""}`.trim()}`,
      `المسافرين: ${names}`,
    ];

    if (selectedHotel) {
      lines.push(
        `الفندق: ${selectedHotel.hotelName} - ${selectedHotel.roomName} (${selectedHotel.nightsCount} ليالٍ): ${formatFlightPrice(
          selectedHotel.totalPrice,
          currency
        )}`
      );
    }
    if (selectedTransfer) {
      lines.push(
        `الترانسفير: ${selectedTransfer.vehicleName} (${selectedTransfer.routeType === "roundtrip" ? "ذهاب وعودة" : "اتجاه واحد"}) - رحلة ${selectedTransfer.flightNumber}: ${formatFlightPrice(
          selectedTransfer.price,
          currency
        )}`
      );
    }
    for (const tour of selectedTours) {
      lines.push(`جولة: ${tour.titleAr} (${tour.paxCount} مسافرين): ${formatFlightPrice(tour.totalPrice, currency)}`);
    }

    lines.push(`${copy.total}: ${formatFlightPrice(total, currency)}`);
    lines.push(`للتواصل: ${email} · ${countryCode} ${phone}`);

    return lines.filter(Boolean).join("\n");
  };

  const persistEnquiry = async () => {
    if (!selection || !query) return;
    const first = passengers[0];
    const name = `${first?.firstName || ""} ${first?.lastName || ""}`.trim();
    const created = await initFlightBooking({
      itineraryId: selection.itinerary.id,
      fareId: selection.fare?.id || undefined,
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

  const startCard = async (flightBookingId?: string) => {
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
          // Lonaliza services (AirFlex-like): sold & fulfilled by Lonaliza, never sent to the supplier.
          lonalizaServices: lonalizaServicesSnapshot(),
          lonaliza_refund_guarantee: chosenExtras.some((pkg) => pkg.kind === "refund_guarantee"),
          lonaliza_flex_change: chosenExtras.some((pkg) => pkg.kind === "flex_change"),
          flight_booking_id: flightBookingId || bookingRef || undefined,
          selected_fare_id: selection.fare?.id || undefined,
          crossSellHotel: selectedHotel,
          crossSellTransfer: selectedTransfer,
          crossSellTours: selectedTours,
          multiSupplierDispatch: {
            flight: {
              provider: (selection.itinerary as { provider?: string }).provider || "travelport",
              itineraryId: selection.itinerary.id,
              amount: fareOnly,
            },
            hotel: selectedHotel
              ? {
                  provider: selectedHotel.supplier,
                  hotelId: selectedHotel.hotelId,
                  hotelName: selectedHotel.hotelName,
                  roomId: selectedHotel.roomId,
                  roomName: selectedHotel.roomName,
                  checkIn: selectedHotel.checkIn,
                  checkOut: selectedHotel.checkOut,
                  amount: selectedHotel.totalPrice,
                }
              : null,
            transfer: selectedTransfer
              ? {
                  provider: selectedTransfer.supplier,
                  vehicleType: selectedTransfer.vehicleType,
                  flightNumber: selectedTransfer.flightNumber,
                  routeType: selectedTransfer.routeType,
                  pickupLocation: selectedTransfer.pickupLocation,
                  dropoffLocation: selectedTransfer.dropoffLocation,
                  amount: selectedTransfer.price,
                }
              : null,
            tours: selectedTours.map((t) => ({
              tourId: t.id,
              tourTitle: t.titleAr,
              pax: t.paxCount,
              amount: t.totalPrice,
            })),
          },
          issuanceNotice: eticketIssuanceNote(locale),
        },
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      errorCode?: string;
      coveredInFull?: boolean;
      booking?: { id?: string; status?: string };
      price?: { client?: number; currency?: string };
    };
    if (res.status === 401 || data.error === "login_required") {
      openAuth("login");
      return;
    }
    if (data.errorCode === "flight_price_changed") {
      const nextPrice = Number(data.price?.client);
      if (nextPrice > 0) {
        setSelection({ ...selection, itinerary: { ...selection.itinerary, price: nextPrice, currency: String(data.price?.currency || currency) } });
      }
      setFareChanged(true);
      setStep("review");
      return;
    }
    if (data.errorCode === "flight_fare_unavailable" || data.errorCode === "flight_quote_failed") {
      setError(data.errorCode === "flight_quote_failed" ? copy.quoteFailed : copy.fareUnavailable);
      return;
    }
    if (!res.ok || !data.ok || !data.booking?.id) {
      setError(data.error || t.auth.failed);
      return;
    }
    setBookingRef(data.booking.id);
    if (selectedHotel) {
      try {
        await fetch("/api/hotel-bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quoteId: selectedHotel.quoteId || undefined,
            hotel_id: selectedHotel.hotelId,
            hotel_name: selectedHotel.hotelName,
            hotel_slug: selectedHotel.hotelId,
            room_id: selectedHotel.roomId,
            room_name: selectedHotel.roomName,
            check_in: selectedHotel.checkIn,
            check_out: selectedHotel.checkOut,
            adults: selectedHotel.guestsCount || query.adults,
            children: query.childrens,
            guest_names: passengers.map((row) => `${row.firstName} ${row.lastName} · ${row.passportNumber}`),
            customer_name: name,
            customer_email: email,
            customer_phone: `${countryCode}${phoneDigits}`,
            price: selectedHotel.totalPrice,
            currency: selectedHotel.currency || currency,
            provider: selectedHotel.quoteId ? selectedHotel.supplier : "internal",
            offer_snapshot: {
              flight_booking_id: data.booking.id,
              hotelPhoto: selectedHotel.hotelPhoto,
              roomPhoto: selectedHotel.roomPhoto,
              breakfastIncluded: selectedHotel.breakfastIncluded,
              freeCancellation: selectedHotel.freeCancellation,
              boardName: selectedHotel.boardName,
              photos: selectedHotel.photos,
            },
          }),
        });
      } catch {
        /* flight booking remains; hotel companion retried by ops */
      }
    }
    if (data.coveredInFull || data.booking.status === "paid") {
      setStep("done");
      return;
    }
    const identity = turkishProduction ? identityNumber.replace(/\D/g, "") : first.passportNumber.trim();
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
      const enquiry = await persistEnquiry();
      if (enquiry?.fareChanged) {
        // The supplier re-priced the fare: show the new amount and let the customer accept it explicitly.
        setStep("review");
        return;
      }
      await startCard(enquiry?.bookingId);
    } catch (err) {
      const code = err instanceof Error ? err.message : "";
      setError(code === "fare_unavailable" || code === "not_bookable" ? copy.fareUnavailable : code === "quote_failed" ? copy.quoteFailed : t.hotels.iyzicoNetwork);
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

  const lonalizaServicesSnapshot = () =>
    chosenExtras.map((pkg) => toLonalizaServiceLine(pkg, fareOnly, locale, currency));

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
    if (selectedHotel) {
      lines.push({
        id: "cross_sell_hotel",
        label: `${locale === "ar" ? "فندق" : "Hotel"}: ${selectedHotel.hotelName} (${selectedHotel.roomName})`,
        amount: selectedHotel.totalPrice,
        kind: "extra",
      });
    }
    if (selectedTransfer) {
      lines.push({
        id: "cross_sell_transfer",
        label: `${locale === "ar" ? "استقبال" : "Transfer"}: ${selectedTransfer.vehicleName} (${selectedTransfer.routeType === "roundtrip" ? (locale === "ar" ? "ذهاب وعودة" : "Roundtrip") : (locale === "ar" ? "اتجاه واحد" : "One-way")})`,
        amount: selectedTransfer.price,
        kind: "extra",
      });
    }
    for (const tour of selectedTours) {
      lines.push({
        id: `tour_${tour.id}`,
        label: `${locale === "ar" ? "جولة" : "Tour"}: ${tour.titleAr}`,
        amount: tour.totalPrice,
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

  useEffect(() => {
    if (!query || !selection) return;
    try {
      sessionStorage.setItem(
        BOOKING_SESSION_KEY,
        JSON.stringify({
          query,
          selection,
          selectedHotel,
          selectedTransfer,
          selectedTours,
        })
      );
    } catch {
      /* ignore */
    }
  }, [query, selection, selectedHotel, selectedTransfer, selectedTours]);

  const handlePassengerPassportUpload = async (passengerId: string, file: File) => {
    try {
      setScanningPassengerId(passengerId);
      setScanSuccessPassengerId(null);
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const res = reader.result as string;
          resolve(res.split(",")[1] || "");
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const imageBase64 = await base64Promise;

      const res = await fetch("/api/ai/passport-ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          mimeType: file.type || "image/jpeg",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.data) {
        throw new Error(data.error || "Failed to scan passport");
      }

      const p = data.data as ExtractedPassportData;
      updatePassenger(passengerId, {
        firstName: p.firstName || undefined,
        lastName: p.lastName || undefined,
        title: p.title || "mr",
        gender: p.gender || undefined,
        dateOfBirth: p.dateOfBirth || undefined,
        nationality: p.nationality || undefined,
        passportNumber: p.passportNumber || undefined,
        passportCountry: p.passportCountry || undefined,
        passportExpiry: p.passportExpiry || undefined,
      });

      setScanSuccessPassengerId(passengerId);
      setTimeout(() => setScanSuccessPassengerId(null), 6000);
    } catch (err) {
      console.error("Passport scan error:", err);
      alert(
        locale === "ar"
          ? "تعذر مسح الجواز بدقة، يرجى التأكد من وضوح الصورة والمحاولة مجدداً."
          : "Failed to scan passport. Please ensure the image is clear and try again."
      );
    } finally {
      setScanningPassengerId(null);
    }
  };

  const handleApplyPassportFromConcierge = (p: ExtractedPassportData) => {
    if (!passengers.length) return;
    const target = passengers[0];
    updatePassenger(target.id, {
      firstName: p.firstName || target.firstName,
      lastName: p.lastName || target.lastName,
      title: p.title || target.title,
      gender: p.gender || target.gender,
      dateOfBirth: p.dateOfBirth || target.dateOfBirth,
      nationality: p.nationality || target.nationality,
      passportNumber: p.passportNumber || target.passportNumber,
      passportCountry: p.passportCountry || target.passportCountry,
      passportExpiry: p.passportExpiry || target.passportExpiry,
    });
    setScanSuccessPassengerId(target.id);
    setTimeout(() => setScanSuccessPassengerId(null), 6000);
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
      <div className="min-h-screen bg-[#faf8fd] px-4 pt-32 text-center">
        <p className="font-bold text-purple-950">{copy.emptyTitle}</p>
        <Link href="/flights" className="mt-4 inline-block text-sm font-semibold text-amber-600">
          {copy.backFlights}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8fd] pb-16 pt-24">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Link
          href="/flights/search"
          className="inline-flex items-center gap-1 text-sm font-bold text-purple-900 transition-colors hover:text-purple-950"
        >
          ← {copy.backFlights}
        </Link>

        {step !== "done" ? (
          <div className="mb-5 mt-4 space-y-4">
            <FlightPriceLockTimer />
            <FlightGuestLoginBanner service="flights" />

            {/* Autonomous AI Concierge: Live Flight-Linked Discovery & Passport OCR */}
            <FlightBookingSmartConcierge
              destinationCity={destinationCity}
              originCity={originCity}
              departDate={query?.date || ""}
              returnDate={query?.returnDate}
              paxCount={paxCount}
              currency={currency}
              flightNumber={flightNumber}
              arrivalAirportCode={arrivalAirportCode}
              originAirportCode={originAirportCode}
              currentItinerary={selection?.itinerary}
              searchQuery={query}
              availableItineraries={availableItineraries}
              onApplyPassportData={handleApplyPassportFromConcierge}
              onSelectHotel={setSelectedHotel}
              onSelectTransfer={setSelectedTransfer}
              onSelectTour={(tour) => {
                setSelectedTours((prev) =>
                  prev.some((t) => t.id === tour.id) ? prev : [...prev, tour]
                );
              }}
              onReplaceFlight={handleReplaceFlight}
            />
          </div>
        ) : null}

        <div className="mb-6 mt-4 flex flex-wrap items-center gap-2 text-sm">
          {steps.map(([key, label], i) => (
            <div key={key} className="flex items-center gap-2">
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition-all ${
                  key === step || (step === "done" && key === "payment")
                    ? "bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-white ring-2 ring-purple-300/50 shadow-xs"
                    : "border border-purple-200 bg-white text-slate-500"
                }`}
              >
                {i + 1}
              </span>
              <span className={key === step ? "font-black text-purple-950" : "font-medium text-slate-500"}>
                {label}
              </span>
              {i < steps.length - 1 ? <span className="text-purple-300">—</span> : null}
            </div>
          ))}
        </div>

        {step === "done" ? (
          <section className="space-y-6 rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-900 shadow-inner">
                <Plane size={32} />
              </div>
              <h1 className="mt-4 text-2xl font-black text-purple-950">{copy.confirmTitle}</h1>
              <p className="mt-2 text-sm text-slate-600">
                {copy.bookingRef}: <strong dir="ltr">{bookingRef || "—"}</strong>
              </p>
              <p className="mt-1 text-xl font-black text-purple-950">{formatFlightPrice(total, currency)}</p>
              {method === "whatsapp" && !cardPaid ? (
                <p className="mt-3 text-sm text-slate-500">{t.hotels.whatsappSentNote}</p>
              ) : cardPaid ? (
                <p className="mt-3 text-sm font-bold text-emerald-700">{t.hotels.bookingPaid}</p>
              ) : null}
              <p className="mx-auto mt-4 max-w-md rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
                {copy.eticketIssuanceNote}
              </p>
            </div>

            {/* Flight Itinerary Recap */}
            <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-5 text-start">
              <p className="text-sm font-black text-purple-950 mb-3">{copy.itineraryTitle}</p>
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
            </div>

            {/* Cross-Sell Hotel Confirmation Voucher Card (if selected) */}
            {(selectedHotel || paidSnapshot?.crossSellHotel) && (
              <div className="rounded-2xl border-2 border-purple-300 bg-gradient-to-r from-purple-50 via-white to-amber-50/50 p-5 text-start shadow-sm">
                <div className="flex items-center justify-between gap-2 border-b border-purple-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-900 text-amber-300">
                      <Hotel size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-purple-950">
                        {locale === "ar" ? "قسيمة حجز الفندق المؤكدة" : "Confirmed Hotel Voucher"}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {locale === "ar" ? "مزود الإقامة: تم تأكيد التخصيص والمطابقة الفورية" : "Provider confirmed"}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                    ✓ مؤكد ومسجل
                  </span>
                </div>

                {(() => {
                  const h = selectedHotel || paidSnapshot?.crossSellHotel;
                  if (!h) return null;
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4 items-start">
                      <div className="relative h-24 w-full overflow-hidden rounded-xl">
                        <SafeImage src={h.roomPhoto || h.hotelPhoto} alt={h.hotelName} fill className="object-cover" />
                      </div>
                      <div>
                        <h5 className="font-black text-purple-950 text-sm">{h.hotelName}</h5>
                        <p className="text-xs text-slate-600">{h.roomName}{h.bedType ? ` · ${h.bedType}` : ""}</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {h.checkIn} ← {h.checkOut} ({h.nightsCount} {locale === "ar" ? "ليالٍ" : "nights"})
                        </p>
                        <p className="text-[11px] text-slate-600 mt-1">
                          {h.breakfastIncluded || h.boardName ? (h.boardName || (locale === "ar" ? "إفطار مشمول" : "Breakfast included")) : locale === "ar" ? "بدون وجبة" : "Room only"}
                          {" · "}
                          {h.freeCancellation ? (locale === "ar" ? "إلغاء مجاني" : "Free cancellation") : locale === "ar" ? "غير قابل للإلغاء" : "Non-refundable"}
                        </p>
                        <p className="mt-2 text-sm font-black text-purple-950">
                          {locale === "ar" ? "سعر الفندق" : "Hotel"}: {formatFlightPrice(h.totalPrice, h.currency || currency)}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Cross-Sell Transfer Confirmation Voucher Card (if selected) */}
            {(selectedTransfer || paidSnapshot?.crossSellTransfer) && (
              <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50/60 via-white to-purple-50/40 p-5 text-start shadow-sm">
                <div className="flex items-center justify-between gap-2 border-b border-amber-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-slate-950">
                      <Car size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-purple-950">
                        {locale === "ar" ? "تأكيد خدمة الترانسفير والاستقبال VIP" : "Confirmed VIP Airport Transfer"}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {locale === "ar" ? "الربط مع مزود النقل Seeru Ride: تم توجيه السائق" : "Dispatched via Seeru Ride"}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                    ✓ جاهز للاستقبال
                  </span>
                </div>

                {(() => {
                  const tr = selectedTransfer || paidSnapshot?.crossSellTransfer;
                  if (!tr) return null;
                  return (
                    <div className="space-y-2 text-xs text-slate-700">
                      <p className="font-bold text-purple-950 text-sm">{tr.vehicleName}</p>
                      <p>
                        📍 <strong>المسار:</strong> {tr.pickupLocation} ← {tr.dropoffLocation}
                      </p>
                      <p>
                        ✈️ <strong>رقم الرحلة للتعقب:</strong> {tr.flightNumber} · <strong>التاريخ والوقت:</strong> {tr.date} {tr.time}
                      </p>
                      <p className="text-[11px] text-amber-900 bg-amber-100/60 p-2 rounded-lg font-medium">
                        💡 السائق الخاص سينتظرك عند بوابة المطار حاملاً لوحة باسم المسافر ({tr.guestName}).
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Cross-Sell Tours Voucher Card (if selected) */}
            {((selectedTours && selectedTours.length > 0) || (paidSnapshot?.crossSellTours && paidSnapshot.crossSellTours.length > 0)) && (
              <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5 text-start shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Compass size={18} className="text-purple-900" />
                  <h4 className="text-sm font-black text-purple-950">
                    {locale === "ar" ? "تأكيد الجولات السياحية المضافة" : "Confirmed Tours & Activities"}
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(selectedTours.length ? selectedTours : paidSnapshot?.crossSellTours || []).map((tour) => (
                    <div key={tour.id} className="rounded-xl border border-purple-100 bg-white p-3 flex items-center gap-3">
                      <div className="relative h-14 w-16 rounded-lg overflow-hidden shrink-0">
                        <SafeImage src={tour.photoUrl} alt={tour.titleAr} fill className="object-cover" />
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-purple-950 line-clamp-1">{tour.titleAr}</h5>
                        <p className="text-[11px] text-slate-500">{tour.duration} · {tour.paxCount} أشخاص</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {params.get("confirm") && bookingRef && !bookingRef.startsWith("flt_") && !bookingRef.startsWith("WA-") ? (
                <a
                  href={`/api/hotel-bookings/${encodeURIComponent(bookingRef)}/pdf?confirm=${encodeURIComponent(
                    params.get("confirm") || ""
                  )}`}
                  className="rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-3 text-sm font-black text-slate-950 shadow-md hover:brightness-110"
                >
                  {copy.downloadInvoice}
                </a>
              ) : bookingRef.startsWith("flt_") ? (
                <a
                  href={`/api/flights/invoice/${encodeURIComponent(bookingRef)}`}
                  className="rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-3 text-sm font-black text-slate-950 shadow-md hover:brightness-110"
                >
                  {copy.downloadInvoice}
                </a>
              ) : null}
              <a
                href={calendarHref()}
                className="rounded-2xl border border-purple-200 bg-white px-5 py-3 text-sm font-bold text-purple-950 hover:bg-purple-50"
              >
                {copy.addCalendar}
              </a>
              <Link
                href="/flights"
                className="rounded-2xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] px-5 py-3 text-sm font-bold text-white shadow-md hover:brightness-110"
              >
                {copy.backFlights}
              </Link>
            </div>
          </section>
        ) : selection && query ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-6">
              {!user && !loading ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="font-semibold text-amber-900">{copy.loginRequired}</p>
                  <button
                    type="button"
                    onClick={() => openAuth("login")}
                    className="mt-3 rounded-xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] px-4 py-2 text-sm font-bold text-white shadow-sm hover:brightness-110 cursor-pointer"
                  >
                    {copy.login}
                  </button>
                </div>
              ) : null}

              {/* Step 1: Passengers */}
              {step === "passengers" ? (
                <>
                  <section className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-black text-purple-950">{copy.contact}</h2>
                    <p className="mt-1 text-xs text-slate-500">{copy.contactHint}</p>
                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <label className="text-sm font-semibold text-slate-600">
                        {copy.email}
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          dir="ltr"
                          className={fieldClass}
                          placeholder="yourname@example.com"
                        />
                      </label>
                      <label className="text-sm font-semibold text-slate-600">
                        {copy.phone}
                        <div className="mt-1 flex gap-2">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            dir="ltr"
                            className="rounded-xl border border-slate-200 bg-slate-50/70 px-2 py-3 text-sm text-purple-950 outline-none focus:border-purple-600"
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
                            dir="ltr"
                            inputMode="tel"
                            placeholder="5XXXXXXXX"
                            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-purple-950 outline-none focus:border-purple-600 focus:bg-white"
                          />
                        </div>
                      </label>
                    </div>
                  </section>

                  {passengers.map((row, index) => (
                    <section key={row.id} className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-purple-50 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-xs font-black text-white shadow-xs">
                            {index + 1}
                          </span>
                          <h2 className="text-lg font-black text-purple-950">
                            {copy.passengerN(index + 1, kindLabel(row.kind))}
                          </h2>
                          {scanSuccessPassengerId === row.id && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                              ✓ {locale === "ar" ? "تم استخراج الجواز بنجاح" : "Passport scanned"}
                            </span>
                          )}
                        </div>

                        {/* Direct Camera Passport Scanner */}
                        <div className="flex items-center gap-2">
                          <input
                            id={`passport-file-${row.id}`}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) void handlePassengerPassportUpload(row.id, file);
                              e.target.value = "";
                            }}
                          />
                          <button
                            type="button"
                            disabled={scanningPassengerId === row.id}
                            onClick={() => document.getElementById(`passport-file-${row.id}`)?.click()}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-amber-50/40 px-3 py-1.5 text-xs font-bold text-purple-900 shadow-xs transition hover:border-purple-300 hover:bg-purple-100 active:scale-95 disabled:opacity-50"
                            title={locale === "ar" ? "مسح الجواز الذكي بالكاميرا" : "AI Passport Camera Scan"}
                          >
                            {scanningPassengerId === row.id ? (
                              <>
                                <Loader2 size={13} className="animate-spin text-purple-600" />
                                <span>{locale === "ar" ? "جاري قراءة الجواز..." : "Reading Passport..."}</span>
                              </>
                            ) : (
                              <>
                                <Camera size={14} className="text-purple-700" />
                                <span>{locale === "ar" ? "مسح الجواز الذكي" : "AI Passport Scan"}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-purple-900/60">
                        {copy.personalDetails}
                      </p>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <label className="text-xs font-bold text-slate-600">
                          {copy.title}
                          <select
                            value={row.title}
                            onChange={(e) => updatePassenger(row.id, { title: e.target.value })}
                            className={fieldClass}
                          >
                            <option value="mr">Mr</option>
                            <option value="mrs">Mrs</option>
                            <option value="ms">Ms</option>
                          </select>
                        </label>
                        <label className="text-xs font-bold text-slate-600">
                          {copy.gender}
                          <select
                            value={row.gender}
                            onChange={(e) => updatePassenger(row.id, { gender: e.target.value })}
                            className={fieldClass}
                          >
                            <option value="">{copy.unspecified}</option>
                            <option value="male">{copy.male}</option>
                            <option value="female">{copy.female}</option>
                          </select>
                        </label>
                        <label className="text-xs font-bold text-slate-600">
                          {copy.firstName}
                          <input
                            value={row.firstName}
                            onChange={(e) => updatePassenger(row.id, { firstName: e.target.value })}
                            dir="ltr"
                            className={fieldClass}
                          />
                        </label>
                        <label className="text-xs font-bold text-slate-600">
                          {copy.lastName}
                          <input
                            value={row.lastName}
                            onChange={(e) => updatePassenger(row.id, { lastName: e.target.value })}
                            dir="ltr"
                            className={fieldClass}
                          />
                        </label>
                        <label className="text-xs font-bold text-slate-600">
                          {copy.dob}
                          <div dir="ltr" className="w-full mt-1">
                            <input
                              type="date"
                              lang="en-GB"
                              dir="ltr"
                              max={new Date().toISOString().split("T")[0]}
                              value={row.dateOfBirth}
                              onChange={(e) => updatePassenger(row.id, { dateOfBirth: e.target.value })}
                              className={`${fieldClass} tabular-nums text-left`}
                            />
                          </div>
                        </label>
                        <label className="text-xs font-bold text-slate-600">
                          {copy.nationality}
                          <input
                            value={row.nationality}
                            onChange={(e) => updatePassenger(row.id, { nationality: e.target.value })}
                            dir="ltr"
                            className={fieldClass}
                          />
                        </label>
                      </div>

                      <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wider text-purple-900/60">
                        {copy.passportSection}
                      </p>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <label className="text-xs font-bold text-slate-600">
                          {copy.passport}
                          <input
                            value={row.passportNumber}
                            onChange={(e) => updatePassenger(row.id, { passportNumber: e.target.value })}
                            dir="ltr"
                            className={`${fieldClass} tabular-nums`}
                          />
                        </label>
                        <label className="text-xs font-bold text-slate-600">
                          {copy.issuingCountry}
                          <input
                            value={row.passportCountry}
                            onChange={(e) => updatePassenger(row.id, { passportCountry: e.target.value })}
                            dir="ltr"
                            className={fieldClass}
                          />
                        </label>
                        <label className="text-xs font-bold text-slate-600">
                          {copy.expiry}
                          <div dir="ltr" className="w-full mt-1">
                            <input
                              type="date"
                              lang="en-GB"
                              dir="ltr"
                              min={new Date().toISOString().split("T")[0]}
                              value={row.passportExpiry}
                              onChange={(e) => updatePassenger(row.id, { passportExpiry: e.target.value })}
                              className={`${fieldClass} tabular-nums text-left`}
                            />
                          </div>
                        </label>
                      </div>

                      <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wider text-purple-900/60">
                        {copy.optionalSection}
                      </p>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <label className="text-xs font-bold text-slate-600">
                          {copy.frequentFlyer}
                          <input
                            value={row.frequentFlyer}
                            onChange={(e) => updatePassenger(row.id, { frequentFlyer: e.target.value })}
                            dir="ltr"
                            className={fieldClass}
                          />
                        </label>
                        <label className="text-xs font-bold text-slate-600">
                          {copy.meal}
                          <input
                            value={row.meal}
                            onChange={(e) => updatePassenger(row.id, { meal: e.target.value })}
                            className={fieldClass}
                          />
                        </label>
                      </div>
                    </section>
                  ))}

                  {!formValid ? <p className="text-xs text-slate-500">{copy.fillFields}</p> : null}
                  <button
                    type="button"
                    disabled={!passengersOk || !contactOk || saving}
                    onClick={() => void goReview()}
                    className="w-full rounded-2xl bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] py-4 text-sm font-black text-white shadow-lg shadow-purple-950/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? <Loader2 className="mx-auto animate-spin" /> : copy.stepReview}
                  </button>
                </>
              ) : null}

              {/* Step 2: Review & Cross-Sell Upgrades */}
              {step === "review" ? (
                <div className="space-y-6">
                  <section className="space-y-5 rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-black text-purple-950">{copy.reviewTitle}</h2>
                    {fareChanged ? (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
                        {copy.fareChanged}
                      </div>
                    ) : null}

                    {/* Flight Itinerary Recap */}
                    <FlightItineraryRecap
                      selection={selection}
                      locale={locale}
                      copy={copy}
                      departDate={query.date}
                      returnDate={query.returnDate}
                      cabinLabel={cabinClassLabel(locale, query.cabinClass)}
                    />

                    {/* Flight Extras Picker */}
                    <FlightExtrasPicker
                      packages={extraPackages}
                      selectedIds={selectedPackageIds(selection)}
                      fareSubtotal={fareOnly}
                      locale={locale}
                      copy={copy}
                      formatPrice={(amount) => formatFlightPrice(amount, currency)}
                      onToggle={toggleExtra}
                    />

                    {/* Passengers recap */}
                    <div>
                      <h3 className="text-sm font-black text-purple-950">{copy.reviewPassengers}</h3>
                      <ul className="mt-2 divide-y divide-purple-50 rounded-2xl border border-purple-100">
                        {passengers.map((row) => (
                          <li
                            key={row.id}
                            className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                          >
                            <span className="font-bold text-purple-950">
                              {row.firstName} {row.lastName}
                            </span>
                            <span className="tabular-nums text-slate-500" dir="ltr">
                              {row.passportNumber} · {formatHumanDate(row.dateOfBirth, locale)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>

                  {/* CROSS-SELL SUITE: Hotels, Transfers, Tours & One-click sync */}
                  <FlightBookingCrossSell
                    destinationCity={destinationCity}
                    departDate={query.date}
                    returnDate={query.returnDate}
                    paxCount={paxCount}
                    currency={currency}
                    primaryPassenger={primaryPassenger}
                    flightNumber={flightNumber}
                    arrivalAirportCode={arrivalAirportCode}
                    selectedHotel={selectedHotel}
                    onSelectHotel={setSelectedHotel}
                    selectedTransfer={selectedTransfer}
                    onSelectTransfer={setSelectedTransfer}
                    selectedTours={selectedTours}
                    onToggleTour={(tour) => {
                      setSelectedTours((prev) =>
                        prev.some((t) => t.id === tour.id) ? prev.filter((t) => t.id !== tour.id) : [...prev, tour]
                      );
                    }}
                    onRemoveTour={(tourId) => {
                      setSelectedTours((prev) => prev.filter((t) => t.id !== tourId));
                    }}
                  />

                  {/* Proceed to Payment CTA */}
                  <div className="rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                      <div>
                        <span className="text-xs text-slate-500">{locale === "ar" ? "المبلغ الإجمالي المستحق للرحلة والإضافات:" : "Total Payable Amount:"}</span>
                        <div className="text-2xl font-black text-purple-950">
                          {formatFlightPrice(total, currency)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep("payment")}
                        className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-8 py-4 font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:scale-95 cursor-pointer"
                      >
                        {fareChanged ? copy.acceptFare : copy.stepPay} ←
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Step 3: Payment */}
              {step === "payment" ? (
                <>
                  <CheckoutRewards
                    service="flights"
                    amount={total}
                    currency={currency}
                    onChange={onLoyalty}
                  />

                  <section className="space-y-4 rounded-3xl border border-purple-100 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-black text-purple-950">{copy.payTitle}</h2>

                    {/* Booking Items Summary in Payment Step */}
                    <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 space-y-2 text-xs">
                      <div className="flex justify-between items-center font-bold text-purple-950">
                        <span>✈️ تذكرة الطيران ({paxCount} مسافرين)</span>
                        <span>{formatFlightPrice(flightBaseTotal, currency)}</span>
                      </div>
                      {selectedHotel && (
                        <div className="flex justify-between items-center text-purple-900">
                          <span>🏨 {selectedHotel.hotelName} ({selectedHotel.nightsCount} ليالٍ)</span>
                          <span className="font-bold">+{formatFlightPrice(selectedHotel.totalPrice, currency)}</span>
                        </div>
                      )}
                      {selectedTransfer && (
                        <div className="flex justify-between items-center text-purple-900">
                          <span>🚗 {selectedTransfer.vehicleName} ({selectedTransfer.routeType === "roundtrip" ? "ذهاب وعودة" : "اتجاه واحد"})</span>
                          <span className="font-bold">+{formatFlightPrice(selectedTransfer.price, currency)}</span>
                        </div>
                      )}
                      {selectedTours.map((t) => (
                        <div key={t.id} className="flex justify-between items-center text-purple-900">
                          <span>🎟️ {t.titleAr}</span>
                          <span className="font-bold">+{formatFlightPrice(t.totalPrice, currency)}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-purple-200/60 flex justify-between items-center text-sm font-black text-purple-950">
                        <span>{copy.total}</span>
                        <span className="text-base">{formatFlightPrice(dueTotal, currency)}</span>
                      </div>
                    </div>

                    {cardEnabled ? (
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all ${
                          method === "card"
                            ? "border-purple-600 bg-purple-50/50 shadow-xs ring-2 ring-purple-400/20"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="pay"
                          checked={method === "card"}
                          onChange={() => setMethod("card")}
                          className="mt-1 text-purple-600 focus:ring-purple-500"
                        />
                        <div>
                          <p className="inline-flex items-center gap-2 font-bold text-purple-950">
                            <CreditCard size={18} className="text-purple-700" /> {copy.payCard}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 leading-relaxed">{copy.cardHint}</p>
                        </div>
                      </label>
                    ) : (
                      <p className="text-sm text-slate-500">{copy.cardDisabled}</p>
                    )}

                    {method === "card" && cardEnabled ? (
                      <p className="rounded-xl bg-purple-50 px-3 py-2 text-xs text-purple-900">{copy.noPan}</p>
                    ) : null}

                    {waEnabled && !checkoutHtml ? (
                      <label
                        className={`flex items-start gap-3 rounded-2xl border p-4 transition-all ${
                          method === "whatsapp"
                            ? "border-emerald-500 bg-emerald-50/60 shadow-xs ring-2 ring-emerald-400/20"
                            : "border-slate-200 hover:border-slate-300"
                        } ${checkoutHtml ? "pointer-events-none opacity-40" : "cursor-pointer"}`}
                      >
                        <input
                          type="radio"
                          name="pay"
                          checked={method === "whatsapp"}
                          onChange={() => {
                            if (checkoutHtml) return;
                            setMethod("whatsapp");
                          }}
                          className="mt-1 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <p className="inline-flex items-center gap-2 font-bold text-emerald-950">
                            <MessageCircle size={18} className="text-emerald-600" /> {copy.payWhatsApp}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 leading-relaxed">{copy.waHint}</p>
                        </div>
                      </label>
                    ) : null}

                    {turkishProduction ? (
                      <label className="block text-sm text-slate-600">
                        {copy.identity}
                        <input
                          value={identityNumber}
                          onChange={(e) => setIdentityNumber(e.target.value)}
                          inputMode="numeric"
                          maxLength={11}
                          className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                        />
                        <span className="mt-1 block text-xs text-slate-500">{copy.identityHelp}</span>
                      </label>
                    ) : null}

                    {error ? <p className="text-sm text-red-600">{error}</p> : null}

                    {!checkoutHtml ? (
                      <button
                        type="button"
                        disabled={saving || !formValid || !user || (method === "card" ? !cardEnabled : !waEnabled)}
                        onClick={() => void submitPay(method)}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] py-4 font-black text-white shadow-lg shadow-purple-950/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
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

            {/* Sidebar with Live Price Breakdown */}
            <aside className="h-fit rounded-3xl border border-purple-100 bg-white p-6 shadow-sm lg:sticky lg:top-28">
              <p className="text-sm font-black text-purple-950">{routeLabel}</p>
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

              {/* Cross-Sell Quick Badges */}
              {(selectedHotel || selectedTransfer || selectedTours.length > 0) && (
                <div className="mt-3 pt-3 border-t border-purple-50 space-y-1.5">
                  <p className="text-[11px] font-bold text-purple-900">إضافات الرحلة المختارة:</p>
                  {selectedHotel && (
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="truncate max-w-[170px]">{selectedHotel.hotelName}</span>
                      <strong className="text-purple-950 font-bold">+{formatFlightPrice(selectedHotel.totalPrice, currency)}</strong>
                    </div>
                  )}
                  {selectedTransfer && (
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="truncate max-w-[170px]">{selectedTransfer.vehicleName}</span>
                      <strong className="text-purple-950 font-bold">+{formatFlightPrice(selectedTransfer.price, currency)}</strong>
                    </div>
                  )}
                  {selectedTours.map((t) => (
                    <div key={t.id} className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="truncate max-w-[170px]">{t.titleAr}</span>
                      <strong className="text-purple-950 font-bold">+{formatFlightPrice(t.totalPrice, currency)}</strong>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 border-t border-purple-100 pt-3">
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
