"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { groupAirports } from "@/components/flights/airport-groups";
import { searchAirports } from "@/components/flights/api";
import FlightPopover, { isFlightPopoverTarget } from "@/components/flights/FlightPopover";
import type { FlightCopy } from "@/components/flights/copy";
import { displayCountry, loadFlightCountryLabels } from "@/components/flights/system-labels";
import type { AirportPick } from "@/components/flights/types";
import {
  fieldLabel,
  fieldShell,
  fieldShellActive,
  fieldValue,
} from "@/components/search/search-styles";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: AirportPick | null;
  onChange: (next: AirportPick | null) => void;
  copy: FlightCopy;
  autoFocus?: boolean;
};

function formatPick(value: AirportPick): string {
  const code = value.iata || value.skyId;
  const city = value.city || value.name;
  return `${city} (${code})`;
}

export default function AirportAutocomplete({ label, value, onChange, copy, autoFocus }: Props) {
  const { locale, dir } = useLocale();
  const anchorRef = useRef<HTMLLabelElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(value ? formatPick(value) : "");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hits, setHits] = useState<AirportPick[]>([]);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    void loadFlightCountryLabels().then(setLabels);
  }, []);

  useEffect(() => {
    if (value) {
      setText(formatPick(value));
      setTouched(false);
    }
  }, [value]);

  useEffect(() => {
    const q = text.trim();
    if (!open || q.length < 2 || (value && q === formatPick(value))) {
      setHits([]);
      return;
    }
    const ctrl = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const next = await searchAirports(q, locale, ctrl.signal);
        setHits(next);
      } catch {
        if (!ctrl.signal.aborted) setHits([]);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 220);
    return () => {
      ctrl.abort();
      window.clearTimeout(timer);
    };
  }, [text, locale, value, open]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (anchorRef.current?.contains(e.target as Node)) return;
      if (isFlightPopoverTarget(e.target)) return;
      setOpen(false);
      if (!value) setText("");
      else setText(formatPick(value));
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [value]);

  const groups = useMemo(() => groupAirports(hits), [hits]);
  const showList = open && (loading || hits.length > 0 || text.trim().length >= 2);

  const pick = (hit: AirportPick) => {
    onChange(hit);
    setText(formatPick(hit));
    setTouched(false);
    setOpen(false);
  };

  return (
    <label ref={anchorRef} className="block min-w-0 flex-1">
      <div
        className={cn(
          fieldShell,
          "h-[3.25rem] flex-col items-stretch justify-center gap-0.5",
          open && fieldShellActive,
          touched && !value && "border-rose-300"
        )}
      >
        <span className={fieldLabel}>{label}</span>
        <input
          ref={inputRef}
          value={text}
          autoFocus={autoFocus}
          onChange={(e) => {
            setText(e.target.value);
            onChange(null);
            setTouched(true);
            setOpen(true);
          }}
          onFocus={(e) => {
            setOpen(true);
            e.currentTarget.select();
          }}
          placeholder={copy.airportPlaceholder}
          autoComplete="off"
          spellCheck={false}
          style={{ border: "none", outline: "none", boxShadow: "none" }}
          className={cn(
            "w-full bg-transparent border-0 border-none outline-none focus:outline-none focus:border-0 focus:ring-0 shadow-none ring-0 p-0 m-0 placeholder:font-semibold placeholder:text-slate-400 text-slate-950 font-black",
            fieldValue
          )}
        />
      </div>
      <FlightPopover open={showList} anchorRef={anchorRef} onClose={() => setOpen(false)} dir={dir} minWidth={340}>
        <div className="p-1.5">
          {loading ? (
            <p className="flex items-center gap-2 px-3 py-3 text-sm text-slate-500">
              <Loader2 size={14} className="animate-spin" /> …
            </p>
          ) : hits.length === 0 ? (
            <p className="px-3 py-3 text-sm text-slate-500">
              {text.trim().length < 2 ? copy.pickFromList : copy.noAirports}
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.country} className="mb-2">
                <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 mb-1">
                  {displayCountry(group.country, labels)}
                </p>
                {group.cities.map((city) => (
                  <div key={`${group.country}-${city.city}`}>
                    {city.cityPick ? (
                      <button
                        type="button"
                        onClick={() => pick(city.cityPick!)}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-start hover:bg-purple-50 transition-colors"
                      >
                        <span className="inline-flex h-8 min-w-11 items-center justify-center rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black px-1.5 text-[11px] shadow-sm flex-shrink-0">
                          {city.cityPick.iata || city.cityPick.skyId}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-slate-900 group-hover:text-purple-950">{city.city}</span>
                          <span className="block truncate text-xs font-semibold text-purple-700">{copy.allAirports}</span>
                        </span>
                      </button>
                    ) : (
                      <p className="px-3 pt-1 text-xs font-bold text-slate-700">{city.city}</p>
                    )}
                    {city.airports.map((hit) => (
                      <button
                        key={`${hit.skyId}-${hit.entityId}`}
                        type="button"
                        onClick={() => pick(hit)}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-start hover:bg-purple-50 transition-colors"
                      >
                        <span className="inline-flex h-8 min-w-11 items-center justify-center rounded-lg bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-amber-300 font-mono font-black px-1.5 text-[11px] shadow-xs flex-shrink-0 border border-amber-400/30">
                          {hit.iata || hit.skyId}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-slate-900 group-hover:text-purple-950">{hit.name}</span>
                          <span className="block truncate text-xs font-medium text-slate-500">
                            {[hit.city, displayCountry(hit.country, labels)].filter(Boolean).join(" · ")}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </FlightPopover>
    </label>
  );
}
