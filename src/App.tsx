import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  DoorOpen,
  Flame,
  Gauge,
  RadioTower,
  UserCheck,
  Users,
  Wrench,
  Clock3,
  Plane,
} from "lucide-react";
import { MetricCard, ProgressBar, SectionPanel, Sparkline, StatusPill } from "@/components/command-center/MetricWidgets";
import ResourcesAuditPage from "./components/ResourcesAuditPage";
import { LocaleContext, useLocale } from "./context/locale";

import { ManagerTab, PageView, ThemeMode, Language, LocalizedText, MapHotspot, arText, copy, scenes, sampleIncomingFlights, zoneStatusRows, gateWaitRows, influxForecastRows, departures, arrivals, queueRows, safetyChecks, maintenanceRows, aircraftRiskRows, IncomingFlight, Tone, AirportScene, HotspotStatus, FlightRow } from './data';
import { formatCairoTime, localize, localizedFlightStatus, toneCssVar } from './utils/helpers';

import DigitalTwinView from './features/digital-twin/DigitalTwinView';
import { Header, BackToTopButton } from './components/layout/Header';
type AviationStackFlight = {
  airline?: { name?: string };
  flight?: { iata?: string; number?: string };
  departure?: { airport?: string; iata?: string };
  arrival?: { estimated?: string; scheduled?: string; terminal?: string; gate?: string };
  flight_status?: string;
};

type AviationStackResponse = {
  data?: AviationStackFlight[];
};
function getInitialPageView(): PageView {
  if (typeof window === "undefined") {
    return "dashboard";
  }
  return window.location.hash === "#resources" ? "resources" : "dashboard";
}

export function App() {
  const [activeTab, setActiveTab] = useState<ManagerTab>("digital");
  const [activePage, setActivePage] = useState<PageView>(() => getInitialPageView());
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [highContrast, setHighContrast] = useState(false);
  const times = useHeaderClock();
  const c = copy[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("hc", highContrast);
  }, [highContrast, language, theme]);

  useEffect(() => {
    const onHashChange = () => setActivePage(getInitialPageView());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const showDashboard = () => {
    setActivePage("dashboard");
    window.history.pushState(null, "", `${window.location.pathname}${window.location.search}`);
    window.requestAnimationFrame(() => {
      document.getElementById("main")?.scrollIntoView({ block: "start" });
    });
  };

  const showResources = () => {
    setActivePage("resources");
    window.history.pushState(null, "", "#resources");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <LocaleContext.Provider value={language}>
    <div className="min-h-screen">
      <Header language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} highContrast={highContrast} setHighContrast={setHighContrast} times={times} activeTab={activeTab} setActiveTab={setActiveTab} onShowDashboard={showDashboard} />
      <main id="main" className="mx-auto grid w-full max-w-[1480px] min-w-0 gap-3 overflow-x-hidden px-2 pb-4 pt-24 sm:gap-3 sm:px-4 lg:gap-4 lg:px-6">
        {activePage === "resources" ? (
          <div id="main-content">
            <ResourcesAuditPage />
          </div>
        ) : (
        <div key={activeTab} id="main-content" className="grid min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
          {activeTab === "digital" && <DigitalTwinView />}
          {activeTab === "operations" && <OperationsView />}
          {activeTab === "safety" && <SafetyView />}
        </div>
        )}
      </main>
      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        {c.footer}
        <span className="mx-3 text-muted-foreground/60" aria-hidden="true">|</span>
        <a className="font-medium text-primary hover:underline" href="#resources" onClick={(event) => { event.preventDefault(); showResources(); }}>
          {c.resources}
        </a>
      </footer>
      <BackToTopButton />
    </div>
    </LocaleContext.Provider>
  );
}




