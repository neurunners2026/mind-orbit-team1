import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import {
  getAllMindmaps,
  createMindmap,
  deleteMindmap,
  updateMindmapTitle,
  toggleFavorite,
  duplicateMindmap,
  getAllNodeCounts,
  subscribeSync,
} from '../utils/db';
import type { Mindmap, SyncMessage } from '../types/mindmap';
import './Dashboard.css';

// ── 타입 ──────────────────────────────────────────────────
type SortBy = 'latest' | 'name' | 'favorites';
type ViewMode = 'card' | 'list';

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

const DotsVerticalSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="12" cy="19" r="1.5" />
  </svg>
);

const SearchSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const GridSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const ListSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M8 6h13M8 12h13M8 18h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="3.5" cy="6" r="1" fill="currentColor" />
    <circle cx="3.5" cy="12" r="1" fill="currentColor" />
    <circle cx="3.5" cy="18" r="1" fill="currentColor" />
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

/** 마인드맵 썸네일 플레이스홀더 */
const MindmapThumbnail = () => (
  <svg
    className="dashboard__thumb-svg"
    viewBox="0 0 200 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 중앙 노드 */}
    <rect x="76" y="46" width="48" height="28" rx="14" fill="#6c5ce7" opacity="0.9" />
    {/* 왼쪽 가지 */}
    <line x1="76" y1="56" x2="46" y2="36" stroke="#6c5ce7" strokeWidth="1.5" opacity="0.5" />
    <rect x="14" y="26" width="32" height="20" rx="10" fill="#6c5ce7" opacity="0.45" />
    <line x1="76" y1="64" x2="46" y2="84" stroke="#6c5ce7" strokeWidth="1.5" opacity="0.5" />
    <rect x="14" y="74" width="32" height="20" rx="10" fill="#6c5ce7" opacity="0.45" />
    {/* 오른쪽 가지 */}
    <line x1="124" y1="56" x2="154" y2="36" stroke="#6c5ce7" strokeWidth="1.5" opacity="0.5" />
    <rect x="154" y="26" width="32" height="20" rx="10" fill="#6c5ce7" opacity="0.45" />
    <line x1="124" y1="64" x2="154" y2="84" stroke="#6c5ce7" strokeWidth="1.5" opacity="0.5" />
    <rect x="154" y="74" width="32" height="20" rx="10" fill="#6c5ce7" opacity="0.45" />
    {/* 중앙 노드 안 점 (장식) */}
    <circle cx="92" cy="60" r="3" fill="white" opacity="0.4" />
    <circle cx="100" cy="60" r="3" fill="white" opacity="0.4" />
    <circle cx="108" cy="60" r="3" fill="white" opacity="0.4" />
  </svg>
);

