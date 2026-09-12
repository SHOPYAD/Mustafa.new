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
} from "lucide-react";
import type { PublicSocialAccount, SocialCredentialsStatus, SocialPlatform } from "@/lib/social/types";

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

const CARDS: Array<{ platform: SocialPlatform | "google_ads" | "meta_ads"; label: string }> = [
  { platform: "facebook", label: "فيسبوك" },
  { platform: "instagram", label: "إنستغرام" },
  { platform: "tiktok", label: "تيك توك" },
  { platform: "x", label: "إكس (تويتر)" },
  { platform: "youtube", label: "يوتيوب" },
  { platform: "google_ads", label: "إعلانات جوجل" },
  { platform: "meta_ads", label: "إعلانات ميتا" },
];

function Icon({ platform }: { platform: (typeof CARDS)[number]["platform"] }) {
  switch (platform) {
    case "facebook":
      return <Facebook className="size-4" />;
    case "instagram":
      return <Instagram className="size-4" />;
    case "youtube":
      return <Youtube className="size-4" />;
    case "tiktok":
      return <Music2 className="size-4" />;
    case "x":
      return <Share2 className="size-4" />;
    case "google_ads":
    case "meta_ads":
      return <Megaphone className="size-4" />;
    default: {
      const _never: never = platform;
      return <Share2 className="size-4" aria-label={String(_never)} />;
    }
  }
}

function connectHref(platform: SocialPlatform): string {
  switch (platform) {
    case "facebook":
    case "instagram":
      return "/api/oauth/meta";
    case "youtube":
      return "/api/oauth/youtube";
    case "tiktok":
      return "/api/oauth/tiktok";
    case "x":
      return "/api/oauth/x";
    default: {
      const _never: never = platform;
      return String(_never);
    }
  }
}

export default function ConnectionsHub() {
  const [accounts, setAccounts] = useState<PublicSocialAccount[]>([]);
  const [credentials, setCredentials] = useState<SocialCredentialsStatus[]>([]);
  const [ads, setAds] = useState<AdsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/automation/connections", { cache: "no-store", credentials: "same-origin" });
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
  }, [load]);

  const accountFor = (platform: SocialPlatform) =>
    accounts.find((row) => row.platform === platform && row.hasAccessToken && row.status === "connected");

  const credFor = (platform: SocialPlatform) => {
    if (platform === "facebook" || platform === "instagram") {
      return credentials.find((row) => row.provider === "meta");
    }
    if (platform === "youtube") return credentials.find((row) => row.provider === "youtube");
    if (platform === "tiktok") return credentials.find((row) => row.provider === "tiktok");
    return credentials.find((row) => row.provider === "x");
  };

  const testAccount = async (id: string) => {
    setTesting(id);
    try {
      await fetch("/api/social/accounts/refresh", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      await load();
    } finally {
      setTesting("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        جاري تحميل حالة الحسابات…
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {CARDS.map((card) => {
        if (card.platform === "google_ads" || card.platform === "meta_ads") {
          const live = card.platform === "google_ads" ? ads?.googleLive : ads?.metaLive;
          const missing = card.platform === "google_ads" ? ads?.missingGoogle : ads?.missingMeta;
          return (
            <div key={card.platform} className="rounded-2xl border border-border p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 font-semibold">
                  <Icon platform={card.platform} />
                  {card.label}
                </span>
                <span className={live ? "text-xs text-emerald-400" : "text-xs text-amber-300"}>
                  {live ? "حي" : "تجريبي / غير متصل"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {live
                  ? "المفاتيح موجودة — الإطلاق يبقى بعد موافقة وميزانية."
                  : `ناقص: ${(missing || []).join("، ") || "لم تُضبط المفاتيح"}`}
              </p>
              <Link
                href="/admin/ads"
                className="mt-3 inline-flex items-center gap-1 text-xs text-amber-600 hover:underline"
              >
                فتح إعدادات الإعلانات
                <ExternalLink className="size-3" />
              </Link>
            </div>
          );
        }

        const acc = accountFor(card.platform);
        const cred = credFor(card.platform);
        const connected = Boolean(acc);
        return (
          <div key={card.platform} className="rounded-2xl border border-border p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 font-semibold">
                <Icon platform={card.platform} />
                {card.label}
              </span>
              <span className={connected ? "text-xs text-emerald-400" : "text-xs text-muted-foreground"}>
                {connected ? (
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> متصل
                  </span>
                ) : (
                  "غير متصل"
                )}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {acc
                ? `${acc.displayName}${acc.lastRefreshedAt ? ` · آخر فحص ${acc.lastRefreshedAt.slice(0, 16)}` : ""}`
                : cred?.configured
                  ? "المفاتيح موجودة — اضغطوا ربط."
                  : `أضيفوا ${(cred?.missing || []).join(" · ") || "مفاتيح التطبيق"} ثم اربطوا.`}
            </p>
            {cred?.redirectUri ? (
              <p className="mt-1 break-all text-[11px] text-muted-foreground">Redirect: {cred.redirectUri}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {cred?.configured ? (
                <a
                  href={connectHref(card.platform)}
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white transition-colors shadow-sm"
                >
                  {connected ? "إعادة ربط" : "ربط الحساب"}
                </a>
              ) : (
                <span className="rounded-xl border px-3 py-1.5 text-xs text-muted-foreground">الربط معطّل بلا مفاتيح</span>
              )}
              {acc ? (
                <button
                  type="button"
                  onClick={() => void testAccount(acc.id)}
                  className="rounded-xl border px-3 py-1.5 text-xs"
                >
                  {testing === acc.id ? <Loader2 className="size-3 animate-spin" /> : "اختبار"}
                </button>
              ) : null}
              <Link href="/admin/social-accounts" className="rounded-xl border px-3 py-1.5 text-xs">
                الإعدادات الكاملة
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
