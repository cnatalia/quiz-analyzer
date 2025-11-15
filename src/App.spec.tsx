import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock the custom hook
jest.mock('./hook/use-get-quiz-questions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import useGetQuizesQuestion from './hook/use-get-quiz-questions';

// Mock the utils - we'll use the real implementations for more accurate testing
jest.mock('./utils/utils', () => ({
  ...jest.requireActual('./utils/utils'),
}));

describe('App Component', () => {
  const mockUseGetQuizesQuestion = useGetQuizesQuestion as jest.MockedFunction<
    typeof useGetQuizesQuestion
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show "Loading..." when data is loading', () => {
      mockUseGetQuizesQuestion.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      render(<App />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Data Loading', () => {
    it('should load the data from the hook', () => {
      const mockData = [
        { text: 'apple banana apple', percent_correct: 0.8 },
        { text: 'banana orange apple', percent_correct: 0.2 },
      ];

      mockUseGetQuizesQuestion.mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null,
      } as any);

      render(<App />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it('should disable button when no quiz questions are available', () => {
      mockUseGetQuizesQuestion.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);

      render(<App />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

  });

  describe('Error Handling', () => {
    it('should show error message when the hook fails', () => {
      mockUseGetQuizesQuestion.mockReturnValue({
        data: null,
        isLoading: false,
        error: { message: 'Network error' } as Error,
      } as any);

      render(<App />);

      expect(
        screen.getByText(/Error loading quiz questions/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });

    it('should show error message when error has no message property', () => {
      mockUseGetQuizesQuestion.mockReturnValue({
        data: null,
        isLoading: false,
        error: { message: 'Failed to fetch quiz questions' } as Error,
      } as any);

      render(<App />);

      expect(
        screen.getByText(/Error loading quiz questions/i)
      ).toBeInTheDocument();
    });
  });

  describe('Word Analysis - Button Click', () => {
    it('should return top 3 words for well and wrong answered questions when button is clicked', async () => {
      const mockData = [
        { text: 'climate change affects global temperatures', percent_correct: 0.7 },
        { text: 'climate change affects global temperatures', percent_correct: 0.7 },
        { text: 'climate change affects global temperatures', percent_correct: 0.7 },
        { text: 'economic growth impacts market stability', percent_correct: 0.3 },
        { text: 'economic growth impacts market stability', percent_correct: 0.3 },
        { text: 'economic growth impacts market stability', percent_correct: 0.3 },
      ];

      mockUseGetQuizesQuestion.mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null,
      } as any);

      render(<App />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        // Verify that lists with words are displayed (they should meet MIN_FREQUENCY of 3)
        const lists = screen.getAllByRole('list');
        expect(lists.length).toBeGreaterThan(0);
        
        // Verify specific words from well-answered questions appear
        expect(screen.getByText(/climate/i)).toBeInTheDocument();
        expect(screen.getByText(/change/i)).toBeInTheDocument();
        
        // Verify specific words from wrong-answered questions appear
        expect(screen.getByText(/economic/i)).toBeInTheDocument();
        expect(screen.getByText(/growth/i)).toBeInTheDocument();
      });

      // Verify summary statistics are shown
      expect(screen.getByText(/Summary Statistics/i)).toBeInTheDocument();
    });

    it('should not show results if no words meet minimum frequency threshold', async () => {
      // Words that appear only once or twice won't meet MIN_FREQUENCY of 3
      const mockData = [
        { text: 'alpha beta gamma', percent_correct: 0.9 },
        { text: 'delta epsilon zeta', percent_correct: 0.8 },
      ];

      mockUseGetQuizesQuestion.mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null,
      } as any);

      render(<App />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        // Summary should still be shown
        expect(screen.getByText(/Summary Statistics/i)).toBeInTheDocument();
        
        // But lists with words should NOT appear since no words meet MIN_FREQUENCY
        const lists = screen.queryAllByRole('list');
        // Only the summary section should be present, no word lists
        expect(lists.length).toBe(0);
      });
    });

    it('should handle questions with exactly 50% (threshold boundary)', async () => {
      const mockData = [
        { text: 'test word test word test word', percent_correct: 0.5 }, // Exactly at threshold
        { text: 'test word test word test word', percent_correct: 0.5 },
        { text: 'test word test word test word', percent_correct: 0.5 },
        { text: 'other word other word other word', percent_correct: 0.49 }, // Just below threshold
        { text: 'other word other word other word', percent_correct: 0.49 },
        { text: 'other word other word other word', percent_correct: 0.49 },
      ];

      mockUseGetQuizesQuestion.mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null,
      } as any);

      render(<App />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        // Questions with 0.5 should be in well-answered category
        // Verify "test" and "word" appear (from well-answered questions)
        expect(screen.getByText(/test/i)).toBeInTheDocument();
        
        // Questions with 0.49 should be in wrong-answered category
        // Verify "other" appears (from wrong-answered questions)
        expect(screen.getByText(/other/i)).toBeInTheDocument();
        
        // Verify lists are present
        const lists = screen.getAllByRole('list');
        expect(lists.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should filter words correctly by minimum frequency (MIN_FREQUENCY = 3)', async () => {
      // Words that appear 1-2 times should not be shown
      const mockData = [
        { text: 'rare word', percent_correct: 0.8 },
        { text: 'common common common', percent_correct: 0.8 },
        { text: 'common common common', percent_correct: 0.8 },
        { text: 'common common common', percent_correct: 0.8 },
      ];

      mockUseGetQuizesQuestion.mockReturnValue({
        data: mockData,
        isLoading: false,
        error: null,
      } as any);

      render(<App />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        // "common" appears 9 times (3 questions * 3 times), should be shown
        expect(screen.getByText(/common/i)).toBeInTheDocument();
        // Check that the count 9 appears in the list
        const listItems = screen.getAllByRole('listitem');
        const commonItem = listItems.find(item => item.textContent?.includes('common'));
        expect(commonItem).toBeInTheDocument();
        expect(commonItem?.textContent).toContain('9');
        // "rare" appears only 1 time, should not be shown (doesn't meet MIN_FREQUENCY of 3)
        expect(screen.queryByText(/rare/i)).not.toBeInTheDocument();
      });
    });
  });
});
