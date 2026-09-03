import { NoteName, ScaleDefinition, Tuning } from "../types";

export const CHROMATIC_SHARPS: NoteName[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
export const CHROMATIC_FLATS: NoteName[] = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

export const ALL_ROOT_NOTES: NoteName[] = [
  "C",
  "C#",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

export const ENHARMONIC_MAP: {
  [key in NoteName]?: { sharp: string; flat: string; display: string };
} = {
  C: { sharp: "C", flat: "C", display: "C" },
  "C#": { sharp: "C#", flat: "Db", display: "C# / Db" },
  Db: { sharp: "C#", flat: "Db", display: "Db / C#" },
  D: { sharp: "D", flat: "D", display: "D" },
  "D#": { sharp: "D#", flat: "Eb", display: "D# / Eb" },
  Eb: { sharp: "D#", flat: "Eb", display: "Eb / D#" },
  E: { sharp: "E", flat: "E", display: "E" },
  F: { sharp: "F", flat: "F", display: "F" },
  "F#": { sharp: "F#", flat: "Gb", display: "F# / Gb" },
  Gb: { sharp: "F#", flat: "Gb", display: "Gb / F#" },
  G: { sharp: "G", flat: "G", display: "G" },
  "G#": { sharp: "G#", flat: "Ab", display: "G# / Ab" },
  Ab: { sharp: "G#", flat: "Ab", display: "Ab / G#" },
  A: { sharp: "A", flat: "A", display: "A" },
  "A#": { sharp: "A#", flat: "Bb", display: "A# / Bb" },
  Bb: { sharp: "A#", flat: "Bb", display: "Bb / A#" },
  B: { sharp: "B", flat: "B", display: "B" },
};

export const NOTE_SEMITONES: { [key in NoteName]: number } = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

export const INTERVAL_NAMES_MAP: { [semitones: number]: string } = {
  0: "R",
  1: "m2",
  2: "M2",
  3: "m3",
  4: "M3",
  5: "P4",
  6: "b5",
  7: "P5",
  8: "m6",
  9: "M6",
  10: "m7",
  11: "M7",
};

export const DEGREE_COLORS: {
  [key: string]: { bg: string; text: string; border: string; label: string };
} = {
  "1": {
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/50",
    label: "Root",
  },
  R: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/50",
    label: "Root",
  },
  "3": {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500/50",
    label: "3rd",
  },
  b3: {
    bg: "bg-blue-500/20",
    text: "text-blue-300",
    border: "border-blue-400/50",
    label: "min 3rd",
  },
  M3: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500/50",
    label: "Maj 3rd",
  },
  m3: {
    bg: "bg-blue-500/20",
    text: "text-blue-300",
    border: "border-blue-400/50",
    label: "min 3rd",
  },
  "5": {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/50",
    label: "5th",
  },
  P5: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/50",
    label: "Perf 5th",
  },
  b5: {
    bg: "bg-yellow-500/20",
    text: "text-yellow-400",
    border: "border-yellow-500/50",
    label: "Dim 5th",
  },
  "7": {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    border: "border-purple-500/50",
    label: "7th",
  },
  b7: {
    bg: "bg-purple-500/20",
    text: "text-purple-300",
    border: "border-purple-400/50",
    label: "min 7th",
  },
  M7: {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    border: "border-purple-500/50",
    label: "Maj 7th",
  },
  m7: {
    bg: "bg-purple-500/20",
    text: "text-purple-300",
    border: "border-purple-400/50",
    label: "min 7th",
  },
  "2": {
    bg: "bg-cyan-500/20",
    text: "text-cyan-400",
    border: "border-cyan-500/50",
    label: "2nd",
  },
  M2: {
    bg: "bg-cyan-500/20",
    text: "text-cyan-400",
    border: "border-cyan-500/50",
    label: "Maj 2nd",
  },
  m2: {
    bg: "bg-cyan-500/20",
    text: "text-cyan-300",
    border: "border-cyan-400/50",
    label: "min 2nd",
  },
  "4": {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    border: "border-amber-500/50",
    label: "4th",
  },
  P4: {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    border: "border-amber-500/50",
    label: "Perf 4th",
  },
  "6": {
    bg: "bg-teal-500/20",
    text: "text-teal-400",
    border: "border-teal-500/50",
    label: "6th",
  },
  M6: {
    bg: "bg-teal-500/20",
    text: "text-teal-400",
    border: "border-teal-500/50",
    label: "Maj 6th",
  },
  m6: {
    bg: "bg-teal-500/20",
    text: "text-teal-300",
    border: "border-teal-400/50",
    label: "min 6th",
  },
  b6: {
    bg: "bg-teal-500/20",
    text: "text-teal-300",
    border: "border-teal-400/50",
    label: "min 6th",
  },
  default: {
    bg: "bg-surface-container",
    text: "text-on-surface",
    border: "border-outline-variant/30",
    label: "Note",
  },
};

