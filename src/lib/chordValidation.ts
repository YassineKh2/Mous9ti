import { ChordDefinition, GuitarVoicing, Tuning } from "../types";
import { CHROMATIC_SHARPS, NOTE_SEMITONES } from "../data/musicTheory";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateGuitarVoicing(
  voicing: GuitarVoicing,
  chordDef: ChordDefinition,
  tuning: Tuning
): ValidationResult {
  const errors: string[] = [];
  const soundedNotes = new Set<number>();
  const chordPitchClasses = new Set(chordDef.notes.map(n => NOTE_SEMITONES[n]));
  
  voicing.frets.forEach((fret, stringIdx) => {
    if (fret === null) return; // Muted string
    
    const openNote = tuning.strings[stringIdx];
    const openSemi = NOTE_SEMITONES[openNote];
    const totalSemi = (openSemi + fret) % 12;
    
    soundedNotes.add(totalSemi);
    
    // Check if sounded note is in chord definition
    if (!chordPitchClasses.has(totalSemi)) {
      const wrongNoteName = CHROMATIC_SHARPS[totalSemi];
      errors.push(`String ${stringIdx + 1} produces ${wrongNoteName}, which is not in ${chordDef.fullName} (${chordDef.notes.join(', ')}).`);
    }
    
    // Check root string alignment if explicitly stated
    const stringName = `${6 - stringIdx}th String`; // 6th string is idx 0
    if (voicing.rootString.includes(stringName)) {
      if (totalSemi !== NOTE_SEMITONES[chordDef.root]) {
        errors.push(`Root string is labeled as ${stringName}, but it produces ${CHROMATIC_SHARPS[totalSemi]} instead of ${chordDef.root}.`);
      }
    }
  });

  // Ensure root is played somewhere
  if (!soundedNotes.has(NOTE_SEMITONES[chordDef.root])) {
    errors.push(`The root note ${chordDef.root} is missing from the voicing.`);
  }

  // Check impossible fingerings (e.g. multiple fingers on the same string, handled by data structure implicitly)
  // Check if frets match baseFret
  const nonZeroFrets = voicing.frets.filter(f => f !== null && f > 0) as number[];
  if (nonZeroFrets.length > 0) {
    const minFret = Math.min(...nonZeroFrets);
    const maxFret = Math.max(...nonZeroFrets);
    // Usually a hand spans at most 4 frets (sometimes 5). We won't enforce strictly but checking for wild values.
    if (maxFret - minFret > 4) {
      errors.push(`Fingering span is too large (${minFret} to ${maxFret}).`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateAllChords(chords: ChordDefinition[], tuning: Tuning): void {
  let errorCount = 0;
  chords.forEach(chord => {
    const hasFundamental = chord.voicings.some(v => v.isFundamental);
    if (!hasFundamental) {
      console.error(`Completeness Error in ${chord.fullName}: Missing required fundamental open-position/first-position voicing.`);
      errorCount++;
    }

    chord.voicings.forEach(voicing => {
      const result = validateGuitarVoicing(voicing, chord, tuning);
      if (!result.isValid) {
        console.error(`Validation Error in ${chord.fullName} - ${voicing.name}:`);
        result.errors.forEach(err => console.error(`  - ${err}`));
        errorCount++;
      }
    });
  });
  
  if (errorCount > 0) {
    console.warn(`Total validation errors: ${errorCount}`);
  } else {
    console.log("All chord voicings passed validation (including completeness checks)!");
  }
}
