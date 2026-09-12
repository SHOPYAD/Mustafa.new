"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import {
  Video,
  MapPin,
  RefreshCw,
  Sparkles,
  Trophy,
  Compass,
  ChevronLeft,
  ChevronRight,
  Coins,
  X,
  Flame,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { PostCard } from "@/components/community/PostCard";
import { PostComposer } from "@/components/community/PostComposer";
import { CommunitySidebar } from "@/components/community/CommunitySidebar";
import type {
  NostrRelayConfig,
  TravelCategory,
  TravelDestination,
  CommunityLevelTier,
  ParsedTravelPost,
} from "@/lib/nostr/types";
import { getCommunityTranslations } from "@/lib/i18n/community-translations";

export default function CommunityFeedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F4FC]" />}>
      <CommunityFeedInner />
    </Suspense>
  );
}

function CommunityFeedInner() {
  const { locale, dir } = useLocale();
  const commT = getCommunityTranslations(locale);
  const isRtl = locale === "ar";
  const searchParams = useSearchParams();
  const momentsOnly = searchParams.get("tab") === "moments";

  const [relays, setRelays] = useState<NostrRelayConfig[]>([]);
  const [categories, setCategories] = useState<TravelCategory[]>([]);
  const [destinations, setDestinations] = useState<TravelDestination[]>([]);
  const [tiers, setTiers] = useState<CommunityLevelTier[]>([]);

  const [posts, setPosts] = useState<ParsedTravelPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDestination, setSelectedDestination] = useState<string>("all");

  // Mobile Wallet Drawer State
  const [showMobileWalletModal, setShowMobileWalletModal] = useState(false);

  // Scroll Container Refs for Smooth Arrow Navigation
  const catScrollRef = useRef<HTMLDivElement>(null);
  const destScrollRef = useRef<HTMLDivElement>(null);

  const scrollCat = (direction: "left" | "right") => {
    if (catScrollRef.current) {
      catScrollRef.current.scrollBy({
        left: direction === "left" ? -180 : 180,
        behavior: "smooth",
      });
    }
  };

  const scrollDest = (direction: "left" | "right") => {
    if (destScrollRef.current) {
      destScrollRef.current.scrollBy({
        left: direction === "left" ? -180 : 180,
        behavior: "smooth",
      });
    }
  };

  // Load config & live feed
  const loadConfigAndFeed = useCallback(async () => {
    try {
      // 1. Fetch config
      const cfgRes = await fetch("/api/community/config");
      const cfgData = await cfgRes.json();
      if (cfgData.ok) {
        setRelays(cfgData.relayConfigs || cfgData.relays || []);
        setCategories(cfgData.categories || []);
        setDestinations(cfgData.destinations || []);
        setTiers(cfgData.tiers || []);
      }

      // 2. Fetch unified posts feed from persistent store & curated feed
      const feedRes = await fetch(
        `/api/community/feed?category=${selectedCategory}&destination=${selectedDestination}&limit=50${momentsOnly ? "&kind=moment" : ""}`
      );
      const feedData = await feedRes.json();
      if (feedData.ok && Array.isArray(feedData.posts)) {
        setPosts(feedData.posts);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, selectedDestination, momentsOnly]);

  useEffect(() => {
    loadConfigAndFeed();
  }, [loadConfigAndFeed]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadConfigAndFeed();
  };

  // Immediate prepend of newly published post so it appears instantly on the page
  const handlePostPublished = (newPost?: ParsedTravelPost) => {
    if (newPost) {
      setPosts((prev) => [newPost, ...prev.filter((p) => p.id !== newPost.id)]);
    } else {
      loadConfigAndFeed();
    }
  };

  // Sort state: trending vs latest
  const [sortMode, setSortMode] = useState<"trending" | "latest">("trending");

  // Infinite Scroll state
  const [visibleCount, setVisibleCount] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Score function for smart algorithmic ranking (Engagement + Freshness + Booking Verification)
  const scorePost = useCallback((post: ParsedTravelPost): number => {
    const now = Math.floor(Date.now() / 1000);
    const ageHours = Math.max(0, (now - (post.created_at || now)) / 3600);
    const isJustPosted = ageHours < 0.75;
    const freshBonus = isJustPosted ? 100 : 0;
    const likes = post.likesCount || 0;
    const comments = post.commentsCount || 0;
    const views = post.viewsCount || (likes * 14 + 180);
    const hasBooking = Boolean(post.booking || (post as any).bookingRef);

    // Dynamic gravity decay formula
    const interactionPoints = likes * 3 + comments * 5 + views * 0.05 + (hasBooking ? 40 : 0) + freshBonus;
    return interactionPoints / Math.pow(ageHours + 2, 1.15);
  }, []);

  const filteredPosts = posts.filter((post) => {
    if (selectedCategory !== "all" && post.category !== selectedCategory) {
      return false;
    }
    if (selectedDestination !== "all" && post.destination !== selectedDestination) {
      return false;
    }
    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortMode === "latest") {
      return (b.created_at || 0) - (a.created_at || 0);
    }
    return scorePost(b) - scorePost(a);
  });

  const visiblePosts = sortedPosts.slice(0, visibleCount);
  const hasMore = visibleCount < sortedPosts.length;

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    if (!hasMore || isLoadingMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => prev + 4);
            setIsLoadingMore(false);
          }, 300);
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore]);

  return (
    <main className="min-h-screen bg-transparent text-[var(--theme-text-body)] transition-colors duration-200 pt-24 pb-20 px-3 sm:px-6 lg:px-8" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto">
        {/* Top Hero Banner - Adaptive Light / Dark Luxury */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-50 via-purple-50/50 to-white dark:from-slate-900/90 dark:via-purple-950/30 dark:to-slate-900/90 border border-slate-200/90 dark:border-white/10 p-5 sm:p-8 mb-6 sm:mb-8 shadow-sm backdrop-blur-md">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs mb-3 px-3 py-1 rounded-full bg-amber-100/70 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-700/50">
                <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>{commT.heroTag}</span>
              </div>
              <h1 className="text-xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                {commT.heroTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mt-2 leading-relaxed font-normal">
                {commT.heroSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
              <Link
                href="/community/reels"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-500/20 transition-all"
              >
                <Video className="h-4 w-4 shrink-0" />
                <span>{commT.reelsButton}</span>
              </Link>
              <Link
                href="/community/leaderboard"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm shadow-xs transition-all"
              >
                <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
                <span>{commT.leaderboardButton}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Points & Tiers Launcher (Visible only on mobile screen) */}
        <div className="block lg:hidden mb-6">
          <button
            type="button"
            data-keep-color="true"
            onClick={() => setShowMobileWalletModal(true)}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer border border-amber-400/40"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs text-white">
                <Coins className="h-5 w-5 shrink-0" />
              </div>
              <div className={isRtl ? "text-right" : "text-left"}>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-white">{commT.mobileWalletButton}</span>
                  <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-bold">Loyalty</span>
                </div>
                <p className="text-[11px] text-amber-100 mt-0.5">{commT.mobileWalletSub}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 text-white">
              <span>{commT.viewModal}</span>
              <Sparkles className="h-3.5 w-3.5 text-amber-200" />
            </div>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="relative flex items-center mb-4 group">
          <button
            type="button"
            onClick={() => scrollCat(isRtl ? "right" : "left")}
            className="shrink-0 z-10 size-8 sm:size-9 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer active:scale-95 mx-1"
            aria-label="Scroll left"
          >
            {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          <div
            ref={catScrollRef}
            className="flex-1 flex items-center gap-2 overflow-x-auto py-1 scrollbar-hide select-none scroll-smooth touch-pan-x"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/25 border border-amber-500"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs"
              }`}
            >
              {commT.allCategories}
            </button>
            {categories.map((cat) => {
              const catLabel =
                locale === "ar"
                  ? cat.name?.ar || cat.nameAr || cat.slug
                  : cat.name?.en || cat.nameEn || cat.name?.tr || cat.slug;
              return (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    selectedCategory === cat.slug
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/25 border border-amber-500"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-xs"
                  }`}
                >
                  {catLabel}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollCat(isRtl ? "left" : "right")}
            className="shrink-0 z-10 size-8 sm:size-9 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer active:scale-95 mx-1"
            aria-label="Scroll right"
          >
            {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Destination Filter Pills */}
        <div className="relative flex items-center pb-4 mb-6 border-b border-slate-200/80 dark:border-slate-800 group">
          <button
            type="button"
            onClick={() => scrollDest(isRtl ? "right" : "left")}
            className="shrink-0 z-10 size-7 sm:size-8 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer active:scale-95 mx-1"
            aria-label="Scroll destinations left"
          >
            {isRtl ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>

          <div
            ref={destScrollRef}
            className="flex-1 flex items-center gap-2 overflow-x-auto py-1 scrollbar-hide select-none scroll-smooth touch-pan-x"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold shrink-0 flex items-center gap-1 mx-2">
              <MapPin className="h-3.5 w-3.5 text-rose-500" />
              <span>{commT.destinationLabel}</span>
            </span>
            <button
              onClick={() => setSelectedDestination("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedDestination === "all"
                  ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs font-bold"
                  : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-slate-700"
              }`}
            >
              {commT.allDestinations}
            </button>
            {destinations.map((dest, idx) => {
              const dName =
                locale === "ar"
                  ? dest.name?.ar || dest.cityAr || "الوجهة"
                  : dest.name?.en || dest.cityEn || dest.slug || "Destination";
              return (
                <button
                  key={dest.slug || dest.id || idx}
                  onClick={() => setSelectedDestination(dName)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    selectedDestination === dName
                      ? "bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs font-bold"
                      : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-slate-700"
                  }`}
                >
                  {dName}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollDest(isRtl ? "left" : "right")}
            className="shrink-0 z-10 size-7 sm:size-8 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-all cursor-pointer active:scale-95 mx-1"
            aria-label="Scroll destinations right"
          >
            {isRtl ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Main Grid: Feed + Desktop-Only Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feed Column (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interactive Post Composer */}
            <PostComposer
              categories={categories}
              destinations={destinations}
              relays={relays}
              onPostPublished={handlePostPublished}
            />

            {/* Feed Controls Header with Algorithmic Sort Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-amber-500" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{commT.feedTitle}</h2>
                <span className="text-xs text-slate-400">({sortedPosts.length} {commT.postsCount})</span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                {/* Algorithmic Sort Toggle */}
                <div className="flex items-center p-1 bg-slate-200/70 dark:bg-slate-800 rounded-2xl text-xs font-bold select-none border border-slate-300/40 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setSortMode("trending");
                      setVisibleCount(6);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      sortMode === "trending"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Flame className={`h-3.5 w-3.5 ${sortMode === "trending" ? "text-amber-500 fill-amber-500" : ""}`} />
                    <span>{commT.trending}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSortMode("latest");
                      setVisibleCount(6);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                      sortMode === "latest"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Clock className={`h-3.5 w-3.5 ${sortMode === "latest" ? "text-blue-500" : ""}`} />
                    <span>{commT.latest}</span>
                  </button>
                </div>

                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  title="تحديث التغذية"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-amber-500" : ""}`} />
                  <span className="hidden sm:inline">تحديث</span>
                </button>
              </div>
            </div>

            {/* Posts List with Progressive Infinite Scroll */}
            <div className="space-y-6">
              {visiblePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentLocale={locale || "ar"}
                  onLike={async (postId) => {
                    try {
                      await fetch("/api/community/reward", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "like", eventId: postId }),
                      });
                    } catch {}
                  }}
                  onComment={async (postId, text) => {
                    try {
                      await fetch("/api/community/reward", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "comment", eventId: postId }),
                      });
                    } catch {}
                  }}
                />
              ))}

              {/* Infinite Scroll Loader / Sentinel */}
              {hasMore && (
                <div
                  ref={sentinelRef}
                  className="py-6 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium select-none"
                >
                  <RefreshCw className="h-4 w-4 animate-spin text-amber-500" />
                  <span>جاري تحميل المزيد من تجارب السفر التفاعلية...</span>
                </div>
              )}

              {!hasMore && sortedPosts.length > 6 && (
                <div className="py-8 text-center text-xs text-slate-400 font-medium border-t border-slate-200/60 select-none">
                  ✨ تم عرض كافة تجارب المسافرين الحالية. شارك تجربتك لتظهر في الصدارة!
                </div>
              )}

              {sortedPosts.length === 0 && !loading && (
                <div className="p-8 text-center rounded-3xl bg-white border border-slate-200 text-slate-500 text-sm">
                  <p className="font-bold text-slate-800 text-base">{commT.noPostsTitle}</p>
                  <p className="mt-1 text-slate-500 text-xs">{commT.noPostsSub}</p>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Sidebar Column (Hidden on Mobile, preventing bottom clutter) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <CommunitySidebar
                destinations={destinations}
                tiers={tiers}
                activeDestination={selectedDestination}
                onSelectDestination={setSelectedDestination}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Points & Tiers Modal Sheet */}
      {showMobileWalletModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-300"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-500" />
                <h3 className="font-extrabold text-base text-slate-900">{commT.walletTitle}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileWalletModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <CommunitySidebar
              destinations={destinations}
              tiers={tiers}
              activeDestination={selectedDestination}
              onSelectDestination={(dest) => {
                setSelectedDestination(dest);
                setShowMobileWalletModal(false);
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
