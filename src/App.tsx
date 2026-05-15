import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Clock3,
  Contrast,
  Eye,
  Flame,
  Languages,
  Plane,
  Radar,
  ShieldCheck,
  Users,
  Wrench,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MetricCard, ProgressBar, SectionPanel, Sparkline, StatusPill } from "@/components/command-center/MetricWidgets";

type ManagerTab = "digital" | "operations" | "safety";
type Tone = "ok" | "info" | "warn" | "high" | "crit" | "neutral";
type Language = "en" | "ar";

type FlightRow = {
  flight: string;
  city: string;
  time: string;
  gate: string;
  status: string;
  tone: Tone;
};

type AirportScene = {
  id: "overview" | "t1" | "t2" | "t3";
  label: string;
  title: string;
  summary: string;
  objectPosition: string;
};

const ASSET = "/manager-assets/digital-twin-reference.png";

const copy = {
  en: {
    airport: "Cairo International Airport",
    brand: "CAI Command Hub",
    manager: "Manager view",
    heroTitle: "Operations and safety overview",
    heroBody: "A focused management surface for live flow, flight movement, safety checks and maintenance attention.",
    digital: "Digital Twin",
    operations: "Operations",
    safety: "Safety",
    resources: "Resources and audit notes",
    footer: "Cairo International Airport - Operated by Cairo Airport Company - IATA: CAI - ICAO: HECA",
    contrast: "Toggle high contrast",
    language: "Switch language",
  },
  ar: {
    airport: "مطار القاهرة الدولي",
    brand: "مركز قيادة مطار القاهرة",
    manager: "عرض المدير",
    heroTitle: "نظرة تشغيلية وسلامة مركزة",
    heroBody: "سطح إداري لمتابعة تدفق الركاب، حركة الرحلات، فحوص السلامة، وأولويات الصيانة.",
    digital: "التوأم الرقمي",
    operations: "التشغيل",
    safety: "السلامة",
    resources: "المصادر وملاحظات التدقيق",
    footer: "مطار القاهرة الدولي - تديره شركة ميناء القاهرة الجوي - IATA: CAI - ICAO: HECA",
    contrast: "تبديل التباين العالي",
    language: "تبديل اللغة",
  },
} as const;

const scenes: AirportScene[] = [
  {
    id: "overview",
    label: "Airport overview",
    title: "Airport overview",
    summary: "High-level airport map showing terminals, roads, parking, airside zones, runways, and transfer connections.",
    objectPosition: "top center",
  },
  {
    id: "t1",
    label: "Terminal 1",
    title: "Terminal 1",
    summary: "Separate terminal area serving selected domestic, regional and international operations.",
    objectPosition: "center 29%",
  },
  {
    id: "t2",
    label: "Terminal 2",
    title: "Terminal 2",
    summary: "International terminal connected operationally with the Terminal 3 side of the airport.",
    objectPosition: "center 58%",
  },
  {
    id: "t3",
    label: "Terminal 3",
    title: "Terminal 3",
    summary: "Major passenger terminal and hub-style area with large concourse and gate capacity.",
    objectPosition: "center 88%",
  },
];

const terminalFacts = [
  {
    code: "T1",
    title: "Terminal 1",
    body: "Domestic, regional and selected international operations",
    detail: "Hall 1 - Hall 2 - Hall 3",
    airlines: ["Air Arabia Egypt", "Nile Air", "Flynas", "Domestic carriers"],
    tone: "ok" as Tone,
  },
  {
    code: "T2",
    title: "Terminal 2",
    body: "Renovated international terminal connected to Terminal 3",
    detail: "International concourse",
    airlines: ["Emirates", "British Airways", "Air France", "Qatar Airways"],
    tone: "info" as Tone,
  },
  {
    code: "T3",
    title: "Terminal 3",
    body: "EgyptAir hub and largest passenger terminal",
    detail: "Main concourse and pier",
    airlines: ["EgyptAir", "Star Alliance partners", "Turkish Airlines"],
    tone: "high" as Tone,
  },
];

const waitTimes = [
  { label: "T3 check-in", value: 8, tone: "ok" as Tone },
  { label: "Passport", value: 11, tone: "info" as Tone },
  { label: "Security", value: 17, tone: "warn" as Tone },
  { label: "Baggage", value: 14, tone: "info" as Tone },
];

