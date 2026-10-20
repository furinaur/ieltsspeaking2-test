import React from 'react';
import { X, Trash2, Calendar, Award, ChevronRight, FileText } from 'lucide-react';
import { PracticeHistoryItem } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: PracticeHistoryItem[];
  onSelectHistoryItem: (item: PracticeHistoryItem) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistoryItem,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const averageBand =
    history.length > 0
      ? (history.reduce((acc, h) => acc + h.overallBand, 0) / history.length).toFixed(1)
      : '0.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Your Practice History
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review past IELTS Part 2 performances, scores, and examiner feedback
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats summary bar */}
        {history.length > 0 && (
          <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Total Sessions
                </span>
                <p className="text-sm font-bold font-mono text-slate-800">
                  {history.length}
                </p>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Average Band
                </span>
                <p className="text-sm font-bold font-mono text-rose-600">
                  Band {averageBand}
                </p>
              </div>
            </div>

            <button
              onClick={onClearHistory}
              className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 transition-colors"
              title="Clear all saved history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}

        {/* List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {history.length > 0 ? (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectHistoryItem(item);
                  onClose();
                }}
                className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {item.cueCardCategory}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                    {item.cueCardTitle}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-1 italic">
                    "{item.transcriptSnippet}"
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-lg font-bold font-mono text-slate-900">
                      Band {item.overallBand.toFixed(1)}
                    </span>
                    <div className="flex gap-1 text-[9px] font-mono text-slate-400">
                      <span>FC:{item.fluencyBand}</span>
                      <span>LR:{item.vocabBand}</span>
                      <span>GR:{item.grammarBand}</span>
                      <span>PR:{item.pronunciationBand}</span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <FileText className="w-8 h-8 mx-auto text-slate-300" />
              <p>No practice sessions saved yet.</p>
              <p className="text-[11px]">
                Complete a 2-minute presentation and save your evaluation report!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
