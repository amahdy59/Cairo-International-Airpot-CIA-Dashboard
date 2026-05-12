import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Accessibility,
  Activity,
  AlertTriangle,
  BadgeInfo,
  Briefcase,
  Building2,
  Car,
  Clock,
  Coffee,
  Contrast,
  Droplets,
  ExternalLink,
  Flame,
  HardHat,
  Languages,
  Luggage,
  MapPin,
  Navigation,
  ParkingSquare,
  Phone,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Radio,
  ShieldCheck,
  Train,
  Users,
} from "lucide-react";
import { AirportMap2D, type Language } from "@/components/command-center/AirportMap2D";
import { MetricCard, ProgressBar, SectionPanel, Sparkline, StatusPill } from "@/components/command-center/MetricWidgets";

type Mode = "traveler" | "manager";
type TravelerTab = "explore" | "directions" | "services";
type ManagerTab = "operations" | "safety";
type Tone = "ok" | "info" | "warn" | "high" | "crit";

const copy = {
  en: {
    skip: "Skip to content",
    brand: "CAI Command Hub",
    traveler: "Traveler",
    manager: "Manager",
    highContrast: "High contrast",
    toggleLanguage: "Switch language",
    footer: "Cairo International Airport - Operated by Cairo Airport Company - IATA: CAI - ICAO: HECA",
    travelerHero: {
      eyebrow: "Passenger view",
      title: "Navigate Cairo Airport with fewer clicks",
      description: "Explore five clickable airport views, switch service layers on the image, get directions inside the page and open terminal details only when you need them.",
    },
    managerHero: {
      eyebrow: "Manager view",
      title: "Operations and safety overview",
      description: "A focused management surface for live flow, flight movement, safety checks and maintenance attention.",
    },
    tabs: {
      explore: "Explore",
      directions: "Directions",
      services: "Services",
      operations: "Operations",
      safety: "Safety",
    },
    terminals: "Terminal quick facts",
    passengerLinks: "Passenger links",
    directions: "Directions",
    from: "From",
    fromPlaceholder: "e.g. Minya, Egypt",
    myLocation: "My location",
    toTerminal: "To terminal",
    travelMode: "Travel mode",
    openRoute: "Open route",
    mapPreview: "Embedded Google map",
    routeTipTitle: "Tip - pick the right terminal",
    routeTip: "EgyptAir and Star Alliance with EgyptAir use T3. Many international partners use T2. Domestic, regional and charter flights often use T1 or the seasonal terminal.",
    passengerFlow: "Passenger flow",
    safetyChecks: "Safety checks",
    liveArrivals: "Live arrivals",
    liveDepartures: "Live departures",
    parkingGates: "Parking and gates",
    recentMaintenance: "Recent aircraft maintenance",
    attentionAircraft: "Aircraft requiring attention",
    nextHour: "Next 60 min",
    sortedRisk: "30-day risk score",
    flight: "Flight",
    fromCol: "From",
    toCol: "To",
    time: "Time",
    gate: "Gate",
    status: "Status",
    ac: "A/C",
    task: "Task",
    date: "Date",
    dur: "Dur",
    registration: "Registration",
    type: "Type",
    events: "Events",
    mtbf: "MTBF",
    risk: "Risk",
  },
  ar: {
    skip: "تخطي إلى المحتوى",
    brand: "مركز قيادة مطار القاهرة",
    traveler: "المسافر",
    manager: "المدير",
    highContrast: "تباين عال",
    toggleLanguage: "تغيير اللغة",
    footer: "مطار القاهرة الدولي - تديره شركة ميناء القاهرة الجوي - IATA: CAI - ICAO: HECA",
    travelerHero: {
      eyebrow: "عرض المسافر",
      title: "تنقل في مطار القاهرة بخطوات أقل",
      description: "استكشف خمس صور تفاعلية للمطار، وأظهر طبقات الخدمات على الصورة، واحصل على الاتجاهات داخل الصفحة، وافتح تفاصيل المبنى عند الحاجة فقط.",
    },
    managerHero: {
      eyebrow: "عرض المدير",
      title: "نظرة تشغيلية وسلامة مركزة",
      description: "واجهة إدارية مختصرة لمتابعة تدفق الركاب وحركة الرحلات وفحوص السلامة والصيانة.",
    },
    tabs: {
      explore: "استكشاف",
      directions: "الاتجاهات",
      services: "الخدمات",
      operations: "التشغيل",
      safety: "السلامة",
    },
    terminals: "معلومات سريعة عن المباني",
    passengerLinks: "روابط المسافر",
    directions: "الاتجاهات",
    from: "من",
    fromPlaceholder: "مثال: المنيا، مصر",
    myLocation: "موقعي",
    toTerminal: "إلى المبنى",
    travelMode: "وسيلة التنقل",
    openRoute: "فتح المسار",
    mapPreview: "خريطة Google مدمجة",
    routeTipTitle: "نصيحة - اختر المبنى الصحيح",
    routeTip: "مصر للطيران وشركاؤها في تحالف ستار يستخدمون غالبا مبنى 3. كثير من الشركاء الدوليين يستخدمون مبنى 2. الرحلات الداخلية والإقليمية والعارضة غالبا في مبنى 1 أو المبنى الموسمي.",
    passengerFlow: "تدفق الركاب",
    safetyChecks: "فحوص السلامة",
    liveArrivals: "الوصول المباشر",
    liveDepartures: "المغادرة المباشرة",
    parkingGates: "المواقف والبوابات",
    recentMaintenance: "صيانة الطائرات الأخيرة",
    attentionAircraft: "طائرات تحتاج إلى متابعة",
    nextHour: "الساعة القادمة",
    sortedRisk: "مؤشر مخاطر 30 يوما",
    flight: "الرحلة",
    fromCol: "من",
    toCol: "إلى",
    time: "الوقت",
    gate: "البوابة",
    status: "الحالة",
    ac: "الطائرة",
    task: "المهمة",
    date: "التاريخ",
    dur: "المدة",
    registration: "التسجيل",
    type: "النوع",
    events: "الأحداث",
    mtbf: "MTBF",
    risk: "المخاطر",
  },
} as const;

