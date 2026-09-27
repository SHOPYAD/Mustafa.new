"use client";

import { useCallback, useEffect, useState } from "react";
import { Database, Loader2, RefreshCw, Search } from "lucide-react";
import { AdminKpi, AdminKpiStrip } from "@/components/admin/layout";
import { Card, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Meta = {
  source: string;
  importedAt: string;
  airportCount: number;
  cityCount: number;
};

type TrialHit = {
  iata: string;
  name: string;
  city: string;
  country: string;
  kind?: string;
};

export default function AirportsDatabasePanel() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [query, setQuery] = useState("ist");
  const [trial, setTrial] = useState<TrialHit[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async (text: string) => {
    const res = await fetch(`/api/admin/airports?query=${encodeURIComponent(text.trim())}&locale=ar`, {
      cache: "no-store",
    });
    const json = (await res.json()) as { ok?: boolean; meta?: Meta; trial?: TrialHit[] };
    if (json.meta) setMeta(json.meta);
    setTrial(json.trial || []);
    return json;
  }, []);

  useEffect(() => {
    void load("ist")
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [load]);

  const handleImport = async () => {
    setImporting(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/airports", { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; meta?: Meta };
      if (!res.ok || !json.ok) {
        setMessage("تعذر الاستيراد من الملف العام.");
        return;
      }
      setMeta(json.meta || null);
      setMessage(`تم التحديث: ${json.meta?.airportCount || 0} مطار`);
      await load(query);
    } catch {
      setMessage("تعذر الاستيراد من الملف العام.");
    } finally {
      setImporting(false);
    }
  };

  const handleTrial = async () => {
    setSearching(true);
    setMessage("");
    try {
      await load(query);
    } catch {
      setMessage("تعذر تنفيذ البحث التجريبي.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <Card className="space-y-4 p-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <CardTitle className="admin-section-title">
            <Database size={18} />
            قاعدة المطارات
          </CardTitle>
          <p className="text-sm text-[color:var(--admin-text-muted)]">
            بحث من/إلى يقرأ القاعدة المحلية فقط. لا يُستدعى RapidAPI للاقتراحات.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleImport()}
          disabled={importing}
          className="admin-btn-primary disabled:opacity-60"
        >
          {importing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          استيراد / تحديث من الملف
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[color:var(--admin-text-muted)] flex items-center gap-2">
          <Loader2 size={14} className="animate-spin" /> جاري التحميل…
        </p>
      ) : (
        <AdminKpiStrip cols={4}>
          <AdminKpi label="السجلات" value={meta?.airportCount ?? 0} />
          <AdminKpi label="المدن" value={meta?.cityCount ?? 0} />
          <AdminKpi label="المصدر" value={meta?.source || "—"} />
          <AdminKpi
            label="آخر تحديث"
            value={meta?.importedAt ? new Date(meta.importedAt).toLocaleString("ar-EG") : "بذرة أولية"}
          />
        </AdminKpiStrip>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleTrial();
          }}
          placeholder="بحث تجريبي — مثلاً ist"
          className="admin-field flex-1"
        />
        <button
          type="button"
          onClick={() => void handleTrial()}
          disabled={searching}
          className="admin-btn-secondary"
        >
          {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          بحث تجريبي
        </button>
      </div>

      {message ? <p className="text-sm text-[color:var(--admin-gold)]">{message}</p> : null}

      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>IATA</TableHead>
              <TableHead>الاسم</TableHead>
              <TableHead>المدينة</TableHead>
              <TableHead>الدولة</TableHead>
              <TableHead>النوع</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trial.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-[color:var(--admin-text-muted)]">
                  لا نتائج لهذا النص.
                </TableCell>
              </TableRow>
            ) : (
              trial.map((hit) => (
                <TableRow key={`${hit.kind}-${hit.iata}`}>
                  <TableCell className="font-mono font-bold">{hit.iata}</TableCell>
                  <TableCell>{hit.name}</TableCell>
                  <TableCell>{hit.city}</TableCell>
                  <TableCell>{hit.country}</TableCell>
                  <TableCell>{hit.kind === "city" ? "مدينة" : "مطار"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="grid gap-3 md:hidden">
        {trial.length === 0 ? (
          <p className="text-sm text-[color:var(--admin-text-muted)]">لا نتائج لهذا النص.</p>
        ) : (
          trial.map((hit) => (
            <article key={`m-${hit.kind}-${hit.iata}`} className="rounded-xl border bg-card p-4 shadow-sm">
              <p className="font-bold">{hit.name}</p>
              <dl>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <dt>IATA</dt>
                  <dd className="font-mono">{hit.iata}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <dt>المدينة</dt>
                  <dd>
                    {hit.city} · {hit.country}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <dt>النوع</dt>
                  <dd>{hit.kind === "city" ? "مدينة" : "مطار"}</dd>
                </div>
              </dl>
            </article>
          ))
        )}
      </div>
    </Card>
  );
}
