import Box from '@cloudscape-design/components/box';
import CloudscapeBarChart from '@cloudscape-design/components/bar-chart';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import SpaceBetween from '@cloudscape-design/components/space-between';
import type { ExecutionMetrics, CostModel, RunMode, TraceEntry } from '../../utils/types';
import TraceLineChart from '../visuals/TraceLineChart';

interface MetricsSectionProps {
  registerMetrics: ExecutionMetrics | null;
  stackMetrics: ExecutionMetrics | null;
  runMode: RunMode;
  costModel: CostModel;
  registerTrace: TraceEntry[];
  stackTrace: TraceEntry[];
  currentStep: number;
}

const BAR_I18N = {
  filterLabel: 'Filter displayed series',
  filterPlaceholder: 'Filter series',
  filterSelectedAriaLabel: 'selected',
  detailPopoverDismissAriaLabel: 'Dismiss',
  legendAriaLabel: 'Legend',
  chartAriaRoleDescription: 'bar chart',
  xTickFormatter: (v: string) => v,
  yTickFormatter: (v: number) => `${v}%`,
};

function StatCard({
  label, regValue, stkValue, unit, showBoth,
}: {
  label: string;
  regValue: number | null;
  stkValue: number | null;
  unit?: string;
  showBoth: boolean;
}) {
  const fmt = (v: number | null) => v !== null ? String(v) : 'N/A';
  return (
    <div style={{
      padding: '10px 12px', borderRadius: '8px',
      background: '#fafafa', border: '1px solid #e9ebed',
    }}>
      <Box variant="awsui-key-label">{label}{unit ? ` (${unit})` : ''}</Box>
      {showBoth ? (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginTop: '4px' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#0972d3', fontFamily: 'monospace' }}>
            {fmt(regValue)}
          </span>
          <span style={{ fontSize: '11px', color: '#8c9ba5' }}>vs</span>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#037f0c', fontFamily: 'monospace' }}>
            {fmt(stkValue)}
          </span>
        </div>
      ) : (
        <div style={{ marginTop: '4px' }}>
          <span style={{
            fontSize: '22px', fontWeight: 800, fontFamily: 'monospace',
            color: regValue !== null ? '#0972d3' : '#037f0c',
          }}>
            {fmt(regValue ?? stkValue)}
          </span>
        </div>
      )}
    </div>
  );
}

// Normalised profile comparison
function buildProfileData(reg: ExecutionMetrics, stk: ExecutionMetrics) {
  const axes = [
    { label: 'Size',         reg: reg.programSizeBytes,        stk: stk.programSizeBytes },
    { label: 'Instructions', reg: reg.dynamicInstructionCount, stk: stk.dynamicInstructionCount },
    { label: 'Mem Reads',    reg: reg.memoryReads,             stk: stk.memoryReads },
    { label: 'Mem Writes',   reg: reg.memoryWrites,            stk: stk.memoryWrites },
    { label: 'Branches',     reg: reg.branchCount,             stk: stk.branchCount },
    { label: 'Est. Cost',    reg: reg.estimatedCost,           stk: stk.estimatedCost },
  ];
  return axes.map(a => {
    const max = Math.max(a.reg, a.stk, 1);
    return {
      label: a.label,
      regPct: Math.round((a.reg / max) * 100),
      stkPct: Math.round((a.stk / max) * 100),
    };
  });
}

function EmptyState() {
  return (
    <Box textAlign="center" color="text-body-secondary" padding="xl">
      <SpaceBetween size="xs" direction="vertical">
        <Box variant="strong" color="inherit">No metrics available</Box>
        <Box color="inherit">Run a program to see execution metrics.</Box>
      </SpaceBetween>
    </Box>
  );
}

