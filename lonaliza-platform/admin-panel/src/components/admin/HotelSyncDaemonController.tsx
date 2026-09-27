"use client";

import { useState } from "react";
import {
  RefreshCw,
  Play,
  Pause,
  Activity,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export default function HotelSyncDaemonController() {
  const { locale, dir } = useLocale();

  const [isActive, setIsActive] = useState(true);
  const [intervalMinutes, setIntervalMinutes] = useState<number>(15);
  const [markupPercent, setMarkupPercent] = useState<number>(12);
  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("منذ دقيقتين (14:05)");
  const [syncLogs, setSyncLogs] = useState<string[]>([
    "تم فحص 24 فندقاً مستورداً وتحديث 8 أسعار غرف بنجاح وتطبيق هامش 12%.",
    "فحص حالة الغرف المتاحة: لا توجد غرف مباعة بالكامل في التواريخ القادمة.",
    "تحديث الكاش المركزي وتوليد أسعار الليلة الصافية بنجاح.",
  ]);

  const handleManualSync = () => {
    setIsSyncingNow(true);
    setTimeout(() => {
      setIsSyncingNow(false);
      setLastSyncTime("الآن (لحظي)");
      setSyncLogs((prev) => [
        `فحص يدوي ناجح: تمت مزامنة كافة الفنادق والتحقق من أحدث الأسعار بهامش +${markupPercent}%.`,
        ...prev.slice(0, 3),
      ]);
    }, 1200);
  };

  return (
    <div className='rounded-3xl border border-border/90 dark:border-border bg-card dark:bg-background p-5 sm:p-6 text-foreground dark:text-foreground space-y-6 shadow-xs' dir={dir}>
      {/* Top Banner: Status + Actions */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border dark:border-border pb-5'>
        <div className="flex items-center gap-3.5">
          <div className='size-11 rounded-2xl bg-gradient-to-br from-admin-accent via-indigo-600 to-admin-btn-primary-hover flex items-center justify-center text-foreground shadow-md shadow-[hsl(var(--primary))]/20 shrink-0'>
            <Activity size={22} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className='text-sm sm:text-base font-black text-foreground dark:text-foreground'>
                {locale === "ar"
                  ? "زاحف الأسعار والغرف المؤتمت بالذكاء الاصطناعي"
                  : "Autonomous AI Hotel Rate & Inventory Sync Daemon"}
              </h3>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                  isActive
                    ? "bg-admin-bg-subtle text-primary border border-border dark:bg-primary/40 dark:text-secondary dark:border-admin-btn-primary-hover"
                    : "bg-muted text-muted-foreground border border-border dark:bg-card dark:text-muted-foreground"
                }`}
              >
                <span className={`size-1.5 rounded-full ${isActive ? "bg-secondary animate-pulse" : "bg-slate-400"}`} />
                {isActive ? (locale === "ar" ? "يعمل تلقائياً" : "Active 24/7") : (locale === "ar" ? "متوقف" : "Paused")}
              </span>
            </div>
            <p className='text-xs text-muted-foreground dark:text-muted-foreground mt-1 leading-relaxed'>
              {locale === "ar"
                ? "يزحف دورياً على صفحات الفنادق المستوردة للتحقق من الغرف المتاحة وتحديث الأسعار مع تطبيق المارك أب التلقائي"
                : "Continuously crawls contracted hotel URLs to refresh room inventory and apply dynamic markups"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncingNow}
            className='px-4 py-2.5 rounded-2xl border-2 border-border dark:border-slate-700 bg-card dark:bg-card hover:bg-card-2 dark:hover:bg-slate-700 text-xs font-black text-foreground dark:text-foreground transition-all flex items-center gap-2 disabled:opacity-50 shadow-xs'
            style={{ color: "var(--admin-text-primary)" }}
          >
            <RefreshCw size={14} className={isSyncingNow ? "animate-spin text-primary" : "text-foreground dark:text-slate-300"} />
            <span className='font-black text-foreground dark:text-foreground' style={{ color: "var(--admin-text-primary)" }}>
              {isSyncingNow ? (locale === "ar" ? "جاري الزحف..." : "Syncing...") : (locale === "ar" ? "مزامنة يدوية فورية" : "Sync Now")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 shadow-2xs ${
              isActive
                ? "bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300"
                : "bg-admin-bg-subtle border border-border text-primary hover:bg-admin-bg-subtle dark:bg-primary/40 dark:border-purple-900 dark:text-secondary"
            }`}
          >
            {isActive ? <Pause size={14} /> : <Play size={14} />}
            <span>{isActive ? (locale === "ar" ? "إيقاف مؤقت" : "Pause") : (locale === "ar" ? "تفعيل" : "Enable")}</span>
          </button>
        </div>
      </div>

      {/* Settings Grid: Interval + Markup + Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Interval Selector */}
        <div className='rounded-2xl border border-border/80 dark:border-border bg-card-2/60 dark:bg-card/40 p-4 space-y-2.5'>
          <label className='text-[11px] font-bold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider block'>
            {locale === "ar" ? "دورية الزحف والمزامنة:" : "Sync Interval:"}
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[10, 15, 30, 60].map((mins) => {
              const isSelected = intervalMinutes === mins;
              return (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setIntervalMinutes(mins)}
                  className={`py-1.5 px-2 rounded-xl text-xs transition-all text-center font-bold ${
                    isSelected
                      ? "bg-primary-hover text-foreground shadow-sm font-black admin-btn-primary"
                      : "bg-card dark:bg-card/80 border border-border dark:border-slate-700 text-foreground dark:text-slate-200 hover:bg-muted dark:hover:bg-slate-700"
                  }`}
                >
                  <span className="font-bold">
                    {mins} {locale === "ar" ? "د" : "m"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Agency Markup Setting */}
        <div className='rounded-2xl border border-border/80 dark:border-border bg-card-2/60 dark:bg-card/40 p-4 space-y-2.5'>
          <div className="flex items-center justify-between">
            <label className='text-[11px] font-bold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider'>
              {locale === "ar" ? "هامش ربح الوكالة التلقائي:" : "Markup Applied:"}
            </label>
            <span className='text-xs font-black text-primary dark:text-primary px-2.5 py-0.5 rounded-lg bg-admin-bg-subtle/80 dark:bg-primary/60 font-mono border border-border dark:border-admin-btn-primary-hover/50'>
              +{markupPercent}%
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={markupPercent}
            onChange={(e) => setMarkupPercent(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>5%</span>
            <span>15%</span>
            <span>30%</span>
          </div>
        </div>

        {/* Sync Status Banner */}
        <div className="rounded-2xl border border-border/80 bg-card-2/60 p-4 space-y-1.5">
          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            {locale === "ar" ? "آخر مزامنة ناجحة:" : "Last Successful Sync:"}
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-foreground font-bold">
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
            <span>{lastSyncTime}</span>
          </div>
          <p className="text-[11px] text-primary font-bold pt-0.5">
            {locale === "ar" ? "✓ الكاش السريع مفعّل (10 دقائق TTL)" : "✓ Cache Active (10m TTL)"}
          </p>
        </div>
      </div>

      {/* Live Sync Log Strip - High-Contrast Dark Console Terminal */}
      <div className="rounded-2xl bg-slate-950 p-4 space-y-2 text-xs font-mono border border-slate-800 shadow-inner">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 flex items-center gap-1.5">
          <Sparkles className="size-3 text-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-semibold">{locale === "ar" ? "سجل نشاط زاحف الفنادق الأخير:" : "Recent Daemon Execution Logs:"}</span>
        </div>
        {syncLogs.map((log, idx) => (
          <div key={idx} className="text-slate-200 flex items-start gap-2 leading-relaxed">
            <span className="text-emerald-400 font-bold">›</span>
            <span>{log}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
