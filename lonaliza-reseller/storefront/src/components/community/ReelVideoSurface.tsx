"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Play, X, Volume2, VolumeX } from "lucide-react";
import {
  applyInlineReelAttrs,
  playMutedInline,
  proxiedReelVideo,
  resolveReelPoster,
} from "@/lib/community/reel-media";
import { persistReelView, shouldCountReelWatch } from "@/lib/community/reel-view-client";

type ReelVideoSurfaceProps = {
  videoUrl: string;
  posterUrl?: string;
  videoPoster?: string;
  images?: string[];
  className?: string;
  videoClassName?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  preload?: "none" | "metadata" | "auto";
  onClick?: () => void;
  children?: React.ReactNode;
};

export function useExtractedPoster(opts: {
  videoUrl: string;
  posterUrl?: string;
  videoPoster?: string;
  images?: string[];
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}) {
  const [poster, setPoster] = useState<string | undefined>(() => resolveReelPoster(opts));

  useEffect(() => {
    setPoster(resolveReelPoster(opts));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run when source identity changes
  }, [opts.videoUrl, opts.posterUrl, opts.videoPoster]);

  return {
    poster,
    setPoster,
    posterFailed: false,
    markPosterFailed: () => {
      const fallback = opts.videoUrl ? resolveReelPoster({ videoUrl: opts.videoUrl }) : undefined;
      setPoster(fallback);
    },
    harvestFromVideo: async () => undefined,
  };
}

export function ReelVideoSurface({
  videoUrl,
  posterUrl,
  videoPoster,
  images,
  className,
  videoClassName,
  autoPlay = false,
  loop = true,
  muted = true,
  playsInline = true,
  preload = "auto",
  onClick,
  children,
}: ReelVideoSurfaceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { poster, markPosterFailed } = useExtractedPoster({
    videoUrl,
    posterUrl,
    videoPoster,
    images,
    videoRef,
  });
  const playbackSrc = videoUrl;
  const fallbackSrc = proxiedReelVideo(videoUrl);

  const bind = useCallback(
    (el: HTMLVideoElement | null) => {
      videoRef.current = el;
      if (!el) return;
      applyInlineReelAttrs(el);
      el.muted = muted;
      el.defaultMuted = muted;
    },
    [muted],
  );

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !autoPlay) return;
    void playMutedInline(vid, fallbackSrc);
  }, [autoPlay, fallbackSrc, videoUrl]);

  return (
    <div className={className || "relative h-full w-full overflow-hidden bg-zinc-950"}>
      <video
        ref={bind}
        src={playbackSrc}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        preload={preload}
        onClick={onClick}
        onError={() => {
          markPosterFailed();
          const vid = videoRef.current;
          if (vid && fallbackSrc && vid.src !== fallbackSrc && !vid.src.includes("reel-media")) {
            vid.src = fallbackSrc;
            vid.load();
            applyInlineReelAttrs(vid);
          }
        }}
        className={videoClassName || "h-full w-full object-cover"}
      />
      {children}
    </div>
  );
}

export function SleekVideoOverlay({
  videoUrl,
  poster,
  reelId,
  onClose,
  onViewCounted,
}: {
  videoUrl: string;
  poster?: string;
  reelId?: string;
  onClose: () => void;
  onViewCounted?: (reelId: string, viewsCount: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(true);
  const [mounted, setMounted] = useState(false);
  const viewSent = useRef(false);
  const fallbackSrc = proxiedReelVideo(videoUrl);

  const bind = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (!el) return;
    applyInlineReelAttrs(el);
  }, []);

  const startPlayback = useCallback(async () => {
    const vid = videoRef.current;
    if (!vid) return;
    const ok = await playMutedInline(vid, fallbackSrc);
    setMuted(true);
    setPaused(!ok || vid.paused);
  }, [fallbackSrc]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    viewSent.current = false;
  }, [reelId, videoUrl]);

  useLayoutEffect(() => {
    if (!mounted) return;
    void startPlayback();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, onClose, startPlayback, videoUrl]);

  if (!mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/92 backdrop-blur-md"
      onClick={onClose}
      dir="rtl"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 end-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white"
        aria-label="إغلاق"
      >
        <X className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          const vid = videoRef.current;
          if (!vid) return;
          vid.muted = !vid.muted;
          setMuted(vid.muted);
        }}
        className="absolute top-4 start-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white"
        aria-label={muted ? "تشغيل الصوت" : "كتم الصوت"}
      >
        {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5 text-amber-300" />}
      </button>
      <div
        className="relative h-[100dvh] w-full max-w-md overflow-hidden bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          ref={bind}
          src={videoUrl}
          poster={poster}
          className="h-full w-full object-contain"
          playsInline
          loop
          muted
          controls
          preload="auto"
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          onTimeUpdate={(e) => {
            if (!reelId || viewSent.current || !shouldCountReelWatch(e.currentTarget.currentTime)) return;
            viewSent.current = true;
            onViewCounted?.(reelId, 1);
            void persistReelView(reelId, Math.round(e.currentTarget.currentTime * 1000)).then((res) => {
              if (res && typeof res.viewsCount === "number") {
                onViewCounted?.(reelId, res.viewsCount);
              }
            });
          }}
          onError={() => {
            const vid = videoRef.current;
            if (vid && fallbackSrc && !vid.src.includes("reel-media")) {
              vid.src = fallbackSrc;
              vid.load();
              applyInlineReelAttrs(vid);
              void playMutedInline(vid);
            }
          }}
          onClick={() => {
            const vid = videoRef.current;
            if (!vid) return;
            if (vid.paused) void playMutedInline(vid, fallbackSrc);
            else vid.pause();
          }}
        />
        {paused ? (
          <button
            type="button"
            onClick={() => void startPlayback()}
            className="absolute inset-0 z-10 flex items-center justify-center"
            aria-label="تشغيل"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-black/55 text-white shadow-lg">
              <Play className="ml-0.5 h-8 w-8 fill-white text-white" />
            </div>
          </button>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

export function InCardPlayBadge({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/45 bg-black/45 text-white shadow-lg backdrop-blur-md">
        <Play className="ml-0.5 h-7 w-7 fill-white text-white" />
      </div>
    </div>
  );
}
