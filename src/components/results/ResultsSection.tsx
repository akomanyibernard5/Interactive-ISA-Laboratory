import { useState, useMemo } from 'react';
import Alert from '@cloudscape-design/components/alert';
import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import ExpandableSection from '@cloudscape-design/components/expandable-section';
import Pagination from '@cloudscape-design/components/pagination';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Table from '@cloudscape-design/components/table';

import type { ExperimentResult, ValidationStatus, ArchitectureId } from '../../types';

// ─── Status / architecture helpers ───────────────────────────────────────────

type CloudscapeStatusType =
  | 'success'
  | 'error'
  | 'pending'
  | 'warning'
  | 'info'
  | 'stopped'
  | 'in-progress'
  | 'loading';

const VALIDATION_STATUS_MAP: Record<ValidationStatus, CloudscapeStatusType> = {
  valid: 'success',
  invalid: 'error',
  pending: 'pending',
};

const VALIDATION_LABEL_MAP: Record<ValidationStatus, string> = {
  valid: 'Valid',
  invalid: 'Invalid',
  pending: 'Pending',
};

// ─── Filter option helpers ────────────────────────────────────────────────────

interface SelectOption {
  label: string;
  value: string;
}

const ALL_OPTION: SelectOption = { label: 'All', value: '__all__' };

const ARCHITECTURE_OPTIONS: SelectOption[] = [
  ALL_OPTION,
  { label: 'Register', value: 'register' satisfies ArchitectureId },
  { label: 'Stack', value: 'stack' satisfies ArchitectureId },
];

const VALIDATION_OPTIONS: SelectOption[] = [
  ALL_OPTION,
  { label: 'Valid', value: 'valid' satisfies ValidationStatus },
  { label: 'Invalid', value: 'invalid' satisfies ValidationStatus },
  { label: 'Pending', value: 'pending' satisfies ValidationStatus },
];

// ─── Pagination helpers ───────────────────────────────────────────────────────

const PAGE_SIZE = 10;

