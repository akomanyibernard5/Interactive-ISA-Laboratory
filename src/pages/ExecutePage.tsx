import { useState, useRef, useCallback } from 'react';
import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import ContentLayout from '@cloudscape-design/components/content-layout';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Tabs from '@cloudscape-design/components/tabs';

import ArchitectureSelector from '../components/ArchitectureSelector';
import CurrentInstruction from '../components/CurrentInstruction';
import ExecutionControls from '../components/ExecutionControls';
import ExecutionTrace from '../components/ExecutionTrace';
import MemoryViewer from '../components/MemoryViewer';
import MetricsPanel from '../components/MetricsPanel';
import OperandStackPanel from '../components/OperandStackPanel';
import ProgramSelector from '../components/ProgramSelector';
import ProgramViewer from '../components/ProgramViewer';
import RegisterStatePanel from '../components/RegisterStatePanel';

import { createSimulator } from '../services';
import { MOCK_PROGRAMS } from '../data';

import type {
  ArchitectureId,
  ExecutionMetrics,
  ExecutionStatus,
  ISimulator,
  MachineState,
  MemoryChange,
  Program,
  TraceEntry,
} from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Collect all MemoryChange entries embedded in trace entries up to currentStep. */
function collectMemoryChanges(trace: TraceEntry[]): MemoryChange[] {
  return trace.flatMap((entry) => entry.memoryChanges);
}

