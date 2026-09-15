import { useState, useMemo } from 'react';
import Alert from '@cloudscape-design/components/alert';
import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Table from '@cloudscape-design/components/table';

import type { Benchmark, BenchmarkCategory, BenchmarkStatus } from '../../types';

// ─── Category helpers ────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<BenchmarkCategory, string> = {
  arithmetic: 'Arithmetic',
  expression: 'Expression',
  loop: 'Loop',
  branch: 'Branch',
  'data-processing': 'Data Processing',
};

// Cloudscape Badge only accepts a limited set of color strings.
// orange and purple/teal are not supported natively; we use the closest available.
const CATEGORY_BADGE_COLORS: Record<
  BenchmarkCategory,
  'blue' | 'grey' | 'green' | 'red' | 'severity-neutral'
> = {
  arithmetic: 'blue',
  expression: 'green',
  loop: 'grey',
  branch: 'red',         // closest to "orange" in the Cloudscape palette
  'data-processing': 'severity-neutral', // closest to "purple/teal"
};

// ─── Status mapping ──────────────────────────────────────────────────────────

type CloudscapeStatusType =
  | 'success'
  | 'error'
  | 'pending'
  | 'warning'
  | 'info'
  | 'stopped'
  | 'in-progress'
  | 'loading';

const STATUS_TYPE_MAP: Record<BenchmarkStatus, CloudscapeStatusType> = {
  pending: 'pending',
  running: 'in-progress',
  completed: 'success',
  error: 'error',
};

const STATUS_LABEL_MAP: Record<BenchmarkStatus, string> = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Completed',
  error: 'Error',
};

// ─── Category filter options ──────────────────────────────────────────────────

interface SelectOption {
  label: string;
  value: string;
}

const ALL_CATEGORIES_OPTION: SelectOption = { label: 'All Categories', value: '__all__' };

