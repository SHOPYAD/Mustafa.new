"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  Search,
  Upload,
} from "lucide-react";
import type { MediaAsset, MediaProvider } from "@/lib/media/types";

const PER_PAGE = 18;

type MediaPickerProps = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  compact?: boolean;
};

function searchPath(provider: MediaProvider): string {
  return provider === "pexels"
    ? "/api/admin/media/pexels"
    : "/api/admin/media/unsplash";
}

export function MediaSearchPanel({
  onSelectAsset,
  initialQuery = "",
}: {
  onSelectAsset: (url: string) => void;
  initialQuery?: string;
}) {
  const [provider, setProvider] = useState<MediaProvider | "both">("both");
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [results, setResults] = useState<MediaAsset[]>([]);
  const [loadedPage, setLoadedPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fetchProvider = async (
    nextProvider: MediaProvider,
    pageNum: number,
    q: string
  ) => {
    const params = new URLSearchParams({
      query: q,
      page: String(pageNum),
      perPage: String(PER_PAGE),
    });
    const res = await fetch(`${searchPath(nextProvider)}?${params.toString()}`, {
      credentials: "same-origin",
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        typeof payload?.error === "string"
          ? payload.error
          : `Request failed (${res.status})`
      );
    }
    const items: MediaAsset[] = Array.isArray(payload.items) ? payload.items : [];
    const tot = typeof payload.total === "number" ? payload.total : items.length;
    return { items, total: tot };
  };

  const runSearch = async (mode: "replace" | "append") => {
    const q = query.trim();
    if (!q) {
      setError("أدخل كلمة بحث أولاً");
      return;
    }
    const nextPage = mode === "replace" ? 1 : loadedPage + 1;
    if (mode === "replace") {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }
    try {
      const providers: MediaProvider[] =
        provider === "both" ? ["unsplash", "pexels"] : [provider];
      const batches = await Promise.all(
        providers.map((item) => fetchProvider(item, nextPage, q))
      );
      const seen = new Set<string>();
      const items: MediaAsset[] = [];
      let tot = 0;
      for (const batch of batches) {
        tot += batch.total;
        for (const asset of batch.items) {
          const key = `${asset.provider}:${asset.id}`;
          if (seen.has(key)) continue;
          seen.add(key);
          items.push(asset);
        }
      }
      setTotal(tot);
      setLoadedPage(nextPage);
      if (mode === "replace") {
        setResults(items);
      } else {
        setResults((prev) => {
          const existing = new Set(prev.map((x) => `${x.provider}:${x.id}`));
          const merged = [...prev];
          for (const it of items) {
            const k = `${it.provider}:${it.id}`;
            if (!existing.has(k)) {
              existing.add(k);
              merged.push(it);
            }
          }
          return merged;
        });
      }
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
      if (mode === "replace") {
        setResults([]);
        setLoadedPage(0);
        setTotal(0);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const hasMore = results.length > 0 && results.length < total;

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-1.5">
        <select
          value={provider}
          onChange={(e) => {
            const next = e.target.value as MediaProvider | "both";
            setProvider(next);
            setResults([]);
            setLoadedPage(0);
            setTotal(0);
          }}
          className="h-8 rounded-lg border border-white/10 bg-slate-950/70 px-2 text-xs text-white"
        >
          <option value="both">Unsplash + Pexels</option>
          <option value="unsplash">Unsplash</option>
          <option value="pexels">Pexels</option>
        </select>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Search className="absolute start-2 top-1/2 h-3 w-3 -translate-y-1/2 text-white/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن صور…"
            className="h-8 w-full rounded-lg border border-white/10 bg-slate-950/70 ps-7 pe-2 text-xs text-white placeholder:text-white/30"
            onKeyDown={(e) => {
              if (e.key === "Enter") void runSearch("replace");
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => void runSearch("replace")}
          disabled={loading}
          className="flex h-8 items-center gap-1 rounded-lg bg-emerald-500 px-2.5 text-[11px] font-semibold text-[#051741] disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Search className="h-3 w-3" />
          )}
          بحث
        </button>
      </div>

      {error ? (
        <div className="flex items-start gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-2 py-1.5 text-[11px] text-rose-200">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-white/40" />
        </div>
      ) : null}

      {!loading && results.length === 0 && !error && loadedPage > 0 ? (
        <div className="rounded-lg border border-dashed border-white/15 bg-white/5 py-6 text-center text-[11px] text-white/45">
          لا نتائج.
        </div>
      ) : null}

      {results.length > 0 ? (
        <>
          <div className="h-[22rem] overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-1.5">
            <div className="grid grid-cols-3 gap-1.5">
              {results.map((asset) => (
                <button
                  key={`${asset.provider}-${asset.id}`}
                  type="button"
                  title={asset.authorName ? `© ${asset.authorName}` : "Insert"}
                  onClick={() => {
                    const url = (
                      asset.fullUrl ||
                      asset.previewUrl ||
                      asset.thumbUrl ||
                      ""
                    ).trim();
                    if (url) onSelectAsset(url);
                  }}
                  className="group relative overflow-hidden rounded-md border border-white/10 bg-slate-950/40 transition hover:border-emerald-400"
                >
                  <div
                    className="aspect-square w-full"
                    style={{
                      backgroundImage: `url(${asset.thumbUrl || asset.previewUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-black/55 px-1 py-0.5 text-[9px] text-white/80 truncate">
                    {asset.provider}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-white/40">
              {results.length} / {total}
            </span>
            {hasMore ? (
              <button
                type="button"
                onClick={() => void runSearch("append")}
                disabled={loadingMore}
                className="flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/70 disabled:opacity-60"
              >
                {loadingMore ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : null}
                المزيد
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function MediaPicker({
  value,
  onChange,
  placeholder = "https://…",
  compact = false,
}: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0, width: 320 });

  const handleFileSelected = useCallback(
    async (file: File | null) => {
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("الملف أكبر من 10MB");
        return;
      }
      setUploading(true);
      setUploadError(null);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/branding/upload", {
          method: "POST",
          body: fd,
        });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok || !payload?.ok || !payload.url) {
          throw new Error(
            typeof payload?.error === "string"
              ? payload.error
              : `Upload failed (${res.status})`
          );
        }
        onChange(String(payload.url));
      } catch (e) {
        setUploadError(e instanceof Error ? e.message : "فشل الرفع");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [onChange]
  );

  useLayoutEffect(() => {
    if (!open) return;
    const sync = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(360, Math.max(280, window.innerWidth - 16));
      const left = Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8));
      const top = Math.min(rect.bottom + 6, window.innerHeight - 24);
      setPanelPos({ top, left, width });
    };
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      if (target instanceof Element) {
        if (target.closest("[data-editor-popover]")) return;
        if (target.closest("[data-media-picker-panel]")) return;
        if (target.closest("input[type='file']")) return;
      }
      if (target === document.documentElement || target === document.body) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div className="space-y-1.5">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
        className="hidden"
        onChange={(e) => {
          void handleFileSelected(e.target.files?.[0] || null);
        }}
      />
      <div className="flex items-center gap-1.5">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 ${
            value ? "bg-white/5" : "bg-slate-950/60"
          }`}
          style={
            value
              ? {
                  backgroundImage: `url(${value})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
          aria-hidden
        >
          {!value ? (
            <ImageIcon className="h-3.5 w-3.5 text-white/35" />
          ) : null}
        </div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-8 flex-1 rounded-lg border border-white/10 bg-slate-950/70 px-2 font-mono text-[11px] text-white"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex h-8 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 text-[10px] font-medium text-white/70 disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Upload className="h-3 w-3" />
          )}
          {compact ? "" : "رفع"}
        </button>
        <button
          type="button"
          ref={triggerRef}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-8 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 text-[10px] font-medium text-white/70"
        >
          <Search className="h-3 w-3" />
          Stock
        </button>
      </div>
      {uploadError ? (
        <div className="flex items-start gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-2 py-1 text-[11px] text-rose-200">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
          <span>{uploadError}</span>
        </div>
      ) : null}
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={panelRef}
              data-media-picker-panel=""
              data-editor-popover=""
              className="rounded-xl border border-white/10 bg-slate-950 p-2.5 shadow-2xl"
              style={{
                position: "fixed",
                top: panelPos.top,
                left: panelPos.left,
                width: panelPos.width,
                zIndex: 90,
                maxHeight: "min(28rem, calc(100vh - 24px))",
                overflow: "auto",
              }}
            >
              <div className="mb-2 text-[11px] font-semibold text-white">
                صور جاهزة — Unsplash و Pexels
              </div>
              <MediaSearchPanel
                onSelectAsset={(url) => {
                  onChange(url);
                  setOpen(false);
                }}
              />
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
