"use client";

import { useEffect, useState } from "react";
import {
  defaultNavVisibility,
  getNavVisibility,
  NAV_VISIBILITY_STORAGE_KEY,
  NAV_VISIBILITY_UPDATED_EVENT,
  type NavVisibility,
} from "@/data/nav-visibility";

export function useNavVisibility(): NavVisibility {
  const [visibility, setVisibility] = useState<NavVisibility>(defaultNavVisibility);

  useEffect(() => {
    setVisibility(getNavVisibility());
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<NavVisibility>).detail;
      setVisibility(detail || getNavVisibility());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === NAV_VISIBILITY_STORAGE_KEY) setVisibility(getNavVisibility());
    };
    window.addEventListener(NAV_VISIBILITY_UPDATED_EVENT, onUpdate);
    window.addEventListener("storage", onStorage);

    void fetch("/api/search-tabs", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.ok || !data.navVisibility) return;
        setVisibility({ ...defaultNavVisibility, ...data.navVisibility });
      })
      .catch(() => {});

    return () => {
      window.removeEventListener(NAV_VISIBILITY_UPDATED_EVENT, onUpdate);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return visibility;
}
