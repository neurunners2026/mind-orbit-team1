import { CTAButton } from './CTAButton'

type HeroSectionProps = {
  onLoginClick: () => void
}

export function HeroSection({ onLoginClick: _onLoginClick }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative scroll-mt-24 overflow-hidden border-b border-white/[0.06] pb-24 pt-16 md:pb-32 md:pt-24"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
      >
        <div className="hero-float-orb absolute -left-32 top-0 h-72 w-72 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="hero-float-orb absolute right-0 top-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl [animation-delay:1.2s]" />
        <div className="hero-float-orb absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl [animation-delay:2.4s]" />
        <span className="hero-float-particle absolute left-[16%] top-[22%] h-2 w-2 rounded-full bg-violet-300/80 [--particle-duration:9s]" />
        <span className="hero-float-particle absolute left-[72%] top-[18%] h-1.5 w-1.5 rounded-full bg-indigo-300/70 [--particle-duration:11s]" />
        <span className="hero-float-particle absolute left-[63%] top-[68%] h-2 w-2 rounded-full bg-fuchsia-300/70 [--particle-duration:13s]" />
        <span className="hero-float-particle absolute left-[28%] top-[74%] h-1.5 w-1.5 rounded-full bg-violet-200/70 [--particle-duration:10s]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="reveal-on-scroll text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl md:leading-[1.1]">
            생각은 많은데,
            <span className="block bg-gradient-to-r from-violet-300 via-white to-indigo-200 bg-clip-text text-transparent">
              정리할 도구가 없었다
            </span>
          </h1>

          <p className="reveal-on-scroll mt-6 text-base leading-relaxed text-zinc-400 sm:text-lg [--reveal-delay:80ms]">
            메모 앱으로는 부족하고, 협업 툴은 너무 무거운.
            <br className="hidden sm:block" />
            Mind Orbit은 그 사이를 채웁니다.
          </p>

          <div className="reveal-on-scroll mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 [--reveal-delay:140ms]">
            <CTAButton to="/dashboard">베타 버전 써보기 →</CTAButton>
            <CTAButton variant="secondary" href="#problem">둘러보기</CTAButton>
          </div>
        </div>

        <div className="reveal-on-scroll mx-auto mt-16 max-w-sm [--reveal-delay:200ms]">
          <div className="rounded-2xl border border-white/[0.08] bg-orbit-surface/40 p-2 shadow-2xl shadow-violet-900/20 backdrop-blur-sm">
            <img
              src=""
              alt="Mind Orbit 앱 화면 미리보기"
              className="mockup-img w-full rounded-xl bg-orbit-surface/60 object-cover"
              style={{ minHeight: '220px' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