export const GUITAR_TUNINGS: Tuning[] = [
  {
    name: "E Standard",
    strings: ["E", "A", "D", "G", "B", "E"],
    octaves: [2, 2, 3, 3, 3, 4],
  },
  {
    name: "Drop D",
    strings: ["D", "A", "D", "G", "B", "E"],
    octaves: [2, 2, 3, 3, 3, 4],
  },
  {
    name: "Open G",
    strings: ["D", "G", "D", "G", "B", "D"],
    octaves: [2, 2, 3, 3, 3, 4],
  },
  {
    name: "Open D",
    strings: ["D", "A", "D", "F#", "A", "D"],
    octaves: [2, 2, 3, 3, 3, 4],
  },
  {
    name: "DADGAD",
    strings: ["D", "A", "D", "G", "A", "D"],
    octaves: [2, 2, 3, 3, 3, 4],
  },
  {
    name: "Half-Step Down (Eb)",
    strings: ["Eb", "Ab", "Db", "Gb", "Bb", "Eb"],
    octaves: [2, 2, 3, 3, 3, 4],
  },
  {
    name: "Full-Step Down (D)",
    strings: ["D", "G", "C", "F", "A", "D"],
    octaves: [2, 2, 3, 3, 3, 4],
  },
  {
    name: "Open C",
    strings: ["C", "G", "C", "G", "C", "E"],
    octaves: [2, 2, 3, 3, 4, 4],
  },
];

