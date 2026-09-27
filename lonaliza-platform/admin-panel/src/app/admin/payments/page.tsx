"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  CreditCard,
  Building2,
  CheckCircle2,
  Globe,
  Loader2,
  Lock,
  MessageCircle,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Tag,
  Zap,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Layers,
  ArrowRightLeft,
  RotateCcw,
  CheckCircle,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import GatewayConfigModal from "@/components/admin/payments/GatewayConfigModal";
import type { CatalogEntry } from "@/lib/gateways/catalog";

interface TenantItem {
  id: string;
  name: string;
  isPlatform: boolean;
  subdomain?: string;
}

interface AdminBooking {
  id: string;
  type: string;
  bookingRef: string;
  title: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: string;
  paymentId?: string;
  paymentToken?: string;
  created: string;
}

type MainTab = "gateways" | "bookings" | "whatsapp";
type RegionTab =
  | "all"
  | "turkey"
  | "mena"
  | "global"
  | "asia"
  | "crypto"
  | "cis"
  | "africa"
  | "latam";

const REGION_TABS: Array<{ id: RegionTab; labelAr: string; icon: string; countHint?: number }> = [
  { id: "all", labelAr: "الكل", icon: "🌐" },
  { id: "turkey", labelAr: "تركيا", icon: "🇹🇷" },
  { id: "mena", labelAr: "الشرق الأوسط", icon: "🇸🇦" },
  { id: "global", labelAr: "عالمية", icon: "🌍" },
  { id: "asia", labelAr: "آسيا", icon: "🌏" },
  { id: "crypto", labelAr: "عملات رقمية", icon: "🪙" },
  { id: "cis", labelAr: "روسيا و CIS", icon: "🇷🇺" },
  { id: "africa", labelAr: "أفريقيا", icon: "🌍" },
  { id: "latam", labelAr: "أمريكا اللاتينية", icon: "🌎" },
];

