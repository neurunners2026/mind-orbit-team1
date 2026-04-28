import { createClient } from '@supabase/supabase-js';
import type { EdgeStyleId } from '../types/mindmap';

// ============================================
// Database 타입 정의 (Supabase 테이블 스키마)
// ============================================

export interface DbMindmap {
  id: string;
  user_id: string;
  title: string;
  edge_style: EdgeStyleId | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbMindmapNode {
  id: string;
  map_id: string;
  parent_id: string | null;
  label: string;
  sort_order: number;
  collapsed: boolean;
  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
}

export type Database = {
  public: {
    Tables: {
      mindmaps: {
        Row: DbMindmap;
        Insert: Omit<DbMindmap, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DbMindmap, 'id' | 'user_id'>>;
      };
      mindmap_nodes: {
        Row: DbMindmapNode;
        Insert: Omit<DbMindmapNode, 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DbMindmapNode, 'id' | 'map_id'>>;
      };
    };
  };
};

// ============================================
// Supabase 클라이언트
// ============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'VITE_SUPABASE_URL 또는 VITE_SUPABASE_PUBLISHABLE_KEY 환경변수가 설정되지 않았습니다.',
  );
}

// Database 제네릭은 SDK 버전별 내부 타입과 충돌할 수 있어 미사용.
// 대신 SELECT 결과에 DbMindmap / DbMindmapNode 로 직접 캐스팅.
export const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// 타입 변환 헬퍼 (DB ↔ 앱 내부 타입)
// ============================================

import type { Mindmap, MindmapNodeData } from '../types/mindmap';

/** DbMindmap → Mindmap (앱 내부 타입) */
export function dbToMindmap(row: DbMindmap): Mindmap {
  return {
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    edgeStyle: row.edge_style ?? undefined,
    isFavorite: row.is_favorite,
  };
}

/** DbMindmapNode → MindmapNodeData (앱 내부 타입) */
export function dbToNode(row: DbMindmapNode): MindmapNodeData {
  return {
    id: row.id,
    mapId: row.map_id,
    parentId: row.parent_id,
    sortOrder: row.sort_order,
    collapsed: row.collapsed,
    label: row.label,
    position: { x: row.position_x, y: row.position_y },
  };
}

/** MindmapNodeData → DbMindmapNode Insert 형식 */
export function nodeToDb(
  node: Omit<MindmapNodeData, 'measuredWidth' | 'measuredHeight'>,
  mapId: string,
): Omit<DbMindmapNode, 'created_at' | 'updated_at'> {
  return {
    id: node.id,
    map_id: mapId,
    parent_id: node.parentId,
    label: node.label,
    sort_order: node.sortOrder,
    collapsed: node.collapsed,
    position_x: node.position.x,
    position_y: node.position.y,
  };
}
