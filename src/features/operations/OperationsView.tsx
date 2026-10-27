import { useState, useMemo } from 'react';
import { Users, Activity, Clock3, AlertTriangle, Gauge, Search, X, Download, Plane, ArrowRight } from 'lucide-react';
import { localize, toneCssVar } from '../../utils/helpers';
import { useLocale } from '../../context/locale';
import { useSimulation } from '../../context/simulation';
import { useOperationalEvents } from '../../context/operationalEvents';
import { exportToCsv } from '../../utils/exportCsv';
import { soundEffects } from '../../services/soundEffects';
import { FlightRow, Tone, shiftWaves, TerminalId, ManagerTab } from '../../data';
import { MetricCard, ProgressBar, SectionPanel, Sparkline, StatusPill } from '../../components/command-center/MetricWidgets';
import { AcdmMilestones } from './AcdmMilestones';
import { ForecastLineChart } from './ForecastLineChart';
import { FlightStatusChart } from './FlightStatusChart';
import { QueuePressureHeatmap } from './QueuePressureHeatmap';
import { PassengerJourneyBoard } from './PassengerJourneyBoard';
import { BaggageExceptionFlow } from './BaggageExceptionFlow';
import { SelectMenu } from '../../components/common/SelectMenu';

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


function DigitalOperationalGrid({ onInspectEvent }: { onInspectEvent?: (id: string) => void }) {
  return (
    <section className="grid gap-3 lg:gap-4 md:grid-cols-2 md:items-start" aria-label="Digital twin operational analytics">
      <PassengerInfluxForecast />
      <GateWaitChart />
      <div className="md:col-span-2"><AlertsPanel onInspectEvent={onInspectEvent} /></div>
    </section>
  );
}

