import { useState } from "react";
import { Info } from "lucide-react";

/**
 * Isometric depiction of Cairo International Airport (CAI / HECA).
 * Layout reflects real geometry (approximate, not to scale):
 *  - 3 parallel runways oriented ~05/23 (NE-SW): 05L/23R (east), 05C/23C (center), 05R/23L (west)
 *  - T1 (north-east, original 1963 building, refurbished)
 *  - T2 (between T1 and T3, reopened 2021 after rebuild — linear concourse)
 *  - T3 (large, opened 2009, EgyptAir hub, with concourse pier)
 *  - Seasonal / Hajj Terminal (south-west)
 *  - Cargo Village (north)
 *  - Multi-story Parking (front of T3) and surface lots near T1/T2
 *  - APM/shuttle link between T1, T2, T3 (currently bus shuttle)
 */

type ZoneId = "T1" | "T2" | "T3" | "ST" | "CARGO" | "PARK" | "RWY" | "APM";

const ZONE_INFO: Record<ZoneId, { title: string; body: string }> = {
  T1: {
    title: "Terminal 1",
    body: "Original terminal (1963, refurbished). Hall 1 — international departures (non-EgyptAir). Hall 2/3 — domestic & charter.",
  },
  T2: {
    title: "Terminal 2",
    body: "Rebuilt and reopened 2022. Star Alliance & SkyTeam partners (excl. EgyptAir). 7.5M pax/yr capacity.",
  },
  T3: {
    title: "Terminal 3",
    body: "Opened 2009. EgyptAir hub & all Star Alliance EgyptAir flights. Capacity 11M pax/yr. Largest terminal.",
  },
  ST: {
    title: "Seasonal Terminal (Hajj)",
    body: "Used during Hajj/Umrah pilgrimage seasons and overflow charter operations.",
  },
  CARGO: {
    title: "Cairo Cargo Village",
    body: "Dedicated freight terminal — perishables, e-commerce, and aircraft maintenance bays.",
  },
  PARK: {
    title: "Multi-storey Car Park",
    body: "≈3,000 covered bays directly in front of T3, with skybridge access.",
  },
  RWY: {
    title: "Runway System",
    body: "Three parallel runways: 05L/23R (4,000 m), 05C/23C (3,300 m), 05R/23L (3,180 m).",
  },
  APM: {
    title: "Inter-Terminal Shuttle",
    body: "Free shuttle bus between T1 ↔ T2 ↔ T3 every 10 minutes. APM (people mover) under construction.",
  },
};

