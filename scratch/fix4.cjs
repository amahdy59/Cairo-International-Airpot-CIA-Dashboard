const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Strings replacement
code = code.replaceAll('CAI Command Hub', 'CIA Command Hub');
code = code.replaceAll('IATA: CAI', 'IATA: CIA');
code = code.replaceAll('CAI operations sample', 'CIA operations sample');

// 2. Header params
const oldHeaderSig = `function Header({
  language,
  setLanguage,
  theme,
  setTheme,
  highContrast,
  setHighContrast,
  times,
}: {
  language: Language;
  setLanguage: (language: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  times: { cairo: string; utc: string };
}) {`;

const newHeaderSig = `function Header({
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
}) {`;
code = code.replace(oldHeaderSig, newHeaderSig);

// 3. Header tabs
const oldHeaderDiv = `<div className="mx-auto flex min-h-16 max-w-[1480px] items-center justify-between gap-3 px-3 py-2 sm:px-5 lg:px-6">
        <a href="#main" className="flex min-w-0 items-center gap-3 rounded-md" aria-label={\`\${c.airport} \${c.brand}. \${tr("Go to dashboard")}\`}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/50 bg-primary/15 glow-cyan">
            <Plane aria-hidden="true" className="h-5 w-5 text-primary" />
          </span>
          <span className="min-w-0 max-w-[46vw] sm:max-w-none">
            <span className="block truncate font-mono text-[10px] uppercase tracking-[0.18em] text-primary sm:text-[11px] sm:tracking-[0.28em]">{c.airport}</span>
            <span className="block truncate text-sm font-semibold">{c.brand}</span>
          </span>
        </a>
        <div className="flex items-center gap-2">
          <div className="hidden h-10 items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 md:flex">`;

const newHeaderDiv = `<div className="mx-auto flex min-h-16 max-w-[1480px] flex-wrap items-center justify-between gap-3 px-3 py-2 sm:px-5 lg:px-6">
        <a href="#main" className="flex min-w-0 items-center gap-3 rounded-md" aria-label={\`\${c.airport} \${c.brand}. \${tr("Go to dashboard")}\`}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/50 bg-primary/15 glow-cyan">
            <Plane aria-hidden="true" className="h-5 w-5 text-primary" />
          </span>
          <span className="hidden min-w-0 sm:block sm:max-w-none">
            <span className="block truncate font-mono text-[10px] uppercase tracking-[0.18em] text-primary sm:text-[11px] sm:tracking-[0.28em]">{c.airport}</span>
            <span className="block truncate text-sm font-semibold">{c.brand}</span>
          </span>
        </a>
        
        {/* Navigation Tabs */}
        <nav className="flex flex-1 justify-center order-3 w-full sm:order-none sm:w-auto mt-2 sm:mt-0" role="tablist" aria-label={tr("Manager dashboard sections")}>
          <div className="flex items-center gap-1 rounded-xl bg-secondary/30 p-1 backdrop-blur-md">
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
                  className={\`flex min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2 sm:px-4 sm:py-2 text-sm font-semibold transition \${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"}\`}
                >
                  <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="flex items-center gap-2 order-2 sm:order-none">
          <div className="hidden h-10 items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 lg:flex">`;

code = code.replace(oldHeaderDiv, newHeaderDiv);

// 4. Header usage in App
code = code.replace(
  `<Header language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} highContrast={highContrast} setHighContrast={setHighContrast} times={times} />`,
  `<Header language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} highContrast={highContrast} setHighContrast={setHighContrast} times={times} activeTab={activeTab} setActiveTab={setActiveTab} />`
);

// 5. Main wrapper density
code = code.replace(
  `<main id="main" className="mx-auto grid w-full max-w-[1480px] min-w-0 gap-4 overflow-x-hidden px-3 py-4 sm:gap-5 sm:px-5 lg:gap-6 lg:px-6">`,
  `<main id="main" className="mx-auto grid w-full max-w-[1480px] min-w-0 gap-4 overflow-x-hidden px-2 py-4 sm:gap-4 sm:px-4 lg:gap-5 lg:px-6">`
);

// 6. Remove Hero usage
code = code.replace(
  `        <Hero activeTab={activeTab} setActiveTab={setActiveTab} language={language} />\n`,
  ``
);

// 7. Remove Hero definition
const heroDef = `function Hero({ activeTab, setActiveTab, language }: { activeTab: ManagerTab; setActiveTab: (tab: ManagerTab) => void; language: Language }) {
  const c = copy[language];
  const { tr } = useLocale();
  const tabs: { id: ManagerTab; label: string; icon: LucideIcon }[] = [
    { id: "digital", label: c.digital, icon: Radar },
    { id: "operations", label: c.operations, icon: Activity },
    { id: "safety", label: c.safety, icon: ShieldCheck },
  ];

  return (
    <section className="manager-hero panel overflow-hidden p-4 sm:p-6">
      <img
        src={HERO_PLANE}
        alt="EgyptAir aircraft in flight"
        className="pointer-events-none absolute right-12 rtl:left-12 rtl:right-auto rtl:-scale-x-100 top-1/2 z-[1] hidden h-24 w-auto max-w-[35%] -translate-y-1/2 object-contain opacity-80 drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)] dark:opacity-95 dark:drop-shadow-[0_16px_24px_rgba(0,0,0,0.45)] sm:block md:h-28 lg:right-20 lg:rtl:left-20 lg:rtl:right-auto lg:h-32 xl:h-40"
      />
      <div className="relative z-10 min-w-0">
        <p className="break-words font-mono text-[11px] uppercase tracking-[0.28em] text-primary">{c.manager}</p>
        <h1 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight sm:text-4xl">{c.heroTitle}</h1>
        <p className="mt-2 max-w-4xl text-sm leading-relaxed text-muted-foreground sm:text-base">{c.heroBody}</p>
        <nav className="mt-5 grid w-full max-w-full grid-cols-1 gap-3 rounded-xl border border-border bg-background/45 p-2.5 backdrop-blur-md sm:inline-flex sm:w-auto sm:flex-wrap" role="tablist" aria-label={tr("Manager dashboard sections")}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={\`inline-flex h-12 items-center justify-center gap-3 rounded-lg px-6 text-sm font-semibold transition-all duration-300 sm:justify-start \${activeTab === tab.id ? "bg-[#3154D4] dark:bg-primary text-white shadow-[0_8px_20px_rgba(49,84,212,0.22)] dark:shadow-none" : "bg-transparent text-slate-600 hover:bg-secondary/60 hover:text-foreground dark:text-muted-foreground"}\`}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </section>
  );
}`;
code = code.replace(heroDef, '');

// 8. Update images in scenes array
const imgMap = [
  { id: 'terminal-3', file: 'scene-t3.webp' },
  { id: 'terminal-2', file: 'scene-t2.webp' },
  { id: 'terminal-1', file: 'scene-t1.webp' },
  { id: 'landside', file: 'scene-landside.webp' },
  { id: 'support', file: 'scene-support.webp' }
];

for (const m of imgMap) {
  // We look for \`url: "..."\` immediately following the id
  const regex = new RegExp(\`id: "\${m.id}",([\\\\s\\\\S]*?)url: ".*?"\`, 'g');
  code = code.replace(regex, \`id: "\${m.id}",$1url: "/manager-assets/\${m.file}"\`);
}

fs.writeFileSync('src/App.tsx', code);
