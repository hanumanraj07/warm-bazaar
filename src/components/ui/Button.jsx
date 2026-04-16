import { forwardRef } from 'react'
import { cn } from '../../utils/cn'

const variants = {
  primary: 'bg-gradient-to-br from-primary to-primary-light text-white shadow-[0_4px_16px_rgba(27,67,50,0.25)] hover:shadow-[0_8px_24px_rgba(27,67,50,0.3)] hover:from-primary-light hover:to-primary focus-visible:ring-primary/30',
  secondary: 'border border-border/80 bg-gradient-to-br from-white to-surface-card text-text-primary hover:shadow-[0_4px_16px_rgba(27,67,50,0.1)] focus-visible:ring-primary/15',
  accent: 'bg-gradient-to-br from-accent to-accent-warm text-surface-dark shadow-[0_4px_16px_rgba(244,162,97,0.3)] hover:shadow-[0_8px_24px_rgba(244,162,97,0.4)] hover:brightness-105 focus-visible:ring-accent/35',
  success: 'bg-gradient-to-br from-success to-emerald-600 text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.4)] hover:brightness-105 focus-visible:ring-success/35',
  danger: 'bg-gradient-to-br from-danger to-rose-600 text-white shadow-[0_4px_16px_rgba(239,68,68,0.3)] hover:shadow-[0_8px_24px_rgba(239,68,68,0.4)] hover:brightness-105 focus-visible:ring-danger/35',
  ghost: 'bg-transparent text-text-primary hover:bg-surface/80 focus-visible:ring-primary/15',
}

const sizes = {
  sm: 'min-h-[44px] rounded-xl px-3.5 text-sm',
  md: 'min-h-[48px] rounded-2xl px-4 text-sm',
  lg: 'min-h-[56px] rounded-2xl px-6 text-base font-semibold',
}

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className,
      )}
      {...props}
    />
  )
})

export default Button
