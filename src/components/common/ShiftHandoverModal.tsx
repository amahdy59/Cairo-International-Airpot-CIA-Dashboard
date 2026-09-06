import { useState, useEffect } from "react";
import {
  Printer,
  X,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { useLocale } from "../../context/locale";
import { useSimulation } from "../../context/simulation";
import { soundEffects } from "../../services/soundEffects";
import { notifyManager } from "../../utils/toast";

export function ShiftHandoverModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { language } = useLocale();
  const { metar } = useSimulation();
  const [outgoingManager, setOutgoingManager] = useState("Capt. Hesham Nour (AOCC Chief)");
  const [relievingManager, setRelievingManager] = useState("Eng. Tarek Mansour (Ops Director)");
  const [isSigned, setIsSigned] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSign = () => {
    soundEffects.playDispatch();
    setIsSigned(true);
    notifyManager(
      language === "ar" ? "تم اعتماد محضر تسليم الوردية" : "Shift Handover Certified",
      language === "ar"
        ? "تم توثيق وأرشفة محضر تسليم وإخلاء الوردية رسمياً بسجلات سلطة الطيران المدني"
        : "Turnover briefing officially archived to ECAA compliance records.",
      "ok"
    );
  };

  const cairoTime = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const utcTime = new Date().toISOString().substring(11, 16);
  const currentDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={language === "ar" ? "محضر تسليم وتسلم وردية مركز العمليات" : "AOCC Shift Handover Briefing"}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl border border-white/10 bg-surface/95 p-4 sm:p-7 shadow-2xl backdrop-blur-2xl dark:bg-card/95 overflow-hidden text-foreground">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary border border-primary/30 shrink-0">
              <Building2 className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">
                  ECAA / CAI AOCC DOC-9971
                </span>
                <span className="rounded bg-status-ok/20 px-2 py-0.5 font-mono text-[10px] font-bold text-status-ok uppercase">
                  OFFICIAL TURNOVER
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-extrabold mt-0.5">
                {language === "ar"
                  ? "محضر تسليم وتسلم الوردية التشغيلية — مطار القاهرة الدولي"
                  : "AOCC Executive Shift Handover & Operational Turnover Briefing"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-xl border border-border bg-secondary/30 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={language === "ar" ? "إغلاق" : "Close"}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Printable Report Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs font-sans">
          {/* Metadata Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-2xl border border-border/50 bg-background/50 p-3">
            <div>
              <span className="text-muted-foreground block text-[11px]">{language === "ar" ? "التاريخ" : "Date"}</span>
              <span className="font-mono font-bold text-foreground">{currentDate}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">{language === "ar" ? "توقيت القاهرة" : "Cairo Local"}</span>
              <span className="font-mono font-bold text-primary">{cairoTime} (UTC+3)</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">{language === "ar" ? "التوقيت العالمي" : "UTC Time"}</span>
              <span className="font-mono font-bold text-foreground">{utcTime}Z</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">{language === "ar" ? "فترة الوردية" : "Shift Period"}</span>
              <span className="font-mono font-bold text-status-ok">Morning / Midday (06-14Z)</span>
            </div>
          </div>

          {/* KPI Summary Matrix */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {language === "ar" ? "١. ملخص مؤشرات الأداء التشغيلي (KPIs)" : "1. Operational Performance Summary"}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="rounded-xl border border-border/40 bg-surface p-3">
                <span className="text-muted-foreground block">{language === "ar" ? "دقة المواعيد (OTP)" : "On-Time Rate"}</span>
                <span className="text-lg font-bold font-mono text-status-ok">94.2%</span>
              </div>
              <div className="rounded-xl border border-border/40 bg-surface p-3">
                <span className="text-muted-foreground block">{language === "ar" ? "حركات الطائرات" : "Movements"}</span>
                <span className="text-lg font-bold font-mono text-foreground">412 ops</span>
              </div>
              <div className="rounded-xl border border-border/40 bg-surface p-3">
                <span className="text-muted-foreground block">{language === "ar" ? "إجمالي الركاب" : "Total Pax"}</span>
                <span className="text-lg font-bold font-mono text-foreground">58,420</span>
              </div>
              <div className="rounded-xl border border-border/40 bg-surface p-3">
                <span className="text-muted-foreground block">{language === "ar" ? "طاقم العمل الميداني" : "Airside Staff"}</span>
                <span className="text-lg font-bold font-mono text-primary">342 on duty</span>
              </div>
            </div>
          </div>

          {/* Airfield & Meteorological Conditions */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {language === "ar" ? "٢. حالة المدارج والطقس الميداني (METAR)" : "2. Airfield & Weather Status"}
            </h3>
            <div className="rounded-xl border border-border/40 bg-surface p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">
                  {language === "ar" ? "المدرجات العاملة:" : "Active Runways:"} <strong className="font-mono text-primary">05L (Arr) &bull; 05R (Dep) &bull; 23C (Mixed)</strong>
                </span>
                <span className="font-mono text-status-ok font-bold">CAVOK / VFR</span>
              </div>
              <p className="text-muted-foreground font-mono text-[11px]">
                HECA METAR: {metar.windDirectionDeg}° / {metar.windSpeedKt}kt &bull; Temp {metar.tempC}°C &bull; QNH 1014 hPa &bull; Braking Action: GOOD (Mu &gt; 0.65)
              </p>
            </div>
          </div>

          {/* Open Safety & Workforce Status */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {language === "ar" ? "٣. السلامة وفرق الطوارئ والامتثال" : "3. Safety & Emergency Readiness"}
            </h3>
            <div className="rounded-xl border border-border/40 bg-surface p-3.5 text-muted-foreground space-y-1.5">
              <div className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="h-4 w-4 text-status-ok" />
                <span>{language === "ar" ? "لا توجد بلاغات حوادث أو اختراق سلامة مفتوحة خلال الوردية" : "Zero open Level-1 safety incidents or runway incursions."}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="h-4 w-4 text-status-ok" />
                <span>{language === "ar" ? "٤ فرق تدخل سريع (Surge Teams) على أهبة الاستعداد التام" : "4 Emergency Surge Units on active standby (Avg Response ETA: 2.5m)."}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <CheckCircle2 className="h-4 w-4 text-status-ok" />
                <span>{language === "ar" ? "نسبة التزام تصاريح ICAO لكافة العاملين: ٩٨.٥٪" : "ICAO badge & driving permit compliance across airside staff: 98.5%."}</span>
              </div>
            </div>
          </div>

          {/* Sign-off Signature Block */}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              {language === "ar" ? "٤. اعتماد وتوقيع تسليم الوردية" : "4. Handover Sign-off & Electronic Certification"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">
                  {language === "ar" ? "مدير الوردية المغادر" : "Outgoing Duty Manager"}
                </label>
                <input
                  type="text"
                  value={outgoingManager}
                  onChange={(e) => setOutgoingManager(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">
                  {language === "ar" ? "مدير الوردية المستلم" : "Relieving Duty Manager"}
                </label>
                <input
                  type="text"
                  value={relievingManager}
                  onChange={(e) => setRelievingManager(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>
            {isSigned && (
              <div className="flex items-center gap-2 font-mono text-xs text-status-ok font-bold pt-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>CERTIFIED & ARCHIVED — SIGNED AT {cairoTime} CAI / {utcTime}Z</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border/60 pt-4">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-bold text-foreground hover:bg-secondary cursor-pointer active-spring"
          >
            <Printer className="h-4 w-4 text-primary" />
            <span>{language === "ar" ? "طباعة المحضر (PDF)" : "Print / Export PDF"}</span>
          </button>

          <div className="flex items-center gap-2">
            {!isSigned ? (
              <button
                type="button"
                onClick={handleSign}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 active-spring cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{language === "ar" ? "اعتماد وتسجيل التسليم" : "Certify & Complete Handover"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-secondary px-4 py-2 text-xs font-bold text-foreground hover:bg-secondary/80 cursor-pointer"
              >
                {language === "ar" ? "تم الإغلاق" : "Done"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
