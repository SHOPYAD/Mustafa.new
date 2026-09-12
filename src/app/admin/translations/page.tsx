"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Languages,
  Loader2,
  Plus,
  Save,
  Search,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { defaultDirForCode, type RegisteredLocale } from "@/lib/i18n/catalog";

type TranslationScope = "site" | "admin";

type CatalogRow = {
  key: string;
  scope: TranslationScope;
  kind: "string" | "fn";
  values: Record<string, string>;
  missing: string[];
};

type LanguageStat = {
  code: string;
  filled: number;
  total: number;
  missing: number;
};

type CatalogResponse = {
  ok?: boolean;
  error?: string;
  hasGeminiKey?: boolean;
  locales?: RegisteredLocale[];
  rows?: CatalogRow[];
  languageStats?: Record<string, LanguageStat>;
  counts?: { total: number; site: number; admin: number; missing: number };
};

const PAGE_SIZE = 40;

export default function AdminTranslationsPage() {
  const { t, reloadTranslations } = useLocale();
  const a = t.admin;
  const [scope, setScope] = useState<TranslationScope>("site");
  const [rows, setRows] = useState<CatalogRow[]>([]);
  const [locales, setLocales] = useState<RegisteredLocale[]>([]);
  const [counts, setCounts] = useState({
    total: 0,
    site: 0,
    admin: 0,
    missing: 0,
  });
  const [hasGeminiKey, setHasGeminiKey] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [missingOnly, setMissingOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    code: "",
    name: "",
    nativeName: "",
    dir: "ltr" as "rtl" | "ltr",
    sourceLocale: "en" as "ar" | "en",
  });
  const [translating, setTranslating] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, pct: 0 });
  const [progressMsg, setProgressMsg] = useState("");
  const [languageStats, setLanguageStats] = useState<
    Record<string, LanguageStat>
  >({});
  const cancelRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async (opts?: { keepError?: boolean }) => {
    if (!opts?.keepError) setError("");
    try {
      const res = await fetch("/api/admin/translations", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const data = (await res.json()) as CatalogResponse;
      if (!data.ok) {
        setError(data.error || a.translationsLoadFailed);
        return;
      }
      setRows(data.rows || []);
      setLocales(data.locales || []);
      setCounts(
        data.counts || { total: 0, site: 0, admin: 0, missing: 0 }
      );
      setHasGeminiKey(Boolean(data.hasGeminiKey));
      setLanguageStats(data.languageStats || {});
      const firstExtra = Object.values(data.languageStats || {})[0];
      if (firstExtra && !translating) {
        setProgress({
          done: firstExtra.filled,
          total: firstExtra.total,
          pct: firstExtra.total
            ? Math.round((firstExtra.filled / firstExtra.total) * 100)
            : 0,
        });
        if (firstExtra.missing === 0) {
          setProgressMsg(a.translationsDone);
        }
      }
    } catch {
      if (!opts?.keepError) setError(a.translationsLoadFailed);
    } finally {
      setLoading(false);
    }
  }, [a.translationsLoadFailed, a.translationsDone, translating]);

  useEffect(() => {
    void load();
  }, [load]);

  const builtinCols = locales.filter((l) => l.builtin);
  const extraCols = locales.filter((l) => !l.builtin);
  const allCols = [...builtinCols, ...extraCols];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (row.scope !== scope) return false;
      if (missingOnly && row.missing.length === 0) return false;
      if (!q) return true;
      if (row.key.toLowerCase().includes(q)) return true;
      return Object.values(row.values).some((v) =>
        v.toLowerCase().includes(q)
      );
    });
  }, [rows, scope, query, missingOnly]);

  useEffect(() => {
    setPage(0);
  }, [scope, query, missingOnly]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const scopeCount = scope === "site" ? counts.site : counts.admin;

  const draftId = (key: string, locale: string) => `${locale}::${key}`;

  const cellValue = (row: CatalogRow, locale: string) => {
    const id = draftId(row.key, locale);
    return drafts[id] !== undefined ? drafts[id] : row.values[locale] || "";
  };

  const saveCell = async (key: string, locale: string, value: string) => {
    const id = draftId(key, locale);
    const original = rows.find((r) => r.key === key)?.values[locale] || "";
    if (value === original) {
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return;
    }
    setSavingKey(id);
    setError("");
    try {
      const res = await fetch("/api/admin/translations", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, key, value }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!data.ok) {
        setError(data.error || a.saveFailed);
        return;
      }
      setRows((prev) =>
        prev.map((row) => {
          if (row.key !== key) return row;
          const values = { ...row.values, [locale]: value };
          const missing = allCols
            .map((l) => l.code)
            .filter((code) => !(values[code] || "").trim());
          return { ...row, values, missing };
        })
      );
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setSavedMsg(a.translationsSaveCell);
      setTimeout(() => setSavedMsg(""), 1800);
      void reloadTranslations();
    } catch {
      setError(a.saveFailed);
    } finally {
      setSavingKey("");
    }
  };

  const errorForCode = (code?: string, fallback?: string) => {
    if (code === "rate_limit") return a.translationsErrorRateLimit;
    if (code === "timeout") return a.translationsErrorTimeout;
    if (code === "auth") return a.translationsErrorAuth;
    if (code === "bad_json") return a.translationsErrorJson;
    return fallback || a.translationsBatchFailed;
  };

  const stopTranslation = (message?: string) => {
    cancelRef.current = true;
    abortRef.current?.abort();
    setTranslating(false);
    if (message) setProgressMsg(message);
  };

  const runTranslation = async (
    code: string,
    sourceLocale: "ar" | "en" = "en"
  ) => {
    cancelRef.current = false;
    setTranslating(true);
    setError("");
    const start = languageStats[code];
    setProgress({
      done: start?.filled || 0,
      total: start?.total || counts.total || 0,
      pct: start?.total
        ? Math.round(((start.filled || 0) / start.total) * 100)
        : 0,
    });
    setProgressMsg(a.translationsTranslating);
    try {
      for (;;) {
        if (cancelRef.current) {
          setProgressMsg(a.translationsCancelled);
          break;
        }
        let attempt = 0;
        let data: {
          ok?: boolean;
          error?: string;
          code?: string;
          hasGeminiKey?: boolean;
          filled?: number;
          remaining?: number;
          total?: number;
          done?: boolean;
          progress?: number;
          translated?: number;
        } | null = null;
        while (attempt < 2 && !cancelRef.current) {
          attempt += 1;
          const ac = new AbortController();
          abortRef.current = ac;
          const timer = setTimeout(() => ac.abort(), 50000);
          try {
            const res = await fetch("/api/admin/translations/translate-batch", {
              method: "POST",
              credentials: "same-origin",
              headers: { "Content-Type": "application/json" },
              signal: ac.signal,
              body: JSON.stringify({
                code,
                sourceLocale,
                limit: 20,
                scope: "all",
                missingOnly: true,
              }),
            });
            const status = res.status;
            try {
              data = (await res.json()) as typeof data;
            } catch {
              data = {
                ok: false,
                code: status === 429 ? "rate_limit" : "timeout",
                error: errorForCode(
                  status === 429 ? "rate_limit" : "timeout"
                ),
              };
            }
            if (data?.ok) break;
            if (data?.hasGeminiKey === false || data?.code === "auth") break;
            if (attempt < 2) {
              setProgressMsg(a.translationsRetrying);
              await new Promise((r) => setTimeout(r, 1200 * attempt));
              continue;
            }
            break;
          } catch (e) {
            const aborted =
              e instanceof DOMException && e.name === "AbortError";
            data = {
              ok: false,
              code: "timeout",
              error: aborted
                ? a.translationsErrorTimeout
                : a.translationsErrorTimeout,
            };
            if (cancelRef.current) break;
            if (attempt < 2) {
              setProgressMsg(a.translationsRetrying);
              await new Promise((r) => setTimeout(r, 1200 * attempt));
              continue;
            }
          } finally {
            clearTimeout(timer);
          }
        }
        if (cancelRef.current) {
          setProgressMsg(a.translationsCancelled);
          break;
        }
        if (!data) break;
        if (data.hasGeminiKey === false || data.code === "auth") {
          setHasGeminiKey(false);
          setError(data.error || a.translationsGeminiMissing);
          break;
        }
        const filled = data.filled ?? 0;
        const total = data.total || counts.total;
        const remaining = data.remaining ?? Math.max(0, total - filled);
        setProgress({
          done: filled,
          total,
          pct: data.progress ?? (total ? Math.round((filled / total) * 100) : 0),
        });
        setLanguageStats((prev) => ({
          ...prev,
          [code]: { code, filled, total, missing: remaining },
        }));
        await load({ keepError: true });
        if (!data.ok) {
          setError(errorForCode(data.code, data.error));
          setProgressMsg(a.translationsPartial);
          break;
        }
        if (data.done || remaining === 0 || remaining <= 2) {
          setProgressMsg(
            remaining > 0 ? a.translationsClosedPartial : a.translationsDone
          );
          break;
        }
        if ((data.translated || 0) === 0 && remaining <= 5) {
          setProgressMsg(a.translationsClosedPartial);
          break;
        }
        setProgressMsg(a.translationsTranslating);
      }
      await load({ keepError: true });
      await reloadTranslations();
    } catch {
      setError(a.translationsErrorTimeout);
    } finally {
      abortRef.current = null;
      setTranslating(false);
    }
  };

  const targetLocales = locales.filter((l) => l.code !== "ar");
  const incompleteLangs = targetLocales.filter(
    (lang) => (languageStats[lang.code]?.missing ?? 0) > 0
  );
  const pausedLangs = targetLocales.filter((lang) => {
    const stat = languageStats[lang.code];
    return Boolean(stat && stat.filled > 0 && stat.missing > 0);
  });

  const fillAllMissing = async () => {
    const targets = incompleteLangs.length ? incompleteLangs : targetLocales;
    for (const lang of targets) {
      await runTranslation(lang.code, lang.sourceLocale || "ar");
    }
  };

  const handleAddLanguage = async () => {
    setError("");
    if (!hasGeminiKey) {
      setError(a.translationsGeminiMissing);
      return;
    }
    setTranslating(true);
    setProgressMsg(a.translationsTranslating);
    try {
      const res = await fetch("/api/admin/translations/languages", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        hasGeminiKey?: boolean;
        language?: { code: string };
      };
      if (data.hasGeminiKey === false) {
        setHasGeminiKey(false);
        setError(data.error || a.translationsGeminiMissing);
        setTranslating(false);
        return;
      }
      if (!data.ok || !data.language) {
        setError(data.error || a.saveFailed);
        setTranslating(false);
        return;
      }
      setShowAdd(false);
      await runTranslation(data.language.code, addForm.sourceLocale);
    } catch {
      setError(a.saveFailed);
      setTranslating(false);
    }
  };

  const inputClass =
    "w-full px-2 py-1.5 bg-slate-900/80 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/50";

  return (
    <div className="admin-page w-full max-w-none min-w-0">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Languages className="text-amber-400" size={28} />
            {a.translations}
          </h1>
          <p className="text-white/50 mt-1 max-w-2xl">{a.translationsSubtitle}</p>
          <p className="text-white/30 text-xs mt-2">
            {counts.total} {a.translationsCount}
            {" · "}
            {a.translationsSite}: {counts.site}
            {" · "}
            {a.translationsAdmin}: {counts.admin}
            {counts.missing > 0
              ? ` · ${a.translationsMissing}: ${counts.missing}`
              : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {savedMsg && (
            <span className="text-emerald-400 text-xs flex items-center gap-1">
              <CheckCircle2 size={14} />
              {savedMsg}
            </span>
          )}
          <button
            type="button"
            onClick={() => void load()}
            disabled={translating}
            className="px-3 py-2 rounded-xl border border-white/10 text-white/70 text-sm hover:bg-white/5 disabled:opacity-40"
          >
            {a.translationsRefresh}
          </button>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 text-black text-sm font-semibold flex items-center gap-2 hover:bg-amber-400"
          >
            <Plus size={16} />
            {a.translationsAddLanguage}
          </button>
        </div>
      </div>

      {!hasGeminiKey && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-200 text-sm">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{a.translationsGeminiMissing}</p>
            <a href="/admin/ai-settings" className="underline text-amber-100">
              {a.aiSettings}
            </a>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200 text-sm">
          {error}
        </div>
      )}

      {(translating || progress.total > 0) && (
        <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <div className="flex items-center justify-between text-sm text-white/70 mb-2">
            <span className="flex items-center gap-2">
              {translating && <Loader2 size={14} className="animate-spin" />}
              {progressMsg || a.translationsProgress}
            </span>
            <span>
              {progress.done}/{progress.total || "…"} · {progress.pct}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Gemini AI Translation & Language Progress Counters */}
      <div className="mb-6 rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Sparkles size={16} className="text-amber-400" />
            <span>حالة ومؤشرات الترجمة الذكية (Gemini AI Translation):</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {locales.map((lang) => {
              const stat = languageStats[lang.code];
              const filled = stat?.filled ?? 0;
              const total = stat?.total || counts.total;
              const isMissing = stat && stat.missing > 0;
              return (
                <span
                  key={lang.code}
                  className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold flex items-center gap-1.5 ${
                    isMissing
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  <span>{lang.nativeName || lang.code.toUpperCase()}</span>
                  <span>
                    ({filled}/{total})
                  </span>
                  {isMissing && <span className="text-[10px] text-amber-400">-{stat.missing}</span>}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={translating || !hasGeminiKey || incompleteLangs.length === 0}
            onClick={() => void fillAllMissing()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-purple-950 text-sm font-black flex items-center gap-2 shadow-md transition-all disabled:opacity-40 cursor-pointer"
          >
            {translating ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            <span>ترجمة جميع النواقص تلقائياً عبر Gemini</span>
          </button>

          {targetLocales.map((lang) => {
            const stat = languageStats[lang.code];
            if (!stat || stat.missing === 0) return null;
            return (
              <button
                key={lang.code}
                type="button"
                disabled={translating || !hasGeminiKey}
                onClick={() =>
                  void runTranslation(lang.code, lang.sourceLocale || "ar")
                }
                className="px-3.5 py-2 rounded-xl border border-amber-400/40 text-amber-200 text-xs font-bold hover:bg-amber-500/10 transition-all disabled:opacity-40 cursor-pointer"
              >
                <span>ترجمة نواقص ({lang.name})</span>
                <span className="text-[10px] text-amber-400 ms-1">({stat.missing} ناقص)</span>
              </button>
            );
          })}

          {translating && (
            <button
              type="button"
              onClick={() => stopTranslation(a.translationsCancelled)}
              className="px-4 py-2.5 rounded-xl border border-red-400/40 text-red-200 text-sm font-semibold hover:bg-red-500/10 cursor-pointer"
            >
              {a.translationsCancel}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex rounded-xl border border-white/10 overflow-hidden">
          {(["site", "admin"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              className={`px-4 py-2 text-sm font-medium ${
                scope === s
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "text-white/50 hover:text-white/80"
              }`}
            >
              {s === "site" ? a.translationsSite : a.translationsAdmin}
              <span className="ms-2 text-[11px] opacity-70">
                {s === "site" ? counts.site : counts.admin}
              </span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute start-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={a.translationsSearch}
            className="w-full ps-9 pe-3 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-white text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-white/60">
          <input
            type="checkbox"
            checked={missingOnly}
            onChange={(e) => setMissingOnly(e.target.checked)}
          />
          {a.translationsMissingFilter}
        </label>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-white/40">
          <Loader2 className="animate-spin me-2" size={18} />
          {a.loading}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-white/[0.03] text-white/40 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-start px-3 py-3 w-56">{a.translationsKey}</th>
                {allCols.map((col) => (
                  <th key={col.code} className="text-start px-3 py-3">
                    {col.code.toUpperCase()}
                    <span className="block normal-case text-[10px] font-normal opacity-70">
                      {col.nativeName}
                    </span>
                  </th>
                ))}
                <th className="text-start px-3 py-3 w-24">{a.translationsMissing}</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr
                  key={row.key}
                  className="border-t border-white/[0.05] hover:bg-white/[0.02]"
                >
                  <td className="px-3 py-2 align-top">
                    <code className="text-[11px] text-amber-200/90 break-all">
                      {row.key}
                    </code>
                    {row.kind === "fn" && (
                      <p className="text-[10px] text-white/30 mt-1">
                        {a.translationsFnHint}
                      </p>
                    )}
                  </td>
                  {allCols.map((col) => {
                    const id = draftId(row.key, col.code);
                    return (
                      <td key={col.code} className="px-2 py-1.5 align-top">
                        <textarea
                          rows={2}
                          dir={col.dir}
                          className={inputClass}
                          value={cellValue(row, col.code)}
                          onChange={(e) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [id]: e.target.value,
                            }))
                          }
                          onBlur={(e) =>
                            void saveCell(row.key, col.code, e.target.value)
                          }
                        />
                        {savingKey === id && (
                          <span className="text-[10px] text-white/30 flex items-center gap-1 mt-0.5">
                            <Save size={10} />
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-2 align-top">
                    {row.missing.length ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[11px]">
                        {row.missing.join(", ")}
                      </span>
                    ) : (
                      <span className="text-emerald-400/80 text-[11px]">
                        {a.translationsOk}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 text-sm text-white/40">
        <span>
          {filtered.length} / {scopeCount} · {a.translationsCount}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-3 py-1.5 rounded-lg border border-white/10 disabled:opacity-30"
          >
            ‹
          </button>
          <span>
            {page + 1} / {pageCount}
          </span>
          <button
            type="button"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            className="px-3 py-1.5 rounded-lg border border-white/10 disabled:opacity-30"
          >
            ›
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#12121a] border border-white/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Plus size={16} />
                {a.translationsAddLanguage}
              </h2>
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="text-white/40 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            {!hasGeminiKey && (
              <p className="mb-3 text-amber-200 text-sm">
                {a.translationsGeminiMissing}
              </p>
            )}
            <label className="block text-xs text-white/40 mb-1">
              {a.translationsLangCode}
            </label>
            <input
              className="w-full mb-3 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm"
              placeholder={a.translationsCodeHint}
              value={addForm.code}
              onChange={(e) => {
                const code = e.target.value.toLowerCase();
                setAddForm((f) => ({
                  ...f,
                  code,
                  dir: defaultDirForCode(code),
                }));
              }}
            />
            <label className="block text-xs text-white/40 mb-1">
              {a.translationsLangName}
            </label>
            <input
              className="w-full mb-3 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm"
              value={addForm.name}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, name: e.target.value }))
              }
            />
            <label className="block text-xs text-white/40 mb-1">
              {a.translationsNativeName}
            </label>
            <input
              className="w-full mb-3 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm"
              value={addForm.nativeName}
              onChange={(e) =>
                setAddForm((f) => ({ ...f, nativeName: e.target.value }))
              }
            />
            <label className="block text-xs text-white/40 mb-1">
              {a.translationsDir}
            </label>
            <select
              className="w-full mb-3 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm"
              value={addForm.dir}
              onChange={(e) =>
                setAddForm((f) => ({
                  ...f,
                  dir: e.target.value === "rtl" ? "rtl" : "ltr",
                }))
              }
            >
              <option value="ltr">{a.translationsLtr}</option>
              <option value="rtl">{a.translationsRtl}</option>
            </select>
            <label className="block text-xs text-white/40 mb-1">
              {a.translationsSource}
            </label>
            <select
              className="w-full mb-4 px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm"
              value={addForm.sourceLocale}
              onChange={(e) =>
                setAddForm((f) => ({
                  ...f,
                  sourceLocale: e.target.value === "ar" ? "ar" : "en",
                }))
              }
            >
              <option value="en">{a.translationsSourceEn}</option>
              <option value="ar">{a.translationsSourceAr}</option>
            </select>
            <button
              type="button"
              disabled={translating || !addForm.code || !addForm.name}
              onClick={() => void handleAddLanguage()}
              className="w-full py-2.5 rounded-xl bg-amber-500 text-black font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {translating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              {a.translationsTranslate}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
