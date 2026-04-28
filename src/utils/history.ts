/**
 * Undo/Redo 스택 — 스냅샷 기반
 *
 * - 각 entry는 작업 직전(before)와 직후(after) 스냅샷을 모두 보관
 * - move 연속 (같은 nodeId): 새 entry 무시 — 직전 entry의 before가 그대로 살아있음
 * - edit 연속 (같은 nodeId): 동일 규칙 (안전망)
 * - create/delete: 항상 새 entry
 * - 새 push 시 redo 스택은 비움 (분기)
 * - 최대 50 entry, 초과 시 가장 오래된 것부터 drop
 */

import type { MindmapNodeData } from '../types/mindmap';

export type HistoryActionType = 'create' | 'delete' | 'edit' | 'move';

export type PersistedNode = Pick<
  MindmapNodeData,
  'id' | 'parentId' | 'sortOrder' | 'collapsed' | 'label' | 'position'
>;

export interface HistoryEntry {
  type: HistoryActionType;
  nodeId?: string;
  before: PersistedNode[];
  after: PersistedNode[];
}

const MAX_ENTRIES = 50;

export function snapshotPersisted(nodes: MindmapNodeData[]): PersistedNode[] {
  return nodes.map((n) => ({
    id: n.id,
    parentId: n.parentId,
    sortOrder: n.sortOrder,
    collapsed: n.collapsed,
    label: n.label,
    position: { x: n.position.x, y: n.position.y },
  }));
}

export class HistoryStack {
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];

  push(entry: HistoryEntry): void {
    const top = this.undoStack[this.undoStack.length - 1];
    const isMergeable =
      (entry.type === 'move' || entry.type === 'edit') &&
      top &&
      top.type === entry.type &&
      top.nodeId &&
      top.nodeId === entry.nodeId;

    if (isMergeable) {
      // 직전 top의 before는 그대로 두고, after만 갱신 → 누적 변경을 한 번에 되돌림
      top.after = entry.after;
    } else {
      this.undoStack.push(entry);
      while (this.undoStack.length > MAX_ENTRIES) this.undoStack.shift();
    }
    this.redoStack = [];
  }

  undo(): HistoryEntry | null {
    const entry = this.undoStack.pop();
    if (!entry) return null;
    this.redoStack.push(entry);
    return entry;
  }

  redo(): HistoryEntry | null {
    const entry = this.redoStack.pop();
    if (!entry) return null;
    this.undoStack.push(entry);
    return entry;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }
}
