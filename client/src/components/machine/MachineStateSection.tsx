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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%)', borderRadius: '8px', padding: '10px', border: '1px solid #0972d333' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0972d3' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0972d3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Register VM</span>
          </div>
          {regState
            ? <RegisterFileVisual state={regState} />
            : <EmptyState message="Load and step to see register state" />}
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f0fff4 0%, #e6ffed 100%)', borderRadius: '8px', padding: '10px', border: '1px solid #037f0c33' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#037f0c' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#037f0c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stack VM</span>
          </div>
          {stkState
            ? <StackVisual state={stkState} />
            : <EmptyState message="Load and step to see stack state" />}
        </div>
      </div>
    );
  } else if (runMode === 'register') {
    content = (
      <div style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%)', borderRadius: '8px', padding: '10px', border: '1px solid #0972d333' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0972d3' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#0972d3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Register VM Active</span>
        </div>
        {regState
          ? <RegisterFileVisual state={regState} />
          : <EmptyState message="Load and step through a program to see register values." />}
      </div>
    );
  } else {
    content = (
      <div style={{ background: 'linear-gradient(135deg, #f0fff4 0%, #e6ffed 100%)', borderRadius: '8px', padding: '10px', border: '1px solid #037f0c33' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#037f0c' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#037f0c', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stack VM Active</span>
        </div>
        {stkState
          ? <StackVisual state={stkState} />
          : <EmptyState message="Load and step through a program to see the operand stack." />}
      </div>
    );
  }

  return <div style={{ minHeight: '340px', height: '100%', boxSizing: 'border-box' }}>{content}</div>;
}
