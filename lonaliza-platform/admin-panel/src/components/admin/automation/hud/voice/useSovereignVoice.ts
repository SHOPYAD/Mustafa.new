"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  globalTranscriptBuffer,
  IntentJudge,
  SemanticToolRouter,
  ThreeBranchGraph,
  type IntentJudgmentResult,
  type SovereignToolDefinition,
  type WarmProfilePayload,
} from "@/lib/jarvis/index";

// Extend Window interface for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: { new (): ISpeechRecognition };
  webkitSpeechRecognition?: { new (): ISpeechRecognition };
}

export interface DirectiveContextMeta {
  judgment: IntentJudgmentResult;
  routedTools: SovereignToolDefinition[];
  warmProfile: WarmProfilePayload;
}

export interface UseSovereignVoiceOptions {
  onDirectiveSubmit?: (text: string, meta?: DirectiveContextMeta) => Promise<string | void>;
  selectedVoice?: string;
  silenceThresholdMs?: number;
  locale?: string; // 'ar' | 'tr' | 'en' | 'fr'
  soundFxEnabled?: boolean;
}

// Multilingual Barge-In Stop Words (JARVIS interrupt triggers)
const BARGE_IN_STOP_WORDS = [
  "توقف", "اسكت", "اصمت", "بس", "خلاص", "كافي", "إلغاء",
  "stop", "pause", "be quiet", "shut up", "cancel", "halt",
  "dur", "sus", "yeter", "tamam", "iptal",
  "arrête", "silence", "assez", "pause"
];

