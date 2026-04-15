import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Background,
  Panel,
  type NodeChange,
  type OnSelectionChangeParams,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import Header from '../components/common/Header';
import MindmapNode from '../components/editor/MindmapNode';
import MindmapEdge, { EDGE_STYLES } from '../components/editor/MindmapEdge';
import {
  getMindmap,
  getNodesByMapId,
  saveMapData,
  updateMindmapSettings,
  generateId,
  subscribeSync,
} from '../utils/db';
import { layoutTree, deriveEdges, calcNewNodePosition } from '../utils/layout';
import { getHiddenIds, computeNodeStats, buildChildrenMap } from '../utils/tree';
import type { MindmapNodeData, EdgeStyleId, SyncMessage } from '../types/mindmap';
import './Editor.css';

const nodeTypes = { mindmap: MindmapNode };
const edgeTypes = { mindmap: MindmapEdge };
const defaultEdgeOptions = { type: 'mindmap', animated: false };

function EditorInner() {
  const { mapId } = useParams<{ mapId: string }>();
  const navigate = useNavigate();

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setRfEdges] = useEdgesState([]);

  const [mapTitle, setMapTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [edgeStyle, setEdgeStyle] = useState<EdgeStyleId>('bezier');

  const { fitView, zoomIn, zoomOut, getZoom } = useReactFlow();
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialized = useRef(false);

  const allNodesRef = useRef<MindmapNodeData[]>([]);

  // ==========================================
  // 가시성만 갱신 (위치 재계산 없음)
  // ==========================================
  const refreshVisibility = useCallback(() => {
    const allNodes = allNodesRef.current;
    if (allNodes.length === 0) return;

    const { childCountMap, descendantCountMap, childrenMap } =
      computeNodeStats(allNodes);

    const collapsedIds = new Set(
      allNodes.filter((n) => n.collapsed).map((n) => n.id),
    );
    const hiddenIds = getHiddenIds(allNodes, collapsedIds, childrenMap);
    const visibleNodes = allNodes.filter((n) => !hiddenIds.has(n.id));

    const rfReady = visibleNodes.map((n) => ({
      id: n.id,
      type: 'mindmap' as const,
      position: n.position,
      parentId: undefined,
      data: {
        label: n.label,
        isRoot: !n.parentId,
        childCount: childCountMap[n.id] || 0,
        descendantCount: descendantCountMap[n.id] || 0,
        collapsed: n.collapsed || false,
      },
    }));

    setRfNodes(rfReady);
    setRfEdges(deriveEdges(visibleNodes, edgeStyle));
  }, [setRfNodes, setRfEdges, edgeStyle]);

  // ==========================================
  // 구조 변경 시 레이아웃 재계산
  // ==========================================
  const applyLayout = useCallback(() => {
    const allNodes = allNodesRef.current;
    if (allNodes.length === 0) return;

    const { childCountMap, descendantCountMap, childrenMap } =
      computeNodeStats(allNodes);

    const collapsedIds = new Set(
      allNodes.filter((n) => n.collapsed).map((n) => n.id),
    );
    const hiddenIds = getHiddenIds(allNodes, collapsedIds, childrenMap);
    const visibleNodes = allNodes.filter((n) => !hiddenIds.has(n.id));

    const rootId = allNodes.find((n) => !n.parentId)?.id;
    const laidOut = layoutTree(visibleNodes, rootId);

    const rfReady = laidOut.map((n) => ({
      id: n.id,
      type: 'mindmap' as const,
      position: n.position,
      parentId: undefined,
      data: {
        label: n.label,
        isRoot: !n.parentId,
        childCount: childCountMap[n.id] || 0,
        descendantCount: descendantCountMap[n.id] || 0,
        collapsed: n.collapsed || false,
      },
    }));

    rfReady.forEach((rfn) => {
      const orig = allNodes.find((o) => o.id === rfn.id);
      if (orig) orig.position = rfn.position;
    });

    setRfNodes(rfReady);
    setRfEdges(deriveEdges(visibleNodes, edgeStyle));
  }, [setRfNodes, setRfEdges, edgeStyle]);

  // ==========================================
  // 자동 저장 (디바운스 1초)
  // ==========================================
  const triggerAutoSave = useCallback(() => {
    if (!isInitialized.current) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      autoSaveTimer.current = null;
      try {
        const saveNodes = allNodesRef.current.map((n) => ({
          id: n.id,
          parentId: n.parentId,
          sortOrder: n.sortOrder,
          collapsed: n.collapsed,
          label: n.label,
          position: n.position,
        }));
        await saveMapData(mapId!, saveNodes);
      } catch (err) {
        console.error('자동 저장 실패:', err);
      }
    }, 1000);
  }, [mapId]);

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  // ==========================================
  // 접기/펼치기 토글
  // ==========================================
  useEffect(() => {
    const handleToggle = (e: Event) => {
      const nodeId = (e as CustomEvent).detail as string;
      const node = allNodesRef.current.find((n) => n.id === nodeId);
      if (!node) return;

      const willExpand = node.collapsed === true;
      node.collapsed = !node.collapsed;

      if (willExpand) {
        const childrenMapLocal = buildChildrenMap(allNodesRef.current);
        const stack = [...(childrenMapLocal[nodeId] || [])];
        while (stack.length) {
          const cur = stack.pop()!;
          if (cur.collapsed) cur.collapsed = false;
          stack.push(...(childrenMapLocal[cur.id] || []));
        }
      }

      refreshVisibility();
      triggerAutoSave();
    };
    window.addEventListener('mindmap:toggleCollapse', handleToggle);
    return () =>
      window.removeEventListener('mindmap:toggleCollapse', handleToggle);
  }, [refreshVisibility, triggerAutoSave]);

  // ==========================================
  // 데이터 로드
  // ==========================================
  const reloadFromDb = useCallback(
    async ({ isInitial = false } = {}) => {
      try {
        const map = await getMindmap(mapId!);
        if (!map) {
          navigate('/', { replace: true });
          return;
        }
        setMapTitle(map.title);
        if (map.edgeStyle) setEdgeStyle(map.edgeStyle);

        let loadedNodes = await getNodesByMapId(mapId!);

        if (loadedNodes.length === 0) {
          loadedNodes = [
            {
              id: generateId(),
              mapId,
              parentId: null,
              sortOrder: 0,
              collapsed: false,
              label: map.title,
              position: { x: 0, y: 0 },
            },
          ];
        } else {
          loadedNodes = loadedNodes.map((n: Record<string, unknown>) => ({
            id: n.id as string,
            parentId: (n.parentId as string) || null,
            sortOrder: (n.sortOrder as number) ?? 0,
            collapsed: (n.collapsed as boolean) ?? false,
            label:
              (n.label as string) ||
              ((n.data as Record<string, unknown>)?.label as string) ||
              '노드',
            position: (n.position as { x: number; y: number }) || {
              x: 0,
              y: 0,
            },
          }));
        }

        allNodesRef.current = loadedNodes;
        isInitialized.current = true;

        if (
          isInitial &&
          loadedNodes.length === 1 &&
          !loadedNodes[0].parentId
        ) {
          applyLayout();
        } else {
          refreshVisibility();
        }
        if (isInitial) {
          setTimeout(() => fitView({ padding: 0.3, duration: 300 }), 150);
        }
      } catch (err) {
        console.error('맵 데이터 로드 실패:', err);
        if (isInitial) navigate('/', { replace: true });
      } finally {
        if (isInitial) setLoading(false);
      }
    },
    [mapId, navigate, applyLayout, refreshVisibility, fitView],
  );

  useEffect(() => {
    reloadFromDb({ isInitial: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId]);

  // ==========================================
  // 다른 탭에서의 변경 수신
  // ==========================================
  useEffect(() => {
    const unsubscribe = subscribeSync((msg: SyncMessage) => {
      if (!msg) return;
      if (msg.payload?.mapId !== mapId) return;

      if (msg.payload?.deleted) {
        navigate('/', { replace: true });
        return;
      }

      if (autoSaveTimer.current) {
        return;
      }

      if (
        msg.type === 'mindmap:data:changed' ||
        msg.type === 'mindmap:meta:changed'
      ) {
        reloadFromDb();
      }
    });
    return unsubscribe;
  }, [mapId, navigate, reloadFromDb]);

  // ==========================================
  // 엣지 스타일 변경
  // ==========================================
  useEffect(() => {
    if (!isInitialized.current) return;
    refreshVisibility();
    updateMindmapSettings(mapId!, { edgeStyle });
  }, [edgeStyle, refreshVisibility, mapId]);

  // ==========================================
  // 노드 드래그
  // ==========================================
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);

      const dimChanges = changes.filter(
        (c) => c.type === 'dimensions' && 'dimensions' in c && c.dimensions,
      );
      dimChanges.forEach((c) => {
        if (c.type !== 'dimensions' || !('dimensions' in c) || !c.dimensions)
          return;
        const node = allNodesRef.current.find((n) => n.id === c.id);
        if (node) {
          node.measuredWidth = c.dimensions.width;
          node.measuredHeight = c.dimensions.height;
        }
      });

      const posChanges = changes.filter(
        (c) => c.type === 'position' && 'position' in c && c.position,
      );
      if (posChanges.length > 0) {
        posChanges.forEach((c) => {
          if (c.type !== 'position' || !('position' in c) || !c.position)
            return;
          const node = allNodesRef.current.find((n) => n.id === c.id);
          if (node) node.position = c.position;
        });
        triggerAutoSave();
      }
    },
    [onNodesChange, triggerAutoSave],
  );

  // ==========================================
  // 노드 라벨 편집 감지
  // ==========================================
  useEffect(() => {
    if (!isInitialized.current) return;
    let changed = false;
    rfNodes.forEach((rfn) => {
      const orig = allNodesRef.current.find((n) => n.id === rfn.id);
      if (orig && orig.label !== (rfn.data as { label?: string })?.label) {
        orig.label = (rfn.data as { label: string }).label;
        orig.measuredWidth = undefined;
        orig.measuredHeight = undefined;
        changed = true;
      }
    });
    if (changed) triggerAutoSave();
  }, [rfNodes, triggerAutoSave]);

  // ==========================================
  // 줌 레벨 추적
  // ==========================================
  const onMoveEnd = useCallback(() => {
    setZoomLevel(Math.round(getZoom() * 100));
  }, [getZoom]);

  // ==========================================
  // 노드 선택 추적
  // ==========================================
  const onSelectionChange = useCallback(
    ({ nodes: sel }: OnSelectionChangeParams) => {
      setSelectedNodeId(sel.length === 1 ? sel[0].id : null);
    },
    [],
  );

  // ==========================================
  // 노드 추가: 자식 (Tab)
  // ==========================================
  const addChildNode = useCallback(
    (overrideParentId?: string) => {
      const parentId =
        (typeof overrideParentId === 'string' ? overrideParentId : null) ||
        selectedNodeId ||
        allNodesRef.current.find((n) => !n.parentId)?.id;
      if (!parentId) return;

      const parentNode = allNodesRef.current.find((n) => n.id === parentId);
      if (parentNode?.collapsed) {
        parentNode.collapsed = false;
      }

      const siblingCount = allNodesRef.current.filter(
        (n) => n.parentId === parentId,
      ).length;

      const newId = generateId();
      const newNode: MindmapNodeData = {
        id: newId,
        parentId,
        sortOrder: siblingCount,
        collapsed: false,
        label: '새 노드',
        position: { x: 0, y: 0 },
      };

      allNodesRef.current = [...allNodesRef.current, newNode];
      newNode.position = calcNewNodePosition(allNodesRef.current, newId);

      refreshVisibility();
      triggerAutoSave();
      setSelectedNodeId(newId);

      setTimeout(() => {
        setRfNodes((nds) =>
          nds.map((n) => ({ ...n, selected: n.id === newId })),
        );
        window.dispatchEvent(
          new CustomEvent('mindmap:startEdit', { detail: newId }),
        );
      }, 80);
    },
    [selectedNodeId, refreshVisibility, triggerAutoSave, setRfNodes],
  );

  // ==========================================
  // 노드 추가: 형제 (Enter)
  // ==========================================
  const addSiblingNode = useCallback(
    (overrideNodeId?: string) => {
      const targetId =
        (typeof overrideNodeId === 'string' ? overrideNodeId : null) ||
        selectedNodeId;
      if (!targetId) return;

      const targetNode = allNodesRef.current.find((n) => n.id === targetId);
      if (!targetNode?.parentId) {
        addChildNode(targetId);
        return;
      }

      const parentId = targetNode.parentId;
      const siblingCount = allNodesRef.current.filter(
        (n) => n.parentId === parentId,
      ).length;

      const newId = generateId();
      const newNode: MindmapNodeData = {
        id: newId,
        parentId,
        sortOrder: siblingCount,
        collapsed: false,
        label: '새 노드',
        position: { x: 0, y: 0 },
      };

      allNodesRef.current = [...allNodesRef.current, newNode];
      newNode.position = calcNewNodePosition(allNodesRef.current, newId);

      refreshVisibility();
      triggerAutoSave();
      setSelectedNodeId(newId);

      setTimeout(() => {
        setRfNodes((nds) =>
          nds.map((n) => ({ ...n, selected: n.id === newId })),
        );
        window.dispatchEvent(
          new CustomEvent('mindmap:startEdit', { detail: newId }),
        );
      }, 80);
    },
    [selectedNodeId, addChildNode, refreshVisibility, triggerAutoSave, setRfNodes],
  );

  // ==========================================
  // 노드 삭제 (Delete)
  // ==========================================
  const deleteSelectedNode = useCallback(() => {
    if (!selectedNodeId) return;
    const node = allNodesRef.current.find((n) => n.id === selectedNodeId);
    if (!node?.parentId) return;

    function collectDescendants(nodeId: string): string[] {
      const ids = [nodeId];
      allNodesRef.current
        .filter((n) => n.parentId === nodeId)
        .forEach((n) => {
          ids.push(...collectDescendants(n.id));
        });
      return ids;
    }

    const idsToDelete = new Set(collectDescendants(selectedNodeId));
    allNodesRef.current = allNodesRef.current.filter(
      (n) => !idsToDelete.has(n.id),
    );

    refreshVisibility();
    triggerAutoSave();
    setSelectedNodeId(null);
  }, [selectedNodeId, refreshVisibility, triggerAutoSave]);

  // ==========================================
  // 편집 중 Enter/Tab → 노드 생성 이벤트 수신
  // ==========================================
  useEffect(() => {
    const handleAddChild = (e: Event) =>
      addChildNode((e as CustomEvent).detail as string);
    const handleAddSibling = (e: Event) =>
      addSiblingNode((e as CustomEvent).detail as string);
    window.addEventListener('mindmap:addChild', handleAddChild);
    window.addEventListener('mindmap:addSibling', handleAddSibling);
    return () => {
      window.removeEventListener('mindmap:addChild', handleAddChild);
      window.removeEventListener('mindmap:addSibling', handleAddSibling);
    };
  }, [addChildNode, addSiblingNode]);

  // ==========================================
  // 키보드 단축키
  // ==========================================
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      )
        return;
      if (
        typeof target?.closest === 'function' &&
        target.closest('.mindmap-node--editing')
      )
        return;
      if (e.isComposing || e.keyCode === 229) return;
      if (e.repeat) return;
      switch (e.key) {
        case 'Tab':
          e.preventDefault();
          addChildNode();
          break;
        case 'Enter':
          e.preventDefault();
          addSiblingNode();
          break;
        case 'Backspace':
        case 'Delete':
          e.preventDefault();
          deleteSelectedNode();
          break;
        default:
          break;
      }
    },
    [addChildNode, addSiblingNode, deleteSelectedNode],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ==========================================
  // 렌더링
  // ==========================================
  if (loading) {
    return (
      <div className="editor">
        <Header title="로딩 중..." showBack />
        <div className="editor__loading">
          <div className="editor__spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="editor">
      <Header
        title={mapTitle}
        showBack
        rightAction={
          <div className="editor__header-actions">
            <span className="editor__auto-save-badge">자동 저장</span>
          </div>
        }
      />

      <div className="editor__canvas">
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={handleNodesChange}
          onSelectionChange={onSelectionChange}
          nodesConnectable={false}
          onMoveEnd={onMoveEnd}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          minZoom={0.1}
          maxZoom={2}
          deleteKeyCode={null}
          multiSelectionKeyCode={null}
          panOnScroll
          zoomOnPinch
          preventScrolling
        >
          <Background color="#2e2e3a" gap={20} size={1} />

          <Panel position="bottom-right" className="editor__side-panels">
            <div className="editor__edge-style-picker">
              {EDGE_STYLES.map((s) => (
                <button
                  key={s.id}
                  className={`editor__edge-style-btn ${
                    edgeStyle === s.id ? 'editor__edge-style-btn--active' : ''
                  }`}
                  onClick={() => setEdgeStyle(s.id)}
                  title={s.label}
                >
                  {s.icon}
                </button>
              ))}
            </div>
            <div className="editor__zoom-controls">
              <button
                className="editor__zoom-btn"
                onClick={() => zoomIn({ duration: 200 })}
              >
                +
              </button>
              <span className="editor__zoom-level">{zoomLevel}%</span>
              <button
                className="editor__zoom-btn"
                onClick={() => zoomOut({ duration: 200 })}
              >
                -
              </button>
            </div>
          </Panel>

          <Panel position="bottom-center" className="editor__toolbar">
            <button
              className="editor__tool-btn"
              onClick={() => addChildNode()}
              title="자식 노드 추가 (Tab)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="editor__tool-label">추가</span>
            </button>
            <button
              className="editor__tool-btn"
              onClick={() => addSiblingNode()}
              title="형제 노드 추가 (Enter)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              </svg>
              <span className="editor__tool-label">형제</span>
            </button>
            <button
              className="editor__tool-btn editor__tool-btn--danger"
              onClick={deleteSelectedNode}
              disabled={
                !selectedNodeId ||
                !!rfNodes.find(
                  (n) =>
                    n.id === selectedNodeId &&
                    (n.data as { isRoot?: boolean })?.isRoot,
                )
              }
              title="노드 삭제 (Delete)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="editor__tool-label">삭제</span>
            </button>
            <button
              className="editor__tool-btn"
              onClick={() => fitView({ padding: 0.3, duration: 300 })}
              title="전체 보기"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="editor__tool-label">맞춤</span>
            </button>
          </Panel>
        </ReactFlow>
      </div>

      <div className="editor__hint">
        <kbd>Tab</kbd> 자식 추가 &nbsp;<kbd>Enter</kbd> 형제 추가 &nbsp;
        <kbd>Del</kbd> 삭제 &nbsp;<kbd>더블클릭</kbd> 편집
      </div>
    </div>
  );
}

function Editor() {
  return (
    <ReactFlowProvider>
      <EditorInner />
    </ReactFlowProvider>
  );
}

export default Editor;
