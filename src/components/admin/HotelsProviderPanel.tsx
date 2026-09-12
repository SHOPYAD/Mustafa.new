"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Loader2, Plus, Save, Trash2 } from "lucide-react";
import type { HotelProvider } from "@/lib/hotels-config";
import { parseHotelProvider } from "@/lib/hotels-config";
import {
  applyReviewsOnlyHotelsRuntime,
  BOOKING_RUNTIME_ENDPOINTS,
  createEmptyHotelMarkupRule,
  defaultHotelsRuntime,
  HOTEL_ENDPOINT_USE_AR,
  HOTEL_ENDPOINT_USES,
  sanitizeHotelsRuntime,
  TRAVEL_ADVISOR_RUNTIME_ENDPOINTS,
  type HotelEndpointDef,
  type HotelEndpointState,
  type HotelEndpointUse,
  type HotelMarkupRule,
  type HotelMarkupScope,
  type HotelMarkupType,
  type HotelsRuntimeSettings,
} from "@/lib/hotels-runtime";
import { ROOMS_PROVIDER_HOST, TRAVEL_ADVISOR_HOST } from "@/lib/hotels-config";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import ProvidersHub from "@/components/admin/providers/ProvidersHub";

const inputClass =
  "w-full px-4 py-2.5 bg-background border border-input rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/40 text-sm";

type QuotaAdvice = { changeKey: boolean; reason: string };

type QuotaSnapshot = {
  provider: "booking" | "travel_advisor";
  monthKey: string;
  liveCalls: number;
  success: number;
  failed: number;
  quota429: number;
  headerLimit: number | null;
  headerRemaining: number | null;
  headerReset: string | null;
  headerSeen: boolean;
  lastCallAt: string | null;
  lastCallPath: string;
  lastHttpStatus: number | null;
  last429At: string | null;
  last429Path: string;
  advice: QuotaAdvice;
};

