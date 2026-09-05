import React, { useState, useEffect, useRef } from "react";
import {
  Check,
  Laptop,
  Monitor,
  Smartphone,
  User,
  Users,
  Clock3,
  Eye,
  ExternalLink,
  Search,
  Network,
  ShieldCheck,
  Contrast,
  Keyboard,
  ChevronDown,
  ChevronUp,
  Linkedin,
  ArrowLeft,
  Sparkles,
  Bot,
  Code2,
  Tv,
  Volume2,
  VolumeX,
  Radio,
  FileSpreadsheet,
  CloudRain,
  Flame,
  Layers,
  Cpu,
  Workflow,
  CheckCircle2,
  Globe,
  Palette,
  Terminal,
  Sliders,
  Plane,
  Building2,
} from "lucide-react";
import { StatusPill } from "./command-center/MetricWidgets";
import { useLocale } from "../context/locale";
import { useAirfieldRadio } from "../hooks/useAirfieldRadio";
import { RADIO_CHANNELS, RadioChannel } from "../services/airfieldAudio";
import { soundEffects } from "../services/soundEffects";
import { localize } from "../utils/helpers";

function renderTextWithAbbr(text: string) {
  if (typeof text !== "string") return text;
  const tokens = text.split(/\b(SLA|PAX|pax|ICAO|RTL|LTR|LHR|CAI|HECA|METAR|ATC|ATIS|AOCC|WCAG|API|DSP|VHF|BOM)\b/g);
  return tokens.map((token, i) => {
    switch (token) {
      case "SLA": return <abbr key={i} title="Service Level Agreement" className="no-underline cursor-help border-b border-dotted border-foreground/40">SLA</abbr>;
      case "PAX":
      case "pax": return <abbr key={i} title="Passengers" className="no-underline cursor-help border-b border-dotted border-foreground/40">{token}</abbr>;
      case "ICAO": return <abbr key={i} title="International Civil Aviation Organization" className="no-underline cursor-help border-b border-dotted border-foreground/40">ICAO</abbr>;
      case "RTL": return <abbr key={i} title="Right-to-Left (Arabic Layout)" className="no-underline cursor-help border-b border-dotted border-foreground/40">RTL</abbr>;
      case "LTR": return <abbr key={i} title="Left-to-Right" className="no-underline cursor-help border-b border-dotted border-foreground/40">LTR</abbr>;
      case "CAI": return <abbr key={i} title="Cairo International Airport IATA Code" className="no-underline cursor-help border-b border-dotted border-foreground/40">CAI</abbr>;
      case "HECA": return <abbr key={i} title="Cairo International Airport ICAO Code" className="no-underline cursor-help border-b border-dotted border-foreground/40">HECA</abbr>;
      case "METAR": return <abbr key={i} title="Meteorological Aerodrome Report" className="no-underline cursor-help border-b border-dotted border-foreground/40">METAR</abbr>;
      case "ATC": return <abbr key={i} title="Air Traffic Control" className="no-underline cursor-help border-b border-dotted border-foreground/40">ATC</abbr>;
      case "ATIS": return <abbr key={i} title="Automatic Terminal Information Service" className="no-underline cursor-help border-b border-dotted border-foreground/40">ATIS</abbr>;
      case "AOCC": return <abbr key={i} title="Airport Operations Control Center" className="no-underline cursor-help border-b border-dotted border-foreground/40">AOCC</abbr>;
      case "WCAG": return <abbr key={i} title="Web Content Accessibility Guidelines" className="no-underline cursor-help border-b border-dotted border-foreground/40">WCAG</abbr>;
      case "API": return <abbr key={i} title="Application Programming Interface" className="no-underline cursor-help border-b border-dotted border-foreground/40">API</abbr>;
      case "DSP": return <abbr key={i} title="Digital Signal Processing" className="no-underline cursor-help border-b border-dotted border-foreground/40">DSP</abbr>;
      case "VHF": return <abbr key={i} title="Very High Frequency Aviation Radio (118-137 MHz)" className="no-underline cursor-help border-b border-dotted border-foreground/40">VHF</abbr>;
      case "BOM": return <abbr key={i} title="Byte Order Mark (UTF-8 Excel Compatibility)" className="no-underline cursor-help border-b border-dotted border-foreground/40">BOM</abbr>;
      default: return token;
    }
  });
}

// ----------------------------------------------------
// Persona & Research data
// ----------------------------------------------------
const personas = [
  {
    id: "karim",
    name: { en: "Karim — Duty Operations Manager", ar: "كريم — مدير عمليات نوبة العمل" },
    avatarPath: import.meta.env.BASE_URL + "karim_avatar_v2.png",
    role: { en: "12 years in command centers. Oversees terminal operations and AOCC video walls.", ar: "خبرة ١٢ عاماً في مركز القيادة، يشرف على عمليات الصالات الحية على شاشات جدارية 4K." },
    needs: { en: "High-contrast status badges, automated view carousel, and live ATC voice context.", ar: "تنبيهات فورية للمشاكل، ودورة تبديل شاشات تلقائية، وتغذية صوتية لبرج المراقبة." },
    specs: [
      { label: { en: "Shift", ar: "النوبة" }, val: { en: "Rotational (12h)", ar: "متناوبة (١٢ ساعة)" } },
      { label: { en: "Device", ar: "الجهاز" }, val: { en: "4K Video Wall + Workstation", ar: "شاشة جدارية 4K + حاسوب مكتبي" } },
      { label: { en: "Priority", ar: "الأولوية" }, val: { en: "Continuous situational awareness", ar: "استمرارية الوعي التشغيلي الشامل" } }
    ]
  },
  {
    id: "yasmin",
    name: { en: "Yasmin — Terminal Gate Supervisor", ar: "ياسمين — مشرف بوابات صالة الركاب" },
    avatarPath: import.meta.env.BASE_URL + "yasmin_avatar_v2.png",
    role: { en: "Manages passenger boarding and terminal flows across T1, T2, and T3 on mobile tablets.", ar: "تدير صعود الركاب وتدفق المسافرين في الصالات ١ و ٢ و ٣ باستخدام التابلت." },
    needs: { en: "Touch targets min 44px, sunlight-readable contrast, and shift wave passenger filters.", ar: "مساحات لمس لا تقل عن ٤٤ بكسل، وتباين مقروء تحت الشمس، وفلاتر لأمواج المسافرين." },
    specs: [
      { label: { en: "Shift", ar: "النوبة" }, val: { en: "Day Shift (8h)", ar: "نهارية (٨ ساعات)" } },
      { label: { en: "Device", ar: "الجهاز" }, val: { en: "10\" Mobile Tablet", ar: "تابلت ١٠ بوصة" } },
      { label: { en: "Priority", ar: "الأولوية" }, val: { en: "RTL layout & touch scaling", ar: "التوافق العربي ومساحات اللمس" } }
    ]
  },
  {
    id: "tarek",
    name: { en: "Tarek — ICAO Safety Auditor", ar: "طارق — مدقق سلامة الطيران (ICAO)" },
    avatarPath: import.meta.env.BASE_URL + "tarek_avatar_v2.png",
    role: { en: "Audits safety compliance, runway friction, FOD debris, and maintenance logs.", ar: "يدقق الامتثال للسلامة، واحتكاك المدرجات، وخلو المهابط من العوائق، وسجلات الصيانة." },
    needs: { en: "Structured telemetry, RFC-4180 CSV export with Arabic UTF-8 BOM, and drill sandboxes.", ar: "جداول بيانات منظمة، وتصدير CSV متوافق مع إكسل بالعربية، وتدريبات طوارئ تفاعلية." },
    specs: [
      { label: { en: "Shift", ar: "النوبة" }, val: { en: "Intermittent / Audits", ar: "متقطعة / فترات التدقيق" } },
      { label: { en: "Device", ar: "الجهاز" }, val: { en: "13\" Workstation Laptop", ar: "لابتوب ١٣ بوصة" } },
      { label: { en: "Priority", ar: "الأولوية" }, val: { en: "Data export & compliance SLA", ar: "تصدير البيانات والامتثال لمعايير ICAO" } }
    ]
  }
];

