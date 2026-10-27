import { useState } from "react";
import { ShieldCheck, Activity, Plane, Users, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useLocale } from "../../context/locale";
import { useSimulation } from "../../context/simulation";
import { useOperationalEvents } from "../../context/operationalEvents";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { notifyManager } from "../../utils/toast";
import { soundEffects } from "../../services/soundEffects";
import { ShiftHandoverModal } from "../common/ShiftHandoverModal";
import { ExecutiveDecisionsModal } from "../common/ExecutiveDecisionsModal";

export function ExecutivePulseBar({
  onNavigateTab,
}: {
  onNavigateTab?: (tab: "digital" | "operations" | "safety" | "staffing", subView?: "flights" | "analytics") => void;
}) {
  const { language } = useLocale();
  const { isDrillActive, metar } = useSimulation();
  const { events } = useOperationalEvents();
  const activeEvents = events.filter((event) => event.state !== "simulated");
  const criticalCount = activeEvents.filter((event) => event.priority === "critical").length;
  const assignedCount = activeEvents.filter((event) => event.state === "assigned").length;
  const { isOnline } = useNetworkStatus();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);
  const [isDecisionsOpen, setIsDecisionsOpen] = useState(false);

  const handleQuickAction = (actionName: string) => {
    soundEffects.playClick();
    if (actionName === "surge" && onNavigateTab) {
      onNavigateTab("staffing");
      notifyManager(
        language === "ar" ? "تخطيط فرق الدعم" : "Surge team planning",
        language === "ar" ? "تم فتح خطة الفرق التدريبية" : "Opened the sample surge plan",
        "info"
      );
    } else if (actionName === "safety" && onNavigateTab) {
      onNavigateTab("safety");
      notifyManager(
        language === "ar" ? "مراجعة السلامة التدريبية" : "Training safety review",
        language === "ar" ? "تم فتح أمثلة مراجعة السلامة" : "Opened sample safety checks",
        "ok"
      );
    }
  };

  return (
    <>
      <section
        aria-label={language === "ar" ? "شريط المؤشرات التشغيلية والقرارات الفورية" : "Executive Situational Pulse"}
        className="paper-surface relative mb-4 w-full rounded-xl border border-border bg-card p-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Operational Status, Runways & Network State */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="flex items-center gap-2 rounded-xl bg-background/70 px-2.5 py-1.5 border border-border/40">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isDrillActive ? "bg-status-crit" : "bg-status-ok"}`} />
              </span>
              <span className="font-mono font-bold uppercase tracking-wider text-foreground">
                {isDrillActive
                  ? language === "ar" ? "محاكاة طوارئ نشطة" : "DRILL ACTIVE"
                  : language === "ar" ? "متابعة سيناريو التشغيل" : "SCENARIO MONITORING"}
              </span>
              <span className="text-muted-foreground/50">|</span>
              <span className="font-mono text-muted-foreground">{language === "ar" ? "تدريب" : "TRAINING"}</span>
            </div>

            <div className="hidden md:flex items-center gap-2 text-muted-foreground">
              <Plane className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>{language === "ar" ? "مدارج السيناريو:" : "Scenario runways:"}</span>
              <span className="font-mono font-semibold text-foreground">05L &bull; 05R &bull; 23C</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-status-ok" aria-hidden="true" />
              <span>{language === "ar" ? "دقة المواعيد في العينة:" : "Sample on-time:"}</span>
              <span className="font-mono font-bold text-status-ok">94.2%</span>
            </div>

            {/* Offline-First PWA Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border/40 bg-background/50 px-2 py-0.5 text-[11px] font-mono">
              {isOnline ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-status-ok" />
                  <span className="text-muted-foreground">{language === "ar" ? "المتصفح متصل" : "BROWSER ONLINE"}</span>
                </>
              ) : (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-status-warn animate-pulse" />
                  <span className="text-status-warn font-semibold">
                    {language === "ar" ? "المتصفح غير متصل" : "BROWSER OFFLINE"}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right: Rapid Action Buttons & Detail Toggle */}
          <div className="grid w-full grid-cols-[1fr_1fr_auto] gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center">
            {/* Executive Decisions Pending Dock Trigger */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setIsDecisionsOpen(true);
              }}
              className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-status-warn/40 bg-status-warn/10 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-status-warn transition-all duration-200 hover:bg-status-warn/20 active-spring cursor-pointer shadow-xs"
              title={language === "ar" ? "مراجعة قرارات السيناريو" : "Review scenario decisions"}
              aria-haspopup="dialog"
              aria-label={language === "ar" ? "قرارات السيناريو" : "Scenario decisions"}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-warn opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-status-warn" />
              </span>
              <span className="font-bold text-foreground">
                {language === "ar" ? "القرارات التنفيذية" : "Decisions"}
              </span>
            </button>

            {/* Shift Handover Briefing Trigger */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setIsHandoverOpen(true);
              }}
              className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-primary transition-all duration-200 hover:bg-primary/20 active-spring cursor-pointer"
              title={language === "ar" ? "محضر تسليم وتسلم الوردية" : "Shift Handover Briefing"}
            >
              <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{language === "ar" ? "محضر الوردية" : "Shift Handover"}</span>
            </button>

            {isExpanded && <button
              type="button"
              onClick={() => handleQuickAction("surge")}
              className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-border bg-secondary/30 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-secondary active-spring cursor-pointer"
              title={language === "ar" ? "مراجعة خطة فرق الدعم" : "Review surge team plan"}
            >
              <Users className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
              <span>{language === "ar" ? "خطة فرق الدعم" : "Surge plan"}</span>
            </button>}

            {isExpanded && <button
              type="button"
              onClick={() => handleQuickAction("safety")}
              className="flex min-h-[44px] items-center gap-1.5 rounded-xl border border-border bg-secondary/30 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-secondary active-spring cursor-pointer"
              title={language === "ar" ? "مراجعة أمثلة السلامة" : "Review sample safety checks"}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-status-ok shrink-0" aria-hidden="true" />
              <span>{language === "ar" ? "تدقيق السلامة" : "Safety Audit"}</span>
            </button>}

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-secondary/30 px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? (language === "ar" ? "طي التفاصيل" : "Collapse details") : (language === "ar" ? "توسيع التفاصيل" : "Expand details")}
              title={isExpanded ? (language === "ar" ? "طي التفاصيل" : "Collapse details") : (language === "ar" ? "توسيع التفاصيل" : "Expand details")}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span className="hidden sm:inline">{language === "ar" ? "تفاصيل الحالة" : "Status details"}</span>
            </button>
          </div>
        </div>

        {/* Progressive Disclosure: Collapsible Executive Metrics Drawer */}
        {isExpanded && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-border/40 pt-3 text-xs animate-in fade-in duration-200">
            <div className="rounded-xl bg-background/50 p-2 border border-border/30">
              <span className="text-muted-foreground block text-[11px]">{language === "ar" ? "طقس السيناريو" : "Scenario weather"}</span>
              <span className="font-mono font-bold text-foreground text-sm">{metar.windSpeedKt}kt &bull; {metar.tempC}°C</span>
            </div>
            <div className="rounded-xl bg-background/50 p-2 border border-border/30">
              <span className="text-muted-foreground block text-[11px]">{language === "ar" ? "مهام السيناريو المفتوحة" : "Open scenario tasks"}</span>
              <span className="font-mono font-bold text-status-info text-sm">{activeEvents.length}</span>
            </div>
            <div className="rounded-xl bg-background/50 p-2 border border-border/30">
              <span className="text-muted-foreground block text-[11px]">{language === "ar" ? "مهام أُسندت" : "Assigned tasks"}</span>
              <span className="font-mono font-bold text-primary text-sm">{assignedCount}</span>
            </div>
            <div className="rounded-xl bg-background/50 p-2 border border-border/30">
              <span className="text-muted-foreground block text-[11px]">{language === "ar" ? "مهام حرجة" : "Critical tasks"}</span>
              <span className="font-mono font-bold text-status-crit text-sm">{criticalCount}</span>
            </div>
          </div>
        )}
      </section>

      {/* Official Shift Handover Turnover Briefing Modal */}
      <ShiftHandoverModal isOpen={isHandoverOpen} onClose={() => setIsHandoverOpen(false)} />

      {/* Executive Decisions Pending Approvals Modal */}
      <ExecutiveDecisionsModal
        isOpen={isDecisionsOpen}
        onClose={() => setIsDecisionsOpen(false)}
        onOpenHandover={() => setIsHandoverOpen(true)}
        onNavigateTab={onNavigateTab}
      />
    </>
  );
}
