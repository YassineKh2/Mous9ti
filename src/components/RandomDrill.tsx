import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, ArrowRight, Shuffle, Volume2 } from 'lucide-react';
import { CHROMATIC_FLATS, CHROMATIC_SHARPS } from '../data/musicTheory';
import { audioEngine } from '../lib/audio';

interface RandomDrillProps {
  currentNote: string;
  onNextNote: (note: string) => void;
  metronomeBpm: number;
  showHighlight?: boolean;
  onToggleHighlight?: () => void;
}

type AccidentalMode = 'both' | 'sharps' | 'flats' | 'naturals';

export const RandomDrill: React.FC<RandomDrillProps> = ({
  currentNote,
  onNextNote,
  metronomeBpm,
  showHighlight = true,
  onToggleHighlight
}) => {
  const [accidentalMode, setAccidentalMode] = useState<AccidentalMode>('both');
  const [autoAdvance, setAutoAdvance] = useState<boolean>(false);
  const [intervalType, setIntervalType] = useState<'1bar' | '2bars' | '4bars' | '5s'>('2bars');
  const [progress, setProgress] = useState<number>(0);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const durationRef = useRef<number>(4000);

  const pickNextRandomNote = useCallback(() => {
    let pool: string[] = [];
    if (accidentalMode === 'naturals') {
      pool = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    } else if (accidentalMode === 'sharps') {
      pool = CHROMATIC_SHARPS;
    } else if (accidentalMode === 'flats') {
      pool = CHROMATIC_FLATS;
    } else {
      pool = Array.from(new Set([...CHROMATIC_SHARPS, ...CHROMATIC_FLATS]));
    }

    // Pick a note different from current
    const filtered = pool.filter((n) => n !== currentNote);
    const chosen = filtered[Math.floor(Math.random() * filtered.length)] || pool[0];
    onNextNote(chosen);

    // Audio cue
    audioEngine.playGuitarPluck(chosen, 3, 1.2);
  }, [accidentalMode, currentNote, onNextNote]);

  // Calculate interval duration in milliseconds
  useEffect(() => {
    const secondsPerBeat = 60 / metronomeBpm;
    if (intervalType === '1bar') durationRef.current = secondsPerBeat * 4 * 1000;
    else if (intervalType === '2bars') durationRef.current = secondsPerBeat * 8 * 1000;
    else if (intervalType === '4bars') durationRef.current = secondsPerBeat * 16 * 1000;
    else durationRef.current = 5000;
  }, [intervalType, metronomeBpm]);

  // Auto-advance loop
  useEffect(() => {
    if (!autoAdvance) {
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(0);
      return;
    }

    startTimeRef.current = Date.now();
    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / durationRef.current) * 100);
      setProgress(pct);

      if (elapsed >= durationRef.current) {
        pickNextRandomNote();
        startTimeRef.current = Date.now();
        setProgress(0);
      }
    }, 50);

    timerRef.current = intervalId;
    return () => clearInterval(intervalId);
  }, [autoAdvance, pickNextRandomNote]);

  return (
    <div className="bg-surface-container border border-outline-variant/30 rounded-lg p-5 flex flex-col justify-between relative shadow-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/10">
        <div className="flex items-center gap-2">
          <Shuffle size={14} className="text-primary" />
          <span className="font-mono text-xs font-semibold tracking-[0.2em] text-on-surface uppercase">
            Random Note Drill
          </span>
        </div>

        {/* Accidental Filter */}
        <select
          value={accidentalMode}
          onChange={(e) => setAccidentalMode(e.target.value as AccidentalMode)}
          className="bg-surface-container-low border border-outline-variant/30 rounded px-2 py-1 text-[11px] font-mono text-on-surface focus:outline-none focus:border-primary/50 cursor-pointer"
        >
          <option value="both">All (# / b)</option>
          <option value="sharps">Sharps (#)</option>
          <option value="flats">Flats (b)</option>
          <option value="naturals">Natural Only</option>
        </select>
      </div>

      {/* Center Note Display (Background-free, pure typography) */}
      <div className="flex flex-col items-center justify-center my-3 relative select-none">
        <div 
          className="group cursor-pointer flex flex-col items-center justify-center transition-transform hover:scale-105" 
          onClick={pickNextRandomNote}
        >
          <span className="font-sans text-6xl font-light tracking-tighter text-on-surface drop-shadow-sm">
            {currentNote}
          </span>
          <span className="text-[10px] font-mono text-on-surface-variant group-hover:text-primary transition-colors mt-1">
            Click or Space for Next
          </span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] font-mono text-on-surface-variant tracking-wider">
            LOCATE ON FRETBOARD
          </span>
          {onToggleHighlight && (
            <button
              onClick={onToggleHighlight}
              className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-colors ${
                showHighlight 
                  ? 'bg-primary/20 text-primary border-primary/40' 
                  : 'bg-surface-container-high text-on-surface-variant border-outline-variant/30 hover:text-on-surface'
              }`}
            >
              {showHighlight ? 'HIDE HINT' : 'SHOW HINT'}
            </button>
          )}
        </div>
      </div>

      {/* Auto-Advance Interval Settings & Progress Bar */}
      <div className="space-y-2">
        {autoAdvance && (
          <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setAutoAdvance(!autoAdvance)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded font-mono text-[10px] tracking-wider border transition-all ${
                autoAdvance
                  ? 'bg-primary/20 text-primary border-primary/50'
                  : 'bg-transparent text-on-surface-variant border-outline-variant/30 hover:text-on-surface'
              }`}
            >
              {autoAdvance ? <Pause size={12} /> : <Play size={12} />}
              <span>{autoAdvance ? 'AUTO: ON' : 'AUTO: OFF'}</span>
            </button>

            <select
              value={intervalType}
              onChange={(e) => setIntervalType(e.target.value as '1bar' | '2bars' | '4bars' | '5s')}
              className="bg-surface-container-low border border-outline-variant/30 rounded px-2 py-1.5 text-[10px] font-mono text-on-surface focus:outline-none cursor-pointer"
            >
              <option value="1bar">1 Bar</option>
              <option value="2bars">2 Bars</option>
              <option value="4bars">4 Bars</option>
              <option value="5s">5 Sec</option>
            </select>
          </div>

          <button
            onClick={pickNextRandomNote}
            className="flex items-center gap-1.5 bg-surface-container-low hover:bg-surface-container-high text-on-surface border border-outline-variant/30 px-3 py-1.5 rounded text-xs font-mono tracking-wider active:scale-95 transition-all shadow"
          >
            <span>NEXT</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
