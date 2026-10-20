import React, { useEffect, useState, useRef } from 'react';
import { 
  Square, 
  Mic, 
  MicOff, 
  Pause, 
  Play, 
  Clock, 
  AlertCircle, 
  FileText,
  Volume2,
  Sparkles
} from 'lucide-react';
import { CueCard } from '../types';
import { soundManager } from '../utils/audioChimes';
import { DigitalNotes } from './DigitalNotes';

interface PresentationPhaseProps {
  cueCard: CueCard;
  notes: string;
  onFinishPresentation: (elapsedSeconds: number) => void;
  recordAudioEnabled: boolean;
  isRecording: boolean;
  audioLevel: number;
  liveTranscript: string;
  presentationDuration?: number; // default 120s (2 minutes)
  onPauseRecording?: () => void;
  onResumeRecording?: () => void;
  permissionError?: string | null;
}

export const PresentationPhase: React.FC<PresentationPhaseProps> = ({
  cueCard,
  notes,
  onFinishPresentation,
  recordAudioEnabled,
  isRecording,
  audioLevel,
  liveTranscript,
  presentationDuration = 120,
  onPauseRecording,
  onResumeRecording,
  permissionError,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(presentationDuration);
  const [isPaused, setIsPaused] = useState(false);
  const elapsedSeconds = presentationDuration - secondsRemaining;

  useEffect(() => {
    if (isPaused) return;

    if (secondsRemaining <= 0) {
      soundManager.playExamFinish();
      onFinishPresentation(presentationDuration);
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        const next = prev - 1;
        // 15 seconds warning
        if (next === 15) {
          soundManager.playWarningTick(true);
        } else if (next <= 3 && next > 0) {
          soundManager.playWarningTick(false);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, isPaused, presentationDuration, onFinishPresentation]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = (elapsedSeconds / presentationDuration) * 100;
  const isUrgent = secondsRemaining <= 15;
  const isSufficientDuration = elapsedSeconds >= 90; // In IELTS, 1.5 - 2 minutes is ideal

  const handleTogglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      onResumeRecording?.();
    } else {
      setIsPaused(true);
      onPauseRecording?.();
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Presentation Banner */}
      <div className={`rounded-3xl p-5 sm:p-6 border transition-all shadow-md ${
        isUrgent 
          ? 'bg-rose-950 text-white border-rose-700 ring-2 ring-rose-500' 
          : 'bg-slate-900 text-white border-slate-800'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Timers & Recording Status */}
          <div className="flex items-center gap-5">
            {/* Circular Countdown */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="stroke-slate-800"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className={`transition-all duration-1000 ${
                    isUrgent ? 'stroke-rose-500' : 'stroke-rose-600'
                  }`}
                  strokeWidth="6"
                  strokeDasharray="213.6"
                  strokeDashoffset={213.6 - (213.6 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-mono text-xl font-extrabold tracking-tight">
                  {formatTime(secondsRemaining)}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400">
                  Left
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider uppercase bg-rose-600 text-white">
                  Phase 2 of 2
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Elapsed: {formatTime(elapsedSeconds)} / 2:00
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                {isPaused ? 'Presentation Paused' : 'Candidate Presentation in Progress'}
              </h2>

              {/* Recording Indicator */}
              <div className="flex items-center gap-2 text-xs">
                {recordAudioEnabled ? (
                  isRecording && !isPaused ? (
                    <div className="flex items-center gap-2 text-rose-400 font-medium">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      <span>Recording voice live for examiner feedback</span>
                    </div>
                  ) : (
                    <span className="text-amber-400">Recording paused</span>
                  )
                ) : (
                  <span className="text-slate-400">Audio recording disabled (speaking without mic)</span>
                )}
              </div>
            </div>
          </div>

          {/* Center: Live Waveform / Audio Visualizer */}
          {recordAudioEnabled && (
            <div className="flex-1 max-w-xs mx-auto lg:mx-0 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <div className="flex items-center gap-1.5 h-8">
                {Array.from({ length: 16 }).map((_, i) => {
                  const factor = Math.sin((i / 16) * Math.PI);
                  const barHeight = Math.max(
                    4,
                    Math.round(factor * (audioLevel * 0.8) + (isRecording && !isPaused ? 4 : 2))
                  );
                  return (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-75 ${
                        audioLevel > 15
                          ? 'bg-rose-500'
                          : audioLevel > 5
                          ? 'bg-emerald-400'
                          : 'bg-slate-600'
                      }`}
                      style={{ height: `${Math.min(32, barHeight)}px` }}
                    />
                  );
                })}
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1">
                {audioLevel > 10 ? 'Mic Level Active' : 'Speak clearly into your microphone'}
              </span>
            </div>
          )}

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleTogglePause}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              onClick={() => {
                soundManager.playExamFinish();
                onFinishPresentation(elapsedSeconds);
              }}
              className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all ${
                isSufficientDuration
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
              }`}
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Finish Speaking ({formatTime(elapsedSeconds)})</span>
            </button>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="w-full bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              isUrgent ? 'bg-rose-500' : progressPercent >= 75 ? 'bg-emerald-500' : 'bg-rose-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {permissionError && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            {permissionError}. You can still present and write/review your speech transcript afterwards!
          </span>
        </div>
      )}

      {/* Presentation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Cue Card Reminder */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100">
                Cue Card Topic
              </span>
              <span className="text-xs text-slate-500">IELTS Speaking Part 2</span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 leading-snug">
              {cueCard.title}
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
                Points to cover:
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-800">
                {cueCard.cuePoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Speaking reminder advice */}
            <div className="mt-4 p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-950 text-xs leading-relaxed">
              💡 <strong>Examiner Tip:</strong> Keep going continuously without long unnatural silences. If you run out of things to say about one bullet point, immediately transition to the next or elaborate with a personal anecdote!
            </div>
          </div>

          {/* Live Transcript preview if supported */}
          {liveTranscript && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-rose-600" />
                  Live Speech Capture (Preview)
                </span>
                <span className="text-[10px] text-slate-400">Auto-transcribing</span>
              </div>
              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono leading-relaxed max-h-28 overflow-y-auto">
                {liveTranscript}
              </p>
            </div>
          )}
        </div>

        {/* Right: Notes Reference */}
        <div className="lg:col-span-5">
          <div className="sticky top-20">
            <DigitalNotes
              notes={notes}
              onChange={() => {}}
              readOnly={true}
              compact={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
