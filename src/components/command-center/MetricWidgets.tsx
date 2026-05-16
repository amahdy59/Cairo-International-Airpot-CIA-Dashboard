import { useId, type ReactNode } from "react";
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
  accent?: "cyan" | "magenta" | "warn" | "ok";
}) {
  const toneClass = {
    ok: "text-status-ok",
    warn: "text-status-warn",
    crit: "text-status-crit",
    info: "text-primary",
  }[deltaTone];

  const accentClass = {
    cyan: "from-cyan to-cyan/0",
    magenta: "from-magenta to-magenta/0",
    warn: "from-status-warn to-status-warn/0",
    ok: "from-status-ok to-status-ok/0",
  }[accent];

  const accentHex = {
    cyan: "var(--cyan)",
    magenta: "var(--magenta)",
    warn: "var(--status-warn)",
    ok: "var(--status-ok)",
  }[accent];

  const isPositive = deltaTone === "ok" && delta != null && !delta.trim().startsWith("-");

  return (
    <article 
      className="panel relative overflow-hidden p-4"
      style={{
        background: `linear-gradient(145deg, color-mix(in oklab, var(--surface) 95%, transparent) 0%, color-mix(in oklab, ${accentHex} 12%, transparent) 100%)`
      }}
    >
      <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full opacity-40 mix-blend-multiply dark:mix-blend-screen dark:opacity-15 blur-2xl pointer-events-none" style={{ backgroundColor: accentHex }} />
      <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${accentClass} opacity-80`} />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-semibold tracking-tight lg:text-3xl">{value}</span>
            {unit && <span className="font-mono text-xs text-muted-foreground">{unit}</span>}
          </div>
          {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-border bg-background/60 shadow-sm backdrop-blur-md">
            <Icon aria-hidden="true" className="h-4 w-4" style={{ color: accentHex }} />
          </div>
        )}
      </div>
      {delta && (
        <p className={`relative z-10 mt-2 inline-flex items-center gap-1 text-xs ${toneClass}`}>
          {isPositive ? <ArrowUpRight aria-hidden="true" className="h-3 w-3" /> : <ArrowDownRight aria-hidden="true" className="h-3 w-3" />}
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
}: {
  tone?: StatusTone;
  icon?: ReactNode;
  children: ReactNode;
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
    <span className={`inline-flex min-w-max whitespace-nowrap items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${toneClass}`}>
      {icon}
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
  return (
    <section className={`panel ${dense ? "p-3" : "p-4"} ${className}`}>
      {(title || action) && (
        <header className="mb-3 grid gap-2 sm:flex sm:items-center sm:justify-between sm:gap-3">
          {title && (
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-3 w-[3px] shrink-0 rounded bg-primary" />
              <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
            </div>
          )}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Sparkline({ data, color = "var(--cyan)", height = 44 }: { data: number[]; color?: string; height?: number }) {
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
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }} aria-hidden="true">
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
}

export function ProgressBar({ value, max = 100, color = "var(--cyan)", className = "" }: { value: number; max?: number; color?: string; className?: string }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`relative h-1.5 w-full overflow-hidden rounded-full bg-secondary ${className}`}>
      <div className="absolute inset-y-0 start-0 rounded-full" style={{ width: `${percent}%`, background: color, boxShadow: `0 0 10px ${color}` }} />
    </div>
  );
}
