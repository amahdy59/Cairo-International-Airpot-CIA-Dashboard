import { useState, useEffect, useRef, useCallback } from "react";
import {
  Rotate3d,
  Compass,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Plane,
} from "lucide-react";
import { useLocale } from "../../context/locale";
import { useSimulation } from "../../context/simulation";
import { soundEffects } from "../../services/soundEffects";

// 3D Point in airfield coordinates (X: West-East, Y: South-North, Z: Elevation)
interface Point3D {
  x: number;
  y: number;
  z: number;
}

// 2D Projected Point on screen
interface ProjectedPoint {
  x: number;
  y: number;
  depth: number;
}

// Camera Preset definitions
export type CameraPreset = "isometric" | "glidepath" | "terminal3" | "tower" | "topdown";

interface StandPin {
  id: string;
  name: string;
  pos: Point3D;
  aircraft: string;
  flight: string;
  status: string;
  tone: "ok" | "warn" | "crit" | "info";
}

const STAND_PINS: StandPin[] = [
  { id: "stand-305", name: "Gate 305 (T3)", pos: { x: 90, y: -20, z: 8 }, aircraft: "B787-9", flight: "MS778", status: "Turnaround 82%", tone: "ok" },
  { id: "stand-307", name: "Gate 307 (T3)", pos: { x: 130, y: -20, z: 8 }, aircraft: "B777-300ER", flight: "SV302", status: "Fuelling Delay +15m", tone: "warn" },
  { id: "stand-b03", name: "Gate B03 (T2)", pos: { x: -30, y: -50, z: 8 }, aircraft: "A350-900", flight: "AF551", status: "Boarding Complete", tone: "ok" },
  { id: "stand-a04", name: "Gate A04 (T1)", pos: { x: -160, y: -80, z: 8 }, aircraft: "A321neo", flight: "TK694", status: "Baggage Loading", tone: "info" },
  { id: "rwy-05c", name: "Runway 05C Threshold", pos: { x: 0, y: 160, z: 0 }, aircraft: "Active Runway", flight: "CAT II Active", status: "Friction Mu 0.52", tone: "ok" },
];

