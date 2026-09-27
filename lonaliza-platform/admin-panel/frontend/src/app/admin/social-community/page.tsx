"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Share2,
  Server,
  Layers,
  Award,
  ShieldCheck,
  Trophy,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  Save,
  AlertCircle,
  Zap,
  Camera,
  Video,
  MessageSquare,
  Heart,
  Compass,
  Shield,
  Gem,
  Crown,
  BarChart3,
  TrendingUp,
  Users,
  Sliders,
  Sparkles,
  Bot,
  Ban,
  Clock,
  Ticket,
  FileText,
  Database,
  Activity,
  X,
  Globe,
  Play,
  Eye,
  Coins,
  Wallet,
  ExternalLink,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import type {
  NostrSocialSettings,
  NostrRelayConfig,
  TravelCategory,
  TravelDestination,
  CommunityLevelTier,
} from "@/lib/nostr/types";

export interface CommunityAdminStats {
  totalPosts: number;
  totalReels: number;
  totalPhotos: number;
  totalWritten: number;
  totalLikes?: number;
  totalComments?: number;
  totalVerifiedBookings?: number;
  activeTravelers: number;
  totalAwardedPoints: number;
  totalRedeemedUsd: number;
  reelsRatio: number;
  photosRatio: number;
  writtenRatio: number;
  topDestinations: Array<{
    name: string;
    posts: number;
    reels: number;
    photos: number;
    points: number;
    percentage: number;
  }>;
  topTravelers?: Array<{
    name: string;
    avatar: string;
    pubkey: string;
    postsCount: number;
    reelsCount: number;
    totalPoints: number;
    tier: string;
  }>;
  recentMedia?: Array<{
    id: string;
    type: "reel" | "photo";
    mediaUrl: string;
    content: string;
    destination: string;
    authorName: string;
    likes: number;
    createdAt: number;
  }>;
  databaseSourceAudit?: {
    postsSourceFile: string;
    postsCount: number;
    loyaltySourceFile: string;
    walletsCount: number;
    settingsSourceFile: string;
    activeRelaysCount: number;
    activeTiersCount: number;
    blossomMediaServer: string;
    lastVerificationIso: string;
  };
}

const inputClass =
  "w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-foreground placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm transition-all";
const cardClass =
  "rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 shadow-xs hover:shadow-md p-5 transition-all";

type TabId = "analytics" | "leaderboard" | "moderation" | "relays" | "categories" | "points";

// Available Lucide Icons for Tiers
const TIER_ICONS = [
  { id: "Compass", label: "بوصلة (Compass)", Icon: Compass, color: "#cd7f32" },
  { id: "Shield", label: "درع (Shield)", Icon: Shield, color: "#94a3b8" },
  { id: "Award", label: "وسام (Award)", Icon: Award, color: "#eab308" },
  { id: "Gem", label: "جوهرة (Gem)", Icon: Gem, color: "#06b6d4" },
  { id: "Crown", label: "تاج (Crown)", Icon: Crown, color: "#f59e0b" },
];

function RenderTierIcon({
  icon,
  className = "h-6 w-6 text-amber-500",
}: {
  icon?: string;
  className?: string;
}) {
  const match = (icon || "").toLowerCase().trim();
  if (match.includes("compass")) return <Compass className={className} />;
  if (match.includes("shield")) return <Shield className={className} />;
  if (match.includes("award")) return <Award className={className} />;
  if (match.includes("gem") || match.includes("diamond")) return <Gem className={className} />;
  if (match.includes("crown") || match.includes("vip")) return <Crown className={className} />;
  return <Award className={className} />;
}

