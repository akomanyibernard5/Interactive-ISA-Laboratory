// ── Architecture ──────────────────────────────────────────────────────────────

export type ArchitectureId = 'register' | 'stack';

export interface Architecture {
  id: ArchitectureId;
  name: string;
  description: string;
}

// ── Instruction / Program ─────────────────────────────────────────────────────

export type Opcode =
  | 'LOAD_CONSTANT' | 'LOAD_VARIABLE' | 'STORE_VARIABLE'
  | 'ADD' | 'SUB' | 'MUL' | 'DIV'
  | 'COMPARE' | 'LABEL' | 'JUMP' | 'JUMP_IF_ZERO' | 'HALT';

export interface Instruction {
  address: number;
  opcode: Opcode;
  operands: string[];
  encoded: string;
  sizeBytes: number;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  architectureId: 'register' | 'stack' | 'both';
  instructions: Instruction[];
  totalSizeBytes: number;
}

// ── Machine state ─────────────────────────────────────────────────────────────

export interface RegisterState {
  registers: Record<string, number>;
  programCounter: number;
}

export interface StackState {
  stack: number[];
  programCounter: number;
}

export type ExecutionStatus = 'idle' | 'running' | 'paused' | 'halted' | 'error';

export type MachineState =
  | { kind: 'register'; state: RegisterState; step: number; currentInstruction: Instruction | null; status: ExecutionStatus }
  | { kind: 'stack';    state: StackState;    step: number; currentInstruction: Instruction | null; status: ExecutionStatus };

// ── Memory ────────────────────────────────────────────────────────────────────

export type MemoryAccessType = 'read' | 'write';

export interface MemoryChange {
  step: number;
  address: number;
  addressHex: string;
  previousValue: number | null;
  newValue: number;
  accessType: MemoryAccessType;
}

// ── Metrics ───────────────────────────────────────────────────────────────────

export interface ExecutionMetrics {
  programSizeBytes: number;
  dynamicInstructionCount: number;
  memoryReads: number;
  memoryWrites: number;
  branchCount: number;
  stackPushCount: number;
  stackPopCount: number;
  // Supplied by the experiment engine; the frontend never computes this.
  estimatedCost: number;
  costModelName: string;
}

export interface CostModel {
  name: string;
  instructionCost: number;
  memoryReadCost: number;
  memoryWriteCost: number;
}

// ── Trace ─────────────────────────────────────────────────────────────────────

export interface MetricsSnapshot {
  instructionCount: number;
  memoryReads: number;
  memoryWrites: number;
  branchCount: number;
  stackPushCount: number;
  stackPopCount: number;
}

export interface TraceEntry {
  step: number;
  programCounter: number;
  instruction: Instruction;
  stateBefore: string;
  stateAfter: string;
  memoryChanges: MemoryChange[];
  metricsSnapshot: MetricsSnapshot;
}

// ── Translation ───────────────────────────────────────────────────────────────

export type CommonIROpcode =
  | 'LOAD_CONSTANT' | 'LOAD_VARIABLE' | 'STORE_VARIABLE'
  | 'ADD' | 'SUB' | 'MUL' | 'DIV'
  | 'COMPARE' | 'LABEL' | 'JUMP' | 'JUMP_IF_ZERO' | 'HALT';

export interface CommonIRInstruction {
  index: number;
  opcode: CommonIROpcode;
  operands: string[];
  comment: string;
}

export interface TranslationResult {
  sourceId: string;
  commonIR: CommonIRInstruction[];
  registerProgram: Instruction[];
  stackProgram: Instruction[];
  registerSizeBytes: number;
  stackSizeBytes: number;
  // Signals the UI to label output as simulated rather than real compiler output.
  isDemoData: boolean;
}

// ── Simulator interface ───────────────────────────────────────────────────────

// Isolated so the mock can be swapped for a WebAssembly implementation
// without touching any UI component.
export interface ISimulator {
  load(program: Program): void;
  reset(): void;
  step(): MachineState;
  run(): MachineState;
  getState(): MachineState;
  getMetrics(): ExecutionMetrics;
  getTrace(): TraceEntry[];
  isLoaded(): boolean;
}

// ── Benchmark ─────────────────────────────────────────────────────────────────

export type BenchmarkCategory =
  | 'arithmetic' | 'expression' | 'loop' | 'branch' | 'data-processing';

export type BenchmarkStatus = 'pending' | 'running' | 'completed' | 'error';

export interface BenchmarkInput {
  name: string;
  value: string | number;
}

export interface Benchmark {
  id: string;
  name: string;
  category: BenchmarkCategory;
  description: string;
  expectedOutput: string;
  inputs: BenchmarkInput[];
  status: BenchmarkStatus;
  programIdRegister: string;
  programIdStack: string;
  cSource?: string;
}

// ── Experiment results ────────────────────────────────────────────────────────

export type ValidationStatus = 'valid' | 'invalid' | 'pending';

export interface ExperimentResult {
  id: string;
  benchmarkId: string;
  benchmarkName: string;
  architectureId: ArchitectureId;
  inputDescription: string;
  validationStatus: ValidationStatus;
  programSizeBytes: number;
  dynamicInstructionCount: number;
  memoryReads: number;
  memoryWrites: number;
  branchCount: number;
  estimatedCost: number;
  costModelName: string;
  timestamp: string;
}

// ── Editor ────────────────────────────────────────────────────────────────────

export interface ExampleProgram {
  id: string;
  name: string;
  category: BenchmarkCategory;
  description: string;
  cSource: string;
  expectedOutput: string;
}

export interface EditorState {
  source: string;
  programName: string;
  isDirty: boolean;
  errors: EditorError[];
}

export interface EditorError {
  line: number;
  column: number;
  message: string;
}

// ── Lab state ─────────────────────────────────────────────────────────────────

export type RunMode = 'register' | 'stack' | 'both';

export interface LabState {
  runMode: RunMode;
  registerState: MachineState | null;
  stackState: MachineState | null;
  registerMetrics: ExecutionMetrics | null;
  stackMetrics: ExecutionMetrics | null;
  registerTrace: TraceEntry[];
  stackTrace: TraceEntry[];
  memoryChanges: MemoryChange[];
  translation: TranslationResult | null;
  executionStatus: ExecutionStatus;
  currentStep: number;
}

export interface SectionExpansionState {
  translation: boolean;
  execution: boolean;
  machineState: boolean;
  memory: boolean;
  trace: boolean;
  metrics: boolean;
  comparison: boolean;
  benchmarks: boolean;
  results: boolean;
}
