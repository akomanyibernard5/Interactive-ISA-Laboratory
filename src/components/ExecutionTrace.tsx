import { useState, useEffect } from 'react';
import Table from '@cloudscape-design/components/table';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import type { TraceEntry } from '../types';

interface ExecutionTraceProps {
  trace: TraceEntry[];
  currentStep: number;
  onSelectEntry?: (entry: TraceEntry) => void;
}

function toHex(n: number, width = 4): string {
  return '0x' + n.toString(16).toUpperCase().padStart(width, '0');
}

function formatInstruction(entry: TraceEntry): string {
  const { opcode, operands } = entry.instruction;
  return operands.length > 0 ? `${opcode} ${operands.join(', ')}` : opcode;
}

export default function ExecutionTrace({
  trace,
  currentStep,
  onSelectEntry,
}: ExecutionTraceProps) {
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
              color={item.step === currentStep ? 'text-status-info' : 'inherit'}
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
          id: 'memoryChanges',
          header: 'Memory Changes',
          cell: (item) =>
            item.memoryChanges.length === 0
              ? '—'
              : `${item.memoryChanges.length} ${item.memoryChanges.length === 1 ? 'change' : 'changes'}`,
          width: 140,
        },
      ]}
      trackBy="step"
      variant="embedded"
      ariaLabels={{
        tableLabel: 'Execution trace — recorded machine steps',
        selectionGroupLabel: 'Select a step',
        itemSelectionLabel: ({ selectedItems: sel }, item) =>
          `Step ${item.step}${sel.includes(item) ? ', selected' : ''}`,
      }}
      header={
        <Box
          variant="small"
          color="text-body-secondary"
          padding={{ bottom: 'xs' }}
        >
          Recorded replay of actual machine execution — each row is an observed
          step, not an inferred result.
        </Box>
      }
      empty={
        <Box textAlign="center" color="inherit" padding="xxl">
          <SpaceBetween size="s" direction="vertical">
            <Box variant="strong" color="inherit">
              Execution trace is empty.
            </Box>
            <Box color="inherit">
              Step through or run a loaded program to record machine execution steps here.
            </Box>
          </SpaceBetween>
        </Box>
      }
    />
  );
}
