/**
 * LaboratoryPage — The single interactive workspace for the ISA Laboratory.
 *
 * Everything lives here: editor, execution controls, machine state,
 * memory, trace, metrics, comparison, benchmarks, and results — all
 * organized as independently expandable sections.
 */

import { useState, useCallback } from 'react';
import ContentLayout from '@cloudscape-design/components/content-layout';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import Box from '@cloudscape-design/components/box';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import Badge from '@cloudscape-design/components/badge';
import CloudscapeStatusIndicator from '@cloudscape-design/components/status-indicator';

import { useSimulator } from '../services';
import {
  MOCK_EXAMPLES,
  MOCK_BENCHMARKS,
  MOCK_RESULTS,
  DEMO_COST_MODEL,
} from '../data';

import type { ExampleProgram, EditorState, RunMode, SectionExpansionState, Benchmark } from '../types';

// Section components
import ProgramSection from '../components/program/ProgramSection';
import CurrentInstructionPanel from '../components/machine/CurrentInstructionPanel';
import TranslationSection from '../components/translation/TranslationSection';
import MachineStateSection from '../components/machine/MachineStateSection';
import MemorySection from '../components/memory/MemorySection';
import TraceSection from '../components/trace/TraceSection';
import MetricsSection from '../components/metrics/MetricsSection';
import ComparisonSection from '../components/comparison/ComparisonSection';
import BenchmarksSection from '../components/benchmarks/BenchmarksSection';
import ResultsSection from '../components/results/ResultsSection';

// ─── Status display helpers ───────────────────────────────────────────────────

type CloudscapeStatusType =
  | 'error' | 'warning' | 'success' | 'info'
  | 'stopped' | 'pending' | 'in-progress' | 'loading';

const STATUS_TYPE_MAP: Record<string, CloudscapeStatusType> = {
  idle:    'stopped',
  running: 'in-progress',
  paused:  'pending',
  halted:  'success',
  error:   'error',
};

