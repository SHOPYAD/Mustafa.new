"use client";

import { useState, useEffect } from "react";
import {
  Palette,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  Loader2,
  ShieldCheck,
  Smartphone,
  Download,
  ExternalLink,
} from "lucide-react";

export function AppIconsStudio() {
  const [googlePlayIcon, setGooglePlayIcon] = useState("/app/store-assets/google-play-icon-512.png");
  const [appStoreIcon, setAppStoreIcon] = useState("/app/store-assets/app-store-icon-1024.png");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchCurrentIcons = async () => {
    try {
      const res = await fetch("/api/admin/mobile-app/icon-generator");
      const data = await res.json();
      if (data.ok) {
        if (data.googlePlayIcon) setGooglePlayIcon(data.googlePlayIcon);
        if (data.appStoreIcon) setAppStoreIcon(data.appStoreIcon);
      }
    } catch {}
  };

  useEffect(() => {
    fetchCurrentIcons();
  }, []);

  const handleRegenerateFromLogo = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/mobile-app/icon-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage({ type: "success", text: data.message || "تم توليد وتحديث الأيقونات بنجاح!" });
        await fetchCurrentIcons();
      } else {
        setMessage({ type: "error", text: data.error || "فشل التوليد" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "حدث خطأ بالاتصال" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("icon", file);

      const res = await fetch("/api/admin/mobile-app/icon-generator", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.ok) {
        setMessage({ type: "success", text: "تم رفع الأيقونة الرئيسية وتوليد كافة مقاسات أندرويد والمتاجر بنجاح!" });
        await fetchCurrentIcons();
      } else {
        setMessage({ type: "error", text: data.error || "فشل معالجة الأيقونة" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "حدث خطأ أثناء الرفع" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-isolated-dark space-y-6 rounded-3xl border border-purple-500/20 bg-gradient-to-b from-[#140522] via-[#1a082e] to-[#0f031b] p-6 sm:p-8 text-white shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/20 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-purple-950 font-black shadow-lg shadow-amber-500/20">
            <Palette className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">
                أيقونة وهوية التطبيق الرسمية للمتاجر (Google Play & Apple App Store)
              </h2>
              <span className="rounded-md border border-emerald-400/40 bg-emerald-400/20 px-2 py-0.5 text-[11px] font-black text-emerald-300">
                Auto-Integrated
              </span>
            </div>
            <p className="text-xs text-purple-200 mt-1">
              توليد وتوزيع حزم الأيقونات بكافة الكثافات المعتمدة لأندرويد (mdpi إلى xxxhdpi) ومتاجر جوجل بلاي وآبل ستور تلقائياً.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRegenerateFromLogo}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-105 px-5 py-2.5 text-xs font-black text-purple-950 shadow-md shadow-amber-500/30 transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin text-purple-950" /> : <RefreshCw className="h-4 w-4 text-purple-950" />}
            <span>إعادة توليد وتطبيق أيقونات لوناليزا الرسمية</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2.5 rounded-2xl p-4 text-xs font-black shadow-md ${
            message.type === "success"
              ? "bg-emerald-950/40 border border-emerald-500/50 text-emerald-200"
              : "bg-rose-950/40 border border-rose-500/50 text-rose-200"
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Upload Master Icon Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-right">
          <h3 className="text-sm font-black text-white">رفع أيقونة ماستر مخصصة بدقة عالية (Master Icon)</h3>
          <p className="text-xs text-purple-200">
            يرجى رفع صورة مربعة بدقة 1024×1024 أو 512×512 بصيغة PNG. سيقوم النظام فوراً باقتصاصها وتوزيعها على كافة الكثافات.
          </p>
        </div>

        <label className="flex items-center gap-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-400/40 px-5 py-2.5 text-xs font-black text-white transition cursor-pointer shrink-0">
          <UploadCloud className="h-4 w-4 text-amber-400" />
          <span>اختر ملف الأيقونة من جهازك</span>
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isLoading}
          />
        </label>
      </div>

      {/* Grid: Google Play & App Store Master Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Google Play Store Card */}
        <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-white font-black text-xs">
                GP
              </span>
              <h3 className="font-black text-sm text-white">أيقونة متجر Google Play</h3>
            </div>
            <span className="text-[11px] font-mono text-amber-300">512 × 512 px (PNG 32-bit)</span>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative group">
              <img
                src={googlePlayIcon}
                alt="Google Play Icon"
                className="h-28 w-28 rounded-2xl border-2 border-amber-400/50 shadow-xl object-cover bg-[#140522]"
              />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>مطابقة لمتطلبات جوجل بلاي الرسمية</span>
              </div>
              <p className="text-purple-200 text-[11px] leading-relaxed">
                مطبقة تلقائياً في ملفات بناء التطبيق وتظهر في حزمة APK المصدرة فور التثبيت.
              </p>
              <a
                href={googlePlayIcon}
                download="google-play-icon-512.png"
                className="inline-flex items-center gap-1 text-[11px] font-black text-amber-400 hover:text-amber-300 underline"
              >
                <Download className="h-3.5 w-3.5" />
                <span>تنزيل الأيقونة الرسمية (512px)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Apple App Store Card */}
        <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 text-slate-900 font-black text-xs">
                iOS
              </span>
              <h3 className="font-black text-sm text-white">أيقونة متجر Apple App Store</h3>
            </div>
            <span className="text-[11px] font-mono text-amber-300">1024 × 1024 px (PNG Flat)</span>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative group">
              <img
                src={appStoreIcon}
                alt="Apple App Store Icon"
                className="h-28 w-28 rounded-2xl border-2 border-amber-400/50 shadow-xl object-cover bg-[#140522]"
              />
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>بدون زوايا دائرية وبدون شفافية ألفا</span>
              </div>
              <p className="text-purple-200 text-[11px] leading-relaxed">
                جاهزة للرفع المباشر على منصة Apple App Store Connect عند تجهيز حزمة iOS.
              </p>
              <a
                href={appStoreIcon}
                download="app-store-icon-1024.png"
                className="inline-flex items-center gap-1 text-[11px] font-black text-amber-400 hover:text-amber-300 underline"
              >
                <Download className="h-3.5 w-3.5" />
                <span>تنزيل أيقونة آبل ستور (1024px)</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Android Densities Table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
        <h3 className="text-xs font-black text-amber-300 flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          <span>كافة كثافات شاشات أندرويد المدمجة في حزمة التطبيق (Android Mipmaps):</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {[
            { density: "mdpi", size: "48 × 48 px", target: "الشاشات القياسية" },
            { density: "hdpi", size: "72 × 72 px", target: "الشاشات عالية الدقة" },
            { density: "xhdpi", size: "96 × 96 px", target: "شاشات Retina أندرويد" },
            { density: "xxhdpi", size: "144 × 144 px", target: "الهواتف الرائدة الحديثة" },
            { density: "xxxhdpi", size: "192 × 192 px", target: "شاشات 2K و 4K فائقة الدقة" },
          ].map((item) => (
            <div key={item.density} className="rounded-xl bg-purple-950/50 border border-purple-500/20 p-3 text-center space-y-1">
              <span className="text-[10px] font-mono font-bold text-amber-400">{item.density}</span>
              <div className="text-xs font-black text-white">{item.size}</div>
              <div className="text-[10px] text-purple-300">{item.target}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
