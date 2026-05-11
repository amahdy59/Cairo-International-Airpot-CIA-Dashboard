import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { TerminalMap } from "@/components/dashboard/TerminalMap";
import { Panel, StatCard, StatusPill, Bar } from "@/components/dashboard/widgets";
import {
  Sparkles, Coffee, Utensils, Briefcase, Luggage, ShoppingBag, Accessibility,
  Thermometer, Wind, Volume2, Activity,
} from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [{ title: "Services, Comfort & Accessibility · CAI" }] }),
  component: Page,
});

export default function Page() {
  return (
    <DashboardLayout section="Services, Comfort & Accessibility" sub="Lounges · F&B · retail · accessible journey">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Comfort score" value="8.6" unit="/10" icon={Activity} delta="+0.2" deltaTone="ok" accent="ok" />
          <StatCard label="Energy · last 1h" value="186" unit="kWh" icon={Wind} delta="-4%" deltaTone="ok" accent="cyan" />
          <StatCard label="Active services" value="142" icon={Sparkles} delta="Ahlan + 38" deltaTone="info" accent="cyan" />
          <StatCard label="Accessibility requests" value="22" icon={Accessibility} delta="6 active" deltaTone="info" accent="magenta" />
        </div>

        <div className="col-span-12 lg:col-span-4">
          <Panel title="Environment Sensors">
            <div className="grid grid-cols-2 gap-2">
              {[
                { ic: Thermometer, l: "Temperature", v: "23.1 °C", t: "ok" as const },
                { ic: Wind, l: "Humidity", v: "44 %", t: "ok" as const },
                { ic: Wind, l: "CO₂", v: "612 ppm", t: "ok" as const },
                { ic: Volume2, l: "Noise", v: "62 dB", t: "warn" as const },
              ].map(s => (
                <div key={s.l} className="panel-inner p-3">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5"><s.ic className="h-3.5 w-3.5 text-primary" />{s.l}</span>
                    <StatusPill tone={s.t}>{s.t}</StatusPill>
                  </div>
                  <div className="text-xl font-semibold mt-1 font-mono">{s.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 panel-inner p-3">
              <div className="text-[10px] font-mono tracking-widest text-muted-foreground">BUILDING SYSTEMS</div>
              {[
                { l: "HVAC", v: 88 },
                { l: "Lighting", v: 92 },
                { l: "Water", v: 78 },
              ].map(b => (
                <div key={b.l} className="mt-2">
                  <div className="flex justify-between text-xs mb-1"><span>{b.l}</span><span className="font-mono text-muted-foreground">{b.v}%</span></div>
                  <Bar value={b.v} color={b.v > 85 ? "var(--status-ok)" : "var(--status-warn)"} />
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="col-span-12 lg:col-span-8">
          <TerminalMap className="h-[420px]" showAccessible />
        </div>

        <div className="col-span-12 lg:col-span-7">
          <Panel title="Lounges & Services" action={<StatusPill tone="info">live</StatusPill>}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { ic: Sparkles, l: "Pearl Lounge · T3", o: 86, c: 120, w: "5 min", t: "warn" as const },
                { ic: Briefcase, l: "Business Centre · T2", o: 32, c: 60, w: "2 min", t: "ok" as const },
                { ic: Sparkles, l: "First Class · T3", o: 18, c: 40, w: "0 min", t: "ok" as const },
                { ic: Sparkles, l: "Family Lounge · T1", o: 24, c: 50, w: "3 min", t: "ok" as const },
                { ic: Luggage, l: "Baggage Wrapping", o: 6, c: 12, w: "4 min", t: "ok" as const },
                { ic: ShoppingBag, l: "Duty Free · T3", o: 412, c: 800, w: "—", t: "warn" as const },
                { ic: Utensils, l: "Restaurants", o: 286, c: 480, w: "8 min", t: "warn" as const },
                { ic: Coffee, l: "Cafés", o: 184, c: 320, w: "3 min", t: "ok" as const },
              ].map(s => (
                <div key={s.l} className="panel-inner p-3">
                  <div className="flex items-start gap-2">
                    <div className="h-8 w-8 grid place-items-center rounded-md bg-primary/10 border border-primary/30 text-primary"><s.ic className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium truncate">{s.l}</span>
                        <StatusPill tone={s.t}>{s.t}</StatusPill>
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {s.o}/{s.c} · wait {s.w}
                      </div>
                      <Bar value={s.o} max={s.c} color={s.t === "ok" ? "var(--status-ok)" : "var(--status-warn)"} className="mt-1.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="col-span-12 lg:col-span-5">
          <Panel title="Ahlan · Accessibility Requests" action={<StatusPill tone="info">22 today</StatusPill>}>
            <ul className="space-y-2">
              {[
                { l: "Wheelchair · MS 985 → D14", t: "Active · ETA 6m", tone: "info" as const },
                { l: "Low-walking path · QR 1304", t: "Routed via APM β", tone: "ok" as const },
                { l: "Elevator priority · T3 L2", t: "Reserved 12:10–12:20", tone: "ok" as const },
                { l: "Hearing assistance · Gate D11", t: "Confirmed", tone: "ok" as const },
                { l: "Family with stroller · T2", t: "Awaiting Ahlan agent", tone: "warn" as const },
              ].map((r, i) => (
                <li key={i} className="panel-inner p-3 flex items-center gap-3">
                  <Accessibility className="h-4 w-4 text-accent" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{r.l}</div>
                    <div className="text-[11px] text-muted-foreground">{r.t}</div>
                  </div>
                  <StatusPill tone={r.tone}>{r.tone}</StatusPill>
                </li>
              ))}
            </ul>
            <div className="mt-3 text-[11px] text-muted-foreground">
              Toggle <span className="text-accent">Accessible Routes</span> in the top bar to highlight elevator-only and low-walking paths on the map.
            </div>
          </Panel>
        </div>
      </div>
    </DashboardLayout>
  );
}
