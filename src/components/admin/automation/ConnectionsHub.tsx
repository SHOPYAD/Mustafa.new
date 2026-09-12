"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Facebook,
  Instagram,
  Loader2,
  Megaphone,
  Music2,
  Share2,
  Youtube,
  Zap,
  RefreshCw,
  Unplug,
  ShieldCheck,
  Settings2,
} from "lucide-react";
import type { PublicSocialAccount, SocialCredentialsStatus, SocialPlatform } from "@/lib/social/types";
import { OAuthSetupModal } from "@/components/admin/social/OAuthSetupModal";

type AdsStatus = {
  googleLive: boolean;
  metaLive: boolean;
  googleOAuth: boolean;
  metaOAuth: boolean;
  missingGoogle: string[];
  missingMeta: string[];
  dryRun: boolean;
  settingsUrl: string;
};

type CardItem = {
  platform: SocialPlatform | "google_ads" | "meta_ads";
  providerKey: "meta" | "tiktok" | "youtube" | "x";
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
  {
    platform: "google_ads",
    providerKey: "youtube",
    label: "إعلانات جوجل (Google Ads)",
    descriptionAr: "إدارة حملات البحث وشبكة العرض السياحية ومتابعة التحويلات.",
    oauthUrl: "/api/oauth/youtube",
    badge: "Google Ads API",
    scopes: ["حملات شبكة البحث السياحية", "إعلانات شبكة العرض واليوتيوب", "تتبع التحويلات والحجوزات"],
  },
];

function Icon({ platform }: { platform: CardItem["platform"] }) {
  switch (platform) {
    case "facebook":
      return <Facebook className="size-5 text-blue-500" />;
    case "instagram":
      return <Instagram className="size-5 text-pink-500" />;
    case "youtube":
      return <Youtube className="size-5 text-red-500" />;
    case "tiktok":
      return <Music2 className="size-5 text-teal-400" />;
    case "x":
      return <Share2 className="size-5 text-slate-300" />;
    case "google_ads":
    case "meta_ads":
      return <Megaphone className="size-5 text-purple-400" />;
    default:
      return <Share2 className="size-5" />;
  }
}

