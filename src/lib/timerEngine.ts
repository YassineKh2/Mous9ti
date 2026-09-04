type TimerStatus = "idle" | "running" | "paused" | "finished";

interface TimerPersistedState {
  status: TimerStatus;
  duration: number;
  remaining: number;
  deadline: number;
}

export class TimerEngine {
  private status: TimerStatus = "idle";
  private duration: number = 0;
  private remaining: number = 0;
  private deadline: number = 0;

  private tickInterval: number | null = null;
  private listeners: Set<() => void> = new Set();
  private onCompleteCallback: (() => void) | null = null;

  private static STORAGE_KEY = "Mousi9ti_timer_v1";

  constructor() {
    this.loadState();
  }

  public setOnComplete(cb: () => void) {
    this.onCompleteCallback = cb;
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.saveState();
    this.listeners.forEach((listener) => listener());
  }

  public getStatus() {
    return this.status;
  }
  public getDuration() {
    return this.duration;
  }
  public getRemaining() {
    return this.remaining;
  }

  public start(durationSeconds: number) {
    this.duration = durationSeconds;
    this.remaining = durationSeconds;
    this.deadline = Date.now() + durationSeconds * 1000;
    this.status = "running";
    this.startTick();
    this.notify();
  }

  public pause() {
    if (this.status !== "running") return;
    this.status = "paused";
    this.remaining = Math.max(
      0,
      Math.ceil((this.deadline - Date.now()) / 1000),
    );
    this.stopTick();
    this.notify();
  }

  public resume() {
    if (this.status !== "paused") return;
    this.status = "running";
    this.deadline = Date.now() + this.remaining * 1000;
    this.startTick();
    this.notify();
  }

  public reset() {
    this.stopTick();
    this.status = "idle";
    this.remaining = this.duration; // Reset to the last selected duration, but idle
    this.notify();
  }

  public cancel() {
    this.stopTick();
    this.status = "idle";
    this.remaining = 0;
    this.duration = 0;
    this.notify();
  }

  private startTick() {
    this.stopTick();
    // Use setInterval for UI updates, but calculation is deadline-based
    this.tickInterval = setInterval(() => {
      if (this.status !== "running" && this.status !== "finished") {
        this.stopTick();
        return;
      }
      const now = Date.now();
      if (this.status === "running" && now >= this.deadline) {
        this.status = "finished";
        if (this.onCompleteCallback) this.onCompleteCallback();
      }
      this.remaining = Math.ceil((this.deadline - now) / 1000);
      this.notify();
    }, 200) as unknown as number;
  }

  private stopTick() {
    if (this.tickInterval !== null) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  private loadState() {
    try {
      const saved = localStorage.getItem(TimerEngine.STORAGE_KEY);
      if (saved) {
        const state: TimerPersistedState = JSON.parse(saved);
        this.status = state.status;
        this.duration = state.duration;
        this.remaining = state.remaining;
        this.deadline = state.deadline;

        if (this.status === "running" || this.status === "finished") {
          // Check if we missed the deadline while backgrounded/closed
          if (Date.now() >= this.deadline) {
            this.status = "finished";
            // Note: we don't call onComplete here immediately because app might be booting
            // The UI will show finished state.
          }
          this.remaining = Math.ceil((this.deadline - Date.now()) / 1000);
          this.startTick();
        }
      }
    } catch (e) {
      console.error("Failed to load timer state", e);
    }
  }

  private saveState() {
    try {
      const state: TimerPersistedState = {
        status: this.status,
        duration: this.duration,
        remaining: this.remaining,
        deadline: this.deadline,
      };
      localStorage.setItem(TimerEngine.STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save timer state", e);
    }
  }
}

export const timerEngine = new TimerEngine();
