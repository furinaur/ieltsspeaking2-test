import React, { useState } from 'react';
import { X, Sparkles, Wand2 } from 'lucide-react';
import { CueCard } from '../types';

interface CustomTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardGenerated: (card: CueCard) => void;
}

export const CustomTopicModal: React.FC<CustomTopicModalProps> = ({
  isOpen,
  onClose,
  onCardGenerated,
}) => {
  const [topicPrompt, setTopicPrompt] = useState('');
  const [category, setCategory] = useState('experiences');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-cue-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicPrompt.trim() || undefined,
          category,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate cue card');
      }

      const newCard: CueCard = await res.json();
      onCardGenerated(newCard);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error creating custom cue card. Please retry.');
    } finally {
      setIsGenerating(false);
    }
  };

  const sampleIdeas = [
    'Artificial Intelligence in daily life',
    'A memorable solo trip or road journey',
    'A favorite traditional dish or cooking recipe',
    'A piece of advice that changed your mind',
    'An environmental cleanup project you saw',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors absolute right-4 top-4"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Generate Custom Cue Card
            </h3>
            <p className="text-xs text-slate-500">
              Create an official-format IELTS Speaking Part 2 card with AI
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 mt-5">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Topic or Theme (Optional)
            </label>
            <input
              type="text"
              value={topicPrompt}
              onChange={(e) => setTopicPrompt(e.target.value)}
              placeholder="e.g. A museum visit, solar energy, childhood friend..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-1 focus:ring-rose-200 outline-none text-slate-800"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-1 focus:ring-rose-200 outline-none text-slate-800 bg-white"
            >
              <option value="experiences">Experiences & Memories</option>
              <option value="people">People & Characters</option>
              <option value="places">Places & Travel</option>
              <option value="objects">Objects & Gadgets</option>
              <option value="technology">Technology & Science</option>
              <option value="culture">Culture, Arts & Entertainment</option>
              <option value="work-study">Work, Study & Goals</option>
            </select>
          </div>

          {/* Quick Idea Chips */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              Or pick an idea prompt:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleIdeas.map((idea, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTopicPrompt(idea)}
                  className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-left"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              {error}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isGenerating}
              className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                isGenerating
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              <span>{isGenerating ? 'Drafting Official Cue Card...' : 'Generate & Practice Card'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
