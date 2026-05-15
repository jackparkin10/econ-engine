import { useState } from 'react';
import AppShell from './components/core/AppShell';
import { chapters, getDefaultChapter } from './config/chapterRegistry';

function App() {
  const [selectedChapterId, setSelectedChapterId] = useState(getDefaultChapter().id);
  const selectedChapter = chapters.find((ch) => ch.id === selectedChapterId) || getDefaultChapter();

  return (
    <div>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 bg-slate-50">
        <label htmlFor="chapter-select" className="text-sm font-semibold text-slate-700">
          Chapter:
        </label>
        <select
          id="chapter-select"
          value={selectedChapterId}
          onChange={(e) => setSelectedChapterId(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.title}
            </option>
          ))}
        </select>
      </div>
      <AppShell chapter={selectedChapter} />
    </div>
  );
}

export default App;
