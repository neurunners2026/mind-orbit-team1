import { type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightAction?: ReactNode;
}

function Header({ title, showBack = false, rightAction = null }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isEditor = location.pathname.startsWith('/map/');

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
        <h1 className="header__title">{title || 'Mind Orbit'}</h1>
      </div>
      {rightAction && <div className="header__right">{rightAction}</div>}
    </header>
  );
}

export default Header;
