import React, { useState } from 'react';
import { NoteDisplayMode, NoteName, ScaleDefinition, StreakData, Tuning } from '../types';
import { Metronome } from '../components/Metronome';
import { RandomDrill } from '../components/RandomDrill';
import { SessionWidget } from '../components/SessionWidget';
import { Fretboard } from '../components/Fretboard';
import { PianoKeyboard } from '../components/PianoKeyboard';
import { SCALES_DATABASE, ALL_ROOT_NOTES, GUITAR_TUNINGS } from '../data/musicTheory';
import { Guitar, Piano, Layers, Sparkles } from 'lucide-react';

interface DashboardPageProps {
  metronomeBpm: number;
  onBpmChange: (bpm: number) => void;
  streak: StreakData;
  activeSessionDuration: number;
  isSessionActive: boolean;
  onToggleSession: () => void;
  onEndSession: () => void;
  onLogBpm: (bpm: number) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  metronomeBpm,
  onBpmChange,
  streak,
  activeSessionDuration,
  isSessionActive,
  onToggleSession,
  onEndSession,
  onLogBpm
}) => {
  // Instrument view toggle: guitar vs piano vs both
  const [instrumentView, setInstrumentView] = useState<'guitar' | 'piano' | 'both'>('guitar');

  // Scale overlay state
  const [selectedRoot, setSelectedRoot] = useState<NoteName>('E');
  const [selectedScale, setSelectedScale] = useState<ScaleDefinition | null>(SCALES_DATABASE[1]); // E Natural Minor
  const [displayMode, setDisplayMode] = useState<NoteDisplayMode>('name');
  const [currentTuning, setCurrentTuning] = useState<Tuning>(GUITAR_TUNINGS[0]);
  const [fretCount, setFretCount] = useState<number>(22);

  // Active Random Note state
  const [activeRandomNote, setActiveRandomNote] = useState<string>('F#');
  const [showTargetNote, setShowTargetNote] = useState<boolean>(true);

  return (
    <div className="space-y-6 pb-12">
      {/* Top 3-Column Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
        {/* Metronome */}
        <Metronome
          bpm={metronomeBpm}
          onBpmChange={onBpmChange}
          onLogBpmToSession={onLogBpm}
        />

        {/* Random Note Drill */}
        <RandomDrill
          currentNote={activeRandomNote}
          onNextNote={setActiveRandomNote}
          metronomeBpm={metronomeBpm}
          showHighlight={showTargetNote}
          onToggleHighlight={() => setShowTargetNote(!showTargetNote)}
        />

        {/* Practice Streak & Live Session Tracker */}
        <SessionWidget
          streak={streak}
          activeSessionDuration={activeSessionDuration}
          isSessionActive={isSessionActive}
          onToggleSession={onToggleSession}
          onEndSession={onEndSession}
          currentScaleName={`${selectedRoot} ${selectedScale?.name || 'Chromatic'}`}
          highestBpmSession={metronomeBpm}
        />
      </div>

      {/* Main Fretboard & Note Map Container */}
      <div className="space-y-4">
        {/* Instrument Toolbar / Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-container border border-outline-variant/30 rounded-lg px-5 py-3 shadow-md">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <span className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
                Scale Overlay:
              </span>
            </div>

            {/* Root Note Picker */}
            <select
              value={selectedRoot}
              onChange={(e) => setSelectedRoot(e.target.value as NoteName)}
              className="bg-surface-container-low border border-outline-variant/30 rounded px-2.5 py-1 text-xs font-mono font-bold text-primary focus:outline-none focus:border-primary/50 cursor-pointer"
            >
              {ALL_ROOT_NOTES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            {/* Scale Picker */}
            <select
              value={selectedScale?.id || 'none'}
              onChange={(e) => {
                if (e.target.value === 'none') setSelectedScale(null);
                else {
                  const s = SCALES_DATABASE.find((sc) => sc.id === e.target.value);
                  if (s) setSelectedScale(s);
                }
              }}
              className="bg-surface-container-low border border-outline-variant/30 rounded px-3 py-1 text-xs font-mono text-on-surface focus:outline-none focus:border-primary/50 cursor-pointer max-w-[220px]"
            >
              <option value="none">None (Show All Notes)</option>
              {SCALES_DATABASE.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Instrument Toggle (Guitar / Piano / Both) */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded border border-outline-variant/30">
            <button
              onClick={() => setInstrumentView('guitar')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded transition-all ${
                instrumentView === 'guitar'
                  ? 'bg-primary text-on-primary font-bold shadow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Guitar size={14} />
              <span>Guitar</span>
            </button>

            <button
              onClick={() => setInstrumentView('piano')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded transition-all ${
                instrumentView === 'piano'
                  ? 'bg-primary text-on-primary font-bold shadow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Piano size={14} />
              <span>Piano</span>
            </button>

            <button
              onClick={() => setInstrumentView('both')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded transition-all ${
                instrumentView === 'both'
                  ? 'bg-primary text-on-primary font-bold shadow'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Layers size={14} />
              <span>Both</span>
            </button>
          </div>
        </div>

        {/* Fretboard View */}
        {(instrumentView === 'guitar' || instrumentView === 'both') && (
          <Fretboard
            tuning={currentTuning}
            onTuningChange={setCurrentTuning}
            fretCount={fretCount}
            onFretCountChange={setFretCount}
            selectedRoot={selectedRoot}
            selectedScale={selectedScale}
            activeRandomNote={showTargetNote ? activeRandomNote : null}
            displayMode={displayMode}
            onDisplayModeChange={setDisplayMode}
          />
        )}

        {/* Piano View */}
        {(instrumentView === 'piano' || instrumentView === 'both') && (
          <PianoKeyboard
            octaves={3}
            startOctave={3}
            selectedRoot={selectedRoot}
            selectedScale={selectedScale}
            activeRandomNote={showTargetNote ? activeRandomNote : null}
            displayMode={displayMode}
          />
        )}
      </div>
    </div>
  );
};
