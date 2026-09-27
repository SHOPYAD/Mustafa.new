"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bookmark,
  Eye,
  EyeOff,
  Loader2,
  Trash2,
  Sparkles,
  MapPin,
  Moon,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import type { SavedAiProgram } from "@/types/ai-program";
import {
  EnterprisePageHeader,
  EnterpriseKpiGrid,
  EnterpriseKpiCard,
  EnterpriseDataTable,
  EnterpriseStatusBadge,
  type ColumnDef,
} from "@/components/admin/enterprise";

function formatUsd(amount: number) {
  return `$${Math.round(amount || 0).toLocaleString()} USD`;
}

export default function AdminAiProgramsPage() {
  const [programs, setPrograms] = useState<SavedAiProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      setLoading(true);
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
      if (!res.ok) throw new Error(data.error || "فشل الحذف");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل الحذف");
    } finally {
      setBusyId("");
    }
  };

  const totalPrograms = programs.length;
  const visiblePrograms = programs.filter((p) => !p.hidden).length;
  const hiddenPrograms = programs.filter((p) => p.hidden).length;

  const columns: ColumnDef<SavedAiProgram>[] = [
    {
      key: "titleAr",
      title: "البرنامج السياحي الذكي",
      render: (p) => (
        <div>
          <p className="font-bold text-foreground text-sm">{p.titleAr}</p>
          <p className="text-xs text-muted-foreground">{p.titleEn}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground font-mono" dir="ltr">
            ID: {p.id}
          </p>
        </div>
      ),
    },
    {
      key: "destination",
      title: "الوجهة",
      render: (p) => (
        <span className="inline-flex items-center gap-1.5 font-semibold text-xs text-foreground bg-primary/10 px-2.5 py-1 rounded-lg">
          <MapPin className="size-3.5 text-primary" />
          {p.destination}
        </span>
      ),
    },
    {
      key: "nights",
      title: "المدة",
      render: (p) => (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-bold tabular-nums">
          <Moon className="size-3.5 text-amber-400" />
          {p.nights} ليالٍ
        </span>
      ),
    },
    {
      key: "priceFromUsd",
      title: "السعر يبدأ من",
      render: (p) => (
        <span className="font-mono font-black text-amber-400 text-xs tabular-nums">
          {formatUsd(p.priceFromUsd)}
        </span>
      ),
    },
    {
      key: "hidden",
      title: "الحالة",
      render: (p) => (
        <EnterpriseStatusBadge
          status={p.hidden ? "inactive" : "active"}
          label={p.hidden ? "مخفي" : "ظاهر للزوار"}
          size="sm"
        />
      ),
    },
    {
      key: "actions",
      title: "الإجراءات",
      align: "left",
      render: (p) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={busyId === p.id}
            onClick={() => void hide(p)}
            className="p-1.5 rounded-xl border border-border/60 bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors cursor-pointer disabled:opacity-50"
            title={p.hidden ? "إظهار البرنامج" : "إخفاء البرنامج"}
          >
            {busyId === p.id ? (
              <Loader2 size={14} className="animate-spin" />
            ) : p.hidden ? (
              <Eye size={14} />
            ) : (
              <EyeOff size={14} />
            )}
          </button>
          <button
            type="button"
            disabled={busyId === p.id}
            onClick={() => void remove(p.id)}
            className="p-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            title="حذف البرنامج نهائياً"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8" dir="rtl">
      <EnterprisePageHeader
        icon={Bookmark}
        title="برامج المساعد الذكي (AI Travel Programs)"
        description="البرامج المحفوظة التي يولدها الذكاء الاصطناعي وتظهر للزوار في شات المستشار الذكي /ai-chat."
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "الذكاء الاصطناعي", href: "/admin/ai-settings" },
          { label: "برامج AI المحفوظة" },
        ]}
        actions={
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </button>
        }
      />

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-bold text-rose-400">
          {error}
        </div>
      )}

      <EnterpriseKpiGrid cols={3}>
        <EnterpriseKpiCard
          label="إجمالي البرامج المحفوظة"
          value={totalPrograms}
          hint="تم توليدها تلقائياً عبر AI"
          icon={Bookmark}
          tone="royal"
        />
        <EnterpriseKpiCard
          label="برامج ظاهرة للعملاء"
          value={visiblePrograms}
          hint="متاحة للاستعراض والحجز الفوري"
          icon={Sparkles}
          tone="emerald"
        />
        <EnterpriseKpiCard
          label="برامج مخفية"
          value={hiddenPrograms}
          hint="معطلة مؤقتاً من العرض العام"
          icon={EyeOff}
          tone="amber"
        />
      </EnterpriseKpiGrid>

      <EnterpriseDataTable
        data={programs}
        columns={columns}
        keyExtractor={(p) => p.id}
        loading={loading}
        emptyTitle="لا توجد برامج محفوظة بعد"
        emptyDescription="ستظهر هنا البرامج السياحية التي ينشئها مساعد الذكاء الاصطناعي للعملاء."
      />
    </div>
  );
}