function EndpointTable({
  title,
  host,
  catalog,
  states,
  onChange,
}: {
  title: string;
  host: string;
  catalog: readonly HotelEndpointDef[];
  states: Record<string, HotelEndpointState>;
  onChange: (id: string, next: HotelEndpointState) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-bold text-heading">{title}</h3>
        <p className="text-muted-foreground text-xs mt-1" dir="ltr">
          {host}
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-start font-medium">تفعيل</th>
              <th className="px-3 py-2 text-start font-medium">النقطة</th>
              <th className="px-3 py-2 text-start font-medium">تُستخدم لـ</th>
              <th className="px-3 py-2 text-start font-medium">المسار</th>
            </tr>
          </thead>
          <tbody>
            {catalog.map((item) => {
              const state: HotelEndpointState = states[item.id] || {
                enabled: item.defaultEnabled,
                uses: item.uses,
              };
              return (
                <tr key={item.id} className="border-t border-border">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={state.enabled}
                      onChange={(e) => onChange(item.id, { ...state, enabled: e.target.checked })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-heading">{item.nameAr}</div>
                    <div className="text-[11px] text-muted-foreground" dir="ltr">
                      {item.name}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      value={state.uses}
                      onChange={(e) =>
                        onChange(item.id, { ...state, uses: e.target.value as HotelEndpointUse })
                      }
                      className={`${inputClass} min-w-[160px]`}
                    >
                      {HOTEL_ENDPOINT_USES.map((use) => (
                        <option key={use} value={use}>
                          {HOTEL_ENDPOINT_USE_AR[use]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground" dir="ltr">
                    {item.method} {item.path}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatWhen(value: string | null): string {
  if (!value) return "لا يوجد";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return date.toLocaleString("ar-EG", { hour12: false });
}

function QuotaProviderCard({
  title,
  snap,
  ready,
}: {
  title: string;
  snap: QuotaSnapshot | null;
  ready: boolean;
}) {
  if (!ready || !snap) {
    return (
      <div className="rounded-xl border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
        {title}: لا مفتاح محفوظ — لا إحصاء.
      </div>
    );
  }
  const usedFromHeader =
    snap.headerSeen && snap.headerLimit != null && snap.headerRemaining != null
      ? Math.max(0, snap.headerLimit - snap.headerRemaining)
      : null;
  return (
    <div className="rounded-xl border border-border bg-muted/70 px-4 py-4 space-y-2 text-sm">
      <p className="font-semibold text-heading">{title}</p>
      <p className="text-muted-foreground">نافذة {snap.monthKey} (UTC)</p>
      <div className="grid sm:grid-cols-2 gap-2 text-foreground">
        <p>طلبات حيّة هذا الشهر: {snap.liveCalls}</p>
        <p>نجاح / فشل / 429: {snap.success} / {snap.failed} / {snap.quota429}</p>
        <p>
          المستهلك من الترويسة:{" "}
          {usedFromHeader != null ? usedFromHeader : "غير متوفر بعد"}
        </p>
        <p>
          المتبقي:{" "}
          {snap.headerRemaining != null ? snap.headerRemaining : "غير متوفر بعد"}
        </p>
        <p>
          الحد الأقصى: {snap.headerLimit != null ? snap.headerLimit : "غير متوفر بعد"}
        </p>
        <p>إعادة التعيين: {snap.headerReset ? formatWhen(snap.headerReset) : "—"}</p>
      </div>
      <p className="text-muted-foreground" dir="ltr">
        آخر استدعاء: {formatWhen(snap.lastCallAt)}
        {snap.lastHttpStatus != null ? ` — HTTP ${snap.lastHttpStatus}` : ""}
        {snap.lastCallPath ? ` — ${snap.lastCallPath}` : ""}
      </p>
      {snap.last429At ? (
        <p className="text-amber-200">
          آخر 429: {formatWhen(snap.last429At)}
          {snap.last429Path ? ` — ${snap.last429Path}` : ""}
        </p>
      ) : (
        <p className="text-muted-foreground">لا 429 مسجّل في هذه النافذة.</p>
      )}
      {!snap.headerSeen ? (
        <p className="text-muted-foreground text-xs">
          الرقم الدقيق للمتبقي يأتي من ترويسة RapidAPI عندما تتوفر بعد أول جلب حي.
        </p>
      ) : null}
      {snap.advice.changeKey ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-800 dark:text-amber-100">
          غيّر المفتاح — {snap.advice.reason}
        </p>
      ) : null}
    </div>
  );
}

export default function HotelsProviderPanel({
  onProviderChange,
}: {
  onProviderChange?: (provider: HotelProvider) => void;
}) {
  const [runtime, setRuntime] = useState<HotelsRuntimeSettings>(defaultHotelsRuntime("booking"));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [apiReady, setApiReady] = useState(false);
  const [roomsKeyConfigured, setRoomsKeyConfigured] = useState(false);
  const [quotaStats, setQuotaStats] = useState<{
    booking: QuotaSnapshot;
    travel_advisor: QuotaSnapshot;
  } | null>(null);
  const { t } = useLocale();

  const applyRuntime = useCallback(
    (next: HotelsRuntimeSettings) => {
      const clean = sanitizeHotelsRuntime(next, next.providers[0] || "booking");
      setRuntime(clean);
      onProviderChange?.(clean.providers[0] || "booking");
    },
    [onProviderChange]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/hotels-settings", { cache: "no-store" });
      const data = await res.json();
      if (data?.ok) {
        const fallback = parseHotelProvider(data.values?.NEXT_PUBLIC_HOTELS_PROVIDER);
        applyRuntime(sanitizeHotelsRuntime(data.runtime, fallback));
        setApiReady(Boolean(data.apiReady));
        setRoomsKeyConfigured(Boolean(data.roomsKeyConfigured));
        setQuotaStats(
          data.quotaStats && typeof data.quotaStats === "object"
            ? (data.quotaStats as { booking: QuotaSnapshot; travel_advisor: QuotaSnapshot })
            : null
        );
      }
    } catch {
      setMessage("تعذّر تحميل إعدادات الفنادق");
    } finally {
      setLoading(false);
    }
  }, [applyRuntime]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateMarkup = (id: string, patch: Partial<HotelMarkupRule>) => {
    applyRuntime({
      ...runtime,
      markupRules: runtime.markupRules.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)),
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/hotels-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          values: {
            NEXT_PUBLIC_HOTELS_PROVIDER: runtime.providers[0] || "booking",
            NEXT_PUBLIC_HOTELS_ROOMS_PROVIDER: runtime.providers.includes("booking")
              ? "booking_com15"
              : "off",
          },
          runtime,
        }),
      });
      const data = await res.json();
      if (!data?.ok) {
        setMessage(data?.error || "فشل الحفظ");
        return;
      }
      setApiReady(Boolean(data.apiReady));
      setRoomsKeyConfigured(Boolean(data.roomsKeyConfigured));
      setMessage("تم حفظ إعدادات الفنادق — البحث العام يستخدم هذا الاختيار فوراً");
      await load();
    } catch {
      setMessage("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handlePurgeListCache = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/hotels-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purgeListCache: true }),
      });
      const data = await res.json();
      setMessage(data?.ok ? `تم مسح كاش قوائم السيرفر (${data.purged || 0} ملف)` : data?.error || "فشل المسح");
    } catch {
      setMessage("فشل مسح كاش القوائم");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mb-8 flex items-center gap-2 text-muted-foreground">
        <Loader2 size={18} className="animate-spin" />
        جاري التحميل...
      </div>
    );
  }

  return (
    <div className="mb-8 space-y-6">
      <ProvidersHub vertical="hotels" onLiveChange={() => void load()} />

      <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-heading">نقاط النهاية — RapidAPI</h2>
            <p className="text-muted-foreground text-sm mt-1">
              البحث العام يبقى على الموردين الحيّين (Travelport وغيره). RapidAPI هنا للتقييمات فقط:
              عند فتح تفاصيل فندق نطابق اسمه ونمرّر المعرّف الذي يتوقعه Booking أو Travel Advisor، ثم
              نجلب تقييمات ذلك الفندق. درجة /10 على البطاقات تأتي من الكاش بعد أول مطابقة، أو من
              Travelport إن أرسل تقييم TripAdvisor.
            </p>
          </div>
          <button
            type="button"
            onClick={() => applyRuntime(applyReviewsOnlyHotelsRuntime(runtime))}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-foreground text-sm font-semibold shrink-0"
          >
            تفعيل التقييمات فقط
          </button>
        </div>
        <EndpointTable
          title="Booking.com15"
          host={ROOMS_PROVIDER_HOST}
          catalog={BOOKING_RUNTIME_ENDPOINTS}
          states={runtime.bookingEndpoints}
          onChange={(id, next) =>
            applyRuntime({
              ...runtime,
              bookingEndpoints: { ...runtime.bookingEndpoints, [id]: next },
            })
          }
        />
        <EndpointTable
          title="Travel Advisor"
          host={TRAVEL_ADVISOR_HOST}
          catalog={TRAVEL_ADVISOR_RUNTIME_ENDPOINTS}
          states={runtime.travelAdvisorEndpoints}
          onChange={(id, next) =>
            applyRuntime({
              ...runtime,
              travelAdvisorEndpoints: { ...runtime.travelAdvisorEndpoints, [id]: next },
            })
          }
        />
      </div>

      <div id="markup" className="bg-card border border-border rounded-2xl p-6 space-y-4 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-heading">{t.admin.hotelsMarkupTitle}</h2>
            <p className="text-muted-foreground text-sm mt-1">{t.admin.hotelsMarkupSectionHint}</p>
          </div>
          <button
            type="button"
            onClick={() =>
              applyRuntime({
                ...runtime,
                markupRules: [...runtime.markupRules, createEmptyHotelMarkupRule()],
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-foreground text-sm font-semibold"
          >
            <Plus size={14} />
            {t.admin.hotelsMarkupAddRule}
          </button>
        </div>

        {runtime.markupRules.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t.admin.hotelsMarkupEmpty}</p>
        ) : (
          <div className="space-y-3">
            {runtime.markupRules.map((rule) => (
              <div
                key={rule.id}
                className="grid grid-cols-1 md:grid-cols-8 gap-3 rounded-xl border border-border bg-muted/70 p-4"
              >
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) => updateMarkup(rule.id, { enabled: e.target.checked })}
                  />
                  {t.admin.hotelsMarkupEnable}
                </label>
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">
                    {t.admin.flightsMarkupPriority}
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={rule.priority}
                    onChange={(e) =>
                      updateMarkup(rule.id, { priority: Number(e.target.value) || 0 })
                    }
                    className={inputClass}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
                    {t.admin.flightsMarkupPriorityHint}
                  </p>
                </div>
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">
                    {t.admin.flightsMarkupScope}
                  </label>
                  <select
                    value={rule.scope}
                    onChange={(e) =>
                      updateMarkup(rule.id, { scope: e.target.value as HotelMarkupScope })
                    }
                    className={inputClass}
                  >
                    <option value="all">{t.admin.flightsMarkupScopeAll}</option>
                    <option value="country">{t.admin.flightsMarkupScopeCountry}</option>
                    <option value="city">{t.admin.flightsMarkupScopeCity}</option>
                    <option value="provider">{t.admin.hotelsMarkupScopeProvider}</option>
                  </select>
                </div>
                {rule.scope === "all" ? (
                  <div className="md:col-span-2 flex items-center">
                    <p className="text-xs text-muted-foreground leading-snug">
                      {t.admin.hotelsMarkupAllApplies}
                    </p>
                  </div>
                ) : rule.scope === "provider" ? (
                  <div className="md:col-span-2">
                    <label className="block text-[11px] text-muted-foreground mb-1">
                      {t.admin.hotelsMarkupProvider}
                    </label>
                    <select
                      value={rule.provider}
                      onChange={(e) => updateMarkup(rule.id, { provider: e.target.value })}
                      className={inputClass}
                    >
                      <option value="booking">Booking.com15</option>
                      <option value="seeru">Seeru Hotels</option>
                      <option value="travel_advisor">Travel Advisor</option>
                      <option value="owned">{t.admin.hotelsMarkupProviderOwned}</option>
                      <option value="internal">{t.admin.hotelsMarkupProviderInternal}</option>
                    </select>
                  </div>
                ) : (
                  <div className="md:col-span-2">
                    <label className="block text-[11px] text-muted-foreground mb-1">
                      {t.admin.hotelsMarkupDestination}
                    </label>
                    <input
                      type="text"
                      value={rule.destination}
                      onChange={(e) => updateMarkup(rule.id, { destination: e.target.value })}
                      className={inputClass}
                      placeholder={rule.scope === "country" ? "TR / Turkey" : "Istanbul"}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">
                    {t.admin.hotelsMarkupType}
                  </label>
                  <select
                    value={rule.type}
                    onChange={(e) =>
                      updateMarkup(rule.id, { type: e.target.value as HotelMarkupType })
                    }
                    className={inputClass}
                  >
                    <option value="percent">{t.admin.hotelsMarkupPercent}</option>
                    <option value="fixed">{t.admin.hotelsMarkupFixed}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">
                    {t.admin.hotelsMarkupValue}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={rule.value}
                      onChange={(e) =>
                        updateMarkup(rule.id, { value: Number(e.target.value) || 0 })
                      }
                      className={inputClass}
                    />
                    <input
                      type="text"
                      value={rule.currency}
                      onChange={(e) => updateMarkup(rule.id, { currency: e.target.value })}
                      className={`${inputClass} max-w-[72px]`}
                      placeholder="USD"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() =>
                      applyRuntime({
                        ...runtime,
                        markupRules: runtime.markupRules.filter((item) => item.id !== rule.id),
                      })
                    }
                    className="w-10 h-10 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex items-center justify-center text-red-400"
                    title={t.admin.hotelsMarkupDelete}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-heading flex items-center gap-2">
          <Activity size={18} className="text-amber-400" />
          إحصائيات استهلاك الحصة
        </h2>
        <p className="text-muted-foreground text-sm">
          للأدمن فقط. يُحدَّث عند كل جلب حي — لا يُستدعى RapidAPI لعرض هذا القسم.
        </p>
        <div className="grid lg:grid-cols-2 gap-4">
          <QuotaProviderCard
            title="Booking.com15"
            snap={quotaStats?.booking || null}
            ready={roomsKeyConfigured}
          />
          <QuotaProviderCard
            title="Travel Advisor"
            snap={quotaStats?.travel_advisor || null}
            ready={apiReady}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl disabled:opacity-60 hover:opacity-90"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          حفظ
        </button>
        <button
          type="button"
          onClick={() => void handlePurgeListCache()}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-border bg-secondary text-foreground font-semibold rounded-xl disabled:opacity-60 hover:bg-muted"
        >
          مسح كاش قوائم السيرفر
        </button>
        {message ? <span className="text-sm text-muted-foreground">{message}</span> : null}
      </div>
    </div>
  );
}
