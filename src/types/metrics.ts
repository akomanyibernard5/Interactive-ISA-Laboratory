export interface ExecutionMetrics {
  programSizeBytes: number;
  dynamicInstructionCount: number;
  memoryReads: number;
  memoryWrites: number;
  branchCount: number;
  stackPushCount: number;
  stackPopCount: number;
  estimatedCost: number;       // provided by future experiment engine — do not compute here
  costModelName: string;
}

export interface CostModel {
  name: string;
  instructionCost: number;
  memoryReadCost: number;
  memoryWriteCost: number;
}
