// DEMONSTRATION DATA — not measured experimental results
// Demo computation: x = (a + b) × c  where a=3, b=5, c=2  →  x=16
//
// 7 TraceEntry records per architecture — one per instruction.
// MetricsSnapshot values are CUMULATIVE totals at each step.
// stateBefore/stateAfter are human-readable summary strings.

import type { TraceEntry } from '../types';
import { MOCK_REGISTER_PROGRAM, MOCK_STACK_PROGRAM } from './mockPrograms';
import { MOCK_MEMORY_CHANGES } from './mockMemory';

const regI = (i: number) => MOCK_REGISTER_PROGRAM.instructions[i];
const stkI = (i: number) => MOCK_STACK_PROGRAM.instructions[i];

// ---------------------------------------------------------------------------
// Register Machine Trace
// ---------------------------------------------------------------------------
export const MOCK_REGISTER_TRACE: TraceEntry[] = [
  // Step 1: LOAD_CONSTANT R1, #3
  {
    step: 1,
    programCounter: 0x0000,
    instruction: regI(0),
    stateBefore: 'R1=0, R2=0, R3=0, R4=0, R5=0',
    stateAfter:  'R1=3, R2=0, R3=0, R4=0, R5=0',
    memoryChanges: [],
    metricsSnapshot: {
      instructionCount: 1,
      memoryReads: 0,
      memoryWrites: 0,
      branchCount: 0,
      stackPushCount: 0,
      stackPopCount: 0,
    },
  },
  // Step 2: LOAD_CONSTANT R2, #5
  {
    step: 2,
    programCounter: 0x0004,
    instruction: regI(1),
    stateBefore: 'R1=3, R2=0, R3=0, R4=0, R5=0',
    stateAfter:  'R1=3, R2=5, R3=0, R4=0, R5=0',
    memoryChanges: [],
    metricsSnapshot: {
      instructionCount: 2,
      memoryReads: 0,
      memoryWrites: 0,
      branchCount: 0,
      stackPushCount: 0,
      stackPopCount: 0,
    },
  },
  // Step 3: ADD R3, R1, R2
  {
    step: 3,
    programCounter: 0x0008,
    instruction: regI(2),
    stateBefore: 'R1=3, R2=5, R3=0, R4=0, R5=0',
    stateAfter:  'R1=3, R2=5, R3=8, R4=0, R5=0',
    memoryChanges: [],
    metricsSnapshot: {
      instructionCount: 3,
      memoryReads: 0,
      memoryWrites: 0,
      branchCount: 0,
      stackPushCount: 0,
      stackPopCount: 0,
    },
  },
  // Step 4: LOAD_CONSTANT R4, #2
  {
    step: 4,
    programCounter: 0x000C,
    instruction: regI(3),
    stateBefore: 'R1=3, R2=5, R3=8, R4=0, R5=0',
    stateAfter:  'R1=3, R2=5, R3=8, R4=2, R5=0',
    memoryChanges: [],
    metricsSnapshot: {
      instructionCount: 4,
      memoryReads: 0,
      memoryWrites: 0,
      branchCount: 0,
      stackPushCount: 0,
      stackPopCount: 0,
    },
  },
  // Step 5: MUL R5, R3, R4
  {
    step: 5,
    programCounter: 0x0010,
    instruction: regI(4),
    stateBefore: 'R1=3, R2=5, R3=8, R4=2, R5=0',
    stateAfter:  'R1=3, R2=5, R3=8, R4=2, R5=16',
    memoryChanges: [],
    metricsSnapshot: {
      instructionCount: 5,
      memoryReads: 0,
      memoryWrites: 0,
      branchCount: 0,
      stackPushCount: 0,
      stackPopCount: 0,
    },
  },
  // Step 6: STORE_VARIABLE R5, x
  {
    step: 6,
    programCounter: 0x0014,
    instruction: regI(5),
    stateBefore: 'R1=3, R2=5, R3=8, R4=2, R5=16',
    stateAfter:  'R1=3, R2=5, R3=8, R4=2, R5=16 | mem[0x0100]=16',
    memoryChanges: [MOCK_MEMORY_CHANGES[0]],
    metricsSnapshot: {
      instructionCount: 6,
      memoryReads: 0,
      memoryWrites: 1,
      branchCount: 0,
      stackPushCount: 0,
      stackPopCount: 0,
    },
  },
  // Step 7: HALT
  {
    step: 7,
    programCounter: 0x0018,
    instruction: regI(6),
    stateBefore: 'R1=3, R2=5, R3=8, R4=2, R5=16 | mem[0x0100]=16',
    stateAfter:  'HALTED',
    memoryChanges: [],
    metricsSnapshot: {
      instructionCount: 7,
      memoryReads: 0,
      memoryWrites: 1,
      branchCount: 0,
      stackPushCount: 0,
      stackPopCount: 0,
    },
  },
];

