import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Play,
  Pause,
  Square,
  Trash2,
  Copy,
  Plus,
  Settings2,
  Guitar,
  GripVertical,
  Music,
  Search,
  ChevronDown,
  Sparkles,
  Lightbulb,
  Check,
  Waves,
  Volume2,
} from "lucide-react";
import {
  ALL_ROOT_NOTES,
  GUITAR_TUNINGS,
  NOTE_SEMITONES,
  CHROMATIC_SHARPS,
} from "../data/musicTheory";
import { CHORD_TYPES_CATALOG, getChordDefinition } from "../data/chordsData";
import { KeyboardVoicing, NoteName } from "../types";
import { ChordDiagram } from "../components/ChordDiagram";
import { KeyboardChordDiagram } from "../components/KeyboardChordDiagram";
import { audioEngine } from "../lib/audio";

interface QueueItem {
  id: string;
  root: NoteName;
  type: string;
  repeats: number;
  duration: number; // Duration in beats (1 = quarter note, 2 = half note, 3 = dotted half, 4 = whole note, 8 = 2 bars)
  style: string; // Strumming pattern key
  voicingIndex?: number;
}

export interface StyleStroke {
  beat: number;
  type:
    | "down"
    | "up"
    | "arpeggio"
    | "arpeggio_up"
    | "arpeggio_down"
    | "arpeggio_step"
    | "bass_only"
    | "chords_only"
    | "alberti";
  subIndex?: number;
}

export type StrumStroke = StyleStroke; // Backwards compatibility

export const DURATION_OPTIONS = [
  { value: 1, label: "Quarter Note (1 beat)", shortLabel: "1/4 Note (1 beat)" },
  { value: 2, label: "Half Note (2 beats)", shortLabel: "1/2 Note (2 beats)" },
  {
    value: 3,
    label: "Dotted Half (3 beats)",
    shortLabel: "3/4 Note (3 beats)",
  },
  {
    value: 4,
    label: "Whole Note (4 beats / 1 bar)",
    shortLabel: "Whole Note (4 beats)",
  },
  { value: 8, label: "2 Bars (8 beats)", shortLabel: "2 Bars (8 beats)" },
];

export const REPEAT_PRESETS = [1, 2, 3, 4, 6, 8, 12, 16];

// Guitar Strumming & Fingerpicking Patterns
export const GUITAR_STRUM_PATTERNS: Record<
  string,
  {
    label: string;
    shortLabel: string;
    getStrokes: (beats: number) => StyleStroke[];
  }
> = {
  down: {
    label: "Down Strum (D)",
    shortLabel: "Down (D)",
    getStrokes: () => [{ beat: 0, type: "down" }],
  },
  up: {
    label: "Up Strum (U)",
    shortLabel: "Up (U)",
    getStrokes: () => [{ beat: 0, type: "up" }],
  },
  "fingerpicking-8ths": {
    label: "Fingerpicking Arpeggio",
    shortLabel: "8th Fingerpicking",
    getStrokes: (beats) => {
      const strokes: StyleStroke[] = [];
      let sub = 0;
      for (let b = 0; b < beats; b += 0.5) {
        strokes.push({ beat: b, type: "arpeggio_step", subIndex: sub });
        sub++;
      }
      if (strokes.length === 0) strokes.push({ beat: 0, type: "down" });
      return strokes;
    },
  },
  "arpeggio-up": {
    label: "Ascending Arpeggio Roll (Low → High strings ↑)",
    shortLabel: "Arpeggio Up ↑",
    getStrokes: () => [{ beat: 0, type: "arpeggio_up" }],
  },
  "arpeggio-down": {
    label: "Cascading Arpeggio Roll (High → Low strings ↓)",
    shortLabel: "Arpeggio Down ↓",
    getStrokes: () => [{ beat: 0, type: "arpeggio_down" }],
  },
  "quarter-down": {
    label: "Continuous Down (D D D D...)",
    shortLabel: "Continuous (D)",
    getStrokes: (beats) => {
      const strokes: StyleStroke[] = [];
      for (let b = 0; b < beats; b += 1) {
        strokes.push({ beat: b, type: "down" });
      }
      if (strokes.length === 0) strokes.push({ beat: 0, type: "down" });
      return strokes;
    },
  },
  "quarter-alt": {
    label: "Alternating Beats (D U D U...)",
    shortLabel: "Alt Beats (D U)",
    getStrokes: (beats) => {
      const strokes: StyleStroke[] = [];
      for (let b = 0; b < beats; b += 1) {
        strokes.push({ beat: b, type: b % 2 === 0 ? "down" : "up" });
      }
      if (strokes.length === 0) strokes.push({ beat: 0, type: "down" });
      return strokes;
    },
  },
  "d-d-u": {
    label: "Down Down Up (D D U)",
    shortLabel: "D D U",
    getStrokes: (beats) => {
      const strokes: StyleStroke[] = [];
      const cycle = [
        { beat: 0, type: "down" as const },
        { beat: 1.5, type: "down" as const },
        { beat: 2.5, type: "up" as const },
      ];
      for (let base = 0; base < beats; base += 4) {
        cycle.forEach((c) => {
          if (base + c.beat < beats) {
            strokes.push({ beat: base + c.beat, type: c.type });
          }
        });
      }
      if (strokes.length === 0) strokes.push({ beat: 0, type: "down" });
      return strokes;
    },
  },
  eighths: {
    label: "Eighth Notes (D U D U D U D U)",
    shortLabel: "Eighths (D U)",
    getStrokes: (beats) => {
      const strokes: StyleStroke[] = [];
      for (let b = 0; b < beats; b += 0.5) {
        strokes.push({
          beat: b,
          type: Math.round(b * 2) % 2 === 0 ? "down" : "up",
        });
      }
      if (strokes.length === 0) strokes.push({ beat: 0, type: "down" });
      return strokes;
    },
  },
  island: {
    label: "Island Strum (D D U U D U)",
    shortLabel: "Island (D D U U D U)",
    getStrokes: (beats) => {
      const strokes: StyleStroke[] = [];
      const cycle = [
        { beat: 0, type: "down" as const },
        { beat: 1, type: "down" as const },
        { beat: 1.5, type: "up" as const },
        { beat: 2.5, type: "up" as const },
        { beat: 3, type: "down" as const },
        { beat: 3.5, type: "up" as const },
      ];
      for (let base = 0; base < beats; base += 4) {
        cycle.forEach((c) => {
          if (base + c.beat < beats) {
            strokes.push({ beat: base + c.beat, type: c.type });
          }
        });
      }
      if (strokes.length === 0) strokes.push({ beat: 0, type: "down" });
      return strokes;
    },
  },
  syncopated: {
    label: "Syncopated Pop (D U U U D)",
    shortLabel: "Syncopated",
    getStrokes: (beats) => {
      const strokes: StyleStroke[] = [];
      const cycle = [
        { beat: 0, type: "down" as const },
        { beat: 0.5, type: "up" as const },
        { beat: 1.5, type: "up" as const },
        { beat: 2.5, type: "up" as const },
        { beat: 3.5, type: "down" as const },
      ];
      for (let base = 0; base < beats; base += 4) {
        cycle.forEach((c) => {
          if (base + c.beat < beats) {
            strokes.push({ beat: base + c.beat, type: c.type });
          }
        });
      }
      if (strokes.length === 0) strokes.push({ beat: 0, type: "down" });
      return strokes;
    },
  },
};

