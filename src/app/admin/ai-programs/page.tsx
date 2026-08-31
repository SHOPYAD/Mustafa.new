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
        <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
          <Bookmark className="text-emerald-400" size={28} />
          برامج المساعد الذكي
        </h1>
        <p className="mt-1 text-white/50">
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
        <div className="flex items-center gap-2 py-16 text-white/40">
          <Loader2 className="animate-spin" size={18} />
          جاري التحميل...
        </div>
      ) : programs.length === 0 ? (
        <p className="rounded-2xl border border-white/5 bg-slate-900/60 px-5 py-10 text-center text-white/40">
          لا توجد برامج محفوظة بعد.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/70">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/45">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">البرنامج</th>
                <th className="px-4 py-3 text-start font-semibold">الوجهة</th>
                <th className="px-4 py-3 text-start font-semibold">ليالٍ</th>
                <th className="px-4 py-3 text-start font-semibold">السعر</th>
                <th className="px-4 py-3 text-start font-semibold">الحالة</th>
                <th className="px-4 py-3 text-start font-semibold">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {programs.map((program) => (
                <tr key={program.id} className="text-white/80">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-white">{program.titleAr}</p>
                    <p className="text-xs text-white/35">{program.titleEn}</p>
                    <p className="mt-1 text-[11px] text-white/30" dir="ltr">
                      {program.id}
                    </p>
                  </td>
                  <td className="px-4 py-3">{program.destination}</td>
                  <td className="px-4 py-3">{program.nights}</td>
                  <td className="px-4 py-3">{formatUsd(program.priceFromUsd)}</td>
                  <td className="px-4 py-3">
                    {program.hidden ? (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/50">
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
                        className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-white/70 hover:bg-white/5"
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
