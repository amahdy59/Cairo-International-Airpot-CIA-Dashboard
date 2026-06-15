import { useState, useEffect, useRef } from "react";
import {
  Check,
  Laptop,
  Monitor,
  RefreshCw,
  Smartphone,
  User,
  Users,
  Briefcase,
  Clock3,
  Eye,
  ExternalLink,
  Search,
  Network,
  ShieldCheck,
  Contrast,
  Keyboard,
  Globe,
  ChevronDown,
  ChevronUp,
  Linkedin,
} from "lucide-react";
import { StatusPill } from "./command-center/MetricWidgets";
import { useLocale } from "../context/locale";
import { localize } from "../utils/helpers";

// ----------------------------------------------------
// Persona & Research data
// ----------------------------------------------------
const personas = [
  {
    id: "karim",
    name: { en: "Karim — Duty Operations Manager", ar: "كريم — مدير عمليات نوبة العمل" },
    avatarPath: "/karim_avatar_v2.png",
    role: { en: "12 years in command centers. Oversees terminal operations on 4K video walls.", ar: "خبرة ١٢ عاماً في مركز القيادة، يشرف على عمليات الصالات الحية على شاشات جدارية 4K." },
    needs: { en: "Needs fast operational alerts (under 200ms) with status indicators to prevent terminal bottlenecks.", ar: "يتطلب تنبيهات فورية عن المشاكل (أقل من ٢٠٠ ملي ثانية) مع مؤشرات تقادم لمنع حدوث تكدس." },
    specs: [
      { label: { en: "Shift", ar: "النوبة" }, val: { en: "Rotational (12h)", ar: "متناوبة (١٢ ساعة)" } },
      { label: { en: "Device", ar: "الجهاز" }, val: { en: "4K Video Wall", ar: "شاشة جدارية 4K" } },
      { label: { en: "Priority", ar: "الأولوية" }, val: { en: "Escalation & response SLA", ar: "سرعة الاستجابة والتصعيد" } }
    ]
  },
  {
    id: "yasmin",
    name: { en: "Yasmin — Terminal Gate Supervisor", ar: "ياسمين — مشرف بوابات صالة الركاب" },
    avatarPath: "/yasmin_avatar_v2.png",
    role: { en: "Manages passenger boarding and terminal gate flows using active tablets.", ar: "تدير صعود الركاب وتدفق المسافرين على أرض المطار باستخدام أجهزة التابلت." },
    needs: { en: "Needs high-contrast screens and large touch targets (min 44px) for mobile use.", ar: "تحتاج إلى تصميم عالي التباين ومساحات لمس واسعة (٤٤ بكسل كحد أدنى) لسهولة الاستخدام أثناء الحركة." },
    specs: [
      { label: { en: "Shift", ar: "النوبة" }, val: { en: "Day Shift (8h)", ar: "نهارية (٨ ساعات)" } },
      { label: { en: "Device", ar: "الجهاز" }, val: { en: "10\" Mobile Tablet", ar: "تابلت ١٠ بوصة" } },
      { label: { en: "Priority", ar: "الأولوية" }, val: { en: "RTL layout & touch scaling", ar: "التوافق العربي ومساحات اللمس" } }
    ]
  },
  {
    id: "tarek",
    name: { en: "Tarek — ICAO Safety Auditor", ar: "طارق — مدقق سلامة الطيران (ICAO)" },
    avatarPath: "/tarek_avatar_v2.png",
    role: { en: "Audits safety compliance for airside and landside airport equipment.", ar: "يقوم بتدقيق الامتثال لمعايير السلامة للجانب الجوي والأرضي ومعدات المطار." },
    needs: { en: "Needs structured data tables and high-contrast text to read under outdoor glare.", ar: "يتطلب جداول بيانات منظمة وألواناً عالية التباين للتدقيق والقراءة تحت أشعة الشمس المباشرة." },
    specs: [
      { label: { en: "Shift", ar: "النوبة" }, val: { en: "Intermittent / Audits", ar: "متقطعة / فترات التدقيق" } },
      { label: { en: "Device", ar: "الجهاز" }, val: { en: "13\" Workstation", ar: "لابتوب ١٣ بوصة" } },
      { label: { en: "Priority", ar: "الأولوية" }, val: { en: "Data grid contrast & readability", ar: "تبويب البيانات وقابلية القراءة" } }
    ]
  }
];

