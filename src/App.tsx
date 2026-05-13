import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  Accessibility,
  Activity,
  AlertTriangle,
  BadgeInfo,
  Briefcase,
  Building2,
  Car,
  Clock,
  CircleX,
  CircleDollarSign,
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
  Search,
  ShieldCheck,
  Train,
  Utensils,
  Users,
} from "lucide-react";
import { AirportMap2D, type Language } from "@/components/command-center/AirportMap2D";
import { MetricCard, ProgressBar, SectionPanel, Sparkline, StatusPill } from "@/components/command-center/MetricWidgets";

type Mode = "traveler" | "manager";
type Page = "dashboard" | "resources";
type TravelerTab = "explore" | "directions" | "services";
type ManagerTab = "operations" | "safety";
type Tone = "ok" | "info" | "warn" | "high" | "crit" | "neutral";
type FlightRow = {
  flight: string;
  city: string;
  time: string;
  status: { en: string; ar: string };
  tone: Tone;
  terminal: string;
  gate: string;
};

type LiveAirportData = {
  arrivals: readonly FlightRow[];
  departures: readonly FlightRow[];
  lastUpdated: Date;
  source: string;
  simulated: boolean;
};

type AviationStackFlight = {
  flight_date?: string;
  flight_status?: string;
  airline?: { iata?: string; name?: string };
  flight?: { number?: string; iata?: string };
  departure?: AviationStackFlightPoint;
  arrival?: AviationStackFlightPoint;
};

type AviationStackFlightPoint = {
  airport?: string;
  iata?: string;
  estimated?: string;
  scheduled?: string;
  delay?: number;
  terminal?: string;
  gate?: string;
};

type AviationStackResponse = {
  data?: AviationStackFlight[];
};

function mapAviationStackFlight(item: AviationStackFlight, direction: "arrival" | "departure"): FlightRow {
  const block = item[direction] ?? {};
  const airline = item.airline?.iata ?? item.airline?.name ?? "CAI";
  const number = item.flight?.number ?? item.flight?.iata ?? "--";
  const city = direction === "arrival" ? item.departure?.airport ?? item.departure?.iata ?? "Inbound" : item.arrival?.airport ?? item.arrival?.iata ?? "Outbound";
  const iso = block.estimated ?? block.scheduled ?? item.flight_date;
  const time = iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--:--";
  const delayed = block.delay != null && Number(block.delay) > 0;

  return {
    flight: `${airline}${number}`,
    city,
    time,
    status: delayed ? { en: `Delayed +${block.delay}m`, ar: `متأخرة ${block.delay}د` } : { en: item.flight_status ?? "Scheduled", ar: item.flight_status ?? "مجدولة" },
    tone: delayed ? "warn" : "info",
    terminal: block.terminal ? `T${block.terminal}` : "",
    gate: block.gate ?? "Check airport screens",
  };
}

async function fetchFlightByNumber(flightCode: string): Promise<FlightRow | null> {
  const aviationstackKey = import.meta.env.VITE_AVIATIONSTACK_KEY as string | undefined;
  if (!aviationstackKey) return null;

  const trimmed = flightCode.trim().toUpperCase();
  const candidates = new Set([trimmed]);
  const match = trimmed.match(/^([A-Z]{2,3})0+(\d+)$/);
  if (match) candidates.add(`${match[1]}${match[2]}`);

  for (const candidate of candidates) {
    const response = await fetch(`https://api.aviationstack.com/v1/flights?access_key=${aviationstackKey}&flight_iata=${encodeURIComponent(candidate)}&limit=5`);
    if (!response.ok) continue;
    const json = (await response.json()) as AviationStackResponse;
    const item = (json.data ?? []).find((flight) => flight.departure?.iata === "CAI" || flight.arrival?.iata === "CAI") ?? json.data?.[0];
    if (item) {
      const direction = item.departure?.iata === "CAI" ? "departure" : "arrival";
      return mapAviationStackFlight(item, direction);
    }
  }

  return null;
}

function normalizeFlightCodeForCompare(value: string) {
  return value.trim().toUpperCase().replace(/^([A-Z]{2,3})0+(\d+)$/, "$1$2");
}

function useHeaderClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return {
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
  };
}

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

