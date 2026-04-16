import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import {
  getAllMindmaps,
  createMindmap,
  deleteMindmap,
  deleteMindmaps,
  updateMindmapTitle,
  toggleFavorite,
  subscribeSync,
} from '../utils/db';
import type { Mindmap, SyncMessage } from '../types/mindmap';
import './Dashboard.css';

// ── 인라인 SVG 아이콘 ──────────────────────────────────────
const StarSVG = ({ filled }: { filled: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'}>
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckSVG = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <path
      d="M20 6L9 17l-5-5"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ── 타입 ──────────────────────────────────────────────────
type TabId = 'latest' | 'favorites';

function Dashboard() {
  const navigate = useNavigate();
  const [mindmaps, setMindmaps] = useState<Mindmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // 탭
  const [activeTab, setActiveTab] = useState<TabId>('latest');

  // 편집 모드
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 카드 제목 인라인 편집
  const [editingMapId, setEditingMapId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  // ── 파생 값 ────────────────────────────────────────────
  const displayedMaps =
    activeTab === 'favorites' ? mindmaps.filter((m) => m.isFavorite) : mindmaps;

  // ── 데이터 로드 ────────────────────────────────────────
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

  // 탭 전환 시 선택 초기화
  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab]);

  // ── 제목 인라인 편집 ───────────────────────────────────
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
    if (isEditMode) return;
    setEditingMapId(map.id);
    setEditingTitle(map.title);
  };

  // ── 생성 ───────────────────────────────────────────────
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

  // ── 단건 삭제 ──────────────────────────────────────────
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

  // ── 즐겨찾기 토글 ──────────────────────────────────────
  const handleToggleFavorite = async (e: React.MouseEvent, map: Mindmap) => {
    e.stopPropagation();
    try {
      await toggleFavorite(map.id, !map.isFavorite);
      loadMindmaps();
    } catch (err) {
      console.error('즐겨찾기 변경 실패:', err);
    }
  };

  // ── 편집 모드 ──────────────────────────────────────────
  const enterEditMode = () => {
    setIsEditMode(true);
    setSelectedIds(new Set());
    setEditingMapId(null);
  };

  const exitEditMode = () => {
    setIsEditMode(false);
    setSelectedIds(new Set());
  };

  const handleCheckboxToggle = (mapId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(mapId) ? next.delete(mapId) : next.add(mapId);
      return next;
    });
  };

  // ── 일괄 삭제 ──────────────────────────────────────────
  const handleBulkDelete = async () => {
    try {
      await deleteMindmaps(Array.from(selectedIds));
      setShowBulkDeleteModal(false);
      exitEditMode();
      loadMindmaps();
    } catch (err) {
      console.error('일괄 삭제 실패:', err);
    }
  };

  // ── 시간 포맷 ──────────────────────────────────────────
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

  const deleteTarget = mindmaps.find((m) => m.id === showDeleteModal);
  const hasBulkBar = isEditMode && selectedIds.size > 0;

  return (
    <div className="dashboard">
      <Header
        title="Mind Orbit"
        rightAction={
          isEditMode ? (
            <div className="dashboard__header-edit-actions">
              {selectedIds.size > 0 && (
                <span className="dashboard__selected-count">
                  {selectedIds.size}개 선택됨
                </span>
              )}
              <button className="dashboard__done-btn" onClick={exitEditMode}>
                완료
              </button>
            </div>
          ) : (
            <div className="dashboard__header-normal-actions">
              <button
                className="dashboard__edit-mode-btn"
                onClick={enterEditMode}
              >
                편집
              </button>
              <button
                className="dashboard__create-btn"
                onClick={() => setShowCreateModal(true)}
              >
                + 새 마인드맵
              </button>
            </div>
          )
        }
      />

      <main
        className={`dashboard__content${hasBulkBar ? ' dashboard__content--with-bulk-bar' : ''}`}
      >
        {/* 탭 */}
        <div className="dashboard__tabs" role="tablist">
          {(['latest', 'favorites'] as TabId[]).map((tab) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              className={`dashboard__tab${activeTab === tab ? ' dashboard__tab--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'latest' ? '최신' : '즐겨찾기'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="dashboard__loading">
            <div className="dashboard__spinner" />
          </div>
        ) : displayedMaps.length === 0 ? (
          activeTab === 'favorites' ? (
            <EmptyState
              icon={
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    stroke="var(--color-border)"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              title="즐겨찾기한 마인드맵이 없어요"
              description="카드의 별 아이콘을 눌러 즐겨찾기에 추가해보세요."
              action={null}
            />
          ) : (
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
          )
        ) : (
          <ul className="dashboard__list">
            {displayedMaps.map((map) =>
              isEditMode ? (
                // ── 편집 모드 카드 ────────────────────────
                <li
                  key={map.id}
                  className={`dashboard__card dashboard__card--edit-mode${
                    selectedIds.has(map.id) ? ' dashboard__card--selected' : ''
                  }`}
                  onClick={() => handleCheckboxToggle(map.id)}
                >
                  <div className="dashboard__checkbox" aria-hidden="true">
                    <div className="dashboard__checkbox-circle">
                      {selectedIds.has(map.id) && <CheckSVG />}
                    </div>
                  </div>
                  <div className="dashboard__card-body">
                    <span className="dashboard__card-title">{map.title}</span>
                    <span className="dashboard__card-date">
                      {formatDate(map.updatedAt)}
                    </span>
                  </div>
                </li>
              ) : (
                // ── 일반 모드 카드 ────────────────────────
                <li key={map.id} className="dashboard__card">
                  {/* 별 아이콘 */}
                  <button
                    className={`dashboard__star-btn${map.isFavorite ? ' dashboard__star-btn--active' : ''}`}
                    onClick={(e) => handleToggleFavorite(e, map)}
                    aria-label={map.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                    title={map.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                  >
                    <StarSVG filled={!!map.isFavorite} />
                  </button>

                  {/* 카드 본문 (제목 편집 또는 네비게이션) */}
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
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            commitCardTitle();
                          }
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

                  {/* 액션 버튼 (연필 / 삭제) */}
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
              )
            )}
          </ul>
        )}
      </main>

      {/* FAB - 모바일용 빠른 생성 버튼 (편집 모드에서 숨김) */}
      {mindmaps.length > 0 && !isEditMode && (
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

      {/* 하단 일괄 삭제 바 */}
      {hasBulkBar && (
        <div className="dashboard__bulk-bar">
          <span className="dashboard__bulk-bar-count">
            {selectedIds.size}개 선택됨
          </span>
          <button
            className="dashboard__bulk-delete-btn"
            onClick={() => setShowBulkDeleteModal(true)}
          >
            삭제
          </button>
        </div>
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

      {/* 단건 삭제 확인 모달 */}
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

      {/* 일괄 삭제 확인 모달 */}
      <Modal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        title="마인드맵 삭제"
      >
        <p className="dashboard__delete-msg">
          <strong>{selectedIds.size}개</strong>의 마인드맵을 삭제하시겠습니까?
          <br />
          <span className="dashboard__delete-warn">
            이 작업은 되돌릴 수 없습니다.
          </span>
        </p>
        <div className="dashboard__modal-actions">
          <button
            className="dashboard__btn dashboard__btn--ghost"
            onClick={() => setShowBulkDeleteModal(false)}
          >
            취소
          </button>
          <button
            className="dashboard__btn dashboard__btn--danger"
            onClick={handleBulkDelete}
          >
            삭제
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Dashboard;
