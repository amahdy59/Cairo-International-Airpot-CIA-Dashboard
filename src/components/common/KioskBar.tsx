import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  SkipForward,
  Maximize,
  Minimize,
  X,
  Tv,
  Volume2,
  VolumeX,
  Info,
  Radio,
} from "lucide-react";
import { useLocale } from "../../context/locale";
import { useSimulation } from "../../context/simulation";
import { useAirfieldRadio } from "../../hooks/useAirfieldRadio";
import { RADIO_CHANNELS, RadioChannel } from "../../services/airfieldAudio";
import { localize } from "../../utils/helpers";
import { ManagerTab } from "../../data";

interface KioskBarProps {
  activeTab: ManagerTab;
}

export function KioskBar({ activeTab }: KioskBarProps) {
  const { language } = useLocale();
  const {
    isKioskActive,
    setIsKioskActive,
    isKioskPaused,
    setIsKioskPaused,
    kioskSecondsRemaining,
    skipKioskNext,
  } = useSimulation();

  const {
    isMuted,
    toggleMute,
    activeChannel,
    setChannel,
    isTransmitting,
    currentTransmission,
    triggerNext,
  } = useAirfieldRadio();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showChannelMenu, setShowChannelMenu] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  if (!isKioskActive) return null;

  const progressPercent = ((25 - kioskSecondsRemaining) / 25) * 100;

  const tabNames: Record<ManagerTab, { en: string; ar: string }> = {
    digital: { en: "Digital Twin Hub", ar: "مركز التوأم الرقمي" },
    operations: { en: "Airfield Operations", ar: "عمليات ساحة الطيران" },
    safety: { en: "Safety & Compliance", ar: "السلامة والامتثال" },
  };

  return (
    <>
      <aside
        aria-label={localize(
          {
            en: "AOCC Command Carousel & Airfield Radio Player",
            ar: "دورة شاشات مركز العمليات ومشغل إذاعة المطار",
          },
          language
        )}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex w-[calc(100%-1rem)] max-w-2xl flex-col items-center gap-2 rounded-2xl border border-primary/40 bg-background/95 p-2.5 px-3 sm:px-4 shadow-[0_16px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl animate-in slide-in-from-bottom-6 duration-300 text-foreground"
      >
        {/* Progress Bar with 25s visual timer */}
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden relative">
          <div
            className="h-full bg-primary transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Live Radio Caption Strip (WCAG 2.2 AAA Real-Time Captioning) */}
        {!isMuted && currentTransmission && (
          <div className="w-full flex items-center justify-between gap-2 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <Radio className="h-3.5 w-3.5 text-primary shrink-0 animate-pulse" />
              <span className="font-mono text-[10px] font-bold text-primary px-1.5 py-0.5 rounded bg-primary/20 shrink-0">
                {RADIO_CHANNELS[activeChannel].frequency}
              </span>
              <span className="truncate text-muted-foreground">
                <strong className="text-foreground font-semibold">
                  {currentTransmission.callsign}:
                </strong>{" "}
                {currentTransmission.text[language] || currentTransmission.text.en}
              </span>
            </div>
            <button
              type="button"
              onClick={() => triggerNext(language)}
              className="text-[10px] font-semibold text-primary hover:underline shrink-0 cursor-pointer"
              title={localize({ en: "Broadcast next message", ar: "بث النداء التالي" }, language)}
            >
              {localize({ en: "Next Call", ar: "النداء التالي" }, language)}
            </button>
          </div>
        )}

        {/* Controls Row */}
        <div className="flex w-full items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          {/* Label & Active Carousel View */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/20 text-primary shrink-0">
                <Tv className="h-4.5 w-4.5" />
              </span>
              {isTransmitting && (
                <span className="absolute -top-1 -end-1 h-3 w-3 rounded-full bg-status-ok animate-ping" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-xs sm:text-sm text-foreground whitespace-nowrap">
                  {localize({ en: "AOCC Video Wall", ar: "شاشة العمليات AOCC" }, language)}
                </span>
                <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground font-semibold">
                  {kioskSecondsRemaining}s
                </span>
                {/* Info Button */}
                <button
                  type="button"
                  onClick={() => setShowInfoModal(true)}
                  className="inline-flex items-center justify-center h-5 w-5 rounded-full text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  aria-label={localize({ en: "What is this player?", ar: "ما هذا المشغل؟" }, language)}
                  title={localize({ en: "What is this player?", ar: "ما هذا المشغل؟" }, language)}
                >
                  <Info className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-primary font-semibold truncate">
                  {localize(tabNames[activeTab], language)}
                </span>
                <span className="text-muted-foreground hidden md:inline">
                  • {localize({ en: "Auto-cycles every 25s", ar: "تبديل تلقائي كل ٢٥ث" }, language)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Tools & Audio Controls */}
          <div className="flex items-center gap-1 ms-auto shrink-0">
            {/* Airfield Radio Voice Speaker Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={toggleMute}
                className={`flex h-11 min-h-[44px] items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 text-xs font-semibold transition cursor-pointer ${
                  !isMuted
                    ? "border-primary/50 bg-primary/20 text-primary shadow-sm"
                    : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
                aria-label={
                  isMuted
                    ? localize(
                        {
                          en: "Unmute Cairo Tower & ATIS Radio Voice",
                          ar: "تشغيل صوت إذاعة وبرج مراقبة القاهرة",
                        },
                        language
                      )
                    : localize(
                        {
                          en: "Mute Cairo Tower & ATIS Radio Voice",
                          ar: "كتم صوت إذاعة وبرج مراقبة القاهرة",
                        },
                        language
                      )
                }
                title={
                  isMuted
                    ? localize(
                        {
                          en: "Unmute Cairo Tower ATC & ATIS Radio Voice",
                          ar: "تشغيل صوت إذاعة وبرج مراقبة القاهرة",
                        },
                        language
                      )
                    : localize(
                        {
                          en: "Mute Cairo Tower ATC & ATIS Radio Voice",
                          ar: "كتم صوت إذاعة وبرج مراقبة القاهرة",
                        },
                        language
                      )
                }
              >
                {!isMuted ? (
                  <>
                    <Volume2 className="h-4 w-4 text-primary shrink-0" />
                    {/* Animated Soundwave Bars */}
                    <span className="flex items-end gap-0.5 h-3.5 w-4" aria-hidden="true">
                      <span
                        className={`w-0.5 bg-primary rounded-full transition-all duration-150 ${
                          isTransmitting ? "h-3 animate-pulse" : "h-1.5"
                        }`}
                      />
                      <span
                        className={`w-0.5 bg-primary rounded-full transition-all duration-200 ${
                          isTransmitting ? "h-3.5 animate-bounce" : "h-2"
                        }`}
                      />
                      <span
                        className={`w-0.5 bg-primary rounded-full transition-all duration-150 ${
                          isTransmitting ? "h-2.5 animate-pulse" : "h-1"
                        }`}
                      />
                    </span>
                    <span className="hidden sm:inline font-mono text-[11px]">
                      {RADIO_CHANNELS[activeChannel].frequency}
                    </span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline text-[11px]">
                      {localize({ en: "Radio Muted", ar: "الإذاعة مكتومة" }, language)}
                    </span>
                  </>
                )}
              </button>

              {/* Radio Channel Dropdown Toggle */}
              {!isMuted && (
                <button
                  type="button"
                  onClick={() => setShowChannelMenu((p) => !p)}
                  className="absolute -top-1.5 -end-1.5 grid h-4 w-4 place-items-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold shadow hover:scale-110 transition cursor-pointer"
                  title={localize({ en: "Select radio channel", ar: "تغيير القناة اللاسلكية" }, language)}
                  aria-label={localize({ en: "Select radio channel", ar: "تغيير القناة اللاسلكية" }, language)}
                >
                  ▾
                </button>
              )}

              {/* Channel Select Popover */}
              {showChannelMenu && !isMuted && (
                <div className="absolute bottom-12 end-0 z-50 w-52 rounded-xl border border-border bg-popover p-1.5 shadow-xl backdrop-blur-lg animate-in fade-in zoom-in-95">
                  <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {localize({ en: "Radio Frequency", ar: "التردد اللاسلكي" }, language)}
                  </div>
                  {(["tower", "atis", "operations"] as RadioChannel[]).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => {
                        setChannel(ch);
                        setShowChannelMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        activeChannel === ch
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary/60 text-foreground"
                      }`}
                    >
                      <span>{localize(RADIO_CHANNELS[ch].name, language)}</span>
                      <span className="font-mono text-[10px] opacity-80">
                        {RADIO_CHANNELS[ch].frequency}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Separator */}
            <span className="h-6 w-px bg-border/80 mx-0.5" />

            {/* Pause / Resume */}
            <button
              type="button"
              onClick={() => setIsKioskPaused((prev) => !prev)}
              className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-xl border border-border bg-secondary/30 text-foreground hover:bg-secondary/60 active:scale-95 transition cursor-pointer"
              aria-label={
                isKioskPaused
                  ? localize({ en: "Resume auto-cycle", ar: "استئناف الدوران" }, language)
                  : localize({ en: "Pause auto-cycle", ar: "إيقاف مؤقت للدوران" }, language)
              }
              title={
                isKioskPaused
                  ? localize({ en: "Resume auto-cycle", ar: "استئناف الدوران" }, language)
                  : localize({ en: "Pause auto-cycle", ar: "إيقاف مؤقت للدوران" }, language)
              }
            >
              {isKioskPaused ? <Play className="h-4 w-4 text-primary" /> : <Pause className="h-4 w-4" />}
            </button>

            {/* Skip to Next Tab */}
            <button
              type="button"
              onClick={skipKioskNext}
              className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-xl border border-border bg-secondary/30 text-foreground hover:bg-secondary/60 active:scale-95 transition cursor-pointer"
              aria-label={localize({ en: "Next view", ar: "العرض التالي" }, language)}
              title={localize({ en: "Next view", ar: "العرض التالي" }, language)}
            >
              <SkipForward className="h-4 w-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-xl border border-border bg-secondary/30 text-foreground hover:bg-secondary/60 active:scale-95 transition cursor-pointer hidden sm:grid"
              aria-label={
                isFullscreen
                  ? localize({ en: "Exit fullscreen", ar: "الخروج من ملء الشاشة" }, language)
                  : localize({ en: "Enter fullscreen", ar: "ملء الشاشة" }, language)
              }
              title={
                isFullscreen
                  ? localize({ en: "Exit fullscreen", ar: "الخروج من ملء الشاشة" }, language)
                  : localize({ en: "Enter fullscreen", ar: "ملء الشاشة" }, language)
              }
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>

            {/* Exit Kiosk Button */}
            <button
              type="button"
              onClick={() => setIsKioskActive(false)}
              className="grid h-11 w-11 min-h-[44px] min-w-[44px] place-items-center rounded-xl border border-border bg-status-crit/15 text-status-crit hover:bg-status-crit/25 active:scale-95 transition cursor-pointer"
              aria-label={localize({ en: "Exit video wall mode", ar: "إنهاء وضع الشاشة" }, language)}
              title={localize({ en: "Exit video wall mode", ar: "إنهاء وضع الشاشة" }, language)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Accessible Operational Info Modal explaining Purpose */}
      {showInfoModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="kiosk-info-title"
          className="fixed inset-0 z-[60] grid place-items-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowInfoModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl flex flex-col gap-4 text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2 text-primary font-bold text-lg">
                <Tv className="h-5 w-5" />
                <h3 id="kiosk-info-title">
                  {localize(
                    {
                      en: "Purpose of the AOCC Video Wall Carousel",
                      ar: "الهدف التشغيلي لدورة شاشات مركز العمليات AOCC",
                    },
                    language
                  )}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="grid h-8 w-8 place-items-center rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label={localize({ en: "Close explanation", ar: "إغلاق الشرح" }, language)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p>
                {localize(
                  {
                    en: "In airport command rooms like Cairo International Airport's AOCC, duty managers monitor operations on massive overhead video walls without using mice or keyboards.",
                    ar: "في غرف قيادة المطارات الكبرى مثل مركز عمليات مطار القاهرة (AOCC)، يراقب مديرو النوبات العمليات التشغيلية عبر شاشات جدارية ضخمة معلقة دون استخدام الفأرة أو لوحة المفاتيح.",
                  },
                  language
                )}
              </p>
              <p>
                {localize(
                  {
                    en: "This carousel automatically cycles between the Digital Twin, Airfield Operations Grid, and Safety Scorecard every 25 seconds to provide 360-degree situational awareness across the entire airport.",
                    ar: "يقوم هذا المشغل بتدوير العرض تلقائياً كل ٢٥ ثانية بين التوأم الرقمي، وشبكة العمليات الجوية، وبطاقة مؤشرات السلامة لتوفير رؤية بانورامية شاملة لأرض المطار والصالات.",
                  },
                  language
                )}
              </p>
              <div className="rounded-xl border border-primary/20 bg-primary/10 p-3 flex flex-col gap-1.5 text-xs text-foreground">
                <span className="font-bold text-primary flex items-center gap-1.5">
                  <Volume2 className="h-4 w-4" />
                  {localize(
                    {
                      en: "Airfield Radio Voice Audio Feed",
                      ar: "البث الصوتي لإذاعة برج المراقبة",
                    },
                    language
                  )}
                </span>
                <p className="text-muted-foreground">
                  {localize(
                    {
                      en: "Click the radio speaker button on the bar to hear authentic Cairo Tower (118.10 MHz) and ATIS (126.80 MHz) air traffic clearances synthesized with realistic VHF radio filters and mic squelch bursts.",
                      ar: "اضغط على زر مكبر الصوت بالشريط للاستماع إلى نداءات برج مراقبة القاهرة (118.10 ميجاهرتز) ومعلومات ATIS المصممة بمؤثرات الراديو اللاسلكي ونقر الميكروفون الواقعي.",
                    },
                    language
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="mt-2 h-11 w-full rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition cursor-pointer"
            >
              {localize({ en: "Understood, Close", ar: "فهمت، إغلاق" }, language)}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