// ── Dashboard 컴포넌트 ─────────────────────────────────────
function Dashboard() {
  const navigate = useNavigate();

  // 데이터
  const [mindmaps, setMindmaps] = useState<Mindmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [nodeCounts, setNodeCounts] = useState<Record<string, number>>({});

  // 검색 / 정렬 / 보기
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('latest');
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  // 3점 메뉴
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // 모달
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  // 제목 인라인 편집
  const [editingMapId, setEditingMapId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  // 토스트
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── 파생 값 ──────────────────────────────────────────────
  const filteredMaps = useMemo(() => {
    let maps = [...mindmaps];

    if (sortBy === 'favorites') {
      maps = maps.filter((m) => m.isFavorite);
    } else if (sortBy === 'name') {
      maps.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    }
    // 'latest'는 DB에서 이미 updatedAt desc 정렬

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      maps = maps.filter((m) => m.title.toLowerCase().includes(q));
    }

    return maps;
  }, [mindmaps, sortBy, searchQuery]);

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

  useEffect(() => {
    loadMindmaps();
  }, [loadMindmaps]);

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

  // ── 제목 인라인 편집 ──────────────────────────────────────
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

  const startEditing = (map: Mindmap) => {
    setActiveMenuId(null);
    setEditingMapId(map.id);
    setEditingTitle(map.title);
  };

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

  // ── 복제 ──────────────────────────────────────────────────
  const handleDuplicate = async (mapId: string) => {
    setActiveMenuId(null);
    try {
      await duplicateMindmap(mapId);
      loadMindmaps();
      showToast('복제되었습니다');
    } catch (err) {
      console.error('복제 실패:', err);
    }
  };

  // ── 공유하기 ──────────────────────────────────────────────
  const handleShare = (mapId: string) => {
    setActiveMenuId(null);
    const url = `${window.location.origin}/map/${mapId}`;
    navigator.clipboard.writeText(url).then(() => {
      showToast('링크가 복사되었습니다');
    }).catch(() => {
      showToast('링크 복사에 실패했습니다');
    });
  };

  // ── 토스트 ────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2200);
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

  // ── 카드 뷰 아이템 ────────────────────────────────────────
  const renderCardItem = (map: Mindmap) => (
    <div
      key={map.id}
      className="dashboard__card-item"
    >
      {/* 썸네일 영역 */}
      <div
        className="dashboard__thumb"
        onClick={() => navigate(`/map/${map.id}`)}
      >
        <MindmapThumbnail />
        {/* 별 아이콘 (썸네일 우상단) */}
        <button
          className={`dashboard__card-star${map.isFavorite ? ' dashboard__card-star--active' : ''}`}
          onClick={(e) => handleToggleFavorite(e, map)}
          aria-label={map.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        >
          <StarSVG filled={!!map.isFavorite} />
        </button>
      </div>

      {/* 카드 정보 영역 */}
      <div className="dashboard__card-info">
        <div className="dashboard__card-info-top">
          {/* 제목 (편집 or 표시) */}
          {editingMapId === map.id ? (
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
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <button
              className="dashboard__card-title"
              onClick={() => navigate(`/map/${map.id}`)}
            >
              {map.title}
            </button>
          )}

          {/* 3점 메뉴 버튼 */}
          <div className="dashboard__menu-wrap">
            <button
              className="dashboard__dots-btn"
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuId(activeMenuId === map.id ? null : map.id);
              }}
              aria-label="더 보기"
            >
              <DotsVerticalSVG />
            </button>
            {activeMenuId === map.id && (
              <div className="dashboard__dropdown">
                <button className="dashboard__dropdown-item" onClick={() => handleShare(map.id)}>
                  공유하기
                </button>
                <button className="dashboard__dropdown-item" onClick={() => startEditing(map)}>
                  제목 수정
                </button>
                <button className="dashboard__dropdown-item" onClick={() => handleDuplicate(map.id)}>
                  복제
                </button>
                <button
                  className="dashboard__dropdown-item dashboard__dropdown-item--danger"
                  onClick={() => { setActiveMenuId(null); setShowDeleteModal(map.id); }}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 하단 메타 (날짜 + 노드 수) */}
        <div className="dashboard__card-meta">
          <span className="dashboard__card-date">{formatDate(map.updatedAt)}</span>
          <span className="dashboard__card-nodes">
            <NodeSVG />
            {nodeCounts[map.id] ?? 0}
          </span>
        </div>
      </div>
    </div>
  );

  // ── 목차형 아이템 ─────────────────────────────────────────
  const renderListItem = (map: Mindmap) => (
    <li key={map.id} className="dashboard__list-item">
      {/* 썸네일 (소형) */}
      <div
        className="dashboard__list-thumb"
        onClick={() => navigate(`/map/${map.id}`)}
      >
        <MindmapThumbnail />
      </div>

      {/* 본문 */}
      <div className="dashboard__list-body" onClick={() => navigate(`/map/${map.id}`)}>
        {editingMapId === map.id ? (
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
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="dashboard__list-title">{map.title}</span>
        )}
        <div className="dashboard__card-meta">
          <span className="dashboard__card-date">{formatDate(map.updatedAt)}</span>
          <span className="dashboard__card-nodes">
            <NodeSVG />
            {nodeCounts[map.id] ?? 0}
          </span>
        </div>
      </div>

      {/* 우측 액션 */}
      <div className="dashboard__list-actions">
        <button
          className={`dashboard__list-star${map.isFavorite ? ' dashboard__card-star--active' : ''}`}
          onClick={(e) => handleToggleFavorite(e, map)}
          aria-label={map.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
        >
          <StarSVG filled={!!map.isFavorite} />
        </button>
        <div className="dashboard__menu-wrap">
          <button
            className="dashboard__dots-btn"
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenuId(activeMenuId === map.id ? null : map.id);
            }}
            aria-label="더 보기"
          >
            <DotsVerticalSVG />
          </button>
          {activeMenuId === map.id && (
            <div className="dashboard__dropdown dashboard__dropdown--left">
              <button className="dashboard__dropdown-item" onClick={() => handleShare(map.id)}>
                공유하기
              </button>
              <button className="dashboard__dropdown-item" onClick={() => startEditing(map)}>
                제목 수정
              </button>
              <button className="dashboard__dropdown-item" onClick={() => handleDuplicate(map.id)}>
                복제
              </button>
              <button
                className="dashboard__dropdown-item dashboard__dropdown-item--danger"
                onClick={() => { setActiveMenuId(null); setShowDeleteModal(map.id); }}
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );

  // ── 렌더 ──────────────────────────────────────────────────
  return (
    <div className="dashboard" onClick={() => setActiveMenuId(null)}>
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
        {/* 검색 바 */}
        <div className="dashboard__search-wrap">
          <span className="dashboard__search-icon"><SearchSVG /></span>
          <input
            className="dashboard__search"
            type="search"
            placeholder="마인드맵 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="dashboard__search-clear"
              onClick={() => setSearchQuery('')}
              aria-label="검색어 지우기"
            >
              ×
            </button>
          )}
        </div>

        {/* 툴바: 섹션 레이블 + 정렬 + 보기모드 */}
        <div className="dashboard__toolbar">
          <div className="dashboard__section-label">
            <span>모든 마인드맵</span>
            <span className="dashboard__count-badge">{mindmaps.length}</span>
          </div>

          <div className="dashboard__toolbar-right">
            {/* 정렬 */}
            <div className="dashboard__sort-btns">
              {([
                ['latest', '최신순'],
                ['name', '이름순'],
                ['favorites', '즐겨찾기'],
              ] as [SortBy, string][]).map(([key, label]) => (
                <button
                  key={key}
                  className={`dashboard__sort-btn${sortBy === key ? ' dashboard__sort-btn--active' : ''}`}
                  onClick={() => setSortBy(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* 보기 모드 */}
            <div className="dashboard__view-toggle">
              <button
                className={`dashboard__view-btn${viewMode === 'card' ? ' dashboard__view-btn--active' : ''}`}
                onClick={() => setViewMode('card')}
                aria-label="카드형 보기"
              >
                <GridSVG />
              </button>
              <button
                className={`dashboard__view-btn${viewMode === 'list' ? ' dashboard__view-btn--active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="목차형 보기"
              >
                <ListSVG />
              </button>
            </div>
          </div>
        </div>

        {/* 콘텐츠 */}
        {loading ? (
          <div className="dashboard__loading">
            <div className="dashboard__spinner" />
          </div>
        ) : filteredMaps.length === 0 ? (
          <EmptyState
            icon={
              searchQuery ? (
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="var(--color-border)" strokeWidth="1.5" />
                  <path d="M16.5 16.5L21 21" stroke="var(--color-border)" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : sortBy === 'favorites' ? (
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    stroke="var(--color-border)"
                    strokeWidth="1.2"
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
              searchQuery
                ? `"${searchQuery}" 검색 결과가 없어요`
                : sortBy === 'favorites'
                ? '즐겨찾기한 마인드맵이 없어요'
                : '아직 마인드맵이 없어요'
            }
            description={
              searchQuery
                ? '다른 검색어를 입력해보세요.'
                : sortBy === 'favorites'
                ? '별 아이콘을 눌러 즐겨찾기에 추가해보세요.'
                : '첫 번째 마인드맵을 만들어 생각을 정리해보세요.'
            }
            action={
              !searchQuery && sortBy !== 'favorites' ? (
                <button
                  className="dashboard__create-btn dashboard__create-btn--large"
                  onClick={() => setShowCreateModal(true)}
                >
                  + 새 마인드맵 만들기
                </button>
              ) : null
            }
          />
        ) : viewMode === 'card' ? (
          <div className="dashboard__grid">
            {filteredMaps.map(renderCardItem)}
          </div>
        ) : (
          <ul className="dashboard__list">
            {filteredMaps.map(renderListItem)}
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

      {/* 토스트 */}
      {toast && (
        <div className="dashboard__toast">{toast}</div>
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
