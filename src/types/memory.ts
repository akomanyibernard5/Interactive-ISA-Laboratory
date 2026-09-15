export type MemoryAccessType = 'read' | 'write';

export interface MemoryChange {
  step: number;
  address: number;
  addressHex: string;
  previousValue: number | null;
  newValue: number;
  accessType: MemoryAccessType;
}
