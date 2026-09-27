"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, Database, GitMerge, Play, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { AdminPage, AdminPageHeader } from "@/components/admin/layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Health = {
  supplier: string;
  totalCalls: number;
  okCalls: number;
  errorRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  lastCallAt: string | null;
  lastOkAt: string | null;
  lastError: string | null;
  lastErrorAt: string | null;
  lastResultCount: number | null;
};
type Job = {
  id?: string;
  kind: string;
  supplier?: string;
  destinationKey?: string;
  status: string;
  count?: number;
  requests?: number;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
  meta?: Record<string, unknown>;
};
type Overview = {
  health: Health[];
  stats: {
    available: boolean;
    destinations: number;
    masters: number;
    refs: Record<string, number>;
    images: number;
    rooms: number;
    facilities: number;
    pois: number;
    pendingReviews: number;
    recentJobs: Job[];
  };
  state: {
    day: string;
    hotelbedsRequestsToday: number;
    hotelbedsCursor: { destinationKey: string; from: number; total: number } | null;
    lastTickAt: string | null;
    lastSyncAt: string | null;
    lastRateHawkDumpAt: string | null;
    ticks: number;
    lastResult: { at: string; durationMs: number; steps: Array<{ step: string; status: string; count?: number; detail?: string }> } | null;
  };
  settings: { enabled: boolean; hotelbedsDailyRequestBudget: number | null; languages: string[]; travelportPerTick: number; ratehawkDump: boolean };
  providers: Array<{ id: string; enabled: boolean; mode: string; hasCredentials: boolean }>;
  cache: { ok: boolean; backend: string; error?: string };
};
type Review = {
  id: string;
  pairKey: string;
  a: { supplier: string; id: string; name: string };
  b: { supplier: string; id: string; name: string };
  distanceM: number;
  nameSimilarity: number;
  status: string;
  created?: string;
};

const SUPPLIER_LABEL: Record<string, string> = {
  hotelbeds: "Hotelbeds",
  ratehawk: "RateHawk",
  travelport: "Travelport",
  travelport_hotels: "Travelport",
  seeru: "Seeru",
  seeru_hotels: "Seeru",
};