const TERMINALS = [
  {
    code: "T1",
    color: "oklch(0.78 0.15 150)",
    name: { en: "Terminal 1", ar: "مبنى 1" },
    summary: { en: "Domestic, regional and selected international operations", ar: "رحلات داخلية وإقليمية وبعض الرحلات الدولية" },
    halls: { en: "Hall 1 - Hall 2 - Hall 3", ar: "صالة 1 - صالة 2 - صالة 3" },
    airlines: ["Air Arabia Egypt", "Nile Air", "Flynas", "Domestic carriers"],
  },
  {
    code: "T2",
    color: "oklch(0.82 0.15 210)",
    name: { en: "Terminal 2", ar: "مبنى 2" },
    summary: { en: "Renovated international terminal connected to Terminal 3", ar: "مبنى دولي مطور ومتصل بمبنى 3" },
    halls: { en: "International concourse", ar: "ممر الرحلات الدولية" },
    airlines: ["Emirates", "British Airways", "Air France", "Qatar Airways"],
  },
  {
    code: "T3",
    color: "oklch(0.72 0.20 330)",
    name: { en: "Terminal 3", ar: "مبنى 3" },
    summary: { en: "EgyptAir hub and largest passenger terminal", ar: "مركز مصر للطيران وأكبر مباني الركاب" },
    halls: { en: "Main concourse and pier", ar: "الممر الرئيسي ورصيف البوابات" },
    airlines: ["EgyptAir", "Star Alliance partners", "Turkish Airlines"],
  },
] as const;

const QUICK_LINKS = [
  { icon: Plane, label: { en: "Book a flight", ar: "حجز رحلة" }, desc: { en: "EgyptAir official booking", ar: "الحجز الرسمي لمصر للطيران" }, href: "https://www.egyptair.com/" },
  { icon: ShieldCheck, label: { en: "Check-in / Manage", ar: "تسجيل / إدارة الحجز" }, desc: { en: "Online check-in and ticket confirmation", ar: "تسجيل السفر وتأكيد التذكرة" }, href: "https://www.egyptair.com/en/Pages/managemybooking.aspx" },
  { icon: Building2, label: { en: "Visa info", ar: "معلومات التأشيرة" }, desc: { en: "Visa on arrival and e-visa", ar: "تأشيرة الوصول والتأشيرة الإلكترونية" }, href: "https://visa2egypt.gov.eg/" },
  { icon: Luggage, label: { en: "Lost and found", ar: "المفقودات" }, desc: { en: "Report lost baggage", ar: "الإبلاغ عن الحقائب المفقودة" }, href: "https://cairo-airport.com/" },
  { icon: Phone, label: { en: "Airport contact", ar: "اتصال بالمطار" }, desc: { en: "+20 2 2696 6300", ar: "+20 2 2696 6300" }, href: "tel:+20226966300" },
  { icon: Accessibility, label: { en: "Special assistance", ar: "مساعدة خاصة" }, desc: { en: "Ahlan Meet and Assist", ar: "خدمة أهلا للاستقبال والمساعدة" }, href: "https://cairo-airport.com/" },
  { icon: Coffee, label: { en: "Lounges and shops", ar: "الصالات والمتاجر" }, desc: { en: "Duty free, restaurants and lounges", ar: "السوق الحرة والمطاعم والصالات" }, href: "https://www.cairo-airport.com/en-us/Airport/Airport-Services-Facilities" },
] as const;

const TERMINAL_DESTINATIONS = [
  { id: "T1", label: { en: "Terminal 1", ar: "مبنى 1" }, query: "Cairo International Airport Terminal 1" },
  { id: "T2", label: { en: "Terminal 2", ar: "مبنى 2" }, query: "Cairo International Airport Terminal 2" },
  { id: "T3", label: { en: "Terminal 3", ar: "مبنى 3" }, query: "Cairo International Airport Terminal 3" },
  { id: "ST", label: { en: "Seasonal / Hajj Terminal", ar: "المبنى الموسمي / الحج" }, query: "Cairo International Airport Seasonal Terminal" },
] as const;

