import { ChordDefinition, GuitarVoicing, NoteName } from "../types";
import {
  CHROMATIC_SHARPS,
  CHROMATIC_FLATS,
  NOTE_SEMITONES,
} from "./musicTheory";

export interface ChordTypeInfo {
  type: string;
  name: string;
  symbol: string;
  intervals: number[];
  formula: string;
  degrees: string[];
}

export const CHORD_TYPES_CATALOG: ChordTypeInfo[] = [
  {
    type: "major",
    name: "Major",
    symbol: "",
    intervals: [0, 4, 7],
    formula: "1 3 5",
    degrees: ["1", "3", "5"],
  },
  {
    type: "minor",
    name: "Minor",
    symbol: "m",
    intervals: [0, 3, 7],
    formula: "1 b3 5",
    degrees: ["1", "b3", "5"],
  },
  {
    type: "7",
    name: "Dominant 7th",
    symbol: "7",
    intervals: [0, 4, 7, 10],
    formula: "1 3 5 b7",
    degrees: ["1", "3", "5", "b7"],
  },
  {
    type: "maj7",
    name: "Major 7th",
    symbol: "maj7",
    intervals: [0, 4, 7, 11],
    formula: "1 3 5 7",
    degrees: ["1", "3", "5", "7"],
  },
  {
    type: "min7",
    name: "Minor 7th",
    symbol: "m7",
    intervals: [0, 3, 7, 10],
    formula: "1 b3 5 b7",
    degrees: ["1", "b3", "5", "b7"],
  },
  {
    type: "dim",
    name: "Diminished",
    symbol: "dim",
    intervals: [0, 3, 6],
    formula: "1 b3 b5",
    degrees: ["1", "b3", "b5"],
  },
  {
    type: "dim7",
    name: "Diminished 7th",
    symbol: "dim7",
    intervals: [0, 3, 6, 9],
    formula: "1 b3 b5 bb7",
    degrees: ["1", "b3", "b5", "bb7"],
  },
  {
    type: "m7b5",
    name: "Half-Diminished",
    symbol: "m7b5",
    intervals: [0, 3, 6, 10],
    formula: "1 b3 b5 b7",
    degrees: ["1", "b3", "b5", "b7"],
  },
  {
    type: "aug",
    name: "Augmented",
    symbol: "aug",
    intervals: [0, 4, 8],
    formula: "1 3 #5",
    degrees: ["1", "3", "#5"],
  },
  {
    type: "sus2",
    name: "Suspended 2nd",
    symbol: "sus2",
    intervals: [0, 2, 7],
    formula: "1 2 5",
    degrees: ["1", "2", "5"],
  },
  {
    type: "sus4",
    name: "Suspended 4th",
    symbol: "sus4",
    intervals: [0, 5, 7],
    formula: "1 4 5",
    degrees: ["1", "4", "5"],
  },
  {
    type: "add9",
    name: "Add 9",
    symbol: "add9",
    intervals: [0, 4, 7, 14],
    formula: "1 3 5 9",
    degrees: ["1", "3", "5", "9"],
  },
  {
    type: "9",
    name: "Dominant 9th",
    symbol: "9",
    intervals: [0, 4, 7, 10, 14],
    formula: "1 3 5 b7 9",
    degrees: ["1", "3", "5", "b7", "9"],
  },
  {
    type: "11",
    name: "11th",
    symbol: "11",
    intervals: [0, 4, 7, 10, 14, 17],
    formula: "1 3 5 b7 9 11",
    degrees: ["1", "3", "5", "b7", "9", "11"],
  },
  {
    type: "13",
    name: "13th",
    symbol: "13",
    intervals: [0, 4, 7, 10, 14, 21],
    formula: "1 3 5 b7 9 13",
    degrees: ["1", "3", "5", "b7", "9", "13"],
  },
  {
    type: "6",
    name: "Major 6th",
    symbol: "6",
    intervals: [0, 4, 7, 9],
    formula: "1 3 5 6",
    degrees: ["1", "3", "5", "6"],
  },
  {
    type: "min6",
    name: "Minor 6th",
    symbol: "m6",
    intervals: [0, 3, 7, 9],
    formula: "1 b3 5 6",
    degrees: ["1", "b3", "5", "6"],
  },
  {
    type: "7b9",
    name: "7 Flat 9",
    symbol: "7b9",
    intervals: [0, 4, 7, 10, 13],
    formula: "1 3 5 b7 b9",
    degrees: ["1", "3", "5", "b7", "b9"],
  },
  {
    type: "7#9",
    name: "Hendrix 7#9",
    symbol: "7#9",
    intervals: [0, 4, 7, 10, 15],
    formula: "1 3 5 b7 #9",
    degrees: ["1", "3", "5", "b7", "#9"],
  },
];

