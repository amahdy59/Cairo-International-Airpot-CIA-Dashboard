import { memo, useState, useMemo } from 'react';
import { Users, Activity, Clock3, AlertTriangle, Gauge, RadioTower, DoorOpen, Search, X, Download } from 'lucide-react';
import { localize, toneCssVar } from '../../utils/helpers';
import { useLocale } from '../../context/locale';
import { useSimulation } from '../../context/simulation';
import { exportToCsv } from '../../utils/exportCsv';
import { FlightRow, Tone, shiftWaves, InfluxForecastPoint, TerminalId } from '../../data';
import { MetricCard, ProgressBar, SectionPanel, Sparkline, StatusPill } from '../../components/command-center/MetricWidgets';
import { AcdmMilestones } from './AcdmMilestones';
import { CairoRadarScope } from '../../components/command-center/CairoRadarScope';

function Legend({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 font-medium">
      {dashed ? (
        <span className="flex items-center gap-0.5" aria-hidden="true">
          <span className={`h-0.5 w-1.5 rounded-full ${color}`} />
          <span className={`h-0.5 w-1.5 rounded-full ${color}`} />
          <span className={`h-0.5 w-1.5 rounded-full ${color}`} />
        </span>
      ) : (
        <span className={`h-1 w-4 rounded-full ${color}`} aria-hidden="true" />
      )}
      {label}
    </span>
  );
}


function DigitalOperationalGrid() {
  return (
    <section className="grid gap-3 lg:gap-4 md:grid-cols-2 md:items-start" aria-label="Digital twin operational analytics">
      <div className="grid gap-3 lg:gap-4">
        <PassengerInfluxForecast />
        <GateWaitChart />
      </div>
      <div className="grid gap-3 lg:gap-4">
        <AlertsPanel />
      </div>
    </section>
  );
}

function PassengerInfluxForecast() {
  const { language } = useLocale();
  const { reactiveInfluxForecast, activeTerminal } = useSimulation();

  return (
    <SectionPanel
      title={localize({ en: "Passenger influx forecast", ar: "توقع تدفق الركاب" }, language)}
      action={
        activeTerminal !== "ALL" ? (
          <StatusPill tone="info">{activeTerminal}</StatusPill>
        ) : undefined
      }
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {localize({ en: "Forecasted trend of passenger flow over the next 4 hours.", ar: "الاتجاه المتوقع لتدفق الركاب خلال الـ 4 ساعات القادمة." }, language)}
      </p>
      <ForecastLineChart data={reactiveInfluxForecast} />
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <Legend color="bg-cyan" label={localize({ en: "Current trajectory", ar: "المسار الحالي" }, language)} />
        <Legend color="bg-status-warn" dashed label={localize({ en: "Forecast", ar: "التوقع" }, language)} />
      </div>
    </SectionPanel>
  );
}

