import { CHORD_TYPES_CATALOG, getChordDefinition } from './src/data/chordsData';
import { ALL_ROOT_NOTES, GUITAR_TUNINGS } from './src/data/musicTheory';
import { validateAllChords } from './src/lib/chordValidation';

const chords: any[] = [];
ALL_ROOT_NOTES.forEach(root => {
    CHORD_TYPES_CATALOG.forEach(type => {
        chords.push(getChordDefinition(root, type.type));
    });
});

validateAllChords(chords, GUITAR_TUNINGS[0]);
