"use client";

import { useEffect, useState } from "react";
import {
  defaultNavOrder,
  getNavOrder,
  NAV_ORDER_STORAGE_KEY,
  NAV_ORDER_UPDATED_EVENT,
  type NavServiceKey,
} from "@/data/nav-visibility";

export function useNavOrder(): NavServiceKey[] {
  const [order, setOrder] = useState<NavServiceKey[]>(defaultNavOrder);

  useEffect(() => {
    setOrder(getNavOrder());
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent<NavServiceKey[]>).detail;
      setOrder(detail?.length ? detail : getNavOrder());
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === NAV_ORDER_STORAGE_KEY) setOrder(getNavOrder());
    };
    window.addEventListener(NAV_ORDER_UPDATED_EVENT, onUpdate);
    window.addEventListener("storage", onStorage);

    void fetch("/api/search-tabs", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.ok || !Array.isArray(data.navOrder) || !data.navOrder.length) return;
        setOrder(data.navOrder);
      })
      .catch(() => {});

    return () => {
      window.removeEventListener(NAV_ORDER_UPDATED_EVENT, onUpdate);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return order;
}
