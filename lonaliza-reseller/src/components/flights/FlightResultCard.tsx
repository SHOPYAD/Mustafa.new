"use client";

import { useState } from "react";
import { Briefcase, ChevronDown, ChevronLeft, ChevronUp, Luggage, Plane, ShieldCheck, Timer } from "lucide-react";
import AirlineLogo from "@/components/flights/AirlineLogo";
import type { FlightCopy } from "@/components/flights/copy";
import {
  formatClock,
  formatDuration,
  hasValidFarePrices,
  isItineraryRefundable,
  maxCheckedKg,
  parseBaggageKg,
} from "@/components/flights/normalize";
import { useFlightPrice } from "@/components/flights/useFlightPrice";
import LoyaltyPointsRow from "@/components/loyalty/LoyaltyPointsRow";
import type { FareFamily, FlightPlace, FlightSearchQuery, Itinerary, SelectedFare } from "@/components/flights/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type Props = {
  item: Itinerary;
  query: FlightSearchQuery;
  copy: FlightCopy;
  onSelect: (selection: SelectedFare) => void;
  onOpenDetails: () => void;
};

function cityOf(place: FlightPlace): string {
  return place.city || place.name || place.displayCode;
}

function airportOf(place: FlightPlace): string {
  if (place.name && place.name !== place.city && place.name !== place.displayCode) return place.name;
  return place.displayCode;
}

function terminalOf(place: FlightPlace): string {
  if (!place.terminal) return "";
  const t = String(place.terminal).replace(/^t/i, "");
  return t ? `T${t}` : "";
}

function cabinBaggageLabel(item: Itinerary, copy: FlightCopy): string {
  if (item.cabinBaggage) return item.cabinBaggage;
  const fare = item.fareFamilies[0];
  const raw = String(fare?.baggage || "").toLowerCase();
  if (!raw || raw === "cabin") return copy.cabinBagIncluded;
  if (raw.includes("cabin") || raw.includes("carry")) return raw;
  return copy.cabinBagIncluded;
}

function checkedBaggageLabel(item: Itinerary, copy: FlightCopy): string | null {
  if (item.checkedBaggage) return item.checkedBaggage;
  const kg = maxCheckedKg(item);
  if (kg > 0) return `${kg} kg`;
  const fare = item.fareFamilies.find((f) => parseBaggageKg(f.baggage) > 0);
  if (fare) return fare.baggage;
  const included = item.fareFamilies.some((f) => {
    const raw = String(f.baggage || "").toLowerCase();
    return raw.includes("checked") || raw.includes("included") || parseBaggageKg(raw) > 0;
  });
  if (included) return copy.baggageIncluded;
  return null;
}

