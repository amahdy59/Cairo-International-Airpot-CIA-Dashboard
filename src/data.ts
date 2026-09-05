import { Flame, Wrench, Activity, ShieldCheck } from "lucide-react";

// ----------------------------------------------------
// Type Definitions
// ----------------------------------------------------
export type ManagerTab = "digital" | "operations" | "safety" | "staffing";
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

// Staffing & Workforce Domain Types
export type StaffingShiftWaveId = 'morning' | 'midday' | 'night';

export type StaffingShiftWave = {
  id: StaffingShiftWaveId;
  name: LocalizedText;
  hours: string;
  flightLoad: number;
  requiredStaff: number;
  allocatedStaff: number;
  coverageRatio: number;
  statusTone: Tone;
  leadManager: LocalizedText;
  leadCallsign: string;
};

export type AirsideZoneId = 'T1' | 'T2' | 'T3' | 'RAMP' | 'SECURITY' | 'BAGGAGE' | 'ARFF';

export type StaffRole =
  | 'ramp_controller'
  | 'airside_marshal'
  | 'security_lead'
  | 'baggage_ops'
  | 'terminal_manager'
  | 'arff_paramedic'
  | 'customs_coord';

export type StaffMember = {
  id: string;
  name: LocalizedText;
  role: StaffRole;
  roleTitle: LocalizedText;
  zone: AirsideZoneId;
  zoneLabel: LocalizedText;
  shiftWave: StaffingShiftWaveId;
  callsign: string;
  radioChannel: string;
  status: 'on_duty' | 'break' | 'dispatched' | 'standby';
  icaoCertValidUntil: string;
  badgeType: LocalizedText;
  certStatus: 'valid' | 'expiring_soon' | 'expired';
  daysToCertExpiry: number;
  safetyDaysZeroIncidents: number;
  phoneExt: string;
};

