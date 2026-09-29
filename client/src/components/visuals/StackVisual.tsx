import { useRef, useEffect, useState } from 'react';
import type { StackState } from '../../utils/types';

function toHex(n: number): string {
  return '0x' + n.toString(16).toUpperCase().padStart(4, '0');
}

const LEVEL_COLORS = [
  '#0972d3', '#1a8fe3', '#3aa3f0', '#6bbdf5',
  '#9dd0f8', '#c4e3fb', '#ddeffe', '#eef7ff',
];

interface StackVisualProps {
  state: StackState;
}

export default function StackVisual({ state }: StackVisualProps) {
  const prevLenRef = useRef(state.stack.length);
  const [topAction, setTopAction] = useState<'push' | 'pop' | null>(null);

  useEffect(() => {
    const prev = prevLenRef.current;
    const cur = state.stack.length;
    if (cur > prev) setTopAction('push');
    else if (cur < prev) setTopAction('pop');
    prevLenRef.current = cur;
    if (cur !== prev) {
      const t = setTimeout(() => setTopAction(null), 500);
      return () => clearTimeout(t);
    }
  }, [state.stack.length]);

  const displayItems = [...state.stack].reverse();

  return (
    <div>
      <style>{`
        @keyframes stack-push {
          0%   { transform: translateY(-8px); opacity: 0; }
          100% { transform: translateY(0);    opacity: 1; }
        }
        @keyframes stack-pop {
          0%   { transform: translateY(0);    opacity: 1; }
          100% { transform: translateY(-8px); opacity: 0; }
        }
      `}</style>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginBottom: '8px', padding: '5px 10px',
        background: 'linear-gradient(90deg, #037f0c 0%, #1a9e24 100%)',
        borderRadius: '6px',
      }}>
        <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em' }}>PC</span>
        <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: '13px', fontWeight: 600 }}>
          {toHex(state.programCounter)}
        </span>
        <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.85)', fontSize: '11px', fontWeight: 600 }}>
          depth: {state.stack.length}
        </span>
      </div>

      {state.stack.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '24px 0',
          color: '#8c9ba5', fontSize: '13px',
          border: '2px dashed #d5dbdb', borderRadius: '6px',
        }}>
          Stack empty
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {displayItems.map((val, i) => {
            const isTop = i === 0;
            const color = LEVEL_COLORS[Math.min(i, LEVEL_COLORS.length - 1)];
            const textColor = i < 4 ? '#fff' : '#414d5c';
            const animStyle = isTop && topAction === 'push'
              ? { animation: 'stack-push 0.35s cubic-bezier(0.4,0,0.2,1) forwards' }
              : {};
            return (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '4px 8px',
                  background: color,
                  borderRadius: '5px',
                  border: isTop ? '2px solid rgba(255,255,255,0.4)' : '1px solid transparent',
                  boxShadow: isTop ? '0 2px 8px rgba(9,114,211,0.2)' : 'none',
                  transition: 'background 0.3s',
                  ...animStyle,
                }}
              >
                {isTop && (
                  <span style={{
                    fontSize: '9px', fontWeight: 800, letterSpacing: '0.1em',
                    color: textColor, opacity: 0.9,
                    background: 'rgba(255,255,255,0.2)',
                    padding: '1px 5px', borderRadius: '3px',
                    flexShrink: 0,
                  }}>
                    TOP
                  </span>
                )}
                <span style={{
                  fontSize: '11px', color: textColor, opacity: 0.7,
                  fontFamily: 'monospace', flexShrink: 0,
                  minWidth: '28px',
                }}>
                  [{state.stack.length - 1 - i}]
                </span>
                <span style={{
                  flex: 1, fontFamily: 'monospace', fontSize: '13px',
                  fontWeight: 700, color: textColor,
                }}>
                  {val}
                </span>
                <span style={{
                  fontSize: '10px', color: textColor, opacity: 0.7,
                  fontFamily: 'monospace',
                }}>
                  {toHex(val)}
                </span>
              </div>
            );
          })}
          <div style={{
            height: '4px',
            background: 'linear-gradient(90deg, #414d5c 0%, #8c9ba5 100%)',
            borderRadius: '0 0 4px 4px',
            marginTop: '1px',
          }} />
          <div style={{
            textAlign: 'center', fontSize: '10px', color: '#8c9ba5',
            letterSpacing: '0.06em', marginTop: '2px',
          }}>
            STACK BASE
          </div>
        </div>
      )}
    </div>
  );
}
