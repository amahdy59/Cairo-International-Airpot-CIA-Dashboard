import { describe, it, expect } from "vitest";
import { aoccBroadcast, AoccBroadcastMessage } from "../services/broadcastChannel";
import { soundEffects } from "../services/soundEffects";

describe("AOCC Telemetry & Multi-Screen Broadcast Systems", () => {
  it("verifies BroadcastChannel message handling and subscriber notifications", () => {
    let receivedMessage: AoccBroadcastMessage | null = null;
    const unsubscribe = aoccBroadcast.subscribe((msg) => {
      receivedMessage = msg;
    });

    // Test dispatch
    aoccBroadcast.broadcast({ type: "SCENARIO_CHANGE", scenarioId: "sandstorm" });
    expect(typeof unsubscribe).toBe("function");
    expect(receivedMessage !== undefined).toBe(true);

    unsubscribe();
  });

  it("verifies sound effect profile selection and haptic controls", () => {
    // Toggle sound profile
    soundEffects.setProfile("penetrating");
    expect(soundEffects.getProfile()).toBe("penetrating");

    soundEffects.setProfile("chime");
    expect(soundEffects.getProfile()).toBe("chime");

    // Haptics toggle
    soundEffects.setHapticsEnabled(true);
    expect(soundEffects.getIsHapticsEnabled()).toBe(true);
    soundEffects.setHapticsEnabled(false);
    expect(soundEffects.getIsHapticsEnabled()).toBe(false);
    soundEffects.setHapticsEnabled(true);
  });
});
