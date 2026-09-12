"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, Database, GitMerge, Play, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";

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
type Job = { id?: string; kind: string; supplier?: string; destinationKey?: string; status: string; count?: number; requests?: number; startedAt?: string; finishedAt?: string; error?: string; meta?: Record<string, unknown> };
type Overview = {
  health: Health[];
  stats: { available: boolean; destinations: number; masters: number; refs: Record<string, number>; images: number; rooms: number; facilities: number; pois: number; pendingReviews: number; recentJobs: Job[] };
  state: { day: string; hotelbedsRequestsToday: number; hotelbedsCursor: { destinationKey: string; from: number; total: number } | null; lastTickAt: string | null; lastSyncAt: string | null; lastRateHawkDumpAt: string | null; ticks: number; lastResult: { at: string; durationMs: number; steps: Array<{ step: string; status: string; count?: number; detail?: string }> } | null };
  settings: { enabled: boolean; hotelbedsDailyRequestBudget: number | null; languages: string[]; travelportPerTick: number; ratehawkDump: boolean };
  providers: Array<{ id: string; enabled: boolean; mode: string; hasCredentials: boolean }>;
  cache: { ok: boolean; backend: string; error?: string };
};
type Review = { id: string; pairKey: string; a: { supplier: string; id: string; name: string }; b: { supplier: string; id: string; name: string }; distanceM: number; nameSimilarity: number; status: string; created?: string };

