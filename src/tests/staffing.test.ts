import { describe, it, expect } from "vitest";
import { staffingShiftWaves, surgeCrewUnits, staffMembers, StaffingShiftWaveId, AirsideZoneId } from "../data";

describe("Staffing & Workforce Management Data & Logic Suite", () => {
  it("validates that all shift waves contain valid hours, non-zero staff allocations, and positive flight loads", () => {
    expect(staffingShiftWaves.length).toBe(3);

    const waveIds: StaffingShiftWaveId[] = ["morning", "midday", "night"];
    waveIds.forEach((id) => {
      const wave = staffingShiftWaves.find((w) => w.id === id);
      expect(wave).toBeDefined();
      expect(wave?.hours).toMatch(/^[0-2][0-9]:[0-5][0-9]\s-\s[0-2][0-9]:[0-5][0-9]$/);
      expect(wave?.requiredStaff).toBeGreaterThan(0);
      expect(wave?.allocatedStaff).toBeGreaterThan(0);
      expect(wave?.flightLoad).toBeGreaterThan(0);
      expect(wave?.leadCallsign.trim().length).toBeGreaterThan(0);
      expect(wave?.leadManager.en.trim().length).toBeGreaterThan(0);
      expect(wave?.leadManager.ar.trim().length).toBeGreaterThan(0);

      // Verify calculated ratio consistency
      const expectedRatio = Number((wave!.allocatedStaff / wave!.requiredStaff).toFixed(2));
      expect(Math.abs(wave!.coverageRatio - expectedRatio)).toBeLessThanOrEqual(0.05);
    });
  });

  it("identifies understaffed waves when coverage ratio is below 90%", () => {
    const middayWave = staffingShiftWaves.find((w) => w.id === "midday");
    expect(middayWave).toBeDefined();
    expect(middayWave!.coverageRatio).toBeLessThan(0.9);
    expect(middayWave!.statusTone).toBe("warn");
  });

  it("validates tactical surge crew units readiness and valid target zones", () => {
    expect(surgeCrewUnits.length).toBeGreaterThanOrEqual(4);

    const validZones: AirsideZoneId[] = ["T1", "T2", "T3", "RAMP", "SECURITY", "BAGGAGE", "ARFF"];

    surgeCrewUnits.forEach((unit) => {
      expect(unit.id).toMatch(/^SURGE-[A-Z]+$/);
      expect(validZones).toContain(unit.targetZone);
      expect(unit.headcount).toBeGreaterThanOrEqual(4);
      expect(unit.dispatchEtaMin).toBeGreaterThan(0);
      expect(unit.dispatchEtaMin).toBeLessThanOrEqual(5); // Emergency standard: <= 5 min
      expect(unit.status).toBe("ready");
      expect(unit.leadCallsign.trim().length).toBeGreaterThan(0);
      expect(unit.title.en.trim().length).toBeGreaterThan(0);
      expect(unit.title.ar.trim().length).toBeGreaterThan(0);
    });
  });

  it("validates staff roster member properties, unique IDs, and phone formats", () => {
    expect(staffMembers.length).toBeGreaterThanOrEqual(10);

    const ids = new Set<string>();

    staffMembers.forEach((member) => {
      expect(member.id).toMatch(/^STF-[0-9]{3}$/);
      expect(ids.has(member.id)).toBe(false);
      ids.add(member.id);

      expect(member.name.en.trim().length).toBeGreaterThan(0);
      expect(member.name.ar.trim().length).toBeGreaterThan(0);
      expect(member.callsign.trim().length).toBeGreaterThan(0);
      expect(member.phoneExt).toMatch(/^\+20\s\(2\)\s2265-[0-9]{4}$/);
      expect(member.safetyDaysZeroIncidents).toBeGreaterThanOrEqual(0);
      expect(["on_duty", "break", "dispatched", "standby"]).toContain(member.status);
      expect(["valid", "expiring_soon", "expired"]).toContain(member.certStatus);
    });
  });

  it("validates ICAO certification expiry day calculations and status classifications", () => {
    staffMembers.forEach((member) => {
      expect(member.icaoCertValidUntil).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (member.daysToCertExpiry < 0) {
        expect(member.certStatus).toBe("expired");
      } else if (member.daysToCertExpiry <= 30) {
        expect(member.certStatus).toBe("expiring_soon");
      } else {
        expect(member.certStatus).toBe("valid");
      }
    });

    // Ensure we have at least one test case for each status to verify UI tags
    const expiredCount = staffMembers.filter((m) => m.certStatus === "expired").length;
    const expiringSoonCount = staffMembers.filter((m) => m.certStatus === "expiring_soon").length;
    const validCount = staffMembers.filter((m) => m.certStatus === "valid").length;

    expect(expiredCount).toBeGreaterThanOrEqual(1);
    expect(expiringSoonCount).toBeGreaterThanOrEqual(1);
    expect(validCount).toBeGreaterThanOrEqual(5);
  });
});
