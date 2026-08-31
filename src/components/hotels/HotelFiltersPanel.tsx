"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";
import { localizeHotelLabel } from "@/lib/hotel-i18n";
import { useCurrency } from "@/components/ui/CurrencySelector";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type {
  TravelAdvisorAppliedFilter,
  TravelAdvisorFilterGroup,
} from "@/types/travel-advisor";

type Props = {
  groups: TravelAdvisorFilterGroup[];
  value: TravelAdvisorAppliedFilter[];
  onChange: (next: TravelAdvisorAppliedFilter[]) => void;
  onApplyRemote?: (next: TravelAdvisorAppliedFilter[]) => void;
};

const FEATURED_AMENITY = /wifi|wi-fi|pool|breakfast|beach|parking|spa|إفطار/i;

function groupTitle(
  group: TravelAdvisorFilterGroup,
  t: Record<string, string>
): string {
  const map: Record<string, string> = {
    price: t.priceRange,
    class: t.hotelClass,
    rating: t.travelerRating,
    type: t.propertyType,
    amenity: t.amenities,
    deals: t.deals,
    distFrom: t.distance,
    neighborhood: t.location,
    meals: t.meals,
    bed: t.bedType,
    cancel: t.cancellationPolicy,
    popular: t.popular,
    style: t.style,
    brand: t.brand,
    travelersChoice: t.awards,
  };
  return map[group.id] || group.title || group.id;
}

function optionLabel(
  groupId: string,
  opt: { value: string; label: string },
  locale: "ar" | "en" | "tr"
): string {
  if (groupId === "rating") {
    const n = Number(opt.value);
    if (n >= 10 && n <= 50) return `${n / 10}+`;
  }
  if (groupId === "deals" && /^\d+$/.test(opt.label)) {
    const deals: Record<string, string> = {
      "1": "Special offers",
      "2": "Free cancellation",
      "3": "Pay at stay",
    };
    return localizeHotelLabel(deals[opt.value] || opt.label, locale);
  }
  return localizeHotelLabel(opt.label, locale);
}

function selectedValues(value: TravelAdvisorAppliedFilter[], id: string): string[] {
  return value.find((f) => f.id === id)?.value || [];
}

function upsert(
  current: TravelAdvisorAppliedFilter[],
  id: string,
  nextValues: string[]
): TravelAdvisorAppliedFilter[] {
  const rest = current.filter((f) => f.id !== id);
  if (!nextValues.length) return rest;
  return [...rest, { id, value: nextValues }];
}

