"use client";

import { useEffect, useMemo, useRef, useState, type ElementType } from "react";
import { MapPin, Plane } from "lucide-react";
import SearchPopover, {
  isHotelSearchPopoverTarget,
} from "@/components/hotels/SearchPopover";
import {
  fieldIcon,
  fieldLabel,
  fieldShell,
  fieldShellActive,
  fieldValue,
} from "@/components/search/search-styles";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  filterTurkeyLocations,
  locationDisplayName,
  locationTypeLabel,
  resolveLocationQuery,
  type TurkeyLocation,
} from "@/lib/cars/turkey-locations";

type LocationAutocompleteProps = {
  value: string;
  onChange: (value: string, location?: TurkeyLocation) => void;
  placeholder: string;
  icon?: ElementType;
  className?: string;
  inputClassName?: string;
  variant?: "light" | "dark" | "widget";
  label?: string;
};

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder,
  icon: Icon = MapPin,
  className,
  inputClassName,
  variant = "light",
  label,
}: LocationAutocompleteProps) {
  const { locale, dir } = useLocale();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLLabelElement>(null);
  const suggestions = useMemo(
    () => filterTurkeyLocations(value, locale, 12),
    [value, locale]
  );

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        if (isHotelSearchPopoverTarget(e.target)) return;
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (loc: TurkeyLocation) => {
    onChange(locationDisplayName(loc, locale), loc);
    setOpen(false);
  };

  const minChars = value.trim().length >= 2 || /^[A-Za-z]{3}$/.test(value.trim());
  const isWidget = variant === "widget";
  const showList = open && suggestions.length > 0;

  const input = (
    <input
      type="text"
      value={value}
      onChange={(e) => {
        onChange(e.target.value, resolveLocationQuery(e.target.value));
        setOpen(e.target.value.trim().length >= 2);
      }}
      onFocus={() => minChars && setOpen(true)}
      placeholder={placeholder}
      autoComplete="off"
      className={cn(
        isWidget
          ? cn(
              "mt-1 w-full bg-transparent outline-none placeholder:font-normal placeholder:text-slate-400",
              fieldValue
            )
          : variant === "dark"
            ? "w-full ps-12 pe-4 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-purple-500/40 text-sm"
            : "w-full ps-12 pe-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-600 outline-none transition-all placeholder:text-slate-400 text-slate-800 font-medium",
        inputClassName
      )}
    />
  );

  const list = suggestions.map((loc) => {
    const TypeIcon = loc.type === "airport" ? Plane : MapPin;
    return (
      <li key={loc.id}>
        <button
          type="button"
          onClick={() => pick(loc)}
          className={cn(
            "w-full text-start px-4 py-2.5 text-sm transition-colors flex items-center gap-3",
            variant === "dark"
              ? "hover:bg-white/5 text-white"
              : "hover:bg-purple-50 text-slate-800 font-medium"
          )}
        >
          <TypeIcon
            size={16}
            className={
              loc.type === "airport"
                ? "text-[var(--navy)] shrink-0"
                : "text-[var(--brand-primary)] shrink-0"
            }
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate">{locationDisplayName(loc, locale)}</span>
            <span
              className={cn(
                "text-[11px]",
                variant === "dark" ? "text-white/35" : "text-slate-400"
              )}
            >
              {locationTypeLabel(loc.type, locale)}
            </span>
          </span>
        </button>
      </li>
    );
  });

  if (isWidget) {
    return (
      <div ref={wrapRef} className={cn("min-w-0", className)}>
        <label ref={labelRef} className="block min-w-0">
          <div className={cn(fieldShell, open && fieldShellActive)}>
            <Icon size={18} className={fieldIcon} />
            <span className="min-w-0 flex-1">
              {label ? <span className={fieldLabel}>{label}</span> : null}
              {input}
            </span>
          </div>
        </label>
        <SearchPopover
          open={showList}
          anchorRef={labelRef}
          onClose={() => setOpen(false)}
          size="field"
          dir={dir}
        >
          <ul className="max-h-64 overflow-y-auto py-1">{list}</ul>
        </SearchPopover>
      </div>
    );
  }

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <Icon
        className={cn(
          "absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none",
          variant === "dark" ? "text-white/30" : "text-slate-400"
        )}
        size={20}
      />
      {input}
      {showList ? (
        <ul
          className={cn(
            "absolute z-30 mt-1 w-full rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto",
            variant === "dark"
              ? "bg-slate-900 border border-white/10"
              : "bg-white border border-slate-200"
          )}
        >
          {list}
        </ul>
      ) : null}
    </div>
  );
}
