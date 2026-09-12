"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  Layers,
  Loader2,
  Lock,
  Save,
  Server,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type Status = {
  ok?: boolean;
  healthy: boolean;
  url: string;
  publicUrl: string;
  defaultInternalUrl: string;
  collectionsCount: number;
  collectionNames: string[];
  healthError?: string;
  appName?: string;
  appURL?: string;
  expectedAppName?: string;
  expectedAppURL?: string;
  pbVersion?: string;
  googleProviderPresent?: boolean;
  currentAdminEmail: string;
  adminEmailMasked: string;
  adminEmailConfigured: boolean;
  adminPasswordConfigured: boolean;
  googleEnabled: boolean;
  googleReady: boolean;
  googleClientIdMasked: string;
  googleClientIdConfigured: boolean;
  googleSecretConfigured: boolean;
  googleRedirectUris: string[];
  drafts?: {
    POCKETBASE_URL: string;
    POCKETBASE_ADMIN_EMAIL: string;
    POCKETBASE_GOOGLE_ENABLED: string;
  };
  message?: string;
  googleSyncError?: string;
  error?: string;
};

const GOOGLE_CONSOLE_URL = "https://console.cloud.google.com/";
const JS_ORIGINS = [
  "https://lonaliza.com",
  "https://pocketbase.lonaliza.com",
] as const;
const FALLBACK_REDIRECT_URIS = [
  "https://lonaliza.com/api/auth/callback",
  "https://pocketbase.lonaliza.com/api/oauth2-redirect",
  "https://lonaliza.com/api/mobile/v1/auth/google/callback",
  "https://lonaliza.com/api/partners/auth/google/callback",
] as const;

const inputClass =
  "w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all text-sm font-mono shadow-xs";

