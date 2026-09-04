import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  Radar, 
  Activity, 
  ShieldCheck, 
  FileText, 
  Moon, 
  Sun, 
  Languages, 
  Contrast, 
  Plane, 
  MapPin, 
  ArrowRight,
  X
} from 'lucide-react';
import { ManagerTab, Language, ThemeMode, departures, arrivals, scenes } from '../data';
import { localize } from '../utils/helpers';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ManagerTab) => void;
  onSelectScene?: (sceneId: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  onShowResources: () => void;
}

interface CommandItem {
  id: string;
  category: 'views' | 'scenes' | 'flights' | 'settings';
  categoryLabel: { en: string; ar: string };
  title: string;
  subtitle?: string;
  icon: typeof Search;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onSelectTab,
  onSelectScene,
  language,
  setLanguage,
  theme,
  setTheme,
  highContrast,
  setHighContrast,
  onShowResources,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [];

    // Views
    list.push(
      {
        id: 'view-digital',
        category: 'views',
        categoryLabel: { en: 'Views & Tabs', ar: 'الأقسام والتبويبات' },
        title: language === 'ar' ? 'التوأم الرقمي (Digital Twin)' : 'Digital Twin Hub',
        subtitle: language === 'ar' ? 'عرض الساحات والخرائط والكاميرات الحية' : '3D aprons, terminals, and live CCTV feeds',
        icon: Radar,
        shortcut: '1',
        action: () => {
          onSelectTab('digital');
          onClose();
        },
      },
      {
        id: 'view-ops',
        category: 'views',
        categoryLabel: { en: 'Views & Tabs', ar: 'الأقسام والتبويبات' },
        title: language === 'ar' ? 'مركز العمليات (Operations)' : 'Flight & Passenger Operations',
        subtitle: language === 'ar' ? 'لوحات الرحلات وتدفق الركاب وإدارة البوابات' : 'Flight boards, passenger flow, gate wait times',
        icon: Activity,
        shortcut: '2',
        action: () => {
          onSelectTab('operations');
          onClose();
        },
      },
      {
        id: 'view-safety',
        category: 'views',
        categoryLabel: { en: 'Views & Tabs', ar: 'الأقسام والتبويبات' },
        title: language === 'ar' ? 'السلامة والامتثال (Safety & Compliance)' : 'Safety & Compliance',
        subtitle: language === 'ar' ? 'التنبيهات الفنية وسجلات الصيانة ومخاطر الطائرات' : 'Safety alerts, maintenance backlog, risk index',
        icon: ShieldCheck,
        shortcut: '3',
        action: () => {
          onSelectTab('safety');
          onClose();
        },
      },
      {
        id: 'view-resources',
        category: 'views',
        categoryLabel: { en: 'Views & Tabs', ar: 'الأقسام والتبويبات' },
        title: language === 'ar' ? 'توثيق المشروع ومكتبة الموارد' : 'Documentation & Resources Audit',
        subtitle: language === 'ar' ? 'تقرير التقييم التقني ومصادر البيانات' : 'Technical design system, audit logs & specs',
        icon: FileText,
        action: () => {
          onShowResources();
          onClose();
        },
      }
    );

    // Scenes
    scenes.forEach((scene) => {
      list.push({
        id: `scene-${scene.id}`,
        category: 'scenes',
        categoryLabel: { en: 'Digital Twin Scenes', ar: 'مناطق التوأم الرقمي' },
        title: localize(scene.title, language),
        subtitle: localize(scene.summary, language),
        icon: MapPin,
        action: () => {
          onSelectTab('digital');
          if (onSelectScene) onSelectScene(scene.id);
          onClose();
        },
      });
    });

    // Flights
    departures.slice(0, 4).forEach((f) => {
      list.push({
        id: `dep-${f.flight}`,
        category: 'flights',
        categoryLabel: { en: 'Flight Tracker', ar: 'تتبع الرحلات' },
        title: `${f.flight} → ${localize(f.city, language)}`,
        subtitle: `${language === 'ar' ? 'المغادرة' : 'Dep'} ${f.time} | Gate ${f.gate} | ${localize(f.status, language)}`,
        icon: Plane,
        action: () => {
          onSelectTab('operations');
          onClose();
        },
      });
    });

    arrivals.slice(0, 4).forEach((f) => {
      list.push({
        id: `arr-${f.flight}`,
        category: 'flights',
        categoryLabel: { en: 'Flight Tracker', ar: 'تتبع الرحلات' },
        title: `${f.flight} ← ${localize(f.city, language)}`,
        subtitle: `${language === 'ar' ? 'الوصول' : 'Arr'} ${f.time} | Gate ${f.gate} | ${localize(f.status, language)}`,
        icon: Plane,
        action: () => {
          onSelectTab('operations');
          onClose();
        },
      });
    });

