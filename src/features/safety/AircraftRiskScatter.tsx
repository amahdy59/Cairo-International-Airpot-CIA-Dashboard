import { useId } from "react";
import type { AircraftRiskRow } from "../../data";
import { useLocale } from "../../context/locale";

export function AircraftRiskScatter({ rows }: { rows: AircraftRiskRow[] }) {
  const { language } = useLocale();
  const isAr = language === "ar";
  const id = useId();
  if (!rows.length) return <p className="text-sm text-muted-foreground">{isAr ? "لا تتوفر بيانات مخاطر الطائرات." : "No aircraft risk data available."}</p>;

  const width = 440;
  const height = 224;
  const left = 44;
  const right = 24;
  const top = 16;
  const bottom = 42;
  const maxEvents = Math.max(8, Math.ceil(Math.max(...rows.map(row => row.events)) / 2) * 2);
  const x = (events: number) => left + Math.max(0, events) / maxEvents * (width - left - right);
  const y = (risk: number) => top + (1 - Math.min(100, Math.max(0, risk)) / 100) * (height - top - bottom);
  const highest = rows.reduce((best, row) => row.risk > best.risk ? row : best);

  return <figure className="min-w-0">
    <figcaption className="mb-2 text-xs text-muted-foreground">{isAr ? "عدد الوقائع مقابل درجة المخاطر خلال ٣٠ يوماً" : "Events versus 30-day risk score"} · <strong className="text-foreground">{highest.reg} {highest.risk}%</strong></figcaption>
    <p className="mb-1 text-xs text-muted-foreground min-[400px]:hidden">{isAr ? "مرّر المخطط لعرض جميع النقاط" : "Scroll chart for all points"}</p>
    <div className="table-scroll" role="region" tabIndex={0} dir="ltr" aria-label={isAr ? "مخطط مخاطر الطائرات، قابل للتمرير" : "Aircraft risk scatter plot, horizontally scrollable"}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[300px]" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>{isAr ? "مخاطر الطائرات والوقائع" : "Aircraft risk and events"}</title>
        <desc id={`${id}-desc`}>{isAr ? "المحور الأفقي عدد الوقائع، والرأسي درجة المخاطر من صفر إلى مئة. القيم الدقيقة في جدول التفاصيل." : "Horizontal axis: event count. Vertical axis: risk score from zero to 100. Exact values are in the details table."}</desc>
        {[0, 50, 100].map(tick => <g key={tick}>
          <line x1={left} x2={width - right} y1={y(tick)} y2={y(tick)} stroke="var(--border)" strokeDasharray={tick ? "3 5" : undefined} />
          <text x={left - 8} y={y(tick) + 4} textAnchor="end" fill="var(--muted-foreground)" fontSize="12">{tick}</text>
        </g>)}
        {Array.from({ length: 5 }, (_, index) => maxEvents * index / 4).map(tick => <g key={tick}>
          <line x1={x(tick)} x2={x(tick)} y1={height - bottom} y2={height - bottom + 4} stroke="var(--muted-foreground)" />
          <text x={x(tick)} y={height - 23} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12">{tick}</text>
        </g>)}
        <text x={width / 2} y={height - 3} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12">{isAr ? "الوقائع" : "Events"}</text>
        <line x1={left} x2={width - right} y1={y(70)} y2={y(70)} stroke="var(--status-crit)" strokeDasharray="3 5" strokeOpacity="0.6" />
        <text x={left + 5} y={y(70) - 5} fill="var(--status-crit)" fontSize="11">{isAr ? "حد الخطر المرتفع ٧٠" : "High risk 70"}</text>
        {rows.map((row, index) => {
          const color = row.risk >= 70 ? "var(--status-crit)" : row.risk >= 50 ? "var(--status-warn)" : "var(--status-ok)";
          return <g key={row.reg}>
            <circle cx={x(row.events)} cy={y(row.risk)} r="11" fill="var(--card)" stroke={color} strokeWidth="3" />
            <text x={x(row.events)} y={y(row.risk) + 4} textAnchor="middle" fill="var(--foreground)" fontSize="11" fontWeight="700">{index + 1}</text>
          </g>;
        })}
      </svg>
    </div>
    <ol className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
      {rows.map((row, index) => <li key={row.reg} className="flex items-center gap-1.5"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border font-mono font-bold">{index + 1}</span><strong className="font-mono">{row.reg}</strong><span className="text-muted-foreground">{row.events} / {row.risk}%</span></li>)}
    </ol>
  </figure>;
}