const ForecastLineChart = memo(function ForecastLineChart({ data }: { data: InfluxForecastPoint[] }) {
  const values = data.flatMap((row) => [row.current, row.forecast]);
  const min = Math.max(0, Math.min(...values) - 100);
  const max = Math.max(...values) + 100;
  const span = max - min || 1;
  const width = 420;
  const height = 150;
  
  const getPoint = (value: number, index: number): [number, number] => {
    const x = 18 + (index / (data.length - 1)) * (width - 36);
    const y = height - 18 - ((value - min) / span) * (height - 38);
    return [x, y];
  };

  const createSmoothPath = (coords: [number, number][]) => {
    if (coords.length === 0) return "";
    let d = `M ${coords[0][0]},${coords[0][1]}`;
    for (let i = 1; i < coords.length; i++) {
      const p1 = coords[i - 1];
      const p2 = coords[i];
      const cpX = (p1[0] + p2[0]) / 2;
      d += ` C ${cpX},${p1[1]} ${cpX},${p2[1]} ${p2[0]},${p2[1]}`;
    }
    return d;
  };

  const currentCoords = data.map((row, index) => getPoint(row.current, index));
  const forecastCoords = data.map((row, index) => getPoint(row.forecast, index));
  
  const currentPath = createSmoothPath(currentCoords);
  const forecastPath = createSmoothPath(forecastCoords);
  
  const areaPath = currentCoords.length > 0
    ? `${currentPath} L ${currentCoords[currentCoords.length - 1][0]},${height - 18} L ${currentCoords[0][0]},${height - 18} Z`
    : "";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full overflow-visible" role="img" aria-label={`Passenger influx forecast: current trajectory peaks at ${Math.max(...data.map(r => r.current)).toLocaleString()} passengers, with forecasted peak of ${Math.max(...data.map(r => r.forecast)).toLocaleString()} passengers.`}>
      <defs>
        <linearGradient id="forecast-cyan-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {[0, 1, 2].map((line) => (
        <line key={line} x1="18" x2={width - 18} y1={28 + line * 42} y2={28 + line * 42} stroke="var(--border)" strokeOpacity="0.55" strokeDasharray={line > 0 ? "4 4" : "none"} />
      ))}
      <path d={areaPath} fill="url(#forecast-cyan-grad)" />
      <path d={currentPath} fill="none" stroke="var(--cyan)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={forecastPath} fill="none" stroke="var(--status-warn)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6" />
      
      {/* Current Points - Dots */}
      {currentCoords.map((coord, index) => (
        <circle key={`curr-${index}`} cx={coord[0]} cy={coord[1]} r="4" fill="var(--background)" stroke="var(--cyan)" strokeWidth="2" />
      ))}
      
      {/* Forecast Points - Dots */}
      {forecastCoords.map((coord, index) => (
        <circle key={`fore-${index}`} cx={coord[0]} cy={coord[1]} r="4" fill="var(--background)" stroke="var(--status-warn)" strokeWidth="2" />
      ))}
      
      {/* X Axis Labels */}
      {data.map((row, index) => (
        <text key={row.time} x={currentCoords[index][0]} y={height - 2} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" className="font-mono">
          {row.time}
        </text>
      ))}
    </svg>
  );
});

