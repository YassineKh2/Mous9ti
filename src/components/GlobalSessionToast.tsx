import React from 'react';
import { Play, Pause, Save, Clock } from 'lucide-react';

interface GlobalSessionToastProps {
  activeSessionDuration: number;
  isSessionActive: boolean;
  onToggleSession: () => void;
  onEndSession: () => void;
}

export const GlobalSessionToast: React.FC<GlobalSessionToastProps> = ({
  activeSessionDuration,
  isSessionActive,
  onToggleSession,
  onEndSession,
}) => {
  if (activeSessionDuration === 0 && !isSessionActive) {
    return null;
  }

  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs.toString() + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-surface-container-high border border-outline-variant/50 rounded-full shadow-2xl p-1.5 flex items-center gap-3 backdrop-blur-md">
        
        {/* Timer Display */}
        <div className="flex items-center gap-2 pl-3 pr-2 py-1.5">
          <Clock size={16} className={isSessionActive ? "text-primary animate-pulse" : "text-on-surface-variant"} />
          <span className="font-mono text-sm font-bold tracking-wider text-on-surface w-16 text-center">
            {formatTime(activeSessionDuration)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 pr-1.5">
          <button
            onClick={onToggleSession}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              isSessionActive
                ? 'bg-surface-container hover:bg-surface-container-highest text-on-surface'
                : 'bg-primary text-on-primary hover:bg-primary/90 shadow-lg shadow-primary/20'
            }`}
            title={isSessionActive ? 'Pause Session' : 'Resume Session'}
          >
            {isSessionActive ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
          </button>

          <button
            onClick={onEndSession}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container hover:bg-primary hover:text-on-primary text-on-surface transition-all"
            title="Log & Finish"
          >
            <Save size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
