import { useRef, useEffect, useState } from 'react';
import type { RegisterState } from '../../utils/types';

const REGISTER_NAMES = ['R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7'];

function toHex(n: number): string {
  return '0x' + n.toString(16).toUpperCase().padStart(4, '0');
}

interface RegisterFileVisualProps {
  state: RegisterState;
}

export default function RegisterFileVisual({ state }: RegisterFileVisualProps) {
  const prevRef = useRef<Record<string, number>>({});
  const [flashSet, setFlashSet] = useState<Set<string>>(new Set());

  const values = REGISTER_NAMES.map(n => state.registers[n] ?? 0);
  const max = Math.max(...values, 1);

  useEffect(() => {
    const changed = new Set<string>();
    for (const name of REGISTER_NAMES) {
      const cur = state.registers[name] ?? 0;
      const prev = prevRef.current[name] ?? 0;
      if (cur !== prev) changed.add(name);
    }
    if (changed.size > 0) {
      setFlashSet(changed);
      const t = setTimeout(() => setFlashSet(new Set()), 600);
      prevRef.current = { ...state.registers };
      return () => clearTimeout(t);
    }
    prevRef.current = { ...state.registers };
  }, [state]);

  return (
    <div>
      <style>{`
        @keyframes reg-flash {
          0%   { background: #fff3cd; }
          100% { background: transparent; }
        }
        .reg-flash { animation: reg-flash 0.6s ease-out forwards; }
      `}</style>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginBottom: '8px', padding: '5px 10px',
        background: 'linear-gradient(90deg, #0972d3 0%, #1a8fe3 100%)',
        borderRadius: '6px',
      }}>
        <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em' }}>PC</span>
        <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: '13px', fontWeight: 600 }}>
          {toHex(state.programCounter)}
        </span>
        <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.7)', fontSize: '10px' }}>
          Register File
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {REGISTER_NAMES.map((name, i) => {
          const val = values[i];
          const pct = max > 0 ? (val / max) * 100 : 0;
          const isFlashing = flashSet.has(name);
          return (
            <div
              key={name}
              className={isFlashing ? 'reg-flash' : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                borderRadius: '4px', padding: '1px 2px',
              }}
            >
              <span style={{
                width: '26px', flexShrink: 0,
                fontSize: '11px', fontWeight: 700,
                color: val !== 0 ? '#0972d3' : '#8c9ba5',
                fontFamily: 'monospace',
              }}>
                {name}
              </span>
              <div style={{
                flex: 1, height: '15px', background: '#f0f2f3',
                borderRadius: '3px', overflow: 'hidden', position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${pct}%`,
                  background: isFlashing
                    ? '#f89c0a'
                    : `linear-gradient(90deg, #0972d3, #1a8fe3)`,
                  borderRadius: '3px',
                  transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1), background 0.3s',
                  minWidth: val !== 0 ? '4px' : '0',
                }} />
                <span style={{
                  position: 'absolute', left: '6px', top: 0, bottom: 0,
                  display: 'flex', alignItems: 'center',
                  fontSize: '11px', fontWeight: 600,
                  color: pct > 40 ? '#fff' : '#414d5c',
                  fontFamily: 'monospace',
                  zIndex: 1,
                  transition: 'color 0.2s',
                }}>
                  {val}
                </span>
              </div>
              <span style={{
                width: '52px', flexShrink: 0, textAlign: 'right',
                fontSize: '10px', color: '#6c7787', fontFamily: 'monospace',
              }}>
                {toHex(val)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
