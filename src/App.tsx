import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Accessibility,
  Activity,
  AlertTriangle,
  Briefcase,
  Building2,
  Car,
  Clock,
  Coffee,
  Contrast,
  Droplets,
  ExternalLink,
  Flame,
  HardHat,
  Languages,
  Luggage,
  MapPin,
  Navigation,
  ParkingSquare,
  Phone,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Radio,
  ShieldCheck,
  Train,
  Users,
} from "lucide-react";
import { AirportMap2D } from "@/components/command-center/AirportMap2D";
import { MetricCard, ProgressBar, SectionPanel, Sparkline, StatusPill } from "@/components/command-center/MetricWidgets";

type Mode = "traveler" | "manager";

const TERMINALS = [
  {
    code: "T1",
    name: "Terminal 1",
    color: "oklch(0.78 0.15 150)",
    summary: "Domestic, charter and non-EgyptAir international",
    airlines: ["Air Arabia Egypt", "Saudia (some)", "Domestic carriers"],
    halls: "Hall 1 - Hall 2 - Hall 3",
  },
  {
    code: "T2",
    name: "Terminal 2",
    color: "oklch(0.82 0.15 210)",
    summary: "Star Alliance and SkyTeam partners, excluding EgyptAir",
    airlines: ["Lufthansa", "Emirates", "British Airways", "KLM", "Qatar Airways"],
    halls: "Linear international concourse",
  },
  {
    code: "T3",
    name: "Terminal 3",
    color: "oklch(0.72 0.20 330)",
    summary: "EgyptAir hub and EgyptAir Star Alliance flights",
    airlines: ["EgyptAir", "Star Alliance partners with EgyptAir"],
    halls: "Main concourse and pier",
  },
] as const;

const QUICK_LINKS = [
  { icon: Plane, label: "Book a flight", desc: "EgyptAir official booking", href: "https://www.egyptair.com/" },
  { icon: ShieldCheck, label: "Check-in / Manage", desc: "Online check-in and ticket confirmation", href: "https://www.egyptair.com/en/Pages/managemybooking.aspx" },
  { icon: Building2, label: "Visa info", desc: "Visa on arrival and e-visa", href: "https://visa2egypt.gov.eg/" },
  { icon: Luggage, label: "Lost and found", desc: "Report lost baggage", href: "https://cairo-airport.com/" },
  { icon: Phone, label: "Airport contact", desc: "+20 2 2265 5000", href: "tel:+20222655000" },
  { icon: Accessibility, label: "Special assistance", desc: "Ahlan Meet and Assist", href: "https://cairo-airport.com/" },
  { icon: Coffee, label: "Lounges and shops", desc: "Duty free and Ahlan VIP lounges", href: "https://www.cairo-airport.com/en-us/Airport/Airport-Services-Facilities" },
] as const;

const TERMINAL_DESTINATIONS = [
  { id: "T1", label: "Terminal 1", query: "Cairo International Airport Terminal 1" },
  { id: "T2", label: "Terminal 2", query: "Cairo International Airport Terminal 2" },
  { id: "T3", label: "Terminal 3", query: "Cairo International Airport Terminal 3" },
  { id: "ST", label: "Seasonal / Hajj Terminal", query: "Cairo International Airport Seasonal Terminal" },
] as const;

const TRAVEL_MODES = [
  { id: "driving", label: "Driving", icon: Car },
  { id: "transit", label: "Transit", icon: Train },
  { id: "walking", label: "Walking", icon: Navigation },
] as const;

const ARRIVALS = [
  { flight: "MS738", city: "Frankfurt (FRA)", time: "11:42", status: "On time", tone: "ok", terminal: "T3", gate: "F7" },
  { flight: "TK694", city: "Istanbul (IST)", time: "11:55", status: "Landing", tone: "info", terminal: "T2", gate: "B12" },
  { flight: "EK927", city: "Dubai (DXB)", time: "12:08", status: "Delayed +18m", tone: "warn", terminal: "T2", gate: "B04" },
  { flight: "MS841", city: "Jeddah (JED)", time: "12:20", status: "On time", tone: "ok", terminal: "T3", gate: "F2" },
] as const;

