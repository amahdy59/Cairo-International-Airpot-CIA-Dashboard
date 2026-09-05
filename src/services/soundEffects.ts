import { safeStorage } from "../utils/safeStorage";

// Operational Audio Feedback (Earcons) Service: Web Audio API Synthesized Clicks & Chimes
// Lightweight, client-side, zero latency, zero external asset downloads.
// Designed strictly for subtle tactile feedback without cognitive noise fatigue.

export type SoundProfile = "chime" | "penetrating";

class SoundEffectsService {
  private audioCtx: AudioContext | null = null;
  private isEnabled: boolean = false;
  private profile: SoundProfile = "chime";
  private isHapticsEnabled: boolean = true;
  private listeners: Set<() => void> = new Set();

  constructor() {
    const stored = safeStorage.getItem("cai_sfx_enabled");
    // Default to disabled to respect WCAG AAA quiet environment guidelines
    this.isEnabled = stored === "true";
    const storedProfile = safeStorage.getItem("cai_sfx_profile");
    if (storedProfile === "penetrating" || storedProfile === "chime") {
      this.profile = storedProfile;
    }
    const storedHaptics = safeStorage.getItem("cai_haptics_enabled");
    this.isHapticsEnabled = storedHaptics !== "false";
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

  public getProfile(): SoundProfile {
    return this.profile;
  }

  public setProfile(profile: SoundProfile): void {
    this.profile = profile;
    safeStorage.setItem("cai_sfx_profile", profile);
    if (this.isEnabled) {
      this.playClick();
    }
    this.notify();
  }

  public getIsHapticsEnabled(): boolean {
    return this.isHapticsEnabled;
  }

  public setHapticsEnabled(enabled: boolean): void {
    this.isHapticsEnabled = enabled;
    safeStorage.setItem("cai_haptics_enabled", enabled ? "true" : "false");
    if (enabled) {
      this.triggerHaptic(20);
    }
    this.notify();
  }

  public triggerHaptic(pattern: number | number[] = 15): void {
    if (!this.isHapticsEnabled || typeof navigator === "undefined" || !("vibrate" in navigator)) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration error
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    safeStorage.setItem("cai_sfx_enabled", enabled ? "true" : "false");
    if (enabled) {
      this.getAudioContext();
      this.playClick();
      this.triggerHaptic(25);
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
    this.triggerHaptic(12);
    if (!this.isEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = this.profile === "penetrating" ? 1100 : 800;
      const targetFreq = this.profile === "penetrating" ? 440 : 320;

      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + 0.015);

      gain.gain.setValueAtTime(this.profile === "penetrating" ? 0.12 : 0.08, ctx.currentTime);
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
    this.triggerHaptic([20, 30, 20]);
    if (!this.isEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      const mult = this.profile === "penetrating" ? 1.25 : 1.0;

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(987.77 * mult, now);
      osc1.frequency.exponentialRampToValueAtTime(1318.51 * mult, now + 0.04);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1318.51 * mult, now);
      osc2.frequency.exponentialRampToValueAtTime(1760.0 * mult, now + 0.04);

      gain.gain.setValueAtTime(this.profile === "penetrating" ? 0.15 : 0.12, now);
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
    this.triggerHaptic([40, 50, 40]);
    if (!this.isEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = this.profile === "penetrating" ? 620 : 440;
      const endFreq = this.profile === "penetrating" ? 310 : 220;

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.06);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = this.profile === "penetrating" ? 1600 : 1100;

      gain.gain.setValueAtTime(this.profile === "penetrating" ? 0.14 : 0.09, now);
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
