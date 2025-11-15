import { useState } from "react";
import "./App.css";
import useGetQuizesQuestion from "./hook/use-get-quiz-questions";
import {
  getFrequency,
  getTopWords,
  removeStopWordsAndSpecialCharacters,
} from "./utils/main";

type WordCount = {
  word: string;
  count: number;
};

type QuizQuestion = {
  text: string;
  percent_correct: number;
};

const WELL_ANSWER_THRESHOLD = 0.5;
const MIN_FREQUENCY = 3;
const TOP_WORDS_LIMIT = 3; 

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

function App() {
  const { data: quizQuestions, isLoading, error } = useGetQuizesQuestion();
  const [top3WellWords, setTop3WellWords] = useState<WordCount[]>([]);
  const [top3WrongWords, setTop3WrongWords] = useState<WordCount[]>([]);

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

    setTop3WrongWords(getTopWordsFromQuestions(wrongAnswerQuestions));
    setTop3WellWords(getTopWordsFromQuestions(wellAnswerQuestions));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading quiz questions: {error.message}</div>;
  }

  return (
    <div className="container mx-auto px-4 text-left flex-col flex gap-y-4">
      <button
        onClick={showTop3Words}
        disabled={!quizQuestions || quizQuestions.length === 0}
      >
        Check top 3 words
      </button>
      <div className="flex flex-row gap-x-8 ">
        <div className="flex flex-col ">
          {top3WellWords.length > 0 && (
            <>
              <h3 className="text-xl font-semibold"> Well Answered</h3>
              <ul className="pl-4 list-decimal">
                {top3WellWords.map((item) => (
                  <li key={item.word}>
                    {item.word} : {item.count}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="flex flex-col">
          {top3WrongWords.length > 0 && (
            <>
              <h3 className="text-xl font-semibold">Wrong Answered</h3>
              <ul className="pl-4 list-decimal">
                {top3WrongWords.map((item) => (
                  <li key={item.word}>
                    {item.word} : {item.count}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
