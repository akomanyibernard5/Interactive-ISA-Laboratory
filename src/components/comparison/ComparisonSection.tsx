import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import type { ExecutionMetrics } from '../../types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ComparisonSectionProps {
  registerMetrics: ExecutionMetrics | null;
  stackMetrics: ExecutionMetrics | null;
  expanded: boolean;
  onToggle: () => void;
}

// ---------------------------------------------------------------------------
// Table row shape
// ---------------------------------------------------------------------------

interface ComparisonRow {
  id: string;
  metric: string;
  registerValue: number | null;
  stackValue: number | null;
}

const NA_DISPLAY = 'N/A';

// ---------------------------------------------------------------------------
// Build rows
// ---------------------------------------------------------------------------

function buildRows(
  reg: ExecutionMetrics | null,
  stk: ExecutionMetrics | null,
): ComparisonRow[] {
  return [
    {
      id: 'programSize',
      metric: 'Program Size (bytes)',
      registerValue: reg ? reg.programSizeBytes : null,
      stackValue: stk ? stk.programSizeBytes : null,
    },
    {
      id: 'dynamicInstructionCount',
      metric: 'Dynamic Instruction Count',
      registerValue: reg ? reg.dynamicInstructionCount : null,
      stackValue: stk ? stk.dynamicInstructionCount : null,
    },
    {
      id: 'memoryReads',
      metric: 'Memory Reads',
      registerValue: reg ? reg.memoryReads : null,
      stackValue: stk ? stk.memoryReads : null,
    },
    {
      id: 'memoryWrites',
      metric: 'Memory Writes',
      registerValue: reg ? reg.memoryWrites : null,
      stackValue: stk ? stk.memoryWrites : null,
    },
    {
      id: 'branchCount',
      metric: 'Branch Count',
      registerValue: reg ? reg.branchCount : null,
      stackValue: stk ? stk.branchCount : null,
    },
    {
      id: 'stackPushCount',
      metric: 'Stack Push Count',
      // Register machine does not use a stack — always null
      registerValue: null,
      stackValue: stk ? stk.stackPushCount : null,
    },
    {
      id: 'stackPopCount',
      metric: 'Stack Pop Count',
      registerValue: null,
      stackValue: stk ? stk.stackPopCount : null,
    },
    {
      id: 'estimatedCost',
      metric: 'Estimated Cost',
      registerValue: reg ? reg.estimatedCost : null,
      stackValue: stk ? stk.estimatedCost : null,
    },
  ];
}

// ---------------------------------------------------------------------------
// Difference cell
// ---------------------------------------------------------------------------

function DifferenceCell({
  regVal,
  stkVal,
}: {
  regVal: number | null;
  stkVal: number | null;
}) {
  if (regVal === null || stkVal === null) {
    return <Box color="text-body-secondary">{NA_DISPLAY}</Box>;
  }
  const delta = regVal - stkVal;
  if (delta === 0) return <Box variant="p">0</Box>;
  const sign = delta > 0 ? '+' : '';
  return <Box variant="p">{sign}{delta}</Box>;
}

// ---------------------------------------------------------------------------
// Observation cell — neutral language only
// ---------------------------------------------------------------------------

function ObservationCell({
  regVal,
  stkVal,
}: {
  regVal: number | null;
  stkVal: number | null;
}) {
  if (regVal === null && stkVal === null) {
    return <Box color="text-body-secondary">{NA_DISPLAY}</Box>;
  }
  if (regVal === null) {
    return <Box color="text-body-secondary">Stack: data available</Box>;
  }
  if (stkVal === null) {
    return <Box color="text-body-secondary">Register: data available</Box>;
  }
  if (regVal > stkVal) {
    return <Box variant="p">Register: higher</Box>;
  }
  if (regVal < stkVal) {
    return <Box variant="p">Stack: higher</Box>;
  }
  return <Box variant="p">Equal</Box>;
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const COLUMN_DEFINITIONS = [
  {
    id: 'metric',
    header: 'Metric',
    cell: (item: ComparisonRow) => <strong>{item.metric}</strong>,
    width: '26%',
  },
  {
    id: 'register',
    header: 'Register VM',
    cell: (item: ComparisonRow) =>
      item.registerValue !== null ? (
        <Box variant="p">{item.registerValue}</Box>
      ) : (
        <Box color="text-body-secondary">{NA_DISPLAY}</Box>
      ),
    width: '18%',
  },
  {
    id: 'stack',
    header: 'Stack VM',
    cell: (item: ComparisonRow) =>
      item.stackValue !== null ? (
        <Box variant="p">{item.stackValue}</Box>
      ) : (
        <Box color="text-body-secondary">{NA_DISPLAY}</Box>
      ),
    width: '18%',
  },
  {
    id: 'difference',
    header: 'Difference',
    cell: (item: ComparisonRow) => (
      <DifferenceCell regVal={item.registerValue} stkVal={item.stackValue} />
    ),
    width: '18%',
  },
  {
    id: 'observation',
    header: 'Observation',
    cell: (item: ComparisonRow) => (
      <ObservationCell regVal={item.registerValue} stkVal={item.stackValue} />
    ),
    width: '20%',
  },
];

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <Box textAlign="center" color="inherit" padding="xl">
      <SpaceBetween size="s" direction="vertical">
        <Box variant="strong" color="inherit">
          No comparison data available
        </Box>
        <Box color="inherit">
          Run Both to see a side-by-side comparison.
        </Box>
      </SpaceBetween>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Partial-data note
// ---------------------------------------------------------------------------

function PartialDataNote({
  registerMetrics,
  stackMetrics,
}: Pick<ComparisonSectionProps, 'registerMetrics' | 'stackMetrics'>) {
  if (registerMetrics !== null && stackMetrics !== null) return null;

  const missing =
    registerMetrics === null ? 'Register VM' : 'Stack VM';
  const present =
    registerMetrics !== null ? 'Register VM' : 'Stack VM';

  return (
    <Alert type="warning">
      Only {present} metrics are available. {missing} data is shown as N/A.
      Run both architectures to enable full comparison.
    </Alert>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ComparisonSection({
  registerMetrics,
  stackMetrics,
  expanded,
  onToggle,
}: ComparisonSectionProps) {
  const bothNull = registerMetrics === null && stackMetrics === null;
  const rows = buildRows(registerMetrics, stackMetrics);

  return (
    <ExpandableSection
      variant="container"
      headerText="Architecture Comparison"
      expanded={expanded}
      onChange={onToggle}
    >
      {bothNull ? (
        <EmptyState />
      ) : (
        <SpaceBetween size="l">
          {/* Partial-data notice when only one architecture has run */}
          <PartialDataNote
            registerMetrics={registerMetrics}
            stackMetrics={stackMetrics}
          />

          {/* ── Comparison table ── */}
          <Table<ComparisonRow>
            items={rows}
            trackBy="id"
            columnDefinitions={COLUMN_DEFINITIONS}
            variant="embedded"
            stripedRows
            ariaLabels={{ tableLabel: 'Architecture comparison table' }}
            empty={<EmptyState />}
          />

          {/* ── Disclaimer ── */}
          <Alert type="info">
            This comparison uses demonstration data. Observations reflect
            differences in values — no claim is made about which architecture
            is superior. Tradeoffs depend on workload characteristics and cost
            model assumptions.
          </Alert>
        </SpaceBetween>
      )}
    </ExpandableSection>
  );
}
