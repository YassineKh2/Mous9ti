import React from "react";
import {
  X,
  Volume2,
  Moon,
  Sun,
  Download,
  Trash2,
  Sliders,
  Guitar,
  Piano,
  Compass,
} from "lucide-react";
import { AppSettings } from "../types";
import { GUITAR_TUNINGS } from "../data/musicTheory";
import { APP_VERSION } from "../lib/version";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onExportData: () => void;
  onClearData: () => void;
  onRestartTour: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onExportData,
  onClearData,
  onRestartTour,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-surface border border-outline-variant/30 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30">
          <div className="flex items-center gap-2.5">
            <Sliders size={18} className="text-primary" />
            <h2 className="font-mono text-sm font-bold tracking-wider text-on-surface uppercase">
              Studio Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-on-surface/5 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Master Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-on-surface-variant flex items-center gap-2">
                <Volume2 size={14} className="text-primary" />
                Master Synthesis Volume
              </span>
              <span className="text-primary font-bold">
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
              className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
            <div>
              <span className="font-mono text-xs font-semibold text-on-surface block">
                Visual Theme
              </span>
              <span className="text-[11px] text-on-surface-variant">
                High-contrast dark mode or bright studio mode
              </span>
            </div>

            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant/30">
              <button
                onClick={() => onUpdateSettings({ theme: "dark" })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  settings.theme === "dark"
                    ? "bg-primary text-on-primary font-bold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <Moon size={13} />
                <span>Dark</span>
              </button>
              <button
                onClick={() => onUpdateSettings({ theme: "light" })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  settings.theme === "light"
                    ? "bg-primary text-on-primary font-bold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <Sun size={13} />
                <span>Light</span>
              </button>
            </div>
          </div>

          {/* Default Instrument */}
          <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
            <div>
              <span className="font-mono text-xs font-semibold text-on-surface block">
                Default Instrument
              </span>
              <span className="text-[11px] text-on-surface-variant">
                Used as the starting instrument across the app
              </span>
            </div>

            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant/30">
              <button
                onClick={() =>
                  onUpdateSettings({ defaultInstrument: "guitar" })
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  settings.defaultInstrument === "guitar"
                    ? "bg-primary text-on-primary font-bold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <Guitar size={13} />
                <span>Guitar</span>
              </button>
              <button
                onClick={() => onUpdateSettings({ defaultInstrument: "piano" })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  settings.defaultInstrument === "piano"
                    ? "bg-primary text-on-primary font-bold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <Piano size={13} />
                <span>Piano</span>
              </button>
            </div>
          </div>

          {/* Default Guitar Tuning */}
          <div className="space-y-1.5 pt-2 border-t border-outline-variant/20">
            <label className="font-mono text-xs font-semibold text-on-surface block">
              Default Instrument Tuning
            </label>
            <select
              value={settings.defaultTuning}
              onChange={(e) =>
                onUpdateSettings({ defaultTuning: e.target.value })
              }
              className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
            >
              {GUITAR_TUNINGS.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name} ({t.strings.join(" ")})
                </option>
              ))}
            </select>
          </div>

          {/* Fret Count */}
          <div className="space-y-1.5 pt-2 border-t border-outline-variant/20">
            <label className="font-mono text-xs font-semibold text-on-surface block">
              Fretboard Length
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[12, 15, 21, 22, 24].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => onUpdateSettings({ fretCount: cnt })}
                  className={`py-2 rounded font-mono text-xs border transition-all ${
                    settings.fretCount === cnt
                      ? "bg-primary text-on-primary border-primary font-bold"
                      : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {cnt} Frets
                </button>
              ))}
            </div>
          </div>

          {/* Metronome Sound */}
          <div className="space-y-1.5 pt-2 border-t border-outline-variant/20">
            <label className="font-mono text-xs font-semibold text-on-surface block">
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
                        ? "bg-primary text-on-primary border-primary font-bold"
                        : "bg-surface-container border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {sound}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Data Management */}
          <div className="pt-4 border-t border-outline-variant/20 space-y-3">
            <span className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">
              Data & Local Storage
            </span>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { onRestartTour(); onClose(); }}
                className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface px-3.5 py-2 rounded text-xs font-mono transition-all"
              >
                <Compass size={14} />
                <span>Restart Tour</span>
              </button>

              <button
                onClick={onExportData}
                className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface px-3.5 py-2 rounded text-xs font-mono transition-all"
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
                className="flex items-center gap-1.5 bg-error/10 hover:bg-error/20 border border-error/30 text-error px-3.5 py-2 rounded text-xs font-mono transition-all"
              >
                <Trash2 size={14} />
                <span>Reset All Data</span>
              </button>
            </div>
          </div>

          {/* Version */}
          <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-widest text-on-surface-variant/50 uppercase">
              Mousi9ti
            </span>
            <span className="font-mono text-[10px] tracking-widest text-on-surface-variant/50">
              v{APP_VERSION}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
