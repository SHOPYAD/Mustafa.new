// src/app/admin/transfers/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Car,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  SlidersHorizontal,
  TrendingUp,
  Users,
  DollarSign,
  Star,
  Navigation,
  Globe,
  ShieldCheck,
  Check,
} from "lucide-react";

import { TransfersTabsNav, type TransferAdminTab } from "@/components/admin/transfers/TransfersTabsNav";
import { TransferDispatchTab } from "@/components/admin/transfers/TransferDispatchTab";
import { TourDispatchTab } from "@/components/admin/transfers/TourDispatchTab";
import { VehicleClassesTab } from "@/components/admin/transfers/VehicleClassesTab";
import { ZonesTab } from "@/components/admin/transfers/ZonesTab";
import { RoutesTab } from "@/components/admin/transfers/RoutesTab";
import { DailyToursTab } from "@/components/admin/transfers/DailyToursTab";
import { ReviewsTab } from "@/components/admin/transfers/ReviewsTab";
import { SuppliersTab } from "@/components/admin/transfers/SuppliersTab";
import { VehicleModerationTab } from "@/components/admin/transfers/VehicleModerationTab";
import { CommissionTab } from "@/components/admin/transfers/CommissionTab";
import { LiveMapTab } from "@/components/admin/transfers/LiveMapTab";
import { FlightRadarTab } from "@/components/admin/transfers/FlightRadarTab";
import { QuoteRequestsTab } from "@/components/admin/transfers/QuoteRequestsTab";

import { TransferAssignModal } from "@/components/admin/transfers/TransferAssignModal";
import { TransferSettingsModal } from "@/components/admin/transfers/TransferSettingsModal";
import TransfersProviderPanel from "@/components/admin/TransfersProviderPanel";

