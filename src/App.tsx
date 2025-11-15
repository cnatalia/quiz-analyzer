import { useState } from "react";
import "./App.css";
import useGetQuizesQuestion from "./hook/use-get-quiz-questions";
import {
  getFrequency,
  getTopWords,
  removeStopWordsAndSpecialCharacters,
  calculateSummary,
} from "./utils/utils";
import { type AnalysisSummary, type QuizQuestion } from "./const/main.constant";


type WordCount = {
  word: string;
  count: number;
};

const WELL_ANSWER_THRESHOLD = 0.5;
const MIN_FREQUENCY = 3;
const TOP_WORDS_LIMIT = 10; 

const getTopWordsFromQuestions = (questions: QuizQuestion[]): WordCount[] => {
  if (!questions || questions.length === 0) {
    return [];
  }

  try {
    const texts = questions
      .map((question) => question.text || "")
      .filter((text) => text.trim().length > 0)
      .join(" ");

    if (!texts || texts.trim().length === 0) {
      return [];
    }

    const words = removeStopWordsAndSpecialCharacters(texts);
    if (words.length === 0) {
      return [];
    }

    const frequency = getFrequency(words);
    const frequencySorted = getTopWords(frequency, MIN_FREQUENCY, TOP_WORDS_LIMIT);

    return frequencySorted.map(([word, count]) => ({
      word,
      count: Number(count),
    }));
  } catch (error) {
    console.error("Error processing questions:", error);
    return [];
  }
};

const getAllWordsFromQuestions = (questions: QuizQuestion[]): string[] => {
  if (!questions || questions.length === 0) {
    return [];
  }

  const texts = questions
    .map((question) => question.text || "")
    .filter((text) => text.trim().length > 0)
    .join(" ");

  return removeStopWordsAndSpecialCharacters(texts);
};