/** Derive a stable ExecutionStatus from MachineState, defaulting to 'idle'. */
function getStatus(machineState: MachineState | null): ExecutionStatus {
  return machineState?.status ?? 'idle';
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ExecutePage() {
  // ── Architecture ──────────────────────────────────────────────────────────
  const [architectureId, setArchitectureId] = useState<ArchitectureId>('register');

  // ── Program selection ─────────────────────────────────────────────────────
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  // ── Execution state ───────────────────────────────────────────────────────
  const [machineState, setMachineState] = useState<MachineState | null>(null);
  const [metrics, setMetrics] = useState<ExecutionMetrics | null>(null);
  const [trace, setTrace] = useState<TraceEntry[]>([]);
  const [memoryChanges, setMemoryChanges] = useState<MemoryChange[]>([]);

  // ── Simulator (persisted across renders, reset on architecture change) ────
  const simulatorRef = useRef<ISimulator>(createSimulator());

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  /** Programs matching the current architecture (or 'both'). */
  const filteredPrograms: Program[] = MOCK_PROGRAMS.filter(
    (p) => p.architectureId === architectureId || p.architectureId === 'both'
  );

  /** The currently selected Program object, or null. */
  const selectedProgram: Program | null =
    filteredPrograms.find((p) => p.id === selectedProgramId) ?? null;

  const status = getStatus(machineState);
  const currentStep = machineState?.step ?? 0;

  // ---------------------------------------------------------------------------
  // State update helper — called after any simulator operation
  // ---------------------------------------------------------------------------
  const syncStateFromSimulator = useCallback(() => {
    const sim = simulatorRef.current;
    const nextState = sim.getState();
    const nextMetrics = sim.getMetrics();
    const nextTrace = sim.getTrace();
    const nextMemory = collectMemoryChanges(nextTrace);

    setMachineState(nextState);
    setMetrics(nextMetrics);
    setTrace(nextTrace);
    setMemoryChanges(nextMemory);
  }, []);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleLoad = useCallback(() => {
    if (!selectedProgram) return;
    const sim = simulatorRef.current;
    sim.load(selectedProgram);
    syncStateFromSimulator();
  }, [selectedProgram, syncStateFromSimulator]);

  const handleStep = useCallback(() => {
    const sim = simulatorRef.current;
    if (!sim.isLoaded()) return;
    sim.step();
    syncStateFromSimulator();
  }, [syncStateFromSimulator]);

  const handleRun = useCallback(() => {
    const sim = simulatorRef.current;
    if (!sim.isLoaded()) return;
    sim.run();
    syncStateFromSimulator();
  }, [syncStateFromSimulator]);

  const handleReset = useCallback(() => {
    const sim = simulatorRef.current;
    if (!sim.isLoaded()) return;
    sim.reset();
    syncStateFromSimulator();
  }, [syncStateFromSimulator]);

  const handleArchitectureChange = useCallback((id: ArchitectureId) => {
    // Swap to a fresh simulator, clear all state, reset program selection
    simulatorRef.current = createSimulator();
    setArchitectureId(id);
    setSelectedProgramId(null);
    setMachineState(null);
    setMetrics(null);
    setTrace([]);
    setMemoryChanges([]);
  }, []);

  const handleProgramSelect = useCallback((programId: string) => {
    // When user picks a different program, clear execution state so the
    // user must explicitly press Load before running.
    simulatorRef.current = createSimulator();
    setSelectedProgramId(programId);
    setMachineState(null);
    setMetrics(null);
    setTrace([]);
    setMemoryChanges([]);
  }, []);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  /** Register or Stack state panel, based on current architecture. */
  function renderStatePanel() {
    if (!machineState) {
      return architectureId === 'stack' ? (
        <OperandStackPanel state={null} />
      ) : (
        <RegisterStatePanel state={null} />
      );
    }

    if (machineState.kind === 'register') {
      return <RegisterStatePanel state={machineState.state} />;
    }
    return <OperandStackPanel state={machineState.state} />;
  }

  /** Container title for the state panel. */
  const statePanelTitle =
    architectureId === 'stack' ? 'Operand Stack' : 'Register State';

  // ---------------------------------------------------------------------------
  // Empty state (no program loaded yet)
  // ---------------------------------------------------------------------------

  function renderMainEmptyState() {
    return (
      <Container>
        <Box
          textAlign="center"
          color="inherit"
          padding="xxl"
        >
          <SpaceBetween size="m" direction="vertical">
            <Box variant="h3" color="inherit">
              No program loaded
            </Box>
            <Box color="inherit">
              Select an architecture and a program above, then press{' '}
              <strong>Load</strong> to begin stepping through execution.
            </Box>
          </SpaceBetween>
        </Box>
      </Container>
    );
  }

  // ---------------------------------------------------------------------------
  // Bottom tabs: Program / Memory / Trace
  // ---------------------------------------------------------------------------

  const bottomTabs = (
    <Tabs
      tabs={[
        {
          id: 'program',
          label: 'Program',
          content: (
            <ProgramViewer
              program={selectedProgram}
              currentStep={currentStep > 0 ? currentStep - 1 : 0}
            />
          ),
        },
        {
          id: 'memory',
          label: 'Memory',
          content: (
            <MemoryViewer
              changes={memoryChanges}
              currentStep={currentStep}
            />
          ),
        },
        {
          id: 'trace',
          label: 'Trace',
          content: (
            <ExecutionTrace
              trace={trace}
              currentStep={currentStep}
            />
          ),
        },
      ]}
    />
  );

  // ---------------------------------------------------------------------------
  // JSX
  // ---------------------------------------------------------------------------

  const isLoaded = machineState !== null;

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Step through program execution on the Register Machine or Stack Machine. Each step shows the live machine state, memory activity, and accumulated metrics."
        >
          Execute
        </Header>
      }
    >
      <SpaceBetween size="l">
        {/* ── Demonstration data notice ── */}
        <Alert type="info" header="Demonstration Data — Not Measured Experimental Results">
          This page replays pre-computed mock data. Real execution will be driven by
          the C++ simulation engine via WebAssembly. Values shown do not reflect
          actual hardware measurements.
        </Alert>

        {/* ── Two-column layout ── */}
        <ColumnLayout columns={2} variant="default">
          {/* Left column: selectors, controls, current instruction */}
          <SpaceBetween size="l">
            <Container header={<Header variant="h2">Configuration</Header>}>
              <SpaceBetween size="m">
                <FormField
                  label="Architecture"
                  description="Choose whether to execute on the Register Machine or the Stack Machine."
                >
                  <ArchitectureSelector
                    value={architectureId}
                    onChange={handleArchitectureChange}
                    disabled={isLoaded && status !== 'halted' && status !== 'idle'}
                  />
                </FormField>

                <FormField
                  label="Program"
                  description="Select a demonstration program compatible with the chosen architecture."
                >
                  <ProgramSelector
                    programs={filteredPrograms}
                    selectedId={selectedProgramId}
                    onSelect={handleProgramSelect}
                    disabled={isLoaded && status !== 'halted' && status !== 'idle'}
                  />
                </FormField>

                <FormField label="Controls">
                  <ExecutionControls
                    status={status}
                    isLoaded={isLoaded}
                    onLoad={handleLoad}
                    onRun={handleRun}
                    onStep={handleStep}
                    onReset={handleReset}
                  />
                </FormField>
              </SpaceBetween>
            </Container>

            <CurrentInstruction
              instruction={machineState?.currentInstruction ?? null}
              step={currentStep}
              programCounter={
                machineState?.kind === 'register'
                  ? machineState.state.programCounter
                  : machineState?.kind === 'stack'
                  ? machineState.state.programCounter
                  : 0
              }
              status={status}
            />
          </SpaceBetween>

          {/* Right column: machine state panel + metrics */}
          <SpaceBetween size="l">
            <Container
              header={<Header variant="h2">{statePanelTitle}</Header>}
            >
              {renderStatePanel()}
            </Container>

            <Container header={<Header variant="h2">Metrics</Header>}>
              <MetricsPanel
                metrics={metrics}
                architectureId={architectureId}
              />
            </Container>
          </SpaceBetween>
        </ColumnLayout>

        {/* ── Full-width bottom section ── */}
        {isLoaded ? (
          <Container
            header={
              <Header
                variant="h2"
                description="Program listing, memory activity, and execution trace for the current session."
              >
                Execution Details
              </Header>
            }
          >
            {bottomTabs}
          </Container>
        ) : (
          renderMainEmptyState()
        )}

        {/* ── Footer disclaimer ── */}
        <Box variant="small" color="text-body-secondary">
          All execution data is pre-computed demonstration data. Estimated costs use an
          abstract analytical model and do not represent real processor cycles or hardware
          performance.
        </Box>
      </SpaceBetween>
    </ContentLayout>
  );
}
