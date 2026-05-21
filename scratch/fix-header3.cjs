const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Update the Header component signature
code = code.replace(
  /function Header\(\{[\s\S]*?times,\n\}: \{\n[\s\S]*?times: \{ cairo: string; utc: string \};\n\}\) \{/,
  `function Header({
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

// 2. Add the navigation tabs inside the header
const targetDiv = `<div className="mx-auto flex min-h-16 max-w-[1480px] items-center justify-between gap-3 px-3 py-2 sm:px-5 lg:px-6">`;
const replacementDiv = `<div className="mx-auto flex min-h-16 max-w-[1480px] flex-wrap items-center justify-between gap-3 px-3 py-2 sm:px-5 lg:px-6">`;

code = code.replace(targetDiv, replacementDiv);

const oldNavAndIcons = `<div className="flex items-center gap-2">
          <div className="hidden h-10 items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 md:flex">`;
const newNavAndIcons = `
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

code = code.replace(oldNavAndIcons, newNavAndIcons);

// 3. Update the App component to pass activeTab to Header
code = code.replace(
  /<Header language=\{language\} setLanguage=\{setLanguage\} theme=\{theme\} setTheme=\{setTheme\} highContrast=\{highContrast\} setHighContrast=\{setHighContrast\} times=\{times\} \/>/,
  `<Header language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} highContrast={highContrast} setHighContrast={setHighContrast} times={times} activeTab={activeTab} setActiveTab={setActiveTab} />`
);

// 4. Remove the Hero component completely
const heroUsage = `        <Hero activeTab={activeTab} setActiveTab={setActiveTab} language={language} />`;
code = code.replace(heroUsage, '');

const heroDefStart = code.indexOf('function Hero({ activeTab');
const heroDefEnd = code.indexOf('</section>\n  );\n}', heroDefStart) + '</section>\n  );\n}'.length;
if (heroDefStart !== -1) {
  code = code.substring(0, heroDefStart) + code.substring(heroDefEnd);
}

// 5. Update main tag padding to increase density
code = code.replace(
  /className="mx-auto grid w-full max-w-\[1480px\] min-w-0 gap-4 overflow-x-hidden px-3 py-4 sm:gap-5 sm:px-5 lg:gap-6 lg:px-6"/,
  `className="mx-auto grid w-full max-w-[1480px] min-w-0 gap-4 overflow-x-hidden px-2 py-4 sm:gap-4 sm:px-4 lg:gap-5 lg:px-6"`
);

// 6. Update the Scenes images
code = code.replace(/url: "\/manager-assets\/aerial-scene-2\.jpg"/g, 'url: "/manager-assets/scene-t3.webp"'); // T3 is default maybe? Let's check scenes
// Let's replace the images mapping manually:
code = code.replace(/{[\s\S]*?id: "terminal-3",[\s\S]*?url: ".*?",/, `{
    id: "terminal-3",
    label: "Terminal 3",
    title: "Terminal 3 Aerial",
    summary: "Airside and landside view of the main international hub.",
    url: "/manager-assets/scene-t3.webp",`);

code = code.replace(/{[\s\S]*?id: "terminal-2",[\s\S]*?url: ".*?",/, `{
    id: "terminal-2",
    label: "Terminal 2",
    title: "Terminal 2 Gates",
    summary: "Regional and secondary international flights operations.",
    url: "/manager-assets/scene-t2.webp",`);

code = code.replace(/{[\s\S]*?id: "terminal-1",[\s\S]*?url: ".*?",/, `{
    id: "terminal-1",
    label: "Terminal 1",
    title: "Terminal 1 Facilities",
    summary: "Domestic flights and specific international carriers.",
    url: "/manager-assets/scene-t1.webp",`);

code = code.replace(/{[\s\S]*?id: "landside",[\s\S]*?url: ".*?",/, `{
    id: "landside",
    label: "Landside",
    title: "Parking and Access",
    summary: "Traffic flow, parking capacity and ground transport.",
    url: "/manager-assets/scene-landside.webp",`);

code = code.replace(/{[\s\S]*?id: "support",[\s\S]*?url: ".*?",/, `{
    id: "support",
    label: "Support Services",
    title: "Support Operations",
    summary: "Cargo, maintenance, and catering facilities.",
    url: "/manager-assets/scene-support.webp",`);


fs.writeFileSync('src/App.tsx', code);
