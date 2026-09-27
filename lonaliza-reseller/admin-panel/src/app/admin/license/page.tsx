"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  Globe2,
  KeyRound,
  Loader2,
  Lock,
  Radio,
  RefreshCw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type LicenseInfo = {
  valid: boolean;
  licenseKey?: string;
  boundDomain?: string;
  lastChecked?: string;
  hasActiveUpdates?: boolean;
  errorCode?: string;
  errorMessage?: string;
};

export default function AdminClientLicensePage() {
  const { t, dir } = useLocale();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [licenseKeyInput, setLicenseKeyInput] = useState("");
  const [licenseState, setLicenseState] = useState<LicenseInfo | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/license/status", { cache: "no-store" });
      const data = (await res.json()) as { ok?: boolean; license?: LicenseInfo };
      if (data?.ok && data.license) {
        setLicenseState(data.license);
        setLicenseKeyInput(data.license.licenseKey || "");
      }
    } catch {
      /* non-blocking */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const handleActivate = async () => {
    if (!licenseKeyInput.trim()) return;
    try {
      setSaving(true);
      const res = await fetch("/api/admin/license/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseKey: licenseKeyInput.trim() }),
      });
      const data = (await res.json()) as { ok?: boolean; license?: LicenseInfo; message?: string };
      if (data?.ok && data.license) {
        setLicenseState(data.license);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      } else {
        alert(data?.message || "فشل التحقق من الترخيص لدى الخادم الرئيسي");
      }
    } catch {
      alert("تعذر الاتصال بخادم التراخيص الرئيسي");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const isValid = licenseState?.valid;

  return (
    <div className="max-w-3xl space-y-6" dir={dir}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
          <KeyRound className="h-6 w-6 text-amber-500" />
          ترخيص المنصة والنطاق (License)
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          إدارة مفتاح الترخيص الرسمي والتحقق من ارتباط النسخة بالدومين المعتمد
        </p>
      </div>

      {/* Status Card */}
      <div
        className={`p-6 rounded-2xl border transition-all space-y-4 ${
          isValid
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {isValid ? (
              <ShieldCheck className="h-7 w-7 text-emerald-400" />
            ) : (
              <ShieldAlert className="h-7 w-7 text-amber-400" />
            )}
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isValid ? "الترخيص مفعل ونشط رسمياً" : "بانتظار تفعيل الترخيص"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isValid
                  ? `مرتبط بالدومين المعتمد: ${licenseState?.boundDomain || "هذا النطاق"}`
                  : "يرجى إدخال مفتاح الترخيص الممنوح لشركتك من بوابة الشركاء"}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isValid ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
            }`}
          >
            <Radio className={`h-3 w-3 ${isValid ? "animate-pulse" : ""}`} />
            {isValid ? "يعمل بنجاح" : "غير مفعل"}
          </span>
        </div>
      </div>

      {/* License Input Form */}
      <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <KeyRound className="h-4 w-4 text-amber-500" />
          مفتاح الترخيص (License Key)
        </h2>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            أدخل مفتاح الترخيص الخاص بشركتك:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={licenseKeyInput}
              onChange={(e) => setLicenseKeyInput(e.target.value)}
              placeholder="LIOTRIP-XXXX-XXXX-XXXX-XXXX"
              className="flex-1 px-4 py-2.5 bg-secondary/60 border border-border rounded-xl font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
            <button
              type="button"
              onClick={() => void handleActivate()}
              disabled={saving || !licenseKeyInput.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-all shadow-sm shrink-0"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : savedSuccess ? <Check className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
              <span>{savedSuccess ? "تم التفعيل بنجاح!" : "تفعيل والتحقق الآن"}</span>
            </button>
          </div>
        </div>

        <div className="pt-2 text-xs text-muted-foreground space-y-1">
          <p>
            📌 يمكنك الحصول على مفتاح الترخيص الخاص بك من حسابك في{" "}
            <a
              href="https://lonaliza.com/partners"
              target="_blank"
              rel="noreferrer"
              className="text-amber-500 hover:underline font-semibold"
            >
              بوابة الشركاء
            </a>
            .
          </p>
          <p>
            🔒 الترخيص مقفل بنظام الأمان fail-closed ومرتبط بالنطاق المعتمد حصراً.
          </p>
        </div>
      </div>
    </div>
  );
}
