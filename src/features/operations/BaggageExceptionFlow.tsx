import { ArrowRight, Luggage } from "lucide-react";
import { useLocale } from "../../context/locale";
import { useOperationalEvents } from "../../context/operationalEvents";
import { useSimulation } from "../../context/simulation";

export function BaggageExceptionFlow({ onInspect }: { onInspect?: () => void }) {
  const { language } = useLocale();
  const { scenarioId } = useSimulation();
  const { events } = useOperationalEvents();
  if (scenarioId !== "baggage-failure") return null;
  const event = events.find((item) => item.id === "t3-baggage");
  if (!event) return null;
  const isAr = language === "ar";
  const stages = [
    { key: "accept", en: "Acceptance", ar: "استلام الحقائب", statusEn: "No scan feed", statusAr: "لا يوجد مصدر مسح", tone: "neutral" },
    { key: "sort", en: "Sort & transfer", ar: "الفرز والنقل", statusEn: "Sorter fault flagged", statusAr: "تنبيه عطل الفرز", tone: "warn" },
    { key: "load", en: "Aircraft load", ar: "تحميل الطائرة", statusEn: event.state === "assigned" ? "Team assigned · review load" : "Manual team proposed", statusAr: event.state === "assigned" ? "أُسند للفريق · راجع التحميل" : "فريق يدوي مقترح", tone: "warn" },
    { key: "arrival", en: "Arrival handover", ar: "التسليم عند الوصول", statusEn: "No scan feed", statusAr: "لا يوجد مصدر مسح", tone: "neutral" },
  ] as const;

  return <section aria-labelledby="baggage-flow-heading" className="panel rounded-2xl border border-status-warn/40 bg-card p-4 sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div className="flex items-start gap-2.5">
        <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-status-warn/10 text-status-warn"><Luggage className="h-4.5 w-4.5" /></span>
        <div>
          <h2 id="baggage-flow-heading" className="text-base font-bold text-foreground">{isAr ? "مسار استثناء الأمتعة · مبنى 3" : "Baggage exception path · T3"}</h2>
          <p className="text-xs text-muted-foreground">{isAr ? "مثال تدريبي · عطل الفرز 14:20 · الرحلات MS778 وSV302" : "Training example · sorter fault 14:20 · MS778 and SV302"}</p>
        </div>
      </div>
      {onInspect && <button type="button" onClick={onInspect} className="min-h-11 rounded-lg border border-border px-3 text-xs font-semibold text-primary hover:bg-secondary">{isAr ? "عرض الحدث" : "Open event"}</button>}
    </div>
    <ol className="mt-3 grid gap-2 sm:grid-cols-4" aria-label={isAr ? "مراحل التعامل مع الحقائب" : "Baggage handling stages"}>
      {stages.map((stage, index) => <li key={stage.key} className={`relative rounded-xl border p-3 ${stage.tone === "warn" ? "border-status-warn/40 bg-status-warn/5" : "border-border bg-background/50"}`}>
        <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-foreground">{index + 1}. {isAr ? stage.ar : stage.en}</span>{index < stages.length - 1 && <ArrowRight aria-hidden="true" className="hidden h-4 w-4 text-muted-foreground sm:block rtl:rotate-180" />}</div>
        <p className={`mt-1 text-xs ${stage.tone === "warn" ? "font-semibold text-status-warn" : "text-muted-foreground"}`}>{isAr ? stage.statusAr : stage.statusEn}</p>
      </li>)}
    </ol>
    <p className="mt-3 text-xs text-muted-foreground">{isAr ? "يعرض المخطط حالة السيناريو والإجراء المقترح. لا توجد أعداد حقائب أو عمليات مسح موصولة؛ مراحل الاستلام والوصول غير مؤكدة." : "This shows a scenario fault and proposed response. No bag counts or scan events are connected; acceptance and arrival states are unknown."}</p>
  </section>;
}
