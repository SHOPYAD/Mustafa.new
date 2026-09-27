"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BarChart3,
  Bot,
  CalendarDays,
  CheckCircle2,
  Facebook,
  Globe2,
  Instagram,
  Loader2,
  Megaphone,
  Music2,
  PenTool,
  RefreshCw,
  Settings2,
  Share2,
  Sparkles,
  Unplug,
  Youtube,
  Zap,
  Send,
  Linkedin,
  Pin,
  Store,
  MessageCircle,
  Hash,
  Radio,
  Layers,
} from "lucide-react";
import { AdminPage, AdminPageHeader } from "@/components/admin/layout";
import type { PublicSocialAccount, SocialCredentialsStatus, SocialPlatform } from "@/lib/social/types";
import { OAuthSetupModal } from "@/components/admin/social/OAuthSetupModal";
import { SocialPublishSubnav } from "@/components/admin/publish/SocialPublishSubnav";
import type { PublishChannel } from "@/components/admin/publish/types";

type CardItem = {
  platform: SocialPlatform | "google_ads" | "meta_ads";
  providerKey: "meta" | "tiktok" | "youtube" | "x";
  label: string;
  descriptionAr: string;
  oauthUrl: string;
  badge: string;
  scopes: string[];
};

type PublishNetworkCard = {
  platform: string;
  providerKey: string;
  label: string;
  descriptionAr: string;
  oauthUrl: string;
  badge: string;
  scopes: string[];
};

const CARDS: CardItem[] = [
  {
    platform: "facebook",
    providerKey: "meta",
    label: "فيسبوك (صفحة الشركة)",
    descriptionAr: "نشر البوستات والعروض السياحية التلقائية والتواصل المباشر مع العملاء.",
    oauthUrl: "/api/oauth/meta",
    badge: "Facebook Page API",
    scopes: ["نشر المنشورات والصور", "إدارة التفاعلات والرسائل", "تحليلات المشاهدات والـ Reach"],
  },
  {
    platform: "instagram",
    providerKey: "meta",
    label: "إنستغرام للأعمال",
    descriptionAr: "نشر الريلز والقصص المصممة بواسطة الاستوديو ووكيل المحتوى.",
    oauthUrl: "/api/oauth/meta",
    badge: "Instagram Graph API",
    scopes: ["نشر الفيديوهات والريلز (Reels)", "نشر القصص (Stories)", "الاستماع للتعليقات والرد الذكي"],
  },
  {
    platform: "tiktok",
    providerKey: "tiktok",
    label: "تيك توك للأعمال (TikTok API)",
    descriptionAr: "نشر الفيديوهات القصيرة والمونتاج التسويقي السياحي تلقائياً.",
    oauthUrl: "/api/oauth/tiktok",
    badge: "TikTok Commercial API",
    scopes: ["نشر مقاطع الفيديو القصيرة", "جدولة المقاطع الترويجية", "إحصائيات الانتشار والـ Views"],
  },
  {
    platform: "youtube",
    providerKey: "youtube",
    label: "يوتيوب (YouTube Shorts)",
    descriptionAr: "رفع الفيديوهات والشورتس الترويجية وحفظها في قناة الشركة.",
    oauthUrl: "/api/oauth/youtube",
    badge: "YouTube Data v3",
    scopes: ["رفع فيديوهات الشورتس (Shorts)", "إدارة قوائم التشغيل السياحية", "تتبع المشاهدات والمشتركين"],
  },
  {
    platform: "x",
    providerKey: "x",
    label: "إكس (تويتر الرسمي)",
    descriptionAr: "نشر التغريدات والعروض السياحية السريعة وتحديثات الأسعار.",
    oauthUrl: "/api/oauth/x",
    badge: "X API v2",
    scopes: ["نشر التغريدات والعروض اليومية", "تحديثات أسعار الطيران والفنادق", "التفاعل مع الإشارات"],
  },
  {
    platform: "meta_ads",
    providerKey: "meta",
    label: "إعلانات ميتا (Meta Ads & Reels)",
    descriptionAr: "إطلاق حملات ممولة مستهدفة بدقة عبر وكيل الإعلانات وخادم Meta Ads MCP.",
    oauthUrl: "/api/oauth/meta",
    badge: "Meta Marketing MCP Server",
    scopes: ["إنشاء وإطلاق الحملات الإعلانية", "الاستهداف الجغرافي للخليج وتركيا", "إدارة الميزانيات وتتبع الـ ROAS"],
  },
];

