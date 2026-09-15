import { useState, useMemo } from 'react';
import Alert from '@cloudscape-design/components/alert';
import Box from '@cloudscape-design/components/box';
import Button from '@cloudscape-design/components/button';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Container from '@cloudscape-design/components/container';
import ContentLayout from '@cloudscape-design/components/content-layout';
import FormField from '@cloudscape-design/components/form-field';
import Header from '@cloudscape-design/components/header';
import Modal from '@cloudscape-design/components/modal';
import CloudscapeSelect from '@cloudscape-design/components/select';
import SpaceBetween from '@cloudscape-design/components/space-between';
import CloudscapeStatusIndicator from '@cloudscape-design/components/status-indicator';
import Table from '@cloudscape-design/components/table';
import TextContent from '@cloudscape-design/components/text-content';

import type { ExperimentResult, ValidationStatus, ArchitectureId } from '../types';
import { MOCK_RESULTS } from '../data';

// ---------------------------------------------------------------------------
// Option type helpers (Cloudscape Select expects { label, value })
// ---------------------------------------------------------------------------

interface SelectOption {
  label: string;
  value: string;
}

const ALL_OPTION: SelectOption = { label: 'All', value: '__all__' };

// Derive benchmark options from the data (deduplicated by id)
const benchmarkOptions: SelectOption[] = [
  ALL_OPTION,
  ...Array.from(
    new Map(
      MOCK_RESULTS.map((r) => [r.benchmarkId, { label: r.benchmarkName, value: r.benchmarkId }])
    ).values()
  ),
];

const architectureOptions: SelectOption[] = [
  ALL_OPTION,
  { label: 'Register', value: 'register' satisfies ArchitectureId },
  { label: 'Stack', value: 'stack' satisfies ArchitectureId },
];

const validationOptions: SelectOption[] = [
  ALL_OPTION,
  { label: 'Valid', value: 'valid' satisfies ValidationStatus },
  { label: 'Invalid', value: 'invalid' satisfies ValidationStatus },
  { label: 'Pending', value: 'pending' satisfies ValidationStatus },
];

// ---------------------------------------------------------------------------
// Validation status → Cloudscape StatusIndicator type mapping
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Timestamp formatter
// ---------------------------------------------------------------------------

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return iso;
  }
}

// ---------------------------------------------------------------------------
// Detail Modal
// ---------------------------------------------------------------------------

interface DetailModalProps {
  result: ExperimentResult;
  onDismiss: () => void;
}

