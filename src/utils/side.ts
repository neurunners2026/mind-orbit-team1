/**
 * 노드의 "side" 도출 — root의 직속 자식이 root의 어느 쪽에 있는지로 결정
 *
 * - root: 'right' (기본)
 * - root의 직속 자식: 자기 가로 중앙 < root 가로 중앙 이면 'left', 아니면 'right'
 *   (왼쪽 변끼리 비교하면 노드 너비가 다를 때 시각 중앙과 어긋나므로 중앙끼리 비교)
 * - 그 이외 노드: 가장 가까운 root-direct-child 조상의 side를 그대로 따름
 *
 * side는 저장하지 않고 매 렌더 시 도출 — 사용자가 root child를 좌우로 드래그하면 자연스럽게 반영됨
 */

import type { MindmapNodeData } from '../types/mindmap';

export type NodeSide = 'left' | 'right';

// layout.ts의 estimateNodeWidth와 동일 공식 — 순환 의존을 피하려고 인라인 복제
const NODE_MIN_WIDTH = 80;
const NODE_MAX_WIDTH = 280;
function nodeWidthOf(node: MindmapNodeData): number {
  if (node.measuredWidth) return node.measuredWidth;
  const len = node.label?.length || 1;
  const estimated = len * 8 + 32 + 4;
  return Math.max(NODE_MIN_WIDTH, Math.min(NODE_MAX_WIDTH, estimated));
}

/**
 * child의 가로 중앙이 root의 가로 중앙보다 왼쪽이면 true.
 * buildSideMap, 드래그 startSide/endSide 판정에 공통 사용.
 */
export function isLeftOfRoot(
  child: MindmapNodeData,
  root: MindmapNodeData,
): boolean {
  const childCenter = child.position.x + nodeWidthOf(child) / 2;
  const rootCenter = root.position.x + nodeWidthOf(root) / 2;
  return childCenter < rootCenter;
}

export function buildSideMap(
  nodes: MindmapNodeData[],
  rootId: string,
): Record<string, NodeSide> {
  const byId: Record<string, MindmapNodeData> = {};
  for (const n of nodes) byId[n.id] = n;
  const root = byId[rootId];
  if (!root) return {};

  const sideMap: Record<string, NodeSide> = { [rootId]: 'right' };

  for (const n of nodes) {
    if (n.id === rootId) continue;
    if (sideMap[n.id]) continue;

    // 조상을 root-direct-child까지 거슬러 올라감
    const chain: string[] = [];
    let cur: MindmapNodeData | undefined = n;
    while (cur && cur.parentId && cur.parentId !== rootId) {
      chain.push(cur.id);
      cur = byId[cur.parentId];
    }
    // cur는 root의 직속 자식 (parentId === rootId), 또는 부모가 사라진 고아
    if (!cur) {
      chain.forEach((id) => (sideMap[id] = 'right'));
      sideMap[n.id] = 'right';
      continue;
    }
    const directChild = cur;
    const side: NodeSide = isLeftOfRoot(directChild, root) ? 'left' : 'right';
    sideMap[directChild.id] = side;
    chain.forEach((id) => (sideMap[id] = side));
  }

  return sideMap;
}
