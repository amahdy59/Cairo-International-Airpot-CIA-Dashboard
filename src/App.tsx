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
import OperationsView from './features/operations/OperationsView';
import SafetyView from './features/safety/SafetyView';
import { Header, BackToTopButton } from './components/layout/Header';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
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
            <ErrorBoundary>
              <ResourcesAuditPage />
            </ErrorBoundary>
          </div>
        ) : (
        <div key={activeTab} id="main-content" className="grid min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
          <ErrorBoundary>
            {activeTab === "digital" && <DigitalTwinView />}
            {activeTab === "operations" && <OperationsView />}
            {activeTab === "safety" && <SafetyView />}
          </ErrorBoundary>
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
