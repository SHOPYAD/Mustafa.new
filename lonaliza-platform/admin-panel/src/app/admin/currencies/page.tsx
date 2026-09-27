"use client";

import { useEffect, useMemo, useState } from "react";
import { Coins, Loader2, Search } from "lucide-react";
import AdminSwitch from "@/components/admin/AdminSwitch";
import { currencyDisplayName } from "@/lib/currency";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import type { AdminFxStatus, CurrenciesSettings, SiteCurrency } from "@/types/currency";

const inputClass =
  "w-full px-3 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 text-sm";
const labelClass = "block text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider";
const cardClass = "rounded-2xl border border-border bg-card shadow-xs p-5";

function copy(locale: string) {
  if (locale === "ar") {
    return {
      title: "العملات والصرف",
      subtitle: "كتالوج جاهز — ابحثوا وفعّلوا. الأسماء والرموز تُملأ تلقائياً.",
      liveFx: "صرف حي تلقائي",
      liveFxHelp: "أسعار لحظية من Frankfurter وopen.er-api.com مع كاش 12 دقيقة. إن تعذّر الجلب يُستخدم آخر سعر صالح.",
      defaultCurrency: "العملة الافتراضية",
      catalog: "كتالوج العملات",
      search: "ابحث بالكود أو الاسم (عربي / إنجليزي / تركي)",
      enabled: "مفعّلة",
      enable: "تفعيل",
      disable: "إيقاف",
      all: "الكل",
      onSite: "على الموقع",
      noFx: "بدون صرف حي",
      noLive: "لا يتوفر صرف حي لهذه العملة",
      onHeader: "تظهر في مبدّل الهيدر",
      saved: "تم الحفظ",
      failed: "فشل الحفظ",
      fxTitle: "حالة الصرف",
      fxSource: "المزود",
      fxAt: "آخر تحديث",
      fxStale: "يُعرض آخر سعر صالح — تعذّر الاتصال بالمزود حالياً.",
      fxLive: "الأسعار محدّثة.",
      fxOff: "الصرف الحي متوقف — التحويل يبقى 1:1 مع الدولار حتى إعادة التفعيل.",
      count: (n: number, on: number) => `${n} عملة في الكتالوج · ${on} مفعّلة على الموقع`,
      empty: "لا نتائج في البحث.",
    };
  }
  if (locale === "tr") {
    return {
      title: "Para birimleri ve kur",
      subtitle: "Hazır katalog — arayın ve açın. Ad ve simgeler otomatik.",
      liveFx: "Otomatik canlı kur",
      liveFxHelp: "Frankfurter ve open.er-api.com anlık kurları, 12 dk önbellek.",
      defaultCurrency: "Varsayılan para birimi",
      catalog: "Para birimi kataloğu",
      search: "Kod veya ad ile ara (AR / EN / TR)",
      enabled: "Aktif",
      enable: "Aç",
      disable: "Kapat",
      all: "Tümü",
      onSite: "Sitede",
      noFx: "Canlı kur yok",
      noLive: "Bu para birimi için canlı kur yok",
      onHeader: "Üst menü değiştiricide görünür",
      saved: "Kaydedildi",
      failed: "Kayıt başarısız",
      fxTitle: "Kur durumu",
      fxSource: "Sağlayıcı",
      fxAt: "Son güncelleme",
      fxStale: "Son geçerli kur gösteriliyor.",
      fxLive: "Kurlar güncel.",
      fxOff: "Canlı kur kapalı.",
      count: (n: number, on: number) => `Katalogda ${n} para birimi · sitede ${on} açık`,
      empty: "Arama sonucu yok.",
    };
  }
  return {
    title: "Currencies & FX",
    subtitle: "Ready catalog — search and enable. Names and symbols are filled for you.",
    liveFx: "Live automatic FX",
    liveFxHelp: "Spot rates from Frankfurter and open.er-api.com, cached 12 minutes.",
    defaultCurrency: "Default currency",
    catalog: "Currency catalog",
    search: "Search by code or name (AR / EN / TR)",
    enabled: "Enabled",
    enable: "Enable",
    disable: "Disable",
    all: "All",
    onSite: "On site",
    noFx: "No live FX",
    noLive: "No live FX for this currency",
    onHeader: "Shows in the header switcher",
    saved: "Saved",
    failed: "Save failed",
    fxTitle: "FX status",
    fxSource: "Provider",
    fxAt: "Last update",
    fxStale: "Showing the last valid rate.",
    fxLive: "Rates are fresh.",
    fxOff: "Live FX is off.",
    count: (n: number, on: number) => `${n} currencies in catalog · ${on} enabled on the site`,
    empty: "No search results.",
  };
}

