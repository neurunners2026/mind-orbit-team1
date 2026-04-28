import { Link } from 'react-router-dom'
import { CTAButton } from './CTAButton'

type NavbarProps = {
  /** When false, hides in-page anchor links (e.g. on auth pages). */
  showSectionNav?: boolean
}

const navItemClass =
  'rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100'

export function Navbar({ showSectionNav = true }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-orbit-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-100"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orbit-accent to-indigo-400 text-xs font-bold text-white shadow-md shadow-orbit-accent/30"
            aria-hidden
          >
            MO
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
          <span className="hidden text-sm text-zinc-500 md:inline">
            계정
          </span>
        )}

        <div className="flex items-center gap-2">
          <CTAButton to="/login" variant="secondary" className="px-4 py-2 text-xs sm:text-sm">
            로그인
          </CTAButton>
        </div>
      </div>
    </header>
  )
}
