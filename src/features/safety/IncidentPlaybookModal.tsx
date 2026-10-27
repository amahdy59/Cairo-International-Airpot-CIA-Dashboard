import { useModalFocus } from "../../hooks/useModalFocus";
/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";
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
  reference: string;
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
    reference: "Local LVP procedure required",
    severity: "critical",
    summary: "Training prompts for a low-visibility scenario. Confirm activation criteria and responsibilities against the airport's approved procedure.",
    arSummary: "خطوات مراجعة تدريبية لسيناريو تدني الرؤية. يجب التحقق من معايير التفعيل والمسؤوليات وفق الإجراءات المحلية المعتمدة.",
    steps: [
      { id: "s1", label: "Check the approved visibility trigger and notify the responsible tower and airside teams", arLabel: "مراجعة معيار الرؤية المعتمد وإبلاغ البرج والفرق الميدانية المسؤولة", role: "AOCC duty lead", completed: false },
      { id: "s2", label: "Confirm protection of ILS sensitive areas with the responsible team", arLabel: "تأكيد حماية المناطق الحساسة لنظام الهبوط الآلي مع الفريق المختص", role: "Airside safety", completed: false },
      { id: "s3", label: "Review ground-movement restrictions in the local LVP plan", arLabel: "مراجعة قيود الحركة الأرضية في خطة الرؤية المنخفضة المحلية", role: "Ramp operations", completed: false },
      { id: "s4", label: "Confirm rescue and firefighting readiness under the local emergency plan", arLabel: "تأكيد جاهزية الإنقاذ والإطفاء وفق خطة الطوارئ المحلية", role: "ARFF liaison", completed: false },
    ],
  },
  {
    id: "runway-fod",
    title: "Runway FOD & Wildlife Hazard Response",
    arTitle: "الاستجابة للأجسام الغريبة والطيور على المدارج (FOD)",
    reference: "Local runway inspection procedure required",
    severity: "high",
    summary: "Training prompts for a reported runway hazard. Confirm runway status and inspection decisions with authorized teams.",
    arSummary: "خطوات مراجعة تدريبية لبلاغ خطر على المدرج. تأكد من حالة المدرج وقرارات التفتيش مع الفرق المخولة.",
    steps: [
      { id: "f1", label: "Confirm runway status and traffic coordination with air traffic control", arLabel: "تأكيد حالة المدرج وتنسيق الحركة مع المراقبة الجوية", role: "Tower liaison", completed: false },
      { id: "f2", label: "Request an inspection by the authorized airside safety team", arLabel: "طلب تفتيش من فريق السلامة الميدانية المخول", role: "Airside safety", completed: false },
      { id: "f3", label: "Review inspection findings and any required follow-up assessment", arLabel: "مراجعة نتائج التفتيش وأي تقييم إضافي مطلوب", role: "Maintenance lead", completed: false },
      { id: "f4", label: "Confirm the authorized decision and required aeronautical information updates", arLabel: "تأكيد القرار المخول وتحديثات معلومات الطيران المطلوبة", role: "AOCC duty lead", completed: false },
    ],
  },
  {
    id: "medical-diversion",
    title: "In-Flight Priority Medical Diversion",
    arTitle: "هبوط اضطراري لحالة طبية حرجة بالجو",
    reference: "Local medical response procedure required",
    severity: "critical",
    summary: "Training prompts for an inbound medical event. Coordinate the stand, access route, and response with authorized teams.",
    arSummary: "خطوات مراجعة تدريبية لحدث طبي على رحلة قادمة. نسّق الموقف ومسار الوصول والاستجابة مع الفرق المخولة.",
    steps: [
      { id: "m1", label: "Check an appropriate stand and ambulance access with the stand planner", arLabel: "التحقق من موقف مناسب ووصول سيارة الإسعاف مع مخطط المواقف", role: "Stand planner", completed: false },
      { id: "m2", label: "Confirm notification of the designated airport medical response team", arLabel: "تأكيد إبلاغ فريق الاستجابة الطبية المحدد بالمطار", role: "Medical liaison", completed: false },
      { id: "m3", label: "Coordinate ground access with the authorized airside team", arLabel: "تنسيق الوصول الأرضي مع الفريق الميداني المخول", role: "Airside liaison", completed: false },
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

  const dialogRef = useModalFocus(isOpen, onClose);

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
                const now = new Date().toISOString().slice(11, 19);
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
    soundEffects.playClick();
    const now = new Date().toISOString().slice(11, 19);
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
      language === "ar" ? "تمت مراجعة القائمة التدريبية" : "Training checklist reviewed",
      language === "ar"
        ? `تم تعليم بنود ${currentPlaybook.arTitle} كمراجعة محلية فقط`
        : `Items for ${currentPlaybook.title} marked reviewed in this session only`,
      "ok"
    );
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={language === "ar" ? "قوائم مراجعة الطوارئ التدريبية" : "Training emergency review checklists"}
      className="printable-dialog fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
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
                  {language === "ar" ? "قوائم مراجعة الطوارئ التدريبية" : "Training contingency checklists"}
                </h2>
                <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[10px] font-bold text-muted-foreground uppercase">
                  SAMPLE
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {language === "ar" ? "أمثلة تدريبية فقط؛ تحقق من إجراءات المطار المعتمدة قبل أي إجراء تشغيلي." : "Illustrative prompts only. Check approved local procedures before operational action."}
              </p>
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

        {/* Playbook Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 border-b border-border/40 [scrollbar-width:none]">
          {playbooks.map((pb) => {
            const active = pb.id === activePlaybookId;
            return (
              <button
                key={pb.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  soundEffects.playClick();
                  setActivePlaybookId(pb.id);
                }}
                className={`flex items-center gap-1.5 shrink-0 rounded-xl px-3 py-1.5 min-h-[44px] text-xs font-semibold transition-all cursor-pointer ${
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
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
              <h3 className="font-bold text-sm text-foreground">
                {language === "ar" ? currentPlaybook.arTitle : currentPlaybook.title}
              </h3>
              <span className="text-[11px] font-semibold text-primary">{language === "ar" ? "يلزم الإجراء المحلي المعتمد" : currentPlaybook.reference}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {language === "ar" ? currentPlaybook.arSummary : currentPlaybook.summary}
            </p>
          </div>

          {/* Action Checklist */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block px-1">
              {language === "ar" ? "نقاط مراجعة تدريبية" : "Training review prompts"}
            </span>
            {currentPlaybook.steps.map((step) => (
              <button
                key={step.id}
                type="button"
                aria-pressed={step.completed}
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
                  <span className="text-xs font-medium block text-foreground">
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
            <span>{language === "ar" ? "طباعة القائمة" : "Print checklist"}</span>
          </button>

          <div className="flex items-center gap-2">
            {!allCompleted ? (
              <button
                type="button"
                onClick={handleCompleteAll}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all active-spring cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{language === "ar" ? "تعليم الكل كمراجع" : "Mark all reviewed"}</span>
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-status-ok">
                <CheckCircle2 className="h-4 w-4" />
                <span>{language === "ar" ? "تمت المراجعة في هذه الجلسة" : "Reviewed in this session"}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
