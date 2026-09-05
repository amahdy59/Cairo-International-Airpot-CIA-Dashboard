import { useState } from "react";
import { Plane, Clock3, ArrowRight, RefreshCw, Layers } from "lucide-react";
import { useLocale } from "../../context/locale";
import { useAcdmEngine } from "../../hooks/useAcdmEngine";
import { StatusPill } from "../../components/command-center/MetricWidgets";

export function AcdmMilestones() {
  const { language } = useLocale();
  const { turnarounds, filter, setFilter, updateTobt, kpis } = useAcdmEngine();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [revisedTobt, setRevisedTobt] = useState("");

  const handleSaveTobt = (id: string) => {
    if (revisedTobt.trim()) {
      updateTobt(id, revisedTobt, language === "ar" ? "تأخر تحميل الحقائب" : "Baggage loading extension");
      setEditingId(null);
      setRevisedTobt("");
    }
  };

  return (
    <section
      aria-label={language === "ar" ? "محرك إدارة فترات التوقف بالمطار A-CDM" : "Airport Collaborative Decision Making (A-CDM)"}
      className="panel p-4 sm:p-5 rounded-2xl border border-white/10 bg-card mb-4"
    >
      {/* Header & KPIs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
              <Layers className="h-4 w-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              {language === "ar" ? "محرك التوقف المشترك والربط الذكي (A-CDM)" : "A-CDM Turnaround & Milestone Engine"}
            </h2>
            <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[10px] font-bold text-muted-foreground uppercase">
              ICAO Doc 9971
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {language === "ar"
              ? "مزامنة لحظية بين خطط الوصول، خدمات المناولة الأرضية، ومواعيد الإقلاع المصرح بها (TSAT/TTOT)"
              : "Real-time synchronization between landing milestones, ramp servicing, and target take-off slots."}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-secondary/40 p-1 rounded-xl border border-border/40">
          {(["all", "handling", "delayed", "ready"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                filter === mode
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode === "all"
                ? language === "ar" ? "الكل" : "All"
                : mode === "handling"
                ? language === "ar" ? "قيد المناولة" : "Handling"
                : mode === "delayed"
                ? language === "ar" ? "متأخر" : "Delayed"
                : language === "ar" ? "جاهز للدفع" : "Ready"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="rounded-xl border border-border/40 bg-background/50 p-3">
          <span className="text-[11px] text-muted-foreground block">{language === "ar" ? "إجمالي رحلات التوقف" : "Active Turnarounds"}</span>
          <span className="text-xl font-bold font-mono text-foreground">{kpis.total}</span>
        </div>
        <div className="rounded-xl border border-border/40 bg-background/50 p-3">
          <span className="text-[11px] text-muted-foreground block">{language === "ar" ? "التزام مواعيد TOBT" : "TOBT Adherence"}</span>
          <span className="text-xl font-bold font-mono text-status-ok">{kpis.tobtCompliance}%</span>
        </div>
        <div className="rounded-xl border border-border/40 bg-background/50 p-3">
          <span className="text-[11px] text-muted-foreground block">{language === "ar" ? "متوسط تأخير التوقف" : "Avg Delay"}</span>
          <span className={`text-xl font-bold font-mono ${kpis.avgDelay > 10 ? "text-status-warn" : "text-status-ok"}`}>
            +{kpis.avgDelay}m
          </span>
        </div>
        <div className="rounded-xl border border-border/40 bg-background/50 p-3">
          <span className="text-[11px] text-muted-foreground block">{language === "ar" ? "رحلات معرضة للتأخير" : "At Risk"}</span>
          <span className={`text-xl font-bold font-mono ${kpis.delayed > 0 ? "text-status-warn" : "text-status-ok"}`}>
            {kpis.delayed}
          </span>
        </div>
      </div>

      {/* Turnaround Cards */}
      <div className="space-y-3">
        {turnarounds.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-border/50 bg-surface/60 p-3.5 sm:p-4 hover:border-primary/40 transition-colors"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Flight Pair & Aircraft Stand */}
              <div className="flex items-start gap-3 min-w-0">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Plane className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-foreground text-sm">{item.inboundFlight}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground rtl:rotate-180" />
                    <span className="font-mono font-bold text-primary text-sm">{item.outboundFlight}</span>
                    <StatusPill tone={item.status === "delayed" ? "warn" : item.status === "ready" ? "ok" : "info"}>
                      {item.status.toUpperCase()}
                    </StatusPill>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.airline} &bull; <span className="font-mono">{item.aircraft}</span> &bull; <span className="font-semibold text-foreground">{item.stand}</span>
                  </p>
                </div>
              </div>

              {/* Milestones: ELDT, TOBT, TSAT */}
              <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
                <div className="text-center rounded-lg bg-background/60 p-1.5 px-2.5 border border-border/30">
                  <span className="text-[10px] text-muted-foreground block">AIBT (Block)</span>
                  <span className="font-bold text-foreground">{item.aibt}</span>
                </div>
                <div className="text-center rounded-lg bg-background/60 p-1.5 px-2.5 border border-primary/30">
                  <span className="text-[10px] text-primary block">TOBT (Off-Block)</span>
                  <span className="font-bold text-primary">{item.tobt}</span>
                </div>
                <div className="text-center rounded-lg bg-background/60 p-1.5 px-2.5 border border-border/30">
                  <span className="text-[10px] text-muted-foreground block">TSAT (Clearance)</span>
                  <span className="font-bold text-foreground">{item.tsat}</span>
                </div>
                <div className="text-center rounded-lg bg-background/60 p-1.5 px-2.5 border border-border/30">
                  <span className="text-[10px] text-muted-foreground block">TTOT (Airborne)</span>
                  <span className="font-bold text-foreground">{item.ttot}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar & Ground Handling Status */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground text-[11px] truncate">{item.criticalMilestone}</span>
                <span className="font-mono font-bold text-foreground shrink-0 ms-2">{item.turnaroundProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.status === "delayed" ? "bg-status-warn" : "bg-primary"
                  }`}
                  style={{ width: `${item.turnaroundProgress}%` }}
                />
              </div>
            </div>

            {/* Interactive TOBT Adjustment Trigger */}
            <div className="mt-2.5 flex items-center justify-between border-t border-border/30 pt-2 text-xs">
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Clock3 className="h-3 w-3" />
                <span>{language === "ar" ? "نافذة التحديث: +/- 5 دقائق" : "A-CDM Target Window: +/- 5 min"}</span>
              </div>

              {editingId === item.id ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="e.g. 16:15"
                    value={revisedTobt}
                    onChange={(e) => setRevisedTobt(e.target.value)}
                    className="h-8 w-24 rounded-lg border border-primary bg-background px-2 font-mono text-xs text-foreground focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveTobt(item.id)}
                    className="h-8 rounded-lg bg-primary px-2.5 font-bold text-primary-foreground text-xs cursor-pointer active-spring"
                  >
                    {language === "ar" ? "حفظ" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="h-8 rounded-lg border border-border px-2 text-xs text-muted-foreground hover:bg-secondary cursor-pointer"
                  >
                    {language === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(item.id);
                    setRevisedTobt(item.tobt);
                  }}
                  className="flex items-center gap-1 text-primary hover:underline text-xs font-semibold cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>{language === "ar" ? "تعديل موعد TOBT" : "Revise TOBT"}</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
