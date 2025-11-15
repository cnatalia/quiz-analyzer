# Quiz Analyzer

A React-based application that analyzes quiz questions to identify words that appear more frequently in questions students perform well on versus questions they perform poorly on.

## Overview

This project analyzes quiz question data from Newsela to answer the question:

> What words or phrases appear more frequently in questions that students tend to do poorly on, and what appear more frequently in questions that students do well on?

The application fetches quiz data from a JSON file, processes the question text, and identifies the most frequently occurring words in each performance category.

## Live Demo

A live version of this application is available on GitHub Pages:

**🔗 [https://cnatalia.github.io/quiz-analyzer/](https://cnatalia.github.io/quiz-analyzer/)**

You can try the application directly in your browser without needing to set it up locally.

## Solution Methodology

### Approach

1. **Data Classification**: Questions are categorized into two groups based on their `percent_correct` value:
   - **Well-answered questions**: `percent_correct >= 50%`
   - **Poorly-answered questions**: `percent_correct < 50%`

2. **Text Processing**:
   - All question text is normalized to lowercase
   - Special characters and punctuation are removed
   - Stop words (common words like "the", "a", "and", etc.) are filtered out
   - Words shorter than 2 characters are excluded (single characters are not meaningful words)

3. **Frequency Analysis**:
   - Word frequencies are calculated for each category
   - Only words appearing at least 3 times are considered meaningful (minimum frequency threshold)
   - Words are sorted by frequency in descending order
   - Top words from each category are displayed (up to 10 per category)

### Key Design Decisions

- **50% Threshold**: Following the instructions, questions with `percent_correct >= 50%` are considered "well-answered" and those below are "poorly-answered"
- **Minimum Frequency of 3**: The instructions say "Consider how many appearances of a word there needs to be in order to say something about it." A word appearing only once or twice could be statistical noise or coincidence. Requiring at least 3 appearances ensures the word appears across multiple questions, making it more meaningful for identifying patterns. This threshold can be adjusted in the code if needed.
- **Stop Word Removal**: Common English stop words are excluded to focus on content words that carry semantic meaning
- **Minimum Word Length of 2**: Single characters (like "a" or "i" that might slip through after removing special characters) are not meaningful words for this analysis. The instructions mention words that should be "excluded or sanitized," and this is a standard text processing practice to ensure data quality

### Technology Stack

- **React 19** with TypeScript for the UI
- **Vite** for build tooling and development server
- **React Query (@tanstack/react-query)** for data fetching and caching
- **Tailwind CSS** for styling
- **Jest** with **@testing-library/react** for testing

## Setup Instructions

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm (comes with Node.js)

### Installation

1. Clone or download this repository

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

3. The application will automatically fetch quiz data from the JSON endpoint

4. Click the "Analyze Questions" button to analyze and display the results

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory. You can preview the production build with:

```bash
npm run preview
```

### Running Tests

The project includes comprehensive unit and component tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

The test suite includes:
- Unit tests for utility functions (`utils/utils.spec.tsx`)
- Component tests for the main App component (`App.spec.tsx`)
- Tests cover edge cases, error handling, and accessibility features

## Project Structure

```
quiz-analyzer/
├── src/
│   ├── App.tsx                 # Main application component
│   ├── App.spec.tsx            # Component tests
│   ├── main.tsx                # Application entry point
│   ├── setupTests.ts           # Jest test setup
│   ├── jest-globals.d.ts       # TypeScript types for Jest
│   ├── hook/
│   │   └── use-get-quiz-questions.tsx  # React Query hook for fetching data
│   ├── utils/
│   │   ├── utils.tsx           # Text processing utilities
│   │   └── utils.spec.tsx      # Unit tests for utilities
│   ├── const/
│   │   └── main.constant.ts    # Stop words list and type definitions
│   ├── index.css               # Global styles
│   └── App.css                 # Component styles
├── jest.config.js              # Jest configuration
├── tsconfig.test.json          # TypeScript config for tests
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## How It Works

1. **Data Fetching**: The app uses React Query to fetch quiz data from `https://newsela-quiz.s3.us-east-1.amazonaws.com/data.json`

2. **Analysis**: When the user clicks "Analyze Questions":
   - Questions are filtered into two groups based on performance
   - Text from each group is processed and tokenized
   - Word frequencies are calculated
   - Words meeting the minimum frequency threshold are sorted and the top words are selected (up to 10 per category)
   - Summary statistics are calculated (total questions, percentages, average words per question)

3. **Display**: Results are shown with:
   - Summary statistics panel with key metrics
   - Side-by-side word lists displaying the most frequent words for each category along with their occurrence counts

## Results Interpretation

The results show:
- **Well Answered**: Words that appear most frequently in questions where students scored 50% or higher
- **Wrong Answered**: Words that appear most frequently in questions where students scored below 50%

These words can provide insights into:
- Vocabulary complexity (certain words may indicate more difficult concepts)
- Question structure (certain words may appear in trickier question formats)
- Content areas that students find challenging

## Dependencies

All dependencies are listed in `package.json`. Key dependencies include:

**Runtime:**
- `react` & `react-dom`: UI framework
- `@tanstack/react-query`: Data fetching and state management

**Development:**
- `typescript`: Type safety
- `vite`: Build tool and dev server
- `tailwindcss`: Styling
- `jest`: Testing framework
- `@testing-library/react`: React component testing utilities
- `@testing-library/jest-dom`: Custom Jest matchers for DOM assertions
- `ts-jest`: TypeScript preprocessor for Jest

## Accessibility Features

This application follows WCAG accessibility guidelines:

- **ARIA Labels**: All interactive elements have descriptive ARIA labels
- **Semantic HTML**: Uses proper semantic elements (`<main>`, `<section>`, `<article>`, `<header>`, `<aside>`, `<dl>`, `<dt>`, `<dd>`)
- **Screen Reader Support**: Proper roles, labels, and descriptions for assistive technologies
- **Color Contrast**: All text meets WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text)

## Notes

- The data is fetched from a remote S3 bucket. Ensure you have internet connectivity.
- The analysis processes all questions synchronously. For very large datasets, this may take a moment.
- **Configurable Parameters**: 
  - `MIN_FREQUENCY` in `App.tsx`: Minimum word frequency threshold (currently set to 3)
  - `MIN_WORD_LENGTH` in `utils/utils.tsx`: Minimum word length filter (currently set to 2)
  - `TOP_WORDS_LIMIT` in `App.tsx`: Maximum number of words to display per category (currently set to 10)
  - These values can be adjusted in the code based on your analysis needs and dataset characteristics.

## License

This project was created as a take-home coding exercise.
