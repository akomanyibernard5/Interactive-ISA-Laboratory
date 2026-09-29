/**
 * ExampleSelector — groups pre-built C programs by category in a Select dropdown.
 */

import { useState } from 'react';
import Select from '@cloudscape-design/components/select';
import type { SelectProps } from '@cloudscape-design/components/select';
import type { ExampleProgram } from '../../utils/types';

interface ExampleSelectorProps {
  examples: ExampleProgram[];
  onSelect: (example: ExampleProgram) => void;
}

const CATEGORY_LABELS: Record<ExampleProgram['category'], string> = {
  arithmetic:       'Arithmetic',
  expression:       'Expressions',
  loop:             'Loops',
  branch:           'Branches',
  'data-processing':'Data Processing',
};

const CATEGORY_ORDER: ExampleProgram['category'][] = [
  'arithmetic',
  'expression',
  'loop',
  'branch',
  'data-processing',
];

export default function ExampleSelector({ examples, onSelect }: ExampleSelectorProps) {
  const [selectedOption, setSelectedOption] = useState<SelectProps.Option | null>(null);

  // Group examples by category, preserving CATEGORY_ORDER
  const grouped = new Map<ExampleProgram['category'], ExampleProgram[]>();
  for (const cat of CATEGORY_ORDER) {
    grouped.set(cat, []);
  }
  for (const ex of examples) {
    const bucket = grouped.get(ex.category);
    if (bucket) bucket.push(ex);
    else grouped.set(ex.category, [ex]);
  }

  // Build Cloudscape option groups
  const options: SelectProps.OptionGroup[] = [];
  for (const [cat, items] of grouped) {
    if (items.length === 0) continue;
    options.push({
      label: CATEGORY_LABELS[cat] ?? cat,
      options: items.map((ex) => ({
        value:       ex.id,
        label:       ex.name,
        description: ex.description,
        labelTag:    ex.expectedOutput,
      })),
    } satisfies SelectProps.OptionGroup);
  }

  function handleChange({ detail }: { detail: SelectProps.ChangeDetail }) {
    const opt = detail.selectedOption;
    setSelectedOption(opt);
    const found = examples.find((ex) => ex.id === opt.value);
    if (found) onSelect(found);
  }

  return (
    <Select
      selectedOption={selectedOption}
      onChange={handleChange}
      options={options}
      placeholder="Load example…"
      empty="No examples available"
      ariaLabel="Select an example C program"
      triggerVariant="option"
    />
  );
}
