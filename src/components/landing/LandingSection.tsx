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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-300/90">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl md:text-[2.35rem] md:leading-snug">
            {title}
          </h2>
          {description ? (
            <p className="mt-4 text-base leading-relaxed text-zinc-400 sm:text-lg">
              {description}
            </p>
          ) : null}
        </div>
        {children ? (
          <div
            className={
              align === 'center' ? 'mt-14 md:mt-20' : 'mt-12 md:mt-16'
            }
          >
            {children}
          </div>
        ) : null}
      </div>
    </section>
  )
}
