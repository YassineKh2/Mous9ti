import React, { useEffect, useRef, useState } from "react";
import { Guitar, Piano, Plus } from "lucide-react";
import { SwipeableChordCard } from "./SwipeableChordCard";
import { ChordSearchInput } from "./ChordSearchInput";
import { NoteName } from "../types";

export const ChordSelectorWidget: React.FC = () => {
  const [selectedChords, setSelectedChords] = useState<
    { root: NoteName; type: string }[]
  >([
    { root: "C", type: "maj" },
    { root: "G", type: "maj" },
    { root: "A", type: "min" },
    { root: "F", type: "maj" },
  ]);
  const [instrument, setInstrument] = useState<"guitar" | "piano">("guitar");
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

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
    setSelectedChords(selectedChords.filter((_, i) => i !== index));
  };

  const visibleChords = isFullWidth
    ? selectedChords.slice(0, 3)
    : selectedChords.slice(0, 1);

  return (
    <div
      ref={widgetRef}
      className="flex h-full flex-col rounded-2xl border border-outline-variant/30 bg-surface-container p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-mono text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
          Chord Selector
        </h3>

        <div className="flex items-center gap-1.5">
          {/* Instrument Toggle: "button that has only icons" */}
          <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant/20 mr-2">
            <button
              onClick={() => setInstrument("guitar")}
              className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${instrument === "guitar" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest"}`}
              title="Guitar"
            >
              <Guitar size={15} />
            </button>
            <button
              onClick={() => setInstrument("piano")}
              className={`p-1.5 rounded-md transition-colors flex items-center justify-center ${instrument === "piano" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest"}`}
              title="Piano"
            >
              <Piano size={15} />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`grid flex-1 gap-4 ${isFullWidth ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}
      >
        {visibleChords.map((chord, i) => (
          <SwipeableChordCard
            key={`${chord.root}-${chord.type}-${i}`}
            root={chord.root}
            type={chord.type}
            instrument={instrument}
            onRemove={() => handleRemoveChord(i)}
            onChange={(newRoot, newType) => {
              const updated = [...selectedChords];
              updated[i] = { root: newRoot, type: newType };
              setSelectedChords(updated);
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
                    setSelectedChords([...selectedChords, { root, type }]);
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

      {/* If there are more chords than visible, show a tiny indicator */}
      {selectedChords.length > visibleChords.length && (
        <div className="mt-4 text-center text-[10px] font-mono text-on-surface-variant">
          + {selectedChords.length - visibleChords.length} more chords
        </div>
      )}
    </div>
  );
};
