import type { MachineState } from './machine';
import type { ExecutionMetrics } from './metrics';
import type { TraceEntry } from './trace';
import type { Program } from './instruction';

/**
 * Frontend-facing simulator interface.
 * The current implementation uses mock data.
 * The future implementation will delegate to the C++ simulation engine via WebAssembly.
 * Replacing the mock with WebAssembly must not require changes to UI components.
 */
export interface ISimulator {
  load(program: Program): void;
  reset(): void;
  step(): MachineState;
  run(): MachineState;
  getState(): MachineState;
  getMetrics(): ExecutionMetrics;
  getTrace(): TraceEntry[];
  isLoaded(): boolean;
}
