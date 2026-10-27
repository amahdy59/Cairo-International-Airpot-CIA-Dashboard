import type { FlightRow } from "../../data";
import { useLocale } from "../../context/locale";
import { SectionPanel } from "../../components/command-center/MetricWidgets";

type FlightGroup = "onTrack" | "active" | "attention";

const groupOrder: FlightGroup[] = ["onTrack", "active", "attention"];
const groupColor: Record<FlightGroup, string> = {
  onTrack: "var(--status-ok)",
  active: "var(--status-info)",
  attention: "var(--status-warn)",
};

function groupForFlight(row: FlightRow): FlightGroup {
  if (row.tone === "crit" || row.tone === "high" || row.tone === "warn") return "attention";
  return row.tone === "ok" ? "onTrack" : "active";
}

export function FlightStatusChart({ departures, arrivals }: { departures: FlightRow[]; arrivals: FlightRow[] }) {
  const { language } = useLocale();
  const isAr = language === "ar";
  const labels: Record<FlightGroup, string> = isAr
    ? { onTrack: "ضمن الخطة", active: "قيد التنفيذ", attention: "تحتاج متابعة" }
    : { onTrack: "On track", active: "In progress", attention: "Needs attention" };
  const directions = [
    { key: "departures", label: isAr ? "المغادرة" : "Departures", rows: departures },
    { key: "arrivals", label: isAr ? "الوصول" : "Arrivals", rows: arrivals },
  ];
  const total = departures.length + arrivals.length;
  const maxDirectionCount = Math.max(1, departures.length, arrivals.length);
  const allFlights = [...departures, ...arrivals];
  const legend = groupOrder.map(group => ({ group, count: allFlights.filter(row => groupForFlight(row) === group).length })).filter(item => item.count > 0);

  return (
    <SectionPanel title={isAr ? "حالة الرحلات حسب الاتجاه" : "Flight status by direction"}>
      {total === 0 ? <p className="text-sm text-muted-foreground">{isAr ? "لا توجد رحلات للمرشح الحالي." : "No flights match the current terminal."}</p> : <>
        <div className="grid gap-3">
          {directions.map(({ key, label, rows }) => {
            const counts = groupOrder.map(group => rows.filter(row => groupForFlight(row) === group).length);
            const description = groupOrder.map((group, index) => `${labels[group]} ${counts[index]}`).join(isAr ? "، " : ", ");
            const flightCount = isAr ? rows.length === 1 ? "رحلة واحدة" : rows.length === 2 ? "رحلتان" : `${rows.length} رحلات` : `${rows.length} ${rows.length === 1 ? "flight" : "flights"}`;
            return <div key={key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 sm:grid-cols-[6rem_minmax(0,1fr)_2rem]">
              <span className="col-start-1 row-start-1 text-sm font-semibold">{label}</span>
              <div role="img" aria-label={`${label}: ${flightCount}; ${description}`} className="col-span-2 row-start-2 flex h-5 overflow-hidden rounded-md bg-secondary sm:col-span-1 sm:col-start-2 sm:row-start-1">
                {groupOrder.map((group, index) => counts[index] > 0 && <span key={group} aria-hidden="true" style={{ width: `${counts[index] / maxDirectionCount * 100}%`, background: groupColor[group] }} />)}
              </div>
              <span className="col-start-2 row-start-1 text-end text-xs font-mono tabular-nums text-muted-foreground sm:col-start-3">{rows.length}</span>
            </div>;
          })}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {legend.map(({ group, count }) => <li key={group} className="inline-flex items-center gap-1.5"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-sm" style={{ background: groupColor[group] }} />{labels[group]} <strong className="text-foreground">{count}</strong></li>)}
        </ul>
      </>}
    </SectionPanel>
  );
}
