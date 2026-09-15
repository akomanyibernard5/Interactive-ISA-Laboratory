import { useState, useMemo } from 'react';
import Alert from '@cloudscape-design/components/alert';
import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import ContentLayout from '@cloudscape-design/components/content-layout';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import KeyValuePairs from '@cloudscape-design/components/key-value-pairs';
import Modal from '@cloudscape-design/components/modal';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import Table from '@cloudscape-design/components/table';
import Tooltip from '@cloudscape-design/components/popover';

import StatusIndicator from '../components/StatusIndicator';
import type { Benchmark, BenchmarkCategory, BenchmarkStatus } from '../types';
import { MOCK_BENCHMARKS } from '../data';

// ─── Category helpers ───────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<BenchmarkCategory, string> = {
  arithmetic: 'Arithmetic',
  expression: 'Expression',
  loop: 'Loop',
  branch: 'Branch',
  'data-processing': 'Data Processing',
};

const CATEGORY_BADGE_COLORS: Record<
  BenchmarkCategory,
  'blue' | 'grey' | 'green' | 'red' | 'severity-neutral'
> = {
  arithmetic: 'blue',
  expression: 'green',
  loop: 'grey',
  branch: 'red',
  'data-processing': 'severity-neutral',
};

// ─── Category filter options ─────────────────────────────────────────────────

interface CategoryOption {
  label: string;
  value: string; // 'all' | BenchmarkCategory
}

const ALL_OPTION: CategoryOption = { label: 'All Categories', value: 'all' };

