import ExpandableSection from '@cloudscape-design/components/expandable-section';
import ColumnLayout from '@cloudscape-design/components/column-layout';
import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import RegisterStatePanel from '../RegisterStatePanel';
import OperandStackPanel from '../OperandStackPanel';
import type { MachineState, RunMode } from '../../types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface MachineStateSectionProps {
  registerState: MachineState | null;
  stackState: MachineState | null;
  runMode: RunMode;
  expanded: boolean;
  onToggle: () => void;
}

// ---------------------------------------------------------------------------
// Helpers — extract sub-state types from the discriminated union
// ---------------------------------------------------------------------------

function toRegisterState(ms: MachineState | null) {
  if (!ms || ms.kind !== 'register') return null;
  return ms.state;
}

function toStackState(ms: MachineState | null) {
  if (!ms || ms.kind !== 'stack') return null;
  return ms.state;
}

// ---------------------------------------------------------------------------
// Panel header labels
// ---------------------------------------------------------------------------

function PanelLabel({ text }: { text: string }) {
  return (
    <Box variant="h3" padding={{ bottom: 'xs' }}>
      {text}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ message }: { message: string }) {
  return (
    <Box textAlign="center" color="inherit" padding="xl">
      <Box variant="strong" color="inherit">
        {message}
      </Box>
      <Box color="inherit" padding={{ top: 'xs' }}>
        Load and step through a program to see machine state.
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MachineStateSection({
  registerState,
  stackState,
  runMode,
  expanded,
  onToggle,
}: MachineStateSectionProps) {
  const regState = toRegisterState(registerState);
  const stkState = toStackState(stackState);

  let content: React.ReactNode;

  if (runMode === 'both') {
    content = (
      <ColumnLayout columns={2} variant="default">
        {/* Left: Register VM */}
        <SpaceBetween size="xs">
          <PanelLabel text="Register VM" />
          {registerState === null ? (
            <EmptyState message="No register state available" />
          ) : (
            <RegisterStatePanel state={regState} />
          )}
        </SpaceBetween>

        {/* Right: Stack VM */}
        <SpaceBetween size="xs">
          <PanelLabel text="Stack VM" />
          {stackState === null ? (
            <EmptyState message="No stack state available" />
          ) : (
            <OperandStackPanel state={stkState} />
          )}
        </SpaceBetween>
      </ColumnLayout>
    );
  } else if (runMode === 'register') {
    content =
      registerState === null ? (
        <EmptyState message="No register state available" />
      ) : (
        <RegisterStatePanel state={regState} />
      );
  } else {
    // runMode === 'stack'
    content =
      stackState === null ? (
        <EmptyState message="No stack state available" />
      ) : (
        <OperandStackPanel state={stkState} />
      );
  }

  return (
    <ExpandableSection
      variant="container"
      headerText="Machine State"
      expanded={expanded}
      onChange={onToggle}
    >
      {content}
    </ExpandableSection>
  );
}
