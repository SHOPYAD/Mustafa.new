"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Check,
  Luggage,
  MonitorPlay,
  Plane,
  Plug,
  UtensilsCrossed,
  Wifi,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { ar, enUS, tr } from "date-fns/locale";
import { flightDetails } from "@/components/flights/api";
import AirlineLogo from "@/components/flights/AirlineLogo";
import { cabinClassLabel, type FlightCopy } from "@/components/flights/copy";
import {
  bookingItinerarySnapshot,
  formatClock,
  formatDuration,
  hasValidFarePrices,
  legsPayload,
} from "@/components/flights/normalize";
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

function airportLine(place: FlightPlace): string {
  const code = place.displayCode;
  const city = place.city && place.city !== code ? place.city : "";
  const name = place.name && place.name !== city && place.name !== code ? place.name : "";
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

function baggageKg(value: string): string {
  const m = String(value || "").match(/(\d+)\s*k/i);
  if (m) return `${m[1]} ${"kg"}`;
  return value;
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
                      <p className="text-xs font-bold text-[#051741]">
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
                <Plane size={14} className="text-[#10b981]" />
                {airportLine(leg.origin)} → {airportLine(leg.destination)}
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
  return (
    <div className="relative pb-3">
      <TimePoint
        time={formatClock(seg.departure)}
        place={seg.origin}
        dateNote=""
        copy={copy}
      />
      <div className="ms-12 mb-3 mt-1 space-y-1.5">
        <p className="text-xs font-semibold text-[#051741]">
          {seg.marketingCarrier.name || seg.marketingCarrier.code} {seg.flightNumber || seg.flightNo}
          {` · ${cabinClassLabel(locale, cabin)}`}
        </p>
        {seg.operatingCarrier?.name && seg.operatingCarrier.name !== seg.marketingCarrier.name ? (
          <p className="text-[11px] text-slate-500">
            {copy.operatingCarrier} {seg.operatingCarrier.name}
          </p>
        ) : null}
        {seg.aircraft ? (
          <p className="text-[11px] text-slate-500">
            {copy.aircraftLabel}: {seg.aircraft}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Plane size={10} className="text-[#10b981]" />
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
      />
    </div>
  );
}

function TimePoint({
  time,
  place,
  dateNote,
  copy,
}: {
  time: string;
  place: FlightPlace;
  dateNote: string;
  copy: FlightCopy;
}) {
  return (
    <div className="relative flex items-start gap-3">
      <span className="relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-[#10b981] bg-white" />
      <div className="min-w-0 flex-1 pb-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <p className="text-base font-bold leading-none text-[#051741]">{time}</p>
          {dateNote ? (
            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">{dateNote}</span>
          ) : null}
        </div>
        <p className="mt-1 text-sm font-semibold text-slate-800">{airportLine(place)}</p>
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
  copy,
  formatPrice,
  currency,
}: {
  fares: FareFamily[];
  selectedId: string;
  onPick: (fare: FareFamily) => void;
  copy: FlightCopy;
  formatPrice: (amount: number, currency?: string) => string;
  currency: string;
}) {
  const cheapest = Math.min(...fares.map((f) => f.price).filter((n) => n > 0), Number.POSITIVE_INFINITY);
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {fares.map((fare, index) => {
        const selected = fare.id === selectedId;
        const recommended = fare.price === cheapest && cheapest !== Number.POSITIVE_INFINITY && index > 0;
        return (
          <button
            key={fare.id}
            type="button"
            onClick={() => onPick(fare)}
            className={cn(
              "relative rounded-2xl border bg-white p-4 text-start transition",
              selected ? "border-[#10b981] ring-2 ring-[#10b981]/30" : "border-slate-200 hover:border-[#10b981]/50"
            )}
          >
            {recommended ? (
              <span className="absolute -top-2 start-3 rounded-full bg-[#10b981] px-2 py-0.5 text-[10px] font-bold text-white">
                {copy.recommended}
              </span>
            ) : null}
            <div className="flex items-start justify-between gap-2">
              <span
                className={cn(
                  "mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border",
                  selected ? "border-[#10b981] bg-[#10b981] text-white" : "border-slate-300"
                )}
              >
                {selected ? <Check size={10} /> : null}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#051741]">{fare.name}</p>
                <p className="mt-1 text-lg font-extrabold text-[#051741]">{formatPrice(fare.price, fare.currency || currency)}</p>
              </div>
            </div>
            <div className="mt-3 space-y-2 text-xs text-slate-600">
              <p className="font-bold text-slate-400">{copy.baggage}</p>
              <p className="flex items-center gap-2">
                <Briefcase size={13} className="text-slate-400" />
                {copy.cabinBag}
              </p>
              <p className="flex items-center gap-2">
                <Luggage size={13} className="text-slate-400" />
                {fare.baggage ? baggageKg(fare.baggage) : copy.noCheckedBag}
              </p>
              <p className="pt-1 font-bold text-slate-400">{copy.flexibility}</p>
              <p>{fare.refundable ? copy.refundableFee : copy.nonRefundable}</p>
              <p>{fare.changeable ? copy.freeChange : copy.changeFee}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default function FlightDetailsDrawer({ item, query, sessionId, copy, onClose, onSelect }: Props) {
  const { locale, dir } = useLocale();
  const { formatFlightPrice } = useFlightPrice();
  const [details, setDetails] = useState<FlightDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);
  const [selectedFareId, setSelectedFareId] = useState("");

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
          baggage: item.fareFamilies[0]?.baggage || "cabin",
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

  if (!item) return null;

  const snapshot = bookingItinerarySnapshot(item, details);
  const legs = snapshot.legs;
  const hasRoutePreview = legs.some((leg) => leg.segments.length > 0);
  const enrichingRoute = loading && !hasRoutePreview;
  const priceCurrency = details?.currency || item.currency;
  const origin = snapshot.legs[0]?.origin;
  const dest = snapshot.legs[snapshot.legs.length - 1]?.destination;
  const selected = fares.find((f) => f.id === selectedFareId) || fares[0] || null;
  const totalMins = legs.reduce((sum, leg) => sum + (leg.durationInMinutes || 0), 0);
  const cabinBag =
    details?.cabinBaggage && details.cabinBaggage !== "—"
      ? details.cabinBaggage
      : item.cabinBaggage || copy.cabinBagIncluded;
  const checkedBag =
    details?.checkedBaggage && details.checkedBaggage !== "—"
      ? details.checkedBaggage
      : item.checkedBaggage || copy.noCheckedBag;

  const continueBooking = (fare: FareFamily | null) => {
    onSelect({
      itinerary: snapshot,
      fare,
      sessionId,
      extras: { extraBag: false, insurance: false, priorityBoarding: false },
    });
  };

  return (
    <div className="fixed inset-0 z-[130]">
      <button type="button" className="absolute inset-0 bg-[#051741]/45 backdrop-blur-[1px]" onClick={onClose} aria-label={copy.closeDetails} />
      <aside
        dir={dir}
        className={cn(
          "absolute inset-y-0 flex w-full max-w-2xl flex-col bg-white shadow-2xl",
          dir === "rtl" ? "start-0" : "end-0"
        )}
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <AirlineLogo
              code={snapshot.legs[0]?.carriers[0]?.code || snapshot.legs[0]?.segments[0]?.marketingCarrier.code}
              name={snapshot.legs[0]?.carriers[0]?.name || snapshot.legs[0]?.segments[0]?.marketingCarrier.name}
              logoUrl={snapshot.legs[0]?.carriers[0]?.logoUrl || snapshot.legs[0]?.segments[0]?.marketingCarrier.logoUrl}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-extrabold text-[#051741]">
                {origin?.city || origin?.name || origin?.displayCode} {dir === "rtl" ? "←" : "→"}{" "}
                {dest?.city || dest?.name || dest?.displayCode}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {origin?.name && origin.name !== origin.city ? `${origin.name} · ` : ""}
                {origin?.displayCode}
                {" — "}
                {dest?.name && dest.name !== dest.city ? `${dest.name} · ` : ""}
                {dest?.displayCode}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {copy.outboundTag}: {query.date} · {copy.totalDuration} {formatDuration(totalMins)}
                {loading ? ` · ${copy.loadingDetails}` : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200"
              aria-label={copy.closeDetails}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-auto px-5 py-5 pb-28">
          <section>
            <h3 className="mb-3 text-sm font-bold text-[#051741]">{copy.timeline}</h3>
            {enrichingRoute ? (
              <TimelineSkeleton />
            ) : (
              <RouteTimeline legs={legs} copy={copy} item={item} locale={locale} cabin={query.cabinClass} />
            )}
            {detailError ? <p className="mt-2 text-xs text-amber-600">{copy.errorHint}</p> : null}
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#051741]">
                <Luggage size={15} />
                {copy.baggage}
              </h3>
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <Briefcase size={14} className="text-slate-400" />
                {copy.cabinBag}: {cabinBag}
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <Luggage size={14} className="text-slate-400" />
                {copy.checkedBag}: {checkedBag}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-100 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#051741]">
                <Plane size={15} />
                {copy.policies}
              </h3>
              <p className="text-sm text-slate-600">{policyText(copy, details, snapshot)}</p>
              {details?.changeLabel === "free_change" || snapshot.farePolicy?.isChangeAllowed ? (
                <p className="mt-2 text-sm text-emerald-700">{copy.freeChange}</p>
              ) : null}
            </div>
          </section>

          {details?.fareRules ? (
            <section className="rounded-2xl border border-slate-100 p-4">
              <h3 className="mb-2 text-sm font-bold text-[#051741]">{copy.fareRules}</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">{details.fareRules}</p>
            </section>
          ) : null}

          <section>
            <h3 className="mb-3 text-sm font-bold text-[#051741]">{copy.selectFare}</h3>
            <FareGrid
              fares={fares}
              selectedId={selected?.id || ""}
              onPick={(fare) => setSelectedFareId(fare.id)}
              copy={copy}
              formatPrice={formatFlightPrice}
              currency={priceCurrency}
            />
          </section>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 border-t border-slate-100 bg-white/95 px-5 py-3 backdrop-blur">
          <div>
            <p className="text-[11px] text-slate-400">{copy.total}</p>
            <p className="text-xl font-extrabold text-[#051741]">
              {selected ? formatFlightPrice(selected.price, selected.currency || priceCurrency) : "—"}
            </p>
          </div>
          <button
            type="button"
            disabled={!selected}
            onClick={() => continueBooking(selected)}
            className="rounded-xl bg-[#10b981] px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
          >
            {copy.continue}
          </button>
        </div>
      </aside>
    </div>
  );
}