const TRAVEL_MODES = [
  { id: "driving", label: { en: "Driving", ar: "سيارة" }, icon: Car },
  { id: "transit", label: { en: "Transit", ar: "مواصلات" }, icon: Train },
  { id: "walking", label: { en: "Walking", ar: "مشي" }, icon: Navigation },
] as const;

const ARRIVALS = [
  { flight: "MS738", city: "Frankfurt (FRA)", time: "11:42", status: { en: "On time", ar: "في الموعد" }, tone: "ok" as Tone, terminal: "T3", gate: "F7" },
  { flight: "TK694", city: "Istanbul (IST)", time: "11:55", status: { en: "Landing", ar: "تهبط الآن" }, tone: "info" as Tone, terminal: "T2", gate: "B12" },
  { flight: "EK927", city: "Dubai (DXB)", time: "12:08", status: { en: "Delayed +18m", ar: "متأخرة 18د" }, tone: "warn" as Tone, terminal: "T2", gate: "B04" },
  { flight: "MS841", city: "Jeddah (JED)", time: "12:20", status: { en: "On time", ar: "في الموعد" }, tone: "ok" as Tone, terminal: "T3", gate: "F2" },
] as const;

const DEPARTURES = [
  { flight: "MS777", city: "London (LHR)", time: "11:50", status: { en: "Boarding", ar: "صعود" }, tone: "info" as Tone, terminal: "T3", gate: "F11" },
  { flight: "SV302", city: "Riyadh (RUH)", time: "12:05", status: { en: "On time", ar: "في الموعد" }, tone: "ok" as Tone, terminal: "T1", gate: "1-A" },
  { flight: "AF551", city: "Paris (CDG)", time: "12:15", status: { en: "On time", ar: "في الموعد" }, tone: "ok" as Tone, terminal: "T2", gate: "B07" },
  { flight: "MS717", city: "Luxor (LXR)", time: "12:30", status: { en: "Final call", ar: "النداء الأخير" }, tone: "warn" as Tone, terminal: "T1", gate: "3-D" },
] as const;

const SAFETY_CHECKS = [
  { icon: Flame, label: { en: "Fire suppression - T1/T2/T3", ar: "إطفاء الحريق - مباني 1/2/3" }, status: { en: "Operational", ar: "يعمل" }, tone: "ok" as Tone, last: { en: "Inspected 2h ago", ar: "فحص قبل ساعتين" } },
  { icon: Droplets, label: { en: "Runway water response", ar: "استجابة مياه المدرج" }, status: { en: "Standby", ar: "جاهز" }, tone: "info" as Tone, last: { en: "Last drill 6 days ago", ar: "آخر تدريب قبل 6 أيام" } },
  { icon: Radio, label: { en: "ATC backup comms", ar: "اتصالات احتياطية للبرج" }, status: { en: "Operational", ar: "يعمل" }, tone: "ok" as Tone, last: { en: "Heartbeat OK", ar: "الاتصال مستقر" } },
  { icon: HardHat, label: { en: "Apron worker PPE compliance", ar: "التزام معدات الوقاية في الساحة" }, status: { en: "98% compliant", ar: "98% ملتزم" }, tone: "ok" as Tone, last: { en: "12 audits today", ar: "12 مراجعة اليوم" } },
  { icon: ShieldCheck, label: { en: "Security checkpoint scanners", ar: "ماسحات نقاط الأمن" }, status: { en: "1 offline (T2-B)", ar: "وحدة متوقفة (T2-B)" }, tone: "warn" as Tone, last: { en: "Tech dispatched", ar: "تم إرسال الفني" } },
] as const;

const RECENT_MAINTENANCE = [
  { reg: "SU-GDR", type: "B777-300ER", airline: "EgyptAir", task: { en: "A-check completed", ar: "اكتمل فحص A" }, date: "12 May 2026", duration: "32h", status: { en: "Released", ar: "جاهزة" }, tone: "ok" as Tone },
  { reg: "SU-GEU", type: "B787-9", airline: "EgyptAir", task: { en: "Engine #2 borescope", ar: "فحص منظار للمحرك 2" }, date: "11 May 2026", duration: "8h", status: { en: "Released", ar: "جاهزة" }, tone: "ok" as Tone },
  { reg: "SU-GCS", type: "A330-300", airline: "EgyptAir", task: { en: "Hydraulic line repair", ar: "إصلاح خط هيدروليك" }, date: "11 May 2026", duration: "14h", status: { en: "Released", ar: "جاهزة" }, tone: "ok" as Tone },
  { reg: "SU-GDM", type: "B737-800", airline: "EgyptAir", task: { en: "Tire and brake change", ar: "تغيير إطار وفرامل" }, date: "10 May 2026", duration: "4h", status: { en: "Released", ar: "جاهزة" }, tone: "ok" as Tone },
  { reg: "SU-GBP", type: "A320", airline: "Air Arabia Egypt", task: { en: "Cabin pressure test", ar: "اختبار ضغط المقصورة" }, date: "10 May 2026", duration: "6h", status: { en: "Awaiting parts", ar: "بانتظار قطع" }, tone: "warn" as Tone },
] as const;

