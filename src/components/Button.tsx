import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'success' | 'danger' | 'neutral' | 'gold'

const VARIANTS: Record<Variant, { bg: string; shadow: string }> = {
  primary: { bg: 'bg-brand-600 hover:bg-brand-500', shadow: '#5b21b6' },
  success: { bg: 'bg-green-500 hover:bg-green-400', shadow: '#15803d' },
  danger: { bg: 'bg-red-500 hover:bg-red-400', shadow: '#b91c1c' },
  neutral: { bg: 'bg-ink-300 hover:bg-ink-300', shadow: '#64748b' },
  gold: { bg: 'bg-amber-400 hover:bg-amber-300 text-amber-950', shadow: '#b45309' },
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

export function Button({ variant = 'primary', children, className = '', ...rest }: Props) {
  const v = VARIANTS[variant]
  return (
    <button
      className={`btn-3d ${v.bg} ${className}`}
      style={{ '--btn-shadow': v.shadow } as React.CSSProperties}
      {...rest}
    >
      {children}
    </button>
  )
}
