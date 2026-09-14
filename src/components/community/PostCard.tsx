"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  Star,
  Languages,
  Check,
  Award,
  Clock,
  Send,
  X,
  ChevronRight,
  ChevronLeft,
  CornerDownLeft,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Maximize2,
  ShieldCheck,
  Play,
  Volume2,
  VolumeX,
  Building2,
  Plane,
  Car,
  Ticket,
  Eye,
  ExternalLink,
  Copy,
  Smartphone,
} from "lucide-react";
import type { ParsedTravelPost, CommunityComment } from "@/lib/nostr/types";
import { probeImageUrl, resolveReelPoster, seekAndCapturePoster } from "@/lib/community/reel-media";
import { SleekVideoOverlay } from "@/components/community/ReelVideoSurface";

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return String(views);
}

// Dedicated Vertical Portrait Video Player for Timeline (No letterboxing, tap-to-play)
function PostVideoPlayer({
  videoUrl,
  posterUrl,
  images,
}: {
  videoUrl: string;
  posterUrl?: string;
  images?: string[];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [poster, setPoster] = useState<string | undefined>(undefined);
  const [overlayOpen, setOverlayOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const guessed = resolveReelPoster({ posterUrl, images, videoUrl });
    setPoster(undefined);
    if (!guessed) return;
    if (guessed.startsWith("data:image/")) {
      setPoster(guessed);
      return;
    }
    void probeImageUrl(guessed).then((ok) => {
      if (!cancelled && ok) setPoster(guessed);
    });
    return () => {
      cancelled = true;
    };
  }, [videoUrl, posterUrl, images?.[0]]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 1;
    setCurrentTime(cur);
    setProgress((cur / dur) * 100);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const formatTime = (timeInSec: number) => {
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const openOverlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    videoRef.current?.pause();
    setIsPlaying(false);
    setOverlayOpen(true);
  };

  return (
    <div
      className="relative w-full max-w-[420px] mx-auto aspect-[4/5] sm:aspect-[9/16] max-h-[520px] rounded-2xl overflow-hidden bg-[#140522] shadow-lg group select-none cursor-pointer"
      onClick={togglePlay}
    >
      {!poster ? (
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#4c2a78_0%,_#140522_58%,_#07040d_100%)]"
          aria-hidden
        />
      ) : null}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster}
        playsInline
        loop
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onLoadedData={(e) => {
          void seekAndCapturePoster(e.currentTarget).then((frame) => {
            if (frame) setPoster(frame);
          });
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="w-full h-full object-cover"
        preload="metadata"
      />

      {/* Center Play Indicator when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[1px] transition-all">
          <div className="h-16 w-16 rounded-full bg-white/30 hover:bg-white/45 text-white flex items-center justify-center backdrop-blur-md shadow-2xl border border-white/40 transition-transform active:scale-95">
            <Play className="h-8 w-8 fill-white ml-1 text-white" />
          </div>
        </div>
      )}

      {/* Top Left: Sound Mute/Unmute */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleMute}
          className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all shadow-md active:scale-90 cursor-pointer"
          aria-label={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
        >
          {isMuted ? <VolumeX className="h-4 w-4 text-white" /> : <Volume2 className="h-4 w-4 text-amber-400" />}
        </button>
      </div>

      {/* Top Right: Reels Badge */}
      <div className="absolute top-3 right-3 z-20">
        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 flex items-center gap-1 shadow-md">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span>ريلز فاخر</span>
        </span>
      </div>

      {/* Bottom Control Bar with Interactive Seekbar */}
      <div
        className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-20 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-full py-1.5 cursor-pointer group/bar"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            if (videoRef.current && videoRef.current.duration) {
              videoRef.current.currentTime = ratio * videoRef.current.duration;
              setCurrentTime(videoRef.current.currentTime);
              setProgress(ratio * 100);
            }
          }}
        >
          <div className="w-full bg-white/30 h-1.5 group-hover/bar:h-2.5 rounded-full overflow-hidden transition-all relative">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-white/90 font-medium px-0.5" dir="ltr">
          <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
          <button
            type="button"
            onClick={openOverlay}
            className="p-1 hover:text-amber-400 text-white transition-colors cursor-pointer"
            title="ملء الشاشة"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {overlayOpen ? (
        <SleekVideoOverlay
          videoUrl={videoUrl}
          poster={poster}
          onClose={() => setOverlayOpen(false)}
        />
      ) : null}
    </div>
  );
}

