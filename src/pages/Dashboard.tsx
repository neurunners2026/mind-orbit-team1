import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import {
  getAllMindmaps,
  createMindmap,
  deleteMindmap,
  toggleFavorite,
  getAllNodeCounts,
  subscribeSync,
} from '../utils/db';
import type { Mindmap, SyncMessage } from '../types/mindmap';
import './Dashboard.css';

// ── 타입 ──────────────────────────────────────────────────
type TabId = 'all' | 'favorites';

// ── 인라인 SVG 아이콘 ──────────────────────────────────────
const StarSVG = ({ filled }: { filled: boolean }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'}>
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TrashSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NodeSVG = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.8" />
    <circle cx="4" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="20" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="4" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="20" cy="18" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <line x1="9.5" y1="10.5" x2="6" y2="7.5" stroke="currentColor" strokeWidth="1.2" />
    <line x1="14.5" y1="10.5" x2="18" y2="7.5" stroke="currentColor" strokeWidth="1.2" />
    <line x1="9.5" y1="13.5" x2="6" y2="16.5" stroke="currentColor" strokeWidth="1.2" />
    <line x1="14.5" y1="13.5" x2="18" y2="16.5" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

// ── Dashboard 컴포넌트 ─────────────────────────────────────
function Dashboard() {
  const navigate = useNavigate();

  // 데이터
  const [mindmaps, setMindmaps] = useState<Mindmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [nodeCounts, setNodeCounts] = useState<Record<string, number>>({});

  // 탭
  const [activeTab, setActiveTab] = useState<TabId>('all');

  // 모달
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  // ── 파생 값 ──────────────────────────────────────────────
  const favoritesCount = useMemo(
    () => mindmaps.filter((m) => m.isFavorite).length,
    [mindmaps],
  );

  const filteredMaps = useMemo(
    () => (activeTab === 'favorites' ? mindmaps.filter((m) => m.isFavorite) : mindmaps),
    [mindmaps, activeTab],
  );

  // ── 데이터 로드 ───────────────────────────────────────────
  const loadMindmaps = useCallback(async () => {
    try {
      const [maps, counts] = await Promise.all([getAllMindmaps(), getAllNodeCounts()]);
      setMindmaps(maps);
      setNodeCounts(counts);
    } catch (err) {
      console.error('마인드맵 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMindmaps(); }, [loadMindmaps]);

  useEffect(() => {
    const unsubscribe = subscribeSync((msg: SyncMessage) => {
      if (msg?.type === 'mindmap:list:changed' || msg?.type === 'mindmap:data:changed') {
        loadMindmaps();
      }
    });
    return unsubscribe;
  }, [loadMindmaps]);

  // ── 생성 ──────────────────────────────────────────────────
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

  // ── 삭제 ──────────────────────────────────────────────────
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

  // ── 즐겨찾기 토글 ─────────────────────────────────────────
  const handleToggleFavorite = async (e: React.MouseEvent, map: Mindmap) => {
    e.stopPropagation();
    try {
      await toggleFavorite(map.id, !map.isFavorite);
      loadMindmaps();
    } catch (err) {
      console.error('즐겨찾기 변경 실패:', err);
    }
  };

  // ── 시간 포맷 ─────────────────────────────────────────────
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

  // ── 렌더 ──────────────────────────────────────────────────
  return (
    <div className="dashboard">
      <Header
        title="Mind Orbit"
        titleLink="/"
        rightAction={
          <button className="dashboard__create-btn" onClick={() => setShowCreateModal(true)}>
            + 새 마인드맵
          </button>
        }
      />

      <main className="dashboard__content">
        {/* 탭 */}
        <div className="dashboard__tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'all'}
            className={`dashboard__tab${activeTab === 'all' ? ' dashboard__tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
            <span className="dashboard__tab-count">{mindmaps.length}</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'favorites'}
            className={`dashboard__tab${activeTab === 'favorites' ? ' dashboard__tab--active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            Favorites
            <span className="dashboard__tab-count">{favoritesCount}</span>
          </button>
        </div>

        {/* 콘텐츠 */}
        {loading ? (
          <div className="dashboard__loading">
            <div className="dashboard__spinner" />
          </div>
        ) : filteredMaps.length === 0 ? (
          <EmptyState
            icon={
              activeTab === 'favorites' ? (
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    stroke="var(--color-border)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="28" stroke="var(--color-border)" strokeWidth="2" strokeDasharray="4 4" />
                  <circle cx="32" cy="32" r="6" fill="var(--color-accent)" opacity="0.5" />
                  <circle cx="18" cy="20" r="4" fill="var(--color-border)" />
                  <circle cx="46" cy="22" r="4" fill="var(--color-border)" />
                  <circle cx="22" cy="44" r="4" fill="var(--color-border)" />
                  <circle cx="44" cy="42" r="4" fill="var(--color-border)" />
                </svg>
              )
            }
            title={
              activeTab === 'favorites'
                ? '즐겨찾기한 마인드맵이 없어요'
                : '아직 마인드맵이 없어요'
            }
            description={
              activeTab === 'favorites'
                ? '별 아이콘을 눌러 즐겨찾기에 추가해보세요.'
                : '첫 번째 마인드맵을 만들어 생각을 정리해보세요.'
            }
            action={
              activeTab === 'all' ? (
                <button
                  className="dashboard__create-btn dashboard__create-btn--large"
                  onClick={() => setShowCreateModal(true)}
                >
                  + 새 마인드맵 만들기
                </button>
              ) : null
            }
          />
        ) : (
          <ul className="dashboard__list">
            {filteredMaps.map((map) => (
              <li key={map.id} className="dashboard__list-item">
                {/* 본문 */}
                <div
                  className="dashboard__list-body"
                  onClick={() => navigate(`/map/${map.id}`)}
                >
                  <span className="dashboard__list-title">{map.title}</span>
                  <div className="dashboard__list-meta">
                    <span className="dashboard__list-date">{formatDate(map.updatedAt)}</span>
                    <span className="dashboard__list-nodes">
                      <NodeSVG />
                      {nodeCounts[map.id] ?? 0}
                    </span>
                  </div>
                </div>

                {/* 우측 액션: 별 + 쓰레기통 */}
                <div className="dashboard__list-actions">
                  <button
                    className={`dashboard__star-btn${map.isFavorite ? ' dashboard__star-btn--active' : ''}`}
                    onClick={(e) => handleToggleFavorite(e, map)}
                    aria-label={map.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                  >
                    <StarSVG filled={!!map.isFavorite} />
                  </button>
                  <button
                    className="dashboard__trash-btn"
                    onClick={(e) => { e.stopPropagation(); setShowDeleteModal(map.id); }}
                    aria-label={`${map.title} 삭제`}
                  >
                    <TrashSVG />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* FAB */}
      {mindmaps.length > 0 && (
        <button
          className="dashboard__fab"
          onClick={() => setShowCreateModal(true)}
          aria-label="새 마인드맵 만들기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>
      )}

      {/* 생성 모달 */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setNewTitle(''); }}
        title="새 마인드맵"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
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
              onClick={() => { setShowCreateModal(false); setNewTitle(''); }}
            >
              취소
            </button>
            <button type="submit" className="dashboard__btn dashboard__btn--primary">
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
          <span className="dashboard__delete-warn">이 작업은 되돌릴 수 없습니다.</span>
        </p>
        <div className="dashboard__modal-actions">
          <button
            className="dashboard__btn dashboard__btn--ghost"
            onClick={() => setShowDeleteModal(null)}
          >
            취소
          </button>
          <button className="dashboard__btn dashboard__btn--danger" onClick={handleDelete}>
            삭제
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Dashboard;
