/**
 * 마인드맵 트리 유틸 — parentId 기반 구조 공통 연산
 */

import type { MindmapNodeData, NodeStats } from '../types/mindmap';

/**
 * parentId → children(노드 참조) 인접 리스트 생성
 */
export function buildChildrenMap(
  nodes: MindmapNodeData[],
): Record<string, MindmapNodeData[]> {
  const map: Record<string, MindmapNodeData[]> = {};
  for (const n of nodes) {
    if (n.parentId) {
      if (!map[n.parentId]) map[n.parentId] = [];
      map[n.parentId].push(n);
    }
  }
  return map;
}

/**
 * 접힌 노드들의 모든 자손 ID를 수집 (본인 제외)
 */
export function getHiddenIds(
  nodes: MindmapNodeData[],
  collapsedIds: Set<string>,
  precomputedChildrenMap?: Record<string, MindmapNodeData[]>,
): Set<string> {
  if (collapsedIds.size === 0) return new Set();

  const childrenMap = precomputedChildrenMap || buildChildrenMap(nodes);
  const hidden = new Set<string>();

  const walk = (parentId: string) => {
    const children = childrenMap[parentId];
    if (!children) return;
    for (const child of children) {
      if (!hidden.has(child.id)) {
        hidden.add(child.id);
        walk(child.id);
      }
    }
  };

  collapsedIds.forEach((id) => walk(id));
  return hidden;
}

/**
 * 각 노드의 직계 자식 수 맵
 */
export function buildChildCountMap(
  nodes: MindmapNodeData[],
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const n of nodes) {
    if (n.parentId) {
      map[n.parentId] = (map[n.parentId] || 0) + 1;
    }
  }
  return map;
}

/**
 * 각 노드의 자손 총 개수 맵 (전체 서브트리)
 */
export function buildDescendantCountMap(
  nodes: MindmapNodeData[],
): Record<string, number> {
  const childrenMap = buildChildrenMap(nodes);
  const memo: Record<string, number> = {};

  const count = (id: string): number => {
    if (memo[id] !== undefined) return memo[id];
    const children = childrenMap[id];
    if (!children) {
      memo[id] = 0;
      return 0;
    }
    let total = children.length;
    for (const child of children) total += count(child.id);
    memo[id] = total;
    return total;
  };

  const map: Record<string, number> = {};
  for (const n of nodes) map[n.id] = count(n.id);
  return map;
}

/**
 * 자식 수 + 자손 수를 한 번의 호출로 계산 (childrenMap 중복 구성 방지)
 */
export function computeNodeStats(nodes: MindmapNodeData[]): NodeStats {
  const childrenMap = buildChildrenMap(nodes);
  const childCountMap: Record<string, number> = {};
  for (const parentId in childrenMap) {
    childCountMap[parentId] = childrenMap[parentId].length;
  }

  const memo: Record<string, number> = {};
  const count = (id: string): number => {
    if (memo[id] !== undefined) return memo[id];
    const children = childrenMap[id];
    if (!children) {
      memo[id] = 0;
      return 0;
    }
    let total = children.length;
    for (const child of children) total += count(child.id);
    memo[id] = total;
    return total;
  };
  const descendantCountMap: Record<string, number> = {};
  for (const n of nodes) descendantCountMap[n.id] = count(n.id);

  return { childCountMap, descendantCountMap, childrenMap };
}
