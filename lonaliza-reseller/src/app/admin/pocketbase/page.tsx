"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Save,
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
] as const;

const inputClass =
  "w-full px-4 py-3 bg-slate-900/80 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-sm font-mono";

const labelClass =
  "block text-xs font-semibold text-white/40 mb-1.5 uppercase tracking-wider";

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${
        ok
          ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
          : "border-white/10 text-white/40 bg-white/[0.03]"
      }`}
    >
      {ok ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
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
    } catch {
      // Clipboard may be blocked; URI remains selectable.
    }
  };

  return (
    <div
      className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2"
      dir="ltr"
    >
      <code className="flex-1 font-mono text-amber-200 break-all text-xs">
        {value}
      </code>
      <button
        type="button"
        onClick={() => void copy()}
        className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/55 hover:text-white px-2 py-1 rounded-md hover:bg-white/10 transition-colors"
      >
        <Copy size={12} />
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}

export default function AdminPocketBasePage() {
  const { t, locale } = useLocale();
  const pb = t.pocketbaseSettings;
  const listSep = locale === "ar" ? "، " : ", ";

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
      <div className="flex items-center justify-center py-24 text-white/50 gap-3">
        <Loader2 className="animate-spin" size={20} />
        {t.admin.loading}
      </div>
    );
  }

  return (
    <div className="admin-page w-full max-w-none min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Database className="text-amber-400" size={28} />
            {t.admin.pocketbase}
          </h1>
          <p className="text-white/50 mt-1">{pb.subtitle}</p>
        </div>
        <a
          href="/api/admin/pocketbase/open"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold transition-colors"
        >
          <ExternalLink size={15} />
          {pb.openDatabase}
        </a>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <StatusPill
          ok={Boolean(status?.healthy)}
          label={status?.healthy ? pb.statusHealthy : pb.statusUnhealthy}
        />
        <StatusPill
          ok={Boolean(status?.adminEmailConfigured && status?.adminPasswordConfigured)}
          label={pb.adminAccount}
        />
        <StatusPill
          ok={Boolean(status?.googleReady)}
          label={status?.googleReady ? pb.googleOn : pb.googleOff}
        />
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {message}
        </div>
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6 space-y-3">
        <h2 className="text-white font-semibold">{pb.connectionStatus}</h2>
        <p className="text-sm text-white/60">
          {pb.internalServerUrl}{" "}
          <span className="font-mono text-white/80" dir="ltr">
            {status?.url || status?.defaultInternalUrl}
          </span>
        </p>
        <p className="text-sm text-white/60">
          {pb.publicAdminUrl}{" "}
          <a
            href={status?.publicUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-amber-300 underline"
            dir="ltr"
          >
            {status?.publicUrl}
          </a>
        </p>
        <p className="text-sm text-white/60">
          {pb.collectionsCount}{" "}
          <span className="text-white font-semibold">
            {status?.collectionsCount ?? 0}
          </span>
          {status?.collectionNames?.length ? (
            <span className="text-white/40">
              {" "}
              — {status.collectionNames.join(listSep)}
            </span>
          ) : null}
        </p>
        {status?.healthError ? (
          <p className="text-sm text-amber-300">{status.healthError}</p>
        ) : null}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6 space-y-3">
        <h2 className="text-white font-semibold">{pb.appSettingsTitle}</h2>
        <p className="text-sm text-white/60">
          {pb.appNameLabel}{" "}
          <span className="text-white font-semibold">
            {status?.appName || status?.expectedAppName}
          </span>
        </p>
        <p className="text-sm text-white/60">
          {pb.appUrlLabel}{" "}
          <span className="font-mono text-amber-200" dir="ltr">
            {status?.appURL || status?.expectedAppURL}
          </span>
        </p>
        <p className="text-sm text-amber-200/90">{pb.appUrlMustStay}</p>
        <p className="text-xs text-white/40">
          PocketBase v{status?.pbVersion || "0.30.1"} — {pb.pbVersionNote}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6 space-y-4">
        <h2 className="text-white font-semibold">{pb.connectionAndAdmin}</h2>
        <div>
          <label className={labelClass}>POCKETBASE_URL</label>
          <input
            className={inputClass}
            dir="ltr"
            value={internalUrl}
            onChange={(e) => setInternalUrl(e.target.value)}
            placeholder="http://127.0.0.1:8090"
          />
          <p className="mt-1.5 text-xs text-white/35">
            {pb.internalUrlHint}{" "}
            <span dir="ltr">https://pocketbase.lonaliza.com</span>
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6 space-y-4">
        <h2 className="text-white font-semibold">{pb.superuserTitle}</h2>
        <p className="text-sm text-white/45">{pb.superuserHint}</p>
        <div>
          <label className={labelClass}>{pb.currentEmail}</label>
          <input
            className={`${inputClass} opacity-80`}
            dir="ltr"
            type="email"
            value={currentAdminEmail}
            readOnly
            placeholder={status?.adminEmailMasked || "—"}
          />
        </div>
        <div>
          <label className={labelClass}>{pb.newEmail}</label>
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
          <label className={labelClass}>{pb.newPassword}</label>
          <div className="relative">
            <input
              className={`${inputClass} pe-12`}
              dir="ltr"
              type={showPassword ? "text" : "password"}
              value={newSuperuserPassword}
              onChange={(e) => setNewSuperuserPassword(e.target.value)}
              placeholder={pb.passwordPlaceholder}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 -translate-y-1/2 end-3 text-white/35 hover:text-white/70"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className={labelClass}>{pb.confirmPassword}</label>
          <input
            className={inputClass}
            dir="ltr"
            type={showPassword ? "text" : "password"}
            value={confirmSuperuserPassword}
            onChange={(e) => setConfirmSuperuserPassword(e.target.value)}
            placeholder={pb.confirmPassword}
            autoComplete="new-password"
          />
        </div>
        <button
          type="button"
          onClick={() => void saveSuperuser()}
          disabled={savingSuperuser}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm disabled:opacity-60"
        >
          {savingSuperuser ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {pb.updateSuperuser}
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-white font-semibold">{pb.googleLoginTitle}</h2>
          <label className="inline-flex items-center gap-2 text-sm text-white/70 cursor-pointer">
            <input
              type="checkbox"
              checked={googleEnabled}
              onChange={(e) => setGoogleEnabled(e.target.checked)}
              className="h-4 w-4 accent-amber-500"
            />
            {pb.enableGoogle}
          </label>
        </div>
        <p className="text-sm text-white/45">{pb.googleHint}</p>

        <div className="rounded-xl border border-sky-500/30 bg-sky-500/[0.08] p-4 text-sm text-white/80 space-y-2">
          <p className="font-semibold text-white">{pb.googleWhereTitle}</p>
          <p>{pb.googleWhereBody}</p>
          <p className="text-amber-200">{pb.googleNotInApplication}</p>
        </div>

        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4 text-sm text-white/75 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="font-semibold text-white">{pb.googleHelpTitle}</p>
              <p className="mt-1 text-white/60">{pb.googleHelpIntro}</p>
            </div>
            <a
              href={GOOGLE_CONSOLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-amber-200 text-xs font-semibold transition-colors"
            >
              <ExternalLink size={13} />
              {pb.googleHelpOpenConsole}
            </a>
          </div>

          <p className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/65">
            {pb.googleHelpAdminNote}
          </p>

          <ol className="list-decimal ps-5 space-y-3 marker:text-amber-300 marker:font-semibold">
            <li>
              {pb.googleHelpStep1}{" "}
              <a
                href={GOOGLE_CONSOLE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-300 underline font-mono"
                dir="ltr"
              >
                console.cloud.google.com
              </a>
            </li>
            <li>{pb.googleHelpStep2}</li>
            <li>{pb.googleHelpStep3}</li>
            <li>{pb.googleHelpStep4}</li>
            <li>
              <p>{pb.googleHelpStep5}</p>
              <p className="mt-1.5 mb-1.5 text-[11px] uppercase tracking-wider text-white/40 font-semibold">
                {pb.googleHelpOriginsLabel}
              </p>
              <div className="space-y-1.5">
                {JS_ORIGINS.map((uri) => (
                  <CopyableUri
                    key={uri}
                    value={uri}
                    copyLabel={pb.copy}
                    copiedLabel={pb.copied}
                  />
                ))}
              </div>
            </li>
            <li>
              <p>{pb.googleHelpStep6}</p>
              <p className="mt-1.5 mb-1.5 text-[11px] uppercase tracking-wider text-white/40 font-semibold">
                {pb.googleHelpRedirectsLabel}
                <span className="ms-2 normal-case tracking-normal font-normal text-amber-200/80">
                  {pb.googleHelpRedirectExact}
                </span>
              </p>
              <div className="space-y-1.5">
                {redirectUris.map((uri) => (
                  <CopyableUri
                    key={uri}
                    value={uri}
                    copyLabel={pb.copy}
                    copiedLabel={pb.copied}
                  />
                ))}
              </div>
            </li>
            <li>{pb.googleHelpStep7}</li>
            <li>{pb.googleHelpStep8}</li>
          </ol>
        </div>

        <div>
          <label className={labelClass}>{pb.clientId}</label>
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
          <label className={labelClass}>{pb.clientSecret}</label>
          <div className="relative">
            <input
              className={`${inputClass} pe-12`}
              dir="ltr"
              type={showSecret ? "text" : "password"}
              value={googleSecret}
              onChange={(e) => setGoogleSecret(e.target.value)}
              placeholder={
                status?.googleSecretConfigured
                  ? pb.secretKeepHint
                  : "GOCSPX-…"
              }
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowSecret((v) => !v)}
              className="absolute top-1/2 -translate-y-1/2 end-3 text-white/35 hover:text-white/70"
            >
              {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm disabled:opacity-60"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        {pb.saveSettings}
      </button>
    </div>
  );
}
