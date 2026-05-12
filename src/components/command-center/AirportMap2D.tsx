import { useMemo, useState, type KeyboardEvent } from "react";
import { BadgeInfo, Building2, CircleDollarSign, DoorOpen, Plane, ShieldCheck, ShoppingBag, Utensils } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type SceneId = "overview" | "terminal1" | "terminal2" | "terminal3" | "airside";

type Hotspot = {
  id: string;
  number: number;
  title: string;
  summary: string;
  x: number;
  y: number;
};

type Scene = {
  id: SceneId;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  facts: string[];
  hotspots: Hotspot[];
};

const SCENES: Scene[] = [
  {
    id: "overview",
    title: "Airport overview",
    subtitle: "Full CAI passenger and airside schematic",
    icon: Plane,
    facts: ["Three parallel 05/23 runways", "T1 sits north of the T2/T3 complex", "Seasonal / Hajj terminal is west of T3", "APM links T1, car parks, Air Mall and T2/T3"],
    hotspots: [
      { id: "overview-terminal", number: 1, title: "Passenger terminal core", summary: "T1, T2 and T3 are shown as the main passenger buildings with the T2/T3 complex connected.", x: 610, y: 395 },
      { id: "overview-checkin", number: 2, title: "Check-in halls", summary: "Departure halls contain check-in, baggage wrapping, shops and access to immigration/security.", x: 270, y: 520 },
      { id: "overview-passport", number: 3, title: "Passport control", summary: "International passenger flow includes immigration/passport control before airside gates.", x: 850, y: 500 },
      { id: "overview-baggage", number: 4, title: "Baggage claim", summary: "Arrivals flow includes baggage reclaim and customs before landside services.", x: 900, y: 265 },
      { id: "overview-customs", number: 5, title: "Customs control", summary: "Customs is represented after baggage claim in the arrivals path.", x: 730, y: 150 },
      { id: "overview-runway", number: 6, title: "Runway and apron", summary: "The airfield area shows three parallel runways, taxiways, apron stands and ground support vehicles.", x: 180, y: 235 },
    ],
  },
  {
    id: "terminal1",
    title: "Terminal 1",
    subtitle: "Halls, check-in, gates and landside services",
    icon: Building2,
    facts: ["Older terminal complex north of T2/T3", "Terminal guide sources identify 12 gates", "Includes arrivals, departures and private aviation Hall 4", "Banks/ATM, restaurants, duty free, medical and transport access are represented"],
    hotspots: [
      { id: "t1-halls", number: 1, title: "Halls 1-3", summary: "T1 is organized around passenger halls for departures, arrivals and regional/domestic traffic.", x: 255, y: 250 },
      { id: "t1-checkin", number: 2, title: "Check-in counters", summary: "Departure processing with check-in counters, baggage wrapping and information support.", x: 395, y: 435 },
      { id: "t1-gates", number: 3, title: "Gates 1-12", summary: "T1 gate zone is shown as a compact boarding pier with numbered gate positions.", x: 690, y: 280 },
      { id: "t1-services", number: 4, title: "Passenger services", summary: "Restaurants, shops, banking/ATM, medical services, mosque and ground transport are grouped near the hall spine.", x: 565, y: 470 },
      { id: "t1-transfer", number: 5, title: "Terminal transfer", summary: "The airport people mover/transfer route connects T1 with car parks, Air Mall and T2/T3.", x: 835, y: 430 },
    ],
  },
  {
    id: "terminal2",
    title: "Terminal 2",
    subtitle: "Renovated international terminal connected to T3",
    icon: DoorOpen,
    facts: ["International terminal connected directly with T3", "Used by many international carriers", "Includes check-in, immigration/security, lounges, shops and gates", "Good candidate terminal for alliance and partner airline passenger flow"],
    hotspots: [
      { id: "t2-checkin", number: 1, title: "Departure hall", summary: "Large check-in area and landside services before security and passport control.", x: 300, y: 430 },
      { id: "t2-security", number: 2, title: "Security and passport control", summary: "International processing area before passengers enter the airside concourse.", x: 500, y: 300 },
      { id: "t2-lounges", number: 3, title: "Lounges and retail", summary: "Lounges, duty free, shops, restaurants and cafeterias are represented along the concourse.", x: 650, y: 430 },
      { id: "t2-gates", number: 4, title: "Pier gates", summary: "Gate bank shown along the airside edge, connected to stands and taxiways.", x: 820, y: 250 },
      { id: "t2-bridge", number: 5, title: "T2-T3 connector", summary: "A direct connector links Terminal 2 with Terminal 3 for passenger transfer.", x: 865, y: 470 },
    ],
  },
  {
    id: "terminal3",
    title: "Terminal 3",
    subtitle: "EgyptAir hub and largest passenger terminal",
    icon: ShoppingBag,
    facts: ["Opened as the main EgyptAir hub", "Largest passenger terminal at CAI", "Includes domestic/international processing, lounges and gate piers", "Connected to T2 and parking/transfer facilities"],
    hotspots: [
      { id: "t3-main", number: 1, title: "Main terminal building", summary: "Large terminal block for EgyptAir hub operations and mixed domestic/international passenger processing.", x: 440, y: 345 },
      { id: "t3-pier", number: 2, title: "Boarding pier", summary: "Extended pier supports the main boarding gate cluster and aircraft stand access.", x: 730, y: 260 },
      { id: "t3-arrivals", number: 3, title: "Arrivals and baggage", summary: "Arrivals path includes passport control, baggage claim and customs before landside exit.", x: 260, y: 460 },
      { id: "t3-lounges", number: 4, title: "Lounges and duty free", summary: "Premium lounges, duty free, shops and food services are represented near the secure concourse.", x: 565, y: 480 },
      { id: "t3-parking", number: 5, title: "Parking and APM access", summary: "Parking and the people mover/transfer route connect T3 with the broader airport complex.", x: 830, y: 450 },
    ],
  },
  {
    id: "airside",
    title: "Airside and Seasonal Terminal",
    subtitle: "Runways, apron, cargo and Hajj/seasonal operations",
    icon: ShieldCheck,
    facts: ["Three 05/23 runways are shown schematically", "Seasonal / Hajj terminal supports pilgrimage traffic", "Cargo Village is separated from passenger terminals", "Ground support, apron safety and runway operations are manager-critical areas"],
    hotspots: [
      { id: "air-runways", number: 1, title: "Parallel runways", summary: "Three runway strips represent CAI's parallel runway system and taxiway access.", x: 275, y: 260 },
      { id: "air-apron", number: 2, title: "Apron stands", summary: "Apron aircraft stands show turnaround positions, service vehicles and marshal areas.", x: 600, y: 360 },
      { id: "air-seasonal", number: 3, title: "Seasonal / Hajj terminal", summary: "Seasonal terminal is represented west of T3 for pilgrimage and overflow operations.", x: 740, y: 500 },
      { id: "air-cargo", number: 4, title: "Cargo Village", summary: "Cargo operations are shown away from passenger flows for freight and logistics handling.", x: 820, y: 185 },
      { id: "air-safety", number: 5, title: "Safety and maintenance", summary: "Manager view highlights fire response, runway inspections, PPE and maintenance attention points.", x: 460, y: 510 },
    ],
  },
];

