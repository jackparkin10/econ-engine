import { ChapterConfig } from '../engine/types';
import { supplyDemandChapter } from './chapters';
import { elasticityChapter } from './elasticityChapter';
import { increaseInSupplyChapter } from './increaseInSupplyChapter';
import { quantitySuppliedVsSupplyChapter } from './quantitySuppliedVsSupplyChapter';

export const chapters: ChapterConfig[] = [
  supplyDemandChapter,
  increaseInSupplyChapter,
  quantitySuppliedVsSupplyChapter,
  elasticityChapter,
];

export const getChapterById = (id: string): ChapterConfig | undefined => {
  return chapters.find((ch) => ch.id === id);
};

export const getDefaultChapter = (): ChapterConfig => {
  return chapters[0];
};
