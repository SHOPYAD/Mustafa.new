"use client";

// Sovereign Web Audio API Rotary Shutter Sound Synthesizer ("ترترترتر")
class RotarySoundEngine {
  private ctx: AudioContext | null = null;
  private isUnlocked = false;

  private initContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    return this.ctx;
  }

  public unlock() {
    if (this.isUnlocked && this.ctx && this.ctx.state === "running") return;
    const ctx = this.initContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      ctx.resume().then(() => {
        this.isUnlocked = true;
      }).catch(() => {});
    } else {
      this.isUnlocked = true;
    }
  }

  public playRotaryTick() {
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;

      // 1. Sharp mechanical transient impulse (camera shutter / dial notch click)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1600, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.024);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.024);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.026);

      // 2. High-frequency metallic click harmonic
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(3600, now);
      osc2.frequency.exponentialRampToValueAtTime(450, now + 0.012);

      gain2.gain.setValueAtTime(0.12, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + 0.015);
    } catch {
      // Audio not supported or blocked
    }
  }
}

export const rotarySound = new RotarySoundEngine();

// Auto unlock listeners on first user gesture
if (typeof window !== "undefined") {
  const handleInteraction = () => {
    rotarySound.unlock();
  };
  window.addEventListener("pointerdown", handleInteraction, { once: true, passive: true });
  window.addEventListener("keydown", handleInteraction, { once: true, passive: true });
  window.addEventListener("wheel", handleInteraction, { once: true, passive: true });
  window.addEventListener("touchstart", handleInteraction, { once: true, passive: true });
}
