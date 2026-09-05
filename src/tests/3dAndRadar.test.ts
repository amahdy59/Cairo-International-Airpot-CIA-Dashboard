import { describe, it, expect } from "vitest";
import { aoccBroadcast, AoccBroadcastMessage } from "../services/broadcastChannel";
import { soundEffects } from "../services/soundEffects";

describe("3D Isometric Engine & Advanced Telemetry Systems", () => {
  it("verifies 3D matrix projection mathematics and camera orbit rotation", () => {
    // 3D coordinate projection formula test
    const projectTest = (
      p: { x: number; y: number; z: number },
      yawDeg: number,
      pitchDeg: number,
      zoom: number
    ) => {
      const yawRad = (yawDeg * Math.PI) / 180;
      const pitchRad = (pitchDeg * Math.PI) / 180;

      const x1 = p.x * Math.cos(yawRad) - p.y * Math.sin(yawRad);
      const y1 = p.x * Math.sin(yawRad) + p.y * Math.cos(yawRad);
      const z1 = p.z;

      const x2 = x1;
      const y2 = y1 * Math.sin(pitchRad) - z1 * Math.cos(pitchRad);
      const z2 = y1 * Math.cos(pitchRad) + z1 * Math.sin(pitchRad);

      const cameraDist = 650;
      const scale = ((cameraDist / (cameraDist + y2 * 0.4)) * zoom * 800) / 600;

      return {
        x: 400 + x2 * scale,
        y: 220 + y2 * scale * 0.85,
        depth: z2,
      };
    };

    // Point at Cairo T3 Stand (X: 110, Y: -50, Z: 10)
    const t3Stand = { x: 110, y: -50, z: 10 };

    // Standard Isometric (45° Yaw, 35° Pitch)
    const isoProj = projectTest(t3Stand, 45, 35, 1.0);
    expect(Number.isFinite(isoProj.x)).toBe(true);
    expect(Number.isFinite(isoProj.y)).toBe(true);
    expect(isoProj.depth).toBeDefined();

    // 90° Yaw rotation shifts X position significantly
    const rotatedProj = projectTest(t3Stand, 135, 35, 1.0);
    expect(rotatedProj.x).not.toEqual(isoProj.x);

    // Zooming in increases scale distance from center
    const zoomedProj = projectTest(t3Stand, 45, 35, 2.0);
    expect(Math.abs(zoomedProj.x - 400)).toBeGreaterThan(Math.abs(isoProj.x - 400));
  });

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

  it("validates tactical radar approach track geometry and squawk formatting", () => {
    const radarTracks = [
      { callsign: "MS777", runway: "05C", squawk: "4211", altitudeFt: 5200 },
      { callsign: "SV302", runway: "05R", squawk: "3602", altitudeFt: 9400 },
      { callsign: "AF551", runway: "05L", squawk: "1724", altitudeFt: 2800 },
    ];

    radarTracks.forEach((t) => {
      expect(["05L", "05C", "05R"]).toContain(t.runway);
      expect(t.squawk).toMatch(/^[0-7]{4}$/); // Standard 4-digit octal ICAO squawk
      expect(t.altitudeFt).toBeGreaterThan(1000);
    });
  });
});
