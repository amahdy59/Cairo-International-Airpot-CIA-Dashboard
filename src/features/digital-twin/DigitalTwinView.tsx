import { useState, useRef, useEffect, useMemo } from 'react';
import { Sun, Moon, X, Clock3, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Move, Zap } from 'lucide-react';
import { localize, localizedFlightStatus } from '../../utils/helpers';
import { useLocale } from '../../context/locale';
import { AirportScene, HotspotStatus, MapHotspot, scenes, zoneStatusRows, IncomingFlight, Tone } from '../../data';
import { StatusPill, SectionPanel } from '../../components/command-center/MetricWidgets';
import { useIncomingCaiFlights } from '../../hooks/useIncomingCaiFlights';

function DigitalTwinView({ theme }: { theme?: "light" | "dark" }) {
  const { language, tr } = useLocale();
  const [activeSceneId, setActiveSceneId] = useState<AirportScene["id"]>("terminal-3");
  const [imageMode, setImageMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (theme) {
      setImageMode(theme);
    }
  }, [theme]);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);

  
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const [hoverAnchor, setHoverAnchor] = useState<{x: number, y: number} | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const incoming = useIncomingCaiFlights();
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const scrollLeft = useRef(0);
  const scrollTop = useRef(0);
  const dragStartPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    startX.current = e.pageX - imageContainerRef.current!.offsetLeft;
    startY.current = e.pageY - imageContainerRef.current!.offsetTop;
    scrollLeft.current = imageContainerRef.current!.scrollLeft;
    scrollTop.current = imageContainerRef.current!.scrollTop;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const x = e.pageX - imageContainerRef.current!.offsetLeft;
    const y = e.pageY - imageContainerRef.current!.offsetTop;
    const walkX = (x - startX.current) * 1.5;
    const walkY = (y - startY.current) * 1.5;
    imageContainerRef.current!.scrollLeft = scrollLeft.current - walkX;
    imageContainerRef.current!.scrollTop = scrollTop.current - walkY;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    dragStartPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleHotspotClick = (hotspotId: string, e: React.MouseEvent) => {
    const dx = Math.abs(e.clientX - dragStartPos.current.x);
    const dy = Math.abs(e.clientY - dragStartPos.current.y);
    if (dx > 5 || dy > 5) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    setSelectedHotspotId(hotspotId);
    setHoveredHotspotId(null);
  };

  const scrollMap = (direction: "left" | "right" | "up" | "down") => {
    if (imageContainerRef.current) {
      let scrollX = 0;
      let scrollY = 0;
      const amount = 250;
      if (direction === "left") scrollX = -amount;
      if (direction === "right") scrollX = amount;
      if (direction === "up") scrollY = -amount;
      if (direction === "down") scrollY = amount;

      imageContainerRef.current.scrollBy({
        left: scrollX,
        top: scrollY,
        behavior: "smooth"
      });
    }
  };

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
    // Preload CCTV image to resolve dynamic load latency
    const cctvImg = new Image();
    cctvImg.src = "/manager-assets/cctv-live.webp";
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
        onClick={(e) => handleHotspotClick(hotspot.id, e)}
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
      <SectionPanel className="overflow-hidden p-0!" title="">
        <nav className="border-b border-border bg-card/70 px-2 lg:px-4 py-2" aria-label={localize({ en: "Airport image sections", ar: "أقسام صورة المطار" }, language)}>
          <div className="flex min-w-0 items-center justify-between gap-4 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2.5">
              <h2 className="shrink-0 text-sm sm:text-base font-bold tracking-tight text-foreground">{localize({ en: "Visual command map", ar: "خريطة القيادة المرئية" }, language)}</h2>
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
                    className={`inline-flex h-8 sm:h-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl border px-2.5 sm:px-3.5 text-xs lg:text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
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

        <div className="grid min-w-0 px-1 py-3 lg:p-4 gap-3 lg:gap-4 md:grid-cols-[60%_1fr] lg:grid-cols-[1fr_360px] md:h-[calc(100vh-170px)] md:min-h-[500px]">
          <div className="flex flex-col min-w-0 h-full relative">
            <div id="digital-twin-image-viewport" className="relative min-w-0 bg-black/40 aspect-[4/3] sm:aspect-[3/2] md:aspect-auto w-full md:h-full md:flex-1 rounded-xl border border-border shadow-inner overflow-hidden">
              <div 
                id="digital-twin-image-container" 
                ref={imageContainerRef} 
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                className="w-full h-full overflow-auto no-scrollbar cursor-grab active:cursor-grabbing select-none"
              >
                <div className="min-h-[120%] sm:min-h-[115%] md:min-h-[110%] min-w-[145%] sm:min-w-[130%] md:min-w-[125%] relative">
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
                </div>
              </div>

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

              {/* Mobile/Tablet: Subtle Drag Indicator */}
              <div className="absolute bottom-3 left-3 z-10 lg:hidden flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-1 text-[10px] font-medium text-foreground/75 backdrop-blur-md shadow-sm select-none pointer-events-none">
                <Move className="h-3 w-3 text-primary animate-pulse" />
                <span>{localize({ en: "Drag to pan", ar: "اسحب للتحريك" }, language)}</span>
              </div>

              {/* Desktop: Consolidated Navigation Controller (D-pad) in bottom-left */}
              <div className="hidden lg:block absolute bottom-3 left-3 z-10 flex flex-col gap-1 rounded-xl border border-border bg-background/85 p-1.5 backdrop-blur-md shadow-lg">
                <div className="grid grid-cols-3 gap-1">
                  {/* Row 1 */}
                  <div />
                  <button
                    type="button"
                    onClick={() => scrollMap("up")}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background/50 hover:bg-background text-foreground transition-colors cursor-pointer"
                    aria-label={localize({ en: "Scroll up", ar: "التمرير لأعلى" }, language)}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <div />

                  {/* Row 2 */}
                  <button
                    type="button"
                    onClick={() => scrollMap("left")}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background/50 hover:bg-background text-foreground transition-colors cursor-pointer"
                    aria-label={localize({ en: "Scroll left", ar: "التمرير لليسار" }, language)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div className="flex items-center justify-center text-muted-foreground/35">
                    <div className="h-1.5 w-1.5 rounded-full bg-current" />
                  </div>
                  <button
                    type="button"
                    onClick={() => scrollMap("right")}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background/50 hover:bg-background text-foreground transition-colors cursor-pointer"
                    aria-label={localize({ en: "Scroll right", ar: "التمرير لليمين" }, language)}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  {/* Row 3 */}
                  <div />
                  <button
                    type="button"
                    onClick={() => scrollMap("down")}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background/50 hover:bg-background text-foreground transition-colors cursor-pointer"
                    aria-label={localize({ en: "Scroll down", ar: "التمرير لأسفل" }, language)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <div />
                </div>
              </div>
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

          <aside ref={sidebarRef} className="grid min-w-0 content-start gap-0 rounded-xl border border-border bg-card/65 backdrop-blur-md h-full overflow-y-auto">
            {selectedHotspot ? (
              <div className="px-2 py-3.5 lg:p-4 flex flex-col gap-3.5">
                {/* Header: Back to Overview & Close button */}
                <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHotspotId(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/50 px-2.5 py-1 text-xs font-semibold text-foreground transition hover:bg-background/80 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                    {tr("Back to overview")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHotspotId(null);
                    }}
                    className="rounded-lg p-1 text-muted-foreground hover:bg-background/80 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                    aria-label={tr("Close")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Hotspot Title & Status/Time */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold tracking-tight text-foreground leading-tight">{tr(selectedHotspot.title)}</h3>
                  <div className="flex items-center justify-between gap-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider border ${hotspotStatusDetails?.toneStyles}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${hotspotStatusDetails?.toneColor} ${selectedHotspot.status === 'critical' || selectedHotspot.status === 'warning' ? 'animate-pulse' : ''}`}></span>
                      {hotspotStatusDetails?.statusLabel}
                    </span>
                    {selectedHotspot.updatedAt && (
                      <div className="flex items-center gap-1 text-muted-foreground font-mono text-[10px]">
                        <Clock3 className="h-3 w-3" />
                        <span>{selectedHotspot.updatedAt}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Operational Impact & Evidence (Flat flow design) */}
                <div className="space-y-3 pt-1">
                  {selectedHotspot.impact && (
                    <div className="text-xs leading-relaxed text-foreground">
                      <span className="block font-bold text-primary uppercase tracking-wider text-[9px] mb-0.5">{localize({ en: "Operational Impact", ar: "التأثير التشغيلي" }, language)}</span>
                      <p className="text-muted-foreground">{tr(selectedHotspot.impact)}</p>
                    </div>
                  )}
                  {selectedHotspot.evidence && (
                    <div className="text-xs leading-relaxed text-foreground">
                      <span className="block font-bold text-status-warn uppercase tracking-wider text-[9px] mb-0.5">{localize({ en: "Evidence", ar: "الأدلة" }, language)}</span>
                      <p className="text-muted-foreground">{tr(selectedHotspot.evidence)}</p>
                    </div>
                  )}
                </div>

                {/* CCTV Feed - CCTV image ONLY with rounded edges */}
                <div className="relative overflow-hidden rounded-xl border border-border bg-black shadow-sm aspect-[16/9] max-h-[140px] w-full">
                  <img 
                    src="/manager-assets/cctv-live.webp" 
                    alt="CCTV live feed" 
                    className="w-full h-full object-cover" 
                  />
                </div>

                {/* Action Recommendation Callout */}
                {selectedHotspot.action && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-primary/30 bg-primary/5 p-3 text-start shadow-[0_4px_12px_rgba(88,214,255,0.04)] animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-primary/40 bg-primary/10 text-primary">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block font-mono text-[9px] uppercase tracking-widest text-primary font-bold">
                        {localize({ en: "RECOMMENDED ACTION", ar: "الإجراء الموصى به" }, language)}
                      </span>
                      <p className="mt-1 text-xs text-foreground font-semibold leading-relaxed">
                        {tr(selectedHotspot.action)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="px-2 py-3.5 lg:p-4">
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
              
                <div className="mt-auto border-t border-border px-1.5 py-2.5 lg:p-3 bg-surface-2/25">
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
    <section className="panel-inner p-2 lg:p-2.5" aria-label={localize({ en: "Incoming flights", ar: "الرحلات القادمة" }, language)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-mono text-[9px] lg:text-[10px] uppercase tracking-[0.15em] text-primary font-bold">{localize({ en: "Incoming flights", ar: "الرحلات القادمة" }, language)}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-muted-foreground font-mono">{updatedAt}</span>
          <StatusPill tone={sourceTone} className="text-[8px] px-1.5 py-0">{sourceLabel}</StatusPill>
        </div>
      </div>
      <div className="grid gap-1.5">
        {flights.slice(0, 3).map((flight) => (
          <div key={`${flight.flight}-${flight.eta}`} className="grid grid-cols-[2.2fr_1.2fr_1.6fr] items-center gap-2 py-1 border-b border-border/20 last:border-b-0">
            {/* Flight Code & Origin */}
            <div className="flex flex-col min-w-0 text-start">
              <span className="font-mono font-bold text-foreground text-xs leading-none">{flight.flight}</span>
              <span className="text-muted-foreground truncate text-[10px] mt-0.5">{tr(flight.origin.split(" (")[0])}</span>
            </div>
            
            {/* ETA & Gate */}
            <div className="flex flex-col items-center shrink-0 text-center">
              <span className="font-mono text-foreground text-xs leading-none">{flight.eta}</span>
              <span className="font-mono text-muted-foreground text-[10px] mt-0.5 text-center">{flight.gate.replace("T3 / ", "").replace("Gate ", "")}</span>
            </div>

            {/* Status */}
            <div className="text-end min-w-0">
              <span className={`text-[10px] font-semibold block truncate ${
                flight.tone === 'ok' ? 'text-status-ok' :
                flight.tone === 'warn' ? 'text-status-warn' :
                flight.tone === 'crit' ? 'text-status-crit' : 'text-muted-foreground'
              }`}>
                {localizedFlightStatus(flight.status, language)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ZoneStatusPanel() {
  const { language } = useLocale();
  return (
    <section className="panel-inner p-2 lg:p-2.5" aria-label={localize({ en: "Terminal zone status", ar: "حالة مناطق المباني" }, language)}>
      <p className="mb-2 font-mono text-[9px] lg:text-[10px] uppercase tracking-[0.15em] text-primary font-bold">{localize({ en: "Zone status", ar: "حالة المناطق" }, language)}</p>
      <div className="grid gap-1">
        {zoneStatusRows.map((zone) => (
          <div key={zone.zone} className="flex items-center justify-between gap-2 text-xs py-1 border-b border-border/20 last:border-b-0">
            <span className="font-semibold text-foreground shrink-0">{language === "ar" ? zone.zone.replace("Terminal", "مبنى") : zone.zone.replace("Terminal ", "T")}</span>
            <span className="text-muted-foreground text-[11px] truncate flex-1 min-w-0 text-start px-1">{localize(zone.detail, language)}</span>
            <span className={`text-[10px] font-bold uppercase shrink-0 ${
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