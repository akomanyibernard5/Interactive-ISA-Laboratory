// DEMONSTRATION DATA — not measured experimental results
// Demo computation: x = (a + b) × c  where a=3, b=5, c=2  →  x=16
//
// Intentional demo contrast:
//   Register machine: larger program (26 bytes) but fewer dynamic operations (7 instructions,
//                     0 stack operations, 1 memory write).
//   Stack machine:    smaller program (15 bytes) but more dynamic operations (7 instructions,
//                     5 pushes + 5 pops = 10 stack operations, 1 memory write).
//
// estimatedCost is a placeholder — the real experiment engine will compute it.

import type { CostModel, ExecutionMetrics } from '../types';

// ---------------------------------------------------------------------------
// Cost Model
// ---------------------------------------------------------------------------
// DEMONSTRATION cost model — weights are illustrative, not empirically derived.
export const DEMO_COST_MODEL: CostModel = {
  name: 'Demo Cost Model',
  instructionCost: 1,
  memoryReadCost: 2,
  memoryWriteCost: 3,
};

// ---------------------------------------------------------------------------
// Register Machine Metrics
// ---------------------------------------------------------------------------
export const MOCK_REGISTER_METRICS: ExecutionMetrics = {
  // 6 × 4-byte instructions + 1 × 2-byte HALT = 26 bytes  (DEMO value)
  programSizeBytes: 26,

  // 7 instructions execute in sequence — no branches, no loops  (DEMO value)
  dynamicInstructionCount: 7,

  // No LOAD_VARIABLE instructions in this program  (DEMO value)
  memoryReads: 0,

  // One STORE_VARIABLE (R5 → x)  (DEMO value)
  memoryWrites: 1,

  // No branches in this program  (DEMO value)
  branchCount: 0,

  // Register machine does not use a stack  (DEMO value)
  stackPushCount: 0,
  stackPopCount: 0,

  // Placeholder — future experiment engine fills this in
  estimatedCost: 0,
  costModelName: 'Demo Cost Model',
};

// ---------------------------------------------------------------------------
// Stack Machine Metrics
// ---------------------------------------------------------------------------
export const MOCK_STACK_METRICS: ExecutionMetrics = {
  // 3+3+1+3+1+3+1 = 15 bytes  (DEMO value)
  programSizeBytes: 15,

  // 7 instructions, same sequence length as register version  (DEMO value)
  dynamicInstructionCount: 7,

  // No LOAD_VARIABLE instructions  (DEMO value)
  memoryReads: 0,

  // One STORE_VARIABLE (pop → x)  (DEMO value)
  memoryWrites: 1,

  // No branches  (DEMO value)
  branchCount: 0,

  // LOAD_CONSTANT×3 pushes + ADD push + MUL push = 5 pushes  (DEMO value)
  stackPushCount: 5,

  // ADD pops 2, MUL pops 2, STORE_VARIABLE pops 1 = 5 pops  (DEMO value)
  stackPopCount: 5,

  // Placeholder — future experiment engine fills this in
  estimatedCost: 0,
  costModelName: 'Demo Cost Model',
};
