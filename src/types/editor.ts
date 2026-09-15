/** One example C program shown in the editor example selector */
export interface ExampleProgram {
  id: string;
  name: string;
  category: 'arithmetic' | 'expression' | 'loop' | 'branch' | 'data-processing';
  description: string;
  cSource: string;        // the C subset source text
  expectedOutput: string; // e.g. 'x = 16'
}

/** The current state of the C source editor */
export interface EditorState {
  source: string;
  programName: string;
  isDirty: boolean;       // has the user modified since last run
  errors: EditorError[];
}

export interface EditorError {
  line: number;
  column: number;
  message: string;
}
