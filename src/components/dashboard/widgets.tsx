import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

export function StatCard({
  label, value, unit, delta, deltaTone = "ok", icon: Icon, hint, accent,
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
  const tone = {
    ok: "text-status-ok",
    warn: "text-status-warn",
    crit: "text-status-crit",
    info: "text-primary",
  }[deltaTone];

  const accentBar = {
    cyan: "from-cyan to-cyan/0",
    magenta: "from-magenta to-magenta/0",
    warn: "from-status-warn to-status-warn/0",
    ok: "from-status-ok to-status-ok/0",
  }[accent ?? "cyan"];

  const positive = delta?.trim().startsWith("-") === false && deltaTone === "ok";

  return (
    <div className="panel p-4 relative overflow-hidden">
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accentBar}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-mono tracking-[0.18em] text-muted-foreground uppercase">{label}</div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl lg:text-3xl font-semibold tracking-tight">{value}</span>
            {unit && <span className="text-xs text-muted-foreground font-mono">{unit}</span>}
          </div>
          {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
        </div>
        {Icon && (
          <div className="h-9 w-9 grid place-items-center rounded-md border border-border bg-background/60">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </div>
      {delta && (
        <div className={`mt-2 inline-flex items-center gap-1 text-xs ${tone}`}>
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          <span className="font-mono">{delta}</span>
        </div>
      )}
    </div>
  );
}

export function StatusPill({
  tone = "ok", icon, children,
}: { tone?: "ok" | "info" | "warn" | "high" | "crit" | "neutral"; icon?: ReactNode; children: ReactNode }) {
  const map = {
    ok: "bg-status-ok/15 text-status-ok border-status-ok/30",
    info: "bg-primary/15 text-primary border-primary/30",
    warn: "bg-status-warn/15 text-status-warn border-status-warn/30",
    high: "bg-status-high/15 text-status-high border-status-high/30",
    crit: "bg-status-crit/15 text-status-crit border-status-crit/40",
    neutral: "bg-muted text-muted-foreground border-border",
  } as const;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-md border ${map[tone]}`}>
      {icon}
      {children}
    </span>
  );
}

export function Panel({
  title, action, children, dense, className = "",
}: { title?: string; action?: ReactNode; children: ReactNode; dense?: boolean; className?: string }) {
  return (
    <section className={`panel ${dense ? "p-3" : "p-4"} ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between mb-3">
          {title && (
            <div className="flex items-center gap-2">
              <span className="h-3 w-[3px] rounded bg-primary" />
              <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
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
  const w = 100, h = height;
  const min = Math.min(...data), max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / span) * (h - 6) - 3;
    return [x, y];
  });
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${d} L ${w},${h} L 0,${h} Z`;
  const id = "spk-" + Math.random().toString(36).slice(2, 8);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" />
      {pts.length > 0 && (
        <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="1.8" fill={color} />
      )}
    </svg>
  );
}

export function Bar({ value, max = 100, color = "var(--cyan)", className = "" }: { value: number; max?: number; color?: string; className?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={`relative h-1.5 w-full bg-secondary rounded-full overflow-hidden ${className}`}>
      <div className="absolute inset-y-0 start-0 rounded-full" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 10px ${color}` }} />
    </div>
  );
}
