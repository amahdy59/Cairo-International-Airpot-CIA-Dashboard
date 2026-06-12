import { useEffect, useMemo, useState } from "react";
import ResourcesAuditPage from "./components/ResourcesAuditPage";
import { LocaleContext } from "./context/locale";

import { ManagerTab, PageView, ThemeMode, Language, copy } from './data';

import DigitalTwinView from './features/digital-twin/DigitalTwinView';
import OperationsView from './features/operations/OperationsView';
import SafetyView from './features/safety/SafetyView';
import { Header, BackToTopButton } from './components/layout/Header';
import { ErrorBoundary } from './components/layout/ErrorBoundary';

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
      <main id="main" className="mx-auto grid w-full max-w-[1480px] min-w-0 gap-3 overflow-x-hidden px-2 pb-4 pt-[84px] sm:pt-24 sm:gap-3 sm:px-4 lg:gap-4 lg:px-6">
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