export default function FlightResultCard({ item, copy, onSelect, onOpenDetails }: Props) {
  const { dir } = useLocale();
  const { formatFlightPrice } = useFlightPrice();
  const [faresOpen, setFaresOpen] = useState(false);
  const outbound = item.legs[0];
  const carrier = outbound?.carriers[0] || outbound?.segments[0]?.marketingCarrier;
  const operating = outbound?.segments[0]?.operatingCarrier;
  const checkedBag = checkedBaggageLabel(item, copy);
  const totalDuration = item.legs.reduce((sum, leg) => sum + leg.durationInMinutes, 0);
  const fareBrand = item.fareBrand || item.fareFamilies[0]?.name;
  const refundable = isItineraryRefundable(item);
  const flightNos = outbound?.segments.map((s) => s.flightNumber || s.flightNo).filter(Boolean).join(" · ");

  const pickDefault = () => {
    const fare: FareFamily | null = item.fareFamilies[0] || null;
    onSelect({
      itinerary: item,
      fare,
      extras: { extraBag: false, insurance: false, priorityBoarding: false },
    });
  };

  const pickFare = (fare: FareFamily) => {
    onSelect({
      itinerary: item,
      fare,
      extras: { extraBag: false, insurance: false, priorityBoarding: false },
    });
  };

  const showFareTiers = hasValidFarePrices(item.fareFamilies) && item.fareFamilies.length > 1;

  return (
    <article className="group overflow-hidden rounded-3xl border border-[#051741]/8 bg-white shadow-[0_10px_28px_rgba(5,23,65,0.06)] transition hover:border-[#10b981]/35 hover:shadow-[0_16px_40px_rgba(5,23,65,0.1)]">
      <div className="flex flex-col gap-0 lg:flex-row">
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <AirlineLogo code={carrier?.code} name={carrier?.name} logoUrl={carrier?.logoUrl} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-[#051741]">{carrier?.name || "—"}</p>
                <p className="truncate text-xs text-slate-500">
                  {flightNos || carrier?.code}
                  {outbound?.segments[0]?.aircraft ? ` · ${outbound.segments[0].aircraft}` : ""}
                </p>
                {operating?.name && operating.name !== carrier?.name ? (
                  <p className="truncate text-[11px] text-slate-400">
                    {copy.operatingCarrier} {operating.name}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {item.tags.includes("cheapest") ? (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                  {copy.cheapest}
                </span>
              ) : null}
              {item.tags.includes("fastest") ? (
                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-sky-700">
                  {copy.fastest}
                </span>
              ) : null}
              {item.tags.includes("best") ? (
                <span className="rounded-full bg-[#051741]/5 px-2.5 py-1 text-[10px] font-bold text-[#051741]">
                  {copy.bestValue}
                </span>
              ) : null}
              {refundable ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                  <ShieldCheck size={11} />
                  {copy.refundableFree}
                </span>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            {item.legs.map((leg, index) => {
              const stopCities = leg.layovers.map((l) => l.city || l.airport).filter(Boolean);
              const originTerm = terminalOf(leg.origin);
              const destTerm = terminalOf(leg.destination);
              return (
                <div key={leg.id || leg.departure} className="rounded-2xl bg-slate-50/80 p-3 md:p-4">
                  <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    <span>{index === 0 ? copy.departure : copy.return}</span>
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Timer size={12} />
                      {formatDuration(leg.durationInMinutes)}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1 text-start">
                      <p className="text-2xl font-bold leading-none text-[#051741]">{formatClock(leg.departure)}</p>
                      <p className="mt-1.5 text-sm font-bold text-[#051741]">{cityOf(leg.origin)}</p>
                      <p className="truncate text-xs text-slate-600">{airportOf(leg.origin)}</p>
                      <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                        {leg.origin.displayCode}
                        {originTerm ? ` · ${copy.terminalLabel} ${originTerm}` : ""}
                      </p>
                    </div>
                    <div className="min-w-[7.5rem] flex-1 pt-1 text-center sm:min-w-[9rem]">
                      <p className="text-[11px] font-semibold text-slate-500">
                        {leg.stopCount === 0
                          ? copy.nonstop
                          : `${leg.stopCount} ${leg.stopCount === 1 ? copy.oneStop : copy.twoPlus}`}
                      </p>
                      <div className="relative my-2 h-px bg-gradient-to-l from-[#051741]/20 via-[#10b981] to-[#051741]/20">
                        <Plane
                          size={14}
                          className={cn(
                            "absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#10b981]",
                            dir === "rtl" && "rotate-180"
                          )}
                        />
                      </div>
                      <p className="text-[11px] font-bold text-[#051741]">{formatDuration(leg.durationInMinutes)}</p>
                      {stopCities.length ? (
                        <p className="mt-1 truncate text-[11px] text-slate-500">
                          {copy.layover} {stopCities.join(" · ")}
                          {leg.layovers[0]?.durationInMinutes
                            ? ` · ${formatDuration(leg.layovers[0].durationInMinutes)}`
                            : ""}
                        </p>
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1 text-end">
                      <p className="text-2xl font-bold leading-none text-[#051741]">
                        {formatClock(leg.arrival)}
                        {leg.timeDeltaInDays > 0 ? (
                          <span className="ms-1 text-[10px] font-bold text-[#059669]">+{leg.timeDeltaInDays}</span>
                        ) : null}
                      </p>
                      <p className="mt-1.5 text-sm font-bold text-[#051741]">{cityOf(leg.destination)}</p>
                      <p className="truncate text-xs text-slate-600">{airportOf(leg.destination)}</p>
                      <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                        {leg.destination.displayCode}
                        {destTerm ? ` · ${copy.terminalLabel} ${destTerm}` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-100">
              <Briefcase size={13} className="text-[#051741]/70" />
              {cabinBaggageLabel(item, copy)}
            </span>
            {checkedBag ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-100">
                <Luggage size={13} className="text-[#051741]/70" />
                {checkedBag}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-slate-400 ring-1 ring-slate-100">
                <Luggage size={13} />
                {copy.noCheckedBag}
              </span>
            )}
            {fareBrand ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-100">
                {copy.fareBrand}: {fareBrand}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-slate-100">
              <Timer size={13} className="text-[#051741]/70" />
              {formatDuration(totalDuration)} {copy.totalDuration}
            </span>
            {item.isSelfTransfer ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-amber-800 ring-1 ring-amber-100">
                <ShieldCheck size={13} />
                {copy.selfTransfer}
              </span>
            ) : null}
            <LoyaltyPointsRow amount={item.price} currency={item.currency} service="flights" />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 border-t border-slate-100 bg-gradient-to-b from-slate-50/50 to-white p-4 md:p-5 lg:w-56 lg:border-t-0 lg:border-s border-slate-100">
          <div className="text-end">
            <p className="text-3xl font-bold tracking-tight text-[#051741]">
              {formatFlightPrice(item.price, item.currency)}
            </p>
            <p className="text-xs text-slate-500">{copy.perPerson}</p>
            {item.baseFare || item.taxes ? (
              <p className="mt-1 text-[11px] text-slate-400">
                {copy.baseFare} {formatFlightPrice(item.baseFare || item.price, item.currency)}
                {item.taxes ? ` · ${copy.taxesFees} ${formatFlightPrice(item.taxes, item.currency)}` : ""}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2.5">
            {showFareTiers ? (
              <button
                type="button"
                onClick={() => setFaresOpen((open) => !open)}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-100 hover:bg-emerald-200 px-3 py-2.5 text-xs font-black text-emerald-950 shadow-sm transition-all active:scale-[0.98]"
              >
                {copy.fareTiers}
                {faresOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            ) : null}
            <button
              type="button"
              onClick={pickDefault}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] px-4 py-3 text-sm font-black text-white shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
            >
              {copy.selectFlight}
            </button>
            <button
              type="button"
              onClick={onOpenDetails}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 active:scale-[0.98] px-3 py-2.5 text-xs font-bold text-slate-800 shadow-sm transition-all"
            >
              {copy.showDetails}
              <ChevronLeft size={14} className={dir === "rtl" ? "" : "rotate-180"} />
            </button>
          </div>
        </div>
      </div>

      {showFareTiers && faresOpen ? (
        <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 md:px-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{copy.fareTiers}</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {item.fareFamilies.map((fare) => (
              <button
                key={fare.id}
                type="button"
                onClick={() => pickFare(fare)}
                className="rounded-2xl border border-slate-200 bg-white p-3 text-start transition hover:border-[#10b981]"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-[#051741]">{fare.name}</p>
                  <p className="text-sm font-bold text-[#051741]">
                    {formatFlightPrice(fare.price, fare.currency || item.currency)}
                  </p>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  {copy.checkedBag}: {fare.baggage}
                </p>
                <p className="text-[11px] text-slate-500">
                  {fare.refundable ? copy.refundableFee : copy.nonRefundable}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
