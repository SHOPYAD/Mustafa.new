"use client";

import { useEffect, useState, type ElementType } from "react";
import {
  ArrowRightLeft,
  Car,
  FileText,
  Hotel,
  MapPin,
  Palmtree,
  Plane,
  Shield,
  Tag,
} from "lucide-react";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import type { SearchTabKey } from "@/data/search-tabs";
import {
  DEFAULT_UI_ICONS,
  UI_ICONS_UPDATED_EVENT,
  getIconRef,
  normalizeUiIcons,
  resolveCustomSvg,
  searchEngineTabToIconKey,
  type UiIconsFile,
} from "@/lib/ui-icons-store";

/**
 * Agent B store keys (do not rename):
 *   searchTab.flights | searchTab.hotels | searchTab.tours
 *   searchTab.transfers | searchTab.cars
 * Widget ids `flight` / `hotel` map through `searchEngineTabToIconKey`.
 */
export const SEARCH_TAB_STORE_KEY = {
  flights: "searchTab.flights",
  hotels: "searchTab.hotels",
  tours: "searchTab.tours",
  transfers: "searchTab.transfers",
  cars: "searchTab.cars",
} as const;

const LUCIDE_BY_TAB: Record<SearchTabKey, ElementType> = {
  flight: Plane,
  hotel: Hotel,
  tours: Palmtree,
  transfers: ArrowRightLeft,
  cars: Car,
  holiday: MapPin,
  insurance: Shield,
  visa: FileText,
  offers: Tag,
};

export function lucideSearchTabIcon(tab: SearchTabKey): ElementType {
  return LUCIDE_BY_TAB[tab];
}

let storePromise: Promise<UiIconsFile> | null = null;

function readStoreFromEvent(detail: unknown): UiIconsFile | null {
  if (!detail) return null;
  if (typeof detail === "object" && "searchTab" in (detail as object)) {
    return normalizeUiIcons(detail);
  }
  const wrapped = detail as { icons?: unknown };
  if (wrapped.icons) return normalizeUiIcons(wrapped.icons);
  return null;
}

function loadUiIconsFile(): Promise<UiIconsFile> {
  if (!storePromise) {
    storePromise = fetch("/api/public-ui-icons", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { icons?: unknown } | null) =>
        data?.icons ? normalizeUiIcons(data.icons) : DEFAULT_UI_ICONS
      )
      .catch(() => DEFAULT_UI_ICONS);
  }
  return storePromise;
}

export function useUiIconsFile(): UiIconsFile {
  const [store, setStore] = useState<UiIconsFile>(DEFAULT_UI_ICONS);

  useEffect(() => {
    let cancelled = false;
    void loadUiIconsFile().then((next) => {
      if (!cancelled) setStore(next);
    });
    const onUpdate = (event: Event) => {
      const custom = event as CustomEvent;
      const fromEvent = readStoreFromEvent(custom.detail);
      if (fromEvent) {
        storePromise = Promise.resolve(fromEvent);
        setStore(fromEvent);
        return;
      }
      storePromise = null;
      void loadUiIconsFile().then((next) => {
        if (!cancelled) setStore(next);
      });
    };
    window.addEventListener(UI_ICONS_UPDATED_EVENT, onUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener(UI_ICONS_UPDATED_EVENT, onUpdate);
    };
  }, []);

  return store;
}

function LucideFallback({ tab, size }: { tab: SearchTabKey; size: number }) {
  const Icon = lucideSearchTabIcon(tab);
  return <Icon size={size} />;
}

export function SearchTabGlyph({
  tab,
  size = 16,
  store,
}: {
  tab: SearchTabKey;
  size?: number;
  store: UiIconsFile;
}) {
  const key = searchEngineTabToIconKey(tab);
  if (!key) return <LucideFallback tab={tab} size={size} />;

  const ref = getIconRef(store, key);
  if (ref.source === "svg") {
    const svg = resolveCustomSvg(store, ref);
    if (svg) {
      return (
        <span
          className="inline-flex shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full"
          style={{ width: size, height: size }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      );
    }
  }

  const name = ref.name as IconName;
  return (
    <DynamicIcon
      name={name}
      size={size}
      fallback={() => <LucideFallback tab={tab} size={size} />}
    />
  );
}
