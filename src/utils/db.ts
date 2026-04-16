import Dexie from 'dexie';
import type { Mindmap, MindmapNodeData, SyncMessage } from '../types/mindmap';

// Mind Orbit IndexedDB 데이터베이스
const db = new Dexie('MindOrbitDB');

// 스키마 정의
// - id: 커스텀 UUID 문자열 (자동 증가 아님 → 멀티디바이스 동기화에 안전)
// - nodes에 parentId로 부모-자식 관계 표현 (별도 edges 테이블 불필요)
// - sortOrder: 형제 노드 순서 보장
// - collapsed: 접힌 상태 영속화
db.version(1).stores({
  mindmaps: 'id, updatedAt',
  nodes: 'id, mapId, parentId',
});

db.version(2).stores({
  mindmaps: 'id, updatedAt, isFavorite',
  nodes: 'id, mapId, parentId',
});

export default db;

// ============================================
// 탭 간 동기화 채널 (BroadcastChannel API)
// ============================================
const SYNC_CHANNEL_NAME = 'mindorbit-sync';
const TAB_ID: string =
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

let syncChannel: BroadcastChannel | null = null;
if (typeof BroadcastChannel !== 'undefined') {
  try {
    syncChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  } catch {
    /* no-op */
  }
}

export function getTabId(): string {
  return TAB_ID;
}

export function subscribeSync(
  handler: (msg: SyncMessage) => void,
): () => void {
  if (!syncChannel) return () => {};
  const listener = (e: MessageEvent) => {
    if (!e?.data || e.data.tabId === TAB_ID) return;
    handler(e.data as SyncMessage);
  };
  syncChannel.addEventListener('message', listener);
  return () => syncChannel!.removeEventListener('message', listener);
}

function broadcast(type: string, payload?: Record<string, unknown>): void {
  if (!syncChannel) return;
  try {
    syncChannel.postMessage({ type, tabId: TAB_ID, payload, at: Date.now() });
  } catch {
    /* no-op */
  }
}

// ============================================
// 유틸: UUID 생성
// ============================================
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ============================================
// 마인드맵 CRUD
// ============================================

/** 새 마인드맵 생성 (루트 노드 포함) */
export async function createMindmap(title = '새 마인드맵'): Promise<string> {
  const now = new Date().toISOString();
  const mapId = generateId();

  await db.table('mindmaps').add({
    id: mapId,
    title,
    createdAt: now,
    updatedAt: now,
  });

  await db.table('nodes').add({
    id: generateId(),
    mapId,
    parentId: null,
    sortOrder: 0,
    collapsed: false,
    label: title,
    position: { x: 0, y: 0 },
  });

  broadcast('mindmap:list:changed', { mapId });
  return mapId;
}

/** 모든 마인드맵 목록 조회 (최신순) */
export async function getAllMindmaps(): Promise<Mindmap[]> {
  return db.table('mindmaps').orderBy('updatedAt').reverse().toArray();
}

/** 마인드맵 삭제 (관련 노드도 함께) */
export async function deleteMindmap(mapId: string): Promise<void> {
  await db.transaction('rw', db.table('mindmaps'), db.table('nodes'), async () => {
    await db.table('mindmaps').delete(mapId);
    await db.table('nodes').where('mapId').equals(mapId).delete();
  });
  broadcast('mindmap:list:changed', { mapId, deleted: true });
  broadcast('mindmap:data:changed', { mapId, deleted: true });
}

/** 마인드맵 제목 수정 */
export async function updateMindmapTitle(
  mapId: string,
  title: string,
): Promise<void> {
  await db.table('mindmaps').update(mapId, {
    title,
    updatedAt: new Date().toISOString(),
  });
  broadcast('mindmap:list:changed', { mapId });
  broadcast('mindmap:meta:changed', { mapId });
}

/** 특정 맵의 노드 전체 조회 */
export async function getNodesByMapId(
  mapId: string,
): Promise<MindmapNodeData[]> {
  return db.table('nodes').where('mapId').equals(mapId).toArray();
}

/** 마인드맵 메타 조회 */
export async function getMindmap(
  mapId: string,
): Promise<Mindmap | undefined> {
  return db.table('mindmaps').get(mapId);
}

/** 마인드맵 설정 업데이트 (엣지 스타일 등) */
export async function updateMindmapSettings(
  mapId: string,
  settings: Record<string, unknown>,
): Promise<void> {
  await db.table('mindmaps').update(mapId, {
    ...settings,
    updatedAt: new Date().toISOString(),
  });
  broadcast('mindmap:meta:changed', { mapId });
}

/** 즐겨찾기 토글 */
export async function toggleFavorite(mapId: string, isFavorite: boolean): Promise<void> {
  await db.table('mindmaps').update(mapId, { isFavorite });
  broadcast('mindmap:list:changed', { mapId });
}

/** 다중 마인드맵 일괄 삭제 */
export async function deleteMindmaps(mapIds: string[]): Promise<void> {
  await db.transaction('rw', db.table('mindmaps'), db.table('nodes'), async () => {
    await db.table('mindmaps').bulkDelete(mapIds);
    for (const id of mapIds) {
      await db.table('nodes').where('mapId').equals(id).delete();
    }
  });
  broadcast('mindmap:list:changed', { deleted: true });
}

/**
 * 맵의 노드를 통째로 저장 (자동저장용)
 * 각 노드: { id, parentId, sortOrder, collapsed, label, position }
 */
export async function saveMapData(
  mapId: string,
  nodes: Omit<MindmapNodeData, 'mapId'>[],
): Promise<void> {
  await db.transaction('rw', db.table('mindmaps'), db.table('nodes'), async () => {
    await db.table('nodes').where('mapId').equals(mapId).delete();

    const taggedNodes = nodes.map((n) => ({ ...n, mapId }));
    if (taggedNodes.length) await db.table('nodes').bulkAdd(taggedNodes);

    await db.table('mindmaps').update(mapId, {
      updatedAt: new Date().toISOString(),
    });
  });
  broadcast('mindmap:data:changed', { mapId });
  broadcast('mindmap:list:changed', { mapId });
}
