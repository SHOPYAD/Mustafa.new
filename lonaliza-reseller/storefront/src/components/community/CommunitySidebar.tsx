"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Coins,
  Video,
  Trophy,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Compass,
  Shield,
  Award,
  Gem,
  Crown,
} from "lucide-react";
import type { TravelDestination, CommunityLevelTier } from "@/lib/nostr/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { getCommunityTranslations } from "@/lib/i18n/community-translations";

function TierIcon({ icon, badge }: { icon?: string; badge?: string }) {
  const raw = `${icon || ""} ${badge || ""}`.toLowerCase();
  if (raw.includes("compass")) return <Compass className="h-4 w-4 text-amber-600 shrink-0" />;
  if (raw.includes("shield")) return <Shield className="h-4 w-4 text-slate-500 shrink-0" />;
  if (raw.includes("award")) return <Award className="h-4 w-4 text-amber-500 shrink-0" />;
  if (raw.includes("gem") || raw.includes("diamond")) return <Gem className="h-4 w-4 text-cyan-600 shrink-0" />;
  if (raw.includes("crown") || raw.includes("vip")) return <Crown className="h-4 w-4 text-amber-600 shrink-0" />;
  if (badge && badge.length <= 4 && !badge.match(/[a-zA-Z]/)) {
    return <span className="text-sm leading-none shrink-0">{badge}</span>;
  }
  return <Award className="h-4 w-4 text-amber-500 shrink-0" />;
}

interface CommunitySidebarProps {
  destinations: TravelDestination[];
  tiers: CommunityLevelTier[];
  activeDestination?: string;
  onSelectDestination?: (dest: string) => void;
}

export function CommunitySidebar({
  destinations,
  tiers,
  activeDestination,
  onSelectDestination,
}: CommunitySidebarProps) {
  const { locale } = useLocale();
  const commT = getCommunityTranslations(locale);
  const isRtl = locale === "ar";

  const [wallet, setWallet] = useState<{
    points: number;
    usd: number;
    isLoggedIn: boolean;
  }>({
    points: 0,
    usd: 0,
    isLoggedIn: false,
  });

  useEffect(() => {
    fetch("/api/loyalty/wallet")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setWallet({
            points: data.points || 0,
            usd: data.usd || 0,
            isLoggedIn: true,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <aside className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* Wallet Widget */}
      <div className="rounded-3xl border border-amber-200/80 dark:border-amber-500/30 bg-gradient-to-b from-amber-50/80 via-white to-white dark:from-amber-950/25 dark:via-slate-900 dark:to-slate-900 p-5 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{commT.walletTitle}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{commT.walletSubtitle}</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-bold font-mono">
            Loyalty
          </span>
        </div>

        <div className="flex items-baseline justify-between border-t border-slate-100 dark:border-slate-800 pt-3 mb-4">
          <div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
              {wallet.points.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500">{commT.pointsEarned}</div>
          </div>
          <div className={isRtl ? "text-left" : "text-right"}>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              ≈ ${wallet.usd}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500">{commT.discountValue}</div>
          </div>
        </div>

        <Link
          href="/account"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/20"
        >
          <span>{commT.redeemPoints}</span>
          {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Link>
      </div>

      {/* Reels Shortcut Banner */}
      <Link
        href="/community/reels"
        className="group block rounded-3xl border border-rose-200/80 dark:border-rose-900/40 bg-gradient-to-r from-rose-50/60 via-purple-50/40 to-white dark:from-rose-950/20 dark:via-purple-950/20 dark:to-slate-900 p-5 shadow-sm transition-all hover:shadow-md hover:border-rose-300 dark:hover:border-rose-700/60"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
            <Video className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{commT.verticalReelsTitle}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-600 text-white font-bold animate-pulse">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {commT.verticalReelsSub}
            </p>
          </div>
        </div>
      </Link>

      {/* Leaderboard & Tiers Widget */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{commT.tiersTitle}</h3>
          </div>
          <Link
            href="/community/leaderboard"
            className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold hover:underline"
          >
            {commT.viewAll}
          </Link>
        </div>

        <div className="space-y-2.5">
          {tiers.slice(0, 4).map((tier) => {
            const tierTitle =
              locale === "ar"
                ? tier.name?.ar || tier.nameAr || ""
                : tier.name?.en || tier.nameEn || tier.name?.tr || "";
            return (
              <div
                key={tier.id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <TierIcon icon={tier.badgeIcon} badge={tier.badge} />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{tierTitle}</span>
                </div>
                <span className="font-mono text-amber-700 dark:text-amber-400 font-bold">
                  {tier.minPoints} {commT.pointsSuffix}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verified Travel Experience Guarantee Badge */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 p-4 text-xs text-slate-600 dark:text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>{commT.verifiedBadgeTitle}</span>
        </div>
        <p className="leading-relaxed text-[11px] text-slate-500 dark:text-slate-400">
          {commT.verifiedBadgeText}
        </p>
      </div>
    </aside>
  );
}
