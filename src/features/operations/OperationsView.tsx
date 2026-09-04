import { memo, useState, useMemo } from 'react';
import { Users, Activity, Clock3, AlertTriangle, Gauge, RadioTower, DoorOpen, Search, X } from 'lucide-react';
import { localize, toneCssVar } from '../../utils/helpers';
import { useLocale } from '../../context/locale';
import { influxForecastRows, gateWaitRows, departures, arrivals, queueRows, FlightRow, Tone } from '../../data';
import { MetricCard, ProgressBar, SectionPanel, Sparkline, StatusPill } from '../../components/command-center/MetricWidgets';

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
  return (
    <SectionPanel
      title={localize({ en: "Passenger influx forecast", ar: "توقع تدفق الركاب" }, language)}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {localize({ en: "Forecasted trend of passenger flow over the next 4 hours.", ar: "الاتجاه المتوقع لتدفق الركاب خلال الـ 4 ساعات القادمة." }, language)}
      </p>
      <ForecastLineChart />
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <Legend color="bg-cyan" label={localize({ en: "Current trajectory", ar: "المسار الحالي" }, language)} />
        <Legend color="bg-status-warn" dashed label={localize({ en: "Forecast", ar: "التوقع" }, language)} />
      </div>
    </SectionPanel>
  );
}

const ForecastLineChart = memo(function ForecastLineChart() {
  const values = influxForecastRows.flatMap((row) => [row.current, row.forecast]);
  const min = Math.min(...values) - 100;
  const max = Math.max(...values) + 100;
  const span = max - min || 1;
  const width = 420;
  const height = 150;
  
  const getPoint = (value: number, index: number): [number, number] => {
    const x = 18 + (index / (influxForecastRows.length - 1)) * (width - 36);
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

  const currentCoords = influxForecastRows.map((row, index) => getPoint(row.current, index));
  const forecastCoords = influxForecastRows.map((row, index) => getPoint(row.forecast, index));
  
  const currentPath = createSmoothPath(currentCoords);
  const forecastPath = createSmoothPath(forecastCoords);
  
  const areaPath = currentCoords.length > 0
    ? `${currentPath} L ${currentCoords[currentCoords.length - 1][0]},${height - 18} L ${currentCoords[0][0]},${height - 18} Z`
    : "";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full overflow-visible" role="img" aria-label={`Passenger influx forecast: current trajectory peaks at ${Math.max(...influxForecastRows.map(r => r.current)).toLocaleString()} passengers at +2h, with forecasted peak of ${Math.max(...influxForecastRows.map(r => r.forecast)).toLocaleString()} passengers. Forecast shows an elevated demand window before tapering at +4h.`}>
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
      {influxForecastRows.map((row, index) => (
        <text key={row.time} x={currentCoords[index][0]} y={height - 2} textAnchor="middle" fill="var(--muted-foreground)" fontSize="12" className="font-mono">
          {row.time}
        </text>
      ))}
    </svg>
  );
});

