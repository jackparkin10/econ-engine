import React from 'react';
import { ChapterConfig } from '../../engine/types';
import ChapterPage from './ChapterPage';

interface AppShellProps {
  chapter: ChapterConfig;
}

const AppShell: React.FC<AppShellProps> = ({ chapter }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-8">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-soft">
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900">{chapter.title}</h1>
            <p className="mt-3 text-slate-600 max-w-2xl">{chapter.description}</p>
          </div>
        </header>
        <ChapterPage chapter={chapter} />
      </div>
    </div>
  );
};

export default AppShell;
