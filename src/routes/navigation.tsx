import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TerminalMap } from "@/components/dashboard/TerminalMap";
import { Panel, StatCard, StatusPill, Bar } from "@/components/dashboard/widgets";
import { Navigation, Footprints, Accessibility, Route as RouteIcon, Compass, Timer } from "lucide-react";

export const Route = createFileRoute("/navigation")({
  head: () => ({ meta: [{ title: "Smart Passenger Navigation · CAI" }] }),
  component: Page,
});

export default function Page() {
  return (
    <DashboardLayout section="Smart Passenger Navigation" sub="Indoor wayfinding · accessibility-aware routing">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active wayfinding" value="2,184" icon={Navigation} delta="+312" deltaTone="ok" accent="cyan" />
          <StatCard label="Avg dwell time" value="34" unit="min" icon={Timer} delta="-2 min" deltaTone="ok" accent="ok" />
          <StatCard label="Route accuracy" value="94.6" unit="%" icon={Compass} delta="+0.8" deltaTone="ok" accent="cyan" />
          <StatCard label="Accessible routes" value="186" icon={Accessibility} delta="active" deltaTone="info" accent="magenta" />
        </div>

        <div className="col-span-12 lg:col-span-8">
          <TerminalMap className="h-[460px]" highlightId="T3" />
        </div>

        <div className="col-span-12 lg:col-span-4 grid gap-4">
          <Panel title="Suggested Route" action={<StatusPill tone="info">A → Gate D11</StatusPill>}>
            <ol className="space-y-2 text-sm">
              {[
                { ic: Footprints, l: "Curbside Drop-off · T3", t: "0 min" },
                { ic: RouteIcon, l: "Check-in Island D · row 4-6", t: "+6 min" },
                { ic: RouteIcon, l: "Security Checkpoint C", t: "+12 min" },
                { ic: RouteIcon, l: "Passport Control · e-gates", t: "+6 min" },
                { ic: Navigation, l: "Walk to Gate D11", t: "+8 min" },
              ].map((s, i) => (
                <li key={i} className="flex items-center gap-3 panel-inner p-2.5">
                  <div className="h-7 w-7 grid place-items-center rounded-md bg-primary/15 text-primary border border-primary/30 text-xs font-mono">{i + 1}</div>
                  <s.ic className="h-4 w-4 text-primary/80" />
                  <span className="flex-1 text-sm">{s.l}</span>
                  <span className="text-[11px] font-mono text-muted-foreground">{s.t}</span>
                </li>
              ))}
            </ol>
            <div className="mt-3 panel-inner p-3 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Total · accessible path</span>
              <span className="font-mono text-sm">32 min · 1.4 km</span>
            </div>
          </Panel>

          <Panel title="Walking Comfort">
            {[
              { l: "Crowding", v: 38, c: "var(--status-ok)" },
              { l: "Slope / steps", v: 22, c: "var(--status-ok)" },
              { l: "Signage clarity", v: 86, c: "var(--cyan)" },
              { l: "Rest points", v: 64, c: "var(--cyan)" },
            ].map(r => (
              <div key={r.l} className="mb-2 last:mb-0">
                <div className="flex justify-between text-xs mb-1"><span>{r.l}</span><span className="font-mono text-muted-foreground">{r.v}%</span></div>
                <Bar value={r.v} color={r.c} />
              </div>
            ))}
          </Panel>
        </div>

        <div className="col-span-12">
          <Panel title="Checkpoint Wait Times">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { l: "Check-in T1", q: 12, w: "6 min", t: "ok" as const },
                { l: "Security A · T2", q: 28, w: "11 min", t: "warn" as const },
                { l: "Security B · T3", q: 46, w: "18 min", t: "high" as const },
                { l: "Passport Control", q: 22, w: "9 min", t: "ok" as const },
                { l: "Customs", q: 8, w: "3 min", t: "ok" as const },
              ].map(c => (
                <div key={c.l} className="panel-inner p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">{c.l}</span>
                    <StatusPill tone={c.t}>{c.t}</StatusPill>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-semibold">{c.w}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">queue {c.q}</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
}
