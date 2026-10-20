import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  MessageSquare, 
  RotateCcw, 
  ArrowRight, 
  BookOpen, 
  HelpCircle, 
  Send, 
  Bookmark, 
  Volume2, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  ThumbsUp,
  Download
} from 'lucide-react';
import { CueCard, EvaluationResult } from '../types';

interface EvaluationViewProps {
  cueCard: CueCard;
  evaluation: EvaluationResult;
  notes: string;
  durationSeconds: number;
  onResetTest: () => void;
  onSaveHistory: () => void;
  isSaved?: boolean;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  cueCard,
  evaluation,
  notes,
  durationSeconds,
  onResetTest,
  onSaveHistory,
  isSaved = false,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'fluency' | 'vocab' | 'grammar' | 'pronunciation'>('all');
  const [followupAnswers, setFollowupAnswers] = useState<{ [index: number]: string }>({});
  const [followupFeedback, setFollowupFeedback] = useState<{ [index: number]: any }>({});
  const [isEvaluatingFollowup, setIsEvaluatingFollowup] = useState<{ [index: number]: boolean }>({});
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  const getBandBadgeColor = (band: number) => {
    if (band >= 8.0) return 'bg-emerald-500 text-white';
    if (band >= 7.0) return 'bg-blue-600 text-white';
    if (band >= 6.0) return 'bg-amber-500 text-white';
    return 'bg-rose-500 text-white';
  };

  const getBandDescription = (band: number) => {
    if (band >= 8.5) return 'Expert User (Band 8.5 - 9.0)';
    if (band >= 7.5) return 'Very Good User (Band 7.5 - 8.0)';
    if (band >= 6.5) return 'Good User (Band 6.5 - 7.0)';
    if (band >= 5.5) return 'Competent User (Band 5.5 - 6.0)';
    return 'Modest User (Band 5.0 or below)';
  };

