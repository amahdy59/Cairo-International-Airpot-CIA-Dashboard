import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Camera,
  Clock3,
  Contrast,
  DoorOpen,
  Flame,
  Gauge,
  Languages,
  Moon,
  Plane,
  Radar,
  RadioTower,
  ShieldCheck,
  Sun,
  UserCheck,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { MetricCard, ProgressBar, SectionPanel, Sparkline, StatusPill } from "@/components/command-center/MetricWidgets";

type ManagerTab = "digital" | "operations" | "safety";
type Tone = "ok" | "info" | "warn" | "high" | "crit" | "neutral";
type Language = "en" | "ar";
type ThemeMode = "dark" | "light";
type LocalizedText = { en: string; ar: string };

type FlightRow = {
  flight: string;
  city: string;
  time: string;
  gate: string;
  status: string;
  tone: Tone;
};

type IncomingFlight = {
  airline: string;
  flight: string;
  eta: string;
  gate: string;
  status: string;
  tone: Tone;
  origin: string;
};

type AviationStackFlight = {
  airline?: { name?: string };
  flight?: { iata?: string; number?: string };
  departure?: { airport?: string; iata?: string };
  arrival?: { estimated?: string; scheduled?: string; terminal?: string; gate?: string };
  flight_status?: string;
};

type AviationStackResponse = {
  data?: AviationStackFlight[];
};

export type HotspotStatus = 'critical' | 'warning' | 'good' | 'info' | 'offline';

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
  id: 'terminal-1' | 'terminal-2' | 'terminal-3' | 'landside' | 'services';
  label: string;
  title: string;
  summary: string;
  image: string;
  darkImage: string;
  objectPosition?: string;
  hotspots: MapHotspot[];
};

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
  "Show Dark Mode": "عرض الوضع الداكن",
  "Show Light Mode": "عرض الوضع الفاتح",
  "Dark view": "عرض داكن",
  "Light view": "عرض فاتح",
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
  "CIA operations sample": "عينة تشغيلية للمطار",
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

function localize(value: LocalizedText, language: Language) {
  return value[language];
}

function formatCairoTime(value?: string) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Cairo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function localizedFlightStatus(status: string, language: Language) {
  const normalized = status.toLowerCase();
  const labels: Record<string, LocalizedText> = {
    scheduled: { en: "Scheduled", ar: "مجدولة" },
    active: { en: "Active", ar: "نشطة" },
    landed: { en: "Landed", ar: "هبطت" },
    cancelled: { en: "Cancelled", ar: "ملغاة" },
    incident: { en: "Incident", ar: "حادث" },
    diverted: { en: "Diverted", ar: "محولة" },
    "on time": { en: "On time", ar: "في الموعد" },
    landing: { en: "Landing", ar: "تهبط" },
    "delayed +18m": { en: "Delayed +18m", ar: "متأخرة 18د" },
  };
  return localize(labels[normalized] ?? { en: status, ar: status }, language);
}

const copy = {
  en: {
    airport: "Cairo International Airport",
    brand: "CIA Command Hub",
    manager: "Manager view",
    heroTitle: "Operations and safety overview",
    heroBody: "A focused management surface for live flow, flight movement, safety checks and maintenance attention.",
    digital: "Digital Twin",
    operations: "Operations",
    safety: "Safety",
    resources: "Resources and audit notes",
    footer: "Cairo International Airport - Operated by Cairo Airport Company - IATA: CIA - ICAO: HECA",
    contrast: "Toggle high contrast",
    theme: "Switch color theme",
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
    footer: "مطار القاهرة الدولي - تديره شركة ميناء القاهرة الجوي - IATA: CIA - ICAO: HECA",
    contrast: "تبديل التباين العالي",
    theme: "تبديل نمط الألوان",
    language: "تبديل اللغة",
  },
} as const;

