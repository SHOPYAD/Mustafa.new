"use client";

import { useCallback, useEffect, useState } from "react";
import { Database, Loader2, RefreshCw, Search } from "lucide-react";
import { AdminKpi, AdminKpiStrip } from "@/components/admin/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="space-y-4 p-0">
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Database size={18} />
            شعارات شركات الطيران
          </CardTitle>
          <CardDescription>
            قاعدة محلية لربط رمز IATA/ICAO واسم الشركة بشعارها. تُستخدم في نتائج البحث الحي.
          </CardDescription>
        </div>
        <Button
          type="button"
          onClick={() => void handleImport()}
          disabled={importing}
        >
          {importing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          استيراد / تحديث من JSON
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">

      {meta ? (
        <AdminKpiStrip cols={2}>
          <AdminKpi label="الشركات" value={meta.airlineCount} />
          <AdminKpi
            label="آخر تحديث"
            value={meta.importedAt ? new Date(meta.importedAt).toLocaleString("ar") : "—"}
          />
        </AdminKpiStrip>
      ) : null}

      {meta?.sourceUrls?.length ? (
        <ul className="space-y-1 text-xs text-[color:var(--admin-text-muted)]">
          {meta.sourceUrls.map((url) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noreferrer" className="text-[color:var(--admin-gold)] underline" dir="ltr">
                {url}
              </a>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="رمز IATA أو اسم الشركة (مثل PC أو Flynas)"
          className="admin-field flex-1"
        />
        <button
          type="button"
          onClick={() => void handleTrial()}
          disabled={searching}
          className="admin-btn-secondary"
        >
          {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          بحث تجريبي
        </button>
      </div>

      {message ? <p className="text-sm text-[color:var(--admin-gold)]">{message}</p> : null}

      {loading ? (
        <p className="text-sm text-[color:var(--admin-text-muted)]">جاري التحميل…</p>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الشعار</TableHead>
                  <TableHead>IATA</TableHead>
                  <TableHead>ICAO</TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الدولة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trial.map((row) => (
                  <TableRow key={row.iata}>
                    <TableCell>
                      {row.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.logoUrl} alt="" className="h-8 w-8 rounded-lg bg-white object-contain p-0.5" />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="font-mono">{row.iata}</TableCell>
                    <TableCell className="font-mono">{row.icao || "—"}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.country || "—"}</TableCell>
                  </TableRow>
                ))}
                {!trial.length ? (
                  <TableRow>
                    <TableCell colSpan={5}>لا توجد نتائج — جرّب الاستيراد أولاً.</TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
          <div className="grid gap-3 md:hidden">
            {trial.length === 0 ? (
              <p className="text-sm text-[color:var(--admin-text-muted)]">لا توجد نتائج — جرّب الاستيراد أولاً.</p>
            ) : (
              trial.map((row) => (
                <article key={`m-${row.iata}`} className="rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    {row.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.logoUrl} alt="" className="h-8 w-8 rounded-lg bg-white object-contain p-0.5" />
                    ) : null}
                    <p className="font-bold">{row.name}</p>
                  </div>
                  <dl>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <dt>IATA</dt>
                      <dd className="font-mono">{row.iata}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <dt>ICAO</dt>
                      <dd className="font-mono">{row.icao || "—"}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <dt>الدولة</dt>
                      <dd>{row.country || "—"}</dd>
                    </div>
                  </dl>
                </article>
              ))
            )}
          </div>
        </>
      )}
      </CardContent>
    </Card>
  );
}
