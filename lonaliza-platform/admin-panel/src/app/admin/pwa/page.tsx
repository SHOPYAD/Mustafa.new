"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  RotateCcw,
  Save,
  Smartphone,
} from "lucide-react";
import AdminSwitch from "@/components/admin/AdminSwitch";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  DEFAULT_PWA_SETTINGS,
  resolvedAppleTouchIcon,
  resolvedPwaIcon192,
  resolvedPwaIcon512,
  type PwaSettings,
} from "@/data/pwa";
import { blobToFile, buildPwaIconSet } from "@/lib/pwa/icons";

const inputClass =
  "w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all text-sm";

const labelClass =
  "block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider";

const cardClass = "rounded-2xl border border-border bg-card shadow-xs p-5";

export default function AdminPwaPage() {
  const { t } = useLocale();
  const copy = t.pwa;
  const [form, setForm] = useState<PwaSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admin/pwa", { cache: "no-store", credentials: "same-origin" })
      .then((res) => res.json())
      .then((data: { ok?: boolean; settings?: PwaSettings }) => {
        if (cancelled) return;
        setForm(data.settings || DEFAULT_PWA_SETTINGS);
      })
      .catch(() => {
        if (!cancelled) setForm(DEFAULT_PWA_SETTINGS);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const patch = (partial: Partial<PwaSettings>) => {
    setForm((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/pwa", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { ok?: boolean; settings?: PwaSettings; error?: string };
      if (!res.ok || !data.ok || !data.settings) {
        throw new Error(data.error || copy.saveFailed);
      }
      setForm(data.settings);
      setSavedMsg(copy.saved);
      setTimeout(() => setSavedMsg(""), 2800);
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm(copy.resetConfirm)) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/pwa", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset: true }),
      });
      const data = (await res.json()) as { ok?: boolean; settings?: PwaSettings };
      if (data.settings) setForm(data.settings);
      setSavedMsg(copy.resetDone);
      setTimeout(() => setSavedMsg(""), 2800);
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const uploadSlot = async (
    file: File,
    slot: "icon192" | "icon512" | "appleTouchIcon"
  ) => {
    const body = new FormData();
    body.append("file", file);
    body.append("slot", slot);
    const res = await fetch("/api/admin/pwa/icon", {
      method: "POST",
      credentials: "same-origin",
      body,
    });
    const data = (await res.json()) as {
      ok?: boolean;
      settings?: PwaSettings;
      error?: string;
    };
    if (!res.ok || !data.ok || !data.settings) {
      throw new Error(data.error || copy.uploadFailed);
    }
    setForm(data.settings);
  };

  const handleIconFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !form) return;
    setUploading(true);
    setError("");
    try {
      const set = await buildPwaIconSet(file, form.backgroundColor);
      await uploadSlot(blobToFile(set.icon192, "pwa-192.png"), "icon192");
      await uploadSlot(blobToFile(set.icon512, "pwa-512.png"), "icon512");
      await uploadSlot(blobToFile(set.apple, "apple-touch-icon.png"), "appleTouchIcon");
      setSavedMsg(copy.iconsReady);
      setTimeout(() => setSavedMsg(""), 2800);
    } catch (e) {
      setError(e instanceof Error ? e.message : copy.uploadFailed);
    } finally {
      setUploading(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className='size-8 animate-spin text-secondary' />
      </div>
    );
  }

  const preview192 = resolvedPwaIcon192(form);
  const preview512 = resolvedPwaIcon512(form);
  const previewApple = resolvedAppleTouchIcon(form);

  return (
    <div className="admin-page flex w-full flex-col gap-6">
      <div className="flex items-start gap-4">
        <span className='flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-primary/10 text-primary'>
          <Smartphone size={20} />
        </span>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className='text-2xl font-bold tracking-tight text-foreground'>{copy.title}</h1>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              مجاناً لكافة باقات إعادة البيع
            </span>
          </div>
          <p className='text-sm leading-relaxed text-muted-foreground'>{copy.subtitle}</p>
        </div>
      </div>

      {/* PWA Telemetry Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">محرك التصفح (Service Worker)</span>
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">مسجل ونشط</span>
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight text-foreground">تصفح أوفلاين Offline</p>
          <p className="text-[11px] text-muted-foreground">مزامنة خلفية وتخزين مؤقت للصفحات</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">ملف تعريف الويب (Manifest)</span>
            <span className="rounded-md bg-teal-500/10 px-1.5 py-0.5 text-[10px] font-bold text-teal-600 dark:text-teal-400">مواصفة PWA</span>
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight text-foreground font-mono">manifest.json</p>
          <p className="text-[11px] text-muted-foreground">شاشة كاملة وتجربة تطبيق مستقلة</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">نافذة التثبيت الذكية</span>
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">نشطة</span>
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight text-foreground">iOS و Android</p>
          <p className="text-[11px] text-muted-foreground">تثبيت فوري للشاشة الرئيسية بنقرة واحدة</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">أيقونات التطبيق الفاخرة</span>
            <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">دقة 512px</span>
          </div>
          <p className="mt-2 text-xl font-bold tracking-tight text-foreground">جاهزة للـ Retina</p>
          <p className="text-[11px] text-muted-foreground">Apple Touch و Maskable Icons</p>
        </div>
      </div>

      <section className={cardClass}>
        <h2 className='mb-3 text-sm font-semibold text-muted-foreground'>{copy.toggles}</h2>
        <AdminSwitch
          checked={form.enabledPublic}
          onChange={(next) => patch({ enabledPublic: next })}
          label={copy.enablePublic}
          description={copy.enablePublicHint}
        />
        <AdminSwitch
          checked={form.enabledAdmin}
          onChange={(next) => patch({ enabledAdmin: next })}
          label={copy.enableAdmin}
          description={copy.enableAdminHint}
        />
        <AdminSwitch
          checked={form.showBanner}
          onChange={(next) => patch({ showBanner: next })}
          label={copy.showBanner}
          description={copy.showBannerHint}
        />
      </section>

      <section className={cardClass}>
        <h2 className='mb-4 text-sm font-semibold text-muted-foreground'>{copy.identity}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className={labelClass}>{copy.nameAr}</span>
            <input
              className={inputClass}
              value={form.nameAr}
              onChange={(e) => patch({ nameAr: e.target.value })}
              dir="rtl"
            />
          </label>
          <label className="block">
            <span className={labelClass}>{copy.nameEn}</span>
            <input
              className={inputClass}
              value={form.nameEn}
              onChange={(e) => patch({ nameEn: e.target.value })}
              dir="ltr"
            />
          </label>
          <label className="block">
            <span className={labelClass}>{copy.nameTr}</span>
            <input
              className={inputClass}
              value={form.nameTr}
              onChange={(e) => patch({ nameTr: e.target.value })}
              dir="ltr"
            />
          </label>
        </div>
        <label className="mt-4 block max-w-sm">
          <span className={labelClass}>{copy.shortName}</span>
          <input
            className={inputClass}
            value={form.shortName}
            maxLength={24}
            onChange={(e) => patch({ shortName: e.target.value })}
          />
        </label>
      </section>

      <section className={cardClass}>
        <h2 className='mb-4 text-sm font-semibold text-muted-foreground'>{copy.colors}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-3">
            <input
              type="color"
              className='h-11 w-14 cursor-pointer rounded-lg border border-border bg-transparent'
              value={form.themeColor}
              onChange={(e) => patch({ themeColor: e.target.value })}
            />
            <span>
              <span className={labelClass}>{copy.themeColor}</span>
              <input
                className={inputClass}
                value={form.themeColor}
                onChange={(e) => patch({ themeColor: e.target.value })}
                dir="ltr"
              />
            </span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="color"
              className='h-11 w-14 cursor-pointer rounded-lg border border-border bg-transparent'
              value={form.backgroundColor}
              onChange={(e) => patch({ backgroundColor: e.target.value })}
            />
            <span>
              <span className={labelClass}>{copy.backgroundColor}</span>
              <input
                className={inputClass}
                value={form.backgroundColor}
                onChange={(e) => patch({ backgroundColor: e.target.value })}
                dir="ltr"
              />
            </span>
          </label>
        </div>
      </section>

      <section className={cardClass}>
        <h2 className='mb-1 text-sm font-semibold text-muted-foreground'>{copy.icons}</h2>
        <p className='mb-4 text-xs leading-relaxed text-muted-foreground'>{copy.iconsHint}</p>
        <div className="mb-4 flex flex-wrap items-end gap-6">
          <IconPreview src={preview192} label="192" />
          <IconPreview src={preview512} label="512" />
          <IconPreview src={previewApple} label="Apple 180" />
        </div>
        <label className='inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors'>
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
          {copy.uploadIcon}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            disabled={uploading}
            onChange={(e) => void handleIconFile(e)}
          />
        </label>
      </section>

      <section className={cardClass}>
        <h2 className='mb-3 text-sm font-semibold text-muted-foreground'>{copy.howTitle}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className='rounded-xl border border-border bg-muted/40 p-4'>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Android
            </p>
            <p className='text-sm leading-relaxed text-muted-foreground'>{copy.howAndroid}</p>
          </div>
          <div className='rounded-xl border border-border bg-muted/40 p-4'>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              iPhone
            </p>
            <p className='text-sm leading-relaxed text-muted-foreground'>{copy.howIos}</p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className='inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:brightness-110 shadow-md shadow-primary/20 disabled:opacity-50 transition-all cursor-pointer'
        >
          {saving ? <Loader2 size={16} className="animate-spin text-white" /> : <Save size={16} className="text-white stroke-white" />}
          <span className="text-white">{t.common.save}</span>
        </button>
        <button
          type="button"
          onClick={() => void handleReset()}
          disabled={saving}
          className='inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer'
        >
          <RotateCcw size={15} />
          {copy.resetDefaults}
        </button>
        {savedMsg ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={15} />
            {savedMsg}
          </span>
        ) : null}
        {error ? <span className="text-sm font-medium text-rose-600 dark:text-rose-400">{error}</span> : null}
      </div>
    </div>
  );
}

function IconPreview({ src, label }: { src: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className='flex size-16 items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#051741]'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="size-full object-contain" />
      </span>
      <span className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
        {label}
      </span>
    </div>
  );
}
