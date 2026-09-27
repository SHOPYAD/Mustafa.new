"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Image, Loader2, Save } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { AdminModule, AdminPage, AdminPageHeader } from "@/components/admin/layout";

const inputClass =
  "w-full px-4 py-3 bg-admin-bg-surface border border-admin-border-subtle rounded-xl text-admin-text-primary placeholder:text-admin-text-faint focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm";

const labelClass =
  "block text-xs font-semibold text-admin-text-muted mb-1.5 uppercase tracking-wider";

type KeyStatus = {
  configured: boolean;
  masked: string;
};

export default function AdminMediaKeysPage() {
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
          values: {
            PEXELS_API_KEY: pexels,
            UNSPLASH_ACCESS_KEY: unsplash,
          },
        }),
      });
      const data = await res.json();
      if (!data?.ok) {
        setSavedMsg(data?.error || t.admin.saveFailed);
        return;
      }
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
    <AdminPage className="space-y-6">
      <AdminPageHeader
        icon={<Image className="size-5" />}
        title={t.admin.mediaKeys}
        description={t.admin.mediaKeysSubtitle}
      />

      {loading ? (
        <div className="flex items-center gap-2 text-admin-text-muted">
          <Loader2 className="animate-spin" size={16} />
          {t.admin.loading}
        </div>
      ) : (
        <AdminModule className="grid grid-cols-1 gap-5 min-w-0 md:grid-cols-2">
          <div>
            <label className={labelClass}>Pexels API key</label>
            <div className="flex gap-2">
              <input
                className={inputClass}
                type={showPexels ? "text" : "password"}
                value={pexels}
                onChange={(e) => setPexels(e.target.value)}
                placeholder={
                  status?.PEXELS_API_KEY.configured
                    ? status.PEXELS_API_KEY.masked
                    : "••••••••"
                }
              />
              <button
                type="button"
                onClick={() => setShowPexels((v) => !v)}
                className="w-11 h-11 rounded-xl border border-admin-border-subtle bg-admin-bg-subtle text-muted-foreground flex items-center justify-center"
              >
                {showPexels ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
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
                  status?.UNSPLASH_ACCESS_KEY.configured
                    ? status.UNSPLASH_ACCESS_KEY.masked
                    : "••••••••"
                }
              />
              <button
                type="button"
                onClick={() => setShowUnsplash((v) => !v)}
                className="w-11 h-11 rounded-xl border border-admin-border-subtle bg-admin-bg-subtle text-muted-foreground flex items-center justify-center"
              >
                {showUnsplash ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-[#051741] font-bold text-sm disabled:opacity-60"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {t.admin.saveSettings}
            </button>
            {savedMsg ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-emerald-300">
                <CheckCircle2 size={14} />
                {savedMsg}
              </span>
            ) : null}
          </div>
        </AdminModule>
      )}
    </AdminPage>
  );
}