const decisions = [
  { title: "T2 security queue", detail: "Open one more lane", badge: "17m", tone: "warn" as Tone },
  { title: "Gate F11 boarding", detail: "Send floor agent", badge: "72%", tone: "info" as Tone },
  { title: "T2-B scanner", detail: "Escalate maintenance", badge: "Offline", tone: "crit" as Tone },
];

const departures: FlightRow[] = [
  { flight: "MS777", city: "London (LHR)", time: "14:45", gate: "D3", status: "Sample only", tone: "neutral" },
  { flight: "SV302", city: "Riyadh (RUH)", time: "15:30", gate: "A15", status: "Sample only", tone: "neutral" },
  { flight: "AF551", city: "Paris (CDG)", time: "15:55", gate: "S1", status: "Sample only", tone: "neutral" },
  { flight: "MS717", city: "Luxor (LXR)", time: "16:20", gate: "F9", status: "Sample only", tone: "neutral" },
];

const arrivals: FlightRow[] = [
  { flight: "MS738", city: "Frankfurt (FRA)", time: "15:00", gate: "C3", status: "Sample only", tone: "neutral" },
  { flight: "TK694", city: "Istanbul (IST)", time: "16:15", gate: "A2", status: "Sample only", tone: "neutral" },
  { flight: "EK927", city: "Dubai (DXB)", time: "13:45", gate: "B12", status: "Sample only", tone: "neutral" },
  { flight: "MS841", city: "Jeddah (JED)", time: "12:30", gate: "D9", status: "Sample only", tone: "neutral" },
];

const queueRows = [
  { terminal: "T1", checkIn: 30, passport: 25, security: 25, total: 68 },
  { terminal: "T2", checkIn: 34, passport: 30, security: 31, total: 89 },
  { terminal: "T3", checkIn: 38, passport: 25, security: 27, total: 84 },
];

const safetyChecks = [
  { icon: Flame, title: "Fire suppression - T1/T2/T3", detail: "Inspected 2h ago", badge: "Operational", tone: "ok" as Tone },
  { icon: Wrench, title: "Runway water response", detail: "Last drill 6 days ago", badge: "Standby", tone: "info" as Tone },
  { icon: Activity, title: "ATC backup comms", detail: "Heartbeat OK", badge: "Operational", tone: "ok" as Tone },
  { icon: ShieldCheck, title: "Apron worker PPE compliance", detail: "12 audits today", badge: "98% compliant", tone: "ok" as Tone },
  { icon: ShieldCheck, title: "Security checkpoint scanners", detail: "Tech dispatched", badge: "1 offline (T2-B)", tone: "warn" as Tone },
];

const maintenanceRows = [
  { reg: "SU-GDR", type: "B777-300ER", task: "A-check completed", date: "12 May 2026", duration: "32h", status: "Released", tone: "ok" as Tone },
  { reg: "SU-GEU", type: "B787-9", task: "Engine #2 borescope", date: "11 May 2026", duration: "8h", status: "Released", tone: "ok" as Tone },
  { reg: "SU-GCS", type: "A330-300", task: "Hydraulic line repair", date: "11 May 2026", duration: "14h", status: "Released", tone: "ok" as Tone },
  { reg: "SU-GDM", type: "B737-800", task: "Tire and brake change", date: "10 May 2026", duration: "4h", status: "Released", tone: "ok" as Tone },
  { reg: "SU-GBP", type: "A320", task: "Cabin pressurisation test", date: "10 May 2026", duration: "6h", status: "Awaiting parts", tone: "warn" as Tone },
];

const aircraftRiskRows = [
  { reg: "SU-GBP", type: "A320", events: 7, mtbf: "142h", issue: "Pressurisation, APU starts", risk: 78 },
  { reg: "SU-GDC", type: "B737-800", events: 6, mtbf: "168h", issue: "Brake wear, nose gear", risk: 65 },
  { reg: "SU-GCH", type: "A330-200", events: 5, mtbf: "210h", issue: "Galley power, IFE", risk: 54 },
  { reg: "SU-GEK", type: "B787-9", events: 3, mtbf: "320h", issue: "Cabin sensors", risk: 38 },
];

