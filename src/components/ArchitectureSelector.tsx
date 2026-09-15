import Select from '@cloudscape-design/components/select';
import type { ArchitectureId } from '../types';

interface ArchitectureSelectorProps {
  value: ArchitectureId;
  onChange: (id: ArchitectureId) => void;
  disabled?: boolean;
}

const ARCHITECTURE_OPTIONS = [
  { value: 'register' as ArchitectureId, label: 'Register Machine' },
  { value: 'stack' as ArchitectureId, label: 'Stack Machine' },
];

export default function ArchitectureSelector({
  value,
  onChange,
  disabled = false,
}: ArchitectureSelectorProps) {
  const selectedOption =
    ARCHITECTURE_OPTIONS.find((opt) => opt.value === value) ?? ARCHITECTURE_OPTIONS[0];

  return (
    <Select
      selectedOption={selectedOption}
      onChange={({ detail }) => {
        const next = detail.selectedOption.value as ArchitectureId;
        onChange(next);
      }}
      options={ARCHITECTURE_OPTIONS}
      disabled={disabled}
      ariaLabel="Select architecture"
    />
  );
}
