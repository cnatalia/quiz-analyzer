import { useState } from "react";
import "./App.css";
import useGetQuizesQuestion from "./hook/use-get-quiz-questions";
import {
  getFrequency,
  getTop3Words,
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

const getTop3WordsFromQuestions = (questions: QuizQuestion[]): WordCount[] => {
  if (!questions || questions.length === 0) {
    return [];
  }

  const texts = questions.map((question) => question.text).join(" ");
  const words = removeStopWordsAndSpecialCharacters(texts);
  const frequency = getFrequency(words);
  const frequencySorted = getTop3Words(frequency);

  return frequencySorted.map(([word, count]) => ({
    word,
    count: Number(count),
  }));
};

function App() {
  const { data: quizQuestions, isLoading, error } = useGetQuizesQuestion();
  const [top3WellWord, setTop3WellWords] = useState<WordCount[]>([]);
  const [top3WrongWord, setTop3WrongWords] = useState<WordCount[]>([]);

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

    setTop3WrongWords(getTop3WordsFromQuestions(wrongAnswerQuestions));
    setTop3WellWords(getTop3WordsFromQuestions(wellAnswerQuestions));
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
          {top3WellWord.length > 0 && (
            <>
              <h3 className="text-xl font-semibold"> Well Answered</h3>
              <ul className="pl-4 list-decimal">
                {top3WellWord.map((item) => (
                  <li key={item.word}>
                    {item.word} : {item.count}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="flex flex-col">
          {top3WrongWord.length > 0 && (
            <>
              <h3 className="text-xl font-semibold">Wrong Answered</h3>
              <ul className="pl-4 list-decimal">
                {top3WrongWord.map((item) => (
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
