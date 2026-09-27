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
  "w-full px-3.5 py-2.5 bg-card  border border-border  rounded-xl text-foreground  placeholder:text-muted-foreground :text-muted-foreground focus:outline-none focus:ring-2 focus:ring-admin-btn-secondary-border/40 text-sm transition-colors shadow-2xs";

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
  return `px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
    active
      ? "bg-gradient-to-r from-admin-btn-secondary-bg to-orange-500 text-foreground shadow-md"
      : "bg-muted  text-foreground  hover:hover:bg-secondary/80 hover:hover:bg-secondary/80 border border-border "
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
      <div className='rounded-2xl border border-border  bg-card-2  px-4 py-3 text-sm text-muted-foreground  font-medium'>لا مفتاح محفوظ — لا إحصاء. يظهر العداد بعد أول طلب حي يكتبه المحرك.
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
    <div className='rounded-2xl border border-border  bg-card-2/80  p-4 sm:p-5 space-y-3 text-sm text-foreground  shadow-2xs'>
      <div className='flex flex-wrap items-center justify-between gap-2 border-b border-border/80  pb-2.5'>
        <p className='font-black text-foreground  text-base'>نظام الطيران الحي (Sky Scrapper)</p>
        <span className='text-xs font-bold px-2.5 py-0.5 rounded-full bg-card-2  text-foreground  font-mono'>
          نافذة {snap.monthKey} (UTC)
        </span>
      </div>
      <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-foreground  text-xs font-semibold'>
        <div className='p-2.5 rounded-xl bg-card  border border-border/80 '>
          <span className='text-muted-foreground  block text-[11px]'>المستهلك من الترويسة:</span>
          <b className='font-black text-sm text-foreground '>{usedFromHeader != null ? usedFromHeader : "غير متوفر بعد"}</b>
        </div>
        <div className='p-2.5 rounded-xl bg-card  border border-border/80 '>
          <span className='text-muted-foreground  block text-[11px]'>المتبقي:</span>
          <b className='font-black text-sm text-foreground '>{snap.headerRemaining != null ? snap.headerRemaining : "غير متوفر بعد"}</b>
        </div>
        <div className='p-2.5 rounded-xl bg-card  border border-border/80 '>
          <span className='text-muted-foreground  block text-[11px]'>الحد الأقصى:</span>
          <b className='font-black text-sm text-foreground '>{snap.headerLimit != null ? snap.headerLimit : "غير متوفر بعد"}</b>
        </div>
        <div className='p-2.5 rounded-xl bg-card  border border-border/80 '>
          <span className='text-muted-foreground  block text-[11px]'>طلبات حيّة هذا الشهر:</span>
          <b className='font-black text-sm text-foreground '>{snap.liveCalls}</b>
        </div>
        <div className='p-2.5 rounded-xl bg-card  border border-border/80 '>
          <span className='text-muted-foreground  block text-[11px]'>نجاح / فشل / 429:</span>
          <b className='font-black text-sm text-foreground '>{snap.success} / {snap.failed} / {snap.quota429}</b>
        </div>
        <div className='p-2.5 rounded-xl bg-card  border border-border/80 '>
          <span className='text-muted-foreground  block text-[11px]'>إعادة التعيين:</span>
          <b className='font-black text-sm text-foreground '>{snap.headerReset ? formatWhen(snap.headerReset) : "—"}</b>
        </div>
      </div>
      <p className='text-muted-foreground  text-xs font-mono pt-1' dir="ltr">
        آخر طلب: {formatWhen(snap.lastCallAt)}
        {snap.lastHttpStatus != null ? ` — HTTP ${snap.lastHttpStatus}` : ""}
        {snap.lastCallPath ? ` — ${snap.lastCallPath}` : ""}
      </p>
      {snap.last429At ? (
        <p className="text-admin-btn-secondary-hover  font-bold text-xs">
          آخر 429: {formatWhen(snap.last429At)}
          {snap.last429Path ? ` — ${snap.last429Path}` : ""}
        </p>
      ) : (
        <p className='text-muted-foreground  text-xs'>لا 429 مسجّل في هذه النافذة.</p>
      )}
      {!snap.headerSeen ? (
        <p className='text-muted-foreground  text-xs'>
          الأرقام الدقيقة للمتبقي والحد تأتي من ترويسات RapidAPI بعد أول جلب حي يكتبه المحرك — لا يُستدعى المزود من هنا.
        </p>
      ) : null}
      {nearEnd || snap.advice.changeKey ? (
        <p className='rounded-xl border border-border  bg-amber-50  text-admin-btn-secondary-border  px-3.5 py-2.5 text-xs font-bold'>
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
    <div className="mb-8 space-y-6">
      <div className='sticky top-0 z-20 -mx-1 mb-6 px-1 py-3 backdrop-blur-xl bg-card/80 [#0c0717]/80 border-b border-border/80 '>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className='text-2xl sm:text-3xl font-black text-foreground  flex items-center gap-3'>
              <Plane className='text-secondary' size={28} />
              {t.admin.flightsAdminTitle}
            </h1>
            <p className='text-muted-foreground  mt-1 text-xs sm:text-sm'>{t.admin.flightsAdminSubtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={loading || saving}
              className='inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-admin-btn-secondary-bg to-orange-500 hover:from-admin-btn-secondary-bg hover:to-orange-600 text-foreground font-bold rounded-xl shadow-md disabled:opacity-60 transition-all cursor-pointer'
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              حفظ المارك أب والنقاط
            </button>
          </div>
        </div>
        {message ? <p className="text-sm font-bold text-emerald-700  mt-3">{message}</p> : null}
      </div>

      {loading ? (
        <div className='flex items-center gap-2 text-muted-foreground  font-bold p-8'>
          <Loader2 size={18} className='animate-spin text-secondary' />
          {t.admin.loading}
        </div>
      ) : (
      <div className="space-y-6">
      <ProvidersHub vertical="flights" onLiveChange={() => void load()} />

      {runtime.providers.includes("live") && runtime.providers.includes("travelpayouts") ? (
      <div className='bg-card  border border-border  rounded-3xl p-6 shadow-2xs space-y-3'>
        <p className='text-xs font-bold uppercase tracking-wider text-muted-foreground '>
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
        <p className='text-xs text-muted-foreground '>
          الكاش يُحدَّث 4 مرات يومياً. بلاطات العروض مصدر واحد فقط — لا خلط.
        </p>
      </div>
      ) : null}

      <div className='bg-card  border border-border  rounded-3xl p-6 shadow-2xs space-y-4'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border  pb-4'>
          <div>
            <h2 className='text-lg font-black text-foreground '>{t.admin.flightsMarkupTitle}</h2>
            <p className='text-muted-foreground  text-xs mt-1'>
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
            className='inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-admin-bg-subtle  border border-border  text-admin-btn-primary-hover  hover:bg-admin-bg-subtle text-xs font-bold transition-colors cursor-pointer'
          >
            <Plus size={14} />
            إضافة قاعدة
          </button>
        </div>

        {runtime.markupRules.length === 0 ? (
          <p className='text-muted-foreground  text-sm'>لا قواعد بعد — السعر الحي يُعرض كما هو حتى تضيف مارك أب.</p>
        ) : (
          <div className="space-y-3">
            {runtime.markupRules.map((rule) => (
              <div
                key={rule.id}
                className='grid grid-cols-1 md:grid-cols-8 gap-3 rounded-2xl border border-border  bg-card-2/70  p-4 text-foreground  items-center'
              >
                <label className='flex items-center gap-2 text-xs font-bold text-foreground  cursor-pointer'>
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) => updateMarkup(rule.id, { enabled: e.target.checked })}
                    className='rounded border-border text-primary focus:ring-admin-accent'
                  />
                  تفعيل
                </label>
                <div>
                  <label className='block text-[11px] font-bold text-foreground  mb-1'>
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
                  <p className='text-[10px] text-muted-foreground  mt-1 leading-snug'>
                    {t.admin.flightsMarkupPriorityHint}
                  </p>
                </div>
                <div>
                  <label className='block text-[11px] font-bold text-foreground  mb-1'>
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
                  <div className='md:col-span-2 text-xs text-muted-foreground  flex items-center'>
                    تُطبّق على كل الرحلات إن لم تُطابق قاعدة أضيق.
                  </div>
                ) : rule.scope === "country" ? (
                  <div className="md:col-span-2">
                    <label className='block text-[11px] font-bold text-foreground  mb-1'>كود الدولة</label>
                    <input
                      type="text"
                      value={rule.origin || ""}
                      onChange={(e) => updateMarkup(rule.id, { origin: e.target.value })}
                      className={inputClass}
                      placeholder="SA / TR / AE"
                    />
                  </div>
                ) : rule.scope === "city" ? (
                  <div className="md:col-span-2">
                    <label className='block text-[11px] font-bold text-foreground  mb-1'>اسم المدينة أو المعرّف</label>
                    <input
                      type="text"
                      value={rule.origin || ""}
                      onChange={(e) => updateMarkup(rule.id, { origin: e.target.value })}
                      className={inputClass}
                      placeholder="Istanbul / Riyadh"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className='block text-[11px] font-bold text-foreground  mb-1'>من (مطار)</label>
                      <input
                        type="text"
                        value={rule.origin || ""}
                        onChange={(e) => updateMarkup(rule.id, { origin: e.target.value })}
                        className={inputClass}
                        placeholder="IST"
                      />
                    </div>
                    <div>
                      <label className='block text-[11px] font-bold text-foreground  mb-1'>إلى (مطار)</label>
                      <input
                        type="text"
                        value={rule.destination || ""}
                        onChange={(e) =>
                          updateMarkup(rule.id, { destination: e.target.value })
                        }
                        className={inputClass}
                        placeholder="اختياري / LHR"
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className='block text-[11px] font-bold text-foreground  mb-1'>النوع</label>
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
                  <label className='block text-[11px] font-bold text-foreground  mb-1'>القيمة / العملة</label>
                  <div className="flex gap-1.5">
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
                      className={`${inputClass} max-w-[65px]`}
                      placeholder="USD"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end md:pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      applyRuntime({
                        ...runtime,
                        markupRules: runtime.markupRules.filter((item) => item.id !== rule.id),
                      })
                    }
                    className="w-9 h-9 bg-rose-50 hover:bg-rose-100 text-rose-600   :bg-rose-900/60 rounded-xl flex items-center justify-center transition-colors cursor-pointer border border-rose-200 "
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

      <div className='bg-card  border border-border  rounded-3xl p-6 shadow-2xs space-y-4'>
        <div>
          <h2 className='text-lg font-black text-foreground '>نقاط النهاية — Sky Scrapper</h2>
          <p className='text-muted-foreground  text-xs mt-1'>
            القائمة من ملف التوثيق فقط. فعّل أو أوقف النقطة وحدد «تُستخدم لـ». لا مسارات مخترعة.
          </p>
        </div>
        <div className='overflow-x-auto rounded-2xl border border-border '>
          <table className="w-full min-w-[880px] text-sm">
            <thead className='bg-card-2  text-foreground  border-b border-border '>
              <tr>
                <th className="px-3 py-2.5 text-start font-bold">تفعيل</th>
                <th className="px-3 py-2.5 text-start font-bold">النقطة</th>
                <th className="px-3 py-2.5 text-start font-bold">تُستخدم لـ</th>
                <th className="px-3 py-2.5 text-start font-bold">المسار</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-admin-border-subtle  text-foreground '>
              {SKY_SCRAPPER_ENDPOINTS.map((item) => {
                const state: FlightEndpointState = runtime.endpoints[item.id] || {
                  enabled: item.defaultEnabled,
                  uses: item.uses,
                };
                return (
                  <tr key={item.id} className='hover:bg-card-2/50  transition-colors'>
                    <td className="px-3 py-2.5">
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
                        className='rounded border-border text-primary focus:ring-admin-accent'
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className='font-bold text-foreground '>{item.nameAr}</div>
                      <div className='text-[11px] text-muted-foreground ' dir="ltr">
                        {item.name}
                      </div>
                      <div className='text-[11px] text-muted-foreground  mt-0.5'>{item.descriptionAr}</div>
                    </td>
                    <td className="px-3 py-2.5">
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
                        className='bg-card  border border-border  rounded-lg px-2.5 py-1 text-foreground  text-xs font-medium shadow-2xs'
                      >
                        {FLIGHT_ENDPOINT_USES.map((use) => (
                          <option key={use} value={use}>
                            {FLIGHT_ENDPOINT_USE_AR[use]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className='px-3 py-2.5 font-mono text-[11px] text-muted-foreground ' dir="ltr">
                      <span className='font-bold text-foreground '>{item.method}</span> {SKY_SCRAPPER_HOST}
                      <span className='text-primary  font-semibold'>{item.path}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className='bg-card  border border-border  rounded-3xl p-6 shadow-2xs space-y-4'>
        <h2 className='text-lg font-black text-foreground  flex items-center gap-2'>
          <Activity size={18} className='text-secondary' />
          إحصائيات الحصة
        </h2>
        <p className='text-muted-foreground  text-xs'>
          للأدمن فقط — لا يظهر للعملاء. يُقرأ العدّاد الذي يكتبه المحرك من ترويسات RapidAPI. لا يُستدعى المزود لعرض هذا القسم.
        </p>
        <QuotaCard snap={quotaSnap} ready={skyScrapperReady} />
      </div>

      </div>
      )}
    </div>
  );
}
