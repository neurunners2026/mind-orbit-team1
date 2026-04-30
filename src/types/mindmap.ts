/** 마인드맵 메타 정보 (DB mindmaps 테이블) */
export interface Mindmap {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  edgeStyle?: EdgeStyleId;
  isFavorite?: boolean;
}

/** 마인드맵 노드 (DB nodes 테이블) */
export interface MindmapNodeData {
  id: string;
  mapId?: string;
  parentId: string | null;
  sortOrder: number;
  collapsed: boolean;
  label: string;
  position: { x: number; y: number };
  /** 렌더 후 측정된 너비 (레이아웃 계산용, DB 비저장) */
  measuredWidth?: number;
  /** 렌더 후 측정된 높이 (레이아웃 계산용, DB 비저장) */
  measuredHeight?: number;
}

/** React Flow 노드의 data 프로퍼티 */
export type RFNodeData = {
  label: string;
  isRoot: boolean;
  childCount: number;
  descendantCount: number;
  collapsed: boolean;
  /** 렌더용: root 기준 좌/우 — 핸들/엣지 방향 결정 (DB 비저장) */
  side: 'left' | 'right';
  /** 드래그 클론(ghost) 노드 — 커서를 따라가는 미리보기 */
  isGhost?: boolean;
  /** 드래그 중인 원본 노드 — 잠긴 채 자리 지키며 반투명으로 표시 */
  isDragSource?: boolean;
  [key: string]: unknown;
};

/** 엣지 스타일 ID */
export type EdgeStyleId = 'bezier' | 'smoothstep';

/** 엣지 스타일 정의 */
export interface EdgeStyleDef {
  id: EdgeStyleId;
  label: string;
  icon: 'curve' | 'stairs';
}

/** 탭 간 동기화 메시지 */
export interface SyncMessage {
  type: string;
  tabId: string;
  payload?: {
    mapId?: string;
    deleted?: boolean;
  };
  at: number;
}

/** computeNodeStats 반환 타입 */
export interface NodeStats {
  childCountMap: Record<string, number>;
  descendantCountMap: Record<string, number>;
  childrenMap: Record<string, MindmapNodeData[]>;
}
