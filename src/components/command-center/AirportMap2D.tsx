import { useState, type KeyboardEvent } from "react";
import { Armchair, BadgeInfo, Bus, Car, DoorOpen, Info, Landmark, MapPin, ShieldCheck, Stethoscope, Utensils } from "lucide-react";

type ZoneId = "T1" | "T2" | "T3" | "ST" | "CARGO" | "PARK" | "RWY" | "APM" | "ATM" | "FOOD" | "LOUNGE" | "GATES" | "SERVICES" | "OPS";
type LayerId = "atm" | "food" | "lounges" | "gates" | "services" | "ops";

const ZONE_INFO: Record<ZoneId, { title: string; body: string }> = {
  T1: {
    title: "Terminal 1",
    body: "Terminal 1 sits north of the T2/T3 complex and serves domestic, regional and non-EgyptAir international traffic.",
  },
  T2: {
    title: "Terminal 2",
    body: "Terminal 2 is the renovated international terminal connected to Terminal 3 by an airbridge.",
  },
  T3: {
    title: "Terminal 3",
    body: "Terminal 3 is the main EgyptAir hub and the largest passenger terminal at Cairo International Airport.",
  },
  ST: {
    title: "Seasonal / Hajj Terminal",
    body: "Seasonal terminal used for pilgrimage and overflow charter operations west of the main terminal area.",
  },
  CARGO: {
    title: "Cargo Village",
    body: "Freight and logistics area separated from passenger flows for cargo handling and airport support operations.",
  },
  PARK: {
    title: "Car Parking",
    body: "Car parks connect to the terminals and the airport transfer route.",
  },
  RWY: {
    title: "Runway System",
    body: "CAI operates three parallel 05/23 runways. This schematic shows their relationship, not survey scale.",
  },
  APM: {
    title: "Terminal Transfer",
    body: "Terminal transfer connects T1, car parks, Air Mall and T2/T3 for inter-terminal movement.",
  },
  ATM: {
    title: "Banks / ATM",
    body: "Banks, ATMs and currency exchange are listed among Cairo Airport terminal passenger services.",
  },
  FOOD: {
    title: "Restaurants & Cafeterias",
    body: "Food and drink concessions are available across passenger terminals.",
  },
  LOUNGE: {
    title: "Lounges",
    body: "Premium and first-class lounge options are available in the passenger terminals.",
  },
  GATES: {
    title: "Gate Areas",
    body: "Gate markers show the main boarding zones for T1, T2 and T3.",
  },
  SERVICES: {
    title: "Passenger Services",
    body: "Information, medical support, baggage services, car rental and reduced-mobility assistance are terminal services.",
  },
  OPS: {
    title: "Manager Operations Points",
    body: "Operational markers highlight runway, apron and cargo areas useful for manager review.",
  },
};

const LAYERS: Array<{ id: LayerId; label: string; icon: typeof MapPin }> = [
  { id: "atm", label: "ATM", icon: Landmark },
  { id: "food", label: "Food", icon: Utensils },
  { id: "lounges", label: "Lounges", icon: Armchair },
  { id: "gates", label: "Gates", icon: DoorOpen },
  { id: "services", label: "Services", icon: BadgeInfo },
  { id: "ops", label: "Ops", icon: ShieldCheck },
];

