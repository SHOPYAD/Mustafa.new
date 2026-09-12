"use client";

import AirlineLogo from "@/components/flights/AirlineLogo";
import { formatHumanDate } from "@/components/flights/booking-format";
import type { FlightCopy } from "@/components/flights/copy";
import { formatClock, formatDuration } from "@/components/flights/normalize";
import type { FlightLeg, SelectedFare } from "@/components/flights/types";
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

function LegBlock({
  leg,
  tag,
  copy,
  locale,
  date,
}: {
  leg: FlightLeg;
  tag: string;
  copy: FlightCopy;
  locale: Locale;
  date?: string;
}) {
  const carrier = leg.carriers[0] || leg.segments[0]?.marketingCarrier;
  const flightNo =
    leg.segments[0]?.flightNumber ||
    (carrier?.code ? `${carrier.code}` : "");
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
      <div className="flex items-center gap-3">
        <AirlineLogo code={carrier?.code} name={carrier?.name} logoUrl={carrier?.logoUrl} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#051741]">
            {carrier?.name || carrier?.code || "—"}
            {flightNo ? (
              <span className="ms-2 font-mono text-xs text-slate-500" dir="ltr">
                {flightNo}
              </span>
            ) : null}
          </p>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">{tag}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2" dir="ltr">
        <div>
          <p className="text-lg font-bold tabular-nums text-[#051741]">{formatClock(leg.departure)}</p>
          <p className="text-xs font-semibold text-slate-600">{leg.origin.displayCode}</p>
          {leg.origin.city ? <p className="text-[11px] text-slate-400">{leg.origin.city}</p> : null}
        </div>
        <div className="text-center text-[11px] text-slate-400">
          <p>{formatDuration(leg.durationInMinutes)}</p>
          <p className="mx-auto my-1 h-px w-10 bg-slate-200" />
          <p>{leg.stopCount === 0 ? copy.nonstop : copy.layover}</p>
        </div>
        <div className="text-end">
          <p className="text-lg font-bold tabular-nums text-[#051741]">{formatClock(leg.arrival)}</p>
          <p className="text-xs font-semibold text-slate-600">{leg.destination.displayCode}</p>
          {leg.destination.city ? <p className="text-[11px] text-slate-400">{leg.destination.city}</p> : null}
        </div>
      </div>
      {date ? (
        <p className="mt-2 text-xs tabular-nums text-slate-500" dir="ltr">
          {formatHumanDate(date, locale)}
        </p>
      ) : null}
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
  const checkedBag =
    selection.itinerary.checkedBaggage || selection.fare?.baggage || "";
  const cabinBag = selection.itinerary.cabinBaggage || "";

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {outbound ? (
        <LegBlock
          leg={outbound}
          tag={copy.outboundTag}
          copy={copy}
          locale={locale}
          date={departDate}
        />
      ) : null}
      {inbound ? (
        <LegBlock
          leg={inbound}
          tag={copy.inboundTag}
          copy={copy}
          locale={locale}
          date={returnDate || departDate}
        />
      ) : null}
      <div className="flex flex-wrap gap-2 text-[11px]">
        {fareName ? (
          <span className="rounded-full bg-[#051741]/5 px-2.5 py-1 font-semibold text-[#051741]">
            {copy.fareBrand}: {fareName}
          </span>
        ) : null}
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{cabinLabel}</span>
        {cabinBag ? (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
            {copy.cabinBag}: {cabinBag}
          </span>
        ) : null}
        {checkedBag ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-800">
            {copy.checkedBag}: {checkedBag}
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-500">{copy.noCheckedBag}</span>
        )}
      </div>
    </div>
  );
}
