export const theme = {
  colors: {
    supply: '#ef4444', // red
    demand: '#3b82f6', // blue
    equilibrium: '#10b981', // green
    surplus: '#fbbf24', // yellow
    shortage: '#f97316', // orange
    axis: '#6b7280', // gray
    grid: '#e5e7eb', // light gray
  },
  spacing: {
    margin: '1rem',
    padding: '0.5rem',
  },
  typography: {
    fontSize: {
      small: '0.875rem',
      medium: '1rem',
      large: '1.25rem',
    },
    fontFamily: 'sans-serif',
  },
  grid: {
    stroke: '#e5e7eb',
    strokeWidth: 1,
  },
};

export type Theme = typeof theme;