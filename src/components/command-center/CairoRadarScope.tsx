import { useState, useEffect, useRef, useMemo } from "react";
import { Radar, Radio } from "lucide-react";
import { useLocale } from "../../context/locale";
import { useSimulation } from "../../context/simulation";
import { soundEffects } from "../../services/soundEffects";

interface RadarTrack {
  callsign: string;
  airline: string;
  aircraft: string;
  bearingDeg: number; // 0 to 360 relative to CAI VOR
  distanceNm: number; // 2 to 50 nm
  altitudeFt: number; // 1,500 to 24,000 ft
  speedKt: number;
  headingDeg: number;
  assignedRunway: "05L" | "05C" | "05R";
  status: "approaching" | "intercepting" | "final" | "holding";
  squawk: string;
}

const INITIAL_TRACKS: RadarTrack[] = [
  {
    callsign: "MS777",
    airline: "EgyptAir",
    aircraft: "B777-300ER",
    bearingDeg: 315,
    distanceNm: 18,
    altitudeFt: 5200,
    speedKt: 210,
    headingDeg: 120,
    assignedRunway: "05C",
    status: "intercepting",
    squawk: "4211",
  },
  {
    callsign: "SV302",
    airline: "Saudia",
    aircraft: "B787-9",
    bearingDeg: 110,
    distanceNm: 28,
    altitudeFt: 9400,
    speedKt: 250,
    headingDeg: 285,
    assignedRunway: "05R",
    status: "approaching",
    squawk: "3602",
  },
  {
    callsign: "AF551",
    airline: "Air France",
    aircraft: "A350-900",
    bearingDeg: 340,
    distanceNm: 9,
    altitudeFt: 2800,
    speedKt: 160,
    headingDeg: 52,
    assignedRunway: "05L",
    status: "final",
    squawk: "1724",
  },
  {
    callsign: "EK927",
    airline: "Emirates",
    aircraft: "A380-800",
    bearingDeg: 85,
    distanceNm: 36,
    altitudeFt: 12500,
    speedKt: 280,
    headingDeg: 260,
    assignedRunway: "05C",
    status: "approaching",
    squawk: "5531",
  },
  {
    callsign: "TK694",
    airline: "Turkish Airlines",
    aircraft: "A321neo",
    bearingDeg: 20,
    distanceNm: 22,
    altitudeFt: 7100,
    speedKt: 220,
    headingDeg: 195,
    assignedRunway: "05L",
    status: "approaching",
    squawk: "2417",
  },
];