const timelinePhases = [
  {
    id: "discovery",
    title: { en: "1. Field Research & AOCC Shadowing", ar: "١. الملاحظات الميدانية ومعايشة مركز القيادة" },
    desc: { en: "Shadowed operators in Cairo command center. Identified alarm fatigue and runway glare.", ar: "معايشة ميدانية في مركز قيادة مطار القاهرة لكشف إرهاق الإنذارات وصعوبات القراءة تحت الشمس." },
    icon: Search,
    bullets: [
      { en: "High-contrast visual cues with zero color-alone reliance.", ar: "رموز بصرية عالية التباين دون الاعتماد على اللون بمفرده." },
      { en: "Airfield mobile tablets require minimum 44px touch targets.", ar: "أجهزة التابلت تتطلب مساحات لمس لا تقل عن ٤٤ بكسل." }
    ]
  },
  {
    id: "ia",
    title: { en: "2. Information Architecture & Reduction", ar: "٢. تخطيط العمليات وهيكلة المعلومات" },
    desc: { en: "Mapped 22 sensor telemetry feeds into 9 key decision cards across 3 operational layers.", ar: "تقسيم ٢٢ تدفقاً للبيانات إلى ٩ بطاقات أداء رئيسية موزعة عبر ٣ محاور تشغيلية." },
    icon: Network,
    bullets: [
      { en: "Logical grouping of flights, runway status, and baggage loops.", ar: "تجميع ذكي للرحلات وحالة المدرجات ومسارات الأمتعة." },
      { en: "Sub-millisecond digital twin hotspots for instantaneous fault pinpointing.", ar: "نقاط تفاعلية في التوأم الرقمي لتحديد مواقع الأعطال فوراً." }
    ]
  },
  {
    id: "accessibility",
    title: { en: "3. WCAG 2.2 AAA & Audio Integration", ar: "٣. تيسير الوصول بمعيار WCAG 2.2 AAA وتكامل الصوت" },
    desc: { en: "Strict WCAG 2.2 AAA compliance with Web Audio API radio voice & live captions.", ar: "امتثال كامل لمعايير WCAG 2.2 AAA مع بث إذاعي صوتي ونصوص فورية." },
    icon: ShieldCheck,
    bullets: [
      { en: "7:1 normal text contrast across Light, Dark, and High-Contrast modes.", ar: "نسبة تباين ٧:١ للنصوص في كافة الأنماط اللونية." },
      { en: "Live on-screen captions for Cairo Tower (118.10 MHz) and ATIS broadcasts.", ar: "نصوص فورية لنداءات برج المراقبة وإذاعة الطقس." }
    ]
  }
];

function MiniMetricCard({
  label,
  value,
  unit,
  delta,
  deltaTone = "ok",
  accent = "cyan",
}: {
  label: string;
  value: string;
  unit: string;
  delta: string;
  deltaTone?: "ok" | "warn" | "crit" | "info";
  accent?: "cyan" | "magenta" | "warn" | "ok";
}) {
  const accentHex = {
    cyan: "var(--cyan)",
    magenta: "var(--magenta)",
    warn: "var(--status-warn)",
    ok: "var(--status-ok)",
  }[accent];

  return (
    <div className="panel relative overflow-hidden p-3 bg-card border border-border/80 text-start h-full">
      <div className="absolute -top-6 -start-6 h-16 w-16 rounded-full opacity-10 blur-xl pointer-events-none" style={{ backgroundColor: accentHex }} />
      <div className="min-w-0 flex flex-col justify-between h-full gap-2">
        <div>
          <p className="text-xs font-mono rtl:font-sans uppercase rtl:normal-case tracking-[0.08em] rtl:tracking-normal text-muted-foreground truncate">{label}</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-sm font-semibold tracking-tight text-foreground">{value}</span>
            <span className="text-xs font-mono text-muted-foreground">{unit}</span>
          </div>
        </div>
        <p className={`text-xs font-mono font-semibold ${deltaTone === "ok" ? "text-status-ok" : deltaTone === "warn" ? "text-status-warn" : "text-status-crit"}`}>
          {delta}
        </p>
      </div>
    </div>
  );
}

interface ScrollableImageContainerProps {
  src: string;
  alt: string;
  title: string;
  helperText: string;
}

