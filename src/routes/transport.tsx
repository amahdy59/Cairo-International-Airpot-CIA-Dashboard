import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TerminalMap } from "@/components/dashboard/TerminalMap";
import { Panel, StatCard, StatusPill, Bar, Sparkline } from "@/components/dashboard/widgets";
import { BusFront, ParkingSquare, Train, Timer } from "lucide-react";

export const Route = createFileRoute("/transport")({
  head: () => ({ meta: [{ title: "APM, Transport & Parking Control · CAI" }] }),
  component: Page,
});

export default function Page() {
  return (
    <DashboardLayout section="APM, Transport & Parking" sub="Inter-terminal mover, shuttles and 3,000-bay garage">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="APM availability" value="98.4" unit="%" icon={Train} delta="+0.6" deltaTone="ok" accent="cyan" />
          <StatCard label="Shuttle fleet" value="14 / 16" icon={BusFront} delta="2 maint." deltaTone="warn" accent="warn" />
          <StatCard label="Parking occupancy" value="2,164 / 3,000" icon={ParkingSquare} delta="72%" deltaTone="info" accent="cyan" />
          <StatCard label="Avg APM wait" value="2.4" unit="min" icon={Timer} delta="-0.3" deltaTone="ok" accent="ok" />
        </div>

        <div className="col-span-12 lg:col-span-8">
          <TerminalMap className="h-[460px]" highlightId="APM-A" />
        </div>

        <div className="col-span-12 lg:col-span-4 grid gap-4">
          <Panel title="APM · Live Trains" action={<StatusPill tone="info">3 active</StatusPill>}>
            {[
              { l: "Train α · T1 ↔ T2", v: "82%", w: "1m 40s", t: "ok" as const },
              { l: "Train β · T2 ↔ T3", v: "94%", w: "0m 50s", t: "high" as const },
              { l: "Train γ · T3 ↔ Seasonal", v: "48%", w: "3m 10s", t: "ok" as const },
            ].map(t => (
              <div key={t.l} className="panel-inner p-3 mb-2 last:mb-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm">{t.l}</span>
                  <StatusPill tone={t.t}>{t.v}</StatusPill>
                </div>
                <Bar value={parseInt(t.v)} color={t.t === "high" ? "var(--status-high)" : "var(--status-ok)"} />
                <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground font-mono">
                  <span>load</span><span>next: {t.w}</span>
                </div>
              </div>
            ))}
          </Panel>

          <Panel title="Shuttle Wait · 24h">
            <div className="text-2xl font-semibold">3.8 <span className="text-[10px] text-muted-foreground font-mono">min avg</span></div>
            <Sparkline data={[5,4,6,7,5,4,3,4,5,6,4,3,4,5,4]} color="var(--magenta)" height={56} />
          </Panel>
        </div>

        <div className="col-span-12 lg:col-span-7">
          <Panel title="Parking · 3,000-bay Garage" action={<StatusPill tone="info">live</StatusPill>}>
            <div className="grid grid-cols-3 gap-2">
              {[
                { l: "P1 · Short", o: 412, c: 600, t: "ok" as const },
                { l: "P2 · Mid", o: 528, c: 700, t: "warn" as const },
                { l: "P3 · Long", o: 712, c: 900, t: "high" as const },
                { l: "P4 · Valet", o: 142, c: 200, t: "warn" as const },
                { l: "P5 · Staff", o: 280, c: 400, t: "ok" as const },
                { l: "P6 · EV", o: 90, c: 200, t: "ok" as const },
              ].map(p => (
                <div key={p.l} className="panel-inner p-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{p.l}</span>
                    <StatusPill tone={p.t}>{Math.round(p.o/p.c*100)}%</StatusPill>
                  </div>
                  <div className="text-lg font-semibold font-mono">{p.o.toLocaleString()}<span className="text-[10px] text-muted-foreground"> / {p.c.toLocaleString()}</span></div>
                  <Bar value={p.o} max={p.c} color={p.t === "ok" ? "var(--status-ok)" : p.t === "warn" ? "var(--status-warn)" : "var(--status-high)"} />
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <Panel title="Curbside & Drop-off">
            <table className="w-full text-sm">
              <thead className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <tr><th className="text-start py-2">Lane</th><th className="text-start">Use</th><th className="text-start">Dwell</th><th className="text-end">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {[
                  { l: "T1 · Drop-off A", u: "Private", d: "1m 50s", t: "ok" as const },
                  { l: "T2 · Drop-off B", u: "Taxi / TNC", d: "2m 30s", t: "warn" as const },
                  { l: "T3 · Drop-off C", u: "Private", d: "3m 40s", t: "high" as const },
                  { l: "T3 · Coach bay", u: "Hotel coach", d: "4m 10s", t: "warn" as const },
                ].map(r => (
                  <tr key={r.l}><td className="py-2 font-mono text-primary">{r.l}</td><td>{r.u}</td><td className="font-mono">{r.d}</td><td className="text-end"><StatusPill tone={r.t}>{r.t}</StatusPill></td></tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
}
