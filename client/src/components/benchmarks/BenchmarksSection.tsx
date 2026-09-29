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
import type { Benchmark, BenchmarkCategory, BenchmarkStatus } from '../../utils/types';

const CATEGORY_LABELS: Record<BenchmarkCategory, string> = {
  arithmetic: 'Arithmetic', expression: 'Expression',
  loop: 'Loop', branch: 'Branch', 'data-processing': 'Data Processing',
};

const CATEGORY_BADGE_COLORS: Record<BenchmarkCategory, 'blue' | 'grey' | 'green' | 'red' | 'severity-neutral'> = {
  arithmetic: 'blue', expression: 'green', loop: 'grey',
  branch: 'red', 'data-processing': 'severity-neutral',
};

type CSStatus = 'success' | 'error' | 'pending' | 'warning' | 'info' | 'stopped' | 'in-progress' | 'loading';

const STATUS_TYPE_MAP: Record<BenchmarkStatus, CSStatus> = {
  pending: 'pending', running: 'in-progress', completed: 'success', error: 'error',
};
const STATUS_LABEL_MAP: Record<BenchmarkStatus, string> = {
  pending: 'Pending', running: 'Running', completed: 'Completed', error: 'Error',
};

interface SelectOption { label: string; value: string; }
const ALL_CATEGORIES_OPTION: SelectOption = { label: 'All Categories', value: '__all__' };
const CATEGORY_OPTIONS: SelectOption[] = [
  ALL_CATEGORIES_OPTION,
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];

interface BenchmarksSectionProps {
  benchmarks: Benchmark[];
  onLoadBenchmark: (benchmark: Benchmark) => void;
}

function BenchmarkDetailPanel({ benchmark, onLoadBenchmark }: { benchmark: Benchmark; onLoadBenchmark: (b: Benchmark) => void }) {
  return (
    <ExpandableSection headerText={`Details: ${benchmark.name}`} defaultExpanded variant="default">
      <SpaceBetween size="m">
        <div>
          <Box variant="awsui-key-label">Description</Box>
          <Box variant="p" padding={{ top: 'xs' }}>{benchmark.description}</Box>
        </div>
        <div>
          <Box variant="awsui-key-label">Status</Box>
          <Box padding={{ top: 'xs' }}>
            <StatusIndicator type={STATUS_TYPE_MAP[benchmark.status]}>
              {STATUS_LABEL_MAP[benchmark.status]}
            </StatusIndicator>
          </Box>
        </div>
        <div>
          <Box variant="awsui-key-label">Input Configuration</Box>
          {benchmark.inputs.length === 0 ? (
            <Box color="text-body-secondary" padding={{ top: 'xs' }}>No inputs defined.</Box>
          ) : (
            <ColumnLayout columns={Math.min(benchmark.inputs.length, 4)} variant="text-grid">
              {benchmark.inputs.map((inp: { name: string; value: string | number }) => (
                <div key={inp.name}>
                  <Box variant="awsui-key-label">{inp.name}</Box>
                  <Box variant="code">{String(inp.value)}</Box>
                </div>
              ))}
            </ColumnLayout>
          )}
        </div>
        {benchmark.cSource && (
          <div>
            <Box variant="awsui-key-label">C Source Preview</Box>
            <pre style={{
              marginTop: '4px', padding: '12px', height: '150px', overflow: 'auto',
              fontFamily: "'Courier New', Courier, monospace", fontSize: '13px',
              lineHeight: 1.5, backgroundColor: 'var(--color-background-input-default, #f8f8f8)',
              border: '1px solid var(--color-border-input-default, #ccc)',
              borderRadius: '4px', whiteSpace: 'pre',
            }}>
              {benchmark.cSource}
            </pre>
          </div>
        )}
        <Box>
          <Button variant="primary" onClick={() => onLoadBenchmark(benchmark)}>Load into Editor</Button>
        </Box>
        <Alert type="info" statusIconAriaLabel="Info">
          Benchmark execution requires the C++ simulation engine.
        </Alert>
      </SpaceBetween>
    </ExpandableSection>
  );
}

