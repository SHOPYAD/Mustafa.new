"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2, X } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type CityHit = {
  id: string;
  city: string;
  country: string;
  countryCode: string;
  admin1?: string;
};

interface Props {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  autoFocus?: boolean;
}

export default function CityAutocompleteInput({
  value,
  onChange,
  placeholder,
  className = "",
  id,
  autoFocus = false,
}: Props) {
  const { locale } = useLocale();
  const isAr = locale === "ar";

  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<CityHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep query in sync with external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (text: string) => {
    setQuery(text);
    onChange(text);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const trimmed = text.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const lang = locale === "tr" ? "tr" : locale === "en" ? "en" : "ar";
        const res = await fetch(`/api/geo/search?q=${encodeURIComponent(trimmed)}&lang=${lang}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (data?.ok && Array.isArray(data.places)) {
          setSuggestions(data.places.slice(0, 7));
          setOpen(true);
        } else {
          setSuggestions([]);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 180);
  };

  const handleSelect = (item: CityHit) => {
    setQuery(item.city);
    onChange(item.city);
    setOpen(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setQuery("");
    onChange("");
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <MapPin size={16} className="absolute start-3 text-slate-400 pointer-events-none" />
        <input
          id={id}
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          placeholder={placeholder || (isAr ? "اكتب اسم المدينة..." : "Type city name...")}
          className={`min-h-11 w-full rounded-2xl border border-slate-200 bg-white ps-9 pe-9 text-sm text-slate-900 outline-none transition-all focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100 ${className}`}
        />
        {loading ? (
          <Loader2 size={16} className="absolute end-3 animate-spin text-purple-600 pointer-events-none" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute end-3 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="مسح"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl">
          {suggestions.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleSelect(item)}
                className="flex w-full items-center justify-between px-3.5 py-2.5 text-start text-xs transition-colors hover:bg-purple-50"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100 text-[10px] font-black text-[#7C3AED]">
                    {item.countryCode}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900">{item.city}</span>
                    {item.admin1 && (
                      <span className="ms-1 text-[11px] text-slate-400">({item.admin1})</span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">{item.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
