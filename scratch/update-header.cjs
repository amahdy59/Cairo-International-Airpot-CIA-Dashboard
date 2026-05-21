const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Replace CAI with CIA in UI texts
code = code.replace(/CAI Command Hub/g, "CIA Command Hub");
code = code.replace(/CAI operations sample/g, "CIA operations sample");

// 2. Remove Hero component
const heroStart = code.indexOf('function Hero(');
const heroEnd = code.indexOf('}', code.indexOf('</section>', heroStart)) + 1;
code = code.substring(0, heroStart) + code.substring(heroEnd);

// 3. Update TopNav signature
code = code.replace(
  /function TopNav\(\{[\s\S]*?\}\) \{/,
  `function TopNav({
  language,
  setLanguage,
  theme,
  setTheme,
  highContrast,
  setHighContrast,
  times,
  activeTab,
  setActiveTab
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
}) {`
);

// 4. Rewrite TopNav return
const topNavStart = code.indexOf('return (', code.indexOf('function TopNav'));
const topNavEnd = code.indexOf(');', topNavStart) + 2;

const newTopNavReturn = `return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/82 backdrop-blur-xl">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">
        {tr("Skip to content")}
      </a>
      <div className="mx-auto flex min-h-16 max-w-[1480px] flex-wrap items-center justify-between gap-3 px-3 py-2 sm:px-5 lg:px-6">
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
          <div className="hidden h-10 items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 lg:flex">
            <Clock3 aria-hidden="true" className="h-4 w-4 text-primary" />
            <TimeChip label={tr("Cairo")} value={times.cairo} />
            <span className="h-5 w-px bg-border" />
            <TimeChip label="UTC" value={times.utc} />
          </div>
          <button type="button" onClick={() => setHighContrast(!highContrast)} className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-secondary/40 hover:bg-secondary" aria-label={c.contrast}>
            <Contrast aria-hidden="true" className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-secondary/40 hover:bg-secondary" aria-label={\`\${c.theme}: \${theme === "dark" ? "Light" : "Dark"}\`}>
            <ThemeIcon aria-hidden="true" className="h-4 w-4 text-primary" />
          </button>
          <button type="button" onClick={() => setLanguage(language === "en" ? "ar" : "en")} className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 text-sm hover:bg-secondary" aria-label={\`\${c.language}: \${language === "en" ? "AR" : "EN"}\`}>
            <Languages aria-hidden="true" className="h-4 w-4 text-primary" />
            {language === "en" ? "AR" : "EN"}
          </button>
        </div>
      </div>
    </header>
  );`;

code = code.substring(0, topNavStart) + newTopNavReturn + code.substring(topNavEnd);

// 5. Update App component render to pass activeTab to TopNav and remove Hero
code = code.replace(
  /<TopNav language=\{language\} setLanguage=\{setLanguage\} theme=\{theme\} setTheme=\{setTheme\} highContrast=\{highContrast\} setHighContrast=\{setHighContrast\} times=\{times\} \/>\s*<main id="main" className="mx-auto grid w-full max-w-\[1480px\] min-w-0 gap-4 overflow-x-hidden px-3 py-4 sm:gap-5 sm:px-5 lg:gap-6 lg:px-6">\s*<Hero activeTab=\{activeTab\} setActiveTab=\{setActiveTab\} language=\{language\} \/>/,
  `<TopNav language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} highContrast={highContrast} setHighContrast={setHighContrast} times={times} activeTab={activeTab} setActiveTab={setActiveTab} />
      <main id="main" className="mx-auto grid w-full max-w-[1480px] min-w-0 gap-4 overflow-x-hidden px-3 py-4 sm:gap-5 sm:px-5 lg:gap-6 lg:px-6">`
);

fs.writeFileSync('src/App.tsx', code);
