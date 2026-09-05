/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  Printer,
  X,
  Clock3,
} from "lucide-react";
import { useLocale } from "../../context/locale";
import { soundEffects } from "../../services/soundEffects";
import { notifyManager } from "../../utils/toast";

export interface PlaybookStep {
  id: string;
  label: string;
  arLabel: string;
  role: string;
  completed: boolean;
  completedAt?: string;
}

export interface IncidentPlaybook {
  id: string;
  title: string;
  arTitle: string;
  icaoRef: string;
  severity: "critical" | "high" | "warning";
  summary: string;
  arSummary: string;
  steps: PlaybookStep[];
}

export const PLAYBOOKS: IncidentPlaybook[] = [
  {
    id: "lvp-cat-iii",
    title: "Low Visibility Procedures (LVP Cat II/III)",
    arTitle: "إجراءات الرؤية المتدنية (LVP الفئة الثانية / الثالثة)",
    icaoRef: "ICAO Doc 9137 Part 8",
    severity: "critical",
    summary: "Airfield RVR drops below 350m. Safeguard ILS critical areas and restrict non-essential airside traffic.",
    arSummary: "انخفاض مدى الرؤية على المدرج (RVR) لأقل من ٣٥٠ م. تأمين مناطق الحماية لجهاز الهبوط الآلي ILS وإيقاف الحركة غير الضرورية.",
    steps: [
      { id: "s1", label: "Broadcast LVP Activation on Cairo Tower VHF (118.1 MHz)", arLabel: "بث إشعار تفعيل LVP عبر برج القاهرة اللاسلكي (118.1 MHz)", role: "AOCC Chief", completed: false },
      { id: "s2", label: "Safeguard Runway 05L/23C ILS localizer & glideslope sensitive areas", arLabel: "تأمين وحماية المناطق الحساسة لمنظومة الهبوط الآلي للمدرج 05L/23C", role: "Airside Safety", completed: false },
      { id: "s3", label: "Restrict all non-essential ground service equipment from taxiways", arLabel: "إيقاف ومنع كافة المعدات الأرضية غير الحرجة من التحرك عبر الممرات", role: "Ramp Operations", completed: false },
      { id: "s4", label: "Deploy ARFF Cat 9 fast-response units to airside standby points", arLabel: "نشر وحدات الإطفاء والإنقاذ فئة 9 بنقاط التأهب الميدانية", role: "Falcon-7 ARFF", completed: false },
    ],
  },
  {
    id: "runway-fod",
    title: "Runway FOD & Wildlife Hazard Response",
    arTitle: "الاستجابة للأجسام الغريبة والطيور على المدارج (FOD)",
    icaoRef: "ICAO Annex 14 Vol I",
    severity: "high",
    summary: "Immediate suspension of runway departures, physical runway sweep, and friction testing.",
    arSummary: "تعليق فوري لإقلاع الطائرات، تنفيذ مسح ميداني شامل للمدرج، واختبار معامل الاحتكاك السطحي.",
    steps: [
      { id: "f1", label: "Suspend departure queue on Runway 05C & hold inbound flights", arLabel: "تعليق طابور الإقلاع على المدرج 05C وحجز الرحلات القادمة مؤقتاً", role: "Tower Controller", completed: false },
      { id: "f2", label: "Dispatch Safety Marshaller vehicle for physical FOD inspection", arLabel: "إرسال مركبة السلامة الميدانية لإجراء مسح مادي دقيق للمدرج", role: "Airside Safety", completed: false },
      { id: "f3", label: "Perform surface friction reading via Mu-Meter (Target >= 0.60)", arLabel: "قياس معامل احتكاك السطح بجهاز Mu-Meter (المستهدف >= 0.60)", role: "Maintenance Lead", completed: false },
      { id: "f4", label: "Issue electronic NOTAM clearance & resume full operations", arLabel: "إصدار برقية نوتام إلكترونية واستئناف التشغيل الكامل للمدرج", role: "AOCC Duty Manager", completed: false },
    ],
  },
  {
    id: "medical-diversion",
    title: "In-Flight Priority Medical Diversion",
    arTitle: "هبوط اضطراري لحالة طبية حرجة بالجو",
    icaoRef: "ECAA Doc 4444",
    severity: "critical",
    summary: "Priority inbound routing, dedicated gate access, and direct airside quarantine ambulance escort.",
    arSummary: "توجيه ذو أولوية قصوى، تخصيص بوابة مباشرة لسيارات الإسعاف، ومرافقة طواقم الحجر الصحي.",
    steps: [
      { id: "m1", label: "Assign Gate 301 with direct road clearance for ambulances", arLabel: "تخصيص البوابة 301 ذات المنفذ المباشر لسيارات الإسعاف", role: "AOCC Gate Planner", completed: false },
      { id: "m2", label: "Notify Cairo Airport Quarantine Medical Director & Ministry of Health", arLabel: "إخطار مدير الحجر الصحي بمطار القاهرة وطواقم وزارة الصحة", role: "Medical Liaison", completed: false },
      { id: "m3", label: "Expedite priority taxi route with Marshaller-7 escort vehicle", arLabel: "تأمين مسار تاكسي سريع بمرافقة سيارة الإرشاد مارشال 7", role: "Airside Ramp Lead", completed: false },
    ],
  },
];

