# IIL Backend - C++ Simulator

Interactive ISA Laboratory backend implementing Register and Stack virtual machines for architecture comparison research.

## Project Overview

This backend simulates two fundamentally different instruction set architectures:

1. **Register VM** — 3-address code where instructions explicitly name operands (e.g., `ADD R3, R1, R2`)
2. **Stack VM** — 0-address code where operands are implicitly on a stack (e.g., `ADD` pops two values, pushes result)

Both VMs execute the same logical programs, enabling direct comparison of:
- Program size (code density)
- Instruction count
- Memory operations
- Stack operations
- Estimated execution cost

## What's New: Complete Translation Pipeline

The backend now includes a complete end-to-end compilation pipeline:

**C source** → **Lexer** → **Parser** → **IR** → **Code Generators** → **VM Execution**

### Components

- **IR (Intermediate Representation)**: Architecture-neutral three-address code
- **Lexer**: Tokenizes C subset source code
- **Parser**: Recursive descent parser producing IR
- **Code Generators**: IR → Register VM and IR → Stack VM instructions
- **Pipeline**: Orchestrates compilation and execution

## Supported C Subset

The parser supports a minimal but functional subset of C:

### Supported Features
- `int main() { ... }` function wrapper
- Integer variable declarations: `int x = 42;`
- Arithmetic operators: `+`, `-`, `*`, `/` with correct precedence
- Parentheses for grouping: `(3 + 5) * 2`
- Assignment statements: `x = a + b;`
- `return` statement (optional)
- `if`/`else` statements
- `while` loops
- Single-line comments: `// comment`

### Not Supported
- Multiple functions
- Function parameters
- Pointers
- Arrays
- Structs
- Floating point
- Preprocessor directives
- Multi-line comments

### Example Programs

```c
// Arithmetic with precedence
int main() { int x = 3 + 5 * 2; return x; }  // x = 13

// Parentheses
int main() { int x = (3 + 5) * 2; return x; }  // x = 16

// Multiple variables
int main() { int a = 4; int b = 6; int x = a + b; return x; }  // x = 10
```

## Building

Requires: C++17 compiler (clang++ or g++)

```bash
make          # Build everything
make run      # Run the demo
make test     # Run tests
make clean    # Clean build artifacts
```

## Test Results

All required tests pass:

| Test | Source | Expected | Result |
|------|--------|----------|--------|
| A | `int main() { int x = (3 + 5) * 2; return x; }` | x = 16 | ✓ |
| B | `int main() { int x = 3 + 5 * 2; return x; }` | x = 13 | ✓ |
| C | `int main() { int x = 10 - 3; return x; }` | x = 7 | ✓ |
| D | `int main() { int a = 4; int b = 6; int x = a + b; return x; }` | x = 10 | ✓ |
| E | `int main() { int x = (10 - 3) * 2; return x; }` | x = 14 | ✓ |
| F | `int main() { int x = 20 / 4; return x; }` | x = 5 | ✓ |

## Sample Output

```
--- Intermediate Representation ---
CONST t0, #3
CONST t1, #5
ADD t2, t0, t1
CONST t3, #2
MUL t4, t2, t3
STORE x, t4
HALT

--- Register VM Code ---
LOAD_CONSTANT R0 #3
LOAD_CONSTANT R1 #5
ADD R2 R0 R1
LOAD_CONSTANT R3 #2
MUL R4 R2 R3
STORE_VARIABLE x R4
HALT

--- Stack VM Code ---
LOAD_CONSTANT #3
LOAD_CONSTANT #5
ADD
LOAD_CONSTANT #2
MUL
STORE_VARIABLE x
HALT

--- Comparison ---
Metric                   Register VM    Stack VM       
-------------------------------------------------------
Program size (bytes)     34             21             
Instructions executed    9              9              
Memory reads             1              1              
Memory writes            2              2              
Stack pushes             0              6              
Stack pops               0              6              
Estimated cost           17             17             

✓ Both VMs produced matching results
```

## Architecture Comparison

### Register VM
- 3-address code with explicit operands
- Larger instructions (4 bytes typical)
- No stack traffic
- 8 registers (R0-R7)

### Stack VM
- 0-address code with implicit operands
- Smaller instructions (1-3 bytes)
- Stack push/pop for all operations

## Implementation Status

### Completed
- [x] Core types and instruction set
- [x] Register VM with step-by-step execution
- [x] Stack VM with step-by-step execution
- [x] Execution trace recording
- [x] Metrics tracking
- [x] Intermediate Representation (IR)
- [x] Code generators (IR → Register, IR → Stack)
- [x] C subset lexer and parser
- [x] End-to-end pipeline
- [x] Unit and integration tests

### Pending
- [ ] WebAssembly/Emscripten build
- [ ] Integration with React frontend

## Limitations

1. **Educational Cost Model**: Metrics are pedagogical approximations
2. **Register Allocation**: Simple linear allocation (max 8 registers)
3. **Type System**: Only `int` type supported
4. **Scope**: No nested scopes or block-level variables
