import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  NoteDisplayMode,
  NoteName,
  ScaleDefinition,
  StreakData,
  Tuning,
  AppSettings,
} from "../types";
import { Metronome } from "../components/Metronome";
import { RandomDrill } from "../components/RandomDrill";
import { SessionWidget } from "../components/SessionWidget";
import { Fretboard } from "../components/Fretboard";
import { PianoKeyboard } from "../components/PianoKeyboard";
import {
  SCALES_DATABASE,
  ALL_ROOT_NOTES,
  GUITAR_TUNINGS,
} from "../data/musicTheory";
import {
  Guitar,
  Piano,
  Layers,
  Sparkles,
  ChevronDown,
  X,
  Search,
  Check,
} from "lucide-react";

interface DashboardPageProps {
  metronomeBpm: number;
  onBpmChange: (bpm: number) => void;
  streak: StreakData;
  activeSessionDuration: number;
  isSessionActive: boolean;
  onToggleSession: () => void;
  onEndSession: () => void;
  onLogBpm: (bpm: number) => void;
  settings: AppSettings;
  metronomeIsPlaying?: boolean;
  onMetronomePlayingChange?: (playing: boolean) => void;
  metronomeBarCycleMode?: boolean;
  onBarCycleModeChange?: (enabled: boolean) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  metronomeBpm,
  onBpmChange,
  streak,
  activeSessionDuration,
  isSessionActive,
  onToggleSession,
  onEndSession,
  onLogBpm,
  settings,
  metronomeIsPlaying,
  onMetronomePlayingChange,
  metronomeBarCycleMode,
  onBarCycleModeChange,
}) => {
  // Get tuning from settings
  const defaultTuning = useMemo(() => {
    return (
      GUITAR_TUNINGS.find((t) => t.name === settings.defaultTuning) ??
      GUITAR_TUNINGS[0]
    );
  }, [settings.defaultTuning]);

  // Instrument view toggle: guitar vs piano vs both
  const [instrumentView, setInstrumentView] = useState<
    "guitar" | "piano" | "both"
  >("guitar");

  // Scale overlay state
  const [selectedRoot, setSelectedRoot] = useState<NoteName>("A");
  const [isRootMenuOpen, setIsRootMenuOpen] = useState<boolean>(false);
  const rootMenuRef = useRef<HTMLDivElement>(null);
  const [isScaleMenuOpen, setIsScaleMenuOpen] = useState<boolean>(false);
  const [scaleSearchQuery, setScaleSearchQuery] = useState<string>("");
  const [scaleMenuCategory, setScaleMenuCategory] = useState<string>("All");
  const scaleMenuRef = useRef<HTMLDivElement>(null);
  const [selectedScale, setSelectedScale] = useState<ScaleDefinition | null>(
    SCALES_DATABASE.find((scale) => scale.id === "natural_minor") ??
      SCALES_DATABASE[1] ??
      null,
  );
  const [displayMode, setDisplayMode] = useState<NoteDisplayMode>("name");
  const [currentTuning, setCurrentTuning] = useState<Tuning>(defaultTuning);
  const [fretCount, setFretCount] = useState<number>(settings.fretCount);

  // Active Random Note state
  const [activeRandomNote, setActiveRandomNote] = useState<string>("F#");
  const [showTargetNote, setShowTargetNote] = useState<boolean>(false);

  const scaleCategories = [
    "Major & Minor",
    "Pentatonic & Blues",
    "Modes",
    "Symmetrical & Exotic",
  ] as const;

  const filteredScales = SCALES_DATABASE.filter((scale) => {
    const query = scaleSearchQuery.toLowerCase();
    const matchesCategory =
      scaleMenuCategory === "All" || scale.category === scaleMenuCategory;
    const matchesSearch =
      scale.name.toLowerCase().includes(query) ||
      scale.category.toLowerCase().includes(query) ||
      scale.formula.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // Sync fretCount from settings when it changes
  useEffect(() => {
    setFretCount(settings.fretCount);
  }, [settings.fretCount]);

  // Sync tuning from settings when it changes
  useEffect(() => {
    const newTuning =
      GUITAR_TUNINGS.find((t) => t.name === settings.defaultTuning) ??
      GUITAR_TUNINGS[0];
    setCurrentTuning(newTuning);
  }, [settings.defaultTuning]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        rootMenuRef.current &&
        !rootMenuRef.current.contains(event.target as Node)
      ) {
        setIsRootMenuOpen(false);
      }
      if (
        scaleMenuRef.current &&
        !scaleMenuRef.current.contains(event.target as Node)
      ) {
        setIsScaleMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Top 3-Column Dashboard Grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5 xl:grid-cols-3 items-stretch">
        {/* Metronome */}
        <Metronome
          bpm={metronomeBpm}
          onBpmChange={onBpmChange}
          onLogBpmToSession={onLogBpm}
          settings={settings}
          showTempoPresets={false}
          isPlaying={metronomeIsPlaying}
          onIsPlayingChange={onMetronomePlayingChange}
          barCycleMode={metronomeBarCycleMode}
          onBarCycleModeChange={onBarCycleModeChange}
        />

        {/* Random Note Drill */}
        <RandomDrill
          currentNote={activeRandomNote}
          onNextNote={setActiveRandomNote}
          metronomeBpm={metronomeBpm}
          instrumentView={instrumentView}
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
          currentScaleName={`${selectedRoot} ${selectedScale?.name || "Chromatic"}`}
          highestBpmSession={metronomeBpm}
        />
      </div>

      {/* Main Fretboard & Note Map Container */}
      <div className="space-y-4">
        {/* Instrument Toolbar / Filter Bar */}
        <div className="flex flex-col gap-3 rounded-lg border border-outline-variant/30 bg-surface-container px-3 py-3 shadow-md md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4 md:px-5">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 md:flex md:flex-wrap md:items-center md:gap-3">
            <div className="col-span-2 flex items-center gap-2 md:col-span-1">
              <Sparkles size={16} className="text-primary" />
              <span className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
                Scale Overlay:
              </span>
            </div>

            {/* Root Note Picker */}
            <div
              className="relative col-span-1 h-10 md:h-auto"
              ref={rootMenuRef}
            >
              <button
                type="button"
                onClick={() => {
                  setIsRootMenuOpen((prev) => !prev);
                  setIsScaleMenuOpen(false);
                }}
                className="group flex h-full w-full items-center justify-center gap-1 rounded-lg bg-primary px-3 font-mono text-sm font-bold leading-none text-on-primary shadow-md transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/60 cursor-pointer md:h-auto md:w-auto md:px-2.5 md:py-1"
                title="Click to change root note"
              >
                <span>{selectedRoot}</span>
                <ChevronDown
                  size={11}
                  className="opacity-70 group-hover:opacity-100"
                />
              </button>

              {isRootMenuOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-60 max-w-[calc(100vw-2rem)] rounded-xl border border-outline-variant/40 bg-surface p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-outline-variant/20">
                    <span className="text-[11px] font-mono font-bold text-on-surface uppercase tracking-wider">
                      Select Note
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsRootMenuOpen(false)}
                      className="text-on-surface-variant hover:text-on-surface p-1 rounded"
                      aria-label="Close note chooser"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {ALL_ROOT_NOTES.map((note) => {
                      const isSelected = selectedRoot === note;
                      return (
                        <button
                          key={note}
                          type="button"
                          onClick={() => {
                            setSelectedRoot(note);
                            setIsRootMenuOpen(false);
                          }}
                          className={`flex h-9 items-center justify-center rounded font-mono text-xs font-bold transition-all ${
                            isSelected
                              ? "bg-primary text-on-primary shadow-sm scale-105"
                              : "bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline-variant/30 hover:border-primary/50"
                          }`}
                        >
                          {note}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Scale Picker */}
            <div
              className="relative col-span-1 h-10 min-w-0 md:col-span-1 md:h-auto"
              ref={scaleMenuRef}
            >
              <button
                type="button"
                onClick={() => {
                  setIsScaleMenuOpen((prev) => !prev);
                  setIsRootMenuOpen(false);
                }}
                className="group flex h-full w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-1 text-left text-xs font-mono leading-none text-on-surface transition-colors hover:bg-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer md:h-auto md:w-auto md:max-w-[220px]"
                title="Click to select another scale"
              >
                <span className="truncate">
                  {selectedScale?.name || "None (Show All Notes)"}
                </span>
                <ChevronDown
                  size={15}
                  className="shrink-0 text-on-surface-variant group-hover:text-primary"
                />
              </button>

              {isScaleMenuOpen && (
                <div className="absolute left-1/2 top-full z-50 mt-2 w-[calc(100vw-1rem)] max-w-[320px] -translate-x-1/2 rounded-xl border border-outline-variant/40 bg-surface p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150 md:left-0 md:w-[420px] md:max-w-none md:translate-x-0">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-outline-variant/20">
                    <span className="text-[11px] font-mono font-bold text-on-surface uppercase tracking-wider">
                      Select Scale or Mode
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsScaleMenuOpen(false)}
                      className="text-on-surface-variant hover:text-on-surface p-1 rounded"
                      aria-label="Close scale chooser"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="relative mb-2.5">
                    <Search
                      size={14}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant"
                    />
                    <input
                      type="text"
                      placeholder="Search scale name or category..."
                      value={scaleSearchQuery}
                      onChange={(e) => setScaleSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low py-1.5 pl-8 pr-7 text-xs font-mono text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
                      autoFocus
                    />
                    {scaleSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setScaleSearchQuery("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface"
                        aria-label="Clear scale search"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  <div className="no-scrollbar mb-2 flex items-center gap-1 overflow-x-auto border-b border-outline-variant/10 pb-2">
                    {["All", ...scaleCategories].map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setScaleMenuCategory(category)}
                        className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-mono transition-all ${
                          scaleMenuCategory === category
                            ? "bg-primary text-on-primary font-bold"
                            : "border border-outline-variant/20 bg-surface-container text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  <div className="max-h-60 space-y-1 overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedScale(null);
                        setIsScaleMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg p-2 text-left transition-all ${
                        selectedScale === null
                          ? "border border-primary/40 bg-primary/15 text-primary font-bold"
                          : "text-on-surface hover:bg-surface-container-high"
                      }`}
                    >
                      <span className="font-mono text-xs font-semibold">
                        None (Show All Notes)
                      </span>
                      {selectedScale === null && (
                        <Check size={15} className="shrink-0 text-primary" />
                      )}
                    </button>
                    {filteredScales.length === 0 ? (
                      <div className="p-4 text-center text-xs font-mono text-on-surface-variant">
                        No scales found matching &quot;{scaleSearchQuery}&quot;
                      </div>
                    ) : (
                      filteredScales.map((scale) => {
                        const isSelected = selectedScale?.id === scale.id;
                        return (
                          <button
                            key={scale.id}
                            type="button"
                            onClick={() => {
                              setSelectedScale(scale);
                              setIsScaleMenuOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg p-2 text-left transition-all ${
                              isSelected
                                ? "border border-primary/40 bg-primary/15 text-primary font-bold"
                                : "text-on-surface hover:bg-surface-container-high"
                            }`}
                          >
                            <span className="flex min-w-0 flex-col pr-2">
                              <span className="truncate font-mono text-xs font-semibold">
                                {scale.name}
                              </span>
                              <span className="truncate text-[10px] font-mono text-on-surface-variant opacity-75">
                                {scale.formula} • {scale.category}
                              </span>
                            </span>
                            {isSelected && (
                              <Check
                                size={15}
                                className="shrink-0 text-primary"
                              />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instrument Toggle (Guitar / Piano / Both) */}
          <div className="grid grid-cols-3 items-center gap-1 rounded border border-outline-variant/30 bg-surface-container-low p-1 md:flex">
            <button
              onClick={() => setInstrumentView("guitar")}
              className={`flex h-10 items-center justify-center gap-1.5 rounded px-2 py-1 text-xs font-mono transition-all md:h-auto md:px-3 ${
                instrumentView === "guitar"
                  ? "bg-primary text-on-primary font-bold shadow"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Guitar size={14} />
              <span>Guitar</span>
            </button>

            <button
              onClick={() => setInstrumentView("piano")}
              className={`flex h-10 items-center justify-center gap-1.5 rounded px-2 py-1 text-xs font-mono transition-all md:h-auto md:px-3 ${
                instrumentView === "piano"
                  ? "bg-primary text-on-primary font-bold shadow"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Piano size={14} />
              <span>Piano</span>
            </button>

            <button
              onClick={() => setInstrumentView("both")}
              className={`flex h-10 items-center justify-center gap-1.5 rounded px-2 py-1 text-xs font-mono transition-all md:h-auto md:px-3 ${
                instrumentView === "both"
                  ? "bg-primary text-on-primary font-bold shadow"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Layers size={14} />
              <span>Both</span>
            </button>
          </div>
        </div>

        {/* Fretboard View */}
        {(instrumentView === "guitar" || instrumentView === "both") && (
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
        {(instrumentView === "piano" || instrumentView === "both") && (
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