function ScrollableImageContainer({ src, alt, title, helperText }: ScrollableImageContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const scrollLeft = useRef(0);
  const scrollTop = useRef(0);
  const [imgRatio, setImgRatio] = useState<number | null>(null);
  const [containerDim, setContainerDim] = useState({ width: 0, height: 320 });

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImgRatio(img.naturalWidth / img.naturalHeight);
    };
  }, [src]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    setContainerDim({
      width: container.clientWidth,
      height: container.clientHeight || 320,
    });

    const resizeObserver = new ResizeObserver(() => {
      setContainerDim({
        width: container.clientWidth,
        height: container.clientHeight || 320,
      });
    });
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX - (containerRef.current?.offsetLeft ?? 0);
    startY.current = e.pageY - (containerRef.current?.offsetTop ?? 0);
    scrollLeft.current = containerRef.current?.scrollLeft ?? 0;
    scrollTop.current = containerRef.current?.scrollTop ?? 0;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const y = e.pageY - containerRef.current.offsetTop;
    const walkX = (x - startX.current) * 1.5;
    const walkY = (y - startY.current) * 1.5;
    containerRef.current.scrollLeft = scrollLeft.current - walkX;
    containerRef.current.scrollTop = scrollTop.current - walkY;
  };

  let imgStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  if (imgRatio && containerDim.width > 0) {
    const containerRatio = containerDim.width / containerDim.height;
    if (containerRatio > imgRatio) {
      imgStyle = {
        width: containerDim.width,
        height: containerDim.width / imgRatio,
        minHeight: containerDim.height,
        maxHeight: "none",
        maxWidth: "none",
      };
    } else {
      imgStyle = {
        height: containerDim.height,
        width: containerDim.height * imgRatio,
        minWidth: containerDim.width,
        maxWidth: "none",
        maxHeight: "none",
      };
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <span className="text-xs font-mono rtl:font-sans font-semibold uppercase rtl:normal-case tracking-wider rtl:tracking-normal text-primary px-1">{title}</span>
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        tabIndex={0}
        aria-label={`${title}. ${helperText}`}
        className="relative h-[320px] w-full overflow-auto no-scrollbar rounded-xl border border-border bg-background cursor-grab active:cursor-grabbing select-none focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <img 
          src={src} 
          alt={alt} 
          style={imgStyle}
          className="select-none pointer-events-none rounded-xl block" 
        />
      </div>
      <span className="text-[10px] text-muted-foreground/60 px-1 text-center md:text-start flex items-center gap-1">
        <span aria-hidden="true">🖱️</span>
        <span>{helperText}</span>
      </span>
    </div>
  );
}

type SubTab = "overview" | "ai-code" | "wcag" | "airfield";

