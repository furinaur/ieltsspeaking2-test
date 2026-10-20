import React, { useState } from 'react';
import { X, Search, Tag, ArrowRight, Sparkles } from 'lucide-react';
import { CueCard, Category } from '../types';
import { CUE_CARDS } from '../data/cueCards';

interface CardLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCard: (card: CueCard) => void;
  onOpenGenerateModal: () => void;
  selectedCardId?: string;
}

export const CardLibraryModal: React.FC<CardLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectCard,
  onOpenGenerateModal,
  selectedCardId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredCards = CUE_CARDS.filter((card) => {
    const matchesCategory =
      selectedCategory === 'all' || card.category === selectedCategory;
    const matchesQuery =
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.cuePoints.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const categories: { id: Category; label: string }[] = [
    { id: 'all', label: 'All Topics' },
    { id: 'people', label: 'People' },
    { id: 'places', label: 'Places' },
    { id: 'objects', label: 'Objects' },
    { id: 'experiences', label: 'Experiences' },
    { id: 'culture', label: 'Culture & Arts' },
    { id: 'technology', label: 'Technology' },
    { id: 'work-study', label: 'Work & Study' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              IELTS Speaking Part 2 Cue Card Library
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any authentic exam cue card to begin your preparation session
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics (e.g. travel, technology, person, goal)..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-rose-400 focus:ring-1 focus:ring-rose-200 outline-none bg-white text-slate-800"
              />
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenGenerateModal();
              }}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 flex items-center justify-center gap-1.5 transition-colors shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>Generate Custom AI Topic</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {filteredCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCards.map((card) => {
                const isSelected = card.id === selectedCardId;
                return (
                  <div
                    key={card.id}
                    onClick={() => {
                      onSelectCard(card);
                      onClose();
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between hover:shadow-md ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/40 ring-1 ring-rose-400'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded border border-rose-200">
                          <Tag className="w-2.5 h-2.5" />
                          {card.category}
                        </span>
                        {isSelected && (
                          <span className="text-[11px] font-bold text-rose-600">
                            Active Card
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                        {card.title}
                      </h4>

                      <ul className="text-xs text-slate-500 space-y-1 mb-4">
                        {card.cuePoints.slice(0, 3).map((p, idx) => (
                          <li key={idx} className="line-clamp-1">
                            • {p}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        {card.suggestedVocab?.length || 4} vocab items
                      </span>
                      <span className="font-semibold text-rose-600 flex items-center gap-1 hover:gap-1.5 transition-all">
                        Practice This <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              No cue cards matched your search query. Try another term or generate one with AI!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
