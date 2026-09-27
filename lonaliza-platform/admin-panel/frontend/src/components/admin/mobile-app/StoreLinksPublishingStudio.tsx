"use client";

import { useState, useEffect } from "react";
import {
  Globe,
  ExternalLink,
  QrCode,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Smartphone,
  ShieldCheck,
  Github,
  Play,
  Terminal,
  Zap,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  FolderArchive,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import type { MobileAppStudioSettings } from "@/lib/mobile-app-types";

interface Props {
  settings: MobileAppStudioSettings | null;
  onUpdate?: () => void;
}

export function StoreLinksPublishingStudio({ settings: initialSettings, onUpdate }: Props) {
  const [googlePlayUrl, setGooglePlayUrl] = useState(
    initialSettings?.googlePlayUrl || "https://play.google.com/store/apps/details?id=com.lonaliza.app"
  );
  const [appStoreUrl, setAppStoreUrl] = useState(
    initialSettings?.appStoreUrl || "https://apps.apple.com/app/lonaliza-travel/id1669000000"
  );
  const [pwaBannerEnabled, setPwaBannerEnabled] = useState(
    initialSettings?.pwaBannerEnabled !== undefined ? initialSettings.pwaBannerEnabled : true
  );

  // GitHub CI/CD Settings
  const [githubRepo, setGithubRepo] = useState(initialSettings?.githubRepo || "lonaliza/lonaliza-mobile-app");
  const [githubToken, setGithubToken] = useState(initialSettings?.githubToken || "");
  const [githubBranch, setGithubBranch] = useState(initialSettings?.githubBranch || "main");
  const [githubWorkflowAndroid, setGithubWorkflowAndroid] = useState(
    initialSettings?.githubWorkflowAndroid || "build-android.yml"
  );
  const [githubWorkflowIos, setGithubWorkflowIos] = useState(
    initialSettings?.githubWorkflowIos || "build-ios.yml"
  );

  const [saving, setSaving] = useState(false);
  const [dispatchingTarget, setDispatchingTarget] = useState<"android" | "ios" | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // QR Codes preview fetched from server
  const [qrCodes, setQrCodes] = useState<{ googlePlayQr: string; appStoreQr: string }>({
    googlePlayQr: "",
    appStoreQr: "",
  });

  const loadQrCodes = () => {
    fetch("/api/app-links", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok) {
          setQrCodes({
            googlePlayQr: data.googlePlayQr || "",
            appStoreQr: data.appStoreQr || "",
          });
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadQrCodes();
  }, []);

  useEffect(() => {
    if (initialSettings) {
      if (initialSettings.googlePlayUrl) setGooglePlayUrl(initialSettings.googlePlayUrl);
      if (initialSettings.appStoreUrl) setAppStoreUrl(initialSettings.appStoreUrl);
      if (initialSettings.pwaBannerEnabled !== undefined) setPwaBannerEnabled(initialSettings.pwaBannerEnabled);
      if (initialSettings.githubRepo) setGithubRepo(initialSettings.githubRepo);
      if (initialSettings.githubToken) setGithubToken(initialSettings.githubToken);
      if (initialSettings.githubBranch) setGithubBranch(initialSettings.githubBranch);
      if (initialSettings.githubWorkflowAndroid) setGithubWorkflowAndroid(initialSettings.githubWorkflowAndroid);
      if (initialSettings.githubWorkflowIos) setGithubWorkflowIos(initialSettings.githubWorkflowIos);
    }
  }, [initialSettings]);

  const handleSaveAll = async (customText?: string) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/mobile-app", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(initialSettings || {}),
          googlePlayUrl,
          appStoreUrl,
          pwaBannerEnabled,
          githubRepo,
          githubToken,
          githubBranch,
          githubWorkflowAndroid,
          githubWorkflowIos,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage({
          type: "success",
          text: customText || "تم حفظ روابط المتاجر وإعدادات النشر وبانر الـ PWA بنجاح!",
        });
        loadQrCodes();
        if (onUpdate) onUpdate();
      } else {
        setMessage({ type: "error", text: data.error || "تعذر حفظ الإعدادات." });
      }
    } catch {
      setMessage({ type: "error", text: "حدث خطأ في الاتصال بالخادم." });
    } finally {
      setSaving(false);
    }
  };

  const handleDispatchGithub = async (target: "android" | "ios") => {
    setDispatchingTarget(target);
    setMessage(null);
    try {
      // Auto-save GitHub credentials first if needed
      await fetch("/api/admin/mobile-app", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(initialSettings || {}),
          githubRepo,
          githubToken,
          githubBranch,
          githubWorkflowAndroid,
          githubWorkflowIos,
        }),
      });

      const res = await fetch("/api/admin/mobile-app/github-dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage({
          type: "success",
          text:
            data.message ||
            `تم إطلاق مسار بناء ${target === "ios" ? "Apple App Store (iOS)" : "Google Play Store (Android)"} على GitHub Actions بنجاح!`,
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "تعذر تشغيل مسار GitHub Actions. يرجى التأكد من اسم المستودع والتوكن.",
        });
      }
    } catch {
      setMessage({ type: "error", text: "فشل الاتصال بخدمة GitHub Actions." });
    } finally {
      setDispatchingTarget(null);
    }
  };

  const handleTogglePwaBanner = async () => {
    const nextState = !pwaBannerEnabled;
    setPwaBannerEnabled(nextState);
    await handleSaveAll(
      nextState
        ? "تم تفعيل بانر تثبيت تطبيق الـ PWA لزوار الموقع."
        : "تم إلغاء تفعيل بانر تثبيت تطبيق الـ PWA (لن يظهر للزوار الآن)."
    );
  };

  return (
    <div className="space-y-8 rounded-3xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-surface)] p-6 sm:p-8 shadow-sm">
      {/* Header with Ownership Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[color:var(--admin-border-subtle)] pb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--admin-accent)] to-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] shadow-lg ">
            <Globe className="h-6 w-6 stroke-[2.3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[color:var(--admin-text-primary)]">
                روابط المتاجر ونشر التطبيق (Store Links & CI/CD)
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300/80 px-2.5 py-0.5 text-[11px] font-black text-amber-900">
                <Sparkles className="h-3 w-3 text-amber-600" />
                باقة التملك الكامل (مفعل تلقائياً)
              </span>
            </div>
            <p className="text-xs text-[color:var(--admin-text-muted)] mt-1">
              إدارة روابط التطبيق الرسمية في Google Play و App Store، وتوليد رموز QR لفوتر الموقع، وتنزيل سورس كود Flutter، والرفع التلقائي عبر GitHub Actions.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleSaveAll()}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 px-5 py-2.5 text-xs sm:text-sm font-black text-[#1e0836] shadow-md hover:brightness-105 active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin text-[#1e0836]" /> : <Save className="h-4 w-4 text-[#1e0836]" />}
          <span>حفظ جميع الروابط والإعدادات</span>
        </button>
      </div>

      {/* Alert Message */}
      {message && (
        <div
          className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-bold shadow-sm transition-all ${
            message.type === "success"
              ? "border border-emerald-500/40 bg-emerald-50 text-emerald-900"
              : "border border-rose-500/40 bg-rose-50 text-rose-900"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* 1. STORE LINKS & QR CODES LIVE PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Store Links Inputs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-subtle)] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[color:var(--admin-border-subtle)]/80 pb-3">
              <span className="text-xs font-black text-[color:var(--admin-text-primary)] flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-[color:var(--admin-gold)]" />
                روابط صفحات التطبيق في المتاجر الرسمية (Store URLs)
              </span>
              <span className="text-[10px] font-bold text-[color:var(--admin-text-muted)] font-mono">
                تغذي أيقونات ورموز QR في فوتر الموقع
              </span>
            </div>

            {/* Google Play URL Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[color:var(--admin-text-muted)] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  رابط التطبيق في Google Play Store
                </span>
                {googlePlayUrl && (
                  <a
                    href={googlePlayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    تجربة الرابط
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                )}
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={googlePlayUrl}
                  onChange={(e) => setGooglePlayUrl(e.target.value)}
                  placeholder="https://play.google.com/store/apps/details?id=com.lonaliza.app"
                  className="w-full rounded-xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-surface)] px-3.5 py-2.5 text-xs font-mono text-[color:var(--admin-text-primary)] shadow-xs focus:border-[color:var(--admin-gold)] focus:outline-none"
                  dir="ltr"
                />
              </div>
              <p className="text-[10px] text-[color:var(--admin-text-muted)]">
                عند النقر على أيقونة Google Play في الفوتر يتم توجيه العميل فوراً إلى هذا الرابط.
              </p>
            </div>

            {/* Apple App Store URL Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[color:var(--admin-text-muted)] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[color:var(--admin-gold)]" />
                  رابط التطبيق في Apple App Store
                </span>
                {appStoreUrl && (
                  <a
                    href={appStoreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-[color:var(--admin-gold)] hover:underline flex items-center gap-1"
                  >
                    تجربة الرابط
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                )}
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={appStoreUrl}
                  onChange={(e) => setAppStoreUrl(e.target.value)}
                  placeholder="https://apps.apple.com/app/lonaliza-travel/id1669000000"
                  className="w-full rounded-xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-surface)] px-3.5 py-2.5 text-xs font-mono text-[color:var(--admin-text-primary)] shadow-xs focus:border-[color:var(--admin-gold)] focus:outline-none"
                  dir="ltr"
                />
              </div>
              <p className="text-[10px] text-[color:var(--admin-text-muted)]">
                عند النقر على أيقونة App Store في الفوتر يتم توجيه العميل فوراً إلى هذا الرابط.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleSaveAll("تم حفظ وتحديث روابط المتاجر بنجاح!")}
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-[color:var(--admin-gold)] px-4 py-2 text-xs font-black text-foreground hover:opacity-90 transition shadow-xs cursor-pointer"
              >
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span>حفظ وتوليد الـ QR الجديد</span>
              </button>
            </div>
          </div>

          {/* 2. PWA Web App Quick Toggle Card */}
          <div className="rounded-2xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-gold-soft)] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-foreground">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black text-[color:var(--admin-text-primary)]">
                      تطبيق الويب التقدمي (PWA Web App)
                    </h4>
                    <span className="rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                      مجاناً لكافة الباقات
                    </span>
                  </div>
                  <p className="text-[11px] text-[color:var(--admin-text-muted)]">
                    مفعل تلقائياً بنظام إعادة البيع. يمكنك تفعيل أو إيقاف إظهار البانر المنبثق لزوار الموقع.
                  </p>
                </div>
              </div>

              {/* PWA Toggle Button */}
              <button
                type="button"
                onClick={handleTogglePwaBanner}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer shadow-xs ${
                  pwaBannerEnabled
                    ? "bg-emerald-600 hover:bg-emerald-500 text-foreground"
                    : "bg-[color:var(--admin-bg-subtle)] hover:bg-[color:var(--admin-bg-surface)] text-[color:var(--admin-text-muted)]"
                }`}
              >
                {pwaBannerEnabled ? (
                  <>
                    <ToggleRight className="h-4 w-4" />
                    <span>البانر مفعل (يظهر للزوار)</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-4 w-4" />
                    <span>البانر ملغي (مخفي عن الزوار)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Auto-Generated QR Codes Live Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-[color:var(--admin-border-subtle)] bg-gradient-to-b from-slate-900 to-purple-950 p-5 text-[color:var(--admin-gold-foreground)] shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-admin-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-black text-[color:var(--admin-gold)]">
                  معاينة رموز QR التلقائية (Live QR Codes)
                </span>
              </div>
              <span className="text-[10px] font-mono text-[color:var(--admin-text-muted)]">Auto Generated</span>
            </div>

            <p className="text-[11px] text-[color:var(--admin-text-muted)]/90 leading-relaxed">
              يتم توليد هذه الرموز التلقائية من الروابط المدخلة. تظهر في فوتر الموقع على أجهزة الكمبيوتر (Desktop) لمسحها بالهاتف، وتُخفى على الهواتف ليضغط الزائر على الأيقونات مباشرة.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Google Play QR Box */}
              <div className="flex flex-col items-center justify-center rounded-xl bg-[color:var(--admin-bg-subtle)] p-3 border border-admin-border-subtle text-center space-y-2">
                <span className="text-[10px] font-black text-emerald-300">Google Play QR</span>
                {qrCodes.googlePlayQr ? (
                  <div className="bg-white p-1.5 rounded-lg shadow-md">
                    <img
                      src={qrCodes.googlePlayQr}
                      alt="Google Play QR"
                      className="h-28 w-28 object-contain rounded"
                    />
                  </div>
                ) : (
                  <div className="h-28 w-28 bg-[color:var(--admin-bg-subtle)] rounded flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[color:var(--admin-text-muted)]" />
                  </div>
                )}
                <span className="text-[9px] text-[color:var(--admin-text-muted)] font-mono">مسح للتثبيت الفوري</span>
              </div>

              {/* Apple App Store QR Box */}
              <div className="flex flex-col items-center justify-center rounded-xl bg-[color:var(--admin-bg-subtle)] p-3 border border-admin-border-subtle text-center space-y-2">
                <span className="text-[10px] font-black text-[color:var(--admin-gold)]">App Store QR</span>
                {qrCodes.appStoreQr ? (
                  <div className="bg-white p-1.5 rounded-lg shadow-md">
                    <img
                      src={qrCodes.appStoreQr}
                      alt="Apple App Store QR"
                      className="h-28 w-28 object-contain rounded"
                    />
                  </div>
                ) : (
                  <div className="h-28 w-28 bg-[color:var(--admin-bg-subtle)] rounded flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[color:var(--admin-text-muted)]" />
                  </div>
                )}
                <span className="text-[9px] text-[color:var(--admin-text-muted)] font-mono">مسح للتثبيت الفوري</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FLUTTER SOURCE CODE & ARTIFACT DOWNLOADS */}
      <div className="rounded-2xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-subtle)] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[color:var(--admin-border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <FolderArchive className="h-5 w-5 text-[color:var(--admin-gold)]" />
            <h3 className="text-sm font-black text-[color:var(--admin-text-primary)]">
              تنزيل سورس كود Flutter وحزم التطبيق المباشرة (Source Code & Releases)
            </h3>
          </div>
          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300">
            شامل في باقة التملك الكامل
          </span>
        </div>

        <p className="text-xs text-[color:var(--admin-text-muted)] leading-relaxed">
          يمكنك تنزيل السورس كود الكامل لمشروع تطبيق الجوال فلاتر (Lonalizamobilapp) لتعديله أو بنائه محلياً باستخدام VS Code أو Android Studio، أو تنزيل ملف APK الجاهز فوراً:
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Download Flutter Source Code ZIP */}
          <a
            href="/api/admin/mobile-app/download?type=source"
            download="lonaliza-flutter-source.zip"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[color:var(--admin-accent)] to-[color:var(--admin-gold)] px-5 py-3 text-xs font-black text-foreground shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer"
          >
            <FolderArchive className="h-4 w-4 text-[color:var(--admin-gold)] shrink-0" />
            <span>تحميل سورس كود Flutter الكامل (ZIP Archive)</span>
          </a>

          {/* Download Android APK Direct */}
          <a
            href="/app/app-lonaliza-release.apk"
            download="app-lonaliza-release.apk"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-3 text-xs font-black text-foreground shadow-md hover:brightness-110 active:scale-95 transition cursor-pointer"
          >
            <Download className="h-4 w-4 text-foreground shrink-0" />
            <span>تنزيل APK المباشر المدمج (30.9 MB)</span>
          </a>

          {/* Download iOS Project Bundle */}
          <a
            href="/api/admin/mobile-app/download?type=ios"
            download="ios-export-bundle.zip"
            className="flex items-center gap-2 rounded-xl bg-[color:var(--admin-bg-surface)] px-5 py-3 text-xs font-black text-foreground shadow-md hover:bg-[color:var(--admin-bg-subtle)] active:scale-95 transition cursor-pointer"
          >
            <Download className="h-4 w-4 text-[color:var(--admin-gold)] shrink-0" />
            <span>حزمة مشروع iOS (Xcode Bundle)</span>
          </a>
        </div>
      </div>

      {/* 4. GITHUB ACTIONS CI/CD PUBLISHING */}
      <div className="rounded-2xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-canvas)] p-6 text-foreground space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[color:var(--admin-border-subtle)] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-900/60 border border-purple-400/30 text-[color:var(--admin-gold)]">
              <Github className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">
                أتمتة النشر المباشر في المتاجر عبر GitHub Actions (CI/CD Pipeline)
              </h3>
              <p className="text-[11px] text-[color:var(--admin-text-muted)] mt-0.5">
                إطلاق وبناء مسارات Google Play Store و Apple App Store بضغطة زر دون الحاجة لفتح التيرمينال يدوياً.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Google Play Dispatch Button */}
            <button
              type="button"
              onClick={() => handleDispatchGithub("android")}
              disabled={dispatchingTarget !== null}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2.5 text-xs font-black text-foreground shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {dispatchingTarget === "android" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4" />
              )}
              <span>رفع ونشر تحديث Google Play</span>
            </button>

            {/* Apple App Store Dispatch Button */}
            <button
              type="button"
              onClick={() => handleDispatchGithub("ios")}
              disabled={dispatchingTarget !== null}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[color:var(--admin-accent)] to-[color:var(--admin-gold)]  px-4 py-2.5 text-xs font-black text-foreground shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {dispatchingTarget === "ios" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloud className="h-4 w-4" />
              )}
              <span>رفع ونشر تحديث Apple App Store</span>
            </button>
          </div>
        </div>

        {/* GitHub Config Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          <div>
            <label className="text-[11px] font-bold text-[color:var(--admin-text-muted)] block mb-1">
              اسم المستودع (GitHub Repository)
            </label>
            <input
              type="text"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              placeholder="owner/repo"
              className="w-full rounded-xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-surface)] px-3 py-2 text-xs font-mono text-foreground focus:border-[color:var(--admin-gold)] focus:outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[color:var(--admin-text-muted)] block mb-1">
              رمز الوصول (Personal Access Token)
            </label>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_****************"
              className="w-full rounded-xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-surface)] px-3 py-2 text-xs font-mono text-foreground focus:border-[color:var(--admin-gold)] focus:outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[color:var(--admin-text-muted)] block mb-1">
              فرع البناء (Git Branch)
            </label>
            <input
              type="text"
              value={githubBranch}
              onChange={(e) => setGithubBranch(e.target.value)}
              placeholder="main"
              className="w-full rounded-xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-surface)] px-3 py-2 text-xs font-mono text-foreground focus:border-[color:var(--admin-gold)] focus:outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[color:var(--admin-text-muted)] block mb-1">
              ملف أتمتة Android (Workflow)
            </label>
            <input
              type="text"
              value={githubWorkflowAndroid}
              onChange={(e) => setGithubWorkflowAndroid(e.target.value)}
              placeholder="build-android.yml"
              className="w-full rounded-xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-surface)] px-3 py-2 text-xs font-mono text-foreground focus:border-[color:var(--admin-gold)] focus:outline-none"
              dir="ltr"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[color:var(--admin-text-muted)] block mb-1">
              ملف أتمتة iOS (Workflow)
            </label>
            <input
              type="text"
              value={githubWorkflowIos}
              onChange={(e) => setGithubWorkflowIos(e.target.value)}
              placeholder="build-ios.yml"
              className="w-full rounded-xl border border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-surface)] px-3 py-2 text-xs font-mono text-foreground focus:border-[color:var(--admin-gold)] focus:outline-none"
              dir="ltr"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => handleSaveAll("تم حفظ إعدادات GitHub Actions بنجاح!")}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[color:var(--admin-bg-subtle)] hover:bg-[color:var(--admin-bg-surface)]/20 border border-[color:var(--admin-border-subtle)] py-2 text-xs font-bold text-foreground transition cursor-pointer"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              <span>حفظ إعدادات GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
