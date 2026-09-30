// ============================================================================
// JARVIS AVATAR STATE STORE (ZUSTAND)
// ============================================================================

import { create } from "zustand";

export type AvatarStateName = 
  | "idle" 
  | "listening" 
  | "thinking" 
  | "speaking" 
  | "confident" 
  | "uncertain" 
  | "error";

export type AvatarViewMode = "FRONT_HERO" | "PARTICLE_PROFILE_TRANSITION";

export interface SetStatePayload {
  userAudioLevel?: number;
  intensity?: number;
  confidence?: number;
  voiceLevel?: number;
  severity?: "soft" | "hard";
}

export interface AvatarStoreState {
  // Primary State & View Mode
  currentState: AvatarStateName;
  previousState: AvatarStateName;
  statusText: string;
  viewMode: AvatarViewMode;
  profileTransitionProgress: number; // 0.0 = FRONT_HERO, 1.0 = PARTICLE_PROFILE

  // Assembly State (Startup vortex animation)
  assemblyProgress: number; // 0.0 = birth orb vortex, 1.0 = fully assembled
  isAssembled: boolean;

  // 4 Independent Signals
  voiceLevel: number;             // Jarvis voice level (0 - 1)
  userAudioLevel: number;         // User microphone audio level (0 - 1)
  thinkingIntensity: number;      // 0 - 1
  responseConfidence: number;     // 0 - 1
  errorSeverity: "soft" | "hard";

  // Smoothed Audio Levels (Attack ~100ms, Release ~350ms)
  smoothedVoiceLevel: number;
  smoothedUserAudioLevel: number;

  // Pulse & Wave Triggers
  lastSentenceStartTime: number;
  confidenceTriggerTime: number;

  // Actions
  setState: (state: AvatarStateName, payload?: SetStatePayload) => void;
  setViewMode: (mode: AvatarViewMode) => void;
  toggleViewMode: () => void;
  setVoiceLevel: (level: number) => void;
  setUserAudioLevel: (level: number) => void;
  setThinkingIntensity: (intensity: number) => void;
  setResponseConfidence: (confidence: number) => void;
  setAssemblyProgress: (progress: number) => void;
  startAssemblyAnimation: () => void;
  playWelcomeGreeting: () => void;
  triggerSentencePulse: () => void;
  tickSmoothing: (delta: number) => void;
}

