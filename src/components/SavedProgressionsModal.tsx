import React, { useState } from "react";
import { X, Save, Edit2, Trash2, Check, Clock, Library } from "lucide-react";
import { SavedProgression } from "../types";

interface SavedProgressionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progressions: SavedProgression[];
  onLoad: (progression: SavedProgression) => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
}

export const SavedProgressionsModal: React.FC<SavedProgressionsModalProps> = ({
  isOpen,
  onClose,
  progressions,
  onLoad,
  onRename,
  onDelete,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  if (!isOpen) return null;

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleSaveEdit = (id: string) => {
    if (editName.trim()) {
      onRename(id, editName.trim());
    }
    setEditingId(null);
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#141414] border border-white/10 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <Library size={20} className="text-primary" />
            <h2 className="font-mono text-sm font-bold tracking-wider text-white uppercase">
              Saved Progressions
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {progressions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <Library size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-mono font-bold text-zinc-400 mb-2">
                No Saved Progressions
              </p>
              <p className="text-sm font-mono">
                Save your chord progressions to load them later.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {progressions.map((prog) => (
                <div
                  key={prog.id}
                  className="bg-[#1c1b1b] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center hover:border-primary/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    {editingId === prog.id ? (
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(prog.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                          className="bg-black/50 border border-primary/50 rounded px-2 py-1 text-sm text-white font-bold focus:outline-none w-full max-w-[200px]"
                        />
                        <button
                          onClick={() => handleSaveEdit(prog.id)}
                          className="p-1.5 text-primary hover:bg-primary/20 rounded transition-colors"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 mb-1">
                        <h3
                          className="text-lg font-bold text-white truncate"
                          title={prog.name}
                        >
                          {prog.name}
                        </h3>
                        <button
                          onClick={() => handleStartEdit(prog.id, prog.name)}
                          className="text-zinc-500 hover:text-primary transition-colors opacity-0 hover:opacity-100 group-hover:opacity-100"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(prog.updatedAt)}
                      </span>
                      <span>•</span>
                      <span>{prog.queue.length} Chords</span>
                      <span>•</span>
                      <span>{prog.tempo} BPM</span>
                      <span>•</span>
                      <span
                        className="truncate max-w-[120px]"
                        title={prog.instrument}
                      >
                        {prog.instrument}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        onLoad(prog);
                        onClose();
                      }}
                      className="flex-1 sm:flex-none px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg text-sm font-bold transition-colors"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(`Delete progression "${prog.name}"?`)
                        ) {
                          onDelete(prog.id);
                        }
                      }}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-colors"
                      title="Delete Progression"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