const MARKERS: Array<{ id: string; zone: ZoneId; layer: LayerId; x: number; y: number; label: string; icon: typeof MapPin }> = [
  { id: "atm-t1", zone: "ATM", layer: "atm", x: 654, y: 168, label: "ATM", icon: Landmark },
  { id: "atm-t2", zone: "ATM", layer: "atm", x: 564, y: 305, label: "ATM", icon: Landmark },
  { id: "atm-t3", zone: "ATM", layer: "atm", x: 390, y: 390, label: "ATM", icon: Landmark },
  { id: "food-t1", zone: "FOOD", layer: "food", x: 736, y: 198, label: "Food", icon: Utensils },
  { id: "food-t2", zone: "FOOD", layer: "food", x: 632, y: 336, label: "Food", icon: Utensils },
  { id: "food-t3", zone: "FOOD", layer: "food", x: 500, y: 432, label: "Food", icon: Utensils },
  { id: "lounge-t2", zone: "LOUNGE", layer: "lounges", x: 690, y: 296, label: "Lounge", icon: Armchair },
  { id: "lounge-t3", zone: "LOUNGE", layer: "lounges", x: 545, y: 366, label: "Lounge", icon: Armchair },
  { id: "gate-t1", zone: "GATES", layer: "gates", x: 782, y: 150, label: "Gates 1-12", icon: DoorOpen },
  { id: "gate-t2", zone: "GATES", layer: "gates", x: 724, y: 374, label: "T2 Gates", icon: DoorOpen },
  { id: "gate-t3", zone: "GATES", layer: "gates", x: 430, y: 518, label: "T3 Pier", icon: DoorOpen },
  { id: "info-t1", zone: "SERVICES", layer: "services", x: 612, y: 218, label: "Info", icon: BadgeInfo },
  { id: "medical-t2", zone: "SERVICES", layer: "services", x: 522, y: 346, label: "Medical", icon: Stethoscope },
  { id: "baggage-t3", zone: "SERVICES", layer: "services", x: 338, y: 434, label: "Services", icon: BadgeInfo },
  { id: "ops-rwy", zone: "OPS", layer: "ops", x: 834, y: 562, label: "Runway Ops", icon: ShieldCheck },
  { id: "ops-apron", zone: "OPS", layer: "ops", x: 620, y: 468, label: "Apron", icon: ShieldCheck },
  { id: "ops-cargo", zone: "OPS", layer: "ops", x: 430, y: 116, label: "Cargo Ops", icon: ShieldCheck },
];

