"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Check,
  CheckCircle2,
  Luggage,
  MonitorPlay,
  Plane,
  Plug,
  Share2,
  Sparkles,
  UtensilsCrossed,
  Wifi,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { ar, enUS, tr } from "date-fns/locale";
import { flightDetails } from "@/components/flights/api";
import AirlineLogo from "@/components/flights/AirlineLogo";
import { cabinClassLabel, type FlightCopy } from "@/components/flights/copy";
import { getLocalizedAirline } from "@/lib/flights/airline-dictionary";
import { getLocalizedPlace } from "@/lib/flights/airport-dictionary";
import { canonicalPenalty, collapseFarePenalties, customerFacingPenalties } from "@/lib/flights/fare-penalties";
import {
  baggageStateText,
  bookingItinerarySnapshot,
  fareCabinState,
  fareCheckedState,
  formatBaggageText,
  formatClock,
  formatDuration,
  hasValidFarePrices,
  legsPayload,
  normalizeDetails,
} from "@/components/flights/normalize";
import FarePackageGrid from "@/components/flights/FarePackageGrid";
import { usePromoPrice } from "@/components/loyalty/PromoPriceBlock";
import type {
  CabinClass,
  FareFamily,
  FlightAmenity,
  FlightDetails,
  FlightLeg,
  FlightPlace,
  FlightSearchQuery,
  FlightSegment,
  Itinerary,
  SelectedFare,
} from "@/components/flights/types";
import type { Locale } from "@/lib/i18n/types";
import { useFlightPrice } from "@/components/flights/useFlightPrice";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type Props = {
  item: Itinerary | null;
  query: FlightSearchQuery;
  sessionId?: string;
  copy: FlightCopy;
  onClose: () => void;
  onSelect: (selection: SelectedFare) => void;
};

function dfOf(locale: string) {
  if (locale === "ar") return ar;
  if (locale === "tr") return tr;
  return enUS;
}

function policyText(copy: FlightCopy, details?: FlightDetails | null, item?: Itinerary | null) {
  const policy = item?.farePolicy;
  if (details?.refundLabel === "refundable_fee" || policy?.isCancellationAllowed || policy?.isPartiallyRefundable) {
    return copy.refundableFee;
  }
  return copy.nonRefundable;
}

function airportLine(place: FlightPlace, locale: string = "ar"): string {
  const code = place.displayCode || "";
  const localized = getLocalizedPlace(code, place.name, place.city, locale);
  const city = localized.city || place.city || "";
  const name = localized.name && localized.name !== city && localized.name !== code ? localized.name : "";
  return [city, name, code].filter(Boolean).join(" · ");
}

function terminalOf(place: FlightPlace): string {
  if (!place.terminal) return "";
  const t = String(place.terminal).replace(/^t/i, "");
  return t ? `T${t}` : "";
}

