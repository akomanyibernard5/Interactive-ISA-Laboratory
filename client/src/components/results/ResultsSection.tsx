import { useState, useMemo } from 'react';
import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import Pagination from '@cloudscape-design/components/pagination';
import Select from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import StatusIndicator from '@cloudscape-design/components/status-indicator';
import Table from '@cloudscape-design/components/table';
import type { ExperimentResult, ValidationStatus, ArchitectureId } from '../../utils/types';

type CSStatus = 'success' | 'error' | 'pending' | 'warning' | 'info' | 'stopped' | 'in-progress' | 'loading';

const VALIDATION_STATUS_MAP: Record<ValidationStatus, CSStatus> = {
  valid: 'success', invalid: 'error', pending: 'pending',
};
const VALIDATION_LABEL_MAP: Record<ValidationStatus, string> = {
  valid: 'Valid', invalid: 'Invalid', pending: 'Pending',
};

interface SelectOption { label: string; value: string; }
const ALL_OPTION: SelectOption = { label: 'All', value: '__all__' };

const ARCHITECTURE_OPTIONS: SelectOption[] = [
  ALL_OPTION,
  { label: 'Register', value: 'register' satisfies ArchitectureId },
  { label: 'Stack',    value: 'stack'    satisfies ArchitectureId },
];
const VALIDATION_OPTIONS: SelectOption[] = [
  ALL_OPTION,
  { label: 'Valid',   value: 'valid'   satisfies ValidationStatus },
  { label: 'Invalid', value: 'invalid' satisfies ValidationStatus },
  { label: 'Pending', value: 'pending' satisfies ValidationStatus },
];

const PAGE_SIZE = 10;
function paginate<T>(items: T[], page: number): T[] {
  return items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
}

interface ResultsSectionProps {
  results: ExperimentResult[];
}

const COLUMN_DEFINITIONS = [
  { id: 'benchmarkName',          header: 'Benchmark',           cell: (i: ExperimentResult) => i.benchmarkName,            minWidth: 200 },
  { id: 'architectureId',         header: 'Architecture',        minWidth: 120,
    cell: (i: ExperimentResult) => <Badge color={i.architectureId === 'register' ? 'blue' : 'green'}>{i.architectureId === 'register' ? 'Register' : 'Stack'}</Badge> },
  { id: 'inputDescription',       header: 'Input',               cell: (i: ExperimentResult) => i.inputDescription,          minWidth: 120 },
  { id: 'validationStatus',       header: 'Validation',          minWidth: 110,
    cell: (i: ExperimentResult) => <StatusIndicator type={VALIDATION_STATUS_MAP[i.validationStatus]}>{VALIDATION_LABEL_MAP[i.validationStatus]}</StatusIndicator> },
  { id: 'programSizeBytes',       header: 'Size (bytes)',        cell: (i: ExperimentResult) => i.programSizeBytes,           minWidth: 110 },
  { id: 'dynamicInstructionCount',header: 'Instructions',        cell: (i: ExperimentResult) => i.dynamicInstructionCount,   minWidth: 100 },
  { id: 'memoryReads',            header: 'Mem Reads',           cell: (i: ExperimentResult) => i.memoryReads,               minWidth: 95  },
  { id: 'memoryWrites',           header: 'Mem Writes',          cell: (i: ExperimentResult) => i.memoryWrites,              minWidth: 95  },
  { id: 'branchCount',            header: 'Branches',            cell: (i: ExperimentResult) => i.branchCount,               minWidth: 90  },
  { id: 'estimatedCost',          header: 'Est. Cost',           cell: (i: ExperimentResult) => i.estimatedCost,             minWidth: 90  },
  { id: 'costModelName',          header: 'Cost Model',          cell: (i: ExperimentResult) => i.costModelName,             minWidth: 140 },
];

export default function ResultsSection({ results }: ResultsSectionProps) {
  const [architectureFilter, setArchitectureFilter] = useState<SelectOption>(ALL_OPTION);
  const [validationFilter,   setValidationFilter]   = useState<SelectOption>(ALL_OPTION);
  const [currentPage,        setCurrentPage]        = useState(1);

  const filteredResults = useMemo<ExperimentResult[]>(() => results.filter((r) => {
    const archMatch = architectureFilter.value === '__all__' || r.architectureId === architectureFilter.value;
    const valMatch  = validationFilter.value   === '__all__' || r.validationStatus === validationFilter.value;
    return archMatch && valMatch;
  }), [results, architectureFilter, validationFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE));
  const safePage  = Math.min(currentPage, pageCount);
  const pageItems = paginate(filteredResults, safePage);

  function handleArchChange(option: SelectOption) { setArchitectureFilter(option); setCurrentPage(1); }
  function handleValChange(option: SelectOption)  { setValidationFilter(option);   setCurrentPage(1); }

  return (
    <SpaceBetween size="l">
      <SpaceBetween direction="horizontal" size="l">
        <SpaceBetween direction="horizontal" size="xs">
          <Box variant="awsui-key-label" padding={{ top: 'xs' }}>Architecture</Box>
          <Select selectedOption={architectureFilter} onChange={({ detail }) => handleArchChange(detail.selectedOption as SelectOption)} options={ARCHITECTURE_OPTIONS} ariaLabel="Filter by architecture" />
        </SpaceBetween>
        <SpaceBetween direction="horizontal" size="xs">
          <Box variant="awsui-key-label" padding={{ top: 'xs' }}>Validation</Box>
          <Select selectedOption={validationFilter} onChange={({ detail }) => handleValChange(detail.selectedOption as SelectOption)} options={VALIDATION_OPTIONS} ariaLabel="Filter by validation status" />
        </SpaceBetween>
      </SpaceBetween>

      <Table<ExperimentResult>
        columnDefinitions={COLUMN_DEFINITIONS}
        items={pageItems}
        trackBy="id"
        variant="embedded"
        empty={
          <Box textAlign="center" color="inherit" padding="xl">
            <SpaceBetween size="s">
              <Box variant="strong" color="inherit">No results match the selected filters</Box>
              <Box variant="p" color="inherit">Adjust the Architecture or Validation filters above.</Box>
            </SpaceBetween>
          </Box>
        }
        ariaLabels={{ tableLabel: 'Experiment results table' }}
      />

      {filteredResults.length > PAGE_SIZE && (
        <Box float="right">
          <Pagination
            currentPageIndex={safePage}
            pagesCount={pageCount}
            onChange={({ detail }) => setCurrentPage(detail.currentPageIndex)}
            ariaLabels={{ nextPageLabel: 'Next page', previousPageLabel: 'Previous page', pageLabel: (n) => `Page ${n}` }}
          />
        </Box>
      )}

      <Box variant="small" color="text-body-secondary">
        Estimated cost is supplied by the experiment engine.
      </Box>
    </SpaceBetween>
  );
}
