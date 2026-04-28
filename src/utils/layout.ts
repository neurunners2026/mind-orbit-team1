/**
 * 마인드맵 트리 레이아웃 계산
 * 루트 노드를 중앙에 놓고, 자식 노드들을 오른쪽으로 배치
 */

import type { MindmapNodeData, EdgeStyleId } from '../types/mindmap';
import type { Edge } from '@xyflow/react';

const NODE_WIDTH = 160;
const NODE_HEIGHT = 40;
const HORIZONTAL_GAP = 60;
const VERTICAL_GAP = 16;

// 라벨 길이 기반 너비 추정
const NODE_MIN_WIDTH = 80;
const NODE_MAX_WIDTH = 280;
function estimateNodeWidth(label = ''): number {
  const estimated = (label.length || 1) * 8 + 32 + 4;
  return Math.max(NODE_MIN_WIDTH, Math.min(NODE_MAX_WIDTH, estimated));
}

function getNodeWidth(node?: MindmapNodeData): number {
  return node?.measuredWidth || estimateNodeWidth(node?.label);
}

/**
 * 노드 배열로부터 트리 구조를 파악하고 좌표를 계산
 */
export function layoutTree(
  nodes: MindmapNodeData[],
  rootId?: string,
): MindmapNodeData[] {
  if (!nodes.length) return nodes;

  const childrenMap: Record<string, string[]> = {};
  nodes.forEach((node) => {
    if (node.parentId) {
      if (!childrenMap[node.parentId]) childrenMap[node.parentId] = [];
      childrenMap[node.parentId].push(node.id);
    }
  });

  const nodeMap: Record<string, MindmapNodeData> = {};
  nodes.forEach((n) => {
    nodeMap[n.id] = n;
  });

  Object.keys(childrenMap).forEach((parentId) => {
    childrenMap[parentId].sort((a, b) => {
      return (nodeMap[a]?.sortOrder || 0) - (nodeMap[b]?.sortOrder || 0);
    });
  });

  const heightMemo: Record<string, number> = {};
  function getSubtreeHeight(nodeId: string): number {
    if (heightMemo[nodeId] !== undefined) return heightMemo[nodeId];

    const children = childrenMap[nodeId] || [];
    if (children.length === 0) {
      heightMemo[nodeId] = NODE_HEIGHT;
      return NODE_HEIGHT;
    }

    let totalHeight = 0;
    for (let i = 0; i < children.length; i++) {
      if (i > 0) totalHeight += VERTICAL_GAP;
      totalHeight += getSubtreeHeight(children[i]);
    }
    const result = Math.max(NODE_HEIGHT, totalHeight);
    heightMemo[nodeId] = result;
    return result;
  }

  const positionMap: Record<string, { x: number; y: number }> = {};

  function assignPositions(
    nodeId: string,
    x: number,
    yStart: number,
    yEnd: number,
  ): void {
    const centerY = (yStart + yEnd) / 2 - NODE_HEIGHT / 2;
    positionMap[nodeId] = { x, y: centerY };

    const children = childrenMap[nodeId] || [];
    if (children.length === 0) return;

    const childX = x + NODE_WIDTH + HORIZONTAL_GAP;
    const totalChildHeight = children.reduce((sum, cid, i) => {
      return sum + getSubtreeHeight(cid) + (i > 0 ? VERTICAL_GAP : 0);
    }, 0);

    let currentY = centerY + NODE_HEIGHT / 2 - totalChildHeight / 2;

    children.forEach((childId) => {
      const childHeight = getSubtreeHeight(childId);
      assignPositions(childId, childX, currentY, currentY + childHeight);
      currentY += childHeight + VERTICAL_GAP;
    });
  }

  const root =
    rootId || nodes.find((n) => !n.parentId)?.id || nodes[0]?.id;
  if (!root) return nodes;

  const totalHeight = getSubtreeHeight(root);
  assignPositions(root, 0, -totalHeight / 2, totalHeight / 2);

  return nodes.map((node) => ({
    ...node,
    position: positionMap[node.id] || node.position,
  }));
}

/**
 * 새 노드 하나의 위치만 계산 — 기존 노드는 건드리지 않음
 */
export function calcNewNodePosition(
  allNodes: MindmapNodeData[],
  newNodeId: string,
): { x: number; y: number } {
  const newNode = allNodes.find((n) => n.id === newNodeId);
  if (!newNode || !newNode.parentId) return { x: 0, y: 0 };

  const parent = allNodes.find((n) => n.id === newNode.parentId);
  if (!parent) return { x: 0, y: 0 };

  const siblings = allNodes
    .filter((n) => n.parentId === newNode.parentId && n.id !== newNodeId)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const parentWidth = getNodeWidth(parent);
  const x = parent.position.x + parentWidth + HORIZONTAL_GAP;

  if (siblings.length === 0) {
    return { x, y: parent.position.y };
  }

  const lastSibling = siblings[siblings.length - 1];
  const siblingHeight = lastSibling.measuredHeight || NODE_HEIGHT;
  const y = lastSibling.position.y + siblingHeight + VERTICAL_GAP;

  return { x, y };
}

/**
 * 노드 배열에서 edges를 도출 (React Flow 렌더용)
 */
export function deriveEdges(
  nodes: MindmapNodeData[],
  edgeStyle: EdgeStyleId = 'bezier',
): Edge[] {
  return nodes
    .filter((n) => n.parentId)
    .map((n) => ({
      id: `edge-${n.parentId}-${n.id}`,
      source: n.parentId!,
      target: n.id,
      type: 'mindmap',
      data: { edgeStyle },
    }));
}
