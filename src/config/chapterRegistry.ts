import { ChapterConfig } from '../engine/types';
import { supplyDemandChapter } from './chapters';
import { elasticityChapter } from './elasticityChapter';

export const chapters: ChapterConfig[] = [supplyDemandChapter, elasticityChapter];

export const getChapterById = (id: string): ChapterConfig | undefined => {
  return chapters.find((ch) => ch.id === id);
};

export const getDefaultChapter = (): ChapterConfig => {
  return chapters[0];
};
