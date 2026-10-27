import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LocaleContext } from "../context/locale";
import { aircraftRiskRows, arrivals, departures, queueRows, staffMembers } from "../data";
import { FlightStatusChart } from "../features/operations/FlightStatusChart";
import { QueuePressureHeatmap } from "../features/operations/QueuePressureHeatmap";
import { AircraftRiskScatter } from "../features/safety/AircraftRiskScatter";
import { RosterStatusWaffle } from "../features/staffing/RosterStatusWaffle";
import { ForecastLineChart } from "../features/operations/ForecastLineChart";
import { TurnaroundTimeline } from "../features/operations/TurnaroundTimeline";
import { INITIAL_ACDM_TURNAROUNDS } from "../hooks/useAcdmEngine";
import { shiftClockTime, timeDeltaMinutes } from "../utils/operationalTime";

describe("data-led chart summaries", () => {
  it("recounts flight status when a scenario changes rows", () => {
    const baseline = renderToStaticMarkup(<FlightStatusChart departures={departures} arrivals={arrivals} />);
    expect(baseline).toContain("Departures: 4 flights; On track 2, In progress 1, Needs attention 1");
    const drill = renderToStaticMarkup(<FlightStatusChart departures={departures.map(row => ({ ...row, tone: "crit" }))} arrivals={arrivals} />);
    expect(drill).toContain("Departures: 4 flights; On track 0, In progress 0, Needs attention 4");
    expect(drill).not.toContain("NaN");
    const fewerArrivals = renderToStaticMarkup(<FlightStatusChart departures={departures} arrivals={arrivals.slice(0, 2)} />);
    expect(fewerArrivals).toContain("Arrivals: 2 flights;");
    expect(fewerArrivals).toContain("width:50%");
    const oneArrival = renderToStaticMarkup(<FlightStatusChart departures={departures} arrivals={arrivals.slice(0, 1)} />);
    expect(oneArrival).toContain("Arrivals: 1 flight;");
  });

  it("keeps the queue's independent overall index separate and respects terminal filtering", () => {
    const html = renderToStaticMarkup(<QueuePressureHeatmap rows={queueRows.filter(row => row.terminal === "T2")} activeTerminal="T2" />);
    expect(html).toContain("Overall");
    expect(html).toContain("T2 Overall: 89%");
    expect(html).not.toContain("T1 Check-in");
    expect(html).toContain('scope="col"');
    expect(html).toContain('scope="row"');
  });

  it("plots each aircraft using its real event count and risk score", () => {
    const html = renderToStaticMarkup(<AircraftRiskScatter rows={aircraftRiskRows} />);
    expect(html).toContain("SU-GBP 78%");
    expect(html).toContain("Horizontal axis: event count");
    for (const row of aircraftRiskRows) expect(html).toContain(row.reg);
    expect(html).not.toMatch(/NaN|Infinity/);
  });

  it("recounts sample roster availability after a status update, including Arabic", () => {
    const baseline = renderToStaticMarkup(<RosterStatusWaffle roster={staffMembers} />);
    expect(baseline).toContain("On duty 10, Dispatched 0, On break 1, Standby 1");
    const updated = renderToStaticMarkup(<LocaleContext.Provider value="ar"><RosterStatusWaffle roster={staffMembers.map(member => member.id === "STF-101" ? { ...member, status: "break" } : member)} /></LocaleContext.Provider>);
    expect(updated).toContain("في الخدمة 9");
    expect(updated).toContain("استراحة 2");
  });

  it("shows only meaningful capacity gaps and keeps exact hourly values available", () => {
    const html = renderToStaticMarkup(<ForecastLineChart data={[
      { time: "Now", current: 90, forecast: 100, modeledCapacity: 120 },
      { time: "+1h", current: 115, forecast: 145, modeledCapacity: 130 },
    ]} />);
    expect(html).toContain("Largest modeled shortfall:");
    expect(html).toContain("+15");
    expect(html).toContain("1 of 2 hourly periods");
    expect(html).toContain("Capacity");
    expect(html).toContain("Gap");
    expect(html).not.toMatch(/NaN|Infinity/);
    const ar = renderToStaticMarkup(<LocaleContext.Provider value="ar"><ForecastLineChart data={[{ time: "Now", current: 90, forecast: 100, modeledCapacity: 120 }]} /></LocaleContext.Provider>);
    expect(ar).toContain("التوقع ضمن السعة النموذجية");
  });

  it("distinguishes actual turnaround times from targets and handles midnight", () => {
    const html = renderToStaticMarkup(<TurnaroundTimeline item={INITIAL_ACDM_TURNAROUNDS[0]} />);
    expect(html).toContain("Actual");
    expect(html).toContain("Target");
    expect(html).toContain("14:22");
    expect(html).toContain("15:50");
    expect(timeDeltaMinutes("23:55", "00:10")).toBe(15);
    expect(shiftClockTime("23:55", 15)).toBe("00:10");
    expect(timeDeltaMinutes("14:20", "invalid")).toBeNull();
  });
});
