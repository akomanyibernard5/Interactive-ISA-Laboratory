// DEMONSTRATION DATA — not measured experimental results
// These entries represent the 'arithmetic' benchmark (the only completed one).
// Values are illustrative placeholders for UI development and testing.
//
// Two architectures × three input configurations = 6 results.
// Input configs:
//   Config A: a=3, b=5, c=2  →  x=16  (the canonical demo inputs)
//   Config B: a=4, b=6, c=3  →  x=30  (alternate demo inputs)
//   Config C: a=1, b=1, c=1  →  x=2   (minimal demo inputs)

import type { ExperimentResult } from '../types';

export const MOCK_RESULTS: ExperimentResult[] = [
  // --- Register machine, Config A: a=3, b=5, c=2 → x=16 ---
  {
    id: 'res-reg-arith-a',
    benchmarkId: 'bench-arithmetic-01',
    benchmarkName: 'Basic Arithmetic: x = (a + b) × c',
    architectureId: 'register',
    inputDescription: 'a=3, b=5, c=2',
    validationStatus: 'valid',
    programSizeBytes: 26,         // DEMO value
    dynamicInstructionCount: 7,   // DEMO value
    memoryReads: 0,               // DEMO value
    memoryWrites: 1,              // DEMO value
    branchCount: 0,               // DEMO value
    estimatedCost: 0,             // placeholder — experiment engine not yet wired
    costModelName: 'Demo Cost Model',
    timestamp: '2026-09-15T12:00:00.000Z',
  },

  // --- Stack machine, Config A: a=3, b=5, c=2 → x=16 ---
  {
    id: 'res-stk-arith-a',
    benchmarkId: 'bench-arithmetic-01',
    benchmarkName: 'Basic Arithmetic: x = (a + b) × c',
    architectureId: 'stack',
    inputDescription: 'a=3, b=5, c=2',
    validationStatus: 'valid',
    programSizeBytes: 15,         // DEMO value
    dynamicInstructionCount: 7,   // DEMO value
    memoryReads: 0,               // DEMO value
    memoryWrites: 1,              // DEMO value
    branchCount: 0,               // DEMO value
    estimatedCost: 0,             // placeholder
    costModelName: 'Demo Cost Model',
    timestamp: '2026-09-15T12:00:05.000Z',
  },

  // --- Register machine, Config B: a=4, b=6, c=3 → x=30 ---
  {
    id: 'res-reg-arith-b',
    benchmarkId: 'bench-arithmetic-01',
    benchmarkName: 'Basic Arithmetic: x = (a + b) × c',
    architectureId: 'register',
    inputDescription: 'a=4, b=6, c=3',
    validationStatus: 'valid',
    programSizeBytes: 26,         // DEMO value (same program, different constants)
    dynamicInstructionCount: 7,   // DEMO value
    memoryReads: 0,               // DEMO value
    memoryWrites: 1,              // DEMO value
    branchCount: 0,               // DEMO value
    estimatedCost: 0,             // placeholder
    costModelName: 'Demo Cost Model',
    timestamp: '2026-09-15T12:01:00.000Z',
  },

  // --- Stack machine, Config B: a=4, b=6, c=3 → x=30 ---
  {
    id: 'res-stk-arith-b',
    benchmarkId: 'bench-arithmetic-01',
    benchmarkName: 'Basic Arithmetic: x = (a + b) × c',
    architectureId: 'stack',
    inputDescription: 'a=4, b=6, c=3',
    validationStatus: 'valid',
    programSizeBytes: 15,         // DEMO value
    dynamicInstructionCount: 7,   // DEMO value
    memoryReads: 0,               // DEMO value
    memoryWrites: 1,              // DEMO value
    branchCount: 0,               // DEMO value
    estimatedCost: 0,             // placeholder
    costModelName: 'Demo Cost Model',
    timestamp: '2026-09-15T12:01:05.000Z',
  },

  // --- Register machine, Config C: a=1, b=1, c=1 → x=2 ---
  {
    id: 'res-reg-arith-c',
    benchmarkId: 'bench-arithmetic-01',
    benchmarkName: 'Basic Arithmetic: x = (a + b) × c',
    architectureId: 'register',
    inputDescription: 'a=1, b=1, c=1',
    validationStatus: 'valid',
    programSizeBytes: 26,         // DEMO value
    dynamicInstructionCount: 7,   // DEMO value
    memoryReads: 0,               // DEMO value
    memoryWrites: 1,              // DEMO value
    branchCount: 0,               // DEMO value
    estimatedCost: 0,             // placeholder
    costModelName: 'Demo Cost Model',
    timestamp: '2026-09-15T12:02:00.000Z',
  },

  // --- Stack machine, Config C: a=1, b=1, c=1 → x=2 ---
  {
    id: 'res-stk-arith-c',
    benchmarkId: 'bench-arithmetic-01',
    benchmarkName: 'Basic Arithmetic: x = (a + b) × c',
    architectureId: 'stack',
    inputDescription: 'a=1, b=1, c=1',
    validationStatus: 'valid',
    programSizeBytes: 15,         // DEMO value
    dynamicInstructionCount: 7,   // DEMO value
    memoryReads: 0,               // DEMO value
    memoryWrites: 1,              // DEMO value
    branchCount: 0,               // DEMO value
    estimatedCost: 0,             // placeholder
    costModelName: 'Demo Cost Model',
    timestamp: '2026-09-15T12:02:05.000Z',
  },
];