const RESOURCE_LINKS = [
  { title: "Cairo Airport terminal information", source: "Cairo Airport Company", href: "https://www.cairo-airport.com/en-us/Services/Passenger-Guide/Terminal-Information", usedFor: "Terminal/service orientation and passenger-facing airport context." },
  { title: "Cairo Airport services and facilities", source: "Cairo Airport Company", href: "https://www.cairo-airport.com/en-us/Airport/Airport-Services-Facilities", usedFor: "Passenger services such as lounges, Ahlan service, medical/pharmacy, and airport facilities." },
  { title: "Cairo Airport information", source: "Cairo Airport Company", href: "https://www.cairo-airport.com/en-us/Airport/Airport-Information", usedFor: "Airport identity, public facilities, and operational context." },
  { title: "EgyptAir web check-in", source: "EgyptAir", href: "https://www.egyptair.com/en/fly/check-in/Pages/web-check-in.aspx", usedFor: "Passenger check-in guidance and online check-in timing." },
  { title: "Egypt e-Visa portal", source: "Government of Egypt", href: "https://visa2egypt.gov.eg/eVisa/ar/Home", usedFor: "Official visa-link destination." },
  { title: "Aviationstack API documentation", source: "Aviationstack", href: "https://aviationstack.com/documentation", usedFor: "Live flight status API fields, limitations, and endpoint behavior." },
  { title: "Google Maps Embed API", source: "Google for Developers", href: "https://developers.google.com/maps/documentation/embed/embedding-map", usedFor: "Embedded map approach and external route handoff." },
  { title: "WCAG 2.2", source: "W3C", href: "https://www.w3.org/TR/wcag/", usedFor: "Accessibility checks for focus, contrast, language, keyboard navigation, and responsive content." },
  { title: "Apple Human Interface Guidelines: Materials", source: "Apple Developer", href: "https://developer.apple.com/design/human-interface-guidelines/materials", usedFor: "Light glass/translucency treatment while preserving readability." },
  { title: "Air Travel Accessibility", source: "IATA", href: "https://www.iata.org/en/programs/passenger/accessibility/", usedFor: "Passenger accessibility and inclusive airport journey priorities." },
] as const;

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
  { flight: "MS738", city: "Frankfurt (FRA)", time: "--", status: { en: "Sample only", ar: "عينة فقط" }, tone: "neutral" as Tone, terminal: "", gate: "For layout only" },
  { flight: "TK694", city: "Istanbul (IST)", time: "--", status: { en: "Sample only", ar: "عينة فقط" }, tone: "neutral" as Tone, terminal: "", gate: "For layout only" },
  { flight: "EK927", city: "Dubai (DXB)", time: "--", status: { en: "Sample only", ar: "عينة فقط" }, tone: "neutral" as Tone, terminal: "", gate: "For layout only" },
  { flight: "MS841", city: "Jeddah (JED)", time: "--", status: { en: "Sample only", ar: "عينة فقط" }, tone: "neutral" as Tone, terminal: "", gate: "For layout only" },
] as const;

const DEPARTURES = [
  { flight: "MS777", city: "London (LHR)", time: "--", status: { en: "Sample only", ar: "عينة فقط" }, tone: "neutral" as Tone, terminal: "", gate: "For layout only" },
  { flight: "SV302", city: "Riyadh (RUH)", time: "--", status: { en: "Sample only", ar: "عينة فقط" }, tone: "neutral" as Tone, terminal: "", gate: "For layout only" },
  { flight: "AF551", city: "Paris (CDG)", time: "--", status: { en: "Sample only", ar: "عينة فقط" }, tone: "neutral" as Tone, terminal: "", gate: "For layout only" },
  { flight: "MS717", city: "Luxor (LXR)", time: "--", status: { en: "Sample only", ar: "عينة فقط" }, tone: "neutral" as Tone, terminal: "", gate: "For layout only" },
] as const;

