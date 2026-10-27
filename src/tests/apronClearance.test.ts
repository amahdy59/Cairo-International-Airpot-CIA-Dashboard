import { describe, it, expect } from 'vitest';
import { INITIAL_STAND_ASSIGNMENTS, simulateApronDiversion } from '../features/digital-twin/ApronConflictDetector';
import { INITIAL_ACDM_TURNAROUNDS } from '../hooks/useAcdmEngine';

describe('Apron stand training scenario', () => {
  it('keeps aircraft code and wingspan examples in plausible ranges', () => {
    INITIAL_STAND_ASSIGNMENTS.forEach((stand) => {
      expect(stand.standId).toMatch(/^S-[0-9]{3}$/);
      expect(stand.wingspanM).toBeGreaterThan(15);
      expect(stand.wingspanM).toBeLessThan(85);

      if (stand.icaoCode === 'C') {
        expect(stand.wingspanM).toBeLessThan(36.0);
      } else if (stand.icaoCode === 'D') {
        expect(stand.wingspanM).toBeGreaterThanOrEqual(36.0);
        expect(stand.wingspanM).toBeLessThan(52.0);
      } else if (stand.icaoCode === 'E') {
        expect(stand.wingspanM).toBeGreaterThanOrEqual(52.0);
        expect(stand.wingspanM).toBeLessThan(65.0);
      } else if (stand.icaoCode === 'F') {
        expect(stand.wingspanM).toBeGreaterThanOrEqual(65.0);
        expect(stand.wingspanM).toBeLessThan(80.0);
      }
    });
  });

  it('identifies only the flagged pair and does not invent a measured clearance', () => {
    const conflicts = INITIAL_STAND_ASSIGNMENTS.filter((s) => s.status === 'conflict');
    expect(conflicts.length).toBe(2);

    const stand305 = INITIAL_STAND_ASSIGNMENTS.find((s) => s.standId === 'S-305');
    const stand306 = INITIAL_STAND_ASSIGNMENTS.find((s) => s.standId === 'S-306');

    expect(stand305?.status).toBe('conflict');
    expect(stand306?.status).toBe('conflict');

    expect(stand305?.conflictWith).toContain('S-306');
    expect(stand306?.conflictWith).toContain('S-305');
    expect(stand305?.conflictReason).not.toMatch(/\d+(?:\.\d+)?m/);
    expect(INITIAL_STAND_ASSIGNMENTS.find((s) => s.standId === 'S-307')?.status).toBe('occupied');
  });

  it('simulates one move while leaving the original stand empty', () => {
    const resolvedStands = simulateApronDiversion(INITIAL_STAND_ASSIGNMENTS);
    const remainingConflicts = resolvedStands.filter((s) => s.status === 'conflict');
    expect(remainingConflicts.length).toBe(0);

    const stand306 = resolvedStands.find((s) => s.standId === 'S-306');
    expect(stand306?.gate).toBe('Gate 306');
    expect(stand306?.conflictWith).toBeUndefined();
    expect(stand306?.status).toBe('standby');
    expect(stand306?.flight).toBe('');

    const remote = resolvedStands.find((s) => s.standId === 'S-R14');
    expect(remote?.gate).toBe('Stand R-14');
    expect(remote?.flight).toBe('EK927');
    expect(resolvedStands.filter((s) => s.flight === 'EK927')).toHaveLength(1);
    expect(simulateApronDiversion(resolvedStands)).toBe(resolvedStands);

    const stand305 = resolvedStands.find((s) => s.standId === 'S-305');
    expect(stand305?.conflictWith).toBeUndefined();
    expect(stand305?.status).toBe('occupied');
  });

  it('shows the same stand for a flight in the digital twin and turnaround sample', () => {
    for (const turnaround of INITIAL_ACDM_TURNAROUNDS) {
      const flight = turnaround.inboundFlight.split(' ')[0];
      const mapped = INITIAL_STAND_ASSIGNMENTS.find((stand) => stand.flight === flight);
      if (mapped) expect(turnaround.stand).toBe(mapped.gate);
    }
  });
});
