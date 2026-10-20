import React, { useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  FastForward, 
  Timer, 
  HelpCircle, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { CueCard } from '../types';
import { CueCardDisplay } from './CueCardDisplay';
import { DigitalNotes } from './DigitalNotes';
import { soundManager } from '../utils/audioChimes';

interface PreparationPhaseProps {
  cueCard: CueCard;
  notes: string;
  onNotesChange: (notes: string) => void;
  onCompletePrep: () => void;
  prepDuration?: number; // default 60s
}

export const PreparationPhase: React.FC<PreparationPhaseProps> = ({
  cueCard,
  notes,
  onNotesChange,
  onCompletePrep,
  prepDuration = 60,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(prepDuration);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Play preparation start chime once mounted
    soundManager.playPrepStart();
  }, []);

  useEffect(() => {
    if (isPaused) return;

    if (secondsRemaining <= 0) {
      soundManager.playBreakStart();
      onCompletePrep();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = prev - 1;
        // Warning at 10s
        if (next === 10) {
          soundManager.playWarningTick(true);
        } else if (next <= 5 && next > 0) {
          soundManager.playWarningTick(false);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, isPaused, onCompletePrep]);

  const progressPercent = ((prepDuration - secondsRemaining) / prepDuration) * 100;
  const isUrgent = secondsRemaining <= 10;

  return (
    <div className="space-y-6">
      {/* Timer Bar Banner */}
      <div className={`rounded-2xl p-4 sm:p-5 border transition-all shadow-sm ${
        isUrgent 
          ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200' 
          : 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border-amber-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Circular / Digital Countdown Dial */}
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  className="stroke-slate-200"
                  strokeWidth="5"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  className={`transition-all duration-1000 ${
                    isUrgent ? 'stroke-rose-600' : 'stroke-amber-600'
                  }`}
                  strokeWidth="5"
                  strokeDasharray="175.9"
                  strokeDashoffset={175.9 - (175.9 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <span className={`absolute font-mono font-bold text-lg ${
                isUrgent ? 'text-rose-700 animate-pulse' : 'text-amber-900'
              }`}>
                {secondsRemaining}s
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900">
                  Phase 1 of 2
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Preparation Phase (1 Minute)
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {isUrgent ? (
                  <span className="text-rose-700 font-semibold animate-pulse">
                    ⚠️ Almost ready! Review your keywords before the transition break.
                  </span>
                ) : (
                  'Review the cue card and write your presentation keywords below.'
                )}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
              title={isPaused ? 'Resume Timer' : 'Pause Timer'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5 text-slate-600" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              onClick={() => {
                soundManager.playBreakStart();
                onCompletePrep();
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm shadow-slate-900/10"
            >
              <span>Skip to 10s Break</span>
              <FastForward className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200/70 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              isUrgent ? 'bg-rose-500' : 'bg-amber-500'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Cue Card on left, Digital Scratchpad on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <CueCardDisplay
            cueCard={cueCard}
            onPickRandom={() => {}}
            onOpenLibrary={() => {}}
            onOpenGenerateModal={() => {}}
            isLocked={true}
          />
        </div>

        <div className="lg:col-span-5">
          <DigitalNotes
            notes={notes}
            onChange={onNotesChange}
            readOnly={false}
          />

          {/* Strategy Tip Box */}
          <div className="mt-4 p-4 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 space-y-1.5">
            <h5 className="font-bold flex items-center gap-1.5 text-blue-950">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Examiner Note-Taking Strategy:
            </h5>
            <p className="text-slate-600 leading-relaxed">
              Don’t write full sentences—you won’t have time. Write 4 to 6 strong vocabulary words, past tense verbs, and a quick outline for the final "Why" question (which carries the most weight!).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
