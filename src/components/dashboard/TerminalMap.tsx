import type { ReactNode } from "react";
import { useDashboard } from "@/lib/dashboard-context";

type Marker = {
  id: string;
  x: number; // 0-100
  y: number;
  label: string;
  density?: "low" | "med" | "high" | "crit";
  type?: "gate" | "checkin" | "lounge" | "baggage" | "apm" | "parking" | "service";
};

const DEFAULT_MARKERS: Marker[] = [
  { id: "T1", x: 22, y: 38, label: "Terminal 1", type: "checkin", density: "low" },
  { id: "T2", x: 48, y: 28, label: "Terminal 2", type: "checkin", density: "med" },
  { id: "T3", x: 70, y: 46, label: "Terminal 3", type: "checkin", density: "high" },
  { id: "ST", x: 86, y: 70, label: "Seasonal Terminal", type: "checkin", density: "low" },
  { id: "APM-A", x: 36, y: 58, label: "APM Station A", type: "apm", density: "med" },
  { id: "APM-B", x: 60, y: 60, label: "APM Station B", type: "apm", density: "med" },
  { id: "PRK", x: 12, y: 78, label: "Parking Garage", type: "parking", density: "low" },
  { id: "LNG", x: 56, y: 18, label: "Premium Lounge", type: "lounge", density: "low" },
  { id: "BAG", x: 30, y: 70, label: "Baggage Claim", type: "baggage", density: "high" },
  { id: "DTY", x: 70, y: 28, label: "Duty Free", type: "service", density: "med" },
];

