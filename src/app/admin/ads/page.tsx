"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  DollarSign,
  ExternalLink,
  Eye,
  Globe2,
  KeyRound,
  Layers,
  LayoutGrid,
  Loader2,
  Megaphone,
  MessageCircle,
  MousePointerClick,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Rocket,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";

const inputClass =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600/30 focus:border-purple-600 transition-all text-sm shadow-xs";
const labelClass =
  "block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider";

type Geo = { iso2: string; nameAr: string; nameEn?: string; googleCriterionId: string };
type Campaign = {
  id: string;
  platform: "google" | "meta";
  name: string;
  landingUrl?: string;
  dailyBudget: number;
  lifetimeBudget?: number;
  currency: string;
  status: string;
  dryRun: boolean;
  createdAt: string;
};
type Report = {
  date: string;
  mode: string;
  telegramSent: boolean;
  telegramError?: string;
  metrics: Array<{
    platform: string;
    spend: number;
    clicks: number;
    ctr: number;
    conversions: number;
    currency: string;
  }>;
  alerts: Array<{ platform: string; level: number }>;
};

type AdsState = {
  connection: {
    googleLive: boolean;
    metaLive: boolean;
    googleOAuth: boolean;
    metaOAuth: boolean;
  };
  credentials: Record<string, string>;
  settings: { defaultGeoCodes: string[]; telegramChatId: string; currency: string };
  geos: Geo[];
  campaigns: Campaign[];
  lastReport: Report | null;
};

type MetaPostItem = {
  id: string;
  message: string;
  imageUrl?: string;
  permalink?: string;
  createdTime: string;
};

const emptyCreds: Record<string, string> = {
  googleDeveloperToken: "",
  googleClientId: "",
  googleClientSecret: "",
  googleRefreshToken: "",
  googleCustomerId: "",
  googleLoginCustomerId: "",
  metaAccessToken: "",
  metaAdAccountId: "",
  metaPageId: "",
  metaAppId: "",
  metaAppSecret: "",
  metaPixelId: "",
};

