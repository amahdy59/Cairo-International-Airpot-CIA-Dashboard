import { useState, useMemo } from "react";
import { Flame, Clock } from "lucide-react";
import { useLocale } from "../../context/locale";
import { useSimulation } from "../../context/simulation";
import { TerminalId } from "../../data";
import { soundEffects } from "../../services/soundEffects";

interface HeatZone {
  id: string;
  nameEn: string;
  nameAr: string;
  terminal: TerminalId;
  stage: "checkin" | "security" | "passport" | "gates" | "baggage";
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  radius: number;
  baselineLoad: number; // 0-100%
  baselineWaitMin: number;
}

const HEAT_ZONES: HeatZone[] = [
  // Terminal 1 (Classic Hub)
  { id: "t1-chk", nameEn: "T1 Hall 1 Check-In", nameAr: "مبنى ١ - كاونترات إنهاء الإجراءات", terminal: "T1", stage: "checkin", x: 18, y: 35, radius: 24, baselineLoad: 48, baselineWaitMin: 12 },
  { id: "t1-sec", nameEn: "T1 Security Concourse A", nameAr: "مبنى ١ - التفتيش الأمني (أ)", terminal: "T1", stage: "security", x: 26, y: 45, radius: 20, baselineLoad: 52, baselineWaitMin: 14 },
  { id: "t1-pas", nameEn: "T1 Passport Control", nameAr: "مبنى ١ - الجوازات والهجرة", terminal: "T1", stage: "passport", x: 32, y: 55, radius: 22, baselineLoad: 45, baselineWaitMin: 10 },
  { id: "t1-gat", nameEn: "T1 Gates A1-A12", nameAr: "مبنى ١ - بوابات المغادرة A1-A12", terminal: "T1", stage: "gates", x: 38, y: 68, radius: 26, baselineLoad: 58, baselineWaitMin: 8 },

  // Terminal 2 (SkyTeam / Saudia / European Hub)
  { id: "t2-chk", nameEn: "T2 Departures Hall", nameAr: "مبنى ٢ - صالة المغادرة الرئيسية", terminal: "T2", stage: "checkin", x: 50, y: 25, radius: 26, baselineLoad: 62, baselineWaitMin: 16 },
  { id: "t2-sec", nameEn: "T2 Central Security", nameAr: "مبنى ٢ - التفتيش الأمني المركزي", terminal: "T2", stage: "security", x: 56, y: 40, radius: 22, baselineLoad: 68, baselineWaitMin: 18 },
  { id: "t2-pas", nameEn: "T2 Immigration Pier B", nameAr: "مبنى ٢ - مراقبة الجوازات (رصيف B)", terminal: "T2", stage: "passport", x: 62, y: 55, radius: 22, baselineLoad: 55, baselineWaitMin: 12 },
  { id: "t2-bag", nameEn: "T2 Baggage Reclaim 1-6", nameAr: "مبنى ٢ - سيور الأمتعة ١-٦", terminal: "T2", stage: "baggage", x: 48, y: 75, radius: 28, baselineLoad: 54, baselineWaitMin: 18 },

  // Terminal 3 (EgyptAir & Star Alliance Flagship Hub)
  { id: "t3-chk", nameEn: "T3 Flagship Check-in Rows 1-8", nameAr: "مبنى ٣ - صفوف كاونترات ١-٨", terminal: "T3", stage: "checkin", x: 80, y: 28, radius: 30, baselineLoad: 72, baselineWaitMin: 18 },
  { id: "t3-sec", nameEn: "T3 Biometric E-Gate Security", nameAr: "مبنى ٣ - البوابات الإلكترونية والأمن", terminal: "T3", stage: "security", x: 76, y: 46, radius: 24, baselineLoad: 65, baselineWaitMin: 15 },
  { id: "t3-pas", nameEn: "T3 Passport Clearance Hall", nameAr: "مبنى ٣ - صالة الجوازات الكبرى", terminal: "T3", stage: "passport", x: 82, y: 62, radius: 25, baselineLoad: 60, baselineWaitMin: 14 },
  { id: "t3-gat", nameEn: "T3 Widebody Concourse F/D", nameAr: "مبنى ٣ - رصيف الطائرات العريضة F/D", terminal: "T3", stage: "gates", x: 86, y: 78, radius: 32, baselineLoad: 76, baselineWaitMin: 10 },
  { id: "t3-bag", nameEn: "T3 Automated BHS Carousels 1-10", nameAr: "مبنى ٣ - صالة الأمتعة الآلية ١-١٠", terminal: "T3", stage: "baggage", x: 72, y: 82, radius: 30, baselineLoad: 68, baselineWaitMin: 22 },
];

