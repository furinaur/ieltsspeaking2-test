export type Category = 
  | 'all'
  | 'people'
  | 'places'
  | 'objects'
  | 'experiences'
  | 'culture'
  | 'technology'
  | 'work-study';

export interface VocabItem {
  word: string;
  meaning: string;
  example: string;
}

export interface CueCard {
  id: string;
  title: string;
  category: Category;
  cuePoints: string[];
  bandTips: string[];
  suggestedVocab: VocabItem[];
}

export type TestPhase = 
  | 'idle'
  | 'phase1_prep'
  | 'transition'
  | 'phase2_speak'
  | 'review'
  | 'feedback';

export interface GrammarCorrection {
  original: string;
  corrected: string;
  rule: string;
}

export interface VocabUpgrade {
  original: string;
  better: string;
  explanation: string;
}

export interface EvaluationResult {
  overallBand: number;
  summary: string;
  transcript: string;
  fluencyAndCoherence: {
    band: number;
    feedback: string;
    discourseMarkersFound: string[];
    discourseMarkersSuggested: string[];
    pacingFeedback: string;
  };
  lexicalResource: {
    band: number;
    feedback: string;
    strongVocabulary: string[];
    upgrades: VocabUpgrade[];
  };
  grammaticalRangeAndAccuracy: {
    band: number;
    feedback: string;
    complexStructuresFound: string[];
    corrections: GrammarCorrection[];
  };
  pronunciation: {
    band: number;
    feedback: string;
    focusPoints: string[];
    intonationTips: string;
  };
  keyStrengths: string[];
  areasForImprovement: string[];
  followUpQuestions: string[];
  roundingOffQuestion: string;
  sampleBand9Answer: string;
}

export interface PracticeHistoryItem {
  id: string;
  date: string;
  cueCardTitle: string;
  cueCardCategory: string;
  notes: string;
  durationSeconds: number;
  overallBand: number;
  fluencyBand: number;
  grammarBand: number;
  vocabBand: number;
  pronunciationBand: number;
  transcriptSnippet: string;
  evaluation: EvaluationResult;
}
