import type { ArchitectureId } from './architecture';

export type ValidationStatus = 'valid' | 'invalid' | 'pending';

export interface ExperimentResult {
  id: string;
  benchmarkId: string;
  benchmarkName: string;
  architectureId: ArchitectureId;
  inputDescription: string;
  validationStatus: ValidationStatus;
  programSizeBytes: number;
  dynamicInstructionCount: number;
  memoryReads: number;
  memoryWrites: number;
  branchCount: number;
  estimatedCost: number;
  costModelName: string;
  timestamp: string; // ISO date string
}
