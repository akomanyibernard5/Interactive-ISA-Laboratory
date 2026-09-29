import { useState, useCallback } from 'react';
import type React from 'react';
import {
  GitBranch,
  MemoryStick,
  ListOrdered,
  BarChart2,
  GitCompare,
  FlaskConical,
  TableProperties,
} from 'lucide-react';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import Container from '@cloudscape-design/components/container';
import ContentLayout from '@cloudscape-design/components/content-layout';
import Header from '@cloudscape-design/components/header';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import SpaceBetween from '@cloudscape-design/components/space-between';

import AppShell from '../layouts/AppShell';
import { useSimulator } from '../services';
import { MOCK_EXAMPLES, MOCK_BENCHMARKS, MOCK_RESULTS, DEMO_COST_MODEL } from '../data';
import type { ExampleProgram, EditorState, RunMode, Benchmark } from '../utils/types';

import ProgramSection       from '../components/program/ProgramSection';
import CurrentInstructionPanel from '../components/machine/CurrentInstructionPanel';
import MachineStateSection  from '../components/machine/MachineStateSection';
import TranslationSection   from '../components/translation/TranslationSection';
import MemorySection        from '../components/memory/MemorySection';
import TraceSection         from '../components/trace/TraceSection';
import MetricsSection       from '../components/metrics/MetricsSection';
import ComparisonSection    from '../components/comparison/ComparisonSection';
import BenchmarksSection    from '../components/benchmarks/BenchmarksSection';
import ResultsSection       from '../components/results/ResultsSection';
import MetricsBarChart      from '../components/visuals/MetricsBarChart';

type PanelId = 'translation' | 'memory' | 'trace' | 'metrics' | 'comparison' | 'benchmarks' | 'results';

type LucideIcon = React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;

interface NavItem {
  id: PanelId;
  label: string;
  Icon: LucideIcon;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'translation', label: 'Translation', Icon: GitBranch,      description: 'C to IR to VM bytecode pipeline' },
  { id: 'memory',      label: 'Memory',      Icon: MemoryStick,    description: 'Memory reads and writes per step' },
  { id: 'trace',       label: 'Trace',       Icon: ListOrdered,    description: 'Step-by-step execution trace' },
  { id: 'metrics',     label: 'Metrics',     Icon: BarChart2,      description: 'Execution metrics and charts' },
  { id: 'comparison',  label: 'Comparison',  Icon: GitCompare,     description: 'Register vs Stack side-by-side' },
  { id: 'benchmarks',  label: 'Benchmarks',  Icon: FlaskConical,   description: 'Benchmark suite' },
  { id: 'results',     label: 'Results',     Icon: TableProperties,description: 'Experiment results table' },
];

const PANEL_TITLES: Record<PanelId, string> = {
  translation: 'Translation Pipeline',
  memory:      'Memory Activity',
  trace:       'Execution Trace',
  metrics:     'Execution Metrics',
  comparison:  'Architecture Comparison',
  benchmarks:  'Benchmark Suite',
  results:     'Experiment Results',
};

