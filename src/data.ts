import { Flame, Wrench, Activity, ShieldCheck, LucideIcon } from "lucide-react";

// ----------------------------------------------------
// Type Definitions
// ----------------------------------------------------
export type ManagerTab = "digital" | "operations" | "safety";
export type PageView = "dashboard" | "resources";
export type Tone = "ok" | "info" | "warn" | "high" | "crit" | "neutral";
export type Language = "en" | "ar";
export type ThemeMode = "dark" | "light";
export type LocalizedText = { en: string; ar: string };

export type FlightRow = {
  flight: string;
  city: string;
  time: string;
  gate: string;
  status: string;
  tone: Tone;
};

export type IncomingFlight = {
  airline: string;
  flight: string;
  eta: string;
  gate: string;
  status: string;
  tone: Tone;
  origin: string;
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

// ----------------------------------------------------
// Global Translation Dictionary
// ----------------------------------------------------
export const arText: Record<string, string> = {
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

export const copy = {
  en: {
    airport: "Cairo International Airport",
    brand: "CIA Command Hub",
    manager: "Manager view",
    heroTitle: "Operations and safety overview",
    heroBody: "A focused management surface for live flow, flight movement, safety checks and maintenance attention.",
    digital: "Digital Twin",
    operations: "Operations",
    safety: "Safety",
    resources: "Project Documentation & Credits",
    footer: "Created as an independent UX project depicting Cairo International Airport. Not affiliated with Cairo Airport Company.",
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
    resources: "توثيق المشروع والمساهمين",
    footer: "تم إنشاؤه كمشروع تجربة مستخدم مستقل يعرض مطار القاهرة الدولي. غير تابع لشركة ميناء القاهرة الجوي.",
    contrast: "تبديل التباين العالي",
    theme: "تبديل نمط الألوان",
    language: "تبديل اللغة",
  },
} as const;

// ----------------------------------------------------
// Dashboard Mocks
// ----------------------------------------------------
export const scenes: AirportScene[] = [
  {
    id: "terminal-1",
    label: "Terminal 1",
    title: "Terminal 1 Operations",
    summary: "Separate terminal area serving selected domestic and international operations.",
    image: "/manager-assets/terminal-1-light.webp",
    darkImage: "/manager-assets/terminal-1-dark.webp",
    hotspots: [
      { id: "t1-stand-turnaround", cx: 60.0, cy: 35.0, status: "warning", title: "Remote Stand Turnaround Pressure", category: "Airside", impact: "Two narrow-body turns may exceed the planned ground time if fueling and catering overlap.", evidence: "Stand team is 9 minutes behind the service milestone.", action: "Move one ground support unit from the adjacent stand.", source: "Turnaround control", updatedAt: "14:00" }
    ]
  },
  {
    id: "terminal-2",
    label: "Terminal 2",
    title: "Terminal 2 Operations",
    summary: "International terminal connected operationally with Terminal 3.",
    image: "/manager-assets/terminal-2-light.webp",
    darkImage: "/manager-assets/terminal-2-dark.webp",
    hotspots: [
      { id: "t2-security", cx: 45.0, cy: 50.0, status: "warning", title: "T2 Security Queue Rising", category: "Terminal", impact: "Departing passengers may reach passport control late during the next arrival/departure overlap.", evidence: "Security queue reached 17m. Open secondary screening lanes immediately.", action: "Open one extra screening lane for 30 minutes.", source: "Queue sensor", updatedAt: "14:15" }
    ]
  },
  {
    id: "terminal-3",
    label: "Terminal 3",
    title: "Terminal 3 Operations",
    summary: "Main international terminal with gate, flow, and connection monitoring.",
    image: "/manager-assets/terminal-3-light.webp",
    darkImage: "/manager-assets/terminal-3-dark.webp",
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
    image: "/manager-assets/landside-light.webp",
    darkImage: "/manager-assets/landside-dark.webp",
    hotspots: [
      { id: "parking-congestion", cx: 20.5, cy: 62.1, status: "warning", title: "Parking Entry Queue", category: "Landside", impact: "Curbside access may slow for passengers arriving by car or shuttle.", evidence: "Entry queue is above 15 vehicles.", action: "Deploy two traffic wardens at the parking entry split.", source: "Traffic camera", updatedAt: "14:02" }
    ]
  },
  {
    id: "services",
    label: "Support Services",
    title: "Support Services",
    summary: "Maintenance, catering, and airport support facilities.",
    image: "/manager-assets/support-services-light.webp",
    darkImage: "/manager-assets/support-services-dark.webp",
    hotspots: [
      { id: "catering-facility", cx: 70.0, cy: 40.0, status: "good", title: "Catering Dispatch Stable", category: "Services", impact: "Catering dispatch is meeting the planned departure wave.", evidence: "All priority flights have catering assigned.", source: "Facilities control", updatedAt: "14:10" }
    ]
  }
];

export const sampleIncomingFlights: IncomingFlight[] = [
  { airline: "EgyptAir", flight: "MS786", eta: "13:40", gate: "T3 / F06", status: "On time", tone: "ok", origin: "Frankfurt (FRA)" },
  { airline: "Qatar Airways", flight: "QR1303", eta: "14:05", gate: "T2 / B03", status: "Landing", tone: "info", origin: "Doha (DOH)" },
  { airline: "Emirates", flight: "EK927", eta: "14:25", gate: "T2 / B12", status: "Delayed +18m", tone: "warn", origin: "Dubai (DXB)" },
  { airline: "Saudia", flight: "SV301", eta: "14:55", gate: "T1 / A04", status: "On time", tone: "ok", origin: "Jeddah (JED)" },
];

export const zoneStatusRows = [
  { zone: "Terminal 1", status: { en: "Smooth", ar: "سلس" }, detail: { en: "Maintain current baseline staffing.", ar: "حافظ على مستويات التوظيف الحالية." }, tone: "ok" as Tone },
  { zone: "Terminal 2", status: { en: "Moderate", ar: "متوسط" }, detail: { en: "Open 2 secondary lanes immediately.", ar: "افتح مسارين إضافيين فوراً." }, tone: "warn" as Tone },
  { zone: "Terminal 3", status: { en: "Busy", ar: "مزدحم" }, detail: { en: "Pre-stage floaters at passport control.", ar: "قم بتوجيه الدعم إلى مراقبة الجوازات." }, tone: "high" as Tone },
];

export const gateWaitRows = [
  { gate: "F06", wait: 12, tone: "ok" as Tone },
  { gate: "B03", wait: 16, tone: "info" as Tone },
  { gate: "B12", wait: 24, tone: "warn" as Tone },
  { gate: "A04", wait: 9, tone: "ok" as Tone },
  { gate: "F11", wait: 28, tone: "high" as Tone },
];

export const influxForecastRows = [
  { time: "Now", current: 960, forecast: 980 },
  { time: "+1h", current: 1200, forecast: 1320 },
  { time: "+2h", current: 1380, forecast: 1540 },
  { time: "+3h", current: 1180, forecast: 1460 },
  { time: "+4h", current: 980, forecast: 1120 },
];

export const departures: FlightRow[] = [
  { flight: "MS777", city: "London (LHR)", time: "14:45", gate: "D3", status: "Boarding", tone: "info" },
  { flight: "SV302", city: "Riyadh (RUH)", time: "15:30", gate: "A15", status: "Scheduled", tone: "ok" },
  { flight: "AF551", city: "Paris (CDG)", time: "15:55", gate: "S1", status: "Gate Open", tone: "ok" },
  { flight: "MS717", city: "Luxor (LXR)", time: "16:20", gate: "F9", status: "Delayed +10m", tone: "warn" },
];

export const arrivals: FlightRow[] = [
  { flight: "MS738", city: "Frankfurt (FRA)", time: "15:00", gate: "C3", status: "On Time", tone: "ok" },
  { flight: "TK694", city: "Istanbul (IST)", time: "16:15", gate: "A2", status: "Estimated", tone: "ok" },
  { flight: "EK927", city: "Dubai (DXB)", time: "13:45", gate: "B12", status: "Landed", tone: "ok" },
  { flight: "MS841", city: "Jeddah (JED)", time: "12:30", gate: "D9", status: "Landed", tone: "ok" },
];

export const queueRows = [
  { terminal: "T1", checkIn: 30, passport: 25, security: 25, total: 68 },
  { terminal: "T2", checkIn: 34, passport: 30, security: 31, total: 89 },
  { terminal: "T3", checkIn: 38, passport: 25, security: 27, total: 84 },
];

export const safetyChecks = [
  { icon: Flame, title: "Fire suppression - T1/T2/T3", detail: "Maintain 4h inspection cycle", badge: "Operational", tone: "ok" as Tone },
  { icon: Wrench, title: "Runway water response", detail: "Schedule drill within 24h", badge: "Standby", tone: "info" as Tone },
  { icon: Activity, title: "ATC backup comms", detail: "Maintain 15m polling", badge: "Operational", tone: "ok" as Tone },
  { icon: ShieldCheck, title: "Apron worker PPE compliance", detail: "Increase audits in sector B", badge: "98% compliant", tone: "ok" as Tone },
  { icon: ShieldCheck, title: "Security checkpoint scanners", detail: "Expedite tech to T2-B", badge: "1 offline (T2-B)", tone: "warn" as Tone },
];

export const maintenanceRows = [
  { reg: "SU-GDR", type: "B777-300ER", task: "A-check completed", date: "12 May 2026", duration: "32h", status: "Released", tone: "ok" as Tone },
  { reg: "SU-GEU", type: "B787-9", task: "Engine #2 borescope", date: "11 May 2026", duration: "8h", status: "Released", tone: "ok" as Tone },
  { reg: "SU-GCS", type: "A330-300", task: "Hydraulic line repair", date: "11 May 2026", duration: "14h", status: "Released", tone: "ok" as Tone },
  { reg: "SU-GDM", type: "B737-800", task: "Tire and brake change", date: "10 May 2026", duration: "4h", status: "Released", tone: "ok" as Tone },
  { reg: "SU-GBP", type: "A320", task: "Cabin pressurisation test", date: "10 May 2026", duration: "6h", status: "Awaiting parts", tone: "warn" as Tone },
];

export const aircraftRiskRows = [
  { reg: "SU-GBP", type: "A320", events: 7, mtbf: "142h", issue: "Pressurisation, APU starts", risk: 78 },
  { reg: "SU-GDC", type: "B737-800", events: 6, mtbf: "168h", issue: "Brake wear, nose gear", risk: 65 },
  { reg: "SU-GCH", type: "A330-200", events: 5, mtbf: "210h", issue: "Galley power, IFE", risk: 54 },
  { reg: "SU-GEK", type: "B787-9", events: 3, mtbf: "320h", issue: "Cabin sensors", risk: 38 },
];
