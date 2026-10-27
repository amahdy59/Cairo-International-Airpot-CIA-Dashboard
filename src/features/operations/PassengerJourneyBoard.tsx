import { ArrowRight, ChevronRight } from "lucide-react";
import { useLocale } from "../../context/locale";
import { useSimulation } from "../../context/simulation";
import { useOperationalEvents } from "../../context/operationalEvents";
import { SectionPanel } from "../../components/command-center/MetricWidgets";

export function PassengerJourneyBoard({ onInspectEvent }: { onInspectEvent?: (id: string) => void }) {
  const { language } = useLocale();
  const isAr = language === "ar";
  const { activeTerminal, reactiveQueueRows, reactiveGateWaits } = useSimulation();
  const { events } = useOperationalEvents();
  const focus = activeTerminal === "ALL" ? [...reactiveQueueRows].sort((a, b) => b.total - a.total)[0] : reactiveQueueRows[0];
  const gateWaits = reactiveGateWaits.filter((item) => item.terminal === focus?.terminal);
  const longestGateWait = gateWaits.length ? Math.max(...gateWaits.map((item) => item.wait)) : null;
  const relatedEvents = events.filter((event) => event.terminal === focus?.terminal && event.state !== "simulated" && (event.domain === "passenger" || event.id === "gate-b12" || event.id === "t2-scanner"));

  return <SectionPanel title={isAr ? "رحلة الراكب · نقاط الضغط" : "Passenger journey · pressure points"} action={<span className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold text-muted-foreground">{focus?.terminal ?? "—"} · {isAr ? "سيناريو" : "Scenario"}</span>}>
    {!focus ? <p className="text-sm text-muted-foreground">{isAr ? "لا تتوفر بيانات للرحلة." : "No journey data available."}</p> : <>
      <p className="mb-3 text-xs text-muted-foreground">{activeTerminal === "ALL" ? isAr ? "يعرض المبنى الأعلى ضغطاً في السيناريو الحالي." : "Showing the highest-pressure terminal in this scenario." : isAr ? "يعرض المبنى المحدد." : "Showing the selected terminal."} {isAr ? "مؤشرات المراحل من ٠–١٠٠؛ انتظار البوابة بالدقائق." : "Stage pressure is a 0–100 index; gate wait is in minutes."}</p>
      <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4" aria-label={isAr ? "تسلسل رحلة المغادرة" : "Departure journey sequence"}>
        {([
          { key: "checkIn", en: "Check-in", ar: "تسجيل السفر", value: focus.checkIn },
          { key: "security", en: "Security", ar: "الفحص الأمني", value: focus.security },
          { key: "passport", en: "Passport", ar: "الجوازات", value: focus.passport },
          { key: "gate", en: "Gate", ar: "البوابة", value: longestGateWait },
        ] as const).map((stage, index) => {
          const isGate = stage.key === "gate";
          const stageEvent = relatedEvents.find((event) => stage.key === "security" ? event.id === "t2-security" || event.id === "t2-scanner" : isGate && event.id === "gate-b12");
          return <li key={stage.key} className={`relative rounded-xl border p-3 ${stageEvent ? "border-status-warn/45 bg-status-warn/5" : "border-border bg-background/50"}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{index + 1}. {isAr ? stage.ar : stage.en}</span>
              {index < 3 && <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground rtl:rotate-180" />}
            </div>
            <p className="mt-2 text-xl font-bold tabular-nums text-foreground">{stage.value === null ? "—" : stage.value}<span className="ms-1 text-xs font-medium text-muted-foreground">{isGate ? isAr ? "دقيقة" : "min" : isAr ? "مؤشر ضغط" : "pressure"}</span></p>
            {!isGate && <div role="img" aria-label={isAr ? `${stage.ar}: ${stage.value} من ١٠٠` : `${stage.en}: ${stage.value} out of 100`} className="mt-2 h-2 overflow-hidden rounded-full bg-secondary"><div aria-hidden="true" className={`h-full rounded-full ${stageEvent ? "bg-status-warn" : "bg-primary"}`} style={{ width: `${Math.min(100, Math.max(0, stage.value))}%` }} /></div>}
            {stageEvent && <p className="mt-2 text-xs font-semibold text-status-warn">{isAr ? "تتطلب متابعة" : "Needs follow-up"}</p>}
          </li>;
        })}
      </ol>
      {relatedEvents.length > 0 && <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
        {relatedEvents.map((event) => onInspectEvent ? <button key={event.id} type="button" onClick={() => onInspectEvent(event.id)} className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-border bg-secondary/40 px-3 text-xs font-semibold text-foreground hover:bg-secondary">{isAr ? event.title.ar : event.title.en}<ChevronRight aria-hidden="true" className="h-3.5 w-3.5 rtl:rotate-180" /></button> : <span key={event.id} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold">{isAr ? event.title.ar : event.title.en}</span>)}
      </div>}
      <p className="mt-3 text-xs text-muted-foreground">{isAr ? "هذه قيم سيناريو للتخطيط، وليست قياسات مباشرة أو تقديراً لعدد الركاب المتأثرين." : "These are planning scenario values, not live measurements or counts of affected passengers."}</p>
    </>}
  </SectionPanel>;
}
