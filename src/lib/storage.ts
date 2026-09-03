import { AppSettings, Session, StreakData } from "../types";

const STORAGE_KEYS = {
  SESSIONS: "Mousi9ti_sessions_v1",
  STREAK: "Mousi9ti_streak_v1",
  SETTINGS: "Mousi9ti_settings_v1",
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  accentColor: "#3b82f6", // Electric Blue
  defaultTuning: "E Standard",
  fretCount: 15,
  soundVolume: 1,
  metronomeSound: "click",
  fretboardWood: "ebony",
  autoSaveSession: true,
};

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getSavedSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error("Failed to load settings from storage", e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings", e);
  }
}

export function getSavedSessions(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to get sessions", e);
    return [];
  }
}

export function saveSession(session: Session): void {
  try {
    const existing = getSavedSessions();
    const index = existing.findIndex((s) => s.id === session.id);
    let updated: Session[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = session;
    } else {
      updated = [session, ...existing];
    }
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
    recordPracticeDay(session.date, Math.round(session.durationSeconds / 60));
  } catch (e) {
    console.error("Failed to save session", e);
  }
}

// Streak System Logic (chess.com-style with 2-day grace period)
//
// How it works:
// - `recordPracticeDay` is the ONLY function that increments the streak.
//   It is called when a session is logged. If the user hasn't practiced
//   today yet, the streak goes up by 1.
// - `getSavedStreak` is called on app load / refresh. It checks if the
//   streak has decayed (missed too many days since last practice) and
//   resets it if needed, but NEVER increments.

export function getSavedStreak(): StreakData {
  const today = getTodayDateString();
  const defaultStreak: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    lastVisitDate: today,
    graceDaysUsed: 0,
    history: [],
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(defaultStreak));
      return defaultStreak;
    }

    const data: StreakData = JSON.parse(raw);
    return applyStreakDecay(data, today);
  } catch (e) {
    console.error("Failed to get streak", e);
    return defaultStreak;
  }
}

/**
 * Called on app open / refresh. Checks how many days since last practice
 * and applies grace period or resets the streak. Never increments.
 */
function applyStreakDecay(data: StreakData, today: string): StreakData {
  // Find the last day the user actually practiced
  const history = data.history || [];
  const lastPracticed = history
    .slice()
    .reverse()
    .find((h) => h.practiced);

  if (!lastPracticed) {
    // No practice history at all — streak should be 0
    const updated = {
      ...data,
      currentStreak: 0,
      graceDaysUsed: 0,
      lastVisitDate: today,
    };
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(updated));
    return updated;
  }

  const lastDate = new Date(lastPracticed.date);
  const nowDate = new Date(today);
  const diffDays = Math.floor(
    (nowDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  let currentStreak = data.currentStreak;
  let graceDaysUsed = data.graceDaysUsed;

  if (diffDays <= 1) {
    // Practiced today or yesterday — streak is fine
    graceDaysUsed = 0;
  } else if (diffDays === 2) {
    // Missed 1 day — grace period
    graceDaysUsed = 1;
  } else if (diffDays === 3) {
    // Missed 2 days — grace period 2
    graceDaysUsed = 2;
  } else {
    // Missed 3+ days — streak broken
    currentStreak = 0;
    graceDaysUsed = 0;
  }

  const updated: StreakData = {
    ...data,
    currentStreak,
    longestStreak: Math.max(currentStreak, data.longestStreak || 0),
    lastVisitDate: today,
    graceDaysUsed,
  };

  localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(updated));
  return updated;
}

/**
 * Called when a session is saved. This is the ONLY place the streak increments.
 * Reads raw localStorage to avoid the decay recalculation race condition.
 */
export function recordPracticeDay(dateStr: string, durationMin: number): void {
  try {
    // Read raw streak data — do NOT go through getSavedStreak() to avoid
    // the decay logic resetting the streak before we can increment it.
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK);
    const streak: StreakData = raw
      ? JSON.parse(raw)
      : {
          currentStreak: 0,
          longestStreak: 0,
          lastVisitDate: dateStr,
          graceDaysUsed: 0,
          history: [],
        };

    const history = streak.history || [];
    const index = history.findIndex((h) => h.date === dateStr);

    let alreadyPracticedToday = false;

    if (index >= 0) {
      alreadyPracticedToday = history[index].practiced;
      history[index].practiced = true;
      history[index].durationMin =
        (history[index].durationMin || 0) + durationMin;
    } else {
      history.push({ date: dateStr, practiced: true, durationMin });
    }

    // Sort chronologically
    history.sort((a, b) => a.date.localeCompare(b.date));

    // Only increment streak if this is the first session of the day
    if (!alreadyPracticedToday) {
      streak.currentStreak = (streak.currentStreak || 0) + 1;
      streak.longestStreak = Math.max(
        streak.longestStreak || 0,
        streak.currentStreak,
      );
      streak.graceDaysUsed = 0;
    }

    streak.history = history.slice(-90); // keep 90 days
    streak.lastVisitDate = dateStr;
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
  } catch (e) {
    console.error("Failed to record practice day", e);
  }
}
