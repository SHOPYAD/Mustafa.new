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

  return (
    <div className="admin-page w-full max-w-none min-w-0" dir="rtl">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
          <Bookmark className="text-emerald-400" size={28} />
          برامج المساعد الذكي
        </h1>
        <p className="mt-1 text-muted-foreground">
          البرامج المحفوظة تظهر لكل الزوار في{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5 text-emerald-200">
            /ai-chat
          </code>{" "}
          حتى حذفها أو إخفائها.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-admin-text-muted">
          <Loader2 className="animate-spin" size={18} />
          جاري التحميل...
        </div>
      ) : programs.length === 0 ? (
        <p className="rounded-2xl border border-admin-border-subtle bg-slate-900/60 px-5 py-10 text-center text-admin-text-muted">
          لا توجد برامج محفوظة بعد.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-admin-border-subtle bg-slate-900/70">
          <table className="w-full text-sm">
            <thead className="bg-admin-bg-subtle text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">البرنامج</th>
                <th className="px-4 py-3 text-start font-semibold">الوجهة</th>
                <th className="px-4 py-3 text-start font-semibold">ليالٍ</th>
                <th className="px-4 py-3 text-start font-semibold">السعر</th>
                <th className="px-4 py-3 text-start font-semibold">الحالة</th>
                <th className="px-4 py-3 text-start font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border-subtle">
              {programs.map((program) => (
                <tr key={program.id} className="text-foreground">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-foreground">{program.titleAr}</p>
                    <p className="text-xs text-muted-foreground">{program.titleEn}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground" dir="ltr">
                      {program.id}
                    </p>
                  </td>
                  <td className="px-4 py-3">{program.destination}</td>
                  <td className="px-4 py-3">{program.nights}</td>
                  <td className="px-4 py-3">{formatUsd(program.priceFromUsd)}</td>
                  <td className="px-4 py-3">
                    {program.hidden ? (
                      <span className="rounded-full bg-admin-bg-subtle px-2 py-0.5 text-xs text-muted-foreground">
                        مخفي
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">
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
                        className="rounded-lg border border-admin-border-subtle px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted"
                      >
                        {program.hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button
                        type="button"
                        disabled={busyId === program.id}
                        onClick={() => void remove(program.id)}
                        className="rounded-lg border border-red-500/20 px-2.5 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
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
