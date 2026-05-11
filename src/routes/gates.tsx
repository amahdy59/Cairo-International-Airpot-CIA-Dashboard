import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TerminalMap } from "@/components/dashboard/TerminalMap";
import { Panel, StatCard, StatusPill, Bar } from "@/components/dashboard/widgets";
import { DoorOpen, PlugZap, Wind, Wrench, Plane } from "lucide-react";

export const Route = createFileRoute("/gates")({
  head: () => ({ meta: [{ title: "Gate Connection Monitoring · CAI" }] }),
  component: Page,
});

export default function Page() {
  return (
    <DashboardLayout section="Gate Connection Monitoring" sub="Stand utilization, PLB / GPU / PCA, turnaround">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active stands" value="58 / 72" icon={DoorOpen} delta="80% util" deltaTone="info" accent="cyan" />
          <StatCard label="Avg turnaround" value="42" unit="min" delta="-3 min" deltaTone="ok" icon={Plane} accent="ok" />
          <StatCard label="GPU faults" value="2" delta="+1" deltaTone="warn" icon={PlugZap} accent="warn" />
          <StatCard label="Tight connects" value="11" delta="3 critical" deltaTone="crit" icon={Wrench} accent="magenta" />
        </div>

        <div className="col-span-12 lg:col-span-4">
          <Panel title="Connection · QR 1304 → MS 778" action={<StatusPill tone="warn">tight</StatusPill>}>
            <div className="grid grid-cols-2 gap-3">
              <Mini l="Inbound" v="QR 1304" sub="Arr 11:55 · C09" />
              <Mini l="Outbound" v="MS 778" sub="Dep 12:35 · D11" />
              <Mini l="Walk time" v="14 min" sub="across T2 → T3" />
              <Mini l="Probability" v="76%" sub="on-time connect" />
            </div>
            <div className="mt-3 space-y-2">
              <Bar value={76} color="var(--status-warn)" />
              <div className="text-[11px] text-muted-foreground">Recommend: pre-clear baggage handling, hold gate D11 by +4 min.</div>
            </div>
          </Panel>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <TerminalMap className="h-[420px]" highlightId="APM-B" />
        </div>

        <div className="col-span-12 lg:col-span-7">
          <Panel title="Stand Optimization" action={<StatusPill tone="info">live</StatusPill>}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-start py-2">Stand</th>
                    <th className="text-start">Avail</th>
                    <th className="text-start">PLB</th>
                    <th className="text-start">GPU</th>
                    <th className="text-start">PCA</th>
                    <th className="text-start">Bag transfer</th>
                    <th className="text-end">Suit.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {[
                    { s: "D11", a: "11:50", plb: "ok", gpu: "ok", pca: "ok", bag: "ok", st: "ok" },
                    { s: "D14", a: "12:10", plb: "ok", gpu: "warn", pca: "ok", bag: "ok", st: "warn" },
                    { s: "C09", a: "11:55", plb: "ok", gpu: "ok", pca: "ok", bag: "warn", st: "ok" },
                    { s: "C04", a: "12:40", plb: "warn", gpu: "ok", pca: "warn", bag: "ok", st: "warn" },
                    { s: "B12", a: "12:00", plb: "ok", gpu: "ok", pca: "ok", bag: "ok", st: "ok" },
                  ].map(r => (
                    <tr key={r.s} className="hover:bg-secondary/40">
                      <td className="py-2.5 font-mono text-primary">{r.s}</td>
                      <td className="font-mono">{r.a}</td>
                      <td><StatusPill tone={r.plb as any}>{r.plb}</StatusPill></td>
                      <td><StatusPill tone={r.gpu as any}>{r.gpu}</StatusPill></td>
                      <td><StatusPill tone={r.pca as any}>{r.pca}</StatusPill></td>
                      <td><StatusPill tone={r.bag as any}>{r.bag}</StatusPill></td>
                      <td className="text-end"><StatusPill tone={r.st as any}>{r.st}</StatusPill></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <Panel title="System Status">
            {[
              { ic: PlugZap, l: "PLB · Passenger Boarding Bridges", v: 96 },
              { ic: PlugZap, l: "GPU · Ground Power Units", v: 88 },
              { ic: Wind, l: "PCA · Pre-Conditioned Air", v: 92 },
              { ic: Plane, l: "Pushback availability", v: 81 },
            ].map(r => (
              <div key={r.l} className="mb-3 last:mb-0">
                <div className="flex items-center gap-2 text-xs mb-1">
                  <r.ic className="h-3.5 w-3.5 text-primary" />
                  <span className="flex-1">{r.l}</span>
                  <span className="font-mono text-muted-foreground">{r.v}%</span>
                </div>
                <Bar value={r.v} color={r.v > 90 ? "var(--status-ok)" : r.v > 80 ? "var(--cyan)" : "var(--status-warn)"} />
              </div>
            ))}
            <div className="mt-4 panel-inner p-3 border-accent/40 border">
              <div className="text-[10px] font-mono tracking-widest text-accent">RECOMMENDED ACTION</div>
              <div className="text-sm font-semibold mt-1">Move QR 1304 → Gate C12</div>
              <div className="text-[11px] text-muted-foreground">Reduces walking distance for 38 connecting passengers.</div>
            </div>
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Mini({ l, v, sub }: { l: string; v: string; sub?: string }) {
  return (
    <div className="panel-inner p-2.5">
      <div className="text-[10px] font-mono text-muted-foreground">{l}</div>
      <div className="text-base font-semibold">{v}</div>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
