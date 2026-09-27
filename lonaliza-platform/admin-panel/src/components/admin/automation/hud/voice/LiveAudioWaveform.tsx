"use client";

import React, { useMemo } from "react";
import { Mic, MicOff, Volume2, Sparkles, Loader2 } from "lucide-react";

interface LiveAudioWaveformProps {
  isActive: boolean;
  isUserSpeaking: boolean;
  isAgentSpeaking: boolean;
  isProcessing: boolean;
  frequencies: number[]; // 32 normalized values (0 to 1)
  onToggle: () => void;
  statusText?: string;
}

export default function LiveAudioWaveform({
  isActive,
  isUserSpeaking,
  isAgentSpeaking,
  isProcessing,
  frequencies,
  onToggle,
  statusText,
}: LiveAudioWaveformProps) {
  // Generate waveform heights
  const bars = useMemo(() => {
    return frequencies.map((freq, i) => {
      // Dynamic minimum height for breathing effect when active
      const minH = isActive ? 12 : 4;
      const height = Math.max(minH, Math.round(freq * 48));
      return { height, key: i };
    });
  }, [frequencies, isActive]);

  return (
    <div className="relative flex items-center gap-4 px-4 py-2 rounded-full border border-cyan-500/30 bg-[#030914]/90 backdrop-blur-md shadow-[0_0_25px_rgba(0,229,255,0.15)] transition-all duration-300">
      {/* Microphone / Status Button */}
      <button
        type="button"
        onClick={onToggle}
        className={`relative p-2.5 rounded-full transition-all duration-300 flex items-center justify-center ${
          isActive
            ? isUserSpeaking
              ? "bg-cyan-500 text-black shadow-[0_0_20px_#00e5ff] animate-pulse"
              : isAgentSpeaking
              ? "bg-emerald-500 text-black shadow-[0_0_20px_#10b981]"
              : isProcessing
              ? "bg-amber-500 text-black shadow-[0_0_20px_#f59e0b]"
              : "bg-cyan-500/20 text-cyan-400 border border-cyan-400/50 hover:bg-cyan-500/30"
            : "bg-slate-800/80 text-slate-400 border border-slate-700 hover:text-white"
        }`}
        title={isActive ? "إيقاف الصوت الحي" : "تفعيل الاستماع الحي المباشر"}
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isAgentSpeaking ? (
          <Volume2 className="w-4 h-4" />
        ) : isActive ? (
          <Mic className="w-4 h-4" />
        ) : (
          <MicOff className="w-4 h-4" />
        )}

        {/* Ambient Ring */}
        {isActive && (
          <span className="absolute -inset-1 rounded-full border border-cyan-400/40 animate-ping opacity-75 pointer-events-none" />
        )}
      </button>

      {/* Waveform Bars */}
      <div className="flex items-center gap-1 h-10 px-2 min-w-[140px] max-w-[200px] justify-center">
        {bars.slice(0, 20).map(({ height, key }, idx) => {
          let barColor = "bg-cyan-500/40";
          if (isUserSpeaking) {
            barColor = "bg-cyan-400 shadow-[0_0_8px_#00e5ff]";
          } else if (isAgentSpeaking) {
            barColor = "bg-emerald-400 shadow-[0_0_8px_#10b981]";
          } else if (isProcessing) {
            barColor = "bg-amber-400 shadow-[0_0_8px_#f59e0b]";
          } else if (isActive) {
            barColor = "bg-cyan-500/60";
          }

          return (
            <span
              key={key}
              style={{
                height: `${height}px`,
                transition: "height 0.08s ease-out",
              }}
              className={`w-[3px] rounded-full ${barColor}`}
            />
          );
        })}
      </div>

      {/* Status Label HUD */}
      <div className="flex flex-col text-right pl-2 border-l border-cyan-500/20">
        <span className="text-[10px] uppercase tracking-widest font-mono text-cyan-400 font-semibold flex items-center gap-1">
          {isProcessing ? (
            <>
              <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
              <span>جاري المعالجة...</span>
            </>
          ) : isAgentSpeaking ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300">الوكيل يتحدث</span>
            </>
          ) : isUserSpeaking ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-cyan-300">يستمع لصوتك</span>
            </>
          ) : isActive ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/60" />
              <span className="text-slate-400">جاهز للأمر</span>
            </>
          ) : (
            <span className="text-slate-500">الصوت معطل</span>
          )}
        </span>
        <span className="text-[9px] text-slate-400 font-mono truncate max-w-[120px]">
          {statusText || (isActive ? "تحدث وسيجيبك حامد" : "انقر للتفعيل")}
        </span>
      </div>
    </div>
  );
}
