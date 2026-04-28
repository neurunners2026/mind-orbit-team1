import { type ReactNode, useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
  /** 전달 시 제목을 클릭하면 인라인 편집 모드로 진입 */
  onTitleChange?: (newTitle: string) => void;
}

function Header({
  title,
  showBack = false,
  rightAction = null,
  onTitleChange,
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditor = location.pathname.startsWith('/map/');

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitTitle = useCallback(() => {
    setIsEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== title) {
      onTitleChange?.(trimmed);
    }
  }, [editValue, title, onTitleChange]);

  const handleTitleClick = () => {
    if (!onTitleChange) return;
    setEditValue(title || '');
    setIsEditing(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      commitTitle();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  return (
    <header className={`header ${isEditor ? 'header--editor' : ''}`}>
      <div className="header__left">
        {showBack && (
          <button
            className="header__back-btn"
            onClick={() => navigate('/')}
            aria-label="대시보드로 돌아가기"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {isEditing ? (
          <input
            ref={inputRef}
            className="header__title-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={handleKeyDown}
            maxLength={50}
            autoComplete="off"
            spellCheck={false}
          />
        ) : (
          <h1
            className={`header__title ${onTitleChange ? 'header__title--editable' : ''}`}
            onClick={handleTitleClick}
            title={onTitleChange ? '클릭하여 제목 편집' : undefined}
          >
            {title || 'Mind Orbit'}
          </h1>
        )}
      </div>
      {rightAction && <div className="header__right">{rightAction}</div>}
    </header>
  );
}

export default Header;