function NavRail({
  activePanel,
  onSelect,
  badges,
}: {
  activePanel: PanelId | null;
  onSelect: (id: PanelId) => void;
  badges: Partial<Record<PanelId, string>>;
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '12px 0',
      background: 'var(--color-background-layout-panel-content, #ffffff)',
    }}>
      <div style={{
        padding: '0 16px 12px',
        borderBottom: '1px solid var(--color-border-divider-default, #e9ebed)',
        marginBottom: '8px',
      }}>
        <Box variant="h3" color="text-body-secondary">Analysis</Box>
      </div>

      {NAV_ITEMS.map((item) => {
        const isActive = activePanel === item.id;
        const badge = badges[item.id];
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            title={item.description}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '10px 16px',
              border: 'none',
              borderLeft: isActive
                ? '3px solid var(--color-border-interactive-default, #0972d3)'
                : '3px solid transparent',
              background: isActive
                ? 'var(--color-background-item-selected, #f0f7ff)'
                : 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s, border-color 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-background-dropdown-item-hover, #f4f4f4)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
          >
            <item.Icon
              size={16}
              strokeWidth={isActive ? 2.2 : 1.8}
              color={isActive ? '#0972d3' : '#5f6b7a'}
            />
            <span style={{
              fontSize: '14px',
              fontWeight: isActive ? 600 : 400,
              color: isActive
                ? 'var(--color-text-interactive-default, #0972d3)'
                : 'var(--color-text-body-default, #0d1117)',
              lineHeight: 1.3,
              flex: 1,
            }}>
              {item.label}
            </span>
            {badge && (
              <span style={{
                fontSize: '10px', fontWeight: 700,
                color: isActive ? '#0972d3' : '#6c7787',
                background: isActive ? '#ddeffe' : '#e9ebed',
                borderRadius: '10px',
                padding: '1px 6px',
                flexShrink: 0,
              }}>
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function LaboratoryPage() {
  const [editorState, setEditorState] = useState<EditorState>({
    source: MOCK_EXAMPLES[0].cSource,
    programName: MOCK_EXAMPLES[0].name,
    isDirty: false,
    errors: [],
  });

  const { labState, load, step, run, runBoth, reset, setRunMode, isLoaded } = useSimulator();

  const [navOpen,     setNavOpen]     = useState(true);
  const [activePanel, setActivePanel] = useState<PanelId | null>(null);
  const [programOpen,     setProgramOpen]     = useState(true);
  const [machineOpen,     setMachineOpen]     = useState(true);
  const [liveOpen,        setLiveOpen]        = useState(true);

  const handleSourceChange = useCallback((source: string) => {
    setEditorState(prev => ({ ...prev, source, isDirty: true }));
  }, []);

  const handleRunModeChange = useCallback((mode: RunMode) => {
    setRunMode(mode);
    setEditorState(prev => ({ ...prev, isDirty: true }));
  }, [setRunMode]);

  const handleLoad = useCallback(() => {
    load(editorState.programName, labState.runMode);
    setEditorState(prev => ({ ...prev, isDirty: false }));
  }, [load, editorState.programName, labState.runMode]);

  const handleRunBoth = useCallback(() => { runBoth(); }, [runBoth]);
  const handlePause   = useCallback(() => {}, []);

  const handleExampleSelect = useCallback((example: ExampleProgram) => {
    setEditorState({ source: example.cSource, programName: example.name, isDirty: false, errors: [] });
  }, []);

  const handleBenchmarkLoad = useCallback((benchmark: Benchmark) => {
    setEditorState({
      source:      benchmark.cSource ?? `// ${benchmark.name}\n// Load this benchmark to run it.`,
      programName: benchmark.name,
      isDirty:     false,
      errors:      [],
    });
    setActivePanel(null);
  }, []);

  function handleNavSelect(id: PanelId) {
    setActivePanel(prev => prev === id ? null : id);
  }

  const {
    executionStatus, runMode, currentStep, translation, memoryChanges,
    registerTrace, stackTrace, registerState, stackState,
    registerMetrics, stackMetrics,
  } = labState;

  const activeMachineState = runMode === 'stack' ? stackState : registerState;

  function renderActivePanel() {
    if (!activePanel) return null;
    switch (activePanel) {
      case 'translation':
        return <TranslationSection translation={translation} currentStep={currentStep} cSource={editorState.source} />;
      case 'memory':
        return <MemorySection changes={memoryChanges} currentStep={currentStep} />;
      case 'trace':
        return <TraceSection registerTrace={registerTrace} stackTrace={stackTrace} runMode={runMode} currentStep={currentStep} />;
      case 'metrics':
        return <MetricsSection registerMetrics={registerMetrics} stackMetrics={stackMetrics} runMode={runMode} costModel={DEMO_COST_MODEL} registerTrace={registerTrace} stackTrace={stackTrace} currentStep={currentStep} />;
      case 'comparison':
        return <ComparisonSection registerMetrics={registerMetrics} stackMetrics={stackMetrics} />;
      case 'benchmarks':
        return <BenchmarksSection benchmarks={MOCK_BENCHMARKS} onLoadBenchmark={handleBenchmarkLoad} />;
      case 'results':
        return <ResultsSection results={MOCK_RESULTS} />;
    }
  }

  const navBadges: Partial<Record<PanelId, string>> = {
    trace:      registerTrace.length > 0 || stackTrace.length > 0
                  ? String(Math.max(registerTrace.length, stackTrace.length))
                  : undefined,
    memory:     memoryChanges.length > 0 ? String(memoryChanges.length) : undefined,
    translation: translation !== null ? 'ready' : undefined,
    metrics:    (registerMetrics || stackMetrics) ? 'ready' : undefined,
    comparison: (registerMetrics && stackMetrics) ? 'ready' : undefined,
  };

  const navRail = (
    <NavRail activePanel={activePanel} onSelect={handleNavSelect} badges={navBadges} />
  );

  const statusBarColor: Record<typeof executionStatus, string> = {
    idle: '#8c9ba5', running: '#037f0c', paused: '#f89c0a',
    halted: '#0972d3', error: '#d91515',
  };

  return (
    <AppShell
      navigation={navRail}
      navigationOpen={navOpen}
      navigationWidth={200}
      onNavigationChange={setNavOpen}
    >
      <ContentLayout disableOverlap>
        <SpaceBetween size="m">

          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            padding: '8px 14px',
            background: '#fff',
            border: '1px solid #e9ebed',
            borderRadius: '8px',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: statusBarColor[executionStatus],
                flexShrink: 0,
                boxShadow: executionStatus === 'running' ? `0 0 0 3px ${statusBarColor.running}33` : 'none',
              }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#414d5c' }}>
                {executionStatus.charAt(0).toUpperCase() + executionStatus.slice(1)}
              </span>
            </div>
            <div style={{ width: '1px', height: '16px', background: '#e9ebed' }} />
            <span style={{ fontSize: '12px', color: '#6c7787' }}>
              Mode: <strong style={{ color: '#414d5c' }}>
                {runMode === 'both' ? 'Register + Stack' : runMode === 'register' ? 'Register VM' : 'Stack VM'}
              </strong>
            </span>
            <div style={{ width: '1px', height: '16px', background: '#e9ebed' }} />
            <span style={{ fontSize: '12px', color: '#6c7787' }}>
              Step: <strong style={{ color: '#414d5c', fontFamily: 'monospace' }}>{currentStep}</strong>
            </span>
            {(registerMetrics || stackMetrics) && (
              <>
                <div style={{ width: '1px', height: '16px', background: '#e9ebed' }} />
                <span style={{ fontSize: '12px', color: '#6c7787' }}>
                  Reg instr: <strong style={{ color: '#0972d3', fontFamily: 'monospace' }}>
                    {registerMetrics?.dynamicInstructionCount ?? '—'}
                  </strong>
                </span>
                <span style={{ fontSize: '12px', color: '#6c7787' }}>
                  Stk instr: <strong style={{ color: '#037f0c', fontFamily: 'monospace' }}>
                    {stackMetrics?.dynamicInstructionCount ?? '—'}
                  </strong>
                </span>
              </>
            )}
            <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#8c9ba5' }}>
              {editorState.programName}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '12px',
            alignItems: 'start',
          }}>

            <ExpandableSection
              variant="container"
              headerText="Program"
              expanded={programOpen}
              onChange={({ detail }) => setProgramOpen(detail.expanded)}
            >
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
                onPause={handlePause}
                onReset={reset}
                examples={MOCK_EXAMPLES}
                onExampleSelect={handleExampleSelect}
              />
            </ExpandableSection>

            <ExpandableSection
              variant="container"
              headerText="Machine State"
              expanded={machineOpen}
              onChange={({ detail }) => setMachineOpen(detail.expanded)}
            >
              <MachineStateSection
                registerState={registerState}
                stackState={stackState}
                runMode={runMode}
              />
            </ExpandableSection>

            <ExpandableSection
              variant="container"
              headerText="Current Instruction"
              expanded={liveOpen}
              onChange={({ detail }) => setLiveOpen(detail.expanded)}
            >
              <CurrentInstructionPanel machineState={activeMachineState} runMode={runMode} />
            </ExpandableSection>

            <Container header={<Header variant="h3">Quick Metrics</Header>}>
              <MetricsBarChart registerMetrics={registerMetrics} stackMetrics={stackMetrics} />
            </Container>

          </div>

          {activePanel && (
            <Container
              header={
                <Header
                  variant="h2"
                  actions={
                    <Button
                      variant="icon"
                      iconName="close"
                      onClick={() => setActivePanel(null)}
                      ariaLabel="Close panel"
                    />
                  }
                >
                  {PANEL_TITLES[activePanel]}
                </Header>
              }
            >
              {renderActivePanel()}
            </Container>
          )}

        </SpaceBetween>
      </ContentLayout>
    </AppShell>
  );
}