export function AirportMap2D({ className = "" }: { className?: string }) {
  const [hoveredZone, setHoveredZone] = useState<ZoneId | null>(null);
  const [selectedZone, setSelectedZone] = useState<ZoneId>("T3");
  const [visibleLayers, setVisibleLayers] = useState<Record<LayerId, boolean>>({
    atm: false,
    food: false,
    lounges: false,
    gates: true,
    services: false,
    ops: false,
  });
  const activeZone = hoveredZone ?? selectedZone;
  const activeInfo = ZONE_INFO[activeZone];

  const selectZone = (zone: ZoneId) => setSelectedZone(zone);
  const handleKeySelect = (event: KeyboardEvent<SVGGElement>, zone: ZoneId) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectZone(zone);
    }
  };

  return (
    <section className={`panel relative overflow-hidden ${className}`} aria-labelledby="airport-map-title">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />

      <div className="absolute start-3 top-3 z-10 flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary glow-cyan" />
        <span id="airport-map-title">CAI - 2D MAP</span>
      </div>
      <div className="absolute end-3 top-3 z-10 font-mono text-[10px] text-muted-foreground">N up - schematic</div>

      <div className="absolute inset-x-3 top-10 z-20 flex flex-wrap gap-1.5" aria-label="Map layers">
        {LAYERS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setVisibleLayers((current) => ({ ...current, [id]: !current[id] }))}
            aria-pressed={visibleLayers[id]}
            className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[11px] font-medium transition-colors ${
              visibleLayers[id] ? "border-primary/60 bg-primary/15 text-primary" : "border-border bg-background/75 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Icon aria-hidden="true" className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 1100 720" className="block h-auto w-full" role="img" aria-label="2D schematic map of Cairo International Airport terminals, runways and services">
        <defs>
          <linearGradient id="mapGround2d" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="oklch(0.20 0.04 245)" />
            <stop offset="1" stopColor="oklch(0.15 0.035 250)" />
          </linearGradient>
          <filter id="mapGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect x="36" y="78" width="1028" height="584" rx="22" fill="url(#mapGround2d)" stroke="oklch(0.34 0.05 245)" />
        <path d="M116 612 C252 548, 330 534, 456 564 C618 603, 776 626, 1012 574" fill="none" stroke="oklch(0.28 0.04 245)" strokeWidth="28" opacity="0.55" />
        <path d="M150 252 C280 210, 398 205, 506 232 C618 260, 738 254, 954 188" fill="none" stroke="oklch(0.28 0.04 245)" strokeWidth="20" opacity="0.4" />
        <Compass />

        <Runway label="05L / 23R" x={148} y={514} width={824} active={activeZone === "RWY"} onSelect={() => selectZone("RWY")} onFocus={() => setHoveredZone("RWY")} onBlur={() => setHoveredZone(null)} onKeyDown={(event) => handleKeySelect(event, "RWY")} />
        <Runway label="05C / 23C" x={138} y={570} width={824} active={activeZone === "RWY"} onSelect={() => selectZone("RWY")} onFocus={() => setHoveredZone("RWY")} onBlur={() => setHoveredZone(null)} onKeyDown={(event) => handleKeySelect(event, "RWY")} />
        <Runway label="05R / 23L" x={126} y={626} width={824} active={activeZone === "RWY"} onSelect={() => selectZone("RWY")} onFocus={() => setHoveredZone("RWY")} onBlur={() => setHoveredZone(null)} onKeyDown={(event) => handleKeySelect(event, "RWY")} />

        <g stroke="oklch(0.43 0.045 245)" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.9">
          <path d="M614 416 C652 462, 696 488, 742 516" />
          <path d="M514 394 C554 452, 600 486, 640 536" />
          <path d="M726 240 C768 326, 816 410, 852 516" />
        </g>

        <Terminal zone="T1" x={596} y={128} width={238} height={116} label="T1" subtitle="Terminal 1" color="oklch(0.68 0.15 150)" active={activeZone === "T1"} onSelect={selectZone} onHover={setHoveredZone} onKeySelect={handleKeySelect} />
        <Terminal zone="T2" x={500} y={268} width={252} height={116} label="T2" subtitle="Terminal 2" color="oklch(0.74 0.13 215)" active={activeZone === "T2"} onSelect={selectZone} onHover={setHoveredZone} onKeySelect={handleKeySelect} />
        <Terminal zone="T3" x={286} y={360} width={294} height={122} label="T3" subtitle="Terminal 3" color="oklch(0.72 0.18 330)" active={activeZone === "T3"} onSelect={selectZone} onHover={setHoveredZone} onKeySelect={handleKeySelect} />
        <Terminal zone="T3" x={396} y={480} width={94} height={86} label="" subtitle="" color="oklch(0.72 0.18 330)" active={activeZone === "T3"} onSelect={selectZone} onHover={setHoveredZone} onKeySelect={handleKeySelect} />
        <Terminal zone="ST" x={160} y={382} width={118} height={88} label="ST" subtitle="Seasonal" color="oklch(0.78 0.14 80)" active={activeZone === "ST"} onSelect={selectZone} onHover={setHoveredZone} onKeySelect={handleKeySelect} />

        <Facility zone="CARGO" x={352} y={102} width={168} height={70} label="Cargo Village" active={activeZone === "CARGO"} onSelect={selectZone} onHover={setHoveredZone} onKeySelect={handleKeySelect} />
        <Facility zone="PARK" x={252} y={286} width={146} height={72} label="Car Park" icon={Car} active={activeZone === "PARK"} onSelect={selectZone} onHover={setHoveredZone} onKeySelect={handleKeySelect} />
        <Transfer active={activeZone === "APM"} onSelect={() => selectZone("APM")} onHover={setHoveredZone} onKeySelect={handleKeySelect} />

        {MARKERS.filter((marker) => visibleLayers[marker.layer]).map((marker) => (
          <Marker key={marker.id} {...marker} active={activeZone === marker.zone} onSelect={selectZone} onHover={setHoveredZone} onKeySelect={handleKeySelect} />
        ))}
      </svg>

      <aside className="absolute bottom-3 start-3 max-w-[330px] panel-inner bg-background/90 p-3" aria-live="polite">
        <div className="flex items-center gap-2">
          <Info aria-hidden="true" className="h-3.5 w-3.5 text-primary" />
          <h3 className="text-sm font-semibold">{activeInfo.title}</h3>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{activeInfo.body}</p>
      </aside>

      <div className="absolute bottom-3 end-3 flex max-w-[360px] flex-wrap items-center justify-end gap-3 panel-inner px-3 py-2 font-mono text-[10px]">
        <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-primary/70" />Transfer</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-[oklch(0.72_0.18_330)]" />Terminal</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-[oklch(0.38_0.03_245)]" />Runway</span>
      </div>
    </section>
  );
}

function interactiveProps(zone: ZoneId, onSelect: (zone: ZoneId) => void, onHover: (zone: ZoneId | null) => void, onKeySelect: (event: KeyboardEvent<SVGGElement>, zone: ZoneId) => void) {
  return {
    role: "button",
    tabIndex: 0,
    onClick: () => onSelect(zone),
    onMouseEnter: () => onHover(zone),
    onMouseLeave: () => onHover(null),
    onFocus: () => onHover(zone),
    onBlur: () => onHover(null),
    onKeyDown: (event: KeyboardEvent<SVGGElement>) => onKeySelect(event, zone),
    style: { cursor: "pointer" },
  };
}

function Compass() {
  return (
    <g transform="translate(78 116)" aria-hidden="true">
      <circle r="22" fill="oklch(0.16 0.04 250)" stroke="oklch(0.42 0.06 245)" />
      <path d="M0,-16 L6,8 L0,3 L-6,8 Z" fill="var(--cyan)" />
      <text y="34" textAnchor="middle" fontSize="9" fill="oklch(0.85 0.02 240)" fontFamily="ui-monospace">N</text>
    </g>
  );
}

function Runway({ x, y, width, label, active, onSelect, onFocus, onBlur, onKeyDown }: { x: number; y: number; width: number; label: string; active: boolean; onSelect: () => void; onFocus: () => void; onBlur: () => void; onKeyDown: (event: KeyboardEvent<SVGGElement>) => void }) {
  return (
    <g role="button" tabIndex={0} aria-label={`Runway ${label}`} transform={`rotate(-8 ${x + width / 2} ${y})`} onClick={onSelect} onMouseEnter={onFocus} onMouseLeave={onBlur} onFocus={onFocus} onBlur={onBlur} onKeyDown={onKeyDown} style={{ cursor: "pointer" }}>
      <rect x={x} y={y - 18} width={width} height={36} rx="5" fill="oklch(0.30 0.03 245)" stroke={active ? "var(--cyan)" : "oklch(0.44 0.04 245)"} strokeWidth={active ? 2 : 1} filter={active ? "url(#mapGlow)" : undefined} />
      <line x1={x + 28} y1={y} x2={x + width - 28} y2={y} stroke="oklch(0.92 0.02 240)" strokeWidth="2" strokeDasharray="18 14" opacity="0.72" />
      <text x={x + width - 74} y={y - 26} textAnchor="middle" fontSize="10" fontFamily="ui-monospace" fill="oklch(0.78 0.04 230)" letterSpacing="0.1em">{label}</text>
    </g>
  );
}

function Terminal({ zone, x, y, width, height, label, subtitle, color, active, onSelect, onHover, onKeySelect }: { zone: ZoneId; x: number; y: number; width: number; height: number; label: string; subtitle: string; color: string; active: boolean; onSelect: (zone: ZoneId) => void; onHover: (zone: ZoneId | null) => void; onKeySelect: (event: KeyboardEvent<SVGGElement>, zone: ZoneId) => void }) {
  return (
    <g aria-label={ZONE_INFO[zone].title} filter={active ? "url(#mapGlow)" : undefined} {...interactiveProps(zone, onSelect, onHover, onKeySelect)}>
      <rect x={x} y={y} width={width} height={height} rx="10" fill="oklch(0.22 0.04 245)" stroke={active ? "var(--cyan)" : color} strokeWidth={active ? 2.5 : 1.4} />
      <rect x={x + 8} y={y + 8} width={width - 16} height={height - 16} rx="7" fill={color} opacity="0.24" />
      {label && (
        <>
          <text x={x + 18} y={y + 34} fontSize="24" fontWeight="800" fill="oklch(0.98 0.01 230)" fontFamily="Inter, ui-sans-serif">{label}</text>
          <text x={x + 18} y={y + 56} fontSize="11" fill="oklch(0.84 0.02 230)" fontFamily="ui-monospace">{subtitle}</text>
        </>
      )}
    </g>
  );
}

function Facility({ zone, x, y, width, height, label, icon: Icon = Bus, active, onSelect, onHover, onKeySelect }: { zone: ZoneId; x: number; y: number; width: number; height: number; label: string; icon?: typeof Bus; active: boolean; onSelect: (zone: ZoneId) => void; onHover: (zone: ZoneId | null) => void; onKeySelect: (event: KeyboardEvent<SVGGElement>, zone: ZoneId) => void }) {
  return (
    <g aria-label={ZONE_INFO[zone].title} filter={active ? "url(#mapGlow)" : undefined} {...interactiveProps(zone, onSelect, onHover, onKeySelect)}>
      <rect x={x} y={y} width={width} height={height} rx="9" fill="oklch(0.18 0.035 245)" stroke={active ? "var(--cyan)" : "oklch(0.48 0.08 85)"} strokeWidth={active ? 2 : 1.2} strokeDasharray="7 5" />
      <Icon x={x + 14} y={y + 18} width={18} height={18} color="var(--cyan)" strokeWidth={2} />
      <text x={x + 40} y={y + 32} fontSize="12" fontWeight="700" fill="oklch(0.94 0.01 230)" fontFamily="Inter, ui-sans-serif">{label}</text>
    </g>
  );
}

function Transfer({ active, onSelect, onHover, onKeySelect }: { active: boolean; onSelect: () => void; onHover: (zone: ZoneId | null) => void; onKeySelect: (event: KeyboardEvent<SVGGElement>, zone: ZoneId) => void }) {
  return (
    <g aria-label={ZONE_INFO.APM.title} role="button" tabIndex={0} onClick={onSelect} onMouseEnter={() => onHover("APM")} onMouseLeave={() => onHover(null)} onFocus={() => onHover("APM")} onBlur={() => onHover(null)} onKeyDown={(event) => onKeySelect(event, "APM")} style={{ cursor: "pointer" }}>
      <path d="M716 244 C674 268, 640 278, 626 326 C596 374, 520 392, 432 396 C356 398, 324 364, 316 322" fill="none" stroke="var(--cyan)" strokeWidth="4" strokeOpacity={active ? 0.98 : 0.62} strokeDasharray="9 8" className="flow-line" />
      <TransferStop cx={716} cy={244} label="T1" />
      <TransferStop cx={626} cy={326} label="T2" />
      <TransferStop cx={432} cy={396} label="T3" />
      <TransferStop cx={316} cy={322} label="P" />
    </g>
  );
}

function TransferStop({ cx, cy, label }: { cx: number; cy: number; label: string }) {
  return (
    <g pointerEvents="none">
      <circle cx={cx} cy={cy} r="8" fill="oklch(0.16 0.04 250)" stroke="var(--cyan)" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="3" fill="var(--cyan)" />
      <text x={cx + 12} y={cy + 4} fontSize="10" fontFamily="ui-monospace" fill="oklch(0.95 0.01 230)">{label}</text>
    </g>
  );
}

function Marker({ zone, x, y, label, icon: Icon, active, onSelect, onHover, onKeySelect }: { zone: ZoneId; x: number; y: number; label: string; icon: typeof MapPin; active: boolean; onSelect: (zone: ZoneId) => void; onHover: (zone: ZoneId | null) => void; onKeySelect: (event: KeyboardEvent<SVGGElement>, zone: ZoneId) => void }) {
  return (
    <g aria-label={`${label}: ${ZONE_INFO[zone].title}`} filter={active ? "url(#mapGlow)" : undefined} {...interactiveProps(zone, onSelect, onHover, onKeySelect)}>
      <rect x={x - 13} y={y - 13} width={26} height={26} rx="8" fill={active ? "var(--cyan)" : "oklch(0.14 0.04 250)"} stroke="oklch(0.88 0.02 230)" strokeOpacity="0.7" />
      <Icon x={x - 7} y={y - 7} width={14} height={14} color={active ? "oklch(0.12 0.04 250)" : "var(--cyan)"} strokeWidth={2.2} />
      <text x={x + 17} y={y + 4} fontSize="10" fontFamily="ui-monospace" fill="oklch(0.92 0.01 230)">{label}</text>
    </g>
  );
}