function amenityIcon(kind: FlightAmenity) {
  switch (kind) {
    case "wifi":
      return Wifi;
    case "power":
      return Plug;
    case "meal":
      return UtensilsCrossed;
    case "entertainment":
      return MonitorPlay;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

function amenityLabel(kind: FlightAmenity, copy: FlightCopy): string {
  switch (kind) {
    case "wifi":
      return copy.wifi;
    case "power":
      return copy.power;
    case "meal":
      return copy.mealOnBoard;
    case "entertainment":
      return copy.entertainment;
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

function dateShiftLabel(iso: string, locale: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return format(d, "d MMM", { locale: dfOf(locale) });
}

function sameCalendarDay(a: string, b: string): boolean {
  const da = new Date(a);
  const db = new Date(b);
  if (Number.isNaN(da.getTime()) || Number.isNaN(db.getTime())) return true;
  return da.toDateString() === db.toDateString();
}

function TimelineSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[0, 1].map((key) => (
        <div key={key} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
          <div className="mb-3 h-3 w-24 rounded bg-slate-200" />
          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-slate-200" />
              <div className="h-3 w-1/2 rounded bg-slate-100" />
              <div className="h-3 w-2/3 rounded bg-slate-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RouteTimeline({
  legs,
  copy,
  item,
  locale,
  cabin,
}: {
  legs: FlightLeg[];
  copy: FlightCopy;
  item: Itinerary;
  locale: Locale;
  cabin: CabinClass;
}) {
  return (
    <div className="space-y-6">
      {legs.map((leg, legIndex) => (
        <div key={`detail-${leg.id || leg.departure}`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              {legIndex === 0 ? copy.outboundTag : copy.return}:{" "}
              {dateShiftLabel(leg.departure, locale)} · {copy.totalDuration} {formatDuration(leg.durationInMinutes)}
            </p>
          </div>

          <div className="relative">
            <div className="absolute top-3 bottom-3 start-[1.15rem] w-px bg-slate-200" />
            {leg.segments.length ? (
              leg.segments.map((seg, segIndex) => (
                <div key={seg.id || `${seg.flightNumber}-${segIndex}`}>
                  <SegmentBlock
                    seg={seg}
                    copy={copy}
                    locale={locale}
                    cabin={cabin}
                    showArrivalDate={!sameCalendarDay(seg.departure, seg.arrival)}
                  />
                  {leg.layovers[segIndex] ? (
                    <div className="relative my-2 ms-0 rounded-xl bg-slate-50 px-3 py-2.5 ps-12">
                      <span className="absolute start-[0.95rem] top-3 h-2.5 w-2.5 rounded-full bg-amber-400 ring-4 ring-amber-50" />
                      <p className="text-xs font-black text-purple-950">
                        {copy.transferIn} {leg.layovers[segIndex].city || airportLine(seg.destination)}{" "}
                        {formatDuration(leg.layovers[segIndex].durationInMinutes)}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {leg.layovers[segIndex].airport || seg.destination.displayCode}
                        {seg.destination.name ? ` · ${seg.destination.name}` : ""}
                      </p>
                      {leg.layovers[segIndex].selfTransfer || item.isSelfTransfer ? (
                        <p className="mt-1 text-[11px] font-semibold text-amber-800">{copy.selfTransfer}</p>
                      ) : (
                        <p className="mt-1 text-[11px] text-emerald-700">{copy.noRecheckBags}</p>
                      )}
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="flex items-center gap-3 ps-1 text-sm text-slate-600">
                <Plane size={14} className="text-purple-700" />
                {airportLine(leg.origin, locale)} → {airportLine(leg.destination, locale)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function SegmentBlock({
  seg,
  copy,
  locale,
  cabin,
  showArrivalDate,
}: {
  seg: FlightSegment;
  copy: FlightCopy;
  locale: Locale;
  cabin: CabinClass;
  showArrivalDate: boolean;
}) {
  const carrierName = getLocalizedAirline(seg.marketingCarrier.code, seg.marketingCarrier.name, locale);
  const operatingName = seg.operatingCarrier?.name
    ? getLocalizedAirline(seg.operatingCarrier.code, seg.operatingCarrier.name, locale)
    : "";

  return (
    <div className="relative pb-3">
      <TimePoint
        time={formatClock(seg.departure)}
        place={seg.origin}
        dateNote=""
        copy={copy}
        locale={locale}
      />
      <div className="ms-12 mb-3 mt-1 space-y-1.5">
        <p className="text-xs font-bold text-purple-950">
          {carrierName} {seg.flightNumber || seg.flightNo}
          {` · ${cabinClassLabel(locale, cabin)}`}
        </p>
        {operatingName && operatingName !== carrierName ? (
          <p className="text-[11px] text-slate-500">
            {copy.operatingCarrier} {operatingName}
          </p>
        ) : null}
        {seg.aircraft ? (
          <p className="text-[11px] text-slate-500">
            {copy.aircraftLabel}: {seg.aircraft}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Plane size={10} className="text-purple-700" />
            {copy.totalDuration}: {formatDuration(seg.durationInMinutes)}
          </span>
          {seg.amenities?.map((kind) => {
            const Icon = amenityIcon(kind);
            return (
              <span key={kind} className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-1.5 py-0.5">
                <Icon size={10} />
                {amenityLabel(kind, copy)}
              </span>
            );
          })}
        </div>
      </div>
      <TimePoint
        time={formatClock(seg.arrival)}
        place={seg.destination}
        dateNote={showArrivalDate ? dateShiftLabel(seg.arrival, locale) : ""}
        copy={copy}
        locale={locale}
      />
    </div>
  );
}

function TimePoint({
  time,
  place,
  dateNote,
  copy,
  locale = "ar",
}: {
  time: string;
  place: FlightPlace;
  dateNote: string;
  copy: FlightCopy;
  locale?: string;
}) {
  return (
    <div className="relative flex items-start gap-3">
      <span className="relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-purple-700 bg-white" />
      <div className="min-w-0 flex-1 pb-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <p className="text-base font-black leading-none text-purple-950">{time}</p>
          {dateNote ? (
            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">{dateNote}</span>
          ) : null}
        </div>
        <p className="mt-1 text-sm font-semibold text-slate-800">{airportLine(place, locale)}</p>
        {terminalOf(place) || place.gate ? (
          <p className="mt-0.5 text-[11px] font-semibold text-slate-500">
            {terminalOf(place) ? `${copy.terminalLabel} ${terminalOf(place)}` : ""}
            {terminalOf(place) && place.gate ? " · " : ""}
            {place.gate ? `${copy.gateLabel} ${place.gate}` : ""}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function FareGrid({
  fares,
  selectedId,
  onPick,
}: {
  fares: FareFamily[];
  selectedId: string;
  onPick: (fare: FareFamily) => void;
}) {
  return <FarePackageGrid fares={fares} selectedId={selectedId} onSelect={onPick} />;
}

export default function FlightDetailsDrawer({ item, query, sessionId, copy, onClose, onSelect }: Props) {
  const { locale, dir } = useLocale();
  const { formatFlightPrice } = useFlightPrice();
  const [details, setDetails] = useState<FlightDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);
  const [selectedFareId, setSelectedFareId] = useState("");
  const [shareSuccess, setShareSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (item) {
      const raf = requestAnimationFrame(() => setIsOpen(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setIsOpen(false);
    }
  }, [item]);

  const handleAnimatedClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleAnimatedClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!item) {
      setDetails(null);
      setDetailError(false);
      setLoading(false);
      setSelectedFareId("");
      return;
    }
    let cancelled = false;
    setDetails(null);
    setDetailError(false);
    setLoading(true);
    void flightDetails({
      itineraryId: item.id,
      legs: legsPayload(item),
      currency: query.currency,
      locale,
      cabin: query.cabinClass,
      sessionId,
      quotedPrice: item.price,
    })
      .then((next) => {
        if (!cancelled) setDetails(next);
      })
      .catch(() => {
        if (!cancelled) setDetailError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [item, locale, query.cabinClass, query.currency, sessionId]);

  const fares = useMemo(() => {
    if (!item) return [];
    if (details?.fareFamilies?.length && hasValidFarePrices(details.fareFamilies)) {
      return details.fareFamilies;
    }
    if (hasValidFarePrices(item.fareFamilies)) return item.fareFamilies;
    if (item.price > 0) {
      return [
        {
          id: "quoted",
          name: item.fareFamilies[0]?.name || cabinClassLabel(locale, query.cabinClass),
          price: item.price,
          currency: item.currency,
          cabinClass: item.fareFamilies[0]?.cabinClass || query.cabinClass,
          baggage: item.fareFamilies[0]?.baggage || "",
          changeable: Boolean(item.farePolicy?.isChangeAllowed),
          refundable: Boolean(item.farePolicy?.isCancellationAllowed || item.farePolicy?.isPartiallyRefundable),
        },
      ];
    }
    return item.fareFamilies;
  }, [details, item, locale, query.cabinClass]);

  useEffect(() => {
    if (!selectedFareId && fares[0]) setSelectedFareId(fares[0].id);
  }, [fares, selectedFareId]);

  const selected = fares.find((f) => f.id === selectedFareId) || fares[0] || null;
  const promoPrice = usePromoPrice(selected?.price || 0, "flights");

  if (!item) return null;

  const snapshot = bookingItinerarySnapshot(item, details);
  const legs = snapshot.legs;
  const hasRoutePreview = legs.some((leg) => leg.segments.length > 0);
  const enrichingRoute = loading && !hasRoutePreview;
  const priceCurrency = details?.currency || item.currency;
  const origin = snapshot.legs[0]?.origin;
  const dest = snapshot.legs[snapshot.legs.length - 1]?.destination;
  const totalMins = legs.reduce((sum, leg) => sum + (leg.durationInMinutes || 0), 0);

  // Baggage bound to the selected package — tri-state, no assumptions.
  const selectedCheckedState = (() => {
    const st = fareCheckedState(selected);
    if (st.status !== "unknown") return st;
    const raw = details?.checkedBaggage && details.checkedBaggage !== "—" ? details.checkedBaggage : item.checkedBaggage;
    if (!raw) return st;
    const formatted = formatBaggageText(raw, locale);
    return formatted ? ({ status: "included", text: formatted } as const) : ({ status: "none" } as const);
  })();
  const selectedCabinState = (() => {
    const st = fareCabinState(selected);
    if (st.status !== "unknown") return st;
    const raw = details?.cabinBaggage && details.cabinBaggage !== "—" ? details.cabinBaggage : item.cabinBaggage;
    return raw ? ({ status: "included", text: raw } as const) : st;
  })();
  const hasCheckedBag = selectedCheckedState.status === "included";

  const origLoc = getLocalizedPlace(origin?.displayCode || "", origin?.name, origin?.city, locale);
  const destLoc = getLocalizedPlace(dest?.displayCode || "", dest?.name, dest?.city, locale);
  const carrierName = getLocalizedAirline(
    snapshot.legs[0]?.carriers[0]?.code || snapshot.legs[0]?.segments[0]?.marketingCarrier.code || "",
    snapshot.legs[0]?.carriers[0]?.name || snapshot.legs[0]?.segments[0]?.marketingCarrier.name || "",
    locale
  );

  const handleShareToCommunity = () => {
    const sharePayload = {
      id: item.id || `flight_${Date.now()}`,
      type: "flight",
      typeLabel: locale === "ar" ? "تذكرة طيران مميزة" : "Flight Ticket Deal",
      title: `${locale === "ar" ? "رحلة طيران" : "Flight"}: ${origLoc.city || origLoc.name} ← ${destLoc.city || destLoc.name} (${carrierName})`,
      destination: destLoc.city || destLoc.name || "رحلة جوية",
      price: selected?.price || item.rawPrice || item.price,
      currency: selected?.currency || priceCurrency,
      url: typeof window !== "undefined" ? window.location.href : undefined,
    };

    try {
      sessionStorage.setItem("pendingCommunityShare", JSON.stringify(sharePayload));
    } catch {}

    setShareSuccess(true);
    setTimeout(() => {
      window.open("/community?shareService=1", "_blank");
    }, 400);
  };

  const continueBooking = (fare: FareFamily | null) => {
    if (promoPrice.hasDiscount && promoPrice.code) {
      void fetch("/api/loyalty/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoPrice.code, service: "flights" }),
      }).catch(() => undefined);
    }
    onSelect({
      itinerary: snapshot,
      fare,
      sessionId,
      extras: { extraBag: false, insurance: false, priorityBoarding: false },
    });
  };

  return (
    <div className={cn("fixed inset-0 z-[130] transition-opacity duration-200", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")}>
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={handleAnimatedClose}
        aria-label={copy.closeDetails}
      />
      <aside
        dir={dir}
        className={cn(
          "absolute inset-y-0 flex w-full max-w-2xl flex-col bg-white shadow-2xl transition-transform duration-200 ease-out",
          dir === "rtl" ? "start-0" : "end-0",
          isOpen ? "translate-x-0" : (dir === "rtl" ? "-translate-x-full" : "translate-x-full")
        )}
      >
        {/* Luxury Brand Boarding-Pass Header */}
        <div className="bg-gradient-to-r from-[#1b053a] via-[#2e1065] to-[#3b0764] text-white px-5 py-5 shadow-md border-b border-amber-400/20">
          <div className="flex items-start justify-between gap-3">
            <div className="rounded-2xl bg-white/10 p-1.5 ring-1 ring-white/20">
              <AirlineLogo
                code={snapshot.legs[0]?.carriers[0]?.code || snapshot.legs[0]?.segments[0]?.marketingCarrier.code}
                name={carrierName}
                logoUrl={snapshot.legs[0]?.carriers[0]?.logoUrl || snapshot.legs[0]?.segments[0]?.marketingCarrier.logoUrl}
                size="md"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-lg font-black text-white">
                  {origLoc.city || origin?.name} ({origin?.displayCode})
                  <span className="mx-2 text-amber-400 font-extrabold">{dir === "rtl" ? "←" : "→"}</span>
                  {destLoc.city || dest?.name} ({dest?.displayCode})
                </p>
              </div>
              <p className="mt-1 text-xs font-semibold text-purple-200">
                {carrierName} · {formatClock(snapshot.legs[0]?.departure || "")}
                {" — "}
                {formatClock(snapshot.legs[snapshot.legs.length - 1]?.arrival || "")}
              </p>
              <p className="mt-0.5 text-xs text-amber-300/90 font-bold">
                {copy.outboundTag}: {query.date} · {copy.totalDuration} {formatDuration(totalMins)}
                {loading ? ` · ${copy.loadingDetails}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAnimatedClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label={copy.closeDetails}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-auto px-5 py-5 pb-28">
          <section>
            <h3 className="mb-3 text-sm font-black text-[#1e1b4b]">{copy.timeline}</h3>
            {enrichingRoute ? (
              <TimelineSkeleton />
            ) : (
              <RouteTimeline legs={legs} copy={copy} item={item} locale={locale} cabin={query.cabinClass} />
            )}
            {detailError ? <p className="mt-2 text-xs text-amber-600">{copy.errorHint}</p> : null}
          </section>

          {/* Social Community Sharing Card with Clear Engagement Rules */}
          <section className="rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-500/10 via-amber-100/30 to-amber-500/5 p-4 text-slate-900 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-sm">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    {locale === "ar" ? "شارك الرحلة واكسب نقاط الولاء" : "Share Flight & Earn Loyalty Points"}
                  </h4>
                  <span className="inline-block rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-950">
                    {locale === "ar" ? "تطبق شروط تفاعل الجمهور" : "Engagement terms apply"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleShareToCommunity}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2 text-xs font-black text-slate-950 shadow hover:from-amber-500 hover:to-amber-600 transition active:scale-95 cursor-pointer shrink-0"
              >
                {shareSuccess ? <CheckCircle2 size={14} className="text-slate-950" /> : <Share2 size={14} />}
                <span>{shareSuccess ? (locale === "ar" ? "جاري الفتح..." : "Opening...") : (locale === "ar" ? "مشاركة بالسوشيال" : "Share to Social")}</span>
              </button>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
              {locale === "ar"
                ? "انشر تفاصيل هذه الرحلة في مجتمع لوناليزا السياحي. تُمنح النقاط وتُضاف لرصيدك في المحفظة فور وصول المنشور إلى تفاعل الجمهور المحدد (50 إعجاب و 10 تعليقات) لتستخدمها في خصومات مباشرة على حجوزاتك القادمة."
                : "Publish this flight to Lonaliza Social Community. Reward points are unlocked and credited to your wallet once your post hits audience engagement criteria (50 likes & 10 comments)."}
            </p>
          </section>

          {/* Fully Unified Baggage and Ticket Policy Cards */}
          <section className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-purple-200/80 bg-purple-50/20 p-4 shadow-2xs">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-[#1e1b4b]">
                <Luggage size={16} className="text-amber-600" />
                <span>{copy.baggage}</span>
                {selected?.name ? (
                  <span className="text-[10px] font-bold text-purple-900 bg-purple-100 px-1.5 py-0.5 rounded">
                    {selected.name}
                  </span>
                ) : null}
              </h3>
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Briefcase size={14} className={selectedCabinState.status === "included" ? "text-purple-700 shrink-0" : "text-slate-400 shrink-0"} />
                <span>
                  {copy.cabinBag}: <strong className="text-slate-900">{baggageStateText(selectedCabinState, locale, "cabin")}</strong>
                </span>
              </p>
              <p className="mt-2.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Luggage size={14} className={hasCheckedBag ? "text-amber-600 shrink-0" : "text-slate-400 shrink-0"} />
                <span>
                  {copy.checkedBag}:{" "}
                  <strong className={hasCheckedBag ? "text-purple-950 font-black" : "text-slate-600 font-bold"}>
                    {baggageStateText(selectedCheckedState, locale, "checked")}
                  </strong>
                </span>
              </p>
              {selectedCheckedState.status === "unknown" ? (
                <p className="mt-2 text-[11px] text-slate-500">
                  {locale === "ar"
                    ? "لم تُرسل شركة الطيران تفاصيل الأمتعة لهذه التعرفة بعد؛ تُؤكد قبل الدفع."
                    : locale === "tr"
                      ? "Havayolu bu ücret için bagaj bilgisi göndermedi; ödeme öncesi onaylanır."
                      : "The airline has not provided baggage details for this fare yet; confirmed before payment."}
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-purple-200/80 bg-purple-50/20 p-4 shadow-2xs">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-[#1e1b4b]">
                <Plane size={16} className="text-purple-700" />
                <span>{copy.policies}</span>
                {selected?.name ? (
                  <span className="text-[10px] font-bold text-purple-900 bg-purple-100 px-1.5 py-0.5 rounded">
                    {selected.name}
                  </span>
                ) : null}
              </h3>
              {(() => {
                const policy = collapseFarePenalties(selected?.penalties);
                const facing = customerFacingPenalties(selected?.penalties);
                const refund = policy.refundable !== "unknown" ? policy.refundable : selected?.attributes?.refund;
                const change = policy.changeable !== "unknown" ? policy.changeable : selected?.attributes?.change;
                const cancelFee = canonicalPenalty(facing.penalties, "cancel");
                const changeFee = canonicalPenalty(facing.penalties, "change");
                const afterCancel = facing.afterDeparture.find((p) => p.type === "cancel");
                const afterChange = facing.afterDeparture.find((p) => p.type === "change");
                return (
                  <>
              <p className="text-sm font-semibold text-slate-700 flex items-start gap-2">
                <span className={cn("inline-block h-2 w-2 rounded-full mt-1.5 shrink-0", refund === "included" ? "bg-emerald-500" : refund === "chargeable" ? "bg-amber-500" : "bg-slate-400")} />
                <span>
                  {refund === "included"
                    ? (locale === "ar" ? "إلغاء مجاني قبل الإقلاع" : locale === "tr" ? "Kalkış öncesi ücretsiz iptal" : "Free cancellation before departure")
                    : refund === "chargeable"
                      ? cancelFee?.amount != null
                            ? (locale === "ar" ? `إلغاء قبل الإقلاع برسوم ${formatFlightPrice(cancelFee.amount, cancelFee.currency || selected?.currency || "USD")}` : `Cancellation fee ${formatFlightPrice(cancelFee.amount, cancelFee.currency || selected?.currency || "USD")}`)
                            : (locale === "ar" ? "إلغاء متاح برسوم قبل الإقلاع" : "Cancellation available with a fee")
                      : (locale === "ar" ? "إلغاء غير متوفر" : locale === "tr" ? "İptal yok" : "Cancellation not available")}
                </span>
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-700 flex items-start gap-2">
                <span className={cn("inline-block h-2 w-2 rounded-full mt-1.5 shrink-0", change === "included" ? "bg-emerald-500" : change === "chargeable" ? "bg-purple-600" : "bg-slate-400")} />
                <span>
                  {change === "included"
                    ? (locale === "ar" ? "تعديل مجاني قبل الإقلاع" : locale === "tr" ? "Kalkış öncesi ücretsiz değişiklik" : "Free date change before departure")
                    : change === "chargeable"
                      ? changeFee?.amount != null
                            ? (locale === "ar" ? `تعديل قبل الإقلاع برسوم ${formatFlightPrice(changeFee.amount, changeFee.currency || selected?.currency || "USD")}` : `Change fee ${formatFlightPrice(changeFee.amount, changeFee.currency || selected?.currency || "USD")}`)
                            : (locale === "ar" ? "تعديل متاح برسوم قبل الإقلاع" : "Date change available with a fee")
                      : (locale === "ar" ? "تعديل غير متوفر" : locale === "tr" ? "Değişiklik yok" : "Date change not available")}
                </span>
              </p>
              {afterCancel || afterChange ? (
                <p className="mt-2 text-[11px] text-slate-500">
                  {locale === "ar"
                    ? `بعد الإقلاع: ${afterCancel ? "الإلغاء غير متاح" : ""}${afterCancel && afterChange ? " · " : ""}${afterChange ? "التعديل غير متاح" : ""}`
                    : locale === "tr"
                      ? `Kalkıştan sonra: ${afterCancel ? "iptal yok" : ""}${afterCancel && afterChange ? " · " : ""}${afterChange ? "değişiklik yok" : ""}`
                      : `After departure: ${afterCancel ? "cancellation not available" : ""}${afterCancel && afterChange ? " · " : ""}${afterChange ? "changes not available" : ""}`}
                </p>
              ) : null}
                  </>
                );
              })()}
            </div>
          </section>

          {details?.fareRules ? (
            <section className="rounded-2xl border border-slate-200 p-4">
              <h3 className="mb-2 text-sm font-black text-[#1e1b4b]">{copy.fareRules}</h3>
              <p className="whitespace-pre-line text-xs leading-relaxed text-slate-600">{details.fareRules}</p>
            </section>
          ) : null}

          <section>
            <h3 className="mb-3 text-sm font-black text-[#1e1b4b]">{copy.selectFare}</h3>
            <FareGrid
              fares={fares}
              selectedId={selected?.id || ""}
              onPick={(fare) => setSelectedFareId(fare.id)}
            />
          </section>
        </div>

        {/* Luxury Bottom Action Bar */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 border-t border-purple-100 bg-white/95 px-5 py-3.5 backdrop-blur shadow-[0_-8px_20px_rgba(46,16,101,0.04)]">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-[11px] font-bold text-slate-400">
                {copy.total} · <span className="text-purple-950 font-black">{selected?.name || "Standard"}</span>
              </p>
              {promoPrice.hasDiscount ? (
                <span className="inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-[#2e1065] to-[#4c1d95] px-1.5 py-0.5 text-[9.5px] font-black text-amber-300 shadow-2xs">
                  {locale === "ar"
                    ? `وفّروا ${formatFlightPrice(promoPrice.saved, selected?.currency || priceCurrency)} مع ${promoPrice.code}`
                    : locale === "tr"
                      ? `${promoPrice.code} ile ${formatFlightPrice(promoPrice.saved, selected?.currency || priceCurrency)} kazanın`
                      : `Save ${formatFlightPrice(promoPrice.saved, selected?.currency || priceCurrency)} with ${promoPrice.code}`}
                </span>
              ) : null}
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <p className="text-2xl font-black text-amber-500 tabular-nums">
                {selected
                  ? formatFlightPrice(
                      promoPrice.hasDiscount ? promoPrice.discounted : selected.price,
                      selected.currency || priceCurrency
                    )
                  : "—"}
              </p>
              {promoPrice.hasDiscount ? (
                <span className="text-xs font-semibold text-slate-400 line-through tabular-nums">
                  {formatFlightPrice(promoPrice.original, selected?.currency || priceCurrency)}
                </span>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            disabled={!selected}
            onClick={() => continueBooking(selected)}
            className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 active:scale-95 px-8 py-3 text-sm font-black text-slate-950 shadow-md shadow-amber-500/25 disabled:opacity-50 transition-all cursor-pointer"
          >
            {copy.continue}
          </button>
        </div>
      </aside>
    </div>
  );
}