// ---------------------------------------------------------------------------
// Stack Machine Trace
// ---------------------------------------------------------------------------
export const MOCK_STACK_TRACE: TraceEntry[] = [
  // Step 1: LOAD_CONSTANT #3  →  push 3
  {
    step: 1,
    programCounter: 0x0000,
    instruction: stkI(0),
    stateBefore: 'stack=[]',
    stateAfter:  'stack=[3]',
    memoryChanges: [],
    metricsSnapshot: {
      instructionCount: 1,
      memoryReads: 0,
      memoryWrites: 0,
      branchCount: 0,
      stackPushCount: 1,
      stackPopCount: 0,
    },
  },
  // Step 2: LOAD_CONSTANT #5  →  push 5
  {
    step: 2,
    programCounter: 0x0003,
    instruction: stkI(1),
    stateBefore: 'stack=[3]',
    stateAfter:  'stack=[3, 5]',
    memoryChanges: [],
    metricsSnapshot: {
      instructionCount: 2,
      memoryReads: 0,
      memoryWrites: 0,
      branchCount: 0,
      stackPushCount: 2,
      stackPopCount: 0,
    },
  },
  // Step 3: ADD  →  pop 5,3 push 8
  {
    step: 3,
    programCounter: 0x0006,
    instruction: stkI(2),
    stateBefore: 'stack=[3, 5]',
    stateAfter:  'stack=[8]',
    memoryChanges: [],
    metricsSnapshot: {
      instructionCount: 3,
      memoryReads: 0,
      memoryWrites: 0,
      branchCount: 0,
      stackPushCount: 3,
      stackPopCount: 2,
    },
  },
  // Step 4: LOAD_CONSTANT #2  →  push 2
  {
    step: 4,
    programCounter: 0x0007,
    instruction: stkI(3),
    stateBefore: 'stack=[8]',
    stateAfter:  'stack=[8, 2]',
    memoryChanges: [],
    metricsSnapshot: {
      instructionCount: 4,
      memoryReads: 0,
      memoryWrites: 0,
      branchCount: 0,
      stackPushCount: 4,
      stackPopCount: 2,
    },
  },
  // Step 5: MUL  →  pop 2,8 push 16
  {
    step: 5,
    programCounter: 0x000A,
    instruction: stkI(4),
    stateBefore: 'stack=[8, 2]',
    stateAfter:  'stack=[16]',
    memoryChanges: [],
    metricsSnapshot: {
      instructionCount: 5,
      memoryReads: 0,
      memoryWrites: 0,
      branchCount: 0,
      stackPushCount: 5,
      stackPopCount: 4,
    },
  },
  // Step 6: STORE_VARIABLE x  →  pop 16, write mem[0x0100]=16
  {
    step: 6,
    programCounter: 0x000B,
    instruction: stkI(5),
    stateBefore: 'stack=[16]',
    stateAfter:  'stack=[] | mem[0x0100]=16',
    memoryChanges: [MOCK_MEMORY_CHANGES[1]],
    metricsSnapshot: {
      instructionCount: 6,
      memoryReads: 0,
      memoryWrites: 1,
      branchCount: 0,
      stackPushCount: 5,
      stackPopCount: 5,
    },
  },
  // Step 7: HALT
  {
    step: 7,
    programCounter: 0x000E,
    instruction: stkI(6),
    stateBefore: 'stack=[] | mem[0x0100]=16',
    stateAfter:  'HALTED',
    memoryChanges: [],
    metricsSnapshot: {
      instructionCount: 7,
      memoryReads: 0,
      memoryWrites: 1,
      branchCount: 0,
      stackPushCount: 5,
      stackPopCount: 5,
    },
  },
];
