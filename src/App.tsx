import { useEffect, useState, lazy } from "react";
const ResourcesAuditPage = lazy(() => import("./components/ResourcesAuditPage"));
import { CommandPalette } from "./components/CommandPalette";
import { LocaleContext } from "./context/locale";
import { useHeaderClock } from "./hooks/useHeaderClock";

import { ManagerTab, PageView, ThemeMode, Language, copy } from './data';

import DigitalTwinView from './features/digital-twin/DigitalTwinView';
import OperationsView from './features/operations/OperationsView';
import SafetyView from './features/safety/SafetyView';
import { Header, BackToTopButton } from './components/layout/Header';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { ToastContainer } from './components/common/Toast';
import { SimulationProvider } from './context/simulation';
import { SimulationBanner } from './components/common/SimulationBanner';
import { KioskBar } from './components/common/KioskBar';

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
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [selectedSceneId, setSelectedSceneId] = useState<string | undefined>(undefined);
  const times = useHeaderClock();
  const c = copy[language];
  const isDigitalDashboard = activeTab === "digital" && activePage !== "resources";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("hc", highContrast);
  }, [highContrast, language, theme]);

  useEffect(() => {
    document.getElementById("root")?.removeAttribute("aria-busy");
  }, []);

  useEffect(() => {
    const onHashChange = () => setActivePage(getInitialPageView());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (activePage !== "resources") {
      document.getElementById("main-content")?.focus();
    }
  }, [activeTab, activePage]);

  // Global Keyboard Shortcuts (Ctrl+K palette & 1, 2, 3 tab switching)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K / Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Quick tab switching with 1, 2, 3
      const activeEl = document.activeElement;
      const isInputActive =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          (activeEl as HTMLElement).isContentEditable);

      if (!isInputActive && !isCommandPaletteOpen) {
        if (e.key === "1") {
          e.preventDefault();
          setActiveTab("digital");
          showDashboard();
        } else if (e.key === "2") {
          e.preventDefault();
          setActiveTab("operations");
          showDashboard();
        } else if (e.key === "3") {
          e.preventDefault();
          setActiveTab("safety");
          showDashboard();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen]);

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
      <SimulationProvider activeTab={activeTab} setActiveTab={setActiveTab} onShowDashboard={showDashboard}>
        <div className={`flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 ${theme} ${highContrast ? "high-contrast" : ""} ${isDigitalDashboard ? "lg:h-screen lg:overflow-hidden min-h-screen overflow-x-hidden" : "min-h-screen overflow-x-hidden"}`} dir={language === "ar" ? "rtl" : "ltr"}>
          <Header
            language={language}
            setLanguage={setLanguage}
            theme={theme}
            setTheme={setTheme}
            highContrast={highContrast}
            setHighContrast={setHighContrast}
            times={times}
            activeTab={activeTab}
            activePage={activePage}
            setActiveTab={setActiveTab}
            onShowDashboard={showDashboard}
            onShowResources={showResources}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          />
          <main id="main" className="mx-auto flex flex-col flex-1 min-h-0 w-full max-w-[1480px] min-w-0 px-2 sm:px-4 lg:px-6 pt-28 sm:pt-32 xl:pt-20 pb-3 lg:pb-4">
            {activePage !== "resources" && <h1 className="sr-only">{c.brand} - {c.airport}</h1>}
            {activePage !== "resources" && <SimulationBanner />}
            {activePage === "resources" ? (
              <div id="main-content" tabIndex={-1} className="mt-3 lg:mt-4 outline-none">
                <ErrorBoundary>
                  <Suspense fallback={<div className="panel p-8 text-center text-sm font-mono text-muted-foreground">{language === "ar" ? "جاري تحميل التوثيق..." : "Loading documentation..."}</div>}>
                    <ResourcesAuditPage theme={theme} />
                  </Suspense>
                </ErrorBoundary>
              </div>
            ) : (
            <div key={activeTab} id="main-content" tabIndex={-1} role="tabpanel" aria-label={activeTab === 'digital' ? 'Digital Twin' : activeTab === 'operations' ? 'Operations' : 'Safety & Compliance'} className="flex flex-col flex-1 min-h-0 min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both outline-none">
              <ErrorBoundary>
                {activeTab === "digital" && <DigitalTwinView theme={theme} selectedSceneId={selectedSceneId} />}
                {activeTab === "operations" && <OperationsView />}
                {activeTab === "safety" && <SafetyView />}
              </ErrorBoundary>
            </div>
            )}
          </main>

          {/* Global Command Palette */}
          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            onSelectTab={(tab) => {
              setActiveTab(tab);
              showDashboard();
            }}
            onSelectScene={(sceneId) => {
              setSelectedSceneId(sceneId);
            }}
            language={language}
            setLanguage={setLanguage}
            theme={theme}
            setTheme={setTheme}
            highContrast={highContrast}
            setHighContrast={setHighContrast}
            onShowResources={showResources}
          />

          {/* Real-time Managers Toast Feed */}
          <ToastContainer />

          {/* AOCC Video Wall Auto-Cycle Control Bar */}
          <KioskBar activeTab={activeTab} />

          {!isDigitalDashboard && (
            <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
              {c.footer}
              <span className="mx-3 text-muted-foreground/60" aria-hidden="true">|</span>
              {activePage === "resources" ? (
                <a className="font-medium text-primary hover:underline" href="#" onClick={(event) => { event.preventDefault(); showDashboard(); }}>
                  {language === "en" ? "Go back to Dashboard" : "العودة إلى لوحة التحكم"}
                </a>
              ) : (
                <a className="font-medium text-primary hover:underline" href="#resources" onClick={(event) => { event.preventDefault(); showResources(); }}>
                  {c.resources}
                </a>
              )}
            </footer>
          )}
          {!isDigitalDashboard && <BackToTopButton />}
        </div>
      </SimulationProvider>
    </LocaleContext.Provider>
  );
}
