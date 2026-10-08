import { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  type Node,
  type Edge,
  Position,
  MarkerType,
  Handle,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Badge from '@cloudscape-design/components/badge';
import Box from '@cloudscape-design/components/box';
import type { CommonIRInstruction, Instruction, TranslationResult } from '../../utils/types';
import { OPCODE_COLORS } from '../../utils/opcodeColors';

// ── helpers ───────────────────────────────────────────────────────────────────

function toHex(n: number, width = 4): string {
  return '0x' + n.toString(16).toUpperCase().padStart(width, '0');
}

// ── Instruction lists ─────────────────────────────────────────────────────────

function IRList({ items, currentStep }: { items: CommonIRInstruction[]; currentStep: number }) {
  if (items.length === 0) return <span style={{ fontSize: '11px', color: '#8c9ba5' }}>No instructions.</span>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {items.map((item) => {
        const isCurrent = item.index === currentStep;
        return (
          <div key={item.index} style={{
            display: 'flex', gap: '6px', alignItems: 'baseline',
            padding: '2px 5px', borderRadius: '4px',
            background: isCurrent ? '#fff8e6' : 'transparent',
            borderLeft: isCurrent ? '3px solid #b26900' : '3px solid transparent',
          }}>
            <span style={{ fontSize: '10px', color: '#8c9ba5', fontFamily: 'monospace', minWidth: '14px', flexShrink: 0 }}>{item.index}</span>
            <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', color: OPCODE_COLORS[item.opcode] ?? '#414d5c', minWidth: '100px', flexShrink: 0 }}>{item.opcode}</span>
            {item.operands.length > 0 && <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#414d5c' }}>{item.operands.join(', ')}</span>}
            {item.comment && <span style={{ fontSize: '10px', color: '#8c9ba5', fontStyle: 'italic', marginLeft: 'auto', whiteSpace: 'nowrap' }}>// {item.comment}</span>}
          </div>
        );
      })}
    </div>
  );
}

function VMList({ items, currentStep, accent }: { items: Instruction[]; currentStep: number; accent: string }) {
  if (items.length === 0) return <span style={{ fontSize: '11px', color: '#8c9ba5' }}>No instructions.</span>;
  const currentAddress = items[currentStep]?.address ?? -1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {items.map((item) => {
        const isCurrent = item.address === currentAddress;
        return (
          <div key={item.address} style={{
            display: 'flex', gap: '6px', alignItems: 'baseline',
            padding: '2px 5px', borderRadius: '4px',
            background: isCurrent ? `${accent}12` : 'transparent',
            borderLeft: isCurrent ? `3px solid ${accent}` : '3px solid transparent',
          }}>
            <span style={{ fontSize: '10px', color: '#8c9ba5', fontFamily: 'monospace', minWidth: '42px', flexShrink: 0 }}>{toHex(item.address)}</span>
            <span style={{ fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', color: OPCODE_COLORS[item.opcode] ?? '#414d5c', minWidth: '100px', flexShrink: 0 }}>{item.opcode}</span>
            {item.operands.length > 0 && <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#414d5c' }}>{item.operands.join(', ')}</span>}
            <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#8c9ba5', fontFamily: 'monospace', flexShrink: 0 }}>{item.sizeBytes}B</span>
          </div>
        );
      })}
    </div>
  );
}

function CSourceDisplay({ source }: { source: string }) {
  const lines = source.split('\n');
  return (
    <div style={{ fontFamily: "'JetBrains Mono','Fira Code',Consolas,monospace", fontSize: '11px', lineHeight: '1.6' }}>
      {lines.map((line, i) => (
        <div key={i} style={{ display: 'flex', gap: '6px' }}>
          <span style={{ color: '#8c9ba5', minWidth: '16px', textAlign: 'right', userSelect: 'none', flexShrink: 0 }}>{i + 1}</span>
          <span style={{ color: '#0d1117', whiteSpace: 'pre' }}>{line || ' '}</span>
        </div>
      ))}
    </div>
  );
}

// ── Custom ReactFlow node ─────────────────────────────────────────────────────

interface StageNodeData {
  title: string;
  subtitle: string;
  accent: string;
  badge?: string;
  badgeColor?: 'blue' | 'green' | 'grey';
  sizeLabel?: string;
  content: React.ReactNode;
  sourcePosition?: Position;
  targetPosition?: Position;
  extraHandles?: Array<{ type: 'source' | 'target'; position: Position; id: string; style?: React.CSSProperties }>;
}

function StageNode({ data }: { data: StageNodeData }) {
  return (
    <div style={{
      width: '240px',
      border: `1px solid ${data.accent}55`,
      borderTop: `3px solid ${data.accent}`,
      borderRadius: '8px',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      fontFamily: 'inherit',
    }}>
      {data.targetPosition && (
        <Handle
          type="target"
          position={data.targetPosition}
          style={{ background: data.accent, width: 10, height: 10, border: '2px solid #fff' }}
        />
      )}

      <div style={{
        background: `${data.accent}10`,
        padding: '8px 12px',
        display: 'flex', alignItems: 'center', gap: '8px',
        borderBottom: `1px solid ${data.accent}22`,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: data.accent, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            {data.title}
          </div>
          <div style={{ fontSize: '10px', color: '#8c9ba5', marginTop: '1px' }}>{data.subtitle}</div>
        </div>
        {data.badge && <Badge color={data.badgeColor ?? 'grey'}>{data.badge}</Badge>}
        {data.sizeLabel && (
          <span style={{
            fontSize: '10px', fontWeight: 600, color: data.accent,
            background: `${data.accent}18`, borderRadius: '4px', padding: '2px 6px',
          }}>
            {data.sizeLabel}
          </span>
        )}
      </div>

      <div style={{ padding: '8px 10px', maxHeight: '260px', overflowY: 'auto' }}>
        {data.content}
      </div>

      {data.sourcePosition && (
        <Handle
          type="source"
          position={data.sourcePosition}
          style={{ background: data.accent, width: 10, height: 10, border: '2px solid #fff' }}
        />
      )}

      {data.extraHandles?.map(h => (
        <Handle
          key={h.id}
          id={h.id}
          type={h.type}
          position={h.position}
          style={{ background: data.accent, width: 10, height: 10, border: '2px solid #fff', ...h.style }}
        />
      ))}
    </div>
  );
}

const NODE_TYPES = { stage: StageNode };

// ── Main component ────────────────────────────────────────────────────────────

interface PipelineVisualProps {
  translation: TranslationResult;
  currentStep: number;
  cSource?: string;
}

export default function PipelineVisual({ translation, currentStep, cSource }: PipelineVisualProps) {
  const hasSource = Boolean(cSource?.trim());

  const COL1_X = 0;
  const COL2_X = 340;
  const COL3_X = 680;
  const REG_Y  = 0;
  const STK_Y  = 320;
  const MID_Y  = (REG_Y + STK_Y) / 2;

  const nodes: Node[] = useMemo(() => {
    const result: Node[] = [];

    if (hasSource) {
      result.push({
        id: 'source',
        type: 'stage',
        position: { x: COL1_X, y: MID_Y },
        draggable: false,
        selectable: false,
        data: {
          title: 'C Source',
          subtitle: 'Input program',
          accent: '#6b21a8',
          badge: 'C',
          badgeColor: 'grey',
          sourcePosition: Position.Right,
          content: <CSourceDisplay source={cSource!} />,
        } satisfies StageNodeData,
      });
    }

    result.push({
      id: 'ir',
      type: 'stage',
      position: { x: hasSource ? COL2_X : COL1_X, y: MID_Y },
      draggable: false,
      selectable: false,
      data: {
        title: 'Common IR',
        subtitle: 'Architecture-neutral intermediate',
        accent: '#b26900',
        badge: `${translation.commonIR.length} ops`,
        badgeColor: 'grey',
        targetPosition: hasSource ? Position.Left : undefined,
        extraHandles: [
          { id: 'ir-out-reg', type: 'source', position: Position.Right, style: { top: '30%' } },
          { id: 'ir-out-stk', type: 'source', position: Position.Right, style: { top: '70%' } },
        ],
        content: <IRList items={translation.commonIR} currentStep={currentStep} />,
      } satisfies StageNodeData,
    });

    result.push({
      id: 'register',
      type: 'stage',
      position: { x: hasSource ? COL3_X : COL2_X, y: REG_Y },
      draggable: false,
      selectable: false,
      data: {
        title: 'Register VM',
        subtitle: '3-address bytecode',
        accent: '#0972d3',
        badge: `${translation.registerProgram.length} instr`,
        badgeColor: 'blue',
        sizeLabel: `${translation.registerSizeBytes}B`,
        targetPosition: Position.Left,
        content: <VMList items={translation.registerProgram} currentStep={currentStep} accent="#0972d3" />,
      } satisfies StageNodeData,
    });

    result.push({
      id: 'stack',
      type: 'stage',
      position: { x: hasSource ? COL3_X : COL2_X, y: STK_Y },
      draggable: false,
      selectable: false,
      data: {
        title: 'Stack VM',
        subtitle: '0-address bytecode',
        accent: '#037f0c',
        badge: `${translation.stackProgram.length} instr`,
        badgeColor: 'green',
        sizeLabel: `${translation.stackSizeBytes}B`,
        targetPosition: Position.Left,
        content: <VMList items={translation.stackProgram} currentStep={currentStep} accent="#037f0c" />,
      } satisfies StageNodeData,
    });

    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translation, currentStep, cSource]);

  const edges: Edge[] = useMemo(() => {
    const result: Edge[] = [];

    if (hasSource) {
      result.push({
        id: 'source-ir',
        source: 'source',
        target: 'ir',
        animated: true,
        label: 'parse & tokenise',
        labelStyle: { fontSize: 10, fontWeight: 600, fill: '#6b21a8' },
        labelBgStyle: { fill: '#faf5ff', fillOpacity: 0.9 },
        labelBgPadding: [4, 6] as [number, number],
        labelBgBorderRadius: 4,
        style: { stroke: '#6b21a8', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6b21a8', width: 16, height: 16 },
      });
    }

    result.push({
      id: 'ir-register',
      source: 'ir',
      sourceHandle: 'ir-out-reg',
      target: 'register',
      animated: true,
      label: 'code gen (register)',
      labelStyle: { fontSize: 10, fontWeight: 600, fill: '#0972d3' },
      labelBgStyle: { fill: '#f0f7ff', fillOpacity: 0.9 },
      labelBgPadding: [4, 6] as [number, number],
      labelBgBorderRadius: 4,
      style: { stroke: '#0972d3', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#0972d3', width: 16, height: 16 },
    });

    result.push({
      id: 'ir-stack',
      source: 'ir',
      sourceHandle: 'ir-out-stk',
      target: 'stack',
      animated: true,
      label: 'code gen (stack)',
      labelStyle: { fontSize: 10, fontWeight: 600, fill: '#037f0c' },
      labelBgStyle: { fill: '#f0fff4', fillOpacity: 0.9 },
      labelBgPadding: [4, 6] as [number, number],
      labelBgBorderRadius: 4,
      style: { stroke: '#037f0c', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#037f0c', width: 16, height: 16 },
    });

    return result;
  }, [hasSource]);

  const canvasHeight = STK_Y + 320;

  return (
    <div>
      <div style={{
        display: 'flex', gap: '16px', padding: '8px 12px',
        background: '#f8f9fa', borderRadius: '8px', marginBottom: '12px',
        alignItems: 'center', flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#414d5c' }}>Pipeline Summary</span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0972d3', display: 'inline-block' }} />
          <span style={{ fontSize: '12px', color: '#414d5c' }}>Register VM: <strong>{translation.registerSizeBytes} bytes</strong></span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#037f0c', display: 'inline-block' }} />
          <span style={{ fontSize: '12px', color: '#414d5c' }}>Stack VM: <strong>{translation.stackSizeBytes} bytes</strong></span>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          {translation.isDemoData && <Badge color="grey">Demo data</Badge>}
        </div>
      </div>

      <div style={{
        width: '100%',
        height: `${canvasHeight}px`,
        border: '1px solid #e9ebed',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#fafafa',
      }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          fitView
          fitViewOptions={{ padding: 0.12, maxZoom: 1 }}
          minZoom={0.3}
          maxZoom={1.2}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          zoomOnScroll
        >
          <Background color="#e9ebed" gap={20} size={1} />
        </ReactFlow>
      </div>

      <Box color="text-body-secondary" fontSize="body-s" padding={{ top: 'xs' }}>
        Scroll or pinch to zoom · drag to pan
      </Box>
    </div>
  );
}
