import { cn } from '../../utils/cn'

const colorMap = {
  success: 'border border-success/30 bg-gradient-to-br from-success/15 to-success/5 text-success shadow-[0_2px_8px_rgba(16,185,129,0.1)]',
  warning: 'border border-warning/30 bg-gradient-to-br from-warning/15 to-warning/5 text-warning shadow-[0_2px_8px_rgba(245,158,11,0.1)]',
  danger: 'border border-danger/30 bg-gradient-to-br from-danger/15 to-danger/5 text-danger shadow-[0_2px_8px_rgba(239,68,68,0.1)]',
  primary: 'border border-primary/30 bg-gradient-to-br from-primary/12 to-primary/5 text-primary shadow-[0_2px_8px_rgba(27,67,50,0.08)]',
  accent: 'border border-accent/30 bg-gradient-to-br from-accent/15 to-accent/5 text-accent-warm shadow-[0_2px_8px_rgba(244,162,97,0.1)]',
  muted: 'border border-border bg-gradient-to-br from-surface to-border/30 text-text-muted',
}

export default function Badge({ children, color = 'primary', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-xl px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap',
        colorMap[color] || colorMap.primary,
        className,
      )}
    >
      {children}
    </span>
  )
}
