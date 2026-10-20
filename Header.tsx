import React from 'react';
import { 
  BookOpen, 
  Volume2, 
  VolumeX, 
  History, 
  Sparkles, 
  RotateCcw,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { TestPhase } from '../types';

interface HeaderProps {
  currentPhase: TestPhase;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenHistory: () => void;
  onOpenCardLibrary: () => void;
  onResetTest: () => void;
  onGenerateAI: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPhase,
  soundEnabled,
  onToggleSound,
  onOpenHistory,
  onOpenCardLibrary,
  onResetTest,
  onGenerateAI,
  historyCount,
}) => {
  const getPhaseBadge = () => {
    switch (currentPhase) {
      case 'phase1_prep':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Phase 1: Preparation (1 Min)
          </span>
        );
      case 'transition':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 border border-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            Break / Transition (10s)
          </span>
        );
      case 'phase2_speak':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 border border-rose-300">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Phase 2: Presentation (2 Min)
          </span>
        );
      case 'review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-700 border border-indigo-300">
            <Clock className="w-3.5 h-3.5" />
            Ready for AI Evaluation
          </span>
        );
      case 'feedback':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Examiner Feedback Complete
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            IELTS Speaking Part 2
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <span className="font-extrabold text-sm tracking-wider font-mono">IELTS</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Speaking Part 2 <span className="text-rose-600 font-semibold">Simulator</span>
              </h1>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              1-min Prep Notes • 10s Break • 2-min Presentation • Examiner AI
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="hidden md:flex items-center">
          {getPhaseBadge()}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cue Card Library */}
          <button
            onClick={onOpenCardLibrary}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Browse Cue Card Topics"
          >
            <BookOpen className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">Topics</span>
          </button>

          {/* AI Custom Card */}
          <button
            onClick={onGenerateAI}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
            title="Generate Custom Topic with AI"
          >
            <Sparkles className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">AI Topic</span>
          </button>

          {/* Sound Mute/Unmute */}
          <button
            onClick={onToggleSound}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title={soundEnabled ? 'Mute Chimes' : 'Enable Chimes'}
            aria-label="Toggle sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* History */}
          <button
            onClick={onOpenHistory}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Past Practice Sessions"
            aria-label="Practice history"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>

          {/* Reset Test Button (only when in active test) */}
          {currentPhase !== 'idle' && (
            <button
              onClick={onResetTest}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Reset Test"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