function PassengerInfluxForecast() {
  const { language } = useLocale();
  const { reactiveInfluxForecast, activeTerminal } = useSimulation();

  return (
    <SectionPanel
      title={localize({ en: "Demand vs modeled capacity", ar: "الطلب مقابل السعة النموذجية" }, language)}
      action={
        activeTerminal !== "ALL" ? (
          <StatusPill tone="info">{activeTerminal}</StatusPill>
        ) : undefined
      }
    >
      <ForecastLineChart data={reactiveInfluxForecast} />
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <Legend color="bg-status-warn" dashed label={localize({ en: "Forecast demand", ar: "الطلب المتوقع" }, language)} />
        <Legend color="bg-primary" label={localize({ en: "Modeled capacity", ar: "السعة النموذجية" }, language)} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{language === "ar" ? "سيناريو تدريبي · قيم لكل ساعة · لا يوجد تحديث مباشر" : "Training scenario · hourly values · no live timestamp"}</p>
    </SectionPanel>
  );
}

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
      <div className="grid gap-3">
        {reactiveGateWaits.map((row) => (
          <div key={row.gate} className="grid grid-cols-[56px_minmax(0,1fr)_58px] items-center gap-3">
            <span className="font-mono text-sm font-semibold">{row.gate}</span>
            <ProgressBar value={row.wait} max={maxWait} color={toneCssVar(row.tone)} label={localize({ en: `Gate ${row.gate}: ${row.wait} minutes wait`, ar: `البوابة ${row.gate}: انتظار ${row.wait} دقيقة` }, language)} />
            <span className="justify-self-end font-mono text-sm text-muted-foreground">{row.wait}m</span>
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}

function AlertsPanel({ onInspectEvent }: { onInspectEvent?: (id: string) => void }) {
  const { language } = useLocale();
  const { events } = useOperationalEvents();
  const warnings = events.filter((event) => event.state !== "simulated" && ["passenger", "airside", "baggage"].includes(event.domain)).slice(0, 3);
  return (
    <SectionPanel title={localize({ en: "Decision paths from open events", ar: "مسارات القرار من الأحداث المفتوحة" }, language)} action={<StatusPill tone="info">{language === "ar" ? "سيناريو" : "Scenario"}</StatusPill>}>
      <div className="grid gap-3 lg:grid-cols-3">
        {warnings.map((event) => <article key={event.id} className="panel-inner flex flex-col gap-2 p-3">
              <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">{localize(event.title, language)}</h3><span className="text-[11px] font-bold text-status-warn">{event.terminal}</span></div>
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 text-xs">
                <span className="rounded-lg border border-border bg-card p-2 text-muted-foreground">{localize(event.evidence, language)}</span>
                <ArrowRight aria-hidden="true" className="mt-2 h-4 w-4 shrink-0 text-primary rtl:rotate-180" />
                <span className="rounded-lg border border-primary/30 bg-primary/5 p-2 font-semibold text-foreground">{localize(event.proposedAction, language)}</span>
              </div>
              {onInspectEvent && <button type="button" onClick={() => onInspectEvent(event.id)} className="mt-auto min-h-11 self-start rounded-lg px-2 text-xs font-semibold text-primary hover:bg-secondary">{language === "ar" ? "عرض السجل والخريطة" : "Open record on map"}</button>}
            </article>
        )}
      </div>
      {warnings.length === 0 && <p className="text-sm text-muted-foreground">{language === "ar" ? "لا توجد أحداث مفتوحة في هذا السيناريو." : "No open events in this scenario."}</p>}
    </SectionPanel>
  );
}

function ShiftWaveSelector() {
  const { language } = useLocale();
  const { activeShiftWave, setActiveShiftWave } = useSimulation();
  return <div className="flex min-w-0 flex-col gap-1.5">
    <label htmlFor="shift-wave" className="cursor-pointer text-sm font-medium text-muted-foreground">{language === "ar" ? "فترة النوبة" : "Shift wave"}</label>
    <SelectMenu id="shift-wave" label={language === "ar" ? "فترة النوبة" : "Shift wave"} value={activeShiftWave} onChange={setActiveShiftWave} className="w-full"
      options={shiftWaves.map(wave => ({ value: wave.id, label: localize(wave.label, language), detail: wave.window }))} />
  </div>;
}

function TerminalFilterSelector() {
  const { language } = useLocale();
  const { activeTerminal, setActiveTerminal } = useSimulation();
  return <div className="flex min-w-0 flex-col gap-1.5">
    <label htmlFor="terminal-filter" className="cursor-pointer text-sm font-medium text-muted-foreground">{language === "ar" ? "المبنى" : "Terminal"}</label>
    <SelectMenu<"ALL" | TerminalId> id="terminal-filter" label={language === "ar" ? "المبنى" : "Terminal"} value={activeTerminal} onChange={setActiveTerminal} className="w-full"
      options={[{ value: "ALL", label: language === "ar" ? "جميع المباني" : "All terminals" }, ...(["T1", "T2", "T3"] as const).map((terminal,index) => ({ value: terminal, label: language === "ar" ? "مبنى " + (index+1) : "Terminal " + (index+1) }))]} />
  </div>;
}

export interface OperationsViewProps {
  subView?: "flights" | "analytics";
  onSubViewChange?: (subView: "flights" | "analytics") => void;
  onNavigateTab?: (tab: ManagerTab) => void;
}

function OperationsView({ subView: controlledSubView, onSubViewChange, onNavigateTab }: OperationsViewProps = {}) {
  const { tr, language } = useLocale();
  const { events, selectEvent, standForFlight } = useOperationalEvents();
  const {
    activeShiftWave,
    activeTerminal,
    activeScenario,
    isDrillActive,
    reactiveDepartures,
    reactiveArrivals,
    reactiveQueueRows,
  } = useSimulation();

  const [internalSubView, setInternalSubView] = useState<"flights" | "analytics">("flights");
  const activeSubView = controlledSubView ?? internalSubView;
  const displayDepartures = reactiveDepartures.map((flight) => ({ ...flight, gate: standForFlight(flight.flight) ?? flight.gate }));
  const displayArrivals = reactiveArrivals.map((flight) => ({ ...flight, gate: standForFlight(flight.flight) ?? flight.gate }));

  const setSubView = (val: "flights" | "analytics") => {
    soundEffects.playClick();
    if (onSubViewChange) {
      onSubViewChange(val);
    } else {
      setInternalSubView(val);
    }
  };

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

  const alertsValue = events.filter((event) => event.state !== "simulated" && (activeTerminal === "ALL" || event.terminal === activeTerminal)).length.toString();
  const alertsHint = isDrillActive ? localize({ en: "Drill tasks in selected area", ar: "مهام التدريب في المنطقة المحددة" }, language) : localize({ en: "Scenario tasks in selected area", ar: "مهام السيناريو في المنطقة المحددة" }, language);
  const alertsTone = (activeScenario.kpiOverrides?.deltaTone || "warn") as Tone;

  return (
    <div className="grid gap-3 lg:gap-4 mt-3 lg:mt-4">
      {/* Shift Wave & Terminal Selectors */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ShiftWaveSelector />
        <TerminalFilterSelector />
      </div>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="Operations key metrics">
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

      {/* Sub-View Navigation Segmented Switcher */}
      <div
        role="tablist"
        aria-label={localize({ en: "Operations Sub-Views", ar: "الأقسام الفرعية للعمليات" }, language)}
        className="grid grid-cols-2 gap-1.5 p-1.5 rounded-xl border border-border bg-secondary/30 w-full sm:w-fit"
        onKeyDown={event => {
          if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
          event.preventDefault();
          const next = event.key === "Home" ? "flights" : event.key === "End" ? "analytics" : activeSubView === "flights" ? "analytics" : "flights";
          setSubView(next);
          requestAnimationFrame(() => document.getElementById(`tab-${next}`)?.focus());
        }}
      >
        <button
          type="button"
          role="tab"
          id="tab-flights"
          aria-selected={activeSubView === "flights"}
          aria-controls={activeSubView === "flights" ? "panel-flights" : undefined}
          tabIndex={activeSubView === "flights" ? 0 : -1}
          onClick={() => setSubView("flights")}
          className={`min-h-[44px] flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
            activeSubView === "flights"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <Plane className="h-4 w-4" aria-hidden="true" />
          <span>{localize({ en: "Flights & turnaround", ar: "الرحلات والتجهيز" }, language)}</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              activeSubView === "flights"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {reactiveDepartures.length + reactiveArrivals.length}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-analytics"
          aria-selected={activeSubView === "analytics"}
          aria-controls={activeSubView === "analytics" ? "panel-analytics" : undefined}
          tabIndex={activeSubView === "analytics" ? 0 : -1}
          onClick={() => setSubView("analytics")}
          className={`min-h-[44px] flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
            activeSubView === "analytics"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <Gauge className="h-4 w-4" aria-hidden="true" />
          <span>{localize({ en: "Flow & forecast", ar: "التدفق والتوقعات" }, language)}</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono uppercase ${
              activeSubView === "analytics"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {language === "ar" ? "محاكاة" : "SIM"}
          </span>
        </button>
      </div>

      {/* Sub-View Content */}
      {activeSubView === "flights" ? (
        <div
          id="panel-flights"
          role="tabpanel"
          aria-labelledby="tab-flights"
          className="grid gap-3 lg:gap-4 animate-in fade-in duration-200"
        >
          <FlightStatusChart departures={displayDepartures} arrivals={displayArrivals} />
          <BaggageExceptionFlow onInspect={onNavigateTab ? () => { selectEvent("t3-baggage"); onNavigateTab("digital"); } : undefined} />

          {/* A-CDM Turnaround Milestone Engine */}
          <AcdmMilestones />

          {/* Tables: Detailed flight lists */}
          <div className="grid gap-3 lg:gap-4 md:grid-cols-2">
            <FlightBoard title={tr("Departures")} direction="to" rows={displayDepartures} />
            <FlightBoard title={tr("Arrivals")} direction="from" rows={displayArrivals} />
          </div>
        </div>
      ) : (
        <div
          id="panel-analytics"
          role="tabpanel"
          aria-labelledby="tab-analytics"
          className="grid gap-3 lg:gap-4 animate-in fade-in duration-200"
        >
          <PassengerJourneyBoard onInspectEvent={onNavigateTab ? (id) => { selectEvent(id); onNavigateTab("digital"); } : undefined} />
          {/* Middle: Charts for visual absorption */}
          <div className="grid gap-3 lg:gap-4 md:grid-cols-2">
            <PassengerFlowChart />
            <QueuePressureHeatmap rows={reactiveQueueRows} activeTerminal={activeTerminal} />
          </div>

          <DigitalOperationalGrid onInspectEvent={onNavigateTab ? (id) => { selectEvent(id); onNavigateTab("digital"); } : undefined} />
        </div>
      )}
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

      <div className="grid gap-2 xl:hidden" aria-label={title}>
        {filteredRows.length ? filteredRows.map(row => <article key={row.flight} className="min-w-0 rounded-lg border border-border bg-background/40 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <strong className="font-mono text-sm text-foreground">{row.flight}</strong>
            <StatusPill tone={row.tone}>{tr(row.status)}</StatusPill>
          </div>
          <p className="mt-1.5 break-words text-sm text-foreground">{tr(row.city)}</p>
          <p className="mt-1 text-xs text-muted-foreground"><span className="font-mono text-foreground">{row.time}</span> {language === "ar" ? "بتوقيت القاهرة" : "Cairo time"} · {row.gate.startsWith("Gate ") || row.gate.startsWith("Stand ") ? "" : `${tr("Gate")} `}<span className="font-mono text-foreground">{language === "ar" ? row.gate.replace(/^Gate /, "البوابة ").replace(/^Stand /, "الموقف ") : row.gate}</span></p>
        </article>) : <div className="rounded-lg border border-dashed border-border p-4 text-center">
          <p className="text-sm font-semibold">{language === "ar" ? "لا توجد رحلات مطابقة" : "No matching flights"}</p>
          <button type="button" onClick={() => { setSearch(""); setFilter("all"); }} className="mt-2 min-h-11 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-secondary">{language === "ar" ? "مسح المرشحات" : "Clear filters"}</button>
        </div>}
      </div>
      <div className="table-scroll hidden xl:block" role="region" tabIndex={0} aria-label={title}>
        <table className="w-full min-w-[580px] text-sm">
          <caption className="sr-only">{title}</caption>
          <thead className="font-mono rtl:font-sans text-xs uppercase rtl:normal-case tracking-wider rtl:tracking-normal text-muted-foreground">
            <tr>
              <th scope="col" className="px-2 py-2.5 text-start">{tr("Flight")}</th>
              <th scope="col" className="px-2 py-2.5 text-start">{direction === "to" ? tr("To") : tr("From")}</th>
              <th scope="col" className="px-2 py-2.5 text-start" title={language === "ar" ? "توقيت القاهرة المحلي" : "Cairo local time"}>
                {tr("Time")}
              </th>
              <th scope="col" className="px-2 py-2.5 text-start">{tr("Gate")}</th>
              <th scope="col" className="px-2 py-2.5 text-start">{tr("Status")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length > 0 ? (
              filteredRows.map((row) => (
                <tr key={row.flight} className="border-t border-border/60 hover:bg-secondary/20 transition-colors">
                  <td className="px-2 py-3 font-mono font-semibold text-foreground">{row.flight}</td>
                  <td className="px-2 py-3">{tr(row.city)}</td>
                  <td className="px-2 py-3 font-mono">{row.time}</td>
                  <td className="px-2 py-3 font-mono text-muted-foreground">{row.gate}</td>
                  <td className="px-2 py-3"><StatusPill tone={row.tone}>{tr(row.status)}</StatusPill></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-10 text-center text-xs text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-xs mx-auto">
                    <Search className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
                    <p className="font-semibold text-foreground text-sm">
                      {localize({ en: "No flights matching criteria", ar: "لا توجد رحلات مطابقة لمعايير البحث" }, language)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {localize({ en: "Try adjusting search query or status filter.", ar: "جرب تعديل نص البحث أو تصفية الحالة." }, language)}
                    </p>
                    <button
                      type="button"
                      onClick={() => { setSearch(""); setFilter("all"); }}
                      className="mt-1 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-xl bg-secondary px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary/80 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary active-spring"
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
    <SectionPanel title={tr("Passenger flow")} action={<StatusPill tone="neutral">{language === "ar" ? "جميع المباني · سيناريو" : "All terminals · scenario"}</StatusPill>}>
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
      <p className="mt-3 text-xs text-muted-foreground">{language === "ar" ? "مؤشر نسبي للتدفق في السيناريو؛ يعرض مخطط الرحلة أدناه ضغط المراحل حسب المبنى." : "Relative scenario flow index. The journey diagram above shows stage pressure by terminal."}</p>
    </SectionPanel>
  );
}

export default OperationsView;