const CATEGORY_OPTIONS: CategoryOption[] = [
  ALL_OPTION,
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

// ─── Status helper ───────────────────────────────────────────────────────────

function benchmarkStatusToIndicator(
  status: BenchmarkStatus
): 'pending' | 'running' | 'completed' | 'error' {
  return status;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BenchmarksPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryOption>(ALL_OPTION);

  const [selectedBenchmark, setSelectedBenchmark] =
    useState<Benchmark | null>(null);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filteredBenchmarks = useMemo<Benchmark[]>(() => {
    if (selectedCategory.value === 'all') return MOCK_BENCHMARKS;
    return MOCK_BENCHMARKS.filter(
      (b) => b.category === selectedCategory.value
    );
  }, [selectedCategory]);

  // ── Table column definitions ───────────────────────────────────────────────
  const columnDefinitions = [
    {
      id: 'name',
      header: 'Name',
      cell: (item: Benchmark) => item.name,
      sortingField: 'name',
      minWidth: 220,
    },
    {
      id: 'category',
      header: 'Category',
      cell: (item: Benchmark) => (
        <Badge color={CATEGORY_BADGE_COLORS[item.category]}>
          {CATEGORY_LABELS[item.category]}
        </Badge>
      ),
      minWidth: 140,
    },
    {
      id: 'description',
      header: 'Description',
      cell: (item: Benchmark) => (
        <Box color="text-body-secondary">{item.description}</Box>
      ),
      minWidth: 280,
    },
    {
      id: 'expectedOutput',
      header: 'Expected Output',
      cell: (item: Benchmark) => (
        <Box fontWeight="bold" variant="code">
          {item.expectedOutput}
        </Box>
      ),
      minWidth: 140,
    },
    {
      id: 'inputs',
      header: 'Inputs',
      cell: (item: Benchmark) =>
        item.inputs.map((inp) => `${inp.name}=${inp.value}`).join(', '),
      minWidth: 120,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (item: Benchmark) => (
        <StatusIndicator status={benchmarkStatusToIndicator(item.status)} />
      ),
      minWidth: 120,
    },
  ];

  // ── Empty state ────────────────────────────────────────────────────────────
  const emptyState = (
    <Box textAlign="center" color="text-body-secondary" padding="xl">
      <SpaceBetween size="s">
        <Box variant="h3" color="text-status-inactive">
          No benchmarks found
        </Box>
        <Box variant="p">
          No benchmarks match the selected category filter. Try selecting{' '}
          <strong>All Categories</strong> to see all available benchmarks.
        </Box>
        <Button
          onClick={() => setSelectedCategory(ALL_OPTION)}
        >
          Clear filter
        </Button>
      </SpaceBetween>
    </Box>
  );

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          description={
            'Five benchmark categories are evaluated across both architectures: ' +
            'Arithmetic, Expression, Loop, Branch, and Data Processing. ' +
            'Each benchmark targets a distinct computational pattern to enable ' +
            'systematic comparison of register-based and stack-based ISAs.'
          }
        >
          Benchmarks
        </Header>
      }
    >
      <SpaceBetween size="l">
        {/* ── Info Alert ── */}
        <Alert type="info" header="Simulation engine not available">
          Benchmark execution requires the C++ simulation engine. This page
          currently shows benchmark metadata only.
        </Alert>

        {/* ── Category Filter ── */}
        <Container header={<Header variant="h2">Benchmark Suite</Header>}>
          <SpaceBetween size="m">
            <FormField label="Filter by category">
              <Select
                selectedOption={selectedCategory}
                onChange={({ detail }) =>
                  setSelectedCategory(detail.selectedOption as CategoryOption)
                }
                options={CATEGORY_OPTIONS}
                ariaLabel="Filter benchmarks by category"
              />
            </FormField>

            {/* ── Benchmark Table ── */}
            <Table<Benchmark>
              columnDefinitions={columnDefinitions}
              items={filteredBenchmarks}
              trackBy="id"
              variant="embedded"
              selectionType="single"
              onRowClick={({ detail }) =>
                setSelectedBenchmark(detail.item)
              }
              selectedItems={
                selectedBenchmark ? [selectedBenchmark] : []
              }
              onSelectionChange={({ detail }) =>
                setSelectedBenchmark(detail.selectedItems[0] ?? null)
              }
              empty={emptyState}
              header={
                <Header
                  counter={`(${filteredBenchmarks.length})`}
                  description="Click a row to view full details and associated program IDs."
                >
                  Benchmarks
                </Header>
              }
              ariaLabels={{
                tableLabel: 'Benchmark table',
                selectionGroupLabel: 'Benchmark selection',
                itemSelectionLabel: ({ selectedItems }, item) =>
                  `${item.name} is ${
                    selectedItems.includes(item) ? '' : 'not '
                  }selected`,
                activateEditLabel: () => '',
                cancelEditLabel: () => '',
                submitEditLabel: () => '',
              }}
            />
          </SpaceBetween>
        </Container>
      </SpaceBetween>

      {/* ── Detail Modal ── */}
      {selectedBenchmark !== null && (
        <Modal
          visible
          onDismiss={() => setSelectedBenchmark(null)}
          size="large"
          header={
            <SpaceBetween direction="horizontal" size="xs">
              <span>{selectedBenchmark.name}</span>
              <Badge color={CATEGORY_BADGE_COLORS[selectedBenchmark.category]}>
                {CATEGORY_LABELS[selectedBenchmark.category]}
              </Badge>
            </SpaceBetween>
          }
          footer={
            <Box float="right">
              <SpaceBetween direction="horizontal" size="xs">
                <Button
                  variant="link"
                  onClick={() => setSelectedBenchmark(null)}
                >
                  Close
                </Button>
                {/* Run Benchmark button — disabled; Tooltip via Popover */}
                <Tooltip
                  content="Requires C++ simulation engine (not yet available)"
                  triggerType="custom"
                  dismissButton={false}
                  position="top"
                  size="small"
                >
                  <Button variant="primary" disabled>
                    Run Benchmark
                  </Button>
                </Tooltip>
              </SpaceBetween>
            </Box>
          }
        >
          <SpaceBetween size="l">
            {/* Description */}
            <Container header={<Header variant="h3">Description</Header>}>
              <Box variant="p">{selectedBenchmark.description}</Box>
            </Container>

            {/* Status */}
            <Container header={<Header variant="h3">Status</Header>}>
              <StatusIndicator
                status={benchmarkStatusToIndicator(selectedBenchmark.status)}
              />
            </Container>

            {/* Input Configuration */}
            <Container
              header={<Header variant="h3">Input Configuration</Header>}
            >
              {selectedBenchmark.inputs.length === 0 ? (
                <Box color="text-body-secondary" variant="p">
                  No inputs defined for this benchmark.
                </Box>
              ) : (
                <ColumnLayout columns={3} variant="text-grid">
                  {selectedBenchmark.inputs.map((inp) => (
                    <div key={inp.name}>
                      <Box variant="awsui-key-label">{inp.name}</Box>
                      <Box variant="code">{String(inp.value)}</Box>
                    </div>
                  ))}
                </ColumnLayout>
              )}
            </Container>

            {/* Associated Program IDs */}
            <Container
              header={<Header variant="h3">Associated Programs</Header>}
            >
              <KeyValuePairs
                columns={2}
                items={[
                  {
                    label: 'Register Machine Program ID',
                    value: (
                      <Box variant="code">
                        {selectedBenchmark.programIdRegister}
                      </Box>
                    ),
                  },
                  {
                    label: 'Stack Machine Program ID',
                    value: (
                      <Box variant="code">
                        {selectedBenchmark.programIdStack}
                      </Box>
                    ),
                  },
                ]}
              />
            </Container>
          </SpaceBetween>
        </Modal>
      )}
    </ContentLayout>
  );
}
