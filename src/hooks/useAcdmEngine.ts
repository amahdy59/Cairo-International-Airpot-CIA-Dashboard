import { useState, useMemo, useEffect } from "react";
import { soundEffects } from "../services/soundEffects";
import { notifyManager } from "../utils/toast";
import { useSimulation } from "../context/simulation";

export interface AcdmTurnaround {
  id: string;
  inboundFlight: string;
  outboundFlight: string;
  airline: string;
  aircraft: string;
  acType: "C" | "D" | "E" | "F";
  stand: string;
  eldt: string;      // Estimated Landing Time
  aldt: string;      // Actual Landing Time
  aibt: string;      // Actual In-Block Time
  eobt: string;      // Estimated Off-Block Time
  tobt: string;      // Target Off-Block Time
  tsat: string;      // Target Start-Up Approval Time
  ttot: string;      // Target Take-Off Time
  turnaroundProgress: number; // 0-100%
  status: "on-schedule" | "handling" | "ready" | "delayed" | "departed";
  delayMinutes: number;
  criticalMilestone: string;
}

export const INITIAL_ACDM_TURNAROUNDS: AcdmTurnaround[] = [
  {
    id: "ACDM-01",
    inboundFlight: "MS778 (LHR)",
    outboundFlight: "MS779 (DXB)",
    airline: "EgyptAir",
    aircraft: "SU-GFN (B787-9)",
    acType: "E",
    stand: "Gate 305",
    eldt: "14:20",
    aldt: "14:22",
    aibt: "14:28",
    eobt: "15:45",
    tobt: "15:50",
    tsat: "15:58",
    ttot: "16:12",
    turnaroundProgress: 82,
    status: "handling",
    delayMinutes: 5,
    criticalMilestone: "M04: Fuelling completed, Pax Boarding @ 70%",
  },
  {
    id: "ACDM-02",
    inboundFlight: "SV302 (JED)",
    outboundFlight: "SV303 (RUH)",
    airline: "Saudia",
    aircraft: "HZ-AR22 (B777-300ER)",
    acType: "E",
    stand: "Gate 307",
    eldt: "14:35",
    aldt: "14:48",
    aibt: "14:55",
    eobt: "16:00",
    tobt: "16:22",
    tsat: "16:30",
    ttot: "16:44",
    turnaroundProgress: 45,
    status: "delayed",
    delayMinutes: 22,
    criticalMilestone: "M03: Inbound late arrival ripple (+22m). Cargo offload in progress.",
  },
  {
    id: "ACDM-03",
    inboundFlight: "AF508 (CDG)",
    outboundFlight: "AF509 (CDG)",
    airline: "Air France",
    aircraft: "F-GZNS (A350-900)",
    acType: "E",
    stand: "Gate 302",
    eldt: "15:00",
    aldt: "14:58",
    aibt: "15:05",
    eobt: "16:30",
    tobt: "16:30",
    tsat: "16:38",
    ttot: "16:50",
    turnaroundProgress: 30,
    status: "handling",
    delayMinutes: 0,
    criticalMilestone: "M02: Catering & Cabin servicing initiated.",
  },
  {
    id: "ACDM-04",
    inboundFlight: "LH582 (FRA)",
    outboundFlight: "LH583 (FRA)",
    airline: "Lufthansa",
    aircraft: "D-AIUW (A320neo)",
    acType: "C",
    stand: "Gate 314",
    eldt: "13:50",
    aldt: "13:52",
    aibt: "13:58",
    eobt: "15:10",
    tobt: "15:10",
    tsat: "15:15",
    ttot: "15:26",
    turnaroundProgress: 95,
    status: "ready",
    delayMinutes: 0,
    criticalMilestone: "M05: Pushback clearance standby (TSAT window active).",
  },
];