    // Settings
    list.push(
      {
        id: 'toggle-theme',
        category: 'settings',
        categoryLabel: { en: 'Preferences', ar: 'الإعدادات والتفضيلات' },
        title: theme === 'dark' ? (language === 'ar' ? 'التحويل إلى الوضع النهاري' : 'Switch to Light Mode') : (language === 'ar' ? 'التحويل إلى الوضع الليلي' : 'Switch to Dark Mode'),
        icon: theme === 'dark' ? Sun : Moon,
        action: () => {
          setTheme(theme === 'dark' ? 'light' : 'dark');
          onClose();
        },
      },
      {
        id: 'toggle-contrast',
        category: 'settings',
        categoryLabel: { en: 'Preferences', ar: 'الإعدادات والتفضيلات' },
        title: highContrast ? (language === 'ar' ? 'تعطيل وضع التباين العالي' : 'Disable High Contrast') : (language === 'ar' ? 'تفعيل وضع التباين العالي' : 'Enable High Contrast'),
        icon: Contrast,
        action: () => {
          setHighContrast(!highContrast);
          onClose();
        },
      },
      {
        id: 'toggle-lang',
        category: 'settings',
        categoryLabel: { en: 'Preferences', ar: 'الإعدادات والتفضيلات' },
        title: language === 'en' ? 'التبديل إلى اللغة العربية (RTL)' : 'Switch to English (LTR)',
        icon: Languages,
        action: () => {
          setLanguage(language === 'en' ? 'ar' : 'en');
          onClose();
        },
      }
    );

    return list;
  }, [language, theme, highContrast, onSelectTab, onSelectScene, onShowResources, setHighContrast, setLanguage, setTheme, onClose]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase().trim();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.id.toLowerCase().includes(q)
    );
  }, [items, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      scrollSelectedIntoView((selectedIndex + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      scrollSelectedIntoView((selectedIndex - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const scrollSelectedIntoView = (index: number) => {
    const list = listRef.current;
    if (!list) return;
    const el = list.children[index] as HTMLElement | undefined;
    if (el) {
      el.scrollIntoView({ block: 'nearest' });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={language === 'ar' ? 'لوحة الأوامر السريعة' : 'Quick Command Palette'}
      className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border border-border/80 bg-background/95 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header Search Input */}
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3.5 bg-secondary/20">
          <Search className="h-5 w-5 text-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === 'ar' ? 'ابحث عن قسم، رحلة، أو منطقة (مثال: MS777, Apron)...' : 'Type a command, flight, or scene (e.g. MS777, Apron)...'}
            aria-label={language === 'ar' ? 'البحث في لوحة الأوامر' : 'Search commands, flights, or scenes'}
            className="flex-1 bg-transparent text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none font-medium"
            aria-autocomplete="list"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label={language === 'ar' ? 'مسح البحث' : 'Clear search'}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center rounded border border-border/80 bg-secondary/50 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          role="listbox"
          className="flex-1 overflow-y-auto p-2 divide-y divide-border/20 no-scrollbar"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {language === 'ar' ? 'لم يتم العثور على أوامر مطابقة.' : 'No matching commands or flights found.'}
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => item.action()}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 min-h-[44px] cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'hover:bg-secondary/40 text-foreground'
                  }`}
                >
                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${
                      isSelected
                        ? 'border-primary-foreground/30 bg-primary-foreground/15 text-primary-foreground'
                        : 'border-border/50 bg-secondary/30 text-primary'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isSelected ? 'text-primary-foreground' : 'text-foreground'}`}>
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p
                        className={`text-xs truncate ${
                          isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                        }`}
                      >
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                  {item.shortcut ? (
                    <kbd
                      className={`inline-flex items-center rounded px-2 py-0.5 font-mono text-[10px] border ${
                        isSelected
                          ? 'border-primary-foreground/40 bg-primary-foreground/20 text-primary-foreground'
                          : 'border-border/80 bg-secondary/50 text-muted-foreground'
                      }`}
                    >
                      {item.shortcut}
                    </kbd>
                  ) : (
                    <ArrowRight
                      className={`h-3.5 w-3.5 shrink-0 rtl:rotate-180 opacity-0 transition-opacity ${
                        isSelected ? 'opacity-100' : ''
                      }`}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="flex items-center justify-between border-t border-border/50 bg-secondary/20 px-4 py-2 text-[11px] text-muted-foreground font-mono">
          <span className="hidden sm:inline">
            {language === 'ar' ? 'استخدم الأسهم ↑ ↓ للتنقل، Enter للاختيار' : 'Use ↑ ↓ to navigate, Enter to select'}
          </span>
          <span className="ms-auto flex items-center gap-2">
            <span>CAI Command Palette</span>
            <kbd className="rounded border border-border/60 bg-secondary/40 px-1.5 py-0.5 text-[9px]">
              Ctrl+K
            </kbd>
          </span>
        </div>
      </div>
    </div>
  );
}
