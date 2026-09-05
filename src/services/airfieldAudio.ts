// Airfield Audio Service: Web Audio API VHF DSP + SpeechSynthesis for Cairo Tower (HECA)
// Zero external bandwidth dependency, zero CORS issues, 100% accessible with live transcripts.

export type RadioChannel = "tower" | "atis" | "operations";

export interface RadioTransmission {
  id: string;
  channel: RadioChannel;
  channelName: { en: string; ar: string };
  frequency: string;
  speaker: string;
  callsign: string;
  text: { en: string; ar: string };
  timestamp: string;
}

export const RADIO_CHANNELS: Record<RadioChannel, { name: { en: string; ar: string }; frequency: string }> = {
  tower: {
    name: { en: "Cairo Tower", ar: "برج مراقبة القاهرة" },
    frequency: "118.10 MHz",
  },
  atis: {
    name: { en: "Cairo ATIS Broadcast", ar: "بث معلومات المطار ATIS" },
    frequency: "126.80 MHz",
  },
  operations: {
    name: { en: "AOCC Airfield Dispatch", ar: "عمليات ساحة المطار AOCC" },
    frequency: "121.90 MHz",
  },
};

export const SAMPLE_TRANSMISSIONS: Record<RadioChannel, RadioTransmission[]> = {
  tower: [
    {
      id: "twr-1",
      channel: "tower",
      channelName: RADIO_CHANNELS.tower.name,
      frequency: "118.10 MHz",
      speaker: "Cairo Tower Controller",
      callsign: "MSR 800",
      text: {
        en: "EgyptAir 800, wind 040 at 12 knots, runway 05 Left, cleared for takeoff.",
        ar: "مصر للطيران 800، الرياح 040 بسرعة 12 عقدة، مدرج 05 يسار، مصرح بالإقلاع.",
      },
      timestamp: "06:14Z",
    },
    {
      id: "twr-2",
      channel: "tower",
      channelName: RADIO_CHANNELS.tower.name,
      frequency: "118.10 MHz",
      speaker: "Cairo Tower Controller",
      callsign: "UAE 927",
      text: {
        en: "Emirates 927, runway 05 Center, cleared to land, wind 050 at 11 knots.",
        ar: "طيران الإمارات 927، مدرج 05 أوسط، مصرح بالهبوط، الرياح 050 بسرعة 11 عقدة.",
      },
      timestamp: "06:16Z",
    },
    {
      id: "twr-3",
      channel: "tower",
      channelName: RADIO_CHANNELS.tower.name,
      frequency: "118.10 MHz",
      speaker: "Cairo Tower Controller",
      callsign: "NIA 102",
      text: {
        en: "Nile Air 102, line up and wait runway 05 Left, traffic 4-mile final.",
        ar: "النيل للطيران 102، اصطف وانتظر على مدرج 05 يسار، طائرة قادمة على بعد 4 أميال.",
      },
      timestamp: "06:19Z",
    },
    {
      id: "twr-4",
      channel: "tower",
      channelName: RADIO_CHANNELS.tower.name,
      frequency: "118.10 MHz",
      speaker: "Cairo Tower Controller",
      callsign: "SVA 310",
      text: {
        en: "Saudia 310, vacate via taxiway Echo, cross runway 05 Center, contact Ground 121.90.",
        ar: "الخطوط السعودية 310، غادر عبر الممر إيكو، واعبر مدرج 05 أوسط، وتواصل مع الأرض 121.90.",
      },
      timestamp: "06:21Z",
    },
  ],
  atis: [
    {
      id: "atis-1",
      channel: "atis",
      channelName: RADIO_CHANNELS.atis.name,
      frequency: "126.80 MHz",
      speaker: "Cairo ATIS Automated Voice",
      callsign: "HECA ATIS",
      text: {
        en: "Cairo International Information Hotel, 0600 Zulu. Arrival runways 05 Left and 05 Center in use. Departure runway 05 Center. Transition level 70. Wind 040 degrees 12 knots. Visibility 10 kilometers. Few clouds 3000 feet. Temperature 28, dewpoint 16. QNH 1016 hectopascals. Confirm information Hotel on initial contact.",
        ar: "معلومات مطار القاهرة الدولي هوتيل، الساعة 0600 زولو. مدرجات الهبوط 05 يسار و 05 أوسط قيد الاستخدام. مدرج الإقلاع 05 أوسط. الرياح 040 درجة 12 عقدة. الرؤية 10 كيلومتر. درجات الحرارة 28، نقطة الندى 16. الضغط الجوي 1016 هيكتوباسكال.",
      },
      timestamp: "06:00Z",
    },
    {
      id: "atis-2",
      channel: "atis",
      channelName: RADIO_CHANNELS.atis.name,
      frequency: "126.80 MHz",
      speaker: "Cairo ATIS Automated Voice",
      callsign: "HECA ATIS",
      text: {
        en: "Cairo International Information India, 0630 Zulu. Runway friction assessments nominal across 05 Left and 05 Center. All taxiway guidance lighting operational. Wind 050 at 14 knots. QNH 1016.",
        ar: "معلومات مطار القاهرة الدولي إنديا، الساعة 0630 زولو. قياسات احتكاك المدرجات طبيعية لمدرجي 05 يسار و 05 أوسط. جميع أنظمة إضاءة الممرات تعمل. الرياح 050 بسرعة 14 عقدة.",
      },
      timestamp: "06:30Z",
    },
  ],
  operations: [
    {
      id: "ops-1",
      channel: "operations",
      channelName: RADIO_CHANNELS.operations.name,
      frequency: "121.90 MHz",
      speaker: "AOCC Airfield Marshall",
      callsign: "MARSHAL 4",
      text: {
        en: "Operations Control, Follow-Me vehicle 4 reports runway 05 Left inspection complete, zero FOD detected.",
        ar: "مركز العمليات، مركبة الإرشاد 4 تؤكد اكتمال فحص مدرج 05 يسار، وخلوه التام من أي أجسام غريبة.",
      },
      timestamp: "06:11Z",
    },
    {
      id: "ops-2",
      channel: "operations",
      channelName: RADIO_CHANNELS.operations.name,
      frequency: "121.90 MHz",
      speaker: "Terminal 3 Ramp Control",
      callsign: "RAMP T3",
      text: {
        en: "AOCC Command, stand G4 pushback completed for EgyptAir 738, gate clear for incoming Saudia flight.",
        ar: "قيادة AOCC، اكتمل سحب طائرة مصر للطيران 738 من الموقف G4، البوابة جاهزة لاستقبال رحلة الخطوط السعودية.",
      },
      timestamp: "06:17Z",
    },
    {
      id: "ops-3",
      channel: "operations",
      channelName: RADIO_CHANNELS.operations.name,
      frequency: "121.90 MHz",
      speaker: "AOCC Command Wall Voice",
      callsign: "AOCC CAROUSEL",
      text: {
        en: "AOCC Command Wall auto-cycle active. Rotating displays between Digital Twin, Airfield Operations, and Safety Scorecard.",
        ar: "تم تفعيل دورة شاشات مركز العمليات AOCC. جاري التنقل بين التوأم الرقمي، وعمليات الساحة، وبطاقة مؤشرات السلامة.",
      },
      timestamp: "06:22Z",
    },
  ],
};

