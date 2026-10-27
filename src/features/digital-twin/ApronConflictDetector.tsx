/* eslint-disable react-refresh/only-export-components */
import { AlertTriangle, ArrowRight, CheckCircle2, Plane } from "lucide-react";
import { useLocale } from "../../context/locale";
import { useOperationalEvents } from "../../context/operationalEvents";
import { soundEffects } from "../../services/soundEffects";
import { notifyManager } from "../../utils/toast";
export { INITIAL_STAND_ASSIGNMENTS, simulateApronDiversion } from "../../data/apronStands";
export type { ApronStandAssignment } from "../../data/apronStands";

export function ApronConflictDetector() {
  const { language } = useLocale();
  const isAr = language === "ar";
  const { standAssignments: stands, simulateStandMove, events } = useOperationalEvents();
  const moved = stands.some((stand) => stand.standId === "S-R14");
  const event = events.find((item) => item.id === "stand-305-306");

  const handleSimulate = () => {
    soundEffects.playDispatch();
    simulateStandMove();
    notifyManager(
      isAr ? "تمت محاكاة نقل الطائرة" : "Stand move simulated",
      isAr ? "نُقلت EK927 من الموقف 306 إلى R-14 في المثال التدريبي. يلزم التحقق من الملاءمة والمسافات الفعلية." : "EK927 moved from Gate 306 to R-14 in this training example. Actual stand fit and clearances still need verification.",
      "ok"
    );
  };

  return (
    <section id="stand-assignments" tabIndex={-1} aria-labelledby="apron-conflict-heading" className="panel paper-surface mb-3 scroll-mt-24 rounded-2xl border border-border bg-surface/80 p-3.5 sm:p-5">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${moved ? "border-status-ok/40 bg-status-ok/10 text-status-ok" : "border-status-crit/40 bg-status-crit/10 text-status-crit"}`}>
          {moved ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 id="apron-conflict-heading" className="text-base font-bold text-foreground">{isAr ? "تعارض تخصيص مواقف الطائرات" : "Stand assignment conflict"}</h3>
            <span className="rounded-md bg-secondary px-2 py-1 text-[11px] font-semibold text-muted-foreground">{isAr ? "مثال تدريبي" : "Training example"}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {moved
              ? isAr ? "في هذا المثال، أُخلي الموقف 306 ونُقلت EK927 إلى R-14. أزيل تنبيه الزوج 305–306." : "In this example, Gate 306 is empty and EK927 is at R-14. The 305–306 pair alert is cleared."
              : isAr ? "الموقفان 305 و306 معلّمان كتعارض في السيناريو. الطائرة EK927 هي المقترح نقلها." : "The scenario flags Gates 305 and 306 as a pair. EK927 is the proposed aircraft to move."}
          </p>
        </div>
      </div>

      <div className={`mt-4 rounded-xl border p-3 sm:p-4 ${moved ? "border-status-ok/40 bg-status-ok/5" : "border-status-crit/35 bg-status-crit/5"}`} aria-live="polite">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className={`text-sm font-bold ${moved ? "text-status-ok" : "text-status-crit"}`}>{moved ? isAr ? "تم النقل في المحاكاة" : "Move simulated" : isAr ? "الإجراء المقترح" : "Proposed move"}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground" aria-label={isAr ? "نقل رحلة EK927 من الموقف 306 إلى R-14" : "Move flight EK927 from Gate 306 to Stand R-14"}>
              <span className="rounded-lg border border-border bg-card px-2.5 py-1.5" dir="ltr">EK927 · A380</span>
              <span className="text-muted-foreground">{isAr ? "من" : "from"}</span>
              <span className="rounded-lg border border-border bg-card px-2.5 py-1.5">{isAr ? "الموقف 306" : "Gate 306"}</span>
              <ArrowRight aria-hidden="true" className="h-4 w-4 text-muted-foreground rtl:rotate-180" />
              <span className="rounded-lg border border-border bg-card px-2.5 py-1.5">{isAr ? "الموقف R-14" : "Stand R-14"}</span>
            </div>
          </div>
          {!moved && <button type="button" onClick={handleSimulate} className="min-h-11 w-full shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto">{isAr ? "محاكاة نقل EK927" : "Simulate moving EK927"}</button>}
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{isAr ? "تسلسل المواقف · مبنى 3" : "Stand sequence · Terminal 3"}</p>
        <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:grid-cols-5" aria-label={isAr ? "حالة المواقف 304 إلى 308" : "Status of Gates 304 through 308"}>
          {stands.filter((stand) => stand.standId !== "S-R14").map((stand) => {
            const flagged = stand.status === "conflict";
            const empty = stand.status === "standby";
            const statusLabel = empty ? isAr ? "خالٍ" : "Empty" : flagged ? stand.standId === "S-306" ? isAr ? "مقترح نقله" : "Move proposed" : isAr ? "متأثر" : "Affected" : isAr ? "مشغول" : "Occupied";
            return <li key={stand.standId} className={`min-w-0 rounded-xl border p-3 ${flagged ? "border-status-crit/60 bg-status-crit/5" : "border-border bg-card/70"}`}>
              <div className="flex flex-wrap items-start justify-between gap-1.5">
                <span className="font-semibold text-foreground">{isAr ? stand.gate.replace("Gate", "الموقف") : stand.gate}</span>
                <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold ${flagged ? "bg-status-crit/15 text-status-crit" : empty ? "bg-secondary text-muted-foreground" : "bg-status-ok/10 text-status-ok"}`}>{statusLabel}</span>
              </div>
              {empty ? <p className="mt-2 text-sm text-muted-foreground">{isAr ? "لا توجد طائرة" : "No aircraft assigned"}</p> : <>
                <p className="mt-2 flex min-w-0 items-center gap-1.5 text-sm font-semibold text-foreground"><Plane aria-hidden="true" className="h-3.5 w-3.5 shrink-0" /><span className="shrink-0 whitespace-nowrap" dir="ltr">{stand.flight}</span><span className="min-w-0 truncate text-xs font-normal text-muted-foreground">{stand.airline}</span></p>
                <p className="mt-1 text-xs text-muted-foreground" dir="ltr">{stand.aircraft.split(" ")[0]} · Code {stand.icaoCode} · {stand.wingspanM} m</p>
              </>}
            </li>;
          })}
        </ol>
        {moved && <p className="mt-2 rounded-lg border border-status-ok/35 bg-status-ok/5 px-3 py-2 text-sm font-semibold text-status-ok" role="status">{isAr ? "الموقف البعيد R-14: رحلة EK927 · طائرة A380" : "Remote stand R-14: EK927 · A380"}</p>}
      </div>

      <details className="mt-3 rounded-lg border border-border/60 bg-card/50 px-3 py-2 text-sm">
        <summary className="min-h-8 cursor-pointer font-semibold text-foreground">{isAr ? "كيف حُدد هذا التنبيه؟" : "How was this alert determined?"}</summary>
        <p className="mt-2 text-muted-foreground">{isAr
          ? "هذا تعارض مُدخل في بيانات السيناريو بين الموقفين 305 و306. الموقف 307 مشغول، لكن لا يوجد له تنبيه في هذه البيانات. أطوال الأجنحة معروضة، ولا تتوفر أبعاد المواقف أو مسافات الفصل المقاسة لحساب الخلوص الفعلي. تحقق من ملاءمة R-14 ومسارات الحركة قبل أي قرار تشغيلي."
          : "This pair is flagged in the scenario data. Gate 307 is occupied but has no recorded alert. Wingspans are shown; stand geometry and measured separation are unavailable, so actual clearance cannot be calculated. Verify R-14 fit and movement routes before any operational decision."}</p>
        {event && <div className="mt-3 border-t border-border/60 pt-2">
          <p className="text-xs font-semibold text-foreground">{isAr ? "سجل الحدث" : "Event history"}</p>
          <ol className="mt-1 space-y-1 text-xs text-muted-foreground">{event.history.map((entry, index) => <li key={`${entry.time}-${index}`}><time>{entry.time}</time> · {isAr ? entry.description.ar : entry.description.en}</li>)}</ol>
        </div>}
      </details>
    </section>
  );
}