export default function BenchmarksSection({ benchmarks, onLoadBenchmark }: BenchmarksSectionProps) {
  const [categoryFilter, setCategoryFilter] = useState<SelectOption>(ALL_CATEGORIES_OPTION);
  const [selectedItems, setSelectedItems] = useState<Benchmark[]>([]);

  const filteredBenchmarks = useMemo<Benchmark[]>(() => {
    if (categoryFilter.value === '__all__') return benchmarks;
    return benchmarks.filter((b) => b.category === categoryFilter.value);
  }, [benchmarks, categoryFilter]);

  const selectedBenchmark = selectedItems[0] ?? null;
  const selectedStillVisible = selectedBenchmark !== null && filteredBenchmarks.some((b) => b.id === selectedBenchmark.id);

  function handleCategoryChange(option: SelectOption) {
    setCategoryFilter(option);
    if (selectedBenchmark && option.value !== '__all__' && selectedBenchmark.category !== option.value) {
      setSelectedItems([]);
    }
  }

  const columnDefinitions = [
    { id: 'name', header: 'Name', cell: (item: Benchmark) => item.name, minWidth: 200 },
    {
      id: 'category', header: 'Category', minWidth: 140,
      cell: (item: Benchmark) => (
        <Badge color={CATEGORY_BADGE_COLORS[item.category]}>{CATEGORY_LABELS[item.category]}</Badge>
      ),
    },
    {
      id: 'description', header: 'Description', minWidth: 260,
      cell: (item: Benchmark) => (
        <Box color="text-body-secondary" display="inline">
          {item.description.length > 80 ? item.description.slice(0, 80) + '…' : item.description}
        </Box>
      ),
    },
    {
      id: 'expectedOutput', header: 'Expected Output', minWidth: 130,
      cell: (item: Benchmark) => <Box variant="code" fontWeight="bold">{item.expectedOutput}</Box>,
    },
    {
      id: 'status', header: 'Status', minWidth: 120,
      cell: (item: Benchmark) => (
        <StatusIndicator type={STATUS_TYPE_MAP[item.status]}>{STATUS_LABEL_MAP[item.status]}</StatusIndicator>
      ),
    },
  ];

  return (
    <SpaceBetween size="l">
      <Box variant="p" color="text-body-secondary">
        Controlled benchmark suite for systematic architecture comparison. Load a benchmark to run it on the Register VM, Stack VM, or both.
      </Box>
      <SpaceBetween direction="horizontal" size="xs">
        <Box variant="awsui-key-label" padding={{ top: 'xs' }}>Category</Box>
        <Select
          selectedOption={categoryFilter}
          onChange={({ detail }) => handleCategoryChange(detail.selectedOption as SelectOption)}
          options={CATEGORY_OPTIONS}
          ariaLabel="Filter benchmarks by category"
        />
      </SpaceBetween>
      <Table<Benchmark>
        columnDefinitions={columnDefinitions}
        items={filteredBenchmarks}
        trackBy="id"
        variant="embedded"
        selectionType="single"
        selectedItems={selectedStillVisible && selectedBenchmark ? [selectedBenchmark] : []}
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
        onRowClick={({ detail }) => setSelectedItems([detail.item])}
        empty={
          <Box textAlign="center" color="inherit" padding="xl">
            <SpaceBetween size="s">
              <Box variant="strong" color="inherit">No benchmarks found</Box>
              <Box variant="p" color="inherit">No benchmarks match the selected category filter.</Box>
              <Button onClick={() => setCategoryFilter(ALL_CATEGORIES_OPTION)}>Clear filter</Button>
            </SpaceBetween>
          </Box>
        }
        ariaLabels={{
          tableLabel: 'Benchmark suite table',
          selectionGroupLabel: 'Benchmark selection',
          itemSelectionLabel: ({ selectedItems: sel }, item) => `${item.name} is ${sel.includes(item) ? '' : 'not '}selected`,
          activateEditLabel: () => '', cancelEditLabel: () => '', submitEditLabel: () => '',
        }}
      />
      {selectedStillVisible && selectedBenchmark !== null && (
        <BenchmarkDetailPanel benchmark={selectedBenchmark} onLoadBenchmark={onLoadBenchmark} />
      )}
    </SpaceBetween>
  );
}
