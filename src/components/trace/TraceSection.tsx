import { useState, useEffect } from 'react';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import Tabs from '@cloudscape-design/components/tabs';
import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import Badge from '@cloudscape-design/components/badge';
import SpaceBetween from '@cloudscape-design/components/space-between';
import type { TraceEntry, RunMode } from '../../types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface TraceSectionProps {
  registerTrace: TraceEntry[];
  stackTrace: TraceEntry[];
  runMode: RunMode;
  currentStep: number;
  onSelectEntry?: (entry: TraceEntry) => void;
  expanded: boolean;
  onToggle: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toHex(n: number, width = 4): string {
  return '0x' + n.toString(16).toUpperCase().padStart(width, '0');
}

function formatInstruction(entry: TraceEntry): string {
  const { opcode, operands } = entry.instruction;
  return operands.length > 0 ? `${opcode} ${operands.join(', ')}` : opcode;
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <Box textAlign="center" color="inherit" padding="xl">
      <SpaceBetween size="s" direction="vertical">
        <Box variant="strong" color="inherit">
          Execution trace is empty.
        </Box>
        <Box color="inherit">
          Load and run a program to generate a trace.
        </Box>
      </SpaceBetween>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Trace table
// ---------------------------------------------------------------------------

interface TraceTableProps {
  trace: TraceEntry[];
  currentStep: number;
  onSelectEntry?: (entry: TraceEntry) => void;
  ariaLabel: string;
}

function TraceTable({
  trace,
  currentStep,
  onSelectEntry,
  ariaLabel,
}: TraceTableProps) {
  const [selectedItems, setSelectedItems] = useState<TraceEntry[]>([]);

  // Keep selection in sync with currentStep
  useEffect(() => {
    const match = trace.find((e) => e.step === currentStep);
    setSelectedItems(match ? [match] : []);
  }, [currentStep, trace]);

  function handleSelectionChange(detail: { selectedItems: TraceEntry[] }) {
    const items = detail.selectedItems;
    setSelectedItems(items);
    if (items.length > 0 && onSelectEntry) {
      onSelectEntry(items[0]);
    }
  }

  return (
    <Table<TraceEntry>
      items={trace}
      selectionType="single"
      selectedItems={selectedItems}
      onSelectionChange={({ detail }) => handleSelectionChange(detail)}
      columnDefinitions={[
        {
          id: 'step',
          header: 'Step',
          cell: (item) => (
            <Box fontWeight={item.step === currentStep ? 'bold' : 'normal'}>
              {item.step}
            </Box>
          ),
          width: 70,
        },
        {
          id: 'pc',
          header: 'PC',
          cell: (item) => (
            <Box fontWeight={item.step === currentStep ? 'bold' : 'normal'}>
              <code>{toHex(item.programCounter)}</code>
            </Box>
          ),
          width: 110,
        },
        {
          id: 'instruction',
          header: 'Instruction',
          cell: (item) => (
            <Box
              fontWeight={item.step === currentStep ? 'bold' : 'normal'}
              color={
                item.step === currentStep ? 'text-status-info' : 'inherit'
              }
            >
              <code>{formatInstruction(item)}</code>
            </Box>
          ),
        },
        {
          id: 'stateBefore',
          header: 'State Before',
          cell: (item) => (
            <Box fontSize="body-s" color="text-body-secondary">
              {item.stateBefore}
            </Box>
          ),
        },
        {
          id: 'stateAfter',
          header: 'State After',
          cell: (item) => (
            <Box fontSize="body-s" color="text-body-secondary">
              {item.stateAfter}
            </Box>
          ),
        },
        {
          id: 'memory',
          header: 'Memory',
          cell: (item) =>
            item.memoryChanges.length === 0 ? (
              '—'
            ) : (
              <Badge color="blue">{item.memoryChanges.length}</Badge>
            ),
          width: 90,
        },
      ]}
      trackBy="step"
      variant="embedded"
      ariaLabels={{
        tableLabel: ariaLabel,
        selectionGroupLabel: 'Select a step',
        itemSelectionLabel: ({ selectedItems: sel }, item) =>
          `Step ${item.step}${sel.includes(item) ? ', selected' : ''}`,
      }}
      empty={<EmptyState />}
    />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function TraceSection({
  registerTrace,
  stackTrace,
  runMode,
  currentStep,
  onSelectEntry,
  expanded,
  onToggle,
}: TraceSectionProps) {
  const [activeTabId, setActiveTabId] = useState<string>('register-vm');

  let content: React.ReactNode;

  if (runMode === 'both') {
    content = (
      <Tabs
        activeTabId={activeTabId}
        onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
        tabs={[
          {
            id: 'register-vm',
            label: 'Register VM',
            content: (
              <TraceTable
                trace={registerTrace}
                currentStep={currentStep}
                onSelectEntry={onSelectEntry}
                ariaLabel="Register VM execution trace"
              />
            ),
          },
          {
            id: 'stack-vm',
            label: 'Stack VM',
            content: (
              <TraceTable
                trace={stackTrace}
                currentStep={currentStep}
                onSelectEntry={onSelectEntry}
                ariaLabel="Stack VM execution trace"
              />
            ),
          },
        ]}
      />
    );
  } else {
    const trace = runMode === 'register' ? registerTrace : stackTrace;
    const ariaLabel =
      runMode === 'register'
        ? 'Register VM execution trace'
        : 'Stack VM execution trace';

    content = (
      <TraceTable
        trace={trace}
        currentStep={currentStep}
        onSelectEntry={onSelectEntry}
        ariaLabel={ariaLabel}
      />
    );
  }

  return (
    <ExpandableSection
      variant="container"
      headerText="Execution Trace"
      expanded={expanded}
      onChange={onToggle}
    >
      {content}
    </ExpandableSection>
  );
}
