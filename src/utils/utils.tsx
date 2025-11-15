import { STOP_WORDS, type AnalysisSummary, type FrequencyMap, type QuizQuestion } from "../const/main.constant";


// Minimum word length filter: Excludes single characters and ensures we're analyzing actual words.
const MIN_WORD_LENGTH = 2;

export const removeStopWordsAndSpecialCharacters = (text: string): string[] => {
  if (!text || typeof text !== "string") {
    return [];
  }

  const words = text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length >= MIN_WORD_LENGTH && !STOP_WORDS.includes(word));

  return words;
};

export const getFrequency = (words: string[]): FrequencyMap => {
  if (!words || words.length === 0) {
    return {};
  }

  return words.reduce((acc: FrequencyMap, current) => {
    if (current && current.trim().length > 0) {
      acc[current] = (acc[current] || 0) + 1;
    }
    return acc;
  }, {});
};

export const getTopWords = (
  frequency: FrequencyMap,
  minFrequency: number = 1,
  limit: number = 3
): [string, number][] => {
  if (!frequency || Object.keys(frequency).length === 0) {
    return [];
  }

  return Object.entries(frequency)
    .filter(([, count]) => count >= minFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
};


export const calculateSummary = (
  allQuestions: QuizQuestion[],
  wellQuestions: QuizQuestion[],
  wrongQuestions: QuizQuestion[],
  allWords: string[]
): AnalysisSummary => {
  const totalQuestions = allQuestions.length;
  const wellAnsweredCount = wellQuestions.length;
  const wrongAnsweredCount = wrongQuestions.length;
  const totalWords = allWords.length;
  const averageWordsPerQuestion = totalQuestions > 0 ? totalWords / totalQuestions : 0;

  return {
    totalQuestions,
    wellAnsweredCount,
    wrongAnsweredCount,
    averageWordsPerQuestion: Math.round(averageWordsPerQuestion * 100) / 100,
    wordsAnalyzed: totalWords,
  };
};
