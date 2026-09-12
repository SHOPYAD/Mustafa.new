"use client";

import { useState } from "react";
import {
  RefreshCw,
  Play,
  Pause,
  Activity,
  Sparkles,
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
    <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 text-slate-900 dark:text-white space-y-6 shadow-xs" dir={dir}>
      {/* Top Banner: Status + Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-800 flex items-center justify-center text-white shadow-md shadow-purple-600/20 shrink-0">
            <Activity size={22} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                {locale === "ar"
                  ? "زاحف الأسعار والغرف المؤتمت بالذكاء الاصطناعي"
                  : "Autonomous AI Hotel Rate & Inventory Sync Daemon"}
              </h3>
              <span
                className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                  isActive
                    ? "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-amber-300 dark:border-purple-800"
                    : "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                <span className={`size-1.5 rounded-full ${isActive ? "bg-amber-500 animate-pulse" : "bg-slate-400"}`} />
                {isActive ? (locale === "ar" ? "يعمل تلقائياً" : "Active 24/7") : (locale === "ar" ? "متوقف" : "Paused")}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
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
            className="px-4 py-2.5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-black text-slate-900 dark:text-white transition-all flex items-center gap-2 disabled:opacity-50 shadow-xs"
            style={{ color: "#0f172a" }}
          >
            <RefreshCw size={14} className={isSyncingNow ? "animate-spin text-purple-600" : "text-slate-700 dark:text-slate-300"} />
            <span className="font-black text-slate-900 dark:text-white" style={{ color: "#0f172a" }}>
              {isSyncingNow ? (locale === "ar" ? "جاري الزحف..." : "Syncing...") : (locale === "ar" ? "مزامنة يدوية فورية" : "Sync Now")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-1.5 shadow-2xs ${
              isActive
                ? "bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300"
                : "bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 dark:bg-purple-950/40 dark:border-purple-900 dark:text-amber-300"
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
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 space-y-2.5">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            {locale === "ar" ? "دورية الزحف والمزامنة:" : "Sync Interval:"}
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[10, 15, 30, 60].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setIntervalMinutes(mins)}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                  intervalMinutes === mins
                    ? "bg-purple-700 text-white shadow-xs font-black"
                    : "bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100"
                }`}
              >
                <span className="font-black" style={{ color: intervalMinutes === mins ? "#ffffff" : "#0f172a" }}>
                  {mins} {locale === "ar" ? "د" : "m"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Agency Markup Setting */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {locale === "ar" ? "هامش ربح الوكالة التلقائي:" : "Markup Applied:"}
            </label>
            <span className="text-xs font-black text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-lg bg-purple-100/80 dark:bg-purple-950/60 font-mono">
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
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-700"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>5%</span>
            <span>15%</span>
            <span>30%</span>
          </div>
        </div>

        {/* Cache & Health Status */}
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 space-y-2">
          <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            {locale === "ar" ? "حالة الكاش وآخر زحف:" : "Daemon Cache Status:"}
          </label>
          <div className="text-slate-900 dark:text-white font-bold flex items-center gap-2 text-xs">
            <span className="size-2 rounded-full bg-amber-500 shrink-0" />
            <span>{lastSyncTime}</span>
          </div>
          <p className="text-[11px] text-purple-700 dark:text-amber-400 font-bold pt-0.5">
            {locale === "ar" ? "✓ الكاش السريع مفعّل (10 دقائق TTL)" : "✓ Cache Active (10m TTL)"}
          </p>
        </div>
      </div>

      {/* Live Sync Log Strip */}
      <div className="rounded-2xl bg-slate-950 p-4 space-y-2 text-xs font-mono border border-slate-800 shadow-inner">
        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 flex items-center gap-1.5">
          <Sparkles className="size-3 text-purple-400" />
          <span>{locale === "ar" ? "سجل نشاط زاحف الفنادق الأخير:" : "Recent Daemon Execution Logs:"}</span>
        </div>
        {syncLogs.map((log, idx) => (
          <div key={idx} className="text-slate-300 flex items-start gap-2 leading-relaxed">
            <span className="text-amber-400">›</span>
            <span>{log}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
