import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import CloudscapeStatusIndicator from '@cloudscape-design/components/status-indicator';
import type { MachineState, RunMode, ExecutionStatus, Instruction } from '../../utils/types';
import { OPCODE_COLORS } from '../../utils/opcodeColors';

interface CurrentInstructionPanelProps {
  machineState: MachineState | null;
  runMode: RunMode;
}

function toHex(n: number, width = 4): string {
  return '0x' + n.toString(16).toUpperCase().padStart(width, '0');
}

type CSType = 'error' | 'warning' | 'success' | 'info' | 'stopped' | 'pending' | 'in-progress' | 'loading';

const STATUS_TYPE: Record<ExecutionStatus, CSType> = {
  idle: 'stopped', running: 'in-progress', paused: 'pending', halted: 'success', error: 'error',
};
const STATUS_LABEL: Record<ExecutionStatus, string> = {
  idle: 'Idle', running: 'Running', paused: 'Paused', halted: 'Halted', error: 'Error',
};

const STATUS_COLORS: Record<ExecutionStatus, string> = {
  idle: '#8c9ba5', running: '#037f0c', paused: '#f89c0a', halted: '#0972d3', error: '#d91515',
};

function LabeledValue({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Box variant="awsui-key-label">{label}</Box>
      <div>{children}</div>
    </div>
  );
}

function InstructionCard({ instruction, isCurrent }: { instruction: Instruction | null; isCurrent: boolean }) {
  if (instruction === null) {
    return (
      <div style={{
        padding: '12px',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '2px dashed #d5dbdb',
        textAlign: 'center',
      }}>
        <span style={{ color: '#8c9ba5', fontSize: '12px' }}>No instruction</span>
      </div>
    );
  }

  const opcodeColor = OPCODE_COLORS[instruction.opcode] ?? '#414d5c';

  return (
    <div style={{
      fontFamily: "'JetBrains Mono','Fira Code',Consolas,monospace",
      background: `linear-gradient(135deg, ${opcodeColor}08 0%, ${opcodeColor}15 100%)`,
      border: `2px solid ${opcodeColor}`,
      borderLeft: `5px solid ${opcodeColor}`,
      borderRadius: '8px',
      padding: '12px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      boxShadow: isCurrent ? `0 4px 12px ${opcodeColor}30` : 'none',
      transition: 'box-shadow 0.3s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{
          color: opcodeColor,
          fontWeight: 800,
          fontSize: '14px',
          letterSpacing: '0.02em',
        }}>
          {instruction.opcode}
        </span>
        {instruction.operands.length > 0 && (
          <span style={{ color: '#414d5c', fontSize: '13px', fontWeight: 500 }}>
            {instruction.operands.join(', ')}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#8c9ba5' }}>Address:</span>
          <code style={{ color: '#6b21a8', fontWeight: 600 }}>{toHex(instruction.address)}</code>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#8c9ba5' }}>Size:</span>
          <span style={{ color: '#b26900', fontWeight: 600 }}>{instruction.sizeBytes} bytes</span>
        </span>
        <span style={{
          marginLeft: 'auto',
          background: opcodeColor,
          color: '#fff',
          borderRadius: '4px',
          padding: '2px 8px',
          fontWeight: 700,
          fontSize: '10px',
          textTransform: 'uppercase',
        }}>
          {instruction.opcode.split('_')[0]}
        </span>
      </div>
    </div>
  );
}

export default function CurrentInstructionPanel({
  machineState,
  runMode: _runMode,
}: CurrentInstructionPanelProps) {
  if (machineState === null) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '280px',
        background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
        borderRadius: '8px',
        border: '2px dashed #d5dbdb',
      }}>
        <span style={{ fontSize: '32px', marginBottom: '8px' }}>💤</span>
        <Box variant="strong" color="text-body-secondary">No program loaded</Box>
        <Box color="text-body-secondary" fontSize="body-s" padding={{ top: 'xs' }}>Load a program to see the current instruction.</Box>
      </div>
    );
  }

  const { step, currentInstruction, status } = machineState;
  const pc = machineState.state.programCounter;
  const isRunning = status === 'running';
  const statusColor = STATUS_COLORS[status];

  return (
    <div style={{ minHeight: '340px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes live-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.9); }
        }
      `}</style>

      <SpaceBetween size="m">
        {/* Status banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          background: `linear-gradient(135deg, ${statusColor}15 0%, ${statusColor}25 100%)`,
          borderRadius: '8px',
          border: `1px solid ${statusColor}40`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isRunning && (
              <span style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: statusColor,
                animation: 'live-pulse 1s ease-in-out infinite',
                boxShadow: `0 0 0 3px ${statusColor}40`,
              }} />
            )}
            {!isRunning && (
              <span style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: statusColor,
              }} />
            )}
            <span style={{ fontWeight: 700, color: statusColor, fontSize: '13px' }}>
              {STATUS_LABEL[status].toUpperCase()}
            </span>
          </div>
          <CloudscapeStatusIndicator type={STATUS_TYPE[status]}>
            {STATUS_LABEL[status]}
          </CloudscapeStatusIndicator>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '8px',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%)',
            borderRadius: '8px',
            padding: '10px 12px',
            border: '1px solid #0972d330',
          }}>
            <Box variant="awsui-key-label" fontSize="body-s">PC</Box>
            <Box fontWeight="bold" fontSize="heading-m" color="text-status-info">
              <code>{toHex(pc)}</code>
            </Box>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #fff8e6 0%, #fff0cc 100%)',
            borderRadius: '8px',
            padding: '10px 12px',
            border: '1px solid #b2690030',
          }}>
            <Box variant="awsui-key-label" fontSize="body-s">Step</Box>
            <Box fontWeight="bold" fontSize="heading-m" color="text-status-warning">
              {step}
            </Box>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #f0fff4 0%, #e6ffed 100%)',
            borderRadius: '8px',
            padding: '10px 12px',
            border: '1px solid #037f0c30',
          }}>
            <Box variant="awsui-key-label" fontSize="body-s">Mode</Box>
            <Box fontWeight="bold" fontSize="heading-m" color="text-status-success">
              {_runMode === 'both' ? 'Both' : _runMode === 'register' ? 'Reg' : 'Stk'}
            </Box>
          </div>
        </div>

        {/* Instruction card */}
        <div>
          <Box variant="awsui-key-label" padding={{ bottom: 'xs' }}>Current Instruction</Box>
          <InstructionCard instruction={currentInstruction} isCurrent={true} />
        </div>
      </SpaceBetween>
    </div>
  );
}
