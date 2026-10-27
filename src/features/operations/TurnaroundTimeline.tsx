import type { AcdmTurnaround } from "../../hooks/useAcdmEngine";
import { useLocale } from "../../context/locale";
import { timeDeltaMinutes } from "../../utils/operationalTime";

export function TurnaroundTimeline({ item }: { item: AcdmTurnaround }) {
  const { language } = useLocale();
  const isAr = language === "ar";
  const landingDelta = timeDeltaMinutes(item.eldt, item.aldt);
  const offBlockDelta = timeDeltaMinutes(item.eobt, item.tobt);
  const steps = [
    { key: "land", en: "Landing", ar: "الهبوط", time: item.aldt, kindEn: "Actual", kindAr: "فعلي", other: item.eldt, otherEn: "Est", otherAr: "مقدر", delta: landingDelta },
    { key: "block", en: "In-block", ar: "الوصول للموقف", time: item.aibt, kindEn: "Actual", kindAr: "فعلي", other: null, otherEn: "", otherAr: "", delta: null },
    { key: "off", en: "Off-block", ar: "مغادرة الموقف", time: item.tobt, kindEn: "Target", kindAr: "مستهدف", other: item.eobt, otherEn: "Est", otherAr: "مقدر", delta: offBlockDelta },
    { key: "start", en: "Start-up", ar: "بدء التشغيل", time: item.tsat, kindEn: "Target", kindAr: "مستهدف", other: null, otherEn: "", otherAr: "", delta: null },
    { key: "takeoff", en: "Take-off", ar: "الإقلاع", time: item.ttot, kindEn: "Target", kindAr: "مستهدف", other: null, otherEn: "", otherAr: "", delta: null },
  ];
  const path = <div className="table-scroll" role="region" tabIndex={0} aria-label={isAr ? `مراحل رحلة ${item.outboundFlight}، قابلة للتمرير` : `${item.outboundFlight} milestone path, horizontally scrollable`}>
    <ol className="grid min-w-[600px] grid-cols-5 gap-2 pb-2" aria-label={isAr ? "تسلسل الوصول والمغادرة" : "Arrival to departure sequence"}>
      {steps.map((step, index) => <li key={step.key} className="relative min-w-0 border-t-2 border-border pt-3">
        <span aria-hidden="true" className={`absolute -top-[5px] start-0 h-2 w-2 rounded-full ${step.delta !== null && step.delta > 5 ? "bg-status-warn" : index < 2 ? "bg-status-ok" : "bg-primary"}`} />
        <span className="block text-[11px] font-semibold text-muted-foreground">{isAr ? step.ar : step.en}</span>
        <span className="mt-0.5 block font-mono text-sm font-bold tabular-nums text-foreground" dir="ltr">{step.time}</span>
        <span className="block text-[11px] text-muted-foreground">{isAr ? step.kindAr : step.kindEn}{step.other && <> · {isAr ? step.otherAr : step.otherEn} <span dir="ltr">{step.other}</span></>}</span>
        {step.delta !== null && step.delta !== 0 && <span className={`block text-[11px] font-semibold ${step.delta > 5 ? "text-status-warn" : "text-muted-foreground"}`}>{step.delta > 0 ? "+" : ""}{step.delta}{isAr ? " د" : "m"} {isAr ? "مقارنة بالتقدير" : "vs estimate"}</span>}
      </li>)}
    </ol>
  </div>;

  return <>
    <details className="mt-3 sm:hidden">
      <summary className="flex min-h-11 cursor-pointer items-center text-xs font-semibold text-primary">{isAr ? "عرض تسلسل المراحل" : "View milestone path"} · {isAr ? "مغادرة الموقف" : "Off-block"} <span className="ms-1 font-mono" dir="ltr">{item.tobt}</span></summary>
      {path}
    </details>
    <div className="mt-3 hidden sm:block">{path}</div>
  </>;
}
