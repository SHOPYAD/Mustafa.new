"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Loader2, Plane, Plus, Save, Trash2 } from "lucide-react";
import {
  createEmptyMarkupRule,
  defaultFlightsRuntime,
  FLIGHT_ENDPOINT_USE_AR,
  FLIGHT_ENDPOINT_USES,
  parseFlightProvider,
  sanitizeFlightsRuntime,
  SKY_SCRAPPER_ENDPOINTS,
  SKY_SCRAPPER_HOST,
  type FlightEndpointState,
  type FlightEndpointUse,
  type FlightMarkupRule,
  type FlightMarkupScope,
  type FlightMarkupType,
  type FlightProvider,
  type FlightsRuntimeSettings,
} from "@/lib/flights-config";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import ProvidersHub from "@/components/admin/providers/ProvidersHub";

const inputClass =
  "w-full px-4 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm";

type QuotaAdvice = { changeKey: boolean; reason: string };

type QuotaSnapshot = {
  provider: "sky_scrapper";
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

function formatWhen(value: string | null): string {
  if (!value) return "لا يوجد";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return date.toLocaleString("ar-EG", { hour12: false });
}

function chipClass(active: boolean): string {
  return `px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
    active
      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
      : "bg-white/5 text-white/60 hover:bg-white/10"
  }`;
}

function QuotaCard({
  snap,
  ready,
}: {
  snap: QuotaSnapshot | null;
  ready: boolean;
}) {
  if (!ready || !snap) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50">
        لا مفتاح محفوظ — لا إحصاء. يظهر العداد بعد أول طلب حي يكتبه المحرك.
      </div>
    );
  }
  const usedFromHeader =
    snap.headerSeen && snap.headerLimit != null && snap.headerRemaining != null
      ? Math.max(0, snap.headerLimit - snap.headerRemaining)
      : null;
  const nearEnd =
    snap.headerSeen &&
    snap.headerLimit != null &&
    snap.headerRemaining != null &&
    (snap.headerRemaining <= 10 ||
      (snap.headerLimit > 0 && snap.headerRemaining / snap.headerLimit <= 0.15));
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-4 space-y-2 text-sm">
      <p className="font-semibold text-white">نظام الطيران الحي (Sky Scrapper)</p>
      <p className="text-white/70">نافذة {snap.monthKey} (UTC)</p>
      <div className="grid sm:grid-cols-2 gap-2 text-white/80">
        <p>المستهلك من الترويسة: {usedFromHeader != null ? usedFromHeader : "غير متوفر بعد"}</p>
        <p>المتبقي: {snap.headerRemaining != null ? snap.headerRemaining : "غير متوفر بعد"}</p>
        <p>الحد الأقصى: {snap.headerLimit != null ? snap.headerLimit : "غير متوفر بعد"}</p>
        <p>طلبات حيّة هذا الشهر: {snap.liveCalls}</p>
        <p>
          نجاح / فشل / 429: {snap.success} / {snap.failed} / {snap.quota429}
        </p>
        <p>إعادة التعيين: {snap.headerReset ? formatWhen(snap.headerReset) : "—"}</p>
      </div>
      <p className="text-white/70" dir="ltr">
        آخر طلب: {formatWhen(snap.lastCallAt)}
        {snap.lastHttpStatus != null ? ` — HTTP ${snap.lastHttpStatus}` : ""}
        {snap.lastCallPath ? ` — ${snap.lastCallPath}` : ""}
      </p>
      {snap.last429At ? (
        <p className="text-amber-200">
          آخر 429: {formatWhen(snap.last429At)}
          {snap.last429Path ? ` — ${snap.last429Path}` : ""}
        </p>
      ) : (
        <p className="text-white/40">لا 429 مسجّل في هذه النافذة.</p>
      )}
      {!snap.headerSeen ? (
        <p className="text-white/45 text-xs">
          الأرقام الدقيقة للمتبقي والحد تأتي من ترويسات RapidAPI بعد أول جلب حي يكتبه المحرك — لا يُستدعى المزود من هنا.
        </p>
      ) : null}
      {nearEnd || snap.advice.changeKey ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-amber-100">
          تنبيه اقتراب نهاية الحصة — جدّد اشتراك RapidAPI / Sky Scrapper قبل النفاد.
          {snap.advice.reason ? ` ${snap.advice.reason}` : ""}
        </p>
      ) : null}
    </div>
  );
}

type FlightsProviderPanelProps = {
  onProviderChange?: (provider: FlightProvider) => void;
};

