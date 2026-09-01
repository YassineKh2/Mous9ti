import { ChordDefinition, GuitarVoicing, NoteName } from '../types';
import { CHROMATIC_SHARPS, CHROMATIC_FLATS, NOTE_SEMITONES } from './musicTheory';

export interface ChordTypeInfo {
  type: string;
  name: string;
  symbol: string;
  intervals: number[];
  formula: string;
  degrees: string[];
}

export const CHORD_TYPES_CATALOG: ChordTypeInfo[] = [
  { type: 'major', name: 'Major', symbol: '', intervals: [0, 4, 7], formula: '1 3 5', degrees: ['1', '3', '5'] },
  { type: 'minor', name: 'Minor', symbol: 'm', intervals: [0, 3, 7], formula: '1 b3 5', degrees: ['1', 'b3', '5'] },
  { type: '7', name: 'Dominant 7th', symbol: '7', intervals: [0, 4, 7, 10], formula: '1 3 5 b7', degrees: ['1', '3', '5', 'b7'] },
  { type: 'maj7', name: 'Major 7th', symbol: 'maj7', intervals: [0, 4, 7, 11], formula: '1 3 5 7', degrees: ['1', '3', '5', '7'] },
  { type: 'min7', name: 'Minor 7th', symbol: 'm7', intervals: [0, 3, 7, 10], formula: '1 b3 5 b7', degrees: ['1', 'b3', '5', 'b7'] },
  { type: 'dim', name: 'Diminished', symbol: 'dim', intervals: [0, 3, 6], formula: '1 b3 b5', degrees: ['1', 'b3', 'b5'] },
  { type: 'dim7', name: 'Diminished 7th', symbol: 'dim7', intervals: [0, 3, 6, 9], formula: '1 b3 b5 bb7', degrees: ['1', 'b3', 'b5', 'bb7'] },
  { type: 'm7b5', name: 'Half-Diminished', symbol: 'm7b5', intervals: [0, 3, 6, 10], formula: '1 b3 b5 b7', degrees: ['1', 'b3', 'b5', 'b7'] },
  { type: 'aug', name: 'Augmented', symbol: 'aug', intervals: [0, 4, 8], formula: '1 3 #5', degrees: ['1', '3', '#5'] },
  { type: 'sus2', name: 'Suspended 2nd', symbol: 'sus2', intervals: [0, 2, 7], formula: '1 2 5', degrees: ['1', '2', '5'] },
  { type: 'sus4', name: 'Suspended 4th', symbol: 'sus4', intervals: [0, 5, 7], formula: '1 4 5', degrees: ['1', '4', '5'] },
  { type: 'add9', name: 'Add 9', symbol: 'add9', intervals: [0, 4, 7, 14], formula: '1 3 5 9', degrees: ['1', '3', '5', '9'] },
  { type: '9', name: 'Dominant 9th', symbol: '9', intervals: [0, 4, 7, 10, 14], formula: '1 3 5 b7 9', degrees: ['1', '3', '5', 'b7', '9'] },
  { type: '11', name: '11th', symbol: '11', intervals: [0, 4, 7, 10, 14, 17], formula: '1 3 5 b7 9 11', degrees: ['1', '3', '5', 'b7', '9', '11'] },
  { type: '13', name: '13th', symbol: '13', intervals: [0, 4, 7, 10, 14, 21], formula: '1 3 5 b7 9 13', degrees: ['1', '3', '5', 'b7', '9', '13'] },
  { type: '6', name: 'Major 6th', symbol: '6', intervals: [0, 4, 7, 9], formula: '1 3 5 6', degrees: ['1', '3', '5', '6'] },
  { type: 'min6', name: 'Minor 6th', symbol: 'm6', intervals: [0, 3, 7, 9], formula: '1 b3 5 6', degrees: ['1', 'b3', '5', '6'] },
  { type: '7b9', name: '7 Flat 9', symbol: '7b9', intervals: [0, 4, 7, 10, 13], formula: '1 3 5 b7 b9', degrees: ['1', '3', '5', 'b7', 'b9'] },
  { type: '7#9', name: 'Hendrix 7#9', symbol: '7#9', intervals: [0, 4, 7, 10, 15], formula: '1 3 5 b7 #9', degrees: ['1', '3', '5', 'b7', '#9'] },
];