function GateWaitChart() {
  const { language } = useLocale();
  const { reactiveGateWaits, activeTerminal } = useSimulation();

  const maxWait = Math.max(30, ...reactiveGateWaits.map((g) => g.wait));

  return (
    <SectionPanel
      title={localize({ en: "Average wait time per gate", ar: "متوسط الانتظار لكل بوابة" }, language)}
      action={
        <StatusPill tone={reactiveGateWaits.some((g) => g.tone === "crit" || g.tone === "high") ? "crit" : "warn"}>
          {activeTerminal !== "ALL"
            ? `${activeTerminal} (${reactiveGateWaits.length} ${localize({ en: "gates", ar: "بوابة" }, language)})`
            : localize({ en: "Monitored gates", ar: "البوابات المراقبة" }, language)}
        </StatusPill>
      }
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {localize({ en: "Current wait times across active gates.", ar: "أوقات الانتظار الحالية عبر البوابات النشطة." }, language)}
      </p>
      <div className="grid gap-3">
        {reactiveGateWaits.map((row) => (
          <div key={row.gate} className="grid grid-cols-[56px_minmax(0,1fr)_58px] items-center gap-3">
            <span className="font-mono text-sm font-semibold">{row.gate}</span>
            <ProgressBar value={row.wait} max={maxWait} color={toneCssVar(row.tone)} />
            <span className="justify-self-end font-mono text-sm text-muted-foreground">{row.wait}m</span>
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}

function AlertsPanel() {
  const { language } = useLocale();
  const warnings = [
    { icon: Gauge, title: { en: "Threshold warning", ar: "تحذير حد تشغيلي" }, detail: { en: "Deploy 3 additional screening staff to T2 security immediately.", ar: "قم بتوجيه 3 موظفي فحص إضافيين لأمن مبنى 2 فوراً." }, tone: "warn" as Tone },
    { icon: RadioTower, title: { en: "Ground crew buffer", ar: "احتياطي الطاقم الأرضي" }, detail: { en: "Hold floaters at T3 passport control for incoming wave.", ar: "أبق الدعم المتحرك متمركزاً قرب جوازات مبنى 3 للموجة القادمة." }, tone: "ok" as Tone },
    { icon: DoorOpen, title: { en: "Open counter recommendation", ar: "توصية فتح كاونتر" }, detail: { en: "Open two counters before the +2h forecast peak.", ar: "افتح كاونترين قبل ذروة التوقع بعد ساعتين." }, tone: "info" as Tone },
  ];
  return (
    <SectionPanel title={localize({ en: "Alerts & Recommendations", ar: "التنبيهات والتوصيات" }, language)} action={<StatusPill tone="info">AI</StatusPill>}>
      <div className="grid gap-3">
        {warnings.map((warning) => {
          const Icon = warning.icon;
          return (
            <article key={warning.title.en} className="panel-inner flex items-start gap-3 p-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border bg-background/60">
                <Icon aria-hidden="true" className="h-4 w-4" style={{ color: toneCssVar(warning.tone) }} />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{localize(warning.title, language)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{localize(warning.detail, language)}</p>
              </div>
            </article>
          );
        })}
      </div>
    </SectionPanel>
  );
}

function ShiftWaveSelector() {
  const { language } = useLocale();
  const { activeShiftWave, setActiveShiftWave } = useSimulation();

  return (
    <div
      role="radiogroup"
      aria-label={localize({ en: "Operational Shift Waves", ar: "نوبات العمل التشغيلية" }, language)}
      className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl border border-border/80 bg-secondary/20"
    >
      <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-muted-foreground me-1">
        <Clock3 className="h-3.5 w-3.5 text-primary" />
        <span className="hidden sm:inline">{localize({ en: "Shift Wave:", ar: "فترة النوبة:" }, language)}</span>
      </div>
      {shiftWaves.map((wave) => {
        const isSelected = activeShiftWave === wave.id;
        return (
          <button
            key={wave.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => setActiveShiftWave(wave.id)}
            className={`min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all duration-200 active:scale-95 cursor-pointer ${
              isSelected
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "bg-background/60 text-muted-foreground hover:bg-background hover:text-foreground"
            }`}
            title={localize(wave.description, language)}
          >
            <span>{localize(wave.label, language)}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {wave.window}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function TerminalFilterSelector() {
  const { language } = useLocale();
  const { activeTerminal, setActiveTerminal } = useSimulation();

  const terminals: Array<{ id: "ALL" | TerminalId; label: { en: string; ar: string } }> = [
    { id: "ALL", label: { en: "All Terminals", ar: "جميع المباني" } },
    { id: "T1", label: { en: "Terminal 1", ar: "مبنى ١" } },
    { id: "T2", label: { en: "Terminal 2", ar: "مبنى ٢" } },
    { id: "T3", label: { en: "Terminal 3", ar: "مبنى ٣" } },
  ];

  return (
    <div
      role="radiogroup"
      aria-label={localize({ en: "Terminal Filter", ar: "تصفية مبنى الركاب" }, language)}
      className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl border border-border/80 bg-secondary/20"
    >
      <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-muted-foreground me-1">
        <DoorOpen className="h-3.5 w-3.5 text-primary" />
        <span className="hidden sm:inline">{localize({ en: "Terminal:", ar: "المبنى:" }, language)}</span>
      </div>
      {terminals.map((t) => {
        const isSelected = activeTerminal === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => setActiveTerminal(t.id)}
            className={`min-h-[44px] flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-all duration-200 active:scale-95 cursor-pointer ${
              isSelected
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "bg-background/60 text-muted-foreground hover:bg-background hover:text-foreground"
            }`}
          >
            <span>{localize(t.label, language)}</span>
          </button>
        );
      })}
    </div>
  );
}

function OperationsView() {
  const { tr, language } = useLocale();
  const {
    activeShiftWave,
    activeTerminal,
    activeScenario,
    isDrillActive,
    reactiveDepartures,
    reactiveArrivals,
  } = useSimulation();

  // Metrics dynamic to activeShiftWave & activeTerminal
  const shiftMetrics = useMemo(() => {
    const scale = activeTerminal === "T3" ? 0.48 : activeTerminal === "T2" ? 0.34 : activeTerminal === "T1" ? 0.18 : 1.0;

    switch (activeShiftWave) {
      case "morning":
        return {
          passengers: Math.round(28640 * scale).toLocaleString(),
          paxHint: localize({ en: `Wave benchmark ${Math.round(32 * scale)}k`, ar: `مستهدف النوبة ${Math.round(32 * scale)} ألف` }, language),
          paxDelta: localize({ en: "+2.4% vs plan", ar: "+٢.٤٪ عن الخطة" }, language),
          movements: Math.round(148 * scale).toString(),
          moveUnit: `/ ${Math.round(195 * scale)}`,
          moveHint: localize({ en: `${Math.round(140 * scale)} average`, ar: `المتوسط ${Math.round(140 * scale)}` }, language),
        };
      case "midday":
        return {
          passengers: Math.round(37120 * scale).toLocaleString(),
          paxHint: localize({ en: `Wave benchmark ${Math.round(38 * scale)}k`, ar: `مستهدف النوبة ${Math.round(38 * scale)} ألف` }, language),
          paxDelta: localize({ en: "+5.1% vs plan", ar: "+٥.١٪ عن الخطة" }, language),
          movements: Math.round(194 * scale).toString(),
          moveUnit: `/ ${Math.round(240 * scale)}`,
          moveHint: localize({ en: `${Math.round(180 * scale)} average`, ar: `المتوسط ${Math.round(180 * scale)}` }, language),
        };
      case "night":
        return {
          passengers: Math.round(13950 * scale).toLocaleString(),
          paxHint: localize({ en: `Wave benchmark ${Math.round(15 * scale)}k`, ar: `مستهدف النوبة ${Math.round(15 * scale)} ألف` }, language),
          paxDelta: localize({ en: "-1.2% vs plan", ar: "-١.٢٪ عن الخطة" }, language),
          movements: Math.round(78 * scale).toString(),
          moveUnit: `/ ${Math.round(105 * scale)}`,
          moveHint: localize({ en: `${Math.round(75 * scale)} average`, ar: `المتوسط ${Math.round(75 * scale)}` }, language),
        };
      case "all":
      default:
        return {
          passengers: Math.round(58420 * scale).toLocaleString(),
          paxHint: localize({ en: `Daily benchmark ${Math.round(85 * scale)}k`, ar: `المستهدف اليومي ${Math.round(85 * scale)} ألف` }, language),
          paxDelta: tr("+4.1% vs yesterday"),
          movements: Math.round(412 * scale).toString(),
          moveUnit: `/ ${Math.round(540 * scale)}`,
          moveHint: localize({ en: `${Math.round(390 * scale)} average`, ar: `المتوسط ${Math.round(390 * scale)}` }, language),
        };
    }
  }, [activeShiftWave, activeTerminal, language, tr]);

  // Drill overrides for Taxi and Alerts
  const taxiOutValue = activeScenario.kpiOverrides?.avgTaxiOut?.replace(" min", "") || "14";
  const taxiDelta = isDrillActive ? localize({ en: "+14 min hold", ar: "+١٤ د تأخير" }, language) : "-2 min";
  const taxiTone = isDrillActive ? "crit" : "warn";

  const alertsValue = activeScenario.kpiOverrides?.activeAlerts || "3";
  const alertsHint = isDrillActive ? localize({ en: "Drill Influx Active", ar: "تنبيهات المحاكاة نشطة" }, language) : tr("2 medium, 1 high");
  const alertsTone = (activeScenario.kpiOverrides?.deltaTone || "warn") as Tone;

  return (
    <div className="grid gap-3 lg:gap-4 mt-3 lg:mt-4">
      {/* Shift Wave & Terminal Selectors */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        <ShiftWaveSelector />
        <TerminalFilterSelector />
      </div>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="Operations key metrics">
        <MetricCard
          label={tr("Passengers today")}
          value={shiftMetrics.passengers}
          hint={shiftMetrics.paxHint}
          delta={shiftMetrics.paxDelta}
          icon={Users}
          accent="cyan"
        />
        <MetricCard
          label={tr("Aircraft movements")}
          value={shiftMetrics.movements}
          unit={shiftMetrics.moveUnit}
          hint={shiftMetrics.moveHint}
          delta={isDrillActive ? localize({ en: "LVO Hold", ar: "تعليق LVO" }, language) : tr("On schedule")}
          deltaTone={isDrillActive ? "crit" : "ok"}
          icon={Activity}
          accent="cyan"
        />
        <MetricCard
          label={tr("Avg taxi-out")}
          value={taxiOutValue}
          unit="min"
          hint={tr("CIA operations")}
          delta={taxiDelta}
          deltaTone={taxiTone}
          icon={Clock3}
          accent={taxiTone === "crit" ? "crit" : "warn"}
        />
        <MetricCard
          label={tr("Active alerts")}
          value={alertsValue}
          hint={alertsHint}
          delta={tr("Needs review")}
          deltaTone={alertsTone === "high" ? "warn" : alertsTone === "neutral" ? "info" : alertsTone}
          icon={AlertTriangle}
          accent={alertsTone === "crit" ? "crit" : "warn"}
        />
      </section>

      {/* A-CDM Turnaround Milestone Engine */}
      <AcdmMilestones />

      {/* Middle: Charts for visual absorption */}
      <div className="grid gap-3 lg:gap-4 md:grid-cols-2">
        <PassengerFlowChart />
        <QueuePressureChart />
      </div>

      {/* Cairo TMA Approach Vector Radar Scope (50NM) */}
      <CairoRadarScope />

      {/* Tables: Detailed lists */}
      <div className="grid gap-3 lg:gap-4 md:grid-cols-2">
        <FlightBoard title={tr("Departures")} direction="to" rows={reactiveDepartures} />
        <FlightBoard title={tr("Arrivals")} direction="from" rows={reactiveArrivals} />
      </div>

      <DigitalOperationalGrid />
    </div>
  );
}

function FlightBoard({ title, direction, rows }: { title: string; direction: "to" | "from"; rows: FlightRow[] }) {
  const { tr, language } = useLocale();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "ok" | "warn">("all");

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch =
        !search.trim() ||
        row.flight.toLowerCase().includes(search.toLowerCase().trim()) ||
        tr(row.city).toLowerCase().includes(search.toLowerCase().trim());

      if (!matchesSearch) return false;

      if (filter === "all") return true;
      if (filter === "ok") return row.tone === "ok";
      if (filter === "warn") return row.tone === "warn" || row.tone === "crit";
      return true;
    });
  }, [rows, search, filter, tr]);

  const handleExportCsv = () => {
    exportToCsv({
      filename: `CIA_${direction === "to" ? "Departures" : "Arrivals"}_${new Date().toISOString().slice(0, 10)}.csv`,
      headers: [
        tr("Flight"),
        direction === "to" ? tr("To") : tr("From"),
        tr("Time"),
        tr("Gate"),
        tr("Status"),
      ],
      rows: filteredRows.map((r) => [
        r.flight,
        tr(r.city),
        r.time,
        r.gate,
        tr(r.status),
      ]),
      sheetTitle: `${title} - Cairo International Airport`,
    });
  };

  return (
    <SectionPanel
      title={title}
      action={
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-secondary/30 px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary/70 hover:text-primary active:scale-95 transition cursor-pointer"
            aria-label={localize({ en: `Export ${title} to CSV`, ar: `تصدير ${title} كملف CSV` }, language)}
            title={localize({ en: `Export ${title} to CSV (Excel format)`, ar: `تصدير ${title} كملف CSV متوافق مع إكسيل` }, language)}
          >
            <Download className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">{localize({ en: "Export", ar: "تصدير" }, language)}</span>
          </button>
          <span className="text-xs font-mono text-muted-foreground me-1">
            {localize({ en: `${filteredRows.length} of ${rows.length}`, ar: `${filteredRows.length} من ${rows.length}` }, language)}
          </span>
          <StatusPill tone="info">{tr("Next 60 min")}</StatusPill>
        </div>
      }
    >
      {/* Search & Status Filters */}
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-xs">
          <label htmlFor={`flight-search-${direction}`} className="sr-only">
            {localize({ en: "Filter flights or cities", ar: "تصفية الرحلات أو المدن" }, language)}
          </label>
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <input
            id={`flight-search-${direction}`}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={localize({ en: "Filter flights or cities...", ar: "بحث عن رحلة أو وجهة..." }, language)}
            aria-label={localize({ en: "Filter flights or cities", ar: "تصفية الرحلات أو المدن" }, language)}
            className="w-full rounded-lg border border-border/80 bg-secondary/30 ps-8 pe-8 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/40 transition"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute end-1 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer rounded-md"
              aria-label={localize({ en: "Clear search", ar: "مسح البحث" }, language)}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={localize({ en: "Status filter", ar: "تصفية حسب الحالة" }, language)}>
          {[
            { id: "all", label: { en: "All", ar: "الكل" } },
            { id: "ok", label: { en: "On Time", ar: "في الموعد" } },
            { id: "warn", label: { en: "Delayed", ar: "متأخرة" } },
          ].map((chip) => {
            const isActive = filter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setFilter(chip.id as typeof filter)}
                className={`min-h-[44px] inline-flex items-center rounded-lg px-3 py-1.5 text-xs transition-all duration-200 active:scale-95 cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                }`}
              >
                {localize(chip.label, language)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[580px] text-sm">
          <caption className="sr-only">{title}</caption>
          <thead className="font-mono rtl:font-sans text-xs uppercase rtl:normal-case tracking-wider rtl:tracking-normal text-muted-foreground">
            <tr>
              <th className="px-1 py-2 text-start">{tr("Flight")}</th>
              <th className="px-1 py-2 text-start">{direction === "to" ? tr("To") : tr("From")}</th>
              <th className="px-1 py-2 text-start">{tr("Time")}</th>
              <th className="px-1 py-2 text-start">{tr("Gate")}</th>
              <th className="px-1 py-2 text-start">{tr("Status")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length > 0 ? (
              filteredRows.map((row) => (
                <tr key={row.flight} className="border-t border-border/60 hover:bg-secondary/20 transition-colors">
                  <td className="px-1 py-3 font-mono font-semibold text-foreground">{row.flight}</td>
                  <td className="px-1 py-3">{tr(row.city)}</td>
                  <td className="px-1 py-3 font-mono">{row.time}</td>
                  <td className="px-1 py-3 font-mono text-muted-foreground">{row.gate}</td>
                  <td className="px-1 py-3"><StatusPill tone={row.tone}>{tr(row.status)}</StatusPill></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-6 text-center text-xs text-muted-foreground">
                  <div className="flex flex-col items-center gap-1.5">
                    <span>{localize({ en: "No flights matching criteria.", ar: "لا توجد رحلات مطابقة." }, language)}</span>
                    <button
                      type="button"
                      onClick={() => { setSearch(""); setFilter("all"); }}
                      className="text-primary hover:underline font-medium cursor-pointer"
                    >
                      {localize({ en: "Reset filters", ar: "إعادة تعيين الفلاتر" }, language)}
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SectionPanel>
  );
}

function PassengerFlowChart() {
  const { tr, language } = useLocale();
  const { reactiveFlowData } = useSimulation();

  return (
    <SectionPanel title={tr("Passenger flow")}>
      <h3 className="text-base font-semibold">{localize(reactiveFlowData.headline, language)}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{localize(reactiveFlowData.subtitle, language)}</p>
      <div className="mt-4">
        <Sparkline
          data={reactiveFlowData.sparkline}
          height={122}
          aria-label={localize(reactiveFlowData.headline, language)}
        />
        <div className="mt-1 flex justify-between font-mono text-xs text-muted-foreground">
          <span>06:00</span>
          <span>{tr("Passenger throughput index")}</span>
          <span>17:00</span>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <FlowZone label={tr("Check-in")} percent={reactiveFlowData.checkIn.percent} tone={reactiveFlowData.checkIn.tone} />
        <FlowZone label={tr("Security")} percent={reactiveFlowData.security.percent} tone={reactiveFlowData.security.tone} />
        <FlowZone label={tr("Passport")} percent={reactiveFlowData.passport.percent} tone={reactiveFlowData.passport.tone} />
      </div>
    </SectionPanel>
  );
}

function FlowZone({ label, percent, tone }: { label: string; percent: number; tone: "ok" | "warn" | "crit" }) {
  const color = tone === "crit" ? "var(--status-crit)" : tone === "warn" ? "var(--status-warn)" : "var(--status-ok)";

  return (
    <article className="panel-inner p-3 text-center">
      <p className="font-mono text-xs text-muted-foreground font-medium">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{percent}%</p>
      <ProgressBar value={percent} color={color} className="mt-3" />
    </article>
  );
}

function QueuePressureChart() {
  const { tr, language } = useLocale();
  const { reactiveQueueRows, activeTerminal } = useSimulation();

  return (
    <SectionPanel
      title={tr("Queue pressure by terminal")}
      action={
        <div className="flex items-center gap-1.5">
          {activeTerminal !== "ALL" && <StatusPill tone="info">{activeTerminal}</StatusPill>}
          <StatusPill tone="info">{tr("Stacked bar")}</StatusPill>
        </div>
      }
    >
      <p className="mb-4 text-sm text-muted-foreground">{localize({ en: "Breakdown of passenger congestion by processing stage.", ar: "تفصيل ازدحام الركاب حسب مرحلة المعالجة." }, language)}</p>
      
      {/* Screen reader accessible data table */}
      <table className="sr-only">
        <caption>{tr("Queue pressure by terminal")}</caption>
        <thead>
          <tr><th>Terminal</th><th>Check-in</th><th>Passport</th><th>Security</th><th>Total</th></tr>
        </thead>
        <tbody>
          {reactiveQueueRows.map((row) => (
            <tr key={`sr-${row.terminal}`}>
              <td>{row.terminal}</td><td>{row.checkIn}%</td><td>{row.passport}%</td><td>{row.security}%</td><td>{row.total}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-4" aria-hidden="true">
        {reactiveQueueRows.map((row) => (
          <div key={row.terminal} className="grid grid-cols-[42px_minmax(0,1fr)_42px] items-center gap-3">
            <span className="font-mono font-semibold">{row.terminal}</span>
            <div className="flex h-4 overflow-hidden rounded-full bg-secondary">
              <span className="bg-cyan transition-opacity hover:opacity-80 cursor-help" style={{ width: `${row.checkIn}%` }} title={`${tr("Check-in")}: ${row.checkIn}%`} />
              <span className="bg-cyan/70 transition-opacity hover:opacity-80 cursor-help" style={{ width: `${row.passport}%` }} title={`${tr("Passport")}: ${row.passport}%`} />
              <span className="bg-cyan/40 transition-opacity hover:opacity-80 cursor-help" style={{ width: `${row.security}%` }} title={`${tr("Security")}: ${row.security}%`} />
            </div>
            <span className="font-mono text-sm text-muted-foreground">{row.total}%</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground" aria-hidden="true">
        <Legend color="bg-cyan" label={tr("Check-in")} />
        <Legend color="bg-cyan/70" label={tr("Passport")} />
        <Legend color="bg-cyan/40" label={tr("Security")} />
      </div>
    </SectionPanel>
  );
}


export default OperationsView;