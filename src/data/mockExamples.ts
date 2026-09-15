// DEMONSTRATION DATA — example C programs for the editor example selector.
// These cover all five benchmark categories supported by the ISA Laboratory.

import type { ExampleProgram } from '../types';

export const MOCK_EXAMPLES: ExampleProgram[] = [
  // 1. arithmetic — mirrors the implemented demo computation x = (a+b)×c
  {
    id: 'ex-arith',
    name: 'Basic Arithmetic',
    category: 'arithmetic',
    description:
      'Computes x = (a + b) × c using integer constants. ' +
      'Demonstrates LOAD_CONSTANT, ADD, MUL, STORE_VARIABLE, and HALT.',
    cSource:
      '// Arithmetic: x = (a + b) * c\n' +
      'int a = 3;\n' +
      'int b = 5;\n' +
      'int c = 2;\n' +
      'int x = (a + b) * c;',
    expectedOutput: 'x = 16',
  },

  // 2. expression — binomial square y = a² + 2ab + b²
  {
    id: 'ex-expr',
    name: 'Quadratic Expression',
    category: 'expression',
    description:
      'Evaluates y = a*a + 2*a*b + b*b. ' +
      'Exercises multiple arithmetic operations and intermediate temporaries.',
    cSource:
      '// Expression: y = a*a + 2*a*b + b*b\n' +
      'int a = 3;\n' +
      'int b = 4;\n' +
      'int y = a*a + 2*a*b + b*b;',
    expectedOutput: 'y = 49',
  },

  // 3. loop — sum integers 1..5
  {
    id: 'ex-loop',
    name: 'Loop Sum',
    category: 'loop',
    description:
      'Sums integers from 1 to 5 using a while-loop. ' +
      'Exercises LOAD_VARIABLE, ADD, COMPARE, JUMP_IF_ZERO, and LABEL.',
    cSource:
      '// Loop: sum of 1..5\n' +
      'int sum = 0;\n' +
      'int i = 1;\n' +
      'while (i <= 5) {\n' +
      '  sum = sum + i;\n' +
      '  i = i + 1;\n' +
      '}',
    expectedOutput: 'sum = 15',
  },

  // 4. branch — conditional max(a, b)
  {
    id: 'ex-branch',
    name: 'Conditional Max',
    category: 'branch',
    description:
      'Returns the larger of two values using a conditional branch. ' +
      'Exercises COMPARE, JUMP_IF_ZERO, LABEL, and LOAD_VARIABLE.',
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
    expectedOutput: 'result = 7',
  },

  // 5. data-processing — sum three array elements
  {
    id: 'ex-data',
    name: 'Array Sum',
    category: 'data-processing',
    description:
      'Sums three array elements stored as individual integer variables. ' +
      'Exercises LOAD_VARIABLE, ADD, and STORE_VARIABLE.',
    cSource:
      '// Data processing: sum array elements\n' +
      'int arr0 = 10;\n' +
      'int arr1 = 20;\n' +
      'int arr2 = 30;\n' +
      'int total = arr0 + arr1 + arr2;',
    expectedOutput: 'total = 60',
  },
];
