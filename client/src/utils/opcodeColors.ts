// Shared opcode → colour map used by CurrentInstructionPanel, TraceSection,
// and PipelineVisual. Import from here instead of duplicating.

export const OPCODE_COLORS: Record<string, string> = {
  LOAD_CONSTANT:  '#0972d3',
  LOAD_VARIABLE:  '#0972d3',
  STORE_VARIABLE: '#7d2105',
  ADD:            '#037f0c',
  SUB:            '#037f0c',
  MUL:            '#037f0c',
  DIV:            '#037f0c',
  COMPARE:        '#8b4513',
  JUMP:           '#6b21a8',
  JUMP_IF_ZERO:   '#6b21a8',
  LABEL:          '#6b21a8',
  HALT:           '#d91515',
};
