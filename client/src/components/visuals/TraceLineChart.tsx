import CloudscapeLineChart from '@cloudscape-design/components/line-chart';
import Box from '@cloudscape-design/components/box';
import type { TraceEntry, RunMode } from '../../utils/types';

interface TraceLineChartProps {
  registerTrace: TraceEntry[];
  stackTrace: TraceEntry[];
  runMode: RunMode;
  currentStep: number;
}

const I18N = {
  filterLabel: 'Filter displayed series',
  filterPlaceholder: 'Filter series',
  filterSelectedAriaLabel: 'selected',
  detailPopoverDismissAriaLabel: 'Dismiss',
  legendAriaLabel: 'Legend',
  chartAriaRoleDescription: 'line chart',
  xTickFormatter: (v: number) => `Step ${v}`,
  yTickFormatter: (v: number) => String(v),
};

export default function TraceLineChart({
  registerTrace, stackTrace, runMode, currentStep,
}: TraceLineChartProps) {
  const hasData = registerTrace.length > 0 || stackTrace.length > 0;

  if (!hasData) {
    return (
      <Box textAlign="center" color="text-body-secondary" padding="l">
        <Box variant="strong" color="inherit">No trace data</Box>
        <Box color="inherit">Run a program to generate a trace.</Box>
      </Box>
    );
  }

  const allSteps = [
    ...(runMode !== 'stack' ? registerTrace.map(e => e.step) : []),
    ...(runMode !== 'register' ? stackTrace.map(e => e.step) : []),
  ];
  const xDomain: [number, number] = [Math.min(...allSteps), Math.max(...allSteps)];

  const series = [
    ...(runMode !== 'stack' && registerTrace.length > 0 ? [
      {
        title: 'Reg Instructions',
        type: 'line' as const,
        color: '#0972d3',
        data: registerTrace.map(e => ({ x: e.step, y: e.metricsSnapshot.instructionCount })),
      },
      {
        title: 'Reg Mem Ops',
        type: 'line' as const,
        color: '#5b9bd5',
        data: registerTrace.map(e => ({ x: e.step, y: e.metricsSnapshot.memoryReads + e.metricsSnapshot.memoryWrites })),
      },
    ] : []),
    ...(runMode !== 'register' && stackTrace.length > 0 ? [
      {
        title: 'Stk Instructions',
        type: 'line' as const,
        color: '#037f0c',
        data: stackTrace.map(e => ({ x: e.step, y: e.metricsSnapshot.instructionCount })),
      },
      {
        title: 'Stk Mem Ops',
        type: 'line' as const,
        color: '#5aab61',
        data: stackTrace.map(e => ({ x: e.step, y: e.metricsSnapshot.memoryReads + e.metricsSnapshot.memoryWrites })),
      },
    ] : []),
    ...(currentStep > 0 ? [{
      title: 'Current step',
      type: 'threshold' as const,
      x: currentStep,
      color: '#f89c0a',
    }] : []),
  ];

  return (
    <CloudscapeLineChart<number>
      series={series}
      xDomain={xDomain}
      height={180}
      hideFilter
      xTitle="Step"
      yTitle="Count"
      ariaLabel="Execution trace progression"
      i18nStrings={I18N}
      empty={
        <Box textAlign="center" color="text-body-secondary" padding="l">
          No trace data available.
        </Box>
      }
      noMatch={
        <Box textAlign="center" color="text-body-secondary" padding="l">
          No matching series.
        </Box>
      }
    />
  );
}
