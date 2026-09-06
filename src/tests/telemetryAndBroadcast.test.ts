import { describe, it, expect } from "vitest";
import { aoccBroadcast, AoccBroadcastMessage } from "../services/broadcastChannel";
import { soundEffects } from "../services/soundEffects";

describe("AOCC Telemetry & Multi-Screen Broadcast Systems", () => {
  it("verifies BroadcastChannel message handling across multi-monitor video walls", async () => {
    const secondaryDisplay = new BroadcastChannel("cia-aocc-telemetry");

    let receivedBySecondary: AoccBroadcastMessage | null = null;
    secondaryDisplay.onmessage = (event) => {
      receivedBySecondary = event.data;
    };

    let receivedByAoccService: AoccBroadcastMessage | null = null;
    const unsubscribe = aoccBroadcast.subscribe((msg) => {
      receivedByAoccService = msg;
    });

    // 1. Broadcast from Primary AOCC -> Secondary Display receives it
    aoccBroadcast.broadcast({ type: "SCENARIO_CHANGE", scenarioId: "sandstorm" });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(receivedBySecondary).toEqual({ type: "SCENARIO_CHANGE", scenarioId: "sandstorm" });

    // 2. Broadcast from Secondary Display -> Primary AOCC receives it
    secondaryDisplay.postMessage({ type: "TERMINAL_CHANGE", terminal: "T3" });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(receivedByAoccService).toEqual({ type: "TERMINAL_CHANGE", terminal: "T3" });

    // 3. Test wave change broadcast
    aoccBroadcast.broadcast({ type: "WAVE_CHANGE", waveId: "night" });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(receivedBySecondary).toEqual({ type: "WAVE_CHANGE", waveId: "night" });

    // 4. Test unsubscribe
    unsubscribe();
    receivedByAoccService = null;
    secondaryDisplay.postMessage({ type: "DISPATCH_UNIT", unitId: "falcon-7" });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(receivedByAoccService).toBeNull();

    secondaryDisplay.close();
  }, 20000);

  it("verifies sound effect profile selection, earcon dispatches, and haptic controls", () => {
    let notified = false;
    const unsub = soundEffects.subscribe(() => {
      notified = true;
    });

    // Toggle sound profile
    soundEffects.setProfile("penetrating");
    expect(soundEffects.getProfile()).toBe("penetrating");
    expect(notified).toBe(true);

    notified = false;
    soundEffects.setProfile("chime");
    expect(soundEffects.getProfile()).toBe("chime");
    expect(notified).toBe(true);

    // Enabled state
    soundEffects.setEnabled(false);
    expect(soundEffects.getIsEnabled()).toBe(false);
    soundEffects.setEnabled(true);
    expect(soundEffects.getIsEnabled()).toBe(true);

    // Toggle method
    const toggled = soundEffects.toggle();
    expect(toggled).toBe(false);
    expect(soundEffects.getIsEnabled()).toBe(false);
    soundEffects.setEnabled(true);

    // Haptics toggle
    soundEffects.setHapticsEnabled(true);
    expect(soundEffects.getIsHapticsEnabled()).toBe(true);
    soundEffects.setHapticsEnabled(false);
    expect(soundEffects.getIsHapticsEnabled()).toBe(false);
    soundEffects.setHapticsEnabled(true);

    // Earcons execution does not throw
    expect(() => soundEffects.playClick()).not.toThrow();
    expect(() => soundEffects.playDispatch()).not.toThrow();
    expect(() => soundEffects.playAlert()).not.toThrow();

    unsub();
  });
});
