"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

// Pre-computed normalized height profile mimicking realistic voice waveforms
const BAR_PATTERN = [
  30, 45, 75, 60, 90, 40, 55, 80, 100, 65,
  85, 45, 95, 70, 50, 85, 60, 40, 75, 90,
  55, 35, 70, 85, 50, 65, 40, 30
];

function formatTime(secs: number) {
  if (isNaN(secs) || secs < 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

export default function LonalizaAudioPlayer({
  src,
  durationMs,
  bubbleTone = "purple",
}: {
  src: string;
  durationMs?: number;
  bubbleTone?: "purple" | "white";
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState<number>(durationMs ? durationMs / 1000 : 0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleSeek = (index: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const progressRatio = index / (BAR_PATTERN.length - 1);
    const targetTime = progressRatio * duration;
    audio.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const activeBarIndex = Math.floor((progressPct / 100) * BAR_PATTERN.length);

  const isPurple = bubbleTone === "purple";

  return (
    <div className="flex items-center gap-2.5 py-1 min-w-[210px] sm:min-w-[240px] select-none">
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />

      {/* Luxury Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-md transition-all hover:scale-105 active:scale-95 ${
          isPurple
            ? "bg-[#2E1065] text-amber-300 ring-1 ring-amber-400/40"
            : "bg-[#2E1065] text-amber-300 ring-1 ring-purple-300/40"
        }`}
        aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
      >
        {isPlaying ? (
          <Pause size={17} className="fill-amber-300 text-amber-300" />
        ) : (
          <Play size={17} className="fill-amber-300 text-amber-300 ps-0.5" />
        )}
      </button>

      {/* Waveform Visualization & Timing */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-[2.5px] h-7 cursor-pointer py-1" title="انقر للتقديم أو التأخير">
          {BAR_PATTERN.map((height, i) => {
            const isFilled = i <= activeBarIndex;
            return (
              <span
                key={i}
                onClick={() => handleSeek(i)}
                style={{ height: `${height}%` }}
                className={`w-[3px] rounded-full transition-all duration-150 hover:scale-y-125 ${
                  isFilled
                    ? isPurple
                      ? "bg-[#2E1065]"
                      : "bg-[#7C3AED]"
                    : isPurple
                      ? "bg-purple-300/50"
                      : "bg-slate-200"
                } ${isPlaying && isFilled ? "opacity-90" : ""}`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono font-bold mt-0.5">
          <span className={isPurple ? "text-[#2E1065]" : "text-slate-600"}>
            {formatTime(currentTime)}
          </span>
          <span className={isPurple ? "text-purple-800/70" : "text-slate-400"}>
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
