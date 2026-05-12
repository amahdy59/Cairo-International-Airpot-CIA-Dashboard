import { useMemo, useState } from "react";
import {
  BadgeInfo,
  Building2,
  Car,
  CircleX,
  CircleDollarSign,
  Coffee,
  DoorOpen,
  Eye,
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
  const [previewOpen, setPreviewOpen] = useState(false);
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
    setPreviewOpen(false);
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
          <div className="relative overflow-hidden rounded-lg border border-border bg-[#dcecf2]">
            <AirportDiagram sceneId={activeScene.id} title={activeScene.title[language]} subtitle={activeScene.subtitle[language]} />
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
                  <span className="hidden sm:inline">{index + 1}. {hotspot.title[language]}</span>
                </button>
              );
            })}
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
            <button type="button" onClick={() => setPreviewOpen(true)} className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium hover:bg-secondary">
              <Eye aria-hidden="true" className="h-4 w-4 text-primary" />
              {language === "ar" ? "عرض صورة حقيقية" : "View real image"}
            </button>
            {activeHotspot.detailTarget && (
              <button type="button" onClick={() => selectScene(activeHotspot.detailTarget!)} className="mt-4 ms-2 inline-flex h-9 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90">
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

      {previewOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="airport-photo-title">
          <div className="panel max-h-[90vh] w-full max-w-4xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-border p-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{activeScene.sourceLabel}</p>
                <h3 id="airport-photo-title" className="text-lg font-semibold">{activeHotspot.title[language]}</h3>
              </div>
              <button type="button" onClick={() => setPreviewOpen(false)} className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-secondary" aria-label={language === "ar" ? "إغلاق الصورة" : "Close image"}>
                <CircleX aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <img src={activeScene.image} alt={activeHotspot.title[language]} className="max-h-[68vh] w-full object-cover" />
            <div className="flex items-center justify-between gap-3 p-4 text-xs text-muted-foreground">
              <span>{activeScene.subtitle[language]}</span>
              <a href={activeScene.source} target="_blank" rel="noreferrer" className="text-primary hover:underline">{copy.source}</a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function AirportDiagram({ sceneId, title, subtitle }: { sceneId: SceneId; title: string; subtitle: string }) {
  const focus: Record<SceneId, { x: number; y: number; w: number; fill: string; label: string }> = {
    overview: { x: 390, y: 335, w: 310, fill: "#2f8fbc", label: "CAI" },
    terminal1: { x: 175, y: 350, w: 245, fill: "#15959f", label: "T1" },
    terminal2: { x: 430, y: 330, w: 240, fill: "#176bc5", label: "T2" },
    terminal3: { x: 680, y: 350, w: 245, fill: "#7747b8", label: "T3" },
    airside: { x: 760, y: 170, w: 190, fill: "#5f514d", label: "OPS" },
  };
  const selected = focus[sceneId];

  return (
    <svg viewBox="0 0 1080 640" className="block aspect-[16/9] w-full" role="img" aria-label={`${title}. ${subtitle}`}>
      <defs>
        <pattern id="airport-grid" width="36" height="36" patternUnits="userSpaceOnUse">
          <path d="M36 0H0V36" fill="none" stroke="#9db4bc" strokeOpacity="0.35" strokeWidth="1" />
        </pattern>
        <filter id="diagram-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#263238" floodOpacity="0.22" />
        </filter>
        <linearGradient id="terminal-roof" x1="0" x2="1">
          <stop offset="0" stopColor="#f7fbfc" />
          <stop offset="1" stopColor="#c9d8dc" />
        </linearGradient>
      </defs>

      <rect width="1080" height="640" fill="#e8f3f7" />
      <rect width="1080" height="640" fill="url(#airport-grid)" />
      <path d="M30 560 C220 500 330 525 500 475 C690 420 815 455 1040 390" fill="none" stroke="#6f8b72" strokeWidth="54" strokeLinecap="round" opacity="0.22" />
      <text x="44" y="58" fill="#17364b" fontFamily="Inter, Arial" fontSize="34" fontWeight="850">CAIRO INTERNATIONAL AIRPORT</text>
      <text x="46" y="88" fill="#6c7a86" fontFamily="Inter, Arial" fontSize="16" letterSpacing="7">AIRPORT LAYOUT OVERVIEW</text>
      <line x1="46" y1="104" x2="106" y2="104" stroke="#10aeca" strokeWidth="4" />
      <text x="46" y="132" fill="#315166" fontFamily="Inter, Arial" fontSize="13" fontWeight="700">{title}</text>
      <text x="46" y="152" fill="#627985" fontFamily="Inter, Arial" fontSize="12">{subtitle}</text>

      <g transform="translate(70 170) rotate(-5)" filter="url(#diagram-shadow)">
        {[0, 58, 116].map((offset) => (
          <g key={offset} transform={`translate(0 ${offset})`}>
            <rect width="880" height="38" rx="8" fill="#7f8e93" />
            <line x1="40" y1="19" x2="830" y2="19" stroke="#fff" strokeWidth="3" strokeDasharray="28 18" opacity="0.95" />
          </g>
        ))}
        <path d="M20 168 C240 108 430 134 700 82" fill="none" stroke="#e6b84c" strokeWidth="4" strokeDasharray="16 10" />
        <path d="M90 206 C320 136 520 170 820 118" fill="none" stroke="#e6b84c" strokeWidth="3" />
      </g>

      <g filter="url(#diagram-shadow)">
        <TerminalShape x={165} y={350} width={245} color="#15959f" label="TERMINAL 1" active={sceneId === "terminal1"} />
        <TerminalShape x={420} y={330} width={255} color="#176bc5" label="TERMINAL 2" active={sceneId === "terminal2"} />
        <TerminalShape x={680} y={350} width={245} color="#7747b8" label="TERMINAL 3" active={sceneId === "terminal3"} />
        <path d="M300 470 C420 440 555 442 740 470" fill="none" stroke="#6e7f84" strokeWidth="42" strokeLinecap="round" />
        <line x1="290" y1="470" x2="750" y2="470" stroke="#fff" strokeWidth="3" strokeDasharray="18 16" opacity="0.9" />
        <rect x="430" y="472" width="220" height="52" rx="8" fill="#95b7bd" stroke="#fff" strokeWidth="3" />
        <text x="540" y="504" textAnchor="middle" fill="#fff" fontFamily="Inter, Arial" fontSize="18" fontWeight="800">MAIN HALLS</text>
        <rect x="120" y="505" width="150" height="78" rx="8" fill="#6d8791" />
        <rect x="810" y="505" width="150" height="78" rx="8" fill="#6d8791" />
        <text x="195" y="550" textAnchor="middle" fill="#fff" fontFamily="Inter, Arial" fontSize="18" fontWeight="800">PARKING</text>
        <text x="885" y="550" textAnchor="middle" fill="#fff" fontFamily="Inter, Arial" fontSize="18" fontWeight="800">PARKING</text>
        <ControlTower />
        <rect x="775" y="128" width="190" height="66" rx="8" fill={sceneId === "airside" ? "#5f514d" : "#87949a"} stroke="#fff" strokeWidth="3" />
        <text x="870" y="168" textAnchor="middle" fill="#fff" fontFamily="Inter, Arial" fontSize="16" fontWeight="800">SERVICE / MAINT.</text>
      </g>

      <g opacity="0.95">
        <Callout x={260} y={280} color="#15959f" label="TERMINAL 1" />
        <Callout x={535} y={268} color="#176bc5" label="TERMINAL 2" />
        <Callout x={805} y={280} color="#7747b8" label="TERMINAL 3" />
        <Callout x={245} y={155} color="#17364b" label="RUNWAY" />
        <Callout x={540} y={170} color="#176bc5" label="TAXIWAY" />
        <Callout x={795} y={170} color="#15959f" label="APRON" />
      </g>

      {sceneId !== "overview" && (
        <g filter="url(#diagram-shadow)">
          <rect x={selected.x - 18} y={selected.y - 22} width={selected.w + 36} height="142" rx="16" fill="none" stroke={selected.fill} strokeWidth="5" strokeDasharray="10 8" />
          <rect x="42" y="565" width="250" height="42" rx="8" fill={selected.fill} />
          <text x="167" y="592" textAnchor="middle" fill="#fff" fontFamily="Inter, Arial" fontSize="16" fontWeight="850">{selected.label} DETAILED VIEW</text>
        </g>
      )}
    </svg>
  );
}

function TerminalShape({ x, y, width, color, label, active }: { x: number; y: number; width: number; color: string; label: string; active: boolean }) {
  return (
    <g>
      <path d={`M${x} ${y + 92} L${x + width} ${y + 34} L${x + width + 76} ${y + 72} L${x + 78} ${y + 132} Z`} fill="#eef5f7" stroke={active ? color : "#b4c2c7"} strokeWidth={active ? 5 : 2} />
      <path d={`M${x + 34} ${y + 78} L${x + width - 15} ${y + 36} L${x + width - 15} ${y + 5} L${x + 34} ${y + 47} Z`} fill="url(#terminal-roof)" />
      <path d={`M${x + 42} ${y + 82} L${x + width - 26} ${y + 43}`} stroke="#3b7184" strokeWidth="8" strokeDasharray="14 8" opacity="0.75" />
      <rect x={x + width / 2 - 72} y={y + 55} width="146" height="38" rx="7" fill={color} />
      <text x={x + width / 2} y={y + 80} textAnchor="middle" fill="#fff" fontFamily="Inter, Arial" fontSize="15" fontWeight="850">{label}</text>
    </g>
  );
}

function Callout({ x, y, color, label }: { x: number; y: number; color: string; label: string }) {
  return (
    <g>
      <rect x={x - 68} y={y - 22} width="136" height="42" rx="8" fill={color} stroke="#fff" strokeWidth="2" />
      <line x1={x} y1={y + 20} x2={x} y2={y + 82} stroke="#fff" strokeWidth="3" />
      <circle cx={x} cy={y + 85} r="7" fill={color} stroke="#fff" strokeWidth="3" />
      <text x={x} y={y + 5} textAnchor="middle" fill="#fff" fontFamily="Inter, Arial" fontSize="15" fontWeight="850">{label}</text>
    </g>
  );
}

function ControlTower() {
  return (
    <g>
      <path d="M536 336 L584 336 L574 228 L546 228 Z" fill="#d9e5e8" stroke="#9aa9ad" strokeWidth="2" />
      <ellipse cx="560" cy="226" rx="44" ry="16" fill="#edf5f7" stroke="#87959a" strokeWidth="2" />
      <rect x="526" y="205" width="68" height="30" rx="6" fill="#3e6f7f" />
      <rect x="536" y="212" width="48" height="12" fill="#9fd6e4" />
      <text x="560" y="258" textAnchor="middle" fill="#44565d" fontFamily="Inter, Arial" fontSize="11" fontWeight="800">TOWER</text>
    </g>
  );
}
