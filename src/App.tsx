import { useEffect, useState } from "react";
import ResourcesAuditPage from "./components/ResourcesAuditPage";
import { CommandPalette } from "./components/CommandPalette";
import { LocaleContext } from "./context/locale";
import { useHeaderClock } from "./hooks/useHeaderClock";

import { ManagerTab, PageView, ThemeMode, Language, copy } from './data';

import DigitalTwinView from './features/digital-twin/DigitalTwinView';
import OperationsView from './features/operations/OperationsView';
import SafetyView from './features/safety/SafetyView';
import StaffingView from './features/staffing/StaffingView';
import { Header, BackToTopButton } from './components/layout/Header';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { ToastContainer } from './components/common/Toast';
import { SimulationProvider } from './context/simulation';
import { SimulationBanner } from './components/common/SimulationBanner';
import { KioskBar } from './components/common/KioskBar';
import { ExecutivePulseBar } from './components/layout/ExecutivePulseBar';
import { safeStorage } from './utils/safeStorage';

function getInitialPageView(): PageView {
  if (typeof window === "undefined") {
    return "dashboard";
  }
  const hash = window.location.hash.toLowerCase();
  return hash === "#resources" || hash === "#docs" || hash === "#documentation" || hash === "#spec"
    ? "resources"
    : "dashboard";
}

function getInitialTab(): ManagerTab {
  if (typeof window === "undefined") return "digital";
  const hash = window.location.hash.toLowerCase();
  if (hash === "#staffing" || hash === "#hr" || hash === "#workforce") return "staffing";
  if (hash === "#operations" || hash === "#ops") return "operations";
  if (hash === "#safety") return "safety";
  return "digital";
}

function getInitialTheme(): ThemeMode {
  const saved = safeStorage.getItem("cai_theme");
  if (saved === "light" || saved === "dark") return saved;
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: light)").matches) {
    return "light";
  }
  return "dark";
}

function getInitialHighContrast(): boolean {
  const saved = safeStorage.getItem("cai_high_contrast");
  if (saved === "true") return true;
  if (saved === "false") return false;
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-contrast: more)").matches) {
    return true;
  }
  return false;
}

function getInitialLanguage(): Language {
  const saved = safeStorage.getItem("cai_language");
  if (saved === "en" || saved === "ar") return saved;
  if (typeof navigator !== "undefined" && navigator.language && navigator.language.startsWith("ar")) {
    return "ar";
  }
  return "en";
}

export function App() {
  const [activeTab, setActiveTab] = useState<ManagerTab>(() => getInitialTab());
  const [activePage, setActivePage] = useState<PageView>(() => getInitialPageView());
  const [language, setLanguageState] = useState<Language>(() => getInitialLanguage());
  const [theme, setThemeState] = useState<ThemeMode>(() => getInitialTheme());
  const [highContrast, setHighContrastState] = useState<boolean>(() => getInitialHighContrast());
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    safeStorage.setItem("cai_theme", newTheme);
  };

  const setHighContrast = (val: boolean) => {
    setHighContrastState(val);
    safeStorage.setItem("cai_high_contrast", val ? "true" : "false");
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    safeStorage.setItem("cai_language", lang);
  };
  const [selectedSceneId, setSelectedSceneId] = useState<string | undefined>(undefined);
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
    document.getElementById("root")?.removeAttribute("aria-busy");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const colorSchemeMq = window.matchMedia("(prefers-color-scheme: light)");
    const contrastMq = window.matchMedia("(prefers-contrast: more)");

    const onColorSchemeChange = (e: MediaQueryListEvent) => {
      if (!safeStorage.getItem("cai_theme")) {
        setThemeState(e.matches ? "light" : "dark");
      }
    };

    const onContrastChange = (e: MediaQueryListEvent) => {
      if (!safeStorage.getItem("cai_high_contrast")) {
        setHighContrastState(e.matches);
      }
    };

    colorSchemeMq.addEventListener?.("change", onColorSchemeChange);
    contrastMq.addEventListener?.("change", onContrastChange);
    return () => {
      colorSchemeMq.removeEventListener?.("change", onColorSchemeChange);
      contrastMq.removeEventListener?.("change", onContrastChange);
    };
  }, []);

  useEffect(() => {
    const onHashChange = () => setActivePage(getInitialPageView());
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHashChange);
    };
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
        } else if (e.key === "4") {
          e.preventDefault();
          setActiveTab("staffing");
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
    window.history.pushState(null, "", "#docs");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <LocaleContext.Provider value={language}>
      <SimulationProvider activeTab={activeTab} setActiveTab={setActiveTab} onShowDashboard={showDashboard}>
        <div className={`flex flex-col min-h-screen overflow-x-hidden bg-background text-foreground antialiased selection:bg-primary/20 ${theme} ${highContrast ? "high-contrast" : ""}`} dir={language === "ar" ? "rtl" : "ltr"}>
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
          <main id="main" className="mx-auto flex flex-col flex-1 min-h-0 w-full max-w-[1720px] min-w-0 px-2 sm:px-4 lg:px-8 pt-20 pb-3 lg:pb-4">
            {activePage !== "resources" && <h1 className="sr-only">{c.brand} - {c.airport}</h1>}
            {activePage !== "resources" && <SimulationBanner />}
            {activePage !== "resources" && (
              <ExecutivePulseBar
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  showDashboard();
                }}
              />
            )}
            {activePage === "resources" ? (
              <div id="main-content" tabIndex={-1} className="mt-3 lg:mt-4 outline-none">
                <ErrorBoundary>
                  <ResourcesAuditPage theme={theme} onReturnToDashboard={showDashboard} />
                </ErrorBoundary>
              </div>
            ) : (
            <div key={activeTab} id="main-content" tabIndex={-1} role="tabpanel" aria-label={activeTab === 'digital' ? 'Digital Twin' : activeTab === 'operations' ? 'Operations' : activeTab === 'safety' ? 'Safety & Compliance' : 'Staffing & Workforce'} className="flex flex-col flex-1 min-h-0 min-w-0 fade-rise outline-none">
              <ErrorBoundary>
                {activeTab === "digital" && <DigitalTwinView theme={theme} selectedSceneId={selectedSceneId} />}
                {activeTab === "operations" && <OperationsView />}
                {activeTab === "safety" && <SafetyView />}
                {activeTab === "staffing" && <StaffingView />}
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
          <BackToTopButton />
        </div>
      </SimulationProvider>
    </LocaleContext.Provider>
  );
}
