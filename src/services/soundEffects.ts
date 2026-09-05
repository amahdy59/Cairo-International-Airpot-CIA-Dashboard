// Operational Audio Feedback (Earcons) Service: Web Audio API Synthesized Clicks & Chimes
// Lightweight, client-side, zero latency, zero external asset downloads.
// Designed strictly for subtle tactile feedback without cognitive noise fatigue.

class SoundEffectsService {
  private audioCtx: AudioContext | null = null;
  private isEnabled: boolean = false;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("cai_sfx_enabled");
      // Default to disabled to respect WCAG AAA quiet environment guidelines
      this.isEnabled = stored === "true";
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("cai_sfx_enabled", enabled ? "true" : "false");
    }
    if (enabled) {
      this.getAudioContext();
      this.playClick();
    }
    this.notify();
  }

  public toggle(): boolean {
    this.setEnabled(!this.isEnabled);
    return this.isEnabled;
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume().catch(() => {});
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  // 1. Soft Tactile Click (12ms): For tab switches & buttons
  public playClick(): void {
    if (!this.isEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.015);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.015);
    } catch {
      // Audio playback failed
    }
  }

  // 2. High-Tech Action Dispatch Chime (35ms): For incident actions & team dispatches
  public playDispatch(): void {
    if (!this.isEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(987.77, now); // B5 note
      osc1.frequency.exponentialRampToValueAtTime(1318.51, now + 0.04); // E6 note

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1318.51, now);
      osc2.frequency.exponentialRampToValueAtTime(1760.00, now + 0.04); // A6 note

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.05);
      osc2.stop(now + 0.05);
    } catch {
      // Audio playback failed
    }
  }

  // 3. Operational Drill Alert Warning (50ms): For sandbox scenario activation
  public playAlert(): void {
    if (!this.isEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);

      // Low pass filter to keep it subtle and non-piercing
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1100;

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Audio playback failed
    }
  }
}

export const soundEffects = new SoundEffectsService();
