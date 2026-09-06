import React, { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { SwipeableChordCard } from "./SwipeableChordCard";
import { ChordSearchInput } from "./ChordSearchInput";
import { ChordSelection } from "../types";
import { getSavedChordSelections, saveChordSelections } from "../lib/storage";

interface ChordSelectorWidgetProps {
  defaultInstrument: "guitar" | "piano";
  instrumentView: "guitar" | "piano" | "both";
}

export const ChordSelectorWidget: React.FC<ChordSelectorWidgetProps> = ({
  defaultInstrument,
  instrumentView,
}) => {
  const [selectedChords, setSelectedChords] = useState<ChordSelection[]>(() => {
    const savedChords = getSavedChordSelections();
    return savedChords.length > 0
      ? savedChords
      : [
          { root: "C", type: "maj" },
          { root: "G", type: "maj" },
          { root: "A", type: "min" },
        ];
  });
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveChordSelections(selectedChords);
  }, [selectedChords]);

  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget) return;

    const observer = new ResizeObserver(([entry]) => {
      setIsFullWidth(entry.contentRect.width >= 900);
    });

    observer.observe(widget);
    return () => observer.disconnect();
  }, []);

  const handleRemoveChord = (index: number) => {
    setSelectedChords((currentChords) =>
      currentChords.filter((_, i) => i !== index),
    );
  };

  const visibleChords = isFullWidth
    ? selectedChords.slice(0, 3)
    : selectedChords.slice(0, 1);
  const chordInstrument =
    instrumentView === "both" ? defaultInstrument : instrumentView;

  return (
    <div
      ref={widgetRef}
      className="flex h-full flex-col rounded-2xl border border-outline-variant/30 bg-surface-container p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
          Chord Selector
        </h3>
      </div>

      <div
        className={`grid flex-1 gap-4 ${isFullWidth ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
      >
        {visibleChords.map((chord, i) => (
          <SwipeableChordCard
            key={`${chord.root}-${chord.type}-${i}-${chordInstrument}`}
            root={chord.root}
            type={chord.type}
            instrument={chordInstrument}
            onRemove={() => handleRemoveChord(i)}
            onChange={(newRoot, newType) => {
              setSelectedChords((currentChords) => {
                const updated = [...currentChords];
                updated[i] = { root: newRoot, type: newType };
                return updated;
              });
            }}
          />
        ))}

        {visibleChords.length < (isFullWidth ? 3 : 1) && (
          <div className="flex flex-col items-center justify-center bg-surface-container-low/50 border border-dashed border-outline-variant/50 rounded-xl p-4 min-h-[140px] w-full">
            {isAdding ? (
              <div className="flex flex-col gap-3 w-full max-w-[200px]">
                <ChordSearchInput
                  autoFocus
                  onSelect={(root, type) => {
                    setSelectedChords((currentChords) => [
                      ...currentChords,
                      { root, type },
                    ]);
                    setIsAdding(false);
                  }}
                  onCancel={() => setIsAdding(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="w-12 h-12 rounded-full bg-surface-container hover:bg-surface-container-highest text-on-surface-variant hover:text-primary flex items-center justify-center transition-colors shadow-sm"
                title="Add Chord"
              >
                <Plus size={24} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