export function CairoRadarScope() {
  const { language } = useLocale();
  const { activeScenario, isDrillActive } = useSimulation();
  const [rangeNm, setRangeNm] = useState<number>(50); // 10, 25, 50
  const [selectedTrack, setSelectedTrack] = useState<RadarTrack | null>(null);
  const [sweepAngle, setSweepAngle] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Dynamic tracks modulated by scenario
  const tracks = useMemo(() => {
    if (activeScenario.id === "sandstorm") {
      // In sandstorm, spacing is increased and 2 aircraft enter holding
      return INITIAL_TRACKS.map((t, idx) => {
        if (idx === 1) {
          return { ...t, status: "holding" as const, speedKt: 210, altitudeFt: 10000 };
        }
        return { ...t, distanceNm: t.distanceNm + 4, speedKt: Math.max(150, t.speedKt - 20) };
      });
    }
    return INITIAL_TRACKS;
  }, [activeScenario]);

  // Radar sweep rotation animation loop
  useEffect(() => {
    let animFrame: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      // 24 RPM sweep = 144 degrees/sec
      setSweepAngle((prev) => (prev + delta * 90) % 360);
      animFrame = requestAnimationFrame(render);
    };

    animFrame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  // Draw tactical radar canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 16;

    ctx.clearRect(0, 0, width, height);

    // Background circle (Dark phosphor radar CRT)
    const bgGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    bgGrad.addColorStop(0, "rgba(6, 26, 22, 0.95)");
    bgGrad.addColorStop(1, "rgba(2, 13, 10, 0.98)");
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Outer Ring Border
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Range Rings (10, 25, 50 nm)
    const rings = [0.2, 0.5, 1.0];
    rings.forEach((ringPct) => {
      const r = radius * ringPct;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(16, 185, 129, 0.18)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Ring distance labels
      ctx.fillStyle = "rgba(16, 185, 129, 0.65)";
      ctx.font = "9px monospace";
      ctx.fillText(`${Math.round(rangeNm * ringPct)}NM`, centerX + 4, centerY - r + 11);
    });

    // Crosshair axes (Heading 000, 090, 180, 270)
    ctx.strokeStyle = "rgba(16, 185, 129, 0.15)";
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.stroke();

    // Extended Runway Centerlines for CAI 05L, 05C, 05R (Heading ~052° / 232°)
    const rwyHeadingRad = ((52 - 90) * Math.PI) / 180;
    const rwyOppositeRad = ((232 - 90) * Math.PI) / 180;
    ctx.strokeStyle = "rgba(34, 211, 238, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(rwyHeadingRad) * radius, centerY + Math.sin(rwyHeadingRad) * radius);
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(rwyOppositeRad) * radius, centerY + Math.sin(rwyOppositeRad) * radius);
    ctx.stroke();
    ctx.setLineDash([]);

    // CAI Airport Center Marker (HECA VOR)
    ctx.fillStyle = "#22d3ee";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Sweep Beam (Phosphor gradient fan)
    const sweepRad = ((sweepAngle - 90) * Math.PI) / 180;
    const sweepTrailAngle = Math.PI / 4; // 45-degree trail

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, sweepRad - sweepTrailAngle, sweepRad, false);
    ctx.closePath();

    const sweepGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    sweepGrad.addColorStop(0, "rgba(52, 211, 153, 0.3)");
    sweepGrad.addColorStop(1, "rgba(16, 185, 129, 0.0)");
    ctx.fillStyle = sweepGrad;
    ctx.fill();

    // Sweep Leading Line
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + Math.cos(sweepRad) * radius, centerY + Math.sin(sweepRad) * radius);
    ctx.strokeStyle = "rgba(110, 231, 183, 0.85)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Draw Aircraft Tracks
    tracks.forEach((track) => {
      if (track.distanceNm > rangeNm) return;

      const trackRatio = track.distanceNm / rangeNm;
      const trackDistPx = radius * trackRatio;
      const angleRad = ((track.bearingDeg - 90) * Math.PI) / 180;
      const x = centerX + Math.cos(angleRad) * trackDistPx;
      const y = centerY + Math.sin(angleRad) * trackDistPx;

      const isSelected = selectedTrack?.callsign === track.callsign;

      // Blip symbol
      ctx.fillStyle = isSelected ? "#38bdf8" : track.status === "holding" ? "#f59e0b" : "#10b981";
      ctx.beginPath();
      ctx.arc(x, y, isSelected ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Heading vector velocity leader line
      const headingRad = ((track.headingDeg - 90) * Math.PI) / 180;
      const vectorLen = (track.speedKt / 250) * 18;
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(headingRad) * vectorLen, y + Math.sin(headingRad) * vectorLen);
      ctx.stroke();

      // Data Block Tag
      ctx.font = "10px monospace";
      ctx.fillStyle = isSelected ? "#ffffff" : "rgba(240, 253, 244, 0.9)";
      ctx.fillText(track.callsign, x + 8, y - 4);
      ctx.fillStyle = "rgba(110, 231, 183, 0.75)";
      ctx.font = "8.5px monospace";
      ctx.fillText(`FL${Math.round(track.altitudeFt / 100).toString().padStart(3, "0")} ${track.speedKt}KT`, x + 8, y + 6);
      ctx.fillText(`RWY ${track.assignedRunway} • SQ${track.squawk}`, x + 8, y + 16);
    });
  }, [sweepAngle, rangeNm, tracks, selectedTrack]);

  return (
    <div className="panel p-3.5 sm:p-4 rounded-2xl border border-white/10 bg-card flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/25">
            <Radar className="h-4 w-4 animate-spin-slow" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <span>{language === "ar" ? "رادار الاقتراب الجوي (Cairo TMA 50NM)" : "Cairo TMA Approach Radar Scope"}</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-status-ok/20 text-status-ok text-[10px] font-mono">
                <Radio className="h-2.5 w-2.5" /> 120.7 MHz
              </span>
            </h2>
            <p className="text-xs text-muted-foreground">
              {language === "ar"
                ? "تتبع الرادار الحي للطائرات القادمة على المدارج 05L/05C/05R ضمن نطاق القاهرة"
                : "Live primary/secondary ADS-B tracking on final approach glidepaths to 05L/05C/05R."}
            </p>
          </div>
        </div>

        {/* Range Controls */}
        <div className="flex items-center gap-1.5 bg-secondary/40 p-1 rounded-xl border border-border/40">
          <span className="text-[10px] font-mono text-muted-foreground ps-1.5">Range:</span>
          {[10, 25, 50].map((rng) => (
            <button
              key={rng}
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setRangeNm(rng);
              }}
              className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                rangeNm === rng ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {rng}NM
            </button>
          ))}
        </div>
      </div>

      {/* Scope & Track Telemetry Split Layout */}
      <div className="grid gap-3 lg:grid-cols-[1fr_320px] items-center">
        {/* Radar Canvas */}
        <div className="relative flex items-center justify-center p-2 rounded-2xl bg-black/40 border border-emerald-950/60 overflow-hidden shadow-inner min-h-[300px] sm:min-h-[340px]">
          <canvas
            ref={canvasRef}
            width={380}
            height={380}
            className="w-full max-w-[340px] sm:max-w-[380px] aspect-square block cursor-crosshair touch-none"
          />

          {/* Overlay Status Pills */}
          <div className="absolute top-3.5 left-3.5 pointer-events-none flex flex-col gap-1">
            <span className="font-mono text-[10px] text-emerald-400 bg-black/60 px-2 py-0.5 rounded border border-emerald-500/20 backdrop-blur-xs">
              CAI TMA • RVR 1800m
            </span>
            {isDrillActive && (
              <span className="font-mono text-[10px] text-status-crit bg-status-crit/20 px-2 py-0.5 rounded border border-status-crit/40 font-bold">
                DRILL SPACING: 8NM
              </span>
            )}
          </div>

          <div className="absolute bottom-3.5 right-3.5 pointer-events-none text-end">
            <span className="font-mono text-[10px] text-muted-foreground bg-black/60 px-2 py-0.5 rounded border border-border/40">
              HECA VOR 115.8
            </span>
          </div>
        </div>

        {/* Active Approach Inbound Flight List */}
        <div className="flex flex-col gap-2 h-full max-h-[340px] overflow-y-auto pe-1">
          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
            <span>{language === "ar" ? "الطائرات في مرحلة الاقتراب" : "Inbound TMA Tracks"}</span>
            <span className="font-mono text-[10px]">{tracks.length} active</span>
          </div>

          {tracks.map((track) => {
            const isSelected = selectedTrack?.callsign === track.callsign;
            return (
              <div
                key={track.callsign}
                onClick={() => {
                  soundEffects.playClick();
                  setSelectedTrack(isSelected ? null : track);
                }}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-xs"
                    : "border-border/60 bg-background/50 hover:bg-secondary/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-foreground">{track.callsign}</span>
                    <span className="text-[10px] text-muted-foreground">{track.aircraft}</span>
                  </div>
                  <span
                    className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold ${
                      track.status === "final"
                        ? "bg-status-ok/20 text-status-ok"
                        : track.status === "holding"
                        ? "bg-status-crit/20 text-status-crit"
                        : "bg-cyan/20 text-cyan"
                    }`}
                  >
                    {track.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-muted-foreground pt-0.5">
                  <div>
                    <span className="block text-[9px] text-muted-foreground/60">ALT</span>
                    <span className="text-foreground">{track.altitudeFt} ft</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-muted-foreground/60">SPD</span>
                    <span className="text-foreground">{track.speedKt} kt</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-muted-foreground/60">RWY</span>
                    <span className="text-primary font-bold">{track.assignedRunway}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
