import type React from 'react';
import Box from '@cloudscape-design/components/box';
import type { MachineState, RunMode } from '../../utils/types';
import RegisterFileVisual from '../visuals/RegisterFileVisual';
import StackVisual from '../visuals/StackVisual';

interface MachineStateSectionProps {
  registerState: MachineState | null;
  stackState: MachineState | null;
  runMode: RunMode;
}

function toRegisterState(ms: MachineState | null) {
  if (!ms || ms.kind !== 'register') return null;
  return ms.state;
}

function toStackState(ms: MachineState | null) {
  if (!ms || ms.kind !== 'stack') return null;
  return ms.state;
}

function EmptyState({ message }: { message: string }) {
  return (
    <Box textAlign="center" color="text-body-secondary" padding="xl">
      <Box variant="strong" color="inherit">No state available</Box>
      <Box color="inherit">{message}</Box>
    </Box>
  );
}

export default function MachineStateSection({
  registerState,
  stackState,
  runMode,
}: MachineStateSectionProps) {
  const regState = toRegisterState(registerState);
  const stkState = toStackState(stackState);

  let content: React.ReactNode;

  if (runMode === 'both') {
    content = (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          {regState
            ? <RegisterFileVisual state={regState} />
            : <EmptyState message="No register state" />}
        </div>
        <div>
          {stkState
            ? <StackVisual state={stkState} />
            : <EmptyState message="No stack state" />}
        </div>
      </div>
    );
  } else if (runMode === 'register') {
    content = regState
      ? <RegisterFileVisual state={regState} />
      : <EmptyState message="Load and step through a program to see register values." />;
  } else {
    content = stkState
      ? <StackVisual state={stkState} />
      : <EmptyState message="Load and step through a program to see the operand stack." />;
  }

  return <>{content}</>;
}
