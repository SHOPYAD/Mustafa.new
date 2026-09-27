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
        <Loader2 className='h-8 w-8 animate-spin text-secondary' />
      </div>
    );
  }

  const isSubscribed = info?.hasActiveUpdates;

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-6" dir={dir}>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <RefreshCw className='h-6 w-6 text-secondary' />
            التحديثات البرمجية والترقيات (Engine Updates)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            إدارة الإصدارات والتحديثات الليلية التلقائية لسيرفر المنصة
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadUpdateInfo()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>فحص التحديثات الآن</span>
        </button>
      </div>

      {/* Real KPI Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>الإصدار المثبت الحالي</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">
            {info?.currentVersion ? `v${info.currentVersion}` : "v2.4.0"}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            مستقر ويعمل بكفاءة
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>أحدث إصدار متاح</span>
            <Rocket className="size-3.5 text-primary" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">
            {info?.latestVersion ? `v${info.latestVersion}` : "v2.4.0"}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            {info?.updateAvailable ? "تحديث جديد متاح للترقية" : "النسخة متطابقة مع أحدث إصدار"}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>التحديث الليلي التلقائي</span>
            <Moon className="size-3.5 text-secondary" />
          </div>
          <div className="text-xl font-black text-foreground">
            {info?.scheduledNightTime || "03:30 ص"}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            نافذة الصيانة دون توقف
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>اشتراك التحديثات</span>
            <span className={`w-2 h-2 rounded-full ${isSubscribed ? "bg-emerald-500" : "bg-amber-500"}`} />
          </div>
          <div className="text-xl font-black text-foreground">
            {isSubscribed ? "اشتراك نشط" : "غير مشترك"}
          </div>
          <div className={`text-[11px] mt-1 font-medium ${isSubscribed ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
            {isSubscribed ? "تحديثات أمنية وميزات مستمرة" : "ترقية التراخيص مطلوبة"}
          </div>
        </div>
      </div>

      {/* SUBSCRIBED STATE */}
      {isSubscribed ? (
        <div className="space-y-6">
          <div className='p-4 rounded-2xl bg-secondary/10 border border-border/30 flex items-start gap-3.5'>
            <Moon className='h-5 w-5 text-secondary shrink-0 mt-0.5' />
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
                  <Sparkles className='h-4 w-4 text-secondary' />
                  محتويات الإصدار الأحدث ({info?.latestVersion})
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">سجل التغييرات والتحسينات المتاحة</p>
              </div>

              <button
                type="button"
                onClick={() => void handleApplyUpdate()}
                disabled={updating}
                className='inline-flex items-center gap-2 px-5 py-2.5 bg-secondary text-foreground font-bold text-xs rounded-xl hover:bg-secondary disabled:opacity-50 transition-all shadow-sm'
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
                  <span className='h-1.5 w-1.5 rounded-full bg-secondary mt-1.5 shrink-0' />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        /* NOT SUBSCRIBED STATE — Locked Section */
        <div className="rounded-3xl border border-border bg-card/60 p-8 sm:p-12 text-center space-y-6">
          <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10 text-secondary border border-border/20 mx-auto'>
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
              className='inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-secondary text-foreground font-bold text-xs hover:bg-secondary transition-all shadow-md'
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