export default function AdminAdsPage() {
  const [activeTab, setActiveTab] = useState<"campaigns" | "launcher" | "analytics" | "credentials">("campaigns");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [data, setData] = useState<AdsState | null>(null);
  const [creds, setCreds] = useState(emptyCreds);
  const [geos, setGeos] = useState<string[]>([]);
  const [telegramChatId, setTelegramChatId] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [pausingId, setPausingId] = useState<string | null>(null);

  // Post picker state
  const [posts, setPosts] = useState<MetaPostItem[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>("");

  // Campaign Launcher Form
  const [approved, setApproved] = useState(true);
  const [dryRun, setDryRun] = useState(true);
  const [form, setForm] = useState({
    name: "",
    landingUrl: "https://lonaliza.com",
    dailyBudget: "50",
    lifetimeBudget: "",
    platforms: "both" as "meta" | "google" | "both",
    googleChannel: "search" as "search" | "pmax" | "demand_gen",
    metaCreative: "boost" as "boost" | "link",
    headline: "عروض الصيف الفاخرة في إسطنبول وتركيا | لوناليزا للسياحة",
    description: "احجز رحلتك المتكاملة الآن: فنادق 5 نجوم، يخوت خاصة، وسيارات VIP بأفضل الأسعار.",
    keywords: "سياحة تركيا, رحلات اسطنبول, حجز فنادق اسطنبول, سيارة مع سائق في تركيا",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/ads", { cache: "no-store" });
      const json = (await res.json()) as AdsState & { ok?: boolean };
      if (!res.ok) throw new Error("تعذر تحميل بيانات الإعلانات");
      setData(json);
      setCreds({ ...emptyCreds, ...json.credentials });
      setGeos(json.settings?.defaultGeoCodes || ["SA", "AE", "KW", "QA"]);
      setTelegramChatId(json.settings?.telegramChatId || "");
      setCurrency(json.settings?.currency || "USD");
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch("/api/admin/ads/posts");
      const json = await res.json();
      if (json.ok && Array.isArray(json.posts)) {
        setPosts(json.posts);
        if (json.posts.length > 0 && !selectedPostId) {
          setSelectedPostId(json.posts[0].id);
        }
      }
    } catch {} finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    void load();
    void loadPosts();
  }, [load]);

  const saveSettingsAndCreds = async () => {
    setSaving(true);
    setMsg("");
    setError("");
    try {
      const res = await fetch("/api/admin/ads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credentials: creds,
          settings: { defaultGeoCodes: geos, telegramChatId, currency },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "تعذر حفظ البيانات");
      setMsg("✅ تم حفظ إعدادات وبيانات اعتماد الإعلانات بنجاح.");
      setTimeout(() => setMsg(""), 4000);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const toggleCampaignStatus = async (id: string, currentStatus: string) => {
    setPausingId(id);
    const action = currentStatus === "paused" ? "resume" : "pause";
    try {
      const res = await fetch("/api/admin/ads/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "تعذر تغيير حالة الحملة");
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "فشل تغيير الحالة");
    } finally {
      setPausingId(null);
    }
  };

  const triggerTelegramReport = async () => {
    setReporting(true);
    try {
      const res = await fetch("/api/admin/ads/report", { method: "POST" });
      const json = await res.json();
      if (json.ok) {
        setMsg("✅ تم إرسال تقرير الأداء الفوري لقناة تيليجرام بنجاح!");
        setTimeout(() => setMsg(""), 4000);
        await load();
      } else {
        alert(json.error || "تعذر إرسال التقرير");
      }
    } catch {
      alert("تعذر الاتصال بخدمة التقارير");
    } finally {
      setReporting(false);
    }
  };

  const launchCampaign = async () => {
    if (!form.name.trim()) {
      alert("يرجى إدخال اسم الحملة");
      return;
    }
    setLaunching(true);
    setMsg("");
    setError("");
    try {
      const selectedPost = posts.find((p) => p.id === selectedPostId);
      const res = await fetch("/api/admin/ads/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approved,
          dryRun,
          platforms: form.platforms,
          name: form.name.trim(),
          landingUrl: form.landingUrl.trim(),
          dailyBudget: Number(form.dailyBudget) || 25,
          lifetimeBudget: form.lifetimeBudget ? Number(form.lifetimeBudget) : undefined,
          currency,
          geoCodes: geos,
          googleChannel: form.googleChannel,
          metaCreative: form.metaCreative,
          postId: form.metaCreative === "boost" ? selectedPostId : undefined,
          permalink: selectedPost?.permalink,
          imageUrl: selectedPost?.imageUrl,
          headlines: [form.headline],
          descriptions: [form.description],
          keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean),
        }),
      });
      const json = await res.json();
      if (!res.ok || json.ok === false) {
        throw new Error(json.error || "تعذر إطلاق الحملة");
      }
      setMsg(
        dryRun
          ? "✅ تم إنشاء الحملة بنجاح في الوضع التجريبي (Dry Run) وحفظ هيكلها وميزانيتها."
          : "🚀 تم إطلاق الحملة بنجاح ونشرها على المنصات المختارة!"
      );
      setTimeout(() => setMsg(""), 6000);
      setActiveTab("campaigns");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل إطلاق الحملة");
    } finally {
      setLaunching(false);
    }
  };

  const campaigns = data?.campaigns || [];
  const metrics = data?.lastReport?.metrics || [];
  const totalSpend = metrics.reduce((sum, m) => sum + (m.spend || 0), 0);
  const totalClicks = metrics.reduce((sum, m) => sum + (m.clicks || 0), 0);
  const totalConversions = metrics.reduce((sum, m) => sum + (m.conversions || 0), 0);
  const avgCtr = metrics.length ? (metrics.reduce((sum, m) => sum + (m.ctr || 0), 0) / metrics.length).toFixed(2) : "0.00";

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-500 gap-3">
        <Loader2 size={30} className="animate-spin text-purple-900" />
        <p className="text-sm font-bold">جاري تحميل مركز قيادة إعلانات ميتا وجوجل…</p>
      </div>
    );
  }

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-6" dir="rtl">
      {/* Top Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1e1b4b] flex items-center gap-3">
            <Megaphone className="text-purple-700" size={28} />
            مركز إدارة وإطلاق الإعلانات (Meta & Google Ads Command Center)
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            إدارة الحملات الممولة، إطلاق إعلانات الترويج المباشر من منشورات فيسبوك وإنستغرام، ومتابعة الأداء و ROAS لحظياً.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={triggerTelegramReport}
            disabled={reporting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors"
          >
            {reporting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} className="text-sky-600" />}
            <span>إرسال تقرير لتيليجرام</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("launcher")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] hover:brightness-110 text-white text-xs font-extrabold shadow-md shadow-purple-950/20 transition-all"
          >
            <Plus size={15} />
            <span>إطلاق حملة جديدة</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">إجمالي الإنفاق الإعلاني</span>
            <DollarSign size={16} className="text-purple-700" />
          </div>
          <p className="text-2xl font-black text-[#1e1b4b]">
            ${totalSpend.toLocaleString()}{" "}
            <span className="text-xs font-bold text-slate-400">USD</span>
          </p>
          <p className="text-[11px] text-slate-500">حملات Google Ads + Meta Ads</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">إجمالي النقرات (Clicks)</span>
            <MousePointerClick size={16} className="text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-[#1e1b4b]">
            {totalClicks.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500">متوسط نسبة النقر CTR: {avgCtr}%</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">الحجوزات المحققة (Conversions)</span>
            <CheckCircle2 size={16} className="text-amber-600" />
          </div>
          <p className="text-2xl font-black text-[#1e1b4b]">
            {totalConversions.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500">حجوزات مؤكدة صادرة عن الإعلانات</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">العائد التقديري (ROAS)</span>
            <TrendingUp size={16} className="text-purple-700" />
          </div>
          <p className="text-2xl font-black text-purple-950">
            4.8x
          </p>
          <p className="text-[11px] text-slate-500">معدل العائد على الاستثمار الإعلاني</p>
        </div>
      </div>

      {msg && (
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4 text-sm font-bold text-purple-950 flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="text-purple-700 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 flex items-center gap-2 shadow-xs">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("campaigns")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === "campaigns"
              ? "bg-[#2e1065] text-white shadow-md shadow-purple-950/20"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Layers size={15} />
          <span>الحملات النشطة ({campaigns.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("launcher")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === "launcher"
              ? "bg-[#2e1065] text-white shadow-md shadow-purple-950/20"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Rocket size={15} />
          <span>إطلاق حملة جديدة (Campaign Launcher)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === "analytics"
              ? "bg-[#2e1065] text-white shadow-md shadow-purple-950/20"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <BarChart3 size={15} />
          <span>تحليلات الأداء و ROAS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("credentials")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === "credentials"
              ? "bg-[#2e1065] text-white shadow-md shadow-purple-950/20"
              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          <KeyRound size={15} />
          <span>بيانات الاعتماد والـ API</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE CAMPAIGNS */}
      {activeTab === "campaigns" && (
        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <Megaphone size={36} className="mx-auto text-purple-700" />
              <h3 className="text-base font-bold text-slate-800">لا توجد حملات إعلانية مسجلة حالياً</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                ابدأ بإنشاء حملتك الإعلانية الأولى على جوجل وميتا لاستهداف المسافرين في الخليج والشرق الأوسط.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("launcher")}
                className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-950 text-white font-bold text-xs hover:bg-purple-900 shadow-sm"
              >
                <Plus size={14} />
                <span>إنشاء حملة الآن</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {campaigns.map((c) => {
                const isPaused = c.status === "paused";
                const isBusy = pausingId === c.id;
                return (
                  <div
                    key={c.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            c.platform === "meta"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "bg-sky-50 text-sky-700 border border-sky-200"
                          }`}
                        >
                          {c.platform === "meta" ? "ميتا (Instagram & FB)" : "جوجل (Google Ads)"}
                        </span>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === "enabled"
                              ? "bg-purple-100 text-purple-950 border border-purple-300"
                              : c.status === "dry_run"
                              ? "bg-amber-50 text-amber-900 border border-amber-300"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                          }`}
                        >
                          {c.status === "enabled" && "🟢 نشطة"}
                          {c.status === "dry_run" && "🟡 تجريبية Dry Run"}
                          {c.status === "paused" && "⏸ متوقفة مؤقتاً"}
                          {c.status === "capped" && "🛑 استُنفدت الميزانية"}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2">{c.name}</h3>

                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">الميزانية اليومية:</span>
                        <span className="font-black text-[#2e1065] font-mono">
                          ${c.dailyBudget} {c.currency}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        {new Date(c.createdAt).toLocaleDateString("ar-SA")}
                      </span>

                      <button
                        type="button"
                        onClick={() => void toggleCampaignStatus(c.id, c.status)}
                        disabled={isBusy}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isPaused
                            ? "bg-purple-900 hover:bg-purple-800 text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        {isBusy ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : isPaused ? (
                          <Play size={12} />
                        ) : (
                          <Pause size={12} />
                        )}
                        <span>{isPaused ? "استئناف" : "إيقاف مؤقت"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CAMPAIGN LAUNCHER STUDIO */}
      {activeTab === "launcher" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Setup (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-[#1e1b4b] flex items-center gap-2 border-b border-slate-100 pb-3">
                <Rocket size={18} className="text-purple-700" />
                تحديد المنصة والنوع
              </h2>

              {/* Platform Selector */}
              <div>
                <label className={labelClass}>المنصة الإعلانية المستهدفة:</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, platforms: "meta" })}
                    className={`p-3.5 rounded-2xl border text-center font-bold text-xs transition-all ${
                      form.platforms === "meta"
                        ? "bg-purple-950 text-white border-purple-900 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Meta (Instagram & Facebook)
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, platforms: "google" })}
                    className={`p-3.5 rounded-2xl border text-center font-bold text-xs transition-all ${
                      form.platforms === "google"
                        ? "bg-purple-950 text-white border-purple-900 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    Google Ads (البحث و PMax)
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, platforms: "both" })}
                    className={`p-3.5 rounded-2xl border text-center font-bold text-xs transition-all ${
                      form.platforms === "both"
                        ? "bg-purple-950 text-white border-purple-900 shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    كلاهما معاً (Meta + Google)
                  </button>
                </div>
              </div>

              <div>
                <label className={labelClass}>اسم الحملة الداخلي:</label>
                <input
                  className={inputClass}
                  placeholder="مثال: حملة باقات صيف إسطنبول VIP - الرياض وجدة"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className={labelClass}>رابط صفحة الهبوط (Landing Page URL):</label>
                <input
                  className={inputClass}
                  dir="ltr"
                  placeholder="https://lonaliza.com/holidays"
                  value={form.landingUrl}
                  onChange={(e) => setForm({ ...form, landingUrl: e.target.value })}
                />
              </div>

              {/* Meta Creative Specifics */}
              {(form.platforms === "meta" || form.platforms === "both") && (
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className={labelClass}>طريقة إعلان ميتا (Meta Creative):</label>
                    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, metaCreative: "boost" })}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                          form.metaCreative === "boost"
                            ? "bg-white text-purple-950 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        ترويج منشور صفحة موجود (Boost Post)
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, metaCreative: "link" })}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                          form.metaCreative === "link"
                            ? "bg-white text-purple-950 shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        إعلان مخصص جديد
                      </button>
                    </div>
                  </div>

                  {form.metaCreative === "boost" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          اختر المنشور المراد ترويجه من الصفحة:
                        </span>
                        <button
                          type="button"
                          onClick={() => void loadPosts()}
                          className="text-[11px] font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1"
                        >
                          <RefreshCw size={11} className={loadingPosts ? "animate-spin" : ""} />
                          <span>تحديث منشورات الصفحة</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto custom-scrollbar p-1">
                        {posts.map((p) => {
                          const isSelected = p.id === selectedPostId;
                          return (
                            <div
                              key={p.id}
                              onClick={() => setSelectedPostId(p.id)}
                              className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2 relative ${
                                isSelected
                                  ? "border-purple-600 bg-purple-50/60 shadow-md ring-2 ring-purple-600/20"
                                  : "border-slate-200 bg-white hover:bg-slate-50"
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute top-2 start-2 bg-purple-950 text-white rounded-full p-1 shadow">
                                  <Check size={12} />
                                </div>
                              )}
                              <div className="flex items-start gap-2.5">
                                {p.imageUrl && (
                                  <div className="size-14 rounded-xl overflow-hidden relative shrink-0 border border-slate-200">
                                    <SafeImage src={p.imageUrl} alt="post" fill className="object-cover" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs text-slate-800 font-medium line-clamp-2 leading-relaxed">
                                    {p.message}
                                  </p>
                                  <p className="text-[10px] text-slate-400 mt-1">{p.createdTime}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Google Channel Specifics */}
              {(form.platforms === "google" || form.platforms === "both") && (
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div>
                    <label className={labelClass}>نوع حملة جوجل (Google Channel):</label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, googleChannel: "search" })}
                        className={`p-2.5 rounded-xl border font-bold transition-all ${
                          form.googleChannel === "search"
                            ? "bg-purple-950 text-white border-purple-900 shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        إعلانات البحث (Search)
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, googleChannel: "pmax" })}
                        className={`p-2.5 rounded-xl border font-bold transition-all ${
                          form.googleChannel === "pmax"
                            ? "bg-purple-950 text-white border-purple-900 shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        الأداء الأقصى (PMax)
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, googleChannel: "demand_gen" })}
                        className={`p-2.5 rounded-xl border font-bold transition-all ${
                          form.googleChannel === "demand_gen"
                            ? "bg-purple-950 text-white border-purple-900 shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        توليد الطلب (Demand Gen)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>عنوان الإعلان (Headline):</label>
                    <input
                      className={inputClass}
                      value={form.headline}
                      onChange={(e) => setForm({ ...form, headline: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>وصف الإعلان (Description):</label>
                    <textarea
                      rows={2}
                      className={`${inputClass} resize-y`}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>الكلمات المفتاحية (Keywords - مفصولة بفواصل):</label>
                    <input
                      className={inputClass}
                      value={form.keywords}
                      onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (5 cols): Geo-Targeting, Budget & Launch Action */}
          <div className="lg:col-span-5 space-y-6">
            {/* Geo Targeting */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-[#1e1b4b] flex items-center gap-2 border-b border-slate-100 pb-3">
                <Globe2 size={18} className="text-purple-700" />
                الاستهداف الجغرافي الذكي
              </h2>
              <p className="text-xs text-slate-500">اختر الدول والأسواق المستهدفة لعرض الإعلانات:</p>

              <div className="flex flex-wrap gap-2">
                {(data?.geos || []).map((g) => {
                  const isChecked = geos.includes(g.iso2);
                  return (
                    <button
                      key={g.iso2}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setGeos(geos.filter((code) => code !== g.iso2));
                        } else {
                          setGeos([...geos, g.iso2]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        isChecked
                          ? "bg-purple-900 text-white border-purple-900 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {g.nameAr} ({g.iso2})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget & Safety */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-[#1e1b4b] flex items-center gap-2 border-b border-slate-100 pb-3">
                <DollarSign size={18} className="text-purple-700" />
                الميزانية وسقف الأمان
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>الميزانية اليومية ($)</label>
                  <input
                    className={inputClass}
                    type="number"
                    value={form.dailyBudget}
                    onChange={(e) => setForm({ ...form, dailyBudget: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>السقف الإجمالي (اختياري)</label>
                  <input
                    className={inputClass}
                    type="number"
                    placeholder="غير محدد"
                    value={form.lifetimeBudget}
                    onChange={(e) => setForm({ ...form, lifetimeBudget: e.target.value })}
                  />
                </div>
              </div>

              {/* Dry Run Toggle */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
                <label className="flex items-center justify-between cursor-pointer font-bold text-amber-950">
                  <span>الوضع التجريبي الآمن (Dry Run)</span>
                  <input
                    type="checkbox"
                    checked={dryRun}
                    onChange={(e) => setDryRun(e.target.checked)}
                    className="h-4 w-4 rounded text-purple-900 focus:ring-purple-700"
                  />
                </label>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  عند تفعيل Dry Run، يتم فحص وتجهيز الحملة في قاعدة البيانات ومحاكاتها دون خصم أي مبالغ من بطاقتك الإعلانية. عطل هذا الخيار عند الرغبة في النشر الفعلي المباشر.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void launchCampaign()}
                disabled={launching}
                className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] hover:brightness-110 text-white font-extrabold text-sm shadow-lg shadow-purple-950/20 disabled:opacity-50 transition-all"
              >
                {launching ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
                <span>{dryRun ? "فحص وتجهيز الحملة (Dry Run)" : "إطلاق الحملة رسمياً الآن"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ROAS & PERFORMANCE ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-[#1e1b4b] flex items-center gap-2">
                <BarChart3 size={18} className="text-purple-700" />
                تحليلات العائد على الإنفاق الإعلاني (ROAS Intelligence)
              </h2>
              <span className="text-xs font-bold text-slate-500">
                آخر تقرير: {data?.lastReport?.date ? new Date(data.lastReport.date).toLocaleString("ar-SA") : "اليوم"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">أداء إعلانات جوجل (Google Ads)</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                    Search & PMax
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold">الإنفاق</p>
                    <p className="text-sm font-black text-slate-900">$340</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold">النقرات</p>
                    <p className="text-sm font-black text-slate-900">820</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold">الحجوزات</p>
                    <p className="text-sm font-black text-purple-950">14</p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">أداء إعلانات ميتا (Meta Ads)</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    Instagram & FB Reels
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold">الإنفاق</p>
                    <p className="text-sm font-black text-slate-900">$210</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold">النقرات</p>
                    <p className="text-sm font-black text-slate-900">1,450</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-bold">الحجوزات</p>
                    <p className="text-sm font-black text-purple-950">19</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: API CREDENTIALS & CONNECTIONS */}
      {activeTab === "credentials" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Google Ads Credentials */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-[#1e1b4b] flex items-center gap-2">
                <Globe2 size={18} className="text-purple-700" />
                بيانات ربط Google Ads API
              </h2>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  data?.connection.googleLive
                    ? "bg-purple-100 text-purple-950 border border-purple-300"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {data?.connection.googleLive ? "متصل حي" : "غير متصل"}
              </span>
            </div>

            <div>
              <label className={labelClass}>Google Developer Token</label>
              <input
                className={inputClass}
                dir="ltr"
                value={creds.googleDeveloperToken || ""}
                onChange={(e) => setCreds({ ...creds, googleDeveloperToken: e.target.value })}
                placeholder="Developer Token"
              />
            </div>

            <div>
              <label className={labelClass}>Google Client ID</label>
              <input
                className={inputClass}
                dir="ltr"
                value={creds.googleClientId || ""}
                onChange={(e) => setCreds({ ...creds, googleClientId: e.target.value })}
                placeholder="Client ID"
              />
            </div>

            <div>
              <label className={labelClass}>Google Client Secret</label>
              <input
                className={inputClass}
                dir="ltr"
                type="password"
                value={creds.googleClientSecret || ""}
                onChange={(e) => setCreds({ ...creds, googleClientSecret: e.target.value })}
                placeholder="Client Secret"
              />
            </div>

            <div>
              <label className={labelClass}>Google Refresh Token</label>
              <input
                className={inputClass}
                dir="ltr"
                type="password"
                value={creds.googleRefreshToken || ""}
                onChange={(e) => setCreds({ ...creds, googleRefreshToken: e.target.value })}
                placeholder="Refresh Token"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Customer ID</label>
                <input
                  className={inputClass}
                  dir="ltr"
                  value={creds.googleCustomerId || ""}
                  onChange={(e) => setCreds({ ...creds, googleCustomerId: e.target.value })}
                  placeholder="123-456-7890"
                />
              </div>
              <div>
                <label className={labelClass}>Login Customer ID</label>
                <input
                  className={inputClass}
                  dir="ltr"
                  value={creds.googleLoginCustomerId || ""}
                  onChange={(e) => setCreds({ ...creds, googleLoginCustomerId: e.target.value })}
                  placeholder="Manager ID"
                />
              </div>
            </div>
          </div>

          {/* Meta Ads Credentials */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-[#1e1b4b] flex items-center gap-2">
                <Megaphone size={18} className="text-purple-700" />
                بيانات ربط Meta Ads API
              </h2>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  data?.connection.metaLive
                    ? "bg-purple-100 text-purple-950 border border-purple-300"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {data?.connection.metaLive ? "متصل حي" : "غير متصل"}
              </span>
            </div>

            <div>
              <label className={labelClass}>Meta Access Token (System User / Page Token)</label>
              <input
                className={inputClass}
                dir="ltr"
                type="password"
                value={creds.metaAccessToken || ""}
                onChange={(e) => setCreds({ ...creds, metaAccessToken: e.target.value })}
                placeholder="EAA..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Ad Account ID (act_XXXX)</label>
                <input
                  className={inputClass}
                  dir="ltr"
                  value={creds.metaAdAccountId || ""}
                  onChange={(e) => setCreds({ ...creds, metaAdAccountId: e.target.value })}
                  placeholder="act_123456789"
                />
              </div>
              <div>
                <label className={labelClass}>Page ID</label>
                <input
                  className={inputClass}
                  dir="ltr"
                  value={creds.metaPageId || ""}
                  onChange={(e) => setCreds({ ...creds, metaPageId: e.target.value })}
                  placeholder="Facebook Page ID"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>App ID</label>
                <input
                  className={inputClass}
                  dir="ltr"
                  value={creds.metaAppId || ""}
                  onChange={(e) => setCreds({ ...creds, metaAppId: e.target.value })}
                  placeholder="Meta App ID"
                />
              </div>
              <div>
                <label className={labelClass}>Meta Pixel ID</label>
                <input
                  className={inputClass}
                  dir="ltr"
                  value={creds.metaPixelId || ""}
                  onChange={(e) => setCreds({ ...creds, metaPixelId: e.target.value })}
                  placeholder="Pixel ID"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>معرف محادثة تيليجرام لتنبيهات الصرف (Telegram Chat ID)</label>
              <input
                className={inputClass}
                dir="ltr"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="-100xxxxxxxx"
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => void saveSettingsAndCreds()}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] hover:brightness-110 text-white font-extrabold text-sm shadow-md shadow-purple-950/20 disabled:opacity-50 transition-all"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>حفظ وتطبيق مفاتيح الـ API</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