export default function HotelFiltersPanel({ groups, value, onChange, onApplyRemote }: Props) {
  const { locale, t } = useLocale();
  const { formatPrice } = useCurrency();
  const [openExtra, setOpenExtra] = useState<Record<string, boolean>>({});

  const ordered = useMemo(() => {
    const order = [
      "price",
      "class",
      "rating",
      "type",
      "neighborhood",
      "meals",
      "bed",
      "cancel",
      "amenity",
      "deals",
      "popular",
      "distFrom",
      "style",
      "travelersChoice",
      "brand",
    ];
    return [...groups].sort((a, b) => {
      const ai = order.indexOf(a.id);
      const bi = order.indexOf(b.id);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
  }, [groups]);

  if (!ordered.length) {
    return (
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">{t.hotels.filters}</h2>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-900">{t.hotels.filters}</h2>
        {value.length ? (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs font-semibold text-emerald-700"
          >
            {t.hotels.clearFilters}
          </button>
        ) : null}
      </div>
      {value.length && onApplyRemote ? (
        <button
          type="button"
          onClick={() => onApplyRemote(value)}
          className="w-full rounded-xl bg-[#051741] px-3 py-2 text-xs font-bold text-white"
        >
          {t.hotels.applyToAllResults}
        </button>
      ) : null}

      {ordered.map((group) => {
        const selected = selectedValues(value, group.id);
        const title = groupTitle(group, t.hotels as unknown as Record<string, string>);

        if (group.kind === "range") {
          const min = group.min ?? 0;
          const max = group.max ?? 360;
          const currentMax = Number(selected[1] || selected[0] || max);
          return (
            <section key={group.id} className="border-t border-slate-100 pt-4">
              <p className="text-sm font-semibold text-slate-800 mb-2">{title}</p>
              <p className="text-xs text-slate-500 mb-2">
                {formatPrice(min, "USD")} – {formatPrice(currentMax, "USD")}
              </p>
              <input
                type="range"
                min={min}
                max={max}
                value={currentMax}
                onChange={(e) =>
                  onChange(upsert(value, group.id, [String(min), e.target.value]))
                }
                className="w-full accent-emerald-600"
              />
            </section>
          );
        }

        if (group.kind === "distance") {
          const loc = selected[0] || "";
          const km = selected[1] || String(group.max ?? 25);
          return (
            <section key={group.id} className="border-t border-slate-100 pt-4">
              <p className="text-sm font-semibold text-slate-800 mb-2">{title}</p>
              <div className="space-y-2">
                {group.options.slice(0, 8).map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name={`dist-${group.id}`}
                      checked={loc === opt.value}
                      onChange={() => onChange(upsert(value, group.id, [opt.value, km]))}
                      className="accent-emerald-600"
                    />
                    <span className="leading-snug">{localizeHotelLabel(opt.label, locale)}</span>
                  </label>
                ))}
                {loc ? (
                  <input
                    type="range"
                    min={group.min ?? 0.5}
                    max={group.max ?? 25}
                    step={0.5}
                    value={Number(km)}
                    onChange={(e) =>
                      onChange(upsert(value, group.id, [loc, e.target.value]))
                    }
                    className="w-full accent-emerald-600"
                  />
                ) : null}
              </div>
            </section>
          );
        }

        const featured =
          group.id === "amenity"
            ? group.options.filter((o) => FEATURED_AMENITY.test(o.label))
            : [];
        const rest =
          group.id === "amenity"
            ? group.options.filter((o) => !FEATURED_AMENITY.test(o.label))
            : group.options;
        const limit = group.id === "class" || group.id === "rating" ? 8 : 8;
        const extraOpen = Boolean(openExtra[group.id]);
        const visible = extraOpen ? rest : rest.slice(0, limit);

        return (
          <section key={group.id} className="border-t border-slate-100 pt-4">
            <p className="text-sm font-semibold text-slate-800 mb-2">{title}</p>
            {group.id === "class" ? (
              <div className="flex flex-wrap gap-2">
                {group.options.map((opt) => {
                  const active = selected.includes(opt.value);
                  const label = optionLabel(group.id, opt, locale);
                  const stars = Number((label.match(/(\d)/) || [])[1] || 0);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        const next = active
                          ? selected.filter((v) => v !== opt.value)
                          : [...selected, opt.value];
                        onChange(upsert(value, group.id, next));
                      }}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold border ${
                        active
                          ? "bg-[var(--navy)] text-white border-[var(--navy)]"
                          : "bg-white text-slate-600 border-slate-200"
                      }`}
                    >
                      {stars
                        ? Array.from({ length: stars }).map((_, i) => (
                            <Star key={i} size={11} className="fill-current" />
                          ))
                        : optionLabel(group.id, opt, locale)}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1.5">
                {[...featured, ...visible].map((opt) => {
                  const active = selected.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      className="flex items-start gap-2 text-sm text-slate-700"
                    >
                      <input
                        type={group.id === "rating" ? "radio" : "checkbox"}
                        name={group.id === "rating" ? "ta-rating" : undefined}
                        checked={active}
                        onChange={() => {
                          const next =
                            group.id === "rating"
                              ? [opt.value]
                              : active
                                ? selected.filter((v) => v !== opt.value)
                                : [...selected, opt.value];
                          onChange(upsert(value, group.id, next));
                        }}
                        className="mt-0.5 rounded border-slate-300 text-emerald-600 accent-emerald-600"
                      />
                      <span className="leading-snug">{optionLabel(group.id, opt, locale)}</span>
                    </label>
                  );
                })}
                {rest.length > limit ? (
                  <button
                    type="button"
                    onClick={() =>
                      setOpenExtra((s) => ({ ...s, [group.id]: !s[group.id] }))
                    }
                    className="text-xs font-semibold text-emerald-700 pt-1"
                  >
                    {extraOpen ? t.common.cancel : t.hotels.showMore}
                  </button>
                ) : null}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