// Helper to generate voicings for standard tunings across all roots
export function getChordVoicings(
  root: NoteName,
  chordType: string,
): GuitarVoicing[] {
  const voicings: GuitarVoicing[] = [];
  
  // Normalize chord type for lookup
  const typeKey = chordType === "m" ? "minor" : (chordType === "m7" ? "min7" : chordType);

  const SHAPE_OFFSETS: Record<string, { e?: (number | null)[], a?: (number | null)[] }> = {
    "major": { e: [0, 2, 2, 1, 0, 0], a: [null, 0, 2, 2, 2, 0] },
    "minor": { e: [0, 2, 2, 0, 0, 0], a: [null, 0, 2, 2, 1, 0] },
    "7": { e: [0, 2, 0, 1, 0, 0], a: [null, 0, 2, 0, 2, 0] },
    "maj7": { e: [0, null, 1, 1, 0, null], a: [null, 0, 2, 1, 2, 0] },
    "min7": { e: [0, 2, 0, 0, 0, 0], a: [null, 0, 2, 0, 1, 0] },
    "dim": { e: [0, null, 2, 0, -1, null], a: [null, 0, 1, 2, 1, null] },
    "dim7": { e: [0, null, -1, 0, -1, null], a: [null, 0, 1, -1, 1, null] },
    "m7b5": { e: [0, null, 0, 0, -1, null], a: [null, 0, 1, 0, 1, null] },
    "aug": { e: [0, null, 2, 1, 1, null], a: [null, 0, -1, -2, -2, null] },
    "sus2": { e: [0, 2, 4, 4, 0, 0], a: [null, 0, 2, 2, 0, 0] },
    "sus4": { e: [0, 2, 2, 2, 0, 0], a: [null, 0, 2, 2, 3, 0] },
    "add9": { e: [0, 2, 4, 1, 0, 0], a: [null, 0, 2, 4, 2, 0] },
    "9": { e: [0, null, 0, -1, 0, 0], a: [null, 0, -1, 0, 0, null] },
    "11": { e: [0, null, 0, 1, -2, null], a: [null, 0, 0, 0, 0, null] },
    "13": { e: [0, null, 0, 1, 2, null], a: [null, 0, -1, 0, 2, null] },
    "6": { e: [0, null, -1, 1, 0, null], a: [null, 0, 2, -1, 2, null] },
    "min6": { e: [0, null, -1, 0, 0, null], a: [null, 0, 2, -1, 1, null] },
    "7b9": { e: [0, null, 0, 1, null, 1], a: [null, 0, -1, 0, -1, null] },
    "7#9": { e: [0, null, 0, 1, null, 3], a: [null, 0, -1, 0, 1, null] }
  };

  const offsets = SHAPE_OFFSETS[typeKey];

  // 1. Handcrafted Open Shapes (highest priority fundamental)
  const openShapes: Record<string, Record<string, Partial<GuitarVoicing>>> = {
    "C": {
      "major": { name: "C Open Major", positionLabel: "Open Position", rootString: "Root: 5th String", frets: [null, 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], baseFret: 1 },
      "7": { name: "C7 Open", positionLabel: "Open Position", rootString: "Root: 5th String", frets: [null, 3, 2, 3, 1, 0], fingers: [null, 3, 2, 4, 1, null], baseFret: 1 },
      "maj7": { name: "Cmaj7 Open", positionLabel: "Open Position", rootString: "Root: 5th String", frets: [null, 3, 2, 0, 0, 0], fingers: [null, 3, 2, null, null, null], baseFret: 1 }
    },
    "A": {
      "major": { name: "A Open Major", positionLabel: "Open Position", rootString: "Root: 5th String", frets: [null, 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], baseFret: 1 },
      "minor": { name: "Am Open Minor", positionLabel: "Open Position", rootString: "Root: 5th String", frets: [null, 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null], baseFret: 1 },
      "7": { name: "A7 Open", positionLabel: "Open Position", rootString: "Root: 5th String", frets: [null, 0, 2, 0, 2, 0], fingers: [null, null, 2, null, 3, null], baseFret: 1 },
      "min7": { name: "Am7 Open", positionLabel: "Open Position", rootString: "Root: 5th String", frets: [null, 0, 2, 0, 1, 0], fingers: [null, null, 2, null, 1, null], baseFret: 1 },
      "maj7": { name: "Amaj7 Open", positionLabel: "Open Position", rootString: "Root: 5th String", frets: [null, 0, 2, 1, 2, 0], fingers: [null, null, 2, 1, 3, null], baseFret: 1 },
      "sus2": { name: "Asus2 Open", positionLabel: "Open Position", rootString: "Root: 5th String", frets: [null, 0, 2, 2, 0, 0], fingers: [null, null, 2, 3, null, null], baseFret: 1 },
      "sus4": { name: "Asus4 Open", positionLabel: "Open Position", rootString: "Root: 5th String", frets: [null, 0, 2, 2, 3, 0], fingers: [null, null, 1, 2, 3, null], baseFret: 1 }
    },
    "G": {
      "major": { name: "G Open Major", positionLabel: "Open Position", rootString: "Root: 6th String", frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, null, null, null, 3], baseFret: 1 },
      "7": { name: "G7 Open", positionLabel: "Open Position", rootString: "Root: 6th String", frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, null, null, null, 1], baseFret: 1 },
      "maj7": { name: "Gmaj7 Open", positionLabel: "Open Position", rootString: "Root: 6th String", frets: [3, 2, 0, 0, 0, 2], fingers: [3, 2, null, null, null, 1], baseFret: 1 }
    },
    "E": {
      "major": { name: "E Open Major", positionLabel: "Open Position", rootString: "Root: 6th String", frets: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], baseFret: 1 },
      "minor": { name: "Em Open Minor", positionLabel: "Open Position", rootString: "Root: 6th String", frets: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], baseFret: 1 },
      "7": { name: "E7 Open", positionLabel: "Open Position", rootString: "Root: 6th String", frets: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], baseFret: 1 },
      "min7": { name: "Em7 Open", positionLabel: "Open Position", rootString: "Root: 6th String", frets: [0, 2, 0, 0, 0, 0], fingers: [null, 2, null, null, null, null], baseFret: 1 },
      "maj7": { name: "Emaj7 Open", positionLabel: "Open Position", rootString: "Root: 6th String", frets: [0, 2, 1, 1, 0, 0], fingers: [null, 3, 1, 2, null, null], baseFret: 1 }
    },
    "D": {
      "major": { name: "D Open Major", positionLabel: "Open Position", rootString: "Root: 4th String", frets: [null, null, 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], baseFret: 1 },
      "minor": { name: "Dm Open Minor", positionLabel: "Open Position", rootString: "Root: 4th String", frets: [null, null, 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], baseFret: 1 },
      "7": { name: "D7 Open", positionLabel: "Open Position", rootString: "Root: 4th String", frets: [null, null, 0, 2, 1, 2], fingers: [null, null, null, 2, 1, 3], baseFret: 1 },
      "min7": { name: "Dm7 Open", positionLabel: "Open Position", rootString: "Root: 4th String", frets: [null, null, 0, 2, 1, 1], fingers: [null, null, null, 2, 1, 1], baseFret: 1, barre: { fret: 1, fromString: 4, toString: 5, finger: 1 } },
      "maj7": { name: "Dmaj7 Open", positionLabel: "Open Position", rootString: "Root: 4th String", frets: [null, null, 0, 2, 2, 2], fingers: [null, null, null, 1, 1, 1], baseFret: 1, barre: { fret: 2, fromString: 3, toString: 5, finger: 1 } },
      "sus2": { name: "Dsus2 Open", positionLabel: "Open Position", rootString: "Root: 4th String", frets: [null, null, 0, 2, 3, 0], fingers: [null, null, null, 1, 3, null], baseFret: 1 },
      "sus4": { name: "Dsus4 Open", positionLabel: "Open Position", rootString: "Root: 4th String", frets: [null, null, 0, 2, 3, 3], fingers: [null, null, null, 1, 3, 4], baseFret: 1 }
    },
    "B": {
      "7": { name: "B7 Open", positionLabel: "Open Position", rootString: "Root: 5th String", frets: [null, 2, 1, 2, 0, 2], fingers: [null, 2, 1, 3, null, 4], baseFret: 1 }
    },
    "F": {
      "major": { name: "F Major (Mini Barre)", positionLabel: "First Position", rootString: "Root: 4th String", frets: [null, null, 3, 2, 1, 1], fingers: [null, null, 3, 2, 1, 1], baseFret: 1, barre: { fret: 1, fromString: 4, toString: 5, finger: 1 } },
      "maj7": { name: "Fmaj7 Open", positionLabel: "Open Position", rootString: "Root: 4th String", frets: [null, null, 3, 2, 1, 0], fingers: [null, null, 3, 2, 1, null], baseFret: 1 }
    }
  };

  const rootIdx = NOTE_SEMITONES[root];
  const fretOn6th = (rootIdx - NOTE_SEMITONES["E"] + 12) % 12;
  const fretOn5th = (rootIdx - NOTE_SEMITONES["A"] + 12) % 12;

  let fundamentalAdded = false;

  // 1A. Add explicit open/fundamental shape if handcrafted
  if (openShapes[root] && openShapes[root][typeKey]) {
    voicings.push({
      ...openShapes[root][typeKey],
      isFundamental: true,
      category: "fundamental-open"
    } as GuitarVoicing);
    fundamentalAdded = true;
  } else if (offsets) {
    // 1B. Deduce lowest standard barre shape for roots lacking an explicit open shape
    const eFret = fretOn6th > 0 ? fretOn6th : 12; 
    const aFret = fretOn5th > 0 ? fretOn5th : 12;
    
    // Attempt E-shape if it's lower, otherwise A-shape
    if (eFret <= aFret && offsets.e && eFret < 12) {
      const frets = offsets.e.map(o => o === null ? null : fretOn6th + o);
      if (frets.every(f => f === null || f >= 0)) {
        voicings.push({
          name: `${root}${chordType} (First Position Barre)`,
          positionLabel: "First Position",
          rootString: "Root: 6th String",
          frets: frets,
          fingers: frets.map(() => null),
          baseFret: fretOn6th,
          barre: (typeKey === "major" || typeKey === "minor" || typeKey === "7" || typeKey === "min7") 
            ? { fret: fretOn6th, fromString: 0, toString: 5, finger: 1 } : undefined,
          isFundamental: true,
          category: "fundamental-barre"
        });
        fundamentalAdded = true;
      }
    } 
    
    if (!fundamentalAdded && offsets.a && aFret < 12) {
      const frets = offsets.a.map(o => o === null ? null : fretOn5th + o);
      if (frets.every(f => f === null || f >= 0)) {
        voicings.push({
          name: `${root}${chordType} (First Position Barre)`,
          positionLabel: "First Position",
          rootString: "Root: 5th String",
          frets: frets,
          fingers: frets.map(() => null),
          baseFret: fretOn5th,
          barre: (typeKey === "major" || typeKey === "minor" || typeKey === "7" || typeKey === "min7") 
            ? { fret: fretOn5th, fromString: 1, toString: 5, finger: 1 } : undefined,
          isFundamental: true,
          category: "fundamental-barre"
        });
        fundamentalAdded = true;
      }
    }

    // Fallback try E again if A failed and E wasn't tried yet
    if (!fundamentalAdded && offsets.e && eFret > aFret && eFret < 12) {
      const frets = offsets.e.map(o => o === null ? null : fretOn6th + o);
      if (frets.every(f => f === null || f >= 0)) {
        voicings.push({
          name: `${root}${chordType} (First Position Barre)`,
          positionLabel: "First Position",
          rootString: "Root: 6th String",
          frets: frets,
          fingers: frets.map(() => null),
          baseFret: fretOn6th,
          barre: (typeKey === "major" || typeKey === "minor" || typeKey === "7" || typeKey === "min7") 
            ? { fret: fretOn6th, fromString: 0, toString: 5, finger: 1 } : undefined,
          isFundamental: true,
          category: "fundamental-barre"
        });
        fundamentalAdded = true;
      }
    }
  }

  // 2. Movable CAGED Variations
  if (offsets) {
    const hasE = voicings.some(v => v.baseFret === fretOn6th && v.rootString.includes("6th"));
    if (!hasE && offsets.e && fretOn6th > 0) {
      const frets = offsets.e.map(o => o === null ? null : fretOn6th + o);
      if (frets.every(f => f === null || f >= 0)) {
        voicings.push({
          name: `${root}${chordType} (E-Shape)`,
          positionLabel: "Barre 6th String",
          rootString: "Root: 6th String",
          frets: frets,
          fingers: frets.map(() => null),
          baseFret: fretOn6th,
          barre: (typeKey === "major" || typeKey === "minor" || typeKey === "7" || typeKey === "min7") 
            ? { fret: fretOn6th, fromString: 0, toString: 5, finger: 1 } : undefined,
          isFundamental: false,
          category: "CAGED"
        });
      }
    }

    const hasA = voicings.some(v => v.baseFret === fretOn5th && v.rootString.includes("5th"));
    if (!hasA && offsets.a && fretOn5th > 0) {
      const frets = offsets.a.map(o => o === null ? null : fretOn5th + o);
      if (frets.every(f => f === null || f >= 0)) {
        voicings.push({
          name: `${root}${chordType} (A-Shape)`,
          positionLabel: "Barre 5th String",
          rootString: "Root: 5th String",
          frets: frets,
          fingers: frets.map(() => null),
          baseFret: fretOn5th,
          barre: (typeKey === "major" || typeKey === "minor" || typeKey === "7" || typeKey === "min7") 
            ? { fret: fretOn5th, fromString: 1, toString: 5, finger: 1 } : undefined,
          isFundamental: false,
          category: "CAGED"
        });
      }
    }
  }

  // 3. Drop 2 / D-Shape (Variations)
  if (["major", "minor", "7", "min7"].includes(typeKey)) {
    const fretOn4th = (rootIdx - NOTE_SEMITONES["D"] + 12) % 12;
    if (fretOn4th > 0) {
      const offsets4 = {
        "major": [null, null, 0, 2, 3, 2],
        "minor": [null, null, 0, 2, 3, 1],
        "7": [null, null, 0, 2, 1, 2],
        "min7": [null, null, 0, 2, 1, 1]
      }[typeKey];
      
      if (offsets4) {
        const frets = offsets4.map(o => o === null ? null : fretOn4th + o);
        voicings.push({
          name: `${root}${chordType} (D-Shape)`,
          positionLabel: "Drop 2 / 4th String",
          rootString: "Root: 4th String",
          frets: frets,
          fingers: frets.map(() => null),
          baseFret: fretOn4th,
          isFundamental: false,
          category: "variation"
        });
      }
    }
  }

  // Fallback for missing fundamental (should rarely happen for standard 19 types, but safety net)
  if (voicings.length > 0 && !voicings.some(v => v.isFundamental)) {
     voicings[0].isFundamental = true;
     voicings[0].category = "fundamental-barre"; // guess
  }

  return voicings;
}

export function getChordDefinition(
  root: NoteName,
  typeKey: string,
): ChordDefinition {
  const chordType =
    CHORD_TYPES_CATALOG.find((c) => c.type === typeKey) ||
    CHORD_TYPES_CATALOG[0];
  const rootIndex = NOTE_SEMITONES[root];

  const useFlats = ["F", "Bb", "Eb", "Ab", "Db", "Gb"].includes(root);
  const chromatic = useFlats ? CHROMATIC_FLATS : CHROMATIC_SHARPS;

  const notes: NoteName[] = chordType.intervals.map((semitone) => {
    return chromatic[(rootIndex + semitone) % 12];
  });

  return {
    id: `${root}_${chordType.type}`,
    name: `${root}${chordType.symbol}`,
    root: root,
    type: chordType.type,
    symbol: chordType.symbol,
    fullName: `${root} ${chordType.name}`,
    intervals: chordType.intervals,
    formula: chordType.formula,
    notes,
    voicings: getChordVoicings(root, chordType.type),
  };
}
