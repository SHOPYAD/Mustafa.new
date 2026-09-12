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
      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-sm font-medium transition-all"
    >
      <ExternalLink size={14} className="text-amber-400" />
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
          checked ? "bg-amber-500" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
            checked ? "start-5" : "start-1"
          }`}
        />
      </button>
      <span className="text-xs text-white/50">{label}</span>
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
  "w-full px-4 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm font-mono";

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

  return (
    <div className="admin-page w-full max-w-none min-w-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Link2 className="text-amber-400" size={28} />
          {ig.title}
        </h1>
        <p className="text-white/50 mt-1">{ig.subtitle}</p>
        <p className="text-white/30 text-xs mt-2">{ig.envOnlyHint}</p>
      </div>

      <section className="mb-6 rounded-2xl border border-white/5 bg-slate-900/80 p-5 sm:p-6 space-y-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Server size={18} className="text-amber-400" />
          {ig.vpsSetupTitle}
        </h2>
        <p className="text-sm text-white/45 leading-relaxed">{ig.vpsSetupBody}</p>
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-white/50">
          <li>{ig.vpsStep1}</li>
          <li>{ig.vpsStep2}</li>
          <li>{ig.vpsStep3}</li>
        </ol>
      </section>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-amber-400" size={28} />
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {message}
            </div>
          )}

          {!anyConfigured && (
            <div className="mb-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/45">
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
                className={`min-w-0 space-y-4 rounded-2xl border p-5 transition-all sm:p-6 ${
                  active
                    ? "border-emerald-500/25 bg-emerald-500/5"
                    : "border-white/5 bg-slate-900/80"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Icon size={18} className="text-amber-400" />
                    {sec.title}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${
                      active
                        ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10"
                        : "border-white/10 text-white/40 bg-white/[0.03]"
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
                  <p className="text-xs text-white/35 font-mono" dir="ltr">
                    {ig.currentValueLabel}: {row.maskedValue}
                  </p>
                )}

                <div>
                  <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">
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
                    <label className="block text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-1.5">
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

                <div className="flex flex-wrap gap-2">
                  <ConnectButton href={sec.dashboardUrl} label={ig.connectVerify} />
                  {sec.altUrl && sec.altLabel && (
                    <ConnectButton href={sec.altUrl} label={sec.altLabel} />
                  )}
                </div>
              </section>
            );
          })}
          </div>

          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-sm shadow-lg shadow-amber-500/20 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isAr ? "حفظ على السيرفر" : "Save to server"}
          </button>
        </>
      )}
    </div>
  );
}
