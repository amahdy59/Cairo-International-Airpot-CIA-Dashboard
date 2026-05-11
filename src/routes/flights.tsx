import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TerminalMap } from "@/components/dashboard/TerminalMap";
import { Panel, StatCard, StatusPill, Sparkline } from "@/components/dashboard/widgets";
import { PlaneLanding, PlaneTakeoff, Activity, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/flights")({
  head: () => ({ meta: [{ title: "Live Flights · CAI Command Center" }] }),
  component: Page,
});

const ARR = [
  { f: "MS 985", from: "JFK", t: "11:42", g: "D14", st: "On time" as const, term: "T3" },
  { f: "QR 1304", from: "DOH", t: "11:55", g: "C09", st: "Landing" as const, term: "T2" },
  { f: "TK 692", from: "IST", t: "12:08", g: "B07", st: "Delayed +18m" as const, term: "T1" },
  { f: "EK 925", from: "DXB", t: "12:22", g: "D02", st: "On time" as const, term: "T3" },
  { f: "AF 562", from: "CDG", t: "12:36", g: "C12", st: "On time" as const, term: "T2" },
  { f: "LH 580", from: "FRA", t: "12:48", g: "D08", st: "Diverted" as const, term: "T3" },
];

const DEP = [
  { f: "MS 800", to: "JED", t: "11:50", g: "B12", st: "Boarding" as const, term: "T1" },
  { f: "MS 778", to: "DXB", t: "12:05", g: "D11", st: "On time" as const, term: "T3" },
  { f: "QR 1303", to: "DOH", t: "12:20", g: "C04", st: "Final call" as const, term: "T2" },
  { f: "BA 156", to: "LHR", t: "12:35", g: "D07", st: "On time" as const, term: "T3" },
  { f: "MS 712", to: "RUH", t: "12:55", g: "B05", st: "Delayed +12m" as const, term: "T1" },
];

const tone = (s: string) =>
  s.startsWith("Delayed") ? "warn" : s === "Diverted" ? "crit" : s === "Boarding" || s === "Final call" ? "high" : "ok";

export default function Page() {
  return (
    <DashboardLayout section="Live Flights & Terminal Status" sub="Real-time aircraft and gate operations">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Arrivals · 24h" value="304" icon={PlaneLanding} delta="+12" deltaTone="ok" accent="cyan" />
          <StatCard label="Departures · 24h" value="308" icon={PlaneTakeoff} delta="+9" deltaTone="ok" accent="cyan" />
          <StatCard label="Avg Taxi-out" value="14.2" unit="min" icon={Activity} delta="-0.6" deltaTone="ok" accent="ok" />
          <StatCard label="Disruptions" value="6" icon={AlertTriangle} delta="2 new" deltaTone="crit" accent="magenta" />
        </div>

        <div className="col-span-12 lg:col-span-8">
          <TerminalMap className="h-[420px]" />
        </div>
        <div className="col-span-12 lg:col-span-4 grid gap-4">
          <Panel title="Movements · 12h" action={<StatusPill tone="info">live</StatusPill>}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-mono text-muted-foreground">ARRIVALS</div>
                <div className="text-2xl font-semibold">156</div>
                <Sparkline data={[8,12,9,14,18,22,20,24,28,26,30,32]} />
              </div>
              <div>
                <div className="text-[10px] font-mono text-muted-foreground">DEPARTURES</div>
                <div className="text-2xl font-semibold">152</div>
                <Sparkline data={[6,9,11,15,17,19,23,25,27,29,28,31]} color="var(--magenta)" />
              </div>
            </div>
          </Panel>
          <Panel title="Runway · 05R / 23L">
            <div className="space-y-2">
              {[
                { l: "Active config", v: "23L · West-bound" },
                { l: "Wind", v: "240° · 11 kt" },
                { l: "Visibility", v: "10 km · CAVOK" },
                { l: "Next slot", v: "11:54 · MS 800" },
              ].map(r => (
                <div key={r.l} className="flex justify-between text-xs panel-inner px-3 py-2">
                  <span className="text-muted-foreground">{r.l}</span>
                  <span className="font-mono">{r.v}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <Panel title="Arrivals" action={<StatusPill tone="info">{ARR.length} flights</StatusPill>}>
            <FlightTable rows={ARR} dirLabel="From" dirKey="from" />
          </Panel>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <Panel title="Departures" action={<StatusPill tone="info">{DEP.length} flights</StatusPill>}>
            <FlightTable rows={DEP} dirLabel="To" dirKey="to" />
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
}

function FlightTable({ rows, dirLabel, dirKey }: { rows: any[]; dirLabel: string; dirKey: "from" | "to" }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          <tr className="text-start">
            <th className="text-start py-2">Flight</th>
            <th className="text-start">{dirLabel}</th>
            <th className="text-start">Time</th>
            <th className="text-start">Term</th>
            <th className="text-start">Gate</th>
            <th className="text-end">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {rows.map(r => (
            <tr key={r.f} className="hover:bg-secondary/40">
              <td className="py-2.5 font-mono text-primary">{r.f}</td>
              <td>{r[dirKey]}</td>
              <td className="font-mono">{r.t}</td>
              <td className="text-muted-foreground">{r.term}</td>
              <td className="font-mono">{r.g}</td>
              <td className="text-end"><StatusPill tone={tone(r.st) as any}>{r.st}</StatusPill></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
