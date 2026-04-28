/**
 * 노드의 "side" 도출 — root의 직속 자식이 root의 어느 쪽에 있는지로 결정
 *
 * - root: 'right' (기본)
 * - root의 직속 자식: 자기 position.x < root.position.x 면 'left', 아니면 'right'
 * - 그 이외 노드: 가장 가까운 root-direct-child 조상의 side를 그대로 따름
 *
 * side는 저장하지 않고 매 렌더 시 도출 — 사용자가 root child를 좌우로 드래그하면 자연스럽게 반영됨
 */

import type { MindmapNodeData } from '../types/mindmap';

export type NodeSide = 'left' | 'right';

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
    const side: NodeSide =
      directChild.position.x < root.position.x ? 'left' : 'right';
    sideMap[directChild.id] = side;
    chain.forEach((id) => (sideMap[id] = side));
  }

  return sideMap;
}
