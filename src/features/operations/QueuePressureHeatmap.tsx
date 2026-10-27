import type { QueuePressureRow } from "../../data";
import { useLocale } from "../../context/locale";
import { SectionPanel, StatusPill } from "../../components/command-center/MetricWidgets";

type Metric = "checkIn" | "passport" | "security" | "total";

export function QueuePressureHeatmap({ rows, activeTerminal }: { rows: QueuePressureRow[]; activeTerminal: string }) {
  const { language } = useLocale();
  const isAr = language === "ar";
  const columns: { key: Metric; label: string }[] = [
    { key: "checkIn", label: isAr ? "التسجيل" : "Check-in" },
    { key: "passport", label: isAr ? "الجوازات" : "Passport" },
    { key: "security", label: isAr ? "الأمن" : "Security" },
    { key: "total", label: isAr ? "الإجمالي" : "Overall" },
  ];

  return <SectionPanel title={isAr ? "خريطة ضغط الطوابير" : "Queue pressure heatmap"} action={activeTerminal !== "ALL" ? <StatusPill tone="info">{activeTerminal}</StatusPill> : undefined}>
    <p className="mb-3 text-xs text-muted-foreground">{isAr ? "المقياس ٠–١٠٠٪ لكل مرحلة؛ الإجمالي مؤشر مستقل." : "0–100% for each stage; overall is a separate index."}</p>
    {rows.length === 0 ? <p className="text-sm text-muted-foreground">{isAr ? "لا تتوفر بيانات طوابير." : "No queue data available."}</p> :
      <div className="table-scroll" role="region" tabIndex={0} aria-label={isAr ? "خريطة ضغط الطوابير، قابلة للتمرير" : "Queue pressure heatmap, horizontally scrollable"}>
        <table className="w-full min-w-[340px] table-fixed border-separate border-spacing-1 text-center text-xs sm:text-sm">
          <caption className="sr-only">{isAr ? "ضغط الطوابير حسب المبنى والمرحلة" : "Queue pressure by terminal and stage"}</caption>
          <thead><tr><th scope="col" className="w-11 text-start"><span className="sr-only">{isAr ? "المبنى" : "Terminal"}</span></th>{columns.map(column => <th key={column.key} scope="col" className={`pb-1 font-medium text-muted-foreground ${column.key === "total" ? "border-s border-border ps-1" : ""}`}>{column.label}</th>)}</tr></thead>
          <tbody>{rows.map(row => <tr key={row.terminal}>
            <th scope="row" className="text-start font-mono font-bold">{row.terminal}</th>
            {columns.map(column => {
              const value = Math.min(100, Math.max(0, row[column.key]));
              const opacity = Math.round(8 + value * 0.45);
              const color = column.key === "total" ? "var(--status-warn)" : "var(--status-info)";
              return <td key={column.key} className={column.key === "total" ? "border-s border-border ps-1" : ""}>
                <span className="grid min-h-12 place-items-center rounded-lg border border-border/60 font-mono font-bold tabular-nums text-foreground" style={{ backgroundColor: `color-mix(in srgb, ${color} ${opacity}%, var(--card))` }} aria-label={`${row.terminal} ${column.label}: ${value}%`}>{value}%</span>
              </td>;
            })}
          </tr>)}</tbody>
        </table>
      </div>}
  </SectionPanel>;
}
