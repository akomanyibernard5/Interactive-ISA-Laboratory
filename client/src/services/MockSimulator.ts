// Replays pre-authored demo snapshots so the UI can be developed and tested
// without the C++ engine. Swap this class for a WebAssembly-backed
// implementation once the engine is ready; ISimulator is unchanged.

import type { ISimulator, MachineState, ExecutionMetrics, TraceEntry, Program } from "../utils/types";
import type { TranslationResult } from '../utils/types';
import type { RunMode } from '../utils/types';
import { MOCK_REGISTER_STATES, MOCK_STACK_STATES } from "../data/mockMachineStates";
import { MOCK_REGISTER_TRACE, MOCK_STACK_TRACE } from "../data/mockTrace";
import { MOCK_REGISTER_METRICS, MOCK_STACK_METRICS } from "../data/mockMetrics";
import { MOCK_TRANSLATION } from "../data/mockTranslation";

export class MockSimulator implements ISimulator {
  private program: Program | null = null;
  private runMode: RunMode = "register";
  private stepIndex = 0;
  private stackStepIndex = 0;
  private states: MachineState[] = [];
  private trace: TraceEntry[] = [];
  private metrics: ExecutionMetrics = MOCK_REGISTER_METRICS;

  load(program: Program): void {
    this.program = program;
    // Stack-only mode uses stack data as primary; everything else uses register.
    if (program.architectureId === "stack" && this.runMode !== "both") {
      this.states  = MOCK_STACK_STATES;
      this.trace   = MOCK_STACK_TRACE;
      this.metrics = MOCK_STACK_METRICS;
    } else {
      this.states  = MOCK_REGISTER_STATES;
      this.trace   = MOCK_REGISTER_TRACE;
      this.metrics = MOCK_REGISTER_METRICS;
    }
    this.stepIndex = 0;
    this.stackStepIndex = 0;
  }

  reset(): void {
    this.stepIndex = 0;
    this.stackStepIndex = 0;
  }

  step(): MachineState {
    if (!this.isLoaded()) throw new Error("No program loaded.");
    // Pin at the last state rather than overflowing the array.
    if (this.stepIndex < this.states.length - 1) this.stepIndex += 1;
    // In 'both' mode advance the stack cursor in lock-step.
    if (this.runMode === 'both' && this.stackStepIndex < MOCK_STACK_STATES.length - 1) {
      this.stackStepIndex += 1;
    }
    return this.getState();
  }

  run(): MachineState {
    if (!this.isLoaded()) throw new Error("No program loaded.");
    this.stepIndex = this.states.length - 1;
    if (this.runMode === 'both') this.stackStepIndex = MOCK_STACK_STATES.length - 1;
    return this.getState();
  }

  pause(): void {
    // The mock simulator runs synchronously so pause is a no-op here.
    // A real async engine would signal the execution loop to stop.
  }

  getState(): MachineState {
    if (!this.isLoaded()) throw new Error("No program loaded.");
    return this.states[this.stepIndex];
  }

  getMetrics(): ExecutionMetrics {
    if (!this.isLoaded()) throw new Error("No program loaded.");
    return this.metrics;
  }

  getTrace(): TraceEntry[] {
    if (!this.isLoaded()) throw new Error("No program loaded.");
    // Slice trace up to the current step so the UI reflects incremental progress.
    return this.trace.filter((e) => e.step <= this.stepIndex);
  }

  isLoaded(): boolean {
    return this.program !== null;
  }

  setRunMode(mode: RunMode): void {
    this.runMode = mode;
  }

  runBoth(): { register: MachineState; stack: MachineState } {
    if (!this.isLoaded()) throw new Error("No program loaded.");
    this.stepIndex      = MOCK_REGISTER_STATES.length - 1;
    this.stackStepIndex = MOCK_STACK_STATES.length - 1;
    return {
      register: MOCK_REGISTER_STATES[this.stepIndex],
      stack:    MOCK_STACK_STATES[this.stackStepIndex],
    };
  }

  getTranslation(): TranslationResult {
    return MOCK_TRANSLATION;
  }

  getStackMetrics(): ExecutionMetrics {
    return MOCK_STACK_METRICS;
  }

  getStackTrace(): TraceEntry[] {
    return MOCK_STACK_TRACE.filter((e) => e.step <= this.stackStepIndex);
  }

  getStackState(): MachineState {
    return MOCK_STACK_STATES[this.stackStepIndex];
  }
}
