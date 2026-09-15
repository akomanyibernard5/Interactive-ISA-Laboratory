// DEMONSTRATION DATA — not measured experimental results
// Demo computation: x = (a + b) × c  where a=3, b=5, c=2  →  x=16
//
// Each array has 7 elements — one snapshot AFTER each instruction executes.
// step 0 = initial / before first instruction (idle).
// steps 1–6 = after each of the 7 instructions (step 6 = after HALT).

import type { MachineState } from '../types';
import { MOCK_REGISTER_PROGRAM, MOCK_STACK_PROGRAM } from './mockPrograms';

// Helper shorthands
const regInstr = (i: number) => MOCK_REGISTER_PROGRAM.instructions[i] ?? null;
const stkInstr = (i: number) => MOCK_STACK_PROGRAM.instructions[i] ?? null;

// ---------------------------------------------------------------------------
// Register Machine States
// Registers not yet written keep value 0 (power-on default).
// ---------------------------------------------------------------------------
export const MOCK_REGISTER_STATES: MachineState[] = [
  // --- Step 0: initial idle state, about to execute instruction 0 ---
  {
    kind: 'register',
    step: 0,
    status: 'idle',
    currentInstruction: regInstr(0),
    state: {
      programCounter: 0x0000,
      registers: { R0: 0, R1: 0, R2: 0, R3: 0, R4: 0, R5: 0, R6: 0, R7: 0 },
    },
  },
  // --- Step 1: LOAD_CONSTANT R1, #3  →  R1 = 3 ---
  {
    kind: 'register',
    step: 1,
    status: 'paused',
    currentInstruction: regInstr(1),
    state: {
      programCounter: 0x0004,
      registers: { R0: 0, R1: 3, R2: 0, R3: 0, R4: 0, R5: 0, R6: 0, R7: 0 },
    },
  },
  // --- Step 2: LOAD_CONSTANT R2, #5  →  R2 = 5 ---
  {
    kind: 'register',
    step: 2,
    status: 'paused',
    currentInstruction: regInstr(2),
    state: {
      programCounter: 0x0008,
      registers: { R0: 0, R1: 3, R2: 5, R3: 0, R4: 0, R5: 0, R6: 0, R7: 0 },
    },
  },
  // --- Step 3: ADD R3, R1, R2  →  R3 = 8 ---
  {
    kind: 'register',
    step: 3,
    status: 'paused',
    currentInstruction: regInstr(3),
    state: {
      programCounter: 0x000C,
      registers: { R0: 0, R1: 3, R2: 5, R3: 8, R4: 0, R5: 0, R6: 0, R7: 0 },
    },
  },
  // --- Step 4: LOAD_CONSTANT R4, #2  →  R4 = 2 ---
  {
    kind: 'register',
    step: 4,
    status: 'paused',
    currentInstruction: regInstr(4),
    state: {
      programCounter: 0x0010,
      registers: { R0: 0, R1: 3, R2: 5, R3: 8, R4: 2, R5: 0, R6: 0, R7: 0 },
    },
  },
  // --- Step 5: MUL R5, R3, R4  →  R5 = 16 ---
  {
    kind: 'register',
    step: 5,
    status: 'paused',
    currentInstruction: regInstr(5),
    state: {
      programCounter: 0x0014,
      registers: { R0: 0, R1: 3, R2: 5, R3: 8, R4: 2, R5: 16, R6: 0, R7: 0 },
    },
  },
  // --- Step 6: STORE_VARIABLE R5, x  (no register change)  ---
  {
    kind: 'register',
    step: 6,
    status: 'paused',
    currentInstruction: regInstr(6),
    state: {
      programCounter: 0x0018,
      registers: { R0: 0, R1: 3, R2: 5, R3: 8, R4: 2, R5: 16, R6: 0, R7: 0 },
    },
  },
  // --- Step 7: HALT ---
  {
    kind: 'register',
    step: 7,
    status: 'halted',
    currentInstruction: null,
    state: {
      programCounter: 0x001A,
      registers: { R0: 0, R1: 3, R2: 5, R3: 8, R4: 2, R5: 16, R6: 0, R7: 0 },
    },
  },
];

// ---------------------------------------------------------------------------
// Stack Machine States
// stack[] — index 0 = bottom, last element = top of stack.
// ---------------------------------------------------------------------------
export const MOCK_STACK_STATES: MachineState[] = [
  // --- Step 0: initial idle state ---
  {
    kind: 'stack',
    step: 0,
    status: 'idle',
    currentInstruction: stkInstr(0),
    state: {
      programCounter: 0x0000,
      stack: [],
    },
  },
  // --- Step 1: LOAD_CONSTANT #3  →  stack: [3] ---
  {
    kind: 'stack',
    step: 1,
    status: 'paused',
    currentInstruction: stkInstr(1),
    state: {
      programCounter: 0x0003,
      stack: [3],
    },
  },
  // --- Step 2: LOAD_CONSTANT #5  →  stack: [3, 5] ---
  {
    kind: 'stack',
    step: 2,
    status: 'paused',
    currentInstruction: stkInstr(2),
    state: {
      programCounter: 0x0006,
      stack: [3, 5],
    },
  },
  // --- Step 3: ADD  →  pop 5,3 push 8  →  stack: [8] ---
  {
    kind: 'stack',
    step: 3,
    status: 'paused',
    currentInstruction: stkInstr(3),
    state: {
      programCounter: 0x0007,
      stack: [8],
    },
  },
  // --- Step 4: LOAD_CONSTANT #2  →  stack: [8, 2] ---
  {
    kind: 'stack',
    step: 4,
    status: 'paused',
    currentInstruction: stkInstr(4),
    state: {
      programCounter: 0x000A,
      stack: [8, 2],
    },
  },
  // --- Step 5: MUL  →  pop 2,8 push 16  →  stack: [16] ---
  {
    kind: 'stack',
    step: 5,
    status: 'paused',
    currentInstruction: stkInstr(5),
    state: {
      programCounter: 0x000B,
      stack: [16],
    },
  },
  // --- Step 6: STORE_VARIABLE x  →  pop 16, stack empty ---
  {
    kind: 'stack',
    step: 6,
    status: 'paused',
    currentInstruction: stkInstr(6),
    state: {
      programCounter: 0x000E,
      stack: [],
    },
  },
  // --- Step 7: HALT ---
  {
    kind: 'stack',
    step: 7,
    status: 'halted',
    currentInstruction: null,
    state: {
      programCounter: 0x000F,
      stack: [],
    },
  },
];
