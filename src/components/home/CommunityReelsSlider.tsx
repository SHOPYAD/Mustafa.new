"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Play,
  Share2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  Eye,
  Heart,
  Check,
  Film,
  Maximize2,
} from "lucide-react";
import type { TravelReelItem, ParsedTravelPost } from "@/lib/nostr/types";
import { fetchReelEngagement, fetchTourismReels } from "@/lib/nostr/client";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  isMockReelSource,
  probeImageUrl,
  resolveReelPoster,
  seekAndCapturePoster,
  splitReelCopy,
} from "@/lib/community/reel-media";
import { SleekVideoOverlay } from "@/components/community/ReelVideoSurface";

const REELS_I18N = {
  ar: {
    badge: "ريلز وتجارب المسافرين الحية",
    title: "شاهد أجمل اللحظات السياحية بعدسة عملاء لوناليزا",
    subtitle: "مقاطع فيديو قصيرة وموثقة بالكامل، جولات يخوت، إقامات فندقية، ومرتفعات ساحرة يشاركها المسافرون مباشرة من الميدان.",
    exploreAll: "استكشف كل مقاطع الريلز",
    verifiedReel: "ريلز موثق",
    watchReel: "مشاهدة الريلز",
    shareReel: "مشاركة هذا الريلز",
    copied: "تم نسخ الرابط!",
    vipTraveler: "مسافر لوناليزا VIP",
    prevReels: "المقاطع السابقة",
    nextReels: "المقاطع التالية",
  },
  en: {
    badge: "Live Traveler Reels & Experiences",
    title: "Watch Unforgettable Moments Through Our Travelers' Lens",
    subtitle: "Authentic, verified short videos: private yacht cruises, luxury resorts, and stunning mountain escapes shared live by travelers.",
    exploreAll: "Explore All Reels",
    verifiedReel: "Verified Reel",
    watchReel: "Watch Reel",
    shareReel: "Share Reel",
    copied: "Link copied!",
    vipTraveler: "Lonaliza VIP Traveler",
    prevReels: "Previous Reels",
    nextReels: "Next Reels",
  },
  tr: {
    badge: "Canlı Gezgin Reels & Deneyimleri",
    title: "Lonaliza Misafirlerinin Gözünden Eşsiz Anlar",
    subtitle: "Özel yat turları, lüks otel konaklamaları ve büyüleyici yaylaların gezginlerimiz tarafından anlık paylaşılan özgün videoları.",
    exploreAll: "Tüm Videoları Keşfet",
    verifiedReel: "Doğrulanmış Video",
    watchReel: "Videoyu İzle",
    shareReel: "Videoyu Paylaş",
    copied: "Bağlantı kopyalandı!",
    vipTraveler: "Lonaliza VIP Gezgini",
    prevReels: "Önceki Videolar",
    nextReels: "Sonraki Videolar",
  },
  fr: {
    badge: "Reels & Expériences en Direct des Voyageurs",
    title: "Moments Inoubliables à Travers les Yeux de nos Voyageurs",
    subtitle: "Vidéos courtes et vérifiées : croisières privées en yacht, résidences de prestige et paysages de montagne partagés en direct.",
    exploreAll: "Explorer Tous les Reels",
    verifiedReel: "Reel Vérifié",
    watchReel: "Regarder le Reel",
    shareReel: "Partager ce Reel",
    copied: "Lien copié !",
    vipTraveler: "Voyageur VIP Lonaliza",
    prevReels: "Reels Précédents",
    nextReels: "Reels Suivants",
  },
} as const;

type SupportedLocale = keyof typeof REELS_I18N;

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}k`;
  return String(views);
}

function toLiveReel(
  p: ParsedTravelPost,
  fallbackName: string,
): TravelReelItem | null {
  const videoUrl = p.videos?.[0] || p.videoUrl;
  if (!videoUrl) return null;
  const copy = splitReelCopy(p.content || "");
  const reel: TravelReelItem = {
    id: p.id,
    pubkey: p.pubkey,
    title: copy.title,
    description: copy.description,
    videoUrl,
    posterUrl: resolveReelPoster({
      posterUrl: p.videoPoster,
      images: p.images,
      videoUrl,
    }),
    category: p.category || "tours",
    destination: p.destination || "",
    likesCount: p.likesCount || 0,
    commentsCount: p.commentsCount || 0,
    viewsCount: p.viewsCount,
    created_at: p.created_at,
    author: {
      pubkey: p.author?.pubkey || p.pubkey,
      name: p.author?.name || p.authorName || fallbackName,
      avatar:
        p.author?.avatar ||
        p.authorAvatar ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${p.pubkey}`,
    },
  };
  if (isMockReelSource(reel)) return null;
  return reel;
}

