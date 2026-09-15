import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import type { RegisterState } from '../types';

interface RegisterStatePanelProps {
  state: RegisterState | null;
}

interface RegisterRow {
  name: string;
  decimal: number;
  hex: string;
}

const REGISTER_NAMES = ['R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'PC'];

function toHex(n: number, width = 4): string {
  return '0x' + n.toString(16).toUpperCase().padStart(width, '0');
}

function buildRows(state: RegisterState): RegisterRow[] {
  const rows: RegisterRow[] = REGISTER_NAMES.map((name) => {
    const value = name === 'PC' ? state.programCounter : (state.registers[name] ?? 0);
    return { name, decimal: value, hex: toHex(value) };
  });
  return rows;
}

export default function RegisterStatePanel({ state }: RegisterStatePanelProps) {
  if (!state) {
    return (
      <Box textAlign="center" color="inherit" padding="xl">
        <Box variant="strong" color="inherit">
          No register state available
        </Box>
        <Box color="inherit" padding={{ top: 'xs' }}>
          Load and step through a program to see register values.
        </Box>
      </Box>
    );
  }

  const rows = buildRows(state);

  return (
    <Table<RegisterRow>
      items={rows}
      columnDefinitions={[
        {
          id: 'name',
          header: 'Register',
          cell: (item) => (
            <Box fontWeight={item.name === 'PC' ? 'bold' : 'normal'}>
              {item.name}
            </Box>
          ),
          width: 100,
        },
        {
          id: 'decimal',
          header: 'Decimal',
          cell: (item) => item.decimal,
          width: 120,
        },
        {
          id: 'hex',
          header: 'Hex',
          cell: (item) => <code>{item.hex}</code>,
          width: 120,
        },
      ]}
      trackBy="name"
      variant="embedded"
      ariaLabels={{ tableLabel: 'Register state' }}
      empty={
        <Box textAlign="center" color="inherit" padding="m">
          No register data.
        </Box>
      }
    />
  );
}
