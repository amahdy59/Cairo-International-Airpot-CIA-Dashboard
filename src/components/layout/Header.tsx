import { useState, useRef, useEffect } from "react";
import {
  Activity,
  ArrowUp,
  Clock3,
  Contrast,
  FileText,
  Languages,
  Moon,
  Plane,
  Radar,
  ShieldCheck,
  Sun,
  Menu,
  X,
  Search,
  Tv,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Users,
  Settings2,
  Check,
  Smartphone,
  Sliders,
} from "lucide-react";
import { ManagerTab, PageView, Language, ThemeMode, copy } from "../../data";
import { useLocale } from "../../context/locale";
import { useSimulation } from "../../context/simulation";
import { useAirfieldRadio } from "../../hooks/useAirfieldRadio";
import { useSoundEffects } from "../../hooks/useSoundEffects";
import { localize } from "../../utils/helpers";
import { MetarWidget } from "../common/MetarWidget";

export function BackToTopButton() {
  const { language } = useLocale();
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-5 end-5 z-50 grid h-12 w-12 place-items-center rounded-full border border-border bg-primary text-primary-foreground shadow-[0_14px_34px_color-mix(in_oklab,var(--primary)_28%,transparent)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_color-mix(in_oklab,var(--primary)_36%,transparent)] cursor-pointer active-spring"
      aria-label={localize({ en: "Back to top", ar: "العودة إلى الأعلى" }, language)}
      title={localize({ en: "Back to top", ar: "العودة إلى الأعلى" }, language)}
    >
      <ArrowUp aria-hidden="true" className="h-5 w-5" />
    </button>
  );
}