const timelinePhases = [
  {
    id: "discovery",
    title: { en: "1. Field Research & Observations", ar: "١. الملاحظات الميدانية ومركز القيادة" },
    desc: { en: "Shadowed operators in Cairo's command center. Identified alarm fatigue and screen readability issues under runway glare.", ar: "تم إجراء معايشة في مركز قيادة مطار القاهرة. تم اكتشاف إرهاق الإنذارات لدى المشغلين في أوقات الذروة وصعوبات القراءة تحت أشعة الشمس." },
    icon: Search,
    bullets: [
      { en: "Command center displays need simple, high-priority visual cues.", ar: "شاشات المراقبة تتطلب دمج وتبسيط الرموز البصرية عالية الأهمية." },
      { en: "Mobile tablets require custom viewports and larger touch targets.", ar: "أجهزة التابلت في المطار تتطلب متصفحاً مخصصاً ومساحات لمس أكبر." }
    ]
  },
  {
    id: "ia",
    title: { en: "2. Information Architecture & Layouts", ar: "٢. تخطيط العمليات وهيكلة المعلومات" },
    desc: { en: "Mapped 22 sensor feeds into 9 key metrics. Designed a dual-tab layout (Visual Map vs. Data Table) to reduce cognitive load.", ar: "تم تقسيم ٢٢ تدفقاً لبيانات المستشعرات إلى ٩ بطاقات أداء. صممنا تدفقاً ثنائي التبويب لتوزيع الحمل البصري." },
    icon: Network,
    bullets: [
      { en: "Grouped flight data, safety logs, and alerts logically.", ar: "ترتيب وتجميع الرحلات وسجلات السلامة وصيانة الطائرات منطقياً." },
      { en: "Added interactive digital twin hotspots to speed up decisions.", ar: "دمج نقاط التوأم الرقمي التفاعلية لتسريع وتيرة اتخاذ القرارات التشغيلية." }
    ]
  },
  {
    id: "accessibility",
    title: { en: "3. Accessibility & Device Support", ar: "٣. تحسين سهولة الوصول وتوافق الأجهزة" },
    desc: { en: "Tested contrast ratios under direct sunlight. Met WCAG 2.1 AA guidelines and added native RTL/LTR mirroring.", ar: "تم اختبار نسب التباين تحت إضاءة المطار. تم توحيد الرموز اللونية لمعيار WCAG 2.1 AA وتطبيق التخطيط ثنائي الاتجاه." },
    icon: ShieldCheck,
    bullets: [
      { en: "Verified 4.5:1 minimum text contrast for light and dark modes.", ar: "التحقق من تباين النصوص بنسبة ٤.٥:١ كحد أدنى بالنمط الفاتح والداكن." },
      { en: "Programmed native CSS mirroring for English and Arabic.", ar: "برمجة انعكاس التخطيط التلقائي لدعم العربية RTL والإنجليزية LTR." }
    ]
  }
];

// Helper mini card for Responsive depiction (text scaled up to >=12px as floor)
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
  const accentClass = {
    cyan: "from-cyan to-cyan/0",
    magenta: "from-magenta to-magenta/0",
    warn: "from-status-warn to-status-warn/0",
    ok: "from-status-ok to-status-ok/0",
  }[accent];

  const accentHex = {
    cyan: "var(--cyan)",
    magenta: "var(--magenta)",
    warn: "var(--status-warn)",
    ok: "var(--status-ok)",
  }[accent];

  return (
    <div className="panel relative overflow-hidden p-3 bg-card border border-border/80 text-start h-full">
      <div className="absolute -top-6 -start-6 h-16 w-16 rounded-full opacity-10 blur-xl pointer-events-none" style={{ backgroundColor: accentHex }} />
      <div className={`absolute inset-y-0 start-0 w-[2px] bg-gradient-to-b ${accentClass}`} />
      <div className="min-w-0 flex flex-col justify-between h-full gap-2">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.08em] text-muted-foreground truncate">{label}</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-sm font-semibold tracking-tight text-foreground">{value}</span>
            <span className="text-xs font-mono text-muted-foreground">{unit}</span>
          </div>
        </div>
        <p className={`text-xs font-mono ${deltaTone === "ok" ? "text-status-ok" : deltaTone === "warn" ? "text-status-warn" : "text-status-crit"}`}>
          {delta}
        </p>
      </div>
    </div>
  );
}

