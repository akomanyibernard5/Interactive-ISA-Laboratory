import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import Badge from '@cloudscape-design/components/badge';
import type { StackState } from '../types';

interface OperandStackPanelProps {
  state: StackState | null;
}

interface StackRow {
  position: number;
  label: string;
  decimal: number;
  hex: string;
  isTop: boolean;
}

function toHex(n: number, width = 4): string {
  return '0x' + n.toString(16).toUpperCase().padStart(width, '0');
}

function buildRows(stack: number[]): StackRow[] {
  // Display from top to bottom so top of stack is first row
  return stack
    .slice()
    .reverse()
    .map((value, reversedIndex) => {
      const position = stack.length - 1 - reversedIndex; // original index in stack array
      return {
        position,
        label: `[${position}]`,
        decimal: value,
        hex: toHex(value),
        isTop: reversedIndex === 0,
      };
    });
}

export default function OperandStackPanel({ state }: OperandStackPanelProps) {
  if (!state) {
    return (
      <Box textAlign="center" color="inherit" padding="xl">
        <Box variant="strong" color="inherit">
          No stack state available
        </Box>
        <Box color="inherit" padding={{ top: 'xs' }}>
          Load and step through a stack-machine program to see the operand stack.
        </Box>
      </Box>
    );
  }

  if (state.stack.length === 0) {
    return (
      <Box textAlign="center" color="inherit" padding="xl">
        <Box variant="strong" color="inherit">
          Stack is empty
        </Box>
      </Box>
    );
  }

  const rows = buildRows(state.stack);

  return (
    <Table<StackRow>
      items={rows}
      columnDefinitions={[
        {
          id: 'position',
          header: 'Position',
          cell: (item) => (
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span>{item.label}</span>
              {item.isTop && (
                <span style={{ marginLeft: '6px' }}>
                  <Badge color="blue">TOP</Badge>
                </span>
              )}
            </span>
          ),
          width: 130,
        },
        {
          id: 'decimal',
          header: 'Value (decimal)',
          cell: (item) => item.decimal,
        },
        {
          id: 'hex',
          header: 'Value (hex)',
          cell: (item) => <code>{item.hex}</code>,
        },
      ]}
      trackBy="position"
      variant="embedded"
      ariaLabels={{ tableLabel: 'Operand stack' }}
      empty={
        <Box textAlign="center" color="inherit" padding="m">
          Stack is empty.
        </Box>
      }
    />
  );
}
