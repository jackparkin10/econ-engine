import { ChapterConfig } from '../engine/types';
import { supplyDemandChapter } from './chapters';
import { elasticityChapter } from './elasticityChapter';
import { increaseInSupplyChapter } from './increaseInSupplyChapter';

export const chapters: ChapterConfig[] = [
  supplyDemandChapter,
  increaseInSupplyChapter,
  elasticityChapter,
];

export const getChapterById = (id: string): ChapterConfig | undefined => {
  return chapters.find((ch) => ch.id === id);
};

export const getDefaultChapter = (): ChapterConfig => {
  return chapters[0];
};
