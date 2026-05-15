import React from 'react';
import { ChapterConfig, StageMode, BuildStep } from '../../engine/types';
import GraphCanvas from './GraphCanvas';

interface DisplayPanelProps {
  chapter: ChapterConfig;
  mode: StageMode;
  activeStep?: BuildStep;
  exploreValues?: Record<string, number | boolean>;
}

const DisplayPanel: React.FC<DisplayPanelProps> = ({ chapter, mode, activeStep, exploreValues }) => {
  return (
    <div className="rounded-[2rem] bg-white/90 p-6 shadow-soft border border-slate-200">
      <div className="flex flex-col gap-6">
        <div className="rounded-3xl bg-white p-4">
          <GraphCanvas chapter={chapter} mode={mode} activeStep={activeStep} exploreValues={exploreValues} />
        </div>
      </div>
    </div>
  );
};

export default DisplayPanel;