export const SCALES_DATABASE: ScaleDefinition[] = [
  {
    id: "major",
    name: "Major (Ionian)",
    category: "Major & Minor",
    intervals: [0, 2, 4, 5, 7, 9, 11],
    formula: "W W H W W W H",
    degrees: ["1", "2", "3", "4", "5", "6", "7"],
    intervalsNamed: ["R", "M2", "M3", "P4", "P5", "M6", "M7"],
    cagedBoxes: {
      "Pattern 1 (E-Shape)": { startFretOffset: -1, endFretOffset: 2 },
      "Pattern 2 (D-Shape)": { startFretOffset: 1, endFretOffset: 5 },
      "Pattern 3 (C-Shape)": { startFretOffset: 4, endFretOffset: 7 },
      "Pattern 4 (A-Shape)": { startFretOffset: 6, endFretOffset: 10 },
      "Pattern 5 (G-Shape)": { startFretOffset: 8, endFretOffset: 12 },
    },
  },
  {
    id: "natural_minor",
    name: "Natural Minor (Aeolian)",
    category: "Major & Minor",
    intervals: [0, 2, 3, 5, 7, 8, 10],
    formula: "W H W W H W W",
    degrees: ["1", "2", "b3", "4", "5", "b6", "b7"],
    intervalsNamed: ["R", "M2", "m3", "P4", "P5", "m6", "m7"],
    cagedBoxes: {
      "Pattern 1 (E-Shape)": { startFretOffset: -1, endFretOffset: 3 },
      "Pattern 2 (D-Shape)": { startFretOffset: 2, endFretOffset: 5 },
      "Pattern 3 (C-Shape)": { startFretOffset: 4, endFretOffset: 8 },
      "Pattern 4 (A-Shape)": { startFretOffset: 7, endFretOffset: 10 },
      "Pattern 5 (G-Shape)": { startFretOffset: 9, endFretOffset: 13 },
    },
  },
  {
    id: "harmonic_minor",
    name: "Harmonic Minor",
    category: "Major & Minor",
    intervals: [0, 2, 3, 5, 7, 8, 11],
    formula: "W H W W H 1.5 H",
    degrees: ["1", "2", "b3", "4", "5", "b6", "7"],
    intervalsNamed: ["R", "M2", "m3", "P4", "P5", "m6", "M7"],
    cagedBoxes: {
      "Pattern 1 (E Shape)": { startFretOffset: 0, endFretOffset: 3 },
      "Pattern 2 (D Shape)": { startFretOffset: 0, endFretOffset: 6 },
      "Pattern 3 (C Shape)": { startFretOffset: 3, endFretOffset: 7 },
      "Pattern 4 (A Shape)": { startFretOffset: 7, endFretOffset: 11 },
      "Pattern 5 (G Shape)": { startFretOffset: 8, endFretOffset: 12 },
    },
  },
  {
    id: "melodic_minor",
    name: "Melodic Minor (Jazz Minor)",
    category: "Major & Minor",
    intervals: [0, 2, 3, 5, 7, 9, 11],
    formula: "W H W W W W H",
    degrees: ["1", "2", "b3", "4", "5", "6", "7"],
    intervalsNamed: ["R", "M2", "m3", "P4", "P5", "M6", "M7"],
    cagedBoxes: {
      "Pattern 1 (E Shape)": { startFretOffset: 0, endFretOffset: 3 },
      "Pattern 2 (D Shape)": { startFretOffset: 2, endFretOffset: 6 },
      "Pattern 3 (C Shape)": { startFretOffset: 5, endFretOffset: 8 },
      "Pattern 4 (A Shape)": { startFretOffset: 7, endFretOffset: 10 },
      "Pattern 5 (G Shape)": { startFretOffset: 9, endFretOffset: 13 },
    },
  },
  {
    id: "pentatonic_minor",
    name: "Minor Pentatonic",
    category: "Pentatonic & Blues",
    intervals: [0, 3, 5, 7, 10],
    formula: "1.5 W W 1.5 W",
    degrees: ["1", "b3", "4", "5", "b7"],
    intervalsNamed: ["R", "m3", "P4", "P5", "m7"],
    cagedBoxes: {
      "Pattern 1 (E-Shape)": { startFretOffset: -1, endFretOffset: 3 },
      "Pattern 2 (D-Shape)": { startFretOffset: 2, endFretOffset: 5 },
      "Pattern 3 (C-Shape)": { startFretOffset: 4, endFretOffset: 8 },
      "Pattern 4 (A-Shape)": { startFretOffset: 7, endFretOffset: 10 },
      "Pattern 5 (G-Shape)": { startFretOffset: 9, endFretOffset: 12 },
    },
  },
  {
    id: "pentatonic_major",
    name: "Major Pentatonic",
    category: "Pentatonic & Blues",
    intervals: [0, 2, 4, 7, 9],
    formula: "W W 1.5 W 1.5",
    degrees: ["1", "2", "3", "5", "6"],
    intervalsNamed: ["R", "M2", "M3", "P5", "M6"],
    cagedBoxes: {
      "Pattern 1 (E-Shape)": { startFretOffset: -1, endFretOffset: 2 },
      "Pattern 2 (D-Shape)": { startFretOffset: 1, endFretOffset: 5 },
      "Pattern 3 (C-Shape)": { startFretOffset: 4, endFretOffset: 7 },
      "Pattern 4 (A-Shape)": { startFretOffset: 6, endFretOffset: 10 },
      "Pattern 5 (G-Shape)": { startFretOffset: 8, endFretOffset: 12 },
    },
  },
  {
    id: "blues",
    name: "Blues Scale",
    category: "Pentatonic & Blues",
    intervals: [0, 3, 5, 6, 7, 10],
    formula: "1.5 W H H 1.5 W",
    degrees: ["1", "b3", "4", "b5", "5", "b7"],
    intervalsNamed: ["R", "m3", "P4", "b5", "P5", "m7"],
    cagedBoxes: {
      "Pattern 1 (E-Shape)": { startFretOffset: 0, endFretOffset: 3 },
      "Pattern 2 (D-Shape)": { startFretOffset: 2, endFretOffset: 6 },
      "Pattern 3 (C-Shape)": { startFretOffset: 4, endFretOffset: 8 },
      "Pattern 4 (A-Shape)": { startFretOffset: 7, endFretOffset: 11 },
      "Pattern 5 (G-Shape)": { startFretOffset: 9, endFretOffset: 13 },
    },
  },
  {
    id: "dorian",
    name: "Dorian Mode",
    category: "Modes",
    intervals: [0, 2, 3, 5, 7, 9, 10],
    formula: "W H W W W H W",
    degrees: ["1", "2", "b3", "4", "5", "6", "b7"],
    intervalsNamed: ["R", "M2", "m3", "P4", "P5", "M6", "m7"],
    cagedBoxes: {
      "Pattern 1 (D Shape)": { startFretOffset: -1, endFretOffset: 3 },
      "Pattern 2 (C Shape)": { startFretOffset: 2, endFretOffset: 5 },
      "Pattern 3 (A Shape)": { startFretOffset: 4, endFretOffset: 8 },
      "Pattern 4 (G Shape)": { startFretOffset: 6, endFretOffset: 10 },
      "Pattern 5 (E Shape)": { startFretOffset: 9, endFretOffset: 12 },
    },
  },
  {
    id: "phrygian",
    name: "Phrygian Mode",
    category: "Modes",
    intervals: [0, 1, 3, 5, 7, 8, 10],
    formula: "H W W W H W W",
    degrees: ["1", "b2", "b3", "4", "5", "b6", "b7"],
    intervalsNamed: ["R", "m2", "m3", "P4", "P5", "m6", "m7"],
    cagedBoxes: {
      "Pattern 1 (C Shape)": { startFretOffset: 0, endFretOffset: 3 },
      "Pattern 2 (A Shape)": { startFretOffset: 2, endFretOffset: 6 },
      "Pattern 3 (G Shape)": { startFretOffset: 4, endFretOffset: 8 },
      "Pattern 4 (E Shape)": { startFretOffset: 7, endFretOffset: 10 },
      "Pattern 5 (D Shape)": { startFretOffset: 9, endFretOffset: 13 },
    },
  },
  {
    id: "lydian",
    name: "Lydian Mode",
    category: "Modes",
    intervals: [0, 2, 4, 6, 7, 9, 11],
    formula: "W W W H W W H",
    degrees: ["1", "2", "3", "#4", "5", "6", "7"],
    intervalsNamed: ["R", "M2", "M3", "#4", "P5", "M6", "M7"],
    cagedBoxes: {
      "Pattern 1 (C Shape)": { startFretOffset: -1, endFretOffset: 2 },
      "Pattern 2 (A Shape)": { startFretOffset: 1, endFretOffset: 5 },
      "Pattern 3 (G Shape)": { startFretOffset: 3, endFretOffset: 7 },
      "Pattern 4 (E Shape)": { startFretOffset: 6, endFretOffset: 10 },
      "Pattern 5 (D Shape)": { startFretOffset: 8, endFretOffset: 12 },
    },
  },
  {
    id: "mixolydian",
    name: "Mixolydian Mode",
    category: "Modes",
    intervals: [0, 2, 4, 5, 7, 9, 10],
    formula: "W W H W W H W",
    degrees: ["1", "2", "3", "4", "5", "6", "b7"],
    intervalsNamed: ["R", "M2", "M3", "P4", "P5", "M6", "m7"],
    cagedBoxes: {
      "Pattern 1 (G Shape)": { startFretOffset: -1, endFretOffset: 3 },
      "Pattern 2 (E Shape)": { startFretOffset: 1, endFretOffset: 5 },
      "Pattern 3 (D Shape)": { startFretOffset: 4, endFretOffset: 8 },
      "Pattern 4 (C Shape)": { startFretOffset: 6, endFretOffset: 10 },
      "Pattern 5 (A Shape)": { startFretOffset: 9, endFretOffset: 12 },
    },
  },
  {
    id: "locrian",
    name: "Locrian Mode",
    category: "Modes",
    intervals: [0, 1, 3, 5, 6, 8, 10],
    formula: "H W W H W W W",
    degrees: ["1", "b2", "b3", "4", "b5", "b6", "b7"],
    intervalsNamed: ["R", "m2", "m3", "P4", "b5", "m6", "m7"],
    cagedBoxes: {
      "Pattern 1 (E Shape)": { startFretOffset: 0, endFretOffset: 3 },
      "Pattern 2 (D Shape)": { startFretOffset: 2, endFretOffset: 6 },
      "Pattern 3 (C Shape)": { startFretOffset: 5, endFretOffset: 8 },
      "Pattern 4 (A Shape)": { startFretOffset: 7, endFretOffset: 11 },
      "Pattern 5 (G Shape)": { startFretOffset: 9, endFretOffset: 13 },
    },
  },
  {
    id: "whole_tone",
    name: "Whole Tone Scale",
    category: "Symmetrical & Exotic",
    intervals: [0, 2, 4, 6, 8, 10],
    formula: "W W W W W W",
    degrees: ["1", "2", "3", "#4", "#5", "b7"],
    intervalsNamed: ["R", "M2", "M3", "#4", "#5", "m7"],
  },
  {
    id: "diminished_hw",
    name: "Diminished (Half-Whole)",
    category: "Symmetrical & Exotic",
    intervals: [0, 1, 3, 4, 6, 7, 9, 10],
    formula: "H W H W H W H W",
    degrees: ["1", "b2", "b3", "3", "b5", "5", "6", "b7"],
    intervalsNamed: ["R", "m2", "m3", "M3", "b5", "P5", "M6", "m7"],
  },
  {
    id: "diminished_wh",
    name: "Diminished (Whole-Half)",
    category: "Symmetrical & Exotic",
    intervals: [0, 2, 3, 5, 6, 8, 9, 11],
    formula: "W H W H W H W H",
    degrees: ["1", "2", "b3", "4", "b5", "b6", "6", "7"],
    intervalsNamed: ["R", "M2", "m3", "P4", "b5", "m6", "M6", "M7"],
  },
  {
    id: "chromatic",
    name: "Chromatic Scale",
    category: "Symmetrical & Exotic",
    intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    formula: "H H H H H H H H H H H H",
    degrees: ["1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"],
    intervalsNamed: [
      "R",
      "m2",
      "M2",
      "m3",
      "M3",
      "P4",
      "b5",
      "P5",
      "m6",
      "M6",
      "m7",
      "M7",
    ],
  },
  {
    id: "bebop_dominant",
    name: "Bebop Dominant",
    category: "Symmetrical & Exotic",
    intervals: [0, 2, 4, 5, 7, 9, 10, 11],
    formula: "W W H W W H H H",
    degrees: ["1", "2", "3", "4", "5", "6", "b7", "7"],
    intervalsNamed: ["R", "M2", "M3", "P4", "P5", "M6", "m7", "M7"],
  },
];