export function Airfield3DCanvas() {
  const { language } = useLocale();
  const { activeScenario, activeShiftWave } = useSimulation();

  // Camera Orbit State
  const [yawDeg, setYawDeg] = useState<number>(45); // 0 to 360 azimuth
  const [pitchDeg, setPitchDeg] = useState<number>(35); // 15 (flat) to 85 (top-down)
  const [zoom, setZoom] = useState<number>(1.1); // 0.6x to 2.5x
  const [activePreset, setActivePreset] = useState<CameraPreset>("isometric");
  const [selectedPin, setSelectedPin] = useState<StandPin | null>(null);
  const [hoveredPin, setHoveredPin] = useState<StandPin | null>(null);

  // Drag interaction refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, yaw: 45, pitch: 35 });
  const touchDistRef = useRef<number | null>(null);

  // Animated elements state
  const radarAngleRef = useRef(0);
  const taxiProgressRef = useRef(0);

  // Camera Presets
  const applyPreset = useCallback((preset: CameraPreset) => {
    soundEffects.playClick();
    setActivePreset(preset);
    switch (preset) {
      case "isometric":
        setYawDeg(45);
        setPitchDeg(35);
        setZoom(1.1);
        break;
      case "glidepath":
        setYawDeg(52);
        setPitchDeg(18);
        setZoom(1.5);
        break;
      case "terminal3":
        setYawDeg(25);
        setPitchDeg(42);
        setZoom(1.8);
        break;
      case "tower":
        setYawDeg(135);
        setPitchDeg(55);
        setZoom(1.3);
        break;
      case "topdown":
        setYawDeg(0);
        setPitchDeg(85);
        setZoom(1.0);
        break;
    }
  }, []);

  // 3D Matrix Projection
  const project = useCallback(
    (p: Point3D, width: number, height: number): ProjectedPoint => {
      const yawRad = (yawDeg * Math.PI) / 180;
      const pitchRad = (pitchDeg * Math.PI) / 180;

      // Rotate around Z axis (Yaw)
      const x1 = p.x * Math.cos(yawRad) - p.y * Math.sin(yawRad);
      const y1 = p.x * Math.sin(yawRad) + p.y * Math.cos(yawRad);
      const z1 = p.z;

      // Rotate around X axis (Pitch)
      const x2 = x1;
      const y2 = y1 * Math.sin(pitchRad) - z1 * Math.cos(pitchRad);
      const z2 = y1 * Math.cos(pitchRad) + z1 * Math.sin(pitchRad);

      // Perspective Scale
      const cameraDist = 650;
      const scale = ((cameraDist / (cameraDist + y2 * 0.4)) * zoom * width) / 600;

      return {
        x: width / 2 + x2 * scale,
        y: height / 2 + y2 * scale * 0.85,
        depth: z2,
      };
    },
    [yawDeg, pitchDeg, zoom]
  );

  // Mouse & Touch Drag Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      yaw: yawDeg,
      pitch: pitchDeg,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) {
      // Check Pin Hover
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let found: StandPin | null = null;
      for (const pin of STAND_PINS) {
        const proj = project(pin.pos, canvas.width, canvas.height);
        const dist = Math.hypot(proj.x - mouseX, proj.y - mouseY);
        if (dist < 18) {
          found = pin;
          break;
        }
      }
      setHoveredPin(found);
      return;
    }

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    const newYaw = (dragStartRef.current.yaw - dx * 0.5 + 360) % 360;
    const newPitch = Math.max(15, Math.min(85, dragStartRef.current.pitch + dy * 0.4));

    setYawDeg(newYaw);
    setPitchDeg(newPitch);
    setActivePreset("isometric"); // Reset preset highlight on manual drag
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((prev) => Math.max(0.6, Math.min(2.4, prev + delta)));
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (const pin of STAND_PINS) {
      const proj = project(pin.pos, canvas.width, canvas.height);
      const dist = Math.hypot(proj.x - mouseX, proj.y - mouseY);
      if (dist < 20) {
        soundEffects.playClick();
        setSelectedPin((prev) => (prev?.id === pin.id ? null : pin));
        return;
      }
    }
    setSelectedPin(null);
  };

  // Touch Handlers for Mobile Tablets
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        yaw: yawDeg,
        pitch: pitchDeg,
      };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDraggingRef.current) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      setYawDeg((dragStartRef.current.yaw - dx * 0.6 + 360) % 360);
      setPitchDeg(Math.max(15, Math.min(85, dragStartRef.current.pitch + dy * 0.4)));
    } else if (e.touches.length === 2 && touchDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = (dist - touchDistRef.current) * 0.005;
      setZoom((prev) => Math.max(0.6, Math.min(2.4, prev + delta)));
      touchDistRef.current = dist;
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    touchDistRef.current = null;
  };

  // Main 3D Render Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const draw = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      radarAngleRef.current = (radarAngleRef.current + delta * 120) % 360;
      taxiProgressRef.current = (taxiProgressRef.current + delta * 0.08) % 1;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Lighting & Background based on Shift Wave & Scenario
      const isNight = activeShiftWave === "night";
      const isSandstorm = activeScenario.id === "sandstorm";

      // Atmospheric Sky/Ground Canvas Gradient
      const groundGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (isSandstorm) {
        groundGrad.addColorStop(0, "#2c1c0e");
        groundGrad.addColorStop(1, "#1c1208");
      } else if (isNight) {
        groundGrad.addColorStop(0, "#07111e");
        groundGrad.addColorStop(1, "#03070d");
      } else {
        groundGrad.addColorStop(0, "#0b1928");
        groundGrad.addColorStop(1, "#060e17");
      }
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw Tarmac Apron Polygonal Base
      const tarmacCorners: Point3D[] = [
        { x: -280, y: -240, z: 0 },
        { x: 280, y: -240, z: 0 },
        { x: 280, y: 240, z: 0 },
        { x: -280, y: 240, z: 0 },
      ];
      ctx.beginPath();
      tarmacCorners.forEach((p, idx) => {
        const proj = project(p, width, height);
        if (idx === 0) ctx.moveTo(proj.x, proj.y);
        else ctx.lineTo(proj.x, proj.y);
      });
      ctx.closePath();
      ctx.fillStyle = isSandstorm ? "#23180f" : isNight ? "#0d1520" : "#131d2a";
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 1. Helper: Draw 3D Extruded Box (Terminals, Tower, Hangers)
      const drawBox = (
        x: number,
        y: number,
        w: number,
        h: number,
        elev: number,
        topColor: string,
        sideColor: string
      ) => {
        const b1 = project({ x: x - w / 2, y: y - h / 2, z: 0 }, width, height);
        const b2 = project({ x: x + w / 2, y: y - h / 2, z: 0 }, width, height);
        const b3 = project({ x: x + w / 2, y: y + h / 2, z: 0 }, width, height);
        const b4 = project({ x: x - w / 2, y: y + h / 2, z: 0 }, width, height);

        const t1 = project({ x: x - w / 2, y: y - h / 2, z: elev }, width, height);
        const t2 = project({ x: x + w / 2, y: y - h / 2, z: elev }, width, height);
        const t3 = project({ x: x + w / 2, y: y + h / 2, z: elev }, width, height);
        const t4 = project({ x: x - w / 2, y: y + h / 2, z: elev }, width, height);

        // Sides
        ctx.fillStyle = sideColor;
        // South Face
        ctx.beginPath();
        ctx.moveTo(b1.x, b1.y);
        ctx.lineTo(b2.x, b2.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.lineTo(t1.x, t1.y);
        ctx.closePath();
        ctx.fill();

        // East Face
        ctx.beginPath();
        ctx.moveTo(b2.x, b2.y);
        ctx.lineTo(b3.x, b3.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.closePath();
        ctx.fill();

        // West Face
        ctx.beginPath();
        ctx.moveTo(b4.x, b4.y);
        ctx.lineTo(b1.x, b1.y);
        ctx.lineTo(t1.x, t1.y);
        ctx.lineTo(t4.x, t4.y);
        ctx.closePath();
        ctx.fill();

        // Top Roof
        ctx.fillStyle = topColor;
        ctx.beginPath();
        ctx.moveTo(t1.x, t1.y);
        ctx.lineTo(t2.x, t2.y);
        ctx.lineTo(t3.x, t3.y);
        ctx.lineTo(t4.x, t4.y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.stroke();
      };

      // 2. Draw Runways (05L, 05C, 05R at Cairo Airport)
      const runways = [
        { name: "05L / 23R", x: -180, width: 28, len: 440 },
        { name: "05C / 23C", x: 0, width: 32, len: 440 },
        { name: "05R / 23L", x: 180, width: 28, len: 440 },
      ];

      runways.forEach((rwy) => {
        const p1 = project({ x: rwy.x - rwy.width / 2, y: -rwy.len / 2, z: 0 }, width, height);
        const p2 = project({ x: rwy.x + rwy.width / 2, y: -rwy.len / 2, z: 0 }, width, height);
        const p3 = project({ x: rwy.x + rwy.width / 2, y: rwy.len / 2, z: 0 }, width, height);
        const p4 = project({ x: rwy.x - rwy.width / 2, y: rwy.len / 2, z: 0 }, width, height);

        // Asphalt Tarmac
        ctx.fillStyle = isNight ? "#111827" : "#1e293b";
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(100, 116, 139, 0.4)";
        ctx.stroke();

        // Centerline Dashed Runway Marking
        ctx.setLineDash([8, 8]);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        const c1 = project({ x: rwy.x, y: -rwy.len / 2 + 20, z: 0 }, width, height);
        const c2 = project({ x: rwy.x, y: rwy.len / 2 - 20, z: 0 }, width, height);
        ctx.beginPath();
        ctx.moveTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Runway Edge Lights (Green thresholds & white edge lights)
        if (isNight || isSandstorm) {
          const edgeP1 = project({ x: rwy.x - rwy.width / 2, y: rwy.len / 2, z: 1 }, width, height);
          const edgeP2 = project({ x: rwy.x + rwy.width / 2, y: rwy.len / 2, z: 1 }, width, height);
          ctx.fillStyle = "#10b981";
          ctx.beginPath();
          ctx.arc(edgeP1.x, edgeP1.y, 2, 0, Math.PI * 2);
          ctx.arc(edgeP2.x, edgeP2.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 3. Draw 3D Buildings
      // Terminal 1
      drawBox(-160, -90, 70, 50, 16, "#334155", "#1e293b");
      // Terminal 2
      drawBox(-30, -70, 80, 55, 20, "#0284c7", "#0369a1");
      // Terminal 3 (Flagship Pier F & D)
      drawBox(110, -50, 110, 65, 26, "#0ea5e9", "#0284c7");
      // T3 Pier Concourse Extension
      drawBox(110, 0, 35, 60, 18, "#0284c7", "#0369a1");

      // Cairo Air Traffic Control Tower (92m iconic spire)
      const towerX = -90;
      const towerY = 10;
      drawBox(towerX, towerY, 14, 14, 58, "#64748b", "#475569");
      // Tower Cab Glass Top
      drawBox(towerX, towerY, 18, 18, 66, "rgba(56, 189, 248, 0.8)", "#0284c7");

      // Rotating Secondary Surveillance Radar on Tower
      const towerTopProj = project({ x: towerX, y: towerY, z: 66 }, width, height);
      const radRad = (radarAngleRef.current * Math.PI) / 180;
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(towerTopProj.x, towerTopProj.y);
      ctx.lineTo(
        towerTopProj.x + Math.cos(radRad) * 14 * zoom,
        towerTopProj.y + Math.sin(radRad) * 6 * zoom
      );
      ctx.stroke();

      // 4. Draw 3D Parked Aircraft at Stands
      const parkedAircraft = [
        { x: 90, y: -20, heading: 90, type: "B787-9", color: "#e2e8f0" },
        { x: 130, y: -20, heading: 90, type: "B777", color: "#cbd5e1" },
        { x: -30, y: -50, heading: 180, type: "A350", color: "#e2e8f0" },
        { x: -160, y: -80, heading: 0, type: "A321", color: "#cbd5e1" },
      ];

      parkedAircraft.forEach((ac) => {
        const acP = project({ x: ac.x, y: ac.y, z: 2 }, width, height);
        // Aircraft Fuselage & Wings (Clean stylized 3D representation)
        ctx.fillStyle = ac.color;
        ctx.beginPath();
        ctx.arc(acP.x, acP.y, 6 * zoom, 0, Math.PI * 2);
        ctx.fill();

        // Wings
        ctx.strokeStyle = ac.color;
        ctx.lineWidth = 3 * zoom;
        ctx.beginPath();
        ctx.moveTo(acP.x - 12 * zoom, acP.y);
        ctx.lineTo(acP.x + 12 * zoom, acP.y);
        ctx.stroke();

        // Strobe anti-collision red beacon
        if (Math.floor(time / 500) % 2 === 0) {
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(acP.x, acP.y, 2 * zoom, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 5. Taxiing Aircraft Animation (Moving along Taxiway Echo to 05C)
      const taxiX = 0;
      const taxiY = -180 + taxiProgressRef.current * 320;
      const taxiP = project({ x: taxiX, y: taxiY, z: 3 }, width, height);
      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(taxiP.x, taxiP.y, 7 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5 * zoom;
      ctx.beginPath();
      ctx.moveTo(taxiP.x - 10 * zoom, taxiP.y);
      ctx.lineTo(taxiP.x + 10 * zoom, taxiP.y);
      ctx.stroke();

      // 6. Draw Interactive Stand / Hotspot Pins
      STAND_PINS.forEach((pin) => {
        const proj = project(pin.pos, width, height);
        const isSelected = selectedPin?.id === pin.id;
        const isHovered = hoveredPin?.id === pin.id;

        // Pin stem
        const baseProj = project({ ...pin.pos, z: 0 }, width, height);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(baseProj.x, baseProj.y);
        ctx.lineTo(proj.x, proj.y);
        ctx.stroke();

        // Pin Head
        const pinColor =
          pin.tone === "crit" ? "#f43f5e" : pin.tone === "warn" ? "#f59e0b" : "#10b981";

        ctx.fillStyle = pinColor;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, isSelected ? 8 : isHovered ? 7 : 5, 0, Math.PI * 2);
        ctx.fill();

        if (isSelected || isHovered) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Small hovering tooltip badge
          ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
          ctx.roundRect(proj.x - 40, proj.y - 28, 80, 18, 4);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = "9px monospace";
          ctx.textAlign = "center";
          ctx.fillText(pin.name, proj.x, proj.y - 16);
          ctx.textAlign = "start";
        }
      });

      // Sandstorm atmospheric dust effect
      if (isSandstorm) {
        ctx.fillStyle = "rgba(180, 120, 50, 0.18)";
        ctx.fillRect(0, 0, width, height);
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [yawDeg, pitchDeg, zoom, project, activeShiftWave, activeScenario, selectedPin, hoveredPin]);

  return (
    <div className="panel p-3.5 sm:p-4 rounded-2xl border border-white/10 bg-card flex flex-col gap-3">
      {/* 3D Viewport Controls & Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/25">
            <Rotate3d className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <span>{language === "ar" ? "المجسم ثلاثي الأبعاد لساحات ومباني المطار (3D Digital Twin)" : "Cairo Airfield 3D Isometric Digital Twin"}</span>
              <span className="px-1.5 py-0.2 rounded bg-primary/20 text-primary font-mono text-[10px] font-bold">
                60 FPS • 360° ORBIT
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              {language === "ar"
                ? "اسحب بالماوس أو اللمس لتدوير الساحات ٣٦٠ درجة. اختر زوايا الرؤية واستكشف البوابات والمدارج."
                : "Click and drag to rotate 360°. Pinch or scroll to zoom. Click stand pins for real-time telemetry."}
            </p>
          </div>
        </div>

        {/* Camera Preset Quick Buttons */}
        <div className="flex flex-wrap items-center gap-1 bg-secondary/40 p-1 rounded-xl border border-border/40">
          <button
            type="button"
            onClick={() => applyPreset("isometric")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activePreset === "isometric" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {language === "ar" ? "أيزومتري" : "Isometric"}
          </button>
          <button
            type="button"
            onClick={() => applyPreset("terminal3")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activePreset === "terminal3" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {language === "ar" ? "مبنى ٣" : "T3 Pier"}
          </button>
          <button
            type="button"
            onClick={() => applyPreset("glidepath")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activePreset === "glidepath" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {language === "ar" ? "اقتراب 05C" : "RWY 05C"}
          </button>
          <button
            type="button"
            onClick={() => applyPreset("tower")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activePreset === "tower" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {language === "ar" ? "البرج (92م)" : "Tower"}
          </button>
          <button
            type="button"
            onClick={() => applyPreset("topdown")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activePreset === "topdown" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {language === "ar" ? "رأسي" : "Ortho"}
          </button>
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div className="relative w-full h-[380px] sm:h-[440px] rounded-2xl bg-black/50 border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center select-none">
        <canvas
          ref={canvasRef}
          width={800}
          height={440}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onClick={handleCanvasClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full h-full block cursor-grab active:cursor-grabbing touch-none"
        />

        {/* HUD Overlay: Azimuth Heading & Tilt Indicator */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/70 border border-white/15 backdrop-blur-md text-[11px] font-mono text-cyan shadow-sm">
            <Compass className="h-3.5 w-3.5 text-primary" style={{ transform: `rotate(${yawDeg}deg)` }} />
            <span>HDG {Math.round(yawDeg)}°</span>
            <span className="text-muted-foreground/60">•</span>
            <span>TILT {Math.round(pitchDeg)}°</span>
            <span className="text-muted-foreground/60">•</span>
            <span>ZOOM {(zoom).toFixed(1)}x</span>
          </div>
        </div>

        {/* Zoom & Reset Floating Controls */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setZoom((prev) => Math.min(2.4, prev + 0.15));
            }}
            className="grid h-8 w-8 place-items-center rounded-xl bg-black/60 border border-white/15 text-foreground hover:bg-black/80 hover:text-primary transition-colors cursor-pointer"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              setZoom((prev) => Math.max(0.6, prev - 0.15));
            }}
            className="grid h-8 w-8 place-items-center rounded-xl bg-black/60 border border-white/15 text-foreground hover:bg-black/80 hover:text-primary transition-colors cursor-pointer"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => applyPreset("isometric")}
            className="grid h-8 w-8 place-items-center rounded-xl bg-black/60 border border-white/15 text-foreground hover:bg-black/80 hover:text-primary transition-colors cursor-pointer"
            title="Reset to Isometric"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Selected Stand Telemetry Floating Card */}
        {selectedPin && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-80 p-3.5 rounded-2xl border border-white/20 bg-background/95 backdrop-blur-xl shadow-2xl flex flex-col gap-2 animate-scale-in text-xs z-10">
            <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Plane className="h-3.5 w-3.5" />
                </span>
                <div>
                  <span className="font-bold text-sm text-foreground block">{selectedPin.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{selectedPin.aircraft} • {selectedPin.flight}</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                selectedPin.tone === "warn" ? "bg-status-warn/20 text-status-warn" : "bg-status-ok/20 text-status-ok"
              }`}>
                {selectedPin.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-muted-foreground">
              <div>
                <span className="block text-[9px] text-muted-foreground/70 uppercase">Coord</span>
                <span className="text-foreground">X: {selectedPin.pos.x}m • Y: {selectedPin.pos.y}m</span>
              </div>
              <div>
                <span className="block text-[9px] text-muted-foreground/70 uppercase">Airfield State</span>
                <span className="text-primary font-bold">Active Telemetry</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
