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
  const [hotspotAnchor, setHotspotAnchor] = useState<{x: number, y: number} | null>(null);
  
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const [hoverAnchor, setHoverAnchor] = useState<{x: number, y: number} | null>(null);
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
        id={`hotspot-marker-${hotspot.id}`}
        transform={`translate(${hotspot.cx * 16}, ${hotspot.cy * 9})`} 
        onClick={(e) => {
          setSelectedHotspotId(hotspot.id);
          const rect = e.currentTarget.getBoundingClientRect();
          setHotspotAnchor({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
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
                      setHotspotAnchor(null);
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
            <div ref={imageContainerRef} className="relative min-w-0 bg-black aspect-video sm:aspect-auto sm:min-h-[350px] lg:min-h-[500px] xl:min-h-[560px] overflow-hidden">
            <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" role="img" aria-label={`${activeScene.title} operational image map`}>
              <title>{activeScene.title} operational image map</title>
              <image href={sceneImage} width="1600" height="900" preserveAspectRatio="xMidYMid slice" style={{ filter: imageFilter, transformOrigin: "center", transition: "filter 180ms ease" }} />

              {/* Render Hotspots */}
              {activeScene.hotspots.map(renderHotspotMarker)}
            </svg>
            </div>
          {/* Popover renders OUTSIDE overflow-hidden — fixed to viewport, never cropped */}
          {activeScene.hotspots.find(h => h.id === hoveredHotspotId) && hoverAnchor && !selectedHotspot && (
            <BriefPopover 
              hotspot={activeScene.hotspots.find(h => h.id === hoveredHotspotId)!} 
              anchor={hoverAnchor} 
            />
          )}
          {selectedHotspot && hotspotAnchor && (
            <HotspotPopover
              hotspot={selectedHotspot}
              anchor={hotspotAnchor}
              onClose={() => {
                setSelectedHotspotId(null);
                setHotspotAnchor(null);
              }}
            />
          )}
          </div>

          <aside className="grid min-w-0 content-start gap-0 border-t border-border bg-card xl:border-s xl:border-t-0 h-full max-h-[560px] overflow-y-auto">
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
                          onClick={() => {
                            setSelectedHotspotId(h.id);
                            const marker = document.getElementById(`hotspot-marker-${h.id}`);
                            if (marker) {
                              const rect = marker.getBoundingClientRect();
                              setHotspotAnchor({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
                            } else if (imageContainerRef.current) {
                              // fallback if marker not found
                              const rect = imageContainerRef.current.getBoundingClientRect();
                              setHotspotAnchor({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
                            }
                          }}
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



function HotspotPopover({ hotspot, anchor, onClose }: { hotspot: MapHotspot; anchor: {x: number, y: number}; onClose: () => void; }) {
  const { language, tr } = useLocale();
  const popoverRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{x: number, y: number, startX: number, startY: number} | null>(null);

  const statusLabel = hotspot.status === "warning"
    ? localize({ en: "Needs attention", ar: "يحتاج انتباها" }, language)
    : hotspot.status === "critical"
      ? localize({ en: "Critical", ar: "حرج" }, language)
      : hotspot.status === "good"
        ? localize({ en: "Good", ar: "جيد" }, language)
        : hotspot.status === "offline"
          ? localize({ en: "Offline", ar: "متوقف" }, language)
          : localize({ en: "Info", ar: "معلومة" }, language);

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

  const [modalSize, setModalSize] = useState({ w: 340, h: 440 });

  useEffect(() => {
    if (popoverRef.current) {
      const rect = popoverRef.current.getBoundingClientRect();
      setModalSize({ w: rect.width, h: rect.height });
    }
  }, [hotspot.id, language]);

  // Compute initial position and keep it in state for dragging
  const [pos, setPos] = useState(() => {
    const PAD = 12;

    const anchorX = anchor.x;
    const anchorY = anchor.y;

    // Prefer to open above the hotspot, centered
    let left = anchorX - 170;
    let top = anchorY - 480;
    
    if (top < PAD) {
      // If no room above, place to the right
      top = Math.max(PAD, anchorY - 220);
      left = anchorX + 40;
      if (left + 340 > window.innerWidth - PAD) {
        left = anchorX - 340 - 40;
      }
    }
    
    // Clamp to viewport bounds
    left = Math.max(PAD, Math.min(left, window.innerWidth - 340 - PAD));
    top = Math.max(PAD, Math.min(top, window.innerHeight - 440 - PAD));

    return { x: left, y: top };
  });

  // Re-sync position if anchor wildly changes (e.g. they clicked a different hotspot)
  useEffect(() => {
    setPos(p => {
      // Just a simple reposition if we get a new anchor entirely
      let left = anchor.x + 60;
      if (left + 290 > window.innerWidth - 12) left = anchor.x - 290 - 60;
      left = Math.max(12, Math.min(left, window.innerWidth - 290 - 12));
      let top = anchor.y - 40;
      if (top + 340 > window.innerHeight - 12) top = anchor.y - 340 + 40;
      top = Math.max(12, Math.min(top, window.innerHeight - 340 - 12));
      return { x: left, y: top };
    });
  }, [anchor.x, anchor.y]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag from the header area, avoid dragging if clicking buttons
    if ((e.target as HTMLElement).closest("button")) return;
    dragStart.current = { x: e.clientX, y: e.clientY, startX: pos.x, startY: pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPos({ x: dragStart.current.startX + dx, y: dragStart.current.startY + dy });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStart.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const style = useMemo(() => {
    return { position: "fixed" as const, top: pos.y, left: pos.x, zIndex: 200 };
  }, [pos.x, pos.y]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Move focus into the popover when it mounts without scrolling the page
  useEffect(() => {
    popoverRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <>
      {/* Full-screen click-to-close backdrop */}
      <div className="fixed inset-0 z-[198]" onClick={onClose} aria-hidden="true" />
      
      {/* Futuristic connecting dotted line */}
      <svg className="fixed inset-0 pointer-events-none z-[199]" style={{ width: '100vw', height: '100vh' }}>
        <line 
          x1={anchor.x} y1={anchor.y} 
          x2={pos.x + modalSize.w / 2} 
          y2={pos.y + modalSize.h / 2} 
          stroke="var(--primary)" 
          strokeWidth="1.5" 
          strokeDasharray="4 4" 
          className="opacity-60"
        />
        <circle cx={anchor.x} cy={anchor.y} r="4" fill="var(--primary)" className="animate-pulse" />
      </svg>

      {/* Popover card */}
      <div
        ref={popoverRef}
        className="hotspot-popover panel overflow-hidden p-0 shadow-[0_8px_32px_rgba(0,0,0,0.8)] border border-primary bg-[#0B121A]/95 backdrop-blur-xl w-max max-w-[400px]"
        style={{ ...style, maxHeight: "min(500px, calc(100vh - 24px))", overflowY: "hidden" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hotspot-popover-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div 
          className="flex items-center justify-between gap-2 border-b border-border/30 px-4 py-4 cursor-move select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <h2 id="hotspot-popover-title" className="truncate text-lg font-bold tracking-tight text-foreground">{tr(hotspot.title)}</h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded p-1 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
            aria-label={tr("Close")}
          >
            <X aria-hidden="true" className="h-5 w-5 text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        <div className="flex flex-col p-4">
          {hotspot.impact && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BarChart3 aria-hidden="true" className="h-4 w-4" />
                  <span className="text-xs font-mono uppercase tracking-widest font-semibold">{localize({en: "Operational Impact", ar: "التأثير التشغيلي"}, language)}</span>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${toneStyles}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${toneColor}`}></span>
                  {statusLabel}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">{hotspot.impact}</p>
              <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
                <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
                <span className="text-xs font-mono">{localize({en: "Updated", ar: "تم التحديث"}, language)} {hotspot.updatedAt}</span>
              </div>
            </div>
          )}

          {hotspot.impact && hotspot.category && (
            <hr className="border-border/40 my-1 mb-4" />
          )}

          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Camera aria-hidden="true" className="h-4 w-4" />
              <span className="text-xs font-mono uppercase tracking-widest font-semibold">{localize({en: "CCTV Feed", ar: "تغذية الكاميرا"}, language)}</span>
            </div>
            
            <div className="flex flex-col rounded-lg overflow-hidden border border-border/40">
              <div className="flex items-center justify-between bg-[#05090F] px-3 py-2">
                <span className="text-[10px] font-mono text-status-ok uppercase tracking-wider">REC // T3-GATE-B12</span>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-crit animate-pulse"></span>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">LIVE</span>
                </div>
              </div>
              <img src="/manager-assets/cctv-placeholder.png" alt="CCTV Feed" className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity" />
            </div>
          </div>
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
      : localize({ en: "Offline Mode", ar: "وضع عدم الاتصال" }, language);
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
      <div className="panel overflow-hidden p-3 shadow-[0_8px_32px_rgba(0,0,0,0.8)] border border-primary bg-[#0B121A]/95 backdrop-blur-xl flex flex-col gap-2 w-max max-w-[280px]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold tracking-tight text-foreground truncate">{tr(hotspot.title)}</h3>
          <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${toneStyles}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${toneColor}`}></span>
            {statusLabel}
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{hotspot.impact}</p>
        <div className="text-[10px] text-primary/80 uppercase tracking-widest font-mono mt-1">{localize({en: "Click hotspot to expand", ar: "انقر للتوسيع"}, language)}</div>
      </div>
      <svg className="absolute left-1/2 bottom-[-14px] transform -translate-x-1/2 pointer-events-none" width="2" height="14">
        <line x1="1" y1="0" x2="1" y2="14" stroke="var(--primary)" strokeWidth="1.5" strokeDasharray="2 2" className="opacity-60" />
      </svg>
    </div>
  );
}