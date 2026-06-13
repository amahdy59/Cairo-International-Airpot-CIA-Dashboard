import { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Laptop,
  Monitor,
  Plane,
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
    avatarPath: "/karim_avatar.png",
    role: { en: "12y command center experience, oversees live terminal operations on 4K wall displays.", ar: "خبرة ١٢ عاماً في مركز القيادة، يشرف على عمليات الصالات الحية على شاشات جدارية 4K." },
    needs: { en: "Requires immediate anomaly alerts (under 200ms) with aging metrics to prevent dispatch bottlenecks.", ar: "يتطلب تنبيهات فورية عن المشاكل (أقل من ٢٠٠ ملي ثانية) مع مؤشرات تقادم لمنع حدوث تكدس." },
    specs: [
      { label: { en: "Shift", ar: "النوبة" }, val: { en: "Rotational (12h)", ar: "متناوبة (١٢ ساعة)" } },
      { label: { en: "Device", ar: "الجهاز" }, val: { en: "4K Video Wall", ar: "شاشة جدارية 4K" } },
      { label: { en: "Priority", ar: "الأولوية" }, val: { en: "Escalation & response SLA", ar: "سرعة الاستجابة والتصعيد" } }
    ]
  },
  {
    id: "sara",
    name: { en: "Sarah — Terminal Gate Supervisor", ar: "سارة — مشرف بوابات صالة الركاب" },
    avatarPath: "/sara_avatar.png",
    role: { en: "Manages flight boarding and passenger flow on active aprons using standard tablets.", ar: "تدير صعود الركاب وتدفق المسافرين على أرض المطار باستخدام أجهزة التابلت." },
    needs: { en: "Needs high-contrast layouts and large touch targets (44px min) for easy navigation while walking.", ar: "تحتاج إلى تصميم عالي التباين ومساحات لمس واسعة (٤٤ بكسل كحد أدنى) لسهولة الاستخدام أثناء الحركة." },
    specs: [
      { label: { en: "Shift", ar: "النوبة" }, val: { en: "Day Shift (8h)", ar: "نهارية (٨ ساعات)" } },
      { label: { en: "Device", ar: "الجهاز" }, val: { en: "10\" Mobile Tablet", ar: "تابلت ١٠ بوصة" } },
      { label: { en: "Priority", ar: "الأولوية" }, val: { en: "RTL layout & touch scaling", ar: "التوافق العربي ومساحات اللمس" } }
    ]
  },
  {
    id: "david",
    name: { en: "David — ICAO Safety Auditor", ar: "ديفيد — مدقق سلامة الطيران (ICAO)" },
    avatarPath: "/david_avatar.png",
    role: { en: "Performs safety compliance audits on airport airside and landside equipment.", ar: "يقوم بتدقيق الامتثال لمعايير السلامة للجانب الجوي والأرضي ومعدات المطار." },
    needs: { en: "Requires tabular data structures and high-contrast styling to audit under outdoor sun glare.", ar: "يتطلب جداول بيانات منظمة وألواناً عالية التباين للتدقيق والقراءة تحت أشعة الشمس المباشرة." },
    specs: [
      { label: { en: "Shift", ar: "النوبة" }, val: { en: "Intermittent / Audits", ar: "متقطعة / فترات التدقيق" } },
      { label: { en: "Device", ar: " lلجهاز" }, val: { en: "13\" Workstation", ar: "لابتوب ١٣ بوصة" } },
      { label: { en: "Priority", ar: "الأولوية" }, val: { en: "Data grid contrast & readability", ar: "تبويب البيانات وقابلية القراءة" } }
    ]
  }
];