// Determine if a musical key or scale context naturally uses flats (b) instead of sharps (#)
export function isFlatKeyContext(
  root: NoteName | string,
  scale?: ScaleDefinition | null,
): boolean {
  if (!root) return false;
  if (root.includes("b")) return true;
  if (root === "F") return true;
  if (scale) {
    // Minor scales and modes with flat key signatures: D (1b), G (2b), C (3b), F (4b)
    const flatProneScaleTypes = [
      "natural_minor",
      "harmonic_minor",
      "melodic_minor",
      "dorian",
      "phrygian",
      "locrian",
      "pentatonic_minor",
      "blues",
    ];
    if (
      flatProneScaleTypes.includes(scale.id) &&
      ["D", "G", "C", "F"].includes(root)
    ) {
      return true;
    }
  }
  return false;
}

// Calculate actual notes in a scale given Root Note + Scale Definition
export function getScaleNotes(
  root: NoteName | string,
  scale: ScaleDefinition,
): {
  note: NoteName;
  degree: string;
  interval: string;
  semitoneFromRoot: number;
}[] {
  const rootIndex = NOTE_SEMITONES[root as NoteName] ?? 0;
  const useFlats = isFlatKeyContext(root, scale);
  const chromatic = useFlats ? CHROMATIC_FLATS : CHROMATIC_SHARPS;

  return scale.intervals.map((interval, idx) => {
    const noteIdx = (rootIndex + interval) % 12;
    return {
      note: chromatic[noteIdx],
      degree: scale.degrees[idx] || `${idx + 1}`,
      interval:
        scale.intervalsNamed[idx] ||
        INTERVAL_NAMES_MAP[interval] ||
        `+${interval}`,
      semitoneFromRoot: interval,
    };
  });
}