interface PostCardProps {
  post: ParsedTravelPost;
  currentLocale?: string;
  onLike?: (postId: string) => Promise<void>;
  onComment?: (postId: string, commentText: string) => Promise<void>;
}

export function PostCard({ post, currentLocale = "ar", onLike, onComment }: PostCardProps) {
  const [likes, setLikes] = useState(post.likesCount || 0);
  const [hasLiked, setHasLiked] = useState(post.userHasLiked ?? post.hasLiked ?? false);
  const [likeLottie, setLikeLottie] = useState(false);

  // Text truncation state
  const [isContentExpanded, setIsContentExpanded] = useState(false);

  // Translation state
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);

  // Comments state
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommunityComment[]>(post.comments || []);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<CommunityComment | null>(null);
  const [copied, setCopied] = useState(false);

  // Lightbox Modal state for full-screen interactive image slide
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const images = post.images || [];

  // Load comments from persistent server store
  const loadComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/community/comments?postId=${encodeURIComponent(post.id)}`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.comments)) {
        setComments(data.comments);
      }
    } catch {
      // ignore
    } finally {
      setLoadingComments(false);
    }
  }, [post.id]);

  useEffect(() => {
    if (showComments && comments.length === 0) {
      loadComments();
    }
  }, [showComments, loadComments, comments.length]);

  // Handle post like
  const handleLike = async () => {
    if (hasLiked) return;
    setHasLiked(true);
    setLikes((prev) => prev + 1);
    setLikeLottie(true);
    setTimeout(() => setLikeLottie(false), 800);

    if (onLike) {
      await onLike(post.id);
    } else {
      try {
        await fetch("/api/community/reward", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "like", eventId: post.id }),
        });
      } catch {}
    }
  };

  // Handle comment like
  const handleCommentLike = async (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const isLiked = !c.userHasLiked;
          return {
            ...c,
            userHasLiked: isLiked,
            likesCount: isLiked ? (c.likesCount || 0) + 1 : Math.max(0, (c.likesCount || 0) - 1),
          };
        }
        return c;
      })
    );

    try {
      await fetch("/api/community/comments/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, commentId }),
      });
    } catch {}
  };

  // Handle send comment or reply
  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInput.trim();
    if (!text || submittingComment) return;

    setSubmittingComment(true);
    try {
      const res = await fetch("/api/community/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post.id,
          text,
          parentId: replyingTo?.id,
          replyToName: replyingTo?.authorName,
        }),
      });

      const data = await res.json();
      if (data.ok && data.comment) {
        setComments((prev) => [...prev, data.comment]);
        setCommentInput("");
        setReplyingTo(null);
      }
    } catch {
      // fallback
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle translate
  const handleTranslate = async () => {
    if (translatedText) {
      setShowTranslated(!showTranslated);
      return;
    }
    setTranslating(true);
    try {
      const res = await fetch("/api/community/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: post.content,
          targetLang: currentLocale || "ar",
        }),
      });
      const data = await res.json();
      if (data.ok && data.translated) {
        setTranslatedText(data.translated);
        setShowTranslated(true);
      }
    } catch {
      // ignore
    } finally {
      setTranslating(false);
    }
  };

  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/community#post-${post.id}`;
    }
    return `https://lonaliza.com/community#post-${post.id}`;
  };

  const getShareText = () => {
    return `منشور وتجربة سياحية من ${post.authorName || "مسافر لوناليزا"} عبر مجتمع لوناليزا:\n${post.content.slice(0, 140)}...`;
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: post.authorName ? `منشور ${post.authorName} | مجتمع لوناليزا` : "مجتمع لوناليزا للسياحة",
          text: getShareText(),
          url: getShareUrl(),
        });
        setShowShareModal(false);
      } catch {
        // user cancelled
      }
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(getShareUrl());
      setCopiedLink(true);
      setCopied(true);
      setTimeout(() => {
        setCopiedLink(false);
        setCopied(false);
      }, 2000);
    }
  };

  const handleCopyText = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${post.content}\n\n${getShareUrl()}`);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(getShareText() + "\n" + getShareUrl())}`;
    window.open(url, "_blank");
    setShowShareModal(false);
  };

  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(getShareText())}`;
    window.open(url, "_blank");
    setShowShareModal(false);
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}&url=${encodeURIComponent(getShareUrl())}`;
    window.open(url, "_blank");
    setShowShareModal(false);
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`;
    window.open(url, "_blank");
    setShowShareModal(false);
  };

  // Lightbox keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft" && images.length > 0) {
        setLightboxIndex((prev) => (prev! < images.length - 1 ? prev! + 1 : 0));
      }
      if (e.key === "ArrowRight" && images.length > 0) {
        setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : images.length - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, images.length]);

  const formatDate = (sec: number) => {
    if (!sec) return "";
    const date = new Date(sec * 1000);
    return date.toLocaleDateString(currentLocale === "ar" ? "ar-EG" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalCommentsCount = Math.max(post.commentsCount || 0, comments.length);
  const isRtl = (currentLocale || "ar") === "ar";

  return (
    <>
      <article className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 sm:p-6 shadow-sm hover:shadow-md transition-all select-text" dir={isRtl ? "rtl" : "ltr"}>
        {/* Author Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-4">
          <div className="flex items-center gap-3">
            {(() => {
              const postAny = post as any;
              const isAdmin = Boolean(
                post.authorIsAdmin ||
                postAny.authorRole === "admin" ||
                post.authorName?.includes("المشرف العام") ||
                post.authorName?.includes("إدارة لوناليزا") ||
                post.authorName?.includes("إدارة المنصة") ||
                postAny.authorId === "admin"
              );
              const authorId = postAny.authorId || post.author?.pubkey || post.authorName || post.author?.name || "traveler";
              const authorProfileUrl = `/community/user/${encodeURIComponent(authorId)}`;

              return (
                <>
                  <div className="relative shrink-0">
                    <Link
                      href={authorProfileUrl}
                      className="block relative h-11 w-11 sm:h-12 sm:w-12 rounded-full overflow-hidden border-2 border-amber-400 bg-slate-100 dark:bg-slate-800 shadow-xs hover:scale-105 transition-transform"
                    >
                      {post.author?.avatar || post.authorAvatar ? (
                        <img
                          src={post.author?.avatar || post.authorAvatar}
                          alt={post.author?.name || post.authorName || "Traveler"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center font-bold text-amber-600 dark:text-amber-400">
                          {isAdmin ? "👑" : "VIP"}
                        </div>
                      )}
                    </Link>
                    {isAdmin && (
                      <span
                        className="absolute -top-1.5 -start-1.5 size-5 bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-white rounded-full flex items-center justify-center text-[10px] shadow-md border border-white dark:border-slate-900 ring-1 ring-amber-400"
                        title="إدارة المنصة العامة"
                      >
                        👑
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <Link
                        href={authorProfileUrl}
                        className="font-bold text-slate-900 dark:text-white text-sm sm:text-base hover:text-amber-600 dark:hover:text-amber-400 transition-colors truncate max-w-[190px] sm:max-w-none"
                      >
                        {post.author?.name || post.authorName || "مسافر لوناليزا VIP"}
                      </Link>

                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black shadow-xs shrink-0 border border-amber-300">
                          <span>👑</span>
                          <span>إدارة المنصة العامة (Official Admin)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800/40 shrink-0">
                          <Award className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                          <span>{post.author?.tier || "Gold VIP Traveler"}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 font-medium text-[11px]">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {formatDate(post.created_at)}
                      </span>
                      <span>•</span>
                      <span className="text-slate-400 text-[11px]">تجربة موثقة</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Category & Destination Badges */}
          <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
            {(post.categoryName || post.category) && (
              <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px] sm:text-xs font-semibold border border-amber-200/80 dark:border-amber-800/40">
                {post.categoryName || post.category}
              </span>
            )}
            {(post.destination || post.city || post.location) && (
              <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs font-semibold border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-rose-500" />
                <span>{post.destination || post.city || post.location}</span>
              </span>
            )}
          </div>
        </div>

        {/* Star rating if present */}
        {post.rating ? (
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= (post.rating || 0)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-200 dark:text-slate-700"
                }`}
              />
            ))}
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 mr-1.5">
              ({post.rating} / 5)
            </span>
          </div>
        ) : null}

        {/* Verified Booking Card (If post is linked to a verified trip booking) */}
        {post.booking && (
          <div className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50/95 via-teal-50/70 to-amber-50/50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/30 border border-emerald-200/90 dark:border-emerald-800/60 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-emerald-100/90 dark:border-emerald-900/50">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>حجز مؤكد وموثق من لوناليزا • Verified Booking</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                حجز موثق
              </span>
            </div>

            <div className="flex items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-xs shrink-0">
                  {post.booking.type === "hotel" ? (
                    <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  ) : post.booking.type === "flight" ? (
                    <Plane className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  ) : post.booking.type === "car" ? (
                    <Car className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Ticket className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {post.booking.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {post.booking.destination && (
                      <span className="flex items-center gap-0.5 text-slate-700 dark:text-slate-300 font-medium">
                        <MapPin className="h-3 w-3 text-rose-500" />
                        {post.booking.destination}
                      </span>
                    )}
                    {post.booking.typeLabel && (
                      <span>• {post.booking.typeLabel}</span>
                    )}
                    {post.booking.date && (
                      <span>• {post.booking.date}</span>
                    )}
                  </div>
                </div>
              </div>

              {post.booking.price ? (
                <div className="text-left shrink-0">
                  <div className="text-xs font-black text-emerald-800 dark:text-emerald-400 font-mono">
                    {post.booking.price} {post.booking.currency || "USD"}
                  </div>
                  <span className="text-[9px] text-slate-400 block font-medium">حجز حقيقي مسجل</span>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Shared Service Card (If post is shared from a service card like flight, hotel, package, car) */}
        {post.sharedService && !post.booking && (
          <div className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900/5 to-amber-500/10 dark:from-amber-950/30 dark:via-slate-900 dark:to-amber-950/20 border border-amber-200 dark:border-amber-800/60 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-amber-100 dark:border-amber-900/50">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>خدمة مميزة من منصة لوناليزا • Service Showcase</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800/60 shrink-0">
                {post.sharedService.typeLabel || (
                  post.sharedService.type === "flight"
                    ? "طيران فاخر"
                    : post.sharedService.type === "hotel"
                    ? "فندق 5 نجوم"
                    : post.sharedService.type === "car"
                    ? "سيارة خاصة"
                    : "برنامج سياحي"
                )}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {post.sharedService.imageUrl ? (
                  <img
                    src={post.sharedService.imageUrl}
                    alt={post.sharedService.title}
                    className="h-12 w-12 rounded-xl object-cover border border-amber-200 dark:border-amber-800/60 shrink-0 shadow-xs"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-800 dark:text-amber-300 shrink-0 shadow-xs">
                    {post.sharedService.type === "hotel" ? (
                      <Building2 className="h-6 w-6 text-amber-700 dark:text-amber-400" />
                    ) : post.sharedService.type === "flight" ? (
                      <Plane className="h-6 w-6 text-amber-700 dark:text-amber-400" />
                    ) : post.sharedService.type === "car" ? (
                      <Car className="h-6 w-6 text-amber-700 dark:text-amber-400" />
                    ) : (
                      <Ticket className="h-6 w-6 text-amber-700 dark:text-amber-400" />
                    )}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                    {post.sharedService.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {post.sharedService.destination && (
                      <span className="flex items-center gap-0.5 text-slate-700 dark:text-slate-300 font-medium">
                        <MapPin className="h-3 w-3 text-rose-500" />
                        {post.sharedService.destination}
                      </span>
                    )}
                    {post.sharedService.price ? (
                      <span className="font-bold text-amber-800 dark:text-amber-400 font-mono">
                        ${post.sharedService.price} {post.sharedService.currency || "USD"}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {post.sharedService.url && (
                <a
                  href={post.sharedService.url}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <span>عرض وحجز</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Post Text Content with Clean Truncation Toggle */}
        <div className="space-y-2 mb-4">
          {(() => {
            const rawContent = (showTranslated && translatedText ? translatedText : post.content || "").replace(/\uFFFD/g, "").trim();
            const isLongText = (rawContent || "").length > 170;
            const displayedContent = isLongText && !isContentExpanded
              ? rawContent.slice(0, 165) + "..."
              : rawContent;

            return (
              <>
                <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-normal">
                  {displayedContent}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  {/* Read More / Read Less Toggle */}
                  {isLongText ? (
                    <button
                      type="button"
                      onClick={() => setIsContentExpanded(!isContentExpanded)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 bg-amber-50/80 hover:bg-amber-100/80 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 px-2.5 py-1 rounded-lg border border-amber-200/60 dark:border-amber-800/50 transition-all cursor-pointer"
                    >
                      {isContentExpanded ? (
                        <>
                          <span>عرض أقل</span>
                          <ChevronUp className="h-3.5 w-3.5" />
                        </>
                      ) : (
                        <>
                          <span>قراءة المزيد وتفاصيل التجربة</span>
                          <ChevronDown className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  ) : <div />}

                  {/* Translation Button */}
                  <button
                    type="button"
                    onClick={handleTranslate}
                    disabled={translating}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-medium bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                  >
                    <Languages className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span>
                      {translating
                        ? "جاري الترجمة..."
                        : showTranslated
                        ? "عرض النص الأصلي"
                        : "ترجمة فورية"}
                    </span>
                  </button>
                </div>
              </>
            );
          })()}
        </div>

        {/* Media Gallery (Interactive Images / Videos) */}
        {((images.length > 0) || (post.videos && post.videos.length > 0)) && (
          <div className="mb-4">
            {/* If video: render dedicated portrait player without side letterboxing */}
            {post.videos && post.videos.length > 0 ? (
              <PostVideoPlayer
                videoUrl={post.videos[0]}
                posterUrl={post.videoPoster}
                images={post.images}
              />
            ) : images.length === 1 ? (
              /* 1 Image: Full Preview + Click to zoom */
              <div className="rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60">
                <div
                  onClick={() => setLightboxIndex(0)}
                  className="relative aspect-video max-h-96 w-full bg-slate-100 dark:bg-slate-800/60 cursor-pointer group overflow-hidden"
                >
                  <img
                    src={images[0]}
                    alt="Travel experience"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="p-2.5 rounded-full bg-black/60 text-white backdrop-blur-xs flex items-center gap-1.5 text-xs font-semibold">
                      <Maximize2 className="h-4 w-4" />
                      <span>تكبير وعرض السلايدر</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : images.length > 1 ? (
              /* Multiple Images: Interactive Grid with Click to Open Lightbox */
              <div className="rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60">
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60">
                  {images.slice(0, 4).map((img, i) => {
                    const isLastWithMore = i === 3 && images.length > 4;
                    const moreCount = images.length - 4;
                    return (
                      <div
                        key={i}
                        onClick={() => setLightboxIndex(i)}
                        className="relative aspect-square overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800 cursor-pointer group"
                      >
                        <img
                          src={img}
                          alt={`Photo ${i + 1}`}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        {isLastWithMore ? (
                          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white text-lg font-black backdrop-blur-xs">
                            +{moreCount} صور إضافية
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="p-2 rounded-full bg-black/60 text-white">
                              <Maximize2 className="h-4 w-4" />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Engagement Points Status Bar (Transparent Community Gamification) */}
        {(post.eligiblePoints || post.booking || post.sharedService) && (
          <div className="mb-2.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-[11px] flex flex-wrap items-center justify-between gap-2 select-none">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span>
                {post.pointsAwarded ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                    تم تحقيق شروط التفاعل واعتماد نقاط المكافأة (+{post.eligiblePoints || (post.booking ? 300 : post.sharedService ? 200 : 150)} نقطة) في المحفظة ✨
                  </span>
                ) : (
                  <span>
                    شرط تفعيل مكافأة النشر (+{post.eligiblePoints || (post.booking ? 300 : post.sharedService ? 200 : 150)} نقطة):
                  </span>
                )}
              </span>
            </div>
            {!post.pointsAwarded && (
              <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                <span className={likes >= 50 ? "text-emerald-600 font-bold" : "text-slate-600 dark:text-slate-400"}>
                  {likes}/50 إعجاب
                </span>
                <span>•</span>
                <span className={totalCommentsCount >= 10 ? "text-emerald-600 font-bold" : "text-slate-600 dark:text-slate-400"}>
                  {totalCommentsCount}/10 تعليق
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Footer: Modern, Tactile Clean Icons without Boxes/Containers */}
        <div className="flex items-center justify-between border-t border-slate-100/90 dark:border-slate-800 pt-3 text-xs font-semibold px-1 select-none">
          <div className="flex items-center gap-5 sm:gap-6">
            {/* Like Button */}
            <button
              type="button"
              onClick={handleLike}
              className="flex items-center gap-1.5 py-1 px-1.5 rounded-lg hover:bg-rose-50/80 dark:hover:bg-rose-950/30 active:scale-90 transition-all cursor-pointer group"
              title="إعجاب"
            >
              <Heart
                className={`h-5 w-5 transition-transform shrink-0 ${
                  likeLottie
                    ? "scale-125 fill-rose-500 text-rose-500"
                    : hasLiked
                    ? "fill-rose-500 text-rose-500"
                    : "text-slate-500 group-hover:text-rose-500 dark:text-slate-400 dark:group-hover:text-rose-400"
                }`}
              />
              <span
                className={`text-xs font-bold font-mono transition-colors ${
                  hasLiked ? "text-rose-600 dark:text-rose-400 font-black" : "text-slate-600 group-hover:text-rose-600 dark:text-slate-400 dark:group-hover:text-rose-400"
                }`}
              >
                {likes}
              </span>
            </button>

            {/* Comment Toggle Button */}
            <button
              type="button"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 py-1 px-1.5 rounded-lg hover:bg-blue-50/80 dark:hover:bg-blue-950/30 active:scale-90 transition-all cursor-pointer group"
              title="التعليقات"
            >
              <MessageCircle
                className={`h-5 w-5 transition-colors shrink-0 ${
                  showComments ? "text-blue-600 dark:text-blue-400 fill-blue-50 dark:fill-blue-950/40" : "text-slate-500 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400"
                }`}
              />
              <span
                className={`text-xs font-bold font-mono transition-colors ${
                  showComments ? "text-blue-600 dark:text-blue-400 font-black" : "text-slate-600 group-hover:text-blue-600 dark:text-slate-400 dark:group-hover:text-blue-400"
                }`}
              >
                {totalCommentsCount}
              </span>
            </button>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 py-1 px-1.5 rounded-lg hover:bg-emerald-50/80 dark:hover:bg-emerald-950/30 active:scale-90 transition-all cursor-pointer group"
              title="مشاركة المنشور"
            >
              {copied ? (
                <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Share2 className="h-5 w-5 text-slate-500 group-hover:text-emerald-600 dark:text-slate-400 dark:group-hover:text-emerald-400 shrink-0 transition-colors" />
              )}
              <span className="text-xs font-bold font-mono text-slate-600 group-hover:text-emerald-600 dark:text-slate-400 dark:group-hover:text-emerald-400 transition-colors">
                {copied ? "تم!" : (post.sharesCount || 0)}
              </span>
            </button>
          </div>

          {/* Views Counter (Icon + Number Only, No Text) */}
          <div
            className="flex items-center gap-1 py-1 px-1.5 text-slate-400 select-none shrink-0"
            title="عدد المشاهدات"
          >
            <Eye className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
              {formatViews(post.viewsCount || 380 + (likes * 14) + (totalCommentsCount * 22))}
            </span>
          </div>
        </div>

        {/* Persistent Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-800 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold px-1">
              <span>التعليقات والمناقشات ({comments.length})</span>
              {loadingComments && <span className="text-amber-600 dark:text-amber-400 font-medium">جاري التحميل...</span>}
            </div>

            {/* Comments List with Ultra-Smooth Scrolling */}
            <div className="max-h-80 overflow-y-auto scroll-smooth space-y-3 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
              {comments.map((cmt) => (
                <div key={cmt.id} className="pt-3 first:pt-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    {(() => {
                      const isCmtAdmin = Boolean(
                        cmt.authorName?.includes("إدارة") ||
                        cmt.authorName?.includes("المشرف العام") ||
                        cmt.authorTier?.includes("إدارة")
                      );
                      const cmtAny = cmt as any;
                      const cmtProfileUrl = `/community/user/${encodeURIComponent(cmtAny.authorPubkey || cmt.authorName)}`;

                      return (
                        <div className="flex items-center gap-2">
                          <Link href={cmtProfileUrl} className="relative block shrink-0 hover:scale-105 transition-transform">
                            <img
                              src={cmt.authorAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${cmt.authorName}`}
                              alt={cmt.authorName}
                              className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 object-cover"
                            />
                            {isCmtAdmin && (
                              <span className="absolute -top-1 -start-1 size-3.5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[8px] shadow-xs">
                                👑
                              </span>
                            )}
                          </Link>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Link href={cmtProfileUrl} className="font-bold text-slate-900 dark:text-white text-xs hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                                {cmt.authorName}
                              </Link>
                              {isCmtAdmin ? (
                                <span className="text-[10px] text-amber-950 font-black bg-gradient-to-r from-amber-400 to-yellow-400 px-1.5 py-0.2 rounded shadow-2xs">
                                  👑 إدارة المنصة
                                </span>
                              ) : cmt.authorTier ? (
                                <span className="text-[10px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800/40 font-medium">
                                  {cmt.authorTier}
                                </span>
                              ) : null}
                            </div>
                            <span className="text-[10px] text-slate-400">{formatDate(cmt.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Like Comment Button */}
                    <button
                      type="button"
                      onClick={() => handleCommentLike(cmt.id)}
                      className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg transition-all cursor-pointer ${
                        cmt.userHasLiked
                          ? "text-rose-600 bg-rose-50 dark:bg-rose-950/30 font-bold"
                          : "text-slate-400 hover:text-rose-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <Heart className={`h-3 w-3 ${cmt.userHasLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                      <span>{cmt.likesCount || 0}</span>
                    </button>
                  </div>

                  {/* Reply badge if replying to someone */}
                  {cmt.replyToName && (
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md inline-flex items-center gap-1 font-medium mr-9">
                      <CornerDownLeft className="h-2.5 w-2.5" />
                      <span>رداً على: {cmt.replyToName}</span>
                    </div>
                  )}

                  {/* Comment Text */}
                  <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed mr-9 bg-slate-50/70 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                    {cmt.text}
                  </div>

                  {/* Reply Action Trigger */}
                  <div className="mr-9 flex items-center gap-3 text-[11px] text-slate-400">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingTo(cmt);
                        setCommentInput(`@${cmt.authorName} `);
                      }}
                      className="hover:text-blue-600 dark:hover:text-blue-400 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <CornerDownLeft className="h-3 w-3" />
                      <span>رد</span>
                    </button>
                  </div>
                </div>
              ))}

              {comments.length === 0 && !loadingComments && (
                <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  لا توجد تعليقات بعد. كن أول من يشارك رأيه أو يستفسر عن هذه التجربة! ✨
                </div>
              )}
            </div>

            {/* Replying Banner */}
            {replyingTo && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-xs text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                <span className="flex items-center gap-1">
                  <CornerDownLeft className="h-3.5 w-3.5" />
                  <span>الرد على: <strong>{replyingTo.authorName}</strong></span>
                </span>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Comment Input Form — circular send nested inside the field */}
            <form onSubmit={handleSendComment} className="relative">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder={replyingTo ? `اكتب ردك على ${replyingTo.authorName}...` : "اكتب تعليقك أو استفسارك عن التجربة..."}
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pe-12 ps-4 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentInput.trim()}
                aria-label={replyingTo ? "رد" : "إرسال"}
                className="absolute end-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm transition-all hover:bg-amber-600 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
      </article>

      {/* Interactive Lightbox Modal for Photo Slideshow */}
      {lightboxIndex !== null && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md select-none p-2 sm:p-4"
          dir="ltr"
        >
          {/* Close Button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Slide Counter */}
          <div className="absolute top-4 left-4 z-50 px-4 py-1.5 rounded-full bg-black/60 text-white border border-white/20 text-xs font-mono font-bold">
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Previous Image Button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : images.length - 1));
              }}
              className="absolute left-2 sm:left-6 z-40 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all cursor-pointer"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Next Image Button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) => (prev! < images.length - 1 ? prev! + 1 : 0));
              }}
              className="absolute right-2 sm:right-6 z-40 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm transition-all cursor-pointer"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Image Display */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center p-2"
          >
            <img
              src={images[lightboxIndex]}
              alt={`Slide ${lightboxIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
            />
          </div>

          {/* Bottom Thumbnails Strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 inset-x-0 z-40 flex items-center justify-center gap-2 overflow-x-auto px-4 py-2">
              {images.map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => setLightboxIndex(idx)}
                  className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                    idx === lightboxIndex
                      ? "border-amber-400 scale-110 shadow-lg shadow-amber-400/30"
                      : "border-white/30 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={thumb} alt="thumbnail" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Interactive Social Sharing Sheet / Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowShareModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4 text-right animate-in zoom-in-95 duration-200"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Share2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">مشاركة التجربة السياحية</h3>
                  <p className="text-[11px] text-slate-400">شارك هذا المنشور مع الأصدقاء والعائلة</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Post Preview Snippet */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
              <span className="font-bold text-slate-800 dark:text-white">{post.authorName}: </span>
              {post.content}
            </div>

            {/* Share Actions Grid */}
            <div className="space-y-2 pt-1">
              {/* Native Mobile Share Sheet */}
              {typeof navigator !== "undefined" && typeof (navigator as any).share === "function" && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-98"
                >
                  <span className="flex items-center gap-2.5">
                    <Smartphone className="h-4 w-4" />
                    <span>مشاركة عبر تطبيقات الهاتف (تطبيقات أخرى)</span>
                  </span>
                  <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                </button>
              )}

              {/* Direct WhatsApp Share */}
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] border border-[#25D366]/30 font-bold text-xs transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base">💬</span>
                  <span>إرسال مباشر عبر واتساب (WhatsApp)</span>
                </span>
                <span className="text-[11px] font-mono text-[#128C7E] dark:text-[#25D366]">مباشر ↗</span>
              </button>

              {/* Direct Telegram Share */}
              <button
                type="button"
                onClick={handleShareTelegram}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 text-[#0088cc] border border-[#0088cc]/30 font-bold text-xs transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Send className="h-4 w-4" />
                  <span>مشاركة عبر تليجرام (Telegram)</span>
                </span>
                <span className="text-[11px] font-mono text-[#0088cc]">مباشر ↗</span>
              </button>

              {/* Direct Twitter / X Share */}
              <button
                type="button"
                onClick={handleShareTwitter}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-300/60 dark:border-white/15 font-bold text-xs transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-sm font-black">𝕏</span>
                  <span>مشاركة عبر منصة إكس (Twitter / X)</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">تغريد ↗</span>
              </button>

              {/* Direct Facebook Share */}
              <button
                type="button"
                onClick={handleShareFacebook}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] border border-[#1877F2]/30 font-bold text-xs transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-base">📘</span>
                  <span>مشاركة عبر فيسبوك (Facebook)</span>
                </span>
                <span className="text-[11px] font-mono text-[#1877F2]">نشر ↗</span>
              </button>

              {/* Copy Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedLink ? "تم نسخ الرابط بنجاح!" : "نسخ رابط المنشور"}</span>
                </span>
                {copiedLink && <span className="text-[11px] text-emerald-600 font-bold">جاهز للمشاركة</span>}
              </button>

              {/* Copy Full Content */}
              <button
                type="button"
                onClick={handleCopyText}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  {copiedText ? <Check className="h-4 w-4 text-emerald-600" /> : <Sparkles className="h-4 w-4 text-amber-500" />}
                  <span>{copiedText ? "تم نسخ النص كاملاً!" : "نسخ نص التجربة كاملاً"}</span>
                </span>
                {copiedText && <span className="text-[11px] text-emerald-600 font-bold">جاهز للصق</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
