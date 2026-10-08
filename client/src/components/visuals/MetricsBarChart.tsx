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
  icon?: string;
  color?: string;
}

function StatRow({ label, reg, stk, icon, color }: StatRowProps) {
  const hasReg = reg !== null;
  const hasStk = stk !== null;
  const max = Math.max(reg ?? 0, stk ?? 0, 1);
  const regPct = hasReg ? Math.round(((reg ?? 0) / max) * 100) : 0;
  const stkPct = hasStk ? Math.round(((stk ?? 0) / max) * 100) : 0;

  return (
    <div style={{
      background: '#fff',
      borderRadius: '8px',
      padding: '10px 12px',
      border: '1px solid #e9ebed',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {icon && <span style={{ fontSize: '14px' }}>{icon}</span>}
          <span style={{ fontSize: '12px', color: '#414d5c', fontWeight: 600 }}>{label}</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {hasReg && (
            <span style={{
              fontSize: '14px',
              fontWeight: 800,
              color: '#0972d3',
              fontFamily: 'monospace',
              background: '#f0f7ff',
              padding: '2px 8px',
              borderRadius: '4px',
            }}>
              {reg}
            </span>
          )}
          {hasReg && hasStk && (
            <span style={{ fontSize: '10px', color: '#8c9ba5', fontWeight: 600 }}>VS</span>
          )}
          {hasStk && (
            <span style={{
              fontSize: '14px',
              fontWeight: 800,
              color: '#037f0c',
              fontFamily: 'monospace',
              background: '#f0fff4',
              padding: '2px 8px',
              borderRadius: '4px',
            }}>
              {stk}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {hasReg && (
          <div style={{ height: '8px', background: '#f0f2f3', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${regPct}%`,
              background: 'linear-gradient(90deg, #0972d3 0%, #1a8fe3 50%, #3aa3f0 100%)',
              borderRadius: '4px',
              transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
              minWidth: (reg ?? 0) > 0 ? '8px' : '0',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)',
            }} />
          </div>
        )}
        {hasStk && (
          <div style={{ height: '8px', background: '#f0f2f3', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${stkPct}%`,
              background: 'linear-gradient(90deg, #037f0c 0%, #1a9e24 50%, #3abf24 100%)',
              borderRadius: '4px',
              transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
              minWidth: (stk ?? 0) > 0 ? '8px' : '0',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)',
            }} />
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value, unit, color }: { label: string; value: number | null; unit?: string; color: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '8px 6px',
      background: `${color}10`,
      borderRadius: '6px',
      border: `1px solid ${color}30`,
    }}>
      <span style={{ fontSize: '10px', color: '#6c7787', fontWeight: 500, marginBottom: '2px' }}>{label}</span>
      <span style={{ fontSize: '16px', fontWeight: 800, color, fontFamily: 'monospace' }}>
        {value ?? '—'}
      </span>
      {unit && <span style={{ fontSize: '9px', color: '#8c9ba5' }}>{unit}</span>}
    </div>
  );
}

export default function MetricsBarChart({ registerMetrics, stackMetrics }: MetricsBarChartProps) {
  const hasAny = registerMetrics !== null || stackMetrics !== null;

  if (!hasAny) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '280px',
        background: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
        borderRadius: '8px',
        border: '2px dashed #d5dbdb',
      }}>
        <span style={{ fontSize: '32px', marginBottom: '8px' }}>📊</span>
        <Box variant="strong" color="text-body-secondary">No metrics yet</Box>
        <Box color="text-body-secondary" fontSize="body-s">Run a program to see metrics.</Box>
      </div>
    );
  }

  const rows: StatRowProps[] = [
    {
      label: 'Instructions',
      reg: registerMetrics?.dynamicInstructionCount ?? null,
      stk: stackMetrics?.dynamicInstructionCount ?? null,
      icon: '⚡',
      color: '#0972d3',
    },
    {
      label: 'Memory Ops',
      reg: registerMetrics ? registerMetrics.memoryReads + registerMetrics.memoryWrites : null,
      stk: stackMetrics    ? stackMetrics.memoryReads    + stackMetrics.memoryWrites    : null,
      icon: '💾',
      color: '#b26900',
    },
    {
      label: 'Program Size',
      reg: registerMetrics?.programSizeBytes ?? null,
      stk: stackMetrics?.programSizeBytes ?? null,
      icon: '📦',
      color: '#6b21a8',
    },
    {
      label: 'Estimated Cost',
      reg: registerMetrics?.estimatedCost ?? null,
      stk: stackMetrics?.estimatedCost ?? null,
      icon: '💰',
      color: '#037f0c',
    },
  ];

  const regReads = registerMetrics?.memoryReads ?? 0;
  const regWrites = registerMetrics?.memoryWrites ?? 0;
  const stkReads = stackMetrics?.memoryReads ?? 0;
  const stkWrites = stackMetrics?.memoryWrites ?? 0;
  const regBranches = registerMetrics?.branchCount ?? 0;
  const stkBranches = stackMetrics?.branchCount ?? 0;

  return (
    <div style={{ minHeight: '340px', height: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: '16px',
        padding: '8px 12px',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        borderRadius: '8px',
        border: '1px solid #e9ebed',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '14px', height: '8px', borderRadius: '2px', background: 'linear-gradient(90deg, #0972d3, #1a8fe3)' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#414d5c' }}>Register VM</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '14px', height: '8px', borderRadius: '2px', background: 'linear-gradient(90deg, #037f0c, #1a9e24)' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#414d5c' }}>Stack VM</span>
        </div>
      </div>

      {/* Main stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {rows.map(r => <StatRow key={r.label} {...r} />)}
      </div>

      {/* Mini stats grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '6px',
        marginTop: 'auto',
      }}>
        <MiniStat label="Reg Reads" value={regReads} color="#0972d3" />
        <MiniStat label="Reg Writes" value={regWrites} color="#d91515" />
        <MiniStat label="Reg Branch" value={regBranches} color="#6b21a8" />
        <MiniStat label="Stk Reads" value={stkReads} color="#037f0c" />
        <MiniStat label="Stk Writes" value={stkWrites} color="#b26900" />
        <MiniStat label="Stk Branch" value={stkBranches} color="#8b4513" />
      </div>
    </div>
  );
}
