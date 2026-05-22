const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /type AirportScene = \{[\s\S]*?\};\n/,
  `export type HotspotStatus = 'critical' | 'warning' | 'good' | 'info' | 'offline';

export type MapHotspot = {
  id: string;
  cx: number;
  cy: number;
  status: HotspotStatus;
  title: string;
  category: string;
  impact?: string;
  evidence?: string;
  action?: string;
  source?: string;
  updatedAt?: string;
};

export type AirportScene = {
  id: 'overview' | 't3-exterior' | 't3-frontage' | 'inter-terminal' | 'services';
  label: string;
  title: string;
  summary: string;
  image: string;
  objectPosition?: string;
  hotspots: MapHotspot[];
};
`
);

const newScenes = `const scenes: AirportScene[] = [
  {
    id: "overview",
    label: "Airport overview",
    title: "Airport overview",
    summary: "High-level airport map showing terminals, roads, parking, airside zones, runways, and transfer connections.",
    image: "/manager-assets/cai-overview.jpg",
    hotspots: [
      { id: "t3-flow", cx: 52.3, cy: 37.8, status: "good", title: "Terminal 3 Passenger Flow", category: "Terminal", impact: "Smooth processing across T3.", evidence: "Wait times < 5 mins.", source: "Ops Sensor", updatedAt: "14:04" },
      { id: "parking-congestion", cx: 20.5, cy: 62.1, status: "warning", title: "Landside Parking Congestion", category: "Landside", impact: "Drivers experiencing delays entering parking.", evidence: "Queue > 15 vehicles.", action: "Deploy traffic wardens.", source: "Traffic Cam", updatedAt: "14:02" },
      { id: "runway-05r", cx: 75.0, cy: 15.0, status: "info", title: "Runway 05R/23L Active", category: "Airside", source: "ATC", updatedAt: "13:50" }
    ]
  },
  {
    id: "t3-exterior",
    label: "Terminal 3 Exterior",
    title: "Terminal 3 Exterior",
    summary: "Airside and landside view of the main international hub.",
    image: "/manager-assets/cai-t3-exterior.jpg",
    hotspots: [
      { id: "gate-b12", cx: 65.0, cy: 45.0, status: "critical", title: "Gate B12 Boarding Delay", category: "Operations", impact: "Passengers may miss connection.", evidence: "Aircraft delayed by 18 mins.", action: "Assign ramp runner.", source: "Gate Agent", updatedAt: "14:10" },
      { id: "t3-apron", cx: 80.0, cy: 60.0, status: "good", title: "Apron Clear", category: "Safety", source: "Ground Radar", updatedAt: "14:05" }
    ]
  },
  {
    id: "t3-frontage",
    label: "Terminal 3 Frontage",
    title: "Terminal 3 Frontage",
    summary: "Curbside access, drop-off zones, and passenger arrival flows.",
    image: "/manager-assets/cai-t3-frontage.jpg",
    hotspots: [
      { id: "curbside-drop", cx: 40.0, cy: 65.0, status: "warning", title: "Curbside Congestion", category: "Landside", impact: "Traffic backing up to main road.", evidence: "Dwell time > 5 mins.", action: "Dispatch police to clear idling vehicles.", source: "CCTV", updatedAt: "14:08" }
    ]
  },
  {
    id: "inter-terminal",
    label: "APM Connection",
    title: "Inter-Terminal Connection",
    summary: "Automated People Mover connecting Terminal 2 and 3.",
    image: "/manager-assets/cai-inter-terminal.jpg",
    hotspots: [
      { id: "apm-station", cx: 25.0, cy: 45.0, status: "good", title: "APM Operational", category: "Transport", evidence: "Headway 3 mins.", source: "APM Control", updatedAt: "14:12" },
      { id: "transfer-corridor", cx: 55.0, cy: 40.0, status: "info", title: "Transfer Corridor Normal", category: "Operations", source: "Ops Sensor", updatedAt: "14:12" }
    ]
  },
  {
    id: "services",
    label: "Services Zone",
    title: "Services Zone Exterior",
    summary: "Commercial facilities, banks, medical center, and retail access.",
    image: "/manager-assets/cai-services.jpg",
    hotspots: [
      { id: "medical-center", cx: 48.0, cy: 55.0, status: "info", title: "Medical Center Active", category: "Services", source: "Facilities", updatedAt: "14:00" },
      { id: "atm-offline", cx: 35.0, cy: 55.0, status: "offline", title: "ATM Maintenance", category: "Services", impact: "No cash withdrawal at this bank.", source: "Bank API", updatedAt: "13:30" }
    ]
  }
];`;
code = code.replace(/const scenes: AirportScene\[\] = \[[\s\S]*?\n\];/m, newScenes);

fs.writeFileSync('src/App.tsx', code);
