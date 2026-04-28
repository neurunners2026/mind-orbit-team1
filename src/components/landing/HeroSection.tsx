import { CTAButton } from './CTAButton'

type HeroSectionProps = {
  onLoginClick: () => void
}

export function HeroSection({ onLoginClick }: HeroSectionProps) {
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
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl md:leading-[1.08]">
            복잡한 아이디어를
            <span className="block bg-gradient-to-r from-violet-300 via-white to-indigo-200 bg-clip-text text-transparent">
              한눈에 연결하세요
            </span>
          </h1>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <CTAButton onClick={onLoginClick}>지금 바로 사용해보기</CTAButton>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-lg">
          <p className="mb-5 text-center text-sm font-medium text-zinc-500">
            혹시 이런 적 있나요?
          </p>
          <ul className="space-y-3">
            {[
              '메모는 했는데 어디 있는지 모르겠다',
              '정리하려다 오히려 멈춘 적 있다',
              '아이디어는 많은데 연결이 안 된다',
              '쓰려고 보면 머릿속이 다시 복잡해진다',
            ].map((text) => (
              <li
                key={text}
                className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-orbit-surface/50 px-5 py-4 text-sm text-zinc-300 backdrop-blur-sm"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
