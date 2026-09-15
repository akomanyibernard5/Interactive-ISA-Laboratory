export type Opcode =
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

export interface Instruction {
  address: number;       // byte offset in the encoded program
  opcode: Opcode;
  operands: string[];    // string representation of operands (e.g. 'R1', '#5', 'loop_start')
  encoded: string;       // hex string, e.g. '0x01 0x02'
  sizeBytes: number;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  architectureId: 'register' | 'stack' | 'both'; // 'both' = IR-based dual representation
  instructions: Instruction[];
  totalSizeBytes: number;
}
