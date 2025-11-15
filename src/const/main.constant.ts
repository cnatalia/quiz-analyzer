export const STOP_WORDS = [
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "to",
  "of",
  "in",
  "on",
  "for",
  "with",
  "as",
  "at",
  "by",
  "from",
  "that",
  "this",
  "it",
  "its",
  "your",
  "you",
  "we",
  "they",
  "their",
  "our",
  "i",
  "what",
  "which",
  "who",
  "whom",
  "how",
  "why",
  "when",
  "where",
  "can",
  "could",
  "should",
  "would",
  "may",
  "might",
  "will",
  "shall",
  "do",
  "does",
  "did",
];

export type FrequencyMap = Record<string, number>;
export type AnalysisSummary = {
  totalQuestions: number;
  wellAnsweredCount: number;
  wrongAnsweredCount: number;
  averageWordsPerQuestion: number;
  wordsAnalyzed: number;
};

export type QuizQuestion = {
  text: string;
  percent_correct: number;
};