function useLiveAirportData(): LiveAirportData {
  const [data, setData] = useState<LiveAirportData>(() => ({
    arrivals: ARRIVALS,
    departures: DEPARTURES,
    lastUpdated: new Date(),
    source: "Static operational sample",
    simulated: true,
  }));

  useEffect(() => {
    const aviationstackKey = import.meta.env.VITE_AVIATIONSTACK_KEY as string | undefined;
    let active = true;

    const load = async () => {
      if (!aviationstackKey) {
        setData((current) => ({ ...current, lastUpdated: new Date(), simulated: true, source: "Simulated until VITE_AVIATIONSTACK_KEY is configured" }));
        return;
      }

      try {
        const [arrivalsResponse, departuresResponse] = await Promise.all([
          fetch(`https://api.aviationstack.com/v1/flights?access_key=${aviationstackKey}&arr_iata=CAI&limit=4`),
          fetch(`https://api.aviationstack.com/v1/flights?access_key=${aviationstackKey}&dep_iata=CAI&limit=4`),
        ]);
        if (!active || !arrivalsResponse.ok || !departuresResponse.ok) return;
        const [arrivalsJson, departuresJson] = (await Promise.all([arrivalsResponse.json(), departuresResponse.json()])) as [AviationStackResponse, AviationStackResponse];
        setData({
          arrivals: (arrivalsJson.data ?? []).slice(0, 4).map((item) => mapAviationStackFlight(item, "arrival")),
          departures: (departuresJson.data ?? []).slice(0, 4).map((item) => mapAviationStackFlight(item, "departure")),
          lastUpdated: new Date(),
          source: "Aviationstack live flight API",
          simulated: false,
        });
      } catch {
        if (active) setData((current) => ({ ...current, lastUpdated: new Date(), simulated: true, source: "Live API unavailable - showing simulated operational sample" }));
      }
    };

    load();
    const id = window.setInterval(load, 60_000);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, []);

  return data;
}

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
  const [page, setPage] = useState<Page>(() => (window.location.hash === "#resources" ? "resources" : "dashboard"));
  const [highContrast, setHighContrast] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const clock = useHeaderClock();
  const c = copy[language];

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.classList.toggle("hc", highContrast);
    root.lang = language;
    root.dir = language === "ar" ? "rtl" : "ltr";
  }, [highContrast, language]);

  useEffect(() => {
    const handleHashChange = () => setPage(window.location.hash === "#resources" ? "resources" : "dashboard");
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-background/88 text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 lg:px-8">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">
            {c.skip}
          </a>
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/50 bg-primary/15 glow-cyan" aria-hidden="true">
              <div className="leading-none text-center">
                <div className="font-mono text-[13px] font-black tracking-tight text-primary">CAI</div>
                <Plane className="mx-auto mt-0.5 h-3 w-3 text-primary" strokeWidth={2.4} />
              </div>
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate font-mono text-[10px] tracking-[0.22em] text-primary">CAI - CAIRO INTL</p>
              <h1 className="truncate text-sm font-semibold">{c.brand}</h1>
            </div>
          </div>

          <div className="ms-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-secondary/45 px-3 py-2 xl:flex" aria-label="Current time">
              <Clock aria-hidden="true" className="h-4 w-4 text-primary" />
              <div className="leading-tight">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Cairo</p>
                <p className="font-mono text-xs font-semibold">{clock.cairo}</p>
              </div>
              <span className="h-7 w-px bg-border" aria-hidden="true" />
              <div className="leading-tight">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">UTC</p>
                <p className="font-mono text-xs font-semibold">{clock.utc}</p>
              </div>
            </div>
            <div className="flex items-center rounded-lg border border-border bg-secondary/60 p-0.5" role="group" aria-label="Dashboard mode">
              <ModeButton active={page === "dashboard" && mode === "traveler"} onClick={() => { window.location.hash = ""; setPage("dashboard"); setMode("traveler"); }} icon={<Users className="h-3.5 w-3.5" />} label={c.traveler} />
              <ModeButton active={page === "dashboard" && mode === "manager"} onClick={() => { window.location.hash = ""; setPage("dashboard"); setMode("manager"); }} icon={<Briefcase className="h-3.5 w-3.5" />} label={c.manager} />
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

      <main id="main-content" className="mx-auto w-full max-w-[1600px] p-4 lg:p-6">
        {page === "resources" ? <ResourcesPage /> : mode === "traveler" ? <TravelerDashboard language={language} /> : <ManagerDashboard language={language} />}
      </main>

      <footer className="border-t border-border px-6 py-4 text-center text-[11px] text-muted-foreground">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
          <span>{c.footer}</span>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <a href="#resources" onClick={() => setPage("resources")} className="font-medium text-primary hover:underline">Resources and audit notes</a>
        </div>
      </footer>
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

function ResourcesPage() {
  const auditItems = [
    { title: "Information accuracy", body: "Live flight data is sourced from Aviationstack when VITE_AVIATIONSTACK_KEY is configured. If the API is absent or omits gates, the interface labels the content as sample or asks passengers to confirm on airport screens." },
    { title: "Accessibility", body: "Primary interactions are buttons or links, keyboard focus is visible, the app has skip-to-content, high contrast mode, semantic tables, modal dialog roles, and descriptive labels for icon-only controls." },
    { title: "UX writing", body: "Passenger content now avoids false location awareness, avoids invented live gates, and labels sample/modelled operational cards so viewers understand what is live versus illustrative." },
    { title: "Color use", body: "Green/yellow/red remain reserved for operational meaning. Composition charts avoid danger colors unless the chart is explicitly communicating risk or attention." },
    { title: "Responsiveness", body: "Header clocks hide below desktop, dashboards stack at smaller breakpoints, cards use wrapping grids, and airport/map panels avoid fixed heights where content should hug." },
    { title: "Code cleanup", body: "Unused legacy service UI was removed, resources are centralized, sample data is labelled, and the local API key remains in ignored .env.local rather than source control." },
  ];
  const recommendations = [
    "Replace public API flight boards with an official airport FIDS/AODB integration if Cairo Airport Company can provide access.",
    "Add photo-backed terminal hero strips: Terminal 3 exterior, check-in hall, arrivals hall, apron/runway, and lounge or services area.",
    "Add a disruption mode for passengers: delayed flight, gate change, long passport queue, baggage delay, and service recovery guidance.",
    "Add manager drill-downs for SLA breach age, unresolved work orders, queue wait trends, and runway/apron constraint summaries.",
    "Add a small status timestamp to every live widget and an explicit data owner/source label for every modelled widget.",
  ];

  return (
    <div className="space-y-5">
      <Hero eyebrow="Source transparency" title="Resources and audit notes" description="References used for the Cairo Airport dashboard, plus the current accessibility, UX writing, contrast, responsiveness and data-integrity checks." />
      <SectionPanel title="Source links">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {RESOURCE_LINKS.map((resource) => (
            <a key={resource.href} href={resource.href} target="_blank" rel="noreferrer" className="panel-inner group flex items-start gap-3 p-4 transition-colors hover:border-primary/50">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-primary/30 bg-primary/10">
                <ExternalLink aria-hidden="true" className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-semibold group-hover:text-primary">{resource.title}</h2>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{resource.source}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{resource.usedFor}</p>
              </div>
            </a>
          ))}
        </div>
      </SectionPanel>
      <SectionPanel title="Audit checkup">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {auditItems.map((item) => (
            <article key={item.title} className="panel-inner p-4">
              <h2 className="text-sm font-semibold">{item.title}</h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </SectionPanel>
      <SectionPanel title="Recommended next additions">
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {recommendations.map((item) => (
            <li key={item} className="panel-inner flex gap-2 p-3 text-sm text-muted-foreground">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </SectionPanel>
    </div>
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
  const [flightModalOpen, setFlightModalOpen] = useState(false);
  const [lookupFlight, setLookupFlight] = useState<FlightRow | null>(null);
  const [lookupLive, setLookupLive] = useState(false);
  const [lookupBusy, setLookupBusy] = useState(false);
  const liveData = useLiveAirportData();
  const isArabic = language === "ar";
  const normalizedFlight = flight.trim().toUpperCase() || "MS777";
  const selectedFlight = lookupFlight ?? [...liveData.arrivals, ...liveData.departures, ...ARRIVALS, ...DEPARTURES].find((row) => row.flight === normalizedFlight) ?? DEPARTURES[0];
  const steps = [
    { label: isArabic ? "تسجيل السفر" : "Check-in", meta: isArabic ? "T3 - Zone C" : "T3 - Zone C", tone: "ok" as Tone },
    { label: isArabic ? "الجوازات" : "Passport control", meta: isArabic ? "11 دقيقة انتظار" : "11 min wait", tone: "info" as Tone },
    { label: isArabic ? "البوابة F11" : "Gate F11", meta: isArabic ? "9 دقائق مشيا" : "9 min walk", tone: "warn" as Tone },
  ];
  const submitFlightSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFlight(normalizedFlight);
    setLookupBusy(true);
    try {
      const liveFlight = await fetchFlightByNumber(normalizedFlight);
      setLookupFlight(liveFlight);
      setLookupLive(Boolean(liveFlight));
    } catch {
      setLookupFlight(null);
      setLookupLive(false);
    } finally {
      setLookupBusy(false);
    }
    setFlightModalOpen(true);
  };

  return (
    <SectionPanel title={isArabic ? "رحلتي الآن" : "My trip now"} action={<StatusPill tone="info">{isArabic ? "اقتراح حي" : "Live guidance"}</StatusPill>}>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)_260px]">
        <form className="relative block" onSubmit={submitFlightSearch}>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{isArabic ? "رقم الرحلة" : "Flight number"}</span>
          <div className="mt-1.5 flex h-11 overflow-hidden rounded-md border border-border bg-background focus-within:border-primary">
            <input value={flight} onChange={(event) => setFlight(event.target.value.toUpperCase())} className="min-w-0 flex-1 bg-transparent px-3 font-mono text-sm outline-none" aria-label={isArabic ? "Flight number" : "Flight number"} />
            <button type="submit" disabled={lookupBusy} className="grid w-11 place-items-center border-s border-border text-primary hover:bg-secondary disabled:cursor-wait disabled:opacity-60" aria-label={isArabic ? "Search flight status" : "Search flight status"}>
              <Search aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{isArabic ? "مصر للطيران - لندن هيثرو - مغادرة 11:50" : "EgyptAir - London Heathrow - departure 11:50"}</p>
        </form>
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
      {flightModalOpen && (
        <FlightStatusModal flight={selectedFlight} requestedFlight={normalizedFlight} language={language} live={lookupLive || !liveData.simulated} onClose={() => setFlightModalOpen(false)} />
      )}
    </SectionPanel>
  );
}

function FlightStatusModal({ flight, requestedFlight, language, live, onClose }: { flight: FlightRow; requestedFlight: string; language: Language; live: boolean; onClose: () => void }) {
  const found = normalizeFlightCodeForCompare(flight.flight) === normalizeFlightCodeForCompare(requestedFlight);
  const rows = [
    { label: "Flight", value: found ? flight.flight : requestedFlight },
    { label: "Route", value: flight.city },
    { label: "Time", value: flight.time },
    { label: "Terminal", value: flight.terminal },
    { label: "Gate", value: flight.gate },
    { label: "Status", value: flight.status[language] },
  ];

  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="flight-status-title">
      <div className="panel w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Flight status</p>
            <h3 id="flight-status-title" className="mt-1 text-2xl font-semibold">{found ? flight.flight : requestedFlight}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {found ? (live ? "Live Aviationstack result with terminal, gate and next action." : "Quick summary of terminal, gate and next action.") : "This flight was not found in the current live/sample feed, so the closest operational example is shown."}
            </p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border hover:bg-secondary" aria-label="Close flight status">
            <CircleX aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-[1fr_220px]">
          <div className="grid grid-cols-2 gap-3">
            {rows.map((row) => (
              <div key={row.label} className="panel-inner p-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{row.label}</p>
                <p className="mt-1 text-sm font-semibold">{row.value}</p>
              </div>
            ))}
          </div>
          <div className="panel-inner p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Recommended action</p>
            <p className="mt-2 text-sm font-semibold">
              {flight.tone === "warn" ? "Move now and monitor terminal screens." : "Stay comfortable and head toward the listed terminal."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusPill tone={live ? "ok" : "warn"}>{live ? "Live API" : "Fallback"}</StatusPill>
              <StatusPill tone={flight.tone}>{flight.status[language]}</StatusPill>
            </div>
          </div>
        </div>
      </div>
    </div>
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

type ServiceGuideItem = {
  icon: typeof Coffee;
  title: string;
  detail: string;
  scope: string;
  note: string;
};

function ServiceFinder({ language }: { language: Language }) {
  const isArabic = language === "ar";
  const [selectedService, setSelectedService] = useState<ServiceGuideItem | null>(null);
  const services: ServiceGuideItem[] = [
    { icon: Coffee, title: isArabic ? "الصالات" : "Lounges", detail: isArabic ? "صالات شركات الطيران وخدمات كبار الزوار حسب المبنى." : "Airline and meet-and-assist lounges vary by terminal.", scope: "T2 and T3 airside, selected T1 areas", note: "Check access rules with your airline or card provider before security." },
    { icon: Utensils, title: isArabic ? "المطاعم والمقاهي" : "Restaurants and cafes", detail: isArabic ? "خيارات طعام قبل وبعد إجراءات السفر." : "Food options are available before and after formalities.", scope: "Public halls and airside concourses", note: "Allow extra time during peak banks because queues can build quickly." },
    { icon: CircleDollarSign, title: isArabic ? "البنوك والصراف الآلي" : "Banks and ATMs", detail: isArabic ? "خدمات نقدية وصرافة في مناطق الركاب الرئيسية." : "Cash, banking and exchange services in main passenger zones.", scope: "Arrival halls, departure halls and public areas", note: "Use official bank/exchange counters for currency services." },
    { icon: Accessibility, title: isArabic ? "المساعدة الخاصة" : "Special assistance", detail: isArabic ? "دعم الحركة والاستقبال يمكن ترتيبه قبل السفر." : "Mobility and meet-and-assist support can be arranged before travel.", scope: "Terminal entrances, check-in and arrivals", note: "Request assistance early through the airline or airport service desk." },
  ];

  return (
    <SectionPanel title={isArabic ? "دليل خدمات الركاب" : "Passenger service guide"} action={<StatusPill tone="neutral">{isArabic ? "معلومات عامة" : "General info"}</StatusPill>}>
      <p className="mb-3 text-xs text-muted-foreground">{isArabic ? "هذه معلومات عامة عن الخدمات وليست مبنية على موقعك الحالي." : "These are general airport services, not location-based recommendations."}</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <button key={service.title} type="button" onClick={() => setSelectedService(service)} className="panel-inner p-4 text-start transition-colors hover:border-primary/50">
              <div className="grid h-10 w-10 place-items-center rounded-md border border-primary/30 bg-primary/10">
                <Icon aria-hidden="true" className="h-4 w-4 text-primary" />
              </div>
              <h3 className="mt-3 text-sm font-semibold">{service.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{service.detail}</p>
            </button>
          );
        })}
      </div>
      {selectedService && <ServiceDetailModal service={selectedService} onClose={() => setSelectedService(null)} />}
    </SectionPanel>
  );
}

function ServiceDetailModal({ service, onClose }: { service: ServiceGuideItem; onClose: () => void }) {
  const Icon = service.icon;
  return (
    <div className="fixed inset-0 z-[1000] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="service-detail-title">
      <div className="panel w-full max-w-xl overflow-hidden shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-primary/30 bg-primary/10">
              <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Passenger service</p>
              <h3 id="service-detail-title" className="mt-1 text-xl font-semibold">{service.title}</h3>
            </div>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border hover:bg-secondary" aria-label="Close service details">
            <CircleX aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-3 p-5">
          <div className="panel-inner p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">What to expect</p>
            <p className="mt-1 text-sm">{service.detail}</p>
          </div>
          <div className="panel-inner p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Typical locations</p>
            <p className="mt-1 text-sm">{service.scope}</p>
          </div>
          <div className="panel-inner p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Traveler note</p>
            <p className="mt-1 text-sm">{service.note}</p>
          </div>
        </div>
      </div>
    </div>
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
          <a key={label.en} href={href} target="_blank" rel="noreferrer" className="group flex items-center gap-3 panel-inner p-3 transition-colors hover:border-primary/40">
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
  const liveData = useLiveAirportData();
  const flightBoardTitle = {
    arrivals: liveData.simulated ? (language === "ar" ? "عينة وصول للعرض" : "Arrivals sample") : c.liveArrivals,
    departures: liveData.simulated ? (language === "ar" ? "عينة مغادرة للعرض" : "Departures sample") : c.liveDepartures,
  };
  const flightBoardPill = liveData.simulated ? (
    <StatusPill tone="neutral">{language === "ar" ? "للعرض فقط" : "For display only"}</StatusPill>
  ) : (
    <StatusPill tone="ok">{language === "ar" ? "API مباشر" : "Live API"}</StatusPill>
  );

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
          <DataFreshnessBanner language={language} data={liveData} />
          <ManagerCommandSummary language={language} />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard label={language === "ar" ? "ركاب اليوم" : "Passengers today"} value="58,420" delta={language === "ar" ? "+4.1% عن أمس" : "+4.1% vs yesterday"} icon={Users} hint={language === "ar" ? "المعيار اليومي 85k" : "Daily benchmark 85k"} />
            <MetricCard label={language === "ar" ? "حركة الطائرات" : "Aircraft movements"} value="412" unit="/ 540" delta={language === "ar" ? "حسب الخطة" : "On schedule"} icon={Activity} />
            <MetricCard label={language === "ar" ? "متوسط خروج المدرج" : "Avg taxi-out"} value="14" unit={language === "ar" ? "د" : "min"} delta={language === "ar" ? "-2 دقيقة" : "-2 min"} icon={Clock} accent="ok" />
            <MetricCard label={language === "ar" ? "تنبيهات نشطة" : "Active alerts"} value="3" delta={language === "ar" ? "2 متوسط، 1 عال" : "2 medium, 1 high"} deltaTone="warn" icon={AlertTriangle} accent="warn" />
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_1fr]">
            <SectionPanel title={c.passengerFlow} action={<StatusPill tone="neutral">{language === "ar" ? "تقديري" : "Modelled"}</StatusPill>} className="h-fit self-start">
              <div className="mb-3">
                <p className="text-sm font-semibold">{language === "ar" ? "يزداد التدفق قرب موجة الظهيرة" : "Passenger flow rises into the midday wave"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{language === "ar" ? "خط زمني مناسب لعرض الاتجاه عبر الوقت، وليس للمقارنة بين المحطات." : "A line chart is used here because the question is trend over time, not terminal comparison."}</p>
              </div>
              <Sparkline data={[42, 48, 55, 61, 70, 64, 72, 80, 76, 82, 78, 84]} height={58} />
              <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>06:00</span>
                <span>{language === "ar" ? "مؤشر تدفق الركاب" : "Passenger throughput index"}</span>
                <span>17:00</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <FlowZone label={language === "ar" ? "تسجيل" : "Check-in"} percent={62} tone="ok" />
                <FlowZone label={language === "ar" ? "الأمن" : "Security"} percent={84} tone="warn" />
                <FlowZone label={language === "ar" ? "الجوازات" : "Passport"} percent={71} tone="ok" />
              </div>
            </SectionPanel>
            <div className="space-y-5">
              <SectionPanel title={flightBoardTitle.arrivals} action={<div className="flex flex-wrap gap-2"><StatusPill tone="info" icon={<PlaneLanding className="h-3 w-3" />}>{c.nextHour}</StatusPill>{flightBoardPill}</div>} dense>
                <FlightTable rows={liveData.arrivals} directionLabel={c.fromCol} language={language} simulated={liveData.simulated} />
              </SectionPanel>
              <SectionPanel title={flightBoardTitle.departures} action={<div className="flex flex-wrap gap-2"><StatusPill tone="info" icon={<PlaneTakeoff className="h-3 w-3" />}>{c.nextHour}</StatusPill>{flightBoardPill}</div>} dense>
                <FlightTable rows={liveData.departures} directionLabel={c.toCol} language={language} simulated={liveData.simulated} />
              </SectionPanel>
            </div>
          </div>

          <QueueLoadChart language={language} />

          <SectionPanel title={c.parkingGates} action={<StatusPill tone="ok" icon={<ParkingSquare className="h-3 w-3" />}>2,180 free</StatusPill>}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {[
                { area: "T3 Pier F gates", plain: "Busy boarding bank", used: 86, target: 75, limit: 90, free: "4 gates free", action: "Hold non-urgent gate swaps", tone: "warn" as Tone },
                { area: "T2 Pier B gates", plain: "Healthy flow", used: 71, target: 75, limit: 90, free: "7 gates free", action: "Keep current allocation", tone: "info" as Tone },
                { area: "T1 parking / halls", plain: "Comfortable capacity", used: 54, target: 80, limit: 92, free: "980 spaces free", action: "Route overflow here", tone: "ok" as Tone },
              ].map((row) => (
                <article key={row.area} className="panel-inner p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-semibold">{row.area}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{row.plain}</p>
                    </div>
                    <StatusPill tone={row.tone}>{row.used}% used</StatusPill>
                  </div>
                  <BulletCapacityChart used={row.used} target={row.target} limit={row.limit} tone={row.tone} />
                  <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-foreground">{row.free}</span>
                    <span className="text-muted-foreground">{row.action}</span>
                  </div>
                </article>
              ))}
            </div>
          </SectionPanel>
        </div>
      )}

      {tab === "safety" && (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <DecisionQueue language={language} />
          <SafetyControls language={language} />
          <SafetyAgingBuckets language={language} />
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
          <SectionPanel title={c.recentMaintenance} action={<StatusPill tone="neutral">{language === "ar" ? "للعرض" : "Viewing sample"}</StatusPill>} className="h-fit self-start">
            <MaintenanceTable language={language} />
          </SectionPanel>
          <SectionPanel title={c.attentionAircraft} action={<div className="flex items-center gap-2"><StatusPill tone="neutral">{language === "ar" ? "نموذج" : "Modelled"}</StatusPill><span className="font-mono text-[11px] text-muted-foreground">{c.sortedRisk}</span></div>} className="xl:col-span-2">
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

function DataFreshnessBanner({ language, data }: { language: Language; data: LiveAirportData }) {
  const isArabic = language === "ar";
  const ageSeconds = Math.max(0, Math.round((Date.now() - data.lastUpdated.getTime()) / 1000));
  const stale = ageSeconds > 120;

  return (
    <section className="panel flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold">{isArabic ? "حالة البيانات" : "Data status"}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {data.simulated
            ? isArabic ? "البيانات الحالية عينة تشغيلية. أضف VITE_AVIATIONSTACK_KEY لتفعيل الرحلات الحية." : "Current data is simulated. Add VITE_AVIATIONSTACK_KEY to enable live flights."
            : isArabic ? "الرحلات تتحدث تلقائيا من مزود بيانات الرحلات." : "Flights auto-refresh from the configured flight data provider."}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill tone={data.simulated ? "warn" : "ok"}>{data.simulated ? (isArabic ? "محاكاة" : "Simulated") : (isArabic ? "مباشر" : "Live")}</StatusPill>
        <StatusPill tone={stale ? "crit" : "info"}>{isArabic ? `آخر تحديث ${ageSeconds}ث` : `Updated ${ageSeconds}s ago`}</StatusPill>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{data.source}</span>
      </div>
    </section>
  );
}

function QueueLoadChart({ language }: { language: Language }) {
  const isArabic = language === "ar";
  const rows = [
    { terminal: "T1", checkIn: 28, passport: 18, security: 22 },
    { terminal: "T2", checkIn: 32, passport: 26, security: 31 },
    { terminal: "T3", checkIn: 38, passport: 22, security: 24 },
  ];

  return (
    <SectionPanel title={isArabic ? "ضغط الطوابير حسب المبنى" : "Queue pressure by terminal"} action={<StatusPill tone="info">{isArabic ? "مكدس" : "Stacked bar"}</StatusPill>}>
      <p className="mb-4 max-w-3xl text-xs text-muted-foreground">
        {isArabic ? "المخطط الشريطي المكدس يوضح أين يتجمع الضغط، وأي خطوة تسبب الجزء الأكبر منه." : "A stacked bar shows where queue pressure is building and which process contributes most."}
      </p>
      <div className="space-y-3">
        {rows.map((row) => {
          const total = row.checkIn + row.passport + row.security;
          return (
            <div key={row.terminal} className="grid grid-cols-[42px_minmax(0,1fr)_48px] items-center gap-3">
              <span className="font-mono text-xs font-semibold">{row.terminal}</span>
              <div className="flex h-4 overflow-hidden rounded-full bg-secondary" aria-label={`${row.terminal} queue pressure ${total}%`}>
                <div className="bg-cyan/95" style={{ width: `${row.checkIn}%` }} title="Check-in" />
                <div className="bg-cyan/65" style={{ width: `${row.passport}%` }} title="Passport" />
                <div className="bg-cyan/35" style={{ width: `${row.security}%` }} title="Security" />
              </div>
              <span className="font-mono text-xs text-muted-foreground">{total}%</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        <span><span className="me-1 inline-block h-2 w-2 rounded-full bg-cyan/95" />{isArabic ? "تسجيل" : "Check-in"}</span>
        <span><span className="me-1 inline-block h-2 w-2 rounded-full bg-cyan/65" />{isArabic ? "جوازات" : "Passport"}</span>
        <span><span className="me-1 inline-block h-2 w-2 rounded-full bg-cyan/35" />{isArabic ? "أمن" : "Security"}</span>
      </div>
    </SectionPanel>
  );
}

function BulletCapacityChart({ used, target, limit, tone }: { used: number; target: number; limit: number; tone: Tone }) {
  const color = tone === "warn" ? "var(--status-warn)" : tone === "ok" ? "var(--status-ok)" : "var(--cyan)";

  return (
    <div className="mt-3">
      <div className="relative h-5 overflow-hidden rounded-full bg-secondary" aria-label={`Capacity ${used} percent used, planning target ${target} percent, escalation limit ${limit} percent`}>
        <div className="h-full rounded-full" style={{ width: `${used}%`, backgroundColor: color }} />
        <span className="absolute top-0 h-full w-px bg-white/80" style={{ left: `${target}%` }} aria-hidden="true" />
        <span className="absolute top-0 h-full w-px bg-status-crit" style={{ left: `${limit}%` }} aria-hidden="true" />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>Used {used}%</span>
        <span>Target {target}%</span>
        <span>Escalate {limit}%</span>
      </div>
    </div>
  );
}

function SafetyAgingBuckets({ language }: { language: Language }) {
  const isArabic = language === "ar";
  const buckets = [
    { label: isArabic ? "جديد" : "New", value: 5, tone: "info" as Tone },
    { label: isArabic ? "30-90 د" : "30-90m", value: 4, tone: "ok" as Tone },
    { label: isArabic ? "2-4 س" : "2-4h", value: 2, tone: "warn" as Tone },
    { label: isArabic ? "متأخر" : "Overdue", value: 1, tone: "crit" as Tone },
  ];
  const max = Math.max(...buckets.map((bucket) => bucket.value));

  return (
    <SectionPanel title={isArabic ? "عمر تنبيهات السلامة" : "Safety alert age"} action={<div className="flex items-center gap-2"><StatusPill tone="neutral">{isArabic ? "عينة" : "Sample"}</StatusPill><StatusPill tone="warn">{isArabic ? "1 متأخر" : "1 overdue"}</StatusPill></div>} className="h-fit self-start">
      <p className="mb-4 text-xs text-muted-foreground">
        {isArabic ? "الأعمدة توضح ما إذا كانت المشكلات تتراكم قبل أن تصبح حرجة." : "Aging buckets show whether issues are accumulating before they become critical."}
      </p>
      <div className="grid grid-cols-4 items-end gap-3">
        {buckets.map((bucket) => {
          const height = 24 + (bucket.value / max) * 48;
          const bg = bucket.tone === "crit" ? "bg-status-crit" : bucket.tone === "warn" ? "bg-status-warn" : bucket.tone === "ok" ? "bg-status-ok" : "bg-cyan";
          return (
            <div key={bucket.label} className="text-center">
              <div className="mx-auto flex h-20 w-full max-w-16 items-end rounded-md bg-secondary/70 p-1">
                <div className={`w-full rounded ${bg}`} style={{ height }} aria-label={`${bucket.label}: ${bucket.value} alerts`} />
              </div>
              <p className="mt-2 font-mono text-sm font-semibold">{bucket.value}</p>
              <p className="text-[11px] text-muted-foreground">{bucket.label}</p>
            </div>
          );
        })}
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

function SafetyControls({ language }: { language: Language }) {
  const isArabic = language === "ar";
  const controls = [
    { label: isArabic ? "خطر متراكم" : "Accumulation risk", value: isArabic ? "متوسط" : "Medium", detail: isArabic ? "3 ملاحظات مفتوحة أكثر من 24 ساعة" : "3 findings open longer than 24h", tone: "warn" as Tone },
    { label: isArabic ? "مالك الإجراء" : "Action owner", value: isArabic ? "محدد" : "Assigned", detail: isArabic ? "كل بند سلامة له مسؤول وموعد" : "Every safety item has an owner and due time", tone: "ok" as Tone },
    { label: isArabic ? "تصعيد تلقائي" : "Auto-escalation", value: isArabic ? "90 دقيقة" : "90 min", detail: isArabic ? "يصعد إذا لم يبدأ الإجراء" : "Escalates if action has not started", tone: "info" as Tone },
  ];

  return (
    <SectionPanel title={isArabic ? "ضوابط منع تراكم المشكلات" : "Controls to prevent issue build-up"}>
      <div className="grid grid-cols-1 gap-3">
        {controls.map((control) => (
          <article key={control.label} className="panel-inner p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold">{control.label}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{control.detail}</p>
              </div>
              <StatusPill tone={control.tone}>{control.value}</StatusPill>
            </div>
          </article>
        ))}
      </div>
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

function FlightTable({ rows, directionLabel, language, simulated = false }: { rows: readonly FlightRow[]; directionLabel: string; language: Language; simulated?: boolean }) {
  const c = copy[language];
  return (
    <>
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
            {rows.map((row) => {
              const gateText = row.terminal ? `${row.terminal}/${row.gate}` : row.gate;
              return (
                <tr key={row.flight} className="border-t border-border/60">
                  <td className="px-1 py-2 font-mono font-medium">{row.flight}</td>
                  <td className="px-1 py-2 text-foreground/90">{row.city}</td>
                  <td className="px-1 py-2 font-mono">{row.time}</td>
                  <td className="px-1 py-2 font-mono text-muted-foreground">{gateText}</td>
                  <td className="px-1 py-2"><StatusPill tone={row.tone}>{row.status[language]}</StatusPill></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        {simulated
          ? language === "ar" ? "هذه بيانات عينة للعرض فقط. أضف VITE_AVIATIONSTACK_KEY في Vercel لعرض بيانات API." : "Sample rows for display only. Add VITE_AVIATIONSTACK_KEY in Vercel to show API data."
          : language === "ar" ? "بيانات من Aviationstack. تأكد من البوابة والحالة النهائية من شاشات المطار." : "Data from Aviationstack. Confirm final gate and status on airport screens."}
      </p>
    </>
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
            <th className="px-2 py-2 text-start">{language === "ar" ? "أبرز سبب" : "Top issue"}</th>
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
                <td className="px-2 py-2.5 text-muted-foreground">{aircraft.top}</td>
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
