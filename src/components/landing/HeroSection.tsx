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
        <div className="hero-float-orb absolute -left-32 top-0 h-72 w-72 rounded-full bg-orbit-accent/25 blur-3xl" />
        <div className="hero-float-orb absolute right-0 top-24 h-96 w-96 rounded-full bg-orbit-accent/20 blur-3xl [animation-delay:1.2s]" />
        <div className="hero-float-orb absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-orbit-accent/10 blur-3xl [animation-delay:2.4s]" />
        <span className="hero-float-particle absolute left-[16%] top-[22%] h-2 w-2 rounded-full bg-orbit-accent/80 [--particle-duration:9s]" />
        <span className="hero-float-particle absolute left-[72%] top-[18%] h-1.5 w-1.5 rounded-full bg-orbit-accent/70 [--particle-duration:11s]" />
        <span className="hero-float-particle absolute left-[63%] top-[68%] h-2 w-2 rounded-full bg-orbit-accent/70 [--particle-duration:13s]" />
        <span className="hero-float-particle absolute left-[28%] top-[74%] h-1.5 w-1.5 rounded-full bg-orbit-accent/70 [--particle-duration:10s]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="reveal-on-scroll text-4xl font-semibold leading-tight tracking-tight text-zinc-100">
            복잡한 아이디어를
            <span className="block text-orbit-accent">
              한눈에 연결하세요
            </span>
          </h1>
          <div className="reveal-on-scroll mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 [--reveal-delay:120ms]">
            <CTAButton onClick={onLoginClick}>지금 바로 사용해보기</CTAButton>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-lg reveal-on-scroll [--reveal-delay:180ms]">
          <p className="mb-5 text-center text-sm font-medium text-orbit-muted">
            혹시 이런 적 있나요?
          </p>
          <ul className="space-y-3">
            {[
              '메모는 했는데 어디 있는지 모르겠다',
              '정리하려다 오히려 멈춘 적 있다',
              '아이디어는 많은데 연결이 안 된다',
              '쓰려고 보면 머릿속이 다시 복잡해진다',
            ].map((text, index) => (
              <li
                key={text}
                className="reveal-on-scroll neon-hover-card flex items-center gap-3 rounded-xl border border-orbit-border bg-orbit-surface/50 px-5 py-4 text-sm text-orbit-muted backdrop-blur-sm hover:bg-orbit-surface-hover"
                style={{ ['--reveal-delay' as string]: `${220 + index * 70}ms` }}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orbit-accent" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
