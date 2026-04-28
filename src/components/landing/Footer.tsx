import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-orbit-bg py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div>
          <p className="text-sm font-semibold text-zinc-100">Mind Orbit</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500">
            생각의 조각을 연결하고, 팀이 같은 방향을 바라보게 하는 실험적인
            인터페이스입니다.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
          <div>
            <p className="font-medium text-zinc-300">제품</p>
            <ul className="mt-3 space-y-2 text-zinc-500">
              <li>
                <a className="transition-colors hover:text-zinc-200" href="#features">
                  기능
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-zinc-200" href="#target">
                  대상
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-zinc-300">계정</p>
            <ul className="mt-3 space-y-2 text-zinc-500">
              <li>
                <Link className="transition-colors hover:text-zinc-200" to="/login">
                  로그인
                </Link>
              </li>
              <li>
                <Link className="transition-colors hover:text-zinc-200" to="/signup">
                  회원가입
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-zinc-300">데모</p>
            <ul className="mt-3 space-y-2 text-zinc-500">
              <li>
                <Link className="transition-colors hover:text-zinc-200" to="/editor">
                  에디터 (보호)
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-6xl px-4 text-center text-xs text-zinc-600 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Mind Orbit demo. UI only.
      </p>
    </footer>
  )
}
