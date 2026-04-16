import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import {
  getAllMindmaps,
  createMindmap,
  deleteMindmap,
  updateMindmapTitle,
  subscribeSync,
} from '../utils/db';
import type { Mindmap, SyncMessage } from '../types/mindmap';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [mindmaps, setMindmaps] = useState<Mindmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  // 목록 로드
  const loadMindmaps = useCallback(async () => {
    try {
      const maps = await getAllMindmaps();
      setMindmaps(maps);
    } catch (err) {
      console.error('마인드맵 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMindmaps();
  }, [loadMindmaps]);

  // 다른 탭에서 목록이 변경되면 자동 새로고침
  useEffect(() => {
    const unsubscribe = subscribeSync((msg: SyncMessage) => {
      if (
        msg?.type === 'mindmap:list:changed' ||
        msg?.type === 'mindmap:data:changed'
      ) {
        loadMindmaps();
      }
    });
    return unsubscribe;
  }, [loadMindmaps]);

  // 새 마인드맵 생성
  const handleCreate = async () => {
    const title = newTitle.trim() || '새 마인드맵';
    try {
      const mapId = await createMindmap(title);
      setShowCreateModal(false);
      setNewTitle('');
      navigate(`/map/${mapId}`);
    } catch (err) {
      console.error('마인드맵 생성 실패:', err);
    }
  };

  // 마인드맵 삭제
  const handleDelete = async () => {
    if (!showDeleteModal) return;
    try {
      await deleteMindmap(showDeleteModal);
      setShowDeleteModal(null);
      loadMindmaps();
    } catch (err) {
      console.error('마인드맵 삭제 실패:', err);
    }
  };

  // 시간 포맷
  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffHour < 24) return `${diffHour}시간 전`;
    if (diffDay < 7) return `${diffDay}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  // 카드 제목 인라인 편집
  const [editingMapId, setEditingMapId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingMapId && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingMapId]);

  const commitCardTitle = useCallback(() => {
    if (!editingMapId) return;
    const trimmed = editingTitle.trim();
    const mapId = editingMapId;
    setEditingMapId(null);
    if (trimmed && trimmed !== mindmaps.find((m) => m.id === mapId)?.title) {
      updateMindmapTitle(mapId, trimmed).then(() => loadMindmaps());
    }
  }, [editingMapId, editingTitle, mindmaps, loadMindmaps]);

  const startEditingCard = (map: Mindmap) => {
    setEditingMapId(map.id);
    setEditingTitle(map.title);
  };

  const deleteTarget = mindmaps.find((m) => m.id === showDeleteModal);

  return (
    <div className="dashboard">
      <Header
        title="Mind Orbit"
        rightAction={
          <button
            className="dashboard__create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            + 새 마인드맵
          </button>
        }
      />

      <main className="dashboard__content">
        {loading ? (
          <div className="dashboard__loading">
            <div className="dashboard__spinner" />
          </div>
        ) : mindmaps.length === 0 ? (
          <EmptyState
            icon={
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="var(--color-border)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="6"
                  fill="var(--color-accent)"
                  opacity="0.5"
                />
                <circle cx="18" cy="20" r="4" fill="var(--color-border)" />
                <circle cx="46" cy="22" r="4" fill="var(--color-border)" />
                <circle cx="22" cy="44" r="4" fill="var(--color-border)" />
                <circle cx="44" cy="42" r="4" fill="var(--color-border)" />
              </svg>
            }
            title="아직 마인드맵이 없어요"
            description="첫 번째 마인드맵을 만들어 생각을 정리해보세요."
            action={
              <button
                className="dashboard__create-btn dashboard__create-btn--large"
                onClick={() => setShowCreateModal(true)}
              >
                + 새 마인드맵 만들기
              </button>
            }
          />
        ) : (
          <ul className="dashboard__list">
            {mindmaps.map((map) => (
              <li key={map.id} className="dashboard__card">
                {editingMapId === map.id ? (
                  <div className="dashboard__card-body">
                    <input
                      ref={titleInputRef}
                      className="dashboard__card-title-input"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={commitCardTitle}
                      onKeyDown={(e) => {
                        if (e.nativeEvent.isComposing || e.keyCode === 229) return;
                        if (e.key === 'Enter') { e.preventDefault(); commitCardTitle(); }
                        if (e.key === 'Escape') setEditingMapId(null);
                      }}
                      maxLength={50}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <span className="dashboard__card-date">
                      {formatDate(map.updatedAt)}
                    </span>
                  </div>
                ) : (
                  <button
                    className="dashboard__card-body"
                    onClick={() => navigate(`/map/${map.id}`)}
                  >
                    <span className="dashboard__card-title">{map.title}</span>
                    <span className="dashboard__card-date">
                      {formatDate(map.updatedAt)}
                    </span>
                  </button>
                )}
                <div className="dashboard__card-actions">
                  <button
                    className="dashboard__card-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditingCard(map);
                    }}
                    aria-label={`${map.title} 이름 변경`}
                    title="이름 변경"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    className="dashboard__card-action-btn dashboard__card-action-btn--danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteModal(map.id);
                    }}
                    aria-label={`${map.title} 삭제`}
                    title="삭제"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* FAB - 모바일용 빠른 생성 버튼 */}
      {mindmaps.length > 0 && (
        <button
          className="dashboard__fab"
          onClick={() => setShowCreateModal(true)}
          aria-label="새 마인드맵 만들기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      {/* 생성 모달 */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewTitle('');
        }}
        title="새 마인드맵"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <input
            className="dashboard__input"
            type="text"
            placeholder="마인드맵 이름을 입력하세요"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
            maxLength={50}
          />
          <div className="dashboard__modal-actions">
            <button
              type="button"
              className="dashboard__btn dashboard__btn--ghost"
              onClick={() => {
                setShowCreateModal(false);
                setNewTitle('');
              }}
            >
              취소
            </button>
            <button
              type="submit"
              className="dashboard__btn dashboard__btn--primary"
            >
              만들기
            </button>
          </div>
        </form>
      </Modal>

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        title="마인드맵 삭제"
      >
        <p className="dashboard__delete-msg">
          <strong>{deleteTarget?.title}</strong>을(를) 삭제하시겠습니까?
          <br />
          <span className="dashboard__delete-warn">
            이 작업은 되돌릴 수 없습니다.
          </span>
        </p>
        <div className="dashboard__modal-actions">
          <button
            className="dashboard__btn dashboard__btn--ghost"
            onClick={() => setShowDeleteModal(null)}
          >
            취소
          </button>
          <button
            className="dashboard__btn dashboard__btn--danger"
            onClick={handleDelete}
          >
            삭제
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Dashboard;
