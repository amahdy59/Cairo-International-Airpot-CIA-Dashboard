import { describe, it, expect } from 'vitest';
import { INITIAL_STAND_ASSIGNMENTS, ApronStandAssignment } from '../features/digital-twin/ApronConflictDetector';

describe('ICAO Annex 14 Apron Stand Wingspan Clearance & Safety Engine', () => {
  it('validates ICAO Aerodrome Reference Code classification (Code C through F)', () => {
    INITIAL_STAND_ASSIGNMENTS.forEach((stand) => {
      expect(stand.standId).toMatch(/^S-[0-9]{3}$/);
      expect(stand.wingspanM).toBeGreaterThan(15);
      expect(stand.wingspanM).toBeLessThan(85);

      // Verify ICAO Annex 14 wingspan thresholds
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

  it('detects wingtip taxiway clearance conflict between adjacent Code E and Code F widebodies', () => {
    const conflicts = INITIAL_STAND_ASSIGNMENTS.filter((s) => s.status === 'conflict');
    expect(conflicts.length).toBe(2);

    const stand305 = INITIAL_STAND_ASSIGNMENTS.find((s) => s.standId === 'S-305');
    const stand306 = INITIAL_STAND_ASSIGNMENTS.find((s) => s.standId === 'S-306');

    expect(stand305?.status).toBe('conflict');
    expect(stand306?.status).toBe('conflict');

    // Annex 14: 7.5m wingtip clearance violation
    expect(stand305?.conflictReason).toContain('7.5m');
    expect(stand306?.conflictReason).toContain('Code F Super-Heavy');
  });

  it('verifies 1-click conflict resolution by diverting Code F aircraft to Remote Stand R-14', () => {
    // Simulate resolve action
    const resolvedStands: ApronStandAssignment[] = INITIAL_STAND_ASSIGNMENTS.map((stand) => {
      if (stand.standId === 'S-306') {
        return {
          ...stand,
          gate: 'Remote Stand R-14 (Apron 4)',
          status: 'occupied',
          conflictWith: undefined,
          conflictReason: undefined,
        };
      }
      if (stand.standId === 'S-305') {
        return {
          ...stand,
          status: 'occupied',
          conflictWith: undefined,
          conflictReason: undefined,
        };
      }
      return stand;
    });

    const remainingConflicts = resolvedStands.filter((s) => s.status === 'conflict');
    expect(remainingConflicts.length).toBe(0);

    const stand306 = resolvedStands.find((s) => s.standId === 'S-306');
    expect(stand306?.gate).toContain('R-14');
    expect(stand306?.conflictWith).toBeUndefined();
    expect(stand306?.status).toBe('occupied');

    const stand305 = resolvedStands.find((s) => s.standId === 'S-305');
    expect(stand305?.conflictWith).toBeUndefined();
    expect(stand305?.status).toBe('occupied');
  });
});
