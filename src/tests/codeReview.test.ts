import { describe, it, expect } from "vitest";
import { scenes, departures, arrivals, drillScenarios, arText } from "../data";
import { localize, formatCairoTime } from "../utils/helpers";
import { safeStorage } from "../utils/safeStorage";

describe("Code Review & Telemetry Data Integrity", () => {
  it("validates that all scenes have valid coordinates, non-empty labels, and hotspots", () => {
    expect(scenes.length).toBeGreaterThanOrEqual(3);
    scenes.forEach((scene) => {
      expect(scene.id).toBeDefined();
      expect(scene.title.trim().length).toBeGreaterThan(0);
      expect(scene.summary.trim().length).toBeGreaterThan(0);
      expect(scene.hotspots.length).toBeGreaterThan(0);

      scene.hotspots.forEach((spot) => {
        expect(spot.id).toBeDefined();
        expect(spot.cx).toBeGreaterThanOrEqual(0);
        expect(spot.cx).toBeLessThanOrEqual(100);
        expect(spot.cy).toBeGreaterThanOrEqual(0);
        expect(spot.cy).toBeLessThanOrEqual(100);
        expect(["critical", "warning", "good", "info", "offline"]).toContain(spot.status);
      });
    });
  });

  it("validates that all flight schedules contain valid times, gates, and statuses", () => {
    expect(departures.length).toBeGreaterThan(0);
    expect(arrivals.length).toBeGreaterThan(0);

    [...departures, ...arrivals].forEach((flight) => {
      expect(flight.flight).toMatch(/^[A-Z0-9]{2,3}\s?[0-9]{1,4}$/);
      expect(flight.city.trim().length).toBeGreaterThan(0);
      expect(flight.gate.trim().length).toBeGreaterThan(0);
      expect(flight.time).toMatch(/^[0-2][0-9]:[0-5][0-9]$/);
      expect(["ok", "warn", "crit", "info"]).toContain(flight.tone);
    });
  });

  it("validates that all drill scenarios have required metadata, tone, and directives", () => {
    expect(drillScenarios.length).toBeGreaterThanOrEqual(2);
    const baseline = drillScenarios.find((sc) => sc.id === "baseline");
    expect(baseline).toBeDefined();
    expect(baseline?.tone).toBe("ok");

    drillScenarios.forEach((sc) => {
      expect(sc.id.trim().length).toBeGreaterThan(0);
      expect(sc.title.en.trim().length).toBeGreaterThan(0);
      expect(sc.title.ar.trim().length).toBeGreaterThan(0);
      expect(["ok", "warn", "crit", "info"]).toContain(sc.tone);
    });
  });

  it("validates Arabic localization dictionary completeness", () => {
    expect(Object.keys(arText).length).toBeGreaterThan(10);
    expect(arText["Departures"]).toBe("المغادرات");
    expect(arText["Arrivals"]).toBe("الوصول");
    expect(arText["Flight"]).toBe("الرحلة");
    expect(arText["Gate"]).toBe("البوابة");
  });

  it("validates that formatCairoTime formats ISO strings reliably", () => {
    expect(formatCairoTime(undefined)).toBe("--");
    expect(formatCairoTime("invalid-date")).toBe("--");
    const testDate = new Date("2026-09-05T12:00:00Z").toISOString();
    const formatted = formatCairoTime(testDate);
    expect(formatted).toMatch(/^[0-2][0-9]:[0-5][0-9]$/);
  });

  it("validates that localize handles strings, objects, and undefined safely", () => {
    expect(localize("raw string", "en")).toBe("raw string");
    expect(localize("نص مباشر", "ar")).toBe("نص مباشر");
    expect(localize({ en: "Cairo", ar: "القاهرة" }, "en")).toBe("Cairo");
    expect(localize({ en: "Cairo", ar: "القاهرة" }, "ar")).toBe("القاهرة");
    expect(localize(undefined, "en")).toBe("");
    expect(localize(null, "ar")).toBe("");
  });

  it("validates safeStorage reliability and in-memory resilience", () => {
    safeStorage.setItem("test_key_ci", "operational_value");
    expect(safeStorage.getItem("test_key_ci")).toBe("operational_value");
    safeStorage.removeItem("test_key_ci");
    expect(safeStorage.getItem("test_key_ci")).toBeNull();
  });
});