function GateWaitChart() {
  const { language } = useLocale();
  return (
    <SectionPanel
      title={localize({ en: "Average wait time per gate", ar: "متوسط الانتظار لكل بوابة" }, language)}
      action={<StatusPill tone="warn">{localize({ en: "F11 needs action", ar: "F11 يحتاج إجراء" }, language)}</StatusPill>}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {localize({ en: "Current wait times across active gates.", ar: "أوقات الانتظار الحالية عبر البوابات النشطة." }, language)}
      </p>
      <div className="grid gap-3">
        {gateWaitRows.map((row) => (
          <div key={row.gate} className="grid grid-cols-[48px_minmax(0,1fr)_58px] items-center gap-3">
            <span className="font-mono text-sm font-semibold">{row.gate}</span>
            <ProgressBar value={row.wait} max={30} color={toneCssVar(row.tone)} />
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

function OperationsView() {
  const { tr } = useLocale();
  return (
    <div className="grid gap-3 lg:gap-4 mt-3 lg:mt-4">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="Operations key metrics">
        <MetricCard label={tr("Passengers today")} value="58,420" hint={tr("Daily benchmark 85k")} delta={tr("+4.1% vs yesterday")} icon={Users} accent="cyan" />
        <MetricCard label={tr("Aircraft movements")} value="412" unit="/ 540" hint={tr("390 average")} delta={tr("On schedule")} icon={Activity} accent="cyan" />
        <MetricCard label={tr("Avg taxi-out")} value="14" unit="min" hint={tr("CIA operations")} delta="-2 min" deltaTone="warn" icon={Clock3} accent="warn" />
        <MetricCard label={tr("Active alerts")} value="3" hint={tr("2 medium, 1 high")} delta={tr("Needs review")} deltaTone="warn" icon={AlertTriangle} accent="warn" />
      </section>

      {/* Middle: Charts for visual absorption */}
      <div className="grid gap-3 lg:gap-4 md:grid-cols-2">
        <PassengerFlowChart />
        <QueuePressureChart />
      </div>

      {/* Tables: Detailed lists */}
      <div className="grid gap-3 lg:gap-4 md:grid-cols-2">
        <FlightBoard title={tr("Departures")} direction="to" rows={departures} />
        <FlightBoard title={tr("Arrivals")} direction="from" rows={arrivals} />
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

  return (
    <SectionPanel
      title={title}
      action={
        <div className="flex flex-wrap items-center gap-1.5">
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
  return (
    <SectionPanel title={tr("Passenger flow")}>
      <h3 className="text-base font-semibold">{tr("Passenger flow rises into the midday wave")}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{localize({ en: "Hourly progression of passenger throughput across all terminals.", ar: "التطور الساعي لتدفق الركاب عبر جميع المباني." }, language)}</p>
      <div className="mt-4">
        <Sparkline data={[28, 34, 42, 48, 58, 51, 61, 70, 66, 72, 69, 76]} height={122} aria-label="Line chart showing passenger throughput rising from 06:00 to a midday peak, then tapering toward 17:00" />
        <div className="mt-1 flex justify-between font-mono text-xs text-muted-foreground">
          <span>06:00</span>
          <span>{tr("Passenger throughput index")}</span>
          <span>17:00</span>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <FlowZone label={tr("Check-in")} percent={62} tone="ok" />
        <FlowZone label={tr("Security")} percent={84} tone="warn" />
        <FlowZone label={tr("Passport")} percent={71} tone="ok" />
      </div>
    </SectionPanel>
  );
}

function FlowZone({ label, percent, tone }: { label: string; percent: number; tone: "ok" | "warn" }) {
  return (
    <article className="panel-inner p-3 text-center">
      <p className="font-mono text-xs text-muted-foreground font-medium">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{percent}%</p>
      <ProgressBar value={percent} color={tone === "warn" ? "var(--status-warn)" : "var(--status-ok)"} className="mt-3" />
    </article>
  );
}

function QueuePressureChart() {
  const { tr, language } = useLocale();
  return (
    <SectionPanel title={tr("Queue pressure by terminal")} action={<StatusPill tone="info">{tr("Stacked bar")}</StatusPill>}>
      <p className="mb-4 text-sm text-muted-foreground">{localize({ en: "Breakdown of passenger congestion by processing stage.", ar: "تفصيل ازدحام الركاب حسب مرحلة المعالجة." }, language)}</p>
      
      {/* Screen reader accessible data table */}
      <table className="sr-only">
        <caption>{tr("Queue pressure by terminal")}</caption>
        <thead>
          <tr><th>Terminal</th><th>Check-in</th><th>Passport</th><th>Security</th><th>Total</th></tr>
        </thead>
        <tbody>
          {queueRows.map((row) => (
            <tr key={`sr-${row.terminal}`}>
              <td>{row.terminal}</td><td>{row.checkIn}%</td><td>{row.passport}%</td><td>{row.security}%</td><td>{row.total}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-4" aria-hidden="true">
        {queueRows.map((row) => (
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