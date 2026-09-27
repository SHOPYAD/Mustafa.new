"use client";

import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Link2,
  Search,
  Megaphone,
  BarChart3,
  Tags,
  Facebook,
  Music2,
  Save,
  Loader2,
  Server,
  Activity,
  Globe,
  Share2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PLATFORM_DASHBOARD_URLS } from "@/lib/integrations-env";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type FormState = {
  NEXT_PUBLIC_GSC_VERIFICATION: string;
  NEXT_PUBLIC_GA_ID: string;
  NEXT_PUBLIC_GTM_ID: string;
  NEXT_PUBLIC_GOOGLE_ADS_ID: string;
  NEXT_PUBLIC_GOOGLE_ADS_LABEL: string;
  NEXT_PUBLIC_META_PIXEL_ID: string;
  NEXT_PUBLIC_TIKTOK_PIXEL_ID: string;
  NEXT_PUBLIC_GSC_ENABLED: boolean;
  NEXT_PUBLIC_GA_ENABLED: boolean;
  NEXT_PUBLIC_GTM_ENABLED: boolean;
  NEXT_PUBLIC_GOOGLE_ADS_ENABLED: boolean;
  NEXT_PUBLIC_META_PIXEL_ENABLED: boolean;
  NEXT_PUBLIC_TIKTOK_PIXEL_ENABLED: boolean;
};

type RowStatus = {
  key: string;
  title: string;
  envVar: string;
  configured: boolean;
  enabled: boolean;
  maskedValue: string;
  dashboardUrl: string;
};

const emptyForm: FormState = {
  NEXT_PUBLIC_GSC_VERIFICATION: "",
  NEXT_PUBLIC_GA_ID: "",
  NEXT_PUBLIC_GTM_ID: "",
  NEXT_PUBLIC_GOOGLE_ADS_ID: "",
  NEXT_PUBLIC_GOOGLE_ADS_LABEL: "",
  NEXT_PUBLIC_META_PIXEL_ID: "",
  NEXT_PUBLIC_TIKTOK_PIXEL_ID: "",
  NEXT_PUBLIC_GSC_ENABLED: true,
  NEXT_PUBLIC_GA_ENABLED: true,
  NEXT_PUBLIC_GTM_ENABLED: true,
  NEXT_PUBLIC_GOOGLE_ADS_ENABLED: true,
  NEXT_PUBLIC_META_PIXEL_ENABLED: true,
  NEXT_PUBLIC_TIKTOK_PIXEL_ENABLED: true,
};

function ConnectButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 hover:bg-muted border border-border text-foreground hover:text-primary text-sm font-medium transition-colors"
    >
      <ExternalLink size={14} className="text-primary" />
      {label}
    </a>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted border border-border"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-background shadow-xs transition-all ${
            checked ? "start-5" : "start-1"
          }`}
        />
      </button>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </label>
  );
}

const ICONS: Record<string, React.ElementType> = {
  gsc: Search,
  ga: BarChart3,
  gtm: Tags,
  ads: Megaphone,
  meta: Facebook,
  tiktok: Music2,
};

const inputClass =
  "w-full px-4 py-2.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm font-mono transition-colors";

export default function AdminIntegrationsPage() {
  const { t, locale } = useLocale();
  const ig = t.integrations;
  const isAr = locale === "ar";

  const [form, setForm] = useState<FormState>(emptyForm);
  const [rows, setRows] = useState<RowStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/integrations", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to load");
      }
      const v = data.values || {};
      setForm({
        NEXT_PUBLIC_GSC_VERIFICATION: v.NEXT_PUBLIC_GSC_VERIFICATION || "",
        NEXT_PUBLIC_GA_ID: v.NEXT_PUBLIC_GA_ID || "",
        NEXT_PUBLIC_GTM_ID: v.NEXT_PUBLIC_GTM_ID || "",
        NEXT_PUBLIC_GOOGLE_ADS_ID: v.NEXT_PUBLIC_GOOGLE_ADS_ID || "",
        NEXT_PUBLIC_GOOGLE_ADS_LABEL: v.NEXT_PUBLIC_GOOGLE_ADS_LABEL || "",
        NEXT_PUBLIC_META_PIXEL_ID: v.NEXT_PUBLIC_META_PIXEL_ID || "",
        NEXT_PUBLIC_TIKTOK_PIXEL_ID: v.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "",
        NEXT_PUBLIC_GSC_ENABLED: v.NEXT_PUBLIC_GSC_ENABLED !== "false",
        NEXT_PUBLIC_GA_ENABLED: v.NEXT_PUBLIC_GA_ENABLED !== "false",
        NEXT_PUBLIC_GTM_ENABLED: v.NEXT_PUBLIC_GTM_ENABLED !== "false",
        NEXT_PUBLIC_GOOGLE_ADS_ENABLED:
          v.NEXT_PUBLIC_GOOGLE_ADS_ENABLED !== "false",
        NEXT_PUBLIC_META_PIXEL_ENABLED:
          v.NEXT_PUBLIC_META_PIXEL_ENABLED !== "false",
        NEXT_PUBLIC_TIKTOK_PIXEL_ENABLED:
          v.NEXT_PUBLIC_TIKTOK_PIXEL_ENABLED !== "false",
      });
      setRows(Array.isArray(data.rows) ? data.rows : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/admin/integrations", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          values: {
            NEXT_PUBLIC_GSC_VERIFICATION: form.NEXT_PUBLIC_GSC_VERIFICATION,
            NEXT_PUBLIC_GA_ID: form.NEXT_PUBLIC_GA_ID,
            NEXT_PUBLIC_GTM_ID: form.NEXT_PUBLIC_GTM_ID,
            NEXT_PUBLIC_GOOGLE_ADS_ID: form.NEXT_PUBLIC_GOOGLE_ADS_ID,
            NEXT_PUBLIC_GOOGLE_ADS_LABEL: form.NEXT_PUBLIC_GOOGLE_ADS_LABEL,
            NEXT_PUBLIC_META_PIXEL_ID: form.NEXT_PUBLIC_META_PIXEL_ID,
            NEXT_PUBLIC_TIKTOK_PIXEL_ID: form.NEXT_PUBLIC_TIKTOK_PIXEL_ID,
            NEXT_PUBLIC_GSC_ENABLED: form.NEXT_PUBLIC_GSC_ENABLED,
            NEXT_PUBLIC_GA_ENABLED: form.NEXT_PUBLIC_GA_ENABLED,
            NEXT_PUBLIC_GTM_ENABLED: form.NEXT_PUBLIC_GTM_ENABLED,
            NEXT_PUBLIC_GOOGLE_ADS_ENABLED: form.NEXT_PUBLIC_GOOGLE_ADS_ENABLED,
            NEXT_PUBLIC_META_PIXEL_ENABLED: form.NEXT_PUBLIC_META_PIXEL_ENABLED,
            NEXT_PUBLIC_TIKTOK_PIXEL_ENABLED:
              form.NEXT_PUBLIC_TIKTOK_PIXEL_ENABLED,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Save failed");
      }
      setRows(Array.isArray(data.rows) ? data.rows : []);
      setMessage(
        data.message ||
          (isAr ? "تم الحفظ على السيرفر" : "Saved on server")
      );
      if (data.restartHint) {
        setMessage((m) => `${m} — ${data.restartHint}`);
      }
      setTimeout(() => setMessage(""), 6000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const sections: {
    key: string;
    title: string;
    idKey: keyof FormState;
    enabledKey: keyof FormState;
    placeholder: string;
    extra?: { key: keyof FormState; placeholder: string; label: string };
    dashboardUrl: string;
    altUrl?: string;
    altLabel?: string;
  }[] = [
    {
      key: "gsc",
      title: ig.gscTitle,
      idKey: "NEXT_PUBLIC_GSC_VERIFICATION",
      enabledKey: "NEXT_PUBLIC_GSC_ENABLED",
      placeholder: "google-site-verification token or full meta tag",
      dashboardUrl: PLATFORM_DASHBOARD_URLS.googleSearchConsole,
    },
    {
      key: "ga",
      title: ig.gaTitle,
      idKey: "NEXT_PUBLIC_GA_ID",
      enabledKey: "NEXT_PUBLIC_GA_ENABLED",
      placeholder: "G-XXXXXXXX",
      dashboardUrl: PLATFORM_DASHBOARD_URLS.googleAnalytics,
    },
    {
      key: "gtm",
      title: ig.gtmTitle,
      idKey: "NEXT_PUBLIC_GTM_ID",
      enabledKey: "NEXT_PUBLIC_GTM_ENABLED",
      placeholder: "GTM-XXXXXXX",
      dashboardUrl: PLATFORM_DASHBOARD_URLS.googleTagManager,
    },
    {
      key: "ads",
      title: ig.adsTitle,
      idKey: "NEXT_PUBLIC_GOOGLE_ADS_ID",
      enabledKey: "NEXT_PUBLIC_GOOGLE_ADS_ENABLED",
      placeholder: "AW-XXXXXXXX",
      extra: {
        key: "NEXT_PUBLIC_GOOGLE_ADS_LABEL",
        placeholder: "conversion label",
        label: isAr ? "تسمية التحويل" : "Conversion label",
      },
      dashboardUrl: PLATFORM_DASHBOARD_URLS.googleAds,
    },
    {
      key: "meta",
      title: ig.fbTitle,
      idKey: "NEXT_PUBLIC_META_PIXEL_ID",
      enabledKey: "NEXT_PUBLIC_META_PIXEL_ENABLED",
      placeholder: "Pixel ID (digits)",
      dashboardUrl: PLATFORM_DASHBOARD_URLS.facebookEventsManager,
      altUrl: PLATFORM_DASHBOARD_URLS.facebookEventsManagerAlt,
      altLabel: ig.fbAltConnect,
    },
    {
      key: "tiktok",
      title: ig.ttTitle,
      idKey: "NEXT_PUBLIC_TIKTOK_PIXEL_ID",
      enabledKey: "NEXT_PUBLIC_TIKTOK_PIXEL_ENABLED",
      placeholder: "TikTok Pixel ID",
      dashboardUrl: PLATFORM_DASHBOARD_URLS.tiktokEventsManager,
    },
  ];

  const anyConfigured = rows.some((r) => r.configured);

  const gscActive = Boolean(form.NEXT_PUBLIC_GSC_VERIFICATION && form.NEXT_PUBLIC_GSC_ENABLED);
  const gaActive = Boolean(form.NEXT_PUBLIC_GA_ID && form.NEXT_PUBLIC_GA_ENABLED);
  const gtmActive = Boolean(form.NEXT_PUBLIC_GTM_ID && form.NEXT_PUBLIC_GTM_ENABLED);
  const socialPixelsCount = [
    Boolean(form.NEXT_PUBLIC_META_PIXEL_ID && form.NEXT_PUBLIC_META_PIXEL_ENABLED),
    Boolean(form.NEXT_PUBLIC_TIKTOK_PIXEL_ID && form.NEXT_PUBLIC_TIKTOK_PIXEL_ENABLED),
  ].filter(Boolean).length;

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            <Link2 className="text-primary" size={28} />
            {ig.title}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">{ig.subtitle}</p>
          <p className="text-muted-foreground text-xs mt-1.5">{ig.envOnlyHint}</p>
        </div>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-primary hover:bg-primary/90 px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs disabled:opacity-60 transition-all cursor-pointer"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          <span>{isAr ? "حفظ على السيرفر" : "Save to server"}</span>
        </button>
      </div>

      {/* Marketing & Analytics Telemetry KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              {isAr ? "مشرفي المواقع GSC" : "Search Console"}
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
              gscActive ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"
            }`}>
              {gscActive ? (isAr ? "مفعّل" : "Active") : (isAr ? "معطّل" : "Inactive")}
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-foreground font-mono">
            {form.NEXT_PUBLIC_GSC_VERIFICATION ? (isAr ? "تم التحقق" : "Verified") : (isAr ? "غير مضبوط" : "Unset")}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAr ? "فهرسة محركات البحث وخرائط الموقع" : "SERP & Sitemaps Indexing"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              {isAr ? "تحليلات جوجل GA4" : "Google Analytics 4"}
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
              gaActive ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"
            }`}>
              {gaActive ? (isAr ? "مفعّل" : "Active") : (isAr ? "معطّل" : "Inactive")}
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-foreground font-mono truncate" dir="ltr">
            {form.NEXT_PUBLIC_GA_ID || "G-XXXXXXXX"}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAr ? "تتبع مباشر للزوار ومصادر الزيارات" : "Realtime Telemetry Stream"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              {isAr ? "مدير وسوم جوجل GTM" : "Tag Manager (GTM)"}
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
              gtmActive ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"
            }`}>
              {gtmActive ? (isAr ? "مفعّل" : "Active") : (isAr ? "معطّل" : "Inactive")}
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-foreground font-mono truncate" dir="ltr">
            {form.NEXT_PUBLIC_GTM_ID || "GTM-XXXXXXX"}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAr ? "حاوية وسوم وتتبع الأحداث الذكية" : "Client Container & dataLayer"}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              {isAr ? "بكسل الإعلانات والتحويلات" : "Social Ad Pixels"}
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
              socialPixelsCount > 0 ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"
            }`}>
              {socialPixelsCount}/2 {isAr ? "نشط" : "Active"}
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-foreground font-mono" dir="ltr">
            Meta & TikTok
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAr ? "تتبع التحويلات وإسناد الإعلانات" : "Conversion & Lead Attribution"}
          </p>
        </div>
      </div>

      {/* VPS Setup Info Box */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-3 shadow-xs">
        <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
          <Server size={18} className="text-primary" />
          {ig.vpsSetupTitle}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">{ig.vpsSetupBody}</p>
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
          <li>{ig.vpsStep1}</li>
          <li>{ig.vpsStep2}</li>
          <li>{ig.vpsStep3}</li>
        </ol>
      </section>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      ) : (
        <>
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
              {message}
            </div>
          )}

          {!anyConfigured && (
            <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-xs">
              {ig.noneConfigured}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 min-w-0 md:grid-cols-2">
            {sections.map((sec) => {
              const Icon = ICONS[sec.key] || Link2;
              const row = rows.find((r) => r.key === sec.key);
              const active = Boolean(row?.enabled && row?.configured);
              return (
                <section
                  key={sec.key}
                  className={`min-w-0 space-y-4 rounded-2xl border p-5 transition-all sm:p-6 shadow-xs ${
                    active
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                      <Icon size={18} className="text-primary" />
                      {sec.title}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium ${
                        active
                          ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10"
                          : "border-border text-muted-foreground bg-muted/40"
                      }`}
                    >
                      {active ? (
                        <>
                          <CheckCircle2 size={12} />
                          {ig.statusLive}
                        </>
                      ) : (
                        <>
                          <XCircle size={12} />
                          {ig.statusMissing}
                        </>
                      )}
                    </span>
                  </div>

                  {row?.maskedValue && (
                    <p className="text-xs text-muted-foreground font-mono" dir="ltr">
                      {ig.currentValueLabel}: {row.maskedValue}
                    </p>
                  )}

                  <div>
                    <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                      {sec.idKey}
                    </label>
                    <input
                      className={inputClass}
                      dir="ltr"
                      value={String(form[sec.idKey] || "")}
                      onChange={(e) =>
                        setField(sec.idKey, e.target.value as FormState[typeof sec.idKey])
                      }
                      placeholder={sec.placeholder}
                    />
                  </div>

                  {sec.extra && (
                    <div>
                      <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                        {sec.extra.label}
                      </label>
                      <input
                        className={inputClass}
                        dir="ltr"
                        value={String(form[sec.extra.key] || "")}
                        onChange={(e) =>
                          setField(
                            sec.extra!.key,
                            e.target.value as FormState[typeof sec.extra.key]
                          )
                        }
                        placeholder={sec.extra.placeholder}
                      />
                    </div>
                  )}

                  <Toggle
                    checked={Boolean(form[sec.enabledKey])}
                    onChange={(v) =>
                      setField(
                        sec.enabledKey,
                        v as FormState[typeof sec.enabledKey]
                      )
                    }
                    label={isAr ? "مفعّل" : "Enabled"}
                  />

                  <div className="flex flex-wrap gap-2 pt-1">
                    <ConnectButton href={sec.dashboardUrl} label={ig.connectVerify} />
                    {sec.altUrl && sec.altLabel && (
                      <ConnectButton href={sec.altUrl} label={sec.altLabel} />
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-xs disabled:opacity-60 transition-colors cursor-pointer"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              <span>{isAr ? "حفظ على السيرفر" : "Save to server"}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

