/**
 * ProgramSection — The top-level Program panel of the ISA Laboratory workspace.
 *
 * Layout (top → bottom):
 *   1. Top bar   — name, language badge, C-subset info popover | example selector, clear, run mode
 *   2. CEditor   — full-width, 380 px height
 *   3. Control bar — Load · Step · Run · Run Both · Reset · status indicator
 *   4. Hint text — short description of "Run Both"
 */

import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import Badge from '@cloudscape-design/components/badge';
import Button from '@cloudscape-design/components/button';
import Popover from '@cloudscape-design/components/popover';
import SegmentedControl from '@cloudscape-design/components/segmented-control';
import CloudscapeStatusIndicator from '@cloudscape-design/components/status-indicator';

import type { EditorState, ExampleProgram } from '../../types';
import type { RunMode } from '../../types';
import type { ExecutionStatus } from '../../types';

import CEditor from './CEditor';
import ExampleSelector from './ExampleSelector';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProgramSectionProps {
  editorState: EditorState;
  onSourceChange: (source: string) => void;
  runMode: RunMode;
  onRunModeChange: (mode: RunMode) => void;
  executionStatus: ExecutionStatus;
  isLoaded: boolean;
  onLoad: () => void;
  onRun: () => void;
  onRunBoth: () => void;
  onStep: () => void;
  onReset: () => void;
  examples: ExampleProgram[];
  onExampleSelect: (example: ExampleProgram) => void;
}

// ─── Run mode segmented control options ──────────────────────────────────────

const RUN_MODE_OPTIONS = [
  { id: 'register', text: 'Register VM' },
  { id: 'stack',    text: 'Stack VM'    },
  { id: 'both',     text: 'Both'        },
] as const;

// ─── Status map (reused from StatusIndicator pattern) ────────────────────────

type CloudscapeStatusType =
  | 'error' | 'warning' | 'success' | 'info'
  | 'stopped' | 'pending' | 'in-progress' | 'loading';

const STATUS_TYPE_MAP: Record<ExecutionStatus, CloudscapeStatusType> = {
  idle:    'stopped',
  running: 'in-progress',
  paused:  'pending',
  halted:  'success',
  error:   'error',
};

const STATUS_LABEL_MAP: Record<ExecutionStatus, string> = {
  idle:    'Idle',
  running: 'Running…',
  paused:  'Paused',
  halted:  'Halted',
  error:   'Error',
};

// ─── Supported C Subset content ───────────────────────────────────────────────

function CSubsetContent() {
  return (
    <SpaceBetween size="xs" direction="vertical">
      <Box variant="p" color="text-body-secondary">
        Only the following C constructs are supported:
      </Box>
      <ul style={{ margin: '0', paddingLeft: '20px', lineHeight: '1.7' }}>
        <li><code>int x = 5;</code> — Integer variable declarations</li>
        <li><code>+, -, *, /</code> — Arithmetic operators</li>
        <li><code>x = expr;</code> — Assignment</li>
        <li><code>==, !=, &lt;, &gt;, &lt;=, &gt;=</code> — Comparison</li>
        <li><code>if / else</code> — Conditionals</li>
        <li><code>while</code> — Loop construct</li>
      </ul>
      <Box variant="small" color="text-status-warning">
        Not supported: functions, pointers, arrays, or standard library calls.
      </Box>
    </SpaceBetween>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProgramSection({
  editorState,
  onSourceChange,
  runMode,
  onRunModeChange,
  executionStatus,
  isLoaded,
  onLoad,
  onRun,
  onRunBoth,
  onStep,
  onReset,
  examples,
  onExampleSelect,
}: ProgramSectionProps) {
  const isHalted     = executionStatus === 'halted';
  const isRunning    = executionStatus === 'running';
  const actionDisabled = !isLoaded || isHalted || isRunning;

  function handleExampleSelect(example: ExampleProgram) {
    onSourceChange(example.cSource);
    onExampleSelect(example);
  }

  function handleClear() {
    onSourceChange('');
  }

  return (
    <SpaceBetween size="s" direction="vertical">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        {/* Left: program name + language badge + info popover */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <Box variant="h3" padding="n">
            {editorState.programName || 'Program'}
            {editorState.isDirty && (
              <span
                style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#f89c0a',
                  marginLeft: '6px',
                  verticalAlign: 'middle',
                  position: 'relative',
                  top: '-1px',
                }}
                title="Unsaved changes"
              />
            )}
          </Box>

          <Badge color="blue">C Subset</Badge>

          <Popover
            triggerType="custom"
            header="Supported C Subset"
            content={<CSubsetContent />}
            size="medium"
            position="bottom"
            dismissButton={true}
            dismissAriaLabel="Close supported C subset info"
          >
            <Button
              variant="inline-icon"
              iconName="status-info"
              ariaLabel="Show supported C subset"
            />
          </Popover>
        </div>

        {/* Right: example selector + clear + run mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <ExampleSelector
            examples={examples}
            onSelect={handleExampleSelect}
          />

          <Button
            variant="normal"
            onClick={handleClear}
            ariaLabel="Clear editor"
            iconName="remove"
          >
            Clear
          </Button>

          <SegmentedControl
            selectedId={runMode}
            options={RUN_MODE_OPTIONS}
            label="Run mode"
            onChange={({ detail }) => onRunModeChange(detail.selectedId as RunMode)}
          />
        </div>
      </div>

      {/* ── Editor ──────────────────────────────────────────────────────── */}
      <CEditor
        value={editorState.source}
        onChange={onSourceChange}
        errors={editorState.errors}
        height="480px"
      />

      {/* ── Control bar ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <Button
          variant="normal"
          onClick={onLoad}
          iconName="upload"
          ariaLabel="Load program into VM"
        >
          Load
        </Button>

        <Button
          variant="normal"
          onClick={onStep}
          disabled={actionDisabled}
          iconName="arrow-right"
          ariaLabel="Step one instruction"
        >
          Step
        </Button>

        <Button
          variant="primary"
          onClick={onRun}
          disabled={actionDisabled}
          iconName="play"
          ariaLabel="Run program"
        >
          Run
        </Button>

        <Button
          variant="primary"
          onClick={onRunBoth}
          disabled={actionDisabled}
          iconName="play"
          ariaLabel="Run on both Register VM and Stack VM"
        >
          Run Both
        </Button>

        <Button
          variant="normal"
          onClick={onReset}
          disabled={!isLoaded}
          iconName="refresh"
          ariaLabel="Reset execution"
        >
          Reset
        </Button>

        {/* Vertical separator */}
        <div
          aria-hidden="true"
          style={{
            width: '1px',
            height: '24px',
            background: '#d5dbdb',
            alignSelf: 'center',
            flexShrink: 0,
          }}
        />

        {/* Execution status */}
        <CloudscapeStatusIndicator type={STATUS_TYPE_MAP[executionStatus]}>
          {STATUS_LABEL_MAP[executionStatus]}
        </CloudscapeStatusIndicator>
      </div>

      {/* ── Run Both hint ────────────────────────────────────────────────── */}
      <Box variant="small" color="text-body-secondary">
        <strong>Run Both</strong> executes the same program on both Register VM and
        Stack VM simultaneously for side-by-side comparison.
      </Box>

    </SpaceBetween>
  );
}