function DetailModal({ result, onDismiss }: DetailModalProps) {
  return (
    <Modal
      visible
      onDismiss={onDismiss}
      header={
        <Header variant="h2">
          Result Details — {result.benchmarkName}
        </Header>
      }
      footer={
        <Box float="right">
          <Button variant="primary" onClick={onDismiss}>
            Close
          </Button>
        </Box>
      }
      size="large"
    >
      <SpaceBetween size="l">
        {/* Identification */}
        <Container header={<Header variant="h3">Identification</Header>}>
          <ColumnLayout columns={2} variant="text-grid">
            <SpaceBetween size="xs">
              <Box variant="awsui-key-label">Result ID</Box>
              <Box variant="p">
                <code>{result.id}</code>
              </Box>
            </SpaceBetween>
            <SpaceBetween size="xs">
              <Box variant="awsui-key-label">Benchmark</Box>
              <Box variant="p">{result.benchmarkName}</Box>
            </SpaceBetween>
            <SpaceBetween size="xs">
              <Box variant="awsui-key-label">Architecture</Box>
              <Box variant="p">
                {result.architectureId === 'register' ? 'Register Machine' : 'Stack Machine'}
              </Box>
            </SpaceBetween>
            <SpaceBetween size="xs">
              <Box variant="awsui-key-label">Input</Box>
              <Box variant="p">{result.inputDescription}</Box>
            </SpaceBetween>
            <SpaceBetween size="xs">
              <Box variant="awsui-key-label">Validation Status</Box>
              <CloudscapeStatusIndicator type={VALIDATION_STATUS_MAP[result.validationStatus]}>
                {VALIDATION_LABEL_MAP[result.validationStatus]}
              </CloudscapeStatusIndicator>
            </SpaceBetween>
            <SpaceBetween size="xs">
              <Box variant="awsui-key-label">Timestamp</Box>
              <Box variant="p">{formatTimestamp(result.timestamp)}</Box>
            </SpaceBetween>
          </ColumnLayout>
        </Container>

        {/* Execution Measurements */}
        <Container header={<Header variant="h3">Execution Measurements</Header>}>
          <ColumnLayout columns={3} variant="text-grid">
            <SpaceBetween size="xs">
              <Box variant="awsui-key-label">Program Size</Box>
              <Box variant="p">{result.programSizeBytes} bytes</Box>
            </SpaceBetween>
            <SpaceBetween size="xs">
              <Box variant="awsui-key-label">Instruction Count</Box>
              <Box variant="p">{result.dynamicInstructionCount}</Box>
            </SpaceBetween>
            <SpaceBetween size="xs">
              <Box variant="awsui-key-label">Memory Reads</Box>
              <Box variant="p">{result.memoryReads}</Box>
            </SpaceBetween>
            <SpaceBetween size="xs">
              <Box variant="awsui-key-label">Memory Writes</Box>
              <Box variant="p">{result.memoryWrites}</Box>
            </SpaceBetween>
            <SpaceBetween size="xs">
              <Box variant="awsui-key-label">Branch Count</Box>
              <Box variant="p">{result.branchCount}</Box>
            </SpaceBetween>
          </ColumnLayout>
        </Container>

        {/* Cost Model Parameters */}
        <Container
          header={
            <Header
              variant="h3"
              description="Values are derived from an abstract analytical model and do not represent real hardware performance."
            >
              Abstract Cost Model
            </Header>
          }
        >
          <ColumnLayout columns={2} variant="text-grid">
            <SpaceBetween size="xs">
              <Box variant="awsui-key-label">Cost Model Name</Box>
              <Box variant="p">{result.costModelName}</Box>
            </SpaceBetween>
            <SpaceBetween size="xs">
              <Box variant="awsui-key-label">Estimated Cost</Box>
              <Box variant="p">{result.estimatedCost}</Box>
            </SpaceBetween>
          </ColumnLayout>
        </Container>

        {/* Footer disclaimer */}
        <Box variant="small" color="text-body-secondary">
          Estimated cost values are derived from an abstract analytical model and do not represent
          real hardware performance.
        </Box>
      </SpaceBetween>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ResultsPage() {
  // Filter state
  const [architectureFilter, setArchitectureFilter] = useState<SelectOption>(ALL_OPTION);
  const [benchmarkFilter, setBenchmarkFilter] = useState<SelectOption>(ALL_OPTION);
  const [validationFilter, setValidationFilter] = useState<SelectOption>(ALL_OPTION);

  // Selection / detail modal
  const [selectedItems, setSelectedItems] = useState<ExperimentResult[]>([]);
  const [detailResult, setDetailResult] = useState<ExperimentResult | null>(null);

  // Apply all active filters simultaneously
  const filteredResults = useMemo<ExperimentResult[]>(() => {
    return MOCK_RESULTS.filter((r) => {
      const archMatch =
        architectureFilter.value === '__all__' ||
        r.architectureId === architectureFilter.value;
      const benchMatch =
        benchmarkFilter.value === '__all__' ||
        r.benchmarkId === benchmarkFilter.value;
      const valMatch =
        validationFilter.value === '__all__' ||
        r.validationStatus === validationFilter.value;
      return archMatch && benchMatch && valMatch;
    });
  }, [architectureFilter, benchmarkFilter, validationFilter]);

  function handleSelectionChange(items: ExperimentResult[]) {
    setSelectedItems(items);
    if (items.length > 0) {
      setDetailResult(items[0]);
    }
  }

  return (
    <>
      <ContentLayout
        header={
          <Header
            variant="h1"
            description="Browse and inspect completed experiment measurements collected from the register and stack machine simulations."
          >
            Experiment Results
          </Header>
        }
      >
        <SpaceBetween size="l">
          {/* Demonstration data notice */}
          <Alert type="info" statusIconAriaLabel="Info">
            Results shown are demonstration data. Actual experimental results will be produced by
            the C++ simulation engine.
          </Alert>

          {/* Filter controls */}
          <Container header={<Header variant="h2">Filters</Header>}>
            <SpaceBetween direction="horizontal" size="l">
              <FormField label="Architecture">
                <CloudscapeSelect
                  selectedOption={architectureFilter}
                  onChange={({ detail }) =>
                    setArchitectureFilter(detail.selectedOption as SelectOption)
                  }
                  options={architectureOptions}
                  ariaLabel="Filter by architecture"
                />
              </FormField>

              <FormField label="Benchmark">
                <CloudscapeSelect
                  selectedOption={benchmarkFilter}
                  onChange={({ detail }) =>
                    setBenchmarkFilter(detail.selectedOption as SelectOption)
                  }
                  options={benchmarkOptions}
                  ariaLabel="Filter by benchmark"
                />
              </FormField>

              <FormField label="Validation Status">
                <CloudscapeSelect
                  selectedOption={validationFilter}
                  onChange={({ detail }) =>
                    setValidationFilter(detail.selectedOption as SelectOption)
                  }
                  options={validationOptions}
                  ariaLabel="Filter by validation status"
                />
              </FormField>
            </SpaceBetween>
          </Container>

          {/* Results table */}
          <Table<ExperimentResult>
            items={filteredResults}
            trackBy="id"
            selectionType="single"
            selectedItems={selectedItems}
            onSelectionChange={({ detail }) => handleSelectionChange(detail.selectedItems)}
            header={
              <Header
                variant="h2"
                counter={`(${filteredResults.length})`}
                description="Select a row to view full result details."
                actions={
                  selectedItems.length > 0 ? (
                    <Button
                      onClick={() => setDetailResult(selectedItems[0])}
                    >
                      View Details
                    </Button>
                  ) : undefined
                }
              >
                Results
              </Header>
            }
            empty={
              <Box textAlign="center" color="inherit">
                <Box variant="strong" textAlign="center" color="inherit">
                  No results match the selected filters
                </Box>
                <Box variant="p" padding={{ bottom: 's' }} color="inherit">
                  Adjust the filter controls above to broaden the search.
                </Box>
              </Box>
            }
            columnDefinitions={[
              {
                id: 'benchmarkName',
                header: 'Benchmark',
                cell: (item) => item.benchmarkName,
                sortingField: 'benchmarkName',
                minWidth: 220,
              },
              {
                id: 'architectureId',
                header: 'Architecture',
                cell: (item) =>
                  item.architectureId === 'register' ? 'Register' : 'Stack',
                sortingField: 'architectureId',
              },
              {
                id: 'inputDescription',
                header: 'Input',
                cell: (item) => item.inputDescription,
              },
              {
                id: 'validationStatus',
                header: 'Validation',
                cell: (item) => (
                  <CloudscapeStatusIndicator
                    type={VALIDATION_STATUS_MAP[item.validationStatus]}
                  >
                    {VALIDATION_LABEL_MAP[item.validationStatus]}
                  </CloudscapeStatusIndicator>
                ),
              },
              {
                id: 'programSizeBytes',
                header: 'Program Size (bytes)',
                cell: (item) => item.programSizeBytes,
                sortingField: 'programSizeBytes',
              },
              {
                id: 'dynamicInstructionCount',
                header: 'Instruction Count',
                cell: (item) => item.dynamicInstructionCount,
                sortingField: 'dynamicInstructionCount',
              },
              {
                id: 'memoryReads',
                header: 'Memory Reads',
                cell: (item) => item.memoryReads,
                sortingField: 'memoryReads',
              },
              {
                id: 'memoryWrites',
                header: 'Memory Writes',
                cell: (item) => item.memoryWrites,
                sortingField: 'memoryWrites',
              },
              {
                id: 'branchCount',
                header: 'Branch Count',
                cell: (item) => item.branchCount,
                sortingField: 'branchCount',
              },
              {
                id: 'estimatedCost',
                header: 'Estimated Cost',
                cell: (item) => item.estimatedCost,
                sortingField: 'estimatedCost',
              },
              {
                id: 'costModelName',
                header: 'Cost Model',
                cell: (item) => item.costModelName,
              },
              {
                id: 'timestamp',
                header: 'Timestamp',
                cell: (item) => formatTimestamp(item.timestamp),
                sortingField: 'timestamp',
                minWidth: 180,
              },
            ]}
          />

          {/* Footer disclaimer */}
          <TextContent>
            <Box variant="small" color="text-body-secondary">
              <strong>Note:</strong> Estimated cost values are derived from an abstract analytical
              model and do not represent real hardware performance.
            </Box>
          </TextContent>
        </SpaceBetween>
      </ContentLayout>

      {/* Detail modal — rendered outside ContentLayout to avoid stacking context issues */}
      {detailResult !== null && (
        <DetailModal
          result={detailResult}
          onDismiss={() => {
            setDetailResult(null);
            setSelectedItems([]);
          }}
        />
      )}
    </>
  );
}
