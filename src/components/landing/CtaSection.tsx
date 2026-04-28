import { CTAButton } from './CTAButton'

export function CtaSection() {
  return (
    <section
      id="cta"
      className="scroll-mt-24 border-t border-white/[0.06] py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-orbit-surface via-orbit-bg to-indigo-950/40 px-8 py-14 text-center shadow-2xl shadow-black/40 md:px-16 md:py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            aria-hidden
          >
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-violet-500/30 blur-3xl" />
            <div className="absolute -bottom-16 left-10 h-56 w-56 rounded-full bg-indigo-500/25 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200/90">
              Mind Orbit
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              지금 바로 궤도에 올라타 보세요
            </h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-300 sm:text-lg">
              로그인 후 에디터 예시 화면으로 이동합니다. 실제 데이터는 저장되지
              않는 UI 시연이에요.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <CTAButton to="/login">시작하기 (로그인)</CTAButton>
              <CTAButton href="#hero" variant="ghost" className="text-zinc-200">
                맨 위로
              </CTAButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
