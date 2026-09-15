// DEMONSTRATION DATA — translation result for the arithmetic demo x = (a+b)×c.
// The commonIR mirrors the 7-step computation; registerProgram and stackProgram
// are taken directly from the already-defined mock program instruction arrays.

import type { TranslationResult } from '../types';
import { MOCK_REGISTER_PROGRAM, MOCK_STACK_PROGRAM } from './mockPrograms';

export const MOCK_TRANSLATION: TranslationResult = {
  sourceId: 'ex-arith',

  // Common Intermediate Representation — architecture-neutral
  commonIR: [
    {
      index: 0,
      opcode: 'LOAD_CONSTANT',
      operands: ['t0', '#3'],
      comment: 'load a=3 into t0',
    },
    {
      index: 1,
      opcode: 'LOAD_CONSTANT',
      operands: ['t1', '#5'],
      comment: 'load b=5 into t1',
    },
    {
      index: 2,
      opcode: 'ADD',
      operands: ['t2', 't0', 't1'],
      comment: 't2 = a + b = 8',
    },
    {
      index: 3,
      opcode: 'LOAD_CONSTANT',
      operands: ['t3', '#2'],
      comment: 'load c=2 into t3',
    },
    {
      index: 4,
      opcode: 'MUL',
      operands: ['t4', 't2', 't3'],
      comment: 't4 = (a+b)*c = 16',
    },
    {
      index: 5,
      opcode: 'STORE_VARIABLE',
      operands: ['x', 't4'],
      comment: 'store result x = 16',
    },
    {
      index: 6,
      opcode: 'HALT',
      operands: [],
      comment: 'end of program',
    },
  ],

  // Target-specific encodings — taken directly from mock program instruction arrays
  registerProgram: MOCK_REGISTER_PROGRAM.instructions,
  stackProgram: MOCK_STACK_PROGRAM.instructions,

  registerSizeBytes: MOCK_REGISTER_PROGRAM.totalSizeBytes,
  stackSizeBytes: MOCK_STACK_PROGRAM.totalSizeBytes,

  isDemoData: true,
};
