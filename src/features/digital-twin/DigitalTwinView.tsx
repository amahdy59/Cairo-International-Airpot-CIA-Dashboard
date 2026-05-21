import { useState, useRef, useEffect, useMemo } from 'react';
import { Sun, Moon, X, BarChart3, Clock3, Camera, ArrowRight } from 'lucide-react';
import { localize, formatCairoTime, toneCssVar, localizedFlightStatus } from '../../utils/helpers';
import { useLocale } from '../../context/locale';
import { AirportScene, HotspotStatus, MapHotspot, scenes, zoneStatusRows, IncomingFlight, Tone, sampleIncomingFlights } from '../../data';
import { StatusPill, SectionPanel } from '../../components/command-center/MetricWidgets';
import { useIncomingCaiFlights } from '../../hooks/useIncomingCaiFlights';

function DigitalTwinView() {
  const { language, tr } = useLocale();
  const [activeSceneId, setActiveSceneId] = useState<AirportScene["id"]>("terminal-3");
  const [imageMode, setImageMode] = useState<"light" | "dark">("light");
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const incoming = useIncomingCaiFlights();
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const activeScene = scenes.find((scene) => scene.id === activeSceneId) ?? scenes[0];
  const jumpScenes = ["terminal-1", "terminal-2", "terminal-3", "services", "landside"]
    .map((id) => scenes.find((scene) => scene.id === id))
    .filter((scene): scene is AirportScene => Boolean(scene));
  const ImageModeIcon = imageMode === "dark" ? Sun : Moon;
  const selectedHotspot = activeScene.hotspots.find(h => h.id === selectedHotspotId);

  const getStatusColor = (status: HotspotStatus) => {
    switch (status) {
      case "critical": return "#D92D20";
      case "warning": return "#F79009";
      case "good": return "#12B76A";
      case "info": return "#2E90FA";
      case "offline": return "#98A2B3";
    }
  };

  const renderHotspotMarker = (hotspot: MapHotspot) => {
    const isSelected = selectedHotspotId === hotspot.id;
    const color = getStatusColor(hotspot.status);
    
    // SVG Hotspot
    return (
      <g 
        key={hotspot.id} 
        transform={`translate(${hotspot.cx * 16}, ${hotspot.cy * 9})`} 
        onClick={() => setSelectedHotspotId(hotspot.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setSelectedHotspotId(hotspot.id);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`${hotspot.title}. ${hotspot.status}`}
        className="cursor-pointer"
      >
        {/* Outer Glow */}
        <circle 
          r={isSelected ? "28" : "20"} 
          fill={color} 
          opacity="0.25" 
          className={hotspot.status === "critical" ? "animate-pulse" : ""}
        />
        {/* Main Ring */}
        <circle 
          r={isSelected ? "14" : "10"} 
          fill="none" 
          stroke={color} 
          strokeWidth={isSelected ? "3" : "2"} 
        />
        {/* Inner Dot */}
        <circle 
          r={isSelected ? "6" : "4"} 
          fill={color} 
        />
      </g>
    );
  };

  const imageFilter = [
    selectedHotspot ? "blur(2px)" : "",
  ].filter(Boolean).join(" ") || "none";
  const sceneImage = imageMode === "dark" ? activeScene.darkImage : activeScene.image;

  return (
    <div className="grid min-w-0 gap-3 lg:gap-4">
      <SectionPanel className="overflow-hidden p-0" title="">
        <div className="min-w-0 border-b border-border p-4">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">{localize({ en: "Interactive airport image map", ar: "خريطة تفاعلية للمطار" }, language)}</p>
          <h2 className="mt-2 text-xl font-bold sm:text-2xl">{localize({ en: "Cairo Airport visual command map", ar: "خريطة القيادة المرئية لمطار القاهرة" }, language)}</h2>
        </div>

        <nav className="border-b border-border bg-card/70 p-3" aria-label={localize({ en: "Airport image sections", ar: "أقسام صورة المطار" }, language)}>
          <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
            <span className="shrink-0 px-2 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">{localize({ en: "Jump to", ar: "انتقل إلى" }, language)}</span>
            <div className="flex min-w-max items-center gap-2">
              {jumpScenes.map((scene) => {
                const active = scene.id === activeSceneId;
                return (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => {
                      setActiveSceneId(scene.id);
                      setSelectedHotspotId(null);
                    }}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex h-10 shrink-0 items-center justify-center rounded-xl border px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                      active ? "border-primary/50 bg-primary/[0.16] text-foreground shadow-[0_0_18px_rgba(88,214,255,0.14)]" : "border-transparent text-muted-foreground hover:border-border hover:bg-background/65 hover:text-foreground"
                    }`}
                  >
                    {tr(scene.label)}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setImageMode(imageMode === "dark" ? "light" : "dark")}
              className="ms-auto inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-background/70 px-4 text-sm font-semibold hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <ImageModeIcon className="h-4 w-4" />
              {localize({ en: imageMode === "dark" ? "Light image" : "Dark image", ar: imageMode === "dark" ? "صورة فاتحة" : "صورة داكنة" }, language)}
            </button>
          </div>
        </nav>

        <div className="grid min-w-0 gap-0 xl:grid-cols-[minmax(0,1fr)_minmax(340px,400px)]">
          <div className="flex flex-col min-w-0 border-b xl:border-b-0 border-border">
            <div ref={imageContainerRef} className="relative min-w-0 bg-black aspect-video sm:aspect-auto sm:min-h-[500px] lg:min-h-[700px] xl:min-h-[800px] overflow-hidden">
            <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" role="img" aria-label={`${activeScene.title} operational image map`}>
              <title>{activeScene.title} operational image map</title>
              <image href={sceneImage} width="1600" height="900" preserveAspectRatio="xMidYMid slice" style={{ filter: imageFilter, transformOrigin: "center", transition: "filter 180ms ease" }} />

              {/* Render Hotspots */}
              {activeScene.hotspots.map(renderHotspotMarker)}
            </svg>
            </div>
          {/* Popover renders OUTSIDE overflow-hidden — fixed to viewport, never cropped */}
          {selectedHotspot && (
            <HotspotPopover
              hotspot={selectedHotspot}
              statusColor={getStatusColor(selectedHotspot.status)}
              onClose={() => setSelectedHotspotId(null)}
              imageRef={imageContainerRef}
            />
          )}
          </div>

          <aside className="grid min-w-0 content-start gap-0 border-t border-border bg-card xl:border-s xl:border-t-0 h-full max-h-[800px] overflow-y-auto">
              <div className="p-6">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">{tr("Area Overview")}</p>
                <h3 className="mt-3 text-xl font-bold tracking-tight">{tr(activeScene.title)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tr(activeScene.summary)}</p>
                
                <div className="mt-6 border-t border-border pt-5">
                  <h4 className="text-sm font-bold mb-3 text-foreground">{localize({ en: "Active Issues", ar: "المشكلات النشطة" }, language)}</h4>
                  <div className="grid gap-3">
                    {activeScene.hotspots.filter(h => h.status !== "good" && h.status !== "info").length > 0 ? 
                      activeScene.hotspots.filter(h => h.status !== "good" && h.status !== "info").map(h => (
                        <button 
                          key={h.id} 
                          type="button"
                          onClick={() => setSelectedHotspotId(h.id)}
                          className="flex items-start gap-3 rounded-md border border-border p-3 text-start transition hover:border-primary hover:bg-secondary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          <span className="mt-0.5 block h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: getStatusColor(h.status) }} />
                          <div>
                            <p className="text-sm font-medium">{h.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{h.evidence}</p>
                          </div>
                        </button>
                      ))
                    : (
                      <p className="text-sm text-muted-foreground italic">No critical issues or attention items in this area.</p>
                    )}
                  </div>
                </div>
              </div>
            
               <div className="mt-auto border-t border-border p-6 bg-surface-2/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-primary">{localize({ en: "Incoming Operations", ar: "العمليات القادمة" }, language)}</h4>
                  <IncomingFlightsPanel flights={incoming.flights} source={incoming.source} updatedAt={incoming.updatedAt} />
                  <div className="mt-3">
                    <ZoneStatusPanel />
                  </div>
               </div>
          </aside>
        </div>
      </SectionPanel>

    </div>
  );
}



function HotspotPopover({ hotspot, statusColor, onClose, imageRef }: { hotspot: MapHotspot; statusColor: string; onClose: () => void; imageRef?: React.RefObject<HTMLDivElement | null> }) {
  const { language, tr } = useLocale();
  const popoverRef = useRef<HTMLDivElement>(null);

  const statusLabel = hotspot.status === "warning"
    ? localize({ en: "Needs attention", ar: "يحتاج انتباها" }, language)
    : hotspot.status === "critical"
      ? localize({ en: "Critical", ar: "حرج" }, language)
      : hotspot.status === "good"
        ? localize({ en: "Good", ar: "جيد" }, language)
        : hotspot.status === "offline"
          ? localize({ en: "Offline", ar: "متوقف" }, language)
          : localize({ en: "Info", ar: "معلومة" }, language);

  // Compute position: map hotspot cx/cy (0–100) onto the image container's
  // DOMRect, then clamp to keep the popover fully on-screen.
  const style = useMemo(() => {
    const POPOVER_W = 290;
    const POPOVER_H = 340; // generous estimate
    const PAD = 12;

    if (!imageRef?.current) {
      // Fallback: center of viewport
      return { position: "fixed" as const, top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: POPOVER_W, zIndex: 200 };
    }

    const rect = imageRef.current.getBoundingClientRect();
    const anchorX = rect.left + (hotspot.cx / 100) * rect.width;
    const anchorY = rect.top  + (hotspot.cy / 100) * rect.height;

    // Prefer to open to the right, flip left if near right edge
    let left = anchorX + 12;
    if (left + POPOVER_W > window.innerWidth - PAD) {
      left = anchorX - POPOVER_W - 12;
    }
    // Clamp to viewport bounds
    left = Math.max(PAD, Math.min(left, window.innerWidth - POPOVER_W - PAD));

    // Prefer to open downward, flip up if near bottom edge
    let top = anchorY - 60;
    if (top + POPOVER_H > window.innerHeight - PAD) {
      top = anchorY - POPOVER_H + 60;
    }
    top = Math.max(PAD, Math.min(top, window.innerHeight - POPOVER_H - PAD));

    return { position: "fixed" as const, top, left, width: POPOVER_W, zIndex: 200 };
  }, [hotspot.cx, hotspot.cy, imageRef]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Move focus into the popover when it mounts
  useEffect(() => {
    popoverRef.current?.focus();
  }, []);

  return (
    <>
      {/* Full-screen click-to-close backdrop */}
      <div className="fixed inset-0 z-[199]" onClick={onClose} aria-hidden="true" />
      {/* Popover card */}
      <div
        ref={popoverRef}
        className="hotspot-popover panel overflow-hidden p-0 shadow-2xl"
        style={{ ...style, maxHeight: "min(380px, calc(100vh - 24px))", overflowY: "auto" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hotspot-popover-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <h2 id="hotspot-popover-title" className="truncate text-base font-semibold tracking-tight">{tr(hotspot.title)}</h2>
            <span className="shrink-0 rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold uppercase tracking-[0.1em] text-white" style={{ backgroundColor: statusColor }}>
              {statusLabel}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-background/70 hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label={tr("Close")}
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-2 p-3">
          {hotspot.impact && (
            <section className="panel-inner p-3">
              <h3 className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <BarChart3 aria-hidden="true" className="h-3.5 w-3.5" />
                {localize({ en: "Operational impact", ar: "الأثر التشغيلي" }, language)}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-foreground">{hotspot.impact}</p>
              {hotspot.updatedAt && (
                <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                  {localize({ en: "Updated", ar: "آخر تحديث" }, language)} {hotspot.updatedAt}
                </p>
              )}
            </section>
          )}

          <section className="panel-inner p-3">
            <h3 className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Camera aria-hidden="true" className="h-3.5 w-3.5" />
              CCTV
            </h3>
            <CctvTerminalLoop />
          </section>

          <button
            type="button"
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_0_24px_rgba(88,214,255,0.18)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {localize({ en: "View full analytics", ar: "عرض التحليلات كاملة" }, language)}
            <ArrowRight aria-hidden="true" className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </>
  );
}

function CctvTerminalLoop() {
  return (
    <div className="cctv-loop mt-4 overflow-hidden rounded-lg border border-border bg-black" aria-label="Generic three second airport terminal CCTV sample without visible faces">
      <div className="cctv-frame">
        <span className="cctv-ceiling" />
        <span className="cctv-floor" />
        <span className="cctv-left-wall" />
        <span className="cctv-right-wall" />
        <span className="cctv-gate cctv-gate-a" />
        <span className="cctv-gate cctv-gate-b" />
        <span className="cctv-scanline" />
        <span className="cctv-timestamp">CAI CCTV · 00:03 LOOP</span>
      </div>
    </div>
  );
}

function IncomingFlightsPanel({
  flights,
  source,
  updatedAt,
}: {
  flights: IncomingFlight[];
  source: "live" | "sample" | "loading";
  updatedAt: string;
}) {
  const { language } = useLocale();
  const sourceLabel = source === "live"
    ? localize({ en: "Live API", ar: "API مباشر" }, language)
    : source === "loading"
      ? localize({ en: "Loading", ar: "جار التحميل" }, language)
      : localize({ en: "Sample data", ar: "بيانات عينة" }, language);
  const sourceTone: Tone = source === "live" ? "ok" : source === "loading" ? "info" : "neutral";

  return (
    <section className="panel-inner p-4 sm:p-5" aria-label={localize({ en: "Incoming flights", ar: "الرحلات القادمة" }, language)}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary font-semibold">{localize({ en: "Incoming flights", ar: "الرحلات القادمة" }, language)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {localize({ en: "Last updated", ar: "آخر تحديث" }, language)}: {updatedAt}
          </p>
        </div>
        <StatusPill tone={sourceTone}>{sourceLabel}</StatusPill>
      </div>
      <div className="grid gap-2">
        {flights.map((flight) => (
          <article key={`${flight.flight}-${flight.eta}`} className="rounded-md border border-border/70 bg-background/45 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{flight.airline} · <span className="font-mono">{flight.flight}</span></p>
                <p className="mt-1 text-xs text-muted-foreground">{flight.origin}</p>
              </div>
              <StatusPill tone={flight.tone}>{localizedFlightStatus(flight.status, language)}</StatusPill>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-muted-foreground">{localize({ en: "ETA", ar: "الوصول المتوقع" }, language)}</dt>
                <dd className="font-mono font-semibold">{flight.eta}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{localize({ en: "Gate", ar: "البوابة" }, language)}</dt>
                <dd className="font-mono font-semibold">{flight.gate}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}

function ZoneStatusPanel() {
  const { language } = useLocale();
  return (
    <section className="panel-inner p-4 sm:p-5" aria-label={localize({ en: "Terminal zone status", ar: "حالة مناطق المباني" }, language)}>
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-primary font-semibold">{localize({ en: "Zone status", ar: "حالة المناطق" }, language)}</p>
      <div className="grid gap-2">
        {zoneStatusRows.map((zone) => (
          <article key={zone.zone} className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-background/45 p-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold">{language === "ar" ? zone.zone.replace("Terminal", "مبنى") : zone.zone}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{localize(zone.detail, language)}</p>
            </div>
            <StatusPill tone={zone.tone}>{localize(zone.status, language)}</StatusPill>
          </article>
        ))}
      </div>
    </section>
  );
}

export default DigitalTwinView;