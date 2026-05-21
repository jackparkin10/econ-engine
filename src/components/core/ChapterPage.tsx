import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChapterConfig, StageMode } from '../../engine/types';
import DisplayPanel from './DisplayPanel';
import ControlPanel from './ControlPanel';
import ModeButtons from './ModeButtons';

interface ChapterPageProps {
  chapter: ChapterConfig;
}

const ChapterPage: React.FC<ChapterPageProps> = ({ chapter }) => {
  const [mode, setMode] = useState<StageMode>('book');
  const [activeStep, setActiveStep] = useState(-1);
  const [exploreValues, setExploreValues] = useState<Record<string, number | boolean>>(
    chapter.exploreControls?.reduce((acc, control) => {
      acc[control.targetKey] = control.defaultValue ?? (control.type === 'slider' ? 0 : false);
      return acc;
    }, {} as Record<string, number | boolean>) ?? {}
  );

  const buildStepCount = chapter.buildSteps?.length ?? 0;

  useEffect(() => {
    setActiveStep(-1);
  }, [chapter.id]);

  useEffect(() => {
    if (buildStepCount === 0) return;
    if (activeStep >= buildStepCount) {
      setActiveStep(buildStepCount - 1);
    }
  }, [buildStepCount, activeStep]);

  const clampedStepIndex =
    buildStepCount > 0 ? Math.min(activeStep, buildStepCount - 1) : -1;
  const currentBuild = useMemo(
    () => chapter.buildSteps?.[clampedStepIndex],
    [chapter.buildSteps, clampedStepIndex]
  );

  const handleNextStep = () => {
    if (chapter.buildSteps && activeStep < chapter.buildSteps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (activeStep > -1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleResetSteps = () => {
    setActiveStep(-1);
  };

  return (
    <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="grid gap-8 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-8">
          <DisplayPanel chapter={chapter} mode={mode} activeStep={currentBuild} exploreValues={exploreValues} />
          <ModeButtons mode={mode} onModeChange={setMode} />
        </div>
        <ControlPanel 
          chapter={chapter} 
          mode={mode} 
          activeStep={currentBuild}
          currentStepIndex={clampedStepIndex}
          totalSteps={buildStepCount}
          onNextStep={handleNextStep}
          onPreviousStep={handlePreviousStep}
          onResetSteps={handleResetSteps}
          exploreValues={exploreValues}
          onExploreChange={(id, value) => setExploreValues((prev) => ({ ...prev, [id]: value }))}
        />
      </div>
    </motion.div>
  );
};

export default ChapterPage;