export default function AdminTransfersMasterPage() {
  const [masterMode, setMasterMode] = useState<"internal_fleet" | "api_providers">("internal_fleet");
  const [activeTab, setActiveTab] = useState<TransferAdminTab>("transfer_dispatch");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Core Data Collections
  const [overview, setOverview] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [vehicleClasses, setVehicleClasses] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [dailyTours, setDailyTours] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [moderationVehicles, setModerationVehicles] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [quoteRequests, setQuoteRequests] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);

  // Modals state
  const [assignBooking, setAssignBooking] = useState<any | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Safe fetch helper with timeout & resilience
  const safeFetchJson = async (url: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(url, { cache: "no-store", signal: controller.signal });
      clearTimeout(timeoutId);
      if (!res.ok) return { ok: false, status: res.status };
      return await res.json();
    } catch (e: any) {
      console.warn(`Safe fetch bypassed for ${url}:`, e?.message);
      return { ok: false, error: e?.message };
    }
  };

  // Resilient load all data - never hangs permanently
  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [
        overviewData,
        dispatchData,
        classesData,
        zonesData,
        routesData,
        toursData,
        suppliersData,
        moderationData,
        telemetryData,
        reviewsData,
        quotesData,
        settingsData,
      ] = await Promise.all([
        safeFetchJson("/api/transfers/admin/overview"),
        safeFetchJson("/api/transfers/admin/dispatch"),
        safeFetchJson("/api/transfers/admin/vehicle-classes"),
        safeFetchJson("/api/transfers/admin/zones"),
        safeFetchJson("/api/transfers/admin/routes"),
        safeFetchJson("/api/transfers/admin/daily-tours"),
        safeFetchJson("/api/transfers/admin/suppliers"),
        safeFetchJson("/api/transfers/admin/moderation"),
        safeFetchJson("/api/transfers/admin/live-map"),
        safeFetchJson("/api/transfers/admin/reviews"),
        safeFetchJson("/api/transfers/admin/quote-requests"),
        safeFetchJson("/api/transfers/admin/settings"),
      ]);

      if (overviewData?.ok && overviewData?.stats) setOverview(overviewData.stats);
      if (dispatchData?.ok && dispatchData?.bookings) setBookings(dispatchData.bookings);
      if (classesData?.ok && classesData?.list) setVehicleClasses(classesData.list);
      if (zonesData?.ok && zonesData?.list) setZones(zonesData.list);
      if (routesData?.ok && routesData?.list) setRoutes(routesData.list);
      if (toursData?.ok && toursData?.list) setDailyTours(toursData.list);
      if (suppliersData?.ok && suppliersData?.list) setSuppliers(suppliersData.list);
      if (moderationData?.ok && moderationData?.vehicles) setModerationVehicles(moderationData.vehicles);
      if (telemetryData?.ok && telemetryData?.telemetry) setTelemetry(telemetryData.telemetry);
      if (reviewsData?.ok && reviewsData?.reviews) setReviews(reviewsData.reviews);
      if (quotesData?.ok && quotesData?.list) setQuoteRequests(quotesData.list);
      if (settingsData?.ok && settingsData?.settings) setSettings(settingsData.settings);
    } catch (err: any) {
      console.error("Transfers admin fetch error:", err);
      // Soft non-blocking warning
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Derived available drivers for assignment
  const availableDrivers = useMemo(() => {
    return moderationVehicles
      .filter((v) => v.moderationStatus === "approved" || v.isActive)
      .map((v) => ({
        vehicleId: v.id,
        supplierId: v.supplierId,
        make: v.make,
        model: v.model,
        plateNumber: v.plateNumber,
        driverName: v.driver?.name || "سائق غير مسمى",
        driverPhone: v.driver?.phone || "",
        vehicleClassId: v.vehicleClassId,
      }));
  }, [moderationVehicles]);

  // Handlers for Dispatch
  const handleAssignDriver = async (data: {
    bookingId: string;
    supplierId: string;
    vehicleId: string;
    driverName: string;
    driverPhone: string;
    plateNumber: string;
  }) => {
    const res = await fetch("/api/transfers/admin/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "assign_driver", ...data }),
    });
    const result = await res.json();
    if (!result.ok) throw new Error(result.error || "فشل إسناد السائق");
    loadAllData();
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("هل أنت متأكد من إلغاء هذا الحجز؟")) return;
    const res = await fetch("/api/transfers/admin/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel_booking", bookingId }),
    });
    const result = await res.json();
    if (!result.ok) alert(result.error || "فشل إلغاء الحجز");
    loadAllData();
  };

  const handleChangeTripStatus = async (bookingId: string, status: string) => {
    const res = await fetch("/api/transfers/admin/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_status", bookingId, status }),
    });
    const result = await res.json();
    if (!result.ok) alert(result.error || "فشل تغيير حالة الرحلة");
    loadAllData();
  };

  // Handlers for Vehicle Classes
  const handleSaveVehicleClass = async (data: any) => {
    const res = await fetch("/api/transfers/admin/vehicle-classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.ok) throw new Error(result.error || "فشل حفظ فئة السيارة");
    loadAllData();
  };

  const handleDeleteVehicleClass = async (id: string) => {
    const res = await fetch(`/api/transfers/admin/vehicle-classes?id=${id}`, {
      method: "DELETE",
    });
    const result = await res.json();
    if (!result.ok) throw new Error(result.error || "فشل حذف فئة السيارة");
    loadAllData();
  };

  // Handlers for Zones
  const handleSaveZone = async (data: any) => {
    const res = await fetch("/api/transfers/admin/zones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.ok) throw new Error(result.error || "فشل حفظ المنطقة / المطار");
    loadAllData();
  };

  const handleDeleteZone = async (id: string) => {
    const res = await fetch(`/api/transfers/admin/zones?id=${id}`, {
      method: "DELETE",
    });
    const result = await res.json();
    if (!result.ok) throw new Error(result.error || "فشل حذف المنطقة");
    loadAllData();
  };

  // Handlers for Routes
  const handleSaveRoute = async (data: any) => {
    const res = await fetch("/api/transfers/admin/routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.ok) throw new Error(result.error || "فشل حفظ المسار");
    loadAllData();
  };

  const handleDeleteRoute = async (id: string) => {
    const res = await fetch(`/api/transfers/admin/routes?id=${id}`, {
      method: "DELETE",
    });
    const result = await res.json();
    if (!result.ok) throw new Error(result.error || "فشل حذف المسار");
    loadAllData();
  };

  // Handlers for Daily Tours
  const handleSaveTour = async (data: any) => {
    const res = await fetch("/api/transfers/admin/daily-tours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.ok) throw new Error(result.error || "فشل حفظ الجولة اليومية");
    loadAllData();
  };

  const handleDeleteTour = async (id: string) => {
    const res = await fetch(`/api/transfers/admin/daily-tours?id=${id}`, {
      method: "DELETE",
    });
    const result = await res.json();
    if (!result.ok) throw new Error(result.error || "فشل حذف الجولة");
    loadAllData();
  };

  // Handlers for Suppliers
  const handleSaveSupplier = async (data: any) => {
    const res = await fetch("/api/transfers/admin/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.ok) throw new Error(result.error || "فشل حفظ بيانات الشركة");
    loadAllData();
  };

  const handleApproveSupplier = async (supplierId: string) => {
    const res = await fetch("/api/transfers/admin/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve", supplierId }),
    });
    const result = await res.json();
    if (!result.ok) throw new Error(result.error || "فشل اعتماد الشريك");
    loadAllData();
  };

  const handleRejectSupplier = async (supplierId: string, reason?: string) => {
    const res = await fetch("/api/transfers/admin/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", supplierId, reason }),
    });
    const result = await res.json();
    if (!result.ok) throw new Error(result.error || "فشل رفض الشريك");
    loadAllData();
  };

  const handleAddPayoutVoucher = async (data: any) => {
    const res = await fetch("/api/transfers/admin/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add_payout_voucher", ...data }),
    });
    const result = await res.json();
    if (!result.ok) throw new Error(result.error || "فشل تسجيل سند التحويل");
    loadAllData();
  };

  // Handlers for Moderation
  const handleModerateVehicle = async (
    vehicleId: string,
    status: "approved" | "rejected",
    note?: string
  ) => {
    const res = await fetch("/api/transfers/admin/moderation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "moderate_vehicle", vehicleId, status, note }),
    });
    const result = await res.json();
    if (!result.ok) throw new Error(result.error || "فشل تدقيق السيارة");
    loadAllData();
  };

  const handleToggleAutoApprove = async (autoApprove: boolean) => {
    const res = await fetch("/api/transfers/admin/moderation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle_auto_approve", autoApprove }),
    });
    const result = await res.json();
    if (!result.ok) throw new Error(result.error || "فشل تعديل القبول التلقائي");
    loadAllData();
  };

  // Handlers for Reviews
  const handleModerateReview = async (
    id: string,
    status: "published" | "pending" | "hidden",
    adminReply?: string
  ) => {
    const res = await fetch("/api/transfers/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "moderate", id, status, adminReply }),
    });
    const result = await res.json();
    if (!result.ok) alert(result.error || "فشل تحديث التقييم");
    loadAllData();
  };

  // Handlers for Quotes
  const handleUpdateQuote = async (data: {
    id: string;
    quotedAmount?: number;
    quotedCurrency?: string;
    status?: string;
    internalNote?: string;
  }) => {
    const res = await fetch("/api/transfers/admin/quote-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_quote", ...data }),
    });
    const result = await res.json();
    if (!result.ok) throw new Error(result.error || "فشل تحديث طلب التسعير");
    loadAllData();
  };

  // Handlers for Settings
  const handleSaveSettings = async (newSettings: any) => {
    const res = await fetch("/api/transfers/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSettings),
    });
    const result = await res.json();
    if (!result.ok) throw new Error(result.error || "فشل حفظ الإعدادات");
    loadAllData();
  };

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-6" dir="rtl">
      {/* Master Mode Switcher Bar */}
      <div className="p-2 rounded-3xl bg-slate-100/90 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-inner flex flex-col sm:flex-row items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setMasterMode("internal_fleet");
            if (activeTab === "api_providers") setActiveTab("transfer_dispatch");
          }}
          className={`flex-1 w-full sm:w-auto py-3 px-5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-3 cursor-pointer ${
            masterMode === "internal_fleet"
              ? "bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 text-white shadow-lg shadow-purple-600/30 scale-[1.01]"
              : "bg-transparent hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">🇹🇷</span>
            <Car className="w-4 h-4" />
            <span className="text-sm">الأسطول الداخلي والعمليات المباشرة (تركيا فقط)</span>
          </div>
          <span
            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
              masterMode === "internal_fleet"
                ? "bg-white/20 text-white"
                : "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300"
            }`}
          >
            إسطنبول • طرابزون • أنطاليا • بورصة
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setMasterMode("api_providers");
            setActiveTab("api_providers");
          }}
          className={`flex-1 w-full sm:w-auto py-3 px-5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-3 cursor-pointer ${
            masterMode === "api_providers"
              ? "bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white shadow-lg shadow-blue-600/30 scale-[1.01]"
              : "bg-transparent hover:bg-white/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">🌍</span>
            <Globe className="w-4 h-4" />
            <span className="text-sm">محركات الـ API والموزعون الدوليون (تغطية عالمية)</span>
          </div>
          <span
            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
              masterMode === "api_providers"
                ? "bg-white/20 text-white"
                : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
            }`}
          >
            150+ دولة حول العالم
          </span>
        </button>
      </div>

      {/* Top Header Banner - Dynamically Changes based on Master Mode */}
      {masterMode === "internal_fleet" ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-900/15 via-indigo-900/10 to-transparent dark:from-purple-950/40 dark:via-slate-900 border border-purple-200/80 dark:border-purple-900/40 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-black tracking-wide shadow-sm flex items-center gap-1.5">
                <span>🇹🇷</span>
                <span>الأسطول الداخلي المعتمد (تركيا - إسطنبول، طرابزون، أنطاليا)</span>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                منظومة العمليات الميدانية في تركيا v2.0
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300">
                <Car className="w-6 h-6" />
              </div>
              <span>إدارة الأسطول الداخلي والعمليات المباشرة (Chauffeur & Tours Fleet)</span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              إدارة وتتبع الأسطول المباشر وسائقينا المعتمدين في تركيا، ترحيل المسارات من مطارات إسطنبول (IST/SAW)، طرابزون (TZX)، وأنطاليا (AYT)، الجولات اليومية بالساعات، إدارة عمولات الشركات الشريكة، وتطبيق السائقين.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={loadAllData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-purple-600 dark:text-purple-400 ${isLoading ? "animate-spin" : ""}`} />
              <span>تحديث البيانات</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black shadow-md shadow-purple-500/20 transition-all cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>إعدادات الخصم والعمولات</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-900/15 via-indigo-900/10 to-transparent dark:from-blue-950/40 dark:via-slate-900 border border-blue-200/80 dark:border-blue-900/40 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black tracking-wide shadow-sm flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>شبكة التوزيع والمزودين العالمية (تغطية دولية شاملة)</span>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                بوابة الموزعين والـ API الدولي v2.0
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300">
                <Globe className="w-6 h-6" />
              </div>
              <span>محركات وموزعو الـ API لخدمات النقل والمطارات العالمية</span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              إدارة وتكامل محركات النقل والمطارات العالمية (Travelpayouts, Seeru, Mozio, Kiwitaxi, GetTransfer, HolidayTaxis) لخدمة أكثر من 150 دولة و1500 مطار دولي مع التحكم بهوامش الربح والتوجيه الذكي.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setMasterMode("internal_fleet");
                setActiveTab("transfer_dispatch");
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <span>الانتقال إلى الأسطول الداخلي (تركيا) 🇹🇷</span>
            </button>
          </div>
        </div>
      )}

      {/* Error alert if any */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Interactive Transfer Analytics & Operational KPI Strip - Adapts to Mode */}
      {masterMode === "internal_fleet" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Total Bookings */}
          <button
            type="button"
            onClick={() => setActiveTab("transfer_dispatch")}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 shadow-xs hover:shadow-md transition-all text-start cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">إجمالي حجوزات تركيا</span>
              <div className="size-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Car size={16} />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {overview?.totalBookingsCount ?? bookings.length}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              منها {overview?.completedTripsCount ?? 0} رحلة مكتملة
            </div>
          </button>

          {/* Live Trips in Progress */}
          <button
            type="button"
            onClick={() => setActiveTab("live_map")}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-xs hover:shadow-md transition-all text-start cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">رحلات جارية لايف</span>
              <div className="size-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Navigation size={16} />
              </div>
            </div>
            <div className="text-xl font-black text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <span>{overview?.activeTripsCount ?? 0}</span>
              <span className="size-2 rounded-full bg-blue-500 animate-ping" />
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              في الطريق وتحت التنفيذ الآن
            </div>
          </button>

          {/* Active Live Drivers */}
          <button
            type="button"
            onClick={() => setActiveTab("live_map")}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 shadow-xs hover:shadow-md transition-all text-start cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">سائقين متصلين لايف</span>
              <div className="size-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={16} />
              </div>
            </div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span>{overview?.activeDriversOnline ?? telemetry.length}</span>
              <span className="size-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              أسطول جاهز وفوري للتكليف
            </div>
          </button>

          {/* Platform Commission Profits */}
          <button
            type="button"
            onClick={() => setActiveTab("commission")}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 shadow-xs hover:shadow-md transition-all text-start cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">أرباح عمولات المنصة</span>
              <div className="size-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400">
              ${overview?.totalCommissionRevenue ?? 0}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              من إجمالي مبيعات ${overview?.totalGrossRevenue ?? 0}
            </div>
          </button>

          {/* Customer Satisfaction Rating */}
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 shadow-xs hover:shadow-md transition-all text-start cursor-pointer group col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">معدل تقييم الأسطول</span>
              <div className="size-8 rounded-xl bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star size={16} className="fill-yellow-500 text-yellow-500" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-1">
              <span>{overview?.averageRating ?? 4.9}</span>
              <span className="text-xs font-normal text-slate-400">/ 5.0</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              بناءً على {overview?.reviewsCount ?? reviews.length} تقييم موثق
            </div>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">الموزعون العالميون</span>
              <div className="size-8 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                <Globe size={16} />
              </div>
            </div>
            <div className="text-xl font-black text-blue-600 dark:text-blue-400">6 مزودين</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Travelpayouts, Mozio, Kiwitaxi...</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">التغطية الدولية</span>
              <div className="size-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                <Navigation size={16} />
              </div>
            </div>
            <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">150+ دولة</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">أوروبا، الخليج، آسيا، أمريكا</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">المطارات المدعومة</span>
              <div className="size-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <Car size={16} />
              </div>
            </div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">1500+ مطار</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">استقبال مباشر ولافتات بالاسم</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">متوسط هامش الربح</span>
              <div className="size-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400">+15% Markup</div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">يضاف تلقائياً فوق أسعار الشريك</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">حالة جاهزية الـ API</span>
              <div className="size-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                <ShieldCheck size={16} />
              </div>
            </div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span>99.9%</span>
              <span className="size-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">بحث وحجز لحظي فوري</div>
          </div>
        </div>
      )}

      {/* Internal Fleet Tabs Navigation Bar - Only Shown in Fleet Mode */}
      {masterMode === "internal_fleet" && (
        <TransfersTabsNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            if (tab === "api_providers") {
              setMasterMode("api_providers");
            } else {
              setActiveTab(tab);
            }
          }}
          stats={{
            pendingTransfersCount: overview?.pendingTransfersCount ?? 0,
            pendingToursCount: overview?.pendingToursCount ?? 0,
            pendingModerationCount: overview?.pendingModerationCount ?? 0,
            activeDriversOnline: overview?.activeDriversOnline ?? telemetry.length,
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      )}

      {/* Main Content View */}
      {masterMode === "api_providers" ? (
        <div className="min-h-[400px]">
          <TransfersProviderPanel onProviderChange={() => { loadAllData(); }} />
        </div>
      ) : (
        <div className="min-h-[400px]">
        {activeTab === "transfer_dispatch" && (
          <TransferDispatchTab
            bookings={bookings}
            isLoading={isLoading}
            onRefresh={loadAllData}
            onOpenAssign={(b) => setAssignBooking(b)}
            onCancelBooking={handleCancelBooking}
            onChangeStatus={handleChangeTripStatus}
          />
        )}

        {activeTab === "tour_dispatch" && (
          <TourDispatchTab
            bookings={bookings}
            isLoading={isLoading}
            onRefresh={loadAllData}
            onOpenAssign={(b) => setAssignBooking(b)}
            onCancelBooking={handleCancelBooking}
            onChangeStatus={handleChangeTripStatus}
          />
        )}

        {activeTab === "vehicle_classes" && (
          <VehicleClassesTab
            vehicleClasses={vehicleClasses}
            isLoading={isLoading}
            onRefresh={loadAllData}
            onSaveClass={handleSaveVehicleClass}
            onDeleteClass={handleDeleteVehicleClass}
          />
        )}

        {activeTab === "zones" && (
          <ZonesTab
            zones={zones}
            isLoading={isLoading}
            onRefresh={loadAllData}
            onSaveZone={handleSaveZone}
            onDeleteZone={handleDeleteZone}
          />
        )}

        {activeTab === "routes" && (
          <RoutesTab
            routes={routes}
            zones={zones}
            vehicleClasses={vehicleClasses}
            isLoading={isLoading}
            onRefresh={loadAllData}
            onSaveRoute={handleSaveRoute}
            onDeleteRoute={handleDeleteRoute}
          />
        )}

        {activeTab === "daily_tours" && (
          <DailyToursTab
            tours={dailyTours}
            vehicleClasses={vehicleClasses}
            isLoading={isLoading}
            onRefresh={loadAllData}
            onSaveTour={handleSaveTour}
            onDeleteTour={handleDeleteTour}
          />
        )}

        {activeTab === "reviews" && (
          <ReviewsTab
            reviews={reviews}
            isLoading={isLoading}
            onRefresh={loadAllData}
            onModerateReview={handleModerateReview}
          />
        )}

        {activeTab === "suppliers" && (
          <SuppliersTab
            suppliers={suppliers}
            isLoading={isLoading}
            onRefresh={loadAllData}
            onSaveSupplier={handleSaveSupplier}
            onAddPayoutVoucher={handleAddPayoutVoucher}
            onApproveSupplier={handleApproveSupplier}
            onRejectSupplier={handleRejectSupplier}
          />
        )}

        {activeTab === "moderation" && (
          <VehicleModerationTab
            vehicles={moderationVehicles}
            autoApproveFleet={settings?.autoApproveFleet ?? false}
            isLoading={isLoading}
            onRefresh={loadAllData}
            onModerate={handleModerateVehicle}
            onToggleAutoApprove={handleToggleAutoApprove}
          />
        )}

        {activeTab === "commission" && (
          <CommissionTab
            suppliers={suppliers}
            bookings={bookings}
            isLoading={isLoading}
            onRefresh={loadAllData}
            onAddPayoutVoucher={handleAddPayoutVoucher}
          />
        )}

        {activeTab === "live_map" && (
          <LiveMapTab
            telemetry={telemetry}
            activeTrips={bookings.filter((b) => ["accepted", "on_the_way", "arrived", "in_progress"].includes(b.status))}
            isLoading={isLoading}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === "flight_radar" && <FlightRadarTab />}

        {activeTab === "quote_requests" && (
          <QuoteRequestsTab
            quoteRequests={quoteRequests}
            isLoading={isLoading}
            onRefresh={loadAllData}
            onUpdateQuote={handleUpdateQuote}
          />
        )}

        </div>
      )}

      {/* Driver Assignment Modal */}
      <TransferAssignModal
        isOpen={!!assignBooking}
        onClose={() => setAssignBooking(null)}
        booking={assignBooking}
        availableDrivers={availableDrivers}
        onAssign={handleAssignDriver}
      />

      {/* Settings Modal */}
      <TransferSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}
