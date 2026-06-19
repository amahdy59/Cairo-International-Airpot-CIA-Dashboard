import { useState, useRef, useEffect, useMemo } from 'react';
import { Sun, Moon, X, Clock3, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Move, Zap, Video, BarChart3, FileText, Map as MapIcon } from 'lucide-react';
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
  const [activeCctvFeed, setActiveCctvFeed] = useState<{ src: string; label: string } | null>(null);
    const selectHotspotAndScene = (hotspotId: string | null) => {
    setSelectedHotspotId(hotspotId);
    if (hotspotId) {
      for (const scene of scenes) {
        if (scene.hotspots.some((h) => h.id === hotspotId)) {
          setActiveSceneId(scene.id);
          setActiveCctvFeed(getPrimaryCctvFeed(hotspotId));
          break;
        }
      }
    } else {
      setActiveCctvFeed(null);
    }
  };

  
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
    selectHotspotAndScene(hotspotId);
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
    cctvImg.src = import.meta.env.BASE_URL + "manager-assets/cctv-live.webp";
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

  useEffect(() => {
    if (selectedHotspotId) {
      setActiveCctvFeed(getPrimaryCctvFeed(selectedHotspotId));
          } else {
      setActiveCctvFeed(null);
    }
  }, [selectedHotspotId]);

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
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            selectHotspotAndScene(hotspot.id);
            setHoveredHotspotId(null);
          }
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
    <div className="grid min-w-0 gap-2 lg:gap-3">
      <nav className="sticky top-16 z-30 border border-border bg-background/95 backdrop-blur-md px-3 sm:px-4 py-2.5 rounded-xl shadow-sm" aria-label={localize({ en: "Airport image sections", ar: "أقسام صورة المطار" }, language)}>
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
                    selectHotspotAndScene(null);
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

      <SectionPanel className="overflow-visible p-0!" title="">
        <div className="grid min-w-0 px-1 py-3 lg:p-4 gap-3 lg:gap-4 md:grid-cols-[60%_1fr] lg:grid-cols-[1fr_360px] md:h-[calc(100vh-148px)] md:min-h-[500px]">
          <div className="flex flex-col min-w-0 h-full relative">
            <div id="digital-twin-image-viewport" className="relative min-w-0 bg-black/40 aspect-[4/3] sm:aspect-[3/2] md:aspect-auto w-full md:h-full md:flex-1 rounded-xl border border-border shadow-inner overflow-hidden">
              <div 
                id="digital-twin-image-container" 
                ref={imageContainerRef} 
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp") { e.preventDefault(); scrollMap("up"); }
                  if (e.key === "ArrowDown") { e.preventDefault(); scrollMap("down"); }
                  if (e.key === "ArrowLeft") { e.preventDefault(); scrollMap("left"); }
                  if (e.key === "ArrowRight") { e.preventDefault(); scrollMap("right"); }
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                className="w-full h-full overflow-auto no-scrollbar cursor-grab active:cursor-grabbing select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
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
          </div>

          <aside ref={sidebarRef} aria-label={selectedHotspot ? tr(selectedHotspot.title) : localize({ en: "Area overview", ar: "نظرة عامة على المنطقة" }, language)} className="grid min-w-0 content-start gap-0 rounded-xl border border-border bg-card/65 backdrop-blur-md h-full overflow-y-auto">
            {selectedHotspot ? (
              <div className="px-3 py-5 lg:p-5 flex flex-col gap-4">
                {/* Header: Back to Overview & Close button */}
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <button
                    type="button"
                    onClick={() => {
                      selectHotspotAndScene(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/50 px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-background/80 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                    {tr("Back to overview")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      selectHotspotAndScene(null);
                    }}
                    className="rounded-lg p-1.5 text-muted-foreground hover:bg-background/80 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                    aria-label={tr("Close")}
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Hotspot Title & Status/Time */}
                <div className="space-y-2">
                  <h3 className="text-[18px] lg:text-[20px] font-bold tracking-tight text-foreground leading-tight">
                    {tr(selectedHotspot.title)}
                  </h3>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border ${
                      language === "ar"
                        ? "px-3 py-1 text-[13px] font-sans font-bold"
                        : "px-2.5 py-1 text-[12px] font-mono font-bold uppercase tracking-wider"
                    } ${hotspotStatusDetails?.toneStyles}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${hotspotStatusDetails?.toneColor} ${selectedHotspot.status === 'critical' || selectedHotspot.status === 'warning' ? 'animate-pulse' : ''}`}></span>
                      {hotspotStatusDetails?.statusLabel}
                    </span>
                    {selectedHotspot.updatedAt && (
                      <div className={`flex items-center gap-1 text-muted-foreground ${
                        language === "ar" ? "text-[13px] font-sans" : "font-mono text-[12px]"
                      }`}>
                        <Clock3 className="h-3.5 w-3.5" />
                        <span>{selectedHotspot.updatedAt}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Operational Impact & Evidence (Flat flow design) */}
                <div className="space-y-4 pt-1">
                  {selectedHotspot.impact && (
                    <div className="text-sm sm:text-base leading-relaxed text-foreground">
                      <span className={language === "ar"
                        ? "block font-bold text-primary text-xs sm:text-sm mb-1"
                        : "block font-bold text-primary uppercase tracking-wider text-xs sm:text-sm mb-1"
                      }>
                        {localize({ en: "Operational Impact", ar: "التأثير التشغيلي" }, language)}
                      </span>
                      <p className="text-muted-foreground font-medium">{tr(selectedHotspot.impact)}</p>
                    </div>
                  )}
                  {selectedHotspot.evidence && (
                    <div className="text-sm sm:text-base leading-relaxed text-foreground">
                      <span className={language === "ar"
                        ? "block font-bold text-status-warn text-xs sm:text-sm mb-1"
                        : "block font-bold text-status-warn uppercase tracking-wider text-xs sm:text-sm mb-1"
                      }>
                        {localize({ en: "Evidence", ar: "الأدلة" }, language)}
                      </span>
                      <p className="text-muted-foreground font-medium">{tr(selectedHotspot.evidence)}</p>
                    </div>
                  )}
                </div>

                {/* Evidence Content Area */}
                {renderEvidenceContent(selectedHotspot.id, language, tr, activeCctvFeed, setActiveCctvFeed)}

                {/* Action Recommendation Callout */}
                {selectedHotspot.action && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-start shadow-[0_4px_12px_rgba(88,214,255,0.04)] animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-primary/40 bg-primary/10 text-primary">
                      <Zap className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <span className={language === "ar"
                        ? "block text-xs sm:text-sm text-primary font-bold"
                        : "block font-mono text-xs sm:text-sm uppercase tracking-widest text-primary font-bold"
                      }>
                        {localize({ en: "RECOMMENDED ACTION", ar: "الإجراء الموصى به" }, language)}
                      </span>
                      <p className="mt-1 text-sm sm:text-base text-foreground font-semibold leading-relaxed">
                        {tr(selectedHotspot.action)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="px-3 py-5 lg:p-5">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary font-bold">{tr("Area Overview")}</p>
                  <h3 className="mt-1.5 text-lg font-bold tracking-tight text-foreground">{tr(activeScene.title)}</h3>
                  <p className="mt-1.5 text-sm leading-normal text-muted-foreground line-clamp-2">{tr(activeScene.summary)}</p>
                  
                  <div className="mt-4 border-t border-border pt-3.5">
                    <h4 className="text-sm font-bold mb-2.5 text-foreground">{localize({ en: "Active Issues", ar: "المشكلات النشطة" }, language)}</h4>
                    <div className="grid gap-2">
                      {activeScene.hotspots.filter(h => h.status !== "good" && h.status !== "info").length > 0 ? 
                        activeScene.hotspots.filter(h => h.status !== "good" && h.status !== "info").map(h => (
                          <button 
                            key={h.id} 
                            type="button"
                            onClick={() => {
                              selectHotspotAndScene(h.id);
                            }}
                            className="flex items-center justify-between w-full rounded-lg border border-border/80 px-3.5 py-2.5 text-start transition hover:border-primary hover:bg-secondary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="block h-2 w-2 shrink-0 rounded-full animate-pulse" style={{ backgroundColor: getStatusColor(h.status) }} />
                              <p className="text-sm font-bold truncate text-foreground">{tr(h.title)}</p>
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0 uppercase font-mono">{tr(h.category)}</span>
                          </button>
                        ))
                      : (
                        <p className="text-sm text-muted-foreground italic">{localize({ en: "No critical issues in this area.", ar: "لا توجد مشكلات حرجة في هذه المنطقة." }, language)}</p>
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
    <section className="panel-inner p-3 lg:p-3.5" aria-label={localize({ en: "Incoming flights", ar: "الرحلات القادمة" }, language)}>
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <p className={language === "ar"
          ? "text-sm sm:text-base text-primary font-bold"
          : "font-mono text-sm sm:text-base uppercase tracking-[0.15em] text-primary font-bold"
        }>{localize({ en: "Incoming flights", ar: "الرحلات القادمة" }, language)}</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">{updatedAt}</span>
          <StatusPill tone={sourceTone} className="text-[10px] px-2 py-0.5">{sourceLabel}</StatusPill>
        </div>
      </div>
      <div className="grid gap-2">
        {flights.slice(0, 3).map((flight) => (
          <div key={`${flight.flight}-${flight.eta}`} className="grid grid-cols-[2.2fr_1.2fr_1.6fr] items-center gap-2.5 py-1.5 border-b border-border/20 last:border-b-0 text-sm">
            {/* Flight Code & Origin */}
            <div className="flex flex-col min-w-0 text-start">
              <span className="font-mono font-bold text-foreground text-sm leading-none">{flight.flight}</span>
              <span className="text-muted-foreground truncate text-xs mt-1">{tr(flight.origin.split(" (")[0])}</span>
            </div>
            
            {/* ETA & Gate */}
            <div className="flex flex-col items-center shrink-0 text-center">
              <span className="font-mono text-foreground text-sm leading-none">{flight.eta}</span>
              <span className="font-mono text-muted-foreground text-xs mt-1 text-center">{flight.gate.replace("T3 / ", "").replace("Gate ", "")}</span>
            </div>

            {/* Status */}
            <div className="text-end min-w-0">
              <span className={`text-xs sm:text-sm font-semibold block truncate ${
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
    <section className="panel-inner p-3 lg:p-3.5" aria-label={localize({ en: "Terminal zone status", ar: "حالة مناطق المباني" }, language)}>
      <p className={language === "ar"
        ? "mb-2.5 text-sm sm:text-base text-primary font-bold"
        : "mb-2.5 font-mono text-sm sm:text-base uppercase tracking-[0.15em] text-primary font-bold"
      }>{localize({ en: "Zone status", ar: "حالة المناطق" }, language)}</p>
      <div className="grid gap-1.5">
        {zoneStatusRows.map((zone) => (
          <div key={zone.zone} className="flex items-center justify-between gap-2.5 text-sm py-1.5 border-b border-border/20 last:border-b-0">
            <span className="font-bold text-foreground shrink-0">{language === "ar" ? zone.zone.replace("Terminal", "مبنى") : zone.zone.replace("Terminal ", "T")}</span>
            <span className="text-muted-foreground text-xs truncate flex-1 min-w-0 text-start px-1.5">{localize(zone.detail, language)}</span>
            <span className={`text-xs sm:text-sm font-bold uppercase shrink-0 ${
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
          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 border ${
            language === "ar"
              ? "text-[12px] font-sans font-bold"
              : "text-[10px] font-mono font-bold uppercase tracking-wider"
          } ${toneStyles}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${toneColor}`}></span>
            {statusLabel}
          </span>
        </div>
        <div className="flex flex-col p-3 pt-0 w-0 min-w-full whitespace-normal">
          <p className="text-xs text-muted-foreground line-clamp-2">{tr(hotspot.impact)}</p>
          <div className={`mt-2 ${
            language === "ar"
              ? "text-[12px] text-primary/80 font-sans"
              : "text-[10px] text-primary/80 uppercase tracking-widest font-mono"
          }`}>{localize({en: "Click hotspot to expand", ar: "انقر للتوسيع"}, language)}</div>
        </div>
      </div>
      <svg className="absolute left-1/2 bottom-[-14px] transform -translate-x-1/2 pointer-events-none" width="2" height="14">
        <line x1="1" y1="0" x2="1" y2="14" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="2 2" className="opacity-60" />
      </svg>
    </div>
  );
}

function renderCctvEvidence(
  hotspotId: string,
  language: "en" | "ar",
  tr: (val: any) => string,
  activeCctvFeed: { src: string; label: string } | null,
  setActiveCctvFeed: (feed: { src: string; label: string } | null) => void
) {
  const feed = activeCctvFeed || getPrimaryCctvFeed(hotspotId);
  return (
    <div className="flex flex-col gap-3 animate-in fade-in duration-300">
      <div className="relative overflow-hidden rounded-xl border border-border bg-black shadow-sm aspect-[16/9] max-h-[160px] w-full">
        <img 
          src={feed.src} 
          alt={localize({ en: `CCTV feed: ${feed.label}`, ar: `تغذية كاميرا: ${feed.label}` }, language)} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute top-2 start-2 bg-status-crit text-white font-mono text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider animate-pulse flex items-center gap-1">
          <span className="h-1 w-1 rounded-full bg-white"></span>
          {tr("LIVE")}
        </div>
        <div className="absolute bottom-2 start-2 bg-black/70 text-white font-mono text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
          {feed.label}
        </div>
      </div>
      <div className="text-start">
        <span className={language === "ar"
          ? "block text-[11px] text-muted-foreground font-semibold mb-1.5"
          : "block font-mono text-[9px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5"
        }>
          {localize({ en: "Alternative feeds", ar: "الكاميرات المجاورة والمقترحة" }, language)}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {getAlternativeFeeds(hotspotId).map((f) => {
            const isActive = feed.label === f.label;
            return (
              <button
                key={f.label}
                type="button"
                onClick={() => setActiveCctvFeed({ src: f.src, label: f.label })}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  isActive 
                    ? "border-primary bg-primary/10 text-foreground font-bold shadow-sm" 
                    : "border-border/60 bg-secondary/20 text-muted-foreground hover:border-border hover:bg-secondary/40 hover:text-foreground"
                }`}
              >
                {localize(f.name, language)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function renderEvidenceContent(
  hotspotId: string, 
  language: "en" | "ar", 
  tr: (val: any) => string,
  activeCctvFeed: { src: string; label: string } | null,
  setActiveCctvFeed: (feed: { src: string; label: string } | null) => void
) {
  switch (hotspotId) {
    case "t1-stand-turnaround": {
      const milestones = [
        { label: { en: "Catering", ar: "تموين الطعام" }, progress: 100, status: "completed" },
        { label: { en: "Fueling", ar: "تزويد الوقود" }, progress: 100, status: "completed" },
        { label: { en: "Baggage Loading", ar: "تحميل الحقائب" }, progress: 40, status: "delayed" },
        { label: { en: "Passenger Boarding", ar: "صعود الركاب" }, progress: 10, status: "pending" },
      ];
      return (
        <div className="rounded-xl border border-border bg-background/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-start">
              {localize({ en: "Turnaround Milestones Chart", ar: "مخطط مراحل الخدمة الأرضية" }, language)}
            </h4>
            <span className="text-[10px] font-mono text-status-warn font-semibold animate-pulse">
              {localize({ en: "-9 mins delay", ar: "تأخير ٩ دقائق" }, language)}
            </span>
          </div>
          <div className="space-y-3">
            {milestones.map((m, idx) => (
              <div key={idx} className="space-y-1 text-start">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-foreground">{localize(m.label, language)}</span>
                  <span className={m.status === "completed" ? "text-status-ok" : m.status === "delayed" ? "text-status-crit font-bold" : "text-muted-foreground"}>
                    {m.status === "completed" ? localize({ en: "Completed", ar: "مكتمل" }, language) : m.status === "delayed" ? `${m.progress}% (${localize({ en: "Delayed", ar: "متأخر" }, language)})` : localize({ en: "Pending", ar: "معلق" }, language)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      m.status === "completed" ? "bg-status-ok" : m.status === "delayed" ? "bg-status-crit" : "bg-primary/30"
                    }`}
                    style={{ width: `${m.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "t2-security":
      return renderCctvEvidence("t2-security", language, tr, activeCctvFeed, setActiveCctvFeed);

    case "t3-flow": {
      return (
        <div className="rounded-xl border border-border bg-background/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-start">
              {localize({ en: "Average Wait Time Trend", ar: "مخطط متوسط أوقات الانتظار" }, language)}
            </h4>
            <span className="text-[10px] font-mono text-status-ok font-semibold">
              {localize({ en: "Average <5m", ar: "المعدل < ٥ دقائق" }, language)}
            </span>
          </div>
          <div className="relative h-[110px] w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="flowAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M0,40 L0,18 Q25,10 50,25 T100,15 L100,40 Z"
                fill="url(#flowAreaGrad)"
              />
              <path
                d="M0,18 Q25,10 50,25 T100,15"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>
      );
    }

    case "gate-b12": {
      return (
        <div className="rounded-xl border border-border bg-background/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-start">
              {localize({ en: "Inbound Aircraft Track Map", ar: "مسار الطائرة القادمة" }, language)}
            </h4>
            <span className="text-[10px] font-mono text-status-crit font-semibold animate-pulse">
              {localize({ en: "Delayed 18m", ar: "تأخير ١٨ دقيقة" }, language)}
            </span>
          </div>
          <div className="relative h-[120px] w-full rounded-lg border border-border/40 bg-[#040b11] overflow-hidden flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 200 100">
              <rect width="200" height="100" fill="#040b11" />
              <path d="M 10 30 Q 30 10 70 20 T 130 10 T 190 20 L 200 100 L 0 100 Z" fill="#081724" opacity="0.5" />
              <circle cx="50" cy="30" r="3" fill="#ffffff" opacity="0.3" />
              <text x="50" y="24" fill="#ffffff" opacity="0.6" fontSize="6" textAnchor="middle" fontFamily="monospace">LHR</text>
              <circle cx="150" cy="75" r="3.5" fill="var(--primary)" />
              <text x="150" y="86" fill="var(--primary)" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace">CAI</text>
              <path d="M 50 30 Q 100 40 150 75" fill="none" stroke="var(--status-crit)" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M 50 30 Q 100 40 115 51" fill="none" stroke="var(--status-crit)" strokeWidth="2" />
              <g transform="translate(115, 51) rotate(35)">
                <polygon points="0,-4 3,4 0,2 -3,4" fill="var(--status-crit)" />
              </g>
            </svg>
          </div>
        </div>
      );
    }

    case "parking-congestion":
      return renderCctvEvidence("parking-congestion", language, tr, activeCctvFeed, setActiveCctvFeed);

    case "catering-facility": {
      const dispatches = [
        { flight: "MS786", status: { en: "Delivered", ar: "تم التوصيل" }, tone: "ok" },
        { flight: "QR1303", status: { en: "En Route", ar: "في الطريق" }, tone: "info" },
        { flight: "SV301", status: { en: "Preparing", ar: "قيد التحضير" }, tone: "neutral" },
        { flight: "EK927", status: { en: "Scheduled", ar: "مجدول" }, tone: "neutral" },
      ];
      return (
        <div className="rounded-xl border border-border bg-background/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider text-start">
              {localize({ en: "Catering Dispatch Log Table", ar: "سجل تموين الرحلات" }, language)}
            </h4>
            <span className="text-[10px] font-mono text-status-ok font-semibold">
              {localize({ en: "95% On-Time", ar: "٩٥٪ في الوقت" }, language)}
            </span>
          </div>
          <div className="grid gap-1.5 text-xs">
            {dispatches.map((d, idx) => (
              <div key={idx} className="flex justify-between items-center py-1.5 border-b border-border/10 last:border-b-0 text-start">
                <span className="font-mono font-bold text-foreground">{d.flight}</span>
                <span className={`font-semibold ${
                  d.tone === "ok" ? "text-status-ok" : d.tone === "info" ? "text-primary" : "text-muted-foreground"
                }`}>
                  {localize(d.status, language)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    default:
      return null;
  }
}

function getPrimaryCctvFeed(hotspotId: string) {
  let feed;
  switch (hotspotId) {
    case "t1-stand-turnaround":
      feed = { src: "manager-assets/cctv-t1-apron.webp", label: "CAM 012 | T1 APRON STAND 4" };
      break;
    case "t2-security":
      feed = { src: "manager-assets/cctv-t2-security.webp", label: "CAM 088 | T2 SECURITY LANE 3" };
      break;
    case "t3-flow":
      feed = { src: "manager-assets/cctv-live.webp", label: "CAM 054 | CAI T3 DEP GATES" };
      break;
    case "gate-b12":
      feed = { src: "manager-assets/cctv-t3-gate.webp", label: "CAM 112 | CAI T3 GATE B12" };
      break;
    case "parking-congestion":
      feed = { src: "manager-assets/cctv-landside.webp", label: "CAM 201 | CAI LANDSIDE ACCESS" };
      break;
    case "catering-facility":
      feed = { src: "manager-assets/cctv-services.webp", label: "CAM 304 | CAI SERVICES DEPOT" };
      break;
    default:
      feed = { src: "manager-assets/cctv-live.webp", label: "CAM 054 | CAI T3 DEP GATES" };
      break;
  }
  return { ...feed, src: import.meta.env.BASE_URL + feed.src };
}

function getAlternativeFeeds(hotspotId: string) {
  let feeds: Array<{ src: string; label: string; name: { en: string; ar: string } }> = [];
  switch (hotspotId) {
    case "t1-stand-turnaround":
      feeds = [
        { src: "manager-assets/cctv-t1-apron.webp", label: "CAM 012 | T1 APRON STAND 4", name: { en: "Apron Stand 4", ar: "موقف الطائرات ٤" } },
        { src: "manager-assets/cctv-services.webp", label: "CAM 013 | T1 APRON STAND 5", name: { en: "Apron Stand 5", ar: "موقف الطائرات ٥" } },
        { src: "manager-assets/cctv-landside.webp", label: "CAM 014 | T1 TAXIWAY CHARLIE", name: { en: "Taxiway Charlie", ar: "الممر الملاحي ج" } }
      ];
      break;
    case "t2-security":
      feeds = [
        { src: "manager-assets/cctv-t2-security.webp", label: "CAM 088 | T2 SECURITY LANE 3", name: { en: "Security Lane 3", ar: "ممر أمني ٣" } },
        { src: "manager-assets/cctv-live.webp", label: "CAM 089 | T2 DEPARTURES LOBBY", name: { en: "Departures Lobby", ar: "صالة المغادرة" } },
        { src: "manager-assets/cctv-t3-gate.webp", label: "CAM 090 | T2 GATE AREA 14", name: { en: "Gate Area 14", ar: "منطقة البوابة ١٤" } }
      ];
      break;
    case "t3-flow":
      feeds = [
        { src: "manager-assets/cctv-live.webp", label: "CAM 054 | CAI T3 DEP GATES", name: { en: "Departures Corridor", ar: "ممر المغادرين" } },
        { src: "manager-assets/cctv-t3-gate.webp", label: "CAM 112 | CAI T3 GATE B12", name: { en: "Gate B12 Boarding", ar: "بوابة صعود ب١٢" } },
        { src: "manager-assets/cctv-t2-security.webp", label: "CAM 055 | T3 CHECK-IN HALL", name: { en: "Check-in Hall", ar: "صالة تسجيل الوصول" } }
      ];
      break;
    case "gate-b12":
      feeds = [
        { src: "manager-assets/cctv-t3-gate.webp", label: "CAM 112 | CAI T3 GATE B12", name: { en: "Gate B12 Boarding", ar: "بوابة صعود ب١٢" } },
        { src: "manager-assets/cctv-live.webp", label: "CAM 113 | CAI T3 GATE B11", name: { en: "Gate B11 Waiting Area", ar: "منطقة انتظار ب١١" } },
        { src: "manager-assets/cctv-t1-apron.webp", label: "CAM 114 | CAI T3 APRON B12", name: { en: "Gate B12 Exterior Apron", ar: "الجانب الجوي لبوابة ب١٢" } }
      ];
      break;
    case "parking-congestion":
      feeds = [
        { src: "manager-assets/cctv-landside.webp", label: "CAM 201 | CAI LANDSIDE ACCESS", name: { en: "Parking Entry Gates", ar: "بوابات دخول الموقف" } },
        { src: "manager-assets/cctv-services.webp", label: "CAM 202 | CAI SHUTTLE LANE", name: { en: "Shuttle Bus Lane", ar: "مسار حافلات النقل" } },
        { src: "manager-assets/cctv-live.webp", label: "CAM 203 | CAI DEPARTURES CURB", name: { en: "Departures Curbside", ar: "رصيف صالة المغادرة" } }
      ];
      break;
    case "catering-facility":
      feeds = [
        { src: "manager-assets/cctv-services.webp", label: "CAM 304 | CAI SERVICES DEPOT", name: { en: "Catering Depot Dock 2", ar: "رصيف خدمات الطعام ٢" } },
        { src: "manager-assets/cctv-t1-apron.webp", label: "CAM 305 | CAI SERVICES ENTRANCE", name: { en: "Depot Entrance Gate", ar: "بوابة دخول المستودع" } },
        { src: "manager-assets/cctv-landside.webp", label: "CAM 306 | CAI FUELING STATION", name: { en: "Fueling Station Area", ar: "منطقة محطة الوقود" } }
      ];
      break;
    default:
      return [];
  }
  return feeds.map(feed => ({
    ...feed,
    src: import.meta.env.BASE_URL + feed.src
  }));
}