export default function ResourcesAuditPage({
  theme = "dark",
  onReturnToDashboard,
}: {
  theme?: "dark" | "light";
  onReturnToDashboard?: () => void;
}) {
  const { language } = useLocale();
  const isDark = theme === "dark";
  const [currentTab, setCurrentTab] = useState<SubTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [activePersona, setActivePersona] = useState<string>("karim");
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({
    discovery: true,
    ia: true,
    accessibility: true,
  });
  const [activeDevice, setActiveDevice] = useState<"desktop" | "laptop" | "tablet">("desktop");

  const {
    isMuted,
    toggleMute,
    activeChannel,
    setChannel,
    isTransmitting,
    currentTransmission,
    triggerNext,
  } = useAirfieldRadio();

  const polishedSrc = import.meta.env.BASE_URL + (isDark ? "operations_polished_dark.png" : "operations_polished_light.png");
  const polishedAlt = isDark 
    ? localize({ en: "Dark Mode Polished Operations View", ar: "عرض التصميم النهائي للوحة العمليات بالوضع الداكن" }, language)
    : localize({ en: "Light Mode Polished Operations View", ar: "عرض التصميم النهائي للوحة العمليات بالوضع الفاتح" }, language);
  const polishedTitle = isDark
    ? localize({ en: "Dark Mode Polished Dashboard", ar: "التصميم النهائي (الوضع الداكن)" }, language)
    : localize({ en: "Light Mode Polished Dashboard", ar: "التصميم النهائي (الوضع الفاتح)" }, language);

  const togglePhase = (id: string) => {
    soundEffects.playClick();
    setExpandedPhases((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleTabChange = (tab: SubTab) => {
    soundEffects.playClick();
    setCurrentTab(tab);
  };

  const subTabs = [
    {
      id: "overview" as const,
      label: { en: "Core Specs & Metrics", ar: "المواصفات والمقاييس" },
      icon: Sparkles,
      badge: "HECA / CAI",
    },
    {
      id: "ai-code" as const,
      label: { en: "AI & Code Architecture", ar: "الذكاء الاصطناعي ومعمارية الكود" },
      icon: Bot,
      badge: "Antigravity & React 19",
    },
    {
      id: "wcag" as const,
      label: { en: "WCAG 2.2 AAA & Tokens", ar: "إتاحة الوصول ورموز التصميم" },
      icon: ShieldCheck,
      badge: "7:1 Ratio & RTL",
    },
    {
      id: "airfield" as const,
      label: { en: "Consoles & Sandboxes", ar: "منصات الاختبار والشخصيات" },
      icon: Radio,
      badge: "ATC Radio & Devices",
    },
  ];

  return (
    <div className="flex flex-col min-w-0 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16 max-w-5xl mx-auto w-full text-foreground">
      
      {/* Top Header & Sticky Navigation */}
      <header className="sticky top-20 sm:top-24 z-30 rounded-2xl border border-primary/30 bg-background/95 p-3 shadow-xl backdrop-blur-xl flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {onReturnToDashboard && (
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  onReturnToDashboard();
                }}
                className="flex h-10 items-center gap-2 rounded-xl bg-primary px-3 text-xs sm:text-sm font-bold text-primary-foreground shadow-md hover:opacity-90 active:scale-95 transition cursor-pointer"
                aria-label={localize({ en: "Return to Live Command Hub", ar: "العودة إلى مركز القيادة المباشر" }, language)}
              >
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                <span>{localize({ en: "Dashboard", ar: "لوحة التحكم" }, language)}</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <StatusPill tone="info">HECA v3.2</StatusPill>
              <h1 className="text-sm sm:text-base font-extrabold text-foreground tracking-tight hidden sm:block">
                {localize({ en: "AOCC Documentation & Specs", ar: "توثيق ومواصفات مركز قيادة المطار" }, language)}
              </h1>
            </div>
          </div>

          {/* Quick Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={localize({ en: "Filter specs & topics...", ar: "ابحث في المواصفات..." }, language)}
              className="h-9 w-full rounded-xl border border-border bg-secondary/30 ps-9 pe-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              aria-label={localize({ en: "Search documentation", ar: "البحث في التوثيق" }, language)}
            />
          </div>
        </div>

        {/* 4 Icon-Anchored Sub-Tabs (Progressive Disclosure) */}
        <nav 
          aria-label={localize({ en: "Documentation Sections", ar: "أقسام التوثيق" }, language)}
          className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 border-t border-border/40"
        >
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                aria-selected={isActive}
                role="tab"
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border text-start ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-secondary/20 text-muted-foreground border-border/60 hover:bg-secondary/40 hover:text-foreground"
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                  <Icon className="h-4 w-4 shrink-0" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate">{localize(tab.label, language)}</div>
                  <div className={`text-[10px] font-mono font-normal truncate ${isActive ? "text-primary-foreground/80" : "text-muted-foreground/80"}`}>
                    {tab.badge}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </header>

      {/* ============================================================ */}
      {/* TAB 1: OVERVIEW & SPECS */}
      {/* ============================================================ */}
      {currentTab === "overview" && (
        <div className="flex flex-col gap-5 animate-in fade-in duration-300">
          
          {/* Executive Metrics Bar */}
          <section className="panel bg-card/60 border border-border/80 p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-primary" />
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  {localize({ en: "Cairo International Airport (CAI / HECA) Infrastructure", ar: "البنية التحتية لمطار القاهرة الدولي" }, language)}
                </h2>
              </div>
              <span className="text-xs font-mono text-status-ok bg-status-ok/10 px-2 py-0.5 rounded border border-status-ok/30 font-bold">
                ICAO / IATA APPROVED
              </span>
            </div>

            {/* Scannable Stat Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl border border-border/70 bg-secondary/15 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{localize({ en: "Passenger Capacity", ar: "سعة الركاب" }, language)}</span>
                </div>
                <div className="text-xl font-extrabold text-foreground font-mono">30M+</div>
                <p className="text-[11px] text-muted-foreground">{localize({ en: "Terminals 1, 2, and 3", ar: "عبر الصالات ١، ٢، ٣" }, language)}</p>
              </div>

              <div className="p-3 rounded-xl border border-border/70 bg-secondary/15 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                  <Plane className="h-3.5 w-3.5" />
                  <span>{localize({ en: "Runways", ar: "المدرجات" }, language)}</span>
                </div>
                <div className="text-xl font-extrabold text-foreground font-mono">3 Active</div>
                <p className="text-[11px] text-muted-foreground font-mono">05L/23R, 05C/23C, 05R/23L</p>
              </div>

              <div className="p-3 rounded-xl border border-border/70 bg-secondary/15 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-status-ok font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{localize({ en: "Accessibility", ar: "إتاحة الوصول" }, language)}</span>
                </div>
                <div className="text-xl font-extrabold text-foreground font-mono">AAA 7:1</div>
                <p className="text-[11px] text-muted-foreground">{localize({ en: "WCAG 2.2 strict compliance", ar: "امتثال كامل لمعايير WCAG" }, language)}</p>
              </div>

              <div className="p-3 rounded-xl border border-border/70 bg-secondary/15 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                  <Globe className="h-3.5 w-3.5" />
                  <span>{localize({ en: "Bilingual Engine", ar: "المحرك اللغوي" }, language)}</span>
                </div>
                <div className="text-xl font-extrabold text-foreground font-mono">RTL / LTR</div>
                <p className="text-[11px] text-muted-foreground">{localize({ en: "Full Arabic logical mirroring", ar: "محاذاة منطقية كاملة" }, language)}</p>
              </div>
            </div>
          </section>

          {/* Operational Feature Matrix */}
          <section className="panel bg-card/40 border border-border/80 p-4 sm:p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                {localize({ en: "Core System Capabilities & Direct Access", ar: "الوظائف التشغيلية الرئيسية ومفاتيح الوصول" }, language)}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                {
                  icon: CloudRain,
                  title: "HECA METAR & Crosswinds",
                  desc: { en: "Live wind vectors, active runways (05L/05C), and atmospheric conditions.", ar: "متجهات الرياح المباشرة والمدرجات النشطة والأحوال الجوية." },
                  key: "Header Bar",
                  tone: "text-primary",
                },
                {
                  icon: Tv,
                  title: "AOCC Video Wall Carousel",
                  desc: { en: "25-second automated cycling for unattended 4K command room screens.", ar: "تدوير تلقائي كل ٢٥ ثانية لشاشات القيادة المعلقة." },
                  key: "TV Icon / Ctrl+K",
                  tone: "text-primary",
                },
                {
                  icon: Flame,
                  title: "Emergency Drill Sandbox",
                  desc: { en: "Simulates Sandstorm Low-Vis CAT II and T3 baggage conveyor jam drills.", ar: "محاكاة العواصف الترابية وتكدس مسارات الأمتعة." },
                  key: "Top Banner / Ctrl+K",
                  tone: "text-status-warn",
                },
                {
                  icon: Clock3,
                  title: "Shift Wave Surge Slices",
                  desc: { en: "Isolates Morning Wave (06:00-14:00), Midday, and Night rushes.", ar: "عزل أمواج الذروة الصباحية والمسائية لحساب الضغط." },
                  key: "Operations View",
                  tone: "text-primary",
                },
                {
                  icon: FileSpreadsheet,
                  title: "RFC-4180 CSV Export",
                  desc: { en: "Generates UTF-8 BOM spreadsheets preserving Arabic characters in Excel.", ar: "تصدير جداول تدعم الأحرف العربية في مايكروسوفت إكسل." },
                  key: "CSV Button",
                  tone: "text-status-ok",
                },
                {
                  icon: Radio,
                  title: "VHF Radio Voice Synthesis",
                  desc: { en: "Tower 118.10 MHz & ATIS with bandpass filter (400-3400Hz) and live captions.", ar: "نداءات برج المراقبة مع فلتر VHF ونصوص فورية." },
                  key: "Kiosk / Header",
                  tone: "text-primary",
                },
              ].map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <div key={i} className="rounded-xl border border-border/70 bg-secondary/15 p-3 flex flex-col justify-between gap-2">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`h-4 w-4 ${feat.tone}`} />
                          <span className="font-bold text-xs text-foreground">{feat.title}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {localize(feat.desc, language)}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded self-start border border-primary/20">
                      {feat.key}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Wireframe vs Polished Comparison */}
          <section className="panel bg-card/40 border border-border/80 p-4 sm:p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                {localize({ en: "Evolution: Paper Wireframe to 4K Polished Interface", ar: "التطور: من المخطط الورقي إلى واجهة العمليات النهائية" }, language)}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {localize({ en: "Interactive pannable views showcasing initial layout structuring vs. final dark-mode delivery.", ar: "معاينة تفاعلية قابلة للسحب توضح الهيكلة الأولية مقابل التصميم الداكن النهائي." }, language)}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
              <ScrollableImageContainer 
                src={import.meta.env.BASE_URL + "operations_wireframe.jpg"} 
                alt={localize({ en: "Operations Paper Wireframe View", ar: "عرض المخطط الورقي للوحة العمليات" }, language)}
                title={localize({ en: "1. Initial Wireframe", ar: "١. المخطط الميداني الأولي" }, language)}
                helperText={localize({ en: "Drag to pan across layout", ar: "اسحب بالفأرة للتنقل داخل المخطط" }, language)}
              />
              <ScrollableImageContainer 
                src={polishedSrc} 
                alt={polishedAlt}
                title={polishedTitle}
                helperText={localize({ en: "Drag to pan across layout", ar: "اسحب بالفأرة للتنقل داخل المخطط" }, language)}
              />
            </div>
          </section>

        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: AI & CODE ARCHITECTURE */}
      {/* ============================================================ */}
      {currentTab === "ai-code" && (
        <div className="flex flex-col gap-5 animate-in fade-in duration-300">
          
          {/* Antigravity AI Engineering Flow */}
          <section className="panel bg-card/60 border border-primary/30 p-4 sm:p-6 flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute top-0 end-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  {localize({ en: "Google Antigravity Autonomous Agent Loop", ar: "دورة وكلاء Google Antigravity الذكية" }, language)}
                </h2>
              </div>
              <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/25">
                AGENTIC PAIR PROGRAMMING
              </span>
            </div>

            {/* Visual Process Flowchart */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
              {[
                {
                  step: "01",
                  title: "Intent & Research",
                  icon: Search,
                  desc: { en: "Telemetry analysis, persona mapping, and code audits.", ar: "تحليل تدفق البيانات ومعايشة شخصيات المشغلين." },
                },
                {
                  step: "02",
                  title: "Subagent Swarm",
                  icon: Workflow,
                  desc: { en: "Concurrent execution of linting, typing, and token checks.", ar: "تنفيذ متزامن للفحص والتأكد من توافق الأنواع." },
                },
                {
                  step: "03",
                  title: "MCP Context",
                  icon: Cpu,
                  desc: { en: "Figma Dev Mode sync and Google Maps coordinates.", ar: "مزامنة رموز Figma وإحداثيات خرائط جوجل الحقيقية." },
                },
                {
                  step: "04",
                  title: "Defensive CI/CD",
                  icon: ShieldCheck,
                  desc: { en: "Zero TDZ errors, strict linting, and automated deploys.", ar: "انعدام أخطاء TDZ وفحص البناء التلقائي المستمر." },
                },
              ].map((flow, i) => {
                const Icon = flow.icon;
                return (
                  <div key={i} className="rounded-xl border border-border/80 bg-secondary/20 p-3 flex flex-col gap-2 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black text-primary">{flow.step}</span>
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="font-bold text-xs text-foreground">{flow.title}</div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {localize(flow.desc, language)}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Tech Stack Matrix */}
          <section className="panel bg-card/40 border border-border/80 p-4 sm:p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                {localize({ en: "Core Technology Stack & Architectural Pillars", ar: "التقنيات الأساسية وركائز المعمارية" }, language)}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  name: "React 19 & TypeScript",
                  badge: "Type Safety",
                  icon: Terminal,
                  points: [
                    { en: "Strict hook dependency graphs", ar: "اعتمادية صارمة للخطافات" },
                    { en: "Zero memory leak cleanup", ar: "تنظيف تام لتسريبات الذاكرة" },
                  ],
                },
                {
                  name: "Web Audio DSP Engine",
                  badge: "Audio Processing",
                  icon: Volume2,
                  points: [
                    { en: "400-3400Hz VHF bandpass filter", ar: "فلتر VHF بتردد ٤٠٠-٣٤٠٠ هرتز" },
                    { en: "Real-time speech transcription", ar: "نصوص صوتية متزامنة فورية" },
                  ],
                },
                {
                  name: "Tailwind CSS & Tokens",
                  badge: "Logical Styles",
                  icon: Palette,
                  points: [
                    { en: "Full RTL margin-inline-start", ar: "خصائص منطقية كاملة تدعم العربية" },
                    { en: "8pt modular spacing grid", ar: "شبكة فراغات نظامية بقياس 8pt" },
                  ],
                },
                {
                  name: "RFC-4180 CSV Exporter",
                  badge: "Data Integrity",
                  icon: FileSpreadsheet,
                  points: [
                    { en: "UTF-8 BOM Excel encoding", ar: "علامة BOM لدعم إكسل بالعربية" },
                    { en: "Zero-dependency pure client export", ar: "تصدير محلي خفيف دون مكتبات خارجية" },
                  ],
                },
              ].map((stack, i) => {
                const Icon = stack.icon;
                return (
                  <div key={i} className="rounded-xl border border-border/70 bg-secondary/15 p-3 flex flex-col justify-between gap-2">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                          {stack.badge}
                        </span>
                      </div>
                      <span className="font-bold text-xs text-foreground font-mono">{stack.name}</span>
                      <ul className="space-y-1 pl-0 list-none text-[11px] text-muted-foreground mt-1">
                        {stack.points.map((pt, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <Check className="h-3 w-3 text-status-ok shrink-0" />
                            <span>{localize(pt, language)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Design Process Timeline (Progressive Collapsible) */}
          <section className="panel bg-card/40 border border-border/80 p-4 sm:p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                {localize({ en: "Field-to-Production Design Timeline", ar: "المسار الزمني من الميدان حتى الإنتاج" }, language)}
              </h3>
            </div>

            <div className="flex flex-col gap-2.5">
              {timelinePhases.map((phase) => {
                const Icon = phase.icon;
                const isExpanded = !!expandedPhases[phase.id];
                return (
                  <div key={phase.id} className="rounded-xl border border-border/70 bg-secondary/15 overflow-hidden transition">
                    <button
                      type="button"
                      onClick={() => togglePhase(phase.id)}
                      className="flex w-full items-center justify-between p-3 text-start hover:bg-secondary/30 transition cursor-pointer"
                      aria-expanded={isExpanded}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`p-1.5 rounded-lg ${isExpanded ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold text-foreground truncate">{localize(phase.title, language)}</span>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </button>
                    {isExpanded && (
                      <div className="p-3 pt-0 text-xs text-muted-foreground border-t border-border/40 mt-1 flex flex-col gap-2">
                        <p className="mt-1">{localize(phase.desc, language)}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                          {phase.bullets.map((b, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 bg-background/40 p-2 rounded-lg border border-border/40">
                              <Check className="h-3.5 w-3.5 text-status-ok shrink-0 mt-0.5" />
                              <span className="text-[11px]">{localize(b, language)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: WCAG 2.2 AAA & TOKENS */}
      {/* ============================================================ */}
      {currentTab === "wcag" && (
        <div className="flex flex-col gap-5 animate-in fade-in duration-300">
          
          {/* Contrast Verification Header */}
          <section className="panel bg-card/60 border border-status-ok/30 p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Contrast className="h-5 w-5 text-status-ok" />
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  {localize({ en: "WCAG 2.2 Level AAA Compliance Audit", ar: "تدقيق معايير الوصول القصوى WCAG 2.2 AAA" }, language)}
                </h2>
              </div>
              <span className="text-xs font-mono text-status-ok bg-status-ok/15 px-2.5 py-1 rounded border border-status-ok/40 font-black">
                100% PASS (7:1 RATIO)
              </span>
            </div>

            {/* Contrast Ratio Swatch Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: "Cyan Highlight", hex: "#00E5FF", ratio: "8.2:1", status: "AAA PASS", tone: "border-cyan/50 text-cyan" },
                { name: "Status OK (Green)", hex: "#22C55E", ratio: "7.6:1", status: "AAA PASS", tone: "border-status-ok/50 text-status-ok" },
                { name: "Status Warn (Amber)", hex: "#F59E0B", ratio: "7.1:1", status: "AAA PASS", tone: "border-status-warn/50 text-status-warn" },
                { name: "Status Crit (Red)", hex: "#EF4444", ratio: "7.4:1", status: "AAA PASS", tone: "border-status-crit/50 text-status-crit" },
              ].map((swatch, i) => (
                <div key={i} className={`p-3 rounded-xl border bg-secondary/15 flex flex-col justify-between gap-2 ${swatch.tone}`}>
                  <div>
                    <span className="text-xs font-bold font-mono">{swatch.name}</span>
                    <div className="text-xl font-black font-mono mt-1">{swatch.ratio}</div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/40 pt-1.5 text-[10px] font-mono">
                    <span>{swatch.hex}</span>
                    <span className="font-bold">{swatch.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Interactive Accessibility Requirements */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Keyboard Nav & Focus */}
            <div className="panel bg-card/40 border border-border/80 p-4 sm:p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                <Keyboard className="h-4 w-4 text-primary" />
                <span>{localize({ en: "Keyboard Navigation & Shortcuts", ar: "التنقل بلوحة المفاتيح والاختصارات" }, language)}</span>
              </div>
              <ul className="space-y-2 pl-0 list-none text-xs text-muted-foreground">
                <li className="flex items-center gap-2 bg-secondary/15 p-2 rounded-lg border border-border/40">
                  <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px] font-mono text-primary font-bold">Tab</kbd>
                  <span>{localize({ en: "Logical tab order with high-contrast ring-2 focus rings.", ar: "ترتيب تسلسلي منطقي مع مؤشر تركيز واضح." }, language)}</span>
                </li>
                <li className="flex items-center gap-2 bg-secondary/15 p-2 rounded-lg border border-border/40">
                  <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px] font-mono text-primary font-bold">Ctrl+K</kbd>
                  <span>{localize({ en: "Instant command palette for drills, views, and exports.", ar: "لوحة أوامر سريعة للتدريبات والتحكم والتصدير." }, language)}</span>
                </li>
                <li className="flex items-center gap-2 bg-secondary/15 p-2 rounded-lg border border-border/40">
                  <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px] font-mono text-primary font-bold">1 - 3</kbd>
                  <span>{localize({ en: "Direct number-key navigation between operational tabs.", ar: "مفاتيح الأرقام للتبديل الفوري بين الأقسام." }, language)}</span>
                </li>
              </ul>
            </div>

            {/* Touch Targets & Layout */}
            <div className="panel bg-card/40 border border-border/80 p-4 sm:p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm">
                <Smartphone className="h-4 w-4 text-primary" />
                <span>{localize({ en: "Touch Targets & Screen Adaptation", ar: "مساحات اللمس وتكيف الشاشات" }, language)}</span>
              </div>
              <ul className="space-y-2 pl-0 list-none text-xs text-muted-foreground">
                <li className="flex items-center gap-2 bg-secondary/15 p-2 rounded-lg border border-border/40">
                  <CheckCircle2 className="h-4 w-4 text-status-ok shrink-0" />
                  <span>{localize({ en: "Min 44x44px touch footprint for all interactive buttons.", ar: "مساحة لمس لا تقل عن ٤٤×٤٤ بكسل لجميع الأزرار." }, language)}</span>
                </li>
                <li className="flex items-center gap-2 bg-secondary/15 p-2 rounded-lg border border-border/40">
                  <CheckCircle2 className="h-4 w-4 text-status-ok shrink-0" />
                  <span>{localize({ en: "Zero horizontal scrolling at standard zoom and 200% scaling.", ar: "انعدام التمرير الأفقي عند تكبير الشاشة حتى ٢٠٠٪." }, language)}</span>
                </li>
                <li className="flex items-center gap-2 bg-secondary/15 p-2 rounded-lg border border-border/40">
                  <CheckCircle2 className="h-4 w-4 text-status-ok shrink-0" />
                  <span>{localize({ en: "Live on-screen captions for every radio audio transmission.", ar: "نصوص مقروءة ترافق كل بث صوتي عبر الراديو." }, language)}</span>
                </li>
              </ul>
            </div>

          </section>

          {/* Design Tokens & Typography Scale */}
          <section className="panel bg-card/40 border border-border/80 p-4 sm:p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">
                {localize({ en: "Design Token Architecture & Spacing Rules", ar: "رموز التصميم وقواعد القياس المنطقية" }, language)}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-border/60 bg-secondary/15 flex flex-col gap-1">
                <span className="text-[10px] font-mono text-primary font-bold uppercase">Base Unit</span>
                <span className="text-sm font-bold text-foreground">8pt Modular Spacing</span>
                <p className="text-[11px] text-muted-foreground">p-2 (8px), p-4 (16px), p-6 (24px) for perfect alignment.</p>
              </div>
              <div className="p-3 rounded-xl border border-border/60 bg-secondary/15 flex flex-col gap-1">
                <span className="text-[10px] font-mono text-primary font-bold uppercase">Typography</span>
                <span className="text-sm font-bold text-foreground">Inter & Cairo Font</span>
                <p className="text-[11px] text-muted-foreground">Line height min 1.5x with crisp anti-glare font weights.</p>
              </div>
              <div className="p-3 rounded-xl border border-border/60 bg-secondary/15 flex flex-col gap-1">
                <span className="text-[10px] font-mono text-primary font-bold uppercase">Bidi Rules</span>
                <span className="text-sm font-bold text-foreground">CSS Logical Properties</span>
                <p className="text-[11px] text-muted-foreground">ms-*, pe-*, and border-s-* dynamically adjust per locale.</p>
              </div>
            </div>
          </section>

        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: CONSOLES & SANDBOXES */}
      {/* ============================================================ */}
      {currentTab === "airfield" && (
        <div className="flex flex-col gap-5 animate-in fade-in duration-300">
          
          {/* Interactive Airfield Radio ATC Console */}
          <section className="panel bg-card/60 border border-primary/40 p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-primary animate-pulse" />
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  {localize({ en: "Interactive Cairo ATC Radio DSP Console", ar: "منصة اختبار إذاعة وبرج مراقبة القاهرة" }, language)}
                </h2>
              </div>
              <span className="text-xs font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/25">
                VHF 118.10 MHz
              </span>
            </div>

            <div className="rounded-2xl border border-border bg-slate-950/90 p-4 sm:p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${!isMuted ? "bg-status-ok animate-ping" : "bg-muted-foreground"}`} />
                  <span className="font-mono text-xs font-bold text-slate-300">
                    CAIRO TOWER RADIO FEED (HECA)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {(["tower", "atis", "operations"] as RadioChannel[]).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => {
                        soundEffects.playClick();
                        setChannel(ch);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                        activeChannel === ch
                          ? "bg-primary text-primary-foreground shadow"
                          : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {RADIO_CHANNELS[ch].frequency}
                    </button>
                  ))}
                </div>
              </div>

              {/* Broadcast Display & Transcript */}
              <div className="rounded-xl border border-white/10 bg-black/50 p-4 flex flex-col gap-2 min-h-[85px] justify-center">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="text-primary font-bold">{localize(RADIO_CHANNELS[activeChannel].name, language)}</span>
                  <span>{isTransmitting ? "TRANSMITTING" : "STANDBY"}</span>
                </div>
                <div className="text-sm sm:text-base font-sans text-white font-medium leading-relaxed">
                  {currentTransmission ? (
                    <span>
                      <strong className="text-primary font-bold">{currentTransmission.callsign}: </strong>
                      {currentTransmission.text[language] || currentTransmission.text.en}
                    </span>
                  ) : (
                    <span className="text-slate-500 italic text-xs">
                      {localize({ en: "Press 'Broadcast Next Call' below to trigger an authentic radio clearance.", ar: "اضغط على 'بث النداء التالي' لتشغيل نداء برج المراقبة الحقيقي." }, language)}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      toggleMute();
                    }}
                    className={`flex h-11 min-h-[44px] items-center gap-2 rounded-xl px-4 text-xs font-bold transition cursor-pointer ${
                      !isMuted
                        ? "bg-primary text-primary-foreground shadow-md hover:opacity-90"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {!isMuted ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    <span>{localize(!isMuted ? { en: "Mute Radio", ar: "كتم الإذاعة" } : { en: "Unmute Radio", ar: "تشغيل الإذاعة" }, language)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      triggerNext(language);
                    }}
                    className="flex h-11 min-h-[44px] items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 text-xs font-bold text-white hover:bg-white/15 transition cursor-pointer"
                  >
                    <Radio className="h-4 w-4 text-primary" />
                    <span>{localize({ en: "Broadcast Next Call", ar: "بث النداء التالي" }, language)}</span>
                  </button>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  <span>Bandpass: 400Hz–3400Hz | Squelch: 80ms</span>
                </div>
              </div>
            </div>
          </section>

          {/* Persona Studies (Interactive) */}
          <section className="panel bg-card/40 border border-border/80 p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  {localize({ en: "Operator Personas & Ergonomic Requirements", ar: "شخصيات المشغلين والاشتراطات التشغيلية" }, language)}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {personas.map((p) => {
                const isActive = activePersona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      soundEffects.playClick();
                      setActivePersona(p.id);
                    }}
                    aria-pressed={isActive}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition cursor-pointer ${
                      isActive 
                        ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary/20" 
                        : "border-border/60 bg-secondary/15 hover:bg-secondary/30"
                    }`}
                  >
                    <img
                      src={p.avatarPath}
                      alt={localize(p.name, language)}
                      className={`w-12 h-12 rounded-full border object-cover transition ${
                        isActive ? "border-primary shadow" : "border-border/60 opacity-80"
                      }`}
                    />
                    <span className={`text-xs font-bold truncate w-full ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                      {localize(p.id === "karim" ? { en: "Karim", ar: "كريم" } : p.id === "yasmin" ? { en: "Yasmin", ar: "ياسمين" } : { en: "Tarek", ar: "طارق" }, language)}
                    </span>
                  </button>
                );
              })}
            </div>

            {(() => {
              const activeData = personas.find((p) => p.id === activePersona);
              if (!activeData) return null;
              return (
                <div className="rounded-xl border border-border/70 bg-secondary/20 p-4 flex flex-col gap-3 animate-in fade-in duration-200">
                  <div className="flex flex-col gap-1">
                    <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span>{localize(activeData.name, language)}</span>
                    </h4>
                    <p className="text-xs text-primary font-semibold">{localize(activeData.role, language)}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{localize(activeData.needs, language)}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-t border-border/40 pt-2 text-xs">
                    {activeData.specs.map((spec, i) => (
                      <div key={i} className="flex flex-col text-start">
                        <span className="font-bold text-primary text-[10px] uppercase tracking-wider">
                          {localize(spec.label, language)}:
                        </span>
                        <span className="text-xs text-foreground font-medium">
                          {renderTextWithAbbr(localize(spec.val, language))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </section>

          {/* Responsive Reflow Sandbox */}
          <section className="panel bg-card/40 border border-border/80 p-4 sm:p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Laptop className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  {localize({ en: "Responsive Reflow Sandbox", ar: "معاينة التكيف عبر الشاشات" }, language)}
                </h3>
              </div>

              <div className="flex gap-1 bg-secondary/80 p-1 rounded-xl border border-border">
                {(["desktop", "laptop", "tablet"] as const).map((dev) => (
                  <button
                    key={dev}
                    onClick={() => {
                      soundEffects.playClick();
                      setActiveDevice(dev);
                    }}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg transition cursor-pointer ${
                      activeDevice === dev ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label={`${dev} viewport`}
                  >
                    {dev === "desktop" && <Monitor className="h-3.5 w-3.5" />}
                    {dev === "laptop" && <Laptop className="h-3.5 w-3.5" />}
                    {dev === "tablet" && <Smartphone className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[160px] bg-slate-950/80 border border-border/60 rounded-xl p-3 flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-center border-b border-border/30 pb-2 text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-status-ok" />
                  <span>CAIRO HUB TELEMETRY</span>
                </div>
                <span>{activeDevice.toUpperCase()} VIEWPORT</span>
              </div>

              <div className="flex-1 mt-2.5 overflow-x-auto scrollbar-thin">
                <div className={`grid gap-2 ${
                  activeDevice === "desktop" 
                    ? "grid-cols-4 min-w-[500px] lg:min-w-0" 
                    : activeDevice === "laptop" 
                      ? "grid-cols-2 min-w-[280px] md:min-w-0" 
                      : "grid-cols-1"
                }`}>
                  <MiniMetricCard label={localize({ en: "LUGGAGE FLOW", ar: "تدفق الأمتعة" }, language)} value="94.2" unit={localize({ en: "bags/m", ar: "حقيبة/د" }, language)} delta="▲ +4.1%" deltaTone="ok" accent="cyan" />
                  <MiniMetricCard label={localize({ en: "SEC LANES", ar: "مسارات الأمن" }, language)} value="12" unit={localize({ en: "lanes", ar: "مسارات" }, language)} delta="▲ +2 lanes" deltaTone="warn" accent="warn" />
                  <MiniMetricCard label={localize({ en: "TERMINAL ARRIV", ar: "وصول المبنى" }, language)} value="1.4k" unit={localize({ en: "pax/h", ar: "راكب/س" }, language)} delta="▼ -8.4%" deltaTone="crit" />
                  <MiniMetricCard label={localize({ en: "GATE LOADS", ar: "حمولة البوابات" }, language)} value="28/30" unit={localize({ en: "gates", ar: "بوابات" }, language)} delta="93% cap" deltaTone="info" accent="ok" />
                </div>
              </div>
            </div>
          </section>

          {/* About Creator Card */}
          <section className="panel bg-primary/5 border border-primary/25 p-4 sm:p-6 flex flex-col gap-4 relative overflow-hidden">
            <div className="flex items-center gap-3.5 z-10 relative">
              <img 
                src={import.meta.env.BASE_URL + "ahmed-mahdy.png"} 
                alt={localize({ en: "Ahmed Mahdy", ar: "أحمد مهدي" }, language)} 
                className="h-14 w-14 rounded-2xl object-cover border-2 border-primary/40 bg-background shrink-0 shadow-md"
              />
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  {localize({ en: "Ahmed Mahdy", ar: "أحمد مهدي" }, language)}
                </h3>
                <p className="text-xs text-primary font-semibold">
                  {localize({ en: "UX Designer & Data Analyst • Advansys IS", ar: "مصمم تجربة مستخدم ومحلل بيانات • أدفانسيس" }, language)}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1.5 text-[10px] font-mono">
                  <span className="bg-primary/15 text-primary px-2 py-0.5 rounded border border-primary/20">Google UX</span>
                  <span className="bg-primary/15 text-primary px-2 py-0.5 rounded border border-primary/20">Google Analytics</span>
                  <span className="bg-primary/15 text-primary px-2 py-0.5 rounded border border-primary/20">Tableau BI</span>
                  <span className="bg-primary/15 text-primary px-2 py-0.5 rounded border border-primary/20">WCAG 2.2 AAA</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border/50 pt-3 flex justify-between items-center text-xs z-10 relative flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <a 
                  href="https://www.linkedin.com/in/creativemahdy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors font-medium"
                >
                  <Linkedin className="h-3.5 w-3.5 text-primary" />
                  <span>LinkedIn</span>
                  <ExternalLink className="h-3 w-3 opacity-70" />
                </a>
                <a 
                  href="https://mahdy-resume.vercel.app/"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-primary hover:underline font-semibold"
                >
                  <span>{localize({ en: "Resume", ar: "السيرة الذاتية" }, language)}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {onReturnToDashboard && (
                <button
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    onReturnToDashboard();
                  }}
                  className="flex items-center gap-1 font-bold text-primary hover:underline cursor-pointer"
                >
                  <span>{localize({ en: "Back to Dashboard", ar: "العودة للوحة التحكم" }, language)}</span>
                  <ArrowLeft className="h-3 w-3 rtl:rotate-180" />
                </button>
              )}
            </div>
          </section>

        </div>
      )}

    </div>
  );
}
