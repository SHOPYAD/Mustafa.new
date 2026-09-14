"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Play, X, Volume2, VolumeX } from "lucide-react";
import { probeImageUrl, resolveReelPoster, seekAndCapturePoster } from "@/lib/community/reel-media";

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
  const [poster, setPoster] = useState<string | undefined>(undefined);
  const [posterFailed, setPosterFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const guessed = resolveReelPoster(opts);
    setPoster(undefined);
    setPosterFailed(false);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run when source identity changes
  }, [opts.videoUrl, opts.posterUrl, opts.videoPoster]);

  const harvestFromVideo = useCallback(async (video: HTMLVideoElement) => {
    if (!video || video.videoWidth < 8) return;
    const frame = await seekAndCapturePoster(video);
    if (frame) setPoster(frame);
  }, []);

  return {
    poster,
    setPoster,
    posterFailed,
    markPosterFailed: () => {
      setPosterFailed(true);
      if (poster && !poster.startsWith("data:")) setPoster(undefined);
    },
    harvestFromVideo,
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
  preload = "metadata",
  onClick,
  children,
}: ReelVideoSurfaceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { poster, markPosterFailed, harvestFromVideo } = useExtractedPoster({
    videoUrl,
    posterUrl,
    videoPoster,
    images,
    videoRef,
  });

  return (
    <div className={className || "relative h-full w-full overflow-hidden bg-zinc-950"}>
      {!poster ? (
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#3f2a62_0%,_#140522_55%,_#07040d_100%)]"
          aria-hidden
        />
      ) : null}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        preload={preload}
        onClick={onClick}
        onError={markPosterFailed}
        onLoadedData={(e) => {
          void harvestFromVideo(e.currentTarget);
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
  onClose,
}: {
  videoUrl: string;
  poster?: string;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = false;
    void vid.play().catch(() => {
      vid.muted = true;
      setMuted(true);
      void vid.play().catch(() => {});
    });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, onClose, videoUrl]);

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
          ref={videoRef}
          src={videoUrl}
          poster={poster}
          className="h-full w-full object-contain"
          playsInline
          loop
          controls={false}
          onClick={() => {
            const vid = videoRef.current;
            if (!vid) return;
            if (vid.paused) void vid.play();
            else vid.pause();
          }}
        />
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
