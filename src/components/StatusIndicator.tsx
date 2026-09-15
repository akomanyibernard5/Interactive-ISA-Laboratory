import CloudscapeStatusIndicator from '@cloudscape-design/components/status-indicator';

interface StatusIndicatorProps {
  status: 'idle' | 'running' | 'paused' | 'halted' | 'error' | 'loading' | 'pending' | 'completed';
  label?: string;
}

type CloudscapeStatusType =
  | 'error'
  | 'warning'
  | 'success'
  | 'info'
  | 'stopped'
  | 'pending'
  | 'in-progress'
  | 'loading';

const STATUS_MAP: Record<StatusIndicatorProps['status'], CloudscapeStatusType> = {
  idle: 'stopped',
  running: 'in-progress',
  paused: 'pending',
  halted: 'success',
  error: 'error',
  loading: 'loading',
  pending: 'pending',
  completed: 'success',
};

const DEFAULT_LABELS: Record<StatusIndicatorProps['status'], string> = {
  idle: 'Idle',
  running: 'Running',
  paused: 'Paused',
  halted: 'Halted',
  error: 'Error',
  loading: 'Loading',
  pending: 'Pending',
  completed: 'Completed',
};

export default function StatusIndicator({ status, label }: StatusIndicatorProps) {
  return (
    <CloudscapeStatusIndicator type={STATUS_MAP[status]}>
      {label ?? DEFAULT_LABELS[status]}
    </CloudscapeStatusIndicator>
  );
}
