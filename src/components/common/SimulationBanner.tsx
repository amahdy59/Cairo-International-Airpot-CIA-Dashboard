import { ArrowRight, RotateCcw, ShieldAlert, SlidersHorizontal } from "lucide-react";
import { useLocale } from "../../context/locale";
import { useSimulation } from "../../context/simulation";
import { localize } from "../../utils/helpers";
import { drillScenarios, type ScenarioId } from "../../data";
import { soundEffects } from "../../services/soundEffects";
import { SelectMenu } from "./SelectMenu";

export function SimulationBanner() {
  const { language } = useLocale();
  const { scenarioId, activeScenario, isDrillActive, setScenarioId, resetDrill } = useSimulation();
  const impactSteps = scenarioId === "sandstorm"
    ? [{ en: "38 kt gusts", ar: "هبات ٣٨ عقدة" }, { en: "350 m visibility", ar: "رؤية ٣٥٠ م" }, { en: "Low visibility procedures", ar: "إجراءات الرؤية المنخفضة" }]
    : [{ en: "Transfer loop B", ar: "حلقة الفرز ب" }, { en: "T3 check-in", ar: "تسجيل السفر بمبنى ٣" }, { en: "Baggage congestion", ar: "ازدحام الحقائب" }];
  return (
    <aside aria-label={localize({ en: "Emergency Scenario Simulation Controls", ar: "لوحة محاكاة سيناريوهات الطوارئ" }, language)}
      className={`scenario-bar paper-surface mb-3 rounded-xl border px-3 py-2.5 sm:px-4 ${isDrillActive ? "border-status-warn/50 bg-status-warn/10" : "border-border bg-card"}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-center gap-2.5">
          {isDrillActive ? <ShieldAlert aria-hidden="true" className="h-4 w-4 shrink-0 text-status-warn" /> : <SlidersHorizontal aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground" />}
          <label htmlFor="scenario-select" className="cursor-pointer text-sm font-semibold">{language === "ar" ? "سيناريو التدريب" : "Training scenario"}</label>
          <span className={`rounded-md px-2 py-1 text-xs font-medium ${isDrillActive ? "bg-status-warn/15 text-status-warn" : "bg-secondary text-muted-foreground"}`}>
            {isDrillActive ? localize(activeScenario.badge, language) : (language === "ar" ? "الوضع الأساسي" : "Baseline")}
          </span>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <SelectMenu<ScenarioId> id="scenario-select" label={language === "ar" ? "سيناريو التدريب" : "Training scenario"} value={scenarioId}
            onChange={next => {
              if (next === "baseline") soundEffects.playClick(); else soundEffects.playAlert();
              setScenarioId(next);
            }}
            className="w-full sm:w-72"
            options={drillScenarios.map(scenario => ({ value: scenario.id, label: localize(scenario.title, language), tone: scenario.id === "baseline" ? "ok" as const : "warn" as const }))} />
          {isDrillActive && <button type="button" onClick={resetDrill}
            className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium hover:bg-secondary">
            <RotateCcw aria-hidden="true" className="h-4 w-4" />{language === "ar" ? "إعادة الضبط" : "Reset"}
          </button>}
        </div>
      </div>
      {isDrillActive && <div className="mt-2.5">
        <p role="status" className="sr-only">{localize(activeScenario.summary, language)}</p>
        <ol aria-label={language === "ar" ? "تسلسل تأثير المحاكاة" : "Drill impact path"} className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
          {impactSteps.map((step, index) => <li key={step.en} className="flex items-center gap-1.5">
            {index > 0 && <ArrowRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-status-warn rtl:rotate-180" />}
            <span className="rounded-md border border-status-warn/25 bg-card px-2.5 py-1.5 text-foreground">{localize(step, language)}</span>
          </li>)}
        </ol>
      </div>}
    </aside>
  );
}
