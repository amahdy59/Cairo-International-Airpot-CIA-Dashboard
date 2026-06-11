import { useState } from "react";
import {
  Activity,
  ArrowUp,
  Clock3,
  Contrast,
  Languages,
  Moon,
  Plane,
  Radar,
  ShieldCheck,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { ManagerTab, Language, ThemeMode, copy } from "../../data";
import { useLocale } from "../../context/locale";
import { localize } from "../../utils/helpers";

export function BackToTopButton() {
  const { language } = useLocale();
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-5 end-5 z-50 grid h-12 w-12 place-items-center rounded-full border border-border bg-primary text-primary-foreground shadow-[0_14px_34px_color-mix(in_oklab,var(--primary)_28%,transparent)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_color-mix(in_oklab,var(--primary)_36%,transparent)]"
      aria-label={localize({ en: "Back to top", ar: "العودة إلى الأعلى" }, language)}
      title={localize({ en: "Back to top", ar: "العودة إلى الأعلى" }, language)}
    >
      <ArrowUp aria-hidden="true" className="h-5 w-5" />
    </button>
  );
}

function TimeChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-bold leading-none">{value}</span>
    </span>
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
  setActiveTab,
  onShowDashboard,
}: {
  language: Language;
  setLanguage: (language: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  times: { cairo: string; utc: string };
  activeTab: ManagerTab;
  setActiveTab: (tab: ManagerTab) => void;
  onShowDashboard: () => void;
}) {
  const c = copy[language];
  const { tr } = useLocale();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const ThemeIcon = theme === "dark" ? Sun : Moon;
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 border-b border-white/20 bg-background/40 backdrop-blur-3xl backdrop-saturate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:bg-background/20 dark:border-white/10 dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)] supports-[backdrop-filter]:bg-background/30">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
        {tr("Skip to content")}
      </a>
      <div className="mx-auto flex min-h-16 max-w-[1480px] flex-wrap items-center justify-between gap-3 px-3 py-2 sm:px-5 lg:px-6">
        <a href="#main" onClick={(event) => { event.preventDefault(); onShowDashboard(); }} className="flex min-w-0 items-center gap-3 rounded-md" aria-label={`${c.airport} ${c.brand}. ${tr("Go to dashboard")}`} title={`${c.airport} - ${c.brand}`}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/50 bg-primary/15 glow-cyan">
            <Plane aria-hidden="true" className="h-5 w-5 text-primary" />
          </span>
          <span className="hidden min-w-0 sm:block sm:max-w-none">
            <span className="block truncate font-mono text-xs uppercase tracking-[0.18em] text-primary sm:tracking-[0.22em]">{c.airport}</span>
            <span className="block truncate text-sm font-bold">{c.brand}</span>
          </span>
        </a>

        {/* Navigation Tabs - Desktop */}
        <nav className="order-3 hidden md:flex flex-1 justify-center md:order-none md:mt-0 md:w-auto" role="tablist" aria-label={tr("Manager dashboard sections")}>
          <div className="flex h-10 w-full items-center justify-center gap-1 rounded-lg border border-white/10 bg-background/30 p-0.5 backdrop-blur-md dark:bg-secondary/30 sm:w-auto">
            {[
              { id: "digital" as ManagerTab, label: c.digital, icon: Radar },
              { id: "operations" as ManagerTab, label: c.operations, icon: Activity },
              { id: "safety" as ManagerTab, label: c.safety, icon: ShieldCheck }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="main-content"
                  onClick={() => {
                    setActiveTab(tab.id);
                    onShowDashboard();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`group relative flex h-9 min-w-0 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-all duration-300 ease-out focus-visible:z-10 sm:min-w-32 lg:min-w-36 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-[0_8px_22px_color-mix(in_oklab,var(--primary)_26%,transparent)]"
                      : "bg-transparent text-muted-foreground hover:bg-background/50 hover:text-foreground"
                  }`}
                >
                  <Icon aria-hidden="true" className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isActive ? "scale-105" : "group-hover:-translate-y-0.5"}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="flex items-center gap-2 order-2 sm:order-none">
          <div className="hidden h-10 items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 lg:flex" title={tr("Current Cairo and UTC Time")}>
            <Clock3 aria-hidden="true" className="h-4 w-4 text-primary" />
            <TimeChip label={tr("Cairo")} value={times.cairo} />
            <span className="h-5 w-px bg-border" />
            <TimeChip label="UTC" value={times.utc} />
          </div>
          <button type="button" onClick={() => setHighContrast(!highContrast)} className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-secondary/40 hover:bg-secondary" aria-label={c.contrast} title={c.contrast}>
            <Contrast aria-hidden="true" className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-secondary/40 hover:bg-secondary" aria-label={`${c.theme}: ${theme === "dark" ? "Light" : "Dark"}`} title={`${c.theme}: ${theme === "dark" ? "Light" : "Dark"}`}>
            <ThemeIcon aria-hidden="true" className="h-4 w-4 text-primary" />
          </button>
          <button type="button" onClick={() => setLanguage(language === "en" ? "ar" : "en")} className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-secondary/40 hover:bg-secondary" aria-label={`${c.language}: ${language === "en" ? "AR" : "EN"}`} title={`${c.language}: ${language === "en" ? "AR" : "EN"}`}>
            <Languages aria-hidden="true" className="h-4 w-4 text-primary" />
          </button>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-secondary/40 hover:bg-secondary md:hidden"
            aria-expanded={isMenuOpen}
            aria-label={tr("Toggle navigation menu")}
            title={tr("Toggle navigation menu")}
          >
            {isMenuOpen ? <X className="h-4 w-4 text-primary" /> : <Menu className="h-4 w-4 text-primary" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-white/20 bg-background/95 backdrop-blur-2xl px-4 py-3 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1.5" role="tablist" aria-label={tr("Manager dashboard sections")}>
            {[
              { id: "digital" as ManagerTab, label: c.digital, icon: Radar },
              { id: "operations" as ManagerTab, label: c.operations, icon: Activity },
              { id: "safety" as ManagerTab, label: c.safety, icon: ShieldCheck }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="main-content"
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMenuOpen(false);
                    onShowDashboard();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`group flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-[0_4px_12px_color-mix(in_oklab,var(--primary)_26%,transparent)]"
                      : "bg-transparent text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                  }`}
                >
                  <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
