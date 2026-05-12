import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Panel, StatCard, StatusPill, Bar } from "@/components/dashboard/widgets";
import { ShieldCheck, Wrench, AlertTriangle, CheckCircle2, Flame, Droplets, HardHat, Radio } from "lucide-react";

export const Route = createFileRoute("/safety")({
  head: () => ({
    meta: [
      { title: "Safety & Maintenance — CAI Command Center" },
      { name: "description", content: "Safety precautions, recent aircraft maintenance and aircraft most needing attention." },
    ],
  }),
  component: SafetyPage,
});

const SAFETY_CHECKS = [
  { icon: Flame, label: "Fire suppression — T1/T2/T3", status: "Operational", tone: "ok", last: "Inspected 2h ago" },
  { icon: Droplets, label: "Runway de-icing & water cannons", status: "Standby", tone: "info", last: "Last drill 6 days ago" },
  { icon: Radio, label: "ATC backup comms", status: "Operational", tone: "ok", last: "Heartbeat OK" },
  { icon: HardHat, label: "Apron worker PPE compliance", status: "98% compliant", tone: "ok", last: "12 audits today" },
  { icon: ShieldCheck, label: "Security checkpoint scanners", status: "1 unit offline (T2-B)", tone: "warn", last: "Tech dispatched" },
  { icon: AlertTriangle, label: "Bird hazard control", status: "Active patrol — RWY 23R", tone: "warn", last: "Updated 11 min ago" },
];

const RECENT_MAINTENANCE = [
  { reg: "SU-GDR", type: "B777-300ER", airline: "EgyptAir", task: "A-Check completed", date: "12 May 2026", duration: "32h", status: "Released to service", tone: "ok" },
  { reg: "SU-GEU", type: "B787-9", airline: "EgyptAir", task: "Engine #2 borescope", date: "11 May 2026", duration: "8h", status: "Released to service", tone: "ok" },
  { reg: "SU-GCS", type: "A330-300", airline: "EgyptAir", task: "Hydraulic line repair", date: "11 May 2026", duration: "14h", status: "Released to service", tone: "ok" },
  { reg: "SU-GDM", type: "B737-800", airline: "EgyptAir", task: "Tire & brake change", date: "10 May 2026", duration: "4h", status: "Released to service", tone: "ok" },
  { reg: "SU-GBP", type: "A320", airline: "Air Arabia Egypt", task: "Cabin pressurisation test", date: "10 May 2026", duration: "6h", status: "Awaiting parts", tone: "warn" },
];

const TOP_NEEDS = [
  { reg: "SU-GBP", type: "A320", events: 7, mtbf: 142, risk: 78, top: "Pressurisation, APU starts" },
  { reg: "SU-GDC", type: "B737-800", events: 6, mtbf: 168, risk: 65, top: "Brake wear, nose gear" },
  { reg: "SU-GCH", type: "A330-200", events: 5, mtbf: 210, risk: 54, top: "Galley power, IFE" },
  { reg: "SU-GEK", type: "B787-9", events: 3, mtbf: 320, risk: 38, top: "Cabin sensors" },
  { reg: "SU-GDR", type: "B777-300ER", events: 2, mtbf: 410, risk: 22, top: "Routine only" },
];

function riskTone(v: number) {
  if (v >= 70) return "crit";
  if (v >= 50) return "warn";
  return "ok";
}

function SafetyPage() {
  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Safety status" value="Nominal" delta="0 critical events 24h" deltaTone="ok" icon={ShieldCheck} accent="ok" />
          <StatCard label="Open work orders" value="14" delta="3 high priority" deltaTone="warn" icon={Wrench} accent="warn" />
          <StatCard label="A/C in maintenance" value="4" unit="aircraft" hint="2 line · 2 base" icon={AlertTriangle} />
          <StatCard label="On-time release rate" value="96%" delta="+1.4% MoM" deltaTone="ok" icon={CheckCircle2} accent="ok" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Panel title="Safety precautions — live status">
            <ul className="space-y-2">
              {SAFETY_CHECKS.map(({ icon: Icon, label, status, tone, last }) => (
                <li key={label} className="panel-inner p-3 flex items-start gap-3">
                  <div className="h-9 w-9 rounded-md grid place-items-center bg-primary/10 border border-primary/30 shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">{label}</span>
                      <StatusPill tone={tone as any}>{status}</StatusPill>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{last}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Recent aircraft maintenance">
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-xs">
                <thead className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="text-start px-1 py-1.5">A/C</th>
                    <th className="text-start px-1 py-1.5">Task</th>
                    <th className="text-start px-1 py-1.5">Date</th>
                    <th className="text-start px-1 py-1.5">Dur</th>
                    <th className="text-start px-1 py-1.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {RECENT_MAINTENANCE.map((m) => (
                    <tr key={m.reg} className="border-t border-border/60 align-top">
                      <td className="px-1 py-2 font-mono">
                        <div className="font-medium">{m.reg}</div>
                        <div className="text-[10px] text-muted-foreground">{m.type}</div>
                      </td>
                      <td className="px-1 py-2">
                        <div>{m.task}</div>
                        <div className="text-[10px] text-muted-foreground">{m.airline}</div>
                      </td>
                      <td className="px-1 py-2 font-mono text-muted-foreground">{m.date}</td>
                      <td className="px-1 py-2 font-mono">{m.duration}</td>
                      <td className="px-1 py-2"><StatusPill tone={m.tone as any}>{m.status}</StatusPill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <Panel
          title="Aircraft requiring most attention"
          action={<span className="text-[11px] font-mono text-muted-foreground">Sorted by 30-day risk score</span>}
        >
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-xs">
              <thead className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="text-start px-2 py-2">Registration</th>
                  <th className="text-start px-2 py-2">Type</th>
                  <th className="text-start px-2 py-2">Events 30d</th>
                  <th className="text-start px-2 py-2">MTBF (h)</th>
                  <th className="text-start px-2 py-2">Top issues</th>
                  <th className="text-start px-2 py-2 w-[28%]">Risk score</th>
                </tr>
              </thead>
              <tbody>
                {TOP_NEEDS.map((a) => {
                  const tone = riskTone(a.risk);
                  return (
                    <tr key={a.reg} className="border-t border-border/60">
                      <td className="px-2 py-2.5 font-mono font-medium">{a.reg}</td>
                      <td className="px-2 py-2.5">{a.type}</td>
                      <td className="px-2 py-2.5 font-mono">{a.events}</td>
                      <td className="px-2 py-2.5 font-mono">{a.mtbf}</td>
                      <td className="px-2 py-2.5 text-muted-foreground">{a.top}</td>
                      <td className="px-2 py-2.5">
                        <div className="flex items-center gap-2">
                          <Bar
                            value={a.risk}
                            color={tone === "crit" ? "var(--status-crit)" : tone === "warn" ? "var(--status-warn)" : "var(--status-ok)"}
                            className="flex-1"
                          />
                          <span className={`font-mono text-[11px] ${tone === "crit" ? "text-status-crit" : tone === "warn" ? "text-status-warn" : "text-status-ok"}`}>
                            {a.risk}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </DashboardLayout>
  );
}