const SUPPLIER_LABEL: Record<string, string> = { hotelbeds: "Hotelbeds", ratehawk: "RateHawk", travelport: "Travelport", travelport_hotels: "Travelport", seeru: "Seeru", seeru_hotels: "Seeru" };

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
      const [o, r] = await Promise.all([fetch("/api/admin/hotel-supply?view=overview", { cache: "no-store" }), fetch("/api/admin/hotel-supply?view=reviews&status=pending", { cache: "no-store" })]);
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
      const res = await fetch("/api/admin/hotel-supply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
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
    <div className="admin-page w-full max-w-none min-w-0 space-y-8" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-bold">طبقة التوريد</span>
            <span className="text-xs text-muted-foreground font-mono">Hotelbeds · RateHawk · Travelport · Seeru</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-3">
            <Database className="text-sky-500 size-7" />
            صحة الموردين وقاعدة محتوى الفنادق
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">مراقبة استدعاءات الموردين، عامل استيعاب المحتوى الثابت، ومراجعة مطابقة هوية الفنادق بين الموردين.</p>
        </div>
        <Link href="/admin/hotels" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold">
          <span>إعدادات مزودي الفنادق</span>
          <ArrowLeft className="size-3.5" />
        </Link>
      </div>

      {error ? <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 text-sm text-rose-600">{error}</div> : null}

      {/* Providers + sandbox badges */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {(data?.providers || []).map((p) => {
          const h = data?.health.find((x) => x.supplier === p.id.replace("_hotels", ""));
          const sandbox = p.mode !== "production";
          return (
            <div key={p.id} className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-foreground">{SUPPLIER_LABEL[p.id] || p.id}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${sandbox ? "bg-amber-500/10 text-amber-600 border-amber-500/30" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"}`}>{sandbox ? "SANDBOX" : "PRODUCTION"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {p.enabled && p.hasCredentials ? <ShieldCheck className="size-4 text-emerald-500" /> : <ShieldAlert className="size-4 text-rose-500" />}
                <span className="text-muted-foreground">{p.enabled ? (p.hasCredentials ? "مفعّل مع بيانات اعتماد" : "مفعّل بدون بيانات اعتماد") : p.hasCredentials ? "غير مفعّل" : "بدون بيانات اعتماد"}</span>
              </div>
              {h ? (
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                  <dt className="text-muted-foreground">الاستدعاءات</dt>
                  <dd className="font-mono">{h.totalCalls}</dd>
                  <dt className="text-muted-foreground">نسبة الأخطاء</dt>
                  <dd className={`font-mono ${h.errorRate > 0.2 ? "text-rose-600" : ""}`}>{Math.round(h.errorRate * 100)}%</dd>
                  <dt className="text-muted-foreground">p95</dt>
                  <dd className="font-mono">{h.p95LatencyMs} ms</dd>
                  <dt className="text-muted-foreground">آخر نجاح</dt>
                  <dd className="font-mono">{fmtTime(h.lastOkAt)}</dd>
                  {h.lastError ? (
                    <>
                      <dt className="text-muted-foreground">آخر خطأ</dt>
                      <dd className="col-span-2 text-rose-600 break-all">{h.lastError}</dd>
                    </>
                  ) : null}
                </dl>
              ) : (
                <p className="text-[11px] text-muted-foreground">لا استدعاءات مسجلة بعد.</p>
              )}
            </div>
          );
        })}
      </section>

      {/* Content DB */}
      <section className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-black text-foreground flex items-center gap-2">
            <Database className="size-5 text-sky-500" /> قاعدة المحتوى الثابت (PocketBase)
          </h2>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] px-2 py-0.5 rounded-full border ${data?.cache.ok ? "border-emerald-500/30 text-emerald-600" : "border-rose-500/30 text-rose-600"}`}>Cache: {data?.cache.backend || "—"}</span>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => post({ action: "tick", budgetMs: 40000 }, "tick")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold disabled:opacity-50"
            >
              {busy === "tick" ? <RefreshCw className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
              تشغيل دورة استيعاب الآن
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => post({ action: "settings", patch: { enabled: !data?.settings.enabled } }, "toggle")}
              className="px-4 py-2 rounded-xl border border-border text-xs font-bold hover:bg-muted disabled:opacity-50"
            >
              {data?.settings.enabled ? "إيقاف العامل" : "تفعيل العامل"}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
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
            <div key={String(label)} className="rounded-2xl border border-border bg-muted/30 p-3 text-center">
              <div className="text-xl font-black text-foreground font-mono">{value ?? "—"}</div>
              <div className="text-[11px] text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
          <div className="rounded-2xl border border-border p-4 space-y-1.5">
            <div className="font-bold text-foreground mb-2 flex items-center gap-2">
              <Activity className="size-4 text-sky-500" /> حالة العامل
            </div>
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
              <span className="font-mono">{data?.state.hotelbedsCursor ? `${data.state.hotelbedsCursor.destinationKey} @ ${data.state.hotelbedsCursor.from}/${data.state.hotelbedsCursor.total || "?"}` : "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">آخر RateHawk dump</span>
              <span className="font-mono">{fmtTime(data?.state.lastRateHawkDumpAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">لغات المحتوى</span>
              <span className="font-mono">{data?.settings.languages.join(", ")}</span>
            </div>
            {data?.state.lastResult ? (
              <ul className="mt-2 space-y-1">
                {data.state.lastResult.steps.map((s) => (
                  <li key={s.step} className="flex items-start gap-2">
                    <span className={`mt-1 size-2 rounded-full shrink-0 ${s.status === "done" ? "bg-emerald-500" : s.status === "failed" ? "bg-rose-500" : "bg-slate-400"}`} />
                    <span className="font-mono">{s.step}</span>
                    <span className="text-muted-foreground">
                      {s.count != null ? `(${s.count}) ` : ""}
                      {s.detail || ""}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="rounded-2xl border border-border p-4">
            <div className="font-bold text-foreground mb-2">آخر المهام</div>
            <div className="space-y-1.5 max-h-64 overflow-auto">
              {(data?.stats.recentJobs || []).map((j) => (
                <div key={j.id || `${j.kind}-${j.startedAt}`} className="flex items-center justify-between gap-2 border-b border-border/60 pb-1">
                  <span className="font-mono truncate">
                    {j.kind}
                    {j.destinationKey ? ` · ${j.destinationKey}` : ""}
                  </span>
                  <span className={`px-1.5 rounded text-[10px] font-bold ${j.status === "done" ? "bg-emerald-500/10 text-emerald-600" : j.status === "failed" ? "bg-rose-500/10 text-rose-600" : "bg-slate-500/10 text-slate-600"}`}>{j.status}</span>
                  <span className="text-muted-foreground shrink-0">{j.count ?? 0} · {fmtTime(j.startedAt)}</span>
                </div>
              ))}
              {!data?.stats.recentJobs?.length ? <p className="text-muted-foreground">لا مهام بعد.</p> : null}
            </div>
          </div>
        </div>
      </section>

      {/* Identity review queue */}
      <section className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-black text-foreground flex items-center gap-2">
            <GitMerge className="size-5 text-violet-500" /> مراجعة مطابقة الهوية ({data?.stats.pendingReviews ?? 0})
          </h2>
          <button type="button" disabled={busy !== null} onClick={() => post({ action: "rebuild-orphans", limit: 1000 }, "rebuild")} className="px-4 py-2 rounded-xl border border-border text-xs font-bold hover:bg-muted disabled:opacity-50">
            إعادة تجميع الفنادق غير المربوطة
          </button>
        </div>
        <p className="text-xs text-muted-foreground">أزواج فنادق متشابهة الاسم لكن تفصل بينها مسافة 150–400 م؛ لا تُدمج تلقائياً. التأكيد يدمجها في فندق واحد، والرفض يمنع دمجها نهائياً.</p>
        {reviews.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground text-right">
                  <th className="py-2 pe-3">الفندق A</th>
                  <th className="py-2 pe-3">الفندق B</th>
                  <th className="py-2 pe-3">المسافة</th>
                  <th className="py-2 pe-3">تشابه الاسم</th>
                  <th className="py-2">القرار</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} className="border-t border-border/60">
                    <td className="py-2 pe-3">
                      <div className="font-bold">{r.a.name}</div>
                      <div className="text-muted-foreground font-mono">{SUPPLIER_LABEL[r.a.supplier] || r.a.supplier} · {r.a.id}</div>
                    </td>
                    <td className="py-2 pe-3">
                      <div className="font-bold">{r.b.name}</div>
                      <div className="text-muted-foreground font-mono">{SUPPLIER_LABEL[r.b.supplier] || r.b.supplier} · {r.b.id}</div>
                    </td>
                    <td className="py-2 pe-3 font-mono">{r.distanceM} م</td>
                    <td className="py-2 pe-3 font-mono">{Math.round(r.nameSimilarity * 100)}%</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button type="button" disabled={busy !== null} onClick={() => post({ action: "decide", id: r.id, decision: "confirmed" }, r.id)} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold disabled:opacity-50">
                          نفس الفندق
                        </button>
                        <button type="button" disabled={busy !== null} onClick={() => post({ action: "decide", id: r.id, decision: "rejected" }, r.id)} className="px-3 py-1.5 rounded-lg border border-border font-bold hover:bg-muted disabled:opacity-50">
                          فندقان مختلفان
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">لا حالات بانتظار المراجعة.</p>
        )}
      </section>
    </div>
  );
}
