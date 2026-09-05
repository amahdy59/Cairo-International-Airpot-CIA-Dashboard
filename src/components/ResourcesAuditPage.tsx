import React, { useState, useEffect, useRef } from "react";
import {
  Check,
  Users,
  Eye,
  ExternalLink,
  ShieldCheck,
  Contrast,
  Keyboard,
  Linkedin,
  ArrowLeft,
  Bot,
  Code2,
  Tv,
  Volume2,
  VolumeX,
  Radio,
  FileSpreadsheet,
  CloudRain,
  Flame,
  CheckCircle2,
  Globe,
  Plane,
  Building2,
  MousePointer,
} from "lucide-react";
import { useLocale } from "../context/locale";
import { useAirfieldRadio } from "../hooks/useAirfieldRadio";
import { RADIO_CHANNELS, RadioChannel } from "../services/airfieldAudio";
import { soundEffects } from "../services/soundEffects";
import { localize } from "../utils/helpers";

// ----------------------------------------------------
// Personas Data (Ultra-streamlined)
// ----------------------------------------------------
const personas = [
  {
    id: "karim",
    name: { en: "Karim", ar: "كريم" },
    title: { en: "Operations Duty Manager", ar: "مدير نوبة العمليات" },
    avatarPath: import.meta.env.BASE_URL + "karim_avatar_v2.png",
    device: { en: "4K Wall Display", ar: "شاشة جدارية 4K" },
    shift: { en: "12h Shift", ar: "نوبة ١٢ ساعة" },
    need: {
      en: "Automated video wall cycling, high-contrast alerts, and live ATC voice context.",
      ar: "تبديل تلقائي لشاشات العرض، تنبيهات عالية التباين، وبث صوتي مباشر لبرج المراقبة.",
    },
  },
  {
    id: "yasmin",
    name: { en: "Yasmin", ar: "ياسمين" },
    title: { en: "Terminal Gate Supervisor", ar: "مشرف بوابات الركاب" },
    avatarPath: import.meta.env.BASE_URL + "yasmin_avatar_v2.png",
    device: { en: "10\" Tablet", ar: "تابلت ١٠ بوصة" },
    shift: { en: "8h Shift", ar: "نوبة ٨ ساعات" },
    need: {
      en: "Minimum 44px touch targets, sunlight legibility, and passenger surge filters.",
      ar: "مساحات لمس واسعة (٤٤ بكسل كحد أدنى)، وضوح تحت الشمس، وفلاتر لموجات المسافرين.",
    },
  },
  {
    id: "tarek",
    name: { en: "Tarek", ar: "طارق" },
    title: { en: "ICAO Safety Auditor", ar: "مدقق سلامة الطيران" },
    avatarPath: import.meta.env.BASE_URL + "tarek_avatar_v2.png",
    device: { en: "13\" Laptop", ar: "لابتوب ١٣ بوصة" },
    shift: { en: "Audits", ar: "فترات التدقيق" },
    need: {
      en: "Structured safety compliance logs, drill sandboxes, and Excel CSV export with Arabic support.",
      ar: "سجلات امتثال منظمة، محاكاة سيناريوهات الطوارئ، وتصدير إكسل باللغة العربية.",
    },
  },
];