const PUBLISH_NETWORK_CARDS: PublishNetworkCard[] = [
  {
    platform: "telegram",
    providerKey: "telegram",
    label: "تيليجرام (قناة / مجموعة)",
    descriptionAr: "ربط بوت BotFather مع معرّف المحادثة لنشر العروض السياحية المباشرة تلقائياً.",
    oauthUrl: "/api/oauth/telegram",
    badge: "Telegram Bot API",
    scopes: ["إرسال الرسائل والوسائط", "الرد كتعليق أول", "جدولة رسائل القنوات"],
  },
  {
    platform: "linkedin-page",
    providerKey: "linkedin-page",
    label: "لينكدإن — صفحة الشركة الرسمية",
    descriptionAr: "اختيار واعتماد صفحة الشركة والمنظمة بعد تسجيل الدخول الرسمي لنشر المحتوى المؤسسي B2B.",
    oauthUrl: "/api/oauth/linkedin-page",
    badge: "LinkedIn Organization",
    scopes: ["w_organization_social", "rw_organization_admin", "إحصاءات المتابعين"],
  },
  {
    platform: "linkedin",
    providerKey: "linkedin",
    label: "لينكدإن — الحساب الشخصي",
    descriptionAr: "نشر المقالات المهنية والعروض والرحلات مباشرة من الملف الشخصي للمدير التنفيذي.",
    oauthUrl: "/api/oauth/linkedin",
    badge: "LinkedIn OAuth 2.0",
    scopes: ["w_member_social", "openid / profile", "نشر المقالات المهنية"],
  },
  {
    platform: "threads",
    providerKey: "threads",
    label: "ثريدز (Threads)",
    descriptionAr: "نشر الخيوط القصيرة ومناقشات السفر عبر Threads Graph API الرسمية.",
    oauthUrl: "/api/oauth/threads",
    badge: "Threads Graph API",
    scopes: ["threads_content_publish", "threads_manage_replies", "تحليلات المشاهدات"],
  },
  {
    platform: "gmb",
    providerKey: "gmb",
    label: "جوجل أعمالي (Google Business Profile)",
    descriptionAr: "تحديثات الملف التجاري المحلي والعروض الترويجية وخرائط جوجل.",
    oauthUrl: "/api/oauth/gmb",
    badge: "Google Business Profile",
    scopes: ["business.manage", "اختيار الموقع", "نشر العروض المحلية"],
  },
  {
    platform: "pinterest",
    providerKey: "pinterest",
    label: "بنترست (Pinterest)",
    descriptionAr: "نشر دبابيس اللوحات السياحية والصور الجذابة مع رابط الحجز وغلاف مخصص.",
    oauthUrl: "/api/oauth/pinterest",
    badge: "Pinterest API v5",
    scopes: ["pins:write", "boards:read", "إحصاءات الحفظ والنقر"],
  },
];

function Icon({ platform }: { platform: string }) {
  switch (platform) {
    case "facebook":
      return <Facebook className="size-5 text-blue-600 dark:text-blue-500" />;
    case "instagram":
      return <Instagram className="size-5 text-pink-600 dark:text-pink-500" />;
    case "youtube":
      return <Youtube className="size-5 text-red-600 dark:text-red-500" />;
    case "tiktok":
      return <Music2 className="size-5 text-teal-600 dark:text-teal-400" />;
    case "x":
      return <Share2 className="size-5 text-slate-900 dark:text-slate-200" />;
    case "google_ads":
    case "meta_ads":
      return <Megaphone className="size-5 text-purple-600 dark:text-purple-400" />;
    case "telegram":
      return <Send className="size-5 text-sky-500" />;
    case "linkedin":
    case "linkedin-page":
      return <Linkedin className="size-5 text-blue-600" />;
    case "threads":
      return <MessageCircle className="size-5 text-slate-800 dark:text-slate-100" />;
    case "gmb":
      return <Store className="size-5 text-blue-500" />;
    case "pinterest":
      return <Pin className="size-5 text-rose-600" />;
    default:
      return <Share2 className="size-5 text-purple-600 dark:text-purple-400" />;
  }
}