const scenes: AirportScene[] = [
  {
    id: "terminal-1",
    label: "Terminal 1",
    title: "Terminal 1 Operations",
    summary: "Separate terminal area serving selected domestic and international operations.",
    image: "/manager-assets/terminal-1.jpg",
    darkImage: "/manager-assets/landside-dark-new.jpg",
    hotspots: [
      { id: "t1-stand-turnaround", cx: 60.0, cy: 35.0, status: "warning", title: "Remote Stand Turnaround Pressure", category: "Airside", impact: "Two narrow-body turns may exceed the planned ground time if fueling and catering overlap.", evidence: "Stand team is 9 minutes behind the service milestone.", action: "Move one ground support unit from the adjacent stand.", source: "Turnaround control", updatedAt: "14:00" }
    ]
  },
  {
    id: "terminal-2",
    label: "Terminal 2",
    title: "Terminal 2 Operations",
    summary: "International terminal connected operationally with Terminal 3.",
    image: "/manager-assets/terminal-2.jpg",
    darkImage: "/manager-assets/terminal-2-dark-new.jpg",
    hotspots: [
      { id: "t2-security", cx: 45.0, cy: 50.0, status: "warning", title: "T2 Security Queue Rising", category: "Terminal", impact: "Departing passengers may reach passport control late during the next arrival/departure overlap.", evidence: "Security wait is 17 minutes and trending up.", action: "Open one extra screening lane for 30 minutes.", source: "Queue sensor", updatedAt: "14:15" }
    ]
  },
  {
    id: "terminal-3",
    label: "Terminal 3",
    title: "Terminal 3 Operations",
    summary: "Main international terminal with gate, flow, and connection monitoring.",
    image: "/manager-assets/terminal-3.jpg",
    darkImage: "/manager-assets/terminal-3-dark-new.jpg",
    hotspots: [
      { id: "t3-flow", cx: 52.3, cy: 37.8, status: "good", title: "Terminal 3 Passenger Flow", category: "Terminal", impact: "Passenger processing is stable across check-in, passport control, and departure gates.", evidence: "Average wait is below 5 minutes.", source: "Queue sensor", updatedAt: "14:04" },
      { id: "gate-b12", cx: 65.0, cy: 45.0, status: "critical", title: "Gate B12 Boarding Risk", category: "Operations", impact: "A late inbound aircraft may compress boarding time and create connection pressure.", evidence: "Inbound aircraft is 18 minutes behind stand target.", action: "Assign a ramp runner and pre-stage boarding staff.", source: "Gate control", updatedAt: "14:10" }
    ]
  },
  {
    id: "landside",
    label: "Landside Access",
    title: "Landside Access",
    summary: "Parking, access roads, curbside flow, and public-side movement.",
    image: "/manager-assets/landside.jpg",
    darkImage: "/manager-assets/terminal-1-dark-new.jpg",
    hotspots: [
      { id: "parking-congestion", cx: 20.5, cy: 62.1, status: "warning", title: "Parking Entry Queue", category: "Landside", impact: "Curbside access may slow for passengers arriving by car or shuttle.", evidence: "Entry queue is above 15 vehicles.", action: "Deploy two traffic wardens at the parking entry split.", source: "Traffic camera", updatedAt: "14:02" }
    ]
  },
  {
    id: "services",
    label: "Support Services",
    title: "Support Services",
    summary: "Maintenance, catering, and airport support facilities.",
    image: "/manager-assets/support-services.jpg",
    darkImage: "/manager-assets/support-services-dark-new.jpg",
    hotspots: [
      { id: "catering-facility", cx: 70.0, cy: 40.0, status: "good", title: "Catering Dispatch Stable", category: "Services", impact: "Catering dispatch is meeting the planned departure wave.", evidence: "All priority flights have catering assigned.", source: "Facilities control", updatedAt: "14:10" }
    ]
  }
];

const sampleIncomingFlights: IncomingFlight[] = [
  { airline: "EgyptAir", flight: "MS786", eta: "13:40", gate: "T3 / F06", status: "On time", tone: "ok", origin: "Frankfurt (FRA)" },
  { airline: "Qatar Airways", flight: "QR1303", eta: "14:05", gate: "T2 / B03", status: "Landing", tone: "info", origin: "Doha (DOH)" },
  { airline: "Emirates", flight: "EK927", eta: "14:25", gate: "T2 / B12", status: "Delayed +18m", tone: "warn", origin: "Dubai (DXB)" },
  { airline: "Saudia", flight: "SV301", eta: "14:55", gate: "T1 / A04", status: "On time", tone: "ok", origin: "Jeddah (JED)" },
];

const zoneStatusRows = [
  { zone: "Terminal 1", status: { en: "Smooth", ar: "سلس" }, detail: { en: "8 min average queue", ar: "متوسط الطابور 8 دقائق" }, tone: "ok" as Tone },
  { zone: "Terminal 2", status: { en: "Moderate", ar: "متوسط" }, detail: { en: "Security pressure building", ar: "ضغط متزايد على الأمن" }, tone: "warn" as Tone },
  { zone: "Terminal 3", status: { en: "Busy", ar: "مزدحم" }, detail: { en: "Passport wave from F gates", ar: "موجة جوازات من بوابات F" }, tone: "high" as Tone },
];

const gateWaitRows = [
  { gate: "F06", wait: 12, tone: "ok" as Tone },
  { gate: "B03", wait: 16, tone: "info" as Tone },
  { gate: "B12", wait: 24, tone: "warn" as Tone },
  { gate: "A04", wait: 9, tone: "ok" as Tone },
  { gate: "F11", wait: 28, tone: "high" as Tone },
];

