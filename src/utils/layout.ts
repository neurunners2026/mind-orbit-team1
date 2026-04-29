/**
 * 마인드맵 트리 레이아웃 계산
 * 루트 노드를 중앙에 놓고, 자식 노드들을 오른쪽으로 배치
 */

import type { MindmapNodeData, EdgeStyleId } from '../types/mindmap';
import type { Edge } from '@xyflow/react';
import { buildSideMap, type NodeSide } from './side';

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

function getNodeHeight(node?: MindmapNodeData): number {
  return node?.measuredHeight || NODE_HEIGHT;
}

function rectsOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

/**
 * 후보 박스가 기존 노드와 겹치지 않도록 y를 아래로 밀어냄.
 * 같은 x-범위에 걸쳐 있는 노드만 봄. 최대 nodes.length 회 반복.
 */
function findNonOverlappingY(
  candidate: { x: number; y: number; w: number; h: number },
  allNodes: MindmapNodeData[],
  excludeId: string,
): number {
  let y = candidate.y;
  const others = allNodes.filter((n) => n.id !== excludeId);
  for (let iter = 0; iter < others.length + 1; iter++) {
    let collided = false;
    let pushTo = y;
    for (const n of others) {
      const box = {
        x: n.position.x,
        y: n.position.y,
        w: getNodeWidth(n),
        h: getNodeHeight(n),
      };
      if (
        rectsOverlap({ x: candidate.x, y, w: candidate.w, h: candidate.h }, box)
      ) {
        const newY = box.y + box.h + VERTICAL_GAP;
        if (newY > pushTo) pushTo = newY;
        collided = true;
      }
    }
    if (!collided) return y;
    y = pushTo;
  }
  return y;
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
 *
 * - parent의 side를 도출해 좌측 트리면 부모 왼쪽으로 배치
 * - 1차 후보 y(=마지막 형제 아래) 계산 후, 모든 노드와 겹치지 않도록 아래로 밀어냄
 * - root에 직접 추가되는 새 노드는 항상 우측 ('always right' 정책)
 */
export function calcNewNodePosition(
  allNodes: MindmapNodeData[],
  newNodeId: string,
  rootId?: string,
): { x: number; y: number } {
  const newNode = allNodes.find((n) => n.id === newNodeId);
  if (!newNode || !newNode.parentId) return { x: 0, y: 0 };

  const parent = allNodes.find((n) => n.id === newNode.parentId);
  if (!parent) return { x: 0, y: 0 };

  // parent의 side 결정 — root면 'right' (정책), 아니면 buildSideMap
  const resolvedRootId =
    rootId || allNodes.find((n) => !n.parentId)?.id;
  let parentSide: NodeSide = 'right';
  if (resolvedRootId) {
    if (parent.id === resolvedRootId) {
      parentSide = 'right';
    } else {
      const sideMap = buildSideMap(allNodes, resolvedRootId);
      parentSide = sideMap[parent.id] || 'right';
    }
  }

  const siblings = allNodes
    .filter((n) => n.parentId === newNode.parentId && n.id !== newNodeId)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  const parentWidth = getNodeWidth(parent);
  const newWidth = estimateNodeWidth(newNode.label);
  const newHeight = getNodeHeight(newNode);

  const x =
    parentSide === 'left'
      ? parent.position.x - HORIZONTAL_GAP - newWidth
      : parent.position.x + parentWidth + HORIZONTAL_GAP;

  let y: number;
  if (siblings.length === 0) {
    y = parent.position.y;
  } else {
    const lastSibling = siblings[siblings.length - 1];
    const siblingHeight = getNodeHeight(lastSibling);
    y = lastSibling.position.y + siblingHeight + VERTICAL_GAP;
  }

  // 전체 노드와의 겹침 회피 (작업 2)
  y = findNonOverlappingY(
    { x, y, w: newWidth, h: newHeight },
    allNodes,
    newNodeId,
  );

  return { x, y };
}

/**
 * 노드 배열에서 edges를 도출 (React Flow 렌더용)
 *
 * - root에서 나가는 엣지는 child의 side에 따라 'left' 또는 'right' 핸들 명시
 * - root가 아닌 부모는 source 핸들이 1개뿐이라 sourceHandle 불필요
 */
export function deriveEdges(
  nodes: MindmapNodeData[],
  edgeStyle: EdgeStyleId = 'bezier',
  rootId?: string,
): Edge[] {
  const resolvedRootId = rootId || nodes.find((n) => !n.parentId)?.id;
  const sideMap = resolvedRootId ? buildSideMap(nodes, resolvedRootId) : {};

  return nodes
    .filter((n) => n.parentId)
    .map((n) => {
      const childSide = sideMap[n.id] || 'right';
      const edge: Edge = {
        id: `edge-${n.parentId}-${n.id}`,
        source: n.parentId!,
        target: n.id,
        type: 'mindmap',
        data: { edgeStyle },
      };
      if (n.parentId === resolvedRootId) {
        edge.sourceHandle = childSide;
      }
      return edge;
    });
}
