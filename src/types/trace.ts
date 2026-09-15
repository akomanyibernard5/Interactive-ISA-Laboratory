import type { Instruction } from './instruction';
import type { MemoryChange } from './memory';

export interface MetricsSnapshot {
  instructionCount: number;
  memoryReads: number;
  memoryWrites: number;
  branchCount: number;
  stackPushCount: number;  // 0 for register machine
  stackPopCount: number;   // 0 for register machine
}

export interface TraceEntry {
  step: number;
  programCounter: number;
  instruction: Instruction;
  stateBefore: string;   // human-readable summary, e.g. 'R1=0, R2=5'
  stateAfter:  string;
  memoryChanges: MemoryChange[];
  metricsSnapshot: MetricsSnapshot;
}
