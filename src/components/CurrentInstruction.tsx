import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import StatusIndicator from './StatusIndicator';
import type { Instruction, ExecutionStatus } from '../types';

interface CurrentInstructionProps {
  instruction: Instruction | null;
  step: number;
  programCounter: number;
  status: ExecutionStatus;
}

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

export default function CurrentInstruction({
  instruction,
  step,
  programCounter,
  status,
}: CurrentInstructionProps) {
  return (
    <Container header={<Header variant="h3">Current Instruction</Header>}>
      {instruction === null ? (
        <Box textAlign="center" color="inherit" padding="m">
          <Box variant="strong" color="inherit">
            No instruction executing
          </Box>
          <Box color="inherit" padding={{ top: 'xs' }}>
            Load and start stepping through a program.
          </Box>
        </Box>
      ) : (
        <SpaceBetween size="m">
          <ColumnLayout columns={4} variant="text-grid">
            <LabeledValue label="Program Counter">
              <Box fontWeight="bold">
                <code>{toHex(programCounter)}</code>
              </Box>
            </LabeledValue>
            <LabeledValue label="Execution Step">
              <Box fontWeight="bold">{step}</Box>
            </LabeledValue>
            <LabeledValue label="Status">
              <StatusIndicator status={status} />
            </LabeledValue>
            <LabeledValue label="Size (bytes)">
              <Box>{instruction.sizeBytes}</Box>
            </LabeledValue>
          </ColumnLayout>

          <LabeledValue label="Current Instruction">
            <Box
              padding="s"
              fontSize="body-m"
            >
              <code style={{ fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '0.02em' }}>
                {instruction.opcode}
                {instruction.operands.length > 0 && (
                  <span style={{ marginLeft: '0.75rem', opacity: 0.85 }}>
                    {instruction.operands.join(', ')}
                  </span>
                )}
              </code>
            </Box>
          </LabeledValue>

          <LabeledValue label="Encoded">
            <code style={{ fontFamily: 'monospace' }}>{instruction.encoded}</code>
          </LabeledValue>
        </SpaceBetween>
      )}
    </Container>
  );
}