export function getScenarioTurnarounds(scenarioId: string): AcdmTurnaround[] {
  if (scenarioId === "sandstorm") {
    return [
      {
        ...INITIAL_ACDM_TURNAROUNDS[0],
        delayMinutes: 35,
        tobt: "16:25",
        tsat: "16:35",
        ttot: "16:48",
        status: "delayed",
        criticalMilestone: "M05: TSAT deferred by ATC - Cat II separation hold (+35m)",
      },
      {
        ...INITIAL_ACDM_TURNAROUNDS[1],
        delayMinutes: 48,
        tobt: "16:48",
        tsat: "16:58",
        ttot: "17:15",
        status: "delayed",
        criticalMilestone: "M04: Fuelling paused due to high winds (38kt gust)",
      },
      {
        ...INITIAL_ACDM_TURNAROUNDS[2],
        delayMinutes: 25,
        tobt: "16:55",
        tsat: "17:05",
        ttot: "17:20",
        status: "delayed",
        criticalMilestone: "M05: Runway 05C sweeper sweep holding pushback",
      },
      {
        ...INITIAL_ACDM_TURNAROUNDS[3],
        delayMinutes: 30,
        tobt: "15:40",
        tsat: "15:48",
        ttot: "16:02",
        status: "delayed",
        criticalMilestone: "M05: Cat II stopbar holding queue",
      },
    ];
  }

  if (scenarioId === "baggage-failure") {
    return [
      {
        ...INITIAL_ACDM_TURNAROUNDS[0],
        delayMinutes: 40,
        tobt: "16:30",
        tsat: "16:40",
        ttot: "16:55",
        status: "delayed",
        criticalMilestone: "M03: T3 sorter failure. Manual container loading in progress (+40m)",
      },
      {
        ...INITIAL_ACDM_TURNAROUNDS[1],
        delayMinutes: 50,
        tobt: "16:50",
        tsat: "17:00",
        ttot: "17:18",
        status: "delayed",
        criticalMilestone: "M03: ULD transfer delayed by conveyor stoppage",
      },
      {
        ...INITIAL_ACDM_TURNAROUNDS[2],
        delayMinutes: 0,
        status: "handling",
        criticalMilestone: "M02: Catering & Cabin servicing initiated.",
      },
      {
        ...INITIAL_ACDM_TURNAROUNDS[3],
        delayMinutes: 35,
        tobt: "15:45",
        tsat: "15:52",
        ttot: "16:05",
        status: "delayed",
        criticalMilestone: "M03: Manual baggage tug transfer at T3",
      },
    ];
  }

  return INITIAL_ACDM_TURNAROUNDS;
}

export function useAcdmEngine() {
  const { scenarioId } = useSimulation();
  const [turnarounds, setTurnarounds] = useState<AcdmTurnaround[]>(() => getScenarioTurnarounds(scenarioId));
  const [filter, setFilter] = useState<"all" | "delayed" | "handling" | "ready">("all");

  useEffect(() => {
    setTurnarounds(getScenarioTurnarounds(scenarioId));
  }, [scenarioId]);

  const updateTobt = (id: string, newTobt: string, reason: string) => {
    soundEffects.playClick();
    setTurnarounds((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const delayMinutes = item.delayMinutes + 10;
          return {
            ...item,
            tobt: newTobt,
            delayMinutes,
            status: delayMinutes > 15 ? "delayed" : item.status,
            criticalMilestone: `M04: TOBT revised to ${newTobt} (${reason})`,
          };
        }
        return item;
      })
    );
    notifyManager(
      "A-CDM TOBT Updated",
      `Milestone recalculated for ${id} (New TOBT: ${newTobt})`,
      "ok"
    );
  };

  const filteredTurnarounds = useMemo(() => {
    if (filter === "all") return turnarounds;
    return turnarounds.filter((t) => t.status === filter);
  }, [turnarounds, filter]);

  const kpis = useMemo(() => {
    const total = turnarounds.length;
    const delayed = turnarounds.filter((t) => t.delayMinutes > 0).length;
    const avgDelay = Math.round(
      turnarounds.reduce((sum, t) => sum + t.delayMinutes, 0) / (total || 1)
    );
    const tobtCompliance = Math.round(((total - delayed) / (total || 1)) * 100);
    return { total, delayed, avgDelay, tobtCompliance };
  }, [turnarounds]);

  return {
    turnarounds: filteredTurnarounds,
    allTurnarounds: turnarounds,
    filter,
    setFilter,
    updateTobt,
    kpis,
  };
}
