import Container from '@cloudscape-design/components/container';
import Header from '@cloudscape-design/components/header';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import type { ExecutionMetrics, ArchitectureId, CostModel } from '../types';

interface MetricsPanelProps {
  metrics: ExecutionMetrics | null;
  architectureId: ArchitectureId;
  showCostModel?: boolean;
  costModel?: CostModel;
}

function MetricItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <Box variant="awsui-key-label">{label}</Box>
      <div>
        <Box variant="p">{value}</Box>
      </div>
    </div>
  );
}

export default function MetricsPanel({
  metrics,
  architectureId,
  showCostModel = false,
  costModel,
}: MetricsPanelProps) {
  const isStack = architectureId === 'stack';

  if (!metrics) {
    return (
      <Box textAlign="center" color="inherit" padding="xl">
        <Box variant="strong" color="inherit">
          No metrics available
        </Box>
        <Box color="inherit" padding={{ top: 'xs' }}>
          Run a program to completion to see execution metrics.
        </Box>
      </Box>
    );
  }

  return (
    <SpaceBetween size="l">
      <ColumnLayout columns={3} variant="text-grid">
        <MetricItem
          label="Program Size (bytes)"
          value={metrics.programSizeBytes}
        />
        <MetricItem
          label="Dynamic Instruction Count"
          value={metrics.dynamicInstructionCount}
        />
        <MetricItem
          label="Memory Reads"
          value={metrics.memoryReads}
        />
        <MetricItem
          label="Memory Writes"
          value={metrics.memoryWrites}
        />
        <MetricItem
          label="Branch Count"
          value={metrics.branchCount}
        />
        <MetricItem
          label="Stack Push Count"
          value={isStack ? metrics.stackPushCount : <em>N/A</em>}
        />
        <MetricItem
          label="Stack Pop Count"
          value={isStack ? metrics.stackPopCount : <em>N/A</em>}
        />
        <MetricItem
          label="Estimated Cost"
          value={metrics.estimatedCost}
        />
        <MetricItem
          label="Cost Model Name"
          value={metrics.costModelName}
        />
      </ColumnLayout>

      {showCostModel && costModel && (
        <Container
          header={<Header variant="h3">Abstract Cost Parameters</Header>}
        >
          <ColumnLayout columns={3} variant="text-grid">
            <MetricItem
              label="Instruction Cost"
              value={costModel.instructionCost}
            />
            <MetricItem
              label="Memory Read Cost"
              value={costModel.memoryReadCost}
            />
            <MetricItem
              label="Memory Write Cost"
              value={costModel.memoryWriteCost}
            />
          </ColumnLayout>
        </Container>
      )}
    </SpaceBetween>
  );
}
