import type { Instruction } from './instruction';

/** Register machine: 8 x 16-bit general purpose registers + PC */
export interface RegisterState {
  registers: Record<string, number>; // key: 'R0'..'R7', value: 16-bit unsigned
  programCounter: number;
}

/** Stack machine: operand stack + PC */
export interface StackState {
  stack: number[];       // index 0 = bottom, last = top
  programCounter: number;
}

export type MachineState =
  | { kind: 'register'; state: RegisterState; step: number; currentInstruction: Instruction | null; status: ExecutionStatus }
  | { kind: 'stack';    state: StackState;    step: number; currentInstruction: Instruction | null; status: ExecutionStatus };

export type ExecutionStatus = 'idle' | 'running' | 'paused' | 'halted' | 'error';
