import { useState, useMemo, useCallback, useEffect } from "react";
import {
  staffMembers,
  staffingShiftWaves,
  surgeCrewUnits,
  StaffMember,
  StaffingShiftWaveId,
  AirsideZoneId,
  StaffRole,
  SurgeCrewUnit,
  Language,
} from "../data";
import { soundEffects } from "../services/soundEffects";
import { notifyManager } from "../utils/toast";
import { exportToCsv } from "../utils/exportCsv";
import { localize } from "../utils/helpers";
import { useSimulation } from "../context/simulation";

export interface StaffingFilterState {
  activeWaveId: StaffingShiftWaveId;
  searchQuery: string;
  selectedZone: AirsideZoneId | "ALL";
  selectedRole: StaffRole | "ALL";
  selectedCertFilter: "ALL" | "valid" | "expiring_soon" | "expired";
}

export function useStaffingRoster(language: Language = "en") {
  const {
    activeShiftWave,
    setActiveShiftWave,
    isDrillActive,
    activeScenario,
    recommendedSurgeUnitIds,
  } = useSimulation();

  const [filters, setFilters] = useState<StaffingFilterState>({
    activeWaveId: (activeShiftWave !== "all" ? activeShiftWave : "midday") as StaffingShiftWaveId,
    searchQuery: "",
    selectedZone: "ALL",
    selectedRole: "ALL",
    selectedCertFilter: "ALL",
  });

  const [roster, setRoster] = useState<StaffMember[]>(staffMembers);
  const [dispatchedUnits, setDispatchedUnits] = useState<Set<string>>(new Set());

  // Synchronize when activeShiftWave changes from elsewhere
  useEffect(() => {
    if (activeShiftWave !== "all") {
      setFilters((prev) => (prev.activeWaveId === activeShiftWave ? prev : { ...prev, activeWaveId: activeShiftWave as StaffingShiftWaveId }));
    }
  }, [activeShiftWave]);

  // Setters for filters
  const setActiveWave = useCallback(
    (waveId: StaffingShiftWaveId) => {
      soundEffects.playClick();
      setFilters((prev) => ({ ...prev, activeWaveId: waveId }));
      setActiveShiftWave(waveId);
    },
    [setActiveShiftWave]
  );

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setSelectedZone = useCallback((zone: AirsideZoneId | "ALL") => {
    soundEffects.playClick();
    setFilters((prev) => ({ ...prev, selectedZone: zone }));
  }, []);

  const setSelectedRole = useCallback((role: StaffRole | "ALL") => {
    soundEffects.playClick();
    setFilters((prev) => ({ ...prev, selectedRole: role }));
  }, []);

  const setSelectedCertFilter = useCallback((certFilter: "ALL" | "valid" | "expiring_soon" | "expired") => {
    soundEffects.playClick();
    setFilters((prev) => ({ ...prev, selectedCertFilter: certFilter }));
  }, []);

  const resetFilters = useCallback(() => {
    soundEffects.playClick();
    setFilters({
      activeWaveId: "midday",
      searchQuery: "",
      selectedZone: "ALL",
      selectedRole: "ALL",
      selectedCertFilter: "ALL",
    });
  }, []);

  // Shift Waves info
  const currentWave = useMemo(() => {
    return staffingShiftWaves.find((w) => w.id === filters.activeWaveId) ?? staffingShiftWaves[1];
  }, [filters.activeWaveId]);

  // Overall KPIs
  const totalStaffOnDuty = useMemo(() => {
    return roster.filter((s) => s.status === "on_duty").length;
  }, [roster]);

  const icaoMetrics = useMemo(() => {
    const total = roster.length;
    const valid = roster.filter((s) => s.certStatus === "valid").length;
    const expiringSoon = roster.filter((s) => s.certStatus === "expiring_soon").length;
    const expired = roster.filter((s) => s.certStatus === "expired").length;
    const compliancePct = total > 0 ? Math.round((valid / total) * 100) : 100;
    return {
      total,
      valid,
      expiringSoon,
      expired,
      compliancePct,
    };
  }, [roster]);

  // Dynamic Roster Filtering
  const filteredRoster = useMemo(() => {
    const q = filters.searchQuery.trim().toLowerCase();
    return roster.filter((member) => {
      // Shift wave check
      if (member.shiftWave !== filters.activeWaveId) {
        return false;
      }
      // Zone filter
      if (filters.selectedZone !== "ALL" && member.zone !== filters.selectedZone) {
        return false;
      }
      // Role filter
      if (filters.selectedRole !== "ALL" && member.role !== filters.selectedRole) {
        return false;
      }
      // Certification status filter
      if (filters.selectedCertFilter !== "ALL" && member.certStatus !== filters.selectedCertFilter) {
        return false;
      }
      // Text search
      if (q) {
        const enName = member.name.en.toLowerCase();
        const arName = member.name.ar.toLowerCase();
        const callsign = member.callsign.toLowerCase();
        const phone = member.phoneExt.toLowerCase();
        const enRole = member.roleTitle.en.toLowerCase();
        const arRole = member.roleTitle.ar.toLowerCase();
        const enBadge = member.badgeType.en.toLowerCase();
        const arBadge = member.badgeType.ar.toLowerCase();
        const id = member.id.toLowerCase();
        const matches =
          enName.includes(q) ||
          arName.includes(q) ||
          callsign.includes(q) ||
          phone.includes(q) ||
          enRole.includes(q) ||
          arRole.includes(q) ||
          enBadge.includes(q) ||
          arBadge.includes(q) ||
          id.includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [roster, filters]);

  // Surge Crew Units with live dispatched status and scenario recommendations
  const surgeUnits = useMemo<SurgeCrewUnit[]>(() => {
    return surgeCrewUnits.map((u) => ({
      ...u,
      status: dispatchedUnits.has(u.id) ? "dispatched" : "ready",
      isRecommended: recommendedSurgeUnitIds.includes(u.id),
    }));
  }, [dispatchedUnits, recommendedSurgeUnitIds]);

  // Dispatch tactical surge unit
  const dispatchSurgeUnit = useCallback(
    (unitId: string) => {
      const unit = surgeCrewUnits.find((u) => u.id === unitId);
      if (!unit) return;

      soundEffects.playDispatch();
      setDispatchedUnits((prev) => {
        const next = new Set(prev);
        next.add(unitId);
        return next;
      });

      const title = language === "ar" ? "تم إرسال سرية التدخل السريع" : "Surge Crew Unit Dispatched";
      const message =
        language === "ar"
          ? `${localize(unit.title, "ar")} (${unit.headcount} فرد) متجهة إلى ${localize(unit.targetZoneLabel, "ar")} - وصول متوقع خلال ${unit.dispatchEtaMin} دقيقة.`
          : `${localize(unit.title, "en")} (${unit.headcount} crew) en route to ${localize(unit.targetZoneLabel, "en")} - ETA ${unit.dispatchEtaMin}m.`;

      notifyManager(title, message, "ok");
    },
    [language]
  );

  // Recall tactical surge unit
  const recallSurgeUnit = useCallback(
    (unitId: string) => {
      const unit = surgeCrewUnits.find((u) => u.id === unitId);
      if (!unit) return;

      soundEffects.playClick();
      setDispatchedUnits((prev) => {
        const next = new Set(prev);
        next.delete(unitId);
        return next;
      });

      const title = language === "ar" ? "تم استدعاء الطاقم وإنهاء الانتشار" : "Surge Crew Unit Recalled";
      const message =
        language === "ar"
          ? `عادت ${localize(unit.title, "ar")} إلى وضع الاستعداد التشغيلي.`
          : `${localize(unit.title, "en")} has returned to standby station.`;

      notifyManager(title, message, "info");
    },
    [language]
  );

  // Toggle individual staff member status
  const toggleStaffStatus = useCallback(
    (staffId: string) => {
      soundEffects.playClick();
      setRoster((prev) =>
        prev.map((m) => {
          if (m.id !== staffId) return m;
          const nextStatus = m.status === "on_duty" ? "break" : "on_duty";
          const title = language === "ar" ? "تحديث حالة الموظف" : "Staff Status Updated";
          const message =
            language === "ar"
              ? `${localize(m.name, "ar")}: ${nextStatus === "on_duty" ? "في الخدمة الآن" : "استراحة تشغيلية"}`
              : `${localize(m.name, "en")}: ${nextStatus === "on_duty" ? "Active on Duty" : "On Scheduled Break"}`;
          notifyManager(title, message, "info");
          return { ...m, status: nextStatus };
        })
      );
    },
    [language]
  );

  // Export roster to CSV
  const exportRoster = useCallback(() => {
    const isAr = language === "ar";
    const headers = isAr
      ? [
          "رقم الموظف",
          "الاسم",
          "المسمى الوظيفي",
          "منطقة العمليات",
          "الوردية",
          "رمز النداء اللاسلكي",
          "القناة الترددية",
          "الحالة",
          "ترخيص الإيكاو / الشارة",
          "صلاحية الترخيص حتى",
          "أيام الصلاحية المتبقية",
          "سجل الأيام دون حوادث",
          "الهاتف الداخلي",
        ]
      : [
          "Staff ID",
          "Name",
          "Role Title",
          "Operations Zone",
          "Shift Wave",
          "Radio Callsign",
          "Radio Frequency",
          "Status",
          "ICAO Badge / Certification",
          "Valid Until",
          "Days Remaining",
          "Zero-Incident Days",
          "Phone Ext",
        ];

    const rows = filteredRoster.map((m) => [
      m.id,
      localize(m.name, language),
      localize(m.roleTitle, language),
      localize(m.zoneLabel, language),
      m.shiftWave,
      m.callsign,
      m.radioChannel,
      m.status,
      localize(m.badgeType, language),
      m.icaoCertValidUntil,
      m.daysToCertExpiry,
      m.safetyDaysZeroIncidents,
      m.phoneExt,
    ]);

    exportToCsv({
      filename: `CAI-Workforce-Roster-${filters.activeWaveId}-${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows,
      language,
      successMessage: {
        en: `Exported ${filteredRoster.length} staff records for ${currentWave.hours}`,
        ar: `تم تصدير ${filteredRoster.length} سجلاً من طاقم الوردية (${currentWave.hours})`,
      },
    });
  }, [filteredRoster, filters.activeWaveId, currentWave.hours, language]);

  return {
    filters,
    setActiveWave,
    setSearchQuery,
    setSelectedZone,
    setSelectedRole,
    setSelectedCertFilter,
    resetFilters,
    currentWave,
    shiftWaves: staffingShiftWaves,
    totalStaffOnDuty,
    icaoMetrics,
    filteredRoster,
    surgeUnits,
    dispatchSurgeUnit,
    recallSurgeUnit,
    toggleStaffStatus,
    exportRoster,
    isDrillActive,
    activeScenario,
    recommendedSurgeUnitIds,
  };
}
