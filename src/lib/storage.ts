import { AppSettings, Session, StreakData } from "../types";

const STORAGE_KEYS = {
  SESSIONS: "fretmaster_sessions_v1",
  STREAK: "fretmaster_streak_v1",
  SETTINGS: "fretmaster_settings_v1",
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

// Initial dummy sessions if user is new, so analytics charts look rich like the screenshot!
const SEED_SESSIONS: Session[] = [
  {
    id: "seed-1",
    date: "2026-08-30",
    startTime: Date.now() - 86400000,
    endTime: Date.now() - 86400000 + 45 * 60 * 1000,
    durationSeconds: 45 * 60,
    bpmsUsed: [120, 140, 160],
    highestBpm: 160,
    scalesPracticed: ["C Harmonic Minor", "A Minor Pentatonic"],
    exercisesOpened: ["spider_1234"],
    focus: "C Harmonic Minor / Alternate Picking",
    completed: true,
  },
  {
    id: "seed-2",
    date: "2026-08-29",
    startTime: Date.now() - 2 * 86400000,
    endTime: Date.now() - 2 * 86400000 + 60 * 60 * 1000,
    durationSeconds: 60 * 60,
    bpmsUsed: [140],
    highestBpm: 140,
    scalesPracticed: ["Dorian Mode"],
    exercisesOpened: ["spider_permutation_1324"],
    focus: "Drop D Riffing / Syncopation",
    completed: true,
  },
  {
    id: "seed-3",
    date: "2026-08-28",
    startTime: Date.now() - 3 * 86400000,
    endTime: Date.now() - 3 * 86400000 + 30 * 60 * 1000,
    durationSeconds: 30 * 60,
    bpmsUsed: [180, 200],
    highestBpm: 200,
    scalesPracticed: ["Major (Ionian)"],
    exercisesOpened: ["string_skipping_pentatonic"],
    focus: "Sweep Picking Arpeggios",
    completed: true,
  },
  {
    id: "seed-4",
    date: "2026-08-27",
    startTime: Date.now() - 4 * 86400000,
    endTime: Date.now() - 4 * 86400000 + 45 * 60 * 1000,
    durationSeconds: 45 * 60,
    bpmsUsed: [100],
    highestBpm: 100,
    scalesPracticed: ["Minor Pentatonic"],
    exercisesOpened: ["scale_sequences_in_3rds"],
    focus: "Pentatonic Modes",
    completed: true,
  },
  {
    id: "seed-5",
    date: "2026-08-26",
    startTime: Date.now() - 5 * 86400000,
    endTime: Date.now() - 5 * 86400000 + 50 * 60 * 1000,
    durationSeconds: 50 * 60,
    bpmsUsed: [120, 150],
    highestBpm: 150,
    scalesPracticed: ["Dorian Mode", "Blues Scale"],
    exercisesOpened: ["hammer_pull_legato"],
    focus: "A Dorian Legato Runs",
    completed: true,
  },
];

export function getSavedSessions(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) {
      localStorage.setItem(
        STORAGE_KEYS.SESSIONS,
        JSON.stringify(SEED_SESSIONS),
      );
      return SEED_SESSIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : SEED_SESSIONS;
  } catch (e) {
    console.error("Failed to get sessions", e);
    return SEED_SESSIONS;
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
export function getSavedStreak(): StreakData {
  const today = getTodayDateString();
  const defaultStreak: StreakData = {
    currentStreak: 12,
    longestStreak: 45,
    lastVisitDate: today,
    graceDaysUsed: 0,
    history: [],
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STREAK);
    if (!raw) {
      // Generate last 7 days history seed
      const hist = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ds = d.toISOString().split("T")[0];
        hist.push({
          date: ds,
          practiced: i !== 1,
          durationMin: i !== 1 ? 40 + i * 5 : 0,
        });
      }
      defaultStreak.history = hist;
      localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(defaultStreak));
      return defaultStreak;
    }

    const data: StreakData = JSON.parse(raw);
    return calculateUpdatedStreak(data, today);
  } catch (e) {
    console.error("Failed to get streak", e);
    return defaultStreak;
  }
}

function calculateUpdatedStreak(data: StreakData, today: string): StreakData {
  if (data.lastVisitDate === today) {
    return data;
  }

  const lastDate = new Date(data.lastVisitDate);
  const nowDate = new Date(today);
  const diffTime = Math.abs(nowDate.getTime() - lastDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let currentStreak = data.currentStreak;
  let graceDaysUsed = data.graceDaysUsed;

  if (diffDays === 1) {
    // Visited consecutive day
    currentStreak += 1;
    graceDaysUsed = 0;
  } else if (diffDays === 2) {
    // Missed 1 day -> Grace period active!
    graceDaysUsed = 1;
    // Streak is preserved / paused
  } else if (diffDays === 3) {
    // Missed 2 days -> Grace period 2 active
    graceDaysUsed = 2;
  } else if (diffDays > 3) {
    // Missed 3 or more days -> Streak broken, restart at 1 today
    currentStreak = 1;
    graceDaysUsed = 0;
  }

  const longestStreak = Math.max(currentStreak, data.longestStreak || 0);

  const updated: StreakData = {
    ...data,
    currentStreak,
    longestStreak,
    lastVisitDate: today,
    graceDaysUsed,
  };

  try {
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to update streak in storage", e);
  }

  return updated;
}

export function recordPracticeDay(dateStr: string, durationMin: number): void {
  try {
    const streak = getSavedStreak();
    const existingHist = streak.history || [];
    const index = existingHist.findIndex((h) => h.date === dateStr);

    if (index >= 0) {
      existingHist[index].practiced = true;
      existingHist[index].durationMin =
        (existingHist[index].durationMin || 0) + durationMin;
    } else {
      existingHist.push({ date: dateStr, practiced: true, durationMin });
    }

    streak.history = existingHist.slice(-90); // keep 90 days
    localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
  } catch (e) {
    console.error("Failed to record practice day", e);
  }
}
