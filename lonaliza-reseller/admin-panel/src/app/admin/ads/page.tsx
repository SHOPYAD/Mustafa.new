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
import { AdminKpi, AdminKpiStrip, AdminPage } from "@/components/admin/layout";
import { EnterprisePageHeader } from "@/components/admin/enterprise";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const inputClass = "admin-field";
const labelClass = "admin-field-label";

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
      <div className="flex flex-col items-center justify-center py-28 text-[color:var(--admin-text-muted)] gap-3">
        <Loader2 size={30} className="animate-spin text-[color:var(--admin-gold)]" />
        <p className="text-sm font-bold">جاري تحميل مركز قيادة إعلانات ميتا وجوجل…</p>
      </div>
    );
  }

  return (
    <AdminPage className="space-y-6 w-full min-w-0" dir="rtl">
      <EnterprisePageHeader
        icon={Megaphone}
        title="مركز إدارة وإطلاق الإعلانات"
        description="إدارة الحملات الممولة، إطلاق إعلانات الترويج المباشر، ومتابعة الأداء و ROAS."
        badge="Performance Marketing"
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={triggerTelegramReport}
              disabled={reporting}
              className="rounded-xl border-border/60"
            >
              {reporting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              <span>إرسال تقرير لتيليجرام</span>
            </Button>
            <Button
              type="button"
              onClick={() => setActiveTab("launcher")}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-md shadow-violet-500/25"
            >
              <Plus size={15} />
              <span>إطلاق حملة جديدة</span>
            </Button>
          </div>
        }
      />

      <AdminKpiStrip cols={4}>
        <AdminKpi
          label="إجمالي الإنفاق الإعلاني"
          value={`$${totalSpend.toLocaleString()}`}
          hint="حملات Google Ads + Meta Ads"
          icon={<DollarSign size={16} />}
        />

        <AdminKpi
          label="إجمالي النقرات"
          value={totalClicks.toLocaleString()}
          hint={`متوسط CTR: ${avgCtr}%`}
          icon={<MousePointerClick size={16} />}
        />
        <AdminKpi
          label="الحجوزات المحققة"
          value={totalConversions.toLocaleString()}
          hint="حجوزات مؤكدة صادرة عن الإعلانات"
          icon={<CheckCircle2 size={16} />}
        />
        <AdminKpi
          label="العائد التقديري (ROAS)"
          value="4.8x"
          hint="معدل العائد على الاستثمار الإعلاني"
          icon={<TrendingUp size={16} />}
        />
      </AdminKpiStrip>

      {msg ? (
        <Alert>
          <CheckCircle2 />
          <AlertDescription>{msg}</AlertDescription>
        </Alert>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="flex flex-col"
      >
        <TabsList className="h-8 w-full shrink-0 justify-start overflow-x-auto">
          <TabsTrigger value="campaigns">الحملات النشطة ({campaigns.length})</TabsTrigger>
          <TabsTrigger value="launcher">إطلاق حملة</TabsTrigger>
          <TabsTrigger value="analytics">تحليلات ROAS</TabsTrigger>
          <TabsTrigger value="credentials">بيانات الاعتماد</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* TAB 1: ACTIVE CAMPAIGNS */}
      {activeTab === "campaigns" && (
        <div className="space-y-4">
          {campaigns.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>لا توجد حملات إعلانية مسجلة حالياً</EmptyTitle>
                <EmptyDescription>
                  ابدأ بإنشاء حملتك الإعلانية الأولى على جوجل وميتا لاستهداف المسافرين في الخليج والشرق الأوسط.
                </EmptyDescription>
              </EmptyHeader>
              <Button type="button" onClick={() => setActiveTab("launcher")}>
                <Plus size={14} />
                إنشاء حملة الآن
              </Button>
            </Empty>
          ) : (
            <Card>
              <CardContent className="space-y-4 pt-6">
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الحملة</TableHead>
                    <TableHead>المنصة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الميزانية</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((c) => {
                    const isPaused = c.status === "paused";
                    const isBusy = pausingId === c.id;
                    return (
                      <TableRow key={c.id}>
                        <TableCell className="font-semibold">{c.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {c.platform === "meta" ? "ميتا (Instagram & FB)" : "جوجل (Google Ads)"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {c.status === "enabled" && "نشطة"}
                          {c.status === "dry_run" && "تجريبية"}
                          {c.status === "paused" && "متوقفة"}
                          {c.status === "capped" && "استُنفدت الميزانية"}
                        </TableCell>
                        <TableCell className="font-mono">
                          ${c.dailyBudget} {c.currency}
                        </TableCell>
                        <TableCell className="text-xs">{new Date(c.createdAt).toLocaleDateString("ar-SA")}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => void toggleCampaignStatus(c.id, c.status)}
                            disabled={isBusy}
                          >
                            {isBusy ? <Loader2 size={12} className="animate-spin" /> : isPaused ? <Play size={12} /> : <Pause size={12} />}
                            {isPaused ? "استئناف" : "إيقاف مؤقت"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="grid gap-3 md:hidden">
              {campaigns.map((c) => {
                const isPaused = c.status === "paused";
                return (
                  <Card key={`m-${c.id}`}>
                    <CardContent className="space-y-2 pt-4">
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-sm text-muted-foreground">{c.platform === "meta" ? "ميتا" : "جوجل"} · ${c.dailyBudget}</p>
                    <Button type="button" size="sm" variant="outline" onClick={() => void toggleCampaignStatus(c.id, c.status)}>
                      {isPaused ? "استئناف" : "إيقاف مؤقت"}
                    </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: CAMPAIGN LAUNCHER STUDIO */}
      {activeTab === "launcher" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Setup (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                <Rocket size={18} className="text-[color:var(--admin-gold)]" />
                تحديد المنصة والنوع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">

              {/* Platform Selector */}
              <div>
                <label className={labelClass}>المنصة الإعلانية المستهدفة:</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, platforms: "meta" })}
                    className={`p-3.5 rounded-2xl border text-center font-bold text-xs transition-all ${
                      form.platforms === "meta"
                        ? "bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] border-transparent"
                        : "bg-[color:var(--admin-bg-subtle)] border-[color:var(--admin-border-subtle)] text-[color:var(--admin-text-primary)]"
                    }`}
                  >
                    Meta (Instagram & Facebook)
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, platforms: "google" })}
                    className={`p-3.5 rounded-2xl border text-center font-bold text-xs transition-all ${
                      form.platforms === "google"
                        ? "bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] border-transparent"
                        : "bg-[color:var(--admin-bg-subtle)] border-[color:var(--admin-border-subtle)] text-[color:var(--admin-text-primary)]"
                    }`}
                  >
                    Google Ads (البحث و PMax)
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, platforms: "both" })}
                    className={`p-3.5 rounded-2xl border text-center font-bold text-xs transition-all ${
                      form.platforms === "both"
                        ? "bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] border-transparent"
                        : "bg-[color:var(--admin-bg-subtle)] border-[color:var(--admin-border-subtle)] text-[color:var(--admin-text-primary)]"
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
                <div className="pt-4 border-t border-[color:var(--admin-border-subtle)] space-y-4">
                  <div className="flex items-center justify-between">
                    <label className={labelClass}>طريقة إعلان ميتا (Meta Creative):</label>
                    <div className="admin-range text-xs">
                      <button
                        type="button"
                        data-active={form.metaCreative === "boost"}
                        onClick={() => setForm({ ...form, metaCreative: "boost" })}
                      >
                        ترويج منشور صفحة موجود (Boost Post)
                      </button>
                      <button
                        type="button"
                        data-active={form.metaCreative === "link"}
                        onClick={() => setForm({ ...form, metaCreative: "link" })}
                      >
                        إعلان مخصص جديد
                      </button>
                    </div>
                  </div>

                  {form.metaCreative === "boost" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[color:var(--admin-text-primary)]">
                          اختر المنشور المراد ترويجه من الصفحة:
                        </span>
                        <button
                          type="button"
                          onClick={() => void loadPosts()}
                          className="text-[11px] font-bold text-[color:var(--admin-gold)] inline-flex items-center gap-1"
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
                                  ? "border-[color:var(--admin-gold)] bg-[color:var(--admin-gold-soft)] shadow-md ring-2 ring-[color:var(--admin-gold)]/20"
                                  : "border-[color:var(--admin-border-subtle)] bg-[color:var(--admin-bg-surface)] hover:bg-[color:var(--admin-bg-subtle)]"
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute top-2 start-2 bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] rounded-full p-1 shadow">
                                  <Check size={12} />
                                </div>
                              )}
                              <div className="flex items-start gap-2.5">
                                {p.imageUrl && (
                                  <div className="size-14 rounded-xl overflow-hidden relative shrink-0 border border-[color:var(--admin-border-subtle)]">
                                    <SafeImage src={p.imageUrl} alt="post" fill className="object-cover" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium line-clamp-2 leading-relaxed">
                                    {p.message}
                                  </p>
                                  <p className="text-[10px] text-[color:var(--admin-text-muted)] mt-1">{p.createdTime}</p>
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
                <div className="pt-4 border-t border-[color:var(--admin-border-subtle)] space-y-4">
                  <div>
                    <label className={labelClass}>نوع حملة جوجل (Google Channel):</label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, googleChannel: "search" })}
                        className={`p-2.5 rounded-xl border font-bold transition-all ${
                          form.googleChannel === "search"
                            ? "bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] border-transparent"
                            : "bg-[color:var(--admin-bg-subtle)] border-[color:var(--admin-border-subtle)] text-[color:var(--admin-text-primary)]"
                        }`}
                      >
                        إعلانات البحث (Search)
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, googleChannel: "pmax" })}
                        className={`p-2.5 rounded-xl border font-bold transition-all ${
                          form.googleChannel === "pmax"
                            ? "bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] border-transparent"
                            : "bg-[color:var(--admin-bg-subtle)] border-[color:var(--admin-border-subtle)] text-[color:var(--admin-text-primary)]"
                        }`}
                      >
                        الأداء الأقصى (PMax)
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, googleChannel: "demand_gen" })}
                        className={`p-2.5 rounded-xl border font-bold transition-all ${
                          form.googleChannel === "demand_gen"
                            ? "bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] border-transparent"
                            : "bg-[color:var(--admin-bg-subtle)] border-[color:var(--admin-border-subtle)] text-[color:var(--admin-text-primary)]"
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
              </CardContent>
            </Card>
          </div>

          {/* Right Column (5 cols): Geo-Targeting, Budget & Launch Action */}
          <div className="lg:col-span-5 space-y-6">
            {/* Geo Targeting */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                <Globe2 size={18} className="text-[color:var(--admin-gold)]" />
                الاستهداف الجغرافي الذكي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
              <p className="text-xs text-[color:var(--admin-text-muted)]">اختر الدول والأسواق المستهدفة لعرض الإعلانات:</p>

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
                          ? "bg-[color:var(--admin-gold)] text-[color:var(--admin-gold-foreground)] border-transparent shadow-xs"
                          : "bg-[color:var(--admin-bg-subtle)] border-[color:var(--admin-border-subtle)] text-[color:var(--admin-text-primary)]"
                      }`}
                    >
                      {g.nameAr} ({g.iso2})
                    </button>
                  );
                })}
              </div>
              </CardContent>
            </Card>

            {/* Budget & Safety */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign size={18} className="text-[color:var(--admin-gold)]" />
                الميزانية وسقف الأمان
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

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
              <div className="p-4 rounded-2xl bg-[color:var(--admin-gold-soft)] border border-[color:var(--admin-border-strong)] space-y-2 text-xs">
                <label className="flex items-center justify-between cursor-pointer font-bold text-[color:var(--admin-text-primary)]">
                  <span>الوضع التجريبي الآمن (Dry Run)</span>
                  <input
                    type="checkbox"
                    checked={dryRun}
                    onChange={(e) => setDryRun(e.target.checked)}
                    className="h-4 w-4 rounded accent-[color:var(--admin-gold)]"
                  />
                </label>
                <p className="text-[color:var(--admin-text-muted)] leading-relaxed text-[11px]">
                  عند تفعيل Dry Run، يتم فحص وتجهيز الحملة في قاعدة البيانات ومحاكاتها دون خصم أي مبالغ من بطاقتك الإعلانية. عطل هذا الخيار عند الرغبة في النشر الفعلي المباشر.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void launchCampaign()}
                disabled={launching}
                className="admin-btn-primary w-full py-3.5 text-sm disabled:opacity-50"
              >
                {launching ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
                <span>{dryRun ? "فحص وتجهيز الحملة (Dry Run)" : "إطلاق الحملة رسمياً الآن"}</span>
              </button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: ROAS & PERFORMANCE ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 size={18} className="text-[color:var(--admin-gold)]" />
                تحليلات العائد على الإنفاق الإعلاني (ROAS Intelligence)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="flex items-center justify-end pb-3">
              <span className="text-xs font-bold text-[color:var(--admin-text-muted)]">
                آخر تقرير: {data?.lastReport?.date ? new Date(data.lastReport.date).toLocaleString("ar-SA") : "اليوم"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[color:var(--admin-bg-subtle)] border border-[color:var(--admin-border-subtle)] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[color:var(--admin-text-primary)] text-sm">أداء إعلانات جوجل (Google Ads)</h3>
                  <span className="admin-chip">
                    Search & PMax
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="p-2.5 rounded-xl bg-[color:var(--admin-bg-subtle)] border border-[color:var(--admin-border-subtle)]">
                    <p className="text-[10px] text-[color:var(--admin-text-muted)] font-bold">الإنفاق</p>
                    <p className="text-sm font-black text-[color:var(--admin-text-primary)]">$340</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[color:var(--admin-bg-subtle)] border border-[color:var(--admin-border-subtle)]">
                    <p className="text-[10px] text-[color:var(--admin-text-muted)] font-bold">النقرات</p>
                    <p className="text-sm font-black text-[color:var(--admin-text-primary)]">820</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[color:var(--admin-bg-subtle)] border border-[color:var(--admin-border-subtle)]">
                    <p className="text-[10px] text-[color:var(--admin-text-muted)] font-bold">الحجوزات</p>
                    <p className="text-sm font-black text-[color:var(--admin-gold)]">14</p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-[color:var(--admin-bg-subtle)] border border-[color:var(--admin-border-subtle)] space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[color:var(--admin-text-primary)] text-sm">أداء إعلانات ميتا (Meta Ads)</h3>
                  <span className="admin-chip">
                    Instagram & FB Reels
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="p-2.5 rounded-xl bg-[color:var(--admin-bg-subtle)] border border-[color:var(--admin-border-subtle)]">
                    <p className="text-[10px] text-[color:var(--admin-text-muted)] font-bold">الإنفاق</p>
                    <p className="text-sm font-black text-[color:var(--admin-text-primary)]">$210</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[color:var(--admin-bg-subtle)] border border-[color:var(--admin-border-subtle)]">
                    <p className="text-[10px] text-[color:var(--admin-text-muted)] font-bold">النقرات</p>
                    <p className="text-sm font-black text-[color:var(--admin-text-primary)]">1,450</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[color:var(--admin-bg-subtle)] border border-[color:var(--admin-border-subtle)]">
                    <p className="text-[10px] text-[color:var(--admin-text-muted)] font-bold">الحجوزات</p>
                    <p className="text-sm font-black text-[color:var(--admin-gold)]">19</p>
                  </div>
                </div>
              </div>
            </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: API CREDENTIALS & CONNECTIONS */}
      {activeTab === "credentials" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Google Ads Credentials */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe2 size={18} className="text-[color:var(--admin-gold)]" />
                بيانات ربط Google Ads API
              </CardTitle>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  data?.connection.googleLive
                    ? "admin-chip"
                    : "admin-chip"
                }`}
              >
                {data?.connection.googleLive ? "متصل حي" : "غير متصل"}
              </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          {/* Meta Ads Credentials */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Megaphone size={18} className="text-[color:var(--admin-gold)]" />
                بيانات ربط Meta Ads API
              </CardTitle>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  data?.connection.metaLive
                    ? "admin-chip"
                    : "admin-chip"
                }`}
              >
                {data?.connection.metaLive ? "متصل حي" : "غير متصل"}
              </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">

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
                className="admin-btn-primary w-full py-3.5 text-sm disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>حفظ وتطبيق مفاتيح الـ API</span>
              </button>
            </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminPage>
  );
}
