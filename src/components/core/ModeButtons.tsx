import React from 'react';
import { StageMode } from '../../engine/types';

interface ModeButtonsProps {
  mode: StageMode;
  onModeChange: (mode: StageMode) => void;
}

const buttonLabels: Array<{ id: StageMode; label: string }> = [
  { id: 'book', label: 'Book View' },
  { id: 'animate', label: 'Animate' },
  { id: 'build', label: 'Build' },
  { id: 'explore', label: 'Explore' },
];

const ModeButtons: React.FC<ModeButtonsProps> = ({ mode, onModeChange }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex flex-wrap gap-3 justify-center">
        {buttonLabels.map((button) => (
          <button
            key={button.id}
            onClick={() => onModeChange(button.id)}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold text-white transition ${
              mode === button.id ? 'bg-slate-900' : 'bg-slate-900/80 hover:bg-slate-900'
            }`}
          >
            {button.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModeButtons;