function useIncomingCaiFlights() {
  const [flights, setFlights] = useState<IncomingFlight[]>(sampleIncomingFlights);
  const [source, setSource] = useState<"loading" | "live" | "sample">("loading");
  const [updatedAt, setUpdatedAt] = useState(() => formatCairoTime(new Date().toISOString()));

  useEffect(() => {
    const apiKey = import.meta.env.VITE_AVIATIONSTACK_KEY as string | undefined;
    if (!apiKey || apiKey === "replace_with_your_aviationstack_access_key") {
      setSource("sample");
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      access_key: apiKey,
      arr_iata: "CAI",
      limit: "6",
    });

    fetch(`https://api.aviationstack.com/v1/flights?${params.toString()}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Flight provider unavailable");
        return response.json() as Promise<AviationStackResponse>;
      })
      .then((payload) => {
        const mapped = (payload.data ?? [])
          .map((item): IncomingFlight | null => {
            const flight = item.flight?.iata ?? item.flight?.number;
            if (!flight) return null;
            const status = item.flight_status ?? "scheduled";
            const normalized = status.toLowerCase();
            const tone: Tone = normalized.includes("delay")
              ? "warn"
              : normalized.includes("landed")
                ? "ok"
                : normalized.includes("active")
                  ? "info"
                  : "neutral";
            const gate = item.arrival?.gate
              ? `${item.arrival.terminal ? `T${item.arrival.terminal} / ` : ""}${item.arrival.gate}`
              : item.arrival?.terminal
                ? `T${item.arrival.terminal} / --`
                : "Gate TBD";
            const origin = item.departure?.iata ? `${item.departure.airport ?? "Origin"} (${item.departure.iata})` : item.departure?.airport ?? "Origin TBD";
            return {
              airline: item.airline?.name ?? "Airline TBD",
              flight,
              eta: formatCairoTime(item.arrival?.estimated ?? item.arrival?.scheduled),
              gate,
              status: status.replace(/_/g, " "),
              tone,
              origin,
            };
          })
          .filter((item): item is IncomingFlight => item != null)
          .slice(0, 4);

        if (mapped.length === 0) {
          setSource("sample");
          return;
        }
        setFlights(mapped);
        setSource("live");
        setUpdatedAt(formatCairoTime(new Date().toISOString()));
      })
      .catch(() => {
        setSource("sample");
      });

    return () => controller.abort();
  }, []);

  return { flights, source, updatedAt };
}


function DigitalOperationalGrid() {
  return (
    <section className="grid gap-3 lg:gap-4 xl:grid-cols-2 xl:items-start" aria-label="Digital twin operational analytics">
      <div className="grid gap-3 lg:gap-4">
        <PassengerInfluxForecast />
        <GateWaitChart />
      </div>
      <div className="grid gap-3 lg:gap-4">
        <AnomalyWarningsPanel />
      </div>
    </section>
  );
}

function PassengerInfluxForecast() {
  const { language } = useLocale();
  return (
    <SectionPanel
      title={localize({ en: "Passenger influx forecast", ar: "توقع تدفق الركاب" }, language)}
      action={<StatusPill tone="neutral">{localize({ en: "Modelled", ar: "نمذجة" }, language)}</StatusPill>}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {localize({ en: "Forecasted trend of passenger flow over the next 4 hours.", ar: "الاتجاه المتوقع لتدفق الركاب خلال الـ 4 ساعات القادمة." }, language)}
      </p>
      <ForecastLineChart />
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <Legend color="bg-cyan" label={localize({ en: "Current trajectory", ar: "المسار الحالي" }, language)} />
        <Legend color="bg-status-warn" label={localize({ en: "Forecast", ar: "التوقع" }, language)} />
      </div>
    </SectionPanel>
  );
}

function ForecastLineChart() {
  const values = influxForecastRows.flatMap((row) => [row.current, row.forecast]);
  const min = Math.min(...values) - 100;
  const max = Math.max(...values) + 100;
  const span = max - min || 1;
  const width = 420;
  const height = 150;
  
  const getPoint = (value: number, index: number): [number, number] => {
    const x = 18 + (index / (influxForecastRows.length - 1)) * (width - 36);
    const y = height - 18 - ((value - min) / span) * (height - 38);
    return [x, y];
  };

  const createSmoothPath = (coords: [number, number][]) => {
    if (coords.length === 0) return "";
    let d = `M ${coords[0][0]},${coords[0][1]}`;
    for (let i = 1; i < coords.length; i++) {
      const p1 = coords[i - 1];
      const p2 = coords[i];
      const cpX = (p1[0] + p2[0]) / 2;
      d += ` C ${cpX},${p1[1]} ${cpX},${p2[1]} ${p2[0]},${p2[1]}`;
    }
    return d;
  };

  const currentCoords = influxForecastRows.map((row, index) => getPoint(row.current, index));
  const forecastCoords = influxForecastRows.map((row, index) => getPoint(row.forecast, index));
  
  const currentPath = createSmoothPath(currentCoords);
  const forecastPath = createSmoothPath(forecastCoords);
  
  const areaPath = currentCoords.length > 0
    ? `${currentPath} L ${currentCoords[currentCoords.length - 1][0]},${height - 18} L ${currentCoords[0][0]},${height - 18} Z`
    : "";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full overflow-visible" role="img" aria-label={`Passenger influx forecast: current trajectory peaks at ${Math.max(...influxForecastRows.map(r => r.current)).toLocaleString()} passengers at +2h, with forecasted peak of ${Math.max(...influxForecastRows.map(r => r.forecast)).toLocaleString()} passengers. Forecast shows an elevated demand window before tapering at +4h.`}>
      <defs>
        <linearGradient id="forecast-cyan-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {[0, 1, 2].map((line) => (
        <line key={line} x1="18" x2={width - 18} y1={28 + line * 42} y2={28 + line * 42} stroke="var(--border)" strokeOpacity="0.55" strokeDasharray={line > 0 ? "4 4" : "none"} />
      ))}
      <path d={areaPath} fill="url(#forecast-cyan-grad)" />
      <path d={currentPath} fill="none" stroke="var(--cyan)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={forecastPath} fill="none" stroke="var(--status-warn)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6" />
      
      {/* Current Points - Dots */}
      {currentCoords.map((coord, index) => (
        <circle key={`curr-${index}`} cx={coord[0]} cy={coord[1]} r="4" fill="var(--background)" stroke="var(--cyan)" strokeWidth="2" />
      ))}
      
      {/* Forecast Points - Dots */}
      {forecastCoords.map((coord, index) => (
        <circle key={`fore-${index}`} cx={coord[0]} cy={coord[1]} r="4" fill="var(--background)" stroke="var(--status-warn)" strokeWidth="2" />
      ))}
      
      {/* X Axis Labels */}
      {influxForecastRows.map((row, index) => (
        <text key={row.time} x={currentCoords[index][0]} y={height - 2} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" className="font-mono">
          {row.time}
        </text>
      ))}
    </svg>
  );
}

function GateWaitChart() {
  const { language } = useLocale();
  return (
    <SectionPanel
      title={localize({ en: "Average wait time per gate", ar: "متوسط الانتظار لكل بوابة" }, language)}
      action={<StatusPill tone="warn">{localize({ en: "F11 needs action", ar: "F11 يحتاج إجراء" }, language)}</StatusPill>}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {localize({ en: "Current wait times across active gates.", ar: "أوقات الانتظار الحالية عبر البوابات النشطة." }, language)}
      </p>
      <div className="grid gap-3">
        {gateWaitRows.map((row) => (
          <div key={row.gate} className="grid grid-cols-[48px_minmax(0,1fr)_58px] items-center gap-3">
            <span className="font-mono text-sm font-semibold">{row.gate}</span>
            <ProgressBar value={row.wait} max={30} color={toneCssVar(row.tone)} />
            <span className="justify-self-end font-mono text-sm text-muted-foreground">{row.wait}m</span>
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}

function AnomalyWarningsPanel() {
  const { language } = useLocale();
  const warnings = [
    { icon: Gauge, title: { en: "Threshold warning", ar: "تحذير حد تشغيلي" }, detail: { en: "Security may exceed 25 minutes within the next hour.", ar: "قد يتجاوز الأمن 25 دقيقة خلال الساعة القادمة." }, tone: "warn" as Tone },
    { icon: RadioTower, title: { en: "Ground crew buffer", ar: "احتياطي الطاقم الأرضي" }, detail: { en: "Coverage is healthy; keep floaters near T3 passport.", ar: "التغطية جيدة؛ أبق الدعم المتحرك قرب جوازات مبنى 3." }, tone: "ok" as Tone },
    { icon: DoorOpen, title: { en: "Open counter recommendation", ar: "توصية فتح كاونتر" }, detail: { en: "Open two counters before the +2h forecast peak.", ar: "افتح كاونترين قبل ذروة التوقع بعد ساعتين." }, tone: "info" as Tone },
  ];
  return (
    <SectionPanel title={localize({ en: "Anomaly alerts and recommendations", ar: "تنبيهات الشذوذ والتوصيات" }, language)} action={<StatusPill tone="info">AI</StatusPill>}>
      <div className="grid gap-3">
        {warnings.map((warning) => {
          const Icon = warning.icon;
          return (
            <article key={warning.title.en} className="panel-inner flex items-start gap-3 p-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border bg-background/60">
                <Icon aria-hidden="true" className="h-4 w-4" style={{ color: toneCssVar(warning.tone) }} />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{localize(warning.title, language)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{localize(warning.detail, language)}</p>
              </div>
            </article>
          );
        })}
      </div>
    </SectionPanel>
  );
}

function OperationsView() {
  const { tr } = useLocale();
  return (
    <div className="grid gap-3 lg:gap-4">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="Operations key metrics">
        <MetricCard label={tr("Passengers today")} value="58,420" hint={tr("Daily benchmark 85k")} delta={tr("+4.1% vs yesterday")} icon={Users} accent="cyan" />
        <MetricCard label={tr("Aircraft movements")} value="412" unit="/ 540" hint={tr("390 average")} delta={tr("On schedule")} icon={Activity} accent="cyan" />
        <MetricCard label={tr("Avg taxi-out")} value="14" unit="min" hint={tr("CIA operations sample")} delta="-2 min" deltaTone="warn" icon={Clock3} accent="warn" />
        <MetricCard label={tr("Active alerts")} value="3" hint={tr("2 medium, 1 high")} delta={tr("Needs review")} deltaTone="warn" icon={AlertTriangle} accent="warn" />
      </section>

      {/* Middle: Charts for visual absorption */}
      <div className="grid gap-3 lg:gap-4 xl:grid-cols-2">
        <PassengerFlowChart />
        <QueuePressureChart />
      </div>

      {/* Tables: Detailed lists */}
      <div className="grid gap-3 lg:gap-4 xl:grid-cols-2">
        <FlightBoard title={tr("Departures")} direction="to" rows={departures} />
        <FlightBoard title={tr("Arrivals")} direction="from" rows={arrivals} />
      </div>

      <DigitalOperationalGrid />
    </div>
  );
}

function FlightBoard({ title, direction, rows }: { title: string; direction: "to" | "from"; rows: FlightRow[] }) {
  const { tr } = useLocale();
  return (
    <SectionPanel title={title} action={<div className="flex flex-wrap gap-2"><StatusPill tone="info">{tr("Next 60 min")}</StatusPill><StatusPill tone="neutral">{tr("Sample data")}</StatusPill></div>}>
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[580px] text-sm">
          <thead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-1 py-2 text-start">{tr("Flight")}</th>
              <th className="px-1 py-2 text-start">{direction === "to" ? tr("To") : tr("From")}</th>
              <th className="px-1 py-2 text-start">{tr("Time")}</th>
              <th className="px-1 py-2 text-start">{tr("Gate")}</th>
              <th className="px-1 py-2 text-start">{tr("Status")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.flight} className="border-t border-border/60">
                <td className="px-1 py-3 font-mono font-semibold">{row.flight}</td>
                <td className="px-1 py-3">{row.city}</td>
                <td className="px-1 py-3 font-mono">{row.time}</td>
                <td className="px-1 py-3 font-mono text-muted-foreground">{row.gate}</td>
                <td className="px-1 py-3"><StatusPill tone={row.tone}>{tr(row.status)}</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionPanel>
  );
}

function PassengerFlowChart() {
  const { tr, language } = useLocale();
  return (
    <SectionPanel title={tr("Passenger flow")} action={<StatusPill tone="neutral">{tr("Modelled")}</StatusPill>}>
      <h3 className="text-base font-semibold">{tr("Passenger flow rises into the midday wave")}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{localize({ en: "Hourly progression of passenger throughput across all terminals.", ar: "التطور الساعي لتدفق الركاب عبر جميع المباني." }, language)}</p>
      <div className="mt-4">
        <Sparkline data={[28, 34, 42, 48, 58, 51, 61, 70, 66, 72, 69, 76]} height={122} aria-label="Line chart showing passenger throughput rising from 06:00 to a midday peak, then tapering toward 17:00" />
        <div className="mt-1 flex justify-between font-mono text-xs text-muted-foreground">
          <span>06:00</span>
          <span>{tr("Passenger throughput index")}</span>
          <span>17:00</span>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <FlowZone label={tr("Check-in")} percent={62} tone="ok" />
        <FlowZone label={tr("Security")} percent={84} tone="warn" />
        <FlowZone label={tr("Passport")} percent={71} tone="ok" />
      </div>
    </SectionPanel>
  );
}

function FlowZone({ label, percent, tone }: { label: string; percent: number; tone: "ok" | "warn" }) {
  return (
    <article className="panel-inner p-3 text-center">
      <p className="font-mono text-xs text-muted-foreground font-medium">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{percent}%</p>
      <ProgressBar value={percent} color={tone === "warn" ? "var(--status-warn)" : "var(--status-ok)"} className="mt-3" />
    </article>
  );
}

function QueuePressureChart() {
  const { tr, language } = useLocale();
  return (
    <SectionPanel title={tr("Queue pressure by terminal")} action={<StatusPill tone="info">{tr("Stacked bar")}</StatusPill>}>
      <p className="mb-4 text-sm text-muted-foreground">{localize({ en: "Breakdown of passenger congestion by processing stage.", ar: "تفصيل ازدحام الركاب حسب مرحلة المعالجة." }, language)}</p>
      
      {/* Screen reader accessible data table */}
      <table className="sr-only">
        <caption>{tr("Queue pressure by terminal")}</caption>
        <thead>
          <tr><th>Terminal</th><th>Check-in</th><th>Passport</th><th>Security</th><th>Total</th></tr>
        </thead>
        <tbody>
          {queueRows.map((row) => (
            <tr key={`sr-${row.terminal}`}>
              <td>{row.terminal}</td><td>{row.checkIn}%</td><td>{row.passport}%</td><td>{row.security}%</td><td>{row.total}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-4" aria-hidden="true">
        {queueRows.map((row) => (
          <div key={row.terminal} className="grid grid-cols-[42px_minmax(0,1fr)_42px] items-center gap-3">
            <span className="font-mono font-semibold">{row.terminal}</span>
            <div className="flex h-4 overflow-hidden rounded-full bg-secondary">
              <span className="bg-cyan transition-opacity hover:opacity-80 cursor-help" style={{ width: `${row.checkIn}%` }} title={`${tr("Check-in")}: ${row.checkIn}%`} />
              <span className="bg-cyan/70 transition-opacity hover:opacity-80 cursor-help" style={{ width: `${row.passport}%` }} title={`${tr("Passport")}: ${row.passport}%`} />
              <span className="bg-cyan/40 transition-opacity hover:opacity-80 cursor-help" style={{ width: `${row.security}%` }} title={`${tr("Security")}: ${row.security}%`} />
            </div>
            <span className="font-mono text-sm text-muted-foreground">{row.total}%</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground" aria-hidden="true">
        <Legend color="bg-cyan" label={tr("Check-in")} />
        <Legend color="bg-cyan/70" label={tr("Passport")} />
        <Legend color="bg-cyan/40" label={tr("Security")} />
      </div>
    </SectionPanel>
  );
}

function SafetyView() {
  return (
    <div className="flex flex-col gap-3 lg:gap-4">
      {/* Top Section: two-column grid, self-start prevents height stretching */}
      <div className="grid gap-3 lg:gap-4 xl:grid-cols-2 xl:items-start">
        <div className="grid min-w-0 content-start gap-3 lg:gap-4">
          <SafetyAlertAge />
          <AircraftRiskTable />
        </div>
        <div className="grid min-w-0 content-start gap-3 lg:gap-4">
          <SafetyChecks />
          <MaintenanceTable />
        </div>
      </div>
      {/* Merged priority actions + controls card */}
      <PriorityActionsPanel />
    </div>
  );
}

function PriorityActionsPanel() {
  const { tr } = useLocale();
  const actions = [
    {
      icon: Users,
      title: "Rebalance security staff",
      outcome: "-4 min expected wait",
      badge: "Ops",
      badgeTone: "info" as Tone,
      controlIcon: AlertTriangle,
      controlText: "3 findings open longer than 24h",
      controlBadge: "Medium",
      controlTone: "warn" as Tone,
    },
    {
      icon: Plane,
      title: "Fast-track F11 passengers",
      outcome: "Protects departure time",
      badge: "Gates",
      badgeTone: "ok" as Tone,
      controlIcon: UserCheck,
      controlText: "Every safety item has an owner and due time",
      controlBadge: "Assigned",
      controlTone: "ok" as Tone,
    },
    {
      icon: Wrench,
      title: "Confirm SU-GBP parts",
      outcome: "Reduces tomorrow risk",
      badge: "Maintenance",
      badgeTone: "warn" as Tone,
      controlIcon: Clock3,
      controlText: "Escalates if action has not started",
      controlBadge: "Auto-escalation",
      controlTone: "info" as Tone,
    },
  ];
  return (
    <SectionPanel
      title={tr("Decision recommendations")}
      action={<div className="flex gap-2"><StatusPill tone="warn">{tr("3 items")}</StatusPill><StatusPill tone="neutral">{tr("Controls to prevent issue build-up")}</StatusPill></div>}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {actions.map((action) => {
          const ActionIcon = action.icon;
          const ControlIcon = action.controlIcon;
          return (
            <article key={action.title} className="panel-inner overflow-hidden flex flex-col">
              {/* Recommendation section */}
              <div className="flex flex-col items-center text-center gap-2.5 p-4 pb-3.5">
                <div
                  className="grid h-11 w-11 place-items-center rounded-xl border border-border/60 bg-background/65"
                  style={{ boxShadow: `0 0 20px color-mix(in srgb, ${toneCssVar(action.badgeTone)} 20%, transparent)` }}
                >
                  <ActionIcon aria-hidden="true" className="h-5 w-5" style={{ color: toneCssVar(action.badgeTone) }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{tr(action.title)}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{tr(action.outcome)}</p>
                </div>
                <StatusPill tone={action.badgeTone}>{tr(action.badge)}</StatusPill>
              </div>
              {/* Control context section */}
              <div className="mt-auto border-t border-border/50 bg-secondary/20 p-3 flex flex-col gap-2">
                <div className="flex items-start gap-2">
                  <ControlIcon aria-hidden="true" className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: toneCssVar(action.controlTone) }} />
                  <p className="text-xs text-muted-foreground leading-relaxed">{tr(action.controlText)}</p>
                </div>
                <StatusPill tone={action.controlTone}>{tr(action.controlBadge)}</StatusPill>
              </div>
            </article>
          );
        })}
      </div>
    </SectionPanel>
  );
}

function SafetyAlertAge() {
  const { tr } = useLocale();
  const buckets = [
    { label: "New", value: 5, tone: "info" as Tone },
    { label: "30-90m", value: 4, tone: "ok" as Tone },
    { label: "2-4h", value: 2, tone: "warn" as Tone },
    { label: "Overdue", value: 1, tone: "crit" as Tone },
  ];
  const max = Math.max(...buckets.map((item) => item.value));
  return (
    <SectionPanel title={tr("Safety alert age")} action={<div className="flex shrink-0 flex-wrap justify-end gap-2"><StatusPill tone="neutral">{tr("Sample")}</StatusPill><StatusPill tone="warn">{tr("1 overdue")}</StatusPill></div>} className="h-fit self-start">
      <p className="mb-5 text-sm text-muted-foreground">{tr("Aging buckets show whether issues are accumulating before they become critical.")}</p>
      <div className="grid grid-cols-2 items-end gap-4 sm:grid-cols-4">
        {buckets.map((bucket) => {
          const height = 40 + (bucket.value / max) * 58;
          const color = bucket.tone === "crit" ? "bg-status-crit" : bucket.tone === "warn" ? "bg-status-warn" : bucket.tone === "ok" ? "bg-status-ok" : "bg-cyan";
          return (
            <div key={bucket.label} className="text-center">
              <div className="mx-auto flex h-28 w-full max-w-18 items-end rounded-lg bg-secondary/70 p-2">
                <div className={`w-full rounded-md ${color}`} style={{ height }} aria-label={`${bucket.value} ${tr(bucket.label)}`} />
              </div>
              <p className="mt-2 text-lg font-semibold">{bucket.value}</p>
              <p className="text-sm text-muted-foreground">{tr(bucket.label)}</p>
            </div>
          );
        })}
      </div>
    </SectionPanel>
  );
}

function SafetyChecks() {
  const { tr } = useLocale();
  return (
    <SectionPanel title={tr("Safety checks")} className="h-fit self-start">
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
                  <h3 className="font-semibold">{tr(item.title)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{tr(item.detail)}</p>
                </div>
              </div>
              <div className="sm:justify-self-end">
                <StatusPill tone={item.tone}>{tr(item.badge)}</StatusPill>
              </div>
            </article>
          );
        })}
      </div>
    </SectionPanel>
  );
}

function MaintenanceTable() {
  const { tr } = useLocale();
  return (
    <SectionPanel title={tr("Recent aircraft maintenance")} action={<StatusPill tone="neutral">{tr("Viewing sample")}</StatusPill>}>
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-1 py-2 text-start">{tr("A/C")}</th>
              <th className="px-1 py-2 text-start">{tr("Task")}</th>
              <th className="px-1 py-2 text-start">{tr("Date")}</th>
              <th className="px-1 py-2 text-start">{tr("Dur")}</th>
              <th className="px-1 py-2 text-start">{tr("Status")}</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceRows.map((item) => (
              <tr key={item.reg} className="border-t border-border/60">
                <td className="px-1 py-3 font-mono"><strong>{item.reg}</strong><div className="text-xs text-muted-foreground">{item.type}</div></td>
                <td className="px-1 py-3">{tr(item.task)}<div className="text-xs text-muted-foreground">EgyptAir</div></td>
                <td className="px-1 py-3 font-mono text-muted-foreground">{item.date}</td>
                <td className="px-1 py-3 font-mono">{item.duration}</td>
                <td className="px-1 py-3"><StatusPill tone={item.tone}>{tr(item.status)}</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionPanel>
  );
}

function AircraftRiskTable() {
  const { tr } = useLocale();
  return (
    <SectionPanel title={tr("Aircraft requiring attention")} action={<div className="flex flex-wrap gap-2"><StatusPill tone="neutral">{tr("Modelled")}</StatusPill><span className="text-xs text-muted-foreground">{tr("30-day risk score")}</span></div>}>
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[780px] text-sm">
          <thead className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-1 py-2 text-start">{tr("Registration")}</th>
              <th className="px-1 py-2 text-start">{tr("Type")}</th>
              <th className="px-1 py-2 text-start">{tr("Events")}</th>
              <th className="px-1 py-2 text-start">MTBF</th>
              <th className="px-1 py-2 text-start">{tr("Top issue")}</th>
              <th className="px-1 py-2 text-start">{tr("Risk")}</th>
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
      }).format(now),
      utc: new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      }).format(now),
    }),
    [now],
  );
}
