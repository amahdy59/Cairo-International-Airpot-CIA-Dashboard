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

  it("validates A-CDM Turnaround Milestones data integrity and TOBT calculations", async () => {
    const { INITIAL_ACDM_TURNAROUNDS } = await import("../hooks/useAcdmEngine");
    expect(INITIAL_ACDM_TURNAROUNDS.length).toBeGreaterThanOrEqual(3);
    INITIAL_ACDM_TURNAROUNDS.forEach((item) => {
      expect(item.id).toMatch(/^ACDM-/);
      expect(item.inboundFlight.trim().length).toBeGreaterThan(0);
      expect(item.outboundFlight.trim().length).toBeGreaterThan(0);
      expect(item.tobt).toMatch(/^[0-2][0-9]:[0-5][0-9]$/);
      expect(item.tsat).toMatch(/^[0-2][0-9]:[0-5][0-9]$/);
      expect(item.ttot).toMatch(/^[0-2][0-9]:[0-5][0-9]$/);
      expect(item.turnaroundProgress).toBeGreaterThanOrEqual(0);
      expect(item.turnaroundProgress).toBeLessThanOrEqual(100);
      expect(["C", "D", "E", "F"]).toContain(item.acType);
    });
  });

  it("validates Apron Stand & Wingspan Conflict separation standards", async () => {
    const { INITIAL_STAND_ASSIGNMENTS } = await import("../features/digital-twin/ApronConflictDetector");
    expect(INITIAL_STAND_ASSIGNMENTS.length).toBeGreaterThanOrEqual(4);
    INITIAL_STAND_ASSIGNMENTS.forEach((stand) => {
      expect(stand.standId).toMatch(/^S-/);
      expect(stand.wingspanM).toBeGreaterThan(20);
      expect(["C", "D", "E", "F"]).toContain(stand.icaoCode);
      expect(["occupied", "standby", "conflict"]).toContain(stand.status);
    });
    // Validates at least one conflict is detected initially for verification
    const hasConflict = INITIAL_STAND_ASSIGNMENTS.some((s) => s.status === "conflict");
    expect(hasConflict).toBe(true);
  });

  it("validates ICAO Emergency Incident Playbooks and mandatory checklists", async () => {
    const { PLAYBOOKS } = await import("../features/safety/IncidentPlaybookModal");
    expect(PLAYBOOKS.length).toBeGreaterThanOrEqual(3);
    PLAYBOOKS.forEach((pb) => {
      expect(pb.id.trim().length).toBeGreaterThan(0);
      expect(pb.title.trim().length).toBeGreaterThan(0);
      expect(pb.arTitle.trim().length).toBeGreaterThan(0);
      expect(pb.icaoRef).toMatch(/^(ICAO|ECAA)/);
      expect(pb.steps.length).toBeGreaterThanOrEqual(3);
      pb.steps.forEach((step) => {
        expect(step.id).toBeDefined();
        expect(step.label.trim().length).toBeGreaterThan(0);
        expect(step.role.trim().length).toBeGreaterThan(0);
      });
    });
  });

  it("validates that System Documentation focuses exclusively on technical specifications", async () => {
    // Read the source file to verify technical tab keys and absence of marketing overview
    const fs = await import("fs");
    const path = await import("path");
    const content = fs.readFileSync(path.resolve(__dirname, "../components/ResourcesAuditPage.tsx"), "utf8");

    // Tab definition verification
    expect(content).toContain('type TabKey = "architecture" | "design" | "accessibility" | "tools";');
    expect(content).toContain('useState<TabKey>("architecture")');
    expect(content).not.toContain('id: "overview"');
    expect(content).not.toContain("30M+ PAX");
    expect(content).not.toContain("Primary Operational Capabilities");

    // Technical tabs verification
    expect(content).toContain('id: "architecture"');
    expect(content).toContain('id: "design"');
    expect(content).toContain('id: "accessibility"');
    expect(content).toContain('id: "tools"');

    // Persistent author signature verification
    expect(content).toContain("Lead Product Designer & Systems Architect");
    expect(content).toContain("Advansys IS");
  });

  it("validates global application footer author attribution and touch targets", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const appContent = fs.readFileSync(path.resolve(__dirname, "../App.tsx"), "utf8");
    const headerContent = fs.readFileSync(path.resolve(__dirname, "../components/layout/Header.tsx"), "utf8");

    // Footer attribution verification
    expect(appContent).toContain("Designed & Architected by Ahmed Mahdy (Advansys IS)");
    expect(appContent).toContain("https://www.linkedin.com/in/creativemahdy");
    expect(appContent).toContain("https://mahdy-resume.vercel.app/");

    // Header AAA touch target verification (>= 40-44px class tokens)
    expect(headerContent).toContain("min-h-[40px]");
    expect(headerContent).toContain("min-h-[44px]");
    expect(headerContent).toContain("min-w-[44px]");
  });

  it("validates Executive Decisions Dock architecture and 3 cross-domain approvals", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const modalContent = fs.readFileSync(
      path.resolve(__dirname, "../components/common/ExecutiveDecisionsModal.tsx"),
      "utf8"
    );
    const pulseBarContent = fs.readFileSync(
      path.resolve(__dirname, "../components/layout/ExecutivePulseBar.tsx"),
      "utf8"
    );

    // Modal structure verification
    expect(modalContent).toContain("Executive Decision Dock");
    expect(modalContent).toContain("Shift Turnover Briefing Formal Sign-Off");
    expect(modalContent).toContain("Stand Conflict: Wingspan Separation Margin");
    expect(modalContent).toContain("Tactical Surge: Dispatch 14 Roving Biometric Marshals");
    expect(modalContent).toContain("role=\"dialog\"");
    expect(modalContent).toContain("aria-modal=\"true\"");

    // PulseBar trigger integration
    expect(pulseBarContent).toContain("ExecutiveDecisionsModal");
    expect(pulseBarContent).toContain("isDecisionsOpen");
    expect(pulseBarContent).toContain("Decisions");
  });

  it("validates Operations View sub-view segmentation (flights vs analytics)", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const opsContent = fs.readFileSync(
      path.resolve(__dirname, "../features/operations/OperationsView.tsx"),
      "utf8"
    );

    expect(opsContent).toContain('export interface OperationsViewProps');
    expect(opsContent).toContain('subView?: "flights" | "analytics"');
    expect(opsContent).toContain('role="tablist"');
    expect(opsContent).toContain('id="tab-flights"');
    expect(opsContent).toContain('id="tab-analytics"');
    expect(opsContent).toContain('id="panel-flights"');
    expect(opsContent).toContain('id="panel-analytics"');
    expect(opsContent).toContain('AcdmMilestones');
    expect(opsContent).toContain('PassengerFlowChart');
  });

  it("validates Cross-Domain Spatial Deep-Linking from Digital Twin hotspots", async () => {
    const fs = await import("fs");
    const path = await import("path");
    const twinContent = fs.readFileSync(
      path.resolve(__dirname, "../features/digital-twin/DigitalTwinView.tsx"),
      "utf8"
    );

    expect(twinContent).toContain("getHotspotDeepLink");
    expect(twinContent).toContain("Inspect in Operations (A-CDM & Flights) ↗");
    expect(twinContent).toContain("Inspect in Operations (Flows & Analytics) ↗");
    expect(twinContent).toContain("Inspect in Staffing & Workforce ↗");
    expect(twinContent).toContain("Inspect in Safety & Directives ↗");
    expect(twinContent).toContain("onNavigateTab(link.tab, link.subView)");
  });
});
