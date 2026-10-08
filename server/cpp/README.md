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

## Directory Structure

```
server/cpp/
├── include/                    # Header files (declarations)
│   ├── Types.hpp              # Core types: Value, ExecutionStatus, MemoryChange, Metrics, CostModel
│   ├── Instruction.hpp        # OpCode enum, Instruction struct, Program struct
│   ├── Trace.hpp              # TraceEntry, ExecutionTrace for recording execution
│   └── vm/
│       ├── RegisterVM.hpp     # RegisterVM class declaration
│       └── StackVM.hpp        # StackVM class declaration
│
├── src/                       # Implementation files (definitions)
│   ├── Types.cpp              # Helper functions for types
│   ├── Instruction.cpp        # Instruction/Program methods
│   ├── Trace.cpp              # ExecutionTrace methods
│   ├── vm/
│   │   ├── RegisterVM.cpp     # Register VM execution engine
│   │   └── StackVM.cpp        # Stack VM execution engine
│   └── main.cpp               # Demo runner with logging
│
├── tests/
│   └── test_main.cpp          # Unit tests
│
├── Makefile                   # Build configuration
└── README.md                  # This file
```

## Building

Requires: C++17 compiler (clang++ or g++)

```bash
# Build everything (library, tests, runner)
make

# Run the demo with execution logging
make run

# Run tests
make test

# Clean build artifacts
make clean
```

## Running

```bash
./build/iil_runner
```

This executes the demo program `x = (a + b) * c` on both VMs and logs:
- Instruction list
- Step-by-step execution trace
- State changes (registers or stack)
- Memory operations
- Final metrics

## Instruction Set

The instruction set is architecture-neutral: each opcode represents a logical operation that can be translated to either register or stack code.

| Opcode | Register VM | Stack VM | Purpose |
|--------|-------------|----------|---------|
| `LOAD_CONSTANT` | `LOAD_CONSTANT Rd, #imm` | `LOAD_CONSTANT #imm` | Load immediate value |
| `LOAD_VARIABLE` | `LOAD_VARIABLE Rd, var` | `LOAD_VARIABLE var` | Read from memory |
| `STORE_VARIABLE` | `STORE_VARIABLE var, Rs` | `STORE_VARIABLE var` | Write to memory |
| `ADD` | `ADD Rd, R1, R2` | `ADD` | Addition |
| `SUB` | `SUB Rd, R1, R2` | `SUB` | Subtraction |
| `MUL` | `MUL Rd, R1, R2` | `MUL` | Multiplication |
| `DIV` | `DIV Rd, R1, R2` | `DIV` | Integer division |
| `COMPARE` | `COMPARE Rd, R1, R2` | `COMPARE` | Less-than comparison |
| `LABEL` | `LABEL name` | `LABEL name` | Jump target marker |
| `JUMP` | `JUMP label` | `JUMP label` | Unconditional jump |
| `JUMP_IF_ZERO` | `JUMP_IF_ZERO Rs, label` | `JUMP_IF_ZERO label` | Conditional jump |
| `HALT` | `HALT` | `HALT` | Stop execution |

## Architecture Comparison

### Register VM Characteristics

- **3-address code**: Each instruction names destination and source registers
- **Larger instructions**: 4 bytes typical (opcode + 3 register fields)
- **No stack traffic**: Values stay in registers
- **Lower memory operations**: Only explicit loads/stores

Example program (26 bytes):
```
LOAD_CONSTANT R1, #3    ; 4 bytes
LOAD_CONSTANT R2, #5    ; 4 bytes
ADD R3, R1, R2          ; 4 bytes
LOAD_CONSTANT R4, #2    ; 4 bytes
MUL R5, R3, R4          ; 4 bytes
STORE_VARIABLE x, R5    ; 4 bytes
HALT                    ; 2 bytes
```

### Stack VM Characteristics

- **0-address code**: Operands are implicit (top of stack)
- **Smaller instructions**: 1-3 bytes (no register fields)
- **Stack traffic**: Each operation pushes/pops values
- **More operand moves**: Stack operations count as memory traffic

