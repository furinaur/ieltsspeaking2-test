import React, { useEffect, useState } from 'react';
import { 
  Mic, 
  Play, 
  Clock, 
  Sparkles, 
  Volume2, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { CueCard } from '../types';
import { soundManager } from '../utils/audioChimes';

interface TransitionPhaseProps {
  cueCard: CueCard;
  notes: string;
  onStartPresentation: () => void;
  recordAudioEnabled: boolean;
  onToggleRecordAudio: (enabled: boolean) => void;
  breakDuration?: number; // default 10s
}

export const TransitionPhase: React.FC<TransitionPhaseProps> = ({
  cueCard,
  notes,
  onStartPresentation,
  recordAudioEnabled,
  onToggleRecordAudio,
  breakDuration = 10,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(breakDuration);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      soundManager.playPresentationStart();
      onStartPresentation();
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = prev - 1;
        if (next <= 3 && next > 0) {
          soundManager.playWarningTick(true);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining, onStartPresentation]);

  const progressPercent = ((breakDuration - secondsRemaining) / breakDuration) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Central Break Card */}
      <div className="bg-gradient-to-b from-blue-900 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-800 text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            10-Second Transition Break
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Take a deep breath and get ready to speak
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            The preparation time is complete. Your 2-minute presentation will begin automatically. Keep your notes in front of you.
          </p>

          {/* Large Countdown Circle */}
          <div className="flex justify-center my-4">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-slate-800"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-rose-500 transition-all duration-1000"
                  strokeWidth="6"
                  strokeDasharray="301.59"
                  strokeDashoffset={301.59 - (301.59 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-mono text-3xl sm:text-4xl font-extrabold text-white animate-pulse">
                  {secondsRemaining}s
                </span>
                <span className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">
                  Break
                </span>
              </div>
            </div>
          </div>

          {/* Audio Recording Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <label className="flex items-center gap-3 bg-white/10 hover:bg-white/15 px-4 py-2.5 rounded-xl cursor-pointer border border-white/10 transition-colors">
              <input
                type="checkbox"
                checked={recordAudioEnabled}
                onChange={(e) => onToggleRecordAudio(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 focus:ring-offset-slate-900"
              />
              <div className="flex items-center gap-2 text-xs text-left">
                <Mic className={`w-4 h-4 ${recordAudioEnabled ? 'text-rose-400' : 'text-slate-400'}`} />
                <div>
                  <span className="font-semibold block text-slate-100">
                    Record Presentation Audio
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Used for AI Fluency, Grammar, Pronunciation & follow-up questions
                  </span>
                </div>
              </div>
            </label>

            <button
              onClick={() => {
                soundManager.playPresentationStart();
                onStartPresentation();
              }}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Speaking Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* Snapshot of notes and cue card for quick glance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cue Card Summary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Topic Reminder
          </span>
          <h4 className="text-sm font-bold text-slate-900 mb-2">
            {cueCard.title}
          </h4>
          <ul className="text-xs text-slate-600 space-y-1">
            {cueCard.cuePoints.map((p, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="font-semibold text-slate-400">•</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Notes Snapshot */}
        <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              Your 1-Min Notes
            </span>
            <span className="text-[10px] text-amber-700 font-mono">
              {notes.trim() ? `${notes.trim().split(/\s+/).length} words` : 'Empty'}
            </span>
          </div>
          <div className="bg-white/90 p-3 rounded-lg border border-amber-200/60 font-mono text-xs text-slate-800 max-h-32 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {notes.trim() || <span className="text-slate-400 italic">No notes were written during preparation.</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
