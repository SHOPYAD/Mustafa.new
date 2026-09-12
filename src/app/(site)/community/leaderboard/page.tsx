"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Award,
  Sparkles,
  Coins,
  ArrowRight,
  ShieldCheck,
  Video,
  Camera,
  MessageSquare,
  Heart,
  Compass,
  Shield,
  Gem,
  Crown,
} from "lucide-react";
import type { CommunityLevelTier } from "@/lib/nostr/types";

// Helper to safely render tier badge icons without raw text leaking
function TierBadgeIcon({
  icon,
  badge,
  className = "h-8 w-8 text-amber-600",
}: {
  icon?: string;
  badge?: string;
  className?: string;
}) {
  const raw = `${icon || ""} ${badge || ""}`.toLowerCase().trim();
  if (raw.includes("compass")) {
    return <Compass className={className} />;
  }
  if (raw.includes("shield")) {
    return <Shield className={className} />;
  }
  if (raw.includes("award")) {
    return <Award className={className} />;
  }
  if (raw.includes("gem") || raw.includes("diamond")) {
    return <Gem className={className} />;
  }
  if (raw.includes("crown") || raw.includes("vip")) {
    return <Crown className={className} />;
  }
  if (badge && badge.length <= 4 && !badge.match(/[a-zA-Z]/)) {
    return <span className="text-2xl leading-none select-none">{badge}</span>;
  }
  return <Award className={className} />;
}

// Top Active Travelers for the Leaderboard
const TOP_TRAVELERS = [
  {
    rank: 1,
    name: "عبدالله الشمري",
    pubkey: "npub1topranked111222333444555666777888999000111222333444555",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AbdullahSh",
    tier: "سفير لوناليزا VIP",
    badge: "👑",
    points: 14250,
    postsCount: 48,
    reelsCount: 22,
  },
  {
    rank: 2,
    name: "سارة المهندي",
    pubkey: "npub1traveler9871239871239871239871239871239871239871239871239871",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SaraM",
    tier: "نخبة السفر البلاتينية",
    badge: "💎",
    points: 9800,
    postsCount: 34,
    reelsCount: 15,
  },
  {
    rank: 3,
    name: "أحمد بن سلطان",
    pubkey: "npub1lonaliza8762348762348762348762348762348762348762348762348762",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AhmedSultan",
    tier: "رحالة ذهبي VIP",
    badge: "🥇",
    points: 6450,
    postsCount: 26,
    reelsCount: 8,
  },
  {
    rank: 4,
    name: "د. خالد المنصوري",
    pubkey: "npub1doctor4445556667778889990001112223334445556667778889990001",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=DrMansoor",
    tier: "مسافر فضي",
    badge: "🥈",
    points: 3200,
    postsCount: 18,
    reelsCount: 4,
  },
  {
    rank: 5,
    name: "نورة القحطاني",
    pubkey: "npub1noura222333444555666777888999000111222333444555666777888999",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=NouraQ",
    tier: "مستكشف برونزي",
    badge: "🥉",
    points: 1450,
    postsCount: 9,
    reelsCount: 2,
  },
];

