// DEMONSTRATION DATA — not measured experimental results
// Demo computation: x = (a + b) × c  where a=3, b=5, c=2  →  x=16
//
// Register instructions are larger (4 bytes) because they encode destination
// and two source registers in the instruction word.
// Stack instructions are smaller (2–3 bytes) — no register fields needed.

import type { Program } from '../types';

// ---------------------------------------------------------------------------
// Register Machine Program
// ---------------------------------------------------------------------------
// Each register instruction encoding:
//   [opcode 1B] [dest-reg 1B] [src-reg-or-imm 2B]  →  4 bytes
// HALT:
//   [opcode 1B] [pad 1B]                            →  2 bytes
// STORE_VARIABLE:
//   [opcode 1B] [src-reg 1B] [mem-addr 2B]          →  4 bytes
// ADD / MUL (three-reg form):
//   [opcode 1B] [dest 1B] [src1 1B] [src2 1B]       →  4 bytes
// ---------------------------------------------------------------------------

export const MOCK_REGISTER_PROGRAM: Program = {
  id: 'reg-arith-demo',
  name: 'Register: x = (a + b) × c',
  description:
    'DEMONSTRATION — computes x = (a+b)×c using 8 registers. a=3, b=5, c=2 → x=16.',
  architectureId: 'register',
  instructions: [
    // Step 1 — load a=3 into R1
    {
      address: 0x0000,
      opcode: 'LOAD_CONSTANT',
      operands: ['R1', '#3'],
      encoded: '0x01 0x01 0x00 0x03',
      sizeBytes: 4,
    },
    // Step 2 — load b=5 into R2
    {
      address: 0x0004,
      opcode: 'LOAD_CONSTANT',
      operands: ['R2', '#5'],
      encoded: '0x01 0x02 0x00 0x05',
      sizeBytes: 4,
    },
    // Step 3 — R3 = R1 + R2  (a+b = 8)
    {
      address: 0x0008,
      opcode: 'ADD',
      operands: ['R3', 'R1', 'R2'],
      encoded: '0x04 0x03 0x01 0x02',
      sizeBytes: 4,
    },
    // Step 4 — load c=2 into R4
    {
      address: 0x000C,
      opcode: 'LOAD_CONSTANT',
      operands: ['R4', '#2'],
      encoded: '0x01 0x04 0x00 0x02',
      sizeBytes: 4,
    },
    // Step 5 — R5 = R3 × R4  (8×2 = 16)
    {
      address: 0x0010,
      opcode: 'MUL',
      operands: ['R5', 'R3', 'R4'],
      encoded: '0x06 0x05 0x03 0x04',
      sizeBytes: 4,
    },
    // Step 6 — store R5 → variable x (address 0x0100)
    {
      address: 0x0014,
      opcode: 'STORE_VARIABLE',
      operands: ['R5', 'x'],
      encoded: '0x03 0x05 0x01 0x00',
      sizeBytes: 4,
    },
    // Step 7 — halt
    {
      address: 0x0018,
      opcode: 'HALT',
      operands: [],
      encoded: '0x0B 0x00',
      sizeBytes: 2,
    },
  ],
  // 6 × 4-byte instructions + 1 × 2-byte HALT = 26 bytes
  totalSizeBytes: 26,
};

// ---------------------------------------------------------------------------
// Stack Machine Program
// ---------------------------------------------------------------------------
// Stack instruction encoding (no register fields):
//   LOAD_CONSTANT: [opcode 1B] [imm 2B]    →  3 bytes
//   ADD / MUL:     [opcode 1B]              →  1 byte
//   STORE_VARIABLE:[opcode 1B] [addr 2B]   →  3 bytes
//   HALT:          [opcode 1B]              →  1 byte
// ---------------------------------------------------------------------------

export const MOCK_STACK_PROGRAM: Program = {
  id: 'stk-arith-demo',
  name: 'Stack: x = (a + b) × c',
  description:
    'DEMONSTRATION — computes x = (a+b)×c using an implicit operand stack. a=3, b=5, c=2 → x=16.',
  architectureId: 'stack',
  instructions: [
    // Step 1 — push a=3
    {
      address: 0x0000,
      opcode: 'LOAD_CONSTANT',
      operands: ['#3'],
      encoded: '0x01 0x00 0x03',
      sizeBytes: 3,
    },
    // Step 2 — push b=5
    {
      address: 0x0003,
      opcode: 'LOAD_CONSTANT',
      operands: ['#5'],
      encoded: '0x01 0x00 0x05',
      sizeBytes: 3,
    },
    // Step 3 — pop two, push sum (3+5=8)
    {
      address: 0x0006,
      opcode: 'ADD',
      operands: [],
      encoded: '0x04',
      sizeBytes: 1,
    },
    // Step 4 — push c=2
    {
      address: 0x0007,
      opcode: 'LOAD_CONSTANT',
      operands: ['#2'],
      encoded: '0x01 0x00 0x02',
      sizeBytes: 3,
    },
    // Step 5 — pop two, push product (8×2=16)
    {
      address: 0x000A,
      opcode: 'MUL',
      operands: [],
      encoded: '0x06',
      sizeBytes: 1,
    },
    // Step 6 — pop top-of-stack and store at x (address 0x0100)
    {
      address: 0x000B,
      opcode: 'STORE_VARIABLE',
      operands: ['x'],
      encoded: '0x03 0x01 0x00',
      sizeBytes: 3,
    },
    // Step 7 — halt
    {
      address: 0x000E,
      opcode: 'HALT',
      operands: [],
      encoded: '0x0B',
      sizeBytes: 1,
    },
  ],
  // 3+3+1+3+1+3+1 = 15 bytes
  totalSizeBytes: 15,
};

export const MOCK_PROGRAMS: Program[] = [MOCK_REGISTER_PROGRAM, MOCK_STACK_PROGRAM];
