/**
 * MockSimulator — ISimulator implementation backed by pre-computed demo data.
 *
 * This class replays fixed MachineState snapshots and TraceEntry arrays that
 * were authored in src/data/.  It contains NO ISA semantics, NO instruction
 * decoding, and NO execution logic.  When the C++ simulation engine is ready,
 * replace this class with a WebAssembly-backed implementation; the ISimulator
 * interface is unchanged.
 *
 * Extensions beyond ISimulator (not part of the interface):
 *   - setRunMode(mode)  — switches primary/display architecture
 *   - runBoth()         — advances both VMs to halted, returns both states
 *   - getTranslation()  — returns the mock C-to-IR translation result
 */

import type {
  ISimulator,
  MachineState,
  ExecutionMetrics,
  TraceEntry,
  Program,
} from '../types';
import type { TranslationResult } from '../types/translation';
import type { RunMode } from '../types/lab';
import {
  MOCK_REGISTER_STATES,
  MOCK_STACK_STATES,
} from '../data/mockMachineStates';
import {
  MOCK_REGISTER_TRACE,
  MOCK_STACK_TRACE,
} from '../data/mockTrace';
import {
  MOCK_REGISTER_METRICS,
  MOCK_STACK_METRICS,
} from '../data/mockMetrics';
import { MOCK_TRANSLATION } from '../data/mockTranslation';

export class MockSimulator implements ISimulator {
  // The currently-loaded program, or null if nothing has been loaded.
  private program: Program | null = null;

  // Current run mode; 'both' routes primary display through register data.
  private runMode: RunMode = 'register';

  // Index into the primary states/trace arrays (0 = initial/idle state).
  private stepIndex: number = 0;

  // Separate index for the secondary (stack) VM when runMode === 'both'.
  private stackStepIndex: number = 0;

  // Resolved data arrays for the primary VM — set when a program is loaded.
  private states: MachineState[] = [];
  private trace: TraceEntry[] = [];
  private metrics: ExecutionMetrics = MOCK_REGISTER_METRICS;

  // -------------------------------------------------------------------------
  // ISimulator implementation
  // -------------------------------------------------------------------------

  /**
   * Load a program.  Selects the correct mock data arrays based on
   * program.architectureId (or runMode), resets the step counter, and sets
   * status to 'paused' (via the first paused state in the array).
   */
  load(program: Program): void {
    this.program = program;

    if (program.architectureId === 'stack' && this.runMode !== 'both') {
      this.states  = MOCK_STACK_STATES;
      this.trace   = MOCK_STACK_TRACE;
      this.metrics = MOCK_STACK_METRICS;
    } else {
      // 'register' or 'both' → primary display is register data
      this.states  = MOCK_REGISTER_STATES;
      this.trace   = MOCK_REGISTER_TRACE;
      this.metrics = MOCK_REGISTER_METRICS;
    }

    // Step 0 is the initial idle snapshot; loading leaves us ready to step.
    this.stepIndex      = 0;
    this.stackStepIndex = 0;
  }

  /**
   * Reset the simulator to its initial state (step 0) without changing the
   * loaded program or the selected data arrays.
   */
  reset(): void {
    this.stepIndex      = 0;
    this.stackStepIndex = 0;
  }

  /**
   * Advance one step in the pre-computed state sequence.
   * If already at the last state (halted), the index stays pinned there.
   * Returns the new current MachineState.
   *
   * When runMode is 'both', this advances the register (primary) state only.
   * Use runBoth() to advance both simultaneously.
   */
  step(): MachineState {
    if (!this.isLoaded()) {
      throw new Error('MockSimulator: no program loaded — call load() first.');
    }

    const lastIndex = this.states.length - 1;
    if (this.stepIndex < lastIndex) {
      this.stepIndex += 1;
    }
    return this.getState();
  }

