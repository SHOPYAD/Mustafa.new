"use client";

import { useEffect, useMemo, useState } from "react";
import { Coins, Loader2, Search, RefreshCw, CheckCircle2, AlertTriangle, ArrowRightLeft } from "lucide-react";
import AdminSwitch from "@/components/admin/AdminSwitch";
import { currencyDisplayName } from "@/lib/currency";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { AdminFxStatus, CurrenciesSettings, SiteCurrency } from "@/types/currency";
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
  EnterpriseFilterBar,
  EnterpriseStatusBadge,
} from "@/components/admin/enterprise";
import { Button } from "@/components/ui/button";

const inputClass =
  "w-full px-3 py-2.5 bg-background/80 border border-border/60 rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm";
const labelClass = "block text-xs font-semibold text-muted-foreground mb-1.5";
const cardClass = "rounded-2xl border border-border/50 bg-card/70 backdrop-blur-xl p-5 sm:p-6 shadow-xs space-y-4";

function copy(locale: string) {
  if (locale === "ar") {
    return {
      title: "العملات وأسعار الصرف اللحظية",
      subtitle: "كتالوج العملات العالمية، أسعار التحويل المباشرة من البنوك المركزية، وضبط العملة الافتراضية للمنصة.",
      liveFx: "محرك الصرف الحي التلقائي (Live FX Engine)",
      liveFxHelp: "تحديث الأسعار لحظياً من Frankfurter و open.er-api.com مع تخزين مؤقت ذكي.",
      defaultCurrency: "العملة الافتراضية للمتجر والحسابات",
      catalog: "كتالوج العملات المتاحة",
      search: "ابحث برمز العملة أو اسمها (عربي / إنجليزي / تركي)...",
      enabled: "مفعّلة",
      enable: "تفعيل العملة",
      disable: "إيقاف",
      all: "كافة العملات",
      onSite: "المفعّلة على الموقع",
      noFx: "بدون صرف حي",
      noLive: "لا يتوفر صرف حي لهذه العملة",
      onHeader: "معروضة في شريط الهيدر للزوار",
      saved: "تم الحفظ بنجاح",
      failed: "تعذر الحفظ",
      fxTitle: "حالة محرك أسعار الصرف الحية",
      fxSource: "مزود الصرف",
      fxAt: "آخر مزامنة",
      fxStale: "يُعرض آخر سعر صالح — تعذّر الاتصال بالمزود حالياً.",
      fxLive: "الأسعار محدّثة ولحظية.",
      fxOff: "الصرف الحي متوقف — التحويل يبقى 1:1 مع الدولار حتى إعادة التفعيل.",
      count: (n: number, on: number) => `${n} عملة في الكتالوج · ${on} مفعّلة على الموقع`,
      empty: "لا نتائج في البحث.",
    };
  }
  return {
    title: "Currencies & Exchange Rates",
    subtitle: "Global currencies, live bank exchange rates, and store default currency.",
    liveFx: "Live FX Engine",
    liveFxHelp: "Real-time rates from Frankfurter and open.er-api.com with cache.",
    defaultCurrency: "Default Platform Currency",
    catalog: "Currency Catalog",
    search: "Search by code or name...",
    enabled: "Enabled",
    enable: "Enable",
    disable: "Disable",
    all: "All",
    onSite: "Active on site",
    noFx: "No live FX",
    noLive: "No live FX for this currency",
    onHeader: "Visible in header switcher",
    saved: "Saved successfully",
    failed: "Save failed",
    fxTitle: "Live FX Engine Status",
    fxSource: "Provider",
    fxAt: "Last sync",
    fxStale: "Showing last known good rate.",
    fxLive: "Rates are fresh and live.",
    fxOff: "Live FX disabled.",
    count: (n: number, on: number) => `${n} in catalog · ${on} active on site`,
    empty: "No results found.",
  };
}

