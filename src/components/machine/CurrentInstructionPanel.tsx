import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import StatusIndicator from '../StatusIndicator';
import type { MachineState, RunMode } from '../../types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface CurrentInstructionPanelProps {
  machineState: MachineState | null;
  runMode: RunMode;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toHex(n: number, width = 4): string {
  return '0x' + n.toString(16).toUpperCase().padStart(width, '0');
}

function LabeledValue({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Box variant="awsui-key-label">{label}</Box>
      <div>{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CurrentInstructionPanel({
  machineState,
  runMode: _runMode,
}: CurrentInstructionPanelProps) {
  if (machineState === null) {
    return (
      <Box textAlign="center" color="inherit" padding="m">
        <Box variant="strong" color="inherit">
          No program loaded
        </Box>
        <Box color="inherit" padding={{ top: 'xs' }}>
          Load a program to see the current instruction.
        </Box>
      </Box>
    );
  }

  const { step, currentInstruction, status } = machineState;
  const pc =
    machineState.kind === 'register'
      ? machineState.state.programCounter
      : machineState.state.programCounter;

  return (
    <SpaceBetween size="m">
      {/* Status + PC + Step */}
      <ColumnLayout columns={3} variant="text-grid">
        <LabeledValue label="Status">
          <StatusIndicator status={status} />
        </LabeledValue>
        <LabeledValue label="PC">
          <Box fontWeight="bold">
            <code>{toHex(pc)}</code>
          </Box>
        </LabeledValue>
        <LabeledValue label="Step">
          <Box fontWeight="bold">{step}</Box>
        </LabeledValue>
      </ColumnLayout>

      {/* Current instruction */}
      <LabeledValue label="Current Instruction">
        {currentInstruction === null ? (
          <Box color="text-body-secondary">—</Box>
        ) : (
          <div
            style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
              fontSize: '0.95rem',
              letterSpacing: '0.02em',
              background: '#f8f8f8',
              border: '1px solid #e9ebed',
              borderRadius: '4px',
              padding: '8px 12px',
              marginTop: '4px',
            }}
          >
            <span style={{ color: '#0972d3', fontWeight: 600 }}>
              {currentInstruction.opcode}
            </span>
            {currentInstruction.operands.length > 0 && (
              <span style={{ marginLeft: '0.75rem', color: '#414d5c' }}>
                {currentInstruction.operands.join(', ')}
              </span>
            )}
          </div>
        )}
      </LabeledValue>
    </SpaceBetween>
  );
}
