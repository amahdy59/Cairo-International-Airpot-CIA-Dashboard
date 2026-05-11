import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TerminalMap } from "@/components/dashboard/TerminalMap";
import { Panel, StatCard, StatusPill, Bar, Sparkline } from "@/components/dashboard/widgets";
import { Flame, Users, Timer, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/heatmap")({
  head: () => ({ meta: [{ title: "Terminal Flow & Queue Heatmap · CAI" }] }),
  component: Page,
});

const zones = [
  { id: "T1-CHK", l: "T1 · Check-in", v: 42, t: "ok" as const },
  { id: "T2-CHK", l: "T2 · Check-in", v: 68, t: "warn" as const },
  { id: "T3-CHK", l: "T3 · Check-in", v: 88, t: "high" as const },
  { id: "T1-SEC", l: "T1 · Security", v: 36, t: "ok" as const },
  { id: "T2-SEC", l: "T2 · Security", v: 74, t: "high" as const },
  { id: "T3-SEC", l: "T3 · Security", v: 92, t: "crit" as const },
  { id: "PSP", l: "Passport Control", v: 58, t: "warn" as const },
  { id: "BAG-T3", l: "T3 · Baggage Claim", v: 81, t: "high" as const },
  { id: "DTY", l: "Duty Free Concourse", v: 47, t: "ok" as const },
  { id: "FOOD", l: "Food Court", v: 64, t: "warn" as const },
];

export default function Page() {
  return (
    <DashboardLayout section="Terminal Flow & Queue Heatmap" sub="Density, throughput and bottleneck analytics">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Live occupancy" value="38,612" icon={Users} delta="+6.1%" deltaTone="warn" accent="warn" />
          <StatCard label="Hot zones" value="3" icon={Flame} delta="+1" deltaTone="crit" accent="magenta" />
          <StatCard label="Avg queue wait" value="9.4" unit="min" icon={Timer} delta="+1.2" deltaTone="warn" accent="warn" />
          <StatCard label="Throughput" value="14.8k" unit="pax/h" icon={AlertTriangle} delta="-3%" deltaTone="warn" accent="cyan" />
        </div>

        <div className="col-span-12 lg:col-span-8">
          <TerminalMap className="h-[460px]" />
        </div>

        <div className="col-span-12 lg:col-span-4">
          <Panel title="Zone Density" action={<StatusPill tone="info">10 zones</StatusPill>}>
            <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
              {zones.map(z => (
                <div key={z.id} className="panel-inner p-2.5">
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="font-medium">{z.l}</span>
                    <StatusPill tone={z.t}>{z.t}</StatusPill>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bar value={z.v} color={z.t === "ok" ? "var(--status-ok)" : z.t === "warn" ? "var(--status-warn)" : z.t === "high" ? "var(--status-high)" : "var(--status-crit)"} />
                    <span className="text-[11px] font-mono text-muted-foreground w-9 text-end">{z.v}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <Panel title="Hourly Throughput · Last 12h">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-[10px] font-mono text-muted-foreground">CHECK-IN</div>
                <div className="text-xl font-semibold">8.2k <span className="text-[10px] text-muted-foreground">/h</span></div>
                <Sparkline data={[4,5,6,7,8,9,10,11,9,8,9,10]} color="var(--cyan)" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-muted-foreground">SECURITY</div>
                <div className="text-xl font-semibold">6.4k <span className="text-[10px] text-muted-foreground">/h</span></div>
                <Sparkline data={[3,4,4,5,6,7,8,9,8,7,8,9]} color="var(--status-warn)" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-muted-foreground">BOARDING</div>
                <div className="text-xl font-semibold">5.1k <span className="text-[10px] text-muted-foreground">/h</span></div>
                <Sparkline data={[2,3,4,4,5,6,7,8,7,6,7,8]} color="var(--magenta)" />
              </div>
            </div>
          </Panel>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <Panel title="AI Recommendations" action={<StatusPill tone="info">3 actions</StatusPill>}>
            <ul className="space-y-2">
              {[
                { t: "crit" as const, h: "Open Security Lane T3-04", n: "Reduce wait by ~7 min · 240 pax queued" },
                { t: "warn" as const, h: "Re-route T2 → APM B", n: "Avoid concourse bottleneck (74% occupancy)" },
                { t: "info" as const, h: "Stagger boarding · MS 800", n: "Spread 312 pax across 4 min windows" },
              ].map((a, i) => (
                <li key={i} className="panel-inner p-3 flex gap-3">
                  <div className={`h-1.5 w-1.5 rounded-full mt-2 ${a.t === "crit" ? "bg-status-crit" : a.t === "warn" ? "bg-status-warn" : "bg-primary"}`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{a.h}</div>
                    <div className="text-[11px] text-muted-foreground">{a.n}</div>
                  </div>
                  <button className="text-[11px] font-mono text-primary hover:underline">apply</button>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
}
