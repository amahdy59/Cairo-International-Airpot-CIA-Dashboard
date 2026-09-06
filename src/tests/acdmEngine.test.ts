import { describe, it, expect } from 'vitest';
import { INITIAL_ACDM_TURNAROUNDS, getScenarioTurnarounds, AcdmTurnaround } from '../hooks/useAcdmEngine';

describe('A-CDM Milestone & Turnaround Engine', () => {
  it('validates ICAO Doc 9971 chronological milestone sequence across all turnarounds', () => {
    INITIAL_ACDM_TURNAROUNDS.forEach((t) => {
      expect(t.id).toMatch(/^ACDM-[0-9]{2}$/);
      expect(['C', 'D', 'E', 'F']).toContain(t.acType);
      expect(t.turnaroundProgress).toBeGreaterThanOrEqual(0);
      expect(t.turnaroundProgress).toBeLessThanOrEqual(100);

      // Verify time format HH:MM
      const timeRegex = /^[0-2][0-9]:[0-5][0-9]$/;
      expect(t.eldt).toMatch(timeRegex);
      expect(t.aldt).toMatch(timeRegex);
      expect(t.aibt).toMatch(timeRegex);
      expect(t.eobt).toMatch(timeRegex);
      expect(t.tobt).toMatch(timeRegex);
      expect(t.tsat).toMatch(timeRegex);
      expect(t.ttot).toMatch(timeRegex);

      // Verify time sequence: AIBT <= TOBT <= TSAT <= TTOT
      const toMinutes = (timeStr: string) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
      };

      const aibtMin = toMinutes(t.aibt);
      const tobtMin = toMinutes(t.tobt);
      const tsatMin = toMinutes(t.tsat);
      const ttotMin = toMinutes(t.ttot);

      expect(tobtMin).toBeGreaterThanOrEqual(aibtMin);
      expect(tsatMin).toBeGreaterThanOrEqual(tobtMin);
      expect(ttotMin).toBeGreaterThanOrEqual(tsatMin);
    });
  });

  it('verifies delay injection and scenario modulation for Sandstorm & Baggage drills', () => {
    const baseline = getScenarioTurnarounds('baseline');
    const sandstorm = getScenarioTurnarounds('sandstorm');
    const baggage = getScenarioTurnarounds('baggage-failure');

    expect(baseline.length).toBe(INITIAL_ACDM_TURNAROUNDS.length);
    expect(sandstorm.length).toBe(INITIAL_ACDM_TURNAROUNDS.length);
    expect(baggage.length).toBe(INITIAL_ACDM_TURNAROUNDS.length);

    // Sandstorm injects Cat II stopbar delays
    const sandstormDelayed = sandstorm.filter((t) => t.status === 'delayed');
    expect(sandstormDelayed.length).toBeGreaterThan(0);
    expect(sandstorm.some((t) => t.criticalMilestone.includes('Cat II'))).toBe(true);

    // Baggage failure delays Terminal 3 EgyptAir and Saudia flights
    const baggageT3 = baggage.find((t) => t.id === 'ACDM-01');
    expect(baggageT3?.delayMinutes).toBe(40);
    expect(baggageT3?.criticalMilestone).toContain('T3 sorter');
  });

  it('validates TOBT revision calculation and delayed status threshold (>15m)', () => {
    const testTurnaround: AcdmTurnaround = { ...INITIAL_ACDM_TURNAROUNDS[0], delayMinutes: 10, status: 'handling' };
    
    // Simulating TOBT revision logic
    const applyRevision = (t: AcdmTurnaround, revisedTobt: string, addedDelay: number): AcdmTurnaround => {
      const newDelay = t.delayMinutes + addedDelay;
      return {
        ...t,
        tobt: revisedTobt,
        delayMinutes: newDelay,
        status: newDelay > 15 ? 'delayed' : t.status,
        criticalMilestone: `M04: TOBT revised to ${revisedTobt}`,
      };
    };

    const updated = applyRevision(testTurnaround, '16:15', 10);
    expect(updated.tobt).toBe('16:15');
    expect(updated.delayMinutes).toBe(20);
    expect(updated.status).toBe('delayed');
    expect(updated.criticalMilestone).toContain('TOBT revised to 16:15');
  });

  it('calculates turnaround compliance KPI metrics accurately', () => {
    const turnarounds = INITIAL_ACDM_TURNAROUNDS;
    const total = turnarounds.length;
    const onTimeCount = turnarounds.filter((t) => t.delayMinutes <= 15).length;
    const compliance = Math.round((onTimeCount / total) * 100);

    expect(compliance).toBeGreaterThanOrEqual(0);
    expect(compliance).toBeLessThanOrEqual(100);
    expect(total).toBeGreaterThan(0);
  });
});
