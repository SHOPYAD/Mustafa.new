"use client";

import { useCallback, useEffect, useState } from "react";
import { Database, Loader2, RefreshCw, Search } from "lucide-react";

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
    <div className='mb-6 bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm'>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className='text-lg font-bold text-foreground flex items-center gap-2'>
            <Database size={18} className='text-secondary' />
            قاعدة المطارات
          </h2>
          <p className='text-muted-foreground text-sm mt-1'>
            بحث من/إلى يقرأ القاعدة المحلية فقط. لا يُستدعى RapidAPI للاقتراحات.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void handleImport()}
          disabled={importing}
          className='inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary text-foreground text-sm font-bold disabled:opacity-60'
        >
          {importing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          استيراد / تحديث من الملف
        </button>
      </div>

      {loading ? (
        <p className='text-muted-foreground text-sm flex items-center gap-2'>
          <Loader2 size={14} className="animate-spin" /> جاري التحميل…
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className='rounded-xl bg-card-2 border border-border px-4 py-3'>
            <p className='text-[11px] uppercase tracking-wider text-muted-foreground'>السجلات</p>
            <p className='text-2xl font-bold text-foreground mt-1'>{meta?.airportCount ?? 0}</p>
          </div>
          <div className='rounded-xl bg-card-2 border border-border px-4 py-3'>
            <p className='text-[11px] uppercase tracking-wider text-muted-foreground'>المدن</p>
            <p className='text-2xl font-bold text-foreground mt-1'>{meta?.cityCount ?? 0}</p>
          </div>
          <div className='rounded-xl bg-card-2 border border-border px-4 py-3'>
            <p className='text-[11px] uppercase tracking-wider text-muted-foreground'>المصدر</p>
            <p className='text-sm font-semibold text-foreground mt-2'>{meta?.source || "—"}</p>
          </div>
          <div className='rounded-xl bg-card-2 border border-border px-4 py-3'>
            <p className='text-[11px] uppercase tracking-wider text-muted-foreground'>آخر تحديث</p>
            <p className='text-sm font-semibold text-foreground mt-2'>
              {meta?.importedAt ? new Date(meta.importedAt).toLocaleString("ar-EG") : "بذرة أولية"}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleTrial();
          }}
          placeholder="بحث تجريبي — مثلاً ist"
          className='flex-1 px-4 py-2.5 bg-card-2 border border-border rounded-xl text-foreground placeholder:text-muted-foreground text-sm focus:border-primary focus:ring-1 focus:ring-admin-border-focus outline-none'
        />
        <button
          type="button"
          onClick={() => void handleTrial()}
          disabled={searching}
          className='inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:hover:bg-primary/90 text-primary-foreground text-sm font-semibold disabled:opacity-50 transition-colors'
        >
          {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          بحث تجريبي
        </button>
      </div>

      {message ? <p className='text-sm text-muted-foreground'>{message}</p> : null}

      <div className='rounded-xl border border-border overflow-hidden'>
        {trial.length === 0 ? (
          <p className='px-4 py-3 text-sm text-muted-foreground'>لا نتائج لهذا النص.</p>
        ) : (
          <ul className="divide-y divide-admin-border-subtle">
            {trial.map((hit) => (
              <li key={`${hit.kind}-${hit.iata}`} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <span className='inline-flex min-w-12 justify-center rounded-md bg-primary px-2 py-1 text-xs font-bold text-primary-foreground'>
                  {hit.iata}
                </span>
                <span className='text-foreground'>{hit.name}</span>
                <span className='text-muted-foreground'>
                  {hit.city} · {hit.country}
                  {hit.kind === "city" ? " · مدينة" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