const DEPARTURES = [
  { flight: "MS777", city: "London (LHR)", time: "11:50", status: "Boarding", tone: "info", terminal: "T3", gate: "F11" },
  { flight: "SV302", city: "Riyadh (RUH)", time: "12:05", status: "On time", tone: "ok", terminal: "T1", gate: "1-A" },
  { flight: "AF551", city: "Paris (CDG)", time: "12:15", status: "On time", tone: "ok", terminal: "T2", gate: "B07" },
  { flight: "MS717", city: "Luxor (LXR)", time: "12:30", status: "Final call", tone: "warn", terminal: "T1", gate: "3-D" },
] as const;

const SAFETY_CHECKS = [
  { icon: Flame, label: "Fire suppression - T1/T2/T3", status: "Operational", tone: "ok", last: "Inspected 2h ago" },
  { icon: Droplets, label: "Runway water response", status: "Standby", tone: "info", last: "Last drill 6 days ago" },
  { icon: Radio, label: "ATC backup comms", status: "Operational", tone: "ok", last: "Heartbeat OK" },
  { icon: HardHat, label: "Apron worker PPE compliance", status: "98% compliant", tone: "ok", last: "12 audits today" },
  { icon: ShieldCheck, label: "Security checkpoint scanners", status: "1 offline (T2-B)", tone: "warn", last: "Tech dispatched" },
] as const;

const RECENT_MAINTENANCE = [
  { reg: "SU-GDR", type: "B777-300ER", airline: "EgyptAir", task: "A-check completed", date: "12 May 2026", duration: "32h", status: "Released", tone: "ok" },
  { reg: "SU-GEU", type: "B787-9", airline: "EgyptAir", task: "Engine #2 borescope", date: "11 May 2026", duration: "8h", status: "Released", tone: "ok" },
  { reg: "SU-GCS", type: "A330-300", airline: "EgyptAir", task: "Hydraulic line repair", date: "11 May 2026", duration: "14h", status: "Released", tone: "ok" },
  { reg: "SU-GDM", type: "B737-800", airline: "EgyptAir", task: "Tire and brake change", date: "10 May 2026", duration: "4h", status: "Released", tone: "ok" },
  { reg: "SU-GBP", type: "A320", airline: "Air Arabia Egypt", task: "Cabin pressure test", date: "10 May 2026", duration: "6h", status: "Awaiting parts", tone: "warn" },
] as const;

const ATTENTION_AIRCRAFT = [
  { reg: "SU-GBP", type: "A320", events: 7, mtbf: 142, risk: 78, top: "Pressurisation, APU starts" },
  { reg: "SU-GDC", type: "B737-800", events: 6, mtbf: 168, risk: 65, top: "Brake wear, nose gear" },
  { reg: "SU-GCH", type: "A330-200", events: 5, mtbf: 210, risk: 54, top: "Galley power, IFE" },
  { reg: "SU-GEK", type: "B787-9", events: 3, mtbf: 320, risk: 38, top: "Cabin sensors" },
] as const;

export function App() {
  const [mode, setMode] = useState<Mode>(() => (["/ops", "/safety"].includes(window.location.pathname) ? "manager" : "traveler"));
  const [highContrast, setHighContrast] = useState(false);
  const [language, setLanguage] = useState<"en" | "ar">("en");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.classList.toggle("hc", highContrast);
    root.lang = language;
    root.dir = language === "ar" ? "rtl" : "ltr";
  }, [highContrast, language]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 lg:px-8">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">
            Skip to content
          </a>
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-primary/40 bg-primary/15 glow-cyan">
              <Plane aria-hidden="true" className="h-4 w-4 text-primary" strokeWidth={2.4} />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate font-mono text-[10px] tracking-[0.22em] text-primary">CAI - CAIRO INTL</p>
              <h1 className="truncate text-sm font-semibold">CAI Command Hub</h1>
            </div>
          </div>

          <div className="ms-auto flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border bg-secondary/60 p-0.5" role="group" aria-label="Dashboard mode">
              <ModeButton active={mode === "traveler"} onClick={() => setMode("traveler")} icon={<Users className="h-3.5 w-3.5" />} label="Traveler" />
              <ModeButton active={mode === "manager"} onClick={() => setMode("manager")} icon={<Briefcase className="h-3.5 w-3.5" />} label="Manager" />
            </div>
            <IconButton pressed={highContrast} label="High contrast" onClick={() => setHighContrast((value) => !value)}>
              <Contrast className="h-4 w-4" />
            </IconButton>
            <button
              type="button"
              onClick={() => setLanguage((value) => (value === "en" ? "ar" : "en"))}
              className="hidden h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs hover:bg-secondary sm:flex"
              aria-label="Toggle Arabic language direction"
            >
              <Languages aria-hidden="true" className="h-4 w-4 text-primary" />
              <span className="font-mono">{language === "en" ? "AR" : "EN"}</span>
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-[1400px] p-4 lg:p-6">
        {mode === "traveler" ? <TravelerDashboard /> : <ManagerDashboard />}
      </main>

      <footer className="border-t border-border px-6 py-4 text-center text-[11px] text-muted-foreground">
        Cairo International Airport - Operated by Cairo Airport Company - IATA: CAI - ICAO: HECA
      </footer>
    </div>
  );
}

function ModeButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function IconButton({ pressed, label, onClick, children }: { pressed: boolean; label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`hidden h-9 w-9 place-items-center rounded-md border sm:grid ${pressed ? "border-primary bg-primary/15 text-primary" : "border-border hover:bg-secondary"}`}
    >
      {children}
    </button>
  );
}

function TravelerDashboard() {
  return (
    <div className="space-y-5">
      <Hero eyebrow="Passenger view" title="Find your terminal and services at a glance" description="A clean 2D airport schematic with optional layers for gates, ATMs, restaurants, lounges and passenger services." />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.55fr_1fr]">
        <AirportMap2D className="min-h-[560px]" />
        <div className="space-y-3">
          {TERMINALS.map((terminal) => (
            <article key={terminal.code} className="panel p-4 transition-colors hover:border-primary/40">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-sm font-bold" style={{ background: `color-mix(in oklab, ${terminal.color} 18%, transparent)`, color: terminal.color, border: `1px solid color-mix(in oklab, ${terminal.color} 50%, transparent)` }}>
                  {terminal.code}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold">{terminal.name}</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">{terminal.summary}</p>
                  <p className="mt-1.5 font-mono text-[11px] text-muted-foreground/80">{terminal.halls}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {terminal.airlines.map((airline) => (
                      <span key={airline} className="rounded border border-border bg-background/60 px-2 py-0.5 font-mono text-[10px]">
                        {airline}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
          <DirectionsCard />
        </div>
      </div>

      <SectionPanel title="Passenger links">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
          {QUICK_LINKS.map(({ icon: Icon, label, desc, href }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" className="group flex min-h-20 items-start gap-3 panel-inner p-3 transition-colors hover:border-primary/40">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-primary/30 bg-primary/10">
                <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium transition-colors group-hover:text-primary">{label}</h3>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{desc}</p>
              </div>
            </a>
          ))}
        </div>
      </SectionPanel>
    </div>
  );
}

function DirectionsCard() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState(TERMINAL_DESTINATIONS[2].query);
  const [travelMode, setTravelMode] = useState<(typeof TRAVEL_MODES)[number]["id"]>("driving");
  const selectedMode = TRAVEL_MODES.find((mode) => mode.id === travelMode) ?? TRAVEL_MODES[0];

  const mapsUrl = useMemo(() => {
    const encodedOrigin = encodeURIComponent(origin || "My location");
    const encodedDestination = encodeURIComponent(destination);
    return `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDestination}&travelmode=${travelMode}`;
  }, [destination, origin, travelMode]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => setOrigin(`${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`),
      () => setOrigin(""),
    );
  };

  return (
    <SectionPanel title="Directions" className="h-fit">
      <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
        <label className="block">
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">From</span>
          <span className="mt-1.5 flex gap-2">
            <span className="relative flex-1">
              <MapPin aria-hidden="true" className="absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="e.g. Minya, Egypt" className="h-10 w-full rounded-md border border-border bg-background ps-9 pe-3 text-sm outline-none focus:border-primary" />
            </span>
            <button type="button" onClick={useMyLocation} className="h-10 rounded-md border border-border px-3 text-xs hover:bg-secondary">
              My location
            </button>
          </span>
        </label>

        <fieldset>
          <legend className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">To terminal</legend>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            {TERMINAL_DESTINATIONS.map((terminal) => (
              <button key={terminal.id} type="button" onClick={() => setDestination(terminal.query)} aria-pressed={destination === terminal.query} className={`h-10 rounded-md border px-3 text-start text-sm transition-colors ${destination === terminal.query ? "border-primary bg-primary/15 text-primary" : "border-border hover:bg-secondary"}`}>
                {terminal.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Travel mode</legend>
          <div className="mt-1.5 inline-flex rounded-md border border-border bg-secondary/60 p-0.5">
            {TRAVEL_MODES.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" onClick={() => setTravelMode(id)} aria-pressed={travelMode === id} className={`flex h-8 items-center gap-1.5 rounded px-3 text-xs ${travelMode === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        <a href={mapsUrl} target="_blank" rel="noreferrer" className="flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">
          <ExternalLink aria-hidden="true" className="h-4 w-4" />
          Open {selectedMode.label.toLowerCase()} route
        </a>
      </form>
    </SectionPanel>
  );
}

function ManagerDashboard() {
  return (
    <div className="space-y-5">
      <Hero eyebrow="Manager view" title="Operations and safety overview" description="A focused management surface for live flow, flight movement, safety checks and maintenance attention." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Passengers today" value="58,420" delta="+4.1% vs yesterday" icon={Users} hint="Daily benchmark 85k" />
        <MetricCard label="Aircraft movements" value="412" unit="/ 540 plan" delta="On schedule" icon={Activity} />
        <MetricCard label="Avg taxi-out" value="14" unit="min" delta="-2 min" icon={Clock} accent="ok" />
        <MetricCard label="Active alerts" value="3" delta="2 medium, 1 high" deltaTone="warn" icon={AlertTriangle} accent="warn" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_1fr]">
        <div className="space-y-5">
          <SectionPanel title="Passenger flow">
            <Sparkline data={[42, 48, 55, 61, 70, 64, 72, 80, 76, 82, 78, 84]} />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <FlowZone label="Check-in" percent={62} tone="ok" />
              <FlowZone label="Security" percent={84} tone="warn" />
              <FlowZone label="Passport" percent={71} tone="ok" />
            </div>
          </SectionPanel>
          <SectionPanel title="Safety checks">
            <ul className="space-y-2">
              {SAFETY_CHECKS.map(({ icon: Icon, label, status, tone, last }) => (
                <li key={label} className="flex items-start gap-3 panel-inner p-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-primary/30 bg-primary/10">
                    <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{label}</span>
                      <StatusPill tone={tone}>{status}</StatusPill>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{last}</p>
                  </div>
                </li>
              ))}
            </ul>
          </SectionPanel>
        </div>

        <div className="space-y-5">
          <SectionPanel title="Live arrivals" action={<StatusPill tone="info" icon={<PlaneLanding className="h-3 w-3" />}>Next 60 min</StatusPill>} dense>
            <FlightTable rows={ARRIVALS} directionLabel="From" />
          </SectionPanel>
          <SectionPanel title="Live departures" action={<StatusPill tone="info" icon={<PlaneTakeoff className="h-3 w-3" />}>Next 60 min</StatusPill>} dense>
            <FlightTable rows={DEPARTURES} directionLabel="To" />
          </SectionPanel>
          <SectionPanel title="Parking and gates" action={<StatusPill tone="ok" icon={<ParkingSquare className="h-3 w-3" />}>2,180 free</StatusPill>}>
            <ul className="space-y-2.5 text-sm">
              {[
                { zone: "T3 Pier F", value: 86 },
                { zone: "T2 Pier B", value: 71 },
                { zone: "T1 Halls 1-3", value: 54 },
              ].map((row) => (
                <li key={row.zone}>
                  <div className="flex justify-between text-xs">
                    <span>{row.zone}</span>
                    <span className="font-mono text-muted-foreground">{row.value}%</span>
                  </div>
                  <ProgressBar value={row.value} className="mt-1" color={row.value > 80 ? "var(--status-warn)" : "var(--cyan)"} />
                </li>
              ))}
            </ul>
          </SectionPanel>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionPanel title="Recent aircraft maintenance">
          <MaintenanceTable />
        </SectionPanel>
        <SectionPanel title="Aircraft requiring attention" action={<span className="font-mono text-[11px] text-muted-foreground">30-day risk score</span>}>
          <AttentionTable />
        </SectionPanel>
      </div>
    </div>
  );
}

function Hero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="panel p-5 lg:p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight lg:text-3xl">{title}</h2>
      <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">{description}</p>
    </section>
  );
}

function FlightTable({ rows, directionLabel }: { rows: typeof ARRIVALS | typeof DEPARTURES; directionLabel: string }) {
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-1 py-1.5 text-start">Flight</th>
            <th className="px-1 py-1.5 text-start">{directionLabel}</th>
            <th className="px-1 py-1.5 text-start">Time</th>
            <th className="px-1 py-1.5 text-start">Gate</th>
            <th className="px-1 py-1.5 text-start">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.flight} className="border-t border-border/60">
              <td className="px-1 py-2 font-mono font-medium">{row.flight}</td>
              <td className="px-1 py-2 text-foreground/90">{row.city}</td>
              <td className="px-1 py-2 font-mono">{row.time}</td>
              <td className="px-1 py-2 font-mono text-muted-foreground">{row.terminal}/{row.gate}</td>
              <td className="px-1 py-2"><StatusPill tone={row.tone}>{row.status}</StatusPill></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FlowZone({ label, percent, tone }: { label: string; percent: number; tone: "ok" | "warn" }) {
  return (
    <div className="panel-inner p-2.5">
      <p className="font-mono text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold">{percent}%</p>
      <ProgressBar value={percent} className="mt-1" color={tone === "warn" ? "var(--status-warn)" : "var(--status-ok)"} />
    </div>
  );
}

function MaintenanceTable() {
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-1 py-1.5 text-start">A/C</th>
            <th className="px-1 py-1.5 text-start">Task</th>
            <th className="px-1 py-1.5 text-start">Date</th>
            <th className="px-1 py-1.5 text-start">Dur</th>
            <th className="px-1 py-1.5 text-start">Status</th>
          </tr>
        </thead>
        <tbody>
          {RECENT_MAINTENANCE.map((item) => (
            <tr key={item.reg} className="border-t border-border/60 align-top">
              <td className="px-1 py-2 font-mono">
                <div className="font-medium">{item.reg}</div>
                <div className="text-[10px] text-muted-foreground">{item.type}</div>
              </td>
              <td className="px-1 py-2">
                <div>{item.task}</div>
                <div className="text-[10px] text-muted-foreground">{item.airline}</div>
              </td>
              <td className="px-1 py-2 font-mono text-muted-foreground">{item.date}</td>
              <td className="px-1 py-2 font-mono">{item.duration}</td>
              <td className="px-1 py-2"><StatusPill tone={item.tone}>{item.status}</StatusPill></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AttentionTable() {
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-2 py-2 text-start">Registration</th>
            <th className="px-2 py-2 text-start">Type</th>
            <th className="px-2 py-2 text-start">Events</th>
            <th className="px-2 py-2 text-start">MTBF</th>
            <th className="px-2 py-2 text-start">Risk</th>
          </tr>
        </thead>
        <tbody>
          {ATTENTION_AIRCRAFT.map((aircraft) => {
            const color = aircraft.risk >= 70 ? "var(--status-crit)" : aircraft.risk >= 50 ? "var(--status-warn)" : "var(--status-ok)";
            return (
              <tr key={aircraft.reg} className="border-t border-border/60">
                <td className="px-2 py-2.5 font-mono font-medium">{aircraft.reg}</td>
                <td className="px-2 py-2.5">{aircraft.type}</td>
                <td className="px-2 py-2.5 font-mono">{aircraft.events}</td>
                <td className="px-2 py-2.5 font-mono">{aircraft.mtbf}h</td>
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-2">
                    <ProgressBar value={aircraft.risk} color={color} className="min-w-24 flex-1" />
                    <span className="font-mono text-[11px]" style={{ color }}>{aircraft.risk}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
