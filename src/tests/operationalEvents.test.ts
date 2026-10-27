import { describe, expect, it } from "vitest";
import { INITIAL_STAND_ASSIGNMENTS, simulateApronDiversion } from "../data/apronStands";
import { eventsForScenario } from "../context/operationalEvents";

describe("operational scenario consistency", () => {
  it("adds scenario-specific work without leaking it into the baseline", () => {
    const baseline = eventsForScenario("baseline");
    expect(baseline.some((event) => event.id === "t3-baggage")).toBe(false);
    expect(eventsForScenario("baggage-failure").some((event) => event.id === "t3-baggage")).toBe(true);
    expect(eventsForScenario("sandstorm").some((event) => event.id === "low-visibility")).toBe(true);
    expect(baseline.every((event) => event.source.en.includes("Training scenario"))).toBe(true);
  });

  it("moves the aircraft to a remote stand without mutating the original plan", () => {
    const moved = simulateApronDiversion(INITIAL_STAND_ASSIGNMENTS);
    expect(moved.find((stand) => stand.flight === "EK927")?.gate).toBe("Stand R-14");
    expect(moved.find((stand) => stand.standId === "S-306")?.status).toBe("standby");
    expect(INITIAL_STAND_ASSIGNMENTS.find((stand) => stand.flight === "EK927")?.gate).toBe("Gate 306");
    expect(simulateApronDiversion(moved)).toBe(moved);
  });
});
