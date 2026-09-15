import type { MachineState, ExecutionStatus } from './machine';
import type { ExecutionMetrics } from './metrics';
import type { TraceEntry } from './trace';
import type { MemoryChange } from './memory';
import type { TranslationResult } from './translation';

/** Which architecture mode the lab is operating in */
export type RunMode = 'register' | 'stack' | 'both';

/** Top-level laboratory state — one slot per architecture in 'both' mode */
export interface LabState {
  runMode: RunMode;
  registerState: MachineState | null;
  stackState: MachineState | null;
  registerMetrics: ExecutionMetrics | null;
  stackMetrics: ExecutionMetrics | null;
  registerTrace: TraceEntry[];
  stackTrace: TraceEntry[];
  memoryChanges: MemoryChange[];
  translation: TranslationResult | null;
  executionStatus: ExecutionStatus;
  currentStep: number;
}

/** Which expandable sections are open */
export interface SectionExpansionState {
  translation: boolean;
  execution: boolean;
  machineState: boolean;
  memory: boolean;
  trace: boolean;
  metrics: boolean;
  comparison: boolean;
  benchmarks: boolean;
  results: boolean;
}
