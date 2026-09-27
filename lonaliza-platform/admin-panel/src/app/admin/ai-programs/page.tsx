"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bookmark,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
} from "lucide-react";
import type { SavedAiProgram } from "@/types/ai-program";

function formatUsd(amount: number) {
  return `USD ${Math.round(amount || 0).toLocaleString()}`;
}

export default function AdminAiProgramsPage() {
  const [programs, setPrograms] = useState<SavedAiProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const res = await fetch("/api/admin/ai-programs", { cache: "no-store" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "فشل التحميل");
      setPrograms(Array.isArray(data.programs) ? data.programs : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل التحميل");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const hide = async (program: SavedAiProgram) => {
    setBusyId(program.id);
    try {
      const res = await fetch("/api/admin/ai-programs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: program.id, hidden: !program.hidden }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "فشل التحديث");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل التحديث");
    } finally {
      setBusyId("");
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("حذف هذا البرنامج نهائياً؟")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/ai-programs?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "فشل الحذف");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل الحذف");
    } finally {
      setBusyId("");
    }
  };

  const activeCount = programs.filter((p) => !p.hidden).length;
  const hiddenCount = programs.filter((p) => p.hidden).length;
  const avgCost = programs.length
    ? programs.reduce((sum, p) => sum + (p.priceFromUsd || 0), 0) / programs.length
    : 0;

  return (
    <div className="admin-page w-full max-w-none min-w-0" dir="rtl">
      <div className="mb-6">
        <h1 className='flex items-center gap-3 text-3xl font-bold text-foreground'>
          <Bookmark className="text-emerald-400" size={28} />
          برامج المساعد الذكي (AI Travel Itineraries)
        </h1>
        <p className='mt-1 text-muted-foreground'>
          البرامج المحفوظة تظهر لكل الزوار في{" "}
          <code className='rounded bg-foreground/5 px-1.5 py-0.5 text-emerald-400 font-mono'>
            /ai-chat
          </code>{" "}
          حتى حذفها أو إخفائها.
        </p>
      </div>

      {/* Real KPI Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>إجمالي البرامج المحفوظة</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">
            {programs.length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            برامج سياحية صممت بالذكاء الاصطناعي
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>البرامج المعروضة للزوار</span>
            <Eye className="size-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">
            {activeCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">تظهر في صفحة /ai-chat</div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>البرامج المخفية</span>
            <EyeOff className="size-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">
            {hiddenCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">مستثناة من العرض العام</div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>متوسط تكلفة البرنامج</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">USD</span>
          </div>
          <div className="text-2xl font-black text-foreground font-mono">
            {formatUsd(avgCost)}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">شامل الفنادق والجولات</div>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="animate-spin" size={18} />
          جاري التحميل...
        </div>
      ) : programs.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-muted-foreground">
          لا توجد برامج محفوظة بعد.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          <table className="w-full text-sm">
            <thead className="bg-muted/70 text-muted-foreground font-semibold border-b border-border text-xs">
              <tr>
                <th className="px-4 py-3 text-start">البرنامج</th>
                <th className="px-4 py-3 text-start">الوجهة</th>
                <th className="px-4 py-3 text-start">ليالٍ</th>
                <th className="px-4 py-3 text-start">السعر</th>
                <th className="px-4 py-3 text-start">الحالة</th>
                <th className="px-4 py-3 text-start">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {programs.map((program) => (
                <tr key={program.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{program.titleAr}</p>
                    <p className="text-xs text-muted-foreground">{program.titleEn}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground font-mono" dir="ltr">
                      {program.id}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-foreground">{program.destination}</td>
                  <td className="px-4 py-3 font-mono text-foreground">{program.nights}</td>
                  <td className="px-4 py-3 font-black font-mono text-foreground">{formatUsd(program.priceFromUsd)}</td>
                  <td className="px-4 py-3">
                    {program.hidden ? (
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground font-semibold">
                        مخفي
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                        ظاهر
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={busyId === program.id}
                        onClick={() => void hide(program)}
                        className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        title={program.hidden ? "إظهار" : "إخفاء"}
                      >
                        {program.hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === program.id}
                        onClick={() => void remove(program.id)}
                        className="rounded-lg border border-red-500/20 p-1.5 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