export function AirportMap2D({ className = "" }: { className?: string }) {
  const [activeSceneId, setActiveSceneId] = useState<SceneId>("overview");
  const activeScene = SCENES.find((scene) => scene.id === activeSceneId) ?? SCENES[0];
  const [activeHotspotId, setActiveHotspotId] = useState(activeScene.hotspots[0].id);
  const activeHotspot = useMemo(
    () => activeScene.hotspots.find((hotspot) => hotspot.id === activeHotspotId) ?? activeScene.hotspots[0],
    [activeHotspotId, activeScene],
  );

  const selectScene = (scene: Scene) => {
    setActiveSceneId(scene.id);
    setActiveHotspotId(scene.hotspots[0].id);
  };

  return (
    <section className={`panel overflow-hidden ${className}`} aria-labelledby="airport-visual-title">
      <div className="border-b border-border p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">Interactive vector image set</p>
        <div className="mt-1 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="airport-visual-title" className="text-2xl font-semibold tracking-tight">
              Cairo Airport visual guide
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              Five clickable SVG views inspired by airport infographic design: overview, Terminal 1, Terminal 2, Terminal 3, and airside/seasonal operations.
            </p>
          </div>
          <a
            href="https://www.cairo-airport.com/en-us/Airport/Airport-Services-Facilities"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs hover:bg-secondary"
          >
            <BadgeInfo aria-hidden="true" className="h-4 w-4 text-primary" />
            Source: Cairo Airport services
          </a>
        </div>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[220px_1fr_300px]">
        <nav className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1" aria-label="Airport SVG views">
          {SCENES.map((scene, index) => {
            const Icon = scene.icon;
            const active = scene.id === activeScene.id;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => selectScene(scene)}
                className={`group rounded-md border p-3 text-start transition-colors ${
                  active ? "border-primary bg-primary/15 text-primary" : "border-border bg-background/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
                aria-pressed={active}
              >
                <span className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-md border border-current/30">
                    <Icon aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-mono text-[10px] uppercase tracking-wider">Image {index + 1}</span>
                    <span className="block truncate text-sm font-semibold">{scene.title}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="overflow-hidden rounded-lg border border-border bg-[#d8f1fa]">
          <AirportScene scene={activeScene} activeHotspotId={activeHotspot.id} onHotspotSelect={setActiveHotspotId} />
        </div>

        <aside className="space-y-3">
          <div className="panel-inner p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Selected item</p>
            <h3 className="mt-2 text-lg font-semibold">{activeHotspot.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{activeHotspot.summary}</p>
          </div>

          <div className="panel-inner p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Scene notes</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {activeScene.facts.map((fact) => (
                <li key={fact} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel-inner p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Clickable items</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {activeScene.hotspots.map((hotspot) => (
                <button
                  key={hotspot.id}
                  type="button"
                  onClick={() => setActiveHotspotId(hotspot.id)}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    hotspot.id === activeHotspot.id ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {hotspot.number}. {hotspot.title}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function AirportScene({ scene, activeHotspotId, onHotspotSelect }: { scene: Scene; activeHotspotId: string; onHotspotSelect: (id: string) => void }) {
  return (
    <svg viewBox="0 0 1080 640" className="block h-auto w-full" role="img" aria-label={`${scene.title}: ${scene.subtitle}`}>
      <defs>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#4a6670" floodOpacity="0.18" />
        </filter>
        <linearGradient id="glass" x1="0" x2="1">
          <stop offset="0" stopColor="#9ec0c7" />
          <stop offset="1" stopColor="#d7ecef" />
        </linearGradient>
      </defs>

      <rect width="1080" height="640" fill="#d8f1fa" />
      <text x="540" y="58" textAnchor="middle" fontSize="36" fontWeight="800" fill="#102027" fontFamily="Inter, Arial">
        {scene.title.toUpperCase()}
      </text>
      <text x="540" y="86" textAnchor="middle" fontSize="14" fontWeight="600" fill="#40565d" fontFamily="Inter, Arial">
        {scene.subtitle}
      </text>

      {scene.id === "overview" && <OverviewArt />}
      {scene.id === "terminal1" && <TerminalDetailArt tone="#4aa76c" label="TERMINAL 1" />}
      {scene.id === "terminal2" && <TerminalDetailArt tone="#2e99c7" label="TERMINAL 2" connector />}
      {scene.id === "terminal3" && <TerminalDetailArt tone="#a24bb8" label="TERMINAL 3" pier />}
      {scene.id === "airside" && <AirsideArt />}

      {scene.hotspots.map((hotspot) => (
        <HotspotButton key={hotspot.id} hotspot={hotspot} active={hotspot.id === activeHotspotId} onSelect={onHotspotSelect} />
      ))}
    </svg>
  );
}

function HotspotButton({ hotspot, active, onSelect }: { hotspot: Hotspot; active: boolean; onSelect: (id: string) => void }) {
  const handleKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(hotspot.id);
    }
  };

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${hotspot.number}. ${hotspot.title}`}
      onClick={() => onSelect(hotspot.id)}
      onKeyDown={handleKeyDown}
      style={{ cursor: "pointer" }}
    >
      <line x1={hotspot.x} y1={hotspot.y + 15} x2={hotspot.x} y2={hotspot.y + 86} stroke="#78909c" strokeWidth="2" opacity="0.7" />
      <circle cx={hotspot.x} cy={hotspot.y} r={active ? 19 : 16} fill={active ? "#ffb300" : "#ffd200"} stroke="#111827" strokeWidth={active ? 3 : 0} />
      <text x={hotspot.x} y={hotspot.y + 6} textAnchor="middle" fontSize="20" fontWeight="800" fill="#111827" fontFamily="Inter, Arial">
        {hotspot.number}
      </text>
    </g>
  );
}

function OverviewArt() {
  return (
    <g filter="url(#softShadow)">
      <RunwayPlate x={70} y={170} />
      <TerminalBlock x={460} y={330} width={360} depth={145} height={82} label="AIRPORT" tone="#d84a1b" />
      <Road x={520} y={500} />
      <ServicePanel x={110} y={430} label="CHECK-IN" icon="counters" />
      <ServicePanel x={770} y={185} label="BAGGAGE" icon="belt" />
      <ServicePanel x={760} y={430} label="PASSPORT" icon="booths" />
      <ServicePanel x={530} y={115} label="CUSTOMS" icon="scanner" />
      <ControlTower x={690} y={270} />
      <PlaneShape x={360} y={260} scale={1.15} />
      <PlaneShape x={455} y={365} scale={0.95} />
      <BusShape x={710} y={505} />
    </g>
  );
}

function TerminalDetailArt({ tone, label, connector = false, pier = false }: { tone: string; label: string; connector?: boolean; pier?: boolean }) {
  return (
    <g filter="url(#softShadow)">
      <rect x="120" y="140" width="820" height="390" rx="18" fill="#ffffff" />
      <path d="M150 190 H900 V245 H150 Z" fill="#f4f7f8" stroke="#d5dee2" />
      <TerminalBlock x={265} y={210} width={420} depth={150} height={75} label={label} tone={tone} />
      {connector && <path d="M685 285 L895 240 L920 265 L710 312 Z" fill="#cfd8dc" stroke="#9eabb1" strokeWidth="3" />}
      {pier && <TerminalBlock x={610} y={285} width={210} depth={105} height={58} label="PIER" tone={tone} />}
      <CheckInCounters x={165} y={380} />
      <GateRow x={700} y={200} />
      <RetailStrip x={460} y={430} tone={tone} />
      <PeopleGroup x={300} y={472} />
      <PeopleGroup x={735} y={390} />
      <BaggageBelt x={190} y={230} />
      <SecurityBooths x={560} y={195} />
    </g>
  );
}

function AirsideArt() {
  return (
    <g filter="url(#softShadow)">
      <RunwayPlate x={120} y={150} wide />
      <PlaneShape x={500} y={290} scale={1.15} />
      <PlaneShape x={650} y={390} scale={0.95} />
      <TerminalBlock x={670} y={450} width={220} depth={90} height={55} label="SEASONAL" tone="#d69b17" />
      <TerminalBlock x={720} y={165} width={190} depth={80} height={50} label="CARGO" tone="#607d8b" />
      <ServiceTrucks x={480} y={455} />
      <Helipad x={350} y={470} />
    </g>
  );
}

function RunwayPlate({ x, y, wide = false }: { x: number; y: number; wide?: boolean }) {
  const width = wide ? 760 : 520;
  return (
    <g>
      <polygon points={`${x},${y + 170} ${x + width},${y - 80} ${x + width + 250},${y + 45} ${x + 240},${y + 300}`} fill="#edf5f7" />
      {[0, 54, 108].map((offset) => (
        <g key={offset} transform={`translate(${x + 40 + offset * 1.2} ${y + offset}) rotate(-23)`}>
          <rect width={width - 90} height="34" rx="5" fill="#82939b" />
          <line x1="30" y1="17" x2={width - 130} y2="17" stroke="#fff" strokeWidth="3" strokeDasharray="24 18" />
        </g>
      ))}
      <path d={`M${x + 310} ${y + 95} C${x + 470} ${y + 145}, ${x + 580} ${y + 170}, ${x + 710} ${y + 225}`} fill="none" stroke="#f5b041" strokeWidth="4" />
    </g>
  );
}

function TerminalBlock({ x, y, width, depth, height, label, tone }: { x: number; y: number; width: number; depth: number; height: number; label: string; tone: string }) {
  return (
    <g>
      <polygon points={`${x},${y + depth} ${x + width},${y + depth - 70} ${x + width + 135},${y} ${x + 130},${y + 68}`} fill="#dfe8eb" stroke="#b8c5ca" strokeWidth="3" />
      <polygon points={`${x + 25},${y + depth - 8} ${x + width - 15},${y + depth - 78} ${x + width - 15},${y + depth - 78 - height} ${x + 25},${y + depth - 8 - height}`} fill="url(#glass)" stroke="#78909c" />
      <polygon points={`${x + 25},${y + depth - 8 - height} ${x + width - 15},${y + depth - 78 - height} ${x + width + 55},${y + depth - 122 - height} ${x + 95},${y + depth - 50 - height}`} fill="#cfd8dc" />
      <text x={x + width / 2 + 60} y={y + depth - height - 60} textAnchor="middle" fontSize="26" fontWeight="800" fill={tone} fontFamily="Inter, Arial" transform={`rotate(-13 ${x + width / 2 + 60} ${y + depth - height - 60})`}>
        {label}
      </text>
    </g>
  );
}

function ServicePanel({ x, y, label, icon }: { x: number; y: number; label: string; icon: "counters" | "belt" | "booths" | "scanner" }) {
  return (
    <g>
      <polygon points={`${x},${y + 90} ${x + 270},${y} ${x + 380},${y + 55} ${x + 105},${y + 150}`} fill="#fff" stroke="#cfd8dc" strokeWidth="3" />
      <text x={x + 170} y={y + 28} textAnchor="middle" fontSize="18" fontWeight="800" fill="#263238" fontFamily="Inter, Arial">
        {label}
      </text>
      {icon === "counters" && <CheckInCounters x={x + 70} y={y + 72} small />}
      {icon === "belt" && <BaggageBelt x={x + 85} y={y + 70} />}
      {icon === "booths" && <SecurityBooths x={x + 110} y={y + 70} />}
      {icon === "scanner" && <Scanner x={x + 125} y={y + 60} />}
    </g>
  );
}

function CheckInCounters({ x, y, small = false }: { x: number; y: number; small?: boolean }) {
  const count = small ? 3 : 5;
  return (
    <g>
      {Array.from({ length: count }).map((_, index) => (
        <g key={index} transform={`translate(${x + index * 42} ${y})`}>
          <rect width="34" height="24" fill="#e0e0e0" stroke="#9e9e9e" />
          <rect x="4" y="-18" width="26" height="16" fill="#f7d13d" stroke="#9e9e9e" />
          <circle cx="17" cy="42" r="7" fill="#355c7d" />
        </g>
      ))}
    </g>
  );
}

function GateRow({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {Array.from({ length: 6 }).map((_, index) => (
        <g key={index} transform={`translate(${x + index * 32} ${y + index * 8})`}>
          <rect width="24" height="42" fill="#eceff1" stroke="#90a4ae" />
          <text x="12" y="24" textAnchor="middle" fontSize="11" fontWeight="800" fill="#546e7a">
            {index + 1}
          </text>
        </g>
      ))}
    </g>
  );
}

function RetailStrip({ x, y, tone }: { x: number; y: number; tone: string }) {
  return (
    <g>
      <rect x={x} y={y} width="180" height="42" rx="6" fill="#eef5f7" stroke="#b0bec5" />
      <Utensils x={x + 18} y={y + 11} width="18" height="18" color={tone} />
      <ShoppingBag x={x + 68} y={y + 11} width="18" height="18" color={tone} />
      <CircleDollarSign x={x + 118} y={y + 11} width="18" height="18" color={tone} />
      <text x={x + 90} y={y + 58} textAnchor="middle" fontSize="12" fill="#607d8b" fontFamily="Inter, Arial">
        food - duty free - ATM
      </text>
    </g>
  );
}

function BaggageBelt({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <ellipse cx={x + 78} cy={y + 30} rx="80" ry="26" fill="#607d8b" />
      <ellipse cx={x + 78} cy={y + 30} rx="55" ry="13" fill="#fff" />
      <rect x={x + 20} y={y + 18} width="25" height="20" fill="#f5a623" />
      <rect x={x + 115} y={y + 20} width="22" height="18" fill="#7e57c2" />
    </g>
  );
}

function SecurityBooths({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="64" height="55" fill="#90a4ae" />
      <rect x={x + 10} y={y + 12} width="44" height="36" fill="#263238" />
      <rect x={x + 84} y={y + 18} width="85" height="28" fill="#b0bec5" />
      <rect x={x + 98} y={y} width="58" height="24" fill="#455a64" />
    </g>
  );
}

function Scanner({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="54" height="92" fill="#455a64" />
      <rect x={x + 12} y={y + 18} width="30" height="56" fill="#263238" />
      <rect x={x + 78} y={y + 52} width="110" height="24" fill="#b0bec5" />
      <rect x={x + 110} y={y + 20} width="62" height="38" fill="#455a64" />
    </g>
  );
}

function Road({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(-23)`}>
      <rect width="360" height="54" fill="#78909c" />
      <line x1="18" y1="27" x2="342" y2="27" stroke="#fff" strokeWidth="3" strokeDasharray="24 18" />
    </g>
  );
}

function ControlTower({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <polygon points={`${x},${y + 170} ${x + 68},${y + 170} ${x + 52},${y + 50} ${x + 18},${y + 50}`} fill="#cfd8dc" />
      <polygon points={`${x + 4},${y + 50} ${x + 66},${y + 30} ${x + 98},${y + 48} ${x + 36},${y + 70}`} fill="#90a4ae" />
      <polygon points={`${x + 18},${y + 48} ${x + 80},${y + 32} ${x + 94},${y + 48} ${x + 34},${y + 66}`} fill="#fff" />
    </g>
  );
}

function PlaneShape({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(-18) scale(${scale})`}>
      <path d="M0 18 L120 5 C146 2 158 12 138 22 L86 46 L118 77 L100 86 L52 58 L12 72 L2 62 L34 40 L0 30 Z" fill="#fff" stroke="#b0bec5" strokeWidth="2" />
      <path d="M90 11 L126 -24 L138 -18 L114 17 Z" fill="#d84315" />
      <path d="M54 53 L18 103 L30 108 L76 58 Z" fill="#d84315" />
      <circle cx="70" cy="35" r="5" fill="#90a4ae" />
    </g>
  );
}

function BusShape({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(-23)`}>
      <rect width="94" height="38" rx="6" fill="#f5a623" stroke="#8d6e00" />
      <rect x="12" y="8" width="52" height="13" fill="#fff8e1" />
      <circle cx="20" cy="40" r="6" fill="#263238" />
      <circle cx="74" cy="40" r="6" fill="#263238" />
    </g>
  );
}

function PeopleGroup({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {[0, 24, 48, 78].map((offset, index) => (
        <g key={offset} transform={`translate(${x + offset} ${y + (index % 2) * 12})`}>
          <circle cx="0" cy="0" r="6" fill="#5d4037" />
          <rect x="-5" y="7" width="10" height="26" rx="4" fill={index % 2 ? "#7e57c2" : "#0097a7"} />
          <line x1="-4" y1="33" x2="-8" y2="49" stroke="#263238" strokeWidth="3" />
          <line x1="4" y1="33" x2="8" y2="49" stroke="#263238" strokeWidth="3" />
        </g>
      ))}
    </g>
  );
}

function ServiceTrucks({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {[0, 55, 110].map((offset) => (
        <g key={offset} transform={`translate(${x + offset} ${y}) rotate(-18)`}>
          <rect width="42" height="24" fill="#eceff1" stroke="#90a4ae" />
          <rect x="42" y="7" width="20" height="17" fill="#b0bec5" />
          <circle cx="12" cy="27" r="4" fill="#263238" />
          <circle cx="50" cy="27" r="4" fill="#263238" />
        </g>
      ))}
    </g>
  );
}

function Helipad({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r="55" fill="#78909c" stroke="#ffcc00" strokeWidth="4" />
      <text x={x} y={y + 14} textAnchor="middle" fontSize="44" fontWeight="800" fill="#fff" fontFamily="Inter, Arial">
        H
      </text>
    </g>
  );
}
