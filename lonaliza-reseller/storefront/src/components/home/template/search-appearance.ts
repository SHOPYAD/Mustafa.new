import {
  SEARCH_TAB_KEYS,
  type SearchTabKey,
} from "@/data/search-tabs";
import type { SearchWidgetAppearance } from "@/components/search/SearchWidget";
import type { Locale } from "@/lib/i18n/types";
import type { LocalizedCopy } from "@/lib/visual-editor/schema";
import { collectSearchTabLabels } from "@/lib/visual-editor/live-bind";

const SHOW_TAB_SETTING: Record<SearchTabKey, string> = {
  flight: "showTabFlight",
  holiday: "showTabHoliday",
  hotel: "showTabHotel",
  tours: "showTabTours",
  transfers: "showTabTransfers",
  cars: "showTabCars",
  insurance: "showTabInsurance",
  visa: "showTabVisa",
  offers: "showTabOffers",
};

const ICON_TAB_SETTING: Record<SearchTabKey, string> = {
  flight: "iconFlight",
  holiday: "iconHoliday",
  hotel: "iconHotel",
  tours: "iconTours",
  transfers: "iconTransfers",
  cars: "iconCars",
  insurance: "iconInsurance",
  visa: "iconVisa",
  offers: "iconOffers",
};

function settingString(
  settings: Record<string, string | number | boolean>,
  key: string,
  fallback: string
): string {
  const value = settings[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

function settingHidden(
  settings: Record<string, string | number | boolean>,
  key: string
): boolean {
  const value = settings[key];
  if (value === false || value === 0 || value === "false" || value === "0") return true;
  return false;
}

export function parseSearchAppearance(
  settings: Record<string, string | number | boolean>,
  texts?: Record<string, LocalizedCopy>,
  locale: Locale = "ar"
): SearchWidgetAppearance {
  const tabVisibility = {} as Record<SearchTabKey, boolean>;
  const tabIcons = {} as Partial<Record<SearchTabKey, string>>;

  for (const tab of SEARCH_TAB_KEYS) {
    tabVisibility[tab] = !settingHidden(settings, SHOW_TAB_SETTING[tab]);
    const icon = settingString(settings, ICON_TAB_SETTING[tab], "");
    if (icon) tabIcons[tab] = icon;
  }

  const rawTabBarBg = settingString(settings, "tabBarBg", "var(--brand-header)");
  const rawTabActiveBg = settingString(settings, "tabActiveBg", "var(--brand-button)");

  return {
    tabBarBg: rawTabBarBg === "#051741" ? "var(--brand-header)" : rawTabBarBg,
    tabActiveBg: rawTabActiveBg === "#10b981" ? "var(--theme-tab-active-bg)" : rawTabActiveBg,
    tabActiveText: settingString(settings, "tabActiveText", "#ffffff"),
    tabIdleText: (() => {
      const raw = settingString(settings, "tabIdleText", "#1e1b4b");
      return raw.includes("255,255,255") || raw.includes("245, 243, 255") ? "#1e1b4b" : raw;
    })(),
    panelBg: settingString(settings, "panelBg", "#ffffff"),
    tabVisibility,
    tabIcons,
    /* Agent L2: live inspector bind */
    tabLabels: collectSearchTabLabels(texts, locale),
  };
}
