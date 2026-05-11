import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TerminalMap } from "@/components/dashboard/TerminalMap";
import { StatCard, StatusPill, Panel, Sparkline, Bar } from "@/components/dashboard/widgets";
import {
  Users, PlaneTakeoff, PlaneLanding, Gauge, AlertTriangle, ShieldCheck,
  Clock, Wind, Building2, Briefcase, Luggage, Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Airport Pulse · CAI Smart Airport Command Center" }, { name: "description", content: "Real-time operational pulse for Cairo International Airport — passenger flow, flights, terminals, transport and services." }] }),
  component: Page,
});

const flow = [62, 70, 78, 85, 92, 88, 96, 102, 110, 105, 112, 118, 124, 121, 128];

function Page() {
  return (
    <DashboardLayout section="Airport Pulse Overview" sub="Operations · CAI · Mar 2025">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Passengers Today" value="92,418" delta="+8.4% vs avg" deltaTone="ok" icon={Users} hint="Daily benchmark 85,000" accent="cyan" />
          <StatCard label="Aircraft Movements" value="612" unit="/ day" delta="+3.1%" deltaTone="ok" icon={PlaneTakeoff} hint="Mar-25 total: 18,154" accent="cyan" />
          <StatCard label="On-time Performance" value="87.2" unit="%" delta="-1.4%" deltaTone="warn" icon={Clock} accent="warn" />
          <StatCard label="Active Alerts" value="4" delta="2 new" deltaTone="crit" icon={AlertTriangle} hint="1 security · 3 ops" accent="magenta" />
        </div>

        {/* Map + side rails */}
        <div className="col-span-12 lg:col-span-8">
          <TerminalMap className="h-[460px]" />
        </div>

        <div className="col-span-12 lg:col-span-4 grid gap-4">
          <Panel title="Passenger Flow · Last 6h" action={<StatusPill tone="info">live</StatusPill>}>
            <div className="flex items-baseline justify-between mb-2">
              <div>
                <div className="text-2xl font-semibold">12,841<span className="text-xs text-muted-foreground font-mono ms-1">/ hr</span></div>
                <div className="text-[11px] text-muted-foreground">Annual: 30.94M passengers</div>
              </div>
              <StatusPill tone="ok" icon={<ShieldCheck className="h-3 w-3" />}>nominal</StatusPill>
            </div>
            <Sparkline data={flow} height={64} />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                { l: "T1", v: "1,820", t: "ok" as const },
                { l: "T2", v: "3,612", t: "warn" as const },
                { l: "T3", v: "6,704", t: "high" as const },
              ].map(x => (
                <div key={x.l} className="panel-inner py-2">
                  <div className="text-[10px] font-mono text-muted-foreground">{x.l}</div>
                  <div className="text-sm font-semibold">{x.v}</div>
                  <StatusPill tone={x.t}>{x.t}</StatusPill>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Live Alerts">
            <ul className="space-y-2">
              {[
                { t: "crit" as const, ic: AlertTriangle, title: "Security · Checkpoint B", note: "Queue >18 min · re-route" },
                { t: "warn" as const, ic: PlaneLanding, title: "MS 982 · Inbound delay", note: "ETA +22 min · Gate D14" },
                { t: "info" as const, ic: Luggage, title: "Baggage carousel 7", note: "Throughput dipped 14%" },
              ].map((a, i) => (
                <li key={i} className="flex gap-3 panel-inner p-2.5">
                  <div className={`h-8 w-8 grid place-items-center rounded-md border ${a.t === "crit" ? "border-status-crit/40 bg-status-crit/10 text-status-crit" : a.t === "warn" ? "border-status-warn/40 bg-status-warn/10 text-status-warn" : "border-primary/40 bg-primary/10 text-primary"}`}>
                    <a.ic className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{a.title}</div>
                    <div className="text-[11px] text-muted-foreground">{a.note}</div>
                  </div>
                  <StatusPill tone={a.t}>{a.t}</StatusPill>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        {/* Bottom row */}
        <div className="col-span-12 lg:col-span-4">
          <Panel title="Terminal Load" action={<span className="text-[10px] font-mono text-muted-foreground">capacity vs current</span>}>
            <div className="space-y-3">
              {[
                { l: "Terminal 1", v: 48, c: "var(--status-ok)" },
                { l: "Terminal 2", v: 71, c: "var(--status-warn)" },
                { l: "Terminal 3", v: 88, c: "var(--status-high)" },
                { l: "Seasonal Terminal", v: 32, c: "var(--status-ok)" },
              ].map(t => (
                <div key={t.l}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{t.l}</span>
                    <span className="font-mono text-muted-foreground">{t.v}%</span>
                  </div>
                  <Bar value={t.v} color={t.c} />
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <Panel title="Service Pulse">
            <div className="grid grid-cols-2 gap-2">
              {[
                { ic: Briefcase, l: "Ahlan Service", v: "142 active" },
                { ic: Building2, l: "Lounges", v: "68% used" },
                { ic: Luggage, l: "Bag Wrap", v: "queue 6" },
                { ic: Sparkles, l: "Duty Free", v: "EGP 1.2M" },
              ].map(s => (
                <div key={s.l} className="panel-inner p-3">
                  <s.ic className="h-4 w-4 text-primary mb-1.5" />
                  <div className="text-[11px] text-muted-foreground">{s.l}</div>
                  <div className="text-sm font-semibold">{s.v}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <Panel title="Comfort Index" action={<StatusPill tone="ok">good</StatusPill>}>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-semibold">8.6<span className="text-xs text-muted-foreground font-mono">/10</span></div>
                <div className="text-[11px] text-muted-foreground">across 7 zones</div>
              </div>
              <Gauge className="h-10 w-10 text-primary/60" />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              {[
                { l: "Temp", v: "23°C" },
                { l: "RH", v: "44%" },
                { l: "CO₂", v: "612" },
                { l: "Noise", v: "56dB" },
              ].map(x => (
                <div key={x.l} className="panel-inner py-2">
                  <Wind className="h-3 w-3 mx-auto text-primary mb-1" />
                  <div className="text-[10px] text-muted-foreground font-mono">{x.l}</div>
                  <div className="text-xs font-semibold">{x.v}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
}
