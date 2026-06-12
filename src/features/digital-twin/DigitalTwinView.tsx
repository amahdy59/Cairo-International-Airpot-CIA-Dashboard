import { useState, useRef, useEffect, useMemo } from 'react';
import { Sun, Moon, X, Clock3, ArrowRight, ArrowLeft } from 'lucide-react';
import { localize, localizedFlightStatus } from '../../utils/helpers';
import { useLocale } from '../../context/locale';
import { AirportScene, HotspotStatus, MapHotspot, scenes, zoneStatusRows, IncomingFlight, Tone } from '../../data';
import { StatusPill, SectionPanel } from '../../components/command-center/MetricWidgets';
import { useIncomingCaiFlights } from '../../hooks/useIncomingCaiFlights';

function DigitalTwinView() {
  const { language, tr } = useLocale();
  const [activeSceneId, setActiveSceneId] = useState<AirportScene["id"]>("terminal-3");
  const [imageMode, setImageMode] = useState<"light" | "dark">("light");
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);

  
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const [hoverAnchor, setHoverAnchor] = useState<{x: number, y: number} | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const incoming = useIncomingCaiFlights();
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (selectedHotspotId && sidebarRef.current) {
      if (window.innerWidth < 1280) {
        sidebarRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [selectedHotspotId]);

  useEffect(() => {
    // Preload all scene images (light and dark) to browser cache for instant toggles/swaps
    scenes.forEach((scene) => {
      const imgLight = new Image();
      imgLight.src = scene.image;
      const imgDark = new Image();
      imgDark.src = scene.darkImage;
    });
  }, []);

  useEffect(() => {
    setIsImageLoaded(false);
  }, [activeSceneId]);

  const activeScene = scenes.find((scene) => scene.id === activeSceneId) ?? scenes[0];
  const jumpScenes = ["terminal-1", "terminal-2", "terminal-3", "services", "landside"]
    .map((id) => scenes.find((scene) => scene.id === id))
    .filter((scene): scene is AirportScene => Boolean(scene));
  const ImageModeIcon = imageMode === "dark" ? Sun : Moon;
  const selectedHotspot = activeScene.hotspots.find(h => h.id === selectedHotspotId);

  const hotspotStatusDetails = useMemo(() => {
    if (!selectedHotspot) return null;
    const statusLabel = selectedHotspot.status === "warning"
      ? localize({ en: "Needs attention", ar: "يحتاج انتباها" }, language)
      : selectedHotspot.status === "critical"
        ? localize({ en: "Critical", ar: "حرج" }, language)
        : selectedHotspot.status === "good"
          ? localize({ en: "Good", ar: "جيد" }, language)
          : selectedHotspot.status === "offline"
            ? localize({ en: "Offline", ar: "متوقف" }, language)
            : localize({ en: "Info", ar: "معلومة" }, language);

    const toneStyles = 
      selectedHotspot.status === 'good' ? 'border-status-ok/30 bg-status-ok/10 text-status-ok' :
      selectedHotspot.status === 'warning' ? 'border-status-warn/30 bg-status-warn/10 text-status-warn' :
      selectedHotspot.status === 'critical' ? 'border-status-crit/30 bg-status-crit/10 text-status-crit' :
      'border-status-info/30 bg-status-info/10 text-status-info';

    const toneColor = 
      selectedHotspot.status === 'good' ? 'bg-status-ok' :
      selectedHotspot.status === 'warning' ? 'bg-status-warn' :
      selectedHotspot.status === 'critical' ? 'bg-status-crit' :
      'bg-status-info';

    return { statusLabel, toneStyles, toneColor };
  }, [selectedHotspot, language]);

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
        id={`hotspot-marker-${hotspot.id}`}
        transform={`translate(${hotspot.cx * 16}, ${hotspot.cy * 9})`} 
        onClick={() => {
          setSelectedHotspotId(hotspot.id);
          setHoveredHotspotId(null);
        }}
        onPointerEnter={(e) => {
          if (selectedHotspotId !== hotspot.id) {
            setHoveredHotspotId(hotspot.id);
            const rect = e.currentTarget.getBoundingClientRect();
            setHoverAnchor({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
          }
        }}
        onPointerLeave={() => setHoveredHotspotId(null)}
        role="button"
        tabIndex={0}
        aria-label={`${tr(hotspot.title)}. ${tr(hotspot.status === 'warning' ? 'Needs attention' : hotspot.status === 'critical' ? 'Critical' : hotspot.status === 'good' ? 'Good' : hotspot.status === 'offline' ? 'Offline' : 'Info')}`}
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

  const imageFilter = "none";


  return (
    <div className="grid min-w-0 gap-3 lg:gap-4">
      <SectionPanel className="overflow-hidden p-0" title="">
        <nav className="border-b border-border bg-card/70 px-4 py-2.5" aria-label={localize({ en: "Airport image sections", ar: "أقسام صورة المطار" }, language)}>
          <div className="flex min-w-0 items-center justify-between gap-4 overflow-x-auto">
            <div className="flex items-center gap-3">
              <h2 className="shrink-0 font-bold tracking-tight text-foreground">{localize({ en: "Visual command map", ar: "خريطة القيادة المرئية" }, language)}</h2>
              <span className="hidden sm:inline-block shrink-0 font-mono text-[10px] font-semibold uppercase text-muted-foreground/40">|</span>
              <div className="flex min-w-max items-center gap-1.5">
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
            </div>
          </div>
        </nav>

        <div className="grid min-w-0 gap-0 xl:grid-cols-[minmax(0,1fr)_minmax(340px,400px)]">
          <div className="flex flex-col min-w-0 border-b xl:border-b-0 border-border">
            <div id="digital-twin-image-container" ref={imageContainerRef} className="relative min-w-0 bg-black aspect-video w-full overflow-hidden">
            <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" role="img" aria-label={localize({ en: `${activeScene.title} operational image map`, ar: `خريطة الصورة التشغيلية لـ ${tr(activeScene.title)}` }, language)}>
              {/* Light Scene Image */}
              <image 
                onLoad={() => setIsImageLoaded(true)} 
                href={activeScene.image} 
                width="1600" 
                height="900" 
                preserveAspectRatio="xMidYMid slice" 
                style={{ 
                  opacity: imageMode === "light" ? 1 : 0, 
                  transition: "opacity 150ms ease-in-out", 
                  transformOrigin: "center", 
                  filter: imageFilter 
                }} 
              />
              
              {/* Dark Scene Image */}
              <image 
                onLoad={() => setIsImageLoaded(true)} 
                href={activeScene.darkImage} 
                width="1600" 
                height="900" 
                preserveAspectRatio="xMidYMid slice" 
                style={{ 
                  opacity: imageMode === "dark" ? 1 : 0, 
                  transition: "opacity 150ms ease-in-out", 
                  transformOrigin: "center", 
                  filter: imageFilter 
                }} 
              />

              {/* Render Hotspots */}
              {isImageLoaded && activeScene.hotspots.map(renderHotspotMarker)}
            </svg>
            {/* Floating Dark/Light image mode toggle for all screens */}
            <button
              type="button"
              onClick={() => setImageMode(imageMode === "dark" ? "light" : "dark")}
              className="absolute top-3 end-3 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background/80 hover:bg-background backdrop-blur-md shadow-md text-foreground transition-colors"
              title={localize({ en: imageMode === "dark" ? "Light image" : "Dark image", ar: imageMode === "dark" ? "صورة فاتحة" : "صورة داكنة" }, language)}
              aria-label={localize({ en: imageMode === "dark" ? "Light image" : "Dark image", ar: imageMode === "dark" ? "صورة فاتحة" : "صورة داكنة" }, language)}
            >
              <ImageModeIcon className="h-4 w-4" />
            </button>
            </div>
          {/* Popover renders OUTSIDE overflow-hidden — fixed to viewport, never cropped */}
          {activeScene.hotspots.find(h => h.id === hoveredHotspotId) && hoverAnchor && !selectedHotspot && (
            <BriefPopover 
              hotspot={activeScene.hotspots.find(h => h.id === hoveredHotspotId)!} 
              anchor={hoverAnchor} 
            />
          )}
          {/* Selected hotspot popover modal removed in favor of sidebar dashboard panel */}
          </div>

          <aside ref={sidebarRef} className="grid min-w-0 content-start gap-0 border-t border-border bg-card xl:border-s xl:border-t-0 h-full xl:max-h-[580px] overflow-y-auto">
            {selectedHotspot ? (
              <div className="p-4 flex flex-col gap-3">
                {/* Header: Back to Overview & Close button */}
                <div className="flex items-center justify-between border-b border-border/40 pb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHotspotId(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/50 px-2 py-1 text-xs font-semibold text-foreground transition hover:bg-background/80 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                    {tr("Back to overview")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHotspotId(null);
                    }}
                    className="rounded-lg p-0.5 text-muted-foreground hover:bg-background/80 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                    aria-label={tr("Close")}
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Hotspot Title & Category */}
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">{tr(selectedHotspot.category)}</span>
                  <h3 className="text-base font-bold tracking-tight text-foreground">{tr(selectedHotspot.title)}</h3>
                </div>

                {/* Status & Update Time */}
                <div className="flex items-center justify-between gap-3 rounded-lg border border-border/45 bg-secondary/5 px-2.5 py-1.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-muted-foreground">{localize({ en: "Status:", ar: "الحالة:" }, language)}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0 text-[9px] font-mono font-bold uppercase tracking-wider border ${hotspotStatusDetails?.toneStyles}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${hotspotStatusDetails?.toneColor} ${selectedHotspot.status === 'critical' || selectedHotspot.status === 'warning' ? 'animate-pulse' : ''}`}></span>
                      {hotspotStatusDetails?.statusLabel}
                    </span>
                  </div>
                  {selectedHotspot.updatedAt && (
                    <div className="flex items-center gap-1 text-muted-foreground font-mono text-[10px]">
                      <Clock3 className="h-3 w-3" />
                      <span>{selectedHotspot.updatedAt}</span>
                    </div>
                  )}
                </div>

                {/* Operational Impact */}
                {selectedHotspot.impact && (
                  <div className="rounded-lg border border-border/40 bg-background/50 p-2.5 text-xs leading-relaxed text-foreground shadow-inner">
                    <span className="font-bold text-primary me-1">{localize({ en: "Operational Impact:", ar: "التأثير التشغيلي:" }, language)}</span>
                    {tr(selectedHotspot.impact)}
                  </div>
                )}

                {/* Diagnostic Evidence */}
                {selectedHotspot.evidence && (
                  <div className="rounded-lg border border-border/30 bg-status-warn/5 p-2.5 text-xs leading-relaxed text-muted-foreground">
                    <span className="font-bold text-status-warn me-1">{localize({ en: "Evidence:", ar: "الأدلة:" }, language)}</span>
                    {tr(selectedHotspot.evidence)}
                  </div>
                )}

                {/* CCTV Feed */}
                <div className="flex flex-col rounded-lg overflow-hidden border border-border/60 bg-black">
                  <div className="flex items-center justify-between bg-zinc-950 px-2.5 py-1 border-b border-border/30">
                    <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider">REC // {selectedHotspot.source || "T3-GATE-B12"}</span>
                    <div className="flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-rose-600 animate-pulse"></span>
                      <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">LIVE</span>
                    </div>
                  </div>
                  <div className="h-[86px] overflow-hidden relative">
                    <CctvTerminalLoop />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-1 pt-2 border-t border-border/30 space-y-1.5">
                  <button
                    type="button"
                    className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-[0_0_20px_rgba(88,214,255,0.15)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
                  >
                    {localize({ en: "View full analytics", ar: "عرض التحليلات كاملة" }, language)}
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                  </button>
                  {selectedHotspot.action && (
                    <div className="text-center text-[10px] text-muted-foreground">
                      <span className="uppercase tracking-wider font-mono me-1">{localize({ en: "Action:", ar: "الإجراء:" }, language)}</span>
                      <span className="text-primary font-semibold">{tr(selectedHotspot.action)}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary font-bold">{tr("Area Overview")}</p>
                  <h3 className="mt-1 text-base font-bold tracking-tight text-foreground">{tr(activeScene.title)}</h3>
                  <p className="mt-1 text-xs leading-normal text-muted-foreground line-clamp-2">{tr(activeScene.summary)}</p>
                  
                  <div className="mt-3.5 border-t border-border pt-3">
                    <h4 className="text-xs font-bold mb-2 text-foreground">{localize({ en: "Active Issues", ar: "المشكلات النشطة" }, language)}</h4>
                    <div className="grid gap-1.5">
                      {activeScene.hotspots.filter(h => h.status !== "good" && h.status !== "info").length > 0 ? 
                        activeScene.hotspots.filter(h => h.status !== "good" && h.status !== "info").map(h => (
                          <button 
                            key={h.id} 
                            type="button"
                            onClick={() => {
                              setSelectedHotspotId(h.id);
                            }}
                            className="flex items-center justify-between w-full rounded-md border border-border/80 px-2.5 py-1.5 text-start transition hover:border-primary hover:bg-secondary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="block h-2 w-2 shrink-0 rounded-full animate-pulse" style={{ backgroundColor: getStatusColor(h.status) }} />
                              <p className="text-xs font-semibold truncate text-foreground">{tr(h.title)}</p>
                            </div>
                            <span className="text-[9px] text-muted-foreground shrink-0 uppercase font-mono">{tr(h.category)}</span>
                          </button>
                        ))
                      : (
                        <p className="text-xs text-muted-foreground italic">{localize({ en: "No critical issues in this area.", ar: "لا توجد مشكلات حرجة في هذه المنطقة." }, language)}</p>
                      )}
                    </div>
                  </div>
                </div>
              
                <div className="mt-auto border-t border-border p-3 bg-surface-2/25">
                  <IncomingFlightsPanel flights={incoming.flights} source={incoming.source} updatedAt={incoming.updatedAt} />
                  <div className="mt-2.5">
                    <ZoneStatusPanel />
                  </div>
                </div>
              </>
            )}
          </aside>
        </div>
      </SectionPanel>

    </div>
  );
}


function CctvTerminalLoop() {
  return (
    <div className="cctv-loop overflow-hidden rounded-lg border border-border bg-black" aria-label="Cairo Airport terminal CCTV view showing passengers moving near departures and boarding gates">
      <div className="cctv-frame relative w-full h-full">
        <img 
          src="/manager-assets/cctv-live.webp" 
          alt="CCTV live feed" 
          className="w-full h-full object-cover opacity-85" 
        />
        <span className="cctv-scanline" />
        <span className="cctv-timestamp">CAI CCTV · LIVE FEED</span>
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
  const { language, tr } = useLocale();
  const sourceLabel = source === "live"
    ? localize({ en: "Live", ar: "مباشر" }, language)
    : source === "loading"
      ? localize({ en: "Loading", ar: "تحميل" }, language)
      : localize({ en: "Offline", ar: "غير متصل" }, language);
  const sourceTone: Tone = source === "live" ? "ok" : source === "loading" ? "info" : "neutral";

  return (
    <section className="panel-inner p-2.5" aria-label={localize({ en: "Incoming flights", ar: "الرحلات القادمة" }, language)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-primary font-bold">{localize({ en: "Incoming flights", ar: "الرحلات القادمة" }, language)}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground font-mono">{updatedAt}</span>
          <StatusPill tone={sourceTone} className="text-[9px] px-1.5 py-0">{sourceLabel}</StatusPill>
        </div>
      </div>
      <div className="grid gap-1">
        {flights.slice(0, 3).map((flight) => (
          <div key={`${flight.flight}-${flight.eta}`} className="flex items-center justify-between text-xs py-0.5 border-b border-border/30 last:border-b-0">
            <span className="font-mono font-bold text-foreground">{flight.flight}</span>
            <span className="text-muted-foreground truncate max-w-[80px] text-[11px]">{tr(flight.origin.split(" (")[0])}</span>
            <span className="font-mono text-foreground">{flight.eta}</span>
            <span className="font-mono text-muted-foreground text-[11px]">{flight.gate.replace("T3 / ", "").replace("Gate ", "")}</span>
            <span className={`text-[10px] font-semibold shrink-0 ${
              flight.tone === 'ok' ? 'text-status-ok' :
              flight.tone === 'warn' ? 'text-status-warn' :
              flight.tone === 'crit' ? 'text-status-crit' : 'text-muted-foreground'
            }`}>
              {localizedFlightStatus(flight.status, language)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ZoneStatusPanel() {
  const { language } = useLocale();
  return (
    <section className="panel-inner p-2.5" aria-label={localize({ en: "Terminal zone status", ar: "حالة مناطق المباني" }, language)}>
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-primary font-bold">{localize({ en: "Zone status", ar: "حالة المناطق" }, language)}</p>
      <div className="grid gap-1">
        {zoneStatusRows.map((zone) => (
          <div key={zone.zone} className="flex items-center justify-between text-xs py-0.5 border-b border-border/30 last:border-b-0">
            <span className="font-semibold text-foreground">{language === "ar" ? zone.zone.replace("Terminal", "مبنى") : zone.zone.replace("Terminal ", "T")}</span>
            <span className="text-muted-foreground text-[11px] truncate max-w-[130px]">{localize(zone.detail, language)}</span>
            <span className={`text-[10px] font-bold uppercase ${
              zone.tone === 'ok' ? 'text-status-ok' :
              zone.tone === 'warn' ? 'text-status-warn' :
              zone.tone === 'crit' ? 'text-status-crit' : 'text-muted-foreground'
            }`}>
              {localize(zone.status, language)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default DigitalTwinView;

function BriefPopover({ hotspot, anchor }: { hotspot: MapHotspot; anchor: {x: number, y: number} }) {
  const { language, tr } = useLocale();
  const toneStyles = 
    hotspot.status === 'good' ? 'border-status-ok/30 bg-status-ok/10 text-status-ok' :
    hotspot.status === 'warning' ? 'border-status-warn/30 bg-status-warn/10 text-status-warn' :
    hotspot.status === 'critical' ? 'border-status-crit/30 bg-status-crit/10 text-status-crit' :
    'border-status-info/30 bg-status-info/10 text-status-info';
  
  const toneColor = 
    hotspot.status === 'good' ? 'bg-status-ok' :
    hotspot.status === 'warning' ? 'bg-status-warn' :
    hotspot.status === 'critical' ? 'bg-status-crit' :
    'bg-status-info';

  const statusLabel = hotspot.status === "warning" ? localize({ en: "Needs attention", ar: "يحتاج انتباها" }, language) : hotspot.status === "critical" ? localize({ en: "Critical", ar: "حرج" }, language) : hotspot.status === "good" ? localize({ en: "Good", ar: "جيد" }, language) : hotspot.status === "offline" ? localize({ en: "Offline", ar: "متوقف" }, language) : localize({ en: "Info", ar: "معلومة" }, language);

  return (
    <div className="fixed z-[200] pointer-events-none" style={{ left: anchor.x, top: anchor.y - 14, transform: "translate(-50%, -100%)" }}>
      <div className="panel overflow-hidden p-0 shadow-[0_8px_32px_rgba(0,0,0,0.8)] border border-primary bg-[#0B121A]/95 backdrop-blur-xl w-max max-w-[320px]">
        <div className="flex items-center justify-between gap-4 p-3 pb-2 whitespace-nowrap">
          <h3 className="text-sm font-bold tracking-tight text-foreground">{tr(hotspot.title)}</h3>
          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${toneStyles}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${toneColor}`}></span>
            {statusLabel}
          </span>
        </div>
        <div className="flex flex-col p-3 pt-0 w-0 min-w-full whitespace-normal">
          <p className="text-xs text-muted-foreground line-clamp-2">{tr(hotspot.impact)}</p>
          <div className="text-[10px] text-primary/80 uppercase tracking-widest font-mono mt-2">{localize({en: "Click hotspot to expand", ar: "انقر للتوسيع"}, language)}</div>
        </div>
      </div>
      <svg className="absolute left-1/2 bottom-[-14px] transform -translate-x-1/2 pointer-events-none" width="2" height="14">
        <line x1="1" y1="0" x2="1" y2="14" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="2 2" className="opacity-60" />
      </svg>
    </div>
  );
}