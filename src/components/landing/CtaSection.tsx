import { CTAButton } from './CTAButton'

export function CtaSection() {
  return (
    <section
      id="cta"
      className="scroll-mt-24 border-t border-white/[0.06] py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal-on-scroll neon-hover-card relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-orbit-surface via-orbit-bg to-indigo-950/40 px-8 py-14 text-center shadow-2xl shadow-black/40 md:px-16 md:py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            aria-hidden
          >
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-violet-500/30 blur-3xl" />
            <div className="absolute -bottom-16 left-10 h-56 w-56 rounded-full bg-indigo-500/25 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-2xl">
            <h2 className="reveal-on-scroll text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              생각이 흩어지기 전에
            </h2>
            <p className="reveal-on-scroll mt-4 text-base leading-relaxed text-zinc-400 [--reveal-delay:80ms]">
              지금은 베타 단계입니다. 먼저 써보고, 함께 만들어가요.
            </p>
            <div className="reveal-on-scroll mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row [--reveal-delay:140ms]">
              <CTAButton to="/dashboard">베타 버전 써보기 →</CTAButton>
              <CTAButton variant="secondary" href="#hero">둘러보기</CTAButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
