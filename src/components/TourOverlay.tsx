import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, ArrowRight, ArrowLeft, CheckCircle2, Keyboard, MousePointerClick,
  ChevronRight, Check, RefreshCw,
  BookOpen, LayoutDashboard, Timer, Clock, Guitar, Play, Flame,
  Music, Music2, Layers, Settings2, Compass, BarChart3, Search, Trophy,
} from "lucide-react";
import { ActiveTab } from "./Navigation";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  tab?: ActiveTab;
  awaitAction?: boolean;
  action?: string;
}

// ─── Step Definitions ────────────────────────────────────────────────────────

const STEPS: TourStep[] = [
  { id: "welcome",         title: "Welcome to Mousi9ti",  description: "Your practice studio for guitar and piano. This tour walks through every section — about 2 minutes." },
  { id: "sidebar",         title: "Navigation",            description: "All 6 sections live in the sidebar. Click any item or press 1–6 on your keyboard to switch instantly.", targetSelector: "[data-tour='sidebar-nav']", tab: "dashboard" },
  { id: "metronome",       title: "Metronome",             description: "Set BPM, time signature, subdivision, and click sound. It keeps running globally even when you switch pages.", targetSelector: "[data-dashboard-widget='metronome']", tab: "dashboard", action: "Press Space to start / stop" },
  { id: "timer",           title: "Practice Timer",        description: "Countdown timer with one-tap presets. Link it to the metronome so it auto-stops when time's up.", targetSelector: "[data-dashboard-widget='timer']", tab: "dashboard" },
  { id: "drill",           title: "Random Note Drill",     description: "A random note appears — find it on the fretboard. Builds note recognition and position memory over time.", targetSelector: "[data-dashboard-widget='random-drill']", tab: "dashboard", action: "Press N for the next note" },
  { id: "session",         title: "Practice Session",      description: "Start a session to log your time. Ending it saves the session and counts toward your daily streak.", targetSelector: "[data-dashboard-widget='session']", tab: "dashboard" },
  { id: "streak",          title: "Practice Streak",       description: "Your daily streak with a 2-day grace period — one missed day won't reset the counter.", targetSelector: "[data-tour='sidebar-streak']", tab: "dashboard" },
  { id: "go-scales",       title: "Open Scales",           description: "Click SCALES in the sidebar to explore the scale library.", targetSelector: "[data-tour='nav-item-scales']", tab: "dashboard", awaitAction: true },
  { id: "scales-panel",    title: "Scale Explorer",        description: "Pick any root note and scale type. The fretboard and keyboard update instantly. Toggle note names, degrees, or intervals — then play the scale with the arrow buttons.", targetSelector: "[data-tour='scales-panel']", tab: "scales" },
  { id: "go-chords",       title: "Open Chords",           description: "Click CHORDS in the sidebar to browse chord voicings.", targetSelector: "[data-tour='nav-item-chords']", tab: "scales", awaitAction: true },
  { id: "chords-filters",  title: "Chord Library",         description: "Pick a root note and chord type. The diagram, piano view, and sheet notation update instantly. Tap Play to hear any voicing.", targetSelector: "[data-tour='chords-filters']", tab: "chords" },
  { id: "go-builder",      title: "Open Builder",          description: "Click BUILDER in the sidebar to open the chord progression builder.", targetSelector: "[data-tour='nav-item-builder']", tab: "chords", awaitAction: true },
  { id: "builder-controls",title: "Playback Controls",     description: "Choose your instrument, set tempo, and add reverb. Hit Play to loop your full chord progression with real instrument audio.", targetSelector: "[data-tour='builder-controls']", tab: "builder" },
  { id: "builder-queue",   title: "Chord Queue",           description: "Search for chords and add them to the queue. Set each chord's duration and strumming pattern individually. Load a preset or save your own progressions.", targetSelector: "[data-tour='builder-queue']", tab: "builder" },
  { id: "go-tools",        title: "Open Tools",            description: "Click TOOLS in the sidebar for the Circle of Fifths, tuner, and ear trainer.", targetSelector: "[data-tour='nav-item-tools']", tab: "builder", awaitAction: true },
  { id: "tools-tabs",      title: "Theory Tools",          description: "Switch between Circle of Fifths, Ear Trainer, Tuner, Metronome, Timer, and Custom Chord Builder using these tabs.", targetSelector: "[data-tour='tools-tabs']", tab: "tools" },
  { id: "go-stats",        title: "Open Stats",            description: "Click STATS to view your session history, BPM progression, and streak calendar.", targetSelector: "[data-tour='nav-item-stats']", tab: "tools", awaitAction: true },
  { id: "stats-metrics",   title: "Practice Analytics",    description: "Total time logged, current streak, longest streak, and peak BPM. Charts below show your daily minutes and BPM progression over time.", targetSelector: "[data-tour='stats-metrics']", tab: "stats" },
  { id: "search",          title: "Global Search",         description: "Search any scale, chord, or exercise from anywhere in the app. Try \"C minor\" or \"maj7\" to jump straight to it.", targetSelector: "[data-tour='search-bar']", tab: "stats" },
  { id: "done",            title: "You're all set!",       description: "Everything is ready. Use the book icon in the sidebar anytime to resume this tour.", tab: "dashboard" },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const SP_PAD = 10;

const SECTION_STARTS: Record<number, string> = {
  0: "Intro", 1: "Dashboard", 7: "Scales", 9: "Chords",
  11: "Builder", 14: "Tools", 16: "Stats", 18: "Finish",
};

// ─── Step Icons ───────────────────────────────────────────────────────────────

function getSidebarItemClass(i: number, stepIndex: number): string {
  if (i === stepIndex) return "bg-primary/12 text-on-surface";
  if (i < stepIndex) return "text-on-surface-variant/50 hover:bg-surface-container-high hover:text-on-surface";
  return "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface";
}

function getStepIcon(id: string): React.ReactNode {
  const map: Record<string, React.ReactNode> = {
    welcome:          <BookOpen size={34} />,
    sidebar:          <LayoutDashboard size={34} />,
    metronome:        <Timer size={34} />,
    timer:            <Clock size={34} />,
    drill:            <Guitar size={34} />,
    session:          <Play size={34} />,
    streak:           <Flame size={34} />,
    "go-scales":      <Music size={34} />,
    "scales-panel":   <Music2 size={34} />,
    "go-chords":      <Layers size={34} />,
    "chords-filters": <Layers size={34} />,
    "go-builder":     <Settings2 size={34} />,
    "builder-controls": <Settings2 size={34} />,
    "builder-queue":  <Settings2 size={34} />,
    "go-tools":       <Compass size={34} />,
    "tools-tabs":     <Compass size={34} />,
    "go-stats":       <BarChart3 size={34} />,
    "stats-metrics":  <BarChart3 size={34} />,
    search:           <Search size={34} />,
    done:             <Trophy size={34} />,
  };
  return map[id] ?? <BookOpen size={34} />;
}

// ─── Module-level Effect Helpers ─────────────────────────────────────────────

function resolveElement(
  selector: string | undefined,
  setRect: (r: DOMRect | null) => void,
): void {
  if (!selector) { setRect(null); return; }
  const el = document.querySelector(selector);
  if (!el) { setRect(null); return; }
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  setTimeout(() => {
    const el2 = document.querySelector(selector);
    setRect(el2 ? el2.getBoundingClientRect() : null);
  }, 120);
}

function addListener(
  target: Window,
  event: string,
  handler: EventListenerOrEventListenerObject,
): () => void {
  target.addEventListener(event, handler);
  return () => target.removeEventListener(event, handler);
}

function addTimeout(fn: () => void, ms: number): () => void {
  const id = setTimeout(fn, ms);
  return () => clearTimeout(id);
}

function attachClickAdvance(
  selector: string,
  setStep: React.Dispatch<React.SetStateAction<number>>,
): () => void {
  const el = document.querySelector(selector);
  if (!el) return () => {};
  const handler = () =>
    setTimeout(() => setStep((i) => Math.min(i + 1, STEPS.length - 1)), 80);
  el.addEventListener("click", handler);
  return () => el.removeEventListener("click", handler);
}

function makeKeyHandler(
  isFirst: boolean,
  isLast: boolean,
  awaitAction: boolean | undefined,
  onClose: () => void,
  setStep: React.Dispatch<React.SetStateAction<number>>,
): EventListener {
  return ((e: KeyboardEvent) => {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowRight" && !isLast && !awaitAction) setStep((i) => i + 1);
    if (e.key === "ArrowLeft" && !isFirst) setStep((i) => i - 1);
  }) as EventListener;
}

// ─── Spotlight (used in reveal mode) ─────────────────────────────────────────

interface SpotGeometry { top: number; left: number; width: number; height: number; }
interface TourSpotlightProps { spot: SpotGeometry | null; }

const TourSpotlight: React.FC<TourSpotlightProps> = ({ spot }) => {
  if (!spot) return null;
  return (
    <div
      style={{
        position: "fixed", top: spot.top, left: spot.left,
        width: spot.width, height: spot.height, borderRadius: 12,
        boxShadow: "0 0 0 9999px rgba(0,0,0,0.78)",
        border: "2px solid var(--color-primary)",
        zIndex: 250, pointerEvents: "none",
        transition: "top .28s ease,left .28s ease,width .28s ease,height .28s ease",
        animation: "tour-pulse-strong 1.1s ease-in-out infinite",
      }}
    >
      <div
        style={{ position: "absolute", bottom: -34, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary text-on-primary text-[10px] font-mono font-bold tracking-wide shadow-lg"
      >
        <MousePointerClick size={10} /> Click to continue
      </div>
    </div>
  );
};

// ─── Reveal-mode overlay (backdrop + controls) ────────────────────────────────

interface RevealOverlayProps {
  spot: SpotGeometry | null;
  onBack: () => void;
  onSkip: () => void;
}

const RevealOverlay: React.FC<RevealOverlayProps> = ({ spot, onBack, onSkip }) => (
  <>
    <TourSpotlight spot={spot} />
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 260 }} className="flex items-center gap-2">
      <button
        onClick={onSkip}
        className="px-3 py-2 rounded-lg font-mono text-[11px] text-on-surface-variant hover:text-on-surface border border-outline-variant/40 bg-surface/90 backdrop-blur-sm transition-colors"
      >
        Skip →
      </button>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono text-[11px] font-semibold bg-surface/90 backdrop-blur-sm border border-outline-variant/50 text-on-surface hover:bg-surface-container transition-colors"
      >
        <ArrowLeft size={12} /> Back to guide
      </button>
    </div>
  </>
);

// ─── Step Sidebar (left panel) ────────────────────────────────────────────────

interface TourSidebarProps {
  stepIndex: number;
  onGoToStep: (i: number) => void;
  onRestart: () => void;
}

const TourSidebar: React.FC<TourSidebarProps> = ({ stepIndex, onGoToStep, onRestart }) => {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [stepIndex]);

  return (
    <div className="flex flex-col h-full" style={{ width: 220, minWidth: 220 }}>
      {/* Panel header */}
      <div className="px-5 py-4 border-b border-outline-variant/20 shrink-0">
        <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-on-surface-variant/50 mb-0.5">
          App Tour
        </p>
        <p className="font-mono text-xs font-bold text-on-surface">
          {stepIndex + 1} / {STEPS.length} steps
        </p>
        {/* Progress bar */}
        <div className="mt-2.5 h-[3px] rounded-full bg-outline-variant/30 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step list */}
      <div className="overflow-y-auto flex-1 py-2">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            {SECTION_STARTS[i] && (
              <p className="px-4 pt-3 pb-1 font-mono text-[9px] uppercase tracking-[0.2em] text-on-surface-variant/40">
                {SECTION_STARTS[i]}
              </p>
            )}
            <button
              ref={i === stepIndex ? activeRef : undefined}
              onClick={() => onGoToStep(i)}
              className={`w-full text-left px-4 py-[6px] flex items-center gap-2.5 transition-colors ${getSidebarItemClass(i, stepIndex)}`}
            >
              {/* Status icon */}
              <span className="shrink-0 w-4 h-4 flex items-center justify-center">
                {i < stepIndex && <Check size={11} className="text-primary/70" />}
                {i === stepIndex && <ChevronRight size={11} className="text-primary" />}
                {i > stepIndex && s.awaitAction && <MousePointerClick size={9} className="text-on-surface-variant/35" />}
              </span>
              <span className={`font-mono text-[11px] leading-snug truncate ${i === stepIndex ? "font-semibold" : ""}`}>
                {s.title}
              </span>
            </button>
          </React.Fragment>
        ))}
        <div className="h-2" />
      </div>

      {/* Restart button */}
      <div className="px-4 py-3 border-t border-outline-variant/20 shrink-0">
        <button
          onClick={onRestart}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-[11px] text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-outline-variant/30 transition-colors"
        >
          <RefreshCw size={12} />
          Restart guide
        </button>
      </div>
    </div>
  );
};