interface ComputedHeatZone extends HeatZone {
  computedLoad: number;
  computedWaitMin: number;
  color: string;
  glowColor: string;
  toneBadge: string;
}

export function TerminalHeatmapOverlay() {
  const { language } = useLocale();
  const { activeTerminal, activeScenario, activeShiftWave } = useSimulation();
  const [selectedZone, setSelectedZone] = useState<ComputedHeatZone | null>(null);

  // Compute live intensity per zone based on active scenario and wave
  const computedZones = useMemo(() => {
    return HEAT_ZONES.map((zone) => {
      let load = zone.baselineLoad;
      let waitMin = zone.baselineWaitMin;

      // Scenario modulation
      if (activeScenario.id === "baggage-failure") {
        if (zone.terminal === "T3" && (zone.stage === "baggage" || zone.stage === "checkin")) {
          load = Math.min(99, load + 32);
          waitMin = Math.round(waitMin * 2.4);
        }
      } else if (activeScenario.id === "sandstorm") {
        if (zone.stage === "gates") {
          load = Math.min(98, load + 28);
          waitMin = Math.round(waitMin * 1.8);
        }
      }

      // Shift wave modulation
      if (activeShiftWave === "morning") {
        load = Math.min(100, Math.round(load * 1.15));
        waitMin = Math.round(waitMin * 1.2);
      } else if (activeShiftWave === "midday") {
        load = Math.min(100, Math.round(load * 1.25));
        waitMin = Math.round(waitMin * 1.3);
      } else if (activeShiftWave === "night") {
        load = Math.max(20, Math.round(load * 0.6));
        waitMin = Math.max(4, Math.round(waitMin * 0.6));
      }

      // Heat color gradient based on load percentage
      let color = "rgba(16, 185, 129, 0.45)"; // green
      let glowColor = "rgba(16, 185, 129, 0.25)";
      let toneBadge = "bg-status-ok/20 text-status-ok";

      if (load >= 85) {
        color = "rgba(244, 63, 94, 0.75)"; // red
        glowColor = "rgba(244, 63, 94, 0.4)";
        toneBadge = "bg-status-crit/20 text-status-crit";
      } else if (load >= 65) {
        color = "rgba(245, 158, 11, 0.65)"; // amber
        glowColor = "rgba(245, 158, 11, 0.35)";
        toneBadge = "bg-status-warn/20 text-status-warn";
      } else if (load >= 50) {
        color = "rgba(34, 211, 238, 0.55)"; // cyan
        glowColor = "rgba(34, 211, 238, 0.25)";
        toneBadge = "bg-cyan/20 text-cyan";
      }

      return {
        ...zone,
        computedLoad: load,
        computedWaitMin: waitMin,
        color,
        glowColor,
        toneBadge,
      };
    }).filter((zone) => activeTerminal === "ALL" || zone.terminal === activeTerminal);
  }, [activeTerminal, activeScenario, activeShiftWave]);

  return (
    <div className="panel p-3.5 sm:p-4 rounded-2xl border border-white/10 bg-card flex flex-col gap-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-cyan/15 text-cyan border border-cyan/30">
            <Flame className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {language === "ar" ? "خريطة الكثافة والازدحام الحراري داخل المباني" : "Terminal Floorplan Passenger Density Heatmap"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {language === "ar"
                ? "مراقبة الاختناقات وكثافة المسافرين في كاونترات المغادرة، الجوازات، وسيور الأمتعة"
                : "Real-time concourse congestion across check-in halls, security checkpoints, and baggage carousels."}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-status-ok" /> &lt;50%
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-cyan" /> 50-65%
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-status-warn" /> 65-85%
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-status-crit" /> &gt;85%
          </span>
        </div>
      </div>

      {/* Interactive Floorplan Heatmap Container */}
      <div className="relative w-full h-[280px] sm:h-[320px] rounded-2xl bg-secondary/30 border border-border/60 overflow-hidden shadow-inner flex items-center justify-center">
        {/* Terminal Concourse Architectural Background Outlines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* T1 Concourse */}
          <rect x="10" y="25" width="30" height="55" rx="3" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2,2" />
          <text x="12" y="32" className="text-[3px] font-mono fill-current font-bold">TERMINAL 1</text>

          {/* T2 Concourse */}
          <polygon points="45,15 70,15 65,85 42,85" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2,2" />
          <text x="47" y="22" className="text-[3px] font-mono fill-current font-bold">TERMINAL 2</text>

          {/* T3 Concourse */}
          <polygon points="72,20 95,20 92,90 70,90" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2,2" />
          <text x="74" y="27" className="text-[3px] font-mono fill-current font-bold">TERMINAL 3</text>
        </svg>

        {/* Heatmap Nodes */}
        {computedZones.map((zone) => {
          const isSelected = selectedZone?.id === zone.id;
          return (
            <div
              key={zone.id}
              onClick={() => {
                soundEffects.playClick();
                setSelectedZone(isSelected ? null : zone);
              }}
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                width: `${zone.radius * 2}px`,
                height: `${zone.radius * 2}px`,
                transform: "translate(-50%, -50%)",
                background: `radial-gradient(circle, ${zone.color} 0%, ${zone.glowColor} 50%, transparent 75%)`,
              }}
              className="absolute rounded-full cursor-pointer transition-all duration-500 hover:scale-125 flex items-center justify-center animate-pulse"
              title={`${zone.nameEn}: ${zone.computedLoad}% load, ${zone.computedWaitMin}m wait`}
            >
              <div
                className={`h-4 w-4 rounded-full flex items-center justify-center text-[8px] font-mono font-bold text-white shadow-md transition-transform ${
                  isSelected ? "scale-150 ring-2 ring-white" : ""
                }`}
                style={{ backgroundColor: zone.color }}
              >
                {zone.computedLoad}
              </div>
            </div>
          );
        })}

        {/* Selected Zone Popover Card */}
        {selectedZone && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-72 p-3 rounded-xl border border-white/20 bg-background/95 backdrop-blur-md shadow-xl flex flex-col gap-1.5 animate-scale-in text-xs z-10">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">
                {language === "ar" ? selectedZone.nameAr : selectedZone.nameEn}
              </span>
              <span className={`px-1.5 py-0.2 rounded font-mono text-[10px] font-bold ${
                selectedZone.computedLoad >= 85 ? "bg-status-crit/20 text-status-crit" : "bg-cyan/20 text-cyan"
              }`}>
                {selectedZone.computedLoad}% LOAD
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-muted-foreground pt-1">
              <div>
                <span className="block text-[9px] text-muted-foreground/70 uppercase">Est. Wait</span>
                <span className="font-bold text-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3 text-primary" /> {selectedZone.computedWaitMin} min
                </span>
              </div>
              <div>
                <span className="block text-[9px] text-muted-foreground/70 uppercase">Action</span>
                <span className="font-bold text-primary">
                  {selectedZone.computedLoad >= 80 ? "Open +2 Lanes" : "Nominal Flow"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
