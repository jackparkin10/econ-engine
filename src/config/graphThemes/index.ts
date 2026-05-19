import { GraphThemeConfig } from './types';
import { textbookGraphTheme } from './textbook';
import { legacyGraphTheme } from './legacy';

export const DEFAULT_GRAPH_THEME_ID = 'textbook';

const graphThemes: Record<string, GraphThemeConfig> = {
  [textbookGraphTheme.id]: textbookGraphTheme,
  [legacyGraphTheme.id]: legacyGraphTheme,
};

export const getGraphTheme = (id?: string): GraphThemeConfig => {
  if (id && graphThemes[id]) return graphThemes[id];
  return graphThemes[DEFAULT_GRAPH_THEME_ID];
};

export * from './types';
export { textbookGraphTheme, legacyGraphTheme };
