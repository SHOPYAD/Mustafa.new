"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAvatarStore } from "../store/useAvatarStore";
import { Mic, MicOff } from "lucide-react";

interface AvatarHudOverlayProps {
  slowCamera?: boolean;
  onEnterSwarmWorkspace?: () => void;
}

export default function AvatarHudOverlay({
  slowCamera = false,
  onEnterSwarmWorkspace,
}: AvatarHudOverlayProps) {
  const currentState = useAvatarStore((s) => s.currentState);
  const statusText = useAvatarStore((s) => s.statusText);
  const voiceLevel = useAvatarStore((s) => s.voiceLevel);
  const userAudioLevel = useAvatarStore((s) => s.userAudioLevel);
  const setState = useAvatarStore((s) => s.setState);
  const setUserAudioLevel = useAvatarStore((s) => s.setUserAudioLevel);
  const setVoiceLevel = useAvatarStore((s) => s.setVoiceLevel);

  const [isMicActive, setIsMicActive] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micRafRef = useRef<number | null>(null);
  const testSpeechIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (micRafRef.current) cancelAnimationFrame(micRafRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
      if (testSpeechIntervalRef.current) clearInterval(testSpeechIntervalRef.current);
    };
  }, []);

  const toggleMic = async () => {
    if (isMicActive) {
      if (micRafRef.current) cancelAnimationFrame(micRafRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
      setIsMicActive(false);
      setUserAudioLevel(0);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsMicActive(true);
      setState("listening");

      const buffer = new Uint8Array(analyser.frequencyBinCount);
      const sampleMic = () => {
        analyser.getByteFrequencyData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
          sum += buffer[i];
        }
        const avg = sum / buffer.length / 255;
        setUserAudioLevel(avg * 2.2);

        micRafRef.current = requestAnimationFrame(sampleMic);
      };
      sampleMic();
    } catch (err) {
      console.warn("Microphone not available, using simulation:", err);
      setIsMicActive(true);
      setState("listening");
      let mockT = 0;
      const mockLoop = () => {
        mockT += 0.05;
        const level = Math.max(0, Math.sin(mockT) * 0.7 + (Math.random() - 0.5) * 0.3);
        setUserAudioLevel(level);
        micRafRef.current = requestAnimationFrame(mockLoop);
      };
      mockLoop();
    }
  };

  const handleTestSpeech = () => {
    if (currentState === "speaking") {
      setState("idle");
      setVoiceLevel(0);
      if (testSpeechIntervalRef.current) clearInterval(testSpeechIntervalRef.current);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    useAvatarStore.getState().playWelcomeGreeting();
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-4 z-30 font-mono">
      {/* Top Bar: Clean Status Indicator (Canvas Buttons Removed as requested) */}
      <div className="flex items-center justify-end w-full">
        {/* Top Right: Status Text matching Reference Screenshots */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                currentState === "error"
                  ? "bg-red-500 shadow-[0_0_8px_#ff3311]"
                  : currentState === "speaking"
                  ? "bg-[#FF6A13] shadow-[0_0_10px_#FF6A13]"
                  : currentState === "thinking"
                  ? "bg-[#F2A31C] shadow-[0_0_8px_#F2A31C]"
                  : "bg-[#36F2FF] shadow-[0_0_8px_#36F2FF]"
              } animate-pulse`}
            />
          </div>
          <span className="text-xs md:text-sm tracking-widest text-[#36F2FF] font-semibold drop-shadow-[0_0_8px_rgba(54,242,255,0.6)]">
            {statusText}
          </span>
        </div>
      </div>

      {/* Bottom Center Bar: Interactive State Machine & Audio Controls */}
      <div className="w-full flex flex-col items-center gap-3 pb-2">
        {/* Equalizer / Harmonics Pulse Line */}
        <div className="flex items-center gap-1 opacity-75">
          {Array.from({ length: 24 }).map((_, i) => {
            const activeLevel = currentState === "speaking" ? voiceLevel : currentState === "listening" ? userAudioLevel : 0.1;
            const dist = Math.abs(i - 12) / 12;
            const h = Math.max(2, Math.sin(i * 0.4) * activeLevel * 14 * (1 - dist * 0.5));
            return (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-75 ${
                  currentState === "speaking"
                    ? "bg-[#FF6A13]"
                    : currentState === "thinking"
                    ? "bg-[#F2A31C]"
                    : "bg-[#36F2FF]"
                }`}
                style={{ height: `${h}px` }}
              />
            );
          })}
        </div>

        {/* Action Buttons matching Reference Screen */}
        <div className="pointer-events-auto flex items-center flex-wrap justify-center gap-1.5 p-1.5 rounded-lg bg-[#020611]/90 border border-[#36F2FF]/30 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.8)]">
          <button
            onClick={() => setState("idle")}
            className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
              currentState === "idle"
                ? "bg-[#36F2FF] text-black font-bold shadow-[0_0_12px_rgba(54,242,255,0.6)]"
                : "text-slate-300 hover:text-[#36F2FF] hover:bg-white/5"
            }`}
          >
            IDLE
          </button>

          <button
            onClick={() => {
              setState("listening", { userAudioLevel: 0.65 });
            }}
            className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
              currentState === "listening"
                ? "bg-[#36F2FF] text-black font-bold shadow-[0_0_12px_rgba(54,242,255,0.6)]"
                : "text-slate-300 hover:text-[#36F2FF] hover:bg-white/5"
            }`}
          >
            LISTENING
          </button>

          <button
            onClick={() => {
              setState("thinking", { intensity: 0.85 });
            }}
            className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
              currentState === "thinking"
                ? "bg-[#F2A31C] text-black font-bold shadow-[0_0_12px_rgba(242,163,28,0.6)]"
                : "text-slate-300 hover:text-[#F2A31C] hover:bg-white/5"
            }`}
          >
            THINKING
          </button>

          <button
            onClick={handleTestSpeech}
            className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
              currentState === "speaking"
                ? "bg-[#FF6A13] text-black font-bold shadow-[0_0_12px_rgba(255,106,19,0.7)]"
                : "text-slate-300 hover:text-[#FF6A13] hover:bg-white/5"
            }`}
          >
            SPEAKING
          </button>

          <button
            onClick={() => {
              setState("confident", { confidence: 0.98 });
              setTimeout(() => {
                setState("idle");
              }, 1800);
            }}
            className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
              currentState === "confident"
                ? "bg-emerald-400 text-black font-bold shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                : "text-slate-300 hover:text-emerald-400 hover:bg-white/5"
            }`}
          >
            CONFIDENT
          </button>

          <button
            onClick={() => {
              setState("error", { severity: "soft" });
              setTimeout(() => {
                setState("idle");
              }, 2000);
            }}
            className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
              currentState === "error"
                ? "bg-[#FF3311] text-white font-bold shadow-[0_0_12px_rgba(255,51,17,0.7)]"
                : "text-slate-300 hover:text-red-400 hover:bg-white/5"
            }`}
          >
            ANOMALY
          </button>

          <div className="w-px h-4 bg-slate-700 mx-1" />

          {/* Toggle Microphone */}
          <button
            onClick={toggleMic}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
              isMicActive
                ? "bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(54,242,255,0.3)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
            title="Real-time Web Audio Analyser"
          >
            {isMicActive ? <Mic className="w-3.5 h-3.5 text-cyan-300 animate-pulse" /> : <MicOff className="w-3.5 h-3.5" />}
            <span>{isMicActive ? "MIC ACTIVE" : "MIC OFF"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
