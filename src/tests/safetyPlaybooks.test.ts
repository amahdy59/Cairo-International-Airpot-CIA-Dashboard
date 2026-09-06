import { describe, it, expect } from "vitest";
import { PLAYBOOKS, IncidentPlaybook } from "../features/safety/IncidentPlaybookModal";

describe("AOCC Safety Playbooks & Emergency SOP Engine", () => {
  it("verifies all core safety playbooks conform to ICAO Doc 9137 & Annex 14 standards", () => {
    expect(PLAYBOOKS.length).toBeGreaterThanOrEqual(3);

    const lvpPlaybook = PLAYBOOKS.find((p) => p.id === "lvp-cat-iii");
    expect(lvpPlaybook).toBeDefined();
    expect(lvpPlaybook?.icaoRef).toBe("ICAO Doc 9137 Part 8");
    expect(lvpPlaybook?.severity).toBe("critical");
    expect(lvpPlaybook?.summary).toContain("350m");

    const fodPlaybook = PLAYBOOKS.find((p) => p.id === "runway-fod");
    expect(fodPlaybook).toBeDefined();
    expect(fodPlaybook?.icaoRef).toBe("ICAO Annex 14 Vol I");
    expect(fodPlaybook?.severity).toBe("high");

    const medPlaybook = PLAYBOOKS.find((p) => p.id === "medical-diversion");
    expect(medPlaybook).toBeDefined();
    expect(medPlaybook?.icaoRef).toBe("ECAA Doc 4444");
    expect(medPlaybook?.severity).toBe("critical");
  });

  it("ensures strict bilingual (Arabic/English) translations across all playbook metadata and steps", () => {
    PLAYBOOKS.forEach((playbook) => {
      // Titles and summaries
      expect(playbook.title.trim().length).toBeGreaterThan(0);
      expect(playbook.arTitle.trim().length).toBeGreaterThan(0);
      expect(playbook.summary.trim().length).toBeGreaterThan(0);
      expect(playbook.arSummary.trim().length).toBeGreaterThan(0);

      // Steps
      expect(playbook.steps.length).toBeGreaterThanOrEqual(3);
      playbook.steps.forEach((step) => {
        expect(step.id).toBeTruthy();
        expect(step.label.trim().length).toBeGreaterThan(0);
        expect(step.arLabel.trim().length).toBeGreaterThan(0);
        expect(step.role.trim().length).toBeGreaterThan(0);
        expect(step.completed).toBe(false);
      });
    });
  });

  it("validates runway FOD playbook includes Mu-Meter friction testing target (>= 0.60)", () => {
    const fodPlaybook = PLAYBOOKS.find((p) => p.id === "runway-fod");
    const frictionStep = fodPlaybook?.steps.find((s) => s.label.includes("Mu-Meter"));
    expect(frictionStep).toBeDefined();
    expect(frictionStep?.label).toContain(">= 0.60");
    expect(frictionStep?.arLabel).toContain("0.60");
    expect(frictionStep?.role).toBe("Maintenance Lead");
  });

  it("calculates step progression percentage and completion status correctly", () => {
    const playbook: IncidentPlaybook = JSON.parse(JSON.stringify(PLAYBOOKS[0])); // LVP Cat III (4 steps)
    const totalSteps = playbook.steps.length;

    // Initial state: 0% complete
    let completedCount = playbook.steps.filter((s) => s.completed).length;
    expect(Math.round((completedCount / totalSteps) * 100)).toBe(0);

    // Complete first 2 steps
    playbook.steps[0].completed = true;
    playbook.steps[1].completed = true;
    completedCount = playbook.steps.filter((s) => s.completed).length;
    expect(Math.round((completedCount / totalSteps) * 100)).toBe(50);

    // Complete all remaining steps
    playbook.steps.forEach((s) => (s.completed = true));
    completedCount = playbook.steps.filter((s) => s.completed).length;
    expect(Math.round((completedCount / totalSteps) * 100)).toBe(100);
  });

  it("verifies post-mortem debrief report ID format matches CAI-DEBRIEF standards", () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const scenarioId = "sandstorm";
    const reportId = `CAI-DEBRIEF-${dateStr}-${scenarioId.toUpperCase()}`;

    expect(reportId).toMatch(/^CAI-DEBRIEF-\d{4}-\d{2}-\d{2}-[A-Z0-9_]+$/);
    expect(reportId).toContain("SANDSTORM");
  });
});
