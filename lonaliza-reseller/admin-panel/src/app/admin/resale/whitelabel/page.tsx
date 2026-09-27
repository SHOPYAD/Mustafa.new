"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Plane,
  Hotel,
  Car,
  Coins,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
  Sliders,
  DollarSign,
  Lock,
  Eye,
  Info,
  Building,
  ExternalLink,
  Layers,
  Check,
  X,
  Radio,
  RefreshCw,
} from "lucide-react";
import {
  ALL_PLATFORM_FEATURES,
  FEATURE_CATEGORIES,
  type PlanType,
  type PlatformFeature,
  isFeatureActiveForPlan,
} from "@/lib/resale/features-matrix";
import { EnterprisePageHeader } from "@/components/admin/enterprise";

type SupplierItem = {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  integration: "live" | "coming_soon";
  editUrl: string;
};

const REAL_FLIGHT_SUPPLIERS: SupplierItem[] = [
  { id: "pkfare", name: "PKFARE GDS Gateway", nameAr: "بكفير (PKFARE GDS)", category: "GDS API", integration: "live", editUrl: "/admin/providers?tab=flights" },
  { id: "seeru", name: "Seeru Flights API", nameAr: "سيرو للطيران (Seeru)", category: "Direct API", integration: "live", editUrl: "/admin/providers?tab=flights" },
  { id: "travelport_flights", name: "Travelport Universal API & REST", nameAr: "ترافلبورت (Travelport)", category: "GDS API", integration: "live", editUrl: "/admin/providers?tab=flights" },
  { id: "biletbank", name: "BiletBank BBOST", nameAr: "بيلت بانك (BiletBank)", category: "GDS API", integration: "live", editUrl: "/admin/providers?tab=flights" },
  { id: "air_scraper", name: "Air Scraper (Sky Scrapper)", nameAr: "إير سكرابر", category: "Aggregator API", integration: "live", editUrl: "/admin/providers?tab=flights" },
  { id: "travelpayouts_flights", name: "Travelpayouts Flights", nameAr: "ترافل بايوتس طيران", category: "Affiliate Feed", integration: "live", editUrl: "/admin/providers?tab=flights" },
  { id: "amadeus_flights", name: "Amadeus GDS", nameAr: "أماديوس طيران", category: "GDS API", integration: "coming_soon", editUrl: "/admin/providers?tab=flights" },
];

const REAL_HOTEL_SUPPLIERS: SupplierItem[] = [
  { id: "ratehawk", name: "RateHawk / Emerging Travel", nameAr: "ريت هوك (RateHawk B2B)", category: "Global Bedbank", integration: "live", editUrl: "/admin/providers?tab=hotels" },
  { id: "hotelbeds", name: "Hotelbeds Global Bedbank", nameAr: "هوتل بيدس (Hotelbeds)", category: "Global Bedbank", integration: "live", editUrl: "/admin/providers?tab=hotels" },
  { id: "seeru_hotels", name: "Seeru Hotels API", nameAr: "سيرو فنادق (Seeru Hotels)", category: "Direct Bedbank", integration: "live", editUrl: "/admin/providers?tab=hotels" },
  { id: "booking_com15", name: "Booking.com Rapid Engine", nameAr: "بوكينج.كوم (Booking.com)", category: "Aggregator API", integration: "live", editUrl: "/admin/providers?tab=hotels" },
  { id: "travel_advisor", name: "TripAdvisor Engine", nameAr: "ترافل أدفايزر (TripAdvisor)", category: "Aggregator API", integration: "live", editUrl: "/admin/providers?tab=hotels" },
  { id: "travelport_hotels", name: "Travelport Hospitality", nameAr: "ترافلبورت فنادق", category: "GDS Bedbank", integration: "live", editUrl: "/admin/providers?tab=hotels" },
  { id: "hotel_engine", name: "Local Hotel Engine", nameAr: "محرك الفنادق الخاص", category: "Internal Engine", integration: "live", editUrl: "/admin/providers?tab=hotels" },
  { id: "hotels_internal", name: "Internal Hotel Catalog", nameAr: "الكتالوج الداخلي للفنادق", category: "Direct Inventory", integration: "live", editUrl: "/admin/hotels" },
];