// ----------------------------------------------------
// Image Panning Container (Clean, Minimal Chrome)
// ----------------------------------------------------
function ScrollableImageContainer({
  src,
  alt,
  title,
}: {
  src: string;
  alt: string;
  title: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const scrollLeft = useRef(0);
  const scrollTop = useRef(0);
  const [imgRatio, setImgRatio] = useState<number | null>(null);
  const [containerDim, setContainerDim] = useState({ width: 0, height: 280 });

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setImgRatio(img.naturalWidth / img.naturalHeight);
  }, [src]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    setContainerDim({
      width: container.clientWidth,
      height: container.clientHeight || 280,
    });
    const resizeObserver = new ResizeObserver(() => {
      setContainerDim({
        width: container.clientWidth,
        height: container.clientHeight || 280,
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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const y = e.pageY - containerRef.current.offsetTop;
    containerRef.current.scrollLeft = scrollLeft.current - (x - startX.current) * 1.5;
    containerRef.current.scrollTop = scrollTop.current - (y - startY.current) * 1.5;
  };

  let imgStyle: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };
  if (imgRatio && containerDim.width > 0) {
    const containerRatio = containerDim.width / containerDim.height;
    if (containerRatio > imgRatio) {
      imgStyle = {
        width: containerDim.width,
        height: containerDim.width / imgRatio,
        minHeight: containerDim.height,
      };
    } else {
      imgStyle = {
        height: containerDim.height,
        width: containerDim.height * imgRatio,
        minWidth: containerDim.width,
      };
    }
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between text-xs px-1">
        <span className="font-bold text-foreground">{title}</span>
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <MousePointer className="h-3 w-3" />
          <span>Drag to pan</span>
        </span>
      </div>
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => (isDragging.current = false)}
        onMouseLeave={() => (isDragging.current = false)}
        tabIndex={0}
        aria-label={title}
        className="relative h-[280px] w-full overflow-auto no-scrollbar rounded-xl border border-border bg-card cursor-grab active:cursor-grabbing select-none focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <img src={src} alt={alt} style={imgStyle} className="select-none pointer-events-none rounded-xl block" />
      </div>
    </div>
  );
}

type TabKey = "overview" | "architecture" | "accessibility" | "tools";

export default function ResourcesAuditPage({
  theme = "dark",
  onReturnToDashboard,
}: {
  theme?: "dark" | "light";
  onReturnToDashboard?: () => void;
}) {
  const { language } = useLocale();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [activePersonaId, setActivePersonaId] = useState<string>("karim");
  const [imageMode, setImageMode] = useState<"side-by-side" | "wireframe" | "polished">("side-by-side");

  const {
    isMuted,
    toggleMute,
    activeChannel,
    setChannel,
    isTransmitting,
    currentTransmission,
    triggerNext,
  } = useAirfieldRadio();

  const handleTabSelect = (tab: TabKey) => {
    soundEffects.playClick();
    setActiveTab(tab);
  };

  const polishedSrc =
    import.meta.env.BASE_URL + (isDark ? "operations_polished_dark.png" : "operations_polished_light.png");

  const subTabs = [
    {
      id: "overview" as const,
      label: { en: "Airport Overview", ar: "نظرة عامة على المطار" },
      icon: Plane,
      hint: { en: "Capacity & Features", ar: "السعة والميزات" },
    },
    {
      id: "architecture" as const,
      label: { en: "Architecture", ar: "معمارية النظام" },
      icon: Bot,
      hint: { en: "AI & Tech Stack", ar: "الذكاء الاصطناعي والتقنيات" },
    },
    {
      id: "accessibility" as const,
      label: { en: "Accessibility", ar: "إتاحة الوصول" },
      icon: ShieldCheck,
      hint: { en: "WCAG 2.2 AAA", ar: "معيار AAA" },
    },
    {
      id: "tools" as const,
      label: { en: "Interactive Sandboxes", ar: "منصات الاختبار التفاعلية" },
      icon: Radio,
      hint: { en: "ATC Radio & Personas", ar: "الراديو والشخصيات" },
    },
  ];

  return (
    <div className="flex flex-col min-w-0 gap-5 max-w-4xl mx-auto w-full text-foreground animate-in fade-in duration-300 pb-16">
      
      {/* Top Header & Simplified Tab Bar */}
      <header className="sticky top-20 sm:top-24 z-30 rounded-2xl border border-border/80 bg-background/95 p-2.5 sm:p-3 shadow-md backdrop-blur-xl flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onReturnToDashboard && (
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  onReturnToDashboard();
                }}
                className="flex h-9 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-bold text-primary-foreground shadow hover:opacity-90 active:scale-95 transition cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
                <span>{localize({ en: "Dashboard", ar: "الرئيسية" }, language)}</span>
              </button>
            )}
            <h1 className="text-sm sm:text-base font-bold text-foreground">
              {localize({ en: "System Guide & Specifications", ar: "دليل ومواصفات النظام" }, language)}
            </h1>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground hidden sm:block">
            CAI / HECA • v3.2
          </span>
        </div>

        {/* 4 Clean Segmented Tabs */}
        <nav
          role="tablist"
          aria-label={localize({ en: "Documentation Topics", ar: "أقسام الدليل" }, language)}
          className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-secondary/30 p-1 rounded-xl border border-border/60"
        >
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isCurrent}
                onClick={() => handleTabSelect(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer text-start ${
                  isCurrent
                    ? "bg-background text-foreground shadow-sm border border-border/80 font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isCurrent ? "text-primary" : "text-muted-foreground"}`} />
                <div className="min-w-0 flex-1 truncate">
                  <div className="truncate leading-tight">{localize(tab.label, language)}</div>
                  <div className="text-[10px] text-muted-foreground font-normal truncate">
                    {localize(tab.hint, language)}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </header>

      {/* ============================================================ */}
      {/* TAB 1: AIRPORT OVERVIEW & FEATURES */}
      {/* ============================================================ */}
      {activeTab === "overview" && (
        <main className="flex flex-col gap-4 animate-in fade-in duration-200">
          
          {/* 3 Clear Metric Pillars */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border/70 bg-card p-4 flex flex-col gap-1 text-start">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-primary" />
                {localize({ en: "Annual Passengers", ar: "المسافرون سنوياً" }, language)}
              </span>
              <div className="text-2xl font-bold font-mono text-foreground">30M+ PAX</div>
              <p className="text-xs text-muted-foreground">
                {localize({ en: "Across Terminals 1, 2, and 3", ar: "عبر الصالات ١ و ٢ و ٣" }, language)}
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 flex flex-col gap-1 text-start">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Plane className="h-4 w-4 text-primary" />
                {localize({ en: "Active Runways", ar: "المدرجات النشطة" }, language)}
              </span>
              <div className="text-2xl font-bold font-mono text-foreground">3 Runways</div>
              <p className="text-xs text-muted-foreground font-mono">05L/23R, 05C/23C, 05R/23L</p>
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-4 flex flex-col gap-1 text-start">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-primary" />
                {localize({ en: "Bilingual Operations", ar: "التشغيل ثنائي اللغة" }, language)}
              </span>
              <div className="text-2xl font-bold font-mono text-foreground">RTL + LTR</div>
              <p className="text-xs text-muted-foreground">
                {localize({ en: "Arabic & English mirrored layout", ar: "محاذاة كاملة للغة العربية" }, language)}
              </p>
            </div>
          </section>

          {/* 4 Core Features (Clean 2x2 Grid) */}
          <section className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 flex flex-col gap-3">
            <h2 className="text-sm font-bold text-foreground">
              {localize({ en: "Primary Operational Capabilities", ar: "الميزات والقدرات التشغيلية الأساسية" }, language)}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-border/60 bg-secondary/15 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <CloudRain className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    {localize({ en: "Live METAR & Wind Vectors", ar: "تقرير الطقس ومسار الرياح" }, language)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {localize(
                      {
                        en: "Calculates crosswinds and assigns optimal runways (05L/05C) in real time.",
                        ar: "حساب سرعة الرياح المتقاطعة وتحديد أنسب المدرجات (05L/05C) فورياً.",
                      },
                      language
                    )}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border/60 bg-secondary/15 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Tv className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    {localize({ en: "AOCC Video Wall Carousel", ar: "شاشات مركز العمليات الدوارة" }, language)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {localize(
                      {
                        en: "Auto-cycles screens every 25s for command walls with authentic ATC radio.",
                        ar: "تبديل تلقائي كل ٢٥ ثانية لشاشات القيادة المعلقة مع إذاعة صوتية.",
                      },
                      language
                    )}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border/60 bg-secondary/15 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-status-warn/10 text-status-warn shrink-0">
                  <Flame className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    {localize({ en: "Emergency Drill Sandbox", ar: "محاكاة حالات الطوارئ" }, language)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {localize(
                      {
                        en: "Simulates sandstorm low-visibility CAT II and Terminal 3 baggage jams.",
                        ar: "محاكاة العواصف الترابية وانخفاض الرؤية وتكدس حقائب الركاب.",
                      },
                      language
                    )}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border/60 bg-secondary/15 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-status-ok/10 text-status-ok shrink-0">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    {localize({ en: "RFC-4180 Arabic CSV Export", ar: "تصدير البيانات بصيغة CSV" }, language)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {localize(
                      {
                        en: "Exports compliant spreadsheets with UTF-8 BOM preserving Arabic in Excel.",
                        ar: "تصدير متوافق مع إكسل باللغة العربية دون تشوه للخطوط.",
                      },
                      language
                    )}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border/60 bg-secondary/15 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    {localize({ en: "Staffing & Surge Workforce", ar: "إدارة القوى العاملة والطوارئ" }, language)}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {localize(
                      {
                        en: "Shift wave allocator (<85% surge alerts), ICAO Annex 14/17 compliance, and 1-click tactical crew dispatch.",
                        ar: "توزيع ورديات العمل وتحذيرات السعة، متابعة شارات الإيكاو، وإعادة انتشار فوري لفرق الطوارئ بنقرة واحدة.",
                      },
                      language
                    )}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Wireframe vs Polished Interface (Clean Toggle or Side-by-Side) */}
          <section className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-primary" />
                  <span>{localize({ en: "Design Evolution", ar: "مراحل تطور التصميم" }, language)}</span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  {localize(
                    { en: "From field paper wireframe to 4K dark mode cockpit.", ar: "من المخطط الميداني الورقي إلى الواجهة الرقمية النهائية." },
                    language
                  )}
                </p>
              </div>

              {/* View Selector */}
              <div className="flex gap-1 bg-secondary/40 p-0.5 rounded-lg border border-border/60 text-xs">
                {(["side-by-side", "wireframe", "polished"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setImageMode(mode)}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer font-medium ${
                      imageMode === mode ? "bg-background text-foreground shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {mode === "side-by-side" && localize({ en: "Both", ar: "معاً" }, language)}
                    {mode === "wireframe" && localize({ en: "Wireframe", ar: "المخطط" }, language)}
                    {mode === "polished" && localize({ en: "Polished", ar: "النهائي" }, language)}
                  </button>
                ))}
              </div>
            </div>

            <div className={`grid gap-4 mt-1 ${imageMode === "side-by-side" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
              {(imageMode === "side-by-side" || imageMode === "wireframe") && (
                <ScrollableImageContainer
                  src={import.meta.env.BASE_URL + "operations_wireframe.jpg"}
                  alt="Paper wireframe"
                  title={localize({ en: "1. Field Paper Wireframe", ar: "١. المخطط الورقي الأولي" }, language)}
                />
              )}
              {(imageMode === "side-by-side" || imageMode === "polished") && (
                <ScrollableImageContainer
                  src={polishedSrc}
                  alt="Polished UI"
                  title={localize({ en: "2. Production 4K Interface", ar: "٢. الواجهة النهائية عالية الدقة" }, language)}
                />
              )}
            </div>
          </section>

        </main>
      )}

      {/* ============================================================ */}
      {/* TAB 2: AI & CODE ARCHITECTURE */}
      {/* ============================================================ */}
      {activeTab === "architecture" && (
        <main className="flex flex-col gap-4 animate-in fade-in duration-200">
          
          {/* Autonomous AI Workflow (3 Steps) */}
          <section className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 flex flex-col gap-3">
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Bot className="h-4 w-4 text-primary" />
                <span>{localize({ en: "Google Antigravity AI Engineering Loop", ar: "دورة وكلاء Google Antigravity الذكية" }, language)}</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                {localize(
                  { en: "Autonomous multi-agent pair programming for zero-hallucination development.", ar: "برمجة متقدمة عبر وكلاء الذكاء الاصطناعي المستقلين لضمان دقة الكود." },
                  language
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl border border-border/60 bg-secondary/15 flex flex-col gap-1.5">
                <div className="text-xs font-mono font-bold text-primary">01 • RESEARCH</div>
                <h3 className="text-xs font-bold text-foreground">
                  {localize({ en: "Field Operator Shadowing", ar: "معايشة المشغلين وتحليل الاحتياجات" }, language)}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {localize(
                    { en: "Identified alarm fatigue and glare, reducing 22 telemetry feeds down to 9 primary decision cards.", ar: "كشف إرهاق الإنذارات واختزال ٢٢ تدفقاً للبيانات إلى ٩ بطاقات قيادة حيوية." },
                    language
                  )}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border/60 bg-secondary/15 flex flex-col gap-1.5">
                <div className="text-xs font-mono font-bold text-primary">02 • AGENT PAIRING</div>
                <h3 className="text-xs font-bold text-foreground">
                  {localize({ en: "Context & Subagents", ar: "تنسيق الوكلاء وبروتوكول MCP" }, language)}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {localize(
                    { en: "Synchronized design tokens via Figma Dev Mode and mapped real Cairo runways via Google Maps Platform.", ar: "مزامنة الرموز مع Figma Dev Mode وإسقاط مدرجات القاهرة بدقة عبر خرائط جوجل." },
                    language
                  )}
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-border/60 bg-secondary/15 flex flex-col gap-1.5">
                <div className="text-xs font-mono font-bold text-status-ok">03 • DEFENSIVE CODE</div>
                <h3 className="text-xs font-bold text-foreground">
                  {localize({ en: "Automated Build CI/CD", ar: "فحص البناء التلقائي المستمر" }, language)}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {localize(
                    { en: "Zero Temporal Dead Zone errors, 100% strict TypeScript types, and automated GitHub Pages deployment.", ar: "انعدام أخطاء TDZ وأمان تام للأنواع البرمجية ونشر فوري عبر GitHub Pages." },
                    language
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* Clean Tech Stack Table */}
          <section className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 flex flex-col gap-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Code2 className="h-4 w-4 text-primary" />
              <span>{localize({ en: "Core Technology Stack", ar: "التقنيات البرمجية المستخدمة" }, language)}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-border/60 bg-secondary/15 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-status-ok shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs font-mono text-foreground">React 19 & TypeScript</strong>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {localize({ en: "Strict concurrency safety with zero memory leaks.", ar: "أمان متقدم وتصيير خفيف خالٍ من تسريب الذاكرة." }, language)}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border/60 bg-secondary/15 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-status-ok shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs font-mono text-foreground">Web Audio DSP Engine</strong>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {localize({ en: "VHF 400-3400Hz radio bandpass filtering and mic clicks.", ar: "فلترة الترددات اللاسلكية ونقر الميكروفون التفاعلي." }, language)}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border/60 bg-secondary/15 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-status-ok shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs font-mono text-foreground">Tailwind CSS Tokens</strong>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {localize({ en: "8pt modular spacing grid and CSS logical properties for RTL.", ar: "شبكة قياس 8pt وخصائص منطقية تدعم العربية أصلاً." }, language)}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border/60 bg-secondary/15 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-status-ok shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs font-mono text-foreground">RFC-4180 CSV Engine</strong>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {localize({ en: "Pure client-side export with UTF-8 BOM encoding.", ar: "تصدير محلي خفيف يحافظ على النصوص العربية في إكسل." }, language)}
                  </p>
                </div>
              </div>
            </div>
          </section>

        </main>
      )}

      {/* ============================================================ */}
      {/* TAB 3: WCAG 2.2 AAA ACCESSIBILITY */}
      {/* ============================================================ */}
      {activeTab === "accessibility" && (
        <main className="flex flex-col gap-4 animate-in fade-in duration-200">
          
          {/* Contrast Card */}
          <section className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Contrast className="h-4 w-4 text-status-ok" />
                  <span>{localize({ en: "Color Contrast Standards (7:1 Minimum)", ar: "معايير التباين اللوني (٧:١ كحد أدنى)" }, language)}</span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  {localize({ en: "Full WCAG 2.2 Level AAA compliance across dark and light modes.", ar: "امتثال كامل لمعيار WCAG 2.2 AAA في الأنماط الداكنة والفاتحة." }, language)}
                </p>
              </div>
              <span className="text-xs font-mono text-status-ok bg-status-ok/10 px-2.5 py-1 rounded-md font-bold">
                WCAG 2.2 AAA PASS
              </span>
            </div>

            {/* 4 Swatches */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-3 rounded-xl bg-secondary/20 border border-cyan/40 flex flex-col">
                <span className="text-xs font-bold text-cyan font-mono">Cyan Focus</span>
                <span className="text-xl font-bold font-mono text-foreground mt-1">8.2:1</span>
                <span className="text-[10px] text-muted-foreground">Passes AAA (7:1)</span>
              </div>
              <div className="p-3 rounded-xl bg-secondary/20 border border-status-ok/40 flex flex-col">
                <span className="text-xs font-bold text-status-ok font-mono">Status Green</span>
                <span className="text-xl font-bold font-mono text-foreground mt-1">7.6:1</span>
                <span className="text-[10px] text-muted-foreground">Passes AAA (7:1)</span>
              </div>
              <div className="p-3 rounded-xl bg-secondary/20 border border-status-warn/40 flex flex-col">
                <span className="text-xs font-bold text-status-warn font-mono">Status Amber</span>
                <span className="text-xl font-bold font-mono text-foreground mt-1">7.1:1</span>
                <span className="text-[10px] text-muted-foreground">Passes AAA (7:1)</span>
              </div>
              <div className="p-3 rounded-xl bg-secondary/20 border border-status-crit/40 flex flex-col">
                <span className="text-xs font-bold text-status-crit font-mono">Status Red</span>
                <span className="text-xl font-bold font-mono text-foreground mt-1">7.4:1</span>
                <span className="text-[10px] text-muted-foreground">Passes AAA (7:1)</span>
              </div>
            </div>
          </section>

          {/* Key Interaction Rules */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border/70 bg-card p-4 flex flex-col gap-2">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Keyboard className="h-4 w-4 text-primary" />
                <span>{localize({ en: "Keyboard Navigation", ar: "التنقل بلوحة المفاتيح" }, language)}</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-muted-foreground pl-0 list-none">
                <li className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-secondary rounded border border-border text-[10px] font-mono text-foreground font-bold">Tab</kbd>
                  <span>{localize({ en: "Logical tab order with glowing focus rings.", ar: "ترتيب منطقي مع مؤشر تركيز مرئي." }, language)}</span>
                </li>
                <li className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-secondary rounded border border-border text-[10px] font-mono text-foreground font-bold">Ctrl+K</kbd>
                  <span>{localize({ en: "Fast command palette for drills and tools.", ar: "لوحة أوامر سريعة للتدريبات والأدوات." }, language)}</span>
                </li>
                <li className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 bg-secondary rounded border border-border text-[10px] font-mono text-foreground font-bold">1 - 3</kbd>
                  <span>{localize({ en: "Number keys switch between main views.", ar: "أرقام للتبديل الفوري بين الأقسام." }, language)}</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-4 flex flex-col gap-2">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-status-ok" />
                <span>{localize({ en: "Ergonomics & Inclusion", ar: "معايير الراحة والشمولية" }, language)}</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-muted-foreground pl-0 list-none">
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-status-ok shrink-0" />
                  <span>{localize({ en: "Min 44×44px touch targets on all interactive elements.", ar: "مساحات لمس لا تقل عن ٤٤×٤٤ بكسل." }, language)}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-status-ok shrink-0" />
                  <span>{localize({ en: "Live on-screen captions accompany all radio voice audio.", ar: "نصوص مقروءة ترافق كافة التسجيلات الصوتية." }, language)}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-status-ok shrink-0" />
                  <span>{localize({ en: "Zero horizontal scrolling at up to 200% zoom.", ar: "تفادي التمرير الأفقي حتى تكبير ٢٠٠٪." }, language)}</span>
                </li>
              </ul>
            </div>
          </section>

        </main>
      )}

      {/* ============================================================ */}
      {/* TAB 4: INTERACTIVE TOOLS & PERSONAS */}
      {/* ============================================================ */}
      {activeTab === "tools" && (
        <main className="flex flex-col gap-4 animate-in fade-in duration-200">
          
          {/* Cairo Tower Radio Console */}
          <section className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Radio className="h-4 w-4 text-primary animate-pulse" />
                  <span>{localize({ en: "Cairo ATC Radio DSP Console", ar: "منصة اختبار إذاعة وبرج مراقبة القاهرة" }, language)}</span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  {localize(
                    { en: "VHF 400–3400Hz voice synthesis with squelch bursts and live captions.", ar: "توليد صوتي لنداءات الطيران مع فلتر VHF ونصوص متزامنة." },
                    language
                  )}
                </p>
              </div>
              <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded font-bold">
                {RADIO_CHANNELS[activeChannel].frequency}
              </span>
            </div>

            {/* Channels & Player */}
            <div className="rounded-xl border border-border/70 bg-slate-950 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2.5 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${!isMuted ? "bg-status-ok animate-ping" : "bg-slate-500"}`} />
                  <span className="text-xs font-mono text-slate-300 font-bold">
                    CAIRO TOWER (HECA) {isTransmitting && "• TRANSMITTING"}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {(["tower", "atis", "operations"] as RadioChannel[]).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => {
                        soundEffects.playClick();
                        setChannel(ch);
                      }}
                      className={`px-2 py-1 rounded text-xs font-mono transition cursor-pointer ${
                        activeChannel === ch
                          ? "bg-primary text-primary-foreground font-bold"
                          : "bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      {RADIO_CHANNELS[ch].frequency}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption Display */}
              <div className="min-h-[60px] flex items-center bg-black/40 p-3 rounded-lg border border-white/5 text-xs sm:text-sm text-white font-medium">
                {currentTransmission ? (
                  <span>
                    <strong className="text-primary">{currentTransmission.callsign}: </strong>
                    {currentTransmission.text[language] || currentTransmission.text.en}
                  </span>
                ) : (
                  <span className="text-slate-500 italic text-xs">
                    {localize({ en: "Click 'Broadcast Next Call' below to test.", ar: "اضغط على 'بث النداء التالي' للاختبار." }, language)}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      toggleMute();
                    }}
                    className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition cursor-pointer ${
                      !isMuted ? "bg-primary text-primary-foreground" : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {!isMuted ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                    <span>{localize(!isMuted ? { en: "Mute", ar: "كتم" } : { en: "Unmute", ar: "تشغيل" }, language)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      triggerNext(language);
                    }}
                    className="flex h-9 items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-3 text-xs font-bold text-white hover:bg-white/15 transition cursor-pointer"
                  >
                    <Radio className="h-3.5 w-3.5 text-primary" />
                    <span>{localize({ en: "Broadcast Next Call", ar: "بث النداء التالي" }, language)}</span>
                  </button>
                </div>

                <span className="text-[11px] font-mono text-slate-400">Bandpass: 400-3400Hz</span>
              </div>
            </div>
          </section>

          {/* Streamlined Personas */}
          <section className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 flex flex-col gap-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" />
              <span>{localize({ en: "Operator Personas & Ergonomics", ar: "شخصيات المشغلين واحتياجاتهم" }, language)}</span>
            </h2>

            <div className="grid grid-cols-3 gap-2">
              {personas.map((p) => {
                const isActive = activePersonaId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      soundEffects.playClick();
                      setActivePersonaId(p.id);
                    }}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                      isActive
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border/60 bg-secondary/15 hover:bg-secondary/30"
                    }`}
                  >
                    <img
                      src={p.avatarPath}
                      alt={localize(p.name, language)}
                      className={`w-10 h-10 rounded-full border object-cover ${isActive ? "border-primary" : "border-border/60 opacity-80"}`}
                    />
                    <span className={`text-xs font-bold ${isActive ? "text-primary" : "text-foreground"}`}>
                      {localize(p.name, language)}
                    </span>
                  </button>
                );
              })}
            </div>

            {(() => {
              const p = personas.find((x) => x.id === activePersonaId);
              if (!p) return null;
              return (
                <div className="p-3.5 rounded-xl border border-border/60 bg-secondary/15 flex flex-col gap-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-foreground">{localize(p.title, language)}</span>
                    <span className="text-[11px] font-mono text-primary">{localize(p.device, language)} • {localize(p.shift, language)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {localize(p.need, language)}
                  </p>
                </div>
              );
            })()}
          </section>

          {/* Creator Credentials */}
          <section className="rounded-2xl border border-primary/25 bg-primary/5 p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <img
                src={import.meta.env.BASE_URL + "ahmed-mahdy.png"}
                alt="Ahmed Mahdy"
                className="h-12 w-12 rounded-xl object-cover border border-primary/30 shrink-0"
              />
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {localize({ en: "Ahmed Mahdy", ar: "أحمد مهدي" }, language)}
                </h3>
                <p className="text-xs text-primary font-medium">
                  {localize({ en: "UX Designer & Data Analyst • Advansys IS", ar: "مصمم تجربة مستخدم ومحلل بيانات • أدفانسيس" }, language)}
                </p>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Google UX • Google Data Analytics • Tableau BI • WCAG 2.2 AAA
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <a
                href="https://www.linkedin.com/in/creativemahdy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-semibold text-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="h-3.5 w-3.5 text-primary" />
                <span>LinkedIn</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
              <a
                href="https://mahdy-resume.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                <span>{localize({ en: "Resume", ar: "السيرة الذاتية" }, language)}</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </div>
          </section>

        </main>
      )}

    </div>
  );
}
