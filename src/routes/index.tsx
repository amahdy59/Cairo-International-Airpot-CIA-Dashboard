import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { IsometricMap } from "@/components/dashboard/IsometricMap";
import { Panel } from "@/components/dashboard/widgets";
import { Plane, Building2, Bus, Luggage, Coffee, Accessibility, ShieldCheck, Phone } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cairo Airport — Map & Terminals" },
      { name: "description", content: "Interactive 2D map of Cairo International Airport. Find your terminal, gates, parking and shuttle." },
    ],
  }),
  component: HomePage,
});

const TERMINALS = [
  {
    code: "T1",
    name: "Terminal 1",
    color: "oklch(0.78 0.15 150)",
    summary: "Domestic, charter & non-EgyptAir international",
    airlines: ["Air Arabia Egypt", "Saudia (some)", "Domestic carriers"],
    halls: "Hall 1 · Hall 2 · Hall 3",
  },
  {
    code: "T2",
    name: "Terminal 2",
    color: "oklch(0.82 0.15 210)",
    summary: "Star Alliance & SkyTeam partners (excl. EgyptAir)",
    airlines: ["Lufthansa", "Emirates", "British Airways", "KLM", "Qatar Airways"],
    halls: "Single linear concourse",
  },
  {
    code: "T3",
    name: "Terminal 3",
    color: "oklch(0.72 0.20 330)",
    summary: "EgyptAir hub & Star Alliance EgyptAir flights",
    airlines: ["EgyptAir", "Star Alliance partners with EgyptAir"],
    halls: "Concourse + pier · 11M pax/yr",
  },
];

const QUICK_LINKS = [
  { icon: Plane, label: "Book a flight", desc: "EgyptAir official booking", href: "https://www.egyptair.com/" },
  { icon: ShieldCheck, label: "Check-in / Manage", desc: "Online check-in & ticket confirmation", href: "https://www.egyptair.com/en/Pages/managemybooking.aspx" },
  { icon: Building2, label: "Visa info", desc: "Visa on arrival & e-visa", href: "https://visa2egypt.gov.eg/" },
  { icon: Luggage, label: "Lost & found", desc: "Report lost baggage", href: "https://cairo-airport.com/" },
  { icon: Phone, label: "Airport contact", desc: "+20 2 2265 5000", href: "tel:+20222655000" },
  { icon: Accessibility, label: "Special assistance", desc: "Ahlan Meet & Assist", href: "https://cairo-airport.com/" },
];

function HomePage() {
  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Hero header */}
        <div className="panel p-5 lg:p-6 flex flex-col lg:flex-row gap-4 lg:items-end justify-between">
          <div>
            <div className="text-[11px] font-mono tracking-[0.22em] text-primary">CAIRO INTERNATIONAL · CAI / HECA</div>
            <h1 className="mt-1 text-2xl lg:text-3xl font-semibold tracking-tight">Find your terminal at a glance</h1>
            <p className="text-sm text-muted-foreground max-w-xl mt-1.5">
              Tap any building below for quick facts. Three terminals, a seasonal Hajj terminal, three parallel runways and a free inter-terminal shuttle.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://www.google.com/maps/place/Cairo+International+Airport"
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-border hover:bg-secondary text-sm"
            >
              <Building2 className="h-4 w-4 text-primary" /> Open in Google Maps
            </a>
          </div>
        </div>

        {/* Map + Terminals legend */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-5">
          <IsometricMap className="aspect-[1100/720]" />
          <div className="space-y-3">
            {TERMINALS.map((t) => (
              <div key={t.code} className="panel p-4 hover:border-primary/40 transition-colors">
                <div className="flex items-start gap-3">
                  <div
                    className="h-10 w-10 rounded-lg grid place-items-center font-bold text-sm"
                    style={{ background: `color-mix(in oklab, ${t.color} 18%, transparent)`, color: t.color, border: `1px solid color-mix(in oklab, ${t.color} 50%, transparent)` }}
                  >
                    {t.code}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t.summary}</div>
                    <div className="text-[11px] font-mono text-muted-foreground/80 mt-1.5">{t.halls}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {t.airlines.map((a) => (
                        <span key={a} className="text-[10px] font-mono px-2 py-0.5 rounded border border-border bg-background/60">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="panel-inner p-3 flex items-start gap-3">
              <Bus className="h-4 w-4 text-primary mt-0.5" />
              <div className="text-xs">
                <div className="font-medium">Inter-terminal shuttle</div>
                <div className="text-muted-foreground mt-0.5">
                  Free bus T1 ↔ T2 ↔ T3 every ~10 min, 24/7. Look for the cyan shuttle stop signs.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Useful links */}
        <Panel title="Useful links">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {QUICK_LINKS.map(({ icon: Icon, label, desc, href }) => (
              <a
                key={label}
                href={href}
                target="_blank" rel="noreferrer"
                className="panel-inner p-3 hover:border-primary/40 transition-colors flex items-start gap-3 group"
              >
                <div className="h-9 w-9 grid place-items-center rounded-md bg-primary/10 border border-primary/30 shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium group-hover:text-primary transition-colors">{label}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{desc}</div>
                </div>
              </a>
            ))}
            <a href="#" className="panel-inner p-3 hover:border-primary/40 transition-colors flex items-start gap-3">
              <div className="h-9 w-9 grid place-items-center rounded-md bg-primary/10 border border-primary/30 shrink-0">
                <Coffee className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">Lounges & shops</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Duty Free, Ahlan VIP lounges</div>
              </div>
            </a>
          </div>
        </Panel>
      </div>
    </DashboardLayout>
  );
}
