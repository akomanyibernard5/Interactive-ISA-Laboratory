# Interactive ISA Laboratory

**CSCI 411 — Computer Architecture**

A single-page browser application for comparing Register-based and Stack-based virtual machine architectures. Write a C program, compile it to a common intermediate representation, watch it lower to two different bytecode targets, and step through execution side-by-side.

---

## What it does

| Panel | Description |
|---|---|
| **Program** | C subset editor with syntax highlighting, line numbers, and example programs. Load into either VM or both simultaneously. |
| **Machine State** | Live register file (R0–R7 + PC) or operand stack view. Values animate on change. |
| **Current Instruction** | PC, step counter, execution status, and the active opcode with operand display. |
| **Quick Metrics** | Inline bar comparison of instruction count, memory ops, program size, and estimated cost. |
| **Translation Pipeline** | Interactive ReactFlow diagram: C Source → Common IR → Register VM bytecode / Stack VM bytecode, with animated edges labelled `parse & tokenise` and `code gen`. |
| **Execution Trace** | Step-by-step log with PC, instruction, state before/after, and memory change count. Auto-scrolls to the current step. |
| **Memory Activity** | Chronological log of every memory read and write, colour-coded by operation type. |
| **Metrics** | Normalised profile bar chart, execution progression line chart, and cost model breakdown. |
| **Comparison** | Side-by-side bar chart of all nine metrics across both architectures with delta chips. |
| **Benchmarks** | Curated benchmark suite filterable by category. Load any benchmark into the editor. |
| **Results** | Experiment results table with filtering and pagination. |

---

## Architecture

```
client/
├── src/
│   ├── pages/
│   │   └── LaboratoryPage.tsx      # Single workspace page, owns all layout state
│   ├── layouts/
│   │   └── AppShell.tsx            # TopNavigation + AppLayout shell
│   ├── components/
│   │   ├── program/                # C editor, example selector, execution controls
│   │   ├── machine/                # Register file and stack state panels
│   │   ├── translation/            # ReactFlow pipeline diagram
│   │   ├── trace/                  # Step-by-step execution log
│   │   ├── memory/                 # Memory read/write log
│   │   ├── metrics/                # Charts and cost model
│   │   ├── comparison/             # Architecture comparison chart
│   │   ├── benchmarks/             # Benchmark suite browser
│   │   ├── results/                # Experiment results table
│   │   └── visuals/                # RegisterFileVisual, StackVisual, MetricsBarChart, TraceLineChart
│   ├── services/
│   │   ├── MockSimulator.ts        # Replays pre-authored snapshots; swap for WebAssembly engine
│   │   ├── useSimulator.ts         # React hook wrapping the simulator; single LabState slice
│   │   └── simulatorFactory.ts     # Returns MockSimulator; replace to wire the real engine
│   ├── data/                       # Static mock data (programs, traces, benchmarks, results)
│   └── utils/
│       └── types.ts                # All TypeScript types in one canonical file
```

### Simulator boundary

`ISimulator` in `utils/types.ts` defines the contract between the UI and the execution engine. `MockSimulator` replays pre-authored demo snapshots so the frontend can be developed independently. When the C++ engine is ready, implement `ISimulator` in a WebAssembly module and update `simulatorFactory.ts` to return it — no component changes required.

---

## Tech stack

| | |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Build | Vite 8 |
| Design system | AWS Cloudscape (`@cloudscape-design/components`) |
| Pipeline diagram | `@xyflow/react` v12 (ReactFlow) |
| Icons | `lucide-react` |

---

## Getting started

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

```bash
npm run build   # production build
npm run lint    # oxlint
```

---

## Supported C subset

```c
int x = 5;          // integer variable declarations
x = a + b * c;      // arithmetic: + - * /
if (x > 0) { }      // conditionals with ==  !=  <  >  <=  >=
while (x > 0) { }   // while loops
```

Functions, pointers, arrays, and standard library calls are not supported. The compiler targets a two-register-operand IR that lowers to either 3-address register bytecode or 0-address stack bytecode.

---

## Run modes

| Mode | Behaviour |
|---|---|
| **Register VM** | Loads and executes on the register-based VM only |
| **Stack VM** | Loads and executes on the stack-based VM only |
| **Both** | Loads and runs both VMs simultaneously; all comparison panels become active |