Example program (15 bytes):
```
LOAD_CONSTANT #3    ; 3 bytes
LOAD_CONSTANT #5    ; 3 bytes
ADD                 ; 1 byte
LOAD_CONSTANT #2    ; 3 bytes
MUL                 ; 1 byte
STORE_VARIABLE x    ; 3 bytes
HALT                ; 1 byte
```

## Key Design Decisions

### 16-bit Values

The VMs use 16-bit signed integers (`int16_t`) because:
- Small enough to keep execution traces readable
- Large enough to demonstrate overflow behavior
- Matches educational scope of the project

### 8 Registers

Register VM has 8 registers (R0-R7) because:
- Enough to demonstrate register allocation
- Small enough for UI clarity
- Matches typical educationalprocessor designs

### Cost Model

Default costs are pedagogical approximations:
- Instruction: 1 unit
- Memory read: 2 units (models latency)
- Memory write: 3 units (models write-back)

These are configurable and not based on real hardware measurements.

## API Usage

### Register VM

```cpp
#include "vm/RegisterVM.hpp"

iil::Program prog;
prog.instructions = {
    {0x0000, iil::OpCode::LOAD_CONSTANT, {"R1", "#10"}, "", 4},
    {0x0004, iil::OpCode::HALT, {}, "", 2}
};
prog.calculateTotalSize();

iil::RegisterVM vm;
iil::CostModel cost{"Demo", 1, 2, 3};
vm.setCostModel(cost);
vm.load(prog);

while (vm.step()) {
    // Check state, trace, metrics
    auto state = vm.state();
    auto metrics = vm.metrics();
}

std::cout << "x = " << vm.getVariable("x") << "\n";
```

### Stack VM

```cpp
#include "vm/StackVM.hpp"

iil::Program prog;
prog.instructions = {
    {0x0000, iil::OpCode::LOAD_CONSTANT, {"#10"}, "", 3},
    {0x0003, iil::OpCode::HALT, {}, "", 1}
};
prog.calculateTotalSize();

iil::StackVM vm;
vm.load(prog);
vm.run();

std::cout << "Stack depth: " << vm.state().size() << "\n";
```

## Metrics Explained

| Metric | Register VM | Stack VM |
|--------|-------------|----------|
| `dynamicInstructionCount` | Instructions executed | Instructions executed |
| `memoryReads` | LOAD_VARIABLE calls | LOAD_VARIABLE calls |
| `memoryWrites` | STORE_VARIABLE calls | STORE_VARIABLE calls |
| `stackPushCount` | Always 0 | Number of pushes |
| `stackPopCount` | Always 0 | Number of pops |
| `branchCount` | JUMP/JUMP_IF_ZERO | JUMP/JUMP_IF_ZERO |
| `estimatedCost` | Calculated from cost model | Calculated from cost model |

## Testing

The test suite verifies:
- Type conversions and cost calculation
- Instruction parsing
- Register VM execution producing correct results
- Stack VM execution producing correct results
- Both VMs produce identical results for same logical program
- Reset functionality

Run with: `make test`

## Future Work

### Completed
- [x] Core types and instruction set
- [x] Register VM with step-by-step execution
- [x] Stack VM with step-by-step execution
- [x] Execution trace recording
- [x] Metrics tracking
- [x] Cost model integration
- [x] Unit tests
- [x] Demo runner with logging

### Pending
- [ ] Common Intermediate Representation (IR)
- [ ] Code generators (IR → Register, IR → Stack)
- [ ] C subset parser
- [ ] WebAssembly/Emscripten build
- [ ] Integration with React frontend

## Integration with Frontend

The frontend (React + TypeScript) has a `MockSimulator` that will be replaced by WebAssembly bindings to this C++ backend. The interface to implement:

```typescript
interface ISimulator {
  load(program: Program): void;
  reset(): void;
  step(): MachineState;
  run(): MachineState;
  pause(): void;
  getState(): MachineState;
  getMetrics(): ExecutionMetrics;
  getTrace(): TraceEntry[];
  isLoaded(): boolean;
}
```

The C++ types are designed to map directly to TypeScript interfaces in `client/src/utils/types.ts`.