const ATTENTION_AIRCRAFT = [
  { reg: "SU-GBP", type: "A320", events: 7, mtbf: 142, risk: 78, top: "Pressurisation, APU starts" },
  { reg: "SU-GDC", type: "B737-800", events: 6, mtbf: 168, risk: 65, top: "Brake wear, nose gear" },
  { reg: "SU-GCH", type: "A330-200", events: 5, mtbf: 210, risk: 54, top: "Galley power, IFE" },
  { reg: "SU-GEK", type: "B787-9", events: 3, mtbf: 320, risk: 38, top: "Cabin sensors" },
] as const;

export function App() {
  const [mode, setMode] = useState<Mode>(() => (["/ops", "/safety"].includes(window.location.pathname) ? "manager" : "traveler"));
  const [highContrast, setHighContrast] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const c = copy[language];

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.classList.toggle("hc", highContrast);
    root.lang = language;
    root.dir = language === "ar" ? "rtl" : "ltr";
  }, [highContrast, language]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 lg:px-8">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">
            {c.skip}
          </a>
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-primary/40 bg-primary/15 glow-cyan">
              <Plane aria-hidden="true" className="h-4 w-4 text-primary" strokeWidth={2.4} />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate font-mono text-[10px] tracking-[0.22em] text-primary">CAI - CAIRO INTL</p>
              <h1 className="truncate text-sm font-semibold">{c.brand}</h1>
            </div>
          </div>

          <div className="ms-auto flex items-center gap-2">
            <div className="flex items-center rounded-lg border border-border bg-secondary/60 p-0.5" role="group" aria-label="Dashboard mode">
              <ModeButton active={mode === "traveler"} onClick={() => setMode("traveler")} icon={<Users className="h-3.5 w-3.5" />} label={c.traveler} />
              <ModeButton active={mode === "manager"} onClick={() => setMode("manager")} icon={<Briefcase className="h-3.5 w-3.5" />} label={c.manager} />
            </div>
            <IconButton pressed={highContrast} label={c.highContrast} onClick={() => setHighContrast((value) => !value)}>
              <Contrast className="h-4 w-4" />
            </IconButton>
            <button
              type="button"
              onClick={() => setLanguage((value) => (value === "en" ? "ar" : "en"))}
              className="hidden h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs hover:bg-secondary sm:flex"
              aria-label={c.toggleLanguage}
            >
              <Languages aria-hidden="true" className="h-4 w-4 text-primary" />
              <span className="font-mono">{language === "en" ? "AR" : "EN"}</span>
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-[1400px] p-4 lg:p-6">
        {mode === "traveler" ? <TravelerDashboard language={language} /> : <ManagerDashboard language={language} />}
      </main>

      <footer className="border-t border-border px-6 py-4 text-center text-[11px] text-muted-foreground">{c.footer}</footer>
    </div>
  );
}

function ModeButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function IconButton({ pressed, label, onClick, children }: { pressed: boolean; label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-pressed={pressed} aria-label={label} title={label} onClick={onClick} className={`hidden h-9 w-9 place-items-center rounded-md border sm:grid ${pressed ? "border-primary bg-primary/15 text-primary" : "border-border hover:bg-secondary"}`}>
      {children}
    </button>
  );
}

function TravelerDashboard({ language }: { language: Language }) {
  const [tab, setTab] = useState<TravelerTab>("explore");
  const c = copy[language];

  return (
    <div className="space-y-5">
      <Hero eyebrow={c.travelerHero.eyebrow} title={c.travelerHero.title} description={c.travelerHero.description} />
      <Tabs
        ariaLabel="Traveler sections"
        active={tab}
        onChange={(value) => setTab(value as TravelerTab)}
        items={[
          { id: "explore", label: c.tabs.explore, icon: <MapPin className="h-4 w-4" /> },
          { id: "directions", label: c.tabs.directions, icon: <Navigation className="h-4 w-4" /> },
          { id: "services", label: c.tabs.services, icon: <BadgeInfo className="h-4 w-4" /> },
        ]}
      />

      {tab === "explore" && (
        <div className="space-y-5">
          <PassengerTripAssistant language={language} />
          <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <AirportMap2D language={language} />
            <div className="space-y-5">
              <TerminalFacts language={language} />
              <WaitTimePanel language={language} />
            </div>
          </div>
        </div>
      )}
      {tab === "directions" && <DirectionsCard language={language} />}
      {tab === "services" && (
        <div className="space-y-5">
          <ServiceFinder language={language} />
          <PassengerLinks language={language} />
        </div>
      )}
    </div>
  );
}

