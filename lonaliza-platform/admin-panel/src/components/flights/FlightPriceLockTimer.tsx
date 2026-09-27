"use client";

import { useEffect, useState } from "react";
import { Clock, RefreshCw, ShieldCheck } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

type Props = {
  initialSeconds?: number;
  onRefresh?: () => void;
  className?: string;
  variant?: "bar" | "badge";
};

export default function FlightPriceLockTimer({
  initialSeconds = 900, // 15 minutes
  onRefresh,
  className,
  variant = "bar",
}: Props) {
  const { locale } = useLocale();
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isLowTime = secondsLeft < 180; // less than 3 mins

  const handleRefresh = () => {
    setIsRefreshing(true);
    setSecondsLeft(initialSeconds);
    if (onRefresh) onRefresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  if (variant === "badge") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold shadow-2xs transition-all",
          isLowTime
            ? "bg-amber-100 text-amber-950 border border-amber-300"
            : "bg-purple-50 text-purple-950 border border-purple-200",
          className
        )}
      >
        <Clock size={13} className={isLowTime ? "text-amber-700 animate-spin" : "text-purple-700"} />
        <span>
          {locale === "ar" ? `الأسعار مضمونة لمدة:` : "Prices locked for:"}{" "}
          <strong className="font-mono font-black">{timeFormatted}</strong>
        </span>
        <button
          type="button"
          onClick={handleRefresh}
          className="ms-1 hover:rotate-180 transition-transform duration-300 cursor-pointer"
          title={locale === "ar" ? "تحديث الأسعار الآن" : "Refresh prices"}
        >
          <RefreshCw size={12} className={cn(isRefreshing && "animate-spin text-purple-700")} />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 text-xs transition-all",
        isLowTime
          ? "border-amber-300 bg-gradient-to-r from-amber-500/10 via-amber-100/40 to-amber-500/10 text-amber-950 shadow-xs"
          : "border-purple-200/90 bg-gradient-to-r from-purple-50/80 via-white to-purple-50/80 text-purple-950 shadow-2xs",
        className
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-2xs",
            isLowTime ? "bg-amber-500 text-slate-950" : "bg-purple-900 text-amber-400"
          )}
        >
          <ShieldCheck size={16} />
        </div>
        <div className="min-w-0">
          <p className="font-black text-slate-900">
            {locale === "ar" ? "الأسعار المعروضة حية ومضمونة الحجز" : "Live flight fares guaranteed"}
          </p>
          <p className="text-[11px] font-semibold text-slate-600">
            {locale === "ar"
              ? "محدثة مباشرة من أنظمة شركات الطيران المركزية"
              : "Synchronized directly with airline GDS systems"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 ms-auto">
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-xl px-2.5 py-1 font-mono font-black text-xs shadow-2xs",
            isLowTime ? "bg-amber-500 text-slate-950 animate-pulse" : "bg-purple-100 text-purple-950"
          )}
        >
          <Clock size={13} className="shrink-0" />
          <span>{timeFormatted}</span>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="inline-flex items-center gap-1 rounded-xl border border-purple-200 bg-white hover:bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-950 shadow-2xs transition-all active:scale-95 cursor-pointer"
        >
          <RefreshCw size={12} className={cn(isRefreshing && "animate-spin text-amber-600")} />
          <span>{locale === "ar" ? "تحديث" : "Refresh"}</span>
        </button>
      </div>
    </div>
  );
}
