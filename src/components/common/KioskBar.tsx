import { useState, useEffect } from "react";
import { Play, Pause, SkipForward, Maximize, Minimize, X, Tv } from "lucide-react";
import { useLocale } from "../../context/locale";
import { useSimulation } from "../../context/simulation";
import { localize } from "../../utils/helpers";
import { ManagerTab } from "../../data";

interface KioskBarProps {
  activeTab: ManagerTab;
}

export function KioskBar({ activeTab }: KioskBarProps) {
  const { language } = useLocale();
  const {
    isKioskActive,
    setIsKioskActive,
    isKioskPaused,
    setIsKioskPaused,
    kioskSecondsRemaining,
    skipKioskNext,
  } = useSimulation();

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  if (!isKioskActive) return null;

  const progressPercent = ((25 - kioskSecondsRemaining) / 25) * 100;

  const tabNames: Record<ManagerTab, { en: string; ar: string }> = {
    digital: { en: "Digital Twin", ar: "التوأم الرقمي" },
    operations: { en: "Operations & Airfield", ar: "العمليات والمدرجات" },
    safety: { en: "Safety & Compliance", ar: "السلامة والامتثال" },
  };

  return (
    <aside
      aria-label={localize({ en: "AOCC Video Wall Auto-Cycle Control Bar", ar: "شريط التحكم في دورة شاشة العمليات المشتركة" }, language)}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1.5 rounded-2xl border border-primary/40 bg-background/95 p-2 px-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl animate-in slide-in-from-bottom-6 duration-300"
    >
      {/* Progress Bar */}
      <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center gap-3">
        {/* Label & Active View */}
        <div className="flex items-center gap-2 text-xs">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/20 text-primary">
            <Tv className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-foreground">
                {localize({ en: "AOCC Video Wall", ar: "شاشة العمليات AOCC" }, language)}
              </span>
              <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                {kioskSecondsRemaining}s
              </span>
            </div>
            <span className="text-[11px] text-primary font-medium">
              {localize(tabNames[activeTab], language)}
            </span>
          </div>
        </div>

        {/* Separator */}
        <span className="h-6 w-px bg-border/80" />

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Pause / Resume */}
          <button
            type="button"
            onClick={() => setIsKioskPaused((prev) => !prev)}
            className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-xl border border-border bg-secondary/30 text-foreground hover:bg-secondary/60 active:scale-95 transition cursor-pointer"
            aria-label={
              isKioskPaused
                ? localize({ en: "Resume auto-cycle", ar: "استئناف الدوران" }, language)
                : localize({ en: "Pause auto-cycle", ar: "إيقاف مؤقت للدوران" }, language)
            }
            title={
              isKioskPaused
                ? localize({ en: "Resume auto-cycle", ar: "استئناف الدوران" }, language)
                : localize({ en: "Pause auto-cycle", ar: "إيقاف مؤقت للدوران" }, language)
            }
          >
            {isKioskPaused ? <Play className="h-4 w-4 text-primary" /> : <Pause className="h-4 w-4" />}
          </button>

          {/* Skip to Next Tab */}
          <button
            type="button"
            onClick={skipKioskNext}
            className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-xl border border-border bg-secondary/30 text-foreground hover:bg-secondary/60 active:scale-95 transition cursor-pointer"
            aria-label={localize({ en: "Next view", ar: "العرض التالي" }, language)}
            title={localize({ en: "Next view", ar: "العرض التالي" }, language)}
          >
            <SkipForward className="h-4 w-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-xl border border-border bg-secondary/30 text-foreground hover:bg-secondary/60 active:scale-95 transition cursor-pointer"
            aria-label={
              isFullscreen
                ? localize({ en: "Exit fullscreen", ar: "الخروج من ملء الشاشة" }, language)
                : localize({ en: "Enter fullscreen", ar: "ملء الشاشة" }, language)
            }
            title={
              isFullscreen
                ? localize({ en: "Exit fullscreen", ar: "الخروج من ملء الشاشة" }, language)
                : localize({ en: "Enter fullscreen", ar: "ملء الشاشة" }, language)
            }
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>

          {/* Exit Kiosk Button */}
          <button
            type="button"
            onClick={() => setIsKioskActive(false)}
            className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-xl border border-border bg-status-crit/15 text-status-crit hover:bg-status-crit/25 active:scale-95 transition cursor-pointer"
            aria-label={localize({ en: "Exit video wall mode", ar: "إنهاء وضع الشاشة" }, language)}
            title={localize({ en: "Exit video wall mode", ar: "إنهاء وضع الشاشة" }, language)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
