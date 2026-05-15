import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Clock3,
  Contrast,
  Eye,
  Flame,
  Languages,
  Plane,
  Radar,
  ShieldCheck,
  Users,
  Wrench,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MetricCard, ProgressBar, SectionPanel, Sparkline, StatusPill } from "@/components/command-center/MetricWidgets";

type ManagerTab = "digital" | "operations" | "safety";
type Tone = "ok" | "info" | "warn" | "high" | "crit" | "neutral";
type Language = "en" | "ar";

type FlightRow = {
  flight: string;
  city: string;
  time: string;
  gate: string;
  status: string;
  tone: Tone;
};

type AirportScene = {
  id: "overview" | "t1" | "t2" | "t3";
  label: string;
  title: string;
  summary: string;
  objectPosition: string;
};

const ASSET = "/manager-assets/digital-twin-reference.png";

const LocaleContext = createContext<Language>("en");

const arText: Record<string, string> = {
  "Skip to content": "تخطي إلى المحتوى",
  "Go to dashboard": "العودة إلى لوحة القيادة",
  Cairo: "القاهرة",
  "Manager dashboard sections": "أقسام لوحة إدارة المطار",
  "Interactive airport image map": "خريطة تفاعلية للمطار",
  "Cairo Airport visual command map": "خريطة القيادة المرئية لمطار القاهرة",
  "Use the airport image as the main interactive canvas. Click the hotspots to inspect details and shift into terminal views.": "استخدم صورة المطار كلوحة تفاعلية رئيسية. اضغط على النقاط النشطة لعرض التفاصيل والانتقال إلى عروض المباني.",
  "View real image": "عرض الصورة",
  "Cairo Airport digital twin reference": "مرجع التوأم الرقمي لمطار القاهرة",
  "Selected area": "المنطقة المحددة",
  "Airport overview": "نظرة عامة على المطار",
  "High-level airport map showing terminals, roads, parking, airside zones, runways, and transfer connections.": "خريطة عالية المستوى تعرض المباني والطرق والمواقف ومناطق الحركة الجوية والمدارج وروابط النقل.",
  "Terminal 1": "مبنى 1",
  "Terminal 2": "مبنى 2",
  "Terminal 3": "مبنى 3",
  "Separate terminal area serving selected domestic, regional and international operations.": "منطقة مبنى منفصلة تخدم بعض الرحلات الداخلية والإقليمية والدولية.",
  "International terminal connected operationally with the Terminal 3 side of the airport.": "مبنى دولي متصل تشغيليا بالجانب الخاص بمبنى 3.",
  "Major passenger terminal and hub-style area with large concourse and gate capacity.": "مبنى ركاب رئيسي ومنطقة محورية بسعة كبيرة للصالات والبوابات.",
  "Open detailed view": "فتح العرض التفصيلي",
  "Back to overview": "العودة للنظرة العامة",
  "Terminal quick facts": "حقائق سريعة عن المباني",
  "Domestic, regional and selected international operations": "رحلات داخلية وإقليمية وبعض الرحلات الدولية",
  "Renovated international terminal connected to Terminal 3": "مبنى دولي مطور ومتصل بمبنى 3",
  "EgyptAir hub and largest passenger terminal": "مركز مصر للطيران وأكبر مبنى ركاب",
  "Hall 1 - Hall 2 - Hall 3": "صالة 1 - صالة 2 - صالة 3",
  "International concourse": "صالة دولية",
  "Main concourse and pier": "الصالة الرئيسية ورصيف البوابات",
  "Domestic carriers": "شركات داخلية",
  "Star Alliance partners": "شركاء ستار ألاينس",
  "Wait times": "أوقات الانتظار",
  "T3 check-in": "تسجيل مبنى 3",
  Passport: "الجوازات",
  Security: "الأمن",
  Baggage: "الأمتعة",
  "Needs a decision now": "قرارات مطلوبة الآن",
  "3 items": "3 بنود",
  "T2 security queue": "طابور أمن مبنى 2",
  "Open one more lane": "افتح مسارا إضافيا",
  "Gate F11 boarding": "صعود بوابة F11",
  "Send floor agent": "أرسل مشرف صالة",
  "T2-B scanner": "ماسح T2-B",
  "Escalate maintenance": "صعد للصيانة",
  Offline: "متوقف",
  "Passengers today": "ركاب اليوم",
  "Daily benchmark 85k": "المعيار اليومي 85 ألف",
  "+4.1% vs yesterday": "+4.1% عن أمس",
  "Aircraft movements": "حركة الطائرات",
  "390 average": "متوسط 390",
  "On schedule": "ضمن الجدول",
  "Avg taxi-out": "متوسط الخروج للمدرج",
  "CAI operations sample": "عينة تشغيلية للمطار",
  "Active alerts": "تنبيهات نشطة",
  "2 medium, 1 high": "2 متوسط، 1 مرتفع",
  "Needs review": "يتطلب مراجعة",
  Departures: "المغادرات",
  Arrivals: "الوصول",
  "Next 60 min": "الـ 60 دقيقة القادمة",
  "Sample data": "بيانات عينة",
  Flight: "الرحلة",
  To: "إلى",
  From: "من",
  Time: "الوقت",
  Gate: "البوابة",
  Status: "الحالة",
  "Sample only": "عينة فقط",
  "Passenger flow": "تدفق الركاب",
  Modelled: "نموذجي",
  "Passenger flow rises into the midday wave": "تدفق الركاب يرتفع مع موجة منتصف اليوم",
  "Line chart is used because managers need the trend over time, not a terminal-by-terminal comparison.": "استخدمنا مخططا خطيا لأن المدير يحتاج إلى فهم الاتجاه عبر الوقت، وليس مقارنة المباني فقط.",
  "Passenger throughput index": "مؤشر تدفق الركاب",
  "Check-in": "تسجيل السفر",
  "Queue pressure by terminal": "ضغط الطوابير حسب المبنى",
  "Stacked bar": "شريط مكدس",
  "Stacked bars show both total queue pressure and which process contributes most.": "الأشرطة المكدسة توضح إجمالي الضغط وأي مرحلة تسبب الجزء الأكبر منه.",
  "Decision recommendations": "توصيات القرار",
  "Rebalance security staff": "إعادة توزيع موظفي الأمن",
  "-4 min expected wait": "تقليل متوقع 4 دقائق",
  "Fast-track F11 passengers": "تسريع ركاب F11",
  "Protects departure time": "يحمي موعد المغادرة",
  "Confirm SU-GBP parts": "تأكيد قطع SU-GBP",
  "Reduces tomorrow risk": "يقلل مخاطر الغد",
  Ops: "تشغيل",
  Gates: "بوابات",
  Maintenance: "صيانة",
  "Controls to prevent issue build-up": "ضوابط منع تراكم المشكلات",
  "Accumulation risk": "خطر التراكم",
  "3 findings open longer than 24h": "3 ملاحظات مفتوحة لأكثر من 24 ساعة",
  Medium: "متوسط",
  "Action owner": "مالك الإجراء",
  "Every safety item has an owner and due time": "كل بند سلامة له مالك وموعد إنجاز",
  Assigned: "محدد",
  "Auto-escalation": "تصعيد تلقائي",
  "Escalates if action has not started": "يصعد إذا لم يبدأ الإجراء",
  "Safety alert age": "عمر تنبيهات السلامة",
  Sample: "عينة",
  "1 overdue": "1 متأخر",
  "Aging buckets show whether issues are accumulating before they become critical.": "تصنيف العمر يوضح هل تتراكم المشكلات قبل أن تصبح حرجة.",
  New: "جديد",
  Overdue: "متأخر",
  "Safety checks": "فحوص السلامة",
  "Fire suppression - T1/T2/T3": "إطفاء الحريق - T1/T2/T3",
  "Inspected 2h ago": "تم الفحص قبل ساعتين",
  Operational: "تشغيلي",
  "Runway water response": "استجابة مياه المدرج",
  "Last drill 6 days ago": "آخر تدريب قبل 6 أيام",
  Standby: "استعداد",
  "ATC backup comms": "اتصالات احتياطية للمراقبة",
  "Heartbeat OK": "الإشارة سليمة",
  "Apron worker PPE compliance": "التزام معدات حماية العاملين بالساحة",
  "12 audits today": "12 تدقيقا اليوم",
  "98% compliant": "التزام 98%",
  "Security checkpoint scanners": "ماسحات نقاط التفتيش",
  "Tech dispatched": "تم إرسال فني",
  "1 offline (T2-B)": "1 متوقف (T2-B)",
  "Recent aircraft maintenance": "صيانة الطائرات الأخيرة",
  "Viewing sample": "عينة للعرض",
  "A/C": "طائرة",
  Task: "المهمة",
  Date: "التاريخ",
  Dur: "المدة",
  "A-check completed": "اكتمال فحص A",
  "Engine #2 borescope": "فحص منظار للمحرك 2",
  "Hydraulic line repair": "إصلاح خط هيدروليك",
  "Tire and brake change": "تغيير إطار وفرامل",
  "Cabin pressurisation test": "اختبار ضغط المقصورة",
  Released: "مصرح",
  "Awaiting parts": "بانتظار قطع",
  "Aircraft requiring attention": "طائرات تتطلب متابعة",
  "30-day risk score": "درجة مخاطر 30 يوما",
  Registration: "التسجيل",
  Type: "النوع",
  Events: "الأحداث",
  "Top issue": "أبرز مشكلة",
  Risk: "الخطر",
  "Close": "إغلاق",
};

