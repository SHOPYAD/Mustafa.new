"use client";

import { useEffect, useRef, useState, type ElementType } from "react";
import { MapPin } from "lucide-react";
import SearchPopover from "@/components/hotels/SearchPopover";
import {
  fieldIcon,
  fieldLabel,
  fieldShell,
  fieldShellActive,
  fieldValue,
} from "@/components/search/search-styles";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { GeoPlaceHit } from "@/lib/hotel-search";
import { cn } from "@/lib/utils";

const MIN_CHARS = 2;

type Props = {
  value: string;
  onChange: (value: string, place?: GeoPlaceHit) => void;
  label: string;
  placeholder: string;
  icon?: ElementType;
  className?: string;
};

export default function PlaceAutocomplete({
  value,
  onChange,
  label,
  placeholder,
  icon: Icon = MapPin,
  className,
}: Props) {
  const { locale, dir, t } = useLocale();
  const anchorRef = useRef<HTMLLabelElement>(null);
  const [open, setOpen] = useState(false);
  const [places, setPlaces] = useState<GeoPlaceHit[]>([]);
  const [highlight, setHighlight] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = value.trim();
    if (q.length < MIN_CHARS) {
      setPlaces([]);
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/geo/search?q=${encodeURIComponent(q)}&lang=${locale}`,
          { signal: ctrl.signal, cache: "no-store" }
        );
        const data = (await res.json()) as { places?: GeoPlaceHit[] };
        setPlaces(Array.isArray(data.places) ? data.places : []);
        setHighlight(0);
      } catch {
        if (!ctrl.signal.aborted) setPlaces([]);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 180);
    return () => {
      ctrl.abort();
      window.clearTimeout(timer);
    };
  }, [value, locale]);

  const pick = (place: GeoPlaceHit) => {
    onChange(place.city, place);
    setOpen(false);
  };

  const showList = open && value.trim().length >= MIN_CHARS;

  return (
    <label ref={anchorRef} className={cn("block min-w-0", className)}>
      <div className={cn(fieldShell, open && fieldShellActive)}>
        <Icon size={18} className={fieldIcon} />
        <span className="min-w-0 flex-1">
          <span className={fieldLabel}>{label}</span>
          <input
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(e.target.value.trim().length >= MIN_CHARS);
            }}
            onFocus={() => value.trim().length >= MIN_CHARS && setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHighlight((i) => Math.min(places.length - 1, i + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHighlight((i) => Math.max(0, i - 1));
              } else if (e.key === "Enter" && showList && places[highlight]) {
                e.preventDefault();
                pick(places[highlight]);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            autoComplete="off"
            placeholder={placeholder}
            className={cn(
              "mt-1 w-full bg-transparent outline-none placeholder:font-normal placeholder:text-slate-400",
              fieldValue
            )}
          />
        </span>
      </div>
      <SearchPopover
        open={showList}
        anchorRef={anchorRef}
        onClose={() => setOpen(false)}
        size="field"
        dir={dir}
      >
        <ul className="py-1" role="listbox">
          {loading && places.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-400">{t.common.loading}</li>
          ) : places.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-400">{t.hotels.noCitiesFound}</li>
          ) : (
            places.map((place, i) => (
              <li key={place.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === highlight}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors",
                    i === highlight
                      ? "bg-[var(--theme-chip-hover)] text-[var(--theme-text-heading)]"
                      : "text-slate-800 hover:bg-slate-50"
                  )}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => pick(place)}
                >
                  <span className="inline-flex min-w-0 items-center gap-2 font-semibold">
                    <MapPin size={14} className="shrink-0 text-[var(--brand-primary)]" />
                    <span className="truncate">{place.city}</span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {place.admin1 && place.admin1 !== place.city
                      ? `${place.admin1}, ${place.country}`
                      : place.country}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </SearchPopover>
    </label>
  );
}
