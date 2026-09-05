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
} from "../data";
import { notifyManager } from "../utils/toast";

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
  isKioskActive: boolean;
  setIsKioskActive: (active: boolean) => void;
  toggleKiosk: () => void;
  isKioskPaused: boolean;
  setIsKioskPaused: React.Dispatch<React.SetStateAction<boolean>>;
  kioskSecondsRemaining: number;
  skipKioskNext: () => void;
  kioskPreset: KioskPreset;
  setKioskPreset: (preset: KioskPreset) => void;
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
  const [activeShiftWave, setActiveShiftWave] = useState<ShiftWaveId>("all");
  const [isKioskActive, setIsKioskActive] = useState<boolean>(false);
  const [isKioskPaused, setIsKioskPaused] = useState<boolean>(false);
  const [kioskSecondsRemaining, setKioskSecondsRemaining] = useState<number>(KIOSK_CYCLE_SECONDS);
  const [kioskPreset, setKioskPreset] = useState<KioskPreset>("all-cycle");

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

  const setScenarioId = useCallback((id: ScenarioId) => {
    setScenarioIdState(id);
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
      isKioskActive,
      setIsKioskActive,
      toggleKiosk,
      isKioskPaused,
      setIsKioskPaused,
      kioskSecondsRemaining,
      skipKioskNext,
      kioskPreset,
      setKioskPreset,
    }),
    [
      scenarioId,
      activeScenario,
      isDrillActive,
      setScenarioId,
      resetDrill,
      metar,
      activeShiftWave,
      isKioskActive,
      toggleKiosk,
      isKioskPaused,
      kioskSecondsRemaining,
      skipKioskNext,
      kioskPreset,
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