function useLocale() {
  const language = useContext(LocaleContext);
  const tr = (value: string) => (language === "ar" ? arText[value] ?? value : value);
  return { language, tr };
}

const copy = {
  en: {
    airport: "Cairo International Airport",
    brand: "CAI Command Hub",
    manager: "Manager view",
    heroTitle: "Operations and safety overview",
    heroBody: "A focused management surface for live flow, flight movement, safety checks and maintenance attention.",
    digital: "Digital Twin",
    operations: "Operations",
    safety: "Safety",
    resources: "Resources and audit notes",
    footer: "Cairo International Airport - Operated by Cairo Airport Company - IATA: CAI - ICAO: HECA",
    contrast: "Toggle high contrast",
    language: "Switch language",
  },
  ar: {
    airport: "مطار القاهرة الدولي",
    brand: "مركز قيادة مطار القاهرة",
    manager: "عرض المدير",
    heroTitle: "نظرة تشغيلية وسلامة مركزة",
    heroBody: "سطح إداري لمتابعة تدفق الركاب، حركة الرحلات، فحوص السلامة، وأولويات الصيانة.",
    digital: "التوأم الرقمي",
    operations: "التشغيل",
    safety: "السلامة",
    resources: "المصادر وملاحظات التدقيق",
    footer: "مطار القاهرة الدولي - تديره شركة ميناء القاهرة الجوي - IATA: CAI - ICAO: HECA",
    contrast: "تبديل التباين العالي",
    language: "تبديل اللغة",
  },
} as const;

