import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import type { Program, Instruction } from '../types';

interface ProgramViewerProps {
  program: Program | null;
  currentStep: number; // index of the current instruction
}

function toHex(n: number, width = 4): string {
  return '0x' + n.toString(16).toUpperCase().padStart(width, '0');
}

export default function ProgramViewer({ program, currentStep }: ProgramViewerProps) {
  if (!program) {
    return (
      <Box textAlign="center" color="inherit" padding="xl">
        <Box variant="strong" color="inherit">
          No program loaded
        </Box>
        <Box color="inherit" padding={{ top: 'xs' }}>
          Select and load a program to view its instructions.
        </Box>
      </Box>
    );
  }

  const items = program.instructions;

  return (
    <Table<Instruction>
      items={items}
      columnDefinitions={[
        {
          id: 'address',
          header: 'Address',
          cell: (item) => (
            <Box fontWeight={item === items[currentStep] ? 'bold' : 'normal'}>
              {toHex(item.address)}
            </Box>
          ),
          width: 110,
        },
        {
          id: 'opcode',
          header: 'Opcode',
          cell: (item) => (
            <Box
              fontWeight={item === items[currentStep] ? 'bold' : 'normal'}
              color={item === items[currentStep] ? 'text-status-info' : 'inherit'}
            >
              {item.opcode}
            </Box>
          ),
          width: 160,
        },
        {
          id: 'operands',
          header: 'Operands',
          cell: (item) => item.operands.join(', ') || '—',
        },
        {
          id: 'size',
          header: 'Size (bytes)',
          cell: (item) => item.sizeBytes,
          width: 110,
        },
        {
          id: 'encoded',
          header: 'Encoded',
          cell: (item) => (
            <Box fontWeight="normal" display="inline">
              <code>{item.encoded}</code>
            </Box>
          ),
        },
      ]}
      trackBy="address"
      variant="embedded"
      empty={
        <Box textAlign="center" color="inherit" padding="m">
          No instructions in program.
        </Box>
      }
      ariaLabels={{
        tableLabel: 'Program instructions',
      }}
    />
  );
}
