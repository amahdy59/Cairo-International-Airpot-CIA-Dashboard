/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  MetarData,
  hecaMetarBaseline,
  DrillScenario,
  drillScenarios,
  ScenarioId,
  ShiftWaveId,
  ManagerTab,
  TerminalId,
  InfluxForecastPoint,
  influxForecastRows,
  QueuePressureRow,
  queueRows,
  GateWaitRow,
  gateWaitRows,
  FlightRow,
  departures,
  arrivals,
  ZoneStatusItem,
  zoneStatusRows,
  SafetyCheckRow,
  safetyChecks,
  ScenarioFlowData,
} from "../data";
import { notifyManager } from "../utils/toast";
import { soundEffects } from "../services/soundEffects";
import { aoccBroadcast } from "../services/broadcastChannel";

export type KioskPreset = "all-cycle" | "flight-tactical" | "airside-ground" | "crisis-command";

interface SimulationContextValue {
  scenarioId: ScenarioId;
  activeScenario: DrillScenario;
  isDrillActive: boolean;
  setScenarioId: (id: ScenarioId) => void;
  resetDrill: () => void;
  metar: MetarData;
  activeShiftWave: ShiftWaveId;
  setActiveShiftWave: (wave: ShiftWaveId) => void;
  activeTerminal: "ALL" | TerminalId;
  setActiveTerminal: (terminal: "ALL" | TerminalId) => void;
  isKioskActive: boolean;
  setIsKioskActive: (active: boolean) => void;
  toggleKiosk: () => void;
  isKioskPaused: boolean;
  setIsKioskPaused: React.Dispatch<React.SetStateAction<boolean>>;
  kioskSecondsRemaining: number;
  skipKioskNext: () => void;
  kioskPreset: KioskPreset;
  setKioskPreset: (preset: KioskPreset) => void;
  reactiveInfluxForecast: InfluxForecastPoint[];
  reactiveQueueRows: QueuePressureRow[];
  reactiveFlowData: ScenarioFlowData;
  reactiveGateWaits: GateWaitRow[];
  reactiveDepartures: FlightRow[];
  reactiveArrivals: FlightRow[];
  reactiveZoneStatuses: ZoneStatusItem[];
  reactiveSafetyChecks: SafetyCheckRow[];
  recommendedSurgeUnitIds: string[];
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

const KIOSK_CYCLE_SECONDS = 25;
const PRESET_TABS: Record<KioskPreset, ManagerTab[]> = {
  "all-cycle": ["digital", "operations", "safety", "staffing"],
  "flight-tactical": ["operations", "staffing"],
  "airside-ground": ["digital", "safety"],
  "crisis-command": ["safety", "staffing"],
};

interface SimulationProviderProps {
  children: React.ReactNode;
  activeTab: ManagerTab;
  setActiveTab: (tab: ManagerTab) => void;
  onShowDashboard?: () => void;
}

export function SimulationProvider({
  children,
  activeTab,
  setActiveTab,
  onShowDashboard,
}: SimulationProviderProps) {
  const [scenarioId, setScenarioIdState] = useState<ScenarioId>("baseline");
  const [activeShiftWave, setActiveShiftWaveState] = useState<ShiftWaveId>("all");
  const [activeTerminal, setActiveTerminalState] = useState<"ALL" | TerminalId>("ALL");
  const [isKioskActive, setIsKioskActive] = useState<boolean>(false);
  const [isKioskPaused, setIsKioskPaused] = useState<boolean>(false);
  const [kioskSecondsRemaining, setKioskSecondsRemaining] = useState<number>(KIOSK_CYCLE_SECONDS);
  const [kioskPreset, setKioskPreset] = useState<KioskPreset>("all-cycle");

  const setActiveTerminal = useCallback((terminal: "ALL" | TerminalId, broadcast = true) => {
    setActiveTerminalState(terminal);
    soundEffects.playClick();
    if (broadcast) {
      aoccBroadcast.broadcast({ type: "TERMINAL_CHANGE", terminal });
    }
  }, []);

  const setActiveShiftWave = useCallback((wave: ShiftWaveId, broadcast = true) => {
    setActiveShiftWaveState(wave);
    soundEffects.playClick();
    if (broadcast) {
      aoccBroadcast.broadcast({ type: "WAVE_CHANGE", waveId: wave });
    }
  }, []);

  const activeScenario = useMemo(() => {
    return drillScenarios.find((s) => s.id === scenarioId) || drillScenarios[0];
  }, [scenarioId]);

  const isDrillActive = scenarioId !== "baseline";

  const metar = useMemo<MetarData>(() => {
    if (!activeScenario.metarOverride) {
      return hecaMetarBaseline;
    }
    return {
      ...hecaMetarBaseline,
      ...activeScenario.metarOverride,
      activeRunways: {
        ...hecaMetarBaseline.activeRunways,
        ...(activeScenario.metarOverride.activeRunways || {}),
      },
      condition: activeScenario.metarOverride.condition || hecaMetarBaseline.condition,
    };
  }, [activeScenario]);

  const reactiveInfluxForecast = useMemo<InfluxForecastPoint[]>(() => {
    const raw = activeScenario.influxForecast || influxForecastRows;
    const terminalScale = activeTerminal === "T3" ? 0.48 : activeTerminal === "T2" ? 0.34 : activeTerminal === "T1" ? 0.18 : 1.0;
    
    const waveMultipliers: Record<ShiftWaveId, number[]> = {
      all: [1.0, 1.0, 1.0, 1.0, 1.0],
      morning: [1.15, 1.25, 1.10, 0.90, 0.75],
      midday: [0.90, 1.10, 1.35, 1.30, 1.05],
      night: [0.45, 0.40, 0.35, 0.30, 0.38],
    };
    const mults = waveMultipliers[activeShiftWave] || waveMultipliers.all;

    return raw.map((pt, idx) => ({
      time: pt.time,
      current: Math.round(pt.current * terminalScale * mults[idx % mults.length]),
      forecast: Math.round(pt.forecast * terminalScale * mults[idx % mults.length]),
    }));
  }, [activeScenario, activeTerminal, activeShiftWave]);

  const reactiveQueueRows = useMemo<QueuePressureRow[]>(() => {
    const raw = activeScenario.queueRows || queueRows;
    if (activeTerminal === "ALL") {
      return raw;
    }
    return raw.filter((r) => r.terminal === activeTerminal);
  }, [activeScenario, activeTerminal]);

  const reactiveFlowData = useMemo<ScenarioFlowData>(() => {
    const base = activeScenario.flowData || {
      sparkline: [28, 34, 42, 48, 58, 51, 61, 70, 66, 72, 69, 76],
      headline: { en: "Passenger flow rises into the midday wave", ar: "ارتفاع تدفق الركاب نحو ذروة الظهيرة" },
      subtitle: { en: "Hourly progression of passenger throughput across all terminals.", ar: "التطور الساعي لتدفق الركاب عبر جميع المباني." },
      checkIn: { percent: 62, tone: "ok" as const },
      security: { percent: 84, tone: "warn" as const },
      passport: { percent: 71, tone: "ok" as const },
    };

    if (activeShiftWave === "morning") {
      return {
        ...base,
        sparkline: base.sparkline.map((v, i) => Math.min(100, Math.round(v * (i < 6 ? 1.2 : 0.8)))),
        checkIn: { percent: Math.min(99, base.checkIn.percent + 8), tone: base.checkIn.percent + 8 > 80 ? "warn" : "ok" },
      };
    }
    if (activeShiftWave === "night") {
      return {
        ...base,
        sparkline: base.sparkline.map((v) => Math.round(v * 0.45)),
        checkIn: { percent: Math.max(15, Math.round(base.checkIn.percent * 0.5)), tone: "ok" },
        security: { percent: Math.max(20, Math.round(base.security.percent * 0.5)), tone: "ok" },
        passport: { percent: Math.max(18, Math.round(base.passport.percent * 0.5)), tone: "ok" },
      };
    }
    return base;
  }, [activeScenario, activeShiftWave]);

  const reactiveGateWaits = useMemo<GateWaitRow[]>(() => {
    const raw = activeScenario.gateWaits || gateWaitRows;
    if (activeTerminal === "ALL") {
      return raw;
    }
    return raw.filter((g) => g.terminal === activeTerminal);
  }, [activeScenario, activeTerminal]);

  const reactiveDepartures = useMemo<FlightRow[]>(() => {
    const raw = activeScenario.departures || departures;
    if (activeTerminal === "ALL") {
      return raw;
    }
    return raw.filter((f) => f.terminal === activeTerminal);
  }, [activeScenario, activeTerminal]);

  const reactiveArrivals = useMemo<FlightRow[]>(() => {
    const raw = activeScenario.arrivals || arrivals;
    if (activeTerminal === "ALL") {
      return raw;
    }
    return raw.filter((f) => f.terminal === activeTerminal);
  }, [activeScenario, activeTerminal]);

  const reactiveZoneStatuses = useMemo<ZoneStatusItem[]>(() => {
    return activeScenario.zoneStatusRows || zoneStatusRows;
  }, [activeScenario]);

  const reactiveSafetyChecks = useMemo<SafetyCheckRow[]>(() => {
    return activeScenario.safetyChecks || safetyChecks;
  }, [activeScenario]);

  const recommendedSurgeUnitIds = useMemo<string[]>(() => {
    return activeScenario.recommendedSurgeUnitIds || [];
  }, [activeScenario]);

  const setScenarioId = useCallback((id: ScenarioId, broadcast = true) => {
    setScenarioIdState(id);
    if (broadcast) {
      aoccBroadcast.broadcast({ type: "SCENARIO_CHANGE", scenarioId: id });
    }
    const target = drillScenarios.find((s) => s.id === id);
    if (target && id !== "baseline") {
      notifyManager(
        target.title.en,
        `Emergency Drill Active: ${target.summary.en}`,
        target.tone
      );
    } else {
      notifyManager(
        "Normal Operations Resumed",
        "Airfield and terminal metrics restored to live baseline.",
        "ok"
      );
    }
  }, []);

  // Synchronize across multi-display windows / tabs
  useEffect(() => {
    const unsubscribe = aoccBroadcast.subscribe((msg) => {
      if (msg.type === "SCENARIO_CHANGE") {
        setScenarioIdState(msg.scenarioId as ScenarioId);
      } else if (msg.type === "WAVE_CHANGE") {
        setActiveShiftWaveState(msg.waveId as ShiftWaveId);
      } else if (msg.type === "TERMINAL_CHANGE") {
        setActiveTerminalState(msg.terminal as "ALL" | TerminalId);
      }
    });
    return unsubscribe;
  }, []);

  const resetDrill = useCallback(() => {
    setScenarioId("baseline");
  }, [setScenarioId]);

  const toggleKiosk = useCallback(() => {
    setIsKioskActive((prev) => {
      const next = !prev;
      if (next) {
        setKioskSecondsRemaining(KIOSK_CYCLE_SECONDS);
        setIsKioskPaused(false);
        onShowDashboard?.();
        notifyManager(
          "AOCC Video Wall Mode Active",
          "Auto-cycling through AOCC multi-display screens (25s interval).",
          "info"
        );
      } else {
        notifyManager(
          "Video Wall Mode Exited",
          "Manual control restored.",
          "info"
        );
      }
      return next;
    });
  }, [onShowDashboard]);

  const skipKioskNext = useCallback(() => {
    const tabs = PRESET_TABS[kioskPreset];
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    setActiveTab(tabs[nextIndex]);
    setKioskSecondsRemaining(KIOSK_CYCLE_SECONDS);
  }, [activeTab, setActiveTab, kioskPreset]);

  // Video Wall Auto-Cycle Timer
  useEffect(() => {
    if (!isKioskActive || isKioskPaused) return;

    const interval = window.setInterval(() => {
      setKioskSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Advance tab
          const tabs = PRESET_TABS[kioskPreset];
          const currentIndex = tabs.indexOf(activeTab);
          const nextIndex = (currentIndex + 1) % tabs.length;
          setActiveTab(tabs[nextIndex]);
          return KIOSK_CYCLE_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isKioskActive, isKioskPaused, activeTab, setActiveTab, kioskPreset]);

  const value = useMemo<SimulationContextValue>(
    () => ({
      scenarioId,
      activeScenario,
      isDrillActive,
      setScenarioId,
      resetDrill,
      metar,
      activeShiftWave,
      setActiveShiftWave,
      activeTerminal,
      setActiveTerminal,
      isKioskActive,
      setIsKioskActive,
      toggleKiosk,
      isKioskPaused,
      setIsKioskPaused,
      kioskSecondsRemaining,
      skipKioskNext,
      kioskPreset,
      setKioskPreset,
      reactiveInfluxForecast,
      reactiveQueueRows,
      reactiveFlowData,
      reactiveGateWaits,
      reactiveDepartures,
      reactiveArrivals,
      reactiveZoneStatuses,
      reactiveSafetyChecks,
      recommendedSurgeUnitIds,
    }),
    [
      scenarioId,
      activeScenario,
      isDrillActive,
      setScenarioId,
      resetDrill,
      metar,
      activeShiftWave,
      setActiveShiftWave,
      activeTerminal,
      setActiveTerminal,
      isKioskActive,
      toggleKiosk,
      isKioskPaused,
      kioskSecondsRemaining,
      skipKioskNext,
      kioskPreset,
      reactiveInfluxForecast,
      reactiveQueueRows,
      reactiveFlowData,
      reactiveGateWaits,
      reactiveDepartures,
      reactiveArrivals,
      reactiveZoneStatuses,
      reactiveSafetyChecks,
      recommendedSurgeUnitIds,
    ]
  );

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation(): SimulationContextValue {
  const ctx = useContext(SimulationContext);
  if (!ctx) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return ctx;
}