export default function ConnectionsHub() {
  const [accounts, setAccounts] = useState<PublicSocialAccount[]>([]);
  const [credentials, setCredentials] = useState<SocialCredentialsStatus[]>([]);
  const [ads, setAds] = useState<AdsStatus | null>(null);
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
      const res = await fetch("/api/admin/automation/connections", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const data = (await res.json()) as {
        accounts?: PublicSocialAccount[];
        credentials?: SocialCredentialsStatus[];
        ads?: AdsStatus;
      };
      setAccounts(data.accounts || []);
      setCredentials(data.credentials || []);
      setAds(data.ads || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();

    // Listen for OAuth completion from popup window
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

  const switchPrimaryAccount = async (id: string) => {
    try {
      const res = await fetch("/api/social/accounts", {
        method: "POST",
        credentials: "same-origin",
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
      // Open in-app setup modal directly
      setActiveSetupPlatform(card.platform);
    } else {
      // Open real OAuth popup window
      openOAuthPopup(card.oauthUrl);
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
      showToast(data.message || "✅ تم فحص الاتصال والتأكد من الصلاحيات");
      await load();
    } finally {
      setTesting("");
    }
  };

  const disconnectAccount = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في فصل هذا الحساب؟")) return;
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

  if (loading && accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500 dark:text-slate-400 gap-3">
        <Loader2 className="size-6 animate-spin text-purple-600 dark:text-purple-400" />
        <p className="text-xs font-bold">جاري فحص حالة ربط المنصات الاجتماعية والإعلانات…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative" dir="rtl">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#2e1065] to-[#4c1d95] text-amber-300 font-bold text-xs shadow-2xl border border-amber-400/40 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="size-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* In-App Setup Modal */}
      {activeSetupPlatform && (
        <OAuthSetupModal
          platformKey={activeSetupPlatform}
          isConfigured={isProviderConfigured(
            CARDS.find((c) => c.platform === activeSetupPlatform)?.providerKey || "meta"
          )}
          onClose={() => setActiveSetupPlatform(null)}
          onSuccess={() => {
            void load();
          }}
        />
      )}

      {/* Quick Summary Banner - Daylight Luxury Radiant Design */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-200/80 bg-gradient-to-r from-purple-50 via-white to-amber-50/50 p-6 shadow-sm dark:border-purple-800/60 dark:bg-gradient-to-r dark:from-[#1a0b2e] dark:via-[#130722] dark:to-[#1e1035] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2e1065] to-[#4c1d95] text-amber-300 shadow-md">
            <Zap className="size-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                بوابة تسجيل الدخول والربط الرسمي لحسابات السوشيال والإعلانات
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-100/80 px-2.5 py-0.5 text-[10px] font-black text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/50 dark:text-amber-300">
                ⭐ Master SaaS Multi-Tenant
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed max-w-3xl">
              يتم ضبط مفاتيح التطبيق المركزي للمنصة لمرة واحدة، ليتمكن مدراء المنصة وشركات B2B من تسجيل الدخول والمصادقة بضغطة زر واحدة.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="self-start sm:self-center px-4 py-2 rounded-2xl border border-purple-200 bg-white hover:bg-purple-50 text-xs font-bold text-purple-950 transition-all flex items-center gap-2 shadow-xs dark:border-purple-700 dark:bg-purple-950/60 dark:text-purple-200 dark:hover:bg-purple-900/50"
        >
          <RefreshCw className="size-3.5" />
          <span>تحديث الحالة</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {CARDS.map((card) => {
          const isAds = card.platform === "google_ads" || card.platform === "meta_ads";
          const fbAcc = accountFor("facebook");
          const live = isAds
            ? card.platform === "meta_ads"
              ? Boolean(ads?.metaLive || fbAcc)
              : Boolean(ads?.googleLive)
            : Boolean(accountFor(card.platform as SocialPlatform));

          const acc = !isAds ? accountFor(card.platform as SocialPlatform) : null;
          const configured = isProviderConfigured(card.providerKey);

          return (
            <div
              key={card.platform}
              className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <Icon platform={card.platform} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{card.label}</h4>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {acc ? `@${acc.displayName || acc.username || acc.platform}` : card.badge}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      live
                        ? "bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {live ? <CheckCircle2 className="size-3 text-purple-600 dark:text-amber-400" /> : null}
                    {live ? "متصل ونشط" : "غير مرتبط"}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-3">
                  {live && acc
                    ? `الحساب مرتبط باسم: ${acc.displayName || acc.platform} ومفوض للوكلاء الأذكياء.`
                    : card.descriptionAr}
                </p>

                {/* Page Selector if multiple pages exist */}
                {!isAds && connectedAccountsFor(card.platform).length > 1 && (
                  <div className="mt-3 p-2.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      <span>الصفحة المعتمدة للنشر:</span>
                      <span className="text-purple-600 dark:text-purple-400 font-extrabold text-[10px]">
                        ({connectedAccountsFor(card.platform).length} صفحات متصلة)
                      </span>
                    </div>
                    <select
                      value={acc?.id || ""}
                      onChange={(e) => void switchPrimaryAccount(e.target.value)}
                      className="w-full text-xs font-bold py-1.5 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
                    >
                      {connectedAccountsFor(card.platform).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.displayName || p.username} {p.isPrimary ? "⭐ (الصفحة النشطة)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap gap-1">
                  {card.scopes.map((sc, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      ✓ {sc}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleConnectClick(card)}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-gradient-to-r from-[#2e1065] via-[#3b0764] to-[#4c1d95] hover:from-[#3b0764] hover:to-[#581c87] text-amber-300 hover:text-amber-200 text-xs font-bold text-center shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-98"
                >
                  <Zap className="size-3.5 text-amber-400" />
                  <span>
                    {live
                      ? "تحديث وتجديد الربط الرسمي"
                      : configured
                      ? "تسجيل الدخول وربط الحساب"
                      : "إعداد بوابة الربط والتطبيق"}
                  </span>
                </button>

                {/* Setup / Settings Button */}
                <button
                  type="button"
                  onClick={() => setActiveSetupPlatform(card.platform)}
                  className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs transition-all"
                  title="إعدادات مفاتيح المطورين للمنصة"
                >
                  <Settings2 className="size-4 text-purple-400" />
                </button>

                {acc && (
                  <>
                    <button
                      type="button"
                      onClick={() => void testAccount(acc.id)}
                      disabled={testing === acc.id}
                      className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs transition-all"
                      title="فحص الاتصال"
                    >
                      {testing === acc.id ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => void disconnectAccount(acc.id)}
                      disabled={disconnecting === acc.id}
                      className="p-2.5 rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs transition-all"
                      title="فصل الحساب"
                    >
                      {disconnecting === acc.id ? <Loader2 className="size-4 animate-spin" /> : <Unplug className="size-4" />}
                    </button>
                  </>
                )}

                {isAds && (
                  <Link
                    href="/admin/ads"
                    className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs transition-all"
                    title="إعدادات الميزانيات والتقارير"
                  >
                    <ExternalLink className="size-4" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
