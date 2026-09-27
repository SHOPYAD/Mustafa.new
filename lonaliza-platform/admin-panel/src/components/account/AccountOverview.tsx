"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Plane,
  Building2,
  Car,
  Bus,
  Wallet,
  Receipt,
  Award,
  Sparkles,
  TrendingUp,
  Share2,
  Copy,
  Check,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  PlusCircle,
  Video,
  Heart,
  ShieldCheck,
  CreditCard,
  Download,
  FileText,
  FileCheck,
  Users,
  Percent,
  Compass,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useCurrency } from "@/components/ui/CurrencySelector";
import type { AccountTab } from "./AccountShell";

interface AccountOverviewProps {
  onTabChange: (tab: AccountTab) => void;
  userName: string;
  userEmail: string;
  avatarUrl?: string;
  tierBadge?: string;
  walletBalance?: number;
  loyaltyPoints?: number;
  activeBookingsCount?: number;
}

export default function AccountOverview({
  onTabChange,
  userName,
  userEmail,
  avatarUrl,
  tierBadge = "🥉",
  walletBalance = 0,
  loyaltyPoints = 0,
  activeBookingsCount = 0,
}: AccountOverviewProps) {
  const { t: dict, locale, dir } = useLocale();
  const { currency, convert } = useCurrency();
  const isAr = locale === "ar";
  const isTr = locale === "tr";
  const isFr = locale === "fr";

  const [copiedLink, setCopiedLink] = useState(false);
  const [paymentsData, setPaymentsData] = useState<{
    totalPaid: number;
    completedCount: number;
    discountsTotal: number;
    recentPayments: any[];
  }>({
    totalPaid: 0,
    completedCount: 0,
    discountsTotal: 0,
    recentPayments: [],
  });

  const [affiliateData, setAffiliateData] = useState<{
    code: string;
    visitsCount: number;
    pendingCommission: number;
    withdrawn: number;
  }>({
    code: "",
    visitsCount: 0,
    pendingCommission: 0,
    withdrawn: 0,
  });

  const [latestBooking, setLatestBooking] = useState<any | null>(null);

  // Translations from central dictionary
  const t = {
    heroGreeting:
      dict.account.hello
        ? `${dict.account.hello}, ${userName || (isAr ? "عزيزي المسافر" : isTr ? "Değerli Gezgin" : isFr ? "Cher Voyageur" : "Traveler")}`
        : `Welcome back, ${userName || "Traveler"}`,
    heroSub:
      isAr
        ? "إليك ملخص شامل وفوري لجميع حجوزاتك، رصيد محفظتك، نقاط ولائك، وأرباح التسويق عبر منصة لوناليزا."
        : isTr
          ? "Lonaliza platformundaki rezervasyonlarınız, cüzdan bakiyeniz, sadakat puanlarınız ve ortaklık kazançlarınızın anlık özeti."
          : isFr
            ? "Voici le récapitulatif en temps réel de vos réservations, portefeuille, points de fidélité et gains d'affiliation."
            : "Here is your real-time summary of bookings, wallet balance, loyalty points, and affiliate earnings.",
    badgeMember: dict.account.verifiedMember,
    tierDiscountNote: dict.account.tierDiscountApplied,

    // Stat Cards
    kpiBookings: dict.account.tabBookings,
    kpiBookingsSub: dict.account.kpiBookingsSub,
    
    kpiPayments: dict.account.kpiPayments,
    kpiPaymentsSub: dict.account.kpiPaymentsSub,

    kpiWallet: dict.account.walletBalance,
    kpiWalletSub: dict.account.kpiWalletSub,

    kpiLoyalty: dict.account.kpiLoyaltyPoints,
    kpiLoyaltySub: dict.account.kpiLoyaltySub,

    kpiAffiliate: dict.account.kpiAffiliate,
    kpiAffiliateSub: dict.account.kpiAffiliateSub,

    kpiSocial: dict.account.kpiSocial,
    kpiSocialSub: dict.account.kpiSocialSub,

    // Quick Actions
    quickActionsTitle: dict.account.quickActionsTitle,
    bookFlight: dict.account.quickBookFlight,
    bookHotel: dict.account.quickBookHotel,
    bookTransfer: dict.account.quickBookTransfer,
    viewInvoices: dict.account.quickViewInvoices,
    payoutAction: dict.account.quickWithdraw,
    shareReferral: dict.account.quickShareLink,

    // Spotlight Booking
    activeTripTitle: dict.account.latestTripTitle,
    noActiveTrip: dict.account.noActiveTrips,
    manageBookingBtn: dict.account.manageBooking,
    downloadInvoiceBtn: dict.account.officialInvoice,

    // Recent Payments
    recentPaymentsTitle: dict.account.recentPaymentsTitle,
    viewAllPayments: dict.account.viewAllPayments,
    thInvoice: dict.account.thInvoice,
    thService: dict.account.thService,
    thDate: dict.account.thDate,
    thAmount: dict.account.thAmount,
    thStatus: dict.account.thStatus,
    statusPaid: dict.account.statusPaid,

    // Referral Banner
    affiliateTitle: dict.account.affiliateProgramTitle,
    affiliateDesc: dict.account.affiliateProgramDesc,
    copyLinkBtn: dict.account.copyLink,
    copiedText: dict.account.linkCopied,
  };

  useEffect(() => {
    let active = true;

    // Fetch payments & invoices summary
    fetch("/api/account/payments", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.ok && data.stats) {
          setPaymentsData({
            totalPaid: Number(data.stats.totalPaid) || 0,
            completedCount: Number(data.stats.completedCount) || 0,
            discountsTotal: Number(data.stats.discountsTotal) || 0,
            recentPayments: (data.payments || []).slice(0, 4),
          });
        }
      })
      .catch(() => {});

    // Fetch affiliate summary
    fetch("/api/account/affiliate", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.ok && data.wallet) {
          setAffiliateData({
            code: data.profile?.code || "",
            visitsCount: Number(data.wallet.visits_count) || 0,
            pendingCommission: Number(data.wallet.pending_usd) || 0,
            withdrawn: Number(data.wallet.withdrawn_usd) || 0,
          });
        }
      })
      .catch(() => {});

    // Fetch bookings to get latest active
    fetch("/api/account/bookings", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data.bookings) ? data.bookings : [];
        const activeItem = list.find((b: any) => b.status === "paid" || b.status === "confirmed") || list[0] || null;
        setLatestBooking(activeItem);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const formatPrice = (amount: number) => {
    const n = convert(amount, "USD");
    return `${currency.symbol}${n.toLocaleString(isAr ? "ar-AE" : isTr ? "tr-TR" : "en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const referralUrl = typeof window !== "undefined" && affiliateData.code
    ? `${window.location.origin}/?ref=${affiliateData.code}`
    : "https://lonaliza.com/?ref=vip";

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(referralUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  // Determine loyalty tier details
  const tierInfo = useMemo(() => {
    const p = Math.max(0, loyaltyPoints);
    if (p >= 10000) {
      return {
        name: isAr ? "VIP Diamond Elite" : isTr ? "VIP Diamond Elite" : "VIP Diamond Elite",
        badge: "👑",
        multiplier: "3.0x",
        hotelDiscount: 15,
        progress: 100,
        nextTierPoints: 10000,
      };
    }
    if (p >= 5000) {
      return {
        name: isAr ? "بلاتيني متميز" : isTr ? "Platin Gezgin" : isFr ? "Platine VIP" : "Platinum Ambassador",
        badge: "💎",
        multiplier: "2.0x",
        hotelDiscount: 10,
        progress: Math.min(100, Math.round(((p - 5000) / 5000) * 100)),
        nextTierPoints: 10000,
      };
    }
    if (p >= 2000) {
      return {
        name: isAr ? "المسافر الذهبي" : isTr ? "Altın Gezgin" : isFr ? "Voyageur Or" : "Gold Traveler",
        badge: "🥇",
        multiplier: "1.5x",
        hotelDiscount: 7,
        progress: Math.min(100, Math.round(((p - 2000) / 3000) * 100)),
        nextTierPoints: 5000,
      };
    }
    if (p >= 500) {
      return {
        name: isAr ? "الرحالة الفضي" : isTr ? "Gümüş Gezgin" : isFr ? "Voyageur Argent" : "Silver Explorer",
        badge: "🥈",
        multiplier: "1.25x",
        hotelDiscount: 4,
        progress: Math.min(100, Math.round(((p - 500) / 1500) * 100)),
        nextTierPoints: 2000,
      };
    }
    return {
      name: isAr ? "المستكشف البرونزي" : isTr ? "Bronz Gezgin" : isFr ? "Explorateur Bronze" : "Bronze Explorer",
      badge: "🥉",
      multiplier: "1.0x",
      hotelDiscount: 2,
      progress: Math.min(100, Math.round((p / 500) * 100)),
      nextTierPoints: 500,
    };
  }, [loyaltyPoints, isAr, isTr, isFr]);

  return (
    <div className="space-y-6" dir={dir}>
      {/* 1. Welcoming Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-[#1b0833] via-[#2a0e4f] to-[#120424] p-6 sm:p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-purple-700/30 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/15 px-3 py-1 text-xs font-bold text-amber-300 backdrop-blur-md mb-3">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>{t.badgeMember}</span>
              <span>·</span>
              <span>{tierInfo.name} {tierInfo.badge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t.heroGreeting}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-purple-200/80 leading-relaxed">
              {t.heroSub}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-purple-500/30 bg-[#120422]/90 px-4 py-2.5 shadow-inner backdrop-blur-md text-center">
              <p className="text-[10px] font-bold text-amber-300 uppercase">{tierInfo.name}</p>
              <p className="text-sm font-black text-white mt-0.5">{tierInfo.multiplier} Points</p>
              <p className="text-[9px] text-amber-300/80 mt-0.5">+{tierInfo.hotelDiscount}% Hotel Perk</p>
            </div>

            <button
              type="button"
              onClick={() => onTabChange("bookings")}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:brightness-110 px-4 py-2.5 text-xs font-black text-[#18082e] shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
            >
              <Plane size={15} />
              <span>{t.manageBookingBtn}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 6 Primary KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {/* Bookings */}
        <div
          onClick={() => onTabChange("bookings")}
          className="group cursor-pointer rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:border-purple-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 text-purple-900 group-hover:scale-105 transition-transform">
              <Plane size={20} />
            </span>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-purple-600 transition-colors" />
          </div>
          <p className="text-[11px] font-bold text-slate-500">{t.kpiBookings}</p>
          <p className="mt-1 text-2xl font-black text-slate-900 font-mono">{activeBookingsCount}</p>
          <p className="mt-1 text-[10px] text-slate-400 truncate">{t.kpiBookingsSub}</p>
        </div>

        {/* Payments */}
        <div
          onClick={() => onTabChange("payments")}
          className="group cursor-pointer rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:border-purple-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-900 group-hover:scale-105 transition-transform">
              <Receipt size={20} />
            </span>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
          </div>
          <p className="text-[11px] font-bold text-slate-500">{t.kpiPayments}</p>
          <p className="mt-1 text-2xl font-black text-slate-900 font-mono">
            {formatPrice(paymentsData.totalPaid)}
          </p>
          <p className="mt-1 text-[10px] text-slate-400 truncate">
            {paymentsData.completedCount} {t.kpiPaymentsSub}
          </p>
        </div>

        {/* Wallet */}
        <div
          onClick={() => onTabChange("wallet")}
          className="group cursor-pointer rounded-3xl border border-amber-300 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/20 p-4 sm:p-5 shadow-sm hover:border-amber-400 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-900 group-hover:scale-105 transition-transform">
              <Wallet size={20} />
            </span>
            <ChevronRight size={16} className="text-amber-400 group-hover:text-amber-600 transition-colors" />
          </div>
          <p className="text-[11px] font-bold text-amber-800">{t.kpiWallet}</p>
          <p className="mt-1 text-2xl font-black text-amber-600 font-mono">
            ${Math.round(walletBalance * 100) / 100}
          </p>
          <p className="mt-1 text-[10px] text-amber-700/80 truncate">{t.kpiWalletSub}</p>
        </div>

        {/* Loyalty Tier */}
        <div
          onClick={() => onTabChange("tiers")}
          className="group cursor-pointer rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:border-purple-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-900 text-lg group-hover:scale-105 transition-transform">
              {tierInfo.badge}
            </span>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
          </div>
          <p className="text-[11px] font-bold text-slate-500">{t.kpiLoyalty}</p>
          <p className="mt-1 text-2xl font-black text-slate-900 font-mono">
            {loyaltyPoints.toLocaleString()}
          </p>
          <p className="mt-1 text-[10px] text-indigo-600 font-semibold truncate">{tierInfo.name}</p>
        </div>

        {/* Affiliate */}
        <div
          onClick={() => onTabChange("affiliate")}
          className="group cursor-pointer rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:border-purple-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-900 group-hover:scale-105 transition-transform">
              <TrendingUp size={20} />
            </span>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-sky-600 transition-colors" />
          </div>
          <p className="text-[11px] font-bold text-slate-500">{t.kpiAffiliate}</p>
          <p className="mt-1 text-2xl font-black text-slate-900 font-mono">
            ${affiliateData.pendingCommission + affiliateData.withdrawn}
          </p>
          <p className="mt-1 text-[10px] text-slate-400 truncate">
            {affiliateData.visitsCount} {isAr ? "زيارة مسجلة" : "visits"}
          </p>
        </div>

        {/* Social Community */}
        <div
          onClick={() => onTabChange("social")}
          className="group cursor-pointer rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:border-purple-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-900 group-hover:scale-105 transition-transform">
              <Compass size={20} />
            </span>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-rose-600 transition-colors" />
          </div>
          <p className="text-[11px] font-bold text-slate-500">{t.kpiSocial}</p>
          <p className="mt-1 text-2xl font-black text-rose-600 font-mono">Level 1</p>
          <p className="mt-1 text-[10px] text-slate-400 truncate">{t.kpiSocialSub}</p>
        </div>
      </div>

      {/* 3. Quick Action Shortcuts Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-xs font-black uppercase text-slate-400 mb-3 tracking-wider">
          {t.quickActionsTitle}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <Link
            href="/flights"
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 hover:bg-purple-50 hover:border-purple-300 p-3 text-xs font-bold text-slate-700 hover:text-purple-950 transition-all shadow-2xs"
          >
            <Plane size={16} className="text-purple-700" />
            <span>{t.bookFlight}</span>
          </Link>

          <Link
            href="/hotels"
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 hover:bg-blue-50 hover:border-blue-300 p-3 text-xs font-bold text-slate-700 hover:text-blue-950 transition-all shadow-2xs"
          >
            <Building2 size={16} className="text-blue-600" />
            <span>{t.bookHotel}</span>
          </Link>

          <Link
            href="/transfers"
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 hover:bg-emerald-50 hover:border-emerald-300 p-3 text-xs font-bold text-slate-700 hover:text-emerald-950 transition-all shadow-2xs"
          >
            <Bus size={16} className="text-emerald-600" />
            <span>{t.bookTransfer}</span>
          </Link>

          <button
            type="button"
            onClick={() => onTabChange("payments")}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 p-3 text-xs font-bold text-slate-700 transition-all shadow-2xs cursor-pointer text-start"
          >
            <Receipt size={16} className="text-slate-600" />
            <span>{t.viewInvoices}</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("wallet")}
            className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/80 p-3 text-xs font-bold text-amber-950 transition-all shadow-2xs cursor-pointer text-start"
          >
            <ArrowDownLeft size={16} className="text-amber-600" />
            <span>{t.payoutAction}</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("affiliate")}
            className="flex items-center gap-2 rounded-2xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/80 p-3 text-xs font-bold text-purple-950 transition-all shadow-2xs cursor-pointer text-start"
          >
            <Share2 size={16} className="text-purple-700" />
            <span>{t.shareReferral}</span>
          </button>
        </div>
      </div>

      {/* 4. Active Booking Spotlight & Loyalty Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spotlight Active Booking Card (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-purple-100 text-purple-900">
                  <FileCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{t.activeTripTitle}</h3>
                  <p className="text-[11px] text-slate-400">
                    {latestBooking ? `PNR: ${latestBooking.pnr || latestBooking.id}` : t.kpiBookingsSub}
                  </p>
                </div>
              </div>

              {latestBooking && (
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{t.statusPaid}</span>
                </span>
              )}
            </div>

            {latestBooking ? (
              <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/40 via-white to-purple-50/20 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded-md">
                      {latestBooking.type === "flight"
                        ? (isAr ? "رحلة طيران مجدولة" : "Flight")
                        : (isAr ? "حجز فندق شريك" : "Hotel")}
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                      {latestBooking.details?.airline || latestBooking.details?.hotelName || latestBooking.type?.toUpperCase()}
                    </h4>
                    <p className="text-xs text-slate-600 font-semibold mt-0.5">
                      {latestBooking.details?.from && latestBooking.details?.to
                        ? `${latestBooking.details.from} ➔ ${latestBooking.details.to}`
                        : latestBooking.details?.roomType || latestBooking.title || "Lonaliza Travel Service"}
                    </p>
                  </div>

                  <div className="text-start sm:text-end">
                    <p className="text-xs text-slate-400 font-semibold">{t.thAmount}</p>
                    <p className="text-xl font-black text-slate-900 font-mono">
                      {formatPrice(latestBooking.amount || 0)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-purple-100/80">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Calendar size={14} className="text-purple-600" />
                    <span>{latestBooking.date || new Date().toISOString().slice(0, 10)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono font-bold text-slate-700">
                    <span>PNR: {latestBooking.pnr || "LNZ-CONFIRMED"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center px-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                <Compass className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">{t.noActiveTrip}</p>
                <div className="mt-4 flex justify-center gap-2">
                  <Link
                    href="/flights"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#280e46] text-amber-300 px-3.5 py-2 text-xs font-bold hover:bg-[#391463] transition-colors"
                  >
                    <Plane size={14} />
                    <span>{t.bookFlight}</span>
                  </Link>
                  <Link
                    href="/hotels"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 px-3.5 py-2 text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    <Building2 size={14} />
                    <span>{t.bookHotel}</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {latestBooking && (
            <div className="mt-4 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
              <Link
                href={`/account/bookings/${latestBooking.id}`}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-[#280e46] hover:bg-[#3b1567] text-white px-4 py-2.5 text-xs font-bold shadow-md transition-colors"
              >
                <Plane size={14} className="text-amber-400" />
                <span>{t.manageBookingBtn}</span>
              </Link>
              <Link
                href={`/api/account/invoices/${latestBooking.id}/pdf?lang=${locale}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-xs font-bold transition-colors"
              >
                <Download size={14} />
                <span>{t.downloadInvoiceBtn}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Loyalty Tier Progress (1 col) */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{tierInfo.badge}</span>
                <div>
                  <h3 className="text-sm font-black text-slate-900">{tierInfo.name}</h3>
                  <p className="text-[11px] text-purple-700 font-bold">{tierInfo.multiplier} Points Multiplier</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onTabChange("tiers")}
                className="text-xs font-bold text-purple-700 hover:text-purple-900"
              >
                {t.kpiLoyaltySub} ➔
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-purple-50/80 border border-purple-100 p-4 text-center">
                <p className="text-[11px] font-bold text-slate-500 uppercase">{t.kpiLoyalty}</p>
                <p className="mt-1 text-3xl font-black text-[#280e46] font-mono">
                  {loyaltyPoints.toLocaleString()}
                </p>
                <p className="mt-1 text-[10px] text-purple-800 font-semibold">{t.tierDiscountNote}</p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1.5">
                  <span>{isAr ? "التقدم للرتبة التالية" : "Next Tier Progress"}</span>
                  <span className="font-mono text-purple-800">{tierInfo.progress}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-700 via-amber-500 to-amber-400 rounded-full transition-all duration-700"
                    style={{ width: `${tierInfo.progress}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-[11px] text-slate-600 flex items-center gap-2">
                <Percent size={16} className="text-amber-600 shrink-0" />
                <span>
                  {isAr
                    ? `تتمتع حالياً بخصم فندقي مميز بنسبة +${tierInfo.hotelDiscount}% على جميع الحجوزات الفندقية.`
                    : `Enjoy +${tierInfo.hotelDiscount}% hotel discount perk on all properties worldwide.`}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onTabChange("tiers")}
            className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 py-2.5 text-xs font-bold text-slate-700 transition-colors"
          >
            {isAr ? "استعراض سلم الرتب والمزايا" : "View Tier Benefits Ladder"}
          </button>
        </div>
      </div>

      {/* 5. Affiliate & Referral Sharing Card */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-400/40 bg-gradient-to-br from-[#1c0a31] via-[#260c44] to-[#120521] p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300 mb-2">
              <TrendingUp size={13} className="text-amber-400" />
              <span>{t.affiliateTitle}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {isAr ? "اكسب أرباحاً وسحوبات نقدية فورية مع كل إحالة" : "Earn Instant Commissions With Every Referral"}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-purple-200/80 leading-relaxed">
              {t.affiliateDesc}
            </p>
          </div>

          {/* Referral link box */}
          <div className="w-full lg:w-auto lg:min-w-[340px] rounded-2xl border border-purple-500/30 bg-black/40 p-4 backdrop-blur-md">
            <p className="text-[11px] font-bold text-amber-300 uppercase mb-2">
              {isAr ? "رابط الإحالة المخصص لك" : "Your Referral Link"}
            </p>
            <div className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/10 p-1.5 ps-3">
              <span className="font-mono text-xs text-purple-200 truncate flex-1">
                {referralUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-lg bg-amber-400 text-purple-950 px-3 py-1.5 text-xs font-black hover:bg-amber-300 transition-colors shrink-0 cursor-pointer"
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedLink ? t.copiedText : t.copyLinkBtn}</span>
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] text-purple-200/70 pt-2 border-t border-white/10">
              <span>{isAr ? "العمولات المعلقة:" : "Pending:"} <b className="text-amber-300 font-mono">${affiliateData.pendingCommission}</b></span>
              <button
                type="button"
                onClick={() => onTabChange("affiliate")}
                className="text-amber-400 font-bold hover:underline"
              >
                {isAr ? "فتح لوحة الأفيلييت" : "Affiliate Details"} ➔
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Recent Invoices & Payments Mini-Table */}
      {paymentsData.recentPayments.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">{t.recentPaymentsTitle}</h3>
              <p className="text-xs text-slate-500">
                {isAr ? "الفواتير الإلكترونية المعتمدة والقابلة للتحقق الفوري" : "Verified official electronic invoices"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onTabChange("payments")}
              className="text-xs font-bold text-purple-700 hover:text-purple-950 transition-colors"
            >
              {t.viewAllPayments} ➔
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold">
                  <th className="pb-3 text-start">{t.thInvoice}</th>
                  <th className="pb-3 text-start">{t.thService}</th>
                  <th className="pb-3 text-start">{t.thDate}</th>
                  <th className="pb-3 text-start">{t.thAmount}</th>
                  <th className="pb-3 text-start">{t.thStatus}</th>
                  <th className="pb-3 text-end">{isAr ? "إجراء" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {paymentsData.recentPayments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 font-mono font-bold text-slate-900">
                      {item.invoiceNumber || item.bookingId}
                    </td>
                    <td className="py-3">
                      <span className="truncate max-w-[200px] block font-semibold text-slate-800">
                        {item.title}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      {item.date?.slice(0, 10) || new Date().toISOString().slice(0, 10)}
                    </td>
                    <td className="py-3 font-mono font-bold text-slate-900">
                      {formatPrice(item.amount)}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        <span>{t.statusPaid}</span>
                      </span>
                    </td>
                    <td className="py-3 text-end">
                      <Link
                        href={`/invoice/verify?id=${item.bookingId}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 text-[11px] font-bold transition-colors"
                      >
                        <ExternalLink size={12} />
                        <span>{isAr ? "معاينة الفاتورة" : "Invoice"}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
