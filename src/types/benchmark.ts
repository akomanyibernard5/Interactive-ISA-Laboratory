export type BenchmarkCategory =
  | 'arithmetic'
  | 'expression'
  | 'loop'
  | 'branch'
  | 'data-processing';

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
  cSource?: string;       // optional C subset source for display in the lab editor
}
