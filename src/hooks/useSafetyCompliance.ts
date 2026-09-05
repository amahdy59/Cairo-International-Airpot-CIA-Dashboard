import { useState, useMemo, useCallback } from 'react';
import {
  Users,
  Plane,
  Wrench,
  AlertTriangle,
  UserCheck,
  Clock3,
  ShieldAlert,
} from 'lucide-react';
import {
  safetyChecks,
  maintenanceRows,
  aircraftRiskRows,
  Tone,
  Language,
} from '../data';
import { useSimulation } from '../context/simulation';
import { exportToCsv } from '../utils/exportCsv';
import { notifyManager } from '../utils/toast';
import { soundEffects } from '../services/soundEffects';

export interface ActionDirective {
  icon: typeof Users;
  title: string;
  outcome: string;
  badge: string;
  badgeTone: Tone;
  controlIcon: typeof AlertTriangle;
  controlText: string;
  controlBadge: string;
  controlTone: Tone;
  isDrill: boolean;
}

export function useSafetyCompliance(language: Language = 'en') {
  const { activeScenario, isDrillActive } = useSimulation();
  const [authorizedActions, setAuthorizedActions] = useState<Record<string, boolean>>({});

  const handleAuthorize = useCallback(
    (title: string, outcome: string) => {
      soundEffects.playDispatch();
      setAuthorizedActions((prev) => ({ ...prev, [title]: true }));
      notifyManager(
        language === 'ar' ? 'تم اعتماد التوجيه التشغيلي بنجاح' : 'Operational Directive Authorized',
        `${title}: ${outcome}`,
        'ok'
      );
    },
    [language]
  );

  const baseActions: ActionDirective[] = useMemo(
    () => [
      {
        icon: Users,
        title: 'Rebalance security staff',
        outcome: '-4 min expected wait',
        badge: 'Ops',
        badgeTone: 'info' as Tone,
        controlIcon: AlertTriangle,
        controlText: '3 findings open longer than 24h',
        controlBadge: 'Medium',
        controlTone: 'warn' as Tone,
        isDrill: false,
      },
      {
        icon: Plane,
        title: 'Fast-track F11 passengers',
        outcome: 'Protects departure time',
        badge: 'Gates',
        badgeTone: 'ok' as Tone,
        controlIcon: UserCheck,
        controlText: 'Every safety item has an owner and due time',
        controlBadge: 'Assigned',
        controlTone: 'ok' as Tone,
        isDrill: false,
      },
      {
        icon: Wrench,
        title: 'Confirm SU-GBP parts',
        outcome: 'Reduces tomorrow risk',
        badge: 'Maintenance',
        badgeTone: 'warn' as Tone,
        controlIcon: Clock3,
        controlText: 'Escalates if action has not started',
        controlBadge: 'Auto-escalation',
        controlTone: 'info' as Tone,
        isDrill: false,
      },
    ],
    []
  );

  const drillActions: ActionDirective[] = useMemo(() => {
    if (!isDrillActive) return [];
    return activeScenario.injectedDirectives.map((d) => ({
      icon: ShieldAlert,
      title: d.title,
      outcome: d.outcome,
      badge: d.badge,
      badgeTone: d.badgeTone,
      controlIcon: AlertTriangle,
      controlText: d.controlText,
      controlBadge: d.controlBadge,
      controlTone: d.controlTone,
      isDrill: true,
    }));
  }, [isDrillActive, activeScenario]);

  const allDirectives = useMemo(
    () => [...drillActions, ...baseActions],
    [drillActions, baseActions]
  );

  // Export Safety log with UTF-8 BOM
  const exportSafetyLog = useCallback(() => {
    soundEffects.playClick();
    const isAr = language === 'ar';
    const headers = isAr
      ? ['بند فحص السلامة', 'التفاصيل التشغيلية', 'الحالة الفنية', 'مستوى الأولوية']
      : ['Safety Inspection Item', 'Operational Detail', 'Technical Status', 'Priority Level'];

    const rows = safetyChecks.map((check) => [
      check.title,
      check.detail,
      check.badge,
      check.tone.toUpperCase(),
    ]);

    exportToCsv({
      filename: `CAI-Safety-Audit-${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows,
      language,
      successMessage: {
        en: `Exported ${safetyChecks.length} safety compliance checks to CSV.`,
        ar: `تم تصدير ${safetyChecks.length} بنود من سجل السلامة والامتثال.`,
      },
    });
  }, [language]);

  // Export Fleet Maintenance log with UTF-8 BOM
  const exportMaintenanceLog = useCallback(() => {
    soundEffects.playClick();
    const isAr = language === 'ar';
    const headers = isAr
      ? ['تسجيل الطائرة', 'طراز الطائرة', 'مهمة الصيانة', 'تاريخ الفحص', 'المدة', 'الحالة الفنية']
      : ['Registration', 'Aircraft Type', 'Maintenance Task', 'Inspection Date', 'Duration', 'Release Status'];

    const rows = maintenanceRows.map((m) => [
      m.reg,
      m.type,
      m.task,
      m.date,
      m.duration,
      m.status,
    ]);

    exportToCsv({
      filename: `CAI-Fleet-Maintenance-${new Date().toISOString().slice(0, 10)}.csv`,
      headers,
      rows,
      language,
      successMessage: {
        en: `Exported ${maintenanceRows.length} aircraft maintenance records to CSV.`,
        ar: `تم تصدير ${maintenanceRows.length} سجلات من صيانة أسطول الطائرات.`,
      },
    });
  }, [language]);

  return {
    authorizedActions,
    handleAuthorize,
    allDirectives,
    isDrillActive,
    activeScenario,
    safetyChecks,
    maintenanceRows,
    aircraftRiskRows,
    exportSafetyLog,
    exportMaintenanceLog,
  };
}