// Helper to generate voicings for standard tunings across all roots
export function getChordVoicings(root: NoteName, chordType: string): GuitarVoicing[] {
  const rootIdx = NOTE_SEMITONES[root];
  
  // Specific curated voicings for E Minor 7th (matching screenshot precisely!)
  if (root === 'E' && (chordType === 'min7' || chordType === 'm7')) {
    return [
      {
        name: 'Em7 (Open Position)',
        positionLabel: 'Open Position',
        rootString: 'Root: 6th String',
        frets: [0, 2, 0, 0, 0, 0], // standard open Em7 or 0 2 2 0 3 0 or 0 2 0 0 0 0
        fingers: [null, 2, null, null, null, null],
        baseFret: 1
      },
      {
        name: 'Em7 (Barre A-Shape)',
        positionLabel: 'Barre (A Shape)',
        rootString: 'Root: 5th String',
        frets: [null, 7, 9, 7, 8, 7],
        fingers: [null, 1, 3, 1, 2, 1],
        baseFret: 7,
        barre: { fret: 7, fromString: 1, toString: 5, finger: 1 }
      },
      {
        name: 'Em7 (Drop 2 12th Fret)',
        positionLabel: 'Drop 2',
        rootString: 'Root: 4th String',
        frets: [null, null, 12, 12, 12, 12],
        fingers: [null, null, 3, 1, 4, 2],
        baseFret: 12,
        barre: { fret: 12, fromString: 0, toString: 3, finger: 1 }
      }
    ];
  }

  // Generic transposed voicings based on CAGED shapes
  // 6th string root (E-shape)
  const fretOn6th = (rootIdx - NOTE_SEMITONES['E'] + 12) % 12;
  // 5th string root (A-shape)
  const fretOn5th = (rootIdx - NOTE_SEMITONES['A'] + 12) % 12;
  // 4th string root (D-shape)
  const fretOn4th = (rootIdx - NOTE_SEMITONES['D'] + 12) % 12;

  const voicings: GuitarVoicing[] = [];

  // Voicing 1: Root on 6th String
  if (chordType === 'major') {
    if (fretOn6th === 0) {
      voicings.push({
        name: `${root} Open Major`,
        positionLabel: 'Open Position',
        rootString: 'Root: 6th String',
        frets: [0, 2, 2, 1, 0, 0],
        fingers: [null, 2, 3, 1, null, null],
        baseFret: 1
      });
    } else {
      voicings.push({
        name: `${root} (Barre E-Shape)`,
        positionLabel: 'Barre (E-Shape)',
        rootString: 'Root: 6th String',
        frets: [fretOn6th, fretOn6th + 2, fretOn6th + 2, fretOn6th + 1, fretOn6th, fretOn6th],
        fingers: [1, 3, 4, 2, 1, 1],
        baseFret: fretOn6th,
        barre: { fret: fretOn6th, fromString: 0, toString: 5, finger: 1 }
      });
    }
  } else if (chordType === 'minor' || chordType === 'm') {
    if (fretOn6th === 0) {
      voicings.push({
        name: `${root}m Open Minor`,
        positionLabel: 'Open Position',
        rootString: 'Root: 6th String',
        frets: [0, 2, 2, 0, 0, 0],
        fingers: [null, 2, 3, null, null, null],
        baseFret: 1
      });
    } else {
      voicings.push({
        name: `${root}m (Barre E-Shape)`,
        positionLabel: 'Barre (E-Shape)',
        rootString: 'Root: 6th String',
        frets: [fretOn6th, fretOn6th + 2, fretOn6th + 2, fretOn6th, fretOn6th, fretOn6th],
        fingers: [1, 3, 4, 1, 1, 1],
        baseFret: fretOn6th,
        barre: { fret: fretOn6th, fromString: 0, toString: 5, finger: 1 }
      });
    }
  } else if (chordType === '7') {
    voicings.push({
      name: `${root}7 (E-Shape)`,
      positionLabel: 'Barre 6th String',
      rootString: 'Root: 6th String',
      frets: [fretOn6th, fretOn6th + 2, fretOn6th, fretOn6th + 1, fretOn6th, fretOn6th],
      fingers: [1, 3, 1, 2, 1, 1],
      baseFret: fretOn6th === 0 ? 1 : fretOn6th,
      barre: { fret: fretOn6th, fromString: 0, toString: 5, finger: 1 }
    });
  } else if (chordType === 'maj7') {
    voicings.push({
      name: `${root}maj7 (E-Shape)`,
      positionLabel: 'Barre 6th String',
      rootString: 'Root: 6th String',
      frets: [fretOn6th, null, fretOn6th + 1, fretOn6th + 1, fretOn6th, null],
      fingers: [1, null, 2, 3, 1, null],
      baseFret: fretOn6th === 0 ? 1 : fretOn6th
    });
  } else {
    // Standard minor 7 / default
    voicings.push({
      name: `${root}${chordType} Position 1`,
      positionLabel: 'Position 1',
      rootString: 'Root: 6th String',
      frets: [fretOn6th, fretOn6th + 2, fretOn6th, fretOn6th, fretOn6th, fretOn6th],
      fingers: [1, 3, 1, 1, 1, 1],
      baseFret: fretOn6th === 0 ? 1 : fretOn6th,
      barre: { fret: fretOn6th, fromString: 0, toString: 5, finger: 1 }
    });
  }

  // Voicing 2: Root on 5th String (A-shape)
  const baseFret2 = fretOn5th === 0 ? 1 : fretOn5th;
  if (chordType === 'major') {
    voicings.push({
      name: `${root} (A-Shape)`,
      positionLabel: 'Barre (A-Shape)',
      rootString: 'Root: 5th String',
      frets: [null, fretOn5th, fretOn5th + 2, fretOn5th + 2, fretOn5th + 2, fretOn5th],
      fingers: [null, 1, 2, 3, 4, 1],
      baseFret: baseFret2,
      barre: { fret: fretOn5th, fromString: 0, toString: 4, finger: 1 }
    });
  } else if (chordType === 'minor' || chordType === 'm') {
    voicings.push({
      name: `${root}m (A-Shape)`,
      positionLabel: 'Barre (A-Shape)',
      rootString: 'Root: 5th String',
      frets: [null, fretOn5th, fretOn5th + 2, fretOn5th + 2, fretOn5th + 1, fretOn5th],
      fingers: [null, 1, 3, 4, 2, 1],
      baseFret: baseFret2,
      barre: { fret: fretOn5th, fromString: 0, toString: 4, finger: 1 }
    });
  } else if (chordType === 'min7' || chordType === 'm7') {
    voicings.push({
      name: `${root}m7 (A-Shape)`,
      positionLabel: 'Barre (A-Shape)',
      rootString: 'Root: 5th String',
      frets: [null, fretOn5th, fretOn5th + 2, fretOn5th, fretOn5th + 1, fretOn5th],
      fingers: [null, 1, 3, 1, 2, 1],
      baseFret: baseFret2,
      barre: { fret: fretOn5th, fromString: 0, toString: 4, finger: 1 }
    });
  } else {
    voicings.push({
      name: `${root}${chordType} Position 2`,
      positionLabel: 'Position 2 (5th String)',
      rootString: 'Root: 5th String',
      frets: [null, fretOn5th, fretOn5th + 2, fretOn5th + 1, fretOn5th + 2, null],
      fingers: [null, 1, 3, 2, 4, null],
      baseFret: baseFret2
    });
  }

  // Voicing 3: Root on 4th String / Drop 2
  const baseFret3 = fretOn4th === 0 ? 1 : fretOn4th;
  voicings.push({
    name: `${root} (Drop 2 / 4th String)`,
    positionLabel: 'Drop 2 Voicing',
    rootString: 'Root: 4th String',
    frets: [null, null, fretOn4th, fretOn4th + 2, fretOn4th + 1, fretOn4th + 2],
    fingers: [null, null, 1, 3, 2, 4],
    baseFret: baseFret3
  });

  return voicings;
}

export function getChordDefinition(root: NoteName, typeKey: string): ChordDefinition {
  const chordType = CHORD_TYPES_CATALOG.find(c => c.type === typeKey) || CHORD_TYPES_CATALOG[0];
  const rootIndex = NOTE_SEMITONES[root];
  
  const useFlats = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(root);
  const chromatic = useFlats ? CHROMATIC_FLATS : CHROMATIC_SHARPS;
  
  const notes: NoteName[] = chordType.intervals.map(semitone => {
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
    voicings: getChordVoicings(root, chordType.type)
  };
}
