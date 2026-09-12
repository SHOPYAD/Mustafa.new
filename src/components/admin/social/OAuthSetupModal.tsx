"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Facebook,
  Instagram,
  KeyRound,
  Loader2,
  Music2,
  Share2,
  ShieldCheck,
  X,
  Youtube,
  Zap,
} from "lucide-react";

export type ProviderSetupConfig = {
  provider: "meta" | "tiktok" | "youtube" | "x";
  titleAr: string;
  englishName: string;
  brandColor: string;
  redirectUri: string;
  isConfigured: boolean;
  oauthUrl: string;
  steps: Array<{
    num: number;
    titleAr: string;
    descAr: string;
    actionUrl?: string;
    actionLabelAr?: string;
  }>;
  fields: Array<{
    key: string;
    label: string;
    placeholder: string;
    isSecret?: boolean;
    helpTextAr?: string;
  }>;
  developerPortalUrl: string;
};

export const PROVIDER_CONFIGS: Record<string, ProviderSetupConfig> = {
  facebook: {
    provider: "meta",
    titleAr: "فيسبوك وإنستغرام (Meta for Developers)",
    englishName: "Meta (Facebook & Instagram)",
    brandColor: "#1877f2",
    redirectUri: "https://lonaliza.com/api/oauth/meta/callback",
    isConfigured: false,
    oauthUrl: "/api/oauth/meta",
    steps: [
      {
        num: 1,
        titleAr: "إنشاء تطبيق مجاني للمنصة على Meta Developers",
        descAr: "اضغط على الزر لفتح لوحة المطورين، ثم اضغط «Create App» واختر نوع التطبيق «Business / أعمال» أو «Other».",
        actionUrl: "https://developers.facebook.com/apps/create/",
        actionLabelAr: "إنشاء تطبيق ↗",
      },
      {
        num: 2,
        titleAr: "إضافة منتج Facebook Login وتعيين الرابط المعتمد",
        descAr: "من القائمة الجانبية للتطبيق، أضف «Facebook Login for Business» ثم في قسم Settings الصق رابط إعادة التوجيه الموجود أدناه في خانة Valid OAuth Redirect URIs.",
        actionUrl: "https://developers.facebook.com/apps/",
        actionLabelAr: "لوحة التطبيقات ↗",
      },
      {
        num: 3,
        titleAr: "نسخ معرف التطبيق والمفتاح السري (App ID & Secret)",
        descAr: "من القائمة اذهب إلى App Settings -> Basic، وانسخ App ID و App Secret والصقهما في الحقول أدناه.",
        actionUrl: "https://developers.facebook.com/apps/",
        actionLabelAr: "إعدادات التطبيق ↗",
      },
    ],
    fields: [
      {
        key: "metaAppId",
        label: "معرف التطبيق (Meta App ID)",
        placeholder: "مثال: 108392019482710",
        helpTextAr: "تجد هذا الرقم في أعلى صفحة التطبيق في Meta for Developers.",
      },
      {
        key: "metaAppSecret",
        label: "المفتاح السري للتطبيق (Meta App Secret)",
        placeholder: "••••••••••••••••••••••••••••••••",
        isSecret: true,
        helpTextAr: "اضغط على «Show» بجانب App Secret لنسخه ولصقه هنا.",
      },
    ],
    developerPortalUrl: "https://developers.facebook.com/apps/",
  },
  instagram: {
    provider: "meta",
    titleAr: "إنستغرام للأعمال (Instagram Graph API)",
    englishName: "Meta (Instagram Business)",
    brandColor: "#e1306c",
    redirectUri: "https://lonaliza.com/api/oauth/meta/callback",
    isConfigured: false,
    oauthUrl: "/api/oauth/meta",
    steps: [
      {
        num: 1,
        titleAr: "تطبيق Meta الموحد لفيسبوك وإنستغرام",
        descAr: "تطبيق Meta for Developers يدير كلاً من فيسبوك وإنستغرام معاً في نفس الوقت. بمجرد ربط مفاتيح Meta ستعمل جميع حسابات فيسبوك وإنستغرام.",
        actionUrl: "https://developers.facebook.com/apps/create/",
        actionLabelAr: "لوحة مطوري Meta ↗",
      },
      {
        num: 2,
        titleAr: "إضافة منتج Instagram Graph API",
        descAr: "في نفس التطبيق، أضف منتج «Instagram Graph API» من قائمة المنتجات.",
      },
      {
        num: 3,
        titleAr: "نسخ معرف التطبيق والمفتاح السري",
        descAr: "ضع نفس App ID و App Secret الخاص بتطبيقك في الحقول أدناه.",
      },
    ],
    fields: [
      {
        key: "metaAppId",
        label: "معرف التطبيق (Meta App ID)",
        placeholder: "مثال: 108392019482710",
      },
      {
        key: "metaAppSecret",
        label: "المفتاح السري للتطبيق (Meta App Secret)",
        placeholder: "••••••••••••••••••••••••••••••••",
        isSecret: true,
      },
    ],
    developerPortalUrl: "https://developers.facebook.com/apps/",
  },
  tiktok: {
    provider: "tiktok",
    titleAr: "تيك توك للأعمال (TikTok API)",
    englishName: "TikTok for Developers",
    brandColor: "#00f2fe",
    redirectUri: "https://lonaliza.com/api/oauth/tiktok/callback",
    isConfigured: false,
    oauthUrl: "/api/oauth/tiktok",
    steps: [
      {
        num: 1,
        titleAr: "إنشاء تطبيق على TikTok for Developers",
        descAr: "ادخل إلى منصة مطوري تيك توك واضغط على «Add an App» لإنشاء تطبيق جديد باسم المنصة.",
        actionUrl: "https://developers.tiktok.com/",
        actionLabelAr: "لوحة تيك توك ↗",
      },
      {
        num: 2,
        titleAr: "إضافة منتج Login Kit و Redirect URI",
        descAr: "قم بتفعيل «Login Kit» والصق رابط إعادة التوجيه المصرح به الموضح أدناه في خانة Redirect Domains.",
      },
      {
        num: 3,
        titleAr: "نسخ Client Key و Client Secret",
        descAr: "انسخ المفاتيح من قسم App Credentials وضعها في الحقول أدناه.",
      },
    ],
    fields: [
      {
        key: "tiktokClientKey",
        label: "مفتاح العميل (TikTok Client Key)",
        placeholder: "مثال: aw3k79df89j...",
      },
      {
        key: "tiktokClientSecret",
        label: "المفتاح السري (TikTok Client Secret)",
        placeholder: "••••••••••••••••••••••••••••••••",
        isSecret: true,
      },
    ],
    developerPortalUrl: "https://developers.tiktok.com/",
  },
  youtube: {
    provider: "youtube",
    titleAr: "يوتيوب وجوجل (Google Cloud Console)",
    englishName: "YouTube & Google Cloud",
    brandColor: "#ff0000",
    redirectUri: "https://lonaliza.com/api/oauth/youtube/callback",
    isConfigured: false,
    oauthUrl: "/api/oauth/youtube",
    steps: [
      {
        num: 1,
        titleAr: "تفعيل YouTube Data API v3 في Google Cloud",
        descAr: "اضغط لفتح جوجل كلاود وقم بتمكين YouTube Data API v3 لمشروع المنصة.",
        actionUrl: "https://console.cloud.google.com/apis/library/youtube.googleapis.com",
        actionLabelAr: "تفعيل API ↗",
      },
      {
        num: 2,
        titleAr: "إنشاء OAuth 2.0 Client ID",
        descAr: "من صفحة Credentials اضغط Create Credentials -> OAuth client ID واختر Web Application والصق رابط إعادة التوجيه أدناه.",
        actionUrl: "https://console.cloud.google.com/apis/credentials",
        actionLabelAr: "إنشاء مفاتيح ↗",
      },
      {
        num: 3,
        titleAr: "نسخ Google Client ID و Client Secret",
        descAr: "انسخ المعرفين والصقهما في الخانات أدناه.",
      },
    ],
    fields: [
      {
        key: "youtubeClientId",
        label: "معرف العميل (Google Client ID)",
        placeholder: "12345-abc.apps.googleusercontent.com",
      },
      {
        key: "youtubeClientSecret",
        label: "المفتاح السري (Google Client Secret)",
        placeholder: "••••••••••••••••••••••••••••••••",
        isSecret: true,
      },
    ],
    developerPortalUrl: "https://console.cloud.google.com/apis/credentials",
  },
  x: {
    provider: "x",
    titleAr: "إكس / تويتر (X Developer Portal)",
    englishName: "X (Twitter Developer Portal)",
    brandColor: "#1d9bf0",
    redirectUri: "https://lonaliza.com/api/oauth/x/callback",
    isConfigured: false,
    oauthUrl: "/api/oauth/x",
    steps: [
      {
        num: 1,
        titleAr: "إنشاء مشروع وتطبيق في X Developer Portal",
        descAr: "ادخل إلى منصة مطوري X، وأنشئ مشروعاً (Project) جديداً وتطبيقاً بداخله.",
        actionUrl: "https://developer.x.com/en/portal/dashboard",
        actionLabelAr: "لوحة X Developers ↗",
      },
      {
        num: 2,
        titleAr: "إعداد User authentication settings",
        descAr: "فعل OAuth 2.0 واختر نوع التطبيق Web App، والصق رابط إعادة التوجيه أدناه في خانة Callback URI.",
      },
      {
        num: 3,
        titleAr: "نسخ Client ID و Client Secret",
        descAr: "انسخ المفاتيح من قسم Keys and Tokens وضعها في الحقول أدناه.",
      },
    ],
    fields: [
      {
        key: "xClientId",
        label: "معرف العميل (X Client ID)",
        placeholder: "VGxSZmVq...",
      },
      {
        key: "xClientSecret",
        label: "المفتاح السري (X Client Secret)",
        placeholder: "••••••••••••••••••••••••••••••••",
        isSecret: true,
      },
    ],
    developerPortalUrl: "https://developer.x.com/en/portal/dashboard",
  },
  meta_ads: {
    provider: "meta",
    titleAr: "إعلانات ميتا (Meta Ads Marketing API)",
    englishName: "Meta Marketing API",
    brandColor: "#a855f7",
    redirectUri: "https://lonaliza.com/api/oauth/meta/callback",
    isConfigured: false,
    oauthUrl: "/api/oauth/meta",
    steps: [
      {
        num: 1,
        titleAr: "تطبيق Meta الموحد للحملات والإعلانات",
        descAr: "يستخدم خادم Meta Ads MCP نفس تطبيق Meta for Developers مع تفعيل منتج «Marketing API».",
        actionUrl: "https://developers.facebook.com/apps/",
        actionLabelAr: "لوحة Meta Apps ↗",
      },
      {
        num: 2,
        titleAr: "إضافة منتج Marketing API",
        descAr: "من قائمة المنتجات داخل تطبيقك على Meta، أضف «Marketing API» لتمكين الوكلاء من إطلاق الحملات.",
      },
      {
        num: 3,
        titleAr: "نسخ معرف التطبيق والسر",
        descAr: "ضع نفس مفاتيح Meta App ID و Secret في الخانات أدناه.",
      },
    ],
    fields: [
      {
        key: "metaAppId",
        label: "معرف التطبيق (Meta App ID)",
        placeholder: "مثال: 108392019482710",
      },
      {
        key: "metaAppSecret",
        label: "المفتاح السري (Meta App Secret)",
        placeholder: "••••••••••••••••••••••••••••••••",
        isSecret: true,
      },
    ],
    developerPortalUrl: "https://developers.facebook.com/apps/",
  },
  google_ads: {
    provider: "youtube",
    titleAr: "إعلانات جوجل (Google Ads API)",
    englishName: "Google Cloud Console",
    brandColor: "#ea4335",
    redirectUri: "https://lonaliza.com/api/oauth/youtube/callback",
    isConfigured: false,
    oauthUrl: "/api/oauth/youtube",
    steps: [
      {
        num: 1,
        titleAr: "مشروع Google Cloud الموحد",
        descAr: "يتم استخدام نفس مفاتيح Google Client ID لربط خدمات جوجل وإعلاناتها.",
        actionUrl: "https://console.cloud.google.com/apis/credentials",
        actionLabelAr: "لوحة Google ↗",
      },
      {
        num: 2,
        titleAr: "تعيين الـ Redirect URI",
        descAr: "تأكد من إضافة رابط إعادة التوجيه المعتمد بالأسفل في خانة Authorized redirect URIs.",
      },
      {
        num: 3,
        titleAr: "نسخ المفاتيح",
        descAr: "انسخ Client ID و Secret وضعهما في الخانات أدناه.",
      },
    ],
    fields: [
      {
        key: "youtubeClientId",
        label: "معرف العميل (Google Client ID)",
        placeholder: "12345-abc.apps.googleusercontent.com",
      },
      {
        key: "youtubeClientSecret",
        label: "المفتاح السري (Google Client Secret)",
        placeholder: "••••••••••••••••••••••••••••••••",
        isSecret: true,
      },
    ],
    developerPortalUrl: "https://console.cloud.google.com/apis/credentials",
  },
};