export default function CommunityLeaderboardPage() {
  const [tiers, setTiers] = useState<CommunityLevelTier[]>([]);
  const [wallet, setWallet] = useState<{ points: number; usd: number }>({
    points: 0,
    usd: 0,
  });

  useEffect(() => {
    fetch("/api/community/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.tiers) setTiers(data.tiers);
      })
      .catch(() => {});

    fetch("/api/loyalty/wallet")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setWallet({
            points: data.points || 0,
            usd: data.usd || 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Compute current user level and next tier
  const currentPoints = wallet.points;
  let currentTier = tiers[0] || {
    name: { ar: "مستكشف برونزي" },
    nameAr: "مستكشف برونزي",
    minPoints: 0,
    badgeIcon: "Compass",
  };
  let nextTier = tiers[1];

  for (let i = 0; i < tiers.length; i++) {
    if (currentPoints >= tiers[i].minPoints) {
      currentTier = tiers[i];
      nextTier = tiers[i + 1];
    }
  }

  const progressPct = nextTier
    ? Math.min(100, Math.round((currentPoints / nextTier.minPoints) * 100))
    : 100;

  return (
    <main
      className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-900 dark:text-slate-100 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-10">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/community"
            className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-all whitespace-nowrap"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة إلى مجتمع السفر</span>
          </Link>

          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs bg-amber-50 dark:bg-amber-950/40 px-3.5 py-1.5 rounded-full border border-amber-200 dark:border-amber-800/50 font-bold whitespace-nowrap">
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>برنامج مكافآت ونقاط السفر VIP</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/70 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/60 text-amber-800 dark:text-amber-300 text-xs font-bold shadow-xs">
            <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>لوحة المتصدرين ومستويات المسافرين</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            اكسب النقاط، ارتقِ برتبتك، وسافر بخصومات حصرية
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
            كل تقييم حقيقي أو ريلز تشاركه في مجتمع مسافري لوناليزا يرفع من تصنيفك بين نخبة المسافرين
            ويمنحك رصيداً دولارياً فورياً للحجوزات!
          </p>
        </div>

        {/* User Progress Bar Card */}
        <div className="rounded-3xl border border-amber-200/80 dark:border-amber-800/50 bg-gradient-to-r from-amber-50/70 via-white to-orange-50/50 dark:from-amber-950/20 dark:via-slate-900 dark:to-orange-950/15 p-5 sm:p-8 shadow-xl shadow-amber-500/5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-6">
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-amber-100/90 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-700/60 flex items-center justify-center shrink-0 shadow-xs">
                <TierBadgeIcon
                  icon={currentTier.badgeIcon}
                  badge={currentTier.badge}
                  className="h-7 w-7 sm:h-8 sm:w-8 text-amber-700 dark:text-amber-400"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">رتبتك الحالية:</span>
                  <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                    {currentTier.name?.ar || currentTier.nameAr || "مستكشف برونزي"}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                  {currentPoints.toLocaleString()}{" "}
                  <span className="text-xs sm:text-sm text-slate-400 font-normal">
                    نقطة مجتمع
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 border-t sm:border-t-0 sm:border-r border-slate-200 dark:border-slate-800 pt-4 sm:pt-0 sm:pr-6">
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">القيمة بالدولار للمحفظة:</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  ${wallet.usd}
                </div>
              </div>
              <Link
                href="/account"
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-amber-500/20 shrink-0 whitespace-nowrap"
              >
                استبدال برصيد حجز
              </Link>
            </div>
          </div>

          {/* Progress to Next Tier */}
          {nextTier && (
            <div className="space-y-2 border-t border-slate-200/70 dark:border-slate-800 pt-4">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>
                  التقدم نحو{" "}
                  <strong className="text-amber-700 dark:text-amber-400 font-bold">
                    {nextTier.name?.ar || nextTier.nameAr || ""}
                  </strong>
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {currentPoints} / {nextTier.minPoints} نقطة ({progressPct}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* How to Earn Points Grid */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            <span>كيف تكسب النقاط على مجتمع لوناليزا؟</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <Video className="h-6 w-6 text-rose-500 mx-auto" />
              <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono">
                +150 نقطة
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                نشر مقطع ريلز سياحي
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <Camera className="h-6 w-6 text-blue-500 mx-auto" />
              <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono">
                +100 نقطة
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                مشاركة صور التجربة
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <MessageSquare className="h-6 w-6 text-purple-500 mx-auto" />
              <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono">
                +50 نقطة
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                كتابة تقرير سياحي
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <MessageSquare className="h-6 w-6 text-emerald-500 mx-auto" />
              <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono">
                +25 نقطة
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                التعليق والمساعدة
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-center space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all col-span-2 sm:col-span-1">
              <Heart className="h-6 w-6 text-rose-500 mx-auto" />
              <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono">
                +5 نقاط
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                الإعجاب بالمشاركات
              </div>
            </div>
          </div>
        </div>

        {/* Tiers Breakdown Cards */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            <span>رتب ومستويات المسافرين ومزاياها</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 flex flex-col justify-between space-y-3 hover:border-amber-400 dark:hover:border-amber-500/50 hover:shadow-md transition-all"
              >
                <div>
                  <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center mb-3">
                    <TierBadgeIcon
                      icon={tier.badgeIcon}
                      badge={tier.badge}
                      className="h-6 w-6 text-amber-600 dark:text-amber-400"
                    />
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {tier.name?.ar || tier.nameAr || ""}
                  </h3>
                  <div className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold mt-1">
                    {tier.minPoints.toLocaleString()}+ نقطة
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-2.5">
                  {tier.perks?.ar || "مزايا سياحية حصرية وتخفيضات فورية"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <span>أبرز رواد ومستكشفي المجتمع تفاعلاً</span>
          </h2>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-right text-xs sm:text-sm">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/60 whitespace-nowrap">
                <tr>
                  <th className="p-3.5 sm:p-4">المركز</th>
                  <th className="p-3.5 sm:p-4">المسافر</th>
                  <th className="p-3.5 sm:p-4">الرتبة</th>
                  <th className="p-3.5 sm:p-4">التقارير</th>
                  <th className="p-3.5 sm:p-4">الريلز</th>
                  <th className="p-3.5 sm:p-4">إجمالي النقاط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 whitespace-nowrap">
                {TOP_TRAVELERS.map((traveler) => (
                  <tr key={traveler.rank} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 sm:p-4">
                      <span
                        className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-black font-mono ${
                          traveler.rank === 1
                            ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30"
                            : traveler.rank === 2
                            ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                            : traveler.rank === 3
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {traveler.rank}
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <img
                          src={traveler.avatar}
                          alt={traveler.name}
                          className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 object-cover shadow-xs"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                            {traveler.name}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {traveler.pubkey.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 sm:p-4">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200/80 dark:border-amber-800/50">
                        <span>{traveler.badge}</span>
                        <span>{traveler.tier}</span>
                      </span>
                    </td>
                    <td className="p-3.5 sm:p-4 font-mono text-slate-600 dark:text-slate-400">{traveler.postsCount}</td>
                    <td className="p-3.5 sm:p-4 font-mono text-slate-600 dark:text-slate-400">{traveler.reelsCount}</td>
                    <td className="p-3.5 sm:p-4 font-mono font-black text-amber-600 dark:text-amber-400 text-sm sm:text-base">
                      {traveler.points.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