const influxForecastRows = [
  { time: "Now", current: 960, forecast: 980 },
  { time: "+1h", current: 1200, forecast: 1320 },
  { time: "+2h", current: 1380, forecast: 1540 },
  { time: "+3h", current: 1180, forecast: 1460 },
  { time: "+4h", current: 980, forecast: 1120 },
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
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [highContrast, setHighContrast] = useState(false);
  const times = useHeaderClock();
  const c = copy[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.classList.toggle("hc", highContrast);
  }, [highContrast, language, theme]);

  return (
    <LocaleContext.Provider value={language}>
    <div className="min-h-screen overflow-x-hidden">
      <Header language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} highContrast={highContrast} setHighContrast={setHighContrast} times={times} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main id="main" className="mx-auto grid w-full max-w-[1480px] min-w-0 gap-4 overflow-x-hidden px-2 py-4 sm:gap-4 sm:px-4 lg:gap-5 lg:px-6">
        <div key={activeTab} className="grid min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
          {activeTab === "digital" && <DigitalTwinView />}
          {activeTab === "operations" && <OperationsView />}
          {activeTab === "safety" && <SafetyView />}
        </div>
      </main>
      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        {c.footer}
        <span className="mx-3 text-muted-foreground/60" aria-hidden="true">|</span>
        <a className="font-medium text-primary hover:underline" href="https://www.cairo-airport.com/en-us/Airport/Airport-Information" target="_blank" rel="noreferrer">
          {c.resources}
        </a>
      </footer>
      <BackToTopButton />
    </div>
    </LocaleContext.Provider>
  );
}

function BackToTopButton() {
  const { language } = useLocale();
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-5 end-5 z-50 grid h-12 w-12 place-items-center rounded-full border border-border bg-primary text-primary-foreground shadow-[0_14px_34px_color-mix(in_oklab,var(--primary)_28%,transparent)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_color-mix(in_oklab,var(--primary)_36%,transparent)]"
      aria-label={localize({ en: "Back to top", ar: "العودة إلى الأعلى" }, language)}
    >
      <ArrowUp aria-hidden="true" className="h-5 w-5" />
    </button>
  );
}