export function useSovereignVoice({
  onDirectiveSubmit,
  selectedVoice = "ar-SA-HamedNeural",
  silenceThresholdMs = 2400,
  locale = "ar",
  soundFxEnabled = true,
}: UseSovereignVoiceOptions = {}) {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState<boolean>(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastSpokenText, setLastSpokenText] = useState<string>("");
  const [agentResponseText, setAgentResponseText] = useState<string>("");
  const [audioFrequencies, setAudioFrequencies] = useState<number[]>(new Array(32).fill(0));

  // Audio Context & Analyser Separation (Eliminating Local Loopback Echo)
  const audioContextRef = useRef<AudioContext | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const playbackAnalyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Duplex Mute Lock & Echo Suppression Refs
  const isMutedByPlaybackRef = useRef<boolean>(false);
  const isAgentSpeakingRef = useRef<boolean>(false);
  const pendingDirectiveRef = useRef<string | null>(null);
  const flushVoiceRef = useRef<(text: string) => void>(() => {});
  const speechQueueRef = useRef(Promise.resolve());
  const speechDepthRef = useRef(0);
  const isUserSpeakingRef = useRef<boolean>(false);
  const playbackCooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const spokenHistoryFingerprintRef = useRef<string[]>([]);
  const isActiveRef = useRef<boolean>(false);

  // Recognition & VAD Timers
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedTranscriptRef = useRef<string>("");

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    isAgentSpeakingRef.current = isAgentSpeaking;
  }, [isAgentSpeaking]);

  useEffect(() => {
    isUserSpeakingRef.current = isUserSpeaking;
  }, [isUserSpeaking]);

  // Setup Web Audio Context with Strictly Isolated Mic & Playback Analysers
  const setupAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    // 1. Dedicated Microphone Analyser (NEVER connects to ctx.destination - ZERO echo/loopback)
    if (!micAnalyserRef.current) {
      const micAnalyser = audioContextRef.current.createAnalyser();
      micAnalyser.fftSize = 64;
      micAnalyser.smoothingTimeConstant = 0.8;
      micAnalyserRef.current = micAnalyser;
    }

    // 2. Dedicated Playback Analyser (Only connects to ctx.destination during TTS playback)
    if (!playbackAnalyserRef.current) {
      const playAnalyser = audioContextRef.current.createAnalyser();
      playAnalyser.fftSize = 64;
      playAnalyser.smoothingTimeConstant = 0.8;
      playbackAnalyserRef.current = playAnalyser;
    }

    return {
      ctx: audioContextRef.current,
      micAnalyser: micAnalyserRef.current,
      playbackAnalyser: playbackAnalyserRef.current,
    };
  }, []);

  // Update Frequency Array for Waveform Visualizer (Active or Organic Ambient Idle)
  const updateFrequencies = useCallback(() => {
    let normalized: number[] = [];

    if (isAgentSpeakingRef.current && playbackAnalyserRef.current) {
      const dataArray = new Uint8Array(playbackAnalyserRef.current.frequencyBinCount);
      playbackAnalyserRef.current.getByteFrequencyData(dataArray);
      normalized = Array.from(dataArray.slice(0, 32)).map((v) => v / 255);
    } else if (isUserSpeakingRef.current && micAnalyserRef.current) {
      const dataArray = new Uint8Array(micAnalyserRef.current.frequencyBinCount);
      micAnalyserRef.current.getByteFrequencyData(dataArray);
      normalized = Array.from(dataArray.slice(0, 32)).map((v) => v / 255);
    } else {
      // Gentle Organic Ambient Idle Breathing Waves (Always alive & dynamic even when idle)
      const now = performance.now() * 0.003;
      normalized = new Array(32).fill(0).map((_, i) => {
        const sine = Math.sin(now + i * 0.35) * 0.5 + 0.5;
        const pulse = Math.cos(now * 0.7 - i * 0.2) * 0.5 + 0.5;
        return 0.05 + sine * 0.12 + pulse * 0.08;
      });
    }

    setAudioFrequencies(normalized);
    animFrameRef.current = requestAnimationFrame(updateFrequencies);
  }, []);

  // Safe resume of speech recognition after playback completes with acoustic dissipation cooldown
  const schedulePlaybackRelease = useCallback(() => {
    if (speechDepthRef.current > 0) return;
    if (playbackCooldownTimerRef.current) {
      clearTimeout(playbackCooldownTimerRef.current);
    }
    // 850ms Cooldown allows room acoustic echo and speaker tails to fully decay
    playbackCooldownTimerRef.current = setTimeout(() => {
      setIsAgentSpeaking(false);
      isAgentSpeakingRef.current = false;
      isMutedByPlaybackRef.current = false;

      if (micStreamRef.current) {
        micStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = true;
        });
      }

      if (recognitionRef.current && isActiveRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // already running or harmless transition
        }
      }
      const waiting = pendingDirectiveRef.current;
      if (waiting) {
        pendingDirectiveRef.current = null;
        flushVoiceRef.current(waiting);
      }
    }, 850);
  }, []);
  const speakOneTurn = useCallback(
    async (text: string, voice: string) => {
      if (!text || !text.trim()) return;
      speechDepthRef.current += 1;
      isAgentSpeakingRef.current = true;
      setIsAgentSpeaking(true);
      setAgentResponseText(text);
      try {
      if (!soundFxEnabled) {
        await new Promise((resolve) => setTimeout(resolve, Math.min(3000, text.length * 50)));
        return;
      }

      // 1. HARD HARDWARE MUTE LOCK: Kill mic capture instantly before speaking
      isMutedByPlaybackRef.current = true;

      // Physically disable microphone tracks so zero speaker sound can leak into recognizer
      if (micStreamRef.current) {
        micStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });
      }

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (playbackCooldownTimerRef.current) {
        clearTimeout(playbackCooldownTimerRef.current);
      }

      // Record spoken sentence fingerprint to reject self-reflection
      const cleanFingerprint = text.toLowerCase().replace(/[^\w\s\u0600-\u06FF]/gi, "").trim();
      spokenHistoryFingerprintRef.current.push(cleanFingerprint);
      if (spokenHistoryFingerprintRef.current.length > 8) {
        spokenHistoryFingerprintRef.current.shift();
      }

      // Abort active recognition so speaker audio is never ingested
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      try {
        const { ctx, playbackAnalyser } = await setupAudioContext();

        // Send full vocal text (up to 4000 chars) for server-side seamless synthesis
        const cleanTextForTts = text.slice(0, 4000);

        // 1. Try server-side Microsoft Edge Neural TTS
        const response = await fetch("/api/admin/automation/voice-tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: cleanTextForTts, voice }),
        });

        if (!response.ok) {
          throw new Error("Edge TTS endpoint failed");
        }

        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

        // Stop any previous playing audio
        if (currentAudioSourceRef.current) {
          try {
            currentAudioSourceRef.current.stop();
          } catch {
            // ignore
          }
        }

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(playbackAnalyser);
        playbackAnalyser.connect(ctx.destination);

        currentAudioSourceRef.current = source;

        await new Promise<void>((resolve) => {
          source.onended = () => {
            currentAudioSourceRef.current = null;
            resolve();
          };
          source.start(0);
        });
      } catch (err) {
        console.warn("[VoiceHook] Falling back to Web Speech Synthesis:", err);
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "ar-SA";
          utterance.rate = 1.05;
          (window as unknown as { __jarvis_current_utterance?: SpeechSynthesisUtterance }).__jarvis_current_utterance = utterance;
          await new Promise<void>((resolve) => {
            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();
            window.speechSynthesis.speak(utterance);
          });
        }
      }
      } finally {
        speechDepthRef.current = Math.max(0, speechDepthRef.current - 1);
        if (speechDepthRef.current === 0) schedulePlaybackRelease();
      }
    },
    [setupAudioContext, schedulePlaybackRelease, soundFxEnabled]
  );

  const speakAgentResponse = useCallback(
    (text: string, voiceOverride?: string) => {
      const turn = speechQueueRef.current.then(() => speakOneTurn(text, voiceOverride || selectedVoice));
      speechQueueRef.current = turn.then(() => undefined, () => undefined);
      return turn;
    },
    [selectedVoice, speakOneTurn]
  );

  // Dispatch directive on silence detection
  const handleFinalDirective = useCallback(
    async (directive: string) => {
      const cleanDirective = directive.trim();
      if (!cleanDirective) return;
      if (isMutedByPlaybackRef.current || speechDepthRef.current > 0) {
        pendingDirectiveRef.current = cleanDirective;
        return;
      }

      // Ambient noise & short filler rejection
      const words = cleanDirective.split(/\s+/).filter(Boolean);
      const isNoiseOrFiller =
        cleanDirective.length < 4 ||
        (words.length === 1 && [
          "اه", "ااه", "مم", "همم", "الو", "شش", "ها", "امم",
          "um", "uh", "ah", "hmm", "hey", "shh"
        ].includes(cleanDirective.toLowerCase())) ||
        /^[\.\,\s\?\!\-\_]+$/.test(cleanDirective);

      if (isNoiseOrFiller) {
        setIsUserSpeaking(false);
        setLastSpokenText("");
        accumulatedTranscriptRef.current = "";
        return;
      }

      setIsUserSpeaking(false);
      setIsProcessing(true);
      accumulatedTranscriptRef.current = "";

      // Push user utterance to JARVIS 120-second rolling transcript buffer
      globalTranscriptBuffer.push("user", cleanDirective, locale);

      // Evaluate Intent via JARVIS IntentJudge
      const judgment = IntentJudge.judge(cleanDirective, locale);

      // Dynamically filter top 3-5 tools out of 81 platform modules
      const routedTools = SemanticToolRouter.routeTools(cleanDirective, 3);

      // Retrieve synthesized warm profile from 3-Branch Qdrant graph
      const warmProfile = ThreeBranchGraph.getWarmProfile(locale);

      try {
        if (onDirectiveSubmit) {
          const reply = await onDirectiveSubmit(cleanDirective, {
            judgment,
            routedTools,
            warmProfile,
          });
          if (reply && typeof reply === "string") {
            globalTranscriptBuffer.push("jarvis", reply, locale);
            await speakAgentResponse(reply);
          }
        }
      } catch (err) {
        console.error("[VoiceHook] Directive submission failed:", err);
      } finally {
        setIsProcessing(false);
      }
    },
    [onDirectiveSubmit, speakAgentResponse, locale]
  );
  flushVoiceRef.current = (text: string) => {
    void handleFinalDirective(text);
  };

  // Start continuous listening with Duplex Mute Guard & Echo Cancellation
  const startListening = useCallback(async () => {
    try {
      const win = window as WindowWithSpeech;
      const SpeechRecognitionConstructor = win.SpeechRecognition || win.webkitSpeechRecognition;

      if (!SpeechRecognitionConstructor) {
        console.warn("[VoiceHook] SpeechRecognition not supported in this browser.");
        return;
      }

      const { ctx, micAnalyser } = await setupAudioContext();

      // Connect microphone with hardware Echo Cancellation & Noise Suppression
      // Note: micSource connects ONLY to micAnalyser for frequency visualization.
      // It is NEVER connected to ctx.destination, preventing any local loopback / echo!
      if (!micStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        micStreamRef.current = stream;
        const micSource = ctx.createMediaStreamSource(stream);
        micSource.connect(micAnalyser);
      }

      if (!recognitionRef.current) {
        const recognition = new SpeechRecognitionConstructor();
        recognition.continuous = true;
        recognition.interimResults = true;
        const LOCALE_LANG_MAP: Record<string, string> = {
          ar: "ar-SA",
          tr: "tr-TR",
          en: "en-US",
          fr: "fr-FR",
        };
        recognition.lang = LOCALE_LANG_MAP[locale] || "ar-SA";

        recognition.onstart = () => {
          setIsActive(true);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          // If muted by playback, discard result entirely
          if (isMutedByPlaybackRef.current) {
            return;
          }

          // Aggregate full continuous transcript across all speech results in this utterance
          let fullTranscript = "";
          for (let i = 0; i < event.results.length; ++i) {
            fullTranscript += event.results[i][0].transcript + " ";
          }

          const currentText = fullTranscript.trim();
          if (currentText) {
            // Echo Fingerprint Rejection: Ignore any words resembling what the agent recently uttered
            const normalizedInput = currentText.toLowerCase().replace(/[^\w\s\u0600-\u06FF]/gi, "").trim();
            const matchesEcho = spokenHistoryFingerprintRef.current.some(
              (spoken) => spoken.includes(normalizedInput) || (normalizedInput.length > 8 && spoken.includes(normalizedInput.slice(0, 15)))
            );
            if (matchesEcho) {
              return;
            }

            // JARVIS Barge-In Check: If user speaks stop words, kill agent audio immediately!
            const isStopCommand = IntentJudge.isBargeIn(currentText);
            if (isStopCommand) {
              if (currentAudioSourceRef.current) {
                try {
                  currentAudioSourceRef.current.stop();
                } catch {
                  // ignore
                }
                currentAudioSourceRef.current = null;
              }
              if ("speechSynthesis" in window) {
                window.speechSynthesis.cancel();
              }
              setIsAgentSpeaking(false);
              isMutedByPlaybackRef.current = false;
              setLastSpokenText("[BARGE-IN: INTERRUPTED]");
              if (silenceTimerRef.current) {
                clearTimeout(silenceTimerRef.current);
              }
              return;
            }

            setIsUserSpeaking(true);
            setLastSpokenText(currentText);
            accumulatedTranscriptRef.current = currentText;

            // Reset silence VAD timer (give 3200ms of quiet before submitting full utterance)
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
            }

            silenceTimerRef.current = setTimeout(() => {
              const textToSend = accumulatedTranscriptRef.current;
              if (textToSend) {
                // Abort and restart recognition to reset event.results buffer for the next utterance
                if (recognitionRef.current) {
                  try {
                    recognitionRef.current.abort();
                  } catch {
                    // ignore
                  }
                }
                void handleFinalDirective(textToSend);
              }
            }, Math.max(3200, silenceThresholdMs));
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          if (event.error !== "no-speech") {
            console.warn("[VoiceHook] Speech recognition error:", event.error);
          }
        };

        recognition.onend = () => {
          // Do NOT restart if muted by playback or if user turned voice off
          if (isMutedByPlaybackRef.current || !isActiveRef.current) {
            return;
          }
          if (recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch {
              // ignore
            }
          }
        };

        recognitionRef.current = recognition;
      }

      try {
        recognitionRef.current.start();
      } catch {
        // already started
      }

      setIsActive(true);
      animFrameRef.current = requestAnimationFrame(updateFrequencies);
    } catch (err) {
      console.error("[VoiceHook] Failed to start voice listening:", err);
      setIsActive(false);
    }
  }, [setupAudioContext, updateFrequencies, handleFinalDirective, silenceThresholdMs, locale]);

  // Stop listening with HARD HARDWARE KILL
  const stopListening = useCallback(() => {
    isActiveRef.current = false;
    setIsActive(false);
    setIsUserSpeaking(false);
    setIsAgentSpeaking(false);
    setIsProcessing(false);
    isMutedByPlaybackRef.current = false;

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (playbackCooldownTimerRef.current) {
      clearTimeout(playbackCooldownTimerRef.current);
      playbackCooldownTimerRef.current = null;
    }

    const pendingText = accumulatedTranscriptRef.current;
    accumulatedTranscriptRef.current = "";

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    if (pendingText && pendingText.trim().length > 3) {
      void handleFinalDirective(pendingText);
    }

    // Physically kill and disconnect all hardware audio input tracks
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
      });
      micStreamRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (currentAudioSourceRef.current) {
      try {
        currentAudioSourceRef.current.stop();
      } catch {
        // ignore
      }
      currentAudioSourceRef.current = null;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setAudioFrequencies(new Array(32).fill(0));
  }, []);

  const toggleVoice = useCallback(() => {
    if (isActive) {
      stopListening();
    } else {
      void startListening();
    }
  }, [isActive, startListening, stopListening]);

  useEffect(() => {
    return () => {
      stopListening();
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        void audioContextRef.current.close();
      }
    };
  }, [stopListening]);

  return {
    isActive,
    isUserSpeaking,
    isAgentSpeaking,
    isProcessing,
    lastSpokenText,
    agentResponseText,
    audioFrequencies,
    toggleVoice,
    startListening,
    stopListening,
    speakAgentResponse,
  };
}
