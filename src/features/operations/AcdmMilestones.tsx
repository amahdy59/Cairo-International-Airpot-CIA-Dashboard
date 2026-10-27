import { useState } from "react";
import { Plane, ArrowRight, RefreshCw, Layers } from "lucide-react";
import { useLocale } from "../../context/locale";
import { useAcdmEngine } from "../../hooks/useAcdmEngine";
import { StatusPill } from "../../components/command-center/MetricWidgets";
import { SelectMenu } from "../../components/common/SelectMenu";
import { TurnaroundTimeline } from "./TurnaroundTimeline";

const milestoneArabic: Record<string, string> = {
  "M04: Fuelling completed, Pax Boarding @ 70%": "م04: اكتمل التزويد بالوقود، وصعود الركاب ٧٠٪",
  "M03: Inbound late arrival ripple (+22m). Cargo offload in progress.": "م03: تأخر وصول الرحلة ٢٢ دقيقة؛ تفريغ الشحن جارٍ",
  "M02: Catering & Cabin servicing initiated.": "م02: بدأت خدمات التموين والمقصورة",
  "M05: Pushback clearance standby (TSAT window active).": "م05: انتظار تصريح الدفع؛ نافذة TSAT نشطة",
  "M05: TSAT deferred by ATC - Cat II separation hold (+35m)": "م05: أرجأ برج المراقبة موعد TSAT بسبب الفصل الجوي ٣٥ دقيقة",
  "M04: Fuelling paused due to high winds (38kt gust)": "م04: توقف التزويد بالوقود بسبب رياح بسرعة ٣٨ عقدة",
  "M05: Runway 05C sweeper sweep holding pushback": "م05: كنس المدرج 05C يؤخر الدفع للخلف",
  "M05: Cat II stopbar holding queue": "م05: انتظار عند أضواء التوقف للفئة الثانية",
  "M03: T3 sorter failure. Manual container loading in progress (+40m)": "م03: تعطل فرز الحقائب في مبنى 3؛ تحميل يدوي بتأخير ٤٠ دقيقة",
  "M03: ULD transfer delayed by conveyor stoppage": "م03: تأخر نقل الحاويات بسبب توقف السير",
  "M03: Manual baggage tug transfer at T3": "م03: نقل الحقائب يدوياً في مبنى 3",
};

function arabicMilestone(value: string) {
  const revisedTime = value.match(/^M04: TOBT revised to (\d{2}:\d{2})/);
  return revisedTime ? `م04: تعديل موعد مغادرة البوابة المستهدف إلى ${revisedTime[1]}` : milestoneArabic[value] ?? value;
}

function turnaroundStatus(value: string, isAr: boolean) {
  if (!isAr) return value.toUpperCase();
  return ({ delayed: "متأخر", ready: "جاهز", handling: "قيد التجهيز", departed: "غادر", "on-schedule": "وفق الجدول" } as Record<string, string>)[value] ?? value;
}

export function AcdmMilestones() {
  const { language } = useLocale();
  const { turnarounds, filter, setFilter, updateTobt, kpis } = useAcdmEngine();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [revisedTobt, setRevisedTobt] = useState("");

  const handleSaveTobt = (id: string) => {
    if (/^([01]\d|2[0-3]):[0-5]\d$/.test(revisedTobt)) {
      updateTobt(id, revisedTobt, "Manual scenario revision");
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
              <span className="sm:hidden">{language === "ar" ? "مراحل تجهيز الرحلات" : "Turnaround milestones"}</span>
              <span className="hidden sm:inline">{language === "ar" ? "محرك التوقف المشترك والربط الذكي (A-CDM)" : "A-CDM Turnaround & Milestone Engine"}</span>
            </h2>
            <span className="hidden rounded-md bg-secondary px-2 py-0.5 font-mono text-[10px] font-bold text-muted-foreground uppercase sm:inline">
              A-CDM · TRAINING
            </span>
          </div>
          <p className="mt-1 hidden text-xs text-muted-foreground sm:block">
            {language === "ar"
              ? "مثال تدريبي يربط مراحل الوصول والمناولة الأرضية ومواعيد الإقلاع المستهدفة"
              : "Training example linking arrival, ground handling, and target departure milestones."}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="w-full sm:hidden"><SelectMenu label={language === "ar" ? "حالة التجهيز" : "Turnaround status"} value={filter} onChange={setFilter} className="w-full" options={[
          { value: "all", label: language === "ar" ? "جميع الرحلات" : "All turnarounds" },
          { value: "handling", label: language === "ar" ? "قيد المناولة" : "Handling" },
          { value: "delayed", label: language === "ar" ? "متأخر" : "Delayed" },
          { value: "ready", label: language === "ar" ? "جاهز للدفع" : "Ready" },
        ]} /></div>
        <div className="hidden items-center gap-1.5 self-start rounded-xl border border-border/40 bg-secondary/40 p-1 sm:flex sm:self-auto">
          {(["all", "handling", "delayed", "ready"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className={`min-h-11 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
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

      <div className="my-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border/50 pb-3 text-xs text-muted-foreground" aria-label={language === "ar" ? "ملخص تجهيز الرحلات" : "Turnaround summary"}>
        <span><strong className="font-mono text-foreground">{kpis.total}</strong> {language === "ar" ? "رحلات" : "turnarounds"}</span>
        <span><strong className="font-mono text-status-warn">{kpis.delayed}</strong> {language === "ar" ? "بتأخير مسجل" : "with recorded delay"}</span>
        <span>{language === "ar" ? "متوسط التأخير" : "Avg delay"} <strong className="font-mono text-foreground">+{kpis.avgDelay}m</strong></span>
        <span className="hidden sm:inline">{language === "ar" ? "مثال تدريبي · الأوقات الفعلية والمستهدفة موضحة" : "Training sample · actual and target times distinguished"}</span>
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
                      {turnaroundStatus(item.status, language === "ar")}
                    </StatusPill>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.airline} &bull; <span className="font-mono">{item.aircraft}</span> &bull; <span className="font-semibold text-foreground">{item.stand}</span>
                  </p>
                </div>
              </div>

            </div>
            <TurnaroundTimeline item={item} />
            <p className="mt-2 text-xs text-muted-foreground" title={language === "ar" ? arabicMilestone(item.criticalMilestone) : item.criticalMilestone}>{language === "ar" ? arabicMilestone(item.criticalMilestone) : item.criticalMilestone}</p>

            {/* Interactive TOBT Adjustment Trigger */}
            <div className="mt-2.5 flex items-center justify-between border-t border-border/30 pt-2 text-xs">
              {editingId === item.id ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  <input
                    type="time"
                    aria-label={language === "ar" ? "الوقت المستهدف الجديد لمغادرة الموقف" : "New target off-block time"}
                    value={revisedTobt}
                    onChange={(e) => setRevisedTobt(e.target.value)}
                    className="h-11 w-24 rounded-lg border border-primary bg-background px-2 font-mono text-xs text-foreground focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveTobt(item.id)}
                    disabled={!/^([01]\d|2[0-3]):[0-5]\d$/.test(revisedTobt)}
                    className="min-h-11 rounded-lg bg-primary px-2.5 font-bold text-primary-foreground text-xs cursor-pointer active-spring"
                  >
                    {language === "ar" ? "حفظ" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="min-h-11 rounded-lg border border-border px-2 text-xs text-muted-foreground hover:bg-secondary cursor-pointer"
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
                  className="flex min-h-11 items-center gap-1 text-primary hover:underline text-xs font-semibold cursor-pointer"
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