function Header({
  language,
  setLanguage,
  theme,
  setTheme,
  highContrast,
  setHighContrast,
  times,
  activeTab,
  setActiveTab,
}: {
  language: Language;
  setLanguage: (language: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  times: { cairo: string; utc: string };
  activeTab: ManagerTab;
  setActiveTab: (tab: ManagerTab) => void;
}) {
  const c = copy[language];
  const { tr } = useLocale();
  const ThemeIcon = theme === "dark" ? Sun : Moon;
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/82 backdrop-blur-xl">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
        {tr("Skip to content")}
      </a>
      <div className="mx-auto flex min-h-16 max-w-[1480px] flex-wrap items-center justify-between gap-3 px-3 py-2 sm:px-5 lg:px-6">
        <a href="#main" className="flex min-w-0 items-center gap-3 rounded-md" aria-label={`${c.airport} ${c.brand}. ${tr("Go to dashboard")}`}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/50 bg-primary/15 glow-cyan">
            <Plane aria-hidden="true" className="h-5 w-5 text-primary" />
          </span>
          <span className="hidden min-w-0 sm:block sm:max-w-none">
            <span className="block truncate font-mono text-[10px] uppercase tracking-[0.18em] text-primary sm:text-[11px] sm:tracking-[0.28em]">{c.airport}</span>
            <span className="block truncate text-sm font-semibold">{c.brand}</span>
          </span>
        </a>

        {/* Navigation Tabs */}
        <nav className="order-3 flex w-full flex-1 justify-center sm:order-none sm:mt-0 sm:w-auto" role="tablist" aria-label={tr("Manager dashboard sections")}>
          <div className="flex min-h-12 w-full items-center justify-center gap-1 rounded-xl border border-border bg-secondary/35 p-1 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--foreground)_8%,transparent)] backdrop-blur-md sm:w-auto">
            {[
              { id: "digital" as ManagerTab, label: c.digital, icon: Radar },
              { id: "operations" as ManagerTab, label: c.operations, icon: Activity },
              { id: "safety" as ManagerTab, label: c.safety, icon: ShieldCheck }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="main-content"
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex min-w-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-300 ease-out focus-visible:z-10 sm:min-w-36 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-[0_10px_28px_color-mix(in_oklab,var(--primary)_28%,transparent)]"
                      : "bg-transparent text-muted-foreground hover:bg-background/50 hover:text-foreground"
                  }`}
                >
                  <Icon aria-hidden="true" className={`h-4 w-4 shrink-0 transition-transform duration-300 ${isActive ? "scale-105" : "group-hover:-translate-y-0.5"}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="flex items-center gap-2 order-2 sm:order-none">
          <div className="hidden h-10 items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 lg:flex">
            <Clock3 aria-hidden="true" className="h-4 w-4 text-primary" />
            <TimeChip label={tr("Cairo")} value={times.cairo} />
            <span className="h-5 w-px bg-border" />
            <TimeChip label="UTC" value={times.utc} />
          </div>
          <button type="button" onClick={() => setHighContrast(!highContrast)} className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-secondary/40 hover:bg-secondary" aria-label={c.contrast}>
            <Contrast aria-hidden="true" className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-secondary/40 hover:bg-secondary" aria-label={`${c.theme}: ${theme === "dark" ? "Light" : "Dark"}`}>
            <ThemeIcon aria-hidden="true" className="h-4 w-4 text-primary" />
          </button>
          <button type="button" onClick={() => setLanguage(language === "en" ? "ar" : "en")} className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 text-sm hover:bg-secondary" aria-label={`${c.language}: ${language === "en" ? "AR" : "EN"}`}>
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
    <span className="inline-flex items-center gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="font-mono text-sm font-semibold leading-none">{value}</span>
    </span>
  );
}



function useIncomingCaiFlights() {
  const [flights, setFlights] = useState<IncomingFlight[]>(sampleIncomingFlights);
  const [source, setSource] = useState<"loading" | "live" | "sample">("loading");
  const [updatedAt, setUpdatedAt] = useState(() => formatCairoTime(new Date().toISOString()));

  useEffect(() => {
    const apiKey = import.meta.env.VITE_AVIATIONSTACK_KEY as string | undefined;
    if (!apiKey || apiKey === "replace_with_your_aviationstack_access_key") {
      setSource("sample");
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      access_key: apiKey,
      arr_iata: "CAI",
      limit: "6",
    });

    fetch(`https://api.aviationstack.com/v1/flights?${params.toString()}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Flight provider unavailable");
        return response.json() as Promise<AviationStackResponse>;
      })
      .then((payload) => {
        const mapped = (payload.data ?? [])
          .map((item): IncomingFlight | null => {
            const flight = item.flight?.iata ?? item.flight?.number;
            if (!flight) return null;
            const status = item.flight_status ?? "scheduled";
            const normalized = status.toLowerCase();
            const tone: Tone = normalized.includes("delay")
              ? "warn"
              : normalized.includes("landed")
                ? "ok"
                : normalized.includes("active")
                  ? "info"
                  : "neutral";
            const gate = item.arrival?.gate
              ? `${item.arrival.terminal ? `T${item.arrival.terminal} / ` : ""}${item.arrival.gate}`
              : item.arrival?.terminal
                ? `T${item.arrival.terminal} / --`
                : "Gate TBD";
            const origin = item.departure?.iata ? `${item.departure.airport ?? "Origin"} (${item.departure.iata})` : item.departure?.airport ?? "Origin TBD";
            return {
              airline: item.airline?.name ?? "Airline TBD",
              flight,
              eta: formatCairoTime(item.arrival?.estimated ?? item.arrival?.scheduled),
              gate,
              status: status.replace(/_/g, " "),
              tone,
              origin,
            };
          })
          .filter((item): item is IncomingFlight => item != null)
          .slice(0, 4);

        if (mapped.length === 0) {
          setSource("sample");
          return;
        }
        setFlights(mapped);
        setSource("live");
        setUpdatedAt(formatCairoTime(new Date().toISOString()));
      })
      .catch(() => {
        setSource("sample");
      });

    return () => controller.abort();
  }, []);

  return { flights, source, updatedAt };
}

function DigitalTwinView() {
  const { language, tr } = useLocale();
  const [activeSceneId, setActiveSceneId] = useState<AirportScene["id"]>("terminal-3");
  const [imageMode, setImageMode] = useState<"light" | "dark">("light");
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const incoming = useIncomingCaiFlights();

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
        transform={`translate(${hotspot.cx * 16}, ${hotspot.cy * 9})`} 
        onClick={() => setSelectedHotspotId(hotspot.id)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setSelectedHotspotId(hotspot.id);
          }
        }}
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
    <div className="grid min-w-0 gap-4 lg:gap-6">
      <SectionPanel className="overflow-hidden p-0" title="">
        <div className="min-w-0 border-b border-border p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">{localize({ en: "Interactive airport image map", ar: "خريطة تفاعلية للمطار" }, language)}</p>
          <h2 className="mt-2 text-xl font-semibold sm:text-2xl">{localize({ en: "Cairo Airport visual command map", ar: "خريطة القيادة المرئية لمطار القاهرة" }, language)}</h2>
        </div>

        <nav className="border-b border-border bg-card/70 p-3" aria-label={localize({ en: "Airport image sections", ar: "أقسام صورة المطار" }, language)}>
          <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
            <span className="shrink-0 px-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{localize({ en: "Jump to", ar: "انتقل إلى" }, language)}</span>
            <div className="flex min-w-max items-center gap-2">
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
            <div className="relative min-w-0 bg-black aspect-video sm:aspect-auto sm:min-h-[500px] lg:min-h-[700px] xl:min-h-[800px] overflow-hidden">
            <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" role="img" aria-label={`${activeScene.title} operational image map`}>
              <title>{activeScene.title} operational image map</title>
              <image href={sceneImage} width="1600" height="900" preserveAspectRatio="xMidYMid slice" style={{ filter: imageFilter, transformOrigin: "center", transition: "filter 180ms ease" }} />

              {/* Render Hotspots */}
              {activeScene.hotspots.map(renderHotspotMarker)}
            </svg>
            {selectedHotspot && (
              <HotspotPopover
                hotspot={selectedHotspot}
                statusColor={getStatusColor(selectedHotspot.status)}
                onClose={() => setSelectedHotspotId(null)}
              />
            )}
            </div>
        </div>

          <aside className="grid min-w-0 content-start gap-0 border-t border-border bg-card xl:border-s xl:border-t-0 h-full max-h-[800px] overflow-y-auto">
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
                          type="button"
                          onClick={() => setSelectedHotspotId(h.id)}
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
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-3">Incoming Operations</h4>
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

function toneCssVar(tone: Tone) {
  const map: Record<Tone, string> = {
    ok: "var(--status-ok)",
    info: "var(--status-info)",
    warn: "var(--status-warn)",
    high: "var(--status-high)",
    crit: "var(--status-crit)",
    neutral: "var(--muted-foreground)",
  };
  return map[tone];
}

function HotspotPopover({ hotspot, statusColor, onClose }: { hotspot: MapHotspot; statusColor: string; onClose: () => void }) {
  const { language, tr } = useLocale();
  const statusLabel = hotspot.status === "warning"
    ? localize({ en: "Needs attention", ar: "يحتاج انتباها" }, language)
    : hotspot.status === "critical"
      ? localize({ en: "Critical", ar: "حرج" }, language)
      : hotspot.status === "good"
        ? localize({ en: "Good", ar: "جيد" }, language)
        : hotspot.status === "offline"
          ? localize({ en: "Offline", ar: "متوقف" }, language)
          : localize({ en: "Info", ar: "معلومة" }, language);
  const alignToStart = hotspot.cx > 58;
  const popoverWidth = "min(360px, calc(100% - 2rem))";
  const popoverLeft = alignToStart
    ? `max(1rem, calc(${hotspot.cx}% - min(360px, calc(100% - 2rem)) - 1.25rem))`
    : `min(calc(100% - min(360px, calc(100% - 2rem)) - 1rem), calc(${hotspot.cx}% + 1.25rem))`;
  const popoverTop = `clamp(1rem, calc(${hotspot.cy}% - 8rem), calc(100% - min(33rem, calc(100% - 2rem))))`;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-20" onClick={onClose} aria-hidden={false}>
      <div
        className="hotspot-popover panel absolute overflow-hidden p-0 shadow-2xl"
        style={{
          left: popoverLeft,
          top: popoverTop,
          width: popoverWidth,
          maxHeight: "calc(100% - 2rem)",
          overflowY: "auto",
        }}
        role="dialog"
        aria-modal="false"
        aria-labelledby="hotspot-popover-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border p-5">
          <h2 id="hotspot-popover-title" className="text-xl font-semibold tracking-tight">{tr(hotspot.title)}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border bg-background/70 hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label={tr("Close")}
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 p-5">
          <div className="flex flex-wrap items-center gap-4">
            <span className="rounded-full px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-white" style={{ backgroundColor: statusColor }}>
              {statusLabel}
            </span>
            <span className="font-mono text-sm font-semibold text-muted-foreground">{hotspot.category}</span>
            {hotspot.updatedAt && (
              <span className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-muted-foreground">
                <Clock3 aria-hidden="true" className="h-4 w-4" />
                {localize({ en: "Updated", ar: "آخر تحديث" }, language)} {hotspot.updatedAt}
              </span>
            )}
          </div>

          {hotspot.impact && (
            <section className="panel-inner p-4">
              <h3 className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <BarChart3 aria-hidden="true" className="h-4 w-4" />
                {localize({ en: "Operational impact", ar: "الأثر التشغيلي" }, language)}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-foreground">{hotspot.impact}</p>
            </section>
          )}

          <section className="panel-inner p-4">
            <h3 className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <Camera aria-hidden="true" className="h-4 w-4" />
              {localize({ en: "CCTV sample", ar: "عينة كاميرا مراقبة" }, language)}
            </h3>
            <p className="mt-3 text-2xl font-semibold text-foreground" style={{ color: statusColor }}>
              {hotspot.evidence ?? localize({ en: "No unusual activity detected.", ar: "لا توجد حركة غير معتادة." }, language)}
            </p>
            <CctvTerminalLoop />
          </section>

          <button
            type="button"
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground shadow-[0_0_24px_rgba(88,214,255,0.18)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {localize({ en: "View full analytics", ar: "عرض التحليلات كاملة" }, language)}
            <ArrowRight aria-hidden="true" className="h-5 w-5 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
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
      : localize({ en: "Sample data", ar: "بيانات عينة" }, language);
  const sourceTone: Tone = source === "live" ? "ok" : source === "loading" ? "info" : "neutral";

  return (
    <section className="panel-inner p-4 sm:p-5" aria-label={localize({ en: "Incoming flights", ar: "الرحلات القادمة" }, language)}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">{localize({ en: "Incoming flights", ar: "الرحلات القادمة" }, language)}</p>
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
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">{localize({ en: "Zone status", ar: "حالة المناطق" }, language)}</p>
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

function DigitalOperationalGrid() {
  return (
    <section className="grid gap-4 lg:gap-6 xl:grid-cols-2 xl:items-start" aria-label="Digital twin operational analytics">
      <div className="grid gap-4 lg:gap-6">
        <PassengerInfluxForecast />
        <GateWaitChart />
      </div>
      <div className="grid gap-4 lg:gap-6">
        <AnomalyWarningsPanel />
      </div>
    </section>
  );
}

function PassengerInfluxForecast() {
  const { language } = useLocale();
  return (
    <SectionPanel
      title={localize({ en: "Passenger influx forecast", ar: "توقع تدفق الركاب" }, language)}
      action={<StatusPill tone="neutral">{localize({ en: "Modelled", ar: "نمذجة" }, language)}</StatusPill>}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {localize({ en: "Forecasted trend of passenger flow over the next 4 hours.", ar: "الاتجاه المتوقع لتدفق الركاب خلال الـ 4 ساعات القادمة." }, language)}
      </p>
      <ForecastLineChart />
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <Legend color="bg-cyan" label={localize({ en: "Current trajectory", ar: "المسار الحالي" }, language)} />
        <Legend color="bg-status-warn" label={localize({ en: "Forecast", ar: "التوقع" }, language)} />
      </div>
    </SectionPanel>
  );
}

function ForecastLineChart() {
  const values = influxForecastRows.flatMap((row) => [row.current, row.forecast]);
  const min = Math.min(...values) - 100;
  const max = Math.max(...values) + 100;
  const span = max - min || 1;
  const width = 420;
  const height = 150;
  
  const getPoint = (value: number, index: number): [number, number] => {
    const x = 18 + (index / (influxForecastRows.length - 1)) * (width - 36);
    const y = height - 18 - ((value - min) / span) * (height - 38);
    return [x, y];
  };

  const createSmoothPath = (coords: [number, number][]) => {
    if (coords.length === 0) return "";
    let d = `M ${coords[0][0]},${coords[0][1]}`;
    for (let i = 1; i < coords.length; i++) {
      const p1 = coords[i - 1];
      const p2 = coords[i];
      const cpX = (p1[0] + p2[0]) / 2;
      d += ` C ${cpX},${p1[1]} ${cpX},${p2[1]} ${p2[0]},${p2[1]}`;
    }
    return d;
  };

  const currentCoords = influxForecastRows.map((row, index) => getPoint(row.current, index));
  const forecastCoords = influxForecastRows.map((row, index) => getPoint(row.forecast, index));
  
  const currentPath = createSmoothPath(currentCoords);
  const forecastPath = createSmoothPath(forecastCoords);
  
  const areaPath = currentCoords.length > 0
    ? `${currentPath} L ${currentCoords[currentCoords.length - 1][0]},${height - 18} L ${currentCoords[0][0]},${height - 18} Z`
    : "";

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full overflow-visible" role="img" aria-label="Passenger influx forecast line chart">
      <defs>
        <linearGradient id="forecast-cyan-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {[0, 1, 2].map((line) => (
        <line key={line} x1="18" x2={width - 18} y1={28 + line * 42} y2={28 + line * 42} stroke="var(--border)" strokeOpacity="0.55" strokeDasharray={line > 0 ? "4 4" : "none"} />
      ))}
      <path d={areaPath} fill="url(#forecast-cyan-grad)" />
      <path d={currentPath} fill="none" stroke="var(--cyan)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={forecastPath} fill="none" stroke="var(--status-warn)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6" />
      
      {/* Current Points - Dots */}
      {currentCoords.map((coord, index) => (
        <circle key={`curr-${index}`} cx={coord[0]} cy={coord[1]} r="4" fill="var(--background)" stroke="var(--cyan)" strokeWidth="2" />
      ))}
      
      {/* Forecast Points - Dots */}
      {forecastCoords.map((coord, index) => (
        <circle key={`fore-${index}`} cx={coord[0]} cy={coord[1]} r="4" fill="var(--background)" stroke="var(--status-warn)" strokeWidth="2" />
      ))}
      
      {/* X Axis Labels */}
      {influxForecastRows.map((row, index) => (
        <text key={row.time} x={currentCoords[index][0]} y={height - 2} textAnchor="middle" fill="var(--muted-foreground)" fontSize="10" className="font-mono">
          {row.time}
        </text>
      ))}
    </svg>
  );
}

function GateWaitChart() {
  const { language } = useLocale();
  return (
    <SectionPanel
      title={localize({ en: "Average wait time per gate", ar: "متوسط الانتظار لكل بوابة" }, language)}
      action={<StatusPill tone="warn">{localize({ en: "F11 needs action", ar: "F11 يحتاج إجراء" }, language)}</StatusPill>}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        {localize({ en: "Current wait times across active gates.", ar: "أوقات الانتظار الحالية عبر البوابات النشطة." }, language)}
      </p>
      <div className="grid gap-3">
        {gateWaitRows.map((row) => (
          <div key={row.gate} className="grid grid-cols-[48px_minmax(0,1fr)_58px] items-center gap-3">
            <span className="font-mono text-sm font-semibold">{row.gate}</span>
            <ProgressBar value={row.wait} max={30} color={toneCssVar(row.tone)} />
            <span className="justify-self-end font-mono text-sm text-muted-foreground">{row.wait}m</span>
          </div>
        ))}
      </div>
    </SectionPanel>
  );
}

function AnomalyWarningsPanel() {
  const { language } = useLocale();
  const warnings = [
    { icon: Gauge, title: { en: "Threshold warning", ar: "تحذير حد تشغيلي" }, detail: { en: "Security may exceed 25 minutes within the next hour.", ar: "قد يتجاوز الأمن 25 دقيقة خلال الساعة القادمة." }, tone: "warn" as Tone },
    { icon: RadioTower, title: { en: "Ground crew buffer", ar: "احتياطي الطاقم الأرضي" }, detail: { en: "Coverage is healthy; keep floaters near T3 passport.", ar: "التغطية جيدة؛ أبق الدعم المتحرك قرب جوازات مبنى 3." }, tone: "ok" as Tone },
    { icon: DoorOpen, title: { en: "Open counter recommendation", ar: "توصية فتح كاونتر" }, detail: { en: "Open two counters before the +2h forecast peak.", ar: "افتح كاونترين قبل ذروة التوقع بعد ساعتين." }, tone: "info" as Tone },
  ];
  return (
    <SectionPanel title={localize({ en: "Anomaly alerts and recommendations", ar: "تنبيهات الشذوذ والتوصيات" }, language)} action={<StatusPill tone="info">AI</StatusPill>}>
      <div className="grid gap-3">
        {warnings.map((warning) => {
          const Icon = warning.icon;
          return (
            <article key={warning.title.en} className="panel-inner flex items-start gap-3 p-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border bg-background/60">
                <Icon aria-hidden="true" className="h-4 w-4" style={{ color: toneCssVar(warning.tone) }} />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{localize(warning.title, language)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{localize(warning.detail, language)}</p>
              </div>
            </article>
          );
        })}
      </div>
    </SectionPanel>
  );
}

function OperationsView() {
  const { tr } = useLocale();
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Operations key metrics">
        <MetricCard label={tr("Passengers today")} value="58,420" hint={tr("Daily benchmark 85k")} delta={tr("+4.1% vs yesterday")} icon={Users} accent="cyan" />
        <MetricCard label={tr("Aircraft movements")} value="412" unit="/ 540" hint={tr("390 average")} delta={tr("On schedule")} icon={Activity} accent="cyan" />
        <MetricCard label={tr("Avg taxi-out")} value="14" unit="min" hint={tr("CIA operations sample")} delta="-2 min" deltaTone="warn" icon={Clock3} accent="warn" />
        <MetricCard label={tr("Active alerts")} value="3" hint={tr("2 medium, 1 high")} delta={tr("Needs review")} deltaTone="warn" icon={AlertTriangle} accent="warn" />
      </section>

      {/* Middle: Charts for visual absorption */}
      <div className="grid gap-6 xl:grid-cols-2">
        <PassengerFlowChart />
        <QueuePressureChart />
      </div>

      {/* Tables: Detailed lists */}
      <div className="grid gap-6 xl:grid-cols-2">
        <FlightBoard title={tr("Departures")} direction="to" rows={departures} />
        <FlightBoard title={tr("Arrivals")} direction="from" rows={arrivals} />
      </div>

      <DigitalOperationalGrid />
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
  const { tr, language } = useLocale();
  return (
    <SectionPanel title={tr("Passenger flow")} action={<StatusPill tone="neutral">{tr("Modelled")}</StatusPill>}>
      <h3 className="text-base font-semibold">{tr("Passenger flow rises into the midday wave")}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{localize({ en: "Hourly progression of passenger throughput across all terminals.", ar: "التطور الساعي لتدفق الركاب عبر جميع المباني." }, language)}</p>
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
  const { tr, language } = useLocale();
  return (
    <SectionPanel title={tr("Queue pressure by terminal")} action={<StatusPill tone="info">{tr("Stacked bar")}</StatusPill>}>
      <p className="mb-4 text-sm text-muted-foreground">{localize({ en: "Breakdown of passenger congestion by processing stage.", ar: "تفصيل ازدحام الركاب حسب مرحلة المعالجة." }, language)}</p>
      
      {/* Screen reader accessible data table */}
      <table className="sr-only">
        <caption>{tr("Queue pressure by terminal")}</caption>
        <thead>
          <tr><th>Terminal</th><th>Check-in</th><th>Passport</th><th>Security</th><th>Total</th></tr>
        </thead>
        <tbody>
          {queueRows.map((row) => (
            <tr key={`sr-${row.terminal}`}>
              <td>{row.terminal}</td><td>{row.checkIn}%</td><td>{row.passport}%</td><td>{row.security}%</td><td>{row.total}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-4" aria-hidden="true">
        {queueRows.map((row) => (
          <div key={row.terminal} className="grid grid-cols-[42px_minmax(0,1fr)_42px] items-center gap-3">
            <span className="font-mono font-semibold">{row.terminal}</span>
            <div className="flex h-4 overflow-hidden rounded-full bg-secondary">
              <span className="bg-cyan transition-opacity hover:opacity-80 cursor-help" style={{ width: `${row.checkIn}%` }} title={`${tr("Check-in")}: ${row.checkIn}%`} />
              <span className="bg-cyan/70 transition-opacity hover:opacity-80 cursor-help" style={{ width: `${row.passport}%` }} title={`${tr("Passport")}: ${row.passport}%`} />
              <span className="bg-cyan/40 transition-opacity hover:opacity-80 cursor-help" style={{ width: `${row.security}%` }} title={`${tr("Security")}: ${row.security}%`} />
            </div>
            <span className="font-mono text-sm text-muted-foreground">{row.total}%</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground" aria-hidden="true">
        <Legend color="bg-cyan" label={tr("Check-in")} />
        <Legend color="bg-cyan/70" label={tr("Passport")} />
        <Legend color="bg-cyan/40" label={tr("Security")} />
      </div>
    </SectionPanel>
  );
}

function SafetyView() {
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      {/* Top Section: Charts and Tables for immediate information absorption */}
      <div className="grid gap-4 lg:gap-6 xl:grid-cols-2 xl:items-start">
        <div className="grid min-w-0 content-start gap-4 lg:gap-6">
          <SafetyAlertAge />
          <AircraftRiskTable />
        </div>
        <div className="grid min-w-0 content-start gap-4 lg:gap-6">
          <SafetyChecks />
          <MaintenanceTable />
        </div>
      </div>
      
      {/* Bottom Section: Decision logic and preventing issue build-up */}
      <div className="grid gap-4 lg:gap-6 xl:grid-cols-2 xl:items-start">
        <div className="grid min-w-0 content-start gap-4 lg:gap-6">
          <DecisionRecommendations />
        </div>
        <div className="grid min-w-0 content-start gap-4 lg:gap-6">
          <SafetyControls />
        </div>
      </div>
    </div>
  );
}

function DecisionRecommendations() {
  const { tr } = useLocale();
  const rows = [
    { title: "Rebalance security staff", detail: "-4 min expected wait", badge: "Ops", icon: Users, tone: "info" as Tone },
    { title: "Fast-track F11 passengers", detail: "Protects departure time", badge: "Gates", icon: Plane, tone: "ok" as Tone },
    { title: "Confirm SU-GBP parts", detail: "Reduces tomorrow risk", badge: "Maintenance", icon: Wrench, tone: "warn" as Tone },
  ];
  return (
    <SectionPanel title={tr("Decision recommendations")}>
      <div className="grid gap-3 sm:grid-cols-3">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
          <article key={row.title} className="panel-inner p-4 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-border bg-background/65">
              <Icon aria-hidden="true" className="h-5 w-5" style={{ color: toneCssVar(row.tone) }} />
            </div>
            <h3 className="mt-3 text-sm font-semibold">{tr(row.title)}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{tr(row.detail)}</p>
            <div className="mt-3 flex justify-center">
              <StatusPill tone={row.tone}>{tr(row.badge)}</StatusPill>
            </div>
          </article>
          );
        })}
      </div>
    </SectionPanel>
  );
}

function SafetyControls() {
  const { tr } = useLocale();
  const rows = [
    { title: "Accumulation risk", detail: "3 findings open longer than 24h", badge: "Medium", tone: "warn" as Tone, icon: AlertTriangle },
    { title: "Action owner", detail: "Every safety item has an owner and due time", badge: "Assigned", tone: "ok" as Tone, icon: UserCheck },
    { title: "Auto-escalation", detail: "Escalates if action has not started", badge: "90 min", tone: "info" as Tone, icon: Clock3 },
  ];
  return (
    <SectionPanel title={tr("Controls to prevent issue build-up")}>
      <div className="grid gap-3 sm:grid-cols-3">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
          <article key={row.title} className="panel-inner p-4 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-border bg-background/65">
              <Icon aria-hidden="true" className="h-5 w-5" style={{ color: toneCssVar(row.tone) }} />
            </div>
            <h3 className="mt-3 text-sm font-semibold">{tr(row.title)}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{tr(row.detail)}</p>
            <div className="mt-3 flex justify-center">
              <StatusPill tone={row.tone}>{tr(row.badge)}</StatusPill>
            </div>
          </article>
          );
        })}
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
      }).format(now),
      utc: new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      }).format(now),
    }),
    [now],
  );
}
