import { useState } from "react";
import { ShieldCheck, Activity, Plane, Users, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useLocale } from "../../context/locale";
import { useSimulation } from "../../context/simulation";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import { notifyManager } from "../../utils/toast";
import { soundEffects } from "../../services/soundEffects";
import { ShiftHandoverModal } from "../common/ShiftHandoverModal";

export function ExecutivePulseBar({
  onNavigateTab,
}: {
  onNavigateTab?: (tab: "digital" | "operations" | "safety" | "staffing") => void;
}) {
  const { language } = useLocale();
  const { isDrillActive, metar } = useSimulation();
  const { isOnline } = useNetworkStatus();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHandoverOpen, setIsHandoverOpen] = useState(false);

  const handleQuickAction = (actionName: string) => {
    soundEffects.playClick();
    if (actionName === "surge" && onNavigateTab) {
      onNavigateTab("staffing");
      notifyManager(
        language === "ar" ? "فرق التدخل السريع" : "Emergency Surge Crew",
        language === "ar" ? "تم التحويل إلى جدول الاستجابة والتعزيزات" : "Routed to Tactical Surge Dispatch",
        "info"
      );
    } else if (actionName === "safety" && onNavigateTab) {
      onNavigateTab("safety");
      notifyManager(
        language === "ar" ? "سجل السلامة والامتثال" : "Safety Compliance",
        language === "ar" ? "عرض تدقيق المدارج وبروتوكول ICAO" : "Opening Runway Audit & ICAO Directives",
        "ok"
      );
    }
  };

  return (
    <>
      <section
        aria-label={language === "ar" ? "شريط المؤشرات التشغيلية والقرارات الفورية" : "Executive Situational Pulse"}
        className="relative mb-3.5 w-full rounded-2xl border border-white/10 bg-surface/80 p-2.5 sm:p-3 backdrop-blur-xl shadow-xs transition-all duration-300 dark:bg-card/75 dark:border-white/5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Left: Operational Status, Runways & Network State */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="flex items-center gap-2 rounded-xl bg-background/70 px-2.5 py-1.5 border border-border/40">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isDrillActive ? "bg-status-crit" : "bg-status-ok"}`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isDrillActive ? "bg-status-crit" : "bg-status-ok"}`} />
              </span>
              <span className="font-mono font-bold uppercase tracking-wider text-foreground">
                {isDrillActive
                  ? language === "ar" ? "محاكاة طوارئ نشطة" : "DRILL ACTIVE"
                  : language === "ar" ? "حالة العمليات: اسمية" : "AOCC NOMINAL"}
              </span>
              <span className="text-muted-foreground/50">|</span>
              <span className="font-mono text-muted-foreground">CAT III</span>
            </div>

            <div className="hidden md:flex items-center gap-2 text-muted-foreground">
              <Plane className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>{language === "ar" ? "المدرجات العاملة:" : "Runways:"}</span>
              <span className="font-mono font-semibold text-foreground">05L &bull; 05R &bull; 23C</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-status-ok" aria-hidden="true" />
              <span>{language === "ar" ? "دقة المواعيد (OTP):" : "On-Time:"}</span>
              <span className="font-mono font-bold text-status-ok">94.2%</span>
            </div>

            {/* Offline-First PWA Status Pill */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border/40 bg-background/50 px-2 py-0.5 text-[11px] font-mono">
              {isOnline ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-status-ok" />
                  <span className="text-muted-foreground">ONLINE</span>
                </>
              ) : (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-status-warn animate-pulse" />
                  <span className="text-status-warn font-semibold">
                    {language === "ar" ? "محفوظ محلياً" : "OFFLINE CACHED"}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right: Rapid Action Buttons & Detail Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 ms-auto">
            {/* Shift Handover Briefing Trigger */}
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setIsHandoverOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-primary transition-all duration-200 hover:bg-primary/20 active-spring cursor-pointer"
              title={language === "ar" ? "محضر تسليم وتسلم الوردية" : "Shift Handover Briefing"}
            >
              <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{language === "ar" ? "محضر الوردية" : "Shift Handover"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickAction("surge")}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary/30 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-secondary active-spring cursor-pointer"
              title={language === "ar" ? "إرسال تعزيزات ميدانية سريعة" : "Dispatch Emergency Surge Crew"}
            >
              <Users className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{language === "ar" ? "تعزيزات الطوارئ" : "Surge Crew"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickAction("safety")}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-secondary/30 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-foreground transition-all duration-200 hover:bg-secondary active-spring cursor-pointer"
              title={language === "ar" ? "فحص المدارج والسلامة" : "Verify Safety & Directives"}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-status-ok shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">{language === "ar" ? "تدقيق السلامة" : "Safety Audit"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="grid h-8 w-8 place-items-center rounded-xl border border-border bg-secondary/30 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active-spring cursor-pointer"
              aria-expanded={isExpanded}
              aria-label={isExpanded ? (language === "ar" ? "طي التفاصيل" : "Collapse details") : (language === "ar" ? "توسيع التفاصيل" : "Expand details")}
              title={isExpanded ? (language === "ar" ? "طي التفاصيل" : "Collapse details") : (language === "ar" ? "توسيع التفاصيل" : "Expand details")}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Progressive Disclosure: Collapsible Executive Metrics Drawer */}
        {isExpanded && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-border/40 pt-3 text-xs animate-in fade-in duration-200">
            <div className="rounded-xl bg-background/50 p-2 border border-border/30">
              <span className="text-muted-foreground block text-[11px]">{language === "ar" ? "الطقس الميداني" : "Airfield Weather"}</span>
              <span className="font-mono font-bold text-foreground text-sm">{metar.windSpeedKt}kt &bull; {metar.tempC}°C</span>
            </div>
            <div className="rounded-xl bg-background/50 p-2 border border-border/30">
              <span className="text-muted-foreground block text-[11px]">{language === "ar" ? "طاقم العمل المناوب" : "Staff On Duty"}</span>
              <span className="font-mono font-bold text-status-ok text-sm">342 {language === "ar" ? "فرد" : "pax"}</span>
            </div>
            <div className="rounded-xl bg-background/50 p-2 border border-border/30">
              <span className="text-muted-foreground block text-[11px]">{language === "ar" ? "حركة الرحلات بالساعة" : "Flight Movements/Hr"}</span>
              <span className="font-mono font-bold text-primary text-sm">48 {language === "ar" ? "رحلة" : "ops"}</span>
            </div>
            <div className="rounded-xl bg-background/50 p-2 border border-border/30">
              <span className="text-muted-foreground block text-[11px]">{language === "ar" ? "تأخيرات حرجة" : "Critical Bottlenecks"}</span>
              <span className="font-mono font-bold text-status-ok text-sm">{language === "ar" ? "0 بلاغات حرجة" : "0 Critical"}</span>
            </div>
          </div>
        )}
      </section>

      {/* Official Shift Handover Turnover Briefing Modal */}
      <ShiftHandoverModal isOpen={isHandoverOpen} onClose={() => setIsHandoverOpen(false)} />
    </>
  );
}
