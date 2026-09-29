import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import CloudscapeStatusIndicator from '@cloudscape-design/components/status-indicator';
import type { MachineState, RunMode, ExecutionStatus } from '../../utils/types';

interface CurrentInstructionPanelProps {
  machineState: MachineState | null;
  runMode: RunMode;
}

type CSType = 'error' | 'warning' | 'success' | 'info' | 'stopped' | 'pending' | 'in-progress' | 'loading';

const STATUS_TYPE: Record<ExecutionStatus, CSType> = {
  idle: 'stopped', running: 'in-progress', paused: 'pending', halted: 'success', error: 'error',
};
const STATUS_LABEL: Record<ExecutionStatus, string> = {
  idle: 'Idle', running: 'Running', paused: 'Paused', halted: 'Halted', error: 'Error',
};

const OPCODE_COLORS: Record<string, string> = {
  LOAD_CONSTANT: '#0972d3', LOAD_VARIABLE: '#0972d3',
  STORE_VARIABLE: '#7d2105',
  ADD: '#037f0c', SUB: '#037f0c', MUL: '#037f0c', DIV: '#037f0c',
  COMPARE: '#8b4513',
  JUMP: '#6b21a8', JUMP_IF_ZERO: '#6b21a8', LABEL: '#6b21a8',
  HALT: '#d91515',
};

function toHex(n: number, width = 4): string {
  return '0x' + n.toString(16).toUpperCase().padStart(width, '0');
}

function LabeledValue({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Box variant="awsui-key-label">{label}</Box>
      <div>{children}</div>
    </div>
  );
}

export default function CurrentInstructionPanel({
  machineState,
  runMode: _runMode,
}: CurrentInstructionPanelProps) {
  if (machineState === null) {
    return (
      <Box textAlign="center" color="inherit" padding="m">
        <Box variant="strong" color="inherit">No program loaded</Box>
        <Box color="inherit" padding={{ top: 'xs' }}>Load a program to see the current instruction.</Box>
      </Box>
    );
  }

  const { step, currentInstruction, status } = machineState;
  const pc = machineState.state.programCounter;
  const isRunning = status === 'running';
  const opcodeColor = currentInstruction
    ? (OPCODE_COLORS[currentInstruction.opcode] ?? '#414d5c')
    : '#414d5c';

  return (
    <SpaceBetween size="xs">
      <style>{`
        @keyframes live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.85); }
        }
      `}</style>

      <ColumnLayout columns={3} variant="text-grid">
        <LabeledValue label="Status">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isRunning && (
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#037f0c', flexShrink: 0,
                animation: 'live-pulse 1s ease-in-out infinite',
              }} />
            )}
            <CloudscapeStatusIndicator type={STATUS_TYPE[status]}>
              {STATUS_LABEL[status]}
            </CloudscapeStatusIndicator>
          </div>
        </LabeledValue>
        <LabeledValue label="PC">
          <Box fontWeight="bold"><code>{toHex(pc)}</code></Box>
        </LabeledValue>
        <LabeledValue label="Step">
          <Box fontWeight="bold">{step}</Box>
        </LabeledValue>
      </ColumnLayout>

      <LabeledValue label="Current Instruction">
        {currentInstruction === null ? (
          <Box color="text-body-secondary">None</Box>
        ) : (
          <div style={{
            fontFamily: "'JetBrains Mono','Fira Code',Consolas,monospace",
            fontSize: '0.85rem',
            background: '#f8f9fa',
            border: `1px solid ${opcodeColor}44`,
            borderLeft: `3px solid ${opcodeColor}`,
            borderRadius: '4px',
            padding: '6px 10px',
            marginTop: '2px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{
              color: opcodeColor,
              fontWeight: 700,
              fontSize: '13px',
            }}>
              {currentInstruction.opcode}
            </span>
            {currentInstruction.operands.length > 0 && (
              <span style={{ color: '#414d5c', fontSize: '13px' }}>
                {currentInstruction.operands.join(', ')}
              </span>
            )}
            <span style={{
              marginLeft: 'auto',
              fontSize: '10px',
              color: '#8c9ba5',
              background: '#e9ebed',
              borderRadius: '3px',
              padding: '1px 5px',
            }}>
              {currentInstruction.sizeBytes}B
            </span>
          </div>
        )}
      </LabeledValue>
    </SpaceBetween>
  );
}