const STATUS_LABEL_MAP: Record<string, string> = {
  idle:    'Idle',
  running: 'Running',
  paused:  'Ready',
  halted:  'Halted',
  error:   'Error',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function LaboratoryPage() {
  // ── Editor state ────────────────────────────────────────────────────────────
  const [editorState, setEditorState] = useState<EditorState>({
    source: MOCK_EXAMPLES[0].cSource,
    programName: MOCK_EXAMPLES[0].name,
    isDirty: false,
    errors: [],
  });

  // ── Simulator hook ───────────────────────────────────────────────────────────
  const {
    labState,
    load,
    step,
    run,
    runBoth,
    reset,
    setRunMode,
    isLoaded,
  } = useSimulator();

  // ── Section expansion state ──────────────────────────────────────────────────
  const [sections, setSections] = useState<SectionExpansionState>({
    translation: false,
    execution:   true,
    machineState: true,
    memory:      false,
    trace:       false,
    metrics:     true,
    comparison:  false,
    benchmarks:  false,
    results:     false,
  });

  const toggleSection = useCallback(
    (key: keyof SectionExpansionState) =>
      setSections(prev => ({ ...prev, [key]: !prev[key] })),
    []
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleSourceChange = useCallback((source: string) => {
    setEditorState(prev => ({ ...prev, source, isDirty: true }));
  }, []);

  const handleRunModeChange = useCallback(
    (mode: RunMode) => {
      setRunMode(mode);
      setEditorState(prev => ({ ...prev, isDirty: true }));
    },
    [setRunMode]
  );

  const handleLoad = useCallback(() => {
    load(editorState.programName, labState.runMode);
    setEditorState(prev => ({ ...prev, isDirty: false }));
    // Auto-expand execution and machine state when a program is loaded
    setSections(prev => ({
      ...prev,
      execution:   true,
      machineState: true,
      metrics:     true,
    }));
  }, [load, editorState.programName, labState.runMode]);

  const handleRunBoth = useCallback(() => {
    runBoth();
    setSections(prev => ({
      ...prev,
      machineState: true,
      metrics:     true,
      comparison:  true,
    }));
  }, [runBoth]);

  const handleExampleSelect = useCallback((example: ExampleProgram) => {
    setEditorState({
      source:      example.cSource,
      programName: example.name,
      isDirty:     false,
      errors:      [],
    });
  }, []);

  const handleBenchmarkLoad = useCallback((benchmark: Benchmark) => {
    setEditorState({
      source:      benchmark.cSource ?? `// ${benchmark.name}\n// Load this benchmark to run it.`,
      programName: benchmark.name,
      isDirty:     false,
      errors:      [],
    });
    // Scroll up / expand program section visually
    setSections(prev => ({ ...prev, benchmarks: false }));
  }, []);

  // ── Derived display values ────────────────────────────────────────────────────

  const { executionStatus, runMode, currentStep, translation, memoryChanges,
          registerTrace, stackTrace, registerState, stackState,
          registerMetrics, stackMetrics } = labState;

  // The "active" machine state for the current instruction panel
  const activeMachineState = runMode === 'stack' ? stackState : registerState;

  const statusType  = STATUS_TYPE_MAP[executionStatus]  ?? 'stopped';
  const statusLabel = STATUS_LABEL_MAP[executionStatus] ?? executionStatus;

  const runModeLabel: Record<RunMode, string> = {
    register: 'Register VM',
    stack:    'Stack VM',
    both:     'Both VMs',
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Register vs Stack Virtual Computer — CSCI 411 Research Platform"
        >
          Interactive ISA Laboratory
        </Header>
      }
    >
      {/*
        All top-level sections are separated by Cloudscape SpaceBetween size="l"
        so every gap between major blocks is identical. Inner sections use
        size="m" or size="s" consistently downward.
      */}
      <SpaceBetween size="l">

        {/* ── Overview banner ─────────────────────────────────────────── */}
        <Container
          header={
            <Header
              variant="h2"
              description="How do register-based and stack-based ISAs differ in program representation and execution behavior when executing equivalent workloads?"
            >
              Research Question
            </Header>
          }
        >
          <KeyValuePairs
            columns={4}
            items={[
              { label: 'Study',   value: 'Register vs Stack Architecture' },
              { label: 'Metrics', value: 'Program Size · Instructions · Memory · Cost' },
              {
                label: 'Run Mode',
                value: (
                  <Badge color={runMode === 'both' ? 'blue' : 'grey'}>
                    {runModeLabel[runMode]}
                  </Badge>
                ),
              },
              {
                label: 'Status',
                value: (
                  <CloudscapeStatusIndicator type={statusType}>
                    {statusLabel}
                  </CloudscapeStatusIndicator>
                ),
              },
            ]}
          />
        </Container>

        {/* ── Main workspace: 2 / 1 grid ──────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: 'var(--space-scaled-l, 20px)',
            alignItems: 'start',
          }}
        >
          {/* ── Left column: editor ───────────────────────────────────── */}
          <Container header={<Header variant="h2">Program</Header>}>
            <ProgramSection
              editorState={editorState}
              onSourceChange={handleSourceChange}
              runMode={runMode}
              onRunModeChange={handleRunModeChange}
              executionStatus={executionStatus}
              isLoaded={isLoaded}
              onLoad={handleLoad}
              onRun={run}
              onRunBoth={handleRunBoth}
              onStep={step}
              onReset={reset}
              examples={MOCK_EXAMPLES}
              onExampleSelect={handleExampleSelect}
            />
          </Container>

          {/* ── Right column: instruction state + metrics ─────────────── */}
          <SpaceBetween size="l">

            <Container header={<Header variant="h3">Current Instruction</Header>}>
              <CurrentInstructionPanel
                machineState={activeMachineState}
                runMode={runMode}
              />
            </Container>

            <Container header={<Header variant="h3">Quick Metrics</Header>}>
              <SpaceBetween size="m">
                <KeyValuePairs
                  columns={2}
                  items={[
                    {
                      label: 'Reg. Size',
                      value: registerMetrics
                        ? `${registerMetrics.programSizeBytes} B`
                        : '—',
                    },
                    {
                      label: 'Stack Size',
                      value: stackMetrics
                        ? `${stackMetrics.programSizeBytes} B`
                        : '—',
                    },
                    {
                      label: 'Reg. Instructions',
                      value: registerMetrics
                        ? String(registerMetrics.dynamicInstructionCount)
                        : '—',
                    },
                    {
                      label: 'Stack Instructions',
                      value: stackMetrics
                        ? String(stackMetrics.dynamicInstructionCount)
                        : '—',
                    },
                    {
                      label: 'Mem Reads',
                      value: registerMetrics
                        ? String(registerMetrics.memoryReads)
                        : '—',
                    },
                    {
                      label: 'Mem Writes',
                      value: registerMetrics
                        ? String(registerMetrics.memoryWrites)
                        : '—',
                    },
                    {
                      label: 'Est. Cost (Reg)',
                      value: registerMetrics
                        ? String(registerMetrics.estimatedCost)
                        : '—',
                    },
                    {
                      label: 'Est. Cost (Stack)',
                      value: stackMetrics
                        ? String(stackMetrics.estimatedCost)
                        : '—',
                    },
                  ]}
                />
                <Box variant="small" color="text-body-secondary">
                  Demo data — load a program to see live values.
                </Box>
              </SpaceBetween>
            </Container>

          </SpaceBetween>
        </div>

        {/* ── Expandable sections ─────────────────────────────────────── */}
        <SpaceBetween size="s">

          <TranslationSection
            translation={translation}
            currentStep={currentStep}
            expanded={sections.translation}
            onToggle={() => toggleSection('translation')}
          />

          <MachineStateSection
            registerState={registerState}
            stackState={stackState}
            runMode={runMode}
            expanded={sections.machineState}
            onToggle={() => toggleSection('machineState')}
          />

          <MemorySection
            changes={memoryChanges}
            currentStep={currentStep}
            expanded={sections.memory}
            onToggle={() => toggleSection('memory')}
          />

          <TraceSection
            registerTrace={registerTrace}
            stackTrace={stackTrace}
            runMode={runMode}
            currentStep={currentStep}
            expanded={sections.trace}
            onToggle={() => toggleSection('trace')}
          />

          <MetricsSection
            registerMetrics={registerMetrics}
            stackMetrics={stackMetrics}
            runMode={runMode}
            costModel={DEMO_COST_MODEL}
            expanded={sections.metrics}
            onToggle={() => toggleSection('metrics')}
          />

          <ComparisonSection
            registerMetrics={registerMetrics}
            stackMetrics={stackMetrics}
            expanded={sections.comparison}
            onToggle={() => toggleSection('comparison')}
          />

          <BenchmarksSection
            benchmarks={MOCK_BENCHMARKS}
            onLoadBenchmark={handleBenchmarkLoad}
            expanded={sections.benchmarks}
            onToggle={() => toggleSection('benchmarks')}
          />

          <ResultsSection
            results={MOCK_RESULTS}
            expanded={sections.results}
            onToggle={() => toggleSection('results')}
          />

        </SpaceBetween>

      </SpaceBetween>
    </ContentLayout>
  );
}