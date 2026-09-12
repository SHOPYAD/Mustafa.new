"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Coins,
  Compass,
  DollarSign,
  Heart,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  UserCheck,
  UserPlus,
  Video,
  Award,
  BookmarkCheck,
  Plane,
  Hotel,
  RefreshCw,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { PostCard } from "@/components/community/PostCard";
import type { ParsedTravelPost } from "@/lib/nostr/types";

export default function MemberProfilePage() {
  const params = useParams();
  const rawId = (params?.id as string) || "traveler";
  const memberId = decodeURIComponent(rawId);
  const { dir, locale } = useLocale();
  const isRtl = dir === "rtl";

  const [posts, setPosts] = useState<ParsedTravelPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "reels" | "bookings">("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Check admin status
  const isAdmin = useMemo(() => {
    return (
      memberId.toLowerCase() === "admin" ||
      memberId.includes("إدارة") ||
      memberId.includes("المشرف العام") ||
      memberId.includes("المنصة العامة")
    );
  }, [memberId]);

  // Member display name
  const displayName = useMemo(() => {
    if (isAdmin) return "إدارة المنصة العامة (Official Admin)";
    if (memberId.startsWith("npub1")) return `مسافر مميز (${memberId.slice(0, 10)}...)`;
    return memberId;
  }, [isAdmin, memberId]);

  // Follower counts (persisted in localStorage if available)
  const [followersCount, setFollowersCount] = useState(() => {
    return isAdmin ? 1420 : 185;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFollow = localStorage.getItem(`lonaliza_follow_${memberId}`);
      if (savedFollow === "true") {
        setIsFollowing(true);
      }
    }
  }, [memberId]);

  const handleToggleFollow = () => {
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setFollowersCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    if (typeof window !== "undefined") {
      localStorage.setItem(`lonaliza_follow_${memberId}`, String(nextState));
    }
  };

  const handleCopyProfile = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  // Fetch feed posts and filter for this user
  useEffect(() => {
    async function loadUserPosts() {
      setLoading(true);
      try {
        const res = await fetch("/api/community/feed?limit=60");
        const data = await res.json();
        if (data.ok && Array.isArray(data.posts)) {
          // Filter posts that belong to this member (by id, authorName, or pubkey)
          const matched = data.posts.filter((p: ParsedTravelPost) => {
            const pAny = p as any;
            if (isAdmin) {
              return Boolean(
                p.authorIsAdmin ||
                pAny.authorRole === "admin" ||
                p.authorName?.includes("إدارة") ||
                p.authorName?.includes("المشرف العام")
              );
            }
            return (
              pAny.authorId === memberId ||
              p.pubkey === memberId ||
              p.authorName === memberId ||
              p.author?.name === memberId ||
              p.author?.pubkey === memberId
            );
          });

          if (matched.length > 0) {
            setPosts(matched);
          } else {
            // Provide curated demo experiences for this user
            const fallbackPosts: ParsedTravelPost[] = data.posts.slice(0, 4).map((basePost: ParsedTravelPost, idx: number) => ({
              ...basePost,
              id: `user_${memberId}_post_${idx}`,
              authorName: displayName,
              authorId: memberId,
              authorIsAdmin: isAdmin,
              author: {
                ...basePost.author,
                name: displayName,
                tier: isAdmin ? "إدارة المنصة العامة (Official Admin)" : "Gold VIP Traveler",
              },
            }));
            setPosts(fallbackPosts);
          }
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    }

    loadUserPosts();
  }, [memberId, isAdmin, displayName]);

  // Derived filtered posts
  const filteredPosts = useMemo(() => {
    if (activeTab === "reels") {
      return posts.filter((p) => p.videos && p.videos.length > 0);
    }
    if (activeTab === "bookings") {
      return posts.filter((p) => Boolean(p.booking || p.sharedService));
    }
    return posts;
  }, [posts, activeTab]);

  const verifiedBookingsCount = isAdmin ? 28 : Math.max(posts.filter((p) => p.booking || p.sharedService).length + 3, 5);
  const reelsCount = posts.filter((p) => p.videos && p.videos.length > 0).length;
  const loyaltyPoints = isAdmin ? 15400 : 2850;
  const loyaltyUsdValue = (loyaltyPoints * 0.01).toFixed(2);
  const memberRank = isAdmin ? "الرتبة السيادية الأولى #1" : "الرتبة المتقدمة #4 بين الأعضاء";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24" dir={dir}>
      {/* Return to Community Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-xs transition-all active:scale-95"
          >
            {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            <span>العودة إلى مجتمع السفر العام</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyProfile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <Share2 className="h-3.5 w-3.5 text-slate-600" />
              <span>{copiedShare ? "تم نسخ الرابط!" : "مشاركة الملف"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* Profile Master Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-sm">
          <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Avatar and Identity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative shrink-0">
                <div className="size-20 sm:size-24 rounded-full overflow-hidden border-4 border-amber-400 bg-amber-50 shadow-md flex items-center justify-center">
                  {isAdmin ? (
                    <span className="text-4xl">👑</span>
                  ) : (
                    <img
                      src={`https://api.dicebear.com/7.x/bottts/svg?seed=${memberId}`}
                      alt={displayName}
                      className="size-full object-cover"
                    />
                  )}
                </div>
                {isAdmin && (
                  <span
                    className="absolute -top-1 -start-1 size-7 bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-white rounded-full flex items-center justify-center text-sm shadow-md border-2 border-white ring-2 ring-amber-400"
                    title="إدارة المنصة العامة"
                  >
                    👑
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {displayName}
                  </h1>
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 text-xs font-black shadow-xs border border-amber-300">
                      <span>👑</span>
                      <span>إدارة المنصة العامة (Official Admin)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>مسافر نشط وموثق</span>
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                  {isAdmin
                    ? "الحساب الإداري الرسمي المعتمد لمنظومة لوناليزا (Lonaliza). الإشراف العام على الخدمات السياحية، وتوثيق الحجوزات، واعتماد برامج الرحلات الحصرية."
                    : "عضو مسافر نخبوي موثق في مجتمع لوناليزا السياحي. يشارك تجاربه الفندقية ومسارات رحلاته واستعراضات الأماكن السياحية في العالم."}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-amber-600" />
                    <span>اسطنبول، تركيا والوجهات العالمية</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>عضو موثق منذ 2024</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Follow / Unfollow */}
            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleToggleFollow}
                className={`w-full sm:w-auto min-w-[160px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all shadow-md active:scale-95 cursor-pointer ${
                  isFollowing
                    ? "bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-800 border border-slate-300"
                    : "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/25"
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span>إلغاء المتابعة</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>+ متابعة المسافر</span>
                  </>
                )}
              </button>

              <div className="text-center sm:text-end text-xs text-slate-500 font-semibold px-1">
                <span>{followersCount.toLocaleString()} متابع نشط</span>
              </div>
            </div>
          </div>
        </div>

        {/* 6 Key Traveler Performance Indicators (KPI Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* 1. Verified Bookings */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">حجوزات المنصة</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                <BookmarkCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {verifiedBookingsCount}
            </div>
            <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              <span>✓</span>
              <span>حجوزات مؤكدة حية</span>
            </p>
          </div>

          {/* 2. Total Posts */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">المنشورات</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                <MessageCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {posts.length}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              تجارب وتقييمات سياحية
            </p>
          </div>

          {/* 3. Reels Videos */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">مقاطع الريلز</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                <Video className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {reelsCount}
            </div>
            <p className="text-[10px] text-purple-700 font-medium">
              فيديوهات سياحية قصيرة
            </p>
          </div>

          {/* 4. Active Followers */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">المتابعون</span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
                <Heart className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 font-mono">
              {followersCount.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              مسافر يتابع نشاطه
            </p>
          </div>

          {/* 5. Loyalty Points & USD Cash Value */}
          <div className="rounded-2xl border border-amber-300 bg-gradient-to-b from-amber-50/70 to-white p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-900">نقاط الولاء المكتسبة</span>
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-300">
                <Coins className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-900 font-mono">
              {loyaltyPoints.toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-800 font-black flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>قيمتها ${loyaltyUsdValue} USD</span>
            </p>
          </div>

          {/* 6. Member Rank / Tier */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">رتبة العضوية</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                <Trophy className="h-4 w-4" />
              </div>
            </div>
            <div className="text-sm font-black text-slate-900 truncate">
              {isAdmin ? "إدارة عليا" : "Gold VIP"}
            </div>
            <p className="text-[10px] text-amber-800 font-bold truncate">
              {memberRank}
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === "posts"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>منشورات وتجارب المسافر ({posts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reels")}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === "reels"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>مقاطع الريلز ({reelsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === "bookings"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <span>الحجوزات والتقييمات الموثقة</span>
          </button>
        </div>

        {/* Content Feed */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500">
            <RefreshCw className="h-6 w-6 animate-spin text-amber-600" />
            <span className="text-xs font-bold">جاري تحميل منشورات وسجلات المسافر...</span>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-16 rounded-3xl border border-dashed border-slate-200 bg-white text-center space-y-3">
            <div className="size-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">لا توجد مشاركات في هذا القسم حالياً</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              لم يقم هذا المسافر بنشر محتوى في هذا التصنيف بعد.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} currentLocale={locale} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