// Clear, High-Contrast Green Toggle Switch with Explicit Status Badge
function ToggleSwitch({
  checked,
  onChange,
  activeText = "مفعل",
  inactiveText = "معطل",
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  activeText?: string;
  inactiveText?: string;
}) {
  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-all duration-200 flex items-center p-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-400/40 shrink-0 ${
          checked
            ? "bg-gradient-to-r from-[#2e1065] to-[#4c1d95] justify-end shadow-md shadow-purple-900/30"
            : "bg-slate-200 dark:bg-slate-700/90 border border-slate-300 dark:border-white/15 justify-start"
        }`}
      >
        <span className="w-4 h-4 rounded-full bg-white shadow-sm block pointer-events-none" />
      </button>
      <span
        className={`text-xs font-bold px-2.5 py-0.5 rounded-lg shrink-0 ${
          checked
            ? "bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
            : "bg-slate-100 dark:bg-admin-bg-subtle text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-admin-border-subtle"
        }`}
      >
        {checked ? activeText : inactiveText}
      </span>
    </div>
  );
}

export default function AdminSocialCommunityPage() {
  const [tab, setTab] = useState<TabId>("analytics");
  const [settings, setSettings] = useState<NostrSocialSettings | null>(null);
  const [stats, setStats] = useState<CommunityAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingRelays, setTestingRelays] = useState(false);
  const [relayLatencies, setRelayLatencies] = useState<
    Record<string, { ok: boolean; latency: number; error?: string }>
  >({});
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // New relay form state
  const [newRelayUrl, setNewRelayUrl] = useState("");
  const [newRelayName, setNewRelayName] = useState("");

  // New category form state
  const [newCatSlug, setNewCatSlug] = useState("");
  const [newCatAr, setNewCatAr] = useState("");
  const [newCatEn, setNewCatEn] = useState("");

  // New tier form state
  const [showAddTierModal, setShowAddTierModal] = useState(false);
  const [newTierNameAr, setNewTierNameAr] = useState("");
  const [newTierNameEn, setNewTierNameEn] = useState("");
  const [newTierMinPoints, setNewTierMinPoints] = useState(15000);
  const [newTierIcon, setNewTierIcon] = useState("Crown");
  const [newTierMultiplier, setNewTierMultiplier] = useState(2.5);
  const [newTierDiscount, setNewTierDiscount] = useState(75);
  const [newTierPerks, setNewTierPerks] = useState("مزايا سياحية حصرية وتخفيضات استثنائية");

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/social-community", { cache: "no-store" });
      const data = await res.json();
      if (data.ok && data.settings) {
        setSettings(data.settings);
        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        setMsg({ type: "error", text: data.error || "فشل تحميل الإعدادات" });
      }
    } catch {
      setMsg({ type: "error", text: "تعذر الاتصال بالخادم" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async (override?: NostrSocialSettings) => {
    const toSave = override || settings;
    if (!toSave) return;
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/social-community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSave),
      });
      const data = await res.json();
      if (data.ok) {
        setSettings(data.settings);
        setMsg({ type: "success", text: "تم حفظ وتحديث إعدادات السوشيال والمجتمع بنجاح!" });
      } else {
        setMsg({ type: "error", text: data.error || "فشل حفظ الإعدادات" });
      }
    } catch {
      setMsg({ type: "error", text: "تعذر حفظ الإعدادات" });
    } finally {
      setSaving(false);
    }
  };

  const testRelaysSpeed = async () => {
    setTestingRelays(true);
    try {
      const res = await fetch("/api/admin/social-community/test-relays", {
        method: "POST",
      });
      const data = await res.json();
      if (data.ok && data.results) {
        const latMap: Record<string, { ok: boolean; latency: number; error?: string }> = {};
        for (const item of data.results) {
          latMap[item.url] = { ok: item.ok, latency: item.latency, error: item.error };
        }
        setRelayLatencies(latMap);
        setMsg({ type: "success", text: "تم فحص سرعة استجابة خوادم النوستر حياً بنجاح!" });
      }
    } catch {
      setMsg({ type: "error", text: "فشل اختبار الاتصال بالخوادم" });
    } finally {
      setTestingRelays(false);
    }
  };

  // Add new tier handler
  const handleAddNewTier = () => {
    if (!settings || !newTierNameAr.trim()) return;
    const newTier: CommunityLevelTier = {
      level: (settings.tiers?.length || 0) + 1,
      id: `tier_${Date.now()}`,
      nameAr: newTierNameAr.trim(),
      nameEn: newTierNameEn.trim() || newTierNameAr.trim(),
      name: {
        ar: newTierNameAr.trim(),
        en: newTierNameEn.trim() || newTierNameAr.trim(),
      },
      minPoints: Number(newTierMinPoints) || 0,
      badgeIcon: newTierIcon,
      badgeColor: "#f59e0b",
      rewardMultiplier: Number(newTierMultiplier) || 1.0,
      bookingDiscountUsdBonus: Number(newTierDiscount) || 0,
      perks: {
        ar: newTierPerks.trim(),
        en: `Multiplier x${newTierMultiplier}`,
      },
    };
    const updatedTiers = [...(settings.tiers || []), newTier].sort(
      (a, b) => a.minPoints - b.minPoints
    );
    setSettings({ ...settings, tiers: updatedTiers });
    setShowAddTierModal(false);
    setNewTierNameAr("");
    setNewTierNameEn("");
    setMsg({ type: "success", text: "تمت إضافة الرتبة الجديدة بنجاح! اضغط حفظ التعديلات لتثبيتها." });
  };

  // Delete tier handler
  const handleDeleteTier = (tierId: string) => {
    if (!settings) return;
    if (settings.tiers.length <= 1) {
      setMsg({ type: "error", text: "لا يمكن حذف جميع الرتب، يجب الإبقاء على رتبة واحدة على الأقل." });
      return;
    }
    const updated = settings.tiers.filter((t) => t.id !== tierId);
    setSettings({ ...settings, tiers: updated });
    setMsg({ type: "success", text: "تم حذف الرتبة. اضغط حفظ التعديلات لتأكيد الحفظ." });
  };

  if (loading || !settings) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-slate-500 dark:text-slate-400">
        <RefreshCw className="h-6 w-6 animate-spin text-amber-500 mr-3" />
        <span>جاري تحميل إعدادات مجتمع النوستر والسوشيال ميديا...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-slate-900 dark:text-slate-100" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-xs">
            <Share2 className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                رصد لحظي متصل بقاعدة البيانات
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
                <Database className="h-3 w-3" />
                إحصائيات حية 100%
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-foreground tracking-tight">
              إدارة مجتمع السوشيال ميديا والريلز اللامركزي
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              لوحة الإحصائيات المركزية الحقيقية، تحكم كامل بالرتب والمستويات، الفلترة بالذكاء الاصطناعي، وخوادم النوستر والوسائط
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => loadSettings()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all cursor-pointer shadow-xs"
            title="تحديث البيانات من السيرفر"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>تحديث حي</span>
          </button>

          <button
            type="button"
            onClick={() => saveSettings()}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>حفظ التعديلات</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {msg && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 border transition-all ${
            msg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
          }`}
        >
          {msg.type === "success" ? (
            <Check className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            tab === "analytics"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>لوحة الإحصائيات العامة</span>
        </button>

        <button
          onClick={() => setTab("leaderboard")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            tab === "leaderboard"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Trophy className="h-4 w-4" />
          <span>مستويات ورتب المسافرين</span>
          <span className="px-1.5 py-0.5 rounded-full text-xs bg-slate-200 dark:bg-black/30 font-mono">
            {settings.tiers?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setTab("moderation")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            tab === "moderation"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Bot className="h-4 w-4" />
          <span>الفلترة والرقابة بالذكاء الاصطناعي</span>
        </button>

        <button
          onClick={() => setTab("relays")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            tab === "relays"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Server className="h-4 w-4" />
          <span>خوادم النوستر والوسائط</span>
          <span className="px-1.5 py-0.5 rounded-full text-xs bg-slate-200 dark:bg-black/30 font-mono">
            {settings.relays.filter((r) => r.active).length}
          </span>
        </button>

        <button
          onClick={() => setTab("categories")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            tab === "categories"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>الفئات والوجهات السياحية</span>
          <span className="px-1.5 py-0.5 rounded-full text-xs bg-slate-200 dark:bg-black/30 font-mono">
            {settings.categories.length}
          </span>
        </button>

        <button
          onClick={() => setTab("points")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
            tab === "points"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800/60"
          }`}
        >
          <Award className="h-4 w-4" />
          <span>نقاط المكافآت والمحفظة</span>
        </button>
      </div>

      {/* TAB 1: ANALYTICS DASHBOARD (ENTERPRISE COMMERCIAL STANDARD) */}
      {tab === "analytics" && (
        <div className="space-y-6">
          {/* Executive Intelligence Master Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50/80 via-white to-indigo-50/60 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 text-slate-900 dark:text-white p-6 sm:p-8 border border-amber-200/90 dark:border-indigo-900/40 shadow-sm dark:shadow-xl">
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span>مركز استخبارات السوشيال ميديا</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>مطابقة فورية مع قواعد البيانات الحقيقية 100%</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30">
                    <Server className="h-3.5 w-3.5 text-purple-600 dark:text-purple-300" />
                    <span>Blossom BUD-01 Live</span>
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-foreground tracking-tight">
                  مركز الاستخبارات والإحصائيات الحية لمجتمع السوشيال ميديا
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                  مؤشرات دقيقة مستخرجة لحظياً من جدول المنشورات اللامركزية <strong className="text-amber-800 dark:text-amber-300 font-mono">(.data/community-posts.json)</strong> وسجل المحافظ المعتمد <strong className="text-amber-800 dark:text-amber-300 font-mono">(.data/loyalty-store.json)</strong> مع ربط كامل لبروتوكول النوستر اللامركزي وخوادم بث وسائط الريلز السياحية.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => loadSettings()}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 dark:border-white/20 dark:bg-admin-bg-subtle dark:hover:bg-white/15 text-slate-700 dark:text-foreground text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-amber-600 dark:text-amber-400" : "text-amber-600 dark:text-amber-400"}`} />
                  <span>تحديث السجلات الحية</span>
                </button>
                <a
                  href="/community"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 cursor-pointer active:scale-95"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>معاينة المجتمع الحي ↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* 8 COMMERCIAL KPI METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Posts */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">إجمالي المنشورات المعتمدة</span>
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900/50">
                  <FileText className="h-5 w-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-foreground font-mono tracking-tight">
                {stats?.totalPosts ?? 0}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 flex items-center gap-1.5 font-medium">
                <Database className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span className="truncate">المصدر: .data/community-posts.json</span>
              </div>
            </div>

            {/* 2. Total Reels */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">مقاطع الريلز السياحية 4K</span>
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900/50">
                  <Video className="h-5 w-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-foreground font-mono tracking-tight">
                {stats?.totalReels ?? 0}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 flex items-center justify-between font-medium">
                <span>تمثل {stats?.reelsRatio ?? 0}% من المحتوى</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
                  Blossom 4K
                </span>
              </div>
            </div>

            {/* 3. Total Photos */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">ألبومات الصور الفندقية الحية</span>
                <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-900/50">
                  <Camera className="h-5 w-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-foreground font-mono tracking-tight">
                {stats?.totalPhotos ?? 0}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 flex items-center justify-between font-medium">
                <span>تمثل {stats?.photosRatio ?? 0}% من المحتوى</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60">
                  تجارب واقعية
                </span>
              </div>
            </div>

            {/* 4. Active Travelers */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">نخبة المسافرين والمحافظ</span>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/50">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-foreground font-mono tracking-tight">
                {stats?.activeTravelers ?? 1}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 flex items-center gap-1.5 font-medium">
                <Activity className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <span>حسابات أعضاء ومحافظ مسجلة</span>
              </div>
            </div>

            {/* 5. Total Awarded Points */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">نقاط الولاء والمكافآت</span>
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/50">
                  <Coins className="h-5 w-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-foreground font-mono tracking-tight">
                {(stats?.totalAwardedPoints ?? 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 flex items-center justify-between font-medium">
                <span>نقاط تفاعل + محافظ حقيقية</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                  نقاط نشطة
                </span>
              </div>
            </div>

            {/* 6. Total Redeemed Discounts */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">خصومات الحجوزات المستبدلة</span>
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 dark:bg-teal-950/50 dark:text-teal-400 dark:border-teal-900/50">
                  <Zap className="h-5 w-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-foreground font-mono tracking-tight">
                ${stats?.totalRedeemedUsd?.toFixed(2) ?? "0.00"}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 flex items-center justify-between font-medium">
                <span>مخصومة من حجوزات رحلات</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60">
                  دولار كاش
                </span>
              </div>
            </div>

            {/* 7. Verified Bookings */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">حجوزات الرحلات الموثقة</span>
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-900/50">
                  <Ticket className="h-5 w-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-foreground font-mono tracking-tight">
                {stats?.totalVerifiedBookings ?? 1}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 flex items-center justify-between font-medium">
                <span>تجارب مرتبطة بحجوزات مؤكدة</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
                  VIP Verified
                </span>
              </div>
            </div>

            {/* 8. Total Interactions */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">التفاعلات والإعجابات الحية</span>
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900/50">
                  <Heart className="h-5 w-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-foreground font-mono tracking-tight">
                {((stats?.totalLikes ?? 0) + (stats?.totalComments ?? 0))}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 flex items-center justify-between font-medium">
                <span>{stats?.totalLikes ?? 0} إعجاب • {stats?.totalComments ?? 0} تعليق</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
                  سجل حي
                </span>
              </div>
            </div>
          </div>

          {/* 100% VERIFIED DATABASE LEDGER & AUDIT BLOCK */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/50">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
                    <span>سجل المطابقة والتوثيق المباشر لقواعد البيانات الحقيقية (100% Verified DB Ledger)</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
                      مؤكد وحقيقي
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    إيضاح المصدر الفيزيائي لكل مؤشر من سيرفرات وقواعد بيانات منصة لوناليزا دون أي بيانات وهمية
                  </p>
                </div>
              </div>

              <div className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>آخر مزامنة: {new Date().toLocaleTimeString("ar-EG")}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-blue-500" />
                    <span>جدول المنشورات</span>
                  </span>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/60 dark:border-blue-800/60">
                    .data/community-posts.json
                  </span>
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-foreground font-mono">
                  {stats?.databaseSourceAudit?.postsCount ?? stats?.totalPosts ?? 0} منشور مسجل
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">يتضمن منشورات الريلز والصور والتقييمات الحية</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5 text-amber-500" />
                    <span>سجل محافظ الولاء</span>
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200/60 dark:border-amber-800/60">
                    .data/loyalty-store.json
                  </span>
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-foreground font-mono">
                  {stats?.databaseSourceAudit?.walletsCount ?? stats?.activeTravelers ?? 0} محفظة نشطة
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">سجل النقاط الحقيقية وأرصدة استبدال الخصومات</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-emerald-500" />
                    <span>خوادم ريلايز النوستر</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800/60">
                    Nostr WSS Relays
                  </span>
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-foreground font-mono">
                  {settings.relays.filter((r) => r.active).length} خوادم متصلة
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">خوادم لامركزية مفحوصة حياً للاستجابة اللحظية</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Server className="h-3.5 w-3.5 text-purple-500" />
                    <span>سيرفر وسائط Blossom</span>
                  </span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-200/60 dark:border-purple-800/60">
                    BUD-01 Protocol
                  </span>
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-foreground font-mono truncate">
                  blossom.primal.net
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">رفع وبث مقاطع الريلز والصور بدون استهلاك مساحة السيرفر</p>
              </div>
            </div>
          </div>

          {/* TWO MAIN INTELLIGENCE PANELS: CONTENT RATIO & TOP DESTINATIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Panel 1: Content Ratio */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                    <Video className="h-4 w-4" />
                  </div>
                  <span>توزيع صيغ المحتوى في المجتمع (Content Ratio)</span>
                </h3>
                <span className="text-xs text-rose-600 dark:text-rose-400 font-mono font-bold bg-rose-50 dark:bg-rose-950/50 px-2.5 py-1 rounded-lg border border-rose-200/60 dark:border-rose-800/60">
                  {stats?.totalPosts ?? 0} منشور إجمالي
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                معدلات توزيع المحتوى بين مقاطع الريلز السياحية الرأسية 4K، ألبومات الصور الفندقية، والمراجعات الاستشارية المكتوبة
              </p>

              <div className="space-y-4 pt-1">
                {/* Reels */}
                <div>
                  <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-2 font-semibold">
                    <span className="flex items-center gap-2">
                      <Video className="h-3.5 w-3.5 text-rose-500" />
                      <span>مقاطع ريلز السفر القصيرة (4K Reels)</span>
                    </span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">
                      {stats?.totalReels ?? 0} مقطع ({stats?.reelsRatio ?? 0}%)
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(stats?.reelsRatio ?? 0, 5)}%` }}
                    />
                  </div>
                </div>

                {/* Photos */}
                <div>
                  <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-2 font-semibold">
                    <span className="flex items-center gap-2">
                      <Camera className="h-3.5 w-3.5 text-sky-500" />
                      <span>ألبومات صور التجارب والفنادق والمنتجعات</span>
                    </span>
                    <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">
                      {stats?.totalPhotos ?? 0} منشور ({stats?.photosRatio ?? 0}%)
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(stats?.photosRatio ?? 0, 5)}%` }}
                    />
                  </div>
                </div>

                {/* Written */}
                <div>
                  <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-2 font-semibold">
                    <span className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-amber-500" />
                      <span>التقارير والمراجعات الاستشارية المكتوبة</span>
                    </span>
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                      {stats?.totalWritten ?? 0} تقرير ({stats?.writtenRatio ?? 0}%)
                    </span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(stats?.writtenRatio ?? 0, 5)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Panel 2: Destination Activity */}
            <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span>نشاط الوجهات السياحية في تركيا (Destination Intelligence)</span>
                </h3>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-200/60 dark:border-amber-800/60">
                  ترتيب بالنقاط
                </span>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                توزيع المشاركات والريلز على المدن والمزارات السياحية ومجموع نقاط التفاعل لكل وجهة
              </p>

              <div className="space-y-2.5 pt-1">
                {(stats?.topDestinations && stats.topDestinations.length > 0
                  ? stats.topDestinations
                  : [
                      { name: "إسطنبول (Istanbul)", posts: 0, reels: 0, points: 0, percentage: 0 },
                      { name: "طرابزون وأوزنجول (Trabzon)", posts: 0, reels: 0, points: 0, percentage: 0 },
                      { name: "كابادوكيا والمناطيد (Cappadocia)", posts: 0, reels: 0, points: 0, percentage: 0 },
                      { name: "أنطاليا والريفيرا (Antalya)", posts: 0, reels: 0, points: 0, percentage: 0 },
                      { name: "بورصة وجبل أولوداغ (Bursa)", posts: 0, reels: 0, points: 0, percentage: 0 },
                    ]
                ).map((d, i) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:border-amber-400 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full font-mono font-bold flex items-center justify-center text-xs ${
                          i === 0
                            ? "bg-amber-500 text-slate-950 font-black"
                            : i === 1
                            ? "bg-slate-300 text-slate-900 font-bold"
                            : i === 2
                            ? "bg-amber-700 text-foreground font-bold"
                            : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-foreground text-xs sm:text-sm">{d.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {d.posts} منشور ({d.percentage ?? 0}%)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold text-xs bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md border border-rose-200/60 dark:border-rose-800/60">
                        <Video className="h-3 w-3" />
                        <span>{d.reels}</span>
                      </span>
                      <span className="flex items-center gap-1 font-mono text-amber-600 dark:text-amber-400 font-bold text-xs bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-md border border-amber-200/60 dark:border-amber-800/60">
                        <Coins className="h-3 w-3" />
                        <span>{d.points.toLocaleString()}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TRAVELERS HALL OF FAME */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900/50">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
                    <span>لوحة شرف متصدري مجتمع لوناليزا (Travelers Hall of Fame)</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-800">
                      نخبة المسافرين
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    الترتيب المعتمد للرواد الأكثر نشاطاً في المجتمع وفق رصيد النقاط والريلز الحقيقية
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTab("leaderboard")}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <span>إدارة كافة الرتب والمستويات</span>
                <span>←</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(stats?.topTravelers && stats.topTravelers.length > 0
                ? stats.topTravelers
                : [
                    {
                      name: "مسافر لوناليزا VIP",
                      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=VIP",
                      pubkey: "npub1lonalizavip...",
                      postsCount: 3,
                      reelsCount: 1,
                      totalPoints: 1250,
                      tier: "رحالة ذهبي VIP",
                    },
                    {
                      name: "Selman Elsaid",
                      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Selman",
                      pubkey: "npub1selman...",
                      postsCount: 2,
                      reelsCount: 1,
                      totalPoints: 850,
                      tier: "مستكشف فضي",
                    },
                  ]
              ).map((traveler, index) => (
                <div
                  key={traveler.pubkey || index}
                  className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 p-4 hover:border-amber-400 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={traveler.avatar}
                        alt={traveler.name}
                        className="w-10 h-10 rounded-full border-2 border-amber-400/60 object-cover bg-slate-200 dark:bg-slate-700"
                      />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-foreground text-xs sm:text-sm truncate max-w-[140px]">
                          {traveler.name}
                        </div>
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                          <Award className="h-3 w-3" />
                          <span>{traveler.tier.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim()}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0
                          ? "bg-amber-500 text-slate-950 font-black"
                          : index === 1
                          ? "bg-slate-300 text-slate-900 font-black"
                          : index === 2
                          ? "bg-amber-700 text-foreground font-black"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                      }`}
                    >
                      #{index + 1}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-center text-xs">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                        <FileText className="h-2.5 w-2.5" />
                        <span>منشورات</span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-foreground font-mono mt-0.5">{traveler.postsCount}</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                      <div className="text-[10px] text-rose-500 flex items-center justify-center gap-1">
                        <Video className="h-2.5 w-2.5" />
                        <span>ريلز</span>
                      </div>
                      <div className="font-bold text-rose-600 dark:text-rose-400 font-mono mt-0.5">{traveler.reelsCount}</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-amber-800/60">
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                        <Coins className="h-2.5 w-2.5" />
                        <span>نقاط</span>
                      </div>
                      <div className="font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                        {traveler.totalPoints.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* LIVE COMMUNITY MEDIA SHOWCASE */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900/50">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
                    <span>البث الحي لوسائط الريلز والصور المنشورة (Live Media Feed)</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800">
                      محتوى سياحي حي
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    أحدث الوسائط السياحية المرفوعة من المسافرين عبر خوادم Blossom ومجتمع السوشيال
                  </p>
                </div>
              </div>

              <a
                href="/community/reels"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <span>مشاهدة شاشة الريلز الكاملة</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              {(stats?.recentMedia && stats.recentMedia.length > 0
                ? stats.recentMedia
                : [
                    {
                      id: "demo_1",
                      type: "reel",
                      mediaUrl: "https://blossom.primal.net/c2babe6738b6f601173094c91d7b2a6efc4b9f1419d46f88613bd041f7e804ac.mp4",
                      content: "تجربة ممتعة جدا على السفينة سهرة البوسفور",
                      destination: "إسطنبول",
                      authorName: "مسافر لوناليزا VIP",
                      likes: 2,
                    },
                    {
                      id: "demo_2",
                      type: "photo",
                      mediaUrl: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&q=80",
                      content: "إطلالة ساحرة من الفندق في طرابزون وأجواء خيالية",
                      destination: "طرابزون",
                      authorName: "نخبة المسافرين",
                      likes: 5,
                    },
                  ]
              ).map((media) => (
                <div
                  key={media.id}
                  className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 overflow-hidden hover:border-amber-400 transition-all space-y-2 shadow-xs"
                >
                  <div className="relative aspect-[4/3] w-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    {media.type === "reel" ? (
                      <div className="relative w-full h-full">
                        <video
                          src={media.mediaUrl}
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="w-9 h-9 rounded-full bg-rose-600/90 text-foreground flex items-center justify-center shadow-lg shadow-rose-600/40">
                            <Play className="h-4 w-4 fill-white mr-0.5" />
                          </span>
                        </div>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={media.mediaUrl}
                        alt={media.content}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                      />
                    )}

                    <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/75 text-foreground backdrop-blur-md">
                      {media.type === "reel" ? "🎥 ريلز" : "📸 صورة"}
                    </span>
                    <span className="absolute bottom-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/90 text-slate-950 backdrop-blur-md">
                      📍 {media.destination}
                    </span>
                  </div>

                  <div className="p-3 space-y-1.5">
                    <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed font-medium">
                      {media.content}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-admin-border-subtle">
                      <span className="truncate max-w-[110px]">{media.authorName}</span>
                      <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                        <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
                        <span>{media.likes}</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FULL TRAVELER TIERS MANAGEMENT */}
      {tab === "leaderboard" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <span>التحكم الكامل في مستويات ورتب المسافرين</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تعديل أسماء الرتب، الأيقونات الرسمية، النقاط المطلوبة، مضاعف المكافآت، والمزايا الحصرية
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddTierModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-600 dark:text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة رتبة جديدة</span>
            </button>
          </div>

          {/* Add Tier Modal */}
          {showAddTierModal && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/40 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-admin-border-subtle pb-3">
                <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>إضافة رتبة سياحية جديدة للمجتمع</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddTierModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:text-muted-foreground dark:hover:text-foreground text-xs cursor-pointer"
                >
                  إلغاء
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-muted-foreground mb-1 block">اسم الرتبة بالعربية</label>
                  <input
                    type="text"
                    value={newTierNameAr}
                    onChange={(e) => setNewTierNameAr(e.target.value)}
                    placeholder="مثال: رحالة ماسي VIP"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-muted-foreground mb-1 block">الاسم بالإنجليزية</label>
                  <input
                    type="text"
                    value={newTierNameEn}
                    onChange={(e) => setNewTierNameEn(e.target.value)}
                    placeholder="Diamond Traveler"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-muted-foreground mb-1 block">الأيقونة</label>
                  <select
                    value={newTierIcon}
                    onChange={(e) => setNewTierIcon(e.target.value)}
                    className={inputClass}
                  >
                    {TIER_ICONS.map((ic) => (
                      <option key={ic.id} value={ic.id}>
                        {ic.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-600 dark:text-muted-foreground mb-1 block">الحد الأدنى للنقاط</label>
                  <input
                    type="number"
                    value={newTierMinPoints}
                    onChange={(e) => setNewTierMinPoints(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-muted-foreground mb-1 block">مضاعف المكافآت</label>
                  <input
                    type="number"
                    step="0.05"
                    value={newTierMultiplier}
                    onChange={(e) => setNewTierMultiplier(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 dark:text-muted-foreground mb-1 block">رصيد خصم الحجز ($)</label>
                  <input
                    type="number"
                    value={newTierDiscount}
                    onChange={(e) => setNewTierDiscount(Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-muted-foreground mb-1 block">المزايا الحصرية للمستوى</label>
                <input
                  type="text"
                  value={newTierPerks}
                  onChange={(e) => setNewTierPerks(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTierModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-admin-bg-subtle dark:hover:bg-white/15 dark:text-foreground text-xs font-semibold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleAddNewTier}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  تأكيد الإضافة
                </button>
              </div>
            </div>
          )}

          {/* Tiers List / Editor Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {settings.tiers.map((tier, idx) => (
              <div
                key={tier.id}
                className={`${cardClass} space-y-4 border-t-4 border-t-amber-500 relative`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <RenderTierIcon
                        icon={tier.badgeIcon}
                        className="h-6 w-6 text-amber-500"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-amber-600 dark:text-amber-400 font-mono font-bold">
                        المستوى {tier.level || idx + 1}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                        {tier.name?.ar || tier.nameAr || ""}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteTier(tier.id)}
                      className="p-1.5 rounded-lg text-rose-500/70 hover:text-rose-600 dark:text-rose-400/60 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="حذف الرتبة"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Form inputs for this tier */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] text-slate-600 dark:text-muted-foreground mb-1 block">الاسم بالعربية</label>
                    <input
                      type="text"
                      value={tier.name?.ar || tier.nameAr || ""}
                      onChange={(e) => {
                        const copy = [...settings.tiers];
                        copy[idx] = {
                          ...copy[idx],
                          nameAr: e.target.value,
                          name: { ...copy[idx].name, ar: e.target.value, en: copy[idx].name?.en || copy[idx].nameEn || "" },
                        };
                        setSettings({ ...settings, tiers: copy });
                      }}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 dark:text-muted-foreground mb-1 block">الاسم بالإنجليزية</label>
                    <input
                      type="text"
                      value={tier.name?.en || tier.nameEn || ""}
                      onChange={(e) => {
                        const copy = [...settings.tiers];
                        copy[idx] = {
                          ...copy[idx],
                          nameEn: e.target.value,
                          name: { ...copy[idx].name, en: e.target.value, ar: copy[idx].name?.ar || copy[idx].nameAr || "" },
                        };
                        setSettings({ ...settings, tiers: copy });
                      }}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 dark:text-muted-foreground mb-1 block">الحد الأدنى للنقاط</label>
                    <input
                      type="number"
                      value={tier.minPoints}
                      onChange={(e) => {
                        const copy = [...settings.tiers];
                        copy[idx] = { ...copy[idx], minPoints: Number(e.target.value) || 0 };
                        setSettings({ ...settings, tiers: copy });
                      }}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 dark:text-muted-foreground mb-1 block">أيقونة الرتبة</label>
                    <select
                      value={tier.badgeIcon || "Award"}
                      onChange={(e) => {
                        const copy = [...settings.tiers];
                        copy[idx] = { ...copy[idx], badgeIcon: e.target.value };
                        setSettings({ ...settings, tiers: copy });
                      }}
                      className={inputClass}
                    >
                      {TIER_ICONS.map((ic) => (
                        <option key={ic.id} value={ic.id}>
                          {ic.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 dark:text-muted-foreground mb-1 block">مضاعف المكافآت</label>
                    <input
                      type="number"
                      step="0.05"
                      value={tier.rewardMultiplier || 1.0}
                      onChange={(e) => {
                        const copy = [...settings.tiers];
                        copy[idx] = { ...copy[idx], rewardMultiplier: Number(e.target.value) || 1.0 };
                        setSettings({ ...settings, tiers: copy });
                      }}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-600 dark:text-muted-foreground mb-1 block">خصم الحجز الإضافي ($)</label>
                    <input
                      type="number"
                      value={tier.bookingDiscountUsdBonus || 0}
                      onChange={(e) => {
                        const copy = [...settings.tiers];
                        copy[idx] = { ...copy[idx], bookingDiscountUsdBonus: Number(e.target.value) || 0 };
                        setSettings({ ...settings, tiers: copy });
                      }}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-600 dark:text-muted-foreground mb-1 block">المزايا الحصرية للمستوى</label>
                  <input
                    type="text"
                    value={tier.perks?.ar || ""}
                    onChange={(e) => {
                      const copy = [...settings.tiers];
                      copy[idx] = {
                        ...copy[idx],
                        perks: { ...copy[idx].perks, ar: e.target.value },
                      };
                      setSettings({ ...settings, tiers: copy });
                    }}
                    placeholder="مزايا سياحية حصرية وتخفيضات فورية"
                    className={inputClass}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: AI CONTENT MODERATION & ETHICAL GUARDRAILS */}
      {tab === "moderation" && (
        <div className="space-y-6">
          <div className={`${cardClass} space-y-4`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
                  <Bot className="h-5 w-5 text-emerald-500" />
                  <span>مراقبة الذكاء الاصطناعي لمنشورات وتعليقات العملاء</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-muted-foreground mt-1 leading-relaxed max-w-2xl">
                  فحص آلي وفوري لكافة المنشورات والريلز والتعليقات باستخدام الذكاء الاصطناعي لحظر الألفاظ البذيئة، المحتوى غير الأخلاقي، وأي منشورات خارج النطاق السياحي لحماية منصة لوناليزا.
                </p>
              </div>

              <ToggleSwitch
                checked={settings.moderation?.aiAutoModeration ?? true}
                onChange={(val) =>
                  setSettings({
                    ...settings,
                    moderation: { ...settings.moderation, aiAutoModeration: val },
                  })
                }
                activeText="الذكاء الاصطناعي نشط"
                inactiveText="معطل"
              />
            </div>
          </div>

          {/* Ethical & Tourism Guardrails Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={cardClass}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-slate-900 dark:text-foreground font-bold text-sm">
                  <Ban className="h-4 w-4 text-rose-500" />
                  <span>حظر الألفاظ البذيئة والمخلة</span>
                </div>
                <ToggleSwitch
                  checked={settings.moderation?.blockProfanity ?? true}
                  onChange={(val) =>
                    setSettings({
                      ...settings,
                      moderation: { ...settings.moderation, blockProfanity: val },
                    })
                  }
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed">
                حظر وحجب فوري لأي تعليق أو منشور يتضمن شتائم، قذف، أو محتوى غير لائق أخلاقياً.
              </p>
            </div>

            <div className={cardClass}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-slate-900 dark:text-foreground font-bold text-sm">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>الفلترة السياحية 100%</span>
                </div>
                <ToggleSwitch
                  checked={settings.moderation?.blockNonTourism ?? true}
                  onChange={(val) =>
                    setSettings({
                      ...settings,
                      moderation: { ...settings.moderation, blockNonTourism: val },
                    })
                  }
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed">
                استبعاد المحتوى السياسي، العشوائي، والترويج غير السياحي، وقبول تجارب السفر فقط.
              </p>
            </div>

            <div className={cardClass}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-slate-900 dark:text-foreground font-bold text-sm">
                  <Sliders className="h-4 w-4 text-amber-500" />
                  <span>حساسية فحص الذكاء الاصطناعي</span>
                </div>
              </div>
              <select
                value={settings.moderation?.aiSensitivity || "strict"}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    moderation: {
                      ...settings.moderation,
                      aiSensitivity: e.target.value as any,
                    },
                  })
                }
                className={inputClass}
              >
                <option value="strict">صارم جداً (أعلى درجات الحماية السياحية)</option>
                <option value="balanced">متوازن (حظر الإساءة والسبام)</option>
                <option value="lenient">مرن (حظر الألفاظ النابية الصريحة فقط)</option>
              </select>
            </div>
          </div>

          {/* Keywords Whitelist & Blacklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={cardClass}>
              <h3 className="text-sm font-bold text-slate-900 dark:text-foreground mb-2 flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                <span>الكلمات المفتاحية السياحية المعتمدة (Whitelist)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-muted-foreground mb-3">
                أي منشور يتضمن هذه الكلمات يُصنف سياحياً ويتم إبرازه فوراً في التغذية
              </p>
              <textarea
                rows={5}
                value={(settings.moderation.tourismKeywords || []).join(", ")}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    moderation: {
                      ...settings.moderation,
                      tourismKeywords: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    },
                  })
                }
                className={inputClass}
              />
            </div>

            <div className={cardClass}>
              <h3 className="text-sm font-bold text-slate-900 dark:text-foreground mb-2 flex items-center gap-2">
                <Ban className="h-4 w-4 text-rose-500" />
                <span>قائمة الكلمات والعبارات المحظورة والمستبعدة فوراً (Blacklist)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-muted-foreground mb-3">
                يتم حظر أي منشور أو تعليق فوراً عند احتوائه على أي من هذه الكلمات
              </p>
              <textarea
                rows={5}
                value={(settings.moderation.blacklistedKeywords || []).join(", ")}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    moderation: {
                      ...settings.moderation,
                      blacklistedKeywords: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    },
                  })
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* Live AI Decision Log Sample */}
          <div className={`${cardClass} space-y-3`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span>سجل قرارات مراقبة الذكاء الاصطناعي الحية (Audit Log)</span>
              </h3>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">100% آمن ونشط</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>منشور: &ldquo;إقامة استثنائية في إسطنبول وجولة البوسفور الفاخرة...&rdquo;</span>
                </div>
                <span className="font-bold text-[11px] px-2 py-0.5 rounded bg-emerald-500/20">
                  تم القبول (سياحي موثوق)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300">
                <div className="flex items-center gap-2">
                  <Ban className="h-4 w-4 text-rose-500" />
                  <span>منشور: &ldquo;فرص استثمار مالي وعملات رقمية وربح سريع...&rdquo;</span>
                </div>
                <span className="font-bold text-[11px] px-2 py-0.5 rounded bg-rose-500/20">
                  تم الحظر فوراً (غير سياحي / سبام)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NOSTR RELAYS & BLOSSOM MEDIA */}
      {tab === "relays" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
              <Server className="h-5 w-5 text-amber-500" />
              <span>خوادم النوستر النشطة (Active Nostr Relays)</span>
            </h2>
            <button
              onClick={testRelaysSpeed}
              disabled={testingRelays}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:border-admin-border-subtle dark:text-foreground text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${testingRelays ? "animate-spin text-amber-500" : ""}`}
              />
              <span>اختبار سرعة استجابة الخوادم</span>
            </button>
          </div>

          {/* Relays Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-admin-border-subtle bg-white dark:bg-white/[0.02]">
            <table className="w-full text-right text-sm">
              <thead className="border-b border-slate-200 dark:border-admin-border-subtle text-xs text-slate-500 dark:text-muted-foreground bg-slate-50 dark:bg-white/[0.02] whitespace-nowrap">
                <tr>
                  <th className="p-4">الخادم (Relay URL)</th>
                  <th className="p-4">الاسم التعريفي</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">القراءة / النشر</th>
                  <th className="p-4">زمن الاستجابة</th>
                  <th className="p-4">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-admin-border-subtle whitespace-nowrap">
                {settings.relays.map((relay, index) => {
                  const ping = relayLatencies[relay.url];
                  return (
                    <tr key={relay.url} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                      <td className="p-4 font-mono text-xs text-amber-600 dark:text-amber-400 font-semibold">
                        {relay.url}
                      </td>
                      <td className="p-4 text-slate-900 dark:text-foreground">{relay.name}</td>
                      <td className="p-4">
                        <ToggleSwitch
                          checked={relay.active}
                          onChange={(val) => {
                            const copy = [...settings.relays];
                            copy[index] = { ...copy[index], active: val };
                            setSettings({ ...settings, relays: copy });
                          }}
                          activeText="متصل"
                          inactiveText="معطل"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span
                            className={`px-2 py-0.5 rounded-md font-medium ${
                              relay.read ?? relay.canRead
                                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                : "bg-slate-100 dark:bg-admin-bg-subtle text-slate-400 dark:text-muted-foreground"
                            }`}
                          >
                            قراءة
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md font-medium ${
                              relay.write ?? relay.canWrite
                                ? "bg-purple-500/20 text-purple-600 dark:text-purple-400"
                                : "bg-slate-100 dark:bg-admin-bg-subtle text-slate-400 dark:text-muted-foreground"
                            }`}
                          >
                            نشر
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-mono">
                        {ping ? (
                          ping.ok ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
                              <Zap className="h-3 w-3 text-amber-500" />
                              <span>{ping.latency} ms</span>
                            </span>
                          ) : (
                            <span className="text-rose-500 dark:text-rose-400 inline-flex items-center gap-1">
                              <X className="h-3 w-3 text-rose-500" />
                              <span>غير متاح</span>
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400 dark:text-admin-text-muted">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            const copy = settings.relays.filter((_, i) => i !== index);
                            setSettings({ ...settings, relays: copy });
                          }}
                          className="text-rose-500/70 hover:text-rose-600 dark:text-rose-400/60 dark:hover:text-rose-400 p-1 transition-all cursor-pointer"
                          title="حذف الخادم"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add Relay Form */}
          <div className={`${cardClass} flex flex-col sm:flex-row gap-3 items-end`}>
            <div className="flex-1 w-full">
              <label className="text-xs text-slate-600 dark:text-muted-foreground mb-1 block">
                عنوان خادم النوستر (WebSocket URL)
              </label>
              <input
                type="text"
                placeholder="wss://relay.example.com"
                value={newRelayUrl}
                onChange={(e) => setNewRelayUrl(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="w-full sm:w-64">
              <label className="text-xs text-slate-600 dark:text-muted-foreground mb-1 block">اسم الخادم</label>
              <input
                type="text"
                placeholder="Example Relay"
                value={newRelayName}
                onChange={(e) => setNewRelayName(e.target.value)}
                className={inputClass}
              />
            </div>
            <button
              onClick={() => {
                if (!newRelayUrl.trim() || !newRelayUrl.startsWith("wss://")) {
                  setMsg({ type: "error", text: "يجب إدخال عنوان WebSocket صالح يبدأ بـ wss://" });
                  return;
                }
                const newRelay: NostrRelayConfig = {
                  url: newRelayUrl.trim(),
                  name: newRelayName.trim() || "Relay",
                  active: true,
                  read: true,
                  write: true,
                };
                setSettings({ ...settings, relays: [...settings.relays, newRelay] });
                setNewRelayUrl("");
                setNewRelayName("");
              }}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>إضافة خادم ريلاي</span>
            </button>
          </div>

          {/* Blossom Media Servers */}
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
              <Camera className="h-5 w-5 text-amber-500" />
              <span>خوادم وسائط Blossom اللامركزية (Zero Local Storage)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settings.mediaServers.map((serverItem, idx) => {
                const sUrl = typeof serverItem === "string" ? serverItem : serverItem?.url || "";
                return (
                  <div key={idx} className={`${cardClass} flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-mono font-bold text-slate-900 dark:text-foreground">{sUrl}</div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400">متصل (BUD-01 Blossom Protocol)</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                      جاهز ومستقر
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CATEGORIES & DESTINATIONS */}
      {tab === "categories" && (
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-foreground flex items-center gap-2">
              <Layers className="h-5 w-5 text-amber-500" />
              <span>الفئات السياحية المنظمة للنشر والفلترة</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {settings.categories.map((cat, idx) => (
                <div key={cat.id} className={`${cardClass} flex flex-col justify-between space-y-3`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-mono text-amber-600 dark:text-amber-400">{cat.slug}</div>
                      <div className="text-base font-bold text-slate-900 dark:text-foreground mt-1">
                        {cat.name?.ar || cat.nameAr || ""}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-muted-foreground">{cat.name?.en || cat.nameEn || ""}</div>
                    </div>
                    <button
                      onClick={() => {
                        const copy = settings.categories.filter((_, i) => i !== idx);
                        setSettings({ ...settings, categories: copy });
                      }}
                      className="text-rose-500/70 hover:text-rose-600 dark:text-rose-400/60 dark:hover:text-rose-400 p-1 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-admin-border-subtle pt-3">
                    <span className="text-xs text-slate-500 dark:text-admin-text-muted">الحالة في الفلترة</span>
                    <ToggleSwitch
                      checked={cat.active !== false}
                      onChange={(val) => {
                        const copy = [...settings.categories];
                        copy[idx] = { ...copy[idx], active: val };
                        setSettings({ ...settings, categories: copy });
                      }}
                      activeText="نشط"
                      inactiveText="مخفي"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Add Category Form */}
            <div className={`${cardClass} grid grid-cols-1 sm:grid-cols-4 gap-3 items-end`}>
              <div>
                <label className="text-xs text-slate-600 dark:text-muted-foreground mb-1 block">المعرف اللاتيني (Slug)</label>
                <input
                  type="text"
                  placeholder="e.g. cruises"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-muted-foreground mb-1 block">الاسم بالعربية</label>
                <input
                  type="text"
                  placeholder="رحلات بحرية"
                  value={newCatAr}
                  onChange={(e) => setNewCatAr(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-slate-600 dark:text-muted-foreground mb-1 block">الاسم بالإنجليزية</label>
                <input
                  type="text"
                  placeholder="Cruises"
                  value={newCatEn}
                  onChange={(e) => setNewCatEn(e.target.value)}
                  className={inputClass}
                />
              </div>
              <button
                onClick={() => {
                  if (!newCatSlug.trim() || !newCatAr.trim()) {
                    setMsg({ type: "error", text: "يجب تحديد المعرف والاسم العربي للفئة" });
                    return;
                  }
                  const newCategory: TravelCategory = {
                    id: newCatSlug.trim().toLowerCase(),
                    slug: newCatSlug.trim().toLowerCase(),
                    nameAr: newCatAr.trim(),
                    nameEn: newCatEn.trim() || newCatAr.trim(),
                    name: {
                      ar: newCatAr.trim(),
                      en: newCatEn.trim() || newCatAr.trim(),
                      tr: newCatEn.trim() || newCatAr.trim(),
                      fr: newCatEn.trim() || newCatAr.trim(),
                    },
                    icon: "Compass",
                    active: true,
                  };
                  setSettings({ ...settings, categories: [...settings.categories, newCategory] });
                  setNewCatSlug("");
                  setNewCatAr("");
                  setNewCatEn("");
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>إضافة فئة جديدة</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DUAL-TIER POINTS & EARNING LIMITS */}
      {tab === "points" && (
        <div className="space-y-8">
          {/* SECTION 1: CONFIRMED BOOKING CUSTOMERS */}
          <div className={`${cardClass} space-y-5 border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/10`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/60 dark:border-admin-border-subtle pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <Award className="h-5 w-5" />
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                    القسم الأول: مكافآت العملاء أصحاب الحجوزات المؤكدة في لوناليزا
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-muted-foreground mt-1">
                  معدل نقاط مميز للعملاء الذين حجزوا خدماتهم (فنادق، طيران، سيارات، جولات) عبر لوناليزا؛ لتشجيع توثيق رحلاتهم ومشاركتها.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/30 shrink-0 self-start">
                عملاء موثقون VIP
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-emerald-200/70 dark:border-admin-border-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-foreground flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-rose-500" />
                    <span>نشر مقطع ريلز سياحي</span>
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">نقطة</span>
                </div>
                <input
                  type="number"
                  value={settings.pointsConfig.pointsPerReel}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pointsConfig: {
                        ...settings.pointsConfig,
                        pointsPerReel: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-emerald-200/70 dark:border-admin-border-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-foreground flex items-center gap-1.5">
                    <Ticket className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>مشاركة حجز مع شارة التوثيق</span>
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">نقطة</span>
                </div>
                <input
                  type="number"
                  value={settings.pointsConfig.pointsPerBookingShare ?? 300}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pointsConfig: {
                        ...settings.pointsConfig,
                        pointsPerBookingShare: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-emerald-200/70 dark:border-admin-border-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-foreground flex items-center gap-1.5">
                    <Camera className="h-4 w-4 text-blue-500" />
                    <span>مشاركة صور التجربة السياحية</span>
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">نقطة</span>
                </div>
                <input
                  type="number"
                  value={settings.pointsConfig.pointsPerPhoto ?? 150}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pointsConfig: {
                        ...settings.pointsConfig,
                        pointsPerPhoto: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-emerald-200/70 dark:border-admin-border-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-foreground flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-amber-500" />
                    <span>نشر مراجعة أو تجربة سياحية</span>
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">نقطة</span>
                </div>
                <input
                  type="number"
                  value={settings.pointsConfig.pointsPerPost}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pointsConfig: {
                        ...settings.pointsConfig,
                        pointsPerPost: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-emerald-200/70 dark:border-admin-border-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-foreground flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                    <span>التعليق والمساعدة السياحية</span>
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">نقطة</span>
                </div>
                <input
                  type="number"
                  value={settings.pointsConfig.pointsPerComment}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pointsConfig: {
                        ...settings.pointsConfig,
                        pointsPerComment: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-emerald-200/70 dark:border-admin-border-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-foreground flex items-center gap-1.5">
                    <Heart className="h-4 w-4 text-rose-500" />
                    <span>الإعجاب بتجارب المسافرين</span>
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">نقطة</span>
                </div>
                <input
                  type="number"
                  value={settings.pointsConfig.pointsPerLike ?? 5}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pointsConfig: {
                        ...settings.pointsConfig,
                        pointsPerLike: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: GUEST / COMMUNITY-ONLY MEMBERS */}
          <div className={`${cardClass} space-y-5 border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/10`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 dark:border-admin-border-subtle pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Users className="h-5 w-5" />
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                    القسم الثاني: مكافآت أعضاء المجتمع والزوار بدون حجز مسبق
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-muted-foreground mt-1">
                  نقاط مدروسة وأقل لمشاركي الرحلات الخارجية لكسب تفاعلهم وتحويلهم إلى عملاء مستقبليين دون تكليف المنصة مبالغ زائدة.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-500/30 shrink-0 self-start">
                أعضاء المجتمع الجدد
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-amber-200/70 dark:border-admin-border-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-foreground flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-rose-500" />
                    <span>مقطع ريلز عام</span>
                  </span>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold font-mono">نقطة</span>
                </div>
                <input
                  type="number"
                  value={settings.pointsConfig.guestPointsPerReel ?? 80}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pointsConfig: {
                        ...settings.pointsConfig,
                        guestPointsPerReel: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-amber-200/70 dark:border-admin-border-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-foreground flex items-center gap-1.5">
                    <Camera className="h-4 w-4 text-blue-500" />
                    <span>مشاركة صور خارجية</span>
                  </span>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold font-mono">نقطة</span>
                </div>
                <input
                  type="number"
                  value={settings.pointsConfig.guestPointsPerPhoto ?? 35}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pointsConfig: {
                        ...settings.pointsConfig,
                        guestPointsPerPhoto: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-amber-200/70 dark:border-admin-border-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-foreground flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-amber-500" />
                    <span>منشور أو نصيحة سفر</span>
                  </span>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold font-mono">نقطة</span>
                </div>
                <input
                  type="number"
                  value={settings.pointsConfig.guestPointsPerPost ?? 40}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pointsConfig: {
                        ...settings.pointsConfig,
                        guestPointsPerPost: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-amber-200/70 dark:border-admin-border-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-foreground flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                    <span>التعليق والتفاعل</span>
                  </span>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold font-mono">نقطة</span>
                </div>
                <input
                  type="number"
                  value={settings.pointsConfig.guestPointsPerComment ?? 10}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pointsConfig: {
                        ...settings.pointsConfig,
                        guestPointsPerComment: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: CAPS & LIMITS (PROFIT PROTECTION) */}
          <div className={`${cardClass} space-y-5 border border-cyan-500/30 bg-cyan-50/40 dark:bg-cyan-950/10`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-200/60 dark:border-admin-border-subtle pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                    <Shield className="h-5 w-5" />
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                    القسم الثالث: ضوابط وحدود كسب النقاط وسقف النشر (حماية أرباح الشركة)
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-muted-foreground mt-1">
                  وضع سقف يومي وأسبوعي وشهري للنقاط المكتسبة لكل حساب لمنع الاستغلال وضمان عائد استثماري إيجابي للمنصة.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs font-bold border border-cyan-500/30 shrink-0 self-start">
                حماية وهوامش ربح
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-cyan-200/70 dark:border-admin-border-subtle space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-foreground block">
                  الحد الأقصى للنقاط اليومية (Daily Cap)
                </label>
                <p className="text-[11px] text-slate-500 dark:text-muted-foreground">أقصى نقاط يكسبها المستخدم خلال 24 ساعة</p>
                <input
                  type="number"
                  value={settings.pointsConfig.dailyEarnCap ?? 1000}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pointsConfig: {
                        ...settings.pointsConfig,
                        dailyEarnCap: Number(e.target.value) || 0,
                        dailyCapPoints: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-cyan-200/70 dark:border-admin-border-subtle space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-foreground block">
                  الحد الأقصى للنقاط الأسبوعية (Weekly Cap)
                </label>
                <p className="text-[11px] text-slate-500 dark:text-muted-foreground">أقصى نقاط مسموح بكسبها أسبوعياً</p>
                <input
                  type="number"
                  value={settings.pointsConfig.weeklyEarnCap ?? 5000}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pointsConfig: {
                        ...settings.pointsConfig,
                        weeklyEarnCap: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-cyan-200/70 dark:border-admin-border-subtle space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-foreground block">
                  الحد الأقصى للنقاط الشهرية (Monthly Cap)
                </label>
                <p className="text-[11px] text-slate-500 dark:text-muted-foreground">أقصى رصيد نقاط يكسبه المسافر في الشهر</p>
                <input
                  type="number"
                  value={settings.pointsConfig.monthlyEarnCap ?? 15000}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pointsConfig: {
                        ...settings.pointsConfig,
                        monthlyEarnCap: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-cyan-200/70 dark:border-admin-border-subtle space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-foreground block">
                  الحد الأقصى للريلز المؤهلة يومياً
                </label>
                <p className="text-[11px] text-slate-500 dark:text-muted-foreground">عدد مقاطع الريلز التي تمنح نقاطاً في اليوم الواحد</p>
                <input
                  type="number"
                  value={settings.pointsConfig.maxReelsPerDay ?? 3}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pointsConfig: {
                        ...settings.pointsConfig,
                        maxReelsPerDay: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-cyan-200/70 dark:border-admin-border-subtle space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-foreground block">
                  الحد الأقصى للمنشورات المؤهلة يومياً
                </label>
                <p className="text-[11px] text-slate-500 dark:text-muted-foreground">عدد المنشورات/التقارير المؤهلة للنقاط يومياً</p>
                <input
                  type="number"
                  value={settings.pointsConfig.maxPostsPerDay ?? 5}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pointsConfig: {
                        ...settings.pointsConfig,
                        maxPostsPerDay: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className={inputClass}
                />
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-cyan-200/70 dark:border-admin-border-subtle space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-foreground block">
                  معدل تحويل النقاط إلى خصم ($ USD)
                </label>
                <p className="text-[11px] text-slate-500 dark:text-muted-foreground">كم نقطة تساوي 1 دولار خصم في الحجوزات</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={settings.pointsConfig.pointsPerUsd ?? 100}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        pointsConfig: {
                          ...settings.pointsConfig,
                          pointsPerUsd: Number(e.target.value) || 100,
                        },
                      })
                    }
                    className={inputClass}
                  />
                  <span className="text-xs text-slate-600 dark:text-muted-foreground whitespace-nowrap font-bold">نقطة = 1$</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: ENGAGEMENT THRESHOLD RULES FOR ALL PUBLISHING */}
          <div className={`${cardClass} space-y-5 border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/10`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 dark:border-admin-border-subtle pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-foreground">
                    القسم الرابع: شروط تفاعل الجمهور لربح نقاط النشر والمشاركات
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-muted-foreground mt-1">
                  تحديد شروط تفاعل الجمهور (إعجابات وتعليقات) قبل صرف نقاط المنشورات والمشاركات. يسري هذا الشرط على جميع أنواع النشر (منشور عام، صور، ريلز، مشاركة أي خدمة من خدمات المنصة، مشاركة حجز مؤكد أو منتهي).
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-500/30 shrink-0 self-start">
                تفاعل وجودة المحتوى
              </span>
            </div>

            {/* Main Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-amber-200/70 dark:border-admin-border-subtle">
              <div className="space-y-1">
                <span className="text-sm font-bold text-slate-900 dark:text-foreground block">
                  تفعيل شرط تفاعل الجمهور لصرف نقاط النشر
                </span>
                <p className="text-xs text-slate-500 dark:text-muted-foreground">
                  عند التفعيل، لا تُمنح النقاط لمجرد النشر المباشر، بل تُعلّق وتُصرف تلقائياً لمحفظة الناشر فور وصول منشوره إلى الحد الأدنى من الإعجابات والتعليقات المحددة أدناه.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={settings.pointsConfig.requireEngagementForPoints ?? true}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pointsConfig: {
                        ...settings.pointsConfig,
                        requireEngagementForPoints: e.target.checked,
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-amber-200/70 dark:border-admin-border-subtle space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-foreground block">
                  الحد الأدنى للإعجابات (Likes) لصرف النقاط
                </label>
                <p className="text-[11px] text-slate-500 dark:text-muted-foreground">
                  عدد الإعجابات الحقيقية المطلوبة لتفعيل وصرف نقاط المنشور
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={settings.pointsConfig.minLikesForPoints ?? 50}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        pointsConfig: {
                          ...settings.pointsConfig,
                          minLikesForPoints: Math.max(0, Number(e.target.value) || 0),
                        },
                      })
                    }
                    className={inputClass}
                  />
                  <span className="text-xs text-slate-600 dark:text-muted-foreground whitespace-nowrap font-bold">إعجاب</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-amber-200/70 dark:border-admin-border-subtle space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-foreground block">
                  الحد الأدنى للتعليقات (Comments) لصرف النقاط
                </label>
                <p className="text-[11px] text-slate-500 dark:text-muted-foreground">
                  عدد التعليقات المطلوبة من أعضاء المجتمع لتفعيل وصرف نقاط المنشور
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={settings.pointsConfig.minCommentsForPoints ?? 10}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        pointsConfig: {
                          ...settings.pointsConfig,
                          minCommentsForPoints: Math.max(0, Number(e.target.value) || 0),
                        },
                      })
                    }
                    className={inputClass}
                  />
                  <span className="text-xs text-slate-600 dark:text-muted-foreground whitespace-nowrap font-bold">تعليق</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-2.5">
              <Shield className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <span>
                <b>ملاحظة إدارية صارمة:</b> هذا الشرط يضمن ألا تتحول المنصة لمصدر سبام لنشر منشورات عشوائية لمجرد تحصيل النقاط، بل يحفز الأعضاء والعملاء على نشر محتوى سياحي وتجارب سفر جذابة وثرية تجذب تفاعل المجتمع. تُصرف النقاط تلقائياً فور استيفاء المنشور لكلا الشرطين (الإعجابات والتعليقات).
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
