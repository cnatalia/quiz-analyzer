import {
  removeStopWordsAndSpecialCharacters,
  getFrequency,
  getTopWords,
  calculateSummary,
} from './utils';
import { type FrequencyMap, type QuizQuestion } from '../const/main.constant';
describe('removeStopWordsAndSpecialCharacters', () => {
  it('should remove stop words from text', () => {
    const text = 'the quick brown fox jumps over the lazy dog';
    const result = removeStopWordsAndSpecialCharacters(text);
    // "over" is not in the stop words list, so it should be included
    expect(result).toEqual(['quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog']);
  });

  it('should remove special characters and punctuation', () => {
    const text = 'Hello, world! How are you?';
    const result = removeStopWordsAndSpecialCharacters(text);
    expect(result).toEqual(['hello', 'world']);
  });

  it('should convert text to lowercase', () => {
    const text = 'HELLO WORLD';
    const result = removeStopWordsAndSpecialCharacters(text);
    expect(result).toEqual(['hello', 'world']);
  });

  it('should filter out words shorter than minimum length', () => {
    const text = 'a b c hello world';
    const result = removeStopWordsAndSpecialCharacters(text);
    expect(result).toEqual(['hello', 'world']);
  });

  it('should handle text with numbers', () => {
    const text = 'hello 123 world 456';
    const result = removeStopWordsAndSpecialCharacters(text);
    expect(result).toEqual(['hello', '123', 'world', '456']);
  });

  it('should handle text with special characters mixed in words', () => {
    const text = 'hello-world test@example.com';
    const result = removeStopWordsAndSpecialCharacters(text);
    expect(result).toEqual(['helloworld', 'testexamplecom']);
  });

  it('should preserve valid words after filtering', () => {
    const text = 'climate change affects global temperatures significantly';
    const result = removeStopWordsAndSpecialCharacters(text);
    expect(result).toContain('climate');
    expect(result).toContain('change');
    expect(result).toContain('affects');
    expect(result).toContain('global');
    expect(result).toContain('temperatures');
    expect(result).toContain('significantly');
  });
});

describe('getFrequency', () => {
  it('should count word frequencies correctly', () => {
    const words = ['hello', 'world', 'hello', 'test', 'world', 'hello'];
    const result = getFrequency(words);
    expect(result).toEqual({
      hello: 3,
      world: 2,
      test: 1,
    });
  });

  it('should handle array with all same words', () => {
    const words = ['hello', 'hello', 'hello'];
    const result = getFrequency(words);
    expect(result).toEqual({ hello: 3 });
  });

  it('should ignore empty strings', () => {
    const words = ['hello', '', 'world', '  ', 'test'];
    const result = getFrequency(words);
    expect(result).toEqual({
      hello: 1,
      world: 1,
      test: 1,
    });
  });

  it('should handle case-sensitive words (as provided)', () => {
    const words = ['Hello', 'hello', 'HELLO'];
    const result = getFrequency(words);
    expect(result).toEqual({
      Hello: 1,
      hello: 1,
      HELLO: 1,
    });
  });

});

describe('getTopWords', () => {
  it('should return top words sorted by frequency', () => {
    const frequency: FrequencyMap = {
      hello: 5,
      world: 3,
      test: 1,
      example: 4,
    };
    const result = getTopWords(frequency);
    expect(result).toEqual([
      ['hello', 5],
      ['example', 4],
      ['world', 3],
    ]);
  });


  it('should filter by minimum frequency', () => {
    const frequency: FrequencyMap = {
      hello: 5,
      world: 3,
      test: 1,
      example: 2,
    };
    const result = getTopWords(frequency, 3);
    expect(result).toEqual([
      ['hello', 5],
      ['world', 3],
    ]);
  });
});

