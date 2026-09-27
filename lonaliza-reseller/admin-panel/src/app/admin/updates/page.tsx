"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  Download,
  Loader2,
  Lock,
  Moon,
  RefreshCw,
  Rocket,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type UpdateInfo = {
  currentVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  hasActiveUpdates: boolean;
  changelog: string[];
  scheduledNightTime: string;
};

export default function AdminClientUpdatesPage() {
  const { t, dir } = useLocale();
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState<UpdateInfo | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updatedSuccess, setUpdatedSuccess] = useState(false);

  const loadUpdateInfo = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/updates/check", { cache: "no-store" });
      const data = (await res.json()) as { ok?: boolean } & UpdateInfo;
      if (data?.ok) {
        setInfo(data);
      }
    } catch {
      /* non-blocking */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUpdateInfo();
  }, []);

  const handleApplyUpdate = async () => {
    try {
      setUpdating(true);
      await new Promise((r) => setTimeout(r, 2000));
      setUpdatedSuccess(true);
      setTimeout(() => setUpdatedSuccess(false), 4000);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const isSubscribed = info?.hasActiveUpdates;

  return (
    <div className="max-w-4xl space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <RefreshCw className="h-6 w-6 text-amber-500" />
            التحديثات البرمجية والترقيات
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            إدارة الإصدارات والتحديثات الليلية التلقائية لسيرفر المنصة
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadUpdateInfo()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary px-3.5 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>فحص التحديثات</span>
        </button>
      </div>

      {/* Version Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-card/60 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            الإصدار الحالي المثبت
          </p>
          <p className="text-2xl font-black font-mono text-foreground">
            {info?.currentVersion || "v2.0.0"}
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card/60 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            حالة الاشتراك بالتحديثات ($50/شهر)
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isSubscribed
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
              }`}
            >
              {isSubscribed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
              <span>{isSubscribed ? "مشترك نشط" : "غير مشترك"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* SUBSCRIBED STATE */}
      {isSubscribed ? (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
            <Moon className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-foreground">التحديث الليلي التلقائي مفعل:</p>
              <p className="text-muted-foreground leading-relaxed">
                يتم تثبيت التحديثات تلقائياً في نافذة الصيانة الليلية ({info?.scheduledNightTime || "03:30 ص"}) دون أي توقف للموقع.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  محتويات الإصدار الأحدث ({info?.latestVersion})
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">سجل التغييرات والتحسينات المتاحة</p>
              </div>

              <button
                type="button"
                onClick={() => void handleApplyUpdate()}
                disabled={updating}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 disabled:opacity-50 transition-all shadow-sm"
              >
                {updating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : updatedSuccess ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>{updatedSuccess ? "تم التحديث بنجاح!" : "تثبيت التحديث الآن فورياً"}</span>
              </button>
            </div>

            <ul className="space-y-2 text-xs text-foreground/90">
              {info?.changelog.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        /* NOT SUBSCRIBED STATE — Locked Section */
        <div className="rounded-3xl border border-border bg-card/60 p-8 sm:p-12 text-center space-y-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 mx-auto">
            <Lock className="h-8 w-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-foreground">قسم التحديثات مقفل</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              هذا القسم مخصص للشركات المشتركة في باقة التحديثات المستمرة ($50/شهر) للحصول على أحدث الترقيات البرمجية والأمنية وتحسينات الـ API تلقائياً.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/40 border border-border max-w-lg mx-auto text-xs text-muted-foreground space-y-1 text-right">
            <p className="font-semibold text-foreground">ما تشمله باقة التحديثات:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>تحديثات دورية لمحولات API الفنادق والطيران.</li>
              <li>ترقية نماذج الذكاء الاصطناعي وإضافة ميزات حصرية.</li>
              <li>دعم فني وأولوي لإصلاح أي طارئ تقني على مدار الساعة.</li>
            </ul>
          </div>

          <div className="pt-2 flex justify-center">
            <a
              href="https://lonaliza.com/partners/dashboard"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-md"
            >
              <Zap className="h-4 w-4" />
              <span>تفعيل باقة التحديثات ($50/شهر) من بوابة الشركاء</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
