import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Panel } from "@/components/dashboard/widgets";
import { Navigation, MapPin, Car, Bus, Train, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/directions")({
  head: () => ({
    meta: [
      { title: "Get to Cairo Airport — Directions" },
      { name: "description", content: "Get driving, transit, walking directions from your location to Cairo International Airport terminals." },
    ],
  }),
  component: DirectionsPage,
});

const TERMINAL_DESTS = [
  { id: "T1", label: "Terminal 1", q: "Cairo International Airport Terminal 1" },
  { id: "T2", label: "Terminal 2", q: "Cairo International Airport Terminal 2" },
  { id: "T3", label: "Terminal 3", q: "Cairo International Airport Terminal 3" },
  { id: "ST", label: "Seasonal / Hajj Terminal", q: "Cairo International Airport Seasonal Terminal" },
];

const MODES = [
  { id: "driving", label: "Driving", icon: Car },
  { id: "transit", label: "Transit", icon: Train },
  { id: "walking", label: "Walking", icon: Bus },
];

function DirectionsPage() {
  const [origin, setOrigin] = useState("");
  const [dest, setDest] = useState(TERMINAL_DESTS[2].q);
  const [mode, setMode] = useState("driving");
  const [submitted, setSubmitted] = useState(false);

  const mapsEmbedSrc = useMemo(() => {
    const o = encodeURIComponent(origin || "");
    const d = encodeURIComponent(dest);
    // Public Google Maps embed (no API key) — directions
    if (origin) {
      return `https://www.google.com/maps?saddr=${o}&daddr=${d}&dirflg=${mode === "driving" ? "d" : mode === "transit" ? "r" : "w"}&output=embed`;
    }
    return `https://www.google.com/maps?q=${d}&output=embed`;
  }, [origin, dest, mode]);

  const openInMaps = () => {
    const o = encodeURIComponent(origin || "My location");
    const d = encodeURIComponent(dest);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${d}&travelmode=${mode}`;
    window.open(url, "_blank", "noopener");
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setOrigin(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`),
      () => alert("Unable to get your location."),
    );
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="panel p-5 lg:p-6">
          <div className="text-[11px] font-mono tracking-[0.22em] text-primary">PLAN YOUR TRIP</div>
          <h1 className="mt-1 text-2xl lg:text-3xl font-semibold tracking-tight">Directions to Cairo Airport</h1>
          <p className="text-sm text-muted-foreground max-w-2xl mt-1.5">
            Type any starting point — a city like <span className="text-foreground">Minya</span>, an address, or use your current location — and pick the terminal you need. We&rsquo;ll route you on Google Maps.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-5">
          {/* Form */}
          <Panel title="Route" className="h-fit">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono tracking-wider text-muted-foreground">FROM</label>
                <div className="mt-1.5 flex gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="e.g. Minya, Egypt"
                      className="w-full h-10 ps-9 pe-3 rounded-md bg-background border border-border focus:border-primary outline-none text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={useMyLocation}
                    title="Use my location"
                    className="h-10 px-3 rounded-md border border-border hover:bg-secondary text-xs"
                  >
                    My location
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono tracking-wider text-muted-foreground">TO · TERMINAL</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {TERMINAL_DESTS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setDest(t.q)}
                      className={`px-3 h-10 rounded-md text-sm border text-start transition-colors ${
                        dest === t.q
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border hover:bg-secondary"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono tracking-wider text-muted-foreground">TRAVEL MODE</label>
                <div className="mt-1.5 inline-flex bg-secondary/60 border border-border rounded-md p-0.5">
                  {MODES.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setMode(id)}
                      className={`flex items-center gap-1.5 px-3 h-8 rounded text-xs ${
                        mode === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 h-10 rounded-md bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:opacity-90"
                >
                  <Navigation className="h-4 w-4" /> Show route
                </button>
                <button
                  type="button"
                  onClick={openInMaps}
                  className="h-10 px-3 rounded-md border border-border hover:bg-secondary text-sm flex items-center gap-1.5"
                >
                  <ExternalLink className="h-4 w-4" /> Open
                </button>
              </div>
            </form>

            <div className="mt-4 panel-inner p-3 text-xs text-muted-foreground">
              <div className="text-foreground font-medium mb-1">Tip — pick the right terminal</div>
              EgyptAir ➔ T3 · Star/SkyTeam partners ➔ T2 · Domestic / Air Arabia ➔ T1 · Hajj/charter ➔ Seasonal.
            </div>
          </Panel>

          {/* Map */}
          <div className="panel overflow-hidden min-h-[420px]">
            <iframe
              key={mapsEmbedSrc + (submitted ? "y" : "n")}
              title="Google Maps directions to Cairo Airport"
              src={mapsEmbedSrc}
              className="w-full h-full min-h-[420px] block"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