export function App() {
  const [activeTab, setActiveTab] = useState<ManagerTab>("digital");
  const [language, setLanguage] = useState<Language>("en");
  const [highContrast, setHighContrast] = useState(false);
  const times = useHeaderClock();
  const c = copy[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.classList.toggle("hc", highContrast);
  }, [highContrast, language]);

  return (
    <div className="min-h-screen">
      <Header language={language} setLanguage={setLanguage} highContrast={highContrast} setHighContrast={setHighContrast} times={times} />
      <main id="main" className="mx-auto grid w-full max-w-[1620px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Hero activeTab={activeTab} setActiveTab={setActiveTab} language={language} />
        {activeTab === "digital" && <DigitalTwinView />}
        {activeTab === "operations" && <OperationsView />}
        {activeTab === "safety" && <SafetyView />}
      </main>
      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        {c.footer}
        <span className="mx-3 text-muted-foreground/60">♦</span>
        <a className="font-medium text-primary hover:underline" href="https://www.cairo-airport.com/en-us/Airport/Airport-Information" target="_blank" rel="noreferrer">
          {c.resources}
        </a>
      </footer>
    </div>
  );
}

function Header({
  language,
  setLanguage,
  highContrast,
  setHighContrast,
  times,
}: {
  language: Language;
  setLanguage: (language: Language) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  times: { cairo: string; utc: string };
}) {
  const c = copy[language];
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/82 backdrop-blur-xl">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-[1620px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="#main" className="flex min-w-0 items-center gap-3 rounded-md" aria-label="Go to dashboard">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/50 bg-primary/15 glow-cyan">
            <Plane aria-hidden="true" className="h-5 w-5 text-primary" />
          </span>
          <span className="min-w-0">
            <span className="block font-mono text-[11px] uppercase tracking-[0.28em] text-primary">{c.airport}</span>
            <span className="block truncate text-sm font-semibold">{c.brand}</span>
          </span>
        </a>
        <div className="flex items-center gap-2">
          <div className="hidden h-10 items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 md:flex">
            <Clock3 aria-hidden="true" className="h-4 w-4 text-primary" />
            <TimeChip label="Cairo" value={times.cairo} />
            <span className="h-5 w-px bg-border" />
            <TimeChip label="UTC" value={times.utc} />
          </div>
          <button type="button" onClick={() => setHighContrast(!highContrast)} className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-secondary/40 hover:bg-secondary" aria-label={c.contrast}>
            <Contrast aria-hidden="true" className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setLanguage(language === "en" ? "ar" : "en")} className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 text-sm hover:bg-secondary" aria-label={c.language}>
            <Languages aria-hidden="true" className="h-4 w-4 text-primary" />
            {language === "en" ? "AR" : "EN"}
          </button>
        </div>
      </div>
    </header>
  );
}

function TimeChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="font-mono text-xs font-semibold">{value}</span>
    </span>
  );
}

