import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import Badge from '@cloudscape-design/components/badge';
import type { MemoryChange } from '../types';

interface MemoryViewerProps {
  changes: MemoryChange[];
  currentStep: number;
}

function toHex(n: number, width = 4): string {
  return '0x' + n.toString(16).toUpperCase().padStart(width, '0');
}

export default function MemoryViewer({ changes, currentStep }: MemoryViewerProps) {
  return (
    <Table<MemoryChange>
      items={changes}
      columnDefinitions={[
        {
          id: 'step',
          header: 'Step',
          cell: (item) => (
            <Box fontWeight={item.step === currentStep ? 'bold' : 'normal'}>
              {item.step}
            </Box>
          ),
          width: 80,
        },
        {
          id: 'address',
          header: 'Address',
          cell: (item) => (
            <Box fontWeight={item.step === currentStep ? 'bold' : 'normal'}>
              <code>{item.addressHex}</code>
            </Box>
          ),
          width: 120,
        },
        {
          id: 'accessType',
          header: 'Access Type',
          cell: (item) => (
            <Badge color={item.accessType === 'read' ? 'blue' : 'severity-medium'}>
              {item.accessType === 'read' ? 'Read' : 'Write'}
            </Badge>
          ),
          width: 110,
        },
        {
          id: 'previousValue',
          header: 'Previous Value',
          cell: (item) => (
            <Box fontWeight={item.step === currentStep ? 'bold' : 'normal'}>
              {item.previousValue !== null ? <code>{toHex(item.previousValue)}</code> : '—'}
            </Box>
          ),
          width: 140,
        },
        {
          id: 'newValue',
          header: 'New Value',
          cell: (item) => (
            <Box
              fontWeight={item.step === currentStep ? 'bold' : 'normal'}
              color={item.step === currentStep ? 'text-status-info' : 'inherit'}
            >
              <code>{toHex(item.newValue)}</code>
            </Box>
          ),
          width: 120,
        },
      ]}
      trackBy="step"
      variant="embedded"
      ariaLabels={{ tableLabel: 'Memory activity' }}
      empty={
        <Box textAlign="center" color="inherit" padding="m">
          No memory activity recorded.
        </Box>
      }
    />
  );
}