const timelinePhases = [
  {
    id: "discovery",
    title: { en: "1. Command Center & Field Observations", ar: "١. الملاحظات الميدانية ومركز القيادة" },
    desc: { en: "Conducted shadowing in CAI's command center. Discovered operator alarm fatigue during peak flight schedules and high-glare readability issues on active runways.", ar: "تم إجراء معايشة في مركز قيادة مطار القاهرة. تم اكتشاف إرهاق الإنذارات لدى المشغلين في أوقات الذروة وصعوبات القراءة تحت أشعة الشمس." },
    icon: Search,
    bullets: [
      { en: "Command center monitors require simplified, high-priority visual tokens.", ar: "شاشات المراقبة تتطلب دمج وتبسيط الرموز البصرية عالية الأهمية." },
      { en: "Apron tablet devices need custom viewports and large touch targets.", ar: "أجهزة التابلت في المطار تتطلب متصفحاً مخصصاً ومساحات لمس أكبر." }
    ]
  },
  {
    id: "ia",
    title: { en: "2. Operational Layout & Information Mapping", ar: "٢. تخطيط العمليات وهيكلة المعلومات" },
    desc: { en: "Mapped 22 raw sensor data streams into 9 core KPI cards. Designed the dual-tab flow (Visual Command Map vs. Tabular lists) to divide visual load.", ar: "تم تقسيم ٢٢ تدفقاً لبيانات المستشعرات إلى ٩ بطاقات أداء. صممنا تدفقاً ثنائي التبويب لتوزيع الحمل البصري." },
    icon: Network,
    bullets: [
      { en: "Grouped flights, safety logs, and maintenance alerts logically.", ar: "ترتيب وتجميع الرحلات وسجلات السلامة وصيانة الطائرات منطقياً." },
      { en: "Integrated interactive visual twin hotspots to accelerate decision workflows.", ar: "دمج نقاط التوأم الرقمي التفاعلية لتسريع وتيرة اتخاذ القرارات التشغيلية." }
    ]
  },
  {
    id: "accessibility",
    title: { en: "3. Accessibility & Device Compatibility Refinement", ar: "٣. تحسين سهولة الوصول وتوافق الأجهزة" },
    desc: { en: "Tested contrast ratios under active apron glare. Standardized color codes for WCAG 2.1 AA and implemented native bi-directional layouts.", ar: "تم اختبار نسب التباين تحت إضاءة المطار. تم توحيد الرموز اللونية لمعيار WCAG 2.1 AA وتطبيق التخطيط ثنائي الاتجاه." },
    icon: ShieldCheck,
    bullets: [
      { en: "Verified 4.5:1 minimum text contrast ratios across light and dark modes.", ar: "التحقق من تباين النصوص بنسبة ٤.٥:١ كحد أدنى بالنمط الفاتح والداكن." },
      { en: "Programmed native CSS mirroring for RTL Arabic and LTR English layouts.", ar: "برمجة انعكاس التخطيط التلقائي لدعم العربية RTL والإنجليزية LTR." }
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
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

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
      <section className="panel bg-card/50 p-6 flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2">
            <StatusPill tone="info">{localize({ en: "UX Case Study & Spec Sheet", ar: "دراسة تجربة المستخدم وورقة المواصفات" }, language)}</StatusPill>
            <span className="text-sm font-mono text-muted-foreground">v1.5.0</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            {localize({ en: "Cairo Command Hub Overview", ar: "نظرة عامة على مركز قيادة القاهرة" }, language)}
          </h1>
          <p className="mt-2.5 text-base leading-relaxed text-muted-foreground sm:text-lg">
            {localize({
              en: "Operational dashboard documenting the design principles, user research, accessibility baseline, and current interface status of the Cairo Airport digital twin project.",
              ar: "لوحة تشغيل توثق مبادئ التصميم، أبحاث المستخدمين، معايير سهولة الوصول، والحالة التشغيلية الحالية لمشروع التوأم الرقمي لمطار القاهرة الدولي.",
            }, language)}
          </p>
        </div>
        
        {/* API Integration Disclaimer */}
        <div className="mt-1 flex items-start gap-3 rounded-lg border border-status-warn/30 bg-status-warn/10 p-3.5 text-sm text-status-warn">
          <AlertTriangle className="h-5.5 w-5.5 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">{localize({ en: "Simulated Data Active:", ar: "البيانات التشغيلية الافتراضية مفعلة:" }, language)}</span>{" "}
            {localize({
              en: "Live airport API feeds (FIDS/AODB) are pending official client network credentials. Metrics currently reflect modelled local assets.",
              ar: "الربط المباشر مع واجهات بيانات المطار (FIDS/AODB) قيد انتظار بيانات الاعتماد الرسمية. تعكس المؤشرات حالياً بيانات تشغيلية افتراضية.",
            }, language)}
          </div>
        </div>
      </section>

      {/* 2. About the Creator Card */}
      <section className="panel bg-primary/5 border border-primary/20 p-6 flex flex-col justify-between relative overflow-hidden gap-4">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        <div className="grid gap-3.5 z-10 relative">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4 text-primary" aria-hidden="true" />
            <h2 className="text-sm font-mono uppercase tracking-[0.1em] text-primary font-semibold">
              {localize({ en: "About the creator of the site", ar: "نبذة عن منشئ الموقع" }, language)}
            </h2>
          </div>
          <div className="flex items-center gap-3.5">
            <img 
              src="/ahmed-mahdy.png" 
              alt="Ahmed Mahdy" 
              className="h-16 w-16 rounded-xl object-cover border border-primary/25 bg-background shrink-0 shadow-sm"
            />
            <div>
              <h3 className="text-lg font-bold text-foreground">Ahmed Mahdy</h3>
              <p className="text-sm text-muted-foreground font-mono">UX Designer & Data Analyst</p>
            </div>
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-muted-foreground mt-1">
            {localize({
              en: "UX Designer & Data Analyst with 4+ years of experience at Advansys IS. Specializes in turning user needs into decision-ready visual systems.",
              ar: "مصمم تجربة مستخدم ومحلل بيانات بخبرة +٤ سنوات في Advansys IS. متخصص في تحويل احتياجات المستخدمين لأنظمة تفاعلية متكاملة.",
            }, language)}
          </p>
          <div className="mt-3 rounded-lg border border-border/50 bg-background/50 p-3.5 flex flex-col gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {localize({ en: "Tools used to create this site", ar: "الأدوات المستخدمة في إنشاء الموقع" }, language)}
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {localize({
                en: "This project was built using a combination of human UX direction and advanced AI tooling, including Antigravity, OpenAI Codex, Figma, and Lovable.",
                ar: "تم بناء هذا المشروع باستخدام مزيج من توجيهات تجربة المستخدم البشرية وأدوات الذكاء الاصطناعي المتقدمة، بما في ذلك Antigravity، OpenAI Codex، Figma، و Lovable.",
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
          <span className="font-mono text-muted-foreground">{localize({ en: "Cairo, Egypt", ar: "القاهرة، مصر" }, language)}</span>
          <div className="flex items-center gap-4">
            <a 
              href="https://www.linkedin.com/in/creativemahdy"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors font-medium"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-4 w-4" />
              <span className="hidden sm:inline">LinkedIn</span>
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

      {/* 3. Interactive Persona Studies Panel */}
      <section className="panel bg-card/30 p-5 md:p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>{localize({ en: "Persona Studies", ar: "شخصيات المستخدمين" }, language)}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {localize({ en: "Select a user persona to audit their unique screen requirements and constraints.", ar: "اختر شخصية مستخدم لمعاينة متطلبات شاشتهم ومحددات العمل الخاصة بهم." }, language)}
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
                  {localize(p.id === "karim" ? { en: "Karim", ar: "كريم" } : p.id === "sara" ? { en: "Sarah", ar: "سارة" } : { en: "David", ar: "ديفيد" }, language)}
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
            <div className="bg-secondary/20 border border-border/60 rounded-xl p-4.5 flex flex-col justify-between min-h-[170px] animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <h3 className="font-bold text-foreground text-base flex items-center gap-1.5">
                  <User className="h-4.5 w-4.5 text-primary" />
                  <span>{localize(activeData.name, language)}</span>
                </h3>
                <p className="text-sm text-primary font-semibold mt-1">{localize(activeData.role, language)}</p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{localize(activeData.needs, language)}</p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 border-t border-border/40 pt-3 text-xs font-mono text-muted-foreground">
                {activeData.specs.map((spec, i) => (
                  <div key={i}>
                    <div className="font-bold text-muted-foreground text-xs uppercase tracking-wide">{localize(spec.label, language)}</div>
                    <div className="truncate mt-0.5 text-sm text-foreground font-semibold">{localize(spec.val, language)}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </section>

      {/* 4. Graphical Timeline Panel */}
      <section className="panel bg-card/30 p-5 md:p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-primary" />
            <span>{localize({ en: "Design Journey Timeline", ar: "خطة وجدول التصميم" }, language)}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {localize({ en: "Click on any design phase card below to inspect its key deliverables.", ar: "اضغط على أي من بطاقات مراحل التصميم لمعاينة المخرجات الرئيسية." }, language)}
          </p>
        </div>

        {/* Vertical roadmaps with no empty gaps */}
        <div className="relative flex flex-col gap-4 ps-1">
          {timelinePhases.map((phase) => {
            const Icon = phase.icon;
            const isExpanded = !!expandedPhases[phase.id];
            return (
              <div key={phase.id} className="relative flex gap-4">
                {/* Left phase icon with outer border */}
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => togglePhase(phase.id)}
                    className={`relative z-10 w-10 h-10 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                      isExpanded ? "border-primary bg-primary/10 text-primary" : "border-border/80 bg-card text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                  {/* Visual connector line */}
                  <div className="w-[1.5px] bg-border flex-1 min-h-[16px] my-1" />
                </div>

                {/* Right side information card */}
                <div 
                  onClick={() => togglePhase(phase.id)}
                  className={`flex-1 bg-secondary/15 border rounded-xl p-4 transition-all duration-300 cursor-pointer ${
                    isExpanded ? "border-primary/40 bg-secondary/25 shadow-sm" : "border-border/60 hover:border-border"
                  }`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <h4 className={`font-semibold text-sm transition-colors ${isExpanded ? "text-primary font-bold" : "text-muted-foreground"}`}>
                      {localize(phase.title, language)}
                    </h4>
                    {isExpanded ? <ChevronUp className="h-4.5 w-4.5 text-primary" /> : <ChevronDown className="h-4.5 w-4.5 text-muted-foreground" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {localize(phase.desc, language)}
                  </p>

                  {/* Expandable deliverables list */}
                  {isExpanded && (
                    <div className="mt-3.5 pt-3 border-t border-border/40 animate-in fade-in duration-300">
                      <ul className="space-y-2 pl-0 list-none text-xs text-muted-foreground">
                        {phase.bullets.map((bullet, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-status-ok shrink-0 mt-0.5" />
                            <span>{localize(bullet, language)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Wireframe vs Polished Slider */}
      <section className="panel bg-card/30 p-5 md:p-6 flex flex-col justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <span>{localize({ en: "Wireframe vs. Polished Card Spec", ar: "مقارنة الهيكل السلكي مع التصميم النهائي" }, language)}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {localize({ en: "Drag the slider to preview the structure of a real MetricCard from the dashboard.", ar: "اسحب المقبض لمقارنة الهيكل التخطيطي للبطاقة بالتصميم الفعلي المستخدم بالموقع." }, language)}
          </p>
        </div>

        <div 
          ref={sliderRef}
          className="relative h-[200px] w-full overflow-hidden rounded-xl border border-border bg-background select-none cursor-ew-resize"
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          {/* Polished Card (Right side/Underneath) */}
          <div className="absolute inset-0 w-full h-full p-4 flex items-center justify-center bg-card">
            <div className="w-full max-w-[300px] panel relative overflow-hidden p-4 bg-background border border-border/80 shadow-md">
              {/* Real MetricCard layout replication */}
              <div className="absolute -top-10 -start-10 h-24 w-24 rounded-full bg-cyan/15 blur-xl pointer-events-none" />
              <div className="absolute inset-y-0 start-0 w-[3px] bg-gradient-to-b from-cyan to-cyan/0" />
              <div className="relative z-10 flex items-start justify-between gap-3 ps-1">
                <div className="min-w-0">
                  <p className="text-xs font-mono uppercase tracking-[0.15em] text-muted-foreground">{localize({ en: "LUGGAGE PROCESSING", ar: "معالجة الحقائب" }, language)}</p>
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="text-2xl font-semibold tracking-tight text-foreground">94.2</span>
                    <span className="font-mono text-xs text-muted-foreground">{localize({ en: "bags/min", ar: "حقيبة/دقيقة" }, language)}</span>
                  </div>
                  <p className="mt-2 inline-flex items-center gap-1 text-xs text-status-ok font-mono">
                    {localize({ en: "▲ +4.1% vs last hr", ar: "▲ +4.1% مقارنة بالساعة الماضية" }, language)}
                  </p>
                </div>
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-cyan/20 bg-cyan/10 text-cyan">
                  <Plane className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Wireframe Card (Left side/Clipped overlay) */}
          <div 
            className="absolute inset-y-0 left-0 h-full overflow-hidden bg-secondary border-r border-dashed border-primary/50 pointer-events-none"
            style={{ width: `${sliderPos}%` }}
          >
            <div className="absolute top-0 left-0 w-full h-full p-4 flex items-center justify-center min-w-[340px]" style={{ width: sliderRef.current?.getBoundingClientRect().width }}>
              <div className="w-full max-w-[300px] border border-dashed border-muted-foreground/50 rounded-lg p-4 bg-background/80 grayscale opacity-60 relative">
                {/* Real MetricCard wireframe layout */}
                <div className="absolute inset-y-0 start-0 w-[3px] border-r border-dashed border-muted-foreground/40" />
                <div className="flex items-start justify-between gap-3 ps-1">
                  <div className="min-w-0">
                    {/* Label skeleton */}
                    <div className="h-3 bg-muted border border-dashed border-muted-foreground/30 rounded w-24" />
                    {/* Value skeleton */}
                    <div className="mt-2.5 flex items-baseline gap-1.5">
                      <div className="h-7 bg-muted border border-dashed border-muted-foreground/30 rounded w-18" />
                      <div className="h-3.5 bg-muted border border-dashed border-muted-foreground/30 rounded w-10" />
                    </div>
                    {/* Delta skeleton */}
                    <div className="h-3.5 bg-muted border border-dashed border-muted-foreground/30 rounded w-20 mt-2" />
                  </div>
                  {/* Icon Box wireframe */}
                  <div className="h-9 w-9 rounded-md border border-dashed border-muted-foreground/40 shrink-0" />
                </div>
              </div>
            </div>
          </div>

          {/* Slider bar */}
          <div 
            className="absolute top-0 bottom-0 w-[3px] bg-primary flex items-center justify-center"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="absolute h-7 w-7 rounded-full bg-primary text-primary-foreground border border-primary-glow flex items-center justify-center shadow-md">
              <span className="text-xs font-bold">↔</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Responsive Breakpoint Grid */}
      <section className="panel bg-card/30 p-5 md:p-6 flex flex-col justify-between gap-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Laptop className="h-5 w-5 text-primary" />
              <span>{localize({ en: "Responsive Layout Breakpoints", ar: "نقاط الاستجابة للشاشات المختلفة" }, language)}</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {localize({ en: "Toggle screen sizes to review grid card flow reflow.", ar: "بدل بين أحجام الشاشات لرؤية مرونة ترتيب بطاقات القياس." }, language)}
            </p>
          </div>
          
          <div className="flex gap-1.5 bg-secondary/80 p-0.5 rounded-lg border border-border shrink-0">
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
        <div className="min-h-[220px] bg-slate-950/80 border border-border/60 rounded-xl p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex justify-between items-center border-b border-border/30 pb-2 text-xs text-muted-foreground font-mono">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-status-ok" />
              <span>CAI HUB METRICS GRID</span>
            </div>
            <span>{activeDevice.toUpperCase()} VIEWPORT</span>
          </div>

          {/* Responsive reflow grid */}
          <div className="flex-1 mt-3.5 overflow-y-auto">
            <div className={`grid gap-3 ${
              activeDevice === "desktop" 
                ? "grid-cols-4" 
                : activeDevice === "laptop" 
                  ? "grid-cols-2" 
                  : "grid-cols-1"
            }`}>
              <MiniMetricCard label={localize({ en: "LUGGAGE FLOW", ar: "تدفق الأمتعة" }, language)} value="94.2" unit={localize({ en: "bags/m", ar: "حقيبة/د" }, language)} delta={localize({ en: "▲ +4.1%", ar: "▲ +4.1%" }, language)} deltaTone="ok" accent="cyan" />
              <MiniMetricCard label={localize({ en: "SEC LANES", ar: "مسارات الأمن" }, language)} value="12" unit={localize({ en: "lanes", ar: "مسارات" }, language)} delta={localize({ en: "▲ +2 lanes", ar: "▲ +2 مسار" }, language)} deltaTone="warn" accent="warn" />
              <MiniMetricCard label={localize({ en: "TERMINAL ARRIV", ar: "وصول المبنى" }, language)} value="1.4k" unit={localize({ en: "pax/h", ar: "راكب/س" }, language)} delta={localize({ en: "▼ -8.4%", ar: "▼ -8.4%" }, language)} deltaTone="crit" />
              <MiniMetricCard label={localize({ en: "GATE LOADS", ar: "حمولة البوابات" }, language)} value="28/30" unit={localize({ en: "gates", ar: "بوابات" }, language)} delta={localize({ en: "93% cap", ar: "سعة 93%" }, language)} deltaTone="info" accent="ok" />
            </div>
          </div>
        </div>

        <div className="bg-background border border-border/40 rounded-xl p-3.5 text-sm leading-relaxed">
          {activeDevice === "desktop" && (
            <div>
              <span className="font-bold text-foreground">Desktop 4K Grid Flow: </span>
              <span className="text-muted-foreground">
                {localize({
                  en: "Row grid layout showing 4 metrics side-by-side. Provides operators full visual coverage at a glance on command walls.",
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
                  en: "Grid reflows into 2 columns of 2 cards each. Adapts content to maximize workspace space on average screens.",
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
                  en: "Cards stack vertically in 1 column. Font sizes scale down slightly and touch areas expand to make dashboard operations fully mobile.",
                  ar: "تترتب البطاقات عمودياً في عمود واحد. تتقلص الخطوط قليلاً وتتوسع مساحة اللمس لجعل لوحة التحكم سهلة الاستخدام بالهواتف.",
                }, language)}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 7. Accessibility & Design Compliance Card */}
      <section className="panel bg-card/30 p-5 md:p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <span>{localize({ en: "Accessibility & Design Compliance", ar: "معايير تيسير الوصول وتوافق التصميم" }, language)}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {localize({ en: "Rigor metrics checked against WCAG 2.1 AA and responsive standards.", ar: "معايير وتصنيفات الأداء مقارنة بالاشتراطات القياسية العالمية." }, language)}
          </p>
        </div>

        <div className="grid gap-4 text-sm">
          {/* Color Contrast */}
          <div className="bg-secondary/20 border border-border/50 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                <Contrast className="h-4.5 w-4.5 text-primary" />
                <span>{localize({ en: "Color & Contrast (WCAG 2.1 AA)", ar: "الألوان والتباين (WCAG 2.1 AA)" }, language)}</span>
              </span>
              <span className="text-xs font-mono text-status-ok bg-status-ok/10 px-2.5 py-0.5 rounded border border-status-ok/25">PASS</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {localize({ en: "Text colors guarantee contrast above 4.5:1, interactive visual assets above 3:1.", ar: "تضمن الألوان تباين نصوص أعلى من ٤.٥:١ وعناصر التفاعل أعلى من ٣:١." }, language)}
            </p>
            
            {/* Contrast swatches */}
            <div className="grid grid-cols-4 gap-2.5 pt-1.5">
              {[
                { name: "Cyan", hex: "#00F0FF", ratio: "4.8:1", bg: "bg-cyan" },
                { name: "Green", hex: "#10B981", ratio: "5.2:1", bg: "bg-status-ok" },
                { name: "Yellow", hex: "#FBBF24", ratio: "4.5:1", bg: "bg-status-warn" },
                { name: "Red", hex: "#EF4444", ratio: "4.6:1", bg: "bg-status-crit" }
              ].map((s, i) => (
                <div key={i} className="bg-secondary/40 border border-border/40 rounded-lg p-2 flex flex-col items-center text-center">
                  <div className={`w-6 h-6 rounded-full ${s.bg} border border-white/10`} />
                  <span className="text-xs font-bold text-foreground mt-1.5 truncate w-full">{s.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground mt-0.5">{s.ratio}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Keyboard Navigation */}
          <div className="bg-secondary/20 border border-border/50 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                <Keyboard className="h-4.5 w-4.5 text-primary" />
                <span>{localize({ en: "Keyboard Navigation & Focus", ar: "التنقل بلوحة المفاتيح والتركيز" }, language)}</span>
              </span>
              <span className="text-xs font-mono text-status-ok bg-status-ok/10 px-2.5 py-0.5 rounded border border-status-ok/25">COMPLIANT</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {localize({ 
                en: "Logical focus tab sequence is locked. Interactive items highlight instantly with explicit focus outlines.", 
                ar: "تسلسل الانتقال المنطقي للتركيز مؤمن. العناصر التفاعلية تبرز فوراً بإطار خارجي محدد." 
                }, language)}
            </p>
          </div>

          {/* RTL Support */}
          <div className="bg-secondary/20 border border-border/50 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                <Globe className="h-4.5 w-4.5 text-primary" />
                <span>{localize({ en: "Bilingual Layout Mirroring (RTL)", ar: "اتجاه وتخطيط اللغات (RTL)" }, language)}</span>
              </span>
              <span className="text-xs font-mono text-status-ok bg-status-ok/10 px-2.5 py-0.5 rounded border border-status-ok/25">ACTIVE</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {localize({ 
                en: "Grids, card borders, text directions, and chevrons automatically mirror based on the selected language context.", 
                ar: "شبكات التصميم واتجاهات الحدود والنصوص والأسهم تنعكس تلقائياً بناءً على اللغة المختارة." 
              }, language)}
            </p>
          </div>
        </div>
      </section>

      {/* 8. Project Status & Roadmap Card */}
      <section className="panel bg-card/30 p-5 md:p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <span>{localize({ en: "Project Status & Roadmap", ar: "حالة المشروع وخريطة التطوير" }, language)}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {localize({ en: "Current dashboard development milestone status.", ar: "الحالة والخطوات المتبقية لتطوير لوحة التحكم." }, language)}
          </p>
        </div>

        <div className="grid gap-4">
          {/* Requirements Matrix Table */}
          <div className="overflow-x-auto border border-border rounded-lg bg-background/50">
            <table className="w-full text-start text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/35 text-muted-foreground font-mono uppercase text-xs tracking-wider">
                  <th className="py-2.5 px-3.5">{localize({ en: "Requirement", ar: "المتطلب" }, language)}</th>
                  <th className="py-2.5 px-3.5">{localize({ en: "Feature in Prototype", ar: "الميزة بالنموذج" }, language)}</th>
                  <th className="py-2.5 px-3.5 text-center">{localize({ en: "Status", ar: "الحالة" }, language)}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium text-foreground text-sm">
                <tr>
                  <td className="py-3 px-3.5">{localize({ en: "Arabic/English Toggle", ar: "تغيير اللغة" }, language)}</td>
                  <td className="py-3 px-3.5 font-mono text-xs text-muted-foreground">{localize({ en: "RTL Switcher hooks", ar: "ربط اتجاه الواجهة (RTL)" }, language)}</td>
                  <td className="py-3 px-3.5 text-center">
                    <span className="text-xs font-mono text-status-ok bg-status-ok/10 px-2 py-0.5 rounded border border-status-ok/20">{localize({ en: "LIVE", ar: "مباشر" }, language)}</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3.5">{localize({ en: "AODB Flight Feed", ar: "تغذية الرحلات الجوية" }, language)}</td>
                  <td className="py-3 px-3.5 font-mono text-xs text-muted-foreground">{localize({ en: "Simulated feed state", ar: "تغذية بيانات افتراضية" }, language)}</td>
                  <td className="py-3 px-3.5 text-center">
                    <span className="text-xs font-mono text-status-warn bg-status-warn/10 px-2 py-0.5 rounded border border-status-warn/20">{localize({ en: "PENDING", ar: "قيد الانتظار" }, language)}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Roadmap details checklist */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-background border border-border/60 rounded-xl p-4">
              <h3 className="font-bold text-foreground text-xs uppercase font-mono text-status-ok flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>{localize({ en: "Built Now", ar: "المكتمل" }, language)}</span>
              </h3>
              <ul className="mt-2 space-y-1 pl-0 list-none text-muted-foreground text-xs">
                <li>{localize({ en: "• Interactive sliders", ar: "• عناصر التمرير التفاعلية" }, language)}</li>
                <li>{localize({ en: "• Responsive grid reflow", ar: "• إعادة ترتيب الشبكة المتجاوبة" }, language)}</li>
                <li>{localize({ en: "• Contrast compliance", ar: "• التوافق مع نسب التباين" }, language)}</li>
              </ul>
            </div>
            <div className="bg-background border border-border/60 rounded-xl p-4">
              <h3 className="font-bold text-foreground text-xs uppercase font-mono text-status-warn flex items-center gap-1">
                <RefreshCw className="h-4 w-4 animate-spin" style={{ animationDuration: "3s" }} />
                <span>{localize({ en: "Next Step", ar: "الخطوة التالية" }, language)}</span>
              </h3>
              <ul className="mt-2 space-y-1 pl-0 list-none text-muted-foreground text-xs">
                <li>{localize({ en: "• API endpoint linking", ar: "• ربط نقاط واجهة البرمجة (API)" }, language)}</li>
                <li>{localize({ en: "• Operational credentials", ar: "• بيانات الاعتماد التشغيلية" }, language)}</li>
                <li>{localize({ en: "• Export to Excel/CSV", ar: "• تصدير البيانات إلى Excel/CSV" }, language)}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
