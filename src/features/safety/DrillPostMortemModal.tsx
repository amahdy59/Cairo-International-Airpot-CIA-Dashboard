import { useState } from "react";
import { FileText, Printer, CheckCircle2, X, Download } from "lucide-react";
import { useLocale } from "../../context/locale";
import { useSimulation } from "../../context/simulation";
import { soundEffects } from "../../services/soundEffects";
import { notifyManager } from "../../utils/toast";

interface DrillPostMortemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DrillPostMortemModal({ isOpen, onClose }: DrillPostMortemModalProps) {
  const { language } = useLocale();
  const { activeScenario, isDrillActive, metar } = useSimulation();
  const [managerNotes, setManagerNotes] = useState("");
  const [dutyManagerName, setDutyManagerName] = useState("Eng. Ahmed Mahdy (AOCC Lead)");

  if (!isOpen) return null;

  const handlePrint = () => {
    soundEffects.playClick();
    window.print();
  };

  const handleSignOff = () => {
    soundEffects.playDispatch();
    notifyManager(
      language === "ar" ? "تم توثيق تقرير ما بعد الأزمة" : "Post-Mortem Signed Off",
      language === "ar" ? "تم أرشفة التقرير في سجل الحوادث الرسمي" : "Incident debrief filed with Cairo Airport Authority (CAA)",
      "ok"
    );
    onClose();
  };