describe('calculateSummary', () => {
  it('should calculate summary statistics correctly', () => {
    const allQuestions: QuizQuestion[] = [
      { text: 'question one', percent_correct: 0.8 },
      { text: 'question two', percent_correct: 0.6 },
      { text: 'question three', percent_correct: 0.3 },
      { text: 'question four', percent_correct: 0.4 },
    ];

    const wellQuestions: QuizQuestion[] = [
      { text: 'question one', percent_correct: 0.8 },
      { text: 'question two', percent_correct: 0.6 },
    ];

    const wrongQuestions: QuizQuestion[] = [
      { text: 'question three', percent_correct: 0.3 },
      { text: 'question four', percent_correct: 0.4 },
    ];

    const allWords = ['question', 'one', 'question', 'two', 'question', 'three', 'question', 'four'];

    const result = calculateSummary(allQuestions, wellQuestions, wrongQuestions, allWords);

    expect(result.totalQuestions).toBe(4);
    expect(result.wellAnsweredCount).toBe(2);
    expect(result.wrongAnsweredCount).toBe(2);
    expect(result.wordsAnalyzed).toBe(8);
    expect(result.averageWordsPerQuestion).toBe(2); // 8 words / 4 questions = 2
  });


  it('should handle case with only well-answered questions', () => {
    const allQuestions: QuizQuestion[] = [
      { text: 'test question', percent_correct: 0.8 },
      { text: 'another test', percent_correct: 0.9 },
    ];

    const wellQuestions: QuizQuestion[] = [
      { text: 'test question', percent_correct: 0.8 },
      { text: 'another test', percent_correct: 0.9 },
    ];

    const wrongQuestions: QuizQuestion[] = [];
    const allWords = ['test', 'question', 'another', 'test'];

    const result = calculateSummary(allQuestions, wellQuestions, wrongQuestions, allWords);

    expect(result.totalQuestions).toBe(2);
    expect(result.wellAnsweredCount).toBe(2);
    expect(result.wrongAnsweredCount).toBe(0);
    expect(result.wordsAnalyzed).toBe(4);
    expect(result.averageWordsPerQuestion).toBe(2);
  });

  it('should handle case with only wrong-answered questions', () => {
    const allQuestions: QuizQuestion[] = [
      { text: 'difficult question', percent_correct: 0.3 },
      { text: 'hard question', percent_correct: 0.2 },
    ];

    const wellQuestions: QuizQuestion[] = [];
    const wrongQuestions: QuizQuestion[] = [
      { text: 'difficult question', percent_correct: 0.3 },
      { text: 'hard question', percent_correct: 0.2 },
    ];

    const allWords = ['difficult', 'question', 'hard', 'question'];

    const result = calculateSummary(allQuestions, wellQuestions, wrongQuestions, allWords);

    expect(result.totalQuestions).toBe(2);
    expect(result.wellAnsweredCount).toBe(0);
    expect(result.wrongAnsweredCount).toBe(2);
    expect(result.wordsAnalyzed).toBe(4);
    expect(result.averageWordsPerQuestion).toBe(2);
  });

  it('should calculate average words per question correctly with decimals', () => {
    const allQuestions: QuizQuestion[] = [
      { text: 'one', percent_correct: 0.8 },
      { text: 'two three', percent_correct: 0.6 },
      { text: 'four five six', percent_correct: 0.3 },
    ];

    const wellQuestions: QuizQuestion[] = [
      { text: 'one', percent_correct: 0.8 },
      { text: 'two three', percent_correct: 0.6 },
    ];

    const wrongQuestions: QuizQuestion[] = [
      { text: 'four five six', percent_correct: 0.3 },
    ];

    const allWords = ['one', 'two', 'three', 'four', 'five', 'six']; // 6 words total

    const result = calculateSummary(allQuestions, wellQuestions, wrongQuestions, allWords);

    expect(result.totalQuestions).toBe(3);
    expect(result.averageWordsPerQuestion).toBe(2); // 6 / 3 = 2.0
  });

  it('should round average words per question to 2 decimal places', () => {
    const allQuestions: QuizQuestion[] = [
      { text: 'one two', percent_correct: 0.8 },
      { text: 'three', percent_correct: 0.6 },
    ];

    const wellQuestions: QuizQuestion[] = [
      { text: 'one two', percent_correct: 0.8 },
      { text: 'three', percent_correct: 0.6 },
    ];

    const wrongQuestions: QuizQuestion[] = [];
    const allWords = ['one', 'two', 'three']; // 3 words / 2 questions = 1.5

    const result = calculateSummary(allQuestions, wellQuestions, wrongQuestions, allWords);

    expect(result.averageWordsPerQuestion).toBe(1.5);
  });

});

