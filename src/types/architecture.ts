export type ArchitectureId = 'register' | 'stack';

export interface Architecture {
  id: ArchitectureId;
  name: string;
  description: string;
}
