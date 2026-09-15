import type { Instruction } from './instruction';

/**
 * A single instruction in the Common Intermediate Representation.
 * The Common IR is architecture-neutral: it is produced from C source by
 * the future C++ compiler and consumed by both VM backends.
 */
export type CommonIROpcode =
  | 'LOAD_CONSTANT'
  | 'LOAD_VARIABLE'
  | 'STORE_VARIABLE'
  | 'ADD'
  | 'SUB'
  | 'MUL'
  | 'DIV'
  | 'COMPARE'
  | 'LABEL'
  | 'JUMP'
  | 'JUMP_IF_ZERO'
  | 'HALT';

export interface CommonIRInstruction {
  index: number;          // sequential index in the IR listing
  opcode: CommonIROpcode;
  operands: string[];     // symbolic operands, e.g. 't0', 'a', '#3'
  comment: string;        // human-readable annotation, e.g. 'load a=3 into t0'
}

/** The full output of (future) C-to-Common-IR translation */
export interface TranslationResult {
  sourceId: string;              // which C source program was translated
  commonIR: CommonIRInstruction[];
  registerProgram: Instruction[]; // target-specific register instructions
  stackProgram: Instruction[];    // target-specific stack instructions
  registerSizeBytes: number;
  stackSizeBytes: number;
  isDemoData: boolean;            // true = mock, false = real engine output
}