function PassengerTripAssistant({ language }: { language: Language }) {
  const [flight, setFlight] = useState("MS777");
  const isArabic = language === "ar";
  const steps = [
    { label: isArabic ? "تسجيل السفر" : "Check-in", meta: isArabic ? "T3 - Zone C" : "T3 - Zone C", tone: "ok" as Tone },
    { label: isArabic ? "الجوازات" : "Passport control", meta: isArabic ? "11 دقيقة انتظار" : "11 min wait", tone: "info" as Tone },
    { label: isArabic ? "البوابة F11" : "Gate F11", meta: isArabic ? "9 دقائق مشيا" : "9 min walk", tone: "warn" as Tone },
  ];

  return (
    <SectionPanel title={isArabic ? "رحلتي الآن" : "My trip now"} action={<StatusPill tone="info">{isArabic ? "اقتراح حي" : "Live guidance"}</StatusPill>}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)_260px]">
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{isArabic ? "رقم الرحلة" : "Flight number"}</span>
          <input value={flight} onChange={(event) => setFlight(event.target.value.toUpperCase())} className="mt-1.5 h-11 w-full rounded-md border border-border bg-background px-3 font-mono text-sm outline-none focus:border-primary" aria-label={isArabic ? "رقم الرحلة" : "Flight number"} />
          <p className="mt-2 text-xs text-muted-foreground">{isArabic ? "مصر للطيران - لندن هيثرو - مغادرة 11:50" : "EgyptAir - London Heathrow - departure 11:50"}</p>
        </label>
        <ol className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.label} className="panel-inner p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 font-mono text-xs text-primary">{index + 1}</span>
                <StatusPill tone={step.tone}>{step.meta}</StatusPill>
              </div>
              <p className="mt-3 text-sm font-semibold">{step.label}</p>
            </li>
          ))}
        </ol>
        <div className="panel-inner p-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">{isArabic ? "الإجراء التالي" : "Next best action"}</p>
          <p className="mt-2 text-sm font-semibold">{isArabic ? "اتجه إلى الجوازات الآن" : "Head to passport control now"}</p>
          <p className="mt-1 text-xs text-muted-foreground">{isArabic ? "لديك وقت كاف للقهوة بعد الجوازات، وليس قبلها." : "You have enough time for coffee after passport control, not before it."}</p>
        </div>
      </div>
    </SectionPanel>
  );
}

function WaitTimePanel({ language }: { language: Language }) {
  const isArabic = language === "ar";
  const rows = [
    { label: isArabic ? "تسجيل T3" : "T3 check-in", value: 8, tone: "ok" as Tone },
    { label: isArabic ? "الجوازات" : "Passport", value: 11, tone: "info" as Tone },
    { label: isArabic ? "الأمن" : "Security", value: 17, tone: "warn" as Tone },
    { label: isArabic ? "الأمتعة" : "Baggage", value: 14, tone: "info" as Tone },
  ];

  return (
    <SectionPanel title={isArabic ? "أوقات الانتظار" : "Wait times"} className="h-fit">
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span>{row.label}</span>
              <StatusPill tone={row.tone}>{row.value}m</StatusPill>
            </div>
            <ProgressBar value={row.value} max={25} color={row.tone === "warn" ? "var(--status-warn)" : "var(--cyan)"} />
          </li>
        ))}
      </ul>
    </SectionPanel>
  );
}

