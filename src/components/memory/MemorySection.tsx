import ExpandableSection from '@cloudscape-design/components/expandable-section';
import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import Badge from '@cloudscape-design/components/badge';
import SpaceBetween from '@cloudscape-design/components/space-between';
import type { MemoryChange } from '../../types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MemorySectionProps {
  changes: MemoryChange[];
  currentStep: number;
  expanded: boolean;
  onToggle: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toHex(n: number, width = 4): string {
  return '0x' + n.toString(16).toUpperCase().padStart(width, '0');
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <Box textAlign="center" color="inherit" padding="xl">
      <SpaceBetween size="s" direction="vertical">
        <Box variant="strong" color="inherit">
          No memory activity recorded for this execution.
        </Box>
      </SpaceBetween>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MemorySection({
  changes,
  currentStep,
  expanded,
  onToggle,
}: MemorySectionProps) {
  return (
    <ExpandableSection
      variant="container"
      headerText="Memory Activity"
      expanded={expanded}
      onChange={onToggle}
    >
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
                <code>
                  {item.addressHex.startsWith('0x')
                    ? item.addressHex
                    : toHex(item.address)}
                </code>
              </Box>
            ),
            width: 130,
          },
          {
            id: 'operation',
            header: 'Operation',
            cell: (item) => (
              <Badge color={item.accessType === 'read' ? 'blue' : 'red'}>
                {item.accessType === 'read' ? 'read' : 'write'}
              </Badge>
            ),
            width: 110,
          },
          {
            id: 'previousValue',
            header: 'Previous Value',
            cell: (item) => (
              <Box fontWeight={item.step === currentStep ? 'bold' : 'normal'}>
                {item.previousValue !== null ? (
                  <code>{toHex(item.previousValue)}</code>
                ) : (
                  '—'
                )}
              </Box>
            ),
            width: 150,
          },
          {
            id: 'newValue',
            header: 'New Value',
            cell: (item) => (
              <Box
                fontWeight={item.step === currentStep ? 'bold' : 'normal'}
                color={
                  item.step === currentStep ? 'text-status-info' : 'inherit'
                }
              >
                <code>{toHex(item.newValue)}</code>
              </Box>
            ),
            width: 130,
          },
        ]}
        trackBy={(item) => `${item.step}-${item.address}-${item.accessType}`}
        variant="embedded"
        ariaLabels={{ tableLabel: 'Memory activity log' }}
        empty={<EmptyState />}
      />
    </ExpandableSection>
  );
}
