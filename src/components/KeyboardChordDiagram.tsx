import React from "react";
import { Volume2, Music } from "lucide-react";
import { KeyboardVoicing, NoteName } from "../types";
import { audioEngine } from "../lib/audio";
import { NOTE_SEMITONES } from "../data/musicTheory";

interface KeyboardChordDiagramProps {
  chordName: string;
  voicing: KeyboardVoicing;
  root: NoteName;
  instrument?: string;
  isSelected?: boolean;
  onPlay?: () => void;
  onSelect?: () => void;
  className?: string;
}

export const KeyboardChordDiagram: React.FC<KeyboardChordDiagramProps> = ({
  chordName,
  voicing,
  root,
  instrument,
  isSelected = false,
  onPlay,
  onSelect,
  className = "",
}) => {
  // Determine keyboard range to render (minOctave to maxOctave)
  const startOctave = voicing.startOctave;
  const octavesCount = Math.max(2, voicing.octavesCount);

  // Map notes by pitch value: (octave * 12 + semitone) -> note info
  const chordPitchMap = new Map<
    number,
    {
      note: NoteName;
      octave: number;
      degree: string;
      isRoot: boolean;
      hand?: "LH" | "RH";
    }
  >();

  voicing.notes.forEach((n) => {
    const pitch = n.octave * 12 + (NOTE_SEMITONES[n.note] ?? 0);
    chordPitchMap.set(pitch, {
      note: n.note,
      octave: n.octave,
      degree: n.degree,
      isRoot: !!n.isRoot || n.note === root,
      hand: n.hand,
    });
  });

  // Sound audition handler
  const handlePlaySound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay();
      return;
    }

    const notesToPlay = voicing.notes.map((n) => ({
      note: n.note,
      octave: n.octave,
    }));

    const targetInst = instrument || audioEngine.getSelectedInstrument();
    const isSynth = targetInst.includes("synth");
    const stagger = isSynth ? 0.012 : 0.016;
    audioEngine.playChordArpeggio(notesToPlay, targetInst, stagger, 0, 2.2, true);
  };

  // Keyboard dimensions for SVG
  const whiteKeyWidth = 22;
  const whiteKeyHeight = 85;
  const blackKeyWidth = 13;
  const blackKeyHeight = 54;

  const totalWhiteKeys = octavesCount * 7;
  const totalWidth = totalWhiteKeys * whiteKeyWidth;
  const totalHeight = whiteKeyHeight + 20;

  // White key relative semitone offsets from C
  const whiteKeyOffsets = [0, 2, 4, 5, 7, 9, 11];
  const whiteKeyNames: NoteName[] = ["C", "D", "E", "F", "G", "A", "B"];

  // Black keys positions (after which white key index)
  // 0: C# (after C), 1: D# (after D), 3: F# (after F), 4: G# (after G), 5: A# (after A)
  const blackKeyDefs: {
    [offsetIdx: number]: { note: NoteName; semi: number };
  } = {
    0: { note: "C#", semi: 1 },
    1: { note: "D#", semi: 3 },
    3: { note: "F#", semi: 6 },
    4: { note: "G#", semi: 8 },
    5: { note: "A#", semi: 10 },
  };

  return (
    <div
      className={`bg-surface-container-low border rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-md transition-all cursor-pointer relative group select-none ${
        isSelected
          ? "border-primary ring-2 ring-primary/30 bg-primary/5"
          : "border-outline-variant/30 hover:border-outline-variant/70 hover:shadow-lg"
      } ${className}`}
      onClick={(e) => {
        if (onSelect) onSelect();
        handlePlaySound(e);
      }}
      title="Click keyboard diagram to preview chord sound"
    >
      {/* Top Header */}
      <div className="w-full flex items-center justify-between gap-2 mb-3 pb-2 border-b border-outline-variant/20">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-xs sm:text-sm text-on-surface truncate">
              {voicing.name}
            </span>
            <span className="text-[10px] font-mono text-on-surface-variant truncate">
              {voicing.positionLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-mono font-bold bg-surface-container border border-outline-variant/30 text-primary px-2 py-0.5 rounded-full">
            Bass: {voicing.bassNote}
            {voicing.bassOctave}
          </span>
        </div>
      </div>

      {/* Mini Keyboard Diagram SVG Canvas */}
      <div className="w-full flex justify-center py-2 overflow-x-auto overflow-y-hidden">
        <svg
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          className="w-full max-w-[280px] h-auto overflow-visible select-none drop-shadow-sm"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Defs for gradients & filters */}
          <defs>
            <linearGradient id="activeWhiteKeyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-primary)"
                stopOpacity="0.25"
              />
              <stop
                offset="100%"
                stopColor="var(--color-primary)"
                stopOpacity="0.85"
              />
            </linearGradient>
            <linearGradient id="activeRootKeyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--color-primary)"
                stopOpacity="0.4"
              />
              <stop
                offset="100%"
                stopColor="var(--color-primary)"
                stopOpacity="1"
              />
            </linearGradient>
          </defs>

          {/* 1. Render White Keys First */}
          {Array.from({ length: octavesCount }).map((_, octIdx) => {
            const currentOctave = startOctave + octIdx;

            return whiteKeyOffsets.map((offset, keyIdx) => {
              const globalKeyIndex = octIdx * 7 + keyIdx;
              const xPos = globalKeyIndex * whiteKeyWidth;
              const pitch = currentOctave * 12 + offset;
              const chordInfo = chordPitchMap.get(pitch);
              const isChordKey = !!chordInfo;
              const isRootKey = chordInfo?.isRoot;

              return (
                <g key={`white-${currentOctave}-${keyIdx}`}>
                  {/* Key Body */}
                  <rect
                    x={xPos + 0.5}
                    y={2}
                    width={whiteKeyWidth - 1}
                    height={whiteKeyHeight}
                    rx={3}
                    ry={3}
                    fill={
                      isRootKey
                        ? "var(--color-primary)"
                        : isChordKey
                          ? "var(--color-inverse-surface)"
                          : "var(--color-surface-container-highest)"
                    }
                    stroke={
                      isChordKey
                        ? "var(--color-inverse-surface)"
                        : "var(--color-outline-variant)"
                    }
                    strokeWidth={isChordKey ? 1.5 : 0.8}
                    className="transition-colors"
                  />

                  {/* Root / Chord Accent Dot & Degree on Bottom of White Key */}
                  {isChordKey && (
                    <g
                      transform={`translate(${xPos + whiteKeyWidth / 2}, ${whiteKeyHeight - 12})`}
                    >
                      <circle
                        r={isRootKey ? 7.5 : 6.5}
                        fill={
                          isRootKey
                            ? "var(--color-primary)"
                            : "var(--color-inverse-surface)"
                        }
                        stroke={isRootKey ? "#fff" : "var(--color-inverse-on-surface)"}
                        strokeWidth={1.2}
                      />
                      <text
                        y={3}
                        fill={
                          isRootKey
                            ? "var(--color-on-primary)"
                            : "var(--color-inverse-on-surface)"
                        }
                        fontSize={isRootKey ? "8" : "7.5"}
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {chordInfo.degree}
                      </text>
                    </g>
                  )}

                  {/* Note Name & Octave (e.g. C3) at very bottom */}
                  {isChordKey && (
                    <text
                      x={xPos + whiteKeyWidth / 2}
                      y={whiteKeyHeight + 14}
                      fill="var(--color-on-surface)"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {chordInfo.note}
                    </text>
                  )}
                </g>
              );
            });
          })}

          {/* 2. Render Black Keys on Top */}
          {Array.from({ length: octavesCount }).map((_, octIdx) => {
            const currentOctave = startOctave + octIdx;

            return Object.entries(blackKeyDefs).map(
              ([whiteOffsetIdxStr, def]) => {
                const whiteOffsetIdx = Number(whiteOffsetIdxStr);
                const globalKeyIndex = octIdx * 7 + whiteOffsetIdx;
                const xPos =
                  globalKeyIndex * whiteKeyWidth +
                  (whiteKeyWidth - blackKeyWidth / 2);
                const pitch = currentOctave * 12 + def.semi;
                const chordInfo = chordPitchMap.get(pitch);
                const isChordKey = !!chordInfo;
                const isRootKey = chordInfo?.isRoot;

                return (
                  <g key={`black-${currentOctave}-${def.note}`}>
                    {/* Black Key Body */}
                    <rect
                      x={xPos}
                      y={2}
                      width={blackKeyWidth}
                      height={blackKeyHeight}
                      rx={2}
                      ry={2}
                      fill={
                        isRootKey
                          ? "var(--color-primary)"
                          : isChordKey
                            ? "#000000"
                            : "var(--color-surface-container-low)"
                      }
                      stroke={isChordKey ? "#27272a" : "transparent"}
                      strokeWidth={isChordKey ? 1.2 : 0.6}
                      className="transition-colors"
                    />

                    {/* Degree Marker on Black Key */}
                    {isChordKey && (
                      <g
                        transform={`translate(${xPos + blackKeyWidth / 2}, ${blackKeyHeight - 9})`}
                      >
                        <circle
                          r={5.5}
                          fill={isRootKey ? "#fff" : "transparent"}
                        />
                        <text
                          y={2.5}
                          fill={
                            isRootKey
                              ? "var(--color-primary)"
                              : "#ffffff"
                          }
                          fontSize="6.5"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {chordInfo.degree}
                        </text>
                      </g>
                    )}
                  </g>
                );
              },
            );
          })}
        </svg>
      </div>

      {/* Spelled Notes & Harmonic Flow */}
      <div className="w-full flex items-center justify-between pt-2 border-t border-outline-variant/15 mt-2">
        <div className="flex items-center gap-1 overflow-x-auto text-[10px] font-mono text-on-surface-variant font-medium">
          {voicing.notes.map((n, i) => (
            <span
              key={i}
              className={`px-1.5 py-0.5 rounded ${
                n.note === root || n.isRoot
                  ? "bg-primary/15 text-primary font-bold"
                  : "bg-surface-container text-on-surface"
              }`}
            >
              {n.note}
              {n.octave}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={handlePlaySound}
          className="text-xs text-primary hover:text-primary/80 font-bold px-2 py-0.5 rounded hover:bg-primary/10 transition-colors flex items-center gap-1 shrink-0"
        >
          <span>Audition</span>
        </button>
      </div>
    </div>
  );
};