const scenes: AirportScene[] = [
  {
    id: "overview",
    label: "Airport overview",
    title: "Airport overview",
    summary: "High-level airport map showing terminals, roads, parking, airside zones, runways, and transfer connections.",
    objectPosition: "top center",
  },
  {
    id: "t1",
    label: "Terminal 1",
    title: "Terminal 1",
    summary: "Separate terminal area serving selected domestic, regional and international operations.",
    objectPosition: "center 29%",
  },
  {
    id: "t2",
    label: "Terminal 2",
    title: "Terminal 2",
    summary: "International terminal connected operationally with the Terminal 3 side of the airport.",
    objectPosition: "center 58%",
  },
  {
    id: "t3",
    label: "Terminal 3",
    title: "Terminal 3",
    summary: "Major passenger terminal and hub-style area with large concourse and gate capacity.",
    objectPosition: "center 88%",
  },
];

const terminalFacts = [
  {
    code: "T1",
    title: "Terminal 1",
    body: "Domestic, regional and selected international operations",
    detail: "Hall 1 - Hall 2 - Hall 3",
    airlines: ["Air Arabia Egypt", "Nile Air", "Flynas", "Domestic carriers"],
    tone: "ok" as Tone,
  },
  {
    code: "T2",
    title: "Terminal 2",
    body: "Renovated international terminal connected to Terminal 3",
    detail: "International concourse",
    airlines: ["Emirates", "British Airways", "Air France", "Qatar Airways"],
    tone: "info" as Tone,
  },
  {
    code: "T3",
    title: "Terminal 3",
    body: "EgyptAir hub and largest passenger terminal",
    detail: "Main concourse and pier",
    airlines: ["EgyptAir", "Star Alliance partners", "Turkish Airlines"],
    tone: "high" as Tone,
  },
];

const waitTimes = [
  { label: "T3 check-in", value: 8, tone: "ok" as Tone },
  { label: "Passport", value: 11, tone: "info" as Tone },
  { label: "Security", value: 17, tone: "warn" as Tone },
  { label: "Baggage", value: 14, tone: "info" as Tone },
];

const decisions = [
  { title: "T2 security queue", detail: "Open one more lane", badge: "17m", tone: "warn" as Tone },
  { title: "Gate F11 boarding", detail: "Send floor agent", badge: "72%", tone: "info" as Tone },
  { title: "T2-B scanner", detail: "Escalate maintenance", badge: "Offline", tone: "crit" as Tone },
];

const departures: FlightRow[] = [
  { flight: "MS777", city: "London (LHR)", time: "14:45", gate: "D3", status: "Sample only", tone: "neutral" },
  { flight: "SV302", city: "Riyadh (RUH)", time: "15:30", gate: "A15", status: "Sample only", tone: "neutral" },
  { flight: "AF551", city: "Paris (CDG)", time: "15:55", gate: "S1", status: "Sample only", tone: "neutral" },
  { flight: "MS717", city: "Luxor (LXR)", time: "16:20", gate: "F9", status: "Sample only", tone: "neutral" },
];

const arrivals: FlightRow[] = [
  { flight: "MS738", city: "Frankfurt (FRA)", time: "15:00", gate: "C3", status: "Sample only", tone: "neutral" },
  { flight: "TK694", city: "Istanbul (IST)", time: "16:15", gate: "A2", status: "Sample only", tone: "neutral" },
  { flight: "EK927", city: "Dubai (DXB)", time: "13:45", gate: "B12", status: "Sample only", tone: "neutral" },
  { flight: "MS841", city: "Jeddah (JED)", time: "12:30", gate: "D9", status: "Sample only", tone: "neutral" },
];

const queueRows = [
  { terminal: "T1", checkIn: 30, passport: 25, security: 25, total: 68 },
  { terminal: "T2", checkIn: 34, passport: 30, security: 31, total: 89 },
  { terminal: "T3", checkIn: 38, passport: 25, security: 27, total: 84 },
];

const safetyChecks = [
  { icon: Flame, title: "Fire suppression - T1/T2/T3", detail: "Inspected 2h ago", badge: "Operational", tone: "ok" as Tone },
  { icon: Wrench, title: "Runway water response", detail: "Last drill 6 days ago", badge: "Standby", tone: "info" as Tone },
  { icon: Activity, title: "ATC backup comms", detail: "Heartbeat OK", badge: "Operational", tone: "ok" as Tone },
  { icon: ShieldCheck, title: "Apron worker PPE compliance", detail: "12 audits today", badge: "98% compliant", tone: "ok" as Tone },
  { icon: ShieldCheck, title: "Security checkpoint scanners", detail: "Tech dispatched", badge: "1 offline (T2-B)", tone: "warn" as Tone },
];