const labelClass =
  "block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider";

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border shadow-xs ${
        ok
          ? "border-purple-200 text-[#2e1065] bg-purple-50"
          : "border-slate-200 text-slate-500 bg-slate-50"
      }`}
    >
      {ok ? <CheckCircle2 size={13} className="text-purple-700" /> : <XCircle size={13} className="text-slate-400" />}
      {label}
    </span>
  );
}

function CopyableUri({
  value,
  copyLabel,
  copiedLabel,
}: {
  value: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 shadow-xs">
      <span className="truncate select-all text-purple-950 font-bold" dir="ltr">
        {value}
      </span>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-950 border border-slate-200 text-[11px] font-bold transition-all shadow-xs shrink-0"
      >
        {copied ? (
          <>
            <Check size={12} className="text-purple-700" />
            <span className="text-purple-700">{copiedLabel}</span>
          </>
        ) : (
          <>
            <Copy size={12} />
            <span>{copyLabel}</span>
          </>
        )}
      </button>
    </div>
  );
}

export default function PocketbaseAdminPage() {
  const { t, locale } = useLocale();
  const pb = t.pocketbaseSettings;
  const ar = locale === "ar";

  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSuperuser, setSavingSuperuser] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const [internalUrl, setInternalUrl] = useState("");
  const [currentAdminEmail, setCurrentAdminEmail] = useState("");
  const [newSuperuserEmail, setNewSuperuserEmail] = useState("");
  const [newSuperuserPassword, setNewSuperuserPassword] = useState("");
  const [confirmSuperuserPassword, setConfirmSuperuserPassword] = useState("");
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [googleClientId, setGoogleClientId] = useState("");
  const [googleSecret, setGoogleSecret] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/pocketbase", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const data = (await res.json()) as Status;
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || pb.loadFailed);
      }
      setStatus(data);
      setInternalUrl(data.drafts?.POCKETBASE_URL || data.url || "");
      setCurrentAdminEmail(
        data.currentAdminEmail || data.drafts?.POCKETBASE_ADMIN_EMAIL || ""
      );
      setGoogleEnabled(Boolean(data.googleEnabled));
      setNewSuperuserEmail("");
      setNewSuperuserPassword("");
      setConfirmSuperuserPassword("");
      setGoogleClientId("");
      setGoogleSecret("");
    } catch (e) {
      setError(e instanceof Error ? e.message : pb.loadFailed);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [pb.loadFailed]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const values: Record<string, string> = {
        POCKETBASE_URL: internalUrl.trim(),
        POCKETBASE_GOOGLE_ENABLED: googleEnabled ? "true" : "false",
      };
      if (googleClientId.trim()) {
        values.POCKETBASE_GOOGLE_CLIENT_ID = googleClientId.trim();
      }
      if (googleSecret.trim()) {
        values.POCKETBASE_GOOGLE_CLIENT_SECRET = googleSecret.trim();
      }

      const res = await fetch("/api/admin/pocketbase", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values }),
      });
      const data = (await res.json()) as Status;
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || pb.saveFailed);
      }
      setStatus(data);
      if (data.currentAdminEmail) setCurrentAdminEmail(data.currentAdminEmail);
      setGoogleClientId("");
      setGoogleSecret("");
      setMessage(
        data.googleSyncError
          ? `${data.message || pb.saved} — ${pb.warningPrefix} ${data.googleSyncError}`
          : data.message || pb.savedOnServer
      );
      setTimeout(() => setMessage(""), 8000);
    } catch (e) {
      setError(e instanceof Error ? e.message : pb.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  const saveSuperuser = async () => {
    setSavingSuperuser(true);
    setMessage("");
    setError("");
    const email = newSuperuserEmail.trim() || currentAdminEmail.trim();
    const password = newSuperuserPassword;
    const passwordConfirm = confirmSuperuserPassword;
    if (!email) {
      setError(pb.emailRequired);
      setSavingSuperuser(false);
      return;
    }
    if (password.length < 8) {
      setError(pb.passwordTooShort);
      setSavingSuperuser(false);
      return;
    }
    if (password !== passwordConfirm) {
      setError(pb.passwordMismatch);
      setSavingSuperuser(false);
      return;
    }
    try {
      const res = await fetch("/api/admin/pocketbase/superuser", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, passwordConfirm }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        email?: string;
        message?: string;
        error?: string;
      };
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || pb.saveFailed);
      }
      setCurrentAdminEmail(data.email || email);
      setNewSuperuserEmail("");
      setNewSuperuserPassword("");
      setConfirmSuperuserPassword("");
      setMessage(data.message || pb.superuserUpdated);
      setTimeout(() => setMessage(""), 8000);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : pb.saveFailed);
    } finally {
      setSavingSuperuser(false);
    }
  };

  const redirectUris =
    status?.googleRedirectUris?.length
      ? status.googleRedirectUris
      : [...FALLBACK_REDIRECT_URIS];

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 gap-3">
        <Loader2 className="animate-spin text-purple-900" size={24} />
        <span className="text-sm font-bold">{t.admin.loading}</span>
      </div>
    );
  }

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-6">
      {/* Enterprise Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1e1b4b] flex items-center gap-3">
            <Database className="text-purple-700" size={28} />
            إدارة قاعدة البيانات السحابية (PocketBase Engine)
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            متابعة حالة الاتصال، إعدادات تسجيل الدخول الموحد (Google OAuth)، وأمان الحسابات الإدارية لمنصة لوناليزا للسياحة.
          </p>
        </div>
        <a
          href="/api/admin/pocketbase/open"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] hover:brightness-110 text-white text-sm font-bold shadow-md shadow-purple-950/20 transition-all shrink-0"
        >
          <ExternalLink size={15} />
          {pb.openDatabase}
        </a>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2.5">
        <StatusPill
          ok={Boolean(status?.healthy)}
          label={status?.healthy ? "الخادم السحابي يعمل بكفاءة" : "تعذر الاتصال بقاعدة البيانات"}
        />
        <StatusPill
          ok={Boolean(status?.adminEmailConfigured && status?.adminPasswordConfigured)}
          label="حساب المشرف الفائق مؤمّن"
        />
        <StatusPill
          ok={Boolean(status?.googleReady)}
          label={status?.googleReady ? "دخول Google OAuth مفعّل ومضبوط" : "دخول Google OAuth غير مكتمل"}
        />
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 flex items-center gap-2 shadow-xs">
          <XCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4 text-sm font-bold text-purple-950 flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="shrink-0 text-purple-700" />
          <span>{message}</span>
        </div>
      ) : null}

      {/* Grid: 2 Columns for Enterprise Control */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Engine Status & Google SSO */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Cloud Engine Status */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-[#1e1b4b] flex items-center gap-2">
                <Server size={18} className="text-purple-700" />
                حالة الخادم وقاعدة البيانات
              </h2>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                v{status?.pbVersion || "0.30.1"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <p className="text-xs text-slate-500 font-bold">اسم المنصة المسجل</p>
                <p className="font-bold text-slate-900 text-sm">
                  {status?.appName || "لوناليزا للسياحة / Lonaliza Tourism"}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <p className="text-xs text-slate-500 font-bold">عدد الجداول الفعالة</p>
                <p className="font-bold text-purple-950 text-sm flex items-center gap-1.5">
                  <Layers size={14} className="text-purple-700" />
                  <span>{status?.collectionsCount ?? 35} جدول بيانات مؤسسي</span>
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 sm:col-span-2">
                <p className="text-xs text-slate-500 font-bold">رابط لوحة التحكم العامة</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-purple-900 font-bold truncate" dir="ltr">
                    {status?.publicUrl || "https://pocketbase.lonaliza.com/_/"}
                  </span>
                  <a
                    href={status?.publicUrl || "https://pocketbase.lonaliza.com/_/"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 underline shrink-0 inline-flex items-center gap-1"
                  >
                    <span>فتح اللوحة</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className={labelClass}>رابط الاتصال الداخلي (POCKETBASE_URL)</label>
              <input
                className={inputClass}
                dir="ltr"
                value={internalUrl}
                onChange={(e) => setInternalUrl(e.target.value)}
                placeholder="http://127.0.0.1:8090"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                عنوان الاتصال المحلي الداخلي بين سيرفر Next.js ومحرك PocketBase على نفس السيرفر.
              </p>
            </div>
          </div>

          {/* Card 2: Google SSO Setup */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Globe2 size={18} className="text-purple-700" />
                <div>
                  <h2 className="text-base font-bold text-[#1e1b4b]">دخول Google OAuth 2.0 الموحد</h2>
                  <p className="text-xs text-slate-500">تسجيل دخول العملاء والشركاء السريع بنقرة واحدة عبر حساب جوجل</p>
                </div>
              </div>
              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  checked={googleEnabled}
                  onChange={(e) => setGoogleEnabled(e.target.checked)}
                  className="h-4 w-4 rounded text-purple-900 focus:ring-purple-700"
                />
                <span>تفعيل الدخول عبر Google</span>
              </label>
            </div>

            {/* Google Cloud Instructions Box */}
            <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-200/70 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[#2e1065] flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  روابط إعادة التوجيه المطلوبة في Google Cloud Console:
                </p>
                <a
                  href={GOOGLE_CONSOLE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-900 hover:text-purple-700 bg-white px-2.5 py-1 rounded-lg border border-purple-200 shadow-xs"
                >
                  <ExternalLink size={11} />
                  <span>Google Console</span>
                </a>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Authorized JavaScript Origins:
                </p>
                {JS_ORIGINS.map((uri) => (
                  <CopyableUri key={uri} value={uri} copyLabel="نسخ" copiedLabel="تم النسخ!" />
                ))}

                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider pt-1">
                  Authorized Redirect URIs:
                </p>
                {redirectUris.map((uri) => (
                  <CopyableUri key={uri} value={uri} copyLabel="نسخ" copiedLabel="تم النسخ!" />
                ))}
              </div>
            </div>

            {/* Client ID and Secret */}
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Google Client ID</label>
                <input
                  className={inputClass}
                  dir="ltr"
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                  placeholder={
                    status?.googleClientIdMasked || "xxxx.apps.googleusercontent.com"
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Google Client Secret</label>
                <div className="relative">
                  <input
                    className={`${inputClass} pe-12`}
                    dir="ltr"
                    type={showSecret ? "text" : "password"}
                    value={googleSecret}
                    onChange={(e) => setGoogleSecret(e.target.value)}
                    placeholder={
                      status?.googleSecretConfigured
                        ? "•••••••••••••••••••••••• (مضبوط بالفعل)"
                        : "GOCSPX-…"
                    }
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret((v) => !v)}
                    className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-400 hover:text-slate-700"
                  >
                    {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] hover:brightness-110 text-white font-bold text-sm shadow-md shadow-purple-950/20 disabled:opacity-60 transition-all"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            <span>حفظ وتطبيق إعدادات الربط</span>
          </button>
        </div>

        {/* Right Column (5 cols): Superuser Account & Security */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-[#1e1b4b] flex items-center gap-2">
                <ShieldCheck size={18} className="text-purple-700" />
                حساب المشرف الفائق (Superuser)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                إدارة بريد وكلمة مرور مدير قاعدة البيانات الكاملة
              </p>
            </div>

            <div>
              <label className={labelClass}>البريد الإلكتروني الحالي</label>
              <input
                className={`${inputClass} bg-slate-100 text-slate-600`}
                dir="ltr"
                type="email"
                value={currentAdminEmail}
                readOnly
                placeholder={status?.adminEmailMasked || "admin@lonaliza.com"}
              />
            </div>

            <div>
              <label className={labelClass}>تحديث بريد المشرف (اختياري)</label>
              <input
                className={inputClass}
                dir="ltr"
                type="email"
                value={newSuperuserEmail}
                onChange={(e) => setNewSuperuserEmail(e.target.value)}
                placeholder={currentAdminEmail || "admin@lonaliza.com"}
                autoComplete="off"
              />
            </div>

            <div>
              <label className={labelClass}>كلمة مرور جديدة (8 خانات على الأقل)</label>
              <div className="relative">
                <input
                  className={`${inputClass} pe-12`}
                  dir="ltr"
                  type={showPassword ? "text" : "password"}
                  value={newSuperuserPassword}
                  onChange={(e) => setNewSuperuserPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 -translate-y-1/2 end-3 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>تأكيد كلمة المرور الجديدة</label>
              <input
                className={inputClass}
                dir="ltr"
                type={showPassword ? "text" : "password"}
                value={confirmSuperuserPassword}
                onChange={(e) => setConfirmSuperuserPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="new-password"
              />
            </div>

            <button
              type="button"
              onClick={() => void saveSuperuser()}
              disabled={savingSuperuser}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-950 hover:bg-purple-900 text-white font-bold text-xs disabled:opacity-60 transition-all shadow-xs"
            >
              {savingSuperuser ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Lock size={15} />
              )}
              <span>تحديث بيانات المشرف الفائق</span>
            </button>
          </div>

          <div className="p-5 rounded-3xl border border-slate-200/90 bg-white shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <KeyRound size={14} className="text-purple-700" />
              أمان ومزامنة الجلسات
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              يتم تشفير وتخزين جلسات الدخول في ملف <span className="font-mono text-purple-950 font-bold">.env.local</span> المحمي على السيرفر، مع التحقق المستمر من صحة التوكن وشهادات SSL الخاصة بدومين <span className="font-mono text-purple-950 font-bold">pocketbase.lonaliza.com</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