function getProviderIcon(key: string) {
  switch (key) {
    case "facebook":
    case "meta_ads":
      return <Facebook className="size-6 text-blue-400" />;
    case "instagram":
      return <Instagram className="size-6 text-pink-400" />;
    case "tiktok":
      return <Music2 className="size-6 text-teal-300" />;
    case "youtube":
    case "google_ads":
      return <Youtube className="size-6 text-red-400" />;
    case "x":
      return <Share2 className="size-6 text-sky-400" />;
    default:
      return <Share2 className="size-6" />;
  }
}

export function OAuthSetupModal({
  platformKey,
  onClose,
  onSuccess,
  isConfigured,
}: {
  platformKey: string;
  onClose: () => void;
  onSuccess: () => void;
  isConfigured: boolean;
}) {
  const config = PROVIDER_CONFIGS[platformKey] || PROVIDER_CONFIGS.facebook;
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(isConfigured);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const copyUri = () => {
    navigator.clipboard.writeText(config.redirectUri).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validation for Meta
    if (config.provider === "meta") {
      const appId = (formData.metaAppId || "").trim();
      if (!appId || !/^\d+$/.test(appId)) {
        setErrorMsg("⚠️ تنبيه: معرف التطبيق (Meta App ID) يجب أن يكون رقماً فقط مثل: 1795451878477040 (تأكد من عدم وضع بريدك الإلكتروني).");
        return;
      }
      const secret = (formData.metaAppSecret || "").trim();
      if (!secret || secret.length < 16) {
        setErrorMsg("⚠️ تنبيه: المفتاح السري (Meta App Secret) تجده في لوحة مطوري فيسبوك في صفحة Settings -> Basic بالضغط على «عرض».");
        return;
      }
    }

    setSaving(true);

    try {
      const res = await fetch("/api/social/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: config.provider,
          ...formData,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; message?: string };
      if (data.ok) {
        setSavedSuccess(true);
        onSuccess();
      } else {
        setErrorMsg(data.error || "تعذر حفظ المفاتيح، تأكد من صحة المدخلات.");
      }
    } catch {
      setErrorMsg("حدث خطأ أثناء الاتصال بالسيرفر.");
    } finally {
      setSaving(false);
    }
  };

  const launchRealOAuthLogin = () => {
    const width = 640;
    const height = 760;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      config.oauthUrl,
      "social_oauth_popup",
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl rounded-3xl border border-slate-700/80 bg-slate-900/95 p-6 sm:p-8 shadow-2xl shadow-purple-950/40 text-slate-100 max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700/60 shadow-sm"
          title="إغلاق النافذة"
        >
          <X className="size-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 pb-5 border-b border-slate-800">
          <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 shadow-inner flex items-center justify-center">
            {getProviderIcon(platformKey)}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">{config.titleAr}</h2>
              {savedSuccess && (
                <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="size-3.5" />
                  <span>المفاتيح مهيأة وجاهزة</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              إعداد تطبيق المطورين المركزي لمنصة لوناليزا (يتم ضبطه لمرة واحدة لتمكينك وجميع الشركات من تسجيل الدخول بنقرة واحدة).
            </p>
          </div>
        </div>

        {/* Informative Explanation Box for the Admin */}
        <div className="my-5 p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 text-xs leading-relaxed text-purple-200 flex items-start gap-3">
          <ShieldCheck className="size-5 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block mb-1">كيف يعمل الربط المركزي لمنظومة لوناليزا (Master SaaS Architecture):</span>
            أنت كمالك للمنصة تقوم بإنشاء التطبيق على لوحة مطوري المنصة المستهدفة ووضع مفاتيحه هنا لمرة واحدة. لاحقاً، يمكنك أنت ومدراء الشركات السياحية (B2B) الضغط مباشرة على زر «تسجيل الدخول وربط الحساب» لتفتح نافذة تسجيل الدخول الرسمية ويتم تفويض صفحات وحسابات كل شركة تلقائياً وبأمان تام دون الحاجة لأي مفاتيح!
          </div>
        </div>

        {/* Step-by-Step Guide */}
        <div className="space-y-3 mb-6">
          <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <span className="size-2 rounded-full bg-purple-500" />
            <span>خطوات الحصول على المفاتيح وتفعيل الربط الرسمي (خلال دقيقة واحدة):</span>
          </h3>

          <div className="grid gap-2.5">
            {config.steps.map((st) => (
              <div
                key={st.num}
                className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800/90 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="size-6 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                    {st.num}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100">{st.titleAr}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{st.descAr}</p>
                  </div>
                </div>

                {st.actionUrl && (
                  <a
                    href={st.actionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="self-start sm:self-center shrink-0 px-3 py-1.5 rounded-xl bg-slate-700/80 hover:bg-purple-600 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all border border-slate-600/60 shadow-xs"
                  >
                    <span>{st.actionLabelAr || "فتح الرابط ↗"}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Copy Redirect URI */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-dashed border-slate-700 mb-6">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold text-slate-400">
              رابط إعادة التوجيه المصرح به للمنصة (OAuth Redirect URI):
            </span>
            <button
              type="button"
              onClick={copyUri}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold flex items-center gap-1 transition-colors border border-slate-700"
            >
              {copied ? <CheckCircle2 className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              <span>{copied ? "تم النسخ بنجاح!" : "نسخ الرابط"}</span>
            </button>
          </div>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800/80 font-mono text-xs text-slate-200 text-left ltr break-all select-all">
            {config.redirectUri}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSaveKeys} className="space-y-4">
          <div className="grid gap-3.5 sm:grid-cols-2">
            {config.fields.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">{f.label}</label>
                <input
                  type={f.isSecret ? "password" : "text"}
                  name={`social_${f.key}_field`}
                  autoComplete="new-password"
                  value={formData[f.key] || ""}
                  onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
                {f.helpTextAr && <p className="text-[10px] text-slate-400 mt-1">{f.helpTextAr}</p>}
              </div>
            ))}
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs font-bold text-center">
              {errorMsg}
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
              <span>حفظ مفاتيح التطبيق المركزي للمنصة</span>
            </button>

            {savedSuccess && (
              <button
                type="button"
                onClick={launchRealOAuthLogin}
                className="w-full sm:w-auto flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Zap className="size-4" />
                <span>🌐 فتح نافذة الدخول الرسمية للمصادقة</span>
              </button>
            )}
          </div>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <a
            href={config.developerPortalUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-purple-400 hover:text-purple-300 inline-flex items-center gap-1 font-semibold"
          >
            <span>الانتقال المباشر إلى لوحة المطورين الرسمية ({config.englishName})</span>
            <ExternalLink className="size-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
