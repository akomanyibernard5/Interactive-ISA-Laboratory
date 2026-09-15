import { useState } from 'react';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import Tabs from '@cloudscape-design/components/tabs';
import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import Badge from '@cloudscape-design/components/badge';
import Alert from '@cloudscape-design/components/alert';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import SpaceBetween from '@cloudscape-design/components/space-between';
import type { TranslationResult, CommonIRInstruction } from '../../types';
import type { Instruction } from '../../types';

interface TranslationSectionProps {
  translation: TranslationResult | null;
  currentStep: number;
  expanded: boolean;
  onToggle: () => void;
}

function toHex(n: number, width = 4): string {
  return '0x' + n.toString(16).toUpperCase().padStart(width, '0');
}

// ---------------------------------------------------------------------------
// Common IR tab
// ---------------------------------------------------------------------------

function CommonIRTable({ items }: { items: CommonIRInstruction[] }) {
  return (
    <Table<CommonIRInstruction>
      items={items}
      trackBy="index"
      variant="embedded"
      columnDefinitions={[
        {
          id: 'index',
          header: '#',
          cell: (item) => item.index,
          width: 60,
        },
        {
          id: 'opcode',
          header: 'Opcode',
          cell: (item) => <code>{item.opcode}</code>,
          width: 180,
        },
        {
          id: 'operands',
          header: 'Operands',
          cell: (item) =>
            item.operands.length > 0 ? (
              <code>{item.operands.join(', ')}</code>
            ) : (
              '—'
            ),
        },
        {
          id: 'comment',
          header: 'Comment',
          cell: (item) => (
            <Box color="text-status-inactive">
              <em>{item.comment}</em>
            </Box>
          ),
        },
      ]}
      ariaLabels={{ tableLabel: 'Common IR instructions' }}
      empty={
        <Box textAlign="center" color="inherit" padding="m">
          No IR instructions.
        </Box>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// VM Program tab (shared by Register and Stack)
// ---------------------------------------------------------------------------

interface VMProgramTableProps {
  items: Instruction[];
  currentStep: number;
  ariaLabel: string;
}

function VMProgramTable({ items, currentStep, ariaLabel }: VMProgramTableProps) {
  // Determine the address of the currently executing instruction by index
  const currentAddress = items[currentStep]?.address ?? -1;

  return (
    <Table<Instruction>
      items={items}
      trackBy="address"
      variant="embedded"
      columnDefinitions={[
        {
          id: 'address',
          header: 'Address',
          cell: (item) => {
            const isCurrent = item.address === currentAddress;
            return (
              <Box
                fontWeight={isCurrent ? 'bold' : 'normal'}
                color={isCurrent ? 'text-status-info' : 'inherit'}
              >
                <code>{toHex(item.address)}</code>
              </Box>
            );
          },
          width: 110,
        },
        {
          id: 'opcode',
          header: 'Opcode',
          cell: (item) => {
            const isCurrent = item.address === currentAddress;
            return (
              <Box
                fontWeight={isCurrent ? 'bold' : 'normal'}
                color={isCurrent ? 'text-status-info' : 'inherit'}
              >
                <code>{item.opcode}</code>
              </Box>
            );
          },
          width: 180,
        },
        {
          id: 'operands',
          header: 'Operands',
          cell: (item) => {
            const isCurrent = item.address === currentAddress;
            return (
              <Box fontWeight={isCurrent ? 'bold' : 'normal'}>
                {item.operands.length > 0 ? item.operands.join(', ') : '—'}
              </Box>
            );
          },
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
          cell: (item) => <code>{item.encoded}</code>,
        },
      ]}
      ariaLabels={{ tableLabel: ariaLabel }}
      empty={
        <Box textAlign="center" color="inherit" padding="m">
          No instructions.
        </Box>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function TranslationSection({
  translation,
  currentStep,
  expanded,
  onToggle,
}: TranslationSectionProps) {
  const [activeTabId, setActiveTabId] = useState<string>('common-ir');

  const headerActions = (
    <SpaceBetween direction="horizontal" size="xs">
      <Badge color="blue">Demo</Badge>
    </SpaceBetween>
  );

  return (
    <ExpandableSection
      variant="container"
      headerText="Translation"
      headerActions={headerActions}
      expanded={expanded}
      onChange={onToggle}
    >
      {translation === null ? (
        <Box textAlign="center" color="inherit" padding="xl">
          <SpaceBetween size="s" direction="vertical">
            <Box variant="strong" color="inherit">
              No program loaded
            </Box>
            <Box color="inherit">
              Load a program to see the translation pipeline.
            </Box>
          </SpaceBetween>
        </Box>
      ) : (
        <SpaceBetween size="l">
          {/* Pipeline tabs */}
          <Tabs
            activeTabId={activeTabId}
            onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
            tabs={[
              {
                id: 'common-ir',
                label: 'Common IR',
                content: <CommonIRTable items={translation.commonIR} />,
              },
              {
                id: 'register-vm',
                label: 'Register VM Program',
                content: (
                  <VMProgramTable
                    items={translation.registerProgram}
                    currentStep={currentStep}
                    ariaLabel="Register VM program instructions"
                  />
                ),
              },
              {
                id: 'stack-vm',
                label: 'Stack VM Program',
                content: (
                  <VMProgramTable
                    items={translation.stackProgram}
                    currentStep={currentStep}
                    ariaLabel="Stack VM program instructions"
                  />
                ),
              },
            ]}
          />

          {/* Size metrics */}
          <ColumnLayout columns={2} variant="text-grid">
            <Box>
              <Box variant="awsui-key-label">Register program</Box>
              <Box>{translation.registerSizeBytes} bytes</Box>
            </Box>
            <Box>
              <Box variant="awsui-key-label">Stack program</Box>
              <Box>{translation.stackSizeBytes} bytes</Box>
            </Box>
          </ColumnLayout>

          {/* Demo data disclaimer */}
          <Alert type="info">
            Translation shown is demonstration data. Real output will be
            produced by the C++ compiler and Common IR generator.
          </Alert>
        </SpaceBetween>
      )}
    </ExpandableSection>
  );
}
