import { useState } from 'react';
import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import ContentLayout from '@cloudscape-design/components/content-layout';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import type { SelectProps } from '@cloudscape-design/components/select';
import MetricsPanel from '../components/MetricsPanel';
import { MOCK_REGISTER_METRICS, MOCK_STACK_METRICS } from '../data';
import type { ExecutionMetrics } from '../types';

// ---------------------------------------------------------------------------
// Workload options
// ---------------------------------------------------------------------------
const WORKLOAD_OPTIONS: SelectProps.Option[] = [
  {
    value: 'arithmetic',
    label: 'Basic Arithmetic: x = (a + b) × c',
    description: 'Demo inputs: a=3, b=5, c=2 → expected x=16',
  },
];

// ---------------------------------------------------------------------------
// Comparison table rows
// ---------------------------------------------------------------------------
interface ComparisonRow {
  metric: string;
  registerValue: number;
  stackValue: number;
}

function buildRows(reg: ExecutionMetrics, stk: ExecutionMetrics): ComparisonRow[] {
  return [
    { metric: 'Program Size (bytes)',       registerValue: reg.programSizeBytes,          stackValue: stk.programSizeBytes          },
    { metric: 'Dynamic Instruction Count',  registerValue: reg.dynamicInstructionCount,   stackValue: stk.dynamicInstructionCount   },
    { metric: 'Memory Reads',               registerValue: reg.memoryReads,               stackValue: stk.memoryReads               },
    { metric: 'Memory Writes',              registerValue: reg.memoryWrites,              stackValue: stk.memoryWrites              },
    { metric: 'Branch Count',               registerValue: reg.branchCount,               stackValue: stk.branchCount               },
    { metric: 'Stack Push Count',           registerValue: reg.stackPushCount,            stackValue: stk.stackPushCount            },
    { metric: 'Stack Pop Count',            registerValue: reg.stackPopCount,             stackValue: stk.stackPopCount             },
    { metric: 'Estimated Cost',             registerValue: reg.estimatedCost,             stackValue: stk.estimatedCost             },
  ];
}

// ---------------------------------------------------------------------------
// Difference cell — plain numeric delta, no winner label
// ---------------------------------------------------------------------------
function DifferenceCell({ reg, stk }: { reg: number; stk: number }) {
  const delta = reg - stk;
  if (delta === 0) {
    return <Box variant="p">0</Box>;
  }
  const sign = delta > 0 ? '+' : '';
  return (
    <Box variant="p">
      {sign}{delta}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ComparePage() {
  const [selectedWorkload, setSelectedWorkload] = useState<SelectProps.Option>(
    WORKLOAD_OPTIONS[0]
  );

  const rows = buildRows(MOCK_REGISTER_METRICS, MOCK_STACK_METRICS);

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description="Side-by-side metric comparison of equivalent workloads executed on the Register Machine and Stack Machine virtual architectures."
        >
          Architecture Comparison
        </Header>
      }
    >
      <SpaceBetween size="l">
        {/* Demonstration data notice */}
        <Alert type="info">
          This comparison uses demonstration data. Real measurements will be produced by the
          C++ simulation engine.
        </Alert>

        {/* Workload selector */}
        <Container header={<Header variant="h2">Workload</Header>}>
          <FormField
            label="Select workload"
            description="Choose a benchmark workload to compare across architectures."
          >
            <Select
              selectedOption={selectedWorkload}
              onChange={({ detail }) => setSelectedWorkload(detail.selectedOption)}
              options={WORKLOAD_OPTIONS}
              ariaLabel="Select workload"
            />
          </FormField>
        </Container>

        {/* Metrics comparison table */}
        <Container
          header={
            <Header
              variant="h2"
              description="Numeric measurements for each metric. 'Difference' is Register minus Stack."
            >
              Metrics Comparison
            </Header>
          }
        >
          <Table
            items={rows}
            trackBy="metric"
            columnDefinitions={[
              {
                id: 'metric',
                header: 'Metric',
                cell: (item) => <Box variant="p"><strong>{item.metric}</strong></Box>,
                width: '34%',
              },
              {
                id: 'register',
                header: 'Register Machine',
                cell: (item) => <Box variant="p">{item.registerValue}</Box>,
                width: '22%',
              },
              {
                id: 'stack',
                header: 'Stack Machine',
                cell: (item) => <Box variant="p">{item.stackValue}</Box>,
                width: '22%',
              },
              {
                id: 'difference',
                header: 'Difference',
                cell: (item) => (
                  <DifferenceCell reg={item.registerValue} stk={item.stackValue} />
                ),
                width: '22%',
              },
            ]}
            variant="embedded"
            stripedRows
          />
        </Container>

        {/* Side-by-side MetricsPanel */}
        <ColumnLayout columns={2} variant="default">
          <Container
            header={<Header variant="h2">Register Machine — Metrics Detail</Header>}
          >
            <MetricsPanel
              metrics={MOCK_REGISTER_METRICS}
              architectureId="register"
            />
          </Container>

          <Container
            header={<Header variant="h2">Stack Machine — Metrics Detail</Header>}
          >
            <MetricsPanel
              metrics={MOCK_STACK_METRICS}
              architectureId="stack"
            />
          </Container>
        </ColumnLayout>

        {/* Cost model disclaimer */}
        <Box variant="small" color="text-body-secondary">
          Estimated cost uses an abstract analytical model. Values do not represent real
          processor cycles or hardware performance.
        </Box>
      </SpaceBetween>
    </ContentLayout>
  );
}
