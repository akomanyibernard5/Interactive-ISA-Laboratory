import type { ISimulator } from '../utils/types';
import { MockSimulator } from './MockSimulator';

/**
 * Returns the active simulator implementation.
 * Currently returns a mock simulator backed by pre-computed demo data.
 * Replace with WebAssembly simulator when the C++ engine is ready.
 */
export function createSimulator(): ISimulator {
  return new MockSimulator();
}