const maintenanceRows = [
  { reg: "SU-GDR", type: "B777-300ER", task: "A-check completed", date: "12 May 2026", duration: "32h", status: "Released", tone: "ok" as Tone },
  { reg: "SU-GEU", type: "B787-9", task: "Engine #2 borescope", date: "11 May 2026", duration: "8h", status: "Released", tone: "ok" as Tone },
  { reg: "SU-GCS", type: "A330-300", task: "Hydraulic line repair", date: "11 May 2026", duration: "14h", status: "Released", tone: "ok" as Tone },
  { reg: "SU-GDM", type: "B737-800", task: "Tire and brake change", date: "10 May 2026", duration: "4h", status: "Released", tone: "ok" as Tone },
  { reg: "SU-GBP", type: "A320", task: "Cabin pressurisation test", date: "10 May 2026", duration: "6h", status: "Awaiting parts", tone: "warn" as Tone },
];

const aircraftRiskRows = [
  { reg: "SU-GBP", type: "A320", events: 7, mtbf: "142h", issue: "Pressurisation, APU starts", risk: 78 },
  { reg: "SU-GDC", type: "B737-800", events: 6, mtbf: "168h", issue: "Brake wear, nose gear", risk: 65 },
  { reg: "SU-GCH", type: "A330-200", events: 5, mtbf: "210h", issue: "Galley power, IFE", risk: 54 },
  { reg: "SU-GEK", type: "B787-9", events: 3, mtbf: "320h", issue: "Cabin sensors", risk: 38 },
];

export function App() {
  const [activeTab, setActiveTab] = useState<ManagerTab>("digital");
  const [language, setLanguage] = useState<Language>("en");
  const [highContrast, setHighContrast] = useState(false);
  const times = useHeaderClock();
  const c = copy[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.classList.toggle("hc", highContrast);
  }, [highContrast, language]);

  return (
    <LocaleContext.Provider value={language}>
    <div className="min-h-screen">
      <Header language={language} setLanguage={setLanguage} highContrast={highContrast} setHighContrast={setHighContrast} times={times} />
      <main id="main" className="mx-auto grid w-full max-w-[1480px] gap-4 px-3 py-4 sm:gap-5 sm:px-5 lg:gap-6 lg:px-6">
        <Hero activeTab={activeTab} setActiveTab={setActiveTab} language={language} />
        {activeTab === "digital" && <DigitalTwinView />}
        {activeTab === "operations" && <OperationsView />}
        {activeTab === "safety" && <SafetyView />}
      </main>
      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        {c.footer}
        <span className="mx-3 text-muted-foreground/60" aria-hidden="true">|</span>
        <a className="font-medium text-primary hover:underline" href="https://www.cairo-airport.com/en-us/Airport/Airport-Information" target="_blank" rel="noreferrer">
          {c.resources}
        </a>
      </footer>
    </div>
    </LocaleContext.Provider>
  );
}

function Header({
  language,
  setLanguage,
  highContrast,
  setHighContrast,
  times,
}: {
  language: Language;
  setLanguage: (language: Language) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  times: { cairo: string; utc: string };
}) {
  const c = copy[language];
  const { tr } = useLocale();
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/82 backdrop-blur-xl">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
        {tr("Skip to content")}
      </a>
      <div className="mx-auto flex min-h-16 max-w-[1480px] items-center justify-between gap-3 px-3 py-2 sm:px-5 lg:px-6">
        <a href="#main" className="flex min-w-0 items-center gap-3 rounded-md" aria-label={tr("Go to dashboard")}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/50 bg-primary/15 glow-cyan">
            <Plane aria-hidden="true" className="h-5 w-5 text-primary" />
          </span>
          <span className="min-w-0 max-w-[46vw] sm:max-w-none">
            <span className="block truncate font-mono text-[10px] uppercase tracking-[0.18em] text-primary sm:text-[11px] sm:tracking-[0.28em]">{c.airport}</span>
            <span className="block truncate text-sm font-semibold">{c.brand}</span>
          </span>
        </a>
        <div className="flex items-center gap-2">
          <div className="hidden h-10 items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 md:flex">
            <Clock3 aria-hidden="true" className="h-4 w-4 text-primary" />
            <TimeChip label={tr("Cairo")} value={times.cairo} />
            <span className="h-5 w-px bg-border" />
            <TimeChip label="UTC" value={times.utc} />
          </div>
          <button type="button" onClick={() => setHighContrast(!highContrast)} className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-secondary/40 hover:bg-secondary" aria-label={c.contrast}>
            <Contrast aria-hidden="true" className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setLanguage(language === "en" ? "ar" : "en")} className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 text-sm hover:bg-secondary" aria-label={c.language}>
            <Languages aria-hidden="true" className="h-4 w-4 text-primary" />
            {language === "en" ? "AR" : "EN"}
          </button>
        </div>
      </div>
    </header>
  );
}

function TimeChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="font-mono text-xs font-semibold">{value}</span>
    </span>
  );
}

function Hero({ activeTab, setActiveTab, language }: { activeTab: ManagerTab; setActiveTab: (tab: ManagerTab) => void; language: Language }) {
  const c = copy[language];
  const { tr } = useLocale();
  const tabs: { id: ManagerTab; label: string; icon: LucideIcon }[] = [
    { id: "digital", label: c.digital, icon: Radar },
    { id: "operations", label: c.operations, icon: Activity },
    { id: "safety", label: c.safety, icon: ShieldCheck },
  ];

  return (
    <section className="manager-hero panel overflow-hidden p-4 sm:p-6">
      <div className="relative z-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">{c.manager}</p>
        <h1 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight sm:text-4xl">{c.heroTitle}</h1>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground sm:text-base">{c.heroBody}</p>
        <div className="mt-5 grid w-full grid-cols-1 gap-2 rounded-xl border border-border bg-background/45 p-2 backdrop-blur-md sm:inline-flex sm:w-auto sm:flex-wrap" role="tablist" aria-label={tr("Manager dashboard sections")}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition sm:justify-start ${activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DigitalTwinView() {
  const { tr } = useLocale();
  const [activeSceneId, setActiveSceneId] = useState<AirportScene["id"]>("overview");
  const [imageOpen, setImageOpen] = useState(false);
  const activeScene = scenes.find((scene) => scene.id === activeSceneId) ?? scenes[0];

  return (
    <div className="grid min-w-0 gap-4 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,360px)]">
      <SectionPanel className="overflow-hidden p-0" title="">
        <div className="border-b border-border p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">{tr("Interactive airport image map")}</p>
          <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold sm:text-2xl">{tr("Cairo Airport visual command map")}</h2>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                {tr("Use the airport image as the main interactive canvas. Click the hotspots to inspect details and shift into terminal views.")}
              </p>
            </div>
            <button type="button" onClick={() => setImageOpen(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-3 text-xs hover:bg-secondary">
              <Eye aria-hidden="true" className="h-4 w-4 text-primary" />
              {tr("View real image")}
            </button>
          </div>
        </div>

        <div className="relative min-h-[320px] overflow-hidden bg-black sm:min-h-[420px] lg:min-h-[520px]">
          <img src={ASSET} alt={tr("Cairo Airport digital twin reference")} className="h-[320px] w-full object-cover opacity-90 transition-[object-position] duration-500 sm:h-[420px] lg:h-[520px]" style={{ objectPosition: activeScene.objectPosition }} />
          <div className="absolute inset-0 bg-gradient-to-t from-background/65 via-transparent to-transparent" />
          <Hotspot left="50%" top="26%" label="T3" active={activeSceneId === "t3"} onClick={() => setActiveSceneId("t3")} />
          <Hotspot left="31%" top="44%" label="T1" active={activeSceneId === "t1"} onClick={() => setActiveSceneId("t1")} />
          <Hotspot left="65%" top="38%" label="T2" active={activeSceneId === "t2"} onClick={() => setActiveSceneId("t2")} />
          <Hotspot left="50%" top="62%" label="Overview" active={activeSceneId === "overview"} onClick={() => setActiveSceneId("overview")} />
        </div>

        <div className="grid gap-4 border-t border-border p-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">{tr("Selected area")}</p>
            <h3 className="mt-2 text-lg font-semibold">{tr(activeScene.title)}</h3>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">{tr(activeScene.summary)}</p>
          </div>
          <div className="flex flex-wrap items-start gap-2">
            <button type="button" onClick={() => setImageOpen(true)} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium hover:bg-secondary sm:flex-none">
              <Eye aria-hidden="true" className="h-4 w-4 text-primary" />
              {tr("View real image")}
            </button>
            <button type="button" onClick={() => setActiveSceneId(activeScene.id === "overview" ? "t3" : "overview")} className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 sm:flex-none">
              {activeScene.id === "overview" ? tr("Open detailed view") : tr("Back to overview")}
            </button>
          </div>
        </div>
      </SectionPanel>

      <aside className="grid content-start gap-6">
        <TerminalQuickFacts />
        <WaitTimes />
      </aside>

      {imageOpen && (
        <Modal title={activeScene.title} onClose={() => setImageOpen(false)}>
          <img src={ASSET} alt={tr(activeScene.title)} className="max-h-[72vh] w-full rounded-lg object-cover" style={{ objectPosition: activeScene.objectPosition }} />
          <p className="mt-3 text-sm text-muted-foreground">{tr(activeScene.summary)}</p>
        </Modal>
      )}
    </div>
  );
}

function Hotspot({ left, top, label, active, onClick }: { left: string; top: string; label: string; active: boolean; onClick: () => void }) {
  const { tr } = useLocale();
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 p-2 shadow-[0_0_28px_var(--cyan)] transition hover:scale-110 ${active ? "border-white bg-primary text-primary-foreground" : "border-primary bg-primary/45 text-white"}`}
      style={{ left, top }}
      aria-label={`${tr("Open detailed view")}: ${tr(label)}`}
    >
      <span className="block h-4 w-4 rounded-full bg-current" />
      <span className="sr-only">{label}</span>
    </button>
  );
}

function TerminalQuickFacts() {
  const { tr } = useLocale();
  return (
    <SectionPanel title={tr("Terminal quick facts")}>
      <div className="space-y-3">
        {terminalFacts.map((terminal) => (
          <article key={terminal.code} className="panel-inner p-4">
            <div className="flex gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-primary/40 bg-primary/10 font-mono font-semibold text-primary">{terminal.code}</span>
              <div className="min-w-0">
                <h3 className="font-semibold">{tr(terminal.title)}</h3>
                <p className="mt-1 text-sm leading-snug text-muted-foreground">{tr(terminal.body)}</p>
                <p className="mt-2 font-mono text-[11px] text-muted-foreground">{tr(terminal.detail)}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {terminal.airlines.map((airline) => (
                    <span key={airline} className="rounded border border-border px-2 py-1 font-mono text-[10px]">
                      {tr(airline)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </SectionPanel>
  );
}

function WaitTimes() {
  const { tr } = useLocale();
  return (
    <SectionPanel title={tr("Wait times")}>
      <div className="space-y-4">
        {waitTimes.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>{tr(item.label)}</span>
              <StatusPill tone={item.tone}>{item.value}m</StatusPill>
            </div>
            <ProgressBar value={item.value} max={25} color={item.tone === "warn" ? "var(--status-warn)" : "var(--cyan)"} />
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}

function OperationsView() {
  const { tr } = useLocale();
  return (
    <div className="grid gap-6">
      <SectionPanel title={tr("Needs a decision now")} action={<StatusPill tone="warn">{tr("3 items")}</StatusPill>}>
        <div className="grid gap-3 md:grid-cols-3">
          {decisions.map((decision) => (
            <article key={decision.title} className="panel-inner p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{tr(decision.title)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{tr(decision.detail)}</p>
                </div>
                <StatusPill tone={decision.tone}>{tr(decision.badge)}</StatusPill>
              </div>
            </article>
          ))}
        </div>
      </SectionPanel>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Operations key metrics">
        <MetricCard label={tr("Passengers today")} value="58,420" hint={tr("Daily benchmark 85k")} delta={tr("+4.1% vs yesterday")} icon={Users} accent="cyan" />
        <MetricCard label={tr("Aircraft movements")} value="412" unit="/ 540" hint={tr("390 average")} delta={tr("On schedule")} icon={Activity} accent="cyan" />
        <MetricCard label={tr("Avg taxi-out")} value="14" unit="min" hint={tr("CAI operations sample")} delta="-2 min" deltaTone="warn" icon={Clock3} accent="warn" />
        <MetricCard label={tr("Active alerts")} value="3" hint={tr("2 medium, 1 high")} delta={tr("Needs review")} deltaTone="warn" icon={AlertTriangle} accent="warn" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="grid gap-6">
          <FlightBoard title={tr("Departures")} direction="to" rows={departures} />
          <FlightBoard title={tr("Arrivals")} direction="from" rows={arrivals} />
        </div>
        <div className="grid content-start gap-6">
          <PassengerFlowChart />
          <QueuePressureChart />
        </div>
      </div>
    </div>
  );
}

function FlightBoard({ title, direction, rows }: { title: string; direction: "to" | "from"; rows: FlightRow[] }) {
  const { tr } = useLocale();
  return (
    <SectionPanel title={title} action={<div className="flex flex-wrap gap-2"><StatusPill tone="info">{tr("Next 60 min")}</StatusPill><StatusPill tone="neutral">{tr("Sample data")}</StatusPill></div>}>
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[580px] text-sm">
          <thead className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-1 py-2 text-start">{tr("Flight")}</th>
              <th className="px-1 py-2 text-start">{direction === "to" ? tr("To") : tr("From")}</th>
              <th className="px-1 py-2 text-start">{tr("Time")}</th>
              <th className="px-1 py-2 text-start">{tr("Gate")}</th>
              <th className="px-1 py-2 text-start">{tr("Status")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.flight} className="border-t border-border/60">
                <td className="px-1 py-3 font-mono font-semibold">{row.flight}</td>
                <td className="px-1 py-3">{row.city}</td>
                <td className="px-1 py-3 font-mono">{row.time}</td>
                <td className="px-1 py-3 font-mono text-muted-foreground">{row.gate}</td>
                <td className="px-1 py-3"><StatusPill tone={row.tone}>{tr(row.status)}</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionPanel>
  );
}

function PassengerFlowChart() {
  const { tr } = useLocale();
  return (
    <SectionPanel title={tr("Passenger flow")} action={<StatusPill tone="neutral">{tr("Modelled")}</StatusPill>}>
      <h3 className="text-base font-semibold">{tr("Passenger flow rises into the midday wave")}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{tr("Line chart is used because managers need the trend over time, not a terminal-by-terminal comparison.")}</p>
      <div className="mt-4">
        <Sparkline data={[28, 34, 42, 48, 58, 51, 61, 70, 66, 72, 69, 76]} height={122} />
        <div className="mt-1 flex justify-between font-mono text-[11px] text-muted-foreground">
          <span>06:00</span>
          <span>{tr("Passenger throughput index")}</span>
          <span>17:00</span>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <FlowZone label={tr("Check-in")} percent={62} tone="ok" />
        <FlowZone label={tr("Security")} percent={84} tone="warn" />
        <FlowZone label={tr("Passport")} percent={71} tone="ok" />
      </div>
    </SectionPanel>
  );
}

function FlowZone({ label, percent, tone }: { label: string; percent: number; tone: "ok" | "warn" }) {
  return (
    <article className="panel-inner p-3 text-center">
      <p className="font-mono text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{percent}%</p>
      <ProgressBar value={percent} color={tone === "warn" ? "var(--status-warn)" : "var(--status-ok)"} className="mt-3" />
    </article>
  );
}

function QueuePressureChart() {
  const { tr } = useLocale();
  return (
    <SectionPanel title={tr("Queue pressure by terminal")} action={<StatusPill tone="info">{tr("Stacked bar")}</StatusPill>}>
      <p className="mb-4 text-sm text-muted-foreground">{tr("Stacked bars show both total queue pressure and which process contributes most.")}</p>
      <div className="space-y-4">
        {queueRows.map((row) => (
          <div key={row.terminal} className="grid grid-cols-[42px_minmax(0,1fr)_42px] items-center gap-3">
            <span className="font-mono font-semibold">{row.terminal}</span>
            <div className="flex h-4 overflow-hidden rounded-full bg-secondary" aria-label={`${row.terminal} total pressure ${row.total}%`}>
              <span className="bg-cyan" style={{ width: `${row.checkIn}%` }} />
              <span className="bg-cyan/70" style={{ width: `${row.passport}%` }} />
              <span className="bg-cyan/40" style={{ width: `${row.security}%` }} />
            </div>
            <span className="font-mono text-sm text-muted-foreground">{row.total}%</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <Legend color="bg-cyan" label={tr("Check-in")} />
        <Legend color="bg-cyan/70" label={tr("Passport")} />
        <Legend color="bg-cyan/40" label={tr("Security")} />
      </div>
    </SectionPanel>
  );
}

function SafetyView() {
  return (
    <div className="grid gap-4 lg:gap-6 xl:grid-cols-2 xl:items-start">
      <div className="grid min-w-0 content-start gap-4 lg:gap-6">
        <DecisionRecommendations />
        <SafetyAlertAge />
        <MaintenanceTable />
      </div>
      <div className="grid min-w-0 content-start gap-4 lg:gap-6">
        <SafetyControls />
        <SafetyChecks />
        <AircraftRiskTable />
      </div>
    </div>
  );
}

function DecisionRecommendations() {
  const { tr } = useLocale();
  const rows = [
    { title: "Rebalance security staff", detail: "-4 min expected wait", badge: "Ops" },
    { title: "Fast-track F11 passengers", detail: "Protects departure time", badge: "Gates" },
    { title: "Confirm SU-GBP parts", detail: "Reduces tomorrow risk", badge: "Maintenance" },
  ];
  return (
    <SectionPanel title={tr("Decision recommendations")}>
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.title} className="panel-inner grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <h3 className="font-semibold">{tr(row.title)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tr(row.detail)}</p>
            </div>
            <StatusPill tone="neutral">{tr(row.badge)}</StatusPill>
          </article>
        ))}
      </div>
    </SectionPanel>
  );
}

function SafetyControls() {
  const { tr } = useLocale();
  const rows = [
    { title: "Accumulation risk", detail: "3 findings open longer than 24h", badge: "Medium", tone: "warn" as Tone },
    { title: "Action owner", detail: "Every safety item has an owner and due time", badge: "Assigned", tone: "ok" as Tone },
    { title: "Auto-escalation", detail: "Escalates if action has not started", badge: "90 min", tone: "info" as Tone },
  ];
  return (
    <SectionPanel title={tr("Controls to prevent issue build-up")}>
      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.title} className="panel-inner grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <h3 className="font-semibold">{tr(row.title)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{tr(row.detail)}</p>
            </div>
            <StatusPill tone={row.tone}>{tr(row.badge)}</StatusPill>
          </article>
        ))}
      </div>
    </SectionPanel>
  );
}

function SafetyAlertAge() {
  const { tr } = useLocale();
  const buckets = [
    { label: "New", value: 5, tone: "info" as Tone },
    { label: "30-90m", value: 4, tone: "ok" as Tone },
    { label: "2-4h", value: 2, tone: "warn" as Tone },
    { label: "Overdue", value: 1, tone: "crit" as Tone },
  ];
  const max = Math.max(...buckets.map((item) => item.value));
  return (
    <SectionPanel title={tr("Safety alert age")} action={<div className="flex shrink-0 flex-wrap justify-end gap-2"><StatusPill tone="neutral">{tr("Sample")}</StatusPill><StatusPill tone="warn">{tr("1 overdue")}</StatusPill></div>} className="h-fit self-start">
      <p className="mb-5 text-sm text-muted-foreground">{tr("Aging buckets show whether issues are accumulating before they become critical.")}</p>
      <div className="grid grid-cols-2 items-end gap-4 sm:grid-cols-4">
        {buckets.map((bucket) => {
          const height = 40 + (bucket.value / max) * 58;
          const color = bucket.tone === "crit" ? "bg-status-crit" : bucket.tone === "warn" ? "bg-status-warn" : bucket.tone === "ok" ? "bg-status-ok" : "bg-cyan";
          return (
            <div key={bucket.label} className="text-center">
              <div className="mx-auto flex h-28 w-full max-w-18 items-end rounded-lg bg-secondary/70 p-2">
                <div className={`w-full rounded-md ${color}`} style={{ height }} aria-label={`${bucket.value} ${tr(bucket.label)}`} />
              </div>
              <p className="mt-2 text-lg font-semibold">{bucket.value}</p>
              <p className="text-sm text-muted-foreground">{tr(bucket.label)}</p>
            </div>
          );
        })}
      </div>
    </SectionPanel>
  );
}

function SafetyChecks() {
  const { tr } = useLocale();
  return (
    <SectionPanel title={tr("Safety checks")} className="h-fit self-start">
      <div className="grid gap-3">
        {safetyChecks.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="panel-inner grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div className="flex min-w-0 items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-primary/40 bg-primary/10">
                  <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold">{tr(item.title)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{tr(item.detail)}</p>
                </div>
              </div>
              <div className="sm:justify-self-end">
                <StatusPill tone={item.tone}>{tr(item.badge)}</StatusPill>
              </div>
            </article>
          );
        })}
      </div>
    </SectionPanel>
  );
}

function MaintenanceTable() {
  const { tr } = useLocale();
  return (
    <SectionPanel title={tr("Recent aircraft maintenance")} action={<StatusPill tone="neutral">{tr("Viewing sample")}</StatusPill>}>
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-1 py-2 text-start">{tr("A/C")}</th>
              <th className="px-1 py-2 text-start">{tr("Task")}</th>
              <th className="px-1 py-2 text-start">{tr("Date")}</th>
              <th className="px-1 py-2 text-start">{tr("Dur")}</th>
              <th className="px-1 py-2 text-start">{tr("Status")}</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceRows.map((item) => (
              <tr key={item.reg} className="border-t border-border/60">
                <td className="px-1 py-3 font-mono"><strong>{item.reg}</strong><div className="text-xs text-muted-foreground">{item.type}</div></td>
                <td className="px-1 py-3">{tr(item.task)}<div className="text-xs text-muted-foreground">EgyptAir</div></td>
                <td className="px-1 py-3 font-mono text-muted-foreground">{item.date}</td>
                <td className="px-1 py-3 font-mono">{item.duration}</td>
                <td className="px-1 py-3"><StatusPill tone={item.tone}>{tr(item.status)}</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionPanel>
  );
}

function AircraftRiskTable() {
  const { tr } = useLocale();
  return (
    <SectionPanel title={tr("Aircraft requiring attention")} action={<div className="flex flex-wrap gap-2"><StatusPill tone="neutral">{tr("Modelled")}</StatusPill><span className="text-xs text-muted-foreground">{tr("30-day risk score")}</span></div>}>
      <div className="-mx-1 overflow-x-auto">
        <table className="w-full min-w-[780px] text-sm">
          <thead className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-1 py-2 text-start">{tr("Registration")}</th>
              <th className="px-1 py-2 text-start">{tr("Type")}</th>
              <th className="px-1 py-2 text-start">{tr("Events")}</th>
              <th className="px-1 py-2 text-start">MTBF</th>
              <th className="px-1 py-2 text-start">{tr("Top issue")}</th>
              <th className="px-1 py-2 text-start">{tr("Risk")}</th>
            </tr>
          </thead>
          <tbody>
            {aircraftRiskRows.map((aircraft) => {
              const color = aircraft.risk >= 70 ? "var(--status-crit)" : aircraft.risk >= 50 ? "var(--status-warn)" : "var(--status-ok)";
              return (
                <tr key={aircraft.reg} className="border-t border-border/60">
                  <td className="px-1 py-3 font-mono font-semibold">{aircraft.reg}</td>
                  <td className="px-1 py-3">{aircraft.type}</td>
                  <td className="px-1 py-3 font-mono">{aircraft.events}</td>
                  <td className="px-1 py-3 font-mono">{aircraft.mtbf}</td>
                  <td className="px-1 py-3 text-muted-foreground">{aircraft.issue}</td>
                  <td className="px-1 py-3">
                    <div className="flex items-center gap-3">
                      <ProgressBar value={aircraft.risk} color={color} className="min-w-36" />
                      <span className="font-mono text-xs" style={{ color }}>{aircraft.risk}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionPanel>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const { tr } = useLocale();
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/75 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="panel max-h-[92vh] w-full max-w-5xl overflow-hidden p-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="modal-title" className="text-lg font-semibold">{tr(title)}</h2>
          <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-lg border border-border hover:bg-secondary" aria-label={tr("Close")}>
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function useHeaderClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return useMemo(
    () => ({
      cairo: new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Africa/Cairo",
        timeZoneName: "short",
      }).format(now),
      utc: new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short",
      }).format(now),
    }),
    [now],
  );
}