export default function ResourcesAuditPage() {
  const { language } = useLocale();

  // Interactive Persona State
  const [activePersona, setActivePersona] = useState<string>("karim");

  // Expandable Timeline state (multiple expanded keys supported)
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({
    discovery: true,
  });

  const togglePhase = (id: string) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Draggable Slider State
  const [sliderPos, setSliderPos] = useState(50);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    if (!sliderRef.current) return;
    setContainerWidth(sliderRef.current.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(sliderRef.current);
    return () => observer.disconnect();
  }, []);

  // Responsive visualizer state
  const [activeDevice, setActiveDevice] = useState<"desktop" | "laptop" | "tablet">("laptop");

  // Slider Mouse/Touch Handlers
  const handleSliderMove = (clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) handleSliderMove(e.clientX);
    };
    const handleMouseUp = () => {
      isDragging.current = false;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging.current && e.touches.length > 0) {
        handleSliderMove(e.touches[0].clientX);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  return (
    <div className="flex flex-col min-w-0 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 max-w-4xl mx-auto w-full">
      
      {/* 1. Page Header & Brief Card */}
      <section className="panel bg-card/50 p-3 sm:p-6 flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2">
            <StatusPill tone="info">{localize({ en: "UX Case Study & Spec Sheet", ar: "دراسة تجربة المستخدم وورقة المواصفات" }, language)}</StatusPill>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            {localize({ en: "Cairo Command Hub Overview", ar: "نظرة عامة على مركز قيادة القاهرة" }, language)}
          </h1>
          <p className="mt-2.5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {localize({
              en: "This system is designed solely for simulation and training. All operational data, flight statuses, and metrics shown here are non-factual.",
              ar: "تم تصميم هذا النظام خصيصاً لأغراض المحاكاة والتدريب التشغيلي؛ وتعتبر جميع البيانات ومقاييس الأداء المعروضة غير حقيقية.",
            }, language)}
          </p>
        </div>
      </section>

      {/* 2. About the Creator Card */}
      <section className="panel bg-primary/5 border border-primary/20 p-3 sm:p-6 flex flex-col justify-between relative overflow-hidden gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="grid gap-3.5 z-10 relative">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4 text-primary hidden sm:inline-block" aria-hidden="true" />
            <h2 className="text-sm font-mono uppercase tracking-[0.1em] text-primary font-semibold">
              {localize({ en: "About the Creator", ar: "نبذة عن منشئ الموقع" }, language)}
            </h2>
          </div>
          <div className="flex items-center gap-3.5">
            <img 
              src="/ahmed-mahdy.png" 
              alt={localize({ en: "Ahmed Mahdy", ar: "أحمد مهدي" }, language)} 
              className="h-16 w-16 rounded-xl object-cover border border-primary/25 bg-background shrink-0 shadow-sm"
            />
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {localize({ en: "Ahmed Mahdy", ar: "أحمد مهدي" }, language)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {localize({ en: "UX Designer & Data Analyst", ar: "مصمم تجربة مستخدم ومحلل بيانات" }, language)}
              </p>
            </div>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground mt-1">
            {localize({
              en: "UX Designer & Data Analyst with 4+ years of experience. I specialize in turning user needs into clear, decision-ready systems.",
              ar: "مصمم تجربة مستخدم ومحلل بيانات بخبرة +٤ سنوات. متخصص في تحويل احتياجات المستخدمين لأنظمة واضحة تفاعلية.",
            }, language)}
          </p>
          <div className="mt-3 rounded-none sm:rounded-lg border-0 sm:border border-border/50 bg-transparent sm:bg-background/50 p-0 sm:p-3.5 flex flex-col gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {localize({ en: "Design & Development Tools", ar: "الأدوات المستخدمة" }, language)}
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {localize({
                en: "Built using human UX direction paired with AI tools like Antigravity, Figma, and React.",
                ar: "تم بناء هذا المشروع بتوجيه بشري لتجربة المستخدم مع أدوات مثل Antigravity وFigma وReact.",
              }, language)}
            </p>
          </div>
        </div>
        
        {/* Certifications Badge row */}
        <div className="z-10 relative">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
            {localize({ en: "Certifications & Skills", ar: "الشهادات والمهارات" }, language)}
          </h4>
          <div className="flex flex-wrap gap-1.5 text-xs font-mono">
            <span className="bg-primary/15 text-primary px-2.5 py-0.5 rounded border border-primary/10">Google UX</span>
            <span className="bg-primary/15 text-primary px-2.5 py-0.5 rounded border border-primary/10">Google Data Analytics</span>
            <span className="bg-primary/15 text-primary px-2.5 py-0.5 rounded border border-primary/10">Tableau BI</span>
          </div>
        </div>

        <div className="border-t border-border/50 pt-3.5 flex justify-between items-center text-sm z-10 relative">
          <span className="text-muted-foreground">{localize({ en: "Cairo, Egypt", ar: "القاهرة، مصر" }, language)}</span>
          <div className="flex items-center gap-4">
            <a 
              href="https://www.linkedin.com/in/creativemahdy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors font-medium"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
              <span className="hidden sm:inline">LinkedIn</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </a>
            <a 
              href="https://mahdy-resume.vercel.app/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-primary hover:underline font-semibold"
            >
              <span>{localize({ en: "View Resume", ar: "عرض السيرة الذاتية" }, language)}</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* 2b. Core Technology Stack */}
      <section className="panel bg-card/30 p-3 sm:p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Laptop className="h-5 w-5 text-primary hidden sm:inline-block" />
            <span>{localize({ en: "Technology Stack", ar: "بنية التقنيات" }, language)}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {localize({ en: "The frameworks and libraries powering the dashboard.", ar: "الإطارات والمكتبات الأساسية التي تشغل لوحة التحكم." }, language)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 mt-1">
          {[
            {
              name: "React (v19)",
              desc: {
                en: "Powers the interactive components, language switching context, and UI states.",
                ar: "يدير المكونات التفاعلية، وسياق تبديل اللغة، وحالات واجهة المستخدم."
              }
            },
            {
              name: "TypeScript",
              desc: {
                en: "Ensures type safety, code reliability, and clean data parsing.",
                ar: "يضمن سلامة أنواع البيانات، وموثوقية الكود، ومعالجة البيانات النظيفة."
              }
            },
            {
              name: "Vite",
              desc: {
                en: "Provides fast hot reloading and optimized builds for smooth compilation.",
                ar: "يوفر تحديثاً فورياً سريعاً وعملية بناء محسنة لتجميع الكود بسلاسة."
              }
            },
            {
              name: "Tailwind CSS & Lucide Icons",
              desc: {
                en: "Handles responsive layouts, custom themes, and clean vector icons.",
                ar: "يدير التخطيطات المتجاوبة، والمظاهر المخصصة، والأيقونات المتجهة النظيفة."
              }
            }
          ].map((tech, i) => (
            <div key={i} className="bg-transparent border-0 sm:bg-secondary/15 sm:border sm:border-border/50 rounded-none sm:rounded-xl p-0 sm:p-4 flex flex-col gap-1.5">
              <span className="font-bold text-foreground text-sm font-mono">{tech.name}</span>
              <p className="text-xs text-muted-foreground leading-relaxed">{localize(tech.desc, language)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Interactive Persona Studies Panel */}
      <section className="panel bg-card/30 p-3 sm:p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary hidden sm:inline-block" />
            <span>{localize({ en: "Persona Studies", ar: "شخصيات المستخدمين" }, language)}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {localize({ en: "Select a persona to view their workspace needs and constraints.", ar: "اختر شخصية مستخدم لمعاينة متطلبات عمله ومحدداته." }, language)}
          </p>
        </div>

        {/* Interactive Silhouette Avatar Buttons */}
        <div className="grid grid-cols-3 gap-3.5">
          {personas.map((p) => {
            const isActive = activePersona === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePersona(p.id)}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  isActive 
                    ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary/20" 
                    : "border-border/50 bg-secondary/15 hover:border-border hover:bg-secondary/30"
                }`}
              >
                <img
                  src={p.avatarPath}
                  alt={p.id}
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

        {/* Display active persona specifications */}
        {(() => {
          const activeData = personas.find((p) => p.id === activePersona);
          if (!activeData) return null;
          return (
            <div className="bg-transparent border-0 sm:bg-secondary/20 sm:border sm:border-border/60 rounded-none sm:rounded-xl p-0 sm:p-4.5 flex flex-col justify-between min-h-[170px] animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <h3 className="font-bold text-foreground text-base flex items-center gap-1.5">
                  <User className="h-4.5 w-4.5 text-primary hidden sm:inline-block" />
                  <span>{localize(activeData.name, language)}</span>
                </h3>
                <p className="text-sm text-primary font-semibold mt-1">{localize(activeData.role, language)}</p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{localize(activeData.needs, language)}</p>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 border-t border-border/40 pt-3 text-xs text-muted-foreground">
                {activeData.specs.map((spec, i) => (
                  <div key={i} className="flex flex-col gap-0.5">
                    <span className={`font-bold text-muted-foreground text-[11px] uppercase ${language === 'ar' ? 'tracking-normal' : 'tracking-wider'}`}>
                      {localize(spec.label, language)}
                    </span>
                    <span className="text-sm text-foreground font-semibold">
                      {localize(spec.val, language)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </section>

      {/* 4. Graphical Timeline Panel */}
      <section className="panel bg-card/30 p-3 sm:p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-primary hidden sm:inline-block" />
            <span>{localize({ en: "Design Process Timeline", ar: "مراحل التصميم التشغيلي" }, language)}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {localize({ en: "Click on any phase to see its goals and deliverables.", ar: "اضغط على أي مرحلة لمعاينة الأهداف والمخرجات." }, language)}
          </p>
        </div>

        {/* Vertical roadmaps with no empty gaps */}
        <div className="relative flex flex-col gap-4 ps-1">
          {timelinePhases.map((phase) => {
            const Icon = phase.icon;
            const isExpanded = !!expandedPhases[phase.id];
            return (
              <div key={phase.id} className="relative flex gap-2 sm:gap-4">
                {/* Left phase icon with outer border (smaller on mobile) */}
                <div className="flex flex-col items-center shrink-0">
                  <button 
                    onClick={() => togglePhase(phase.id)}
                    className={`relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border flex items-center justify-center transition cursor-pointer ${
                      isExpanded ? "border-primary bg-primary/10 text-primary" : "border-border/80 bg-card text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  {/* Visual connector line */}
                  <div className="w-[1.5px] bg-border flex-1 min-h-[12px] my-1" />
                </div>

                {/* Right side information card (fully collapsed/expanded accordion) */}
                <div 
                  onClick={() => togglePhase(phase.id)}
                  className={`flex-1 min-w-0 bg-transparent border-0 sm:bg-secondary/25 sm:border rounded-none sm:rounded-xl p-0 sm:p-4 transition-all duration-300 cursor-pointer ${
                    isExpanded ? "sm:border-primary/40 sm:bg-secondary/25 shadow-sm" : "sm:border-border/60 sm:hover:border-border"
                  }`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <h4 className={`font-semibold text-sm transition-colors truncate ${isExpanded ? "text-primary font-bold" : "text-muted-foreground"}`}>
                      {localize(phase.title, language)}
                    </h4>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-primary shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                  </div>

                  {isExpanded && (
                    <div className="mt-2 text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-200">
                      <p>{localize(phase.desc, language)}</p>
                      
                      {/* Expandable deliverables list */}
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

      {/* 5. Operations Wireframe vs. Polished View */}
      <section className="panel bg-card/30 p-3 sm:p-6 flex flex-col justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary hidden sm:inline-block" />
            <span>{localize({ en: "Operations Wireframe vs. Polished View", ar: "مقارنة مخطط العمليات مع التصميم النهائي" }, language)}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {localize({ en: "Compare the paper wireframe (left) with the final polished dashboard (right).", ar: "قارن بين المخطط الورقي الأولي (يسار) مع لوحة العمليات النهائية (يمين)." }, language)}
          </p>
        </div>

        <div 
          ref={sliderRef}
          className="relative h-[320px] w-full overflow-hidden rounded-xl border border-border bg-background select-none"
        >
          {/* Polished Operations View (Right side/Underneath) */}
          <div className="absolute inset-0 w-full h-full">
            <img 
              src="/operations_polished.jpg" 
              alt={localize({ en: "Polished Operations View", ar: "التصميم النهائي للوحة العمليات" }, language)} 
              className="w-full h-full object-cover select-none pointer-events-none" 
            />
          </div>

          {/* Wireframe Operations View (Left side/Clipped overlay static at 50%) */}
          <div 
            className="absolute inset-y-0 left-0 h-full overflow-hidden border-r border-dashed border-primary/40 pointer-events-none"
            style={{ width: "50%" }}
          >
            <img 
              src="/operations_wireframe.jpg" 
              alt={localize({ en: "Wireframe Operations View", ar: "المخطط الورقي للوحة العمليات" }, language)} 
              className="absolute top-0 left-0 h-full object-cover select-none pointer-events-none" 
              style={{ width: containerWidth ? `${containerWidth}px` : "100%" }}
            />
          </div>
        </div>
      </section>

      {/* 6. Responsive Breakpoint Grid */}
      <section className="panel bg-card/30 p-3 sm:p-6 flex flex-col justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Laptop className="h-5 w-5 text-primary hidden sm:inline-block" />
              <span>{localize({ en: "Responsive Layout Breakpoints", ar: "نقاط الاستجابة للشاشات المختلفة" }, language)}</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {localize({ en: "Switch device views to test how the layout adapts.", ar: "بدّل بين خيارات الأجهزة التشغيلية لمعاينة تكيف محتوى لوحة التحكم." }, language)}
            </p>
          </div>
          
          <div className="flex gap-1.5 bg-secondary/80 p-0.5 rounded-lg border border-border shrink-0 self-start">
            {(["desktop", "laptop", "tablet"] as const).map((dev) => (
              <button
                key={dev}
                onClick={() => setActiveDevice(dev)}
                className={`p-2 rounded-md transition cursor-pointer ${activeDevice === dev ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                aria-label={`${dev} specifications`}
              >
                {dev === "desktop" && <Monitor className="h-4.5 w-4.5" />}
                {dev === "laptop" && <Laptop className="h-4.5 w-4.5" />}
                {dev === "tablet" && <Smartphone className="h-4.5 w-4.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Viewport Container */}
        <div className="min-h-[220px] bg-slate-950/80 border border-border/60 rounded-xl p-3 sm:p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex justify-between items-center border-b border-border/30 pb-2 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-status-ok" />
              <span>CAI HUB METRICS GRID</span>
            </div>
            <span>{activeDevice.toUpperCase()} VIEWPORT</span>
          </div>

          {/* Responsive reflow grid */}
          <div className="flex-1 mt-3.5 overflow-x-auto scrollbar-thin">
            <div className={`grid gap-3 ${
              activeDevice === "desktop" 
                ? "grid-cols-4 min-w-[560px] lg:min-w-0" 
                : activeDevice === "laptop" 
                  ? "grid-cols-2 min-w-[320px] md:min-w-0" 
                  : "grid-cols-1"
            }`}>
              <MiniMetricCard label={localize({ en: "LUGGAGE FLOW", ar: "تدفق الأمتعة" }, language)} value="94.2" unit={localize({ en: "bags/m", ar: "حقيبة/د" }, language)} delta={localize({ en: "▲ +4.1%", ar: "▲ +4.1%" }, language)} deltaTone="ok" accent="cyan" />
              <MiniMetricCard label={localize({ en: "SEC LANES", ar: "مسارات الأمن" }, language)} value="12" unit={localize({ en: "lanes", ar: "مسارات" }, language)} delta={localize({ en: "▲ +2 lanes", ar: "▲ +2 مسار" }, language)} deltaTone="warn" accent="warn" />
              <MiniMetricCard label={localize({ en: "TERMINAL ARRIV", ar: "وصول المبنى" }, language)} value="1.4k" unit={localize({ en: "pax/h", ar: "راكب/س" }, language)} delta={localize({ en: "▼ -8.4%", ar: "▼ -8.4%" }, language)} deltaTone="crit" />
              <MiniMetricCard label={localize({ en: "GATE LOADS", ar: "حمولة البوابات" }, language)} value="28/30" unit={localize({ en: "gates", ar: "بوابات" }, language)} delta={localize({ en: "93% cap", ar: "سعة 93%" }, language)} deltaTone="info" accent="ok" />
            </div>
          </div>
        </div>

        <div className="bg-transparent border-0 sm:bg-background sm:border sm:border-border/40 rounded-none sm:rounded-xl p-0 sm:p-3.5 text-sm leading-relaxed">
          {activeDevice === "desktop" && (
            <div>
              <span className="font-bold text-foreground">Desktop 4K Grid Flow: </span>
              <span className="text-muted-foreground">
                {localize({
                  en: "A 4-column row layout. Offers full visual coverage at a glance for command center screens.",
                  ar: "تخطيط شبكي أفقي يعرض البطاقات الأربعة متجاورة. يتيح للمشغلين نظرة شاملة على شاشات المراقبة.",
                }, language)}
              </span>
            </div>
          )}
          {activeDevice === "laptop" && (
            <div>
              <span className="font-bold text-foreground">Laptop Workstation (2x2 Grid): </span>
              <span className="text-muted-foreground">
                {localize({
                  en: "Reflows into a 2x2 grid. Fits content efficiently on standard laptop screens.",
                  ar: "يعاد ترتيب المقاييس لشبكة ٢×٢ من عمودين. يعدل المحتوى لاستغلال المساحة المتاحة بالشاشات المتوسطة.",
                }, language)}
              </span>
            </div>
          )}
          {activeDevice === "tablet" && (
            <div>
              <span className="font-bold text-foreground">Mobile & Tablet Single Stack: </span>
              <span className="text-muted-foreground">
                {localize({
                  en: "Cards stack in a single column. Scales fonts and expands touch areas for mobile viewports.",
                  ar: "تترتب البطاقات عمودياً في عمود واحد. تتقلص الخطوط قليلاً وتتوسع مساحة اللمس لجعل لوحة التحكم سهلة الاستخدام بالهواتف.",
                }, language)}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 7. Accessibility & Typography Specifications (WCAG 2.1 AA) */}
      <section className="panel bg-card/30 p-3 sm:p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary hidden sm:inline-block" />
            <span>{localize({ en: "Accessibility & Typography Specs", ar: "مواصفات تيسير الوصول وحجم الخطوط" }, language)}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {localize({ en: "Verified design standards complying with WCAG 2.1 AA guidelines.", ar: "مواصفات تصميم مدققة متوافقة تماماً مع معايير WCAG 2.1 AA." }, language)}
          </p>
        </div>

        <div className="grid gap-4 text-sm">
          {/* Color Contrast */}
          <div className="bg-transparent border-0 sm:bg-secondary/20 sm:border sm:border-border/50 rounded-none sm:rounded-xl p-0 sm:p-4 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                <Contrast className="h-4.5 w-4.5 text-primary hidden sm:inline-block" />
                <span>{localize({ en: "Color & Contrast Compliance", ar: "التوافق اللوني والتباين" }, language)}</span>
              </span>
              <span className="text-xs font-mono text-status-ok bg-status-ok/10 px-2.5 py-0.5 rounded border border-status-ok/25 self-start sm:self-auto shrink-0">PASS</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {localize({
                en: "All text elements maintain a minimum contrast ratio of 4.5:1. Supports light, dark, and high-contrast modes to reduce glare.",
                ar: "تحافظ جميع نصوص الموقع على نسبة تباين تفوق ٤.٥:١ كحد أدنى. ويدعم النظام الأنماط الفاتحة والداكنة وعالية التباين لتقليل الانعكاس البصري."
              }, language)}
            </p>

            <div className="mt-2 text-xs text-primary bg-primary/10 border border-primary/20 rounded-lg p-2.5 flex items-start gap-2">
              <span className="font-semibold shrink-0">{localize({ en: "Contrast Tip:", ar: "تلميح التباين:" }, language)}</span>
              <span>
                {localize({
                  en: "A ratio above 4.5:1 ensures standard text remains readable against its background for users with moderate visual impairment.",
                  ar: "تضمن النسبة الأعلى من ٤.٥:١ وضوح قراءة النصوص العادية مقابل خلفيتها للمستخدمين الذين يعانون من ضعف بصري متوسط."
                }, language)}
              </span>
            </div>
            
            {/* Contrast swatches */}
            <div className="grid grid-cols-4 gap-2.5 pt-1.5">
              {[
                { name: { en: "Cyan", ar: "سماوي" }, hex: "#00F0FF", ratio: "4.8:1", bg: "bg-cyan" },
                { name: { en: "Green", ar: "أخضر" }, hex: "#10B981", ratio: "5.2:1", bg: "bg-status-ok" },
                { name: { en: "Yellow", ar: "أصفر" }, hex: "#FBBF24", ratio: "4.5:1", bg: "bg-status-warn" },
                { name: { en: "Red", ar: "أحمر" }, hex: "#EF4444", ratio: "4.6:1", bg: "bg-status-crit" }
              ].map((s, i) => (
                <div key={i} className="bg-transparent border-0 sm:bg-secondary/40 sm:border sm:border-border/40 rounded-none sm:rounded-lg p-0 sm:p-2 flex flex-col items-center text-center">
                  <div className={`w-6 h-6 rounded-full ${s.bg} border border-white/10`} />
                  <span className="text-xs font-bold text-foreground mt-1.5 truncate w-full">{localize(s.name, language)}</span>
                  <span className="text-[10px] font-mono text-muted-foreground mt-0.5">{s.ratio}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Typography Guidelines */}
          <div className="bg-transparent border-0 sm:bg-secondary/20 sm:border sm:border-border/50 rounded-none sm:rounded-xl p-0 sm:p-4 flex flex-col gap-2">
            <h3 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-primary rounded-full hidden sm:inline-block" />
              <span>{localize({ en: "Typography & Scaling", ar: "الخطوط والمقاييس" }, language)}</span>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {localize({
                en: "Uses Outfit as the main font for high legibility, with Inter and Noto Sans fallbacks. A line height of 1.5 prevents text crowding.",
                ar: "يعتمد خط Outfit كخط أساسي لتسهيل القراءة، مع خطوط Inter و Noto كبدائل احتياطية. وتمنع مسافات الأسطر (١.٥) تداخل النصوص."
              }, language)}
            </p>
          </div>

          {/* Keyboard & Outlines */}
          <div className="bg-transparent border-0 sm:bg-secondary/20 sm:border sm:border-border/50 rounded-none sm:rounded-xl p-0 sm:p-4 flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                <Keyboard className="h-4.5 w-4.5 text-primary hidden sm:inline-block" />
                <span>{localize({ en: "Logical Focus & Skip Links", ar: "التنقل المنطقي وإطار التركيز" }, language)}</span>
              </span>
              <span className="text-xs font-mono text-status-ok bg-status-ok/10 px-2.5 py-0.5 rounded border border-status-ok/25 self-start sm:self-auto shrink-0">COMPLIANT</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {localize({
                en: "Tab order maps strictly to the visual flow. Interactive elements use clear, glowing focus rings and support content skipping.",
                ar: "يتطابق تسلسل مفاتيح لوحة المفاتيح مع الترتيب البصري تماماً. وتكشف العناصر التفاعلية عن حلقات تركيز واضحة مع دعم روابط تخطي المحتوى."
              }, language)}
            </p>
          </div>
        </div>
      </section>

      {/* 8. Bilingual Context & Mirroring Logic (RTL/LTR) */}
      <section className="panel bg-card/30 p-3 sm:p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary hidden sm:inline-block" />
            <span>{localize({ en: "Bilingual Context & Mirroring Logic", ar: "سياق ثنائية اللغة ومنطق الانعكاس" }, language)}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {localize({ en: "Dynamic layout adjustment for English and Arabic.", ar: "إدارة ديناميكية للاتجاهات لتناسق وتطابق كامل بين العربية والإنجليزية." }, language)}
          </p>
        </div>

        <div className="bg-transparent border-0 sm:bg-secondary/20 sm:border sm:border-border/50 rounded-none sm:rounded-xl p-0 sm:p-4 flex flex-col gap-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {localize({
              en: "The dashboard transitions smoothly between LTR (English) and RTL (Arabic) using logical CSS properties.",
              ar: "تم تصميم لوحة التحكم لتنتقل ديناميكياً بين العربية والإنجليزية دون تشوهات أفقية، بالاعتماد على الخصائص المنطقية للغة."
            }, language)}
          </p>
          
          <ul className="space-y-3 pl-0 list-none text-sm text-muted-foreground border-t border-border/40 pt-3">
            <li className="flex items-start gap-2.5">
              <Check className="h-4.5 w-4.5 text-status-ok shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">{localize({ en: "State Management: ", ar: "إدارة الحالة: " }, language)}</span>
                {localize({
                  en: "A global LocaleContext updates all widgets instantly to prevent UI rendering delay.",
                  ar: "يقوم LocaleContext العالمي بنشر تحديثات اللغة فورياً لجميع الأدوات التفاعلية، مما يمنع الاختلال البصري غير المتزامن."
                }, language)}
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="h-4.5 w-4.5 text-status-ok shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">{localize({ en: "Root Document Attributes: ", ar: "سمات المستند الجذري: " }, language)}</span>
                {localize({
                  en: "Sets dir (RTL/LTR) and lang attributes on the root element to trigger browser mirroring.",
                  ar: "يقوم بتعديل قيم dir و lang على جذر الصفحة (<html>) لتشغيل انعكاس المتصفح التلقائي."
                }, language)}
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="h-4.5 w-4.5 text-status-ok shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">{localize({ en: "Logical CSS properties: ", ar: "التنسيق البنائي المنطقي: " }, language)}</span>
                {localize({
                  en: "Uses start/end classes instead of left/right to automatically flip borders, alignments, and columns.",
                  ar: "يستخدم فئات start/end و ps-/pe- بدلاً من left/right و pl-/pr- لعكس الحدود والمحاور المطلقة والشبكات ذاتياً."
                }, language)}
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="h-4.5 w-4.5 text-status-ok shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">{localize({ en: "Structural Component Mirroring: ", ar: "انعكاس هيكل المكونات: " }, language)}</span>
                {localize({
                  en: "Key layouts flip dynamically, such as side navigation drawers and table direction.",
                  ar: "تنعكس بعض التخطيطات بشكل صريح، بما في ذلك زر الهمبرغر (أعلى اليسار بالعربية، وأعلى اليمين بالإنجليزية) واتجاه جداول المعلومات."
                }, language)}
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* 9. Viewport Responsiveness & Recent UX Updates */}
      <section className="panel bg-card/30 p-3 sm:p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary hidden sm:inline-block" />
            <span>{localize({ en: "Recent Responsiveness & UX Updates", ar: "مرونة الشاشات والتحسينات الأخيرة" }, language)}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {localize({ en: "Optimized layouts for workstations, tablets, and mobile views.", ar: "تصميمات تشغيلية مهيأة لمحطات العمل والأجهزة اللوحية والهواتف بمطار القاهرة." }, language)}
          </p>
        </div>

        <div className="bg-transparent border-0 sm:bg-secondary/20 sm:border sm:border-border/50 rounded-none sm:rounded-xl p-0 sm:p-4 flex flex-col gap-3">
          <ul className="space-y-3.5 pl-0 list-none text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <Check className="h-4.5 w-4.5 text-status-ok shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">{localize({ en: "Layout Grid Reflows: ", ar: "إعادة تدفق شبكة الواجهة: " }, language)}</span>
                {localize({
                  en: "Stacks cards vertically on mobile, uses 2 columns on tablets, and 4 columns on desktops. Auto-adjusts heights to prevent squeezing.",
                  ar: "تستخدم الشاشات الكبيرة ٤ أعمدة واللابتوب عمودين والهواتف عموداً واحداً. وفي التابلت، تلتف لوحة السلامة عمودياً وتلغى قيود الطول الثابتة لمنع تكدس المحتوى."
                }, language)}
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="h-4.5 w-4.5 text-status-ok shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">{localize({ en: "Visual Twin Navigation Controls: ", ar: "أدوات التحكم في التوأم الرقمي: " }, language)}</span>
                {localize({
                  en: "Allows touch panning on mobile and tablets with a 'Drag to pan' indicator, and shows a D-pad overlay on desktops.",
                  ar: "يتيح السحب اليدوي باللمس على الهواتف والأجهزة اللوحية مع إظهار مؤشر خفيف 'اسحب للتنقل'، بينما تعرض شاشات الحاسوب لوحة أزرار اتجاهات مجمعة (D-pad) في زاوية الشاشة."
                }, language)}
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="h-4.5 w-4.5 text-status-ok shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">{localize({ en: "Theme Sync Observer Hook: ", ar: "خطاف مزامنة سمة المظهر: " }, language)}</span>
                {localize({
                  en: "Synchronizes the digital twin map theme instantly with the global light/dark site toggle.",
                  ar: "يستخدم مراقب حالة داخل التوأم الرقمي لمزامنة مظهر الخريطة تلقائياً (فاتح، داكن، تباين) ليتناسق مع المظهر العام المختار للموقع."
                }, language)}
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="h-4.5 w-4.5 text-status-ok shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">{localize({ en: "Transition-First Menu Animation: ", ar: "جدولة الرسوم المتحركة للقائمة: " }, language)}</span>
                {localize({
                  en: "Delays rendering by 280ms when switching themes or languages to let the mobile menu close smoothly first.",
                  ar: "يؤخر مهام إعادة البناء الثقيلة للمظهر أو اللغة بمقدار ٢٨٠ ملي ثانية عند النقر، ليتيح لدرج القائمة الجانبية الإغلاق بسلاسة أولاً دون تعليق."
                }, language)}
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <Check className="h-4.5 w-4.5 text-status-ok shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">{localize({ en: "Strict FIDS Column Alignment: ", ar: "المحاذاة العمودية لجدول الرحلات: " }, language)}</span>
                {localize({
                  en: "Aligns flight codes, times, and gates vertically using a unified CSS grid layout.",
                  ar: "يوحد صفوف الرحلات القادمة باستخدام قالب شبكي صارم، لمحاذاة أرقام الرحلات والأوقات والبوابات عمودياً بشكل متناسق."
                }, language)}
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* 10. Project Status & Roadmap Card */}
      <section className="panel bg-card/30 p-3 sm:p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary hidden sm:inline-block" />
            <span>{localize({ en: "Project Status & Roadmap", ar: "حالة المشروع وخريطة التطوير" }, language)}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {localize({ en: "Current status of key features in the prototype.", ar: "الحالة والخطوات المتبقية لتطوير لوحة التحكم." }, language)}
          </p>
        </div>

        <div className="grid gap-4">
          {/* Requirements Matrix Table */}
          <div className="overflow-x-auto border border-border rounded-lg bg-background/50">
            <table className="w-full text-start text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/35 text-muted-foreground font-mono uppercase text-xs tracking-wider">
                  <th className="py-2 px-2.5 sm:py-2.5 sm:px-3.5 text-start whitespace-nowrap">{localize({ en: "Requirement", ar: "المتطلب" }, language)}</th>
                  <th className="py-2 px-2.5 sm:py-2.5 sm:px-3.5 text-start whitespace-nowrap">{localize({ en: "Feature / Implementation", ar: "الميزة والتحقق" }, language)}</th>
                  <th className="py-2 px-2.5 sm:py-2.5 sm:px-3.5 text-center whitespace-nowrap">{localize({ en: "Status", ar: "الحالة" }, language)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium text-foreground text-xs sm:text-sm">
                <tr>
                  <td className="py-2.5 px-2.5 sm:py-3 sm:px-3.5">{localize({ en: "Arabic/English Switcher", ar: "تغيير اللغة" }, language)}</td>
                  <td className="py-2.5 px-2.5 sm:py-3 sm:px-3.5 text-xs text-muted-foreground">{localize({ en: "RTL switcher & logical mirroring", ar: "ربط اتجاه الواجهة (RTL) والانعكاس المنطقي" }, language)}</td>
                  <td className="py-2.5 px-2.5 sm:py-3 sm:px-3.5 text-center whitespace-nowrap">
                    <span className="text-xs font-mono text-status-ok bg-status-ok/10 px-2 py-0.5 rounded border border-status-ok/20 whitespace-nowrap">{localize({ en: "LIVE", ar: "مباشر" }, language)}</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-2.5 sm:py-3 sm:px-3.5">{localize({ en: "Accessibility (WCAG 2.1 AA)", ar: "معايير تيسير الوصول" }, language)}</td>
                  <td className="py-2.5 px-2.5 sm:py-3 sm:px-3.5 text-xs text-muted-foreground">{localize({ en: "4.5:1 contrast and logical tab sequence", ar: "نسب تباين WCAG 2.1 AA وتسلسل لوحة المفاتيح" }, language)}</td>
                  <td className="py-2.5 px-2.5 sm:py-3 sm:px-3.5 text-center whitespace-nowrap">
                    <span className="text-xs font-mono text-status-ok bg-status-ok/10 px-2 py-0.5 rounded border border-status-ok/20 whitespace-nowrap">{localize({ en: "LIVE", ar: "مباشر" }, language)}</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-2.5 sm:py-3 sm:px-3.5">{localize({ en: "Live Flight Feed (AODB)", ar: "تغذية الرحلات الجوية" }, language)}</td>
                  <td className="py-2.5 px-2.5 sm:py-3 sm:px-3.5 text-xs text-muted-foreground">{localize({ en: "Simulated live feed status", ar: "تغذية بيانات افتراضية" }, language)}</td>
                  <td className="py-2.5 px-2.5 sm:py-3 sm:px-3.5 text-center whitespace-nowrap">
                    <span className="text-xs font-mono text-status-warn bg-status-warn/10 px-2 py-0.5 rounded border border-status-warn/20 whitespace-nowrap">{localize({ en: "PENDING", ar: "قيد الانتظار" }, language)}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>


        </div>
      </section>

    </div>
  );
}
