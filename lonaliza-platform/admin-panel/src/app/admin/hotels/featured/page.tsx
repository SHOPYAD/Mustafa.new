"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Hotel,
  Sparkles,
  RefreshCw,
  Clock,
  Percent,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowLeft,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Building,
  Layers,
  MapPin,
  TrendingUp,
  Sliders,
  Terminal,
} from "lucide-react";

interface HotelItem {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  city: string;
  country: string;
  neighborhoodAr: string;
  neighborhoodEn: string;
  stars: number;
  rating: number;
  reviewCount: number;
  images: string[];
  cheapestRoom: {
    nameAr: string;
    nameEn: string;
    mealPlanAr: string;
    mealPlanEn: string;
    cancellationAr: string;
    cancellationEn: string;
    bedTypeAr: string;
    bedTypeEn: string;
    price: number;
    originalPrice?: number;
    currency: string;
    supplier: string;
  };
  amenities: string[];
}

interface DestinationData {
  id: string;
  nameAr: string;
  nameEn: string;
  countryAr: string;
  countryEn: string;
  flag: string;
  hotels: HotelItem[];
}

interface SyncSettings {
  enabled: boolean;
  schedule: "every_6h" | "daily" | "weekly" | "manual";
  cronExpression: string;
  markupPercent: number;
  lastSyncAt: number;
  lastSyncStatus: "idle" | "running" | "success" | "error";
  lastSyncMessage: string;
  recentLogs: Array<{
    id: string;
    timestamp: number;
    level: "info" | "success" | "warning" | "error";
    message: string;
  }>;
}