function paginate<T>(items: T[], page: number): T[] {
  const start = (page - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ResultsSectionProps {
  results: ExperimentResult[];
  expanded: boolean;
  onToggle: () => void;
}

// ─── Column definitions ───────────────────────────────────────────────────────

const COLUMN_DEFINITIONS = [
  {
    id: 'benchmarkName',
    header: 'Benchmark',
    cell: (item: ExperimentResult) => item.benchmarkName,
    minWidth: 200,
  },
  {
    id: 'architectureId',
    header: 'Architecture',
    cell: (item: ExperimentResult) => (
      <Badge color={item.architectureId === 'register' ? 'blue' : 'green'}>
        {item.architectureId === 'register' ? 'Register' : 'Stack'}
      </Badge>
    ),
    minWidth: 120,
  },
  {
    id: 'inputDescription',
    header: 'Input',
    cell: (item: ExperimentResult) => item.inputDescription,
    minWidth: 120,
  },
  {
    id: 'validationStatus',
    header: 'Validation',
    cell: (item: ExperimentResult) => (
      <StatusIndicator type={VALIDATION_STATUS_MAP[item.validationStatus]}>
        {VALIDATION_LABEL_MAP[item.validationStatus]}
      </StatusIndicator>
    ),
    minWidth: 110,
  },
  {
    id: 'programSizeBytes',
    header: 'Program Size (bytes)',
    cell: (item: ExperimentResult) => item.programSizeBytes,
    minWidth: 130,
  },
  {
    id: 'dynamicInstructionCount',
    header: 'Instructions',
    cell: (item: ExperimentResult) => item.dynamicInstructionCount,
    minWidth: 100,
  },
  {
    id: 'memoryReads',
    header: 'Mem Reads',
    cell: (item: ExperimentResult) => item.memoryReads,
    minWidth: 95,
  },
  {
    id: 'memoryWrites',
    header: 'Mem Writes',
    cell: (item: ExperimentResult) => item.memoryWrites,
    minWidth: 95,
  },
  {
    id: 'branchCount',
    header: 'Branches',
    cell: (item: ExperimentResult) => item.branchCount,
    minWidth: 90,
  },
  {
    id: 'estimatedCost',
    header: 'Est. Cost',
    cell: (item: ExperimentResult) => item.estimatedCost,
    minWidth: 90,
  },
  {
    id: 'costModelName',
    header: 'Cost Model',
    cell: (item: ExperimentResult) => item.costModelName,
    minWidth: 140,
  },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function ResultsSection({
  results,
  expanded,
  onToggle,
}: ResultsSectionProps) {
  const [architectureFilter, setArchitectureFilter] = useState<SelectOption>(ALL_OPTION);
  const [validationFilter, setValidationFilter] = useState<SelectOption>(ALL_OPTION);
  const [currentPage, setCurrentPage] = useState(1);

  // Apply filters
  const filteredResults = useMemo<ExperimentResult[]>(() => {
    return results.filter((r) => {
      const archMatch =
        architectureFilter.value === '__all__' ||
        r.architectureId === architectureFilter.value;
      const valMatch =
        validationFilter.value === '__all__' ||
        r.validationStatus === validationFilter.value;
      return archMatch && valMatch;
    });
  }, [results, architectureFilter, validationFilter]);

  // Reset to page 1 whenever filters change
  const pageCount = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const pageItems = paginate(filteredResults, safePage);

  function handleArchChange(option: SelectOption) {
    setArchitectureFilter(option);
    setCurrentPage(1);
  }

  function handleValChange(option: SelectOption) {
    setValidationFilter(option);
    setCurrentPage(1);
  }

  return (
    <ExpandableSection
      variant="container"
      headerText="Experiment Results"
      expanded={expanded}
      onChange={onToggle}
    >
      <SpaceBetween size="l">

        {/* Demo data alert */}
        <Alert type="info" statusIconAriaLabel="Info">
          Demo data shown. Real results will be produced by the C++ experiment engine.
        </Alert>

        {/* Filter controls */}
        <SpaceBetween direction="horizontal" size="l">
          <SpaceBetween direction="horizontal" size="xs">
            <Box variant="awsui-key-label" padding={{ top: 'xs' }}>
              Architecture
            </Box>
            <Select
              selectedOption={architectureFilter}
              onChange={({ detail }) => handleArchChange(detail.selectedOption as SelectOption)}
              options={ARCHITECTURE_OPTIONS}
              ariaLabel="Filter by architecture"
            />
          </SpaceBetween>

          <SpaceBetween direction="horizontal" size="xs">
            <Box variant="awsui-key-label" padding={{ top: 'xs' }}>
              Validation
            </Box>
            <Select
              selectedOption={validationFilter}
              onChange={({ detail }) => handleValChange(detail.selectedOption as SelectOption)}
              options={VALIDATION_OPTIONS}
              ariaLabel="Filter by validation status"
            />
          </SpaceBetween>
        </SpaceBetween>

        {/* Results table */}
        <Table<ExperimentResult>
          columnDefinitions={COLUMN_DEFINITIONS}
          items={pageItems}
          trackBy="id"
          variant="embedded"
          empty={
            <Box textAlign="center" color="inherit" padding="xl">
              <SpaceBetween size="s">
                <Box variant="strong" color="inherit">
                  No results match the selected filters
                </Box>
                <Box variant="p" color="inherit">
                  Adjust the Architecture or Validation filters above to broaden the search.
                </Box>
              </SpaceBetween>
            </Box>
          }
          ariaLabels={{
            tableLabel: 'Experiment results table',
          }}
        />

        {/* Pagination */}
        {filteredResults.length > PAGE_SIZE && (
          <Box float="right">
            <Pagination
              currentPageIndex={safePage}
              pagesCount={pageCount}
              onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
              ariaLabels={{
                nextPageLabel: 'Next page',
                previousPageLabel: 'Previous page',
                pageLabel: (pageNumber) => `Page ${pageNumber}`,
              }}
            />
          </Box>
        )}

        {/* Footer note */}
        <Box variant="small" color="text-body-secondary">
          Estimated cost values are from an abstract analytical model and do not represent real
          hardware performance.
        </Box>

      </SpaceBetween>
    </ExpandableSection>
  );
}
