"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  Play,
  ArrowRight,
  Sparkles,
  MapPin,
  X,
  Send,
  Languages,
  Check,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  Loader2,
  Eye,
} from "lucide-react";
import type { TravelReelItem, NostrRelayConfig, ParsedTravelPost } from "@/lib/nostr/types";
import { fetchTourismReels } from "@/lib/nostr/client";
import { useLocale } from "@/lib/i18n/LocaleProvider";

interface ReelComment {
  id: string;
  postId: string;
  authorName: string;
  authorAvatar: string;
  authorTier?: string;
  text: string;
  createdAt: number;
  likesCount: number;
}

// Verified initial reels for immediate ultra-fast playback
// Verified initial reels with real published blossom video as top reel
const INITIAL_DEMO_REELS: TravelReelItem[] = [
  {
    id: "post_1788519513862_nux1td",
    pubkey: "npub1user1788519513862pgle",
    title: "تجربة فندقية فاخرة في قلب إسطنبول الساحرة ✨",
    description: "بين سحر البوسفور والتاريخ العريق الذي ينبض بالفخامة، إقامة استثنائية في أرقى المعالم الفندقية مع إطلالات ساحرة وخدمات VIP متكاملة لا تُنسى في إسطنبول! 🇹🇷✨",
    videoUrl: "https://blossom.primal.net/40860043d2f16f332379773c950b640ed7be9ec9e9a698d70a362395e4efae3d.mp4",
    category: "hotels",
    destination: "إسطنبول",
    likesCount: 184,
    commentsCount: 23,
    created_at: Math.floor(Date.now() / 1000) - 7200,
    author: {
      pubkey: "npub1user1788519513862pgle",
      name: "مسافر لوناليزا VIP",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=npub1user1",
    },
  },
  {
    id: "reel_01",
    pubkey: "npub1lonalizapremium111222333444555666777888999000111222333444555",
    title: "جولة الغروب الخاصة في البوسفور 🌅",
    description: "أجمل لحظات الغروب من يخت خاص في مضيق البوسفور. إطلالة ساحرة على قصر دولمة بهجة والجسور المعلقة وأنوار المدينة التاريخية. تجربة خيالية لا تُنسى في إسطنبول! 🇹🇷✨",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-41559-large.mp4",
    category: "tours",
    destination: "إسطنبول",
    likesCount: 184,
    commentsCount: 23,
    created_at: Math.floor(Date.now() / 1000) - 7200,
    author: {
      pubkey: "npub1lonalizapremium111222333444555666777888999000111222333444555",
      name: "كابتن سياحي - مراد",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=MuradTravel",
    },
  },
  {
    id: "reel_02",
    pubkey: "npub1trabzonlover999888777666555444333222111000999888777666555444",
    title: "مرتفعات آيدر والأكواخ الخشبية وسط الضباب 🌲",
    description: "هدوء الطبيعة وصوت المياه العذبة في ريزا والشمال التركي. الإقامة في هذه الأكواخ الخشبية وسط مزارع الشاي تعيد شحن الطاقة بالكامل. أجواء باردة ومنعشة صيفاً وشتاءً! 🏔️☕",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fog-over-a-mountain-forest-42861-large.mp4",
    category: "hotels",
    destination: "طرابزون",
    likesCount: 312,
    commentsCount: 46,
    created_at: Math.floor(Date.now() / 1000) - 21600,
    author: {
      pubkey: "npub1trabzonlover999888777666555444333222111000999888777666555444",
      name: "رحالة الخليج العربي",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=GulfTraveler",
    },
  },
  {
    id: "reel_03",
    pubkey: "npub1cappadociaballoon333444555666777888999000111222333444555666",
    title: "منطاد كابادوكيا مع شروق الشمس 🎈",
    description: "التحليق الهادئ فوق وادي المداخن الصخرية والكهوف المنحوتة في كابادوكيا مع ساعات الفجر الأولى. مشهد سينمائي بديع يستحق الاستيقاظ مبكراً وخوض المغامرة! 🌄",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-clouds-and-blue-sky-2408-large.mp4",
    category: "activities",
    destination: "كابادوكيا",
    likesCount: 528,
    commentsCount: 71,
    created_at: Math.floor(Date.now() / 1000) - 86400,
    author: {
      pubkey: "npub1cappadociaballoon333444555666777888999000111222333444555666",
      name: "فاطمة الزهراء",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=FatimaZ",
    },
  },
];

