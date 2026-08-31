"use client";

import { useEffect, useState } from "react";
import {
  Search,
  RotateCcw,
  Eye,
  EyeOff,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  getSearchTabVisibility,
  saveSearchTabVisibility,
  resetSearchTabVisibility,
  getSearchTabOrder,
  saveSearchTabOrder,
  moveSearchTabOrderItem,
  reorderSearchTabs,
  SEARCH_TAB_KEYS,
  type SearchTabKey,
  type SearchTabVisibility,
} from "@/data/search-tabs";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

export default function AdminSearchTabsPage() {
  const { t } = useLocale();
  const [tabs, setTabs] = useState<SearchTabVisibility | null>(null);
  const [order, setOrder] = useState<SearchTabKey[]>([]);
  const [dragKey, setDragKey] = useState<SearchTabKey | null>(null);
  const [dropKey, setDropKey] = useState<SearchTabKey | null>(null);

  const tabLabels: Record<SearchTabKey, string> = {
    flight: t.search.flights,
    holiday: t.search.holidays,
    hotel: t.search.hotels,
    tours: t.search.tours,
    transfers: t.search.transfers,
    cars: t.search.cars,
    insurance: t.search.insurance,
    visa: t.search.visa,
    offers: t.search.offers,
  };

  useEffect(() => {
    let cancelled = false;
    const localVis = getSearchTabVisibility();
    const localOrder = getSearchTabOrder();
    setTabs(localVis);
    setOrder(localOrder);

    void fetch("/api/admin/search-tabs", {
      cache: "no-store",
      credentials: "same-origin",
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (cancelled || !data?.ok) return;
        const localHasHides = SEARCH_TAB_KEYS.some((key) => localVis[key] === false);
        if (!data.updatedAt && localHasHides) {
          await fetch("/api/admin/search-tabs", {
            method: "PUT",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ visibility: localVis, order: localOrder }),
          });
          return;
        }
        if (data.visibility) {
          const next = saveSearchTabVisibility(data.visibility);
          setTabs(next);
        }
        if (Array.isArray(data.order) && data.order.length) {
          setOrder(saveSearchTabOrder(data.order));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const persistServer = (
    visibility: SearchTabVisibility,
    nextOrder: SearchTabKey[]
  ) => {
    void fetch("/api/admin/search-tabs", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visibility, order: nextOrder }),
    }).catch(() => {});
  };

  const toggle = (key: SearchTabKey) => {
    if (!tabs) return;
    const next = saveSearchTabVisibility({ ...tabs, [key]: !tabs[key] });
    setTabs(next);
    persistServer(next, order);
  };

  const moveItem = (key: SearchTabKey, direction: "up" | "down") => {
    const next = moveSearchTabOrderItem(key, direction);
    setOrder(next);
    if (tabs) persistServer(tabs, next);
  };

  const handleReset = () => {
    const next = resetSearchTabVisibility();
    const nextOrder = getSearchTabOrder();
    setTabs(next);
    setOrder(nextOrder);
    void fetch("/api/admin/search-tabs", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reset: true }),
    }).catch(() => {});
  };

  const onDrop = (targetKey: SearchTabKey) => {
    if (!dragKey || dragKey === targetKey) {
      setDragKey(null);
      setDropKey(null);
      return;
    }
    const next = reorderSearchTabs(dragKey, targetKey);
    setOrder(next);
    if (tabs) persistServer(tabs, next);
    setDragKey(null);
    setDropKey(null);
  };

  return (
    <div className="admin-page w-full max-w-none min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Search className="text-emerald-400" size={28} />
            {t.admin.searchTabs}
          </h1>
          <p className="text-white/50 mt-1">{t.admin.searchTabsSubtitle}</p>
          <p className="text-xs text-white/30 mt-1">{t.admin.searchTabsOrderHint}</p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08] text-sm font-medium"
        >
          <RotateCcw size={14} />
          {t.admin.resetDefaultsShort}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 min-w-0 sm:grid-cols-2">
        {order.map((key, index) => {
          const on = Boolean(tabs?.[key]);
          return (
            <div
              key={key}
              onDragOver={(e) => {
                e.preventDefault();
                if (dropKey !== key) setDropKey(key);
              }}
              onDragLeave={() => {
                if (dropKey === key) setDropKey(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                onDrop(key);
              }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl border bg-white/[0.03] text-start transition-colors",
                dragKey === key
                  ? "border-emerald-400/40 bg-emerald-400/10 opacity-70"
                  : dropKey === key
                    ? "border-emerald-400/50 bg-emerald-400/5"
                    : "border-white/10"
              )}
            >
              <span
                role="button"
                tabIndex={0}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", key);
                  e.dataTransfer.effectAllowed = "move";
                  setDragKey(key);
                }}
                onDragEnd={() => {
                  setDragKey(null);
                  setDropKey(null);
                }}
                aria-label={t.admin.searchTabsDragHandle}
                className="search-tab-drag-handle shrink-0 flex h-9 w-9 items-center justify-center rounded-lg text-white/35 hover:bg-white/10 hover:text-white/70 cursor-grab active:cursor-grabbing touch-none"
              >
                <GripVertical size={18} />
              </span>

              <span className="flex-1 min-w-0 text-white font-medium">
                {tabLabels[key]}
              </span>

              <div className="flex shrink-0 flex-col gap-0.5">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveItem(key, "up")}
                  aria-label={t.admin.searchTabsMoveUp}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={index === order.length - 1}
                  onClick={() => moveItem(key, "down")}
                  aria-label={t.admin.searchTabsMoveDown}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => toggle(key)}
                aria-pressed={on}
                className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/10"
                aria-label={tabLabels[key]}
              >
                {on ? (
                  <Eye size={18} className="text-emerald-400" />
                ) : (
                  <EyeOff size={18} className="text-white/30" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
