import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import type { NodeProps, Node } from '@xyflow/react';
import type { RFNodeData } from '../../types/mindmap';
import './MindmapNode.css';

type MindmapNodeType = Node<RFNodeData, 'mindmap'>;

/**
 * 마인드맵 커스텀 노드 컴포넌트
 * - 더블클릭/탭으로 텍스트 편집
 * - 노드 생성 직후 자동으로 편집 모드 진입 (mindmap:startEdit 이벤트)
 * - 편집 중 Enter → 편집 완료 + 형제 노드 생성 (mindmap:addSibling)
 * - 편집 중 Tab → 편집 완료 + 자식 노드 생성 (mindmap:addChild)
 * - 자식이 있으면 접기/펼치기 토글 버튼
 */
function MindmapNode({ id, data, selected }: NodeProps<MindmapNodeType>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const { setNodes } = useReactFlow();

  const isRoot = data.isRoot;
  const isCollapsed = data.collapsed;
  const descendantCount = data.descendantCount || 0;
  const hasChildren = (data.childCount || 0) > 0;
  const side = data.side || 'right';
  const targetPos = side === 'left' ? Position.Right : Position.Left;
  const sourcePos = side === 'left' ? Position.Left : Position.Right;
  const isGhost = data.isGhost === true;
  const isDragSource = data.isDragSource === true;

  // 편집 모드 진입 시 포커스 + 중앙 정렬 요청 이벤트 발행
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
      // Editor가 이 이벤트를 받아 해당 노드를 뷰포트 중앙으로 옮기고
      // 필요 시 줌 레벨도 가독 가능한 범위로 보정
      window.dispatchEvent(
        new CustomEvent('mindmap:editStarted', { detail: id }),
      );
    }
  }, [isEditing, id]);

  const labelRef = useRef(data.label);
  useEffect(() => {
    labelRef.current = data.label;
  }, [data.label]);

  // 외부에서 편집 모드 진입 요청 수신 (노드 생성 직후)
  useEffect(() => {
    const handleStartEdit = (e: Event) => {
      if ((e as CustomEvent).detail === id) {
        setEditValue(labelRef.current || '');
        setIsEditing(true);
      }
    };
    window.addEventListener('mindmap:startEdit', handleStartEdit);
    return () => window.removeEventListener('mindmap:startEdit', handleStartEdit);
  }, [id]);

  const startEditing = () => {
    setEditValue(data.label || '');
    setIsEditing(true);
  };

  // 편집 완료 후 라벨 업데이트
  const commitLabel = useCallback(() => {
    setIsEditing(false);
    const newLabel = editValue.trim();
    if (newLabel !== data.label) {
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? { ...node, data: { ...node.data, label: newLabel } }
            : node,
        ),
      );
    }
  }, [editValue, data.label, id, setNodes]);

  const committedByKeyRef = useRef(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.repeat) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent?.stopImmediatePropagation?.();
      committedByKeyRef.current = true;
      commitLabel();
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('mindmap:addSibling', { detail: id }),
        );
      }, 0);
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      e.nativeEvent?.stopImmediatePropagation?.();
      committedByKeyRef.current = true;
      commitLabel();
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent('mindmap:addChild', { detail: id }),
        );
      }, 0);
      return;
    }
    if (e.key === 'Escape') {
      setEditValue(data.label || '');
      setIsEditing(false);
    }
    e.stopPropagation();
  };

  const handleBlur = useCallback(() => {
    if (committedByKeyRef.current) {
      committedByKeyRef.current = false;
      return;
    }
    commitLabel();
  }, [commitLabel]);

  // Outside-click commit
  // - input의 onBlur만으로는 종료가 보장되지 않는 경우가 있음:
  //   (a) React Flow pane이 mousedown에서 preventDefault를 호출 → focus shift 차단되어 blur 미발생
  //   (b) 편집 모드 진입 직후 useEffect가 input.focus() 부르기 전에 사용자가 빠르게 배경을 누름
  //       → 잃을 focus가 없어 blur 미발생
  // - capture 단계로 document에 pointerdown을 걸어 React Flow보다 먼저 commit
  // - editValue 변동마다 listener 재등록되는 비효율을 막기 위해 commitLabel은 ref로 우회
  const commitLabelRef = useRef(commitLabel);
  useEffect(() => {
    commitLabelRef.current = commitLabel;
  }, [commitLabel]);

  useEffect(() => {
    if (!isEditing) return;
    const handle = (e: PointerEvent) => {
      if (e.button !== 0) return; // 우클릭 등은 제외 (터치는 button === 0)
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const editingEl = inputRef.current?.closest('.mindmap-node');
      if (editingEl && editingEl.contains(t)) return; // 편집 노드 내부 클릭은 무시
      // input unmount로 인한 auto-blur가 commitLabel을 또 부르지 않도록 선제 마킹
      committedByKeyRef.current = true;
      commitLabelRef.current();
    };
    document.addEventListener('pointerdown', handle, true);
    return () => document.removeEventListener('pointerdown', handle, true);
  }, [isEditing]);

  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent('mindmap:toggleCollapse', { detail: id }),
    );
  };

  const handleNodeMouseDown = (e: React.MouseEvent) => {
    if (!isEditing) return;
    if (e.target === inputRef.current) return;
    e.preventDefault();

    const input = inputRef.current;
    if (!input) return;

    const rect = input.getBoundingClientRect();
    input.focus();
    if (e.clientX <= rect.left) {
      input.setSelectionRange(0, 0);
    } else if (e.clientX >= rect.right) {
      const len = input.value.length;
      input.setSelectionRange(len, len);
    }
  };

  return (
    <div
      className={`mindmap-node ${isRoot ? 'mindmap-node--root' : ''} ${
        selected ? 'mindmap-node--selected' : ''
      } ${isCollapsed ? 'mindmap-node--collapsed' : ''} ${
        isEditing ? 'mindmap-node--editing nodrag nopan' : ''
      } ${!isRoot && side === 'left' ? 'mindmap-node--side-left' : ''} ${
        isDragSource ? 'mindmap-node--drag-source' : ''
      } ${isGhost ? 'mindmap-node--drag-ghost' : ''}`}
      onDoubleClick={startEditing}
      onMouseDown={handleNodeMouseDown}
    >
      {!isRoot && (
        <Handle
          type="target"
          position={targetPos}
          className="mindmap-node__handle mindmap-node__handle--hidden"
          isConnectable={false}
        />
      )}

      <span className="mindmap-node__label-wrap">
        <span className="mindmap-node__label" aria-hidden={isEditing}>
          {isEditing ? editValue : data.label}
        </span>
        {isEditing && (
          <input
            ref={inputRef}
            className="mindmap-node__input nodrag"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            maxLength={100}
            size={1}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
          />
        )}
      </span>

      {isRoot ? (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="right"
            className="mindmap-node__handle mindmap-node__handle--hidden"
            isConnectable={false}
          />
          <Handle
            type="source"
            position={Position.Left}
            id="left"
            className="mindmap-node__handle mindmap-node__handle--hidden"
            isConnectable={false}
          />
        </>
      ) : (
        <Handle
          type="source"
          position={sourcePos}
          className="mindmap-node__handle mindmap-node__handle--hidden"
          isConnectable={false}
        />
      )}

      {hasChildren && (
        <button
          className={`mindmap-node__collapse-btn nodrag ${
            isCollapsed
              ? 'mindmap-node__collapse-btn--count'
              : 'mindmap-node__collapse-btn--chevron'
          }`}
          onClick={toggleCollapse}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label={isCollapsed ? '펼치기' : '접기'}
          title={isCollapsed ? `펼치기 (자손 ${descendantCount})` : '접기'}
        >
          {isCollapsed ? (
            <span className="mindmap-node__collapse-count">
              {descendantCount}
            </span>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M3 5l3 3 3-3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

export default memo(MindmapNode);
