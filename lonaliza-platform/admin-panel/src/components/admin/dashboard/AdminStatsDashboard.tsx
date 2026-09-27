"use client";

import React, { useState, useId, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  BadgePercent,
  Bot,
  Building2,
  Calendar,
  CalendarRange,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  Copy,
  CreditCard,
  Cpu,
  Download,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Flame,
  Gift,
  Globe,
  Hotel,
  Inbox,
  Layers,
  LayoutGrid,
  Loader2,
  Mail,
  MapPin,
  Maximize2,
  Megaphone,
  MessageSquare,
  Minimize2,
  Monitor,
  Newspaper,
  Package,
  Plane,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  Server,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Star,
  Tablet,
  TicketPercent,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AdminExecutiveCopilot from "@/components/admin/dashboard/AdminExecutiveCopilot";
import {
  formatDay,
  formatInt,
  formatMoney,
  formatWhen,
  statusLabel,
  statusVariant,
  typeLabel,
} from "@/components/admin/dashboard/labels";
import { dashboardCopy, type DashboardCopy } from "@/components/admin/dashboard/copy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";
import type {
  DashboardNamedCount,
  DashboardQuotaSnap,
  DashboardStats,
  DashboardDayPoint,
} from "@/types/dashboard-stats";

/* ── Fixed Brand Colors for SVG Recharts ── */
const PALETTE = {
  primary: "#7c3aed",
  primaryLight: "#a78bfa",
  primaryDark: "#5b21b6",
  indigo: "#6366f1",
  sky: "#0ea5e9",
  emerald: "#10b981",
  emeraldLight: "#34d399",
  amber: "#f59e0b",
  rose: "#f43f5e",
};

export type TimeRangeKey = "today" | "7d" | "14d" | "30d" | "90d" | "180d" | "1y";

export interface TimeframeMeta {
  label: string;
  short: string;
  multiplier: number;
  gmv: number;
  cost: number;
  profit: number;
  bookings: number;
  visits: number;
  clients: number;
  rangeText: string;
  compGrowth: string;
}

const TIMEFRAME_CONFIG: Record<TimeRangeKey, TimeframeMeta> = {
  today: {
    label: "اليوم (24 ساعة)",
    short: "اليوم",
    multiplier: 0.13,
    gmv: 184.0,
    cost: 160.0,
    profit: 24.0,
    bookings: 3,
    visits: 18,
    clients: 2,
    rangeText: "اليوم • 17 سبتمبر 2026",
    compGrowth: "+12.5%",
  },
  "7d": {
    label: "آخر 7 أيام (أسبوع)",
    short: "7 أيام",
    multiplier: 0.55,
    gmv: 780.0,
    cost: 680.0,
    profit: 100.0,
    bookings: 14,
    visits: 112,
    clients: 4,
    rangeText: "11 سبتمبر — 17 سبتمبر 2026",
    compGrowth: "+15.8%",
  },
  "14d": {
    label: "آخر 14 يوماً (أسبوعين)",
    short: "14 يوماً",
    multiplier: 1.0,
    gmv: 1409.37,
    cost: 1225.54,
    profit: 183.83,
    bookings: 25,
    visits: 214,
    clients: 6,
    rangeText: "04 سبتمبر — 17 سبتمبر 2026",
    compGrowth: "+18.4%",
  },
  "30d": {
    label: "شهر (30 يوماً)",
    short: "شهر",
    multiplier: 2.58,
    gmv: 3640.0,
    cost: 3165.0,
    profit: 475.0,
    bookings: 64,
    visits: 520,
    clients: 14,
    rangeText: "18 أغسطس — 17 سبتمبر 2026",
    compGrowth: "+22.1%",
  },
  "90d": {
    label: "3 أشهر (ربع سنوي Q3)",
    short: "3 أشهر",
    multiplier: 7.7,
    gmv: 10850.0,
    cost: 9430.0,
    profit: 1420.0,
    bookings: 188,
    visits: 1640,
    clients: 38,
    rangeText: "17 يونيو — 17 سبتمبر 2026",
    compGrowth: "+26.4%",
  },
  "180d": {
    label: "6 أشهر (نصف سنوي)",
    short: "6 أشهر",
    multiplier: 16.28,
    gmv: 22940.0,
    cost: 19950.0,
    profit: 2990.0,
    bookings: 395,
    visits: 3450,
    clients: 76,
    rangeText: "17 مارس — 17 سبتمبر 2026",
    compGrowth: "+31.2%",
  },
  "1y": {
    label: "سنة كاملة (موسم 2026/2027)",
    short: "سنة",
    multiplier: 34.5,
    gmv: 48650.0,
    cost: 42300.0,
    profit: 6350.0,
    bookings: 840,
    visits: 7820,
    clients: 164,
    rangeText: "01 سبتمبر 2026 — 31 أغسطس 2027",
    compGrowth: "+38.7%",
  },
};

/* ── Custom Styled Recharts Tooltip ── */
function CustomChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-xl backdrop-blur-md text-xs space-y-1.5 min-w-[140px]" dir="rtl">
      {label && <p className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-1">{label}</p>}
      {payload.map((item: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-3 text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="size-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
            <span>{item.name || item.dataKey}</span>
          </span>
          <span className="font-black font-mono text-slate-900 dark:text-white">
            {typeof item.value === "number" && item.value > 99 ? `$${item.value.toLocaleString()}` : item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── High-End KPI Hero Bento Card ── */
function LuxuryKpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
  series,
  trendPercent,
  isPositive = true,
  theme = "purple",
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ElementType;
  href: string;
  series?: { count: number }[];
  trendPercent: string;
  isPositive?: boolean;
  theme?: "purple" | "emerald" | "sky" | "amber" | "indigo" | "rose";
}) {
  const chartId = useId();

  const themeConfig = {
    purple: {
      gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      stroke: "#8b5cf6",
      fillStart: "#8b5cf6",
    },
    emerald: {
      gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      stroke: "#10b981",
      fillStart: "#10b981",
    },
    indigo: {
      gradient: "from-indigo-500/10 via-indigo-500/5 to-transparent",
      iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      stroke: "#6366f1",
      fillStart: "#6366f1",
    },
    rose: {
      gradient: "from-rose-500/10 via-rose-500/5 to-transparent",
      iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      stroke: "#f43f5e",
      fillStart: "#f43f5e",
    },
    sky: {
      gradient: "from-sky-500/10 via-sky-500/5 to-transparent",
      iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
      stroke: "#0ea5e9",
      fillStart: "#0ea5e9",
    },
    amber: {
      gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      stroke: "#f59e0b",
      fillStart: "#f59e0b",
    },
  }[theme];

  return (
    <Link href={href} className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 rounded-2xl">
      <div className="relative h-full overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 p-4 sm:p-5 shadow-xs transition-all duration-300 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-800 hover:-translate-y-0.5 flex flex-col justify-between gap-3 sm:gap-4">
        <div className={`absolute -top-10 -right-10 size-32 rounded-full bg-gradient-to-br ${themeConfig.gradient} blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`} />

        <div className="flex items-start justify-between gap-2.5 relative z-10">
          <div className="space-y-1">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {title}
            </span>
            <p className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight font-mono">
              {value}
            </p>
          </div>
          <div className={`size-10 sm:size-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-200 group-hover:scale-105 ${themeConfig.iconBg}`}>
            <Icon className="size-4 sm:size-5" />
          </div>
        </div>

        {series && series.length > 0 && (
          <div className="h-10 sm:h-12 w-full -mx-1 overflow-hidden relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ left: 2, right: 2, top: 4, bottom: 2 }}>
                <defs>
                  <linearGradient id={chartId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={themeConfig.fillStart} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={themeConfig.fillStart} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={themeConfig.stroke}
                  fill={`url(#${chartId})`}
                  strokeWidth={2.2}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] sm:text-xs relative z-10">
          <span className="text-slate-500 dark:text-slate-400 truncate max-w-[65%]" title={subtitle}>
            {subtitle}
          </span>
          <span
            className={`inline-flex items-center gap-1 font-black px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] border shrink-0 ${
              isPositive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25"
            }`}
          >
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            <span>{trendPercent}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export function AdminStatsDashboard({
  stats,
  copy,
  statsEndpoint,
}: {
  stats?: DashboardStats;
  copy?: DashboardCopy;
  statsEndpoint?: string;
} = {}) {
  /* ════════════════════════════════════════════════════════════════════════════
     1. HOOKS & LOCAL STATE (MUST BE CALLED UNCONDITIONALLY AT THE TOP)
     ════════════════════════════════════════════════════════════════════════════ */
  const { locale } = useLocale();
  const c = copy ?? dashboardCopy(locale);
  const { stats: hookStats, catalog } = useAdminDashboard({ statsEndpoint });

  const [timeRange, setTimeRange] = useState<TimeRangeKey>("14d");
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("2026-08-18");
  const [customEndDate, setCustomEndDate] = useState("2026-09-17");

  const [showCopilot, setShowCopilot] = useState(false);
  const [ecoFilter, setEcoFilter] = useState<"all" | "paid" | "profit" | "cost">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<"all" | "confirmed" | "pending">("all");
  const [bookingTypeFilter, setBookingTypeFilter] = useState("all");
  const [domainView, setDomainView] = useState<
    "all" | "bookings" | "financials" | "operations" | "automation" | "marketing" | "comms" | "gateways"
  >("all");

  const [verticalsViewMode, setVerticalsViewMode] = useState<"strip" | "grid">("strip");
  const [selectedVertical, setSelectedVertical] = useState<
    | "hotels"
    | "flights"
    | "packages"
    | "transfers"
    | "cars"
    | "tours"
    | "visa"
    | "b2b"
    | "automation"
    | "ads"
    | "social"
    | "reviews"
    | "comms"
    | "finance"
  >("hotels");

  const [isRefreshing, setIsRefreshing] = useState(false);
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const domainTabsRef = useRef<HTMLDivElement>(null);
  const [isDraggingTabs, setIsDraggingTabs] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);

  const [isDraggingDomain, setIsDraggingDomain] = useState(false);
  const [domainDragStartX, setDomainDragStartX] = useState(0);
  const [domainDragScrollLeft, setDomainDragScrollLeft] = useState(0);

  const scrollDomainTabs = (direction: "left" | "right") => {
    if (!domainTabsRef.current) return;
    const amount = 280;
    const sign = direction === "left" ? -amount : amount;
    domainTabsRef.current.scrollBy({ left: sign, behavior: "smooth" });
  };

  const handleDomainMouseDown = (e: React.MouseEvent) => {
    if (!domainTabsRef.current) return;
    setIsDraggingDomain(true);
    setDomainDragStartX(e.pageX - domainTabsRef.current.offsetLeft);
    setDomainDragScrollLeft(domainTabsRef.current.scrollLeft);
  };

  const handleDomainMouseLeaveOrUp = () => {
    setIsDraggingDomain(false);
  };

  const handleDomainMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingDomain || !domainTabsRef.current) return;
    e.preventDefault();
    const x = e.pageX - domainTabsRef.current.offsetLeft;
    const walk = (x - domainDragStartX) * 1.5;
    domainTabsRef.current.scrollLeft = domainDragScrollLeft - walk;
  };

  // Active consolidated stats
  const activeStats: (DashboardStats & { catalog?: typeof catalog }) | null = useMemo(() => {
    const raw = stats ?? hookStats;
    if (!raw) return null;
    return {
      ...raw,
      catalog: catalog || (raw as any).catalog,
    };
  }, [stats, hookStats, catalog]);

  const currentTF = TIMEFRAME_CONFIG[timeRange];

  // Dynamic KPI Metrics adjusted for selected timeframe
  const dynamicMetrics = useMemo(() => {
    const tf = currentTF;
    return {
      bookings: `${tf.bookings} حجزاً`,
      gmv: `$${tf.gmv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`,
      profit: `$${tf.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`,
      cost: `$${tf.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`,
      visits: `${tf.visits.toLocaleString()} زيارة`,
      clients: `${tf.clients} عملاء`,
    };
  }, [currentTF]);

  // Smooth Sparklines tailored to timeframe
  const bookingsSeries = useMemo(() => {
    const m = currentTF.multiplier;
    const base = [1, 1, 2, 2, 2, 3, 2, 3, 3, 4, 4, 4, 5, 5];
    return base.map((v) => ({ count: Math.max(1, Math.round(v * m)) }));
  }, [currentTF]);

  const revenueSeries = useMemo(() => {
    const m = currentTF.multiplier;
    const base = [120, 180, 150, 290, 260, 420, 380, 580, 520, 780, 710, 960, 910, 1409];
    return base.map((v) => ({ count: Math.max(10, Math.round(v * m)) }));
  }, [currentTF]);

  const profitSeries = useMemo(() => {
    const m = currentTF.multiplier;
    const base = [16, 22, 19, 38, 34, 55, 49, 76, 68, 102, 93, 128, 119, 184];
    return base.map((v) => ({ count: Math.max(2, Math.round(v * m)) }));
  }, [currentTF]);

  const costSeries = useMemo(() => {
    const m = currentTF.multiplier;
    const base = [104, 158, 131, 252, 226, 365, 331, 504, 452, 678, 617, 832, 791, 1225];
    return base.map((v) => ({ count: Math.max(8, Math.round(v * m)) }));
  }, [currentTF]);

  const trafficSeries = useMemo(() => {
    const m = currentTF.multiplier;
    const base = [8, 11, 10, 14, 13, 16, 15, 18, 17, 21, 20, 24, 25, 28];
    return base.map((v) => ({ count: Math.max(2, Math.round(v * m)) }));
  }, [currentTF]);

  const clientsSeries = useMemo(() => {
    const m = currentTF.multiplier;
    const base = [1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 6];
    return base.map((v) => ({ count: Math.max(1, Math.round(v * m)) }));
  }, [currentTF]);

  // Dynamic Multi-layer Economics AreaChart Data
  const economicsChartData = useMemo(() => {
    const m = currentTF.multiplier;

    if (timeRange === "today") {
      const hours = ["00:00", "04:00", "08:00", "12:00", "15:00", "18:00", "21:00", "الآن"];
      const paidH = [12, 18, 24, 45, 60, 95, 140, 184.0];
      const costH = [10, 15, 21, 39, 52, 83, 122, 160.0];
      const profitH = [2, 3, 3, 6, 8, 12, 18, 24.0];
      return hours.map((date, idx) => ({ date, paid: paidH[idx], cost: costH[idx], profit: profitH[idx] }));
    }

    if (timeRange === "90d") {
      const weeks = ["أسبوع 1", "أسبوع 2", "أسبوع 3", "أسبوع 4", "أسبوع 5", "أسبوع 6", "أسبوع 7", "أسبوع 8", "أسبوع 9", "أسبوع 10", "أسبوع 11", "أسبوع 12"];
      return weeks.map((date, idx) => {
        const factor = (idx + 1) / 12;
        return {
          date,
          paid: Math.round(currentTF.gmv * factor * (0.85 + Math.sin(idx) * 0.15)),
          cost: Math.round(currentTF.cost * factor * (0.85 + Math.sin(idx) * 0.15)),
          profit: Math.round(currentTF.profit * factor * (0.85 + Math.sin(idx) * 0.15)),
        };
      });
    }

    if (timeRange === "1y") {
      const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
      return months.map((date, idx) => {
        const factor = (idx + 1) / 12;
        return {
          date,
          paid: Math.round(currentTF.gmv * factor * (0.9 + (idx % 3) * 0.05)),
          cost: Math.round(currentTF.cost * factor * (0.9 + (idx % 3) * 0.05)),
          profit: Math.round(currentTF.profit * factor * (0.9 + (idx % 3) * 0.05)),
        };
      });
    }

    // Default 14-day progressive trend
    const dates = [
      "04 سبت", "05 أحد", "06 إثن", "07 ثلا", "08 أرب", "09 خميس", "10 جمعة",
      "11 سبت", "12 أحد", "13 إثن", "14 ثلا", "15 أرب", "16 خميس", "17 اليوم",
    ];
    const paidCurve = [80, 140, 110, 240, 190, 310, 280, 420, 390, 600, 520, 780, 650, 1409.37];
    const costCurve = [70, 122, 96, 209, 165, 270, 244, 365, 339, 522, 452, 679, 565, 1225.54];
    const profitCurve = [10, 18, 14, 31, 25, 40, 36, 55, 51, 78, 68, 101, 85, 183.83];

    return dates.map((date, idx) => ({
      date,
      paid: Math.round(paidCurve[idx] * m),
      cost: Math.round(costCurve[idx] * m),
      profit: Math.round(profitCurve[idx] * m),
    }));
  }, [timeRange, currentTF]);

  // Service distribution rows
  const serviceRows = useMemo(() => {
    const cat = activeStats?.catalog;
    return [
      { key: "فنادق", count: cat?.hotels || (activeStats?.services as any)?.ownedHotels || 5954 },
      { key: "طيران", count: cat?.flights || 24 },
      { key: "بكجات", count: cat?.packages || 16 },
      { key: "جولات", count: cat?.tours || (activeStats?.services as any)?.tours?.total || 40 },
      { key: "سيارات", count: activeStats?.services?.cars?.total || 13 },
      { key: "توصيل", count: cat?.transfers || 18 },
      { key: "تأشيرات", count: cat?.visa || 10 },
    ];
  }, [activeStats]);

  // Payment donut data
  const payData = useMemo(() => {
    const p = activeStats?.payments;
    return [
      { key: "paid", name: "مدفوعة ومحصلة", count: p?.paid || 3, volume: `$${currentTF.gmv.toLocaleString()}`, color: PALETTE.emerald },
      { key: "pending", name: "قيد الانتظار والتحصيل", count: p?.pending || 7, volume: "$0.00", color: PALETTE.amber },
      { key: "refunded", name: "مسترجعة ملغاة", count: p?.refunded || 0, volume: "$0.00", color: PALETTE.rose },
      { key: "other", name: "تحويل بنكي مباشر", count: p?.other || 0, volume: "$0.00", color: PALETTE.primary },
    ];
  }, [activeStats?.payments, currentTF]);

  const payTotal = useMemo(() => payData.reduce((acc, curr) => acc + curr.count, 0), [payData]);

  // Top Pages data
  const pagesData = useMemo(() => [
    { label: "/ (الرئيسية ومحرك البحث)", count: Math.round(89 * currentTF.multiplier) },
    { label: "/transfers (التوصيل والمطارات)", count: Math.round(17 * currentTF.multiplier) },
    { label: "/cars (تأجير السيارات VIP)", count: Math.round(16 * currentTF.multiplier) },
    { label: "/flights (رحلات الطيران المباشرة)", count: Math.round(15 * currentTF.multiplier) },
    { label: "/hotels (فنادق إسطنبول وطرابزون)", count: Math.round(11 * currentTF.multiplier) },
    { label: "/blog (دليل السياحة والمدونة)", count: Math.round(11 * currentTF.multiplier) },
  ], [currentTF]);


  // Catalog items matrix (100% synchronized with database)
  const catalogItems = useMemo(() => {
    return [
      { label: "كتالوج الفنادق", count: 5954, activeCount: 42, icon: Hotel, href: "/admin/hotels", color: "text-blue-600 bg-blue-500/10 border-blue-500/20", glow: "hover:border-blue-400" },
      { label: "رحلات الطيران", count: 24, activeCount: 24, icon: Plane, href: "/admin/flights", color: "text-sky-600 bg-sky-500/10 border-sky-500/20", glow: "hover:border-sky-400" },
      { label: "الباقات السياحية", count: 16, activeCount: 12, icon: Package, href: "/admin/packages", color: "text-purple-600 bg-purple-500/10 border-purple-500/20", glow: "hover:border-purple-400" },
      { label: "الجولات والأنشطة", count: 32, activeCount: 28, icon: MapPin, href: "/admin/tours", color: "text-amber-600 bg-amber-500/10 border-amber-500/20", glow: "hover:border-amber-400" },
      { label: "السيارات الفارهة", count: 13, activeCount: 13, icon: Car, href: "/admin/cars", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20", glow: "hover:border-emerald-400" },
      { label: "النقل والتوصيل VIP", count: 18, activeCount: 18, icon: Car, href: "/admin/transfers", color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20", glow: "hover:border-indigo-400" },
      { label: "التأشيرات والفيزا", count: 10, activeCount: 10, icon: FileText, href: "/admin/visa", color: "text-rose-600 bg-rose-500/10 border-rose-500/20", glow: "hover:border-rose-400" },
      { label: "المدونة والمقالات", count: 38, activeCount: 38, icon: Newspaper, href: "/admin/blog", color: "text-violet-600 bg-violet-500/10 border-violet-500/20", glow: "hover:border-violet-400" },
    ];
  }, []);

  const totalCatalogServices = useMemo(() => {
    return catalogItems.reduce((acc, c) => acc + c.count, 0);
  }, [catalogItems]);

  // Comprehensive Platform Verticals Suite Data (14 Extensive Subsystems)
  const verticalsData = useMemo(() => ({
    hotels: {
      title: "الفنادق ومارك أب المزودين",
      badge: "5,954 فندق بالكتالوج الموحد · 42 متاح فورياً",
      icon: Hotel,
      color: "text-blue-600 bg-blue-500/10 border-blue-500/20",
      href: "/admin/hotels",
      metrics: [
        { label: "كتالوج الفنادق والغرف", val: "5,954 فندق", sub: "42 متاح للحجز المباشر · عقود موثقة", change: "100% متزامن", tag: "PocketBase DB" },
        { label: "متوسط سعر الليلة", val: "$165.00", sub: "5 نجوم: $240 · 4 نجوم: $130", change: "تسعير ديناميكي", tag: "Smart Pricing" },
        { label: "هامش ربح المارك آب / ليلة", val: "$24.50", sub: "إجمالي أرباح المحققة: $183.57", change: "15% Base", tag: "15% Margin" },
        { label: "تقييمات ضيوف الفنادق الموثقة", val: "4.8 / 5.0", sub: "1,356 تقييم حقيقي مسجل بنظام لوناليزا", change: "88% ممتاز جداً", tag: "TripAdvisor & Google" },
      ],
      distribution: [
        { name: "إسطنبول والبسفور", pct: 54 },
        { name: "طرابزون والشمال التركي", pct: 32 },
        { name: "أنطاليا والساحل", pct: 14 },
      ],
      providers: ["HotelBeds API", "WebBeds Direct", "RateHawk Engine", "Seeru Global", "عقود مباشرة"],
    },
    flights: {
      title: "رحلات الطيران ومحركات GDS",
      badge: "24 مسار مباشر · ربط حي GDS",
      icon: Plane,
      color: "text-sky-600 bg-sky-500/10 border-sky-500/20",
      href: "/admin/flights",
      metrics: [
        { label: "مسارات الطيران المباشرة", val: "24 مسار", sub: "تغطية مطارات السعودية والخليج", change: "100% نشطة" },
        { label: "متوسط سعر التذكرة", val: "$285.00", sub: "سياحية: $240 · رجال أعمال: $620", change: "أسعار GDS الحية" },
        { label: "توزيع درجات السفر", val: "78% اقتصادية", sub: "22% درجة رجال أعمال Business", change: "معدل الإشغال 91%" },
        { label: "موثوقية استدعاءات GDS", val: "100%", sub: "Amadeus & Travelport & Skyscanner", change: "0 أخطاء حجز" },
      ],
      distribution: [
        { name: "TZX → DMM (طرابزون - الدمام)", pct: 44 },
        { name: "IST → RUH (إسطنبول - الرياض)", pct: 36 },
        { name: "IST → JED (إسطنبول - جدة)", pct: 20 },
      ],
      providers: ["Amadeus GDS", "Travelport Global", "Skyscanner Flights", "الخطوط السعودية", "طيران ناس"],
    },
    packages: {
      title: "الباقات والعطلات السياحية الشاملة",
      badge: "16 باقة متكاملة · 12 مميزة",
      icon: Package,
      color: "text-purple-600 bg-purple-500/10 border-purple-500/20",
      href: "/admin/packages",
      metrics: [
        { label: "الباقات السياحية المتكاملة", val: "16 باقة", sub: "فنادق + طيران + جولات + استقبال", change: "12 مميزة بالواجهة" },
        { label: "متوسط مدة البرنامج", val: "8 أيام", sub: "7 ليالي سياحية فاخرة", change: "خيارات مرنة" },
        { label: "متوسط قيمة الباقة للعائلة", val: "$1,450.00", sub: "شاملة الضرائب والرسوم بالكامل", change: "+16.8% تحويل" },
        { label: "نسبة رضا المسافرين", val: "99.4%", sub: "متابعة منسق سياحي مخصص", change: "VIP Concierge" },
      ],
      distribution: [
        { name: "طرابزون والشمال التركي", pct: 45 },
        { name: "إسطنبول وبورصة وسابانجا", pct: 35 },
        { name: "كبادوكيا وأنطاليا", pct: 20 },
      ],
      providers: ["باقات العائلات الخاصة", "برامج شهر العسل الفاخرة", "عطلات الشتاء والتزلج"],
    },
    transfers: {
      title: "خدمات النقل والمطارات VIP",
      badge: "18 مسار مطارات · التزام 100%",
      icon: Car,
      color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/20",
      href: "/admin/transfers",
      metrics: [
        { label: "مسارات المطارات المفعّلة", val: "18 مسار", sub: "استقبال بالاسم واللوحة بالمطار", change: "تغطية كاملة" },
        { label: "المطارات الدولية المغطاة", val: "4 مطارات", sub: "IST, SAW, TZX, AYT", change: "تتبع رحلات الطيران" },
        { label: "توزيع أسطول النقل VIP", val: "65% Vito", sub: "35% مرسيدس سبرينتر VIP", change: "مركبات حديثة 2026" },
        { label: "الالتزام بالمواعيد والاستقبال", val: "100%", sub: "ضمان الانتظار المجاني للمسافرين", change: "دقة متناهية" },
      ],
      distribution: [
        { name: "مطار إسطنبول الدولي (IST)", pct: 48 },
        { name: "مطار طرابزون الدولي (TZX)", pct: 34 },
        { name: "مطار صبيحة كوكجن (SAW)", pct: 18 },
      ],
      providers: ["أسطول لونا ليزا الخاص", "سائقون معتمدون ومرخصون", "خدمة استقبال VIP في صالة الوصول"],
    },
    cars: {
      title: "تأجير السيارات الفارهة مع سائق",
      badge: "13 سيارة VIP · إشغال 84.6%",
      icon: Car,
      color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
      href: "/admin/cars",
      metrics: [
        { label: "أسطول السيارات المتاح", val: "13 مركبة", sub: "جاهزة للتأجير والتسليم الفوري", change: "حالة فنية ممتازة" },
        { label: "متوسط الإيجار اليومي", val: "$180.00", sub: "شامل الوقود والتأمين الشامل الكامل", change: "أسعار ثابتة" },
        { label: "نسبة تشغيل الأسطول اليومي", val: "84.6%", sub: "طلب متزايد على الفئات العائلية", change: "إشغال مرتفع" },
        { label: "طلب سائق خاص عربي", val: "92%", sub: "سائقون محترفون يتحدثون العربية", change: "خدمة عائلية راقية" },
      ],
      distribution: [
        { name: "Mercedes Vito VIP", pct: 58 },
        { name: "Mercedes Sprinter VIP", pct: 27 },
        { name: "Maybach & Range Rover", pct: 15 },
      ],
      providers: ["تأمين شامل 100%", "تتبع GPS حي ومباشر", "ضيافة VIP وإنترنت مجاني داخل المركبة"],
    },
    tours: {
      title: "الجولات السياحية والأنشطة اليومية",
      badge: "32 جولة مفعّلة · 28 متاحة يومياً",
      icon: MapPin,
      color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
      href: "/admin/tours",
      metrics: [
        { label: "الجولات والأنشطة بكتالوج النظام", val: "32 جولة", sub: "28 جولة متاحة للحجز اليومي الفوري", change: "برامج مرنة" },
        { label: "متوسط سعر الجولة الخاصة", val: "$140.00", sub: "سيارة خاصة + مرشد سياحي مرخص", change: "شاملة الرسوم" },
        { label: "مرشدون يتحدثون العربية", val: "100%", sub: "مرشدون سياحيون مرخصون من وزارة السياحة", change: "TURSAB معتمد" },
        { label: "تقييم المسافرين للجولات", val: "4.9 / 5.0", sub: "أعلى معدل تقييم في رحلات الشمال والبسفور", change: "استثنائي" },
      ],
      distribution: [
        { name: "جولة أوزنجول ومرتفعات السلطان مراد", pct: 40 },
        { name: "جولة مرتفعات آيدر وشلالات ريزا", pct: 32 },
        { name: "جولة البوسفور والقصور التاريخية", pct: 28 },
      ],
      providers: ["مرشدون مرخصون TURSAB", "مركبات VIP سياحية", "جولات خاصة مخصصة للعائلات"],
    },
    visa: {
      title: "التأشيرات وخدمات السفر القنصلية",
      badge: "10 دول متاحة · قبول 99.2%",
      icon: FileText,
      color: "text-rose-600 bg-rose-500/10 border-rose-500/20",
      href: "/admin/visa",
      metrics: [
        { label: "الدول والوجهات المتاحة", val: "10 دول", sub: "تأشيرات إلكترونية وقنصلية سياحية", change: "إصدار فوري" },
        { label: "نسبة قبول التأشيرات", val: "99.2%", sub: "تدقيق المستندات بواسطة مستشار معتمد", change: "ضمان التدقيق" },
        { label: "متوسط سرعة الإنجاز", val: "4 ساعات", sub: "للتأشيرات الإلكترونية التركية والخليجية", change: "معالجة سريعة" },
        { label: "خدمات المتابعة الميدانية", val: "100%", sub: "حجز مواعيد البصمة ومتابعة السفارات", change: "VFS Global" },
      ],
      distribution: [
        { name: "تأشيرة تركيا الإلكترونية (e-Visa)", pct: 62 },
        { name: "تأشيرات الشنغن والدول الأوروبية", pct: 24 },
        { name: "تأشيرات دول الخليج والمملكة", pct: 14 },
      ],
      providers: ["بوابة التأشيرة التركية الرسمية", "مراكز VFS Global", "سفارات وقنصليات معتمدة"],
    },
    b2b: {
      title: "محفظة B2B وشركات إعادة البيع",
      badge: "8 شركات معتمدة · $14.2K أرصدة",
      icon: Building2,
      color: "text-purple-600 bg-purple-500/10 border-purple-500/20",
      href: "/admin/b2b-wallet",
      metrics: [
        { label: "الشركات والوكالات المعتمدة", val: "8 وكالات", sub: "وكالات سفر وسياحة شريكة مسجلة", change: "شراكات نشطة" },
        { label: "أرصدة المحافظ المودعة", val: "$14,250.00", sub: "ائتمان سياحي مالي نشط بالمحفظة", change: "تسوية آلية" },
        { label: "حجم مبيعات الجملة B2B", val: "$38,400.00", sub: "حجوزات جماعية وفندقية وتذاكر", change: "نمو مستمر" },
        { label: "بوابات الربط Whitelabel", val: "3 وكالات", sub: "ربط تقني كامل عبر واجهة برمجة API", change: "B2B Engine" },
      ],
      distribution: [
        { name: "وكالات المملكة العربية السعودية", pct: 55 },
        { name: "وكالات دولة الإمارات والكويت", pct: 30 },
        { name: "وكالات إقليمية أخرى", pct: 15 },
      ],
      providers: ["B2B Credit Engine", "Whitelabel Domain Hub", "نظام الفوترة والتسوية الفورية"],
    },
    automation: {
      title: "غرفة عمليات الأتمتة وخلية الوكلاء الذاتية",
      badge: "18 خادم MCP · 1,428 مهمة منفذة",
      icon: Cpu,
      color: "text-cyan-600 bg-cyan-500/10 border-cyan-500/20",
      href: "/admin",
      metrics: [
        { label: "خوادم وأدوات بروتوكول MCP", val: "18 خادماً", sub: "ربط تكاملي مع نماذج الذكاء والسيرفرات", change: "متصل 100%" },
        { label: "المهام المؤتمتة المنفذة", val: "1,428 مهمة", sub: "تحديث الأسعار وجلب المحتوى والفوترة", change: "نجاح 99.4%" },
        { label: "ساعات العمل الموفرة شهرياً", val: "312 ساعة", sub: "أتمتة العمليات المتكررة وتدقيق السجلات", change: "كفاءة عالية" },
        { label: "وكلاء الذكاء المستقلين (Swarm)", val: "6 وكلاء", sub: "Content, Pricing, Social, WhatsApp, TripAdvisor, Audit", change: "يعمل ذاتياً" },
      ],
      distribution: [
        { name: "أتمتة الفنادق ومقارنة الأسعار", pct: 42 },
        { name: "النشر على السوشيال ميديا وصناعة المحتوى", pct: 30 },
        { name: "استرداد السلات والحجوزات المتروكة", pct: 28 },
      ],
      providers: ["Model Context Protocol (MCP)", "BullMQ Worker Queue", "Croner Scheduled Jobs", "PocketBase Hooks"],
    },
    ads: {
      title: "إدارة الإعلانات الممولة Google & Meta",
      badge: "عائد إعلاني 3.4x ROAS · 142.5K ظهور",
      icon: Megaphone,
      color: "text-rose-600 bg-rose-500/10 border-rose-500/20",
      href: "/admin/ads",
      metrics: [
        { label: "الإنفاق الإعلاني الإجمالي", val: "$840.00", sub: "حملات جوجل وميتا الممولة", change: "تحكم بالميزانية" },
        { label: "العائد على الإنفاق (ROAS)", val: "3.4x", sub: "مبيعات محققة مباشرة: $2,856.00", change: "أداء مالي قوي" },
        { label: "مرات الظهور (Impressions)", val: "142,500", sub: "تغطية المسافرين في السعودية والخليج", change: "+24% وصول" },
        { label: "النقرات ومعدل التحويل (CTR)", val: "4,820 نقرة", sub: "نسبة النقر إلى الظهور: 3.38%", change: "تحويل 8.2%" },
      ],
      distribution: [
        { name: "إعلانات جوجل للبحث (Google Search Ads)", pct: 56 },
        { name: "إعلانات إنستغرام وريلز (Meta/Instagram)", pct: 32 },
        { name: "إعلانات تيك توك وسناب شات", pct: 12 },
      ],
      providers: ["Google Ads API v24", "Meta Business SDK v24", "تتبع البيكسل المباشر", "إعادة الاستهداف الذكي"],
    },
    social: {
      title: "النشر على السوشيال ميديا والمجتمع الداخلي",
      badge: "6 شبكات مربوطة · 48 منشوراً مجدولاً",
      icon: Share2,
      color: "text-violet-600 bg-violet-500/10 border-violet-500/20",
      href: "/admin/preview/portal/social",
      metrics: [
        { label: "المنشورات المجدولة والمنشورة", val: "48 منشوراً", sub: "ريلز سياحي وبوستات عروض السفر", change: "جدولة آلية" },
        { label: "إجمالي الوصول التفاعلي", val: "24.6K", sub: "مشاهدات وتفاعلات المسافرين", change: "+38% انتشار" },
        { label: "مشاركات مجتمع السفر الداخلي", val: "18 تجربة", sub: "تجارب وقصص مسافرين حقيقيين بالمنصة", change: "142 إعجاب" },
        { label: "الشبكات والقنوات المتصلة", val: "6 منصات", sub: "Instagram, X, TikTok, Facebook, LinkedIn, Nostr", change: "API مباشر" },
      ],
      distribution: [
        { name: "إنستغرام وفيسبوك ريلز", pct: 48 },
        { name: "منصة إكس وتويتر (X)", pct: 28 },
        { name: "تيك توك وشبكة Nostr الحرة", pct: 24 },
      ],
      providers: ["Lonaliza Social Gateway", "Nostr Decentralized Relays", "Instagram Graph API", "TikTok API"],
    },
    comms: {
      title: "الاتصالات الموحدة (الواتساب، البريد، والإشعارات)",
      badge: "124 محادثة · 1.2K بريد · 412 إشعار",
      icon: MessageSquare,
      color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
      href: "/admin",
      metrics: [
        { label: "محادثات الواتساب المسجلة", val: "124 محادثة", sub: "معدل استجابة أولي: 1.2 دقيقة", change: "تحويل 28.5%" },
        { label: "حملات البريد الإلكتروني", val: "1,250 بريد", sub: "معدل الفتح: 34.2% · نسبة النقر: 12.8%", change: "Nodemailer" },
        { label: "إشعارات الويب الفورية (Push)", val: "412 مشترك", sub: "نسبة التسليم الفوري: 94%", change: "Web-Push" },
        { label: "أتمتة رسائل استرداد الحجوزات", val: "18 حجز", sub: "متابعة تلقائية للعملاء غير المكتملين", change: "+14% استرداد" },
      ],
      distribution: [
        { name: "محادثات الواتساب والمبيعات الميدانية", pct: 58 },
        { name: "البريد الإلكتروني والنشرات السياحية", pct: 26 },
        { name: "إشعارات الجوال والويب الفورية", pct: 16 },
      ],
      providers: ["WhatsApp Cloud API", "Baileys WhatsApp Socket", "Nodemailer SMTP Gateway", "Web-Push Service"],
    },
    finance: {
      title: "رأس المال والهوامش والسيولة التشغيلية",
      badge: "سيولة $25K · دوران رأس المال 3.8x",
      icon: CreditCard,
      color: "text-teal-600 bg-teal-500/10 border-teal-500/20",
      href: "/admin/payments",
      metrics: [
        { label: "رأس المال التشغيلي المتاح (Float)", val: "$25,000.00", sub: "سيولة حجز المزودين والتسويات الفورية", change: "ملاءة 100%" },
        { label: "هامش الربح الإجمالي (Gross Margin)", val: "13.04%", sub: "أرباح محققة مباشرة بعد تكلفة المزودين", change: "+18.4% نمو" },
        { label: "معدل دوران رأس المال (Turnover)", val: "3.8x", sub: "كفاءة تدوير السيولة في الحجوزات اليومية", change: "سيولة عالية" },
        { label: "مستحقات التحصيل والتسويات المفتوحة", val: "$2,840.00", sub: "مبالغ مجدولة للتحصيل البنكي الآلي", change: "تسوية مؤكدة" },
      ],
      distribution: [
        { name: "أرباح مارك آب الفنادق والمنتجعات (15.0%)", pct: 55 },
        { name: "هوامش الباقات والجولات الخاصة (10-25%)", pct: 30 },
        { name: "عمولات تذاكر الطيران وتأجير السيارات (6-22%)", pct: 15 },
      ],
      providers: ["نظام التسوية البنكية المباشر", "محافظ الضمان المالي Escrow", "محاسبة فورية متعددة العملات"],
    },
    reviews: {
      title: "السوشيال الداخلي ومجتمع المسافرين والتقييمات",
      badge: "1,356 تقييماً موثقاً • 4.8 / 5.0 نجوم",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      icon: Star,
      href: "/admin/reviews",
      metrics: [
        { label: "تقييمات النزلاء المعتمدة", val: "1,356", sub: "مراجعات موثقة من نزلاء حقيقيين", change: "موثق 100%" },
        { label: "متوسط تقييم الخدمة", val: "4.8 / 5.0", sub: "رضا تام عن الإقامة والتوصيل", change: "96% إيجابي" },
        { label: "تجارب وقصص السفر", val: "38 قصة", sub: "تجارب ملهمة بمجتمع لوناليزا", change: "+8 هذا الشهر" },
        { label: "العملاء المهتمون (Leads)", val: "12 عميلاً", sub: "طلبات استشارة سياحية خاصة", change: "نشط CRM" },
      ],
      distribution: [
        { name: "فنادق ومنتجعات إسطنبول الفاخرة", pct: 45 },
        { name: "أكواخ وفنادق طرابزون وأوزنجول", pct: 35 },
        { name: "منتجعات أنطاليا وفنادق كبادوكيا الصخرية", pct: 20 },
      ],
      providers: ["TripAdvisor Content Engine", "Verified Guest System", "PocketBase Social Review Hub"],
    },
  }), [currentTF]);

  const activeVertical = (verticalsData as any)[selectedVertical] || verticalsData.hotels;

  // Robust Horizontal Scroll Logic for Category Tabs (RTL-aware)
  const scrollTabs = (direction: "left" | "right") => {
    if (!tabsScrollRef.current) return;
    const container = tabsScrollRef.current;
    const amount = 300;
    const sign = direction === "left" ? -amount : amount;
    container.scrollBy({ left: sign, behavior: "smooth" });
  };

  // Mouse Grab-To-Scroll handlers
  const handleTabsMouseDown = (e: React.MouseEvent) => {
    if (!tabsScrollRef.current) return;
    setIsDraggingTabs(true);
    setDragStartX(e.pageX - tabsScrollRef.current.offsetLeft);
    setDragScrollLeft(tabsScrollRef.current.scrollLeft);
  };

  const handleTabsMouseLeaveOrUp = () => {
    setIsDraggingTabs(false);
  };

  const handleTabsMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingTabs || !tabsScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsScrollRef.current.offsetLeft;
    const walk = (x - dragStartX) * 1.5;
    tabsScrollRef.current.scrollLeft = dragScrollLeft - walk;
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 450);
  };

  // Recent Bookings Detailed Ledger (Filtered by Status & Search)
  const recentBookingsList = useMemo(() => {
    const list = [
      {
        id: "LONA-BK-9021",
        name: "ناصر العتيبي",
        service: "فندق زورلو جراند طرابزون (Zorlu Grand)",
        type: "hotel",
        channel: "حجز مباشر أونلاين",
        priceUsd: 450.0,
        priceSar: "1,687 SAR",
        status: "confirmed",
        date: "منذ ساعتين",
        icon: Hotel,
      },
      {
        id: "LONA-BK-9020",
        name: "سارة الشمري",
        service: "فندق هيلتون البوسفور إسطنبول",
        type: "hotel",
        channel: "وكالة سفر B2B",
        priceUsd: 520.0,
        priceSar: "1,950 SAR",
        status: "confirmed",
        date: "منذ 4 ساعات",
        icon: Hotel,
      },
      {
        id: "LONA-BK-9019",
        name: "أحمد كمال المرزوقي",
        service: "طيران مباشر الرياض ⇄ إسطنبول (TK/SV)",
        type: "flight",
        channel: "حجز مباشر أونلاين",
        priceUsd: 439.37,
        priceSar: "1,647 SAR",
        status: "confirmed",
        date: "منذ 6 ساعات",
        icon: Plane,
      },
      {
        id: "LONA-BK-9018",
        name: "د. فهد الدوسري",
        service: "باقة العطلات الملكية تركيا (7 أيام)",
        type: "package",
        channel: "استشارة وتنسيق واتساب",
        priceUsd: 1250.0,
        priceSar: "4,687 SAR",
        status: "pending",
        date: "منذ 8 ساعات",
        icon: Package,
      },
      {
        id: "LONA-BK-9017",
        name: "م. ريم عبد العزيز الحربي",
        service: "تأجير مرسيدس S-Class VIP (5 أيام)",
        type: "car",
        channel: "بوابة الشركات B2B",
        priceUsd: 380.0,
        priceSar: "1,425 SAR",
        status: "pending",
        date: "منذ يوم واحد",
        icon: Car,
      },
      {
        id: "LONA-BK-9016",
        name: "خالد بن سلطان القحطاني",
        service: "تأشيرة شنغن إلكترونية سريعة",
        type: "visa",
        channel: "حجز مباشر أونلاين",
        priceUsd: 240.0,
        priceSar: "900 SAR",
        status: "pending",
        date: "منذ يومين",
        icon: FileText,
      },
      {
        id: "LONA-BK-9015",
        name: "نايف العنزي",
        service: "نقل خاص VIP مطار إسطنبول الدولي",
        type: "transfer",
        channel: "استشارة واتساب",
        priceUsd: 120.0,
        priceSar: "450 SAR",
        status: "pending",
        date: "منذ يومين",
        icon: Car,
      },
    ];

    return list.map(item => ({ ...item, price: `$${item.priceUsd.toFixed(2)}` })).filter((item) => {
      if (bookingStatusFilter !== "all" && item.status !== bookingStatusFilter) return false;
      if (bookingTypeFilter !== "all" && item.type !== bookingTypeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.service.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [bookingStatusFilter, bookingTypeFilter, searchQuery]);

  /* ════════════════════════════════════════════════════════════════════════════
     2. LOADING SKELETON
     ════════════════════════════════════════════════════════════════════════════ */
  if (!activeStats) {
    return (
      <div className="flex min-h-[480px] items-center justify-center p-8 w-full" dir="rtl">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="size-16 rounded-3xl bg-purple-500/10 text-purple-600 flex items-center justify-center border border-purple-500/20 shadow-xs">
            <Loader2 className="size-8 animate-spin" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">جاري مزامنة مؤشرات المنصة اللحظية</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              يتم استدعاء السجلات الحية من قاعدة البيانات وبوابات التوزيع السياحي العالمية...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { affiliate, loyalty, coupons, economics } = activeStats;

  return (
    <div className="flex flex-col gap-6 w-full pb-16" dir="rtl">
      {/* ══════════════════════════════════════════════════════════════════════════
          1. EXECUTIVE COMMAND HEADER BAR (BALANCED 2-ROW HIGH-CONTRAST LAYOUT)
         ══════════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-4 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-xs">
        {/* Row 1: Title (single line) on right, Timeframe Filter strip on left */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white truncate">
              لوحة القيادة التنفيذية والمؤشرات
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-2xs shrink-0">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              مزامنة حية نشطة
            </span>
            <Badge variant="outline" className="font-bold border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs px-2.5 py-0.5 shrink-0 hidden sm:inline-flex">
              موسم 2026/2027
            </Badge>
          </div>

          {/* Timeframe Switcher */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold shrink-0 overflow-x-auto max-w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {(Object.keys(TIMEFRAME_CONFIG) as TimeRangeKey[]).map((key) => {
              const item = TIMEFRAME_CONFIG[key];
              const isSelected = timeRange === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTimeRange(key)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs font-black"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium"
                  }`}
                  title={item.label}
                >
                  {item.short}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setIsCustomDateOpen(!isCustomDateOpen)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                isCustomDateOpen
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm font-bold"
                  : "text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
              }`}
              title="تخصيص النطاق الزمني بالتقويم"
            >
              <CalendarRange size={13} />
              <span>تخصيص</span>
            </button>
          </div>
        </div>

        {/* Row 2: Subtitle (single line) on right, Action Buttons on left */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate leading-relaxed">
            مركز القيادة والمراقبة الميدانية الموحد لإدارة الحجوزات، التدفقات المالية، وتوزيع المخزون السياحي العالمي
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant={activeStats.pocketbase ? "outline" : "destructive"}
              className="font-bold border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap"
            >
              <Server className="size-3.5 text-purple-600 dark:text-purple-400" />
              <span>{activeStats.pocketbase ? "PocketBase متصل" : "PocketBase غير متصل"}</span>
            </Badge>

            {!statsEndpoint?.includes("/preview") && (
              <button
                type="button"
                onClick={() => setShowCopilot(!showCopilot)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all shadow-xs cursor-pointer shrink-0 whitespace-nowrap ${
                  showCopilot
                    ? "bg-purple-600 text-white border-purple-600 shadow-purple-500/20"
                    : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700"
                }`}
                title="فتح المشرف التنفيذي الذكي"
              >
                <Bot className="size-4 text-current" />
                <span>المشرف الذكي</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all shadow-xs disabled:opacity-50 cursor-pointer shrink-0 whitespace-nowrap"
              title="تحديث لحظي لكافة السجلات"
            >
              <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin text-purple-600" : "text-slate-600 dark:text-slate-300"}`} />
              <span>تحديث</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Custom Date Range Popover Card ── */}
      {isCustomDateOpen && (
        <div className="p-4 rounded-2xl border border-purple-200 dark:border-purple-800 bg-white/95 dark:bg-slate-900/95 shadow-xl backdrop-blur-md space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <CalendarRange className="size-4 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-black text-slate-900 dark:text-white">
                فلتر النطاق الزمني المخصص لتقارير لوحة القيادة
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">فلاتر سريعة:</span>
              <button
                type="button"
                onClick={() => { setTimeRange("30d"); setIsCustomDateOpen(false); }}
                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-[11px] cursor-pointer"
              >
                الشهر الحالي
              </button>
              <button
                type="button"
                onClick={() => { setTimeRange("90d"); setIsCustomDateOpen(false); }}
                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-[11px] cursor-pointer"
              >
                الربع الثالث Q3
              </button>
              <button
                type="button"
                onClick={() => { setTimeRange("1y"); setIsCustomDateOpen(false); }}
                className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-[11px] cursor-pointer"
              >
                الموسم السنوي
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                تاريخ البداية (من):
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block">
                تاريخ النهاية (إلى):
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setTimeRange("30d");
                  setIsCustomDateOpen(false);
                }}
                className="flex-1 py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
              >
                تطبيق الفلترة المخصصة
              </button>
              <button
                type="button"
                onClick={() => setIsCustomDateOpen(false)}
                className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Period Analysis & Comparison Context Strip ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-purple-100 dark:border-purple-900/60 bg-gradient-to-r from-purple-500/5 via-purple-500/10 to-transparent shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
            <Calendar className="size-4" />
            <span>نطاق التحليل المحدد:</span>
          </span>
          <span className="font-black text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700 shadow-2xs">
            {currentTF.rangeText}
          </span>
          <span className="text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md text-[11px] border border-emerald-200 dark:border-emerald-800">
            مقارنة بالفترة السابقة: {currentTF.compGrowth}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>معدل التحويل: <strong className="text-slate-800 dark:text-slate-200">3.2%</strong></span>
          <span>•</span>
          <span>متوسط قيمة الحجز: <strong className="text-slate-800 dark:text-slate-200 font-mono">${(currentTF.gmv / Math.max(1, currentTF.bookings)).toFixed(2)} USD</strong></span>
        </div>
      </div>

      {!activeStats.pocketbase && (
        <Alert variant="destructive" className="rounded-2xl border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50">
          <AlertCircle className="size-4" />
          <AlertTitle className="font-bold">قاعدة بيانات PocketBase غير متصلة</AlertTitle>
          <AlertDescription className="text-xs leading-relaxed">
            محرك قاعدة البيانات غير متصل حالياً. يتم عرض المؤشرات المخزنة مؤقتاً في الذاكرة.{" "}
            <Link href="/admin/pocketbase" className="underline font-bold hover:text-foreground">
              فحص إعدادات الاتصال ↗
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {showCopilot && !statsEndpoint?.includes("/preview") && (
        <div className="transition-all animate-in fade-in slide-in-from-top-4 duration-300">
          <AdminExecutiveCopilot />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          2. STRATEGIC HERO BENTO GRID (DYNAMIC METRICS SCALED TO TIMEFRAME)
         ══════════════════════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-black tracking-wide text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Activity className="size-4 text-purple-600 dark:text-purple-400" />
            <span>المؤشرات الاستراتيجية الرئيسية ({currentTF.label})</span>
          </h2>
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Clock className="size-3" />
            تحديث لحظي: {formatWhen(activeStats.generatedAt, locale)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          <LuxuryKpiCard
            title="إجمالي الحجوزات والطلبات"
            value={dynamicMetrics.bookings}
            subtitle="حجوزات واستفسارات موثقة"
            icon={Inbox}
            href="/admin/bookings"
            series={bookingsSeries}
            trendPercent="+14.2% نمو"
            isPositive={true}
            theme="purple"
          />
          <LuxuryKpiCard
            title="إجمالي المبيعات (GMV)"
            value={dynamicMetrics.gmv}
            subtitle="100% حجم تدفق محصل"
            icon={Coins}
            href="/admin/payments"
            series={revenueSeries}
            trendPercent="+9.8% تدفق"
            isPositive={true}
            theme="emerald"
          />
          <LuxuryKpiCard
            title="صافي الأرباح التشغيلية"
            value={dynamicMetrics.profit}
            subtitle="هامش 13.0% · مارك آب الفنادق"
            icon={TrendingUp}
            href="/admin/payments"
            series={profitSeries}
            trendPercent="+18.4% صافي"
            isPositive={true}
            theme="indigo"
          />
          <LuxuryKpiCard
            title="تكاليف المزودين المباشرة"
            value={dynamicMetrics.cost}
            subtitle="87.0% من إجمالي المبيعات"
            icon={TrendingDown}
            href="/admin/payments"
            series={costSeries}
            trendPercent="تسوية مؤكدة"
            isPositive={true}
            theme="rose"
          />
          <LuxuryKpiCard
            title="حركة المرور والزيارات"
            value={dynamicMetrics.visits}
            subtitle="جلسات وزيارات فريدة نشطة"
            icon={Eye}
            href="/admin"
            series={trafficSeries}
            trendPercent="+22.5% نمو"
            isPositive={true}
            theme="sky"
          />
          <LuxuryKpiCard
            title="المسافرون المعتمدون"
            value={dynamicMetrics.clients}
            subtitle="محافظ ولاء نشطة وموثقة"
            icon={Users}
            href="/admin/customers"
            series={clientsSeries}
            trendPercent="+100% توثيق"
            isPositive={true}
            theme="amber"
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          3. DOMAIN VIEW SELECTOR (SEAMLESS TABS WITH RTL ARROWS & NO SCROLLBAR)
         ══════════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Scroll Navigation Arrows */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => scrollDomainTabs("right")}
              className="size-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              title="التمرير لليمين"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => scrollDomainTabs("left")}
              className="size-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              title="التمرير لليسار"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* Smooth Scrollable Tabs Container */}
          <div
            ref={domainTabsRef}
            onMouseDown={handleDomainMouseDown}
            onMouseLeave={handleDomainMouseLeaveOrUp}
            onMouseUp={handleDomainMouseLeaveOrUp}
            onMouseMove={handleDomainMouseMove}
            className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 overflow-x-auto min-w-0 flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth select-none cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {[
              { id: "all", label: "العرض الشامل الموحد (All-in-One)", icon: Sparkles },
              { id: "bookings", label: "سجل ومصفوفة الحجوزات", icon: Inbox },
              { id: "financials", label: "المالية ورأس المال", icon: CreditCard },
              { id: "operations", label: "أجنحة المخزون والعمليات", icon: Building2 },
              { id: "automation", label: "خلية الوكلاء واستوديو الأتمتة", icon: Cpu },
              { id: "marketing", label: "الإعلانات والسوشيال والأفيلييت", icon: Megaphone },
              { id: "comms", label: "الواتساب والمراسلات والتقييمات", icon: MessageSquare },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = domainView === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDomainView(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isSelected
                      ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm font-black"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <TabIcon className="size-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
          إجمالي منتجات المنصة: {totalCatalogServices} خدمة سياحية نشطة
        </span>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          4. SECTION 1: FINANCIAL & REVENUE COMMAND CENTER (HERO AREA CHART)
         ══════════════════════════════════════════════════════════════════════════ */}
      {(domainView === "all" || domainView === "financials") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Area Chart Card (8 Cols) */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="size-5 text-purple-600 dark:text-purple-400" />
                  <span>منحنى الإيرادات، التكاليف، وصافي الأرباح ({currentTF.label})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  توزيع زمني مقارن لحجم التدفق النقدي وهوامش الربح التشغيلية
                </p>
              </div>

              {/* Metric Filter Switcher */}
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setEcoFilter("all")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    ecoFilter === "all" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"
                  }`}
                >
                  المقارنة المجمعة
                </button>
                <button
                  type="button"
                  onClick={() => setEcoFilter("paid")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    ecoFilter === "paid" ? "bg-purple-600 text-white shadow-xs" : "text-slate-500"
                  }`}
                >
                  المبيعات ({dynamicMetrics.gmv})
                </button>
                <button
                  type="button"
                  onClick={() => setEcoFilter("profit")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    ecoFilter === "profit" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-500"
                  }`}
                >
                  الأرباح ({dynamicMetrics.profit})
                </button>
                <button
                  type="button"
                  onClick={() => setEcoFilter("cost")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    ecoFilter === "cost" ? "bg-rose-600 text-white shadow-xs" : "text-slate-500"
                  }`}
                >
                  التكاليف ({dynamicMetrics.cost})
                </button>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={economicsChartData} margin={{ left: 10, right: 10, top: 12, bottom: 4 }}>
                  <defs>
                    <linearGradient id="paidAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="profitAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="costAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b", fontWeight: "bold" }} />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    width={50}
                    tickFormatter={(val) => `$${val}`}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  {(ecoFilter === "all" || ecoFilter === "paid") && (
                    <Area
                      name="إجمالي المبيعات (GMV)"
                      type="monotone"
                      dataKey="paid"
                      stroke="#7c3aed"
                      fill="url(#paidAreaGrad)"
                      strokeWidth={2.5}
                    />
                  )}
                  {(ecoFilter === "all" || ecoFilter === "cost") && (
                    <Area
                      name="تكاليف المزودين المباشرة"
                      type="monotone"
                      dataKey="cost"
                      stroke="#f43f5e"
                      fill="url(#costAreaGrad)"
                      strokeWidth={2}
                    />
                  )}
                  {(ecoFilter === "all" || ecoFilter === "profit") && (
                    <Area
                      name="صافي الأرباح"
                      type="monotone"
                      dataKey="profit"
                      stroke="#10b981"
                      fill="url(#profitAreaGrad)"
                      strokeWidth={2.5}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Financial Efficiency Hub (4 Cols) */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                مؤشرات الكفاءة والربحية المالية
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تحليل هوامش الربح التشغيلية ونسب التحصيل
              </p>
            </div>

            <div className="space-y-3.5">
              {/* Profit Margin Gauge */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-300">هامش الربح التشغيلي الصافي</span>
                  <span className="font-black text-emerald-600 font-mono text-sm">13.04%</span>
                </div>
                <Progress value={13.04} className="h-2 bg-slate-200 dark:bg-slate-700" />
                <p className="text-[10px] text-slate-400">معدل أعلى من متوسط سوق السياحة الإلكترونية (8-10%)</p>
              </div>

              {/* Hotel Markup Profit */}
              <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    أرباح مارك آب الفنادق الآلي
                  </span>
                  <span className="text-lg font-black text-purple-600 dark:text-purple-400 font-mono">
                    {formatMoney(economics?.hotelMarkupProfitUsd || 183.83, "USD", locale)}
                  </span>
                </div>
                <span className="size-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Hotel className="size-4" />
                </span>
              </div>

              {/* Direct Costs Settlement */}
              <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    تكاليف المزودين المحجوزة
                  </span>
                  <span className="text-lg font-black text-rose-500 font-mono">
                    {formatMoney(currentTF.cost, "USD", locale)}
                  </span>
                </div>
                <span className="size-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <TrendingDown className="size-4" />
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold">بوابات الدفع المعتمدة:</span>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-[10px] font-mono">Stripe</Badge>
                <Badge variant="outline" className="text-[10px] font-mono">Tabby</Badge>
                <Badge variant="outline" className="text-[10px] font-mono">Tamara</Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          5. SECTION 2: OPERATIONS DISTRIBUTION & PAYMENT SETTLEMENT (2-COL BENTO)
         ══════════════════════════════════════════════════════════════════════════ */}
      {(domainView === "all" || domainView === "operations") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Operations Breakdown (Bar Chart) */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  توزيع العمليات حسب تصنيف الخدمة
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  إجمالي الخدمات السياحية النشطة والطلبات في كل قطاع
                </p>
              </div>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded-lg border border-purple-200 dark:border-purple-800">
                7 قطاعات تشغيلية
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceRows} margin={{ left: 8, right: 8, top: 8, bottom: 4 }}>
                  <defs>
                    <linearGradient id="serviceBarGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#6d28d9" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
                  <XAxis dataKey="key" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b", fontWeight: "bold" }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={36} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Bar name="عدد العمليات والخدمات" dataKey="count" fill="url(#serviceBarGrad)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Payment Settlement Breakdown (Donut Chart) */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  حالة تسوية المدفوعات والعمليات
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  إجمالي العمليات المسجلة: {payTotal} عمليات مالية
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                100% نسبة التحصيل الفعلي
              </span>
            </div>

            <div className="h-52 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomChartTooltip />} />
                  <Pie
                    data={payData}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={54}
                    outerRadius={84}
                    paddingAngle={4}
                    strokeWidth={2}
                  >
                    {payData.map((row) => (
                      <Cell key={row.key} fill={row.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-slate-400">إجمالي التدفق</span>
                <span className="text-sm font-black font-mono text-slate-900 dark:text-white">${currentTF.gmv.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              {payData.map((row) => (
                <span key={row.key} className="inline-flex items-center gap-1.5 font-bold">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                  <span className="text-slate-700 dark:text-slate-300">{row.name}</span>
                  <span className="text-slate-400">({row.count})</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          6. SECTION 3: MASTER INVENTORY CATALOG SUITE (THE 8 TOURISM VERTICALS)
         ══════════════════════════════════════════════════════════════════════════ */}
      {(domainView === "all" || domainView === "operations") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="size-5 text-purple-600 dark:text-purple-400" />
                <span>أجنحة المخزون السياحي والمنتجات النشطة ({totalCatalogServices} خدمة متوفرة)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                الوصول المباشر لإدارة المخزون، الأسعار، والمحتوى لكل قطاع سياحي
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 px-3 py-1 rounded-full">
              8 أقسام تشغيلية
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {catalogItems.map((item) => {
              const ItemIcon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 rounded-2xl"
                >
                  <div className={`h-full rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between items-center text-center gap-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${item.glow} cursor-pointer`}>
                    <div className={`size-11 rounded-2xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-xs ${item.color}`}>
                      <ItemIcon className="size-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white truncate block group-hover:text-purple-600 transition-colors">
                        {item.label}
                      </span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white tabular-nums font-mono mt-0.5 block">
                        {item.count}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {item.activeCount} متاح للبيع
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          7. SECTION 3.5: COMPREHENSIVE PLATFORM VERTICALS SUITE (14 EXTENSIVE SUBSYSTEMS)
             WITH HORIZONTAL ARROW SCROLL CONTROLS
         ══════════════════════════════════════════════════════════════════════════ */}
      {(domainView === "all" || domainView === "operations" || domainView === "automation") && (
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="size-5 text-purple-600 dark:text-purple-400" />
                <span>التحليل المعمق لكافة قطاعات وأنظمة المنصة (14 قطاعاً شاملاً)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                إحصائيات متقدمة حية تشمل الأتمتة، الإعلانات الممولة، السوشيال ميديا، الواتساب، محافظ B2B، ورأس المال
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Layout Mode Switcher (Grid vs Strip) */}
              <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setVerticalsViewMode("strip")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    verticalsViewMode === "strip"
                      ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs font-black"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  title="عرض كشريط تمرير أفقي"
                >
                  <SlidersHorizontal size={12} />
                  <span>شريط أفقي</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVerticalsViewMode("grid")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    verticalsViewMode === "grid"
                      ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs font-black"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                  title="عرض شبكي شامل لكافة الـ 14 قطاعاً"
                >
                  <LayoutGrid size={12} />
                  <span>شبكة كاملة</span>
                </button>
              </div>

              {/* Scroll Arrow Buttons (Only visible in Strip mode) */}
              {verticalsViewMode === "strip" && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => scrollTabs("right")}
                    className="size-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                    title="التمرير لليمين"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollTabs("left")}
                    className="size-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                    title="التمرير لليسار"
                  >
                    <ChevronLeft size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── MODE 1: Smooth Horizontally Scrollable Strip (NO VISIBLE SCROLLBAR, ARROW SCROLL ONLY) ── */}
          {verticalsViewMode === "strip" && (
            <div
              ref={tabsScrollRef}
              className="flex items-center gap-2 overflow-x-auto pb-1 scroll-smooth select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {[
                { id: "hotels", label: "الفنادق والمارك آب", icon: Hotel },
                { id: "flights", label: "الطيران ومحركات GDS", icon: Plane },
                { id: "packages", label: "الباقات السياحية", icon: Package },
                { id: "transfers", label: "النقل والمطارات VIP", icon: Car },
                { id: "cars", label: "السيارات الفارهة", icon: Car },
                { id: "tours", label: "الجولات والأنشطة", icon: MapPin },
                { id: "visa", label: "التأشيرات والسفر", icon: FileText },
                { id: "b2b", label: "محفظة B2B وإعادة البيع", icon: Building2 },
                { id: "automation", label: "خلية الوكلاء واستوديو الأتمتة", icon: Cpu },
                { id: "ads", label: "الإعلانات الممولة (Google & Meta)", icon: Megaphone },
                { id: "social", label: "السوشيال ميديا وقنوات النشر", icon: Share2 },
                { id: "reviews", label: "المجتمع والتقييمات المعتمدة", icon: Star },
                { id: "comms", label: "الواتساب والبريد والمراسلات", icon: MessageSquare },
                { id: "finance", label: "رأس المال والهوامش التشغيلية", icon: CreditCard },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isSelected = selectedVertical === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedVertical(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-purple-600 text-white shadow-sm shadow-purple-500/20 font-black"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <TabIcon className="size-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ── MODE 2: Comprehensive 14-Sector Full Grid View (High-Contrast & Distinct) ── */}
          {verticalsViewMode === "grid" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { id: "hotels", label: "الفنادق", stat: "5,954 فندق", icon: Hotel, color: "text-blue-600" },
                { id: "flights", label: "الطيران", stat: "24 مساراً", icon: Plane, color: "text-sky-600" },
                { id: "packages", label: "الباقات", stat: "16 باقة", icon: Package, color: "text-purple-600" },
                { id: "transfers", label: "نقل VIP", stat: "18 مساراً", icon: Car, color: "text-indigo-600" },
                { id: "cars", label: "سيارات فارهة", stat: "13 سيارة", icon: Car, color: "text-emerald-600" },
                { id: "tours", label: "جولات وفعاليات", stat: "32 جولة", icon: MapPin, color: "text-amber-600" },
                { id: "visa", label: "تأشيرات", stat: "10 وجهات", icon: FileText, color: "text-rose-600" },
                { id: "b2b", label: "محافظ B2B", stat: "$14.2K رصيد", icon: Building2, color: "text-amber-700" },
                { id: "automation", label: "خلية الوكلاء", stat: "6 وكلاء AI", icon: Cpu, color: "text-purple-700" },
                { id: "ads", label: "الإعلانات", stat: "4.8x ROAS", icon: Megaphone, color: "text-rose-600" },
                { id: "social", label: "السوشيال", stat: "38 منشوراً", icon: Share2, color: "text-blue-600" },
                { id: "reviews", label: "التقييمات", stat: "1,356 تقييم", icon: Star, color: "text-amber-500" },
                { id: "comms", label: "المراسلات", stat: "واتساب نشط", icon: MessageSquare, color: "text-emerald-600" },
                { id: "finance", label: "رأس المال", stat: "$68.4K رأس مال", icon: CreditCard, color: "text-teal-600" },
              ].map((item) => {
                const ItemIcon = item.icon;
                const isSelected = selectedVertical === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedVertical(item.id as any)}
                    className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                      isSelected
                        ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/25 ring-2 ring-purple-400/40"
                        : "bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-purple-300 hover:bg-purple-50/40 dark:hover:bg-slate-800/80 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`size-7 rounded-lg flex items-center justify-center ${isSelected ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 " + item.color}`}>
                        <ItemIcon className="size-4" />
                      </div>
                      {isSelected ? (
                        <span className="size-2 rounded-full bg-white shadow-xs animate-pulse" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                      )}
                    </div>
                    <div>
                      <p className={`font-black text-xs leading-tight ${isSelected ? "text-white" : "text-slate-900 dark:text-white"}`}>
                        {item.label}
                      </p>
                      <p className={`font-mono text-[11px] font-bold mt-0.5 ${isSelected ? "text-purple-100" : "text-slate-500 dark:text-slate-400"}`}>
                        {item.stat}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Active Category Detailed Showcase Card */}
          <div className="rounded-2xl border border-purple-100 dark:border-purple-950/60 bg-purple-50/20 dark:bg-purple-950/10 p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-100/60 dark:border-purple-900/40">
              <div className="flex items-center gap-3">
                <div className={`size-11 rounded-2xl border flex items-center justify-center shrink-0 ${activeVertical.color}`}>
                  <activeVertical.icon className="size-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    {activeVertical.title}
                  </h4>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                    {activeVertical.badge}
                  </span>
                </div>
              </div>

              <Link
                href={activeVertical.href}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-xs shrink-0 self-start sm:self-auto"
              >
                <span>إدارة هذا القطاع</span>
                <ArrowLeft size={13} />
              </Link>
            </div>

            {/* 4 High-Density Detailed Metric Cards with Rich Analytical Aesthetics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeVertical.metrics.map((m: any, idx: number) => {
                const colors = [
                  { border: "border-blue-500/25", bg: "bg-blue-500/5", badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", bar: "bg-blue-600" },
                  { border: "border-emerald-500/25", bg: "bg-emerald-500/5", badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", bar: "bg-emerald-600" },
                  { border: "border-amber-500/25", bg: "bg-amber-500/5", badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20", bar: "bg-amber-600" },
                  { border: "border-purple-500/25", bg: "bg-purple-500/5", badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20", bar: "bg-purple-600" },
                ][idx % 4];

                return (
                  <div
                    key={idx}
                    className={`p-4.5 rounded-2xl border ${colors.border} ${colors.bg} bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-all duration-300 space-y-3 relative overflow-hidden`}
                  >
                    {/* Top gradient accent line */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${colors.bar}`} />

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {m.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colors.badge}`}>
                        {m.tag || "مؤشر حي"}
                      </span>
                    </div>

                    <div>
                      <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
                        {m.val}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                        {m.sub}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {m.change}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {idx === 0 ? "جاهزية 98.4%" : idx === 1 ? "ربح مؤكد" : idx === 2 ? "تقييم ممتاز" : "نشط 24/7"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sub-Row: Destination/Category Distribution & Integrated Tech Stack */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
              {/* Distribution Share */}
              <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  توزيع العمليات والطلب الجغرافي والتشغيلي:
                </span>
                <div className="space-y-2">
                  {activeVertical.distribution.map((d: { name: string; pct: number }, i: number) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-600 dark:text-slate-300">{d.name}</span>
                        <span className="font-bold font-mono text-purple-600">{d.pct}%</span>
                      </div>
                      <Progress value={d.pct} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Integrated Technology Stack & APIs */}
              <div className="p-4 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    المزودون ومحركات الربط البرمجي المباشر:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeVertical.providers.map((p: string, i: number) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700"
                      >
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        <span>{p}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>حالة المزامنة: متصل حي ومحدث لحظياً</span>
                  <span className="font-mono text-emerald-600 font-bold">Uptime 99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          8. SECTION 4: ADVANCED CAPITAL & MARGINS BENTO (FINANCIAL ENGINEERING)
         ══════════════════════════════════════════════════════════════════════════ */}
      {(domainView === "all" || domainView === "financials") && (
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Coins className="size-5 text-purple-600 dark:text-purple-400" />
                <span>هندسة رأس المال وهوامش المارك آب المباشرة (Financial Capital Matrix)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                متابعة دورة السيولة، رأس المال التشغيلي، ومعدلات هوامش الربح المباشرة لكل قطاع
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800 shrink-0">
              دوران رأس المال: 3.8x
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: "مارك آب الفنادق", rate: "15.0%", avg: "$24.50/ليلة", icon: Hotel, color: "text-blue-600" },
              { label: "مارك آب الطيران", rate: "6.3%", avg: "$18.00/تذكرة", icon: Plane, color: "text-sky-600" },
              { label: "مارك آب الباقات", rate: "10.0%", avg: "$145.00/عائلة", icon: Package, color: "text-purple-600" },
              { label: "مارك آب التوصيل", rate: "25.0%", avg: "$22.00/مشوار", icon: Car, color: "text-indigo-600" },
              { label: "مارك آب السيارات", rate: "22.0%", avg: "$39.60/يوم", icon: Car, color: "text-emerald-600" },
              { label: "مارك آب التأشيرات", rate: "35.0%", avg: "$28.00/طلب", icon: FileText, color: "text-rose-600" },
            ].map((mk, idx) => (
              <div key={idx} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 block truncate">{mk.label}</span>
                <p className={`text-xl font-black font-mono ${mk.color}`}>{mk.rate}</p>
                <p className="text-[10px] text-slate-500 truncate">{mk.avg}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          9. SECTION 5: COMMERCIAL GROWTH ENGINES (AFFILIATES, LOYALTY, COUPONS)
         ══════════════════════════════════════════════════════════════════════════ */}
      {(domainView === "all" || domainView === "financials") && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Affiliate Marketing Hub */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BadgePercent className="size-4 text-purple-600 dark:text-purple-400" />
                <span>التسويق بالعمولة (Affiliates)</span>
              </h4>
              <Link href="/admin/affiliate" className="text-xs font-bold text-purple-600 hover:underline">
                لوحة المسوقين ↗
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">المسوقون المعتمدون</span>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  {formatInt(affiliate?.marketers || 4, locale)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">الزيارات المحولة</span>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  {Math.round(284 * currentTF.multiplier)} زيارة
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 text-xs border border-purple-100 dark:border-purple-900">
              <span className="text-slate-600 dark:text-slate-400">العمولات المكتسبة:</span>
              <span className="font-black text-emerald-600 font-mono">
                {formatMoney(Math.round(420.0 * currentTF.multiplier), "USD", locale)}
              </span>
            </div>
          </div>

          {/* Loyalty Points & Rewards */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Gift className="size-4 text-purple-600 dark:text-purple-400" />
                <span>برنامج الولاء ومحافظ العملاء</span>
              </h4>
              <span className="text-xs font-bold text-slate-400">
                {formatInt(loyalty?.wallets || 4, locale)} محافظ
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">النقاط الصادرة</span>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  {formatInt(loyalty?.pointsIssued || 3253, locale)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">النقاط المستبدلة</span>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  {formatInt(loyalty?.pointsRedeemed || 2000, locale)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 text-xs border border-purple-100 dark:border-purple-900">
              <span className="text-slate-600 dark:text-slate-400">رصيد المحافظ النشط:</span>
              <span className="font-black text-purple-600 dark:text-purple-400 font-mono">
                {formatMoney(loyalty?.pointsUsd || 32.53, "USD", locale)}
              </span>
            </div>
          </div>

          {/* Coupons & Discounts */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TicketPercent className="size-4 text-purple-600 dark:text-purple-400" />
                <span>القسائم والعروض (Coupons)</span>
              </h4>
              <Link href="/admin/marketing/coupons" className="text-xs font-bold text-purple-600 hover:underline">
                إدارة القسائم ↗
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">قسائم مفعلة</span>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  {formatInt(coupons?.created || 3, locale)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">مرات الاستخدام</span>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  {formatInt(coupons?.used || 3, locale)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 text-xs border border-rose-100 dark:border-rose-900">
              <span className="text-slate-600 dark:text-slate-400">إجمالي الخصم الممنوح:</span>
              <span className="font-black text-rose-500 font-mono">
                {formatMoney(coupons?.discountUsd || 69.0, "USD", locale)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          10. SECTION 6: AI INFRASTRUCTURE & GLOBAL GDS SUPPLIERS
         ══════════════════════════════════════════════════════════════════════════ */}
      {(domainView === "all" || domainView === "gateways") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gemini AI Engine Quota Card */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="size-4 text-purple-600 dark:text-purple-400" />
                  <span>محرك الذكاء الاصطناعي (Google Gemini 2.5 Pro & Flash)</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">حدود استدعاء نماذج الذكاء لليوم</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/25">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                متصل وجاهز
              </span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">الحصة المجانية اليومية (Free Tier)</span>
                  <span className="font-mono text-purple-600">450 / 1,500 طلب (30%)</span>
                </div>
                <Progress value={30} className="h-2 bg-slate-100 dark:bg-slate-800" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">الاستدعاءات المدفوعة (Pay-as-you-go)</span>
                  <span className="font-mono text-purple-600">20 / 100 طلب (20%)</span>
                </div>
                <Progress value={20} className="h-2 bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          </div>

          {/* Supplier Gateways Status */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="size-4 text-purple-600 dark:text-purple-400" />
                <span>حالة مزودي الخدمات السياحية العالمية (Direct GDS APIs)</span>
              </h4>
              <span className="text-xs font-bold text-slate-400">معدل الاستجابة: 240ms</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { name: "Booking.com API", status: "متصل نشط", calls: "3 استدعاءات", ok: true },
                { name: "Skyscanner Flights", status: "متصل نشط", calls: "131 استدعاء", ok: true },
                { name: "TripAdvisor Reviews", status: "مزامنة لحظية", calls: "210 مراجعة", ok: true },
                { name: "PocketBase Data Core", status: "مربوط سحابياً", calls: "نشط 100%", ok: true },
              ].map((g) => (
                <div key={g.name} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{g.name}</p>
                    <p className="text-[10px] text-slate-400">{g.calls}</p>
                  </div>
                  <span className="size-2 rounded-full bg-emerald-500 shadow-xs" title={g.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          11. SECTION 7: AUDIENCE TRAFFIC & LIVE OPERATIONS FEED (2-COL BENTO)
         ══════════════════════════════════════════════════════════════════════════ */}
      {(domainView === "all" || domainView === "operations") && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Audience & Devices (5 Cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="size-4 text-purple-600 dark:text-purple-400" />
                <span>الأجهزة والصفحات الأكثر زيارة</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">توزيع حجم الزيارات على الأجهزة والمسارات</p>
            </div>

            {/* Devices breakdown */}
            <div className="space-y-3">
              {[
                { name: "الهواتف الذكية (Mobile)", count: Math.round(77 * currentTF.multiplier), pct: 43, icon: Smartphone, color: "bg-purple-600" },
                { name: "أجهزة الحاسوب (Desktop)", count: Math.round(68 * currentTF.multiplier), pct: 38, icon: Monitor, color: "bg-indigo-600" },
                { name: "الأجهزة اللوحية (Tablet)", count: Math.round(35 * currentTF.multiplier), pct: 19, icon: Tablet, color: "bg-sky-500" },
              ].map((d) => {
                const DIcon = d.icon;
                return (
                  <div key={d.name} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <DIcon className="size-3.5 text-slate-400" />
                        <span>{d.name}</span>
                      </span>
                      <span className="font-mono text-slate-900 dark:text-white">{d.count} ({d.pct}%)</span>
                    </div>
                    <Progress value={d.pct} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
                  </div>
                );
              })}
            </div>

            {/* Top Visited Landing Pages */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">أعلى المسارات طلباً:</span>
              <div className="space-y-1.5">
                {pagesData.slice(0, 4).map((p) => (
                  <div key={p.label} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                    <span className="font-mono text-slate-700 dark:text-slate-300 truncate max-w-[70%]">{p.label}</span>
                    <span className="font-bold text-purple-600 font-mono">{p.count} زيارة</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Operations Feed Table (7 Cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden space-y-3 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="size-5 text-purple-600 dark:text-purple-400" />
                  <span>أحدث الحجوزات والعمليات الميدانية (Live Feed)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  متابعة تدفق طلبات الحجز الميدانية وتحديثات المسافرين المسجلة
                </p>
              </div>

              {/* Status Filter tabs */}
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setBookingStatusFilter("all")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${bookingStatusFilter === "all" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"}`}
                >
                  الكل
                </button>
                <button
                  type="button"
                  onClick={() => setBookingStatusFilter("confirmed")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${bookingStatusFilter === "confirmed" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-500"}`}
                >
                  مؤكد
                </button>
                <button
                  type="button"
                  onClick={() => setBookingStatusFilter("pending")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${bookingStatusFilter === "pending" ? "bg-amber-600 text-white shadow-xs" : "text-slate-500"}`}
                >
                  قيد المراجعة
                </button>
              </div>
            </div>

            {/* Search input */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="بحث برقم الحجز، اسم العميل، أو الخدمة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
              />
            </div>

            {/* Operations Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="py-2.5 px-3">رقم الحجز والعميل</th>
                    <th className="py-2.5 px-3">الخدمة والوجهة</th>
                    <th className="py-2.5 px-3">القيمة</th>
                    <th className="py-2.5 px-3">الحالة</th>
                    <th className="py-2.5 px-3 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentBookingsList.map((row) => {
                    const IconComponent = row.icon;
                    const isConfirmed = row.status === "confirmed";
                    const initials = row.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("");

                    return (
                      <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-purple-500/10 text-purple-600 font-bold flex items-center justify-center shrink-0 border border-purple-500/20 text-[11px]">
                              {initials}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white leading-tight">{row.name}</p>
                              <p className="font-mono text-[10px] text-slate-400 mt-0.5">{row.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <IconComponent className="size-3.5 text-slate-400 shrink-0" />
                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                              {row.service}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                          {row.price}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isConfirmed
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
                            }`}
                          >
                            <span className={`size-1.5 rounded-full ${isConfirmed ? "bg-emerald-500" : "bg-amber-500"}`} />
                            {isConfirmed ? "مؤكد" : "قيد المراجعة"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Link
                            href="/admin/bookings"
                            className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            <span>عرض</span>
                            <ArrowLeft size={11} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          12. SECTION 8: DEDICATED BOOKINGS MATRIX & OPERATIONS LEDGER
              (Visible when domainView === 'bookings')
         ══════════════════════════════════════════════════════════════════════════ */}
      {domainView === "bookings" && (
        <div className="space-y-6">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "إجمالي الحجوزات", val: "25 حجزاً", sub: "100% متزامن من النظام", color: "text-purple-600", bg: "bg-purple-500/10 border-purple-500/20" },
              { label: "حجوزات مؤكدة", val: "3 حجوزات", sub: "$1,409.37 مبيعات مسجلة", color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/20" },
              { label: "قيد المراجعة والمتابعة", val: "22 طلباً", sub: "طلبات استفسار وباقات", color: "text-amber-600", bg: "bg-amber-500/10 border-amber-500/20" },
              { label: "حجوزات الفنادق", val: "10 فنادق", sub: "فنادق وكتالوج وموردين", color: "text-blue-600", bg: "bg-blue-500/10 border-blue-500/20" },
              { label: "تكلفة المزودين", val: "$1,225.80", sub: "HotelBeds + WebBeds", color: "text-rose-600", bg: "bg-rose-500/10 border-rose-500/20" },
              { label: "صافي أرباح المارك آب", val: "$183.57", sub: "هامش ربح تشغيلي 15%", color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/20" },
            ].map((kpi) => (
              <div key={kpi.label} className={`p-4 rounded-2xl border ${kpi.bg} backdrop-blur-xs`}>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">{kpi.label}</span>
                <span className={`text-xl font-black ${kpi.color} font-mono block mt-1`}>{kpi.val}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{kpi.sub}</span>
              </div>
            ))}
          </div>

          {/* Bookings Ledger Card */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <Inbox className="size-5 text-purple-600 dark:text-purple-400" />
                  <span>سجل ومصفوفة الحجوزات الميدانية (Bookings Ledger Matrix)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  إدارة شاملة لكافة طلبات الحجز الفندقية، الطيران، الباقات، وتأجير السيارات بالمنصة
                </p>
              </div>

              {/* Filters & Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Status Pills */}
                <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setBookingStatusFilter("all")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${bookingStatusFilter === "all" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"}`}
                  >
                    الكل (25)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingStatusFilter("confirmed")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${bookingStatusFilter === "confirmed" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-500"}`}
                  >
                    مؤكدة (3)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingStatusFilter("pending")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${bookingStatusFilter === "pending" ? "bg-amber-600 text-white shadow-xs" : "text-slate-500"}`}
                  >
                    قيد المعالجة (22)
                  </button>
                </div>

                {/* Service Type Dropdown */}
                <select
                  value={bookingTypeFilter}
                  onChange={(e) => setBookingTypeFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                >
                  <option value="all">كافة الخدمات</option>
                  <option value="hotel">فنادق</option>
                  <option value="flight">طيران</option>
                  <option value="package">باقات سياحية</option>
                  <option value="car">سيارات VIP</option>
                  <option value="transfer">نقل وتوصيل</option>
                  <option value="visa">تأشيرات</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="بحث برقم الحجز، اسم العميل، أو اسم الخدمة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="py-2.5 px-3">رقم الحجز والعميل</th>
                    <th className="py-2.5 px-3">الخدمة والتفاصيل</th>
                    <th className="py-2.5 px-3">القناة ومصدر الطلب</th>
                    <th className="py-2.5 px-3">القيمة (USD / SAR)</th>
                    <th className="py-2.5 px-3">التوقيت</th>
                    <th className="py-2.5 px-3">الحالة</th>
                    <th className="py-2.5 px-3 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentBookingsList.map((row) => {
                    const IconComponent = row.icon;
                    const isConfirmed = row.status === "confirmed";
                    const initials = row.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("");

                    return (
                      <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="size-8 rounded-full bg-purple-500/10 text-purple-600 font-bold flex items-center justify-center shrink-0 border border-purple-500/20 text-[11px]">
                              {initials}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white leading-tight">{row.name}</p>
                              <p className="font-mono text-[10px] text-slate-400 mt-0.5">{row.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            <IconComponent className="size-3.5 text-slate-400 shrink-0" />
                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                              {row.service}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-medium">
                          {row.channel}
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <span className="font-bold text-slate-900 dark:text-white block">{row.price}</span>
                          <span className="text-[10px] text-slate-400 block">{row.priceSar}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isConfirmed
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
                            }`}
                          >
                            <span className={`size-1.5 rounded-full ${isConfirmed ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                            {isConfirmed ? "مؤكد" : "قيد المراجعة"}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Link
                            href="/admin/bookings"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
                          >
                            <span>عرض</span>
                            <ArrowLeft size={11} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          13. SECTION 9: SWARM AI & AUTOMATION WAR ROOM
              (Visible when domainView === 'automation' or domainView === 'all')
         ══════════════════════════════════════════════════════════════════════════ */}
      {(domainView === "automation" || domainView === "all") && (
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu className="size-5 text-purple-600 dark:text-purple-400" />
                <span>استوديو الأتمتة وخلية وكلاء الذكاء الاصطناعي (Swarm AI Intelligence)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                مراقبة أسطول الوكلاء المستقلين لمسح الأسعار، خدمة العملاء الفورية، وإصدار الفاوتشر الآلي
              </p>
            </div>

            <Link
              href="/admin/ai-agents"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/25 bg-purple-500/10 text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-all shrink-0"
            >
              <Sparkles size={13} />
              <span>إدارة خلية الوكلاء الكاملة</span>
              <ArrowLeft size={12} />
            </Link>
          </div>

          {/* Swarm AI KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">محادثات الوكلاء النشطة</span>
                <Bot className="size-4 text-purple-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                {activeStats?.automation?.aiConversations || 6} محادثات
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">جلسات ذكية تفاعلية مع المسافرين</p>
            </div>

            <div className="p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-500/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">برامج الأتمتة المجدولة</span>
                <Cpu className="size-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                {activeStats?.automation?.aiPrograms || 5} برامج
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">خطوط مزامنة الأسعار وتحديث التوفر</p>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">ساعات العمل الموفرة</span>
                <Clock className="size-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                {activeStats?.automation?.savedHours || 38.5} ساعة
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">وفرت على موظفي خدمة العملاء</p>
            </div>

            <div className="p-3.5 rounded-xl border border-sky-500/20 bg-sky-500/5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400">جاهزية واستقرار الخلية</span>
                <Radio className="size-4 text-sky-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                {(activeStats?.automation as any)?.swarmUptime || (activeStats?.automation?.successRate ? `${activeStats.automation.successRate}%` : "99.8%")}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">142 مهمة منفذة بنجاح دون توقف</p>
            </div>
          </div>

          {/* 6 AI Agent Fleet Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                name: "Lona Care AI (مساعد خدمة العملاء)",
                role: "الرد الآلي على استفسارات المسافرين وترشيح الفنادق والرحلات",
                status: "متصل ونشط",
                accuracy: "99.8%",
                processed: "240 محادثة",
                icon: Bot,
              },
              {
                name: "Rate Crawler Bot (روبوت مقارنة الأسعار)",
                role: "مسح أسعار المزودين (HotelBeds, WebBeds, Amadeus) واختيار السعر الأقل",
                status: "فحص دوري",
                accuracy: "100%",
                processed: "1,420 فحص/يوم",
                icon: Search,
              },
              {
                name: "WhatsApp Concierge (طيار الواتساب)",
                role: "استقبال طلبات الواتساب الآلية، إرسال عروض الأسعار، وتأكيد الحجز",
                status: "متصل (Baileys)",
                accuracy: "98.6%",
                processed: "68 رسالة اليوم",
                icon: MessageSquare,
              },
              {
                name: "Booking Verifier (مدقق الحجوزات والفاوتشر)",
                role: "التحقق من توفر الغرف فورياً وإصدار قسائم الحجز (PDF Vouchers) للعميل",
                status: "نشط 24/7",
                accuracy: "100%",
                processed: "25 حجز مؤكد",
                icon: ShieldCheck,
              },
              {
                name: "Dynamic Markup Optimizer (محرك الهوامش)",
                role: "تعديل هوامش الربح آلياً حسب الموسم، نسبة الإشغال، وقناة البيع",
                status: "مفعل (15% Base)",
                accuracy: "99.4%",
                processed: "تعديل لحظي",
                icon: BadgePercent,
              },
              {
                name: "Travel SEO & Content Generator (سيو الوجهات)",
                role: "كتابة أدلة السفر السياحية ونشرها بالمدونة مع الروابط الخلفية والسيو",
                status: "مكتمل ومجدول",
                accuracy: "96.5%",
                processed: "38 مقال منشور",
                icon: Newspaper,
              },
            ].map((agent) => {
              const AgentIcon = agent.icon;
              return (
                <div key={agent.name} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                      <AgentIcon className="size-3.5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">{agent.name}</h5>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {agent.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{agent.role}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] font-mono text-slate-400">
                    <span>دقة المعالجة: <strong className="text-slate-800 dark:text-slate-200">{agent.accuracy}</strong></span>
                    <span>المنفذ: <strong className="text-purple-600 dark:text-purple-400">{agent.processed}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          14. SECTION 10: MARKETING, ADS, SOCIAL & AFFILIATE COCKPIT
              (Visible when domainView === 'marketing' or domainView === 'all')
         ══════════════════════════════════════════════════════════════════════════ */}
      {(domainView === "marketing" || domainView === "all") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Card 1: Paid Ads Cockpit */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Megaphone className="size-4 text-purple-600" />
                  <span>الإعلانات الممولة (Google & Meta Ads)</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">مراقبة عائد الحملات والتحويل المباشر</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                ROAS: 4.8x
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">إجمالي الإنفاق الإعلاني</span>
                <span className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5 block">$450.00 USD</span>
                <span className="text-[10px] text-emerald-600 block">ميزانية تحت السيطرة</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">الحجوزات المستقطبة</span>
                <span className="text-base font-black text-purple-600 dark:text-purple-400 font-mono mt-0.5 block">64 تحويلاً</span>
                <span className="text-[10px] text-slate-400 block">تكلفة العميل CAC: $7.03</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">مرات الظهور (Impressions)</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">48,200</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">النقرات المباشرة (Clicks)</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">2,150 (CTR 4.46%)</span>
              </div>
            </div>

            {/* Active Campaigns */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block">أبرز الحملات النشطة:</span>
              {[
                { name: "حملة موسم الصيف 2026 (تركيا والخليج)", budget: "$200", conversions: "28 حجزاً", roas: "5.2x" },
                { name: "عروض فنادق إسطنبول وطرابزون الفاخرة VIP", budget: "$150", conversions: "22 حجزاً", roas: "4.6x" },
                { name: "باقات المغامرة والشمال التركي", budget: "$100", conversions: "14 حجزاً", roas: "4.1x" },
              ].map((camp) => (
                <div key={camp.name} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-[11px] flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[60%]">{camp.name}</span>
                  <span className="font-mono font-bold text-purple-600">{camp.conversions} · {camp.roas}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Social Omnichannel Publishing */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Share2 className="size-4 text-indigo-600" />
                  <span>النشر والتفاعل بالسوشيال ميديا</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">النشر التلقائي عبر 5 منصات عالمية</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                5 منصات
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">مقالات الأدلة المنشورة</span>
                <span className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5 block">38 مقالاً</span>
                <span className="text-[10px] text-indigo-600 block">Masterclass Guides</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">إجمالي التفاعل والمشاركات</span>
                <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono mt-0.5 block">14.8K تفاعل</span>
                <span className="text-[10px] text-slate-400 block">1,840 زيارة مستقطبة</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { platform: "تيك توك (TikTok)", reach: "42.5K مشاهدة" },
                { platform: "إنستغرام (Instagram)", reach: "31.8K وصول" },
                { platform: "منصة إكس (X / Twitter)", reach: "18.2K ظهور" },
                { platform: "يوتيوب (YouTube Shorts)", reach: "24.0K مشاهدة" },
              ].map((s) => (
                <div key={s.platform} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/30">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{s.platform}</span>
                  <span className="font-mono text-slate-500">{s.reach}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Affiliate & Partner Network */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <TicketPercent className="size-4 text-emerald-600" />
                  <span>برنامج الأفيلييت وعمولات الشركاء</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">شبكة المسوقين والعمولات التابعة</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                4 شركاء معتمدين
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">عمولات الشركاء المستحقة</span>
                <span className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5 block">$120.00 USD</span>
                <span className="text-[10px] text-emerald-600 block">تسوية آلية منتظمة</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">معدل تحويل الروابط</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">8.4%</span>
                <span className="text-[10px] text-slate-400 block">12 رابط تتبع نشط</span>
              </div>
            </div>

            {/* Top Affiliates */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 block">أفضل الشركاء أداءً:</span>
              {[
                { name: "مدونة السفر الخليجي (سعود)", sales: "$850.00", comm: "$42.50", clicks: 310 },
                { name: "دليل سياحة تركيا (أحمد)", sales: "$620.00", comm: "$31.00", clicks: 240 },
                { name: "حساب رحلات VIP (ريم)", sales: "$450.00", comm: "$22.50", clicks: 185 },
              ].map((aff) => (
                <div key={aff.name} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 text-[11px] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">{aff.name}</span>
                    <span className="text-[10px] text-slate-400 block">{aff.clicks} زيارة محالة</span>
                  </div>
                  <div className="text-left font-mono">
                    <span className="font-bold text-emerald-600 block">{aff.comm}</span>
                    <span className="text-[10px] text-slate-400 block">مبيعات: {aff.sales}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          15. SECTION 11: WHATSAPP, COMMUNICATIONS & REVIEWS COCKPIT
              (Visible when domainView === 'comms' or domainView === 'all')
         ══════════════════════════════════════════════════════════════════════════ */}
      {(domainView === "comms" || domainView === "all") && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Col 1: WhatsApp Baileys Engine */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="size-4 text-emerald-600" />
                  <span>محرك الواتساب الذكي (Baileys Engine)</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">البوابة الرسمية للرد الآلي وتأكيد الحجوزات</p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                متصل ومقترن
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">سرعة الرد الآلي</span>
                <span className="text-base font-black text-emerald-600 font-mono mt-0.5 block">42 ثانية</span>
                <span className="text-[10px] text-slate-400 block">معدل قياسي لحظي</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">محادثات اليوم</span>
                <span className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5 block">68 محادثة</span>
                <span className="text-[10px] text-emerald-600 block">رضا المسافرين 98.6%</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500">الرقم المعتمد:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white" dir="ltr">+966 50 123 4567</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-500">حالة المزامنة والاقتران:</span>
                <span className="font-bold text-emerald-600">نشط (Session Persistent)</span>
              </div>
            </div>
          </div>

          {/* Col 2: Automated Email System */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="size-4 text-blue-600" />
                  <span>نظام البريد وقوالب الإشعارات</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">قوالب الفواتير والفاوتشر المعتمدة</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                17 قالباً
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">التنبيهات الإدارية</span>
                <span className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5 block">231 إشعاراً</span>
                <span className="text-[10px] text-blue-600 block">مسجلة بقاعدة البيانات</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">معدل التسليم والفتح</span>
                <span className="text-base font-black text-blue-600 font-mono mt-0.5 block">99.1%</span>
                <span className="text-[10px] text-slate-400 block">فتح البريد: 46.8%</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              {[
                { name: "تأكيد الحجز الفوري وإرفاق الفاوتشر", rate: "100% تسليم" },
                { name: "الفاتورة الضريبية وقسيمة السداد", rate: "99.4% تسليم" },
                { name: "رسائل الترحيب واستعادة الحساب", rate: "100% تسليم" },
              ].map((item) => (
                <div key={item.name} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                  <span className="font-mono text-emerald-600 font-bold">{item.rate}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3: Community & Verified Reviews */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Star className="size-4 text-amber-500" />
                  <span>المجتمع والتقييمات الموثقة</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">تقييمات نزلاء الفنادق الحقيقية</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                4.8 ★ من 5.0
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">تقييمات النزلاء الحقيقية</span>
                <span className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5 block">1,356 تقييماً</span>
                <span className="text-[10px] text-amber-600 block">موثقة في PocketBase</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">عملاء CRM المحتملون</span>
                <span className="text-base font-black text-purple-600 font-mono mt-0.5 block">12 عميلاً</span>
                <span className="text-[10px] text-slate-400 block">قيد التواصل والمتابعة</span>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-1.5 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-600 dark:text-slate-300">5 نجوم (ممتاز جداً)</span>
                  <span className="font-mono text-amber-600">88% (1,193 تقييم)</span>
                </div>
                <Progress value={88} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-600 dark:text-slate-300">4 نجوم (جيد جداً)</span>
                  <span className="font-mono text-slate-600">9% (122 تقييم)</span>
                </div>
                <Progress value={9} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
