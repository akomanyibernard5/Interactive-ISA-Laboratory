/**
 * useSimulator — React hook that wraps MockSimulator and exposes a
 * LabState-centric API to UI components.
 *
 * Design decisions:
 *   - The MockSimulator instance lives in a useRef so it is never recreated
 *     across renders.
 *   - All React state is held in a single useState<LabState> to keep updates
 *     atomic and avoid tearing.
 *   - No ISA semantics are implemented here; the hook only orchestrates
 *     mock data replay by calling into MockSimulator.
 */

import { useRef, useState, useCallback } from 'react';
import type { LabState, RunMode } from '../types/lab';
import { MockSimulator } from './MockSimulator';
import {
  MOCK_REGISTER_PROGRAM,
  MOCK_STACK_PROGRAM,
} from '../data/mockPrograms';

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface UseSimulatorReturn {
  labState: LabState;
  load: (sourceId: string, runMode: RunMode) => void;
  step: () => void;
  run: () => void;
  runBoth: () => void;
  reset: () => void;
  setRunMode: (mode: RunMode) => void;
  isLoaded: boolean;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const INITIAL_LAB_STATE: LabState = {
  runMode: 'register',
  registerState: null,
  stackState: null,
  registerMetrics: null,
  stackMetrics: null,
  registerTrace: [],
  stackTrace: [],
  memoryChanges: [],
  translation: null,
  executionStatus: 'idle',
  currentStep: 0,
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSimulator(): UseSimulatorReturn {
  // One simulator instance for the lifetime of the component.
  const simRef = useRef<MockSimulator>(new MockSimulator());

  // All UI-visible state in one atomic slice.
  const [labState, setLabState] = useState<LabState>(INITIAL_LAB_STATE);

  // -------------------------------------------------------------------------
  // load
  // -------------------------------------------------------------------------
  const load = useCallback((_sourceId: string, runMode: RunMode) => {
    const sim = simRef.current;

    // Pick the register program (the primary driver for step count).
    // For 'stack'-only mode, load the stack program instead.
    const primaryProgram =
      runMode === 'stack' ? MOCK_STACK_PROGRAM : MOCK_REGISTER_PROGRAM;

    sim.setRunMode(runMode);
    sim.load(primaryProgram);

    // Snapshot all data immediately after load (step 0 = idle).
    const registerState   = runMode === 'stack' ? null : sim.getState();
    const stackState      = runMode === 'register' ? null : sim.getStackState();
    const registerMetrics = runMode === 'stack' ? null : sim.getMetrics();
    const stackMetrics    = runMode === 'register' ? null : sim.getStackMetrics();
    const registerTrace   = runMode === 'stack' ? [] : sim.getTrace();
    const stackTrace      = runMode === 'register' ? [] : sim.getStackTrace();
    const translation     = sim.getTranslation();

    // Collect memory changes from trace entries at step 0 (empty at idle).
    const memoryChanges   = registerTrace.flatMap(e => e.memoryChanges);

    setLabState({
      runMode,
      registerState,
      stackState,
      registerMetrics,
      stackMetrics,
      registerTrace,
      stackTrace,
      memoryChanges,
      translation,
      executionStatus: 'paused',
      currentStep: 0,
    });
  }, []);

  // -------------------------------------------------------------------------
  // step
  // -------------------------------------------------------------------------
  const step = useCallback(() => {
    const sim = simRef.current;
    if (!sim.isLoaded()) return;

    const newState    = sim.step();
    const trace       = sim.getTrace();
    const metrics     = sim.getMetrics();
    const currentStep = newState.step;

    setLabState(prev => {
      const isRegisterMode = prev.runMode !== 'stack';
      const memoryChanges  = trace.flatMap(e => e.memoryChanges);

      return {
        ...prev,
        registerState:   isRegisterMode ? newState : prev.registerState,
        stackState:      !isRegisterMode ? newState : prev.stackState,
        registerMetrics: isRegisterMode ? metrics : prev.registerMetrics,
        stackMetrics:    !isRegisterMode ? metrics : prev.stackMetrics,
        registerTrace:   isRegisterMode ? trace : prev.registerTrace,
        stackTrace:      !isRegisterMode ? trace : prev.stackTrace,
        memoryChanges,
        executionStatus: newState.status,
        currentStep,
      };
    });
  }, []);

  // -------------------------------------------------------------------------
  // run
  // -------------------------------------------------------------------------
  const run = useCallback(() => {
    const sim = simRef.current;
    if (!sim.isLoaded()) return;

    const finalState  = sim.run();
    const trace       = sim.getTrace();
    const metrics     = sim.getMetrics();
    const currentStep = finalState.step;

    setLabState(prev => {
      const isRegisterMode = prev.runMode !== 'stack';
      const memoryChanges  = trace.flatMap(e => e.memoryChanges);

      return {
        ...prev,
        registerState:   isRegisterMode ? finalState : prev.registerState,
        stackState:      !isRegisterMode ? finalState : prev.stackState,
        registerMetrics: isRegisterMode ? metrics : prev.registerMetrics,
        stackMetrics:    !isRegisterMode ? metrics : prev.stackMetrics,
        registerTrace:   isRegisterMode ? trace : prev.registerTrace,
        stackTrace:      !isRegisterMode ? trace : prev.stackTrace,
        memoryChanges,
        executionStatus: finalState.status,
        currentStep,
      };
    });
  }, []);

  // -------------------------------------------------------------------------
  // runBoth
  // -------------------------------------------------------------------------
  const runBoth = useCallback(() => {
    const sim = simRef.current;
    if (!sim.isLoaded()) return;

    const { register, stack } = sim.runBoth();
    const registerTrace       = sim.getTrace();
    const stackTrace          = sim.getStackTrace();
    const registerMetrics     = sim.getMetrics();
    const stackMetrics        = sim.getStackMetrics();

    // Use the larger step count as the canonical currentStep.
    const currentStep = Math.max(register.step, stack.step);

    const memoryChanges = registerTrace.flatMap(e => e.memoryChanges);

    setLabState(prev => ({
      ...prev,
      registerState:   register,
      stackState:      stack,
      registerMetrics,
      stackMetrics,
      registerTrace,
      stackTrace,
      memoryChanges,
      executionStatus: register.status, // both are 'halted'
      currentStep,
    }));
  }, []);

  // -------------------------------------------------------------------------
  // reset
  // -------------------------------------------------------------------------
  const reset = useCallback(() => {
    const sim = simRef.current;
    if (!sim.isLoaded()) return;

    sim.reset();

    // Re-read the idle state without changing runMode or translation.
    setLabState(prev => {
      const isRegisterMode = prev.runMode !== 'stack';
      const isBothMode     = prev.runMode === 'both';

      const registerState   = isRegisterMode ? sim.getState()       : null;
      const stackState      = isBothMode     ? sim.getStackState()  : (!isRegisterMode ? sim.getState() : null);
      const registerMetrics = isRegisterMode ? sim.getMetrics()     : null;
      const stackMetrics    = isBothMode     ? sim.getStackMetrics(): (!isRegisterMode ? sim.getMetrics() : null);
      const registerTrace   = isRegisterMode ? sim.getTrace()       : [];
      const stackTrace      = (isBothMode || !isRegisterMode) ? sim.getStackTrace() : [];

      return {
        ...prev,
        registerState,
        stackState,
        registerMetrics,
        stackMetrics,
        registerTrace,
        stackTrace,
        memoryChanges: [],
        executionStatus: 'paused',
        currentStep: 0,
      };
    });
  }, []);

  // -------------------------------------------------------------------------
  // setRunMode
  // -------------------------------------------------------------------------
  const setRunMode = useCallback((mode: RunMode) => {
    simRef.current.setRunMode(mode);
    setLabState(prev => ({ ...prev, runMode: mode }));
  }, []);

  // -------------------------------------------------------------------------
  // Derived flag
  // -------------------------------------------------------------------------
  const isLoaded = labState.executionStatus !== 'idle';

  return {
    labState,
    load,
    step,
    run,
    runBoth,
    reset,
    setRunMode,
    isLoaded,
  };
}
