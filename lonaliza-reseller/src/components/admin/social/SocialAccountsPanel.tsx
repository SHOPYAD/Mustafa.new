"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Facebook,
  Instagram,
  KeyRound,
  Link2,
  Loader2,
  Music2,
  RefreshCw,
  Share2,
  ShieldCheck,
  Sparkles,
  Unplug,
  Youtube,
} from "lucide-react";
import {
  AdminPage,
  AdminPageHeader,
} from "@/components/admin/layout";
import type {
  PublicSocialAccount,
  SocialCredentialsStatus,
  SocialProvider,
} from "@/lib/social/types";
import { SOCIAL_COPY } from "./copy";

type DashboardResponse = {
  ok: boolean;
  accounts?: PublicSocialAccount[];
  credentials?: SocialCredentialsStatus[];
  error?: string;
};

const statusClass: Record<PublicSocialAccount["status"], string> = {
  connected: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
  disconnected: "bg-muted text-muted-foreground border-border",
  needs_reauth: "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30",
};

function PlatformIcon({ platform }: { platform: PublicSocialAccount["platform"] }) {
  switch (platform) {
    case "facebook":
      return <Facebook className="size-4 text-blue-600" />;
    case "instagram":
      return <Instagram className="size-4 text-pink-600" />;
    case "youtube":
      return <Youtube className="size-4 text-red-600" />;
    case "tiktok":
      return <Music2 className="size-4 text-foreground" />;
    case "x":
      return <Share2 className="size-4 text-sky-600" />;
    default: {
      const _never: never = platform;
      return <Share2 className="size-4" aria-label={String(_never)} />;
    }
  }
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("ar", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function SocialAccountsPanel() {
  const search = useSearchParams();
  const [accounts, setAccounts] = useState<PublicSocialAccount[]>([]);
  const [credentials, setCredentials] = useState<SocialCredentialsStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form states for in-UI key saving
  const [keysForm, setKeysForm] = useState<{
    metaAppId: string;
    metaAppSecret: string;
    youtubeClientId: string;
    youtubeClientSecret: string;
    tiktokClientKey: string;
    tiktokClientSecret: string;
    xClientId: string;
    xClientSecret: string;
  }>({
    metaAppId: "",
    metaAppSecret: "",
    youtubeClientId: "",
    youtubeClientSecret: "",
    tiktokClientKey: "",
    tiktokClientSecret: "",
    xClientId: "",
    xClientSecret: "",
  });

  const [savingProvider, setSavingProvider] = useState<string | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({
    tiktok: true,
    meta: true,
    youtube: true,
    x: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/social/accounts", { cache: "no-store" });
      const data = (await res.json()) as DashboardResponse;
      if (!data.ok) {
        setError(data.error || "تعذر تحميل الحسابات");
        return;
      }
      setAccounts(data.accounts || []);
      setCredentials(data.credentials || []);
      setError("");
    } catch {
      setError("تعذر تحميل الحسابات");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const err = search.get("error");
    const connected = search.get("connected");
    const detail = search.get("detail");
    if (err) {
      setError(
        [SOCIAL_COPY.errors[err] || err, detail].filter(Boolean).join(" — ")
      );
    }
    if (connected) {
      setNotice(SOCIAL_COPY.connected[connected] || `تم الربط: ${connected}`);
    }
  }, [search]);

  const banner = useMemo(() => notice || error, [notice, error]);

  async function handleSaveCredentials(provider: SocialProvider) {
    setSavingProvider(provider);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/social/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          ...keysForm,
        }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string; error?: string; credentials?: SocialCredentialsStatus[] };
      if (!data.ok) {
        setError(data.error || "فشل حفظ المفاتيح");
        return;
      }
      setNotice(data.message || SOCIAL_COPY.keysSaved);
      if (data.credentials) {
        setCredentials(data.credentials);
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل حفظ المفاتيح");
    } finally {
      setSavingProvider(null);
    }
  }

  async function copyToClipboard(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      // Fallback
    }
  }

  async function disconnect(id: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/social/accounts/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: id }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error || "فشل قطع الاتصال");
        return;
      }
      setNotice("تم قطع الاتصال");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function refresh(id: string) {
    setBusyId(id);
    try {
      const res = await fetch("/api/social/accounts/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: id }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!data.ok) {
        setError(data.error || "فشل تحديث الرمز");
        return;
      }
      setNotice("تم تحديث الرمز");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors";
  const labelClass = "block text-xs font-semibold text-foreground/80 mb-1.5";

  return (
    <AdminPage>
      <AdminPageHeader
        title={SOCIAL_COPY.title}
        description={SOCIAL_COPY.description}
        icon={<Share2 className="size-5 text-emerald-500" />}
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors shadow-sm"
          >
            <RefreshCw className="size-4" />
            {SOCIAL_COPY.refresh}
          </button>
        }
      />

      {banner ? (
        <div
          className={`mb-6 rounded-2xl border px-4 py-3.5 text-sm font-medium transition-all shadow-sm ${
            error
              ? "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-200"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
          }`}
        >
          {banner}
        </div>
      ) : null}

      {/* Social Platforms Connection Grid */}
      <div className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 1. TIKTOK */}
        {(() => {
          const cred = credentials.find((c) => c.provider === "tiktok");
          const isConfigured = cred?.configured ?? false;
          const isSaving = savingProvider === "tiktok";
          return (
            <section className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:border-border/80">
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-2xl border border-border bg-foreground text-background shadow-sm">
                      <Music2 className="size-6" />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">تيك توك (TikTok)</h2>
                      <p className="text-xs text-muted-foreground">نشر الفيديوهات والريلز تلقائياً عبر TikTok API</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                      isConfigured
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300"
                    }`}
                  >
                    {isConfigured ? SOCIAL_COPY.configured : SOCIAL_COPY.notConfigured}
                  </span>
                </div>

                <div className="mb-4 rounded-2xl border border-border/80 bg-muted/40 p-4">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-muted-foreground">{SOCIAL_COPY.redirectUri}</span>
                    <button
                      type="button"
                      onClick={() => void copyToClipboard(cred?.redirectUri || "https://lonaliza.com/api/oauth/tiktok/callback", "tiktok-uri")}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                    >
                      {copiedKey === "tiktok-uri" ? (
                        <>
                          <Check className="size-3.5" />
                          {SOCIAL_COPY.copied}
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          {SOCIAL_COPY.copyRedirectUri}
                        </>
                      )}
                    </button>
                  </div>
                  <code className="block break-all rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs font-mono text-foreground select-all">
                    {cred?.redirectUri || "https://lonaliza.com/api/oauth/tiktok/callback"}
                  </code>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className={labelClass}>مفتاح العميل (Client Key)</label>
                    <input
                      type="text"
                      autoComplete="off"
                      className={inputClass}
                      placeholder={isConfigured ? "مفتاح محفوظ — الصق مفتاحاً جديداً للتعديل" : "الصق Client Key من TikTok Developer Portal"}
                      value={keysForm.tiktokClientKey}
                      onChange={(e) => setKeysForm({ ...keysForm, tiktokClientKey: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>المفتاح السري (Client Secret)</label>
                    <input
                      type="password"
                      autoComplete="off"
                      className={inputClass}
                      placeholder={isConfigured ? "••••••••••••••••" : "الصق Client Secret من TikTok Developer Portal"}
                      value={keysForm.tiktokClientSecret}
                      onChange={(e) => setKeysForm({ ...keysForm, tiktokClientSecret: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <button
                  type="button"
                  disabled={isSaving || (!keysForm.tiktokClientKey && !keysForm.tiktokClientSecret)}
                  onClick={() => void handleSaveCredentials("tiktok")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSaving ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
                  {isSaving ? SOCIAL_COPY.savingKeys : SOCIAL_COPY.saveKeys}
                </button>

                <a
                  href={isConfigured ? "/api/oauth/tiktok" : "#"}
                  onClick={(e) => {
                    if (!isConfigured) {
                      e.preventDefault();
                      setError(SOCIAL_COPY.errors.tiktok_app_required);
                    }
                  }}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold text-white transition-all shadow-md ${
                    isConfigured
                      ? "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:!text-slate-950 dark:hover:bg-white/90"
                      : "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
                  }`}
                >
                  <Music2 className="size-4" />
                  {SOCIAL_COPY.connectTiktok}
                </a>
              </div>
            </section>
          );
        })()}

        {/* 2. META (Facebook + Instagram) */}
        {(() => {
          const cred = credentials.find((c) => c.provider === "meta");
          const isConfigured = cred?.configured ?? false;
          const isSaving = savingProvider === "meta";
          return (
            <section className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:border-border/80">
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-600 text-white shadow-sm">
                      <Facebook className="size-6" />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">ميتا (فيسبوك وإنستغرام)</h2>
                      <p className="text-xs text-muted-foreground">نشر منشورات وقصص وريلز على صفحات الأعمال</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                      isConfigured
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300"
                    }`}
                  >
                    {isConfigured ? SOCIAL_COPY.configured : SOCIAL_COPY.notConfigured}
                  </span>
                </div>

                <div className="mb-4 rounded-2xl border border-border/80 bg-muted/40 p-4">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-muted-foreground">{SOCIAL_COPY.redirectUri}</span>
                    <button
                      type="button"
                      onClick={() => void copyToClipboard(cred?.redirectUri || "https://lonaliza.com/api/oauth/meta/callback", "meta-uri")}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                    >
                      {copiedKey === "meta-uri" ? (
                        <>
                          <Check className="size-3.5" />
                          {SOCIAL_COPY.copied}
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          {SOCIAL_COPY.copyRedirectUri}
                        </>
                      )}
                    </button>
                  </div>
                  <code className="block break-all rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs font-mono text-foreground select-all">
                    {cred?.redirectUri || "https://lonaliza.com/api/oauth/meta/callback"}
                  </code>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className={labelClass}>معرّف التطبيق (App ID)</label>
                    <input
                      type="text"
                      autoComplete="off"
                      className={inputClass}
                      placeholder={isConfigured ? "معرّف محفوظ — الصق معرّفاً جديداً للتعديل" : "الصق App ID من Meta for Developers"}
                      value={keysForm.metaAppId}
                      onChange={(e) => setKeysForm({ ...keysForm, metaAppId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>المفتاح السري للتطبيق (App Secret)</label>
                    <input
                      type="password"
                      autoComplete="off"
                      className={inputClass}
                      placeholder={isConfigured ? "••••••••••••••••" : "الصق App Secret من Meta for Developers"}
                      value={keysForm.metaAppSecret}
                      onChange={(e) => setKeysForm({ ...keysForm, metaAppSecret: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <button
                  type="button"
                  disabled={isSaving || (!keysForm.metaAppId && !keysForm.metaAppSecret)}
                  onClick={() => void handleSaveCredentials("meta")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSaving ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
                  {isSaving ? SOCIAL_COPY.savingKeys : SOCIAL_COPY.saveKeys}
                </button>

                <a
                  href={isConfigured ? "/api/oauth/meta" : "#"}
                  onClick={(e) => {
                    if (!isConfigured) {
                      e.preventDefault();
                      setError(SOCIAL_COPY.errors.missing_credentials);
                    }
                  }}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold text-white transition-all shadow-md ${
                    isConfigured
                      ? "bg-blue-600 hover:bg-blue-500"
                      : "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
                  }`}
                >
                  <Link2 className="size-4" />
                  {SOCIAL_COPY.connectMeta}
                </a>
              </div>
            </section>
          );
        })()}

        {/* 3. YOUTUBE */}
        {(() => {
          const cred = credentials.find((c) => c.provider === "youtube");
          const isConfigured = cred?.configured ?? false;
          const isSaving = savingProvider === "youtube";
          return (
            <section className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:border-border/80">
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-2xl border border-red-500/20 bg-red-600 text-white shadow-sm">
                      <Youtube className="size-6" />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">يوتيوب (YouTube)</h2>
                      <p className="text-xs text-muted-foreground">رفع الفيديوهات القصيرة والشورتس عبر Google API</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                      isConfigured
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300"
                    }`}
                  >
                    {isConfigured ? SOCIAL_COPY.configured : SOCIAL_COPY.notConfigured}
                  </span>
                </div>

                <div className="mb-4 rounded-2xl border border-border/80 bg-muted/40 p-4">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-muted-foreground">{SOCIAL_COPY.redirectUri}</span>
                    <button
                      type="button"
                      onClick={() => void copyToClipboard(cred?.redirectUri || "https://lonaliza.com/api/oauth/youtube/callback", "yt-uri")}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                    >
                      {copiedKey === "yt-uri" ? (
                        <>
                          <Check className="size-3.5" />
                          {SOCIAL_COPY.copied}
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          {SOCIAL_COPY.copyRedirectUri}
                        </>
                      )}
                    </button>
                  </div>
                  <code className="block break-all rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs font-mono text-foreground select-all">
                    {cred?.redirectUri || "https://lonaliza.com/api/oauth/youtube/callback"}
                  </code>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className={labelClass}>معرّف العميل (Client ID)</label>
                    <input
                      type="text"
                      autoComplete="off"
                      className={inputClass}
                      placeholder={isConfigured ? "معرّف محفوظ — الصق معرّفاً جديداً للتعديل" : "الصق Client ID من Google Cloud Console"}
                      value={keysForm.youtubeClientId}
                      onChange={(e) => setKeysForm({ ...keysForm, youtubeClientId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>المفتاح السري للعميل (Client Secret)</label>
                    <input
                      type="password"
                      autoComplete="off"
                      className={inputClass}
                      placeholder={isConfigured ? "••••••••••••••••" : "الصق Client Secret من Google Cloud Console"}
                      value={keysForm.youtubeClientSecret}
                      onChange={(e) => setKeysForm({ ...keysForm, youtubeClientSecret: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <button
                  type="button"
                  disabled={isSaving || (!keysForm.youtubeClientId && !keysForm.youtubeClientSecret)}
                  onClick={() => void handleSaveCredentials("youtube")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSaving ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
                  {isSaving ? SOCIAL_COPY.savingKeys : SOCIAL_COPY.saveKeys}
                </button>

                <a
                  href={isConfigured ? "/api/oauth/youtube" : "#"}
                  onClick={(e) => {
                    if (!isConfigured) {
                      e.preventDefault();
                      setError(SOCIAL_COPY.errors.missing_credentials);
                    }
                  }}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold text-white transition-all shadow-md ${
                    isConfigured
                      ? "bg-red-600 hover:bg-red-500"
                      : "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
                  }`}
                >
                  <Youtube className="size-4" />
                  {SOCIAL_COPY.connectYoutube}
                </a>
              </div>
            </section>
          );
        })()}

        {/* 4. X (Twitter) */}
        {(() => {
          const cred = credentials.find((c) => c.provider === "x");
          const isConfigured = cred?.configured ?? false;
          const isSaving = savingProvider === "x";
          return (
            <section className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:border-border/80">
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-600 text-white shadow-sm">
                      <Share2 className="size-6" />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-foreground">إكس / تويتر (X)</h2>
                      <p className="text-xs text-muted-foreground">نشر التغريدات والعروض والصور السياحية الرسمية</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${
                      isConfigured
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300"
                    }`}
                  >
                    {isConfigured ? SOCIAL_COPY.configured : SOCIAL_COPY.notConfigured}
                  </span>
                </div>

                <div className="mb-4 rounded-2xl border border-border/80 bg-muted/40 p-4">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-muted-foreground">{SOCIAL_COPY.redirectUri}</span>
                    <button
                      type="button"
                      onClick={() => void copyToClipboard(cred?.redirectUri || "https://lonaliza.com/api/oauth/x/callback", "x-uri")}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                    >
                      {copiedKey === "x-uri" ? (
                        <>
                          <Check className="size-3.5" />
                          {SOCIAL_COPY.copied}
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          {SOCIAL_COPY.copyRedirectUri}
                        </>
                      )}
                    </button>
                  </div>
                  <code className="block break-all rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs font-mono text-foreground select-all">
                    {cred?.redirectUri || "https://lonaliza.com/api/oauth/x/callback"}
                  </code>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className={labelClass}>معرّف العميل (Client ID)</label>
                    <input
                      type="text"
                      autoComplete="off"
                      className={inputClass}
                      placeholder={isConfigured ? "معرّف محفوظ — الصق معرّفاً جديداً للتعديل" : "الصق Client ID من X Developer Portal"}
                      value={keysForm.xClientId}
                      onChange={(e) => setKeysForm({ ...keysForm, xClientId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>المفتاح السري للعميل (Client Secret)</label>
                    <input
                      type="password"
                      autoComplete="off"
                      className={inputClass}
                      placeholder={isConfigured ? "••••••••••••••••" : "الصق Client Secret من X Developer Portal"}
                      value={keysForm.xClientSecret}
                      onChange={(e) => setKeysForm({ ...keysForm, xClientSecret: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <button
                  type="button"
                  disabled={isSaving || (!keysForm.xClientId && !keysForm.xClientSecret)}
                  onClick={() => void handleSaveCredentials("x")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isSaving ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
                  {isSaving ? SOCIAL_COPY.savingKeys : SOCIAL_COPY.saveKeys}
                </button>

                <a
                  href={isConfigured ? "/api/oauth/x" : "#"}
                  onClick={(e) => {
                    if (!isConfigured) {
                      e.preventDefault();
                      setError(SOCIAL_COPY.errors.missing_credentials);
                    }
                  }}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold text-white transition-all shadow-md ${
                    isConfigured
                      ? "bg-sky-600 hover:bg-sky-500"
                      : "bg-muted text-muted-foreground opacity-60 cursor-not-allowed"
                  }`}
                >
                  <Share2 className="size-4" />
                  {SOCIAL_COPY.connectX}
                </a>
              </div>
            </section>
          );
        })()}
      </div>

      {/* Connected Accounts Section */}
      <div className="mb-6">
        <h3 className="text-base font-bold text-foreground mb-1">الحسابات المربوطة حالياً</h3>
        <p className="text-xs text-muted-foreground mb-4">قائمة القنوات والصفحات المعتمدة للنشر التلقائي من النظام</p>

        {loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-border bg-card p-12 text-sm text-muted-foreground">
            <Loader2 className="size-5 animate-spin me-2 text-emerald-500" />
            {SOCIAL_COPY.loading}
          </div>
        ) : accounts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center text-sm text-muted-foreground">
            {SOCIAL_COPY.empty}
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {accounts.map((account) => {
              const busy = busyId === account.id;
              return (
                <li
                  key={account.id}
                  className="rounded-3xl border border-border bg-card p-5 shadow-sm transition-all"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted text-foreground">
                        <PlatformIcon platform={account.platform} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-bold text-foreground">
                          {account.displayName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {account.username ? `@${account.username}` : account.externalId}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusClass[account.status]}`}
                    >
                      {account.statusLabel}
                    </span>
                  </div>

                  <dl className="mb-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground border-y border-border/60 py-2.5">
                    <div>
                      <dt>{SOCIAL_COPY.connectedAt}</dt>
                      <dd className="font-semibold text-foreground">{formatDate(account.connectedAt)}</dd>
                    </div>
                    <div>
                      <dt>{SOCIAL_COPY.lastRefresh}</dt>
                      <dd className="font-semibold text-foreground">
                        {formatDate(account.lastRefreshedAt)}
                      </dd>
                    </div>
                  </dl>

                  {account.lastError ? (
                    <p className="mb-3 text-xs font-semibold text-rose-500">{account.lastError}</p>
                  ) : null}

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void refresh(account.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/60 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
                    >
                      <RefreshCw className={`size-3.5 ${busy ? "animate-spin" : ""}`} />
                      {busy ? SOCIAL_COPY.refreshing : SOCIAL_COPY.refresh}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void disconnect(account.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-500/20 disabled:opacity-50 transition-colors"
                    >
                      <Unplug className="size-3.5" />
                      {busy ? SOCIAL_COPY.disconnecting : SOCIAL_COPY.disconnect}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AdminPage>
  );
}
