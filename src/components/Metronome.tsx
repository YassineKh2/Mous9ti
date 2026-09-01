import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Square,
  Plus,
  Minus,
  Volume2,
  VolumeX,
  Repeat2,
} from "lucide-react";
import {
  MetronomeSound,
  MetronomeSubdivision,
  TimeSignature,
  AppSettings,
} from "../types";
import { audioEngine } from "../lib/audio";

interface MetronomeProps {
  bpm: number;
  onBpmChange: (newBpm: number) => void;
  onLogBpmToSession?: (bpm: number) => void;
  settings: AppSettings;
  showTempoPresets?: boolean;
  isPlaying?: boolean;
  onIsPlayingChange?: (playing: boolean) => void;
  barCycleMode?: boolean;
  onBarCycleModeChange?: (enabled: boolean) => void;
}

export const Metronome: React.FC<MetronomeProps> = ({
  bpm,
  onBpmChange,
  onLogBpmToSession,
  settings,
  showTempoPresets = true,
  isPlaying: controlledIsPlaying,
  onIsPlayingChange,
  barCycleMode: controlledBarCycleMode,
  onBarCycleModeChange,
}) => {
  const [isHydratedFromEngine, setIsHydratedFromEngine] =
    useState<boolean>(false);
  const [localIsPlaying, setLocalIsPlaying] = useState<boolean>(() =>
    audioEngine.isRunning(),
  );
  const isPlaying =
    controlledIsPlaying !== undefined ? controlledIsPlaying : localIsPlaying;
  const [timeSignature, setTimeSignature] = useState<TimeSignature>("4/4");
  const [subdivision, setSubdivision] =
    useState<MetronomeSubdivision>("quarter");
  const [soundType, setSoundType] = useState<MetronomeSound>(
    settings.metronomeSound,
  );
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [isAccentBeat, setIsAccentBeat] = useState<boolean>(false);
  const [localBarCycleMode, setLocalBarCycleMode] = useState<boolean>(false);

  const tempoPresets = [60, 72, 80, 88, 96, 108, 120, 132, 144, 160];
  const barCycleMode =
    controlledBarCycleMode !== undefined
      ? controlledBarCycleMode
      : localBarCycleMode;

  const setBarCycleMode = useCallback(
    (nextValue: boolean | ((prev: boolean) => boolean)) => {
      const resolvedValue =
        typeof nextValue === "function" ? nextValue(barCycleMode) : nextValue;

      if (onBarCycleModeChange) {
        onBarCycleModeChange(resolvedValue);
        return;
      }

      setLocalBarCycleMode(resolvedValue);
    },
    [barCycleMode, onBarCycleModeChange],
  );

  const setIsPlayingState = useCallback(
    (playing: boolean) => {
      if (onIsPlayingChange) {
        onIsPlayingChange(playing);
        return;
      }

      setLocalIsPlaying(playing);
    },
    [onIsPlayingChange],
  );

  // Tap tempo state
  const tapTimesRef = useRef<number[]>([]);
  const barCycleTimeoutRef = useRef<number | null>(null);
  const isPlayingRef = useRef<boolean>(false);
  const barCycleShouldSoundRef = useRef<boolean>(true);

  // Metronome run duration tracker for auto-saving (>30s)
  const startTimeRef = useRef<number | null>(null);

  const clearBarCycle = useCallback(() => {
    if (barCycleTimeoutRef.current !== null) {
      window.clearTimeout(barCycleTimeoutRef.current);
      barCycleTimeoutRef.current = null;
    }
  }, []);

  const handleBeatCallback = useCallback(
    (beat: number, isAccent: boolean, _isSub: boolean) => {
      setCurrentBeat(beat);
      setIsAccentBeat(isAccent);
    },
    [],
  );

  const scheduleBarCycle = useCallback(() => {
    if (!barCycleMode || !isPlayingRef.current) return;

    const beatsPerBar = parseInt(timeSignature.split("/")[0], 10) || 4;
    const barDurationMs = (beatsPerBar * 60 * 1000) / bpm;

    clearBarCycle();

    const shouldSoundThisBar = barCycleShouldSoundRef.current;
    audioEngine.resetMetronomePosition();
    audioEngine.setMuted(!shouldSoundThisBar);

    barCycleShouldSoundRef.current = !shouldSoundThisBar;

    barCycleTimeoutRef.current = window.setTimeout(() => {
      if (!barCycleMode || !isPlayingRef.current) return;
      scheduleBarCycle();
    }, barDurationMs);
  }, [barCycleMode, bpm, clearBarCycle, timeSignature]);

  // Sync sound type from settings when it changes
  useEffect(() => {
    if (!audioEngine.isRunning()) {
      setSoundType(settings.metronomeSound);
    }
  }, [settings.metronomeSound]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;

    if (!isPlaying) {
      clearBarCycle();
      barCycleShouldSoundRef.current = true;
      audioEngine.setMuted(false);
      audioEngine.resetMetronomePosition();
      return;
    }

    if (barCycleMode) {
      barCycleShouldSoundRef.current = true;
      audioEngine.setMuted(false);
      audioEngine.resetMetronomePosition();
      scheduleBarCycle();
      return;
    }

    clearBarCycle();
    barCycleShouldSoundRef.current = true;
    audioEngine.setMuted(false);
    audioEngine.resetMetronomePosition();
  }, [barCycleMode, clearBarCycle, isPlaying, scheduleBarCycle]);

  // Hydrate from current engine state and keep UI playback status synced across page switches
  useEffect(() => {
    const engineState = audioEngine.getMetronomeState();

    setIsPlayingState(engineState.isPlaying);
    setTimeSignature(engineState.timeSignature as TimeSignature);
    setSubdivision(engineState.subdivision);
    setSoundType(engineState.soundType);
    setCurrentBeat(engineState.currentBeat);

    if (engineState.bpm !== bpm) {
      onBpmChange(engineState.bpm);
    }

    audioEngine.setMetronomeBeatCallback(handleBeatCallback);

    const unsubscribe = audioEngine.onMetronomeStateChange((playing) => {
      setIsPlayingState(playing);
      if (!playing) {
        startTimeRef.current = null;
      }
    });

    setIsHydratedFromEngine(true);

    return () => {
      audioEngine.setMetronomeBeatCallback(null);
      unsubscribe();
    };
  }, [onBpmChange, handleBeatCallback, setIsPlayingState]);

  // Time signature beats
  const beatsInBar = parseInt(timeSignature.split("/")[0], 10) || 4;

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      clearBarCycle();
      barCycleShouldSoundRef.current = true;
      audioEngine.setMuted(false);
      audioEngine.resetMetronomePosition();
      audioEngine.stopMetronome();
      setIsPlayingState(false);

      if (startTimeRef.current) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        if (elapsed >= 30 && onLogBpmToSession) {
          onLogBpmToSession(bpm);
        }
      }
      startTimeRef.current = null;
    } else {
      startTimeRef.current = Date.now();
      if (barCycleMode) {
        barCycleShouldSoundRef.current = true;
        audioEngine.setMuted(false);
        audioEngine.resetMetronomePosition();
      }
      audioEngine.startMetronome(
        bpm,
        timeSignature,
        subdivision,
        soundType,
        handleBeatCallback,
      );
      setIsPlayingState(true);
      if (barCycleMode) {
        scheduleBarCycle();
      }
    }
  }, [
    isPlaying,
    bpm,
    timeSignature,
    subdivision,
    soundType,
    handleBeatCallback,
    onLogBpmToSession,
    barCycleMode,
    clearBarCycle,
    scheduleBarCycle,
  ]);

  // Update metronome if playing and params change
  useEffect(() => {
    if (isPlaying && isHydratedFromEngine) {
      audioEngine.updateMetronomeParams(
        bpm,
        timeSignature,
        subdivision,
        soundType,
      );
    }
  }, [
    bpm,
    timeSignature,
    subdivision,
    soundType,
    isPlaying,
    isHydratedFromEngine,
  ]);

  // Tap tempo handler
  const handleTapTempo = () => {
    const now = Date.now();
    const taps = tapTimesRef.current.filter((t) => now - t < 3000); // keep taps within last 3 seconds
    taps.push(now);
    tapTimesRef.current = taps;

    if (taps.length >= 2) {
      const recentTaps = taps.slice(-4); // last 4 taps
      let totalDiff = 0;
      for (let i = 1; i < recentTaps.length; i++) {
        totalDiff += recentTaps[i] - recentTaps[i - 1];
      }
      const avgDiff = totalDiff / (recentTaps.length - 1);
      const calculatedBpm = Math.round(60000 / avgDiff);
      const boundedBpm = Math.max(20, Math.min(300, calculatedBpm));
      onBpmChange(boundedBpm);
    }
  };

  const adjustBpm = (delta: number) => {
    const newBpm = Math.max(20, Math.min(300, bpm + delta));
    onBpmChange(newBpm);
  };

  return (
    <div className="bg-surface-container border border-outline-variant/30 rounded-lg p-5 flex flex-col justify-between relative shadow-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/10">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold tracking-[0.2em] text-on-surface uppercase">
            Metronome
          </span>
          {isPlaying && (
            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeSignature}
            onChange={(e) => setTimeSignature(e.target.value as TimeSignature)}
            className="bg-surface-container-low border border-outline-variant/30 rounded px-2 py-1 text-[11px] font-mono text-on-surface focus:outline-none focus:border-primary/50 cursor-pointer"
          >
            <option value="2/2">2/2</option>
            <option value="2/4">2/4</option>
            <option value="3/4">3/4</option>
            <option value="3/8">3/8</option>
            <option value="4/4">4/4</option>
            <option value="5/4">5/4</option>
            <option value="6/4">6/4</option>
            <option value="6/8">6/8</option>
            <option value="7/8">7/8</option>
            <option value="9/8">9/8</option>
            <option value="12/8">12/8</option>
          </select>

          <select
            value={soundType}
            onChange={(e) => setSoundType(e.target.value as MetronomeSound)}
            className="bg-surface-container-low border border-outline-variant/30 rounded px-2 py-1 text-[11px] font-mono text-on-surface focus:outline-none focus:border-primary/50 cursor-pointer"
          >
            <option value="click">Digital Click</option>
            <option value="woodblock">Woodblock</option>
            <option value="tick">Mechanical Tick</option>
            <option value="beep">Pure Tone Beep</option>
          </select>
        </div>
      </div>

      {/* Visual Beat Indicator Dots/Bars */}
      <div className="flex gap-1.5 my-3 w-full justify-center">
        {Array.from({ length: beatsInBar }).map((_, i) => {
          const isCurrent = isPlaying && currentBeat === i;
          const isAccent = isCurrent && isAccentBeat && i === 0;

          return (
            <div
              key={i}
              className={`flex-1 h-2 rounded-sm transition-all duration-75 ${
                isAccent
                  ? "bg-on-surface shadow-[0_0_10px_rgba(229,226,225,0.9)] scale-y-125"
                  : isCurrent
                    ? "bg-primary shadow-[0_0_10px_rgba(173,198,255,0.8)] scale-y-110"
                    : "bg-outline-variant/20"
              }`}
            />
          );
        })}
      </div>

      {/* Large Numerical BPM Display */}
      <div className="flex items-baseline justify-center gap-3 my-1">
        <span className="font-sans text-6xl font-light tracking-tighter text-on-surface select-none">
          {bpm}
        </span>
        <span className="font-mono text-xs text-on-surface-variant tracking-widest uppercase">
          BPM
        </span>
      </div>

      {showTempoPresets && (
        <div className="flex flex-wrap justify-center gap-1.5 mb-3">
          {tempoPresets.map((preset) => (
            <button
              key={preset}
              onClick={() => onBpmChange(preset)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono tracking-widest transition-all ${
                bpm === preset
                  ? "bg-primary/20 text-primary border border-primary/50"
                  : "bg-surface-container-low text-on-surface-variant border border-outline-variant/30 hover:text-on-surface"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      )}

      {/* Subdivision Selector Buttons */}
      <div className="flex justify-center gap-1.5 my-2.5">
        {[
          { id: "quarter", label: "1/4" },
          { id: "eighth", label: "1/8" },
          { id: "sixteenth", label: "1/16" },
          { id: "triplet", label: "3" },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setSubdivision(s.id as MetronomeSubdivision)}
            className={`px-3 py-1 rounded font-mono text-[10px] tracking-wider transition-colors ${
              subdivision === s.id
                ? "bg-primary/20 text-primary border border-primary/50 font-bold"
                : "border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-outline-variant/10"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Tactile Slider with +/- Buttons */}
      <div className="flex items-center gap-3 my-2">
        <button
          onClick={() => adjustBpm(-1)}
          className="w-7 h-7 rounded bg-surface-container-low border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-outline-variant transition-all"
        >
          <Minus size={14} />
        </button>

        <input
          type="range"
          min="20"
          max="300"
          value={bpm}
          onChange={(e) => onBpmChange(Number(e.target.value))}
          className="flex-1 h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
        />

        <button
          onClick={() => adjustBpm(1)}
          className="w-7 h-7 rounded bg-surface-container-low border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:border-outline-variant transition-all"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Bottom Controls: Tap Tempo, Bar Cycle Toggle & Big Play Button */}
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-outline-variant/10 gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleTapTempo}
            className="text-[10px] font-mono tracking-widest text-on-surface-variant border border-outline-variant/30 px-3.5 py-1.5 rounded hover:text-on-surface hover:border-primary/40 hover:bg-primary/5 active:scale-95 transition-all"
          >
            TAP TEMPO
          </button>

          <button
            onClick={() => {
              const next = !barCycleMode;

              if (!next) {
                clearBarCycle();
                barCycleShouldSoundRef.current = true;
                audioEngine.setMuted(false);
                audioEngine.resetMetronomePosition();
              } else {
                barCycleShouldSoundRef.current = true;
                audioEngine.setMuted(false);
                audioEngine.resetMetronomePosition();
              }

              setBarCycleMode(next);
            }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-mono tracking-widest transition-all ${
              barCycleMode
                ? "bg-primary/15 text-primary border border-primary/50"
                : "border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-primary/30"
            }`}
          >
            {barCycleMode ? <VolumeX size={12} /> : <Repeat2 size={12} />}
            MUTE 1 BAR
          </button>
        </div>

        <button
          onClick={togglePlay}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg active:scale-95 ${
            isPlaying
              ? "bg-error-container text-on-error-container border border-error/50 hover:opacity-80"
              : "bg-primary text-on-primary hover:bg-primary-container shadow-primary/20"
          }`}
        >
          {isPlaying ? (
            <Square size={18} fill="currentColor" />
          ) : (
            <Play size={20} className="ml-0.5" fill="currentColor" />
          )}
        </button>
      </div>
    </div>
  );
};