// ─── Right Panel Content ──────────────────────────────────────────────────────

interface TourContentProps {
  step: TourStep;
  stepIndex: number;
  isFirst: boolean;
  isLast: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const TourContent: React.FC<TourContentProps> = ({
  step, stepIndex, isFirst, isLast, onClose, onNext, onPrev,
}) => (
  <div className="flex flex-col flex-1 min-w-0 h-full">
    {/* Header */}
    <div className="flex items-center justify-between px-7 py-4 border-b border-outline-variant/15 shrink-0">
      <span className="font-mono text-[11px] text-on-surface-variant">
        Step {stepIndex + 1} of {STEPS.length}
      </span>
      <button
        onClick={onClose}
        title="Close tour (Esc)"
        className="w-7 h-7 rounded flex items-center justify-center text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-high transition-colors"
      >
        <X size={14} />
      </button>
    </div>

    {/* Scrollable step content */}
    <div className="overflow-y-auto flex-1">
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="px-7 py-6 flex flex-col gap-5"
        >
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-[72px] h-[72px] rounded-2xl bg-primary/12 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
              {getStepIcon(step.id)}
            </div>
          </div>

          {/* Title + description */}
          <div className="text-center">
            <h2 className="font-mono font-bold text-[17px] text-on-surface mb-2 leading-snug">
              {step.title}
            </h2>
            <p className="font-mono text-[12.5px] text-on-surface-variant leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Keyboard shortcut hint */}
          {step.action && (
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-primary/8 border border-primary/18">
              <Keyboard size={14} className="text-primary shrink-0" />
              <span className="font-mono text-[11px] text-on-surface">{step.action}</span>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>

    {/* Footer navigation */}
    <div className="px-7 py-4 border-t border-outline-variant/15 shrink-0 flex items-center gap-3">
      {!isFirst ? (
        <button
          onClick={onPrev}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-mono text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-outline-variant/35 transition-colors"
        >
          <ArrowLeft size={12} /> Back
        </button>
      ) : <span />}

      <span className="flex-1 text-center font-mono text-[10px] text-on-surface-variant/40 hidden sm:block">
        Navigate with ← → keys
      </span>

      <TourActionButton isLast={isLast} onClick={onNext} />
    </div>
  </div>
);

// Extracted to avoid nested ternary
const TourActionButton: React.FC<{ isLast: boolean; onClick: () => void }> = ({ isLast, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 px-5 py-2 rounded-lg font-mono text-xs font-semibold bg-primary text-on-primary hover:brightness-110 active:scale-95 transition-all shadow-sm"
  >
    {isLast ? <><CheckCircle2 size={13} /> Done</> : <>Next <ArrowRight size={12} /></>}
  </button>
);

// ─── Custom Hook ──────────────────────────────────────────────────────────────

function useTourLogic(
  onClose: () => void,
  onTabChange: (tab: ActiveTab) => void,
  initialStep: number,
  onStepChange: (step: number) => void,
) {
  const [stepIndex, setStepIndex] = useState(() =>
    initialStep >= 0 && initialStep < STEPS.length ? initialStep : 0,
  );
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const step = STEPS[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === STEPS.length - 1;

  useEffect(() => {
    onStepChange(stepIndex);
  }, [stepIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const resolveTarget = useCallback(
    (selector?: string) => resolveElement(selector, setTargetRect),
    [],
  );

  const resolveCurrent = useCallback(
    () => resolveTarget(step.targetSelector),
    [step.targetSelector, resolveTarget],
  );

  useEffect(() => {
    if (step.tab) onTabChange(step.tab);
    setTargetRect(null);
    return addTimeout(resolveCurrent, 500);
  }, [stepIndex, resolveCurrent]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => addListener(window, "resize", resolveCurrent as EventListenerOrEventListenerObject),
    [resolveCurrent],
  );

  useEffect(() => {
    if (!step.awaitAction || !step.targetSelector) return;
    return attachClickAdvance(step.targetSelector, setStepIndex);
  }, [stepIndex, step.awaitAction, step.targetSelector]);

  useEffect(
    () => addListener(window, "keydown", makeKeyHandler(isFirst, isLast, step.awaitAction, onClose, setStepIndex)),
    [isFirst, isLast, onClose, step.awaitAction],
  );

  const handleNext = useCallback(() => {
    if (isLast) { onClose(); return; }
    setStepIndex(stepIndex + 1);
  }, [isLast, onClose, stepIndex]);

  const handlePrev = useCallback(() => {
    if (!isFirst) setStepIndex(stepIndex - 1);
  }, [isFirst, stepIndex]);

  return { step, stepIndex, isFirst, isLast, cardRef, targetRect, handleNext, handlePrev, setStepIndex };
}

// ─── Keyframes ────────────────────────────────────────────────────────────────

const KEYFRAMES = `
  @keyframes tour-pulse-strong {
    0%,100% { box-shadow:0 0 0 9999px rgba(0,0,0,.78),0 0 0 3px var(--color-primary); }
    50%      { box-shadow:0 0 0 9999px rgba(0,0,0,.68),0 0 0 8px color-mix(in srgb,var(--color-primary) 30%,transparent); }
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

interface TourOverlayProps {
  onClose: () => void;
  onTabChange: (tab: ActiveTab) => void;
  initialStep: number;
  onStepChange: (step: number) => void;
}

export const TourOverlay: React.FC<TourOverlayProps> = ({ onClose, onTabChange, initialStep, onStepChange }) => {
  const { step, stepIndex, isFirst, isLast, cardRef, targetRect, handleNext, handlePrev, setStepIndex } =
    useTourLogic(onClose, onTabChange, initialStep, onStepChange);

  // revealMode: hide the modal and show the spotlight for awaitAction steps.
  // Auto-enter reveal mode immediately for awaitAction steps so the user sees
  // the spotlight without needing to click "Show me" first.
  const [revealMode, setRevealMode] = useState(() => !!STEPS[initialStep]?.awaitAction);

  useEffect(() => {
    setRevealMode(!!step.awaitAction);
  }, [stepIndex, step.awaitAction]);

  const spot = targetRect
    ? { top: targetRect.top - SP_PAD, left: targetRect.left - SP_PAD, width: targetRect.width + SP_PAD * 2, height: targetRect.height + SP_PAD * 2 }
    : null;

  const handleRestart = () => {
    setStepIndex(0);
    setRevealMode(false);
  };

  if (revealMode) {
    return (
      <>
        <RevealOverlay
          spot={spot}
          onBack={() => setRevealMode(false)}
          onSkip={handleNext}
        />
        <style>{KEYFRAMES}</style>
      </>
    );
  }

  return (
    <>
      {/* Dark backdrop — clicking outside closes */}
      <div
        aria-hidden="true"
        className="fixed inset-0 bg-black/65 backdrop-blur-[2px] z-[200]"
        style={{ pointerEvents: "all" }}
      />

      {/* Centered modal */}
      <div
        className="fixed inset-0 z-[210] flex items-center justify-center p-4"
        style={{ pointerEvents: "none" }}
      >
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          style={{
            pointerEvents: "all",
            maxWidth: 680,
            width: "100%",
            height: "min(540px, calc(100vh - 32px))",
          }}
          className="bg-surface border border-outline-variant/40 rounded-3xl shadow-[0_32px_96px_rgba(0,0,0,0.7)] overflow-hidden flex"
        >
          {/* Left sidebar — step list */}
          <div className="border-r border-outline-variant/20 bg-surface-container/50 hidden sm:flex h-full overflow-hidden">
            <TourSidebar
              stepIndex={stepIndex}
              onGoToStep={setStepIndex}
              onRestart={handleRestart}
            />
          </div>

          {/* Right content panel */}
          <TourContent
            step={step}
            stepIndex={stepIndex}
            isFirst={isFirst}
            isLast={isLast}
            onClose={onClose}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        </motion.div>
      </div>

      <style>{KEYFRAMES}</style>
    </>
  );
};