// Keyboard & Synthesizer Playing Styles / Articulations
export const KEYBOARD_PLAYING_STYLES: Record<
  string,
  {
    label: string;
    shortLabel: string;
    getStrokes: (beats: number) => StyleStroke[];
  }
> = {
  sustained: {
    label: "Sustained Block Chord",
    shortLabel: "Sustained Chord",
    getStrokes: () => [{ beat: 0, type: "down" }],
  },
  "arpeggio-8ths": {
    label: "8th-Note Arpeggio",
    shortLabel: "8th Arpeggio",
    getStrokes: (beats) => {
      const strokes: StyleStroke[] = [];
      let sub = 0;
      for (let b = 0; b < beats; b += 0.5) {
        strokes.push({ beat: b, type: "arpeggio_step", subIndex: sub });
        sub++;
      }
      if (strokes.length === 0) strokes.push({ beat: 0, type: "down" });
      return strokes;
    },
  },
  "arpeggiator-16ths": {
    label: "16th-Note Arpeggio",
    shortLabel: "16th Arpeggio",
    getStrokes: (beats) => {
      const strokes: StyleStroke[] = [];
      let sub = 0;
      for (let b = 0; b < beats; b += 0.25) {
        strokes.push({ beat: b, type: "arpeggio_step", subIndex: sub });
        sub++;
      }
      if (strokes.length === 0) strokes.push({ beat: 0, type: "down" });
      return strokes;
    },
  },
  "ballad-8ths": {
    label: "8ths Pulse",
    shortLabel: "8ths Pulse",
    getStrokes: (beats) => {
      const strokes: StyleStroke[] = [];
      for (let b = 0; b < beats; b += 0.5) {
        strokes.push({ beat: b, type: b % 1 === 0 ? "down" : "up" });
      }
      if (strokes.length === 0) strokes.push({ beat: 0, type: "down" });
      return strokes;
    },
  },

  "synth-16th": {
    label: "16th Pulse",
    shortLabel: "16th Pulse",
    getStrokes: (beats) => {
      const strokes: StyleStroke[] = [];
      for (let b = 0; b < beats; b += 0.25) {
        strokes.push({ beat: b, type: "down" });
      }
      if (strokes.length === 0) strokes.push({ beat: 0, type: "down" });
      return strokes;
    },
  },
  "arpeggio-up": {
    label: "Ascending Arpeggio Roll (Low → High ↑)",
    shortLabel: "Arpeggio Up ↑",
    getStrokes: () => [{ beat: 0, type: "arpeggio_up" }],
  },
  "arpeggio-down": {
    label: "Cascading Arpeggio Roll (High → Low ↓)",
    shortLabel: "Arpeggio Down ↓",
    getStrokes: () => [{ beat: 0, type: "arpeggio_down" }],
  },
  "broken-alberti": {
    label: "Alberti Broken Chord (Classic Flow: Low-High-Mid-High)",
    shortLabel: "Alberti Broken",
    getStrokes: (beats) => {
      const strokes: StyleStroke[] = [];
      let sub = 0;
      for (let b = 0; b < beats; b += 0.5) {
        strokes.push({ beat: b, type: "alberti", subIndex: sub });
        sub++;
      }
      if (strokes.length === 0) strokes.push({ beat: 0, type: "down" });
      return strokes;
    },
  },
  "pulse-quarters": {
    label: "Rhythmic Comping",
    shortLabel: "Quarter Comping",
    getStrokes: (beats) => {
      const strokes: StyleStroke[] = [];
      for (let b = 0; b < beats; b += 1) {
        strokes.push({ beat: b, type: "down" });
      }
      if (strokes.length === 0) strokes.push({ beat: 0, type: "down" });
      return strokes;
    },
  },
  "comp-syncopated": {
    label: "Charleston / Jazz Groove (1 & 2+)",
    shortLabel: "Charleston Comp",
    getStrokes: (beats) => {
      const strokes: StyleStroke[] = [];
      const cycle = [
        { beat: 0, type: "down" as const },
        { beat: 1.5, type: "down" as const },
      ];
      for (let base = 0; base < beats; base += 4) {
        cycle.forEach((c) => {
          if (base + c.beat < beats) {
            strokes.push({ beat: base + c.beat, type: c.type });
          }
        });
      }
      if (strokes.length === 0) strokes.push({ beat: 0, type: "down" });
      return strokes;
    },
  },
  "offbeat-stabs": {
    label: "Offbeat Stabs (& 1 & 2 & 3 & 4)",
    shortLabel: "Offbeat Stabs",
    getStrokes: (beats) => {
      const strokes: StyleStroke[] = [];
      for (let b = 0.5; b < beats; b += 1) {
        strokes.push({ beat: b, type: "down" });
      }
      if (strokes.length === 0) strokes.push({ beat: 0.5, type: "down" });
      return strokes;
    },
  },
  "bass-chord": {
    label: "Bass + Chord Stride (Bass 1/3, Chords 2/4)",
    shortLabel: "Bass + Chord",
    getStrokes: (beats) => {
      const strokes: StyleStroke[] = [];
      for (let b = 0; b < beats; b += 1) {
        if (b % 2 === 0) {
          strokes.push({ beat: b, type: "bass_only" });
        } else {
          strokes.push({ beat: b, type: "chords_only" });
        }
      }
      if (strokes.length === 0) strokes.push({ beat: 0, type: "down" });
      return strokes;
    },
  },
};

// Combined Registry
export const ALL_PLAYING_PATTERNS: Record<
  string,
  {
    label: string;
    shortLabel: string;
    getStrokes: (beats: number) => StyleStroke[];
  }
> = {
  ...GUITAR_STRUM_PATTERNS,
  ...KEYBOARD_PLAYING_STYLES,
};

export const STRUM_PATTERNS = ALL_PLAYING_PATTERNS; // Backwards compatibility

export const getPlayingStyle = (
  styleKey: string,
  isKeyboard: boolean = false,
) => {
  if (ALL_PLAYING_PATTERNS[styleKey]) return ALL_PLAYING_PATTERNS[styleKey];
  if (styleKey === "strum-down" || styleKey === "down") {
    return isKeyboard
      ? KEYBOARD_PLAYING_STYLES["sustained"] ||
          KEYBOARD_PLAYING_STYLES["pulse-quarters"]
      : GUITAR_STRUM_PATTERNS["down"];
  }
  if (styleKey === "strum-up" || styleKey === "up")
    return GUITAR_STRUM_PATTERNS["up"];
  if (styleKey === "d-u-d-u") return GUITAR_STRUM_PATTERNS["quarter-alt"];
  if (styleKey === "arpeggiated")
    return isKeyboard
      ? KEYBOARD_PLAYING_STYLES["arpeggio-up"]
      : GUITAR_STRUM_PATTERNS["arpeggiated"];
  return isKeyboard
    ? KEYBOARD_PLAYING_STYLES["sustained"]
    : GUITAR_STRUM_PATTERNS["down"];
};

const generateId = () => Math.random().toString(36).substring(2, 9);

interface RepeatsDropdownProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
  compact?: boolean;
  openUpwards?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

const RepeatsDropdown = forwardRef<
  { toggle: () => void },
  RepeatsDropdownProps