// Get the theoretically accurate spelled note name for a semitone (0-11)
// respecting active random drill target note, active scale spelling, and key context
export function getSpelledNote(
  semitone: number,
  options?: {
    root?: NoteName | string;
    scale?: ScaleDefinition | null;
    scaleMap?: Map<
      number,
      { noteName?: NoteName; degree?: string; interval?: string }
    >;
    activeRandomNote?: string | null;
  },
): NoteName {
  const normalizedSemi = ((semitone % 12) + 12) % 12;

  // 1. If an active random target note is specified and matches this pitch, match its exact spelling (e.g. Bb vs A#)
  if (options?.activeRandomNote) {
    const clean = options.activeRandomNote.trim() as NoteName;
    if (NOTE_SEMITONES[clean] === normalizedSemi) {
      return clean;
    }
  }

  // 2. If scaleMap has a specifically spelled note for this semitone, use that
  if (options?.scaleMap?.has(normalizedSemi)) {
    const info = options.scaleMap.get(normalizedSemi);
    if (info?.noteName) return info.noteName;
  }

  // 3. If in a flat root or flat scale context, default to flats (Db, Eb, Gb, Ab, Bb)
  if (options?.root && isFlatKeyContext(options.root, options.scale)) {
    return CHROMATIC_FLATS[normalizedSemi];
  }

  // 4. Default to sharps
  return CHROMATIC_SHARPS[normalizedSemi];
}