function Hero({ activeTab, setActiveTab, language }: { activeTab: ManagerTab; setActiveTab: (tab: ManagerTab) => void; language: Language }) {
  const c = copy[language];
  const tabs: { id: ManagerTab; label: string; icon: LucideIcon }[] = [
    { id: "digital", label: c.digital, icon: Radar },
    { id: "operations", label: c.operations, icon: Activity },
    { id: "safety", label: c.safety, icon: ShieldCheck },
  ];

  return (
    <section className="manager-hero panel overflow-hidden p-5 sm:p-6">
      <div className="relative z-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">{c.manager}</p>
        <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{c.heroTitle}</h1>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground sm:text-base">{c.heroBody}</p>
        <div className="mt-6 inline-flex max-w-full flex-wrap gap-2 rounded-xl border border-border bg-background/45 p-2 backdrop-blur-md" role="tablist" aria-label="Manager dashboard sections">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex h-12 items-center gap-2 rounded-lg px-5 text-sm font-semibold transition ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DigitalTwinView() {
  const [activeSceneId, setActiveSceneId] = useState<AirportScene["id"]>("overview");
  const [imageOpen, setImageOpen] = useState(false);
  const activeScene = scenes.find((scene) => scene.id === activeSceneId) ?? scenes[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      <SectionPanel className="overflow-hidden p-0" title="">
        <div className="border-b border-border p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">Interactive airport image map</p>
          <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Cairo Airport visual command map</h2>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Use the airport image as the main interactive canvas. Click the hotspots to inspect details and shift into terminal views.
              </p>
            </div>
            <button type="button" onClick={() => setImageOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs hover:bg-secondary">
              <Eye aria-hidden="true" className="h-4 w-4 text-primary" />
              View real image
            </button>
          </div>
        </div>

        <div className="relative min-h-[520px] overflow-hidden bg-black">
          <img src={ASSET} alt="Cairo Airport digital twin reference" className="h-[520px] w-full object-cover opacity-90 transition-[object-position] duration-500" style={{ objectPosition: activeScene.objectPosition }} />
          <div className="absolute inset-0 bg-gradient-to-t from-background/65 via-transparent to-transparent" />
          <Hotspot left="50%" top="26%" label="T3" active={activeSceneId === "t3"} onClick={() => setActiveSceneId("t3")} />
          <Hotspot left="31%" top="44%" label="T1" active={activeSceneId === "t1"} onClick={() => setActiveSceneId("t1")} />
          <Hotspot left="65%" top="38%" label="T2" active={activeSceneId === "t2"} onClick={() => setActiveSceneId("t2")} />
          <Hotspot left="50%" top="62%" label="Overview" active={activeSceneId === "overview"} onClick={() => setActiveSceneId("overview")} />
        </div>

        <div className="grid gap-4 border-t border-border p-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">Selected area</p>
            <h3 className="mt-2 text-lg font-semibold">{activeScene.title}</h3>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">{activeScene.summary}</p>
          </div>
          <div className="flex flex-wrap items-start gap-2">
            <button type="button" onClick={() => setImageOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-secondary">
              <Eye aria-hidden="true" className="h-4 w-4 text-primary" />
              View real image
            </button>
            <button type="button" onClick={() => setActiveSceneId(activeScene.id === "overview" ? "t3" : "overview")} className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">
              {activeScene.id === "overview" ? "Open detailed view" : "Back to overview"}
            </button>
          </div>
        </div>
      </SectionPanel>

      <aside className="grid content-start gap-6">
        <TerminalQuickFacts />
        <WaitTimes />
      </aside>

      {imageOpen && (
        <Modal title={activeScene.title} onClose={() => setImageOpen(false)}>
          <img src={ASSET} alt={activeScene.title} className="max-h-[72vh] w-full rounded-lg object-cover" style={{ objectPosition: activeScene.objectPosition }} />
          <p className="mt-3 text-sm text-muted-foreground">{activeScene.summary}</p>
        </Modal>
      )}
    </div>
  );
}

function Hotspot({ left, top, label, active, onClick }: { left: string; top: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 p-2 shadow-[0_0_28px_var(--cyan)] transition hover:scale-110 ${active ? "border-white bg-primary text-primary-foreground" : "border-primary bg-primary/45 text-white"}`}
      style={{ left, top }}
      aria-label={`Open ${label}`}
    >
      <span className="block h-4 w-4 rounded-full bg-current" />
      <span className="sr-only">{label}</span>
    </button>
  );
}

function TerminalQuickFacts() {
  return (
    <SectionPanel title="Terminal quick facts">
      <div className="space-y-3">
        {terminalFacts.map((terminal) => (
          <article key={terminal.code} className="panel-inner p-4">
            <div className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-primary/40 bg-primary/10 font-mono font-semibold text-primary">{terminal.code}</span>
              <div>
                <h3 className="font-semibold">{terminal.title}</h3>
                <p className="mt-1 text-sm leading-snug text-muted-foreground">{terminal.body}</p>
                <p className="mt-2 font-mono text-[11px] text-muted-foreground">{terminal.detail}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {terminal.airlines.map((airline) => (
                    <span key={airline} className="rounded border border-border px-2 py-1 font-mono text-[10px]">
                      {airline}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </SectionPanel>
  );
}

function WaitTimes() {
  return (
    <SectionPanel title="Wait times">
      <div className="space-y-4">
        {waitTimes.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>{item.label}</span>
              <StatusPill tone={item.tone}>{item.value}m</StatusPill>
            </div>
            <ProgressBar value={item.value} max={25} color={item.tone === "warn" ? "var(--status-warn)" : "var(--cyan)"} />
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}

function OperationsView() {
  return (
    <div className="grid gap-6">
      <SectionPanel title="Needs a decision now" action={<StatusPill tone="warn">3 items</StatusPill>}>
        <div className="grid gap-3 lg:grid-cols-3">
          {decisions.map((decision) => (
            <article key={decision.title} className="panel-inner p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{decision.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{decision.detail}</p>
                </div>
                <StatusPill tone={decision.tone}>{decision.badge}</StatusPill>
              </div>
            </article>
          ))}
        </div>
      </SectionPanel>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Operations key metrics">
        <MetricCard label="Passengers today" value="58,420" hint="Daily benchmark 85k" delta="+4.1% vs yesterday" icon={Users} accent="cyan" />
        <MetricCard label="Aircraft movements" value="412" unit="/ 540" hint="390 average" delta="On schedule" icon={Activity} accent="cyan" />
        <MetricCard label="Avg taxi-out" value="14" unit="min" hint="CAI operations sample" delta="-2 min" deltaTone="warn" icon={Clock3} accent="warn" />
        <MetricCard label="Active alerts" value="3" hint="2 medium, 1 high" delta="Needs review" deltaTone="warn" icon={AlertTriangle} accent="warn" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="grid gap-6">
          <FlightBoard title="Departures" direction="to" rows={departures} />
          <FlightBoard title="Arrivals" direction="from" rows={arrivals} />
        </div>
        <div className="grid content-start gap-6">
          <PassengerFlowChart />
          <QueuePressureChart />
        </div>
      </div>
    </div>
  );
}

function FlightBoard({ title, direction, rows }: { title: string; direction: "to" | "from"; rows: FlightRow[] }) {
  return (
    <SectionPanel title={title} action={<div className="flex gap-2"><StatusPill tone="info">Next 60 min</StatusPill><StatusPill tone="neutral">Sample data</StatusPill></div>}>
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[580px] text-sm">
          <thead className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-1 py-2 text-start">Flight</th>
              <th className="px-1 py-2 text-start">{direction === "to" ? "To" : "From"}</th>
              <th className="px-1 py-2 text-start">Time</th>
              <th className="px-1 py-2 text-start">Gate</th>
              <th className="px-1 py-2 text-start">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.flight} className="border-t border-border/60">
                <td className="px-1 py-3 font-mono font-semibold">{row.flight}</td>
                <td className="px-1 py-3">{row.city}</td>
                <td className="px-1 py-3 font-mono">{row.time}</td>
                <td className="px-1 py-3 font-mono text-muted-foreground">{row.gate}</td>
                <td className="px-1 py-3"><StatusPill tone={row.tone}>{row.status}</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionPanel>
  );
}

function PassengerFlowChart() {
  return (
    <SectionPanel title="Passenger flow" action={<StatusPill tone="neutral">Modelled</StatusPill>}>
      <h3 className="text-base font-semibold">Passenger flow rises into the midday wave</h3>
      <p className="mt-1 text-sm text-muted-foreground">Line chart is used because managers need the trend over time, not a terminal-by-terminal comparison.</p>
      <div className="mt-4">
        <Sparkline data={[28, 34, 42, 48, 58, 51, 61, 70, 66, 72, 69, 76]} height={122} />
        <div className="mt-1 flex justify-between font-mono text-[11px] text-muted-foreground">
          <span>06:00</span>
          <span>Passenger throughput index</span>
          <span>17:00</span>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <FlowZone label="Check-in" percent={62} tone="ok" />
        <FlowZone label="Security" percent={84} tone="warn" />
        <FlowZone label="Passport" percent={71} tone="ok" />
      </div>
    </SectionPanel>
  );
}

function FlowZone({ label, percent, tone }: { label: string; percent: number; tone: "ok" | "warn" }) {
  return (
    <article className="panel-inner p-3 text-center">
      <p className="font-mono text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{percent}%</p>
      <ProgressBar value={percent} color={tone === "warn" ? "var(--status-warn)" : "var(--status-ok)"} className="mt-3" />
    </article>
  );
}

function QueuePressureChart() {
  return (
    <SectionPanel title="Queue pressure by terminal" action={<StatusPill tone="info">Stacked bar</StatusPill>}>
      <p className="mb-4 text-sm text-muted-foreground">Stacked bars show both total queue pressure and which process contributes most.</p>
      <div className="space-y-4">
        {queueRows.map((row) => (
          <div key={row.terminal} className="grid grid-cols-[42px_minmax(0,1fr)_42px] items-center gap-3">
            <span className="font-mono font-semibold">{row.terminal}</span>
            <div className="flex h-4 overflow-hidden rounded-full bg-secondary" aria-label={`${row.terminal} total pressure ${row.total}%`}>
              <span className="bg-cyan" style={{ width: `${row.checkIn}%` }} />
              <span className="bg-cyan/70" style={{ width: `${row.passport}%` }} />
              <span className="bg-cyan/40" style={{ width: `${row.security}%` }} />
            </div>
            <span className="font-mono text-sm text-muted-foreground">{row.total}%</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <Legend color="bg-cyan" label="Check-in" />
        <Legend color="bg-cyan/70" label="Passport" />
        <Legend color="bg-cyan/40" label="Security" />
      </div>
    </SectionPanel>
  );
}

function SafetyView() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <DecisionRecommendations />
        <SafetyControls />
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.96fr)_minmax(460px,1.04fr)]">
        <SafetyAlertAge />
        <SafetyChecks />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <MaintenanceTable />
        <AircraftRiskTable />
      </div>
    </div>
  );
}

function DecisionRecommendations() {
  const rows = [
    { title: "Rebalance security staff", detail: "-4 min expected wait", badge: "Ops" },
    { title: "Fast-track F11 passengers", detail: "Protects departure time", badge: "Gates" },
    { title: "Confirm SU-GBP parts", detail: "Reduces tomorrow risk", badge: "Maintenance" },
  ];
  return (
    <SectionPanel title="Decision recommendations">
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.title} className="panel-inner flex items-start justify-between gap-4 p-4">
            <div>
              <h3 className="font-semibold">{row.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{row.detail}</p>
            </div>
            <StatusPill tone="neutral">{row.badge}</StatusPill>
          </article>
        ))}
      </div>
    </SectionPanel>
  );
}

function SafetyControls() {
  const rows = [
    { title: "Accumulation risk", detail: "3 findings open longer than 24h", badge: "Medium", tone: "warn" as Tone },
    { title: "Action owner", detail: "Every safety item has an owner and due time", badge: "Assigned", tone: "ok" as Tone },
    { title: "Auto-escalation", detail: "Escalates if action has not started", badge: "90 min", tone: "info" as Tone },
  ];
  return (
    <SectionPanel title="Controls to prevent issue build-up">
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.title} className="panel-inner flex items-start justify-between gap-4 p-4">
            <div>
              <h3 className="font-semibold">{row.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{row.detail}</p>
            </div>
            <StatusPill tone={row.tone}>{row.badge}</StatusPill>
          </article>
        ))}
      </div>
    </SectionPanel>
  );
}

function SafetyAlertAge() {
  const buckets = [
    { label: "New", value: 5, tone: "info" as Tone },
    { label: "30-90m", value: 4, tone: "ok" as Tone },
    { label: "2-4h", value: 2, tone: "warn" as Tone },
    { label: "Overdue", value: 1, tone: "crit" as Tone },
  ];
  const max = Math.max(...buckets.map((item) => item.value));
  return (
    <SectionPanel title="Safety alert age" action={<div className="flex shrink-0 flex-wrap justify-end gap-2"><StatusPill tone="neutral">Sample</StatusPill><StatusPill tone="warn">1 overdue</StatusPill></div>} className="h-fit self-start">
      <p className="mb-5 text-sm text-muted-foreground">Aging buckets show whether issues are accumulating before they become critical.</p>
      <div className="grid grid-cols-2 items-end gap-4 sm:grid-cols-4">
        {buckets.map((bucket) => {
          const height = 40 + (bucket.value / max) * 58;
          const color = bucket.tone === "crit" ? "bg-status-crit" : bucket.tone === "warn" ? "bg-status-warn" : bucket.tone === "ok" ? "bg-status-ok" : "bg-cyan";
          return (
            <div key={bucket.label} className="text-center">
              <div className="mx-auto flex h-28 w-full max-w-18 items-end rounded-lg bg-secondary/70 p-2">
                <div className={`w-full rounded-md ${color}`} style={{ height }} aria-label={`${bucket.value} ${bucket.label} alerts`} />
              </div>
              <p className="mt-2 text-lg font-semibold">{bucket.value}</p>
              <p className="text-sm text-muted-foreground">{bucket.label}</p>
            </div>
          );
        })}
      </div>
    </SectionPanel>
  );
}

function SafetyChecks() {
  return (
    <SectionPanel title="Safety checks" className="h-fit self-start">
      <div className="grid gap-3">
        {safetyChecks.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="panel-inner grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="flex min-w-0 items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-primary/40 bg-primary/10">
                  <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                </div>
              </div>
              <div className="sm:justify-self-end">
                <StatusPill tone={item.tone}>{item.badge}</StatusPill>
              </div>
            </article>
          );
        })}
      </div>
    </SectionPanel>
  );
}

function MaintenanceTable() {
  return (
    <SectionPanel title="Recent aircraft maintenance" action={<StatusPill tone="neutral">Viewing sample</StatusPill>}>
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-1 py-2 text-start">A/C</th>
              <th className="px-1 py-2 text-start">Task</th>
              <th className="px-1 py-2 text-start">Date</th>
              <th className="px-1 py-2 text-start">Dur</th>
              <th className="px-1 py-2 text-start">Status</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceRows.map((item) => (
              <tr key={item.reg} className="border-t border-border/60">
                <td className="px-1 py-3 font-mono"><strong>{item.reg}</strong><div className="text-xs text-muted-foreground">{item.type}</div></td>
                <td className="px-1 py-3">{item.task}<div className="text-xs text-muted-foreground">EgyptAir</div></td>
                <td className="px-1 py-3 font-mono text-muted-foreground">{item.date}</td>
                <td className="px-1 py-3 font-mono">{item.duration}</td>
                <td className="px-1 py-3"><StatusPill tone={item.tone}>{item.status}</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionPanel>
  );
}

function AircraftRiskTable() {
  return (
    <SectionPanel title="Aircraft requiring attention" action={<div className="flex gap-2"><StatusPill tone="neutral">Modelled</StatusPill><span className="text-xs text-muted-foreground">30-day risk score</span></div>} className="xl:col-span-2">
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[780px] text-sm">
          <thead className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-1 py-2 text-start">Registration</th>
              <th className="px-1 py-2 text-start">Type</th>
              <th className="px-1 py-2 text-start">Events</th>
              <th className="px-1 py-2 text-start">MTBF</th>
              <th className="px-1 py-2 text-start">Top issue</th>
              <th className="px-1 py-2 text-start">Risk</th>
            </tr>
          </thead>
          <tbody>
            {aircraftRiskRows.map((aircraft) => {
              const color = aircraft.risk >= 70 ? "var(--status-crit)" : aircraft.risk >= 50 ? "var(--status-warn)" : "var(--status-ok)";
              return (
                <tr key={aircraft.reg} className="border-t border-border/60">
                  <td className="px-1 py-3 font-mono font-semibold">{aircraft.reg}</td>
                  <td className="px-1 py-3">{aircraft.type}</td>
                  <td className="px-1 py-3 font-mono">{aircraft.events}</td>
                  <td className="px-1 py-3 font-mono">{aircraft.mtbf}</td>
                  <td className="px-1 py-3 text-muted-foreground">{aircraft.issue}</td>
                  <td className="px-1 py-3">
                    <div className="flex items-center gap-3">
                      <ProgressBar value={aircraft.risk} color={color} className="min-w-36" />
                      <span className="font-mono text-xs" style={{ color }}>{aircraft.risk}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionPanel>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/75 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="panel max-h-[92vh] w-full max-w-5xl overflow-hidden p-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="modal-title" className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-lg border border-border hover:bg-secondary" aria-label="Close">
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function useHeaderClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return useMemo(
    () => ({
      cairo: new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Africa/Cairo",
        timeZoneName: "short",
      }).format(now),
      utc: new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short",
      }).format(now),
    }),
    [now],
  );
}