type Filter = "all" | "on" | "nofx";

export default function AdminCurrenciesPage() {
  const { locale } = useLocale();
  const c = copy(locale);
  const [settings, setSettings] = useState<CurrenciesSettings | null>(null);
  const [fx, setFx] = useState<AdminFxStatus | null>(null);
  const [catalogCount, setCatalogCount] = useState(0);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [busyCode, setBusyCode] = useState("");
  const [msg, setMsg] = useState("");

  const applyPayload = (json: {
    settings?: CurrenciesSettings;
    fx?: AdminFxStatus;
    catalogCount?: number;
  }) => {
    if (json.settings) setSettings(json.settings);
    if (json.fx) setFx(json.fx);
    if (typeof json.catalogCount === "number") setCatalogCount(json.catalogCount);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/currencies", { cache: "no-store", credentials: "same-origin" });
      applyPayload((await res.json()) as { settings?: CurrenciesSettings; fx?: AdminFxStatus; catalogCount?: number });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const persist = async (body: Record<string, unknown>) => {
    const res = await fetch("/api/admin/currencies", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as {
      ok?: boolean;
      settings?: CurrenciesSettings;
      fx?: AdminFxStatus;
      catalogCount?: number;
      error?: string;
    };
    if (!res.ok || !json.ok || !json.settings) {
      setMsg(json.error || c.failed);
      return false;
    }
    applyPayload(json);
    setMsg(c.saved);
    window.setTimeout(() => setMsg(""), 1800);
    return true;
  };

  const toggle = async (row: SiteCurrency, enabled: boolean) => {
    if (!settings) return;
    if (!enabled && settings.currencies.filter((item) => item.enabled).length <= 1) return;
    setBusyCode(row.code);
    setSettings({
      ...settings,
      currencies: settings.currencies.map((item) =>
        item.code === row.code ? { ...item, enabled } : item
      ),
    });
    try {
      await persist({ currency: { code: row.code, enabled } });
    } finally {
      setBusyCode("");
    }
  };

  const enabled = settings?.currencies.filter((row) => row.enabled) || [];
  const missing = new Set(fx?.missingRates || []);

  const rows = useMemo(() => {
    if (!settings) return [];
    const q = query.trim().toLowerCase();
    return settings.currencies.filter((row) => {
      const noLive = missing.has(row.code) && row.enabled;
      if (filter === "on" && !row.enabled) return false;
      if (filter === "nofx" && !noLive) return false;
      if (!q) return true;
      return (
        row.code.toLowerCase().includes(q) ||
        row.symbol.toLowerCase().includes(q) ||
        row.nameAr.includes(query.trim()) ||
        row.nameEn.toLowerCase().includes(q) ||
        row.nameTr.toLowerCase().includes(q)
      );
    });
  }, [settings, query, filter, missing]);

  if (loading || !settings) {
    return (
      <div className='flex items-center justify-center py-20 text-muted-foreground'>
        <Loader2 className="animate-spin" size={22} />
      </div>
    );
  }

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-6">
      <div className="flex items-start gap-3">
        <div className='w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center'>
          <Coins size={20} />
        </div>
        <div>
          <h1 className='text-xl font-bold text-foreground'>{c.title}</h1>
          <p className='text-sm text-muted-foreground mt-1'>{c.subtitle}</p>
          <p className="text-xs text-muted-foreground mt-2 font-medium">
            {c.count(catalogCount || settings.currencies.length, enabled.length)}
          </p>
        </div>
      </div>

      {/* Live FX Rate KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">الدولار الأمريكي (الأساس)</span>
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">العملة الأم</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">1.0000</p>
          <p className="text-[11px] text-muted-foreground">دولار أمريكي (المرجع الأساسي المعتمد)</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">الريال السعودي (SAR)</span>
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">ربط ثابت</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">{fx?.rates?.SAR ? Number(fx.rates.SAR).toFixed(2) : "3.75"}</p>
          <p className="text-[11px] text-muted-foreground">ريال سعودي (ربط البنك المركزي السعودي)</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">الليرة التركية (TRY)</span>
            <span className="rounded-md bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">سعر مباشر</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">{fx?.rates?.TRY ? Number(fx.rates.TRY).toFixed(2) : "36.25"}</p>
          <p className="text-[11px] text-muted-foreground">ليرة تركية (TCMB / Interbank مباشر)</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">اليورو الأوروبي (EUR)</span>
            <span className="rounded-md bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-bold text-sky-600 dark:text-sky-400">سوق الصرف FX</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">{fx?.rates?.EUR ? Number(fx.rates.EUR).toFixed(4) : "0.9250"}</p>
          <p className="text-[11px] text-muted-foreground">يورو أوروبي (تحديث دوري كل 12 دقيقة)</p>
        </div>
      </div>

      <section className={cardClass}>
        <h2 className='text-sm font-semibold text-muted-foreground mb-3'>{c.fxTitle}</h2>
        <AdminSwitch
          checked={settings.liveFxEnabled}
          onChange={(next) => void persist({ liveFxEnabled: next })}
          label={c.liveFx}
          description={c.liveFxHelp}
        />
        <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
          <p className='text-muted-foreground'>
            {c.fxSource}: <span className='text-foreground font-medium'>{fx?.source || "Frankfurter & open.er-api"}</span>
          </p>
          <p className='text-muted-foreground'>
            {c.fxAt}: <span className='text-foreground font-medium'>{fx?.at ? new Date(fx.at).toLocaleString() : "Live Cached"}</span>
          </p>
        </div>
        <p className={`mt-3 text-sm ${fx?.stale || fx?.error ? "text-amber-600 dark:text-amber-400 font-medium" : "text-emerald-600 dark:text-emerald-400 font-medium"}`}>
          {!settings.liveFxEnabled ? c.fxOff : fx?.stale || fx?.error ? c.fxStale : c.fxLive}
        </p>
      </section>

      <section className={cardClass}>
        <label className={labelClass}>{c.defaultCurrency}</label>
        <select
          className={inputClass}
          value={settings.defaultCode}
          onChange={(e) => void persist({ defaultCode: e.target.value })}
        >
          {enabled.map((row) => (
            <option key={row.code} value={row.code} className='bg-background'>
              {row.flag} {row.code} — {currencyDisplayName(row, locale)}
            </option>
          ))}
        </select>
        {enabled.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {enabled.map((row) => (
              <span
                key={row.code}
                className='inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary font-medium border border-primary/25'
              >
                {row.flag} {row.code}
                {missing.has(row.code) ? (
                  <span className='text-amber-600 dark:text-amber-400 font-bold'>{c.noFx}</span>
                ) : null}
              </span>
            ))}
          </div>
        ) : null}
      </section>

      <section className={cardClass}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className='text-sm font-semibold text-muted-foreground'>{c.catalog}</h2>
          {msg ? <span className='text-sm text-emerald-600 dark:text-emerald-400 font-bold'>{msg}</span> : null}
        </div>
        <div className="relative mb-3">
          <Search size={15} className='absolute top-1/2 -translate-y-1/2 start-3 text-muted-foreground' />
          <input
            className={`${inputClass} ps-9`}
            value={query}
            placeholder={c.search}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {(
            [
              ["all", c.all],
              ["on", c.onSite],
              ["nofx", c.noFx],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                filter === id
                  ? "bg-primary text-white font-bold shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="space-y-2 max-h-[70vh] overflow-y-auto pe-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {rows.length === 0 ? (
            <p className='text-sm text-muted-foreground py-8 text-center'>{c.empty}</p>
          ) : (
            rows.map((row) => {
              const noLive = row.enabled && missing.has(row.code);
              const rate = fx?.rates?.[row.code];
              return (
                <div
                  key={row.code}
                  className={`flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                    row.enabled
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-card"
                  }`}
                >
                  <span className="text-xl w-8 text-center">{row.flag}</span>
                  <div className="min-w-[4.5rem]">
                    <p className='text-foreground font-bold text-sm'>{row.code}</p>
                    <p className='text-muted-foreground text-xs'>{row.symbol}</p>
                  </div>
                  <div className="flex-1 min-w-[12rem]">
                    <p className='text-foreground text-sm'>{currencyDisplayName(row, locale)}</p>
                    <p className='text-muted-foreground text-xs'>
                      {row.nameAr} · {row.nameEn} · {row.nameTr}
                    </p>
                    {row.enabled ? (
                      <p className='text-[11px] text-primary mt-0.5 font-medium'>{c.onHeader}</p>
                    ) : null}
                    {noLive ? <p className='text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 font-medium'>{c.noLive}</p> : null}
                    {row.enabled && rate && rate > 0 ? (
                      <p className='text-[11px] text-muted-foreground mt-0.5 font-mono'>USD/{row.code} {rate.toFixed(4)}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    disabled={busyCode === row.code}
                    onClick={() => void toggle(row, !row.enabled)}
                    className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold disabled:opacity-50 transition-all cursor-pointer ${
                      row.enabled
                        ? "border border-border bg-card text-muted-foreground hover:bg-muted"
                        : "bg-primary text-white font-bold hover:brightness-110 shadow-xs"
                    }`}
                  >
                    {busyCode === row.code ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : row.enabled ? (
                      c.disable
                    ) : (
                      c.enable
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
