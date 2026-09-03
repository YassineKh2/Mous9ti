import React from "react";
import { X, Volume2, Moon, Sun, Download, Trash2, Sliders } from "lucide-react";
import { AppSettings } from "../types";
import { GUITAR_TUNINGS } from "../data/musicTheory";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onExportData: () => void;
  onClearData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onExportData,
  onClearData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#141414] border border-white/10 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Sliders size={18} className="text-blue-400" />
            <h2 className="font-mono text-sm font-bold tracking-wider text-white uppercase">
              Studio Configuration
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
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Master Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-300 flex items-center gap-2">
                <Volume2 size={14} className="text-blue-400" />
                Master Synthesis Volume
              </span>
              <span className="text-blue-400 font-bold">
                {Math.round(settings.soundVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={settings.soundVolume}
              onChange={(e) =>
                onUpdateSettings({ soundVolume: parseFloat(e.target.value) })
              }
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div>
              <span className="font-mono text-xs font-semibold text-zinc-200 block">
                Visual Theme
              </span>
              <span className="text-[11px] text-zinc-400">
                High-contrast dark mode or bright studio mode
              </span>
            </div>

            <div className="flex items-center gap-1 bg-[#1c1b1b] p-1 rounded-lg border border-white/10">
              <button
                onClick={() => onUpdateSettings({ theme: "dark" })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  settings.theme === "dark"
                    ? "bg-blue-600 text-white font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Moon size={13} />
                <span>Dark</span>
              </button>
              <button
                onClick={() => onUpdateSettings({ theme: "light" })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  settings.theme === "light"
                    ? "bg-blue-600 text-white font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Sun size={13} />
                <span>Light</span>
              </button>
            </div>
          </div>

          {/* Default Guitar Tuning */}
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <label className="font-mono text-xs font-semibold text-zinc-200 block">
              Default Instrument Tuning
            </label>
            <select
              value={settings.defaultTuning}
              onChange={(e) =>
                onUpdateSettings({ defaultTuning: e.target.value })
              }
              className="w-full bg-[#1c1b1b] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              {GUITAR_TUNINGS.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name} ({t.strings.join(" ")})
                </option>
              ))}
            </select>
          </div>

          {/* Fret Count */}
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <label className="font-mono text-xs font-semibold text-zinc-200 block">
              Fretboard Length
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[12, 15, 21, 22, 24].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => onUpdateSettings({ fretCount: cnt })}
                  className={`py-2 rounded font-mono text-xs border transition-all ${
                    settings.fretCount === cnt
                      ? "bg-blue-600 text-white border-blue-500 font-bold"
                      : "bg-[#1c1b1b] border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  {cnt} Frets
                </button>
              ))}
            </div>
          </div>

          {/* Metronome Sound */}
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <label className="font-mono text-xs font-semibold text-zinc-200 block">
              Default Metronome Timbre
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(["click", "woodblock", "tick", "beep"] as const).map(
                (sound) => (
                  <button
                    key={sound}
                    onClick={() => onUpdateSettings({ metronomeSound: sound })}
                    className={`py-2 px-1 rounded font-mono text-[11px] uppercase border transition-all ${
                      settings.metronomeSound === sound
                        ? "bg-blue-600 text-white border-blue-500 font-bold"
                        : "bg-[#1c1b1b] border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {sound}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Data Management */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <span className="font-mono text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
              Data & Local Storage
            </span>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={onExportData}
                className="flex items-center gap-1.5 bg-[#1c1b1b] hover:bg-[#252424] border border-white/10 text-zinc-200 px-3.5 py-2 rounded text-xs font-mono transition-all"
              >
                <Download size={14} />
                <span>Export Sessions (JSON)</span>
              </button>

              <button
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to reset all practice logs and streaks?",
                    )
                  ) {
                    onClearData();
                  }
                }}
                className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-3.5 py-2 rounded text-xs font-mono transition-all"
              >
                <Trash2 size={14} />
                <span>Reset All Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
