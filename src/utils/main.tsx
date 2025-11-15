import { STOP_WORDS } from "../const/main.constant";

export const removeStopWordsAndSpecialCharacters = (text: string) => {
  const words = text.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, "").split(/\s+/);
  return words.filter((word) => !STOP_WORDS.includes(word));
};

export const getFrequency = (words: string[]) => {
  return words.reduce((acc: any, current) => {
    if (!acc[current]) acc[current] = 0;
    acc[current] += 1;
    return acc;
  }, {});
};

export const getTop3Words = (frequency: any) => {
  return Object.entries(frequency).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3);
};