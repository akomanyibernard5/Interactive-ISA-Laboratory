// Wraps MockSimulator in a React hook so components never touch the simulator
// directly. A single LabState slice keeps all updates atomic and avoids tearing.

import { useRef, useState, useCallback } from 'react';
import type { LabState, RunMode } from '../utils/types';
import { MockSimulator } from './MockSimulator';
import { MOCK_REGISTER_PROGRAM, MOCK_STACK_PROGRAM } from '../data/mockPrograms';

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

export function useSimulator(): UseSimulatorReturn {
  // useRef keeps the simulator alive across renders without triggering re-renders.
  const simRef = useRef<MockSimulator>(new MockSimulator());
  const [labState, setLabState] = useState<LabState>(INITIAL_LAB_STATE);

  const load = useCallback((_sourceId: string, runMode: RunMode) => {
    const sim = simRef.current;
    // Stack-only mode drives step count from the stack program.
    const primaryProgram = runMode === 'stack' ? MOCK_STACK_PROGRAM : MOCK_REGISTER_PROGRAM;
    sim.setRunMode(runMode);
    sim.load(primaryProgram);

    const registerState   = runMode === 'stack'    ? null : sim.getState();
    const stackState      = runMode === 'register' ? null : sim.getStackState();
    const registerMetrics = runMode === 'stack'    ? null : sim.getMetrics();
    const stackMetrics    = runMode === 'register' ? null : sim.getStackMetrics();
    const registerTrace   = runMode === 'stack'    ? []   : sim.getTrace();
    const stackTrace      = runMode === 'register' ? []   : sim.getStackTrace();
    const translation     = sim.getTranslation();
    const memoryChanges   = registerTrace.flatMap(e => e.memoryChanges);

    setLabState({
      runMode, registerState, stackState, registerMetrics, stackMetrics,
      registerTrace, stackTrace, memoryChanges, translation,
      executionStatus: 'paused', currentStep: 0,
    });
  }, []);

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
        memoryChanges, executionStatus: newState.status, currentStep,
      };
    });
  }, []);

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
        memoryChanges, executionStatus: finalState.status, currentStep,
      };
    });
  }, []);

  const runBoth = useCallback(() => {
    const sim = simRef.current;
    if (!sim.isLoaded()) return;
    const { register, stack } = sim.runBoth();
    const registerTrace   = sim.getTrace();
    const stackTrace      = sim.getStackTrace();
    const registerMetrics = sim.getMetrics();
    const stackMetrics    = sim.getStackMetrics();
    // Use the larger step count so the UI reflects the longer of the two runs.
    const currentStep   = Math.max(register.step, stack.step);
    const memoryChanges = registerTrace.flatMap(e => e.memoryChanges);
    setLabState(prev => ({
      ...prev,
      registerState: register, stackState: stack,
      registerMetrics, stackMetrics, registerTrace, stackTrace,
      memoryChanges, executionStatus: register.status, currentStep,
    }));
  }, []);

  const reset = useCallback(() => {
    const sim = simRef.current;
    if (!sim.isLoaded()) return;
    sim.reset();
    setLabState(prev => {
      const isRegisterMode = prev.runMode !== 'stack';
      const isBothMode     = prev.runMode === 'both';
      const registerState   = isRegisterMode ? sim.getState()      : null;
      const stackState      = isBothMode     ? sim.getStackState() : (!isRegisterMode ? sim.getState() : null);
      const registerMetrics = isRegisterMode ? sim.getMetrics()    : null;
      const stackMetrics    = isBothMode     ? sim.getStackMetrics(): (!isRegisterMode ? sim.getMetrics() : null);
      const registerTrace   = isRegisterMode ? sim.getTrace()      : [];
      const stackTrace      = (isBothMode || !isRegisterMode) ? sim.getStackTrace() : [];
      return {
        ...prev, registerState, stackState, registerMetrics, stackMetrics,
        registerTrace, stackTrace, memoryChanges: [], executionStatus: 'paused', currentStep: 0,
      };
    });
  }, []);

  const setRunMode = useCallback((mode: RunMode) => {
    simRef.current.setRunMode(mode);
    setLabState(prev => ({ ...prev, runMode: mode }));
  }, []);

  const isLoaded = labState.executionStatus !== 'idle';

  return { labState, load, step, run, runBoth, reset, setRunMode, isLoaded };
}
