import React, { useState } from 'react';
import { 
  Shuffle, 
  Lightbulb, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { CueCard } from '../types';

interface CueCardDisplayProps {
  cueCard: CueCard;
  onPickRandom: () => void;
  onOpenLibrary: () => void;
  onOpenGenerateModal: () => void;
  isLocked?: boolean; // When in active test
}

export const CueCardDisplay: React.FC<CueCardDisplayProps> = ({
  cueCard,
  onPickRandom,
  onOpenLibrary,
  onOpenGenerateModal,
  isLocked = false,
}) => {
  const [showVocab, setShowVocab] = useState(false);
  const [showTips, setShowTips] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Test Booklet Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-rose-600 text-white">
            IELTS Speaking
          </span>
          <span className="text-xs font-semibold tracking-wide text-slate-300">
            Candidate Task Card • Part 2
          </span>
        </div>

        {!isLocked && (
          <div className="flex items-center gap-2">
            <button
              onClick={onPickRandom}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors"
              title="Pick a random cue card"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Random</span>
            </button>
            <button
              onClick={onOpenLibrary}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors"
              title="Browse all topics"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>All Topics</span>
            </button>
          </div>
        )}
      </div>

      {/* Official Booklet Instruction */}
      <div className="p-6 sm:p-7">
        <div className="mb-4 text-xs font-medium text-slate-500 bg-amber-50/70 border border-amber-200/60 rounded-lg p-3 leading-relaxed">
          <strong className="text-amber-900 font-semibold">Official Instructions:</strong> You will have to talk about the topic for one to two minutes. You have one minute to think about what you are going to say. You can make some notes to help you if you wish.
        </div>

        {/* Cue Card Main Prompt */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-rose-700 bg-rose-50 mb-2 border border-rose-100 uppercase tracking-wide">
            <Tag className="w-3 h-3" />
            {cueCard.category}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight">
            {cueCard.title}
          </h2>
        </div>

        {/* You should say bullet list */}
        <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3.5 tracking-wide">
            You should say:
          </h3>
          <ul className="space-y-2.5">
            {cueCard.cuePoints.map((point, idx) => {
              const isLast = idx === cueCard.cuePoints.length - 1;
              return (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-800">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    isLast 
                      ? 'bg-rose-100 text-rose-700 border border-rose-300' 
                      : 'bg-white text-slate-600 border border-slate-300'
                  }`}>
                    {idx + 1}
                  </span>
                  <span className={`leading-relaxed ${isLast ? 'font-medium text-rose-950' : ''}`}>
                    {point}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Study Extras: Band Tips & Vocabulary Upgrades */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          {/* Suggested Band 7-8 Vocabulary Toggle */}
          {cueCard.suggestedVocab && cueCard.suggestedVocab.length > 0 && (
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              <button
                onClick={() => setShowVocab(!showVocab)}
                className="w-full px-4 py-3 text-left flex items-center justify-between bg-slate-50/60 hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    Target Band 7–8+ Topic Vocabulary ({cueCard.suggestedVocab.length} words)
                  </span>
                </div>
                {showVocab ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {showVocab && (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
                  {cueCard.suggestedVocab.map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-lg bg-amber-50/40 border border-amber-200/60 text-xs"
                    >
                      <div className="flex items-baseline justify-between mb-1">
                        <span className="font-bold text-amber-950 text-sm">{item.word}</span>
                      </div>
                      <p className="text-slate-600 mb-1.5">{item.meaning}</p>
                      <p className="italic text-slate-700 bg-white/80 p-1.5 rounded border border-amber-100">
                        "{item.example}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Examiner Band Tips Toggle */}
          {cueCard.bandTips && cueCard.bandTips.length > 0 && (
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              <button
                onClick={() => setShowTips(!showTips)}
                className="w-full px-4 py-3 text-left flex items-center justify-between bg-slate-50/60 hover:bg-slate-100/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-800">
                    Examiner Tips for this Topic
                  </span>
                </div>
                {showTips ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {showTips && (
                <div className="p-4 bg-white space-y-2">
                  {cueCard.bandTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