function App() {
  const { data: quizQuestions, isLoading, error } = useGetQuizesQuestion();
  const [top3WellWords, setTop3WellWords] = useState<WordCount[]>([]);
  const [top3WrongWords, setTop3WrongWords] = useState<WordCount[]>([]);
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);

  const showTop3Words = () => {
    if (!quizQuestions || quizQuestions.length === 0) {
      return;
    }

    const wrongAnswerQuestions = quizQuestions.filter(
      (question) => question.percent_correct < WELL_ANSWER_THRESHOLD
    );

    const wellAnswerQuestions = quizQuestions.filter(
      (question) => question.percent_correct >= WELL_ANSWER_THRESHOLD
    );

    // Get top words for each category
    setTop3WrongWords(getTopWordsFromQuestions(wrongAnswerQuestions));
    setTop3WellWords(getTopWordsFromQuestions(wellAnswerQuestions));

    // Calculate frequencies for statistical comparison
    const wellWords = getAllWordsFromQuestions(wellAnswerQuestions);
    const wrongWords = getAllWordsFromQuestions(wrongAnswerQuestions);
    const allWords = [...wellWords, ...wrongWords];

    // Calculate summary statistics
    const summaryStats = calculateSummary(
      quizQuestions,
      wellAnswerQuestions,
      wrongAnswerQuestions,
      allWords
    );
    setSummary(summaryStats);
  };

  if (isLoading) {
    return (
      <main role="status" aria-label="Loading quiz questions" className="container mx-auto px-4 py-6">
        <p className="text-gray-900">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main role="alert" aria-live="assertive" className="container mx-auto px-4 py-6">
        <p className="text-red-700 font-semibold">Error loading quiz questions: {error.message}</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 text-left flex-col flex gap-y-6 py-6">
      <header className="flex flex-col gap-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Quiz Question Analyzer</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-2 border-blue-700 font-bold py-2 px-4 rounded-md cursor-pointer w-fit focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:text-gray-200 disabled:border-gray-400 disabled:cursor-not-allowed transition-colors"
          onClick={showTop3Words}
          disabled={!quizQuestions || quizQuestions.length === 0}
          aria-label="Analyze quiz questions to find frequently used words"
          aria-describedby="button-description"
        >
          Analyze Questions
        </button>
        <span id="button-description" className="sr-only">
          Click to analyze quiz questions and identify words that appear more frequently in questions students answered well versus poorly
        </span>
      </header>

      {/* Summary Statistics */}
      {summary && (
        <section 
          className="bg-gray-50 p-4 rounded-lg border border-gray-200"
          aria-labelledby="summary-heading"
        >
          <h2 id="summary-heading" className="text-xl font-semibold mb-3 text-gray-900">Summary Statistics</h2>
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-900">
            <div className="flex flex-col">
              <dt className="font-semibold text-gray-800">Total Questions</dt>
              <dd className="text-gray-900" aria-label={`Total questions: ${summary.totalQuestions}`}>
                {summary.totalQuestions}
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="font-semibold text-gray-800">Well Answered</dt>
              <dd className="text-gray-900" aria-label={`Well answered: ${summary.wellAnsweredCount} questions, ${Math.round((summary.wellAnsweredCount / summary.totalQuestions) * 100)} percent`}>
                {summary.wellAnsweredCount} ({Math.round((summary.wellAnsweredCount / summary.totalQuestions) * 100)}%)
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="font-semibold text-gray-800">Wrong Answered</dt>
              <dd className="text-gray-900" aria-label={`Wrong answered: ${summary.wrongAnsweredCount} questions, ${Math.round((summary.wrongAnsweredCount / summary.totalQuestions) * 100)} percent`}>
                {summary.wrongAnsweredCount} ({Math.round((summary.wrongAnsweredCount / summary.totalQuestions) * 100)}%)
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="font-semibold text-gray-800">Avg Words/Question</dt>
              <dd className="text-gray-900" aria-label={`Average words per question: ${summary.averageWordsPerQuestion}`}>
                {summary.averageWordsPerQuestion}
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="font-semibold text-gray-800">Total Words Analyzed</dt>
              <dd className="text-gray-900" aria-label={`Total words analyzed: ${summary.wordsAnalyzed}`}>
                {summary.wordsAnalyzed}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {/* Top Words by Category */}
      <section 
        className="flex flex-col md:flex-row gap-x-8 gap-y-4"
        aria-label="Top words analysis by category"
      >
        <article className="flex-1 flex flex-col" aria-labelledby="well-answered-heading">
          {top3WellWords.length > 0 && (
            <>
              <h3 id="well-answered-heading" className="text-xl font-semibold mb-2 text-gray-900">
                <span aria-hidden="true">✅</span> Well Answered (≥50%)
              </h3>
              <ul className="pl-4 list-decimal space-y-1 text-gray-900" aria-label="Top words from well-answered questions">
                {top3WellWords.map((item) => (
                  <li key={item.word} className="text-base">
                    <span className="font-semibold text-gray-900">{item.word}</span> : <span className="text-gray-800" aria-label={`${item.word} appears ${item.count} times`}>{item.count}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </article>
        <article className="flex-1 flex flex-col" aria-labelledby="wrong-answered-heading">
          {top3WrongWords.length > 0 && (
            <>
              <h3 id="wrong-answered-heading" className="text-xl font-semibold mb-2 text-gray-900">
                <span aria-hidden="true">❌</span> Wrong Answered (&lt;50%)
              </h3>
              <ul className="pl-4 list-decimal space-y-1 text-gray-900" aria-label="Top words from wrong-answered questions">
                {top3WrongWords.map((item) => (
                  <li key={item.word} className="text-base">
                    <span className="font-semibold text-gray-900">{item.word}</span> : <span className="text-gray-800" aria-label={`${item.word} appears ${item.count} times`}>{item.count}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </article>
      </section>

      {/* Empty State */}
      {top3WellWords.length === 0 && top3WrongWords.length === 0 && summary === null && (
        <aside 
          className="text-center text-gray-700 py-8"
          role="status"
          aria-label="No analysis results yet"
        >
          <p>Click "Analyze Questions" to see the analysis results</p>
        </aside>
      )}
    </main>
  );
}

export default App;