  const reportId = `CAI-DEBRIEF-${new Date().toISOString().slice(0, 10)}-${activeScenario.id.toUpperCase()}`;
  const timestampStr = new Date().toLocaleString(language === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="postmortem-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in print:p-0 print:bg-white print:static"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-card p-4 sm:p-6 shadow-2xl flex flex-col gap-4 text-foreground print:max-w-none print:max-h-none print:border-none print:shadow-none print:text-black">
        {/* Header - Screen only controls */}
        <div className="flex items-center justify-between border-b border-border/40 pb-3 print:hidden">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/25">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <h2 id="postmortem-title" className="text-base font-bold">
                {language === "ar" ? "تقرير ما بعد الأزمة / التمرين العملياتي" : "Incident & Drill Post-Mortem Debrief"}
              </h2>
              <span className="font-mono text-xs text-muted-foreground">{reportId}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/60 bg-secondary/50 text-xs font-bold hover:bg-secondary active-spring transition-colors cursor-pointer"
              title="Print or Save PDF"
            >
              <Printer className="h-3.5 w-3.5 text-primary" />
              <span>{language === "ar" ? "طباعة / PDF" : "Print / PDF"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground active-spring cursor-pointer"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Formal Printable Document Body */}
        <div className="flex flex-col gap-4 print:gap-3">
          {/* Document Title Header (Visible on print) */}
          <div className="border-b-2 border-primary/40 pb-3 flex items-start justify-between">
            <div>
              <h1 className="text-lg font-black tracking-wide uppercase text-primary print:text-black">
                {language === "ar" ? "سلطة مطار القاهرة الدولي — مركز إدارة العمليات (AOCC)" : "Cairo International Airport — AOCC Command Center"}
              </h1>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                Official Post-Incident Analysis & SOP Compliance Audit • ICAO Doc 9137
              </p>
            </div>
            <div className="text-end font-mono text-xs">
              <span className="font-bold text-foreground print:text-black block">{reportId}</span>
              <span className="text-muted-foreground text-[10px]">{timestampStr}</span>
            </div>
          </div>

          {/* Scenario & Context Card */}
          <div className="grid sm:grid-cols-2 gap-3 p-3.5 rounded-xl border border-border/60 bg-background/50 print:bg-transparent print:border-black/20">
            <div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase block">Incident / Exercise Scope</span>
              <span className="font-bold text-sm text-foreground print:text-black block mt-0.5">
                {language === "ar" ? activeScenario.title.ar : activeScenario.title.en}
              </span>
              <span className="text-xs text-muted-foreground mt-0.5 block">
                {language === "ar" ? activeScenario.summary.ar : activeScenario.summary.en}
              </span>
            </div>
            <div className="space-y-1 text-xs font-mono">
              <div className="flex justify-between border-b border-border/30 pb-0.5">
                <span className="text-muted-foreground">Classification:</span>
                <span className="font-bold text-status-crit print:text-black uppercase">
                  {isDrillActive ? "Tactical Drill (Live Simulation)" : "Routine Baseline"}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/30 pb-0.5">
                <span className="text-muted-foreground">Active Metar:</span>
                <span>QNH {metar.qnhHpa} • Wind {metar.windSpeedKt}kt</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Runways in Use:</span>
                <span className="font-bold">05L (Arr) / 05C (Dep)</span>
              </div>
            </div>
          </div>

          {/* KPI Outcome Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl border border-border/40 bg-secondary/30 print:border-black/20">
              <span className="text-[10px] text-muted-foreground uppercase font-mono block">Response Latency</span>
              <span className="text-lg font-mono font-black text-status-ok print:text-black">3m 48s</span>
              <span className="text-[10px] text-muted-foreground block">Target: &lt; 5m 00s</span>
            </div>

            <div className="p-3 rounded-xl border border-border/40 bg-secondary/30 print:border-black/20">
              <span className="text-[10px] text-muted-foreground uppercase font-mono block">SOP Checklist Compliance</span>
              <span className="text-lg font-mono font-black text-primary print:text-black">100%</span>
              <span className="text-[10px] text-muted-foreground block">5/5 Verified</span>
            </div>

            <div className="p-3 rounded-xl border border-border/40 bg-secondary/30 print:border-black/20">
              <span className="text-[10px] text-muted-foreground uppercase font-mono block">Pax Delay Saved</span>
              <span className="text-lg font-mono font-black text-status-ok print:text-black">1,840h</span>
              <span className="text-[10px] text-muted-foreground block">Downstream ripple</span>
            </div>

            <div className="p-3 rounded-xl border border-border/40 bg-secondary/30 print:border-black/20">
              <span className="text-[10px] text-muted-foreground uppercase font-mono block">Safety Margin</span>
              <span className="text-lg font-mono font-black text-primary print:text-black">Nominal</span>
              <span className="text-[10px] text-muted-foreground block">Zero Separation Breach</span>
            </div>
          </div>

          {/* Key Directives & Action Timeline */}
          <div className="p-3.5 rounded-xl border border-border/60 bg-background/50 print:bg-transparent print:border-black/20 flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {language === "ar" ? "سجل التدابير والإجراءات المتخذة" : "Operational Directives Log"}
            </span>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-status-ok shrink-0" />
                <span className="text-muted-foreground">T+00:00:</span>
                <span className="text-foreground print:text-black">Incident / Contingency Playbook triggered by Duty Manager.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-status-ok shrink-0" />
                <span className="text-muted-foreground">T+01:45:</span>
                <span className="text-foreground print:text-black">Airside sweeper and marshalling teams dispatched.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-status-ok shrink-0" />
                <span className="text-muted-foreground">T+03:20:</span>
                <span className="text-foreground print:text-black">A-CDM TOBT revisions pushed to EgyptAir & Star Alliance dispatchers.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-status-ok shrink-0" />
                <span className="text-muted-foreground">T+04:10:</span>
                <span className="text-foreground print:text-black">Runway 05C braking friction verified above 0.52 Mu standard.</span>
              </div>
            </div>
          </div>

          {/* Duty Manager Evaluation & Sign-off */}
          <div className="p-3.5 rounded-xl border border-border/60 bg-background/50 print:bg-transparent print:border-black/20 flex flex-col gap-2.5">
            <label htmlFor="debrief-notes" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {language === "ar" ? "ملاحظات وتوصيات مدير النوبة" : "Duty Manager Debrief & Recommendations"}
            </label>
            <textarea
              id="debrief-notes"
              rows={2}
              value={managerNotes}
              onChange={(e) => setManagerNotes(e.target.value)}
              placeholder={
                language === "ar"
                  ? "أدخل الملاحظات والتوصيات التشغيلية للنوبات القادمة..."
                  : "All containment procedures executed within target thresholds. T3 baggage sorter motor overhaul recommended during 02:00 maintenance window."
              }
              className="w-full rounded-xl border border-border/60 bg-secondary/20 p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary print:border-black/20 print:bg-transparent"
            />

            <div className="grid sm:grid-cols-2 gap-3 pt-2 border-t border-border/40">
              <div>
                <span className="text-[10px] text-muted-foreground block font-mono">Duty Manager on Shift</span>
                <input
                  type="text"
                  value={dutyManagerName}
                  onChange={(e) => setDutyManagerName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border/60 bg-secondary/30 px-2 py-1 text-xs font-bold font-mono print:border-none print:bg-transparent"
                />
              </div>
              <div className="flex flex-col justify-end text-end sm:text-start">
                <span className="text-[10px] text-muted-foreground block font-mono">Digital Signature Stamp</span>
                <span className="mt-1 font-mono text-xs font-bold text-status-ok print:text-black">
                  VALIDATED • CAI-AOCC-CERTIFIED
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer - Screen Only */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border/60 bg-secondary/50 text-xs font-bold hover:bg-secondary active-spring transition-colors cursor-pointer"
          >
            {language === "ar" ? "إغلاق" : "Close"}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-primary/40 bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 active-spring transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{language === "ar" ? "تصدير التقرير" : "Export Report (PDF)"}</span>
            </button>
            <button
              type="button"
              onClick={handleSignOff}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 active-spring transition-all cursor-pointer shadow-sm"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{language === "ar" ? "اعتماد وأرشفة التقرير" : "Sign Off & Archive"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
