"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Menu, RotateCcw } from "lucide-react";
import {
  getNavOrder,
  getNavVisibility,
  moveNavOrderItem,
  NAV_PLACEMENTS,
  resetNavVisibility,
  saveNavVisibility,
  type NavPlacement,
  type NavServiceKey,
  type NavVisibility,
} from "@/data/nav-visibility";
import { useLocale } from "@/lib/i18n/LocaleProvider";

function placementLabel(
  placement: NavPlacement,
  labels: {
    placeHeaderFooter: string;
    placeHeader: string;
    placeFooter: string;
    placeHidden: string;
  }
): string {
  switch (placement) {
    case "header-footer":
      return labels.placeHeaderFooter;
    case "header":
      return labels.placeHeader;
    case "footer":
      return labels.placeFooter;
    case "hidden":
      return labels.placeHidden;
    default: {
      const _never: never = placement;
      return _never;
    }
  }
}

export default function NavVisibilityPanel({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { t } = useLocale();
  const [navVis, setNavVis] = useState<NavVisibility | null>(null);
  const [navOrder, setNavOrder] = useState<NavServiceKey[]>([]);

  useEffect(() => {
    setNavVis(getNavVisibility());
    setNavOrder(getNavOrder());
  }, []);

  const navLabel = (key: NavServiceKey): string => {
    const map: Record<NavServiceKey, string> = {
      home: t.nav.home,
      holidays: t.nav.holidays,
      flights: t.nav.flights,
      hotels: t.nav.hotels,
      vipDailyTours: t.nav.vipDailyTours,
      transfers: t.nav.transfers,
      cars: t.nav.cars,
      visa: t.nav.visa,
      uaeTours: t.nav.uaeTours,
      blog: t.nav.blog,
      aiChat: t.nav.aiChat,
      contact: t.nav.contact,
    };
    return map[key];
  };

  const setPlacement = (key: NavServiceKey, placement: NavPlacement) => {
    if (!navVis) return;
    setNavVis(saveNavVisibility({ ...navVis, [key]: placement }));
  };

  const moveItem = (key: NavServiceKey, direction: "up" | "down") => {
    setNavOrder(moveNavOrderItem(key, direction));
  };

  const handleReset = () => {
    setNavVis(resetNavVisibility());
    setNavOrder(getNavOrder());
  };

  if (!navVis) return null;

  return (
    <div id="menu" className={compact ? "" : "mb-12"}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            className={`font-bold text-white flex items-center gap-3 ${
              compact ? "text-xl" : "text-3xl"
            }`}
          >
            <Menu className="text-teal-400" size={compact ? 22 : 28} />
            {t.menuVisibility.title}
          </h2>
          <p className="mt-1 text-white/50">{t.menuVisibility.subtitle}</p>
          <p className="mt-1 text-xs text-white/30">{t.menuVisibility.saveHint}</p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-white/60 transition-all hover:bg-white/10 hover:text-white"
        >
          <RotateCcw size={14} />
          {t.menuVisibility.resetDefaults}
        </button>
      </div>

      <p className="mb-3 text-sm font-medium text-white/70">
        {t.menuVisibility.orderTitle}
      </p>
      <p className="mb-4 text-xs text-white/40">{t.menuVisibility.orderHint}</p>

      <div className="flex flex-col gap-2 rounded-2xl border border-white/5 bg-slate-900/80 p-3 sm:p-4">
        {navOrder.map((key, index) => {
          const value = navVis[key];
          return (
            <div
              key={key}
              className="flex flex-col gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex items-center gap-3 sm:min-w-0 sm:flex-1">
                <div className="flex shrink-0 flex-col gap-0.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveItem(key, "up")}
                    aria-label={t.menuVisibility.moveUp}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={index === navOrder.length - 1}
                    onClick={() => moveItem(key, "down")}
                    aria-label={t.menuVisibility.moveDown}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
                <span className="text-sm font-medium text-white sm:text-base">
                  {navLabel(key)}
                </span>
              </div>
              <select
                value={value}
                onChange={(e) =>
                  setPlacement(key, e.target.value as NavPlacement)
                }
                className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 sm:w-52"
              >
                {NAV_PLACEMENTS.map((placement) => (
                  <option key={placement} value={placement}>
                    {placementLabel(placement, t.menuVisibility)}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