function mergeLiveReels(groups: TravelReelItem[][]): TravelReelItem[] {
  const map = new Map<string, TravelReelItem>();
  for (const group of groups) {
    for (const reel of group) {
      if (!reel?.videoUrl || isMockReelSource(reel)) continue;
      const copy = splitReelCopy(`${reel.title}\n${reel.description}`);
      map.set(reel.id, {
        ...reel,
        title: copy.title || reel.title,
        description: copy.description || reel.description,
        posterUrl: resolveReelPoster(reel),
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
}

function HomeReelCard({
  reel,
  tReels,
  copiedId,
  onShare,
  onOpenOverlay,
}: {
  reel: TravelReelItem;
  tReels: (typeof REELS_I18N)[SupportedLocale];
  copiedId: string | null;
  onShare: (e: React.MouseEvent, reel: TravelReelItem) => void;
  onOpenOverlay: (reel: TravelReelItem, poster?: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [poster, setPoster] = useState(resolveReelPoster(reel));
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const guessed = resolveReelPoster(reel);
    setPoster(undefined);
    setPlaying(false);
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
  }, [reel.id, reel.videoUrl, reel.posterUrl]);

  const playInCard = async () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      try {
        vid.muted = true;
        await vid.play();
        setPlaying(true);
      } catch {
        onOpenOverlay(reel, poster);
      }
    } else {
      vid.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="relative flex w-[240px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 group hover:border-purple-300 hover:shadow-xl sm:w-[270px]">
      <div className="relative aspect-[9/14] w-full overflow-hidden bg-[#140522]">
        {!poster ? (
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#4c2a78_0%,_#140522_58%,_#07040d_100%)]"
            aria-hidden
          />
        ) : null}
        <video
          ref={videoRef}
          src={reel.videoUrl}
          poster={poster}
          preload="metadata"
          muted
          loop
          playsInline
          onLoadedData={(e) => {
            void seekAndCapturePoster(e.currentTarget).then((frame) => {
              if (frame) setPoster(frame);
            });
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        <div className="absolute inset-x-3 top-3 z-10 flex items-center justify-between">
          <span className="flex items-center gap-1 rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>{tReels.verifiedReel}</span>
          </span>
          {reel.destination ? (
            <span className="flex items-center gap-1 rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-md">
              <MapPin className="h-3 w-3 text-rose-400" />
              <span>{reel.destination}</span>
            </span>
          ) : null}
        </div>

        {!playing ? (
          <button
            type="button"
            onClick={playInCard}
            className="absolute inset-0 z-10 flex items-center justify-center"
            aria-label={tReels.watchReel}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/30 text-white shadow-lg backdrop-blur-md transition-transform group-hover:scale-110">
              <Play className="ml-0.5 h-6 w-6 fill-white text-white" />
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={playInCard}
            className="absolute inset-0 z-10"
            aria-label={tReels.watchReel}
          />
        )}

        <div className="absolute inset-x-3 bottom-3 z-20 flex items-center justify-between text-[11px] font-bold text-white">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/50 px-2 py-0.5 backdrop-blur-xs">
              <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
              <span className="font-mono">{reel.likesCount || 0}</span>
            </span>
            <span className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/50 px-2 py-0.5 backdrop-blur-xs">
              <Eye className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-mono">{formatViews(reel.viewsCount || 0)}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenOverlay(reel, poster);
              }}
              className="rounded-lg border border-white/20 bg-black/50 p-1.5 text-white shadow-sm transition-all hover:bg-black/80 active:scale-95"
              title={tReels.watchReel}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => onShare(e, reel)}
              className="rounded-lg border border-white/20 bg-black/50 p-1.5 text-white shadow-sm transition-all hover:bg-black/80 active:scale-95"
              title={tReels.shareReel}
            >
              {copiedId === reel.id ? (
                <Check className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <Share2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between bg-white p-3.5 text-start">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <img
              src={reel.author.avatar}
              alt={reel.author.name}
              className="h-6 w-6 shrink-0 rounded-full border border-amber-400 bg-slate-100 object-cover"
            />
            <span className="truncate text-xs font-bold text-slate-800">{reel.author.name}</span>
            <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-900">
              VIP
            </span>
          </div>
          <h3 className="line-clamp-2 text-xs font-black leading-snug text-slate-900 transition-colors group-hover:text-purple-700">
            {reel.title}
          </h3>
          {reel.description && reel.description !== reel.title ? (
            <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-relaxed text-slate-600">
              {reel.description}
            </p>
          ) : null}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px]">
          <button
            type="button"
            onClick={() => onOpenOverlay(reel, poster)}
            className="flex items-center gap-1 font-extrabold text-purple-700 hover:text-purple-900"
          >
            <span>{tReels.watchReel}</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform ltr:rotate-0 rtl:rotate-180" />
          </button>
          {copiedId === reel.id ? (
            <span className="text-[10px] font-bold text-amber-600">{tReels.copied}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function CommunityReelsSlider() {
  const { locale } = useLocale();
  const activeLocale: SupportedLocale = (locale in REELS_I18N ? locale : "ar") as SupportedLocale;
  const tReels = REELS_I18N[activeLocale];
  const isRtl = activeLocale === "ar";

  const [reels, setReels] = useState<TravelReelItem[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<{ url: string; poster?: string } | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const applyLive = useCallback((incoming: TravelReelItem[]) => {
    setReels((prev) => mergeLiveReels([incoming, prev]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/community/config")
      .then((res) => res.json())
      .then(async (data) => {
        if (!data.ok || !data.relays?.length) return;
        const liveReels = await fetchTourismReels(data.relays, 12);
        if (cancelled || !liveReels.length) return;
        applyLive(liveReels);
        const engagement = await fetchReelEngagement(
          data.relays,
          liveReels.map((r) => r.id),
        );
        if (cancelled) return;
        setReels((prev) =>
          prev.map((r) => {
            const hit = engagement[r.id];
            if (!hit) return r;
            return {
              ...r,
              likesCount: hit.likesCount || r.likesCount,
              commentsCount: hit.commentsCount || r.commentsCount,
            };
          }),
        );
      })
      .catch(() => {});

    fetch("/api/community/feed?reels=1&limit=30")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !data.ok || !Array.isArray(data.posts)) return;
        const videoPosts = data.posts
          .map((p: ParsedTravelPost) => toLiveReel(p, tReels.vipTraveler))
          .filter(Boolean) as TravelReelItem[];
        if (videoPosts.length) applyLive(videoPosts);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [applyLive, tReels.vipTraveler]);

  const handleScroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const offset = direction === "left" ? -320 : 320;
    sliderRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handleShareReel = (e: React.MouseEvent, reel: TravelReelItem) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/community/reels?id=${reel.id}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedId(reel.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (!reels.length) return null;

  return (
    <section
      className="overflow-hidden border-y border-purple-100/60 bg-gradient-to-b from-white via-purple-50/25 to-white py-12"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2.5 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-100/80 px-3.5 py-1 text-xs font-black text-purple-950">
              <Film className="h-3.5 w-3.5 animate-pulse text-amber-500" />
              <span>{tReels.badge}</span>
            </div>
            <h2 className="text-xl font-black leading-snug tracking-tight text-slate-900 sm:text-3xl">
              {tReels.title}
            </h2>
            <p className="mt-1.5 max-w-2xl text-xs font-medium leading-relaxed text-slate-600 sm:text-sm">
              {tReels.subtitle}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 self-start md:self-auto">
            <Link
              href="/community/reels"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 transition-all hover:from-amber-300 hover:to-amber-400 hover:scale-102 active:scale-98 sm:text-sm"
            >
              <Play className="h-4 w-4 fill-slate-950" />
              <span>{tReels.exploreAll}</span>
            </Link>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleScroll(isRtl ? "right" : "left")}
                aria-label={tReels.prevReels}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-700 shadow-xs transition-all hover:bg-slate-50 active:scale-95"
              >
                {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => handleScroll(isRtl ? "left" : "right")}
                aria-label={tReels.nextReels}
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-700 shadow-xs transition-all hover:bg-slate-50 active:scale-95"
              >
                {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div
          ref={sliderRef}
          className="flex gap-4 overflow-x-auto overscroll-x-contain pb-4 pt-1 scrollbar-none sm:gap-5"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {reels.map((reel) => (
            <HomeReelCard
              key={reel.id}
              reel={reel}
              tReels={tReels}
              copiedId={copiedId}
              onShare={handleShareReel}
              onOpenOverlay={(item, poster) =>
                setOverlay({ url: item.videoUrl, poster: poster || item.posterUrl })
              }
            />
          ))}
        </div>
      </div>
      {overlay ? (
        <SleekVideoOverlay
          videoUrl={overlay.url}
          poster={overlay.poster}
          onClose={() => setOverlay(null)}
        />
      ) : null}
    </section>
  );
}
