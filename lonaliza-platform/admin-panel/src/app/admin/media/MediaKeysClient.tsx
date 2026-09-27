"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Image as ImageIcon, Loader2, Save } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const inputClass =
  "w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm";

const labelClass =
  "block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider";

type KeyStatus = {
  configured: boolean;
  masked: string;
};

export default function MediaKeysClient() {
  const { t, locale } = useLocale();
  const isAr = locale === "ar";
  const [pexels, setPexels] = useState("");
  const [unsplash, setUnsplash] = useState("");
  const [status, setStatus] = useState<{
    PEXELS_API_KEY: KeyStatus;
    UNSPLASH_ACCESS_KEY: KeyStatus;
  } | null>(null);
  const [showPexels, setShowPexels] = useState(false);
  const [showUnsplash, setShowUnsplash] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/media/keys", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data?.ok) return;
        setStatus(data.keys);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSavedMsg("");
    try {
      const res = await fetch("/api/admin/media/keys", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          PEXELS_API_KEY: pexels || undefined,
          UNSPLASH_ACCESS_KEY: unsplash || undefined,
        }),
      });
      const data = await res.json();
      if (!data?.ok) throw new Error(data?.error || "save failed");
      setStatus(data.keys);
      setPexels("");
      setUnsplash("");
      setSavedMsg(t.admin.saved);
      setTimeout(() => setSavedMsg(""), 3000);
    } catch {
      setSavedMsg(t.admin.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-6">
      <div className="flex items-start gap-4">
        <span className='flex size-11 flex-shrink-0 items-center justify-center rounded-2xl border border-border bg-primary/10 text-primary'>
          <ImageIcon size={20} />
        </span>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-foreground'>
            {t.admin.mediaKeys}
          </h1>
          <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>
            {t.admin.mediaKeysSubtitle}
          </p>
        </div>
      </div>

      {/* Media Telemetry Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Pexels Stock API</span>
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
              status?.PEXELS_API_KEY?.configured ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"
            }`}>
              {status?.PEXELS_API_KEY?.configured ? "Configured" : "Not Set"}
            </span>
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight text-foreground">Free HD Photos</p>
          <p className="text-[11px] text-muted-foreground">Editor Visual Media Picker</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Unsplash HD API</span>
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
              status?.UNSPLASH_ACCESS_KEY?.configured ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"
            }`}>
              {status?.UNSPLASH_ACCESS_KEY?.configured ? "Configured" : "Not Set"}
            </span>
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight text-foreground">Curated Editorial</p>
          <p className="text-[11px] text-muted-foreground">High-res Travel Destinations</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Media CDN</span>
            <span className="rounded-md bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">Active</span>
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight text-foreground">Edge Delivery</p>
          <p className="text-[11px] text-muted-foreground">Global fast image caching</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Auto Compression</span>
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">WebP / AVIF</span>
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight text-foreground">Lossless & Fast</p>
          <p className="text-[11px] text-muted-foreground">Bandwidth saving up to 80%</p>
        </div>
      </div>

      {loading ? (
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Loader2 className="animate-spin" size={16} />
          {t.admin.loading}
        </div>
      ) : (
        <section className='grid grid-cols-1 gap-5 rounded-2xl border border-border bg-card shadow-xs p-6 min-w-0 md:grid-cols-2'>
          <div>
            <label className={labelClass}>Pexels API key</label>
            <div className="flex gap-2">
              <input
                className={inputClass}
                type={showPexels ? "text" : "password"}
                value={pexels}
                onChange={(e) => setPexels(e.target.value)}
                placeholder={
                  status?.PEXELS_API_KEY?.configured
                    ? status?.PEXELS_API_KEY?.masked || ""
                    : "••••••••"
                }
              />
              <button
                type="button"
                onClick={() => setShowPexels((v) => !v)}
                className='w-11 h-11 rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted flex items-center justify-center transition-colors cursor-pointer'
              >
                {showPexels ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className='mt-1.5 text-[11px] text-muted-foreground'>
              {isAr
                ? "من pexels.com/api — يُستخدم في ملقط صور المحرر."
                : "From pexels.com/api — used by the editor media picker."}
            </p>
          </div>

          <div>
            <label className={labelClass}>Unsplash access key</label>
            <div className="flex gap-2">
              <input
                className={inputClass}
                type={showUnsplash ? "text" : "password"}
                value={unsplash}
                onChange={(e) => setUnsplash(e.target.value)}
                placeholder={
                  status?.UNSPLASH_ACCESS_KEY?.configured
                    ? status?.UNSPLASH_ACCESS_KEY?.masked || ""
                    : "••••••••"
                }
              />
              <button
                type="button"
                onClick={() => setShowUnsplash((v) => !v)}
                className='w-11 h-11 rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted flex items-center justify-center transition-colors cursor-pointer'
              >
                {showUnsplash ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className='mt-1.5 text-[11px] text-muted-foreground'>
              {isAr
                ? "Access Key من unsplash.com/developers."
                : "Access Key from unsplash.com/developers."}
            </p>
          </div>

          <div className="flex items-center gap-3 md:col-span-2">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className='inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:brightness-110 shadow-md shadow-primary/20 disabled:opacity-60 transition-all cursor-pointer'
            >
              {saving ? <Loader2 className="animate-spin text-white" size={16} /> : <Save size={16} className="text-white stroke-white" />}
              <span className="text-white">{t.admin.saveSettings}</span>
            </button>
            {savedMsg ? (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={14} />
                {savedMsg}
              </span>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
}