const REAL_TRANSFER_SUPPLIERS: SupplierItem[] = [
  { id: "seeru_transfers", name: "Seeru Ride VIP Transfers", nameAr: "سيرو ترانسفير (Seeru Ride)", category: "VIP Fleet API", integration: "live", editUrl: "/admin/providers?tab=transfers" },
  { id: "transfers_internal", name: "Internal Transfer Fleet", nameAr: "الترانسفير الداخلي", category: "Local Fleet", integration: "live", editUrl: "/admin/transfers" },
  { id: "cars_internal", name: "Internal Car Rental Fleet", nameAr: "الأسطول الداخلي للسيارات", category: "Local Fleet", integration: "live", editUrl: "/admin/cars" },
  { id: "travelpayouts_transfers", name: "Travelpayouts Transfers", nameAr: "ترافل بايوتس ترانسفير", category: "Affiliate Feed", integration: "live", editUrl: "/admin/providers?tab=transfers" },
  { id: "travelpayouts_cars", name: "Travelpayouts Cars", nameAr: "ترافل بايوتس سيارات", category: "Affiliate Feed", integration: "live", editUrl: "/admin/providers?tab=cars" },
  { id: "cartrawler", name: "CarTrawler Global B2B", nameAr: "كار تراولر (CarTrawler)", category: "Global Car API", integration: "coming_soon", editUrl: "/admin/providers?tab=cars" },
  { id: "mozio", name: "Mozio Global Transfers", nameAr: "موزيو (Mozio)", category: "Global Transfers API", integration: "coming_soon", editUrl: "/admin/providers?tab=transfers" },
];

type WhiteLabelSettingsState = {
  flightsMarkupPercent: number;
  hotelsMarkupPercent: number;
  transfersMarkupPercent: number;
  minWalletDeposit: number;
  creditCardProcessingFeePercent: number;
  creditCardFixedFeeUsd: number;
  cardDepositHoldDays: number;
  enableLonalizaFlights: boolean;
  enableLonalizaHotels: boolean;
  enableLonalizaTransfers: boolean;
  flightsSuppliers: string[];
  hotelsSuppliers: string[];
  transfersSuppliers: string[];
  planFeaturesOverrides: Record<string, Record<string, boolean>>;
  bankTransferDetails: {
    bankName: string;
    accountHolder: string;
    iban: string;
    swift: string;
    routingNumber?: string;
    notes?: string;
  };
};

