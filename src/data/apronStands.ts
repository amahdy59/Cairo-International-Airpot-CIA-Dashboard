export interface ApronStandAssignment {
  standId: string;
  gate: string;
  flight: string;
  airline: string;
  aircraft: string;
  wingspanM: number;
  icaoCode: "C" | "D" | "E" | "F";
  status: "occupied" | "standby" | "conflict";
  conflictWith?: string;
  conflictReason?: string;
}

export const INITIAL_STAND_ASSIGNMENTS: ApronStandAssignment[] = [
  { standId: "S-304", gate: "Gate 304", flight: "MS778", airline: "EgyptAir", aircraft: "B787-9 Dreamliner", wingspanM: 60.1, icaoCode: "E", status: "occupied" },
  { standId: "S-305", gate: "Gate 305", flight: "SV302", airline: "Saudia", aircraft: "B777-300ER", wingspanM: 64.8, icaoCode: "E", status: "conflict", conflictWith: "S-306 (EK927)", conflictReason: "Scenario flags the adjacent assignment at Gate 306" },
  { standId: "S-306", gate: "Gate 306", flight: "EK927", airline: "Emirates", aircraft: "A380-800", wingspanM: 79.8, icaoCode: "F", status: "conflict", conflictWith: "S-305 (SV302)", conflictReason: "Scenario flags the adjacent assignment at Gate 305" },
  { standId: "S-307", gate: "Gate 307", flight: "LH582", airline: "Lufthansa", aircraft: "A320neo", wingspanM: 35.8, icaoCode: "C", status: "occupied" },
  { standId: "S-308", gate: "Gate 308", flight: "BA155", airline: "British Airways", aircraft: "A350-1000", wingspanM: 64.8, icaoCode: "E", status: "occupied" },
];

export function simulateApronDiversion(assignments: ApronStandAssignment[]): ApronStandAssignment[] {
  const aircraft = assignments.find((stand) => stand.standId === "S-306" && stand.flight === "EK927");
  if (!aircraft || assignments.some((stand) => stand.standId === "S-R14")) return assignments;
  const updated = assignments.map((stand) => {
    if (stand.standId === "S-305") return { ...stand, status: "occupied" as const, conflictWith: undefined, conflictReason: undefined };
    if (stand.standId === "S-306") return { ...stand, flight: "", airline: "", aircraft: "", wingspanM: 0, status: "standby" as const, conflictWith: undefined, conflictReason: undefined };
    return stand;
  });
  return [...updated, { ...aircraft, standId: "S-R14", gate: "Stand R-14", status: "occupied", conflictWith: undefined, conflictReason: undefined }];
}
