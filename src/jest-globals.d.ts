/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

declare global {
  const describe: typeof import('jest').describe;
  const it: typeof import('jest').it;
  const expect: typeof import('jest').expect;
  const beforeEach: typeof import('jest').beforeEach;
  const afterEach: typeof import('jest').afterEach;
  const beforeAll: typeof import('jest').beforeAll;
  const afterAll: typeof import('jest').afterAll;
}

// Extend Jest matchers with jest-dom custom matchers
declare namespace jest {
  interface Matchers<R> {
    toBeInTheDocument(): R;
    toBeEnabled(): R;
    toBeDisabled(): R;
    toHaveTextContent(text: string | RegExp): R;
    toBeVisible(): R;
    toHaveClass(...classNames: string[]): R;
    toHaveAttribute(attr: string, value?: string): R;
  }
}

export {};
