import { useState } from "react";
import { ClipboardCheck, Printer, X } from "lucide-react";
import { useLocale } from "../../context/locale";
import { useOperationalEvents } from "../../context/operationalEvents";
import { useSimulation } from "../../context/simulation";
import { useModalFocus } from "../../hooks/useModalFocus";
import { formatCairoTime } from "../../utils/helpers";

export function ShiftHandoverModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { language } = useLocale();
  const { scenarioId, metar } = useSimulation();
  const { events } = useOperationalEvents();
  const [outgoingManager, setOutgoingManager] = useState("");
  const [relievingManager, setRelievingManager] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const dialogRef = useModalFocus(isOpen, onClose);
  if (!isOpen) return null;

  const isAr = language === "ar";
  const openEvents = events.filter((event) => event.state !== "simulated");
  const date = new Date();
  const localTime = formatCairoTime(date.toISOString());
  const utcTime = date.toISOString().slice(11, 16);

  return <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="handover-title" className="printable-dialog fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-4">
    <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-surface p-4 text-foreground shadow-2xl sm:p-6">
      <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-start gap-3">
          <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary"><ClipboardCheck className="h-5 w-5" /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{isAr ? "مثال تدريبي · ملخص محلي" : "Training example · local summary"}</p>
            <h2 id="handover-title" className="text-lg font-bold">{isAr ? "ملخص تسليم الوردية" : "Shift handover summary"}</h2>
            <p className="text-sm text-muted-foreground">{isAr ? "راجع الأحداث المفتوحة وانقلها إلى الفريق التالي." : "Review open events with the incoming team."}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="grid min-h-11 min-w-11 place-items-center rounded-xl border border-border focus-visible:outline-2 focus-visible:outline-primary" aria-label={isAr ? "إغلاق" : "Close"}><X className="h-4 w-4" /></button>
      </div>

      <div className="space-y-4 overflow-y-auto py-4 text-sm">
        <dl className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-card/60 p-3 sm:grid-cols-4">
          <div><dt className="text-xs text-muted-foreground">{isAr ? "السيناريو" : "Scenario"}</dt><dd className="font-semibold">{scenarioId}</dd></div>
          <div><dt className="text-xs text-muted-foreground">{isAr ? "توقيت القاهرة" : "Cairo time"}</dt><dd className="font-mono font-semibold" dir="ltr">{localTime}</dd></div>
          <div><dt className="text-xs text-muted-foreground">UTC</dt><dd className="font-mono font-semibold" dir="ltr">{utcTime}Z</dd></div>
          <div><dt className="text-xs text-muted-foreground">{isAr ? "أحداث للمراجعة" : "Events to review"}</dt><dd className="font-mono font-semibold">{openEvents.length}</dd></div>
        </dl>

        <section aria-labelledby="handover-events-title">
          <h3 id="handover-events-title" className="mb-2 font-bold">{isAr ? "الأحداث المفتوحة" : "Open events"}</h3>
          {openEvents.length ? <ul className="space-y-2">{openEvents.map((event) => <li key={event.id} className="rounded-xl border border-border bg-card/60 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2"><strong>{isAr ? event.title.ar : event.title.en}</strong><span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold">{event.state === "assigned" ? isAr ? "أُسند" : "Assigned" : isAr ? "مفتوح" : "Open"}</span></div>
            <p className="mt-1 text-muted-foreground">{isAr ? event.proposedAction.ar : event.proposedAction.en}</p>
            <p className="mt-1 text-xs text-muted-foreground">{isAr ? event.source.ar : event.source.en} · {event.sampleTime}</p>
          </li>)}</ul> : <p className="rounded-xl border border-border p-3 text-muted-foreground">{isAr ? "لا توجد أحداث مفتوحة في هذا المثال." : "No open events in this example."}</p>}
        </section>

        <p className="rounded-xl border border-border bg-card/60 p-3 text-muted-foreground">{isAr ? `الطقس في السيناريو: رياح ${metar.windSpeedKt} عقدة. تحقق من مصادر التشغيل الفعلية قبل اتخاذ أي قرار.` : `Scenario weather: wind ${metar.windSpeedKt} kt. Verify actual operational sources before any decision.`}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold">{isAr ? "المسلم" : "Outgoing manager"}<input value={outgoingManager} onChange={(event) => setOutgoingManager(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary" /></label>
          <label className="text-xs font-semibold">{isAr ? "المستلم" : "Incoming manager"}<input value={relievingManager} onChange={(event) => setRelievingManager(event.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary" /></label>
        </div>
        {acknowledged && <p role="status" className="rounded-xl border border-status-ok/40 bg-status-ok/10 p-3 text-status-ok">{isAr ? "تم وضع علامة مراجعة محلية لهذا الملخص. لم يُرسل أو يُؤرشف خارج هذا المتصفح." : "Marked reviewed in this browser session. No external record was sent or archived."}</p>}
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-primary"><Printer className="h-4 w-4" />{isAr ? "طباعة" : "Print"}</button>
        <button type="button" onClick={() => setAcknowledged(true)} disabled={acknowledged} className="min-h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-60">{isAr ? "وضع علامة مراجعة" : "Mark reviewed locally"}</button>
      </div>
    </div>
  </div>;
}