class AirfieldAudioService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = true;
  private volume: number = 0.65;
  private activeChannel: RadioChannel = "tower";
  private isTransmitting: boolean = false;
  private currentTransmission: RadioTransmission | null = null;
  private transmissionTimer: number | null = null;
  private transmissionIndex: Record<RadioChannel, number> = {
    tower: 0,
    atis: 0,
    operations: 0,
  };
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.isMuted = true;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public getState() {
    return {
      isMuted: this.isMuted,
      volume: this.volume,
      activeChannel: this.activeChannel,
      isTransmitting: this.isTransmitting,
      currentTransmission: this.currentTransmission,
    };
  }

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  private playSquelchSound(type: "open" | "close"): void {
    if (this.isMuted || this.volume === 0) return;
    try {
      const ctx = this.getAudioContext();
      const duration = type === "open" ? 0.08 : 0.12;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 2200;
      filter.Q.value = 3.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(this.volume * 0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start();
    } catch {
      // AudioContext unavailable in non-interactive state
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (!muted) {
      this.getAudioContext();
      this.startTransmissions();
      this.triggerNextTransmission();
    } else {
      this.stopTransmissions();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      this.isTransmitting = false;
    }
    this.notify();
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    this.notify();
  }

  public setChannel(channel: RadioChannel): void {
    this.activeChannel = channel;
    this.notify();
    if (!this.isMuted) {
      this.triggerNextTransmission();
    }
  }

  public startTransmissions(): void {
    if (this.transmissionTimer !== null) return;
    this.transmissionTimer = window.setInterval(() => {
      if (!this.isMuted && !this.isTransmitting) {
        this.triggerNextTransmission();
      }
    }, 24000);
  }

  public stopTransmissions(): void {
    if (this.transmissionTimer !== null) {
      clearInterval(this.transmissionTimer);
      this.transmissionTimer = null;
    }
  }

  public triggerNextTransmission(language: "en" | "ar" = "en"): void {
    if (this.isTransmitting) return;

    const channelTransmissions = SAMPLE_TRANSMISSIONS[this.activeChannel];
    const currentIndex = this.transmissionIndex[this.activeChannel];
    const item = channelTransmissions[currentIndex % channelTransmissions.length];
    this.transmissionIndex[this.activeChannel] = currentIndex + 1;

    this.currentTransmission = item;
    this.isTransmitting = true;
    this.notify();

    this.playSquelchSound("open");

    if (typeof window !== "undefined" && "speechSynthesis" in window && !this.isMuted && this.volume > 0) {
      const textToSpeak = item.text[language] || item.text.en;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.volume = this.volume;
      utterance.rate = 1.05;
      utterance.pitch = 0.95;

      utterance.onend = () => {
        this.playSquelchSound("close");
        this.isTransmitting = false;
        this.notify();
      };

      utterance.onerror = () => {
        this.playSquelchSound("close");
        this.isTransmitting = false;
        this.notify();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        this.playSquelchSound("close");
        this.isTransmitting = false;
        this.notify();
      }, 4000);
    }
  }
}

export const airfieldAudio = new AirfieldAudioService();
