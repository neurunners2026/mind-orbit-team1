import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-orbit-bg py-14">
      <div className="reveal-on-scroll mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="reveal-on-scroll [--reveal-delay:60ms]">
          <p className="text-sm font-semibold text-zinc-100">Mind Orbit</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500">
            생각의 조각을 연결하고, 팀이 같은 방향을 바라보게 하는 실험적인
            인터페이스입니다.
          </p>
        </div>
        <div className="reveal-on-scroll grid grid-cols-2 gap-10 text-sm sm:grid-cols-3 [--reveal-delay:130ms]">
          <div className="reveal-on-scroll [--reveal-delay:180ms]">
            <p className="font-medium text-zinc-300">제품</p>
            <ul className="mt-3 space-y-2 text-zinc-500">
              <li>
                <a className="neon-hover-link inline-flex rounded-md px-2 py-1 transition-all duration-200 hover:text-zinc-200" href="#features">
                  기능
                </a>
              </li>
              <li>
                <a className="neon-hover-link inline-flex rounded-md px-2 py-1 transition-all duration-200 hover:text-zinc-200" href="#target">
                  대상
                </a>
              </li>
            </ul>
          </div>
          <div className="reveal-on-scroll [--reveal-delay:240ms]">
            <p className="font-medium text-zinc-300">계정</p>
            <ul className="mt-3 space-y-2 text-zinc-500">
              <li>
                <Link className="neon-hover-link inline-flex rounded-md px-2 py-1 transition-all duration-200 hover:text-zinc-200" to="/login">
                  로그인
                </Link>
              </li>
              <li>
                <Link className="neon-hover-link inline-flex rounded-md px-2 py-1 transition-all duration-200 hover:text-zinc-200" to="/signup">
                  회원가입
                </Link>
              </li>
            </ul>
          </div>
          <div className="reveal-on-scroll [--reveal-delay:300ms]">
            <p className="font-medium text-zinc-300">데모</p>
            <ul className="mt-3 space-y-2 text-zinc-500">
              <li>
                <Link className="neon-hover-link inline-flex rounded-md px-2 py-1 transition-all duration-200 hover:text-zinc-200" to="/editor">
                  에디터 (보호)
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <p className="reveal-on-scroll mx-auto mt-12 max-w-6xl px-4 text-center text-xs text-zinc-600 sm:px-6 lg:px-8 [--reveal-delay:220ms]">
        © {new Date().getFullYear()} Mind Orbit demo. UI only.
      </p>
    </footer>
  )
}
