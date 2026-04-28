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
  type Node,
  type Edge,
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
  updateMindmapTitle,
  generateId,
  subscribeSync,
} from '../utils/db';
import { layoutTree, deriveEdges, calcNewNodePosition } from '../utils/layout';
import { getHiddenIds, computeNodeStats, buildChildrenMap } from '../utils/tree';
import type { MindmapNodeData, RFNodeData, EdgeStyleId, SyncMessage } from '../types/mindmap';

type RFNode = Node<RFNodeData, 'mindmap'>;
import './Editor.css';

const nodeTypes = { mindmap: MindmapNode };
const edgeTypes = { mindmap: MindmapEdge };
const defaultEdgeOptions = { type: 'mindmap', animated: false };

function EditorInner() {
  const { mapId } = useParams<{ mapId: string }>();
  const navigate = useNavigate();

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState<RFNode>([]);
  const [rfEdges, setRfEdges] = useEdgesState<Edge>([]);

  const [mapTitle, setMapTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [edgeStyle, setEdgeStyle] = useState<EdgeStyleId>('bezier');

  // 미선택 시 루트 노드를 "사실상 선택된 노드"로 취급
  const rootNodeId = rfNodes.find((n) => n.data.isRoot)?.id ?? null;
  const effectiveNodeId = selectedNodeId || rootNodeId;
  const isEffectiveRoot = effectiveNodeId === rootNodeId;

  const { fitView, zoomIn, zoomOut, getZoom, setCenter, setViewport, getNode } = useReactFlow();
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialized = useRef(false);

  const allNodesRef = useRef<MindmapNodeData[]>([]);
  // keyboardHeight는 렌더에 사용하지 않으므로 ref만으로 관리 (불필요한 리렌더 방지)
  const keyboardHeightRef = useRef(0);
  // iOS Safari: touchstart에서 preventDefault()하면 click이 발생하지 않을 수 있음.
  // 액션을 touchstart에서 실행하고, click은 마우스 전용 fallback으로 분리.
  // 이 플래그로 touch→click 이중 실행을 방지.
  const touchFiredRef = useRef(false);

  // iOS Safari에서 프로그래밍적 focus()로 키보드를 띄우려면
  // 사용자 제스처의 동기 호출 스택 안에서 input을 focus해야 함.
  // FAB 탭 → (동기) 프록시 input focus → 키보드 열림 →
  // (비동기) 실제 노드 input이 마운트되면 포커스 이전 → 키보드 유지
  const focusProxyRef = useRef<HTMLInputElement>(null);
  const siblingFabRef = useRef<HTMLButtonElement>(null);
  const childFabRef = useRef<HTMLButtonElement>(null);

  // ==========================================
  // 모바일 키보드 높이 감지 + FAB 컨테이너를 visual viewport에 동기화
  //
  // iOS Safari에서 position:fixed의 키보드 처리가 불안정하므로,
  // visualViewport API로 FAB 컨테이너의 transform/height를
  // 실제 보이는 영역에 정확히 맞춤.
  //
  // [컨테이너 전략]
  // .editor__fabs: position:fixed; top:0; left:0; right:0
  // JS로 transform: translateY(vv.offsetTop), height: vv.height 적용
  // → 컨테이너가 visual viewport와 일치
  // → 내부 FAB은 position:absolute; bottom:X 로 안정적 배치
  // ==========================================
  const stableHeightRef = useRef(window.innerHeight);
  const fabContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      // 키보드 높이 계산 (setCenter 오프셋용)
      if (window.innerHeight > stableHeightRef.current) {
        stableHeightRef.current = window.innerHeight;
      }
      const kbH = stableHeightRef.current - window.innerHeight;
      keyboardHeightRef.current = kbH > 50 ? kbH : 0;

      // FAB 컨테이너를 visual viewport에 동기화
      const container = fabContainerRef.current;
      if (container) {
        container.style.transform = `translateY(${vv.offsetTop}px)`;
        container.style.height = `${vv.height}px`;
      }
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update(); // 초기값
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  // ==========================================
  // 편집 모드 진입 시 해당 노드를 보이는 영역의 상단 ~1/3 지점에 배치 (터치 디바이스 한정)
  //
  // 키보드 높이를 정확히 아는 것은 iOS Safari에서 어려우므로,
  // visualViewport.height를 "보이는 영역"으로 쓰고
  // 수직 가운데 대신 상단 1/3을 목표로 함 (키보드 높이 오차에 강건함).
  //
  // - Case A (키보드 이미 열림): 즉시 배치
  // - Case C (키보드 새로 열림): VV resize 안정화 후 배치
  // - 터치: 노드를 보이는 영역 상단 1/3에 배치 + 줌 보정
  // - PC: 노드가 화면 밖이면 화면 안으로 최소한의 패닝만 수행
  // ==========================================
  useEffect(() => {
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    const handleEditStarted = (e: Event) => {
      const nodeId = (e as CustomEvent).detail as string;
      const node = getNode(nodeId);
      if (!node) return;

      const currentZoom = getZoom();
      const w = node.measured?.width ?? 100;
      const h = node.measured?.height ?? 40;
      const cx = (node.position?.x ?? 0) + w / 2;
      const cy = (node.position?.y ?? 0) + h / 2;

      // NaN 방어 — 좌표가 유효하지 않으면 센터링 생략
      if (!Number.isFinite(cx) || !Number.isFinite(cy)) return;

      // ── PC: 화면 밖 노드만 화면 안으로 최소 패닝 ──
      if (!isTouchDevice) {
        const canvasEl = document.querySelector('.editor__canvas');
        if (!canvasEl) return;

        const canvasRect = canvasEl.getBoundingClientRect();
        const PADDING = 60;

        // React Flow 내부 transform에서 현재 뷰포트 행렬 추출
        const transformEl = canvasEl.querySelector('.react-flow__viewport');
        if (!transformEl) return;
        const matrix = new DOMMatrix(getComputedStyle(transformEl).transform);

        // 노드 중심의 화면상 좌표
        const screenX = cx * matrix.a + matrix.e + canvasRect.left;
        const screenY = cy * matrix.d + matrix.f + canvasRect.top;

        // 화면 안에 있으면 아무것도 하지 않음
        if (
          screenX >= canvasRect.left + PADDING &&
          screenX <= canvasRect.right - PADDING &&
          screenY >= canvasRect.top + PADDING &&
          screenY <= canvasRect.bottom - PADDING
        ) return;

        // 화면 밖이면 최소한의 패닝으로 화면 안으로 이동
        let dx = 0;
        let dy = 0;
        if (screenX < canvasRect.left + PADDING) dx = canvasRect.left + PADDING - screenX;
        if (screenX > canvasRect.right - PADDING) dx = canvasRect.right - PADDING - screenX;
        if (screenY < canvasRect.top + PADDING) dy = canvasRect.top + PADDING - screenY;
        if (screenY > canvasRect.bottom - PADDING) dy = canvasRect.bottom - PADDING - screenY;

        setViewport(
          { x: matrix.e + dx, y: matrix.f + dy, zoom: currentZoom },
          { duration: 200 },
        );
        return;
      }

      // ── 터치: 상단 1/3 배치 + 줌 보정 ──
      // 너무 축소된 상태(0.5 미만)에서만 살짝 보정, 그 외에는 현재 줌 유지
      const targetZoom =
        currentZoom < 0.5 ? 0.6 : currentZoom > 2 ? 2 : currentZoom;

      const kbAlreadyOpen = keyboardHeightRef.current > 0;
      const animDuration = kbAlreadyOpen ? 0 : 300;

      const doPosition = () => {
        const vv = window.visualViewport;
        const canvasEl = document.querySelector('.editor__canvas');
        if (!vv || !canvasEl) {
          setCenter(cx, cy, { zoom: targetZoom, duration: animDuration });
          return;
        }

        const canvasRect = canvasEl.getBoundingClientRect();
        const vvBottom = vv.offsetTop + vv.height;
        const visibleH = Math.max(vvBottom - canvasRect.top, 200);

        const targetLocalY = visibleH * 0.33;
        const targetLocalX = canvasRect.width / 2;

        const vpX = targetLocalX - cx * targetZoom;
        const vpY = targetLocalY - cy * targetZoom;

        if (!Number.isFinite(vpX) || !Number.isFinite(vpY)) return;
        setViewport({ x: vpX, y: vpY, zoom: targetZoom }, { duration: animDuration });
      };

      if (kbAlreadyOpen) {
        doPosition();
      } else {
        const vv = window.visualViewport;
        if (!vv) {
          doPosition();
          return;
        }

        let debounceTimer: ReturnType<typeof setTimeout>;
        let fallbackTimer: ReturnType<typeof setTimeout>;

        const cleanup = () => {
          clearTimeout(debounceTimer);
          clearTimeout(fallbackTimer);
          vv.removeEventListener('resize', onVVResize);
        };

        const onVVResize = () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            cleanup();
            doPosition();
          }, 150);
        };

        vv.addEventListener('resize', onVVResize);

        fallbackTimer = setTimeout(() => {
          cleanup();
          doPosition();
        }, 600);
      }
    };

    window.addEventListener('mindmap:editStarted', handleEditStarted);
    return () =>
      window.removeEventListener('mindmap:editStarted', handleEditStarted);
  }, [getNode, getZoom, setCenter, setViewport]);

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          loadedNodes = loadedNodes.map((n: any) => {
            const rawLabel = n.label ?? n.data?.label;
            const pos = n.position as { x: number; y: number } | undefined;
            return {
              id: n.id as string,
              parentId: (n.parentId as string) || null,
              sortOrder: (n.sortOrder as number) ?? 0,
              collapsed: (n.collapsed as boolean) ?? false,
              // ?? 를 사용하여 빈 문자열 ''도 유효한 값으로 보존
              label: typeof rawLabel === 'string' ? rawLabel : '노드',
              position:
                pos && Number.isFinite(pos.x) && Number.isFinite(pos.y)
                  ? pos
                  : { x: 0, y: 0 },
            };
          });
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
    updateMindmapSettings(mapId!, { edge_style: edgeStyle });
  }, [edgeStyle, refreshVisibility, mapId]);

  // ==========================================
  // 노드 드래그
  // ==========================================
  const handleNodesChange = useCallback(
    (changes: NodeChange<RFNode>[]) => {
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
      if (orig && orig.label !== rfn.data.label) {
        orig.label = rfn.data.label;
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
  // 노드 삽입 공통 로직: allNodesRef에 추가 → 위치 계산 → 선택 → 편집 진입
  // ==========================================
  const insertNodeAndEdit = useCallback(
    (parentId: string) => {
      const siblingCount = allNodesRef.current.filter(
        (n) => n.parentId === parentId,
      ).length;

      const newId = generateId();
      const newNode: MindmapNodeData = {
        id: newId,
        parentId,
        sortOrder: siblingCount,
        collapsed: false,
        label: '',
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
    [refreshVisibility, triggerAutoSave, setRfNodes],
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

      insertNodeAndEdit(parentId);
    },
    [selectedNodeId, insertNodeAndEdit],
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
      // 루트 노드(parentId 없음)에서는 형제 추가 불가
      if (!targetNode?.parentId) return;

      insertNodeAndEdit(targetNode.parentId);
    },
    [selectedNodeId, insertNodeAndEdit],
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
  // FAB touchstart 리스너 — { passive: false }로 등록
  //
  // React의 onTouchStart는 passive 리스너로 등록되어
  // preventDefault() 호출 시 콘솔 에러가 발생함.
  // ref + addEventListener로 직접 등록하여 해결.
  // ==========================================
  useEffect(() => {
    const siblingBtn = siblingFabRef.current;
    const childBtn = childFabRef.current;

    const handleSiblingTouch = (e: TouchEvent) => {
      e.preventDefault();
      touchFiredRef.current = true;
      focusProxyRef.current?.focus();
      addSiblingNode();
    };
    const handleChildTouch = (e: TouchEvent) => {
      e.preventDefault();
      touchFiredRef.current = true;
      focusProxyRef.current?.focus();
      addChildNode();
    };

    siblingBtn?.addEventListener('touchstart', handleSiblingTouch, { passive: false });
    childBtn?.addEventListener('touchstart', handleChildTouch, { passive: false });

    return () => {
      siblingBtn?.removeEventListener('touchstart', handleSiblingTouch);
      childBtn?.removeEventListener('touchstart', handleChildTouch);
    };
  }, [addSiblingNode, addChildNode]);

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
        onTitleChange={(newTitle) => {
          setMapTitle(newTitle);
          updateMindmapTitle(mapId!, newTitle);
        }}
        rightAction={
          <div className="editor__header-actions">
            <span className="editor__auto-save-badge">자동 저장</span>
            <button
              className="editor__fitview-btn"
              onClick={() => fitView({ padding: 0.3, duration: 300 })}
              title="전체 보기"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
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

          <Panel
            position="bottom-right"
            className="editor__side-panels"
          >
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

        </ReactFlow>
      </div>

      {/* 플로팅 FAB — position:fixed 컨테이너를 VV API로 visual viewport에 동기화.
           내부 FAB은 position:absolute; bottom:X 로 배치하여 키보드 위에 안정적으로 표시. */}
      <div className="editor__fabs" ref={fabContainerRef}>
        {/* 좌측 하단: 삭제 */}
        <button
          className="editor__fab editor__fab--delete"
          onClick={deleteSelectedNode}
          disabled={isEffectiveRoot}
          title="노드 삭제 (Delete)"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* 우측 하단: 형제 추가 + 자식 추가 (아래→위 순서)
             iOS Safari: touchstart에서 preventDefault() 후 click이 안 터질 수 있으므로
             액션을 touchstart에서 직접 실행. click은 마우스 전용 fallback. */}
        <div className="editor__fab-group-right">
          <button
            ref={siblingFabRef}
            className="editor__fab editor__fab--add"
            disabled={isEffectiveRoot}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (touchFiredRef.current) { touchFiredRef.current = false; return; }
              addSiblingNode();
            }}
            title="형제 노드 추가 (Enter)"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
          </button>
          <button
            ref={childFabRef}
            className="editor__fab editor__fab--add"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              if (touchFiredRef.current) { touchFiredRef.current = false; return; }
              addChildNode();
            }}
            title="자식 노드 추가 (Tab)"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* iOS Safari 키보드 선점용 프록시 input — 화면 밖에 숨김 */}
      <input
        ref={focusProxyRef}
        className="editor__focus-proxy"
        aria-hidden="true"
        tabIndex={-1}
      />

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