export function IsometricMap({ className = "", interactive = true }: { className?: string; interactive?: boolean }) {
  const [hover, setHover] = useState<ZoneId | null>(null);
  const [pinned, setPinned] = useState<ZoneId | null>("T3");
  const active = hover ?? pinned;

  const handleClick = (id: ZoneId) => interactive && setPinned(id);
  const handleEnter = (id: ZoneId) => interactive && setHover(id);
  const handleLeave = () => interactive && setHover(null);

  return (
    <div className={`relative panel overflow-hidden ${className}`}>
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="absolute top-3 start-3 z-10 flex items-center gap-2 text-[10px] font-mono tracking-[0.18em] text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary glow-cyan" />
        CAI · ISOMETRIC
      </div>
      <div className="absolute top-3 end-3 z-10 text-[10px] font-mono text-muted-foreground">
        N ↑ · 30.111° N · 31.413° E
      </div>

      <svg viewBox="0 0 1100 720" className="w-full h-auto block" role="img" aria-label="Isometric map of Cairo International Airport">
        <defs>
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="oklch(0.22 0.04 250)" />
            <stop offset="1" stopColor="oklch(0.16 0.04 250)" />
          </linearGradient>
          <linearGradient id="rwy" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="oklch(0.26 0.03 250)" />
            <stop offset="1" stopColor="oklch(0.32 0.03 250)" />
          </linearGradient>
          <linearGradient id="roof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="oklch(0.62 0.10 210)" />
            <stop offset="1" stopColor="oklch(0.42 0.08 240)" />
          </linearGradient>
          <linearGradient id="roofWarm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="oklch(0.70 0.14 80)" />
            <stop offset="1" stopColor="oklch(0.50 0.10 60)" />
          </linearGradient>
          <linearGradient id="side" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="oklch(0.30 0.05 250)" />
            <stop offset="1" stopColor="oklch(0.22 0.05 250)" />
          </linearGradient>
        </defs>

        {/* Ground plate (isometric diamond) */}
        <polygon points="550,40 1080,360 550,680 20,360" fill="url(#ground)" stroke="oklch(0.34 0.05 250)" />

        {/* Compass / north arrow */}
        <g transform="translate(70 80)">
          <circle r="22" fill="oklch(0.20 0.04 250)" stroke="oklch(0.40 0.06 250)" />
          <path d="M0,-16 L6,8 L0,2 L-6,8 Z" fill="var(--cyan)" />
          <text y="32" textAnchor="middle" fontSize="9" fill="oklch(0.85 0.02 240)" fontFamily="ui-monospace">N</text>
        </g>

        {/* === RUNWAYS (3 parallel, oriented along isometric NE-SW axis) === */}
        <Runway label="05L / 23R · 4,000 m" x1={120} y1={300} x2={760} y2={620} onEnter={() => handleEnter("RWY")} onLeave={handleLeave} onClick={() => handleClick("RWY")} active={active === "RWY"} />
        <Runway label="05C / 23C · 3,300 m" x1={210} y1={245} x2={850} y2={565} onEnter={() => handleEnter("RWY")} onLeave={handleLeave} onClick={() => handleClick("RWY")} active={active === "RWY"} />
        <Runway label="05R / 23L · 3,180 m" x1={300} y1={190} x2={940} y2={510} onEnter={() => handleEnter("RWY")} onLeave={handleLeave} onClick={() => handleClick("RWY")} active={active === "RWY"} />

        {/* Taxiways */}
        <g stroke="oklch(0.35 0.04 250)" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.85">
          <path d="M 380 220 L 470 175 L 620 250" />
          <path d="M 540 300 L 670 235 L 780 290" />
          <path d="M 700 380 L 830 315" />
        </g>

        {/* === CARGO VILLAGE (top) === */}
        <Building
          x={380} y={70} w={150} d={70} h={28}
          label="Cargo Village" small
          roof="url(#roofWarm)"
          active={active === "CARGO"}
          onEnter={() => handleEnter("CARGO")} onLeave={handleLeave} onClick={() => handleClick("CARGO")}
        />

        {/* === T1 (older, NE side) === */}
        <Building
          x={620} y={150} w={140} d={70} h={36}
          label="T1" sub="Terminal 1"
          active={active === "T1"}
          onEnter={() => handleEnter("T1")} onLeave={handleLeave} onClick={() => handleClick("T1")}
        />

        {/* === T2 (middle, linear concourse) === */}
        <Building
          x={500} y={260} w={170} d={62} h={42}
          label="T2" sub="Terminal 2"
          active={active === "T2"}
          onEnter={() => handleEnter("T2")} onLeave={handleLeave} onClick={() => handleClick("T2")}
        />

        {/* === T3 (largest, with concourse pier extending toward apron) === */}
        <Building
          x={340} y={370} w={200} d={75} h={50}
          label="T3" sub="Terminal 3 · EgyptAir Hub"
          active={active === "T3"}
          onEnter={() => handleEnter("T3")} onLeave={handleLeave} onClick={() => handleClick("T3")}
        />
        {/* T3 pier extending southwest toward the runways */}
        <Building
          x={310} y={460} w={50} d={140} h={28}
          label="" small
          active={active === "T3"}
          onEnter={() => handleEnter("T3")} onLeave={handleLeave} onClick={() => handleClick("T3")}
        />

        {/* === Multi-storey parking in front of T3 === */}
        <Building
          x={235} y={395} w={90} d={60} h={56}
          label="Parking" sub="≈3,000 bays" small
          roof="oklch(0.32 0.04 250)"
          active={active === "PARK"}
          onEnter={() => handleEnter("PARK")} onLeave={handleLeave} onClick={() => handleClick("PARK")}
        />
        {/* parking grid lines */}
        <g pointerEvents="none">
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={235 + i * 22} y1={395 - 56} x2={235 + i * 22 + 60 * 0.5} y2={395 - 56 + 60 * 0.5} stroke="oklch(0.50 0.06 240)" strokeWidth="0.6" opacity="0.6" />
          ))}
        </g>

        {/* === Seasonal / Hajj terminal (south) === */}
        <Building
          x={620} y={520} w={130} d={60} h={30}
          label="Seasonal" sub="Hajj Terminal" small
          roof="url(#roofWarm)"
          active={active === "ST"}
          onEnter={() => handleEnter("ST")} onLeave={handleLeave} onClick={() => handleClick("ST")}
        />

        {/* === Inter-terminal shuttle line (T1 ↔ T2 ↔ T3) === */}
        <g
          onMouseEnter={() => handleEnter("APM")}
          onMouseLeave={handleLeave}
          onClick={() => handleClick("APM")}
          style={{ cursor: interactive ? "pointer" : "default" }}
        >
          <path
            d="M 690 186 C 640 220, 600 260, 585 290 S 470 360, 440 405"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="3"
            strokeOpacity={active === "APM" ? 0.95 : 0.55}
            strokeDasharray="8 8"
            className="flow-line"
          />
          <ShuttleStop cx={690} cy={186} label="T1" />
          <ShuttleStop cx={585} cy={296} label="T2" />
          <ShuttleStop cx={440} cy={406} label="T3" />
        </g>

        {/* Aircraft silhouettes on apron */}
        {[
          [430, 470, 30],
          [380, 540, 30],
          [560, 350, -30],
          [690, 270, -30],
          [780, 220, -30],
        ].map(([x, y, r], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r})`} opacity="0.85" pointerEvents="none">
            <path d="M0 0 L20 -2 L26 -10 L29 -2 L46 0 L29 2 L26 10 L20 2 Z" fill="oklch(0.85 0.02 240)" stroke="oklch(0.35 0.04 240)" strokeWidth="0.6" />
          </g>
        ))}

        {/* Compass label for runway heading */}
        <text x="950" y="200" fontSize="9" fontFamily="ui-monospace" fill="oklch(0.6 0.04 240)">RWY HDG 047°</text>
      </svg>

      {/* Info card */}
      {active && (
        <div className="absolute bottom-3 start-3 max-w-[320px] panel-inner p-3 bg-background/90">
          <div className="flex items-center gap-2">
            <Info className="h-3.5 w-3.5 text-primary" />
            <h4 className="text-sm font-semibold">{ZONE_INFO[active].title}</h4>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{ZONE_INFO[active].body}</p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-3 end-3 panel-inner px-3 py-2 flex items-center gap-3 text-[10px] font-mono">
        <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm" style={{ background: "linear-gradient(oklch(0.62 0.10 210), oklch(0.42 0.08 240))" }} />Terminal</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm" style={{ background: "linear-gradient(oklch(0.70 0.14 80), oklch(0.50 0.10 60))" }} />Cargo / Hajj</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-primary/70" />Shuttle</span>
      </div>
    </div>
  );
}

function Runway({
  x1, y1, x2, y2, label, active, onEnter, onLeave, onClick,
}: {
  x1: number; y1: number; x2: number; y2: number; label: string;
  active?: boolean;
  onEnter?: () => void; onLeave?: () => void; onClick?: () => void;
}) {
  // Build a thick rotated runway as a parallelogram
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const nx = -dy / len, ny = dx / len; // normal
  const w = 28;
  const p1 = [x1 + nx * w, y1 + ny * w];
  const p2 = [x2 + nx * w, y2 + ny * w];
  const p3 = [x2 - nx * w, y2 - ny * w];
  const p4 = [x1 - nx * w, y1 - ny * w];
  const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  return (
    <g onMouseEnter={onEnter} onMouseLeave={onLeave} onClick={onClick} style={{ cursor: "pointer" }}>
      {/* shadow */}
      <polygon
        points={`${p1[0] + 6},${p1[1] + 8} ${p2[0] + 6},${p2[1] + 8} ${p3[0] + 6},${p3[1] + 8} ${p4[0] + 6},${p4[1] + 8}`}
        fill="oklch(0.10 0.02 250)" opacity="0.5"
      />
      <polygon
        points={`${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]} ${p4[0]},${p4[1]}`}
        fill="url(#rwy)"
        stroke={active ? "var(--cyan)" : "oklch(0.42 0.05 250)"}
        strokeWidth={active ? 1.5 : 0.8}
      />
      {/* center stripes */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="oklch(0.92 0.02 240)" strokeWidth="1.6"
        strokeDasharray="14 10" opacity="0.65"
      />
      <text
        transform={`translate(${cx} ${cy}) rotate(${angle})`}
        textAnchor="middle" dy="-12"
        fontSize="9" fontFamily="ui-monospace" letterSpacing="0.12em"
        fill="oklch(0.78 0.04 230)"
      >
        {label}
      </text>
    </g>
  );
}

function Building({
  x, y, w, d, h, label, sub, small, roof = "url(#roof)", active, onEnter, onLeave, onClick,
}: {
  x: number; y: number; w: number; d: number; h: number;
  label: string; sub?: string; small?: boolean;
  roof?: string;
  active?: boolean;
  onEnter?: () => void; onLeave?: () => void; onClick?: () => void;
}) {
  // isometric projection helper: from (x,y) base, building extends w to right, d "into" page (down-right), h up.
  // We render with a simple oblique projection (offset = d * 0.5, -d * 0.5) for clean diagonals.
  const ox = d * 0.5, oy = -d * 0.5;

  // base footprint corners
  const A = [x, y];                     // front-left
  const B = [x + w, y];                 // front-right
  const C = [x + w + ox, y + oy];       // back-right (raised)
  const D = [x + ox, y + oy];           // back-left (raised)

  // top corners (lifted by h)
  const At = [A[0], A[1] - h];
  const Bt = [B[0], B[1] - h];
  const Ct = [C[0], C[1] - h];
  const Dt = [D[0], D[1] - h];

  return (
    <g
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{ cursor: "pointer" }}
      filter={active ? "drop-shadow(0 0 8px var(--cyan))" : undefined}
    >
      {/* ground shadow */}
      <polygon
        points={`${A[0] + 6},${A[1] + 6} ${B[0] + 6},${B[1] + 6} ${C[0] + 6},${C[1] + 6} ${D[0] + 6},${D[1] + 6}`}
        fill="oklch(0.10 0.02 250)" opacity="0.55"
      />
      {/* right side */}
      <polygon points={`${B[0]},${B[1]} ${Bt[0]},${Bt[1]} ${Ct[0]},${Ct[1]} ${C[0]},${C[1]}`} fill="url(#side)" stroke="oklch(0.18 0.03 250)" strokeWidth="0.6" />
      {/* front */}
      <polygon points={`${A[0]},${A[1]} ${At[0]},${At[1]} ${Bt[0]},${Bt[1]} ${B[0]},${B[1]}`} fill="oklch(0.34 0.05 250)" stroke="oklch(0.18 0.03 250)" strokeWidth="0.6" />
      {/* roof */}
      <polygon points={`${At[0]},${At[1]} ${Bt[0]},${Bt[1]} ${Ct[0]},${Ct[1]} ${Dt[0]},${Dt[1]}`} fill={roof} stroke={active ? "var(--cyan)" : "oklch(0.20 0.03 250)"} strokeWidth={active ? 1.4 : 0.8} />
      {/* roof skylight bar */}
      <line x1={At[0] + 8} y1={At[1] + (Dt[1] - At[1]) * 0.5} x2={Bt[0] - 8} y2={Bt[1] + (Ct[1] - Bt[1]) * 0.5} stroke="var(--cyan)" strokeWidth="1.6" opacity="0.55" />
      {/* labels */}
      {label && (
        <g pointerEvents="none">
          <text
            x={(At[0] + Ct[0]) / 2}
            y={(At[1] + Ct[1]) / 2 + 2}
            textAnchor="middle"
            fontSize={small ? 10 : 14}
            fontWeight="700"
            fill="oklch(0.98 0.01 230)"
            fontFamily="Inter, ui-sans-serif"
            letterSpacing="0.1em"
          >
            {label}
          </text>
          {sub && (
            <text
              x={(At[0] + Ct[0]) / 2}
              y={(At[1] + Ct[1]) / 2 + 14}
              textAnchor="middle"
              fontSize={9}
              fill="oklch(0.85 0.02 230)"
              fontFamily="ui-monospace"
            >
              {sub}
            </text>
          )}
        </g>
      )}
    </g>
  );
}

function ShuttleStop({ cx, cy, label }: { cx: number; cy: number; label: string }) {
  return (
    <g pointerEvents="none">
      <circle cx={cx} cy={cy} r="8" fill="oklch(0.16 0.04 250)" stroke="var(--cyan)" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="3" fill="var(--cyan)" />
      <text x={cx + 12} y={cy + 4} fontSize="10" fontFamily="ui-monospace" fill="oklch(0.95 0.01 230)">{label}</text>
    </g>
  );
}
