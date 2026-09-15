import SpaceBetween from '@cloudscape-design/components/space-between';
import Button from '@cloudscape-design/components/button';
import type { ExecutionStatus } from '../types';

interface ExecutionControlsProps {
  status: ExecutionStatus;
  isLoaded: boolean;
  onLoad: () => void;
  onRun: () => void;
  onStep: () => void;
  onReset: () => void;
}

export default function ExecutionControls({
  status,
  isLoaded,
  onLoad,
  onRun,
  onStep,
  onReset,
}: ExecutionControlsProps) {
  const isHalted = status === 'halted';
  const isRunning = status === 'running';

  // Run/Step disabled when: not loaded, halted, or currently running
  const runStepDisabled = !isLoaded || isHalted || isRunning;

  return (
    <SpaceBetween direction="horizontal" size="xs">
      <Button
        variant="normal"
        onClick={onLoad}
        ariaLabel="Load program"
      >
        Load
      </Button>
      <Button
        variant="normal"
        onClick={onRun}
        disabled={runStepDisabled}
        ariaLabel="Run program"
      >
        Run
      </Button>
      <Button
        variant="primary"
        onClick={onStep}
        disabled={runStepDisabled}
        ariaLabel="Step through program"
      >
        Step
      </Button>
      <Button
        variant="normal"
        onClick={onReset}
        disabled={!isLoaded}
        ariaLabel="Reset execution"
      >
        Reset
      </Button>
    </SpaceBetween>
  );
}
