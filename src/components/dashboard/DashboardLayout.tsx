import type { ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Plane, Map as MapIcon, Activity, ShieldCheck, Navigation as NavIcon, Contrast, Languages, Users, Briefcase } from "lucide-react";
import { DashboardProvider, useDashboard } from "@/lib/dashboard-context";

const TRAVELER = [
  { to: "/", label: "Airport Map", icon: MapIcon },
  { to: "/directions", label: "Directions", icon: NavIcon },
] as const;

const MANAGER = [
  { to: "/ops", label: "Operations Pulse", icon: Activity },
  { to: "/safety", label: "Safety & Maintenance", icon: ShieldCheck },
] as const;

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardProvider>
      <Shell>{children}</Shell>
    </DashboardProvider>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const { mode, setMode, lang, setLang, hc, setHc } = useDashboard();
  const location = useLocation();
  const tabs = mode === "traveler" ? TRAVELER : MANAGER;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="h-9 w-9 grid place-items-center rounded-lg bg-primary/15 border border-primary/40 glow-cyan">
              <Plane className="h-4 w-4 text-primary" strokeWidth={2.4} />
            </div>
            <div className="leading-tight">
              <div className="text-[10px] font-mono tracking-[0.22em] text-primary">CAI · CAIRO INTL</div>
              <div className="font-semibold text-sm">Smart Airport</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ms-6">
            {tabs.map(({ to, label, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-3.5 h-9 rounded-md text-sm transition-colors ${
                    active
                      ? "bg-primary/15 text-primary border border-primary/40"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="ms-auto flex items-center gap-2">
            <div className="flex items-center bg-secondary/60 border border-border rounded-lg p-0.5">
              <ModeBtn active={mode === "traveler"} onClick={() => setMode("traveler")} icon={<Users className="h-3.5 w-3.5" />} label="Traveler" />
              <ModeBtn active={mode === "manager"} onClick={() => setMode("manager")} icon={<Briefcase className="h-3.5 w-3.5" />} label="Manager" />
            </div>

            <button
              onClick={() => setHc(!hc)}
              aria-pressed={hc}
              title="High contrast"
              className={`hidden sm:grid h-9 w-9 place-items-center rounded-md border ${hc ? "border-primary text-primary bg-primary/15" : "border-border hover:bg-secondary"}`}
            >
              <Contrast className="h-4 w-4" />
            </button>
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-md border border-border text-xs hover:bg-secondary"
            >
              <Languages className="h-4 w-4 text-primary" />
              <span className="font-mono">{lang === "en" ? "AR" : "EN"}</span>
            </button>
          </div>
        </div>

        {/* Mobile tabs */}
        <nav className="md:hidden flex items-center gap-1 px-3 pb-3 overflow-x-auto">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 h-9 rounded-md text-sm shrink-0 ${
                  active ? "bg-primary/15 text-primary border border-primary/40" : "text-muted-foreground border border-border"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 lg:p-6">{children}</main>

      <footer className="border-t border-border py-4 px-6 text-[11px] text-muted-foreground text-center">
        Cairo International Airport · Operated by Cairo Airport Company · IATA: CAI · ICAO: HECA
      </footer>
    </div>
  );
}

function ModeBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-medium transition-colors ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
