import { memo } from 'react';
import {
  BaseEdge,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
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

/**
 * 커스텀 organic 경로: 수평 출발 → 부드러운 곡선 → 수평 도착
 */
function getOrganicPath({ sourceX, sourceY, targetX, targetY }: PathParams): string {
  const dx = targetX - sourceX;
  const cp1x = sourceX + dx * 0.4;
  const cp1y = sourceY;
  const cp2x = sourceX + dx * 0.6;
  const cp2y = targetY;

  return `M ${sourceX},${sourceY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${targetX},${targetY}`;
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
  straight: (props) => {
    const [path] = getStraightPath(props as Parameters<typeof getStraightPath>[0]);
    return path;
  },
  organic: (props) => getOrganicPath(props),
};

export const EDGE_STYLES: EdgeStyleDef[] = [
  { id: 'bezier', label: '곡선', icon: '~' },
  { id: 'smoothstep', label: '계단', icon: '⌐' },
  { id: 'straight', label: '직선', icon: '/' },
  { id: 'organic', label: '유기적', icon: '∿' },
];

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
  const style = (data?.edgeStyle as EdgeStyleId) || 'bezier';
  const getPath = pathGenerators[style] || pathGenerators.bezier;

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
