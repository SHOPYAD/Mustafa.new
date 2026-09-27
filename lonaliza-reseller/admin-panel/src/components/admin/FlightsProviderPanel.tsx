"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Loader2, Plus, Save, Trash2 } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const inputClass = "admin-field";

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
  return active ? "admin-btn-primary" : "admin-btn-secondary";
}

function QuotaDesk({
  snap,
  ready,
}: {
  snap: QuotaSnapshot | null;
  ready: boolean;
}) {
  if (!ready || !snap) {
    return (
      <p className="text-sm text-[color:var(--admin-text-muted)]">
        لا مفتاح محفوظ — لا إحصاء. يظهر العداد بعد أول طلب حي يكتبه المحرك.
      </p>
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
  const rows = [
    { label: "المستهلك", value: usedFromHeader != null ? String(usedFromHeader) : "—" },
    { label: "المتبقي", value: snap.headerRemaining != null ? String(snap.headerRemaining) : "—" },
    { label: "الحد", value: snap.headerLimit != null ? String(snap.headerLimit) : "—" },
    { label: "طلبات حية", value: String(snap.liveCalls) },
    { label: "نجاح / فشل / 429", value: `${snap.success} / ${snap.failed} / ${snap.quota429}` },
    { label: "إعادة التعيين", value: snap.headerReset ? formatWhen(snap.headerReset) : "—" },
  ];
  return (
    <div className="space-y-3">
      <p className="text-xs text-[color:var(--admin-text-muted)]">
        Sky Scrapper — نافذة {snap.monthKey} (UTC)
      </p>
      <div className="admin-kpi-strip" style={{ ["--admin-kpi-cols" as string]: "6" }}>
        {rows.map((row) => (
          <div key={row.label} className="admin-kpi">
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-[color:var(--admin-text-muted)]">
              {row.label}
            </p>
            <p className="admin-kpi-value">{row.value}</p>
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>آخر طلب</TableHead>
              <TableHead>HTTP</TableHead>
              <TableHead>المسار</TableHead>
              <TableHead>آخر 429</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell dir="ltr">{formatWhen(snap.lastCallAt)}</TableCell>
              <TableCell>{snap.lastHttpStatus != null ? snap.lastHttpStatus : "—"}</TableCell>
              <TableCell dir="ltr">{snap.lastCallPath || "—"}</TableCell>
              <TableCell dir="ltr">
                {snap.last429At
                  ? `${formatWhen(snap.last429At)}${snap.last429Path ? ` — ${snap.last429Path}` : ""}`
                  : "لا 429"}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className="grid gap-3 md:hidden">
        <article className="rounded-xl border bg-card p-4 shadow-sm">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 text-sm">
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </article>
      </div>
      {!snap.headerSeen ? (
        <p className="text-xs text-[color:var(--admin-text-muted)]">
          الأرقام الدقيقة للمتبقي والحد تأتي من ترويسات RapidAPI بعد أول جلب حي يكتبه المحرك — لا يُستدعى المزود من هنا.
        </p>
      ) : null}
      {nearEnd || snap.advice.changeKey ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm">
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[color:var(--admin-text-muted)]">{t.admin.flightsAdminSubtitle}</p>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={loading || saving}
          className="admin-btn-primary disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          حفظ المارك أب والنقاط
        </button>
      </div>
      {message ? <p className="text-sm text-[color:var(--admin-text-muted)]">{message}</p> : null}

      {loading ? (
        <div className="grid gap-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : (
      <div className="space-y-6">
      <ProvidersHub vertical="flights" onLiveChange={() => void load()} />

      {runtime.providers.includes("live") && runtime.providers.includes("travelpayouts") ? (
      <Card>
        <CardHeader>
          <CardTitle>مصدر عروض الصفحة الرئيسية</CardTitle>
        </CardHeader>
        <CardContent>
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
        <p className="mt-2 text-xs text-admin-text-muted">
          الكاش يُحدَّث 4 مرات يومياً. بلاطات العروض مصدر واحد فقط — لا خلط.
        </p>
        </CardContent>
      </Card>
      ) : null}

      <Card className="space-y-0">
        <CardHeader>
          <CardTitle>{t.admin.flightsMarkupTitle}</CardTitle>
          <CardDescription>{t.admin.flightsMarkupSectionHint}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            type="button"
            onClick={() =>
              applyRuntime({
                ...runtime,
                markupRules: [...runtime.markupRules, createEmptyMarkupRule()],
              })
            }
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-admin-bg-subtle text-foreground text-sm font-semibold"
          >
            <Plus size={14} />
            إضافة قاعدة
          </button>

        {runtime.markupRules.length === 0 ? (
          <p className="text-admin-text-muted text-sm">لا قواعد بعد — السعر الحي يُعرض كما هو حتى تضيف مارك أب.</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>تفعيل</TableHead>
                    <TableHead>{t.admin.flightsMarkupPriority}</TableHead>
                    <TableHead>{t.admin.flightsMarkupScope}</TableHead>
                    <TableHead>الأصل</TableHead>
                    <TableHead>الوجهة</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>القيمة</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runtime.markupRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={(e) => updateMarkup(rule.id, { enabled: e.target.checked })}
                        />
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        {rule.scope === "all" ? (
                          <span className="text-xs text-[color:var(--admin-text-muted)]">
                            {t.admin.flightsMarkupAllApplies}
                          </span>
                        ) : (
                          <input
                            type="text"
                            value={rule.origin}
                            onChange={(e) => updateMarkup(rule.id, { origin: e.target.value })}
                            className={inputClass}
                            placeholder="TR أو IST"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {rule.scope === "all" ? (
                          <span className="text-xs text-[color:var(--admin-text-muted)]">—</span>
                        ) : (
                          <input
                            type="text"
                            value={rule.destination}
                            onChange={(e) => updateMarkup(rule.id, { destination: e.target.value })}
                            className={inputClass}
                            placeholder="اختياري / LHR"
                          />
                        )}
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() =>
                            applyRuntime({
                              ...runtime,
                              markupRules: runtime.markupRules.filter((item) => item.id !== rule.id),
                            })
                          }
                          className="admin-btn-danger px-2 py-2"
                          title="حذف القاعدة"
                        >
                          <Trash2 size={14} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="grid gap-3 md:hidden">
              {runtime.markupRules.map((rule) => (
                <article key={rule.id} className="rounded-xl border bg-card p-4 shadow-sm">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => updateMarkup(rule.id, { enabled: e.target.checked })}
                    />
                    تفعيل
                  </label>
                  <div>
                    <label className="admin-field-label">{t.admin.flightsMarkupPriority}</label>
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
                  </div>
                  <div>
                    <label className="admin-field-label">{t.admin.flightsMarkupScope}</label>
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
                  {rule.scope !== "all" ? (
                    <>
                      <div>
                        <label className="admin-field-label">الأصل / الدولة</label>
                        <input
                          type="text"
                          value={rule.origin}
                          onChange={(e) => updateMarkup(rule.id, { origin: e.target.value })}
                          className={inputClass}
                          placeholder="TR أو IST"
                        />
                      </div>
                      <div>
                        <label className="admin-field-label">الوجهة</label>
                        <input
                          type="text"
                          value={rule.destination}
                          onChange={(e) => updateMarkup(rule.id, { destination: e.target.value })}
                          className={inputClass}
                          placeholder="اختياري / LHR"
                        />
                      </div>
                    </>
                  ) : null}
                  <div>
                    <label className="admin-field-label">النوع</label>
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
                  <button
                    type="button"
                    onClick={() =>
                      applyRuntime({
                        ...runtime,
                        markupRules: runtime.markupRules.filter((item) => item.id !== rule.id),
                      })
                    }
                    className="admin-btn-danger"
                  >
                    <Trash2 size={14} />
                    حذف القاعدة
                  </button>
                </article>
              ))}
            </div>
          </>
        )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>نقاط النهاية — Sky Scrapper</CardTitle>
          <CardDescription>
            القائمة من ملف التوثيق فقط. فعّل أو أوقف النقطة وحدد «تُستخدم لـ». لا مسارات مخترعة.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>تفعيل</TableHead>
                <TableHead>النقطة</TableHead>
                <TableHead>تُستخدم لـ</TableHead>
                <TableHead>المسار</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SKY_SCRAPPER_ENDPOINTS.map((item) => {
                const state: FlightEndpointState = runtime.endpoints[item.id] || {
                  enabled: item.defaultEnabled,
                  uses: item.uses,
                };
                return (
                  <TableRow key={item.id}>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.nameAr}</div>
                      <div className="text-[11px] text-[color:var(--admin-text-muted)]" dir="ltr">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-[color:var(--admin-text-muted)] mt-0.5">
                        {item.descriptionAr}
                      </div>
                    </TableCell>
                    <TableCell>
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
                        className="admin-field text-xs"
                      >
                        {FLIGHT_ENDPOINT_USES.map((use) => (
                          <option key={use} value={use}>
                            {FLIGHT_ENDPOINT_USE_AR[use]}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-[color:var(--admin-text-muted)]" dir="ltr">
                      {item.method} {SKY_SCRAPPER_HOST}
                      {item.path}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="grid gap-3 md:hidden">
          {SKY_SCRAPPER_ENDPOINTS.map((item) => {
            const state: FlightEndpointState = runtime.endpoints[item.id] || {
              enabled: item.defaultEnabled,
              uses: item.uses,
            };
            return (
              <article key={item.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <label className="flex items-center gap-2 text-sm">
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
                  {item.nameAr}
                </label>
                <p className="text-[11px] text-[color:var(--admin-text-muted)]" dir="ltr">
                  {item.name}
                </p>
                <p className="text-[11px] text-[color:var(--admin-text-muted)]">{item.descriptionAr}</p>
                <div>
                  <label className="admin-field-label">تُستخدم لـ</label>
                  <select
                    value={state.uses}
                    onChange={(e) =>
                      applyRuntime({
                        ...runtime,
                        endpoints: {
                          ...runtime.endpoints,
                          [item.id]: { ...state, uses: e.target.value as FlightEndpointUse },
                        },
                      })
                    }
                    className="admin-field text-xs"
                  >
                    {FLIGHT_ENDPOINT_USES.map((use) => (
                      <option key={use} value={use}>
                        {FLIGHT_ENDPOINT_USE_AR[use]}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="font-mono text-[11px] text-[color:var(--admin-text-muted)]" dir="ltr">
                  {item.method} {SKY_SCRAPPER_HOST}
                  {item.path}
                </p>
              </article>
            );
          })}
        </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إحصائيات الحصة</CardTitle>
          <CardDescription>
            للأدمن فقط — لا يظهر للعملاء. يُقرأ العدّاد الذي يكتبه المحرك من ترويسات RapidAPI. لا يُستدعى المزود لعرض هذا القسم.
          </CardDescription>
        </CardHeader>
        <CardContent>
        <QuotaDesk snap={quotaSnap} ready={skyScrapperReady} />
        </CardContent>
      </Card>

      </div>
      )}
    </div>
  );
}
