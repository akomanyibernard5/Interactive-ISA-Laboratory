import Select from '@cloudscape-design/components/select';
import type { Program } from '../types';

interface ProgramSelectorProps {
  programs: Program[];
  selectedId: string | null;
  onSelect: (programId: string) => void;
  disabled?: boolean;
}

export default function ProgramSelector({
  programs,
  selectedId,
  onSelect,
  disabled = false,
}: ProgramSelectorProps) {
  const options = programs.map((p) => ({
    value: p.id,
    label: p.name,
    description: p.description,
  }));

  const selectedOption = options.find((o) => o.value === selectedId) ?? null;

  return (
    <Select
      selectedOption={selectedOption}
      onChange={({ detail }) => {
        if (detail.selectedOption.value) {
          onSelect(detail.selectedOption.value);
        }
      }}
      options={options}
      disabled={disabled}
      placeholder="Select a program"
      empty="No programs available"
      ariaLabel="Select program"
    />
  );
}
