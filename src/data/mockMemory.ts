// DEMONSTRATION DATA — not measured experimental results
// Demo computation: x = (a + b) × c  where a=3, b=5, c=2  →  x=16
//
// Variable 'x' is mapped to memory address 0x0100 (256 decimal).
// There is one write: the STORE_VARIABLE instruction at step 6.
// There are no explicit LOAD_VARIABLE instructions in either demo program
// (values are loaded as inline constants), so no read entries are generated.

import type { MemoryChange } from '../types';

export const MOCK_MEMORY_CHANGES: MemoryChange[] = [
  // --- Register machine: STORE_VARIABLE R5, x at step 6 ---
  {
    step: 6,
    address: 0x0100,       // variable 'x' lives at byte address 256
    addressHex: '0x0100',
    previousValue: null,   // variable not previously written — uninitialized
    newValue: 16,          // result: (3+5)×2 = 16
    accessType: 'write',
  },
  // --- Stack machine: STORE_VARIABLE x at step 6 ---
  {
    step: 6,
    address: 0x0100,
    addressHex: '0x0100',
    previousValue: null,
    newValue: 16,
    accessType: 'write',
  },
];
