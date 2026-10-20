import React, { useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Mic, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Upload,
  AlertCircle
} from 'lucide-react';
import { CueCard } from '../types';

interface ReviewPhaseProps {
  cueCard: CueCard;
  notes: string;
  durationSeconds: number;
  audioUrl: string | null;
  audioBlob: Blob | null;
  transcript: string;
  onTranscriptChange: (transcript: string) => void;
  onSubmitEvaluation: () => void;
  onRetakePresentation: () => void;
  onResetTest: () => void;
  isLoading: boolean;
  onAudioUpload?: (file: File) => void;
}

export const ReviewPhase: React.FC<ReviewPhaseProps> = ({
  cueCard,
  notes,
  durationSeconds,
  audioUrl,
  transcript,
  onTranscriptChange,
  onSubmitEvaluation,
  onRetakePresentation,
  onResetTest,
  isLoading,
  onAudioUpload,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationSeconds);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleTogglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleChangeRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAudioUpload) {
      onAudioUpload(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Presentation Completed
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Duration: {formatTime(durationSeconds)}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              Review Your Presentation
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Listen back to your recording, check the speech transcript, and generate official IELTS Examiner feedback.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRetakePresentation}
              disabled={isLoading}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Re-record</span>
            </button>
            <button
              onClick={onResetTest}
              disabled={isLoading}
              className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl transition-colors"
            >
              New Topic
            </button>
          </div>
        </div>

        {/* Audio Player */}
        <div className="my-6 p-5 rounded-2xl bg-slate-900 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Your Spoken Audio
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[0.8, 1.0, 1.25].map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleChangeRate(rate)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    playbackRate === rate
                      ? 'bg-rose-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>

          {audioUrl ? (
            <div className="space-y-3">
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
              />

              <div className="flex items-center gap-4">
                <button
                  onClick={handleTogglePlay}
                  className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 shrink-0 transition-transform hover:scale-105"
                  aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-white" />
                  ) : (
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  )}
                </button>

                <div className="flex-1 space-y-1">
                  <input
                    type="range"
                    min="0"
                    max={duration || durationSeconds}
                    step="0.1"
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full accent-rose-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration || durationSeconds)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center space-y-3">
              <p className="text-xs text-slate-400">
                No voice recording was captured for this session.
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 cursor-pointer border border-slate-700 transition-colors">
                <Upload className="w-3.5 h-3.5 text-rose-400" />
                <span>Upload Audio File (.webm, .mp3, .wav)</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Transcript Area */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-rose-600" />
              Speech Transcript
            </label>
            <span className="text-[11px] text-slate-400">
              {audioUrl ? 'Auto-transcribed or leave blank for Gemini direct audio listening' : 'Type/paste what you said'}
            </span>
          </div>

          <textarea
            value={transcript}
            onChange={(e) => onTranscriptChange(e.target.value)}
            rows={5}
            placeholder={
              audioUrl
                ? 'Your speech transcript will be verified by the examiner AI. You can also adjust or add details here...'
                : 'Please type or paste the speech you delivered during the 2 minutes so the examiner AI can evaluate your Fluency, Grammar, and Vocabulary...'
            }
            className="w-full p-4 rounded-2xl border border-slate-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50 text-xs sm:text-sm text-slate-800 leading-relaxed outline-none"
          />
        </div>

        {/* Submit to AI Examiner Button */}
        <div className="text-center pt-2">
          <button
            onClick={onSubmitEvaluation}
            disabled={isLoading || (!audioUrl && !transcript.trim())}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl transition-all ${
              isLoading || (!audioUrl && !transcript.trim())
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/25 hover:scale-[1.02]'
            }`}
          >
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
            <span>
              {isLoading
                ? 'Examiner AI is Assessing Your Speech...'
                : 'Evaluate Performance & Generate Follow-up Questions'}
            </span>
          </button>

          {isLoading && (
            <p className="text-xs text-slate-500 mt-3 animate-pulse">
              Analyzing Fluency & Coherence, Lexical Resource, Grammatical Accuracy, and Pronunciation...
            </p>
          )}
        </div>
      </div>

      {/* Snapshot Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Cue Card Topic
          </span>
          <h4 className="font-bold text-slate-900 text-sm mb-2">{cueCard.title}</h4>
          <ul className="space-y-1 text-slate-600">
            {cueCard.cuePoints.map((p, i) => (
              <li key={i}>• {p}</li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/70 shadow-sm text-xs">
          <span className="font-bold text-amber-900 uppercase tracking-wider block mb-1">
            Your 1-Min Notes
          </span>
          <p className="text-slate-700 whitespace-pre-wrap font-mono leading-relaxed max-h-24 overflow-y-auto">
            {notes.trim() || 'No notes were written.'}
          </p>
        </div>
      </div>
    </div>
  );
};
