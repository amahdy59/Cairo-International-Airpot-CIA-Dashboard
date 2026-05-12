import { useMemo, useState } from "react";
import {
  BadgeInfo,
  Building2,
  Car,
  CircleDollarSign,
  Coffee,
  DoorOpen,
  Info,
  MapPin,
  Plane,
  ShieldCheck,
  ShoppingBag,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Language = "en" | "ar";

type SceneId = "overview" | "terminal1" | "terminal2" | "terminal3" | "airside";
type LayerId = "restaurants" | "services" | "parking" | "atms" | "lounges" | "gates";
type LocalText = Record<Language, string>;

type Hotspot = {
  id: string;
  layer?: LayerId;
  icon: LucideIcon;
  x: number;
  y: number;
  title: LocalText;
  summary: LocalText;
  detailTarget?: SceneId;
};

type Scene = {
  id: SceneId;
  image: string;
  title: LocalText;
  subtitle: LocalText;
  source: string;
  sourceLabel: string;
  notes: LocalText[];
  hotspots: Hotspot[];
};

const t = (en: string, ar: string): LocalText => ({ en, ar });
const image = (fileName: string) => `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}`;

const ui = {
  en: {
    eyebrow: "Photo-led airport explorer",
    title: "Cairo Airport visual guide",
    description: "Click an area on the image to see focused information, then open the detailed terminal or airside view without leaving the page.",
    source: "Image source",
    selected: "Selected area",
    visit: "Open detailed view",
    views: "Airport image views",
    layers: "Show on image",
    notes: "Useful context",
  },
  ar: {
    eyebrow: "دليل بصري بالصور",
    title: "الدليل المرئي لمطار القاهرة",
    description: "اضغط على أي منطقة في الصورة لعرض معلومات مركزة، ثم افتح العرض التفصيلي للمبنى أو منطقة التشغيل دون مغادرة الصفحة.",
    source: "مصدر الصورة",
    selected: "المنطقة المحددة",
    visit: "فتح العرض التفصيلي",
    views: "صور المطار",
    layers: "إظهار على الصورة",
    notes: "معلومات مفيدة",
  },
} as const;

const layerText: Record<LayerId, LocalText> = {
  restaurants: t("Restaurants", "المطاعم"),
  services: t("Services", "الخدمات"),
  parking: t("Parking", "المواقف"),
  atms: t("ATMs", "الصراف الآلي"),
  lounges: t("Lounges", "الصالات"),
  gates: t("Gates", "البوابات"),
};

const scenes: Scene[] = [
  {
    id: "overview",
    image: image("Cairo Airport Terminal 3.jpg"),
    source: "https://commons.wikimedia.org/wiki/File:Cairo_Airport_Terminal_3.jpg",
    sourceLabel: "Wikimedia Commons / Alensha",
    title: t("Airport overview", "نظرة عامة على المطار"),
    subtitle: t("Terminals, parking, transfer and airside orientation", "المباني والمواقف والتنقل والمناطق الجوية"),
    notes: [
      t("CAI has three parallel 05/23 runways.", "يضم مطار القاهرة ثلاثة مدارج متوازية باتجاه 05/23."),
      t("Terminal 1 is separate from the connected Terminal 2 and Terminal 3 complex.", "يقع مبنى 1 منفصلا عن مجمع مبنيي 2 و3 المتصلين."),
      t("Official services include restaurants, lounges, banks/ATMs, car parking, medical facilities and APM transfer.", "تشمل الخدمات الرسمية المطاعم والصالات والبنوك والصراف الآلي والمواقف والخدمات الطبية وقطار التنقل الداخلي."),
    ],
    hotspots: [
      {
        id: "overview-t1",
        icon: Building2,
        x: 25,
        y: 50,
        title: t("Terminal 1", "مبنى 1"),
        summary: t("Older terminal complex serving domestic, regional and selected international operations.", "مجمع أقدم يخدم رحلات داخلية وإقليمية وبعض الرحلات الدولية."),
        detailTarget: "terminal1",
      },
      {
        id: "overview-t2",
        icon: Building2,
        x: 50,
        y: 46,
        title: t("Terminal 2", "مبنى 2"),
        summary: t("Renovated international terminal connected directly to Terminal 3.", "مبنى دولي مطور ومتصل مباشرة بمبنى 3."),
        detailTarget: "terminal2",
      },
      {
        id: "overview-t3",
        icon: Building2,
        x: 74,
        y: 48,
        title: t("Terminal 3", "مبنى 3"),
        summary: t("Primary EgyptAir hub and the largest passenger terminal at Cairo Airport.", "المركز الرئيسي لمصر للطيران وأكبر مباني الركاب في مطار القاهرة."),
        detailTarget: "terminal3",
      },
      {
        id: "overview-parking",
        layer: "parking",
        icon: Car,
        x: 15,
        y: 78,
        title: t("Parking", "المواقف"),
        summary: t("Car parking supports the terminal frontage, shuttle transfer and pick-up zones.", "مواقف السيارات تخدم واجهات المباني والتنقل الداخلي ومناطق الاستقبال."),
      },
      {
        id: "overview-ground",
        layer: "services",
        icon: MapPin,
        x: 56,
        y: 80,
        title: t("Ground transport", "النقل الأرضي"),
        summary: t("Use this area for buses, taxis, car rental and terminal transfer planning.", "استخدم هذه المنطقة للحافلات وسيارات الأجرة وتأجير السيارات والتنقل بين المباني."),
      },
      {
        id: "overview-airside",
        icon: Plane,
        x: 52,
        y: 18,
        title: t("Runway and apron", "المدارج والساحات"),
        summary: t("Airside view covers runways, taxiways, apron stands, cargo and maintenance context.", "العرض الجوي يغطي المدارج والممرات وساحات الطائرات والشحن والصيانة."),
        detailTarget: "airside",
      },
    ],
  },
  {
    id: "terminal1",
    image: image("CairoAirport-Terminal1.JPG"),
    source: "https://commons.wikimedia.org/wiki/File:CairoAirport-Terminal1.JPG",
    sourceLabel: "Wikimedia Commons / Beebah",
    title: t("Terminal 1 detail", "تفاصيل مبنى 1"),
    subtitle: t("Halls, check-in, services and gates", "الصالات وتسجيل السفر والخدمات والبوابات"),
    notes: [
      t("Terminal 1 includes multiple halls and compact passenger flows.", "يضم مبنى 1 عدة صالات ومسارات ركاب مدمجة."),
      t("Use this view for check-in, banks/ATMs, restaurants, parking and gate orientation.", "استخدم هذا العرض لتسجيل السفر والبنوك والصراف الآلي والمطاعم والمواقف والبوابات."),
    ],
    hotspots: [
      { id: "t1-checkin", layer: "services", icon: BadgeInfo, x: 30, y: 66, title: t("Check-in halls", "صالات تسجيل السفر"), summary: t("Departure counters, baggage wrapping and information support.", "كاونترات السفر وتغليف الحقائب ومكاتب المعلومات.") },
      { id: "t1-gates", layer: "gates", icon: DoorOpen, x: 72, y: 44, title: t("Gate area", "منطقة البوابات"), summary: t("Compact boarding area for Terminal 1 flights.", "منطقة صعود مدمجة لرحلات مبنى 1.") },
      { id: "t1-food", layer: "restaurants", icon: Utensils, x: 47, y: 56, title: t("Restaurants and cafes", "مطاعم ومقاهي"), summary: t("Food and drink points near the passenger hall spine.", "نقاط طعام وشراب قرب محور صالات الركاب.") },
      { id: "t1-atm", layer: "atms", icon: CircleDollarSign, x: 58, y: 70, title: t("Banks and ATMs", "البنوك والصراف الآلي"), summary: t("Currency and cash services grouped with passenger facilities.", "خدمات العملة والنقد ضمن مرافق الركاب.") },
      { id: "t1-parking", layer: "parking", icon: Car, x: 19, y: 82, title: t("Parking and pick-up", "المواقف والاستقبال"), summary: t("Landside access for drop-off, pick-up and parking.", "وصول أرضي للنزول والاستقبال والمواقف.") },
    ],
  },
  {
    id: "terminal2",
    image: image("CAI T2 20200110.jpg"),
    source: "https://commons.wikimedia.org/wiki/File:CAI_T2_20200110.jpg",
    sourceLabel: "Wikimedia Commons",
    title: t("Terminal 2 detail", "تفاصيل مبنى 2"),
    subtitle: t("International processing and Terminal 3 connector", "إجراءات السفر الدولي والاتصال بمبنى 3"),
    notes: [
      t("Terminal 2 connects directly with Terminal 3.", "مبنى 2 متصل مباشرة بمبنى 3."),
      t("The view prioritizes international flow: check-in, security, lounges, shops and gates.", "يركز العرض على مسار الرحلات الدولية: تسجيل السفر والأمن والصالات والمتاجر والبوابات."),
    ],
    hotspots: [
      { id: "t2-checkin", layer: "services", icon: BadgeInfo, x: 30, y: 68, title: t("Departure hall", "صالة المغادرة"), summary: t("Check-in and passenger preparation before security.", "تسجيل السفر وتجهيز الركاب قبل التفتيش.") },
      { id: "t2-security", layer: "services", icon: ShieldCheck, x: 48, y: 54, title: t("Security and passport control", "الأمن والجوازات"), summary: t("International processing before airside entry.", "إجراءات دولية قبل دخول منطقة السفر الجوية.") },
      { id: "t2-lounge", layer: "lounges", icon: Coffee, x: 62, y: 44, title: t("Lounges", "الصالات"), summary: t("Premium waiting areas near the secure concourse.", "مناطق انتظار مميزة قرب الممر المؤمن.") },
      { id: "t2-retail", layer: "restaurants", icon: ShoppingBag, x: 62, y: 66, title: t("Duty free and food", "السوق الحرة والطعام"), summary: t("Retail, duty free, restaurants and cafeterias along the concourse.", "متاجر وسوق حرة ومطاعم ومقاه على امتداد الممر.") },
      { id: "t2-gates", layer: "gates", icon: DoorOpen, x: 78, y: 50, title: t("Pier gates", "بوابات الرصيف"), summary: t("Airside gate bank connected to aircraft stands.", "مجموعة بوابات متصلة بمواقف الطائرات.") },
    ],
  },
  {
    id: "terminal3",
    image: image("Gate at Terminal 3 Cairo International Airport - panoramio.jpg"),
    source: "https://commons.wikimedia.org/wiki/File:Gate_at_Terminal_3_Cairo_International_Airport_-_panoramio.jpg",
    sourceLabel: "Wikimedia Commons / Panoramio",
    title: t("Terminal 3 detail", "تفاصيل مبنى 3"),
    subtitle: t("EgyptAir hub, check-in, lounges and pier gates", "مركز مصر للطيران وتسجيل السفر والصالات والبوابات"),
    notes: [
      t("Terminal 3 is the main EgyptAir hub.", "مبنى 3 هو المركز الرئيسي لمصر للطيران."),
      t("Use this view for lounges, duty free, gate access and parking orientation.", "استخدم هذا العرض للصـالات والسوق الحرة والوصول إلى البوابات والمواقف."),
    ],
    hotspots: [
      { id: "t3-checkin", layer: "services", icon: BadgeInfo, x: 33, y: 64, title: t("EgyptAir check-in", "تسجيل مصر للطيران"), summary: t("Primary hub check-in and support area.", "منطقة تسجيل ودعم رئيسية للمركز.") },
      { id: "t3-lounge", layer: "lounges", icon: Coffee, x: 55, y: 44, title: t("Lounges", "الصالات"), summary: t("Premium lounge and waiting areas near the secure concourse.", "صالات وانتظار مميز قرب منطقة السفر المؤمنة.") },
      { id: "t3-dutyfree", layer: "restaurants", icon: ShoppingBag, x: 63, y: 63, title: t("Duty free and food", "السوق الحرة والطعام"), summary: t("Retail and dining options support passenger dwell time.", "متاجر وخيارات طعام تخدم وقت انتظار الركاب.") },
      { id: "t3-gates", layer: "gates", icon: DoorOpen, x: 76, y: 48, title: t("Pier gates", "بوابات الرصيف"), summary: t("Gate pier supports boarding and aircraft stand access.", "رصيف البوابات يدعم الصعود والوصول إلى مواقف الطائرات.") },
      { id: "t3-parking", layer: "parking", icon: Car, x: 22, y: 80, title: t("Parking and transfer", "المواقف والتنقل"), summary: t("Parking and terminal transfer connections sit on the landside edge.", "تقع المواقف وروابط التنقل بين المباني في الجهة الأرضية.") },
    ],
  },
  {
    id: "airside",
    image: image("Cairo International Airport 03.JPG"),
    source: "https://commons.wikimedia.org/wiki/File:Cairo_International_Airport_03.JPG",
    sourceLabel: "Wikimedia Commons / Ad Meskens",
    title: t("Airside and operations", "المناطق الجوية والتشغيل"),
    subtitle: t("Runways, apron, cargo and seasonal flow", "المدارج والساحات والشحن والمسار الموسمي"),
    notes: [
      t("Manager-critical items include runway status, apron safety, cargo and maintenance response.", "تشمل عناصر الإدارة المهمة حالة المدرج وسلامة الساحة والشحن والاستجابة للصيانة."),
      t("Seasonal/Hajj flow is shown separately to reduce passenger map clutter.", "يظهر مسار الحج/الموسمي منفصلا لتقليل ازدحام خريطة الركاب."),
    ],
    hotspots: [
      { id: "air-runways", icon: Plane, x: 35, y: 38, title: t("Parallel runways", "مدارج متوازية"), summary: t("Three parallel 05/23 runways are represented for orientation.", "تمثيل لثلاثة مدارج متوازية باتجاه 05/23.") },
      { id: "air-apron", icon: ShieldCheck, x: 56, y: 55, title: t("Apron and stands", "الساحة ومواقف الطائرات"), summary: t("Aircraft turnaround, ground support and safety checks happen here.", "تتم هنا خدمة الطائرات ومساندة الأرض وفحوص السلامة.") },
      { id: "air-cargo", layer: "services", icon: Building2, x: 72, y: 38, title: t("Cargo Village", "قرية البضائع"), summary: t("Cargo and logistics are separated from passenger terminal flow.", "عمليات الشحن واللوجستيات منفصلة عن مسار الركاب.") },
      { id: "air-seasonal", layer: "services", icon: Building2, x: 76, y: 72, title: t("Seasonal / Hajj terminal", "المبنى الموسمي / الحج"), summary: t("Seasonal terminal supports pilgrimage and overflow charter operations.", "يدعم المبنى الموسمي رحلات الحج والرحلات العارضة الإضافية.") },
      { id: "air-maintenance", icon: ShieldCheck, x: 45, y: 72, title: t("Service / maintenance", "الخدمة والصيانة"), summary: t("Operational view highlights maintenance and safety response points.", "يعرض منظور التشغيل نقاط الصيانة والاستجابة للسلامة.") },
    ],
  },
];

export function AirportMap2D({ className = "", language = "en" }: { className?: string; language?: Language }) {
  const [activeSceneId, setActiveSceneId] = useState<SceneId>("overview");
  const [activeHotspotId, setActiveHotspotId] = useState(scenes[0].hotspots[0].id);
  const [activeLayers, setActiveLayers] = useState<Record<LayerId, boolean>>({
    restaurants: true,
    services: true,
    parking: true,
    atms: true,
    lounges: true,
    gates: true,
  });

  const copy = ui[language];
  const activeScene = scenes.find((scene) => scene.id === activeSceneId) ?? scenes[0];
  const activeHotspot = useMemo(
    () => activeScene.hotspots.find((hotspot) => hotspot.id === activeHotspotId) ?? activeScene.hotspots[0],
    [activeHotspotId, activeScene],
  );
  const visibleHotspots = activeScene.hotspots.filter((hotspot) => !hotspot.layer || activeLayers[hotspot.layer]);

  const selectScene = (sceneId: SceneId) => {
    const scene = scenes.find((item) => item.id === sceneId) ?? scenes[0];
    setActiveSceneId(scene.id);
    setActiveHotspotId(scene.hotspots[0].id);
  };

  return (
    <section className={`panel overflow-hidden ${className}`} aria-labelledby="airport-visual-title">
      <div className="border-b border-border p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">{copy.eyebrow}</p>
        <div className="mt-1 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="airport-visual-title" className="text-2xl font-semibold tracking-tight">
              {copy.title}
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">{copy.description}</p>
          </div>
          <a href={activeScene.source} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs hover:bg-secondary">
            <Info aria-hidden="true" className="h-4 w-4 text-primary" />
            {copy.source}
          </a>
        </div>
      </div>

      <div className="grid gap-4 p-4 xl:grid-cols-[220px_minmax(0,1fr)_320px]">
        <nav className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1" aria-label={copy.views}>
          {scenes.map((scene, index) => {
            const active = scene.id === activeScene.id;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => selectScene(scene.id)}
                aria-pressed={active}
                className={`rounded-md border p-3 text-start transition-colors ${
                  active ? "border-primary bg-primary/15 text-primary" : "border-border bg-background/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <span className="block font-mono text-[10px] uppercase tracking-wider">0{index + 1}</span>
                <span className="mt-1 block text-sm font-semibold">{scene.title[language]}</span>
                <span className="mt-0.5 block text-[11px] leading-snug opacity-80">{scene.subtitle[language]}</span>
              </button>
            );
          })}
        </nav>

        <div>
          <div className="relative overflow-hidden rounded-lg border border-border bg-background">
            <img src={activeScene.image} alt={activeScene.title[language]} className="aspect-[16/9] w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-white/10" />
            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <path d="M8 80 C26 66, 42 58, 64 64 C78 68, 88 62, 96 50" fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="0.5" strokeDasharray="2 2" />
              <path d="M15 32 C36 24, 58 28, 88 20" fill="none" stroke="rgba(255,211,67,.8)" strokeWidth="0.45" />
            </svg>
            <div className="absolute start-4 top-4 max-w-[78%] rounded-md bg-background/85 p-3 backdrop-blur">
              <h3 className="text-lg font-semibold">{activeScene.title[language]}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{activeScene.subtitle[language]}</p>
            </div>
            {visibleHotspots.map((hotspot, index) => {
              const Icon = hotspot.icon;
              const active = hotspot.id === activeHotspot.id;
              return (
                <button
                  key={hotspot.id}
                  type="button"
                  onClick={() => setActiveHotspotId(hotspot.id)}
                  aria-label={hotspot.title[language]}
                  className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-semibold shadow-lg transition ${
                    active ? "border-white bg-primary text-primary-foreground" : "border-white/70 bg-background/90 text-foreground hover:bg-primary hover:text-primary-foreground"
                  }`}
                  style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                >
                  <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{index + 1}</span>
                </button>
              );
            })}
            <div className="absolute bottom-3 end-3 rounded bg-background/85 px-2 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur">
              {activeScene.sourceLabel}
            </div>
          </div>

          <div className="mt-3">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{copy.layers}</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(layerText) as LayerId[]).map((layer) => (
                <button
                  key={layer}
                  type="button"
                  onClick={() => setActiveLayers((current) => ({ ...current, [layer]: !current[layer] }))}
                  aria-pressed={activeLayers[layer]}
                  className={`h-8 rounded-md border px-3 text-xs transition-colors ${
                    activeLayers[layer] ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {layerText[layer][language]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="panel-inner p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{copy.selected}</p>
            <h3 className="mt-2 text-lg font-semibold">{activeHotspot.title[language]}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{activeHotspot.summary[language]}</p>
            {activeHotspot.detailTarget && (
              <button type="button" onClick={() => selectScene(activeHotspot.detailTarget!)} className="mt-4 inline-flex h-9 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90">
                {copy.visit}
              </button>
            )}
          </div>

          <div className="panel-inner p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{copy.notes}</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {activeScene.notes.map((note) => (
                <li key={note.en} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{note[language]}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
