import { Link } from "@tanstack/react-router";
import {
  Activity, PlaneTakeoff, Navigation, Flame, DoorOpen, BusFront, Sparkles,
} from "lucide-react";
import { useDashboard } from "@/lib/dashboard-context";

const NAV = [
  { to: "/", icon: Activity, key: "overview" as const, code: "01" },
  { to: "/flights", icon: PlaneTakeoff, key: "flights" as const, code: "02" },
  { to: "/navigation", icon: Navigation, key: "navigation" as const, code: "03" },
  { to: "/heatmap", icon: Flame, key: "heatmap" as const, code: "04" },
  { to: "/gates", icon: DoorOpen, key: "gates" as const, code: "05" },
  { to: "/transport", icon: BusFront, key: "transport" as const, code: "06" },
  { to: "/services", icon: Sparkles, key: "services" as const, code: "07" },
];

export function Sidebar() {
  const { t } = useDashboard();
  return (
    <aside className="hidden lg:flex w-[260px] shrink-0 flex-col gap-1 border-e border-border bg-sidebar/70 backdrop-blur-md p-4">
      <div className="flex items-center gap-3 px-2 py-3">
        <div className="relative h-10 w-10 grid place-items-center rounded-lg bg-primary/15 border border-primary/40 glow-cyan">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12l9-2 2-9 2 9 9 2-9 2-2 9-2-9z" />
          </svg>
        </div>
        <div className="leading-tight">
          <div className="text-[11px] tracking-[0.18em] text-muted-foreground font-mono">CAI · OPS</div>
          <div className="font-semibold text-sm">Command Center</div>
        </div>
      </div>

      <div className="mt-2 mb-1 px-2 text-[10px] tracking-[0.22em] text-muted-foreground font-mono">
        {t("operations").toUpperCase()}
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ to, icon: Icon, key, code }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            className="group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors data-[status=active]:bg-primary/10 data-[status=active]:text-foreground data-[status=active]:border data-[status=active]:border-primary/40"
          >
            <span className="absolute start-0 top-1/2 -translate-y-1/2 h-0 w-[2px] bg-primary group-data-[status=active]:h-6 transition-all rounded-e" />
            <Icon className="h-4.5 w-4.5 shrink-0 text-primary/80 group-data-[status=active]:text-primary" />
            <span className="font-medium flex-1 truncate">{t(key)}</span>
            <span className="text-[10px] font-mono text-muted-foreground/70">{code}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-auto panel p-3 space-y-2">
        <div className="text-[10px] font-mono tracking-widest text-muted-foreground">SYSTEM</div>
        <div className="flex items-center justify-between text-xs">
          <span>Telemetry</span>
          <span className="flex items-center gap-1.5 text-status-ok">
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-status-ok pulse-dot" />
            Online
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span>Digital twin</span>
          <span className="text-primary font-mono">v4.2.1</span>
        </div>
      </div>
    </aside>
  );
}