export default function TravelReelsPage() {
  const { locale } = useLocale();
  const [reels, setReels] = useState<TravelReelItem[]>(INITIAL_DEMO_REELS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
  const [likesCountMap, setLikesCountMap] = useState<Record<string, number>>({});
  const [copied, setCopied] = useState(false);

  // Video duration & progress state
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);

  const formatDuration = (sec: number) => {
    if (isNaN(sec) || !isFinite(sec) || sec <= 0) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const formatViews = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "k";
    return String(num || 0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const currentVideo = videoRefs.current[currentIndex];
    if (!currentVideo || !currentVideo.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = pct * currentVideo.duration;
    currentVideo.currentTime = newTime;
    setVideoCurrentTime(newTime);
    setVideoProgress(pct * 100);
  };

  // Intelligent Reels Algorithm:
  // 1) New reels published within 24 hours appear at the very top (sorted newest first)
  // 2) Followed by high engagement reels (likes * 3 + comments * 5 + views * 0.1)
  // 3) Balanced by recency
  const rankReels = (items: TravelReelItem[]) => {
    const now = Math.floor(Date.now() / 1000);
    return [...items].sort((a, b) => {
      const aAgeHours = Math.max(0, (now - (a.created_at || now)) / 3600);
      const bAgeHours = Math.max(0, (now - (b.created_at || now)) / 3600);

      // Fresh reels published today (<24h) always get highest priority
      if (aAgeHours < 24 && bAgeHours < 24) {
        return (b.created_at || 0) - (a.created_at || 0);
      }
      if (aAgeHours < 24 && bAgeHours >= 24) return -1;
      if (bAgeHours < 24 && aAgeHours >= 24) return 1;

      // High engagement ranking
      const aLikes = a.likesCount || 0;
      const bLikes = b.likesCount || 0;
      const aComments = a.commentsCount || 0;
      const bComments = b.commentsCount || 0;
      const aViews = a.viewsCount || (aLikes * 12 + 100);
      const bViews = b.viewsCount || (bLikes * 12 + 100);

      const aScore = (aLikes * 3 + aComments * 5 + aViews * 0.1) / Math.pow(aAgeHours + 2, 0.8);
      const bScore = (bLikes * 3 + bComments * 5 + bViews * 0.1) / Math.pow(bAgeHours + 2, 0.8);

      return bScore - aScore;
    });
  };

  // Description expanded floating overlay state
  const [showFullDesc, setShowFullDesc] = useState(false);

  // Comments Bottom Sheet State (Instagram / TikTok style)
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [commentsHeight, setCommentsHeight] = useState<"half" | "full">("half");
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});

  // Translation
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
  const [showTranslated, setShowTranslated] = useState<Record<string, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Pull-to-refresh & initial top-scroll state
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);

  const triggerRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/community/feed?limit=50&_t=${Date.now()}`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.posts)) {
        const userVideoPosts: TravelReelItem[] = data.posts
          .filter((p: ParsedTravelPost) => p.videos && p.videos.length > 0)
          .map((p: ParsedTravelPost) => ({
            id: p.id,
            pubkey: p.pubkey,
            title: p.content.slice(0, 60),
            description: p.content,
            videoUrl: p.videos![0],
            category: p.category || "hotels",
            destination: p.destination || "إسطنبول",
            likesCount: p.likesCount || 0,
            commentsCount: p.commentsCount || 0,
            viewsCount: p.viewsCount || ((p.likesCount || 0) * 14 + 160),
            created_at: p.created_at,
            author: {
              pubkey: p.author?.pubkey || p.pubkey,
              name: p.author?.name || p.authorName || "مسافر لوناليزا VIP",
              avatar:
                p.author?.avatar ||
                p.authorAvatar ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${p.pubkey}`,
            },
          }));

        if (userVideoPosts.length > 0) {
          setReels((prev) => {
            const existingIds = new Set(userVideoPosts.map((r) => r.id));
            const nonDuplicates = prev.filter((r) => !existingIds.has(r.id));
            return rankReels([...userVideoPosts, ...nonDuplicates]);
          });
        }
      }
    } catch {
      // ignore
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
      setCurrentIndex(0);
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    if (containerRef.current.scrollTop <= 5 && currentIndex === 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    } else {
      isPulling.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || !containerRef.current) return;
    if (containerRef.current.scrollTop <= 5 && currentIndex === 0) {
      const deltaY = e.touches[0].clientY - touchStartY.current;
      if (deltaY > 0) {
        const dist = Math.min(85, deltaY * 0.45);
        setPullDistance(dist);
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance >= 45 && !isRefreshing) {
      void triggerRefresh();
    } else {
      setPullDistance(0);
    }
    isPulling.current = false;
  };

  // Ensure scroll is strictly locked at top on initial mount
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    setCurrentIndex(0);
  }, []);

  // Load community published videos and relays (prioritizing user uploads first)
  useEffect(() => {
    fetch("/api/community/feed?limit=50")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.posts)) {
          const userVideoPosts: TravelReelItem[] = data.posts
            .filter((p: ParsedTravelPost) => p.videos && p.videos.length > 0)
            .map((p: ParsedTravelPost) => ({
              id: p.id,
              pubkey: p.pubkey,
              title: p.content.slice(0, 60),
              description: p.content,
              videoUrl: p.videos![0],
              category: p.category || "hotels",
              destination: p.destination || "إسطنبول",
              likesCount: p.likesCount || 0,
              commentsCount: p.commentsCount || 0,
              viewsCount: p.viewsCount || ((p.likesCount || 0) * 14 + 160),
              created_at: p.created_at,
              author: {
                pubkey: p.author?.pubkey || p.pubkey,
                name: p.author?.name || p.authorName || "مسافر لوناليزا VIP",
                avatar:
                  p.author?.avatar ||
                  p.authorAvatar ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${p.pubkey}`,
              },
            }));

          if (userVideoPosts.length > 0) {
            setReels((prev) => {
              const existingIds = new Set(userVideoPosts.map((r) => r.id));
              const nonDuplicates = prev.filter((r) => !existingIds.has(r.id));
              return rankReels([...userVideoPosts, ...nonDuplicates]);
            });
          }
        }
      })
      .catch(() => {});

    // Live relays (append after user videos)
    fetch("/api/community/config")
      .then((res) => res.json())
      .then(async (data) => {
        if (data.ok && data.relays?.length) {
          const liveReels = await fetchTourismReels(data.relays, 15);
          if (liveReels.length > 0) {
            setReels((prev) => {
              const existingIds = new Set(prev.map((r) => r.id));
              const fresh = liveReels.filter((r) => !existingIds.has(r.id));
              return rankReels([...prev, ...fresh]);
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  // Sync active video play/pause
  useEffect(() => {
    videoRefs.current.forEach((vid, idx) => {
      if (!vid) return;
      if (idx === currentIndex) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
        setIsPlaying(true);
      } else {
        vid.pause();
      }
    });
    // Reset collapsed description when switching reel
    setShowFullDesc(false);
  }, [currentIndex]);

  // Handle scroll snap detection
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight } = containerRef.current;
    if (clientHeight > 0) {
      const newIndex = Math.round(scrollTop / clientHeight);
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reels.length) {
        setCurrentIndex(newIndex);
      }
    }
  }, [currentIndex, reels.length]);

  const togglePlay = () => {
    const currentVideo = videoRefs.current[currentIndex];
    if (!currentVideo) return;
    if (currentVideo.paused) {
      currentVideo.play();
      setIsPlaying(true);
    } else {
      currentVideo.pause();
      setIsPlaying(false);
    }
  };

  const handleLikeReel = async (reelId: string) => {
    if (likedReels[reelId]) return;
    setLikedReels((prev) => ({ ...prev, [reelId]: true }));
    setLikesCountMap((prev) => ({
      ...prev,
      [reelId]: (prev[reelId] || reels[currentIndex]?.likesCount || 0) + 1,
    }));

    try {
      await fetch("/api/community/reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like", eventId: reelId }),
      });
    } catch {}
  };

  // Open Comments Drawer and fetch comments from persistent store
  const openCommentsDrawer = async (reelId: string) => {
    setShowCommentsModal(true);
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/community/comments?postId=${encodeURIComponent(reelId)}`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.comments)) {
        setComments(data.comments);
      } else {
        setComments([]);
      }
    } catch {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // Submit comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || submittingComment) return;

    const activeReel = reels[currentIndex];
    if (!activeReel) return;

    setSubmittingComment(true);
    try {
      const res = await fetch("/api/community/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: activeReel.id,
          text: newCommentText.trim(),
        }),
      });
      const data = await res.json();
      if (data.ok && data.comment) {
        setComments((prev) => [...prev, data.comment]);
        setNewCommentText("");
        // Update comments count on reel
        activeReel.commentsCount = (activeReel.commentsCount || 0) + 1;
      }
    } catch {
      // ignore
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    setLikedComments((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
    try {
      await fetch("/api/community/comments/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });
    } catch {}
  };

  const handleTranslate = async (reel: TravelReelItem) => {
    if (translatedTexts[reel.id]) {
      setShowTranslated((prev) => ({ ...prev, [reel.id]: !prev[reel.id] }));
      return;
    }
    try {
      const res = await fetch("/api/community/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: reel.description,
          targetLang: locale || "ar",
        }),
      });
      const data = await res.json();
      if (data.ok && data.translated) {
        setTranslatedTexts((prev) => ({ ...prev, [reel.id]: data.translated }));
        setShowTranslated((prev) => ({ ...prev, [reel.id]: true }));
      }
    } catch {}
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentReel = reels[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden flex items-center justify-center select-none" dir="rtl">
      {/* Return to Community Timeline Button: Small white icon with transparent rounded glass backdrop */}
      <Link
        href="/community"
        className="absolute top-5 right-4 sm:top-6 sm:right-6 z-40 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg active:scale-95 flex items-center justify-center"
        aria-label="العودة للسوشيال"
        title="العودة إلى التايم لاين"
      >
        <ArrowRight className="h-5 w-5 text-white" />
      </Link>

      {/* Sound Toggle (Top Left) */}
      <button
        type="button"
        onClick={() => setMuted(!muted)}
        className="absolute top-5 left-4 sm:top-6 sm:left-6 z-40 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-lg active:scale-95"
        title={muted ? "تشغيل الصوت" : "كتم الصوت"}
      >
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5 text-amber-400" />}
      </button>

      {/* Pull-to-Refresh Spring Indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="absolute top-0 inset-x-0 z-50 flex items-center justify-center transition-transform pointer-events-none"
          style={{ transform: `translateY(${isRefreshing ? 55 : pullDistance}px)` }}
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/85 backdrop-blur-md border border-white/25 text-white text-xs font-bold shadow-2xl">
            {isRefreshing ? (
              <>
                <Loader2 className="h-4 w-4 text-amber-400 animate-spin" />
                <span>جاري تحديث مقاطع الريلز الحية...</span>
              </>
            ) : pullDistance >= 45 ? (
              <>
                <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
                <span>أفلت الإصبع لتحديث الفيديوهات الحية ✨</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 text-white/80 animate-bounce" />
                <span>اسحب للأسفل للتحديث...</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Infinite Vertical Snap Scroll Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="h-[100dvh] w-full max-w-md sm:max-w-lg overflow-y-scroll snap-y snap-mandatory scrollbar-none relative overscroll-y-contain"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {reels.map((reel, idx) => {
          const isLiked = likedReels[reel.id] || false;
          const likesCount = likesCountMap[reel.id] || reel.likesCount || 0;
          const displayDesc =
            showTranslated[reel.id] && translatedTexts[reel.id]
              ? translatedTexts[reel.id]
              : reel.description;

          return (
            <div
              key={reel.id}
              className="h-[100dvh] w-full snap-start snap-always relative shrink-0 overflow-hidden flex items-center justify-center bg-black"
            >
              {/* Full-screen video element */}
              <video
                ref={(el) => {
                  videoRefs.current[idx] = el;
                }}
                src={reel.videoUrl}
                loop
                playsInline
                muted={muted}
                onClick={togglePlay}
                onTimeUpdate={(e) => {
                  if (idx === currentIndex) {
                    const vid = e.currentTarget;
                    setVideoCurrentTime(vid.currentTime);
                    setVideoDuration(vid.duration || 1);
                    setVideoProgress(((vid.currentTime || 0) / (vid.duration || 1)) * 100);
                  }
                }}
                onLoadedMetadata={(e) => {
                  if (idx === currentIndex) {
                    setVideoDuration(e.currentTarget.duration || 1);
                  }
                }}
                className="h-full w-full object-cover cursor-pointer"
              />

              {/* Tap to Pause/Play Indicator */}
              {!isPlaying && idx === currentIndex && (
                <div
                  onClick={togglePlay}
                  className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-2xs cursor-pointer"
                >
                  <div className="p-4 rounded-full bg-black/60 text-white border border-white/25 shadow-2xl">
                    <Play className="h-9 w-9 translate-x-0.5 fill-white text-white" />
                  </div>
                </div>
              )}

              {/* Right Side Vertical Floating Action Bar */}
              <div className="absolute bottom-24 left-3 sm:left-4 z-20 flex flex-col items-center gap-4">
                {/* Views Counter Button/Badge */}
                <div className="flex flex-col items-center group select-none">
                  <div className="p-3 rounded-full bg-black/45 hover:bg-black/65 text-white border border-white/20 backdrop-blur-md transition-all shadow-md">
                    <Eye className="h-5 w-5 text-amber-400" />
                  </div>
                  <span
                    data-keep-color="true"
                    style={{ color: "#ffffff" }}
                    className="text-[11px] font-bold text-white mt-1 drop-shadow-md font-mono"
                  >
                    {formatViews(reel.viewsCount || ((reel.likesCount || 10) * 14 + 180))}
                  </span>
                </div>

                {/* Like Button */}
                <button
                  type="button"
                  data-keep-color="true"
                  onClick={() => handleLikeReel(reel.id)}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div
                    className={`p-3 rounded-full backdrop-blur-md border transition-all active:scale-90 ${
                      isLiked
                        ? "bg-rose-500 text-white border-rose-400 scale-110 shadow-lg shadow-rose-500/30"
                        : "bg-black/45 hover:bg-black/65 text-white border-white/20"
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        isLiked ? "fill-white text-white" : "text-white"
                      }`}
                    />
                  </div>
                  <span
                    data-keep-color="true"
                    style={{ color: "#ffffff" }}
                    className="text-[11px] font-bold text-white mt-1 drop-shadow-md font-mono"
                  >
                    {likesCount}
                  </span>
                </button>

                {/* Comments Button (Opens Instagram Bottom Sheet) */}
                <button
                  type="button"
                  data-keep-color="true"
                  onClick={() => openCommentsDrawer(reel.id)}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-black/45 hover:bg-black/65 text-white border border-white/20 backdrop-blur-md transition-all active:scale-90 shadow-md">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <span
                    data-keep-color="true"
                    style={{ color: "#ffffff" }}
                    className="text-[11px] font-bold text-white mt-1 drop-shadow-md font-mono"
                  >
                    {reel.commentsCount || 0}
                  </span>
                </button>

                {/* Share Button */}
                <button
                  type="button"
                  data-keep-color="true"
                  onClick={handleShare}
                  className="flex flex-col items-center group cursor-pointer"
                >
                  <div className="p-3 rounded-full bg-black/45 hover:bg-black/65 text-white border border-white/20 backdrop-blur-md transition-all active:scale-90 shadow-md">
                    {copied ? (
                      <Check className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Share2 className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <span
                    data-keep-color="true"
                    style={{ color: "#ffffff" }}
                    className="text-[11px] font-bold text-white mt-1 drop-shadow-md"
                  >
                    {copied ? "تم!" : "مشاركة"}
                  </span>
                </button>
              </div>

              {/* Bottom Information Overlay (Author, Destination, and Truncated Description) */}
              <div className="absolute bottom-10 inset-x-0 z-15 p-4 sm:p-5 pb-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20 text-right">
                {/* Author row */}
                <div className="flex items-center gap-2.5 mb-2">
                  <img
                    src={reel.author.avatar}
                    alt={reel.author.name}
                    className="h-10 w-10 rounded-full border-2 border-amber-400 object-cover bg-slate-800 shadow-md"
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-white flex items-center gap-1.5 truncate">
                      <span>{reel.author.name}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold shrink-0">
                        VIP
                      </span>
                    </div>
                  </div>

                  <div className="mr-auto flex items-center gap-1 text-[11px] text-white/90 bg-black/40 px-2.5 py-1 rounded-full border border-white/15 backdrop-blur-xs shrink-0">
                    <MapPin className="h-3 w-3 text-rose-400" />
                    <span>{reel.destination}</span>
                  </div>
                </div>

                {/* Truncated Description: First line only, click to open floating full description */}
                <div
                  onClick={() => setShowFullDesc(true)}
                  className="cursor-pointer group rounded-xl p-1 -m-1 hover:bg-white/5 transition-colors"
                  title="انقر لعرض الوصف بالكامل"
                >
                  <p className="text-xs sm:text-sm text-white/90 line-clamp-1 leading-relaxed font-normal">
                    {displayDesc}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5 text-[11px] text-amber-300/90 font-bold group-hover:text-amber-200">
                    <span>... المزيد (اضغط لقراءة الوصف كاملاً)</span>
                  </div>
                </div>
              </div>

              {/* Interactive Smooth Video Seekbar & Duration Display */}
              <div
                className="absolute bottom-0 inset-x-0 z-30 px-4 pb-2 pt-2 bg-gradient-to-t from-black via-black/80 to-transparent"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  onClick={handleSeek}
                  className="w-full py-2 cursor-pointer group/bar"
                  title="انقر أو اسحب للتنقل في الفيديو"
                >
                  <div className="w-full bg-white/30 h-1.5 group-hover/bar:h-2.5 rounded-full overflow-hidden transition-all relative">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-amber-500 h-full rounded-full transition-all duration-75"
                      style={{ width: `${idx === currentIndex ? videoProgress : 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-white/90 px-0.5" dir="ltr">
                  <span>{idx === currentIndex ? `${formatDuration(videoCurrentTime)} / ${formatDuration(videoDuration)}` : "00:00 / 00:00"}</span>
                  <span className="text-[11px] text-amber-300 font-sans font-bold flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{formatViews(reel.viewsCount || ((reel.likesCount || 10) * 14 + 180))} مشاهدة</span>
                  </span>
                </div>
              </div>

              {/* Expandable Floating Transparent Description Overlay (Appears over video with transparent backdrop) */}
              {showFullDesc && idx === currentIndex && (
                <div
                  onClick={() => setShowFullDesc(false)}
                  className="absolute inset-0 z-25 bg-black/50 backdrop-blur-xs flex items-end justify-center p-4 pb-20 animate-in fade-in duration-200"
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="w-full rounded-3xl bg-black/80 backdrop-blur-xl border border-white/20 p-5 text-white shadow-2xl space-y-3 max-h-[65vh] overflow-y-auto"
                  >
                    <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                        <Sparkles className="h-4 w-4" />
                        <span>تفاصيل التقرير السياحي</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowFullDesc(false)}
                        className="p-1 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-white leading-relaxed whitespace-pre-line font-normal select-text">
                      {displayDesc}
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs">
                      <button
                        type="button"
                        onClick={() => handleTranslate(reel)}
                        className="text-[11px] text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Languages className="h-3.5 w-3.5" />
                        <span>
                          {showTranslated[reel.id] ? "عرض النص الأصلي" : "ترجمة الشرح فورياً"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowFullDesc(false)}
                        className="px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white text-[11px] font-bold transition-all cursor-pointer"
                      >
                        تصغير وإغلاق
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instagram / TikTok Style Bottom Sheet Comments Drawer */}
      {showCommentsModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          dir="rtl"
        >
          {/* Backdrop click to dismiss */}
          <div
            className="absolute inset-0"
            onClick={() => setShowCommentsModal(false)}
          />

          {/* Sliding Bottom Sheet Container */}
          <div
            className={`relative z-10 w-full max-w-md sm:max-w-lg bg-slate-950/95 backdrop-blur-2xl border-t border-white/15 rounded-t-3xl shadow-2xl flex flex-col transition-all duration-300 overflow-hidden ${
              commentsHeight === "full" ? "h-[92vh]" : "h-[55vh]"
            }`}
          >
            {/* Top Draggable Header Bar */}
            <div
              className="p-3 pb-2 border-b border-white/10 flex flex-col items-center select-none cursor-pointer"
              onClick={() =>
                setCommentsHeight((prev) => (prev === "half" ? "full" : "half"))
              }
            >
              {/* Drag Handle Bar (Instagram style) */}
              <div className="w-12 h-1.5 bg-white/30 rounded-full mb-2 hover:bg-white/50 transition-colors" />

              <div className="w-full flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-white">التعليقات</h3>
                  <span className="text-xs text-white/60 font-mono">
                    ({comments.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Expand / Minimize Toggle */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCommentsHeight((prev) =>
                        prev === "half" ? "full" : "half"
                      );
                    }}
                    className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                    title={
                      commentsHeight === "half"
                        ? "تكبير لكامل الشاشة"
                        : "تصغير لنصف الشاشة"
                    }
                  >
                    {commentsHeight === "half" ? (
                      <Maximize2 className="h-4 w-4" />
                    ) : (
                      <Minimize2 className="h-4 w-4" />
                    )}
                  </button>

                  {/* Close button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCommentsModal(false);
                    }}
                    className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
              {loadingComments && (
                <div className="flex items-center justify-center py-10 gap-2 text-xs text-amber-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>جاري تحميل التعليقات...</span>
                </div>
              )}

              {!loadingComments && comments.length === 0 && (
                <div className="text-center py-12 text-white/50 text-xs">
                  لا توجد تعليقات بعد. كن أول من يشارك رأيه حول هذا الريلز! 💬
                </div>
              )}

              {!loadingComments &&
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="flex items-start justify-between gap-3 p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-right"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <img
                        src={
                          comment.authorAvatar ||
                          `https://api.dicebear.com/7.x/bottts/svg?seed=${comment.id}`
                        }
                        alt={comment.authorName}
                        className="h-8 w-8 rounded-full border border-amber-400/50 bg-slate-800 object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs truncate">
                            {comment.authorName || "مسافر لوناليزا VIP"}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                            {comment.authorTier || "Gold VIP"}
                          </span>
                        </div>
                        <p className="text-xs text-white/90 mt-1 leading-relaxed select-text font-normal">
                          {comment.text}
                        </p>
                      </div>
                    </div>

                    {/* Like Comment Heart Button */}
                    <button
                      type="button"
                      onClick={() => handleLikeComment(comment.id)}
                      className="flex flex-col items-center gap-0.5 shrink-0 text-white/60 hover:text-rose-500 transition-colors p-1"
                    >
                      <Heart
                        className={`h-3.5 w-3.5 ${
                          likedComments[comment.id]
                            ? "fill-rose-500 text-rose-500"
                            : "text-white/50"
                        }`}
                      />
                      <span className="text-[9px] font-mono text-white/50">
                        {(comment.likesCount || 0) +
                          (likedComments[comment.id] ? 1 : 0)}
                      </span>
                    </button>
                  </div>
                ))}
            </div>

            {/* Comment Input Footer */}
            <div className="p-3 bg-slate-900 border-t border-white/10">
              <form
                onSubmit={handleSubmitComment}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="أضف تعليقك حول هذا الريلز..."
                  className="flex-1 bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400 transition-all"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim() || submittingComment}
                  className="p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold transition-all shadow-md shrink-0 cursor-pointer"
                >
                  {submittingComment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 rotate-180" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