export function TerminalMap({
  className = "",
  markers = DEFAULT_MARKERS,
  showFlows = true,
  showAccessible,
  highlightId,
  variant = "full",
  legend = true,
}: {
  className?: string;
  markers?: Marker[];
  showFlows?: boolean;
  showAccessible?: boolean;
  highlightId?: string;
  variant?: "full" | "compact";
  legend?: boolean;
}) {
  const { accessibleRoutes } = useDashboard();
  const acc = showAccessible ?? accessibleRoutes;

  return (
    <div className={`relative panel corner-brackets overflow-hidden ${className}`}>
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
      <div className="absolute inset-0 scanline opacity-[0.12] pointer-events-none" />

      <div className="absolute top-3 start-3 z-10 flex items-center gap-2 text-[10px] font-mono tracking-[0.18em] text-primary">
        <span className="h-1.5 w-1.5 rounded-full bg-primary glow-cyan" />
        DIGITAL TWIN · CAI 2.5D
      </div>
      <div className="absolute top-3 end-3 z-10 text-[10px] font-mono text-muted-foreground">
        N ↑ · 30.1° · 31.4°
      </div>

      <svg viewBox="0 0 1000 600" className="w-full h-full block">
        <defs>
          <linearGradient id="bld" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="oklch(0.42 0.06 250)" />
            <stop offset="1" stopColor="oklch(0.26 0.05 250)" />
          </linearGradient>
          <linearGradient id="roof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="oklch(0.55 0.07 250)" />
            <stop offset="1" stopColor="oklch(0.36 0.06 250)" />
          </linearGradient>
          <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="var(--cyan)" stopOpacity="0.45" />
            <stop offset="1" stopColor="var(--cyan)" stopOpacity="0" />
          </radialGradient>
          <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Tarmac glow */}
        <ellipse cx="500" cy="320" rx="460" ry="220" fill="url(#glow)" />

        {/* Runway 05R/23L */}
        <g opacity="0.85">
          <rect x="60" y="490" width="880" height="22" rx="3" fill="oklch(0.22 0.03 250)" stroke="oklch(0.4 0.05 250)" />
          <g stroke="oklch(0.85 0.05 230)" strokeWidth="2" strokeDasharray="22 18" opacity="0.55">
            <line x1="80" y1="501" x2="920" y2="501" />
          </g>
          <text x="70" y="528" fontSize="11" fill="oklch(0.7 0.04 240)" fontFamily="ui-monospace">05R</text>
          <text x="900" y="528" fontSize="11" fill="oklch(0.7 0.04 240)" fontFamily="ui-monospace">23L</text>
        </g>

        {/* Taxiway */}
        <path d="M120 480 L260 420 L760 420 L900 480" fill="none" stroke="oklch(0.32 0.04 250)" strokeWidth="14" strokeLinejoin="round" />
        <path d="M120 480 L260 420 L760 420 L900 480" fill="none" stroke="oklch(0.5 0.05 240)" strokeWidth="1" strokeDasharray="6 8" />

        {/* Terminal 1 (older / smaller) */}
        <Building x={140} y={190} w={170} h={70} label="T1" />
        {/* Terminal 2 */}
        <Building x={380} y={120} w={210} h={90} label="T2" />
        {/* Terminal 3 (largest, curved pier) */}
        <Building x={620} y={220} w={260} h={110} label="T3" />
        {/* Pier with gates from T3 */}
        <g>
          <rect x="690" y="330" width="40" height="80" fill="url(#bld)" stroke="oklch(0.45 0.05 250)" />
          <rect x="760" y="330" width="40" height="80" fill="url(#bld)" stroke="oklch(0.45 0.05 250)" />
        </g>
        {/* Seasonal */}
        <Building x={820} y={400} w={120} h={50} label="Seasonal" small />

        {/* APM track (cyan glowing line) */}
        <g>
          <path
            d="M225 260 C 280 320, 360 360, 460 350 S 640 320, 760 360"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="2.5"
            strokeOpacity="0.85"
            strokeDasharray="8 10"
            className="flow-line"
          />
          <circle cx="225" cy="260" r="4" fill="var(--cyan)" />
          <circle cx="460" cy="350" r="4" fill="var(--cyan)" />
          <circle cx="760" cy="360" r="4" fill="var(--cyan)" />
        </g>

        {/* Parking garage */}
        <g>
          <rect x="60" y="380" width="120" height="80" rx="4" fill="oklch(0.24 0.04 250)" stroke="oklch(0.42 0.05 250)" />
          {[0,1,2].map(i => (
            <line key={i} x1="60" y1={400 + i*20} x2="180" y2={400 + i*20} stroke="oklch(0.4 0.05 250)" />
          ))}
          <text x="120" y="427" textAnchor="middle" fontSize="10" fill="oklch(0.85 0.02 240)" fontFamily="ui-monospace">PARKING · 3,000</text>
        </g>

        {/* Connections T1/T2/T3 to APM */}
        {showFlows && (
          <g opacity="0.85">
            <FlowLine d="M225 260 L 380 165" color="var(--cyan)" />
            <FlowLine d="M485 210 L 460 350" color="var(--cyan)" />
            <FlowLine d="M620 275 L 760 360" color="var(--cyan)" />
            <FlowLine d="M180 440 L 225 260" color="oklch(0.78 0.18 95)" dur="3s" />
            {acc && (
              <>
                <FlowLine d="M180 440 L 225 260" color="var(--magenta)" thick={5} dur="2.4s" />
                <FlowLine d="M460 350 L 690 400" color="var(--magenta)" thick={5} dur="2.4s" />
              </>
            )}
          </g>
        )}

        {/* Aircraft silhouettes at gates */}
        {[
          [710, 415], [780, 415], [690, 230], [810, 230], [430, 110],
        ].map(([x,y], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(20)`} opacity="0.65">
            <path d="M0 0 L18 -2 L24 -8 L26 -2 L40 0 L26 2 L24 8 L18 2 Z" fill="oklch(0.78 0.04 230)" />
          </g>
        ))}

        {/* Markers */}
        {markers.map(m => (
          <Marker key={m.id} {...m} highlight={highlightId === m.id} />
        ))}
      </svg>

      {legend && (
        <div className="absolute bottom-3 end-3 panel-inner px-3 py-2 flex items-center gap-3 text-[10px] font-mono">
          <Legend color="var(--status-ok)" label="LOW" />
          <Legend color="var(--status-warn)" label="MED" />
          <Legend color="var(--status-high)" label="HIGH" />
          <Legend color="var(--status-crit)" label="CRIT" />
          {acc && <Legend color="var(--magenta)" label="ACCESS" />}
        </div>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      {label}
    </span>
  );
}

function Building({ x, y, w, h, label, small }: { x: number; y: number; w: number; h: number; label: string; small?: boolean }) {
  const depth = small ? 8 : 14;
  return (
    <g>
      {/* shadow */}
      <rect x={x + depth} y={y + depth} width={w} height={h} fill="oklch(0.13 0.03 250)" opacity="0.7" rx="3" />
      {/* side */}
      <polygon
        points={`${x+w},${y} ${x+w+depth},${y+depth} ${x+w+depth},${y+h+depth} ${x+w},${y+h}`}
        fill="oklch(0.30 0.05 250)"
      />
      <polygon
        points={`${x},${y+h} ${x+depth},${y+h+depth} ${x+w+depth},${y+h+depth} ${x+w},${y+h}`}
        fill="oklch(0.26 0.05 250)"
      />
      {/* roof */}
      <rect x={x} y={y} width={w} height={h} fill="url(#roof)" stroke="var(--cyan)" strokeOpacity="0.4" rx="3" />
      {/* skylights */}
      <g fill="var(--cyan)" opacity="0.55">
        {Array.from({ length: Math.floor(w / 22) }).map((_, i) => (
          <rect key={i} x={x + 8 + i * 22} y={y + h / 2 - 2} width="14" height="3" rx="1" />
        ))}
      </g>
      <text x={x + w / 2} y={y + h / 2 + 3} textAnchor="middle" fontSize={small ? 10 : 13} fontWeight="600" fill="oklch(0.97 0.01 230)" fontFamily="ui-monospace" letterSpacing="0.12em">
        {label}
      </text>
    </g>
  );
}

function FlowLine({ d, color, thick = 2, dur = "2s" }: { d: string; color: string; thick?: number; dur?: string }) {
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={thick} strokeOpacity="0.25" />
      <path d={d} fill="none" stroke={color} strokeWidth={thick} strokeDasharray="6 14" className="flow-line" style={{ animationDuration: dur }} />
    </g>
  );
}

function Marker({ x, y, label, density = "low", highlight }: Marker & { highlight?: boolean }) {
  const colorMap = {
    low: "var(--status-ok)",
    med: "var(--status-warn)",
    high: "var(--status-high)",
    crit: "var(--status-crit)",
  };
  const c = colorMap[density];
  const cx = (x / 100) * 1000;
  const cy = (y / 100) * 600;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      {(density === "high" || density === "crit" || highlight) && (
        <circle r="14" fill={c} opacity="0.18">
          <animate attributeName="r" values="10;22;10" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite" />
        </circle>
      )}
      <circle r="6" fill={c} stroke="oklch(0.12 0.03 250)" strokeWidth="2" />
      <g transform="translate(10 4)">
        <rect x="0" y="-10" width={label.length * 5.6 + 14} height="16" rx="3" fill="oklch(0.14 0.03 250 / 0.85)" stroke="oklch(0.4 0.05 250)" />
        <text x="7" y="2" fontSize="10" fill="oklch(0.96 0.01 230)" fontFamily="ui-monospace" letterSpacing="0.05em">
          {label}
        </text>
      </g>
    </g>
  );
}
