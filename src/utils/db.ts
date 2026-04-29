import { supabase, dbToMindmap, dbToNode, nodeToDb } from '../lib/supabase';
import type { DbMindmap, DbMindmapNode } from '../lib/supabase';
import type { Mindmap, MindmapNodeData, SyncMessage } from '../types/mindmap';

// ============================================
// 유틸
// ============================================

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function getUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');
  return user.id;
}

// ============================================
// 마인드맵 CRUD
// ============================================

export async function createMindmap(title = '새 마인드맵'): Promise<string> {
  const userId = await getUserId();
  const mapId = generateId();
  const now = new Date().toISOString();

  const { error: mapError } = await supabase.from('mindmaps').insert({
    id: mapId,
    user_id: userId,
    title,
    is_favorite: false,
    created_at: now,
    updated_at: now,
  });
  if (mapError) throw mapError;

  const { error: nodeError } = await supabase.from('mindmap_nodes').insert({
    id: generateId(),
    map_id: mapId,
    parent_id: null,
    label: title,
    sort_order: 0,
    collapsed: false,
    position_x: 0,
    position_y: 0,
  });
  if (nodeError) throw nodeError;

  return mapId;
}

export async function getAllMindmaps(): Promise<Mindmap[]> {
  const { data, error } = await supabase
    .from('mindmaps')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as DbMindmap[]).map(dbToMindmap);
}

export async function getMindmap(mapId: string): Promise<Mindmap | undefined> {
  const { data, error } = await supabase
    .from('mindmaps')
    .select('*')
    .eq('id', mapId)
    .maybeSingle();
  if (error) throw error;
  return data ? dbToMindmap(data as DbMindmap) : undefined;
}

export async function deleteMindmap(mapId: string): Promise<void> {
  const { error } = await supabase.from('mindmaps').delete().eq('id', mapId);
  if (error) throw error;
  // mindmap_nodes는 ON DELETE CASCADE로 자동 삭제됨
}

export async function deleteMindmaps(mapIds: string[]): Promise<void> {
  const { error } = await supabase.from('mindmaps').delete().in('id', mapIds);
  if (error) throw error;
}

export async function updateMindmapTitle(mapId: string, title: string): Promise<void> {
  const { error } = await supabase
    .from('mindmaps')
    .update({ title, updated_at: new Date().toISOString() })
    .eq('id', mapId);
  if (error) throw error;
}

export async function updateMindmapSettings(
  mapId: string,
  settings: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase
    .from('mindmaps')
    .update({ ...settings, updated_at: new Date().toISOString() })
    .eq('id', mapId);
  if (error) throw error;
}

export async function toggleFavorite(mapId: string, isFavorite: boolean): Promise<void> {
  const { error } = await supabase
    .from('mindmaps')
    .update({ is_favorite: isFavorite })
    .eq('id', mapId);
  if (error) throw error;
}

// ============================================
// 노드 CRUD
// ============================================

export async function getNodesByMapId(mapId: string): Promise<MindmapNodeData[]> {
  const { data, error } = await supabase
    .from('mindmap_nodes')
    .select('*')
    .eq('map_id', mapId)
    .order('sort_order');
  if (error) throw error;
  return ((data ?? []) as DbMindmapNode[]).map(dbToNode);
}

export async function getAllNodeCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('mindmap_nodes')
    .select('map_id');
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.map_id] = (counts[row.map_id] ?? 0) + 1;
  }
  return counts;
}

export async function saveMapData(
  mapId: string,
  nodes: Omit<MindmapNodeData, 'mapId'>[],
): Promise<void> {
  const { error: deleteError } = await supabase
    .from('mindmap_nodes')
    .delete()
    .eq('map_id', mapId);
  if (deleteError) throw deleteError;

  if (nodes.length > 0) {
    const rows = nodes.map((n) => nodeToDb(n, mapId));
    const { error: insertError } = await supabase
      .from('mindmap_nodes')
      .insert(rows);
    if (insertError) throw insertError;
  }

  const { error: updateError } = await supabase
    .from('mindmaps')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', mapId);
  if (updateError) throw updateError;
}

// ============================================
// 복제
// ============================================

export async function duplicateMindmap(mapId: string): Promise<string> {
  const original = await getMindmap(mapId);
  if (!original) throw new Error('Mindmap not found');
  const nodes = await getNodesByMapId(mapId);
  const userId = await getUserId();

  const now = new Date().toISOString();
  const newMapId = generateId();

  const idMap = new Map<string, string>();
  for (const node of nodes) idMap.set(node.id, generateId());

  const { error: mapError } = await supabase.from('mindmaps').insert({
    id: newMapId,
    user_id: userId,
    title: `${original.title} 복사본`,
    edge_style: original.edgeStyle ?? null,
    is_favorite: false,
    created_at: now,
    updated_at: now,
  });
  if (mapError) throw mapError;

  if (nodes.length > 0) {
    const newNodes = nodes.map((n) => ({
      id: idMap.get(n.id)!,
      map_id: newMapId,
      parent_id: n.parentId ? (idMap.get(n.parentId) ?? null) : null,
      label: n.label,
      sort_order: n.sortOrder,
      collapsed: n.collapsed,
      position_x: n.position.x,
      position_y: n.position.y,
    }));
    const { error: nodeError } = await supabase.from('mindmap_nodes').insert(newNodes);
    if (nodeError) throw nodeError;
  }

  return newMapId;
}

// ============================================
// 호환성 스텁 (BroadcastChannel → 서버 저장으로 대체됨)
// ============================================

export function subscribeSync(_handler: (msg: SyncMessage) => void): () => void {
  return () => {};
}

export function getTabId(): string {
  return generateId();
}
