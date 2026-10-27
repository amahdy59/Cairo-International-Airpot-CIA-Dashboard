import { useState } from 'react';
import { CheckCircle2, Zap, Download, ShieldAlert, ShieldCheck, FileText } from 'lucide-react';
import { toneCssVar, localize } from '../../utils/helpers';
import { useLocale } from '../../context/locale';
import { useSimulation } from '../../context/simulation';
import { useSafetyCompliance } from '../../hooks/useSafetyCompliance';
import { exportToCsv } from '../../utils/exportCsv';
import { maintenanceRows, aircraftRiskRows, Tone, type SafetyCheckRow } from '../../data';
import { SectionPanel, StatusPill, ProgressBar } from '../../components/command-center/MetricWidgets';
import { IncidentPlaybookModal } from './IncidentPlaybookModal';
import { DrillPostMortemModal } from './DrillPostMortemModal';
import { AircraftRiskScatter } from './AircraftRiskScatter';

function SafetyView() {
  const [isPlaybookOpen, setIsPlaybookOpen] = useState(false);
  const [isPostMortemOpen, setIsPostMortemOpen] = useState(false);
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
              {language === "ar" ? "قوائم مراجعة الطوارئ التدريبية" : "Training contingency checklists"}
            </h2>
            <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
              <span className="rounded border border-border px-1.5 py-0.5">{language === "ar" ? "الرؤية المنخفضة" : "Low visibility"}</span>
              <span className="rounded border border-border px-1.5 py-0.5">{language === "ar" ? "عوائق المدارج" : "Runway FOD"}</span>
              <span className="rounded border border-border px-1.5 py-0.5">{language === "ar" ? "تحويلات الأولوية" : "Priority diversions"}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsPostMortemOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3.5 py-2 text-xs font-bold text-primary hover:bg-primary/20 active-spring transition-all cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            <span>{language === "ar" ? "تقرير الأزمة (Debrief)" : "Incident Debrief (PDF)"}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPlaybookOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-status-crit/40 bg-status-crit/15 px-3.5 py-2 text-xs font-bold text-status-crit hover:bg-status-crit/25 active-spring transition-all cursor-pointer"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>{language === "ar" ? "فتح كتيب الطوارئ (Playbooks)" : "Open Crisis Playbooks"}</span>
          </button>
        </div>
      </div>

      <IncidentPlaybookModal isOpen={isPlaybookOpen} onClose={() => setIsPlaybookOpen(false)} />
      <DrillPostMortemModal isOpen={isPostMortemOpen} onClose={() => setIsPostMortemOpen(false)} />

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
      <div className="my-auto grid grid-cols-2 items-end gap-4 sm:grid-cols-4">
        {buckets.map((bucket) => {
          const height = (bucket.value / max) * 96;
          const color = bucket.tone === "crit" ? "bg-status-crit" : bucket.tone === "warn" ? "bg-status-warn" : bucket.tone === "ok" ? "bg-status-ok" : "bg-cyan";
          return (
            <div key={bucket.label} className="text-center">
              <div className="mx-auto flex h-28 w-full max-w-18 items-end rounded-lg bg-secondary/70 p-2">
                <div className={`w-full rounded-md ${color}`} style={{ height }} aria-hidden="true" />
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
  const { tr, language } = useLocale();
  const { reactiveSafetyChecks } = useSimulation();
  const ready = reactiveSafetyChecks.filter(item => item.tone === "ok");
  const monitor = reactiveSafetyChecks.filter(item => item.tone === "info" || item.tone === "neutral");
  const action = reactiveSafetyChecks.filter(item => !["ok", "info", "neutral"].includes(item.tone));
  const total = reactiveSafetyChecks.length;
  const readyStop = total ? ready.length / total * 100 : 0;
  const monitorStop = total ? (ready.length + monitor.length) / total * 100 : 0;
  const ring = total ? `conic-gradient(var(--status-ok) 0 ${readyStop}%, var(--status-info) ${readyStop}% ${monitorStop}%, var(--status-warn) ${monitorStop}% 100%)` : "var(--secondary)";
  const visible = reactiveSafetyChecks.filter(item => item.tone !== "ok");

  return (
    <SectionPanel title={tr("Safety checks")} className="h-full flex flex-col overflow-hidden">
      <div role="region" tabIndex={0} aria-label={tr("Safety checks")} className="flex-1 overflow-y-auto pe-1 pb-1">
        <div className="mb-3 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-background/50 p-3">
          <div role="img" aria-label={language === "ar" ? `${total} فحوص: ${ready.length} سليمة، ${monitor.length} للمراقبة، ${action.length} تتطلب إجراء` : `${total} checks: ${ready.length} on track, ${monitor.length} monitor, ${action.length} need action`}
            className="grid h-28 w-28 shrink-0 place-items-center rounded-full" style={{ background: ring }}>
            <span aria-hidden="true" className="grid h-[72px] w-[72px] place-items-center rounded-full bg-card text-xl font-bold tabular-nums text-foreground">{total}</span>
          </div>
          <ul className="grid flex-1 gap-1.5 text-sm">
            <li className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-status-ok" />{language === "ar" ? "سليم" : "On track"}</span><strong className="tabular-nums">{ready.length}</strong></li>
            <li className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-status-info" />{language === "ar" ? "مراقبة" : "Monitor"}</span><strong className="tabular-nums">{monitor.length}</strong></li>
            <li className="flex items-center justify-between gap-3"><span className="flex items-center gap-2"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-status-warn" />{language === "ar" ? "إجراء مطلوب" : "Needs action"}</span><strong className="tabular-nums">{action.length}</strong></li>
          </ul>
        </div>
        <div className="grid gap-2">
          {visible.length ? visible.map(item => <SafetyCheckItem key={item.title} item={item} />)
            : <p className="text-sm text-muted-foreground">{language === "ar" ? "لا توجد فحوص تتطلب متابعة." : "No checks need follow-up."}</p>}
        </div>
        {ready.length > 0 && <details className="mt-2 rounded-lg border border-border px-3">
          <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-primary">{language === "ar" ? `عرض الفحوص السليمة (${ready.length})` : `View on-track checks (${ready.length})`}</summary>
          <div className="grid gap-2 pb-3">{ready.map(item => <SafetyCheckItem key={item.title} item={item} />)}</div>
        </details>}
      </div>
    </SectionPanel>
  );
}

function SafetyCheckItem({ item }: { item: SafetyCheckRow }) {
  const { tr } = useLocale();
  const Icon = item.icon || ShieldCheck;
  return <article className="panel-inner grid gap-2 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
    <div className="flex min-w-0 items-center gap-3">
      <Icon aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />
      <div className="min-w-0"><h3 className="text-sm font-semibold">{tr(item.title)}</h3><p className="text-xs text-muted-foreground">{tr(item.detail)}</p></div>
    </div>
    <div className="sm:justify-self-end"><StatusPill tone={item.tone}>{tr(item.badge)}</StatusPill></div>
  </article>;
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
      title={language === "ar" ? "سجل صيانة نموذجي" : "Sample maintenance log"}
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
      <div className="grid gap-2 xl:hidden">
        {maintenanceRows.map(item => <article key={item.reg} className="rounded-lg border border-border bg-background/40 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-sm font-semibold">{item.reg} <span className="text-xs font-normal text-muted-foreground">{item.type}</span></span>
            <StatusPill tone={item.tone}>{tr(item.status)}</StatusPill>
          </div>
          <p className="mt-1.5 text-sm">{tr(item.task)}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{tr(item.date)} · {tr(item.duration)}</p>
        </article>)}
      </div>
      <div className="table-scroll hidden flex-1 overflow-y-auto xl:block" role="region" tabIndex={0} aria-label={tr("Maintenance log")}>
        <table className="w-full min-w-[620px] text-sm">
          <caption className="sr-only">{language === "ar" ? "سجل صيانة نموذجي" : "Sample maintenance log"}</caption>
          <thead className="font-mono rtl:font-sans text-xs uppercase rtl:normal-case tracking-wider rtl:tracking-normal text-muted-foreground">
            <tr>
              <th scope="col" className="px-1 py-2 text-start">{tr("A/C")}</th>
              <th scope="col" className="px-1 py-2 text-start">{tr("Task")}</th>
              <th scope="col" className="px-1 py-2 text-start">{tr("Date")}</th>
              <th scope="col" className="px-1 py-2 text-start">{tr("Dur")}</th>
              <th scope="col" className="px-1 py-2 text-start">{tr("Status")}</th>
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
      <AircraftRiskScatter rows={aircraftRiskRows} />
      <details className="mt-2 rounded-lg border border-border px-3">
        <summary className="flex min-h-11 cursor-pointer items-center text-sm font-medium text-primary">{language === "ar" ? `عرض تفاصيل الطائرات (${aircraftRiskRows.length})` : `View aircraft details (${aircraftRiskRows.length})`}</summary>
      <div className="table-scroll pb-3" role="region" tabIndex={0} aria-label={tr("Aircraft risk index")}>
        <table className="w-full min-w-[780px] text-sm">
          <caption className="sr-only">{tr("Aircraft requiring attention")}</caption>
          <thead className="font-mono rtl:font-sans text-xs uppercase rtl:normal-case tracking-wider rtl:tracking-normal text-muted-foreground">
            <tr>
              <th scope="col" className="px-1 py-2 text-start">{tr("Registration")}</th>
              <th scope="col" className="px-1 py-2 text-start">{tr("Type")}</th>
              <th scope="col" className="px-1 py-2 text-start">{tr("Events")}</th>
              <th scope="col" className="px-1 py-2 text-start">{tr("MTBF")}</th>
              <th scope="col" className="px-1 py-2 text-start">{tr("Top issue")}</th>
              <th scope="col" className="px-1 py-2 text-start">{tr("Risk")}</th>
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
      </details>
    </SectionPanel>
  );
}


export default SafetyView;
