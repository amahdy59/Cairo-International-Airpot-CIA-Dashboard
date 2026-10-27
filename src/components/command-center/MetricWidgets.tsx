import { useId, memo, type ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

type StatusTone = "ok" | "info" | "warn" | "high" | "crit" | "neutral";

export function MetricCard({
  label,
  value,
  unit,
  delta,
  deltaTone = "ok",
  icon: Icon,
  hint,
  accent = "cyan",
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  deltaTone?: "ok" | "warn" | "crit" | "info";
  icon?: LucideIcon;
  hint?: string;
  accent?: "cyan" | "magenta" | "warn" | "ok" | "crit";
}) {
  const toneClass = {
    ok: "text-status-ok",
    warn: "text-status-warn",
    crit: "text-status-crit",
    info: "text-primary",
  }[deltaTone];

  const accentHex = {
    cyan: "var(--cyan)",
    magenta: "var(--magenta)",
    warn: "var(--status-warn)",
    ok: "var(--status-ok)",
    crit: "var(--status-crit)",
  }[accent];

  const trend = delta?.trim().match(/^([+\-−])\s*[\d٠-٩]/)?.[1];

  return (
    <article className="panel metric-card relative overflow-hidden p-4">
      <div className="relative z-10 flex items-start justify-between gap-3 ps-1">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight tabular-nums text-foreground lg:text-3xl">{value}</span>
            {unit && <span className="font-mono text-xs text-muted-foreground">{unit}</span>}
          </div>
          {hint && <p className="mt-1 text-xs text-muted-foreground font-medium">{hint}</p>}
        </div>
        {Icon && (
          <div className="hidden sm:grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border/50 bg-secondary/30">
            <Icon className="h-5 w-5 opacity-80 transition-opacity duration-300 group-hover:opacity-100" style={{ color: accentHex }} aria-hidden="true" />
          </div>
        )}
      </div>
      {delta && (
        <p className={`relative z-10 mt-2 inline-flex items-center gap-1 text-xs ${toneClass}`}>
          {trend && (trend === "+" ? <ArrowUpRight aria-hidden="true" className="h-3 w-3" /> : <ArrowDownRight aria-hidden="true" className="h-3 w-3" />)}
          <span className="font-mono">{delta}</span>
        </p>
      )}
    </article>
  );
}

export function StatusPill({
  tone = "ok",
  icon,
  children,
  className = "",
}: {
  tone?: StatusTone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const toneClass = {
    ok: "bg-status-ok/15 text-status-ok border-status-ok/30",
    info: "bg-primary/15 text-primary border-primary/30",
    warn: "bg-status-warn/15 text-status-warn border-status-warn/30",
    high: "bg-status-high/15 text-status-high border-status-high/30",
    crit: "bg-status-crit/15 text-status-crit border-status-crit/40",
    neutral: "bg-muted text-muted-foreground border-border",
  }[tone];

  return (
    <span className={`inline-flex min-w-max whitespace-nowrap items-center gap-1.5 rounded-md border px-2.5 py-0.5 font-mono rtl:font-sans text-xs font-semibold uppercase rtl:normal-case tracking-wider rtl:tracking-normal ${toneClass} ${className}`}>
      {icon ?? <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0 opacity-80" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function SectionPanel({
  title,
  action,
  children,
  dense = false,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  dense?: boolean;
  className?: string;
}) {
  const headingId = useId();
  return (
    <section className={`panel ${dense ? "p-3" : "p-4"} ${className}`} aria-labelledby={title ? headingId : undefined}>
      {(title || action) && (
        <header className="mb-3 grid gap-2 sm:flex sm:items-center sm:justify-between sm:gap-3">
          {title && (
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-3 w-[3px] shrink-0 rounded bg-primary" />
              <h2 id={headingId} className="text-base font-bold tracking-tight text-foreground">{title}</h2>
            </div>
          )}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export const Sparkline = memo(function Sparkline({ data, color = "var(--cyan)", height = 44, "aria-label": ariaLabel }: { data: number[]; color?: string; height?: number; "aria-label"?: string }) {
  const gradientId = `sparkline-${useId().replace(/:/g, "")}`;
  const width = 100;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const points = data.map((value, index) => {
    const x = (index / Math.max(1, data.length - 1)) * width;
    const y = height - ((value - min) / span) * (height - 6) - 3;
    return [x, y];
  });
  const linePath = points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;
  const lastPoint = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }} role={ariaLabel ? "img" : undefined} aria-label={ariaLabel} aria-hidden={ariaLabel ? undefined : true}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.6" />
      {lastPoint && <circle cx={lastPoint[0]} cy={lastPoint[1]} r="1.8" fill={color} />}
    </svg>
  );
});

export function ProgressBar({ value, max = 100, color = "var(--cyan)", className = "", label }: { value: number; max?: number; color?: string; className?: string; label?: string }) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue = Number.isFinite(value) ? Math.min(safeMax, Math.max(0, value)) : 0;
  const percent = (safeValue / safeMax) * 100;

  return (
    <div 
      role="progressbar"
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-label={label ?? `${safeValue} / ${safeMax}`}
      className={`relative h-1.5 w-full overflow-hidden rounded-full bg-secondary ${className}`}
    >
      <div className="absolute inset-y-0 start-0 rounded-full" style={{ width: `${percent}%`, background: color }} />
    </div>
  );
}
