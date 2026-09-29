import Box from '@cloudscape-design/components/box';
import type { ExecutionMetrics } from '../../utils/types';

interface MetricsBarChartProps {
  registerMetrics: ExecutionMetrics | null;
  stackMetrics: ExecutionMetrics | null;
}

interface StatRowProps {
  label: string;
  reg: number | null;
  stk: number | null;
}

function StatRow({ label, reg, stk }: StatRowProps) {
  const hasReg = reg !== null;
  const hasStk = stk !== null;
  const max = Math.max(reg ?? 0, stk ?? 0, 1);
  const regPct = hasReg ? Math.round(((reg ?? 0) / max) * 100) : 0;
  const stkPct = hasStk ? Math.round(((stk ?? 0) / max) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: '11px', color: '#6c7787', fontWeight: 500 }}>{label}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {hasReg && (
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#0972d3', fontFamily: 'monospace' }}>
              {reg}
            </span>
          )}
          {hasReg && hasStk && (
            <span style={{ fontSize: '10px', color: '#c4c9d0' }}>vs</span>
          )}
          {hasStk && (
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#037f0c', fontFamily: 'monospace' }}>
              {stk}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {hasReg && (
          <div style={{ height: '5px', background: '#f0f2f3', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${regPct}%`,
              background: 'linear-gradient(90deg, #0972d3, #1a8fe3)',
              borderRadius: '3px',
              transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
              minWidth: (reg ?? 0) > 0 ? '4px' : '0',
            }} />
          </div>
        )}
        {hasStk && (
          <div style={{ height: '5px', background: '#f0f2f3', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${stkPct}%`,
              background: 'linear-gradient(90deg, #037f0c, #1a9e24)',
              borderRadius: '3px',
              transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
              minWidth: (stk ?? 0) > 0 ? '4px' : '0',
            }} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function MetricsBarChart({ registerMetrics, stackMetrics }: MetricsBarChartProps) {
  const hasAny = registerMetrics !== null || stackMetrics !== null;

  if (!hasAny) {
    return (
      <Box textAlign="center" color="text-body-secondary" padding="m">
        <Box variant="strong" color="inherit">No metrics yet</Box>
        <Box color="inherit" fontSize="body-s">Run a program to see metrics.</Box>
      </Box>
    );
  }

  const rows: StatRowProps[] = [
    {
      label: 'Instructions',
      reg: registerMetrics?.dynamicInstructionCount ?? null,
      stk: stackMetrics?.dynamicInstructionCount ?? null,
    },
    {
      label: 'Mem Ops',
      reg: registerMetrics ? registerMetrics.memoryReads + registerMetrics.memoryWrites : null,
      stk: stackMetrics    ? stackMetrics.memoryReads    + stackMetrics.memoryWrites    : null,
    },
    {
      label: 'Size (bytes)',
      reg: registerMetrics?.programSizeBytes ?? null,
      stk: stackMetrics?.programSizeBytes ?? null,
    },
    {
      label: 'Est. Cost',
      reg: registerMetrics?.estimatedCost ?? null,
      stk: stackMetrics?.estimatedCost ?? null,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '10px', height: '5px', borderRadius: '2px', background: '#0972d3', display: 'inline-block' }} />
          <span style={{ fontSize: '11px', color: '#6c7787' }}>Register</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '10px', height: '5px', borderRadius: '2px', background: '#037f0c', display: 'inline-block' }} />
          <span style={{ fontSize: '11px', color: '#6c7787' }}>Stack</span>
        </div>
      </div>

      {rows.map(r => <StatRow key={r.label} {...r} />)}
    </div>
  );
}
