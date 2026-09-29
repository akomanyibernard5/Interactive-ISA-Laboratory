import Box from '@cloudscape-design/components/box';
import SpaceBetween from '@cloudscape-design/components/space-between';
import type { MemoryChange } from '../../utils/types';

interface MemorySectionProps {
  changes: MemoryChange[];
  currentStep: number;
}

function toHex(n: number, width = 4): string {
  return '0x' + n.toString(16).toUpperCase().padStart(width, '0');
}

function EmptyState() {
  return (
    <Box textAlign="center" color="inherit" padding="xl">
      <SpaceBetween size="s" direction="vertical">
        <Box variant="strong" color="inherit">No memory activity recorded.</Box>
        <Box color="inherit">Run a program to see memory reads and writes.</Box>
      </SpaceBetween>
    </Box>
  );
}

export default function MemorySection({ changes, currentStep }: MemorySectionProps) {
  if (changes.length === 0) return <EmptyState />;

  const reads  = changes.filter(c => c.accessType === 'read').length;
  const writes = changes.filter(c => c.accessType === 'write').length;

  return (
    <div>
      <div style={{
        display: 'flex', gap: '16px', padding: '8px 12px',
        background: '#f8f9fa', borderRadius: '8px', marginBottom: '10px',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#414d5c' }}>
          {changes.length} operations
        </span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0972d3', display: 'inline-block' }} />
          <span style={{ fontSize: '12px', color: '#414d5c' }}>{reads} reads</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#d91515', display: 'inline-block' }} />
          <span style={{ fontSize: '12px', color: '#414d5c' }}>{writes} writes</span>
        </div>
      </div>

      <div style={{
        fontFamily: "'JetBrains Mono','Fira Code',Consolas,monospace",
        fontSize: '12px',
        border: '1px solid #e9ebed',
        borderRadius: '8px',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '56px 100px 72px 110px 110px',
          background: '#f4f4f4',
          borderBottom: '1px solid #e9ebed',
          padding: '6px 10px',
          gap: '0',
        }}>
          {['Step', 'Address', 'Op', 'Previous', 'New Value'].map(h => (
            <span key={h} style={{
              fontSize: '11px', fontWeight: 700, color: '#414d5c',
              letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
              {h}
            </span>
          ))}
        </div>

        <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
          {changes.map((item, idx) => {
            const isCurrent = item.step === currentStep;
            const isRead = item.accessType === 'read';
            const accentColor = isRead ? '#0972d3' : '#d91515';
            const rowBg = isCurrent
              ? (isRead ? '#f0f7ff' : '#fff5f5')
              : 'transparent';

            return (
              <div
                key={`${item.step}-${item.address}-${idx}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '56px 100px 72px 110px 110px',
                  padding: '5px 10px',
                  borderLeft: isCurrent ? `3px solid ${accentColor}` : '3px solid transparent',
                  background: rowBg,
                  borderBottom: '1px solid #f4f4f4',
                  alignItems: 'center',
                  transition: 'background 0.15s',
                }}
              >
                <span style={{
                  fontWeight: isCurrent ? 700 : 400,
                  color: isCurrent ? accentColor : '#414d5c',
                }}>
                  {item.step}
                </span>
                <span style={{ color: '#6c7787' }}>
                  {item.addressHex.startsWith('0x') ? item.addressHex : toHex(item.address)}
                </span>
                <span style={{
                  display: 'inline-flex', alignItems: 'center',
                  gap: '4px',
                }}>
                  <span style={{
                    fontSize: '10px', fontWeight: 700,
                    color: '#fff',
                    background: accentColor,
                    borderRadius: '3px',
                    padding: '1px 6px',
                    letterSpacing: '0.04em',
                  }}>
                    {isRead ? 'READ' : 'WRITE'}
                  </span>
                </span>
                <span style={{ color: '#8c9ba5' }}>
                  {item.previousValue !== null ? toHex(item.previousValue) : '—'}
                </span>
                <span style={{
                  color: isCurrent ? accentColor : '#414d5c',
                  fontWeight: isCurrent ? 700 : 400,
                }}>
                  {toHex(item.newValue)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
