import { describe, it, expect } from "vitest";
import { drillScenarios, departures, arrivals, gateWaitRows } from "../data";
import { getScenarioTurnarounds } from "../hooks/useAcdmEngine";

describe("Universal Simulation Reactivity & Cross-System Modulation", () => {
  it("provides distinct reactive datasets for baseline, sandstorm, and baggage-failure scenarios", () => {
    const baseline = drillScenarios.find((s) => s.id === "baseline");
    const sandstorm = drillScenarios.find((s) => s.id === "sandstorm");
    const baggage = drillScenarios.find((s) => s.id === "baggage-failure");

    expect(baseline).toBeDefined();
    expect(sandstorm).toBeDefined();
    expect(baggage).toBeDefined();

    // Verify Influx Forecast differs between baseline and sandstorm
    expect(sandstorm?.influxForecast).toBeDefined();
    expect(sandstorm?.influxForecast?.[0].forecast).not.toEqual(baseline?.influxForecast?.[0].forecast);

    // Verify Passenger Flow sparklines differ
    expect(sandstorm?.flowData).toBeDefined();
    expect(baggage?.flowData).toBeDefined();
    expect(baggage?.flowData?.sparkline).not.toEqual(baseline?.flowData?.sparkline);

    // Verify Queue Pressure rows differ (e.g. Baggage failure spikes T3 queues)
    const baggageT3 = baggage?.queueRows?.find((q) => q.terminal === "T3");
    const baselineT3 = baseline?.queueRows?.find((q) => q.terminal === "T3");
    expect(baggageT3?.total).toBeGreaterThan(baselineT3?.total || 0);

    // Verify Safety checks react to drill scenario
    expect(sandstorm?.safetyChecks?.some((c) => c.title.includes("Cat II") || c.badge.includes("LVO"))).toBe(true);
    expect(baggage?.safetyChecks?.some((c) => c.title.includes("BHS") || c.title.includes("Baggage") || c.title.includes("Sorter"))).toBe(true);
  });

  it("updates flight departures and arrivals according to operational drill scenarios", () => {
    const sandstorm = drillScenarios.find((s) => s.id === "sandstorm");
    const baggage = drillScenarios.find((s) => s.id === "baggage-failure");

    expect(sandstorm?.departures?.length).toBeGreaterThan(0);
    expect(sandstorm?.arrivals?.length).toBeGreaterThan(0);

    // Sandstorm departures should reflect weather holds / delays
    const sandstormDelayed = sandstorm?.departures?.filter((f) => f.tone === "crit" || f.tone === "warn");
    expect(sandstormDelayed?.length).toBeGreaterThan(0);

    // Baggage failure arrivals should reflect baggage offload delays
    const baggageDelayed = baggage?.arrivals?.filter((f) => f.status.includes("Baggage"));
    expect(baggageDelayed?.length).toBeGreaterThan(0);
  });

  it("modulates A-CDM turnaround milestone delays and timestamps dynamically", () => {
    const baselineTurnarounds = getScenarioTurnarounds("baseline");
    const sandstormTurnarounds = getScenarioTurnarounds("sandstorm");
    const baggageTurnarounds = getScenarioTurnarounds("baggage-failure");

    expect(baselineTurnarounds.length).toBeGreaterThan(0);
    expect(sandstormTurnarounds.length).toBeGreaterThan(0);
    expect(baggageTurnarounds.length).toBeGreaterThan(0);

    // Sandstorm should inject significant delay minutes into turnarounds
    expect(sandstormTurnarounds[0].delayMinutes).toBeGreaterThan(baselineTurnarounds[0].delayMinutes);
    // Baggage failure should have delays reflected in turnarounds
    expect(baggageTurnarounds.some((t) => t.delayMinutes > 0)).toBe(true);
  });

  it("correctly scopes flight boards and gate wait rows when filtering by terminal", () => {
    // All baseline departures and gate waits must have terminal assigned
    departures.forEach((f) => {
      expect(["T1", "T2", "T3"]).toContain(f.terminal);
    });
    arrivals.forEach((f) => {
      expect(["T1", "T2", "T3"]).toContain(f.terminal);
    });
    gateWaitRows.forEach((g) => {
      expect(["T1", "T2", "T3"]).toContain(g.terminal);
    });

    // Filtering by T1
    const t1Gates = gateWaitRows.filter((g) => g.terminal === "T1");
    expect(t1Gates.length).toBeGreaterThan(0);
    t1Gates.forEach((g) => expect(g.terminal).toBe("T1"));

    // Filtering by T2
    const t2Departures = departures.filter((f) => f.terminal === "T2");
    expect(t2Departures.length).toBeGreaterThan(0);
    t2Departures.forEach((f) => expect(f.terminal).toBe("T2"));

    // Filtering by T3
    const t3Arrivals = arrivals.filter((f) => f.terminal === "T3");
    expect(t3Arrivals.length).toBeGreaterThan(0);
    t3Arrivals.forEach((f) => expect(f.terminal).toBe("T3"));
  });

  it("recommends appropriate emergency surge crews during scenario drills", () => {
    const sandstorm = drillScenarios.find((s) => s.id === "sandstorm");
    const baggage = drillScenarios.find((s) => s.id === "baggage-failure");

    // Sandstorm recommends apron towing & de-sand crew (SURGE-BRAVO)
    expect(sandstorm?.recommendedSurgeUnitIds).toContain("SURGE-BRAVO");
    // Baggage failure recommends rapid sorter tech crew (SURGE-DELTA)
    expect(baggage?.recommendedSurgeUnitIds).toContain("SURGE-DELTA");
  });
});