function ServiceFinder({ language }: { language: Language }) {
  const isArabic = language === "ar";
  const services = [
    { icon: Coffee, title: isArabic ? "صالة قريبة" : "Nearest lounge", detail: isArabic ? "T3 - بعد الجوازات - 4 دقائق" : "T3 - after passport - 4 min" },
    { icon: Utensils, title: isArabic ? "طعام سريع" : "Quick food", detail: isArabic ? "T3 Food Village - 6 دقائق" : "T3 Food Village - 6 min" },
    { icon: CircleDollarSign, title: isArabic ? "صراف آلي" : "ATM", detail: isArabic ? "قبل الأمن - 2 دقيقة" : "Before security - 2 min" },
    { icon: Accessibility, title: isArabic ? "مساعدة خاصة" : "Assistance", detail: isArabic ? "مكتب أهلا - المدخل الرئيسي" : "Ahlan desk - main entrance" },
  ];

  return (
    <SectionPanel title={isArabic ? "الخدمات الأقرب لك" : "Services near you"}>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {services.map(({ icon: Icon, title, detail }) => (
          <article key={title} className="panel-inner p-4">
            <div className="grid h-10 w-10 place-items-center rounded-md border border-primary/30 bg-primary/10">
              <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
            </div>
            <h3 className="mt-3 text-sm font-semibold">{title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
          </article>
        ))}
      </div>
    </SectionPanel>
  );
}

function TerminalFacts({ language }: { language: Language }) {
  return (
    <SectionPanel title={copy[language].terminals} className="h-fit">
      <div className="space-y-3">
        {TERMINALS.map((terminal) => (
          <article key={terminal.code} className="panel-inner p-4 transition-colors hover:border-primary/40">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-sm font-bold" style={{ background: `color-mix(in oklab, ${terminal.color} 18%, transparent)`, color: terminal.color, border: `1px solid color-mix(in oklab, ${terminal.color} 50%, transparent)` }}>
                {terminal.code}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{terminal.name[language]}</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{terminal.summary[language]}</p>
                <p className="mt-1.5 font-mono text-[11px] text-muted-foreground/80">{terminal.halls[language]}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {terminal.airlines.map((airline) => (
                    <span key={airline} className="rounded border border-border bg-background/60 px-2 py-0.5 font-mono text-[10px]">
                      {airline}
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

function PassengerLinks({ language }: { language: Language }) {
  return (
    <SectionPanel title={copy[language].passengerLinks}>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
        {QUICK_LINKS.map(({ icon: Icon, label, desc, href }) => (
          <a key={label.en} href={href} target="_blank" rel="noreferrer" className="group flex min-h-20 items-start gap-3 panel-inner p-3 transition-colors hover:border-primary/40">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-primary/30 bg-primary/10">
              <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium transition-colors group-hover:text-primary">{label[language]}</h3>
              <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{desc[language]}</p>
            </div>
          </a>
        ))}
      </div>
    </SectionPanel>
  );
}

function DirectionsCard({ language }: { language: Language }) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState(TERMINAL_DESTINATIONS[2].query);
  const [travelMode, setTravelMode] = useState<(typeof TRAVEL_MODES)[number]["id"]>("driving");
  const c = copy[language];
  const selectedMode = TRAVEL_MODES.find((mode) => mode.id === travelMode) ?? TRAVEL_MODES[0];

  const mapsUrl = useMemo(() => {
    const encodedOrigin = encodeURIComponent(origin || "My location");
    const encodedDestination = encodeURIComponent(destination);
    return `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDestination}&travelmode=${travelMode}`;
  }, [destination, origin, travelMode]);

  const embedUrl = useMemo(() => `https://www.google.com/maps?q=${encodeURIComponent(destination)}&output=embed`, [destination]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => setOrigin(`${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`),
      () => setOrigin(""),
    );
  };

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
      <SectionPanel title={c.directions} className="h-fit">
        <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{c.from}</span>
            <span className="mt-1.5 flex gap-2">
              <span className="relative flex-1">
                <MapPin aria-hidden="true" className="absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder={c.fromPlaceholder} className="h-10 w-full rounded-md border border-border bg-background ps-9 pe-3 text-sm outline-none focus:border-primary" />
              </span>
              <button type="button" onClick={useMyLocation} className="h-10 rounded-md border border-border px-3 text-xs hover:bg-secondary">
                {c.myLocation}
              </button>
            </span>
          </label>

          <fieldset>
            <legend className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{c.toTerminal}</legend>
            <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {TERMINAL_DESTINATIONS.map((terminal) => (
                <button key={terminal.id} type="button" onClick={() => setDestination(terminal.query)} aria-pressed={destination === terminal.query} className={`h-10 rounded-md border px-3 text-start text-sm transition-colors ${destination === terminal.query ? "border-primary bg-primary/15 text-primary" : "border-border hover:bg-secondary"}`}>
                  {terminal.label[language]}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{c.travelMode}</legend>
            <div className="mt-1.5 inline-flex rounded-md border border-border bg-secondary/60 p-0.5">
              {TRAVEL_MODES.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" onClick={() => setTravelMode(id)} aria-pressed={travelMode === id} className={`flex h-8 items-center gap-1.5 rounded px-3 text-xs ${travelMode === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                  {label[language]}
                </button>
              ))}
            </div>
          </fieldset>

          <a href={mapsUrl} target="_blank" rel="noreferrer" className="flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90">
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
            {c.openRoute} - {selectedMode.label[language]}
          </a>

          <div className="panel-inner p-3 text-xs text-muted-foreground">
            <strong className="block text-foreground">{c.routeTipTitle}</strong>
            <span>{c.routeTip}</span>
          </div>
        </form>
      </SectionPanel>

      <SectionPanel title={c.mapPreview}>
        <iframe title={c.mapPreview} src={embedUrl} className="h-[420px] w-full rounded-lg border border-border bg-background md:h-[560px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </SectionPanel>
    </div>
  );
}

function ManagerDashboard({ language }: { language: Language }) {
  const [tab, setTab] = useState<ManagerTab>("operations");
  const c = copy[language];

  return (
    <div className="space-y-5">
      <Hero eyebrow={c.managerHero.eyebrow} title={c.managerHero.title} description={c.managerHero.description} />
      <Tabs
        ariaLabel="Manager sections"
        active={tab}
        onChange={(value) => setTab(value as ManagerTab)}
        items={[
          { id: "operations", label: c.tabs.operations, icon: <Activity className="h-4 w-4" /> },
          { id: "safety", label: c.tabs.safety, icon: <ShieldCheck className="h-4 w-4" /> },
        ]}
      />

      {tab === "operations" && (
        <div className="space-y-5">
          <ManagerCommandSummary language={language} />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard label={language === "ar" ? "ركاب اليوم" : "Passengers today"} value="58,420" delta={language === "ar" ? "+4.1% عن أمس" : "+4.1% vs yesterday"} icon={Users} hint={language === "ar" ? "المعيار اليومي 85k" : "Daily benchmark 85k"} />
            <MetricCard label={language === "ar" ? "حركة الطائرات" : "Aircraft movements"} value="412" unit="/ 540" delta={language === "ar" ? "حسب الخطة" : "On schedule"} icon={Activity} />
            <MetricCard label={language === "ar" ? "متوسط خروج المدرج" : "Avg taxi-out"} value="14" unit={language === "ar" ? "د" : "min"} delta={language === "ar" ? "-2 دقيقة" : "-2 min"} icon={Clock} accent="ok" />
            <MetricCard label={language === "ar" ? "تنبيهات نشطة" : "Active alerts"} value="3" delta={language === "ar" ? "2 متوسط، 1 عال" : "2 medium, 1 high"} deltaTone="warn" icon={AlertTriangle} accent="warn" />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_1fr]">
            <SectionPanel title={c.passengerFlow}>
              <Sparkline data={[42, 48, 55, 61, 70, 64, 72, 80, 76, 82, 78, 84]} />
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <FlowZone label={language === "ar" ? "تسجيل" : "Check-in"} percent={62} tone="ok" />
                <FlowZone label={language === "ar" ? "الأمن" : "Security"} percent={84} tone="warn" />
                <FlowZone label={language === "ar" ? "الجوازات" : "Passport"} percent={71} tone="ok" />
              </div>
            </SectionPanel>
            <div className="space-y-5">
              <SectionPanel title={c.liveArrivals} action={<StatusPill tone="info" icon={<PlaneLanding className="h-3 w-3" />}>{c.nextHour}</StatusPill>} dense>
                <FlightTable rows={ARRIVALS} directionLabel={c.fromCol} language={language} />
              </SectionPanel>
              <SectionPanel title={c.liveDepartures} action={<StatusPill tone="info" icon={<PlaneTakeoff className="h-3 w-3" />}>{c.nextHour}</StatusPill>} dense>
                <FlightTable rows={DEPARTURES} directionLabel={c.toCol} language={language} />
              </SectionPanel>
            </div>
          </div>

          <SectionPanel title={c.parkingGates} action={<StatusPill tone="ok" icon={<ParkingSquare className="h-3 w-3" />}>2,180</StatusPill>}>
            <ul className="space-y-2.5 text-sm">
              {[
                { zone: "T3 Pier F", value: 86 },
                { zone: "T2 Pier B", value: 71 },
                { zone: "T1 Halls 1-3", value: 54 },
              ].map((row) => (
                <li key={row.zone}>
                  <div className="flex justify-between text-xs">
                    <span>{row.zone}</span>
                    <span className="font-mono text-muted-foreground">{row.value}%</span>
                  </div>
                  <ProgressBar value={row.value} className="mt-1" color={row.value > 80 ? "var(--status-warn)" : "var(--cyan)"} />
                </li>
              ))}
            </ul>
          </SectionPanel>
        </div>
      )}

      {tab === "safety" && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <DecisionQueue language={language} />
          <SectionPanel title={c.safetyChecks}>
            <ul className="space-y-2">
              {SAFETY_CHECKS.map(({ icon: Icon, label, status, tone, last }) => (
                <li key={label.en} className="flex items-start gap-3 panel-inner p-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-primary/30 bg-primary/10">
                    <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{label[language]}</span>
                      <StatusPill tone={tone}>{status[language]}</StatusPill>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{last[language]}</p>
                  </div>
                </li>
              ))}
            </ul>
          </SectionPanel>
          <SectionPanel title={c.recentMaintenance}>
            <MaintenanceTable language={language} />
          </SectionPanel>
          <SectionPanel title={c.attentionAircraft} action={<span className="font-mono text-[11px] text-muted-foreground">{c.sortedRisk}</span>} className="xl:col-span-2">
            <AttentionTable language={language} />
          </SectionPanel>
        </div>
      )}
    </div>
  );
}

function ManagerCommandSummary({ language }: { language: Language }) {
  const isArabic = language === "ar";
  const items = [
    { title: isArabic ? "طابور الأمن T2" : "T2 security queue", value: "17m", action: isArabic ? "افتح مسار إضافي" : "Open one more lane", tone: "warn" as Tone },
    { title: isArabic ? "صعود بوابة F11" : "Gate F11 boarding", value: "72%", action: isArabic ? "أرسل موظف أرضي" : "Send floor agent", tone: "info" as Tone },
    { title: isArabic ? "ماسح T2-B" : "T2-B scanner", value: "offline", action: isArabic ? "تصعيد للصيانة" : "Escalate maintenance", tone: "crit" as Tone },
  ];

  return (
    <SectionPanel title={isArabic ? "ما يحتاج قرارا الآن" : "Needs a decision now"} action={<StatusPill tone="warn">{isArabic ? "3 عناصر" : "3 items"}</StatusPill>}>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="panel-inner p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">{item.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{item.action}</p>
              </div>
              <StatusPill tone={item.tone}>{item.value}</StatusPill>
            </div>
          </article>
        ))}
      </div>
    </SectionPanel>
  );
}

function DecisionQueue({ language }: { language: Language }) {
  const isArabic = language === "ar";
  const decisions = [
    { title: isArabic ? "إعادة توزيع موظفي الأمن" : "Rebalance security staff", impact: isArabic ? "-4 دقائق انتظار متوقعة" : "-4 min expected wait", owner: isArabic ? "العمليات" : "Ops" },
    { title: isArabic ? "تحويل ركاب F11 إلى مسار أسرع" : "Fast-track F11 passengers", impact: isArabic ? "يحمي موعد الإقلاع" : "Protects departure time", owner: isArabic ? "البوابات" : "Gates" },
    { title: isArabic ? "تأكيد قطع غيار SU-GBP" : "Confirm SU-GBP parts", impact: isArabic ? "يقلل مخاطر الغد" : "Reduces tomorrow risk", owner: isArabic ? "الصيانة" : "Maintenance" },
  ];

  return (
    <SectionPanel title={isArabic ? "توصيات القرار" : "Decision recommendations"}>
      <ul className="space-y-2">
        {decisions.map((decision) => (
          <li key={decision.title} className="panel-inner p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">{decision.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{decision.impact}</p>
              </div>
              <StatusPill tone="neutral">{decision.owner}</StatusPill>
            </div>
          </li>
        ))}
      </ul>
    </SectionPanel>
  );
}

function Tabs({ items, active, onChange, ariaLabel }: { items: { id: string; label: string; icon: ReactNode }[]; active: string; onChange: (id: string) => void; ariaLabel: string }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-secondary/40 p-1" role="tablist" aria-label={ariaLabel}>
      {items.map((item) => (
        <button key={item.id} type="button" role="tab" aria-selected={active === item.id} onClick={() => onChange(item.id)} className={`flex h-10 items-center gap-2 rounded-md px-4 text-sm font-medium transition-colors ${active === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}

function Hero({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="panel p-5 lg:p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight lg:text-3xl">{title}</h2>
      <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">{description}</p>
    </section>
  );
}

function FlightTable({ rows, directionLabel, language }: { rows: typeof ARRIVALS | typeof DEPARTURES; directionLabel: string; language: Language }) {
  const c = copy[language];
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-1 py-1.5 text-start">{c.flight}</th>
            <th className="px-1 py-1.5 text-start">{directionLabel}</th>
            <th className="px-1 py-1.5 text-start">{c.time}</th>
            <th className="px-1 py-1.5 text-start">{c.gate}</th>
            <th className="px-1 py-1.5 text-start">{c.status}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.flight} className="border-t border-border/60">
              <td className="px-1 py-2 font-mono font-medium">{row.flight}</td>
              <td className="px-1 py-2 text-foreground/90">{row.city}</td>
              <td className="px-1 py-2 font-mono">{row.time}</td>
              <td className="px-1 py-2 font-mono text-muted-foreground">{row.terminal}/{row.gate}</td>
              <td className="px-1 py-2"><StatusPill tone={row.tone}>{row.status[language]}</StatusPill></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FlowZone({ label, percent, tone }: { label: string; percent: number; tone: "ok" | "warn" }) {
  return (
    <div className="panel-inner p-2.5">
      <p className="font-mono text-[10px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold">{percent}%</p>
      <ProgressBar value={percent} className="mt-1" color={tone === "warn" ? "var(--status-warn)" : "var(--status-ok)"} />
    </div>
  );
}

function MaintenanceTable({ language }: { language: Language }) {
  const c = copy[language];
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-1 py-1.5 text-start">{c.ac}</th>
            <th className="px-1 py-1.5 text-start">{c.task}</th>
            <th className="px-1 py-1.5 text-start">{c.date}</th>
            <th className="px-1 py-1.5 text-start">{c.dur}</th>
            <th className="px-1 py-1.5 text-start">{c.status}</th>
          </tr>
        </thead>
        <tbody>
          {RECENT_MAINTENANCE.map((item) => (
            <tr key={item.reg} className="border-t border-border/60 align-top">
              <td className="px-1 py-2 font-mono">
                <div className="font-medium">{item.reg}</div>
                <div className="text-[10px] text-muted-foreground">{item.type}</div>
              </td>
              <td className="px-1 py-2">
                <div>{item.task[language]}</div>
                <div className="text-[10px] text-muted-foreground">{item.airline}</div>
              </td>
              <td className="px-1 py-2 font-mono text-muted-foreground">{item.date}</td>
              <td className="px-1 py-2 font-mono">{item.duration}</td>
              <td className="px-1 py-2"><StatusPill tone={item.tone}>{item.status[language]}</StatusPill></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AttentionTable({ language }: { language: Language }) {
  const c = copy[language];
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-2 py-2 text-start">{c.registration}</th>
            <th className="px-2 py-2 text-start">{c.type}</th>
            <th className="px-2 py-2 text-start">{c.events}</th>
            <th className="px-2 py-2 text-start">{c.mtbf}</th>
            <th className="px-2 py-2 text-start">{c.risk}</th>
          </tr>
        </thead>
        <tbody>
          {ATTENTION_AIRCRAFT.map((aircraft) => {
            const color = aircraft.risk >= 70 ? "var(--status-crit)" : aircraft.risk >= 50 ? "var(--status-warn)" : "var(--status-ok)";
            return (
              <tr key={aircraft.reg} className="border-t border-border/60">
                <td className="px-2 py-2.5 font-mono font-medium">{aircraft.reg}</td>
                <td className="px-2 py-2.5">{aircraft.type}</td>
                <td className="px-2 py-2.5 font-mono">{aircraft.events}</td>
                <td className="px-2 py-2.5 font-mono">{aircraft.mtbf}h</td>
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-2">
                    <ProgressBar value={aircraft.risk} color={color} className="min-w-24 flex-1" />
                    <span className="font-mono text-[11px]" style={{ color }}>{aircraft.risk}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
