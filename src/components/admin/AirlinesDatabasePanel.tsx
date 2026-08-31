"use client";

import { useCallback, useEffect, useState } from "react";
import { Database, Loader2, RefreshCw, Search } from "lucide-react";

type Meta = {
  source: string;
  sourceUrls?: string[];
  importedAt: string;
  airlineCount: number;
};

type TrialHit = {
  iata: string;
  icao: string;
  name: string;
  country: string;
  logoUrl: string;
};

export default function AirlinesDatabasePanel() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [query, setQuery] = useState("PC");
  const [trial, setTrial] = useState<TrialHit[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async (text: string) => {
    const res = await fetch(`/api/admin/airlines?query=${encodeURIComponent(text.trim())}`, {
      cache: "no-store",
    });
    const json = (await res.json()) as { ok?: boolean; meta?: Meta; trial?: TrialHit[] };
    if (json.meta) setMeta(json.meta);
    setTrial(json.trial || []);
    return json;
  }, []);

  useEffect(() => {
    void load("PC")
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [load]);

  const handleImport = async () => {
    setImporting(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/airlines", { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; meta?: Meta };
      if (!res.ok || !json.ok) {
        setMessage("تعذر الاستيراد من الملف العام.");
        return;
      }
      setMeta(json.meta || null);
      setMessage(`تم التحديث: ${json.meta?.airlineCount || 0} شركة طيران`);
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
    <div className="mb-6 space-y-4 rounded-2xl border border-white/10 bg-slate-900/80 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Database size={18} className="text-sky-400" />
            شعارات شركات الطيران
          </h2>
          <p className="mt-1 text-sm text-white/40">
            قاعدة محلية لربط رمز IATA/ICAO واسم الشركة بشعارها. تُستخدم في نتائج البحث الحي.
          </p>
          {meta ? (
            <p className="mt-2 text-xs text-white/30">
              {meta.airlineCount} شركة · آخر تحديث: {meta.importedAt ? new Date(meta.importedAt).toLocaleString("ar") : "—"}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void handleImport()}
          disabled={importing}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-sky-400 disabled:opacity-60"
        >
          {importing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          استيراد / تحديث من JSON
        </button>
      </div>

      {meta?.sourceUrls?.length ? (
        <div className="rounded-xl border border-white/5 bg-black/20 p-3 text-xs text-white/50">
          <p className="font-semibold text-white/70">مصادر البيانات:</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            {meta.sourceUrls.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noreferrer" className="text-sky-300 hover:underline">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="رمز IATA أو اسم الشركة (مثل PC أو Flynas)"
          className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-white/30"
        />
        <button
          type="button"
          onClick={() => void handleTrial()}
          disabled={searching}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/5 disabled:opacity-60"
        >
          {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          بحث تجريبي
        </button>
      </div>

      {message ? <p className="text-sm text-amber-300">{message}</p> : null}

      {loading ? (
        <p className="text-sm text-white/40">جاري التحميل…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="min-w-full text-sm text-white/80">
            <thead className="bg-black/30 text-xs uppercase text-white/40">
              <tr>
                <th className="px-3 py-2 text-start">الشعار</th>
                <th className="px-3 py-2 text-start">IATA</th>
                <th className="px-3 py-2 text-start">ICAO</th>
                <th className="px-3 py-2 text-start">الاسم</th>
                <th className="px-3 py-2 text-start">الدولة</th>
              </tr>
            </thead>
            <tbody>
              {trial.map((row) => (
                <tr key={row.iata} className="border-t border-white/5">
                  <td className="px-3 py-2">
                    {row.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.logoUrl} alt="" className="h-8 w-8 rounded-lg bg-white object-contain p-0.5" />
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono">{row.iata}</td>
                  <td className="px-3 py-2 font-mono text-white/50">{row.icao || "—"}</td>
                  <td className="px-3 py-2">{row.name}</td>
                  <td className="px-3 py-2 text-white/50">{row.country || "—"}</td>
                </tr>
              ))}
              {!trial.length ? (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-white/40">
                    لا توجد نتائج — جرّب الاستيراد أولاً.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