>(
  (
    {
      value,
      onChange,
      className = "",
      compact = false,
      openUpwards = false,
      onOpenChange,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [customVal, setCustomVal] = useState<string>(value.toString());
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleOpenToggle = (newState: boolean) => {
      setIsOpen(newState);
      onOpenChange?.(newState);
    };

    useImperativeHandle(ref, () => ({
      toggle: () => handleOpenToggle(!isOpen),
    }));

    useEffect(() => {
      setCustomVal(value.toString());
    }, [value]);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          handleOpenToggle(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
      if (isOpen) {
        setTimeout(() => {
          inputRef.current?.focus();
          inputRef.current?.select();
        }, 50);
      }
    }, [isOpen]);

    const handleCustomSubmit = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const val = parseInt(customVal, 10);
      if (!isNaN(val) && val >= 1) {
        const sanitized = Math.min(999, Math.max(1, val));
        onChange(sanitized);
        setCustomVal(sanitized.toString());
      } else {
        setCustomVal(value.toString());
      }
    };

    return (
      <div
        ref={containerRef}
        className={`relative ${isOpen ? "z-50" : "z-auto"} ${className}`}
      >
        <button
          type="button"
          onClick={() => handleOpenToggle(!isOpen)}
          className={
            compact
              ? "flex items-center gap-1 bg-transparent text-xs font-mono font-bold text-on-surface hover:text-primary transition-colors focus:outline-none cursor-pointer py-0.5"
              : "w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm font-mono font-bold text-on-surface cursor-pointer flex justify-between items-center hover:border-primary/50 transition-colors focus:outline-none"
          }
        >
          <span>{value}x</span>
          <ChevronDown
            size={compact ? 12 : 14}
            className={`text-on-surface-variant transition-transform flex-shrink-0 ${isOpen ? "rotate-180 text-primary" : ""}`}
          />
        </button>

        {isOpen && (
          <div
            className={`absolute z-50 ${compact ? "right-0 sm:left-0 sm:right-auto" : "left-0 right-0 sm:right-auto"} ${openUpwards ? "bottom-full mb-1.5" : "top-full mt-1.5"} w-56 max-w-[calc(100vw-2.5rem)] bg-surface-container-high border border-outline-variant/40 rounded-xl shadow-2xl overflow-hidden p-3 flex flex-col gap-3 backdrop-blur-md`}
          >
            {/* Custom Input Inside Dropdown */}
            <div>
              <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-semibold mb-1.5 flex justify-between items-center">
                <span>Custom Repeats</span>
                <span className="text-primary font-bold">{value}x</span>
              </div>
              <form
                onSubmit={handleCustomSubmit}
                className="flex items-center gap-1.5"
              >
                <div className="relative flex-1 min-w-0">
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={customVal}
                    onChange={(e) => {
                      setCustomVal(e.target.value);
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 1) {
                        onChange(Math.min(999, val));
                      }
                    }}
                    onBlur={() => handleCustomSubmit()}
                    placeholder="e.g. 5"
                    className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-lg pl-2.5 pr-6 py-1.5 text-xs font-mono font-bold text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono text-on-surface-variant select-none pointer-events-none">
                    x
                  </span>
                </div>
                <button
                  type="submit"
                  onClick={() => {
                    handleCustomSubmit();
                    handleOpenToggle(false);
                  }}
                  className="px-2.5 py-1.5 bg-primary/15 hover:bg-primary/25 text-primary text-xs font-mono font-bold rounded-lg transition-colors border border-primary/20 cursor-pointer shrink-0"
                >
                  Done
                </button>
              </form>
            </div>

            <div className="h-px bg-outline-variant/25 w-full" />

            {/* Presets Inside Dropdown */}
            <div>
              <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-semibold mb-1.5">
                Presets
              </div>
              <div className="grid grid-cols-4 gap-1">
                {REPEAT_PRESETS.map((n) => {
                  const isSelected = value === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        onChange(n);
                        setCustomVal(n.toString());
                        handleOpenToggle(false);
                      }}
                      className={`px-1.5 py-1.5 rounded-md text-xs font-mono font-semibold text-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary text-on-primary font-bold shadow-sm"
                          : "bg-surface-container hover:bg-surface-container-highest text-on-surface hover:text-primary"
                      }`}
                    >
                      {n}x
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);

const SearchableSelect = ({
  value,
  options,
  onChange,
  onCancel,
  placeholder,
  labelFn,
  className = "",
  inline = false,
  autoOpen = false,
}: any) => {
  const [isOpen, setIsOpen] = useState(Boolean(autoOpen));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentOption =
    options.find((o: any) => (o.id || o.type || o) === value) || value;
  const currentLabel = labelFn(currentOption);
  const [query, setQuery] = useState(() => (inline ? currentLabel : ""));

  const filtered = options.filter((o: any) =>
    labelFn(o).toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (autoOpen) {
      setIsOpen(true);
      setQuery(currentLabel);
    }
  }, [autoOpen, currentLabel]);

  const resultsPanel = isOpen ? (
    <div
      className="absolute z-50 left-0 right-0 top-full mt-1 bg-surface border border-outline-variant/40 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-56"
      style={{ minWidth: "180px" }}
    >
      {!inline && (
        <div className="p-2 border-b border-outline-variant/30 flex items-center gap-2 bg-surface-container-low sticky top-0 z-10">
          <Search size={14} className="text-on-surface-variant shrink-0" />
          <input
            type="text"
            autoFocus
            className="placeholder:font-mono w-full bg-transparent text-sm focus:outline-none text-on-surface placeholder:text-on-surface-variant/60"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}
      <div className="overflow-y-auto p-1 bg-surface-container-lowest divide-y divide-outline-variant/10 max-h-48">
        {filtered.length === 0 ? (
          <div className="px-3 py-4 text-xs text-center text-on-surface-variant">
            No matches found
          </div>
        ) : (
          filtered.map((o: any, idx: number) => {
            const oValue = o.id || o.type || o;
            const isSelected = oValue === value;
            return (
              <div
                key={oValue || idx}
                className={`px-3 py-2 text-sm cursor-pointer rounded text-on-surface truncate flex justify-between items-center transition-colors ${isSelected ? "bg-primary/15 text-primary font-bold" : "hover:bg-surface-container-highest"}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(oValue, o);
                  setIsOpen(false);
                }}
              >
                <span className="truncate">{labelFn(o)}</span>
                {isSelected && (
                  <Check size={14} className="text-primary shrink-0 ml-1.5" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  ) : null;

  if (inline) {
    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <input
          type="text"
          autoFocus
          className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm font-bold text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
          placeholder={placeholder}
          value={query}
          onFocus={(e) => {
            e.currentTarget.select();
            setQuery(currentLabel);
            setIsOpen(true);
          }}
          onBlur={(e) => {
            if (!containerRef.current?.contains(e.relatedTarget as Node)) {
              setIsOpen(false);
              onCancel?.();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              setIsOpen(false);
              onCancel?.();
            }
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
        />
        {resultsPanel}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative ${isOpen ? "z-50" : "z-auto"} ${className}`}
    >
      <div
        className="w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm font-bold text-on-surface cursor-pointer flex justify-between items-center hover:border-primary/50 transition-colors"
        onClick={() => {
          setIsOpen(!isOpen);
          setQuery("");
        }}
      >
        <span className="truncate">{currentLabel}</span>
        <ChevronDown
          size={14}
          className="text-on-surface-variant flex-shrink-0 ml-2"
        />
      </div>
      {resultsPanel}
    </div>
  );
};

const SUGGESTED_PROGRESSIONS = [
  {
    name: "Pop Punk (I-V-vi-IV)",
    chords: [
      { r: "C", t: "major" },
      { r: "G", t: "major" },
      { r: "A", t: "minor" },
      { r: "F", t: "major" },
    ],
  },
  {
    name: "Jazz (ii-V-I)",
    chords: [
      { r: "D", t: "min7" },
      { r: "G", t: "7" },
      { r: "C", t: "maj7" },
    ],
  },
  {
    name: "50s (I-vi-IV-V)",
    chords: [
      { r: "C", t: "major" },
      { r: "A", t: "minor" },
      { r: "F", t: "major" },
      { r: "G", t: "major" },
    ],
  },
  {
    name: "Emotional (vi-IV-I-V)",
    chords: [
      { r: "A", t: "minor" },
      { r: "F", t: "major" },
      { r: "C", t: "major" },
      { r: "G", t: "major" },
    ],
  },
];

function getNextChordSuggestions(
  lastRoot: NoteName,
  lastType: string,
): { root: NoteName; type: string }[] {
  const rootIdx = NOTE_SEMITONES[lastRoot];
  const getNote = (offset: number) => {
    let idx = (rootIdx + offset) % 12;
    if (idx < 0) idx += 12;
    return CHROMATIC_SHARPS[idx] as NoteName;
  };

  if (lastType.includes("minor") || lastType === "m") {
    return [
      { root: getNote(3), type: "major" }, // Relative major
      { root: getNote(5), type: "minor" }, // iv
      { root: getNote(7), type: "minor" }, // v
      { root: getNote(8), type: "major" }, // VI
    ];
  }

  return [
    { root: getNote(5), type: "major" }, // IV
    { root: getNote(7), type: "major" }, // V
    { root: getNote(9), type: "minor" }, // vi (Relative minor)
    { root: getNote(2), type: "minor" }, // ii
  ];
}

const ALL_CHORDS_OPTIONS = ALL_ROOT_NOTES.flatMap((root) =>
  CHORD_TYPES_CATALOG.map((chord) => ({
    id: `${root}-${chord.type}`,
    root: root as NoteName,
    type: chord.type,
    name: chord.name,
    symbol: chord.symbol,
    label: `${root}${chord.symbol} - ${root} ${chord.name}`,
  })),
);

function buildKeyboardVoicing(
  root: NoteName,
  type: string,
  voicingIndex: number,
): KeyboardVoicing {
  const chordDefinition = getChordDefinition(root, type);
  const chordTypeInfo =
    CHORD_TYPES_CATALOG.find((chord) => chord.type === type) ||
    CHORD_TYPES_CATALOG[0];

  const noteCount = chordDefinition.notes.length;
  const rotation = noteCount > 0 ? voicingIndex % noteCount : 0;
  const octaveLayer = noteCount > 0 ? Math.floor(voicingIndex / noteCount) : 0;

  const getOrdinalSuffix = (num: number) => {
    const tens = num % 100;
    if (tens >= 11 && tens <= 13) return "th";
    switch (num % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  const inversionLabel =
    rotation === 0
      ? "Root Position"
      : `${rotation}${getOrdinalSuffix(rotation)} Inversion`;
  const layerLabel = octaveLayer > 0 ? ` (Octave ${octaveLayer + 1})` : "";
  const voicingName = `${root}${chordTypeInfo.symbol} ${inversionLabel}${layerLabel}`;
  const positionLabel = `${inversionLabel}${layerLabel}`;

  const rotatedNotes = [
    ...chordDefinition.notes.slice(rotation),
    ...chordDefinition.notes.slice(0, rotation),
  ];
  const rotatedDegrees = [
    ...chordTypeInfo.degrees.slice(rotation),
    ...chordTypeInfo.degrees.slice(0, rotation),
  ];

  let currentOctave = 3 + Math.floor(voicingIndex / Math.max(1, noteCount));
  let previousSemitone = NOTE_SEMITONES[rotatedNotes[0] || root];

  const notes = rotatedNotes.map((note, index) => {
    const semitone = NOTE_SEMITONES[note];
    if (index > 0 && semitone < previousSemitone) {
      currentOctave += 1;
    }
    previousSemitone = semitone;

    return {
      note,
      octave: currentOctave,
      degree:
        rotatedDegrees[index] || chordTypeInfo.degrees[index] || `${index + 1}`,
      isRoot: note === root,
      hand:
        index < Math.ceil(rotatedNotes.length / 2)
          ? ("LH" as const)
          : ("RH" as const),
    };
  });

  const bassNote = notes[0]?.note || root;
  const bassOctave = notes[0]?.octave || currentOctave;

  return {
    id: `${root}_${type}_keyboard_${voicingIndex}`,
    name: voicingName,
    shortLabel: positionLabel,
    category: rotation === 0 ? "root" : "inversion",
    positionLabel,
    bassNote,
    bassOctave,
    notes,
    startOctave: notes[0]?.octave || currentOctave,
    octavesCount: Math.max(2, Math.ceil(notes.length / 2)),
    description: `${positionLabel} keyboard voicing`,
  };
}

export const BuilderPage: React.FC = () => {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(120);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(-1);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const repeatsRefs = useRef<Record<string, { toggle: () => void } | null>>({});

  // New chord selection state
  const [selectedRoot, setSelectedRoot] = useState<NoteName>("C");
  const [selectedType, setSelectedType] = useState<string>("major");
  const [selectedDuration, setSelectedDuration] = useState<number>(4);
  const [selectedStyle, setSelectedStyle] = useState<string>("down");
  const [selectedRepeats, setSelectedRepeats] = useState<number>(1);
  const [selectedInstrument, setSelectedInstrument] = useState<string>(
    "acoustic_guitar_nylon",
  );
  const [reverbWet, setReverbWet] = useState<number>(30); // 0-100%
  const [isReverbActive, setIsReverbActive] = useState<boolean>(true);
  const [reverbSpace, setReverbSpace] = useState<"room" | "hall" | "ambient">(
    "hall",
  );

  const isKeyboardOrSynth = useMemo(() => {
    return (
      selectedInstrument.includes("piano") ||
      selectedInstrument.includes("grand") ||
      selectedInstrument.startsWith("synth_") ||
      selectedInstrument.includes("keys")
    );
  }, [selectedInstrument]);

  useEffect(() => {
    if (isKeyboardOrSynth) {
      if (!KEYBOARD_PLAYING_STYLES[selectedStyle]) {
        setSelectedStyle("sustained");
      }
    } else {
      if (!GUITAR_STRUM_PATTERNS[selectedStyle]) {
        setSelectedStyle("down");
      }
    }
  }, [isKeyboardOrSynth]);

  useEffect(() => {
    // Keep AudioEngine synchronized with active instrument
    audioEngine.setSelectedInstrument(selectedInstrument);

    // Load soundfonts depending on selection
    if (
      selectedInstrument.includes("piano") ||
      selectedInstrument.includes("grand") ||
      selectedInstrument === "electric_piano_1"
    ) {
      audioEngine.loadSoundfonts("acoustic_guitar_nylon", selectedInstrument);
    } else if (!selectedInstrument.startsWith("synth_")) {
      audioEngine.loadSoundfonts(selectedInstrument, "acoustic_grand_piano");
    }
  }, [selectedInstrument]);

  // Sync Reverb Parameters
  useEffect(() => {
    audioEngine.setReverbWet(reverbWet / 100);
  }, [reverbWet]);

  useEffect(() => {
    audioEngine.setReverbEnabled(isReverbActive);
  }, [isReverbActive]);

  useEffect(() => {
    const decayTimes = { room: 1.2, hall: 2.4, ambient: 4.5 };
    audioEngine.setReverbDecay(decayTimes[reverbSpace]);
  }, [reverbSpace]);

  const queueRef = useRef(queue);
  queueRef.current = queue;

  const stateRef = useRef({
    isPlaying,
    currentIndex: 0,
    currentRepeat: 0,
    tempo: 120,
    instrument: selectedInstrument,
  });

  stateRef.current.isPlaying = isPlaying;
  stateRef.current.tempo = tempo;
  stateRef.current.instrument = selectedInstrument;

  useEffect(() => {
    let timeoutId: number;

    const playNext = () => {
      const state = stateRef.current;
      const q = queueRef.current;

      if (!state.isPlaying) return;

      if (q.length === 0) {
        setIsPlaying(false);
        setCurrentQueueIndex(-1);
        return;
      }

      // Ensure index is valid
      if (state.currentIndex >= q.length) {
        state.currentIndex = 0;
        state.currentRepeat = 0;
      }

      const item = q[state.currentIndex];

      // Update UI state safely
      setCurrentQueueIndex(state.currentIndex);
      setCurrentRepeat(state.currentRepeat);

      // Play the chord
      const chordDef = getChordDefinition(item.root, item.type);

      let notesToPlay: { note: NoteName; octave: number }[] = [];
      const tuning = GUITAR_TUNINGS[0];

      if (
        item.voicingIndex !== undefined &&
        chordDef.voicings[item.voicingIndex]
      ) {
        const voicing = chordDef.voicings[item.voicingIndex];
        voicing.frets.forEach((fret, stringIdx) => {
          if (fret === null) return;
          const openNote = tuning.strings[stringIdx];
          const baseOct = tuning.octaves[stringIdx];
          const openSemi = NOTE_SEMITONES[openNote];
          const totalSemi = openSemi + fret;
          const currentSemi = totalSemi % 12;
          const noteName = CHROMATIC_SHARPS[currentSemi] as NoteName;
          const oct =
            baseOct + Math.floor(totalSemi / 12) - Math.floor(openSemi / 12);
          notesToPlay.push({ note: noteName, octave: oct });
        });
      } else {
        notesToPlay = chordDef.notes.map((n, idx) => {
          const semitones = chordDef.intervals[idx];
          const octave = 3 + Math.floor(semitones / 12);
          return { note: n as NoteName, octave };
        });
      }

      const itemDurationBeats = item.duration || 4;
      const beatDurationSec = 60 / state.tempo;
      const durationMs = itemDurationBeats * beatDurationSec * 1000;

      const activeInst = state.instrument || selectedInstrument;
      const isInstKeyboard =
        activeInst.includes("piano") ||
        activeInst.includes("grand") ||
        activeInst.startsWith("synth_") ||
        activeInst.includes("keys");
      const styleDef = getPlayingStyle(item.style, isInstKeyboard);
      const strokes = styleDef.getStrokes(itemDurationBeats);

      // Calculate appropriate ring time per stroke so notes do not pile up or drone
      const strokeDurationSec = Math.min(
        Math.max(
          0.4,
          (itemDurationBeats / Math.max(1, strokes.length)) *
            beatDurationSec *
            1.5,
        ),
        2.5,
      );

      const getPitch = (n: { note: NoteName; octave: number }) =>
        n.octave * 12 + (NOTE_SEMITONES[n.note] || 0);
      const sortedAscendingNotes = [...notesToPlay].sort(
        (a, b) => getPitch(a) - getPitch(b),
      );
      const sortedDescendingNotes = [...notesToPlay].sort(
        (a, b) => getPitch(b) - getPitch(a),
      );

      strokes.forEach((action) => {
        const globalOffsetSec = action.beat * beatDurationSec;

        if (action.type === "arpeggio" || action.type === "arpeggio_up") {
          // Play each pitch in ascending order spaced melodically across the chord duration
          const durationForArp = Math.max(
            0.6,
            Math.min(itemDurationBeats * beatDurationSec * 0.85, 2.0),
          );
          const staggerSec =
            durationForArp / Math.max(1, sortedAscendingNotes.length);
          audioEngine.playChordArpeggio(
            sortedAscendingNotes,
            activeInst,
            staggerSec,
            globalOffsetSec,
            strokeDurationSec,
          );
        } else if (action.type === "arpeggio_down") {
          // Play each pitch in descending cascading order spaced melodically
          const durationForArp = Math.max(
            0.6,
            Math.min(itemDurationBeats * beatDurationSec * 0.85, 2.0),
          );
          const staggerSec =
            durationForArp / Math.max(1, sortedDescendingNotes.length);
          audioEngine.playChordArpeggio(
            sortedDescendingNotes,
            activeInst,
            staggerSec,
            globalOffsetSec,
            strokeDurationSec,
          );
        } else if (action.type === "arpeggio_step") {
          // Rhythmic step arpeggio (e.g. 8th or 16th note continuous cycle through chord tones)
          const notesList =
            sortedAscendingNotes.length > 0
              ? sortedAscendingNotes
              : notesToPlay;
          const cycleLen =
            notesList.length > 2 ? notesList.length * 2 - 2 : notesList.length;
          const stepIdx = action.subIndex ?? 0;
          const mappedIdx =
            notesList.length > 2
              ? stepIdx % cycleLen < notesList.length
                ? stepIdx % cycleLen
                : cycleLen - (stepIdx % cycleLen)
              : stepIdx % notesList.length;
          const notePick = notesList[mappedIdx];
          if (notePick) {
            audioEngine.playSingleInstrumentNote(
              notePick.note,
              notePick.octave,
              strokeDurationSec,
              globalOffsetSec,
              activeInst,
            );
          }
        } else if (action.type === "bass_only") {
          const lowestNote = sortedAscendingNotes[0] || notesToPlay[0];
          if (lowestNote) {
            const bassOctave = Math.max(1, lowestNote.octave - 1);
            audioEngine.playSingleInstrumentNote(
              lowestNote.note,
              bassOctave,
              strokeDurationSec,
              globalOffsetSec,
              activeInst,
            );
          }
        } else if (action.type === "chords_only") {
          const chordNotes =
            sortedAscendingNotes.length > 1
              ? sortedAscendingNotes.slice(1)
              : sortedAscendingNotes;
          const staggerSec = isInstKeyboard ? 0.008 : 0.025;
          audioEngine.playChordArpeggio(
            chordNotes,
            activeInst,
            staggerSec,
            globalOffsetSec,
            strokeDurationSec,
          );
        } else if (action.type === "alberti") {
          const notesList =
            sortedAscendingNotes.length > 0
              ? sortedAscendingNotes
              : notesToPlay;
          const order = [
            0,
            notesList.length - 1,
            Math.max(0, Math.floor((notesList.length - 1) / 2)),
            notesList.length - 1,
          ];
          const subIdx = action.subIndex ?? 0;
          const notePick =
            notesList[order[subIdx % order.length] % notesList.length];
          if (notePick) {
            audioEngine.playSingleInstrumentNote(
              notePick.note,
              notePick.octave,
              strokeDurationSec,
              globalOffsetSec,
              activeInst,
            );
          }
        } else {
          const staggerSec = isInstKeyboard ? 0.008 : 0.03;
          const notesArg =
            action.type === "up" ? [...notesToPlay].reverse() : notesToPlay;
          audioEngine.playChordArpeggio(
            notesArg,
            activeInst,
            staggerSec,
            globalOffsetSec,
            strokeDurationSec,
          );
        }
      });

      timeoutId = window.setTimeout(() => {
        state.currentRepeat++;
        if (state.currentRepeat >= item.repeats) {
          state.currentRepeat = 0;
          state.currentIndex++;
          if (state.currentIndex >= queueRef.current.length) {
            state.currentIndex = 0; // Loop back
          }
        }
        playNext();
      }, durationMs);
    };

    if (isPlaying) {
      // Start immediately if it wasn't playing
      if (currentQueueIndex === -1 && queueRef.current.length > 0) {
        stateRef.current.currentIndex = 0;
        stateRef.current.currentRepeat = 0;
      }
      playNext();
    } else {
      audioEngine.stopAllNotes();
      setCurrentQueueIndex(-1);
      stateRef.current.currentIndex = 0;
      stateRef.current.currentRepeat = 0;
    }

    return () => {
      clearTimeout(timeoutId);
      audioEngine.stopAllNotes();
    };
  }, [isPlaying]);

  const handlePreviewChord = (
    root: NoteName,
    type: string,
    voicingIndex?: number,
  ) => {
    const chordDef = getChordDefinition(root, type);
    const voicing =
      voicingIndex !== undefined && chordDef.voicings[voicingIndex]
        ? chordDef.voicings[voicingIndex]
        : chordDef.voicings[0];

    const notesToPlay: { note: string; octave: number }[] = [];
    const tuning = GUITAR_TUNINGS[0];

    if (voicing) {
      voicing.frets.forEach((fret, stringIdx) => {
        if (fret === null) return;
        const openNote = tuning.strings[stringIdx];
        const baseOct = tuning.octaves[stringIdx];
        const openSemi = NOTE_SEMITONES[openNote];
        const totalSemi = openSemi + fret;
        const currentSemi = totalSemi % 12;
        const noteName = CHROMATIC_SHARPS[currentSemi];
        const oct =
          baseOct + Math.floor(totalSemi / 12) - Math.floor(openSemi / 12);
        notesToPlay.push({ note: noteName, octave: oct });
      });
    } else {
      chordDef.notes.forEach((n, idx) => {
        const semitones = chordDef.intervals[idx] || 0;
        const octave = 3 + Math.floor(semitones / 12);
        notesToPlay.push({ note: n, octave });
      });
    }

    const isKeyboardOrSynth =
      selectedInstrument.includes("piano") ||
      selectedInstrument.includes("grand") ||
      selectedInstrument.includes("synth");
    const stagger = isKeyboardOrSynth ? 0.015 : 0.04;
    audioEngine.playChordArpeggio(notesToPlay, selectedInstrument, stagger);
  };

  const handleAddChord = (voicingIndex: number) => {
    const newItem: QueueItem = {
      id: generateId(),
      root: selectedRoot,
      type: selectedType,
      duration: selectedDuration,
      repeats: selectedRepeats,
      style: selectedStyle,
      voicingIndex,
    };
    setQueue((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    setQueue((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const handleDuplicateItem = (index: number) => {
    setQueue((prev) => {
      const next = [...prev];
      const itemToDup = { ...next[index], id: generateId() };
      next.splice(index + 1, 0, itemToDup);
      return next;
    });
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
    setQueue((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleUpdateItem = (index: number, updates: Partial<QueueItem>) => {
    setQueue((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
      {/* Header - Global Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-surface-container p-2.5 rounded-xl border border-outline-variant/30">
          {/* Instrument Selector */}
          <div className="flex flex-col px-2 border-b sm:border-b-0 sm:border-r border-outline-variant/30 pb-2 sm:pb-0">
            <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider mb-1">
              Instrument
            </span>
            <div className="flex flex-col gap-1">
              <select
                value={
                  selectedInstrument.endsWith(".sf2")
                    ? "custom"
                    : selectedInstrument
                }
                onChange={(e) =>
                  setSelectedInstrument(
                    e.target.value === "custom"
                      ? "/zanderJazz.sf2"
                      : e.target.value,
                  )
                }
                className="font-mono bg-surface border border-outline-variant/30 rounded-lg px-2.5 py-1 text-sm font-bold text-on-surface focus:outline-none focus:border-primary/50 cursor-pointer w-full max-w-[210px]"
              >
                <optgroup label="Guitars">
                  <option value="acoustic_guitar_nylon">
                    Nylon Acoustic Guitar
                  </option>
                  <option value="acoustic_guitar_steel">
                    Steel Acoustic Guitar
                  </option>
                  <option value="electric_guitar_clean">
                    Clean Electric Guitar
                  </option>
                  <option value="electric_guitar_jazz">
                    Jazz Electric Guitar
                  </option>
                  <option value="overdriven_guitar">Overdriven Guitar</option>
                  <option value="distortion_guitar">Distortion Guitar</option>
                </optgroup>
                <optgroup label="Pianos & Keys">
                  <option value="acoustic_grand_piano">
                    Acoustic Grand Piano
                  </option>
                  <option value="electric_piano_1">
                    Electric Piano (Rhodes)
                  </option>
                </optgroup>
                <optgroup label="Synthesizers">
                  <option value="synth_poly">Analog Poly Synth</option>
                  <option value="synth_pad">Warm Synth Pad</option>
                  <option value="synth_lead">Punchy Synth Lead</option>
                </optgroup>
                <optgroup label="Custom">
                  <option value="custom">Custom .sf2 URL</option>
                </optgroup>
              </select>
              {selectedInstrument.endsWith(".sf2") && (
                <input
                  type="text"
                  value={selectedInstrument}
                  onChange={(e) => setSelectedInstrument(e.target.value)}
                  placeholder="e.g. /my-soundfont.sf2"
                  className="bg-surface border border-outline-variant/30 rounded-lg px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary/50 w-full max-w-[210px]"
                />
              )}
            </div>
          </div>

          {/* Reverb Controls */}
          <div className="flex flex-col px-2 border-b sm:border-b-0 sm:border-r border-outline-variant/30 pb-2 sm:pb-0">
            <div className="flex items-center justify-between mb-1 gap-2">
              <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                <Waves
                  size={11}
                  className={
                    isReverbActive
                      ? "text-primary"
                      : "text-on-surface-variant/50"
                  }
                />
                Reverb
              </span>
              <button
                type="button"
                onClick={() => setIsReverbActive(!isReverbActive)}
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase transition-colors cursor-pointer ${
                  isReverbActive
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-surface-container-highest text-on-surface-variant border border-outline-variant/20"
                }`}
                title="Toggle Reverb Effect"
              >
                {isReverbActive ? "ON" : "BYPASS"}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={isReverbActive ? reverbWet : 0}
                disabled={!isReverbActive}
                onChange={(e) => setReverbWet(Number(e.target.value))}
                className={`w-20 accent-primary ${!isReverbActive ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                title={`Reverb Mix: ${reverbWet}%`}
              />
              <span className="font-mono text-xs w-7 text-right font-semibold text-on-surface">
                {isReverbActive ? `${reverbWet}%` : "Off"}
              </span>

              <select
                value={reverbSpace}
                disabled={!isReverbActive}
                onChange={(e) =>
                  setReverbSpace(e.target.value as "room" | "hall" | "ambient")
                }
                className={`bg-surface border border-outline-variant/30 rounded px-1.5 py-0.5 text-xs font-mono text-on-surface focus:outline-none cursor-pointer ${
                  !isReverbActive ? "opacity-40 cursor-not-allowed" : ""
                }`}
                title="Reverb Space Type"
              >
                <option value="room">Room</option>
                <option value="hall">Hall</option>
                <option value="ambient">Ambient</option>
              </select>
            </div>
          </div>

          {/* Tempo Controls */}
          <div className="flex flex-col items-center px-2 border-r border-outline-variant/30">
            <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider mb-1">
              Tempo
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="60"
                max="240"
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="w-20 sm:w-24 accent-primary"
              />
              <span className="font-mono text-sm w-8 text-right font-bold">
                {tempo}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-1">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={queue.length === 0}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                isPlaying
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : queue.length === 0
                    ? "bg-surface-container-highest text-on-surface-variant opacity-50 cursor-not-allowed"
                    : "bg-surface-container-highest hover:bg-surface-container-highest/80 text-on-surface hover:text-primary border border-outline-variant/30"
              }`}
              title={isPlaying ? "Pause" : "Play Loop"}
            >
              {isPlaying ? (
                <Pause size={20} fill="currentColor" />
              ) : (
                <Play size={20} fill="currentColor" className="ml-1" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Queue Management */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
              <Guitar size={20} className="text-primary" />
              Progression Queue
            </h2>
            <div className="text-xs font-mono text-on-surface-variant bg-surface-container px-2 py-1 rounded">
              {queue.length} CHORDS
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl flex flex-col overflow-hidden min-h-[400px]">
            {queue.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-on-surface-variant">
                <Music size={48} className="mb-4 opacity-20" />
                <p className="text-lg font-bold text-on-surface mb-2">
                  Queue is empty
                </p>
                <p className="text-sm max-w-sm">
                  Use the builder panel on the right to search and add chords to
                  your progression.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 pb-32 space-y-3">
                {queue.map((item, index) => {
                  const isActive = currentQueueIndex === index;
                  const isEditing = editingItemId === item.id;
                  const isDragging = draggedIndex === index;
                  const isDragOver =
                    dragOverIndex === index && draggedIndex !== index;

                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => {
                        const target = e.target as HTMLElement;
                        if (
                          target.tagName === "INPUT" ||
                          target.tagName === "SELECT" ||
                          target.tagName === "BUTTON"
                        ) {
                          e.preventDefault();
                          return;
                        }
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", index.toString());
                        setDraggedIndex(index);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        if (dragOverIndex !== index) {
                          setDragOverIndex(index);
                        }
                      }}
                      onDragLeave={() => {
                        if (dragOverIndex === index) {
                          setDragOverIndex(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedIndex !== null && draggedIndex !== index) {
                          handleReorder(draggedIndex, index);
                        }
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      onDragEnd={() => {
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      style={{
                        zIndex:
                          openDropdownId === item.id
                            ? 5000
                            : (isDragging ? 3000 : isEditing ? 2000 : 1000) -
                              index,
                      }}
                      className={`flex flex-col sm:flex-row gap-4 p-4 rounded-xl border transition-all relative ${
                        isDragging
                          ? "opacity-40 border-dashed border-primary scale-[0.98]"
                          : isDragOver
                            ? "ring-2 ring-primary bg-primary/10 border-primary scale-[1.01]"
                            : isEditing
                              ? "ring-2 ring-primary/40 shadow-lg"
                              : ""
                      } ${
                        isActive
                          ? "bg-primary/5 border-primary shadow-sm scale-[1.01]"
                          : "bg-surface border-outline-variant/30 hover:border-outline-variant/60"
                      }`}
                    >
                      {/* Drag Handle & Step Indicator */}
                      <div
                        className="flex sm:flex-col items-center justify-between sm:justify-center gap-1.5 shrink-0 cursor-grab active:cursor-grabbing text-on-surface-variant hover:text-primary transition-colors py-0.5 group/drag select-none"
                        title="Drag to reorder chord"
                      >
                        <div className="p-1 rounded bg-surface-container/60 group-hover/drag:bg-surface-container-highest group-hover/drag:text-primary transition-colors flex items-center justify-center">
                          <GripVertical
                            size={16}
                            className="text-on-surface-variant group-hover/drag:text-primary transition-colors"
                          />
                        </div>
                        {isActive ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--color-primary),0.8)]" />
                        ) : (
                          <div className="text-[10px] font-mono text-on-surface-variant w-4 text-center font-bold">
                            {index + 1}
                          </div>
                        )}
                      </div>

                      {/* Chord Info */}
                      <div className="flex-1 flex flex-col justify-center">
                        {editingItemId === item.id ? (
                          <div className="font-mono mb-1 max-w-sm">
                            <SearchableSelect
                              value={`${item.root}-${item.type}`}
                              options={ALL_CHORDS_OPTIONS}
                              onChange={(val: string, obj: any) => {
                                handleUpdateItem(index, {
                                  root: obj.root,
                                  type: obj.type,
                                  voicingIndex: undefined,
                                });
                                setEditingItemId(null);
                              }}
                              onCancel={() => setEditingItemId(null)}
                              labelFn={(v: any) => v.label}
                              placeholder="Search any chord (e.g. Cmaj7)..."
                              className="w-full"
                              inline={true}
                              autoOpen={true}
                            />
                          </div>
                        ) : (
                          <div
                            className="flex items-baseline gap-2 mb-1 cursor-pointer hover:bg-surface-container-highest px-2 -mx-2 rounded transition-colors group/edit"
                            onClick={() => setEditingItemId(item.id)}
                            title="Click to edit chord"
                          >
                            <h3
                              className={`text-2xl font-bold tracking-tight ${isActive ? "text-primary" : "text-on-surface"}`}
                            >
                              {item.root}
                              {
                                CHORD_TYPES_CATALOG.find(
                                  (c) => c.type === item.type,
                                )?.symbol
                              }
                            </h3>
                            <span className="text-xs text-on-surface-variant font-mono">
                              {item.voicingIndex !== undefined
                                ? getChordDefinition(item.root, item.type)
                                    .voicings[item.voicingIndex]?.name
                                : CHORD_TYPES_CATALOG.find(
                                    (c) => c.type === item.type,
                                  )?.name}
                            </span>
                            <Settings2
                              size={14}
                              className="opacity-0 group-hover/edit:opacity-100 text-on-surface-variant transition-opacity ml-1"
                            />
                          </div>
                        )}

                        {/* Inline Edit Controls */}
                        <div className="flex flex-wrap items-center gap-2 mt-2 max-w-full">
                          {/* Duration (Note Length) */}
                          <div
                            className="flex items-center gap-1.5 bg-surface-container px-2 py-1 rounded-lg border border-outline-variant/20 min-w-0 cursor-pointer"
                            onClick={(e) => {
                              const select = (
                                e.currentTarget as HTMLElement
                              ).querySelector("select");
                              if (select && e.target !== select) {
                                try {
                                  select.showPicker();
                                } catch {
                                  select.focus();
                                }
                              }
                            }}
                          >
                            <span className="text-[10px] font-mono text-on-surface-variant uppercase font-semibold shrink-0 hover:text-primary transition-colors">
                              Duration
                            </span>
                            <select
                              value={item.duration || 4}
                              onChange={(e) =>
                                handleUpdateItem(index, {
                                  duration: Number(e.target.value),
                                })
                              }
                              className="bg-transparent text-xs font-mono font-semibold text-on-surface focus:outline-none cursor-pointer max-w-[110px] sm:max-w-none truncate"
                            >
                              {DURATION_OPTIONS.map((d) => (
                                <option key={d.value} value={d.value}>
                                  {d.shortLabel}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Strum / Playing Style */}
                          <div
                            className="flex items-center gap-1.5 bg-surface-container px-2 py-1 rounded-lg border border-outline-variant/20 min-w-0 cursor-pointer"
                            onClick={(e) => {
                              const select = (
                                e.currentTarget as HTMLElement
                              ).querySelector("select");
                              if (select && e.target !== select) {
                                try {
                                  select.showPicker();
                                } catch {
                                  select.focus();
                                }
                              }
                            }}
                          >
                            <span className="text-[10px] font-mono text-on-surface-variant uppercase font-semibold shrink-0 hover:text-primary transition-colors">
                              {isKeyboardOrSynth ? "Style" : "Strum"}
                            </span>
                            <select
                              value={item.style}
                              onChange={(e) =>
                                handleUpdateItem(index, {
                                  style: e.target.value,
                                })
                              }
                              className="bg-transparent text-xs font-mono font-semibold text-on-surface focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[200px] truncate"
                            >
                              {(isKeyboardOrSynth
                                ? Object.entries(KEYBOARD_PLAYING_STYLES)
                                : Object.entries(GUITAR_STRUM_PATTERNS)
                              ).map(([key, style]) => (
                                <option key={key} value={key}>
                                  {style.shortLabel || style.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Repeats */}
                          <div className="flex items-center gap-1.5 bg-surface-container px-2 py-1 rounded-lg border border-outline-variant/20 shrink-0">
                            <span
                              className="text-[10px] font-mono text-on-surface-variant uppercase font-semibold shrink-0 cursor-pointer hover:text-primary transition-colors"
                              onClick={() =>
                                repeatsRefs.current[item.id]?.toggle()
                              }
                            >
                              Repeats
                            </span>
                            <RepeatsDropdown
                              ref={(el) => {
                                repeatsRefs.current[item.id] = el;
                              }}
                              value={item.repeats}
                              onChange={(val) =>
                                handleUpdateItem(index, { repeats: val })
                              }
                              compact={true}
                              openUpwards={
                                index >= queue.length - 2 && queue.length > 2
                              }
                              onOpenChange={(isOpen) =>
                                setOpenDropdownId(isOpen ? item.id : null)
                              }
                            />
                            {isActive && item.repeats > 1 && (
                              <span className="text-[10px] font-mono text-primary font-bold bg-primary/10 px-1 rounded shrink-0">
                                ({currentRepeat + 1}/{item.repeats})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-col items-center justify-end sm:justify-start gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-outline-variant/30 pt-3 sm:pt-0 sm:pl-4">
                        <button
                          onClick={() =>
                            handlePreviewChord(
                              item.root,
                              item.type,
                              item.voicingIndex,
                            )
                          }
                          className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                          title="Preview Chord Sound"
                        >
                          <Volume2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDuplicateItem(index)}
                          className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                          title="Duplicate Chord"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-colors"
                          title="Remove Chord"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Builder Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-on-surface flex items-center gap-2 mt-2">
            <Settings2 size={20} className="text-primary" />
            Add to Queue
          </h2>

          <div className=" bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 flex flex-col gap-5">
            {/* Unified Chord Search */}
            <div>
              <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-wider mb-1.5">
                Search Chord
              </label>
              <SearchableSelect
                value={`${selectedRoot}-${selectedType}`}
                options={ALL_CHORDS_OPTIONS}
                onChange={(val: string, obj: any) => {
                  setSelectedRoot(obj.root);
                  setSelectedType(obj.type);
                }}
                labelFn={(v: any) => v.label}
                placeholder="Search any chord (e.g. Cmaj7)..."
              />
            </div>

            {/* Contextual Suggestions */}
            {queue.length > 0 && (
              <div className="flex flex-col gap-2 p-3 bg-surface border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <Lightbulb size={14} />
                  <span>Suggested Next Chords</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getNextChordSuggestions(
                    queue[queue.length - 1].root,
                    queue[queue.length - 1].type,
                  ).map((sugg, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedRoot(sugg.root);
                        setSelectedType(sugg.type);
                      }}
                      className="text-xs font-mono bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded transition-colors"
                    >
                      {sugg.root}
                      {
                        CHORD_TYPES_CATALOG.find((c) => c.type === sugg.type)
                          ?.symbol
                      }
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Playback Settings */}
            <div className="flex flex-col gap-3 min-w-0">
              <div className="grid grid-cols-2 gap-3 min-w-0">
                {/* Note Duration */}
                <div className="min-w-0">
                  <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-wider mb-1.5 truncate">
                    Duration
                  </label>
                  <select
                    value={selectedDuration}
                    onChange={(e) =>
                      setSelectedDuration(Number(e.target.value))
                    }
                    className="w-full max-w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors cursor-pointer truncate"
                  >
                    {DURATION_OPTIONS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Repeats */}
                <div className="min-w-0">
                  <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-wider mb-1.5 truncate">
                    Repeats
                  </label>
                  <RepeatsDropdown
                    value={selectedRepeats}
                    onChange={setSelectedRepeats}
                  />
                </div>
              </div>

              {/* Strum / Playing Style */}
              <div className="min-w-0">
                <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-wider mb-1.5 truncate">
                  {isKeyboardOrSynth
                    ? "Keyboard & Rhythm Style"
                    : "Strumming Pattern"}
                </label>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="w-full max-w-full bg-surface border border-outline-variant/30 rounded-lg px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors cursor-pointer truncate"
                >
                  {(isKeyboardOrSynth
                    ? Object.entries(KEYBOARD_PLAYING_STYLES)
                    : Object.entries(GUITAR_STRUM_PATTERNS)
                  ).map(([key, style]) => (
                    <option key={key} value={key}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="h-px bg-outline-variant/30 w-full" />

            {/* Voicings List */}
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-[10px] font-mono text-on-surface-variant uppercase tracking-wider">
                  Variations (Click to Add)
                </label>
                <button
                  onClick={() => handlePreviewChord(selectedRoot, selectedType)}
                  className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-semibold px-2 py-0.5 rounded hover:bg-primary/10 transition-colors"
                  title="Preview chord in selected instrument"
                >
                  <Volume2 size={13} />
                  <span>Audition</span>
                </button>
              </div>

              <div className="flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-1 pb-1">
                {getChordDefinition(selectedRoot, selectedType).voicings.map(
                  (voicing, idx) => (
                    <div key={idx} className="relative group/voicing">
                      {isKeyboardOrSynth ? (
                        <KeyboardChordDiagram
                          chordName={
                            getChordDefinition(selectedRoot, selectedType).name
                          }
                          voicing={buildKeyboardVoicing(
                            selectedRoot,
                            selectedType,
                            idx,
                          )}
                          root={selectedRoot}
                          instrument={selectedInstrument}
                        />
                      ) : (
                        <ChordDiagram
                          chordName={
                            getChordDefinition(selectedRoot, selectedType).name
                          }
                          voicing={voicing}
                          root={selectedRoot}
                        />
                      )}
                      <div className="absolute inset-0 bg-surface-container-highest/60 backdrop-blur-[2px] opacity-0 group-hover/voicing:opacity-100 transition-opacity rounded-xl flex items-center justify-center pointer-events-none">
                        <button
                          onClick={() => handleAddChord(idx)}
                          className="pointer-events-auto flex items-center gap-2 bg-primary text-on-primary font-bold px-4 py-2.5 rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
                        >
                          <Plus size={16} strokeWidth={3} />
                          ADD VOICING
                        </button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
