/**
 * Cairo International Airport (AOCC) Cross-Window Telemetry Synchronization
 * Uses the Web BroadcastChannel API to synchronize simulation states, shift waves,
 * and terminal filters across multi-monitor video wall displays with zero latency.
 */

export type AoccBroadcastMessage =
  | { type: "SCENARIO_CHANGE"; scenarioId: string }
  | { type: "WAVE_CHANGE"; waveId: string }
  | { type: "TERMINAL_CHANGE"; terminal: string }
  | { type: "DISPATCH_UNIT"; unitId: string };

class AoccBroadcastService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(msg: AoccBroadcastMessage) => void> = new Set();

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        this.channel = new BroadcastChannel("cia-aocc-telemetry");
        this.channel.onmessage = (event: MessageEvent<AoccBroadcastMessage>) => {
          if (event?.data && typeof event.data.type === "string") {
            this.listeners.forEach((listener) => listener(event.data));
          }
        };
      } catch {
        this.channel = null;
      }
    }
  }

  public broadcast(message: AoccBroadcastMessage): void {
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch {
        // Channel closed or failed silently
      }
    }
  }

  public subscribe(listener: (msg: AoccBroadcastMessage) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public close(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
  }
}

export const aoccBroadcast = new AoccBroadcastService();
