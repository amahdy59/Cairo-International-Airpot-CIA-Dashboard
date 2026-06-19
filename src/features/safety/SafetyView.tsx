import { Users, AlertTriangle, UserCheck, Plane, Clock3, Wrench } from 'lucide-react';
import { toneCssVar } from '../../utils/helpers';
import { useLocale } from '../../context/locale';
import { safetyChecks, maintenanceRows, aircraftRiskRows, Tone } from '../../data';
import { SectionPanel, StatusPill, ProgressBar } from '../../components/command-center/MetricWidgets';

function SafetyView() {
  return (
    <div className="flex flex-col gap-3 lg:gap-4 mt-3 lg:mt-4">
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
  const { tr } = useLocale();
  const actions = [
    {
      icon: Users,
      title: "Rebalance security staff",
      outcome: "-4 min expected wait",
      badge: "Ops",
      badgeTone: "info" as Tone,
      controlIcon: AlertTriangle,
      controlText: "3 findings open longer than 24h",
      controlBadge: "Medium",
      controlTone: "warn" as Tone,
    },
    {
      icon: Plane,
      title: "Fast-track F11 passengers",
      outcome: "Protects departure time",
      badge: "Gates",
      badgeTone: "ok" as Tone,
      controlIcon: UserCheck,
      controlText: "Every safety item has an owner and due time",
      controlBadge: "Assigned",
      controlTone: "ok" as Tone,
    },
    {
      icon: Wrench,
      title: "Confirm SU-GBP parts",
      outcome: "Reduces tomorrow risk",
      badge: "Maintenance",
      badgeTone: "warn" as Tone,
      controlIcon: Clock3,
      controlText: "Escalates if action has not started",
      controlBadge: "Auto-escalation",
      controlTone: "info" as Tone,
    },
  ];
  return (
    <SectionPanel
      title={tr("Decision recommendations")}
      action={<div className="flex flex-wrap gap-1.5 sm:gap-2"><StatusPill tone="warn">{tr("3 items")}</StatusPill><StatusPill tone="neutral">{tr("Controls to prevent issue build-up")}</StatusPill></div>}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {actions.map((action) => {
          const ActionIcon = action.icon;
          const ControlIcon = action.controlIcon;
          return (
            <article key={action.title} className="panel-inner overflow-hidden flex flex-col">
              {/* Recommendation section */}
              <div className="flex flex-col items-center text-center gap-2.5 p-4 pb-3.5">
                <div
                  className="grid h-11 w-11 place-items-center rounded-xl border border-border/60 bg-background/65"
                  style={{ boxShadow: `0 0 20px color-mix(in srgb, ${toneCssVar(action.badgeTone)} 20%, transparent)` }}
                >
                  <ActionIcon aria-hidden="true" className="h-5 w-5" style={{ color: toneCssVar(action.badgeTone) }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{tr(action.title)}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{tr(action.outcome)}</p>
                </div>
                <StatusPill tone={action.badgeTone}>{tr(action.badge)}</StatusPill>
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
  const { tr } = useLocale();
  return (
    <SectionPanel title={tr("Recent aircraft maintenance")} className="h-full flex flex-col overflow-hidden">
      <div className="-mx-1 flex-1 overflow-x-auto overflow-y-auto">
        <table className="w-full min-w-[620px] text-sm">
          <caption className="sr-only">{tr("Recent aircraft maintenance")}</caption>
          <thead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
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
  const { tr } = useLocale();
  return (
    <SectionPanel title={tr("Aircraft requiring attention")} action={<div className="flex flex-wrap gap-2"><span className="text-xs text-muted-foreground">{tr("30-day risk score")}</span></div>} className="flex flex-col">
      <div className="-mx-1 overflow-x-auto flex-1 pb-1">
        <table className="w-full min-w-[780px] text-sm">
          <caption className="sr-only">{tr("Aircraft requiring attention")}</caption>
          <thead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
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