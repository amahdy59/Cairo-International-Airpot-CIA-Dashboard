import { useState } from 'react';
import { CheckCircle2, Zap, Download, ShieldAlert } from 'lucide-react';
import { toneCssVar, localize } from '../../utils/helpers';
import { useLocale } from '../../context/locale';
import { useSafetyCompliance } from '../../hooks/useSafetyCompliance';
import { exportToCsv } from '../../utils/exportCsv';
import { safetyChecks, maintenanceRows, aircraftRiskRows, Tone } from '../../data';
import { SectionPanel, StatusPill, ProgressBar } from '../../components/command-center/MetricWidgets';
import { IncidentPlaybookModal } from './IncidentPlaybookModal';

function SafetyView() {
  const [isPlaybookOpen, setIsPlaybookOpen] = useState(false);
  const { language } = useLocale();

  return (
    <div className="flex flex-col gap-3 lg:gap-4 mt-3 lg:mt-4">
      {/* ICAO Incident & Crisis Command Action Trigger */}
      <div className="panel p-3.5 sm:p-4 rounded-2xl border border-white/10 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-status-crit/15 text-status-crit border border-status-crit/30">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              {language === "ar" ? "بروتوكولات الطوارئ والأزمات الميدانية (ICAO SOP)" : "ICAO Emergency Contingency & Crisis Playbooks"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {language === "ar"
                ? "إجراءات القيادة الفورية لحالات الرؤية المتدنية LVP، طوارئ المدارج FOD، والهبوط الطبي الاضطراري"
                : "Standard operating procedures for Low Visibility (LVP), Runway FOD closures, and priority diversions."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsPlaybookOpen(true)}
          className="flex items-center gap-1.5 rounded-xl border border-status-crit/40 bg-status-crit/15 px-3.5 py-2 text-xs font-bold text-status-crit hover:bg-status-crit/25 active-spring transition-all cursor-pointer self-start sm:self-auto"
        >
          <ShieldAlert className="h-4 w-4" />
          <span>{language === "ar" ? "فتح كتيب الطوارئ (Playbooks)" : "Open Crisis Playbooks"}</span>
        </button>
      </div>

      <IncidentPlaybookModal isOpen={isPlaybookOpen} onClose={() => setIsPlaybookOpen(false)} />

      {/* Top Section: 2x2 grid on desktop, single column on tablet/mobile */}
      <div className="grid gap-3 lg:gap-4 lg:grid-cols-2">
        <SafetyAlertAge />
        <div className="relative lg:min-h-[340px] lg:h-full">
          <div className="lg:absolute lg:inset-0 lg:w-full lg:h-full">
            <SafetyChecks />
          </div>
        </div>
        
        <AircraftRiskTable />
        <div className="relative lg:min-h-[340px] lg:h-full">
          <div className="lg:absolute lg:inset-0 lg:w-full lg:h-full">
            <MaintenanceTable />
          </div>
        </div>
      </div>
      {/* Merged priority actions + controls card */}
      <PriorityActionsPanel />
    </div>
  );
}

function PriorityActionsPanel() {
  const { tr, language } = useLocale();
  const { authorizedActions, handleAuthorize, allDirectives, isDrillActive } = useSafetyCompliance(language);
  const actions = allDirectives;

  return (
    <SectionPanel
      title={tr("Decision recommendations")}
      action={
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <StatusPill tone={isDrillActive ? "crit" : "warn"}>
            {localize(
              {
                en: `${actions.length} items${isDrillActive ? " (Drill Active)" : ""}`,
                ar: `${actions.length} عناصر${isDrillActive ? " (المحاكاة نشطة)" : ""}`,
              },
              language
            )}
          </StatusPill>
          <StatusPill tone="neutral">{tr("Controls to prevent issue build-up")}</StatusPill>
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {actions.map((action) => {
          const ActionIcon = action.icon;
          const ControlIcon = action.controlIcon;
          const isAuthorized = !!authorizedActions[action.title];

          return (
            <article key={action.title} className="panel-inner overflow-hidden flex flex-col justify-between">
              {/* Recommendation section */}
              <div className="flex flex-col items-center text-center gap-2.5 p-4 pb-3">
                <div
                  className="grid h-11 w-11 place-items-center rounded-xl border border-border/60 bg-background/65"
                  style={{ boxShadow: `0 0 20px color-mix(in srgb, ${toneCssVar(action.badgeTone)} 20%, transparent)` }}
                >
                  <ActionIcon aria-hidden="true" className="h-5 w-5" style={{ color: toneCssVar(action.badgeTone) }} />
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1.5">
                    {action.isDrill && (
                      <span className="rounded bg-status-crit/20 px-1.5 py-0.5 text-[10px] font-bold text-status-crit font-mono">
                        DRILL
                      </span>
                    )}
                    <h3 className="text-sm font-bold text-foreground">{tr(action.title)}</h3>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{tr(action.outcome)}</p>
                </div>
                <StatusPill tone={action.badgeTone}>{tr(action.badge)}</StatusPill>
              </div>

              {/* Action authorization trigger */}
              <div className="px-4 pb-3">
                {isAuthorized ? (
                  <div className="flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-status-ok/40 bg-status-ok/10 px-3 py-2 text-xs font-semibold text-status-ok shadow-xs">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{localize({ en: "Directive Authorized", ar: "تم اعتماد التوجيه" }, language)}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAuthorize(action.title, action.outcome)}
                    className="flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-bold text-primary transition-all duration-200 hover:bg-primary hover:text-primary-foreground active:scale-95 cursor-pointer"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>{localize({ en: "Authorize Directive", ar: "اعتماد التوجيه" }, language)}</span>
                  </button>
                )}
              </div>

              {/* Control context section */}
              <div className="mt-auto border-t border-border/50 bg-secondary/20 p-3 flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <ControlIcon aria-hidden="true" className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: toneCssVar(action.controlTone) }} />
                  <p className="text-xs text-muted-foreground leading-relaxed">{tr(action.controlText)}</p>
                </div>
                <StatusPill tone={action.controlTone}>{tr(action.controlBadge)}</StatusPill>
              </div>
            </article>
          );
        })}
      </div>
    </SectionPanel>
  );
}

function SafetyAlertAge() {
  const { tr } = useLocale();
  const buckets = [
    { label: "New", value: 5, tone: "info" as Tone },
    { label: "30-90m", value: 4, tone: "ok" as Tone },
    { label: "2-4h", value: 2, tone: "warn" as Tone },
    { label: "Overdue", value: 1, tone: "crit" as Tone },
  ];
  const max = Math.max(...buckets.map((item) => item.value));
  return (
    <SectionPanel title={tr("Safety alert age")} action={<div className="flex shrink-0 flex-wrap justify-end gap-2"><StatusPill tone="warn">{tr("1 overdue")}</StatusPill></div>} className="flex flex-col">
      <p className="mb-5 text-sm text-muted-foreground">{tr("Aging buckets show whether issues are accumulating before they become critical.")}</p>
      <div className="mt-auto grid grid-cols-2 items-end gap-4 sm:grid-cols-4">
        {buckets.map((bucket) => {
          const height = 40 + (bucket.value / max) * 58;
          const color = bucket.tone === "crit" ? "bg-status-crit" : bucket.tone === "warn" ? "bg-status-warn" : bucket.tone === "ok" ? "bg-status-ok" : "bg-cyan";
          return (
            <div key={bucket.label} className="text-center">
              <div className="mx-auto flex h-28 w-full max-w-18 items-end rounded-lg bg-secondary/70 p-2">
                <div className={`w-full rounded-md ${color}`} style={{ height }} aria-label={`${bucket.value} ${tr(bucket.label)}`} />
              </div>
              <p className="mt-2 text-lg font-semibold">{bucket.value}</p>
              <p className="text-sm text-muted-foreground">{tr(bucket.label)}</p>
            </div>
          );
        })}
      </div>
    </SectionPanel>
  );
}

function SafetyChecks() {
  const { tr } = useLocale();
  return (
    <SectionPanel title={tr("Safety checks")} className="h-full flex flex-col overflow-hidden">
      <div className="grid gap-3 flex-1 content-start overflow-y-auto pe-1 pb-1">
        {safetyChecks.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="panel-inner grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="flex min-w-0 items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-primary/40 bg-primary/10">
                  <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold">{tr(item.title)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{tr(item.detail)}</p>
                </div>
              </div>
              <div className="sm:justify-self-end">
                <StatusPill tone={item.tone}>{tr(item.badge)}</StatusPill>
              </div>
            </article>
          );
        })}
      </div>
    </SectionPanel>
  );
}

