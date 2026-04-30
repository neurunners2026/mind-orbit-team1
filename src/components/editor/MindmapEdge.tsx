import { memo } from 'react';
import {
  BaseEdge,
  getBezierPath,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import type { EdgeStyleId, EdgeStyleDef } from '../../types/mindmap';

interface PathParams {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition?: string;
  targetPosition?: string;
}

const pathGenerators: Record<EdgeStyleId, (props: PathParams) => string> = {
  bezier: (props) => {
    const [path] = getBezierPath(props as Parameters<typeof getBezierPath>[0]);
    return path;
  },
  smoothstep: (props) => {
    const [path] = getSmoothStepPath({
      ...(props as Parameters<typeof getSmoothStepPath>[0]),
      borderRadius: 20,
    });
    return path;
  },
};

export const EDGE_STYLES: EdgeStyleDef[] = [
  { id: 'bezier', label: '곡선', icon: 'curve' },
  { id: 'smoothstep', label: '계단', icon: 'stairs' },
];

function isEdgeStyleId(value: unknown): value is EdgeStyleId {
  return value === 'bezier' || value === 'smoothstep';
}

/**
 * 마인드맵 커스텀 엣지 — data.edgeStyle로 스타일 전환
 */
function MindmapEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
}: EdgeProps) {
  const style = isEdgeStyleId(data?.edgeStyle) ? data.edgeStyle : 'bezier';
  const getPath = pathGenerators[style];

  const edgePath = getPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: selected ? '#6c5ce7' : '#3a3a48',
        strokeWidth: selected ? 2.5 : 2,
        transition: 'stroke 150ms ease, stroke-width 150ms ease',
      }}
    />
  );
}

export default memo(MindmapEdge);
