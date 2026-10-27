import type { StaffMember } from "../../data";
import { useLocale } from "../../context/locale";
import { localize } from "../../utils/helpers";

type Status = StaffMember["status"];
const statuses: Status[] = ["on_duty", "dispatched", "break", "standby"];
const colors: Record<Status, string> = {
  on_duty: "var(--status-ok)",
  dispatched: "var(--status-info)",
  break: "var(--status-warn)",
  standby: "var(--muted-foreground)",
};

export function RosterStatusWaffle({ roster }: { roster: StaffMember[] }) {
  const { language } = useLocale();
  const isAr = language === "ar";
  const labels: Record<Status, string> = isAr
    ? { on_duty: "في الخدمة", dispatched: "منتشر", break: "استراحة", standby: "احتياط" }
    : { on_duty: "On duty", dispatched: "Dispatched", break: "On break", standby: "Standby" };
  const counts = Object.fromEntries(statuses.map(status => [status, roster.filter(member => member.status === status).length])) as Record<Status, number>;
  const description = statuses.map(status => `${labels[status]} ${counts[status]}`).join(isAr ? "، " : ", ");

  return <figure className="mb-4 rounded-xl border border-border bg-background/40 p-3">
    <figcaption className="mb-2 text-sm font-semibold">{isAr ? `توفر أفراد العينة (${roster.length})` : `Sample roster availability (${roster.length})`}</figcaption>
    {roster.length ? <div role="img" aria-label={description} className="grid w-fit grid-cols-6 gap-1.5 sm:grid-cols-12">
      {roster.map(member => <span key={member.id} aria-hidden="true" title={`${localize(member.name, language)}: ${labels[member.status]}`} className="h-6 w-6 rounded-md border border-foreground/10" style={{ background: colors[member.status] }} />)}
    </div> : <p className="text-sm text-muted-foreground">{isAr ? "لا توجد سجلات أفراد." : "No roster entries."}</p>}
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {statuses.filter(status => counts[status] > 0).map(status => <li key={status} className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ background: colors[status] }} />{labels[status]} <strong className="text-foreground">{counts[status]}</strong></li>)}
    </ul>
  </figure>;
}
