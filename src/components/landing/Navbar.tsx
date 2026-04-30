import { Link, useNavigate } from 'react-router-dom'
import { CTAButton } from './CTAButton'
import { XIcon } from '../common/XIcon'

type NavbarProps = {
  /** When false, hides in-page anchor links (e.g. on auth pages). */
  showSectionNav?: boolean
  /** When true, shows an X button that navigates back to /. */
  showClose?: boolean
  /** Called when the 로그인 button is clicked (landing page only). */
  onLoginClick?: () => void
}

const navItemClass =
  'rounded-lg px-3 py-2 text-sm text-orbit-muted transition-all duration-200 hover:-translate-y-0.5 hover:bg-orbit-surface-hover hover:text-zinc-100'

export function Navbar({ showSectionNav = true, showClose = false, onLoginClick }: NavbarProps) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-orbit-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-100 transition-transform duration-200 hover:-translate-y-0.5"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-orbit-accent shadow-md shadow-orbit-accent/40"
            aria-hidden
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="2" fill="white" stroke="none" />
              <ellipse cx="12" cy="12" rx="10" ry="4" />
              <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
              <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
            </svg>
          </span>
          Mind Orbit
        </Link>

        {showSectionNav ? (
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="섹션 이동"
          >
            <a className={navItemClass} href="#hero">
              소개
            </a>
            <a className={navItemClass} href="#problem">
              문제
            </a>
            <a className={navItemClass} href="#features">
              기능
            </a>
            <a className={navItemClass} href="#target">
              대상
            </a>
            <a className={navItemClass} href="#cta">
              시작
            </a>
          </nav>
        ) : (
          <span className="hidden text-sm text-orbit-muted md:inline">
            계정
          </span>
        )}

        <div className="flex items-center gap-2">
          {showClose ? (
            <button
              onClick={() => navigate('/')}
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:text-zinc-100"
              aria-label="랜딩페이지로 돌아가기"
            >
              <XIcon />
            </button>
          ) : (
            <CTAButton
              variant="secondary"
              className="px-4 py-2 text-xs transition-all duration-200 ease-out hover:-translate-y-0.5 sm:text-sm"
              onClick={onLoginClick}
            >
              로그인
            </CTAButton>
          )}
        </div>
      </div>
    </header>
  )
}
