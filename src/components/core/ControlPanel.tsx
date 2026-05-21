import React, { useMemo, useState } from 'react';
import { ChapterConfig, StageMode, BuildStep } from '../../engine/types';

interface ControlPanelProps {
  chapter: ChapterConfig;
  mode: StageMode;
  activeStep?: BuildStep;
  currentStepIndex?: number;
  totalSteps?: number;
  onNextStep?: () => void;
  onPreviousStep?: () => void;
  onResetSteps?: () => void;
  exploreValues?: Record<string, number | boolean>;
  onExploreChange?: (id: string, value: number | boolean) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  chapter, 
  mode, 
  activeStep,
  currentStepIndex = 0,
  totalSteps = 0,
  onNextStep,
  onPreviousStep,
  onResetSteps,
  exploreValues,
  onExploreChange,
}) => {
  const [localValues, setLocalValues] = useState<Record<string, number | boolean>>(
    chapter.exploreControls?.reduce((acc, control) => {
      acc[control.targetKey] = control.defaultValue ?? (control.type === 'slider' ? 0 : false);
      return acc;
    }, {} as Record<string, number | boolean>) ?? {}
  );

  const controlValues = exploreValues ?? localValues;

  const handleControlChange = (id: string, value: number | boolean) => {
    if (onExploreChange) {
      onExploreChange(id, value);
    } else {
      setLocalValues((prev) => ({ ...prev, [id]: value }));
    }
  };

  const title = useMemo(() => {
    switch (mode) {
      case 'book':
        return 'Chapter notes';
      case 'animate':
        return 'Animation timeline';
      case 'build':
        return activeStep ? activeStep.title : 'Build sequence';
      case 'explore':
        return 'Explore controls';
      default:
        return 'Controls';
    }
  }, [mode, activeStep]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div className="mt-5 space-y-5">
        {mode === 'build' ? (
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Step {currentStepIndex >= 0 ? currentStepIndex + 1 : 1} of {totalSteps}
                </span>
              </div>
              <p className="text-sm text-slate-700 font-medium mb-2">
                {activeStep?.title ??
                  chapter.buildSteps?.[0]?.title ??
                  'Ready to begin the build sequence'}
              </p>
              <p className="text-sm text-slate-600 whitespace-pre-line">
                {activeStep?.description ??
                  chapter.modeContent?.build ??
                  chapter.buildSteps?.[0]?.description ??
                  'Click Next to reveal the first layer.'}
              </p>
              {activeStep?.visibleLayers?.length ? (
                <div className="mt-4 space-y-2">
                  <p className="text-slate-700 text-xs font-medium uppercase">Visible elements:</p>
                  <div className="flex flex-wrap gap-2">
                    {activeStep.visibleLayers.map((layer) => (
                      <span key={layer} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                        {layer}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onPreviousStep}
                disabled={currentStepIndex <= -1}
                className="flex-1 rounded-lg bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              <button
                onClick={onNextStep}
                disabled={currentStepIndex >= totalSteps - 1}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>

            {currentStepIndex >= 0 && currentStepIndex === totalSteps - 1 && (
              <button
                onClick={onResetSteps}
                className="w-full rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Reset to Start
              </button>
            )}
          </div>
        ) : null}

        {mode === 'explore' && chapter.exploreControls?.length ? (
          <div className="space-y-4">
            {chapter.exploreControls.map((control) => (
              <div key={control.id}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="block text-sm font-medium text-slate-700">{control.label}</span>
                  {control.type === 'button' && (
                    <button
                      type="button"
                      onClick={() => handleControlChange(control.targetKey, !Boolean(controlValues[control.targetKey]))}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        controlValues[control.targetKey] ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {controlValues[control.targetKey] ? 'Hide' : 'Show'}
                    </button>
                  )}
                </div>
                {control.type === 'slider' ? (
                  <input
                    id={control.id}
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={Number(controlValues[control.targetKey] ?? 0)}
                    onChange={(event) =>
                      handleControlChange(control.targetKey, Number(event.target.value))
                    }
                    className="mt-2 w-full accent-slate-700"
                  />
                ) : control.type === 'toggle' ? (
                  <input
                    id={control.id}
                    type="checkbox"
                    checked={Boolean(controlValues[control.targetKey])}
                    onChange={(event) =>
                      handleControlChange(control.targetKey, event.target.checked)
                    }
                    className="mt-2 h-5 w-5 accent-slate-700"
                  />
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {mode === 'book' ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 space-y-3">
            <p>
              {chapter.modeContent?.book || chapter.description}
            </p>
          </div>
        ) : null}

        {mode === 'animate' ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            {chapter.modeContent?.animate || 'Animations are defined per chapter and driven by reusable motion steps.'}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ControlPanel;