export type SurgeCrewUnit = {
  id: string;
  title: LocalizedText;
  targetZone: AirsideZoneId;
  targetZoneLabel: LocalizedText;
  headcount: number;
  dispatchEtaMin: number;
  status: 'ready' | 'dispatched' | 'resting';
  leadCallsign: string;
  description: LocalizedText;
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
  // Scenes & Summaries
  "Landside Access": "الوصول الأرضي",
  "Support Services": "خدمات الدعم",
  "Terminal 1 Operations": "عمليات مبنى الركاب 1",
  "Terminal 2 Operations": "عمليات مبنى الركاب 2",
  "Terminal 3 Operations": "عمليات مبنى الركاب 3",
  "Separate terminal area serving selected domestic and international operations.": "منطقة صالة منفصلة تخدم عمليات محلية ودولية محددة.",
  "International terminal connected operationally with Terminal 3.": "مبنى ركاب دولي متصل تشغيلياً بمبنى الركاب 3.",
  "Main international terminal with gate, flow, and connection monitoring.": "مبنى الركاب الدولي الرئيسي مع مراقبة البوابات والتدفق والربط.",
  "Parking, access roads, curbside flow, and public-side movement.": "مواقف السيارات، الطرق المؤدية، حركة تدفق الرصيف، وحركة الجانب العام.",
  "Maintenance, catering, and airport support facilities.": "مرافق الصيانة، التموين، وخدمات دعم المطار.",

  // Hotspot Categories
  "Airside": "جانب الطيران",
  "Terminal": "مبنى الركاب",
  "Operations": "التشغيل",
  "Landside": "الجانب البري",
  "Services": "الخدمات",

  // Hotspot Titles
  "Remote Stand Turnaround Pressure": "ضغط دوران الطائرات في المواقف البعيدة",
  "T2 Security Queue Rising": "ارتفاع طابور الأمن في مبنى 2",
  "Terminal 3 Passenger Flow": "تدفق الركاب في مبنى 3",
  "Gate B12 Boarding Risk": "مخاطر صعود الطائرة عند البوابة B12",
  "Parking Entry Queue": "طابور مدخل مواقف السيارات",
  "Catering Dispatch Stable": "استقرار إرسال التموين",

  // Hotspot Impacts
  "Two narrow-body turns may exceed the planned ground time if fueling and catering overlap.": "قد يتجاوز دوران طائرتين ضيقتي البدن الوقت الأرضي المخطط له في حال تداخل تزويد الوقود والتموين.",
  "Departing passengers may reach passport control late during the next arrival/departure overlap.": "قد يصل الركاب المغادرون إلى مراقبة الجوازات متأخرين أثناء تداخل الوصول/المغادرة القادم.",
  "Passenger processing is stable across check-in, passport control, and departure gates.": "إجراءات الركاب مستقرة عبر تسجيل الوصول، ومراقبة الجوازات، وبوابات المغادرة.",
  "A late inbound aircraft may compress boarding time and create connection pressure.": "قد تؤدي طائرة قادمة متأخرة إلى ضغط وقت الصعود وإنشاء ضغط في رحلات الربط.",
  "Curbside access may slow for passengers arriving by car or shuttle.": "قد تتباطأ حركة الوصول عند الرصيف للركاب القادمين بالسيارة أو الحافلة.",
  "Catering dispatch is meeting the planned departure wave.": "توزيع التموين يلبي موجة المغادرة المخطط لها.",

  // Hotspot Evidences
  "Stand team is 9 minutes behind the service milestone.": "فريق الموقف متأخر بـ 9 دقائق عن المرحلة التشغيلية المستهدفة.",
  "Security queue reached 17m. Open secondary screening lanes immediately.": "طابور الأمن وصل إلى 17 متراً. افتح مسارات التفتيش الثانوية فوراً.",
  "Average wait is below 5 minutes.": "متوسط وقت الانتظار أقل من 5 دقائق.",
  "Inbound aircraft is 18 minutes behind stand target.": "الطائرة القادمة متأخرة بـ 18 دقيقة عن الموقف المستهدف.",
  "Entry queue is above 15 vehicles.": "طابور الدخول يتجاوز 15 مركبة.",
  "All priority flights have catering assigned.": "تم تعيين التموين لجميع الرحلات ذات الأولوية.",

  // Hotspot Actions & Sources
  "Move one ground support unit from the adjacent stand.": "نقل وحدة دعم أرضي واحدة من الموقف المجاور.",
  "Open one extra screening lane for 30 minutes.": "افتح مسار تفتيش إضافي لمدة 30 دقيقة.",
  "Assign a ramp runner and pre-stage boarding staff.": "تعيين مشرف ساحة وتجهيز موظفي الصعود مسبقاً.",
  "Deploy two traffic wardens at the parking entry split.": "نشر اثنين من مراقبي المرور عند مفرق مدخل مواقف السيارات.",
  "Turnaround control": "مراقبة الدوران",
  "Queue sensor": "مستشعر الطابور",
  "Gate control": "مراقبة البوابة",
  "Traffic camera": "كاميرا المرور",
  "Facilities control": "مراقبة المرافق",

  // Flight origins (city names)
  "Frankfurt (FRA)": "فرانكفورت (FRA)",
  "Doha (DOH)": "الدوحة (DOH)",
  "Dubai (DXB)": "دبي (DXB)",
  "Jeddah (JED)": "جدة (JED)",
  "Frankfurt": "فرانكفورت",
  "Doha": "الدوحة",
  "Dubai": "دبي",
  "Jeddah": "جدة",
  "London (LHR)": "لندن (LHR)",
  "Riyadh (RUH)": "الرياض (RUH)",
  "Paris (CDG)": "باريس (CDG)",
  "Luxor (LXR)": "الأقصر (LXR)",
  "Istanbul (IST)": "إسطنبول (IST)",
  "London": "لندن",
  "Riyadh": "الرياض",
  "Paris": "باريس",
  "Luxor": "الأقصر",
  "Istanbul": "إسطنبول",

  // Airline names
  "EgyptAir": "مصر للطيران",
  "Qatar Airways": "الخطوط الجوية القطرية",
  "Emirates": "طيران الإمارات",
  "Saudia": "الخطوط السعودية",

  // Flight Statuses
  "Boarding": "صعود الطائرة",
  "Scheduled": "مجدولة",
  "Gate Open": "البوابة مفتوحة",
  "Delayed +10m": "متأخرة +10د",
  "On Time": "في الموعد",
  "Estimated": "مقدّرة",
  "Landed": "هبطت",

  // General UI labels
  "Area Overview": "نظرة عامة على المنطقة",
  "UTC": "عالمي",

  // Safety Checks & Maintenance Details
  "Maintain 4h inspection cycle": "متابعة دورة الفحص كل 4 ساعات",
  "Schedule drill within 24h": "جدولة التدريب خلال 24 ساعة",
  "Maintain 15m polling": "متابعة الاتصال كل 15 دقيقة",
  "Increase audits in sector B": "زيادة عمليات التدقيق في القطاع B",
  "Expedite tech to T2-B": "إرسال فني إلى T2-B على الفور",
  "12 May 2026": "12 مايو 2026",
  "11 May 2026": "11 مايو 2026",
  "10 May 2026": "10 مايو 2026",

  // MTBF and Aircraft Risk
  "MTBF": "متوسط الوقت بين الأعطال",
  "Pressurisation, APU starts": "الضغط، بدء تشغيل وحدة الطاقة المساعدة (APU)",
  "Brake wear, nose gear": "تآكل المكابح، معدات الهبوط الأمامية",
  "Galley power, IFE": "طاقة المطبخ، نظام الترفيه الجوي",
  "Cabin sensors": "مستشعرات المقصورة",
  "142h": "142 ساعة",
  "168h": "168 ساعة",
  "210h": "210 ساعة",
  "320h": "320 ساعة",
  "32h": "32 ساعة",
  "8h": "8 ساعات",
  "14h": "14 ساعة",
  "4h": "4 ساعات",
  "6h": "6 ساعات",

  // Staffing & HR Module
  "Staffing & Workforce Management": "إدارة القوى العاملة ومناوبات المطار",
  "Workforce & Staffing Hub": "مركز إدارة القوى العاملة والمناوبات",
  "Shift Wave Allocator": "توزيع مناوبات الورديات التشغيلية",
  "Dynamic Roster Grid": "جدول توزيع أطقم ساحة المطار",
  "Emergency Surge Crew Dispatch": "إعادة الانتشار الفوري لفرق الطوارئ",
  "ICAO Airside Safety & Permit Compliance Tracker": "متابعة تراخيص القيادة وسلامة مهابط الإيكاو",
  "Total Staff on Duty": "إجمالي العاملين في الخدمة",
  "Shift Wave Coverage": "نسبة تغطية المناوبة الحالية",
  "ICAO Badge Compliance": "نسبة امتثال شارات الإيكاو",
  "Surge Response ETA": "زمن استجابة فرق الطوارئ",
  "Active Wave": "الوردية النشطة",
  "Export Shift Roster (CSV)": "تصدير جدول المناوبة (CSV)",
  "Search staff by name, callsign, or role...": "بحث بالاسم، رمز النداء، أو المسمى الوظيفي...",
  "All Zones": "كافة المناطق",
  "All Roles": "كافة التخصصات",
  "All Shifts": "كافة الورديات",
  "Dispatch Crew": "إرسال الطاقم فوراً",
  "Dispatched": "تم الإرسال",
  "Recall / Standby": "استدعاء / وضع الاستعداد",
  "Valid": "ساري",
  "Expiring Soon": "يقترب من الانتهاء",
  "Expired": "منتهي",
  "Days remaining": "أيام متبقية",
  "On Duty": "في الخدمة",
  "Break": "استراحة",
  "Ramp Controller": "مراقب ساحة الطيران",
  "Airside Marshal": "موجه طائرات بالمرسى",
  "Security Screening Lead": "مشرف أمن وتفتيش",
  "Baggage Operations Coordinator": "منسق حركة الأمتعة",
  "Terminal Duty Manager": "مدير مناوب لصالة الركاب",
  "ARFF Rescue Paramedic": "مسعف إنقاذ وإطفاء جوي",
  "Customs & Immigration Liaison": "منسق جمارك وجوازات",
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
    staffing: "Staffing & HR",
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
    staffing: "القوى العاملة والمناوبات",
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
    image: import.meta.env.BASE_URL + "manager-assets/terminal-1-light.webp",
    darkImage: import.meta.env.BASE_URL + "manager-assets/terminal-1-dark.webp",
    hotspots: [
      { id: "t1-stand-turnaround", cx: 60.0, cy: 35.0, status: "warning", title: "Remote Stand Turnaround Pressure", category: "Airside", impact: "Two narrow-body turns may exceed the planned ground time if fueling and catering overlap.", evidence: "Stand team is 9 minutes behind the service milestone.", action: "Move one ground support unit from the adjacent stand.", source: "Turnaround control", updatedAt: "14:00" }
    ]
  },
  {
    id: "terminal-2",
    label: "Terminal 2",
    title: "Terminal 2 Operations",
    summary: "International terminal connected operationally with Terminal 3.",
    image: import.meta.env.BASE_URL + "manager-assets/terminal-2-light.webp",
    darkImage: import.meta.env.BASE_URL + "manager-assets/terminal-2-dark.webp",
    hotspots: [
      { id: "t2-security", cx: 45.0, cy: 50.0, status: "warning", title: "T2 Security Queue Rising", category: "Terminal", impact: "Departing passengers may reach passport control late during the next arrival/departure overlap.", evidence: "Security queue reached 17m. Open secondary screening lanes immediately.", action: "Open one extra screening lane for 30 minutes.", source: "Queue sensor", updatedAt: "14:15" }
    ]
  },
  {
    id: "terminal-3",
    label: "Terminal 3",
    title: "Terminal 3 Operations",
    summary: "Main international terminal with gate, flow, and connection monitoring.",
    image: import.meta.env.BASE_URL + "manager-assets/terminal-3-light.webp",
    darkImage: import.meta.env.BASE_URL + "manager-assets/terminal-3-dark.webp",
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
    image: import.meta.env.BASE_URL + "manager-assets/landside-light.webp",
    darkImage: import.meta.env.BASE_URL + "manager-assets/landside-dark.webp",
    hotspots: [
      { id: "parking-congestion", cx: 20.5, cy: 62.1, status: "warning", title: "Parking Entry Queue", category: "Landside", impact: "Curbside access may slow for passengers arriving by car or shuttle.", evidence: "Entry queue is above 15 vehicles.", action: "Deploy two traffic wardens at the parking entry split.", source: "Traffic camera", updatedAt: "14:02" }
    ]
  },
  {
    id: "services",
    label: "Support Services",
    title: "Support Services",
    summary: "Maintenance, catering, and airport support facilities.",
    image: import.meta.env.BASE_URL + "manager-assets/support-services-light.webp",
    darkImage: import.meta.env.BASE_URL + "manager-assets/support-services-dark.webp",
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

// ----------------------------------------------------
// Cairo Airfield Weather & METAR Data
// ----------------------------------------------------
export type MetarData = {
  station: string;
  airportName: LocalizedText;
  raw: string;
  observedAt: string;
  windDirectionDeg: number;
  windSpeedKt: number;
  windGustKt?: number;
  tempC: number;
  dewPointC: number;
  qnhHpa: number;
  visibilityKm: number;
  flightCategory: "VFR" | "MVFR" | "IFR" | "LIFR";
  activeRunways: {
    arrival: string;
    departure: string;
  };
  condition: LocalizedText;
};

export const hecaMetarBaseline: MetarData = {
  station: "HECA",
  airportName: { en: "Cairo International Airport", ar: "مطار القاهرة الدولي" },
  raw: "HECA 041900Z 04011KT CAVOK 32/16 Q1014 NOSIG",
  observedAt: "19:00 UTC",
  windDirectionDeg: 40,
  windSpeedKt: 11,
  tempC: 32,
  dewPointC: 16,
  qnhHpa: 1014,
  visibilityKm: 10,
  flightCategory: "VFR",
  activeRunways: {
    arrival: "05L / 05C",
    departure: "05C / 23C",
  },
  condition: { en: "Clear & CAVOK", ar: "صحو ورؤية ممتازة" },
};

// ----------------------------------------------------
// Shift Wave Time Windows
// ----------------------------------------------------
export type ShiftWaveId = "all" | "morning" | "midday" | "night";

export interface ShiftWave {
  id: ShiftWaveId;
  label: LocalizedText;
  window: string;
  description: LocalizedText;
  benchmarkMovement: number;
  benchmarkPassengers: string;
}

export const shiftWaves: ShiftWave[] = [
  {
    id: "all",
    label: { en: "All Waves (24h)", ar: "كامل اليوم (٢٤ س)" },
    window: "00:00 - 24:00",
    description: { en: "Full 24-hour operational cycle across all terminals", ar: "دورة العمليات الكاملة على مدار ٢٤ ساعة لجميع المباني" },
    benchmarkMovement: 540,
    benchmarkPassengers: "85k",
  },
  {
    id: "morning",
    label: { en: "Morning Wave", ar: "فترة الصباح" },
    window: "06:00 - 14:00",
    description: { en: "European & domestic arrivals / early business departures", ar: "رحلات الوصول الأوروبية والداخلية ومغادرة رحلات الأعمال" },
    benchmarkMovement: 195,
    benchmarkPassengers: "32k",
  },
  {
    id: "midday",
    label: { en: "Midday Peak", ar: "ذروة الظهيرة" },
    window: "14:00 - 22:00",
    description: { en: "Gulf regional banks and high-density passenger influx", ar: "رحلات الخليج الإقليمية وتدفق كثيف للركاب" },
    benchmarkMovement: 240,
    benchmarkPassengers: "38k",
  },
  {
    id: "night",
    label: { en: "Night Wave", ar: "فترة الليل" },
    window: "22:00 - 06:00",
    description: { en: "Long-haul African/Asian departures and cargo operations", ar: "الرحلات الطويلة لأفريقيا وآسيا وعمليات الشحن الجوي" },
    benchmarkMovement: 105,
    benchmarkPassengers: "15k",
  },
];

// ----------------------------------------------------
// Emergency Scenario Drills ("What-If" Sandbox)
// ----------------------------------------------------
export type ScenarioId = "baseline" | "sandstorm" | "baggage-failure";

export interface InjectedDirective {
  title: string;
  outcome: string;
  badge: string;
  badgeTone: Tone;
  controlText: string;
  controlBadge: string;
  controlTone: Tone;
}

export interface DrillScenario {
  id: ScenarioId;
  title: LocalizedText;
  badge: LocalizedText;
  tone: Tone;
  summary: LocalizedText;
  metarOverride?: Partial<MetarData>;
  kpiOverrides?: {
    avgTaxiOut?: string;
    activeAlerts?: string;
    deltaTone?: Tone;
  };
  injectedDirectives: InjectedDirective[];
}

export const drillScenarios: DrillScenario[] = [
  {
    id: "baseline",
    title: { en: "Normal Operations (Live)", ar: "العمليات العادية (مباشر)" },
    badge: { en: "Nominal", ar: "طبيعي" },
    tone: "ok",
    summary: { en: "Standard airfield and terminal flow under nominal weather conditions.", ar: "انسيابية حركة الساحات والمباني وفق المعدلات القياسية والطقس المستقر." },
    injectedDirectives: [],
  },
  {
    id: "sandstorm",
    title: { en: "Drill: Sandstorm & Low Visibility Cat II", ar: "محاكاة: عاصفة ترابية وانخفاض الرؤية (Cat II)" },
    badge: { en: "Weather Drill", ar: "محاكاة طقس" },
    tone: "crit",
    summary: { en: "Khamasin desert wind gusting 38kt with visibility dropping to 350m. Low Visibility Operations (LVO) initiated.", ar: "رياح خماسينية ترابية بهبات تصل ٣٨ عقدة وانخفاض الرؤية إلى ٣٥٠م. تفعيل إجراءات الرؤية المنخفضة." },
    metarOverride: {
      raw: "HECA 041900Z 34024G38KT 0350 R05L/0400N SA BKN010 29/11 Q1008 TEMPO 0200 DS",
      windDirectionDeg: 340,
      windSpeedKt: 24,
      windGustKt: 38,
      visibilityKm: 0.35,
      flightCategory: "LIFR",
      condition: { en: "Sandstorm / Cat II LVO", ar: "عاصفة رملية / تدني الرؤية الفئة الثانية" },
      activeRunways: {
        arrival: "05L (ILS Cat II)",
        departure: "05C (LVO Protected)",
      },
    },
    kpiOverrides: {
      avgTaxiOut: "28 min",
      activeAlerts: "8",
      deltaTone: "crit",
    },
    injectedDirectives: [
      {
        title: "Dispatch Runway Friction & Debris Sweeper Teams",
        outcome: "Maintains Cat II braking coefficient",
        badge: "Airfield",
        badgeTone: "crit",
        controlText: "Runway sweeps mandated every 30m during dust storms",
        controlBadge: "LVO SOP-4",
        controlTone: "warn",
      },
      {
        title: "Activate Low Visibility Holding Points",
        outcome: "Protects ILS localizer sensitive areas",
        badge: "ATC / Safety",
        badgeTone: "crit",
        controlText: "Aircraft held at CAT II stopbars; separation increased to 8NM",
        controlBadge: "ILS Protected",
        controlTone: "info",
      },
    ],
  },
  {
    id: "baggage-failure",
    title: { en: "Drill: Terminal 3 Sortation Line Stoppage", ar: "محاكاة: توقف نظام سيور الفرز بمبنى الركاب ٣" },
    badge: { en: "Terminal Drill", ar: "محاكاة مباني" },
    tone: "warn",
    summary: { en: "Mechanical fault on transfer loop B causing baggage congestion across T3 international check-in rows.", ar: "عطل ميكانيكي بحلقة فرز الحقائب ب يؤدي لاختناق منصات إنهاء إجراءات السفر الدولية بمبنى ٣." },
    kpiOverrides: {
      avgTaxiOut: "19 min",
      activeAlerts: "5",
      deltaTone: "warn",
    },
    injectedDirectives: [
      {
        title: "Deploy Manual Baggage Tug Surge Crew",
        outcome: "Prevents flight departure hold delays",
        badge: "Ground Ops",
        badgeTone: "warn",
        controlText: "Manual sortation contingency protocol activated at T3 basement",
        controlBadge: "SOP Contingency",
        controlTone: "info",
      },
    ],
  },
];

// ----------------------------------------------------
// Workforce & Staffing Datasets
// ----------------------------------------------------
export const staffingShiftWaves: StaffingShiftWave[] = [
  {
    id: "morning",
    name: { en: "Morning Wave (Early Departures)", ar: "موجة الصباح الباكر (ذروة المغادرة)" },
    hours: "06:00 - 14:00",
    flightLoad: 58,
    requiredStaff: 340,
    allocatedStaff: 355,
    coverageRatio: 1.04,
    statusTone: "ok",
    leadManager: { en: "Capt. Hazem Radwan", ar: "كابتن حازم رضوان" },
    leadCallsign: "RAMP-DIR-1",
  },
  {
    id: "midday",
    name: { en: "Midday Surge (Peak Turnarounds)", ar: "ذروة الظهيرة (أعلى كثافة دوران)" },
    hours: "14:00 - 22:00",
    flightLoad: 86,
    requiredStaff: 510,
    allocatedStaff: 442,
    coverageRatio: 0.87,
    statusTone: "warn",
    leadManager: { en: "Eng. Ahmed El-Saeed", ar: "م. أحمد السعيد" },
    leadCallsign: "OPS-LEAD-3",
  },
  {
    id: "night",
    name: { en: "Night Operations (Cargo & Intercontinental)", ar: "عمليات الليل (الشحن والرحلات العابرة)" },
    hours: "22:00 - 06:00",
    flightLoad: 32,
    requiredStaff: 230,
    allocatedStaff: 245,
    coverageRatio: 1.07,
    statusTone: "ok",
    leadManager: { en: "Tarek El-Shennawy", ar: "طارق الشناوي" },
    leadCallsign: "NIGHT-SUPER-2",
  },
];

export const surgeCrewUnits: SurgeCrewUnit[] = [
  {
    id: "SURGE-ALPHA",
    title: { en: "T2 Security Fast-Response Detail", ar: "سرية تعزيز التفتيش الأمني بمبنى 2" },
    targetZone: "SECURITY",
    targetZoneLabel: { en: "Terminal 2 Central Screening", ar: "التفتيش المركزي بمبنى 2" },
    headcount: 8,
    dispatchEtaMin: 2,
    status: "ready",
    leadCallsign: "SEC-LEAD-2",
    description: { en: "Quick-deploy checkpoint screeners to open secondary lanes during passenger queue spikes.", ar: "عناصر تفتيش سريعة لفتح مسارات فحص إضافية فور حدوث تكدس في طوابير المسافرين." },
  },
  {
    id: "SURGE-BRAVO",
    title: { en: "Airside Stand Turnaround Accelerators", ar: "فرقة تسريع دوران الطائرات بالمهابط" },
    targetZone: "RAMP",
    targetZoneLabel: { en: "Remote Apron Stands 20-38", ar: "المواقف البعيدة بالساحة 20-38" },
    headcount: 12,
    dispatchEtaMin: 4,
    status: "ready",
    leadCallsign: "APRON-RUNNER",
    description: { en: "Mobile ground handling marshals to assist delayed narrow-body turnarounds.", ar: "موجهون وفنيو ساحة متنقلون لمساعدة رحلات الترانزيت المضغوطة لتفادي تأخر الإقلاع." },
  },
  {
    id: "SURGE-CHARLIE",
    title: { en: "T3 Baggage Sortation Jam Contingency Unit", ar: "فريق التدخل لطوارئ سيور أمتعة مبنى 3" },
    targetZone: "BAGGAGE",
    targetZoneLabel: { en: "T3 Subterranean Sortation Loop", ar: "قبو فرز أمتعة مبنى 3" },
    headcount: 10,
    dispatchEtaMin: 3,
    status: "ready",
    leadCallsign: "TUG-SUPV-4",
    description: { en: "Manual tug handling operators trained in bypass routing if automated loops fail.", ar: "مشغلو جرارات وسحب يدوي مدربون على مسارات التحويل البديلة عند تعطل السيور الآلية." },
  },
  {
    id: "SURGE-DELTA",
    title: { en: "Falcon 7 ARFF Airside Rescue Rapid Detail", ar: "وحدة الإطفاء والإنقاذ الجوي - صقر 7" },
    targetZone: "ARFF",
    targetZoneLabel: { en: "Runway 05C Rapid Intervention", ar: "التدخل السريع بمدرج 05C" },
    headcount: 6,
    dispatchEtaMin: 1,
    status: "ready",
    leadCallsign: "RESCUE-7-CMD",
    description: { en: "Category 9 crash-fire-rescue heavy tender crew on 60-second hot standby.", ar: "طاقم مركبات التدخل السريع لمكافحة حرائق الطائرات فئة 9 في حالة استعداد قصوى (60 ثانية)." },
  },
];

export const staffMembers: StaffMember[] = [
  {
    id: "STF-101",
    name: { en: "Eng. Ahmed El-Saeed", ar: "م. أحمد السعيد" },
    role: "ramp_controller",
    roleTitle: { en: "Airside Operations Duty Chief", ar: "كبير مديري عمليات ساحة الطيران" },
    zone: "RAMP",
    zoneLabel: { en: "Airside Apron Control", ar: "برج مراقبة ساحة الطائرات" },
    shiftWave: "midday",
    callsign: "RAMP-ALPHA-1",
    radioChannel: "121.900 MHz",
    status: "on_duty",
    icaoCertValidUntil: "2027-02-28",
    badgeType: { en: "ICAO Annex 14 Apron Controller Class 1", ar: "ترخيص إيكاو ملحق 14 لمراقبي الساحة - فئة 1" },
    certStatus: "valid",
    daysToCertExpiry: 541,
    safetyDaysZeroIncidents: 620,
    phoneExt: "+20 (2) 2265-4101",
  },
  {
    id: "STF-102",
    name: { en: "Capt. Hazem Radwan", ar: "كابتن حازم رضوان" },
    role: "ramp_controller",
    roleTitle: { en: "Senior Ramp Coordinator", ar: "منسق أول لعمليات المهابط" },
    zone: "RAMP",
    zoneLabel: { en: "North Apron Sector 1", ar: "القطاع الشمالي للمهابط 1" },
    shiftWave: "morning",
    callsign: "RAMP-DIR-1",
    radioChannel: "121.900 MHz",
    status: "on_duty",
    icaoCertValidUntil: "2026-11-15",
    badgeType: { en: "ICAO Annex 14 Airside Driving (Runway/Taxiway)", ar: "ترخيص قيادة بساحة الطيران والمدرج (إيكاو)" },
    certStatus: "valid",
    daysToCertExpiry: 71,
    safetyDaysZeroIncidents: 410,
    phoneExt: "+20 (2) 2265-4102",
  },
  {
    id: "STF-103",
    name: { en: "Mona Zahran", ar: "أ. منى زهران" },
    role: "security_lead",
    roleTitle: { en: "T2 Aviation Security Lead", ar: "مشرف التفتيش الأمني بمبنى 2" },
    zone: "SECURITY",
    zoneLabel: { en: "Terminal 2 Concourse B", ar: "صالة المغادرة ب بمبنى 2" },
    shiftWave: "midday",
    callsign: "SEC-LEAD-2",
    radioChannel: "TETRA SEC-02",
    status: "on_duty",
    icaoCertValidUntil: "2026-09-22",
    badgeType: { en: "ICAO Annex 17 Aviation Security Supervisor", ar: "ترخيص أمن الطيران المدني ملحق 17 - إشرافي" },
    certStatus: "expiring_soon",
    daysToCertExpiry: 17,
    safetyDaysZeroIncidents: 890,
    phoneExt: "+20 (2) 2265-4201",
  },
  {
    id: "STF-104",
    name: { en: "Mahmoud Soliman", ar: "محمود سليمان" },
    role: "airside_marshal",
    roleTitle: { en: "Lead Aircraft Marshaller", ar: "كبير موجهي الطائرات" },
    zone: "RAMP",
    zoneLabel: { en: "Remote Stands 31-40", ar: "المواقف البعيدة 31-40" },
    shiftWave: "midday",
    callsign: "MARSHAL-7",
    radioChannel: "121.900 MHz",
    status: "on_duty",
    icaoCertValidUntil: "2026-10-05",
    badgeType: { en: "ICAO Annex 14 Visual Docking & Marshalling", ar: "ترخيص إرشاد وتوجيه الطائرات البصري" },
    certStatus: "expiring_soon",
    daysToCertExpiry: 30,
    safetyDaysZeroIncidents: 340,
    phoneExt: "+20 (2) 2265-4115",
  },
  {
    id: "STF-105",
    name: { en: "Tarek El-Shennawy", ar: "طارق الشناوي" },
    role: "terminal_manager",
    roleTitle: { en: "Terminal 3 Duty Operations Manager", ar: "مدير مناوب مبنى الركاب 3" },
    zone: "T3",
    zoneLabel: { en: "Terminal 3 Hall 4 & Pier F", ar: "مبنى 3 - الصالة 4 ورصيف F" },
    shiftWave: "midday",
    callsign: "T3-DIRECTOR",
    radioChannel: "TETRA OPS-01",
    status: "on_duty",
    icaoCertValidUntil: "2027-06-15",
    badgeType: { en: "Crisis Management & Terminal Flow Control", ar: "إدارة الأزمات والتحكم بتدفق المسافرين" },
    certStatus: "valid",
    daysToCertExpiry: 648,
    safetyDaysZeroIncidents: 730,
    phoneExt: "+20 (2) 2265-4301",
  },
  {
    id: "STF-106",
    name: { en: "Yasser Abdel-Rahman", ar: "ياسر عبد الرحمن" },
    role: "baggage_ops",
    roleTitle: { en: "Baggage Handling Operations Lead", ar: "مسؤول عمليات ساحة الأمتعة المركزية" },
    zone: "BAGGAGE",
    zoneLabel: { en: "T3 Subterranean Matrix", ar: "قبو سيور الأمتعة بمبنى 3" },
    shiftWave: "midday",
    callsign: "TUG-SUPV-4",
    radioChannel: "TETRA BAGG-3",
    status: "on_duty",
    icaoCertValidUntil: "2026-12-31",
    badgeType: { en: "Airside Tug & Heavy Cargo Handling", ar: "ترخيص قيادة جرارات الأمتعة ومعدات الشحن" },
    certStatus: "valid",
    daysToCertExpiry: 117,
    safetyDaysZeroIncidents: 490,
    phoneExt: "+20 (2) 2265-4402",
  },
  {
    id: "STF-107",
    name: { en: "Major Sherif Fahmy", ar: "رائد شريف فهمي" },
    role: "arff_paramedic",
    roleTitle: { en: "ARFF Crash-Fire-Rescue Commander", ar: "قائد عمليات الإنقاذ والإطفاء الجوي" },
    zone: "ARFF",
    zoneLabel: { en: "Station 7 Falcon Base", ar: "محطة إطفاء 7 - قاعدة الصقر" },
    shiftWave: "midday",
    callsign: "RESCUE-7-CMD",
    radioChannel: "121.600 MHz (ARFF)",
    status: "on_duty",
    icaoCertValidUntil: "2027-01-20",
    badgeType: { en: "ICAO Doc 9137 Cat 9 Rescue Fire Fighter", ar: "ترخيص مكافحة حرائق الطائرات والإنقاذ فئة 9" },
    certStatus: "valid",
    daysToCertExpiry: 502,
    safetyDaysZeroIncidents: 1250,
    phoneExt: "+20 (2) 2265-4911",
  },
  {
    id: "STF-108",
    name: { en: "Heba El-Gammal", ar: "هبة الجمال" },
    role: "customs_coord",
    roleTitle: { en: "Passport & Border Control Liaison", ar: "منسق تدفق الجوازات والرقابة الحدودية" },
    zone: "T2",
    zoneLabel: { en: "T2 Arrival Immigration Hall", ar: "صالة وصول الجوازات بمبنى 2" },
    shiftWave: "midday",
    callsign: "IMMIG-COORD-1",
    radioChannel: "TETRA IMM-01",
    status: "on_duty",
    icaoCertValidUntil: "2026-09-18",
    badgeType: { en: "Automated Border Control & E-Gates Security", ar: "ترخيص تشغيل ومراقبة البوابات الإلكترونية" },
    certStatus: "expiring_soon",
    daysToCertExpiry: 13,
    safetyDaysZeroIncidents: 560,
    phoneExt: "+20 (2) 2265-4250",
  },
  {
    id: "STF-109",
    name: { en: "Ossama Nabil", ar: "أسامة نبيل" },
    role: "terminal_manager",
    roleTitle: { en: "Terminal 1 Operations Supervisor", ar: "مشرف عمليات مبنى الركاب 1" },
    zone: "T1",
    zoneLabel: { en: "Terminal 1 Hall 2 Departures", ar: "مبنى 1 - صالة سفر 2" },
    shiftWave: "morning",
    callsign: "T1-SUPER-1",
    radioChannel: "TETRA OPS-02",
    status: "break",
    icaoCertValidUntil: "2027-04-10",
    badgeType: { en: "Passenger Terminal Management IATA/ICAO", ar: "ترخيص إدارة وتدفق صالات الركاب IATA/ICAO" },
    certStatus: "valid",
    daysToCertExpiry: 582,
    safetyDaysZeroIncidents: 480,
    phoneExt: "+20 (2) 2265-4155",
  },
  {
    id: "STF-110",
    name: { en: "Nouran Mansour", ar: "نوران منصور" },
    role: "security_lead",
    roleTitle: { en: "Hold Baggage X-Ray Screening Inspector", ar: "مفتش أول أشعة كشف أمتعة الشحن" },
    zone: "SECURITY",
    zoneLabel: { en: "T3 In-line Security Basement", ar: "فحص الأمتعة الآلي بمبنى 3" },
    shiftWave: "midday",
    callsign: "SEC-XRAY-4",
    radioChannel: "TETRA SEC-03",
    status: "on_duty",
    icaoCertValidUntil: "2027-03-14",
    badgeType: { en: "ICAO Screener Certification TIP Level 3", ar: "ترخيص فحص الأمتعة بالأشعة المتقدمة - مستوى 3" },
    certStatus: "valid",
    daysToCertExpiry: 555,
    safetyDaysZeroIncidents: 910,
    phoneExt: "+20 (2) 2265-4388",
  },
  {
    id: "STF-111",
    name: { en: "Karim Wafiq", ar: "كريم وفيق" },
    role: "airside_marshal",
    roleTitle: { en: "Apron FOD & Safety Inspector", ar: "مفتش السلامة والأجسام الغريبة بالمهابط" },
    zone: "RAMP",
    zoneLabel: { en: "Taxiway Sierra & Juliet", ar: "ممرات التحرك سييرا وجولييت" },
    shiftWave: "night",
    callsign: "SAFETY-SWEEP-2",
    radioChannel: "121.900 MHz",
    status: "standby",
    icaoCertValidUntil: "2026-08-30",
    badgeType: { en: "ICAO Annex 14 FOD Prevention & Runway Safety", ar: "ترخيص إيكاو لمنع الأجسام الغريبة وتفتيش المدارج" },
    certStatus: "expired",
    daysToCertExpiry: -6,
    safetyDaysZeroIncidents: 210,
    phoneExt: "+20 (2) 2265-4180",
  },
  {
    id: "STF-112",
    name: { en: "Amr El-Gohary", ar: "عمرو الجوهري" },
    role: "baggage_ops",
    roleTitle: { en: "Ramp Cargo Loadmaster", ar: "ضابط حمولة وشحن الطائرات" },
    zone: "RAMP",
    zoneLabel: { en: "Wide-Body Stands 11-18", ar: "مواقف الطائرات العريضة 11-18" },
    shiftWave: "midday",
    callsign: "LOADMASTER-3",
    radioChannel: "121.900 MHz",
    status: "on_duty",
    icaoCertValidUntil: "2026-10-25",
    badgeType: { en: "IATA Dangerous Goods & Weight & Balance", ar: "ترخيص الأوزان والتوازن ونقل المواد الخطرة" },
    certStatus: "valid",
    daysToCertExpiry: 50,
    safetyDaysZeroIncidents: 680,
    phoneExt: "+20 (2) 2265-4192",
  },
];

