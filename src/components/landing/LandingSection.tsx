type LandingSectionProps = {
  id?: string
  eyebrow?: string
  title: string
  description?: string
  align?: 'center' | 'left'
  className?: string
  children?: React.ReactNode
}

export function LandingSection({
  id,
  eyebrow,
  title,
  description,
  align = 'center',
  className = '',
  children,
}: LandingSectionProps) {
  const headerAlign =
    align === 'center'
      ? 'mx-auto max-w-2xl text-center md:max-w-3xl'
      : 'max-w-2xl md:max-w-3xl'

  return (
    <section
      id={id}
      className={`scroll-mt-24 border-t border-white/[0.04] py-20 md:py-28 ${className}`.trim()}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className={headerAlign}>
          {eyebrow ? (
            <p className="reveal-on-scroll text-xs font-semibold uppercase tracking-[0.2em] text-orbit-muted">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="reveal-on-scroll mt-3 text-2xl font-semibold tracking-tight text-zinc-100 [--reveal-delay:80ms]">
            {title}
          </h2>
          {description ? (
            <p className="reveal-on-scroll mt-4 text-sm leading-relaxed text-orbit-muted [--reveal-delay:140ms]">
              {description}
            </p>
          ) : null}
        </div>
        {children ? (
          <div
            className={
              align === 'center'
                ? 'reveal-on-scroll mt-14 md:mt-20 [--reveal-delay:180ms]'
                : 'reveal-on-scroll mt-12 md:mt-16 [--reveal-delay:180ms]'
            }
          >
            {children}
          </div>
        ) : null}
      </div>
    </section>
  )
}
