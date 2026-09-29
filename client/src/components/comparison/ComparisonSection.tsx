import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import CloudscapeBarChart from '@cloudscape-design/components/bar-chart';
import SpaceBetween from '@cloudscape-design/components/space-between';
import type { ExecutionMetrics } from '../../utils/types';

interface ComparisonSectionProps {
  registerMetrics: ExecutionMetrics | null;
  stackMetrics: ExecutionMetrics | null;
}

const I18N = {
  filterLabel: 'Filter displayed series',
  filterPlaceholder: 'Filter series',
  filterSelectedAriaLabel: 'selected',
  detailPopoverDismissAriaLabel: 'Dismiss',
  legendAriaLabel: 'Legend',
  chartAriaRoleDescription: 'bar chart',
  xTickFormatter: (v: string) => v,
  yTickFormatter: (v: number) => String(v),
};

const METRICS: Array<{ key: keyof ExecutionMetrics | 'memOps'; label: string }> = [
  { key: 'programSizeBytes',        label: 'Size (B)'      },
  { key: 'dynamicInstructionCount', label: 'Instructions'  },
  { key: 'memOps',                  label: 'Mem Ops'       },
  { key: 'memoryReads',             label: 'Mem Reads'     },
  { key: 'memoryWrites',            label: 'Mem Writes'    },
  { key: 'branchCount',             label: 'Branches'      },
  { key: 'stackPushCount',          label: 'Stack Pushes'  },
  { key: 'stackPopCount',           label: 'Stack Pops'    },
  { key: 'estimatedCost',           label: 'Est. Cost'     },
];

function getValue(m: ExecutionMetrics, key: string): number {
  if (key === 'memOps') return m.memoryReads + m.memoryWrites;
  return (m as unknown as Record<string, number>)[key] ?? 0;
}

function EmptyState() {
  return (
    <Box textAlign="center" color="text-body-secondary" padding="xl">
      <SpaceBetween size="xs" direction="vertical">
        <Box variant="strong" color="inherit">No comparison data</Box>
        <Box color="inherit">Run Both to see a side-by-side comparison.</Box>
      </SpaceBetween>
    </Box>
  );
}

function PartialDataNote({
  registerMetrics, stackMetrics,
}: Pick<ComparisonSectionProps, 'registerMetrics' | 'stackMetrics'>) {
  if (registerMetrics !== null && stackMetrics !== null) return null;
  const missing = registerMetrics === null ? 'Register VM' : 'Stack VM';
  const present  = registerMetrics !== null ? 'Register VM' : 'Stack VM';
  return (
    <Alert type="warning">
      Only {present} metrics are available. {missing} data is shown as 0.
      Run both architectures to enable full comparison.
    </Alert>
  );
}

export default function ComparisonSection({ registerMetrics, stackMetrics }: ComparisonSectionProps) {
  const bothNull = registerMetrics === null && stackMetrics === null;

  const xDomain = METRICS.map(m => m.label);

  const series = [
    ...(registerMetrics ? [{
      title: 'Register VM',
      type: 'bar' as const,
      color: '#0972d3',
      data: METRICS.map(m => ({ x: m.label, y: getValue(registerMetrics, m.key) })),
    }] : []),
    ...(stackMetrics ? [{
      title: 'Stack VM',
      type: 'bar' as const,
      color: '#037f0c',
      data: METRICS.map(m => ({ x: m.label, y: getValue(stackMetrics, m.key) })),
    }] : []),
  ];

  const maxY = Math.max(
    ...(registerMetrics ? METRICS.map(m => getValue(registerMetrics, m.key)) : [0]),
    ...(stackMetrics    ? METRICS.map(m => getValue(stackMetrics,    m.key)) : [0]),
    1,
  );

  return (
    bothNull ? <EmptyState /> : (
        <SpaceBetween size="m">
          <PartialDataNote registerMetrics={registerMetrics} stackMetrics={stackMetrics} />

          <CloudscapeBarChart<string>
            series={series}
            xDomain={xDomain}
            yDomain={[0, maxY * 1.15]}
            height={260}
            hideFilter
            xTitle="Metric"
            yTitle="Value"
            ariaLabel="Architecture comparison bar chart"
            i18nStrings={I18N}
            empty={<Box textAlign="center" color="text-body-secondary" padding="l">No data.</Box>}
            noMatch={<Box textAlign="center" color="text-body-secondary" padding="l">No matching data.</Box>}
          />

          {registerMetrics && stackMetrics && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
              {[
                { label: 'Size',         delta: registerMetrics.programSizeBytes - stackMetrics.programSizeBytes,                                                                                unit: 'B' },
                { label: 'Instructions', delta: registerMetrics.dynamicInstructionCount - stackMetrics.dynamicInstructionCount,                                                                  unit: '' },
                { label: 'Mem Ops',      delta: (registerMetrics.memoryReads + registerMetrics.memoryWrites) - (stackMetrics.memoryReads + stackMetrics.memoryWrites),                           unit: '' },
                { label: 'Cost',         delta: registerMetrics.estimatedCost - stackMetrics.estimatedCost,                                                                                      unit: '' },
              ].map(({ label, delta, unit }) => (
                <div key={label} style={{
                  padding: '6px 8px', borderRadius: '6px', textAlign: 'center',
                  background: delta > 0 ? '#fff8f0' : delta < 0 ? '#f0fff4' : '#f8f8f8',
                  border: `1px solid ${delta > 0 ? '#f89c0a44' : delta < 0 ? '#037f0c44' : '#e9ebed'}`,
                }}>
                  <Box variant="awsui-key-label">{label}</Box>
                  <Box
                    variant="p"
                    color={delta > 0 ? 'text-status-warning' : delta < 0 ? 'text-status-success' : 'text-body-secondary'}
                  >
                    <strong>{delta > 0 ? '+' : ''}{delta}{unit}</strong>
                  </Box>
                  <Box fontSize="body-s" color="text-body-secondary">
                    {delta > 0 ? 'Reg higher' : delta < 0 ? 'Stk higher' : 'Equal'}
                  </Box>
                </div>
              ))}
            </div>
          )}
        </SpaceBetween>
    )
  );
}