export default function AdminPaymentsPage() {
  const { dir } = useLocale();

  // Navigation
  const [mainTab, setMainTab] = useState<MainTab>("gateways");
  const [regionTab, setRegionTab] = useState<RegionTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Multi-Tenancy
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>("platform");
  const [activeGatewayForTenant, setActiveGatewayForTenant] = useState<string>("iyzico");

  // Gateways Data
  const [catalog, setCatalog] = useState<
    Array<
      CatalogEntry & {
        tenantEnabled?: boolean;
        tenantActive?: boolean;
        tenantTestMode?: boolean;
        hasCredentials?: boolean;
        isSystemDefault?: boolean;
      }
    >
  >([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Modal State
  const [selectedGatewayForModal, setSelectedGatewayForModal] = useState<CatalogEntry | null>(null);
  const [modalInitialConfig, setModalInitialConfig] = useState<{
    enabled?: boolean;
    testMode?: boolean;
    credentials?: Record<string, string>;
  }>({});

  // Bookings state
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [actionBusyId, setActionBusyId] = useState("");
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // WhatsApp Bank Settings state
  const [whatsappBankEnabled, setWhatsappBankEnabled] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);

  // Notification helper
  const showToast = useCallback((type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // 1. Load Catalog & Tenant Status
  const loadCatalog = useCallback(async (tenantId: string) => {
    try {
      setLoadingCatalog(true);
      const res = await fetch(`/api/admin/payments/catalog?tenantId=${encodeURIComponent(tenantId)}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data?.ok) {
        setCatalog(data.catalog || []);
        if (Array.isArray(data.tenants)) setTenants(data.tenants);
        setActiveGatewayForTenant(data.activeGateway || "iyzico");
      }
    } catch {
      showToast("error", "فشل تحميل كتالوج بوابات الدفع");
    } finally {
      setLoadingCatalog(false);
    }
  }, [showToast]);

  // 2. Load Bookings History
  const loadBookings = useCallback(async () => {
    try {
      setLoadingBookings(true);
      const res = await fetch("/api/admin/iyzico-bookings", { cache: "no-store" });
      const data = (await res.json()) as { bookings?: AdminBooking[] };
      setBookings(data.bookings || []);
    } catch {
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  // 3. Load WhatsApp Settings
  const loadWhatsappSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/payments-settings", { cache: "no-store" });
      const data = await res.json();
      if (data?.values) {
        setWhatsappBankEnabled(data.values.PAYMENTS_WHATSAPP_BANK_LINK_ENABLED !== "false");
        setWhatsappNumber(data.values.PAYMENTS_WHATSAPP_NUMBER || "");
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void loadCatalog(selectedTenantId);
    void loadBookings();
    void loadWhatsappSettings();
  }, [loadCatalog, loadBookings, loadWhatsappSettings, selectedTenantId]);

  // Handle switching Tenant
  const handleTenantChange = (newTenantId: string) => {
    setSelectedTenantId(newTenantId);
  };

  // Toggle Gateway enable/disable
  const handleToggleGateway = async (gateway: CatalogEntry, currentEnabled: boolean) => {
    const nextEnabled = !currentEnabled;
    // Optimistic UI update
    setCatalog((prev) =>
      prev.map((g) => (g.kind === gateway.kind ? { ...g, tenantEnabled: nextEnabled } : g))
    );

    try {
      const res = await fetch("/api/admin/payments/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: selectedTenantId,
          kind: gateway.kind,
          enabled: nextEnabled,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "فشل تحديث حالة البوابة");
      }
      showToast("success", data.message || "تم تحديث حالة البوابة بنجاح فوري");
    } catch (err: unknown) {
      // Revert optimistic update
      setCatalog((prev) =>
        prev.map((g) => (g.kind === gateway.kind ? { ...g, tenantEnabled: currentEnabled } : g))
      );
      showToast("error", err instanceof Error ? err.message : "فشل تحديث حالة البوابة");
    }
  };

  // Set as primary active gateway
  const handleSetActiveGateway = async (gateway: CatalogEntry) => {
    const previousActive = activeGatewayForTenant;
    setActiveGatewayForTenant(gateway.kind);

    setCatalog((prev) =>
      prev.map((g) => ({
        ...g,
        tenantActive: g.kind === gateway.kind,
        tenantEnabled: g.kind === gateway.kind ? true : g.tenantEnabled,
      }))
    );

    try {
      const res = await fetch("/api/admin/payments/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: selectedTenantId,
          kind: gateway.kind,
          makeActive: true,
          enabled: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "فشل تعيين البوابة كرئيسية");
      }
      showToast(
        "success",
        `تم تعيين (${gateway.marketing?.brandLabel || gateway.displayName}) كبوابة دفع رئيسية ونشطة بنجاح!`
      );
    } catch (err: unknown) {
      setActiveGatewayForTenant(previousActive);
      setCatalog((prev) =>
        prev.map((g) => ({
          ...g,
          tenantActive: g.kind === previousActive,
        }))
      );
      showToast("error", err instanceof Error ? err.message : "فشل تعيين البوابة كرئيسية");
    }
  };

  // Open modal for a gateway
  const handleOpenConfigModal = async (gateway: CatalogEntry) => {
    setSelectedGatewayForModal(gateway);
    try {
      const res = await fetch(
        `/api/admin/payments/configs?tenantId=${encodeURIComponent(selectedTenantId)}&kind=${gateway.kind}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (data?.config) {
        setModalInitialConfig({
          enabled: Boolean(data.config.enabled),
          testMode: Boolean(data.config.testMode ?? true),
          credentials: data.config.credentials || {},
        });
      } else {
        setModalInitialConfig({
          enabled: gateway.tenantEnabled ?? false,
          testMode: gateway.tenantTestMode ?? true,
          credentials: {},
        });
      }
    } catch {
      setModalInitialConfig({
        enabled: gateway.tenantEnabled ?? false,
        testMode: gateway.tenantTestMode ?? true,
        credentials: {},
      });
    }
  };

  // Save WhatsApp settings
  const handleSaveWhatsapp = async () => {
    setSavingWhatsapp(true);
    try {
      const res = await fetch("/api/admin/payments-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          values: {
            PAYMENTS_WHATSAPP_BANK_LINK_ENABLED: whatsappBankEnabled ? "true" : "false",
            PAYMENTS_WHATSAPP_NUMBER: whatsappNumber,
          },
        }),
      });
      const data = await res.json();
      if (data?.ok) {
        showToast("success", "تم حفظ إعدادات الواتساب والتحويل البنكي فورياً وبنجاح!");
      } else {
        showToast("error", data?.error || "فشل حفظ إعدادات الواتساب");
      }
    } catch {
      showToast("error", "فشل الاتصال بالخادم لحفظ إعدادات الواتساب");
    } finally {
      setSavingWhatsapp(false);
    }
  };

  // Run Booking actions (Refund / Retrieve)
  const handleBookingAction = async (action: "retrieve" | "refund", booking: AdminBooking) => {
    if (action === "refund" && !window.confirm(`هل أنت متأكد من رغبتك في استرداد مبلغ الحجز (${booking.bookingRef})؟`)) {
      return;
    }

    setActionBusyId(`${action}:${booking.id}`);
    try {
      const res = await fetch("/api/admin/iyzico-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, bookingId: booking.id }),
      });
      const data = (await res.json()) as { ok?: boolean; booking?: AdminBooking; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "فشلت العملية");
      }
      if (data.booking) {
        setBookings((prev) => prev.map((b) => (b.id === data.booking?.id ? data.booking! : b)));
      } else {
        await loadBookings();
      }
      showToast("success", action === "refund" ? "تم استرداد المبلغ بنجاح عبر البوابة" : "تم تحديث ومزامنة حالة الحجز");
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "فشلت العملية على الحجز");
    } finally {
      setActionBusyId("");
    }
  };

  // Filtered gateways
  const filteredGateways = useMemo(() => {
    return catalog.filter((g) => {
      // Region filter
      if (regionTab !== "all") {
        if (g.region?.id !== regionTab) return false;
      }

      // Type filter
      if (typeFilter !== "all") {
        if (g.type !== typeFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (g.displayName || "").toLowerCase().includes(q);
        const labelMatch = (g.marketing?.brandLabel || "").toLowerCase().includes(q);
        const kindMatch = g.kind.toLowerCase().includes(q);
        const countryMatch = g.supportedCountries.some((c) => c.toLowerCase().includes(q));
        const currMatch = g.supportedCurrencies.some((c) => c.toLowerCase().includes(q));
        if (!nameMatch && !labelMatch && !kindMatch && !countryMatch && !currMatch) {
          return false;
        }
      }

      return true;
    });
  }, [catalog, regionTab, typeFilter, searchQuery]);

  // Statistics
  const activeCount = useMemo(() => {
    return catalog.filter((g) => g.tenantEnabled).length;
  }, [catalog]);

  const selectedTenantName = useMemo(() => {
    return tenants.find((t) => t.id === selectedTenantId)?.name || "منصة لوناليزا المركزية";
  }, [tenants, selectedTenantId]);

  return (
    <div className="w-full max-w-none min-w-0 space-y-6" dir={dir}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed top-5 start-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl border shadow-2xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-3 ${
            toastMessage.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-200 backdrop-blur-md"
              : "bg-rose-500/15 border-rose-500/40 text-rose-800 dark:text-rose-200 backdrop-blur-md"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-500 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header & Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 shadow-xs">
            <CreditCard size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-foreground">
                إدارة بوابات الدفع والتحصيل العالمي
              </h1>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Multi-Tenant Engine
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              48+ بوابة دفع عالمية وإقليمية وكريبتو مع دعم تعدد المستأجرين وبقاء إيزيكو الافتراضية
            </p>
          </div>
        </div>

        {/* Tenant Scope Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <div className="flex items-center gap-2 bg-card border border-border/80 px-3.5 py-2 rounded-2xl shadow-xs">
            <Building2 size={16} className="text-primary shrink-0" />
            <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
              نطاق الشركة / الموزع:
            </span>
            <select
              value={selectedTenantId}
              onChange={(e) => handleTenantChange(e.target.value)}
              className="bg-transparent text-xs font-black text-foreground focus:outline-none cursor-pointer max-w-[220px] truncate"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id} className="bg-card text-foreground">
                  {t.isPlatform ? "🏛️ " : "🏢 "}
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Telemetry KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>البوابة الافتراضية للنظام</span>
            <Star size={15} className="text-amber-500 fill-amber-500" />
          </div>
          <div className="text-xl font-black text-foreground">
            إيزيكو (Iyzipay)
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center gap-1">
            <Check size={12} />
            <span>نشطة دائماً كـ Fallback للمنصة</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>البوابة النشطة للكيان المختار</span>
            <Zap size={15} className="text-primary" />
          </div>
          <div className="text-xl font-black text-foreground truncate">
            {activeGatewayForTenant.toUpperCase()}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1 truncate">
            {selectedTenantName}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>البوابات المفعلة للكيان</span>
            <CheckCircle2 size={15} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">
            {activeCount}
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">
            من إجمالي {catalog.length} بوابة
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>بروتوكول التشفير الآمن</span>
            <Lock size={15} className="text-emerald-500" />
          </div>
          <div className="text-xl font-black text-foreground font-mono">
            AES-256-GCM
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            حماية المفاتيح ومنع الريفريش
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border/70 overflow-x-auto pb-0">
        <button
          type="button"
          onClick={() => setMainTab("gateways")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            mainTab === "gateways"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers size={16} />
          <span>بوابات الدفع والتحصيل (48+ بوابة)</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab("bookings")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            mainTab === "bookings"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <RefreshCw size={16} />
          <span>سجل عمليات الدفع والحجوزات ({bookings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMainTab("whatsapp")}
          className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            mainTab === "whatsapp"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageCircle size={16} />
          <span>التحويل البنكي والواتساب المباشر</span>
        </button>
      </div>

      {/* Tab 1: Gateways & Multi-Tenancy Catalog */}
      {mainTab === "gateways" && (
        <div className="space-y-6">
          {/* Regional & Continental Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {REGION_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setRegionTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  regionTab === tab.id
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.labelAr}</span>
              </button>
            ))}
          </div>

          {/* Search & Type Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، كود البوابة، الدولة، العملة (مثال: Stripe, KSA, USD, SAR, Tamara)..."
                className="w-full ps-10 pe-4 py-2.5 bg-card border border-border/80 rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-card border border-border/80 px-3 py-2 rounded-xl">
                <SlidersHorizontal size={14} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">نوع الدفع:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="all" className="bg-card">الكل</option>
                  <option value="card" className="bg-card">بطاقات بنكية (Cards)</option>
                  <option value="bnpl" className="bg-card">تقسيط (BNPL)</option>
                  <option value="wallet" className="bg-card">محافظ إلكترونية (Wallets)</option>
                  <option value="crypto" className="bg-card">عملات مشفرة (Crypto)</option>
                  <option value="bank" className="bg-card">تحويل بنكي (Bank)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Gateways Grid */}
          {loadingCatalog ? (
            <div className="flex flex-col items-center justify-center p-16 space-y-3 text-muted-foreground">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-xs font-bold">جاري تحميل كتالوج بوابات الدفع والتحقق من التشفير...</p>
            </div>
          ) : filteredGateways.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-border/80 bg-card/40 space-y-2">
              <CreditCard size={36} className="mx-auto text-muted-foreground/60" />
              <p className="text-sm font-bold text-foreground">لا توجد بوابات دفع تطابق البحث المختار</p>
              <p className="text-xs text-muted-foreground">جرب اختيار إقليم آخر أو تفريغ نص البحث</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {filteredGateways.map((gw) => {
                const isDefault = gw.kind === "iyzico";
                const isPrimary = activeGatewayForTenant === gw.kind;
                const isEnabled = gw.tenantEnabled;
                const logoPath = gw.marketing?.logoPath
                  ? `/payment-gateways/${gw.marketing.logoPath}`
                  : `/payment-gateways/${gw.kind}.svg`;

                return (
                  <div
                    key={gw.kind}
                    className={`relative rounded-3xl border p-5 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md ${
                      isPrimary
                        ? "border-primary/60 bg-primary/5 ring-2 ring-primary/20"
                        : isEnabled
                        ? "border-emerald-500/40 bg-card hover:border-emerald-500/60"
                        : "border-border/80 bg-card/70 hover:border-border"
                    }`}
                  >
                    {/* Top Row: Logo, Badges, Toggle */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="size-13 rounded-2xl bg-white p-2 shadow-xs border border-border/60 flex items-center justify-center shrink-0">
                            <Image
                              src={logoPath}
                              alt={gw.displayName}
                              width={44}
                              height={44}
                              className="max-h-full max-w-full object-contain"
                              unoptimized
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-sm font-black text-foreground">
                                {gw.marketing?.brandLabel || gw.displayName}
                              </h3>
                              {isDefault && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                  الافتراضي للنظام ⭐
                                </span>
                              )}
                              {isPrimary && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-primary/15 text-primary border border-primary/30">
                                  نشطة ومعتمدة ⚡
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                              {gw.marketing?.description || gw.displayName}
                            </p>
                          </div>
                        </div>

                        {/* Enable/Disable Switch */}
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => handleToggleGateway(gw, Boolean(isEnabled))}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      {/* Region & Badges Details */}
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                        {gw.region && (
                          <span className="px-2 py-0.5 rounded-lg bg-muted text-foreground font-bold">
                            {gw.region.icon} {gw.region.nameAr}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-lg bg-muted text-muted-foreground font-mono">
                          {gw.type.toUpperCase()}
                        </span>
                        {gw.hasCredentials && (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                            مفاتيح محفوظة 🔒
                          </span>
                        )}
                      </div>

                      {/* Supported Currencies & Countries preview */}
                      <div className="pt-2 border-t border-border/50 text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>العملات المدعومة:</span>
                          <span className="font-mono text-foreground font-bold truncate max-w-[150px]">
                            {gw.supportedCurrencies.includes("*")
                              ? "جميع العملات (*)"
                              : gw.supportedCurrencies.slice(0, 5).join(", ")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="pt-4 border-t border-border/50 mt-4 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenConfigModal(gw)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/80 bg-background/80 hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer shadow-2xs"
                      >
                        <Settings size={13} className="text-primary" />
                        <span>ضبط الإعدادات</span>
                      </button>

                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetActiveGateway(gw)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-black transition-all cursor-pointer"
                        >
                          <Star size={13} />
                          <span>تعيين كرئيسية</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Bookings & Transactions History */}
      {mainTab === "bookings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <RefreshCw size={18} className="text-primary" />
              <span>سجل المدفوعات وتفاصيل الحجوزات</span>
            </h2>
            <button
              type="button"
              onClick={loadBookings}
              disabled={loadingBookings}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground transition-all cursor-pointer"
            >
              <RefreshCw size={13} className={loadingBookings ? "animate-spin" : ""} />
              <span>تحديث السجل</span>
            </button>
          </div>

          {loadingBookings ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              <Loader2 size={24} className="animate-spin text-primary" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card/40 text-muted-foreground text-xs font-bold">
              لا توجد عمليات دفع مسجلة حالياً
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
              <table className="w-full text-start text-xs">
                <thead className="bg-muted/40 text-muted-foreground border-b border-border/80">
                  <tr>
                    <th className="px-4 py-3 text-start">رقم الحجز</th>
                    <th className="px-4 py-3 text-start">الخدمة</th>
                    <th className="px-4 py-3 text-start">العميل</th>
                    <th className="px-4 py-3 text-start">المبلغ</th>
                    <th className="px-4 py-3 text-start">الحالة</th>
                    <th className="px-4 py-3 text-start">التاريخ</th>
                    <th className="px-4 py-3 text-end">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-foreground">
                        {b.bookingRef || b.id}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{b.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{b.customerName}</td>
                      <td className="px-4 py-3 font-mono font-black text-foreground">
                        {b.amount} {b.currency}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            b.status === "paid" || b.status === "confirmed"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : b.status === "cancelled" || b.status === "refunded"
                              ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">
                        {b.created ? new Date(b.created).toLocaleDateString("ar-EG") : "—"}
                      </td>
                      <td className="px-4 py-3 text-end">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleBookingAction("retrieve", b)}
                            disabled={actionBusyId === `retrieve:${b.id}`}
                            className="px-2.5 py-1 rounded-lg border border-border bg-background hover:bg-muted text-[11px] font-bold text-foreground transition-all cursor-pointer disabled:opacity-50"
                          >
                            {actionBusyId === `retrieve:${b.id}` ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              "مزامنة"
                            )}
                          </button>
                          {b.status === "paid" && (
                            <button
                              type="button"
                              onClick={() => handleBookingAction("refund", b)}
                              disabled={actionBusyId === `refund:${b.id}`}
                              className="px-2.5 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-[11px] font-bold text-rose-600 dark:text-rose-400 transition-all cursor-pointer disabled:opacity-50"
                            >
                              {actionBusyId === `refund:${b.id}` ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                "استرداد"
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Direct WhatsApp Bank Transfer */}
      {mainTab === "whatsapp" && (
        <div className="max-w-2xl space-y-6">
          <div className="p-6 rounded-3xl border border-border bg-card space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <MessageCircle size={18} className="text-emerald-500" />
                  <span>التحويل البنكي والتنسيق عبر الواتساب</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  إتاحة خيار إتمام الحجز بالتنسيق المباشر مع فريق المبيعات عبر الواتساب
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappBankEnabled}
                  onChange={(e) => setWhatsappBankEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground block">
                رقم الواتساب المخصص لاستقبال إيصالات التحويل البنكي
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="مثال: 905321796763"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-xs sm:text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="text-[11px] text-muted-foreground">
                يرجى كتابة الرقم بالصيغة الدولية متضمناً مفتاح الدولة بدون علامة +
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveWhatsapp}
                disabled={savingWhatsapp}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:brightness-110 text-white text-xs sm:text-sm font-black shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {savingWhatsapp ? <Loader2 size={15} className="animate-spin text-white" /> : <Check size={15} className="text-white" />}
                <span className="text-white">{savingWhatsapp ? "جاري الحفظ..." : "حفظ إعدادات الواتساب فورياً"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gateway Configuration & Live Test Modal */}
      {selectedGatewayForModal && (
        <GatewayConfigModal
          gateway={selectedGatewayForModal}
          tenantId={selectedTenantId}
          isOpen={Boolean(selectedGatewayForModal)}
          initialConfig={modalInitialConfig}
          onClose={() => setSelectedGatewayForModal(null)}
          onSaved={() => {
            void loadCatalog(selectedTenantId);
          }}
        />
      )}
    </div>
  );
}
