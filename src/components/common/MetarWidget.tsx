import { useState, useRef, useEffect, useCallback } from "react";
import { Compass, CloudSun, Wind, AlertCircle, X, Check, Copy } from "lucide-react";
import { useLocale } from "../../context/locale";
import { useSimulation } from "../../context/simulation";
import { localize } from "../../utils/helpers";
import { StatusPill } from "../command-center/MetricWidgets";

export function MetarWidget() {
  const { language } = useLocale();
  const { metar, isDrillActive, activeScenario } = useSimulation();
  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close on Escape or outside click
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    },
    [isOpen]
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const handleCopyMetar = () => {
    navigator.clipboard.writeText(metar.raw);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getFlightCategoryTone = (cat: string) => {
    switch (cat) {
      case "VFR":
        return "ok";
      case "MVFR":
        return "info";
      case "IFR":
        return "warn";
      case "LIFR":
        return "crit";
      default:
        return "neutral";
    }
  };

  const categoryTone = getFlightCategoryTone(metar.flightCategory);

  return (
    <div className="relative inline-block text-start">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group flex h-11 min-h-[44px] items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer ${
          isOpen
            ? "border-primary/60 bg-primary/15 text-primary shadow-xs"
            : isDrillActive
            ? "border-status-crit/50 bg-status-crit/10 text-status-crit animate-pulse"
            : "border-border bg-secondary/35 text-foreground hover:bg-secondary/60"
        }`}
        aria-label={
          language === "ar"
            ? `حالة الطقس والمدرجات بمطار القاهرة: ${metar.windSpeedKt} عقدة، ${metar.tempC} درجة، ${metar.flightCategory}`
            : `HECA Weather & Runway Status: ${metar.windSpeedKt}kt, ${metar.tempC}°C, ${metar.flightCategory}`
        }
        title={
          language === "ar"
            ? "عرض تقرير METAR وحالة المدارج لمطار القاهرة الدولي"
            : "View Cairo METAR & Active Runway Configuration"
        }
      >
        {/* Animated wind indicator compass needle */}
        <span
          className="grid h-6 w-6 place-items-center rounded-full bg-background/60 text-primary transition-transform duration-500"
          style={{ transform: `rotate(${metar.windDirectionDeg}deg)` }}
          aria-hidden="true"
        >
          <Compass className="h-4 w-4" />
        </span>

        {/* METAR Quick Metrics */}
        <div className="flex items-center gap-1.5 font-mono">
          <span className="hidden xl:inline font-bold text-foreground">{metar.windSpeedKt}kt</span>
          <span className="hidden xl:inline text-muted-foreground/50">|</span>
          <span className="font-bold text-foreground">{metar.tempC}°C</span>
        </div>

        {/* Category Pill */}
        <StatusPill tone={categoryTone}>{metar.flightCategory}</StatusPill>
      </button>

      {/* Popover Dialog */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={localize({ en: "HECA Cairo Airfield METAR & Runways", ar: "تقرير METAR ومدرجات مطار القاهرة" }, language)}
          className="absolute end-0 top-full z-50 mt-2 w-[340px] max-w-[calc(100vw-1.5rem)] sm:w-[400px] rounded-2xl border border-border bg-background/95 p-3.5 sm:p-4 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-border/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-primary">{metar.station} / CAI</span>
                <StatusPill tone={categoryTone}>{metar.flightCategory}</StatusPill>
                {isDrillActive && (
                  <span className="rounded-full bg-status-crit/15 px-2 py-0.5 text-[10px] font-bold text-status-crit">
                    {language === "ar" ? "محاكاة طوارئ" : "DRILL OVERRIDE"}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {localize(metar.airportName, language)} &bull; {metar.observedAt}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                triggerRef.current?.focus();
              }}
              className="grid h-8 w-8 min-h-[32px] min-w-[32px] place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
              aria-label={localize({ en: "Close METAR report", ar: "إغلاق تقرير METAR" }, language)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Active Runways Configuration */}
          <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
            <div className="flex items-center gap-1.5 font-sans text-xs font-semibold text-primary">
              <Wind className="h-3.5 w-3.5" />
              <span>{localize({ en: "Active Runway Operations", ar: "تكوين المدارج النشطة" }, language)}</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-background/70 p-2">
                <span className="block text-[11px] text-muted-foreground">{localize({ en: "Arrivals", ar: "الهبوط" }, language)}</span>
                <span className="font-mono text-sm font-bold text-foreground">{metar.activeRunways.arrival}</span>
              </div>
              <div className="rounded-lg bg-background/70 p-2">
                <span className="block text-[11px] text-muted-foreground">{localize({ en: "Departures", ar: "الإقلاع" }, language)}</span>
                <span className="font-mono text-sm font-bold text-foreground">{metar.activeRunways.departure}</span>
              </div>
            </div>
          </div>

          {/* Airfield Weather Metrics */}
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="rounded-lg border border-border/50 bg-secondary/20 p-2">
              <span className="block text-[10px] text-muted-foreground">{localize({ en: "WIND", ar: "الرياح" }, language)}</span>
              <span className="font-mono font-bold">{metar.windDirectionDeg}° / {metar.windSpeedKt}kt</span>
              {metar.windGustKt && (
                <span className="block text-[10px] text-status-crit font-semibold">G{metar.windGustKt}kt</span>
              )}
            </div>
            <div className="rounded-lg border border-border/50 bg-secondary/20 p-2">
              <span className="block text-[10px] text-muted-foreground">{localize({ en: "VISIBILITY", ar: "الرؤية" }, language)}</span>
              <span className="font-mono font-bold">{metar.visibilityKm} km</span>
            </div>
            <div className="rounded-lg border border-border/50 bg-secondary/20 p-2">
              <span className="block text-[10px] text-muted-foreground">{localize({ en: "TEMP / DP", ar: "الحرارة" }, language)}</span>
              <span className="font-mono font-bold">{metar.tempC}° / {metar.dewPointC}°</span>
            </div>
            <div className="rounded-lg border border-border/50 bg-secondary/20 p-2">
              <span className="block text-[10px] text-muted-foreground">{localize({ en: "QNH (BARO)", ar: "الضغط" }, language)}</span>
              <span className="font-mono font-bold">{metar.qnhHpa} hPa</span>
            </div>
          </div>

          {/* Condition description */}
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-secondary/30 px-3 py-2 text-xs">
            <CloudSun className="h-4 w-4 text-primary shrink-0" />
            <span className="font-medium text-foreground">{localize(metar.condition, language)}</span>
          </div>

          {/* Raw METAR String with Copy */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
              <span>{localize({ en: "RAW METAR / SPECI", ar: "النص الخام للميتار" }, language)}</span>
              <button
                type="button"
                onClick={handleCopyMetar}
                className="flex items-center gap-1 text-primary hover:underline cursor-pointer min-h-[28px]"
                aria-label={localize({ en: "Copy raw METAR", ar: "نسخ النص الخام" }, language)}
              >
                {isCopied ? (
                  <>
                    <Check className="h-3 w-3 text-status-ok" />
                    <span className="text-status-ok">{localize({ en: "Copied", ar: "تم النسخ" }, language)}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>{localize({ en: "Copy", ar: "نسخ" }, language)}</span>
                  </>
                )}
              </button>
            </div>
            <pre className="rounded-lg border border-border/60 bg-secondary/40 p-2 font-mono text-[11px] leading-relaxed text-foreground whitespace-pre-wrap select-all">
              {metar.raw}
            </pre>
          </div>

          {/* Drill info banner if active */}
          {isDrillActive && (
            <div className="mt-3 rounded-lg border border-status-crit/40 bg-status-crit/10 p-2.5 text-xs text-status-crit flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{localize(activeScenario.title, language)}: </span>
                <span>{localize(activeScenario.summary, language)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
