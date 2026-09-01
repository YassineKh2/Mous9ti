import React, { useState, useMemo } from "react";
import { Volume2, Music, Sparkles } from "lucide-react";
import { NoteName } from "../types";
import { audioEngine } from "../lib/audio";

interface ChordNoteVoicing {
  noteName: string;
  octave: number;
}

interface ChordSheetMusicProps {
  chordName: string;
  notes?: string[];
  exactVoicing?: ChordNoteVoicing[];
  root?: string;
  onPlay?: () => void;
  className?: string;
}

const DIATONIC_STEPS: Record<string, number> = {
  C: 0,
  D: 1,
  E: 2,
  F: 3,
  G: 4,
  A: 5,
  B: 6,
};

// Compute total diatonic step relative to C4 (C4 = 0, D4 = 1, E4 = 2 ... C5 = 7, B3 = -1, A3 = -2, etc.)
function getDiatonicStep(letter: string, octave: number): number {
  const base = DIATONIC_STEPS[letter.toUpperCase()] ?? 0;
  return (octave - 4) * 7 + base;
}

export const ChordSheetMusic: React.FC<ChordSheetMusicProps> = ({
  chordName,
  notes = [],
  exactVoicing,
  root,
  onPlay,
  className = "",
}) => {
  const [hoveredNoteKey, setHoveredNoteKey] = useState<string | null>(null);
  const [clefMode, setClefMode] = useState<
    "auto" | "treble" | "bass" | "grand"
  >("auto");

  // Derive exact pitch voicing with octave
  const pitchVoicing: ChordNoteVoicing[] = useMemo(() => {
    if (exactVoicing && exactVoicing.length > 0) {
      return exactVoicing;
    }

    if (!notes || notes.length === 0) return [];

    let currentOctave = 4;
    let prevStep = -1;

    return notes.map((n, idx) => {
      const letter = n.charAt(0).toUpperCase();
      const step = DIATONIC_STEPS[letter] ?? 0;
      if (idx > 0 && step <= prevStep) {
        currentOctave += 1;
      }
      prevStep = step;

      return {
        noteName: n,
        octave: currentOctave,
      };
    });
  }, [exactVoicing, notes]);

  // Determine active clef presentation
  const activeClef = useMemo(() => {
    if (clefMode !== "auto") return clefMode;
    if (pitchVoicing.length === 0) return "treble";

    const minStep = Math.min(
      ...pitchVoicing.map((v) =>
        getDiatonicStep(v.noteName.charAt(0), v.octave),
      ),
    );
    const maxStep = Math.max(
      ...pitchVoicing.map((v) =>
        getDiatonicStep(v.noteName.charAt(0), v.octave),
      ),
    );

    // If span covers both bass and treble register, use grand staff
    if (minStep < -2 && maxStep > 2) {
      return "grand";
    }
    // If predominantly below Middle C (C4)
    if (maxStep < 2) {
      return "bass";
    }
    // Default to treble
    return "treble";
  }, [pitchVoicing, clefMode]);

  // Dimensions & Coordinate System - Optimized for generous readability
  const lineSpacing = 14; // 14px per staff space for crisp clarity
  const stepHeight = lineSpacing / 2; // 7px per diatonic step
  const staffStartX = 32;
  const staffEndX = 388;
  const noteBaseX = 220; // Center X for chord stack with plenty of horizontal clearance

  const isGrand = activeClef === "grand";
  const isBassOnly = activeClef === "bass";

  const svgWidth = 420;
  const svgHeight = isGrand ? 210 : 142;

  // Treble staff coordinates (Lines: E4=line 1 (bottom), G4=line 2, B4=line 3, D5=line 4, F5=line 5 (top))
  // Diatonic steps: C4=0, E4=2 (bottom line), G4=4, F5=9 (top line)
  const trebleTopLineY = isGrand ? 36 : 38;
  const trebleBottomLineY = trebleTopLineY + 4 * lineSpacing; // 36 + 56 = 92
  const trebleGLineY = trebleBottomLineY - lineSpacing; // Line 2 from bottom (G4, step 4)

  // Bass staff coordinates (Lines: G2=line 1 (bottom), B2=line 2, D3=line 3, F3=line 4, A3=line 5 (top))
  // Diatonic steps: C4=0, A3=-2 (top line), F3=-4 (line 4), G2=-9 (bottom line)
  const bassTopLineY = isGrand ? 130 : 38;
  const bassBottomLineY = bassTopLineY + 4 * lineSpacing; // 130 + 56 = 186
  const bassFLineY = bassTopLineY + lineSpacing; // Line 4 from bottom / Line 2 from top (F3, step -4)

  // Calculate note positions & ledgers
  const processedNotes = useMemo(() => {
    if (pitchVoicing.length === 0) return [];

    // Sort ascending pitch
    const sorted = [...pitchVoicing].sort((a, b) => {
      const stepA = getDiatonicStep(a.noteName.charAt(0), a.octave);
      const stepB = getDiatonicStep(b.noteName.charAt(0), b.octave);
      return stepA - stepB;
    });

    const baseNotes = sorted.map((item) => {
      const letter = item.noteName.charAt(0).toUpperCase();
      const accidental = item.noteName.slice(1);
      const step = getDiatonicStep(letter, item.octave);

      let targetY = 0;
      const ledgerLines: number[] = [];

      if (isGrand) {
        if (step >= 0) {
          // Treble staff (C4 and above)
          targetY = trebleBottomLineY - (step - 2) * stepHeight;

          // Ledger lines below treble staff (C4, A3, etc.)
          if (step <= 0) {
            for (let s = 0; s >= step; s -= 2) {
              ledgerLines.push(trebleBottomLineY - (s - 2) * stepHeight);
            }
          } else if (step >= 10) {
            // High A5 (step 10), C6 (step 12)
            for (let s = 10; s <= step; s += 2) {
              ledgerLines.push(trebleBottomLineY - (s - 2) * stepHeight);
            }
          }
        } else {
          // Bass staff (Below C4)
          targetY = bassTopLineY - (step - -2) * stepHeight;

          // Ledger lines above bass staff (Middle C = 0)
          if (step >= 0) {
            for (let s = 0; s <= step; s += 2) {
              ledgerLines.push(bassTopLineY - (s - -2) * stepHeight);
            }
          } else if (step <= -10) {
            // Low E2 (step -11), C2 (step -14)
            for (let s = -10; s >= step; s -= 2) {
              ledgerLines.push(bassTopLineY - (s - -2) * stepHeight);
            }
          }
        }
      } else if (isBassOnly) {
        // Pure Bass Staff: A3 (step -2) = top line, G2 (step -9) = bottom line
        targetY = bassTopLineY - (step - -2) * stepHeight;

        if (step >= 0) {
          for (let s = 0; s <= step; s += 2) {
            ledgerLines.push(bassTopLineY - (s - -2) * stepHeight);
          }
        } else if (step <= -10) {
          for (let s = -10; s >= step; s -= 2) {
            ledgerLines.push(bassTopLineY - (s - -2) * stepHeight);
          }
        }
      } else {
        // Pure Treble Staff: E4 (step 2) = bottom line, F5 (step 9) = top line
        targetY = trebleBottomLineY - (step - 2) * stepHeight;

        if (step <= 0) {
          for (let s = 0; s >= step; s -= 2) {
            ledgerLines.push(trebleBottomLineY - (s - 2) * stepHeight);
          }
        } else if (step >= 10) {
          for (let s = 10; s <= step; s += 2) {
            ledgerLines.push(trebleBottomLineY - (s - 2) * stepHeight);
          }
        }
      }

      return {
        ...item,
        keyId: `${item.noteName}-${item.octave}`,
        letter,
        accidental,
        step,
        y: targetY,
        ledgerLines,
      };
    });

    const closeStepThreshold = 1;
    const accidentalStepThreshold = 2;
    const noteShiftX = 22;
    const accidentalColumnSpacing = 12;
    const accidentalBaseX = noteBaseX - 26;

    const withNoteColumns: Array<
      (typeof baseNotes)[number] & {
        noteColumn: number;
        x: number;
      }
    > = [];

    // Assign the first free notehead column for notes that are vertically close.
    for (const note of baseNotes) {
      const usedColumns = new Set(
        withNoteColumns
          .filter(
            (prev) => Math.abs(prev.step - note.step) <= closeStepThreshold,
          )
          .map((prev) => prev.noteColumn),
      );

      let noteColumn = 0;
      while (usedColumns.has(noteColumn)) {
        noteColumn += 1;
      }

      withNoteColumns.push({
        ...note,
        noteColumn,
        x: noteBaseX + noteColumn * noteShiftX,
      });
    }

    const withFinalLayout: Array<
      (typeof withNoteColumns)[number] & {
        accidentalColumn: number;
        accidentalX: number;
      }
    > = [];

    // Assign accidental columns independently so symbols don't hit noteheads.
    for (const note of withNoteColumns) {
      if (!note.accidental) {
        withFinalLayout.push({
          ...note,
          accidentalColumn: 0,
          accidentalX: accidentalBaseX,
        });
        continue;
      }

      const usedAccidentalColumns = new Set(
        withFinalLayout
          .filter(
            (prev) =>
              prev.accidental &&
              Math.abs(prev.step - note.step) <= accidentalStepThreshold,
          )
          .map((prev) => prev.accidentalColumn),
      );

      let accidentalColumn = 0;
      while (usedAccidentalColumns.has(accidentalColumn)) {
        accidentalColumn += 1;
      }

      withFinalLayout.push({
        ...note,
        accidentalColumn,
        accidentalX:
          accidentalBaseX - accidentalColumn * accidentalColumnSpacing,
      });
    }

    return withFinalLayout;
  }, [
    pitchVoicing,
    isGrand,
    isBassOnly,
    trebleBottomLineY,
    bassTopLineY,
    stepHeight,
    noteBaseX,
  ]);

  const handlePlayChord = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay();
    } else if (pitchVoicing.length > 0) {
      const notesToPlay = pitchVoicing.map((v) => ({
        note: v.noteName as NoteName,
        octave: v.octave,
      }));
      audioEngine.playChordArpeggio(notesToPlay, "piano", 0.05);
    }
  };

  const handlePlaySingleNote = (
    e: React.MouseEvent,
    noteName: string,
    octave: number,
  ) => {
    e.stopPropagation();
    audioEngine.playPianoNote(noteName as NoteName, octave);
  };

  return (
    <div
      className={`bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-sm relative select-none hover:border-primary/40 transition-all ${className}`}
    >
      {/* Top Header & Clef Controls Bar */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/20 mb-2">
        <div className="flex items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-on-surface tracking-tight">
                Staff Notation & Sheet Music
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-container text-primary font-bold border border-outline-variant/30">
                {chordName}
              </span>
            </div>
          </div>
        </div>

        {/* Clef Switcher & Quick Play */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant/30 text-xs font-mono">
            <button
              type="button"
              onClick={() => setClefMode("auto")}
              className={`px-2 py-1 rounded-md transition-all ${
                clefMode === "auto"
                  ? "bg-primary text-on-primary font-bold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Auto
            </button>
            <button
              type="button"
              onClick={() => setClefMode("treble")}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                clefMode === "treble"
                  ? "bg-primary text-on-primary font-bold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              title="Treble Clef (G)"
            >
              <span
                style={{
                  fontFamily: 'Bravura, "Noto Music", serif',
                  fontSize: "14px",
                }}
              >
                𝄞
              </span>
              <span className="hidden sm:inline">Treble</span>
            </button>
            <button
              type="button"
              onClick={() => setClefMode("bass")}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                clefMode === "bass"
                  ? "bg-primary text-on-primary font-bold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              title="Bass Clef (F)"
            >
              <span
                style={{
                  fontFamily: 'Bravura, "Noto Music", serif',
                  fontSize: "14px",
                }}
              >
                𝄢
              </span>
              <span className="hidden sm:inline">Bass</span>
            </button>
            <button
              type="button"
              onClick={() => setClefMode("grand")}
              className={`px-2 py-1 rounded-md transition-all ${
                clefMode === "grand"
                  ? "bg-primary text-on-primary font-bold shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              title="Grand Staff"
            >
              Grand
            </button>
          </div>

          <button
            type="button"
            onClick={handlePlayChord}
            aria-label="Play notation"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-primary/20 text-primary border border-primary/30 transition-colors text-xs font-bold"
            title="Play chord audio"
          >
            <Volume2 size={15} />
            <span className="hidden sm:inline">Play</span>
          </button>
        </div>
      </div>

      {/* SVG Music Sheet Canvas with ample padding and background */}
      <div
        className="w-full flex justify-center items-center py-4 px-2 sm:px-6 bg-surface-container/40 rounded-xl border border-outline-variant/15 cursor-pointer hover:border-primary/30 transition-all my-2"
        onClick={handlePlayChord}
        title="Click to play chord"
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-[560px] h-auto overflow-visible select-none drop-shadow-xs"
        >
          {/* Grand Staff Left Brace & System Line */}
          {isGrand && (
            <g>
              {/* Classical Grand Staff Curly Brace */}
              <path
                d={`M ${staffStartX - 4} ${trebleTopLineY} C ${staffStartX - 11} ${(trebleTopLineY + bassBottomLineY) / 2 - 24}, ${staffStartX - 16} ${(trebleTopLineY + bassBottomLineY) / 2 - 6}, ${staffStartX - 20} ${(trebleTopLineY + bassBottomLineY) / 2} C ${staffStartX - 16} ${(trebleTopLineY + bassBottomLineY) / 2 + 6}, ${staffStartX - 11} ${(trebleTopLineY + bassBottomLineY) / 2 + 24}, ${staffStartX - 4} ${bassBottomLineY}`}
                fill="none"
                stroke="currentColor"
                className="text-on-surface stroke-[2.8]"
                strokeLinecap="round"
              />
              {/* Connecting Vertical System Bar */}
              <line
                x1={staffStartX}
                y1={trebleTopLineY}
                x2={staffStartX}
                y2={bassBottomLineY}
                stroke="currentColor"
                className="text-on-surface stroke-[2]"
              />
            </g>
          )}

          {/* TREBLE STAFF LINES (if grand or treble) */}
          {(isGrand || !isBassOnly) && (
            <g>
              {/* 5 Staff Lines */}
              {[0, 1, 2, 3, 4].map((i) => {
                const lineY = trebleTopLineY + i * lineSpacing;
                return (
                  <line
                    key={`tline-${i}`}
                    x1={staffStartX}
                    y1={lineY}
                    x2={staffEndX}
                    y2={lineY}
                    stroke="currentColor"
                    className="text-on-surface/85"
                    strokeWidth="1.3"
                  />
                );
              })}

              {/* Start & End Bar lines */}
              <line
                x1={staffStartX}
                y1={trebleTopLineY}
                x2={staffStartX}
                y2={trebleBottomLineY}
                stroke="currentColor"
                className="text-on-surface"
                strokeWidth="2"
              />
              <line
                x1={staffEndX}
                y1={trebleTopLineY}
                x2={staffEndX}
                y2={trebleBottomLineY}
                stroke="currentColor"
                className="text-on-surface/60"
                strokeWidth="1.5"
              />

              {/* Professional Standard SMuFL / Typography Treble Clef (G-Clef) */}
              {/* Anchored precisely on G4 (line 2 from bottom = trebleGLineY) */}
              <text
                x={staffStartX + 10}
                y={trebleGLineY + 2}
                className="fill-on-surface select-none pointer-events-none"
                style={{
                  fontFamily:
                    'Bravura, "Noto Music", "Segoe UI Symbol", "Apple Symbols", sans-serif',
                  fontSize: "60px",
                  fontWeight: "normal",
                  dominantBaseline: "central",
                }}
              >
                𝄞
              </text>
            </g>
          )}

          {/* BASS STAFF LINES (if grand or bass) */}
          {(isGrand || isBassOnly) && (
            <g>
              {/* 5 Staff Lines */}
              {[0, 1, 2, 3, 4].map((i) => {
                const lineY = bassTopLineY + i * lineSpacing;
                return (
                  <line
                    key={`bline-${i}`}
                    x1={staffStartX}
                    y1={lineY}
                    x2={staffEndX}
                    y2={lineY}
                    stroke="currentColor"
                    className="text-on-surface/85"
                    strokeWidth="1.3"
                  />
                );
              })}

              {/* Start & End Bar lines */}
              <line
                x1={staffStartX}
                y1={bassTopLineY}
                x2={staffStartX}
                y2={bassBottomLineY}
                stroke="currentColor"
                className="text-on-surface"
                strokeWidth="2"
              />
              <line
                x1={staffEndX}
                y1={bassTopLineY}
                x2={staffEndX}
                y2={bassBottomLineY}
                stroke="currentColor"
                className="text-on-surface/60"
                strokeWidth="1.5"
              />

              {/* Professional Standard SMuFL / Typography Bass Clef (F-Clef) */}
              {/* Anchored precisely on F3 (line 4 from bottom / line 2 from top = bassFLineY) */}
              <text
                x={staffStartX + 10}
                y={bassFLineY + 1}
                className="fill-on-surface select-none pointer-events-none"
                style={{
                  fontFamily:
                    'Bravura, "Noto Music", "Segoe UI Symbol", "Apple Symbols", sans-serif',
                  fontSize: "54px",
                  fontWeight: "normal",
                  dominantBaseline: "central",
                }}
              >
                𝄢
              </text>
            </g>
          )}

          {/* LEDGER LINES */}
          {processedNotes.map((note) => (
            <React.Fragment key={`ledger-grp-${note.keyId}`}>
              {note.ledgerLines.map((lineY, lIdx) => (
                <line
                  key={`ledger-${note.keyId}-${lIdx}`}
                  x1={note.x - 16}
                  y1={lineY}
                  x2={note.x + 16}
                  y2={lineY}
                  stroke="currentColor"
                  className="text-on-surface stroke-[2]"
                />
              ))}
            </React.Fragment>
          ))}

          {/* ACCIDENTALS & NOTEHEADS */}
          {processedNotes.map((note) => {
            const isHovered = hoveredNoteKey === note.keyId;

            return (
              <g
                key={`notehead-${note.keyId}`}
                className="cursor-pointer group/note"
              >
                {/* Stable hit area prevents hover jitter when visual note animates */}
                <ellipse
                  cx={note.x}
                  cy={note.y}
                  rx={15}
                  ry={11}
                  transform={`rotate(-25 ${note.x} ${note.y})`}
                  fill="transparent"
                  onMouseEnter={() => setHoveredNoteKey(note.keyId)}
                  onMouseLeave={() => setHoveredNoteKey(null)}
                  onClick={(e) =>
                    handlePlaySingleNote(e, note.noteName, note.octave)
                  }
                />

                {/* Standard Sharp Accidental glyph (#) */}
                {note.accidental === "#" && (
                  <text
                    x={note.accidentalX}
                    y={note.y - stepHeight + 2}
                    className="fill-primary select-none pointer-events-none font-bold"
                    style={{
                      fontFamily:
                        'Bravura, "Noto Music", "JetBrains Mono", sans-serif',
                      fontSize: "20px",
                      dominantBaseline: "central",
                      textAnchor: "middle",
                    }}
                  >
                    ♯
                  </text>
                )}

                {/* Standard Flat Accidental glyph (b) */}
                {note.accidental === "b" && (
                  <text
                    x={note.accidentalX + 1}
                    y={note.y - stepHeight}
                    className="fill-primary select-none pointer-events-none font-bold"
                    style={{
                      fontFamily:
                        'Bravura, "Noto Music", "JetBrains Mono", sans-serif',
                      fontSize: "20px",
                      dominantBaseline: "central",
                      textAnchor: "middle",
                    }}
                  >
                    ♭
                  </text>
                )}

                {/* Classical Whole Notehead / Chord Notehead */}
                <ellipse
                  cx={note.x}
                  cy={note.y}
                  rx={8.5}
                  ry={5.8}
                  transform={`rotate(-25 ${note.x} ${note.y})`}
                  className={`pointer-events-none transition-all duration-150 ${
                    isHovered
                      ? "fill-primary stroke-primary stroke-[2.8] scale-110"
                      : "fill-surface-container-highest stroke-on-surface stroke-[2.4]"
                  }`}
                />

                {/* Inner counter-angled hole for engraved whole note style */}
                <ellipse
                  cx={note.x}
                  cy={note.y}
                  rx={4.5}
                  ry={2.2}
                  transform={`rotate(-55 ${note.x} ${note.y})`}
                  className={`pointer-events-none ${
                    isHovered ? "fill-surface" : "fill-surface-container-high"
                  }`}
                />

                {/* Pitch Letter Center Marker */}
                <text
                  x={note.x}
                  y={note.y + 3.2}
                  textAnchor="middle"
                  className={`font-mono text-[10px] font-bold pointer-events-none transition-colors ${
                    isHovered ? "fill-primary" : "fill-on-surface"
                  }`}
                >
                  {note.letter}
                </text>

                {/* Hover Pitch Tooltip */}
                {isHovered && (
                  <g
                    transform={`translate(${note.x + 18}, ${note.y - 14})`}
                    className="pointer-events-none"
                  >
                    <rect
                      x="0"
                      y="-12"
                      width="42"
                      height="22"
                      rx="5"
                      className="fill-surface-container-highest stroke stroke-primary/70 shadow-xl"
                    />
                    <text
                      x="21"
                      y="3"
                      textAnchor="middle"
                      className="fill-primary font-mono text-xs font-extrabold"
                    >
                      {note.noteName}
                      {note.octave}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Notes List with pitch audio preview */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-outline-variant/20 mt-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-on-surface-variant uppercase tracking-wider">
            Chord Pitches:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {processedNotes.map((note) => (
              <button
                key={`chip-${note.keyId}`}
                type="button"
                onClick={(e) =>
                  handlePlaySingleNote(e, note.noteName, note.octave)
                }
                onMouseEnter={() => setHoveredNoteKey(note.keyId)}
                onMouseLeave={() => setHoveredNoteKey(null)}
                className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg transition-all border flex items-center gap-1 ${
                  hoveredNoteKey === note.keyId
                    ? "bg-primary text-on-primary border-primary scale-105 shadow-sm"
                    : "bg-surface-container text-on-surface border-outline-variant/30 hover:border-primary/50 hover:bg-surface-container-high"
                }`}
                title={`Click to play single note ${note.noteName}${note.octave}`}
              >
                <span>{note.noteName}</span>
                <span className="text-[10px] text-on-surface-variant font-normal opacity-80">
                  {note.octave}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-mono text-on-surface-variant/80">
          <Sparkles size={13} className="text-primary" />
          <span>
            {activeClef === "grand"
              ? "Grand Staff Notation"
              : activeClef === "bass"
                ? "Bass Clef Notation"
                : "Treble Clef Notation"}
          </span>
        </div>
      </div>
    </div>
  );
};