function MaintenanceTable() {
  const { tr, language } = useLocale();

  const handleExportMaintenance = () => {
    exportToCsv({
      filename: `CIA_Aircraft_Maintenance_${new Date().toISOString().slice(0, 10)}.csv`,
      headers: [
        tr("A/C"),
        tr("Task"),
        tr("Airline"),
        tr("Date"),
        tr("Dur"),
        tr("Status"),
      ],
      rows: maintenanceRows.map((item) => [
        `${item.reg} (${item.type})`,
        tr(item.task),
        tr("EgyptAir"),
        tr(item.date),
        tr(item.duration),
        tr(item.status),
      ]),
      sheetTitle: "Cairo Airport Aircraft Maintenance Log",
    });
  };

  return (
    <SectionPanel
      title={tr("Recent aircraft maintenance")}
      action={
        <button
          type="button"
          onClick={handleExportMaintenance}
          className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-secondary/30 px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/70 hover:text-primary active:scale-95 transition cursor-pointer"
          aria-label={localize({ en: "Export maintenance log to CSV", ar: "تصدير سجل الصيانة كملف CSV" }, language)}
          title={localize({ en: "Export maintenance log to CSV (Excel compatible)", ar: "تصدير سجل الصيانة كملف CSV متوافق مع إكسيل" }, language)}
        >
          <Download className="h-3.5 w-3.5 text-primary" />
          <span className="hidden sm:inline">{localize({ en: "Export CSV", ar: "تصدير CSV" }, language)}</span>
        </button>
      }
      className="h-full flex flex-col overflow-hidden"
    >
      <div className="-mx-1 flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full min-w-[620px] text-sm">
          <caption className="sr-only">{tr("Recent aircraft maintenance")}</caption>
          <thead className="font-mono rtl:font-sans text-xs uppercase rtl:normal-case tracking-wider rtl:tracking-normal text-muted-foreground">
            <tr>
              <th className="px-1 py-2 text-start">{tr("A/C")}</th>
              <th className="px-1 py-2 text-start">{tr("Task")}</th>
              <th className="px-1 py-2 text-start">{tr("Date")}</th>
              <th className="px-1 py-2 text-start">{tr("Dur")}</th>
              <th className="px-1 py-2 text-start">{tr("Status")}</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceRows.map((item) => (
              <tr key={item.reg} className="border-t border-border/60">
                <td className="px-1 py-3 font-mono"><strong>{item.reg}</strong><div className="text-xs text-muted-foreground">{item.type}</div></td>
                <td className="px-1 py-3">{tr(item.task)}<div className="text-xs text-muted-foreground">{tr("EgyptAir")}</div></td>
                <td className="px-1 py-3 font-mono text-muted-foreground">{tr(item.date)}</td>
                <td className="px-1 py-3 font-mono">{tr(item.duration)}</td>
                <td className="px-1 py-3"><StatusPill tone={item.tone}>{tr(item.status)}</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionPanel>
  );
}

function AircraftRiskTable() {
  const { tr, language } = useLocale();

  const handleExportRisk = () => {
    exportToCsv({
      filename: `CIA_Aircraft_Risk_Scorecard_${new Date().toISOString().slice(0, 10)}.csv`,
      headers: [
        tr("Registration"),
        tr("Type"),
        tr("Events"),
        tr("MTBF"),
        tr("Top issue"),
        tr("Risk"),
      ],
      rows: aircraftRiskRows.map((aircraft) => [
        aircraft.reg,
        aircraft.type,
        String(aircraft.events),
        tr(aircraft.mtbf),
        tr(aircraft.issue),
        `${aircraft.risk}%`,
      ]),
      sheetTitle: "Cairo Airport 30-Day Aircraft Risk Scorecard",
    });
  };

  return (
    <SectionPanel
      title={tr("Aircraft requiring attention")}
      action={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportRisk}
            className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-secondary/30 px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/70 hover:text-primary active:scale-95 transition cursor-pointer"
            aria-label={localize({ en: "Export risk scorecard to CSV", ar: "تصدير بطاقة تقييم المخاطر كملف CSV" }, language)}
            title={localize({ en: "Export risk scorecard to CSV (Excel compatible)", ar: "تصدير بطاقة تقييم المخاطر كملف CSV متوافق مع إكسيل" }, language)}
          >
            <Download className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">{localize({ en: "Export CSV", ar: "تصدير CSV" }, language)}</span>
          </button>
          <span className="text-xs text-muted-foreground">{tr("30-day risk score")}</span>
        </div>
      }
      className="flex flex-col"
    >
      <div className="-mx-1 overflow-x-auto flex-1 pb-1">
        <table className="w-full min-w-[780px] text-sm">
          <caption className="sr-only">{tr("Aircraft requiring attention")}</caption>
          <thead className="font-mono rtl:font-sans text-xs uppercase rtl:normal-case tracking-wider rtl:tracking-normal text-muted-foreground">
            <tr>
              <th className="px-1 py-2 text-start">{tr("Registration")}</th>
              <th className="px-1 py-2 text-start">{tr("Type")}</th>
              <th className="px-1 py-2 text-start">{tr("Events")}</th>
              <th className="px-1 py-2 text-start">{tr("MTBF")}</th>
              <th className="px-1 py-2 text-start">{tr("Top issue")}</th>
              <th className="px-1 py-2 text-start">{tr("Risk")}</th>
            </tr>
          </thead>
          <tbody>
            {aircraftRiskRows.map((aircraft) => {
              const color = aircraft.risk >= 70 ? "var(--status-crit)" : aircraft.risk >= 50 ? "var(--status-warn)" : "var(--status-ok)";
              return (
                <tr key={aircraft.reg} className="border-t border-border/60">
                  <td className="px-1 py-3 font-mono font-semibold">{aircraft.reg}</td>
                  <td className="px-1 py-3">{aircraft.type}</td>
                  <td className="px-1 py-3 font-mono">{aircraft.events}</td>
                  <td className="px-1 py-3 font-mono">{tr(aircraft.mtbf)}</td>
                  <td className="px-1 py-3 text-muted-foreground">{tr(aircraft.issue)}</td>
                  <td className="px-1 py-3">
                    <div className="flex items-center gap-3">
                      <ProgressBar value={aircraft.risk} color={color} className="min-w-36" />
                      <span className="font-mono text-xs" style={{ color }}>{aircraft.risk}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionPanel>
  );
}


export default SafetyView;