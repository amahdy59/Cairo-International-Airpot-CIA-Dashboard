import { useState, useEffect } from "react";
import {
  X,
  AlertTriangle,
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
  const [apronDivertApproved, setApronDivertApproved] = useState(false);
  const [surgeCrewDispatched, setSurgeCrewDispatched] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const pendingCount =
    (handoverApproved ? 0 : 1) +
    (apronDivertApproved ? 0 : 1) +
    (surgeCrewDispatched ? 0 : 1);

  const handleApproveHandover = () => {
    soundEffects.playClick();
    setHandoverApproved(true);
    notifyManager(
      language === "ar" ? "محضر الوردية معتمد" : "Shift Handover Approved",
      language === "ar"
        ? "تم التصديق الرقمي على محضر تسليم الوردية ونقله للإدارة العامة"
        : "Shift handover briefing signed off and submitted to executive archive.",
      "ok"
    );
  };

  const handleApproveApronDivert = () => {
    soundEffects.playDispatch();
    setApronDivertApproved(true);
    notifyManager(
      language === "ar" ? "إذن التحويل معتمد" : "Stand R-14 Divert Authorized",
      language === "ar"
        ? "تم تحويل الرحلة SV-301 إلى الموقف R-14 لتفادي تعارض باع الأجنحة مع MS-800"
        : "Flight SV-301 tactically re-assigned to Remote Stand R-14 to protect wingspan separation.",
      "ok"
    );
  };

  const handleDispatchSurgeCrew = () => {
    soundEffects.playDispatch();
    setSurgeCrewDispatched(true);
    notifyManager(
      language === "ar" ? "نشر تعزيزات الجوازات" : "Surge Crew Dispatched",
      language === "ar"
        ? "تم نشر 14 موظف دعم إضافي بصالة سفر مبنى 3 لامتصاص ذروة الظهيرة"
        : "14 tactical roving marshals deployed to Terminal 3 passport control wave.",
      "ok"
    );
  };

  if (!isOpen) return null;

  return (
    <div
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
                    ? "مكتمل بالكامل"
                    : "All Resolved"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {language === "ar"
                  ? "الموافقات الفورية العابرة للأقسام لضمان انسيابية العمليات والامتثال لمعايير الإيكاو"
                  : "Cross-domain tactical authorizations requiring immediate leadership clearance."}
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
                      {language === "ar" ? "إدارة العمليات AOCC" : "AOCC DIRECTIVE"}
                    </span>
                    <span className="text-muted-foreground/40">&bull;</span>
                    <span className="text-xs text-muted-foreground">
                      {language === "ar" ? "تسليم وردية الصباح" : "Morning Shift Wave"}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base mt-0.5">
                    {language === "ar"
                      ? "المصادقة التنفيذية على محضر تسليم الوردية"
                      : "Shift Turnover Briefing Formal Sign-Off"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {language === "ar"
                      ? "يتضمن تقرير نوبة الصباح 148 حركة طيران، حالة المدارج الاسمية CAT III، وتوصيات نقل طاقم الإسناد لمبنى 3."
                      : "AOCC Shift Summary: 148 flight movements, CAT III nominal status, and recommended staffing transfer to Terminal 3."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-1 sm:pt-0">
                {handoverApproved ? (
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-status-ok/30 bg-status-ok/10 px-3 py-2 text-xs font-semibold text-status-ok">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{language === "ar" ? "معتمد ومؤرشف" : "Signed Off"}</span>
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
                      <span>{language === "ar" ? "اعتماد المحضر" : "Sign Off"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Decision 2: Stand S-305 / S-306 Wingspan Divert */}
          <div
            className={`rounded-2xl border p-4 transition-all duration-200 ${
              apronDivertApproved
                ? "border-status-ok/30 bg-status-ok/5"
                : "border-status-warn/40 bg-status-warn/5 shadow-xs"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                    apronDivertApproved
                      ? "bg-status-ok/20 text-status-ok"
                      : "bg-status-warn/20 text-status-warn"
                  }`}
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
                      ? "تعارض باع الأجنحة بين MS-800 و SV-301"
                      : "Stand Conflict: Wingspan Separation Margin"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {language === "ar"
                      ? "تزامن وقوف طائرة بوينج 777-300ER وطائرة إيرباص A330-300 بالموقفين المتجاورين ينتهك هامش الأمان (4.2م). الإجراء: تحويل فوري لـ SV-301 إلى الموقف البعيد R-14."
                      : "Simultaneous parking of B777-300ER and A330-300 breaches 7.5m wingtip safety buffer. Recommendation: Divert SV-301 to Stand R-14."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-1 sm:pt-0">
                {apronDivertApproved ? (
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-status-ok/30 bg-status-ok/10 px-3 py-2 text-xs font-semibold text-status-ok">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{language === "ar" ? "تم التحويل لـ R-14" : "Diverted to R-14"}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateTab("digital");
                        }}
                        className="min-h-[44px] inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-secondary/50 px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition cursor-pointer"
                        title={language === "ar" ? "عرض الخريطة التفاعلية" : "View in Digital Twin"}
                      >
                        <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
                        <span className="hidden sm:inline">
                          {language === "ar" ? "المخطط" : "Map"}
                        </span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleApproveApronDivert}
                      className="min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-status-warn px-3.5 py-2 text-xs font-bold text-black hover:opacity-90 active:scale-95 transition shadow-xs cursor-pointer"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>{language === "ar" ? "اعتماد التحويل (R-14)" : "Authorize R-14 Divert"}</span>
                    </button>
                  </div>
                )}
              </div>
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
                      {language === "ar" ? "القوى العاملة والتوزيع" : "WORKFORCE DISPATCH"}
                    </span>
                    <span className="text-muted-foreground/40">&bull;</span>
                    <span className="text-xs text-muted-foreground">
                      {language === "ar" ? "صالة سفر مبنى 3" : "Terminal 3 Hall 4"}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base mt-0.5">
                    {language === "ar"
                      ? "إرسال 14 موظف دعم إضافي لذروة الجوازات"
                      : "Tactical Surge: Dispatch 14 Roving Biometric Marshals"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {language === "ar"
                      ? "ارتفاع متوقع بنسبة +38% في كثافة الركاب بين 14:00 - 16:30. فتح 4 بوابات بيومترية إضافية يتطلب تفعيل سرية الدعم المركزية."
                      : "Anticipated +38% passenger surge between 14:00 - 16:30. Opening 4 supplemental e-gates requires activating Central Reserve Unit."}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pt-1 sm:pt-0">
                {surgeCrewDispatched ? (
                  <div className="inline-flex items-center gap-1.5 rounded-xl border border-status-ok/30 bg-status-ok/10 px-3 py-2 text-xs font-semibold text-status-ok">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{language === "ar" ? "تم النشر والمتابعة" : "Crew Dispatched"}</span>
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
                      className="min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-cyan px-3.5 py-2 text-xs font-bold text-black hover:opacity-90 active:scale-95 transition shadow-xs cursor-pointer"
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>{language === "ar" ? "إرسال التعزيزات" : "Dispatch Marshals"}</span>
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
              ? "نظام اتخاذ القرار الموحد AOCC • إصدار 2.4"
              : "CIA Executive Orchestration Engine v2.4"}
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
