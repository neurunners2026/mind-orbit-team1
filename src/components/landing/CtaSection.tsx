import { CTAButton } from './CTAButton'

type CtaSectionProps = {
  onLoginClick: () => void
}

export function CtaSection({ onLoginClick }: CtaSectionProps) {
  return (
    <section
      id="cta"
      className="scroll-mt-24 border-t border-white/[0.06] py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="reveal-on-scroll neon-hover-card relative overflow-hidden rounded-3xl border border-orbit-border bg-orbit-surface px-8 py-14 text-center shadow-2xl shadow-black/40 md:px-16 md:py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            aria-hidden
          >
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-orbit-accent/30 blur-3xl" />
            <div className="absolute -bottom-16 left-10 h-56 w-56 rounded-full bg-orbit-accent/25 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-2xl">
            <p className="reveal-on-scroll text-xs font-semibold uppercase tracking-[0.2em] text-orbit-muted">
              Mind Orbit
            </p>
            <h2 className="reveal-on-scroll mt-4 text-2xl font-semibold tracking-tight text-zinc-100 [--reveal-delay:90ms]">
              생각이 흩어지기 전에 Mind Orbit을 경험해보세요
            </h2>
            <div className="reveal-on-scroll mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row [--reveal-delay:150ms]">
              <CTAButton onClick={onLoginClick}>지금 바로 사용해보기</CTAButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
