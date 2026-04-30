import { Link } from 'react-router-dom'

type CTAButtonVariant = 'primary' | 'secondary' | 'ghost'

type CTAButtonProps = {
  children: React.ReactNode
  to?: string
  href?: string
  type?: 'button' | 'submit'
  variant?: CTAButtonVariant
  className?: string
  onClick?: () => void
}

const base =
  'neon-hover-button inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-tight transition-all duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orbit-accent'

const variants: Record<CTAButtonVariant, string> = {
  primary:
    'border border-orbit-border bg-orbit-accent text-white shadow-lg shadow-orbit-accent/25 hover:border-orbit-accent hover:bg-orbit-accent-hover',
  secondary:
    'border border-orbit-border bg-orbit-surface text-zinc-100 hover:border-orbit-accent hover:bg-orbit-surface-hover',
  ghost:
    'text-orbit-muted hover:bg-orbit-surface-hover hover:text-zinc-100',
}

export function CTAButton({
  children,
  to,
  href,
  type = 'button',
  variant = 'primary',
  className = '',
  onClick,
}: CTAButtonProps) {
  const styles = `${base} ${variants[variant]} ${className}`.trim()

  if (to) {
    return (
      <Link to={to} className={styles}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={styles}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} onClick={onClick} className={styles}>
      {children}
    </button>
  )
}