export default function WhiteLabelManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"engines" | "matrix" | "rules" | "banking">("engines");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [settings, setSettings] = useState<WhiteLabelSettingsState>({
    flightsMarkupPercent: 3.5,
    hotelsMarkupPercent: 6.0,
    transfersMarkupPercent: 10.0,
    minWalletDeposit: 500,
    creditCardProcessingFeePercent: 2.8,
    creditCardFixedFeeUsd: 0.3,
    cardDepositHoldDays: 3,
    enableLonalizaFlights: true,
    enableLonalizaHotels: true,
    enableLonalizaTransfers: true,
    flightsSuppliers: ["pkfare", "seeru", "travelport_flights", "biletbank"],
    hotelsSuppliers: ["ratehawk", "hotelbeds", "seeru_hotels", "booking_com15"],
    transfersSuppliers: ["seeru_transfers", "transfers_internal", "cars_internal"],
    planFeaturesOverrides: {},
    bankTransferDetails: {
      bankName: "Kuveyt Turk Participation Bank",
      accountHolder: "LONALIZA TURIZM TICARET LTD",
      iban: "TR54 0020 5000 0123 4567 8901 01",
      swift: "KTESTRIS",
      notes: "يرجى ذكر رقم الشركة وعنوان النطاق في خانة الملاحظات",
    },
  });

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch("/api/admin/resale/whitelabel");
        if (res.ok) {
          const json = await res.json();
          if (json?.data) {
            setSettings((prev) => ({
              ...prev,
              flightsMarkupPercent: json.data.flightsMarkup ?? prev.flightsMarkupPercent,
              hotelsMarkupPercent: json.data.hotelsMarkup ?? prev.hotelsMarkupPercent,
              transfersMarkupPercent: json.data.transfersMarkup ?? prev.transfersMarkupPercent,
              minWalletDeposit: json.data.minDepositUsd ?? prev.minWalletDeposit,
              creditCardProcessingFeePercent: json.data.cardFeePercent ?? prev.creditCardProcessingFeePercent,
              cardDepositHoldDays: json.data.cardHoldDays ?? prev.cardDepositHoldDays,
              bankTransferDetails: {
                bankName: json.data.bankName ?? prev.bankTransferDetails.bankName,
                accountHolder: json.data.bankBeneficiary ?? prev.bankTransferDetails.accountHolder,
                iban: json.data.bankIban ?? prev.bankTransferDetails.iban,
                swift: json.data.bankSwift ?? prev.bankTransferDetails.swift,
                notes: json.data.bankInstructions ?? prev.bankTransferDetails.notes,
              },
              planFeaturesOverrides: json.data.planFeaturesOverrides ?? {},
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load WL settings", err);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const payload = {
        flightsMarkup: settings.flightsMarkupPercent,
        hotelsMarkup: settings.hotelsMarkupPercent,
        transfersMarkup: settings.transfersMarkupPercent,
        minDepositUsd: settings.minWalletDeposit,
        cardFeePercent: settings.creditCardProcessingFeePercent,
        cardHoldDays: settings.cardDepositHoldDays,
        bankName: settings.bankTransferDetails.bankName,
        bankBeneficiary: settings.bankTransferDetails.accountHolder,
        bankIban: settings.bankTransferDetails.iban,
        bankSwift: settings.bankTransferDetails.swift,
        bankInstructions: settings.bankTransferDetails.notes,
        planFeaturesOverrides: settings.planFeaturesOverrides,
      };

      const res = await fetch("/api/admin/resale/whitelabel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "فشل حفظ الإعدادات");
      }
      setSuccessMsg("تم حفظ وتطبيق كافة إعدادات التوزيع ومصفوفة الميزات بنجاح!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  }

  function toggleSupplier(type: "flights" | "hotels" | "transfers", supplierId: string) {
    setSettings((prev) => {
      const key = `${type}Suppliers` as "flightsSuppliers" | "hotelsSuppliers" | "transfersSuppliers";
      const current = prev[key] || [];
      const updated = current.includes(supplierId)
        ? current.filter((s) => s !== supplierId)
        : [...current, supplierId];
      return { ...prev, [key]: updated };
    });
  }

  function togglePlanFeature(plan: PlanType, featureId: string) {
    setSettings((prev) => {
      const currentEnabled = isFeatureActiveForPlan(featureId, plan, prev.planFeaturesOverrides);
      const nextValue = !currentEnabled;

      const planOverrides = { ...(prev.planFeaturesOverrides[plan] || {}) };
      planOverrides[featureId] = nextValue;

      return {
        ...prev,
        planFeaturesOverrides: {
          ...prev.planFeaturesOverrides,
          [plan]: planOverrides,
        },
      };
    });
  }

  if (loading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center space-y-4 text-muted-foreground">
        <Loader2 className="size-9 animate-spin text-primary" />
        <p className="text-xs font-bold">جاري تحميل إعدادات موديولات لوناليزا ومصفوفة الميزات...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      <EnterprisePageHeader
        icon={Sparkles}
        title="إدارة التوزيع المركزي ومصفوفة باقات الشركاء"
        description="التحكم في الموزعين الحقيقيين المتصلين، وهوامش الربح المركزية، ومصفوفة إتاحة الـ 52 ميزة لكل باقة."
        breadcrumbs={[
          { label: "لوحة التحكم", href: "/admin" },
          { label: "الموزعين", href: "/admin/resale" },
          { label: "الوايت ليبل والتوزيع" },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/admin/providers"
              className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-4 py-2.5 text-xs font-bold text-foreground backdrop-blur-md transition-all hover:bg-card hover:border-primary/40 active:scale-95"
            >
              <span>كتالوج مفاتيح الموزعين</span>
              <ExternalLink className="size-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              <span>{saving ? "جاري الحفظ..." : "حفظ التغييرات والمصفوفة"}</span>
            </button>
          </div>
        }
      />

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2.5 backdrop-blur-xl animate-in fade-in">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2.5 backdrop-blur-xl animate-in fade-in">
          <AlertCircle className="size-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Enterprise Policy Banner */}
      <div className="p-6 rounded-3xl border border-primary/30 bg-gradient-to-r from-card via-card/80 to-primary/10 text-foreground shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-amber-400 font-black text-xs">
            <Sparkles className="size-4" />
            <span>إدارة التوزيع المركزي لموديولات لوناليزا (Central B2B Distribution Hub)</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
            تجميع وإعادة توجيه نتائج محركات الطيران والفنادق والمواصلات المربوطة فعلياً في المنصة لكافة شركاء العلامة البيضاء والتملك الدائم، مع دمج هوامش ربح المنصة تلقائياً وتفعيل أو حجب أي موزع وميزة لكل باقة.
          </p>
        </div>
        <div className="px-3.5 py-2 rounded-xl bg-background/60 border border-border text-xs font-mono text-amber-400 font-bold shrink-0">
          Node: 5.189.147.52
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-border/50 overflow-x-auto gap-2 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("engines")}
          className={`pb-3 px-4 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "engines"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sliders className="size-4" />
          <span>موديولات التوزيع والموزعون الفعليون</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("matrix")}
          className={`pb-3 px-4 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "matrix"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="size-4" />
          <span>مصفوفة ميزات الباقات (+50 ميزة)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rules")}
          className={`pb-3 px-4 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "rules"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Coins className="size-4" />
          <span>شروط المحفظة والديبوزيت B2B</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("banking")}
          className={`pb-3 px-4 text-xs sm:text-sm font-black border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "banking"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building className="size-4" />
          <span>الحسابات البنكية لاستقبال الديبوزيت</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Tab 1: Central Engines & Real Suppliers */}
        {activeTab === "engines" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Flights Engine Card */}
            <div className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl p-6 shadow-lg space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-2xl bg-primary/15 flex items-center justify-center text-primary">
                    <Plane className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground">طيران لوناليزا</h3>
                    <p className="text-[11px] text-muted-foreground font-mono">Lonaliza Flights Distribution</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableLonalizaFlights}
                    onChange={(e) => setSettings({ ...settings, enableLonalizaFlights: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="space-y-2 pt-3 border-t border-border/40">
                <label className="text-xs font-bold text-foreground block">
                  هامش ربح المنصة المركزي المضاف على الطيران (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={settings.flightsMarkupPercent}
                    onChange={(e) => setSettings({ ...settings, flightsMarkupPercent: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border/70 bg-background text-sm font-bold font-mono text-foreground focus:outline-none focus:border-primary"
                  />
                  <span className="absolute end-4 top-3 text-xs font-bold text-muted-foreground">%</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  يضاف على سعر المورد الفعلي قبل إرسال نتائج البحث إلى مواقع الشركاء.
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">
                    موزعو الطيران الفعليون في المنظومة
                  </label>
                  <Link href="/admin/providers?tab=flights" className="text-[11px] text-primary hover:underline flex items-center gap-1 font-bold">
                    <span>إدخال المفاتيح</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {REAL_FLIGHT_SUPPLIERS.map((sup) => {
                    const active = settings.flightsSuppliers.includes(sup.id);
                    return (
                      <div
                        key={sup.id}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                          active
                            ? "bg-primary/10 border-primary/30 text-foreground font-bold"
                            : "bg-card/40 border-border/40 text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleSupplier("flights", sup.id)}
                            className="text-start cursor-pointer hover:underline"
                          >
                            <span className="font-bold text-foreground">{sup.nameAr}</span>
                            <span className="text-[10px] text-muted-foreground block font-mono">{sup.name}</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                            sup.integration === "live" ? "bg-emerald-500/20 text-emerald-400" : "bg-secondary text-muted-foreground"
                          }`}>
                            {sup.integration === "live" ? "Live" : "Coming"}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleSupplier("flights", sup.id)}
                            className="cursor-pointer"
                          >
                            {active ? <CheckCircle2 className="size-4 text-primary" /> : <div className="size-4 rounded-full border border-border" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Hotels Engine Card */}
            <div className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl p-6 shadow-lg space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                    <Hotel className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground">فنادق لوناليزا</h3>
                    <p className="text-[11px] text-muted-foreground font-mono">Lonaliza Hotels Distribution</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableLonalizaHotels}
                    onChange={(e) => setSettings({ ...settings, enableLonalizaHotels: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>

              <div className="space-y-2 pt-3 border-t border-border/40">
                <label className="text-xs font-bold text-foreground block">
                  هامش ربح المنصة المركزي المضاف على الفنادق (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={settings.hotelsMarkupPercent}
                    onChange={(e) => setSettings({ ...settings, hotelsMarkupPercent: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border/70 bg-background text-sm font-bold font-mono text-foreground focus:outline-none focus:border-indigo-500"
                  />
                  <span className="absolute end-4 top-3 text-xs font-bold text-muted-foreground">%</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  هامش موحد يغذي فنادق الشركاء مع حجز الغرف وإصدار الـ Vouchers.
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">
                    موزعو وبنوك الفنادق الفعلية في المنظومة
                  </label>
                  <Link href="/admin/providers?tab=hotels" className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 font-bold">
                    <span>إدخال المفاتيح</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {REAL_HOTEL_SUPPLIERS.map((sup) => {
                    const active = settings.hotelsSuppliers.includes(sup.id);
                    return (
                      <div
                        key={sup.id}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                          active
                            ? "bg-indigo-500/10 border-indigo-500/30 text-foreground font-bold"
                            : "bg-card/40 border-border/40 text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleSupplier("hotels", sup.id)}
                            className="text-start cursor-pointer hover:underline"
                          >
                            <span className="font-bold text-foreground">{sup.nameAr}</span>
                            <span className="text-[10px] text-muted-foreground block font-mono">{sup.name}</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                            sup.integration === "live" ? "bg-emerald-500/20 text-emerald-400" : "bg-secondary text-muted-foreground"
                          }`}>
                            {sup.integration === "live" ? "Live" : "Coming"}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleSupplier("hotels", sup.id)}
                            className="cursor-pointer"
                          >
                            {active ? <CheckCircle2 className="size-4 text-indigo-400" /> : <div className="size-4 rounded-full border border-border" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Transfers & Cars Engine Card */}
            <div className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl p-6 shadow-lg space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                    <Car className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-foreground">مواصلات وسيارات لوناليزا</h3>
                    <p className="text-[11px] text-muted-foreground font-mono">Lonaliza Transfers & Fleet</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableLonalizaTransfers}
                    onChange={(e) => setSettings({ ...settings, enableLonalizaTransfers: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="space-y-2 pt-3 border-t border-border/40">
                <label className="text-xs font-bold text-foreground block">
                  هامش ربح المنصة المركزي المضاف على المواصلات (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={settings.transfersMarkupPercent}
                    onChange={(e) => setSettings({ ...settings, transfersMarkupPercent: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border/70 bg-background text-sm font-bold font-mono text-foreground focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute end-4 top-3 text-xs font-bold text-muted-foreground">%</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  هامش ربح خدمات التوصيل الخاص والمطارات الموزعة لشركائنا.
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">
                    موزعو النقل والترانسفير الفعليون
                  </label>
                  <Link href="/admin/providers?tab=transfers" className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-bold">
                    <span>إدخال المفاتيح</span>
                    <ExternalLink className="size-3" />
                  </Link>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {REAL_TRANSFER_SUPPLIERS.map((sup) => {
                    const active = settings.transfersSuppliers.includes(sup.id);
                    return (
                      <div
                        key={sup.id}
                        className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                          active
                            ? "bg-emerald-500/10 border-emerald-500/30 text-foreground font-bold"
                            : "bg-card/40 border-border/40 text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleSupplier("transfers", sup.id)}
                            className="text-start cursor-pointer hover:underline"
                          >
                            <span className="font-bold text-foreground">{sup.nameAr}</span>
                            <span className="text-[10px] text-muted-foreground block font-mono">{sup.name}</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                            sup.integration === "live" ? "bg-emerald-500/20 text-emerald-400" : "bg-secondary text-muted-foreground"
                          }`}>
                            {sup.integration === "live" ? "Live" : "Coming"}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleSupplier("transfers", sup.id)}
                            className="cursor-pointer"
                          >
                            {active ? <CheckCircle2 className="size-4 text-emerald-400" /> : <div className="size-4 rounded-full border border-border" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 52-Platform-Features Governance Matrix */}
        {activeTab === "matrix" && (
          <div className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl p-6 sm:p-8 shadow-lg space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
              <div>
                <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
                  <Layers className="size-5 text-primary" />
                  <span>مصفوفة التحكم المركزي بميزات الباقات (+50 ميزة)</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  حدد الميزات المتاحة أو المقفلة لكل باقة. إلغاء التحديد يقفل الميزة فورياً في لوحة تحكم وموقع الشريك.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl">
                <span>إجمالي ميزات المنظومة: {ALL_PLATFORM_FEATURES.length} ميزة</span>
              </div>
            </div>

            {/* Categorized Features Groups */}
            <div className="space-y-8">
              {FEATURE_CATEGORIES.map((cat) => {
                const catFeatures = ALL_PLATFORM_FEATURES.filter((f) => f.categoryId === cat.id);
                return (
                  <div key={cat.id} className="rounded-2xl border border-border/50 bg-background/40 overflow-hidden">
                    <div className="bg-card/90 px-4 py-3 flex items-center justify-between border-b border-border/50">
                      <h3 className="text-xs sm:text-sm font-black text-foreground flex items-center gap-2">
                        <span className="size-2 rounded-full bg-primary inline-block" />
                        <span>{cat.nameAr}</span>
                      </h3>
                      <span className="text-[11px] font-mono text-muted-foreground">{catFeatures.length} ميزات</span>
                    </div>

                    <div className="divide-y divide-border/30">
                      {catFeatures.map((feat) => {
                        const freeActive = isFeatureActiveForPlan(feat.id, "whitelabel_free", settings.planFeaturesOverrides);
                        const paidActive = isFeatureActiveForPlan(feat.id, "whitelabel_paid", settings.planFeaturesOverrides);
                        const ownerActive = isFeatureActiveForPlan(feat.id, "ownership", settings.planFeaturesOverrides);

                        return (
                          <div key={feat.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-card/40 transition-colors">
                            <div className="space-y-0.5 max-w-xl">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-foreground">{feat.nameAr}</span>
                                <span className="text-[10px] font-mono text-muted-foreground">({feat.id})</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed">{feat.descAr}</p>
                            </div>

                            {/* Plan Toggles */}
                            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                              {/* Free WL Toggle */}
                              <button
                                type="button"
                                onClick={() => togglePlanFeature("whitelabel_free", feat.id)}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                                  freeActive
                                    ? "bg-amber-500/15 border-amber-500/40 text-amber-400 font-black"
                                    : "bg-card/60 border-border/40 text-muted-foreground opacity-60"
                                }`}
                              >
                                {freeActive ? <Check className="size-3.5 text-amber-400" /> : <X className="size-3.5" />}
                                <span>وايت ليبل مجاني</span>
                              </button>

                              {/* Paid WL Toggle */}
                              <button
                                type="button"
                                onClick={() => togglePlanFeature("whitelabel_paid", feat.id)}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                                  paidActive
                                    ? "bg-primary/20 border-primary/40 text-primary font-black"
                                    : "bg-card/60 border-border/40 text-muted-foreground opacity-60"
                                }`}
                              >
                                {paidActive ? <Check className="size-3.5 text-primary" /> : <X className="size-3.5" />}
                                <span>وايت ليبل محترف</span>
                              </button>

                              {/* Ownership Toggle */}
                              <button
                                type="button"
                                onClick={() => togglePlanFeature("ownership", feat.id)}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                                  ownerActive
                                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-black"
                                    : "bg-card/60 border-border/40 text-muted-foreground opacity-60"
                                }`}
                              >
                                {ownerActive ? <Check className="size-3.5 text-emerald-400" /> : <X className="size-3.5" />}
                                <span>التملك الدائم</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: B2B Wallet Rules */}
        {activeTab === "rules" && (
          <div className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl p-6 sm:p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
              <div className="size-11 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-500">
                <Coins className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-foreground">
                  قواعد الإيداع ومحفظة الشركاء (B2B Wallet Rules)
                </h2>
                <p className="text-xs text-muted-foreground">
                  تحديد الحدود الدنيا لشحن الرصيد ورسوم بطاقات الائتمان ومدد تعليق الرصيد.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">
                  الحد الأدنى لديبوزيت تفعيل الحجوزات ($)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={settings.minWalletDeposit}
                    onChange={(e) => setSettings({ ...settings, minWalletDeposit: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border/70 bg-background text-sm font-bold font-mono text-foreground focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute end-4 top-3 text-xs font-bold text-muted-foreground">$</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  يتوقف إصدار التذاكر آلياً إذا انخفض الرصيد المتاح عن هذا الحد.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">
                  رسوم معالجة بطاقات الائتمان (Iyzico / Stripe %)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={settings.creditCardProcessingFeePercent}
                    onChange={(e) => setSettings({ ...settings, creditCardProcessingFeePercent: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border/70 bg-background text-sm font-bold font-mono text-foreground focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute end-4 top-3 text-xs font-bold text-muted-foreground">%</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  تخصم أو تضاف على الشريك عند شحن المحفظة بالبطاقة البنكية.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">
                  مدة تعليق إيداعات البطاقات (أيام Hold)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={settings.cardDepositHoldDays}
                    onChange={(e) => setSettings({ ...settings, cardDepositHoldDays: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-border/70 bg-background text-sm font-bold font-mono text-foreground focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute end-4 top-3 text-xs font-bold text-muted-foreground">يوم</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  فترة حماية ضد النزاعات والـ Chargebacks قبل تحويل الرصيد لمتاح.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Banking Instructions */}
        {activeTab === "banking" && (
          <div className="rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl p-6 sm:p-8 shadow-lg space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
              <div className="size-11 rounded-2xl bg-cyan-500/15 flex items-center justify-center text-cyan-400">
                <Building className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-foreground">
                  الحساب البنكي لاستقبال حوالات الديبوزيت (Bank Wire Instructions)
                </h2>
                <p className="text-xs text-muted-foreground">
                  البيانات الرسمية التي تظهر للشركاء عند اختيار التحويل البنكي المباشر بدون رسوم بطاقات.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">اسم البنك والفرع</label>
                <input
                  type="text"
                  value={settings.bankTransferDetails.bankName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankTransferDetails: { ...settings.bankTransferDetails, bankName: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-border/70 bg-background text-sm font-bold text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">اسم المستفيد / صاحب الحساب الرسمي</label>
                <input
                  type="text"
                  value={settings.bankTransferDetails.accountHolder}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankTransferDetails: { ...settings.bankTransferDetails, accountHolder: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-border/70 bg-background text-sm font-bold text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">رقم الآيبان الدولي (IBAN)</label>
                <input
                  type="text"
                  value={settings.bankTransferDetails.iban}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankTransferDetails: { ...settings.bankTransferDetails, iban: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-border/70 bg-background text-sm font-mono font-bold text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">رمز السويفت (SWIFT / BIC)</label>
                <input
                  type="text"
                  value={settings.bankTransferDetails.swift}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankTransferDetails: { ...settings.bankTransferDetails, swift: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-border/70 bg-background text-sm font-mono font-bold text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-bold text-foreground block">تعليمات إشعار التحويل البنكي للشريك</label>
                <textarea
                  rows={2}
                  value={settings.bankTransferDetails.notes}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      bankTransferDetails: { ...settings.bankTransferDetails, notes: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-border/70 bg-background text-xs text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between p-5 rounded-2xl bg-card/80 border border-border/60 backdrop-blur-xl">
          <div className="text-xs text-muted-foreground font-medium">
            تأكد من مراجعة نسب الهوامش ومصفوفة الميزات قبل الحفظ. التغييرات تنعكس فورياً على شبكة الشركاء.
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 text-xs sm:text-sm font-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span>{saving ? "جاري الحفظ..." : "حفظ وتطبيق الإعدادات والمصفوفة"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