export const useAvatarStore = create<AvatarStoreState>((set, get) => ({
  currentState: "idle",
  previousState: "idle",
  statusText: "STATUS: IDLE",
  viewMode: "FRONT_HERO",
  profileTransitionProgress: 0.0,
  assemblyProgress: 1.0,
  isAssembled: true,

  voiceLevel: 0,
  userAudioLevel: 0,
  thinkingIntensity: 0,
  responseConfidence: 1.0,
  errorSeverity: "soft",

  smoothedVoiceLevel: 0,
  smoothedUserAudioLevel: 0,

  lastSentenceStartTime: 0,
  confidenceTriggerTime: 0,

  setState: (newState: AvatarStateName, payload?: SetStatePayload) => {
    const prev = get().currentState;
    let statusText = `STATUS: ${newState.toUpperCase()}`;

    const updates: Partial<AvatarStoreState> = {
      currentState: newState,
      previousState: prev,
      statusText,
    };

    if (payload?.userAudioLevel !== undefined) {
      updates.userAudioLevel = Math.max(0, Math.min(1, payload.userAudioLevel));
    }
    if (payload?.intensity !== undefined) {
      updates.thinkingIntensity = Math.max(0, Math.min(1, payload.intensity));
    }
    if (payload?.confidence !== undefined) {
      updates.responseConfidence = Math.max(0, Math.min(1, payload.confidence));
    }
    if (payload?.voiceLevel !== undefined) {
      updates.voiceLevel = Math.max(0, Math.min(1, payload.voiceLevel));
    }
    if (payload?.severity !== undefined) {
      updates.errorSeverity = payload.severity;
    }

    if (newState === "speaking") {
      updates.lastSentenceStartTime = performance.now() / 1000;
      statusText = "STATUS: SPEAKING";
    } else if (newState === "thinking") {
      statusText = `STATUS: THINKING`;
    } else if (newState === "listening") {
      statusText = "STATUS: LISTENING";
    } else if (newState === "confident") {
      updates.confidenceTriggerTime = performance.now() / 1000;
      statusText = "STATUS: CONFIDENT";
    } else if (newState === "error") {
      statusText = "STATUS: ANOMALY";
    } else if (newState === "uncertain") {
      statusText = "STATUS: UNCERTAIN";
    }

    updates.statusText = statusText;
    set(updates);
  },

  setViewMode: (mode: AvatarViewMode) => {
    set({ viewMode: mode });
  },

  toggleViewMode: () => {
    const next = get().viewMode === "FRONT_HERO" ? "PARTICLE_PROFILE_TRANSITION" : "FRONT_HERO";
    set({ viewMode: next });
  },

  setVoiceLevel: (level: number) => {
    set({ voiceLevel: Math.max(0, Math.min(1, level)) });
  },

  setUserAudioLevel: (level: number) => {
    set({ userAudioLevel: Math.max(0, Math.min(1, level)) });
  },

  setThinkingIntensity: (intensity: number) => {
    set({ thinkingIntensity: Math.max(0, Math.min(1, intensity)) });
  },

  setResponseConfidence: (confidence: number) => {
    set({ responseConfidence: Math.max(0, Math.min(1, confidence)) });
  },

  setAssemblyProgress: (progress: number) => {
    const clamped = Math.max(0, Math.min(1, progress));
    set({ 
      assemblyProgress: clamped,
      isAssembled: clamped >= 1.0,
    });
  },

  startAssemblyAnimation: () => {
    if (get().isAssembled) return;

    let startTime: number | null = null;
    let rafId: number;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const elapsed = (time - startTime) / 1000;
      const duration = 3.4; // 3.4s majestic swirling vortex assembly
      const progress = Math.min(1.0, elapsed / duration);

      // Smooth cubic ease-out
      const eased = 1.0 - Math.pow(1.0 - progress, 3);
      get().setAssemblyProgress(eased);

      if (progress < 1.0) {
        rafId = requestAnimationFrame(animate);
      } else {
        get().setAssemblyProgress(1.0);
        setTimeout(() => {
          get().playWelcomeGreeting();
        }, 350);
      }
    };

    rafId = requestAnimationFrame(animate);
  },

  playWelcomeGreeting: () => {
    const { setState, setVoiceLevel } = get();
    setState("speaking", { confidence: 0.98, voiceLevel: 0.85 });

    let t = 0;
    const interval = setInterval(() => {
      t += 0.14;
      // Cadence of conversational Arabic speech
      const v = Math.max(0.12, Math.abs(Math.sin(t * 3.8) * 0.78 + Math.cos(t * 7.6) * 0.22));
      setVoiceLevel(v);
    }, 45);

    const finish = () => {
      clearInterval(interval);
      setVoiceLevel(0);
      setState("idle");
    };

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("أهلاً بك يا سيادة المدير، أنا في أتم الاستعداد لأداء المهام المطلوبة مني.");
      utterance.lang = "ar-SA";
      utterance.rate = 0.94;
      utterance.pitch = 1.02;

      const voices = window.speechSynthesis.getVoices();
      const arabicVoice = voices.find(v => v.lang.startsWith("ar"));
      if (arabicVoice) {
        utterance.voice = arabicVoice;
      }

      utterance.onend = finish;
      utterance.onerror = finish;

      const timer = setTimeout(finish, 4800);
      utterance.onend = () => {
        clearTimeout(timer);
        finish();
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch {
        setTimeout(finish, 4800);
      }
    } else {
      setTimeout(finish, 4800);
    }
  },

  triggerSentencePulse: () => {
    set({ lastSentenceStartTime: performance.now() / 1000 });
  },

  tickSmoothing: (delta: number) => {
    const { 
      voiceLevel, 
      userAudioLevel, 
      smoothedVoiceLevel, 
      smoothedUserAudioLevel,
      viewMode,
      profileTransitionProgress
    } = get();

    // Audio Smoothing (Attack 100ms, Release 350ms)
    const attackCoeff = Math.min(1, delta * 11.0);
    const releaseCoeff = Math.min(1, delta * 3.0);

    const targetVoice = voiceLevel;
    const nextVoice = targetVoice > smoothedVoiceLevel
      ? smoothedVoiceLevel + (targetVoice - smoothedVoiceLevel) * attackCoeff
      : smoothedVoiceLevel + (targetVoice - smoothedVoiceLevel) * releaseCoeff;

    const targetUser = userAudioLevel;
    const nextUser = targetUser > smoothedUserAudioLevel
      ? smoothedUserAudioLevel + (targetUser - smoothedUserAudioLevel) * attackCoeff
      : smoothedUserAudioLevel + (targetUser - smoothedUserAudioLevel) * releaseCoeff;

    // ViewMode transition smoothing
    const targetTransition = viewMode === "PARTICLE_PROFILE_TRANSITION" ? 1.0 : 0.0;
    const nextTransition = profileTransitionProgress + (targetTransition - profileTransitionProgress) * Math.min(1, delta * 2.8);

    set({
      smoothedVoiceLevel: nextVoice,
      smoothedUserAudioLevel: nextUser,
      profileTransitionProgress: nextTransition,
    });
  },
}));

if (typeof window !== "undefined") {
  (window as any).jarvisAvatar = {
    setState: (state: AvatarStateName, payload?: SetStatePayload) => 
      useAvatarStore.getState().setState(state, payload),
    getState: () => useAvatarStore.getState(),
    setViewMode: (mode: AvatarViewMode) => useAvatarStore.getState().setViewMode(mode),
    toggleViewMode: () => useAvatarStore.getState().toggleViewMode(),
    triggerPulse: () => useAvatarStore.getState().triggerSentencePulse(),
  };
}