function fmtTime(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("ar", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function HotelSupplyAdminPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [o, r] = await Promise.all([
        fetch("/api/admin/hotel-supply?view=overview", { cache: "no-store" }),
        fetch("/api/admin/hotel-supply?view=reviews&status=pending", { cache: "no-store" }),
      ]);
      const oj = await o.json();
      const rj = await r.json();
      if (!o.ok || !oj.ok) throw new Error(oj.error || `HTTP ${o.status}`);
      setData(oj);
      setReviews(rj.items || []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل التحميل");
    }
  }, []);

  useEffect(() => {
    void load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  const post = async (body: Record<string, unknown>, key: string) => {
    setBusy(key);
    try {
      const res = await fetch("/api/admin/hotel-supply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error || `HTTP ${res.status}`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل التنفيذ");
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminPage className="flex flex-col gap-6" dir="rtl">
      <AdminPageHeader
        breadcrumb={
          <span>
            لوحة التحكم <span className="mx-1 opacity-50">/</span> الفنادق{" "}
            <span className="mx-1 opacity-50">/</span> صحة الموردين
          </span>
        }
        icon={<Database className="size-5" />}
        title="صحة الموردين وقاعدة محتوى الفنادق"
        description="مراقبة استدعاءات الموردين، عامل استيعاب المحتوى الثابت، ومراجعة مطابقة هوية الفنادق بين الموردين."
        actions={
          <Button variant="outline" asChild>
            <Link href="/admin/hotels">
              إعدادات مزودي الفنادق
              <ArrowLeft className="size-3.5" />
            </Link>
          </Button>
        }
      />

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>تعذر التحميل أو التنفيذ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {!data ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(data.providers || []).map((p) => {
            const h = data.health.find((x) => x.supplier === p.id.replace("_hotels", ""));
            const sandbox = p.mode !== "production";
            return (
              <Card key={p.id}>
                <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
                  <CardTitle className="text-base">{SUPPLIER_LABEL[p.id] || p.id}</CardTitle>
                  <Badge variant={sandbox ? "outline" : "secondary"}>{sandbox ? "SANDBOX" : "PRODUCTION"}</Badge>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="flex items-center gap-2">
                    {p.enabled && p.hasCredentials ? (
                      <ShieldCheck className="size-4 text-emerald-500" />
                    ) : (
                      <ShieldAlert className="size-4 text-rose-500" />
                    )}
                    <span className="text-muted-foreground">
                      {p.enabled
                        ? p.hasCredentials
                          ? "مفعّل مع بيانات اعتماد"
                          : "مفعّل بدون بيانات اعتماد"
                        : p.hasCredentials
                          ? "غير مفعّل"
                          : "بدون بيانات اعتماد"}
                    </span>
                  </div>
                  {h ? (
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
                      <dt className="text-muted-foreground">الاستدعاءات</dt>
                      <dd className="font-mono">{h.totalCalls}</dd>
                      <dt className="text-muted-foreground">نسبة الأخطاء</dt>
                      <dd className={`font-mono ${h.errorRate > 0.2 ? "text-rose-600" : ""}`}>
                        {Math.round(h.errorRate * 100)}%
                      </dd>
                      <dt className="text-muted-foreground">p95</dt>
                      <dd className="font-mono">{h.p95LatencyMs} ms</dd>
                      <dt className="text-muted-foreground">آخر نجاح</dt>
                      <dd className="font-mono">{fmtTime(h.lastOkAt)}</dd>
                      {h.lastError ? (
                        <>
                          <dt className="text-muted-foreground">آخر خطأ</dt>
                          <dd className="col-span-2 break-all text-rose-600">{h.lastError}</dd>
                        </>
                      ) : null}
                    </dl>
                  ) : (
                    <p className="text-muted-foreground">لا استدعاءات مسجلة بعد.</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader className="flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-5" />
              قاعدة المحتوى الثابت (PocketBase)
            </CardTitle>
            <CardDescription>الأرقام من المحرك الحي. العامل يستوعب المحتوى دون اختراع جداول.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={data?.cache.ok ? "secondary" : "outline"}>
              Cache: {data?.cache.backend || "—"}
            </Badge>
            <Button
              type="button"
              disabled={busy !== null}
              onClick={() => post({ action: "tick", budgetMs: 40000 }, "tick")}
            >
              {busy === "tick" ? <RefreshCw className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
              تشغيل دورة استيعاب الآن
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy !== null}
              onClick={() => post({ action: "settings", patch: { enabled: !data?.settings.enabled } }, "toggle")}
            >
              {data?.settings.enabled ? "إيقاف العامل" : "تفعيل العامل"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
            {[
              ["وجهات", data?.stats.destinations],
              ["فنادق موحدة", data?.stats.masters],
              ["Hotelbeds", data?.stats.refs?.hotelbeds],
              ["RateHawk", data?.stats.refs?.ratehawk],
              ["Travelport", data?.stats.refs?.travelport],
              ["صور", data?.stats.images],
              ["غرف", data?.stats.rooms],
              ["مرافق", data?.stats.facilities],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-lg border bg-muted/40 p-3 text-center">
                <div className="font-mono text-xl font-semibold tabular-nums">{value ?? "—"}</div>
                <div className="text-[11px] text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="size-4" />
                  حالة العامل
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">آخر دورة</span>
                  <span className="font-mono">{fmtTime(data?.state.lastTickAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">طلبات Hotelbeds اليوم</span>
                  <span className="font-mono">
                    {data?.state.hotelbedsRequestsToday ?? 0} / {data?.settings.hotelbedsDailyRequestBudget ?? "تلقائي"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">مؤشر Hotelbeds</span>
                  <span className="font-mono">
                    {data?.state.hotelbedsCursor
                      ? `${data.state.hotelbedsCursor.destinationKey} @ ${data.state.hotelbedsCursor.from}/${data.state.hotelbedsCursor.total || "?"}`
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">آخر RateHawk dump</span>
                  <span className="font-mono">{fmtTime(data?.state.lastRateHawkDumpAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">لغات المحتوى</span>
                  <span className="font-mono">{data?.settings.languages.join(", ") || "—"}</span>
                </div>
                {data?.state.lastResult ? (
                  <ul className="mt-2 space-y-1">
                    {data.state.lastResult.steps.map((s) => (
                      <li key={s.step} className="flex items-start gap-2">
                        <span
                          className={`mt-1 size-2 shrink-0 rounded-full ${
                            s.status === "done" ? "bg-emerald-500" : s.status === "failed" ? "bg-rose-500" : "bg-slate-400"
                          }`}
                        />
                        <span className="font-mono">{s.step}</span>
                        <span className="text-muted-foreground">
                          {s.count != null ? `(${s.count}) ` : ""}
                          {s.detail || ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">آخر المهام</CardTitle>
              </CardHeader>
              <CardContent className="px-0">
                {(data?.stats.recentJobs || []).length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المهمة</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>العدد</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(data?.stats.recentJobs || []).map((j) => (
                        <TableRow key={j.id || `${j.kind}-${j.startedAt}`}>
                          <TableCell className="font-mono text-xs">
                            {j.kind}
                            {j.destinationKey ? ` · ${j.destinationKey}` : ""}
                          </TableCell>
                          <TableCell>
                            <Badge variant={j.status === "done" ? "secondary" : "outline"}>{j.status}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {j.count ?? 0} · {fmtTime(j.startedAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <Empty className="mx-4 mb-4">
                    <EmptyHeader>
                      <EmptyTitle>لا مهام بعد</EmptyTitle>
                      <EmptyDescription>تظهر المهام هنا بعد أول دورة استيعاب.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitMerge className="size-5" />
              مراجعة مطابقة الهوية ({data?.stats.pendingReviews ?? 0})
            </CardTitle>
            <CardDescription>
              أزواج فنادق متشابهة الاسم لكن تفصل بينها مسافة 150–400 م؛ لا تُدمج تلقائياً. التأكيد يدمجها في فندق واحد، والرفض يمنع دمجها نهائياً.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={busy !== null}
            onClick={() => post({ action: "rebuild-orphans", limit: 1000 }, "rebuild")}
          >
            إعادة تجميع الفنادق غير المربوطة
          </Button>
        </CardHeader>
        <CardContent className="px-0">
          {reviews.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الفندق A</TableHead>
                  <TableHead>الفندق B</TableHead>
                  <TableHead>المسافة</TableHead>
                  <TableHead>تشابه الاسم</TableHead>
                  <TableHead>القرار</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="font-semibold">{r.a.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {SUPPLIER_LABEL[r.a.supplier] || r.a.supplier} · {r.a.id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">{r.b.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {SUPPLIER_LABEL[r.b.supplier] || r.b.supplier} · {r.b.id}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{r.distanceM} م</TableCell>
                    <TableCell className="font-mono">{Math.round(r.nameSimilarity * 100)}%</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={busy !== null}
                          onClick={() => post({ action: "decide", id: r.id, decision: "confirmed" }, r.id)}
                        >
                          نفس الفندق
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={busy !== null}
                          onClick={() => post({ action: "decide", id: r.id, decision: "rejected" }, r.id)}
                        >
                          فندقان مختلفان
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Empty className="mx-6 mb-6">
              <EmptyHeader>
                <EmptyTitle>لا حالات بانتظار المراجعة</EmptyTitle>
                <EmptyDescription>عند ظهور أزواج متشابهة ستظهر هنا للقرار اليدوي.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </AdminPage>
  );
}
