import { useState, useEffect, useRef } from 'react';
import Tabs from '@cloudscape-design/components/tabs';
import Box from '@cloudscape-design/components/box';
import Badge from '@cloudscape-design/components/badge';
import SpaceBetween from '@cloudscape-design/components/space-between';
import type { TraceEntry, RunMode } from '../../utils/types';

interface TraceSectionProps {
  registerTrace: TraceEntry[];
  stackTrace: TraceEntry[];
  runMode: RunMode;
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

const OPCODE_COLORS: Record<string, string> = {
  LOAD_CONSTANT: '#0972d3', LOAD_VARIABLE: '#0972d3',
  STORE_VARIABLE: '#7d2105',
  ADD: '#037f0c', SUB: '#037f0c', MUL: '#037f0c', DIV: '#037f0c',
  COMPARE: '#8b4513',
  JUMP: '#6b21a8', JUMP_IF_ZERO: '#6b21a8', LABEL: '#6b21a8',
  HALT: '#d91515',
};

function EmptyState() {
  return (
    <Box textAlign="center" color="inherit" padding="xl">
      <SpaceBetween size="s" direction="vertical">
        <Box variant="strong" color="inherit">Execution trace is empty.</Box>
        <Box color="inherit">Load and run a program to generate a trace.</Box>
      </SpaceBetween>
    </Box>
  );
}

interface TraceListProps {
  trace: TraceEntry[];
  currentStep: number;
  onSelectEntry?: (entry: TraceEntry) => void;
}

function TraceList({ trace, currentStep, onSelectEntry }: TraceListProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const currentRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(currentStep);
  }, [currentStep]);

  useEffect(() => {
    currentRowRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [currentStep]);

  if (trace.length === 0) return <EmptyState />;

  return (
    <div style={{
      fontFamily: "'JetBrains Mono','Fira Code',Consolas,monospace",
      fontSize: '12px',
      border: '1px solid #e9ebed',
      borderRadius: '8px',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '48px 80px 1fr 1fr 1fr 60px',
        gap: '0',
        background: '#f4f4f4',
        borderBottom: '1px solid #e9ebed',
        padding: '6px 10px',
      }}>
        {['Step', 'PC', 'Instruction', 'Before', 'After', 'Mem'].map(h => (
          <span key={h} style={{
            fontSize: '11px', fontWeight: 700, color: '#414d5c',
            letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            {h}
          </span>
        ))}
      </div>

      <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
        {trace.map((entry) => {
          const isCurrent = entry.step === currentStep;
          const isSelected = entry.step === selected;
          const opcodeColor = OPCODE_COLORS[entry.instruction.opcode] ?? '#414d5c';

          return (
            <div
              key={entry.step}
              ref={isCurrent ? currentRowRef : undefined}
              onClick={() => {
                setSelected(entry.step);
                onSelectEntry?.(entry);
              }}
              style={{
                display: 'grid',
                gridTemplateColumns: '48px 80px 1fr 1fr 1fr 60px',
                gap: '0',
                padding: '5px 10px',
                borderLeft: isCurrent
                  ? '3px solid #0972d3'
                  : isSelected
                    ? '3px solid #c4c9d0'
                    : '3px solid transparent',
                background: isCurrent
                  ? '#f0f7ff'
                  : isSelected
                    ? '#fafafa'
                    : 'transparent',
                cursor: 'pointer',
                borderBottom: '1px solid #f4f4f4',
                transition: 'background 0.15s',
                alignItems: 'center',
              }}
            >
              <span style={{
                fontWeight: isCurrent ? 700 : 400,
                color: isCurrent ? '#0972d3' : '#414d5c',
              }}>
                {entry.step}
              </span>
              <span style={{ color: '#6c7787' }}>
                {toHex(entry.programCounter)}
              </span>
              <span style={{
                fontWeight: isCurrent ? 700 : 500,
                color: opcodeColor,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {formatInstruction(entry)}
              </span>
              <span style={{
                color: '#8c9ba5', fontSize: '11px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {entry.stateBefore}
              </span>
              <span style={{
                color: isCurrent ? '#037f0c' : '#8c9ba5', fontSize: '11px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontWeight: isCurrent ? 600 : 400,
              }}>
                {entry.stateAfter}
              </span>
              <span>
                {entry.memoryChanges.length > 0
                  ? <Badge color="blue">{entry.memoryChanges.length}</Badge>
                  : <span style={{ color: '#c4c9d0' }}>—</span>
                }
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TraceSection({
  registerTrace, stackTrace, runMode, currentStep, onSelectEntry,
}: TraceSectionProps) {
  const [activeTabId, setActiveTabId] = useState<string>('register-vm');

  if (runMode === 'both') {
    return (
      <Tabs
        activeTabId={activeTabId}
        onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
        tabs={[
          {
            id: 'register-vm',
            label: `Register VM (${registerTrace.length})`,
            content: (
              <TraceList
                trace={registerTrace}
                currentStep={currentStep}
                onSelectEntry={onSelectEntry}
              />
            ),
          },
          {
            id: 'stack-vm',
            label: `Stack VM (${stackTrace.length})`,
            content: (
              <TraceList
                trace={stackTrace}
                currentStep={currentStep}
                onSelectEntry={onSelectEntry}
              />
            ),
          },
        ]}
      />
    );
  }

  const trace = runMode === 'register' ? registerTrace : stackTrace;
  return (
    <TraceList
      trace={trace}
      currentStep={currentStep}
      onSelectEntry={onSelectEntry}
    />
  );
}
