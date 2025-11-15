import { useQuery } from '@tanstack/react-query';

type QuizQuestion = {
  text: string;
  percent_correct: number;
};

const useGetQuizesQuestion = () => {
  return useQuery<QuizQuestion[]>({
    queryKey: ['quiz-questions'],
    queryFn: async () => {
      const response = await fetch('https://newsela-quiz.s3.us-east-1.amazonaws.com/data.json');
      if (!response.ok) {
        throw new Error('Failed to fetch quiz questions');
      }
      const data = await response.json();
      return data;
    },
  });
};

export default useGetQuizesQuestion;