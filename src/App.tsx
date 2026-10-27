import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { CommandPalette } from "./components/CommandPalette";
import { LocaleContext } from "./context/locale";
import { useHeaderClock } from "./hooks/useHeaderClock";

import { ManagerTab, PageView, ThemeMode, Language, copy } from './data';

import DigitalTwinView from './features/digital-twin/DigitalTwinView';
import { Header, BackToTopButton } from './components/layout/Header';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { ToastContainer } from './components/common/Toast';
import { SimulationProvider } from './context/simulation';
import { OperationalProvider } from './context/operationalEvents';
import { OperationalWorkQueue } from './components/command-center/OperationalWorkQueue';
import { SimulationBanner } from './components/common/SimulationBanner';
import { KioskBar } from './components/common/KioskBar';
import { ExecutivePulseBar } from './components/layout/ExecutivePulseBar';
import { safeStorage } from './utils/safeStorage';

const ResourcesAuditPage = lazy(() => import("./components/ResourcesAuditPage"));
const OperationsView = lazy(() => import("./features/operations/OperationsView"));
const SafetyView = lazy(() => import("./features/safety/SafetyView"));
const StaffingView = lazy(() => import("./features/staffing/StaffingView"));

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
  const [operationsSubView, setOperationsSubView] = useState<"flights" | "analytics">("flights");
  const times = useHeaderClock();
  const c = copy[language];
  const loadingView = <p role="status" className="panel p-6 text-sm text-muted-foreground">{language === "ar" ? "جاري تحميل القسم…" : "Loading workspace…"}</p>;

  const showDashboard = useCallback(() => {
    setActivePage("dashboard");
    window.history.pushState(null, "", `${window.location.pathname}${window.location.search}#${activeTab}`);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0 }));
  }, [activeTab]);

  const handleNavigateTab = (tab: ManagerTab, subView?: "flights" | "analytics") => {
    setActiveTab(tab);
    if (subView) {
      setOperationsSubView(subView);
    }
    showDashboard();
  };

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
    const onHashChange = () => {
      if (["#main", "#main-content"].includes(window.location.hash)) return;
      setActivePage(getInitialPageView());
      setActiveTab(getInitialTab());
    };
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHashChange);
    };
  }, []);

  useEffect(() => {
    const hash = activePage === "resources" ? "#docs" : `#${activeTab}`;
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${hash}`);
  }, [activeTab, activePage]);

  useEffect(() => {
    if (activePage !== "resources") {
      document.getElementById("main-content")?.focus({ preventScroll: true });
    }
  }, [activeTab, activePage]);

  // Global Keyboard Shortcuts (Ctrl+K palette & 1, 2, 3 tab switching)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K / Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        if (!isCommandPaletteOpen && document.querySelector('[aria-modal="true"]')) return;
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

      if (!isInputActive && !isCommandPaletteOpen && !e.ctrlKey && !e.metaKey && !e.altKey && !document.querySelector('[aria-modal="true"]')) {
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
  }, [isCommandPaletteOpen, showDashboard]);

  const showResources = () => {
    setActivePage("resources");
    window.history.pushState(null, "", "#docs");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <LocaleContext.Provider value={language}>
      <SimulationProvider activeTab={activeTab} setActiveTab={setActiveTab} onShowDashboard={showDashboard}>
      <OperationalProvider>
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
          <main id="main" tabIndex={-1} className="mx-auto flex flex-col flex-1 min-h-0 w-full max-w-[1720px] min-w-0 px-3 sm:px-5 lg:px-8 pt-20 pb-5 lg:pb-6">
            {activePage !== "resources" && (
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">{c.airport}</p>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{activeTab === "digital" ? (language === "ar" ? "التوأم الرقمي" : "Digital twin") : activeTab === "operations" ? (language === "ar" ? "العمليات" : "Operations") : activeTab === "safety" ? (language === "ar" ? "السلامة والامتثال" : "Safety & compliance") : (language === "ar" ? "القوى العاملة" : "Staffing & workforce")}</h1>
                </div>
                <details className="max-w-full rounded-lg border border-border bg-card text-xs text-muted-foreground sm:max-w-md">
                  <summary className="flex min-h-11 cursor-pointer items-center px-3 py-2 font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                    {language === "ar" ? "مصادر البيانات · نموذج تدريبي" : "Data sources · training prototype"}
                  </summary>
                  <p className="border-t border-border px-3 py-2 leading-relaxed">
                    {activeTab === "digital"
                      ? language === "ar" ? "الخريطة والمواقف والكاميرات أمثلة ثابتة. تعرض بطاقة الرحلات حالة مصدرها إن تم تكوينه؛ بخلاف ذلك تظهر رحلات نموذجية. لا يوجد وقت رصد مباشر للخريطة." : "Map, stands, and camera stills are fixed examples. The flight card reports provider status if configured; otherwise it shows sample flights. No live map observation time is available."
                      : activeTab === "operations"
                      ? language === "ar" ? "الرحلات والأوقات وتوقعات التدفق قيم سيناريو. السعة تقدير نموذجي، ولا تتوفر قياسات مباشرة أو وقت تحديث تشغيلي." : "Flights, milestones, and flow forecasts are scenario values. Capacity is modeled; no live measurement or operational update time is available."
                      : activeTab === "safety"
                      ? language === "ar" ? "الحوادث والمؤشرات وقوائم المراجعة أمثلة تدريبية. لم تتحقق جهة المطار من الإجراءات أو حدود التنبيه أو تنفيذ أي إجراء." : "Incidents, indicators, and checklists are training examples. Local procedures, thresholds, and action execution are not verified."
                      : language === "ar" ? "الأسماء والمناوبات والتأهيلات سجلات نموذجية. تُحسب صلاحية التاريخ حسب ساعة الجهاز؛ لا يوجد اتصال بنظام الموارد البشرية." : "Names, shifts, and qualifications are sample records. Date validity uses the device clock; no workforce system is connected."}
                  </p>
                </details>
              </div>
            )}
            {activePage !== "resources" && <SimulationBanner />}
            {activePage !== "resources" && (
              <ExecutivePulseBar onNavigateTab={handleNavigateTab} />
            )}
            {activePage !== "resources" && <OperationalWorkQueue onNavigateTab={handleNavigateTab} />}
            {activePage === "resources" ? (
              <div id="main-content" tabIndex={-1} className="mt-3 lg:mt-4 outline-none">
                <ErrorBoundary>
                  <Suspense fallback={loadingView}>
                  <ResourcesAuditPage theme={theme} onReturnToDashboard={showDashboard} />
                  </Suspense>
                </ErrorBoundary>
              </div>
            ) : (
            <div key={activeTab} id="main-content" tabIndex={-1} role="tabpanel" aria-label={activeTab === 'digital' ? (language === 'ar' ? 'التوأم الرقمي' : 'Digital Twin') : activeTab === 'operations' ? (language === 'ar' ? 'العمليات' : 'Operations') : activeTab === 'safety' ? (language === 'ar' ? 'السلامة والامتثال' : 'Safety & Compliance') : (language === 'ar' ? 'القوى العاملة' : 'Staffing & Workforce')} className="flex flex-col flex-1 min-h-0 min-w-0 fade-rise outline-none">
              <ErrorBoundary>
                <Suspense fallback={loadingView}>
                {activeTab === "digital" && (
                  <DigitalTwinView
                    theme={theme}
                    selectedSceneId={selectedSceneId}
                    onNavigateTab={handleNavigateTab}
                  />
                )}
                {activeTab === "operations" && (
                  <OperationsView
                    subView={operationsSubView}
                    onSubViewChange={setOperationsSubView}
                    onNavigateTab={handleNavigateTab}
                  />
                )}
                {activeTab === "safety" && <SafetyView />}
                {activeTab === "staffing" && <StaffingView />}
                </Suspense>
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

          <footer className="border-t border-border/80 px-4 py-6 text-xs text-muted-foreground">
            <div className="max-w-[1720px] mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-start">
              <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                <span>{c.footer}</span>
                <span className="text-muted-foreground/50 hidden sm:inline" aria-hidden="true">&bull;</span>
                <span className="font-medium text-foreground/80">
                  {language === "ar"
                    ? "تصميم وهندسة النظم: أحمد مهدي (أدفانسيس للحلول المتطورة)"
                    : "Designed & Architected by Ahmed Mahdy (Advansys IS)"}
                </span>
              </div>
              <div className="flex items-center gap-3 font-medium flex-wrap justify-center">
                <a
                  href="https://www.linkedin.com/in/creativemahdy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  LinkedIn
                </a>
                <span className="text-muted-foreground/40" aria-hidden="true">&bull;</span>
                <a
                  href="https://creativemahdy.space/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {language === "ar" ? "السيرة الذاتية" : "Resume"}
                </a>
                <span className="text-muted-foreground/40" aria-hidden="true">&bull;</span>
                {activePage === "resources" ? (
                  <a className="text-primary hover:underline font-bold" href="#" onClick={(event) => { event.preventDefault(); showDashboard(); }}>
                    {language === "en" ? "Dashboard" : "لوحة التحكم"}
                  </a>
                ) : (
                  <a className="text-primary hover:underline font-bold" href="#resources" onClick={(event) => { event.preventDefault(); showResources(); }}>
                    {c.resources}
                  </a>
                )}
                <BackToTopButton />
              </div>
            </div>
          </footer>
        </div>
      </OperationalProvider>
      </SimulationProvider>
    </LocaleContext.Provider>
  );
}
