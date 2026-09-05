/**
 * Safe Storage Service
 * Resilient localStorage wrapper with in-memory fallback.
 * Prevents DOMException crashes in Incognito/Private mode, sandboxed iframes, or quota exhaustion.
 */
class SafeStorageService {
  private memoryFallback: Map<string, string> = new Map();
  private isStorageAvailable: boolean | null = null;

  private checkAvailability(): boolean {
    if (this.isStorageAvailable !== null) {
      return this.isStorageAvailable;
    }
    if (typeof window === "undefined") {
      this.isStorageAvailable = false;
      return false;
    }
    try {
      const testKey = "__cai_storage_test__";
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      this.isStorageAvailable = true;
      return true;
    } catch {
      this.isStorageAvailable = false;
      return false;
    }
  }

  public getItem(key: string): string | null {
    if (this.checkAvailability()) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return this.memoryFallback.get(key) ?? null;
      }
    }
    return this.memoryFallback.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    if (this.checkAvailability()) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        // Quota exceeded or permission denied, fall back to memory
        this.memoryFallback.set(key, value);
        return;
      }
    }
    this.memoryFallback.set(key, value);
  }

  public removeItem(key: string): void {
    if (this.checkAvailability()) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Fall back to memory
      }
    }
    this.memoryFallback.delete(key);
  }
}

export const safeStorage = new SafeStorageService();
