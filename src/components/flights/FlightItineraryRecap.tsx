"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Info,
  Luggage,
  MapPin,
  Plane,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import AirlineLogo from "@/components/flights/AirlineLogo";
import { formatHumanDate } from "@/components/flights/booking-format";
import type { FlightCopy } from "@/components/flights/copy";
import { formatBaggageText, formatClock, formatDuration } from "@/components/flights/normalize";
import type { FlightLeg, FlightPlace, FlightSegment, SelectedFare } from "@/components/flights/types";
import { getLocalizedAirlineName } from "@/lib/flights/airline-dictionary";
import { getLocalizedPlace } from "@/lib/flights/airport-dictionary";
import type { Locale } from "@/lib/i18n/types";

type Props = {
  selection: SelectedFare;
  locale: Locale;
  copy: FlightCopy;
  departDate: string;
  returnDate?: string;
  cabinLabel: string;
  compact?: boolean;
};

function terminalBadge(place: FlightPlace, copy: FlightCopy) {
  if (!place.terminal) return null;
  const t = String(place.terminal).replace(/^t/i, "");
  return `${copy.terminalLabel} ${t}`;
}

function LegBlock({
  leg,
  tag,
  copy,
  locale,
  date,
  defaultExpanded = false,
}: {
  leg: FlightLeg;
  tag: string;
  copy: FlightCopy;
  locale: Locale;
  date?: string;
  defaultExpanded?: boolean;
}) {
  const [showSegments, setShowSegments] = useState(defaultExpanded);

  const carrier = leg.carriers[0] || leg.segments[0]?.marketingCarrier;
  const carrierName =
    getLocalizedAirlineName(carrier?.code || carrier?.name, locale) || carrier?.name || "—";
  const flightNo =
    leg.segments[0]?.flightNumber ||
    (carrier?.code ? `${carrier.code}` : "");

  const originPlace = getLocalizedPlace(
    leg.origin.displayCode,
    leg.origin.name,
    leg.origin.city,
    locale
  );
  const destPlace = getLocalizedPlace(
    leg.destination.displayCode,
    leg.destination.name,
    leg.destination.city,
    locale
  );

  const originTerm = terminalBadge(leg.origin, copy);
  const destTerm = terminalBadge(leg.destination, copy);

  // Multi-segment inspection
  const hasStops = leg.stopCount > 0 || leg.segments.length > 1;
  const stopsCount = Math.max(leg.stopCount, leg.segments.length > 1 ? leg.segments.length - 1 : 0);

  // Identify main layover place
  const firstLayoverSeg = leg.segments[0];
  const layoverPlace = firstLayoverSeg
    ? getLocalizedPlace(
        firstLayoverSeg.destination.displayCode,
        firstLayoverSeg.destination.name,
        firstLayoverSeg.destination.city,
        locale
      )
    : null;

  return (
    <div className="rounded-2xl border border-purple-100 bg-white shadow-xs overflow-hidden transition-all hover:border-purple-300/80">
      {/* Leg Header */}
      <div className="bg-gradient-to-r from-purple-950/5 via-slate-50 to-amber-500/5 px-4 py-3 border-b border-purple-100/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <AirlineLogo
            code={carrier?.code}
            name={carrierName}
            logoUrl={carrier?.logoUrl}
            size="sm"
            className="rounded-xl border border-purple-200/60 bg-white"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-[#051741]">
              {carrierName}
              {flightNo ? (
                <span className="ms-2 font-mono text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md" dir="ltr">
                  {flightNo}
                </span>
              ) : null}
            </p>
            <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-amber-800">
              {tag}
            </span>
          </div>
        </div>

        {date ? (
          <span className="text-[11px] font-bold text-slate-500 shrink-0 tabular-nums">
            {formatHumanDate(date, locale)}
          </span>
        ) : null}
      </div>

      {/* Main Times & Airports Overview */}
      <div className="p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          {/* Departure */}
          <div className="text-start">
            <p className="text-xl font-black tabular-nums text-[#051741]">{formatClock(leg.departure)}</p>
            <p className="text-xs font-bold text-slate-900 mt-0.5">{originPlace.city}</p>
            <p className="text-[11px] font-semibold text-slate-500 line-clamp-1" title={originPlace.airport}>
              {originPlace.airport}
            </p>
            <p className="text-[10px] font-mono font-bold text-purple-700 mt-0.5">
              {originPlace.code} {originTerm ? `· ${originTerm}` : ""}
            </p>
          </div>

          {/* Duration & Stops Indicator */}
          <div className="flex flex-col items-center px-2 text-center">
            <span className="text-[11px] font-bold text-slate-600 tabular-nums flex items-center gap-1">
              <Clock size={11} className="text-purple-600" />
              {formatDuration(leg.durationInMinutes)}
            </span>
            <div className="relative flex items-center my-1.5 w-20">
              <span className="h-0.5 w-full bg-purple-200" />
              <Plane size={11} className="absolute inset-0 m-auto text-purple-700" />
            </div>
            {hasStops ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-900 border border-amber-200">
                <span>{stopsCount === 1 ? copy.oneStop : `${stopsCount} ${copy.twoPlus}`}</span>
                {layoverPlace ? <span className="font-mono">({layoverPlace.code})</span> : null}
              </span>
            ) : (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-800 border border-emerald-200">
                {copy.nonstop}
              </span>
            )}
          </div>

          {/* Arrival */}
          <div className="text-end">
            <p className="text-xl font-black tabular-nums text-[#051741]">{formatClock(leg.arrival)}</p>
            <p className="text-xs font-bold text-slate-900 mt-0.5">{destPlace.city}</p>
            <p className="text-[11px] font-semibold text-slate-500 line-clamp-1" title={destPlace.airport}>
              {destPlace.airport}
            </p>
            <p className="text-[10px] font-mono font-bold text-purple-700 mt-0.5">
              {destPlace.code} {destTerm ? `· ${destTerm}` : ""}
            </p>
          </div>
        </div>

        {/* Interactive Transit / Segment Breakdown Toggle */}
        {hasStops && (
          <div className="mt-3.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowSegments((prev) => !prev)}
              className="w-full flex items-center justify-between text-xs font-bold text-purple-800 hover:text-purple-950 py-1 cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Info size={13} className="text-purple-600" />
                <span>
                  {locale === "ar"
                    ? showSegments
                      ? "إخفاء تفاصيل محطات التوقف ومسار الرحلة"
                      : `عرض تفاصيل التوقف ومسار الرحلة كاملة (${stopsCount} محطة)`
                    : showSegments
                    ? "Hide Flight Segments & Layover Details"
                    : `View Segments & Layover Details (${stopsCount} Stop)`}
                </span>
              </span>
              {showSegments ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {/* Expandable Segments List */}
            {showSegments && (
              <div className="mt-2.5 space-y-3 rounded-xl bg-slate-50/90 p-3 border border-slate-200/80">
                {leg.segments.map((seg, sIdx) => {
                  const segCarrier = seg.marketingCarrier || carrier;
                  const segCarrierName =
                    getLocalizedAirlineName(segCarrier?.code || segCarrier?.name, locale) ||
                    segCarrier?.name ||
                    "—";
                  const segOrigin = getLocalizedPlace(
                    seg.origin.displayCode,
                    seg.origin.name,
                    seg.origin.city,
                    locale
                  );
                  const segDest = getLocalizedPlace(
                    seg.destination.displayCode,
                    seg.destination.name,
                    seg.destination.city,
                    locale
                  );

                  // Layover after this segment if not the last
                  const nextSeg = leg.segments[sIdx + 1];
                  const layoverMinutes =
                    nextSeg && seg.arrival && nextSeg.departure
                      ? Math.max(
                          0,
                          Math.round(
                            (new Date(nextSeg.departure).getTime() - new Date(seg.arrival).getTime()) /
                              60000
                          )
                        )
                      : 0;

                  return (
                    <div key={seg.id || sIdx} className="space-y-2">
                      {/* Segment Card */}
                      <div className="rounded-lg bg-white p-2.5 border border-slate-200 shadow-2xs">
                        <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <AirlineLogo
                              code={segCarrier?.code}
                              name={segCarrierName}
                              logoUrl={segCarrier?.logoUrl}
                              size="sm"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-900">{segCarrierName}</p>
                              <p className="text-[10px] text-purple-700 font-mono" dir="ltr">
                                {seg.flightNumber || seg.flightNo}
                                {seg.aircraft ? ` · ${seg.aircraft}` : ""}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">
                            {formatDuration(seg.durationInMinutes)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-start">
                            <span className="text-[10px] text-slate-400 block">
                              {locale === "ar" ? "الإقلاع من:" : "Departure:"}
                            </span>
                            <strong className="text-slate-900 font-mono text-sm">
                              {formatClock(seg.departure)}
                            </strong>
                            <p className="font-semibold text-slate-800 text-[11px]">{segOrigin.city}</p>
                            <p className="text-[10px] text-slate-500 line-clamp-1">{segOrigin.airport}</p>
                          </div>
                          <div className="text-end">
                            <span className="text-[10px] text-slate-400 block">
                              {locale === "ar" ? "الوصول إلى:" : "Arrival:"}
                            </span>
                            <strong className="text-slate-900 font-mono text-sm">
                              {formatClock(seg.arrival)}
                            </strong>
                            <p className="font-semibold text-slate-800 text-[11px]">{segDest.city}</p>
                            <p className="text-[10px] text-slate-500 line-clamp-1">{segDest.airport}</p>
                          </div>
                        </div>
                      </div>

                      {/* Layover Alert between Segments */}
                      {nextSeg && (
                        <div className="flex items-center gap-2 rounded-lg bg-amber-50/90 px-3 py-2 border border-amber-200/80 text-[11px] text-amber-950">
                          <RefreshCw size={13} className="text-amber-700 shrink-0 animate-spin-slow" />
                          <div className="min-w-0">
                            <p className="font-bold">
                              {locale === "ar"
                                ? `فترة انتظار وترانزيت في ${segDest.city} (${segDest.airport})`
                                : `Transit & Layover in ${segDest.city} (${segDest.airport})`}
                            </p>
                            <p className="text-[10px] text-amber-800 font-medium">
                              {locale === "ar"
                                ? `مدة التوقف: ${formatDuration(layoverMinutes)} · نقل الأمتعة يتم تلقائياً إلى الوجهة النهائية`
                                : `Layover duration: ${formatDuration(layoverMinutes)} · Baggage checked through to final destination`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FlightItineraryRecap({
  selection,
  locale,
  copy,
  departDate,
  returnDate,
  cabinLabel,
  compact,
}: Props) {
  const outbound = selection.itinerary.legs[0];
  const inbound = selection.itinerary.legs[1];
  const fareName = selection.fare?.name || selection.itinerary.fareBrand || cabinLabel;

  const rawChecked =
    selection.itinerary.checkedBaggage || selection.fare?.baggage || "";
  const checkedBag = formatBaggageText(rawChecked, locale);
  const cabinBag = selection.itinerary.cabinBaggage || (locale === "ar" ? "حقيبة يد (7 كجم)" : "Cabin Bag (7 kg)");

  return (
    <div className={compact ? "space-y-2.5" : "space-y-3.5"}>
      {outbound ? (
        <LegBlock
          leg={outbound}
          tag={copy.outboundTag}
          copy={copy}
          locale={locale}
          date={departDate}
          defaultExpanded={false}
        />
      ) : null}

      {inbound ? (
        <LegBlock
          leg={inbound}
          tag={copy.inboundTag}
          copy={copy}
          locale={locale}
          date={returnDate || departDate}
          defaultExpanded={false}
        />
      ) : null}

      {/* Verified Baggage & Package Pill Badges */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/90 p-3 flex flex-wrap items-center gap-2 text-xs">
        {fareName ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100/90 px-3 py-1 font-black text-purple-950 border border-purple-200">
            <Sparkles size={11} className="text-purple-700" />
            <span>{copy.fareBrand}: {fareName}</span>
          </span>
        ) : null}

        <span className="rounded-full bg-white px-3 py-1 font-bold text-slate-700 border border-slate-200">
          {cabinLabel}
        </span>

        {cabinBag ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-semibold text-slate-700 border border-slate-200">
            <Luggage size={11} className="text-slate-500" />
            <span>{copy.cabinBag}: {cabinBag}</span>
          </span>
        ) : null}

        {checkedBag ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 font-bold text-emerald-800 border border-emerald-200 ring-1 ring-emerald-300/60">
            <Luggage size={12} className="text-emerald-700" />
            <span>{checkedBag}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-bold text-amber-900 border border-amber-200 ring-1 ring-amber-300/60">
            <Luggage size={12} className="text-amber-700 opacity-60" />
            <span>{copy.noCheckedBag} ({locale === "ar" ? "أمتعة يد فقط" : "Hand Luggage Only"})</span>
          </span>
        )}
      </div>
    </div>
  );
}