export default function AdminCurrenciesPage() {
  const { locale } = useLocale();
  const c = useMemo(() => copy(locale), [locale]);
  const [settings, setSettings] = useState<CurrenciesSettings | null>(null);
  const [catalogCount, setCatalogCount] = useState(0);
  const [missing, setMissing] = useState<Set<string>>(new Set());
  const [fx, setFx] = useState<AdminFxStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "on" | "nofx">("all");
  const [busyCode, setBusyCode] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const res = await fetch("/api/admin/currencies", { cache: "no-store" });
      const data = (await res.json()) as {
        ok?: boolean;
        settings?: CurrenciesSettings;
        catalogCount?: number;
        missingLiveFxCodes?: string[];
        fx?: AdminFxStatus;
      };
      if (data.ok && data.settings) {
        setSettings(data.settings);
        setCatalogCount(data.catalogCount ?? data.settings.currencies.length);
        setMissing(new Set(data.missingLiveFxCodes ?? []));
        setFx(data.fx ?? null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const persist = async (patch: Partial<CurrenciesSettings>) => {
    if (!settings) return;
    const next: CurrenciesSettings = { ...settings, ...patch };
    setSettings(next);
    setMsg("");
    try {
      const res = await fetch("/api/admin/currencies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!data.ok) {
        setMsg(data.error || c.failed);
        await load();
        return;
      }
      setMsg(c.saved);
      await load();
    } catch {
      setMsg(c.failed);
      await load();
    }
  };

  const toggle = async (cur: SiteCurrency, enabledVal: boolean) => {
    if (!settings) return;
    setBusyCode(cur.code);
    const list = settings.currencies.map((x) =>
      x.code === cur.code ? { ...x, enabled: enabledVal } : x
    );
    await persist({ currencies: list });
    setBusyCode(null);
  };

  const enabled = useMemo(() => {
    if (!settings) return [];
    return settings.currencies.filter((x) => x.enabled);
  }, [settings]);

  const rows = useMemo(() => {
    if (!settings) return [];
    const q = query.trim().toLowerCase();
    return settings.currencies.filter((x) => {
      if (filter === "on" && !x.enabled) return false;
      if (filter === "nofx" && (!x.enabled || !missing.has(x.code))) return false;
      if (!q) return true;
      return (
        x.code.toLowerCase().includes(q) ||
        x.nameAr.toLowerCase().includes(q) ||
        x.nameEn.toLowerCase().includes(q) ||
        x.nameTr.toLowerCase().includes(q) ||
        x.symbol.toLowerCase().includes(q)
      );
    });
  }, [settings, query, filter, missing]);

  if (loading || !settings) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="animate-spin text-primary size-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <EnterprisePageHeader
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "المالية والخزينة", href: "/admin/currencies" },
          { label: "العملات وأسعار الصرف" },
        ]}
        icon={<Coins className="h-6 w-6 text-primary" />}
        title={c.title}
        subtitle={c.subtitle}
        actions={
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-border/60 bg-card/60 hover:bg-muted font-semibold text-xs"
            onClick={() => void load()}
          >
            <RefreshCw size={14} />
            <span>تحديث الأسعار</span>
          </Button>
        }
      />

      {/* KPI Grid */}
      <EnterpriseKpiGrid columns={4}>
        <EnterpriseKpiCard
          title="كتالوج العملات"
          value={catalogCount || settings.currencies.length}
          subValue="عملة عالمية مسجلة"
          icon={<Coins className="size-5" />}
          color="purple"
        />
        <EnterpriseKpiCard
          title="العملات المفعّلة"
          value={enabled.length}
          subValue="متاحة للمسافرين بالموقع"
          icon={<CheckCircle2 className="size-5" />}
          color="emerald"
        />
        <EnterpriseKpiCard
          title="العملة الافتراضية"
          value={settings.defaultCode}
          subValue="المرجع الأساسي للتسعير"
          icon={<ArrowRightLeft className="size-5" />}
          color="amber"
        />
        <EnterpriseKpiCard
          title="محرك الصرف الحي"
          value={settings.liveFxEnabled ? "نشط ولحظي" : "معطل"}
          subValue={fx?.source || "Frankfurter API"}
          icon={<RefreshCw className="size-5" />}
          color={settings.liveFxEnabled ? "emerald" : "rose"}
        />
      </EnterpriseKpiGrid>

      {/* Live FX Status Section */}
      <section className={cardClass}>
        <h2 className="text-sm font-bold text-foreground">{c.fxTitle}</h2>
        <AdminSwitch
          checked={settings.liveFxEnabled}
          onChange={(next) => void persist({ liveFxEnabled: next })}
          label={c.liveFx}
          description={c.liveFxHelp}
        />
        <div className="grid sm:grid-cols-2 gap-3 text-xs pt-2">
          <p className="text-muted-foreground">
            {c.fxSource}: <span className="text-foreground font-semibold font-mono">{fx?.source || "—"}</span>
          </p>
          <p className="text-muted-foreground">
            {c.fxAt}: <span className="text-foreground font-semibold tabular-nums">{fx?.at ? new Date(fx.at).toLocaleString() : "—"}</span>
          </p>
        </div>
        <p className={`text-xs font-semibold ${fx?.stale || fx?.error ? "text-amber-400" : "text-emerald-400"}`}>
          {!settings.liveFxEnabled ? c.fxOff : fx?.stale || fx?.error ? c.fxStale : c.fxLive}
        </p>
      </section>

      {/* Default Currency Selector */}
      <section className={cardClass}>
        <label className={labelClass}>{c.defaultCurrency}</label>
        <select
          className={inputClass}
          value={settings.defaultCode}
          onChange={(e) => void persist({ defaultCode: e.target.value })}
        >
          {enabled.map((row) => (
            <option key={row.code} value={row.code} className="bg-card">
              {row.flag} {row.code} — {currencyDisplayName(row, locale)}
            </option>
          ))}
        </select>
        {enabled.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {enabled.map((row) => (
              <span
                key={row.code}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1 text-xs text-primary border border-primary/20 font-semibold"
              >
                <span>{row.flag}</span>
                <span>{row.code}</span>
                {missing.has(row.code) && (
                  <span className="text-amber-400 text-[10px]">({c.noFx})</span>
                )}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Currency Catalog Filter & List */}
      <section className={cardClass}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-bold text-foreground">{c.catalog}</h2>
          {msg && <span className="text-xs font-bold text-emerald-400">{msg}</span>}
        </div>

        <EnterpriseFilterBar
          searchPlaceholder={c.search}
          searchValue={query}
          onSearchChange={setQuery}
          tabs={[
            { id: "all", label: c.all, count: settings.currencies.length },
            { id: "on", label: c.onSite, count: enabled.length },
            { id: "nofx", label: c.noFx, count: missing.size },
          ]}
          activeTab={filter}
          onTabChange={(id) => setFilter(id as "all" | "on" | "nofx")}
          totalResults={rows.length}
        />

        <div className="space-y-2.5 max-h-[70vh] overflow-y-auto pe-1">
          {rows.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">{c.empty}</p>
          ) : (
            rows.map((row) => {
              const noLive = row.enabled && missing.has(row.code);
              const rate = fx?.rates?.[row.code];
              return (
                <div
                  key={row.code}
                  className={`flex flex-wrap items-center gap-3.5 rounded-xl border p-3.5 transition-all ${
                    row.enabled
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/40 bg-card/40"
                  }`}
                >
                  <span className="text-2xl w-8 text-center shrink-0">{row.flag}</span>
                  <div className="min-w-[4.5rem]">
                    <p className="text-foreground font-bold text-sm">{row.code}</p>
                    <p className="text-muted-foreground text-xs">{row.symbol}</p>
                  </div>
                  <div className="flex-1 min-w-[12rem] space-y-0.5">
                    <p className="text-foreground text-sm font-medium">{currencyDisplayName(row, locale)}</p>
                    <p className="text-muted-foreground text-xs">
                      {row.nameAr} · {row.nameEn} · {row.nameTr}
                    </p>
                    {row.enabled && (
                      <p className="text-[11px] text-amber-400 font-medium">{c.onHeader}</p>
                    )}
                    {noLive && <p className="text-[11px] text-rose-400">{c.noLive}</p>}
                    {row.enabled && rate && rate > 0 && (
                      <p className="text-[11px] text-muted-foreground font-mono">
                        USD/{row.code} = {rate.toFixed(4)}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant={row.enabled ? "outline" : "default"}
                    disabled={busyCode === row.code}
                    onClick={() => void toggle(row, !row.enabled)}
                    className={`shrink-0 rounded-xl text-xs font-bold ${
                      !row.enabled ? "bg-amber-500 hover:bg-amber-600 text-black shadow-md shadow-amber-500/20" : ""
                    }`}
                  >
                    {busyCode === row.code ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : row.enabled ? (
                      c.disable
                    ) : (
                      c.enable
                    )}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
