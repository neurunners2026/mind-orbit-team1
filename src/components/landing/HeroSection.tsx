import { CTAButton } from './CTAButton'

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative scroll-mt-24 overflow-hidden border-b border-white/[0.06] pb-24 pt-16 md:pb-32 md:pt-24"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
      >
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-300/90">
            생각의 궤도를 정리하는 도구
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl md:leading-[1.08]">
            복잡한 아이디어를
            <span className="block bg-gradient-to-r from-violet-300 via-white to-indigo-200 bg-clip-text text-transparent">
              한눈에 연결하세요
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            Mind Orbit은 흩어진 메모와 회의록을 구조화된 맵으로 바꿔, 팀이 같은
            그림을 보며 빠르게 합의할 수 있도록 돕습니다.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <CTAButton to="/login">시작하기 (로그인)</CTAButton>
            <CTAButton href="#features" variant="secondary">
              기능 살펴보기
            </CTAButton>
          </div>
          <p className="mt-6 text-xs text-zinc-500">
            프런트엔드 UI 데모 · 실제 인증 서버는 포함되지 않습니다.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3">
          {[
            { label: '실시간 협업', value: '팀 보드' },
            { label: '구조화', value: '트리·그래프' },
            { label: '보내기', value: '공유 링크' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/[0.08] bg-orbit-surface/60 p-5 text-center shadow-lg shadow-black/20 backdrop-blur-sm"
            >
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                {item.label}
              </p>
              <p className="mt-2 text-lg font-semibold text-zinc-100">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
