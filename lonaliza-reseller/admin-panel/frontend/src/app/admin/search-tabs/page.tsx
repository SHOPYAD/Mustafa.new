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
  Smartphone,
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
  defaultSearchTabVisibility,
  type SearchTabKey,
  type SearchTabVisibility,
} from "@/data/search-tabs";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

export default function AdminSearchTabsPage() {
  const { t, locale } = useLocale();
  const websiteLabel = locale === "ar" ? "الموقع" : "Website";
  const appLabel = locale === "ar" ? "التطبيق" : "App";
  const resetAppLabel = locale === "ar" ? "إعادة تبويبات التطبيق" : "Reset app tabs";
  const channelHint =
    locale === "ar"
      ? "يمكن تفعيل الخدمة للموقع وللتطبيق بشكل مستقل."
      : "Website and app can be enabled independently.";
  const [tabs, setTabs] = useState<SearchTabVisibility | null>(null);
  const [appTabs, setAppTabs] = useState<SearchTabVisibility | null>(null);
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
    setAppTabs(localVis);
    setOrder(localOrder);

    void fetch("/api/admin/search-tabs", {
      cache: "no-store",
      credentials: "same-origin",
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (cancelled || !data?.ok) return;
        const website = data.websiteEnabled ?? data.visibility;
        const localHasHides = SEARCH_TAB_KEYS.some((key) => localVis[key] === false);
        if (!data.updatedAt && localHasHides) {
          await fetch("/api/admin/search-tabs", {
            method: "PUT",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              visibility: localVis,
              websiteEnabled: localVis,
              appEnabled: data.appEnabled ?? localVis,
              order: localOrder,
            }),
          });
          return;
        }
        if (website) {
          const next = saveSearchTabVisibility(website);
          setTabs(next);
        }
        if (data.appEnabled) {
          setAppTabs({ ...defaultSearchTabVisibility, ...data.appEnabled });
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
    appEnabled: SearchTabVisibility,
    nextOrder: SearchTabKey[]
  ) => {
    void fetch("/api/admin/search-tabs", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visibility,
        websiteEnabled: visibility,
        appEnabled,
        order: nextOrder,
      }),
    }).catch(() => {});
  };

  const toggleWebsite = (key: SearchTabKey) => {
    if (!tabs || !appTabs) return;
    const next = saveSearchTabVisibility({ ...tabs, [key]: !tabs[key] });
    setTabs(next);
    persistServer(next, appTabs, order);
  };

  const toggleApp = (key: SearchTabKey) => {
    if (!tabs || !appTabs) return;
    const next = { ...appTabs, [key]: !appTabs[key] };
    setAppTabs(next);
    persistServer(tabs, next, order);
  };

  const moveItem = (key: SearchTabKey, direction: "up" | "down") => {
    const next = moveSearchTabOrderItem(key, direction);
    setOrder(next);
    if (tabs && appTabs) persistServer(tabs, appTabs, next);
  };

  const handleResetWebsite = () => {
    const next = resetSearchTabVisibility();
    const nextOrder = getSearchTabOrder();
    setTabs(next);
    setOrder(nextOrder);
    void fetch("/api/admin/search-tabs", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reset: true, appEnabled: appTabs ?? next }),
    }).catch(() => {});
  };

  const handleResetApp = () => {
    const seeded = tabs ?? defaultSearchTabVisibility;
    setAppTabs(seeded);
    void fetch("/api/admin/search-tabs", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetApp: true }),
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
    if (tabs && appTabs) persistServer(tabs, appTabs, next);
    setDragKey(null);
    setDropKey(null);
  };

  return (
    <div className="admin-page w-full max-w-none min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Search className="text-amber-400" size={28} />
            {t.admin.searchTabs}
          </h1>
          <p className="text-muted-foreground mt-1">{t.admin.searchTabsSubtitle}</p>
          <p className="text-xs text-muted-foreground mt-1">{channelHint}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleResetWebsite}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-admin-border-subtle bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] text-sm font-medium"
          >
            <RotateCcw size={14} />
            {t.admin.resetDefaultsShort}
          </button>
          <button
            type="button"
            onClick={handleResetApp}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-admin-border-subtle bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] text-sm font-medium"
          >
            <Smartphone size={14} />
            {resetAppLabel}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 min-w-0 sm:grid-cols-2">
        {order.map((key, index) => {
          const websiteOn = Boolean(tabs?.[key]);
          const appOn = Boolean(appTabs?.[key]);
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
                  ? "border-purple-400/40 bg-purple-500/15 opacity-70"
                  : dropKey === key
                    ? "border-purple-400/50 bg-purple-500/10"
                    : "border-admin-border-subtle"
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
                className="search-tab-drag-handle shrink-0 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
              >
                <GripVertical size={18} />
              </span>

              <span className="flex-1 min-w-0 text-foreground font-medium">
                {tabLabels[key]}
              </span>

              <div className="flex shrink-0 flex-col gap-0.5">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveItem(key, "up")}
                  aria-label={t.admin.searchTabsMoveUp}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-admin-border-subtle text-muted-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={index === order.length - 1}
                  onClick={() => moveItem(key, "down")}
                  aria-label={t.admin.searchTabsMoveDown}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-admin-border-subtle text-muted-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => toggleWebsite(key)}
                aria-pressed={websiteOn}
                className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted"
                aria-label={`${websiteLabel}: ${tabLabels[key]}`}
                title={websiteLabel}
              >
                {websiteOn ? (
                  <Eye size={18} className="text-amber-400" />
                ) : (
                  <EyeOff size={18} className="text-muted-foreground" />
                )}
              </button>

              <button
                type="button"
                onClick={() => toggleApp(key)}
                aria-pressed={appOn}
                className="shrink-0 flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted"
                aria-label={`${appLabel}: ${tabLabels[key]}`}
                title={appLabel}
              >
                <Smartphone
                  size={18}
                  className={appOn ? "text-violet-300" : "text-muted-foreground"}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