  /**
   * Jump directly to the last state in the sequence (halted).
   * Returns the final MachineState.
   *
   * When runMode is 'both', this jumps the register (primary) state to
   * halted only.  Use runBoth() to run both to completion.
   */
  run(): MachineState {
    if (!this.isLoaded()) {
      throw new Error('MockSimulator: no program loaded — call load() first.');
    }

    this.stepIndex = this.states.length - 1;
    return this.getState();
  }

  /**
   * Return the MachineState snapshot at the current step index.
   */
  getState(): MachineState {
    if (!this.isLoaded()) {
      throw new Error('MockSimulator: no program loaded — call load() first.');
    }

    return this.states[this.stepIndex];
  }

  /**
   * Return the pre-computed ExecutionMetrics for the loaded program's
   * architecture.  Values are fixed demo data; estimatedCost is a placeholder.
   */
  getMetrics(): ExecutionMetrics {
    if (!this.isLoaded()) {
      throw new Error('MockSimulator: no program loaded — call load() first.');
    }

    return this.metrics;
  }

  /**
   * Return all TraceEntry records up to and including the current step.
   * Step 0 is the idle/initial state and has no corresponding trace entry,
   * so trace entries are returned for steps 1..stepIndex.
   */
  getTrace(): TraceEntry[] {
    if (!this.isLoaded()) {
      throw new Error('MockSimulator: no program loaded — call load() first.');
    }

    return this.trace.filter(entry => entry.step <= this.stepIndex);
  }

  /**
   * Returns true when a program has been loaded via load().
   */
  isLoaded(): boolean {
    return this.program !== null;
  }

  // -------------------------------------------------------------------------
  // Extensions — NOT part of ISimulator
  // -------------------------------------------------------------------------

  /**
   * Set the current run mode.
   *
   * - 'register' / 'stack': standard single-architecture replay.
   * - 'both': subsequent step() and run() calls advance the register VM as
   *   the primary display; use runBoth() to advance both architectures at once.
   *
   * Calling this after load() is supported; the data arrays are NOT re-selected
   * here — reload the program if you need the primary arrays to change.
   */
  setRunMode(mode: RunMode): void {
    this.runMode = mode;
  }

  /**
   * Advance BOTH the register VM and the stack VM all the way to their halted
   * states and return both final MachineState snapshots.
   *
   * This is the canonical way to obtain both results in 'both' mode.
   * After this call:
   *   - The register primary step index is pinned at the last register state.
   *   - The internal stack step index is pinned at the last stack state.
   *
   * Throws if no program has been loaded.
   */
  runBoth(): { register: MachineState; stack: MachineState } {
    if (!this.isLoaded()) {
      throw new Error('MockSimulator: no program loaded — call load() first.');
    }

    this.stepIndex      = MOCK_REGISTER_STATES.length - 1;
    this.stackStepIndex = MOCK_STACK_STATES.length - 1;

    return {
      register: MOCK_REGISTER_STATES[this.stepIndex],
      stack:    MOCK_STACK_STATES[this.stackStepIndex],
    };
  }

  /**
   * Return the mock C-to-CommonIR translation result for the currently
   * loaded program (or the demo translation if nothing specific is loaded).
   * The returned value is the pre-authored MOCK_TRANSLATION constant.
   */
  getTranslation(): TranslationResult {
    return MOCK_TRANSLATION;
  }

  // -------------------------------------------------------------------------
  // Stack VM helpers (used internally by runBoth and by useSimulator)
  // -------------------------------------------------------------------------

  /** Return the stack VM metrics (always MOCK_STACK_METRICS). */
  getStackMetrics(): ExecutionMetrics {
    return MOCK_STACK_METRICS;
  }

  /**
   * Return stack trace entries up to the current internal stack step index.
   * When mode is 'both', this reflects how far the stack VM has progressed.
   */
  getStackTrace(): TraceEntry[] {
    return MOCK_STACK_TRACE.filter(entry => entry.step <= this.stackStepIndex);
  }

  /**
   * Return the current stack VM MachineState.
   * Starts at the idle snapshot (index 0) and advances via runBoth().
   */
  getStackState(): MachineState {
    return MOCK_STACK_STATES[this.stackStepIndex];
  }
}
