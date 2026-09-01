import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Grid3X3, 
  Dumbbell, 
  Compass, 
  BarChart3, 
  Settings, 
  Flame, 
  Music,
  Search,
  Sliders
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'scales' | 'chords' | 'exercises' | 'tools' | 'stats';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenSettings: () => void;
  streakDays: number;
  graceActive?: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettings,
  streakDays,
  graceActive = false,
  searchQuery,
  onSearchChange
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'DASHBOARD', icon: <LayoutDashboard size={18} /> },
    { id: 'scales', label: 'SCALES', icon: <Sparkles size={18} /> },
    { id: 'chords', label: 'CHORDS', icon: <Grid3X3 size={18} /> },
    { id: 'exercises', label: 'EXERCISES', icon: <Dumbbell size={18} /> },
    { id: 'tools', label: 'TOOLS', icon: <Compass size={18} /> },
    { id: 'stats', label: 'STATS', icon: <BarChart3 size={18} /> },
  ];

  return (
    <>
      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-50 flex-col border-r border-outline-variant/30 shadow-2xl">
        {/* Brand Logo */}
        <div className="px-8 py-7 flex items-center gap-3 border-b border-outline-variant/30">
          <div className="w-8 h-8 rounded-sm bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
            <Music size={18} />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-sm font-bold tracking-[0.25em] uppercase text-on-surface">
              Fret-Master
            </span>
            <span className="text-[9px] font-mono text-on-surface-variant tracking-wider">
              PRECISION AUDIO SUITE
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded text-left transition-all duration-200 group border-l-2 ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container border-primary font-semibold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface border-transparent'
                }`}
              >
                <span className={`mr-3.5 transition-colors ${isActive ? 'text-on-primary-container' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
                  {item.icon}
                </span>
                <span className="font-mono text-xs tracking-wider">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Streak & Consistency Footer Widget */}
        <div className="p-4 border-t border-outline-variant/30 space-y-3">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-3.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-[0.18em] text-on-surface-variant uppercase font-semibold">
                Practice Streak
              </span>
              {graceActive && (
                <span className="text-[9px] font-mono text-tertiary bg-tertiary/10 px-1.5 py-0.5 rounded border border-tertiary/20">
                  GRACE ACTIVE
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                <Flame size={15} className="animate-pulse" />
              </div>
              <span className="font-mono text-base font-bold text-on-surface tracking-wider">
                {streakDays} DAYS
              </span>
            </div>
          </div>

          <button
            onClick={onOpenSettings}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded bg-transparent hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface transition-colors border border-transparent hover:border-outline-variant/30"
          >
            <div className="flex items-center gap-3">
              <Sliders size={16} />
              <span className="font-mono text-xs tracking-wider uppercase">Studio Settings</span>
            </div>
            <Settings size={14} className="text-on-surface-variant" />
          </button>
        </div>
      </aside>

      {/* Top Global Header (Sticky on desktop & mobile) */}
      <header className="sticky top-0 z-40 h-16 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 px-4 lg:px-8 flex items-center justify-between lg:pl-80">
        {/* Search Theory Input */}
        <div className="flex items-center gap-3 w-full max-w-md">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search theory, scales, chords, exercises..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant/30 rounded py-1.5 pl-9 pr-4 text-xs font-mono text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Quick Tools & Profile */}
        <div className="flex items-center gap-3.5">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-primary/10 border border-primary/20 rounded font-mono text-[10px] text-primary tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            AUDIO: READY
          </div>

          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded bg-surface-container-low border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all"
            title="Studio Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest border-t border-outline-variant/30 z-50 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2 transition-colors ${
                isActive ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {item.icon}
              <span className="text-[9px] font-mono tracking-tighter">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
