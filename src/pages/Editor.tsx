import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { CTAButton } from '../components/landing/CTAButton'

/**
 * Placeholder for a future editor experience.
 * Routing only: no editor canvas implementation in this demo.
 */
export default function Editor() {
  const { logout } = useAuth()

  return (
    <div className="min-h-dvh bg-orbit-bg text-zinc-100">
      <header className="border-b border-orbit-border bg-orbit-surface/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="text-sm font-semibold tracking-tight text-zinc-100 hover:text-white"
          >
            ← Mind Orbit
          </Link>
          <CTAButton type="button" variant="secondary" onClick={logout} className="px-4 py-2 text-xs">
            로그아웃
          </CTAButton>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/90">
          Protected
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">에디터 영역</h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-400">
          이 경로는 데모 세션이 있을 때만 열립니다. 실제 마인드맵 편집 UI는 이
          프로젝트 범위에 포함하지 않았습니다.
        </p>
        <div className="mt-10 rounded-2xl border border-dashed border-orbit-border bg-orbit-surface/40 p-10 text-center text-sm text-zinc-500">
          여기에 에디터 캔버스가 올 자리입니다.
        </div>
        <div className="mt-8">
          <Link
            to="/"
            className="text-sm font-medium text-violet-300 hover:text-violet-200"
          >
            랜딩으로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  )
}