export default function FlightsProviderPanel({
  onProviderChange,
}: FlightsProviderPanelProps) {
  const { t } = useLocale();
  const [runtime, setRuntime] = useState<FlightsRuntimeSettings>(defaultFlightsRuntime("live"));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [skyScrapperReady, setSkyScrapperReady] = useState(false);
  const [quotaSnap, setQuotaSnap] = useState<QuotaSnapshot | null>(null);

  const applyRuntime = useCallback(
    (next: FlightsRuntimeSettings) => {
      const clean = sanitizeFlightsRuntime(next, next.providers[0] === "travelpayouts" ? "travelpayouts" : "live");
      setRuntime(clean);
      onProviderChange?.(clean.providers[0] === "travelpayouts" ? "travelpayouts" : "live");
    },
    [onProviderChange]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/flights-settings", { cache: "no-store" });
      const data = await res.json();
      if (data?.ok) {
        const fallback = parseFlightProvider(data.values?.NEXT_PUBLIC_FLIGHTS_PROVIDER);
        applyRuntime(sanitizeFlightsRuntime(data.runtime, fallback));
        setSkyScrapperReady(Boolean(data.skyScrapperReady));
        setQuotaSnap(
          data.quotaStats?.sky_scrapper && typeof data.quotaStats.sky_scrapper === "object"
            ? (data.quotaStats.sky_scrapper as QuotaSnapshot)
            : null
        );
      }
    } catch {
      setMessage(t.admin.flightsTravelpayoutsSaveFailed);
    } finally {
      setLoading(false);
    }
  }, [applyRuntime, t.admin.flightsTravelpayoutsSaveFailed]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/flights-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runtime }),
      });
      const data = await res.json();
      if (!data?.ok) {
        setMessage(data?.error || t.admin.flightsTravelpayoutsSaveFailed);
        return;
      }
      setSkyScrapperReady(Boolean(data.skyScrapperReady));
      setMessage(t.admin.flightsTravelpayoutsSaved);
      await load();
    } catch {
      setMessage(t.admin.flightsTravelpayoutsSaveFailed);
    } finally {
      setSaving(false);
    }
  };

  const updateMarkup = (id: string, patch: Partial<FlightMarkupRule>) => {
    applyRuntime({
      ...runtime,
      markupRules: runtime.markupRules.map((rule) =>
        rule.id === id ? { ...rule, ...patch } : rule
      ),
    });
  };

  return (
    <div className="mb-8">
      <div className="sticky top-0 z-20 -mx-1 mb-6 px-1 py-3 backdrop-blur-xl bg-[color-mix(in_srgb,var(--admin-bg,#0a0a0f)_92%,transparent)] border-b border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Plane className="text-amber-400" size={28} />
              {t.admin.flightsAdminTitle}
            </h1>
            <p className="text-white/50 mt-1">{t.admin.flightsAdminSubtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={loading || saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg disabled:opacity-60 transition-all"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              حفظ المارك أب والنقاط
            </button>
          </div>
        </div>
        {message ? <p className="text-sm text-white/70 mt-3">{message}</p> : null}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-white/50">
          <Loader2 size={18} className="animate-spin" />
          {t.admin.loading}
        </div>
      ) : (
      <div className="space-y-6">
      <ProvidersHub vertical="flights" onLiveChange={() => void load()} />

      {runtime.providers.includes("live") && runtime.providers.includes("travelpayouts") ? (
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
          مصدر عروض الصفحة الرئيسية
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyRuntime({ ...runtime, dealsSource: "travelpayouts" })}
            className={chipClass(runtime.dealsSource !== "live")}
          >
            Travelpayouts
          </button>
          <button
            type="button"
            onClick={() => applyRuntime({ ...runtime, dealsSource: "live" })}
            className={chipClass(runtime.dealsSource === "live")}
          >
            Air Scraper (حي)
          </button>
        </div>
        <p className="mt-2 text-xs text-white/40">
          الكاش يُحدَّث 4 مرات يومياً. بلاطات العروض مصدر واحد فقط — لا خلط.
        </p>
      </div>
      ) : null}

      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">{t.admin.flightsMarkupTitle}</h2>
            <p className="text-white/40 text-sm mt-1">
              {t.admin.flightsMarkupSectionHint}
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              applyRuntime({
                ...runtime,
                markupRules: [...runtime.markupRules, createEmptyMarkupRule()],
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-semibold"
          >
            <Plus size={14} />
            إضافة قاعدة
          </button>
        </div>

        {runtime.markupRules.length === 0 ? (
          <p className="text-white/40 text-sm">لا قواعد بعد — السعر الحي يُعرض كما هو حتى تضيف مارك أب.</p>
        ) : (
          <div className="space-y-3">
            {runtime.markupRules.map((rule) => (
              <div
                key={rule.id}
                className="grid grid-cols-1 md:grid-cols-8 gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-4"
              >
                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) => updateMarkup(rule.id, { enabled: e.target.checked })}
                  />
                  تفعيل
                </label>
                <div>
                  <label className="block text-[11px] text-white/40 mb-1">
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
                  <p className="text-[11px] text-white/40 mt-1.5 leading-snug">
                    {t.admin.flightsMarkupPriorityHint}
                  </p>
                </div>
                <div>
                  <label className="block text-[11px] text-white/40 mb-1">
                    {t.admin.flightsMarkupScope}
                  </label>
                  <select
                    value={rule.scope}
                    onChange={(e) =>
                      updateMarkup(rule.id, { scope: e.target.value as FlightMarkupScope })
                    }
                    className={inputClass}
                  >
                    <option value="all">{t.admin.flightsMarkupScopeAll}</option>
                    <option value="country">{t.admin.flightsMarkupScopeCountry}</option>
                    <option value="city">{t.admin.flightsMarkupScopeCity}</option>
                    <option value="route">{t.admin.flightsMarkupScopeRoute}</option>
                  </select>
                </div>
                {rule.scope === "all" ? (
                  <div className="md:col-span-2 flex items-center">
                    <p className="text-xs text-white/45 leading-snug">
                      {t.admin.flightsMarkupAllApplies}
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-[11px] text-white/40 mb-1">الأصل / الدولة</label>
                      <input
                        type="text"
                        value={rule.origin}
                        onChange={(e) => updateMarkup(rule.id, { origin: e.target.value })}
                        className={inputClass}
                        placeholder="TR أو IST"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-white/40 mb-1">الوجهة</label>
                      <input
                        type="text"
                        value={rule.destination}
                        onChange={(e) => updateMarkup(rule.id, { destination: e.target.value })}
                        className={inputClass}
                        placeholder="اختياري / LHR"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-[11px] text-white/40 mb-1">النوع</label>
                  <select
                    value={rule.type}
                    onChange={(e) =>
                      updateMarkup(rule.id, { type: e.target.value as FlightMarkupType })
                    }
                    className={inputClass}
                  >
                    <option value="percent">نسبة %</option>
                    <option value="fixed">مبلغ ثابت</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-white/40 mb-1">القيمة / العملة</label>
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
                    title="حذف القاعدة"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-white">نقاط النهاية — Sky Scrapper</h2>
          <p className="text-white/40 text-sm mt-1">
            القائمة من ملف التوثيق فقط. فعّل أو أوقف النقطة وحدد «تُستخدم لـ». لا مسارات مخترعة.
          </p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="bg-white/5 text-white/50">
              <tr>
                <th className="px-3 py-2 text-start font-medium">تفعيل</th>
                <th className="px-3 py-2 text-start font-medium">النقطة</th>
                <th className="px-3 py-2 text-start font-medium">تُستخدم لـ</th>
                <th className="px-3 py-2 text-start font-medium">المسار</th>
              </tr>
            </thead>
            <tbody>
              {SKY_SCRAPPER_ENDPOINTS.map((item) => {
                const state: FlightEndpointState = runtime.endpoints[item.id] || {
                  enabled: item.defaultEnabled,
                  uses: item.uses,
                };
                return (
                  <tr key={item.id} className="border-t border-white/5">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={state.enabled}
                        onChange={(e) =>
                          applyRuntime({
                            ...runtime,
                            endpoints: {
                              ...runtime.endpoints,
                              [item.id]: { ...state, enabled: e.target.checked },
                            },
                          })
                        }
                      />
                    </td>
                    <td className="px-3 py-2 text-white">
                      <div className="font-medium">{item.nameAr}</div>
                      <div className="text-[11px] text-white/40" dir="ltr">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-white/45 mt-0.5">{item.descriptionAr}</div>
                    </td>
                    <td className="px-3 py-2">
                      <select
                        value={state.uses}
                        onChange={(e) =>
                          applyRuntime({
                            ...runtime,
                            endpoints: {
                              ...runtime.endpoints,
                              [item.id]: {
                                ...state,
                                uses: e.target.value as FlightEndpointUse,
                              },
                            },
                          })
                        }
                        className="bg-slate-950/70 border border-white/10 rounded-lg px-2 py-1 text-white text-xs"
                      >
                        {FLIGHT_ENDPOINT_USES.map((use) => (
                          <option key={use} value={use}>
                            {FLIGHT_ENDPOINT_USE_AR[use]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px] text-white/55" dir="ltr">
                      {item.method} {SKY_SCRAPPER_HOST}
                      {item.path}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity size={18} className="text-amber-400" />
          إحصائيات الحصة
        </h2>
        <p className="text-white/40 text-sm">
          للأدمن فقط — لا يظهر للعملاء. يُقرأ العدّاد الذي يكتبه المحرك من ترويسات RapidAPI. لا يُستدعى المزود لعرض هذا القسم.
        </p>
        <QuotaCard snap={quotaSnap} ready={skyScrapperReady} />
      </div>

      </div>
      )}
    </div>
  );
}
