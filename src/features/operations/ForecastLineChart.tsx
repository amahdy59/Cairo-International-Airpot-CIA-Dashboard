import { memo, useId } from "react";
import type { InfluxForecastPoint } from "../../data";
import { useLocale } from "../../context/locale";

export const ForecastLineChart = memo(function ForecastLineChart({ data }: { data: InfluxForecastPoint[] }) {
  const { language } = useLocale();
  const id = useId();
  const isAr = language === "ar";
  const points = data.filter((row) => Number.isFinite(row.forecast));
  if (!points.length) return <p className="py-8 text-center text-sm text-muted-foreground">{isAr ? "لا تتوفر بيانات التوقعات." : "No forecast data available."}</p>;

  const hasCapacity = points.every((row) => typeof row.modeledCapacity === "number" && Number.isFinite(row.modeledCapacity));
  const number = (value: number) => value.toLocaleString(isAr ? "ar-EG" : "en-US");
  const time = (value: string) => isAr ? value === "Now" ? "الآن" : value.replace(/\+(\d+)h/, "بعد $1 س") : value;
  const gaps = hasCapacity ? points.map((row) => row.forecast - (row.modeledCapacity ?? 0)) : [];
  const largestGap = gaps.length ? Math.max(...gaps) : 0;
  const peakGapIndex = gaps.indexOf(largestGap);
  const overCapacity = gaps.filter((gap) => gap > 0).length;
  const ceiling = Math.max(500, Math.ceil(Math.max(...points.flatMap((row) => [row.forecast, row.modeledCapacity ?? 0])) / 500) * 500);
  const width = 440, height = 210, left = 52, right = 16, top = 20, bottom = 30;
  const plotHeight = height - top - bottom;
  const x = (index: number) => points.length === 1 ? (width + left - right) / 2 : left + index / (points.length - 1) * (width - left - right);
  const y = (value: number) => top + plotHeight * (1 - value / ceiling);
  const forecastPath = points.map((row, index) => `${index ? "L" : "M"} ${x(index)},${y(row.forecast)}`).join(" ");
  const capacityPath = points.map((row, index) => `${index ? "L" : "M"} ${x(index)},${y(row.modeledCapacity ?? 0)}`).join(" ");

  return <figure className="min-w-0">
    <figcaption className="mb-2 text-sm text-muted-foreground" aria-live="polite">
      {hasCapacity ? largestGap > 0
        ? <>{isAr ? "أكبر فجوة متوقعة: " : "Largest modeled shortfall: "}<strong className="font-semibold text-status-warn">+{number(largestGap)} {isAr ? "راكب/ساعة" : "passengers/hour"}</strong> · {time(points[peakGapIndex].time)}</>
        : <strong className="font-semibold text-foreground">{isAr ? "التوقع ضمن السعة النموذجية" : "Forecast within modeled capacity"}</strong>
        : <strong className="font-semibold text-foreground">{isAr ? "توقع تدفق الركاب" : "Passenger demand forecast"}</strong>}
    </figcaption>
    {hasCapacity && <p className="mb-3 text-xs text-muted-foreground">{isAr ? `${overCapacity} من ${points.length} فترات تتجاوز فيها التوقعات السعة النموذجية.` : `${overCapacity} of ${points.length} hourly periods forecast above modeled capacity.`}</p>}
    <div className="table-scroll" role="region" tabIndex={0} dir="ltr" aria-label={isAr ? "رسم الطلب والسعة، قابل للتمرير" : "Demand and capacity chart, horizontally scrollable"}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[360px]" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>{isAr ? "الطلب المتوقع والسعة النموذجية لكل ساعة" : "Forecast demand and modeled capacity by hour"}</title>
        <desc id={`${id}-desc`}>{isAr ? "المحور الرأسي ركاب في الساعة يبدأ من الصفر. خط متقطع للتوقعات وخط متصل للسعة النموذجية. القيم في الجدول أدناه." : "Vertical axis shows passengers per hour from zero. Dashed line shows forecast demand; solid line shows modeled capacity. Exact values are in the table below."}</desc>
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => <g key={fraction}>
          <line x1={left} x2={width - right} y1={y(ceiling * fraction)} y2={y(ceiling * fraction)} stroke="var(--border)" strokeDasharray={fraction ? "3 5" : undefined} />
          <text x={left - 8} y={y(ceiling * fraction) + 4} textAnchor="end" fill="var(--muted-foreground)" fontSize="12">{number(ceiling * fraction)}</text>
        </g>)}
        {hasCapacity && <path d={capacityPath} fill="none" stroke="var(--primary)" strokeWidth="2.5" />}
        <path d={forecastPath} fill="none" stroke="var(--status-warn)" strokeWidth="2.5" strokeDasharray="7 5" />
        {points.map((row, index) => <g key={`${row.time}-${index}`}>
          {hasCapacity && <circle cx={x(index)} cy={y(row.modeledCapacity ?? 0)} r="3.5" fill="var(--card)" stroke="var(--primary)" strokeWidth="2" />}
          <rect x={x(index) - 3.5} y={y(row.forecast) - 3.5} width="7" height="7" fill="var(--card)" stroke={gaps[index] > 0 ? "var(--status-crit)" : "var(--status-warn)"} strokeWidth="2" />
          <text x={x(index)} y={height - 7} textAnchor="middle" fill="var(--muted-foreground)" fontSize="13">{time(row.time)}</text>
        </g>)}
      </svg>
    </div>
    <p className="mt-1 text-[11px] text-muted-foreground sm:hidden">{isAr ? "اسحب المخطط لعرض الفترات اللاحقة" : "Swipe chart for later hours"}</p>
    <details className="mt-3 rounded-lg border border-border px-3">
      <summary className="flex min-h-11 cursor-pointer list-item items-center text-sm font-medium text-primary">{isAr ? "عرض القيم وطريقة الحساب" : "View values and method"}</summary>
      <p className="mb-2 text-xs text-muted-foreground">{isAr ? "قيم سيناريو تدريبية لكل ساعة. السعة نموذج افتراضي لتوزيع الموظفين؛ الفجوة = الطلب المتوقع − السعة، وليست عدد ركاب متأثرين. لا توجد قياسات مباشرة أو فاصل ثقة." : "Hourly training values. Capacity is a staffing model; gap = forecast demand − modeled capacity, not a count of affected passengers. No live measurement or confidence interval is available."}</p>
      <div className="table-scroll pb-3" tabIndex={0} role="region" aria-label={isAr ? "قيم الطلب والسعة" : "Demand and capacity values"}>
        <table className="w-full text-start text-sm tabular-nums">
          <caption className="sr-only">{isAr ? "الطلب والسعة حسب الساعة" : "Hourly forecast demand and capacity"}</caption>
          <thead><tr className="border-b border-border text-muted-foreground"><th scope="col" className="py-2 text-start">{isAr ? "الفترة" : "Period"}</th><th scope="col" className="py-2 text-end">{isAr ? "التوقع" : "Forecast"}</th>{hasCapacity && <><th scope="col" className="py-2 text-end">{isAr ? "السعة" : "Capacity"}</th><th scope="col" className="py-2 text-end">{isAr ? "الفجوة" : "Gap"}</th></>}</tr></thead>
          <tbody>{points.map((row, index) => <tr key={`${row.time}-${index}`} className="border-b border-border/40"><th scope="row" className="py-2 text-start font-medium">{time(row.time)}</th><td className="py-2 text-end">{number(row.forecast)}</td>{hasCapacity && <><td className="py-2 text-end">{number(row.modeledCapacity ?? 0)}</td><td className={`py-2 text-end ${gaps[index] > 0 ? "font-bold text-status-warn" : ""}`}>{gaps[index] > 0 ? "+" : ""}{number(gaps[index])}</td></>}</tr>)}</tbody>
        </table>
      </div>
    </details>
  </figure>;
});