export function IncidentPlaybookModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { language } = useLocale();
  const [playbooks, setPlaybooks] = useState<IncidentPlaybook[]>(PLAYBOOKS);
  const [activePlaybookId, setActivePlaybookId] = useState<string>("lvp-cat-iii");

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentPlaybook = playbooks.find((p) => p.id === activePlaybookId) ?? playbooks[0];
  const allCompleted = currentPlaybook.steps.every((s) => s.completed);

  const toggleStep = (stepId: string) => {
    soundEffects.playClick();
    setPlaybooks((prev) =>
      prev.map((pb) => {
        if (pb.id === activePlaybookId) {
          return {
            ...pb,
            steps: pb.steps.map((step) => {
              if (step.id === stepId) {
                const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
                return {
                  ...step,
                  completed: !step.completed,
                  completedAt: !step.completed ? now : undefined,
                };
              }
              return step;
            }),
          };
        }
        return pb;
      })
    );
  };

  const handleCompleteAll = () => {
    soundEffects.playDispatch();
    const now = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setPlaybooks((prev) =>
      prev.map((pb) => {
        if (pb.id === activePlaybookId) {
          return {
            ...pb,
            steps: pb.steps.map((s) => ({ ...s, completed: true, completedAt: s.completedAt || now })),
          };
        }
        return pb;
      })
    );
    notifyManager(
      language === "ar" ? "تم استكمال بروتوكول الطوارئ" : "ICAO Playbook Executed",
      language === "ar"
        ? `تم تنفيذ كافة بنود بروتوكول: ${currentPlaybook.arTitle}`
        : `All mandatory action items verified for: ${currentPlaybook.title}`,
      "ok"
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={language === "ar" ? "كتيب إجراءات الطوارئ والحوادث ICAO" : "ICAO Incident & Crisis Management Playbooks"}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-white/10 bg-surface/95 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl dark:bg-card/95 overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/50 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-status-crit/15 text-status-crit border border-status-crit/30">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  {language === "ar" ? "كتيب بروتوكولات الطوارئ والأزمات" : "ICAO Emergency Contingency Playbooks"}
                </h2>
                <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[10px] font-bold text-muted-foreground uppercase">
                  AOCC SOP
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {language === "ar" ? "إجراءات التدخل والقيادة الميدانية المعتمدة من سلطة الطيران المدني" : "Standardized operational contingencies and command checklists."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 min-h-[36px] min-w-[36px] place-items-center rounded-xl border border-border bg-secondary/30 text-muted-foreground hover:bg-secondary hover:text-foreground cursor-pointer"
            aria-label={language === "ar" ? "إغلاق" : "Close"}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Playbook Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 border-b border-border/40 [scrollbar-width:none]">
          {playbooks.map((pb) => {
            const active = pb.id === activePlaybookId;
            return (
              <button
                key={pb.id}
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  setActivePlaybookId(pb.id);
                }}
                className={`flex items-center gap-1.5 shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "border border-border/50 bg-secondary/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{language === "ar" ? pb.arTitle.split(" ")[0] + " " + pb.arTitle.split(" ")[1] : pb.title.split(" ")[0] + " " + pb.title.split(" ")[1]}</span>
                <span className="font-mono text-[10px] opacity-75">({pb.steps.filter((s) => s.completed).length}/{pb.steps.length})</span>
              </button>
            );
          })}
        </div>

        {/* Active Playbook Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <div className="rounded-2xl border border-border/50 bg-background/50 p-3.5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-sm text-foreground">
                {language === "ar" ? currentPlaybook.arTitle : currentPlaybook.title}
              </h3>
              <span className="font-mono text-[11px] font-bold text-primary">{currentPlaybook.icaoRef}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {language === "ar" ? currentPlaybook.arSummary : currentPlaybook.summary}
            </p>
          </div>

          {/* Action Checklist */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block px-1">
              {language === "ar" ? "قائمة الإجراءات الإلزامية المسجلة" : "Mandatory Action Items & Audit Log"}
            </span>
            {currentPlaybook.steps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => toggleStep(step.id)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-start transition-all cursor-pointer ${
                  step.completed
                    ? "border-status-ok/40 bg-status-ok/10 text-foreground"
                    : "border-border/60 bg-surface/60 hover:bg-secondary/40 text-muted-foreground"
                }`}
              >
                <div
                  className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-lg border transition-colors ${
                    step.completed ? "border-status-ok bg-status-ok text-white" : "border-muted-foreground/40 bg-background"
                  }`}
                >
                  {step.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-xs font-medium block ${step.completed ? "line-through text-muted-foreground" : "text-foreground font-semibold"}`}>
                    {language === "ar" ? step.arLabel : step.label}
                  </span>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    <span className="rounded bg-secondary px-1.5 py-0.5 font-bold">{step.role}</span>
                    {step.completedAt && (
                      <span className="font-mono text-status-ok flex items-center gap-1">
                        <Clock3 className="h-3 w-3" />
                        <span>{step.completedAt} UTC</span>
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border/50 pt-3.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>{language === "ar" ? "طباعة السجل" : "Print Audit"}</span>
          </button>

          <div className="flex items-center gap-2">
            {!allCompleted ? (
              <button
                type="button"
                onClick={handleCompleteAll}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all active-spring cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{language === "ar" ? "اعتماد وتنفيذ كافة البنود" : "Authorize All Items"}</span>
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-status-ok">
                <CheckCircle2 className="h-4 w-4" />
                <span>{language === "ar" ? "البروتوكول مكتمل وموثق بالكامل" : "Playbook Fully Executed"}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
