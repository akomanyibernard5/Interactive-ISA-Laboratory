// DEMONSTRATION DATA — not measured experimental results
// Only the first benchmark ('arithmetic') has status 'completed' because it
// corresponds to the implemented demo computation x = (a+b)×c.
// All other benchmarks are 'pending' — programs have not been authored yet.

import type { Benchmark } from '../types';

export const MOCK_BENCHMARKS: Benchmark[] = [
  // 1. arithmetic — the only completed benchmark
  {
    id: 'bench-arithmetic-01',
    name: 'Basic Arithmetic: x = (a + b) × c',
    category: 'arithmetic',
    description:
      'Computes x = (a + b) × c using integer constants. ' +
      'Demonstrates LOAD_CONSTANT, ADD, MUL, STORE_VARIABLE, and HALT. ' +
      'Demo inputs: a=3, b=5, c=2 → expected x=16.',
    expectedOutput: 'x = 16',
    inputs: [
      { name: 'a', value: 3 },
      { name: 'b', value: 5 },
      { name: 'c', value: 2 },
    ],
    status: 'completed',
    programIdRegister: 'reg-arith-demo',
    programIdStack: 'stk-arith-demo',
    cSource:
      '// Arithmetic: x = (a + b) * c\n' +
      'int a = 3;\n' +
      'int b = 5;\n' +
      'int c = 2;\n' +
      'int x = (a + b) * c;',
  },

  // 2. expression — pending
  {
    id: 'bench-expression-01',
    name: 'Expression Evaluation: y = a² + 2ab + b²',
    category: 'expression',
    description:
      'Evaluates the binomial square y = (a+b)² = a² + 2ab + b². ' +
      'Exercises multiple arithmetic operations and intermediate temporaries. ' +
      'Pending — program not yet authored.',
    expectedOutput: 'y = 49',
    inputs: [
      { name: 'a', value: 3 },
      { name: 'b', value: 4 },
    ],
    status: 'pending',
    programIdRegister: 'reg-expr-pending',
    programIdStack: 'stk-expr-pending',
    cSource:
      '// Expression: y = a*a + 2*a*b + b*b\n' +
      'int a = 3;\n' +
      'int b = 4;\n' +
      'int y = a*a + 2*a*b + b*b;',
  },

  // 3. loop — pending
  {
    id: 'bench-loop-01',
    name: 'Loop: Sum of array elements',
    category: 'loop',
    description:
      'Sums N integers stored in memory using a counted loop. ' +
      'Exercises LOAD_VARIABLE, ADD, COMPARE, JUMP_IF_ZERO, and LABEL. ' +
      'Pending — program not yet authored.',
    expectedOutput: 'sum = 15',
    inputs: [
      { name: 'N', value: 5 },
    ],
    status: 'pending',
    programIdRegister: 'reg-loop-pending',
    programIdStack: 'stk-loop-pending',
    cSource:
      '// Loop: sum of 1..5\n' +
      'int sum = 0;\n' +
      'int i = 1;\n' +
      'while (i <= 5) {\n' +
      '  sum = sum + i;\n' +
      '  i = i + 1;\n' +
      '}',
  },

  // 4. branch — pending
  {
    id: 'bench-branch-01',
    name: 'Conditional Branch: max(a, b)',
    category: 'branch',
    description:
      'Returns the larger of two values using a conditional branch. ' +
      'Exercises COMPARE, JUMP_IF_ZERO, LABEL, and LOAD_VARIABLE. ' +
      'Pending — program not yet authored.',
    expectedOutput: 'result = 7',
    inputs: [
      { name: 'a', value: 7 },
      { name: 'b', value: 3 },
    ],
    status: 'pending',
    programIdRegister: 'reg-branch-pending',
    programIdStack: 'stk-branch-pending',
    cSource:
      '// Branch: max(a, b)\n' +
      'int a = 7;\n' +
      'int b = 3;\n' +
      'int result;\n' +
      'if (a > b) {\n' +
      '  result = a;\n' +
      '} else {\n' +
      '  result = b;\n' +
      '}',
  },

  // 5. data-processing — pending
  {
    id: 'bench-data-processing-01',
    name: 'Data Processing: Array Sum',
    category: 'data-processing',
    description:
      'Sums three array elements stored as individual integer variables. ' +
      'Exercises LOAD_VARIABLE, ADD, and STORE_VARIABLE. ' +
      'Pending — program not yet authored.',
    expectedOutput: 'total = 60',
    inputs: [
      { name: 'N', value: 3 },
    ],
    status: 'pending',
    programIdRegister: 'reg-data-pending',
    programIdStack: 'stk-data-pending',
    cSource:
      '// Data processing: sum array elements\n' +
      'int arr0 = 10;\n' +
      'int arr1 = 20;\n' +
      'int arr2 = 30;\n' +
      'int total = arr0 + arr1 + arr2;',
  },
];
