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
  Globe,
  Sliders,
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
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
} from "@/components/admin/enterprise";

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

  const websiteCount = tabs ? Object.values(tabs).filter(Boolean).length : 0;
  const appCount = appTabs ? Object.values(appTabs).filter(Boolean).length : 0;

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-6">
      <EnterprisePageHeader
        icon={Search}
        title={t.admin.searchTabs}
        description={`${t.admin.searchTabsSubtitle} — ${channelHint}`}
        badge="Search Engine Tabs"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetWebsite}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 bg-secondary/80 hover:bg-secondary text-foreground text-xs font-semibold shadow-sm transition-all"
            >
              <RotateCcw size={14} />
              <span>{t.admin.resetDefaultsShort}</span>
            </button>
            <button
              type="button"
              onClick={handleResetApp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border/60 bg-secondary/80 hover:bg-secondary text-foreground text-xs font-semibold shadow-sm transition-all"
            >
              <Smartphone size={14} />
              <span>{resetAppLabel}</span>
            </button>
          </div>
        }
      />

      <EnterpriseKpiGrid columns={3}>
        <EnterpriseKpiCard
          label="إجمالي التبويبات"
          value={order.length}
          helperText="خدمات محرك البحث الأساسي"
          icon={Sliders}
          color="violet"
        />
        <EnterpriseKpiCard
          label="النشطة على الموقع"
          value={websiteCount}
          helperText="ظاهرة على الواجهة الرئيسية"
          icon={Globe}
          color="amber"
        />
        <EnterpriseKpiCard
          label="النشطة على التطبيق"
          value={appCount}
          helperText="ظاهرة على تطبيق الموبايل"
          icon={Smartphone}
          color="emerald"
        />
      </EnterpriseKpiGrid>

      <div className="grid grid-cols-1 gap-3.5 min-w-0 sm:grid-cols-2">
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
                "flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border bg-card/70 backdrop-blur-xl text-start transition-all shadow-md shadow-black/10",
                dragKey === key
                  ? "border-violet-500 bg-violet-500/20 opacity-70"
                  : dropKey === key
                    ? "border-violet-400 bg-violet-500/10"
                    : "border-border/60 hover:border-violet-500/30"
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
                className="search-tab-drag-handle shrink-0 flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground cursor-grab active:cursor-grabbing touch-none transition-colors"
              >
                <GripVertical size={18} />
              </span>

              <span className="flex-1 min-w-0 text-foreground font-bold text-sm">
                {tabLabels[key]}
              </span>

              <div className="flex shrink-0 flex-col gap-0.5">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveItem(key, "up")}
                  aria-label={t.admin.searchTabsMoveUp}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={index === order.length - 1}
                  onClick={() => moveItem(key, "down")}
                  aria-label={t.admin.searchTabsMoveDown}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => toggleWebsite(key)}
                aria-pressed={websiteOn}
                className={cn(
                  "shrink-0 flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                  websiteOn ? "bg-amber-500/15 text-amber-400" : "bg-secondary/60 text-muted-foreground/50"
                )}
                aria-label={`${websiteLabel}: ${tabLabels[key]}`}
                title={websiteLabel}
              >
                {websiteOn ? (
                  <Eye size={18} />
                ) : (
                  <EyeOff size={18} />
                )}
              </button>

              <button
                type="button"
                onClick={() => toggleApp(key)}
                aria-pressed={appOn}
                className={cn(
                  "shrink-0 flex h-9 w-9 items-center justify-center rounded-xl transition-all",
                  appOn ? "bg-violet-500/15 text-violet-400" : "bg-secondary/60 text-muted-foreground/50"
                )}
                aria-label={`${appLabel}: ${tabLabels[key]}`}
                title={appLabel}
              >
                <Smartphone size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