// Circle of Fifths Structure
export interface CircleKeyData {
  major: NoteName;
  minor: string;
  signatureCount: number;
  signatureType: "#" | "b" | "";
  positionAngle: number;
}

export const CIRCLE_OF_FIFTHS_DATA: CircleKeyData[] = [
  {
    major: "C",
    minor: "Am",
    signatureCount: 0,
    signatureType: "",
    positionAngle: 0,
  },
  {
    major: "G",
    minor: "Em",
    signatureCount: 1,
    signatureType: "#",
    positionAngle: 30,
  },
  {
    major: "D",
    minor: "Bm",
    signatureCount: 2,
    signatureType: "#",
    positionAngle: 60,
  },
  {
    major: "A",
    minor: "F#m",
    signatureCount: 3,
    signatureType: "#",
    positionAngle: 90,
  },
  {
    major: "E",
    minor: "C#m",
    signatureCount: 4,
    signatureType: "#",
    positionAngle: 120,
  },
  {
    major: "B",
    minor: "G#m",
    signatureCount: 5,
    signatureType: "#",
    positionAngle: 150,
  },
  {
    major: "F#",
    minor: "D#m",
    signatureCount: 6,
    signatureType: "#",
    positionAngle: 180,
  },
  {
    major: "Db",
    minor: "Bbm",
    signatureCount: 5,
    signatureType: "b",
    positionAngle: 210,
  },
  {
    major: "Ab",
    minor: "Fm",
    signatureCount: 4,
    signatureType: "b",
    positionAngle: 240,
  },
  {
    major: "Eb",
    minor: "Cm",
    signatureCount: 3,
    signatureType: "b",
    positionAngle: 270,
  },
  {
    major: "Bb",
    minor: "Gm",
    signatureCount: 2,
    signatureType: "b",
    positionAngle: 300,
  },
  {
    major: "F",
    minor: "Dm",
    signatureCount: 1,
    signatureType: "b",
    positionAngle: 330,
  },
];

export interface DiatonicChord {
  numeral: string;
  root: NoteName;
  name: string;
  type: "maj" | "min" | "dim" | "7" | "maj7" | "min7" | "m7b5";
  notes: NoteName[];
}

export function getDiatonicChords(rootMajor: NoteName): DiatonicChord[] {
  const rootIndex = NOTE_SEMITONES[rootMajor];
  const useFlats = ["F", "Bb", "Eb", "Ab", "Db"].includes(rootMajor);
  const chromatic = useFlats ? CHROMATIC_FLATS : CHROMATIC_SHARPS;

  const majorIntervals = [0, 2, 4, 5, 7, 9, 11];
  const numerals = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
  const types: ("maj" | "min" | "dim")[] = [
    "maj",
    "min",
    "min",
    "maj",
    "maj",
    "min",
    "dim",
  ];

  return majorIntervals.map((semitones, idx) => {
    const chordRoot = chromatic[(rootIndex + semitones) % 12];
    const type = types[idx];
    const suffix = type === "maj" ? "" : type === "min" ? "m" : "dim";

    // Chord triad notes
    const thirdOffset = type === "min" || type === "dim" ? 3 : 4;
    const fifthOffset = type === "dim" ? 6 : 7;

    const third = chromatic[(NOTE_SEMITONES[chordRoot] + thirdOffset) % 12];
    const fifth = chromatic[(NOTE_SEMITONES[chordRoot] + fifthOffset) % 12];

    return {
      numeral: numerals[idx],
      root: chordRoot,
      name: `${chordRoot}${suffix}`,
      type,
      notes: [chordRoot, third, fifth],
    };
  });
}