export default function FeaturedHotelsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState<Record<string, DestinationData>>({});
  const [settings, setSettings] = useState<SyncSettings | null>(null);
  const [activeDest, setActiveDest] = useState<string>("istanbul");
  const [isSyncing, setIsSyncing] = useState(false);
  const [markupInput, setMarkupInput] = useState<number>(15);
  const [selectedSchedule, setSelectedSchedule] = useState<string>("daily");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchCatalogData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/hotels/featured-sync");
      const data = await res.json();
      if (data.ok) {
        setCatalog(data.catalog || {});
        setSettings(data.settings);
        setMarkupInput(data.settings?.markupPercent || 15);
        setSelectedSchedule(data.settings?.schedule || "daily");
      }
    } catch (err) {
      console.error("Failed to load featured catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogData();
  }, []);

  const handleTriggerSync = async (destination?: string) => {
    try {
      setIsSyncing(true);
      setNotification(null);
      const res = await fetch("/api/admin/hotels/featured-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "trigger_sync", destination }),
      });
      const data = await res.json();
      if (data.ok) {
        setSettings(data.settings);
        setCatalog(data.catalog);
        setNotification({ type: "success", message: data.message });
      } else {
        setNotification({ type: "error", message: data.error || "فشل التحديث" });
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateMarkup = async () => {
    try {
      const res = await fetch("/api/admin/hotels/featured-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_markup", markupPercent: markupInput }),
      });
      const data = await res.json();
      if (data.ok) {
        setSettings(data.settings);
        setCatalog(data.catalog);
        setNotification({ type: "success", message: data.message });
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    }
  };

  const handleUpdateSchedule = async (schedule: string) => {
    setSelectedSchedule(schedule);
    try {
      const res = await fetch("/api/admin/hotels/featured-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_schedule", schedule }),
      });
      const data = await res.json();
      if (data.ok) {
        setSettings(data.settings);
        setNotification({ type: "success", message: data.message });
      }
    } catch (err: any) {
      setNotification({ type: "error", message: err.message });
    }
  };

  const currentDestination = catalog[activeDest] || Object.values(catalog)[0];
  const destinationsList = Object.values(catalog);
  const totalHotelsCount = destinationsList.reduce((acc, curr) => acc + (curr.hotels?.length || 0), 0);

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              عروض الفنادق المميزة ووكيل التحديث الذكي
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              12 وجهة عالمية · 120 فندقاً أصلياً · مزودون متصلون
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-3">
            <Building className="text-primary size-7" />
            مركز التحكم في فنادق الوجهات ووكيل مزامنة الأسعار (Hotel Sync Agent)
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            إدارة عروض الفنادق الحقيقية من شبكة الموزعين (Hotelbeds, Travelport, RateHawk)، ضبط المارك أب، وجدولة وكيل التحديث الآلي.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <Link
            href="/admin/hotels"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold text-xs transition-all shadow-2xs"
          >
            <ArrowLeft className="size-3.5" />
            <span>العودة لإعدادات المزودين</span>
          </Link>
          <a
            href="/demo"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-600/20 transition-all"
          >
            <ExternalLink className="size-3.5" />
            <span>معاينة القسم في المتجر الحقيقي</span>
          </a>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm transition-all ${
            notification.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
              : "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300"
          }`}
        >
          <div className="flex items-center gap-2.5 font-medium">
            {notification.type === "success" ? (
              <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="size-5 shrink-0 text-red-500" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs underline hover:no-underline opacity-70 hover:opacity-100"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-1">
            <span>الوجهات المعتمدة</span>
            <MapPin className="size-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-foreground">12 وجهة</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">تركيا، أوروبا، آسيا، أمريكا</div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-1">
            <span>إجمالي الفنادق الأصلية</span>
            <Building className="size-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-foreground">{totalHotelsCount || 120} فندقاً</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">10 فنادق متنوعة لكل وجهة</div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-1">
            <span>هامش الربح (Markup)</span>
            <Percent className="size-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-foreground">%{settings?.markupPercent || 15}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">مطبق على كافة الأسعار الحية</div>
        </div>

        <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold mb-1">
            <span>حالة وكيل التحديث</span>
            <Clock className="size-4 text-emerald-500" />
          </div>
          <div className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
            <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
            {settings?.schedule === "every_6h" && "كل 6 ساعات"}
            {settings?.schedule === "daily" && "يومياً (منتصف الليل)"}
            {settings?.schedule === "weekly" && "أسبوعياً (كل أحد)"}
            {settings?.schedule === "manual" && "يدوي فقط"}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            آخر مزامنة:{" "}
            {settings?.lastSyncAt
              ? new Date(settings.lastSyncAt).toLocaleTimeString("ar-SA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "اليوم"}
          </div>
        </div>
      </div>

      {/* Agent Control & Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Sync Agent Actions & Trigger */}
        <div className="lg:col-span-7 bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">وكيل لوناليزا لتحديث أسعار الفنادق المميزة</h3>
                <p className="text-xs text-muted-foreground">
                  جلب وتحديث الأسعار التنافسية من الموزعين دورياً وحفظها في قاعدة بيانات المنصة
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
              🟢 الوكيل نشط
            </span>
          </div>

          {/* Scheduling Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-foreground flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              دورة تشغيل الوكيل والتحديث التلقائي للأسعار:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "every_6h", title: "كل 6 ساعات", desc: "أربع مرات يومياً" },
                { id: "daily", title: "يومياً (تلقائي)", desc: "عند منتصف الليل" },
                { id: "weekly", title: "أسبوعياً", desc: "كل صباح أحد" },
                { id: "manual", title: "يدوي فقط", desc: "عند الطلب فقط" },
              ].map((sch) => (
                <button
                  key={sch.id}
                  type="button"
                  onClick={() => handleUpdateSchedule(sch.id)}
                  className={`p-3 rounded-2xl border text-right transition-all ${
                    selectedSchedule === sch.id
                      ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20"
                      : "bg-muted/40 hover:bg-muted text-foreground border-border"
                  }`}
                >
                  <div className="text-xs font-bold">{sch.title}</div>
                  <div className={`text-[10px] mt-0.5 ${selectedSchedule === sch.id ? "text-purple-100" : "text-muted-foreground"}`}>
                    {sch.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Markup Slider / Adjuster */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-2">
                <Sliders className="size-4 text-amber-500" />
                نسبة المارك أب الخاص بلوناليزا (Lonaliza Platform Markup):
              </label>
              <span className="text-sm font-black text-purple-600 font-mono">%{markupInput}</span>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={markupInput}
                onChange={(e) => setMarkupInput(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer h-2 bg-border rounded-lg"
              />
              <button
                type="button"
                onClick={handleUpdateMarkup}
                className="shrink-0 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-2xs transition-all"
              >
                تطبيق وحفظ
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              يتم حساب سعر الغرفة تلقائياً وفق معادلة: سعر المورد الأصلي + هامش الربح (%{markupInput}).
            </p>
          </div>

          {/* Launch Sync Button */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isSyncing}
              onClick={() => handleTriggerSync()}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-l from-purple-700 via-indigo-600 to-purple-600 hover:brightness-110 text-white font-bold text-sm shadow-xl shadow-purple-600/25 flex items-center justify-center gap-3 transition-all disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`size-5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>
                {isSyncing
                  ? "جارٍ استدعاء الموزعين وتحديث الأسعار لـ 120 فندقاً..."
                  : "🚀 إطلاق وكيل لوناليزا وتحديث أسعار الـ 120 فندقاً من المزودين الآن"}
              </span>
            </button>
          </div>
        </div>

        {/* Right: Live Agent Feed & Terminal Logs */}
        <div className="lg:col-span-5 bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <Terminal className="size-4 text-purple-500" />
                <span>سجل عمليات وتغذية الوكيل اللحظية (Agent Feed)</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">Live Stream</span>
            </div>

            <div className="bg-zinc-950 text-zinc-300 font-mono text-xs p-4 rounded-2xl h-64 overflow-y-auto space-y-2 border border-zinc-800">
              {settings?.recentLogs && settings.recentLogs.length > 0 ? (
                settings.recentLogs.map((log) => (
                  <div key={log.id} className="leading-relaxed flex items-start gap-2">
                    <span className="text-zinc-600 text-[10px] shrink-0 mt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString("en-US", { hour12: false })}
                    </span>
                    <span
                      className={
                        log.level === "success"
                          ? "text-emerald-400"
                          : log.level === "warning"
                          ? "text-amber-400"
                          : log.level === "error"
                          ? "text-red-400"
                          : "text-sky-400"
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-zinc-500 text-center pt-20">لا توجد سجلات بعد. انقر زر الإطلاق لبدء دورة التحديث.</div>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs text-purple-700 dark:text-purple-300 flex items-center gap-2">
            <ShieldCheck className="size-4 shrink-0 text-purple-500" />
            <span>الأسعار والصور موثقة ومحمية بهامش ربح لوناليزا وجدار الأمان الربحي.</span>
          </div>
        </div>
      </div>

      {/* Destinations & Hotels Explorer */}
      <div className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <Layers className="size-5 text-primary" />
              مستعرض فنادق الوجهات الـ 12 (10 فنادق أصلية لكل مدينة)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              اختر أي مدينة لاستعراض فنادقها الـ 10 الحقيقية، الغرف، المزايا، والأسعار بعد المارك أب.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleTriggerSync(activeDest)}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs border border-border transition-all"
          >
            <RefreshCw className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>تحديث أسعار مدينة {currentDestination?.nameAr} فقط</span>
          </button>
        </div>

        {/* 12 Destination Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {destinationsList.map((dest) => (
            <button
              key={dest.id}
              type="button"
              onClick={() => setActiveDest(dest.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                activeDest === dest.id
                  ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20"
                  : "bg-card hover:bg-muted text-muted-foreground border-border"
              }`}
            >
              <span className="text-base">{dest.flag}</span>
              <span>{dest.nameAr}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeDest === dest.id ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {dest.hotels?.length || 10}
              </span>
            </button>
          ))}
        </div>

        {/* Selected City Hotels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentDestination?.hotels?.map((hotel, idx) => (
            <div
              key={hotel.id || idx}
              className="group bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Hotel Photo Banner */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                {hotel.images?.[0] ? (
                  <img
                    src={hotel.images[0]}
                    alt={hotel.nameAr}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    لا توجد صورة
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Rating Badge */}
                <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-xs font-bold flex items-center gap-1 border border-white/10">
                  <span className="text-amber-400">★</span>
                  <span>{hotel.rating || 9.5}</span>
                  <span className="text-[10px] text-zinc-400 font-normal">({hotel.reviewCount || 1200})</span>
                </div>

                {/* Verified Badge */}
                <div className="absolute top-3 right-3 bg-purple-600/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-[11px] font-bold flex items-center gap-1 border border-purple-400/30">
                  <Sparkles className="size-3" />
                  <span>تأكيد فوري مباشر</span>
                </div>

                {/* Bottom Photo Overlay Info */}
                <div className="absolute bottom-3 right-3 left-3 text-white">
                  <div className="text-[11px] font-medium text-purple-200">{hotel.neighborhoodAr}</div>
                  <h4 className="text-sm font-black truncate drop-shadow-md">{hotel.nameAr}</h4>
                  <div className="text-[10px] text-zinc-300 truncate opacity-90">{hotel.nameEn}</div>
                </div>
              </div>

              {/* Hotel Details Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  {/* Room & Meal Plan Box */}
                  <div className="p-2.5 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
                    <div className="font-bold text-foreground text-[11px] line-clamp-1">
                      {hotel.cheapestRoom?.nameAr || "غرفة ديلوكس فاخرة"}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="text-emerald-600 font-semibold">{hotel.cheapestRoom?.mealPlanAr}</span>
                      <span>·</span>
                      <span>{hotel.cheapestRoom?.cancellationAr}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{hotel.cheapestRoom?.bedTypeAr}</div>
                  </div>

                  {/* Amenities Pills */}
                  <div className="flex flex-wrap gap-1">
                    {hotel.amenities?.slice(0, 3).map((am, amIdx) => (
                      <span
                        key={amIdx}
                        className="px-2 py-0.5 rounded-lg bg-border/60 text-[10px] text-muted-foreground font-medium"
                      >
                        {am}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price Section */}
                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-muted-foreground">السعر للغرفة / ليلة</div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-foreground">
                        ${hotel.cheapestRoom?.price || 190}
                      </span>
                      {hotel.cheapestRoom?.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through font-normal">
                          ${hotel.cheapestRoom.originalPrice}
                        </span>
                      )}
                      <span className="text-[10px] text-purple-600 font-bold">شامل المارك أب</span>
                    </div>
                  </div>

                  <a
                    href={`/demo`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <span>معاينة</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
