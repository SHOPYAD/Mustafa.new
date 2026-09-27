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
    <div className="admin-page w-full max-w-none min-w-0 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className='text-3xl font-bold text-foreground flex items-center gap-3'>
            <Search className='text-primary' size={28} />
            {t.admin.searchTabs}
          </h1>
          <p className='text-muted-foreground mt-1'>{t.admin.searchTabsSubtitle}</p>
          <p className='text-xs text-muted-foreground mt-1'>{channelHint}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleResetWebsite}
            className='inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted text-sm font-medium transition-colors cursor-pointer'
          >
            <RotateCcw size={14} />
            {t.admin.resetDefaultsShort}
          </button>
          <button
            type="button"
            onClick={handleResetApp}
            className='inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted text-sm font-medium transition-colors cursor-pointer'
          >
            <Smartphone size={14} />
            {resetAppLabel}
          </button>
        </div>
      </div>

      {/* Search Tabs Telemetry Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">قنوات البحث</span>
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">قناة مزدوجة</span>
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight text-foreground">الموقع والتطبيق</p>
          <p className="text-[11px] text-muted-foreground">تحكم منفصل لكل منصة</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">تبويبات الموقع</span>
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">نشط</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">
            {tabs ? Object.values(tabs).filter(Boolean).length : 9} / 9
          </p>
          <p className="text-[11px] text-muted-foreground">خدمات مفعلة في محرك الويب</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">تبويبات التطبيق</span>
            <span className="rounded-md bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">تطبيق الجوال</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">
            {appTabs ? Object.values(appTabs).filter(Boolean).length : 9} / 9
          </p>
          <p className="text-[11px] text-muted-foreground">خدمات مفعلة في تطبيق الهاتف</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">ترتيب الخدمات</span>
            <span className="rounded-md bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400">سحب وإفلات</span>
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight text-foreground">ترتيب مخصص</p>
          <p className="text-[11px] text-muted-foreground">اسحب لإعادة ترتيب الظهور</p>
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
                'flex items-center gap-3 px-4 py-3 rounded-xl border bg-card shadow-xs text-start transition-colors',
                dragKey === key
                  ? 'border-primary/40 bg-primary/10 opacity-70'
                  : dropKey === key
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-border'
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
                className='search-tab-drag-handle shrink-0 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-grab active:cursor-grabbing touch-none transition-colors'
              >
                <GripVertical size={18} />
              </span>

              <span className='flex-1 min-w-0 text-foreground font-semibold text-sm'>
                {tabLabels[key]}
              </span>

              <div className="flex shrink-0 flex-col gap-0.5">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => moveItem(key, "up")}
                  aria-label={t.admin.searchTabsMoveUp}
                  className='flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer'
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={index === order.length - 1}
                  onClick={() => moveItem(key, "down")}
                  aria-label={t.admin.searchTabsMoveDown}
                  className='flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer'
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => toggleWebsite(key)}
                aria-pressed={websiteOn}
                className='shrink-0 flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer'
                aria-label={`${websiteLabel}: ${tabLabels[key]}`}
                title={websiteLabel}
              >
                {websiteOn ? (
                  <Eye size={18} className='text-emerald-600 dark:text-emerald-400' />
                ) : (
                  <EyeOff size={18} className='text-muted-foreground' />
                )}
              </button>

              <button
                type="button"
                onClick={() => toggleApp(key)}
                aria-pressed={appOn}
                className='shrink-0 flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors cursor-pointer'
                aria-label={`${appLabel}: ${tabLabels[key]}`}
                title={appLabel}
              >
                <Smartphone
                  size={18}
                  className={appOn ? "text-primary" : "text-muted-foreground"}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
