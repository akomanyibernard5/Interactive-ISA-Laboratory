// DEMONSTRATION DATA — not measured experimental results
import type { Architecture } from '../types';

export const MOCK_ARCHITECTURES: Architecture[] = [
  {
    id: 'register',
    name: 'Register Machine',
    description:
      'Uses 8 general-purpose 16-bit registers (R0–R7). Instructions explicitly name source and destination registers. Operands are encoded in the instruction word.',
  },
  {
    id: 'stack',
    name: 'Stack Machine',
    description:
      'Uses an implicit operand stack. Instructions operate on the top of the stack. Operands are not named in arithmetic instructions; they are implicitly consumed from the stack.',
  },
];
