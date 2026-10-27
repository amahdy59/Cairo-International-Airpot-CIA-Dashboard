import { useMemo, useState } from "react";
import { ArrowUpRight, ClipboardList, RotateCcw } from "lucide-react";
import type { ManagerTab } from "../../data";
import { useLocale } from "../../context/locale";
import { useOperationalEvents, type AirportRole, type OperationalEvent } from "../../context/operationalEvents";
import { SelectMenu } from "../common/SelectMenu";

const roles: { value: AirportRole; en: string; ar: string }[] = [
  { value: "manager", en: "Duty manager · all teams", ar: "مدير النوبة · جميع الفرق" },
  { value: "airside", en: "Airside team", ar: "فريق الساحة" },
  { value: "terminal", en: "Terminal team", ar: "فريق المباني" },
  { value: "baggage", en: "Baggage team", ar: "فريق الأمتعة" },
  { value: "safety", en: "Safety team", ar: "فريق السلامة" },
  { value: "staffing", en: "Staffing team", ar: "فريق القوى العاملة" },
];

const priorityRank = { critical: 0, high: 1, medium: 2 };

export function OperationalWorkQueue({ onNavigateTab }: { onNavigateTab: (tab: ManagerTab) => void }) {
  const { language } = useLocale();
  const isAr = language === "ar";
  const { events, role, setRole, assignEvent, selectEvent, resetExercise } = useOperationalEvents();
  const [expanded, setExpanded] = useState(false);
  const scoped = useMemo(() => events.filter((event) => role === "manager" || event.role === role).sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]), [events, role]);
  const open = scoped.filter((event) => event.state !== "simulated");
  const counts = { critical: open.filter((event) => event.priority === "critical").length, high: open.filter((event) => event.priority === "high").length, medium: open.filter((event) => event.priority === "medium").length };
  const prioritySummary = isAr ? `${counts.critical} حرج · ${counts.high} مرتفع · ${counts.medium} متوسط` : `${counts.critical} critical · ${counts.high} high · ${counts.medium} medium`;

  return <section aria-labelledby="work-queue-heading" className="panel mt-3 rounded-2xl border border-border bg-card p-3 sm:p-4">
    <div className="flex items-center justify-between gap-2 lg:gap-3">
      <div className="flex min-w-0 items-start gap-2.5">
        <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><ClipboardList className="h-4.5 w-4.5" /></span>
        <div className="min-w-0">
          <h2 id="work-queue-heading" className="text-sm font-bold text-foreground">{isAr ? "قائمة المتابعة التشغيلية" : "Operational work queue"}</h2>
          <p className="hidden text-xs text-muted-foreground sm:block">{isAr ? "مهام السيناريو بحسب الفريق المسؤول · لا تُرسل أوامر حقيقية" : "Scenario tasks by responsible team · actions are simulated"}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden min-w-0 sm:w-56 lg:block"><SelectMenu<AirportRole> label={isAr ? "عرض الفريق" : "Team view"} value={role} onChange={setRole} options={roles.map((item) => ({ value: item.value, label: isAr ? item.ar : item.en }))} className="w-full" /></div>
        <button type="button" aria-expanded={expanded} aria-controls="operational-task-list" onClick={() => setExpanded((value) => !value)} className="min-h-11 rounded-lg border border-border bg-secondary/40 px-3 text-sm font-semibold text-foreground hover:bg-secondary">{expanded ? isAr ? "إخفاء" : "Hide" : isAr ? `المهام (${open.length})` : `Tasks (${open.length})`}</button>
      </div>
    </div>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div role="img" aria-label={prioritySummary} className="flex h-2.5 w-28 shrink-0 overflow-hidden rounded-full bg-secondary sm:w-40">
          {open.length > 0 && <>
            <span style={{ width: `${counts.critical / open.length * 100}%` }} className="bg-status-crit" />
            <span style={{ width: `${counts.high / open.length * 100}%` }} className="bg-status-warn" />
            <span style={{ width: `${counts.medium / open.length * 100}%` }} className="bg-status-info" />
          </>}
        </div>
        <span className="text-xs text-muted-foreground">{prioritySummary}</span>
      </div>
      <span className="text-[11px] font-semibold text-muted-foreground">{isAr ? "بيانات تدريبية" : "SIMULATED DATA"}</span>
    </div>
    {expanded && <div id="operational-task-list" className="mt-3 border-t border-border/60 pt-3">
      <div className="mb-3 w-full lg:hidden"><SelectMenu<AirportRole> label={isAr ? "عرض الفريق" : "Team view"} value={role} onChange={setRole} options={roles.map((item) => ({ value: item.value, label: isAr ? item.ar : item.en }))} className="w-full" /></div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground" aria-live="polite">{isAr ? `${open.length} مهام تحتاج متابعة` : `${open.length} tasks need follow-up`}</p>
        <button type="button" onClick={resetExercise} className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-primary hover:bg-secondary"><RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />{isAr ? "إعادة ضبط المثال" : "Reset example"}</button>
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">{scoped.map((event) => <TaskCard key={event.id} event={event} isAr={isAr} onAssign={() => assignEvent(event.id)} onInspect={() => { selectEvent(event.id); onNavigateTab("digital"); }} />)}</div>
      {scoped.length === 0 && <p className="rounded-lg border border-border p-4 text-sm text-muted-foreground">{isAr ? "لا توجد مهام لهذا الفريق في السيناريو الحالي." : "No tasks for this team in the current scenario."}</p>}
    </div>}
  </section>;
}

function TaskCard({ event, isAr, onAssign, onInspect }: { event: OperationalEvent; isAr: boolean; onAssign: () => void; onInspect: () => void }) {
  const priority = event.priority === "critical" ? isAr ? "حرج" : "Critical" : event.priority === "high" ? isAr ? "مرتفع" : "High" : isAr ? "متوسط" : "Medium";
  const state = event.state === "simulated" ? isAr ? "أُجري في المحاكاة" : "Simulated" : event.state === "assigned" ? isAr ? "أُسند للفريق" : "Assigned" : isAr ? "يحتاج مراجعة" : "Needs review";
  return <article className={`rounded-xl border p-3 ${event.state === "simulated" ? "border-status-ok/35 bg-status-ok/5" : event.priority === "critical" ? "border-status-crit/40 bg-status-crit/5" : "border-border bg-background/50"}`}>
    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold">
      <span className={event.priority === "critical" ? "text-status-crit" : event.priority === "high" ? "text-status-warn" : "text-status-info"}>{priority}</span>
      <span className="text-muted-foreground">{event.terminal.toUpperCase()} · {event.sampleTime} {isAr ? "وقت العينة" : "sample time"}</span>
    </div>
    <h3 className="mt-1 text-sm font-bold text-foreground">{isAr ? event.title.ar : event.title.en}</h3>
    <p className="mt-1 text-xs text-muted-foreground">{isAr ? event.passengerImpact.ar : event.passengerImpact.en}</p>
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="rounded-md bg-secondary px-2 py-1 text-[11px] font-semibold text-foreground">{state}</span>
      <div className="ms-auto flex gap-1">
        {event.state === "open" && <button type="button" onClick={onAssign} className="min-h-11 rounded-lg border border-border px-2.5 text-xs font-semibold text-foreground hover:bg-secondary">{isAr ? "إسناد للفريق" : "Assign team"}</button>}
        <button type="button" onClick={onInspect} className="inline-flex min-h-11 items-center gap-1 rounded-lg bg-primary px-2.5 text-xs font-bold text-primary-foreground"><span>{isAr ? "التفاصيل" : "Inspect"}</span><ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  </article>;
}
