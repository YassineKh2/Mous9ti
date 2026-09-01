import { Exercise } from '../types';

export const EXERCISES_DATABASE: Exercise[] = [
  {
    id: 'spider_1234',
    title: 'The Classic 1-2-3-4 Spider Drill',
    category: 'Technique',
    difficulty: 'Beginner',
    suggestedBpm: 80,
    focusGoal: 'Independent finger coordination, strict alternate picking, minimal left hand tension.',
    description: 'Play frets 1, 2, 3, 4 with fingers 1, 2, 3, 4 sequentially across all 6 strings from low E to high E, then shift up one fret and reverse down.',
    tablature: `e|---------------------------------1-2-3-4-4-3-2-1-----------------|
B|-------------------------1-2-3-4-----------------4-3-2-1---------|
G|-----------------1-2-3-4---------------------------------4-3-2-1-|
D|---------1-2-3-4-------------------------------------------------|
A|--1-2-3-4---------------------------------------------------------|
E|1-2-3-4---------------------------------------------------------|
  d u d u d u d u d u d u d u d u d u d u d u d u d u d u d u d u`
  },
  {
    id: 'spider_permutation_1324',
    title: 'Permutation Spider (1-3-2-4)',
    category: 'Technique',
    difficulty: 'Intermediate',
    suggestedBpm: 90,
    focusGoal: 'Breaking linear finger muscle memory and establishing cross-finger independence.',
    description: 'Use fingers Index (1), Ring (3), Middle (2), Pinky (4) on frets 5-7-6-8 across each string.',
    tablature: `e|---------------------------------5-7-6-8-8-6-7-5-----------------|
B|-------------------------5-7-6-8-----------------8-6-7-5---------|
G|-----------------5-7-6-8---------------------------------8-6-7-5-|
D|---------5-7-6-8-------------------------------------------------|
A|--5-7-6-8---------------------------------------------------------|
E|5-7-6-8---------------------------------------------------------|
  d u d u d u d u d u d u d u d u d u d u d u d u d u d u d u d u`
  },
  {
    id: 'hammer_pull_legato',
    title: 'Trill & Legato Strength Routine',
    category: 'Technique',
    difficulty: 'Intermediate',
    suggestedBpm: 100,
    focusGoal: 'Hammer-on velocity, clean snap pull-offs without volume drop.',
    description: 'Pick only the first note of each string and execute hammer-on and pull-off legato combinations.',
    tablature: `e|--5h7p5---5h8p5---5h7p5---5h8p5----------------------------------|
B|--------8-------8-------8-------8--5h7p5---5h8p5---5h7p5---5h8p5---|
G|-----------------------------------------7-------7-------7-------7-|
D|-------------------------------------------------------------------|
A|-------------------------------------------------------------------|
E|-------------------------------------------------------------------|`
  },
  {
    id: 'string_skipping_pentatonic',
    title: 'String Skipping Pentatonic Arpeggiation',
    category: 'Technique',
    difficulty: 'Advanced',
    suggestedBpm: 110,
    focusGoal: 'Right hand pick accuracy and precision when jumping over adjacent strings.',
    description: 'A minor pentatonic box 1 played with deliberate string skips (6th string to 4th, 5th to 3rd, 4th to 2nd).',
    tablature: `e|---------------------------------5-8-----------------------------|
B|-------------------------5-8-------------5-8---------------------|
G|-----------------5-7-------------5-7-----------------------------|
D|---------5-7-------------5-7-------------------------------------|
A|--5-7-------------5-7---------------------------------------------|
E|5-8-------5-8-----------------------------------------------------|`
  },
  {
    id: 'scale_sequences_in_3rds',
    title: 'C Major Scale Sequences in 3rds',
    category: 'Theory',
    difficulty: 'Intermediate',
    suggestedBpm: 100,
    focusGoal: 'Internalizing melodic intervals (3rds) over diatonic positions.',
    description: 'Ascend the C Major scale by playing a note, jumping up a diatonic third, stepping back to the second note, and repeating.',
    tablature: `e|-------------------------------------------------7-8-10-8-12-10---|
B|-----------------------------------------8-10-12-------------------|
G|-----------------------------7-9-10-9-12---------------------------|
D|-----------------7-9-10-9-12---------------------------------------|
A|-----7-8-10-8-12---------------------------------------------------|
E|8-10---------------------------------------------------------------|
  C E  D F E G F A G B A C B D C E D F E G F A G B A C B D C`
  },
  {
    id: 'triad_inversions_cycle',
    title: 'G - C - D Diatonic Triad Inversions',
    category: 'Theory',
    difficulty: 'Advanced',
    suggestedBpm: 90,
    focusGoal: 'Recognizing root position, 1st inversion, and 2nd inversion triads on the top 3 strings.',
    description: 'Cycle through Major triads on strings G, B, and high E across the fretboard.',
    tablature: `e|--3---7---10---0---3---8----2---5---10----------------------------|
B|--3---8---12---1---5---8----3---7---10----------------------------|
G|--4---7---12---0---5---9----2---7---11----------------------------|
D|-------------------------------------------------------------------|
A|-------------------------------------------------------------------|
E|-------------------------------------------------------------------|
    [ G Major: R, 1st, 2nd ]  [ C Major: R, 1st, 2nd ]  [ D Major: R, 1st, 2nd ]`
  },
  {
    id: 'jazz_ii_v_i',
    title: 'Classic Jazz ii - V - I Voice Leading',
    category: 'Theory',
    difficulty: 'Advanced',
    suggestedBpm: 120,
    focusGoal: 'Smooth chromatic voice leading between 3rds and 7ths in Dm7 - G7 - Cmaj7.',
    description: 'Play shell chords moving 7th to 3rd with minimal physical movement.',
    tablature: `e|-------------------------------------------------------------------|
B|--6-------6-------5------------------------------------------------|
G|--5-------4-------4------------------------------------------------|
D|--3-------3-------2------------------------------------------------|
A|--5----------------3------------------------------------------------|
E|----------3--------------------------------------------------------|
   Dm7     G7      Cmaj7
  (ii)     (V)      (I)`
  },
  {
    id: '12_bar_blues_shuffle',
    title: 'A Blues 12-Bar Shuffle with Turnaround',
    category: 'Theory',
    difficulty: 'Beginner',
    suggestedBpm: 110,
    focusGoal: 'Swung eighth notes and classic shuffle rhythm pocket.',
    description: 'Standard A5-A6, D5-D6, E5-E6 shuffle with chromatic turnaround at bar 12.',
    tablature: `E|-------------------------------------------------------------------|
B|-------------------------------------------------------------------|
G|------------------2-2-4-2-2-2-4-2----------------------------------|
D|--2-2-4-2-2-2-4-2-0-0-0-0-0-0-0-0-2-2-4-2-2-2-4-2------------------|
A|--0-0-0-0-0-0-0-0-----------------0-0-0-0-0-0-0-0------------------|
E|--------------------------------------------------0-0-2-0-0-0-2-0--|
   |-- A (4 bars) --|-- D (2 bars) --|-- A (2 bars) --|-- E (1 bar) ---|`
  },
  {
    id: 'travis_fingerpicking',
    title: 'Travis Picking Alternating Bass Pattern',
    category: 'Rhythm',
    difficulty: 'Intermediate',
    suggestedBpm: 85,
    focusGoal: 'Thumb independence keeping steady quarter notes while fingers syncopate on treble strings.',
    description: 'Pinch on beat 1, alternating thumb on beats 1, 2, 3, 4 with syncopated index and middle plucks.',
    tablature: `e|--------0---------------0------------------------------------------|
B|----1-------1-------1-------1--------------------------------------|
G|----------------0---------------0----------------------------------|
D|--------2---------------2------------------------------------------|
A|3---------------3--------------------------------------------------|
E|-------------------------------------------------------------------|
  T   M   T   I   T   M   T   I   (Thumb = T, Index = I, Middle = M)`
  },
  {
    id: 'funk_16th_strum',
    title: 'Funk 16th Note Ghost Strumming',
    category: 'Rhythm',
    difficulty: 'Intermediate',
    suggestedBpm: 105,
    focusGoal: 'Non-stop pendulum right hand motion with left-hand fret-hand muting.',
    description: 'Continuous 16th-note down/up motion, squeezing fret hand only on accented beats.',
    tablature: `e|--x-x-7-x-x-7-x-x-7-x-x-7-x-x--------------------------------------|
B|--x-x-8-x-x-8-x-x-8-x-x-8-x-x--------------------------------------|
G|--x-x-7-x-x-7-x-x-7-x-x-7-x-x--------------------------------------|
D|--x-x-9-x-x-9-x-x-9-x-x-9-x-x--------------------------------------|
A|-------------------------------------------------------------------|
E|-------------------------------------------------------------------|
    d u d u d u d u d u d u d u d u`
  },
  {
    id: 'speed_burst_drills',
    title: '4-Note Burst Acceleration Drill',
    category: 'Speed Building',
    difficulty: 'Intermediate',
    suggestedBpm: 120,
    focusGoal: 'Building neuromuscular speed through short high-velocity bursts.',
    description: 'Play 3 quarter notes followed by a rapid 16th-note burst, then rest and repeat.',
    tablature: `e|-------------------------------------------------------------------|
B|-------------------------------------------------------------------|
G|-------------------------------------------------------------------|
D|-------------------------------------------------------------------|
A|-------------------------------------------------------------------|
E|--5-------5-------5-------5-6-7-8--5-------5-------5-------5-6-7-8-|
    Quarter Quarter Quarter [16ths]  Quarter Quarter Quarter [16ths]`
  },
  {
    id: 'bpm_pyramid_challenge',
    title: 'The BPM Pyramid Endurance Drill',
    category: 'Speed Building',
    difficulty: 'Advanced',
    suggestedBpm: 140,
    focusGoal: 'Sustained 16th note stamina without wrist or forearm tension.',
    description: 'Play continuous alternate picking on a single string for 1 minute intervals stepping BPM by +5 each cycle.',
    tablature: `e|--12-10-8-10-12-10-8-10-12-10-8-10-12-10-8-10----------------------|
B|-------------------------------------------------------------------|
G|-------------------------------------------------------------------|
D|-------------------------------------------------------------------|
A|-------------------------------------------------------------------|
E|-------------------------------------------------------------------|
    [ Continuous 16th notes: 140 BPM -> 160 BPM -> 180 BPM -> 200 BPM ]`
  }
];
