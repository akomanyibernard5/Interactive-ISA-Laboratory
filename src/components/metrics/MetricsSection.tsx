import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import type { ExecutionMetrics, CostModel, RunMode } from '../../types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MetricsSectionProps {
  registerMetrics: ExecutionMetrics | null;
  stackMetrics: ExecutionMetrics | null;
  runMode: RunMode;
  costModel: CostModel;
  expanded: boolean;
  onToggle: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Single key-value cell used in the compact summary row. */
function SummaryCell({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <Box variant="awsui-key-label">{label}</Box>
      <Box variant="p">{value}</Box>
    </div>
  );
}

/**
 * For runMode 'both', render two stacked values (Register | Stack) inside one
 * summary cell so the 4-column grid still holds.
 */
function SummaryCellBoth({
  label,
  registerValue,
  stackValue,
}: {
  label: string;
  registerValue: React.ReactNode;
  stackValue: React.ReactNode;
}) {
  return (
    <div>
      <Box variant="awsui-key-label">{label}</Box>
      <SpaceBetween size="xxs" direction="vertical">
        <Box variant="p">
          <Box display="inline" fontWeight="bold">Reg</Box>
          {' '}{registerValue}
        </Box>
        <Box variant="p">
          <Box display="inline" fontWeight="bold">Stk</Box>
          {' '}{stackValue}
        </Box>
      </SpaceBetween>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table row shape
// ---------------------------------------------------------------------------

interface MetricRow {
  id: string;
  metric: string;
  registerValue: string;
  stackValue: string;
  unit: string;
}

const NA = 'N/A';

function buildRows(
  reg: ExecutionMetrics | null,
  stk: ExecutionMetrics | null,
): MetricRow[] {
  const rv = (n: number | undefined | null) =>
    n !== undefined && n !== null ? String(n) : NA;

  return [
    {
      id: 'programSize',
      metric: 'Program Size',
      registerValue: reg ? rv(reg.programSizeBytes) : NA,
      stackValue: stk ? rv(stk.programSizeBytes) : NA,
      unit: 'bytes',
    },
    {
      id: 'dynamicInstructionCount',
      metric: 'Dynamic Instruction Count',
      registerValue: reg ? rv(reg.dynamicInstructionCount) : NA,
      stackValue: stk ? rv(stk.dynamicInstructionCount) : NA,
      unit: 'instructions',
    },
    {
      id: 'memoryReads',
      metric: 'Memory Reads',
      registerValue: reg ? rv(reg.memoryReads) : NA,
      stackValue: stk ? rv(stk.memoryReads) : NA,
      unit: 'operations',
    },
    {
      id: 'memoryWrites',
      metric: 'Memory Writes',
      registerValue: reg ? rv(reg.memoryWrites) : NA,
      stackValue: stk ? rv(stk.memoryWrites) : NA,
      unit: 'operations',
    },
    {
      id: 'branchCount',
      metric: 'Branch Count',
      registerValue: reg ? rv(reg.branchCount) : NA,
      stackValue: stk ? rv(stk.branchCount) : NA,
      unit: 'operations',
    },
    {
      id: 'stackPushCount',
      metric: 'Stack Push Count',
      // Register machine does not use a stack — always N/A
      registerValue: NA,
      stackValue: stk ? rv(stk.stackPushCount) : NA,
      unit: 'operations',
    },
    {
      id: 'stackPopCount',
      metric: 'Stack Pop Count',
      registerValue: NA,
      stackValue: stk ? rv(stk.stackPopCount) : NA,
      unit: 'operations',
    },
    {
      id: 'estimatedCost',
      metric: 'Estimated Cost',
      registerValue: reg ? rv(reg.estimatedCost) : NA,
      stackValue: stk ? rv(stk.estimatedCost) : NA,
      unit: 'abstract units',
    },
  ];
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

/** Show all four columns (Metric | Register VM | Stack VM | Unit). */
const ALL_COLUMNS = [
  {
    id: 'metric',
    header: 'Metric',
    cell: (item: MetricRow) => <strong>{item.metric}</strong>,
    width: '34%',
  },
  {
    id: 'register',
    header: 'Register VM',
    cell: (item: MetricRow) => item.registerValue,
    width: '22%',
  },
  {
    id: 'stack',
    header: 'Stack VM',
    cell: (item: MetricRow) => item.stackValue,
    width: '22%',
  },
  {
    id: 'unit',
    header: 'Unit',
    cell: (item: MetricRow) => (
      <Box color="text-body-secondary">{item.unit}</Box>
    ),
    width: '22%',
  },
];

/**
 * Single-architecture columns: show Register VM or Stack VM depending on
 * runMode, but always show N/A for the absent architecture.
 */
function singleArchColumns(runMode: 'register' | 'stack') {
  const archHeader = runMode === 'register' ? 'Register VM' : 'Stack VM';
  return [
    {
      id: 'metric',
      header: 'Metric',
      cell: (item: MetricRow) => <strong>{item.metric}</strong>,
      width: '40%',
    },
    {
      id: 'arch',
      header: archHeader,
      cell: (item: MetricRow) =>
        runMode === 'register' ? item.registerValue : item.stackValue,
      width: '35%',
    },
    {
      id: 'unit',
      header: 'Unit',
      cell: (item: MetricRow) => (
        <Box color="text-body-secondary">{item.unit}</Box>
      ),
      width: '25%',
    },
  ];
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <Box textAlign="center" color="inherit" padding="xl">
      <SpaceBetween size="s" direction="vertical">
        <Box variant="strong" color="inherit">
          No metrics available
        </Box>
        <Box color="inherit">
          Run a program to completion to see execution metrics.
        </Box>
      </SpaceBetween>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Compact summary row
// ---------------------------------------------------------------------------

function SummaryRow({
  registerMetrics,
  stackMetrics,
  runMode,
}: Pick<MetricsSectionProps, 'registerMetrics' | 'stackMetrics' | 'runMode'>) {
  const active = runMode === 'register' ? registerMetrics : stackMetrics;

  if (runMode === 'both') {
    const reg = registerMetrics;
    const stk = stackMetrics;
    return (
      <ColumnLayout columns={4} variant="text-grid">
        <SummaryCellBoth
          label="Program Size (bytes)"
          registerValue={reg ? reg.programSizeBytes : NA}
          stackValue={stk ? stk.programSizeBytes : NA}
        />
        <SummaryCellBoth
          label="Instructions Executed"
          registerValue={reg ? reg.dynamicInstructionCount : NA}
          stackValue={stk ? stk.dynamicInstructionCount : NA}
        />
        <SummaryCellBoth
          label="Memory Operations"
          registerValue={
            reg ? reg.memoryReads + reg.memoryWrites : NA
          }
          stackValue={
            stk ? stk.memoryReads + stk.memoryWrites : NA
          }
        />
        <SummaryCellBoth
          label="Estimated Cost"
          registerValue={reg ? reg.estimatedCost : NA}
          stackValue={stk ? stk.estimatedCost : NA}
        />
      </ColumnLayout>
    );
  }

  // Single-architecture summary
  return (
    <ColumnLayout columns={4} variant="text-grid">
      <SummaryCell
        label="Program Size (bytes)"
        value={active ? active.programSizeBytes : NA}
      />
      <SummaryCell
        label="Instructions Executed"
        value={active ? active.dynamicInstructionCount : NA}
      />
      <SummaryCell
        label="Memory Operations"
        value={
          active
            ? active.memoryReads + active.memoryWrites
            : NA
        }
      />
      <SummaryCell
        label="Estimated Cost"
        value={active ? active.estimatedCost : NA}
      />
    </ColumnLayout>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MetricsSection({
  registerMetrics,
  stackMetrics,
  runMode,
  costModel,
  expanded,
  onToggle,
}: MetricsSectionProps) {
  const hasAny = registerMetrics !== null || stackMetrics !== null;

  const rows = buildRows(registerMetrics, stackMetrics);

  const columnDefs =
    runMode === 'both'
      ? ALL_COLUMNS
      : singleArchColumns(runMode);

  return (
    <ExpandableSection
      variant="container"
      headerText="Metrics"
      expanded={expanded}
      onChange={onToggle}
    >
      {!hasAny ? (
        <EmptyState />
      ) : (
        <SpaceBetween size="l">
          {/* ── Compact summary row ── */}
          <SummaryRow
            registerMetrics={registerMetrics}
            stackMetrics={stackMetrics}
            runMode={runMode}
          />

          {/* ── Detailed metrics table ── */}
          <Table<MetricRow>
            items={rows}
            trackBy="id"
            columnDefinitions={columnDefs}
            variant="embedded"
            stripedRows
            ariaLabels={{ tableLabel: 'Detailed execution metrics' }}
            empty={<EmptyState />}
          />

          {/* ── Cost model parameters ── */}
          <Box>
            <Box variant="small" color="text-body-secondary">
              Cost Model:{' '}
              <strong>{costModel.name}</strong>
              {' | '}Instruction: ×{costModel.instructionCost}
              {' | '}Mem Read: ×{costModel.memoryReadCost}
              {' | '}Mem Write: ×{costModel.memoryWriteCost}
            </Box>
            <Box
              variant="small"
              color="text-body-secondary"
              padding={{ top: 'xxs' }}
            >
              Estimated cost is computed by the experiment engine, not the
              frontend.
            </Box>
          </Box>
        </SpaceBetween>
      )}
    </ExpandableSection>
  );
}
