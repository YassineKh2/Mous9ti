import React, { useState, useEffect, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import { AppSettings, Exercise, NoteName, Session, StreakData } from "./types";
import {
  getSavedSettings,
  getSavedSessions,
  getSavedStreak,
  getTodayDateString,
  saveSession,
  saveSettings,
} from "./lib/storage";
import { audioEngine } from "./lib/audio";
import { Navigation, ActiveTab } from "./components/Navigation";
import { SettingsModal } from "./components/SettingsModal";
import { DashboardPage } from "./pages/DashboardPage";
import { ScalesPage } from "./pages/ScalesPage";
import { ChordsPage } from "./pages/ChordsPage";
import { ExercisesPage } from "./pages/ExercisesPage";
import { ToolsPage } from "./pages/ToolsPage";
import { StatsPage } from "./pages/StatsPage";
import { ALL_ROOT_NOTES, SCALES_DATABASE } from "./data/musicTheory";
import { CHORD_TYPES_CATALOG } from "./data/chordsData";
import { EXERCISES_DATABASE } from "./data/exercisesData";
import { GlobalSearchResult } from "./components/Navigation";

export function App() {
  type PendingScaleTarget = { scaleId: string; root: NoteName };
  type PendingChordTarget = { chordType: string; root: NoteName };

  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pendingScaleSearch, setPendingScaleSearch] =
    useState<PendingScaleTarget | null>(null);
  const [pendingChordSearch, setPendingChordSearch] =
    useState<PendingChordTarget | null>(null);
  const [pendingExerciseSearch, setPendingExerciseSearch] = useState<
    string | null
  >(null);

  // Settings & Theme
  const [settings, setSettings] = useState<AppSettings>(() =>
    getSavedSettings(),
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Practice & Sessions State
  const [sessions, setSessions] = useState<Session[]>(() => getSavedSessions());
  const [streak, setStreak] = useState<StreakData>(() => getSavedStreak());
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [activeSessionDuration, setActiveSessionDuration] = useState<number>(0);
  const [currentSessionBpms, setCurrentSessionBpms] = useState<number[]>([]);

  // Metronome State
  const [metronomeBpm, setMetronomeBpm] = useState<number>(120);
  const [metronomeIsPlaying, setMetronomeIsPlaying] = useState<boolean>(false);
  const [metronomeBarCycleMode, setMetronomeBarCycleMode] =
    useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = audioEngine.onMetronomeStateChange((playing) => {
      setMetronomeIsPlaying(playing);
    });

    setMetronomeIsPlaying(audioEngine.isRunning());
    return () => unsubscribe();
  }, []);

  // Sync Master Volume & Theme to engine and HTML element
  useEffect(() => {
    audioEngine.setVolume(settings.soundVolume);
    if (settings.theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [settings]);

  // Live session timer interval
  useEffect(() => {
    let interval: number | null = null;
    if (isSessionActive) {
      interval = window.setInterval(() => {
        setActiveSessionDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive]);

  // Toggle active practice session
  const handleToggleSession = () => {
    setIsSessionActive((prev) => !prev);
  };

  // End and Log Practice Session
  const handleEndSession = useCallback(() => {
    if (activeSessionDuration < 10) {
      setIsSessionActive(false);
      setActiveSessionDuration(0);
      return;
    }

    const today = getTodayDateString();
    const highestBpm =
      currentSessionBpms.length > 0
        ? Math.max(...currentSessionBpms)
        : metronomeBpm;

    const newSession: Session = {
      id: `session-${Date.now()}`,
      date: today,
      startTime: Date.now() - activeSessionDuration * 1000,
      endTime: Date.now(),
      durationSeconds: activeSessionDuration,
      bpmsUsed:
        currentSessionBpms.length > 0 ? currentSessionBpms : [metronomeBpm],
      highestBpm,
      scalesPracticed: ["Fretboard Theory & Metronome"],
      exercisesOpened: [],
      focus: "Fretboard Theory & Metronome Technique",
      completed: true,
    };

    saveSession(newSession);
    setSessions(getSavedSessions());
    setStreak(getSavedStreak());

    // Celebrate streak completion with confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    setIsSessionActive(false);
    setActiveSessionDuration(0);
    setCurrentSessionBpms([]);
  }, [activeSessionDuration, currentSessionBpms, metronomeBpm]);

  // Log BPM to session tracker
  const handleLogBpm = (bpm: number) => {
    setCurrentSessionBpms((prev) =>
      prev.includes(bpm) ? prev : [...prev, bpm],
    );
  };

  // Switch to exercise practice directly with suggested tempo
  const handleStartExercisePractice = (exercise: Exercise) => {
    setMetronomeBpm(exercise.suggestedBpm);
    setActiveTab("dashboard");
    if (!isSessionActive) {
      setIsSessionActive(true);
    }
  };

  // Update Settings
  const handleUpdateSettings = (newPartial: Partial<AppSettings>) => {
    const updated = { ...settings, ...newPartial };
    setSettings(updated);
    saveSettings(updated);
  };

  // Export JSON data
  const handleExportData = () => {
    const data = {
      sessions,
      streak,
      settings,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Mousi9ti-practice-export-${getTodayDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear data
  const handleClearData = () => {
    localStorage.clear();
    setSessions([]);
    setStreak({
      currentStreak: 1,
      longestStreak: 1,
      lastVisitDate: getTodayDateString(),
      graceDaysUsed: 0,
      history: [],
    });
    setIsSettingsOpen(false);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement).tagName,
        )
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        // Toggle metronome directly
        if (audioEngine.isRunning()) {
          audioEngine.stopMetronome();
        } else {
          const engineState = audioEngine.getMetronomeState();
          audioEngine.startMetronome(
            metronomeBpm,
            engineState.timeSignature,
            engineState.subdivision,
            engineState.soundType,
          );
        }
      } else if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        window.dispatchEvent(new Event("random-drill-next-note"));
      } else if (e.key === "1") {
        setActiveTab("dashboard");
      } else if (e.key === "2") {
        setActiveTab("scales");
      } else if (e.key === "3") {
        setActiveTab("chords");
      } else if (e.key === "4") {
        setActiveTab("exercises");
      } else if (e.key === "5") {
        setActiveTab("tools");
      } else if (e.key === "6") {
        setActiveTab("stats");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [metronomeBpm]);

  const parseRootQuery = (raw: string) => {
    const compact = raw
      .toLowerCase()
      .replace(/[\u266d\u266f]/g, "")
      .replace(/[^a-z0-9#b\s]/g, " ")
      .replace(/\s+/g, "")
      .trim();

    if (!compact) return null;

    const candidateRoots = [...ALL_ROOT_NOTES]
      .map((note) => note.toLowerCase())
      .sort((a, b) => b.length - a.length);

    for (const candidate of candidateRoots) {
      if (!compact.startsWith(candidate)) continue;

      const root = ALL_ROOT_NOTES.find(
        (note) => note.toLowerCase() === candidate,
      );
      if (!root) continue;

      return {
        root,
        rest: compact.slice(candidate.length),
      };
    }

    return null;
  };

  const normalizeSearchQuality = (query: string) => {
    const compact = query.toLowerCase().replace(/\s+/g, "");
    if (!compact) return "";

    const aliasMap: Record<string, string> = {
      m: "minor",
      min: "minor",
      minor: "minor",
      major: "major",
      maj: "major",
      ionian: "major",
      aeolian: "minor",
      naturalminor: "minor",
      harmonicminor: "minor",
      melodicminor: "minor",
      pentatonicminor: "minor",
      minor7: "min7",
      m7: "min7",
      major7: "maj7",
      maj7: "maj7",
      dom: "7",
      dominant: "7",
      seven: "7",
      "7": "7",
    };

    return aliasMap[compact] ?? compact;
  };

  const searchResults = React.useMemo<GlobalSearchResult[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const parsed = parseRootQuery(q);
    const strippedScaleQuery = normalizeSearchQuality(
      (parsed?.rest ?? q).replace(/\bscales?\b/g, "").trim(),
    );
    const strippedChordQuery = normalizeSearchQuality(
      (parsed?.rest ?? q).replace(/\bchords?\b/g, "").trim(),
    );

    const tabCatalog: GlobalSearchResult[] = [
      {
        id: "tab-dashboard",
        label: "Dashboard",
        subtitle: "Metronome, drills, session",
        tab: "dashboard",
        kind: "tab",
      },
      {
        id: "tab-scales",
        label: "Scales",
        subtitle: "Scale explorer and playback",
        tab: "scales",
        kind: "tab",
      },
      {
        id: "tab-chords",
        label: "Chords",
        subtitle: "Chord explorer and notation",
        tab: "chords",
        kind: "tab",
      },
      {
        id: "tab-exercises",
        label: "Exercises",
        subtitle: "Technique and theory drills",
        tab: "exercises",
        kind: "tab",
      },
      {
        id: "tab-tools",
        label: "Tools",
        subtitle: "Metronome, circle, tuner, ear trainer",
        tab: "tools",
        kind: "tab",
      },
      {
        id: "tab-stats",
        label: "Stats",
        subtitle: "Practice analytics",
        tab: "stats",
        kind: "tab",
      },
    ];

    const tabResults: GlobalSearchResult[] = tabCatalog.filter((r) =>
      `${r.label} ${r.subtitle}`.toLowerCase().includes(q),
    );

    const scaleMatches = SCALES_DATABASE.filter((s) => {
      const haystack = `${s.name} ${s.id} ${s.formula}`.toLowerCase();
      if (parsed?.root) {
        return strippedScaleQuery.length === 0
          ? true
          : haystack.includes(strippedScaleQuery);
      }
      return haystack.includes(q);
    }).slice(0, 8);

    const scaleResults: GlobalSearchResult[] = scaleMatches.map((s) => ({
      id: `scale-${parsed?.root ?? "any"}-${s.id}`,
      label: `${parsed?.root ?? "C"} ${s.name}`,
      subtitle: `${s.category} • ${s.formula}`,
      tab: "scales",
      kind: "scale",
      payload: { scaleId: s.id, root: parsed?.root ?? "C" },
    }));

    const chordMatches = CHORD_TYPES_CATALOG.filter((c) => {
      const haystack = `${c.name} ${c.symbol} ${c.type}`.toLowerCase();
      if (parsed?.root) {
        return strippedChordQuery.length === 0
          ? true
          : haystack.includes(strippedChordQuery);
      }
      return haystack.includes(q);
    }).slice(0, 8);

    const chordResults: GlobalSearchResult[] = chordMatches.map((c) => ({
      id: `chord-${parsed?.root ?? "C"}-${c.type}`,
      label: `${parsed?.root ?? "C"}${c.symbol || ""}`,
      subtitle: `${c.name} • ${c.formula}`,
      tab: "chords",
      kind: "chord",
      payload: { chordType: c.type, root: parsed?.root ?? "C" },
    }));

    const exerciseResults: GlobalSearchResult[] = EXERCISES_DATABASE.filter(
      (e) =>
        `${e.title} ${e.category} ${e.description} ${e.difficulty}`
          .toLowerCase()
          .includes(q),
    )
      .slice(0, 8)
      .map((e) => ({
        id: `exercise-${e.id}`,
        label: e.title,
        subtitle: `${e.category} • ${e.difficulty} • ${e.suggestedBpm} BPM`,
        tab: "exercises",
        kind: "exercise",
        payload: { exerciseId: e.id },
      }));

    return [
      ...tabResults,
      ...scaleResults,
      ...chordResults,
      ...exerciseResults,
    ].slice(0, 12);
  }, [searchQuery]);

  const handleSelectSearchResult = (result: GlobalSearchResult) => {
    setActiveTab(result.tab);

    if (
      result.kind === "scale" &&
      result.payload?.scaleId &&
      result.payload?.root
    ) {
      setPendingScaleSearch({
        scaleId: result.payload.scaleId,
        root: result.payload.root as NoteName,
      });
    }
    if (
      result.kind === "chord" &&
      result.payload?.chordType &&
      result.payload?.root
    ) {
      setPendingChordSearch({
        chordType: result.payload.chordType,
        root: result.payload.root as NoteName,
      });
    }
    if (result.kind === "exercise" && result.payload?.exerciseId) {
      setPendingExerciseSearch(result.payload.exerciseId);
    }

    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col antialiased selection:bg-primary/30 selection:text-on-surface">
      {/* Navigation Layout */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        streakDays={streak.currentStreak}
        graceActive={streak.graceDaysUsed > 0}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        onSelectSearchResult={handleSelectSearchResult}
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-72 pt-4 px-4 lg:px-8 max-w-[1600px] w-full mx-auto">
        {activeTab === "dashboard" && (
          <DashboardPage
            metronomeBpm={metronomeBpm}
            onBpmChange={setMetronomeBpm}
            streak={streak}
            activeSessionDuration={activeSessionDuration}
            isSessionActive={isSessionActive}
            onToggleSession={handleToggleSession}
            onEndSession={handleEndSession}
            onLogBpm={handleLogBpm}
            settings={settings}
            metronomeIsPlaying={metronomeIsPlaying}
            onMetronomePlayingChange={setMetronomeIsPlaying}
            metronomeBarCycleMode={metronomeBarCycleMode}
            onBarCycleModeChange={setMetronomeBarCycleMode}
          />
        )}

        {activeTab === "scales" && (
          <ScalesPage
            initialScaleTarget={pendingScaleSearch}
            onInitialScaleHandled={() => setPendingScaleSearch(null)}
            settings={settings}
          />
        )}

        {activeTab === "chords" && (
          <ChordsPage
            initialChordTarget={pendingChordSearch}
            onInitialChordHandled={() => setPendingChordSearch(null)}
          />
        )}

        {activeTab === "exercises" && (
          <ExercisesPage
            onStartExercisePractice={handleStartExercisePractice}
            initialExerciseId={pendingExerciseSearch}
            onInitialExerciseHandled={() => setPendingExerciseSearch(null)}
          />
        )}

        {activeTab === "tools" && (
          <ToolsPage
            metronomeBpm={metronomeBpm}
            onBpmChange={setMetronomeBpm}
            onLogBpm={handleLogBpm}
            settings={settings}
            metronomeIsPlaying={metronomeIsPlaying}
            onMetronomePlayingChange={setMetronomeIsPlaying}
            metronomeBarCycleMode={metronomeBarCycleMode}
            onBarCycleModeChange={setMetronomeBarCycleMode}
          />
        )}

        {activeTab === "stats" && (
          <StatsPage sessions={sessions} streak={streak} />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onExportData={handleExportData}
        onClearData={handleClearData}
      />
    </div>
  );
}

export default App;
