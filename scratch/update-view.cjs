const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startIndex = code.indexOf('function DigitalTwinView() {');
const endIndex = code.indexOf('function toneCssVar(tone: Tone) {');

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find start or end index");
  process.exit(1);
}

const newView = `function DigitalTwinView() {
  const { language, tr } = useLocale();
  const [activeSceneId, setActiveSceneId] = useState<AirportScene["id"]>("overview");
  const [imageMode, setImageMode] = useState<"light" | "dark">("light");
  const [filterMode, setFilterMode] = useState<HotspotStatus | "all">("all");
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const incoming = useIncomingCaiFlights();

  const activeScene = scenes.find((scene) => scene.id === activeSceneId) ?? scenes[0];
  const ImageModeIcon = imageMode === "dark" ? Sun : Moon;
  
  // Filter hotspots based on selected filter
  const visibleHotspots = activeScene.hotspots.filter(h => filterMode === "all" || h.status === filterMode);
  const selectedHotspot = activeScene.hotspots.find(h => h.id === selectedHotspotId);

  // Status Summary
  const stats = {
    critical: activeScene.hotspots.filter(h => h.status === "critical").length,
    warning: activeScene.hotspots.filter(h => h.status === "warning").length,
    good: activeScene.hotspots.filter(h => h.status === "good").length,
  };

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
        transform={\`translate(\${hotspot.cx * 16}, \${hotspot.cy * 9})\`} 
        onClick={() => setSelectedHotspotId(hotspot.id)}
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

  return (
    <div className="grid min-w-0 gap-4 lg:gap-6">
      <DigitalAlertStrip />
      <DigitalKpiGrid />

      <SectionPanel className="overflow-hidden p-0" title="">
        <div className="min-w-0 border-b border-border p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h2 className="text-xl font-semibold sm:text-2xl">{localize({ en: "Airport Operational Insight Map", ar: "خريطة الرؤية التشغيلية للمطار" }, language)}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#D92D20]" /> {stats.critical} Critical</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#F79009]" /> {stats.warning} Needs attention</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#12B76A]" /> {stats.good} Good</span>
                <span className="border-l border-border pl-4">Updated: 14:04</span>
                <span>Mode: Live</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {(["all", "critical", "warning", "good", "info"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilterMode(f)}
                  className={\`rounded-full px-4 py-1.5 text-xs font-semibold transition \${filterMode === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}\`}
                >
                  {f === "all" ? "All insights" : f === "warning" ? "Needs attention" : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setImageMode(imageMode === "dark" ? "light" : "dark")}
                className="ml-2 inline-flex items-center justify-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs font-semibold hover:bg-secondary"
              >
                <ImageModeIcon className="h-3.5 w-3.5" />
                {imageMode === "dark" ? "Light mode" : "Dark mode"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid min-w-0 gap-0 xl:grid-cols-[minmax(0,1fr)_minmax(340px,400px)]">
          <div className="relative min-w-0 bg-black aspect-video sm:aspect-auto sm:min-h-[500px] lg:min-h-[700px] xl:min-h-[800px] overflow-hidden">
            <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
              <image href={activeScene.image} width="1600" height="900" preserveAspectRatio="xMidYMid slice" style={{ filter: imageMode === "dark" ? "brightness(0.6) contrast(1.2)" : "none" }} />
              
              {/* Optional Density Overlays inside SVG */}
              {activeScene.id === "overview" && (
                 <g opacity="0.3">
                    <circle cx="800" cy="500" r="150" fill="url(#density-high)" />
                    <circle cx="400" cy="600" r="100" fill="url(#density-medium)" />
                 </g>
              )}

              {/* Definitions for overlays */}
              <defs>
                 <radialGradient id="density-high">
                    <stop offset="0%" stopColor="#B42318" />
                    <stop offset="100%" stopColor="#B42318" stopOpacity="0" />
                 </radialGradient>
                 <radialGradient id="density-medium">
                    <stop offset="0%" stopColor="#B54708" />
                    <stop offset="100%" stopColor="#B54708" stopOpacity="0" />
                 </radialGradient>
              </defs>

              {/* Render Hotspots */}
              {visibleHotspots.map(renderHotspotMarker)}
            </svg>

            {/* Back button overlay */}
            {activeScene.id !== "overview" && (
              <button
                type="button"
                onClick={() => {
                  setActiveSceneId("overview");
                  setSelectedHotspotId(null);
                }}
                className="absolute left-4 top-4 inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background/80 px-4 text-sm font-semibold backdrop-blur-md hover:bg-background"
              >
                Reset map
              </button>
            )}
            
            {/* Quick Scene Navigation */}
            {activeScene.id === "overview" && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-background/80 p-2 backdrop-blur-md">
                 {scenes.filter(s => s.id !== "overview").map(s => (
                   <button
                     key={s.id}
                     onClick={() => {
                        setActiveSceneId(s.id);
                        setSelectedHotspotId(null);
                     }}
                     className="rounded-full px-4 py-1.5 text-xs font-semibold hover:bg-secondary"
                   >
                     {s.title}
                   </button>
                 ))}
              </div>
            )}
          </div>

          <aside className="grid min-w-0 content-start gap-0 border-t border-border bg-card xl:border-s xl:border-t-0 h-full max-h-[800px] overflow-y-auto">
            {selectedHotspot ? (
              <div className="p-6">
                <button 
                  onClick={() => setSelectedHotspotId(null)}
                  className="mb-6 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  ← Back to {activeScene.title}
                </button>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: getStatusColor(selectedHotspot.status) }}>
                    {selectedHotspot.status === "warning" ? "Needs attention" : selectedHotspot.status.charAt(0).toUpperCase() + selectedHotspot.status.slice(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">{selectedHotspot.category}</span>
                  <span className="text-xs text-muted-foreground">• Updated {selectedHotspot.updatedAt}</span>
                </div>

                <h3 className="text-2xl font-bold tracking-tight mb-6">{selectedHotspot.title}</h3>

                <div className="space-y-6">
                  {selectedHotspot.impact && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">Impact</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{selectedHotspot.impact}</p>
                    </div>
                  )}
                  {selectedHotspot.evidence && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">Evidence</h4>
                      <div className="rounded-md bg-secondary/50 p-3 border border-border/50">
                        <p className="text-sm font-mono text-secondary-foreground">{selectedHotspot.evidence}</p>
                      </div>
                    </div>
                  )}
                  {selectedHotspot.action && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">Recommended Action</h4>
                      <div className="rounded-md border-l-2 border-primary bg-primary/5 p-4">
                        <p className="text-sm font-medium text-primary">{selectedHotspot.action}</p>
                      </div>
                    </div>
                  )}
                  {selectedHotspot.source && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-1">Source</h4>
                      <p className="text-xs text-muted-foreground">{selectedHotspot.source}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">{tr("Area Overview")}</p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight">{tr(activeScene.title)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{tr(activeScene.summary)}</p>
                
                <div className="mt-8 border-t border-border pt-6">
                  <h4 className="text-sm font-semibold mb-4">Active Issues in Area</h4>
                  <div className="grid gap-3">
                    {activeScene.hotspots.filter(h => h.status !== "good" && h.status !== "info").length > 0 ? 
                      activeScene.hotspots.filter(h => h.status !== "good" && h.status !== "info").map(h => (
                        <button 
                          key={h.id} 
                          onClick={() => setSelectedHotspotId(h.id)}
                          className="flex items-start gap-3 rounded-md border border-border p-3 text-left transition hover:border-primary hover:bg-secondary/50"
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
            )}
            
            {!selectedHotspot && (
               <div className="mt-auto border-t border-border p-6 bg-surface-2/50">
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-3">Incoming Operations</h4>
                  <IncomingFlightsPanel flights={incoming.flights} source={incoming.source} updatedAt={incoming.updatedAt} />
               </div>
            )}
          </aside>
        </div>
      </SectionPanel>

      <DigitalOperationalGrid />
    </div>
  );
}

`;

code = code.slice(0, startIndex) + newView + code.slice(endIndex);

fs.writeFileSync('src/App.tsx', code);
