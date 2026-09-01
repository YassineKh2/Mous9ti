import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  AppSettings, 
  Exercise, 
  Session, 
  StreakData 
} from './types';
import { 
  getSavedSettings, 
  getSavedSessions, 
  getSavedStreak, 
  getTodayDateString, 
  saveSession, 
  saveSettings 
} from './lib/storage';
import { audioEngine } from './lib/audio';
import { Navigation, ActiveTab } from './components/Navigation';
import { SettingsModal } from './components/SettingsModal';
import { DashboardPage } from './pages/DashboardPage';
import { ScalesPage } from './pages/ScalesPage';
import { ChordsPage } from './pages/ChordsPage';
import { ExercisesPage } from './pages/ExercisesPage';
import { ToolsPage } from './pages/ToolsPage';
import { StatsPage } from './pages/StatsPage';

export function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Settings & Theme
  const [settings, setSettings] = useState<AppSettings>(() => getSavedSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Practice & Sessions State
  const [sessions, setSessions] = useState<Session[]>(() => getSavedSessions());
  const [streak, setStreak] = useState<StreakData>(() => getSavedStreak());
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [activeSessionDuration, setActiveSessionDuration] = useState<number>(0);
  const [currentSessionBpms, setCurrentSessionBpms] = useState<number[]>([]);

  // Metronome State
  const [metronomeBpm, setMetronomeBpm] = useState<number>(120);

  // Sync Master Volume & Theme to engine and HTML element
  useEffect(() => {
    audioEngine.setVolume(settings.soundVolume);
    if (settings.theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
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
    const highestBpm = currentSessionBpms.length > 0 ? Math.max(...currentSessionBpms) : metronomeBpm;

    const newSession: Session = {
      id: `session-${Date.now()}`,
      date: today,
      startTime: Date.now() - activeSessionDuration * 1000,
      endTime: Date.now(),
      durationSeconds: activeSessionDuration,
      bpmsUsed: currentSessionBpms.length > 0 ? currentSessionBpms : [metronomeBpm],
      highestBpm,
      scalesPracticed: ['Fretboard Theory & Metronome'],
      exercisesOpened: [],
      focus: 'Fretboard Theory & Metronome Technique',
      completed: true
    };

    saveSession(newSession);
    setSessions(getSavedSessions());
    setStreak(getSavedStreak());

    // Celebrate streak completion with confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setIsSessionActive(false);
    setActiveSessionDuration(0);
    setCurrentSessionBpms([]);
  }, [activeSessionDuration, currentSessionBpms, metronomeBpm]);

  // Log BPM to session tracker
  const handleLogBpm = (bpm: number) => {
    setCurrentSessionBpms((prev) => (prev.includes(bpm) ? prev : [...prev, bpm]));
  };

  // Switch to exercise practice directly with suggested tempo
  const handleStartExercisePractice = (exercise: Exercise) => {
    setMetronomeBpm(exercise.suggestedBpm);
    setActiveTab('dashboard');
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
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fretmaster-practice-export-${getTodayDateString()}.json`;
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
      history: []
    });
    setIsSettingsOpen(false);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        // Toggle metronome directly
        if (audioEngine.isRunning()) {
          audioEngine.stopMetronome();
        } else {
          audioEngine.startMetronome(metronomeBpm, '4/4', 'quarter', 'click', () => {});
        }
      } else if (e.key === '1') {
        setActiveTab('dashboard');
      } else if (e.key === '2') {
        setActiveTab('scales');
      } else if (e.key === '3') {
        setActiveTab('chords');
      } else if (e.key === '4') {
        setActiveTab('exercises');
      } else if (e.key === '5') {
        setActiveTab('tools');
      } else if (e.key === '6') {
        setActiveTab('stats');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [metronomeBpm]);

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
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-72 pt-4 px-4 lg:px-8 max-w-[1600px] w-full mx-auto">
        {activeTab === 'dashboard' && (
          <DashboardPage
            metronomeBpm={metronomeBpm}
            onBpmChange={setMetronomeBpm}
            streak={streak}
            activeSessionDuration={activeSessionDuration}
            isSessionActive={isSessionActive}
            onToggleSession={handleToggleSession}
            onEndSession={handleEndSession}
            onLogBpm={handleLogBpm}
          />
        )}

        {activeTab === 'scales' && <ScalesPage />}

        {activeTab === 'chords' && <ChordsPage />}

        {activeTab === 'exercises' && (
          <ExercisesPage onStartExercisePractice={handleStartExercisePractice} />
        )}

        {activeTab === 'tools' && <ToolsPage />}

        {activeTab === 'stats' && (
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
