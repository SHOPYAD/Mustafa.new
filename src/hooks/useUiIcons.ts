"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_UI_ICONS,
  UI_ICONS_UPDATED_EVENT,
  getIconRef,
  type UiIconRef,
  type UiIconsFile,
} from "@/lib/ui-icons-store";

export function useUiIcons(): {
  store: UiIconsFile;
  loaded: boolean;
  getIcon: (key: string) => UiIconRef;
} {
  const [store, setStore] = useState<UiIconsFile>(DEFAULT_UI_ICONS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const apply = (next: UiIconsFile) => {
      if (!cancelled) {
        setStore(next);
        setLoaded(true);
      }
    };

    const load = async () => {
      try {
        const res = await fetch("/api/public-ui-icons", { cache: "no-store" });
        const data = (await res.json()) as { ok?: boolean; icons?: UiIconsFile };
        if (data?.ok && data.icons) apply(data.icons);
        else if (!cancelled) setLoaded(true);
      } catch {
        if (!cancelled) setLoaded(true);
      }
    };

    void load();

    const onUpdate = (event: Event) => {
      const detail = (event as CustomEvent<UiIconsFile>).detail;
      if (detail) apply(detail);
      else void load();
    };

    window.addEventListener(UI_ICONS_UPDATED_EVENT, onUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener(UI_ICONS_UPDATED_EVENT, onUpdate);
    };
  }, []);

  const getIcon = useCallback((key: string) => getIconRef(store, key), [store]);

  return { store, loaded, getIcon };
}
