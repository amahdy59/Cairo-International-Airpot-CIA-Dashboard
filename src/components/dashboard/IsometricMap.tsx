import { useState } from "react";
import {
  Armchair,
  BadgeInfo,
  Bus,
  Car,
  DoorOpen,
  Info,
  Landmark,
  MapPin,
  ShieldCheck,
  Stethoscope,
  Utensils,
} from "lucide-react";

/**
 * 2D schematic of Cairo International Airport (CAI / HECA).
 * Indicative, not to scale. It keeps authentic CAI elements visible:
 * T1 north of T2/T3, T2 connected to T3, Seasonal/Hajj terminal west of T3,
 * three parallel 05/23 runways, car parks, APM/terminal transfer, and passenger facilities.
 */

type ZoneId =
  | "T1"
  | "T2"
  | "T3"
  | "ST"
  | "CARGO"
  | "PARK"
  | "RWY"
  | "APM"
  | "ATM"
  | "FOOD"
  | "LOUNGE"
  | "GATES"
  | "SERVICES"
  | "OPS";

type LayerId = "atm" | "food" | "lounges" | "gates" | "services" | "ops";

const ZONE_INFO: Record<ZoneId, { title: string; body: string }> = {
  T1: {
    title: "Terminal 1",
    body: "Older terminal complex north of T2/T3. It has departure and arrival halls, 12 gates, restaurants, shops, medical services, ATMs and transport access.",
  },
  T2: {
    title: "Terminal 2",
    body: "Renovated international terminal connected to T3 by airbridge. It includes check-in, duty free, eateries, lounges, gates and passenger services.",
  },
  T3: {
    title: "Terminal 3",
    body: "Largest passenger terminal and EgyptAir hub. It includes international/domestic processing, pier gates, lounges, shops and connected parking.",
  },
  ST: {
    title: "Seasonal / Hajj Terminal",
    body: "Seasonal terminal used for pilgrimage and overflow charter operations, west of the main T2/T3 terminal area.",
  },
  CARGO: {
    title: "Cargo Village",
    body: "Freight and support area serving cargo, logistics and airport operations away from passenger flows.",
  },
  PARK: {
    title: "Car Parking",
    body: "Airport parking areas connect to the terminals and the airport people mover/transfer route.",
  },
  RWY: {
    title: "Runway System",
    body: "CAI uses three parallel 05/23 runways. The diagram shows orientation and separation schematically, not at survey scale.",
  },
  APM: {
    title: "Terminal Transfer / APM",
    body: "Airport transfer route links T1, car parks, Air Mall and T2/T3. Use it for inter-terminal movement.",
  },
  ATM: {
    title: "Banks / ATM",
    body: "Banks, ATMs and currency exchange services are listed by Cairo Airport in terminal passenger services.",
  },
  FOOD: {
    title: "Restaurants & Cafeterias",
    body: "Food and drink areas are available in the passenger terminals, including public and airside zones.",
  },
  LOUNGE: {
    title: "Lounges",
    body: "Passenger lounges are available in the terminals, including premium lounges in T2/T3 and first class lounge options.",
  },
  GATES: {
    title: "Gate Areas",
    body: "Gate markers show the main passenger boarding zones: T1 gates, T2 pier gates and T3 pier gates.",
  },
  SERVICES: {
    title: "Passenger Services",
    body: "Information desks, medical/pharmacy support, baggage wrapping, car rental and reduced-mobility assistance are terminal services.",
  },
  OPS: {
    title: "Manager / Operations Points",
    body: "Operational markers highlight runway, apron, security and maintenance areas useful for command-center review.",
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

const MARKERS: Array<{
  id: string;
  zone: ZoneId;
  layer: LayerId;
  x: number;
  y: number;
  label: string;
  icon: typeof MapPin;
}> = [
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

export function IsometricMap({ className = "", interactive = true }: { className?: string; interactive?: boolean }) {
  const [hover, setHover] = useState<ZoneId | null>(null);
  const [pinned, setPinned] = useState<ZoneId | null>("T3");
  const [visibleLayers, setVisibleLayers] = useState<Record<LayerId, boolean>>({
    atm: false,
    food: false,
    lounges: false,
    gates: true,
    services: false,
    ops: false,
  });
  const active = hover ?? pinned;

  const handleClick = (id: ZoneId) => interactive && setPinned(id);
  const handleEnter = (id: ZoneId) => interactive && setHover(id);
  const handleLeave = () => interactive && setHover(null);
  const toggleLayer = (id: LayerId) => setVisibleLayers((current) => ({ ...current, [id]: !current[id] }));

  return (
    <div className={`relative panel overflow-hidden ${className}`}>
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      <div className="absolute top-3 start-3 z-10 flex items-center gap-2 text-[10px] font-mono tracking-[0.18em] text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary glow-cyan" />
        CAI - 2D MAP
      </div>
      <div className="absolute top-3 end-3 z-10 text-[10px] font-mono text-muted-foreground">
        N up - indicative layout
      </div>

      <div className="absolute top-10 start-3 end-3 z-20 flex flex-wrap gap-1.5">
        {LAYERS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => toggleLayer(id)}
            aria-pressed={visibleLayers[id]}
            className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[11px] font-medium transition-colors ${
              visibleLayers[id]
                ? "border-primary/60 bg-primary/15 text-primary"
                : "border-border bg-background/75 text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 1100 720" className="w-full h-auto block" role="img" aria-label="2D map of Cairo International Airport">
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

        <g transform="translate(78 116)">
          <circle r="22" fill="oklch(0.16 0.04 250)" stroke="oklch(0.42 0.06 245)" />
          <path d="M0,-16 L6,8 L0,3 L-6,8 Z" fill="var(--cyan)" />
          <text y="34" textAnchor="middle" fontSize="9" fill="oklch(0.85 0.02 240)" fontFamily="ui-monospace">N</text>
        </g>

        <Runway2D label="05L / 23R" x={148} y={514} w={824} active={active === "RWY"} onEnter={() => handleEnter("RWY")} onLeave={handleLeave} onClick={() => handleClick("RWY")} />
        <Runway2D label="05C / 23C" x={138} y={570} w={824} active={active === "RWY"} onEnter={() => handleEnter("RWY")} onLeave={handleLeave} onClick={() => handleClick("RWY")} />
        <Runway2D label="05R / 23L" x={126} y={626} w={824} active={active === "RWY"} onEnter={() => handleEnter("RWY")} onLeave={handleLeave} onClick={() => handleClick("RWY")} />

        <g stroke="oklch(0.43 0.045 245)" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.9">
          <path d="M614 416 C652 462, 696 488, 742 516" />
          <path d="M514 394 C554 452, 600 486, 640 536" />
          <path d="M726 240 C768 326, 816 410, 852 516" />
        </g>

        <TerminalBlock
          id="T1"
          x={596}
          y={128}
          w={238}
          h={116}
          label="T1"
          sub="Terminal 1"
          color="oklch(0.68 0.15 150)"
          active={active === "T1"}
          onEnter={() => handleEnter("T1")}
          onLeave={handleLeave}
          onClick={() => handleClick("T1")}
        />
        <TerminalBlock
          id="T2"
          x={500}
          y={268}
          w={252}
          h={116}
          label="T2"
          sub="Terminal 2"
          color="oklch(0.74 0.13 215)"
          active={active === "T2"}
          onEnter={() => handleEnter("T2")}
          onLeave={handleLeave}
          onClick={() => handleClick("T2")}
        />
        <TerminalBlock
          id="T3"
          x={286}
          y={360}
          w={294}
          h={122}
          label="T3"
          sub="Terminal 3 - EgyptAir Hub"
          color="oklch(0.72 0.18 330)"
          active={active === "T3"}
          onEnter={() => handleEnter("T3")}
          onLeave={handleLeave}
          onClick={() => handleClick("T3")}
        />
        <TerminalBlock
          id="T3-pier"
          x={396}
          y={480}
          w={94}
          h={86}
          label=""
          sub=""
          color="oklch(0.72 0.18 330)"
          active={active === "T3"}
          onEnter={() => handleEnter("T3")}
          onLeave={handleLeave}
          onClick={() => handleClick("T3")}
        />
        <TerminalBlock
          id="ST"
          x={160}
          y={382}
          w={118}
          h={88}
          label="ST"
          sub="Seasonal"
          color="oklch(0.78 0.14 80)"
          active={active === "ST"}
          onEnter={() => handleEnter("ST")}
          onLeave={handleLeave}
          onClick={() => handleClick("ST")}
        />

        <FacilityArea
          id="CARGO"
          x={352}
          y={102}
          w={168}
          h={70}
          label="Cargo Village"
          active={active === "CARGO"}
          onEnter={() => handleEnter("CARGO")}
          onLeave={handleLeave}
          onClick={() => handleClick("CARGO")}
        />
        <FacilityArea
          id="PARK"
          x={252}
          y={286}
          w={146}
          h={72}
          label="Car Park"
          icon={Car}
          active={active === "PARK"}
          onEnter={() => handleEnter("PARK")}
          onLeave={handleLeave}
          onClick={() => handleClick("PARK")}
        />

        <g
          onMouseEnter={() => handleEnter("APM")}
          onMouseLeave={handleLeave}
          onClick={() => handleClick("APM")}
          style={{ cursor: interactive ? "pointer" : "default" }}
        >
          <path
            d="M716 244 C674 268, 640 278, 626 326 C596 374, 520 392, 432 396 C356 398, 324 364, 316 322"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="4"
            strokeOpacity={active === "APM" ? 0.98 : 0.62}
            strokeDasharray="9 8"
            className="flow-line"
          />
          <TransferStop cx={716} cy={244} label="T1" />
          <TransferStop cx={626} cy={326} label="T2" />
          <TransferStop cx={432} cy={396} label="T3" />
          <TransferStop cx={316} cy={322} label="P" />
        </g>

        {MARKERS.filter((marker) => visibleLayers[marker.layer]).map((marker) => (
          <MapMarker
            key={marker.id}
            {...marker}
            active={active === marker.zone}
            onEnter={() => handleEnter(marker.zone)}
            onLeave={handleLeave}
            onClick={() => handleClick(marker.zone)}
          />
        ))}
      </svg>

      {active && (
        <div className="absolute bottom-3 start-3 max-w-[330px] panel-inner p-3 bg-background/90">
          <div className="flex items-center gap-2">
            <Info className="h-3.5 w-3.5 text-primary" />
            <h4 className="text-sm font-semibold">{ZONE_INFO[active].title}</h4>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{ZONE_INFO[active].body}</p>
        </div>
      )}

      <div className="absolute bottom-3 end-3 panel-inner px-3 py-2 flex flex-wrap items-center justify-end gap-3 text-[10px] font-mono max-w-[360px]">
        <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-primary/70" />Transfer</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-[oklch(0.72_0.18_330)]" />Terminal</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-[oklch(0.38_0.03_245)]" />Runway</span>
      </div>
    </div>
  );
}

function Runway2D({
  x,
  y,
  w,
  label,
  active,
  onEnter,
  onLeave,
  onClick,
}: {
  x: number;
  y: number;
  w: number;
  label: string;
  active?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onClick?: () => void;
}) {
  return (
    <g transform={`rotate(-8 ${x + w / 2} ${y})`} onMouseEnter={onEnter} onMouseLeave={onLeave} onClick={onClick} style={{ cursor: "pointer" }}>
      <rect x={x} y={y - 18} width={w} height={36} rx="5" fill="oklch(0.30 0.03 245)" stroke={active ? "var(--cyan)" : "oklch(0.44 0.04 245)"} strokeWidth={active ? 2 : 1} filter={active ? "url(#mapGlow)" : undefined} />
      <line x1={x + 28} y1={y} x2={x + w - 28} y2={y} stroke="oklch(0.92 0.02 240)" strokeWidth="2" strokeDasharray="18 14" opacity="0.72" />
      <text x={x + w - 74} y={y - 26} textAnchor="middle" fontSize="10" fontFamily="ui-monospace" fill="oklch(0.78 0.04 230)" letterSpacing="0.1em">
        {label}
      </text>
    </g>
  );
}

function TerminalBlock({
  x,
  y,
  w,
  h,
  label,
  sub,
  color,
  active,
  onEnter,
  onLeave,
  onClick,
}: {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub: string;
  color: string;
  active?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onClick?: () => void;
}) {
  return (
    <g onMouseEnter={onEnter} onMouseLeave={onLeave} onClick={onClick} style={{ cursor: "pointer" }} filter={active ? "url(#mapGlow)" : undefined}>
      <rect x={x} y={y} width={w} height={h} rx="10" fill="oklch(0.22 0.04 245)" stroke={active ? "var(--cyan)" : color} strokeWidth={active ? 2.5 : 1.4} />
      <rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} rx="7" fill={color} opacity="0.24" />
      {label && (
        <>
          <text x={x + 18} y={y + 34} fontSize="24" fontWeight="800" fill="oklch(0.98 0.01 230)" fontFamily="Inter, ui-sans-serif">
            {label}
          </text>
          <text x={x + 18} y={y + 56} fontSize="11" fill="oklch(0.84 0.02 230)" fontFamily="ui-monospace">
            {sub}
          </text>
        </>
      )}
    </g>
  );
}

function FacilityArea({
  x,
  y,
  w,
  h,
  label,
  icon: Icon = Bus,
  active,
  onEnter,
  onLeave,
  onClick,
}: {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  icon?: typeof Bus;
  active?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onClick?: () => void;
}) {
  return (
    <g onMouseEnter={onEnter} onMouseLeave={onLeave} onClick={onClick} style={{ cursor: "pointer" }} filter={active ? "url(#mapGlow)" : undefined}>
      <rect x={x} y={y} width={w} height={h} rx="9" fill="oklch(0.18 0.035 245)" stroke={active ? "var(--cyan)" : "oklch(0.48 0.08 85)"} strokeWidth={active ? 2 : 1.2} strokeDasharray="7 5" />
      <Icon x={x + 14} y={y + 18} width={18} height={18} color="var(--cyan)" strokeWidth={2} />
      <text x={x + 40} y={y + 32} fontSize="12" fontWeight="700" fill="oklch(0.94 0.01 230)" fontFamily="Inter, ui-sans-serif">
        {label}
      </text>
    </g>
  );
}

function TransferStop({ cx, cy, label }: { cx: number; cy: number; label: string }) {
  return (
    <g pointerEvents="none">
      <circle cx={cx} cy={cy} r="8" fill="oklch(0.16 0.04 250)" stroke="var(--cyan)" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="3" fill="var(--cyan)" />
      <text x={cx + 12} y={cy + 4} fontSize="10" fontFamily="ui-monospace" fill="oklch(0.95 0.01 230)">
        {label}
      </text>
    </g>
  );
}

function MapMarker({
  x,
  y,
  label,
  icon: Icon,
  active,
  onEnter,
  onLeave,
  onClick,
}: {
  x: number;
  y: number;
  label: string;
  icon: typeof MapPin;
  active?: boolean;
  onEnter?: () => void;
  onLeave?: () => void;
  onClick?: () => void;
}) {
  return (
    <g onMouseEnter={onEnter} onMouseLeave={onLeave} onClick={onClick} style={{ cursor: "pointer" }} filter={active ? "url(#mapGlow)" : undefined}>
      <rect x={x - 13} y={y - 13} width={26} height={26} rx="8" fill={active ? "var(--cyan)" : "oklch(0.14 0.04 250)"} stroke="oklch(0.88 0.02 230)" strokeOpacity="0.7" />
      <Icon x={x - 7} y={y - 7} width={14} height={14} color={active ? "oklch(0.12 0.04 250)" : "var(--cyan)"} strokeWidth={2.2} />
      <text x={x + 17} y={y + 4} fontSize="10" fontFamily="ui-monospace" fill="oklch(0.92 0.01 230)">
        {label}
      </text>
    </g>
  );
}