const CATEGORY_OPTIONS: SelectOption[] = [
  ALL_CATEGORIES_OPTION,
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface BenchmarksSectionProps {
  benchmarks: Benchmark[];
  onLoadBenchmark: (benchmark: Benchmark) => void;
  expanded: boolean;
  onToggle: () => void;
}

// ─── Selected benchmark detail panel ─────────────────────────────────────────

interface BenchmarkDetailPanelProps {
  benchmark: Benchmark;
  onLoadBenchmark: (benchmark: Benchmark) => void;
}

function BenchmarkDetailPanel({ benchmark, onLoadBenchmark }: BenchmarkDetailPanelProps) {
  return (
    <ExpandableSection
      headerText={`Details: ${benchmark.name}`}
      defaultExpanded
      variant="default"
    >
      <SpaceBetween size="m">

        {/* Full description */}
        <div>
          <Box variant="awsui-key-label">Description</Box>
          <Box variant="p" padding={{ top: 'xs' }}>
            {benchmark.description}
          </Box>
        </div>

        {/* Status badge */}
        <div>
          <Box variant="awsui-key-label">Status</Box>
          <Box padding={{ top: 'xs' }}>
            <StatusIndicator type={STATUS_TYPE_MAP[benchmark.status]}>
              {STATUS_LABEL_MAP[benchmark.status]}
            </StatusIndicator>
          </Box>
        </div>

        {/* Input configuration */}
        <div>
          <Box variant="awsui-key-label">Input Configuration</Box>
          {benchmark.inputs.length === 0 ? (
            <Box color="text-body-secondary" padding={{ top: 'xs' }}>
              No inputs defined.
            </Box>
          ) : (
            <ColumnLayout columns={Math.min(benchmark.inputs.length, 4)} variant="text-grid">
              {benchmark.inputs.map((inp) => (
                <div key={inp.name}>
                  <Box variant="awsui-key-label">{inp.name}</Box>
                  <Box variant="code">{String(inp.value)}</Box>
                </div>
              ))}
            </ColumnLayout>
          )}
        </div>

        {/* C source code preview */}
        {benchmark.cSource && (
          <div>
            <Box variant="awsui-key-label">C Source Preview</Box>
            <pre
              style={{
                marginTop: '4px',
                padding: '12px',
                height: '150px',
                overflow: 'auto',
                fontFamily: "'Courier New', Courier, monospace",
                fontSize: '13px',
                lineHeight: 1.5,
                backgroundColor: 'var(--color-background-input-default, #f8f8f8)',
                border: '1px solid var(--color-border-input-default, #ccc)',
                borderRadius: '4px',
                whiteSpace: 'pre',
              }}
            >
              {benchmark.cSource}
            </pre>
          </div>
        )}

        {/* Actions */}
        <Box>
          <Button variant="primary" onClick={() => onLoadBenchmark(benchmark)}>
            Load into Editor
          </Button>
        </Box>

        {/* Engine note */}
        <Alert type="info" statusIconAriaLabel="Info">
          Benchmark execution requires the C++ simulation engine. Currently showing metadata only.
        </Alert>

      </SpaceBetween>
    </ExpandableSection>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BenchmarksSection({
  benchmarks,
  onLoadBenchmark,
  expanded,
  onToggle,
}: BenchmarksSectionProps) {
  const [categoryFilter, setCategoryFilter] = useState<SelectOption>(ALL_CATEGORIES_OPTION);
  const [selectedItems, setSelectedItems] = useState<Benchmark[]>([]);

  // Derived: filtered list
  const filteredBenchmarks = useMemo<Benchmark[]>(() => {
    if (categoryFilter.value === '__all__') return benchmarks;
    return benchmarks.filter((b) => b.category === categoryFilter.value);
  }, [benchmarks, categoryFilter]);

  // Keep selection valid when filter changes (deselect if filtered out)
  const selectedBenchmark = selectedItems[0] ?? null;
  const selectedStillVisible =
    selectedBenchmark !== null &&
    filteredBenchmarks.some((b) => b.id === selectedBenchmark.id);

  function handleSelectionChange(items: Benchmark[]) {
    setSelectedItems(items);
  }

  function handleCategoryChange(option: SelectOption) {
    setCategoryFilter(option);
    // If selected benchmark is filtered out, clear selection
    if (selectedBenchmark && option.value !== '__all__' && selectedBenchmark.category !== option.value) {
      setSelectedItems([]);
    }
  }

  // Table column definitions
  const columnDefinitions = [
    {
      id: 'name',
      header: 'Name',
      cell: (item: Benchmark) => item.name,
      minWidth: 200,
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
        <Box
          color="text-body-secondary"
          display="inline"
        >
          {/* Truncate long descriptions to ~80 chars */}
          {item.description.length > 80
            ? item.description.slice(0, 80) + '…'
            : item.description}
        </Box>
      ),
      minWidth: 260,
    },
    {
      id: 'expectedOutput',
      header: 'Expected Output',
      cell: (item: Benchmark) => (
        <Box variant="code" fontWeight="bold">
          {item.expectedOutput}
        </Box>
      ),
      minWidth: 130,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (item: Benchmark) => (
        <StatusIndicator type={STATUS_TYPE_MAP[item.status]}>
          {STATUS_LABEL_MAP[item.status]}
        </StatusIndicator>
      ),
      minWidth: 120,
    },
  ];

  return (
    <ExpandableSection
      variant="container"
      headerText="Benchmarks"
      expanded={expanded}
      onChange={onToggle}
    >
      <SpaceBetween size="l">

        {/* Intro text */}
        <Box variant="p" color="text-body-secondary">
          Controlled benchmark suite for systematic architecture comparison. Load a benchmark to
          run it on the Register VM, Stack VM, or both.
        </Box>

        {/* Category filter */}
        <SpaceBetween direction="horizontal" size="xs">
          <Box variant="awsui-key-label" padding={{ top: 'xs' }}>
            Category
          </Box>
          <Select
            selectedOption={categoryFilter}
            onChange={({ detail }) => handleCategoryChange(detail.selectedOption as SelectOption)}
            options={CATEGORY_OPTIONS}
            ariaLabel="Filter benchmarks by category"
          />
        </SpaceBetween>

        {/* Benchmark table */}
        <Table<Benchmark>
          columnDefinitions={columnDefinitions}
          items={filteredBenchmarks}
          trackBy="id"
          variant="embedded"
          selectionType="single"
          selectedItems={selectedStillVisible && selectedBenchmark ? [selectedBenchmark] : []}
          onSelectionChange={({ detail }) => handleSelectionChange(detail.selectedItems)}
          onRowClick={({ detail }) => handleSelectionChange([detail.item])}
          empty={
            <Box textAlign="center" color="inherit" padding="xl">
              <SpaceBetween size="s">
                <Box variant="strong" color="inherit">
                  No benchmarks found
                </Box>
                <Box variant="p" color="inherit">
                  No benchmarks match the selected category filter.
                </Box>
                <Button onClick={() => setCategoryFilter(ALL_CATEGORIES_OPTION)}>
                  Clear filter
                </Button>
              </SpaceBetween>
            </Box>
          }
          ariaLabels={{
            tableLabel: 'Benchmark suite table',
            selectionGroupLabel: 'Benchmark selection',
            itemSelectionLabel: ({ selectedItems: sel }, item) =>
              `${item.name} is ${sel.includes(item) ? '' : 'not '}selected`,
            activateEditLabel: () => '',
            cancelEditLabel: () => '',
            submitEditLabel: () => '',
          }}
        />

        {/* Selected benchmark detail panel */}
        {selectedStillVisible && selectedBenchmark !== null && (
          <BenchmarkDetailPanel
            benchmark={selectedBenchmark}
            onLoadBenchmark={onLoadBenchmark}
          />
        )}

      </SpaceBetween>
    </ExpandableSection>
  );
}