export function Header({
  language,
  setLanguage,
  theme,
  setTheme,
  highContrast,
  setHighContrast,
  times,
  activeTab,
  activePage,
  setActiveTab,
  onShowDashboard,
  onShowResources,
  onOpenCommandPalette,
}: {
  language: Language;
  setLanguage: (language: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  times: { cairo: string; utc: string };
  activeTab: ManagerTab;
  activePage: PageView;
  setActiveTab: (tab: ManagerTab) => void;
  onShowDashboard: () => void;
  onShowResources: () => void;
  onOpenCommandPalette?: () => void;
}) {
  const c = copy[language];
  const { tr } = useLocale();
  const { toggleKiosk, isKioskActive, isDrillActive } = useSimulation();
  const { isMuted, toggleMute, isTransmitting } = useAirfieldRadio();
  const {
    isEnabled: sfxEnabled,
    toggleSoundEffects,
    playClick,
    profile,
    setProfile,
    isHapticsEnabled,
    setHapticsEnabled,
  } = useSoundEffects();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const settingsTriggerRef = useRef<HTMLButtonElement>(null);

  const isResourcesPage = activePage === "resources";
  const resourcesLabel = language === "ar" ? "التوثيق والمواصفات" : "Docs & Specs";

  // Close settings popover on outside click or Escape
  useEffect(() => {
    if (!isSettingsOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        settingsRef.current &&
        !settingsRef.current.contains(e.target as Node) &&
        settingsTriggerRef.current &&
        !settingsTriggerRef.current.contains(e.target as Node)
      ) {
        setIsSettingsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSettingsOpen(false);
        settingsTriggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSettingsOpen]);

  const navItems = [
    {
      id: "digital" as ManagerTab,
      label: c.digital,
      shortLabel: language === "ar" ? "توأم" : "Twin",
      icon: Radar,
    },
    {
      id: "operations" as ManagerTab,
      label: c.operations,
      shortLabel: language === "ar" ? "تشغيل" : "Ops",
      icon: Activity,
    },
    {
      id: "safety" as ManagerTab,
      label: c.safety,
      shortLabel: language === "ar" ? "سلامة" : "Safety",
      icon: ShieldCheck,
    },
    {
      id: "staffing" as ManagerTab,
      label: c.staffing,
      shortLabel: language === "ar" ? "كوادر" : "Staff",
      icon: Users,
    },
  ];
  const resourcesShortLabel = language === "ar" ? "توثيق" : "Docs";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-2xl shadow-xs transition-colors duration-200">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-xl font-bold text-sm"
      >
        {tr("Skip to content")}
      </a>

      <div className="mx-auto flex h-16 max-w-[1720px] w-full items-center justify-between gap-2 sm:gap-3 px-3 sm:px-5 lg:px-8">
        {/* Island 1: Brand & Operational Status Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <a
            href="#main"
            onClick={(e) => {
              e.preventDefault();
              onShowDashboard();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 sm:gap-2.5 rounded-lg active-spring min-w-0"
            aria-label={`${c.airport} ${c.brand}. ${tr("Go to dashboard")}`}
            title={`${c.airport} - ${c.brand}`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/40 bg-primary/15 text-primary">
              <Plane aria-hidden="true" className="h-5 w-5" />
            </span>
            <div className="min-w-0 max-w-[140px] sm:max-w-none">
              <span className="hidden sm:block truncate font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-primary">
                {c.airport}
              </span>
              <span className="block truncate text-xs sm:text-sm font-extrabold text-foreground">
                {c.brand}
              </span>
            </div>
          </a>

          {/* Operational Status Pill (situational context for executives) */}
          <div className="hidden 2xl:flex items-center gap-1.5 rounded-full border border-border/50 bg-secondary/35 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
            <span className={`h-2 w-2 rounded-full ${isDrillActive ? "bg-status-crit animate-ping" : "bg-status-ok"}`} />
            <span className="font-mono font-bold text-foreground">
              {isDrillActive ? (language === "ar" ? "محاكاة طوارئ" : "DRILL") : "AOCC ACTIVE"}
            </span>
            <span>&bull;</span>
            <span>CAT III</span>
          </div>
        </div>

        {/* Island 2: Central Segmented Navigation Tabs (Desktop lg+) */}
        <nav
          className="hidden lg:flex items-center justify-center shrink min-w-0 max-w-full mx-1 xl:mx-2"
          aria-label={tr("Manager dashboard sections")}
        >
          <div
            role="tablist"
            aria-orientation="horizontal"
            className="flex h-11 items-center gap-0.5 xl:gap-1 rounded-xl border border-white/10 bg-secondary/30 p-1 backdrop-blur-md overflow-x-auto no-scrollbar"
            onKeyDown={(e) => {
              const tabs: ManagerTab[] = ["digital", "operations", "safety", "staffing"];
              const currentIndex = tabs.indexOf(activeTab);
              let nextIndex = currentIndex;
              if (e.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
              else if (e.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
              else if (e.key === "Home") nextIndex = 0;
              else if (e.key === "End") nextIndex = tabs.length - 1;

              if (nextIndex !== currentIndex && nextIndex !== -1) {
                e.preventDefault();
                const nextTab = tabs[nextIndex];
                setActiveTab(nextTab);
                onShowDashboard();
                setTimeout(() => document.getElementById(`tab-${nextTab}`)?.focus(), 0);
              }
            }}
          >
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = !isResourcesPage && activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  tabIndex={isActive ? 0 : -1}
                  aria-selected={isActive}
                  aria-controls={isResourcesPage ? undefined : "main-content"}
                  onClick={() => {
                    playClick();
                    setActiveTab(tab.id);
                    onShowDashboard();
                  }}
                  className={`group relative flex h-10 min-h-[40px] xl:min-h-[42px] items-center gap-1 xl:gap-1.5 rounded-lg px-2.5 xl:px-3.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer active-spring focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-bold"
                      : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                  }`}
                  title={tab.label}
                  aria-label={tab.label}
                >
                  <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden xl:inline">{tab.label}</span>
                  <span className="inline xl:hidden">{tab.shortLabel}</span>
                </button>
              );
            })}

            {/* Documentation & Specs Tab */}
            <button
              id="tab-docs"
              role="tab"
              tabIndex={isResourcesPage ? 0 : -1}
              aria-selected={isResourcesPage}
              onClick={() => {
                playClick();
                onShowResources();
              }}
              className={`group relative flex h-10 min-h-[40px] xl:min-h-[42px] items-center gap-1 xl:gap-1.5 rounded-lg px-2.5 xl:px-3.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer active-spring focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                isResourcesPage
                  ? "bg-primary text-primary-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              }`}
              title={resourcesLabel}
              aria-label={resourcesLabel}
            >
              <FileText aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden xl:inline">{resourcesLabel}</span>
              <span className="inline xl:hidden">{resourcesShortLabel}</span>
            </button>
          </div>
        </nav>

        {/* Island 3: Executive Controls & Quick Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ms-auto">
          {/* Cairo Clock Telemetry (Desktop xl+) */}
          <div className="hidden xl:flex items-center gap-1.5 rounded-xl border border-border/60 bg-secondary/35 px-2.5 h-11 min-h-[44px]">
            <Clock3 aria-hidden="true" className="h-3.5 w-3.5 text-primary shrink-0" />
            <span dir="ltr" className="font-mono text-xs font-bold text-foreground">
              {times.cairo}
            </span>
            <span className="text-[10px] text-muted-foreground font-semibold">CAI</span>
          </div>

          {/* Standalone METAR Weather Widget (Tablet & Desktop sm+) */}
          <div className="hidden sm:block">
            <MetarWidget />
          </div>

          {/* Quick Search / Command Palette Shortcut */}
          {onOpenCommandPalette && (
            <button
              type="button"
              onClick={() => {
                playClick();
                onOpenCommandPalette();
              }}
              className="flex h-11 min-h-[44px] items-center gap-2 rounded-xl border border-border bg-secondary/35 px-2.5 sm:px-3 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all active-spring cursor-pointer"
              aria-label={language === "ar" ? "لوحة الأوامر السريعة (Ctrl+K)" : "Command Palette (Ctrl+K)"}
              title={language === "ar" ? "لوحة الأوامر السريعة (Ctrl+K)" : "Command Palette (Ctrl+K)"}
            >
              <Search aria-hidden="true" className="h-4 w-4" />
              <kbd className="hidden md:inline-flex h-5 items-center rounded border border-border/80 bg-background/80 px-1.5 font-mono text-[10px] font-semibold text-muted-foreground">
                Ctrl+K
              </kbd>
            </button>
          )}

          {/* Unified System & Audio Settings Hub Popover */}
          <div className="relative" ref={settingsRef}>
            <button
              ref={settingsTriggerRef}
              type="button"
              onClick={() => {
                playClick();
                setIsSettingsOpen(!isSettingsOpen);
              }}
              className={`relative grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-xl border transition-all active-spring cursor-pointer ${
                isSettingsOpen || !isMuted
                  ? "border-primary/60 bg-primary/20 text-primary shadow-xs"
                  : "border-border bg-secondary/35 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              aria-expanded={isSettingsOpen}
              aria-haspopup="dialog"
              aria-label={language === "ar" ? "إعدادات الصوت والنظام والواجهة" : "System & Audio Settings"}
              title={language === "ar" ? "إعدادات الصوت والنظام والواجهة" : "System & Audio Settings"}
            >
              <Settings2 aria-hidden="true" className="h-4 w-4" />
              {/* Active Audio / Stream transmission indicator */}
              {!isMuted && (
                <span className={`absolute top-1 end-1 h-2 w-2 rounded-full ${isTransmitting ? "bg-status-ok animate-ping" : "bg-primary"}`} />
              )}
            </button>

            {/* Settings Dropdown Popover */}
            {isSettingsOpen && (
              <div
                role="dialog"
                aria-label={language === "ar" ? "لوحة التحكم السريعة بالنظام" : "Quick System Controls"}
                className="absolute end-0 top-full mt-2 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-white/10 bg-surface/95 p-3.5 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-200 dark:bg-card/95"
              >
                <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                  <span className="text-xs font-bold text-foreground">
                    {language === "ar" ? "لوحة الإعدادات والتحكم" : "Executive Controls"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSettingsOpen(false)}
                    className="h-11 w-11 min-h-[44px] min-w-[44px] grid place-items-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors"
                    aria-label={tr("Close")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 space-y-3 text-xs">
                  {/* Section 1: Airfield Comms & Audio */}
                  <div>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      {language === "ar" ? "إذاعة المطار والمؤثرات" : "Airfield Audio & Comms"}
                    </span>
                    <div className="space-y-1.5">
                      {/* ATC Radio */}
                      <button
                        type="button"
                        onClick={() => {
                          playClick();
                          toggleMute();
                        }}
                        className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-background/50 p-2 text-start transition-colors hover:bg-secondary cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/15 text-primary">
                            {!isMuted ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                          </span>
                          <div>
                            <span className="font-semibold block text-foreground">Cairo Tower ATC</span>
                            <span className="text-[10px] text-muted-foreground font-mono">118.1 MHz Live Feed</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${!isMuted ? "bg-status-ok/20 text-status-ok" : "bg-muted text-muted-foreground"}`}>
                          {!isMuted ? (language === "ar" ? "يعمل" : "LIVE") : (language === "ar" ? "صامت" : "MUTED")}
                        </span>
                      </button>

                      {/* Click SFX */}
                      <button
                        type="button"
                        onClick={() => {
                          toggleSoundEffects();
                        }}
                        className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-background/50 p-2 text-start transition-colors hover:bg-secondary cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="grid h-7 w-7 place-items-center rounded-lg bg-secondary text-foreground">
                            {sfxEnabled ? <Bell className="h-3.5 w-3.5 text-primary" /> : <BellOff className="h-3.5 w-3.5 text-muted-foreground" />}
                          </span>
                          <div>
                            <span className="font-semibold block text-foreground">Tactile Earcons</span>
                            <span className="text-[10px] text-muted-foreground">UI Click Audio Feedback</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${sfxEnabled ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {sfxEnabled ? "ON" : "OFF"}
                        </span>
                      </button>

                      {/* Tone Profile & Haptics Sub-Controls */}
                      {sfxEnabled && (
                        <div className="flex items-center justify-between gap-1.5 rounded-xl border border-border/40 bg-secondary/30 p-1.5 text-xs">
                          <span className="text-[10px] text-muted-foreground font-medium ps-1 flex items-center gap-1">
                            <Sliders className="h-3 w-3 text-primary" />
                            {language === "ar" ? "النبرة:" : "Tone:"}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setProfile("chime")}
                              className={`px-2.5 py-1.5 min-h-[32px] rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${profile === "chime" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                            >
                              {language === "ar" ? "هادئ" : "Soft Chime"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setProfile("penetrating")}
                              className={`px-2.5 py-1.5 min-h-[32px] rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${profile === "penetrating" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}
                            >
                              {language === "ar" ? "قوي" : "AOCC High"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Mobile Airside Haptics */}
                      <button
                        type="button"
                        onClick={() => setHapticsEnabled(!isHapticsEnabled)}
                        className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-background/50 p-2 text-start transition-colors hover:bg-secondary cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="grid h-7 w-7 place-items-center rounded-lg bg-secondary text-foreground">
                            <Smartphone className={`h-3.5 w-3.5 ${isHapticsEnabled ? "text-primary" : "text-muted-foreground"}`} />
                          </span>
                          <div>
                            <span className="font-semibold block text-foreground">Haptic Feedback</span>
                            <span className="text-[10px] text-muted-foreground">Tactile Tablet Vibration</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${isHapticsEnabled ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {isHapticsEnabled ? "ON" : "OFF"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Section 2: Appearance & Localization */}
                  <div>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                      {language === "ar" ? "المظهر وإمكانية الوصول" : "Display & Language"}
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {/* Theme Toggle */}
                      <button
                        type="button"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/50 p-2 hover:bg-secondary transition-colors cursor-pointer"
                      >
                        {theme === "dark" ? <Sun className="h-3.5 w-3.5 text-primary" /> : <Moon className="h-3.5 w-3.5 text-primary" />}
                        <span className="font-medium">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                      </button>

                      {/* High Contrast */}
                      <button
                        type="button"
                        onClick={() => setHighContrast(!highContrast)}
                        className={`flex items-center gap-2 rounded-xl border p-2 transition-colors cursor-pointer ${
                          highContrast ? "border-primary bg-primary/15 text-primary" : "border-border/60 bg-background/50 hover:bg-secondary"
                        }`}
                      >
                        <Contrast className="h-3.5 w-3.5" />
                        <span className="font-medium">AAA Contrast</span>
                      </button>

                      {/* Language Switch */}
                      <button
                        type="button"
                        onClick={() => setLanguage(language === "en" ? "ar" : "en")}
                        className="flex items-center gap-2 rounded-xl border border-border/60 bg-background/50 p-2 hover:bg-secondary transition-colors cursor-pointer col-span-2"
                      >
                        <Languages className="h-3.5 w-3.5 text-primary" />
                        <span className="font-medium">
                          {language === "en" ? "العربية (Arabic RTL)" : "English (LTR)"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Section 3: Video Wall Kiosk Mode */}
                  <div className="border-t border-border/40 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        playClick();
                        toggleKiosk();
                        setIsSettingsOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl border p-2 transition-colors cursor-pointer ${
                        isKioskActive ? "border-primary/60 bg-primary/20 text-primary" : "border-border/60 bg-background/50 hover:bg-secondary"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Tv className="h-3.5 w-3.5" />
                        <span className="font-medium">{language === "ar" ? "شاشة غرف العمليات (Kiosk)" : "AOCC Video Wall Mode"}</span>
                      </div>
                      {isKioskActive && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Trigger (lg:hidden) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-xl border border-border bg-secondary/35 text-foreground hover:bg-secondary lg:hidden transition-colors cursor-pointer"
            aria-expanded={isMobileMenuOpen}
            aria-label={tr("Toggle navigation menu")}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Over Drawer Navigation (< lg) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 lg:hidden bg-background/95 backdrop-blur-xl border-t border-border/40 p-4 flex flex-col gap-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block px-2 mb-1">
              {tr("Manager dashboard sections")}
            </span>
            {navItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = !isResourcesPage && activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    playClick();
                    setActiveTab(tab.id);
                    onShowDashboard();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex h-12 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-colors cursor-pointer ${
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                playClick();
                onShowResources();
                setIsMobileMenuOpen(false);
              }}
              className={`flex h-12 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-colors cursor-pointer ${
                isResourcesPage ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span>{resourcesLabel}</span>
            </button>
          </div>

          <div className="mt-auto border-t border-border/40 pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="sm:hidden">
              <MetarWidget />
            </div>
            <div className="flex w-full items-center justify-between">
              <span className="font-mono font-bold text-foreground">{times.cairo} CAI</span>
              <span>HECA AOCC Command Hub</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
