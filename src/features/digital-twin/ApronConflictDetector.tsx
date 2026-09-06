/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, Plane } from "lucide-react";
import { useLocale } from "../../context/locale";
import { soundEffects } from "../../services/soundEffects";
import { notifyManager } from "../../utils/toast";

export interface ApronStandAssignment {
  standId: string;
  gate: string;
  flight: string;
  airline: string;
  aircraft: string;
  wingspanM: number;
  icaoCode: "C" | "D" | "E" | "F";
  status: "occupied" | "standby" | "conflict";
  conflictWith?: string;
  conflictReason?: string;
}

export const INITIAL_STAND_ASSIGNMENTS: ApronStandAssignment[] = [
  {
    standId: "S-304",
    gate: "Gate 304",
    flight: "MS778",
    airline: "EgyptAir",
    aircraft: "B787-9 Dreamliner",
    wingspanM: 60.1,
    icaoCode: "E",
    status: "occupied",
  },
  {
    standId: "S-305",
    gate: "Gate 305",
    flight: "SV302",
    airline: "Saudia",
    aircraft: "B777-300ER",
    wingspanM: 64.8,
    icaoCode: "E",
    status: "conflict",
    conflictWith: "S-306 (EK927)",
    conflictReason: "Adjacent Code E wingtip taxi clearance < 7.5m (ICAO Annex 14)",
  },
  {
    standId: "S-306",
    gate: "Gate 306",
    flight: "EK927",
    airline: "Emirates",
    aircraft: "A380-800",
    wingspanM: 79.8,
    icaoCode: "F",
    status: "conflict",
    conflictWith: "S-305 (SV302)",
    conflictReason: "Code F Super-Heavy requires empty buffer on adjacent Stand 305/307",
  },
  {
    standId: "S-307",
    gate: "Gate 307",
    flight: "LH582",
    airline: "Lufthansa",
    aircraft: "A320neo",
    wingspanM: 35.8,
    icaoCode: "C",
    status: "occupied",
  },
  {
    standId: "S-308",
    gate: "Gate 308",
    flight: "BA155",
    airline: "British Airways",
    aircraft: "A350-1000",
    wingspanM: 64.8,
    icaoCode: "E",
    status: "occupied",
  },
];

export function ApronConflictDetector() {
  const { language } = useLocale();
  const [stands, setStands] = useState<ApronStandAssignment[]>(INITIAL_STAND_ASSIGNMENTS);
  const [isResolved, setIsResolved] = useState(false);

  const conflicts = stands.filter((s) => s.status === "conflict");

  const handleResolveConflict = () => {
    soundEffects.playDispatch();
    setStands((prev) =>
      prev.map((stand) => {
        if (stand.standId === "S-306") {
          return {
            ...stand,
            gate: "Remote Stand R-14 (Apron 4)",
            status: "occupied",
            conflictWith: undefined,
            conflictReason: undefined,
          };
        }
        if (stand.standId === "S-305") {
          return {
            ...stand,
            status: "occupied",
            conflictWith: undefined,
            conflictReason: undefined,
          };
        }
        return stand;
      })
    );
    setIsResolved(true);
    notifyManager(
      language === "ar" ? "تم فض تعارض ساحة الطائرات" : "Apron Wingspan Conflict Resolved",
      language === "ar"
        ? "تم تحويل طائرة الإمارات A380 إلى الموقف البعيد R-14 مع تأمين مسافة الأمان ٧.٥ م"
        : "Emirates A380 re-assigned to Remote Stand R-14 with full 7.5m ICAO wingtip buffer.",
      "ok"
    );
  };

  return (
    <section
      aria-label={language === "ar" ? "نظام كشف تعارض أجنحة الطائرات بساحة الوقوف" : "Apron Wingspan Conflict Detector"}
      className="panel p-3.5 sm:p-4 rounded-2xl border border-white/10 bg-surface/80 backdrop-blur-md mb-3 transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`grid h-8 w-8 place-items-center rounded-xl border ${
              conflicts.length > 0 && !isResolved
                ? "border-status-crit/40 bg-status-crit/15 text-status-crit animate-pulse"
                : "border-status-ok/40 bg-status-ok/15 text-status-ok"
            }`}
          >
            {conflicts.length > 0 && !isResolved ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">
                {language === "ar" ? "كاشف تعارض أبعاد الأجنحة ومواقف الطائرات" : "Apron Stand Wingspan Clearance Monitor"}
              </h3>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-secondary text-muted-foreground uppercase">
                ICAO Annex 14
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {language === "ar"
                ? "مراقبة مسافة الأمان الدنيا بين أطراف الأجنحة (7.5 م) للطائرات العريضة بمبنى 3"
                : "Continuous monitoring of minimum 7.5m wingtip taxiway separation for Code E/F widebodies at Terminal 3."}
            </p>
          </div>
        </div>

        {/* Resolution Action Button */}
        {conflicts.length > 0 && !isResolved ? (
          <button
            type="button"
            onClick={handleResolveConflict}
            className="flex items-center gap-1.5 rounded-xl border border-status-crit/40 bg-status-crit/15 px-3.5 py-2 min-h-[44px] text-xs font-bold text-status-crit hover:bg-status-crit/25 transition-all active-spring cursor-pointer self-start sm:self-auto"
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{language === "ar" ? "إعادة توجيه إلى الموقف R-14 (فض التعارض)" : "Auto-Resolve: Divert to Stand R-14"}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-status-ok">
            <CheckCircle2 className="h-4 w-4" />
            <span>{language === "ar" ? "جميع المواقف متوافقة مع معايير ICAO" : "All Stands 100% Cleared"}</span>
          </div>
        )}
      </div>

      {/* Stand Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-3">
        {stands.map((stand) => {
          const hasConflict = stand.status === "conflict" && !isResolved;
          return (
            <div
              key={stand.standId}
              className={`rounded-xl border p-2.5 text-xs transition-all ${
                hasConflict
                  ? "border-status-crit/60 bg-status-crit/10 shadow-xs"
                  : "border-border/40 bg-background/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-foreground">{stand.gate}</span>
                <span
                  className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold ${
                    stand.icaoCode === "F"
                      ? "bg-magenta/15 text-magenta border border-magenta/30"
                      : stand.icaoCode === "E"
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-secondary text-muted-foreground border border-border/40"
                  }`}
                >
                  Code {stand.icaoCode}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-1 text-muted-foreground">
                <Plane className="h-3 w-3 shrink-0" />
                <span className="truncate font-semibold text-foreground">{stand.flight}</span>
                <span>&bull;</span>
                <span className="truncate text-[11px]">{stand.airline}</span>
              </div>
              <div className="mt-1 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                <span>{stand.aircraft.split(" ")[0]}</span>
                <span className={hasConflict ? "text-status-crit font-bold" : ""}>{stand.wingspanM}m</span>
              </div>
              {hasConflict && (
                <div className="mt-1.5 border-t border-status-crit/30 pt-1 text-[10px] font-semibold text-status-crit">
                  {stand.conflictReason?.split("(")[0]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