export default function MetricsSection({
  registerMetrics, stackMetrics, runMode, costModel,
  registerTrace, stackTrace, currentStep,
}: MetricsSectionProps) {
  const hasAny = registerMetrics !== null || stackMetrics !== null;
  const showBoth = runMode === 'both';
  const reg = registerMetrics;
  const stk = stackMetrics;

  return (
    !hasAny ? <EmptyState /> : (
        <SpaceBetween size="l">

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            <StatCard label="Program Size"  regValue={reg?.programSizeBytes ?? null}        stkValue={stk?.programSizeBytes ?? null}        unit="bytes" showBoth={showBoth} />
            <StatCard label="Instructions"  regValue={reg?.dynamicInstructionCount ?? null} stkValue={stk?.dynamicInstructionCount ?? null}               showBoth={showBoth} />
            <StatCard label="Mem Reads"     regValue={reg?.memoryReads ?? null}             stkValue={stk?.memoryReads ?? null}                           showBoth={showBoth} />
            <StatCard label="Mem Writes"    regValue={reg?.memoryWrites ?? null}            stkValue={stk?.memoryWrites ?? null}                          showBoth={showBoth} />
            <StatCard label="Branches"      regValue={reg?.branchCount ?? null}             stkValue={stk?.branchCount ?? null}                           showBoth={showBoth} />
            <StatCard label="Est. Cost"     regValue={reg?.estimatedCost ?? null}           stkValue={stk?.estimatedCost ?? null}                         showBoth={showBoth} />
          </div>

          {reg && stk && (() => {
            const profileData = buildProfileData(reg, stk);
            const xDomain = profileData.map(d => d.label);
            return (
              <div>
                <Box variant="h4">Normalised Profile</Box>
                <Box color="text-body-secondary" fontSize="body-s">
                  Each metric normalised to 100 relative to the larger value. Lower bar = more efficient.
                </Box>
                <CloudscapeBarChart<string>
                  series={[
                    {
                      title: 'Register VM',
                      type: 'bar',
                      color: '#0972d3',
                      data: profileData.map(d => ({ x: d.label, y: d.regPct })),
                    },
                    {
                      title: 'Stack VM',
                      type: 'bar',
                      color: '#037f0c',
                      data: profileData.map(d => ({ x: d.label, y: d.stkPct })),
                    },
                  ]}
                  xDomain={xDomain}
                  yDomain={[0, 110]}
                  height={200}
                  hideFilter
                  xTitle="Metric"
                  yTitle="Relative %"
                  ariaLabel="Normalised profile comparison"
                  i18nStrings={BAR_I18N}
                  empty={<Box textAlign="center" color="text-body-secondary" padding="l">No data.</Box>}
                  noMatch={<Box textAlign="center" color="text-body-secondary" padding="l">No matching data.</Box>}
                />
              </div>
            );
          })()}

          <div>
            <Box variant="h4">Execution Progression</Box>
            <Box color="text-body-secondary" fontSize="body-s">
              Cumulative instruction count and memory operations per step.
            </Box>
            <div style={{ marginTop: '8px' }}>
              <TraceLineChart
                registerTrace={registerTrace}
                stackTrace={stackTrace}
                runMode={runMode}
                currentStep={currentStep}
              />
            </div>
          </div>

          <ExpandableSection headerText="Cost Model" variant="default" defaultExpanded={false}>
            <SpaceBetween size="m">
              <KeyValuePairs
                columns={3}
                items={[
                  { label: 'Model Name',        value: costModel.name },
                  { label: 'Instruction Cost',  value: `×${costModel.instructionCost}` },
                  { label: 'Memory Read Cost',  value: `×${costModel.memoryReadCost}` },
                  { label: 'Memory Write Cost', value: `×${costModel.memoryWriteCost}` },
                  {
                    label: 'Formula',
                    value: (
                      <Box variant="code" fontSize="body-s">
                        instructions × {costModel.instructionCost} + reads × {costModel.memoryReadCost} + writes × {costModel.memoryWriteCost}
                      </Box>
                    ),
                  },
                ]}
              />
              <Box variant="small" color="text-body-secondary">
                Estimated cost is supplied by the experiment engine
              </Box>
            </SpaceBetween>
          </ExpandableSection>

        </SpaceBetween>
    )
  );
}