  const handleFollowupSubmit = async (idx: number, question: string) => {
    const answer = followupAnswers[idx];
    if (!answer || !answer.trim()) return;

    setIsEvaluatingFollowup((prev) => ({ ...prev, [idx]: true }));
    try {
      const res = await fetch('/api/evaluate-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
      });
      if (!res.ok) {
        throw new Error(`Follow-up evaluation failed (HTTP ${res.status})`);
      }
      const data = await res.json();
      setFollowupFeedback((prev) => ({ ...prev, [idx]: data }));
    } catch (err) {
      console.error('Follow-up evaluation error:', err);
    } finally {
      setIsEvaluatingFollowup((prev) => ({ ...prev, [idx]: false }));
    }
  };

  const handleDownloadReport = () => {
    const reportText = `
IELTS SPEAKING PART 2 EVALUATION REPORT
========================================
Topic: ${cueCard.title}
Category: ${cueCard.category}
Overall Estimated Band: ${evaluation.overallBand} (${getBandDescription(evaluation.overallBand)})

CANDIDATE TRANSCRIPT:
${evaluation.transcript}

PREPARATION NOTES:
${notes || '(None)'}

CRITERIA BREAKDOWN:
1. Fluency & Coherence: Band ${evaluation.fluencyAndCoherence.band}
   Feedback: ${evaluation.fluencyAndCoherence.feedback}
   Discourse Markers Found: ${evaluation.fluencyAndCoherence.discourseMarkersFound.join(', ')}

2. Lexical Resource: Band ${evaluation.lexicalResource.band}
   Feedback: ${evaluation.lexicalResource.feedback}
   Strong Vocabulary: ${evaluation.lexicalResource.strongVocabulary.join(', ')}

3. Grammatical Range & Accuracy: Band ${evaluation.grammaticalRangeAndAccuracy.band}
   Feedback: ${evaluation.grammaticalRangeAndAccuracy.feedback}

4. Pronunciation: Band ${evaluation.pronunciation.band}
   Feedback: ${evaluation.pronunciation.feedback}

AREAS FOR IMPROVEMENT:
${evaluation.areasForImprovement.map((a, i) => `${i + 1}. ${a}`).join('\n')}

TAILORED FOLLOW-UP QUESTIONS:
${evaluation.followUpQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IELTS_Speaking_Report_${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Overall Score Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-9 shadow-xl border border-slate-700 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-600 text-white">
                Official IELTS Assessment
              </span>
              <span className="text-xs text-slate-300">Speaking Part 2</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {cueCard.title}
            </h2>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              {evaluation.summary}
            </p>
          </div>

          {/* Big Band Score Plaque */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 min-w-[190px] shrink-0 text-center shadow-inner">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Estimated Overall
            </span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-5xl sm:text-6xl font-extrabold text-white font-mono">
                {evaluation.overallBand.toFixed(1)}
              </span>
              <span className="text-base text-slate-300 font-mono">/ 9.0</span>
            </div>
            <span className="text-xs font-semibold text-rose-300">
              {getBandDescription(evaluation.overallBand)}
            </span>
          </div>
        </div>

        {/* 4 Pillars Band Score Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
              Fluency & Coherence
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold font-mono text-white">
                {evaluation.fluencyAndCoherence.band.toFixed(1)}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getBandBadgeColor(evaluation.fluencyAndCoherence.band)}`}>
                Band {evaluation.fluencyAndCoherence.band}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
              Lexical Resource
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold font-mono text-white">
                {evaluation.lexicalResource.band.toFixed(1)}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getBandBadgeColor(evaluation.lexicalResource.band)}`}>
                Band {evaluation.lexicalResource.band}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
              Grammatical Accuracy
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold font-mono text-white">
                {evaluation.grammaticalRangeAndAccuracy.band.toFixed(1)}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getBandBadgeColor(evaluation.grammaticalRangeAndAccuracy.band)}`}>
                Band {evaluation.grammaticalRangeAndAccuracy.band}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">
              Pronunciation
            </span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold font-mono text-white">
                {evaluation.pronunciation.band.toFixed(1)}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getBandBadgeColor(evaluation.pronunciation.band)}`}>
                Band {evaluation.pronunciation.band}
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar: Save & Export */}
        <div className="flex flex-wrap items-center justify-end gap-3 mt-6">
          <button
            onClick={onSaveHistory}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isSaved
                ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-500/40'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isSaved ? 'Saved to Practice History' : 'Save to Practice History'}</span>
          </button>

          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Report (.txt)</span>
          </button>

          <button
            onClick={onResetTest}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition-colors"
          >
            <span>Practice Another Topic</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Candidate Transcript Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Your Spoken Presentation Transcript
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Approx. {durationSeconds} seconds
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans bg-slate-50/70 p-4 rounded-xl border border-slate-200">
          "{evaluation.transcript}"
        </p>
      </div>

      {/* High-Level Strengths & Priority Improvement Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-emerald-50/60 rounded-2xl p-6 border border-emerald-200">
          <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2 mb-3">
            <ThumbsUp className="w-4 h-4 text-emerald-600" />
            Key Strengths Identified
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-emerald-900">
            {evaluation.keyStrengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Priority Areas for Improvement */}
        <div className="bg-amber-50/70 rounded-2xl p-6 border border-amber-200">
          <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Priority Areas for Improvement
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-amber-900">
            {evaluation.areasForImprovement.map((area, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detailed 4 Criteria Rubrics */}
      <div className="space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-rose-600" />
          Official Assessment Criteria Breakdown
        </h3>

        {/* Criteria Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          {[
            { id: 'all', label: 'All Criteria' },
            { id: 'fluency', label: '1. Fluency & Coherence' },
            { id: 'vocab', label: '2. Lexical Resource (Vocab)' },
            { id: 'grammar', label: '3. Grammar Range & Accuracy' },
            { id: 'pronunciation', label: '4. Pronunciation' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Criterion 1: Fluency and Coherence */}
        {(activeTab === 'all' || activeTab === 'fluency') && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  FC
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Fluency and Coherence
                  </h4>
                  <p className="text-xs text-slate-500">
                    Pacing, topic extension, self-correction, and discourse markers
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getBandBadgeColor(evaluation.fluencyAndCoherence.band)}`}>
                Band {evaluation.fluencyAndCoherence.band}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {evaluation.fluencyAndCoherence.feedback}
            </p>

            {/* Discourse markers found & suggested */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-1.5">
                  Discourse Markers Used:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {evaluation.fluencyAndCoherence.discourseMarkersFound.length > 0 ? (
                    evaluation.fluencyAndCoherence.discourseMarkersFound.map((m, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-[11px]">
                        ✓ {m}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic">Few cohesive connectors detected.</span>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 text-xs">
                <span className="font-bold text-blue-900 block mb-1.5">
                  Suggested High-Band Connectors:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {evaluation.fluencyAndCoherence.discourseMarkersSuggested.map((m, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-white text-blue-800 border border-blue-200 font-mono text-[11px]">
                      + {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-600 border border-slate-200">
              <strong>Pacing Analysis:</strong> {evaluation.fluencyAndCoherence.pacingFeedback}
            </div>
          </div>
        )}

        {/* Criterion 2: Lexical Resource / Vocabulary */}
        {(activeTab === 'all' || activeTab === 'vocab') && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  LR
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Lexical Resource (Vocabulary Range)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Range, precision, idiomatic expressions, and word choice
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getBandBadgeColor(evaluation.lexicalResource.band)}`}>
                Band {evaluation.lexicalResource.band}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {evaluation.lexicalResource.feedback}
            </p>

            {/* Strong vocabulary used */}
            {evaluation.lexicalResource.strongVocabulary.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Commendable Vocabulary Detected in Speech:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {evaluation.lexicalResource.strongVocabulary.map((word, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 text-xs font-medium">
                      ★ {word}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Vocabulary Upgrades Table */}
            {evaluation.lexicalResource.upgrades.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Target Band 7.5+ Lexical Upgrades:
                </span>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                      <tr>
                        <th className="p-3">Your Word/Phrase</th>
                        <th className="p-3">High-Band Upgrade</th>
                        <th className="p-3">Examiner Context</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {evaluation.lexicalResource.upgrades.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="p-3 font-mono text-rose-800 line-through bg-rose-50/40">
                            {item.original}
                          </td>
                          <td className="p-3 font-semibold text-emerald-800 bg-emerald-50/40">
                            {item.better}
                          </td>
                          <td className="p-3 text-slate-600">
                            {item.explanation}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Criterion 3: Grammatical Range and Accuracy */}
        {(activeTab === 'all' || activeTab === 'grammar') && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  GRA
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Grammatical Range and Accuracy
                  </h4>
                  <p className="text-xs text-slate-500">
                    Sentence structure variety, tense mastery, and error frequency
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getBandBadgeColor(evaluation.grammaticalRangeAndAccuracy.band)}`}>
                Band {evaluation.grammaticalRangeAndAccuracy.band}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {evaluation.grammaticalRangeAndAccuracy.feedback}
            </p>

            {/* Complex structures found */}
            {evaluation.grammaticalRangeAndAccuracy.complexStructuresFound.length > 0 && (
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Complex Structures Successfully Used:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {evaluation.grammaticalRangeAndAccuracy.complexStructuresFound.map((struct, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-mono">
                      ✓ {struct}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Error Corrections Table */}
            {evaluation.grammaticalRangeAndAccuracy.corrections.length > 0 ? (
              <div className="pt-2">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block mb-2">
                  Grammar Corrections & Rules:
                </span>
                <div className="space-y-2">
                  {evaluation.grammaticalRangeAndAccuracy.corrections.map((corr, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                        <span className="line-through text-rose-700 font-mono">
                          "{corr.original}"
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0 hidden sm:block" />
                        <span className="font-semibold text-emerald-800 font-mono">
                          "{corr.corrected}"
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] bg-white p-2 rounded border border-slate-200">
                        <strong>Rule:</strong> {corr.rule}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-50 text-xs text-emerald-900 border border-emerald-200">
                ✓ No critical grammatical breakdowns were detected in this speech sample!
              </div>
            )}
          </div>
        )}

        {/* Criterion 4: Pronunciation */}
        {(activeTab === 'all' || activeTab === 'pronunciation') && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                  PR
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Pronunciation
                  </h4>
                  <p className="text-xs text-slate-500">
                    Acoustic clarity, word and sentence stress, rhythm, and intonation
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getBandBadgeColor(evaluation.pronunciation.band)}`}>
                Band {evaluation.pronunciation.band}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {evaluation.pronunciation.feedback}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-teal-50/50 border border-teal-200 text-xs">
                <span className="font-bold text-teal-950 block mb-1.5">
                  Phonetic & Stress Focus:
                </span>
                <ul className="space-y-1 text-slate-700">
                  {evaluation.pronunciation.focusPoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-800 block mb-1.5">
                  Intonation & Connected Speech:
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {evaluation.pronunciation.intonationTips}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* REQUIREMENT 2: POSSIBLE QUESTIONS REGARDING THE RECORDING (PART 3 EXTENSION) */}
      <div className="bg-gradient-to-br from-rose-50/60 via-white to-red-50/40 rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-sm space-y-6">
        <div className="border-b border-rose-100 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 mb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            Session Follow-Up Questions (IELTS Part 3)
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Tailored Discussion Questions Based on Your Speech
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            In the real IELTS exam, after Part 2 the examiner transitions to Part 3 with deep discussion questions strictly anchored to the themes and specific stories you presented.
          </p>
        </div>

        {/* Follow-up Questions List with interactive answering */}
        <div className="space-y-4">
          {evaluation.followUpQuestions.map((q, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-rose-200/80 shadow-sm space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {q}
                  </h4>
                </div>
              </div>

              {/* Answer Input */}
              <div className="pt-1">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={followupAnswers[idx] || ''}
                    onChange={(e) =>
                      setFollowupAnswers((prev) => ({ ...prev, [idx]: e.target.value }))
                    }
                    placeholder="Type a 2-3 sentence practice answer to this follow-up..."
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-1 focus:ring-rose-200 outline-none text-slate-800"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleFollowupSubmit(idx, q);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleFollowupSubmit(idx, q)}
                    disabled={isEvaluatingFollowup[idx] || !followupAnswers[idx]?.trim()}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isEvaluatingFollowup[idx] || !followupAnswers[idx]?.trim()
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-rose-600 hover:bg-rose-500 text-white'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isEvaluatingFollowup[idx] ? 'Scoring...' : 'Evaluate'}</span>
                  </button>
                </div>

                {/* Instant Follow-up Feedback */}
                {followupFeedback[idx] && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        Examiner Score for this response:
                      </span>
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-blue-100 text-blue-800">
                        Band {followupFeedback[idx].band}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {followupFeedback[idx].feedback}
                    </p>
                    <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 text-amber-950">
                      <strong>Band 8.5+ Refinement:</strong> "{followupFeedback[idx].modelAnswer}"
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Examiner Rounding-off Question */}
        {evaluation.roundingOffQuestion && (
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-950">
            <span className="font-bold text-amber-900 uppercase tracking-wider block mb-1">
              Examiner’s Rounding-Off Question (Closing Part 2):
            </span>
            <p className="font-semibold text-slate-800 text-sm">
              "{evaluation.roundingOffQuestion}"
            </p>
            <p className="text-slate-500 mt-1 italic">
              (Note: In IELTS, keep your answer to the rounding-off question very brief—just 1 or 2 sentences before moving to Part 3).
            </p>
          </div>
        )}
      </div>

      {/* Exemplary Band 9 Model Answer */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setShowModelAnswer(!showModelAnswer)}
          className="w-full p-5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Examiner Band 9 Model Response for this Cue Card
              </h4>
              <p className="text-xs text-slate-500">
                See how a native or Band 9 speaker organizes ideas, transitions, and idioms
              </p>
            </div>
          </div>
          {showModelAnswer ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {showModelAnswer && (
          <div className="p-6 bg-slate-50/80 border-t border-slate-100 space-y-3">
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-serif italic whitespace-pre-wrap">
              "{evaluation.sampleBand9Answer}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
