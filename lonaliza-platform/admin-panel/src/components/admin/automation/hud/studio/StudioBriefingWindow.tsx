"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

export type StudioBriefing = {
  ok?: boolean;
  fetchedAt?: string;
  error?: string;
  counts?: { name: string; label: string; total: number | null; state: string }[];
  leads?: {
    total: number;
    whatsapp: number;
    email: number;
    website: number;
    contacted: number;
    qualified: number;
    rows: { title: string; city: string; phone: string; email: string; rating: string }[];
  };
  kind?: string;
  gapCount?: number;
  systemCount?: number;
  systems?: { label: string; state: string; gap: string }[];
  tasks?: { agent: string; directive: string; status: string; result: string }[];
};

export function StudioBriefingWindow() {
  const [data, setData] = useState<StudioBriefing | null>(null);

  useEffect(() => {
    const onOpen = (event: Event) => {
      setData((event as CustomEvent<StudioBriefing>).detail || { ok: false, error: "لا توجد بيانات" });
    };
    window.addEventListener("studio:open-briefing", onOpen);
    return () => window.removeEventListener("studio:open-briefing", onOpen);
  }, []);

  if (!data) return null;
  const when = data.fetchedAt ? new Date(data.fetchedAt).toLocaleString("ar") : "";

  return (
    <section
      dir="rtl"
      aria-label="تقرير المشرف"
      className="absolute left-1/2 top-16 z-[80] flex max-h-[78vh] w-[min(920px,92vw)] -translate-x-1/2 flex-col overflow-hidden rounded-xl border border-cyan-400/50 bg-[#041018]/96 text-cyan-50 shadow-[0_0_40px_rgba(0,229,255,0.28)]"
    >
      <header className="flex items-center gap-3 border-b border-cyan-500/30 px-4 py-3">
        <button type="button" aria-label="إغلاق" onClick={() => setData(null)} className="grid h-7 w-7 place-items-center rounded-md border border-rose-400/40 text-rose-200">
          <X size={14} />
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-bold" style={{ color: "#e8fbff" }}>{data.kind === "readiness" ? "جاهزية المنصة للإطلاق" : data.kind === "travel" ? "أداء الموقع والزيارات والحجوزات" : "رادار استخبارات الشركات"}</h2>
          <p className="text-[11px] text-cyan-200/70">{when} · الأرقام مقروءة الآن وليست تقديرات</p>
        </div>
      </header>
      <div className="cyber-scrollbar space-y-4 overflow-y-auto p-4">
        {data.error ? <p className="text-rose-300">{data.error}</p> : null}
        {data.leads ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              ["شركات الرادار", data.leads.total],
              ["لديها واتساب", data.leads.whatsapp],
              ["لديها إيميل", data.leads.email],
              ["لديها موقع", data.leads.website],
              ["تم التواصل", data.leads.contacted],
              ["مؤهلة", data.leads.qualified],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-2">
                <div className="text-[11px] text-cyan-200/70">{label}</div>
                <div className="text-lg font-bold text-white">{value}</div>
              </div>
            ))}
          </div>
        ) : null}
        {data.kind === "readiness" && data.systemCount ? (
          <p style={{ color: "#b7f3ff", fontSize: 13 }}>غير الموصول {data.gapCount} من {data.systemCount} نظاماً مفحوصاً. هذه نسبة النقص المحسوبة من الفحص، وليست تقديراً.</p>
        ) : null}
        <Table title="نواقص يجب إغلاقها" headers={["النظام", "الحالة", "النقص"]} rows={(data.systems || []).filter((row) => row.state !== "موصول").map((row) => [row.label, row.state, row.gap])} empty="لا نواقص في هذا الفحص." />
        <Table title="عدادات المجموعات الحية" headers={["القسم", "العدد", "حالة القراءة"]} rows={(data.counts || []).map((row) => [row.label, row.total === null ? "—" : String(row.total), row.state])} />
        <Table title="عينة شركات الرادار" headers={["الشركة", "المدينة", "الهاتف", "الإيميل", "التقييم"]} rows={(data.leads?.rows || []).map((row) => [row.title, row.city, row.phone, row.email, row.rating])} empty="لا توجد شركات مسجلة في الرادار." />
        <Table title="آخر مهام الوكلاء في هذه الجلسة" headers={["الوكيل", "الطلب", "الحالة", "النتيجة"]} rows={(data.tasks || []).map((row) => [row.agent, row.directive, row.status, row.result || "—"])} empty="لا توجد مهام منفذة في هذه الجلسة." />
      </div>
    </section>
  );
}

function Table({ title, headers, rows, empty }: { title: string; headers: string[]; rows: string[][]; empty?: string }) {
  return (
    <div>
      <h3 style={{ color: "#b7f3ff", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
      {rows.length === 0 ? <p style={{ color: "#93a8b3", fontSize: 12 }}>{empty}</p> : (
        <div style={{ overflowX: "auto", border: "1px solid rgba(64,214,245,0.35)", borderRadius: 8 }}>
          <table style={{ width: "100%", minWidth: 520, borderCollapse: "collapse", textAlign: "right", fontSize: 12 }}>
            <thead>
              <tr>{headers.map((head) => <th key={head} style={{ background: "#062033", color: "#d8f6ff", padding: "6px 8px" }}>{head}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, cellIndex) => <td key={cellIndex} style={{ background: "#07111b", color: "#e7f7ff", borderTop: "1px solid rgba(64,214,245,0.2)", padding: "6px 8px", maxWidth: 220 }} title={cell}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