export function SocialAccountsPanel() {
  const search = useSearchParams();
  const [accounts, setAccounts] = useState<PublicSocialAccount[]>([]);
  const [credentials, setCredentials] = useState<SocialCredentialsStatus[]>([]);
  const [publishChannels, setPublishChannels] = useState<PublishChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState("");
  const [disconnecting, setDisconnecting] = useState("");
  const [activeSetupPlatform, setActiveSetupPlatform] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [res, channelsRes] = await Promise.all([
        fetch("/api/social/accounts", { cache: "no-store" }),
        fetch("/api/admin/publish/channels", { cache: "no-store" }),
      ]);
      const data = (await res.json()) as { ok: boolean; accounts?: PublicSocialAccount[]; credentials?: SocialCredentialsStatus[] };
      if (data.ok) {
        setAccounts(data.accounts || []);
        setCredentials(data.credentials || []);
      }
      const channelsJson = (await channelsRes.json().catch(() => null)) as { ok?: boolean; channels?: PublishChannel[] } | null;
      if (channelsJson?.ok && Array.isArray(channelsJson.channels)) {
        setPublishChannels(channelsJson.channels);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "OAUTH_RESULT") {
        if (event.data.ok) {
          showToast(`✅ تم تسجيل الدخول وربط حسابك الرسمي بنجاح!`);
          void load();
        } else {
          showToast(`⚠️ تعذر إتمام تسجيل الدخول: ${event.data.error || "تم إلغاء الطلب"}`);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [load]);

  const connectedAccountsFor = (platform: string) =>
    accounts.filter(
      (row) => row.platform === platform && row.hasAccessToken && row.status === "connected"
    );

  const accountFor = (platform: SocialPlatform) => {
    const list = connectedAccountsFor(platform);
    const primary = list.find((row) => row.isPrimary);
    if (primary) return primary;
    const lonaliza = list.find((row) =>
      (row.displayName || "").toLowerCase().includes("lonaliza")
    );
    if (lonaliza) return lonaliza;
    return list[0] || null;
  };

  const publishChannelFor = (platform: string) =>
    publishChannels.find((row) => row.provider === platform && !row.disabled);

  const switchPrimaryAccount = async (id: string) => {
    try {
      const res = await fetch("/api/social/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set_primary", id }),
      });
      const data = (await res.json()) as { ok: boolean; accounts?: PublicSocialAccount[] };
      if (data.ok) {
        showToast("✅ تم اعتماد الصفحة للنشر بنجاح!");
        if (data.accounts) setAccounts(data.accounts);
      }
    } catch {
      showToast("حدث خطأ أثناء تغيير الصفحة المعتمدة");
    }
  };

  const isProviderConfigured = (providerKey: string) =>
    credentials.some((c) => c.provider === providerKey && c.configured);

  const openOAuthPopup = (url: string) => {
    const width = 640;
    const height = 760;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      url,
      "social_oauth_popup",
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );
  };

  const handleConnectClick = (card: CardItem) => {
    const configured = isProviderConfigured(card.providerKey);
    if (!configured) {
      setActiveSetupPlatform(card.platform);
    } else {
      openOAuthPopup(card.oauthUrl);
    }
  };

  const handlePublishNetworkConnect = (card: PublishNetworkCard) => {
    const configured = isProviderConfigured(card.providerKey);
    if (!configured && card.platform !== "telegram") {
      setActiveSetupPlatform(card.platform);
      return;
    }
    openOAuthPopup(card.oauthUrl);
  };

  const disconnectPublishChannel = async (id: string) => {
    if (!confirm("هل تريد بالتأكيد فصل هذه القناة؟")) return;
    setDisconnecting(id);
    try {
      await fetch(`/api/admin/publish/channels/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      showToast("تم فصل قناة النشر بنجاح");
      await load();
    } finally {
      setDisconnecting("");
    }
  };

  const testAccount = async (id: string) => {
    setTesting(id);
    try {
      const res = await fetch("/api/social/accounts", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", id }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      showToast(data.message || "✅ الحساب نشط ومتصل بالكامل");
      await load();
    } finally {
      setTesting("");
    }
  };

  const disconnectAccount = async (id: string) => {
    if (!confirm("هل تريد بالتأكيد فصل هذا الحساب؟")) return;
    setDisconnecting(id);
    try {
      await fetch("/api/social/accounts", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect", id }),
      });
      showToast("تم فصل الحساب بنجاح");
      await load();
    } finally {
      setDisconnecting("");
    }
  };

  const totalConnectedCount = accounts.filter((a) => a.hasAccessToken && a.status === "connected").length + publishChannels.filter((c) => !c.disabled).length;

  return (
    <AdminPage>
      <AdminPageHeader
        title="حسابات النشر والإعلانات الرسمية"
        description="تسجيل الدخول وربط حسابات الشركة الرسمية عبر نوافذ OAuth الرسمية وتفويض وكلاء الذكاء الاصطناعي للنشر المباشر."
        icon={<Share2 className="size-5 text-purple-600 dark:text-purple-400" />}
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            <span>تحديث الحالة</span>
          </button>
        }
      />

      <div className="space-y-6 pt-2" dir="rtl">
        {/* Full-width Luxury Tabs Navigation */}
        <SocialPublishSubnav activeHref="/admin/social-accounts" />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 left-6 z-50 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-amber-300 border border-amber-400/40 font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in duration-300">
            <CheckCircle2 className="size-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* In-App Setup Modal */}
        {activeSetupPlatform && (
          <OAuthSetupModal
            platformKey={activeSetupPlatform}
            isConfigured={isProviderConfigured(
              CARDS.find((c) => c.platform === activeSetupPlatform)?.providerKey ||
                PUBLISH_NETWORK_CARDS.find((c) => c.platform === activeSetupPlatform)?.providerKey ||
                "meta"
            )}
            onClose={() => setActiveSetupPlatform(null)}
            onSuccess={() => {
              void load();
            }}
          />
        )}

        {/* Hero banner - Daylight Luxury Radiant Design */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-50/90 via-indigo-50/70 to-purple-50/80 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-slate-900 border border-purple-200/70 dark:border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 border border-purple-100 dark:border-purple-500/30 shadow-xs">
              <Zap className="size-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-sm font-black text-slate-900 dark:text-foreground">الربط السحابي المركزي للمنصة (Master SaaS Multi-Tenant)</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-100/90 dark:bg-purple-500/20 text-purple-800 dark:text-amber-300 border border-purple-200 dark:border-purple-500/30 text-[10px] font-bold">
                  بوابة المصادقة الموحدة
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                تطبيق المطورين الخاص بلوناليزا يتيح لك ولجميع وكلاء السفر تسجيل الدخول والمصادقة المباشرة بنقرة واحدة وتفويض الذكاء الاصطناعي للنشر.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 shadow-xs text-center">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold block mb-1">الحسابات المربوطة والمفعلة</span>
            <span className="text-xl font-black text-purple-600 dark:text-purple-400">{totalConnectedCount} / 25</span>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 shadow-xs text-center">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold block mb-1">المنصات والشبكات المدعومة</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">12 شبكة رسمية</span>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 shadow-xs text-center">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold block mb-1">إعلانات الذكاء الاصطناعي</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">Meta & Google</span>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 shadow-xs text-center">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold block mb-1">وكيل النشر التلقائي</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">AI Auto-Pilot نشط</span>
          </div>
        </div>

        {/* Section 1: Main OAuth Accounts */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="size-2.5 rounded-full bg-purple-600" />
            <h3 className="text-sm font-black text-slate-900 dark:text-foreground">الشبكات الرسمية الكبرى (Main Social Networks)</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {CARDS.map((card) => {
              const acc = accountFor(card.platform as SocialPlatform);
              const connected = Boolean(acc);
              const configured = isProviderConfigured(card.providerKey);
              const allList = connectedAccountsFor(card.platform);

              return (
                <div
                  key={card.platform}
                  className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                          <Icon platform={card.platform} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-foreground">{card.label}</h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {acc ? `@${acc.displayName || acc.username || acc.platform}` : card.badge}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          connected
                            ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-amber-300 border border-purple-200 dark:border-purple-800"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {connected ? <CheckCircle2 className="size-3 text-amber-500" /> : null}
                        {connected ? "متصل ونشط" : "غير مرتبط"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
                      {connected && acc
                        ? `الحساب مرتبط باسم: ${acc.displayName || acc.username} ومفوض للوكلاء الأذكياء.`
                        : card.descriptionAr}
                    </p>

                    {/* Multiple Connected Pages Selector */}
                    {connected && allList.length > 1 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                          <span className="text-purple-600 dark:text-amber-300">({allList.length} صفحات متصلة)</span>
                          <span>الصفحة المعتمدة للنشر:</span>
                        </div>
                        <select
                          value={acc?.id || ""}
                          onChange={(e) => void switchPrimaryAccount(e.target.value)}
                          className="w-full text-xs font-bold p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none cursor-pointer focus:ring-1 focus:ring-purple-500"
                        >
                          {allList.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.isPrimary ? "⭐ (الصفحة النشطة) " : ""}
                              {p.displayName || p.username}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1">
                      {card.scopes.map((sc, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                          ✓ {sc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleConnectClick(card)}
                      className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-600 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-black text-center shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer ring-1 ring-white/20"
                    >
                      <Zap className="size-3.5 text-amber-300" />
                      <span className="text-white font-black">
                        {connected
                          ? "تحديث وتجديد الربط الرسمي"
                          : configured
                          ? "تسجيل الدخول وربط الحساب"
                          : "إعداد بوابة الربط والتطبيق"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSetupPlatform(card.platform)}
                      className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs transition-all cursor-pointer"
                      title="إعدادات مفاتيح المطورين للمنصة"
                    >
                      <Settings2 className="size-4 text-purple-600 dark:text-purple-400" />
                    </button>

                    {acc && (
                      <>
                        <button
                          type="button"
                          onClick={() => void testAccount(acc.id)}
                          disabled={testing === acc.id}
                          className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs transition-all cursor-pointer"
                          title="فحص الاتصال"
                        >
                          {testing === acc.id ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => void disconnectAccount(acc.id)}
                          disabled={disconnecting === acc.id}
                          className="p-2.5 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs transition-all cursor-pointer"
                          title="فصل الحساب"
                        >
                          {disconnecting === acc.id ? <Loader2 className="size-4 animate-spin" /> : <Unplug className="size-4" />}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Advanced Publishing Networks & Channels */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="size-2.5 rounded-full bg-indigo-600" />
            <h3 className="text-sm font-black text-slate-900 dark:text-foreground">شبكات وقنوات النشر والجدولة المتقدمة</h3>
          </div>
          <p className="mb-4 text-xs text-slate-600 dark:text-slate-400">
            تيليجرام ولينكدإن وثريدز وجوجل أعمالي وبنترست وريديت — متصلة بنظام الجدولة وخلاصات RSS المؤتمتة.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {PUBLISH_NETWORK_CARDS.map((card) => {
              const channel = publishChannelFor(card.platform);
              const connected = Boolean(channel);
              const configured = isProviderConfigured(card.providerKey) || card.platform === "telegram";

              return (
                <div
                  key={card.platform}
                  className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                          <Icon platform={card.platform} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-foreground">{card.label}</h4>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            {channel?.name || card.badge}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          connected
                            ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-amber-300 border border-purple-200 dark:border-purple-800"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {connected ? <CheckCircle2 className="size-3 text-amber-500" /> : null}
                        {connected ? "متصل" : "غير مرتبط"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
                      {card.descriptionAr}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1">
                      {card.scopes.map((sc, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                          ✓ {sc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePublishNetworkConnect(card)}
                      className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-600 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-black text-center shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer ring-1 ring-white/20"
                    >
                      <Zap className="size-3.5 text-amber-300" />
                      <span className="text-white font-black">
                        {connected
                          ? "تحديث الربط"
                          : configured
                          ? "ربط الحساب"
                          : "إعداد المفاتيح"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveSetupPlatform(card.platform)}
                      className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs transition-all cursor-pointer"
                      title="إعدادات المفاتيح وبوابة الربط"
                    >
                      <Settings2 className="size-4 text-purple-600 dark:text-purple-400" />
                    </button>

                    {channel && (
                      <button
                        type="button"
                        onClick={() => void disconnectPublishChannel(channel.id)}
                        disabled={disconnecting === channel.id}
                        className="p-2.5 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs transition-all cursor-pointer"
                        title="فصل قناة النشر"
                      >
                        {disconnecting === channel.id ? <Loader2 className="size-4 animate-spin" /> : <Unplug className="size-4" />}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminPage>
  );
}
