import { useModalFocus } from "../../hooks/useModalFocus";
import { useState } from "react";
import {
  X,
  CheckCircle2,
  FileSignature,
  PlaneTakeoff,
  Users,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useLocale } from "../../context/locale";
import { notifyManager } from "../../utils/toast";
import { soundEffects } from "../../services/soundEffects";
import { ManagerTab } from "../../data";

export interface ExecutiveDecisionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHandover?: () => void;
  onNavigateTab?: (tab: ManagerTab, subView?: "flights" | "analytics") => void;
}

export function ExecutiveDecisionsModal({
  isOpen,
  onClose,
  onOpenHandover,
  onNavigateTab,
}: ExecutiveDecisionsModalProps) {
  const { language, tr } = useLocale();

  const [handoverApproved, setHandoverApproved] = useState(false);
  const [surgeCrewDispatched, setSurgeCrewDispatched] = useState(false);

  const dialogRef = useModalFocus(isOpen, onClose);

  const pendingCount =
    (handoverApproved ? 0 : 1) +
    (surgeCrewDispatched ? 0 : 1);

  const handleApproveHandover = () => {
    soundEffects.playClick();
    setHandoverApproved(true);
    notifyManager(
      language === "ar" ? "تمت مراجعة محضر الوردية" : "Handover reviewed locally",
      language === "ar"
        ? "تم حفظ حالة المراجعة في هذه الجلسة التدريبية فقط"
        : "Review state saved in this training session only.",
      "ok"
    );
  };

  const handleDispatchSurgeCrew = () => {
    soundEffects.playClick();
    setSurgeCrewDispatched(true);
    notifyManager(
      language === "ar" ? "تمت مراجعة خطة التعزيز" : "Surge proposal reviewed",
      language === "ar"
        ? "لم يُرسل أي فريق؛ الحالة محفوظة في هذه الجلسة التدريبية فقط"
        : "No crew was dispatched; this is a local training state.",
      "ok"
    );
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exec-decisions-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/15 bg-card/95 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl transition-all duration-300 dark:bg-card/95 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-primary/40 bg-primary/10 text-primary shadow-xs">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="exec-decisions-title"
                  className="text-lg sm:text-xl font-bold tracking-tight text-foreground"
                >
                  {language === "ar" ? "مركز القرارات التنفيذية" : "Executive Decision Dock"}
                </h2>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-mono font-bold ${
                    pendingCount > 0
                      ? "bg-status-warn/20 text-status-warn border border-status-warn/40 animate-pulse"
                      : "bg-status-ok/20 text-status-ok border border-status-ok/40"
                  }`}
                >
                  {pendingCount > 0
                    ? language === "ar"
                      ? `${pendingCount} قيد المراجعة`
                      : `${pendingCount} Pending`
                    : language === "ar"
                    ? "تمت المراجعة محلياً"
                    : "Reviewed locally"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {language === "ar"
                  ? "قرارات تدريبية فقط؛ لا تتصل بأنظمة المطار ولا تنفذ إجراءات تشغيلية."
                  : "Training decisions only. No airport system is updated or operational action taken."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-xl border border-border/50 bg-secondary/40 text-muted-foreground transition hover:bg-secondary hover:text-foreground cursor-pointer"
            aria-label={tr("Close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Decision Cards List */}
        <div className="mt-4 space-y-3 max-h-[62vh] overflow-y-auto pe-1">
          {/* Decision 1: Shift Turnover Sign-Off */}
          <div
            className={`rounded-2xl border p-4 transition-all duration-200 ${
              handoverApproved
                ? "border-status-ok/30 bg-status-ok/5"
                : "border-primary/30 bg-background/60 shadow-xs"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                    handoverApproved
                      ? "bg-status-ok/20 text-status-ok"
                      : "bg-primary/15 text-primary"
                  }`}
                >
                  <FileSignature className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
                      {language === "ar" ? "مراجعة تدريبية" : "TRAINING REVIEW"}
                    </span>
                    <span className="text-muted-foreground/40">&bull;</span>
                    <span className="text-xs text-muted-foreground">
                      {language === "ar" ? "تسليم وردية الصباح" : "Morning Shift Wave"}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base mt-0.5">
                    {language === "ar"
                      ? "مراجعة مثال تسليم الوردية"
                      : "Review sample shift handover"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {language === "ar"
                      ? "مثال تدريبي لتسليم الوردية يتضمن مراجعة حركة الرحلات وتوزيع العاملين بين المباني."
                      : "Training handover example covering flight movement review and staffing across terminals."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-1 sm:pt-0">
                {handoverApproved ? (
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-status-ok/30 bg-status-ok/10 px-3 py-2 text-xs font-semibold text-status-ok">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{language === "ar" ? "تمت المراجعة محلياً" : "Reviewed locally"}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {onOpenHandover && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenHandover();
                        }}
                        className="min-h-[44px] inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-secondary/50 px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition cursor-pointer"
                        title={language === "ar" ? "فتح المحضر الكامل" : "View Full Report"}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">
                          {language === "ar" ? "عرض المحضر" : "View"}
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleApproveHandover}
                      className="min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 active:scale-95 transition shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{language === "ar" ? "تعليم كمراجع" : "Mark reviewed"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Decision 2: Review the stand assignment training example */}
          <div
            className="rounded-2xl border border-status-warn/40 bg-status-warn/5 p-4 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-status-warn/20 text-status-warn"
                >
                  <PlaneTakeoff className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-status-warn">
                      {language === "ar" ? "أمان الساحة والمواقف" : "AIRSIDE SEPARATION"}
                    </span>
                    <span className="text-muted-foreground/40">&bull;</span>
                    <span className="font-mono text-xs font-semibold text-foreground">
                      Stand S-305 &bull; Stand S-306
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base mt-0.5">
                    {language === "ar"
                      ? "تعارض تخصيص بين الرحلتين SV302 وEK927"
                      : "Stand assignment: SV302 and EK927"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {language === "ar"
                      ? "بيانات المثال تشير إلى تعارض بين الموقفين 305 و306. راجع محاكاة نقل EK927 إلى R-14؛ لم تُحسب مسافة فصل فعلية."
                      : "The training data flags Gates 305 and 306. Review the proposed move of EK927 to R-14; no actual clearance has been calculated."}
                  </p>
                </div>
              </div>

              {onNavigateTab && <button type="button" onClick={() => {
                onClose();
                onNavigateTab("digital");
                let attempts = 0;
                const revealStandDiagram = () => {
                  const panel = document.getElementById("stand-assignments");
                  if (panel) {
                    panel.scrollIntoView({ block: "start", behavior: "smooth" });
                    panel.focus({ preventScroll: true });
                  } else if (attempts++ < 12) {
                    window.setTimeout(revealStandDiagram, 100);
                  }
                };
                window.setTimeout(revealStandDiagram, 0);
              }} className="min-h-11 shrink-0 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground hover:bg-secondary">
                {language === "ar" ? "راجع مخطط المواقف" : "Review stand diagram"}
              </button>}
            </div>
          </div>

          {/* Decision 3: Midday Surge Wave Workforce Dispatch */}
          <div
            className={`rounded-2xl border p-4 transition-all duration-200 ${
              surgeCrewDispatched
                ? "border-status-ok/30 bg-status-ok/5"
                : "border-cyan/40 bg-cyan/5 shadow-xs"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                    surgeCrewDispatched
                      ? "bg-status-ok/20 text-status-ok"
                      : "bg-cyan/20 text-cyan"
                  }`}
                >
                  <Users className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan">
                      {language === "ar" ? "تخطيط القوى العاملة" : "WORKFORCE PLANNING"}
                    </span>
                    <span className="text-muted-foreground/40">&bull;</span>
                    <span className="text-xs text-muted-foreground">
                      {language === "ar" ? "صالة سفر مبنى 3" : "Terminal 3 Hall 4"}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base mt-0.5">
                    {language === "ar"
                      ? "مراجعة مقترح تعزيز الجوازات"
                      : "Review passport-control surge proposal"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {language === "ar"
                      ? "سيناريو تدريبي لزيادة الطلب. تحقق من قياسات الطوابير والموارد المتاحة قبل وضع خطة تعزيز فعلية."
                      : "Training surge scenario. Verify measured queues and available staff before any real deployment plan."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-1 sm:pt-0">
                {surgeCrewDispatched ? (
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-status-ok/30 bg-status-ok/10 px-3 py-2 text-xs font-semibold text-status-ok">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{language === "ar" ? "تمت المراجعة محلياً" : "Reviewed locally"}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateTab("staffing");
                        }}
                        className="min-h-[44px] inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-secondary/50 px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition cursor-pointer"
                        title={language === "ar" ? "عرض جدول المناوبات" : "View Staffing Grid"}
                      >
                        <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
                        <span className="hidden sm:inline">
                          {language === "ar" ? "المناوبات" : "Staffing"}
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleDispatchSurgeCrew}
                      className="min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 active:scale-95 transition shadow-xs cursor-pointer"
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>{language === "ar" ? "تعليم كمراجع" : "Mark reviewed"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Summary */}
        <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
          <span className="font-mono">
            {language === "ar"
              ? "قرارات نموذجية · مراجعة محلية فقط"
              : "Sample decisions · local review only"}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-secondary text-foreground font-semibold hover:bg-secondary/80 transition cursor-pointer"
          >
            {language === "ar" ? "إغلاق المركز" : "Dismiss"}
          </button>
        </div>
      </div>
    </div>
  );
}
