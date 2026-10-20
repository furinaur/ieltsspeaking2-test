import React, { useRef } from 'react';
import { Edit3, Plus, Sparkles, Trash2 } from 'lucide-react';

interface DigitalNotesProps {
  notes: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  compact?: boolean;
}

export const DigitalNotes: React.FC<DigitalNotesProps> = ({
  notes,
  onChange,
  readOnly = false,
  compact = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTag = (tag: string) => {
    if (readOnly) return;
    const current = notes;
    const updated = current ? `${current.trim()}\n• ${tag}: ` : `• ${tag}: `;
    onChange(updated);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.value.length;
        textareaRef.current.selectionEnd = textareaRef.current.value.length;
      }
    }, 50);
  };

  const handleClear = () => {
    if (readOnly) return;
    if (window.confirm('Clear all preparation notes?')) {
      onChange('');
    }
  };

  return (
    <div className={`bg-amber-50/50 rounded-2xl border border-amber-200/80 shadow-sm flex flex-col ${compact ? 'p-3' : 'p-5'}`}>
      {/* Scratchpad Header */}
      <div className="flex items-center justify-between pb-3 border-b border-amber-200/60 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-200/80 text-amber-800 flex items-center justify-center">
            <Edit3 className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
              Candidate Scratchpad
              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                {readOnly ? 'Locked for Presentation' : '1-Min Prep Notes'}
              </span>
            </h4>
            <p className="text-[11px] text-amber-800/80">
              Jot key words, narrative cues, and target vocabulary.
            </p>
          </div>
        </div>

        {!readOnly && notes && (
          <button
            onClick={handleClear}
            className="p-1.5 text-amber-700 hover:text-red-600 hover:bg-amber-100 rounded-md transition-colors"
            title="Clear notes"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Quick Scaffold Prompts (only when editing) */}
      {!readOnly && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          <button
            type="button"
            onClick={() => insertTag('Intro / Topic')}
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 bg-white hover:bg-amber-100/70 text-amber-900 border border-amber-200/80 rounded-md transition-colors"
          >
            <Plus className="w-3 h-3 text-amber-600" />
            Intro
          </button>
          <button
            type="button"
            onClick={() => insertTag('Story / Timeline')}
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 bg-white hover:bg-amber-100/70 text-amber-900 border border-amber-200/80 rounded-md transition-colors"
          >
            <Plus className="w-3 h-3 text-amber-600" />
            Story/Details
          </button>
          <button
            type="button"
            onClick={() => insertTag('Why Memorable')}
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 bg-white hover:bg-amber-100/70 text-amber-900 border border-amber-200/80 rounded-md transition-colors"
          >
            <Plus className="w-3 h-3 text-amber-600" />
            Why Memorable
          </button>
          <button
            type="button"
            onClick={() => insertTag('Target Idiom/Vocab')}
            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 bg-amber-100 hover:bg-amber-200/70 text-amber-950 border border-amber-300 rounded-md transition-colors"
          >
            <Sparkles className="w-3 h-3 text-amber-700" />
            Vocab
          </button>
        </div>
      )}

      {/* Notes Textarea */}
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          value={notes}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          rows={compact ? 5 : 8}
          placeholder={readOnly ? 'No notes were written during preparation.' : 'Write quick bullet points here...\n• Who / What / Where:\n• Setting the scene:\n• Crucial turning point:\n• Personal reflection / Feelings:'}
          className={`w-full p-3 font-mono text-xs sm:text-sm rounded-xl border transition-all resize-y leading-relaxed outline-none ${
            readOnly
              ? 'bg-amber-50/40 border-amber-200/60 text-amber-950 cursor-default'
              : 'bg-white border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50 text-slate-800'
          }`}
        />
      </div>

      {/* Footer Word / Bullet Count */}
      <div className="flex items-center justify-between text-[11px] text-amber-800/80 mt-2 px-1">
        <span>
          {notes.trim() ? `${notes.trim().split(/\s+/).length} words` : '0 words'}
        </span>
        <span className="italic">
          {readOnly ? 'Reference while speaking' : 'Visible during 2-min presentation'}
        </span>
      </div>
    </div>
  );
};
