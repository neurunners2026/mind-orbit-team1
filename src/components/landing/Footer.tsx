import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-orbit-bg py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal-on-scroll flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          {/* Brand */}
          <div>
            <p className="text-sm font-semibold text-zinc-100">Mind Orbit</p>
            <p className="mt-2 text-sm text-zinc-500">
              가볍고 빠르고 아름다운 생각 구조화
            </p>
          </div>

          {/* Links */}
          <nav
            className="reveal-on-scroll flex flex-wrap gap-x-8 gap-y-4 text-sm [--reveal-delay:80ms]"
            aria-label="푸터 링크"
          >
            <a
              className="neon-hover-link text-zinc-400 transition-colors hover:text-zinc-200"
              href="#hero"
            >
              소개
            </a>
            <a
              className="neon-hover-link text-zinc-400 transition-colors hover:text-zinc-200"
              href="#solution"
            >
              기능
            </a>
            <a
              className="neon-hover-link text-zinc-400 transition-colors hover:text-zinc-200"
              href="#cta"
            >
              시작하기
            </a>
            <Link
              className="neon-hover-link text-zinc-400 transition-colors hover:text-zinc-200"
              to="/login"
            >
              로그인
            </Link>
          </nav>
        </div>

        <p className="reveal-on-scroll mt-12 text-center text-xs text-zinc-600 [--reveal-delay:120ms]">
          © 2026 Mind Orbit. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
