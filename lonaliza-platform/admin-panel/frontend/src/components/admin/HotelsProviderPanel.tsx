"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Loader2, MoreHorizontal, Plus, Save, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

const inputClass = "admin-field";

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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription dir="ltr">{host}</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <div className="hidden md:block">
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
              {catalog.map((item) => {
                const state: HotelEndpointState = states[item.id] || {
                  enabled: item.defaultEnabled,
                  uses: item.uses,
                };
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={state.enabled}
                        onChange={(e) => onChange(item.id, { ...state, enabled: e.target.checked })}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{item.nameAr}</div>
                      <div className="text-[11px] text-muted-foreground" dir="ltr">
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-muted-foreground" dir="ltr">
                      {item.method} {item.path}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="grid gap-3 px-4 md:hidden">
          {catalog.map((item) => {
            const state: HotelEndpointState = states[item.id] || {
              enabled: item.defaultEnabled,
              uses: item.uses,
            };
            return (
              <Card key={item.id}>
                <CardContent className="flex flex-col gap-2 pt-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={state.enabled}
                      onChange={(e) => onChange(item.id, { ...state, enabled: e.target.checked })}
                    />
                    {item.nameAr}
                  </label>
                  <p className="text-[11px] text-muted-foreground" dir="ltr">
                    {item.name}
                  </p>
                  <select
                    value={state.uses}
                    onChange={(e) =>
                      onChange(item.id, { ...state, uses: e.target.value as HotelEndpointUse })
                    }
                    className={inputClass}
                  >
                    {HOTEL_ENDPOINT_USES.map((use) => (
                      <option key={use} value={use}>
                        {HOTEL_ENDPOINT_USE_AR[use]}
                      </option>
                    ))}
                  </select>
                  <p className="font-mono text-[11px] text-muted-foreground" dir="ltr">
                    {item.method} {item.path}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function formatWhen(value: string | null): string {
  if (!value) return "لا يوجد";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return date.toLocaleString("ar-EG", { hour12: false });
}

function QuotaProviderDesk({
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
      <p className="text-sm text-[color:var(--admin-text-muted)]">
        {title}: لا مفتاح محفوظ — لا إحصاء.
      </p>
    );
  }
  const usedFromHeader =
    snap.headerSeen && snap.headerLimit != null && snap.headerRemaining != null
      ? Math.max(0, snap.headerLimit - snap.headerRemaining)
      : null;
  const rows = [
    { label: "طلبات حية", value: String(snap.liveCalls) },
    { label: "نجاح / فشل / 429", value: `${snap.success} / ${snap.failed} / ${snap.quota429}` },
    { label: "المستهلك", value: usedFromHeader != null ? String(usedFromHeader) : "—" },
    { label: "المتبقي", value: snap.headerRemaining != null ? String(snap.headerRemaining) : "—" },
    { label: "الحد", value: snap.headerLimit != null ? String(snap.headerLimit) : "—" },
    { label: "إعادة التعيين", value: snap.headerReset ? formatWhen(snap.headerReset) : "—" },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {title} — نافذة {snap.monthKey} (UTC)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {rows.map((row) => (
            <div key={row.label} className="rounded-lg border bg-muted/40 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {row.label}
              </p>
              <p className="mt-1 font-mono text-sm font-semibold tabular-nums">{row.value}</p>
            </div>
          ))}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>آخر استدعاء</TableHead>
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
        {!snap.headerSeen ? (
          <p className="text-xs text-muted-foreground">
            الرقم الدقيق للمتبقي يأتي من ترويسة RapidAPI عندما تتوفر بعد أول جلب حي.
          </p>
        ) : null}
        {snap.advice.changeKey ? (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm">
            غيّر المفتاح — {snap.advice.reason}
          </p>
        ) : null}
      </CardContent>
    </Card>
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
  const [markupSheetId, setMarkupSheetId] = useState<string | null>(null);
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
      <div className="grid gap-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const markupRule = runtime.markupRules.find((rule) => rule.id === markupSheetId) || null;

  return (
    <div className="mb-8 space-y-6">
      <ProvidersHub vertical="hotels" onLiveChange={() => void load()} />

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>نقاط النهاية — RapidAPI</CardTitle>
            <CardDescription>
              البحث العام يبقى على الموردين الحيّين (Travelport وغيره). RapidAPI هنا للتقييمات فقط:
              عند فتح تفاصيل فندق نطابق اسمه ونمرّر المعرّف الذي يتوقعه Booking أو Travel Advisor، ثم
              نجلب تقييمات ذلك الفندق.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => applyRuntime(applyReviewsOnlyHotelsRuntime(runtime))}
          >
            تفعيل التقييمات فقط
          </Button>
        </CardHeader>
      </Card>
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

      <Card id="markup" className="scroll-mt-24">
        <CardHeader className="flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{t.admin.hotelsMarkupTitle}</CardTitle>
            <CardDescription>{t.admin.hotelsMarkupSectionHint}</CardDescription>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              const rule = createEmptyHotelMarkupRule();
              applyRuntime({
                ...runtime,
                markupRules: [...runtime.markupRules, rule],
              });
              setMarkupSheetId(rule.id);
            }}
          >
            <Plus size={14} />
            {t.admin.hotelsMarkupAddRule}
          </Button>
        </CardHeader>
        <CardContent className="px-0">
          {runtime.markupRules.length === 0 ? (
            <Empty className="mx-6 mb-6">
              <EmptyHeader>
                <EmptyTitle>{t.admin.hotelsMarkupEmpty}</EmptyTitle>
                <EmptyDescription>أضيفوا قاعدة مارك أب ثم احفظوا الإعدادات.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.admin.hotelsMarkupEnable}</TableHead>
                      <TableHead>{t.admin.flightsMarkupPriority}</TableHead>
                      <TableHead>{t.admin.flightsMarkupScope}</TableHead>
                      <TableHead>الهدف</TableHead>
                      <TableHead>{t.admin.hotelsMarkupType}</TableHead>
                      <TableHead>{t.admin.hotelsMarkupValue}</TableHead>
                      <TableHead className="w-12" />
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
                        <TableCell className="tabular-nums">{rule.priority}</TableCell>
                        <TableCell>
                          {rule.scope === "all"
                            ? t.admin.flightsMarkupScopeAll
                            : rule.scope === "country"
                              ? t.admin.flightsMarkupScopeCountry
                              : rule.scope === "city"
                                ? t.admin.flightsMarkupScopeCity
                                : t.admin.hotelsMarkupScopeProvider}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {rule.scope === "all"
                            ? t.admin.hotelsMarkupAllApplies
                            : rule.scope === "provider"
                              ? rule.provider || "—"
                              : rule.destination || "—"}
                        </TableCell>
                        <TableCell>
                          {rule.type === "percent" ? t.admin.hotelsMarkupPercent : t.admin.hotelsMarkupFixed}
                        </TableCell>
                        <TableCell className="font-mono tabular-nums">
                          {rule.value}
                          {rule.type === "percent" ? "%" : ` ${rule.currency || ""}`}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button type="button" variant="ghost" size="icon-sm">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setMarkupSheetId(rule.id)}>
                                إعدادات القاعدة
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() =>
                                  applyRuntime({
                                    ...runtime,
                                    markupRules: runtime.markupRules.filter((item) => item.id !== rule.id),
                                  })
                                }
                              >
                                {t.admin.hotelsMarkupDelete}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="grid gap-3 px-6 pb-6 md:hidden">
                {runtime.markupRules.map((rule) => (
                  <Card key={rule.id}>
                    <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
                      <div>
                        <CardTitle className="text-sm">
                          {rule.scope === "all"
                            ? t.admin.flightsMarkupScopeAll
                            : rule.scope === "provider"
                              ? rule.provider || t.admin.hotelsMarkupScopeProvider
                              : rule.destination || rule.scope}
                        </CardTitle>
                        <CardDescription>
                          أولوية {rule.priority} · {rule.type === "percent" ? `${rule.value}%` : `${rule.value} ${rule.currency}`}
                        </CardDescription>
                      </div>
                      <Badge variant={rule.enabled ? "secondary" : "outline"}>
                        {rule.enabled ? t.admin.hotelsMarkupEnable : "متوقف"}
                      </Badge>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => setMarkupSheetId(rule.id)}>
                        إعدادات
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          applyRuntime({
                            ...runtime,
                            markupRules: runtime.markupRules.filter((item) => item.id !== rule.id),
                          })
                        }
                      >
                        <Trash2 size={14} />
                        {t.admin.hotelsMarkupDelete}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Sheet open={Boolean(markupRule)} onOpenChange={(open) => !open && setMarkupSheetId(null)}>
        <SheetContent side="left" className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>إعداد قاعدة المارك أب</SheetTitle>
            <SheetDescription>نفس الحقول السابقة — تُحفظ مع زر حفظ الموصلات.</SheetDescription>
          </SheetHeader>
          {markupRule ? (
            <div className="grid gap-4 px-4 pb-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={markupRule.enabled}
                  onChange={(e) => updateMarkup(markupRule.id, { enabled: e.target.checked })}
                />
                {t.admin.hotelsMarkupEnable}
              </label>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{t.admin.flightsMarkupPriority}</label>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={markupRule.priority}
                  onChange={(e) => updateMarkup(markupRule.id, { priority: Number(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{t.admin.flightsMarkupScope}</label>
                <select
                  value={markupRule.scope}
                  onChange={(e) => updateMarkup(markupRule.id, { scope: e.target.value as HotelMarkupScope })}
                  className={inputClass}
                >
                  <option value="all">{t.admin.flightsMarkupScopeAll}</option>
                  <option value="country">{t.admin.flightsMarkupScopeCountry}</option>
                  <option value="city">{t.admin.flightsMarkupScopeCity}</option>
                  <option value="provider">{t.admin.hotelsMarkupScopeProvider}</option>
                </select>
              </div>
              {markupRule.scope === "provider" ? (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">المورد</label>
                  <select
                    value={markupRule.provider}
                    onChange={(e) => updateMarkup(markupRule.id, { provider: e.target.value })}
                    className={inputClass}
                  >
                    <option value="booking">Booking.com15</option>
                    <option value="seeru">Seeru Hotels</option>
                    <option value="travel_advisor">Travel Advisor</option>
                    <option value="owned">{t.admin.hotelsMarkupProviderOwned}</option>
                    <option value="internal">{t.admin.hotelsMarkupProviderInternal}</option>
                  </select>
                </div>
              ) : markupRule.scope !== "all" ? (
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">الهدف</label>
                  <Input
                    type="text"
                    value={markupRule.destination}
                    onChange={(e) => updateMarkup(markupRule.id, { destination: e.target.value })}
                    placeholder={markupRule.scope === "country" ? "TR / Turkey" : "Istanbul"}
                  />
                </div>
              ) : null}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{t.admin.hotelsMarkupType}</label>
                <select
                  value={markupRule.type}
                  onChange={(e) => updateMarkup(markupRule.id, { type: e.target.value as HotelMarkupType })}
                  className={inputClass}
                >
                  <option value="percent">{t.admin.hotelsMarkupPercent}</option>
                  <option value="fixed">{t.admin.hotelsMarkupFixed}</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{t.admin.hotelsMarkupValue}</label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={markupRule.value}
                    onChange={(e) => updateMarkup(markupRule.id, { value: Number(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">العملة</label>
                  <Input
                    type="text"
                    value={markupRule.currency}
                    onChange={(e) => updateMarkup(markupRule.id, { currency: e.target.value })}
                    placeholder="USD"
                  />
                </div>
              </div>
            </div>
          ) : null}
          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => setMarkupSheetId(null)}>
              إغلاق
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={18} />
            إحصائيات استهلاك الحصة
          </CardTitle>
          <CardDescription>
            للأدمن فقط. يُحدَّث عند كل جلب حي — لا يُستدعى RapidAPI لعرض هذا القسم.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <QuotaProviderDesk
            title="Booking.com15"
            snap={quotaStats?.booking || null}
            ready={roomsKeyConfigured}
          />
          <QuotaProviderDesk
            title="Travel Advisor"
            snap={quotaStats?.travel_advisor || null}
            ready={apiReady}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={() => void handleSave()} disabled={saving}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          حفظ
        </Button>
        <Button type="button" variant="outline" onClick={() => void handlePurgeListCache()} disabled={saving}>
          مسح كاش قوائم السيرفر
        </Button>
        {message ? <span className="text-sm text-muted-foreground">{message}</span> : null}
      </div>
    </div>
  );
}
