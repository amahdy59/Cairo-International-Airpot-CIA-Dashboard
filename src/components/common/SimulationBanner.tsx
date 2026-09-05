import { RotateCcw, ShieldAlert, Sparkles, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useLocale } from "../../context/locale";
import { useSimulation } from "../../context/simulation";
import { localize } from "../../utils/helpers";
import { drillScenarios } from "../../data";
import { soundEffects } from "../../services/soundEffects";

export function SimulationBanner() {
  const { language } = useLocale();
  const { scenarioId, activeScenario, isDrillActive, setScenarioId, resetDrill } = useSimulation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside
      aria-label={localize({ en: "Emergency Scenario Simulation Controls", ar: "لوحة محاكاة سيناريوهات الطوارئ" }, language)}
      className={`rounded-2xl border transition-all duration-300 p-3 sm:p-4 mb-3 lg:mb-4 ${
        isDrillActive
          ? activeScenario.tone === "crit"
            ? "border-status-crit/60 bg-status-crit/10 shadow-[0_4px_24px_rgba(239,68,68,0.15)]"
            : "border-status-warn/60 bg-status-warn/10 shadow-[0_4px_24px_rgba(245,158,11,0.15)]"
          : "border-border/60 bg-secondary/20 hover:border-primary/40"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left info */}
        <div className="flex items-start gap-3">
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${
              isDrillActive
                ? activeScenario.tone === "crit"
                  ? "border-status-crit/50 bg-status-crit/20 text-status-crit animate-pulse"
                  : "border-status-warn/50 bg-status-warn/20 text-status-warn"
                : "border-primary/40 bg-primary/10 text-primary"
            }`}
          >
            {isDrillActive ? <ShieldAlert className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {localize({ en: "Operational Sandbox", ar: "مختبر العمليات والجاهزية" }, language)}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  isDrillActive
                    ? activeScenario.tone === "crit"
                      ? "bg-status-crit text-white"
                      : "bg-status-warn text-slate-950 font-black"
                    : "bg-status-ok/20 text-status-ok"
                }`}
              >
                {localize(activeScenario.badge, language)}
              </span>
            </div>
            <h2 className="mt-0.5 text-sm sm:text-base font-bold text-foreground">
              {localize(activeScenario.title, language)}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 sm:line-clamp-none max-w-2xl">
              {localize(activeScenario.summary, language)}
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-center">
          {/* Scenario Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setIsOpen((prev) => !prev);
              }}
              className="flex h-11 min-h-[44px] items-center gap-2 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-secondary active:scale-95 transition cursor-pointer"
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              aria-label={localize({ en: "Select Emergency Drill Scenario", ar: "اختيار سيناريو المحاكاة" }, language)}
            >
              <span className="truncate max-w-[180px] sm:max-w-none">{localize(activeScenario.title, language)}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
              <div
                role="listbox"
                className="absolute end-0 top-full z-50 mt-1 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-background p-1 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
              >
                {drillScenarios.map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    role="option"
                    aria-selected={sc.id === scenarioId}
                    onClick={() => {
                      if (sc.id !== "baseline") {
                        soundEffects.playAlert();
                      } else {
                        soundEffects.playClick();
                      }
                      setScenarioId(sc.id);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-start transition-colors cursor-pointer ${
                      sc.id === scenarioId
                        ? "bg-primary text-primary-foreground font-bold"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <span>{localize(sc.title, language)}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        sc.id === scenarioId
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {localize(sc.badge, language)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset button if drill active */}
          {isDrillActive && (
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                resetDrill();
              }}
              className="flex h-11 min-h-[44px] items-center gap-1.5 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-secondary active:scale-95 transition cursor-pointer"
              aria-label={localize({ en: "Restore live baseline operations", ar: "استعادة العمليات المباشرة" }, language)}
              title={localize({ en: "Restore live baseline operations", ar: "استعادة العمليات المباشرة" }, language)}
            >
              <RotateCcw className="h-4 w-4 text-primary" />
              <span>{localize({ en: "Reset to Live", ar: "إلغاء المحاكاة" }, language)}</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
