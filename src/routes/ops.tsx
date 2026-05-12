import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { IsometricMap } from "@/components/dashboard/IsometricMap";
import { Panel, StatCard, StatusPill, Sparkline, Bar } from "@/components/dashboard/widgets";
import { PlaneTakeoff, PlaneLanding, Users, AlertTriangle, Activity, Clock, ParkingSquare, DoorOpen } from "lucide-react";

export const Route = createFileRoute("/ops")({
  head: () => ({
    meta: [
      { title: "Operations Pulse — CAI Command Center" },
      { name: "description", content: "Live consolidated operations view for Cairo International Airport." },
    ],
  }),
  component: OpsPage,
});

const ARRIVALS = [
  { fl: "MS738", from: "Frankfurt (FRA)", eta: "11:42", status: "On time", tone: "ok", term: "T3", gate: "F7" },
  { fl: "TK694", from: "Istanbul (IST)", eta: "11:55", status: "Landing", tone: "info", term: "T2", gate: "B12" },
  { fl: "EK927", from: "Dubai (DXB)", eta: "12:08", status: "Delayed +18m", tone: "warn", term: "T2", gate: "B04" },
  { fl: "MS841", from: "Jeddah (JED)", eta: "12:20", status: "On time", tone: "ok", term: "T3", gate: "F2" },
  { fl: "QR1303", from: "Doha (DOH)", eta: "12:35", status: "On time", tone: "ok", term: "T2", gate: "B09" },
];

const DEPARTURES = [
  { fl: "MS777", to: "London (LHR)", etd: "11:50", status: "Boarding", tone: "info", term: "T3", gate: "F11" },
  { fl: "SV302", to: "Riyadh (RUH)", etd: "12:05", status: "On time", tone: "ok", term: "T1", gate: "1-A" },
  { fl: "AF551", to: "Paris (CDG)", etd: "12:15", status: "On time", tone: "ok", term: "T2", gate: "B07" },
  { fl: "MS717", to: "Cairo Domestic — LXR", etd: "12:30", status: "Final call", tone: "warn", term: "T1", gate: "3-D" },
  { fl: "LH583", to: "Frankfurt (FRA)", etd: "12:45", status: "On time", tone: "ok", term: "T2", gate: "B14" },
];

function OpsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* KPI strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Passengers today" value="58,420" delta="+4.1% vs yesterday" deltaTone="ok" icon={Users} accent="cyan" hint="Daily benchmark 85k" />
          <StatCard label="Aircraft movements" value="412" unit="/ 540 plan" delta="On schedule" deltaTone="ok" icon={Activity} />
          <StatCard label="Avg taxi-out" value="14" unit="min" delta="-2 min" deltaTone="ok" icon={Clock} accent="ok" />
          <StatCard label="Active alerts" value="3" delta="2 medium · 1 high" deltaTone="warn" icon={AlertTriangle} accent="warn" />
        </div>

        {/* Map + Live flights */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-5">
          <IsometricMap className="aspect-[1100/720]" />

          <div className="space-y-4">
            <Panel
              title="Live arrivals"
              action={<StatusPill tone="info" icon={<PlaneLanding className="h-3 w-3" />}>Next 60 min</StatusPill>}
              dense
            >
              <FlightTable rows={ARRIVALS} dirLabel="From" />
            </Panel>
            <Panel
              title="Live departures"
              action={<StatusPill tone="info" icon={<PlaneTakeoff className="h-3 w-3" />}>Next 60 min</StatusPill>}
              dense
            >
              <FlightTable rows={DEPARTURES} dirLabel="To" />
            </Panel>
          </div>
        </div>

        {/* Operations grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Panel title="Passenger flow (last 6 h)">
            <Sparkline data={[42, 48, 55, 61, 70, 64, 72, 80, 76, 82, 78, 84]} />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <FlowZone label="Check-in" pct={62} tone="ok" />
              <FlowZone label="Security" pct={84} tone="warn" />
              <FlowZone label="Passport" pct={71} tone="ok" />
            </div>
          </Panel>

          <Panel title="Gate utilisation" action={<StatusPill tone="ok" icon={<DoorOpen className="h-3 w-3" />}>74%</StatusPill>}>
            <ul className="space-y-2.5 text-sm">
              {[
                { z: "T3 — Pier F", v: 86 },
                { z: "T2 — Pier B", v: 71 },
                { z: "T1 — Halls 1-3", v: 54 },
                { z: "Remote stands", v: 38 },
              ].map((r) => (
                <li key={r.z}>
                  <div className="flex justify-between text-xs">
                    <span>{r.z}</span>
                    <span className="font-mono text-muted-foreground">{r.v}%</span>
                  </div>
                  <Bar value={r.v} className="mt-1" color={r.v > 80 ? "var(--status-warn)" : "var(--cyan)"} />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Parking & APM" action={<StatusPill tone="ok" icon={<ParkingSquare className="h-3 w-3" />}>2,180 free</StatusPill>}>
            <div className="grid grid-cols-3 gap-2">
              {[
                { z: "P1", free: 320, total: 500 },
                { z: "P2", free: 410, total: 500 },
                { z: "P3", free: 180, total: 500 },
                { z: "P4", free: 470, total: 500 },
                { z: "P5", free: 380, total: 500 },
                { z: "P6", free: 420, total: 500 },
              ].map((p) => (
                <div key={p.z} className="panel-inner p-2.5 text-center">
                  <div className="text-[10px] font-mono text-muted-foreground">{p.z}</div>
                  <div className="text-lg font-semibold">{p.free}</div>
                  <div className="text-[10px] text-muted-foreground">/ {p.total}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 panel-inner p-2.5 text-xs flex items-center justify-between">
              <span className="text-muted-foreground">Inter-terminal shuttle</span>
              <StatusPill tone="ok">Every 10 min</StatusPill>
            </div>
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
}

function FlightTable({ rows, dirLabel }: { rows: typeof ARRIVALS; dirLabel: string }) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-xs">
        <thead className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          <tr className="text-start">
            <th className="text-start px-1 py-1.5">Flight</th>
            <th className="text-start px-1 py-1.5">{dirLabel}</th>
            <th className="text-start px-1 py-1.5">Time</th>
            <th className="text-start px-1 py-1.5">T/Gate</th>
            <th className="text-start px-1 py-1.5">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.fl} className="border-t border-border/60">
              <td className="px-1 py-2 font-mono font-medium">{r.fl}</td>
              <td className="px-1 py-2 text-foreground/90">{(r as any).from ?? (r as any).to}</td>
              <td className="px-1 py-2 font-mono">{(r as any).eta ?? (r as any).etd}</td>
              <td className="px-1 py-2 font-mono text-muted-foreground">{r.term}·{r.gate}</td>
              <td className="px-1 py-2"><StatusPill tone={r.tone as any}>{r.status}</StatusPill></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FlowZone({ label, pct, tone }: { label: string; pct: number; tone: "ok" | "warn" | "crit" }) {
  return (
    <div className="panel-inner p-2.5">
      <div className="text-[10px] font-mono text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold mt-0.5">{pct}%</div>
      <Bar value={pct} className="mt-1" color={tone === "warn" ? "var(--status-warn)" : "var(--status-ok)"} />
    </div>
  );
}
