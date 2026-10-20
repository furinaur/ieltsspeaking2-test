import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Sparkles, 
  BookOpen, 
  Shuffle, 
  Mic, 
  Clock, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw,
  Volume2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CueCard, TestPhase, EvaluationResult, PracticeHistoryItem } from './types';
import { CUE_CARDS } from './data/cueCards';
import { soundManager } from './utils/audioChimes';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { Header } from './components/Header';
import { CueCardDisplay } from './components/CueCardDisplay';
import { PreparationPhase } from './components/PreparationPhase';
import { TransitionPhase } from './components/TransitionPhase';
import { PresentationPhase } from './components/PresentationPhase';
import { ReviewPhase } from './components/ReviewPhase';
import { EvaluationView } from './components/EvaluationView';
import { CardLibraryModal } from './components/CardLibraryModal';
import { CustomTopicModal } from './components/CustomTopicModal';
import { HistoryModal } from './components/HistoryModal';

const HISTORY_STORAGE_KEY = 'ielts_part2_practice_history';

export default function App() {
  const [currentPhase, setCurrentPhase] = useState<TestPhase>('idle');
  const [selectedCard, setSelectedCard] = useState<CueCard>(CUE_CARDS[0]);
  const [notes, setNotes] = useState<string>('');
  const [recordAudioEnabled, setRecordAudioEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [durationRecorded, setDurationRecorded] = useState<number>(120);

  // Modals
  const [cardLibraryOpen, setCardLibraryOpen] = useState(false);
  const [customTopicOpen, setCustomTopicOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Evaluation & History
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(false);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [practiceHistory, setPracticeHistory] = useState<PracticeHistoryItem[]>([]);
  const [isSavedInHistory, setIsSavedInHistory] = useState(false);

  // Audio Recorder Hook
  const {
    isRecording,
    isPaused,
    audioBlob,
    audioUrl,
    audioBase64,
    transcript,
    setTranscript,
    audioLevel,
    hasPermission,
    permissionError,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    loadAudioFile,
  } = useAudioRecorder();

  // Load history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (stored) {
        setPracticeHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load history from localStorage', e);
    }
  }, []);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.enabled = next;
  };

  const handlePickRandomCard = () => {
    const available = CUE_CARDS.filter((c) => c.id !== selectedCard.id);
    const randomIndex = Math.floor(Math.random() * available.length);
    setSelectedCard(available[randomIndex] || CUE_CARDS[0]);
  };

  // Phase Transitions
  const handleStartTest = () => {
    setNotes('');
    resetRecording();
    setEvaluation(null);
    setEvaluationError(null);
    setIsSavedInHistory(false);
    setCurrentPhase('phase1_prep');
  };

  const handleCompletePrep = () => {
    setCurrentPhase('transition');
  };

  const handleStartPresentation = async () => {
    setCurrentPhase('phase2_speak');
    if (recordAudioEnabled) {
      await startRecording();
    }
  };

  const handleFinishPresentation = async (elapsedSeconds: number) => {
    setDurationRecorded(elapsedSeconds);
    if (recordAudioEnabled) {
      await stopRecording();
    }
    setCurrentPhase('review');
  };

  const handleRetakePresentation = () => {
    resetRecording();
    setCurrentPhase('transition');
  };

  const handleResetTest = () => {
    if (currentPhase !== 'idle' && currentPhase !== 'feedback') {
      if (!window.confirm('Are you sure you want to exit the current test session?')) {
        return;
      }
    }
    resetRecording();
    setNotes('');
    setEvaluation(null);
    setEvaluationError(null);
    setIsSavedInHistory(false);
    setCurrentPhase('idle');
  };

  // Submit to Examiner AI
  const handleSubmitEvaluation = async () => {
    setIsLoadingEvaluation(true);
    setEvaluationError(null);

    try {
      // Netlify Functions reject request bodies over ~6 MB, so fail early with a clear message.
      const MAX_AUDIO_CHARS = 5_000_000;
      if (audioBase64 && audioBase64.length > MAX_AUDIO_CHARS) {
        const mb = (audioBase64.length * 0.75 / 1024 / 1024).toFixed(1);
        throw new Error(
          `This audio file is too large (about ${mb} MB). Please record again or upload a compressed file (MP3, M4A or WebM) under 3.5 MB.`
        );
      }

      const response = await fetch('/api/evaluate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cueCard: selectedCard,
          audioBase64: audioBase64 || undefined,
          mimeType: audioBlob?.type || 'audio/webm',
          transcript: transcript.trim() || undefined,
          notes: notes.trim() || undefined,
          durationSeconds: durationRecorded,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({} as { error?: string }));
        throw new Error(errJson.error || `Evaluation request failed (HTTP ${response.status})`);
      }

      const result: EvaluationResult = await response.json();
      setEvaluation(result);
      setCurrentPhase('feedback');
    } catch (err: any) {
      console.error('Evaluation error:', err);
      setEvaluationError(err.message || 'Failed to generate examiner feedback. Please verify and retry.');
    } finally {
      setIsLoadingEvaluation(false);
    }
  };

  // Save to Practice History
  const handleSaveHistory = () => {
    if (!evaluation || isSavedInHistory) return;

    const newItem: PracticeHistoryItem = {
      id: `history-${Date.now()}`,
      date: new Date().toISOString(),
      cueCardTitle: selectedCard.title,
      cueCardCategory: selectedCard.category,
      notes,
      durationSeconds: durationRecorded,
      overallBand: evaluation.overallBand,
      fluencyBand: evaluation.fluencyAndCoherence.band,
      grammarBand: evaluation.grammaticalRangeAndAccuracy.band,
      vocabBand: evaluation.lexicalResource.band,
      pronunciationBand: evaluation.pronunciation.band,
      transcriptSnippet: evaluation.transcript.slice(0, 100) + '...',
      evaluation,
    };

    const updated = [newItem, ...practiceHistory];
    setPracticeHistory(updated);
    setIsSavedInHistory(true);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all practice session history?')) {
      setPracticeHistory([]);
      try {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
      } catch (e) {}
    }
  };

  const handleSelectHistoryItem = (item: PracticeHistoryItem) => {
    setSelectedCard({
      id: `hist-${Date.now()}`,
      title: item.cueCardTitle,
      category: item.cueCardCategory as any,
      cuePoints: ['Previous session review'],
      bandTips: [],
      suggestedVocab: [],
    });
    setNotes(item.notes);
    setDurationRecorded(item.durationSeconds);
    setEvaluation(item.evaluation);
    setIsSavedInHistory(true);
    setCurrentPhase('feedback');
  };

  return (
    <div className="min-h-screen bg-slate-100/60 font-sans text-slate-900 flex flex-col antialiased selection:bg-rose-500 selection:text-white">
      {/* Header */}
      <Header
        currentPhase={currentPhase}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenHistory={() => setHistoryOpen(true)}
        onOpenCardLibrary={() => setCardLibraryOpen(true)}
        onResetTest={handleResetTest}
        onGenerateAI={() => setCustomTopicOpen(true)}
        historyCount={practiceHistory.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {evaluationError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs sm:text-sm flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block">Evaluation Notice:</span>
              <span>{evaluationError}</span>
            </div>
          </div>
        )}

        {/* Phase 0: IDLE SCREEN (Ready to start) */}
        {currentPhase === 'idle' && (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Hero Intro */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                <Sparkles className="w-3.5 h-3.5" />
                Official Exam Format Simulator
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Master IELTS Speaking Part 2
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Practice with authentic cue cards under real exam time limits. Get instant AI Examiner assessment across Fluency, Vocabulary, Grammar, Pronunciation, and tailored follow-up questions.
              </p>
            </div>

            {/* Test Flow Overview Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Phase 1: Preparation (1 Min)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    60-second countdown with digital scratchpad for rapid keyword notes.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Transition Break (10 Sec)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    A brief breathing break between preparation and presentation.
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-sm shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Phase 2: Presentation (2 Min)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Speak continuously for 2 minutes with audio recording and notes display.
                  </p>
                </div>
              </div>
            </div>

            {/* Cue Card Display */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Assigned Candidate Cue Card
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePickRandomCard}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>Pick Random Topic</span>
                  </button>
                  <button
                    onClick={() => setCardLibraryOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Browse All Topics</span>
                  </button>
                </div>
              </div>

              <CueCardDisplay
                cueCard={selectedCard}
                onPickRandom={handlePickRandomCard}
                onOpenLibrary={() => setCardLibraryOpen(true)}
                onOpenGenerateModal={() => setCustomTopicOpen(true)}
                isLocked={false}
              />
            </div>

            {/* Audio Recording Preference & Start CTA */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={recordAudioEnabled}
                  onChange={(e) => setRecordAudioEnabled(e.target.checked)}
                  className="w-5 h-5 rounded text-rose-600 focus:ring-rose-500 focus:ring-offset-2"
                />
                <div className="text-xs text-left">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Mic className="w-3.5 h-3.5 text-rose-600" />
                    Enable Voice Recording during Phase 2
                  </div>
                  <span className="text-slate-500">
                    Captures your spoken audio for AI feedback and tailored follow-up questions
                  </span>
                </div>
              </label>

              <button
                onClick={handleStartTest}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-rose-600/25 transition-all hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Phase 1: 1-Min Preparation</span>
              </button>
            </div>
          </div>
        )}

        {/* Phase 1: PREPARATION (1 minute) */}
        {currentPhase === 'phase1_prep' && (
          <PreparationPhase
            cueCard={selectedCard}
            notes={notes}
            onNotesChange={setNotes}
            onCompletePrep={handleCompletePrep}
            prepDuration={60}
          />
        )}

        {/* TRANSITION BREAK (10 seconds) */}
        {currentPhase === 'transition' && (
          <TransitionPhase
            cueCard={selectedCard}
            notes={notes}
            onStartPresentation={handleStartPresentation}
            recordAudioEnabled={recordAudioEnabled}
            onToggleRecordAudio={setRecordAudioEnabled}
            breakDuration={10}
          />
        )}

        {/* Phase 2: PRESENTATION (2 minutes) */}
        {currentPhase === 'phase2_speak' && (
          <PresentationPhase
            cueCard={selectedCard}
            notes={notes}
            onFinishPresentation={handleFinishPresentation}
            recordAudioEnabled={recordAudioEnabled}
            isRecording={isRecording}
            audioLevel={audioLevel}
            liveTranscript={transcript}
            presentationDuration={120}
            onPauseRecording={pauseRecording}
            onResumeRecording={resumeRecording}
            permissionError={permissionError}
          />
        )}

        {/* REVIEW PHASE */}
        {currentPhase === 'review' && (
          <ReviewPhase
            cueCard={selectedCard}
            notes={notes}
            durationSeconds={durationRecorded}
            audioUrl={audioUrl}
            audioBlob={audioBlob}
            transcript={transcript}
            onTranscriptChange={setTranscript}
            onSubmitEvaluation={handleSubmitEvaluation}
            onRetakePresentation={handleRetakePresentation}
            onResetTest={handleResetTest}
            isLoading={isLoadingEvaluation}
            onAudioUpload={loadAudioFile}
          />
        )}

        {/* FEEDBACK & EVALUATION RESULTS */}
        {currentPhase === 'feedback' && evaluation && (
          <EvaluationView
            cueCard={selectedCard}
            evaluation={evaluation}
            notes={notes}
            durationSeconds={durationRecorded}
            onResetTest={handleResetTest}
            onSaveHistory={handleSaveHistory}
            isSaved={isSavedInHistory}
          />
        )}
      </main>

      {/* Modals */}
      <CardLibraryModal
        isOpen={cardLibraryOpen}
        onClose={() => setCardLibraryOpen(false)}
        onSelectCard={(card) => {
          setSelectedCard(card);
          if (currentPhase === 'feedback') {
            setCurrentPhase('idle');
          }
        }}
        onOpenGenerateModal={() => setCustomTopicOpen(true)}
        selectedCardId={selectedCard.id}
      />

      <CustomTopicModal
        isOpen={customTopicOpen}
        onClose={() => setCustomTopicOpen(false)}
        onCardGenerated={(card) => {
          setSelectedCard(card);
          if (currentPhase === 'feedback') {
            setCurrentPhase('idle');
          }
        }}
      />

      <HistoryModal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={practiceHistory}
        onSelectHistoryItem={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
