const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Update AirportScene type and map data
code = code.replace(
  /export type AirportScene = \{[\s\S]*?\};\n/,
  `export type AirportScene = {
  id: 'terminal-1' | 'terminal-2' | 'terminal-3' | 'landside' | 'services';
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
    id: "terminal-3",
    label: "Terminal 3",
    title: "Terminal 3 Aerial",
    summary: "Airside and landside view of the main international hub.",
    image: "/manager-assets/terminal-3.jpg",
    hotspots: [
      { id: "t3-flow", cx: 52.3, cy: 37.8, status: "good", title: "Terminal 3 Passenger Flow", category: "Terminal", impact: "Smooth processing across T3.", evidence: "Wait times < 5 mins.", source: "Ops Sensor", updatedAt: "14:04" },
      { id: "gate-b12", cx: 65.0, cy: 45.0, status: "critical", title: "Gate B12 Boarding Delay", category: "Operations", impact: "Passengers may miss connection.", evidence: "Aircraft delayed by 18 mins.", action: "Assign ramp runner.", source: "Gate Agent", updatedAt: "14:10" }
    ]
  },
  {
    id: "terminal-2",
    label: "Terminal 2",
    title: "Terminal 2 Aerial",
    summary: "International terminal connected operationally with Terminal 3.",
    image: "/manager-assets/terminal-2.jpg",
    hotspots: [
      { id: "t2-security", cx: 45.0, cy: 50.0, status: "warning", title: "T2 Security Queue Rising", category: "Terminal", impact: "Potential delays for departing passengers.", evidence: "Wait time 17 mins.", action: "Open extra lane.", source: "Ops Sensor", updatedAt: "14:15" }
    ]
  },
  {
    id: "terminal-1",
    label: "Terminal 1",
    title: "Terminal 1 Aerial",
    summary: "Separate terminal area serving selected domestic and international operations.",
    image: "/manager-assets/terminal-1.jpg",
    hotspots: [
      { id: "t1-apron", cx: 60.0, cy: 35.0, status: "info", title: "Apron Normal", category: "Airside", source: "Ground Radar", updatedAt: "14:00" }
    ]
  },
  {
    id: "landside",
    label: "Landside Buildings",
    title: "Landside Buildings Aerial",
    summary: "Parking facilities, access roads, and landside infrastructure.",
    image: "/manager-assets/landside.jpg",
    hotspots: [
      { id: "parking-congestion", cx: 20.5, cy: 62.1, status: "warning", title: "Parking Congestion", category: "Landside", impact: "Drivers experiencing delays entering parking.", evidence: "Queue > 15 vehicles.", action: "Deploy traffic wardens.", source: "Traffic Cam", updatedAt: "14:02" }
    ]
  },
  {
    id: "services",
    label: "Support & Services",
    title: "Support & Services Aerial",
    summary: "Maintenance, catering, and airport support facilities.",
    image: "/manager-assets/support-services.jpg",
    hotspots: [
      { id: "catering-facility", cx: 70.0, cy: 40.0, status: "good", title: "Catering Operations Normal", category: "Services", source: "Facilities", updatedAt: "14:10" }
    ]
  }
];`;
code = code.replace(/const scenes: AirportScene\[\] = \[[\s\S]*?\n\];/m, newScenes);

// 2. Remove DigitalAlertStrip, DigitalKpiGrid, DigitalOperationalGrid from DigitalTwinView
// The function starts around line 745. Let's do a replace on the return block of DigitalTwinView.
const dtStart = code.indexOf('return (', code.indexOf('function DigitalTwinView() {'));
const dtEnd = code.indexOf(');', code.indexOf('</SectionPanel>', dtStart));

code = code.replace(
  /<div className="grid min-w-0 gap-4 lg:gap-6">\s*<DigitalAlertStrip \/>\s*<DigitalKpiGrid \/>\s*<SectionPanel className="overflow-hidden p-0" title="">/,
  `<div className="grid min-w-0 gap-4 lg:gap-6">
      <SectionPanel className="overflow-hidden p-0" title="">`
);

code = code.replace(
  /<\/SectionPanel>\s*<DigitalOperationalGrid \/>\s*<\/div>/,
  `</SectionPanel>\n    </div>`
);

// We need to fix the default activeSceneId to match the new IDs
code = code.replace(
  /const \[activeSceneId, setActiveSceneId\] = useState<AirportScene\["id"\]>\("overview"\);/,
  `const [activeSceneId, setActiveSceneId] = useState<AirportScene["id"]>("terminal-3");`
);
code = code.replace(
  /activeScene.id === "overview"/g,
  `activeScene.id === "terminal-3"`
);
code = code.replace(
  /activeScene.id !== "overview"/g,
  `activeScene.id !== "terminal-3"`
);
code = code.replace(
  /setActiveSceneId\("overview"\);/g,
  `setActiveSceneId("terminal-3");`
);

// 3. Add those components to OperationsView
// We'll put DigitalAlertStrip and DigitalKpiGrid at the top of OperationsView, and DigitalOperationalGrid at the bottom.
const opsStart = code.indexOf('function OperationsView() {');
const opsReturn = code.indexOf('return (', opsStart);
const opsGridStart = code.indexOf('<div className="grid gap-6">', opsReturn);

code = code.replace(
  /<div className="grid gap-6">/g,
  (match, offset) => {
    if (offset > opsStart && offset < opsStart + 1000) {
      return `<div className="grid gap-6">
      <DigitalAlertStrip />
      <DigitalKpiGrid />`;
    }
    return match;
  }
);

const opsEnd = code.indexOf('</SectionPanel>', opsStart);
const opsEndDiv = code.indexOf('</div>', opsEnd);
code = code.replace(
  /<\/SectionPanel>\s*<\/div>\s*\);\s*}/g,
  (match, offset) => {
    if (offset > opsStart && offset < opsStart + 10000) {
      return `</SectionPanel>
      <DigitalOperationalGrid />
    </div>
  );
}`;
    }
    return match;
  }
);


fs.writeFileSync('src/App.tsx', code);
