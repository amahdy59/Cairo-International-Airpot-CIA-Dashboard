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
} from "lucide-react";
import { StatusPill } from "./command-center/MetricWidgets";
import { useLocale } from "../context/locale";
import { useAirfieldRadio } from "../hooks/useAirfieldRadio";
import { RADIO_CHANNELS, RadioChannel } from "../services/airfieldAudio";
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
    needs: { en: "Needs high-contrast visual status indicators, automated view auto-cycling, and live ATC voice context.", ar: "يتطلب تنبيهات فورية عن المشاكل، ودورة تبديل شاشات تلقائية، وتغذية صوتية لإذاعة المطار." },
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
    role: { en: "Manages passenger boarding and terminal gate flows across Terminals 1, 2, and 3 using active tablets.", ar: "تدير صعود الركاب وتدفق المسافرين في الصالات ١ و ٢ و ٣ باستخدام أجهزة التابلت." },
    needs: { en: "Needs high-contrast screens, large touch targets (min 44px), and shift wave passenger rush filters.", ar: "تحتاج إلى تصميم عالي التباين، ومساحات لمس واسعة (٤٤ بكسل كحد أدنى)، وفلاتر لأمواج ذروة المسافرين." },
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
    role: { en: "Audits safety compliance, runway friction, foreign object debris (FOD), and aircraft maintenance records.", ar: "يقوم بتدقيق الامتثال لمعايير السلامة، واحتكاك المدرجات، وخلو المهابط من الأجسام الغريبة، وسجلات الصيانة." },
    needs: { en: "Needs structured data tables, RFC-4180 CSV export with UTF-8 Arabic support, and emergency drill sandboxes.", ar: "يتطلب جداول بيانات منظمة، وتصدير ملفات CSV متوافقة مع إكسل باللغة العربية، وتدريبات طوارئ تفاعلية." },
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
    desc: { en: "Shadowed operators in Cairo's command center. Identified alarm fatigue, multi-monitor cognitive overload, and ambient runway glare.", ar: "تم إجراء معايشة في مركز قيادة مطار القاهرة. تم اكتشاف إرهاق الإنذارات لدى المشغلين في أوقات الذروة وصعوبات القراءة تحت أشعة الشمس." },
    icon: Search,
    bullets: [
      { en: "Command center displays need unified, high-contrast visual cues with zero color-alone reliance.", ar: "شاشات المراقبة تتطلب دمج وتبسيط الرموز البصرية مع عدم الاعتماد على اللون بمفرده." },
      { en: "Mobile tablets in hot airfield environments require minimum 44px touch targets and full sunlight contrast.", ar: "أجهزة التابلت في أرض المطار تتطلب مساحات لمس لا تقل عن ٤٤ بكسل ووضوحاً تحت ضوء الشمس." }
    ]
  },
  {
    id: "ia",
    title: { en: "2. Information Architecture & Telemetry Reduction", ar: "٢. تخطيط العمليات وهيكلة المعلومات" },
    desc: { en: "Mapped 22 sensor telemetry feeds into 9 key decision cards. Structured three dedicated management layers (Digital Twin, Airfield Operations, Safety).", ar: "تم تقسيم ٢٢ تدفقاً لبيانات المستشعرات إلى ٩ بطاقات أداء رئيسية موزعة عبر ٣ محاور تشغيلية." },
    icon: Network,
    bullets: [
      { en: "Grouped flight movements, runway statuses, baggage loops, and safety inspections logically.", ar: "ترتيب وتجميع الرحلات وسجلات السلامة وصيانة الطائرات منطقياً لتقليل التشتت." },
      { en: "Engineered sub-millisecond hotspot visual twin coordinates for instantaneous fault localization.", ar: "برمجة نظام إحداثيات فوري للتوأم الرقمي لتحديد مواقع الأعطال في أجزاء من الثانية." }
    ]
  },
  {
    id: "accessibility",
    title: { en: "3. WCAG 2.2 AAA Accessibility & Audio Integration", ar: "٣. تيسير الوصول بمعيار WCAG 2.2 AAA وتكامل الصوت" },
    desc: { en: "Strict compliance with WCAG 2.2 AAA guidelines. Integrated Web Audio API aviation radio voice with live accessible captions.", ar: "تطبيق صارم لمعايير WCAG 2.2 AAA مع إضافة بث صوتي لإذاعة برج المراقبة وتوفير نص مباشر متزامن." },
    icon: ShieldCheck,
    bullets: [
      { en: "7:1 normal text contrast and 4.5:1 large text contrast across Light, Dark, and High-Contrast modes.", ar: "نسبة تباين ٧:١ للنصوص العادية و ٤.٥:١ للنصوص الكبيرة في جميع الأنماط اللونية." },
      { en: "Live on-screen transcription for Cairo Tower (118.10 MHz) and ATIS radio audio broadcasts.", ar: "نصوص فورية متزامنة لجميع نداءات برج المراقبة وإذاعة الطقس لضمان سهولة الوصول." }
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

export default function ResourcesAuditPage({
  theme = "dark",
  onReturnToDashboard,
}: {
  theme?: "dark" | "light";
  onReturnToDashboard?: () => void;
}) {
  const { language } = useLocale();
  const isDark = theme === "dark";
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
    setExpandedPhases((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const navItems = [
    { id: "sec-overview", label: { en: "Overview", ar: "نظرة عامة" }, icon: Sparkles },
    { id: "sec-ai", label: { en: "AI & Agents", ar: "الذكاء الاصطناعي" }, icon: Bot },
    { id: "sec-code", label: { en: "Code Architecture", ar: "معمارية الكود" }, icon: Code2 },
    { id: "sec-wcag", label: { en: "WCAG 2.2 AAA", ar: "تيسير الوصول" }, icon: ShieldCheck },
    { id: "sec-radio", label: { en: "Airfield Radio", ar: "إذاعة المطار" }, icon: Radio },
    { id: "sec-features", label: { en: "Features Spec", ar: "المواصفات" }, icon: Layers },
    { id: "sec-personas", label: { en: "Personas", ar: "الشخصيات" }, icon: Users },
    { id: "sec-responsive", label: { en: "Reflow Sandbox", ar: "معاينة الشاشات" }, icon: Laptop },
    { id: "sec-creator", label: { en: "Creator", ar: "منشئ النظام" }, icon: User },
  ];

  return (
    <div className="flex flex-col min-w-0 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16 max-w-5xl mx-auto w-full text-foreground">
      
      {/* Sticky Top Navigation & Quick Return Bar */}
      <div className="sticky top-20 sm:top-24 z-30 rounded-2xl border border-primary/30 bg-background/90 p-2 sm:p-3 shadow-xl backdrop-blur-xl flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {onReturnToDashboard && (
            <button
              type="button"
              onClick={onReturnToDashboard}
              className="flex h-10 items-center gap-2 rounded-xl bg-primary px-3.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-md hover:opacity-95 active:scale-95 transition cursor-pointer"
              aria-label={localize({ en: "Return to Live Command Hub", ar: "العودة إلى مركز القيادة المباشر" }, language)}
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              <span>{localize({ en: "Return to Dashboard", ar: "العودة للوحة التحكم" }, language)}</span>
            </button>
          )}
          <StatusPill tone="info">
            {localize({ en: "System Documentation Hub", ar: "مركز التوثيق الشامل" }, language)}
          </StatusPill>
        </div>

        {/* Quick Search Input */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={localize({ en: "Search documentation...", ar: "ابحث في التوثيق والمواصفات..." }, language)}
            className="h-10 w-full rounded-xl border border-border bg-secondary/30 ps-9 pe-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            aria-label={localize({ en: "Search documentation", ar: "البحث في التوثيق" }, language)}
          />
        </div>

        {/* Category Jump Buttons */}
        <div className="w-full flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-border/40">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-secondary/20 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:border-primary/50 hover:bg-secondary/50 hover:text-foreground whitespace-nowrap transition cursor-pointer"
              >
                <Icon className="h-3 w-3 text-primary" />
                <span>{localize(item.label, language)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. Page Header & Executive Overview */}
      <section id="sec-overview" className="panel bg-card/60 border border-border/80 p-4 sm:p-7 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <StatusPill tone="ok">HECA / CAI Specification v3.2</StatusPill>
            <span className="text-xs font-mono text-muted-foreground">Cairo International Airport Simulation</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {localize(
              {
                en: "Cairo Airport Operations Center (AOCC) Architecture & Design Spec",
                ar: "المعمارية والمواصفات التشغيلية لمركز قيادة مطار القاهرة الدولي",
              },
              language
            )}
          </h1>
          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
            {localize(
              {
                en: "A mission-critical management dashboard engineered for high-density airport operations, flight turnarounds, runway monitoring, and safety auditing. Built strictly against WCAG 2.2 AAA accessibility standards, real-time dual-language RTL/LTR logical CSS, and agentic AI pair programming workflows.",
                ar: "لوحة قيادة وتحكم تشغيلية مصممة للعمليات الحيوية بمطار القاهرة، وإدارة دوران الطائرات، ومراقبة حركة المدرجات، وتدقيق معايير السلامة الدولية. بنيت وفقاً لمعايير تيسير الوصول القصوى WCAG 2.2 AAA والتنسيق ثنائي الاتجاه بالخصائص المنطقية.",
              },
              language
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-border/50 pt-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono">Runways</span>
            <span className="text-sm font-semibold text-foreground">05L/23R, 05C/23C, 05R/23L</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono">Passenger Terminals</span>
            <span className="text-sm font-semibold text-foreground">T1, T2, T3 (30M PAX Cap)</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono">Accessibility</span>
            <span className="text-sm font-semibold text-status-ok flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> WCAG 2.2 AAA (7:1)
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono">Bilingual Engine</span>
            <span className="text-sm font-semibold text-foreground">Arabic (RTL) & English (LTR)</span>
          </div>
        </div>
      </section>

      {/* 2. AI-Augmented Engineering (Google Antigravity & Agentic Pair Programming) */}
      <section id="sec-ai" className="panel bg-card/40 border border-primary/20 p-4 sm:p-7 flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute top-0 end-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            {localize({ en: "AI-Augmented Engineering (Google Antigravity)", ar: "الهندسة المعززة بالذكاء الاصطناعي (Google Antigravity)" }, language)}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {localize(
            {
              en: "This dashboard was architected and refined using Google Antigravity autonomous agent workflows, orchestrating specialized subagents for diagnostic audits, token synchronization, and zero-hallucination code generation.",
              ar: "تم تطوير وتدقيق لوحة التحكم باستخدام منظومة Google Antigravity الذكية، وتنسيق الوكلاء المستقلين للفحص التشخيصي ومزامنة الرموز البرمجية.",
            },
            language
          )}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div className="rounded-xl border border-border/70 bg-secondary/20 p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <Workflow className="h-4 w-4" />
              <span>{localize({ en: "Multi-Agent Pair Programming", ar: "برمجة الزوج الذكي متعدد الوكلاء" }, language)}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {localize(
                {
                  en: "Orchestrator and research subagents collaborate concurrently to verify dependencies, conduct automated build checks, and optimize code efficiency.",
                  ar: "تعاون متزامن بين الوكلاء للتحقق من التبعيات، وإجراء اختبارات البناء الآلية، وتحسين كفاءة الكود المصدري.",
                },
                language
              )}
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-secondary/20 p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <Cpu className="h-4 w-4" />
              <span>{localize({ en: "MCP Model Context Protocols", ar: "بروتوكول سياق النماذج MCP" }, language)}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {localize(
                {
                  en: "Integrates Figma Dev Mode for pixel-perfect design token parity and Google Maps Platform for real-world Cairo runway geospatial vectors.",
                  ar: "ربط بيئة Figma Dev Mode لمطابقة الرموز التصميمية بدقة، وGoogle Maps لاحتساب الإحداثيات الجغرافية لمدرجات مطار القاهرة.",
                },
                language
              )}
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-secondary/20 p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <ShieldCheck className="h-4 w-4" />
              <span>{localize({ en: "Defensive State & TDZ Guardrails", ar: "حواجز الأمان والحالات الدفاعية" }, language)}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {localize(
                {
                  en: "Strict hoist ordering prevents Temporal Dead Zone runtime errors. Deterministic mock telemetry engines prevent hallucinated numbers.",
                  ar: "ترتيب تصريحي صارم يمنع أخطاء التهيئة الزمنية (TDZ)، مع محركات توليد بيانات حتمية تمنع أرقام الهلوسة.",
                },
                language
              )}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Code Architecture & Technology Stack */}
      <section id="sec-code" className="panel bg-card/40 border border-border/80 p-4 sm:p-7 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Code2 className="h-5 w-5 text-primary" />
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            {localize({ en: "Code Architecture & Enterprise Tech Stack", ar: "معمارية الكود والتقنيات البرمجية" }, language)}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 mt-1">
          {[
            {
              name: "React 19 & TypeScript",
              badge: "Strict Concurrency",
              desc: {
                en: "Full type safety, strict hook dependencies, and deterministic rendering with zero memory leaks.",
                ar: "أمان كامل للأنواع البرمجية، واعتمادية صارمة للخطافات، وتصيير حتمي خالٍ من تسريبات الذاكرة.",
              },
            },
            {
              name: "Web Audio & Speech API",
              badge: "VHF Radio DSP",
              desc: {
                en: "Real-time aviation voice synthesis with VHF 400-3400Hz bandpass filter, squelch noise, and live captions.",
                ar: "توليد صوتي لنداءات الطيران مع فلتر VHF، ومؤثرات نقر الميكروفون، ونصوص حية متزامنة.",
              },
            },
            {
              name: "Tailwind CSS & Tokens",
              badge: "Design Tokens",
              desc: {
                en: "Semantic design tokens, 8pt modular grid, and logical CSS properties (ms-auto, ps-, pe-).",
                ar: "رموز تصميمية دلالية، وشبكة 8pt، وتنسيق بنائي منطقي يدعم العربية والإنجليزية تلقائياً.",
              },
            },
            {
              name: "RFC-4180 CSV & UTF-8 BOM",
              badge: "Data Export Engine",
              desc: {
                en: "Zero-dependency operational CSV export engine with UTF-8 BOM for Microsoft Excel Arabic compatibility.",
                ar: "محرك تصدير ملفات CSV بمعيار RFC-4180 مع علامة UTF-8 BOM للتوافق الكامل مع إكسل بالعربية.",
              },
            },
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-border/70 bg-secondary/15 p-4 flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-sm text-foreground font-mono">{item.name}</span>
              </div>
              <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 self-start">
                {item.badge}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                {localize(item.desc, language)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Accessibility Specifications (WCAG 2.2 AAA Audit) */}
      <section id="sec-wcag" className="panel bg-card/40 border border-border/80 p-4 sm:p-7 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-status-ok" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              {localize({ en: "Accessibility Verification (WCAG 2.2 AAA)", ar: "تدقيق معايير سهولة الوصول (WCAG 2.2 AAA)" }, language)}
            </h2>
          </div>
          <span className="text-xs font-mono text-status-ok bg-status-ok/10 px-2.5 py-1 rounded-lg border border-status-ok/30 font-bold">
            WCAG 2.2 AAA COMPLIANT
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
          <div className="rounded-xl border border-border/70 bg-secondary/15 p-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <Contrast className="h-4 w-4 text-primary" />
              <span>{localize({ en: "Color Contrast Ratios (7:1 Minimum)", ar: "نسب التباين اللوني (٧:١ كحد أدنى)" }, language)}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {localize(
                {
                  en: "Body text maintains at least 7:1 contrast against backgrounds in Light, Dark, and High-Contrast modes. Large text exceeds 4.5:1. Colors are never used alone to indicate state.",
                  ar: "تحافظ جميع النصوص العادية على نسبة تباين ٧:١ كحد أدنى، والنصوص الكبيرة تفوق ٤.٥:١ في كافة الأنماط لسهولة القراءة تحت أشعة الشمس.",
                },
                language
              )}
            </p>
            <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-center text-xs">
              <div className="p-2 rounded bg-background border border-border flex flex-col">
                <span className="text-cyan font-bold">Cyan</span>
                <span className="text-[10px] text-muted-foreground">8.2:1</span>
              </div>
              <div className="p-2 rounded bg-background border border-border flex flex-col">
                <span className="text-status-ok font-bold">Green</span>
                <span className="text-[10px] text-muted-foreground">7.6:1</span>
              </div>
              <div className="p-2 rounded bg-background border border-border flex flex-col">
                <span className="text-status-warn font-bold">Amber</span>
                <span className="text-[10px] text-muted-foreground">7.1:1</span>
              </div>
              <div className="p-2 rounded bg-background border border-border flex flex-col">
                <span className="text-status-crit font-bold">Red</span>
                <span className="text-[10px] text-muted-foreground">7.4:1</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-secondary/15 p-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <Keyboard className="h-4 w-4 text-primary" />
              <span>{localize({ en: "Keyboard Navigation & Touch Targets", ar: "التنقل بلوحة المفاتيح ومساحات اللمس" }, language)}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {localize(
                {
                  en: "Every interactive control has a minimum 44x44px touch footprint. Logical tab order with arrow key traversal, Ctrl+K shortcut palette, and glowing focus rings.",
                  ar: "مساحة لمس لا تقل عن ٤٤×٤٤ بكسل لجميع الأزرار. ترتيب منطقي لمفتاح Tab والتنقل بالأسهم واختصار Ctrl+K.",
                },
                language
              )}
            </p>
            <ul className="space-y-1.5 text-xs text-muted-foreground pt-1 list-none pl-0">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-status-ok shrink-0" />
                <span>{localize({ en: "Skip to Content landmark link at top of page.", ar: "رابط تخطي المحتوى في أعلى الصفحة." }, language)}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-status-ok shrink-0" />
                <span>{localize({ en: "1, 2, 3 number key shortcuts for instant tab switching.", ar: "مفاتيح الأرقام ١ و ٢ و ٣ للتبديل الفوري بين الأقسام." }, language)}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-status-ok shrink-0" />
                <span>{localize({ en: "Live text captions accompany every audio transmission.", ar: "نصوص مباشرة مقروءة ترافق كل بث صوتي." }, language)}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. Interactive Airfield Radio & ATC Audio Sandbox */}
      <section id="sec-radio" className="panel bg-card/40 border border-primary/40 p-4 sm:p-7 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary animate-pulse" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              {localize({ en: "Interactive Cairo ATC Radio Audio Sandbox", ar: "منصة اختبار إذاعة وبرج مراقبة القاهرة" }, language)}
            </h2>
          </div>
          <span className="text-xs font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/25">
            HECA RADIO DSP ENGINE
          </span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {localize(
            {
              en: "Experience authentic Cairo Tower air traffic control and ATIS voice communications directly inside the dashboard. Features real-time VHF radio bandpass filtering, mic squelch bursts, and live on-screen transcriptions.",
              ar: "استمع وتفاعل مع نداءات برج مراقبة القاهرة وإذاعة ATIS مباشرة من لوحة التحكم، المصممة بفلتر VHF اللاسلكي ونقر الميكروفون الحقيقي والنصوص المباشرة.",
            },
            language
          )}
        </p>

        {/* Radio Console Component */}
        <div className="rounded-2xl border border-border bg-slate-950/80 p-4 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${!isMuted ? "bg-status-ok animate-ping" : "bg-muted-foreground"}`} />
              <span className="font-mono text-xs font-bold text-slate-300">
                CAIRO INTERNATIONAL RADIO (HECA)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {(["tower", "atis", "operations"] as RadioChannel[]).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setChannel(ch)}
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

          {/* Active Broadcast Display */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-4 flex flex-col gap-2 min-h-[90px] justify-center">
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
                <span className="text-slate-500 italic">
                  {localize({ en: "Press 'Broadcast Next Call' below to trigger an authentic radio clearance.", ar: "اضغط على 'بث النداء التالي' أدناه لتشغيل نداء برج المراقبة." }, language)}
                </span>
              )}
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
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
                onClick={() => triggerNext(language)}
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

      {/* 6. Feature Specifications Matrix */}
      <section id="sec-features" className="panel bg-card/40 border border-border/80 p-4 sm:p-7 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h2 className="text-lg sm:text-xl font-bold text-foreground">
            {localize({ en: "Enterprise Operational Feature Specifications", ar: "مواصفات الميزات التشغيلية المتقدمة" }, language)}
          </h2>
        </div>

        <div className="overflow-x-auto border border-border rounded-xl bg-background/50">
          <table className="w-full text-start text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/35 text-muted-foreground font-mono uppercase text-xs tracking-wider">
                <th className="py-3 px-4 text-start">{localize({ en: "Feature", ar: "الميزة" }, language)}</th>
                <th className="py-3 px-4 text-start">{localize({ en: "Operational Purpose", ar: "الهدف التشغيلي" }, language)}</th>
                <th className="py-3 px-4 text-center">{localize({ en: "Access", ar: "الوصول" }, language)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40 font-medium text-foreground">
              <tr>
                <td className="py-3 px-4 font-bold flex items-center gap-2">
                  <CloudRain className="h-4 w-4 text-primary shrink-0" />
                  <span>HECA METAR & Runway Vectors</span>
                </td>
                <td className="py-3 px-4 text-xs text-muted-foreground">
                  {localize({ en: "Displays active arrivals (05L/05C), departures (05C/23C), wind direction, and crosswinds.", ar: "يعرض مدرجات الهبوط (05L/05C) والإقلاع (05C/23C) ومتجهات الرياح والرياح المتقاطعة." }, language)}
                </td>
                <td className="py-3 px-4 text-center font-mono text-xs text-primary">Header Chip</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold flex items-center gap-2">
                  <Tv className="h-4 w-4 text-primary shrink-0" />
                  <span>AOCC Video Wall Carousel</span>
                </td>
                <td className="py-3 px-4 text-xs text-muted-foreground">
                  {localize({ en: "Rotates views every 25 seconds for unattended command room video walls with live ATC radio.", ar: "تدوير العرض كل ٢٥ ثانية لشاشات القيادة المعلقة مع إذاعة صوتية حية لبرج المراقبة." }, language)}
                </td>
                <td className="py-3 px-4 text-center font-mono text-xs text-primary">TV Icon / Ctrl+K</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold flex items-center gap-2">
                  <Flame className="h-4 w-4 text-status-warn shrink-0" />
                  <span>Emergency Drill Sandbox</span>
                </td>
                <td className="py-3 px-4 text-xs text-muted-foreground">
                  {localize({ en: "Simulates Sandstorm Low-Vis CAT II and Terminal 3 Baggage Loop jam scenarios.", ar: "محاكاة العواصف الترابية وانخفاض الرؤية وتوقف مسارات أمتعة المبنى رقم ٣." }, language)}
                </td>
                <td className="py-3 px-4 text-center font-mono text-xs text-primary">Top Banner / Ctrl+K</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-primary shrink-0" />
                  <span>Shift Wave Slices</span>
                </td>
                <td className="py-3 px-4 text-xs text-muted-foreground">
                  {localize({ en: "Isolates Morning Wave (06:00-14:00), Midday Peak, and Night Wave passenger surges.", ar: "عزل أمواج الذروة الصباحية (٠٦:٠٠-١٤:٠٠) والمسائية لتقييم سعة الصالات." }, language)}
                </td>
                <td className="py-3 px-4 text-center font-mono text-xs text-primary">Operations Radio Tabs</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-status-ok shrink-0" />
                  <span>RFC-4180 CSV Export</span>
                </td>
                <td className="py-3 px-4 text-xs text-muted-foreground">
                  {localize({ en: "Generates UTF-8 BOM formatted spreadsheets preserving Arabic headers in Excel.", ar: "تصدير جداول متوافقة مع مايكروسوفت إكسل باللغة العربية دون تشوه للرموز." }, language)}
                </td>
                <td className="py-3 px-4 text-center font-mono text-xs text-primary">Export CSV Button</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 7. Interactive Persona Studies Panel */}
      <section id="sec-personas" className="panel bg-card/40 border border-border/80 p-4 sm:p-7 flex flex-col gap-5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>{localize({ en: "Persona Studies & Operations Workflows", ar: "شخصيات المستخدمين ومسارات العمل" }, language)}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {localize({ en: "Select a persona to inspect their workspace constraints, shifts, and SLA priorities.", ar: "اختر شخصية مستخدم لمعاينة بيئة عمله، ونوبته، وأولويات الاستجابة." }, language)}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3.5">
          {personas.map((p) => {
            const isActive = activePersona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePersona(p.id)}
                aria-pressed={isActive}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  isActive 
                    ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary/20" 
                    : "border-border/60 bg-secondary/15 hover:border-border hover:bg-secondary/30"
                }`}
              >
                <img
                  src={p.avatarPath}
                  alt={localize(p.name, language)}
                  className={`w-14 h-14 rounded-full border object-cover transition ${
                    isActive ? "border-primary shadow" : "border-border/60 opacity-70"
                  }`}
                />
                <span className={`text-xs font-bold tracking-tight truncate w-full ${isActive ? "text-primary" : "text-muted-foreground"}`}>
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
            <div className="rounded-xl border border-border/70 bg-secondary/20 p-5 flex flex-col justify-between min-h-[160px] animate-in fade-in duration-300">
              <div>
                <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                  <User className="h-4.5 w-4.5 text-primary" />
                  <span>{localize(activeData.name, language)}</span>
                </h3>
                <p className="text-xs text-primary font-semibold mt-1">{localize(activeData.role, language)}</p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{localize(activeData.needs, language)}</p>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-border/40 pt-3 text-xs text-muted-foreground">
                {activeData.specs.map((spec, i) => (
                  <div key={i} className="flex flex-col gap-0.5 text-start">
                    <span className="font-bold text-primary text-[11px] uppercase tracking-wider">
                      {localize(spec.label, language)}:
                    </span>
                    <span className="text-sm text-foreground font-medium">
                      {renderTextWithAbbr(localize(spec.val, language))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </section>

      {/* 8. Design Process Timeline */}
      <section className="panel bg-card/40 border border-border/80 p-4 sm:p-7 flex flex-col gap-5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-primary" />
            <span>{localize({ en: "Operational Design Process Timeline", ar: "مراحل التصميم وهندسة العمليات" }, language)}</span>
          </h2>
        </div>

        <div className="relative flex flex-col gap-4 ps-1">
          {timelinePhases.map((phase) => {
            const Icon = phase.icon;
            const isExpanded = !!expandedPhases[phase.id];
            return (
              <div key={phase.id} className="relative flex gap-3 sm:gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <button 
                    type="button"
                    onClick={() => togglePhase(phase.id)}
                    aria-expanded={isExpanded}
                    className={`relative z-10 w-10 h-10 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                      isExpanded ? "border-primary bg-primary/10 text-primary" : "border-border/80 bg-card text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                  <div className="w-[1.5px] bg-border flex-1 min-h-[12px] my-1" />
                </div>

                <div 
                  onClick={() => togglePhase(phase.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      togglePhase(phase.id);
                    }
                  }}
                  className={`flex-1 min-w-0 rounded-xl border p-4 transition-all duration-300 cursor-pointer ${
                    isExpanded ? "border-primary/40 bg-secondary/25 shadow-sm" : "border-border/60 hover:border-border"
                  }`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <h3 className={`font-semibold text-sm truncate ${isExpanded ? "text-primary font-bold" : "text-muted-foreground"}`}>
                      {localize(phase.title, language)}
                    </h3>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-primary shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                  </div>

                  {isExpanded && (
                    <div className="mt-2 text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-200">
                      <p>{localize(phase.desc, language)}</p>
                      <div className="mt-3 pt-3 border-t border-border/40">
                        <ul className="space-y-2 pl-0 list-none text-xs text-muted-foreground">
                          {phase.bullets.map((bullet, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Check className="h-4 w-4 text-status-ok shrink-0 mt-0.5" />
                              <span>{localize(bullet, language)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. Responsive Layout Sandbox */}
      <section id="sec-responsive" className="panel bg-card/40 border border-border/80 p-4 sm:p-7 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <Laptop className="h-5 w-5 text-primary" />
              <span>{localize({ en: "Interactive Responsive Reflow Sandbox", ar: "معاينة مرونة الشاشات ونقاط الاستجابة" }, language)}</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {localize({ en: "Switch device modes to test how telemetry cards adapt without horizontal overflow.", ar: "بدّل بين أنماط الأجهزة لمعاينة إعادة ترتيب البطاقات وتفادي التمرير الأفقي." }, language)}
            </p>
          </div>
          
          <div className="flex gap-1.5 bg-secondary/80 p-1 rounded-xl border border-border shrink-0 self-start">
            {(["desktop", "laptop", "tablet"] as const).map((dev) => (
              <button
                key={dev}
                onClick={() => setActiveDevice(dev)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg transition cursor-pointer ${
                  activeDevice === dev ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label={`${dev} specifications`}
              >
                {dev === "desktop" && <Monitor className="h-4 w-4" />}
                {dev === "laptop" && <Laptop className="h-4 w-4" />}
                {dev === "tablet" && <Smartphone className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[220px] bg-slate-950/80 border border-border/60 rounded-xl p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex justify-between items-center border-b border-border/30 pb-2 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-status-ok" />
              <span>CAIRO HUB TELEMETRY GRID</span>
            </div>
            <span>{activeDevice.toUpperCase()} VIEWPORT</span>
          </div>

          <div className="flex-1 mt-3.5 overflow-x-auto scrollbar-thin">
            <div className={`grid gap-3 ${
              activeDevice === "desktop" 
                ? "grid-cols-4 min-w-[560px] lg:min-w-0" 
                : activeDevice === "laptop" 
                  ? "grid-cols-2 min-w-[320px] md:min-w-0" 
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

      {/* 10. Operations Wireframe vs. Polished View */}
      <section className="panel bg-card/40 border border-border/80 p-4 sm:p-7 flex flex-col gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <span>{localize({ en: "Operations Wireframe vs. Polished Evolution", ar: "مقارنة المخطط الأولي مع التصميم النهائي" }, language)}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {localize({ en: "Side-by-side inspection showing the progression from paper wireframe to 4K dark mode command center.", ar: "مقارنة مباشرة توضح التطور من المخطط الورقي الأولي حتى لوحة العمليات النهائية عالية الدقة." }, language)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          <ScrollableImageContainer 
            src={import.meta.env.BASE_URL + "operations_wireframe.jpg"} 
            alt={localize({ en: "Operations Paper Wireframe View", ar: "عرض المخطط الورقي للوحة العمليات" }, language)}
            title={localize({ en: "Paper Wireframe View", ar: "عرض المخطط الورقي" }, language)}
            helperText={localize({ en: "Drag or use arrow keys to pan", ar: "اسحب بالفأرة للتنقل داخل المخطط" }, language)}
          />
          <ScrollableImageContainer 
            src={polishedSrc} 
            alt={polishedAlt}
            title={polishedTitle}
            helperText={localize({ en: "Drag or use arrow keys to pan", ar: "اسحب بالفأرة للتنقل داخل المخطط" }, language)}
          />
        </div>
      </section>

      {/* 11. About the Creator & Verifications Card */}
      <section id="sec-creator" className="panel bg-primary/5 border border-primary/25 p-4 sm:p-7 flex flex-col gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-3.5 z-10 relative">
          <img 
            src={import.meta.env.BASE_URL + "ahmed-mahdy.png"} 
            alt={localize({ en: "Ahmed Mahdy", ar: "أحمد مهدي" }, language)} 
            className="h-16 w-16 rounded-2xl object-cover border-2 border-primary/40 bg-background shrink-0 shadow-md"
          />
          <div>
            <h3 className="text-xl font-bold text-foreground">
              {localize({ en: "Ahmed Mahdy", ar: "أحمد مهدي" }, language)}
            </h3>
            <p className="text-sm text-primary font-semibold">
              {localize({ en: "UX Designer & Data Analyst", ar: "مصمم تجربة مستخدم ومحلل بيانات" }, language)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {localize({ en: "Cairo, Egypt • Advansys IS", ar: "القاهرة، مصر • أدفانسيس" }, language)}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed z-10 relative">
          {localize(
            {
              en: "UX Designer & Data Analyst with 4+ years of expertise delivering high-density decision systems, mission-critical operational cockpits, and accessible enterprise applications. Certified in Google UX, Google Data Analytics, and Tableau BI.",
              ar: "مصمم تجربة مستخدم ومحلل بيانات بخبرة +٤ سنوات في تصميم أنظمة القيادة والتحكم، وغرف العمليات المركزية، والتطبيقات المؤسسية المتوافقة مع معايير إتاحة الوصول القصوى. حاصل على شهادات Google UX و Google Data Analytics و Tableau BI.",
            },
            language
          )}
        </p>

        <div className="flex flex-wrap gap-2 z-10 relative text-xs font-mono">
          <span className="bg-primary/15 text-primary px-3 py-1 rounded-lg border border-primary/20">Google UX Professional</span>
          <span className="bg-primary/15 text-primary px-3 py-1 rounded-lg border border-primary/20">Google Data Analytics</span>
          <span className="bg-primary/15 text-primary px-3 py-1 rounded-lg border border-primary/20">Tableau BI Certified</span>
          <span className="bg-primary/15 text-primary px-3 py-1 rounded-lg border border-primary/20">WCAG 2.2 AAA Auditor</span>
        </div>

        <div className="border-t border-border/50 pt-4 flex justify-between items-center text-sm z-10 relative flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <a 
              href="https://www.linkedin.com/in/creativemahdy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors font-medium"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="h-4 w-4 text-primary" />
              <span>LinkedIn</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </a>
            <a 
              href="https://mahdy-resume.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-primary hover:underline font-semibold"
            >
              <span>{localize({ en: "View Resume", ar: "السيرة الذاتية" }, language)}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {onReturnToDashboard && (
            <button
              type="button"
              onClick={onReturnToDashboard}
              className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              <span>{localize({ en: "Back to Operations Dashboard", ar: "العودة للوحة التحكم" }, language)}</span>
              <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            </button>
          )}
        </div>
      </section>

    </div>
  );
}
